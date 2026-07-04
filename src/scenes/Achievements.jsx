import { useLayoutEffect, useRef } from "react";
import { gsap, REDUCED_MOTION, pinnedTimeline, splitWords, watchScene } from "../lib/motion";
import legoSpider from "../../assets/photos/lego-spider.webp";

/*
 * Scene 05 — Achievements. Escalating one-by-one reveals:
 * LEGO (with the Spider-Man 2099 minifig photo), Clash Royale, sleep.
 */
export default function Achievements() {
  const root = useRef(null);

  useLayoutEffect(() => {
    if (REDUCED_MOTION) {
      watchScene(root.current, "achievements");
      return;
    }
    const ctx = gsap.context((self) => {
      const q = self.selector;

      splitWords(q(".ach-title")[0]);
      gsap.set(q(".ach-title .w"), { yPercent: 120, autoAlpha: 0 });
      gsap.set(q(".ach-item"), { yPercent: 60, autoAlpha: 0, rotate: 2 });
      gsap.set(q(".photo-lego"), { autoAlpha: 0, rotate: 10, yPercent: 20, scale: 0.85 });
      gsap.set(q(".zzz span"), { autoAlpha: 0, y: 14 });
      q(".trophy-ring").forEach((p) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len, autoAlpha: 0 });
      });

      const tl = pinnedTimeline(root.current, { length: "+=240%", scrub: 0.6, id: "achievements" });

      // scoreboard language: each entry lands, then its number tallies up
      const count = (sel, to, format, at) => {
        const el = q(sel)[0];
        const o = { v: 0 };
        el.textContent = format(0);
        tl.to(o, {
          v: to,
          duration: 0.55,
          ease: "power1.out",
          onUpdate: () => {
            el.textContent = format(o.v);
          },
        }, at);
      };

      tl.to(q(".ach-title .w"), { yPercent: 0, autoAlpha: 1, duration: 0.5, stagger: 0.06, ease: "power4.out" }, 0)

        .to(q(".ach-1"), { yPercent: 0, autoAlpha: 1, rotate: 0, duration: 0.6, ease: "back.out(1.9)" }, 0.8)
        .to(q(".photo-lego"), { autoAlpha: 1, rotate: -6, yPercent: 0, scale: 1, duration: 0.6, ease: "back.out(1.7)" }, 1.0);
      count(".num-1", 100, (v) => `${Math.round(v)}+`, 0.95);

      tl.to(q(".ach-2"), { yPercent: 0, autoAlpha: 1, rotate: 0, duration: 0.6, ease: "back.out(1.9)" }, 1.7)
        .set(q(".trophy-ring"), { autoAlpha: 1 }, 2.15)
        .to(q(".trophy-ring"), { strokeDashoffset: 0, duration: 0.45, ease: "power2.inOut" }, 2.15);
      count(".num-2", 11, (v) => `${Math.round(v)}k+`, 1.85);

      tl.to(q(".ach-3"), { yPercent: 0, autoAlpha: 1, rotate: 0, duration: 0.6, ease: "back.out(1.9)" }, 2.6)
        .to(q(".zzz span"), { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.12, ease: "power2.out" }, 3.0);
      count(".num-3", 14, (v) => `${Math.round(v)}+`, 2.75);

      tl.to({}, { duration: 0.5 });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="scene grain bg-cloud" aria-label="Scene 5 — achievements">
      <div className="scene-pad relative z-10 flex min-h-svh items-center">
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-[1.25fr_0.75fr] md:gap-12">
          <div className="min-w-0">
          <p className="t-label mb-6 text-ink-soft">05 / trophy cabinet</p>
          <h2 className="ach-title t-display text-[clamp(2.4rem,1.4rem+4.6vw,5rem)]">My achievements</h2>

          <ol className="mt-10 flex flex-col gap-6 md:mt-14 md:gap-8" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li className="ach-item ach-1 flex items-baseline gap-4 md:gap-8">
              <span className="t-label text-ink-soft">001</span>
              <span className="t-scene text-[clamp(1.6rem,1rem+2.6vw,3.2rem)]">
                <span className="num-1 count text-rust font-extrabold" style={{ minWidth: "2.3em" }}>100+</span> LEGO minifigures
              </span>
            </li>
            <li className="ach-item ach-2 flex items-baseline gap-4 md:gap-8">
              <span className="t-label text-ink-soft">002</span>
              <span className="t-scene text-[clamp(1.9rem,1.1rem+3.4vw,4.2rem)]">
                <span className="relative inline-block">
                  <span className="num-2 count text-rust font-extrabold" style={{ minWidth: "2.2em" }}>11k+</span>
                  <svg className="pointer-events-none absolute -inset-x-[14%] -inset-y-[18%] h-[136%] w-[128%] overflow-visible" viewBox="0 0 120 60" preserveAspectRatio="none" aria-hidden="true">
                    <path
                      className="trophy-ring"
                      d="M 96 9 C 118 16 116 44 76 51 C 34 58 4 49 5 32 C 6 14 38 4 74 8"
                      fill="none"
                      stroke="var(--color-venom-deep)"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>{" "}
                trophies in Clash Royale
              </span>
            </li>
            <li className="ach-item ach-3 flex items-baseline gap-4 md:gap-8">
              <span className="t-label text-ink-soft">003</span>
              <span className="t-scene text-[clamp(2.2rem,1.2rem+4.2vw,5rem)]">
                Can sleep <span className="num-3 count text-rust font-extrabold" style={{ minWidth: "1.6em" }}>14+</span> hours straight
                <span className="zzz ml-3 inline-block text-venom-deep" aria-hidden="true">
                  <span className="inline-block text-[0.5em]">z</span>
                  <span className="inline-block text-[0.7em]">z</span>
                  <span className="inline-block text-[0.9em]">z</span>
                </span>
              </span>
            </li>
          </ol>
          </div>

          {/* LEGO minifig sticker photo */}
          <div className="hidden md:block">
            <div
              className="photo-lego photo-panel mx-auto w-[min(24vw,280px)] border-4 border-chalk"
              style={{ aspectRatio: "3/4.4" }}
            >
              <img src={legoSpider} alt="A LEGO Spider-Man 2099 minifigure" loading="lazy" decoding="async" />
            </div>
          </div>
        </div>
      </div>
      {/* halftone strip along the bottom edge */}
      <div className="halftone pointer-events-none absolute bottom-0 left-0 right-0 h-16 opacity-60" aria-hidden="true" />
    </section>
  );
}
