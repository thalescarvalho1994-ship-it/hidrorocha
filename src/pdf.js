/* HidroLaudo – gerador de PDF (pdf-lib + layout próprio, fontes padrão Times). */
(function (G) {
  const HL = G.HL = G.HL || {};

  async function buildPdf(blocks, PDFLib) {
    const { PDFDocument, StandardFonts, rgb } = PDFLib;
    const doc = await PDFDocument.create();
    const F = {
      r: await doc.embedFont(StandardFonts.TimesRoman), b: await doc.embedFont(StandardFonts.TimesRomanBold),
      i: await doc.embedFont(StandardFonts.TimesRomanItalic), bi: await doc.embedFont(StandardFonts.TimesRomanBoldItalic)
    };
    const PW = 595.28, PH = 841.89, ML = 85, MR = 70.9, MT = 70.9, MB = 70.9, TW = PW - ML - MR;
    const fontOf = (bold, italic) => F[bold ? (italic ? 'bi' : 'b') : (italic ? 'i' : 'r')];
    const clean = s => String(s).replace(/π/g, 'pi').replace(/α/g, 'alfa').replace(/[^ -ÿ–—‘’“”•…]/g, '?').replace(/ /g, ' ');
    let page = null, y = 0, pageNo = 0;
    const newPage = (cover) => { page = doc.addPage([PW, PH]); pageNo++; y = PH - MT; page._cover = !!cover; };
    newPage(true);
    const ensure = h => { if (y - h < MB) newPage(); };

    // tokens de uma linha de texto com ^{ } / _{ }
    function tokens(text, st) {
      const out = []; const re = /([\^_])\{([^}]*)\}/g; let last = 0, m;
      const push = (t, sup) => {
        clean(t).split(/(\s+)/).forEach(w => { if (w === '') return; out.push({ w, sup, bold: st.bold, italic: st.italic, size: st.size }); });
      };
      text = String(text);
      while ((m = re.exec(text))) { if (m.index > last) push(text.slice(last, m.index), 0); push(m[2], m[1] === '^' ? 1 : -1); last = re.lastIndex; }
      if (last < text.length) push(text.slice(last), 0);
      return out;
    }
    const tw = tk => { const sz = tk.sup ? tk.size * 0.65 : tk.size; return fontOf(tk.bold, tk.italic).widthOfTextAtSize(tk.w, sz); };
    function wrap(toks, width, firstIndent) {
      const lines = []; let cur = [], cw = 0, avail = width - (firstIndent || 0);
      toks.forEach(tk => {
        const w = tw(tk), isSp = /^\s+$/.test(tk.w);
        if (isSp && !cur.length) return;
        if (!isSp && cw + w > avail && cur.length) {
          while (cur.length && /^\s+$/.test(cur[cur.length - 1].w)) cur.pop();
          lines.push(cur); cur = []; cw = 0; avail = width;
        }
        cur.push(tk); cw += w;
      });
      while (cur.length && /^\s+$/.test(cur[cur.length - 1].w)) cur.pop();
      if (cur.length) lines.push(cur);
      return lines;
    }
    function drawLine(line, x, yy, width, align, justify) {
      let used = 0; line.forEach(tk => used += tw(tk));
      let gap = 0, sx = x;
      if (align === 'center') sx = x + (width - used) / 2;
      else if (align === 'right') sx = x + width - used;
      else if (justify) { const sp = line.filter(t => /^\s+$/.test(t.w)).length; if (sp) gap = (width - used) / sp; }
      line.forEach(tk => {
        const sz = tk.sup ? tk.size * 0.65 : tk.size, rise = tk.sup === 1 ? tk.size * 0.38 : tk.sup === -1 ? -tk.size * 0.15 : 0;
        const w = tw(tk);
        if (!/^\s+$/.test(tk.w)) page.drawText(tk.w, { x: sx, y: yy + rise, size: sz, font: fontOf(tk.bold, tk.italic), color: rgb(0, 0, 0) });
        sx += w + (/^\s+$/.test(tk.w) ? gap : 0);
      });
    }
    // parágrafo: retorna nada; quebra de página linha a linha
    function para(text, o = {}) {
      const size = o.size || 11, lead = o.lead || size * 1.32;
      const st = { bold: o.bold, italic: o.italic, size };
      const x = ML + (o.left || 0), width = TW - (o.left || 0);
      const lines = wrap(tokens(text, st), width, o.first || 0);
      if (o.before) y -= o.before;
      if (o.keepNext && y - lead * 3 < MB) newPage();
      lines.forEach((ln, i) => {
        ensure(lead);
        y -= lead * 0.8; // linha de base
        const ind = i === 0 ? (o.first || 0) : 0;
        drawLine(ln, x + ind, y, width - ind, o.align || 'left', o.align === 'both' && i < lines.length - 1);
        y -= lead * 0.2;
      });
      y -= (o.after === undefined ? 6 : o.after);
    }

    function table(b) {
      const n = b.head.length, widths = b.widths.map(w => w / 100 * TW), size = 9.5, lead = size * 1.25, pad = 3;
      const xs = [ML]; widths.forEach((w, i) => xs.push(xs[i] + w));
      const spanW = (c, cs) => xs[c + cs] - xs[c];
      const border = { borderColor: rgb(0.5, 0.5, 0.5), borderWidth: 0.5 };
      // texto centralizado na vertical dentro da célula
      const drawCell = (lines, x, top, w, h, al) => {
        const off = (h - 2 * pad - lines.length * lead) / 2;
        lines.forEach((ln, k) => drawLine(ln, x + pad, top - pad - off - lead * (k + 0.8), w - 2 * pad, al, false));
      };
      // altura de cada linha pelas células simples; células mescladas somam as linhas que cobrem
      const measure = (grid, head) => {
        grid.forEach(row => row.cells.forEach(p => { if (p.k === 'cell') p.lines = wrap(tokens(p.t, { bold: head || p.bold, size }), spanW(p.c, p.cs) - 2 * pad, 0); }));
        const hs = grid.map(row => Math.max(lead + 2 * pad, ...row.cells.filter(p => p.k === 'cell' && p.rs === 1).map(p => (p.lines.length || 1) * lead + 2 * pad)));
        grid.forEach((row, ri) => row.cells.forEach(p => {
          if (p.k !== 'cell' || p.rs === 1) return;
          const need = (p.lines.length || 1) * lead + 2 * pad, have = hs.slice(ri, ri + p.rs).reduce((a, x) => a + x, 0);
          if (need > have) hs[ri + p.rs - 1] += need - have;
        }));
        return hs;
      };
      const drawRows = (grid, hs, from, to, head) => {
        for (let k = from; k < to; k++) {
          grid[k].cells.forEach(p => {
            if (p.k !== 'cell') return;
            const h = hs.slice(k, k + p.rs).reduce((a, x) => a + x, 0), w = spanW(p.c, p.cs);
            const fill = head ? rgb(0.9, 0.9, 0.9) : p.shade ? rgb(0.85, 0.85, 0.85) : undefined;
            page.drawRectangle(Object.assign({ x: xs[p.c], y: y - h, width: w, height: h }, fill ? { color: fill } : {}, border));
            const al = head || p.rs > 1 || p.cs > 1 ? 'center' : ({ l: 'left', c: 'center', r: 'right' }[b.align[p.c]] || 'left');
            drawCell(p.lines, xs[p.c], y, w, h, al);
          });
          y -= hs[k];
        }
      };
      const hgrid = HL.headGrid(b), hhs = measure(hgrid, true), hH = hhs.reduce((a, x) => a + x, 0);
      const grid = HL.tableGrid(b), hs = measure(grid, false), total = 40 + hH + hs.reduce((a, x) => a + x, 0);
      // tabela que cabe numa página não é dividida: se não cabe no resto desta, começa na próxima
      if (y - total < MB && total < PH - MT - MB) newPage(); else ensure(80);
      if (b.caption) para(b.caption, { bold: true, size: 9.5, before: 8, after: 4, keepNext: true });
      const drawHead = () => { ensure(hH); drawRows(hgrid, hhs, 0, hgrid.length, true); };
      drawHead();
      // grupo de linhas ligadas por mescla vertical não se divide entre páginas
      let ri = 0;
      while (ri < grid.length) {
        let end = ri + 1;
        for (let k = ri; k < end; k++) grid[k].cells.forEach(p => { if (p.k === 'cell') end = Math.max(end, k + p.rs); });
        const gh = hs.slice(ri, end).reduce((a, x) => a + x, 0);
        if (y - gh < MB) { newPage(); drawHead(); }
        drawRows(grid, hs, ri, end, false);
        ri = end;
      }
      y -= 10;
    }
    function kv(b) {
      const w = b.wide ? [0.49, 0.1, 0.41] : [0.12, 0.52, 0.36], size = 11, lead = 14.5;
      b.rows.forEach(r => {
        const cols = r.map((c, i) => wrap(tokens(c, { size }), TW * w[i] - 6, 0)), nl = Math.max(1, ...cols.map(l => l.length));
        ensure(lead * nl);
        let x = ML;
        cols.forEach((lines, i) => { lines.forEach((ln, k) => drawLine(ln, x, y - lead * (k + 0.8), TW * w[i], 'left', false)); x += TW * w[i]; });
        y -= lead * nl;
      });
      y -= 6;
    }
    async function fig(b) {
      let h = 150, img = null, iw = 0, ih = 0;
      const m = /^data:image\/(png|jpeg|jpg);base64,(.*)$/s.exec(b.img || '');
      if (m) {
        const bytes = Uint8Array.from(typeof atob === 'function' ? atob(m[2]) : Buffer.from(m[2], 'base64').toString('binary'), c => c.charCodeAt(0));
        img = m[1] === 'png' ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
        iw = 425; ih = iw * (img.height / img.width);
        if (ih > 385) { ih = 385; iw = ih * (img.width / img.height); }
        h = ih;
      }
      ensure(h + 50);
      y -= 6;
      if (img) page.drawImage(img, { x: ML + (TW - iw) / 2, y: y - ih, width: iw, height: ih });
      else {
        page.drawRectangle({ x: ML + 10, y: y - h, width: TW - 20, height: h, color: rgb(0.95, 0.95, 0.95), borderColor: rgb(0.6, 0.6, 0.6), borderWidth: 0.5 });
        drawLine(tokens('[ inserir imagem – ' + b.caption.split(' – ')[0] + ' ]', { italic: true, size: 10 }), ML, y - h / 2, TW, 'center', false);
      }
      y -= h + 4;
      para(b.caption, { bold: true, size: 9.5, align: 'center', after: b.fonte ? 1 : 10 });
      if (b.fonte) para(b.fonte, { size: 8, align: 'center', after: 10 });
    }

    for (const [bi, b] of blocks.entries()) {
      if (blocks[bi + 1] && blocks[bi + 1].t === 'sig') ensure(190); // local e data ficam junto com a assinatura
      switch (b.t) {
        case 'cov': {
          const sz = (b.size || 12), lead = sz * 1.3;
          y -= (b.before || 0) / 20;
          para(b.text, { size: sz, bold: b.bold, align: 'center', lead, after: (b.after || 0) / 20 });
          break;
        }
        case 'pb': newPage(); break;
        case 'h1': case 'h2': case 'h3': {
          const sz = b.t === 'h1' ? 12 : 11, ind = b.t === 'h3' ? 42 : 35;
          ensure(sz * 4);
          y -= b.t === 'h1' ? 16 : 10;
          const lead = sz * 1.3, base = y - lead * 0.8;
          page.drawText(clean(b.num), { x: ML, y: base, size: sz, font: fontOf(true, b.t === 'h3'), color: rgb(0, 0, 0) });
          para(b.text, { size: sz, bold: true, italic: b.t === 'h3', left: ind, after: 6, lead: sz * 1.3 });
          break;
        }
        case 'p': para(b.text, { bold: b.bold, align: b.center ? 'center' : 'both', first: b.noIndent || b.center ? 0 : 35, before: b.before ? b.before / 20 : 0 }); break;
        case 'li': para(b.text, { align: 'both', left: 35, after: 4 }); break;
        case 'ref': para(b.text, { align: 'both', after: 7 }); break;
        case 'eq': {
          ensure(26); y -= 8;
          const base = y - 11;
          const tk = tokens(b.text, { size: 11 }); let w = 0; tk.forEach(t => w += tw(t));
          drawLine(tk, ML + (TW - w) / 2, base, w, 'left', false);
          drawLine(tokens('(' + b.n + ')', { size: 11 }), ML, base, TW, 'right', false);
          y -= 22; break;
        }
        case 'kv': kv(b); break;
        case 'table': table(b); break;
        case 'fig': await fig(b); break;
        case 'sig': {
          ensure(110); y -= 40;
          [['_______________________________________', false], [b.nome || '', true], [b.titulo || '', false], [b.registro || '', false]].forEach(([t, bd]) => para(t, { align: 'center', bold: bd, after: 0 }));
          break;
        }
      }
    }
    // numeração de páginas (menos a capa)
    const pages = doc.getPages();
    pages.forEach((pg, i) => {
      if (i === 0) return;
      const t = String(i + 1), wd = F.r.widthOfTextAtSize(t, 9);
      pg.drawText(t, { x: (PW - wd) / 2, y: 36, size: 9, font: F.r, color: rgb(0, 0, 0) });
    });
    return await doc.save();
  }
  HL.buildPdf = buildPdf;
})(typeof globalThis !== 'undefined' ? globalThis : window);
