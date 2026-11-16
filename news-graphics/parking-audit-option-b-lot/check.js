// Frame-by-frame QA for Option B v2 (drone over the lot).
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path');
(async () => {
  const fps = 60;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawn=new Set(); const f=CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText=function(s,...a){ window.__drawn.add(String(s)); return f.call(this,s,...a); }; });
  await p.addInitScript(() => { window.__badColor = new Set(); const probe = document.createElement('canvas').getContext('2d');
    for (const prop of ['fillStyle','strokeStyle']) { const d = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, prop);
      Object.defineProperty(CanvasRenderingContext2D.prototype, prop, { get(){ return d.get.call(this); }, set(v){
        if (typeof v === 'string') { d.set.call(probe,'#fe01fd'); d.set.call(probe,v); if (d.get.call(probe)==='#fe01fd' && v.replace(/\s/g,'').toLowerCase()!=='#fe01fd') window.__badColor.add(v); }
        d.set.call(this,v); } }); } });
  await p.goto('file://' + path.resolve(__dirname, 'graphic.html') + '?capture');
  await p.evaluate(() => window.ready);
  const res = await p.evaluate((fps) => {
    const D=window.__data, N=Math.round(D.DURATION*fps), problems=[];
    const fail=(f,m)=>{ if(problems.length<60) problems.push(`frame ${f} (t=${(f/fps).toFixed(3)}s): ${m}`); };
    const EXPECT=[['137,016',137016],['8,517',8517],['6,169',6169],['670',670]];
    D.STATS.forEach((s,i)=>{ if(s.value!==EXPECT[i][0]||s.n!==EXPECT[i][1]) fail(-1,`stat ${i}`); });
    if(JSON.stringify(D.SPACES)!=='[1370,85,62,7]') fail(-1,'space counts '+D.SPACES);
    if(D.stalls.length!==1370) fail(-1,'stall count');
    if(new Set(D.FLAGGED).size!==85 || D.FLAGGED.includes(D.HERO)) fail(-1,'flagged');
    if(new Set(D.CANCELED).size!==62 || D.CANCELED.some(i=>!D.FLAGGED.includes(i))) fail(-1,'canceled must be 62 of the flagged');
    if(new Set(D.REFERRED).size!==7 || D.REFERRED.some(i=>!D.FLAGGED.includes(i))) fail(-1,'referred must be 7 of the flagged');
    // every string ever painted or drawn
    const allowed=new Set(['137,016','APPLICATIONS REVIEWED','EACH SPACE = 100 APPLICATIONS','8,517','FAILED FINAL AUDIT','6,169','PERMITS CANCELED','670','SUSPECTED FRAUD CASES','REFERRED TO SHERIFF']);
    const drawn=[...window.__drawn]; drawn.forEach(s=>{ if(!allowed.has(s)) fail(-1,'unexpected text drawn: '+s); });
    allowed.forEach(s=>{ if(!drawn.includes(s)) fail(-1,'missing painted text: '+s); });
    const ov=document.querySelector('#stage').textContent.replace(/\s+/g,' ');
    for(const need of ['MIAMI-DADE COUNTY · COUNTYWIDE AUDIT','Disabled Parking Permit Investigation','Source: Miami-Dade County Tax Collector, October 20, 2026.','Each space = 100 applications, rounded to the nearest whole space.']) if(!ov.includes(need)) fail(-1,'overlay missing: '+need);
    const all=[...document.querySelectorAll('#stage *')];
    const leavers=D.CANCELED.map(i=>D.stalls[i]);
    // nearby cars for each leaver: every stall within 14 m (parked or leaving)
    const near=leavers.map(s=>D.stalls.filter(o=>o!==s && Math.abs(o.x-s.x)<40 && Math.abs(o.y-s.y)<14));
    let prevPose=null;
    for(let f=0;f<N;f++){
      const t=f/fps; window.render(t);
      for(const el of all){ const o=getComputedStyle(el).opacity; if(o!=='1'){ fail(f,`opacity ${o}`); break; } }
      const C=D.camAt(t); if(!(C.z>=6) || [C.x,C.y,C.z,C.f].some(v=>!isFinite(v))) fail(f,`camera bad (z=${C.z})`);
      const poses=leavers.map(s=>D.poseAt(s,t));
      leavers.forEach((s,k)=>{ const P=poses[k]; if(!P) return; const A=D.obb(P.x,P.y,P.h);
        // no car may touch any other car, parked or moving
        for(const o of near[k]){ const Q=D.poseAt(o,t); if(!Q) continue; const ov=D.sep(A,D.obb(Q.x,Q.y,Q.h)); if(ov>0.0) fail(f,`car ${k} touches stall ${o.row}/${o.c} (${ov.toFixed(2)} m)`); }
        // no sideways slip: the rear axle only ever moves along the car's heading
        const a0=D.axlePose(s,t-s.leaveT), a1=D.axlePose(s,t+1e-3-s.leaveT);
        if(a0&&a1){ const v=[a1.ax[0]-a0.ax[0],a1.ax[1]-a0.ax[1]], sp=Math.hypot(...v), lat=Math.abs(v[0]*Math.cos(a0.h)-v[1]*Math.sin(a0.h));
          if(sp>1e-7 && lat>0.03*sp+1e-6) fail(f,`car ${k} slides sideways (${(lat/sp*100).toFixed(1)}% of motion)`); }
      });
      if(prevPose) poses.forEach((P,k)=>{ const Q=prevPose[k]; if(P&&Q){ const d=Math.hypot(P.x-Q.x,P.y-Q.y), dh=Math.abs(Math.atan2(Math.sin(P.h-Q.h),Math.cos(P.h-Q.h)));
        if(d>0.2) fail(f,`car ${k} jumped ${d.toFixed(2)} m`); if(dh>0.08) fail(f,`car ${k} heading snapped ${dh.toFixed(3)} rad`); } });
      prevPose=poses;
    }
    // every one of the 62 canceled spaces is empty and fully crossed out before the clip ends
    leavers.forEach((s,k)=>{ if(s.clearT+0.1+0.7 > D.DURATION-1/fps) fail(-1,`canceled space ${k} not crossed out by the end (clears at ${s.clearT.toFixed(2)}s)`); });
    // final frame: every painted figure fully on screen and readable
    window.render(D.DURATION-1/fps);
    const S=(x,y)=>D.scr(D.toCam([x,y,0]));
    D.ST_POS.forEach(([cx,cy],i)=>{
      const corners=[[cx-D.STW/2+3,cy+D.STH/2-1],[cx+D.STW/2-3,cy+D.STH/2-1],[cx+D.STW/2-3,cy-D.STH/2+1],[cx-D.STW/2+3,cy-D.STH/2+1]].map(([x,y])=>S(x,y));
      if(corners.some(([x,y])=>x<20||x>1900||y<170||y>1060)) fail(-1,`final: figure ${i} not fully on screen`);
      const yTop=cy+D.STH/2, numTop=S(cx,yTop-(232-190)/20), numBot=S(cx,yTop-232/20), labTop=S(cx,yTop-(342-66)/20), labBot=S(cx,yTop-342/20);
      const nh=Math.abs(numBot[1]-numTop[1]), lh=Math.abs(labBot[1]-labTop[1]);
      if(nh<45) fail(-1,`final: figure ${i} number only ${nh.toFixed(0)}px tall`); if(lh<16) fail(-1,`final: figure ${i} label only ${lh.toFixed(0)}px tall`);
    });
    if(window.__badColor.size) problems.unshift('INVALID canvas colours: '+[...window.__badColor].slice(0,5).join(' | '));
    return {N,problems,drawn};
  }, fps);
  console.log(`checked ${res.N} frames`); console.log('painted text:',res.drawn.join(' | '));
  console.log(res.problems.length?'PROBLEMS:\n'+res.problems.join('\n'):'NO PROBLEMS FOUND');
  if(errs.length) console.log('PAGE ERRORS',errs);
  await b.close();
})();
