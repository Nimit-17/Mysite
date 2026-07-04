import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";

gsap.registerPlugin(ScrollTrigger, TextPlugin);

const params = new URLSearchParams(window.location.search);

/** Reduced motion: OS preference, or ?motion=reduced for testing. */
export const REDUCED_MOTION =
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
  params.get("motion") === "reduced";

/* ------------------------------------------------------------------ intro */

const INTRO_KEY = "nimit-intro-done";

function introSeen() {
  try {
    return sessionStorage.getItem(INTRO_KEY) === "1";
  } catch {
    return false;
  }
}

/** True when the entrance preloader should play this page load. */
export const INTRO_PENDING =
  !REDUCED_MOTION && !introSeen() && params.get("intro") !== "off";

let introDone = !INTRO_PENDING;

/** Mark the intro finished (or skipped) and release anything waiting on it. */
export function finishIntro() {
  if (introDone) return;
  introDone = true;
  try {
    sessionStorage.setItem(INTRO_KEY, "1");
  } catch {
    /* private mode — replaying next load is fine */
  }
  window.dispatchEvent(new CustomEvent("intro:done"));
}

/** Run cb once the intro is over (immediately if it already is / never was). */
export function whenIntroDone(cb) {
  if (introDone) {
    cb();
    return () => {};
  }
  window.addEventListener("intro:done", cb, { once: true });
  return () => window.removeEventListener("intro:done", cb);
}

export const IS_MOBILE = window.matchMedia("(max-width: 767px)").matches;

/** Scale factor for transform distances on small screens. */
export const DIST = IS_MOBILE ? 0.55 : 1;

/** Announce the active scene to the progress rail. */
export function announceScene(id) {
  window.dispatchEvent(new CustomEvent("scene:active", { detail: { id } }));
}

/** Standard pinned, scrubbed scene timeline. */
export function pinnedTimeline(sectionEl, { length = "+=180%", scrub = 0.7, id } = {}) {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: sectionEl,
      start: "top top",
      end: length,
      scrub,
      pin: true,
      anticipatePin: 1,
      onToggle: (self) => self.isActive && id && announceScene(id),
    },
  });
  return tl;
}

/** Non-pinned scene: announce activation only. */
export function watchScene(sectionEl, id) {
  ScrollTrigger.create({
    trigger: sectionEl,
    start: "top 55%",
    end: "bottom 45%",
    onToggle: (self) => self.isActive && announceScene(id),
  });
}

/**
 * Wrap each word of an element in a .w span for staggered reveals.
 * Element children (nested spans) are kept whole and tagged .w as one unit.
 */
export function splitWords(el) {
  const nodes = Array.from(el.childNodes);
  nodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment();
      const parts = node.textContent.split(/(\s+)/);
      parts.forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
        } else {
          const span = document.createElement("span");
          span.className = "w";
          span.textContent = part;
          frag.appendChild(span);
        }
      });
      el.replaceChild(frag, node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      node.classList.add("w");
    }
  });
  return el.querySelectorAll(":scope > .w");
}

export { gsap, ScrollTrigger };
