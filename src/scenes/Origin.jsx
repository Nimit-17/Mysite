import { useLayoutEffect, useRef } from "react";
import { gsap, REDUCED_MOTION, DIST, IS_MOBILE, pinnedTimeline, splitWords, watchScene } from "../lib/motion";
import coastal from "../../assets/photos/coastal-portrait-860.jpeg";

/*
 * Scene 01 — Origin. The signature moment.
 * A calm coastal portrait; the spider line lands, the page fractures
 * along web-crack lines and the portrait shatters into glass shards.
 */

// Bite point (percent of the portrait panel) the cracks radiate from.
const CX = 56;
const CY = 34;

// Border points, clockwise. Shards are fans between consecutive rays.
const B = [
  [0, 0], [38, 0], [72, 0], [100, 0], [100, 42],
  [100, 100], [58, 100], [22, 100], [0, 100], [0, 52],
];

const SHARDS = B.map((p, i) => {
  const q = B[(i + 1) % B.length];
  return `polygon(${CX}% ${CY}%, ${p[0]}% ${p[1]}%, ${q[0]}% ${q[1]}%)`;
});

// Outward fling direction per shard = ray from bite point through fan centroid.
function fling(i) {
  const p = B[i];
  const q = B[(i + 1) % B.length];
  const mx = (p[0] + q[0]) / 2 - CX;
  const my = (p[1] + q[1]) / 2 - CY;
  const len = Math.hypot(mx, my) || 1;
  return { x: mx / len, y: my / len };
}

