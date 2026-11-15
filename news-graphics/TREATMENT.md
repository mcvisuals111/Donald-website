# Disabled Parking Permit Investigation: two graphic treatments

**Story data** (Miami-Dade County Tax Collector, October 20, 2026)

| Figure | Label |
|---|---|
| 137,016 | Applications reviewed |
| 8,517 | Failed final audit |
| 6,169 | Permits canceled |
| 670 | Suspected fraud cases referred to sheriff |

**VO (as scripted):** "A countywide investigation reviewed more than 137,000 disabled parking permit
applications. More than 8,500 failed the final audit, resulting in over 6,100 permits being canceled."
Both pieces hit those three beats in VO order, then add the 670 sheriff referral as a fourth beat the
anchor can tag ("…and 670 cases were referred to the sheriff").

Both are 1920×1080, 59.94 fps, H.264, and built from scratch in code: no stock, no AI imagery, and no
licensing. Nothing fades in or out. Every change is a camera move, a shape change, or a reveal behind
a mask, as asked. The colors come from the subject itself: asphalt, parking-stall blue paint, citation
yellow, highway signage and LED amber. The purple glow and neon look of the earlier versions are gone.

---

## Option A — "Gridlock" (driver's POV, 22 s)
`parking-audit-option-a-signs/parking-audit-A-gridlock_1080p59.94.mp4`

**Concept.** The client's brief was a dashboard view through the windshield while driving, with the
numbers popping up. Here, real Miami traffic delivers the numbers. We're crawling in afternoon
gridlock on an expressway, a disabled-parking placard hanging from the mirror. Overhead is an FDOT-style
amber LED message board, the kind every Miami driver reads in traffic. Instead of travel times, it rolls
through the audit findings. The numbers live in the world, not on top of it.

**Look.** Daylight, slightly hazy South Florida afternoon: real sky blue, concrete barrier, olive palms
and a gray-blue skyline in haze. Interior in warm grays with a windshield tint band. The board is
true 5×7 dot-matrix in LED amber (#FFB21C) on black, and messages roll up one LED row at a time,
exactly as the real boards do. The end card is the car's center screen, in neutral dark UI with one
accent color per figure.

| Time | Picture | VO cue |
|---|---|---|
| 0:00 | Stopped in traffic, brake lights ahead; the board rolls on: MIAMI-DADE COUNTY / DISABLED PARKING / PERMIT INVESTIGATION | (pre-roll / anchor toss) |
| 0:03.3 | Board rolls to **137,016 / APPLICATIONS / REVIEWED** | "…reviewed more than 137,000…" |
| 0:06.7 | **8,517 / FAILED / FINAL AUDIT** | "More than 8,500 failed the final audit…" |
| 0:10.1 | **6,169 / PERMITS / CANCELED** | "…over 6,100 permits being canceled." |
| 0:12.6 | Red and blue lights appear in the rearview mirror and wash across the cabin and the placard. A sheriff's patrol car runs the shoulder past us. | |
| 0:13.5 | Board: **670 / SUSPECTED FRAUD CASES / REFERRED TO SHERIFF** | anchor tag |
| 0:15.6 | The dash screen's nav is covered by a summary sheet sliding up | |
| 0:16.3 | Camera pushes into the dash screen until it fills the frame | |
| 0:17.3–0:22 | End card: all four figures land left to right, with the source line | hold / toss to soundbite |

**Direction notes.** Keep the 0:12.6 patrol pass under the VO, since it is the visual "turn" of the
piece from paperwork to enforcement. The final screen is a clean frame for a freeze, and editors can
hold it as long as needed (a still of the last frame is included).

---

## Option B — "The Lot" (top-down illustrated unit chart, 21 s)
`parking-audit-option-b-lot/parking-audit-B-the-lot_1080p59.94.mp4`

**Concept.** The numbers are made physical. We open close on one disabled parking space, with the
wheelchair symbol painted on the asphalt, and watch a car pull in. Then one continuous camera pull
reveals it's one space in a lot of **1,370 spaces, where each space is 100 applications**: the whole
137,016. The audit then plays out in the lot itself. Citations land on the 85 spaces that failed,
62 of those cars back out and leave and their spaces are marked void, and sheriff's patrol cars roll
up to 7 of them. The viewer sees how big the audit was and how small, but real, the fraud slice is.

**Look.** An editorial illustration style, a clean "cartoon" view from above with soft sun shadows.
Colors are the real ones: asphalt #3B3D40, stall blue #2F6BC1, curb yellow, citation yellow #E9B526,
void red #C23A2C and sheriff gold #A9802F. Cars come in real-world paint colors. The left panel is
newsprint off-white with a serif headline (Source Serif) and Inter figures, so the piece reads like a
newspaper data graphic rather than a tech UI.

| Time | Picture | VO cue |
|---|---|---|
| 0:00 | Tight on one disabled parking space; the panel slides in with the headline | (pre-roll / anchor toss) |
| 0:00.7 | A car pulls into the space | |
| 0:02.5 | One continuous pull-back reveals the full lot of 1,370 spaces; key "1 space = 100 applications" | |
| 0:03.6 | Legend: **137,016 Applications reviewed** | "…reviewed more than 137,000…" |
| 0:06.5 | The lot steps back in tone; a wave of yellow citations lands on 85 spaces | |
| 0:06.8 | **8,517 Failed final audit** | "More than 8,500 failed the final audit…" |
| 0:09.9 | 62 of those cars back out and drive off; each empty space gets a red X | |
| 0:10.0 | **6,169 Permits canceled** | "…over 6,100 permits being canceled." |
| 0:13.1 | Seven sheriff's patrol cars roll down the aisles and stop, lights going, each ringed in gold | |
| 0:13.3 | **670 Suspected fraud cases referred to sheriff** | anchor tag |
| 0:15–0:21 | Full lot and complete legend hold | hold / toss to soundbite |

**Unit math (on screen as a footnote).** 137,016 / 100 = 1,370 spaces; 8,517 → 85; 6,169 → 62;
670 → 7, each rounded to the nearest whole space. The exact figures are always the ones in the legend.

**Editorial check before air.** The script says the failures *resulted in* the cancellations, so the
62 canceled spaces are drawn inside the 85 failed ones. The 670 referrals are also drawn among the
failed spaces, which assumes the referrals came out of the failed audits. Please confirm that with
the Tax Collector's office; if it's wrong, the sheriff beat can move to separate spaces in a few minutes.

---

## Quality control (both)
Each piece was checked automatically on every frame, plus a visual pass through the full timeline:

- The four figures and labels match the source exactly. Every digit can only ever show its final value,
  so no wrong number appears even mid-animation.
- **Option A:** every LED message is decoded back from the dot grid and must read the exact text, and
  the only other text drawn is the speedometer and the placard.
- **Option B:** the unit counts (1,370 / 85 / 62 / 7) and their nesting are checked, and the patrol
  cars never share an aisle.
- No element changes opacity on any frame.
- No invalid colors, no layout jumps, and no text running out of its panel or card.
- A frame-to-frame difference scan of the encoded video found no pops or flashes. That scan caught one
  bad color in an earlier B render, which was fixed and re-rendered.

Re-render either piece with `node render.js out.mp4` and re-check it with `node check.js` from its folder.
