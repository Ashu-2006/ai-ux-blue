# Contributing

Thanks for taking the time. This guide is written for a designer with a bit of terminal comfort but no assumption that you have shipped a React app before.

If you have contributed to a Node project on GitHub before, you can skim past the setup and jump to [Making a change](#making-a-change).

## What you need

Before you start, install these once:

1. **[Node.js 20 or newer](https://nodejs.org/)**. Node runs the dev server and installs libraries. Grab the LTS installer for your OS. To check it worked, open a terminal and run `node --version`. You should see something like `v20.11.0`.
2. **[Git](https://git-scm.com/downloads)**. Version control. Same drill: `git --version` should print a version.
3. **A GitHub account**. Fork the repo (top-right button on GitHub).
4. **A code editor**. [VS Code](https://code.visualstudio.com/) is fine if you do not have a favorite.

That is the whole shopping list.

## Get the code on your machine

In your terminal, run these three lines. Replace `your-username` with your GitHub handle.

```bash
git clone https://github.com/your-username/ai-ux-blue.git
cd ai-ux-blue
npm install
```

- `git clone` copies the repo down.
- `cd ai-ux-blue` moves you into the folder.
- `npm install` reads `package.json`, downloads every library the app depends on into a `node_modules/` folder, and locks the versions. This takes a minute the first time and is instant afterwards.

## Run it

```bash
npm run dev
```

You will see a URL in the terminal, usually `http://localhost:5173`. Open it in a browser. The site now runs locally on your machine. Any file you save reloads the tab automatically.

To stop the server, press `Ctrl+C` in the terminal.

## Making a change

The flow for every contribution is the same:

1. **Make a branch.** Do not work on `master` directly.
   ```bash
   git checkout -b add/lesson-name-here
   ```
   Name it after what it does: `add/lesson-color-tokens`, `fix/modal-scroll-bug`, `docs/typo`.
2. **Edit files** in your editor.
3. **See it in the browser.** Because `npm run dev` is running, saves reload the tab.
4. **Check the production build.** Before you push, run:
   ```bash
   npm run build
   ```
   This is the same build Vercel runs. If it errors, fix it here (much faster than finding out after a push).
5. **Commit and push.**
   ```bash
   git add .
   git commit -m "Short summary of what changed"
   git push -u origin your-branch-name
   ```
6. **Open a pull request** on GitHub. Describe what changed. If the change is visible (a new lesson, a UI tweak), drop in a screenshot or a short screen recording. This makes review 10x faster.

## Adding content

The most useful contribution is content. There are two shapes:

- **A lesson.** One card in the file explorer. Has a title, a one-liner, a diagram, a "read time", and a modal with sections.
- **A deep sub-topic.** A richer page with an interactive demo and three tweets. Used for anti-patterns and mental models where the demo is the point.

Both live in the same taxonomy but use slightly different files. The full walkthrough (fields, examples, voice rules) is in [docs/adding-a-lesson.md](./docs/adding-a-lesson.md). Read it once before starting; then keep it open in a tab while you work.

## Style rules

Small rules, but every contributor follows them.

- **No em dashes (—) or en dashes (–)** in prose, lesson text, comments, or commit messages. Use a period, a comma, a colon, or parentheses instead. Hyphens are fine for ranges.
- **Don't reformat files** you are not changing. A content PR should not also touch component code.
- **Keep prose tight.** If a sentence can be cut, cut it. If a word is filler, drop it.
- **Match the tone of the app.** Read a few existing lessons before writing a new one; the voice is confident, specific, and mechanism-first.

## Reporting bugs

Open an issue with:

- What you did (steps).
- What you expected.
- What happened.
- Your browser and OS.
- A screen recording if it is visual (Loom, macOS Cmd+Shift+5, Windows Snipping Tool).

A recording beats a paragraph.

## Where to ask for help

- **Confused by the code?** Open a draft PR early. Reviewers can point at lines instead of guessing.
- **Not sure if an idea fits?** Open an issue with the pitch before writing. Saves both of us time.
- **Design-tokens overhaul or a big refactor?** Open an issue first. Small fixes go straight to PR.
