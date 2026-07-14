# Learning Roadmap (app)

An interactive roadmap.sh-style map of the `Learning/` research: **8 topics, 256 sub-topics** for designing trustworthy AI and crypto products. Click any node to open a detail sheet with the full mental model / pattern / anti-pattern / invisible problem, plus each topic's measurement methods, tactics, fact-checked resources, and real teardown targets.

## Design

Built in **Apple product style**, following the `apple-design` and `emil-design-eng` skills (from [github.com/emilkowalski/skills](https://github.com/emilkowalski/skills), distilled from Apple's WWDC design talks). No third-party design system.

- **Type:** SF system font (`-apple-system`), size-specific tracking (negative on large display, near-zero on body), weight+size hierarchy.
- **Materials & depth:** translucent floating chrome (`backdrop-filter` blur + saturate), content scrolls under; soft layered shadows, hairline borders, no hard 1px dividers.
- **Color:** restrained neutral system + one systemBlue accent; semantic color only for the 4 node types. Full light/dark with an eased theme transition, true-black OLED dark.
- **Motion:** spring animations (Framer Motion, `bounce`+`duration` ~ Apple's damping+response); press-scale `0.97` on cards; strong custom ease-out curves; interruptible; never `scale(0)`; the sheet materializes (blur+slide) and dismisses along the same path.
- **Accessibility:** `prefers-reduced-motion` (cross-fade, no vestibular motion), `prefers-reduced-transparency` (frost → solid), hover gated behind `(hover: hover)`.

## Run it
```bash
cd Learning/app
npm install
npm run dev      # http://localhost:5173
```
Build for hosting: `npm run build` (outputs `dist/`, relative base).

## Structure
- `src/styles.css` — the entire Apple-style foundation (tokens, `@theme`, materials, motion, light/dark). Single source of styling truth.
- `src/components/RoadmapGraph.tsx` — React Flow canvas + central-spine layout (`lib/layout.ts`).
- `src/components/nodes.tsx` — root / topic / sub-topic node cards.
- `src/components/DetailDrawer.tsx` — the translucent detail sheet.
- `src/components/CommandK.tsx` — Spotlight-style search (Cmd/Ctrl-K), fuzzy across all 256 sub-topics + cluster filter.
- `src/data/roadmap.json` — generated from the 8 files in `../research/`. Node types: 🔵 model · 🟢 pattern · 🔴 anti-pattern · 🟡 invisible problem.

## Not yet wired (easy to add)
- Progress tracking (Pending/Learning/Done per node in localStorage) — `Status` type in `types.ts` is the stub.
- Post generator (sub-topic × teardown-target → ready hooks).
