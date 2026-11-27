// Teste no navegador (Playwright + Chromium). Uso: node e2e.js "caminho da ficha.pdf"
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const ficha = process.argv[2];
(async () => {
  const browser = await chromium.launch({ channel: 'msedge' }).catch(() => chromium.launch({ channel: 'chrome' }));
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await ctx.addInitScript(() => { delete window.showSaveFilePicker; }); // usa o download comum no teste
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push('PAGEERR ' + e.message)); page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.route('**/fonts.googleapis.com/**', r => r.abort()); await page.route('**/fonts.gstatic.com/**', r => r.abort());
  await page.goto('file:///' + path.join(__dirname, 'out', 'index.html').replace(/\\/g, '/'));
  await page.waitForSelector('.hero');
  const shot = n => page.screenshot({ path: 'out/s_' + n + '.png', fullPage: false });
  await shot('inicio');

  // 1) importar ficha num laudo novo
  await page.click('[data-action="novo"]'); await page.waitForTimeout(200);
  await page.evaluate(() => location.hash = 'poco'); await page.waitForTimeout(200);
  await page.setInputFiles('#upTeste', ficha);
  await page.waitForSelector('.imp', { timeout: 60000 });
  await shot('import');
  console.log('gráfico na conferência:', await page.locator('.imp .chart svg circle.mk').count(), 'pontos');
  await page.click('[data-action="impApply"]'); await page.waitForTimeout(300);
  const ch = page.locator('.chart').first(); await ch.scrollIntoViewIfNeeded(); await ch.screenshot({ path: 'out/s_grafico.png' });
  const et = await page.evaluate(() => { const r = window.__HL_APP.store().reports.find(x => x.id === window.__HL_APP.store().current); return { poco: r.g.poco, etapas: r.teste.etapas, jacob: r.teste.tk.jacob, NE: r.hid.NE, PB: r.hid.PB, B: r.hid.B, bomba: r.teste.bomba }; });
  console.log('importado:', JSON.stringify(et));
  // 2) espessura e K automático
  await page.fill('#f-teste-espessura', '25'); await page.locator('#f-teste-espessura').blur(); await page.waitForTimeout(200);
  console.log('K etapa 1 Jacob:', await page.textContent('[data-out="?metodos.jacob.rows.0.K|s3"]'), ' média geral T:', await page.textContent('[data-out="?geral.Tm|s3"]'));
  await shot('poco');
  // 3) colar tabela no Quadro 01 (3 linhas × 3 colunas)
  await page.focus('[data-path="teste.etapas.0.ne"]');
  await page.evaluate(() => { const dt = new DataTransfer(); dt.setData('text/plain', '10,0\t11,0\t5,0\n10,0\t12,0\t8,0\n10,0\t13,5\t11,0\n10,0\t15,0\t14,0'); document.activeElement.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })); });
  await page.waitForTimeout(200);
  console.log('após colar:', JSON.stringify(await page.evaluate(() => { const s = window.__HL_APP.store(); return s.reports.find(x => x.id === s.current).teste.etapas; })));
  // 4) coordenadas coladas de uma vez
  await page.evaluate(() => location.hash = 'localizacao'); await page.waitForTimeout(200);
  await page.focus('#f-loc-latG');
  await page.evaluate(() => { const dt = new DataTransfer(); dt.setData('text/plain', '09°32\'04,31"S 35°45\'44,89"W'); document.activeElement.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })); });
  await page.waitForTimeout(200);
  console.log('coordenadas:', JSON.stringify(await page.evaluate(() => { const s = window.__HL_APP.store(); const l = s.reports.find(x => x.id === s.current).loc; return [l.latG, l.latM, l.latS, l.latHem, l.lonG, l.lonM, l.lonS, l.lonHem]; })));
  await shot('localizacao');
  // 5) pasta do cliente
  await page.evaluate(() => location.hash = 'consultas'); await page.waitForTimeout(200);
  await page.fill('#novaPasta', 'ENGENHARQ LTDA'); await page.click('[data-action="novaPasta"]'); await page.waitForTimeout(200);
  await shot('consultas');
  // 6) código do poço trocado reflete nos textos
  await page.evaluate(() => location.hash = 'dados'); await page.waitForTimeout(200);
  await page.fill('#f-g-poco', 'JCC-01'); await page.locator('#f-g-poco').blur(); await page.waitForTimeout(200);
  await page.evaluate(() => location.hash = 'geologia'); await page.waitForTimeout(200);
  console.log('prévia geologia contém JCC-01:', (await page.textContent('#pv-geo-contexto')).includes('JCC-01'));
  for (const v of ['calculos', 'vulnerabilidade', 'config', 'apoio']) { await page.evaluate(i => location.hash = i, v); await page.waitForTimeout(200); await shot(v); }
  // 7) gerar Word e PDF do laudo de exemplo
  await page.evaluate(() => { const s = window.__HL_APP.store(); s.current = s.reports.find(r => r.exemplo).id; location.hash = 'gerar'; });
  await page.waitForTimeout(300); await shot('gerar');
  let [d] = await Promise.all([page.waitForEvent('download'), page.click('.wrap [data-action="docx"]')]);
  await d.saveAs('out/app.docx'); console.log('docx', d.suggestedFilename(), fs.statSync('out/app.docx').size);
  [d] = await Promise.all([page.waitForEvent('download'), page.click('.wrap [data-action="pdf"]')]);
  await d.saveAs('out/app.pdf'); console.log('pdf', d.suggestedFilename(), fs.statSync('out/app.pdf').size);
  // 8) recarregar: dados persistem (IndexedDB)
  await page.reload(); await page.waitForSelector('.nav'); await page.waitForTimeout(400);
  console.log('após recarregar:', JSON.stringify(await page.evaluate(() => { const s = window.__HL_APP.store(); return { laudos: s.reports.length, pastas: s.folders.map(f => f.nome), memo: Object.keys(s.memo).length }; })));
  console.log('erros:', errs.length ? errs : 'nenhum');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
