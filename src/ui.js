/* HidroLaudo – interface */
(function () {
  'use strict';
  const HL = window.HL, { num, fmt, sci } = HL;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = s => String(s === null || s === undefined ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------- ícones ----------
  const ICON = {
    folder: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
    book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z M4 21V5',
    file: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5 M9 13h6 M9 17h6',
    pin: 'M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
    drop: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z',
    layers: 'M12 3l9 5-9 5-9-5z M3 12.5l9 5 9-5 M3 17l9 5 9-5',
    calc: 'M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z M8 7h8 M8 12h2 M14 12h2 M8 16h2 M14 16h2',
    users: 'M17 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1 M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M21 20v-1a4 4 0 0 0-3-3.9 M16 3.1a4 4 0 0 1 0 7.8',
    shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
    flask: 'M9 3h6 M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3',
    text: 'M4 6h16 M4 12h16 M4 18h10',
    down: 'M12 3v12 M7 11l5 5 5-5 M5 21h14',
    plus: 'M12 5v14 M5 12h14',
    warn: 'M12 3l10 18H2z M12 10v5 M12 18v.5',
    check: 'M5 13l4 4L19 7',
    x: 'M6 6l12 12 M18 6L6 18',
    save: 'M5 3h11l4 4v14H5z M8 3v6h7V3 M8 21v-7h8v7',
    home: 'M3 11l9-8 9 8 M5 10v10h5v-6h4v6h5V10',
    newdoc: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5 M12 11v6 M9 14h6',
    gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
    upload: 'M12 21V9 M7 13l5-5 5 5 M5 3h14'
  };
  const ic = n => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + ICON[n] + '"/></svg>';

  // ---------- acesso por caminho ----------
  const get = (o, p) => p.split('.').reduce((a, k) => (a === undefined || a === null ? undefined : a[k]), o);
  function set(o, p, v) { const ks = p.split('.'); const last = ks.pop(); const t = ks.reduce((a, k) => a[k], o); t[last] = v; }
  function fill(base, src) { // completa campos novos em laudos antigos
    if (Array.isArray(base) || typeof base !== 'object' || base === null) return src === undefined ? base : src;
    const out = {}; Object.keys(base).forEach(k => out[k] = fill(base[k], src ? src[k] : undefined));
    if (src) Object.keys(src).forEach(k => { if (!(k in out)) out[k] = src[k]; });
    return out;
  }

  // ---------- armazenamento ----------
  // Banco no próprio navegador (IndexedDB, comporta imagens) + cópia automática num arquivo de backup
  // numa pasta escolhida no computador (pode ser no OneDrive, que sincroniza com a nuvem).
  const KEY = 'hidrolaudo:v1';
  let store = { reports: [], current: null, folders: [], memo: {} }, calcCache = null, saveTimer = null;
  const idb = (() => {
    let dbp = null;
    const open = () => dbp || (dbp = new Promise((res, rej) => { const q = indexedDB.open('hidrolaudo', 1); q.onupgradeneeded = () => q.result.createObjectStore('kv'); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }));
    const tx = (mode, fn) => open().then(db => new Promise((res, rej) => { const t = db.transaction('kv', mode); const q = fn(t.objectStore('kv')); t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error); }));
    return { get: k => tx('readonly', s => s.get(k)), set: (k, v) => tx('readwrite', s => s.put(v, k)) };
  })();
  function normalize() {
    if (!store.reports || !store.reports.length) { const s = HL.sample(); s.exemplo = true; store.reports = [s]; store.current = s.id; }
    store.folders = store.folders || []; store.memo = store.memo || {};
    load2();
    if (!store.reports.find(r => r.id === store.current)) store.current = store.reports[0].id;
    if (!Object.keys(store.memo).length) store.reports.forEach(r => MEMO.forEach(p => remember(p, get(r, p), r)));
  }
  async function load() {
    let s = null;
    try { s = await idb.get(KEY); } catch (e) { /* IndexedDB indisponível */ }
    if (!s) try { const t = localStorage.getItem(KEY); if (t) s = JSON.parse(t); } catch (e) { /* sem armazenamento */ }
    if (s) store = s;
    normalize();
  }
  const R = () => store.reports.find(r => r.id === store.current);
  const C = () => calcCache || (calcCache = HL.compute(R()));
  function setStatus(msg, err) { const el = $('#status'); if (el) { el.className = 'status' + (err ? ' err' : ''); el.innerHTML = '<span class="dot"></span>' + esc(msg); } }
  function persist(immediate) {
    clearTimeout(saveTimer); setStatus('Salvando…');
    const run = async () => {
      try { await idb.set(KEY, JSON.parse(JSON.stringify(store))); }
      catch (e) { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e2) { setStatus('Não foi possível salvar: espaço cheio ou bloqueado', true); return; } }
      const b = await backupWrite();
      setStatus(b === true ? 'Salvo · backup na pasta “' + backupName + '”' : b === 'perm' ? 'Salvo no navegador · clique para reconectar o backup' : 'Salvo neste computador', b === 'perm');
    };
    if (immediate) run(); else saveTimer = setTimeout(run, 600);
  }

  // backup automático numa pasta (File System Access API: Chrome e Edge)
  let backupDir = null, backupName = '';
  async function backupInit() {
    try { backupDir = await idb.get('backupDir'); backupName = backupDir ? backupDir.name : ''; } catch (e) { backupDir = null; }
  }
  async function backupWrite() {
    if (!backupDir) return false;
    try {
      if ((await backupDir.queryPermission({ mode: 'readwrite' })) !== 'granted') return 'perm';
      const fh = await backupDir.getFileHandle('hidrolaudo-backup.json', { create: true }), w = await fh.createWritable();
      await w.write(JSON.stringify(store)); await w.close(); return true;
    } catch (e) { return 'perm'; }
  }
  async function backupChoose() {
    if (!window.showDirectoryPicker) { toast('Este navegador não permite escolher pasta. Use o Chrome ou o Edge, ou o botão Exportar backup.', true); return; }
    try { backupDir = await window.showDirectoryPicker({ id: 'hidrolaudo-backup', mode: 'readwrite' }); backupName = backupDir.name; await idb.set('backupDir', backupDir); persist(true); toast('Backup automático ligado na pasta “' + backupName + '”.'); render(); }
    catch (e) { if (e.name !== 'AbortError') toast('Não foi possível usar essa pasta.', true); }
  }
  async function backupReconnect() {
    if (!backupDir) return backupChoose();
    try { if ((await backupDir.requestPermission({ mode: 'readwrite' })) === 'granted') { persist(true); toast('Backup reconectado.'); } } catch (e) { backupChoose(); }
  }

  // ---------- memória de dados (o que já foi digitado vira sugestão e padrão do próximo laudo) ----------
  const MEMO = ['g.interessado', 'g.local', 'g.municipio', 'g.finalidade', 'g.orgao', 'g.formulario', 'g.formsAnexos', 'g.respNome', 'g.respTitulo', 'g.respRegistro',
    'loc.bairro', 'poco.diametro', 'poco.revestimento', 'poco.empresa', 'poco.sedeEmpresa', 'teste.bomba', 'teste.programa', 'teste.aquifero', 'teste.duracao',
    'geo.comportamento', 'qual.lab', 'qual.sede', 'qual.portaria'];
  // campos que já vêm preenchidos num laudo novo com o último valor usado
  const CARRY = ['g.finalidade', 'g.orgao', 'g.formulario', 'g.formsAnexos', 'g.respNome', 'g.respTitulo', 'g.respRegistro', 'poco.revestimento', 'poco.empresa', 'poco.sedeEmpresa',
    'teste.programa', 'teste.aquifero', 'geo.comportamento', 'qual.lab', 'qual.sede', 'qual.portaria', 'hid.rp', 'hid.S', 'hid.SB', 'hid.VS', 'hid.I', 'hid.horas'];
  function remember(p, v, r) {
    v = String(v === undefined || v === null ? '' : v).trim(); if (!v || (r && r.exemplo)) return;
    const a = store.memo[p] = (store.memo[p] || []).filter(x => x !== v); a.unshift(v); if (a.length > 20) a.length = 20;
  }
  function newReport() {
    const n = HL.blank(), last = store.reports.filter(x => !x.exemplo).sort((a, b) => b.atualizado - a.atualizado)[0];
    CARRY.forEach(p => { const v = last ? get(last, p) : (store.memo[p] || [])[0]; if (v !== undefined && v !== null && String(v).trim() !== '') set(n, p, v); });
    return n;
  }
  function touch() {
    const r = R(); r.atualizado = Date.now(); r.nome = (r.g.poco || 'Novo laudo') + (r.g.local ? ' · ' + r.g.local : '');
    calcCache = null;
  }
  let toastT;
  function toast(msg, err) {
    $$('.toast').forEach(t => t.remove());
    const t = document.createElement('div'); t.className = 'toast' + (err ? ' err' : ''); t.textContent = msg; t.setAttribute('role', 'status'); document.body.appendChild(t);
    clearTimeout(toastT); toastT = setTimeout(() => t.remove(), 3800);
  }

  // ---------- formatação ----------
  const SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  function plainSci(n, d) { if (n === null || n === undefined || !isFinite(n)) return '—'; return sci(n, d).replace(/\^\{(-?\d+)\}/, (m, e) => String(e).split('').map(c => SUP[c]).join('')).replace(' x ', ' × '); }
  const rich = t => HL.parseRuns(t).map(r => r.v ? '<' + (r.v === 'superscript' ? 'sup' : 'sub') + '>' + esc(r.t) + '</' + (r.v === 'superscript' ? 'sup' : 'sub') + '>' : esc(r.t)).join('');
  const resolve = (o, p) => p.split('.').reduce((a, k) => (a === undefined || a === null ? undefined : a[k]), o);
  function O(spec) { // "?caminho|fmt": em branco (e não "—") quando não há valor
    const blank = spec[0] === '?'; if (blank) spec = spec.slice(1);
    const [p, f] = spec.split('|'); const v = resolve(C(), p);
    if (v === undefined || v === null) return blank ? '' : '—';
    if (f && f[0] === 's') return plainSci(v, +f.slice(1));
    return fmt(v, f === undefined ? 2 : +f);
  }
  const out = (spec, tag) => '<' + (tag || 'span') + ' data-out="' + spec + '">' + esc(O(spec)) + '</' + (tag || 'span') + '>';
  function dateBR(iso) { const d = HL.dateParts(iso); return d ? String(d.d).padStart(2, '0') + '/' + String(d.m).padStart(2, '0') + '/' + d.y : '—'; }

  // ---------- pendências ----------
  const REQ = [
    ['dados', 'g.interessado', 'Interessado'], ['dados', 'g.local', 'Nome do local'], ['dados', 'g.poco', 'Código do poço'], ['dados', 'g.municipio', 'Município'], ['dados', 'g.uf', 'UF'],
    ['dados', 'g.dataLaudo', 'Data do laudo'], ['dados', 'g.art', 'Número da ART'], ['dados', 'g.respNome', 'Responsável técnico'],
    ['localizacao', 'loc.endereco', 'Endereço'], ['localizacao', 'loc.bairro', 'Bairro'], ['localizacao', 'loc.latG', 'Latitude'], ['localizacao', 'loc.lonG', 'Longitude'],
    ['poco', 'poco.profUtil', 'Profundidade útil'], ['poco', 'poco.empresa', 'Empresa que testou o poço'], ['poco', 'teste.data', 'Data do teste'], ['poco', 'teste.bomba', 'Bomba usada no teste'], ['poco', 'teste.espessura', 'Espessura saturada'],
    ['geologia', 'geo.contexto', 'Contexto geológico'],
    ['calculos', 'hid.PB', 'Posição da bomba (PB)'], ['calculos', 'hid.NE', 'Nível estático (NE)'], ['calculos', 'hid.S', 'Coeficiente de armazenamento (S)'], ['calculos', 'hid.B', 'Coeficiente B'], ['calculos', 'hid.C', 'Coeficiente C'], ['calculos', 'hid.Q', 'Vazão de explotação'],
    ['demanda', 'dem.usos', 'Usos da demanda'],
    ['qualidade', 'qual.cert', 'Nº do certificado'], ['qualidade', 'qual.amostra', 'Nº da amostra'], ['qualidade', 'qual.data', 'Data da amostra'], ['qualidade', 'qual.lab', 'Laboratório']
  ];
  const isEmpty = (r, p) => { const v = get(r, p); return v === undefined || v === null || String(v).trim() === ''; };
  function pending(r) {
    const list = REQ.filter(([s, p]) => isEmpty(r, p)).map(([s, p, l]) => ({ s, p, l }));
    if (r.teste.etapas.some(e => num(e.ne) === null || num(e.nd) === null || num(e.q) === null)) list.push({ s: 'poco', p: null, l: 'Dados de todas as etapas do teste' });
    const c = HL.compute(r);
    if (c.T === null || c.T === undefined) list.push({ s: 'calculos', p: 'hid.T', l: 'Transmissividade (T)' });
    return list;
  }

  // ---------- campos ----------
  let reqMiss = new Set();
  function fld(path, label, o) {
    o = o || {}; const r = R(), v = get(r, path), val = v === undefined || v === null ? '' : v, id = 'f-' + path.replace(/\./g, '-');
    const miss = reqMiss.has(path) ? ' miss' : '';
    if (!o.list && !o.type && MEMO.includes(path) && (store.memo[path] || []).length) o.list = 'm-' + path.replace(/\./g, '-');
    let ctl;
    if (o.type === 'textarea') ctl = '<textarea id="' + id + '" data-path="' + path + '" rows="' + (o.rows || 4) + '" placeholder="' + esc(o.ph || '') + '">' + esc(val) + '</textarea>';
    else if (o.type === 'select') ctl = '<select id="' + id + '" data-path="' + path + '">' + o.options.map(x => '<option value="' + esc(x[0]) + '"' + (String(x[0]) === String(val) ? ' selected' : '') + '>' + esc(x[1]) + '</option>').join('') + '</select>';
    else {
      const inp = '<input id="' + id + '" data-path="' + path + '" type="' + (o.type || 'text') + '" value="' + esc(val) + '" placeholder="' + esc(o.ph || '') + '"' + (o.dec ? ' inputmode="decimal" autocomplete="off"' : '') + (o.list ? ' list="' + o.list + '"' : '') + (o.max ? ' maxlength="' + o.max + '"' : '') + '>';
      ctl = o.suf ? '<div class="inp">' + inp + '<span>' + o.suf + '</span></div>' : inp;
    }
    return '<div class="f s' + (o.span || 6) + (o.dec ? ' num' : '') + miss + '"><label for="' + id + '">' + label + '</label>' + ctl + (o.hint ? '<small>' + o.hint + '</small>' : '') + '</div>';
  }
  const card = (title, sub, body) => '<section class="card"><h3>' + title + '</h3>' + (sub ? '<div class="sub">' + sub + '</div>' : '') + body + '</section>';
  const head = (t, lead) => '<h2>' + t + '</h2><p class="lead">' + lead + '</p>';
  const GEN = [['o', 'Masculino (o, do, no)'], ['a', 'Feminino (a, da, na)']];

  // ---------- seções ----------
  const SECTIONS = [
    { id: 'dados', label: 'Dados gerais', icon: 'file' },
    { id: 'localizacao', label: 'Localização', icon: 'pin' },
    { id: 'poco', label: 'Poço e teste', icon: 'drop' },
    { id: 'geologia', label: 'Geologia', icon: 'layers' },
    { id: 'calculos', label: 'Cálculos', icon: 'calc' },
    { id: 'demanda', label: 'Demanda e interferência', icon: 'users' },
    { id: 'vulnerabilidade', label: 'Vulnerabilidade', icon: 'shield' },
    { id: 'qualidade', label: 'Qualidade da água', icon: 'flask' },
    { id: 'textos', label: 'Textos-base', icon: 'text' },
    { id: 'gerar', label: 'Gerar relatório', icon: 'down' }
  ];

  function figCard(key, titulo) {
    const f = R().figs[key] || {};
    return '<div class="fig"><div class="cap">' + titulo + '</div><div class="th">' + (f.data ? '<img alt="' + esc(titulo) + '" src="' + f.data + '">' : 'Nenhuma imagem anexada.<br>Aparece no laudo como espaço reservado.') + '</div>' +
      '<div class="row"><label class="btn sm" for="up-' + key + '">' + ic('plus') + (f.data ? 'Trocar imagem' : 'Anexar imagem') + '</label><input id="up-' + key + '" data-fig="' + key + '" type="file" accept="image/*" hidden>' +
      (f.data ? '<button class="btn sm danger" data-action="delFig:' + key + '">Remover</button>' : '') + '</div>' +
      '<div class="f"><label for="fonte-' + key + '">Fonte / escala (opcional)</label><input id="fonte-' + key + '" data-path="figs.' + key + '.fonte" value="' + esc(f.fonte || '') + '" placeholder="ex.: FONTE: Folha SC.25 – Escala 1:100.000"></div></div>';
  }


  function viewInicio() {
    const r = R(), rep = store.reports.slice().sort((a, b) => b.atualizado - a.atualizado), cs = rep.map(x => HL.compute(x));
    const totQ = cs.reduce((t, c) => t + (c.Q || 0), 0), totD = cs.reduce((t, c) => t + (c.Qdia || 0), 0);
    const rows = rep.slice(0, 5).map(x => { const c = HL.compute(x), cls = c.god.classe;
      return '<tr data-open="' + x.id + '"><td class="mono">' + esc(x.g.poco || '—') + '</td><td>' + esc(folderName(x.pasta) || x.g.interessado || '—') + '</td><td>' + esc(x.g.municipio ? x.g.municipio + (x.g.uf ? '-' + x.g.uf : '') : '—') + '</td><td>' + dateBR(x.g.dataLaudo) + '</td><td>' + (cls ? '<span class="pill ' + cls + '">' + cls.charAt(0) + cls.slice(1).toLowerCase() + '</span>' : '—') + '</td><td>' + statusPill(x.g.status) + '</td></tr>'; }).join('');
    const sc = (cls, act, icon, t, sub) => '<button class="short' + cls + '" ' + act + '>' + ic(icon) + '<b>' + t + '</b><span>' + sub + '</span></button>';
    return '<div class="hero"><img class="scene" src="@@IMG_BANNER@@" alt=""><div class="ht"><img class="lg" src="@@IMG_LOGO@@" alt=""><div><div class="hn">WILTON ROCHA</div><div class="hs"><i></i>HIDROGEOLOGIA<i></i></div><div class="hi">Laudos de outorga, do teste ao relatório</div></div></div></div>' +
      '<div class="wrap"><div class="shorts">' +
      sc(' pri', 'data-action="novo"', 'newdoc', 'Novo laudo', 'Começar um relatório') + sc('', 'data-action="importar"', 'upload', 'Importar teste', 'Ficha em PDF → laudo') + sc('', 'data-go="consultas"', 'folder', 'Meus laudos', 'Pastas por cliente') +
      sc('', 'data-go="dados"', 'drop', 'Laudo atual', esc(r.g.poco || 'Continuar editando')) + sc('', 'data-go="gerar"', 'down', 'Gerar relatório', 'Word e PDF') + '</div>' +
      '<div class="hm"><section class="card rc"><div class="rh">' + ic('file') + 'Laudos recentes<a data-go="consultas">Ver todos ›</a></div><table><thead><tr><th>Poço</th><th>Cliente</th><th>Município</th><th>Laudo</th><th>Vulnerabilidade</th><th>Situação</th></tr></thead><tbody>' + (rows || '<tr><td colspan="6">Nenhum laudo ainda.</td></tr>') + '</tbody></table></section>' +
      '<div><div class="bigstat"><div class="tile">' + ic('file') + '</div><div class="t"><b>Laudos salvos</b><small>' + store.folders.length + ' pasta(s) de clientes</small><div class="n">' + store.reports.length + '</div></div></div>' +
      '<div class="bigstat"><div class="tile">' + ic('drop') + '</div><div class="t"><b>Vazão solicitada</b><small>Soma de todos os laudos</small><div class="n">' + fmt(totQ, totQ % 1 ? 2 : 0) + '<small> m³/h</small></div></div></div></div></div></div>';
  }

  const VIEWS = {
    dados() {
      const r = R();
      return head('Dados gerais', 'Quem solicita, onde fica e quem assina. Estes dados alimentam a capa, a introdução e a conclusão.') +
        card('Pasta e situação', 'A pasta organiza os laudos por cliente em Meus laudos.', '<div class="grid">' +
          fld('pasta', 'Pasta do cliente', { span: 5, type: 'select', options: [['', 'Sem pasta']].concat(store.folders.map(f => [f.id, f.nome])) }) +
          '<div class="f s3"><span class="lab">&nbsp;</span><button class="btn" data-action="pastaInt">' + ic('folder') + 'Pasta com o nome do interessado</button></div>' +
          fld('g.status', 'Situação do laudo', { span: 4, type: 'select', options: STATUS }) + '</div>') +
        card('Interessado e local', 'O gênero é usado para escrever “do Colégio” ou “da Fazenda” corretamente em todo o texto.',
          '<div class="grid">' + fld('g.interessado', 'Interessado (proprietário)', { span: 8 }) + fld('g.artInt', 'Gênero do interessado', { span: 4, type: 'select', options: GEN }) +
          fld('g.local', 'Nome do local', { span: 8, ph: 'ex.: Colégio Madre Valdelícia' }) + fld('g.artLocal', 'Gênero do local', { span: 4, type: 'select', options: GEN }) +
          fld('g.poco', 'Código do poço', { span: 3, ph: 'CMV-01' }) + fld('g.municipio', 'Município', { span: 5 }) + fld('g.uf', 'UF', { span: 2, max: 2 }) + fld('g.dataLaudo', 'Data do laudo', { span: 2, type: 'date' }) + '</div>') +
        card('Registro e processo', null,
          '<div class="grid">' + fld('g.art', 'Número da ART', { span: 4 }) + fld('g.finalidade', 'Finalidade do uso', { span: 8 }) +
          fld('g.formulario', 'Formulário da demanda', { span: 3 }) + fld('g.formsAnexos', 'Formulários anexos', { span: 5 }) + fld('g.orgao', 'Órgão outorgante', { span: 4 }) + '</div>') +
        card('Responsável técnico', 'Aparece no campo de assinatura no final do laudo.',
          '<div class="grid">' + fld('g.respNome', 'Nome', { span: 5 }) + fld('g.respTitulo', 'Título', { span: 3 }) + fld('g.respRegistro', 'Registro profissional', { span: 4, ph: 'CREA-AL nº ...' }) + '</div>');
    },
    localizacao() {
      const hem = (a, b) => [[a, a], [b, b]];
      return head('Localização e vias de acesso', 'Endereço, coordenadas do poço e os mapas das Figuras 01 a 03.') +
        card('Endereço', null, '<div class="grid">' + fld('loc.prep', 'Preposição', { span: 2, type: 'select', options: [['na', 'na'], ['no', 'no'], ['em', 'em']] }) + fld('loc.endereco', 'Logradouro e número', { span: 6, ph: 'Rua C-05, nº 275, Quadra C-3' }) + fld('loc.bairro', 'Bairro', { span: 4 }) +
          fld('loc.acesso', 'Descrição do acesso', { span: 12, type: 'textarea', rows: 4, hint: 'Texto livre. Use {{poco}}, {{do_local}} etc. se quiser.' }) + '</div>') +
        card('Coordenadas geográficas do poço', 'Graus, minutos e segundos. Use vírgula nos segundos (ex.: 05,58).',
          '<div class="grid">' + fld('loc.latG', 'Latitude: graus', { span: 3, dec: 1 }) + fld('loc.latM', 'min', { span: 3, dec: 1 }) + fld('loc.latS', 'seg', { span: 3, dec: 1 }) + fld('loc.latHem', 'Hemisfério', { span: 3, type: 'select', options: hem('Sul', 'Norte') }) + '</div>' +
          '<div class="grid" style="margin-top:12px">' + fld('loc.lonG', 'Longitude: graus', { span: 3, dec: 1 }) + fld('loc.lonM', 'min', { span: 3, dec: 1 }) + fld('loc.lonS', 'seg', { span: 3, dec: 1 }) + fld('loc.lonHem', 'Hemisfério', { span: 3, type: 'select', options: hem('Oeste', 'Leste') }) + '</div>' +
          '<small class="hint">Pode colar as coordenadas de uma vez, por exemplo 09°35\'05,58"S 35°45\'52,94"W, no campo de graus da latitude.</small>') +
        card('Mapas', 'As imagens entram no relatório com a legenda numerada. Sem imagem, o relatório traz um espaço reservado.',
          '<div class="figs">' + figCard('f1', 'Figura 01 · Localização') + figCard('f2', 'Figura 02 · Vias de acesso') + figCard('f3', 'Figura 03 · Localização do poço') + '</div>');
    },
    poco() {
      const r = R(), n = r.teste.etapas.length;
      const rowsE = r.teste.etapas.map((e, i) => '<tr><td class="ro">' + (i + 1) + 'ª</td>' +
        ['ne', 'nd', 'q'].map(k => '<td><input class="num-in" inputmode="decimal" data-path="teste.etapas.' + i + '.' + k + '" value="' + esc(e[k]) + '" aria-label="' + k + ' etapa ' + (i + 1) + '"></td>').join('') +
        '<td class="out">' + out('stages.' + i + '.Sw|3') + '</td><td class="out">' + out('stages.' + i + '.q|3') + '</td>' +
        '<td>' + (n > 1 ? '<button class="btn sm ghost danger" data-action="delEtapa:' + i + '" aria-label="Remover etapa ' + (i + 1) + '">' + ic('x') + '</button>' : '') + '</td></tr>').join('');
      const tin = (m, i, k, x, nome) => '<td><input class="num-in" inputmode="decimal" data-path="teste.tk.' + m + '.' + i + '.' + k + '" value="' + esc(x[k]) + '" placeholder="' + (k === 'e' ? '0,00' : '0,00e-4') + '" aria-label="' + (k === 't' ? 'T' : 'Erro') + ' ' + nome + ' etapa ' + (i + 1) + '"></td>';
      const tk = [['theis', 'Theis'], ['jacob', 'Jacob'], ['hantush', 'Hantush']].map(([m, nome]) =>
        '<tr class="sep"><td colspan="5">' + nome + '</td></tr>' +
        (r.teste.tk[m] || []).map((x, i) => '<tr><td class="ro">' + (i + 1) + 'ª etapa</td>' + tin(m, i, 't', x, nome) + '<td class="out calc">' + out('?metodos.' + m + '.rows.' + i + '.K|s3') + '</td>' + tin(m, i, 'e', x, nome) + '<td></td></tr>').join('') +
        '<tr class="sumrow"><td class="ro">Média</td><td class="out">' + out('?metodos.' + m + '.Tm|s3') + '</td><td class="out">' + out('?metodos.' + m + '.Km|s3') + '</td><td class="out">' + out('?metodos.' + m + '.Em|2') + '</td><td></td></tr>').join('') +
        '<tr class="sumrow geral"><td class="ro">Média geral</td><td class="out">' + out('?geral.Tm|s3') + '</td><td class="out">' + out('?geral.Km|s3') + '</td><td class="out">' + out('?geral.Em|2') + '</td><td></td></tr>';
      return head('Poço e teste de bombeamento', 'Construção do poço e os resultados do teste escalonado (Quadros 01 e 02 do laudo).') +
        '<section class="card" id="cardImp"><h3>' + ic('down') + ' Importar ficha do teste de bombeamento</h3><div class="sub">Envie o PDF da ficha (modelo GEOTECH). O app lê o cabeçalho e as leituras de cada etapa, preenche o laudo e calcula T por Jacob, Theis e Hantush. Você confere antes de aplicar.</div>' +
        '<label class="drop" for="upTeste" id="dropTeste">' + ic('file') + '<b>Arraste o PDF aqui ou clique para escolher</b><span>Aceita .pdf (ficha com texto) e .txt/.csv com as mesmas colunas</span></label><input id="upTeste" type="file" accept=".pdf,.txt,.csv,application/pdf,text/plain" hidden>' +
        (imp ? impHtml() : '') + '</section>' +
        (!imp && r.teste.dados && r.teste.dados.etapas ? card('Curvas do teste de bombeamento', 'Leituras da ficha importada. Passe o mouse nos pontos para ver os valores.', chartTeste(r.teste.dados, HL.analisarTeste(r.teste.dados))) : '') +
        card('Construção do poço', null, '<div class="grid">' + fld('poco.profUtil', 'Profundidade útil', { span: 3, dec: 1, suf: 'm' }) + fld('poco.diametro', 'Diâmetro', { span: 3 }) + fld('poco.revestimento', 'Revestimento (tubos e filtros)', { span: 6 }) +
          fld('poco.empresa', 'Empresa que testou o poço', { span: 6 }) + fld('poco.sedeEmpresa', 'Sede da empresa', { span: 6 }) + '</div>') +
        card('Teste de bombeamento', null, '<div class="grid">' + fld('teste.data', 'Data do teste', { span: 3, type: 'date' }) + fld('teste.duracao', 'Duração por etapa', { span: 3, suf: 'h' }) + fld('teste.programa', 'Programa de análise', { span: 6 }) +
          fld('teste.bomba', 'Bomba utilizada', { span: 12, ph: 'marca Hidrax modelo SDX100 de 1.0 CV-380V-Trifásica' }) +
          fld('teste.aquifero', 'Aquífero', { span: 6 }) + fld('teste.espessura', 'Espessura saturada', { span: 3, dec: 1, suf: 'm' }) + '</div>') +
        card('Quadro 01 · Etapas do teste', 'Rebaixamento e capacidade específica são calculados.',
          '<div class="tw"><table class="dt"><thead><tr><th></th><th>N. estático (m)</th><th>N. dinâmico (m)</th><th>Vazão (m³/h)</th><th>Rebaixamento (m)</th><th>Cap. específica</th><th></th></tr></thead><tbody>' + rowsE + '</tbody></table></div>' +
          '<div class="row" style="margin-top:10px"><button class="btn sm" data-action="addEtapa">' + ic('plus') + 'Adicionar etapa</button></div>') +
        card('Quadro 02 · Transmissividade e condutividade', 'Digite T e o erro de cada método (aceita “6,70e-4”). K = T ÷ espessura saturada (' + (num(r.teste.espessura) ? esc(r.teste.espessura) + ' m' : 'preencha a espessura acima') + ') e as médias são calculados. Dá para colar a coluna T inteira de uma planilha.',
          '<div class="tw"><table class="dt"><thead><tr><th></th><th>T (m²/s)</th><th>K (m/s) · calculado</th><th>Erro (%)</th><th></th></tr></thead><tbody>' + tk + '</tbody></table></div>');
    },
    geologia() {
      const r = R();
      const rows = r.geo.unidades.map((u, i) => '<tr>' + ['per', 'un', 'lit'].map(k => '<td><input data-path="geo.unidades.' + i + '.' + k + '" value="' + esc(u[k]) + '" aria-label="' + k + ' linha ' + (i + 1) + '"></td>').join('') +
        '<td><button class="btn sm ghost danger" data-action="delUn:' + i + '" aria-label="Remover linha">' + ic('x') + '</button></td></tr>').join('');
      return head('Geologia', 'Texto do contexto regional e a coluna litoestratigráfica. Esta parte muda conforme a região do poço.') +
        card('Contexto hidrogeológico', 'O código do poço e o nome do local entram sozinhos pelos marcadores {{poco}} e {{do_local}}. Veja abaixo como fica no laudo.', '<div class="grid">' + fld('geo.contexto', 'Texto do item 3.1', { span: 12, type: 'textarea', rows: 5 }) + '<div class="s12 rendered" id="pv-geo-contexto">' + renderedTxt('geo.contexto') + '</div>' + fld('geo.comportamento', 'Comportamento do aquífero', { span: 6, ph: 'semi-confinado a livre' }) + '</div>') +
        card('Litoestratigrafia', 'Pode colar linhas de uma tabela (Período, Unidade, Litologia). Períodos iguais em sequência são mesclados no laudo.', '<div class="tw"><table class="dt"><thead><tr><th>Período</th><th>Unidade litoestratigráfica</th><th>Litologia</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div><div class="row" style="margin-top:10px"><button class="btn sm" data-action="addUn">' + ic('plus') + 'Adicionar linha</button></div>') +
        card('Perfil litológico e construtivo', null, '<div class="grid">' + fld('geo.perfil', 'Texto', { span: 12, type: 'textarea', rows: 4, hint: 'Deixe em branco para omitir o parágrafo.' }) + '<div class="s12 rendered" id="pv-geo-perfil">' + renderedTxt('geo.perfil') + '</div></div>') +
        card('Esboço geológico', null, '<div class="figs">' + figCard('f4', 'Figura 04 · Esboço geológico') + '</div>');
    },
    calculos() {
      const c = C();
      return head('Cálculos', 'Rebaixamento disponível, vazão máxima possível e condições de explotação, pelas mesmas fórmulas do laudo.') +
        card('Rebaixamento disponível (Rd)', 'Rd = PB − SB − NE − VS − I', '<div class="grid">' + fld('hid.PB', 'PB · profundidade da bomba', { span: 4, dec: 1, suf: 'm' }) + fld('hid.SB', 'SB · submergência', { span: 4, dec: 1, suf: 'm' }) + fld('hid.NE', 'NE · nível estático', { span: 4, dec: 1, suf: 'm' }) +
          fld('hid.VS', 'VS · variação sazonal', { span: 4, dec: 1, suf: 'm' }) + fld('hid.I', 'I · interferência', { span: 4, dec: 1, suf: 'm' }) + '</div>') +
        card('Aquífero', null, '<div class="grid">' + fld('hid.rp', 'rp · raio da seção filtrante', { span: 4, dec: 1, suf: 'm' }) + fld('hid.S', 'S · coef. de armazenamento', { span: 4, dec: 1 }) +
          fld('hid.T', 'T · transmissividade (m²/s)', { span: 4, dec: 1, ph: c.Tmedia ? 'média geral: ' + c.Tmedia.toExponential(3).replace('.', ',') : '', hint: 'Em branco usa a média geral do Quadro 02.' }) + '</div>') +
        card('Vazões máximas permissíveis pelo furo e pelo filtro', 'Use quando houver perfil construtivo do poço. Sem ele, o laudo diz que não foram avaliadas.', '<div class="grid">' +
          fld('hid.avaliarFF', 'Avaliar furo e filtro?', { span: 4, type: 'select', options: [['nao', 'Não (sem perfil construtivo)'], ['sim', 'Sim']] }) + '</div>' +
          (R().hid.avaliarFF === 'sim' ? '<div class="grid" style="margin-top:12px">' + fld('hid.rf', 'rf · raio de perfuração', { span: 3, dec: 1, suf: 'm' }) + fld('hid.hs', 'hs · seção filtrante', { span: 3, dec: 1, suf: 'm' }) +
            fld('hid.dfiltro', 'd · diâmetro dos filtros', { span: 3, dec: 1, suf: 'm' }) + fld('hid.Ve', 'Ve · velocidade de entrada', { span: 3, dec: 1, suf: 'm/s' }) + fld('hid.alfa', 'α · área aberta dos filtros', { span: 3, dec: 1, hint: 'Fração: 0,08 = 8%' }) + '</div>' +
            '<div class="stats" style="margin-top:14px"><div class="stat"><div class="k">Qmpfr · pelo furo</div><div class="v">' + out('ff.Qfuro|1') + '<small>m³/h</small></div></div><div class="stat"><div class="k">Qmpf · pelo filtro</div><div class="v">' + out('ff.Qfiltro|1') + '<small>m³/h</small></div></div><div class="stat"><div class="k">vmax = √K / 20</div><div class="v">' + out('ff.vmax|s3') + '<small>m/s</small></div></div></div>' : '')) +
        card('Equação do poço · Sw = B·Q + C·Qⁿ', null, '<div class="grid">' + fld('hid.B', 'B · perdas no aquífero', { span: 3, dec: 1 }) + fld('hid.C', 'C · perdas no poço', { span: 3, dec: 1 }) + fld('hid.n', 'n', { span: 2, dec: 1 }) +
          fld('hid.ef', 'Eficiência', { span: 4, dec: 1, suf: '%', ph: c.efCalc ? 'calculada: ' + fmt(c.efCalc, 1) : '', hint: 'Em branco usa o valor calculado.' }) + '</div>' +
          '<div class="row" style="margin-top:12px"><button class="btn sm" data-action="estimBC">Estimar B e C pelas etapas do teste</button><small>Regressão de Sw/Q contra Q (Jacob). Confira o resultado antes de adotar.</small></div>') +
        card('Explotação', null, '<div class="grid">' + fld('hid.Q', 'Q · vazão de explotação', { span: 4, dec: 1, suf: 'm³/h' }) + fld('hid.horas', 'Bombeamento', { span: 4, dec: 1, suf: 'h/dia' }) + fld('hid.P', 'P · profundidade do poço', { span: 4, dec: 1, suf: 'm', hint: 'Usada no item de condições de explotação.' }) + '</div>') +
        '<section class="card"><h3>Resultados</h3><div class="sub">Atualizam enquanto você digita.</div>' + resultStats(true) + '<div id="warns">' + warnsHtml() + '</div>' + stepsHtml() + '</section>';
    },
    demanda() {
      return head('Demanda e interferência', 'Justificativa do volume solicitado e rebaixamento causado nos poços vizinhos (Quadro 03, método de Cooper-Jacob).') +
        card('Demanda', null, '<div class="grid">' + fld('dem.usos', 'Usos considerados no cálculo', { span: 12, type: 'textarea', rows: 3, ph: 'abastecimento humano e uso doméstico de ... colaboradores, ...' }) + '</div>' +
          '<div class="stats" style="margin-top:14px"><div class="stat hi"><div class="k">Volume por dia</div><div class="v">' + out('Qdia|0') + '<small>m³/dia</small></div></div><div class="stat"><div class="k">Vazão × horas</div><div class="v">' + out('Q|2') + '<small>m³/h × ' + esc(R().hid.horas) + ' h</small></div></div></div>') +
        card('Cadastro de poços vizinhos', null, '<div class="grid">' + fld('interf.raioCadastro', 'Raio pesquisado', { span: 4, dec: 1, suf: 'm' }) + fld('interf.nPocos', 'Poços cadastrados no raio', { span: 4, dec: 1 }) + '</div>') +
        card('Quadro 03 · Rebaixamento por distância', 'Informe as distâncias separadas por espaço. O raio máximo é onde o rebaixamento chega a zero.',
          '<div class="grid">' + fld('interf.raios', 'Distâncias (m)', { span: 8, dec: 1, ph: '100 200 300 400' }) + '</div><div class="tw" style="margin-top:12px"><table class="dt" id="tbInterf"><thead><tr><th>Local</th><th style="text-align:right">Distância (m)</th><th style="text-align:right">Rebaixamento (m)</th></tr></thead><tbody>' + interfRows() + '</tbody></table></div>');
    },
    vulnerabilidade() {
      const r = R(), c = C();
      return head('Vulnerabilidade do aquífero (GOD)', 'Índice = G × O × D. Escolha o tipo na lista ou digite o valor que usa.') +
        '<datalist id="dlG">' + HL.GOD_G.map(x => '<option value="' + x[0] + '">').join('') + '</datalist><datalist id="dlO">' + HL.GOD_O.map(x => '<option value="' + x[0] + '">').join('') + '</datalist>' +
        card('Parâmetros', 'Os valores de referência vêm da tabela de apoio e podem ser alterados.', '<div class="grid">' +
          fld('god.gSel', 'G · tipo de aquífero', { span: 6, list: 'dlG' }) + fld('god.g', 'Valor G', { span: 3, dec: 1 }) + '<div class="s3"></div>' +
          fld('god.oSel', 'O · litologia da zona não saturada', { span: 6, list: 'dlO' }) + fld('god.o', 'Valor O', { span: 3, dec: 1 }) + '<div class="s3"></div>' +
          fld('god.d_dist', 'Distância da água (opcional)', { span: 6, dec: 1, suf: 'm', hint: 'Em branco usa o nível estático (' + fmt(num(r.hid.NE), 2) + ' m).' }) + fld('god.d', 'Valor D', { span: 3, dec: 1, ph: c.godDsug !== null && c.godDsug !== undefined ? 'automático: ' + fmt(c.godDsug, 1) : '', hint: 'Em branco usa a tabela.' }) +
          '<div class="f s3"><span class="lab">Tabela sugere</span><div class="row" style="min-height:38px"><b class="mono" id="dsug">' + (c.godDsug !== null && c.godDsug !== undefined ? fmt(c.godDsug, 1) : '—') + '</b><button class="btn sm" data-action="useD">Usar</button></div></div></div>') +
        '<section class="card"><h3>Resultado</h3><div class="stats" style="margin-top:8px"><div class="stat hi"><div class="k">Índice G × O × D</div><div class="v">' + out('god.idx|2') + '</div></div><div class="stat"><div class="k">Vulnerabilidade</div><div class="v" id="godPill">' + pillHtml(c) + '</div></div></div>' +
        '<div class="alert info" id="godNote" ' + (godNoteTxt(c) ? '' : 'hidden') + '>' + ic('warn') + '<div>' + godNoteTxt(c) + '</div></div></section>';
    },
    qualidade() {
      return head('Qualidade da água', 'Resultado da análise físico-química e bacteriológica anexada ao processo.') +
        card('Laudo de análise', 'Com um certificado só (análise completa), deixe em branco o certificado bacteriológico. Amostra sem número: escreva s/n.', '<div class="grid">' +
          fld('qual.cert', 'Certificado nº · físico-química', { span: 4 }) + fld('qual.amostra', 'Amostra nº', { span: 3, ph: 's/n' }) + fld('qual.data', 'Data da amostra', { span: 5, type: 'date' }) +
          fld('qual.certBac', 'Certificado nº · bacteriológica (se separado)', { span: 4 }) + fld('qual.amostraBac', 'Amostra nº', { span: 3, ph: 's/n' }) + '<div class="s5"></div>' +
          fld('qual.lab', 'Laboratório', { span: 6 }) + fld('qual.sede', 'Sede do laboratório', { span: 6 }) + fld('qual.portaria', 'Norma de potabilidade', { span: 12 }) + '</div>') +
        card('Conclusão da análise', 'Define o parágrafo da seção 4 e a terceira conclusão.', '<div class="grid">' + fld('qual.resultado', 'Resultado', { span: 4, type: 'select', options: [['nao_atende', 'Não atende todos os padrões'], ['atende', 'Atende aos padrões']] }) +
          fld('qual.foraEm', 'Fora do padrão em', { span: 4, type: 'select', options: [['ambos', 'Físico-química e bacteriológica'], ['fq', 'Só físico-química'], ['bac', 'Só bacteriológica']], hint: 'Usado quando não atende.' }) +
          fld('qual.parametros', 'Parâmetros fora do limite', { span: 4, ph: 'Coliformes Totais', hint: 'Usado quando não atende.' }) + '</div>' +
          '<div class="rendered" id="pv-qual" style="margin-top:12px">' + qualPreview() + '</div>');
    },
    textos() {
      const groups = []; HL.TEXTS.forEach(t => { if (!groups.includes(t.grupo)) groups.push(t.grupo); });
      const r = R();
      return head('Textos-base', 'As partes fixas do laudo. Edite o que quiser: a mudança vale para este laudo. Os trechos entre chaves são preenchidos sozinhos.') +
        '<div class="card"><h3>Marcadores disponíveis</h3><div class="sub">Escreva, por exemplo, {{poco}} onde quiser o código do poço.</div><div class="tk">' + HL.TOKENS.map(t => '<code title="' + esc(t[1]) + '">{{' + t[0] + '}}</code>').join('') + '</div></div>' +
        groups.map(g => '<details class="tg"><summary>' + esc(g) + '</summary><div class="in">' + HL.TEXTS.filter(t => t.grupo === g).map(t => {
          const edited = r.txt[t.k] !== undefined;
          return '<div class="f"><label for="tx-' + t.k + '">' + esc(t.label) + (edited ? '<span class="edited">editado</span>' : '') + '</label><textarea id="tx-' + t.k + '" data-path="txt.' + t.k + '" rows="' + Math.min(10, Math.max(3, Math.ceil((edited ? r.txt[t.k] : t.def).length / 95))) + '">' + esc(edited ? r.txt[t.k] : t.def) + '</textarea>' +
            (edited ? '<div><button class="btn sm" data-action="restoreTxt:' + t.k + '">Restaurar texto padrão</button></div>' : '') + '</div>';
        }).join('') + '</div></details>').join('');
    },
    gerar() {
      const r = R(), pend = pending(r), c = C();
      const names = {}; SECTIONS.forEach(s => names[s.id] = s.label);
      const list = pend.length ? pend.map(p => '<li class="no">' + ic('warn') + '<span><a data-go="' + p.s + '">' + esc(p.l) + '</a> <small>· ' + names[p.s] + '</small></span></li>').join('') : '<li class="ok">' + ic('check') + 'Todos os campos principais estão preenchidos.</li>';
      return head('Gerar relatório', 'Confira a prévia e baixe o laudo em Word editável ou em PDF.') +
        card('Antes de gerar', pend.length ? 'Campos em branco aparecem como “—” no relatório. Você pode gerar assim mesmo e completar depois no Word.' : null, '<ul class="check">' + list + '</ul>' + (c.warn.length ? '<div id="warns2">' + warnsHtml() + '</div>' : '')) +
        '<div class="row"><button class="btn pri" data-action="docx">' + ic('down') + 'Baixar Word (.docx)</button><button class="btn" data-action="pdf">' + ic('down') + 'Baixar PDF</button><button class="btn ghost" data-action="refreshPrev">Atualizar prévia</button><small>Abre a janela “Salvar como” para escolher a pasta no computador.</small></div>' +
        '<div class="paper" id="paper">' + blocksToHtml(HL.buildBlocks(r, c)) + '</div>';
    }
  };

  // ---------- importação da ficha do teste ----------
  let imp = null;
  const br = (v, d) => v === null || v === undefined || !isFinite(v) ? '' : fmt(v, d).replace(/\./g, '');
  const sciIn = v => v === null || v === undefined || !isFinite(v) ? '' : v.toExponential(2).replace('.', ',');
  const hhmm = min => min ? String(Math.floor(min / 60)).padStart(2, '0') + ':' + String(Math.round(min % 60)).padStart(2, '0') : '';
  const MET = [['theis', 'Theis'], ['jacob', 'Jacob'], ['hantush', 'Hantush']];
  async function readFicha(file) {
    let pages;
    if (/\.pdf$/i.test(file.name) || file.type === 'application/pdf') {
      if (!window.pdfjsLib) throw new Error('leitor de PDF não carregou');
      const doc = await window.pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      pages = [];
      for (let i = 1; i <= doc.numPages; i++) pages.push(HL.pdfLines((await (await doc.getPage(i)).getTextContent()).items));
    } else { // texto: separa as etapas onde aparecer "ETAPA:"
      const lines = (await file.text()).split(/\r?\n/).map(l => l.replace(/[;\t]/g, ' '));
      pages = [[]]; lines.forEach(l => { if (/ETAPA\s*:/i.test(l) && pages[pages.length - 1].some(x => /\d,\d/.test(x))) pages.push([]); pages[pages.length - 1].push(l); });
    }
    const f = HL.parseFicha(pages);
    if (!f || !f.etapas.some(e => e.pts.length)) throw new Error('não encontrei as leituras de tempo e nível');
    return f;
  }
  function buildImport(f, fileName) {
    const m = f.meta, r = R();
    const bomba = [m.marca ? 'marca ' + m.marca : '', m.modelo ? 'modelo ' + m.modelo : '', m.potencia ? 'de ' + br(m.potencia, m.potencia % 1 ? 1 : 0) + ' CV' : ''].filter(Boolean).join(' ');
    const aq = m.aquifero ? (/^aqu[ií]fero/i.test(m.aquifero) ? m.aquifero : 'Aquífero ' + m.aquifero) : '';
    const fields = [
      ['g.poco', 'Código do poço', m.poco], ['g.local', 'Local', m.local], ['g.municipio', 'Município', m.municipio], ['g.uf', 'UF', m.uf],
      ['poco.profUtil', 'Profundidade útil (m)', br(m.prof, 2)], ['hid.P', 'Profundidade do poço P (m)', br(m.prof, 2)], ['poco.diametro', 'Diâmetro', m.diametro ? m.diametro + '”' : ''],
      ['poco.empresa', 'Empresa que testou', m.empresa], ['teste.data', 'Data do teste', m.data], ['teste.duracao', 'Duração por etapa', hhmm(m.tempo)],
      ['teste.bomba', 'Bomba', bomba], ['teste.aquifero', 'Aquífero', aq], ['hid.PB', 'Posição da bomba PB (m)', br(m.crivo, 2)], ['hid.NE', 'Nível estático NE (m)', br(m.NE, 3)]
    ].filter(x => x[2]).map(([p, l, v]) => ({ p, l, v, on: true }));
    const an = HL.analisarTeste(f), use = {};
    MET.forEach(([k]) => use[k] = an.some(a => a[k] && a[k].T));
    return { f, an, fields, use, nome: fileName, etapas: true };
  }
  function impHtml() {
    const r = R(), cur = p => { const v = get(r, p); return v === undefined || v === null ? '' : p === 'teste.data' && v ? dateBR(v) : String(v); };
    const rowsF = imp.fields.map((x, i) => '<tr><td><input type="checkbox" data-impf="' + i + '"' + (x.on ? ' checked' : '') + ' aria-label="Usar ' + esc(x.l) + '"></td><td>' + esc(x.l) + '</td><td class="muted">' + esc(cur(x.p) || '—') + '</td><td><b>' + esc(x.p === 'teste.data' ? dateBR(x.v) : x.v) + '</b></td></tr>').join('');
    const cell = a => a && a.T ? plainSci(a.T, 2) + '<small> · erro ' + fmt(a.erro, 2) + '%</small>' : '<small class="muted">' + esc(a && a.nota ? a.nota : '—') + '</small>';
    const rowsE = imp.f.etapas.map((e, i) => { const a = imp.an[i];
      return '<tr><td class="ro">' + e.etapa + 'ª</td><td class="mono">' + br(e.NE, 3) + '</td><td class="mono">' + br(e.ND, 3) + '</td><td class="mono">' + br(e.Q, 2) + '</td><td class="mono">' + e.pts.length + '</td>' + MET.map(([k]) => '<td>' + cell(a[k]) + '</td>').join('') + '</tr>'; }).join('');
    return '<div class="imp"><div class="imph">' + ic('check') + 'Lido de <b>' + esc(imp.nome) + '</b>: ' + imp.f.etapas.length + ' etapa(s), ' + imp.f.etapas.reduce((s, e) => s + e.pts.length, 0) + ' leituras.</div>' +
      '<div class="tw"><table class="dt"><thead><tr><th></th><th>Campo</th><th>Hoje no laudo</th><th>Lido da ficha</th></tr></thead><tbody>' + rowsF + '</tbody></table></div>' +
      '<h4 class="imp-t">Etapas e transmissividade calculada</h4><div class="tw"><table class="dt"><thead><tr><th>Etapa</th><th>NE (m)</th><th>ND (m)</th><th>Q (m³/h)</th><th>Leituras</th>' + MET.map(([k, n]) => '<th><label class="chk"><input type="checkbox" data-impm="' + k + '"' + (imp.use[k] ? ' checked' : '') + '> ' + n + '</label></th>').join('') + '</tr></thead><tbody>' + rowsE + '</tbody></table></div>' +
      '<h4 class="imp-t">Curvas do teste</h4>' + chartTeste(imp.f, imp.an) +
      '<p class="note">Cada etapa é analisada com o acréscimo de vazão (ΔQ) e o rebaixamento acima do nível do fim da etapa anterior. Marque os métodos que vão para o Quadro 02. O erro é o desvio médio quadrático do ajuste.</p>' +
      '<div class="row"><button class="btn pri" data-action="impApply">' + ic('check') + 'Aplicar ao laudo atual</button><button class="btn" data-action="impNew">' + ic('newdoc') + 'Criar laudo novo com estes dados</button><button class="btn ghost" data-action="impCancel">Descartar</button></div></div>';
  }
  // gráfico semilog: rebaixamento s (m) × tempo (min, log), uma série por etapa + reta de Jacob tracejada
  const SERIE = ['#2a6fb0', '#b07a1f', '#0f9483']; // validadas (daltonismo e contraste) no fundo claro
  function chartTeste(f, an) {
    const ets = (f && f.etapas || []).filter(e => e.pts && e.pts.length); if (!ets.length) return '';
    const W = 680, H = 300, L = 54, Rr = 16, T = 14, B = 42, pw = W - L - Rr, ph = H - T - B;
    const ser = ets.map((e, i) => ({ e, a: an[i] || {}, c: SERIE[i % SERIE.length], pts: e.pts.filter(p => p[0] > 0).map(([t, nd]) => [t, nd - e.NE]) }));
    const tMax = Math.max(...ser.flatMap(s => s.pts.map(p => p[0]))), x1 = Math.max(1, Math.ceil(Math.log10(tMax)));
    const sMax = Math.max(0.1, ...ser.flatMap(s => s.pts.map(p => p[1])));
    const step = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20].find(v => sMax / v <= 6) || 50, yTop = Math.ceil(sMax / step) * step;
    const X = t => L + Math.log10(Math.max(t, 1)) / x1 * pw, Y = s => T + ph - Math.max(0, s) / yTop * ph;
    let g = '';
    for (let d = 0; d <= x1; d++) { // grade logarítmica
      const xx = X(Math.pow(10, d)); g += '<line x1="' + xx + '" y1="' + T + '" x2="' + xx + '" y2="' + (T + ph) + '" class="gl"/><text x="' + xx + '" y="' + (T + ph + 16) + '" class="tx" text-anchor="middle">' + fmt(Math.pow(10, d), 0) + '</text>';
      if (d < x1) for (let k = 2; k < 10; k++) { const xm = X(k * Math.pow(10, d)); g += '<line x1="' + xm + '" y1="' + T + '" x2="' + xm + '" y2="' + (T + ph) + '" class="gm"/>'; }
    }
    for (let v = 0; v <= yTop + 1e-9; v += step) g += '<line x1="' + L + '" y1="' + Y(v) + '" x2="' + (L + pw) + '" y2="' + Y(v) + '" class="gl"/><text x="' + (L - 8) + '" y="' + (Y(v) + 4) + '" class="tx" text-anchor="end">' + fmt(v, step < 1 ? 1 : 0) + '</text>';
    g += '<text x="' + (L + pw / 2) + '" y="' + (H - 4) + '" class="tx ax" text-anchor="middle">Tempo desde o início da etapa (min, escala log)</text><text transform="translate(13 ' + (T + ph / 2) + ') rotate(-90)" class="tx ax" text-anchor="middle">Rebaixamento s (m)</text>';
    ser.forEach(s => {
      const j = s.a.jacob;
      if (j && j.T) { // reta de Jacob no trecho usado, somada ao nível do fim da etapa anterior
        const sv = t => s.a.sPrev + j.my + j.ds * (Math.log10(t) - j.mx), ta = j.tIni, tb = j.tFim;
        g += '<line x1="' + X(ta / 60) + '" y1="' + Y(sv(ta)) + '" x2="' + X(tb / 60) + '" y2="' + Y(sv(tb)) + '" stroke="' + s.c + '" class="jl"/>';
      }
      g += '<polyline points="' + s.pts.map(p => X(p[0]) + ',' + Y(p[1])).join(' ') + '" stroke="' + s.c + '" class="sl"/>';
      g += s.pts.map(p => '<g class="pt"><circle cx="' + X(p[0]) + '" cy="' + Y(p[1]) + '" r="9" class="hit"/><circle cx="' + X(p[0]) + '" cy="' + Y(p[1]) + '" r="4" fill="' + s.c + '" class="mk"/><title>' + s.e.etapa + 'ª etapa · t = ' + fmt(p[0], 0) + ' min · s = ' + fmt(p[1], 3) + ' m</title></g>').join('');
    });
    const leg = ser.map(s => '<span><i style="background:' + s.c + '"></i>' + s.e.etapa + 'ª etapa · Q = ' + fmt(s.e.Q, 2) + ' m³/h</span>').join('') + '<span><i class="dash"></i>reta de Jacob (trecho usado)</span>';
    const tab = '<details class="calc"><summary>Ver as leituras em tabela</summary><div class="tw"><table class="dt"><thead><tr><th>Etapa</th><th>t (min)</th><th>ND (m)</th><th>s (m)</th></tr></thead><tbody>' +
      ser.map(s => s.pts.map(p => '<tr><td class="ro">' + s.e.etapa + 'ª</td><td class="mono">' + fmt(p[0], 0) + '</td><td class="mono">' + fmt(p[1] + s.e.NE, 3) + '</td><td class="mono">' + fmt(p[1], 3) + '</td></tr>').join('')).join('') + '</tbody></table></div></details>';
    return '<figure class="chart"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Rebaixamento em função do tempo, por etapa do teste">' + g + '</svg><figcaption class="legend">' + leg + '</figcaption></figure>' + tab;
  }

  function applyImport(r) {
    imp.fields.filter(x => x.on).forEach(x => { set(r, x.p, x.v); if (MEMO.includes(x.p)) remember(x.p, x.v, r); });
    const ets = imp.f.etapas;
    r.teste.etapas = ets.map(e => ({ ne: br(e.NE, 3), nd: br(e.ND, 3), q: br(e.Q, 2) }));
    MET.forEach(([k]) => { r.teste.tk[k] = ets.map((e, i) => { const a = imp.an[i][k]; return imp.use[k] && a && a.T ? { t: sciIn(a.T), e: br(a.erro, 2) } : { t: '', e: '' }; }); });
    r.teste.dados = imp.f;
    const c = HL.compute(r);
    if (c.regress && !String(r.hid.B).trim() && !String(r.hid.C).trim()) { r.hid.B = String(Number(c.regress.B.toPrecision(4))).replace('.', ','); r.hid.C = String(Number(c.regress.C.toPrecision(4))).replace('.', ','); }
    imp = null; store.current = r.id; touch(); persist(true); render();
    toast('Ficha aplicada. Confira os Quadros 01 e 02 e a equação do poço.');
  }
  async function onFicha(file) {
    if (!file) return;
    setStatus('Lendo a ficha…');
    try { imp = buildImport(await readFicha(file), file.name); if (view !== 'poco') go('poco'); else render(); const ci = $('#cardImp'); if (ci) ci.scrollIntoView({ block: 'start' }); setStatus('Ficha lida: confira e aplique'); }
    catch (err) { console.error(err); setStatus('Não consegui ler a ficha', true); toast('Não consegui ler essa ficha: ' + (err.message || 'formato desconhecido') + '. Se for PDF escaneado (imagem), envie o PDF original ou a planilha.', true); }
  }

  function qualPreview() {
    const r = R(), k = String(r.qual.certBac || '').trim() ? 'qual2' : 'qual1', v = HL.makeVars(r, C());
    return '<span class="lab">Como fica no laudo</span>' + rich(HL.render(r.txt[k] !== undefined ? r.txt[k] : HL.TEXT_BY_KEY[k].def, v)) + '<br><br>' + rich('- ' + v.qualConclusao);
  }
  function renderedTxt(p) {
    const t = get(R(), p); if (!t || !String(t).trim()) return '';
    return '<span class="lab">Como fica no laudo</span>' + rich(HL.render(t, HL.makeVars(R(), C())));
  }

  // ---------- peças de resultado ----------
  function resultStats(full) {
    const c = C();
    const S = (k, spec, unit, hi) => '<div class="stat' + (hi ? ' hi' : '') + '"><div class="k">' + k + '</div><div class="v">' + out(spec) + '<small>' + unit + '</small></div></div>';
    return '<div class="stats">' + S('Rebaixamento disponível', 'Rd|2', 'm', full) + S('Vazão máx. possível', 'Qmpo|2', 'm³/h', full) + S('Rebaixamento em Q', 'Sw|2', 'm') + S('Nível dinâmico', 'ND|2', 'm') + S('Capacidade específica', 'qesp|3', '(m³/h)/m') + S('Eficiência', 'ef|1', '%') + S('T adotado', 'T|s3', 'm²/s') + S('Volume diário', 'Qdia|0', 'm³/dia') + '</div>';
  }
  function warnsHtml() { return C().warn.map(w => '<div class="alert">' + ic('warn') + '<div>' + esc(w) + '</div></div>').join(''); }
  function stepsHtml() {
    const r = R(), c = C(), h = r.hid, f = (v, d) => fmt(num(v), d);
    const a = '<details class="calc"><summary>Ver a conta do rebaixamento disponível</summary><pre id="st1">' + esc(stepRd()) + '</pre></details>';
    return a + '<details class="calc"><summary>Ver a conta da vazão máxima possível</summary><pre id="st2">' + esc(stepQ()) + '</pre></details>' + '<details class="calc"><summary>Ver a conta da explotação</summary><pre id="st3">' + esc(stepSw()) + '</pre></details>';
  }
  function stepRd() { const h = R().hid, c = C(), f = (v) => fmt(num(v), 2); return 'Rd = PB − SB − NE − VS − I\nRd = ' + f(h.PB) + ' − ' + f(h.SB) + ' − ' + f(h.NE) + ' − ' + f(h.VS) + ' − ' + f(h.I) + '\nRd = ' + fmt(c.Rd, 2) + ' m'; }
  function stepQ() {
    const h = R().hid, c = C(); if (c.Qmpo === null) return 'Preencha PB, NE, rp, S, T e as horas de bombeamento. A vazão só existe se Rd for positivo.';
    const arg = 2.25 * c.T * c.t / (num(h.rp) * num(h.rp) * num(h.S));
    return 'Qmpo = T·Sw / (0,183 · log[2,25·T·t / (rp²·S)])\nT = ' + plainSci(c.T, 3) + ' m²/s   Sw = ' + fmt(c.Rd, 2) + ' m   t = ' + fmt(c.t, 0) + ' s\nrp = ' + fmt(num(h.rp), 3) + ' m   S = ' + fmt(num(h.S), 4) + '\nlog[…] = log(' + arg.toExponential(3).replace('.', ',') + ') = ' + fmt(Math.log10(arg), 4) + '\nQmpo = ' + fmt(c.Qmpo / 3600 * 1000, 4) + ' L/s = ' + fmt(c.Qmpo, 2) + ' m³/h';
  }
  function stepSw() {
    const c = C(); if (c.Sw === undefined) return 'Preencha B, C e a vazão de explotação.';
    return 'Sw = B·Q + C·Qⁿ\nSw = ' + fmt(c.B, 4) + ' × ' + fmt(c.Q, 2) + ' + ' + fmt(c.C, 6) + ' × ' + fmt(c.Q, 2) + '^' + c.n + '\nSw = ' + fmt(c.BQ, 3) + ' + ' + fmt(c.CQn, 3) + ' = ' + fmt(c.Sw, 2) + ' m\nND = NE + Sw = ' + fmt(c.ND, 2) + ' m\nq = Q / Sw = ' + fmt(c.qesp, 3) + ' (m³/h)/m';
  }
  function interfRows() {
    const c = C(); let h = '';
    (c.interf || []).forEach((x, i) => h += '<tr><td>Raio ' + (i + 1) + '</td><td class="out">' + out('interf.' + i + '.r|2') + '</td><td class="out">' + out('interf.' + i + '.s|2') + '</td></tr>');
    if (c.rmax !== null && c.rmax !== undefined) h += '<tr class="sumrow"><td>Raio máximo</td><td class="out">' + out('rmax|2') + '</td><td class="out">0,00</td></tr>';
    return h || '<tr><td colspan="3" class="ro" style="text-align:left">Preencha T, S, vazão e horas de bombeamento.</td></tr>';
  }
  function pillHtml(c) { return c.god.classe ? '<span class="pill ' + c.god.classe + '">' + c.god.classe.charAt(0) + c.god.classe.slice(1).toLowerCase() + '</span>' : '—'; }
  function godNoteTxt(c) {
    if (c.godDsug === null || c.godDsug === undefined || c.god.D === null || Math.abs(c.god.D - c.godDsug) < 0.001) return '';
    return 'Para ' + fmt(c.god.depth, 2) + ' m, a tabela de apoio sugere D = ' + fmt(c.godDsug, 1) + ', mas o valor informado é ' + fmt(c.god.D, 1) + '. Mantive o seu valor.';
  }

  // ---------- painel lateral ao vivo ----------
  function liveHtml() {
    const c = C(), r = R(), p = pending(r);
    const S = (k, spec, unit, hi) => '<div class="stat' + (hi ? ' hi' : '') + '"><div class="k">' + k + '</div><div class="v">' + out(spec) + '<small>' + unit + '</small></div></div>';
    return '<h3>Resumo ao vivo</h3><div class="stats">' + S('Rd', 'Rd|2', 'm', 1) + S('Qmpo', 'Qmpo|2', 'm³/h', 1) + S('Sw', 'Sw|2', 'm') + S('ND', 'ND|2', 'm') + S('Cap. esp.', 'qesp|2', 'm³/h/m') + S('Raio máx.', 'rmax|0', 'm') + '</div>' +
      '<div style="margin:14px 0 6px"><span class="lab">Vulnerabilidade GOD</span></div><div id="livePill">' + pillHtml(c) + ' <span class="mono" style="margin-left:6px">' + out('god.idx|2') + '</span></div>' +
      '<div id="liveWarn" style="margin-top:12px">' + warnsHtml() + '</div>' +
      '<div style="margin-top:14px" class="lab">' + (p.length ? p.length + ' campo(s) em branco' : 'Tudo preenchido') + '</div>';
  }

  // ---------- consultas ----------
  let q = { text: '', mun: '', sort: 'recent', folder: '' };
  const STATUS = [['rascunho', 'Rascunho'], ['revisao', 'Em revisão'], ['concluido', 'Concluído']];
  const statusPill = s => { const x = STATUS.find(y => y[0] === s) || STATUS[0]; return '<span class="st ' + x[0] + '">' + x[1] + '</span>'; };
  const folderName = id => { const f = store.folders.find(x => x.id === id); return f ? f.nome : ''; };
  function listItems() {
    let list = store.reports.slice();
    const t = q.text.trim().toLowerCase();
    if (t) list = list.filter(r => [r.g.poco, r.g.local, r.g.interessado, r.g.municipio, r.g.art, folderName(r.pasta)].join(' ').toLowerCase().includes(t));
    if (q.mun) list = list.filter(r => r.g.municipio === q.mun);
    if (q.folder === '_sem') list = list.filter(r => !r.pasta || !folderName(r.pasta)); else if (q.folder) list = list.filter(r => r.pasta === q.folder);
    list.sort((a, b) => q.sort === 'poco' ? (a.g.poco || '').localeCompare(b.g.poco || '') : q.sort === 'mun' ? (a.g.municipio || '').localeCompare(b.g.municipio || '') : b.atualizado - a.atualizado);
    const fopts = r => '<option value="">Sem pasta</option>' + store.folders.map(f => '<option value="' + f.id + '"' + (r.pasta === f.id ? ' selected' : '') + '>' + esc(f.nome) + '</option>').join('');
    return list.map(r => {
      const c = HL.compute(r), cls = c.god.classe;
      return '<div class="item' + (r.id === store.current ? ' cur2' : '') + '" data-open="' + r.id + '" tabindex="0" role="button" aria-label="Abrir ' + esc(r.nome || r.g.poco) + '">' +
        '<div><div class="t">' + esc(r.g.poco || 'Sem código') + (r.exemplo ? '<span class="tag">exemplo</span>' : '') + ' ' + statusPill(r.g.status) + '</div><div class="d">' + esc(r.g.local || '—') + '</div><div class="d">' + esc(r.g.interessado || '') + '</div></div>' +
        '<div><div class="k">Município</div><div>' + esc(r.g.municipio ? r.g.municipio + (r.g.uf ? '-' + r.g.uf : '') : '—') + '</div><div class="d">Laudo: ' + dateBR(r.g.dataLaudo) + '</div></div>' +
        '<div><div class="k">Vazão solicitada</div><div class="mono">' + (c.Q !== null && c.Q !== undefined ? fmt(c.Q, 2) + ' m³/h' : '—') + '</div><div class="d mono">' + (c.Qdia !== null && c.Qdia !== undefined ? fmt(c.Qdia, 0) + ' m³/dia' : '') + '</div></div>' +
        '<div><div class="k">Vulnerabilidade</div>' + (cls ? '<span class="pill ' + cls + '">' + cls.charAt(0) + cls.slice(1).toLowerCase() + '</span>' : '—') + '</div>' +
        '<div class="acts"><label class="mv"><span class="k">Pasta</span><select data-move="' + r.id + '" aria-label="Mover para a pasta">' + fopts(r) + '</select></label><div class="row"><button class="btn sm" data-dup="' + r.id + '">Duplicar</button><button class="btn sm danger" data-del="' + r.id + '">Excluir</button></div></div></div>';
    }).join('');
  }
  function folderNav() {
    const cnt = id => store.reports.filter(r => id === '_sem' ? !r.pasta || !folderName(r.pasta) : !id || r.pasta === id).length;
    const b = (id, nome, extra) => '<button class="fold' + (q.folder === id ? ' on' : '') + '" data-action="pasta:' + id + '">' + ic(id === '' ? 'layers' : 'folder') + '<span>' + esc(nome) + '</span><b>' + cnt(id) + '</b></button>' + (extra || '');
    const cur = store.folders.find(f => f.id === q.folder);
    return '<aside class="folders"><div class="lab">Pastas por cliente</div>' + b('', 'Todos os laudos') + store.folders.slice().sort((a, c) => a.nome.localeCompare(c.nome)).map(f => b(f.id, f.nome)).join('') + b('_sem', 'Sem pasta') +
      '<div class="newf"><input id="novaPasta" placeholder="Nova pasta (nome do cliente)" aria-label="Nome da nova pasta"><button class="btn sm" data-action="novaPasta">' + ic('plus') + 'Criar</button></div>' +
      (cur ? '<div class="row" style="margin-top:8px"><button class="btn sm ghost" data-action="renPasta:' + cur.id + '">Renomear</button><button class="btn sm ghost danger" data-action="delPasta:' + cur.id + '">Excluir pasta</button></div>' : '') + '</aside>';
  }
  function viewConsultas() {
    const muns = Array.from(new Set(store.reports.map(r => r.g.municipio).filter(Boolean))).sort();
    const items = listItems(), fn = q.folder === '_sem' ? 'Sem pasta' : folderName(q.folder);
    return head('Meus laudos', 'Organize os laudos em pastas por cliente. Clique num laudo para abrir; mude a pasta pela lista de cada um.') +
      '<div class="lay2">' + folderNav() + '<div>' +
      '<div class="toolbar"><input class="search" id="qText" type="search" placeholder="Buscar por poço, local, interessado, município, ART ou pasta" value="' + esc(q.text) + '" aria-label="Buscar laudos">' +
      '<select id="qMun" aria-label="Município"><option value="">Todos os municípios</option>' + muns.map(m => '<option' + (m === q.mun ? ' selected' : '') + '>' + esc(m) + '</option>').join('') + '</select>' +
      '<select id="qSort" aria-label="Ordenar"><option value="recent"' + (q.sort === 'recent' ? ' selected' : '') + '>Mais recentes</option><option value="poco"' + (q.sort === 'poco' ? ' selected' : '') + '>Código do poço</option><option value="mun"' + (q.sort === 'mun' ? ' selected' : '') + '>Município</option></select>' +
      '<span style="flex:1"></span><button class="btn pri" data-action="novo">' + ic('plus') + (fn && q.folder !== '_sem' ? 'Novo laudo em “' + esc(fn) + '”' : 'Novo laudo') + '</button></div>' +
      '<div class="list" id="listR">' + (items || '<div class="empty">Nenhum laudo aqui. Ajuste a busca ou crie um novo laudo.</div>') + '</div></div></div>' +
      '<div class="row" style="margin-top:22px"><button class="btn sm" data-action="exportar">' + ic('down') + 'Exportar backup (.json)</button><label class="btn sm" for="imp">Importar backup</label><input id="imp" type="file" accept=".json,application/json" hidden><small>O backup guarda todos os laudos, pastas e imagens. Para cópia automática, veja Configurações.</small></div>';
  }
  function viewApoio() {
    const tg = (rows, h) => '<div class="tw"><table class="dt"><thead><tr>' + h.map(x => '<th>' + x + '</th>').join('') + '</tr></thead><tbody>' + rows.map(r => '<tr>' + r.map((x, i) => '<td' + (i === r.length - 1 ? ' class="ro"' : '') + '>' + esc(x) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
    return head('Tabelas de apoio', 'Valores de referência, fórmulas usadas e um conversor de vazão.') +
      '<div class="alert info">' + ic('warn') + '<div>Valores do método GOD conforme o diagrama de Foster et al. (2002) enviado pelo geólogo. O app aceita qualquer valor digitado. Em rocha fraturada ou cárstica o diagrama indica D = 1,0 para todas as profundidades.</div></div>' +
      '<div class="two">' + card('GOD · G (grau de confinamento)', null, tg(HL.GOD_G.map(x => [x[0], fmt(x[1], 1)]), ['Tipo', 'Valor'])) + card('GOD · O (estratos de cobertura)', null, tg(HL.GOD_O.map(x => [x[0], fmt(x[1], 1)]), ['Litologia', 'Valor'])) +
      card('GOD · D (distância até o nível d’água)', null, tg(HL.GOD_D.map(x => [x[2], fmt(x[1], 1)]), ['Faixa', 'Valor'])) + card('GOD · classes do índice', null, tg([['0,0 a 0,1', 'Nula (insignificante)'], ['0,1 a 0,3', 'Baixa'], ['0,3 a 0,5', 'Moderada (média)'], ['0,5 a 0,7', 'Alta'], ['0,7 a 1,0', 'Extrema']], ['Índice', 'Classe'])) + '</div>' +
      card('Fórmulas usadas no app', null,
        '<div class="lab">Rebaixamento disponível</div><div class="formula">Rd = PB − SB − NE − VS − I</div>' +
        '<div class="lab" style="margin-top:10px">Vazão máxima possível (Cooper-Jacob)</div><div class="formula">Qmpo = T·Sw / (0,183 · log[2,25·T·t / (rp²·S)])</div>' +
        '<div class="lab" style="margin-top:10px">Equação característica do poço</div><div class="formula">Sw = B·Q + C·Qⁿ     ND = NE + Sw     q = Q / Sw</div>' +
        '<div class="lab" style="margin-top:10px">Rebaixamento a uma distância r</div><div class="formula">s(r) = 0,183·Q / T · log[2,25·T·t / (r²·S)]</div>' +
        '<div class="lab" style="margin-top:10px">Raio máximo (s = 0)</div><div class="formula">rmax = √(2,25·T·t / S)</div>' +
        '<div class="lab" style="margin-top:10px">Índice de vulnerabilidade</div><div class="formula">GOD = G × O × D</div>' +
        '<div class="lab" style="margin-top:10px">Condutividade hidráulica</div><div class="formula">K = T / espessura saturada     Média geral = média das médias dos métodos</div>' +
        '<div class="lab" style="margin-top:10px">Vazão máxima permissível pelo furo e pelo filtro</div><div class="formula">Qmpfr = 2·π·rf·hs·vmax, vmax = √K / 20     Qmpf = Ve·π·α·d·hs / 2</div>' +
        '<div class="lab" style="margin-top:10px">Teste de bombeamento (por etapa, com ΔQ e tempo desde o início da etapa)</div><div class="formula">Jacob: T = 0,183·ΔQ / Δs (Δs por ciclo log, metade final do tempo)\nTheis: s = ΔQ/(4πT)·W(u)     Hantush: s = ΔQ/(4πT)·W(u, r/B)</div>') +
      card('Conversor de vazão', 'Digite em qualquer campo.', '<div class="grid"><div class="f s4 num"><label for="cv1">m³/h</label><input id="cv1" data-conv="h" inputmode="decimal"></div><div class="f s4 num"><label for="cv2">L/s</label><input id="cv2" data-conv="s" inputmode="decimal"></div><div class="f s4 num"><label for="cv3">m³/dia (24 h)</label><input id="cv3" data-conv="d" inputmode="decimal"></div></div>');
  }

  const MEMO_LABEL = { 'g.interessado': 'Interessados', 'g.local': 'Locais', 'g.municipio': 'Municípios', 'g.finalidade': 'Finalidades', 'g.orgao': 'Órgãos', 'g.formulario': 'Formulários', 'g.formsAnexos': 'Formulários anexos',
    'g.respNome': 'Responsável técnico', 'g.respTitulo': 'Título profissional', 'g.respRegistro': 'Registro profissional', 'loc.bairro': 'Bairros', 'poco.diametro': 'Diâmetros', 'poco.revestimento': 'Revestimentos',
    'poco.empresa': 'Empresas de teste', 'poco.sedeEmpresa': 'Sedes das empresas', 'teste.bomba': 'Bombas', 'teste.programa': 'Programas', 'teste.aquifero': 'Aquíferos', 'teste.duracao': 'Durações',
    'geo.comportamento': 'Comportamento do aquífero', 'qual.lab': 'Laboratórios', 'qual.sede': 'Sedes dos laboratórios', 'qual.portaria': 'Normas de potabilidade' };
  function viewConfig() {
    const groups = MEMO.filter(p => (store.memo[p] || []).length).map(p => '<div class="mg"><div class="lab">' + esc(MEMO_LABEL[p] || p) + '</div><div class="chips">' +
      store.memo[p].map((v, i) => '<span class="chip">' + esc(v) + '<button data-action="esquecer:' + p + '" data-i="' + i + '" aria-label="Esquecer ' + esc(v) + '">' + ic('x') + '</button></span>').join('') + '</div></div>').join('');
    return head('Configurações', 'Onde os laudos ficam guardados e o que o app já aprendeu com você.') +
      card('Backup automático numa pasta', 'Os laudos ficam no banco deste navegador. Ligando o backup, o app grava também o arquivo hidrolaudo-backup.json numa pasta do computador a cada alteração. Escolha uma pasta do OneDrive para ter cópia na nuvem.',
        '<div class="row">' + (backupDir ? '<span class="st concluido">Ligado</span><span>Pasta: <b>' + esc(backupName) + '</b></span><button class="btn sm" data-action="backupRecon">Reconectar</button><button class="btn sm" data-action="backupDir">Trocar pasta</button>'
          : '<button class="btn pri" data-action="backupDir">' + ic('folder') + 'Escolher pasta de backup</button>') + '</div>' +
        '<p class="note">Ao abrir o app de novo, o navegador pode pedir para reconectar a pasta: clique em “Reconectar” ou no aviso de salvamento no topo. Para levar os laudos a outro computador, use Exportar backup e Importar backup em Meus laudos.</p>') +
      card('Dados lembrados', 'Tudo o que você digita nestes campos vira sugestão (aparece ao clicar no campo). Num laudo novo, o responsável técnico, a empresa, o laboratório, a norma e os parâmetros padrão já vêm do último laudo. Clique no × para esquecer um valor.',
        groups || '<p class="note">Nada ainda. Os valores aparecem aqui conforme você preenche os laudos.</p>');
  }

  // ---------- prévia ----------
  function blocksToHtml(B) {
    let h = '';
    B.forEach(b => {
      switch (b.t) {
        case 'cov': h += '<div class="cov" style="font-size:' + ((b.size || 12) * 1.15) + 'px;margin:' + ((b.before || 0) / 40) + 'px 0 ' + ((b.after || 0) / 40) + 'px">' + rich(b.text) + '</div>'; break;
        case 'pb': h += '<div class="pbr"><span>nova página</span></div>'; break;
        case 'h1': h += '<h4><span>' + esc(b.num) + '</span><span>' + rich(b.text) + '</span></h4>'; break;
        case 'h2': h += '<h5><span>' + esc(b.num) + '</span><span>' + rich(b.text) + '</span></h5>'; break;
        case 'h3': h += '<h6><span>' + esc(b.num) + '</span><span>' + rich(b.text) + '</span></h6>'; break;
        case 'p': h += '<p class="' + (b.center ? 'ct' : b.noIndent ? 'ni' : '') + '"' + (b.before ? ' style="margin-top:' + b.before / 40 + 'px"' : '') + '>' + (b.bold ? '<b>' + rich(b.text) + '</b>' : rich(b.text)) + '</p>'; break;
        case 'li': h += '<div class="li">' + rich(b.text) + '</div>'; break;
        case 'ref': h += '<p class="ni">' + rich(b.text) + '</p>'; break;
        case 'eq': h += '<div class="eq"><span></span><span>' + rich(b.text) + '</span><span>(' + b.n + ')</span></div>'; break;
        case 'kv': h += '<table class="k">' + b.rows.map(r => '<tr>' + r.map(c => '<td>' + rich(c) + '</td>').join('') + '</tr>').join('') + '</table>'; break;
        case 'table': {
          const n = b.head.length;
          const sp = p => (p.rs > 1 ? ' rowspan="' + p.rs + '"' : '') + (p.cs > 1 ? ' colspan="' + p.cs + '"' : '');
          h += (b.caption ? '<div class="cap">' + rich(b.caption) + '</div>' : '') + '<table class="b">' +
            HL.headGrid(b).map(row => '<tr>' + row.cells.filter(p => p.k === 'cell').map(p => '<th' + sp(p) + '>' + rich(p.t) + '</th>').join('') + '</tr>').join('') +
            HL.tableGrid(b).map(row => '<tr>' + row.cells.filter(p => p.k === 'cell').map(p => '<td' + sp(p) +
              ' style="text-align:' + (p.rs > 1 || p.cs > 1 ? 'center' : { l: 'left', c: 'center', r: 'right' }[b.align[p.c]] || 'left') + (p.bold ? ';font-weight:700' : '') + (p.shade ? ';background:#d9d9d9' : '') + '">' + rich(p.t) + '</td>').join('') + '</tr>').join('') + '</table>';
          break;
        }
        case 'fig': h += (b.img ? '<img alt="' + esc(b.caption) + '" src="' + b.img + '">' : '<div class="phold">[ inserir imagem – ' + esc(b.caption.split(' – ')[0]) + ' ]</div>') + '<div class="figc">' + rich(b.caption) + (b.fonte ? '<small>' + esc(b.fonte) + '</small>' : '') + '</div>'; break;
        case 'sig': h += '<div class="sig">_______________________________________<br><b>' + esc(b.nome || '') + '</b><br>' + esc(b.titulo || '') + '<br>' + esc(b.registro || '') + '</div>'; break;
      }
    });
    return h;
  }

  // ---------- navegação e renderização ----------
  let view = 'consultas';
  function render() {
    const shell = $('#shell'); const editor = SECTIONS.some(s => s.id === view);
    reqMiss = new Set(REQ.filter(([s, p]) => isEmpty(R(), p)).map(x => x[1]));
    shell.classList.toggle('no-live', !editor || view === 'textos' || view === 'gerar');
    shell.classList.toggle('no-foot', !editor);
    const mainEl = $('#main'); mainEl.classList.toggle('home', view === 'inicio');
    const memoLists = MEMO.filter(p => (store.memo[p] || []).length).map(p => '<datalist id="m-' + p.replace(/\./g, '-') + '">' + store.memo[p].map(v => '<option value="' + esc(v) + '">').join('') + '</datalist>').join('');
    mainEl.innerHTML = (view === 'inicio' ? viewInicio() : '<div class="wrap">' + (view === 'consultas' ? viewConsultas() : view === 'apoio' ? viewApoio() : view === 'config' ? viewConfig() : (VIEWS[view] || VIEWS.dados)()) + '</div>') + memoLists;
    renderNav(); renderLive(); renderFoot();
    $('#main').scrollTop = 0;
  }
  function renderNav() {
    const r = R(), pend = pending(r), by = {}; pend.forEach(p => by[p.s] = (by[p.s] || 0) + 1);
    const btn = (id, label, icon, badge) => '<button class="navbtn" data-go="' + id + '"' + (view === id ? ' aria-current="page"' : '') + '>' + ic(icon) + '<span class="lbl">' + label + '</span>' + (badge || '') + '</button>';
    $('#navlist').innerHTML = btn('inicio', 'Início', 'home') + '<div class="grp">Consultas</div>' + btn('consultas', 'Meus laudos', 'folder', '<span class="badge n">' + store.reports.length + '</span>') + btn('apoio', 'Tabelas de apoio', 'book') + btn('config', 'Configurações', 'gear') +
      '<div class="grp">Laudo em edição</div><div class="cur">' + esc(r.nome || 'Novo laudo') + '</div>' +
      SECTIONS.map(s => btn(s.id, s.label, s.icon, ['textos', 'gerar'].includes(s.id) ? '' : (by[s.id] ? '<span class="badge" title="campos em branco">' + by[s.id] + '</span>' : '<span class="badge ok" title="completo">✓</span>'))).join('');
  }
  function renderLive() { $('#live').innerHTML = liveHtml(); }
  function renderFoot() {
    const r = R();
    $('#foot').innerHTML = '<div class="grow">' + esc(r.nome || 'Novo laudo') + '</div><button class="btn" data-action="save">' + ic('save') + 'Salvar</button><button class="btn" data-go="gerar">Prévia</button><button class="btn" data-action="pdf">' + ic('down') + 'Gerar PDF</button><button class="btn pri" data-action="docx">' + ic('down') + 'Gerar Word</button>';
  }
  function go(id) { if (location.hash !== '#' + id) location.hash = id; else { view = id; render(); } }
  function fromHash() { const h = (location.hash || '').slice(1); view = (['inicio', 'consultas', 'apoio', 'config'].includes(h) || SECTIONS.some(s => s.id === h)) ? h : 'inicio'; render(); }

  // atualização leve enquanto digita
  function refresh() {
    $$('[data-out]').forEach(el => { const t = O(el.dataset.out); if (el.textContent !== t) el.textContent = t; });
    renderLive(); renderNav();
    const w = $('#warns'); if (w) w.innerHTML = warnsHtml();
    const tb = $('#tbInterf tbody'); if (tb) { tb.innerHTML = interfRows(); }
    if ($('#st1')) { $('#st1').textContent = stepRd(); $('#st2').textContent = stepQ(); $('#st3').textContent = stepSw(); }
    const gp = $('#godPill'); if (gp) { gp.innerHTML = pillHtml(C()); const n = $('#godNote'); const t = godNoteTxt(C()); n.hidden = !t; n.lastElementChild.textContent = t; const ds = $('#dsug'); if (ds) ds.textContent = C().godDsug ? fmt(C().godDsug, 1) : '—'; }
    $$('.f.miss').forEach(f => { const i = f.querySelector('[data-path]'); if (i && i.value.trim()) f.classList.remove('miss'); });
    ['geo.contexto', 'geo.perfil'].forEach(p => { const el = $('#pv-' + p.replace('.', '-')); if (el) el.innerHTML = renderedTxt(p); });
    const pq = $('#pv-qual'); if (pq) pq.innerHTML = qualPreview();
    renderFoot();
  }

  // ---------- eventos ----------
  function onInput(e) {
    const el = e.target, p = el.dataset && el.dataset.path;
    if (el.id === 'gSearch') { q.text = el.value; if (view !== 'consultas') { go('consultas'); } else refreshList(); return; }
    if (el.id === 'qText') { q.text = el.value; const g = $('#gSearch'); if (g) g.value = el.value; refreshList(); return; }
    if (el.dataset && el.dataset.conv) return conv(el);
    if (!p) return;
    const r = R();
    if (p.startsWith('txt.')) { const k = p.slice(4); if (el.value === HL.TEXT_BY_KEY[k].def) delete r.txt[k]; else r.txt[k] = el.value; }
    else set(r, p, el.value);
    if (e.type === 'change' || el.tagName === 'INPUT' && el.list) {
      if (p === 'god.gSel') { const m = HL.GOD_G.find(x => x[0].toLowerCase() === el.value.toLowerCase()); if (m) { r.god.gSel = m[0]; r.god.g = String(m[1]).replace('.', ','); const g = $('#f-god-g'); if (g) g.value = r.god.g; } }
      if (p === 'god.oSel') { const m = HL.GOD_O.find(x => x[0].toLowerCase() === el.value.toLowerCase()); if (m) { r.god.oSel = m[0]; r.god.o = String(m[1]).replace('.', ','); const o = $('#f-god-o'); if (o) o.value = r.god.o; } }
    }
    let rerender = false;
    if (e.type === 'change') {
      if (MEMO.includes(p)) remember(p, el.value, r);
      // código do poço trocado: troca também nos textos livres que ainda trazem o código antigo
      if (p === 'g.poco' && focusVal && focusVal.trim().length >= 3 && focusVal !== el.value && el.value.trim()) {
        const old = focusVal.trim(), rep = s => typeof s === 'string' ? s.split(old).join(el.value.trim()) : s;
        let n = 0; const sw = (o, k) => { const v = rep(o[k]); if (v !== o[k]) { o[k] = v; n++; } };
        sw(r.geo, 'contexto'); sw(r.geo, 'perfil'); sw(r.loc, 'acesso'); Object.keys(r.txt).forEach(k => sw(r.txt, k));
        if (n) toast('Código do poço atualizado também em ' + n + ' texto(s).');
        focusVal = el.value;
      }
      if (p === 'teste.espessura' || p === 'pasta' || p === 'hid.avaliarFF') rerender = true;
    }
    touch(); if (rerender) render(); else refresh(); persist();
  }
  let focusVal = null;
  function refreshList(full) { if (full) return render(); const l = $('#listR'); if (l) l.innerHTML = listItems() || '<div class="empty">Nenhum laudo aqui. Ajuste a busca ou crie um novo laudo.</div>'; }
  function conv(el) {
    const v = num(el.value); const set3 = (h, s, d) => { $('#cv1').value = h === null ? '' : fmt(h, 3).replace(/\./g, ''); $('#cv2').value = s === null ? '' : fmt(s, 3).replace(/\./g, ''); $('#cv3').value = d === null ? '' : fmt(d, 2).replace(/\./g, ''); };
    const keep = el.dataset.conv; if (v === null) return;
    const h = keep === 'h' ? v : keep === 's' ? v * 3.6 : v / 24;
    const vals = { h: h, s: h / 3.6, d: h * 24 };
    ['h', 's', 'd'].forEach((k, i) => { if (k !== keep) $('#cv' + (i + 1)).value = fmt(vals[k], k === 'd' ? 2 : 3).replace(/\./g, ''); });
  }
  async function onClick(e) {
    if (e.target.closest('.item .mv')) return; // lista de pasta dentro do cartão não abre o laudo
    const t = e.target.closest('[data-action],[data-go],[data-open],[data-dup],[data-del]'); if (!t) return;
    const r = R();
    if (t.dataset.go) { e.preventDefault(); return go(t.dataset.go); }
    if (t.dataset.dup) { e.stopPropagation(); const src = store.reports.find(x => x.id === t.dataset.dup); const cp = JSON.parse(JSON.stringify(src)); cp.id = HL.blank().id; cp.exemplo = false; cp.criado = cp.atualizado = Date.now(); cp.g.poco = (cp.g.poco || '') + ' (cópia)'; cp.nome = cp.g.poco + (cp.g.local ? ' · ' + cp.g.local : ''); store.reports.unshift(cp); persist(true); render(); toast('Laudo duplicado.'); return; }
    if (t.dataset.del) { e.stopPropagation(); if (t.dataset.arm !== '1') { t.dataset.arm = '1'; t.textContent = 'Confirmar?'; setTimeout(() => { if (t.isConnected) { t.dataset.arm = ''; t.textContent = 'Excluir'; } }, 3000); return; }
      store.reports = store.reports.filter(x => x.id !== t.dataset.del); if (!store.reports.length) store.reports.push(HL.blank()); if (!R()) store.current = store.reports[0].id; persist(true); render(); toast('Laudo excluído.'); return; }
    if (t.dataset.open) { store.current = t.dataset.open; calcCache = null; persist(true); return go('dados'); }
    const [act, arg] = (t.dataset.action || '').split(':');
    switch (act) {
      case 'novo': { const n = newReport(); if (view === 'consultas' && q.folder && q.folder !== '_sem') n.pasta = q.folder; store.reports.unshift(n); store.current = n.id; calcCache = null; persist(true); go('dados'); break; }
      case 'save': persist(true); toast('Laudo salvo.'); break;
      case 'addEtapa': r.teste.etapas.push({ ne: '', nd: '', q: '' }); ['theis', 'jacob', 'hantush'].forEach(m => r.teste.tk[m].push({ t: '', k: '', e: '' })); touch(); persist(); render(); break;
      case 'delEtapa': r.teste.etapas.splice(+arg, 1); ['theis', 'jacob', 'hantush'].forEach(m => r.teste.tk[m].splice(+arg, 1)); touch(); persist(); render(); break;
      case 'addUn': r.geo.unidades.push({ per: '', un: '', lit: '' }); touch(); persist(); render(); break;
      case 'delUn': r.geo.unidades.splice(+arg, 1); touch(); persist(); render(); break;
      case 'delFig': r.figs[arg] = { fonte: r.figs[arg].fonte || '' }; touch(); persist(); render(); break;
      case 'restoreTxt': delete r.txt[arg]; touch(); persist(); render(); break;
      case 'useD': { const c = C(); if (c.godDsug !== null && c.godDsug !== undefined) { r.god.d = String(c.godDsug).replace('.', ','); touch(); persist(); render(); } break; }
      case 'estimBC': { const c = C(); if (!c.regress) { toast('Preencha as etapas do teste para estimar.', true); break; } r.hid.B = String(Number(c.regress.B.toPrecision(4))).replace('.', ','); r.hid.C = String(Number(c.regress.C.toPrecision(4))).replace('.', ','); touch(); persist(); render(); toast('B e C estimados. Confira antes de adotar.'); break; }
      case 'refreshPrev': { $('#paper').innerHTML = blocksToHtml(HL.buildBlocks(R(), C())); toast('Prévia atualizada.'); break; }
      case 'docx': case 'pdf': await generate(act, t); break;
      case 'impApply': applyImport(r); break;
      case 'impNew': { const n = newReport(); n.pasta = r.pasta || ''; store.reports.unshift(n); applyImport(n); break; }
      case 'impCancel': imp = null; render(); break;
      case 'importar': go('poco'); setTimeout(() => { const u = $('#upTeste'); if (u) u.click(); }, 60); break;
      case 'backupDir': await backupChoose(); break;
      case 'backupRecon': await backupReconnect(); break;
      case 'novaPasta': { const i = $('#novaPasta'), nome = i && i.value.trim(); if (!nome) { toast('Digite o nome da pasta (cliente).', true); break; }
        const f = { id: 'p' + Date.now().toString(36), nome }; store.folders.push(f); q.folder = f.id; persist(true); render(); toast('Pasta “' + nome + '” criada.'); break; }
      case 'pastaInt': { const nome = (r.g.interessado || '').trim(); if (!nome) { toast('Preencha o interessado primeiro.', true); break; }
        let f = store.folders.find(x => x.nome.toLowerCase() === nome.toLowerCase()); if (!f) { f = { id: 'p' + Date.now().toString(36), nome }; store.folders.push(f); }
        r.pasta = f.id; touch(); persist(true); render(); toast('Laudo guardado na pasta “' + f.nome + '”.'); break; }
      case 'pasta': q.folder = arg || ''; refreshList(true); break;
      case 'renPasta': { const f = store.folders.find(x => x.id === arg); const nome = f && window.prompt('Novo nome da pasta:', f.nome); if (nome && nome.trim()) { f.nome = nome.trim(); persist(true); render(); } break; }
      case 'delPasta': { const f = store.folders.find(x => x.id === arg); if (!f) break;
        if (t.dataset.arm !== '1') { t.dataset.arm = '1'; t.textContent = 'Confirmar?'; setTimeout(() => { if (t.isConnected) { t.dataset.arm = ''; t.textContent = 'Excluir pasta'; } }, 3000); break; }
        store.folders = store.folders.filter(x => x.id !== arg); store.reports.forEach(x => { if (x.pasta === arg) x.pasta = ''; }); q.folder = ''; persist(true); render(); toast('Pasta excluída. Os laudos dela foram para “Sem pasta”.'); break; }
      case 'esquecer': { const [p, i] = [arg, +t.dataset.i]; if (store.memo[p]) { store.memo[p].splice(i, 1); persist(true); render(); } break; }
      case 'exportar': { const bytes = new TextEncoder().encode(JSON.stringify(store)); await saveFile('hidrolaudo-backup.json', bytes, 'application/json'); break; }
    }
  }
  // ---------- colar tabelas (Ctrl+V de planilha, Word ou PDF) ----------
  const PASTE_COLS = [
    [/^teste\.etapas\.(\d+)\.(\w+)$/, ['ne', 'nd', 'q']],
    [/^teste\.tk\.(?:theis|jacob|hantush)\.(\d+)\.(\w+)$/, ['t', 'e']],
    [/^geo\.unidades\.(\d+)\.(\w+)$/, ['per', 'un', 'lit']]
  ];
  // "09°35'05,58"S 35°45'52,94"W" → graus, minutos, segundos, hemisfério
  function parseCoords(t) {
    const re = /(\d{1,3})\s*[°º:\s]\s*(\d{1,2})\s*['’′:\s]\s*(\d{1,2}(?:[.,]\d+)?)\s*["”″]?\s*([NSLOEW])?/gi, out = []; let m;
    while ((m = re.exec(t)) && out.length < 2) out.push(m);
    return out.length === 2 ? out : null;
  }
  function onPaste(e) {
    const el = e.target, p = el.dataset && el.dataset.path; if (!p) return;
    const text = (e.clipboardData || window.clipboardData).getData('text'); if (!text) return;
    const r = R();
    if (p.startsWith('loc.lat') || p.startsWith('loc.lon')) {
      const cs = parseCoords(text); if (!cs) return;
      e.preventDefault();
      const hem = (h, def) => !h ? def : /S/i.test(h) ? 'Sul' : /N/i.test(h) ? 'Norte' : /[OW]/i.test(h) ? 'Oeste' : 'Leste';
      [['lat', cs[0], 'Sul'], ['lon', cs[1], 'Oeste']].forEach(([k, m, def]) => { r.loc[k + 'G'] = m[1].padStart(2, '0'); r.loc[k + 'M'] = m[2].padStart(2, '0'); r.loc[k + 'S'] = m[3].replace('.', ','); r.loc[k + 'Hem'] = hem(m[4], def); });
      touch(); persist(); render(); toast('Coordenadas preenchidas.'); return;
    }
    if (!/[\t\n]/.test(text.trim())) return; // um valor só: colagem normal
    const grid = text.replace(/\r/g, '').split('\n').filter(l => l.trim()).map(l => l.split('\t').map(x => x.trim()));
    const spec = PASTE_COLS.find(([re]) => re.test(p));
    e.preventDefault();
    if (spec) {
      const [, i0, k0] = spec[0].exec(p), cols = spec[1], c0 = cols.indexOf(k0), base = p.slice(0, p.indexOf('.' + i0 + '.' + k0));
      grid.forEach((row, a) => {
        const i = +i0 + a, list = get(r, base);
        while (list.length <= i) {
          if (base === 'teste.etapas') { r.teste.etapas.push({ ne: '', nd: '', q: '' }); MET.forEach(([m]) => r.teste.tk[m].push({ t: '', e: '' })); }
          else if (base === 'geo.unidades') r.geo.unidades.push({ per: '', un: '', lit: '' });
          else return;
        }
        row.forEach((v, b) => { const k = cols[c0 + b]; if (k && list[i]) list[i][k] = v; });
      });
    } else { // campos comuns: distribui pelos próximos campos da mesma seção, na ordem da tela
      const scope = el.closest('.card') || document, inputs = $$('[data-path]', scope).filter(x => x.tagName !== 'BUTTON');
      const vals = grid.flat(); let i = inputs.indexOf(el);
      vals.forEach(v => { const inp = inputs[i++]; if (inp && !inp.dataset.path.startsWith('txt.')) set(r, inp.dataset.path, v); });
    }
    touch(); persist(); render(); toast('Dados colados.');
  }

  async function onFile(e) {
    const el = e.target;
    if (el.id === 'upTeste') { const f = el.files[0]; el.value = ''; return onFicha(f); }
    if (el.dataset && el.dataset.fig) {
      const f = el.files[0]; if (!f) return;
      try { const img = await readImage(f); const r = R(); r.figs[el.dataset.fig] = Object.assign(r.figs[el.dataset.fig] || {}, img); touch(); persist(); render(); }
      catch (err) { toast('Não consegui ler essa imagem. Tente um arquivo JPG ou PNG.', true); }
    }
    if (el.id === 'imp') {
      const f = el.files[0]; if (!f) return;
      try { const j = JSON.parse(await f.text()); if (!j.reports || !Array.isArray(j.reports)) throw new Error('formato'); const ids = new Set(store.reports.map(x => x.id)); let n = 0; j.reports.forEach(x => { if (!ids.has(x.id)) { store.reports.push(x); n++; } }); load2(); persist(true); render(); toast(n + ' laudo(s) importado(s).'); }
      catch (err) { toast('Arquivo de backup inválido.', true); }
    }
  }
  function load2() { store.reports = store.reports.map(r => Object.assign(fill(HL.blank(), r), { id: r.id, criado: r.criado, atualizado: r.atualizado, exemplo: r.exemplo, nome: r.nome, pasta: r.pasta || '', txt: r.txt || {}, figs: Object.assign(fill(HL.blank().figs, r.figs), r.figs), teste: Object.assign(fill(HL.blank().teste, r.teste), { dados: (r.teste || {}).dados || null }) })); }
  function readImage(file) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => {
        const img = new Image();
        img.onload = () => {
          const max = 1600; let w = img.naturalWidth, h = img.naturalHeight; const k = Math.min(1, max / Math.max(w, h)); w = Math.round(w * k); h = Math.round(h * k);
          const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.drawImage(img, 0, 0, w, h);
          res({ data: cv.toDataURL('image/jpeg', 0.85), w, h });
        };
        img.onerror = rej; img.src = fr.result;
      };
      fr.onerror = rej; fr.readAsDataURL(file);
    });
  }

  // ---------- geração ----------
  function fname(ext) {
    const r = R(), base = ('Laudo_' + (r.g.poco || 'poco') + '_' + (r.g.local || 'local')).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '');
    return base + '.' + ext;
  }
  async function saveFile(filename, bytes, mime) {
    let dl = null;
    try { dl = window.claude && window.claude.use ? await window.claude.use('downloads') : null; } catch (e) { dl = null; }
    if (dl) {
      try { await dl.save({ filename, data: bytes }); toast('Arquivo pronto: ' + filename); }
      catch (err) { const code = err && err.code; toast(code === 'declined' ? 'Download cancelado.' : code === 'host_unavailable' ? 'Este aparelho não salva arquivos daqui. Abra no computador.' : 'Não foi possível baixar (' + (code || 'erro') + ').', code !== 'declined'); }
      return;
    }
    // Chrome/Edge: janela "Salvar como" para escolher a pasta (lembra a última pasta usada)
    if (window.showSaveFilePicker) {
      const ext = filename.split('.').pop();
      try {
        const fh = await window.showSaveFilePicker({ id: 'laudos', suggestedName: filename, types: [{ description: ext === 'pdf' ? 'PDF' : ext === 'docx' ? 'Documento do Word' : 'Backup', accept: { [mime]: ['.' + ext] } }] });
        const w = await fh.createWritable(); await w.write(new Blob([bytes], { type: mime })); await w.close();
        toast('Salvo no computador: ' + fh.name); return;
      } catch (e) { if (e.name === 'AbortError') { toast('Download cancelado.'); return; } /* segue para o download comum */ }
    }
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([bytes], { type: mime })); a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    toast('Arquivo baixado para a pasta Downloads: ' + filename);
  }
  async function generate(kind, btn) {
    const r = R(), c = C(), prev = btn.innerHTML; btn.disabled = true; btn.textContent = 'Gerando…';
    try {
      const blocks = HL.buildBlocks(r, c);
      if (kind === 'docx') await saveFile(fname('docx'), HL.buildDocx(blocks), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      else {
        if (!window.PDFLib) { toast('O gerador de PDF não carregou. Gere o Word e salve como PDF.', true); }
        else await saveFile(fname('pdf'), await HL.buildPdf(blocks, window.PDFLib), 'application/pdf');
      }
    } catch (err) { console.error(err); toast('Erro ao gerar o relatório: ' + (err && err.message ? err.message : 'tente novamente'), true); }
    btn.disabled = false; btn.innerHTML = prev;
  }

  // ---------- início ----------
  async function init() {
    await load(); await backupInit();
    document.addEventListener('input', onInput);
    document.addEventListener('change', e => {
      const d = e.target.dataset || {};
      if (e.target.type === 'file') onFile(e);
      else if (e.target.id === 'qMun') { q.mun = e.target.value; refreshList(); }
      else if (e.target.id === 'qSort') { q.sort = e.target.value; refreshList(); }
      else if (d.move) { const r = store.reports.find(x => x.id === d.move); if (r) { r.pasta = e.target.value; persist(true); refreshList(true); toast(e.target.value ? 'Laudo movido para “' + folderName(e.target.value) + '”.' : 'Laudo sem pasta.'); } }
      else if (d.impf !== undefined) { if (imp) imp.fields[+d.impf].on = e.target.checked; }
      else if (d.impm) { if (imp) imp.use[d.impm] = e.target.checked; }
      else onInput(e);
    });
    document.addEventListener('click', onClick);
    document.addEventListener('paste', onPaste);
    document.addEventListener('focusin', e => { if (e.target.dataset && e.target.dataset.path === 'g.poco') focusVal = e.target.value; });
    document.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.dataset && e.target.dataset.open) { e.preventDefault(); e.target.click(); } });
    // arrastar a ficha para a área de importação (ou para qualquer lugar da aba Poço e teste)
    document.addEventListener('dragover', e => { if (view === 'poco' && e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files')) { e.preventDefault(); const d = $('#dropTeste'); if (d) d.classList.add('over'); } });
    document.addEventListener('dragleave', e => { const d = $('#dropTeste'); if (d && !e.relatedTarget) d.classList.remove('over'); });
    document.addEventListener('drop', e => { if (view !== 'poco' || !e.dataTransfer || !e.dataTransfer.files.length) return; e.preventDefault(); onFicha(e.dataTransfer.files[0]); });
    $('#status').addEventListener('click', () => { if (backupDir) backupReconnect(); });
    window.addEventListener('hashchange', fromHash);
    fromHash(); setStatus(backupDir ? 'Salvo · backup na pasta “' + backupName + '”' : 'Salvo neste computador');
    window.__HL_APP = { store: () => store, go };
  }
  init();
})();
