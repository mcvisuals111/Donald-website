// Frame-by-frame QA: walks every frame of the timeline and asserts correctness.
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path');
(async () => {
  const fps = 60;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, 'graphic.html') + '?capture');
  await p.evaluate(() => window.ready);
  const res = await p.evaluate((fps) => {
    const D = window.__data, N = Math.round(D.DURATION * fps), problems = [], log = [];
    const EXPECT = [['137,016','Applications reviewed'],['8,517','Failed final audit'],['6,169','Permits canceled'],['670','Suspected fraud cases referred to sheriff']];
    const fail = (f, m) => { if (problems.length < 60) problems.push(`frame ${f} (t=${(f/fps).toFixed(3)}s): ${m}`); };
    // static text
    D.STATS.forEach((s,i)=>{ if(s.value!==EXPECT[i][0]||s.label!==EXPECT[i][1]) fail(-1,`stat ${i} text mismatch`); });
    const src = document.querySelector('#source').textContent.trim();
    if (src !== 'Source: Miami-Dade County Tax Collector, October 20, 2026.') fail(-1, 'source text: '+src);
    const title = [...document.querySelectorAll('.word')].map(w=>w.textContent).join(' ');
    if (title !== 'Disabled Parking Permit Investigation') fail(-1, 'title: '+title);
    // every character cell can only ever show blank or its own final character -> no wrong digit on any frame
    D.cards.forEach((c,i)=>c.cols.forEach((col,j)=>{ const cells=[...col.strip.children].map(d=>d.textContent);
      if (cells.length!==2 || cells[0].trim()!=='' || cells[1]!==EXPECT[i][0][j]) fail(-1, `card ${i} column ${j} can show "${cells.join('|')}"`); }));
    const all = [...document.querySelectorAll('#stage *')];
    let prev = null, firstSeen = [null,null,null,null], readings = {};
    for (let f = 0; f < N; f++) {
      const t = f / fps; window.render(t);
      // 1) nothing fades: every element fully opaque, every frame
      for (const el of all) { const o = getComputedStyle(el).opacity; if (o !== '1') { fail(f, `opacity ${o} on ${el.className||el.id}`); break; } }
      // 2) no NaN / broken style values
      for (const el of all) { const st = el.getAttribute('style')||''; if (/NaN|undefined|Infinity/.test(st)) { fail(f, 'bad style '+st.slice(0,80)); break; } }
      const rects = D.cards.map(c => c.el.style.display==='none' ? null : c.el.getBoundingClientRect());
      D.cards.forEach((c, i) => {
        const r = rects[i]; if (!r) return;
        // 3) cards are born tiny (morph), never pop in at size
        if (firstSeen[i] === null) { firstSeen[i] = f; if (r.width*r.height > 1920*1080*0.01 && i>0) fail(f, `card ${i} appeared at full size ${r.width}x${r.height}`); }
        // 4) cards stay inside the frame
        if (r.left < -1 || r.top < -1 || r.right > 1921 || r.bottom > 1081) fail(f, `card ${i} outside frame`);
        // 5) once the label has fully revealed, content must fit inside its card
        const st = [D.T.statA, D.T.split1+0.32, D.T.split2+0.32, D.T.split3+0.32][i];
        if (t >= st + 1.4) {
          const cr = c.content.getBoundingClientRect(), num = c.el.querySelector('.num').getBoundingClientRect(), lab = c.lab.getBoundingClientRect();
          const right = Math.max(num.right, lab.right);
          if (right > r.right - 40) fail(f, `card ${i} content too close to right edge (${(r.right-right).toFixed(1)}px)`);
          if (cr.top < r.top + 20 || lab.bottom > r.bottom - 20) fail(f, `card ${i} content vertical overflow`);
        }
        // 6) odometer reads the exact value once every column has landed
        const lastCol = c.cols.length - 1, landed = t >= st + D.ROLL_T.delay + lastCol*D.ROLL_T.stagger + D.ROLL_T.dur;
        if (landed) {
          const read = c.cols.map(col => {
            const idx = col.pos;
            const ty = parseFloat(col.strip.style.transform.match(/translateY\((-?[\d.e-]+)px\)/)[1]);
            if (Math.abs(ty - (75 - idx*170 - 85)) > 1e-6) fail(f, `card ${i} strip offset mismatch`);
            // the landed glyph must sit exactly in the window: compare its box to the window box
            const cell = col.strip.children[Math.round(idx)].getBoundingClientRect(), wr = col.win.getBoundingClientRect();
            if (Math.abs((cell.top+cell.bottom)/2 - (wr.top+wr.bottom)/2) > 0.6) fail(f, `card ${i} digit off-centre`);
            if (Math.abs(idx - Math.round(idx)) > 1e-6) fail(f, `card ${i} column not settled (${idx})`);
            if (col.strip.style.filter && col.strip.style.filter !== 'none') fail(f, `card ${i} still blurred after landing`);
            return col.cells[Math.round(idx)];
          }).join('');
          if (read !== EXPECT[i][0]) fail(f, `card ${i} reads "${read}" expected "${EXPECT[i][0]}"`);
          readings[i] = read;
        }
      });
      // 7) cards never overlap each other
      for (let i = 0; i < 4; i++) for (let j = i+1; j < 4; j++) {
        const a = rects[i], c = rects[j]; if (!a || !c) continue;
        const ox = Math.min(a.right, c.right) - Math.max(a.left, c.left), oy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top);
        if (ox > 0.5 && oy > 0.5) fail(f, `cards ${i} and ${j} overlap`);
      }
      // 8) continuity: no element jumps between frames
      const snap = { rects: rects.map(r => r && [r.left, r.top, r.width, r.height]),
        words: [...document.querySelectorAll('.word,#eyebrow')].map(w => { const r=w.getBoundingClientRect(); return [r.left,r.top,r.width]; }) };
      if (prev) {
        snap.rects.forEach((r, i) => { const q = prev.rects[i]; if (r && q) { const d = Math.max(...r.map((v,k)=>Math.abs(v-q[k]))); if (d > 90) fail(f, `card ${i} jumped ${d.toFixed(0)}px`); } });
        snap.words.forEach((r, i) => { const q = prev.words[i]; const d = Math.max(...r.map((v,k)=>Math.abs(v-q[k]))); if (d > 90) fail(f, `title element ${i} jumped ${d.toFixed(0)}px`); });
      }
      prev = snap;
    }
    // final frame layout report
    window.render(D.DURATION - 1/fps);
    D.cards.forEach((c,i)=>{ const r=c.el.getBoundingClientRect(), lab=c.lab.getBoundingClientRect(), num=c.el.querySelector('.num').getBoundingClientRect();
      log.push(`card ${i}: ${r.left},${r.top} ${r.width}x${r.height} | number right-margin ${(r.right-num.right).toFixed(0)}px | label right-margin ${(r.right-lab.right).toFixed(0)}px`); });
    return { N, problems, readings, log, firstSeen };
  }, fps);
  console.log(`checked ${res.N} frames`);
  console.log('final readings:', res.readings);
  res.log.forEach(l => console.log(l));
  console.log(res.problems.length ? 'PROBLEMS:\n' + res.problems.join('\n') : 'NO PROBLEMS FOUND');
  if (errs.length) console.log('PAGE ERRORS', errs);
  await b.close();
})();
