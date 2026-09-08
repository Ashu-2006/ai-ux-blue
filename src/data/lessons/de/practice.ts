import type { Lesson } from '@/lib/lessons';

// Design engineering · Practice (DE.PR.01-06)
// Cultures and people the discipline is built on. Verbatim from vault notes at
// Vault/20 Areas/Design Engineering/Practice/. Authored by add-lessons.
export const dePractice: Lesson[] = [
  {
    id: 'de-pr-linear',
    phase: 'Design engineering',
    part: 'Practice',
    index: 'DE.PR.01',
    title: "Linear's design engineering culture puts one artifact at the center",
    oneLiner:
      'Linear reviews design as a pull request: the diff and the preview URL are the spec, and Figma is scratch paper.',
    readTime: '~10 min read',
    diagram: '/lessons/de/de-pr-linear.png',
    diagramCaption:
      'One artifact, one truth: the PR carries the design, the Figma file is a sketchpad.',
    whyItMatters:
      'Every design team I have watched fracture split the same way: the designer owns a Figma file, the engineer owns the branch, and truth splits into two artifacts that drift after the first review. Linear\'s model collapses that gap. A designer opens a PR, and the reviewer reads a diff, not a callout on a frame, which maps directly to how token changes and component changes already share one commit at Armoriq and Ivish. Karri Saarinen\'s writing on the practice is the fastest way to stop treating "design engineer" as a title and start treating it as a workflow.',
    learningObjectives: [
      'Explain why Linear treats the merged PR, not the Figma file, as the design artifact of record.',
      'Compare a red-line handoff review against a PR-and-preview-URL review and name what each loses.',
      'Identify the structural precondition (a tight component variant grammar) that makes PR-based design review possible.',
      'Apply the "promote or discard" rule to a design decision that currently lives only in a Figma frame.',
      'Audit your own team\'s design review ritual and name which surface it actually critiques.',
    ],
    sections: [
      {
        heading: 'A ten-person team competing with Jira',
        body: 'Linear has kept its design team under ten people for most of its life, while shipping a product that competes directly with Jira, a tool built and maintained by an engineering org an order of magnitude larger. Karri Saarinen, Linear\'s co-founder and CEO, previously head of design at Airbnb and a founding designer at Coinbase, has said the small size is deliberate, not a budget constraint. Fewer designers means fewer handoffs, and every remaining designer is expected to code, ship, and own the outcome of what they shipped. The alternative failure mode is familiar: when a designer cannot write the CSS, the engineer inherits the taste decision by default, and a taste decision made under a sprint deadline defaults to "match what already exists." A small team of designer-engineers keeps the taste bar inside the same artifact everyone ships from, instead of splitting it across a spec and an implementation.',
      },
      {
        heading: 'One artifact, one truth',
        body: 'At Linear, the single artifact of record is the codebase. Figma exists, but as a sketchpad for early exploration, not a spec that engineering "implements." There is no red-line handoff step. Karri Saarinen has written that the moment a design lives only in a mockup, the mockup starts lying about what actually shipped, because nobody keeps it in sync with the merged branch. The alternative: a designer opens a pull request, an engineer reviews the interaction and the code in the same diff, and the merged branch becomes the design document. This only works because Linear\'s design system is a set of React components with a tight variant grammar. A design change is a component change, and a component change is a design change; there is no third category of "the design says X but the code does Y."',
      },
      {
        heading: 'What a red-line review throws away',
        body: 'A red-line handoff, arrows, spacing annotations, a frame labeled "final", looks precise and is actually lossy. It cannot show real interaction timing: whether a hover state arrives in 120ms or 200ms. It cannot show what a layout does with a name that is 40 characters long instead of the placeholder\'s 8. It cannot show a loading state, an empty state, or what happens when a list has 400 rows instead of the four in the mockup. A PR reviewed on a live preview URL shows all of it, because the reviewer is looking at the actual running app, fed by actual data, animated at actual frame rates. The tradeoff is real: a PR is harder to skim than a frame, and it demands a reviewer who can read a diff. Linear\'s bet is that the second cost is smaller than the first.',
      },
      {
        heading: 'The rituals reinforce the artifact',
        body: 'Linear\'s Monday demos show shipped work running in a real build, not comps. Design reviews happen against a deployed preview URL tied to the branch, not a Figma frame with comments pinned to it. Weekly writing, the Linear Method document, the company blog, Karri\'s own essays, treats writing as the same craft as design: a shared artifact anyone can edit, versioned the same way code is. None of these rituals is expensive on its own. What they do together is stop the team from measuring itself by the throughput of files produced. The metric that survives is closer to "does the product feel like Linear this week," and that question only has an answer in the deployed build, never in a component library nobody has opened in a month.',
      },
      {
        heading: 'The Linear Method makes writing an artifact too',
        body: 'The Linear Method, published at linear.app/method, is Linear\'s public operating document, and it reads like a design system for how the company thinks: sections on building, planning, and improving product, each written in the same declarative, opinionated voice as the app\'s own copy. Karri Saarinen\'s personal essays extend the same habit outward. The transferable idea is that a decision written down in prose and reviewed by a team is functionally the same kind of artifact as a component in a design system: both are single sources that can be pointed at, edited, and versioned. Most product teams keep strategy in a slide deck three people opened once. Linear keeps it in a document that reads like a spec, and treats a rewrite of that document as seriously as a rewrite of a component.',
      },
      {
        heading: 'Where the model has a ceiling',
        body: 'This is not a universally portable model, and it is worth saying so. It works at Linear because the product surface area is narrow by design, Linear ships fewer features on purpose, the opposite instinct of most B2B SaaS, the component library is small enough for one person to hold in their head, and the hiring bar selects specifically for designers who already code at a production level, which is a small and expensive pool. A two-hundred-person product org with a sprawling, inconsistent component library cannot flip a switch and start reviewing design as PRs; the review will simply fail, because the underlying artifact, the codebase, is not yet trustworthy enough to be the spec. The honest reading is that PR-based review is the reward for investing in the component system first, not a replacement for that investment.',
      },
      {
        heading: 'Lessons a designer can steal without joining Linear',
        body: 'Two things port regardless of company size. First, treat the component library as the design file: every design decision that is not a component change is a decision without a home, so either promote it into a component or discard it, there is no third bucket for vibes that live only in a Figma frame. Second, run design reviews on preview URLs and PR diffs rather than red-lined frames, at whatever scale you operate. Both changes are free to try this week. Both immediately expose which of your team\'s decisions were structural, they map to a component, and which were just taste applied once and never generalized. Small teams and taste-first hiring take years to copy. The artifact discipline is available on day one, for the cost of changing what a design review meeting actually looks at.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-pr-linear-artifact-flow.svg',
        alt: 'Two artifact flows compared',
        caption: 'The traditional handoff creates two artifacts that drift; Linear collapses them into one.',
        diagramBrief:
          'Two side-by-side flow diagrams. Left labeled "Traditional handoff": Designer icon -> Figma frame box -> arrow labeled "handoff" -> Engineer icon -> Code box, with a dotted line between the Figma frame and the Code box labeled "drift" and a small warning glyph. Right labeled "Linear model": Designer+Engineer combined icon -> single Code/PR box -> Preview URL box -> Merged branch box, with a solid line throughout labeled "one artifact". Style: cream paper background, black ink line work, one accent color highlighting the drift gap on the left and the unbroken line on the right.',
      },
      {
        src: '/lessons/de/de-pr-linear-review-surface.svg',
        alt: 'What a red-line review misses versus a live preview',
        caption: 'A static frame cannot show timing, real data length, or empty and loading states; a preview URL shows all three.',
        diagramBrief:
          'A comparison table rendered as a diagram, two columns headed "Red-line frame" and "Preview URL", four rows: "Interaction timing", "Real data length", "Empty/loading state", "Error state". Each cell in the red-line column has an X glyph (cannot show), each cell in the preview column has a check glyph (shows it live). Style: cream paper, monochrome ink, one accent color for the check marks.',
      },
    ],
    takeaways: [
      'The design artifact is the PR, not the Figma file; anything the PR does not carry is not shipped.',
      'A design engineering team stays small on purpose so no decision hides behind a handoff.',
      'Preview URLs and component diffs beat red-line reviews as the surface for critique.',
      "Karri Saarinen's public writing is the primary source; treat it as the manual.",
    ],
    terms: [
      { term: 'Design engineer', gloss: '"a designer who can code"', meaning: 'A hybrid practitioner who ships production-quality UI code as the mechanism of design decisions, not as a bonus skill.' },
      { term: 'PR review', gloss: '"reviewing the design"', meaning: 'Reviewing a design as a code diff against a deployed preview build, where the artifact under review is the actual running interaction.' },
      { term: 'Component library', gloss: '"the design system"', meaning: "The codebase's canonical, versioned set of UI primitives; a design decision that does not fit an existing component either extends the library or gets rejected." },
      { term: 'Handoff', gloss: '"designer finishes, hands to engineering"', meaning: 'The moment design intent transfers from one artifact (a mockup) to another (code); most design drift is introduced exactly here.' },
      { term: 'Red-line', gloss: '"the annotated spec"', meaning: 'An annotated static frame specifying spacing, color, and state, used historically to communicate intent before component libraries made the components themselves the spec.' },
      { term: 'Preview URL', gloss: '"a link to see the change"', meaning: 'An ephemeral deployment tied to a single branch or PR, used for review instead of a static export.' },
      { term: 'The Linear Method', gloss: '"how Linear works"', meaning: "Linear's public document on its own operating principles, treated with the same editorial rigor as a shipped feature." },
      { term: 'Variant grammar', gloss: '"the button has states"', meaning: "The constrained, named set of visual variants (size, tone, state) a component API exposes, which is what makes 'component change equals design change' true." },
      { term: 'Taste', gloss: '"good instincts"', meaning: 'A consistent, defensible set of judgments about which of several correct options a product should ship, made legible by being embedded in a reusable artifact rather than argued fresh each time.' },
      { term: 'Cmd+K palette', gloss: '"the shortcut menu"', meaning: "Linear's command palette, cited internally as an example of a feature whose entire specification lived in a PR, never in a static mockup." },
    ],
    exercises: [
      { level: 'easy', prompt: 'List three things a static Figma frame cannot show that a live preview URL can. Be specific about what breaks in each case.' },
      { level: 'medium', prompt: 'Your team currently reviews design in Figma with comments. Redesign the review ritual to use PR diffs and preview URLs instead. What tooling does it require that you do not have today?' },
      { level: 'medium', prompt: 'Pick one component in your current product that has drifted from its Figma spec. Diagnose where in the handoff process the drift was introduced.' },
      { level: 'hard', prompt: "Linear's model assumes a component library disciplined enough to be the spec. Audit your own component library: what percentage of your product's screens could be fully specified by 'which component, which variant' alone, versus needing a paragraph of exception notes?" },
      { level: 'design', prompt: "Sketch a design review agenda for a five-person team that replaces 'walk through the Figma file' with 'walk through the PR list merged this week.' What three questions does the reviewer ask about each PR that a Figma comment thread never asked?" },
    ],
    furtherReading: [
      { label: 'Karri Saarinen, personal site', url: 'https://karrisaarinen.com', why: 'His essays on small teams and taste are the primary source for this whole practice; nothing here is secondhand.' },
      { label: 'Linear, "The Linear Method"', url: 'https://linear.app/method', why: 'The public document that treats operating principles as seriously as a shipped feature; read it as a design system for how a team thinks.' },
      { label: 'Linear blog', url: 'https://linear.app/blog', why: 'Where Karri and the team publish the reasoning behind product and process decisions, in the same voice as the app copy.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'PR-based design review checklist',
      body: '- Is a live preview URL attached to the PR, not just a screenshot?\n- Does the PR touch a component, not a one-off style override?\n- Can the reviewer interact with the actual states (empty, loading, error, real data length) rather than the happy path?\n- Is there a Figma frame at all, and if so, is it older than the PR, a sign it already drifted?\n- Would this decision, if approved, be reusable next time, or is it a one-off that needs its own component?\n- Did the author write one sentence explaining the interaction choice, the way they would write a commit message?',
    },
    demoCaption:
      'A shipped Linear feature (the command menu) hides the tight design-eng loop behind it. Reveal what the PR actually carried.',
    demo: {
      archetype: 'reveal',
      subject: 'A Linear feature ships as one PR',
      opaqueLabel: 'Cmd-K palette, new feature this week',
      revealedLines: [
        'Component change: new <CommandMenu> variant, written by the designer',
        'Token change: motion-duration-fast bumped 30ms for the enter transition',
        'Copy change: empty-state string, reviewed inline with the CSS',
        'Prompt change: none (no model here), but the PR template asks anyway',
        'Preview URL: reviewers opened it and pressed Cmd-K, not a Figma frame',
        'Merged by the same person who designed it',
      ],
      badCaption:
        'A "new feature" reads like marketing and hides the handoff structure behind it. The interesting question is not what shipped, it is what was in the diff.',
      goodCaption:
        'One PR, one author, tokens and components and copy in the same commit. The artifact is the diff and the preview URL, so there is nowhere for the design to drift to.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'linear does not review designs in figma. it reviews them as pull requests.',
        body:
          'linear does not review designs in figma. it reviews them as pull requests.\n\nthe designer opens a PR, the reviewer opens the preview URL, and the diff is the design document. figma exists but as a sketchpad, not a spec.\n\nthat only works because a design change is a component change. tight variant grammar, semantic tokens, no red-lines.',
      },
      {
        kind: 'X · design angle',
        hook: 'if your design decisions do not live in the component library they live in the drift.',
        body:
          'if your design decisions do not live in the component library they live in the drift.\n\nkarri saarinen has been saying this for years: the moment a design lives in a mockup the mockup starts lying about what shipped.\n\nfix: promote every decision into a component, or discard it. no third option.',
      },
      {
        kind: 'X · one-liner',
        hook: 'small design team is a feature, not a budget line.',
        body:
          'small design team is a feature, not a budget line.\n\nfewer designers means fewer handoffs. every remaining designer must code, ship, own outcomes. taste stays in the artifact everyone builds from instead of leaking into a spec nobody reads twice.',
      },
    ],
    source: {
      label: "Vault note: Linear's design engineering culture puts one artifact at the center",
      url: 'https://karrisaarinen.com',
    },
  },
  {
    id: 'de-pr-vercel-geist',
    phase: 'Design engineering',
    part: 'Practice',
    index: 'DE.PR.02',
    title: 'Vercel and the Geist design system make motion a token',
    oneLiner:
      "Geist ships duration and easing as named tokens next to color and spacing, so Vercel's whole product moves at one pace and a design engineer can prove it in a diff.",
    readTime: '~10 min read',
    diagram: '/lessons/de/de-pr-vercel-geist.png',
    diagramCaption:
      'Motion in the token layer, next to color and spacing, not sprinkled into component code.',
    whyItMatters:
      "Most design systems stop at color and spacing. Motion, when it exists at all, lives in a designer's head and gets reinvented per component, which is why so much SaaS UI moves in ten different rhythms. Vercel's Geist ships motion as tokens the same way it ships color, and Rauno Freiberg has written specifically about why. Copying that discipline is the cheapest way to make a product feel considered without hiring a dedicated motion designer.",
    learningObjectives: [
      'Name the three things Geist ships (primitive tokens, semantic bindings, component library) and explain how they compose.',
      'Compute what changes, and what does not, when a single motion token like duration-medium is edited.',
      'Compare a token-driven motion system against a per-component "transition: all" pattern and name the audit cost of each.',
      'Explain why OKLCH, not RGB or HSL, is the color model Geist standardizes on for its tokens.',
      "Apply the 'read from tier two' rule to your own component's inline style props.",
      "Critique Rauno Freiberg's rauno.me for one interaction and name the specific token or curve responsible for how it feels.",
    ],
    sections: [
      {
        heading: 'Geist is a token layer plus a component library',
        body: 'Geist ships two things bound together: a set of design tokens (color, radius, spacing, type, motion, elevation) and a React component library that reads from them. The tokens are OKLCH-based and vary by theme, and the motion tokens name real values: duration-fast at roughly 100ms, duration-medium in the 200-250ms range, easing curves like ease-out-quart expressed as a cubic-bezier. Any component\'s transition reads from the same named shelf instead of hand-rolling its own numbers. The system keeps expanding on the same premise: Geist Pixel, a bitmap typeface added to the family, was built to read from the same token structure as Geist Sans and Geist Mono rather than shipping as a one-off asset. The library and its tokens are public at vercel.com/geist, and reading the token file for an hour is worth more than most design-system blog posts.',
      },
      {
        heading: 'What a rename actually buys you',
        body: 'The concrete case for motion tokens is arithmetic. A product with a drawer, a sheet, a tooltip, and a toast, each hand-coding its own duration and easing, has at minimum four places to find and fix when the product\'s pace needs to change, and in practice closer to a dozen once hover states and nested transitions are counted. With every one of those reading from --duration-medium and --ease-out-quart, the same change is one line in one token file. Vercel\'s own claim, echoed by Rauno Freiberg, is that a system without motion tokens turns a one-line intent, "make things feel snappier", into a two-week audit across every component that touched a transition property by hand. The token layer does not just organize the values; it turns a company-wide feel change into a single commit.',
      },
      {
        heading: "Rauno's public work is the practice manual",
        body: 'Rauno Freiberg\'s personal site at rauno.me is a working case study of the discipline, not a portfolio in the usual sense. Every page demonstrates something specific and inspectable: a physically correct drag interaction, an elastic overshoot on hover that respects a real spring model rather than an eased tween, a scroll-linked animation that degrades cleanly under prefers-reduced-motion. His 2026 essay "Novelty" extends an older thesis in one line worth stealing directly: make most things familiar, and do something unexpected only where it earns its keep. He also ships Devouring Details, a paid interaction-design manual with twenty chapters and twenty downloadable React components, which functions as the mechanism-level sequel to the free essays. If Karri Saarinen is the culture writer of this practice, Rauno is the mechanism writer.',
      },
      {
        heading: 'The role at Vercel is designer plus shipper',
        body: 'Vercel\'s public design-engineering job listings are unusually direct about what the role actually is: someone who ships React and CSS to production, who is expected to have taste in motion and typography at the level most postings reserve for senior-engineer competencies, and who owns a component\'s API the same way a backend engineer owns a service\'s interface. There is no separate handoff-to-engineering step described anywhere in the role. The reasoning, stated plainly in Vercel\'s own writing, is that a design system without a design engineer becomes a museum: the components exist, but nobody uses them, because using them correctly costs more effort than reinventing them badly. The design engineer\'s actual job is making the tokens the path of least resistance, not merely the documented one.',
      },
      {
        heading: 'Motion as a token is the transferable idea',
        body: 'The reasoning that puts motion in the token layer is identical to the reasoning that puts color there. Any duration, easing curve, or spring stiffness value used in more than one place must be named, or the product will drift one component at a time until nobody can say what the "normal" speed is anymore. Once named, a change to duration-medium propagates to every drawer, sheet, and tooltip that reads from it, in one commit. In CSS custom properties or in Framer Motion\'s variant system, this is a change measured in lines, often under fifty. In a system that hardcodes values per component, the same change is a manual audit across every file that ever wrote transition or animate. Ship the tokens before the components, not after.',
      },
      {
        heading: 'Why OKLCH, specifically',
        body: 'Geist\'s tokens standardize on OKLCH rather than RGB, HSL, or hex, and the reason is perceptual, not aesthetic. OKLCH is built so that a fixed lightness value looks equally light across hues, which RGB and HSL do not guarantee: a pure blue and a pure yellow at the same HSL lightness read as visibly different brightness to a human eye. That property matters for tokens specifically because a token system promises that --color-warning at lightness 70 will feel comparable to --color-success at lightness 70 across every theme and every future color added to the palette. Pick a color model that lies about perceptual uniformity, and the token layer inherits the lie: two "equally prominent" alerts will not read as equally prominent. Geist treats the color model itself as a token-layer decision, not a paint-chip decision made once and forgotten.',
      },
      {
        heading: 'Where tokens still need a human',
        body: 'A token system removes the excuse for reinventing a value, but it does not remove the judgment call of which value to reach for in a new context. Geist\'s tokens do not tell a design engineer whether a new confirmation dialog should use duration-fast or duration-medium; that is still a taste decision, made once and then encoded. The honest critique of "just ship tokens" advice is that tokens are a distribution mechanism for taste, not a replacement for it. A team that names ten motion tokens without anyone deciding what each one is for will ship a product that moves consistently and also consistently wrong. Geist works because Vercel\'s design engineers made the taste calls first and the token file second; copying the file without the calls gets you consistency, not quality.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-pr-geist-token-shelf.svg',
        alt: 'Motion tokens on the same shelf as color and spacing',
        caption: 'Geist stores duration and easing next to color and spacing, so one rename retimes every surface that reads from it.',
        diagramBrief:
          'A shelf/token-file diagram: a vertical list of labeled token rows under a header "tokens.css", color-fg, space-3, duration-fast, duration-medium, ease-out-quart, elevation-2, each row with a small swatch or icon matching its type (color swatch, ruler icon, stopwatch icon, curve icon, stacked-cards icon). Below, three component boxes (Drawer, Sheet, Tooltip) each with an arrow pointing up to duration-medium and ease-out-quart, showing they all read the same two tokens. Style: cream paper, black ink, one accent color highlighting duration-medium and its three arrows.',
      },
      {
        src: '/lessons/de/de-pr-geist-oklch.svg',
        alt: 'OKLCH equal lightness across hues versus HSL',
        caption: 'At the same stated lightness, HSL blue and yellow read as different brightness; OKLCH keeps them perceptually equal.',
        diagramBrief:
          'Two rows of color swatches. Top row labeled "HSL, lightness 70 for both": a blue swatch and a yellow swatch that visibly differ in perceived brightness (yellow reading much lighter than blue despite the same HSL L value). Bottom row labeled "OKLCH, lightness 70 for both": a blue swatch and a yellow swatch that read as equally bright. Style: cream paper, black ink labels, swatches shown in real color since this diagram specifically needs color, not monochrome.',
      },
    ],
    takeaways: [
      'Motion belongs in the token layer next to color and spacing, not in component code.',
      'Geist is public; read the tokens before writing your own.',
      "Rauno's personal site is a practice log a design engineer can copy verbatim.",
      "A design engineer's real job is making the tokens the path of least resistance.",
    ],
    terms: [
      { term: 'Geist', gloss: "\"Vercel's design system\"", meaning: "Vercel's public token layer plus React component library, published at vercel.com/geist." },
      { term: 'Motion token', gloss: '"an animation setting"', meaning: 'A named duration, easing curve, or spring stiffness value stored in the token layer instead of hardcoded per component.' },
      { term: 'Design engineer', gloss: '"a designer who codes"', meaning: "A practitioner who ships production UI code as the actual mechanism of a design decision, and owns a component's API like an engineer owns a service interface." },
      { term: 'OKLCH', gloss: '"a color format"', meaning: 'A perceptually uniform color model where equal lightness values read as equally bright across different hues, unlike RGB or HSL.' },
      { term: 'Easing curve', gloss: '"how fast it moves"', meaning: 'The velocity profile of an animation over time, usually expressed as a cubic-bezier function.' },
      { term: 'Elevation token', gloss: '"a shadow"', meaning: 'A named shadow value expressing z-axis layering, stored and reused the same way a color token is.' },
      { term: 'Duration token', gloss: '"how long it takes"', meaning: 'A named millisecond value, such as duration-fast or duration-medium, that every animated component reads instead of hardcoding its own number.' },
      { term: 'Spring stiffness', gloss: '"bounciness"', meaning: 'A physics parameter controlling how quickly a spring-based animation settles, distinct from a fixed-duration ease.' },
      { term: 'Path of least resistance', gloss: '"the easy way"', meaning: 'The design-system goal where using the token or component correctly is easier than reinventing it, which is what keeps a system from becoming a museum.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A component currently has `transition: all 0.3s ease`. Rewrite it to read from two named tokens (a duration and an easing curve) instead. Name the two tokens.' },
      { level: 'medium', prompt: 'Your product has four surfaces (drawer, sheet, tooltip, toast) each with a hand-written transition value. Estimate how many files you would need to touch to make them all 15 percent faster today, versus after introducing a shared duration token.' },
      { level: 'medium', prompt: 'Explain in two sentences why OKLCH is a token-layer decision and not a paint-chip decision. What breaks if a system uses HSL instead?' },
      { level: 'hard', prompt: 'Open rauno.me or vercel.com/geist in devtools, record one animation, and measure its actual duration and easing. State the token values you would name it with if you were adding it to a system.' },
      { level: 'design', prompt: "You are asked to add a new 'critical alert' banner to a product that already has duration-fast and duration-medium tokens. Decide which duration it should use, or whether it needs a new token, and write the one-sentence rationale a reviewer would see in your PR." },
    ],
    furtherReading: [
      { label: 'Vercel Geist', url: 'https://vercel.com/geist', why: 'The token file and component library are public; read the motion and elevation pages back to back to see the same structure repeated.' },
      { label: 'Rauno Freiberg, personal site', url: 'https://rauno.me', why: 'A working practice log of the exact interactions this lesson describes, each one inspectable in devtools, including the 2026 essay "Novelty."' },
      { label: 'Rauno Freiberg on X', url: 'https://x.com/raunofreiberg', why: "Shorter-form notes on individual curves and delays, useful for the 'why this specific value' reasoning." },
      { label: 'Vercel careers', url: 'https://vercel.com/careers', why: "Search 'design engineer' to read the role definition in the company's own words, not a secondhand paraphrase." },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Motion token audit checklist',
      body: '- List every component with a `transition` or animation property.\n- For each, note the duration and easing value it currently uses.\n- Group near-duplicate values (180ms and 200ms are probably the same intent).\n- Name two or three duration tokens and two or three easing tokens that cover every group.\n- Replace hardcoded values with the named tokens, one component at a time.\n- Write down, in one sentence, what each token is for (arrival, departure, emphasis) so the next person does not have to guess.',
    },
    demoCaption:
      'Same drawer, two setups: motion as an afterthought in component code, motion as a named token on the shelf. Toggle to see the drift disappear.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Motion in the system',
      badLabel: 'Afterthought',
      goodLabel: 'Token',
      badLines: [
        'Drawer.tsx: transition: transform 240ms ease-out',
        'Sheet.tsx: transition: transform 200ms cubic-bezier(0.2,0.8,0.2,1)',
        'Tooltip.tsx: transition: opacity 150ms ease',
        'Toast.tsx: transition: all 0.3s',
        'Result: ten rhythms, no way to change them together',
      ],
      badCaption:
        'Every component reinvented its own duration and curve. Nothing errors, nothing lints, and the product moves at ten different paces because there is no shared vocabulary.',
      goodLines: [
        'tokens.css: --duration-fast: 150ms; --duration-med: 220ms',
        'tokens.css: --ease-out-quart: cubic-bezier(0.25,1,0.5,1)',
        'Drawer.tsx: transition: transform var(--duration-med) var(--ease-out-quart)',
        'Sheet.tsx: reads the same two tokens',
        'Change --duration-med once, retheme every surface',
      ],
      goodCaption:
        'Motion joins color and spacing on the shelf. One rename retimes the whole app, and every new component starts from the same shelf instead of a designer\'s memory.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'motion is a token layer decision, not a component code decision.',
        body:
          'motion is a token layer decision, not a component code decision.\n\ngeist ships duration-fast, ease-out-quart, elevation-2 as first-class tokens next to color-fg and space-3.\n\nchange duration-medium once, every drawer sheet tooltip retimes in one commit. without the token layer that is a two week audit.',
      },
      {
        kind: 'X · design angle',
        hook: "a design system without a design engineer becomes a museum. components exist but nobody uses them.",
        body:
          'a design system without a design engineer becomes a museum. components exist but nobody uses them.\n\nusing them costs more than reinventing them, because the API is not tuned by someone who ships to production.\n\nthe design engineer\'s job is to make the tokens the path of least resistance. rauno at vercel is the case study.',
      },
      {
        kind: 'X · one-liner',
        hook: 'ten rhythms in one product is a design system without motion tokens.',
        body:
          'ten rhythms in one product is a design system without motion tokens.\n\nif every component picked its own duration and curve, you did not ship a system, you shipped a folder of components. name the durations. share the shelf.',
      },
    ],
    source: {
      label: 'Vault note: Vercel and the Geist design system make motion a token',
      url: 'https://vercel.com/geist',
    },
  },
  {
    id: 'de-pr-emil-kowalski',
    phase: 'Design engineering',
    part: 'Practice',
    index: 'DE.PR.03',
    title: "Emil Kowalski's motion skill sees easing as a language",
    oneLiner:
      'Emil Kowalski built Sonner and Vaul on one belief: an easing curve is a word choice, not decoration, and his defaults teach the grammar.',
    readTime: '~10 min read',
    diagram: '/lessons/de/de-pr-emil-kowalski.png',
    diagramCaption:
      'Easing as vocabulary: ease-out arrives, ease-in departs, spring says physical.',
    whyItMatters:
      "Most tutorials teach animation as a checklist: pick a duration, pick an easing, ship it. Emil Kowalski's writing and course teach it as a language with rules, where a drawer closes on a different curve than a toast dismisses because the two are saying different things. Once that framing lands, choosing motion values stops being taste and starts being intent. I use his libraries every week; watching how he documents them is a working lesson in showing design intent through code.",
    learningObjectives: [
      'Explain the "curve as part of speech" framing (ease-out as arrival, ease-in as departure, spring as physical) and apply it to a component you own.',
      "Compare Sonner and Vaul's opinionated, small-API approach against a configurable framework like Radix or shadcn/ui, and name the tradeoff each makes.",
      "Reverse-engineer a shipped animation's duration and easing using devtools, without reading its source.",
      'Predict what breaks if a component\'s animation duration is doubled or removed entirely.',
      'Distinguish a spring-based interpolation from a fixed-duration ease and state which reads as "physical."',
    ],
    sections: [
      {
        heading: 'Sonner and Vaul are motion arguments in code',
        body: "Sonner is Emil Kowalski's toast library. Vaul is his drawer component for React. Both are open source, both are small, and both are used at genuine scale: Sonner and Vaul combined pull past 70 million downloads a week from npm, across Vercel, Linear, and most Next.js starter templates. The interesting part is not the API surface but the defaults baked into it. Sonner stacks multiple toasts with a specific offset and scale-down effect on the ones behind. Vaul rubber-bands past the top edge on an iOS-style drag and ties its backdrop opacity directly to drawer position rather than to a separate timing function. Each default encodes a specific belief about how the interaction should feel, decided once by the author instead of exposed as a dozen configuration props. Read the source, not just the docs.",
      },
      {
        heading: 'The motion course teaches curves as vocabulary',
        body: 'Emil\'s course at motion.dev, built with the Motion (formerly Framer Motion) team, treats easing curves as if they were parts of speech, and it has drawn a real audience: over 11,000 students across its enrollment windows. Ease-out, which starts fast and decelerates into its resting position, is framed as a verb of arrival. Ease-in, the mirror shape, is a verb of departure. A spring, which overshoots and settles rather than following a fixed timeline, is framed as an adjective meaning "physical." The course also covers Framer Motion\'s shared layout animations and the FLIP technique for animating between two DOM states. What makes it a design resource rather than only an engineering one is that every lesson pairs the curve with its meaning, rather than only naming the cubic-bezier values.',
      },
      {
        heading: 'Why a toast and a drawer should not share a curve',
        body: 'A toast is paper: light, disposable, arriving and leaving in under 300ms with a curve that reads as quick and inconsequential. A drawer is furniture: it has weight, it occupies real screen space, and its arrival curve should read as slightly heavier, often a touch slower and with more deceleration at the end, than a toast\'s. Using one shared "transition: all 0.2s ease" for both is one of the most common motion mistakes in production UI, because it makes every element the same weight regardless of what it represents. Sonner\'s toast timing and Vaul\'s drawer timing are tuned differently for exactly this reason, and comparing the two side by side in devtools is the fastest way to feel the difference a curve makes, independent of any explanation.',
      },
      {
        heading: 'The FLIP technique, briefly',
        body: 'FLIP stands for First, Last, Invert, Play, and it solves a specific problem: animating an element between two layout positions without the browser recalculating layout on every frame, which is slow. The technique measures the element\'s First position, lets the layout change happen instantly to get the Last position, calculates the Invert, a transform that visually puts the element back where it started, and then Plays a transition from that inverted transform back to zero, which the browser can animate cheaply because it only touches transform and opacity. Framer Motion\'s layout animations implement FLIP under the hood, which is why a layoutId prop can smoothly animate a card growing into a modal without a developer writing the math by hand. Emil\'s course teaches FLIP because it is the mechanism behind most "magic" shared-element transitions people recognize but cannot name.',
      },
      {
        heading: 'Small libraries beat big frameworks for motion',
        body: "Emil's practice argues for small, opinionated primitives over configurable frameworks. Sonner is not a general notification framework; Vaul is not a general modal system. Each does one thing, ships one considered set of defaults, and expects the consumer to compose rather than configure. That is the opposite of Radix or shadcn/ui's approach, which exposes more primitives and more props specifically so teams can build their own opinions on top. Neither approach is wrong, but they solve different problems: a well-tuned default is worth more than a dozen configuration options for the substantial majority of teams who could not tell you what damping ratio their own spring uses, while a highly configurable primitive is worth more to a team that has already done that homework and needs the room.",
      },
      {
        heading: 'Study his defaults to learn intent',
        body: 'The transferable exercise is mechanical: open Vaul or Sonner in devtools, throttle the animation speed, and record it. Measure the actual duration, the easing curve, the delay before the backdrop starts fading, and the stagger interval between stacked toasts. Then, for each value, ask what would visibly break if it were doubled, halved, or removed outright. Doing this across ten of Emil\'s components builds the same intuition his course sells, for the cost of an afternoon in devtools instead of an enrollment window. It is also the exact exercise worth running on your own components before shipping them, because a value nobody can justify under that question is a value that was guessed, not decided.',
      },
      {
        heading: 'The cost of a well-tuned default',
        body: 'The honest tradeoff of Emil\'s small-library approach is that a well-tuned default is also a fixed opinion, and fixed opinions generate feature requests. Teams that adopt Vaul eventually ask for a snap point in a position the library does not support, or a backdrop behavior slightly different from the shipped one, and the answer is usually fork it or wait for upstream. That is not a flaw so much as the actual price of opinionated software: the ninety percent case gets dramatically better, and the ten percent case gets a harder ceiling than a fully configurable framework would have. Deciding whether that trade is worth it for your own product is itself a design-engineering judgment call, not a solved problem Emil\'s writing hands you an answer to.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-pr-emil-curve-vocabulary.svg',
        alt: 'Easing curves mapped to their meaning',
        caption: 'Ease-out reads as arrival, ease-in as departure, spring as physical weight.',
        diagramBrief:
          'Three small velocity-over-time curve graphs side by side, each a simple line plot. First labeled "ease-out" with the curve starting steep and flattening, subtitle "arrival". Second labeled "ease-in" with the curve starting flat and steepening, subtitle "departure". Third labeled "spring" with an oscillating overshoot-then-settle curve, subtitle "physical". Style: cream paper background, black ink line plots, one accent color per curve.',
      },
      {
        src: '/lessons/de/de-pr-emil-flip.svg',
        alt: 'The FLIP technique in four steps',
        caption: 'First, Last, Invert, Play: measure two positions, invert the difference into a transform, then animate the transform back to zero.',
        diagramBrief:
          'Four-step horizontal sequence diagram labeled F, L, I, P. Step F: small square at position A ("First"). Step L: same square jumped instantly to position B ("Last"), shown with a dotted outline at A. Step I: square shown back-transformed to sit visually at A again via a transform arrow ("Invert"). Step P: square animating smoothly from A to B along a curved motion path ("Play"). Style: cream paper, black ink, one accent color tracing the motion path in the final step.',
      },
    ],
    takeaways: [
      'Motion is a language; every duration and curve is a word choice.',
      'Small opinionated libraries teach intent better than large configurable ones.',
      "Emil's course pairs curves with meanings, not just with names.",
      'Slow-motion recordings of good defaults are a free curriculum.',
    ],
    terms: [
      { term: 'Sonner', gloss: '"a toast library"', meaning: "Emil Kowalski's open-source React toast component, notable for its stacking and offset defaults rather than its API surface." },
      { term: 'Vaul', gloss: '"a drawer library"', meaning: 'Emil Kowalski\'s open-source React drawer component with physics-based drag, rubber-band overshoot, and snap points.' },
      { term: 'motion.dev', gloss: '"an animation course site"', meaning: 'The course platform Emil built with the Motion team, teaching easing curves as a vocabulary rather than a settings panel.' },
      { term: 'Ease-out', gloss: '"starts fast, slows down"', meaning: 'A curve whose velocity decreases toward the end of the transition, conventionally read as an object arriving.' },
      { term: 'Ease-in', gloss: '"starts slow, speeds up"', meaning: 'The mirror of ease-out, whose velocity increases toward the end, conventionally read as an object departing.' },
      { term: 'Spring', gloss: '"bouncy"', meaning: 'A physics-based interpolation defined by stiffness and damping rather than a fixed duration, which can overshoot and settle the way a real object does.' },
      { term: 'FLIP', gloss: '"a layout animation trick"', meaning: 'First, Last, Invert, Play; a technique that animates a layout change cheaply by only transforming the element, not recalculating layout each frame.' },
      { term: 'Damping ratio', gloss: '"how much it bounces"', meaning: "The parameter controlling how quickly a spring's oscillation settles; low damping bounces longer, high damping settles fast with little overshoot." },
      { term: 'Opinionated library', gloss: '"a library with fewer options"', meaning: 'A component that ships one considered default per decision rather than exposing every value as a configurable prop.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Open Sonner\'s demo, trigger three toasts in a row, and describe in your own words what the stacking, offset, and scale-down default is communicating about which toast matters most right now.' },
      { level: 'medium', prompt: 'Record Vaul\'s drawer-close animation at 4x slowdown in devtools. State its approximate duration and whether the curve reads as ease-out, ease-in, or spring.' },
      { level: 'medium', prompt: 'Explain FLIP in three sentences to a teammate who has never heard the term, using a real example from your own product, a card expanding into a detail view, for instance.' },
      { level: 'hard', prompt: "Pick one component in your own product that shares a single 'transition: all' value across multiple different elements (a toast, a drawer, a tooltip). Redesign it with at least two distinct curves, and justify each in one sentence." },
      { level: 'design', prompt: 'A support ticket asks for a snap point Vaul does not support out of the box. Write the one-paragraph decision memo: fork the library, wait for upstream, or redesign the interaction to avoid needing the snap point at all.' },
    ],
    furtherReading: [
      { label: 'Emil Kowalski, personal site', url: 'https://emilkowal.ski', why: 'His case studies show the reasoning behind Sonner and Vaul\'s defaults, not just the finished API.' },
      { label: 'Sonner', url: 'https://sonner.emilkowal.ski', why: 'Click through the live demo and read the source for the stacking and offset logic described in this lesson.' },
      { label: 'Vaul', url: 'https://vaul.emilkowal.ski', why: 'Drag the mobile demo past its top edge to feel the rubber-band default firsthand before reading how it is built.' },
      { label: "Emil Kowalski's animations course", url: 'https://motion.dev/courses', why: "The curriculum that turns 'curve as vocabulary' into a taught sequence of lessons, built with the Motion team." },
    ],
    shipIt: {
      kind: 'rubric',
      name: 'Motion default review rubric',
      body: '- What does this curve say the object is made of (paper, wood, glass)?\n- Does the arrival curve differ from the departure curve, and if not, why not?\n- What is the actual measured duration in devtools, not the value you typed?\n- What visibly breaks if this value is doubled, halved, or removed? If the answer is "nothing," the value was probably guessed.',
    },
    demoCaption:
      'A drawer close, two settings: the default browser easing vs the intent-driven 200ms ease-out. Toggle to feel the sentence change.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Drawer close, same DOM, two curves',
      badLabel: 'Default easing',
      goodLabel: 'The 200ms rule',
      badLines: [
        'transition: all 0.3s ease',
        '"ease" is the browser\'s hedge, symmetric in and out',
        'No difference between arrival and departure',
        'Duration set by feel, not by measurement',
        'Reads: generic, plasticky, "AI-generated"',
      ],
      badCaption:
        'The default curve says nothing. Symmetric in and out means the panel arrives and departs with the same voice, which is not how physical objects work.',
      goodLines: [
        'transition: transform 200ms cubic-bezier(0.25,1,0.5,1)',
        'ease-out-quart, a verb of arrival',
        '200ms is the perceptual sweet spot for a small overlay',
        'A separate ease-in curve for dismiss, so departure reads differently',
        'Reads: intentional, physical, quiet',
      ],
      goodCaption:
        'Ease-out for the arrival, a slightly faster ease-in for the departure, 200ms because anything longer starts to drag. Now the drawer has a sentence, not a shrug.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'easing curves are parts of speech.',
        body:
          'easing curves are parts of speech.\n\nease-out is a verb of arrival. ease-in is a verb of departure. spring is an adjective that says "physical."\n\nemil kowalski\'s course teaches motion this way and it is the reason his libraries feel considered by default. curve is meaning, not decoration.',
      },
      {
        kind: 'X · design angle',
        hook: 'a drawer closing and a toast dismissing use different curves because they are saying different things.',
        body:
          'a drawer closing and a toast dismissing use different curves because they are saying different things.\n\na drawer is heavy, a toast is paper. same 200ms budget, different sentence.\n\nif your components share one "transition: all" they share one voice, and that voice is nothing.',
      },
      {
        kind: 'X · one-liner',
        hook: 'record a good library at 4x. that is the curriculum.',
        body:
          'record a good library at 4x. that is the curriculum.\n\nopen vaul or sonner in devtools, slow the animation, measure the duration and easing and stagger. ask what breaks if you double or halve each value. ten components in, you have the intuition emil\'s course sells.',
      },
    ],
    source: {
      label: "Vault note: Emil Kowalski's motion skill sees easing as a language",
      url: 'https://emilkowal.ski',
    },
  },
  {
    id: 'de-pr-paco-coursey',
    phase: 'Design engineering',
    part: 'Practice',
    index: 'DE.PR.04',
    title: "Paco Coursey's transitions ship the drawer over the modal",
    oneLiner:
      "Paco Coursey's cmdk and Vaul both argue the same point: prefer an interruption that keeps context, and animate it like a physical object, not a modal on its side.",
    readTime: '~10 min read',
    diagram: '/lessons/de/de-pr-paco-coursey.png',
    diagramCaption:
      'A modal blows the current view apart; a drawer keeps it. Same task, different weight of interruption.',
    whyItMatters:
      'Every Armoriq surface I design has a where-does-the-detail-go decision. A modal blows the current view apart; a drawer keeps it standing. Paco Coursey has spent years making the drawer option a one-line install, and his libraries are a large part of why "just use a drawer" became a default in the React ecosystem. Studying his repos teaches the specific interaction choices that make a drawer read as a first-class surface instead of a modal turned on its side.',
    learningObjectives: [
      'State the "interrupt less" rule and apply it to a real product decision between a modal and a drawer.',
      'Name the four things a modal typically destroys (focus anchor, scroll position, selection state, visible context) that a drawer preserves.',
      "Explain cmdk's interaction contract (keyboard-first, fuzzy search, grouped results) and why it displaced traditional menu navigation.",
      "Compare a drawer's snap point and rubber-band behavior against a modal's binary open and closed state.",
      'Audit a shipped surface in your own product and decide whether its current container (modal, drawer, popover) matches the weight of its interruption.',
    ],
    sections: [
      {
        heading: 'cmdk normalized the command palette',
        body: "Paco Coursey built cmdk, the headless command palette component used by Linear, Vercel, Raycast-inspired sites, and a large share of the modern dashboard landscape's search-first surfaces. Vercel adopted it for their own internal command menu the year after its solo 2019 build, and Paco rewrote it in 2022 for speed and simplicity; the library now pulls past 41 million downloads a week from npm. The interesting part is not the popup chrome but the interaction contract underneath it: keyboard-first by default, fuzzy search rather than exact match, results grouped and ordered by inferred intent, and animation restrained to a single fade-and-scale so the palette never competes with the content it is searching. cmdk shipped a working argument that a search-first surface can replace roughly half of a traditional menu system's navigation. The library lives at cmdk.paco.me, and its source is short enough to read start to finish in an afternoon.",
      },
      {
        heading: 'Vaul argues for physical drawers',
        body: 'Vaul, co-authored with Emil Kowalski, is a React drawer with drag-to-dismiss, configurable snap points, and a backdrop whose opacity is bound to drawer position rather than to a separate timing function. Emil has explained the motivation directly: "I prefer using a drawer instead of a modal on mobile for a more native feel," and the gap in the existing tooling was concrete, nothing shipped drag-to-dismiss out of the box. The API is deliberately small. The defaults do the real work: an iOS-style drag rubber-bands past the top edge instead of stopping dead, a release below a threshold snaps back to the open position instead of feeling like a failed gesture, and the whole interaction respects prefers-reduced-motion without extra configuration. A drawer is not "a modal that slides in from the side." It is a physical object with weight, edges, and a resting position, and the animation is the affordance, not decoration on top of it.',
      },
      {
        heading: 'The four things a modal takes from you',
        body: 'A modal, used where a drawer would do, quietly destroys four things a user had a moment ago. It steals focus off the row or item the user was looking at, so returning to it requires re-finding it. It frequently resets scroll position in the view behind it, so a long list snaps back to the top. It commonly drops any multi-select or in-progress form state in the background view, because the modal\'s presence assumes the background is now inert. And it changes the felt weight of the interaction from "a peek at more detail" to "a full context switch," even when the underlying task, viewing one invoice\'s line items, for instance, was genuinely small. None of this is a bug in any single modal component; it is the structural cost of the container itself.',
      },
      {
        heading: 'When a modal is still the correct call',
        body: 'The counterargument matters as much as the rule. A modal is still correct when the interruption genuinely needs the user\'s full, undivided attention: a destructive confirmation, a blocking error, a multi-step wizard that should not be abandoned halfway. A modal\'s entire value proposition is that it makes stepping away from the current task feel effortful, which is exactly the right feeling for "are you sure you want to delete this," and exactly the wrong feeling for "here are this invoice\'s line items." The design decision is not "drawers are better," it is "match the container\'s weight to the weight of the interruption," and most teams default to modals for both cases because a modal was the first pattern they learned, not because it was the correct pattern for the low-stakes case.',
      },
      {
        heading: 'Personal site as a portfolio of transitions',
        body: "Paco's own site at paco.me functions as a working portfolio of transitions rather than a static gallery. Page changes use shared layout animations, so an element that exists on both the source and destination view appears to move rather than swap. Hover states carry specific, non-default curves. The mobile menu is, unsurprisingly, a drawer. The site rewards being opened in devtools with CPU throttled and animations slowed to 4x: every choice becomes legible at that speed, which element leads a transition, which lags a beat behind, which fades against the motion rather than with it, and which change is layout-only with no animation at all. It functions as a live case study a design engineer can study the same way they would study a well-commented codebase.",
      },
      {
        heading: 'The generalizable rule is interrupt less',
        body: 'The through-line across cmdk and Vaul is a stated preference for interruptions that preserve context over ones that discard it. A command palette is a search overlay dismissible with a single Escape keystroke, leaving the underlying view untouched. A drawer is a shelf that keeps the list the user came from visible at reduced opacity behind it. Both are less disruptive than a modal for tasks that do not require full attention. The practical habit this produces: on any new surface, ask "does this action need to steal focus" before reaching for a container. Nine times out of ten the honest answer is no, and Paco\'s libraries make shipping the "no" version a one-line install rather than a bespoke build.',
      },
      {
        heading: 'Reading his repos as a designer, not just a user',
        body: "The exercise worth running is not just using cmdk and Vaul as a consumer but reading their source as a designer. cmdk's grouping and filtering logic reveals exactly how intent-ordered results is implemented, not just described. Vaul's drag handler shows the actual math behind the rubber-band overshoot, a damped resistance curve rather than a hard stop. Neither repo is long: cmdk's core logic fits in a handful of files, and Vaul's drag logic is a similarly small surface. Reading both in one sitting turns 'prefer a drawer' from an aesthetic preference into an implementable specification, because the exact resistance curve, snap threshold, and backdrop-opacity mapping are all sitting in the source rather than left to guesswork.",
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-pr-paco-modal-vs-drawer.svg',
        alt: 'What survives a modal versus a drawer',
        caption: 'A modal typically loses focus anchor, scroll position, and selection state; a drawer keeps all three visible behind it.',
        diagramBrief:
          'Two vertical panels side by side. Left panel labeled "Modal": a full-screen overlay covering a list, with three small broken-chain icons labeled "focus lost", "scroll reset", "selection lost". Right panel labeled "Drawer": a partial overlay, roughly 40-50 percent width, sliding in from the right, list still visible and readable behind it at reduced opacity, with three small check icons labeled "focus kept", "scroll kept", "selection kept". Style: cream paper background, black ink, one accent color for the broken-chain icons on the left and the check icons on the right.',
      },
      {
        src: '/lessons/de/de-pr-paco-rubber-band.svg',
        alt: "The rubber-band resistance curve past a drawer's edge",
        caption: 'Past the top edge, drag distance is resisted by a damping curve instead of stopping dead, which is what makes the overshoot feel physical.',
        diagramBrief:
          'A single graph: x-axis "actual finger drag distance", y-axis "visual drawer movement". Below the snap threshold, a straight 1:1 diagonal line labeled "1:1 movement". Past the threshold, the line curves and flattens, diminishing returns, labeled "damped resistance (rubber-band)". A dotted horizontal line marks the threshold point. Style: cream paper, black ink line graph, one accent color for the damped-resistance segment.',
      },
    ],
    takeaways: [
      'Prefer a drawer to a modal whenever the user still needs the underlying context.',
      'cmdk is the command palette default; use it before writing your own.',
      "Vaul's defaults are the drawer decisions you would spend a sprint on.",
      "Slow down paco.me's animations to see what a considered site looks like.",
    ],
    terms: [
      { term: 'cmdk', gloss: '"the command palette library"', meaning: "Paco Coursey's headless React command palette component, defining the keyboard-first, fuzzy-search interaction contract most modern palettes copy." },
      { term: 'Vaul', gloss: '"the drawer library"', meaning: 'A React drawer component by Paco Coursey and Emil Kowalski with drag-to-dismiss, snap points, and position-linked backdrop opacity.' },
      { term: 'Command palette', gloss: '"the search popup"', meaning: 'A search-first overlay, typically opened with Cmd+K, that replaces a portion of traditional menu navigation with typed intent.' },
      { term: 'Snap point', gloss: '"where the drawer stops"', meaning: 'A configured height or position a drawer settles into after a drag gesture crosses its threshold.' },
      { term: 'Rubber-band', gloss: '"the bouncy overshoot"', meaning: 'Elastic resistance past a boundary, borrowed from iOS scroll physics, that signals a limit without stopping the gesture dead.' },
      { term: 'Shared layout animation', gloss: '"the element that moves"', meaning: 'The same DOM element, or one treated as the same by a layoutId, animating smoothly between two different layout positions across a view change.' },
      { term: 'Focus anchor', gloss: '"where you were looking"', meaning: "The specific element a user's attention and keyboard focus were on before an interruption; a well-designed drawer preserves it, a modal typically does not." },
      { term: 'Context switch', gloss: '"leaving the task"', meaning: 'The felt cost of an interruption that requires abandoning the current view rather than viewing something alongside it.' },
      { term: 'Weight of interruption', gloss: '"how big a deal it feels like"', meaning: 'The design property that should determine container choice; a destructive confirmation warrants more weight than a detail peek.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'List the four things a modal typically takes from a user (focus, scroll position, selection state, felt context) and check which of your product\'s modals actually lose each one.' },
      { level: 'medium', prompt: "Open cmdk's demo, trigger the palette, and describe the grouping and ordering logic you observe. Is it alphabetical, recency-based, or intent-based? How can you tell?" },
      { level: 'medium', prompt: 'Slow down paco.me in devtools to 4x. Identify one transition where the departing element fades against the motion rather than with it. What does that choice communicate?' },
      { level: 'hard', prompt: "Read Vaul's drag handler source. Describe, in plain language, the resistance curve it uses past the snap threshold, and what would change about the feel if that resistance were removed." },
      { level: 'design', prompt: "You are asked to add a 'confirm and delete' flow and a 'view order details' flow to the same product. Decide the container for each (modal, drawer, popover) and write the one-sentence rule that explains why they differ." },
    ],
    furtherReading: [
      { label: 'Paco Coursey, personal site', url: 'https://paco.me', why: 'A working portfolio of the exact transition choices this lesson describes; slow the animations down in devtools.' },
      { label: 'cmdk', url: 'https://cmdk.paco.me', why: "Read the source for the grouping and filtering logic behind 'intent-ordered results,' not just the demo." },
      { label: 'Vaul', url: 'https://vaul.emilkowal.ski', why: 'Drag the mobile demo past its top edge to feel the rubber-band default before reading the drag-handler source.' },
      { label: 'Paco Coursey on GitHub', url: 'https://github.com/pacocoursey', why: "Both cmdk and Vaul's commit history show the defaults being tuned incrementally, useful for seeing the practice as iteration, not a single decision." },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Modal vs drawer decision checklist',
      body: "- Does this action need the user's full, undivided attention (destructive, blocking, multi-step)? If yes, modal.\n- Does the user need to keep seeing the list, row, or selection they came from? If yes, drawer.\n- Will dismissing this need to preserve scroll position and multi-select state in the background? If yes, avoid a modal.\n- Is the interaction genuinely small (one row's details, one quick action)? If yes, a drawer or popover is probably over-weighted by a modal.\n- Would 'press Escape and be back exactly where I was' describe success? If yes, you are describing a drawer or palette, not a modal.",
    },
    demoCaption:
      'Same task, "view invoice details," in two containers. See how much of the current view survives each choice.',
    demo: {
      archetype: 'before-after',
      subject: 'Where does the detail go',
      badLabel: 'Modal',
      goodLabel: 'Drawer',
      badLines: [
        'Backdrop covers the entire list',
        'Focus moves off the row the user came from',
        'Escape closes, but the scroll position resets',
        'Multi-select in the list behind is lost',
        'Feels like a page change, not a peek',
      ],
      badCaption:
        'A modal steals the whole view for a task that only needed a shelf. The list underneath is gone, the user\'s selection is gone, and the return path is a new page.',
      goodLines: [
        'Backdrop covers 40 percent, list still readable',
        'Focus stays anchored to the invoice row',
        'Drag-to-dismiss, snap points, escape to close',
        'Multi-select survives; the drawer is scoped to one row',
        'Feels like a peek, not a departure',
      ],
      goodCaption:
        'The list stays visible, the selection survives, dismiss is a gesture the body already knows. A drawer is not a modal on its side, it is a shelf with weight and edges.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'a drawer is not a modal that slides. it is a physical object with weight and edges.',
        body:
          'a drawer is not a modal that slides. it is a physical object with weight and edges.\n\npaco coursey and emil built vaul around that idea: drag-to-dismiss, snap points, backdrop opacity tied to drawer position not to a timing function.\n\nthe animation is not decoration, it is the affordance. once you see it that way you stop shipping modals for tasks that need a shelf.',
      },
      {
        kind: 'X · design angle',
        hook: 'the first question on every new surface: does this action need to steal focus.',
        body:
          'the first question on every new surface: does this action need to steal focus.\n\nnine times out of ten the answer is no. the user still needs the list they came from, the selection they made, the scroll position they earned.\n\npaco\'s libraries are the fastest way to ship the "no" version. cmdk for the search, vaul for the peek.',
      },
      {
        kind: 'X · one-liner',
        hook: 'interrupt less. that is the through-line across cmdk and vaul.',
        body:
          'interrupt less. that is the through-line across cmdk and vaul.\n\na command palette is a search overlay you can dismiss with escape. a drawer is a shelf that lets you still see the list you came from. both are less disruptive than the modal alternative, and both are one-line installs.',
      },
    ],
    source: {
      label: "Vault note: Paco Coursey's transitions ship the drawer over the modal",
      url: 'https://paco.me',
    },
  },
  {
    id: 'de-pr-anthropic-design',
    phase: 'Design engineering',
    part: 'Practice',
    index: 'DE.PR.05',
    title: "Anthropic's design engineering role centers on model behavior as a design surface",
    oneLiner:
      'At Anthropic, a refusal, a citation, and a tool call announcing itself are all UI, shaped by system prompt and RLHF rather than CSS.',
    readTime: '~10 min read',
    diagram: '/lessons/de/de-pr-anthropic-design.png',
    diagramCaption:
      'Model behavior joins pixels and components as a design surface: refusals, citations, tool calls.',
    whyItMatters:
      "An AI product's most important design surface is not the composer or the sidebar. It is how the model responds to a poorly formed question, how it refuses, how it cites, how it recovers from an error. Anthropic's public writing treats that behavior as a design material the same way color is. For a design engineer building AI products at Armoriq or Ivish, the reframe is load-bearing: you do not design around the model, you design the model's behavior.",
    learningObjectives: [
      'Explain why a refusal, a citation, and a tool-call preview count as UI even though none of them is styled with CSS.',
      'Trace a single product decision, such as adding citations, across its CSS, system-prompt, tool-schema, and refusal-copy surfaces.',
      'Compare reading a model transcript for unhandled outputs to reviewing a Figma frame for an unhandled empty state.',
      'Apply "write system prompts as microcopy" to a real prompt: version it, review it, and justify one clause in a sentence.',
      "Identify where in your own AI product the model-behavior surface is currently undesigned, nobody owns the refusal tone, the citation format, or the tool-call copy.",
    ],
    sections: [
      {
        heading: 'The public page names the discipline',
        body: 'Anthropic\'s design page at anthropic.com/design is short, and its brevity is the point: it states plainly that the design team is small, that its designers ship code, and that interface and model behavior are treated as two halves of one product rather than separate disciplines owned by separate teams. The writing returns to the same idea from several angles: prompt design described as microcopy, refusal tone described the way a brand voice guide describes copy, tool-use flows described as interaction design rather than backend plumbing. A concrete case study backs the claim up: an internal skill of roughly 400 tokens, documented in Anthropic\'s "Improving frontend design through Skills" post, exists specifically to steer Claude away from its own default look, an Inter-font, purple-gradient convergence, by tuning typography, motion, and background choices the same way a design system would.',
      },
      {
        heading: 'Model behavior is a design surface',
        body: 'A refusal is a UI. A citation is a UI. A tool call announcing itself before it runs is a UI. None of the three is shaped by CSS; all three are shaped by the system prompt, the tool schema, and the reinforcement learning that tunes the model\'s tone. A design engineer working this way writes system prompts with the same care another team gives a button label, and evaluates the result by reading transcripts the way a designer inspects a Figma frame, looking for the equivalent of a missed empty state. The transferable claim is specific: "designing the model\'s voice" is a real, ownable job, and it belongs on the same desk as the person designing the interface, not handed off to a separate prompt engineer who never sees the CSS.',
      },
      {
        heading: 'Claude.ai is the artifact',
        body: 'The clearest study of this discipline in practice is Claude.ai itself. Streaming behavior, how a response appears token by token rather than all at once, the artifacts panel, tool-use previews, citation formatting, and the composer\'s keyboard model are each a design decision that exists specifically because the same person shaping the CSS is also shaping the prompt behind it. Set this against earlier LLM interfaces, which largely treated the model as an opaque box behind a chat window and designed only the frame around it. Claude.ai instead treats the model as a component with tunable behavior, and the interface exposes exactly enough of that tuning, a citation marker here, a tool-call label there, to keep the user oriented without exposing the machinery underneath. Anthropic Labs later shipped Claude Design, a visual design tool built on the same premise, treating a design system import as a model-behavior input, not just a styling reference.',
      },
      {
        heading: 'Reading a transcript like a Figma frame',
        body: 'The concrete version of "read transcripts as UI" looks like this: pull a sample of real transcripts, thirty to fifty is enough to start, and go through them the way you would review a batch of screens, flagging every response that does something unhandled. An answer that invents a citation format nobody specified. A refusal that reads harsher than the brand voice elsewhere in the product. A tool call that runs silently when the interface promised a preview. Each flagged instance is logged the same way a missed empty state gets logged in a design review, as a specific, fixable gap rather than a vague complaint about "the model." The output of this exercise is usually a short list of system-prompt clauses to add or reword, not a request to retrain anything.',
      },
      {
        heading: 'System prompts have versions too',
        body: 'Treating a system prompt as microcopy means giving it the same process microcopy already gets: a version, a diff, and a reviewer. A prompt change should sit in the same pull request as the UI change that depends on it, so a reviewer can read "we now cite factual claims with a footnote" alongside both the CSS for the footnote and the prompt clause instructing the model to produce one. Without that discipline, prompt changes drift the same way design used to drift before component libraries: someone edits a live prompt in a config panel, nobody reviews the wording, and six months later nobody can say which clause caused which behavior. The fix looks exactly like the fix for design drift: put the prompt in version control and review it like any other diff.',
      },
      {
        heading: 'Where this differs from a normal design surface',
        body: 'The honest complication is that model behavior is not deterministic the way a CSS rule is. The same prompt and the same user question can produce two differently worded refusals on two different runs, so "does this system prompt work" cannot be answered by looking at one transcript, the way a single screenshot can confirm a button\'s color. It has to be answered by sampling, by reading a batch of runs and asking what fraction land inside an acceptable range of tone and accuracy. That statistical framing is unfamiliar to most product designers, whose usual review unit is one screen in one state. Anthropic\'s practice imports a testing mindset, sample sizes, pass rates, into what still reads, on the surface, like a copywriting decision.',
      },
      {
        heading: 'What a designer can steal from the approach',
        body: 'Two habits port directly, regardless of company size. First, read transcripts as UI: every unhandled model output is a bug in exactly the sense an unhandled empty state is a bug, and it belongs in the same tracker. Second, write system prompts as microcopy: version them, review them in pull requests, and ship them alongside the interface change that depends on them, rather than editing them live in a separate admin panel nobody reviews. Both habits require a design engineer willing to open the prompt file, not just the component file, which is exactly the boundary Anthropic\'s practice describes as no longer optional. At Armoriq or Ivish, doing this turns agent-behavior work from "an engineering ticket" into a design decision with a design reviewer.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-pr-anthropic-behavior-surfaces.svg',
        alt: 'One product decision spans four surfaces',
        caption: 'Adding a citation footnote is a CSS change, a system-prompt change, a tool-schema change, and a refusal-copy change, shipped in one PR.',
        diagramBrief:
          'A central box labeled "Ship: citation footnote" with four arrows branching out to four smaller boxes: "CSS: superscript + hover popover", "System prompt: cite each factual span", "Tool schema: retrieval returns chunk id + range", "Refusal copy: say so when ungrounded". Style: cream paper, black ink, one accent color tying all four boxes back to a single "one PR" label at the bottom.',
      },
      {
        src: '/lessons/de/de-pr-anthropic-transcript-review.svg',
        alt: 'Reviewing transcripts like design QA',
        caption: 'A transcript review reads a sample of runs for unhandled outputs, the same way a design QA pass reads screens for unhandled empty states.',
        diagramBrief:
          'Side-by-side comparison, left column headed "Design QA": a stack of screen thumbnails, one highlighted with a flag icon labeled "unhandled empty state". Right column headed "Transcript review": a stack of chat-bubble transcript thumbnails, one highlighted with a flag icon labeled "unhandled refusal". A center label reads "same review pattern, different artifact". Style: cream paper, black ink, one accent color on the flag icons.',
      },
    ],
    takeaways: [
      'Model behavior is a design surface; treat refusals and citations as UI decisions.',
      "Anthropic's design page is short, specific, and worth rereading.",
      'Claude.ai is the artifact; study it to see the discipline shipped.',
      'Read transcripts and write system prompts the way you review Figma and write button labels.',
    ],
    terms: [
      { term: 'Model behavior', gloss: '"how the model acts"', meaning: 'How a model responds, refuses, cites sources, and recovers from errors; treated as a design surface rather than a purely technical output.' },
      { term: 'System prompt', gloss: '"instructions behind the scenes"', meaning: "The always-on instructions shaping a model's tone and behavior for every request, treated with the same review process as user-facing microcopy." },
      { term: 'Refusal UI', gloss: '"when it says no"', meaning: 'The visible shape (wording, tone, length) of a model declining a request, which reads to the user as an interface decision even though it originates in the prompt and training.' },
      { term: 'Tool call preview', gloss: '"the \'using X\' indicator"', meaning: 'An interface element showing which tool the model is about to invoke, before it runs, so the user is not surprised by an action taken on their behalf.' },
      { term: 'Citation UI', gloss: '"the footnote"', meaning: 'The visible mechanism by which a grounded answer points back at the specific source span it drew from.' },
      { term: 'RLHF', gloss: '"training with human feedback"', meaning: "Reinforcement learning from human feedback, the training method that shapes a model's default tone, verbosity, and refusal style." },
      { term: 'Transcript review', gloss: "\"checking a chat log\"", meaning: 'Reading a sample of real model conversations to flag unhandled or undesired outputs, the model-behavior equivalent of a design QA pass.' },
      { term: 'Non-determinism', gloss: "\"it's not always the same\"", meaning: 'The property that the same input can produce different outputs across runs, which changes what "this prompt works" can mean from a single check to a sampled pass rate.' },
      { term: 'Prompt versioning', gloss: '"tracking prompt changes"', meaning: 'Keeping a system prompt in version control and reviewed like code, rather than edited live in an unreviewed admin panel.' },
      { term: 'Streaming', gloss: '"text appearing gradually"', meaning: "Displaying a model's response token by token as it generates, rather than waiting for the full answer, itself a UI decision about perceived latency." },
    ],
    exercises: [
      { level: 'easy', prompt: 'Read five real transcripts from your own AI product. Flag any response that does something unhandled (invents a format, contradicts the brand voice, runs a tool silently). List them.' },
      { level: 'medium', prompt: 'Pick one feature in your product (citations, refusals, or tool-call previews). Trace it across its CSS, its system-prompt clause, and its tool schema. Are all three owned by the same person?' },
      { level: 'medium', prompt: "Explain in two sentences why 'does this system prompt work' cannot be answered from a single transcript. What sample size would you actually need to feel confident?" },
      { level: 'hard', prompt: 'Draft a one-paragraph system-prompt clause instructing a model to cite factual claims with a numbered footnote tied to a retrieved source. Then write the matching refusal clause for what the model should say when it cannot find a source.' },
      { level: 'design', prompt: "Sketch the review process for a system-prompt change at your own company: who reviews it, where it lives (a PR? a config panel?), and what the reviewer checks before approving. Name one gap in your current process against Anthropic's model." },
    ],
    furtherReading: [
      { label: 'Anthropic, Design at Anthropic', url: 'https://www.anthropic.com/design', why: 'The primary source for this entire lesson; short enough to reread every six months as your own framing shifts.' },
      { label: 'Claude.ai', url: 'https://claude.ai', why: 'Open a chat with a tool call and watch the tool-call preview and citation UI in situ, the artifact this lesson studies.' },
      { label: 'Anthropic news and engineering writing', url: 'https://www.anthropic.com/news', why: 'Where posts like "Improving frontend design through Skills" surface, going deeper on model behavior as a tunable design surface.' },
      { label: 'Anthropic careers', url: 'https://www.anthropic.com/jobs', why: "Search 'design engineer' for the current role definition, useful for seeing how the discipline is described to hires today." },
    ],
    shipIt: {
      kind: 'prompt',
      name: 'Transcript review prompt',
      body: "Paste 10-30 real transcripts from your product into this prompt to get a first-pass audit:\n\n'Read these conversation transcripts. For each one, flag any model response that: (1) invents a format or convention not specified anywhere in the system prompt, (2) uses a tone that contradicts our brand voice [paste 2-3 sentences of your voice guide], (3) takes a tool action without a preceding preview or explanation, or (4) refuses in a way that is harsher or vaguer than necessary. For each flagged instance, quote the exact line and suggest one specific system-prompt clause that would fix it.'",
    },
    demoCaption:
      'A Claude.ai product decision (the citation footnote) hides the model-behavior work behind it. Reveal what the "design change" actually shipped.',
    demo: {
      archetype: 'reveal',
      subject: 'Citation UI, one product decision',
      opaqueLabel: 'Ship: "add a citation footnote to every grounded answer"',
      revealedLines: [
        'CSS: superscript number, hover pops a source snippet',
        'System prompt: "cite each factual span with [n] tied to a retrieved chunk"',
        'Tool schema: retrieval tool must return chunk id and range',
        'Refusal copy: reworded so ungrounded answers say so explicitly',
        'Transcript review: 50 sampled answers, 6 unhandled outputs found',
        'PR includes CSS diff, prompt diff, schema diff, all in one commit',
      ],
      badCaption:
        '"Add a citation footnote" reads like a pure UI change and hides the four other surfaces that had to move for it to be honest. Ship only the CSS and the model happily invents footnotes.',
      goodCaption:
        'The design change is a system-prompt change is a tool-schema change is a refusal-copy change. Same person, same PR. Anthropic\'s claim is that this is the discipline, not the outlier.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'a refusal is a UI. a citation is a UI. a tool call announcing itself is a UI.',
        body:
          'a refusal is a UI. a citation is a UI. a tool call announcing itself is a UI.\n\nnone of them are shaped by CSS. they are shaped by system prompt, tool schema, and RLHF.\n\nanthropic\'s design engineering discipline is that the person writing the CSS is the same person writing the prompt. one product, one voice.',
      },
      {
        kind: 'X · design angle',
        hook: "you do not design around the model. you design the model's behavior.",
        body:
          "you do not design around the model. you design the model's behavior.\n\nread transcripts the way you inspect a figma frame. every unhandled output is a bug the way an unhandled empty state is a bug.\n\nwrite system prompts the way you write button labels. version them, PR them, ship them next to the CSS change that depends on them.",
      },
      {
        kind: 'X · one-liner',
        hook: 'claude.ai is the artifact. study it to see the discipline shipped.',
        body:
          'claude.ai is the artifact. study it to see the discipline shipped.\n\nstreaming, artifacts panel, tool previews, citations, composer keyboard model. each exists because the same person is shaping the CSS and the prompt. earlier LLM UIs treated the model as a black box; this one treats it as a component you tune.',
      },
    ],
    source: {
      label: "Vault note: Anthropic's design engineering role centers on model behavior as a design surface",
      url: 'https://www.anthropic.com/design',
    },
  },
  {
    id: 'de-pr-token-theory',
    phase: 'Design engineering',
    part: 'Practice',
    index: 'DE.PR.06',
    title: 'Tokens matter more than pixels: Comeau, Curtis, and Hupé on the token maturity model',
    oneLiner:
      'Design tokens ladder from primitive to semantic to component, and most systems stall at semantic because nobody owns governance, the missing fourth rung.',
    readTime: '~10 min read',
    diagram: '/lessons/de/de-pr-token-theory.png',
    diagramCaption:
      'Three tiers plus governance: primitive, semantic, component, and the process that keeps naming honest.',
    whyItMatters:
      "Every design system I have watched fail did it at the token layer. Someone shipped --blue-500 as the button color, then a year later needed a warning button, a themed variant, a customer white-label, and each request cost a sprint because the token layer had no semantics. Comeau, Curtis, and Hupé have all written about the same three-tier ladder that fixes this, and it is the difference between a token file and a design system. If Armoriq's tokens are going to survive white-labeling, this ladder is the map.",
    learningObjectives: [
      'Define each of the three token tiers (primitive, semantic, component) and give a real example name for each.',
      'Explain why a component should read only from the semantic tier, and what breaks specifically when it bypasses it to read a primitive directly.',
      'Trace the two-hop alias chain (button-bg to color-action-primary to blue-500) and state what a single edit at each hop affects.',
      "Compare the token maturity model's five levels (L0-L4) and diagnose which level your own system is stuck at.",
      "Apply Amy Hupé's governance argument to a real naming decision: who should own the meaning of a semantic token in your org.",
    ],
    sections: [
      {
        heading: 'Nathan Curtis defined the vocabulary',
        body: "Nathan Curtis, working through his firm EightShapes, has published on design tokens since around 2016, and his three-tier taxonomy is the closest thing the industry has to a shared standard. Tier one is the primitive layer: raw, intent-free values like blue-500 or space-8, numbers with no opinion about what they are for. Tier two is the semantic layer: names that describe purpose instead of value, color-action-primary, spacing-inset-md, the layer a component should actually read from. Tier three is the component layer: tokens scoped to one component's contract, button-primary-background, which exist when a component needs an override the semantic layer does not generalize to. Curtis has since moved past the tiering question itself, writing in 2025 about treating whole components as structured data, a further step in the same direction: name the thing, do not leave it implicit.",
      },
      {
        heading: 'Josh Comeau makes the ladder practical',
        body: "Josh Comeau's writing and course turn Curtis's taxonomy into working CSS, which is where most teams actually get stuck. He teaches tokens through CSS custom properties, theme-scoped overrides, and a clear discipline about which tier to reach for in which situation. His posts on color systems and dark mode make the case concretely: component code should read only from tier two, never tier one directly. Rendered as CSS, the ladder looks like --button-bg: var(--color-action-primary) sitting above --color-action-primary: var(--blue-500), a two-hop dereference. His more recent CSS work extends the same instinct into motion tokens: pairing @supports with the newer linear() easing function so a spring-based custom property degrades gracefully to a simple ease on browsers that do not support it yet, rather than breaking outright.",
      },
      {
        heading: 'What happens when a component bypasses the alias chain',
        body: 'The concrete failure mode is common enough to have a shape: a developer, in a hurry, writes background: var(--blue-500) directly on a button instead of going through --color-action-primary. The button works today. Six months later, someone renames the brand\'s primary action color from blue to a different hue at the semantic tier, updates --color-action-primary, and every other button retheme correctly, except this one, which is still silently reading a primitive that has not moved. The bug is invisible in code review, the primitive still exists, it is not a typo, and only shows up visually, one component out of sync with the rest of the product. This is the specific, mechanical reason "components must read only from tier two" is a rule worth enforcing with a linter, not just a style guide sentence.',
      },
      {
        heading: 'Amy Hupé argues for governance, not just structure',
        body: "Amy Hupé's writing at amyhupe.co.uk pushes on the part Curtis and Comeau largely leave implicit: governance. A token system without an owning team, a documented naming convention, and an actual review process is a token system that will fork within a year, because nothing stops two different teams from independently inventing color-brand-primary and color-primary-brand for the same value. Her work on the GOV.UK Design System carries the same argument into practice: the design principles were updated in 2025 to add a sustainability principle, a governance decision as much as a design one, requiring someone with the authority to say a new principle belongs. Someone has to own what color-action-primary means and has final say when a new request seems to almost, but not quite, fit an existing token. If nobody holds that role, everyone quietly renames things to fit their own assumption instead.",
      },
      {
        heading: 'The W3C spec is standardizing the file format',
        body: "Separate from the naming taxonomy, the Design Tokens Community Group's W3C specification, published at designtokens.org, solves a narrower, more mechanical problem: what a token file itself should look like as a portable format, so that Figma, a code-based token pipeline, and a third-party tool can all read the same source of truth instead of each team hand-writing a bespoke converter. The spec reached its first stable release, version 2025.10, in October 2025, with more than ten tools, including Figma, Style Dictionary, and Tokens Studio, implementing it, and it adds theming support, OKLCH and Display P3 color, and composite types like border, shadow, and transition. It does not solve naming or governance, Curtis and Hupé's territory, but it solves the adjacent problem of a token file being locked into one tool's proprietary export format.",
      },
      {
        heading: 'White-label is the test that finds the missing rung',
        body: "The token maturity model is easiest to see through a single stress test: ask a system to support a customer white-label, a second brand skinned on the same product. A system stuck at level one, primitives only, fails immediately, because every component hardcodes a specific primitive and a rebrand means touching every file. A system at level two, semantic tokens exist, can retheme colors globally but usually still breaks on components that need brand-specific spacing or radius overrides, because those live at a level the system has not built yet. A system at level three, component-scoped tokens, properly aliased, handles the white-label cleanly: swap the theme, every component-level token resolves through the alias chain to the new brand's values, and no component file changes. White-label is not a special feature request; it is a maturity-level diagnostic that happens to also be a sellable feature.",
      },
      {
        heading: 'The token maturity model in one paragraph',
        body: 'Read Curtis, Comeau, and Hupé together and a five-level maturity model emerges. Level zero is hardcoded values scattered through components, no token file at all. Level one is a token file of primitives, named but with no semantics. Level two adds a semantic layer that components are supposed to read from. Level three scopes tokens per component and per theme, the level that survives a white-label. Level four adds governance: an owning team, a naming convention, a deprecation process, and human review before a new token is added. Most teams reach level two and stop there, mistaking "we have named tokens" for "we have a token system." Level three is where theming and platform expansion stop being rewrites. Level four is where the system stops slowly rotting back toward level zero as ad hoc exceptions accumulate.',
      },
      {
        heading: 'Where governance actually lives day to day',
        body: "Governance sounds abstract until it is described as a job someone actually does on a normal week. It looks like a named owner, a person or a small design-systems team, who reviews every pull request that adds or renames a token, the same way a codebase has a reviewer for schema changes. It looks like a documented process for deprecating a token: mark it deprecated, keep it working for one release cycle, remove it in the next, rather than deleting it the moment a replacement exists. It looks like a changelog anyone can read before assuming a token's meaning has stayed stable. None of this requires a large team; it requires one person with the authority to say no to a token that almost, but does not quite, fit an existing name, which is the exact authority Hupé's writing argues most systems never assign to anyone.",
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-pr-token-ladder.svg',
        alt: 'The three-tier token ladder',
        caption: 'A component should read from the semantic tier; primitive and component tiers sit on either side of it.',
        diagramBrief:
          'A vertical three-rung ladder diagram. Bottom rung labeled "Primitive: blue-500" with a raw color swatch. Middle rung labeled "Semantic: color-action-primary" with an arrow pointing down to the primitive rung (alias). Top rung labeled "Component: button-primary-bg" with an arrow pointing down to the semantic rung (alias). A component icon (a button) sits next to the top rung with an arrow pointing to the semantic rung directly, labeled "reads from here, not the primitive". Style: cream paper, black ink, one accent color highlighting the semantic rung.',
      },
      {
        src: '/lessons/de/de-pr-token-bypass-bug.svg',
        alt: 'The alias-bypass bug',
        caption: 'A component that reads a primitive directly stays visually out of sync when the semantic token is retargeted to a new brand color.',
        diagramBrief:
          'Before and after pair. "Before": three button icons all labeled reading from color-action-primary (blue). "Rename event": color-action-primary retargeted from blue-500 to green-500, shown with an arrow. "After": two buttons now show green (correctly following the alias), one button still shows blue with a warning glyph, labeled "bypassed the alias, reads blue-500 directly". Style: cream paper, black ink, one accent color on the warning glyph and the out-of-sync button.',
      },
      {
        src: '/lessons/de/de-pr-token-maturity-levels.svg',
        alt: 'The five-level token maturity model',
        caption: 'Most teams reach L2 and stall; white-label breaks at L3, and governance is the rung almost nobody builds.',
        diagramBrief:
          'A five-step staircase diagram ascending left to right, steps labeled L0 Hardcoded, L1 Primitives, L2 Semantic, L3 Component-scoped, L4 Governed. A dotted horizontal line crosses just above L2 labeled "most teams stall here". A small flag at L3 labeled "white-label survives from here". A small flag at L4 labeled "governance lives here". Style: cream paper, black ink, one accent color on the two flags and the stall line.',
      },
    ],
    takeaways: [
      'Tokens ladder from primitive to semantic to component; a component should read from tier two.',
      'White-label and theming only work when tier two exists and components never bypass it.',
      'Governance is the level most token systems skip; without it the naming rots.',
      'Read Curtis for taxonomy, Comeau for the CSS, Hupé for the politics.',
    ],
    terms: [
      { term: 'Primitive token', gloss: '"the raw value"', meaning: 'A tier-one, intent-free value like blue-500 or space-8, with no opinion about what it is used for.' },
      { term: 'Semantic token', gloss: '"the named-by-purpose value"', meaning: 'A tier-two value named for intent, like color-action-primary, the layer components should actually read from.' },
      { term: 'Component token', gloss: '"the component-specific value"', meaning: "A tier-three value scoped to one component's contract, like button-primary-background, used when the semantic layer does not generalize." },
      { term: 'Alias', gloss: '"a token pointing at another token"', meaning: 'A token whose value is a reference to another token rather than a raw value, the mechanism that makes a single-point rename possible.' },
      { term: 'Theme scope', gloss: '"the brand or mode override"', meaning: 'A CSS or config scope that overrides semantic-tier tokens for a specific mode (dark, light) or brand (white-label), without touching component code.' },
      { term: 'Governance', gloss: "\"who's in charge of naming\"", meaning: 'The ownership, review, and deprecation process around a token system, without which naming conventions fork within roughly a year.' },
      { term: 'DTCG format', gloss: '"the token file standard"', meaning: "The W3C Design Tokens Community Group's specification for a portable JSON token file format, letting design tools and code pipelines share one source." },
      { term: 'Style Dictionary', gloss: '"a token build tool"', meaning: 'A widely used open-source tool that transforms a token source file into platform-specific outputs such as CSS, iOS, or Android.' },
      { term: 'Token maturity model', gloss: '"how developed the token system is"', meaning: 'A five-level scale, L0 hardcoded through L4 governed, describing how far a design-token system has progressed past simply naming values.' },
      { term: 'Deprecation process', gloss: '"retiring an old token"', meaning: 'A documented cycle, mark deprecated, keep working one release, then remove, for retiring a token without silently breaking whoever still references it.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Classify these three token names by tier: gray-200, color-border-subtle, card-border-color. Which tier should a component actually read from?' },
      { level: 'medium', prompt: 'Find one place in your own codebase where a component reads a primitive value directly (a raw hex or a primitive variable) instead of a semantic token. Rewrite it to go through the semantic layer.' },
      { level: 'medium', prompt: 'Your product needs to support a white-label for one enterprise customer. Diagnose which maturity level (L0-L4) your current token system sits at, using the white-label test described in this lesson.' },
      { level: 'hard', prompt: 'Design the deprecation process for renaming color-action-primary to color-action-default across a codebase with 40 components. Write the actual steps, including what happens to code that still references the old name.' },
      { level: 'design', prompt: "Sketch the review checklist a token-system owner should run before approving a new semantic token request. What makes a request 'this should reuse an existing token' versus 'this genuinely needs a new one'?" },
    ],
    furtherReading: [
      { label: 'Nathan Curtis, writing on design tokens', url: 'https://medium.com/@nathanacurtis', why: "The original taxonomy; read the 'Naming Tokens in Design Systems' piece first, then his newer 'Components as Data' writing." },
      { label: 'Josh Comeau, on color and CSS custom properties', url: 'https://www.joshwcomeau.com/css/color-formats/', why: 'Turns the taxonomy into working CSS, with a concrete section on theming through custom properties.' },
      { label: 'Amy Hupé, writing', url: 'https://amyhupe.co.uk/writing', why: 'Filter for design-system posts; her governance argument is the rung most token guides skip entirely.' },
      { label: 'Design Tokens Community Group, W3C spec', url: 'https://www.designtokens.org', why: 'The format standard, now at a stable 2025.10 release, useful once you are past naming and into choosing tooling that will not lock you in.' },
      { label: 'Style Dictionary', url: 'https://styledictionary.com', why: 'The most widely used build tool for turning a token source file into platform-specific outputs; worth knowing even if you do not adopt it.' },
    ],
    shipIt: {
      kind: 'rubric',
      name: 'Token maturity self-assessment',
      body: "Score your own system against these five statements, then read the level below where you first said 'no':\n- L0 to L1: Do you have a token file at all, even just primitives?\n- L1 to L2: Do you have semantic tokens (named by purpose) that most components read from?\n- L2 to L3: Do your components read only from semantic tokens, never bypassing to a primitive?\n- L3 to L4: Could you white-label your product today by swapping a theme file, with zero component changes?\n- L4: Does a named owner review every new or renamed token, with a documented deprecation process for retiring old ones?\nWhichever question you first answered 'no' to is the level your system actually stalled at, regardless of how many tokens you have shipped.",
    },
    demoCaption:
      'A design system headline ("340 tokens shipped") hides the maturity level underneath. See where on the five-level ladder the library actually sits.',
    demo: {
      archetype: 'meter',
      subject: 'Token maturity, one library',
      headline: '"340 design tokens shipped"',
      breakdown: [
        { label: 'L0: hardcoded values still in components', value: 42 },
        { label: 'L1: primitives (blue-500, space-8)', value: 88 },
        { label: 'L2: semantic (color-action-primary)', value: 62 },
        { label: 'L3: component-scoped (button-primary-bg)', value: 28 },
        { label: 'L4: governed (named owner, deprecation, review)', value: 8 },
      ],
      badCaption:
        'A single count of tokens says nothing about what a component reads from or whether the naming will survive a re-theme. "340 tokens" is the vanity metric.',
      goodCaption:
        'Read the ladder together with the count. Most teams stall at L2, which is why white-label and theming become rewrites at L3. L4 is where the tokens stop rotting, and it is almost always the missing level.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'design tokens ladder through three tiers, and skipping the middle one is why systems fork.',
        body:
          'design tokens ladder through three tiers, and skipping the middle one is why systems fork.\n\nprimitive (blue-500) -> semantic (color-action-primary) -> component (button-primary-bg).\n\ncomponents read only from tier two. change tier two once, retheme the whole app. bypass it and every "white-label request" is a sprint.',
      },
      {
        kind: 'X · design angle',
        hook: 'a token count is a vanity metric. the maturity level is the number that matters.',
        body:
          'a token count is a vanity metric. the maturity level is the number that matters.\n\nL0 hardcoded, L1 primitives, L2 semantics, L3 component-scoped, L4 governed. most systems stall at L2. white-label breaks at L3. the tokens rot at L4.\n\nnobody talks about L4 because it is not a taxonomy problem, it is an ownership problem.',
      },
      {
        kind: 'X · one-liner',
        hook: 'read curtis for the taxonomy, comeau for the CSS, hupé for the politics.',
        body:
          'read curtis for the taxonomy, comeau for the CSS, hupé for the politics.\n\nthree writers, one ladder, and the shortest path to a token system that survives a re-theme. every mature design system in the wild follows the same rungs. yours will too, or it will fork.',
      },
    ],
    source: {
      label: 'Vault note: Tokens matter more than pixels, Comeau Curtis and Hupé on the token maturity model',
      url: 'https://eightshapes.com',
    },
  },
];
