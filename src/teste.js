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

  // ---------- fichas em tabela com colunas TEMPO | ND | VAZÃO (teste de vazão máxima, outras empresas) ----------
  // Lidas pela posição das colunas na página: há blocos lado a lado (continuação do tempo), horários de
  // relógio soltos, aspas (") repetindo a vazão e a recuperação à direita, que é ignorada.
  function itemRows(items) {
    const its = items.filter(i => i.str && i.str.trim()).map(i => ({ s: i.str.trim(), raw: i.str, x: i.transform[4], y: i.transform[5], w: i.width || 0, h: Math.abs(i.transform[3]) || 8 }));
    its.sort((a, b) => b.y - a.y || a.x - b.x);
    const rows = [];
    its.forEach(it => { const r = rows.find(r => Math.abs(r.y - it.y) <= Math.max(2.5, it.h * 0.45)); if (r) r.items.push(it); else rows.push({ y: it.y, items: [it] }); });
    rows.sort((a, b) => b.y - a.y);
    rows.forEach(r => r.items.sort((a, b) => a.x - b.x));
    return rows;
  }
  // Junta pedaços colados ("D" + "ilma" = "Dilma"): espaço só onde há folga entre os itens.
  function smartLine(its) {
    let s = '', end = null;
    its.forEach(i => { if (end !== null) s += (i.x - end > 1 || /^\s/.test(i.raw) || /\s$/.test(s)) ? ' ' : ''; s += i.raw; end = i.x + i.w; });
    return s.replace(/\s+/g, ' ').trim();
  }
  const LBL = /(?<![\wÀ-ú.])(Cliente|Propriet[aá]rio|Bombeamento|Tubo Edutor|Prof\.? ?d[aeo] Bomba(?: \(m\))?|Prof\.? ?d[aeo] Po[çc]o(?: \(m\))?|Profundidade do Po[çc]o(?: \(m\))?|Po[çc]o|Localiza[çc][aã]o|Local|In[ií]cio(?: do teste)?|Hora|Munic[ií]pio|T[eé]rmino\.?(?: teste)?|Estado|NE(?: \(m\))?|ND(?: \(m\))?|Vaz[aã]o|Q \(m³\/h\)|q \(m³\/h\/m\)|s \(m\)|Latitude Longitude|Rebaixamento|Cap\.? ?Espec[ií]fica|Bomba|ø|Executado|Realizado por)\s*[:=]/gi;
  function labels(line) {
    const ms = []; let m; LBL.lastIndex = 0;
    while ((m = LBL.exec(line))) ms.push({ k: /^q \(/.test(m[1]) ? 'CAPESP' : norm(m[1]).replace(/\s*\(.*\)/, '').replace(/\.$/, ''), i: m.index, e: m.index + m[0].length });
    const out = { pre: (ms.length ? line.slice(0, ms[0].i) : line).trim() };
    ms.forEach((x, j) => { const v = line.slice(x.e, j + 1 < ms.length ? ms[j + 1].i : line.length).trim(); if (!(x.k in out) || (!out[x.k] && v)) out[x.k] = v; });
    return out;
  }
  const firstNum = s => { const m = /\d[\d.]*,\d+|\d+(?:\.\d+)?/.exec(String(s || '').replace(/^\([^)]*\)\s*=?/, '')); return m ? num(m[0]) : null; };
  const UFS = { ACRE: 'AC', ALAGOAS: 'AL', AMAPA: 'AP', AMAZONAS: 'AM', BAHIA: 'BA', CEARA: 'CE', 'DISTRITO FEDERAL': 'DF', 'ESPIRITO SANTO': 'ES', GOIAS: 'GO', MARANHAO: 'MA', 'MATO GROSSO': 'MT', 'MATO GROSSO DO SUL': 'MS', 'MINAS GERAIS': 'MG', PARA: 'PA', PARAIBA: 'PB', PARANA: 'PR', PERNAMBUCO: 'PE', PIAUI: 'PI', 'RIO DE JANEIRO': 'RJ', 'RIO GRANDE DO NORTE': 'RN', 'RIO GRANDE DO SUL': 'RS', RONDONIA: 'RO', RORAIMA: 'RR', 'SANTA CATARINA': 'SC', 'SAO PAULO': 'SP', SERGIPE: 'SE', TOCANTINS: 'TO' };
  function coordsDe(s) {
    const re = /(\d{1,3})\s*°\s*(\d{1,2})\s*['’′]\s*(\d{1,2}(?:[.,]\d+)?)\s*(?:["”″]|['’′]{2})?\s*([NSLOEW])?/gi, cs = []; let m;
    while ((m = re.exec(s)) && cs.length < 2) cs.push(m);
    if (cs.length < 2) return null;
    const hem = (h, d) => !h ? d : /S/i.test(h) ? 'Sul' : /N/i.test(h) ? 'Norte' : /[OW]/i.test(h) ? 'Oeste' : 'Leste', o = {};
    [['lat', cs[0], 'Sul'], ['lon', cs[1], 'Oeste']].forEach(([k, m, d]) => { o[k + 'G'] = m[1].padStart(2, '0'); o[k + 'M'] = m[2].padStart(2, '0'); o[k + 'S'] = m[3].replace('.', ','); o[k + 'Hem'] = hem(m[4], d); });
    return o;
  }
  const isT = s => /^\d{1,2}:\d{2}$/.test(s), isN = s => /^\d+,\d+$/.test(s) || /^\d{1,3}(\.\d{3})*,\d+$/.test(s);
  function parseTabelaPage(items) {
    const rows = itemRows(items), lines = rows.map(r => smartLine(r.items));
    const iReb = lines.findIndex(l => /^REBAIXAMENTO\b/i.test(norm(l)) || /\bREBAIXAMENTO\s+RECUPERA/i.test(norm(l)));
    if (iReb < 0) return null;
    // cabeçalho das colunas: das linhas logo abaixo de REBAIXAMENTO até a primeira linha com leituras
    const cols = []; let i = iReb + 1;
    for (; i < rows.length && i < iReb + 6; i++) {
      if (rows[i].items.some(it => isT(it.s) || isN(it.s))) break;
      rows[i].items.forEach(it => { const k = norm(it.s); if (/^(TEMPO|ND|NE|VAZAO|HORA)$/.test(k)) cols.push({ k, c: it.x + it.w / 2 }); });
    }
    if (!cols.some(c => c.k === 'TEMPO') || !cols.some(c => c.k === 'ND')) return null;
    cols.sort((a, b) => a.c - b.c);
    // blocos do rebaixamento: TEMPO seguido de ND (e VAZÃO); TEMPO seguido de NE é recuperação
    const grupos = [];
    cols.forEach((c, j) => { if (c.k !== 'TEMPO') return; const nx = cols.slice(j + 1).filter(x => x.k !== 'HORA'); if (nx[0] && nx[0].k === 'ND') grupos.push({ t: c, nd: nx[0], q: nx[1] && nx[1].k === 'VAZAO' ? nx[1] : null }); });
    if (!grupos.length) return null;
    const tbl = [];
    for (; i < rows.length; i++) {
      const cel = new Map();
      rows[i].items.forEach(it => { if (!(isT(it.s) || isN(it.s) || it.s === '"' || it.s === '”')) return; let best = null, d = 1e9; cols.forEach(c => { const e = Math.abs(it.x + it.w / 2 - c.c); if (e < d) { d = e; best = c; } }); if (best && d < 26) cel.set(best, it.s); });
      if (cel.size) tbl.push(cel);
    }
    const pts = []; let q = null, Qlast = null;
    grupos.forEach(g => tbl.forEach(cel => {
      const qs = g.q && cel.get(g.q); if (qs && isN(qs)) { q = numMil(qs); Qlast = q; }
      const ts = cel.get(g.t), nds = cel.get(g.nd);
      if (!ts || !isT(ts) || !nds || !isN(nds)) return;
      const t = tempoMin(ts), nd = num(nds); if (t > 0 && nd !== null) pts.push([t, nd]);
    }));
    pts.sort((a, b) => a[0] - b[0]);
    const L = {}; let cliente = '';
    lines.slice(0, iReb).forEach((l, j) => {
      const o = labels(l); Object.keys(o).forEach(k => { if (k !== 'pre' && !L[k]) L[k] = o[k]; });
      if (j && labels(lines[j - 1]).CLIENTE !== undefined && o.pre && !cliente) cliente = o.pre; // nome do cliente que continua na linha de baixo
    });
    const exec = (/(?:EXECUTADO|REALIZADO POR)\s*:\s*(.+?)(?:\s+TEL\b|\s+ANOTA|$)/i.exec(lines.join(' ')) || [])[1] || '';
    const dt = /(\d{2})\/(\d{2})\/(\d{4})/.exec(L['INICIO DO TESTE'] || L.INICIO || '');
    const est = norm(L.ESTADO || '').replace(/\s/g, ' ').trim(), uf = est.replace(/\s/g, '').length === 2 ? est.replace(/\s/g, '') : (UFS[est] || '');
    const pocoTxt = L.POCO || '';
    const meta = {
      cliente: [L.CLIENTE, cliente].filter(Boolean).join(' ').trim(), poco: /^[A-Z]{2,6}-?\d{1,3}$/i.test(pocoTxt) ? pocoTxt.toUpperCase() : '',
      local: L.LOCALIZACAO || L.LOCAL || '', municipio: L.MUNICIPIO || '', uf,
      data: dt ? dt[3] + '-' + dt[2] + '-' + dt[1] : null,
      NE: firstNum(L.NE), prof: firstNum(L['PROF DO POCO'] || L['PROF. DO POCO'] || L['PROFUNDIDADE DO POCO']), crivo: firstNum(L['PROF DA BOMBA'] || L['PROF. DA BOMBA']),
      diametro: (/(\d+(?:\s*\d\/\d)?)/.exec(L['Ø'] || '') || [])[1] || '',
      bomba: L.BOMBA || (L.BOMBEAMENTO ? L.BOMBEAMENTO.replace(/\bCV\b.*/i, 'CV') : ''), executor: exec.trim(),
      coords: coordsDe(L['LATITUDE LONGITUDE'] || ''), empresa: ''
    };
    const Qh = firstNum(L['Q'] || L.VAZAO);
    const Q = Qlast !== null ? Qlast : Qh;
    meta.tempo = pts.length ? pts[pts.length - 1][0] : null;
    return { meta, etapas: pts.length ? [{ etapa: 1, NE: meta.NE, ND: pts[pts.length - 1][1], Q, tempo: meta.tempo, pts }] : [] };
  }
  // pagesItems: [[itens do pdf.js], ...] → mesmo formato de parseFicha, ou null se a ficha não é desse tipo
  function parseTabela(pagesItems) {
    for (const items of pagesItems) { const f = parseTabelaPage(items); if (f && f.etapas.length) return f; }
    return null;
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

  Object.assign(HL, { parseFicha, parseTabela, parseLeituras, numMil, analisarTeste, pdfLines, theisW: W, hantushW: Wh });
})(typeof globalThis !== 'undefined' ? globalThis : window);
