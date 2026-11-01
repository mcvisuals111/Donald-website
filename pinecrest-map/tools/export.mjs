// Frame-accurate export: Puppeteer renders every frame at an exact time,
// then ffmpeg encodes the PNG sequence.
//
//   npm run export                -> out/pinecrest-speed-map.mp4        (H.264, 1920x1080, 30 fps)
//                                    out/pinecrest-speed-map_prores4444.mov
//   npm run export:alpha          -> out/pinecrest-speed-map_alpha_prores4444.mov
//                                    (map hidden, overlays only, transparent background)
//
// Options:  --alpha  --out <dir>  --from <sec> --to <sec>  --keep-frames
// Env:      CHROME_PATH=/path/to/chrome   FFMPEG=/path/to/ffmpeg
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { startServer } from './serve.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };

const ALPHA = flag('--alpha');
const OUT = path.resolve(ROOT, opt('--out', 'out'));
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const NAME = 'pinecrest-speed-map';
const framesDir = path.join(OUT, ALPHA ? 'frames_alpha' : 'frames');

fs.rmSync(framesDir, { recursive: true, force: true });
fs.mkdirSync(framesDir, { recursive: true });

const server = await startServer(0);
const port = server.address().port;

const browser = await puppeteer.launch({
  headless: true,
  executablePath: process.env.CHROME_PATH || undefined,
  args: [
    '--no-sandbox', '--hide-scrollbars', '--ignore-gpu-blocklist',
    '--use-angle=swiftshader', '--enable-unsafe-swiftshader', // WebGL without a GPU
    '--force-color-profile=srgb', '--font-render-hinting=none',
  ],
  defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
  protocolTimeout: 600000,
});

try {
  const page = await browser.newPage();
  page.on('console', (m) => { const t = m.text(); if (/^\[(map|layout|boot)\]/.test(t)) console.log('  page:', t); });
  page.on('pageerror', (e) => console.error('  page error:', e.message));

  const url = `http://127.0.0.1:${port}/index.html?export=1${ALPHA ? '&alpha=1' : ''}`;
  console.log(`Loading ${url}`);
  await page.goto(url, { waitUntil: 'load', timeout: 120000 });
  console.log('Preloading tiles...');
  await page.evaluate(() => window.__anim.ready);
  const { fps, duration, width, height } = await page.evaluate(() => {
    const c = window.__anim.config; return { fps: c.fps, duration: c.duration, width: c.width, height: c.height };
  });

  const total = Math.round(duration * fps);
  const from = Math.max(0, Math.round(parseFloat(opt('--from', '0')) * fps));
  const to = Math.min(total, Math.round(parseFloat(opt('--to', String(duration))) * fps));
  console.log(`Rendering frames ${from}..${to - 1} (${to - from} @ ${fps} fps, ${width}x${height})`);

  const t0 = Date.now();
  for (let f = from; f < to; f++) {
    await page.evaluate((t) => window.__anim.renderAt(t), f / fps);
    await page.screenshot({
      path: path.join(framesDir, `${String(f - from).padStart(5, '0')}.png`),
      type: 'png',
      omitBackground: ALPHA,
      clip: { x: 0, y: 0, width, height },
    });
    if ((f - from) % 15 === 0 || f === to - 1) {
      const pct = (((f - from + 1) / (to - from)) * 100).toFixed(0);
      process.stdout.write(`\r  frame ${f + 1}/${total}  ${pct}%  (${((Date.now() - t0) / 1000).toFixed(0)}s)   `);
    }
  }
  process.stdout.write('\n');

  const run = (outFile, codecArgs) => {
    const a = ['-y', '-v', 'error', '-framerate', String(fps), '-i', path.join(framesDir, '%05d.png'), ...codecArgs, '-r', String(fps), outFile];
    const r = spawnSync(FFMPEG, a, { stdio: 'inherit' });
    if (r.status !== 0) throw new Error(`ffmpeg failed for ${outFile}`);
    console.log(`  wrote ${path.relative(ROOT, outFile)}`);
  };
  const prores = (pix) => ['-c:v', 'prores_ks', '-profile:v', '4', '-pix_fmt', pix, '-vendor', 'apl0', '-bits_per_mb', '8000'];

  console.log('Encoding...');
  if (ALPHA) {
    run(path.join(OUT, `${NAME}_alpha_prores4444.mov`), prores('yuva444p10le'));
  } else {
    run(path.join(OUT, `${NAME}.mp4`), [
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p',
      '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-movflags', '+faststart',
    ]);
    run(path.join(OUT, `${NAME}_prores4444.mov`), prores('yuv444p10le'));
  }
  if (!flag('--keep-frames')) fs.rmSync(framesDir, { recursive: true, force: true });
} finally {
  await browser.close();
  server.close();
}
