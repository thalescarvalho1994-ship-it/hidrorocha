// Fichas em tabela TEMPO | ND | VAZÃO (teste de vazão máxima de outras empresas): node test_tabela.js "ficha.pdf" [...]
require('./src/calc.js'); require('./src/teste.js');
const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');
(async () => {
  for (const file of process.argv.slice(2)) {
    const doc = await pdfjs.getDocument({ data: new Uint8Array(require('fs').readFileSync(file)), verbosity: 0 }).promise;
    const pages = [];
    for (let i = 1; i <= doc.numPages; i++) pages.push((await (await doc.getPage(i)).getTextContent()).items);
    const f = HL.parseTabela(pages);
    console.log('==', require('path').basename(file));
    if (!f) { console.log('não reconhecida'); continue; }
    console.log(JSON.stringify(f.meta));
    const e = f.etapas[0];
    console.log('leituras', e.pts.length, 'NE', e.NE, 'ND', e.ND, 'Q', e.Q, 'tempo', e.tempo, 'primeiras', JSON.stringify(e.pts.slice(0, 4)), 'últimas', JSON.stringify(e.pts.slice(-3)));
    const a = HL.analisarTeste(f)[0];
    ['jacob', 'theis', 'hantush'].forEach(m => console.log(' ', m, a[m] && a[m].T ? 'T=' + a[m].T.toExponential(3) + ' erro=' + a[m].erro.toFixed(1) + '%' : (a.nota || '-')));
  }
})();
