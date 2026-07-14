---
name: learning-deep-page
description: Author a deep learning page (Learn / Interactive / Post modal) for a sub-topic in the Learning Roadmap app. Use when adding or regenerating the detailed content + interactive demo for any of the 256 sub-topics. Encodes the 6-part content model, Ashutosh's X-post voice, the de-slopped interactive-demo conventions, and the data/registry wiring.
---

# Learning Deep Page

How to turn one sub-topic (a mental model / pattern / anti-pattern / invisible problem) into a full deep page in the Learning Roadmap app: a center modal with **Learn / Interactive / Post** tabs. This is the gold-standard replicated from the `post-hoc-confirmation` pilot.

The goal of every page: teach the mechanism deeply, then hand the user a screen-recordable demo and ready-to-ship posts. Learning that stays in the head is not done.

## Where things live
- **Content:** `src/lib/deep.ts` → the `DEEP` record, keyed by the sub-topic's `id` (matches `SubNode.id` in `src/data/roadmap.json`).
- **Demos:** `src/components/demos/*.tsx`, registered in `src/components/DeepModal.tsx`'s `DEMOS` map by the same `id`.
- **A sub-topic opens the deep modal only if it has a `DEEP[id]` entry.** Otherwise it falls back to the side sheet. So authoring content is what "turns on" the deep page.

## The 6-part content model (fill every field)

Author a `DeepContent` object. Every field earns its place:

1. **`title`** + **`kindLabel`** — the name and its type (Anti-pattern / Mental model / Pattern / Invisible problem).
2. **`definition`** (What it is) — crisp, plain. What the thing *is*, in 2-4 sentences. No jargon yet.
3. **`technical`** (How it works) — the mechanism with real terms. Name the moving parts. This is where the code-reading edge shows: what happens in the call path / state / DOM that the screen hides.
4. **`metaphor`** — `{ label, body }`. A concrete physical metaphor that makes it stick. The pilot's is "The pin is already pulled" (a grenade that asks after the pin is out). Must be vivid and *true to the mechanism*, not decorative.
5. **`example`** — `{ product, scenario, why }`. A real AI/crypto/SaaS product where this shows up. `scenario` = the concrete situation; `why` = what it costs (tie to trust / lost users / money). Prefer MetaMask, Uniswap, a real agent tool, a real SaaS onboarding, etc.
6. **`demoCaption`** — one line telling the user what the interactive demo shows and to toggle it.
7. **`posts`** — exactly **3 X-post variations** (see voice rules below).

## Voice rules for the 3 posts (non-negotiable)

Source of truth: `d:/Claude/Writing/context/core/voice-dna.json` + `positioning.json` + `phrases.md`. Ashutosh's voice:

- **Name the mechanism.** His whole positioning is "psychology/systems is the vocabulary." Every post names the thing (post-hoc confirmation, the loop that never closes, etc.).
- **Signature shape: critique + constructive fix in one.** Never a pure dunk. State the problem, then the one-line fix.
- **Naval-style compression.** Short, dense, one-line truths. Cut every spare word.
- **Confident generalization.** State the general pattern ("most X do Y"). No hedging. Exceptions live in replies, never in the post.
- **Brotherly, from inside the work.** "I read the handler before I judge the dialog." Observer, not guru.
- **His openers:** "Ok so...", "Now...". Natural, lowercase-y, not announcement-y.

**Three variations, all X (no LinkedIn, no threads):**
- `kind: 'X · mechanism'` — leads with the named mechanism, ends with the one-line fix.
- `kind: 'X · one-liner'` — Naval compression, 2 short lines max.
- `kind: 'X · teardown'` — "I read the code first" framing on a real product.

**Hard blocklist (from `phrases.md`, enforced):** NO em dashes (`—`) or en dashes (`–`) anywhere. NO "here's the thing", "let me explain", "deep dive", "hot take", "game-changer", "unpack", "buckle up", "at the end of the day". Nothing that sounds AI-generated or LinkedIn.

## The interactive demo (de-slopped, screen-record ready)

The demo is a custom React component per sub-topic (or a reusable template for common shapes). It must be **recordable**: a clean, self-contained stage the user can screen-capture and attach to the post.

### THE #1 RULE: the demo dramatizes the SAME scenario as the "Where it shows up" example

The Learn tab's `example` names a specific real product and a specific concrete scenario. **The interactive demo must BE that scenario, rendered as a live UI.** Not a generic illustration of the concept, not an abstract before/after. The exact product, the exact situation.

