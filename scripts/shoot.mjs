// Visual verification: scroll through the story, screenshot each beat.
// Usage: node shoot.mjs <url> <outdir> [mobile] [reduced]
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const [, , url = "http://localhost:5173/", outdir = "shots", mode = "desktop", motion = "full"] = process.argv;
mkdirSync(outdir, { recursive: true });

const mobile = mode === "mobile";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({
  viewport: mobile ? { width: 375, height: 812 } : { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  reducedMotion: motion === "reduced" ? "reduce" : "no-preference",
});
const page = await ctx.newPage();

const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(2200); // entrance beat

const total = await page.evaluate(() => document.body.scrollHeight - innerHeight);
const stops = 16;
for (let i = 0; i <= stops; i++) {
  const y = Math.round((total * i) / stops);
  await page.evaluate((v) => scrollTo(0, v), y);
  await page.waitForTimeout(650);
  await page.screenshot({ path: join(outdir, `${mode}-${motion}-${String(i).padStart(2, "0")}.png`) });
}

// checks
const report = await page.evaluate(() => ({
  horizOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  brokenImgs: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src),
  scenes: document.querySelectorAll(".scene").length,
}));
console.log(JSON.stringify({ mode, motion, ...report, consoleErrors: errors }, null, 2));

await browser.close();
