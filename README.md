# Card site

A card is thrown at the camera, lands facing you, and dissolves into embers that
reassemble into a name — and then the name itself catches fire, the last name
burns away to ash, and what survives becomes *Hi there, my name is Nimit* over a
world gone molten, with a handwritten aside underneath undercutting all of it. One static `index.html` — no build step, no dependencies.

## Running it

It has to be served over `http://`. Opening `index.html` straight off disk fails:
the card image is read back with `getImageData` to seed the dust, and a `file://`
image taints the canvas, which throws a `SecurityError`.

```bash
npx --yes serve -l 5599 .
```

Then open <http://localhost:5599>.

`?debug=1` exposes `window.__state()` and `window.__set(tl)` for jumping to any
point on the 0–2.32 timeline. `?motion=full` overrides the reduced-motion path.

## How it fits together

Everything is composited into a single canvas, in this order every frame:
ember background → video *or* card/dust → film grain → vignette. The intro video
used to sit in its own DOM layer above the canvas; because browsers composite
video separately with its own colour management, the hand-off visibly pulsed and
the video's matte edge met the embers with nothing bridging it. Drawing the video
into the canvas as a texture puts both through one pipeline.

Scroll (or arrow keys / space) drives a single monotonic timeline from 0 to 2.32.
`prog` is `min(1, tl)` and `burn` is `max(0, tl - 1)`; deriving both from one
scroll position is what keeps the join between the two halves of the piece from
needing a hand-off at all.

| timeline | what happens |
|---|---|
| 0 → 0.5 | the card erases cell by cell, each freed cell becoming a shard that bursts outward and warms to ember gold |
| 0.5 → 1 | the same shards change direction and gather onto sampled glyph positions |
| 1 → 1.52 | the fire at the foot of the frame goes out, having handed its burning to the name; the last name chars and leaves as ash |
| 1.52 → 1.72 | the survivor glides to the centre and grows |
| 1.66 → 1.82 | *Hi there, my name is* is written in above it |
| 1.90 → 2.25 | after a beat of nothing, the handwritten aside |
| 1.1 → 1.98 | the world behind goes molten |

The two halves are one continuous motion, which takes some care: a shard's
alpha, size and colour at the end of the dissolve have to be *exactly* what the
reassembly starts from, or the hand-off flickers. Alpha dims toward a floor
pinned to a quantisation step rather than to zero, size settles at `DUST_SZ`,
and the colour ramp is baked per alpha step so a shard is already gold by the
time it detaches. One function, `burstY`, owns the position the dissolve eases
into and the reassembly departs from, so the two cannot drift apart.

Sideways the cloud explodes; vertically it holds **exactly the card's height** —
a shard ends up level with the row it came from. The card stands 94% of the
viewport tall, so its top edge is already within 30px of the browser chrome, and
any vertical *spread* at all put the top of the cloud off the screen.

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

The outlines are **baked to paths** rather than loaded as a webfont. The strings
never change, and outlines mean no network request, no FOUT, and no race between
the font arriving and the dust being sampled from them. Rebuild with
`tools/genpath.mjs` if the name or the face ever changes.

The wordmark is baked as two halves in one coordinate space — `NAME_D` is
literally `FIRST_D + LAST_D` — so the frame before the last name catches fire and
the frame after it are drawn from the same outlines in the same place, and the
burn has nothing to line up.

The glyphs are sampled at **full** resolution, unlike the card — Cormorant Light
is a hairline face, and at half scale its thin strokes antialias below the alpha
threshold and whole stems drop out.

**Every shard the card gave up is spoken for.** Holding a share back to drift
away reads as the cloud losing pieces rather than gathering: what you see is dust
thinning out while a name appears inside it, which is the opposite of the idea.

That forces the grain size, and the arithmetic is worth writing down. Sampling
the wordmark at a one-pixel stride gives ~18k ink points on a 1440-wide viewport;
the card gives up ~31k shards. For those shards to *tile* the letterforms rather
than pile onto them, each has to be about `sqrt(ink / count)` ≈ 0.77px. At the
1.7px they fly at, they cover the ink four times over, the counters fill in, and
the name renders as a bright slab the size of its own bounding box. So a shard
keeps its flight size at the moment the reassembly takes over — the seam demands
it — and then thins to `RE_SZ` of it as it lands. Scattering is by a little over
half a sampling step for the same reason: enough that two shards on one point are
not one dot, little enough that Cormorant's hairlines survive.

