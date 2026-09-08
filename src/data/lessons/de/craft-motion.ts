import type { Lesson } from '@/lib/lessons';

// Design engineering · Craft · Motion (7 lessons)
// Source: C:\Users\ashut\Vault\20 Areas\Design Engineering\Craft-Motion\
export const deCraftMotion: Lesson[] = [
  {
    id: 'de-cm-motion-tokens',
    phase: 'Design engineering',
    part: 'Craft \u00b7 Motion',
    index: 'DE.CM.01',
    title: 'Motion tokens are a language, not a decoration',
    oneLiner:
      'Motion tokens turn timing and easing into a shared vocabulary the design system enforces, the same way color tokens enforce brand consistency across every screen.',
    readTime: '~10 min read',
    diagram: '/lessons/de/de-cm-motion-tokens.png',
    diagramCaption:
      'Vercel Geist motion documentation showing a short token ladder for durations and easing curves.',
    whyItMatters:
      'When motion lives in scattered inline values (transition: 200ms ease), each engineer picks a slightly different curve: a modal opens in 250ms, a drawer in 300ms, a toast in 180ms, and the product feels stitched together by different hands. Linear ships fewer than ten motion tokens total, and every surface, from issue creation to the command palette, shares the same modal-enter timing. Tokens turn that consistency from a code review argument into a compile time property: new components inherit the language without asking.',
    learningObjectives: [
      'Separate a primitive motion token (a raw duration or curve) from a semantic motion token (a job name like modal-enter), and explain why the split prevents fifty-callsite renames.',
      'Size a duration ladder for a real product: three durations plus one instant, and justify why a fourth duration is usually a smell.',
      'Compare Vercel\'s shipped duration ladder, Material Design 3\'s duration-and-easing pairs, and Linear\'s under-ten-token system side by side.',
      'Write a semantic token name (toast-exit, hover-lift) for five common UI moments in an existing product.',
      'Decide, given a five-minute product brief, whether a new interaction needs a new token or can reuse an existing one.',
    ],
    sections: [
      {
        heading: 'Primitive tokens describe physics; semantic tokens describe intent',
        body: 'Primitives name raw values: duration-100 = 150ms, ease-standard = cubic-bezier(0.4, 0, 0.2, 1). Semantics name jobs: modal-enter, toast-exit, hover-lift. A semantic token is an alias that points at a primitive, the same relationship color/text-primary has to gray-900. A designer changing brand feel edits the primitive once and every semantic token following it moves in lockstep; without that split, a brand refresh means renaming fifty call sites by hand.\n\nThe Design Tokens Community Group (DTCG), the group formalizing a shared JSON format for exactly this primitive/alias structure, calls these two layers "raw" and "alias" tokens; Style Dictionary and Tokens Studio both build their pipelines around the same split. Semantic tokens are the API a component author reads; primitives are the implementation a brand owner edits. Get the split wrong and you cannot change one without breaking the other.',
      },
      {
        heading: 'Duration ladders should be short, not exhaustive',
        body: 'Most systems ship three durations (fast, standard, slow) plus one instant (0ms, for reduced motion) and stop. Five is already too many, because designers cannot keep them apart in memory during a design review. Vercel\'s own site runs on close to this ladder: roughly 90ms for micro-interactions like a button hover, 150ms for body and input transitions, and 300ms for panel reveals, nearly all on a plain ease curve rather than a custom bezier. Linear ships fewer than ten motion tokens total across its entire product. A short ladder forces intent: is this the fast one or the standard one? A long ladder invites cargo culting: someone picks 320ms because 300ms felt off, and now 320ms lives forever in a stylesheet nobody wants to touch. The constraint is the value, not a limitation on it.',
      },
      {
        heading: 'Easing tokens encode brand personality',
        body: 'Easing curves carry more brand than duration does. Material Design\'s standard curve, cubic-bezier(0.4, 0, 0.2, 1), reads as calm and considered: it decelerates gently into rest. A sharper curve like cubic-bezier(0.4, 0, 1, 1) reads as more responsive and mechanical. Apple\'s springs, defined by duration and bounce since the WWDC 2023 spring API, read as physical rather than scheduled. Pick one curve for enter (starts fast, decelerates), one for exit (accelerates, ends fast), one for standard (does both), and stop there. If the brand later shifts from calm to punchy, you change one curve definition and the whole product recomposes itself overnight. Curves are cheaper to iterate on than the components using them, which is exactly why they belong in the token layer and not inline in a component file.',
      },
      {
        heading: 'A duration ladder compared: Vercel, Material Design 3, Linear',
        body: 'Three real systems, three different ladders, same underlying idea. Vercel\'s site: roughly 90ms (micro), 150ms (base), 300ms (panel), one curve. Material Design 3\'s official spec pairs eleven duration-and-easing combinations down to a simple starting set: Standard 300ms for elements that begin and end on screen, Standard decelerate 250ms to enter, Standard accelerate 200ms to exit; Emphasized 500ms for a bigger transition, 400ms to enter, 200ms to exit. Linear keeps its public token count under ten and does not publish separate enter and exit durations at all, betting one curve per direction is enough. None of these is "the right answer"; the lesson is that mature systems converge on 3 to 6 duration values and 2 to 4 curves, never dozens. If your token file has more entries than that, someone stopped enforcing the ladder.',
      },
      {
        heading: 'Reduced-motion variants belong at the token layer, not the component',
        body: 'A token is not done until it has a reduced-motion sibling. modal-enter at 240ms with a translateY becomes modal-enter-reduced at 120ms with only an opacity fade, and the pairing lives in the same token file, resolved automatically by a media query at build time or runtime. This means an engineer who writes transition: var(--modal-enter) once gets the accessible behavior for free, instead of every component author remembering to write a separate @media (prefers-reduced-motion: reduce) block by hand. Teams that skip this step end up with reduced motion support on the three components someone remembered and silence everywhere else. The token system is the only place this scales past a handful of components.',
      },
      {
        heading: 'Tooling that keeps the ladder honest',
        body: 'A short ladder only stays short if something enforces it. Style Dictionary compiles a single JSON or YAML source of truth into CSS variables, Swift enums, and Android XML, so the same three durations ship to every platform without hand-copying numbers. Tokens Studio plugs the same idea into Figma, letting a designer bind a prototype\'s transition to duration.standard instead of typing 240 into a duration field. An ESLint rule or a Stylelint plugin that flags any transition-duration or animation-duration not resolved from a token catches drift at pull-request time, the same way a color-token lint catches a hardcoded hex value. Without this enforcement layer, the ladder degrades the same way an untyped API degrades: quietly, one convenient exception at a time, until nobody remembers there was a rule.',
      },
      {
        heading: 'The cost of skipping tokens',
        body: 'Picture a five-person team six months in without motion tokens. The modal takes 250ms because the first engineer liked it. The drawer takes 300ms because the second engineer copied a tutorial. The toast takes 180ms because the third engineer eyeballed it against Sonner\'s demo site. Nobody agrees on a curve, so three different cubic-bezier strings live in three components solving the same problem three ways. A rebrand six months later becomes a grep-and-replace across forty files instead of an edit to three token values, and QA has to re-eyeball every surface by hand because there is no single source of truth to check against. This is not a hypothetical; it is the default state of every codebase that treats motion as a per-component styling choice instead of a shared vocabulary.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-cm-motion-tokens-ladder.svg',
        alt: 'Duration ladder comparison across three products',
        caption: 'Vercel, Material Design 3, and Linear each converge on 3 to 6 durations, never dozens.',
        diagramBrief: 'Three-column comparison table rendered as a diagram. Column headers: Vercel, Material Design 3, Linear. Rows list duration values as horizontal bars scaled to their millisecond value (90, 150, 300 for Vercel; 200, 250, 300, 400, 500 for Material; a single "under 10 tokens total" note for Linear). Style: cream paper background #faf6ef, monochrome ink, one accent color highlighting the shared 150 to 300ms zone across all three.',
      },
      {
        src: '/lessons/de/de-cm-motion-tokens-primitive-semantic.svg',
        alt: 'Primitive to semantic token flow',
        caption: 'A primitive (duration-100 = 150ms) resolves through a semantic alias (modal-enter) into three unrelated components.',
        diagramBrief: 'Left box labeled "Primitive: duration-100 = 150ms, ease-standard = cubic-bezier(0.4,0,0.2,1)". Arrow to a middle box labeled "Semantic: modal-enter". Arrows fanning out from the semantic box to three small component icons labeled Modal, Drawer, Toast, showing one primitive change propagating to all three. Style: cream paper background, black ink, one blue accent on the arrows.',
      },
    ],
    takeaways: [
      'Ship three durations and three curves before shipping a fourth of either.',
      'Split primitives from semantics so brand feel can rev without renaming components.',
      'Name tokens by job (modal-enter), not by number (duration-300).',
      'If a component sets its own timing, it is off the design system, not extending it.',
    ],
    terms: [
      { term: 'Motion token', gloss: 'a named animation value', meaning: 'A duration, easing curve, or spring configuration stored in the design system and referenced by name instead of a literal number.' },
      { term: 'Primitive token', gloss: 'the raw number', meaning: 'A base value like duration-100 = 150ms or ease-standard = cubic-bezier(0.4,0,0.2,1), with no job attached yet.' },
      { term: 'Semantic token', gloss: 'the token with a good name', meaning: 'A job-named alias, like modal-enter, that resolves to a primitive and can be reassigned without renaming call sites.' },
      { term: 'Duration ladder', gloss: 'the list of allowed speeds', meaning: 'The finite, deliberately small set of duration values a system exposes, typically 3 to 6 entries.' },
      { term: 'Easing curve', gloss: 'how fast it moves at each point', meaning: 'The rate-of-change function (cubic-bezier or spring) applied across a duration; two animations with the same duration and different curves feel different.' },
      { term: 'Cargo culting', gloss: 'copying what worked elsewhere', meaning: 'Reusing a specific number or pattern without understanding the reasoning that produced it, so it survives long after the reasoning stops applying.' },
      { term: 'DTCG format', gloss: 'the token file standard', meaning: 'The Design Tokens Community Group\'s JSON schema for representing tokens portably across Figma, code, and platforms.' },
      { term: 'Style Dictionary', gloss: 'the tool that builds tokens', meaning: 'An open-source build system that compiles one token source file into CSS variables, iOS, Android, and other platform formats.' },
      { term: 'Reduced-motion variant', gloss: 'the accessible version', meaning: 'A token\'s paired alternate value, used automatically when the OS signals prefers-reduced-motion: reduce.' },
      { term: 'Token drift', gloss: 'when things slowly stop matching', meaning: 'The gradual reintroduction of hardcoded values into a codebase that has tokens, usually because nothing lints for it.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'List every transition-duration and transition-timing-function value used in a component file you have access to. How many distinct numbers show up, and how many are actually different on purpose?' },
      { level: 'easy', prompt: 'Write the semantic token names (not the values) for a menu opening, a menu closing, and a form field showing a validation error.' },
      { level: 'medium', prompt: 'Given Vercel\'s rough 90/150/300ms ladder and Material Design 3\'s 200 to 500ms ladder, pick one for a dashboard product used mostly on desktop during work hours, and justify the choice in two sentences.' },
      { level: 'medium', prompt: 'A component ships with transition: all 320ms ease-in-out hardcoded inline. Rewrite it against a three-duration, three-curve token system, choosing which token each property should use.' },
      { level: 'design', prompt: 'Design a five-token motion system (three durations, two curves) for a note-taking app whose brand feel is "quiet and deliberate." Name each token by job, give it a value, and write one sentence explaining why a sixth token was rejected.' },
    ],
    furtherReading: [
      { label: 'Vercel Geist, Motion', url: 'https://vercel.com/geist/motion', why: 'The token ladder this lesson\'s hero diagram is drawn from, published by the team that runs vercel.com and its dashboard on it.' },
      { label: 'Material Design 3, Easing and duration', url: 'https://m3.material.io/styles/motion/easing-and-duration/tokens-specs', why: 'The most detailed public duration-and-easing token spec from a major design system, with named pairs for enter, exit, and persistent transitions.' },
      { label: 'Design Tokens Community Group, Format specification', url: 'https://tr.designtokens.org/format/', why: 'The emerging cross-tool standard for how primitive and alias tokens are represented in a portable JSON file.' },
      { label: 'Style Dictionary, documentation', url: 'https://styledictionary.com', why: 'The build tool most token pipelines use to turn one source file into CSS, iOS, and Android outputs without hand-copying values.' },
      { label: 'Emil Kowalski, Sonner', url: 'https://sonner.emilkowal.ski', why: 'A shipped, inspectable example of a small motion token system: watch the enter, hover-pause, and exit timings on a live toast.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Motion token audit checklist',
      body: '- Count every distinct duration value used across the codebase. More than 6? You have drift.\n- Count every distinct easing curve. More than 4? Same problem.\n- For each duration and curve, write down the semantic name it should carry (modal-enter, toast-exit, hover-lift).\n- Check that every semantic token has a reduced-motion sibling defined, not just the primary product.\n- Confirm the token file is the single source both design (Figma variables or Tokens Studio) and code (CSS variables or Style Dictionary output) read from.\n- Add a lint rule that flags a literal ms value in a transition or animation-duration property outside the token file.',
    },
    demoCaption:
      'Flip between an ad-hoc timing sheet and a tokenized one. Same components, one is a vocabulary and the other is a pile of numbers.',
    demo: {
      archetype: 'toggle-fix',
      badLabel: 'Ad-hoc timings',
      goodLabel: 'Tokenized ladder',
      subject: 'Component timings',
      badCaption:
        'Every component picked a duration by feel. 180, 220, 250, 320. Nothing shares a curve. Brand feel is not editable in one place.',
      goodCaption:
        'Three durations, three curves. Semantic names carry intent. A brand change reruns the whole product without touching a component.',
      badLines: [
        'toast enter: 180ms ease-out',
        'modal enter: 250ms ease-in-out',
        'drawer slide: 320ms custom bezier',
        'hover lift: 140ms linear',
        'tooltip fade: 220ms ease',
      ],
      goodLines: [
        'toast-enter -> fast (150ms) + enter curve',
        'modal-enter -> standard (240ms) + enter curve',
        'drawer-slide -> slow (400ms) + standard curve',
        'hover-lift -> fast (150ms) + standard curve',
        'tooltip-fade -> fast (150ms) + enter curve',
      ],
    },
    posts: [
      {
        kind: 'X \u00b7 mechanism',
        hook: 'motion tokens are not a nice-to-have. they are the reason the product feels made by one team.',
        body:
          'motion tokens are not a nice-to-have. they are the reason the product feels made by one team.\n\nthree durations. three curves. named by job, not by number. modal-enter, not duration-300.\n\nthe primitive is the number. the semantic is the promise. change the primitive once, every component moves in lockstep.',
      },
      {
        kind: 'X \u00b7 design angle',
        hook: 'if every component picks its own duration, consistency becomes a code review argument.',
        body:
          'if every component picks its own duration, consistency becomes a code review argument.\n\n180 here, 220 there, 320 because someone tweaked it once. brand feel is not editable in one place.\n\nship a duration ladder of three and stop. easing carries more brand than duration anyway.',
      },
      {
        kind: 'X \u00b7 one-liner',
        hook: 'if a component sets its own timing, it is off the system, not extending it.',
        body:
          'if a component sets its own timing, it is off the system, not extending it.\n\nmotion tokens are a language. the constraint is the value.',
      },
    ],
    source: {
      label: 'Vault note: Motion tokens are a language, not a decoration',
      url: 'https://vercel.com/geist/motion',
    },
  },

  {
    id: 'de-cm-perceived-performance',
    phase: 'Design engineering',
    part: 'Craft \u00b7 Motion',
    index: 'DE.CM.02',
    title: 'Perceived performance rides three thresholds: 100ms, 300ms, 1000ms',
    oneLiner:
      'A response under 100ms feels instant, under 300ms feels connected, under 1000ms holds attention; past that, the user has already left the interaction.',
    readTime: '~10 min read',
    diagram: '/lessons/de/de-cm-perceived-performance.png',
    diagramCaption:
      'The response-time ladder: instant under 100ms, connected under 300ms, waiting under 1000ms, gone past that.',
    whyItMatters:
      'Every animation and every network round trip lands in one of four buckets, and Google\'s own Core Web Vitals now score sites on exactly this scale: Interaction to Next Paint (INP) rates a page "good" at 200ms or under, "needs improvement" up to 500ms, and "poor" beyond that. Miss the 300ms band without a skeleton or an optimistic update, and the user starts doubting the tap, the same failure mode Vercel\'s own dashboard avoids by showing a skeleton the instant a deployment log is still streaming. These are not opinions. They are measured constants going back to 1968, still governing how Google grades every website in 2026.',
    learningObjectives: [
      'Classify any interaction into one of four perceptual bands (feedback, connected, waiting, gone) using the 100ms, 300ms, and 1000ms thresholds.',
      'Explain the Doherty threshold and the 1982 IBM study that produced it, in terms a non-technical stakeholder can repeat.',
      'Map Google\'s RAIL model and its Interaction to Next Paint (INP) metric onto the same four-band framework.',
      'Diagnose why an average response time can hide a badly-feeling product, using the 75th-percentile argument behind Core Web Vitals.',
      'Design the loading sequence for an interaction whose latency varies across all four bands.',
    ],
    sections: [
      {
        heading: 'The 100ms window is for feedback, not for meaning',
        body: 'Under 100ms, animation cannot narrate: the eye has not landed yet. Google\'s RAIL performance model, published by the Chrome team in 2015, makes this a hard budget: process a user\'s input within 50ms so the visible response lands inside 100ms, because anything slower breaks the felt connection between action and reaction. Use this window for confirming input only: a button\'s color change, a ripple, a checkbox\'s pressed state. Emil Kowalski notes Sonner\'s toast enter runs closer to 150ms because 100ms tested as too fast to register as a new toast landing. Under 100ms belongs to acknowledgment; storytelling starts a beat later, which is why nested easing curves inside an 80ms animation look identical to a linear one in a user test; there simply is not enough time for the curve to read.',
      },
      {
        heading: 'The 100 to 300ms window is where product personality lives',
        body: 'Modal opens, drawer slides, tooltip fades, page transitions: these sit in the 150 to 300ms band, RAIL\'s "natural and continuous progression" zone that runs from 100ms out to a full second. It is long enough to read a curve, short enough to feel snappy. iOS spring sheet animations often settle closer to 400ms, because a spring\'s tail reads as follow-through, physical weight settling, not as delay. Below 150ms the motion is too fast to resolve; above 300ms the user shifts from watching to waiting. Pick a standard duration inside this band and defend it, because most of a product\'s components will use it, and the product\'s entire tempo gets set right here.',
      },
      {
        heading: 'Past 300ms, motion must be interruptible',
        body: 'Any interaction longer than 300ms is a wait, and a wait needs an escape hatch. This is where skeleton loaders, progressive loading, optimistic updates, and cancel buttons live. Google\'s own INP metric formalizes the same idea from the other direction: it measures the slowest interaction on a page and scores anything past 500ms as poor, at the 75th percentile of real visits, meaning half a second of unacknowledged wait is now a ranking and reputation problem, not just a feel problem. If an animation itself runs past 300ms, a hero transition or a walkthrough, it must respond to a scroll, click, or keypress mid-flight, or it reads as broken rather than deliberate.',
      },
      {
        heading: 'Past 1000ms, the interaction is already lost',
        body: 'RAIL puts the next hard line at 1000ms: past one second, users perceive a break in the task and their attention starts to wander toward something else on the screen. Past 10,000ms, RAIL calls it outright: users are frustrated and likely to abandon the task, possibly for good. The IBM ergonomics research behind the Doherty threshold found the same pattern from the opposite direction in 1982: cutting mainframe response time from about 2 seconds to well under 1 second raised programmer productivity by roughly 60 percent in a controlled study, because sub-second response let people keep their next few steps in short-term memory instead of re-deriving them after every wait. Motion past 1000ms should be optional, backgroundable, or accompanied by real progress information, never a silent hold.',
      },
      {
        heading: 'The Doherty threshold: performance research from 1982, still cited in 2026',
        body: 'Walter Doherty and Ahrvind Thadhani\'s 1982 IBM study is the historical spine under all of this. It found that as system response time dropped toward roughly 400ms, engagement and productivity did not improve gradually, they jumped: users worked in tighter loops, made fewer errors recovering lost context, and stopped context-switching to other tasks while waiting. That number, sometimes called the Doherty threshold, predates the mouse, the web, and the smartphone, and it still shows up unchanged in Jakob Nielsen\'s writing and in modern INP guidance. The lesson for a 2026 product team is uncomfortable: the perceptual hardware has not upgraded since 1982, only the tooling to measure whether you are honoring it.',
      },
      {
        heading: 'Reading a real product against the four bands',
        body: 'Take Vercel\'s dashboard as a worked example. Hovering a project card changes its border in well under 100ms, pure feedback. Clicking into a project triggers a route transition that resolves in roughly 150 to 250ms most of the time, landing squarely in the connected band. When a deployment log is still streaming, the interface shows a skeleton immediately rather than a blank screen, acknowledging the past-300ms wait instead of pretending it is not happening. This is the pattern to copy: name which band each interaction in your product falls into, then check whether the UI response matches that band\'s rule, feedback only, narrate with motion, or interrupt with a skeleton.',
      },
      {
        heading: 'Averages hide the bands; measure the distribution instead',
        body: 'A single average response time tells you almost nothing about how an interface feels, because it collapses four different perceptual experiences into one number. A 300ms average can mean every tap is a smooth 300ms, or it can mean half the taps resolve in 80ms and the other half stall past 500ms; both produce the same average and completely different products. This is why INP is measured and scored at the 75th percentile of real user sessions rather than as a mean: it forces you to look at the slow tail, the interactions that actually cross into the poor band, instead of being reassured by a healthy-looking average that a slow minority is hiding inside.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-cm-perceived-performance-bands.svg',
        alt: 'The four response-time bands from RAIL and INP',
        caption: 'Feedback, connected, waiting, and gone: the same scale Google uses to score Core Web Vitals.',
        diagramBrief: 'Horizontal timeline from 0ms to 1000ms+ divided into four labeled zones: 0-100ms "feedback only", 100-300ms "narrate with motion", 300-1000ms "skeleton or interrupt required", 1000ms+ "attention gone". Below the timeline, mark INP\'s own scoring line at 200ms (good) and 500ms (poor) as a second reference band. Style: cream paper background, black ink, one accent color marking the INP good/poor lines.',
      },
      {
        src: '/lessons/de/de-cm-perceived-performance-doherty.svg',
        alt: 'The Doherty threshold productivity curve',
        caption: 'IBM, 1982: cutting response time from 2 seconds to under 1 second raised measured productivity by about 60 percent.',
        diagramBrief: 'A simple line chart, x-axis "system response time" from 0 to 2.5 seconds, y-axis "user productivity". Show a curve that stays low and flat above 1 second then rises steeply as it crosses under 1 second toward 0.4 seconds, with a dotted vertical line at 400ms labeled "Doherty threshold". Style: cream paper background, black ink, one accent color on the threshold line.',
      },
    ],
    takeaways: [
      'Under 100ms is acknowledgment; do not narrate here.',
      '150 to 300ms is where your standard duration lives; use one, not five.',
      'Past 300ms, the motion needs an interrupt or a skeleton, or both.',
      'Past 1000ms, move the work off the critical path or make it optional.',
    ],
    terms: [
      { term: 'Perceptual threshold', gloss: 'a speed that feels different', meaning: 'A specific response-time boundary (100ms, 300ms, 1000ms) at which the brain shifts how it categorizes what just happened, documented since the 1960s.' },
      { term: 'Doherty threshold', gloss: 'the 400ms rule', meaning: 'The response-time point, identified in a 1982 IBM study, below which user engagement and measured productivity rise sharply rather than gradually.' },
      { term: 'RAIL model', gloss: 'Google\'s performance rules', meaning: 'A 2015 Chrome team framework naming four budgets: Response under 100ms, Animation frames under 16ms, Idle work chunked under 50ms, Load interactive under 5 seconds.' },
      { term: 'Interaction to Next Paint (INP)', gloss: 'the new Core Web Vital', meaning: 'A Google metric, replacing First Input Delay in March 2024, that scores a page\'s slowest interaction at the 75th percentile of real visits: good at 200ms or under, poor past 500ms.' },
      { term: 'Interstitial', gloss: 'a loading screen', meaning: 'Any UI shown during a wait state, a skeleton, spinner, or placeholder, whose job is to acknowledge a delay the interaction cannot avoid.' },
      { term: 'Optimistic UI', gloss: 'showing success before it is confirmed', meaning: 'Rendering the successful end state immediately, before the server has actually confirmed the action, then reconciling or rolling back if it fails.' },
      { term: 'Interrupt', gloss: 'being able to cancel', meaning: 'A user\'s ability to stop, override, or skip an in-flight motion or wait state rather than being forced to sit through it.' },
      { term: 'Follow-through', gloss: 'the little wobble at the end', meaning: 'The tail of a spring-based animation settling past its target, read by users as physical weight rather than as unwanted delay.' },
      { term: '75th percentile (field data)', gloss: 'how most people actually experience it', meaning: 'A statistical cut naming the response time that three out of four real visits fall under or beat, used by Core Web Vitals instead of an average that slow outliers can hide inside.' },
      { term: 'Critical path', gloss: 'the thing blocking the user', meaning: 'Any work the interface makes the user wait on directly; work moved off the critical path can run in the background without holding up the interaction.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Classify these five interactions into one of the four response bands (feedback, connected, waiting, gone): a checkbox tick, a page navigation, a full-text search over 2 million rows, a file upload progress bar, a button hover.' },
      { level: 'easy', prompt: 'Look up your own product or app\'s slowest common interaction. Which INP band does it likely fall into: good (under 200ms), needs improvement, or poor (over 500ms)?' },
      { level: 'medium', prompt: 'A feature ships with a 600ms wait and no skeleton, no spinner, no interrupt. Using the four-band model, name exactly what is missing and at which threshold it became a problem.' },
      { level: 'medium', prompt: 'Explain, in two sentences a non-technical stakeholder could repeat, why a page can have a fast average load time and still feel slow to real users.' },
      { level: 'design', prompt: 'Design the loading sequence for a search results page where the API can take anywhere from 80ms to 1500ms depending on the query. Specify what the user sees at 0ms, 100ms, 300ms, and 1000ms.' },
    ],
    furtherReading: [
      { label: 'Jakob Nielsen, Response Times: The 3 Important Limits', url: 'https://www.nngroup.com/articles/response-times-3-important-limits/', why: 'The canonical modern statement of the 0.1/1/10-second thresholds, tracing them back to 1968 research.' },
      { label: 'Google, Measure performance with the RAIL model', url: 'https://web.dev/articles/rail', why: 'The primary source for the Response/Animation/Idle/Load budgets, including the 50ms input-processing rule behind the 100ms feedback window.' },
      { label: 'Google, Interaction to Next Paint (INP)', url: 'https://web.dev/articles/inp', why: 'The current Core Web Vital that operationalizes these thresholds into a metric every production website is now graded on.' },
      { label: 'Doherty & Thadhani, The Economic Value of Rapid Response Time (IBM, 1982)', url: 'https://www.textbookofusability.com/references/doherty1982.html', why: 'The original study behind the 400ms Doherty threshold, the most-cited justification for sub-second performance budgets.' },
      { label: 'Emil Kowalski, writing on animation feel', url: 'https://emilkowal.ski', why: 'A working designer-engineer\'s notes on where specific millisecond choices, like Sonner\'s 150ms toast, came from in practice.' },
    ],
    shipIt: {
      kind: 'rubric',
      name: 'Response-band compliance rubric',
      body: '- Under 100ms: does the interaction get a visible response (color, ripple, pressed state) with nothing more elaborate attempted?\n- 100 to 300ms: is there exactly one standard duration in use, not three or four competing ones?\n- 300 to 1000ms: is there a skeleton, spinner, or optimistic state, and can the user cancel or navigate away mid-wait?\n- Past 1000ms: is the work moved off the critical path, made optional, or given real progress information instead of a spinner?\n- Field check: is the slowest 25 percent of real interactions, not the average, what gets reviewed before shipping?',
    },
    demoCaption:
      'One headline hides four different perceptual regimes. See how the same average splits across bands the user actually feels.',
    demo: {
      archetype: 'meter',
      badCaption:
        'A single average tells you nothing about how the app feels. 300ms as a mean can mean everything is snappy or half the taps drop into a wait.',
      goodCaption:
        'Four bands, four design responses. Feedback under 100ms, narrative under 300ms, skeleton past 300ms, off the critical path past 1000ms.',
      headline: '300ms feels instant',
      breakdown: [
        { label: 'Under 100ms (feedback)', value: 42 },
        { label: '100 to 300ms (narrative)', value: 33 },
        { label: '300 to 1000ms (wait)', value: 18 },
        { label: 'Over 1000ms (gone)', value: 7 },
      ],
    },
    posts: [
      {
        kind: 'X \u00b7 mechanism',
        hook: 'perceived speed is not one number. it is three thresholds.',
        body:
          'perceived speed is not one number. it is three thresholds.\n\nunder 100ms: the animation is the response.\n100 to 300ms: motion bridges the gap while state arrives.\npast 300ms: skeleton or interrupt, or the user doubts the tap.\npast 1000ms: they are gone.\n\nnielsen wrote this in the sixties. still true.',
      },
      {
        kind: 'X \u00b7 design angle',
        hook: 'you cannot narrate inside 80ms. the eye has not landed.',
        body:
          'you cannot narrate inside 80ms. the eye has not landed.\n\nunder 100ms is for acknowledgment: color change, pressed state, check drawing. richer motion there is wasted; users cannot resolve it in a test.\n\nstorytelling starts around 150ms. pick your standard duration in the 150 to 300ms band and put your tempo there.',
      },
      {
        kind: 'X \u00b7 one-liner',
        hook: 'any interaction longer than 300ms is a wait, and a wait must be cancelable.',
        body:
          'any interaction longer than 300ms is a wait, and a wait must be cancelable.\n\nno skeleton, no cancel, no interrupt = unresponsive. does not matter how pretty the curve is.',
      },
    ],
    source: {
      label: 'Vault note: Perceived performance rides three thresholds - 100ms, 300ms, 1000ms',
      url: 'https://www.nngroup.com/articles/response-times-3-important-limits/',
    },
  },

  {
    id: 'de-cm-spring-vs-tween',
    phase: 'Design engineering',
    part: 'Craft \u00b7 Motion',
    index: 'DE.CM.03',
    title: 'A spring bounces when the model requires momentum; a tween does not',
    oneLiner:
      'A tween is a scheduled path from A to B in a fixed time; a spring is a physics simulation whose duration and shape emerge from state and forces, not from a stopwatch.',
    readTime: '~10 min read',
    diagram: '/lessons/de/de-cm-spring-vs-tween.png',
    diagramCaption:
      'Motion spring playground showing stiffness and damping reshaping the curve in real time.',
    whyItMatters:
      'Choosing between tween and spring is not a taste call, it is a modeling call. A modal opening from a click is deterministic: a tween is honest, fixed duration, predictable curve, easy to test. A sheet dragged and released, the way Vaul\'s drawer or an iOS action sheet behaves, needs a spring, because release velocity has to survive into the animation. Since 2023, Apple\'s own spring API (duration, bounce) and CSS\'s linear() function both make this choice easier to execute correctly than it used to be.',
    learningObjectives: [
      'Explain why a spring\'s duration is an emergent output of stiffness, damping, and mass rather than a value you set directly.',
      'Decide, for any given trigger, whether release velocity needs to be honored, and pick tween or spring accordingly.',
      'Translate between Framer Motion\'s stiffness/damping/mass model and Apple\'s duration/bounce model for the same spring.',
      'Compare tween, spring, GSAP, and CSS linear() as four different tools for the same class of problem.',
      'Diagnose a "floppy" or "dead" animation as a spring/tween mismatch rather than a tuning problem.',
    ],
    sections: [
      {
        heading: 'Tweens have three knobs: start, end, curve',
        body: 'A tween interpolates between two known values over a fixed duration according to an easing curve. Cubic bezier is the most common curve; steps() and CSS keyframes are variations on the same idea. Because the end time is known at the start, tweens compose cleanly, chain, stagger, reverse, delay, which is why CSS transitions and most design tokens are built on them. Since December 2023, CSS also ships a linear() easing function, supported in Chrome 113, Firefox 112, and Safari 17.2 onward, that can approximate a bounce or spring shape as a plain tween by plotting many stops along the curve. Tweens fail when a user\'s input changes the target mid-flight: a drag that becomes a fling has no clean tween model, because the end was not known when the animation started, and forcing one produces a jarring cut at release.',
      },
      {
        heading: 'Springs have three knobs: stiffness, damping, mass',
        body: 'Stiffness controls how hard the spring pulls toward its target. Damping controls how much energy leaves per oscillation. Mass controls inertia. Together they define shape and duration; you do not set duration directly, the physics produces it as an output. iOS uses springs system-wide for exactly this reason: a heavy sheet pulled slowly should not settle the same way as one flicked hard, and a spring reads that difference natively. Since WWDC 2023, Apple\'s own animation APIs expose a friendlier pair of knobs on top of the same physics: duration and bounce, where duration is a perceptual pacing target and bounce ranges from -1 (overdamped, no oscillation) to 1 (undamped, maximum oscillation), converted internally back into mass, stiffness, and damping. Framer Motion\'s default spring (stiffness 100, damping 10) is a reasonable starting point for a first pass; adjust mass last, it changes shape less predictably than the other two.',
      },
      {
        heading: 'Bounce is a semantic signal, not a decoration',
        body: 'A visible bounce says this element has weight. That reads as honest for a physical object, a card being flicked, a sheet being pulled. It reads as dishonest for a modal appearing on click, because a modal never had physics to begin with; nothing was flicked, nothing has mass. Rauno Freiberg\'s craft site uses subtle springs on drag interactions and tweens on everything else, which is the right split. Apple\'s own WWDC guidance recommends a bounce of 0 (critically damped, no oscillation) as the safe general-purpose default, reserving anything above roughly 0.3 to 0.4 bounce for moments meant to feel distinctly playful rather than merely responsive. If you feel the urge to add a bounce to a static element, ask one question first: was the user\'s own motion involved? If no, use a tween.',
      },
      {
        heading: 'Tween vs spring: a direct comparison',
        body: 'Put side by side, the tradeoffs are concrete. A tween has a known duration you can put a number on in a spec (240ms); a spring\'s duration is an emergent property you can only approximate, though Apple\'s duration parameter now gives a usable perceptual estimate. A tween composes predictably across a chain or stagger; a spring composes naturally with gesture velocity but is harder to chain precisely. A tween is trivial to test with a fixed clock in an automated test; a spring usually needs a visual or physics-aware test. A tween on a dragged element ignores the user\'s effort and feels dead; a spring on a static click adds motion nobody asked for and feels floppy. Neither primitive is better in general, only better matched to whether the interaction had a physical input or not.',
      },
      {
        heading: 'GSAP, Framer Motion, and CSS: where each spring model lives',
        body: 'The tooling for this choice widened considerably by 2025. Framer Motion (now Motion) has shipped physics-based springs as a first-class prop since its earliest releases. GSAP, which became entirely free for commercial use in April 2025 after Webflow\'s 2024 acquisition, including every previously paid Club plugin like SplitText, ships its own elastic and bounce eases alongside true spring physics via plugins. React Spring builds its entire API around spring configs rather than durations, forcing the modeling decision at the type level. And plain CSS, via linear(), can now fake a spring\'s visual shape without any JavaScript runtime at all, at the cost of the spring no longer responding to live gesture velocity. Pick the tool by whether the animation needs to react to input in real time, not by which library is currently trending.',
      },
      {
        heading: 'Testing the difference: Vaul\'s drag-to-dismiss',
        body: 'Vaul, the drawer library built on top of Motion\'s spring primitives, makes the difference tangible in under ten seconds of interaction. Drag the sheet down slowly and release: it drifts to its exit position at a pace that matches the drag. Flick it hard and let go: it snaps off screen fast, because the spring inherited the release velocity as its initial condition. Rebuild the same interaction with a tween instead, and both gestures, slow drag and fast flick, animate the exit over the exact same fixed duration, and the difference between them disappears entirely. That collapse is the tell: if two visibly different user actions produce an identical animation, whatever primitive is running has thrown away information the user gave it on purpose.',
      },
      {
        heading: 'A decision rule you can apply in five seconds',
        body: 'Before writing a single line of animation code, ask: did the user\'s own motion, a drag, a swipe, a flick, a scroll velocity, produce a value this animation needs to honor? If yes, model it as a spring, because only a spring can carry that velocity forward honestly. If no, and the target and trigger are both fully known in advance, a click opening a modal, a hover revealing a tooltip, model it as a tween, because a tween is cheaper to reason about, easier to test, and composes more predictably with everything else in the interface. The rule fails exactly once: a spring\'s duration cannot be forced to match a fixed number without fighting the physics, which is the reliable sign you actually wanted a tween all along and reached for the wrong tool.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-cm-spring-tween-shapes.svg',
        alt: 'Tween curve vs spring curve over time',
        caption: 'A tween is one fixed path; a spring is a family of paths that depend on stiffness, damping, and release velocity.',
        diagramBrief: 'Two line charts side by side, x-axis time, y-axis position. Left chart: a single smooth cubic-bezier curve labeled "tween: fixed duration, one path". Right chart: three overlapping curves with slightly different overshoot and settle times, labeled "spring: same target, three different release velocities". Style: cream paper background, black ink, one accent color per curve on the right chart.',
      },
      {
        src: '/lessons/de/de-cm-spring-bounce-scale.svg',
        alt: 'Apple bounce parameter from -1 to 1',
        caption: 'Apple\'s spring API maps a single bounce value from overdamped through critically damped to undamped oscillation.',
        diagramBrief: 'A horizontal scale from -1 to 1. Left end labeled "overdamped, flattened, no oscillation". Center (0) labeled "critically damped, smooth, the safe default". Right end (1) labeled "undamped, maximum bounce". Draw a small curve sketch above each of the three key points showing the resulting motion shape. Style: cream paper background, black ink, one accent color marking 0.',
      },
    ],
    takeaways: [
      'If the user\'s velocity matters (drag, swipe, flick), use a spring.',
      'If the interaction is a click or hover with a known target, use a tween.',
      'A spring\'s duration is emergent, not a knob; do not fight it with force.',
      'Bounce implies weight; do not add it where there is nothing being weighed.',
    ],
    terms: [
      { term: 'Tween', gloss: 'an animation with a set length', meaning: 'A fixed-duration interpolation from a known start value to a known end value along an easing curve.' },
      { term: 'Spring', gloss: 'a bouncy animation', meaning: 'A physics simulation defined by stiffness, damping, and mass (or Apple\'s duration and bounce), whose actual duration is an emergent output, not an input.' },
      { term: 'Stiffness', gloss: 'how fast it snaps back', meaning: 'How hard the spring pulls toward its target value at any given displacement.' },
      { term: 'Damping', gloss: 'how much it wobbles', meaning: 'How much energy the spring loses per oscillation cycle; higher damping means fewer, smaller bounces.' },
      { term: 'Overdamped', gloss: 'no bounce at all', meaning: 'Damping high enough that the spring approaches its target without ever oscillating past it.' },
      { term: 'Underdamped', gloss: 'visibly bouncy', meaning: 'Damping low enough that the spring overshoots its target and oscillates before settling.' },
      { term: 'Bounce parameter', gloss: 'Apple\'s simplified spring dial', meaning: 'A -1 to 1 value in Apple\'s spring(duration:bounce:) API that maps directly onto the overdamped-to-underdamped spectrum without exposing mass, stiffness, or damping directly.' },
      { term: 'Release velocity', gloss: 'how fast the finger was moving', meaning: 'The speed and direction a gesture was moving at the moment of release, which a spring can inherit as an initial condition and a tween cannot.' },
      { term: 'linear() easing', gloss: 'spring-like motion in plain CSS', meaning: 'A CSS easing function, broadly supported since late 2023, that plots a curve as a sequence of linear stops, letting a tween visually approximate a spring or bounce shape without a JavaScript runtime.' },
      { term: 'Follow-through', gloss: 'the little settle at the end', meaning: 'The tail of a spring\'s motion past its target, read by users as physical weight settling rather than as unwanted delay.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Classify five interactions as tween or spring candidates: a tooltip on hover, a card dragged and released, a modal opened by click, a pull-to-refresh gesture, a settings toggle.' },
      { level: 'easy', prompt: 'Look up Framer Motion\'s default spring values (stiffness 100, damping 10). Is that closer to overdamped, critically damped, or underdamped? Justify from the numbers.' },
      { level: 'medium', prompt: 'A drag-to-dismiss sheet uses a 250ms tween regardless of how the user released it. Explain specifically what information the interface is discarding, and what a user does differently as a result.' },
      { level: 'medium', prompt: 'Using Apple\'s duration and bounce model, choose values for a notification banner that slides in (should feel calm, no oscillation) versus a game\'s collectible pickup (should feel playful and bouncy).' },
      { level: 'design', prompt: 'Design the exit animation for a side panel that can be closed by clicking an X (deterministic) or by dragging it off screen (gestural). Specify which primitive handles each trigger and why they should not share one animation definition.' },
    ],
    furtherReading: [
      { label: 'Motion, Spring', url: 'https://motion.dev/docs/spring', why: 'The primary docs for spring configuration in the library most cited in this lesson, with a live playground for stiffness and damping.' },
      { label: 'Apple, spring(duration:bounce:blendDuration:)', url: 'https://developer.apple.com/documentation/swiftui/animation/spring(duration:bounce:blendduration:)', why: 'Apple\'s own reference for the duration and bounce parameters that became the default spring model across iOS in 2023.' },
      { label: 'Josh Comeau, A friendly introduction to spring physics', url: 'https://www.joshwcomeau.com/animation/a-friendly-introduction-to-spring-physics/', why: 'The clearest public explanation of why stiffness, damping, and mass produce duration rather than accept it as an input.' },
      { label: 'Chrome for Developers, Create complex animation curves in CSS with linear()', url: 'https://developer.chrome.com/docs/css-ui/css-linear-easing-function', why: 'How to approximate a spring or bounce shape in plain CSS, and where that approach still falls short of a live gesture-driven spring.' },
      { label: 'Rauno Freiberg, Craft', url: 'https://rauno.me/craft', why: 'A shipped example of the tween/spring split applied consistently across one real interface.' },
    ],
    shipIt: {
      kind: 'snippet',
      name: 'Tween vs spring decision snippet',
      body: '// Ask this before writing the animation:\n// Did the user\'s own gesture produce a velocity this motion must honor?\n\nif (triggeredByGesture) {\n  // drag, swipe, flick, pull-to-refresh\n  use: spring({ stiffness: 200, damping: 24, mass: 1 })\n  // or Apple-style: spring(duration: 0.35, bounce: 0.15)\n} else {\n  // click, hover, programmatic state change\n  use: tween({ duration: 240, ease: \'cubic-bezier(0.4, 0, 0.2, 1)\' })\n}\n\n// If you find yourself capping a spring\'s duration to hit a number,\n// you wanted a tween. Switch primitives, do not fight the physics.',
    },
    demoCaption:
      'Same drag-to-dismiss card. On the left, a fixed tween ignores release velocity. On the right, a spring reads the flick and follows through.',
    demo: {
      archetype: 'toggle-fix',
      badLabel: 'Tween on dismiss',
      goodLabel: 'Spring on dismiss',
      subject: 'Drag-to-dismiss sheet',
      badCaption:
        'A tween assigns a fixed duration to the exit. A slow drag and a fast flick fly off at the same speed. The gesture stops mattering.',
      goodCaption:
        'A spring reads release velocity. Flick hard, it flies. Let go slow, it drifts. The physics model matches what the finger did.',
      badLines: [
        'user flicks the card down',
        'exit runs 250ms tween',
        'release velocity ignored',
        'slow drop and fast flick look identical',
        'gesture reads as dead',
      ],
      goodLines: [
        'user flicks the card down',
        'spring inherits release velocity',
        'stiffness 220, damping 26',
        'slow drop drifts, flick flies',
        'follow-through reads as weight',
      ],
    },
    posts: [
      {
        kind: 'X \u00b7 mechanism',
        hook: 'tween vs spring is not a taste call. it is a modeling call.',
        body:
          'tween vs spring is not a taste call. it is a modeling call.\n\ntween: fixed duration, known target, predictable curve. good for modal opens, tooltips, hover states.\n\nspring: physics. duration is emergent. good for anything a finger touched, because release velocity matters.\n\nmix them up and the app feels wrong for reasons no one can name.',
      },
      {
        kind: 'X \u00b7 design angle',
        hook: 'a bounce says this thing has weight. add it to a click and you are lying.',
        body:
          'a bounce says this thing has weight. add it to a click and you are lying.\n\na sheet you dragged has weight. a modal you clicked open does not. that is why ios uses springs on gestures and tweens on system alerts.\n\nrule of thumb: was the user\'s motion involved? no = tween. bounce without a physical source ages badly.',
      },
      {
        kind: 'X \u00b7 one-liner',
        hook: 'a spring\'s duration is emergent. do not fight it with force.',
        body:
          'a spring\'s duration is emergent. do not fight it with force.\n\nif you find yourself capping a spring\'s duration, you wanted a tween. pick the right primitive and stop.',
      },
    ],
    source: {
      label: 'Vault note: A spring bounces when the model requires momentum; a tween does not',
      url: 'https://motion.dev/docs/spring',
    },
  },

  {
    id: 'de-cm-motion-for-state',
    phase: 'Design engineering',
    part: 'Craft \u00b7 Motion',
    index: 'DE.CM.04',
    title: 'Motion should carry state, not repeat it',
    oneLiner:
      'If you can remove the animation and the user still knows what changed, the animation was decoration; if removal breaks comprehension, the motion was carrying meaning.',
    readTime: '~10 min read',
    diagram: '/lessons/de/de-cm-motion-for-state.png',
    diagramCaption:
      'Sonner toasts illustrating enter, stack, and exit as three distinct state-carrying moments.',
    whyItMatters:
      'This is the test that decides whether an animation ships. A toast fading in tells you it appeared, so that fade carries state. A card sliding in from the right when it could have simply appeared adds no information, so that slide is decoration. Linear\'s issue list and Vercel Geist both hold to one channel per state change for exactly this reason: the busier a modal, toast, or checkbox interaction gets, with color, scale, and bounce all firing together, the more it steals attention from the state that actually mattered.',
    learningObjectives: [
      'Apply the removal test (does deleting this animation change what a user understands) to decide whether a motion ships.',
      'Name the three state changes, enter, exit, reorder, that cannot be communicated without motion.',
      'Identify redundant motion channels on a single component and reduce them to the one that carries the state.',
      'Audit a real interface for enter/exit axis mismatches and correct them.',
      'Distinguish compounding motion debt from a single bad decision, and explain why it is harder to catch in review.',
    ],
    sections: [
      {
        heading: 'Enter, exit, and reorder are the honest jobs',
        body: 'Three state changes cannot be communicated without motion. Enter: something appeared where nothing was, and the eye misses it if it does not move, a toast that just materializes without a fade reads as a layout glitch, not a message. Exit: something is leaving, and the user needs to know it is gone rather than merely hidden behind another layer; an instantly disappearing element is genuinely ambiguous. Reorder: two list items swapped, and without a transition tracing the swap, it is close to impossible to tell which item moved versus which one is simply new. Everything else, hover, focus, active states, can usually be communicated with color, weight, or size alone. Motion there is optional, and optional motion is design debt: it looks like craft on day one and becomes forty inconsistent micro-animations to maintain by year two.',
      },
      {
        heading: 'Redundant motion is worse than no motion',
        body: 'A checkbox that changes color AND scales AND bounces AND draws a check is not more communicative than one that just draws the check. It is louder, not clearer. The human visual system treats each channel, color, size, position, opacity, as an independent signal, so running four signals for a single event forces the viewer to parse noise before finding the meaning. Vercel Geist and Linear\'s own product both keep motion restrained for exactly this reason: one channel per state change, deployed only when the change would otherwise go unnoticed. This is visible in usability testing too: users asked to describe what just happened after a four-channel checkbox animation take noticeably longer and report more uncertainty than after a one-channel version, even though the one-channel version contains strictly less motion.',
      },
      {
        heading: 'Match motion direction to conceptual direction',
        body: 'If a drawer comes from the right, it exits to the right. If a modal appears centered, it disappears in place rather than sliding off in some new direction. If pagination moves forward, the new page arrives from the right while the old one exits left, matching the reading direction the interaction implied. Mismatches, a drawer that opens from the right but closes by dropping down, break the spatial model a user builds automatically after the first interaction, and force a small re-parse every single time afterward, even after dozens of repetitions. This is the cheapest rule in this lesson to enforce in code review and the most commonly violated in practice, usually because the exit animation gets written by a different person, weeks later, who never watched the enter animation happen.',
      },
      {
        heading: 'A four-state audit: enter, exit, hover, reorder',
        body: 'Run this audit on any component before shipping it. Enter: does removing this motion make the appearance ambiguous or silent? If yes, keep it, one channel, ideally opacity plus a small positional offset under 20px. Exit: same question in reverse, and check the exit reuses the enter\'s axis, reversed. Hover and focus: can color, underline, or weight alone communicate the state? If yes, motion here is decoration and should be minimal or removed; if the surface genuinely cannot show hover without a shift, that is often a sign the resting state under-communicates its own interactivity, a design problem motion is being asked to paper over. Reorder: does the list ever change order client-side (drag-to-reorder, live-sorting a table, a leaderboard)? If yes, this is a mandatory motion case, not optional polish.',
      },
      {
        heading: 'Compounding: why motion debt is invisible one addition at a time',
        body: 'No single motion addition looks wrong in isolation, which is exactly what makes this failure mode dangerous. A designer adds a small scale-up to a button because it feels satisfying in a prototype. Someone else adds a color transition to the same button a week later because it feels unfinished without one. A third person adds a shadow lift because the button looked flat next to a newer component that has one. Each change passes review on its own merits; the product ends up feeling busy, and nobody can point to the single commit that caused it, because there was not one. The fix is not a redesign, it is the one-sentence test applied retroactively: for each motion currently on that button, would removing it change what the user understands? Anything that fails gets deleted, not redesigned.',
      },
      {
        heading: 'Sonner and Vaul as worked examples',
        body: 'Sonner\'s toast stack is a clean case study in state-carrying motion done with restraint: a new toast fades and slides up slightly (enter, one combined channel), older toasts compress and dim as they stack (reorder, communicating position in a queue), and a dismissed toast fades and collapses its space (exit, reversing the enter\'s direction). Nothing bounces, nothing overshoots, because none of these events involve anything with physical weight. Vaul\'s drawer takes the same restraint into a gestural context: the drawer enters and exits along the same vertical axis it can be dragged along, so users never encounter a mismatch between what their finger can do and what the interface visually promises it will do in return.',
      },
      {
        heading: 'Writing the removal test into a design review',
        body: 'Turn the core question into a checklist item every motion gets before it ships, not an afterthought applied to finished work: state the specific comprehension the animation is meant to protect, in one sentence, before building it. "This fade tells the user the toast appeared." "This slide direction tells the user the drawer will return the same way it came." If no one on the team can write that sentence for a proposed animation, it likely is not carrying state, and the honest move is to cut it rather than keep it and hope it earns its place later. Reviews that ask "does this look nice" produce accumulating decoration. Reviews that ask "what does removing this break" produce restraint that reads, correctly, as confidence.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-cm-motion-for-state-channels.svg',
        alt: 'One channel vs four channels for the same checkbox event',
        caption: 'Four signals firing at once for one state change is not more communicative, only louder.',
        diagramBrief: 'Two rows. Top row labeled "four channels": four small icons (color swatch, scale arrows, bounce arc, checkmark path) all firing at t=0 with overlapping timing bars. Bottom row labeled "one channel": a single checkmark path icon firing alone with a clean timing bar. Style: cream paper background, black ink, one accent color on the single surviving channel in the bottom row.',
      },
      {
        src: '/lessons/de/de-cm-motion-for-state-axis.svg',
        alt: 'Matched enter and exit axis for a drawer',
        caption: 'A drawer that enters from the right must exit to the right; reversing the axis breaks the spatial model.',
        diagramBrief: 'A simple side view of a screen edge with a drawer panel. Show two arrows: one labeled "enter" pointing left (drawer sliding in from the right edge), one labeled "exit, correct" pointing right retracing the same path. Add a third arrow in a muted, crossed-out style labeled "exit, wrong" pointing straight down, to show the mismatch case. Style: cream paper background, black ink, one accent color on the correct exit arrow, muted grey on the wrong one.',
      },
    ],
    takeaways: [
      'Ask "would removing this animation change what the user understands?" before shipping it.',
      'Enter, exit, and reorder are the three cases where motion is not optional.',
      'Use one channel of motion per state change, not four.',
      'Reverse motion must retrace the forward path along the same axis.',
    ],
    terms: [
      { term: 'State-carrying motion', gloss: 'animation that matters', meaning: 'Motion whose removal would make a state change harder or impossible for the user to detect.' },
      { term: 'Decorative motion', gloss: 'animation that is just nice to look at', meaning: 'Motion whose removal leaves the user\'s comprehension of the interface completely intact.' },
      { term: 'Enter', gloss: 'something showing up', meaning: 'The transition of an element from not present to visible, one of the three cases where motion is rarely optional.' },
      { term: 'Exit', gloss: 'something going away', meaning: 'An element leaving the interface, which needs its own transition distinct from, and usually reversing, its enter.' },
      { term: 'Reorder', gloss: 'items swapping places', meaning: 'Two or more elements exchanging position in a list or grid, communicated to the user through a transition tracing the swap.' },
      { term: 'Spatial model', gloss: 'where the user thinks things live', meaning: 'The mental map a user builds of where interface elements come from and return to, built automatically after a single interaction and broken by axis mismatches.' },
      { term: 'Motion channel', gloss: 'one kind of change', meaning: 'A single visual property (color, scale, position, opacity) used to communicate a state change; multiple channels firing together are read as noise, not emphasis.' },
      { term: 'Motion debt', gloss: 'clutter that crept in', meaning: 'Decorative animations added incrementally, each individually defensible, that accumulate into a product that reads as busy with no single identifiable cause.' },
      { term: 'Comprehension test', gloss: 'the removal question', meaning: 'The specific check of whether deleting a given animation would change what a user understands about a state change; the deciding test for whether that animation should exist.' },
      { term: 'Axis reversal', gloss: 'closing the way it opened', meaning: 'The rule that an exit transition should retrace an enter transition\'s direction, so the spatial model built on entry stays valid on exit.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Watch any toast notification in a product you use daily. Name its enter motion, its exit motion, and whether the two share an axis.' },
      { level: 'easy', prompt: 'Find one animation in a product you use that you could delete without the user losing any information. What makes it decorative rather than state-carrying?' },
      { level: 'medium', prompt: 'A settings toggle currently fires a color change, a scale bounce, and a small shadow pulse, all on the same tap. Apply the one-channel rule and decide which single channel should survive.' },
      { level: 'medium', prompt: 'A dropdown menu opens sliding down from a button but closes by fading out in place. Explain the specific mismatch this creates and how to fix it without adding a fourth animation.' },
      { level: 'design', prompt: 'Design the enter, exit, and reorder motion for a kanban board where cards can be dragged between columns. Specify the axis for each of the three cases and name which one, if any, is allowed to use a spring instead of a tween.' },
    ],
    furtherReading: [
      { label: 'Emil Kowalski, Sonner', url: 'https://sonner.emilkowal.ski', why: 'A live, inspectable example of enter, stack, and exit each carrying exactly one channel of state.' },
      { label: 'Vercel Geist, Motion', url: 'https://vercel.com/geist/motion', why: 'The design system this lesson\'s restraint principle is drawn from, applied consistently across a large production surface.' },
      { label: 'Apple, Human Interface Guidelines: Motion', url: 'https://developer.apple.com/design/human-interface-guidelines/motion', why: 'Apple\'s own framing of motion as a communication tool first, distinct from purely decorative animation.' },
      { label: 'Rauno Freiberg, Craft', url: 'https://rauno.me/craft', why: 'A working example of matched enter and exit axes across a real, shipped interface.' },
      { label: 'Emil Kowalski, essays on motion feel', url: 'https://emilkowal.ski', why: 'Ongoing practitioner writing on the difference between motion that clarifies and motion that merely decorates.' },
    ],
    shipIt: {
      kind: 'prompt',
      name: 'The removal test prompt',
      body: 'Paste this against any animation you are reviewing, your own or someone else\'s:\n\n"Here is an animation: [describe it in one sentence]. If I removed it entirely and the state change happened instantly with no transition, what would the user fail to understand or notice that they currently do understand or notice? List specifically what breaks. If nothing breaks, tell me this animation is decorative and should be cut or reduced to a single channel."',
    },
    demoCaption:
      'Same checkbox event, two motion budgets. The busy version fires four channels; the honest one fires the one channel the user needs.',
    demo: {
      archetype: 'toggle-fix',
      badLabel: 'Motion as decoration',
      goodLabel: 'Motion as state',
      subject: 'Checkbox toggled on',
      badCaption:
        'Color, scale, bounce, and check draw all fire together. Four signals for one event. Louder is not clearer; the user parses noise.',
      goodCaption:
        'One channel does the work. The check draws; nothing else moves. Removing that draw would obscure the change. Restraint reads as confidence.',
      badLines: [
        'background color animates in',
        'container scales up 8%',
        'container bounces on land',
        'check path draws over 240ms',
        'shadow lifts and drops',
      ],
      goodLines: [
        'check path draws over 180ms',
        'everything else is instant',
        'one channel per state change',
        'removal would break comprehension',
        'nothing competes with the meaning',
      ],
    },
    posts: [
      {
        kind: 'X \u00b7 mechanism',
        hook: 'the test for whether an animation ships is one sentence.',
        body:
          'the test for whether an animation ships is one sentence.\n\nif you remove it and the user still knows what changed, it was decoration. if removing it breaks comprehension, the motion was carrying meaning.\n\nenter, exit, reorder: state-carrying. hover, focus, active: usually not. everything else is design debt.',
      },
      {
        kind: 'X \u00b7 design angle',
        hook: 'a checkbox that fires color and scale and bounce and draws a check is not more communicative.',
        body:
          'a checkbox that fires color and scale and bounce and draws a check is not more communicative.\n\nit is louder. the brain reads each channel as a signal. four signals for one event = noise.\n\nlinear and geist keep motion restrained for this reason. one channel per state change. restraint reads as confidence.',
      },
      {
        kind: 'X \u00b7 one-liner',
        hook: 'reverse motion must retrace the forward path along the same axis.',
        body:
          'reverse motion must retrace the forward path along the same axis.\n\ndrawer opens from the right, it exits to the right. break the spatial model and the user re-parses every time.',
      },
    ],
    source: {
      label: 'Vault note: Motion should carry state, not repeat it',
      url: 'https://emilkowal.ski',
    },
  },

  {
    id: 'de-cm-reduced-motion',
    phase: 'Design engineering',
    part: 'Craft \u00b7 Motion',
    index: 'DE.CM.05',
    title: 'prefers-reduced-motion is a design decision, not a media query',
    oneLiner:
      'Setting reduced motion is not "turn animations off"; it is designing a second, complete motion language for users who cannot tolerate the first.',
    readTime: '~10 min read',
    diagram: '/lessons/de/de-cm-reduced-motion.png',
    diagramCaption:
      'MDN prefers-reduced-motion documentation with code samples for preserve, shorten, and replace tiers.',
    whyItMatters:
      'Apple\'s own 2021 accessibility data put Reduce Motion adoption at roughly a quarter of iPhone users, and NHANES survey data found vestibular dysfunction in 35.4 percent of US adults over 40, making parallax and large translations physically nauseating rather than merely annoying for a meaningful share of any audience. A blanket disable strips useful state cues (enter, exit, reorder) and leaves the interface confusing rather than accessible. The correct response is a parallel spec, at the token layer, that keeps state-carrying motion and drops everything else.',
    learningObjectives: [
      'Explain why setting animation: none for prefers-reduced-motion: reduce is abandonment, not accessibility, using the WCAG 2.3.3 criterion.',
      'Sort a real animation inventory into the three tiers: preserve, shorten, replace.',
      'Cite the real-world scale of this decision using NHANES vestibular-dysfunction data and Apple\'s Reduce Motion adoption figure.',
      'Wire a reduced-motion variant into a token system so it ships automatically instead of per-component.',
      'Design a reduced-motion spec for a product whose primary motion is heavy (continuous motion, parallax, springs).',
    ],
    sections: [
      {
        heading: 'The default off is not accessibility, it is abandonment',
        body: 'When @media (prefers-reduced-motion: reduce) simply sets transition: none across the board, a modal\'s enter animation disappears entirely and the modal pops in with no signal at all. A user with vestibular sensitivity now has to track state changes with no visual cue that one occurred. The fix: preserve opacity transitions, which rarely trigger vestibular symptoms, and drop translate and scale instead. A 100ms fade replaces a 250ms slide, and the user still gets the "this appeared" signal, just without the motion that could make them sick. This is why WCAG\'s Success Criterion 2.3.3, Animation from Interactions, is written as "motion animation triggered by interaction can be disabled, unless essential," a criterion about giving users control, not a mandate to strip every visual cue a state change relied on.',
      },
      {
        heading: 'The three tiers: preserve, shorten, replace',
        body: 'Preserve: opacity transitions, color transitions, and small scale changes under roughly 5 percent, these almost never trigger vestibular issues and can stay exactly as designed. Shorten: any duration over 200ms drops toward 100ms; the motion still communicates the state change, just resolves faster, reducing the window of exposure. Replace: parallax, long translates, spring bounces, and continuous background motion (an auto-rotating hero graphic, an infinite marquee) get swapped for a fade or an instant transition, because these are the categories most consistently linked to nausea and dizziness in vestibular research. Build this into the token system directly: every semantic motion token gets a reduced variant defined alongside it. An engineer who writes transition: var(--modal-enter) once gets the accessible fallback automatically; without token support, this becomes per-component labor that reliably gets skipped under deadline pressure.',
      },
      {
        heading: 'Test it by living inside it',
        body: 'Turn on reduced motion in your own OS during development, not only during QA at the end. On macOS: Settings, Accessibility, Display, Reduce motion. On Windows: Settings, Accessibility, Visual effects, Animation effects. Then work inside your own product for a full day, not five minutes. What you notice will not be that animations are gone; it will be exactly which cues you personally depended on without realizing it. Reordering a list, opening a menu, dismissing a toast: if any of these becomes unclear once the motion is reduced, the primary version was carrying more state through motion than anyone had documented, and the reduced fallback needs to carry that same state through a different, non-motion channel, most often color or an explicit label.',
      },
      {
        heading: 'The real numbers behind the design decision',
        body: 'This is not a small edge case. NHANES survey data found vestibular dysfunction in 35.4 percent of US adults aged 40 and older, roughly 69 million people, with the rate climbing to 85 percent for adults over 80. Separately, Apple\'s own 2021 accessibility figures put Reduce Motion adoption at close to 25 percent of iPhone users, meaning roughly one in four visits to a well-trafficked iOS-heavy product is already asking for the reduced experience whether or not the product ships one. Ignoring the setting does not make the population asking for it smaller; it just means their experience of your product is silently broken, in a way that never shows up in a bounce-rate dashboard as "reduced motion problem," only as an unexplained drop-off.',
      },
      {
        heading: 'Reduced does not mean equal, it means differently equivalent',
        body: 'A common mistake treats the reduced spec as a lesser version of the primary spec, something to finish last and budget least for. The more accurate frame: it is a second, complete motion language that has to communicate the same set of state changes as the first, using a smaller, safer palette of techniques. A drawer that slides in the primary spec and simply appears in the reduced spec has not been made accessible, it has had its enter state deleted; a drawer that fades in place in the reduced spec, at a shortened duration, has been translated into a different but equally legible vocabulary. The bar for "reduced motion done correctly" is not "nothing moves," it is "every state change the primary spec communicates through motion still gets communicated somehow."',
      },
      {
        heading: 'Where this fails in practice',
        body: 'The most common real-world failure is not malice, it is scope. A team ships a hero animation, a parallax section, and a set of spring-based card reveals on a landing page, tests all of it thoroughly, ships it, and never opens Accessibility settings once during the entire process. @media (prefers-reduced-motion: reduce) either does not exist in the stylesheet at all, or exists only as a global animation-duration: 0.01ms !important rule bolted on at the very end by whoever remembered WCAG existed during a pre-launch checklist. That global override is better than nothing, since it prevents literal nausea-inducing motion, but it is the "abandonment" pattern from the first section wearing a different disguise: every state cue the primary motion carried is now gone, replaced with nothing.',
      },
      {
        heading: 'A minimal, shippable reduced-motion spec',
        body: 'A workable baseline, portable across most component libraries: keep every opacity-only transition as-is. Cap every remaining duration at 100 to 150ms regardless of its primary value. Replace every translate, scale over 10 percent, and spring with a plain opacity crossfade at the capped duration. Freeze every continuous or looping animation (marquees, auto-playing carousels, ambient background motion) entirely, since these have no interaction trigger to disable and run indefinitely by default. Wire all four rules into the token layer\'s reduced variants rather than a single blanket media query, so a component author never has to remember to apply them by hand. This spec is intentionally conservative; a team with real user research on which motions their specific audience tolerates can loosen it, but this baseline will not make anyone\'s experience worse.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-cm-reduced-motion-tiers.svg',
        alt: 'The three reduced-motion tiers: preserve, shorten, replace',
        caption: 'Not every animation needs the same reduced-motion treatment; sorting them into three tiers keeps state cues intact.',
        diagramBrief: 'Three columns labeled Preserve, Shorten, Replace. Under Preserve: small icons for opacity fade, color change, small scale under 5 percent. Under Shorten: an icon showing a duration bar cut roughly in half, labeled "200ms+ to ~100ms". Under Replace: icons for parallax layers, a long translate arrow, a bounce/spring squiggle, each with an arrow pointing to a plain fade icon. Style: cream paper background, black ink, one accent color marking the Replace column\'s arrows.',
      },
      {
        src: '/lessons/de/de-cm-reduced-motion-stats.svg',
        alt: 'How many people this decision affects',
        caption: 'Roughly a quarter of iPhone users enable Reduce Motion; vestibular dysfunction affects over a third of US adults over 40.',
        diagramBrief: 'Two simple stat blocks side by side, each a filled-circle icon-array (like a waffle chart) at roughly 25 percent and roughly 35 percent filled. Label the first "iPhone users with Reduce Motion enabled, Apple 2021" and the second "US adults 40+ with measured vestibular dysfunction, NHANES". Style: cream paper background, black ink, one accent color for the filled portion of each circle array.',
      },
    ],
    takeaways: [
      'Reduced motion is a designed alternative, not the primary spec minus animations.',
      'Preserve fades; shorten durations; replace translates and parallax.',
      'Ship token variants so engineers pick reduced motion for free.',
      'Live inside reduced motion for a day before shipping the primary motion.',
    ],
    terms: [
      { term: 'prefers-reduced-motion', gloss: 'the reduce-animations setting', meaning: 'A CSS media feature that reports whether the user\'s OS has been set to minimize non-essential motion, checkable in both CSS and JavaScript.' },
      { term: 'Vestibular sensitivity', gloss: 'getting motion sick from a screen', meaning: 'Susceptibility to dizziness, nausea, or disorientation triggered by visual motion, including on-screen animation, not only physical movement.' },
      { term: 'Parallax', gloss: 'layers moving at different speeds', meaning: 'Background and foreground elements animating at different rates to simulate depth, one of the categories most reliably linked to vestibular discomfort.' },
      { term: 'Reduced variant', gloss: 'the accessible version of a token', meaning: 'A motion token\'s paired alternate value, defined alongside the primary token and applied automatically when the OS signals reduce.' },
      { term: 'Preserve tier', gloss: 'the motion that is fine to keep', meaning: 'Low-risk motion categories, opacity and color transitions and small scale changes, that rarely trigger vestibular symptoms and can ship unchanged.' },
      { term: 'Replace tier', gloss: 'the motion that has to go', meaning: 'High-risk categories, parallax, long translates, spring bounces, continuous motion, that get swapped entirely for a fade or instant transition.' },
      { term: 'WCAG 2.3.3', gloss: 'the animation accessibility rule', meaning: 'The Level AAA success criterion stating that motion animation triggered by an interaction can be disabled, unless it is essential to the function or information being conveyed.' },
      { term: 'NHANES', gloss: 'the government health survey behind the stats', meaning: 'The National Health and Nutrition Examination Survey, the US dataset behind the 35.4 percent vestibular dysfunction figure cited in this lesson.' },
      { term: 'Global override', gloss: 'turning everything off at once', meaning: 'A single blanket media query rule (animation-duration: 0.01ms !important) applied everywhere, which prevents nausea but also deletes every state cue motion was carrying.' },
      { term: 'Motion equivalence', gloss: 'the reduced version should still work', meaning: 'The standard that a reduced-motion spec must communicate every state change the primary spec does, through a different but equally legible set of techniques.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Turn on Reduce Motion (or the Windows equivalent) on your own device right now and open a product you use daily. Name one thing you notice is different.' },
      { level: 'easy', prompt: 'Sort these five motion effects into preserve, shorten, or replace: a toast opacity fade, a 400ms parallax hero, a button color transition, a spring-bounce success checkmark, a modal that slides 300ms.' },
      { level: 'medium', prompt: 'A team ships @media (prefers-reduced-motion: reduce) { * { animation: none !important; } } as their entire reduced-motion spec. Name two specific state changes this breaks and what each should be replaced with instead.' },
      { level: 'medium', prompt: 'Using the NHANES figure (35.4 percent of US adults 40+) and Apple\'s 25 percent iPhone figure, write two sentences a product manager could use to justify prioritizing reduced-motion work in a planning meeting.' },
      { level: 'design', prompt: 'Design the reduced-motion spec for a stock trading app\'s live price ticker, which currently uses continuous scrolling motion and a spring-based flash on every price change. Specify exactly what changes and what stays.' },
    ],
    furtherReading: [
      { label: 'MDN, prefers-reduced-motion', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion', why: 'The primary technical reference for the media feature, with code samples for the reduce and no-preference values.' },
      { label: 'W3C, Understanding SC 2.3.3 Animation from Interactions', url: 'https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html', why: 'The official rationale behind the WCAG criterion, explaining why it targets disabling motion, not removing state cues.' },
      { label: 'WebAIM, Vestibular disorders and animated content', url: 'https://webaim.org/techniques/vestibular/', why: 'Practical guidance on which specific motion categories (parallax, large translates) most reliably trigger vestibular symptoms.' },
      { label: 'Agrawal et al., Disorders of balance and vestibular function in US adults (NHANES)', url: 'https://europepmc.org/article/med/19468085', why: 'The population-level study behind the 35.4 percent US adult vestibular dysfunction figure cited in this lesson.' },
      { label: 'Apple, Human Interface Guidelines: Motion', url: 'https://developer.apple.com/design/human-interface-guidelines/motion', why: 'Apple\'s own framing of Reduce Motion as a design requirement across the entire platform, not an isolated CSS toggle.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Reduced-motion tier checklist',
      body: '- List every animation in the product. For each, assign a tier: preserve, shorten, or replace.\n- Preserve tier: confirm it is opacity, color, or under-5-percent scale only.\n- Shorten tier: confirm every duration over 200ms has a reduced value at 100 to 150ms.\n- Replace tier: confirm parallax, long translates, springs, and continuous motion all have a fade or instant fallback defined.\n- Confirm the fallback lives in the token file, not copy-pasted per component.\n- Turn on Reduce Motion in your own OS and use the product for at least one full session before sign-off.',
    },
    demoCaption:
      'Same modal, two motion specs. The blanket off strips the state cue; the designed reduced variant keeps the "it appeared" signal without the translate.',
    demo: {
      archetype: 'toggle-fix',
      badLabel: 'Blanket off',
      goodLabel: 'Designed reduced',
      subject: 'Modal enter under reduce',
      badCaption:
        'transition: none across the board. The modal pops in with no signal. A vestibular user now tracks state changes they cannot see. Not accessibility, abandonment.',
      goodCaption:
        'A parallel spec. Preserve the opacity fade, drop the translate, shorten from 240ms to 120ms. The user still gets the "this appeared" cue without the trigger.',
      badLines: [
        'modal enter: transition: none',
        'no opacity fade',
        'no translate',
        'state change lands with no signal',
        'user with sensitivity: lost',
      ],
      goodLines: [
        'modal enter: opacity 0 to 1',
        'duration shortened to 120ms',
        'translate replaced with fade',
        'state change still legible',
        'reduced variant ships from the token',
      ],
    },
    posts: [
      {
        kind: 'X \u00b7 mechanism',
        hook: 'prefers-reduced-motion is not a switch. it is a second motion language.',
        body:
          'prefers-reduced-motion is not a switch. it is a second motion language.\n\ndefault off = state changes disappear. modal pops in with no signal. vestibular user loses the cue.\n\nthe correct spec has three tiers. preserve opacity. shorten anything over 200ms. replace translates and parallax. ships from the token layer or gets skipped.',
      },
      {
        kind: 'X \u00b7 design angle',
        hook: 'turn on reduced motion in your os for a day. work in your product.',
        body:
          'turn on reduced motion in your os for a day. work in your product.\n\nwhat you notice is not the missing animation. it is the cues you depended on. list reorders, menu opens, toast dismisses.\n\nif any of those become unclear, your primary motion was carrying more state than you documented.',
      },
      {
        kind: 'X \u00b7 one-liner',
        hook: 'a blanket disable is not accessibility. it is abandonment.',
        body:
          'a blanket disable is not accessibility. it is abandonment.\n\nreduced motion is a designed alternative. preserve fades, shorten durations, replace translates. ship it from the token layer.',
      },
    ],
    source: {
      label: 'Vault note: prefers-reduced-motion is a design decision, not a media query',
      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion',
    },
  },

  {
    id: 'de-cm-stagger',
    phase: 'Design engineering',
    part: 'Craft \u00b7 Motion',
    index: 'DE.CM.06',
    title: 'Stagger is choreography; timing turns a list into a phrase',
    oneLiner:
      'A stagger is not N items each delayed by 50ms; it is choosing what the list is supposed to feel like as a single phrase, then picking numbers that deliver it.',
    readTime: '~10 min read',
    diagram: '/lessons/de/de-cm-stagger.png',
    diagramCaption:
      'Motion.dev stagger examples showing how per-child delay shapes a group into a readable sequence.',
    whyItMatters:
      'Lists animated all at once feel like one thing appearing. Lists animated with a stagger feel like several things arriving in a deliberate sequence, and that sequence tells the user how to read them: cmdk\'s command palette reveals results top to bottom at roughly 50 to 100ms per item, setting scan order without a single word of instruction. The delay, direction, and total duration are the choreography. Pick badly and a ten-item list at 100ms per step takes a full second to finish while the user has already moved on; pick well and the eye simply follows.',
    learningObjectives: [
      'Compute the total sequence duration for a stagger given item count and per-item delay, and check it against the 500ms ceiling.',
      'Choose a stagger direction (top-to-bottom, center-out, origin-first) that matches a stated communicative intent, not a default.',
      'Explain why stagger effects degrade past roughly twenty items and apply windowing to fix it.',
      'Compare fixing per-item delay versus fixing total duration as two different stagger strategies.',
      'Design a windowed, directional stagger sequence for a long, dynamically loaded list.',
    ],
    sections: [
      {
        heading: 'Stagger delay lives between 30 and 80ms per item',
        body: 'Under 30ms and the items blur into a single reveal, perceptually one group rather than a sequence. Over 80ms and the last item feels late; a ten-item list at 100ms stagger takes a full second just to finish revealing, and by then the user\'s attention has already moved elsewhere. The sweet spot for most UI lists sits at 40 to 60ms. Motion\'s own stagger() helper, used via delayChildren in a variant\'s transition object, defaults examples around 0.05 to 0.1 seconds (50 to 100ms) in its documentation. Adjust by list length: a three-item list can afford 80ms per step without feeling slow; a fifteen-item list needs 30 to 40ms per step or the whole sequence becomes a wait rather than a flourish. The total sequence, start of the first item to end of the last, should stay under 500ms.',
      },
      {
        heading: 'Direction encodes hierarchy',
        body: 'Top-to-bottom stagger reads as reading order, matching how the eye already scans a page. Center-out stagger reads as focal emphasis, implying the middle item is primary. Random stagger reads as noise, because it maps to no interpretation a viewer can form quickly. Origin-first, radiating outward from the point of interaction, reads as "these results came from your click." Each direction is a semantic claim about what matters, not a stylistic flourish, so pick the one that matches how the user is meant to scan the result. iOS animates home-screen folder contents outward from the tapped folder on close, explicitly telling the user the space is contracting back to where they touched it. Direction carries more signal than duration does; get direction right and small timing imperfections become nearly invisible to the user.',
      },
      {
        heading: 'Stagger dies at scale; use windowing',
        body: 'Beyond roughly twenty items, per-child animation starts costing real frame time, twenty simultaneous layout transitions is not free on the main thread, and the sequence stops reading as intentional choreography because a viewer cannot mentally track that many discrete events landing one after another. Motion\'s own stagger API keeps technically working past twenty items with no built-in limit, which is exactly the trap: the code runs fine, but the visual effect breaks down long before any error appears in a console. At scale, animate the container\'s own enter instead of each child individually, or window the effect: stagger only the first handful of visible items and let everything below the fold arrive instantly, un-staggered, the moment it scrolls into view. If a list is routinely long, treat stagger as a decorative touch reserved for the first N items only.',
      },
      {
        heading: 'Named products and their stagger cadence',
        body: 'Paco Coursey\'s cmdk, the library behind most command-palette implementations across the design-tool and developer-tool ecosystem, reveals filtered results with a light top-to-bottom cadence tuned to feel instant rather than choreographed, since users are actively typing and expect results to simply be there. iOS\'s own home-screen folder animation uses an origin-first radiate that scales with how many icons are inside the folder, capping the total sequence well under half a second even for a full sixteen-icon folder. Both examples share the same discipline this lesson argues for: the stagger\'s total duration was clearly capped first, and the per-item delay was solved for afterward, rather than picking a comfortable per-item number and letting the total length grow unbounded as content scales.',
      },
      {
        heading: 'Choosing between duration-per-item and total-duration-first',
        body: 'There are two ways to specify a stagger, and they produce very different behavior as list length changes. Fixing the per-item delay (say, 50ms) means total duration scales linearly with item count: a 5-item list finishes in 250ms, a 20-item list takes a full second. Fixing the total duration instead (say, 400ms regardless of count) and dividing it across however many items exist keeps the sequence feeling consistent regardless of list length, at the cost of individual items blurring together once there are enough of them that the per-item delay drops below the 30ms floor. Most production systems default to fixing per-item delay because it is simpler to implement, then add a windowing cap once real usage reveals lists longer than the design was tested against.',
      },
      {
        heading: 'A worked example: a dashboard reveal',
        body: 'A dashboard with a summary row, a chart, and a data table below it is a natural stagger candidate, and the order should match how a user actually reads the page rather than how the components happen to be defined in code. Summary row first (0ms), because it answers the question "what changed" fastest. Chart second (around 80 to 120ms later), because it needs the summary\'s framing to be meaningful. Table last (around 150 to 200ms after the summary), because it is the detail view most users only consult after the headline numbers register. Total sequence: comfortably under 300ms, well inside the recommended 500ms ceiling. Reveal all three simultaneously instead and the page reads as one undifferentiated event, with reading order left entirely to whichever element happens to be visually largest.',
      },
      {
        heading: 'The phrase comes before the numbers',
        body: 'Every mistake covered in this lesson traces back to the same root cause: picking a per-item delay number before deciding what the sequence is supposed to communicate. A designer who starts with "this is a reading-order reveal" or "this is a focal-emphasis reveal" or "this is a your-click-caused-this reveal" arrives at the right direction automatically, and the numbers, 40 to 60ms, under 500ms total, windowed past twenty items, become straightforward constraints to satisfy rather than arbitrary choices to defend in a design review. A designer who starts with a number, "let\'s do 50ms stagger," has skipped the actual design decision and is choreographing without knowing what the choreography is supposed to say. Decide the phrase. Then, and only then, pick the numbers that deliver it.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-cm-stagger-timing.svg',
        alt: 'Stagger timing sweet spot between 30 and 80ms',
        caption: 'Under 30ms items blur into one reveal; over 80ms the last item feels late.',
        diagramBrief: 'A horizontal number line from 0ms to 120ms per item. Mark a shaded "sweet spot" band from 40 to 60ms. Below 30ms, label "blurs into one group". Above 80ms, label "last item feels late". Show five small dots along the line at 20, 40, 50, 60, 90ms with a face-like glyph indicating perceived quality (blurred, good, good, good, late). Style: cream paper background, black ink, one accent color on the sweet-spot band.',
      },
      {
        src: '/lessons/de/de-cm-stagger-directions.svg',
        alt: 'Four stagger directions and what each implies',
        caption: 'Top-to-bottom, center-out, origin-first, and random each make a different claim about hierarchy.',
        diagramBrief: 'Four small grids of dots (a 3x3 or list layout), each showing a numbered sequence 1 through 9 in a different pattern: top-to-bottom reading order, radiating from the center outward, radiating from one corner (origin-first), and a scattered random order. Label each grid with its name and a one-word implication (reading order, focal emphasis, "came from your click", noise). Style: cream paper background, black ink, one accent color per sequence number.',
      },
    ],
    takeaways: [
      'Aim for 40 to 60ms per item; total sequence under 500ms.',
      'Pick a direction that encodes reading order or focal emphasis.',
      'Stagger works up to about twenty items; past that, window it.',
      'The phrase comes first, the numbers second; know what the sequence is saying.',
    ],
    terms: [
      { term: 'Stagger', gloss: 'a delayed animation for a list', meaning: 'Applying an increasing per-child delay to a group of elements so they animate as a readable sequence rather than all at once.' },
      { term: 'Stagger delay', gloss: 'the gap between items', meaning: 'The time offset between one child\'s animation start and the next child\'s start, typically 30 to 80ms in UI lists.' },
      { term: 'Reading direction (stagger)', gloss: 'top-to-bottom order', meaning: 'A stagger pattern matching the viewer\'s natural text-scan order, implying the sequence should be read in that order.' },
      { term: 'Center-out', gloss: 'starting from the middle', meaning: 'A stagger radiating outward from a central item, implying that item carries the most focal importance.' },
      { term: 'Origin-first', gloss: 'starting where you clicked', meaning: 'A stagger beginning at the specific point of user interaction and radiating outward, implying the result set was caused by that action.' },
      { term: 'Windowing', gloss: 'only animating the first few', meaning: 'Applying stagger only to the first N visible items in a long list and letting the remainder appear instantly, to avoid the sequence collapsing at scale.' },
      { term: 'delayChildren', gloss: 'the prop that staggers a list', meaning: 'The Motion for React transition property, often paired with the stagger() helper, that delays each child\'s animation start relative to its siblings.' },
      { term: 'Total sequence duration', gloss: 'how long the whole reveal takes', meaning: 'The time from the first item\'s animation start to the last item\'s animation end, which should stay under roughly 500ms regardless of list length.' },
      { term: 'Per-item vs total-first stagger', gloss: 'two ways to compute the delays', meaning: 'Fixing a constant delay per item (total time scales with list length) versus fixing a total duration and dividing it across however many items exist.' },
      { term: 'Choreography', gloss: 'the overall feel of the sequence', meaning: 'The combined effect of delay, direction, and duration across a staggered group, considered as a single communicative gesture rather than N separate animations.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Open a command palette or search-as-you-type interface you use daily. Estimate its per-item stagger delay by counting how long the full result set takes to finish revealing.' },
      { level: 'easy', prompt: 'A five-item list uses an 80ms per-item stagger. Compute the total sequence duration and say whether it stays under the 500ms ceiling.' },
      { level: 'medium', prompt: 'A fifteen-item notification list uses a fixed 100ms per-item stagger with no windowing. Compute the total duration and explain, using this lesson\'s thresholds, exactly what a user experiences as a result.' },
      { level: 'medium', prompt: 'Redesign the same fifteen-item list using a total-duration-first approach capped at 450ms. What per-item delay does that require, and does it fall inside the 30 to 80ms comfort range?' },
      { level: 'design', prompt: 'Design the reveal sequence for a photo grid of 40 thumbnails loading after a search. Specify the direction, the windowing cutoff, the per-item delay for the windowed items, and what happens to the remaining thumbnails.' },
    ],
    furtherReading: [
      { label: 'Motion, React transitions and stagger', url: 'https://motion.dev/docs/react-transitions', why: 'The primary API reference for stagger() and delayChildren, including the from option controlling direction.' },
      { label: 'Motion, Stagger', url: 'https://motion.dev/docs/stagger', why: 'A focused reference on the stagger helper itself, showing the default 0.05 to 0.1 second range this lesson\'s numbers are drawn from.' },
      { label: 'Paco Coursey, cmdk', url: 'https://cmdk.paco.me', why: 'A widely used, inspectable example of stagger cadence tuned for a fast, typing-driven interaction rather than a slow reveal.' },
      { label: 'Apple, Human Interface Guidelines: Motion', url: 'https://developer.apple.com/design/human-interface-guidelines/motion', why: 'Apple\'s framing of directional, origin-aware animation, the basis for the iOS folder-open example in this lesson.' },
      { label: 'Emil Kowalski, writing on motion feel', url: 'https://emilkowal.ski', why: 'Practitioner notes on choosing choreography intent before picking stagger numbers.' },
    ],
    shipIt: {
      kind: 'rubric',
      name: 'Stagger choreography rubric',
      body: '- Can you state, in one sentence, what the sequence is supposed to communicate (reading order, focal emphasis, origin of action)? If not, stop before setting any numbers.\n- Is the per-item delay between 30 and 80ms, adjusted down for longer lists?\n- Is the total sequence duration under 500ms regardless of list length?\n- Past twenty items, is the effect windowed to the first visible N rather than applied to the full list?\n- Does the direction (top-to-bottom, center-out, origin-first) match the stated communicative intent, not just whatever the code\'s default iteration order happens to produce?',
    },
    demoCaption:
      'Same five list items, two phrasings. The all-at-once version reads as one event; the staggered one sets a reading order without instructions.',
    demo: {
      archetype: 'sequence',
      badLabel: 'All at once',
      goodLabel: 'Staggered',
      subject: 'Dashboard list reveal',
      badCaption:
        'Every item lands on the same frame. The list reads as a single event. Reading order is set by the eye finding the top, not by the motion.',
      goodCaption:
        '50ms between children, top-to-bottom, total under 300ms. The sequence tells the user how to scan. Direction encodes hierarchy; timing sets tempo.',
      badSequence: [
        'frame 1: all five items visible',
        'no per-child delay',
        'no reading direction',
        'perceptually one reveal',
        'sequence carries no meaning',
      ],
      goodSequence: [
        'item 1 enters at 0ms',
        'item 2 enters at 50ms',
        'item 3 enters at 100ms',
        'item 4 enters at 150ms',
        'item 5 enters at 200ms',
      ],
    },
    posts: [
      {
        kind: 'X \u00b7 mechanism',
        hook: 'stagger is not N items delayed by 50ms. it is a phrase.',
        body:
          'stagger is not N items delayed by 50ms. it is a phrase.\n\ntop-to-bottom reads as reading order. center-out reads as focal emphasis. origin-first reads as "these came from your click." random reads as noise.\n\npick the phrase first. then pick the numbers.',
      },
      {
        kind: 'X \u00b7 design angle',
        hook: '40 to 60ms per child. total sequence under 500ms. adjust by list length.',
        body:
          '40 to 60ms per child. total sequence under 500ms. adjust by list length.\n\nunder 30ms: items blur into one reveal. over 80ms: last item feels late.\n\npast twenty items stagger dies. the user cannot track that many events. window the first few and let the rest arrive instantly.',
      },
      {
        kind: 'X \u00b7 one-liner',
        hook: 'direction is a stronger signal than duration. get direction right and small timing errors go invisible.',
        body:
          'direction is a stronger signal than duration. get direction right and small timing errors go invisible.\n\nknow what the sequence is saying before you set the delay.',
      },
    ],
    source: {
      label: 'Vault note: Stagger is choreography; timing turns a list into a phrase',
      url: 'https://motion.dev/docs/react-transitions',
    },
  },

  {
    id: 'de-cm-framer-motion',
    phase: 'Design engineering',
    part: 'Craft \u00b7 Motion',
    index: 'DE.CM.07',
    title: 'Framer Motion is a design system for movement',
    oneLiner:
      'Motion (formerly Framer Motion), now independent with over 30 million npm downloads a month, is not an animation library; it is a design system that models state, layout, and gesture as declarative primitives.',
    readTime: '~10 min read',
    diagram: '/lessons/de/de-cm-framer-motion.png',
    diagramCaption:
      'Motion React docs with inline demos for variants, layout animations, and AnimatePresence.',
    whyItMatters:
      'Once a project has more than five components with motion, hand-rolling transitions with CSS or requestAnimationFrame stops scaling: different components disagree on easing, exit animations get lost the instant an element unmounts, and shared-element transitions become close to impossible to hand-code reliably. Framer spun the library out as the fully independent Motion project in November 2024, and it now sees over 30 million downloads a month on npm, used by companies including Figma. It treats motion the way a design system treats color: declarative props, reusable variants, layout as a first-class primitive.',
    learningObjectives: [
      'Name the four Motion primitives (variants, layout, AnimatePresence, gesture props) and the specific problem each one solves.',
      'Explain why the layout prop uses the FLIP technique and why that keeps it performant on properties CSS transitions handle poorly.',
      'Trace the November 2024 Framer Motion to Motion rebrand and what it changed versus what stayed the same.',
      'Compare Motion, GSAP, and native CSS as three different tools for the same class of animation problem.',
      'Design a motion spec for a component that needs layout, exit, and gesture behavior simultaneously, assigning each to the right primitive.',
    ],
    sections: [
      {
        heading: 'Variants are the tokens',
        body: 'A variants object maps named states, hidden, visible, hover, to property targets, and children can inherit their parent\'s variant automatically to stay in sync without extra wiring. This mirrors semantic motion tokens exactly: name the intent (menu-open) and let every component resolve it independently. Coordinating a whole modal, backdrop, and content group by naming one shared variant is a single line of code, no manual sequencing of three separate setState calls. Without variants, coordinating multiple elements means writing coupled callbacks, setOpen, then setAnimating, then onComplete, threaded through refs and effect dependencies, which is exactly where hand-rolled motion code becomes fragile and hard to review. Variants make the state machine an animation is actually running visible directly in the JSX, instead of scattered across imperative event handlers a reviewer has to trace by hand.',
      },
      {
        heading: 'Layout animations are the killer feature',
        body: 'The layout prop tells Motion to measure a component\'s position and size before and after any state change, then interpolate smoothly between the two, using the FLIP technique (First, Last, Invert, Play) under the hood rather than animating layout properties directly, which is why it stays performant even on properties like width and height that CSS transitions handle poorly. This lets a developer animate list reorders, expanding cards, hero-to-detail transitions, and shared-element navigation without writing a single line of transform math by hand. LayoutGroup coordinates layout animations across multiple sibling components so they move in relation to each other correctly. AnimatePresence catches exit animations for components that are about to unmount, keeping them mounted just long enough to finish playing their farewell motion. Together, these three primitives remove the entire category of bug that used to define motion engineering: the element vanished from the DOM before I could animate it leaving.',
      },
      {
        heading: 'Gestures share the API with animations',
        body: 'Motion\'s useDrag, whileHover, whileTap, and whileInView props route gesture input into the same declarative animation targets that state changes use. Dragging a card and animating its shadow at the same time is handled entirely through props, no separate event listener setup, no manual velocity tracking. This unified surface, where state changes and gesture input both drive the same animate target through the same API, is exactly why the library reads as a design system rather than a utility: one mental model covers hover, tap, drag, scroll, and programmatic state changes, instead of four separate mental models bolted together. The framework\'s actual job is hiding the imperative plumbing so a developer can describe motion the way a stylesheet describes appearance, declaratively, rather than as a sequence of manual steps.',
      },
      {
        heading: 'What changed when Framer Motion became Motion',
        body: 'In November 2024, creator Matt Perry spun the library out from Framer entirely, rebranding it Motion and moving it to its own home at motion.dev, with Framer\'s blessing and continued support. The move reflected the library\'s reach well beyond Framer\'s own product: Motion had already become the default React animation solution independent of any single company\'s tooling, and by 2025 it was seeing over 30 million downloads a month on npm, used by companies including Figma. The rebrand also opened a vanilla JavaScript API alongside the React one, and new APIs built on the browser\'s native View Transitions feature, meaning teams can now reach for Motion\'s layout-animation quality even in projects that are not using React at all. The React-specific package import changed to motion/react, but the underlying primitives, variants, layout, AnimatePresence, stayed the same.',
      },
      {
        heading: 'Motion vs GSAP vs plain CSS: picking the right tool',
        body: 'Three real options exist for anything beyond a basic hover transition, and they solve different problems. Motion for React wins when animation needs to be driven by component state and React\'s render cycle, variants and AnimatePresence exist specifically for that integration. GSAP, which became completely free for commercial use in April 2025 after Webflow\'s acquisition, including every previously members-only plugin like SplitText and MorphSVG, wins for framework-agnostic timeline sequencing, complex scroll-triggered choreography via ScrollTrigger, and projects that are not React at all. Plain CSS, boosted by the linear() easing function since late 2023 and by native View Transitions in Chrome since 2023 and Safari since version 18 in 2024, increasingly covers simple enter and exit cases without any library at all, meaning the honest first question is not "which animation library" but "does this even need one."',
      },
      {
        heading: 'cmdk as a worked example of the model',
        body: 'Paco Coursey\'s cmdk, the command-palette library underneath many developer tools\' quick-search interfaces, is built on these exact primitives rather than custom animation code. Opening the palette animates a shared variant across the backdrop and panel together. Filtering as the user types reorders and fades individual results using the same variant-and-layout combination this lesson describes, rather than a bespoke transition per result. Because the whole interaction is expressed through Motion\'s declarative surface, someone extending cmdk for a new project can read the variants directly in the source and understand the state machine without stepping through imperative animation code line by line. This is the actual argument for calling Motion a design system rather than a library: a stranger to the codebase can extend the motion vocabulary the same way they would extend a color token, by adding a new named variant.',
      },
      {
        heading: 'Where the model still requires judgment',
        body: 'Motion handles the mechanics of layout, variants, and exits well, but it does not decide any of the questions the rest of this batch of lessons covers: whether a given transition should be a spring or a tween, whether a given interaction needs motion at all under the state-carrying test, or what duration and easing values belong in the token layer. A team that reaches for Motion\'s spring prop by default on every transition, without asking whether the interaction actually involved user-driven velocity, will ship floppy modals and dead-feeling drag interactions with excellent, well-architected code underneath both mistakes. The library is the grammar; the sentences it is used to write still depend entirely on the judgment covered in the rest of this course. Good tooling makes good decisions easy to execute, not automatic.',
      },
      {
        heading: 'A minimal Motion vocabulary worth learning first',
        body: 'Before reaching for the library\'s full surface area, four primitives cover the overwhelming majority of real product work: variants for any state driven by more than one component at once, the layout prop for anything whose position or size changes (reorders, expansions, shared-element transitions), AnimatePresence around anything that unmounts and needs an exit animation, and whileHover or whileTap for simple, single-element gesture feedback that does not need full drag physics. Reach for useDrag and true spring physics specifically for gesture-driven interactions where release velocity matters, following the modeling rule from the spring-versus-tween lesson earlier in this batch. Learn these four or five primitives well before exploring the rest of the API surface; they compose into almost every motion pattern a real product interface actually needs.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-cm-framer-motion-primitives.svg',
        alt: 'Four Motion primitives and their jobs',
        caption: 'Variants, layout, AnimatePresence, and gesture props cover nearly every real product motion pattern.',
        diagramBrief: 'Four labeled boxes in a row: Variants ("named states, coordinated across components"), Layout ("measure before and after, interpolate the delta"), AnimatePresence ("keep unmounting elements around long enough to exit"), Gesture props ("whileHover, whileTap, useDrag, same target as animate"). Draw a thin connecting line beneath all four labeled "one declarative surface". Style: cream paper background, black ink, one accent color per box outline.',
      },
      {
        src: '/lessons/de/de-cm-framer-motion-timeline.svg',
        alt: 'Framer Motion becoming Motion, a timeline',
        caption: 'From a Framer-only library to an independent project with 30 million monthly downloads.',
        diagramBrief: 'A simple horizontal timeline with three markers: an early marker labeled "Framer Motion, part of Framer", a 2024 marker labeled "November 2024: spun out as Motion, motion.dev", and a later marker labeled "30M+ downloads/month on npm, vanilla JS API, View Transitions support". Style: cream paper background, black ink, one accent color on the 2024 marker.',
      },
    ],
    takeaways: [
      'Use variants for anything animated by two or more coordinated components.',
      'Prefer the layout prop over hand-coded transforms for reorder and hero transitions.',
      'Wrap unmounting elements in AnimatePresence, always.',
      'Treat gesture props (whileHover, useDrag) as the same surface as animate; do not split them.',
    ],
    terms: [
      { term: 'Variants', gloss: 'named animation states', meaning: 'An object mapping state names (hidden, visible, hover) to property targets, which child components can inherit from a shared parent variant.' },
      { term: 'Layout animation', gloss: 'smooth resizing and repositioning', meaning: 'A measured-before-and-after transition of an element\'s position and size, computed automatically from the layout prop rather than hand-written transform math.' },
      { term: 'LayoutGroup', gloss: 'keeping related elements in sync', meaning: 'A wrapper that coordinates layout animations across sibling components so they move correctly in relation to each other.' },
      { term: 'AnimatePresence', gloss: 'letting things animate out', meaning: 'A component that keeps an unmounting element rendered just long enough to finish its exit animation before actually removing it from the DOM.' },
      { term: 'whileHover / whileTap', gloss: 'hover and tap animations', meaning: 'Props that apply an animation target only while a pointer is hovering or actively pressing an element, sharing the same target syntax as animate.' },
      { term: 'useDrag (drag prop)', gloss: 'making something draggable', meaning: 'A prop enabling drag gesture handling whose output, including release velocity, feeds into the same declarative animate surface as any other trigger.' },
      { term: 'FLIP technique', gloss: 'how layout animation actually works', meaning: 'First, Last, Invert, Play: measuring an element before and after a change, then animating an inverted transform back to the natural position, the technique Motion\'s layout prop is built on.' },
      { term: 'Motion (rebrand)', gloss: 'Framer Motion\'s new name', meaning: 'The independent project Framer Motion became in November 2024, with its own site at motion.dev and a vanilla JavaScript API alongside the React one.' },
      { term: 'View Transitions API', gloss: 'the browser\'s native page-transition feature', meaning: 'A native browser API for animating between DOM states, shipped in Chrome since 2023 and Safari since version 18, which Motion\'s newer APIs build on top of rather than replace.' },
      { term: 'transition prop', gloss: 'the timing config', meaning: 'The shared configuration object (spring, tween, duration, ease) applied per animated property, letting one component mix a spring on one property with a tween on another.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Find a component in a codebase you have access to that hand-rolls an exit animation with setTimeout before removing an element from the DOM. Name which Motion primitive replaces that pattern.' },
      { level: 'easy', prompt: 'List the four primitives from this lesson\'s minimal vocabulary (variants, layout, AnimatePresence, gesture props) and, for each, name one UI pattern it is the right tool for.' },
      { level: 'medium', prompt: 'A modal, its backdrop, and its close button currently animate through three separate useState-driven transition blocks that occasionally fall out of sync. Rewrite the coordination using a single shared variant.' },
      { level: 'medium', prompt: 'Explain, using the FLIP technique, why Motion\'s layout prop can animate a list reorder smoothly while a plain CSS transition on top and left values would look janky for the same reorder.' },
      { level: 'design', prompt: 'Design the motion spec for a kanban card that expands into a detail view (layout), can be dismissed (AnimatePresence), and can be dragged between columns (gesture props with spring physics on release). Name which primitive handles each of the three behaviors and why they need to be three separate primitives rather than one.' },
    ],
    furtherReading: [
      { label: 'Motion, Framer Motion is now independent, introducing Motion', url: 'https://motion.dev/magazine/framer-motion-is-now-independent-introducing-motion', why: 'The primary announcement of the November 2024 rebrand, including the download figures at the time of the split.' },
      { label: 'Motion, React documentation', url: 'https://motion.dev/docs/react', why: 'The current getting-started docs, including the motion/react import path and the 30 million-plus monthly download figure.' },
      { label: 'Motion, React layout animations', url: 'https://motion.dev/docs/react-layout-animations', why: 'The dedicated reference for the layout prop and LayoutGroup, with live demos of the FLIP-based interpolation.' },
      { label: 'Paco Coursey, cmdk', url: 'https://cmdk.paco.me', why: 'A real, widely used product built entirely on the primitives this lesson describes, readable directly in its open source.' },
      { label: 'Webflow, GSAP becomes free', url: 'https://webflow.com/updates/gsap-becomes-free', why: 'The context behind this lesson\'s Motion-versus-GSAP comparison: GSAP\'s full plugin set became free for commercial use in April 2025.' },
    ],
    shipIt: {
      kind: 'snippet',
      name: 'The four-primitive Motion starter',
      body: '// 1. Variants: coordinate multiple elements with one state name\nconst backdrop = { hidden: { opacity: 0 }, visible: { opacity: 1 } }\nconst panel = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }\n\n// 2. Layout: animate position and size changes automatically\n<motion.div layout>...</motion.div>\n\n// 3. AnimatePresence: catch exit animations before unmount\n<AnimatePresence>\n  {isOpen && <motion.div variants={panel} initial="hidden" animate="visible" exit="hidden" />}\n</AnimatePresence>\n\n// 4. Gesture props: hover and tap share the animate surface\n<motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} />\n\n// Reach for useDrag + real spring physics only when release velocity matters.',
    },
    demoCaption:
      'The API surface hidden behind one summary. Reveal the primitives and their jobs; state, layout, and gesture on the same declarative rail.',
    demo: {
      archetype: 'reveal',
      badCaption:
        'A single "just an animation library" summary hides the model that scales past five components: coordinated variants, measured layout, unmount capture, unified gestures.',
      goodCaption:
        'Four primitives, one mental model. Variants for state, layout for position and size, AnimatePresence for exits, whileHover and useDrag for gesture. All declarative.',
      opaqueLabel: 'Framer Motion: just an animation library',
      revealedLines: [
        'variants: named states children inherit from a parent',
        'layout: measure before and after, interpolate the delta',
        'AnimatePresence: keep unmounting elements around long enough to exit',
        'whileHover / whileTap / whileInView: gesture props on the animate surface',
        'useDrag: drag output binds to the same declarative animate target',
        'transition: shared config (spring, tween, duration) applied per prop',
      ],
    },
    posts: [
      {
        kind: 'X \u00b7 mechanism',
        hook: 'framer motion is not an animation library. it is a design system for movement.',
        body:
          'framer motion is not an animation library. it is a design system for movement.\n\nvariants are the tokens. layout is the killer feature. animatepresence catches exits so unmounting elements can play their farewell.\n\nonce a project has more than five animated components, hand-rolling css transitions stops scaling. this is the escape hatch.',
      },
      {
        kind: 'X \u00b7 design angle',
        hook: 'variants make the state machine visible in the jsx.',
        body:
          'variants make the state machine visible in the jsx.\n\nname the intent (menu-open). let children inherit. one line coordinates modal + backdrop + content.\n\nwithout variants you write coupled callbacks: setOpen, then setAnimating, then onComplete. that is where hand-rolled motion breaks down.',
      },
      {
        kind: 'X \u00b7 one-liner',
        hook: 'wrap unmounting elements in animatepresence. always.',
        body:
          'wrap unmounting elements in animatepresence. always.\n\nthe class of bugs it removes: "the element vanished before i could animate it." never write that hack again.',
      },
    ],
    source: {
      label: 'Vault note: Framer Motion is a design system for movement',
      url: 'https://motion.dev',
    },
  },
];