- If the example is *"an image generator returns a content-policy rejection as a 200 with an error field the client ignores; the spinner resolves, no image appears, the user re-clicks and burns credits"* then the demo is an **image-generator UI**: a prompt, a Generate button, a spinner that resolves to nothing (the bug) vs. a spinner that resolves to a clear "blocked: policy" message (the fix). Same product, same moment.
- If the example is a MetaMask signing sheet, the demo is a signing sheet. If it's a Datadog dashboard, the demo is that dashboard. If it's a Duolingo streak, the demo is a streak.
- The demo's labels, copy, numbers, and product framing come STRAIGHT from the `example` fields (product, scenario) and `demoCaption`. A viewer who read the example and then watched the demo should feel they are the same story, told twice.
- A demo that teaches the concept but in a DIFFERENT product/scenario than the example is a FAIL. Match the example or rewrite the example to match a buildable demo. They are one unit.

When authoring a config-driven demo (see archetypes), fill the archetype's fields with the example's specifics: the `subject` is the example's product, the `badLines`/`badSequence`/`opaqueLabel` are the example's failing moment, the captions echo the example's `why`.

### Use the taste skill while designing every demo

Before finalizing any demo UI, apply the `design-taste-frontend` skill (Section 9 AI Tells + Section 4 directives). This is mandatory, not optional. The demo must pass its Pre-Flight: no pure black, no AI-purple/glow, no mesh gradients, no decorative status dots, no gradient-blob avatars, no em dashes, real product framing over diagram-y divs. If the `design-taste-frontend` skill is available, read it; if not, apply the distilled anti-slop rules below.

**Anti-slop rules (from the `design-taste-frontend` skill — audit against these):**
- NO mesh / aurora / radial-accent gradient backgrounds. Flat neutral stage (`var(--bg)` + hairline).
- NO gradient-blob avatars. Use a real mark (e.g. the Ethereum diamond SVG) in monochrome.
- NO outer glows / neon shadows on buttons. Flat fills, `var(--shadow-card)` at most.
- NO decorative colored status pills. If a state is semantic, say it in honest body copy.
- NO candy tinted toggle pills. Use a neutral macOS segmented control (raised active segment).
- Calm motion: near critically-damped springs (`bounce: 0`), Apple defaults. Reserve bounce for genuine momentum only.
- Make it look like the REAL product (a real wallet, a real dashboard row), not a diagram. Real monospace values, honest sample data (label rates/amounts plausibly, e.g. "$8,240 at $3,296/ETH").

**Structure that works (the pilot):**
- A neutral **record stage** wrapping the product card.
- A **good/bad segmented control** ("Confirm after" / "Confirm before") that swaps the mechanism.
- The product card runs the interaction on a primary action; the payoff (the leak) is visible in-frame.
- A **caption strip** below naming the mechanism honestly, tied back to the real example.
- Respect `prefers-reduced-motion` (cross-fade, no transform motion).

**Demo templates by type** (for scale — reuse instead of hand-building all 256):
- `confirm-order` — action fires before/after a confirm (post-hoc confirm, optimistic-UI-no-rollback, non-idempotent submit).
- `state-machine` — a region cycling through loading/empty/error/success/stale, showing a missing/collapsed state.
- `loop-close` — an action that does/doesn't route to the next step (fire-and-forget vs closed loop).
- `legibility` — an opaque action log vs a legible event timeline (blind-signing, reasoning-trace-as-audit).
- `density` — a dense table with/without the fix (silent filter, aggregation hiding a subgroup, non-tabular figures).
Map each sub-topic to the closest template; only hand-build a bespoke demo when none fit.

## Wiring a new page (checklist)
1. Find the sub-topic `id` in `src/data/roadmap.json` (format `<topic-key>-<kind>-<index>`, e.g. `ai-agent-legibility-anti-0`).
2. Add a `DEEP[id]` entry in `src/lib/deep.ts` with all 6 parts + 3 posts.
3. Build or reuse a demo component; register it in `DEMOS` in `DeepModal.tsx` under the same `id`.
4. Set `demoCaption`.
5. Verify with Playwright: open via Cmd-K, check all 3 tabs render, fire the demo interaction, check light + dark, confirm zero console errors and zero em dashes.

## Definition of done
- [ ] All 6 content parts written, specific, non-generic.
- [ ] Metaphor is vivid and true to the mechanism.
- [ ] Real named product in the example, with a real cost in `why`.
- [ ] 3 X posts in Ashutosh's voice, no blocklist words, no em dashes.
- [ ] **The demo dramatizes the SAME product + scenario as the `example` (the #1 rule). A viewer reads the example, watches the demo, and it's the same story.**
- [ ] Demo passes the `design-taste-frontend` Pre-Flight (taste skill applied), and is screen-recordable.
- [ ] Verified in browser, both themes, zero console errors.
