// Renders graphic.html to video, one deterministic frame at a time.
// Usage: node render.js out.mp4 [fps=60]
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const { spawn } = require('child_process');
const path = require('path');
(async () => {
  const out = process.argv[2] || 'out.mp4';
  const fps = +(process.argv[3] || 60);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, 'graphic.html') + '?capture');
  await p.evaluate(() => window.ready);
  const dur = await p.evaluate(() => window.__data.DURATION);
  const N = Math.round(dur * fps);
  const ff = spawn('ffmpeg', ['-loglevel','error','-y','-f','image2pipe','-framerate', fps===60?'60000/1001':String(fps),'-c:v','png','-i','-',
    '-c:v','libx264','-preset','slow','-crf','12','-pix_fmt','yuv420p','-profile:v','high','-tune','animation',
    '-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-movflags','+faststart', out], { stdio: ['pipe','inherit','inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < N; f++) {
    await p.evaluate(t => window.render(t), f / fps);
    const buf = await p.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 120 === 0) console.log(`frame ${f}/${N}  ${((Date.now()-t0)/1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  if (errs.length) console.log('PAGE ERRORS', errs);
  await b.close();
  console.log('done', out, N, 'frames');
})();
