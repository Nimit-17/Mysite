import { useLayoutEffect, useMemo, useRef } from "react";
import { gsap, REDUCED_MOTION, pinnedTimeline, watchScene } from "../lib/motion";

/*
 * Finale — non-text closing state.
 * Ink void; a spider web draws itself in venom thread,
 * and a small spider descends to rest at its center. The end.
 */

const CX = 500;
const CY = 340;
const SPOKES = 11;
const RINGS = [70, 150, 240, 340, 460];

function buildWeb() {
  const spokes = [];
  const angles = [];
  for (let i = 0; i < SPOKES; i++) {
    // slightly irregular fan — hand-spun, not geometric
    const a = (Math.PI * 2 * i) / SPOKES + (i % 2 ? 0.09 : -0.06);
    angles.push(a);
    const x = CX + Math.cos(a) * 620;
    const y = CY + Math.sin(a) * 620;
    spokes.push(`M ${CX} ${CY} L ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  const rings = RINGS.map((r, ri) => {
    let d = "";
    for (let i = 0; i <= SPOKES; i++) {
      const a = angles[i % SPOKES];
      const rr = r * (1 + (i % 3) * 0.015);
      const x = CX + Math.cos(a) * rr;
      const y = CY + Math.sin(a) * rr;
      if (i === 0) d += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
      else {
        // sag each chord toward the center for a spun-silk feel
        const pa = angles[(i - 1) % SPOKES];
        const prr = r * (1 + ((i - 1) % 3) * 0.015);
        const px = CX + Math.cos(pa) * prr;
        const py = CY + Math.sin(pa) * prr;
        const mx = (px + x) / 2 + (CX - (px + x) / 2) * 0.06;
        const my = (py + y) / 2 + (CY - (py + y) / 2) * 0.06;
        d += ` Q ${mx.toFixed(1)} ${my.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
      }
    }
    return d;
  });
  return { spokes, rings };
}

export default function Finale() {
  const root = useRef(null);
  const web = useMemo(buildWeb, []);

  useLayoutEffect(() => {
    watchScene(root.current, "finale");
    if (REDUCED_MOTION) return;
    const ctx = gsap.context((self) => {
      const q = self.selector;
      const strands = q(".strand");

      strands.forEach((p) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      });
      gsap.set(q(".spider"), { y: -420, autoAlpha: 0 });
      gsap.set(q(".web-glow"), { autoAlpha: 0 });

      const tl = pinnedTimeline(root.current, { length: "+=170%", scrub: 0.6, id: "finale" });

      tl.to(q(".spoke"), { strokeDashoffset: 0, duration: 1.0, ease: "power2.inOut", stagger: 0.05 }, 0)
        .to(q(".ring"), { strokeDashoffset: 0, duration: 1.1, ease: "power1.inOut", stagger: 0.12 }, 0.5)
        .to(q(".spider"), { autoAlpha: 1, duration: 0.2 }, 1.3)
        .to(q(".spider"), { y: 0, duration: 1.0, ease: "power2.out" }, 1.35)
        .to(q(".web-glow"), { autoAlpha: 1, duration: 0.5 }, 2.2)
        .to(q(".spider-body"), { attr: { r: 13 }, duration: 0.25, yoyo: true, repeat: 1 }, 2.25)
        .to({}, { duration: 0.4 });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="scene theme-ink" aria-label="Closing" role="img" aria-roledescription="closing illustration">
      <div className="relative flex min-h-svh items-center justify-center">
        <svg viewBox="0 0 1000 760" className="h-svh w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <radialGradient id="webGlow" cx="50%" cy="45%" r="50%">
              <stop offset="0%" stopColor="#b5e941" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#b5e941" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect className="web-glow" width="1000" height="760" fill="url(#webGlow)" />
          {web.spokes.map((d, i) => (
            <path key={`s${i}`} className="strand spoke" d={d} fill="none" stroke="#d7e0e4" strokeOpacity="0.5" strokeWidth="1.1" />
          ))}
          {web.rings.map((d, i) => (
            <path key={`r${i}`} className="strand ring" d={d} fill="none" stroke="#d7e0e4" strokeOpacity="0.65" strokeWidth="1.2" />
          ))}
          {/* spider on a thread */}
          <g className="spider">
            <line x1={CX} y1={-260} x2={CX} y2={CY - 16} stroke="#b5e941" strokeOpacity="0.8" strokeWidth="1.4" />
            <g>
              {/* legs */}
              {[-1, 1].map((s) =>
                [0, 1, 2, 3].map((i) => (
                  <path
                    key={`${s}${i}`}
                    d={`M ${CX} ${CY} q ${s * 14} ${-10 + i * 7} ${s * 26} ${-6 + i * 9}`}
                    fill="none"
                    stroke="#b5e941"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                ))
              )}
              <circle className="spider-body" cx={CX} cy={CY} r="10" fill="#b5e941" />
              <circle cx={CX} cy={CY - 12} r="5.5" fill="#b5e941" />
            </g>
          </g>
        </svg>
      </div>
    </section>
  );
}
