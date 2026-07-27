# Card site

A card is thrown at the camera, lands facing you, and dissolves into embers that
reassemble into a name. One static `index.html` — no build step, no dependencies.

## Running it

It has to be served over `http://`. Opening `index.html` straight off disk fails:
the card image is read back with `getImageData` to seed the dust, and a `file://`
image taints the canvas, which throws a `SecurityError`.

```bash
npx --yes serve -l 5599 .
```

Then open <http://localhost:5599>.

`?debug=1` exposes `window.__state()` and `window.__set(progress)` for jumping to
any point in the dissolve. `?motion=full` overrides the reduced-motion path.

## How it fits together

Everything is composited into a single canvas, in this order every frame:
ember background → video *or* card/dust → film grain → vignette. The intro video
used to sit in its own DOM layer above the canvas; because browsers composite
video separately with its own colour management, the hand-off visibly pulsed and
the video's matte edge met the embers with nothing bridging it. Drawing the video
into the canvas as a texture puts both through one pipeline.

Scroll (or arrow keys / space) drives a single `progress` value from 0 to 1:

| progress | what happens |
|---|---|
| 0 → 0.5 | the card erases cell by cell, each freed cell becoming a drifting particle |
| 0.5 → 1 | particles turn gold and converge on sampled glyph positions |
| 0.88 → 1 | the particle name crossfades into the real `<h1>` |

The name is a DOM heading, not canvas pixels, so it is selectable and reaches
screen readers and crawlers.

## Assets

| file | notes |
|---|---|
| `card.webp` | 1053×1494, q92, 246 KB. What actually loads. |
| `card.png` | The master. 2271 KB. Fallback if WebP fails. |
| `intro.webm` | VP9 **with an alpha channel**, so the card floats over the embers. 44 frames at 30fps, played at 0.75× → 1.95s. |
| `intro.mp4` | H.264, no alpha, **pre-edit**. Not referenced; kept as the original capture. |

Two numbers in `index.html` are measured from `card.png` and must be re-measured
if the card art is re-exported: a **6px black margin** on all four edges, and a
**79px corner radius** on the cropped card. The file has no alpha channel, so
anything outside the card's silhouette is opaque black — both values are cropped
and masked at runtime. Get them wrong and a black frame shows up against the embers.

### The intro was re-cut

The original capture ended on a card that carried three defects, all visible
against the embers: the black margin baked into its silhouette as a rim, a
sliver of the throwing arm still in frame at the right, and an opaque black
matte below the card running to the bottom edge. The card is motionless from
frame 40 and within 1% of its final size by frame 30, so frames 30–40 dissolve
from the original into a card composited fresh from `card.png` — cropped,
corner-rounded, and placed at 707×1007 centred on (959.5, 539.5). Frames 41–44
are that clean card; everything after was a redundant freeze and was trimmed.

Because the last frame is now generated from the same source as the canvas card,
the two agree by construction: measured on screen, their centres differ by 0.4px
and their heights are identical. `CARD_IN_VID_H` encodes that height and is the
single number tying the video to the canvas.

## Safari

`intro.webm` is VP9-with-alpha, which WebKit decodes but renders opaque, so the
intro would appear as a black slab rather than failing outright. A probe reads
back the first decoded frame and checks whether the corners are actually
transparent; if they aren't, a canvas card entrance plays instead. Exporting an
HEVC-with-alpha MP4 (`hvc1`) and adding it as a second `<source>` would give
Safari the real intro.
