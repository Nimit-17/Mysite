import { useLayoutEffect, useRef } from "react";
import { gsap, REDUCED_MOTION, DIST, pinnedTimeline, splitWords, watchScene } from "../lib/motion";
import pool from "../../assets/photos/pool-sideeye.webp";
import bed from "../../assets/photos/bed-stare.webp";

/*
 * Scene 02 — Spidey sense. Motion language: reflex — comic-strip snap
 * timing where the jokes land on pauses, not effects.
 * Beats: the exit-sign punchline → it clears out for the memory gag
 * (a note slaps in, then literally slips away, forgotten).
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
      gsap.set(q(".exit-sign"), { autoAlpha: 0 });
      gsap.set(q(".photo-pool"), { yPercent: 18, rotate: 4, autoAlpha: 0 });
      gsap.set(q(".photo-bed"), { yPercent: 24, rotate: -5, autoAlpha: 0 });
      gsap.set(q(".note"), { yPercent: -40, rotate: -8, autoAlpha: 0 });
      gsap.set(q(".forget"), { autoAlpha: 0, y: 10 });

      const tl = pinnedTimeline(root.current, { length: "+=300%", scrub: 0.6, id: "sense" });

      // beat 1 — setup, then the exit-sign slam
      tl.to(q(".photo-pool"), { yPercent: 0, rotate: -2, autoAlpha: 1, duration: 0.8, ease: "power3.out" }, 0)
        .to(q(".setup .w"), { yPercent: 0, autoAlpha: 1, duration: 0.5, stagger: 0.05, ease: "power4.out" }, 0.15)
        .to(q(".punch"), { scale: 1, autoAlpha: 1, rotate: -1.5, duration: 0.45, ease: "back.out(2.6)" }, 1.1)
        .fromTo(q(".photo-pool"), { rotate: -2 }, { rotate: -3.5, x: -8 * DIST, duration: 0.2 }, 1.12)
        // fluorescent stutter — on, drop, on
        .to(q(".exit-sign"), { autoAlpha: 1, duration: 0.06 }, 1.5)
        .to(q(".exit-sign"), { autoAlpha: 0.25, duration: 0.05 }, 1.58)
        .to(q(".exit-sign"), { autoAlpha: 1, duration: 0.08 }, 1.65)
        // the "can we leave yet" stare
        .to(q(".photo-bed"), { yPercent: 0, rotate: 3, autoAlpha: 1, duration: 0.7, ease: "power3.out" }, 1.6)

        // beat 2 — the exit clears out, the memory gag takes the stage
        .to(q(".punch-group"), { yPercent: -30, autoAlpha: 0, duration: 0.6, ease: "power2.in" }, 2.6)
        .to(q(".note"), { yPercent: 0, rotate: -2.5, autoAlpha: 1, duration: 0.5, ease: "back.out(2)" }, 3.0)
        // ...sits for a beat, then slips off, forgotten
        .to(q(".note"), { yPercent: 150, rotate: 13, autoAlpha: 0, duration: 0.55, ease: "power2.in" }, 3.9)
        // the deadpan lands flat on purpose — no bounce, no decoration
        .to(q(".forget"), { autoAlpha: 1, y: 0, duration: 0.35, ease: "power1.out" }, 4.35)
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
            {/* the "can we leave yet" stare — arrives with the exit sign */}
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
              My newfound spidey sense lets me
            </p>
            <div className="beat-stack mt-4 md:mt-6">
              {/* beat 1 — the exit punchline; steps aside for the list gag */}
              <div className="punch-group self-start [grid-area:1/1]">
                <h2 className="punch t-display text-[clamp(1.7rem,1rem+3.6vw,4.2rem)]">
                  spot the nearest{" "}
                  <span className="exit-sign whitespace-nowrap">exit &rarr;</span>{" "}
                  at social events
                </h2>
              </div>
              {/* beat 2 — the memory gag */}
              <div className="note sticker t-scene w-fit max-w-full self-start text-[clamp(1.1rem,0.85rem+1.3vw,1.9rem)] [grid-area:1/1]">
                I make a list of things to remember
              </div>
              <p className="forget t-scene self-start pt-16 text-[clamp(1.1rem,0.85rem+1.3vw,1.9rem)] [grid-area:1/1] md:pt-20">
                and then forget about the list
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
