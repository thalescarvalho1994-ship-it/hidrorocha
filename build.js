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
// ícones ilustrados recortados por cortar_icones.js
const icones = {};
fs.readdirSync(path.join(__dirname, 'assets', 'icones')).filter(f => /^[a-z]+\.webp$/.test(f))
  .forEach(f => icones[f.replace('.webp', '')] = 'data:image/webp;base64,' + fs.readFileSync(path.join(__dirname, 'assets', 'icones', f)).toString('base64'));
sub('/*@@ICONES*/{}', JSON.stringify(icones));
for (const [k, f] of [['IMG_SIDEBAR', 'sidebar'], ['IMG_STRIP', 'strip'], ['IMG_LOGO', 'logo'], ['IMG_BANNER', 'banner']])
  sub('@@' + k + '@@', 'data:image/webp;base64,' + fs.readFileSync(path.join(__dirname, 'assets', f + '.webp')).toString('base64'));
sub('@@IMG_FAVICON@@', 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, 'assets', 'favicon.png')).toString('base64'));
fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'out', 'index.html'), html);
// cópia para abrir com dois cliques na pasta de cima ("App Wilton")
fs.writeFileSync(path.join(__dirname, '..', 'Wilton Rocha - Laudos.html'), html);
// pacote para enviar ao Wilton: app + ícone + instalador que cria o atalho com a logo na área de trabalho
const pac = path.join(__dirname, 'out', 'Instalar Wilton Rocha - Laudos');
fs.mkdirSync(pac, { recursive: true });
fs.writeFileSync(path.join(pac, 'Wilton Rocha - Laudos.html'), html);
fs.copyFileSync(path.join(__dirname, 'assets', 'app.ico'), path.join(pac, 'app.ico'));
['Instalar.bat', 'instalar.ps1'].forEach(f => fs.copyFileSync(path.join(__dirname, 'instalador', f), path.join(pac, f)));
const zip = path.join(__dirname, '..', 'Instalar Wilton Rocha - Laudos.zip');
require('child_process').execFileSync('powershell', ['-NoProfile', '-Command', `Compress-Archive -Path '${pac}' -DestinationPath '${zip}' -Force`]);
console.log(html.length, 'bytes; pacote:', zip);
