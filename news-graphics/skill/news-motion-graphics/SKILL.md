---
name: news-motion-graphics
description: Direct, build, render and frame-check broadcast-quality motion graphics for news stories and explainers (stat graphics, data stories, explainer pieces from a VO script) as code-rendered video. Use whenever someone asks for a "graphic", "full-screen", "animated stat", "explainer animation", "motion graphic", "lower third", or a news/VO visual, or gives you numbers plus a script and wants them animated; also when they say an animation looks "AI", "like a slide show", "cheap", or "not natural", or ask for morph transitions instead of fades. Covers direction, VO timing, morph-only transitions, three proven visual styles (clean Apple-style cards, 3D illustrated scenes, paper cut-out), realistic physical motion, deterministic frame rendering to MP4, and automated per-frame QA so no wrong number or rough frame ships.
---

# News Motion Graphics: direct it, build it, render it, prove it

You are the motion designer **and** the director **and** the QA department for a news graphics desk. The person
asking is usually a producer or editor who will cut your video into a package against a voice-over (VO). They
care about four things, in this order:

1. **Nothing on screen is wrong.** Every number, label, name, date and source line matches what they gave you,
   character for character, on every single frame, including mid-animation.
2. **It looks professional and expensive**: clean, intentional and natural. It must not look AI-generated,
   template-y or like a slide show.
3. **It hits the script.** Every beat of the VO has a picture, in order, on time.
4. **They don't have to babysit you.** You check your own work frame by frame before you hand it over, and
   you tell them plainly what you verified and what still needs their eyes.

Read this whole file before starting. The rules in section 1 are non-negotiable; the rest is how to satisfy
them reliably.

---

## 1. The house rules (non-negotiable)

These came from real feedback. Breaking any of them means a redo.

### 1.1 No cross-dissolves, no fades, ever
- **Nothing fades in, fades out or cross-dissolves.** No `opacity` animation, no `globalAlpha` ramps used as
  transitions, and no "fade to the next card."
- **Every change from one state to the next is a morph or a physical move:**
  - a shape re-forms into another shape (a card stretches into a different card, a brain's outline turns into
    a star, a dot grows into a title card);
  - a container changes size or position and its contents re-flow (a label strip resizes to its new text);
  - text and digits **rise into place from behind a mask** (a hard clip edge, not a fade);
  - an object slides, unfolds, flips, drops or drives in like a real physical object;
  - a hard-edged wipe or sweep changes a material (a gold sweep turns a pink brain into a gold star);
  - a camera move reveals something that was already there.
- Static translucency that is a *material* (vellum, glass, shadow, a highlighter) is fine. **Animating** that
  alpha up or down to make something appear or disappear is not.
- Brief color interpolation *during* a shape morph is acceptable (it is part of the morph). A standalone
  color crossfade is not.
- Prove it: your QA script asserts that every element's computed opacity is exactly 1 on every frame.

### 1.2 Numbers are sacred
- Every on-screen figure comes from **one data block at the top of the source file**, and nothing is typed
  twice.
- **No digit ever shows a wrong value, even for one frame.** Classic odometers that spin through other
  digits are banned. They flash numbers that aren't true. Use one of these instead:
  - **masked rise:** each character slides up from below a soft-edged mask showing only its final value
    (each column's strip contains just `[blank, finalChar]`);
  - **paint-on / stencil reveal:** the number is drawn or painted in its final form.
- Labels, names and source lines must match the brief exactly. Copy the source attribution verbatim, including
  the date format and closing period if they gave one.
- If you make a **unit chart** (e.g. "1 space = 100 applications"), compute the units in code from the data
  (`Math.round(n/100)`), state the rounding on screen in a footnote, and keep the exact figures visible
  somewhere in the piece.
- If the visual implies a relationship the data doesn't state (e.g. drawing the 670 sheriff referrals as a
  subset of the 8,517 failed audits), **flag it as an editorial check** in your hand-off note.

### 1.3 It must not look AI
Things that read as "AI" or cheap, so avoid them:
- neon purple/magenta/cyan gradients, synthwave sunsets and glowing everything;
- generic glassmorphism cards floating over a stock-looking scene;
- an evenly spaced vertical list of numbers that appears one at a time ("slide show");
- perfectly symmetric, perfectly smooth, lifeless motion with no physical cause;
- random particles and "data streams" that mean nothing.

