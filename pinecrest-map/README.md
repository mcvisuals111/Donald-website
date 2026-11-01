# Pinecrest speed limit map (8-second broadcast graphic)

An animated map for the news package on Pinecrest, FL lowering speed limits from 35 to 30 mph on Ludlam Rd, Palmetto Rd, SW 72nd Ave and Killian Dr. It's built with MapLibre GL JS on CARTO Dark Matter. The canvas is 1920×1080 at 30 fps, and the animation is timed with Motion (motion.dev) easing curves.

> **Style is a placeholder.** The colors, fonts, speed-limit sign and label design are temporary. They get replaced once the style references are in.

## Setup (once)

Install Node.js 18 or newer and ffmpeg (`brew install ffmpeg` on a Mac). Then:

```bash
cd pinecrest-map
npm install
```

## Preview

```bash
npm start
```

Open http://localhost:5173. The page loads every map tile along the camera path first and then plays.

| Key | Action |
| --- | --- |
| **R** or the Replay button | Restart |
| **Space** | Pause / resume |
| **← / →** | Step one frame (while paused) |
| **G** | Show the 90% broadcast safe area |
| **H** | Hide all UI (for screen recording) |

URL options: `?t=4.2` freezes on a single moment, `?guides` turns on the safe area, `?nomap` hides the basemap.

## Export

```bash
npm run export
```

This writes two files to `out/`:

- `pinecrest-speed-map.mp4`: H.264, 1920×1080, 30 fps, 240 frames
- `pinecrest-speed-map_prores4444.mov`: ProRes 4444

```bash
npm run export:alpha
```

This writes `out/pinecrest-speed-map_alpha_prores4444.mov`. It is ProRes 4444 with a transparent background: the basemap is hidden and only the overlays render (boundary, roads, markers, labels, title, sign), so you can composite it over your own footage in Premiere or After Effects.

The export doesn't record your screen. Puppeteer moves the graphic to the exact time of each frame (`frame / 30`), waits until every map tile has finished drawing, and saves that frame as a PNG. ffmpeg then encodes the PNGs. Every frame comes out the same on every run, with no dropped frames.

Extra options: `--from 2.4 --to 6.4` renders part of the timeline, `--keep-frames` keeps the PNGs, and `--out dir` changes the output folder. If Puppeteer can't find Chrome, set `CHROME_PATH=/path/to/chrome`.

## Retiming to your VO

Every time, easing and camera value is in the `CONFIG` object at the top of **`app.js`**.

| Block | Time (s) | Controls |
| --- | --- | --- |
| `camera.start`, `camera.drift` | 0.0–0.4 | Tight street-level shot plus a slow drift |
| `camera.zoomOut` | 0.4–2.6 | Zoom out, tilt and rotate (quart in-out ease) |
| `boundary` | 1.5–2.6 | Pinecrest outline fades in |
| `title` | 2.4–2.9 | Title block slides in |
| `roads` | 2.8–5.6 | Roads draw in 0.6 s apart: line, then car marker with pulse ring, then label |
| `callout` | 5.4–6.4 | Sign enters, 35 is struck through and rolls to 30, then the MPH line |
| `camera.hold`, `ambient` | 6.4–8.0 | 3% push-in, marker pulses every 1 s |

An `ease` value is either a name (`quartInOut`, `expoOut`, `backOut`, …, listed under `EASES` in `app.js`) or a cubic-bezier array such as `[0.76, 0, 0.24, 1]`.

## Road data

- **`roads.json`** has the roads, one GeoJSON `LineString` per road. `properties.order` sets the reveal order, and `name` / `sub` are the label text.
- **`pinecrest-boundary.geojson`** has the village outline.

**The geometry in the repo is a first-pass hand trace.** It hasn't been checked against the real roads. It was drawn on the Miami-Dade street grid because the build environment couldn't reach OpenStreetMap. To replace it with exact OpenStreetMap data, run:

```bash
npm run fetch-osm
```

The script queries Overpass for each road. On a divided road it averages the two carriageways into one centreline, then cuts the line exactly where it crosses the listed cross streets: Kendall Dr, SW 104th St, US-1, Howard Dr and Red Rd. It also pulls the official Pinecrest boundary. Add `--dry-run` to see a summary without writing anything.

### Adding a road

Copy a feature in `roads.json` and change `id`, `order`, `name`, `sub` and the `osm` block. The `osm` block holds the road's OSM names, which axis it runs along (`lat` for north–south, `lon` for east–west), and the `from` / `to` cross streets. Then run `npm run fetch-osm`. The timeline adds the new road automatically.

### Marker and label placement

Each car marker goes as close to the road's midpoint as it can without landing on an intersection or another marker. Each label goes in the nearest spot where it doesn't touch any road line, another label, the title, the sign, or the edge of the safe area. If a label ends up far from its marker, a thin leader line connects them. To pin a marker yourself, set `"marker": { "t": 0.4 }`, where `t` is the fraction of the way along the road.

## Files

```
index.html                 stage, overlays, placeholder CSS
app.js                     CONFIG + animation/timeline engine
roads.json                 road geometry and labels
pinecrest-boundary.geojson village outline
tools/serve.mjs            local preview server
tools/export.mjs           Puppeteer + ffmpeg frame-accurate export
tools/fetch-osm.mjs        pulls exact geometry from OpenStreetMap
```

Map data © OpenStreetMap contributors, basemap © CARTO.
