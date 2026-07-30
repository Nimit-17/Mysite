/*
 * Bakes every piece of type in index.html to outlines.
 *
 * The wordmark is set in Cormorant Garamond Light — "Nimit" roman, "Limbachiya"
 * italic, tracked -0.035em — and is baked to a path rather than loaded as a
 * webfont: the strings never change, and outlines mean no network request, no
 * FOUT, and no race between the font arriving and the dust being sampled.
 *
 * Usage:
 *   npm i fontkit
 *   curl -Lo cg-roman.ttf  "https://raw.githubusercontent.com/google/fonts/main/ofl/cormorantgaramond/CormorantGaramond%5Bwght%5D.ttf"
 *   curl -Lo cg-italic.ttf "https://raw.githubusercontent.com/google/fonts/main/ofl/cormorantgaramond/CormorantGaramond-Italic%5Bwght%5D.ttf"
 *   curl -Lo caveat.ttf    "https://raw.githubusercontent.com/google/fonts/main/ofl/caveat/Caveat%5Bwght%5D.ttf"
 *   node tools/genpath.mjs
 *
 * All three are variable fonts whose default instance is the one we want
 * (Cormorant at 300, Caveat at 400), so no instancing is needed. Paste the
 * printed constants into index.html.
 *
 * Five paths come out:
 *   NAME_D   the whole wordmark, "Nimit Limbachiya"
 *   FIRST_D  just "Nimit"      \  laid out in NAME_D's own coordinate space, so
 *   LAST_D   just "Limbachiya" /  drawing both is pixel-identical to NAME_D
 *   HI_D     "Hi there, my name is", its own space, tracked wider for small type
 *   NOTE_D   the aside, in Caveat — a pen hand, because the line is a margin
 *            note undercutting the formal type above it, not more of it
 *
 * FIRST_D and LAST_D sharing NAME_D's origin is what lets the burn hand over
 * without a seam: the frame before the last name catches fire is drawn from
 * NAME_D and the frame after is drawn from the two halves, and they agree.
 */
import * as fontkit from 'fontkit';
import { writeFileSync } from 'node:fs';

const ROMAN = 'cg-roman.ttf';
const ITALIC = 'cg-italic.ttf';
const HAND = 'caveat.ttf';

const roman = fontkit.openSync(ROMAN);
const italic = fontkit.openSync(ITALIC);
const hand = fontkit.openSync(HAND);
const UPEM = roman.unitsPerEm;

const r1 = (n) => Math.round(n * 10) / 10;

/* Re-encodes a command list as relative moves with integer coordinates.
   Absolute tenths are what the wordmark uses and they are worth keeping there —
   its outlines are sliced by string elsewhere, and the burn seam was verified
   against them. For the aside none of that applies and the cost is absurd: it
   renders at roughly 58px, where one font unit is 0.058px, so a tenth of a unit
   is six thousandths of a pixel. Rounding to whole units is invisible, and
   deltas between neighbouring points are one or two digits where absolutes out
   at x=17000 are five. Repeated command letters are dropped too, which fonts
   give plenty of, since outlines are long runs of quadratics.

   Chained deltas must be measured from the *rounded* previous point, not the
   true one, or the error accumulates along the path and the tail drifts. */
function compactPath(cmds) {
  let cx = 0, cy = 0, sx = 0, sy = 0, prev = '';
  let out = '';
  for (const c of cmds) {
    if (c.cmd === 'Z') { out += 'z'; cx = sx; cy = sy; prev = ''; continue; }
    const a = c.args;
    let s = '';
    let nx = cx, ny = cy;
    // every pair in a command is relative to the point the command started at
    for (let k = 0; k < a.length; k += 2) {
      const qx = Math.round(a[k]), qy = Math.round(a[k + 1]);
      const dx = qx - cx, dy = qy - cy;
      s += (s === '' || dx < 0 ? '' : ' ') + dx;
      s += (dy < 0 ? '' : ' ') + dy;
      nx = qx; ny = qy;
    }
    const letter = { M: 'm', L: 'l', Q: 'q' }[c.cmd];
    /* `m` never merges: extra pairs after a moveto are implicit linetos, which
       would silently redraw the glyph. */
    if (letter === prev && letter !== 'm') out += (s[0] === '-' ? '' : ' ') + s;
    else { out += letter + s; prev = letter; }
    cx = nx; cy = ny;
    if (c.cmd === 'M') { sx = cx; sy = cy; }
  }
  return out;
}

