# Interactive specimens

How the Interactive tab should teach a concept. This is drawn from Emil Kowalski's vocabulary video ("Using the right words can drastically improve the results you get from your agents", 45s, 12 terms). I went through it at 2 frames a second. First applied to Design engineering > Craft · Interaction.

## What the video does

Every term gets the same three-part block:

1. **Term and one-line definition**, with a number where one exists ("300ms is a common threshold").
2. **A real, tiny piece of UI**: a search field, a card stack, an invoice table, a bar chart, a Dynamic Island pill, a settings list. It isn't a diagram of the UI and it isn't a sentence about it.
3. **One control that flips exactly one variable**, sitting under the specimen.

| Term | Specimen | Control | What makes the invisible visible |
|---|---|---|---|
| Debounce | search field | No debounce / 300ms | a network panel counting requests (8 vs 1) |
| Transform origin | stack of cards fanning out | from center / from bottom | a dot on the pivot point |
| Sticky positioning | invoice table that scrolls | Sticky / Not sticky | the header row itself |
| Stagger | bar chart | Replay | one highlighted bar |
| Ligature | "fine office flow" set large | Off / On | the glyphs |
| Morph | Dynamic Island pill | Idle / Ring / Timer | the shape |
| Tabular numbers | two ticking timers | none, it runs on its own | proportional vs tabular side by side |
| Leading | paragraph | line-height slider | live verdict: Too tight / Comfortable / Too loose |
| Affordance | trial-ending card | Without / With affordance | button fill, external-link arrow |
| Spatial consistency | settings, drill into Notifications | Shared axis / Ignores direction | the slide direction |

The rules underneath:

- **The user does the thing.** You type into the search, scroll the table, drag the slider. Nothing is a slideshow of labels.
- **Toggle labels name the variable, not a verdict.** "No debounce / 300ms", never "Bad / Good". The specimen shows the verdict.
- **Instrument the part you can't see.** Requests, pivot points, timing and layout shift are invisible in a normal UI, so the specimen adds a readout for them. This does most of the teaching.
- **Continuous variables get a live verdict.** The leading slider labels its own state as it moves.
- **Quiet chrome.** Monochrome, hairlines, at most one accent. The specimen is small and centred on an empty stage.
- **No captions inside the specimen.** One sentence above says what to try.

## What was wrong with ours

Every demo was one of six text archetypes (`toggle-fix`, `sequence`, `reveal`, `slider-map`, `meter`, `before-after`) that fill strings into a card. A lesson about drawers showed sentences *about* a drawer. Nothing behaved like the concept, so there was nothing to feel.

## The kit

`src/components/demos/specimens/kit.tsx`

- `Specimen`: the stage, a readout line, and a controls slot. Pass `focusable` plus `onKeyDown` for keyboard specimens.
- `Segmented`: a pill segmented control with a sliding thumb. This is the one-variable switch.
- `Window`: a small app surface, with an optional `url` bar that acts as instrumentation for routing.
- `Row`, `Kbd`, `Dot`, `useMotion` (reduced-motion-aware transitions).

Register a specimen by lesson id in `LESSON_DEMOS` (`src/components/demos/lessonDemos.tsx`). It overrides the archetype config, so the lesson data stays as it is.

## Craft · Interaction, as built

`src/components/demos/specimens/craftInteraction.tsx`

| Lesson | Specimen | Variable | Instrumentation |
|---|---|---|---|
| DE.CI.01 progressive disclosure | issue list | Expand / Peek / Drawer / Route | address bar + "list: ... · return: ..." |
| DE.CI.02 overlay choice | inbox with a reply composer | Modal / Drawer | count of refused thread switches |
| DE.CI.03 master-detail | six emails | Modal per row / Master-detail | read N/6, actions, actions per email; J/K |
| DE.CI.04 keyboard-first | three tasks to assign | Mouse only / Keyboard-first | pointer travel in px, clicks, keys, key trail |
| DE.CI.05 four states | projects list | Empty / Spinner / Skeleton / Error / Ready | measured layout shift on load (112px vs 0px) |
| DE.CI.06 optimistic UI | like button | Wait for server / Optimistic | network panel at 800ms, every 4th request fails and rolls back |
| DE.CI.07 z-index budget | invoices with a sticky header, an edit modal and a toast | Ad-hoc z-index / Layer budget | paint-order ladder, wrong layers outlined |

## Checklist for the next section

- [ ] Can the reader *do* the concept, not just read about it?
- [ ] Is there exactly one variable on the control, labelled with its name?
- [ ] What is invisible, and what readout shows it? (count, distance, ms, px, order)
- [ ] Does the readout use real measured values (`offsetHeight`, pointer distance), not hardcoded claims?
- [ ] Does Esc inside the specimen stop propagation, so it doesn't close the lesson modal?
- [ ] Does it hold in light and dark, and with reduced motion?
- [ ] Is the `demoCaption` one sentence about what to try?
