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
| 0 → 0.5 | the card erases cell by cell, each freed cell becoming a shard that bursts outward and warms to ember gold |
| 0.5 → 1 | the same shards change direction and gather onto sampled glyph positions |

The two halves are one continuous motion, which takes some care: a shard's
alpha, size and colour at the end of the dissolve have to be *exactly* what the
reassembly starts from, or the hand-off flickers. Alpha dims toward a floor
pinned to a quantisation step rather than to zero, size settles at `DUST_SZ`,
and the colour ramp is baked per alpha step so a shard is already gold by the
time it detaches. Shards also burst sideways rather than upward — the original
motion carried them 0.55–1.25 card heights up, which on any real viewport is
straight off the top edge, so the screen emptied before the name formed.

## The wordmark

The dust spells the name and then resolves into the real letterforms, so the
wordmark is crisp type at rest rather than a field of grains. It is Cormorant
Garamond Light, "Nimit" roman and *"Limbachiya"* italic, tracked `-0.035em`,
carrying the seven-stop gold gradient on a 14s sheen.

The type is laid down *underneath* the dust, not over it. Drawn on top it
replaced the additive grains with partly-transparent letterforms and the name
visibly sagged in brightness halfway through the hand-off; underneath, the dust
settles onto letters that are already forming. The dust also reaches full
strength early (`rp / 0.5`) and then clears on a squared curve, so it isn't
still brightening while the type is coming up. Measured across the band, the
result rises to a small bloom and settles flat instead of spiking and dipping.

The outlines are **baked to a path** (`NAME_D`) rather than loaded as a webfont.
The string never changes, and outlines mean no network request, no FOUT, and no
race between the font arriving and the dust being sampled from it. Rebuild with
`tools/genpath.mjs` if the name or the face ever changes.

Two details worth keeping: the glyphs are sampled at **full** resolution, unlike
the card — Cormorant Light is a hairline face, and at half scale its thin strokes
antialias below the alpha threshold and whole stems drop out. And the number of
shards recruited into the name is capped at 70%, so a large viewport can't
consume every shard and leave none behind to drift off.

An `<h1>` stays in the DOM, visually hidden, carrying the same words for screen
readers and crawlers that the shards spell out visually.

## The flame

A golden flame burns at the foot of the frame. It is **absent during the intro**
and catches only when the video hands over and the card becomes scrollable,
climbing from nothing over `FLAME_IGNITE` seconds — brightness running slightly
ahead of height, so it reads as a small flame taking hold rather than a dim
smear resolving into fire. It grows again as the card dissolves.

The embers are reborn inside it rather than drifting up from nothing — 62% of
them respawn within its width once it is lit, the rest anywhere, so it reads as
their source without the field looking like it funnels through a single point.
That bias is scaled by the ignition too, so nothing clusters at the centre while
there is still no fire there.

One teardrop sprite is generated once and stamped twelve times a frame at
wobbling sizes, so the whole thing costs a handful of `drawImage` calls rather
than a gradient per tongue. The shape matters more than the count: a sharp taper
and evenly spread tongues read as a row of candles, so the sprite is deliberately
blunt with a soft shoulder, and the licks are clustered toward the middle by a
triangular distribution over a wide low bed that gives the fire one body.

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
