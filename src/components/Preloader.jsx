import { useLayoutEffect, useRef, useState } from "react";
import { gsap, INTRO_PENDING, finishIntro } from "../lib/motion";

/*
 * Entrance — "the bite", not a loading spinner.
 * A venom thread drops onto the page, the bite-ring lands, and the same
 * web-cracks that will shatter the portrait in scene 1 snap across the
 * screen. Plays once per session; skippable via button or Escape.
 */

const CX = 500;
const CY = 330;

// Jagged 2-segment cracks radiating from the bite point — same visual
// grammar as the Origin portrait cracks.
const CRACK_ENDS = [
  [30, 40], [310, -60], [700, -70], [980, 90],
  [1030, 420], [760, 740], [420, 760], [90, 660], [-40, 300],
];

const CRACKS = CRACK_ENDS.map(([x, y], i) => {
  const mx = (CX + x) / 2 + (i % 2 ? 26 : -22);
  const my = (CY + y) / 2 + (i % 3 ? -18 : 20);
  return `M ${CX} ${CY} L ${mx} ${my} L ${x} ${y}`;
});

export default function Preloader() {
  const [active, setActive] = useState(INTRO_PENDING);
  const root = useRef(null);
  const skipped = useRef(false);
  const skipFn = useRef(() => {});

  useLayoutEffect(() => {
    if (!active) return;

    const html = document.documentElement;
    html.style.overflow = "hidden";
    const release = () => {
      html.style.overflow = "";
    };

    const ctx = gsap.context((self) => {
      const q = self.selector;

      const thread = q(".pl-thread")[0];
      const cracks = q(".pl-crack");
      const threadLen = thread.getTotalLength();
      gsap.set(thread, { strokeDasharray: threadLen, strokeDashoffset: threadLen });
      cracks.forEach((c) => {
        const len = c.getTotalLength();
        gsap.set(c, { strokeDasharray: len, strokeDashoffset: len, autoAlpha: 0 });
      });
      gsap.set(q(".pl-ring"), { scale: 0.4, autoAlpha: 0, transformOrigin: `${CX}px ${CY}px` });
      gsap.set(q(".pl-name"), { autoAlpha: 0, letterSpacing: "0.55em" });

      const done = () => {
        finishIntro();
        release();
        setActive(false);
      };

      const tl = gsap.timeline({ onComplete: done });
      skipFn.current = () => {
        // skip: cut straight to the exit fade
        if (skipped.current) return;
        skipped.current = true;
        tl.kill();
        gsap.to(root.current, { autoAlpha: 0, duration: 0.25, ease: "power1.out", onComplete: done });
      };

      tl.to(q(".pl-skip"), { autoAlpha: 1, duration: 0.3 }, 0.1)
        // the thread drops
        .to(thread, { strokeDashoffset: 0, duration: 0.55, ease: "power2.in" }, 0.05)
        // the bite lands
        .to(q(".pl-ring"), { scale: 1, autoAlpha: 1, duration: 0.28, ease: "back.out(3)" }, 0.6)
        .to(q(".pl-name"), { autoAlpha: 1, letterSpacing: "0.3em", duration: 0.55, ease: "power2.out" }, 0.78)
        // stillness — let the name sit
        .to({}, { duration: 0.35 })
        // the cracks snap across the whole screen
        .set(cracks, { autoAlpha: 1 }, 1.7)
        .to(cracks, { strokeDashoffset: 0, duration: 0.4, ease: "power3.out", stagger: 0.025 }, 1.7)
        .fromTo(q(".pl-stage"), { x: 0 }, { x: 6, duration: 0.04, yoyo: true, repeat: 3 }, 1.7)
        .set(q(".pl-stage"), { x: 0 }, 1.87)
        // hold, then hand off into scene 1
        .to({}, { duration: 0.3 })
        .to(q(".pl-thread, .pl-ring, .pl-name, .pl-skip"), { autoAlpha: 0, duration: 0.25 }, 2.45)
        .to(root.current, { autoAlpha: 0, duration: 0.5, ease: "power2.inOut" }, 2.55);
    }, root);

    const onKey = (e) => {
      if (e.key === "Escape") skipFn.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      release();
      ctx.revert();
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={root}
      className="grain fixed inset-0 z-[80] bg-cloud"
      role="presentation"
      aria-hidden="true"
    >
      <div className="pl-stage absolute inset-0">
        <svg
          className="h-full w-full"
          viewBox="0 0 1000 660"
          preserveAspectRatio="xMidYMid slice"
        >
          <line
            className="pl-thread"
            x1={CX} y1={-40} x2={CX} y2={CY - 10}
            stroke="var(--color-venom-deep)"
            strokeWidth="1.6"
          />
          {CRACKS.map((d, i) => (
            <path
              key={i}
              className="pl-crack"
              d={d}
              fill="none"
              stroke="#15171b"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          ))}
          <circle
            className="pl-ring"
            cx={CX} cy={CY} r="16"
            fill="none"
            stroke="var(--color-venom-deep)"
            strokeWidth="3"
          />
        </svg>
        <p className="pl-name t-label absolute left-1/2 top-[58%] -translate-x-1/2 whitespace-nowrap text-ink">
          nimit limbachiya
        </p>
      </div>

      <button
        type="button"
        className="pl-skip t-label absolute bottom-6 right-6 cursor-pointer border-0 bg-transparent p-2 text-ink-soft opacity-0 hover:text-ink"
        onClick={() => skipFn.current()}
      >
        skip [esc]
      </button>
    </div>
  );
}
