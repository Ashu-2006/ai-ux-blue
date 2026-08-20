# Learning Roadmap

A single File Explorer for designing AI products. 12 topic folders, ~150 lessons distilled from the AI Engineering from Scratch curriculum, plus an idea library on trust and deceptive-pattern UX. Every lesson has a diagram, an interactive demo, and 3 copy-ready X posts.

## What it is

- **File Explorer navigation**: 12 topic folders (Talking to a model, Making it use tools, Reasoning and agents, Governance and control, and so on). Folders nest three levels deep where the material earns it. The URL is a slug path (`?p=making-it-use-tools/mcp-end-to-end`), so every folder and every lesson is a deep link. Browser back and forward walk the tree.
- **Real folders, not tiles**: an SVG-silhouette folder with a tab, a frosted flap, and peek cards fanning on hover. Clicking the flap descends; clicking a peek card opens that item.
- **Lesson modal** with three tabs: Learn (read), Interactive (one of six demo archetypes: slider-map, toggle-fix, sequence, reveal, before-after, meter), Post (three drafted X posts in the mechanism / design angle / one-liner format).
- **Search + kind filter + sort**, scoped to the current subtree.

## Tech

Vite 7, React 19, TypeScript, Tailwind 4, Framer Motion. Static SPA, deploys anywhere. Configured for Vercel via `vercel.json`.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs dist/
```

## Structure

- `src/lib/library.ts` - the taxonomy tree. 12 root folders + nesting rules, mapping every lesson id and roadmap idea to a path.
- `src/lib/useLibraryRoute.ts` - URL routing via `?p=<slug/path>`.
- `src/sections/Library.tsx` - the Explorer shell: breadcrumb, search + filter + sort rail, grid.
- `src/components/LessonFolder.tsx` - the generic folder component (accepts any mix of sub-folders, lessons, ideas).
- `src/components/LessonCard.tsx`, `LessonModal.tsx` - lesson leaf tile and modal.
- `src/components/demos/archetypes.tsx` - the six interactive-demo archetypes.
- `src/data/lessons/phase<N>-part<M>.ts` - one file per curriculum part.
- `public/lessons/p<phase>-<NN>.svg` - lesson diagrams.

## Deploy on Vercel

Any of:

```bash
# CLI
npx vercel               # first-time link
npx vercel --prod        # deploy to production
```

Or import the GitHub repo in the Vercel dashboard. Framework detects as Vite; `vercel.json` sets build command, output dir, cache headers, and SPA rewrite.

## Design system

Dark-first canvas (`#171717`), one accent (`#12b0ff`), Inter for prose, Geist Mono for labels. Light mode at parity. All motion respects `prefers-reduced-motion`.

## License

Curriculum content adapted from [AI Engineering from Scratch](https://github.com/rohitg00/ai-engineering-from-scratch) (MIT, Rohit Ghumare). App code MIT.
