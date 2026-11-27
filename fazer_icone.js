// Gera o ícone do app a partir de assets/logo.webp: node fazer_icone.js
// Saídas: assets/app.ico (atalho da área de trabalho; PNGs de 16 a 256 px dentro do .ico) e assets/favicon.png (aba do navegador).
// Desenho: quadrado arredondado azul-marinho com a logo dourada centralizada, para destacar em qualquer papel de parede.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const A = f => path.join(__dirname, 'assets', f);
const TAM = [256, 64, 48, 32, 24, 16];

(async () => {
  const b = await chromium.launch({ channel: 'msedge' }), pg = await b.newPage();
  const src = 'data:image/webp;base64,' + fs.readFileSync(A('logo.webp')).toString('base64');
  const pngs = await pg.evaluate(([src, tams]) => new Promise(res => {
    const img = new Image();
    img.onload = () => res(tams.map(s => {
      const c = document.createElement('canvas'); c.width = c.height = s; const x = c.getContext('2d');
      const r = s * 0.2, g = x.createLinearGradient(0, 0, 0, s);
      g.addColorStop(0, '#164a78'); g.addColorStop(1, '#0a2238');
      x.fillStyle = g; x.beginPath(); x.roundRect(0, 0, s, s, r); x.fill();
      x.strokeStyle = 'rgba(232,189,106,.55)'; x.lineWidth = Math.max(1, s / 64); x.beginPath(); x.roundRect(x.lineWidth / 2, x.lineWidth / 2, s - x.lineWidth, s - x.lineWidth, r); x.stroke();
      const k = (s <= 24 ? 0.86 : 0.78) * s / Math.max(img.naturalWidth, img.naturalHeight), w = img.naturalWidth * k, h = img.naturalHeight * k;
      x.imageSmoothingQuality = 'high'; x.drawImage(img, (s - w) / 2, (s - h) / 2, w, h);
      return c.toDataURL('image/png').split(',')[1];
    }));
    img.src = src;
  }), [src, TAM]);
  await b.close();
  const bufs = pngs.map(p => Buffer.from(p, 'base64'));
  // .ico: cabeçalho + diretório + PNGs
  const head = Buffer.alloc(6 + 16 * bufs.length); head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(bufs.length, 4);
  let off = head.length;
  bufs.forEach((p, i) => {
    const e = 6 + 16 * i, s = TAM[i];
    head.writeUInt8(s >= 256 ? 0 : s, e); head.writeUInt8(s >= 256 ? 0 : s, e + 1); head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6);
    head.writeUInt32LE(p.length, e + 8); head.writeUInt32LE(off, e + 12); off += p.length;
  });
  fs.writeFileSync(A('app.ico'), Buffer.concat([head, ...bufs]));
  fs.writeFileSync(A('favicon.png'), bufs[1]);
  console.log('assets/app.ico e assets/favicon.png');
})();