The dust is on its targets by `rp` 0.72, and only then does the type come up
underneath it. Gathering all the way to `rp` 1 while crossfading from 0.48 meant
the letterforms were resolving while the shards were still converging on them, so
what you saw was type appearing inside a cloud rather than a name spelled in dust
that then hardens.

An `<h1>` stays in the DOM, visually hidden, carrying the same words for screen
readers and crawlers that the shards spell out visually, alongside the sentence
the piece ends on.

## The burn

Everything in the third act is a function of `burn` alone — nothing integrates
over time — so scrolling back up runs the fire backwards into the letterform
instead of leaving a cloud of ash stranded in mid-air.

A **threshold field** says when the fire reaches each point of the last name: a
ramp running outward from the end nearest the flame that lit it, plus upward,
roughened with three octaves of value noise so the edge tears along the
letterforms rather than sweeping across them. An advancing `front` is compared
against it. Untouched ahead of the front; a preheat band where the gold dulls and
reddens; then white-hot, orange, char; and the letterform only gives way once it
has gone dark. Two small buffers come out of one pass — what survives, and what
is currently alight — and they are only recomputed when the front has actually
moved, so a reader who stops scrolling pays nothing.

The field is **normalised against what it actually holds**, not against the sum
of its weights. Three octaves of value noise average toward the middle and never
reach either end, so the naive normalisation left the last threshold near 0.87 —
the fire finished well before the scroll position that was supposed to finish it,
and the name sat still waiting for it.

One ash flake per sampled point of the last name, each carrying the **threshold
of the pixel it sits on**, so a flake lifts at the instant its own bit of letter
is consumed rather than being emitted near a moving line and hoping to match.
Colour and alpha depend only on how far along a flake is, so the whole field
batches into twelve fills: the first two additive, while a flake is still an
ember, the rest plain grey once it has cooled.

### One silhouette, one glow

The whole wordmark is composed on a single layer and stamped once — including
during act 2, when nothing is burning yet. Two things force this.

Each shadowed draw casts its **own** glow, and two of them composite visibly
warmer than the one act 2 casts from the wordmark's union silhouette. Leaving the
untouched first name on the stage and routing only the burning half through a
layer would brighten the name on the frame the fire arrived.

And filling the two words separately is not quite the same as filling them as one
path: the rasteriser computes coverage per fill, and the edges land a little
differently even though the two words never touch (measured: zero overlapping
pixels, but up to 110/255 of coverage difference on ~3k edge pixels). Act 3 has
no choice but to fill them separately, because the fire only takes one of them —
so act 2 goes through the same renderer with the fire set to "not yet". Measured
across the frame, the last frame of act 2 and the first frame of act 3 are now
**identical**, pixel for pixel.

Two smaller things in the same vein. The layer's device-pixel origin is snapped
to a whole pixel and the remainder folded into its own transform, and it is
stamped with the transform reset — going through CSS coordinates means
`X/dpr*dpr`, which at dpr 1.5 lands a fraction of a pixel off, enough for the
browser to resample and soften every glyph edge. And `shadowBlur` is applied in
device pixels **regardless of the transform** (only the offset is in coordinate
space), so it has to be the same number from every call site; scaling both, which
reads as the obvious thing to do, gives a tight bright halo when the wordmark is
stamped as a bitmap and a wide soft one when it is filled as a path.

### The survivor

"Nimit" is one outline the whole way through — act 2's dust settles onto it, the
fire takes its other half, then it moves. Only a uniform scale and a translation
separate where it starts from where it ends, so interpolating those three numbers
is the real motion rather than an approximation of it. The sheen spans the whole
wordmark while the last name is still there and closes onto the survivor as it
leaves, so the gradient never jumps.

It is lifted off the shared layer at exactly the frame the last name is spent,
which is also the frame the glide starts — so at the hand-off it is still at act
2's position and size. Starting the glide earlier would mean moving while still
on a layer sized to the wordmark, and it would clip against the edge.

The lead-in is **written** rather than faded in: a single gradient carries both
the sweep of gold and the wipe that reveals it, with the stops running white-hot
right at the edge, so the fire that took the last name draws this one. It only
starts once the glide has landed — it is written at the composition's centre, and
while the survivor is still travelling the two are visibly out of line.

### The aside

Under the name, in Caveat: *I'm just a sleep-deprived introvert with a God
complex.* A pen hand, because the line is a margin note undercutting the formal
type above it rather than more of it — and because the joke is at the expense of
everything the piece has just spent five minutes doing.

