/* HidroLaudo – leitura da ficha do teste de bombeamento e análise (Jacob, Theis, Hantush) por etapa. Puro, sem DOM. */
(function (G) {
  const HL = G.HL = G.HL || {};
  const num = s => HL.num(s);
  const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[³]/g, '3').replace(/\s+/g, ' ').toUpperCase();

  // ---------- leitura da ficha (texto em linhas, uma lista por página) ----------
  // Rótulo de outro campo na mesma linha: palavras em maiúsculas, (unidade) opcional e dois-pontos.
  const NEXT_LABEL = /\s+[A-ZÀ-Ú]{2,}(?:[ \/][A-ZÀ-Ú]{1,})*\s*(?:\([^)]*\))?\s*:/;
  function textAfter(lines, label) { // label: regex sobre o texto original
    for (const ln of lines) {
      const m = label.exec(ln); if (!m) continue;
      let rest = ln.slice(m.index + m[0].length);
      const n = NEXT_LABEL.exec(rest); if (n) rest = rest.slice(0, n.index);
      rest = rest.replace(/(\D)(\s+\d+(?:\/\d+)?)+\s*$/, '$1').trim(); // frações soltas de colunas vizinhas (ex.: "Barreiras 1/2")
      if (rest) return rest;
    }
    return '';
  }
  function numAfter(lines, re) {
    for (const ln of lines) { const m = re.exec(norm(ln)); if (m) { const v = num(m[1]); if (v !== null) return v; } }
    return null;
  }
  function parsePage(lines) {
    const p = {
      etapa: numAfter(lines, /ETAPA\s*:\s*(\d+)/),
      poco: textAfter(lines, /PO[ÇC]O\s+BOMBEADO\s*:/i),
      local: textAfter(lines, /\bLOCAL\s*:/),
      municipioUF: textAfter(lines, /MUNIC[IÍ]P[IÍ]?O\s*\/\s*UF\s*:/i),
      executor: textAfter(lines, /EXECUTOR\s*:/i),
      aquifero: textAfter(lines, /AQU[IÍ]FERO\s*:/i),
      marca: textAfter(lines, /MARCA\s+DA\s+BOMBA\s*:/i),
      modelo: textAfter(lines, /MODELO\s+DA\s+BOMBA\s*:/i),
      diametro: textAfter(lines, /DI[AÂ]METRO\s+DO\s+PO[ÇC]O\s*\("\)\s*:/i),
      data: (lines.map(l => /DATA\s+DO\s+IN[IÍ]CIO\s*:\s*(\d{2})\/(\d{2})\/(\d{4})/i.exec(l)).find(Boolean) || null),
      NE: numAfter(lines, /\bNE\s*\(M\)\s*:\s*([\d.,]+)/),
      ND: numAfter(lines, /\bND\s*\(M\)\s*:\s*([\d.,]+)/),
      Q: numAfter(lines, /\bQ\s*\(M\s*3?\s*\/\s*H\)\s*:\s*([\d.,]+)/),
      prof: numAfter(lines, /PROFUNDIDADE\s+DO\s+POCO\s*\(M\)\s*:\s*([\d.,]+)/),
      crivo: numAfter(lines, /CRIVO\s+(?:DA\s+)?BOMBA\s*\(M\)\s*:\s*([\d.,]+)/),
      potencia: numAfter(lines, /POTENCIA\s*\(CV\)\s*:\s*([\d.,]+)/),
      tempo: numAfter(lines, /TEMPO\s+DE\s+BOMBEAMENTO\s*\(MIN\)\s*:\s*([\d.,]+)/),
      empresa: /GEOTECH/i.test(lines.join(' ')) ? 'GEOTECH' : '',
      pts: []
    };
    if (p.data) p.data = p.data[3] + '-' + p.data[2] + '-' + p.data[1];
    // linhas da tabela: [hora] t ND Sw Q q ... (a recuperação, à direita, é ignorada)
    lines.forEach(ln => {
      const tk = ln.trim().split(/\s+/); if (/^\d{1,2}:\d{2}$/.test(tk[0])) tk.shift();
      if (tk.length < 4 || !/^\d+(?:[.,]\d+)?$/.test(tk[0])) return;
      if (!/^\d+,\d+$/.test(tk[1]) || !/^\d+,\d+$/.test(tk[2])) return;
      const t = num(tk[0]), nd = num(tk[1]), sw = num(tk[2]), q = /^\d+,\d+$/.test(tk[3] || '') ? num(tk[3]) : null;
      if (t > 0 && nd !== null) p.pts.push({ t, nd, sw, q });
    });
    if (p.Q === null) { const qs = p.pts.map(x => x.q).filter(x => x); if (qs.length) p.Q = qs[qs.length - 1]; }
    if (p.ND === null && p.pts.length) p.ND = p.pts[p.pts.length - 1].nd;
    return p;
  }
  // pages: [[linha, ...], ...]  →  { meta, etapas: [{etapa, NE, ND, Q, pts}] }
  function parseFicha(pages) {
    const ps = pages.map(parsePage).filter(p => p.pts.length || p.Q !== null);
    if (!ps.length) return null;
    ps.forEach((p, i) => { if (p.etapa === null) p.etapa = i + 1; });
    ps.sort((a, b) => a.etapa - b.etapa);
    const first = k => { for (const p of ps) if (p[k] !== null && p[k] !== '' && p[k] !== undefined) return p[k]; return null; };
    const mu = String(first('municipioUF') || '').split('/');
    const meta = { poco: first('poco'), local: first('local'), municipio: (mu[0] || '').trim(), uf: (mu[1] || '').trim().toUpperCase().slice(0, 2),
      executor: first('executor'), aquifero: first('aquifero'), marca: first('marca'), modelo: first('modelo'), diametro: first('diametro'),
      data: first('data'), NE: first('NE'), prof: first('prof'), crivo: first('crivo'), potencia: first('potencia'), tempo: first('tempo'), empresa: first('empresa') };
    return { meta, etapas: ps.map(p => ({ etapa: p.etapa, NE: p.NE !== null ? p.NE : meta.NE, ND: p.ND, Q: p.Q, tempo: p.tempo, pts: p.pts.map(x => [x.t, x.nd]) })) };
  }

  // ---------- leituras digitadas ou coladas (fichas escaneadas, como a da WX Poços) ----------
  // Uma leitura por linha: tempo, ND e (opcional) vazão. Tempo em minutos ou h:mm ("4:15" = 255 min).
  // Linha com "etapa" começa uma nova etapa. Vazão em L/h aceita milhar com ponto ("2.500" = 2500).
  function numMil(s) { s = String(s || '').trim(); return /^\d{1,3}(\.\d{3})+$/.test(s) ? Number(s.replace(/\./g, '')) : num(s); }
  function tempoMin(s) {
    const p = String(s).trim().split(':'); if (p.length === 1) return num(p[0]);
    const v = p.map(Number); if (v.some(x => !isFinite(x))) return null;
    return p.length === 2 ? v[0] * 60 + v[1] : v[0] * 60 + v[1] + v[2] / 60;
  }
  function parseLeituras(text, o) { // o: { NE, Q, unidade: 'm3h' | 'Lh' }
    const fq = o.unidade === 'Lh' ? 1 / 1000 : 1, ets = [];
    let cur = null;
    const novo = () => { cur = { etapa: ets.length + 1, NE: o.NE, ND: null, Q: o.Q !== null && o.Q !== undefined ? o.Q * fq : null, pts: [] }; ets.push(cur); };
    String(text || '').replace(/\r/g, '').split('\n').forEach(l => {
      if (/etapa/i.test(l)) { novo(); return; }
      const tk = l.trim().split(/[\t;]+|\s+/).filter(Boolean); if (tk.length < 2) return;
      const t = tempoMin(tk[0]), nd = num(tk[1]), q = tk[2] !== undefined ? numMil(tk[2]) : null;
      if (!(t > 0) || nd === null) return;
      if (!cur) novo();
      cur.pts.push([t, nd]); cur.ND = nd;
      if (q) cur.Q = q * fq;
    });
    const ok = ets.filter(e => e.pts.length);
    if (!ok.length) return null;
    ok.forEach((e, i) => { e.etapa = i + 1; e.pts.sort((a, b) => a[0] - b[0]); });
    return { meta: { NE: o.NE }, etapas: ok };
  }

  // ---------- funções de poço ----------
  // W(u) de Theis = E1(u)
  function W(u) {
    if (u <= 0) return Infinity;
    if (u <= 1) { let s = -0.5772156649 - Math.log(u), term = 1; for (let k = 1; k < 60; k++) { term *= -u / k; const add = -term / k; s += add; if (Math.abs(add) < 1e-12) break; } return s; }
    return Math.exp(-u) / u * (u * u + 2.334733 * u + 0.250621) / (u * u + 3.330657 * u + 1.681534);
  }
  // W(u, r/B) de Hantush: ∫u→∞ exp(−y − β²/4y)/y dy, integrado em x = ln y (Simpson)
  function Wh(u, beta) {
    if (!beta) return W(u);
    const a = Math.log(u), b = Math.log(Math.max(u * 2, 60)), n = 240, h = (b - a) / n, b4 = beta * beta / 4;
    let s = 0;
    for (let i = 0; i <= n; i++) { const y = Math.exp(a + i * h), f = Math.exp(-y - b4 / y); s += f * (i === 0 || i === n ? 1 : i % 2 ? 4 : 2); }
    return s * h / 3;
  }

  // ajuste s = a·F(b/t): para cada b, a ótimo por mínimos quadrados; b por busca em grade + refinamento
  function fitCurve(pts, F) {
    const ev = lb => { const b = Math.pow(10, lb); let sw = 0, ww = 0; const ws = pts.map(([t, s]) => { const w = F(b / t); sw += s * w; ww += w * w; return w; });
      const a = ww ? sw / ww : 0; let e = 0; pts.forEach(([t, s], i) => { const r = s - a * ws[i]; e += r * r; }); return { a, b, e, ws }; };
    let best = null;
    for (let lb = -8; lb <= 5; lb += 0.1) { const r = ev(lb); if (r.a > 0 && (!best || r.e < best.e)) { best = r; best.lb = lb; } }
    if (!best) return null;
    let lo = best.lb - 0.1, hi = best.lb + 0.1;
    for (let k = 0; k < 40; k++) { const m1 = lo + (hi - lo) / 3, m2 = hi - (hi - lo) / 3; if (ev(m1).e < ev(m2).e) hi = m2; else lo = m1; }
    const r = ev((lo + hi) / 2); return r.a > 0 ? r : null;
  }
  // erro do ajuste (%): desvio médio quadrático relativo ao rebaixamento observado
  function errPct(obs, calc) { let s = 0; obs.forEach((o, i) => { const d = (o - calc[i]) / o; s += d * d; }); return 100 * Math.sqrt(s / obs.length); }

  function jacob(pts, dQ) {
    // trecho reto: metade final em escala logarítmica do tempo
    const lt = pts.map(p => Math.log10(p[0])), mid = (lt[0] + lt[lt.length - 1]) / 2;
    const use = pts.filter((p, i) => lt[i] >= mid);
    if (use.length < 3) return { nota: 'Poucos pontos no trecho final.' };
    const xs = use.map(p => Math.log10(p[0])), ys = use.map(p => p[1]), n = xs.length;
    const mx = xs.reduce((a, x) => a + x, 0) / n, my = ys.reduce((a, y) => a + y, 0) / n;
    let sxy = 0, sxx = 0; xs.forEach((x, i) => { sxy += (x - mx) * (ys[i] - my); sxx += (x - mx) * (x - mx); });
    const slope = sxx ? sxy / sxx : 0;
    if (!(slope > 1e-4)) return { nota: 'Rebaixamento estabilizado no trecho final: o método de Jacob não se aplica a esta etapa.' };
    const T = 0.183 * dQ / slope, calc = xs.map(x => my + slope * (x - mx));
    // reta: s' = my + ds·(log10 t − mx), t em segundos desde o início da etapa
    return { T, erro: errPct(ys, calc), ds: slope, mx, my, tIni: use[0][0], tFim: use[use.length - 1][0] };
  }
  function theis(pts, dQ) {
    const f = fitCurve(pts, W); if (!f) return { nota: 'Não foi possível ajustar a curva de Theis.' };
    return { T: dQ / (4 * Math.PI * f.a), erro: errPct(pts.map(p => p[1]), f.ws.map(w => f.a * w)) };
  }
  const BETAS = [0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.3, 0.5, 0.7, 1, 1.5, 2, 2.5];
  function hantush(pts, dQ) {
    let best = null;
    BETAS.forEach(beta => { const f = fitCurve(pts, u => Wh(u, beta)); if (f && (!best || f.e < best.f.e)) best = { f, beta }; });
    if (!best) return { nota: 'Não foi possível ajustar a curva de Hantush.' };
    return { T: dQ / (4 * Math.PI * best.f.a), erro: errPct(pts.map(p => p[1]), best.f.ws.map(w => best.f.a * w)), rB: best.beta };
  }

  // Análise de cada etapa do escalonado. Cada etapa usa o acréscimo de vazão (ΔQ) e o rebaixamento
  // acima do nível do fim da etapa anterior, com o tempo contado desde o início da etapa.
  function analisarTeste(dados) {
    const ets = (dados && dados.etapas) || [];
    let Qprev = 0, sPrev = 0;
    return ets.map(e => {
      const NE = e.NE, Q = e.Q;
      const s = (e.pts || []).map(([t, nd]) => [t * 60, nd - NE]);
      const dQ = Q !== null && Q !== undefined ? (Q - Qprev) / 3600 : null;
      const pts = s.map(([t, x]) => [t, x - sPrev]).filter(([t, x]) => t > 0 && x > 0);
      const out = { etapa: e.etapa, Q, dQ: dQ !== null ? dQ * 3600 : null, n: pts.length, sPrev };
      if (dQ > 0 && pts.length >= 4) { out.jacob = jacob(pts, dQ); out.theis = theis(pts, dQ); out.hantush = hantush(pts, dQ); }
      else out.nota = 'Dados insuficientes nesta etapa.';
      if (s.length) sPrev = s[s.length - 1][1];
      if (Q !== null && Q !== undefined) Qprev = Q;
      return out;
    });
  }

  // itens de texto do pdf.js (str, transform[4]=x, [5]=y) → linhas, de cima para baixo
  function pdfLines(items) {
    const its = items.filter(i => i.str && i.str.trim()).map(i => ({ s: i.str, x: i.transform[4], y: i.transform[5], h: Math.abs(i.transform[3]) || 8 }));
    its.sort((a, b) => b.y - a.y || a.x - b.x);
    const rows = [];
    its.forEach(it => { // expoentes (m³) ficam um pouco acima: tolerância de meia altura
      const r = rows.find(r => Math.abs(r.y - it.y) <= Math.max(2.5, it.h * 0.45));
      if (r) r.items.push(it); else rows.push({ y: it.y, items: [it] });
    });
    rows.sort((a, b) => b.y - a.y);
    return rows.map(r => r.items.sort((a, b) => a.x - b.x).map(i => i.s.trim()).join(' ').replace(/\s+/g, ' '));
  }

  Object.assign(HL, { parseFicha, parseLeituras, numMil, analisarTeste, pdfLines, theisW: W, hantushW: Wh });
})(typeof globalThis !== 'undefined' ? globalThis : window);
