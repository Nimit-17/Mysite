// Functional checks: keyboard scroll, rail focus/click, scene announcements.
import { chromium } from "playwright-core";

const url = process.argv[2] || "http://localhost:5173/";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const results = {};

// keyboard: arrow down / page down scroll the document
const y0 = await page.evaluate(() => scrollY);
await page.keyboard.press("ArrowDown");
await page.waitForTimeout(400);
const y1 = await page.evaluate(() => scrollY);
await page.keyboard.press("PageDown");
await page.waitForTimeout(400);
const y2 = await page.evaluate(() => scrollY);
results.keyboardScroll = { arrowDown: y1 > y0, pageDown: y2 > y1 };

// rail buttons: focusable and labelled
await page.evaluate(() => scrollTo(0, 0));
await page.waitForTimeout(300);
const rail = await page.evaluate(() => {
  const btns = [...document.querySelectorAll(".rail button")];
  return { count: btns.length, labelled: btns.every((b) => b.getAttribute("aria-label")) };
});
results.rail = rail;

// tab reaches the rail
await page.keyboard.press("Tab");
results.firstTabFocus = await page.evaluate(() => ({
  tag: document.activeElement.tagName,
  label: document.activeElement.getAttribute("aria-label"),
}));

// clicking last rail dot jumps to finale
await page.evaluate(() => document.querySelectorAll(".rail button")[6].click());
await page.waitForTimeout(2500);
results.jumpToFinale = await page.evaluate(
  () => scrollY > document.body.scrollHeight - innerHeight * 3
);

// active dot syncs
results.activeDotAfterJump = await page.evaluate(() => {
  const idx = [...document.querySelectorAll(".rail button")].findIndex(
    (b) => b.getAttribute("aria-current") === "true"
  );
  return idx;
});

results.pageErrors = errors;
console.log(JSON.stringify(results, null, 2));
await browser.close();
