# Adding a lesson

Two content shapes live in this app. A **lesson** is a top-level tile in the File Explorer with a diagram, a one-liner, a "readTime", and a modal that reads more like an article. A **deep sub-topic** is an idea from the roadmap (mental model / pattern / anti-pattern / invisible problem) that opens a Learn / Interactive / Post modal with a demo you can screen-record.

The two flows share the same taxonomy and use most of the same conventions. Pick the shape that fits what you're adding.

## Where things live

- **Lessons.** `src/lib/lessons.ts` defines the `Lesson` type and exports `LESSONS`. New lesson objects live in `src/data/lessons/<batch>.ts` and get imported and spread into `LESSONS` at the top of the file.
- **Design-engineering notes.** Same shape as a lesson. Live in `src/data/lessons/de/*.ts`, one file per topic folder (`craft-visual`, `craft-motion`, `craft-interaction`, `ai-ux-patterns`, `agentic-ui`, `practice`).
- **Taxonomy (which folder holds what).** `src/lib/library.ts` has the `TAXONOMY` tree. Every root folder and every nested folder lists lesson ids under `includeLessonIds`.
- **Deep sub-topics.** `src/lib/deep.ts` holds the `DEEP` record, keyed by the sub-topic's `id`. Custom demos live in `src/components/demos/*.tsx` and get registered in `src/components/DeepModal.tsx`'s `DEMOS` map by the same `id`. Config-driven demos live in `src/lib/demo-configs.ts`.
- **Diagrams.** `public/lessons/<slug>.svg` or `.png`. Referenced from a lesson via its `diagram` field as `/lessons/<slug>.svg`.

## Adding a lesson (the common case)

1. Pick a batch file in `src/data/lessons/` or create a new one (e.g. `phase12-part6.ts` or `de/craft-visual.ts`).
2. Add a new `Lesson` object. The type is defined in `src/lib/lessons.ts`. At minimum: `id`, `index`, `title`, `oneLiner`, `readTime`, `diagram`. Fill the rest as your content earns it (`sections`, `terms`, `posts`, `demo`).
3. Drop the diagram in `public/lessons/`. Keep it small (SVG is best; PNG under 200 KB).
4. Register the lesson in the taxonomy. In `src/lib/library.ts`, find the folder it belongs to and add its `id` to `includeLessonIds`.
5. Run `npm run build`. If it passes, the lesson is wired.
6. Open the folder in the browser, click the card, walk the modal. Check the diagram loads, the read time reads right, the "Post" tab, if any, copies clean.

## Adding a deep sub-topic (Learn / Interactive / Post modal)

A deep sub-topic turns one idea into a full page. It's the flow that pairs the concept with a screen-recordable demo. Use this for anti-patterns and mental models where the demo is the point.

### The 6-part content model

Author a `DeepContent` object in `src/lib/deep.ts`. Every field earns its place:

1. **`title`** and **`kindLabel`** the name and its type: Anti-pattern, Mental model, Pattern, or Invisible problem.
2. **`definition`** (What it is). Crisp, plain. What the thing *is*, in 2 to 4 sentences. No jargon yet.
3. **`technical`** (How it works). The mechanism with real terms. Name the moving parts. This is where the code-reading edge shows: what happens in the call path, in state, in the DOM that the screen hides.
4. **`metaphor`** `{ label, body }`. A concrete physical metaphor that makes it stick. The pilot's is "The pin is already pulled" (a grenade that asks after the pin is out). Vivid and true to the mechanism, not decorative.
5. **`example`** `{ product, scenario, why }`. A real AI/crypto/SaaS product where this shows up. `scenario` is the concrete situation; `why` is what it costs (trust, lost users, money). Prefer MetaMask, Uniswap, a real agent tool, a real SaaS onboarding.
6. **`demoCaption`** one line telling the user what the interactive demo shows and to toggle it.
7. **`posts`** three X-post variations (see voice rules below).

### Voice rules for the three posts

