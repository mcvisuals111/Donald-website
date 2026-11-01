// Replace the hand-traced geometry with exact OpenStreetMap data.
//
//   npm run fetch-osm
//
// For every feature in roads.json it pulls the named road from Overpass,
// builds a single centreline (divided sections are averaged into one line),
// and clips it exactly where it crosses the `from` / `to` streets listed in
// properties.osm. It also rebuilds pinecrest-boundary.geojson from the
// official OSM admin boundary of the Village of Pinecrest.
//
// Options: --dry-run (print a summary, write nothing)
//          OVERPASS_URL=... to use another Overpass mirror
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROADS = path.join(ROOT, 'roads.json');
const BOUNDARY = path.join(ROOT, 'pinecrest-boundary.geojson');
const OVERPASS = process.env.OVERPASS_URL || 'https://overpass-api.de/api/interpreter';
const DRY = process.argv.includes('--dry-run');
const BBOX = [25.62, -80.36, 25.72, -80.26]; // S, W, N, E — Pinecrest plus a margin

const roadsDoc = JSON.parse(fs.readFileSync(ROADS, 'utf8'));
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ---------- query ----------
const names = new Set();
const refs = new Set();
for (const f of roadsDoc.features) {
  const o = f.properties.osm || {};
  (o.names || []).forEach((n) => names.add(n));
  for (const end of [o.from, o.to]) {
    (end?.names || []).forEach((n) => names.add(n));
    (end?.refs || []).forEach((r) => refs.add(r));
  }
}
const nameRe = `^(${[...names].map(esc).join('|')})$`;
const bb = BBOX.join(',');
const query = `[out:json][timeout:120];
(
  way["highway"]["name"~"${nameRe}",i](${bb});
  way["highway"]["alt_name"~"${nameRe}",i](${bb});
  way["highway"]["official_name"~"${nameRe}",i](${bb});
  ${[...refs].map((r) => `way["highway"]["ref"~"(^|;)\\\\s*${esc(r)}\\\\s*(;|$)"](${bb});`).join('\n  ')}
  relation["boundary"="administrative"]["name"~"^(Village of )?Pinecrest$"](${bb});
);
out geom;`;

