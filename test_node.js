// Testes sem navegador: cálculos conferidos com o laudo JCC-01 e geração de Word/PDF. Uso: node test_node.js
require('./src/calc.js'); require('./src/teste.js'); require('./src/report.js'); require('./src/docx.js'); require('./src/pdf.js');
const HL = globalThis.HL, fs = require('fs'), PDFLib = require('pdf-lib');
let fail = 0;
const near = (nome, v, ref, tol) => { const ok = v !== null && v !== undefined && Math.abs(v - ref) <= tol; if (!ok) fail++; console.log((ok ? 'ok   ' : 'FALHA') + ' ' + nome + ': ' + v + ' (esperado ' + ref + ')'); };

// dados do laudo JCC-01 (estudo completo enviado pelo geólogo)
const r = HL.blank();
Object.assign(r.g, { interessado: 'ENGENHARQ LTDA', local: 'Residencial Jardins', poco: 'JCC-01', municipio: 'Maceió', dataLaudo: '2026-10-29' });
r.teste.espessura = '25';
r.teste.etapas = [{ ne: '39,60', nd: '40,21', q: '9,90' }, { ne: '39,60', nd: '40,54', q: '15,84' }, { ne: '39,60', nd: '41,15', q: '20,486' }];
r.teste.tk = { theis: [{ t: '', e: '' }, { t: '', e: '' }, { t: '', e: '' }],
  jacob: [{ t: '1,65e-2', e: '0,21' }, { t: '6,36e-2', e: '0,44' }, { t: '4,44e-2', e: '0,51' }],
  hantush: [{ t: '8,24e-4', e: '7,29' }, { t: '', e: '' }, { t: '', e: '' }] };
Object.assign(r.hid, { PB: '75', SB: '1', NE: '39,60', VS: '1', I: '1', B: '0,03961', C: '0,001586', Q: '25', horas: '20', P: '76',
  avaliarFF: 'sim', rf: '0,156', hs: '26', dfiltro: '0,152' });
r.god.d_dist = '39,6';
const c = HL.compute(r);
near('K Jacob etapa 1 (T/25)', c.metodos.jacob.rows[0].K, 6.6e-4, 1e-9);
near('T média Jacob', c.metodos.jacob.Tm, 4.15e-2, 1e-4);
near('T média geral', c.geral.Tm, 2.116e-2, 1e-5);
near('K média geral', c.geral.Km, 8.465e-4, 1e-6);
near('Theis sem dado → K vazio', c.metodos.theis.rows[0].K === null ? 0 : 1, 0, 0);
near('Sw em 25 m³/h', c.Sw, 1.98, 0.005);
near('ND', c.ND, 41.58, 0.005);
near('q específica', c.qesp, 12.626, 0.01);
near('GOD D para 39,6 m', c.god.D, 0.7, 1e-9);
near('GOD índice', c.god.idx, 0.252, 1e-6);
near('Qmpf filtro (d=0,152)', c.ff.Qfiltro, 53.6, 0.1);
console.log('info Qmpfr furo com K médio:', HL.fmt(c.ff.Qfuro, 1), 'm³/h (o laudo JCC-01 traz 666,9, que sai usando T no lugar de K)');
console.log('info Rd:', c.Rd, ' Qmpo:', HL.fmt(c.Qmpo, 1), ' rmax:', HL.fmt(c.rmax, 2));

// qualidade com dois certificados (como no JCC-01)
Object.assign(r.qual, { cert: '1288/2026', amostra: 's/n', certBac: '5013/2026', amostraBac: 's/n', data: '2026-10-13', lab: 'LAMEM', sede: 'Garanhuns-AL', foraEm: 'bac', parametros: 'Coliformes Totais' });
const B = HL.buildBlocks(r, c), txt = B.map(b => b.text || '').join('\n');
const has = (nome, s) => { const ok = txt.includes(s); if (!ok) fail++; console.log((ok ? 'ok   ' : 'FALHA') + ' ' + nome); };
has('qualidade com dois certificados', 'Certificado n.º 5013/2026 da análise bacteriológica da amostra de água s/n');
has('conclusão só bacteriológica', 'sob o ponto de vista bacteriológico (Coliformes Totais), não atende');
fs.mkdirSync('out', { recursive: true });
fs.writeFileSync('out/teste_jcc.docx', Buffer.from(HL.buildDocx(B)));
const s = HL.sample();
fs.writeFileSync('out/teste_exemplo.docx', Buffer.from(HL.buildDocx(HL.buildBlocks(s, HL.compute(s)))));
(async () => {
  fs.writeFileSync('out/teste_jcc.pdf', Buffer.from(await HL.buildPdf(B, PDFLib)));
  console.log('Word e PDF gerados em out/');
  if (fail) { console.log(fail + ' falha(s)'); process.exit(1); }
})().catch(e => { console.error(e); process.exit(1); });