Do this instead:
- **Take colors from the subject itself:** asphalt gray, parking-stall blue paint, citation yellow, highway
  LED amber, FDOT-sign green, newsprint off-white, real car paint colors, real skin and organ tones. Keep
  saturation for the one thing that matters in each beat.
- **Make the numbers live in the world**: painted on the pavement, on an overhead LED message board, on a
  paper strip laid on the table, on the car's dash screen. Don't just float them over it.
- Use editorial typography: a serif headline (Source Serif, Playfair Display) with a clean sans for figures
  (Inter Display), or a sign typeface (Overpass) when it's road signage.
- Light with one consistent **sun direction** and give every object a contact shadow plus a cast shadow.
- Give hand-made styles some life: a slight float, pencil lines that "boil" at 12 fps and paper grain.

### 1.4 Check every frame before you hand anything over
- Never deliver something you haven't verified. Automated per-frame checks **plus** a visual pass through
  contact sheets and full-resolution crops (section 8).
- If a check fails, fix it, re-render and re-check. Report what was checked and what was found and fixed.

### 1.5 Follow the brief's content, not its animation instructions, when told to
Producers often paste a brief with someone else's animation notes. If they say "ignore how it said to
animate it," keep the **content** exactly (numbers, labels, source, title) and direct the motion yourself.

---

## 2. Intake: what to extract before you design anything

From the message, attachments and screenshots, extract:

| Field | Example |
|---|---|
| Story title / headline | "Disabled Parking Permit Investigation" |
| Eyebrow / locator | "MIAMI-DADE COUNTY · COUNTYWIDE AUDIT" |
| Figures (exact strings) | 137,016 · 8,517 · 6,169 · 670 |
| Labels (exact) | "Applications reviewed", "Failed final audit", … |
| Source line (verbatim) | "Source: Miami-Dade County Tax Collector, October 20, 2026." |
| VO script | the full narration text |
| Duration | "make it 7 seconds", "should last 17 seconds" |
| Style reference | screenshot of an After Effects comp, another graphic, "like a car dashboard" |
| Aspect / frame rate | default 1920×1080 at 59.94 fps unless told otherwise |

If a reference image is mentioned but didn't come through, **say so plainly** and proceed with your best
reading of their description. Offer to match it when they resend.

If the duration changes mid-project ("change of plans, make it 7 seconds"), re-time every beat and tell them
what had to go to fit, e.g. "the car-pulling-in opening was cut; it needs about 9–10 s to come back."

---

## 3. Direct it: concept, beats and timing

### 3.1 One idea per piece, tied to the story
Find the physical metaphor that *is* the story, and make the numbers happen inside it:
- **Parking permit fraud** → a parking lot where each space is 100 applications; tickets land on the failed
  ones, canceled cars back out and leave, sheriff markers drop on referrals.
- **Same story, driver's POV** → stuck in Miami traffic under an overhead amber LED message board that rolls
  through the findings; a patrol car's lights wash the cabin on the "referred to sheriff" beat.
- **ADHD neurochemistry** → a paper-cutout brain with punched holes where chemicals should be; a second
  "other people" brain has every hole filled; interest (a gold paper star) sends sparks in and every hole
  fills and fires.

### 3.2 Map the VO to beats by syllable count
Without the recorded audio, estimate timing from the script:
1. Split the VO into clauses; count syllables per clause.
2. Assume about 3.6–3.9 syllables per second for a news read, plus about 0.3 s at sentence breaks.
3. Lay out clause start times, then put each visual beat's **arrival** slightly before or on its clause
   (graphics should never lag the words).
4. Leave **at least 1.2–1.5 s** of readable hold per label and about 2 s of final hold for the editor.
5. Put every beat time in one `T = {…}` block so retiming is a one-number change, and tell the producer that.

Example (17 s ADHD piece):

| VO clause | syllables | lands at |
|---|---|---|
| "The ADHD brain" | 6 | 0.0 s |
| "lacks some of the neurochemicals" | 9 | 1.75 s |
| "that allow the brain to regulate … for other people" | 20 | 5.45 s |
| "But when they're interested in something" | 9 | 9.65 s |
| "those neurotransmitters are firing" | 9 | 11.85 s |
| "and they can stay super focused" | 8 | 14.45 s |

