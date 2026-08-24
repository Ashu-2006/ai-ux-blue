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
      'Peek, expand, drill, and detach are the four moves. Pick the one that matches how much the user needs to see and whether they need to keep the list in view.',
    readTime: '~5 min read',
    diagram: '/lessons/de/de-ci-progressive-disclosure.png',
    diagramCaption:
      'A Linear-style peek: click a row, a preview lane opens beside the list without changing route.',
    whyItMatters:
      'The word "expand" gets stapled onto every reveal, and that is why so many products feel busy. Progressive disclosure is a routing decision, not a component decision. The choice sets what the user can still see (list vs. no list), how far they travel (same page vs. new URL), and how easy return is (one key vs. back button). Get the choice right and the screen breathes. Get it wrong and the user loses the thread of what they were doing, or worse, keeps opening the wrong surface for the wrong weight of task.',
    sections: [
      {
        heading: 'Peek is for scan-density: keep the list, add a preview lane',
        body:
          'A peek renders a second pane beside the list without changing route. Linear\'s issue view, Superhuman\'s inbox, and Apple Mail all peek. The list stays the axis of navigation, and the preview is a passive surface: read, glance, maybe reply, then arrow to the next row.\n\nPeek fails when the detail needs its own actions with weight (delete, publish, escalate). If the preview grows toolbars, it wants to be a drill. If it needs modality, it wants to be a drawer. Peek is for reading, not for finishing work.',
      },
      {
        heading: 'Expand is for row-local truth: reveal under the row, keep everything else',
        body:
          'Expand opens content in place, pushing rows below down. Notion toggles, disclosure widgets, accordion FAQs, and Sentry\'s expandable stack frames all expand. It works when the detail belongs to exactly one row and the user might open several at once to compare.\n\nIt stops working past a few paragraphs: the page becomes a stack of jump cuts and scroll positions get unreliable. Rule of thumb: if the reveal is more than a screen tall, or if opening one should close others, promote to peek or drill.',
      },
      {
        heading: 'Drill is for a full detail job: go to a route with its own affordances',
        body:
          'Drill navigates. The list gives way to a full detail page, usually with its own URL, its own actions, and its own subroutes. GitHub issues, Sentry issue pages, and Linear\'s full issue view all drill. Drill wins when the detail carries substantial work (editing, discussion, history, related items) and when returning to the list is acceptable friction.\n\nA drill without a URL is a broken drill: no shareable link, no back-button semantics, no deep link from search. If the item is worth this much surface, it is worth a route.',
      },
      {
        heading: 'Detach is for interruptions: a drawer, sheet, or modal on top of the list',
        body:
          'Detach floats content over the list. Drawers slide from an edge, sheets rise from the bottom, modals center. The list stays behind the veil, so context is still there when the reveal closes. Detach handles two jobs peek and expand cannot: modal decisions (confirm, sign in, purchase) and quick creates that would derail a drill.\n\nThe trap is using detach for reading. If the user needs to see the list and the detail at the same time, they want peek, not a drawer that hides half the screen.',
      },
    ],
    takeaways: [
      'Choose by two questions: does the list need to stay visible, and does the detail need its own URL.',
      'Peek reads, expand compares, drill edits, detach interrupts. If two mechanisms fit, pick the lighter one.',
      'Any reveal deeper than a screen height should stop expanding and start drilling or peeking.',
      'Route-less drills break sharing. If the detail is a full job, give it a URL.',
    ],
    terms: [
      { term: 'Peek', meaning: 'Adjacent preview pane that leaves the list navigable.' },
      { term: 'Expand', meaning: 'In-row disclosure that pushes surrounding rows down.' },
      { term: 'Drill', meaning: 'Route change to a dedicated detail surface.' },
      { term: 'Detach', meaning: 'Overlay (drawer, sheet, modal) that floats above the list.' },
      { term: 'Master-detail', meaning: 'Umbrella pattern that peek and drill implement.' },
      { term: 'Route', meaning: 'A URL-addressable screen with back-button semantics.' },
    ],
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
      'Four overlays, one axis: how hard you are stopping the user, and from which edge. Pick by the interruption, not by taste.',
    readTime: '~5 min read',
    diagram: '/lessons/de/de-ci-overlay-choice.png',
    diagramCaption:
      'A vaul sheet with snap points on a mobile viewport: peek, half, full, dragged to commit.',
    whyItMatters:
      'Modal, drawer, popover, and sheet are not synonyms. Each locks a different set of choices for the user: what they can still see, what they can still click, what dismisses the surface, where their eye lands. Get the shape wrong and the interruption reads as rude (a modal for a quick pick) or as invisible (a popover for a purchase). The library labels do not save you: shadcn ships all four, Radix ships all four, and vaul makes the sheet trivial. The design work is choosing which interruption the task deserves.',
    sections: [
      {
        heading: 'Modals stop the world and demand a decision',
        body:
          'A modal centers, veils the page, traps focus, and takes over the escape key. It is the correct surface for irreversible or credential-shaped actions: confirm delete, sign in, submit payment, resolve a merge conflict.\n\nModals fail when they are used for browsing (the user wants the underlying page back) or for anything longer than a paragraph (they become mini-apps). Radix Dialog and shadcn Dialog give you the accessibility scaffolding for free: focus trap, aria-modal, restore focus on close. Use a modal when the user cannot productively do anything else until the answer exists.',
      },
      {
        heading: 'Drawers slide from an edge and let the page keep breathing',
        body:
          'A drawer enters from left, right, top, or bottom, and typically keeps the underlying page visible and often interactive. It is the right choice for detail views that would be a drill on desktop but need a lighter feel: filter panels, cart summaries, quick-create forms, secondary navigation.\n\nRadix Dialog with a side variant, shadcn Sheet, and vaul all render drawers with proper focus handling. Drawers pair well with peek patterns: click a row, drawer opens with detail, close with Escape or a click on the veil. Keep them narrow enough that context stays.',
      },
      {
        heading: 'Popovers anchor to a trigger and disappear on outside click',
        body:
          'Popovers attach to a button, cell, or word. They open on click (never hover for anything interactive), stay small, and close on outside click or Escape. They are ideal for date pickers, quick edits, action menus, and inline filters.\n\nThe rule: if the popover needs a title bar, or if it takes more than a few interactions to finish, it wants to be a drawer. Radix Popover positions itself with Floating UI under the hood, handles the collision detection, and keeps focus tethered to the trigger. Do not confuse popover with tooltip, which is hover-only and non-interactive.',
      },
      {
        heading: 'Sheets rise from the bottom on touch and mimic native modality',
        body:
          'A sheet is the mobile-native drawer, snapping to detents (a peek height, a half height, a full height). Emil Kowalski\'s vaul made the pattern trivial on the web.\n\nSheets are correct on touch surfaces where a centered modal feels imported from desktop. On desktop they degrade to a drawer or a dialog. Sheets are also the right home for quick actions that would otherwise be a modal on mobile: share menus, add-to-list, filter panels. Snap points are the interaction: peek to preview, drag up to commit.',
      },
    ],
    takeaways: [
      'Ask what the user must lose access to. Full page (modal), partial page (drawer), only the anchor (popover), device screen (sheet).',
      'Popovers open on click, tooltips on hover. Never swap them.',
      'If a modal grows past one screen, it is a page. Give it a route.',
      'On mobile, prefer a sheet with detents over a centered dialog. It respects touch physics.',
    ],
    terms: [
      { term: 'Modal', meaning: 'Centered dialog that veils the page and traps focus.' },
      { term: 'Drawer', meaning: 'Edge-anchored panel that keeps the page visible.' },
      { term: 'Popover', meaning: 'Trigger-anchored small surface, closes on outside click.' },
      { term: 'Sheet', meaning: 'Bottom-rising overlay with snap points, mobile-native.' },
      { term: 'Focus trap', meaning: 'Focus stays inside the surface until it closes.' },
      { term: 'Escape hatch', meaning: 'The keys and clicks that dismiss the surface.' },
    ],
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
      'When the task is triage across many rows, keep the list on screen. Master-detail turns a modal marathon into a keyboard glide.',
    readTime: '~5 min read',
    diagram: '/lessons/de/de-ci-master-detail.png',
    diagramCaption:
      'Superhuman\'s split inbox: list of messages on the left, active message pane on the right, keyboard driving the loop.',
    whyItMatters:
      'The choice between modal-per-row and master-detail is not a preference, it is a productivity multiplier. Every modal open-close is a full context reset: veil in, veil out, focus lost, scroll position uncertain. If the user is going to visit ten rows in a row (inbox triage, bug queue, candidate pipeline, order review), that ceremony compounds. Master-detail keeps the list as the axis and moves only the detail. Superhuman, Linear, Sentry, and Apple Mail are all master-detail because the shopping pattern (glance, decide, next) is exactly what their users do.',
    sections: [
      {
        heading: 'The shopping pattern is the tell',
        body:
          'Ask: does the user visit many rows in a session and decide something about each. If yes, that is shopping. Email triage is shopping. Reviewing a queue of alerts is shopping. Comparing candidates in an ATS is shopping.\n\nFilling one form on one row is not shopping. Editing a single settings page is not shopping. If the answer is "one row, one deep task, done," a drill or a modal is fine. If the answer is "many rows, quick decisions, keep moving," the list must never disappear. Modal-per-row for shopping is a UX tax paid on every keystroke.',
      },
      {
        heading: 'Keyboard navigation is the whole point',
        body:
          'The reason master-detail beats modals for shopping is that arrow keys become the primary control. Down-arrow to next row, Enter to open, E to archive, R to reply, J and K for Vim keys, all without leaving the list.\n\nThis is impossible with a modal, because Escape has to be pressed between every row, and focus has to return, and the modal has to reopen. Superhuman is famous because the keyboard loop closes in a millisecond. Copy that loop and the app feels faster than it is.',
      },
      {
        heading: 'Split ratio is the design decision',
        body:
          'A split-pane list-detail is only good if the ratio serves the task. Rules that hold up across products: list takes 30 to 40 percent when detail is text-heavy (email, issues), 40 to 50 percent when the list has enough columns to be tabular (candidates, orders), and the detail pane needs its own scroll independent of the list.\n\nOn narrow viewports, master-detail collapses to a stack: list is the route, detail is a route or a full-height sheet. Do not try to preserve the split on mobile. It fails on both panes.',
      },
      {
        heading: 'Deep-link the detail without breaking the list',
        body:
          'The one mistake master-detail products make is losing the URL. If clicking a row does not change the URL, the user cannot share, cannot bookmark, and cannot back-button between details.\n\nThe pattern that works: parent route holds the list, a child route (e.g., /inbox/:id) selects the detail. The list stays mounted, the detail swaps. Next.js parallel routes, Remix nested routes, and TanStack Router all support this cleanly. Do this and the app feels like a native client with the affordances of the web.',
      },
    ],
    takeaways: [
      'Modal-per-row is fine for one edit. Master-detail is required when the task is triage.',
      'Keyboard is the point: arrow, Enter, action key, next. If that loop is not there, master-detail is being wasted.',
      'Split ratio is roughly 30 to 40 percent list for text-heavy detail. Independent scroll on each pane.',
      'Give the detail its own URL. A master-detail without deep links is a broken master-detail.',
    ],
    terms: [
      { term: 'Master-detail', meaning: 'Split-pane pattern with a list and a synchronized detail.' },
      { term: 'Shopping pattern', meaning: 'Visiting many rows to decide something about each.' },
      { term: 'Peek', meaning: 'Detail preview alongside the list.' },
      { term: 'Nested route', meaning: 'Child URL that renders inside a parent route\'s layout.' },
      { term: 'Action key', meaning: 'Single-key shortcut that operates on the focused row.' },
      { term: 'Split ratio', meaning: 'The width proportion between list pane and detail pane.' },
    ],
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
      'Designing keyboard-first is not about adding shortcuts. It is about routing the primary tasks through the keyboard and rendering the mouse for exploration.',
    readTime: '~5 min read',
    diagram: '/lessons/de/de-ci-keyboard-first.png',
    diagramCaption:
      'A cmdk command palette: Cmd K opens a fuzzy-ranked list of every action, route, and entity.',
    whyItMatters:
      'Every product ships with a mouse. The keyboard-first ones ship with a philosophy: expert users should never have to lift their hands to move faster. Linear, Superhuman, Raycast, and Notion each built a fanbase by respecting the keyboard as a first-class input, not by sprinkling shortcuts as an afterthought. Keyboard-first also improves accessibility, tab order, and focus management by default. It changes the shape of the app: navigation lives in an omni-command palette, actions get single-key mnemonics, and the mouse is left free for the things a mouse is actually good at.',
    sections: [
      {
        heading: 'The command palette is the entry point, not a search box',
        body:
          'Cmd K opens a fuzzy-searchable palette that indexes every action, every route, and every entity. It is not a decorated search box. It is the front door for keyboard users, the way Spotlight is on macOS.\n\npaco.me\'s cmdk library is the current de-facto primitive: React, unopinionated, ships accessibility for free. Rules that keep the palette useful: rank recent actions higher, show the shortcut next to each item so users learn shortcuts by using the palette, and always let Escape close it. If the palette becomes a graveyard, the app has no keyboard identity.',
      },
      {
        heading: 'Single-key mnemonics beat chorded shortcuts for high-frequency actions',
        body:
          'Chorded shortcuts (Cmd Shift D) are for rare or destructive actions. High-frequency actions want single keys or two-key sequences. Superhuman archives with E, replies with R, forwards with F. Linear creates with C, assigns with A. Gmail has been doing this since 2004.\n\nThe rule: the more often the action happens, the shorter the shortcut should be, and the mnemonic should match the verb. Use two-key sequences (g then i for "go to inbox") when a namespace helps: g for go, o for open, y for yank. This is Vim\'s grammar and it works.',
      },
      {
        heading: 'Focus rings are the compass, not decoration',
        body:
          'Keyboard users navigate by focus. If focus is invisible, the app is unusable without a mouse. WCAG 2.2 Success Criterion 2.4.11 requires focus to be visible and not entirely obscured.\n\nDesign a focus token (a ring color, an offset, a width) and use it everywhere. Tailwind\'s ring utilities and Radix\'s data-focus-visible attribute make this cheap. Also design the tab order: the DOM order is the tab order, so structure markup so tabbing reads like a sentence, not a maze. Trap focus in modals, restore focus on close.',
      },
      {
        heading: 'Discoverability is solved by a hint layer, not by removing shortcuts',
        body:
          'The classic objection is "shortcuts are for power users." The classic answer is a hint layer. Show ? to open a shortcut cheatsheet (Linear, GitHub, Vercel do this). Reveal the shortcut inside tooltips and menu items. Highlight the underlined letter in a menu when Alt is held.\n\nUsers learn shortcuts by seeing them next to actions they already use. This makes the keyboard progressive: mouse first, then palette, then muscle memory. The app teaches itself.',
      },
    ],
    takeaways: [
      'The command palette is the front door. Every action, every route, ranked by recency, closed by Escape.',
      'Match shortcut length to action frequency. Short keys for common verbs, chords for rare or destructive.',
      'WCAG 2.2 requires visible focus. Design one focus token and apply it everywhere.',
      'Discoverability comes from a hint layer: ? cheatsheet, shortcuts in tooltips and menus.',
    ],
    terms: [
      { term: 'Command palette', meaning: 'Fuzzy-searchable list of every action, entity, and route.' },
      { term: 'Chorded shortcut', meaning: 'Multi-key combination like Cmd Shift D.' },
      { term: 'Mnemonic', meaning: 'Single-letter shortcut matched to a verb (E for archive).' },
      { term: 'Focus ring', meaning: 'Visible outline that shows which element has keyboard focus.' },
      { term: 'Tab order', meaning: 'Sequence keyboard focus follows through the DOM.' },
      { term: 'Focus trap', meaning: 'Focus stays inside an overlay until it is closed.' },
    ],
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
      'A screen designed only for the happy path is a screen that has not been designed. Four non-happy states are the floor.',
    readTime: '~5 min read',
    diagram: '/lessons/de/de-ci-four-states.png',
    diagramCaption:
      'Vercel\'s new project empty state: a headline that names the value, a primary action, and a link to docs.',
    whyItMatters:
      'Design tools show mocks with data. Production shows the states in between. When I ship a screen that only renders when the request succeeds and the array has items, I have delivered a screenshot, not a screen. The four states most screens owe (empty, loading, skeleton, error) are not decoration; they are the difference between a product that feels finished and one that feels like a demo. Every dashboard I ship goes through a checklist: what does a new user see, what does a slow connection see, what does the backend down look like.',
    sections: [
      {
        heading: 'Empty is a first-run experience, not "nothing to show"',
        body:
          'An empty state is the user\'s first meeting with a feature. Vercel\'s new project page, Stripe\'s dashboard before any charges, Linear\'s inbox at zero: each is designed to teach the feature, not apologize for it.\n\nThe pattern that works: a short headline naming the value ("Deploy your first project"), one primary action ("New Project"), and a secondary link to docs or samples. Never use "No data" as the empty state. That is telling the user the app is broken. Empty states are the highest-leverage onboarding surface in the app.',
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
          'The classic mistake is to build the happy state, then bolt on the others when QA complains. The fix is a state chart up front: for every screen, list empty, loading, skeleton, error, and success, then also partial success (some rows failed), offline, stale (last-updated a while ago), and permissioned-out (403).\n\nThis is engineering rule 1 restated. XState makes the chart machine-readable; a Notion table works fine for smaller apps. Either way, the chart forces you to design the states nobody asked about, which are the ones that ship broken.',
      },
    ],
    takeaways: [
      'Empty is onboarding: headline, primary action, secondary link. Never "No data."',
      'Spinner for unknown shape, skeleton for known shape. Never both at once.',
      'Errors name what, why, next. Retry, contact, go back.',
      'Enumerate the states before the components. Empty, loading, skeleton, error, partial, offline, stale, permissioned-out.',
    ],
    terms: [
      { term: 'Empty state', meaning: 'First-run screen when the collection is legitimately zero.' },
      { term: 'Skeleton', meaning: 'Placeholder that outlines final layout while data loads.' },
      { term: 'Partial error', meaning: 'Some data loaded, some failed, both must render honestly.' },
      { term: 'Stale state', meaning: 'Cached data shown while a background refresh runs.' },
      { term: 'Perceived latency', meaning: 'How slow the user feels the app is, not the ms figure.' },
      { term: 'State chart', meaning: 'Enumeration of every state a screen can be in.' },
    ],
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
          '"No data" is telling the user the app is broken.\n\nan empty state is the user\'s first meeting with a feature. Vercel\'s new project page, Stripe pre-charges, Linear\'s zero inbox - all designed to teach the feature, not apologize for it.\n\nheadline that names the value. one primary action. one link to docs. that is the highest-leverage onboarding surface in the app.',
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
      'Optimistic UI trades a small rollback cost for a large latency win. It is only correct when your write error rate is genuinely low, and when the rollback is graceful.',
    readTime: '~5 min read',
    diagram: '/lessons/de/de-ci-optimistic-ui.png',
    diagramCaption:
      'Vercel AI SDK\'s optimistic streaming: the user turn is reserved immediately, the assistant turn grows token by token.',
    whyItMatters:
      'Optimistic UI is the reason X likes feel instant, Linear checkboxes flip without lag, and Vercel AI SDK streams feel alive. The mechanism is simple: update the UI as if the server agreed, then reconcile when the response arrives. The bet is that the server almost always agrees, so users almost always get instant feedback for the cost of designing one rollback path. When error rates rise, that bet flips. If one in twenty requests fails, one in twenty users sees their like un-like itself. That is not delight, that is haunted UI.',
    sections: [
      {
        heading: 'The four things every optimistic write needs',
        body:
          'An optimistic write is not just "setState first, mutate second." It needs four pieces: a stable local id so the server response can find its target, a shape-compatible optimistic payload (client-side timestamps, placeholder counts), an idempotent mutation on the server so retries do not duplicate, and a rollback strategy that names both the visual undo and the data undo.\n\nReact Query and TanStack Query bake this in with onMutate and onError. Miss any of the four and the "instant" UX becomes a bug factory when the network wobbles.',
      },
      {
        heading: 'Design the rollback with the same care as the happy path',
        body:
          'A silent rollback is worse than no optimism at all: the user sees their action, then it disappears, and they conclude the app is buggy. The fix is to name the failure. Show a toast ("Could not save, retrying"), keep the failed row visually distinct until it succeeds or the user dismisses it, and offer a manual retry.\n\nSonner (from Emil Kowalski) is the current de-facto toast primitive for this. For destructive actions (delete), pair optimism with an undo window instead: soft-delete for five seconds, then commit, and the "undo" is a real cancel.',
      },
      {
        heading: 'Latency budgets tell you when optimism is unnecessary',
        body:
          'If a request finishes in under 100ms in the p95 case, optimism is theater: the user cannot see the difference, and you have added rollback complexity for zero perceived gain.\n\nOptimism earns its keep between 200ms and 2 seconds, which is where users notice latency but have not given up. Above 2 seconds, optimism becomes a lie: the user assumes success, moves on, and you have to interrupt them with a failure. Measure p95 latency for the mutation, decide by the number, do not optimism-by-default.',
      },
      {
        heading: 'Streaming responses want incremental optimism, not all-or-nothing',
        body:
          'For chat, generation, or any streamed response, the optimistic pattern shifts: reserve the user message immediately, then stream the assistant response into a placeholder that grows. Vercel AI SDK\'s useChat hook does this out of the box.\n\nThe user turn is optimistic (rollback if the request rejects), the assistant turn is incremental (append tokens as they arrive). If the stream fails mid-way, keep the tokens you got, mark the message as errored, and offer regenerate. This is the modern shape of optimistic UI for LLM apps.',
      },
    ],
    takeaways: [
      'Optimistic UI is a bet on your write error rate. Under 1 percent, it is a win. Over 5 percent, it is a lie.',
      'Every optimistic write needs: local id, shape-compatible payload, idempotent mutation, rollback path.',
      'A silent rollback is worse than no optimism. Toast the failure, keep the row distinct, offer retry.',
      'Measure p95 latency first. Under 100ms is theater. 200ms to 2 seconds is the sweet spot.',
    ],
    terms: [
      { term: 'Optimistic update', meaning: 'UI change applied before the server confirms.' },
      { term: 'Rollback', meaning: 'Reverting the UI when the server rejects.' },
      { term: 'Idempotent', meaning: 'A request that produces the same result if retried.' },
      { term: 'Reconcile', meaning: 'Merging server truth with the optimistic local state.' },
      { term: 'p95 latency', meaning: 'Latency at which 95 percent of requests complete faster.' },
      { term: 'Undo window', meaning: 'A pause before commit so the user can cancel.' },
    ],
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
      'Every sticky element competes for the same top of the stack. Without a z-index budget, position sticky and fixed become a bidding war that ends in z-index 99999.',
    readTime: '~5 min read',
    diagram: '/lessons/de/de-ci-z-index-budget.png',
    diagramCaption:
      'MDN\'s stacking context primer: which ancestors trap children, why a modal at 9999 can still hide behind a sidebar.',
    whyItMatters:
      'Every product ships sticky headers, sticky sidebars, floating action bars, drawers, modals, toasts, tooltips, and popovers. Each of those wants to be on top of some things and below others. Without a plan, developers pick numbers by feel, and six months in the design system has 15 different z-index values, none of which agree with each other. A modal ends up below a toast. A tooltip clips inside a sticky header. The fix is not adding another zero. The fix is a z-index budget: a small, named ladder of layers that every sticky element must claim from.',
    sections: [
      {
        heading: 'Stacking contexts, not z-index, decide what wins',
        body:
          'The rookie mistake is thinking a high z-index makes an element render on top. z-index only orders siblings inside the same stacking context. Any ancestor with position: relative and a z-index, or with transform, filter, opacity < 1, will-change, or isolation: isolate, creates a new stacking context, and children are trapped inside it.\n\nThat is why a modal with z-index: 9999 disappears behind a sidebar with transform: translateZ(0). MDN and CSS-Tricks both cover this. Learn the rule once, then build the layer system.',
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
    ],
    takeaways: [
      'Six named layers cover everything: base, raised, sticky, overlay, modal, popover. Nothing else gets a z-index.',
      'z-index only orders inside a stacking context. transform, filter, opacity all create new ones and trap children.',
      'Use position sticky for scrolled headers. overflow hidden on any ancestor silently breaks it.',
      'Portal any surface that must overlay the whole page. Modals, drawers, sheets, toasts, popovers.',
    ],
    terms: [
      { term: 'Stacking context', meaning: 'A group of elements whose z-index is compared among themselves.' },
      { term: 'Portal', meaning: 'React node rendered into a different DOM subtree.' },
      { term: 'position sticky', meaning: 'Element sticks within its scrolling ancestor.' },
      { term: 'position fixed', meaning: 'Element pinned to the viewport, removed from flow.' },
      { term: 'z-index budget', meaning: 'Named ladder of allowed z-index values.' },
      { term: 'isolation isolate', meaning: 'CSS property that starts a stacking context explicitly.' },
    ],
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
