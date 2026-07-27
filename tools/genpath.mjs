/*
 * Bakes the wordmark to outlines for index.html.
 *
 * The name is set in Cormorant Garamond Light — "Nimit" roman, "Limbachiya"
 * italic, tracked -0.035em — and is baked to a path rather than loaded as a
 * webfont: the string never changes, and outlines mean no network request, no
 * FOUT, and no race between the font arriving and the dust being sampled from it.
 *
 * Usage:
 *   npm i fontkit
 *   curl -Lo cg-roman.ttf  "https://raw.githubusercontent.com/google/fonts/main/ofl/cormorantgaramond/CormorantGaramond%5Bwght%5D.ttf"
 *   curl -Lo cg-italic.ttf "https://raw.githubusercontent.com/google/fonts/main/ofl/cormorantgaramond/CormorantGaramond-Italic%5Bwght%5D.ttf"
 *   node tools/genpath.mjs
 *
 * Both files are variable fonts whose default instance is already weight 300,
 * so no instancing is needed. Paste the printed `d` into NAME_D in index.html
 * and copy across NAME_ADV and NAME_BOX if they changed.
 */
import * as fontkit from 'fontkit';
import { writeFileSync } from 'node:fs';

const ROMAN = 'cg-roman.ttf';
const ITALIC = 'cg-italic.ttf';
const TRACKING_EM = -0.035;                    // matches letter-spacing in the design

const roman = fontkit.openSync(ROMAN);
const italic = fontkit.openSync(ITALIC);
const UPEM = roman.unitsPerEm;
const TRACK = TRACKING_EM * UPEM;

const parts = [[roman, 'Nimit '], [italic, 'Limbachiya']];

let cursor = 0;
const cmds = [];
const bbox = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
const r1 = (n) => Math.round(n * 10) / 10;

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
      cmds.push({ moveTo: 'M', lineTo: 'L', quadraticCurveTo: 'Q', bezierCurveTo: 'C', closePath: 'Z' }[c.command]
        + a.map(r1).join(' '));
    }
    cursor += run.positions[i].xAdvance + TRACK;
  }
}

const d = cmds.join('').replace(/([MLQCZ])\s+/g, '$1');
const box = { x: r1(bbox.x0), y: r1(bbox.y0), w: r1(bbox.x1 - bbox.x0), h: r1(bbox.y1 - bbox.y0) };
const advance = r1(cursor - TRACK);

console.log('const NAME_ADV = %s;', advance / UPEM);
console.log('const NAME_BOX = { x: %s, y: %s, w: %s, h: %s };', box.x, box.y, box.w, box.h);
console.log('path is %d chars, written to namepath.json', d.length);
writeFileSync('namepath.json', JSON.stringify({ d, box, advance, upem: UPEM }));
