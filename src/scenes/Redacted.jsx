import { useLayoutEffect, useRef } from "react";
import { gsap, REDUCED_MOTION, pinnedTimeline, watchScene } from "../lib/motion";
import glitch from "../../assets/photos/mirror-glitch.webp";

/*
 * Scene 03 — Redacted origin. The palette inverts to ink.
 * Mono type, a venom scan bar sweeping the dark mirror photo,
 * and literal *** rendered as clearance-redaction chips.
 */
export default function Redacted() {
  const root = useRef(null);

  useLayoutEffect(() => {
    if (REDUCED_MOTION) {
      watchScene(root.current, "redacted");
      return;
    }
    const ctx = gsap.context((self) => {
      const q = self.selector;

      // lines develop behind the scan — a linear wipe, not a fade-up
      gsap.set(q(".r-line"), { clipPath: "inset(0 100% 0 0)" });
      gsap.set(q(".photo-glitch"), { autoAlpha: 0, scale: 1.06 });
      gsap.set(q(".scanbar"), { yPercent: -40, autoAlpha: 0 });
      gsap.set(q(".redact"), { autoAlpha: 0, scaleX: 0.4, transformOrigin: "left center" });
      gsap.set(q(".r-meta"), { autoAlpha: 0 });

      const tl = pinnedTimeline(root.current, { length: "+=200%", scrub: 0.6, id: "redacted" });

      tl.to(q(".photo-glitch"), { autoAlpha: 1, scale: 1, duration: 0.9, ease: "power2.out" }, 0)
        .to(q(".scanbar"), { autoAlpha: 1, duration: 0.2 }, 0.3)
        .to(q(".scanbar"), { yPercent: 4300, duration: 2.6, ease: "none" }, 0.4)
        .to(q(".r-meta"), { autoAlpha: 1, duration: 0.4 }, 0.35)

        .to(q(".r-line-1"), { clipPath: "inset(0 0% 0 0)", duration: 0.55, ease: "none" }, 0.55)
        .to(q(".redact-1"), { autoAlpha: 1, scaleX: 1, duration: 0.35, ease: "power4.out" }, 0.95)
        .to(q(".redact-1"), { skewX: -12, x: 3, duration: 0.05, ease: "steps(1)" }, 1.32)
        .to(q(".redact-1"), { skewX: 0, x: 0, duration: 0.05 }, 1.38)

        .to(q(".r-line-2"), { clipPath: "inset(0 0% 0 0)", duration: 0.55, ease: "none" }, 1.5)
        .to(q(".redact-2"), { autoAlpha: 1, scaleX: 1, duration: 0.35, ease: "power4.out" }, 1.95)
        .to(q(".redact-2"), { skewX: 12, x: -3, duration: 0.05, ease: "steps(1)" }, 2.28)
        .to(q(".redact-2"), { skewX: 0, x: 0, duration: 0.05 }, 2.34)

        // glitch tick on the photo as the second redaction lands
        .to(q(".photo-glitch img"), { x: -6, duration: 0.05, ease: "steps(1)" }, 1.95)
        .to(q(".photo-glitch img"), { x: 4, duration: 0.05, ease: "steps(1)" }, 2.0)
        .to(q(".photo-glitch img"), { x: 0, duration: 0.05 }, 2.05)
        .to({}, { duration: 0.5 });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="scene theme-ink" aria-label="Scene 3 — redacted origin">
      <div className="scanlines scene-pad relative z-10 flex min-h-svh items-center">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-[0.85fr_1.15fr] md:gap-16">
          {/* photo */}
          <div className="photo-glitch photo-panel relative mx-auto w-[min(62vw,270px)] rounded-xl md:w-[min(26vw,330px)]" style={{ aspectRatio: "3/4.6", boxShadow: "0 0 80px -20px color-mix(in srgb, var(--color-venom) 30%, transparent)" }}>
            <img src={glitch} alt="Nimit in a dark mirror, face lit by a phone" loading="lazy" decoding="async" style={{ filter: "saturate(0.85) contrast(1.05)" }} />
            <div className="scanbar pointer-events-none absolute inset-x-0 top-0 h-[2.5%]" style={{ background: "color-mix(in srgb, var(--color-venom) 45%, transparent)", boxShadow: "0 0 24px 4px color-mix(in srgb, var(--color-venom) 35%, transparent)" }} aria-hidden="true" />
          </div>

          {/* copy */}
          <div className="max-w-2xl">
            <p className="r-meta t-label mb-6" style={{ color: "var(--color-venom)" }}>
              03 / incident report — details withheld
            </p>
            <p className="r-line r-line-1 font-mono text-[clamp(1.35rem,0.9rem+2.4vw,2.7rem)] leading-snug" style={{ fontFamily: "var(--font-mono)" }}>
              My laptop was <span className="redact redact-1">***</span> and
            </p>
            <p className="r-line r-line-2 mt-6 font-mono text-[clamp(1.35rem,0.9rem+2.4vw,2.7rem)] leading-snug" style={{ fontFamily: "var(--font-mono)" }}>
              that led me to get into <span className="redact redact-2">***</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
