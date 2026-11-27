// Gera out/index.html (página única, tudo embutido, funciona sem internet). Rodar: node build.js
const fs = require('fs'), path = require('path');
const R = f => fs.readFileSync(path.join(__dirname, f), 'utf8');
const safe = s => s.replace(/<\/script/gi, '<\\/script');
let html = R('shell.html');
const sub = (k, v) => { html = html.split(k).join(v); };
sub('@@CSS@@', R('src/ui.css'));
sub('@@PDFLIB@@', safe(R('node_modules/pdf-lib/dist/pdf-lib.min.js')));
// pdf.js (leitura das fichas em PDF); o worker roda na própria página
sub('@@PDFJS@@', safe(R('node_modules/pdfjs-dist/legacy/build/pdf.min.js')));
sub('@@PDFJSWORKER@@', safe(R('node_modules/pdfjs-dist/legacy/build/pdf.worker.min.js')));
sub('@@JS@@', safe(['calc.js', 'teste.js', 'report.js', 'docx.js', 'pdf.js', 'ui.js'].map(f => R('src/' + f)).join('\n')));
for (const [k, f] of [['IMG_SIDEBAR', 'sidebar'], ['IMG_STRIP', 'strip'], ['IMG_LOGO', 'logo'], ['IMG_BANNER', 'banner']])
  sub('@@' + k + '@@', 'data:image/webp;base64,' + fs.readFileSync(path.join(__dirname, 'assets', f + '.webp')).toString('base64'));
fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'out', 'index.html'), html);
// cópia para abrir com dois cliques na pasta de cima ("App Wilton")
fs.writeFileSync(path.join(__dirname, '..', 'Wilton Rocha - Laudos.html'), html);
console.log(html.length, 'bytes');
