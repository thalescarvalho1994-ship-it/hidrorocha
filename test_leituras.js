// Ficha escaneada da WX Poços (poço MBR-05), leituras digitadas: confere leitura, análise e textos de etapa única.
require('./src/calc.js'); require('./src/teste.js'); require('./src/report.js');
const HL = globalThis.HL;
const txt = `0:01 02,29\n0:02 02,36\n0:03 02,39\n0:04 02,44\n0:05 02,47\n0:06 02,49\n0:08 02,50\n0:10 02,52\n0:12 02,53\n0:14 02,54
0:16 02,55\n0:18 02,56\n0:20 02,57\n0:25 02,58\n0:30 02,59 2.500\n0:35 02,60\n0:40 02,60\n0:45 02,61\n0:50 02,62\n0:55 02,61
1:00 02,62 2.500\n1:10 02,63\n1:20 02,64\n1:30 02,65\n1:40 02,65\n1:50 02,64\n2:00 02,66 2.500\n3:00 02,66\n4:00 02,66\n6:00 02,66\n12:00 02,66\n24:00 02,66 2.500`;
const f = HL.parseLeituras(txt, { NE: 2.0, Q: null, unidade: 'Lh' });
const e = f.etapas[0];
console.log('etapas', f.etapas.length, 'leituras', e.pts.length, 'Q (m³/h)', e.Q, 'ND final', e.ND, 'último t (min)', e.pts[e.pts.length - 1][0]);
const a = HL.analisarTeste(f)[0];
['jacob', 'theis', 'hantush'].forEach(m => console.log(m, a[m].T ? 'T=' + a[m].T.toExponential(3) + ' erro=' + a[m].erro.toFixed(2) : a[m].nota));
const r = HL.sample(); r.teste.etapas = [{ ne: '2,00', nd: '2,66', q: '2,50' }];
const B = HL.buildBlocks(r, HL.compute(r));
console.log(B.filter(b => /realizado em|ensaio de bombeamento|medidos durante/i.test(b.text || '')).map(b => b.text.slice(0, 190)).join('\n'));
const ok = f.etapas.length === 1 && e.Q === 2.5 && e.pts.length === 32 && e.pts[e.pts.length - 1][0] === 1440;
console.log(ok ? 'ok' : 'FALHA'); if (!ok) process.exit(1);
