/* =====================================================================
   PINECREST SPEED LIMIT MAP — 8.0 s broadcast graphic
   =====================================================================
   CONFIG holds every timing, easing and camera value. Retime to your VO here.
   - Times are seconds from the first frame.
   - `ease` is either a named curve (see EASES below) or a cubic-bezier
     array [x1, y1, x2, y2].
   ===================================================================== */
const CONFIG = {
  width: 1920,
  height: 1080,
  fps: 30,
  duration: 8.0,
  safeArea: 0.9, // all text stays inside the centre 90% of the frame

  data: {
    roads: 'roads.json',
    boundary: 'pinecrest-boundary.geojson',
  },

  basemap: {
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    styleTimeoutMs: 8000,
    // Muting: hide clutter, dim minor streets and labels so the roads pop.
    hideLayers: /housenumber|poi|building|roadname_minor|aeroway|landuse/,
    minorLines: /minor|service|path|track|rail|ferry/,
    minorLineOpacity: 0.28,
    roadLabels: /roadname/,
    roadLabelOpacity: 0.3,
    placeLabelOpacity: 0.6,
  },

  camera: {
    // 0.0–0.4 s: tight street-level hold over SW 67th Ave & Killian Dr
    start: { center: [-80.3040, 25.6655], zoom: 15.9, pitch: 56, bearing: -26 },
    // slow drift applied from frame 0 so the hold never looks frozen
    // (carried smoothly into the zoom-out, so there is no velocity hitch)
    drift: { lonPerSec: 0.00010, latPerSec: 0.00004, zoomPerSec: -0.05, bearingPerSec: 1.4 },
    // 0.4–2.6 s: zoom out + tilt/rotate to the full-Pinecrest framing
    zoomOut: { start: 0.4, end: 2.6, ease: 'quartInOut' },
    end: { center: [-80.3130, 25.6680], zoom: 13.32, pitch: 30, bearing: -7 },
    // 2.6–8.0 s: very slow push-in (3%) + slight rotation; covers the 6.4–8.0 hold
    hold: { start: 2.6, end: 8.0, pushIn: 0.03, bearingDrift: 0.8, ease: 'sineInOut' },
  },

  boundary: {
    fadeStart: 1.5, // last half of the zoom-out
    fadeEnd: 2.6,
    ease: 'cubicInOut',
    stroke: 'rgba(255,255,255,0.85)',
    strokeWidth: 2.5,
    fill: 'rgba(255,255,255,0.055)',
  },

  title: {
    start: 2.4,
    dur: 0.38, // per element; elements stagger by `stagger`
    stagger: 0.06,
    slideX: -44,
    ease: 'expoOut',
  },

  roads: {
    start: 2.8,
    stagger: 0.6, // order comes from roads.json -> properties.order
    draw: { dur: 0.6, ease: 'quartOut' },
    lineWidth: 7,
    glowWidth: 20,
    glowOpacity: 0.55,
    marker: { delay: 0.32, dur: 0.42, overshoot: 1.15 }, // scale 0 -> 1.15 -> 1.0 (back-out)
    ring: { delay: 0.34, dur: 0.62, fromScale: 0.7, toScale: 2.4, ease: 'expoOut' },
    leader: { delay: 0.44, dur: 0.3, ease: 'cubicOut' },
    label: { delay: 0.5, dur: 0.42, slide: 22, ease: 'expoOut' },
    // automatic marker/label layout (computed at the final camera)
    layout: {
      tCandidates: [0.5, 0.45, 0.55, 0.4, 0.6, 0.35, 0.65, 0.3, 0.7, 0.25, 0.75, 0.2, 0.8, 0.15, 0.85],
      distances: [52, 80, 115, 160, 210, 270],
      angleStepDeg: 22.5,
      minMarkerGap: 110, // px between car markers
      minMarkerToOtherRoad: 48, // keep markers off intersections
      labelPad: 12, // clearance between a label and any road line
      midpointWeight: 700, // how hard to prefer the true midpoint
      crossingPenalty: 260, // leader lines crossing another road
    },
  },

  callout: {
    start: 5.4,
    sign: { at: 0.0, dur: 0.45, rise: 46, ease: 'backOut' },
    strike: { at: 0.38, dur: 0.18, ease: 'quartOut' },
    flip: { at: 0.58, dur: 0.38, ease: 'expoInOut' }, // 35 rolls out, 30 rolls in
    meta: { at: 0.5, dur: 0.45, slideX: 34, ease: 'expoOut' },
    oldValue: '35',
    newValue: '30',
  },

  ambient: {
    pulseStart: 6.4,
    pulseEvery: 1.0,
    pulseStagger: 0.12, // per marker, so the pulses ripple
    pulseDur: 0.9,
    bodyScale: 1.07,
    ringScale: 1.9,
    ringOpacity: 0.55,
  },
};

