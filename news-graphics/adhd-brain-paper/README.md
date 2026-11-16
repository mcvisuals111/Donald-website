# ADHD Brain — paper cut-out graphic (17 s)

`adhd-brain-paper_1080p59.94.mp4`: 1920×1080, 59.94 fps, H.264, 17 s. `adhd-brain-paper_final-frame.png` is the end hold.

**VO:** "The ADHD brain lacks some of the neurochemicals that allow the brain to regulate in a way that it does
for other people. But when they're interested in something, those neurotransmitters are firing and they can
stay super focused."

The style follows the reference: off-white paper, a hand-drawn pencil grid, a pink brain, a yellow label strip and
black italic serif type (Playfair Display Black Italic). Every element is a paper cut-out with a cast shadow and a
slight hand-made float, and the pencil lines redraw at 12 fps like stop-motion. Nothing cross-dissolves: the label strip
re-shapes and rolls to its next words, pieces slide, unfold or punch in, and the second brain morphs into the star.

| Time | Picture | Label strip | VO |
|---|---|---|---|
| 0:00 | Cut-paper brain slides onto the gridded paper | **ADHD Brain** | "The ADHD brain" |
| 0:01.8 | Pencil pathways draw across the brain; 14 holes punch through; only 5 hold a chemical (teal) | **Lacks some neurochemicals** | "lacks some of the neurochemicals" |
| 0:05.5 | A second brain slides out from behind and fills every hole; two cards unfold: erratic red trace vs a steady trace inside the shaded band | **Regulates differently** · cards "ADHD brain" / "Other people" | "that allow the brain to regulate… for other people" |
| 0:09.6 | Cards fold away; the second brain's outline morphs into a gold paper star (a hard-edged sweep turns it gold) | **Interested in something** | "But when they're interested in something" |
| 0:11.9 | Sparks travel from the star along a pencil path, every hole fills, and yellow pulses race along the pathways | **Neurotransmitters firing** | "those neurotransmitters are firing" |
| 0:14.5 | A vellum beam locks brain to star; a dark paper frame closes in | **Super focused** | "and they can stay super focused" |

Beat times were set by syllable count against the script. If the recorded VO runs faster or slower, every beat is one
number in the `LABELS` and `T` blocks at the top of `graphic.html`.

`node render.js out.mp4` re-renders; `node check.js` runs the per-frame QA (label text, strip fit, nothing leaving
frame, no jumps, 5 of 14 slots filled at rest, all filled while firing, no stray text, no invalid colours).
