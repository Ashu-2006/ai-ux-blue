# Adding a lesson

This is the walkthrough for adding new content to AI UX. Read once end to end, then refer back as you write.

## The mental model

The app has two kinds of pages. Pick the one that fits what you are adding.

### A **lesson** (the common case)

One card in a folder. Click the card, a modal opens with:

- a title and a one-liner
- a diagram (SVG or PNG)
- a set of sections you write (definition, how it works, examples, and so on)
- an estimated read time

Use this for teaching a topic in prose. Most content in the app is this shape.

### A **deep sub-topic** (used sparingly)

Same modal shell, but the middle tab is an **interactive demo** you can screen-record for a tweet. Used for anti-patterns and mental models where the point is felt, not read.

If you are not sure which to pick: start with a lesson. Deep sub-topics are extra effort and only pay off when the demo dramatizes the idea better than words.

## Where things live

Just the files you will touch:

```
src/
  lib/
    lessons.ts               the Lesson type and the LESSONS array
    library.ts               the folder tree (TAXONOMY)
    deep.ts                  DEEP records for deep sub-topics
    demo-configs.ts          demo shapes for config-driven demos
  data/
    lessons/
      phase12-part1.ts       lessons batched by curriculum phase
      de/craft-visual.ts     design-engineering craft notes
  components/
    DeepModal.tsx            registers custom demos
    demos/
      archetypes.tsx         the six reusable demo shapes
public/
  lessons/                   your diagrams go here (SVG or PNG)
```

You do not need to touch anything outside `src/lib`, `src/data`, `src/components/demos`, and `public/lessons`.

---

## Part 1: Adding a lesson

Six steps. About 30 minutes end to end once you know the fields.

### Step 1: Pick where it goes

Open `src/lib/library.ts`. This file is the folder tree: 12 top-level folders, each holding lesson ids under `includeLessonIds`.

Scroll and find the folder your lesson fits in. If none fits, that is a signal your lesson is too broad; narrow it, or open an issue to discuss a new folder.

Note the folder's slug (e.g. `de-craft-visual`, `talking-to-a-model`). You will use it in step 5.

### Step 2: Draft the content

Open an existing lesson file (e.g. `src/data/lessons/de/craft-visual.ts`) and copy one entry. Every lesson is one object in the `Lesson` shape.

The required fields:

- **`id`** a unique kebab-case string. Prefix it so it sorts with its neighbors: `de-cv-oklch`, `p12-01-tokenizer`.
- **`index`** its display order inside its folder. Just the next number after the last one.
- **`title`** the headline you see on the card. Short. Aim under 60 characters.
- **`oneLiner`** one sentence under the title. Names the payoff.
- **`readTime`** a string like `~5 min read`. Estimate honestly.
- **`diagram`** path to the diagram, like `/lessons/de-cv-oklch.svg`. See step 3.

Optional, but usually filled:

