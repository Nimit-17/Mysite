import { useLayoutEffect, useRef } from "react";
import { gsap, REDUCED_MOTION, DIST, pinnedTimeline, splitWords, watchScene } from "../lib/motion";
import pool from "../../assets/photos/pool-sideeye.webp";
import bed from "../../assets/photos/bed-stare.webp";

/*
 * Scene 02 — Spidey sense. Motion language: reflex — comic-strip snap
 * timing where the jokes land on pauses, not effects.
 * Beats: punchline slam → the memory gag (a note slaps in, then literally
 * slips away, forgotten) → the exit-sign beat with the bed-stare photo.
 */
export default function Sense() {
  const root = useRef(null);

  useLayoutEffect(() => {
    if (REDUCED_MOTION) {
      watchScene(root.current, "sense");
      return;
    }
    const ctx = gsap.context((self) => {
      const q = self.selector;

      splitWords(q(".setup")[0]);
      gsap.set(q(".setup .w"), { yPercent: 120, autoAlpha: 0 });
      gsap.set(q(".punch"), { scale: 1.6, autoAlpha: 0, rotate: -5 });
      q(".scribble path").forEach((p) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      });
      gsap.set(q(".photo-pool"), { yPercent: 18, rotate: 4, autoAlpha: 0 });
      gsap.set(q(".note"), { yPercent: -40, rotate: -8, autoAlpha: 0 });
      gsap.set(q(".forget"), { autoAlpha: 0, y: 10 });
      gsap.set(q(".exit-beat"), { autoAlpha: 0, y: 14 });
      gsap.set(q(".exit-sign"), { autoAlpha: 0 });
      gsap.set(q(".photo-bed"), { yPercent: 24, rotate: -5, autoAlpha: 0 });

      const tl = pinnedTimeline(root.current, { length: "+=300%", scrub: 0.6, id: "sense" });

      // beat 1 — setup, then the slam
      tl.to(q(".photo-pool"), { yPercent: 0, rotate: -2, autoAlpha: 1, duration: 0.8, ease: "power3.out" }, 0)
        .to(q(".setup .w"), { yPercent: 0, autoAlpha: 1, duration: 0.5, stagger: 0.05, ease: "power4.out" }, 0.15)
        .to(q(".punch"), { scale: 1, autoAlpha: 1, rotate: -1.5, duration: 0.45, ease: "back.out(2.6)" }, 1.1)
        .fromTo(q(".photo-pool"), { rotate: -2 }, { rotate: -3.5, x: -8 * DIST, duration: 0.2 }, 1.12)
        .to(q(".scribble path"), { strokeDashoffset: 0, duration: 0.4, ease: "power2.out", stagger: 0.08 }, 1.4)

        // beat 2 — the memory gag. A note slaps on...
        .to(q(".note"), { yPercent: 0, rotate: -2.5, autoAlpha: 1, duration: 0.5, ease: "back.out(2)" }, 2.2)
        // ...sits for a beat, then slips off, forgotten
        .to(q(".note"), { yPercent: 150, rotate: 13, autoAlpha: 0, duration: 0.55, ease: "power2.in" }, 3.1)
        // the deadpan lands flat on purpose — no bounce, no decoration
        .to(q(".forget"), { autoAlpha: 1, y: 0, duration: 0.35, ease: "power1.out" }, 3.55)

        // beat 3 — the exit. Forgetting recedes, the exit sign flickers on
        .to(q(".forget"), { autoAlpha: 0.28, y: -18, duration: 0.5, ease: "power2.inOut" }, 4.5)
        .to(q(".exit-beat"), { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, 4.65)
        // fluorescent stutter — on, drop, on
        .to(q(".exit-sign"), { autoAlpha: 1, duration: 0.06 }, 4.95)
        .to(q(".exit-sign"), { autoAlpha: 0.25, duration: 0.05 }, 5.03)
        .to(q(".exit-sign"), { autoAlpha: 1, duration: 0.08 }, 5.1)
        .to(q(".photo-bed"), { yPercent: 0, rotate: 3, autoAlpha: 1, duration: 0.7, ease: "power3.out" }, 4.8)
        .to({}, { duration: 0.5 });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="scene grain bg-paper" aria-label="Scene 2 — spidey sense">
      <div className="scene-pad relative z-10 flex min-h-svh items-center">
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-5 md:grid-cols-[1.1fr_0.9fr] md:gap-14">
          {/* photo side */}
          <div className="relative order-1 ml-[6vw] w-[min(38vw,170px)] md:mx-auto md:w-[min(30vw,380px)]">
            <div className="photo-pool photo-panel" style={{ aspectRatio: "3/4.4" }}>
              <img src={pool} alt="Nimit giving a suspicious side-eye by a pool" loading="lazy" decoding="async" />
            </div>
            {/* the "can we leave yet" stare — arrives on the exit beat */}
            <div
              className="photo-bed photo-panel absolute -right-[38%] top-[22%] w-[74%] border-4 border-chalk md:-right-[24%] md:top-[26%] md:w-[72%]"
              style={{ aspectRatio: "3/4.2" }}
            >
              <img src={bed} alt="Nimit staring blankly, reflected in an arched mirror" loading="lazy" decoding="async" />
            </div>
          </div>

          {/* copy side */}
          <div className="order-2 min-w-0 max-w-xl">
            <p className="t-label mb-4 text-ink-soft md:mb-5">02 / spidey sense</p>
            <p className="setup t-scene text-[clamp(1.25rem,0.95rem+1.6vw,2.4rem)] text-ink-soft">
              My new found spidey sense lets me
            </p>
            <div className="punch-group mt-3 md:mt-4">
              <h2 className="punch t-display text-[clamp(2rem,1.2rem+4.4vw,5rem)]">
                detect{" "}
                <span className="underline-scribble">
                  stupid people
                  <svg viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true" className="scribble">
                    <path d="M2 8 Q 50 2 100 7 T 198 6" fill="none" stroke="var(--color-venom-deep)" strokeWidth="4" strokeLinecap="round" />
                    <path d="M6 11 Q 60 6 120 10 T 196 9" fill="none" stroke="var(--color-venom-deep)" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </span>
              </h2>
            </div>

            {/* one slot, three beats — they trade places instead of stacking */}
            <div className="beat-stack mt-8 md:mt-10">
              <div className="note sticker t-scene w-fit max-w-full text-[clamp(1.1rem,0.85rem+1.3vw,1.9rem)] [grid-area:1/1]">
                I make a list of things to remember
              </div>
              <p className="forget t-scene self-start text-[clamp(1.1rem,0.85rem+1.3vw,1.9rem)] [grid-area:1/1]">
                and then forget about the list
              </p>
              <div className="exit-beat self-end pt-10 [grid-area:1/1] md:pt-12">
                <p className="t-scene text-[clamp(1.1rem,0.85rem+1.3vw,1.9rem)]">
                  I can also spot the nearest{" "}
                  <span className="exit-sign whitespace-nowrap">exit &rarr;</span>{" "}
                  at social events
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