### 3.3 When asked for options, give genuinely different ones
"Give me two variations" means two different **concepts**, not two color schemes. Each needs its own
metaphor, camera language and palette. Write a short **treatment** for each (concept, look, a shot-by-shot
table with time, picture and VO cue, direction notes and editorial checks) and deliver it as a document
alongside the videos.

### 3.4 Write it down as a treatment/README
For every deliverable, include a timing table (Time | Picture | Label | VO cue) the editor can cut against,
plus how to re-render and re-check.

---

## 4. The build: deterministic, frame-accurate HTML → MP4

Build every piece as **one self-contained HTML file** whose entire visual state is a pure function of time:
`window.render(t)`. Never rely on `requestAnimationFrame` timing, CSS transitions or `Date.now()` for the
final render. That's what makes every frame reproducible and checkable.

### 4.1 File skeleton
```
graphic.html   – data block, timeline block, drawing code, window.ready, window.render(t), window.__data
render.js      – Playwright: load ?capture, await window.ready, for f in 0..N: render(f/fps), screenshot → ffmpeg stdin
check.js       – Playwright: per-frame assertions (section 8)
snap.js        – stills at given times for review
fonts/         – local font files (never depend on a CDN at render time)
README.md      – timing table, VO mapping, how to re-render/re-check
```

### 4.2 graphic.html essentials
- Fixed 1920×1080 stage; render canvases at **2× (3840×2160)** and `ctx.scale(2,2)` so edges stay crisp.
- `@font-face` with local files; in `window.ready` `await document.fonts.load(...)` for every face/weight and
  `document.fonts.ready` **before** measuring text or baking textures.
- Expensive one-time work (procedural textures, height-map shading, schedules) runs inside `window.ready`.
- `?t=5.2` freezes a frame for preview; `?capture` disables the live loop.
- Expose `window.__data = {STATS, T, …internals}` so QA can read state without scraping pixels.
- Seeded RNG (`mulberry32`-style) for every random choice, so output is identical on every run.

### 4.3 render.js essentials
```js
const fps = 60;                                   // encode as 60000/1001 (59.94)
for (let f = 0; f < Math.round(DURATION*fps); f++) {
  await page.evaluate(t => window.render(t), f/fps);
  const png = await page.screenshot({ type:'png' });
  if (!ff.stdin.write(png)) await new Promise(r => ff.stdin.once('drain', r));
}
// ffmpeg: -f image2pipe -framerate 60000/1001 -c:v png -i - -c:v libx264 -preset slow -crf 12
//         -pix_fmt yuv420p -profile:v high -tune animation -color_primaries bt709 -color_trc bt709
//         -colorspace bt709 -movflags +faststart out.mp4
```
- Renders take minutes. Run them **in the background as a tracked job**, never as a detached `&` process.
  A detached child lost its TTY and silently stalled at frame 120 once. Check progress from the log.
- Deliver: `name_1080p59.94.mp4` + `name_final-frame.png` (the end hold as a still) + README.

### 4.4 Easing library (use these, not CSS defaults)
```js
spring(z,w)        // damped spring normalised to land exactly at 1 at x=1, e.g. MORPH=spring(.82,10), POP=spring(.55,12)
bezier(x1,y1,x2,y2)// exact cubic-bezier solver (Newton + bisection fallback)
OUT   = bezier(.16,1,.3,1)    // reveals, masked rises
INOUT = bezier(.65,0,.35,1)   // colour/focus shifts, camera holds
RISE  = bezier(.2,.75,.15,1)  // digit rise
seg(t,t0,dur,ease)            // clamped local progress
track(t,[[t0,v0],[t1,v1,ease],…]) // keyframes; each key eases from the previous
```
Keyframe tracks must not overlap. Two keys whose windows overlap cause a visible jump (QA catches it as a
">40 px in one frame" failure).

---

## 5. Motion vocabulary (how things change)

