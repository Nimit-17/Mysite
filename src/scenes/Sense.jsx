import { useLayoutEffect, useRef } from "react";
import { gsap, REDUCED_MOTION, DIST, pinnedTimeline, splitWords, watchScene } from "../lib/motion";
import pool from "../../assets/photos/pool-sideeye.webp";
import bed from "../../assets/photos/bed-stare.webp";

/*
 * Scene 02 — Spidey sense.
 * Setup line + pool side-eye photo, "detect stupid people" punchline slams,
 * then the cling/past sticker beat with the arch-mirror photo.
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
      gsap.set(q(".cling-a"), { yPercent: 160, rotate: -7, autoAlpha: 0 });
      gsap.set(q(".cling-b"), { yPercent: 160, rotate: 6, autoAlpha: 0 });
      gsap.set(q(".photo-bed"), { yPercent: 24, rotate: -5, autoAlpha: 0 });

      const tl = pinnedTimeline(root.current, { length: "+=240%", scrub: 0.6, id: "sense" });

      tl.to(q(".photo-pool"), { yPercent: 0, rotate: -2, autoAlpha: 1, duration: 0.8, ease: "power3.out" }, 0)
        .to(q(".setup .w"), { yPercent: 0, autoAlpha: 1, duration: 0.5, stagger: 0.05, ease: "power4.out" }, 0.15)

        // punchline
        .to(q(".punch"), { scale: 1, autoAlpha: 1, rotate: -1.5, duration: 0.45, ease: "back.out(2.6)" }, 1.1)
        .fromTo(q(".photo-pool"), { rotate: -2 }, { rotate: -3.5, x: -8 * DIST, duration: 0.2 }, 1.12)
        .to(q(".scribble path"), { strokeDashoffset: 0, duration: 0.4, ease: "power2.out", stagger: 0.08 }, 1.4)

        // cling / past beat
        .to(q(".punch-group"), { yPercent: -26, autoAlpha: 0.16, duration: 0.9, ease: "power2.inOut" }, 2.2)
        .to(q(".photo-pool"), { yPercent: -14, autoAlpha: 0.35, duration: 0.9 }, 2.2)
        .to(q(".cling-a"), { yPercent: 0, rotate: -2, autoAlpha: 1, duration: 0.55, ease: "back.out(2)" }, 2.5)
        .to(q(".photo-bed"), { yPercent: 0, rotate: 3, autoAlpha: 1, duration: 0.7, ease: "power3.out" }, 2.75)
        .to(q(".cling-b"), { yPercent: 0, rotate: 1.5, autoAlpha: 1, duration: 0.55, ease: "back.out(2)" }, 2.95)
        .to({}, { duration: 0.5 });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="scene grain bg-paper" aria-label="Scene 2 — spidey sense">
      <div className="scene-pad relative z-10 flex min-h-svh items-center">
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-8 md:grid-cols-[1.1fr_0.9fr] md:gap-14">
          {/* photo side */}
          <div className="relative order-1 ml-[8vw] w-[min(46vw,200px)] md:mx-auto md:w-[min(30vw,380px)]">
            <div className="photo-pool photo-panel" style={{ aspectRatio: "3/4.4" }}>
              <img src={pool} alt="Nimit giving a suspicious side-eye by a pool" loading="lazy" decoding="async" />
            </div>
            {/* the past — arch mirror polaroid, arrives late */}
            <div
              className="photo-bed photo-panel absolute -right-[42%] top-[22%] w-[78%] border-4 border-chalk md:-right-[24%] md:top-[26%] md:w-[72%]"
              style={{ aspectRatio: "3/4.2" }}
            >
              <img src={bed} alt="Nimit reflected in an arched mirror, sitting on a bed" loading="lazy" decoding="async" />
            </div>
          </div>

          {/* copy side */}
          <div className="order-2 max-w-xl">
            <p className="t-label mb-5 text-ink-soft">02 / spidey sense</p>
            <p className="setup t-scene text-[clamp(1.5rem,1rem+2.2vw,2.6rem)] text-ink-soft">
              My new found spidey sense lets me
            </p>
            <div className="punch-group mt-4">
              <h2 className="punch t-display text-[clamp(2.6rem,1.4rem+5.4vw,5.6rem)]">
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

            <div className="mt-10 flex flex-wrap items-start gap-3 md:gap-4">
              <span className="cling-a sticker t-scene text-[clamp(1.3rem,0.9rem+1.8vw,2.1rem)]">and i can cling</span>
              <span className="cling-b sticker t-scene bg-ink text-paper text-[clamp(1.3rem,0.9rem+1.8vw,2.1rem)]" style={{ boxShadow: "4px 5px 0 var(--color-rust)" }}>
                to the past
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
