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
      'Linear ships the pull request, not the mockup, and it does that by hiring designers who commit to the same repo as the engineers.',
    readTime: '~5 min read',
    diagram: '/lessons/de/de-pr-linear.png',
    diagramCaption:
      'One artifact, one truth: the PR carries the design, the Figma file is a sketchpad.',
    whyItMatters:
      'Every design team I have watched fracture has done it the same way. The designer owns a Figma file, the engineer owns the branch, and truth splits into two artifacts that drift after the first review. Linear\'s model collapses that. A designer at Linear opens a PR, and the reviewer reads a diff, not a callout on a frame. That maps directly to how I already work at Armoriq and Ivish, where the token change and the component change are the same commit. Reading Karri Saarinen\'s writing on the practice is the fastest way to stop treating "design engineer" as a title and start treating it as a workflow.',
    sections: [
      {
        heading: 'The team is small on purpose',
        body: 'Linear kept the design team under ten people for years while shipping a product that competes with Jira. Karri Saarinen has been explicit that the small size is a feature: fewer designers means fewer handoffs, and every remaining designer must code, ship, and own outcomes. When a designer cannot write the CSS, the engineer inherits the taste decision by default, and taste decisions made under time pressure default to "match what exists." A small team of designer-engineers keeps the taste bar in the artifact everyone ships from.',
      },
      {
        heading: 'One artifact, one truth',
        body: 'The single artifact is the codebase. Figma exists at Linear but as a sketchpad, not a spec. There is no red-line handoff. Karri has written that the moment a design lives in a mockup, the mockup starts lying about what shipped. The alternative is that the designer opens the PR, the engineer reviews the interaction and the code together, and the merged branch is the design document. This is only possible because the design system is a set of React components with tight variant grammar, so a design change is a component change and vice versa.',
      },
      {
        heading: 'The rituals reinforce the artifact',
        body: 'Linear\'s Monday demos show shipped work, not comps. Design reviews happen in-app on a deployed preview URL, not in a Figma file. Weekly writing (the Linear Method, the blog, Karri\'s essays) treats writing as the same craft as design: a shared artifact anyone can edit. The rituals are cheap on their own; what they do together is stop the team from measuring itself by throughput of files. The metric that survives is "does the product feel like Linear this week," which only exists in the deployed build.',
      },
      {
        heading: 'Lessons a designer can steal without joining Linear',
        body: 'Two things port. First, treat the component library as the design file. Every design decision that is not a component change is a decision without a home; either promote it into a component or discard it. Second, run design reviews on preview URLs and PR diffs, never on Figma frames. Both changes are free and both immediately expose which decisions were vibes and which were structural. Small teams and taste hiring take longer to copy, but the artifact discipline is available on day one.',
      },
    ],
    takeaways: [
      'The design artifact is the PR, not the Figma file; anything the PR does not carry is not shipped.',
      'A design engineering team stays small on purpose so no decision hides behind a handoff.',
      'Preview URLs and component diffs beat red-line reviews as the surface for critique.',
      "Karri Saarinen's public writing is the primary source; treat it as the manual.",
    ],
    terms: [
      { term: 'Design engineer', meaning: 'A designer who ships production code, not just specs.' },
      { term: 'PR review', meaning: 'Reviewing a design as a code diff on a deployed preview.' },
      { term: 'Component library', meaning: "The codebase's canonical set of UI primitives that a design decision must fit into." },
      { term: 'Handoff', meaning: 'The moment design intent transfers from designer to engineer; the artifact usually dies here.' },
      { term: 'The Linear Method', meaning: "Linear's public writing on how the team operates." },
      { term: 'Preview URL', meaning: 'An ephemeral deployment of a branch used for review.' },
    ],
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
      'Geist treats duration, easing, and elevation as first-class tokens, so the whole product moves at the same pace and design engineers can prove it in code.',
    readTime: '~5 min read',
    diagram: '/lessons/de/de-pr-vercel-geist.png',
    diagramCaption:
      'Motion in the token layer, next to color and spacing, not sprinkled into component code.',
    whyItMatters:
      "Most design systems stop at color and spacing. Motion, if it exists at all, sits in a designer's head and gets reinvented per component. That is why so much modern SaaS UI moves in ten different rhythms. Vercel's Geist ships motion as tokens the same way it ships color, and Rauno Freiberg, the design engineer most publicly associated with it, has written about why. Copying that discipline is the cheapest way to make a product feel considered without hiring a motion designer.",
    sections: [
      {
        heading: 'Geist is a token layer plus a component library',
        body: 'Geist ships two things: a set of design tokens (color, radius, spacing, type, motion, elevation) and a component library that binds to them. The tokens are OKLCH-based and vary by theme; motion tokens name durations like `duration-fast` and easing curves like `ease-out-quart`, so any component\'s transition reads from the same shelf. The component library is public at geist.vercel.app. Reading the token file alone is worth an hour: it is a taxonomy of every decision Vercel refuses to make twice.',
      },
      {
        heading: "Rauno's public work is the practice manual",
        body: 'Rauno Freiberg\'s personal site at rauno.me is a living case study of design engineering. Every page demonstrates something concrete: physical drag interactions, elastic overshoot on a hover, a scroll-linked animation that respects reduced-motion. He writes short posts on why a particular curve, why a particular delay, why a particular hit target. The tone is technical without being coy. If Karri Saarinen is the culture writer, Rauno is the practice writer. Read him when the question is "how, specifically, does this feel expensive."',
      },
      {
        heading: 'The role at Vercel is designer plus shipper',
        body: "Vercel's public design engineering job description is unusually direct. It asks for someone who ships React and CSS to production, cares about tokens and accessibility, has taste in motion, and can hold a design decision to the level of a component API decision. There is no separate \"handoff to engineering\" step. The role exists because a design system without a design engineer becomes a museum: components exist but nobody uses them, because using them costs more than reinventing them. The design engineer's job is to make the tokens the path of least resistance.",
      },
      {
        heading: 'Motion as a token is the transferable idea',
        body: 'The reason motion belongs in the token layer is the same reason color does. Every duration, easing, and spring stiffness value used more than once must be named, or the product will drift. Once named, a change to `duration-medium` propagates across every drawer, sheet, and tooltip in the app in one commit. That is the specific superpower Vercel demonstrates. In Framer Motion or CSS custom properties, this is a fifty line change. In a system without motion tokens, it is a two week audit. Ship the tokens first.',
      },
    ],
    takeaways: [
      'Motion belongs in the token layer next to color and spacing, not in component code.',
      'Geist is public; read the tokens before writing your own.',
      "Rauno's personal site is a practice log a design engineer can copy verbatim.",
      "A design engineer's real job is making the tokens the path of least resistance.",
    ],
    terms: [
      { term: 'Geist', meaning: "Vercel's public design system, tokens plus React components." },
      { term: 'Motion token', meaning: 'A named duration, easing, or spring stiffness value in a design system.' },
      { term: 'Design engineer', meaning: 'A hybrid role that ships production code as part of the design decision.' },
      { term: 'OKLCH', meaning: 'Perceptually uniform color model Geist uses for tokens.' },
      { term: 'Easing curve', meaning: 'The velocity profile of an animation over time.' },
      { term: 'Elevation token', meaning: 'A named shadow value that expresses z-axis layering.' },
    ],
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
      'Emil Kowalski built Sonner, Vaul, and a motion course, and the through-line is that easing curves and durations are grammar, not decoration.',
    readTime: '~5 min read',
    diagram: '/lessons/de/de-pr-emil-kowalski.png',
    diagramCaption:
      'Easing as vocabulary: ease-out arrives, ease-in departs, spring says physical.',
    whyItMatters:
      "Most tutorials teach animation as a checklist: pick a duration, pick an easing, ship. Emil's writing and his motion course teach it as a language with rules. A drawer closes with a different curve than a toast dismisses because the two are saying different things. Once you have that framing, choosing motion values stops being taste and starts being intent. I use his libraries every week; watching how he documents them is a masterclass in showing design intent through code.",
    sections: [
      {
        heading: 'Sonner and Vaul are motion arguments in code',
        body: "Sonner is Emil's toast library. Vaul is his drawer for React. Both are open source, both are tiny, both are used across the modern web (Vercel, Linear, most Next.js starters). What is interesting is not the API but the defaults. Sonner's stack animation, Vaul's rubber-band drag past the top edge, the way Vaul's backdrop opacity is linked to drawer position and not to a timing function: each default encodes a specific belief about how the interaction should feel. Read the source, not just the docs.",
      },
      {
        heading: 'The motion course teaches curves as vocabulary',
        body: "Emil's course at motion.dev, made with the Motion team, walks through easing curves as if they were parts of speech. Ease-out is a verb of arrival. Ease-in is a verb of departure. Spring is an adjective that says \"physical.\" The course also teaches Framer Motion's layout animations and the FLIP technique. The reason it works as a design resource, not just an engineering one, is that every lesson pairs the curve with the meaning: \"this curve says the panel is heavy, this one says it is paper.\"",
      },
      {
        heading: 'Small libraries beat big frameworks for motion',
        body: "Emil's practice is a case for small, opinionated primitives. Sonner is not a notification framework. Vaul is not a modal system. Each does one thing, ships one set of defaults, and expects the user to compose. That is the opposite of Radix or shadcn/ui's kitchen-sink approach and it is why designers reach for them. A well-tuned default is worth more than a dozen configuration options for the ninety percent of teams who cannot tell you what damping ratio their spring uses.",
      },
      {
        heading: 'Study his defaults to learn intent',
        body: 'The transferable exercise is to open Vaul or Sonner in devtools and record the animation. Slow it down. Measure the duration, the easing, the delay before the backdrop fades, the stagger between stacked toasts. Then ask, for each value: what would break if I doubled it, halved it, or removed it. Doing this on ten of his components is the fastest way to build the intuition his course sells. It is also the same exercise you should do on your own components before shipping.',
      },
    ],
    takeaways: [
      'Motion is a language; every duration and curve is a word choice.',
      'Small opinionated libraries teach intent better than large configurable ones.',
      "Emil's course pairs curves with meanings, not just with names.",
      'Slow-motion recordings of good defaults are a free curriculum.',
    ],
    terms: [
      { term: 'Sonner', meaning: "Emil's React toast library." },
      { term: 'Vaul', meaning: "Emil's React drawer library, with physics-based drag." },
      { term: 'motion.dev', meaning: 'The course site Emil built with the Motion team.' },
      { term: 'Ease-out', meaning: 'Curve that starts fast and settles, reads as arrival.' },
      { term: 'Spring', meaning: 'Physics-based interpolation that reads as physical.' },
      { term: 'FLIP', meaning: 'First, Last, Invert, Play; a technique for animating layout changes.' },
    ],
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
      "Paco Coursey's public work, cmdk and Vaul with Emil, argues for one thing: prefer interruptions that keep context, and animate them like they are physical.",
    readTime: '~5 min read',
    diagram: '/lessons/de/de-pr-paco-coursey.png',
    diagramCaption:
      'A modal blows the current view apart; a drawer keeps it. Same task, different weight of interruption.',
    whyItMatters:
      'Every Armoriq surface I design has a "where does the detail go" decision. A modal blows the current view apart. A drawer keeps it. Paco Coursey has spent years shipping libraries that make the drawer option a one-line install, and they are the reason "just use a drawer" became a default in the React ecosystem. Studying his repos teaches the specific interaction choices that make a drawer feel like a first-class surface rather than a modal on its side.',
    sections: [
      {
        heading: 'cmdk normalized the command palette',
        body: 'Paco built cmdk, the headless command palette component used by Linear, Vercel, Raycast-inspired sites, and most of the modern dashboard universe. The interesting part is not the popup itself but the interaction contract: keyboard first, fuzzy search default, results grouped and ordered by intent, and animation restrained to a single fade and scale. cmdk shipped the argument that a search-first surface can replace half of a menu system. The library is at cmdk.paco.me and the source is short enough to read in an afternoon.',
      },
      {
        heading: 'Vaul argues for physical drawers',
        body: 'Vaul, co-authored with Emil Kowalski, is a React drawer with drag-to-dismiss, snap points, and a backdrop tied to drawer position. The API is small on purpose. The defaults do the work: on iOS-style drag it rubber-bands past the top, on release below a threshold it snaps back, and the whole thing respects prefers-reduced-motion. The transferable insight is that a drawer is not "a modal that slides." It is a physical object with weight and edges, and the animation is not decoration, it is the affordance.',
      },
      {
        heading: 'Personal site as a portfolio of transitions',
        body: "Paco's site at paco.me is itself a portfolio of transitions. Page changes are shared layout animations. Hover states have specific curves. The mobile menu is a drawer, of course. The site is worth opening in devtools and slowing down the animations to 4x. Every choice is legible: which element leads the transition, which lags, which fades against motion, which is layout-only. It is a working case study for a design engineer.",
      },
      {
        heading: 'The generalizable rule is "interrupt less"',
        body: 'The through-line across cmdk and Vaul is a preference for interruptions that keep context. A command palette is a search overlay you can dismiss with Escape. A drawer is a shelf that lets you still see the list you came from. Both are less disruptive than the modal alternative. When I look at an Armoriq or Ivish screen, the first question is "does this action need to steal focus." Nine times out of ten the answer is no, and Paco\'s libraries are the fastest way to ship the "no" version.',
      },
    ],
    takeaways: [
      'Prefer a drawer to a modal whenever the user still needs the underlying context.',
      'cmdk is the command palette default; use it before writing your own.',
      "Vaul's defaults are the drawer decisions you would spend a sprint on.",
      "Slow down paco.me's animations to see what a considered site looks like.",
    ],
    terms: [
      { term: 'cmdk', meaning: 'Headless React command palette library by Paco Coursey.' },
      { term: 'Vaul', meaning: 'React drawer library by Paco Coursey and Emil Kowalski.' },
      { term: 'Command palette', meaning: 'A search-first overlay that replaces menu navigation.' },
      { term: 'Snap point', meaning: 'A drawer height a drag gesture can rest at.' },
      { term: 'Rubber-band', meaning: 'Elastic overshoot at a boundary, borrowed from iOS.' },
      { term: 'Shared layout animation', meaning: 'Same DOM element animating between two positions.' },
    ],
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
      'At Anthropic, a design engineer is expected to shape not only pixels and components but how Claude behaves in the product, which pushes the discipline beyond frontend.',
    readTime: '~5 min read',
    diagram: '/lessons/de/de-pr-anthropic-design.png',
    diagramCaption:
      'Model behavior joins pixels and components as a design surface: refusals, citations, tool calls.',
    whyItMatters:
      "An AI product's most important design surface is not the composer, the message list, or the sidebar. It is how the model responds to a poorly formed question, how it refuses, how it cites, how it recovers from an error. Anthropic's public writing on design engineering treats that behavior as a design material the same way color is. For a design engineer building AI products at Armoriq or Ivish, this reframe is load-bearing. You do not design around the model, you design the model's behavior.",
    sections: [
      {
        heading: 'The public page names the discipline',
        body: "Anthropic's design page at anthropic.com/design is short and specific. It says the team is small, that designers ship code, that they treat interface and model behavior as two halves of one product. The team's writing points at the same idea from different angles: prompt design as microcopy, refusal styles as tone, tool use flows as interaction design. The page is worth rereading every six months because the discipline is still being invented in public.",
      },
      {
        heading: 'Model behavior is a design surface',
        body: 'A refusal is a UI. A citation is a UI. A tool call announcing itself is a UI. Every one of these is shaped by system prompt, tool schema, and RLHF, not by CSS. A design engineer at Anthropic writes system prompts the same way another team would write button labels, and evaluates them by reading transcripts the way you would inspect a Figma frame. The transferable insight is that "designing the model\'s voice" is a real job, and it belongs to whoever else is designing the interface, not to a separate prompt engineer.',
      },
      {
        heading: 'Claude.ai is the artifact',
        body: "The clearest study of Anthropic's design engineering is Claude.ai itself. Streaming behavior, the artifacts panel, tool use previews, citation UI, the composer's keyboard model: each is a design decision that only exists because the same person shaping the CSS is shaping the prompt. Compare it to earlier LLM interfaces that treated the model as a black box behind a chat window. Claude.ai treats the model as a component you can tune, and the interface exposes just enough of that tuning to keep the user oriented.",
      },
      {
        heading: 'What a designer can steal from the approach',
        body: 'Two habits port. First, read transcripts as UI. Every unhandled model output is a bug the way an unhandled empty state is a bug. Second, write system prompts as microcopy. Give them versions, review them in PRs, ship them next to the UI change that depends on them. Both habits require the design engineer to touch the model layer, which is exactly the discipline Anthropic is describing. Doing this at Armoriq means the agent-behavior work stops being "engineering" and starts being design.',
      },
    ],
    takeaways: [
      'Model behavior is a design surface; treat refusals and citations as UI decisions.',
      "Anthropic's design page is short, specific, and worth rereading.",
      'Claude.ai is the artifact; study it to see the discipline shipped.',
      'Read transcripts and write system prompts the way you review Figma and write button labels.',
    ],
    terms: [
      { term: 'Model behavior', meaning: 'How the model responds, refuses, cites, and recovers; a design surface.' },
      { term: 'System prompt', meaning: "The always-on instructions that shape the model's voice; treat as microcopy." },
      { term: 'Refusal UI', meaning: 'The visible shape of a model declining a request.' },
      { term: 'Tool call preview', meaning: 'Interface element showing what tool the model is about to use.' },
      { term: 'Citation UI', meaning: 'How grounded outputs point back at their source spans.' },
      { term: 'RLHF', meaning: 'Reinforcement learning from human feedback; the training method that shapes model tone.' },
    ],
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
      'Design tokens graduate through three tiers, primitive to semantic to component, and every mature system in the wild follows the same ladder.',
    readTime: '~5 min read',
    diagram: '/lessons/de/de-pr-token-theory.png',
    diagramCaption:
      'Three tiers plus governance: primitive, semantic, component, and the process that keeps naming honest.',
    whyItMatters:
      "Every design system I have watched fail did it at the token layer. Someone shipped `--blue-500` as the button color, then a year later needed a warning button, then a themed variant, then a customer white-label. Each request cost a sprint because the token layer had no semantics. Josh Comeau, Nathan Curtis, and Amy Hupé have all written about the same three-tier ladder that fixes this, and it is the difference between a token file and a design system. If I want Armoriq's tokens to survive white-labeling, this ladder is the map.",
    sections: [
      {
        heading: 'Nathan Curtis defined the vocabulary',
        body: "Nathan Curtis at EightShapes has been writing about tokens since 2016, and his taxonomy is the closest thing the industry has to a standard. Tier one is the primitive layer, raw color, spacing, and type values with no intent. Tier two is the semantic layer, `color-action-primary`, `spacing-inset-md`, names that describe purpose. Tier three is the component layer, `button-primary-background`, tokens scoped to a component's contract. Curtis's Medium series and eightshapes.com essays are the reference; every token skeptic I have converted was converted by reading one of them.",
      },
      {
        heading: 'Josh Comeau makes the ladder practical',
        body: "Josh Comeau's course and blog turn Curtis's taxonomy into working CSS. He teaches tokens with CSS custom properties, theme-scoped overrides, and a discipline for when to reach for each tier. His posts on color systems and dark mode show, concretely, why component code should read only from tier two. Rendered as CSS, the ladder looks like `--button-bg: var(--color-action-primary);` and `--color-action-primary: var(--blue-500);`, a two-hop dereference that lets you retheme without touching a component.",
      },
      {
        heading: 'Amy Hupé argues for governance, not just structure',
        body: "Amy Hupé's writing at amyhupe.co.uk pushes on the part the other two soft-pedal, governance. A token system without an owning team, a naming convention, and a review process is a token system that will fork within a year. Her essays on the GOV.UK Design System, tone of voice, and inclusive tokens make the case that tokens are political artifacts as much as technical ones. Someone owns the meaning of `color-action-primary`. If nobody does, everyone renames it.",
      },
      {
        heading: 'The token maturity model in one paragraph',
        body: 'Read the three together and the maturity model emerges. Level zero is hardcoded values in components. Level one is a token file of primitives. Level two adds semantic tokens the components read from. Level three scopes tokens per component and per theme. Level four adds governance, naming conventions, deprecation, versioning, and human review. Most teams get to level two and stall. Level three is where white-label, theming, and platform expansion stop being rewrites. Level four is where the tokens stop rotting.',
      },
    ],
    takeaways: [
      'Tokens ladder from primitive to semantic to component; a component should read from tier two.',
      'White-label and theming only work when tier two exists and components never bypass it.',
      'Governance is the level most token systems skip; without it the naming rots.',
      'Read Curtis for taxonomy, Comeau for the CSS, Hupé for the politics.',
    ],
    terms: [
      { term: 'Primitive token', meaning: 'Raw value with no intent, tier one, `blue-500`.' },
      { term: 'Semantic token', meaning: 'Value named by purpose, tier two, `color-action-primary`.' },
      { term: 'Component token', meaning: "Value scoped to a component's contract, tier three, `button-primary-bg`." },
      { term: 'Alias', meaning: 'Token whose value is another token, the two-hop that makes theming possible.' },
      { term: 'Theme scope', meaning: 'A CSS scope that overrides tier two tokens for a mode or brand.' },
      { term: 'Governance', meaning: 'The process that owns naming, deprecation, and review of tokens.' },
    ],
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
