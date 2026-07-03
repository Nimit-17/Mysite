import { useLayoutEffect, useRef } from "react";
import { gsap, REDUCED_MOTION, pinnedTimeline, splitWords, watchScene } from "../lib/motion";
import lab from "../../assets/photos/civil-lab.webp";

/*
 * Scene 04 — IIT Bombay / civil engineering.
 * Back to daylight paper with a blueprint grid; the coveralls photo
 * carries the rust accent. Setup line, then the punchline stamps in.
 */
export default function Civil() {
  const root = useRef(null);

  useLayoutEffect(() => {
    if (REDUCED_MOTION) {
      watchScene(root.current, "civil");
      return;
    }
    const ctx = gsap.context((self) => {
      const q = self.selector;

      splitWords(q(".setup")[0]);
      gsap.set(q(".setup .w"), { yPercent: 120, autoAlpha: 0 });
      gsap.set(q(".photo-lab"), { clipPath: "inset(0 0 100% 0)" });
      gsap.set(q(".photo-lab img"), { scale: 1.15, yPercent: 8 });
      gsap.set(q(".punchline"), { scale: 1.5, autoAlpha: 0, rotate: 3 });
      q(".measure").forEach((p) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len, autoAlpha: 0 });
      });

      const tl = pinnedTimeline(root.current, { length: "+=200%", scrub: 0.6, id: "civil" });

      tl.to(q(".photo-lab"), { clipPath: "inset(0 0 0% 0)", duration: 0.9, ease: "power3.inOut" }, 0)
        .to(q(".photo-lab img"), { scale: 1, yPercent: 0, duration: 1.1, ease: "power2.out" }, 0)
        .to(q(".setup .w"), { yPercent: 0, autoAlpha: 1, duration: 0.5, stagger: 0.05, ease: "power4.out" }, 0.3)
        .set(q(".measure"), { autoAlpha: 1 }, 0.8)
        .to(q(".measure"), { strokeDashoffset: 0, duration: 0.6, ease: "power2.inOut" }, 0.8)

        .to(q(".punchline"), { scale: 1, autoAlpha: 1, rotate: -1.5, duration: 0.5, ease: "back.out(2.4)" }, 1.5)
        .fromTo(q(".photo-lab"), { rotate: 0 }, { rotate: -1.2, duration: 0.18 }, 1.52)
        .to(q(".photo-lab"), { rotate: 0, duration: 0.3 }, 1.7)
        .to({}, { duration: 0.5 });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="scene grain blueprint bg-paper" aria-label="Scene 4 — IIT Bombay, civil engineering">
      <div className="scene-pad relative z-10 flex min-h-svh items-center">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-[1.05fr_0.95fr] md:gap-16">
          {/* copy */}
          <div className="order-2 max-w-xl md:order-1">
            <p className="t-label mb-5 text-ink-soft">04 / meanwhile, on campus</p>
            <p className="setup t-scene text-[clamp(1.5rem,1rem+2.2vw,2.7rem)]">
              I am a third year student at IIT Bombay
            </p>
            <svg className="my-6 h-4 w-full max-w-sm" viewBox="0 0 300 16" preserveAspectRatio="none" aria-hidden="true">
              <path
                className="measure"
                d="M2 2 L2 14 M2 8 L298 8 M298 2 L298 14 M14 4.5 L3 8 L14 11.5 M286 4.5 L297 8 L286 11.5"
                fill="none"
                stroke="var(--color-rust)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h2 className="punchline t-display text-[clamp(2.4rem,1.2rem+5vw,5.2rem)]">
              <span className="stamp-rust">doing civil</span> engineering
            </h2>
          </div>

          {/* photo */}
          <div className="order-1 mx-auto w-[min(74vw,320px)] md:order-2 md:w-[min(32vw,400px)]">
            <div className="photo-lab photo-panel" style={{ aspectRatio: "3/4.1" }}>
              <img src={lab} alt="Nimit in orange coveralls and a face shield, holding a jigsaw in a workshop" loading="lazy" decoding="async" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