export default function Origin() {
  const root = useRef(null);

  useLayoutEffect(() => {
    if (REDUCED_MOTION) {
      watchScene(root.current, "origin");
      return;
    }
    const ctx = gsap.context((self) => {
      const q = self.selector;
      const words1 = splitWords(q(".line-1")[0]);
      const words2 = splitWords(q(".line-2")[0]);
      const shards = q(".shard");
      const cracks = q(".crack");

      // entrance beat on load — calm
      gsap.set(q(".portrait-wrap"), { yPercent: 6, autoAlpha: 0 });
      gsap.set(words1, { yPercent: 120, autoAlpha: 0 });
      gsap.to(q(".portrait-wrap"), { yPercent: 0, autoAlpha: 1, duration: 1.1, ease: "power3.out", delay: 0.15 });
      gsap.to(words1, {
        yPercent: 0, autoAlpha: 1, duration: 0.9, ease: "power4.out",
        stagger: 0.055, delay: 0.45,
      });
      gsap.to(q(".scroll-cue"), { autoAlpha: 1, duration: 0.8, delay: 1.6 });

      cracks.forEach((c) => {
        const len = c.getTotalLength();
        gsap.set(c, { strokeDasharray: len, strokeDashoffset: len, autoAlpha: 0 });
      });
      gsap.set(words2, { yPercent: 130, autoAlpha: 0, rotate: 4 });

      const tl = pinnedTimeline(root.current, { length: "+=260%", scrub: 0.6, id: "origin" });

      // beat 1 → slow push-in on the portrait, line 2 stamps in word by word
      tl.fromTo(q(".shard img"), { scale: 1.07 }, { scale: 1, duration: 1.3, ease: "none" }, 0)
        .to(q(".scroll-cue"), { autoAlpha: 0, duration: 0.2 }, 0)
        .to(words2, {
          yPercent: 0, autoAlpha: 1, rotate: 0,
          ease: "back.out(2.2)", duration: 0.5, stagger: 0.09,
        }, 0.1)
        // spider words pulse venom
        .to(q(".venom-word"), { color: "var(--color-venom-deep)", duration: 0.15 }, "<70%")

        // beat 2 — impact: flash, cracks draw, slight camera kick
        .to(q(".flash"), { autoAlpha: 0.9, duration: 0.06 }, 1.35)
        .to(q(".flash"), { autoAlpha: 0, duration: 0.3 }, 1.42)
        .fromTo(q(".stage"),
          { x: 0, y: 0 },
          { x: IS_MOBILE ? 4 : 9, y: IS_MOBILE ? -3 : -6, duration: 0.04, yoyo: true, repeat: 3, ease: "power1.inOut" },
          1.35)
        .set(q(".stage"), { x: 0, y: 0 }, 1.52)
        .set(cracks, { autoAlpha: 1 }, 1.34)
        .to(cracks, { strokeDashoffset: 0, duration: 0.55, ease: "power2.out", stagger: 0.015 }, 1.35)
        .to(q(".bite-ring"), { scale: 1, autoAlpha: 1, duration: 0.3, ease: "back.out(3)" }, 1.38)

        // beat 3 — shatter: shards fly at the viewer, void revealed
        .to(shards, {
          x: (i) => fling(i).x * (240 + (i % 3) * 160) * DIST,
          y: (i) => fling(i).y * (240 + (i % 4) * 140) * DIST,
          z: (i) => 320 + (i % 5) * 260,
          rotationX: (i) => fling(i).y * -32 - (i % 3) * 10,
          rotationY: (i) => fling(i).x * 38 + (i % 4) * 8,
          rotationZ: (i) => (i % 2 ? 14 : -12),
          autoAlpha: 0,
          duration: 1.6,
          ease: "power3.in",
          stagger: { each: 0.05, from: "random" },
        }, 2.1)
        .to(q(".portrait-frame"), { borderColor: "transparent", boxShadow: "none", duration: 0.4 }, 2.2)
        .to(q(".copy-block"), { yPercent: -60, autoAlpha: 0, duration: 1.2, ease: "power2.in" }, 2.3)
        .to(q(".void"), { autoAlpha: 1, duration: 1.2 }, 2.2)
        // cracks glow venom against the void — the web is left hanging in the dark
        .to(cracks, { stroke: "#b5e941", opacity: 0.85, duration: 0.7 }, 2.4)
        .to(q(".void-glow"), { autoAlpha: 1, duration: 0.9 }, 2.5)
        .to(q(".bite-ring"), { autoAlpha: 0, duration: 0.6 }, 2.6)
        .to({}, { duration: 0.25 }); // brief settle before unpin
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="scene grain bg-cloud" aria-label="Scene 1 — origin">
      {/* ink void revealed by the shatter */}
      <div className="void absolute inset-0 opacity-0" style={{ background: "#0e1013" }} aria-hidden="true" />
      <div
        className="void-glow pointer-events-none absolute inset-0 opacity-0"
        style={{ background: "radial-gradient(ellipse 60% 50% at 62% 40%, color-mix(in srgb, #b5e941 10%, transparent), transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="stage scene-pad relative z-10 flex min-h-svh flex-col items-center justify-center gap-8 md:flex-row md:gap-16">
        {/* copy */}
        <div className="copy-block order-2 min-w-0 max-w-2xl md:order-1 md:flex-1">
          <p className="t-label mb-5 text-ink-soft">01 / origin</p>
          <p className="line-1 t-scene text-[clamp(1.5rem,1rem+2.2vw,2.6rem)] text-ink-soft">
            Alright let&rsquo;s do this one last time
          </p>
          <h1 className="line-2 t-display mt-4 text-[clamp(2rem,0.9rem+3.6vw,4.4rem)]">
            My name is <span className="whitespace-nowrap">Nimit Limbachiya</span> and I was bitten by a{" "}
            <span className="venom-word">radioactive spider</span>
          </h1>
        </div>

        {/* portrait — shard stack */}
        <div className="portrait-wrap relative order-1 w-[min(78vw,340px)] md:order-2 md:w-[min(34vw,430px)]" style={{ perspective: "1200px" }}>
          <div
            className="portrait-frame relative overflow-hidden rounded-2xl border-2 border-ink"
            style={{ aspectRatio: "3/4.1", boxShadow: "var(--shadow-soft)", transformStyle: "preserve-3d" }}
          >
            {SHARDS.map((clip, i) => (
              <div key={i} className="shard absolute inset-0 will-change-transform" style={{ clipPath: clip }}>
                <img
                  src={coastal}
                  alt={i === 0 ? "Nimit pushing up his glasses in front of a cloudy coastline" : ""}
                  aria-hidden={i !== 0 ? "true" : undefined}
                  className="absolute inset-0 h-full w-full object-cover"
                  fetchPriority={i === 0 ? "high" : undefined}
                  draggable="false"
                />
              </div>
            ))}

            {/* web cracks */}
            <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full" viewBox="0 0 100 136" preserveAspectRatio="none" aria-hidden="true">
              {B.map((p, i) => (
                <path
                  key={i}
                  className="crack"
                  d={`M ${CX} ${CY * 1.36} L ${(CX + p[0]) / 2 + (i % 2 ? 3 : -3)} ${(CY * 1.36 + p[1] * 1.36) / 2 + (i % 3 ? 2 : -2)} L ${p[0]} ${p[1] * 1.36}`}
                  fill="none"
                  stroke="#0e1013"
                  strokeWidth="0.45"
                />
              ))}
              <circle className="bite-ring scale-50 opacity-0" cx={CX} cy={CY * 1.36} r="4.5" fill="none" stroke="var(--color-venom-deep)" strokeWidth="1.2" style={{ transformOrigin: `${CX}px ${CY * 1.36}px` }} />
            </svg>
          </div>
        </div>
      </div>

      {/* impact flash */}
      <div className="flash pointer-events-none absolute inset-0 z-20 bg-chalk opacity-0" aria-hidden="true" />

      <p className="scroll-cue t-label absolute bottom-6 left-1/2 z-10 -translate-x-1/2 opacity-0 text-ink-soft" aria-hidden="true">
        scroll
      </p>
    </section>
  );
}