/* =====================================================================
   Motion (motion.dev) easing + interpolation
   ===================================================================== */
const Motion = window.Motion;
const bez = (a, b, c, d) => Motion.cubicBezier(a, b, c, d);
const EASES = {
  linear: (t) => t,
  easeIn: Motion.easeIn,
  easeOut: Motion.easeOut,
  easeInOut: Motion.easeInOut,
  sineInOut: bez(0.37, 0, 0.63, 1),
  cubicOut: bez(0.33, 1, 0.68, 1),
  cubicInOut: bez(0.65, 0, 0.35, 1),
  quartOut: bez(0.25, 1, 0.5, 1),
  quartInOut: bez(0.76, 0, 0.24, 1),
  expoOut: bez(0.16, 1, 0.3, 1),
  expoInOut: bez(0.87, 0, 0.13, 1),
  backOut: Motion.backOut,
  circOut: Motion.circOut,
};
const easeFn = (e) => (Array.isArray(e) ? bez(...e) : EASES[e] || EASES.easeInOut);
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a, b, t) => a + (b - a) * t;
/** eased progress of a tween that starts at `start` and lasts `dur` seconds */
const tween = (t, start, dur, ease) => easeFn(ease)(clamp01((t - start) / dur));

// marker pop: 0 -> overshoot -> 1 (back-out shape built from two Motion segments)
const markerPop = Motion.interpolate(
  [0, 0.58, 1],
  [0, CONFIG.roads.marker.overshoot, 1],
  { ease: [EASES.cubicOut, EASES.sineInOut] }
);

/* =====================================================================
   Runtime
   ===================================================================== */
const params = new URLSearchParams(location.search);
const MODE = {
  export: params.has('export'),
  alpha: params.has('alpha'),
  noMap: params.has('nomap') || params.has('alpha'),
  freezeAt: params.has('t') ? parseFloat(params.get('t')) : null,
};
if (MODE.export) document.body.classList.add('export');
if (MODE.alpha) document.body.classList.add('alpha');
if (params.has('guides')) document.body.classList.add('guides');

const $ = (s) => document.querySelector(s);
const SVGNS = 'http://www.w3.org/2000/svg';
const stage = $('#stage');
const SAFE = (() => {
  const mx = (CONFIG.width * (1 - CONFIG.safeArea)) / 2;
  const my = (CONFIG.height * (1 - CONFIG.safeArea)) / 2;
  return { x: mx, y: my, w: CONFIG.width - 2 * mx, h: CONFIG.height - 2 * my };
})();

let map;
let roads = []; // { props, coords, els, layout }
let boundaryRings = [];
const els = {};

/* ---------- stage scaling (preview only) ---------- */
function fitStage() {
  const s = MODE.export ? 1 : Math.min(innerWidth / CONFIG.width, innerHeight / CONFIG.height);
  stage.style.transform = `scale(${s})`;
}
addEventListener('resize', fitStage);
fitStage();

