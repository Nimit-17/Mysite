import { useLayoutEffect, useRef } from "react";
import { gsap, REDUCED_MOTION, ScrollTrigger, watchScene } from "../lib/motion";
import warm from "../../assets/photos/warm-portrait.jpeg";

/*
 * Scene 06 — Current internship. A quieter, technical beat:
 * changelog-style mono list, echoing the redaction motif.
 * Not pinned — springy reveals as it enters.
 */
const LINES = [
  "Learning how real teams debug messy systems",
  "Shipping careful fixes without breaking trust",
  "Turning confusing edge cases into cleaner habits",
];

export default function Internship() {
  const root = useRef(null);

  useLayoutEffect(() => {
    watchScene(root.current, "internship");
    if (REDUCED_MOTION) return;
    const ctx = gsap.context((self) => {
      const q = self.selector;

      gsap.set(q(".i-title"), { y: 40, autoAlpha: 0 });
      gsap.set(q(".i-sub"), { y: 24, autoAlpha: 0 });
      gsap.set(q(".i-row"), { x: -28, autoAlpha: 0 });
      gsap.set(q(".photo-warm"), { yPercent: 12, autoAlpha: 0, rotate: 2 });

      ScrollTrigger.create({
        trigger: root.current,
        start: "top 62%",
        once: true,
        onEnter: () => {
          const tl = gsap.timeline();
          tl.to(q(".i-title"), { y: 0, autoAlpha: 1, duration: 0.7, ease: "power4.out" })
            .to(q(".photo-warm"), { yPercent: 0, autoAlpha: 1, rotate: 0, duration: 0.9, ease: "power3.out" }, 0.1)
            .to(q(".i-sub"), { y: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out" }, 0.35)
            .to(q(".i-row"), { x: 0, autoAlpha: 1, duration: 0.55, stagger: 0.16, ease: "back.out(1.8)" }, 0.55);
        },
      });

      // gentle parallax on the photo while the scene scrolls by
      gsap.to(q(".photo-warm img"), {
        yPercent: -8,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.8 },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="scene grain bg-paper" aria-label="Scene 6 — current internship">
      <div className="scene-pad relative z-10 flex min-h-svh items-center">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
          {/* photo */}
          <div className="photo-warm photo-panel mx-auto w-[min(64vw,280px)] md:w-[min(28vw,340px)]" style={{ aspectRatio: "3/4.3" }}>
            <img src={warm} alt="Nimit in warm light against wooden shutters, arms crossed" loading="lazy" decoding="async" style={{ height: "112%" }} />
          </div>

          {/* copy */}
          <div className="max-w-xl">
            <p className="t-label mb-5 text-ink-soft">06 / present day</p>
            <h2 className="i-title t-display text-[clamp(2.2rem,1.2rem+4.4vw,4.6rem)]">Current internship</h2>
            <p className="i-sub mt-4 font-mono text-[clamp(1.05rem,0.9rem+0.9vw,1.5rem)]" style={{ fontFamily: "var(--font-mono)" }}>
              Working on <span className="redact" style={{ color: "var(--color-venom-deep)", borderColor: "color-mix(in srgb, var(--color-venom-deep) 55%, transparent)", background: "color-mix(in srgb, var(--color-venom-deep) 12%, transparent)" }}>***</span>
            </p>

            <ul className="mt-8 flex flex-col gap-4" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {LINES.map((line, i) => (
                <li key={i} className="i-row flex items-start gap-4 border-l-2 border-rust pl-4">
                  <span className="t-label mt-1 text-rust">{String(i + 1).padStart(2, "0")}</span>
                  <span className="t-body">{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
