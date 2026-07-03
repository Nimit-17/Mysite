import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const params = new URLSearchParams(window.location.search);

/** Reduced motion: OS preference, or ?motion=reduced for testing. */
export const REDUCED_MOTION =
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
  params.get("motion") === "reduced";

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
