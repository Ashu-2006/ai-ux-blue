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
      'Motion tokens turn timing and easing into a shared vocabulary the design system enforces, the same way color tokens enforce brand.',
    readTime: '~5 min read',
    diagram: '/lessons/de/de-cm-motion-tokens.png',
    diagramCaption:
      'Vercel Geist motion documentation showing a short token ladder for durations and easing curves.',
    whyItMatters:
      'When motion lives in scattered inline values (transition: 200ms ease), each engineer picks a slightly different curve. A modal opens in 250ms, a drawer in 300ms, a toast in 180ms, and the product feels stitched together by different hands. Tokens fix this: three durations (fast 150ms, standard 250ms, slow 400ms) and three curves (enter, exit, standard) cover 90% of UI. Consistency stops being a code review argument and becomes a compile time property. New components inherit the language without asking, and brand feel becomes editable at the token layer.',
    sections: [
      {
        heading: 'Primitive tokens describe physics; semantic tokens describe intent',
        body: 'Primitives name raw values: duration-100 = 150ms, ease-standard = cubic-bezier(0.2, 0, 0, 1). Semantics name jobs: modal-enter, toast-exit, hover-lift. A designer changing brand feel edits the primitive once and every semantic token following it moves in lockstep. Without this split you rename fifty call sites. With it, the tokens carry a promise: the hover-lift always feels the same across button, card, and avatar, even when the underlying easing curve changes later. Semantic tokens are the API; primitives are the implementation.',
      },
      {
        heading: 'Duration ladders should be short, not comprehensive',
        body: 'Most systems ship three durations (fast, standard, slow) plus one instant (0ms for reduced motion) and stop. Five is already too many because designers can no longer keep them apart in memory. Vercel Geist uses roughly this ladder. Linear ships fewer than ten motion tokens total. A short ladder forces intent: is this the fast one or the standard one? A long ladder invites cargo culting: someone picks 320ms because 300ms felt off and now 320ms lives forever. The constraint is the value.',
      },
      {
        heading: 'Easing tokens encode brand personality',
        body: 'Easing curves carry more brand than duration does. A material ease (0.2, 0, 0, 1) reads as calm and considered. A sharp curve (0.4, 0, 0.2, 1) reads as responsive. iOS springs read as physical. Pick one curve for enter (starts fast, decelerates), one for exit (accelerates, ends fast), one for standard (both), and stop. If the brand later shifts from calm to punchy, you change one curve and the product recomposes itself. Curves are cheaper to iterate than the components using them.',
      },
    ],
    takeaways: [
      'Ship three durations and three curves before shipping a fourth of either.',
      'Split primitives from semantics so brand feel can rev without renaming components.',
      'Name tokens by job (modal-enter), not by number (duration-300).',
      'If a component sets its own timing, it is off the design system, not extending it.',
    ],
    terms: [
      { term: 'Motion token', meaning: 'Named duration, easing, or spring stored in the design system.' },
      { term: 'Primitive token', meaning: 'Raw value like duration-100 = 150ms.' },
      { term: 'Semantic token', meaning: 'Job-named alias like modal-enter that points at a primitive.' },
      { term: 'Duration ladder', meaning: 'The finite set of allowed timings a system exposes.' },
      { term: 'Easing curve', meaning: 'The rate-of-change function applied over a duration.' },
      { term: 'Cargo culting', meaning: 'Copying a value without understanding why it was chosen.' },
    ],
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
      'A response under 100ms feels instant, under 300ms feels connected, under 1000ms holds attention; past that, the user has left the interaction.',
    readTime: '~5 min read',
    diagram: '/lessons/de/de-cm-perceived-performance.png',
    diagramCaption:
      'The response-time ladder: instant under 100ms, connected under 300ms, waiting under 1000ms, gone past that.',
    whyItMatters:
      'Every animation and every network round trip lands in one of four buckets. If a click\'s feedback lands under 100ms, the button feels physical: the animation is the response. If it lands between 100 and 300ms, the animation is bridging: it acknowledges the click before the state arrives. Past 300ms, an interstitial (skeleton, spinner, optimistic UI) becomes necessary or the user starts to doubt the tap. Past 1000ms, background work should be moved off the critical path. These are not opinions, they are perceptual constants documented since the 1960s and still cited by Jakob Nielsen.',
    sections: [
      {
        heading: 'The 100ms window is for feedback, not for meaning',
        body: 'Under 100ms, animation cannot narrate: the eye has not landed yet. Use this window for confirming input: the button color change, the ripple, the pressed state, the check on a checkbox. Anything richer is wasted because the eye cannot resolve it. Emil Kowalski notes that Sonner\'s toast enter uses roughly 150ms because 100ms was too fast to register as a new toast landing. Under 100ms belongs to acknowledgment; storytelling starts a beat later. This is why nested easings inside 80ms animations look identical to linear ones in a user test.',
      },
      {
        heading: 'The 100 to 300ms window is where product personality lives',
        body: 'Modal opens, drawer slides, tooltip fade, page transition: these all sit in the 150 to 300ms band. It is long enough to read the curve, short enough to feel snappy. iOS spring animations for sheets land near 400ms because a spring\'s tail is perceived as follow-through, not delay. Below 150ms the motion is illegible; above 300ms the user is waiting rather than watching. Pick your standard duration inside this band, because the majority of your components will use it and your product\'s tempo is set here.',
      },
      {
        heading: 'Past 300ms, motion must be interruptible',
        body: 'Any interaction longer than 300ms is a wait, and a wait must be cancelable. This is where skeleton loaders, progressive loading, optimistic updates, and cancel buttons live. If the animation itself is longer than 300ms (a large hero transition, a walkthrough), it must respond to scroll, click, or keypress mid-flight; otherwise the user experiences it as unresponsive. Past 1000ms without acknowledgment, cognitive research shows users switch context. Design accordingly: never animate away from a decision point for more than a second unless you have shown the user why.',
      },
    ],
    takeaways: [
      'Under 100ms is acknowledgment; do not narrate here.',
      '150 to 300ms is where your standard duration lives; use one, not five.',
      'Past 300ms, the motion needs an interrupt or a skeleton, or both.',
      'Past 1000ms, move the work off the critical path or make it optional.',
    ],
    terms: [
      { term: 'Perceptual threshold', meaning: 'Time boundary at which the brain shifts how it categorizes a response.' },
      { term: 'Feedback window', meaning: 'The under-100ms window used for input acknowledgment.' },
      { term: 'Interstitial', meaning: 'UI shown during a wait (skeleton, spinner, placeholder).' },
      { term: 'Optimistic UI', meaning: 'Showing the successful state before the server confirms.' },
      { term: 'Interrupt', meaning: 'Ability for the user to cancel or override an in-flight motion.' },
      { term: 'Follow-through', meaning: 'The tail of a spring, perceived as physics not delay.' },
    ],
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
      'A tween is a scheduled path from A to B in a fixed time; a spring is a physics simulation whose duration and shape depend on state and forces.',
    readTime: '~5 min read',
    diagram: '/lessons/de/de-cm-spring-vs-tween.png',
    diagramCaption:
      'Motion spring playground showing stiffness and damping reshaping the curve in real time.',
    whyItMatters:
      'Choosing between tween and spring is not a taste call, it is a modeling call. If the target is known in advance and the trigger is deterministic (a modal opening from a menu, a tooltip appearing on hover), a tween is honest: fixed duration, predictable curve, easy to test. If the trigger is a gesture (drag-to-dismiss, pull-to-refresh, swipe stack), a spring is honest because release velocity matters. A tween ignoring gesture velocity feels dead. A spring on a click feels floppy. Match the model to the interaction, and both the code and the feel get simpler.',
    sections: [
      {
        heading: 'Tweens have three knobs: start, end, curve',
        body: 'A tween interpolates between two known values over a fixed duration according to an easing curve. Cubic bezier is the most common curve; steps() and CSS keyframes are variations. Because the end time is known at the start, tweens compose cleanly (chain, stagger, reverse, delay), which is why CSS transitions and most design tokens use them. They fail when a user\'s input changes the target mid-flight: a drag that becomes a fling has no easy tween model, because the end was not known when the animation started, and forcing one produces a jarring cut.',
      },
      {
        heading: 'Springs have three knobs: stiffness, damping, mass',
        body: 'Stiffness controls how hard the spring pulls toward target. Damping controls how much energy leaves per oscillation. Mass controls inertia. Together they define shape and duration; you do not set duration directly. iOS uses springs system wide for exactly this reason: a heavy sheet pulled slowly feels different from one flicked, and the spring reads that difference naturally. Framer Motion\'s default spring (stiffness 100, damping 10) is a reasonable starting point. Overdamped (damping high) reads like a tween. Underdamped (damping low) reads bouncy. Adjust mass last.',
      },
      {
        heading: 'Bounce is a semantic signal, not a decoration',
        body: 'A visible bounce says this element has weight. That is honest for a physical object (a card being flicked, a sheet being pulled). It is dishonest for a modal appearing on click, because a modal has no physics. Rauno Freiberg\'s craft site uses subtle springs on drag interactions and tweens on everything else, which is the right split. If you feel the urge to add a bounce to a static element, ask: is the user\'s motion involved? If no, use a tween. Bounces without a physical source read as visual noise and age badly.',
      },
    ],
    takeaways: [
      'If the user\'s velocity matters (drag, swipe, flick), use a spring.',
      'If the interaction is a click or hover with a known target, use a tween.',
      'A spring\'s duration is emergent, not a knob; do not fight it with force.',
      'Bounce implies weight; do not add it where there is nothing being weighed.',
    ],
    terms: [
      { term: 'Tween', meaning: 'Fixed-duration interpolation from A to B along an easing curve.' },
      { term: 'Spring', meaning: 'Physics simulation defined by stiffness, damping, and mass.' },
      { term: 'Stiffness', meaning: 'How hard the spring pulls toward its target.' },
      { term: 'Damping', meaning: 'How quickly the spring loses energy per cycle.' },
      { term: 'Overdamped', meaning: 'Damping high enough to prevent oscillation.' },
      { term: 'Underdamped', meaning: 'Damping low enough that the spring visibly bounces.' },
    ],
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
    readTime: '~5 min read',
    diagram: '/lessons/de/de-cm-motion-for-state.png',
    diagramCaption:
      'Sonner toasts illustrating enter, stack, and exit as three distinct state-carrying moments.',
    whyItMatters:
      'This is the test that decides whether an animation ships. Fading a toast in tells me it appeared; that fade carries state. Sliding a card in from the right when it could have just appeared adds no information; that slide is decoration. The failure mode is compounding: designers add motion because it feels polished, each addition is defensible in isolation, and the product ends up feeling busy. Motion competes for attention with content. If it does not clarify a state change, it is stealing attention from the state that matters and slowing the user down.',
    sections: [
      {
        heading: 'Enter, exit, and reorder are the honest jobs',
        body: 'Three state changes cannot be communicated without motion. Enter: something appeared where nothing was, and the eye missed it if it did not move. Exit: something is leaving, and the user needs to know it is gone versus hidden. Reorder: two items swapped, and without a transition it is impossible to see which moved. Everything else (hover, focus, active) can usually be communicated with color, weight, or size alone; motion there is optional, and optional motion is design debt that accumulates faster than most teams expect.',
      },
      {
        heading: 'Redundant motion is worse than no motion',
        body: 'A checkbox that changes color AND scales AND bounces AND draws a check is not more communicative than one that just draws the check. It is louder, not clearer. The brain treats each channel (color, size, position, opacity) as a signal; running four signals for one event forces the user to parse noise. Vercel Geist and Linear\'s product both use restrained motion for exactly this reason: one channel per change, and only when the change would otherwise be missed. Restraint reads as confidence.',
      },
      {
        heading: 'Match motion direction to conceptual direction',
        body: 'If a drawer comes from the right, it exits to the right. If a modal appears in the center, it disappears in place. If pagination moves forward, the new page arrives from the right and the old exits to the left. Mismatches (drawer opens from right, closes down) break the spatial model the user built and force a small re-parse each time. This is the cheapest rule to enforce and the most commonly violated. When in doubt, animate along the axis the interaction implied and match reverse to reverse.',
      },
    ],
    takeaways: [
      'Ask "would removing this animation change what the user understands?" before shipping it.',
      'Enter, exit, and reorder are the three cases where motion is not optional.',
      'Use one channel of motion per state change, not four.',
      'Reverse motion must retrace the forward path along the same axis.',
    ],
    terms: [
      { term: 'State-carrying motion', meaning: 'Motion whose removal would obscure a change.' },
      { term: 'Decorative motion', meaning: 'Motion whose removal leaves the meaning intact.' },
      { term: 'Enter', meaning: 'Element transitioning from not-in-DOM to in-DOM visible.' },
      { term: 'Exit', meaning: 'Element leaving; needs its own transition, distinct from enter.' },
      { term: 'Reorder', meaning: 'Two or more elements swapping positions in a list.' },
      { term: 'Spatial model', meaning: 'User\'s internal map of where things came from and where they go.' },
    ],
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
      'Setting reduced motion is not "turn animations off"; it is designing a second motion language for users who cannot tolerate the first.',
    readTime: '~5 min read',
    diagram: '/lessons/de/de-cm-reduced-motion.png',
    diagramCaption:
      'MDN prefers-reduced-motion documentation with code samples for preserve, shorten, and replace tiers.',
    whyItMatters:
      'A meaningful share of adults report motion sensitivity, and vestibular disorders make parallax and large translations physically nauseating. A blanket disable strips useful state cues (enter, exit, reorder) and leaves the interface confusing rather than accessible. The correct response is a parallel spec: keep the state-carrying motion, drop the parallax and the long slides, shorten durations, prefer fades over translates. This is a design deliverable, not an engineering toggle. It ships when the primary motion ships, or it does not ship, and it lives inside the token system so nobody rewrites it per component.',
    sections: [
      {
        heading: 'The default off is not accessibility, it is abandonment',
        body: 'When @media (prefers-reduced-motion: reduce) simply sets transition: none, the enter animation for a modal disappears and the modal pops in with no signal. A user with vestibular sensitivity now sees state changes they cannot track. The fix: preserve opacity transitions (rarely trigger vestibular issues) and drop translate/scale. A 100ms fade replaces a 250ms slide. The user still gets the "this appeared" signal. This is why the MDN docs on reduced motion recommend reduce, not eliminate, and why the WCAG animation guideline is written as a criterion, not a switch.',
      },
      {
        heading: 'The three tiers: preserve, shorten, replace',
        body: 'Preserve: opacity transitions, color transitions, small scale changes under 5%. These almost never trigger issues. Shorten: any duration over 200ms drops to 100ms; the motion still communicates state but is over faster. Replace: parallax, long translates, spring bounces, and continuous background motion get swapped for fades or instant transitions. Build this into the token system: each semantic motion token has a reduced variant. Then the engineer writes one thing and the reduced version comes free. Without token support, this becomes per-component labor and gets skipped.',
      },
      {
        heading: 'Test it by living inside it',
        body: 'Turn on reduced motion in your OS during development, not just for QA. macOS: Settings, Accessibility, Display, Reduce motion. Windows: Settings, Accessibility, Visual effects, Animation effects. Then work in your product for a day. What you notice is not that animations are gone, it is which cues you actually depended on. Reordering a list, opening a menu, dismissing a toast: if any of those becomes unclear in reduced mode, your primary motion was carrying more state than you documented, and your reduced fallback needs to carry that state a different way.',
      },
    ],
    takeaways: [
      'Reduced motion is a designed alternative, not the primary spec minus animations.',
      'Preserve fades; shorten durations; replace translates and parallax.',
      'Ship token variants so engineers pick reduced motion for free.',
      'Live inside reduced motion for a day before shipping the primary motion.',
    ],
    terms: [
      { term: 'prefers-reduced-motion', meaning: 'CSS media feature signaling the user asked the OS to reduce motion.' },
      { term: 'Vestibular sensitivity', meaning: 'Susceptibility to nausea or dizziness from motion, including on-screen.' },
      { term: 'Parallax', meaning: 'Layers moving at different speeds to simulate depth.' },
      { term: 'Reduced variant', meaning: 'A motion token\'s alternative value used when reduce is set.' },
      { term: 'Preserve tier', meaning: 'Motion that stays because it is low risk (opacity, small scale).' },
      { term: 'Replace tier', meaning: 'Motion swapped entirely (parallax, long translates, bounces).' },
    ],
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
      'A stagger is not N items each delayed by 50ms; it is choosing what the list is supposed to feel like as a single phrase.',
    readTime: '~5 min read',
    diagram: '/lessons/de/de-cm-stagger.png',
    diagramCaption:
      'Motion.dev stagger examples showing how per-child delay shapes a group into a readable sequence.',
    whyItMatters:
      'Lists animated all at once feel like one thing appearing. Lists animated with a stagger feel like several things arriving in a sequence, and the sequence tells the user how to read them. A dashboard revealing top row first, then chart, then table, sets reading order without instructions. A menu opening top-to-bottom sets hierarchy. The variables (delay, direction, easing per child) are the choreography. Pick badly and the list feels sluggish; pick well and the user\'s eye follows the sequence you intended. Choose the phrase, then pick the numbers.',
    sections: [
      {
        heading: 'Stagger delay lives between 30 and 80ms per item',
        body: 'Under 30ms and the items blur into a single reveal (perceptually a group, not a sequence). Over 80ms and the last item feels late; a ten-item list at 100ms stagger takes a full second to finish, and the user has moved on. The sweet spot is 40 to 60ms for most UI lists. Motion.dev\'s stagger examples default around 50ms. Adjust by list length: a three-item list can afford 80ms per step; a fifteen-item list needs 30 to 40ms per step or it becomes a wait. The total sequence should stay inside 500ms.',
      },
      {
        heading: 'Direction encodes hierarchy',
        body: 'Top-to-bottom stagger reads as reading order. Center-out stagger reads as focal emphasis (the middle item is primary). Random stagger reads as noise. Origin-first (from the click point outward) reads as "these came from your action." Each direction is a semantic claim; pick the one that matches how the user should scan. iOS home screen icons animate from the tapped folder outward on close, telling the user the space is expanding from where they clicked. Direction is a stronger signal than duration; get it right and small timing errors become invisible.',
      },
      {
        heading: 'Stagger dies at scale; use windowing',
        body: 'Beyond twenty items, per-child animation costs frame time (twenty layout transitions is not free) and the sequence stops reading as choreography (the user cannot track that many events). At scale, animate the container\'s enter, not each child; or window: animate the first few visible items, drop stagger on the rest. Framer Motion\'s staggerChildren API silently keeps working past twenty items, which is the trap; visually the effect breaks. If your list is often long, treat stagger as a decorative touch on the first N and let the rest arrive instantly.',
      },
    ],
    takeaways: [
      'Aim for 40 to 60ms per item; total sequence under 500ms.',
      'Pick a direction that encodes reading order or focal emphasis.',
      'Stagger works up to about twenty items; past that, window it.',
      'The phrase comes first, the numbers second; know what the sequence is saying.',
    ],
    terms: [
      { term: 'Stagger', meaning: 'Applying a per-child delay so a group animates as a sequence.' },
      { term: 'Stagger delay', meaning: 'The time between one child\'s start and the next child\'s start.' },
      { term: 'Reading direction', meaning: 'Top-to-bottom, left-to-right stagger matching text scan order.' },
      { term: 'Center-out', meaning: 'Stagger radiating from a central item outward.' },
      { term: 'Origin-first', meaning: 'Stagger starting from the point of user interaction.' },
      { term: 'Windowing', meaning: 'Applying an effect only to the visible or first N items.' },
    ],
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
      'Framer Motion (now Motion) is not an animation library; it is a design system that models state, layout, and gesture as declarative primitives.',
    readTime: '~5 min read',
    diagram: '/lessons/de/de-cm-framer-motion.png',
    diagramCaption:
      'Motion React docs with inline demos for variants, layout animations, and AnimatePresence.',
    whyItMatters:
      'Once a project has more than five components with motion, hand-rolling transitions with CSS or requestAnimationFrame stops scaling. Different components disagree on easing, exit animations get lost when elements unmount, and shared-element transitions become impossible. Framer Motion (rebranded to Motion in 2024) treats motion the way a design system treats color: declarative props (initial, animate, exit, transition), reusable variants, and layout as a first-class primitive. The result is not just fewer lines of code; it is a shared vocabulary that non-authors of a component can read and extend without rediscovering the primitives.',
    sections: [
      {
        heading: 'Variants are the tokens',
        body: 'A variants object maps named states (hidden, visible, hover) to property targets, and children can inherit their parent\'s variant to stay in sync. This is the same idea as semantic motion tokens: name the intent (menu-open) and let the components resolve it. Chaining a whole modal, backdrop, and content group by naming their shared variant is one line. Without variants you write coupled callbacks (setOpen, then setAnimating, then onComplete), which is where hand-rolled motion breaks down. Variants make the state machine visible in the JSX.',
      },
      {
        heading: 'Layout animations are the killer feature',
        body: 'The layout prop tells Motion to measure a component before and after a state change and interpolate between the two positions and sizes. This lets you animate list reorders, expanding cards, hero-to-detail transitions, and shared-element navigation without writing any transform code. LayoutGroup coordinates multiple elements. AnimatePresence catches exits so unmounting components can play a farewell animation. Together these three primitives (layout, LayoutGroup, AnimatePresence) remove the class of bugs that used to define motion work: the element vanished before I could animate it.',
      },
      {
        heading: 'Gestures share the API with animations',
        body: 'Motion\'s useDrag, whileHover, whileTap, and whileInView props hook up gesture inputs to the same declarative animation targets. Drag a card and animate its shadow, all in props. This unified surface (state and gesture both drive the same animate target) is why the library reads as a design system rather than a tool: one mental model covers hover, tap, drag, scroll, and state changes. The framework\'s job is to hide the imperative glue and let you describe motion the way you describe a stylesheet, declaratively.',
      },
    ],
    takeaways: [
      'Use variants for anything animated by two or more coordinated components.',
      'Prefer the layout prop over hand-coded transforms for reorder and hero transitions.',
      'Wrap unmounting elements in AnimatePresence, always.',
      'Treat gesture props (whileHover, useDrag) as the same surface as animate; do not split them.',
    ],
    terms: [
      { term: 'Variants', meaning: 'Named animation states defined as an object of property targets.' },
      { term: 'Layout animation', meaning: 'Measured-before-and-after transition of position and size.' },
      { term: 'LayoutGroup', meaning: 'Coordinates layout animations across sibling components.' },
      { term: 'AnimatePresence', meaning: 'Preserves unmounting elements long enough to play exit animations.' },
      { term: 'whileHover', meaning: 'Prop that applies a target while pointer is over.' },
      { term: 'useDrag or drag prop', meaning: 'Enables drag gesture and binds output to the animate surface.' },
    ],
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