/* Lays out a sequence of [font, text] runs and returns the path plus its metrics.
   `cursor0` seeds the pen, so a subset of a line can be re-emitted at exactly the
   x it occupies in the full line. */
function layout(parts, trackingEm, cursor0 = 0) {
  const TRACK = trackingEm * UPEM;
  let cursor = cursor0;
  const cmds = [], raw = [];
  const bbox = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };

  for (const [font, text] of parts) {
    const run = font.layout(text);
    for (let i = 0; i < run.glyphs.length; i++) {
      const ox = cursor + (run.positions[i].xOffset || 0);
      for (const c of run.glyphs[i].path.commands) {
        const a = c.args.slice();
        // font units are y-up; flip so the runtime can fill without a transform
        for (let k = 0; k < a.length; k += 2) { a[k] += ox; a[k + 1] = -a[k + 1]; }
        for (let k = 0; k < a.length; k += 2) {
          bbox.x0 = Math.min(bbox.x0, a[k]); bbox.x1 = Math.max(bbox.x1, a[k]);
          bbox.y0 = Math.min(bbox.y0, a[k + 1]); bbox.y1 = Math.max(bbox.y1, a[k + 1]);
        }
        const cmd = { moveTo: 'M', lineTo: 'L', quadraticCurveTo: 'Q', bezierCurveTo: 'C', closePath: 'Z' }[c.command];
        raw.push({ cmd, args: a });
        cmds.push(cmd + a.map(r1).join(' '));
      }
      cursor += run.positions[i].xAdvance + TRACK;
    }
  }

  return {
    d: cmds.join('').replace(/([MLQCZ])\s+/g, '$1'),
    dz: compactPath(raw),          // same outline, relative and integer
    box: { x: r1(bbox.x0), y: r1(bbox.y0), w: r1(bbox.x1 - bbox.x0), h: r1(bbox.y1 - bbox.y0) },
    advance: r1(cursor - TRACK - cursor0),
    end: cursor,
  };
}

const WORDMARK_TRACK = -0.035;                 // matches letter-spacing in the design
const LEADIN_TRACK = 0.04;                     // small type wants air, not tightening

const name = layout([[roman, 'Nimit '], [italic, 'Limbachiya']], WORDMARK_TRACK);
const first = layout([[roman, 'Nimit']], WORDMARK_TRACK);
// re-seed the pen where "Nimit " left off, so LAST_D lands on NAME_D exactly
const lastStart = layout([[roman, 'Nimit ']], WORDMARK_TRACK).end;
const last = layout([[italic, 'Limbachiya']], WORDMARK_TRACK, lastStart);
const hi = layout([[italic, 'Hi there, my name is']], LEADIN_TRACK);
/* The aside is long — nearly 18em — so on a phone it has to break in two. Baked
   as halves in one coordinate space, exactly as the wordmark is: concatenated
   they are the single line a wide viewport draws, and given a transform each
   they are the two lines a narrow one draws. One set of outlines, both layouts. */
const NOTE_A = 'I’m just a sleep-deprived ';
const NOTE_B = 'introvert with a God complex';
const note1 = layout([[hand, NOTE_A]], 0);
const note2 = layout([[hand, NOTE_B]], 0, layout([[hand, NOTE_A]], 0).end);

const emit = (label, r) => {
  console.log('const %s_D = %j;', label, r.d);
  console.log('const %s_BOX = { x: %s, y: %s, w: %s, h: %s };', label, r.box.x, r.box.y, r.box.w, r.box.h);
  console.log('const %s_ADV = %s;   // em', label, r1(r.advance / UPEM * 1000) / 1000);
  console.log('');
};

emit('NAME', name);
emit('FIRST', first);
emit('LAST', last);
emit('HI', hi);
emit('NOTE1', note1);
emit('NOTE2', note2);

writeFileSync('namepath.json', JSON.stringify({
  upem: UPEM,
  name: { d: name.d, box: name.box, advance: name.advance },
  first: { d: first.d, box: first.box, advance: first.advance },
  last: { d: last.d, box: last.box, advance: last.advance },
  hi: { d: hi.d, box: hi.box, advance: hi.advance },
  note1: { d: note1.dz, box: note1.box, advance: note1.advance },
  note2: { d: note2.dz, box: note2.box, advance: note2.advance },
}, null, 1));
console.error('written to namepath.json');
