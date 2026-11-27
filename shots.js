// Capturas de tela das abas principais para revisão visual: node shots.js [pasta]
const { chromium } = require('playwright');
const path = require('path');
const dir = process.argv[2] || path.join(__dirname, 'out', 'shots');
require('fs').mkdirSync(dir, { recursive: true });
(async () => {
  const b = await chromium.launch({ channel: 'msedge' });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const url = 'file:///' + path.join(__dirname, 'out', 'index.html').replace(/\\/g, '/');
  await p.goto(url);
  await p.waitForTimeout(600);
  // Carrega o exemplo para as telas terem conteúdo
  const ex = await p.$('[data-action="exemplo"]'); if (ex) { await ex.click(); await p.waitForTimeout(300); }
  for (const v of (process.argv[3] || 'inicio,consultas,dados,localizacao,teste,calculos,vulnerabilidade,gerar,config').split(',')) {
    await p.evaluate(v => { location.hash = v; }, v);
    await p.waitForTimeout(500);
    await p.screenshot({ path: path.join(dir, v + '.png') });
  }
  await p.setViewportSize({ width: 1280, height: 720 });
  await p.evaluate(() => { location.hash = 'inicio'; });
  await p.waitForTimeout(400);
  await p.screenshot({ path: path.join(dir, 'inicio-1280.png') });
  await b.close();
})();