It appears as though it is being written, but **no pen and no hand are drawn**.
The illusion is entirely in the face and in the order: revealed left to right
along a *slanted* edge that follows the stroke angle, so an ascender arrives a
moment after the stem it grows from. A vertical edge uncovers the top and bottom
of a letter at once, which reads as a wipe rather than as writing.

Deliberately **not** the fire-wipe the lead-in uses. That one is grand, and grand
is exactly what this line is undercutting; it arrives quietly, in ink rather than
gold. And it arrives after a deliberate gap of scroll — the greeting settles, the
composition rests, and only then does the aside show up. The line is a punchline
and a punchline needs the pause.

It is given **2.2x the scroll the greeting gets**, because it is 17.9em against
the greeting's 8.1em and the two have to write at the same rate. Matching the
*span* instead of the rate is what made it flash past in a single notch of the
wheel. That is also why the timeline runs to 2.32 rather than 2 — the extra is
the room the aside needs, plus a little rest at the end.

The reveal overshoots by a full edge width at each end. Stopping the wipe at 1
leaves the last stop of the gradient at half alpha, so the final letter sits
permanently faded — which is exactly what the trailing **x** was doing.

At nearly 18em it is too long for one line on a phone, so it is baked as halves
in one coordinate space, the same trick the wordmark uses: concatenated they are
the single line a wide viewport draws, given a transform each they are the two
lines a narrow one draws. One set of outlines serves both, and the break is
decided on the resulting *type size* rather than on orientation — a short wide
window has the same problem a phone does. The composition reserves the aside's
space from the start, so nothing above it moves when it appears.

## The lava

The world the card burned in was embers over near-black. As the name goes up it
turns molten — but molten rock is mostly dark: a black crust with light coming up
through the cracks, and only near the foot of the frame where the fire stood. So
the veins are thin rather than broad and the field is weighted hard toward the
bottom. A bright even wash across the frame reads as coloured fog and takes the
type down with it, which is exactly what the first attempt did.

A vein is a **ridge** of value noise — the set of points where the field crosses
its own midline, raised to a high power so only the crossing survives. Two
octaves: enough for the line to wander, few enough that it stays a line instead
of breaking into islands. A third field varies the heat along it, so some cracks
glow and others have gone dark. Cell counts are derived from the viewport rather
than fixed, so a crack is about as wide as it is tall on any shape of screen; a
fixed count stretches into vertical streaks on a phone, which reads as a curtain.

Baked once per resize at roughly half resolution — upscaling softens the veins,
which is what glowing rock looks like anyway — and drawn as one additive
`drawImage` per frame.

The vertical ramp has a **floor** under it rather than running to zero, and the
vignette eases *off* as the world goes molten instead of deepening. Both exist
for the same reason: with a pure power curve and a full-strength vignette the
corners went dead black, and a frame whose corners are empty reads as a vignette
rather than as somewhere the light happens to be dimmer.

## The cursor

A dot sitting exactly under the pointer, and a ring following it a beat behind
that widens as it hurries to catch up. The split is what gives it the feel: the
dot means the site is still precise about where you are, and the ring is the only
part allowed to have weight.

It belongs to the whole site, so it is deliberately **not** made of any one act's
material. An ember was right for the fire and would have been wrong on obsidian,
on water, on anything that comes later; a ring and a dot read as an instrument
rather than as a piece of the scene, and stay legible on black and on molten
orange alike.

Two details. It is **DOM, not canvas** — the opener covers the canvas, and the
pointer has to exist over it too. And the native cursor is hidden as soon as the
script knows there is a mouse, while the replacement stays invisible until the
pointer actually moves: nothing sits over the opening video for a reader who has
not touched the mouse yet, which is where a stray default arrow was showing up.
`cursor: none` is applied from script and never from the stylesheet, so if the
script fails the native cursor survives. Only a real mouse gets it — a touch
pointer has no arrow to replace, and reduced motion keeps the system cursor,
since something that lags behind the hand is exactly the motion that setting is
asking us not to introduce.

## The flame

A golden flame burns at the foot of the frame. It is **absent during the intro**
and catches only when the video hands over and the card becomes scrollable,
climbing from nothing over `FLAME_IGNITE` seconds — brightness running slightly
ahead of height, so it reads as a small flame taking hold rather than a dim
smear resolving into fire. It grows again as the card dissolves, and then goes
out over the first third of the burn, having handed its burning to the name.

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
