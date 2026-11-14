// Usage: node snap.js outDir t1 t2 ...  — renders individual frames as PNG
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path');
(async () => {
  const [out, ...ts] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type()==='error' && errs.push(m.text()));
  await p.goto('file://' + path.resolve(__dirname, 'graphic.html') + '?capture');
  await p.evaluate(() => window.ready);
  for (const t of ts) {
    await p.evaluate(t => window.render(t), +t);
    await p.screenshot({ path: `${out}/t${(+t).toFixed(2).padStart(6,'0')}.png` });
  }
  if (errs.length) console.log('ERRORS', errs);
  await b.close();
})();
