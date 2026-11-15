// Frame-by-frame QA for the driving version.
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
    const D = window.__data, N = Math.round(D.DURATION * fps), problems = [];
    const EXPECT = [['137,016','Applications reviewed'],['8,517','Failed final audit'],['6,169','Permits canceled'],['670','Suspected fraud cases referred to sheriff']];
    const fail = (f, m) => { if (problems.length < 60) problems.push(`frame ${f} (t=${(f/fps).toFixed(3)}s): ${m}`); };
    D.STATS.forEach((s,i)=>{ if(s.value!==EXPECT[i][0]||s.label!==EXPECT[i][1]) fail(-1,`stat ${i} text mismatch`); });
    D.cards.forEach((c,i)=>{ if(c.lab.textContent!==EXPECT[i][1]) fail(-1,`label ${i} DOM mismatch`);
      c.cols.forEach((col,j)=>{ const cells=[...col.strip.children].map(d=>d.textContent);
        if(cells.length!==2||cells[0].trim()!==''||cells[1]!==EXPECT[i][0][j]) fail(-1,`card ${i} col ${j} can show ${cells.join('|')}`); }); });
    const src=document.querySelector('#source').textContent.trim();
    if(src!=='Source: Miami-Dade County Tax Collector, October 20, 2026.') fail(-1,'source: '+src);
    const title=[...document.querySelectorAll('.word')].map(w=>w.textContent).join(' ');
    if(title!=='Disabled Parking Permit Investigation') fail(-1,'title: '+title);
    const html=[...document.querySelectorAll('#stage *')];
    let prev=null; const readings={};
    for (let f=0; f<N; f++) {
      const t=f/fps; window.render(t);
      for (const el of html){ const o=getComputedStyle(el).opacity; if(o!=='1'){ fail(f,`opacity ${o} on ${el.id||el.className}`); break; } }
      for (const el of html){ const st=el.getAttribute('style')||''; if(/NaN|undefined|Infinity/.test(st)){ fail(f,'bad style'); break; } }
      const rects=D.cards.map(c=>c.el.style.display==='none'?null:c.el.getBoundingClientRect());
      D.cards.forEach((c,i)=>{
        const r=rects[i]; if(!r) return;
        if(r.left<150||r.right>1770||r.top<0||r.bottom>800) fail(f,`card ${i} leaves the windshield (${r.left|0},${r.top|0},${r.right|0},${r.bottom|0})`);
        const st=D.STAT_START[i];
        const settled = (t>=st+1.45 && t<D.T.dock[i]) || t>=D.T.dock[i]+D.T.dockDur;
        if(settled){
          const num=c.el.querySelector('.num').getBoundingClientRect(), lab=c.lab.getBoundingClientRect();
          const m=Math.min(r.right-num.right, r.right-lab.right), mb=r.bottom-lab.bottom;
          if(m<18) fail(f,`card ${i} text ${m.toFixed(1)}px from right edge`);
          if(mb<16) fail(f,`card ${i} label ${mb.toFixed(1)}px from bottom edge`);
        }
        const landed = t >= st + D.ROLL_T.delay + (c.cols.length-1)*D.ROLL_T.stagger + D.ROLL_T.dur;
        if(landed){
          const read=c.cols.map(col=>{
            if(Math.abs(col.pos-1)>1e-9) fail(f,`card ${i} digit not landed`);
            if(col.strip.style.filter && col.strip.style.filter!=='none') fail(f,`card ${i} still blurred`);
            const cell=col.strip.children[1].getBoundingClientRect(), wr=col.win.getBoundingClientRect();
            if(Math.abs((cell.top+cell.bottom)/2-(wr.top+wr.bottom)/2)>0.6) fail(f,`card ${i} digit off-centre`);
            return col.cells[1]; }).join('');
          if(read!==EXPECT[i][0]) fail(f,`card ${i} reads ${read}`); readings[i]=read;
        }
      });
      for(let i=0;i<4;i++) for(let j=i+1;j<4;j++){ const a=rects[i], c=rects[j]; if(!a||!c) continue;
        if(Math.min(a.right,c.right)-Math.max(a.left,c.left)>0.5 && Math.min(a.bottom,c.bottom)-Math.max(a.top,c.top)>0.5) fail(f,`cards ${i} and ${j} overlap`); }
      // header text never touches the source line or the cards
      const tw=document.querySelectorAll('.word'), lastW=tw[tw.length-1].getBoundingClientRect(), sr=document.querySelector('#source span').getBoundingClientRect();
      if(t>D.T.toHeader+D.T.morphDur){
        const wb=Math.max(...[...tw].map(w=>w.getBoundingClientRect().bottom));
        if(sr.top < wb-14) fail(f,'source line collides with title');            // word boxes include descender padding
        rects.forEach((r,i)=>{ if(r && r.top < sr.bottom+6 && r.left < sr.right) fail(f,`card ${i} touches source line`); });
      }
      // nothing on the HUD may sit under the rearview mirror / placard
      rects.forEach((r,i)=>{ if(r && r.right > 1500 && r.top < 330) fail(f,`card ${i} under the mirror/placard`); });
      const snap={rects:rects.map(r=>r&&[r.left,r.top,r.width,r.height]), words:[...document.querySelectorAll('.word,#eyebrow')].map(w=>{const r=w.getBoundingClientRect();return [r.left,r.top,r.width];})};
      if(prev){
        snap.rects.forEach((r,i)=>{ const q=prev.rects[i]; if(r&&q){ const d=Math.max(...r.map((v,k)=>Math.abs(v-q[k]))); if(d>90) fail(f,`card ${i} jumped ${d.toFixed(0)}px`);} });
        snap.words.forEach((r,i)=>{ const q=prev.words[i]; const d=Math.max(...r.map((v,k)=>Math.abs(v-q[k]))); if(d>90) fail(f,`title element ${i} jumped ${d.toFixed(0)}px`); });
      }
      prev=snap;
    }
    return {N,problems,readings};
  }, fps);
  console.log(`checked ${res.N} frames`); console.log('final readings:',res.readings);
  console.log(res.problems.length?'PROBLEMS:\n'+res.problems.join('\n'):'NO PROBLEMS FOUND');
  if(errs.length) console.log('PAGE ERRORS',errs);
  await b.close();
})();