console.log(`Querying ${OVERPASS} ...`);
const res = await fetch(OVERPASS, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'pinecrest-speed-map/0.1 (student news graphic)' },
  body: 'data=' + encodeURIComponent(query),
});
if (!res.ok) throw new Error(`Overpass HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
const osm = await res.json();
const ways = osm.elements.filter((e) => e.type === 'way' && e.geometry);
const rels = osm.elements.filter((e) => e.type === 'relation');
console.log(`  ${ways.length} ways, ${rels.length} boundary relation(s)`);

// ---------- helpers ----------
const tagNames = (w) => ['name', 'alt_name', 'official_name', 'old_name'].flatMap((k) => (w.tags?.[k] || '').split(';').map((s) => s.trim().toLowerCase())).filter(Boolean);
const refList = (w) => (w.tags?.ref || '').split(';').map((s) => s.trim().toLowerCase());
const matches = (w, ns = [], rs = []) => {
  const tn = tagNames(w);
  const rl = refList(w);
  return ns.some((n) => tn.includes(n.toLowerCase())) || rs.some((r) => rl.includes(r.toLowerCase()));
};
const K = Math.cos((25.67 * Math.PI) / 180);
const M_PER_DEG = 111320;
const lineOf = (w) => w.geometry.map((g) => [g.lon, g.lat]);

function densify(line, stepM = 8) {
  const out = [line[0]];
  for (let i = 1; i < line.length; i++) {
    const [x0, y0] = line[i - 1], [x1, y1] = line[i];
    const d = Math.hypot((x1 - x0) * K, y1 - y0) * M_PER_DEG;
    const n = Math.max(1, Math.ceil(d / stepM));
    for (let k = 1; k <= n; k++) out.push([x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n]);
  }
  return out;
}
const median = (a) => { const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

/** one centreline from possibly-divided OSM ways, as points sorted along the axis */
function centreline(lines, axis, lo, hi, binDeg = 0.00018) {
  const A = axis === 'lat' ? 1 : 0; // index of the along-axis coordinate
  const P = 1 - A;
  const bins = new Map();
  for (const line of lines) for (const p of densify(line)) {
    if (p[A] < lo || p[A] > hi) continue;
    const b = Math.round(p[A] / binDeg);
    if (!bins.has(b)) bins.set(b, []);
    bins.get(b).push(p[P]);
  }
  // divided roads: the two carriageways bound each bin, so take their midrange
  // (falls back to the median if the spread is too wide to be one road)
  const raw = [...bins.entries()].sort((a, b) => a[0] - b[0]).map(([b, perps]) => {
    const mn = Math.min(...perps), mx = Math.max(...perps);
    const spreadM = (mx - mn) * M_PER_DEG * (P === 0 ? K : 1);
    return [b * binDeg, spreadM < 60 ? (mn + mx) / 2 : median(perps)];
  });
  // light moving-average so the line glides instead of stepping
  return raw.map(([along], i) => {
    const win = raw.slice(Math.max(0, i - 2), i + 3);
    const pt = [0, 0];
    pt[A] = along;
    pt[P] = win.reduce((s, w) => s + w[1], 0) / win.length;
    return pt;
  });
}
function simplify(pts, tolM = 1.5) {
  // Douglas–Peucker in metres
  if (pts.length < 3) return pts;
  const tol = tolM / M_PER_DEG;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    let max = 0, idx = -1;
    const [ax, ay] = [pts[a][0] * K, pts[a][1]], [bx, by] = [pts[b][0] * K, pts[b][1]];
    for (let i = a + 1; i < b; i++) {
      const px = pts[i][0] * K, py = pts[i][1];
      const vx = bx - ax, vy = by - ay;
      const u = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy || 1)));
      const d = Math.hypot(px - (ax + u * vx), py - (ay + u * vy));
      if (d > max) { max = d; idx = i; }
    }
    if (max > tol) { keep[idx] = 1; stack.push([a, idx], [idx, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
function segX(p1, p2, p3, p4) {
  const d = (p2[0] - p1[0]) * (p4[1] - p3[1]) - (p2[1] - p1[1]) * (p4[0] - p3[0]);
  if (!d) return null;
  const u = ((p3[0] - p1[0]) * (p4[1] - p3[1]) - (p3[1] - p1[1]) * (p4[0] - p3[0])) / d;
  const v = ((p3[0] - p1[0]) * (p2[1] - p1[1]) - (p3[1] - p1[1]) * (p2[0] - p1[0])) / d;
  return u >= 0 && u <= 1 && v >= 0 && v <= 1 ? [p1[0] + u * (p2[0] - p1[0]), p1[1] + u * (p2[1] - p1[1])] : null;
}
/** where the centreline crosses any of the cross-street lines, nearest to `approx` on the axis */
function crossing(cl, crossLines, axis, approx) {
  const A = axis === 'lat' ? 1 : 0;
  let best = null;
  for (const line of crossLines) for (let j = 1; j < line.length; j++) for (let i = 1; i < cl.length; i++) {
    const x = segX(cl[i - 1], cl[i], line[j - 1], line[j]);
    if (x && (!best || Math.abs(x[A] - approx) < Math.abs(best[A] - approx))) best = x;
  }
  return best && Math.abs(best[A] - approx) < 0.008 ? best : null;
}
function clip(cl, axis, a, b) {
  const A = axis === 'lat' ? 1 : 0;
  const lo = Math.min(a[A], b[A]), hi = Math.max(a[A], b[A]);
  const inner = cl.filter((p) => p[A] > lo && p[A] < hi);
  const out = [a, ...(a[A] < b[A] ? inner : inner.reverse()), b];
  return out;
}
function pointOnAxis(cl, axis, v) {
  const A = axis === 'lat' ? 1 : 0;
  const s = [...cl].sort((p, q) => p[A] - q[A]);
  for (let i = 1; i < s.length; i++) if (s[i][A] >= v) {
    const u = (v - s[i - 1][A]) / (s[i][A] - s[i - 1][A] || 1);
    return [s[i - 1][0] + u * (s[i][0] - s[i - 1][0]), s[i - 1][1] + u * (s[i][1] - s[i - 1][1])];
  }
  return s[s.length - 1];
}
const r6 = (p) => [Math.round(p[0] * 1e6) / 1e6, Math.round(p[1] * 1e6) / 1e6];

// ---------- roads ----------
for (const f of roadsDoc.features) {
  const o = f.properties.osm;
  if (!o) continue;
  const own = ways.filter((w) => matches(w, o.names)).map(lineOf);
  if (!own.length) { console.warn(`  ! ${f.properties.name}: no OSM ways matched ${o.names.join(' / ')} — kept existing geometry`); continue; }
  const lo = Math.min(o.from.approx, o.to.approx) - 0.006;
  const hi = Math.max(o.from.approx, o.to.approx) + 0.006;
  const cl = centreline(own, o.axis, lo, hi);
  const ends = [o.from, o.to].map((end) => {
    const cross = ways.filter((w) => matches(w, end.names, end.refs)).map(lineOf);
    const x = crossing(cl, cross, o.axis, end.approx);
    if (!x) console.warn(`  ! ${f.properties.name}: could not find crossing with ${(end.names || end.refs || []).join('/')} — using approx ${end.approx}`);
    return x || pointOnAxis(cl, o.axis, end.approx);
  });
  const coords = simplify(clip(cl, o.axis, ends[0], ends[1])).map(r6);
  const lenM = coords.reduce((s, p, i) => (i ? s + Math.hypot((p[0] - coords[i - 1][0]) * K, p[1] - coords[i - 1][1]) * M_PER_DEG : 0), 0);
  console.log(`  ✓ ${f.properties.name}: ${own.length} ways -> ${coords.length} pts, ${(lenM / 1609.34).toFixed(2)} mi`);
  f.geometry = { type: 'LineString', coordinates: coords };
}
roadsDoc.metadata = { ...roadsDoc.metadata, geometrySource: `OpenStreetMap via Overpass, fetched ${new Date().toISOString().slice(0, 10)} (© OpenStreetMap contributors, ODbL)` };

// ---------- boundary ----------
function stitchRings(lines) {
  const key = (p) => p[0].toFixed(7) + ',' + p[1].toFixed(7);
  const rings = [];
  const pool = lines.map((l) => [...l]);
  while (pool.length) {
    let ring = pool.shift();
    let grew = true;
    while (key(ring[0]) !== key(ring[ring.length - 1]) && grew) {
      grew = false;
      for (let i = 0; i < pool.length; i++) {
        const l = pool[i];
        const tail = key(ring[ring.length - 1]);
        if (key(l[0]) === tail) ring = ring.concat(l.slice(1));
        else if (key(l[l.length - 1]) === tail) ring = ring.concat([...l].reverse().slice(1));
        else continue;
        pool.splice(i, 1); grew = true; break;
      }
    }
    if (ring.length > 3) rings.push(ring);
  }
  return rings;
}
let boundaryDoc = null;
const rel = rels.find((r) => /pinecrest/i.test(r.tags?.name || ''));
if (rel) {
  const outer = rel.members.filter((m) => m.type === 'way' && (m.role === 'outer' || m.role === '') && m.geometry).map((m) => m.geometry.map((g) => [g.lon, g.lat]));
  const rings = stitchRings(outer).map((r) => simplify(r, 2).map(r6));
  boundaryDoc = {
    type: 'FeatureCollection',
    metadata: { geometrySource: `OpenStreetMap relation ${rel.id}, fetched ${new Date().toISOString().slice(0, 10)} (© OpenStreetMap contributors, ODbL)` },
    features: [{
      type: 'Feature',
      properties: { name: rel.tags.name, osm_id: rel.id },
      geometry: rings.length === 1 ? { type: 'Polygon', coordinates: rings } : { type: 'MultiPolygon', coordinates: rings.map((r) => [r]) },
    }],
  };
  console.log(`  ✓ boundary: relation ${rel.id}, ${rings.length} ring(s), ${rings.reduce((s, r) => s + r.length, 0)} pts`);
} else console.warn('  ! Pinecrest boundary relation not found — kept existing boundary');

if (DRY) { console.log('Dry run: nothing written.'); process.exit(0); }
fs.writeFileSync(ROADS, JSON.stringify(roadsDoc, null, 2) + '\n');
if (boundaryDoc) fs.writeFileSync(BOUNDARY, JSON.stringify(boundaryDoc) + '\n');
console.log('Wrote roads.json' + (boundaryDoc ? ' and pinecrest-boundary.geojson' : ''));