- **Name the mechanism.** Every post names the thing (post-hoc confirmation, the loop that never closes, and so on).
- **Signature shape: critique plus a constructive fix in one.** Never a pure dunk. State the problem, then the one-line fix.
- **Compression.** Short, dense, one-line truths. Cut every spare word.
- **Confident generalization.** State the general pattern ("most X do Y"). No hedging. Exceptions go in replies, not the post.
- **Brotherly, from inside the work.** "I read the handler before I judge the dialog." Observer, not guru.
- **Openers** that read natural: "Ok so...", "Now...". Lowercase-y, not announcement-y.

**Three variations, X-only:**
- `kind: 'X · mechanism'` leads with the named mechanism, ends with the one-line fix.
- `kind: 'X · one-liner'` Naval compression, two short lines max.
- `kind: 'X · teardown'` "I read the code first" framing on a real product.

**Blocklist:** no em dashes (—) or en dashes (–). No "here's the thing", "let me explain", "deep dive", "hot take", "game-changer", "unpack", "buckle up", "at the end of the day".

### The interactive demo

The demo is a React component per sub-topic, or a reusable archetype for common shapes. Two rules matter most:

**Rule 1: the demo dramatizes the SAME scenario as the Learn tab's `example`.** Not a generic illustration. Same product, same moment. If the example is a MetaMask signing sheet, the demo is a signing sheet. If it's a Devin log, the demo is that log. A demo that teaches the concept in a *different* product than the example is a fail; either match the example or rewrite the example to fit a buildable demo.

**Rule 2: it must be screen-recordable.** A clean, self-contained stage that captures cleanly on a phone or a Loom.

### Anti-slop rules for demo UI

- No mesh, aurora, or radial-accent gradient backgrounds. Flat neutral stage (`var(--bg)` plus a hairline).
- No gradient-blob avatars. Use a real mark (an Ethereum diamond SVG, a real product logo) in monochrome.
- No outer glows or neon shadows on buttons. Flat fills, `var(--shadow-card)` at most.
- No decorative colored status pills. If a state is semantic, say it in honest body copy.
- No candy tinted toggle pills. Use a neutral macOS segmented control (raised active segment).
- Calm motion: near critically-damped springs (`bounce: 0`). Reserve bounce for genuine momentum only.
- Make it look like the real product. Real monospace values, honest sample data ("$8,240 at $3,296/ETH").

### Demo archetypes (for scale)

Rather than hand-build every demo, map each sub-topic to an archetype in `src/lib/demo-configs.ts`. Hand-build only when no archetype fits.

- `confirm-order` an action fires before or after a confirm (post-hoc confirm, optimistic UI without rollback, non-idempotent submit).
- `state-machine` a region cycling through loading, empty, error, success, stale, showing a missing or collapsed state.
- `loop-close` an action that does or doesn't route to the next step (fire-and-forget vs closed loop).
- `legibility` an opaque action log vs a legible event timeline (blind-signing, reasoning-trace-as-audit).
- `density` a dense table with and without the fix (silent filter, aggregation hiding a subgroup, non-tabular figures).

### Wiring a new deep page

1. Find the sub-topic `id` in `src/data/roadmap.json` (format `<topic-key>-<kind>-<index>`, e.g. `ai-agent-legibility-anti-0`).
2. Add a `DEEP[id]` entry in `src/lib/deep.ts` with all 6 parts plus the 3 posts.
3. Build or reuse a demo. For a config-driven demo, add a `DEMO_CONFIGS[id]` entry in `src/lib/demo-configs.ts`. For a bespoke demo, drop the component in `src/components/demos/` and register it in `DEMOS` in `DeepModal.tsx` under the same `id`.
4. Set `demoCaption`.
5. Verify in the browser: open the sub-topic, check all three tabs render, fire the demo, check light and dark, confirm zero console errors and zero em dashes in the copy.

## Definition of done

- Build passes (`npm run build`).
- Content is specific, not generic. A named product in the example. A named mechanism in the technical.
- Metaphor is vivid and true to the mechanism.
- Three X posts written in the voice above; no blocklist words; no em dashes.
- The demo dramatizes the *same* product and scenario as the example.
- The page is verified in the browser, both themes, zero console errors.
