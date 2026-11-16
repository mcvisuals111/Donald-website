// Frame-by-frame QA for Option B (the lot).
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path');
(async () => {
  const fps = 60;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__badColor = new Set(); const probe = document.createElement('canvas').getContext('2d');
    for (const prop of ['fillStyle','strokeStyle']) { const d = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, prop);
      Object.defineProperty(CanvasRenderingContext2D.prototype, prop, { get(){ return d.get.call(this); }, set(v){
        if (typeof v === 'string') { d.set.call(probe,'#fe01fd'); d.set.call(probe,v); if (d.get.call(probe)==='#fe01fd' && v.replace(/\s/g,'').toLowerCase()!=='#fe01fd') window.__badColor.add(v); }
        d.set.call(this,v); } }); } });
  await p.goto('file://' + path.resolve(__dirname, 'graphic.html') + '?capture');
  await p.evaluate(() => window.ready);
  const res = await p.evaluate((fps) => {
    const D = window.__data, N = Math.round(D.DURATION*fps), problems = [];
    const fail = (f,m) => { if (problems.length < 60) problems.push(`frame ${f} (t=${(f/fps).toFixed(3)}s): ${m}`); };
    const EXPECT = [['137,016','Applications reviewed',137016],['8,517','Failed final audit',8517],['6,169','Permits canceled',6169],['670','Suspected fraud cases referred to sheriff',670]];
    // data + unit-chart arithmetic
    D.STATS.forEach((s,i)=>{ if(s.value!==EXPECT[i][0]||s.label!==EXPECT[i][1]||s.n!==EXPECT[i][2]) fail(-1,`stat ${i} mismatch`); });
    const want=[1370,85,62,7];
    if (JSON.stringify(D.SPACES)!==JSON.stringify(want)) fail(-1,'space counts '+D.SPACES);
    if (D.stalls.length!==1370) fail(-1,'stall count '+D.stalls.length);
    if (new Set(D.FLAGGED).size!==85) fail(-1,'flagged not 85 unique');
    if (new Set(D.CANCELED).size!==62 || D.CANCELED.some(i=>!D.FLAGGED.includes(i))) fail(-1,'canceled must be 62 of the flagged');
    if (new Set(D.REFERRED).size!==7 || D.REFERRED.some(i=>!D.FLAGGED.includes(i))) fail(-1,'referred must be 7 of the flagged');
    if (new Set(D.REFERRED.map(i=>D.aisleOf(D.stalls[i].row))).size!==7) fail(-1,'patrol cars share an aisle');
    // every stall is distinct and inside the lot
    const keys=new Set(D.stalls.map(s=>s.x+','+s.y)); if(keys.size!==1370) fail(-1,'overlapping stalls');
    // DOM text
    D.rows.forEach((r,i)=>{ if(r.lab.textContent!==EXPECT[i][1]) fail(-1,`label ${i}`); r.cols.forEach((c,j)=>{ if(c.cells.length!==2||c.cells[1]!==EXPECT[i][0][j]) fail(-1,`row ${i} col ${j} can show ${c.cells}`); }); });
    const txt=document.querySelector('#panel').textContent.replace(/\s+/g,' ');
    for (const need of ['MIAMI-DADE COUNTY · COUNTYWIDE AUDIT','Disabled Parking','Permit Investigation','Source: Miami-Dade County Tax Collector, October 20, 2026.','Each space represents 100 applications'])
      if(!txt.includes(need)) fail(-1,'panel missing: '+need);
    if (document.querySelector('#key').textContent.trim()!=='1 space = 100 applications') fail(-1,'key text');
    const all=[...document.querySelectorAll('#stage *')]; let prev=null, readings={};
    for (let f=0; f<N; f++){
      const t=f/fps; window.render(t);
      for(const el of all){ const o=getComputedStyle(el).opacity; if(o!=='1'){ fail(f,`opacity ${o} on ${el.id||el.className}`); break; } }
      for(const el of all){ const st=el.getAttribute('style')||''; if(/NaN|undefined|Infinity/.test(st)){ fail(f,'bad style '+st.slice(0,60)); break; } }
      D.rows.forEach((r,i)=>{
        const landed = t >= D.T.row[i]+0.15+(r.cols.length-1)*0.055+1.0;
        if(landed){ const read=r.cols.map(c=>{ if(Math.abs(c.pos-1)>1e-9) fail(f,`row ${i} not landed`); return c.cells[1]; }).join(''); if(read!==EXPECT[i][0]) fail(f,`row ${i} reads ${read}`); readings[i]=read; }
        if(t>=D.T.row[i]+1.5){ const rr=r.el.getBoundingClientRect(), lab=r.lab.getBoundingClientRect(); if(lab.right>640) fail(f,`row ${i} label runs off the panel`); }
      });
      const snap=[...document.querySelectorAll('.row,#panel,#title .mask')].map(e=>{const r=e.getBoundingClientRect(); return [r.left,r.top];});
      if(prev) snap.forEach((r,i)=>{ const d=Math.max(Math.abs(r[0]-prev[i][0]),Math.abs(r[1]-prev[i][1])); if(d>120) fail(f,`panel element ${i} jumped ${d|0}px`); });
      prev=snap;
    }
    if (window.__badColor.size) problems.unshift('INVALID canvas colours used: '+[...window.__badColor].slice(0,5).join(' | '));
    return {N,problems,readings};
  }, fps);
  console.log(`checked ${res.N} frames`); console.log('final readings:',res.readings);
  console.log(res.problems.length?'PROBLEMS:\n'+res.problems.join('\n'):'NO PROBLEMS FOUND');
  if(errs.length) console.log('PAGE ERRORS',errs);
  await b.close();
})();