/* ---------- geometry helpers ---------- */
function planarCum(coords) {
  // cumulative length in a local planar frame (lon scaled by cos(lat))
  const k = Math.cos((coords[0][1] * Math.PI) / 180);
  const cum = [0];
  for (let i = 1; i < coords.length; i++) {
    const dx = (coords[i][0] - coords[i - 1][0]) * k;
    const dy = coords[i][1] - coords[i - 1][1];
    cum.push(cum[i - 1] + Math.hypot(dx, dy));
  }
  return cum;
}
function geoAt(road, t) {
  const { coords, cum } = road;
  const target = cum[cum.length - 1] * clamp01(t);
  for (let i = 1; i < coords.length; i++) {
    if (cum[i] >= target) {
      const u = (target - cum[i - 1]) / (cum[i] - cum[i - 1] || 1);
      return [lerp(coords[i - 1][0], coords[i][0], u), lerp(coords[i - 1][1], coords[i][1], u)];
    }
  }
  return coords[coords.length - 1];
}
const proj = (lnglat) => {
  const p = map.project(lnglat);
  return [p.x, p.y];
};
function partialScreen(pts, p) {
  // returns the first p (0..1) of a screen polyline + its tip point
  if (p <= 0 || pts.length < 2) return { d: '', tip: null };
  let total = 0;
  const seg = [];
  for (let i = 1; i < pts.length; i++) {
    const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    seg.push(l);
    total += l;
  }
  const target = total * Math.min(p, 1);
  let d = `M${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)}`;
  let acc = 0;
  let tip = pts[0];
  for (let i = 1; i < pts.length; i++) {
    if (acc + seg[i - 1] >= target) {
      const u = (target - acc) / (seg[i - 1] || 1);
      tip = [lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)];
      d += `L${tip[0].toFixed(2)},${tip[1].toFixed(2)}`;
      return { d, tip };
    }
    acc += seg[i - 1];
    d += `L${pts[i][0].toFixed(2)},${pts[i][1].toFixed(2)}`;
    tip = pts[i];
  }
  return { d, tip };
}
function segHitsRect(a, b, r) {
  // Liang–Barsky segment vs axis-aligned rect {x,y,w,h}
  let t0 = 0, t1 = 1;
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const p = [-dx, dx, -dy, dy];
  const q = [a[0] - r.x, r.x + r.w - a[0], a[1] - r.y, r.y + r.h - a[1]];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) { if (q[i] < 0) return false; }
    else {
      const t = q[i] / p[i];
      if (p[i] < 0) { if (t > t1) return false; if (t > t0) t0 = t; }
      else { if (t < t0) return false; if (t < t1) t1 = t; }
    }
  }
  return true;
}
const polyHitsRect = (pts, r) => pts.some((p, i) => i > 0 && segHitsRect(pts[i - 1], p, r));
const grow = (r, g) => ({ x: r.x - g, y: r.y - g, w: r.w + 2 * g, h: r.h + 2 * g });
const rectsOverlap = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const rectInside = (a, b) => a.x >= b.x && a.y >= b.y && a.x + a.w <= b.x + b.w && a.y + a.h <= b.y + b.h;
function segsIntersect(a, b, c, d) {
  const o = (p, q, r) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]));
  return o(a, b, c) !== o(a, b, d) && o(c, d, a) !== o(c, d, b);
}
function distToPoly(pt, pts) {
  let best = Infinity;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
    const vx = bx - ax, vy = by - ay;
    const u = clamp01(((pt[0] - ax) * vx + (pt[1] - ay) * vy) / (vx * vx + vy * vy || 1));
    best = Math.min(best, Math.hypot(pt[0] - (ax + u * vx), pt[1] - (ay + u * vy)));
  }
  return best;
}
const nearestOnRect = (p, r) => [Math.max(r.x, Math.min(p[0], r.x + r.w)), Math.max(r.y, Math.min(p[1], r.y + r.h))];