- **`sections`** the article body. An array of `{ heading, body }`. The body accepts markdown.
- **`terms`** a glossary sidebar. Array of `{ term, definition }`.
- **`posts`** three drafted X posts. See [Writing the posts](#writing-the-posts) below.
- **`demo`** points at one of the six archetypes if you want a small demo on the card. See [Adding a demo](#part-3-adding-a-demo).

Look at three existing lessons in the same folder before writing yours. Match their length, their voice, their level of detail. A lesson wildly longer or shorter than its neighbors reads as broken.

### Step 3: Make the diagram

Every lesson has a hero diagram on the card. It is the thing that makes the app feel like a library.

- **SVG is best.** Vector, small file, sharp at any size. Design in Figma, export as SVG, drop it in `public/lessons/`.
- **PNG is fine** for photographic or hand-illustrated content. Keep it under 200 KB. Export at 2x for retina.
- **Naming.** Match your lesson id: `de-cv-oklch.svg` sits with the `de-cv-oklch` lesson. Referenced from the lesson as `/lessons/de-cv-oklch.svg`.
- **Style.** Study the existing diagrams before making yours. Cream paper background, monochrome ink, one accent color for emphasis. Nothing that looks like a slide.

### Step 4: Wire it in

Two edits.

**Edit 1.** In your lesson file (e.g. `src/data/lessons/de/craft-visual.ts`), add your new lesson object to the exported array.

**Edit 2.** In `src/lib/library.ts`, find the folder from step 1 and add your lesson's `id` to its `includeLessonIds` array. Position matters: it decides the order inside the folder.

### Step 5: Check it

```bash
npm run build
```

If the build passes, TypeScript is happy and no imports broke.

Then run `npm run dev` and open the app. Navigate to your folder. You should see your card. Click it. Walk the modal. Check:

- The diagram loads (no broken image icon).
- The read time reads right.
- The one-liner is not truncated in a way that ruins the meaning.
- If you added posts, the Copy button copies clean.

### Step 6: Commit and open a PR

See [CONTRIBUTING.md](../CONTRIBUTING.md) for the workflow. Include a screenshot of the new card in the PR description.

---

## Part 2: Adding a deep sub-topic

This is the richer format: a modal with three tabs (Learn / Interactive / Post) and a demo that dramatizes the concept.

### The 6-part content model

A deep sub-topic is a `DeepContent` object in `src/lib/deep.ts`. Seven fields. Every field earns its place.

1. **`title`** and **`kindLabel`** the name and its type. `kindLabel` is one of: `Anti-pattern`, `Mental model`, `Pattern`, `Invisible problem`.
2. **`definition`** what the thing *is*, in 2 to 4 plain sentences. No jargon yet.
3. **`technical`** how it works, with the real terms. Name the moving parts: what happens in the code, in state, in the DOM that the screen hides.
4. **`metaphor`** a `{ label, body }` pair. A physical metaphor that makes the mechanism stick. The pilot's is *"The pin is already pulled"* (a grenade that asks after the pin is out). Vivid, and true to how the thing actually works.
5. **`example`** a `{ product, scenario, why }` triple. A real product (MetaMask, Devin, a Datadog dashboard). The concrete situation. What it costs the user in trust or money.
6. **`demoCaption`** one line under the demo telling the reader what to click and why.
7. **`posts`** exactly three X posts.

### Writing the posts

The posts are the point. Someone should be able to read the modal, screen-record the demo, copy a post, and hit send.

Voice rules (all three posts, no exceptions):

- **Name the mechanism.** Every post names the thing explicitly (post-hoc confirmation, the loop that never closes).
- **Critique + fix in one.** State the problem, then the one-line fix. Never a pure dunk.
- **Compression.** Short. Cut every spare word.
- **Confident.** State the general pattern ("most X do Y"). No hedging. Exceptions go in replies, not the post.
- **From inside the work.** "I read the handler before I judge the dialog." Observer, not guru.
- **Openers.** "Ok so...", "Now...". Lowercase-y, not announcement-y.

Three variations, X only (no LinkedIn, no threads):

- **`X · mechanism`** leads with the named mechanism, ends with the one-line fix.
- **`X · one-liner`** two short lines, maximum. Naval-style compression.
- **`X · teardown`** "I read the code first" framing on a real product.

**Blocklist.** Do not use any of these anywhere: em dashes (—), en dashes (–), "here's the thing", "let me explain", "deep dive", "hot take", "game-changer", "unpack", "buckle up", "at the end of the day".

### The 6-step wiring

1. Find the sub-topic `id` in `src/data/roadmap.json`. Format is `<topic-key>-<kind>-<index>`, e.g. `ai-agent-legibility-anti-0`.
2. Add a `DEEP[id]` entry in `src/lib/deep.ts` with all 6 parts plus the 3 posts.
3. Add or reuse a demo. See [Part 3](#part-3-adding-a-demo).
4. Set `demoCaption`.
5. `npm run build`.
6. Open the sub-topic in the browser. Check all three tabs render, fire the demo, check light and dark themes, confirm zero console errors.

---

## Part 3: Adding a demo

The demo is a small React component that dramatizes the idea. Two rules matter most:

### Rule 1: Same product, same scenario, as the example

The Learn tab names a specific real product and a specific concrete scenario. **The demo must be that scenario, as a live UI.** Not a generic illustration.

- If the example is a MetaMask signing sheet, the demo is a signing sheet.
- If the example is a Devin log, the demo is a Devin-shaped log.
- If they disagree, rewrite one until they match.

A demo that teaches the concept in a *different* product than the example is a fail. Match, or rewrite the example.

### Rule 2: Screen-recordable

A clean, self-contained stage that captures cleanly on a phone or a Loom. Nothing off-screen that would need cropping.

### The archetypes (reuse before you build)

Six reusable demo shapes live in `src/components/demos/archetypes.tsx`. Configure them from `src/lib/demo-configs.ts` instead of hand-building. Add a bespoke component only when none of these fit.

- **`confirm-order`** an action fires before or after a confirm step. Good for post-hoc confirmation, optimistic UI without rollback, non-idempotent submit.
- **`state-machine`** a region cycling through loading, empty, error, success, stale. Good for showing a state the design forgot.
- **`loop-close`** an action that does or doesn't route to the next step. Good for fire-and-forget vs closed loop.
- **`legibility`** an opaque log vs a legible event timeline. Good for blind-signing, reasoning-trace-as-audit.
- **`density`** a dense table with and without a fix. Good for silent filter, aggregation hiding a subgroup.

### Anti-slop rules for demo UI

The demo should look like the real product, not a diagram. That means:

- **No mesh, aurora, or radial-accent gradient backgrounds.** Flat neutral stage.
- **No gradient-blob avatars.** Use a real mark (a diamond, a real product logo) in monochrome.
- **No outer glows or neon shadows on buttons.** Flat fills.
- **No decorative colored status pills.** If a state is semantic, say it in body copy.
- **No candy-tinted toggle pills.** Use a neutral macOS-style segmented control.
- **Calm motion.** Near critically-damped springs (`bounce: 0`). Reserve bounce for real momentum.
- **Real data.** Real monospace values, honest sample amounts ("$8,240 at $3,296/ETH"), real product names.

If it looks like a diagram-ified explainer, you missed rule 1.

### Wiring a custom demo

For a bespoke React component:

1. Drop the component in `src/components/demos/YourDemoName.tsx`.
2. Open `src/components/DeepModal.tsx` and register it in the `DEMOS` map under the sub-topic's `id`.
3. Rebuild, open the sub-topic, check the Interactive tab.

For a config-driven demo (usually preferred):

1. Open `src/lib/demo-configs.ts`.
2. Add a `DEMO_CONFIGS[id]` entry pointing at one of the archetypes, filled with your example's specifics.
3. Rebuild.

---

## Before you submit

Walk this list. Not "I think I did each." Actually walk it.

- [ ] Build passes: `npm run build` returns success.
- [ ] Content is specific, not generic. A named product. A named mechanism.
- [ ] For a deep sub-topic: the metaphor is vivid and true.
- [ ] For a deep sub-topic: the three X posts are in the voice above, with no blocklist words and no em dashes.
- [ ] For a demo: it dramatizes the *same* product and scenario as the example.
- [ ] The page opens in the browser and every tab renders.
- [ ] Zero console errors.
- [ ] Works in both light and dark themes.
- [ ] You included a screenshot in the PR.
