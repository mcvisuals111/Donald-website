# Disabled Parking Permit Investigation — full-screen graphic

**Deliverable:** `disabled-parking-audit_1080p59.94.mp4`: 1920×1080, 59.94 fps, H.264, 21 seconds.
`disabled-parking-audit_final-frame.png` is the end frame as a still, in case you need to extend the hold.

Source: Miami-Dade County Tax Collector, October 20, 2026.

| On screen | Value |
|---|---|
| Applications reviewed | 137,016 |
| Failed final audit | 8,517 |
| Permits canceled | 6,169 |
| Suspected fraud cases referred to sheriff | 670 |

## Timing (for cutting VO)
| Time | What happens |
|---|---|
| 0:00 | Dot grows and morphs into the title card |
| 0:03.5 | Title moves up into the header, and the card expands into the first stat card |
| ~0:05 | **137,016** applications reviewed |
| 0:07.6 | Card splits, right half becomes **8,517** failed final audit |
| 0:10.8 | Left column splits, bottom becomes **6,169** permits canceled |
| 0:14.0 | Right column splits, bottom becomes **670** referred to sheriff |
| 0:17–0:21 | Full four-stat summary holds |

No element fades in or out. Every change is a shape morph or a masked rise.

## Re-render
```
node render.js out.mp4      # renders graphic.html frame by frame (needs Playwright + ffmpeg)
node check.js               # frame-by-frame QA: exact numbers, no fades, no overlaps, no jumps
node snap.js <dir> 5.2 9.0  # stills at given seconds
```
All numbers and labels live in the `STATS` block at the top of the script in `graphic.html`.
