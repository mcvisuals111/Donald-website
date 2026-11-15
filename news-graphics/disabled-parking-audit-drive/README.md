# Disabled Parking Permit Investigation — driving / windshield version

**Deliverable:** `parking-audit-drive_1080p59.94.mp4`: 1920×1080, 59.94 fps, H.264, 25 seconds.
`parking-audit-drive_final-frame.png` is the end frame as a still.

The view is the driver's seat on a palm-lined Miami boulevard at sunset. The stats pop up as glass
heads-up cards on the windshield, then dock along the top. A blue disabled-parking placard hangs from the rearview mirror and swings with the car,
and SPEED LIMIT 45 signs pass on both sides. The whole scene is drawn in code, so it
has no stock footage and no licensing.

Source: Miami-Dade County Tax Collector, October 20, 2026.

## Timing (for cutting VO)
| Time | What happens |
|---|---|
| 0:00 | Driving; a dot on the glass opens into the title card |
| 0:04.6 | Title moves to the top-left header, and the card becomes the first stat |
| ~0:05.5 | **137,016** applications reviewed |
| 0:08.6 | Card docks top-left; **8,517** failed final audit pops up (~0:09.6) |
| 0:12.6 | Docks; **6,169** permits canceled pops up (~0:13.6) |
| 0:16.6 | Docks; **670** referred to sheriff pops up (~0:17.6) |
| 0:20.6–0:25 | All four docked across the top while the drive continues |

## Re-render
```
node render.js out.mp4   # frame-by-frame render (Playwright + ffmpeg)
node check.js            # QA: exact numbers, no fades, no overlaps, no jumps, text fits
```
