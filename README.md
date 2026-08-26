# AI UX

A library for design engineers building on top of AI models. By [Ashutosh Rana](https://github.com/Ashu-2006).

Live: **[ai-ux-blue.vercel.app](https://ai-ux-blue.vercel.app)**

A File Explorer for designing AI products. Twelve topic folders, ~195 lessons (150 from the AI Engineering from Scratch curriculum plus 45 design-engineering craft notes), and an idea library on trust and deceptive-pattern UX. Every lesson has a diagram, an interactive demo, and 3 copy-ready X posts.

## What it is

- **File Explorer navigation.** Twelve topic folders, nesting up to three deep where the material earns it. Everything is a deep link: folders route through `?f=<folder-slug>`, lessons through `?f=<folder-slug>&l=<lesson-id>`. Back and forward walk the tree.
- **Real folders, not tiles.** An SVG-silhouette folder with a tab, a frosted flap, and peek cards fanning on hover. Clicking the flap descends; clicking a peek card opens that item.
- **Lesson modal**, three tabs: Learn (the read), Interactive (one of six demo archetypes: slider-map, toggle-fix, sequence, reveal, before-after, meter), Post (three drafted X posts covering the mechanism, the design angle, and the one-liner).
- **Search, kind filter, and sort**, scoped to whatever subtree you're in.
- **Responsive.** Desktop opens a centered modal; mobile slides a bottom sheet.

## Tech

Vite 7, React 19, TypeScript, Tailwind 4, Framer Motion. Static SPA, deploys anywhere. Configured for Vercel via `vercel.json`.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs dist/
npm run preview  # serve the built app
```

## Structure

- `src/lib/library.ts` the taxonomy tree. Twelve root folders plus nesting rules, mapping every lesson id and roadmap idea to a path.
- `src/lib/lessons.ts` the `Lesson` type and the full lesson array.
- `src/lib/deep.ts` the deep-modal content records (`DEEP[id]`) for the idea library sub-topics.
- `src/lib/useLibraryRoute.ts` URL routing via `?f=` and `?l=`.
- `src/sections/Library.tsx` the Explorer shell: breadcrumb, search + filter + sort rail, grid.
- `src/components/LessonFolder.tsx` the generic folder component (accepts any mix of sub-folders, lessons, ideas).
- `src/components/LessonCard.tsx`, `LessonModal.tsx` lesson leaf tile and modal.
- `src/components/demos/archetypes.tsx` the six config-driven interactive-demo archetypes.
- `src/data/lessons/phase<N>-part<M>.ts` one file per curriculum part.
- `src/data/lessons/de/*.ts` the design-engineering craft notes.
- `public/lessons/*` lesson diagrams (SVG and PNG).

## Contributing

Adding a lesson, a demo, or a design-engineering note: read [CONTRIBUTING.md](./CONTRIBUTING.md) and the authoring guide at [docs/adding-a-lesson.md](./docs/adding-a-lesson.md).

## Deploy

Any static host works. For Vercel:

```bash
npx vercel               # first-time link
npx vercel --prod        # deploy to production
```

Or import the GitHub repo in the Vercel dashboard. Framework detects as Vite; `vercel.json` sets build command, output dir, cache headers, and SPA rewrite.

## Credits

Curriculum content adapted from [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch). App, taxonomy, demos, and design-engineering notes by Ashutosh Rana.

## License

MIT. See [LICENSE](./LICENSE).