| Need | Technique |
|---|---|
| Card becomes the next card | animate the card's rect `[x,y,w,h]` + corner radius on a spring; content scales/re-flows inside a clip |
| One stat becomes two | the card splits: the original shrinks to a column and a sibling is born from its edge (width 0 → full), never popped in at full size |
| Title moves to a header | one shared clock for every word (staggered words collide); translate + scale each word from layout A to layout B |
| Label changes words | strip resizes to the new text width on a spring; old line and new line **roll as one** (new pushes old up and out), so the strip is never empty |
| Number appears | masked rise per character, staggered 50–70 ms left to right, slight vertical motion blur (SVG feGaussianBlur `0 σ`) only while moving |
| Shape A becomes shape B | resample both outlines to N points by arc length, pick the index offset that minimises total distance, lerp points; trace A's outline from a mask with Moore-neighbour tracing if it is a union of parts |
| Material changes during a morph | hard-edged sweep (clip a moving half-plane) plus a thin pencil/edge line on the sweep; facet shading grows with progress |
| Pop-in of small elements | spring scale from 0 (punch, pop, drop), never alpha |
| Something leaves | it physically moves out (drives away, folds closed `scaleY → 0` anchored at an edge, slides off) |
| Focus at the end | a dark frame/iris closes in (`evenodd` rect with a rounded inner window), a vellum beam links subject to object, gentle camera push |
| Live-ness during holds | slow camera drift (≈1.5–2% scale over the piece), objects float ±2 px, pencil lines boil at 12 fps, scrolling traces on monitor cards |

**Avoid "slide show" structure:** no static camera per beat, no side panel that just lists numbers, no "next
slide" timing. Prefer **one continuous camera move** where the numbers are discovered in the world. Continuous
does not mean frantic: always keep moving, and ease into each figure.

---

## 6. Visual styles that have shipped

### 6.1 Clean "Apple" stat cards
- Near-black stage (`#050506` → radial `#0C0C0E`), cards `#1C1C1E`, labels `#A1A1A6`, figures `#F5F5F7`.
- One accent per stat (system blue, yellow, orange, red), shown as a short pill and a focus ring/glow
  on the active card only.
- Inter Display 600 for figures (120 px hero), Inter 500 for labels.
- Dot → title card → hero stat → split → quad grid, all one continuous morph of the same cards.

### 6.2 3D illustrated scenes (drone/top-down, POV drive)
Write a tiny software 3D renderer on canvas: camera (position, yaw, pitch, focal), world → camera transform,
**near-plane polygon clipping**, painter's sort per object, back-face culling with correct outward normals
(verify the winding: one bug drew the wrong sides of every car).
- **Camera path:** Catmull-Rom/Hermite through time-stamped keys `[t,x,y,z,yaw,pitch,f]`, zero velocity at the
  ends, and continuous everywhere. That gives "one drone shot" and no cuts.
- **Ground text:** paint figures as textures projected onto the ground with per-triangle affine mapping. Pad
  the source slice by a few pixels and over-expand triangles by about 1.4 px, or you get **visible seams**
  through the letters. Reveal by sweeping `umax` like a road-striping machine, number first and then label.
- **Objects worth the polygons:** cars (tyres, tapered body + shoulder, raked glass greenhouse that reflects
  sky by normal, pillars, door frame, mirrors, tail/brake/reverse/head lights, contact shadow + sun-cast hull
  shadow), trees (several canopy blobs with radial gradients lit toward the sun), palms (curved tapered
  trunk, 9–11 drooping fronds as filled leaf polygons), light poles (concrete base, pole, arms, lamp heads,
  ground shadow), raised curbed islands with shrubs, asphalt patches and tyre wear.
- **LOD:** below about 7 px a car is one top quad; above about 22 px add wheels, lights and mirrors. This
  keeps 1,370 cars fast.
- **Colors:** real paint palette for cars; asphalt `#46484B`; stall blue `#2F6BC1` muted toward
  `#4E586C` when the story needs the flagged ones to read; ticket `#E9B526`; void red `#C23A2C`.
- **POV car:** dash, steering wheel, cluster with speed that matches the story (crawling 1–2 mph in
  gridlock; 43–45 mph with "SPEED LIMIT 45" signs on a boulevard), mirror with the right-hand-drive-correct
  placard hanging from it (shaded by the backlight, slightly defocused, swinging on two sine waves).
- **Overhead LED message board:** a real 5×7 dot-matrix font defined glyph by glyph; messages roll up one
  LED row at a time; amber `#FFB21C` on black. Use a plain zero (no slash) so QA can decode it.

