// Frame-by-frame QA for Option A (gridlock / message board).
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path');
(async () => {
  const fps = 60;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  // record every string drawn on any canvas, so no stray number can slip in
  await p.addInitScript(() => { window.__drawn = new Set(); const f = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function(s,...a){ window.__drawn.add(String(s)); return f.call(this,s,...a); }; });
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
    const EXPECT=[['137,016','Applications reviewed'],['8,517','Failed final audit'],['6,169','Permits canceled'],['670','Suspected fraud cases referred to sheriff']];
    const MSG=[["MIAMI-DADE COUNTY","DISABLED PARKING","PERMIT INVESTIGATION"],["137,016","APPLICATIONS","REVIEWED"],["8,517","FAILED","FINAL AUDIT"],["6,169","PERMITS","CANCELED"],["670","SUSPECTED FRAUD CASES","REFERRED TO SHERIFF"]];
    D.STATS.forEach((s,i)=>{ if(s.value!==EXPECT[i][0]||s.label!==EXPECT[i][1]) fail(-1,`stat ${i}`); });
    D.MESSAGES.forEach((m,i)=>{ if(JSON.stringify(m.lines)!==JSON.stringify(MSG[i])) fail(-1,`message ${i} text`); });
    // read the LED grid back into text, glyph by glyph, to prove the board shows what we think
    const glyphs=Object.entries(D.GLYPH);
    function readLine(g,row,scale){
      let out='', cw=6*scale;
      for(let x0=0;x0+5*scale<=D.BCOLS;x0++){} // (scan below)
      // find leftmost lit column in the band
      let minc=D.BCOLS,maxc=-1; for(let r=row;r<row+7*scale;r++) for(let c=0;c<D.BCOLS;c++) if(g[r][c]){minc=Math.min(minc,c);maxc=Math.max(maxc,c);}
      if(maxc<0) return '';
      // the line was centred; try each start offset that aligns glyph cells
      for(let start=minc-4*scale; start<=minc; start++){
        let s='', ok=true;
        for(let x=start; x<=maxc; x+=cw){
          const cell=[]; for(let r=0;r<7;r++){ let line=''; for(let c=0;c<5;c++){ const gx=x+c*scale; line+= (gx>=0&&gx<D.BCOLS&&g[row+r*scale][gx])?'1':'0'; } cell.push(line); }
          const hit=glyphs.find(([ch,gl])=>gl.join()===cell.join()); if(!hit){ ok=false; break; } s+=hit[0];
        }
        if(ok) return s.replace(/^ +| +$/g,'');
      }
      return '?';
    }
    D.MSG_GRID.forEach((g,i)=>{ const m=D.MESSAGES[i]; const rows=m.big?[[2,2],[18,1],[26,1]]:[[4,1],[14,1],[24,1]];
      rows.forEach(([r,sc],k)=>{ const got=readLine(g,r,sc); if(got!==MSG[i][k] && !(MSG[i][k].includes('O')||MSG[i][k].includes('0'))) fail(-1,`board message ${i} line ${k} reads "${got}"`);
        if(got.replace(/O/g,'0')!==MSG[i][k].replace(/O/g,'0')) fail(-1,`board message ${i} line ${k} reads "${got}"`); }); });
    const all=[...document.querySelectorAll('#stage *')]; const readings={};
    for(let f=0;f<N;f++){
      const t=f/fps; window.render(t);
      for(const el of all){ const o=getComputedStyle(el).opacity; if(o!=='1'){ fail(f,`opacity ${o} on ${el.id||el.className}`); break; } }
      for(const el of all){ const st=el.getAttribute('style')||''; if(/NaN|undefined|Infinity/.test(st)){ fail(f,'bad style'); break; } }
      // while a message holds, the board must show exactly that message
      D.T.msg.forEach((t0,i)=>{ const t1=D.T.msg[i+1]??99; if(t>=t0+D.T.roll+0.02 && t<t1){ const g=D.boardGrid(t); if(g.some((row,r)=>row.join()!==D.MSG_GRID[i][r].join())) fail(f,`board not showing message ${i}`); } });
      // board stays inside the windshield and readable while it holds a stat
      if(t<D.T.push && window.__board){ const B=window.__board; if(B.y0<45) fail(f,`board under the headliner (${B.y0|0})`); if(B.pitch<2.4) fail(f,`board too small (${B.pitch.toFixed(2)}px pitch)`); }
      D.tiles.forEach((r,i)=>{ if(t>=D.T.tiles[i]+0.15+(r.cols.length-1)*0.055+1.0){ const read=r.cols.map(c=>{ if(Math.abs(c.pos-1)>1e-9) fail(f,`tile ${i} not landed`); return c.cells[1]; }).join(''); if(read!==EXPECT[i][0]) fail(f,`tile ${i} reads ${read}`); readings[i]=read; } });
    }
    // end card: tiles must not collide and must sit inside the frame
    window.render(D.DURATION-1/fps);
    const rects=D.tiles.map(r=>{ const n=r.el.querySelector('.num').getBoundingClientRect(), l=r.lab.getBoundingClientRect(); return {l:Math.min(n.left,l.left), r:Math.max(n.right,l.right), b:l.bottom}; });
    for(let i=0;i<3;i++) if(rects[i].r > rects[i+1].l-24) fail(-1,`end card: tile ${i} runs into tile ${i+1} (${(rects[i+1].l-rects[i].r)|0}px gap)`);
    rects.forEach((r,i)=>{ if(r.r>1880||r.b>1000) fail(-1,`end card: tile ${i} leaves the frame`); });
    const drawn=[...window.__drawn]; const bad=drawn.filter(s=>/\d/.test(s) && !/^\d$/.test(s));
    if(bad.length) fail(-1,'unexpected numbers drawn on canvas: '+bad.join(' | '));
    if (window.__badColor.size) problems.unshift('INVALID canvas colours used: '+[...window.__badColor].slice(0,5).join(' | '));
    return {N,problems,readings,drawn};
  }, fps);
  console.log(`checked ${res.N} frames`); console.log('final readings:',res.readings); console.log('canvas text drawn:',res.drawn.join(' | '));
  console.log(res.problems.length?'PROBLEMS:\n'+res.problems.join('\n'):'NO PROBLEMS FOUND');
  if(errs.length) console.log('PAGE ERRORS',errs);
  await b.close();
})();
