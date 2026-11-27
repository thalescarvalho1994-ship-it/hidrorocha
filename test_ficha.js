// Lê uma ficha de teste em PDF e mostra o que o app extrai e calcula. Uso: node test_ficha.js "caminho.pdf"
require('./src/calc.js'); require('./src/teste.js');
const HL = globalThis.HL, fs = require('fs');
const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');
(async () => {
  const file = process.argv[2];
  const doc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(file)) }).promise;
  const pages = [];
  for (let i = 1; i <= doc.numPages; i++) pages.push(HL.pdfLines((await (await doc.getPage(i)).getTextContent()).items));
  if (process.argv[3] === '-l') console.log(pages[0].join('\n'));
  const f = HL.parseFicha(pages);
  console.log(JSON.stringify(f.meta));
  f.etapas.forEach(e => console.log('etapa', e.etapa, 'NE', e.NE, 'ND', e.ND, 'Q', e.Q, 'pts', e.pts.length, JSON.stringify(e.pts.slice(0, 3))));
  const a = HL.analisarTeste(f);
  a.forEach(x => console.log('etapa', x.etapa, 'dQ', x.dQ, ['jacob', 'theis', 'hantush'].map(m => x[m] ? m + ' T=' + (x[m].T ? x[m].T.toExponential(3) : '-') + ' erro=' + (x[m].erro !== undefined ? x[m].erro.toFixed(2) : '-') + (x[m].rB ? ' r/B=' + x[m].rB : '') + (x[m].nota ? ' (' + x[m].nota + ')' : '') : '').join(' | ')));
})().catch(e => { console.error(e); process.exit(1); });
