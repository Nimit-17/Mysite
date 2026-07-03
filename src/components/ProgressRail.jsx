import { useEffect, useState } from "react";

const SCENES = [
  { id: "origin", label: "Origin" },
  { id: "sense", label: "Spidey sense" },
  { id: "redacted", label: "Redacted" },
  { id: "civil", label: "IIT Bombay" },
  { id: "achievements", label: "Achievements" },
  { id: "internship", label: "Internship" },
  { id: "finale", label: "The end" },
];

export default function ProgressRail() {
  const [active, setActive] = useState("origin");

  useEffect(() => {
    const onScene = (e) => setActive(e.detail.id);
    window.addEventListener("scene:active", onScene);
    return () => window.removeEventListener("scene:active", onScene);
  }, []);

  const jump = (id) => {
    const el = document.querySelector(`[data-scene="${id}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="rail" aria-label="Story progress">
      {SCENES.map((s) => (
        <button
          key={s.id}
          type="button"
          aria-label={`Go to ${s.label}`}
          aria-current={active === s.id ? "true" : undefined}
          onClick={() => jump(s.id)}
        />
      ))}
    </nav>
  );
}
