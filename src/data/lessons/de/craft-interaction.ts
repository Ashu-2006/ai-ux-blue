import type { Lesson } from '@/lib/lessons';

// Design engineering · Craft · Interaction (7 lessons)
// Source: Vault notes at C:\Users\ashut\Vault\20 Areas\Design Engineering\Craft-Interaction\
// Interaction craft for designers who ship: how to reveal, interrupt, list,
// navigate, load, mutate, and stack the surfaces users actually touch.

export const deCraftInteraction: Lesson[] = [
  {
    id: 'de-ci-progressive-disclosure',
    phase: 'Design engineering',
    part: 'Craft · Interaction',
    index: 'DE.CI.01',
    title: 'Progressive disclosure has four canonical mechanisms, pick by weight of the reveal',
    oneLiner:
      'Peek, expand, drill, and detach are the four moves. Pick by two questions: does the list stay visible, and does the detail need its own URL.',
    readTime: '~10 min read',
    diagram: '/lessons/de/de-ci-progressive-disclosure.png',
    diagramCaption:
      'A Linear-style peek: click a row, a preview lane opens beside the list without changing route.',
    whyItMatters:
      'The word "expand" gets stapled onto every reveal, which is why so many products feel busy. Progressive disclosure is a routing decision, not a component decision: it sets what stays visible, how far the user travels, and how cheap it is to return. Linear\'s issue peek, Notion\'s toggle blocks, GitHub\'s issue drill, and a confirm-delete modal are four different answers to the same question. Pick the wrong one and the user loses the thread of what they were doing.',
    learningObjectives: [
      'Name the four progressive-disclosure mechanisms (peek, expand, drill, detach) and match each to a real product.',
      'Decide between mechanisms using the two questions: does the list stay visible, does the detail need a URL.',
      'Identify when an expand has grown too large and needs to be promoted to peek or drill.',
      'Audit a shipped feature and diagnose which of the four mechanisms it is actually using, regardless of what the component is named.',
      'Sketch a routing plan for a list-detail screen that specifies which mechanism handles which weight of task.',
    ],
    sections: [
      {
        heading: 'Peek is for scan-density: keep the list, add a preview lane',
        body:
          'A peek renders a second pane beside the list without changing route. Linear\'s issue view, Superhuman\'s split inbox, and Apple Mail\'s three-pane layout all peek: click a row and a preview lane opens beside the list, the list stays scrollable underneath, and the URL either does not move or moves to a nested route the list still frames.\n\nPeek is a passive surface built for glance, decide, next. It fails the moment the detail needs its own actions with weight: delete, publish, escalate, assign. Once a preview grows a toolbar of five buttons, it is asking to be promoted to a drill. Once it needs the rest of the screen dimmed to make a decision, it wants to be a detach. Peek is for reading, never for finishing work.',
      },
      {
        heading: 'Expand is for row-local truth: reveal under the row',
        body:
          'Expand opens content in place and pushes the rows below it down. Notion\'s toggle blocks, GitHub\'s collapsed diff hunks, and Sentry\'s expandable stack frames all expand: the detail belongs to exactly one row, and a user might open three or four at once to compare frames or diffs side by side in the same scroll.\n\nExpand stops working past a screen height of content. Beyond that, the page turns into a stack of jump cuts, and scroll position becomes unreliable the moment two rows above the fold both expand. Rule of thumb: if the reveal would run longer than the viewport, or if opening one row should really close the others, it has outgrown expand and wants peek or drill instead.',
      },
      {
        heading: 'Drill is for a full detail job: give it a route',
        body:
          'Drill navigates. The list gives way to a full detail page with its own URL, its own actions, and often its own subroutes. GitHub\'s issue page, Sentry\'s issue detail, and Linear\'s full-screen issue view all drill, because the detail carries real work: editing, discussion threads, history, linked items.\n\nA drill without a URL is a broken drill. No shareable link, no back-button semantics, no deep link from search or from a Slack message. If a detail is worth a dedicated screen, it is worth a route, even inside a single-page app. React Router, Next.js, and TanStack Router all make a nested route cheaper than the cost of losing shareability.',
      },
      {
        heading: 'Detach is for interruptions: float over the list, not beside it',
        body:
          'Detach puts content on top of the list instead of next to it. Drawers slide from an edge, sheets rise from the bottom, modals center and veil the page. The list stays behind the overlay, so context returns intact when the reveal closes. Detach handles two jobs peek and expand cannot reach: modal decisions (confirm, sign in, pay) and quick creates that would otherwise derail a drill.\n\nThe trap is reaching for detach when the user actually wants to read the list and the detail at the same time. A drawer that covers half the screen for a task that is really "glance, decide, next" is a peek wearing the wrong costume. Detach is for stopping the user, not for helping them keep scanning.',
      },
      {
        heading: 'The two questions collapse the decision to a lookup',
        body:
          'Every one of these four choices answers the same two questions. Does the list need to stay visible while the user reads the detail. Does the detail need its own shareable URL. Peek says yes to visibility, no to a dedicated URL. Expand says yes to visibility, no to a URL, and adds the constraint that the detail stays short. Drill says the URL matters more than visibility, because the task is deep enough to justify losing the list for a while. Detach says neither, because the task is an interruption, not a continuation of scanning.\n\nReduce any reveal decision to these two answers and the mechanism picks itself. The debate about whether something should be a modal or a drawer almost always turns out to be a debate about which question the team forgot to ask.',
      },
      {
        heading: 'Master-detail is the umbrella these four sit under',
        body:
          'Peek and drill are both implementations of master-detail: a list (the master) and a synchronized view of one item (the detail), whether that detail sits beside the list or replaces it. Expand and detach are not master-detail; they are local reveals and interruptions layered on top of a list that is not necessarily paired with any single detail view.\n\nThis matters because master-detail carries its own rules, covered in DE.CI.03: keyboard navigation between rows, a split ratio that serves the content, and a URL scheme that keeps the list mounted while the detail swaps. Naming which of the four mechanisms is doing master-detail work on a given screen tells the engineering team exactly which of those rules apply and which do not.',
      },
      {
        heading: 'Mobile collapses the ladder to one axis',
        body:
          'On a narrow viewport, peek and expand mostly stop making sense: there is no room for a second pane, and pushing rows down off a five-inch screen buries the thing the user just opened. Most products collapse to drill (a route change, full screen, back button) or detach (a bottom sheet) at the same breakpoint where a split-pane list-detail would break, typically somewhere around 768px.\n\nGmail\'s mobile app drills into every message. Linear\'s mobile client drills into every issue. The peek pattern that felt effortless on a 27-inch monitor becomes a route on a phone, and that is correct: do not fight the ladder into staying wide on a screen too narrow to hold two panes side by side.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-ci-progressive-disclosure-inline-decision.svg',
        alt: 'Decision ladder for the four disclosure mechanisms',
        caption: 'Two questions collapse the choice: does the list stay visible, does the detail need a URL.',
        diagramBrief:
          'Cream paper background, black ink, one blue accent. A flowchart with two diamond decision nodes stacked vertically feeding into four labeled boxes. Top diamond: "List stays visible?" branching Yes/No. Yes branch feeds a second diamond: "Detail has weight (needs its own actions)?" branching to two boxes: "Peek (read only)" and "Expand (in place)". No branch from the first diamond feeds a second small diamond: "Task is an interruption?" branching to "Detach (drawer/sheet/modal)" and "Drill (full route)". Each terminal box gets a one-line example underneath in small caps: Peek - Linear issue view. Expand - Notion toggle. Detach - confirm delete modal. Drill - GitHub issue page.',
      },
      {
        src: '/lessons/de/de-ci-progressive-disclosure-inline-breakpoint.svg',
        alt: 'How the ladder collapses at a mobile breakpoint',
        caption: 'Below roughly 768px, peek and expand give way to drill and detach.',
        diagramBrief:
          'Cream paper, black ink, one blue accent. Two side-by-side panels. Left panel labeled "Desktop, 1440px": a list column at 35% width next to a wider detail pane, connected by an arrow labeled "peek". Right panel labeled "Mobile, 390px": a single full-width list, with an arrow pointing off-panel labeled "drill: full-screen route" and a small overlay sheet at the bottom labeled "detach: bottom sheet". A dashed vertical line between panels labeled "~768px breakpoint".',
      },
    ],
    takeaways: [
      'Choose by two questions: does the list need to stay visible, and does the detail need its own URL.',
      'Peek reads, expand compares, drill edits, detach interrupts. If two mechanisms fit, pick the lighter one.',
      'Any reveal deeper than a screen height should stop expanding and start drilling or peeking.',
      'Route-less drills break sharing. If the detail is a full job, give it a URL.',
    ],
    terms: [
      { term: 'Peek', gloss: '"a preview panel"', meaning: 'Adjacent pane that renders a row\'s detail while the list stays mounted and scrollable.' },
      { term: 'Expand', gloss: '"an accordion"', meaning: 'In-row disclosure that pushes sibling rows down; belongs to exactly one row.' },
      { term: 'Drill', gloss: '"clicking into something"', meaning: 'A route change to a dedicated detail screen with its own URL and back-button semantics.' },
      { term: 'Detach', gloss: '"a popup"', meaning: 'An overlay (drawer, sheet, or modal) that floats above the list without changing route.' },
      { term: 'Master-detail', gloss: '"split view"', meaning: 'The umbrella pattern where a list and a single synchronized detail view are shown together, implemented by peek or by drill.' },
      { term: 'Route', gloss: '"a page"', meaning: 'A URL-addressable screen the browser\'s back button and address bar both understand.' },
      { term: 'Disclosure widget', gloss: '"a dropdown"', meaning: 'The specific expand mechanism that toggles visibility of nested content under a trigger, per the WAI-ARIA disclosure pattern.' },
      { term: 'Nested route', gloss: '"a subpage"', meaning: 'A child URL rendered inside a parent route\'s layout, used to keep a list mounted while a detail swaps.' },
      { term: 'Context loss', gloss: '"getting lost"', meaning: 'The user-facing cost of a mechanism that hides the list or drops the URL when the detail closes.' },
      { term: 'Interruption', gloss: '"a popup appearing"', meaning: 'A detach-class reveal that demands a decision before the user can return to the task they were doing.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'List three apps you used this week and name which of the four mechanisms (peek, expand, drill, detach) each one used for its main list-to-detail flow.' },
      { level: 'medium', prompt: 'A support ticket queue currently opens every ticket in a modal. Tickets need full editing, an activity history, and a shareable link for handoff between agents. Which mechanism does this call for, and what has to change in the routing to fix it?' },
      { level: 'hard', prompt: 'A CRM contact list wants to let a rep glance at 40 contacts, compare notes across 3-4 of them at once, and occasionally do a full edit with tags, custom fields, and merge history. Design a mechanism assignment: which of the four handles glancing, which handles comparing, which handles the full edit, and why.' },
      { level: 'design', prompt: 'Sketch the "row opens" interaction for a project management tool\'s task list on both desktop and mobile. Specify: which mechanism at each breakpoint, what changes in the URL, and one microcopy line that tells the user how to get back to the list, or why they do not need to.' },
    ],
    furtherReading: [
      { label: 'Nielsen Norman Group - Progressive Disclosure', url: 'https://www.nngroup.com/articles/progressive-disclosure/', why: 'The canonical definition of progressive disclosure as an information-hiding strategy, with the research behind why it reduces perceived complexity.' },
      { label: 'Radix UI - Collapsible primitive docs', url: 'https://www.radix-ui.com/primitives/docs/components/collapsible', why: 'The accessibility contract behind expand: the ARIA disclosure pattern, keyboard behavior, and animation hooks.' },
      { label: 'Linear Method - Building a great product', url: 'https://linear.app/method', why: 'Linear\'s own writeup of why their issue view peeks instead of drilling, from the team that shipped it.' },
      { label: 'TanStack Router - Nested routes guide', url: 'https://tanstack.com/router/latest/docs/framework/react/guide/nested-routes', why: 'The concrete routing mechanics for keeping a list mounted while a detail route swaps underneath a peek or drill.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Disclosure mechanism picker',
      body:
        '- Does the user need to keep the list visible while reading the detail? If no, go to drill or detach.\n- If yes: does the detail need its own actions with weight (delete, publish, escalate)? If yes, promote to a peek with a toolbar, or a drill.\n- Does the detail belong to exactly one row and stay under a screen height? If yes, expand is fine.\n- Is this an interruption that must be resolved before the user continues (confirm, sign in, pay)? That is always detach, never peek or expand.\n- Does the detail deserve a shareable link? If yes, it needs a route, whether that route is peeked, drilled, or both.\n- At your smallest supported breakpoint, does the mechanism still make sense, or does it need to collapse to drill or detach?',
    },
    demoCaption:
      'Step through the four mechanisms in order of reveal weight. Row is the resting state, peek adds a lane, drawer floats over, full route replaces the list. Each step is one more thing the list gives up.',
    demo: {
      archetype: 'sequence',
      badLabel: 'Everything is a modal',
      goodLabel: 'Weighted ladder',
      badCaption:
        'One mechanism for every reveal. The list is hidden, focus is trapped, and every row costs a full open-close cycle.',
      goodCaption:
        'Four mechanisms picked by weight. The list stays visible for scanning, and only real interruptions detach.',
      badSequence: [
        'Row selected',
        'Modal opens over list',
        'List hidden',
        'Escape, reset focus',
      ],
      goodSequence: [
        'Row (list is the axis)',
        'Peek (preview lane, list stays)',
        'Drawer (detach, veil over list)',
        'Full route (drill, list gives way)',
      ],
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: '"expand" is not a reveal, it is one of four.',
        body:
          '"expand" is not a reveal, it is one of four.\n\npeek: preview lane, list stays.\nexpand: in-row disclosure, everything else shifts.\ndrill: route change, list gives way.\ndetach: drawer or modal, list behind a veil.\n\npick by two questions. does the list need to stay visible? does the detail need a URL?',
      },
      {
        kind: 'X · design angle',
        hook: 'progressive disclosure is a routing decision, not a component decision.',
        body:
          'progressive disclosure is a routing decision, not a component decision.\n\nthe wrong mechanism is why the app feels busy. modal for reading kills the list. expand for editing turns the page into jump cuts. drill without a URL kills sharing.\n\npeek reads. expand compares. drill edits. detach interrupts. if two fit, pick the lighter one.',
      },
      {
        kind: 'X · one-liner',
        hook: 'any reveal taller than a screen wants to be a peek or a route.',
        body:
          'any reveal taller than a screen wants to be a peek or a route.\n\nexpand stops working past a few paragraphs. scroll gets unreliable, sibling rows go stale, the page turns into a stack of jump cuts. if it does not fit in place, it did not want to be in place.',
      },
    ],
    source: {
      label:
        'Vault note: Progressive disclosure has four canonical mechanisms, pick by weight of the reveal',
      url: 'https://www.nngroup.com/articles/progressive-disclosure/',
    },
  },
  {
    id: 'de-ci-overlay-choice',
    phase: 'Design engineering',
    part: 'Craft · Interaction',
    index: 'DE.CI.02',
    title: 'Modal, drawer, popover, sheet: pick by the shape of the interruption',
    oneLiner:
      'Modal, drawer, popover, and sheet lock different things: what stays visible, what stays clickable, and how the surface dismisses. Pick by the interruption, not by taste.',
    readTime: '~10 min read',
    diagram: '/lessons/de/de-ci-overlay-choice.png',
    diagramCaption:
      'A vaul sheet with snap points on a mobile viewport: peek, half, full, dragged to commit.',
    whyItMatters:
      'Modal, drawer, popover, and sheet are not synonyms, and the library labels do not save you: Radix ships all four as primitives, shadcn wraps all four as components, and vaul makes the sheet trivial to add. Radix Dialog\'s focus trap looks identical whether it renders as a centered modal or a right-edge drawer; the shape is a design decision layered on top, not a default the library picked for you. Get it wrong and a modal reads as rude for a quick pick, or a popover reads as too casual for a real purchase.',
    learningObjectives: [
      'Match each of the four overlay shapes (modal, drawer, popover, sheet) to the interruption weight it is built for.',
      'Distinguish a popover, click-triggered and interactive, from a tooltip, hover-triggered and non-interactive, without checking the component name.',
      'Decide when an overlay has outgrown its shape and needs to become a route.',
      'Explain why Radix Dialog and Radix Popover share a focus-trap contract but produce different user experiences.',
      'Choose the correct default overlay for a touch viewport versus a desktop viewport.',
    ],
    sections: [
      {
        heading: 'Modals stop the world and demand a decision',
        body:
          'A modal centers on the page, veils everything behind it, traps focus inside its boundary, and takes over the Escape key. It is the correct surface for irreversible or credential-shaped actions: confirm delete, sign in, submit payment, resolve a merge conflict. Radix Dialog and shadcn\'s Dialog component give the accessibility scaffolding for free: an aria-modal flag, a focus trap that cycles through focusable children, and focus restoration to the trigger on close.\n\nModals fail in two situations. First, when the user actually wants the underlying page back mid-task, which is why browsing a catalog inside a modal is a common offender. Second, when the content grows past a paragraph and the modal becomes a mini-app with its own scroll, its own tabs, its own nested modals. At that point the honest fix is a route, not a taller dialog.',
      },
      {
        heading: 'Drawers slide from an edge and let the page keep breathing',
        body:
          'A drawer enters from the left, right, top, or bottom edge and typically keeps the underlying page visible and often still interactive. It suits detail views that would be a drill on desktop but want a lighter feel: filter panels, cart summaries, quick-create forms, secondary navigation on mobile.\n\nRadix Dialog with a side-anchored variant, shadcn\'s Sheet component, and vaul all render drawers with correct focus handling out of the box. Drawers pair naturally with peek: click a row, a drawer opens with the detail, Escape or a click on the veil closes it and returns focus to the row. Keep the drawer\'s width honest to the content; a drawer that eats 90 percent of a 1440px screen has stopped being lighter than a modal.',
      },
      {
        heading: 'Popovers anchor to a trigger and vanish on outside click',
        body:
          'Popovers attach to a button, a table cell, or a word, open on click (never hover, for anything interactive), stay small, and close on an outside click or Escape. They are the right shape for date pickers, quick edits, action menus, and inline filters, where the task is one or two interactions and done.\n\nThe rule that keeps popovers from bloating: if it needs a title bar, or takes more than a few interactions to finish, it wants to be a drawer instead. Radix Popover positions itself using Floating UI internally, handles collision detection against the viewport edge, and keeps focus tethered to the trigger element. Do not confuse a popover with a tooltip. A tooltip is hover-only, non-interactive, and vanishes the instant the pointer moves away; a popover has to survive a click.',
      },
      {
        heading: 'Sheets rise from the bottom on touch and mimic native modality',
        body:
          'A sheet is the mobile-native drawer, and it snaps to detents: a peek height that previews content, a half height for browsing, and a full height that behaves like a modal. Emil Kowalski\'s vaul library, now at version 1.1.2, made snap-point sheets straightforward on the web with a snapPoints array and an activeSnapPoint state, and it ships as the engine behind shadcn/ui\'s Drawer component.\n\nSheets are correct on touch surfaces where a centered modal feels imported from desktop; on desktop, the same content typically degrades to a drawer or a dialog. Snap points are the interaction, not a decoration: peek to preview a share sheet, drag up to commit to add-to-list, drag down past the first detent to dismiss.',
      },
      {
        heading: 'Even the reference libraries are still moving underneath the taxonomy',
        body:
          'The four-shape taxonomy is stable, but the primitives underneath it are not finished settling. Radix consolidated its many separate packages into one unified radix-ui package in early 2025, and shadcn/ui migrated its "new-york" style onto that unified package in February 2026. vaul, meanwhile, carries open maintenance concerns as of 2026, with a tracked shadcn/ui issue about snap-point rendering bugs and discussion of replacing it with Radix Dialog\'s side variant for the Sheet component.\n\nThe lesson for a designer who ships: the shape taxonomy in this lesson outlives any specific package. Specify modal, drawer, popover, or sheet in a design file by behavior, what traps focus, what dismisses how, what stays visible, and whichever library implements it underneath can change without the spec changing.',
      },
      {
        heading: 'Escape hatches are part of the shape, not an afterthought',
        body:
          'Every overlay needs an explicit answer to how it closes. Modals close on Escape and on a confirm or cancel action, never on an outside click, because an accidental click should not discard a payment form. Drawers and sheets close on Escape and on a veil click, because the task inside them is rarely destructive enough to need that friction. Popovers close on outside click and Escape, because they are meant to be dismissed casually.\n\nGetting this backwards is the single most common overlay bug: a delete-confirm modal that closes on outside click deletes nothing but trains the user to distrust the confirm button, and a filter drawer that requires Escape twice because focus never left the closed panel is a keyboard trap disguised as a feature.',
      },
      {
        heading: 'The shape sets the animation, not the other way around',
        body:
          'Modals fade and scale from center because they are announcing a decision, not arriving from anywhere. Drawers and sheets slide from their edge because that motion tells the eye where the content physically lives and where it will return to. Popovers should barely animate at all, a quick 100 to 150 millisecond fade, because they are meant to feel attached to the trigger rather than performed.\n\nWhen a designer picks the overlay shape first and the animation is a two-line consequence, translate from the entering edge, fade for anchored surfaces, the app reads as consistent. When the animation is designed first and the shape follows from whatever looks good in isolation, every overlay in the product ends up with a slightly different personality, and users cannot predict how the next one will behave before they open it.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-ci-overlay-choice-inline-matrix.svg',
        alt: 'Four overlays compared on visibility, trigger, and dismissal',
        caption: 'Modal, drawer, popover, and sheet each lock a different set of user choices.',
        diagramBrief:
          'Cream paper, black ink, one blue accent. A 4-row by 4-column table rendered as a diagram: rows are Modal, Drawer, Popover, Sheet; columns are "What stays visible", "Opens from", "Closes on", "Best for". Fill cells tersely: Modal / nothing behind veil / center / Escape + confirm-cancel / irreversible decisions. Drawer / page behind, dimmed / left-right-top-bottom edge / Escape + veil click / detail that would be a drill. Popover / everything, anchored only / trigger element / outside click + Escape / quick edits, date pickers. Sheet / page behind, dimmed / bottom edge, snap points / drag down past detent / mobile-native quick actions.',
      },
      {
        src: '/lessons/de/de-ci-overlay-choice-inline-vaul.svg',
        alt: 'A sheet snapping between three detents',
        caption: 'vaul\'s snap points: peek, half, and full, each a real interaction state.',
        diagramBrief:
          'Cream paper, black ink, one blue accent for the active detent. Three stacked phone-viewport silhouettes side by side, each showing a bottom sheet at a different height: 15 percent labeled "peek", 50 percent labeled "half", 100 percent labeled "full, behaves like modal". A small drag-handle icon at the top of each sheet. An arrow between panels showing a drag-up progression left to right.',
      },
    ],
    takeaways: [
      'Ask what the user must lose access to. Full page (modal), partial page (drawer), only the anchor (popover), device screen (sheet).',
      'Popovers open on click, tooltips on hover. Never swap them.',
      'If a modal grows past one screen, it is a page. Give it a route.',
      'On mobile, prefer a sheet with detents over a centered dialog. It respects touch physics.',
    ],
    terms: [
      { term: 'Modal', gloss: '"a popup"', meaning: 'A centered dialog that veils the full page and traps focus until dismissed by an explicit action.' },
      { term: 'Drawer', gloss: '"a slide-out panel"', meaning: 'An edge-anchored overlay that keeps the underlying page visible, often still interactive.' },
      { term: 'Popover', gloss: '"a dropdown"', meaning: 'A small, trigger-anchored surface that opens on click and closes on outside click.' },
      { term: 'Sheet', gloss: '"a bottom drawer"', meaning: 'The mobile-native overlay that rises from the bottom edge and snaps to height detents.' },
      { term: 'Tooltip', gloss: '"a hover popup"', meaning: 'A non-interactive, hover-only label; if it needs a click, it is not a tooltip, it is a popover.' },
      { term: 'Focus trap', gloss: '"keyboard being stuck"', meaning: 'The deliberate constraint that keeps Tab cycling inside an open overlay until it closes.' },
      { term: 'Snap point', gloss: '"a stopping place"', meaning: 'A named height or position a sheet animates to and rests at, defined in vaul as activeSnapPoint.' },
      { term: 'Veil', gloss: '"the dark background"', meaning: 'The dimmed backdrop behind a modal, drawer, or sheet that both signals modality and, for some shapes, dismisses on click.' },
      { term: 'aria-modal', gloss: '"accessibility stuff"', meaning: 'The HTML attribute that tells assistive technology the rest of the page is inert while this dialog is open.' },
      { term: 'Detent', gloss: '"a snap position"', meaning: 'The named stopping height in a sheet\'s drag gesture, borrowed from the physical term for a mechanical catch.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Open five apps on your phone and name which one uses a bottom sheet with visible snap points, versus a full-screen modal, for its share action.' },
      { level: 'medium', prompt: 'A settings panel currently opens as a centered modal with 12 form fields across 3 tabs. Users report it feels heavy. Redesign the shape: what does it become, and what is the one-sentence reason?' },
      { level: 'hard', prompt: 'A table has an inline quick-edit popover for a single cell. Product wants to add bulk edit across 40 selected rows, plus a full audit history per edit. Decide which parts stay a popover, which get promoted to a drawer, and which need a route, and justify each call.' },
      { level: 'design', prompt: 'Design the overlay shape decision for an "add payment method" flow on both desktop and mobile. Specify the shape, the trigger, the dismiss behavior, and the one thing that would tell a future teammate they picked the wrong shape if they changed it.' },
    ],
    furtherReading: [
      { label: 'Radix UI - Dialog primitive docs', url: 'https://www.radix-ui.com/primitives/docs/components/dialog', why: 'The accessibility contract every modal and drawer implementation should match: focus trap, aria-modal, focus restoration.' },
      { label: 'vaul - drawer and sheet library', url: 'https://vaul.emilkowal.ski', why: 'Emil Kowalski\'s snap-point API is the reference implementation for mobile-native sheets on the web.' },
      { label: 'shadcn/ui - Sheet component docs', url: 'https://ui.shadcn.com/docs/components/sheet', why: 'Shows the drawer and sheet built on Radix and vaul as production-ready components with the four side variants.' },
      { label: 'W3C WAI-ARIA Authoring Practices - Dialog (Modal)', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/', why: 'The keyboard and focus-management spec behind every modal library, independent of framework.' },
    ],
    shipIt: {
      kind: 'rubric',
      name: 'Overlay shape scorecard',
      body:
        '- What must the user lose access to? Nothing (popover), part of the page (drawer/sheet), the whole page (modal).\n- Is the action reversible? Reversible favors drawer or popover. Irreversible favors modal with an explicit confirm.\n- How many interactions does the task take? One or two (popover), a short form (drawer/sheet), a multi-step flow (a route, not an overlay at all).\n- Touch or pointer? Touch favors a sheet with detents. Pointer favors a drawer or popover.\n- Does it need a title bar? If yes, it has outgrown a popover.\n- Does it dismiss on outside click? Only if the content is non-destructive to lose.',
    },
    demoCaption:
      'A triage inbox with a "reply" action. Modal for a quick reply stops the whole world; a right-edge drawer keeps the list navigable while you finish.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Inbox · reply to row 3',
      badLabel: 'Modal',
      goodLabel: 'Drawer',
      badCaption:
        'Modal centers, veils the page, traps focus. The list disappears. Ten rows means ten open-close cycles.',
      goodCaption:
        'Drawer slides from the edge. The list stays visible and navigable, and Escape returns you to the row.',
      badLines: [
        'Page: veiled',
        'List: hidden behind the modal',
        'Focus: trapped in the reply form',
        'Escape: closes, focus lost',
      ],
      goodLines: [
        'Page: visible under a narrow drawer',
        'List: navigable with arrow keys',
        'Focus: inside the drawer, restored on close',
        'Escape: closes, next row still highlighted',
      ],
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'modal, drawer, popover, sheet are not synonyms.',
        body:
          'modal, drawer, popover, sheet are not synonyms.\n\nmodal: full page, focus trapped, escape dismisses. for irreversible decisions.\ndrawer: edge-anchored, page visible. for detail that would be a drill on desktop.\npopover: anchored, closes on outside click. for date pickers and quick edits.\nsheet: mobile-native, snap points. for touch.\n\npick by the interruption, not by taste.',
      },
      {
        kind: 'X · design angle',
        hook: 'popovers open on click. tooltips on hover. never swap them.',
        body:
          'popovers open on click. tooltips on hover. never swap them.\n\ntooltips are non-interactive and vanish. if the surface has a button, a field, or a title, it is a popover. if the popover grows a title bar, it wants to be a drawer.\n\nthe library labels do not save you. the shape of the interruption does.',
      },
      {
        kind: 'X · one-liner',
        hook: 'if a modal grows past one screen, it is a page.',
        body:
          'if a modal grows past one screen, it is a page.\n\ngive it a route, a URL, a back button. modals are for decisions you cannot productively do anything else without. everything else deserves the affordances of the web.',
      },
    ],
    source: {
      label:
        'Vault note: Modal, drawer, popover, sheet - pick by the shape of the interruption',
      url: 'https://www.radix-ui.com/primitives/docs/components/dialog',
    },
  },
  {
    id: 'de-ci-master-detail',
    phase: 'Design engineering',
    part: 'Craft · Interaction',
    index: 'DE.CI.03',
    title: 'Master-detail wins over modals when a user shops through a list',
    oneLiner:
      'When a user triages many rows in one sitting, keep the list mounted and move only the detail. Master-detail turns a modal marathon into a keyboard glide.',
    readTime: '~10 min read',
    diagram: '/lessons/de/de-ci-master-detail.png',
    diagramCaption:
      'Superhuman\'s split inbox: list of messages on the left, active message pane on the right, keyboard driving the loop.',
    whyItMatters:
      'Superhuman, Linear, Sentry, and Apple Mail are all master-detail because their users shop: glance, decide, next, repeated dozens of times a session. Modal-per-row is a full context reset on every row: veil in, veil out, focus lost, scroll position uncertain. Superhuman is famous partly because that reset never happens; its own engineering writing has described targeting response times in the tens of milliseconds so the arrow-Enter-action loop never feels like it is waiting on the app.',
    learningObjectives: [
      'Identify the "shopping pattern," visiting many rows to decide something about each, as the signal a screen needs master-detail, not modal-per-row.',
      'Design a keyboard loop (next row, open, action key, auto-advance) that never requires a mouse for the primary flow.',
      'Choose a split ratio appropriate to whether the detail is text-heavy or the list is column-heavy.',
      'Implement a URL scheme, a parent route plus a child route, that keeps the list mounted while the detail swaps.',
      'Decide how master-detail should collapse on a narrow viewport instead of forcing a split that does not fit.',
    ],
    sections: [
      {
        heading: 'The shopping pattern is the tell',
        body:
          'Ask: does the user visit many rows in a session and decide something about each. If yes, that is shopping. Email triage is shopping. Reviewing a queue of alerts is shopping. Comparing candidates in an applicant tracking system is shopping.\n\nFilling one form on one row is not shopping. Editing a single settings page is not shopping. If the answer is one row, one deep task, done, a drill or a modal is fine. If the answer is many rows, quick decisions, keep moving, the list must never disappear. Modal-per-row for shopping is a tax paid on every keystroke.',
      },
      {
        heading: 'Keyboard navigation is the whole point',
        body:
          'The reason master-detail beats modals for shopping is that arrow keys become the primary control. Down-arrow to next row, Enter to open, E to archive, R to reply, J and K for Vim-style navigation, all without leaving the list.\n\nThis is impossible with a modal, because Escape has to be pressed between every row, and focus has to return, and the modal has to reopen. Superhuman\'s own account of building for speed has cited response-time targets in the range of tens of milliseconds for actions like archive and reply, precisely so this loop closes before the user notices a wait. Copy that loop and the app feels faster than it is.',
      },
      {
        heading: 'Split ratio is the design decision',
        body:
          'A split-pane list-detail is only good if the ratio serves the task. Rules that hold up across products: list takes 30 to 40 percent when detail is text-heavy (email, issues), 40 to 50 percent when the list has enough columns to be tabular (candidates, orders), and the detail pane needs its own scroll independent of the list.\n\nOn narrow viewports, master-detail collapses to a stack: list is the route, detail is a route or a full-height sheet. Do not try to preserve the split on mobile. It fails on both panes.',
      },
      {
        heading: 'Deep-link the detail without breaking the list',
        body:
          'The one mistake master-detail products make is losing the URL. If clicking a row does not change the URL, the user cannot share, cannot bookmark, and cannot back-button between details.\n\nThe pattern that works: a parent route holds the list, a child route (for example /inbox/:id) selects the detail. The list stays mounted, the detail swaps. Next.js parallel routes, Remix nested routes, and TanStack Router all support this cleanly. Do this and the app feels like a native client with the affordances of the web.',
      },
      {
        heading: 'Master-detail is a special case of peek, not a separate mechanism',
        body:
          'Every master-detail screen is implementing the peek mechanism from the disclosure ladder in DE.CI.01: a list stays the axis, a detail pane renders beside it. What master-detail adds on top is the assumption that the user will move through many rows in sequence, which is why keyboard navigation and split ratio become load-bearing in a way they are not for a one-off peek.\n\nThis reframe matters when a team debates whether a screen should be a drill or a peek: if the task is shopping, many rows, quick decisions, the answer is always peek, implemented as master-detail with the full keyboard loop. If the task is one deep edit, drill is fine, and none of master-detail\'s extra machinery needs to exist.',
      },
      {
        heading: 'The action-key vocabulary should read like a sentence',
        body:
          'A well-designed master-detail product does not pick action keys at random. Superhuman archives with E, replies with R, forwards with F, snoozes with H; every key is the first letter of the verb it performs, so the vocabulary teaches itself. Linear layers a two-key grammar on top for navigation: G then I means go to inbox, G then M means go to my issues, following the same go-then-destination pattern Vim popularized decades earlier.\n\nWhen a team is choosing action keys for a new master-detail screen, the test is simple: could a new user guess the key from the verb alone, after seeing it once in a tooltip or a cheatsheet. If the answer is no, the key was picked for the keyboard layout, not for the user\'s memory.',
      },
      {
        heading: 'Not every list wants a permanent split',
        body:
          'Master-detail is a productivity multiplier specifically for shopping, and it is a mistake to reach for it by default on every list screen. A settings page with eight sections is not master-detail material, because the user visits one section, makes changes, and leaves; a permanent split pane there just wastes half the screen on a list nobody revisits mid-task.\n\nThe correct test before committing to master-detail: would a user, in a typical session, open more than two or three rows in sequence and want to keep comparing against the list while doing it. If the honest answer is usually just one, a drill from DE.CI.01 with a clean back button serves the task better than a split pane that permanently taxes screen real estate for a comparison the user rarely makes.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-ci-master-detail-inline-splitratio.svg',
        alt: 'Split ratio guidance by content density',
        caption: 'List width scales with how tabular the content is: 30-40 percent for text-heavy detail, up to 50 percent for column-heavy lists.',
        diagramBrief:
          'Cream paper, black ink, one blue accent. Two horizontal bar diagrams stacked. Top bar: total width divided into "List 35%" and "Detail 65%" labeled "Email/issues (text-heavy detail)". Bottom bar: total width divided into "List 48%" and "Detail 52%" labeled "Candidates/orders (tabular list)". A small independent-scroll icon, two separate scrollbar glyphs, next to each pane.',
      },
      {
        src: '/lessons/de/de-ci-master-detail-inline-keyboardloop.svg',
        alt: 'The keyboard loop that replaces the mouse',
        caption: 'Down-arrow, action key, next row: the loop that never leaves the keyboard.',
        diagramBrief:
          'Cream paper, black ink, one blue accent. A circular flow diagram with four nodes arranged in a loop: "Row focused" leads to "Down arrow: next row" leads to "Enter or auto: detail loads in pane" leads to "Action key (E archive, R reply): row resolves" leads back to "Row focused" (auto-advances). Small annotation near the loop: "no modal, no Escape, no mouse."',
      },
    ],
    takeaways: [
      'Modal-per-row is fine for one edit. Master-detail is required when the task is triage.',
      'Keyboard is the point: arrow, Enter, action key, next. If that loop is not there, master-detail is being wasted.',
      'Split ratio is roughly 30 to 40 percent list for text-heavy detail. Independent scroll on each pane.',
      'Give the detail its own URL. A master-detail without deep links is a broken master-detail.',
    ],
    terms: [
      { term: 'Master-detail', gloss: '"split view"', meaning: 'A layout pairing a list (master) with a synchronized detail pane, kept mounted together.' },
      { term: 'Shopping pattern', gloss: '"browsing"', meaning: 'Visiting many rows in one session to decide something about each of them.' },
      { term: 'Peek', gloss: '"a preview"', meaning: 'The parent mechanism master-detail implements: detail beside the list, no route change.' },
      { term: 'Split ratio', gloss: '"the layout proportions"', meaning: 'The width percentage given to the list pane versus the detail pane.' },
      { term: 'Action key', gloss: '"a shortcut"', meaning: 'A single letter bound to the verb it performs, mnemonic to the action, like E for archive.' },
      { term: 'Nested route', gloss: '"a subpage"', meaning: 'A child URL, for example /inbox/:id, that renders inside the parent list route\'s layout.' },
      { term: 'Independent scroll', gloss: '"its own scrollbar"', meaning: 'Each pane scrolling on its own axis so navigating the list does not move the detail.' },
      { term: 'Auto-advance', gloss: '"moves to the next one"', meaning: 'The behavior where resolving a row (archive, assign) automatically focuses the next row.' },
      { term: 'Deep link', gloss: '"a direct URL"', meaning: 'A URL that opens directly to one detail item, bypassing the list.' },
      { term: 'Context reset', gloss: '"losing your place"', meaning: 'The cost of a modal-per-row pattern: focus, scroll, and mental state all restart on every open-close cycle.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Pick an app you use for triage, email, a task queue, a review dashboard, and count how many keystrokes it takes to go from "row 1 resolved" to "row 2 resolved" without touching the mouse.' },
      { level: 'medium', prompt: 'A code review queue currently opens each pull request in a new browser tab. Reviewers handle 15 to 20 PRs a day. Propose a master-detail redesign: what is the split ratio, what are the action keys, and what does the URL look like for a specific PR?' },
      { level: 'hard', prompt: 'A recruiter reviews 60 candidates a week, needs to compare 3 to 4 resumes side by side sometimes, and occasionally needs a full detail view with interview notes, scorecards, and history. Design the mechanism assignment across peek, expand, drill, and master-detail, and justify why a single split pane cannot cover all three needs.' },
      { level: 'design', prompt: 'Sketch the action-key vocabulary for a customer support ticket queue: at minimum, next ticket, resolve, escalate, and snooze. Justify each key choice against the verb, and note which single-key choices would collide with a browser or OS shortcut and need to change.' },
    ],
    furtherReading: [
      { label: 'Linear Method - Building a great product', url: 'https://linear.app/method', why: 'Linear\'s own account of why the issue list stays a master-detail split rather than drilling to a full page by default.' },
      { label: 'TanStack Router - Nested routes guide', url: 'https://tanstack.com/router/latest/docs/framework/react/guide/nested-routes', why: 'The routing mechanics for keeping a parent list route mounted while a child detail route swaps.' },
      { label: 'Superhuman - engineering blog', url: 'https://blog.superhuman.com', why: 'The engineering account of the sub-100ms response-time target behind the keyboard loop this lesson describes.' },
      { label: 'W3C WAI-ARIA Authoring Practices - Grid pattern', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/grid/', why: 'The accessibility spec for arrow-key navigation across rows, which any master-detail list should follow.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Master-detail readiness checklist',
      body:
        '- Does a typical session visit more than 2-3 rows in sequence? If no, use a drill instead.\n- Is there a full keyboard loop: next row, open, action key, auto-advance? If any step needs a mouse, the loop is not done.\n- Is the split ratio matched to content: 30-40 percent list for text-heavy detail, up to 50 percent for tabular lists?\n- Does each pane scroll independently?\n- Does the detail have its own URL (for example /queue/:id) so it can be shared and back-buttoned to?\n- What does this collapse to below 768px: a route (list) plus a route (detail), or a route plus a sheet?',
    },
    demoCaption:
      'Triaging a ten-row inbox. Modal-per-row means ten full open-close cycles. Master-detail keeps the list mounted and moves only the pane on the right.',
    demo: {
      archetype: 'before-after',
      subject: 'Inbox · triage 10 messages',
      badLabel: 'Modal-per-row',
      goodLabel: 'Master-detail',
      badCaption:
        'Every row opens a full-page modal. List hidden, focus lost between rows, scroll position uncertain. Ten decisions, twenty context resets.',
      goodCaption:
        'List stays as the axis. Arrow to next row, detail pane swaps, action keys operate on the focused row. Ten decisions, one continuous flow.',
      badLines: [
        'Row 1 click → modal open',
        'Reply → modal close, focus lost',
        'Row 2 click → modal open',
        'Ten rows, twenty veil transitions',
      ],
      goodLines: [
        'Down arrow → row 2 focused, detail swaps',
        'R → reply drawer, list still visible',
        'E → archive, next row auto-focuses',
        'Ten rows, one keyboard loop',
      ],
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'the shopping pattern is the tell for master-detail.',
        body:
          'the shopping pattern is the tell for master-detail.\n\ndoes the user visit many rows and decide something about each? that is shopping. inbox triage, alert queues, candidate review.\n\nmodal-per-row for shopping is a UX tax paid on every keystroke. the list has to stay visible or the loop breaks.',
      },
      {
        kind: 'X · design angle',
        hook: 'master-detail without a URL is a broken master-detail.',
        body:
          'master-detail without a URL is a broken master-detail.\n\nno share link, no bookmark, no back button between details. the app looks like a native client and behaves worse.\n\nparent route holds the list, child route (/inbox/:id) selects the detail. list stays mounted, detail swaps. Next.js parallel routes and TanStack Router do this cleanly.',
      },
      {
        kind: 'X · one-liner',
        hook: 'Superhuman is famous because the keyboard loop closes in a millisecond.',
        body:
          'Superhuman is famous because the keyboard loop closes in a millisecond.\n\narrow, Enter, action key, next row. no modal, no Escape, no focus lost. copy that loop and your app feels faster than it is.',
      },
    ],
    source: {
      label: 'Vault note: Master-detail wins over modals when a user shops through a list',
      url: 'https://superhuman.com',
    },
  },
  {
    id: 'de-ci-keyboard-first',
    phase: 'Design engineering',
    part: 'Craft · Interaction',
    index: 'DE.CI.04',
    title: 'A keyboard-first product treats the mouse as a fallback, not the default',
    oneLiner:
      'Keyboard-first is not adding shortcuts to a mouse-first app. It routes primary tasks through a command palette and single-key mnemonics, and leaves the mouse for exploration.',
    readTime: '~10 min read',
    diagram: '/lessons/de/de-ci-keyboard-first.png',
    diagramCaption:
      'A cmdk command palette: Cmd K opens a fuzzy-ranked list of every action, route, and entity.',
    whyItMatters:
      'Linear, Superhuman, Raycast, and Notion built fanbases by treating the keyboard as a first-class input, not a set of shortcuts bolted onto a mouse-first UI. Cmd+K has become close to a universal expected pattern across Linear, Notion, Vercel, GitHub, Figma, and Slack; paco.me\'s cmdk library alone sees tens of millions of weekly downloads. Keyboard-first also buys accessibility for free: visible focus and a sane tab order are WCAG 2.2 requirements, not nice-to-haves, and a product that nails them for keyboard users nails them for switch and screen-reader users too.',
    learningObjectives: [
      'Explain why a command palette functions as the front door for keyboard users, not a decorated search box.',
      'Assign shortcut length, single key, two-key sequence, or chord, based on how frequently and how destructively an action is used.',
      'Cite the WCAG 2.2 success criteria that govern focus visibility and what each one requires.',
      'Design a tab order that reads like a sentence by matching DOM order to visual reading order.',
      'Build a hint layer, a cheatsheet plus inline shortcut labels, that teaches shortcuts instead of hiding them behind an expert-only assumption.',
    ],
    sections: [
      {
        heading: 'The command palette is the entry point, not a search box',
        body:
          'Cmd K opens a fuzzy-searchable palette indexing every action, route, and entity in the product. It is not a decorated search box; it is the front door for keyboard users, the way Spotlight is on macOS. paco.me\'s cmdk library, now at version 1.1.1 and pulling tens of millions of weekly downloads, is the current de-facto primitive behind palettes across the Linear- and Raycast-influenced ecosystem, and behind Vercel\'s own command menu: unopinionated React, accessibility handled for you.\n\nThree rules keep a palette from becoming a graveyard. Rank recently used actions above alphabetical order. Show the keyboard shortcut next to each item so the palette doubles as the teaching surface. Let Escape close it from any state, including mid-search. Skip any of the three and the palette becomes a search box nobody trusts to find the right thing.',
      },
      {
        heading: 'Single-key mnemonics beat chorded shortcuts for high-frequency actions',
        body:
          'Chorded shortcuts (Cmd Shift D) are for rare or destructive actions. High-frequency actions want single keys or two-key sequences. Superhuman archives with E, replies with R, forwards with F. Linear creates with C, assigns with A. Gmail has been doing this since 2004.\n\nThe rule: the more often the action happens, the shorter the shortcut should be, and the mnemonic should match the verb. Use two-key sequences (g then i for "go to inbox") when a namespace helps: g for go, o for open, y for yank. This is Vim\'s grammar and it still works.',
      },
      {
        heading: 'Focus rings are the compass, not decoration',
        body:
          'Keyboard users navigate by focus alone. If focus is invisible, the app is unusable without a mouse, full stop. WCAG 2.2 added three success criteria specifically about this: 2.4.11 Focus Not Obscured (Minimum), which requires a focused component not be entirely hidden by other content; 2.4.12 Focus Not Obscured (Enhanced), the stricter version requiring no part hidden; and 2.4.13 Focus Appearance, which requires the focus indicator to cover at least a 2px perimeter around the component and hold at least a 3:1 contrast ratio against the unfocused state.\n\nDesign one focus token, a ring color, an offset, a width, and apply it everywhere; Tailwind\'s ring utilities and Radix\'s focus-visible data attribute make this close to free. Also design the tab order deliberately: DOM order is tab order, so markup should read like a sentence, not a maze. Trap focus inside modals and restore it to the trigger on close.',
      },
      {
        heading: 'Discoverability is solved by a hint layer, not by removing shortcuts',
        body:
          'The classic objection is "shortcuts are for power users." The classic answer is a hint layer. Show ? to open a shortcut cheatsheet (Linear, GitHub, Vercel do this). Reveal the shortcut inside tooltips and menu items. Highlight the underlined letter in a menu when Alt is held.\n\nUsers learn shortcuts by seeing them next to actions they already use. This makes the keyboard progressive: mouse first, then palette, then muscle memory. The app teaches itself.',
      },
      {
        heading: 'Two-key sequences give shortcuts a grammar, not just a list',
        body:
          'Once a product has more than a dozen shortcuts, flat single keys run out and start colliding. The fix Vim popularized decades ago and Linear runs today is a two-key grammar: the first key names a namespace, the second names the destination or object. G then I means go to inbox. G then M means go to my issues. Y, for yank, then a target copies something specific. This scales because the grammar, once learned once, predicts every new shortcut in the same family without the user memorizing each one from scratch.\n\nA flat list of forty single-letter shortcuts is a memory test. A grammar of a dozen namespace keys times a handful of destinations is a language, and languages generalize. Design the grammar before assigning the first key, or the twentieth shortcut will not fit anywhere.',
      },
      {
        heading: 'The palette and the direct shortcuts have to agree with each other',
        body:
          'The most common keyboard-first bug is a command palette and a set of direct shortcuts that drift out of sync: the palette lists "Archive" but the direct key is E, except the palette entry does not show "E" next to it, so a user who learned the palette never discovers the faster path. Every action needs one canonical shortcut, shown in exactly one place inside the palette result, and reused verbatim in tooltips, menu items, and the help cheatsheet.\n\nLinear, GitHub, and Vercel all put a ? shortcut cheatsheet one keystroke away specifically to keep this contract visible. Treat the shortcut as a piece of content that ships in four places at once, not a hidden implementation detail of the palette component.',
      },
      {
        heading: 'The mouse still owns exploration and precision',
        body:
          'Keyboard-first does not mean keyboard-only. A user who has never opened the product before, or who is doing something spatial, dragging a card between columns, resizing a panel, selecting an irregular range in a spreadsheet, reaches for the mouse correctly, and the product should not punish that choice. The design goal is that the keyboard path exists and is fast for the actions a repeat user does dozens of times a day, while the mouse remains fully capable for everything else.\n\nRaycast is a clean example of this split: it is keyboard-first as an app launcher, open, type, Enter, but its extension settings and preference panes are ordinary mouse-driven forms, because configuring an extension once a month does not need a shortcut grammar built around it.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-ci-keyboard-first-inline-shortcutgrammar.svg',
        alt: 'Shortcut length matched to action frequency and risk',
        caption: 'Short keys for frequent, reversible actions. Chords for rare or destructive ones.',
        diagramBrief:
          'Cream paper, black ink, one blue accent. A 2x2 grid: X axis "Frequency: rare to frequent", Y axis "Risk: reversible to destructive". Place labeled dots: "E archive" (frequent, reversible, bottom-right), "R reply" (frequent, reversible, bottom-right), "Cmd+Shift+D delete workspace" (rare, destructive, top-left), "G then I go to inbox" (frequent, reversible, bottom-right, annotated "two-key grammar"). Annotate quadrants: bottom-right "single key or two-key sequence", top-left "chorded shortcut".',
      },
      {
        src: '/lessons/de/de-ci-keyboard-first-inline-wcag.svg',
        alt: 'The three WCAG 2.2 focus criteria stacked by strictness',
        caption: '2.4.11 requires focus not be fully hidden. 2.4.13 requires a visible, high-contrast indicator.',
        diagramBrief:
          'Cream paper, black ink, one blue accent. Three horizontal bars stacked, increasing strictness top to bottom: "2.4.11 Focus Not Obscured (Minimum) - AA - not entirely hidden", "2.4.12 Focus Not Obscured (Enhanced) - AAA - no part hidden", "2.4.13 Focus Appearance - AAA - 2px perimeter, 3:1 contrast". A small ring icon next to the third bar showing a focus ring around a button with a measured offset.',
      },
    ],
    takeaways: [
      'The command palette is the front door. Every action, every route, ranked by recency, closed by Escape.',
      'Match shortcut length to action frequency. Short keys for common verbs, chords for rare or destructive.',
      'WCAG 2.2 requires visible focus. Design one focus token and apply it everywhere.',
      'Discoverability comes from a hint layer: ? cheatsheet, shortcuts in tooltips and menus.',
    ],
    terms: [
      { term: 'Command palette', gloss: '"a search bar"', meaning: 'A fuzzy-searchable index of every action, route, and entity, opened by a global shortcut like Cmd+K.' },
      { term: 'Chorded shortcut', gloss: '"a keyboard shortcut"', meaning: 'A multi-key combination pressed simultaneously, like Cmd+Shift+D, reserved for rare or destructive actions.' },
      { term: 'Mnemonic', gloss: '"a shortcut"', meaning: 'A single-letter key matched to the verb it performs, like E for archive, so the key is guessable.' },
      { term: 'Two-key sequence', gloss: '"a shortcut with two parts"', meaning: 'A namespace key followed by a destination key, pressed in order rather than together, like G then I.' },
      { term: 'Focus ring', gloss: '"the highlighted box"', meaning: 'The visible outline marking which element currently holds keyboard focus.' },
      { term: 'Tab order', gloss: '"the order things get selected"', meaning: 'The sequence keyboard focus follows through the page, which defaults to DOM order.' },
      { term: 'Focus trap', gloss: '"getting stuck"', meaning: 'The deliberate constraint that keeps Tab cycling only through an open overlay\'s contents.' },
      { term: 'Hint layer', gloss: '"a shortcuts list"', meaning: 'The always-available surface, a cheatsheet or tooltip labels, that teaches shortcuts without hiding the mouse-driven path.' },
      { term: 'WCAG 2.2', gloss: '"accessibility rules"', meaning: 'The W3C\'s 2023 accessibility standard revision that added three focus-visibility success criteria.' },
      { term: 'Fuzzy search', gloss: '"smart search"', meaning: 'A matching algorithm that ranks results by approximate character overlap and order, not exact substring match.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Open a product you use daily and press Cmd+K or Ctrl+K. If nothing happens, name the single highest-frequency action in that product that would benefit most from a one-key shortcut.' },
      { level: 'medium', prompt: 'A project management tool has these frequent actions: create task, assign to me, mark done, go to my tasks, go to team board. Assign single keys or two-key sequences to each, and flag any collisions with common browser shortcuts.' },
      { level: 'hard', prompt: 'A team wants keyboard-first navigation across five top-level sections (Inbox, Projects, Team, Reports, Settings) plus a "go to" action per section, such as jumping to a specific project. Design the full two-key grammar, decide which namespace letters to use, and justify why flat single letters would not scale here.' },
      { level: 'design', prompt: 'Design a ? shortcut cheatsheet overlay for a product with 15 shortcuts across 3 categories: navigation, actions, editing. Specify the layout, how shortcuts are grouped, and one microcopy line that tells a first-time user this exists.' },
    ],
    furtherReading: [
      { label: 'cmdk - command menu for React', url: 'https://cmdk.paco.me', why: 'The reference command palette primitive behind most current keyboard-first products; read the composition API.' },
      { label: 'W3C - Understanding Focus Not Obscured (Minimum)', url: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html', why: 'The exact WCAG 2.2 success criterion text and rationale behind criterion 2.4.11.' },
      { label: 'Linear Method - Building a great product', url: 'https://linear.app/method', why: 'Linear\'s own account of building the two-key navigation grammar this lesson describes.' },
      { label: 'Radix UI - Visually Hidden utility', url: 'https://www.radix-ui.com/primitives/docs/utilities/visually-hidden', why: 'A companion pattern for keeping focus indicators and screen-reader text correct without showing rings on mouse click.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Keyboard-first readiness checklist',
      body:
        '- Is there a command palette (Cmd/Ctrl+K) indexing every action, route, and entity, ranked by recency?\n- Does every palette result show its direct shortcut, if one exists?\n- Are single keys reserved for the highest-frequency, reversible actions, and chords reserved for rare or destructive ones?\n- Is there one visible focus token (ring color, offset, width) applied consistently, meeting WCAG 2.2 2.4.13 (2px perimeter, 3:1 contrast)?\n- Does DOM order match visual reading order, so Tab does not jump around the layout?\n- Is there a ? cheatsheet or equivalent hint layer, one keystroke away from anywhere in the app?',
    },
    demoCaption:
      'The same "assign a task" flow, twice. Mouse-only means five clicks through menus. Keyboard-first means Cmd K, type the person, Enter.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Assign task to teammate',
      badLabel: 'Mouse-only',
      goodLabel: 'Keyboard-first',
      badCaption:
        'Every path starts at a mouse. Menus nest, targets shrink, and expert users pay the cost of a beginner UI on every action.',
      goodCaption:
        'Cmd K opens the front door. Every action, route, and entity indexed and ranked by recency. Muscle memory takes over.',
      badLines: [
        'Click row → context menu',
        'Hover "Assign" → submenu opens',
        'Scroll teammate list',
        'Click name → done',
      ],
      goodLines: [
        'Cmd K → palette opens',
        'Type "assign" → action ranked first',
        'Type teammate name → fuzzy-matched',
        'Enter → done, focus back on row',
      ],
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'keyboard-first is not "we added shortcuts".',
        body:
          'keyboard-first is not "we added shortcuts".\n\nit is: the command palette is the front door. single-key mnemonics for common verbs. chorded shortcuts for rare or destructive. focus ring visible everywhere. tab order reads like a sentence.\n\nthe mouse is left free for the things a mouse is actually good at.',
      },
      {
        kind: 'X · design angle',
        hook: 'shortcut discoverability is a hint layer problem, not a shortcut problem.',
        body:
          'shortcut discoverability is a hint layer problem, not a shortcut problem.\n\n"shortcuts are for power users" is the classic objection. the answer is: show the shortcut next to the action in the palette, in the tooltip, in the menu. press ? for the cheatsheet.\n\nusers learn shortcuts by seeing them next to actions they already use. the app teaches itself.',
      },
      {
        kind: 'X · one-liner',
        hook: 'match shortcut length to action frequency.',
        body:
          'match shortcut length to action frequency.\n\nE archives. R replies. F forwards. Superhuman, Linear, Gmail all do this. chorded shortcuts (Cmd Shift D) are for the rare and destructive. the more often the action, the shorter the key.',
      },
    ],
    source: {
      label:
        'Vault note: A keyboard-first product treats the mouse as a fallback, not the default',
      url: 'https://cmdk.paco.me',
    },
  },
  {
    id: 'de-ci-four-states',
    phase: 'Design engineering',
    part: 'Craft · Interaction',
    index: 'DE.CI.05',
    title: 'Empty, loading, skeleton, error: four states are the minimum a screen owes',
    oneLiner:
      'A screen designed only for the happy path is a screenshot, not a screen. Empty, loading, skeleton, and error are the floor, not decoration.',
    readTime: '~10 min read',
    diagram: '/lessons/de/de-ci-four-states.png',
    diagramCaption:
      'Vercel\'s new project empty state: a headline that names the value, a primary action, and a link to docs.',
    whyItMatters:
      'Design tools show mocks with data; production shows everything in between. Vercel\'s new-project page, Stripe\'s dashboard before the first charge, and Linear\'s inbox at zero are all designed to teach a feature, not apologize for its absence. Shipping a screen that only renders on success delivers a screenshot, not a screen, and every dashboard I ship gets checked against what a new user sees, what a slow connection sees, and what a backend outage looks like.',
    learningObjectives: [
      'Enumerate the minimum state set a screen owes: empty, loading, skeleton, error, plus partial, offline, stale, and permissioned-out.',
      'Distinguish loading (unknown shape) from skeleton (known shape) and choose correctly based on whether layout is predictable.',
      'Write an error state that names what failed, why, and what to try next, instead of a generic apology.',
      'Design an empty state as an onboarding surface with a headline, one primary action, and a secondary link.',
      'Build a state chart for a screen before writing any component code.',
    ],
    sections: [
      {
        heading: 'Empty is a first-run experience, not "nothing to show"',
        body:
          'An empty state is the user\'s first meeting with a feature. Vercel\'s new project page, Stripe\'s dashboard before any charges, Linear\'s inbox at zero: each is designed to teach the feature, not apologize for it.\n\nThe pattern that works: a short headline naming the value ("Deploy your first project"), one primary action ("New Project"), and a secondary link to docs or samples. Never use "No data" as the empty state. That is telling the user the app is broken. Empty states are the onboarding surface that gets seen most often in a new user\'s first hour, and the one designers ignore most.',
      },
      {
        heading: 'Loading and skeleton are different states, not styles',
        body:
          'Loading is "we are fetching, we do not know the shape yet." Skeleton is "we know the shape, we are just waiting for values." A spinner is right for a request whose duration is bounded and whose result changes the page layout.\n\nA skeleton is right when the page structure is predictable (a list, a card grid, a detail page) so shimmer blocks in the same positions reduce perceived latency. Linear, Notion, and shadcn\'s Skeleton component all get this: outline the shape, then let real content pop in. Never nest a spinner inside a skeleton.',
      },
      {
        heading: 'Error states name the problem and the next step',
        body:
          'An error state is not "Something went wrong." That is a shrug. A useful error state names what failed, why it failed if the app can tell, and what to try next. Retry, contact support, and go back are the three doors.\n\nCal.com is a good study: their error UX distinguishes between "your action failed" (inline, near the button) and "the page failed" (full-page state with a home link). Also design for partial errors: one card failed in a dashboard, the rest loaded. Show the failure in the failing card, not on the whole page.',
      },
      {
        heading: 'Design the state chart before the components',
        body:
          'The classic mistake is to build the happy state, then bolt on the others when QA complains. The fix is a state chart up front: for every screen, list empty, loading, skeleton, error, and success, then also partial success (some rows failed), offline, stale (last-updated a while ago), and permissioned-out (a 403). This is engineering rule 1 restated. XState makes the chart machine-readable; a Notion table works fine for smaller apps. Either way, the chart forces you to design the states nobody asked about, which are the ones that ship broken.',
      },
      {
        heading: 'Partial failure is the state nobody designs until it happens in production',
        body:
          'A dashboard with six cards rarely fails or succeeds as a unit. One card\'s data source times out while the other five load fine, and the honest answer is to show the failure inside that one card, with its own retry, while the rest of the screen keeps working. Treating the whole screen as one success-or-error boolean means one flaky API call takes down five cards that had nothing to do with it.\n\nThis is the state most teams discover only after a customer complains that the dashboard is broken, when really one widget failed silently or, worse, rendered stale data with no indication it was stale. Designing partial failure up front means every card owns its own state, and the page-level state becomes "at least one card is in an error state," a very different design problem than "the whole page failed."',
      },
      {
        heading: 'Stale is a state, not a bug',
        body:
          'Cached data shown while a background refresh runs is correct behavior, not a defect, but it has to be visible. A "last updated 4 minutes ago" label, a subtle refresh spinner in the corner, or a soft opacity change while revalidating tells the user what they are looking at without blocking them from acting on it. Data layers built around stale-while-revalidate, like TanStack Query, make this pattern close to free technically; the design work is deciding how loud the staleness indicator should be.\n\nGet this wrong in either direction and trust erodes. Show stale data with no indicator, and a user acts on numbers that changed five minutes ago. Block the whole screen on every background refresh, and a snappy cache-first app starts to feel like it is reloading constantly.',
      },
      {
        heading: 'Permissioned-out is a state, not a generic 403 page',
        body:
          'When a user hits a screen or an action they are not allowed to see, the honest states are not "crash" or "silently do nothing." A permissioned-out state names what is missing, a role, a plan tier, an admin approval, and, where possible, offers the path to get it: request access, upgrade, contact an admin. Slack\'s "ask an admin" flow and Notion\'s workspace-permission prompts are both built around this: the denial is informative, not a dead end.\n\nThis state gets skipped constantly because it only shows up for a subset of users, which makes it easy to leave unbuilt until a support ticket surfaces it. Treat a 403 with the same design weight as a 404 or a 500: someone will land here, and a generic "Access Denied" teaches them nothing about what to do next.',
      },
      {
        heading: 'Offline is a state a mobile-first product cannot skip',
        body:
          'A network drop mid-session is not an edge case for anyone using a phone on a train or a laptop switching wifi networks. The minimum offline contract: detect the drop, show a persistent but unobtrusive indicator, a banner, not a modal, queue writes locally where safe to do so, and reconcile on reconnect the same way an optimistic write reconciles, covered in DE.CI.06. Linear and Notion both keep working offline for reads and queue writes for sync, rather than locking the whole app the moment connectivity drops.\n\nDesigning for offline forces a useful question for every other state on this list: what does the user actually need to keep doing when the network cannot answer them right now. Usually more than a fully blocked app assumes, and less than a fully functional one requires.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-ci-four-states-inline-statechart.svg',
        alt: 'The eight states a screen can be in',
        caption: 'Four states are the floor. Partial, offline, stale, and permissioned-out round out the real chart.',
        diagramBrief:
          'Cream paper, black ink, one blue accent for "the four everyone forgets". Two rows of four boxes each. Row 1 labeled "the floor": Empty, Loading, Skeleton, Error. Row 2 labeled "the ones that ship broken" in accent color: Partial, Stale, Offline, Permissioned-out. A small icon per box: empty box outline, spinner, shimmer bars, exclamation triangle, half-filled grid, clock, wifi-off, lock.',
      },
      {
        src: '/lessons/de/de-ci-four-states-inline-loadingvsskeleton.svg',
        alt: 'Loading versus skeleton decision',
        caption: 'Spinner for an unknown shape. Skeleton for a known one. Never both at once.',
        diagramBrief:
          'Cream paper, black ink, one blue accent. Two columns side by side. Left column labeled "Unknown shape, duration unbounded": icon of a spinner, example "search results, AI response starting". Right column labeled "Known shape, layout predictable": icon of shimmering rectangle blocks in a card-grid layout, example "list, card grid, detail page". A crossed-out icon at the bottom showing a spinner nested inside a skeleton block, labeled "never this".',
      },
    ],
    takeaways: [
      'Empty is onboarding: headline, primary action, secondary link. Never "No data."',
      'Spinner for unknown shape, skeleton for known shape. Never both at once.',
      'Errors name what, why, next. Retry, contact, go back.',
      'Enumerate the states before the components. Empty, loading, skeleton, error, partial, offline, stale, permissioned-out.',
    ],
    terms: [
      { term: 'Empty state', gloss: '"no data"', meaning: 'A first-run screen shown when a collection is legitimately zero, designed to teach the feature.' },
      { term: 'Loading state', gloss: '"a spinner"', meaning: 'The state shown when a request is in flight and its result\'s shape or duration is not yet known.' },
      { term: 'Skeleton', gloss: '"a placeholder"', meaning: 'A shimmering outline of the final layout shown while data of a known, predictable shape loads.' },
      { term: 'Error state', gloss: '"something broke"', meaning: 'A state that names what failed, why if known, and offers retry, contact, or go back.' },
      { term: 'Partial error', gloss: '"half broken"', meaning: 'A state where some data loaded successfully and some failed, rendered honestly at the component level, not the page level.' },
      { term: 'Stale state', gloss: '"old data"', meaning: 'Cached data displayed while a background refresh is in flight, visibly marked as such.' },
      { term: 'Permissioned-out', gloss: '"access denied"', meaning: 'A state shown when a user lacks the role, plan, or approval needed, with a path to get it where possible.' },
      { term: 'Offline state', gloss: '"no connection"', meaning: 'The state a screen enters when the network drops, distinct from a slow request or a server error.' },
      { term: 'Perceived latency', gloss: '"how slow it feels"', meaning: 'The subjective sense of wait time a user experiences, which a well-shaped skeleton reduces independent of actual load time.' },
      { term: 'State chart', gloss: '"a states diagram"', meaning: 'An enumeration, ideally built before any component code, of every state a screen can be in.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Pick a dashboard or list screen you use regularly and identify which of the eight states (empty, loading, skeleton, error, partial, stale, permissioned-out, offline) it visibly handles, and which it silently ignores.' },
      { level: 'medium', prompt: 'A settings page fetches three independent sections, profile, billing, notifications, from three different endpoints. One endpoint is down. Design what the user sees: is it a full-page error, or something else, and why?' },
      { level: 'hard', prompt: 'Design the full state chart for a project dashboard with a task list, an activity feed, and a team-member widget, each backed by a separate API call. Specify what each of the eight states looks like for each of the three widgets independently, and note any state combinations that need special handling, such as two widgets erroring while one is stale.' },
      { level: 'design', prompt: 'Write the empty-state copy (headline, primary action label, secondary link label) for a brand-new user\'s first look at an analytics dashboard with zero events tracked yet. Then write the error-state copy for the same dashboard when the analytics API times out.' },
    ],
    furtherReading: [
      { label: 'shadcn/ui - Skeleton component', url: 'https://ui.shadcn.com/docs/components/skeleton', why: 'The reference implementation for a shimmer skeleton matched to a known layout shape.' },
      { label: 'Nielsen Norman Group - Empty States', url: 'https://www.nngroup.com/articles/empty-state-interface-design/', why: 'Research-backed guidance on writing an empty state as onboarding rather than apology.' },
      { label: 'TanStack Query - Important defaults', url: 'https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults', why: 'The data-layer mechanics behind showing stale data safely while a background refetch runs.' },
      { label: 'web.dev - Reliable web app patterns', url: 'https://web.dev/explore/reliable', why: 'Practical patterns for detecting connectivity loss and queuing writes for reconciliation on reconnect.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Eight-state screen audit',
      body:
        '- Empty: headline names the value, one primary action, one secondary link. Never "No data."\n- Loading: shown only when the result shape or duration is unknown.\n- Skeleton: shown when layout is predictable; shimmer blocks match final positions.\n- Error: names what failed, why if known, offers retry, contact, or go back.\n- Partial: each independent widget owns its own success/error state.\n- Stale: cached data is visibly marked with an age or a refresh indicator.\n- Permissioned-out: names the missing role, plan, or approval, and a path to get it.\n- Offline: a persistent, unobtrusive indicator; writes queue and reconcile on reconnect.',
    },
    demoCaption:
      'Step through the four states a real screen owes. Each one is a different design job, not a decoration on the happy path.',
    demo: {
      archetype: 'sequence',
      badLabel: 'Happy path only',
      goodLabel: 'Four states',
      badCaption:
        'One render, one story: data arrived. New users see "No data," slow connections see nothing, failures show a shrug. The screen is a screenshot.',
      goodCaption:
        'Every state carries weight. Empty teaches the feature, skeleton hints the shape, loading admits the wait, error names the next step.',
      badSequence: [
        'Success (rendered from mock data)',
      ],
      goodSequence: [
        'Empty (headline, primary action, docs link)',
        'Loading (spinner for unknown shape)',
        'Skeleton (shimmer in the final layout)',
        'Error (what failed, why, retry / contact / back)',
      ],
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'a screen shipped only for the happy path is a screenshot, not a screen.',
        body:
          'a screen shipped only for the happy path is a screenshot, not a screen.\n\nfour states are the floor: empty, loading, skeleton, error. then partial, offline, stale, permissioned-out.\n\nempty teaches. skeleton reduces perceived latency. loading admits an unknown shape. error names the next step.',
      },
      {
        kind: 'X · design angle',
        hook: '"No data" is telling the user the app is broken.',
        body:
          '"No data" is telling the user the app is broken.\n\nan empty state is the user\'s first meeting with a feature. Vercel\'s new project page, Stripe pre-charges, Linear\'s zero inbox - all designed to teach the feature, not apologize for it.\n\nheadline that names the value. one primary action. one link to docs. that is the empty state that teaches instead of apologizes.',
      },
      {
        kind: 'X · one-liner',
        hook: 'spinner for unknown shape. skeleton for known shape. never both.',
        body:
          'spinner for unknown shape. skeleton for known shape. never both.\n\nspinner says "I do not know what this becomes." skeleton says "I know the shape, waiting on values." nesting one in the other is the app admitting it has not decided which state it is in.',
      },
    ],
    source: {
      label:
        'Vault note: Empty, loading, skeleton, error - four states are the minimum a screen owes',
      url: 'https://ui.shadcn.com/docs/components/skeleton',
    },
  },
  {
    id: 'de-ci-optimistic-ui',
    phase: 'Design engineering',
    part: 'Craft · Interaction',
    index: 'DE.CI.06',
    title: 'Optimistic UI is a bet on your own error rate',
    oneLiner:
      'Optimistic UI trades a small rollback cost for a large latency win. It only pays off when the write error rate is genuinely low and the rollback is designed with as much care as the happy path.',
    readTime: '~10 min read',
    diagram: '/lessons/de/de-ci-optimistic-ui.png',
    diagramCaption:
      'Vercel AI SDK\'s optimistic streaming: the user turn is reserved immediately, the assistant turn grows token by token.',
    whyItMatters:
      'Optimistic UI is why X likes feel instant, Linear checkboxes flip without lag, and Vercel AI SDK\'s useChat streams feel alive the moment a message sends. The mechanism updates the UI as if the server already agreed, then reconciles when the real response arrives. The bet is that the server almost always agrees; when write error rates rise past a few percent, the bet flips, and one in twenty users watches their own like un-like itself. That is not delight. That is haunted UI.',
    learningObjectives: [
      'Name the four pieces every optimistic write needs: local id, shape-compatible payload, idempotent mutation, rollback path.',
      'Use p95 latency to decide whether optimism is worth the added complexity for a given mutation.',
      'Design a non-silent rollback, a toast, a distinct row state, a manual retry, instead of a UI action that vanishes without explanation.',
      'Apply an undo window instead of a rollback for destructive actions like delete.',
      'Adapt the optimistic pattern for streaming responses, where the assistant turn grows incrementally instead of resolving all at once.',
    ],
    sections: [
      {
        heading: 'The four things every optimistic write needs',
        body:
          'An optimistic write is not just "setState first, mutate second." It needs four pieces: a stable local id so the server response can find its target, a shape-compatible optimistic payload (client-side timestamps, placeholder counts), an idempotent mutation on the server so retries do not duplicate, and a rollback strategy that names both the visual undo and the data undo.\n\nTanStack Query bakes this in with an onMutate callback that applies the optimistic change and stashes rollback context, an onError callback that receives that context back and reverts it, and an onSettled callback that fires either way to reconcile with the server\'s truth. Miss any of the four and the "instant" UX becomes a bug factory when the network wobbles.',
      },
      {
        heading: 'Design the rollback with the same care as the happy path',
        body:
          'A silent rollback is worse than no optimism at all: the user sees their action, then it disappears, and they conclude the app is buggy. The fix is to name the failure. Show a toast ("Could not save, retrying"), keep the failed row visually distinct until it succeeds or the user dismisses it, and offer a manual retry.\n\nSonner, from Emil Kowalski, is the current de-facto toast primitive for this, and it ships as shadcn/ui\'s default toast component. For destructive actions (delete), pair optimism with an undo window instead: soft-delete for five seconds, then commit, and the "undo" is a real cancel.',
      },
      {
        heading: 'Latency budgets tell you when optimism is unnecessary',
        body:
          'If a request finishes in under 100ms in the p95 case, optimism is theater: the user cannot see the difference, and you have added rollback complexity for zero perceived gain.\n\nOptimism earns its keep between 200ms and 2 seconds, which is where users notice latency but have not given up. Above 2 seconds, optimism becomes a lie: the user assumes success, moves on, and you have to interrupt them with a failure. Measure p95 latency for the mutation, decide by the number, do not optimism-by-default.',
      },
      {
        heading: 'Streaming responses want incremental optimism, not all-or-nothing',
        body:
          'For chat, generation, or any streamed response, the optimistic pattern shifts: reserve the user message immediately, then stream the assistant response into a placeholder that grows. Vercel AI SDK\'s useChat hook does this out of the box, and its current major version replaced the old boolean isLoading flag with a status enum, submitted, streaming, ready, error, so the UI can show the correct optimistic state the instant a message is sent, before the first token even arrives.\n\nThe user turn is optimistic (rollback if the request rejects), the assistant turn is incremental (append tokens as they arrive). If the stream fails mid-way, keep the tokens you got, mark the message as errored, and offer regenerate. This is the modern shape of optimistic UI for LLM apps.',
      },
      {
        heading: 'Idempotency is what makes retry safe, not just polite',
        body:
          'An idempotent mutation produces the same result no matter how many times the same request is applied, which is the property that makes retry safe rather than dangerous. Without it, a flaky network that causes the client to retry a "create comment" request can create the comment twice, and the optimistic UI now shows one comment while the server holds two.\n\nThe standard fix is a client-generated idempotency key sent with the request, often the same local id used for the optimistic render, which the server uses to deduplicate. Stripe popularized this pattern for payment APIs specifically because a double charge from a retried request is the worst possible failure mode; the same discipline applies to any optimistic write where a duplicate is worse than a delay.',
      },
      {
        heading: 'Optimism composes badly with dependent writes',
        body:
          'A single optimistic checkbox toggle is simple. A form that optimistically creates a task and optimistically assigns it to a teammate in the same action is two dependent writes, and if the second one fails after the first succeeded, the rollback has to undo only the second write while keeping the first. Treating a multi-step optimistic action as one atomic rollback usually produces the wrong result: either everything rolls back including the part that actually succeeded, or nothing rolls back and the UI shows a half-completed state as if it were whole.\n\nThe practical fix is to track rollback at the level of each individual mutation, not at the level of the user-facing action, and to design the error UI to name exactly which part failed, "Task created, but assignment failed, retry assignment," rather than a blanket "something went wrong."',
      },
      {
        heading: 'Not every write deserves optimism',
        body:
          'Optimism is a tool for actions the user repeats often and expects to feel instant: likes, checkbox toggles, reordering, archiving. It is the wrong tool for actions that are rare, high-stakes, or where the server\'s answer genuinely changes what the user should do next: submitting a large payment, requesting a refund, or any action where "the server said no" needs to interrupt the user\'s plan rather than quietly correct a UI that already moved on.\n\nThe deciding question is not "can this be optimistic," almost anything can be faked in the UI for a moment, but "does the user benefit from seeing the real answer before proceeding." When the answer changes the next step, wait for it and show a clear pending state instead.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-ci-optimistic-ui-inline-fourpieces.svg',
        alt: 'The four required pieces of an optimistic write',
        caption: 'Miss any one of the four and the instant UX becomes a bug factory under network stress.',
        diagramBrief:
          'Cream paper, black ink, one blue accent. Four numbered boxes in a horizontal row connected by arrows: "1. Stable local id" leads to "2. Shape-compatible optimistic payload" leads to "3. Idempotent server mutation" leads to "4. Rollback path (visual + data)". Below the row, a small annotation: "onMutate then onError then onSettled (TanStack Query)".',
      },
      {
        src: '/lessons/de/de-ci-optimistic-ui-inline-latencyzones.svg',
        alt: 'When optimism earns its keep, by p95 latency',
        caption: 'Under 100ms, optimism is theater. Above 2 seconds, it becomes a lie the app has to interrupt.',
        diagramBrief:
          'Cream paper, black ink, one blue accent for the sweet-spot zone. A horizontal number line from 0ms to 3000ms and beyond with three labeled zones: "0-100ms: theater, no perceivable gain", "200ms-2s: sweet spot, optimism earns its keep" (accent highlighted), "2s+: becomes a lie, needs a real pending state instead". Small tick marks at 100, 200, and 2000.',
      },
    ],
    takeaways: [
      'Optimistic UI is a bet on your write error rate. Under 1 percent, it is a win. Over 5 percent, it is a lie.',
      'Every optimistic write needs: local id, shape-compatible payload, idempotent mutation, rollback path.',
      'A silent rollback is worse than no optimism. Toast the failure, keep the row distinct, offer retry.',
      'Measure p95 latency first. Under 100ms is theater. 200ms to 2 seconds is the sweet spot.',
    ],
    terms: [
      { term: 'Optimistic update', gloss: '"instant feedback"', meaning: 'A UI change applied immediately, before the server has confirmed the mutation succeeded.' },
      { term: 'Rollback', gloss: '"undoing it"', meaning: 'Reverting both the visual state and the underlying data when the server rejects an optimistic write.' },
      { term: 'Idempotent', gloss: '"safe to retry"', meaning: 'A mutation that produces the same end result no matter how many times an identical request is applied.' },
      { term: 'Reconcile', gloss: '"syncing up"', meaning: 'Merging the server\'s authoritative response into a client state that already moved ahead optimistically.' },
      { term: 'p95 latency', gloss: '"how slow it usually is"', meaning: 'The latency value below which 95 percent of requests complete; the number to measure before deciding on optimism.' },
      { term: 'Undo window', gloss: '"a grace period"', meaning: 'A delay, commonly five seconds, before a destructive action commits, during which the user can cancel it for real.' },
      { term: 'onMutate', gloss: '"the optimistic step"', meaning: 'TanStack Query\'s callback that fires before a mutation is sent, used to apply the optimistic change and stash rollback context.' },
      { term: 'Idempotency key', gloss: '"a request id"', meaning: 'A client-generated identifier sent with a mutation so the server can detect and ignore duplicate retries.' },
      { term: 'Status enum', gloss: '"loading state"', meaning: 'A named set of request states, such as submitted, streaming, ready, error, replacing a single loading boolean.' },
      { term: 'Dependent write', gloss: '"a chained action"', meaning: 'A user action that triggers two or more separate mutations, where one can fail independently of the other.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Name three actions in an app you use daily that feel instant, likely optimistic, and one that always shows a spinner before confirming, likely not. Guess why the team made each call.' },
      { level: 'medium', prompt: 'A "star this repo" button currently waits for the server response before updating, at a measured p95 of 340ms. Should it become optimistic? Justify with the latency guidance from this lesson, and specify what the rollback looks like if the request fails.' },
      { level: 'hard', prompt: 'A task board lets a user drag a card to a new column, a status change, and simultaneously reassigns it to a teammate in the same drag gesture. Design the optimistic and rollback behavior for this dependent write: what happens if the status change succeeds but the reassignment fails?' },
      { level: 'design', prompt: 'Design the toast and row-state treatment for a failed optimistic "delete comment" action, including the undo-window version. Specify the exact copy for the toast, how long the undo window lasts, and what the row looks like during that window.' },
    ],
    furtherReading: [
      { label: 'TanStack Query - Optimistic Updates guide', url: 'https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates', why: 'The onMutate, onError, onSettled API this lesson\'s mechanism section is built on, straight from the maintainers.' },
      { label: 'Vercel AI SDK - useChat reference', url: 'https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat', why: 'The status-enum pattern (submitted, streaming, ready, error) that replaced a boolean isLoading flag for streaming optimism.' },
      { label: 'Stripe - Idempotent Requests', url: 'https://stripe.com/docs/api/idempotent_requests', why: 'The idempotency-key pattern that makes retrying an optimistic write safe instead of dangerous, from the API that popularized it.' },
      { label: 'Sonner - toast library', url: 'https://sonner.emilkowal.ski', why: 'The reference implementation for a non-silent rollback toast with a promise-based API.' },
    ],
    shipIt: {
      kind: 'snippet',
      name: 'Optimistic write skeleton (TanStack Query)',
      body:
        'useMutation({\n  mutationFn: likePost,\n  onMutate: async (postId) => {\n    await queryClient.cancelQueries({ queryKey: [\'post\', postId] });\n    const previous = queryClient.getQueryData([\'post\', postId]);\n    queryClient.setQueryData([\'post\', postId], (old) => ({ ...old, liked: true, likes: old.likes + 1 }));\n    return { previous };\n  },\n  onError: (err, postId, context) => {\n    queryClient.setQueryData([\'post\', postId], context.previous);\n    toast.error(\'Could not save. Retry?\');\n  },\n  onSettled: (data, error, postId) => {\n    queryClient.invalidateQueries({ queryKey: [\'post\', postId] });\n  },\n})',
    },
    demoCaption:
      'A like button, twice. Wait-for-server means every tap sits under a 400ms spinner. Optimistic flips the state on tap and reconciles when the server answers, with a graceful rollback if it does not.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Like button',
      badLabel: 'Wait-for-server',
      goodLabel: 'Optimistic with rollback',
      badCaption:
        'Tap, spinner, 400ms, state flips. The UI is honest but slow. Every action is a small wait paid on every tap.',
      goodCaption:
        'Tap flips the state immediately. Server reconciles in the background. On failure, a toast names the problem, the row is distinct, retry is one click.',
      badLines: [
        'Tap Like → spinner appears',
        'Wait 400ms for POST /like',
        '200 OK → heart fills',
        'Every tap pays the round trip',
      ],
      goodLines: [
        'Tap Like → heart fills instantly',
        'POST /like flies in background',
        '200 OK → reconcile, done',
        '4xx → rollback, toast "could not save, retry"',
      ],
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'optimistic UI is a bet on your write error rate.',
        body:
          'optimistic UI is a bet on your write error rate.\n\nunder 1% failures, it is instant feedback for the cost of one rollback path. over 5%, it is a lie: every twentieth user sees their like un-like itself.\n\nfour things every optimistic write needs: local id, shape-compatible payload, idempotent mutation, rollback strategy. miss one and the "instant" UX becomes a bug factory.',
      },
      {
        kind: 'X · design angle',
        hook: 'a silent rollback is worse than no optimism.',
        body:
          'a silent rollback is worse than no optimism.\n\nthe user sees their action, then it vanishes, and they conclude the app is buggy. name the failure: toast the retry, keep the failing row visually distinct, offer manual retry.\n\nfor deletes, replace optimism with an undo window. soft-delete for five seconds, commit after. the "undo" is a real cancel, not a rollback dressed up.',
      },
      {
        kind: 'X · one-liner',
        hook: 'under 100ms p95, optimism is theater.',
        body:
          'under 100ms p95, optimism is theater.\n\nthe user cannot see the difference. you have added rollback complexity for zero gain. optimism earns its keep between 200ms and 2s. above 2s, it becomes a lie the app has to interrupt with a failure toast.',
      },
    ],
    source: {
      label: 'Vault note: Optimistic UI is a bet on your own error rate',
      url: 'https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates',
    },
  },
  {
    id: 'de-ci-z-index-budget',
    phase: 'Design engineering',
    part: 'Craft · Interaction',
    index: 'DE.CI.07',
    title: 'Sticky UI needs a z-index budget, not a z-index war',
    oneLiner:
      'Every sticky element competes for the top of the stack. Without a named z-index budget, position sticky and fixed turn into a bidding war that ends at z-index 99999.',
    readTime: '~10 min read',
    diagram: '/lessons/de/de-ci-z-index-budget.png',
    diagramCaption:
      'MDN\'s stacking context primer: which ancestors trap children, why a modal at 9999 can still hide behind a sidebar.',
    whyItMatters:
      'Every product ships sticky headers, sticky sidebars, floating action bars, drawers, modals, toasts, tooltips, and popovers, each wanting to rank above some things and below others. Without a plan, a design system accumulates a dozen disagreeing z-index values within six months, and a modal ends up ranking below a toast. Attio\'s own design documentation lays out a six-tier z-index ladder (navigation around 90, dialogs at 100-101, context menus at 200-202) precisely because "depth via z-index, not shadow" only works once everyone claims from the same named scale.',
    learningObjectives: [
      'Explain why z-index only orders elements within the same stacking context, and list the CSS properties that create a new one.',
      'Build a named z-index budget (base, raised, sticky, overlay, modal, popover) and apply it consistently.',
      'Diagnose why position sticky silently fails, by walking the ancestor tree for overflow: hidden.',
      'Decide when an overlay needs to render through a portal to escape a clipped or transformed ancestor.',
      'Audit a real product\'s z-index usage and identify at least one likely stacking-context bug.',
    ],
    sections: [
      {
        heading: 'Stacking contexts, not z-index, decide what wins',
        body:
          'The rookie mistake is thinking a high z-index makes an element render on top. z-index only orders siblings inside the same stacking context. Any ancestor with position: relative and a z-index, or with transform, filter, opacity below 1, will-change, or isolation: isolate, creates a new stacking context, and children are trapped inside it.\n\nThat is why a modal with z-index: 9999 disappears behind a sidebar with transform: translateZ(0). MDN and CSS-Tricks both cover this. Learn the rule once, then build the layer system.',
      },
      {
        heading: 'A z-index budget looks like this',
        body:
          'Six named layers cover almost every product. Base (0) is the default flow. Raised (10) is cards and elevated surfaces. Sticky (100) is sticky headers and rails. Overlay (1000) is drawers and their veils. Modal (2000) is dialogs and sheets. Popover (3000) is popovers, tooltips, menus, toasts.\n\nNothing else gets a z-index. Encode these as CSS custom properties (--z-sticky: 100) or Tailwind theme extensions and lint against raw z-index values. The gap between layers (10, 100, 1000) leaves room for internal ordering without collisions.',
      },
      {
        heading: 'Sticky headers need position: sticky, not position: fixed',
        body:
          'position: fixed removes an element from the flow entirely, which breaks in-page layouts, scroll containers, and iframes. position: sticky sticks the element within its nearest scrolling ancestor until it leaves that ancestor.\n\nThat is what you want for a section header that follows the scroll only within its section, for column headers in a table, and for row headers in a list. The gotcha: overflow: hidden on any ancestor breaks sticky silently. If a sticky element refuses to stick, walk the ancestor tree looking for overflow.',
      },
      {
        heading: 'Portals fix the drawer-inside-a-card problem',
        body:
          'The classic bug: a drawer opens inside a card that has transform or overflow: hidden, and the drawer clips or ranks below other elements. Portals render the drawer to document.body, escaping the parent stacking context.\n\nRadix, shadcn, and vaul all use portals for dialogs, popovers, and sheets. Rule: any element that must overlay the whole page (modal, drawer, sheet, toast, popover) belongs in a portal. Any element that belongs to a card (inline actions, row menus) can stay in place if the card is not clipped. Design where a surface lives at the DOM level, not just visually.',
      },
      {
        heading: 'A real budget in production: a six-tier ladder',
        body:
          'Attio\'s public design documentation lays out a concrete, numbered z-index scale: navigation sits around 90-91, the header at 92, menus at 93, dialogs at 100-101, and context menus at 200-202. The team frames it explicitly as "depth via z-index, not shadow," meaning elevation in their interface is communicated by stacking order and motion, with shadow reserved for a separate, smaller signal.\n\nWhat makes this worth citing is not the specific numbers, it is the discipline: every layer has a name and a number before a single component gets built, and nothing claims a z-index outside that scale. A team that can point to a shared table like this settles "should this be above or below that" in seconds instead of in a pull-request argument about whose feature is more important.',
      },
      {
        heading: 'The full list of stacking-context triggers is longer than most teams assume',
        body:
          'Beyond the well-known trio, position with a set z-index, transform, and opacity below 1, current CSS creates a new stacking context from filter, backdrop-filter, perspective, clip-path, and mask when any of them is not none; from mix-blend-mode when it is not normal; from will-change when it names any of the above properties; from contain: layout, paint, strict, or content; and from isolation: isolate used explicitly for no reason other than to start a new context. Even a ::backdrop pseudo-element and top-layer elements like a native dialog or the Popover API sit in their own top layer above everything else, regardless of z-index.\n\nThe practical takeaway: any of these properties on an ancestor can silently trap a child that assumes it is fighting for the page\'s top layer. When a modal ranks below something it should not, check every ancestor for this full list, not just for an obviously competing z-index.',
      },
      {
        heading: 'Lint the budget, do not just document it',
        body:
          'A z-index budget written in a design doc gets violated within a sprint unless the codebase enforces it. Two practical guards: define the six layers as CSS custom properties or Tailwind theme tokens so a raw numeric z-index looks obviously wrong in review, and add a lint rule, a custom ESLint rule or a simple grep in CI, that flags any hardcoded z-index value not drawn from the token set.\n\nThe gap sizes in the budget (0, 10, 100, 1000, 2000, 3000) exist so a component can claim, for example, one unit above the modal layer for a secondary dialog stacked above a primary one, without colliding with the next named layer. Treat the gaps as intentional headroom, not evidence the numbers were picked arbitrarily.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-ci-z-index-budget-inline-triggers.svg',
        alt: 'Every CSS property that creates a new stacking context',
        caption: 'Any of these on an ancestor traps a child, no matter how high its own z-index is set.',
        diagramBrief:
          'Cream paper, black ink, one blue accent. A grid of small labeled cards, each naming one trigger: "position: fixed/sticky", "position + z-index != auto", "opacity < 1", "transform/scale/rotate", "filter/backdrop-filter", "mix-blend-mode != normal", "isolation: isolate", "will-change (naming above)", "contain: layout/paint", "top-layer (dialog, popover)". Arrange as a 5x2 card grid with a small "traps children" icon, a box within a box, beneath the grid.',
      },
      {
        src: '/lessons/de/de-ci-z-index-budget-inline-ladder.svg',
        alt: 'A six-tier z-index budget with real product numbers',
        caption: 'A real production ladder: navigation around 90, dialogs at 100, context menus at 200.',
        diagramBrief:
          'Cream paper, black ink, one blue accent. A vertical ladder of six rungs bottom to top: "Base flow - 0", "Raised (cards) - 10", "Sticky (headers, rails) - 100", "Overlay (drawer, veil) - 1000", "Modal (dialog, sheet) - 2000", "Popover (tooltip, toast) - 3000". Beside the ladder, a smaller annotated reference column showing a real production example at a different scale: "nav 90-91, header 92, menus 93, dialogs 100-101, context menus 200-202" labeled "different scale, same discipline".',
      },
    ],
    takeaways: [
      'Six named layers cover everything: base, raised, sticky, overlay, modal, popover. Nothing else gets a z-index.',
      'z-index only orders inside a stacking context. transform, filter, opacity all create new ones and trap children.',
      'Use position sticky for scrolled headers. overflow hidden on any ancestor silently breaks it.',
      'Portal any surface that must overlay the whole page. Modals, drawers, sheets, toasts, popovers.',
    ],
    terms: [
      { term: 'Stacking context', gloss: '"layers"', meaning: 'A group of elements whose z-index values are compared only against each other, not against siblings outside the group.' },
      { term: 'Portal', gloss: '"rendering elsewhere"', meaning: 'A framework pattern that renders a node into a different DOM subtree, typically document.body.' },
      { term: 'position: sticky', gloss: '"sticks when scrolling"', meaning: 'An element that scrolls normally until it reaches an offset, then sticks within its nearest scrolling ancestor.' },
      { term: 'position: fixed', gloss: '"pinned to the screen"', meaning: 'An element removed from document flow entirely and positioned relative to the viewport.' },
      { term: 'z-index budget', gloss: '"our z-index scale"', meaning: 'A small, named ladder of allowed z-index values that every UI layer must claim from.' },
      { term: 'isolation: isolate', gloss: '"forces a new layer"', meaning: 'A CSS property that explicitly starts a new stacking context with no other visual side effect.' },
      { term: 'Top layer', gloss: '"always on top"', meaning: 'A browser-level layer above the normal stacking order, used by native dialog, the Popover API, and fullscreen elements.' },
      { term: 'contain', gloss: '"CSS containment"', meaning: 'A property (layout, paint, strict, content) that isolates an element\'s rendering and, as a side effect, creates a stacking context.' },
      { term: 'Elevation', gloss: '"depth"', meaning: 'The design concept of visual layering, communicated through stacking order, shadow, or both, depending on the system.' },
      { term: 'Ancestor clipping', gloss: '"getting cut off"', meaning: 'The failure mode where an ancestor\'s overflow: hidden or transform silently breaks a descendant\'s sticky or overlay behavior.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Open your browser devtools on any product with a sticky header and a modal, and check whether the modal\'s z-index is higher than the sticky header\'s. If it is not, note what happens when you open the modal while scrolled.' },
      { level: 'medium', prompt: 'A drawer inside a product card, which has transform: scale(1) on hover, renders behind the page\'s main content instead of on top. Diagnose the likely cause and name the fix.' },
      { level: 'hard', prompt: 'Design a six-tier z-index budget for a product with: a sticky table header, a sidebar, toast notifications, a command palette, a confirm-delete modal, and a rich-text editor\'s floating toolbar. Assign each to a tier and justify any tier that needs an extra offset within it.' },
      { level: 'design', prompt: 'Audit a real product you use (name it) for one z-index or stacking-context bug: something that renders behind something it should be above, or a sticky element that stops sticking. Describe the ancestor chain you think is responsible.' },
    ],
    furtherReading: [
      { label: 'MDN - The stacking context', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Stacking_context', why: 'The authoritative, current list of every CSS property and condition that creates a new stacking context.' },
      { label: 'MDN - isolation', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/isolation', why: 'The property that starts a stacking context deliberately, with no other visual side effect, for exactly this kind of budget.' },
      { label: 'CSS-Tricks - What No One Told You About Z-Index', url: 'https://css-tricks.com/what-no-one-told-you-about-z-index/', why: 'A widely cited practical walkthrough of the stacking-context gotchas that break a naive z-index scale.' },
      { label: 'Radix UI - Portal primitive', url: 'https://www.radix-ui.com/primitives/docs/utilities/portal', why: 'The reference implementation for escaping a clipped or transformed ancestor by rendering to document.body.' },
    ],
    shipIt: {
      kind: 'snippet',
      name: 'Six-tier z-index budget as CSS custom properties',
      body:
        ':root {\n  --z-base: 0;\n  --z-raised: 10;\n  --z-sticky: 100;\n  --z-overlay: 1000;\n  --z-modal: 2000;\n  --z-popover: 3000;\n}\n\n/* usage: */\n.sticky-header { z-index: var(--z-sticky); }\n.drawer-veil { z-index: var(--z-overlay); }\n.confirm-dialog { z-index: var(--z-modal); }\n.confirm-dialog--secondary { z-index: calc(var(--z-modal) + 1); }\n.toast { z-index: var(--z-popover); }\n\n/* lint: flag any raw z-index value not drawn from this token set */',
    },
    demoCaption:
      'A confident "z-index: 9999" hides a real stack: fifteen values, none of which agree. Break down the meter and the ladder shows.',
    demo: {
      archetype: 'meter',
      headline: 'z-index: 9999',
      badCaption:
        'One number, one loud promise. In practice, the codebase has fifteen z-index values and none of them agree. A modal ranks below a toast, a tooltip clips inside a header.',
      goodCaption:
        'Six named layers, big gaps between them. Every sticky surface claims from the ladder, nothing else gets a z-index, lint blocks raw numbers.',
      breakdown: [
        { label: 'Base flow', value: 0 },
        { label: 'Raised (cards)', value: 10 },
        { label: 'Sticky (headers, rails)', value: 100 },
        { label: 'Overlay (drawer, veil)', value: 1000 },
        { label: 'Modal (dialog, sheet)', value: 2000 },
        { label: 'Popover (tooltip, toast)', value: 3000 },
      ],
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'a high z-index does not make an element render on top.',
        body:
          'a high z-index does not make an element render on top.\n\nz-index only orders siblings inside the same stacking context. any ancestor with transform, filter, opacity < 1, will-change, or isolation creates a new context and traps children inside it.\n\nthat is why your modal at 9999 disappears behind a sidebar with translateZ(0). learn the rule once, then build the ladder.',
      },
      {
        kind: 'X · design angle',
        hook: 'a z-index budget is six names, not fifteen numbers.',
        body:
          'a z-index budget is six names, not fifteen numbers.\n\nbase 0. raised 10. sticky 100. overlay 1000. modal 2000. popover 3000. nothing else gets a z-index. encode as CSS custom properties, lint against raw values.\n\nthe gap between layers leaves room for internal ordering without collisions. every sticky surface claims from the ladder.',
      },
      {
        kind: 'X · one-liner',
        hook: 'if a sticky element refuses to stick, walk the ancestor tree for overflow: hidden.',
        body:
          'if a sticky element refuses to stick, walk the ancestor tree for overflow: hidden.\n\nposition sticky silently breaks when any ancestor clips. same for portals: a drawer inside a card with transform will clip or rank wrong. any surface that overlays the whole page belongs in a portal on document.body.',
      },
    ],
    source: {
      label: 'Vault note: Sticky UI needs a z-index budget, not a z-index war',
      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Stacking_context',
    },
  },
];