/* ---------- camera ---------- */
function cameraAt(t) {
  const C = CONFIG.camera;
  const dt = Math.min(t, C.zoomOut.end); // drift runs until the zoom lands, then hands off
  const s = {
    lng: C.start.center[0] + C.drift.lonPerSec * dt,
    lat: C.start.center[1] + C.drift.latPerSec * dt,
    zoom: C.start.zoom + C.drift.zoomPerSec * dt,
    pitch: C.start.pitch,
    bearing: C.start.bearing + C.drift.bearingPerSec * dt,
  };
  const e = tween(t, C.zoomOut.start, C.zoomOut.end - C.zoomOut.start, C.zoomOut.ease);
  const h = tween(t, C.hold.start, C.hold.end - C.hold.start, C.hold.ease);
  return {
    center: [lerp(s.lng, C.end.center[0], e), lerp(s.lat, C.end.center[1], e)],
    zoom: lerp(s.zoom, C.end.zoom, e) + Math.log2(1 + C.hold.pushIn) * h,
    pitch: lerp(s.pitch, C.end.pitch, e),
    bearing: lerp(s.bearing, C.end.bearing, e) + C.hold.bearingDrift * h,
  };
}

/* ---------- loading ---------- */
async function loadJSON(url) {
  const r = await fetch(url, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
  return r.json();
}
const BLANK_STYLE = {
  version: 8,
  sources: {},
  layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#0b0d12' } }],
};
async function resolveStyle() {
  if (MODE.noMap) return BLANK_STYLE;
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), CONFIG.basemap.styleTimeoutMs);
    const r = await fetch(CONFIG.basemap.style, { signal: ctl.signal });
    clearTimeout(timer);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } catch (err) {
    const msg = `[map] Basemap style could not load (${err.message}). Rendering overlays on a blank background.`;
    console.warn(msg);
    $('#notice').textContent = msg;
    return BLANK_STYLE;
  }
}
function muteBasemap() {
  const B = CONFIG.basemap;
  for (const layer of map.getStyle().layers) {
    const id = layer.id;
    try {
      if (B.hideLayers.test(id)) map.setLayoutProperty(id, 'visibility', 'none');
      else if (layer.type === 'line' && B.minorLines.test(id)) map.setPaintProperty(id, 'line-opacity', B.minorLineOpacity);
      else if (layer.type === 'symbol') {
        map.setPaintProperty(id, 'text-opacity', B.roadLabels.test(id) ? B.roadLabelOpacity : B.placeLabelOpacity);
        map.setPaintProperty(id, 'icon-opacity', 0);
      }
    } catch (_) { /* layer without that property */ }
  }
}
function waitForMap(timeout = 20000) {
  return new Promise((resolve) => {
    let done = false;
    const fin = () => { if (!done) { done = true; resolve(); } };
    map.once('idle', fin);
    setTimeout(fin, timeout);
    map.triggerRepaint();
  });
}
const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));

/* ---------- build DOM / SVG ---------- */
const CAR_SVG = `<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="currentColor" d="M12.6 13.5c.7-2.1 2.7-3.5 4.9-3.5h13c2.2 0 4.2 1.4 4.9 3.5l3 8.8c1.6.6 2.6 2.1 2.6 3.8V35c0 1.1-.9 2-2 2h-1.5v2.5c0 1.1-.9 2-2 2h-2.4c-1.1 0-2-.9-2-2V37H16.9v2.5c0 1.1-.9 2-2 2h-2.4c-1.1 0-2-.9-2-2V37H9c-1.1 0-2-.9-2-2v-8.9c0-1.7 1-3.2 2.6-3.8l3-8.8zm4.9.5c-.5 0-.9.3-1.1.8L14.2 21h19.6l-2.2-6.2c-.2-.5-.6-.8-1.1-.8h-13zM13 25.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm22 0a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"/></svg>`;

