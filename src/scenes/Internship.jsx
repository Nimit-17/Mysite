import { useLayoutEffect, useRef } from "react";
import { gsap, REDUCED_MOTION, pinnedTimeline, watchScene } from "../lib/motion";
import warm from "../../assets/photos/warm-portrait.jpeg";

/*
 * Scene 06 — Current internship. Motion language: shipping — worklog
 * lines type themselves in behind a caret and get ticked off as done.
 * The first scene where the motion is orderly: no bounces, no slams.
 * Own color identity: dusk amber, shutter light echoing the photo.
 */
const LINES = [
  "Learning how real teams debug messy systems",
  "Shipping careful fixes without breaking trust",
  "Turning confusing edge cases into cleaner habits",
];

export default function Internship() {
  const root = useRef(null);

  useLayoutEffect(() => {
    if (REDUCED_MOTION) {
      watchScene(root.current, "internship");
      return;
    }
    const ctx = gsap.context((self) => {
      const q = self.selector;

      const rows = q(".i-row");
      gsap.set(q(".i-title"), { clipPath: "inset(0 100% 0 0)" });
      gsap.set(q(".i-sub"), { autoAlpha: 0 });
      gsap.set(q(".photo-warm"), { autoAlpha: 0 });
      gsap.set(q(".photo-warm img"), { filter: "brightness(1.65) saturate(0.55)", scale: 1.06 });
      gsap.set(q(".i-tick"), { autoAlpha: 0, scale: 0.5 });
      gsap.set(q(".i-caret"), { autoAlpha: 0 });
      // lines start blank and type in; full text lives in data-text
      q(".i-text").forEach((el) => {
        el.dataset.text = el.textContent;
        el.textContent = "";
      });

      const tl = pinnedTimeline(root.current, { length: "+=220%", scrub: 0.6, id: "internship" });

      // the photo develops like a warm print while the title prints
      tl.to(q(".photo-warm"), { autoAlpha: 1, duration: 0.5, ease: "power1.out" }, 0)
        .to(q(".photo-warm img"), { filter: "brightness(1) saturate(1)", scale: 1, duration: 1.4, ease: "power2.out" }, 0.1)
        .to(q(".i-title"), { clipPath: "inset(0 0% 0 0)", duration: 0.7, ease: "power1.inOut" }, 0.15)
        .to(q(".i-sub"), { autoAlpha: 1, duration: 0.4 }, 0.85)
        // the redaction motif carries into the present
        .to(q(".i-sub .redact"), { skewX: -12, x: 3, duration: 0.05, ease: "steps(1)" }, 1.2)
        .to(q(".i-sub .redact"), { skewX: 0, x: 0, duration: 0.05 }, 1.26);

      // each worklog line types in behind its caret, then gets ticked off
      rows.forEach((row, i) => {
        const at = 1.45 + i * 0.85;
        const text = row.querySelector(".i-text");
        tl.set(row.querySelector(".i-caret"), { autoAlpha: 1 }, at)
          .to(text, { text: text.dataset.text, duration: 0.6, ease: "none" }, at)
          .set(row.querySelector(".i-caret"), { autoAlpha: 0 }, at + 0.62)
          .fromTo(
            row.querySelector(".i-tick"),
            { autoAlpha: 0, scale: 0.5 },
            { autoAlpha: 1, scale: 1, duration: 0.18, ease: "power3.out" },
            at + 0.66
          );
      });

      tl.to({}, { duration: 0.5 });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="scene grain theme-dusk shutter-light" aria-label="Scene 6 — current internship">
      <div className="scene-pad relative z-10 flex min-h-svh items-center">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
          {/* photo */}
          <div className="photo-warm photo-panel mx-auto w-[min(56vw,250px)] md:w-[min(28vw,340px)]" style={{ aspectRatio: "3/4.3" }}>
            <img src={warm} alt="Nimit in warm light against wooden shutters, arms crossed" loading="lazy" decoding="async" style={{ height: "112%" }} />
          </div>

          {/* copy */}
          <div className="min-w-0 max-w-xl">
            <p className="t-label mb-5 text-rust-deep">06 / present day</p>
            <h2 className="i-title t-display text-[clamp(2.2rem,1.2rem+4.4vw,4.6rem)]">Current internship</h2>
            <p className="i-sub mt-4 font-mono text-[clamp(1.05rem,0.9rem+0.9vw,1.5rem)]" style={{ fontFamily: "var(--font-mono)" }}>
              Working on <span className="redact" style={{ color: "var(--color-rust-deep)", borderColor: "color-mix(in srgb, var(--color-rust) 55%, transparent)", background: "color-mix(in srgb, var(--color-rust) 12%, transparent)" }}>***</span>
            </p>

            <ul className="mt-8 flex flex-col gap-4" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {LINES.map((line, i) => (
                <li key={i} className="i-row flex items-start gap-4 border-l-2 border-rust pl-4">
                  <span className="t-label mt-1 shrink-0 text-rust">{String(i + 1).padStart(2, "0")}</span>
                  {/* invisible ghost reserves the wrapped height; typed text overlays it */}
                  <span className="t-body relative min-w-0 flex-1">
                    <span className="invisible" aria-hidden="true">{line}</span>
                    <span className="absolute inset-0">
                      <span className="i-text">{line}</span>
                      <span className="i-caret" aria-hidden="true" />
                    </span>
                  </span>
                  <span className="i-tick t-label ml-auto mt-1 shrink-0 text-rust-deep" aria-hidden="true">
                    done
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
