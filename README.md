# nimit.site

A cinematic vertical-scroll personal identity site. One directed mini-story:
origin → spidey sense → redacted incident → IIT Bombay → achievements →
internship → web finale.

## Stack

- Vite + React + Tailwind CSS v4 (semantic design tokens in `src/index.css`)
- GSAP + ScrollTrigger for scroll-driven scene choreography
- Fonts (self-hosted via Fontsource, `font-display: swap`):
  Bricolage Grotesque (display), Instrument Sans (body), JetBrains Mono (technical)

## Commands

```sh
npm install        # once
npm run dev        # dev server → http://localhost:5173
npm run build      # production build → dist/
npm run preview    # serve dist/ → http://localhost:4173
```

Verification helpers (need Chrome installed):

```sh
node scripts/shoot.mjs http://localhost:5173/ shots desktop full   # scroll-through screenshots
node scripts/verify.mjs http://localhost:5173/                     # keyboard/a11y checks
```

Append `?motion=reduced` to any URL to force the reduced-motion experience.

## Deploy

Upload the contents of `dist/` to the domain root (nimit.site). Vite `base`
is `/`, so asset URLs are root-absolute (`/assets/...`). `.htaccess` and
`favicon.svg` ship from `public/` into `dist/` automatically.

## Structure

- `src/scenes/` — one component per story scene, each owning its timeline
- `src/lib/motion.js` — GSAP setup, reduced-motion flag, pinned-timeline helper
- `src/components/ProgressRail.jsx` — right-edge story progress dots
- `assets/photos/` — source photos (bundled + hashed by Vite on import)