function svg(tag, attrs, parent) {
  const n = document.createElementNS(SVGNS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}

function buildScene() {
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  const R = CONFIG.roads;

  els.boundary = boundaryRings.map(() =>
    svg('path', {
      fill: CONFIG.boundary.fill, stroke: CONFIG.boundary.stroke,
      'stroke-width': CONFIG.boundary.strokeWidth, 'stroke-linejoin': 'round', opacity: 0,
    }, $('#boundaryLayer'))
  );

  roads.forEach((road) => {
    const g = svg('g', {}, $('#roadLayer'));
    road.els = {
      glow: svg('path', { fill: 'none', stroke: accent, 'stroke-width': R.glowWidth, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: R.glowOpacity, filter: 'url(#glow)' }, g),
      core: svg('path', { fill: 'none', stroke: accent, 'stroke-width': R.lineWidth, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g),
      head: svg('circle', { r: 9, fill: '#fff', filter: 'url(#glowSoft)', opacity: 0 }, g),
      leader: svg('line', { stroke: accent, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0 }, $('#leaderLayer')),
    };
    const m = document.createElement('div');
    m.className = 'marker';
    m.innerHTML = `<div class="pulse"></div><div class="ring"></div><div class="body" style="color:${accent}">${CAR_SVG}</div>`;
    $('#markers').appendChild(m);
    road.els.marker = m;
    road.els.ring = m.querySelector('.ring');
    road.els.pulse = m.querySelector('.pulse');
    road.els.body = m.querySelector('.body');

    const l = document.createElement('div');
    l.className = 'label';
    l.innerHTML = `<div class="name"></div>${road.props.sub ? '<div class="sub"></div>' : ''}`;
    l.querySelector('.name').textContent = road.props.name;
    if (road.props.sub) l.querySelector('.sub').textContent = road.props.sub;
    $('#labels').appendChild(l);
    road.els.label = l;
    // provisional layout until computeLayout() runs
    road.layout = { t: 0.5, geo: geoAt(road, 0.5), off: [52, -30], size: [0, 0], dir: [1, 0], leader: false };
  });

  els.title = $('#title');
  els.titleBar = $('#title .bar');
  els.titleKicker = $('#title .kicker');
  els.titleHead = $('#title .headline');
  els.callout = $('#callout');
  els.sign = $('#sign');
  els.oldNum = $('#sign .old');
  els.newNum = $('#sign .new');
  els.strike = $('#sign .strike');
  els.meta = $('#callout .meta');
  els.oldNum.textContent = CONFIG.callout.oldValue;
  els.newNum.textContent = CONFIG.callout.newValue;
}

/* ---------- automatic marker + label layout ----------
   Runs once at the final camera. For each road (in reveal order) it picks a
   marker position as close to the midpoint as possible and a label slot that
   never touches a road line, another label, a marker, the title, the speed
   callout, or the edge of the 90% safe area. */
function computeLayout() {
  const L = CONFIG.roads.layout;
  map.jumpTo(cameraAt(CONFIG.duration));
  const lines = roads.map((r) => r.coords.map(proj));
  const box = (el) => ({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });
  const obstacles = [grow(box(els.title), 18), grow(box(els.callout), 18)];
  const placedLabels = [];
  const placedMarkers = [];
  const MR = 40; // marker radius incl. border

  roads.forEach((road, i) => {
    const forced = typeof road.props.marker?.t === 'number' ? [road.props.marker.t] : L.tCandidates;
    const lw = road.els.label.offsetWidth, lh = road.els.label.offsetHeight;
    let best = null;
    for (const t of forced) {
      const m = proj(geoAt(road, t));
      if (!rectInside(grow({ x: m[0], y: m[1], w: 0, h: 0 }, MR), SAFE)) continue;
      if (placedMarkers.some((p) => Math.hypot(p[0] - m[0], p[1] - m[1]) < L.minMarkerGap)) continue;
      if (lines.some((ln, j) => j !== i && distToPoly(m, ln) < L.minMarkerToOtherRoad)) continue;
      for (const d of L.distances) {
        for (let a = 0; a < 360; a += L.angleStepDeg) {
          const rad = (a * Math.PI) / 180;
          const ux = Math.cos(rad), uy = Math.sin(rad);
          // label box sits `d` px from the marker centre, on the side facing the marker
          const cx = m[0] + ux * (d + MR * 0.2) + (ux * lw) / 2;
          const cy = m[1] + uy * (d + MR * 0.2) + (uy * lh) / 2;
          const r = { x: cx - lw / 2, y: cy - lh / 2, w: lw, h: lh };
          if (!rectInside(r, SAFE)) continue;
          const rp = grow(r, L.labelPad);
          if (lines.some((ln) => polyHitsRect(ln, rp))) continue;
          if (obstacles.some((o) => rectsOverlap(o, r))) continue;
          if (placedLabels.some((o) => rectsOverlap(grow(o, 14), r))) continue;
          if ([...placedMarkers, m].some((p) => rectsOverlap(grow({ x: p[0], y: p[1], w: 0, h: 0 }, MR + 8), r))) continue;
          const end = nearestOnRect(m, r);
          let crossings = 0;
          lines.forEach((ln, j) => {
            if (j === i) return;
            for (let k = 1; k < ln.length; k++) if (segsIntersect(m, end, ln[k - 1], ln[k])) crossings++;
          });
          const score = L.midpointWeight * Math.abs(t - 0.5) + d + L.crossingPenalty * crossings + 0.25 * d * Math.abs(uy);
          if (!best || score < best.score) best = { score, t, m, r, d };
        }
      }
    }
    if (!best) {
      console.warn(`[layout] no clean slot for ${road.props.name}; using midpoint/right side`);
      const m = proj(geoAt(road, 0.5));
      best = { t: 0.5, m, r: { x: m[0] + MR + 16, y: m[1] - lh / 2, w: lw, h: lh }, d: MR + 16 };
    }
    placedMarkers.push(best.m);
    placedLabels.push(best.r);
    road.layout = {
      t: best.t,
      geo: geoAt(road, best.t),
      off: [best.r.x - best.m[0], best.r.y - best.m[1]], // label top-left relative to marker (px)
      size: [lw, lh],
      leader: best.d > 70,
    };
    const c = [best.r.x + lw / 2 - best.m[0], best.r.y + lh / 2 - best.m[1]];
    const n = Math.hypot(...c) || 1;
    road.layout.dir = [c[0] / n, c[1] / n];
  });
}

/* ---------- one frame ---------- */
function applyFrame(t) {
  const D = CONFIG.duration;
  t = Math.max(0, Math.min(t, D));
  map.jumpTo(cameraAt(t));

  // boundary
  const B = CONFIG.boundary;
  const bo = tween(t, B.fadeStart, B.fadeEnd - B.fadeStart, B.ease);
  boundaryRings.forEach((ring, i) => {
    const pts = ring.map(proj);
    els.boundary[i].setAttribute('d', bo > 0 ? 'M' + pts.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('L') + 'Z' : '');
    els.boundary[i].setAttribute('opacity', bo.toFixed(4));
  });

  // title
  const T = CONFIG.title;
  const tb = tween(t, T.start, T.dur, T.ease);
  els.titleBar.style.transform = `scaleY(${tb})`;
  els.titleBar.style.opacity = tb;
  [els.titleKicker, els.titleHead].forEach((el, k) => {
    const p = tween(t, T.start + T.stagger * (k + 1), T.dur, T.ease);
    el.style.opacity = p;
    el.style.transform = `translateX(${(1 - p) * T.slideX}px)`;
  });

  // roads
  const R = CONFIG.roads;
  const A = CONFIG.ambient;
  roads.forEach((road, i) => {
    const s = R.start + R.stagger * i;
    const E = road.els;

    const dp = tween(t, s, R.draw.dur, R.draw.ease);
    const { d, tip } = partialScreen(road.coords.map(proj), dp);
    E.glow.setAttribute('d', d);
    E.core.setAttribute('d', d);
    // bright head dot rides the tip while drawing, then fades
    const headOn = dp > 0 ? 1 - tween(t, s + R.draw.dur * 0.7, R.draw.dur * 0.5, 'easeOut') : 0;
    E.head.setAttribute('opacity', (headOn * Math.min(1, dp * 6)).toFixed(3));
    if (tip) { E.head.setAttribute('cx', tip[0]); E.head.setAttribute('cy', tip[1]); }

    // marker
    const m = proj(road.layout.geo);
    E.marker.style.transform = `translate(${m[0]}px, ${m[1]}px)`;
    const mp = clamp01((t - s - R.marker.delay) / R.marker.dur);
    let scale = mp > 0 ? markerPop(mp) : 0;
    E.body.style.opacity = clamp01(mp * 4);

    // intro ring
    const rp = clamp01((t - s - R.ring.delay) / R.ring.dur);
    const re = easeFn(R.ring.ease)(rp);
    E.ring.style.transform = `scale(${lerp(R.ring.fromScale, R.ring.toScale, re)})`;
    E.ring.style.opacity = rp > 0 && rp < 1 ? (1 - re) * 0.9 : 0;

    // ambient pulse during the hold
    let pulseRing = 0, pulseScale = 1;
    if (t >= A.pulseStart) {
      const local = t - A.pulseStart - A.pulseStagger * i;
      if (local >= 0) {
        const ph = (local % A.pulseEvery) / A.pulseDur;
        if (ph < 1) {
          pulseScale = 1 + (A.bodyScale - 1) * Math.sin(Math.PI * EASES.sineInOut(ph));
          pulseRing = ph;
        }
      }
    }
    E.body.style.transform = `scale(${(scale * pulseScale).toFixed(4)})`;
    const pr = EASES.expoOut(pulseRing);
    E.pulse.style.transform = `scale(${lerp(1, A.ringScale, pr)})`;
    E.pulse.style.opacity = pulseRing > 0 ? (A.ringOpacity * (1 - pr)).toFixed(3) : 0;

    // label + leader
    const lay = road.layout;
    const lp = tween(t, s + R.label.delay, R.label.dur, R.label.ease);
    const slide = (1 - lp) * R.label.slide;
    const lx = m[0] + lay.off[0] - lay.dir[0] * slide;
    const ly = m[1] + lay.off[1] - lay.dir[1] * slide;
    E.label.style.transform = `translate(${lx}px, ${ly}px)`;
    E.label.style.opacity = lp;

    if (lay.leader) {
      const kp = tween(t, s + R.leader.delay, R.leader.dur, R.leader.ease);
      const rect = { x: m[0] + lay.off[0], y: m[1] + lay.off[1], w: lay.size[0], h: lay.size[1] };
      const end = nearestOnRect(m, rect);
      const v = [end[0] - m[0], end[1] - m[1]];
      const len = Math.hypot(...v) || 1;
      const a = [m[0] + (v[0] / len) * 38, m[1] + (v[1] / len) * 38];
      E.leader.setAttribute('x1', a[0]); E.leader.setAttribute('y1', a[1]);
      E.leader.setAttribute('x2', lerp(a[0], end[0], kp)); E.leader.setAttribute('y2', lerp(a[1], end[1], kp));
      E.leader.setAttribute('opacity', kp > 0 ? Math.min(1, kp * 3) : 0);
    }
  });

  // speed callout
  const Cc = CONFIG.callout;
  const cs = Cc.start;
  const sp = clamp01((t - cs - Cc.sign.at) / Cc.sign.dur);
  const se = easeFn(Cc.sign.ease)(sp);
  els.sign.style.opacity = EASES.easeOut(clamp01(sp * 2.2));
  els.sign.style.transform = `translateY(${(1 - se) * Cc.sign.rise}px) scale(${lerp(0.86, 1, se)})`;
  const sk = tween(t, cs + Cc.strike.at, Cc.strike.dur, Cc.strike.ease);
  const fl = tween(t, cs + Cc.flip.at, Cc.flip.dur, Cc.flip.ease);
  const numH = 116;
  els.oldNum.style.transform = `translateY(${-fl * numH}px)`;
  els.oldNum.style.opacity = 1 - fl;
  els.newNum.style.transform = `translateY(${(1 - fl) * numH}px)`;
  els.newNum.style.opacity = fl;
  els.strike.style.transform = `translateY(${-fl * numH}px) rotate(-24deg) scaleX(${sk})`;
  els.strike.style.opacity = 1 - fl;
  const mt = tween(t, cs + Cc.meta.at, Cc.meta.dur, Cc.meta.ease);
  els.meta.style.opacity = mt;
  els.meta.style.transform = `translateX(${(1 - mt) * Cc.meta.slideX}px)`;
}

/* ---------- export API (used by tools/export.mjs) ---------- */
async function renderAt(t) {
  applyFrame(t);
  await waitForMap();
  map.redraw();
  await nextFrame();
  await nextFrame();
}

/* ---------- live playback ---------- */
const play = { playing: false, t0: 0, t: 0, last: -1 };
function restart() {
  play.t = 0;
  play.t0 = performance.now();
  play.playing = true;
}
function loop(now) {
  if (play.playing) {
    play.t = (now - play.t0) / 1000;
    if (play.t >= CONFIG.duration) { play.t = CONFIG.duration; play.playing = false; }
  }
  if (play.t !== play.last) {
    applyFrame(play.t);
    map.redraw(); // keep the canvas in lockstep with the DOM/SVG overlays
    play.last = play.t;
    $('#time').textContent = play.t.toFixed(2) + 's';
  }
  requestAnimationFrame(loop);
}
function step(frames) {
  play.playing = false;
  play.t = Math.max(0, Math.min(CONFIG.duration, Math.round(play.t * CONFIG.fps + frames) / CONFIG.fps));
}
function bindUI() {
  $('#replay').addEventListener('click', restart);
  addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') restart();
    else if (e.key === ' ') {
      e.preventDefault();
      if (play.playing) play.playing = false;
      else {
        if (play.t >= CONFIG.duration) play.t = 0;
        play.t0 = performance.now() - play.t * 1000;
        play.playing = true;
      }
    } else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'g' || e.key === 'G') document.body.classList.toggle('guides');
    else if (e.key === 'h' || e.key === 'H') document.body.classList.toggle('export'); // hide UI for screen recording
  });
  let idleTimer;
  addEventListener('mousemove', () => {
    document.body.classList.remove('idle');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => play.playing && document.body.classList.add('idle'), 1800);
  });
}