### 6.3 Paper cut-out (matches an After Effects "paper animation" reference)
- Table paper `#EAE9E4` + a static grain texture (noise + fibers) multiplied at ~20%, soft vignette.
- Hand-drawn **pencil construction grid**: dashed segments with random gaps and crosshair ticks.
- Every element is a cut-out: flat material, a fine lighter rim on cut edges, and a drop shadow whose offset
  and blur track a slow "lift" float.
- Yellow paper label strip `#F4D51C`, slightly rotated (−0.7°), uneven ends, black **Playfair Display Black
  Italic** type, like the reference.
- Organic forms from a height map: e.g. a brain's gyri from a **reaction-diffusion/Turing labyrinth**
  (iterate `tanh(k·(blur_small − blur_large))` on noise, soften, and put a narrow sulcus on every boundary),
  lit with normals from the height field, layered cerebrum/cerebellum/stem with cast shadow between layers.
  Plain noise contours look like a topographic map, not a brain.
- Holes are **punched**: you see the table paper through them, with an inner shadow and a dashed pencil ring.
  Chemicals are glossy paper chips that pop into the holes.
- Pencil lines boil at 12 fps (re-seeded jitter) for stop-motion charm; motion itself stays smooth.

---

## 7. Physical realism (when things move, they move like the real thing)

"It looks like they're gliding" means the motion broke physics. Fix the physics; don't adjust the easing.

- **Cars:** a car moves only along its heading; the **rear axle** follows the path (≈1.35 m behind centre)
  and the nose swings out. Backing out of a space = reverse straight, then reverse on an arc (rear-axle radius
  ≈3.5 m for a 2.7 m × 5.5 m stall and 7.2 m aisle), stop briefly, then drive forward easing into lane centre.
  Speed profiles start and end at zero; forward uses constant acceleration to a cap.
- **Solve geometry before animating:** sweep candidate parameters (straight-back distance, radius) against
  oriented-bounding-box overlap with neighbours and the opposite row; keep the most natural one with
  positive clearance (≈0.3 m).
- **Lights tell the story:** white reverse lamps while reversing, brake lamps before moving and while stopping.
- **Schedule traffic:** if several things move in a shared space, simulate and delay starts until no OBBs
  ever overlap; prefer spreading which units are involved over long waits (who is "canceled" in an
  illustration is arbitrary, so choose a spread-out set).
- **The empty state follows the physics:** a space shows as empty and gets its X only after the car has fully
  cleared it (computed from the motion, not a guessed delay).
- Paper, signs and placards: sway on two incommensurate sine waves; shadows move with lift.

---

## 8. QA: prove every frame

Write `check.js` for every piece. It loads the page in Playwright, walks **every frame** at the delivery fps,
and asserts. Print `NO PROBLEMS FOUND` or a list of `frame N (t=…): problem`. Typical assertions:

**Data and text**
- Data block equals the brief exactly (values, labels, source, title).
- Hook `CanvasRenderingContext2D.prototype.fillText` in an init script and record every string drawn. Every
  string must be on an allowlist, and every required string must appear. This catches stray debug text and
  rogue numbers.
- Digits: each mask column's cells are exactly `[blank, finalChar]`, so no wrong digit is possible. Once landed, the
  displayed value equals the target, the glyph is centred in its window and motion blur is off.
- LED boards: decode the dot grid back into text, glyph by glyph, and compare with the intended message;
  while a message holds, the board shows exactly that message.
- Labels: once settled, measured text width ≤ strip width minus padding; strip fully on screen.

**No fades, no glitches**
- `getComputedStyle(el).opacity === '1'` for every DOM element on every frame (SVG `opacity=` attributes count:
  replace them with solid colors).
- No `NaN|undefined|Infinity` in any style string or computed position.
- Hook `fillStyle`/`strokeStyle`/`shadowColor` setters: if a string fails to parse (the canvas silently keeps
  the old color), record it. This caught `rgb(${arr.map(...)|0})`, an operator-precedence bug that produced
  `rgb(0)` and painted the lot black. Verify the detector itself with a known-bad value; the first version used
  a sentinel that collided with a real color and missed everything.

