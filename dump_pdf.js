// Mostra as linhas de texto de um PDF como o app as lê (pdf.js + HL.pdfLines): node dump_pdf.js "arquivo.pdf"
require('./src/teste.js');
const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');
(async () => {
  const doc = await pdfjs.getDocument({ data: new Uint8Array(require('fs').readFileSync(process.argv[2])) }).promise;
  for (let i = 1; i <= doc.numPages; i++) {
    const tc = await (await doc.getPage(i)).getTextContent();
    console.log('=== página ' + i + ' (' + tc.items.length + ' itens)');
    HL.pdfLines(tc.items).forEach(l => console.log(l));
  }
})();
