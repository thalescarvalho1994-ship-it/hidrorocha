// Recorta as folhas de ícones do ChatGPT (grade 4×2) em ícones soltos com fundo transparente: node cortar_icones.js
// O fundo (preto, branco ou transparente) é removido por preenchimento a partir das bordas da célula, então o miolo
// claro ou escuro dos ícones, cercado pelo contorno dourado, fica intacto. A borda é suavizada e a cor do fundo descontada.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, 'assets', 'icones');
const FOLHAS = [
  ['folha-1.jpg', ['novo', 'importar', 'laudos', 'poco', 'gerar', 'dados', 'localizacao', 'geologia']],
  ['folha-2.webp', ['calculos', 'demanda', 'vulnerabilidade', 'qualidade', 'textos', 'apoio', 'config', 'concluido']]
];
const LADO = 160; // px do arquivo final (exibido a até 80 px)

function cortar(src, nomes, LADO) { // roda no navegador
  return new Promise(res => {
    const img = new Image();
    img.onload = () => {
      const W = img.naturalWidth, H = img.naturalHeight, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const cx = cv.getContext('2d'); cx.drawImage(img, 0, 0);
      const out = {};
      nomes.forEach((nome, k) => {
        const c0 = Math.round((k % 4) * W / 4), r0 = Math.round(Math.floor(k / 4) * H / 2), cw = Math.round(W / 4), ch = Math.round(H / 2);
        const d = cx.getImageData(c0, r0, cw, ch), p = d.data, n = cw * ch;
        const bg = [p[0], p[1], p[2]], bgA = p[3];
        const dist = i => bgA < 20 ? (p[i * 4 + 3] < 20 ? 0 : 255) : Math.max(Math.abs(p[i * 4] - bg[0]), Math.abs(p[i * 4 + 1] - bg[1]), Math.abs(p[i * 4 + 2] - bg[2]));
        // fundo = região ligada às bordas com cor próxima da do canto
        const isBg = new Uint8Array(n), st = [];
        for (let x = 0; x < cw; x++) st.push(x, (ch - 1) * cw + x);
        for (let y = 0; y < ch; y++) st.push(y * cw, y * cw + cw - 1);
        while (st.length) {
          const i = st.pop(); if (isBg[i] || dist(i) > 60) continue; isBg[i] = 1;
          const x = i % cw, y = (i / cw) | 0;
          if (x > 0) st.push(i - 1); if (x < cw - 1) st.push(i + 1); if (y > 0) st.push(i - cw); if (y < ch - 1) st.push(i + cw);
        }
        // pedaço pequeno de ícone vizinho que invadiu a célula pela borda: vira fundo (o próprio ícone, grande, fica)
        const borda = [];
        for (let x = 0; x < cw; x++) borda.push(x, (ch - 1) * cw + x);
        for (let y = 0; y < ch; y++) borda.push(y * cw, y * cw + cw - 1);
        const visto = new Uint8Array(n);
        borda.forEach(b0 => {
          if (isBg[b0] || visto[b0]) return;
          const comp = [], st2 = [b0];
          while (st2.length) {
            const i = st2.pop(); if (isBg[i] || visto[i]) continue; visto[i] = 1; comp.push(i);
            const x = i % cw, y = (i / cw) | 0;
            if (x > 0) st2.push(i - 1); if (x < cw - 1) st2.push(i + 1); if (y > 0) st2.push(i - cw); if (y < ch - 1) st2.push(i + cw);
          }
          if (comp.length < n * 0.03) comp.forEach(i => { isBg[i] = 2; p[i * 4 + 3] = 0; });
        });
        let x0 = cw, y0 = ch, x1 = 0, y1 = 0;
        for (let i = 0; i < n; i++) {
          const x = i % cw, y = (i / cw) | 0;
          if (isBg[i] === 1) { // borda suave: o quanto o pixel difere do fundo vira opacidade
            const a = bgA < 20 ? p[i * 4 + 3] / 255 : Math.min(1, Math.max(0, (dist(i) - 14) / 46));
            if (a > 0 && bgA >= 20) for (let c = 0; c < 3; c++) p[i * 4 + c] = Math.max(0, Math.min(255, (p[i * 4 + c] - (1 - a) * bg[c]) / a));
            p[i * 4 + 3] = Math.round(a * 255);
          }
          if (p[i * 4 + 3] > 40) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        }
        const t = document.createElement('canvas'); t.width = cw; t.height = ch; t.getContext('2d').putImageData(d, 0, 0);
        const s = Math.max(x1 - x0, y1 - y0) + 1, m = Math.round(s * 0.04), S = s + 2 * m;
        const o = document.createElement('canvas'); o.width = o.height = LADO;
        const ox = o.getContext('2d'); ox.imageSmoothingQuality = 'high';
        ox.drawImage(t, x0 - m - (s - (x1 - x0 + 1)) / 2, y0 - m - (s - (y1 - y0 + 1)) / 2, S, S, 0, 0, LADO, LADO);
        out[nome] = o.toDataURL('image/webp', 0.9);
      });
      res(out);
    };
    img.src = src;
  });
}

(async () => {
  const b = await chromium.launch({ channel: 'msedge' }), pg = await b.newPage();
  for (const [arq, nomes] of FOLHAS) {
    const ext = path.extname(arq).slice(1).replace('jpg', 'jpeg');
    const src = 'data:image/' + ext + ';base64,' + fs.readFileSync(path.join(DIR, arq)).toString('base64');
    const res = await pg.evaluate(new Function('a', 'return (' + cortar.toString() + ')(a[0], a[1], a[2])'), [src, nomes, LADO]);
    Object.entries(res).forEach(([nome, url]) => { fs.writeFileSync(path.join(DIR, nome + '.webp'), Buffer.from(url.split(',')[1], 'base64')); console.log(nome); });
  }
  await b.close();
})();