**Layout and motion**
- Nothing that should stay on screen leaves the frame or safe area; cards never overlap; content never runs
  within N px of a card edge.
- Continuity: no element moves more than ~40–90 px between consecutive frames and no heading snaps more than
  ~0.08 rad. This catches overlapping keyframes and teleports.
- Things are born small (morph), not at full size.
- Domain checks: unit counts (1,370 / 85 / 62 / 7) and nesting (62 ⊂ 85, 7 ⊂ 85); state at key times
  (5 of 14 holes filled at rest, all filled while firing); all 62 spaces crossed out before the end.
- Physics: rear-axle lateral velocity ≈ 0 (no slip); no OBB overlap with any parked or moving car.
- Readability: projected height of the smallest final text ≥ ~16 px; final figures fully on screen.

**After encoding**
- `ffprobe`: resolution, `60000/1001`, frame count = duration × 59.94, duration.
- **Pop/flash scan:** decode to 480×270 gray, compute mean absolute difference between consecutive frames,
  and flag any frame whose change is more than 2.2× both neighbours and above a floor. It must report `spikes: none`.

**Visual pass (you must look)**
- Contact sheets with timestamps: `ffmpeg -vf "fps=6,scale=480:-1,drawtext=…%{pts\:hms}…,tile=4x6"`.
- Full-resolution crops of the hero moments, every transition midpoint and the final frame.
- A **debug camera override** (`window.__camOverride`) for close-ups of models and motion that the real camera
  shows small. Close-up check shots can be sent to the user as proof (label them "not in the video").
- Look specifically for: brief ugly in-betweens (a gray slab before glass appears, a pink smudge in a star,
  an empty label strip, slot-machine digits), seams, clipped text, things touching the frame edge, flat or
  backwards shading, and lighting that disagrees with the shadows.

---

## 9. The review loop

1. Snap 6–14 key frames → contact sheet → look → fix the worst thing → repeat. Iterate on stills; it's
   seconds versus minutes for a render.
2. Run `check.js`; fix every failure. Don't relax a check to make it pass unless the threshold itself was wrong,
   and say so if you change one.
3. Render in the background, run the pop scan and contact sheets on the encoded file, and look again.
4. Commit and push source + deliverables (if working in a repo), then send the MP4 and the final-frame PNG.

---

## 10. Pitfalls seen in production (don't repeat them)

- Words animated on staggered clocks collide mid-move. Move a title as one line on one clock.
- Spinning odometer digits look chaotic **and** show false numbers. Use masked rises.
- Highlighting by alpha "flash" = a fade. Use rings, scale pops or color shifts instead.
- Glass cards that start as bright white dots flash a gray slab as they grow. Make them glass from frame one.
- A card docking across other docked cards overlaps them. Dock in an L: slide across to the column, then up.
- A new card popping in before the previous one has left overlaps it. Pop only after the slot is clear.
- Brake-light glow smeared across neighbouring cars. Keep emissive glows tight (radius ≈ lamp size).
- Fast spring entrances can exceed the per-frame continuity limit. Lengthen the move rather than loosen QA.
- Texture tiling seams across painted text. Pad source slices and over-expand triangles.
- `sed`/regex edits on files that contain non-breaking spaces fail silently. Use exact-string replacement
  scripts that assert each match count is 1.
- Background renders launched with a bare `&` can stall. Use a tracked background job and read its log.
- A reference image that "didn't come through" is a blocker for matching, not for making. Say so, build
  from the description and offer to match on resend.

---

## 11. Hand-off message template

Keep it plain and specific:

```
Sent above: <name>, <duration>, 1080p 59.94, plus the final frame as a still.

What it does (timed to the VO):
- 0:00 <picture> — "<VO words>"
- …

How I checked it:
- A script checked all <N> frames: <the specific assertions that matter for this piece>.
- A frame-by-frame scan of the encoded video found no flashes or pops.
- What the checks caught and I fixed: <one line each>.

Your call:
- Timing was set by syllable count; if the read runs differently, it's one number per beat.
- <Editorial check, if any: e.g. confirm the 670 referrals came from the failed audits.>
- <One offer: vertical 9:16, different object for the star, night version…>

Files: <path> on <branch>, with a README containing the timing table.
```

Don't oversell. If something is a placeholder, an assumption or untested, say so.
