# AI UX

A library for designers building on top of AI models. Made by [Ashutosh Rana](https://github.com/Ashu-2006).

**Live: [ai-ux-blue.vercel.app](https://ai-ux-blue.vercel.app)**

## What it is

A single website with about 195 short lessons on designing AI products. Every lesson is one card. Click a card and a modal opens with three tabs:

- **Learn** the concept, written short.
- **Interactive** a small demo you can click to feel the idea.
- **Post** three ready-to-copy tweets in a designer voice.

Lessons are grouped into 12 topic folders (visual craft, motion, AI patterns, agentic UI, and so on). Folders look and behave like folders on your Mac: an SVG shape with a tab, a flap, and preview cards fanning out on hover.

## Who it is for

- **Designers** who want to understand what a token, an agent, or a streaming response actually is, and how to design for it.
- **Design engineers** shipping AI features who need short, opinionated references instead of dense papers.
- **Anyone** curious about how AI products get built and where they go wrong.

You do not need to know how to code to use the site. You do need Node.js if you want to run it locally.

## Try it locally

You need [Node.js](https://nodejs.org/) 20 or newer. Then, in a terminal:

```bash
git clone https://github.com/Ashu-2006/ai-ux-blue.git
cd ai-ux-blue
npm install
npm run dev
```

The last line prints a URL like `http://localhost:5173`. Open it in a browser and the app runs on your machine.

Other useful commands:

- `npm run build` builds the site into a `dist/` folder.
- `npm run preview` serves the built site so you can check the production version before shipping.

## What is under the hood

Nothing exotic. If you have used a modern frontend before, this stack will feel familiar.

- **Vite 7** for the dev server and build.
- **React 19** for the UI.
- **TypeScript** for types.
- **Tailwind CSS 4** for styling.
- **Framer Motion** for animations.

It is a static single-page app. No backend, no database, no auth. It deploys to Vercel out of the box (`vercel.json` handles the config), and it works fine on Netlify, Cloudflare Pages, or any static host.

## How the files are laid out

Just the parts you will touch:

```
src/
  lib/
    library.ts        the taxonomy: which folder holds which lessons
    lessons.ts        the Lesson type and the full lessons array
    deep.ts           content for the "deep" idea-library modals
    useLibraryRoute.ts URL routing (?f= for a folder, ?l= for a lesson)
  sections/
    Library.tsx       the file-explorer shell
  components/
    LessonFolder.tsx  the folder shape and its peek cards
    LessonCard.tsx    the card grid tile
    LessonModal.tsx   the modal that opens on click
    demos/
      archetypes.tsx  the six reusable demo shapes
  data/
    lessons/          one file per curriculum part
      de/             design-engineering craft notes
public/
  lessons/            diagrams referenced by lessons (SVG and PNG)
```

## Contributing

The best way to help is to add or improve a lesson. Full walkthrough is in [CONTRIBUTING.md](./CONTRIBUTING.md), and the authoring guide (what a lesson looks like, how to write the posts, how to build a demo) is in [docs/adding-a-lesson.md](./docs/adding-a-lesson.md).

## Credits

Curriculum content adapted from [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch). The app, the taxonomy, the demos, and the design-engineering craft notes were built by [Ashutosh Rana](https://github.com/Ashu-2006).

## License

MIT. See [LICENSE](./LICENSE). Use it, fork it, learn from it.
