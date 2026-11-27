/* HidroLaudo – utilitários numéricos e cálculos hidrogeológicos (puro, sem DOM) */
(function (G) {
  const HL = G.HL = G.HL || {};

  // ---------- números pt-BR ----------
  function num(v) {
    if (v === null || v === undefined || v === '') return null;
    if (typeof v === 'number') return isFinite(v) ? v : null;
    let s = String(v).trim().replace(/\s/g, '');
    if (!s) return null;
    if (s.includes(',') && s.includes('.')) s = s.replace(/\./g, '');
    s = s.replace(',', '.');
    const n = Number(s);
    return isFinite(n) ? n : null;
  }
  function fmt(n, d = 2) {
    if (n === null || n === undefined || !isFinite(n)) return '—';
    const neg = n < 0;
    let s = Math.abs(n).toFixed(d);
    let [i, f] = s.split('.');
    i = i.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    s = f ? i + ',' + f : i;
    if (neg && Number(s.replace(/\./g, '').replace(',', '.')) !== 0) s = '-' + s;
    return s;
  }
  // notação científica "9,208 x 10^{-4}"
  function sci(n, d = 3) {
    if (n === null || n === undefined || !isFinite(n)) return '—';
    if (n === 0) return '0';
    let e = Math.floor(Math.log10(Math.abs(n)));
    let m = n / Math.pow(10, e);
    if (Math.abs(Number(m.toFixed(d))) >= 10) { m /= 10; e += 1; }
    return fmt(m, d) + ' x 10^{' + e + '}';
  }
  function mean(a) {
    const v = a.filter(x => x !== null && isFinite(x));
    return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null;
  }

  // ---------- tabelas GOD (Foster & Hirata, 1993) – valores de referência editáveis ----------
  // conforme o diagrama GOD (Foster et al., 2002) enviado pelo geólogo
  const GOD_G = [
    ['Nenhum (sem aquífero)', 0], ['Surgente (fluxo ascendente/jorrante)', 0], ['Confinado', 0.2], ['Semiconfinado', 0.4],
    ['Livre (coberto)', 0.6], ['Livre (não confinado)', 1.0]
  ];
  const GOD_O = [
    ['Argila lacustrina/estuarina', 0.4], ['Solos residuais', 0.5], ['Silte, loess, till glacial', 0.6], ['Areia eólica', 0.7],
    ['Areia aluvial e fluvioglacial', 0.8], ['Cascalho de leques aluviais', 0.9], ['Sedimentos inconsolidados', 0.9],
    ['Lamito, xisto', 0.5], ['Siltito, tufo vulcânico', 0.6], ['Arenito', 0.7], ['Calcário, calcarenito', 0.9],
    ['Formações magmáticas/metamórficas e vulcânicas antigas', 0.6], ['Lava vulcânica recente', 0.8], ['Calcrete + calcário cárstico', 1.0]
  ];
  // D (Foster et al.): profundidade do nível d'água (livre) ou do topo do aquífero (confinado)
  const GOD_D = [
    [5, 0.9, 'até 5 m'], [20, 0.8, '5 a 20 m'], [50, 0.7, '20 a 50 m'], [Infinity, 0.6, 'acima de 50 m']
  ];
  // diagrama: Insignificante 0–0,1 · Baixa 0,1–0,3 · Média 0,3–0,5 · Alta 0,5–0,7 · Extrema 0,7–1,0 (o laudo usa Nula e Moderada)
  const GOD_CLASSES = [
    [0.1, 'NULA'], [0.3, 'BAIXA'], [0.5, 'MODERADA'], [0.7, 'ALTA'], [1.01, 'EXTREMA']
  ];
  function godD(depth) {
    if (depth === null) return null;
    for (const [lim, v] of GOD_D) if (depth <= lim) return v;
    return null;
  }
  function godClass(idx) {
    if (idx === null) return null;
    for (const [lim, name] of GOD_CLASSES) if (idx <= lim) return name;
    return 'EXTREMA';
  }

  // ---------- regressão s/Q = B + C·Q (n = 2) a partir das etapas ----------
  function regressStep(stages) {
    const pts = stages.map(s => [s.Q, s.Sw]).filter(([q, s]) => q > 0 && s !== null && s > 0).map(([q, s]) => [q, s / q]);
    if (pts.length < 2) return null;
    const n = pts.length, sx = pts.reduce((a, p) => a + p[0], 0), sy = pts.reduce((a, p) => a + p[1], 0);
    const sxx = pts.reduce((a, p) => a + p[0] * p[0], 0), sxy = pts.reduce((a, p) => a + p[0] * p[1], 0);
    const den = n * sxx - sx * sx;
    if (!den) return null;
    const C = (n * sxy - sx * sy) / den;
    const B = (sy - C * sx) / n;
    return { B, C };
  }

  // ---------- cálculo completo ----------
  function compute(r) {
    const h = r.hid, out = { warn: [] };
    const N = num;

    // etapas do teste
    out.stages = (r.teste.etapas || []).map(e => {
      const NE = N(e.ne), ND = N(e.nd), Q = N(e.q);
      const Sw = (NE !== null && ND !== null) ? ND - NE : null;
      const q = (Q !== null && Sw) ? Q / Sw : null;
      return { NE, ND, Q, Sw, q };
    });

    // transmissividade e condutividade: K = T / espessura saturada (calculado, nunca digitado)
    const metodos = ['theis', 'jacob', 'hantush'];
    const esp = N(r.teste.espessura);
    out.esp = esp;
    out.metodos = {};
    metodos.forEach(m => {
      const rows = ((r.teste.tk && r.teste.tk[m]) || []).map(x => {
        const T = N(x.t);
        return { T, K: T !== null && esp ? T / esp : null, E: N(x.e) };
      });
      out.metodos[m] = { rows, Tm: mean(rows.map(x => x.T)), Km: mean(rows.map(x => x.K)) };
    });
    // média geral = média das médias dos métodos que têm valor (como no laudo JCC-01)
    out.geral = { Tm: mean(metodos.map(m => out.metodos[m].Tm)), Km: mean(metodos.map(m => out.metodos[m].Km)) };
    const Tmed = out.geral.Tm;
    const Tover = N(h.T);
    out.Tmedia = Tmed;
    out.T = Tover !== null ? Tover : Tmed;
    out.Tfonte = Tover !== null ? 'informado' : 'média geral dos métodos';

    // rebaixamento disponível
    const PB = N(h.PB), SB = N(h.SB), NE = N(h.NE), VS = N(h.VS), I = N(h.I);
    out.Rd = [PB, SB, NE, VS, I].every(x => x !== null) ? PB - SB - NE - VS - I : null;

    // vazão máxima possível (Cooper-Jacob) em m3/h
    const horas = N(h.horas), t = horas !== null ? horas * 3600 : null;
    const rp = N(h.rp), S = N(h.S), T = out.T;
    out.t = t;
    out.Qmpo = null;
    if (out.Rd !== null && out.Rd > 0 && T && t && rp && S) {
      const arg = 2.25 * T * t / (rp * rp * S);
      if (arg > 1) out.Qmpo = 3600 * T * out.Rd / (0.183 * Math.log10(arg));
    }

    // vazões máximas permissíveis pelo furo e pelo filtro (quando há perfil construtivo)
    // furo: Qmpfr = 2·π·rf·hs·vmax, vmax = √K/20 (K média geral, m/s) · filtro: Qmpf = Ve·π·α·d·hs/2
    out.ff = null;
    if (h.avaliarFF === 'sim') {
      const rf = N(h.rf), hs = N(h.hs), Ve = N(h.Ve), al = N(h.alfa), d = N(h.dfiltro), K = out.geral.Km;
      const vmax = K !== null ? Math.sqrt(K) / 20 : null;
      out.ff = { vmax, Qfuro: rf && hs && vmax !== null ? 2 * Math.PI * rf * hs * vmax * 3600 : null,
        Qfiltro: Ve && al && d && hs ? Ve * Math.PI * al * d * hs / 2 * 3600 : null };
    }

    // equação característica Sw = B·Q + C·Q^n
    let B = N(h.B), C = N(h.C), n = N(h.n) || 2;
    out.regress = regressStep(out.stages);
    out.B = B; out.C = C; out.n = n;
    const Q = N(h.Q);
    out.Q = Q;
    if (B !== null && C !== null && Q !== null) {
      const bq = B * Q, cq = C * Math.pow(Q, n);
      out.BQ = bq; out.CQn = cq;
      out.Sw = bq + cq;
      out.efCalc = out.Sw > 0 ? 100 * bq / out.Sw : null;
      out.ND = NE !== null ? NE + out.Sw : null;
      out.qesp = out.Sw > 0 ? Q / out.Sw : null;
    }
    const efIn = N(h.ef);
    out.ef = efIn !== null ? efIn : out.efCalc;
    out.PC = PB;

    // demanda
    out.Qdia = (Q !== null && horas !== null) ? Q * horas : null;

    // interferência (Cooper-Jacob)
    const radii = String(r.interf.raios || '').split(/[;\s]+/).map(N).filter(x => x !== null && x > 0);
    const S2 = S;
    out.interf = [];
    out.rmax = null;
    if (T && t && S2 && Q !== null) {
      const Qs = Q / 3600;
      radii.forEach(rad => {
        const s = 0.183 * Qs / T * Math.log10(2.25 * T * t / (rad * rad * S2));
        out.interf.push({ r: rad, s: Math.max(0, s) });
      });
      out.rmax = Math.sqrt(2.25 * T * t / S2);
    }

    // GOD
    const Gv = N(r.god.g), Ov = N(r.god.o);
    const depth = N(r.god.d_dist);
    out.godDsug = godD(depth !== null ? depth : NE);
    const Din = N(r.god.d), Dv = Din !== null ? Din : out.godDsug; // em branco: valor da tabela
    out.god = { G: Gv, O: Ov, D: Dv, Dauto: Din === null, idx: null, classe: null, depth: depth !== null ? depth : NE };
    if (Gv !== null && Ov !== null && Dv !== null) {
      out.god.idx = Gv * Ov * Dv;
      out.god.classe = godClass(out.god.idx);
    }

    // alertas
    if (out.Sw !== undefined && out.Rd !== null && out.Sw > out.Rd)
      out.warn.push('O rebaixamento na vazão de explotação (' + fmt(out.Sw, 2) + ' m) é maior que o rebaixamento disponível (' + fmt(out.Rd, 2) + ' m).');
    if (out.Qmpo !== null && Q !== null && Q > out.Qmpo)
      out.warn.push('A vazão de explotação (' + fmt(Q, 2) + ' m³/h) é maior que a vazão máxima possível calculada (' + fmt(out.Qmpo, 2) + ' m³/h).');
    if (out.ff && Q !== null) {
      if (out.ff.Qfuro !== null && Q > out.ff.Qfuro) out.warn.push('A vazão de explotação é maior que a vazão máxima permissível pelo furo (' + fmt(out.ff.Qfuro, 1) + ' m³/h).');
      if (out.ff.Qfiltro !== null && Q > out.ff.Qfiltro) out.warn.push('A vazão de explotação é maior que a vazão máxima permissível pelo filtro (' + fmt(out.ff.Qfiltro, 1) + ' m³/h).');
    }
    if (out.Sw !== undefined && out.ND !== null && PB !== null && out.ND > PB)
      out.warn.push('O nível dinâmico ficaria abaixo da posição da bomba.');
    return out;
  }

  Object.assign(HL, { num, fmt, sci, mean, GOD_G, GOD_O, GOD_D, GOD_CLASSES, godD, godClass, regressStep, compute });
})(typeof globalThis !== 'undefined' ? globalThis : window);