/* ---------- boot ---------- */
async function boot() {
  const [roadData, boundaryData, style] = await Promise.all([
    loadJSON(CONFIG.data.roads),
    loadJSON(CONFIG.data.boundary),
    resolveStyle(),
  ]);

  roads = roadData.features
    .filter((f) => f.geometry && f.geometry.type === 'LineString')
    .sort((a, b) => (a.properties.order ?? 0) - (b.properties.order ?? 0))
    .map((f) => ({ props: f.properties, coords: f.geometry.coordinates, cum: planarCum(f.geometry.coordinates) }));
  for (const f of boundaryData.features) {
    const g = f.geometry;
    if (g.type === 'Polygon') boundaryRings.push(g.coordinates[0]);
    if (g.type === 'MultiPolygon') g.coordinates.forEach((p) => boundaryRings.push(p[0]));
  }

  map = new maplibregl.Map({
    container: 'map',
    style,
    interactive: false,
    attributionControl: false,
    fadeDuration: 0, // deterministic labels, frame to frame
    pixelRatio: MODE.export ? 1 : Math.min(devicePixelRatio || 1, 2),
    canvasContextAttributes: { preserveDrawingBuffer: true, antialias: true },
    preserveDrawingBuffer: true, // older MapLibre option name
    maxTileCacheSize: 4000,
    maxPitch: 70,
    ...cameraAt(0),
  });
  await new Promise((r) => (map.loaded() ? r() : map.once('load', r)));
  muteBasemap();

  await document.fonts.ready;
  buildScene();
  applyFrame(CONFIG.duration); // final state, so layout measures real sizes
  computeLayout();

  // Preload: visit the camera path and wait for every tile before playing.
  const samples = [];
  for (let t = 0; t <= CONFIG.camera.zoomOut.end; t += 0.1) samples.push(t);
  samples.push(CONFIG.camera.zoomOut.end, CONFIG.duration);
  for (const t of samples) {
    map.jumpTo(cameraAt(t));
    await waitForMap(10000);
  }
  applyFrame(0);
  await waitForMap();
  $('#loading').classList.add('done');
}

window.__anim = {
  config: CONFIG,
  ready: boot().catch((err) => {
    console.error('[boot]', err);
    $('#loading').textContent = 'Error: ' + err.message;
    throw err;
  }),
  renderAt,
};

window.__anim.ready.then(() => {
  if (MODE.export) return;
  bindUI();
  if (MODE.freezeAt != null) play.t = MODE.freezeAt;
  else restart();
  requestAnimationFrame(loop);
});
