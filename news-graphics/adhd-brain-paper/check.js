// Frame-by-frame QA for the ADHD paper piece.
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path');
(async () => {
  const fps = 60;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawn=new Set(); const f=CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText=function(s,...a){ window.__drawn.add(String(s)); return f.call(this,s,...a); };
    window.__badColor=new Set(); const probe=document.createElement('canvas').getContext('2d');
    for(const prop of ['fillStyle','strokeStyle','shadowColor']){ const d=Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype,prop);
      Object.defineProperty(CanvasRenderingContext2D.prototype,prop,{get(){return d.get.call(this);},set(v){ if(typeof v==='string'){ d.set.call(probe,'#fe01fd'); d.set.call(probe,v); if(d.get.call(probe)==='#fe01fd' && v.replace(/\s/g,'').toLowerCase()!=='#fe01fd') window.__badColor.add(v); } d.set.call(this,v); }}); } });
  await p.goto('file://' + path.resolve(__dirname, 'graphic.html') + '?capture');
  await p.evaluate(() => window.ready);
  const res = await p.evaluate((fps) => {
    const D=window.__data, N=Math.round(D.DURATION*fps), problems=[];
    const fail=(f,m)=>{ if(problems.length<60) problems.push(`frame ${f} (t=${(f/fps).toFixed(3)}s): ${m}`); };
    const WANT=['ADHD Brain','Lacks some neurochemicals','Regulates differently','Interested in something','Neurotransmitters firing','Super focused'];
    if(JSON.stringify(D.LABELS.map(l=>l.text))!==JSON.stringify(WANT)) fail(-1,'label texts '+D.LABELS.map(l=>l.text));
    if(JSON.stringify(D.CARD_TITLES)!=='["ADHD brain","Other people"]') fail(-1,'card titles');
    if(D.DURATION!==17) fail(-1,'duration');
    // label beats must follow the VO in order and leave time to read each one
    D.LABELS.forEach((l,i)=>{ if(i&&l.t-D.LABELS[i-1].t<1.25) fail(-1,`label ${i} follows too quickly`); });
    const g=document.createElement('canvas').getContext('2d');
    let prevL=null, prevR=null;
    const holeCount=st=>st.chip.filter(c=>c>0.99).length;
    for(let f=0;f<N;f++){ const t=f/fps; window.render(t);
      const L=D.brainL(t); if(L.some(v=>!isFinite(v))) fail(f,'brain position NaN');
      // brain fully inside the frame once it has arrived
      if(t>1.0){ const x0=L[0]-350*L[2], x1=L[0]+350*L[2], y0=L[1]-260*L[2], y1=L[1]+260*L[2]; if(x0<20||x1>1900||y0<20||y1>1070) fail(f,`brain leaves frame ${x0|0},${y0|0},${x1|0},${y1|0}`); }
      if(prevL){ const d=Math.hypot(L[0]-prevL[0],L[1]-prevL[1]); if(d>40) fail(f,`brain jumped ${d|0}px`); } prevL=L;
      if(t>=D.T.split){ const R=D.brainR(t); if(prevR){ const d=Math.hypot(R[0]-prevR[0],R[1]-prevR[1]); if(d>40) fail(f,`second brain jumped ${d|0}px`); } prevR=R; }
      // the label strip always holds its words once settled
      const lab=window.__label; let i=0; D.LABELS.forEach((l,k)=>{ if(t>=l.t) i=k; });
      if(lab && t>D.LABELS[i].t+1.2){ g.font=`italic 900 ${D.LABELS[i].size}px Play`; const tw=g.measureText(D.LABELS[i].text).width; if(tw>lab.w-20) fail(f,`label "${D.LABELS[i].text}" overflows its strip`);
        if(lab.y-lab.h/2<10 || lab.x-lab.w/2<10 || lab.x+lab.w/2>1910) fail(f,'label strip off frame'); }
    }
    // story states
    const S=D.brainState;
    const adhdRest=S(5.2,'L'), other=S(9.0,'R'), firing=S(14.0,'L'), focused=S(16.9,'L');
    const n=D.SLOTS().length;
    if(holeCount(adhdRest)!==5) fail(-1,`ADHD brain at rest should hold 5 of ${n} chemicals, holds ${holeCount(adhdRest)}`);
    if(holeCount(other)!==n) fail(-1,`other brain should be fully stocked (${holeCount(other)}/${n})`);
    if(holeCount(firing)!==n || holeCount(focused)!==n) fail(-1,'ADHD brain should be fully stocked while firing');
    if(!firing.pulses || firing.pulses.length<D.EDGES().length*0.8) fail(-1,'not enough pulses firing');
    const allowed=new Set([...WANT,...D.CARD_TITLES]); [...window.__drawn].forEach(s=>{ if(!allowed.has(s)) fail(-1,'unexpected text drawn: '+s); });
    if(window.__badColor.size) problems.unshift('INVALID colours: '+[...window.__badColor].slice(0,5).join(' | '));
    return {N,problems,drawn:[...window.__drawn],n,edges:D.EDGES().length};
  }, fps);
  console.log(`checked ${res.N} frames; ${res.n} chemical slots, ${res.edges} pathways`); console.log('text drawn:',res.drawn.join(' | '));
  console.log(res.problems.length?'PROBLEMS:\n'+res.problems.join('\n'):'NO PROBLEMS FOUND');
  if(errs.length) console.log('PAGE ERRORS',errs);
  await b.close();
})();
