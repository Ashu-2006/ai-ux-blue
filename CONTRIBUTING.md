# Contributing

Thanks for taking a look. This repo runs as a static SPA and welcomes new lessons, new demos, and copy fixes.

## Prereqs

- Node 20 or newer
- npm (pnpm/yarn both work; commands below use npm)

## Local setup

```bash
git clone https://github.com/Ashu-2006/ai-ux-blue.git
cd ai-ux-blue
npm install
npm run dev
```

Open http://localhost:5173. Hot reload is on.

## Workflow

1. Fork, branch off `master`. Name the branch after what it does: `add/lesson-foo`, `fix/modal-scroll`, `docs/adding-a-lesson`.
2. Keep the change scoped. One feature, one fix, or one lesson batch per PR.
3. Run `npm run build` before pushing. TypeScript catches the loud stuff; the build catches broken imports and bad asset paths.
4. Open a PR against `master`. Describe what changed and, if the change is visible, drop in a screenshot or a short screen recording.

## Adding content

The interesting contribution is content. Two shapes:

- **A lesson** (Learn tab, diagram, one X-post row, roles in the taxonomy). See [docs/adding-a-lesson.md](./docs/adding-a-lesson.md) for the file layout and the fields.
- **A deep sub-topic** (Learn / Interactive / Post modal, a hand-built or config-driven demo, three X posts). Same doc, "Deep sub-topics" section.

Both flows end at the same checklist: build passes, the page opens, all tabs render, no console errors.

## Style, briefly

- No em dashes (—) or en dashes (–) anywhere in prose, comments, or lesson text. Hyphens for ranges, sentences for pauses.
- Component code follows the surrounding file. Don't reformat existing files as part of a content PR.
- Prose gets to the point. Cut every word you don't need.

## What's out of scope

Design-token overhauls, dependency bumps, and rewrites of the routing layer are best raised as an issue first. Small fixes go straight in.

## Reporting bugs

Open an issue with: what you did, what you expected, what happened, browser + OS. A screen recording beats a long description.
