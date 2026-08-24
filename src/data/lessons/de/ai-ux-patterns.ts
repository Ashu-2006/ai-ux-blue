import type { Lesson } from '@/lib/lessons';

// Design engineering · AI UX patterns
// Nine lessons authored from vault notes in
// C:\Users\ashut\Vault\20 Areas\Design Engineering\AI-UX-Patterns\
// Voice mirrors phase12-part1.ts: lowercase hooks, short lines, no emojis.

export const deAiUxPatterns: Lesson[] = [
  {
    id: 'de-ai-non-determinism',
    phase: 'Design engineering',
    part: 'AI UX patterns',
    index: 'DE.AX.01',
    title: 'Non-determinism is a UX contract, not an engineering detail',
    oneLiner:
      'A model returns a different answer to the same prompt on the same day. If the UI pretends otherwise, the user calls it broken. The design job is to make variance legible without making it feel unreliable.',
    readTime: '~6 min read',
    diagram: '/lessons/de/de-ai-non-determinism.png',
    diagramCaption:
      'One prompt becomes a run, which becomes a stored version, which lives in a tray. Regenerate stacks new versions instead of overwriting the old one.',
    whyItMatters:
      'Designers reach for AI expecting a database and get a distribution. Two people run the same query and see different rankings, different phrasings, different citations. Under determinism, the fix is to hide the seams. Under non-determinism, the seams are the product: the run is one draft of many, and the user needs affordances to compare, regenerate, and pin what they liked. Ignore this and every session becomes an argument with the model. Design it and variance turns into iteration, which is what people actually want from generative tools.',
    sections: [
      {
        heading: 'Same prompt, different answer, is the default, not the bug',
        body: 'Sampling temperature, tool ordering, tool latency, retrieval freshness, and speculative decoding all inject variance. Perplexity re-runs the same query and returns different source orderings within minutes as the index shifts. Claude regenerations rewrite paragraphs even at low temperature because the tool graph resolves differently.\n\nThe UI has to teach this in one glance: a regenerate control that reads as expected, a subtle timestamp on the answer, a version tray that keeps prior runs one click away. Do not present variance as an error state, and do not silently overwrite the previous run.',
      },
      {
        heading: 'Show the run as a versioned artifact, not a live prop',
        body: 'Treat each answer as a stored version, not a screen state. Give it an id, a timestamp, and a shareable anchor. Claude\'s artifact panel and ChatGPT canvas both do this: the answer sits in a container with a history, and regenerate stacks new versions rather than mutating the old one.\n\nThis flips the mental model from "the model changed its mind" to "I have three drafts to compare." For lists (search results, product picks) the same applies: pin the ranking the user is discussing, and mark the run they were looking at when they asked the follow-up.',
      },
      {
        heading: 'Pin the seed, publish the parameters, or you cannot support the user',
        body: 'If the user says "the answer was different yesterday," you need something to correlate. Store the model id, the prompt hash, the tool call trace, and the seed when the provider exposes one. Surface at least a short version stamp in the UI so support tickets carry a lookup key.\n\nThis is the AI equivalent of a build number. Without it, every reproducibility question becomes a guessing game, and the design team gets blamed for what is really a missing engineering primitive.',
      },
      {
        heading: 'Design the regenerate control like a real affordance, not a refresh icon',
        body: 'Regenerate is the primary way users negotiate with a non-deterministic system, yet most products bury it behind a small circular arrow. Give it label, hit target, and enough weight to read as a first-class action.\n\nDistinguish "regenerate with same prompt" from "regenerate with a different model" and "regenerate this paragraph only." Bracket it with edit and copy so the user\'s real question, which is "what do I do with this draft," has three answers side by side. Regenerate is not undo. It is a new roll of the dice, and the UI has to say so.',
      },
    ],
    takeaways: [
      'Treat every answer as a stored version with an id, a timestamp, and a diff against the previous run.',
      'Non-determinism is a feature to surface, not a bug to hide, and regenerate is its primary affordance.',
      'Log model id, prompt hash, tool trace, and seed so a support conversation has a lookup key.',
      'If the user cannot pin, compare, or return to a prior run, the product is silently gaslighting them.',
    ],
    terms: [
      { term: 'Non-determinism', meaning: 'Same input can yield different outputs across runs.' },
      { term: 'Temperature', meaning: 'Sampling parameter that widens or narrows the output distribution.' },
      { term: 'Seed', meaning: 'Integer that fixes the random draw when the provider exposes one.' },
      { term: 'Version tray', meaning: 'UI surface that keeps prior generations one click away.' },
      { term: 'Regenerate', meaning: 'Explicit user request for a new draw with the same prompt.' },
      { term: 'Trace id', meaning: 'Correlation key that ties a UI answer back to a stored run.' },
    ],
    demoCaption:
      'The card claims "same query, same result." Reveal the run trace and two different source orderings fall out. The pretense is the failure. The exposed run is the fix.',
    demo: {
      archetype: 'reveal',
      subject: 'Perplexity re-run',
      opaqueLabel: 'Same query, same result',
      revealedLines: [
        'run_a  seed=none  16:02:41',
        '  1. nyt.com    2. reuters    3. bloomberg',
        'run_b  seed=none  16:02:58',
        '  1. reuters    2. bloomberg  3. nyt.com',
        'delta: source ordering swapped, verdict text rewritten',
      ],
      badCaption:
        'The UI presents one answer as the answer. Two runs seconds apart return different orderings, and the reader has no way to see it.',
      goodCaption:
        'Each run becomes a stored version with a timestamp and a diff. Variance is exposed as iteration, not hidden as a bug.',
      badLines: [],
      goodLines: [],
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'same prompt, different answer, is the default.',
        body:
          'same prompt, different answer, is the default.\n\ntemperature, tool ordering, retrieval freshness, speculative decoding. all of them inject variance. even at temperature 0 the tool graph resolves differently and the paragraph rewrites.\n\nyour database intuition does not survive contact with a distribution.',
      },
      {
        kind: 'X · design angle',
        hook: 'a regenerate icon the size of a refresh icon is a design bug.',
        body:
          'a regenerate icon the size of a refresh icon is a design bug.\n\nregenerate is the primary way users negotiate with a non-deterministic system. it earns a label, a hit target, and a version tray behind it.\n\nif your product cannot let the user pin, compare, and return to a prior run, it is silently gaslighting them.',
      },
      {
        kind: 'X · one-liner',
        hook: 'non-determinism is not a bug you hide. it is a feature you surface.',
        body:
          'non-determinism is not a bug you hide. it is a feature you surface.\n\nevery answer is a version. every regenerate is a new draw. every session is three drafts, not one live prop.',
      },
    ],
    source: {
      label: 'Vault note: Non-determinism is a UX contract, not an engineering detail',
      url: 'https://futureagi.com/glossary/time-to-first-token/',
    },
  },

  {
    id: 'de-ai-ttft-latency',
    phase: 'Design engineering',
    part: 'AI UX patterns',
    index: 'DE.AX.02',
    title: 'Model latency is a design constraint measured in TTFT, not TTLB',
    oneLiner:
      'Users judge an AI product by the moment the first token appears, not when the last one finishes. Design the wait against Time To First Token, not Time To Last Byte.',
    readTime: '~6 min read',
    diagram: '/lessons/de/de-ai-ttft-latency.png',
    diagramCaption:
      'Between submit and last byte lie four events: container render, first token, inter-token gap, last token. The user only feels the first two.',
    whyItMatters:
      'Backends optimize total completion time. Users optimize the feeling of "did anything happen." A 0.4s TTFT with a slow tail feels faster than a 1.2s TTFT with a fast tail, even when the second finishes first. If the designer measures the wrong number, the loading pattern gets the wrong shape: a skeleton for a stream, a spinner for a peek, a shimmer for a decision. Pick TTFT as the constraint and the whole loading vocabulary changes: prime the surface, hint the shape, land the first token, then keep the stream visible until the tail arrives.',
    sections: [
      {
        heading: 'TTFT is the perception latency, TTLB is the throughput latency',
        body: 'TTFT is the interval from request to the first byte the client can render. TTLB is request to the last byte. Chat perception lives on TTFT.\n\nField data from Anyscale and industry benchmarks put the thresholds around 200ms feels instant, 500ms feels lagged, 800ms tips people into abandonment. TTLB matters for long-form (a full artifact, a batch job) and for downstream steps that gate on completion. Design against both, but name TTFT as the one the interface owes the user.',
      },
      {
        heading: 'Prime the surface before the first token lands',
        body: 'Under 200ms you can render intent: an empty answer block with a caret, a placeholder card with a shape that hints at the reply type, or a status line ("searching your docs"). The user sees "the system heard me."\n\nVercel\'s AI SDK templates render the answer container immediately and stream tokens into it, which is why an 800ms TTFT feels shorter there than the same latency in a form that only reveals on completion. If the surface arrives late, the wait feels late, even when the model is fast.',
      },
      {
        heading: 'Progress must be honest, not decorative',
        body: 'A shimmer that repeats forever is a lie. If the stream has stalled, say so; if a tool call is running, name it; if a retry is in flight, show it. Cursor\'s composer names each subtask, ChatGPT\'s plan mode shows tool steps as they resolve.\n\nNever confuse loading with progress. Loading says something is happening. Progress says how much has happened, and it fails loudly when the model gets stuck.',
      },
      {
        heading: 'Cost of skipping ahead: fake speed feels worse than real waiting',
        body: 'Products sometimes stream junk (filler intros, restated question) to hit low TTFT. The number improves; trust drops. The user learns that the first tokens are not signal, and their eyes skip to the middle.\n\nBetter designs invest the first tokens in the answer itself: the number, the verdict, the recommendation, then the reasoning. This aligns TTFT with information value, which is the actual thing users are timing. If your model cannot lead with the answer, cache and precompute the lead so it can.',
      },
    ],
    takeaways: [
      'Target TTFT under 500ms P95 for chat, under 300ms for anything voice-adjacent.',
      'Render the answer container before the first token arrives, so the surface is not part of the wait.',
      'Use progress language that fails loudly: name the tool, name the step, name the retry.',
      'First tokens are ad copy for the whole answer. Spend them on the verdict, not the throat-clear.',
    ],
    terms: [
      { term: 'TTFT', meaning: 'Time from request to first token rendered on the client.' },
      { term: 'TTLB', meaning: 'Time from request to last token, the completion latency.' },
      { term: 'ITL', meaning: 'Inter-token latency, the gap between successive tokens once streaming starts.' },
      { term: 'Prefill', meaning: 'Prompt processing pass that dominates TTFT for long contexts.' },
      { term: 'Skeleton', meaning: 'Placeholder that reserves layout while the stream loads.' },
      { term: 'P95 latency', meaning: 'Latency below which 95 percent of requests complete.' },
    ],
    demoCaption:
      'The headline says "answered in 8s." Break it down and the truth is a 400ms first token versus a 3s first token, hidden inside the same average. TTLB averages lie about the wait users actually feel.',
    demo: {
      archetype: 'meter',
      headline: 'avg answered in 8.0s',
      breakdown: [
        { label: 'run 1  TTFT', value: 400 },
        { label: 'run 2  TTFT', value: 620 },
        { label: 'run 3  TTFT', value: 3000 },
      ],
      badCaption:
        'The rollup shows one number the backend team is proud of. The user experience is bimodal: some sessions feel instant, some feel abandoned.',
      goodCaption:
        'The distribution shows the P95 that actually shipped. This is the wait the interface owes the user, and the number the design team should hold.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'users do not feel completion time. they feel first token time.',
        body:
          'users do not feel completion time. they feel first token time.\n\nTTFT is submit to first byte the client can render. TTLB is submit to last byte. chat perception lives on TTFT.\n\n200ms feels instant. 500ms feels lagged. 800ms tips into abandonment. optimize the one people actually time.',
      },
      {
        kind: 'X · design angle',
        hook: 'the answer container should exist before the first token does.',
        body:
          'the answer container should exist before the first token does.\n\nrender the block, the caret, and the "searching your docs" status under 200ms. now an 800ms TTFT feels short instead of long. the wait is not the model, it is the surface arriving late.\n\nprime the frame, then stream into it.',
      },
      {
        kind: 'X · one-liner',
        hook: 'first tokens are ad copy. spend them on the verdict.',
        body:
          'first tokens are ad copy. spend them on the verdict.\n\nfiller intros and restated questions hit low TTFT and destroy trust. the model that opens with the number wins the second the eye lands. lead with the answer, then the reasoning.',
      },
    ],
    source: {
      label: 'Vault note: Model latency is a design constraint measured in TTFT, not TTLB',
      url: 'https://futureagi.com/glossary/time-to-first-token/',
    },
  },

  {
    id: 'de-ai-streaming-shapes',
    phase: 'Design engineering',
    part: 'AI UX patterns',
    index: 'DE.AX.03',
    title: 'Streaming UI has three shapes: token stream, partial JSON, component tree',
    oneLiner:
      '"Streaming" is not one pattern. It is three, and each one demands a different container, a different loading state, and a different failure mode.',
    readTime: '~6 min read',
    diagram: '/lessons/de/de-ai-streaming-shapes.png',
    diagramCaption:
      'Three ladders of commitment. Tokens append into text. Keys resolve into fields. Nodes mount into a tree. Each ladder needs its own container and its own fail state.',
    whyItMatters:
      'Designers ship one streaming component and reuse it for everything. That is why AI products feel inconsistent: a chat reply reads well, a structured card flickers, a generative panel shows a half-rendered ghost. The three shapes have different physics. Token streams append characters. Partial JSON accumulates keys before values. Component trees mount and hydrate as the model emits nodes. If the container assumes one shape and the model emits another, the interface looks broken even when the model is right. Pick the shape first, then design the surface.',
    sections: [
      {
        heading: 'Token streaming is prose landing character by character',
        body: 'This is the ChatGPT, Claude, Perplexity default. The container is a text block, the loading state is a caret or shimmer at the tail, and the fail mode is a truncated sentence with a retry.\n\nDesign decisions live in typography: line-height that does not jump as tokens land, code fences that render partial fences without collapsing, and a stable cursor that never leaves the reader guessing. Reveal actions (copy, regenerate, edit) after the last token, not during. If actions live on hover, keep them consistent while streaming so the answer does not shift under the pointer.',
      },
      {
        heading: 'Partial JSON is a form filling itself in',
        body: 'Structured outputs stream by key: `{"title": "..."` arrives, then `"summary": "..."`, then `"items": [...`. The container is a form or card, not a paragraph.\n\nVercel\'s AI SDK exposes `useObject` for this, streaming into a Zod schema so each field renders as soon as its value closes. Design decisions: skeletons per field, ordered emission that puts the highest-signal field first (verdict before evidence), and a visible resolve for arrays that grow. Never let the whole card wait on the last key.',
      },
      {
        heading: 'Component tree streaming is UI the model writes',
        body: 'The model emits nodes and the client mounts them. Vercel\'s `streamUI` returns React Server Components, OpenAI\'s Apps SDK renders HTML/CSS/JS bundles inline in ChatGPT, Anthropic\'s artifacts stream a full document into a side pane.\n\nThe container is a canvas or panel with its own scroll and actions. Design decisions: reserve the panel before the first node arrives, keep node identity stable so React does not remount on every token, and treat interactivity (buttons, inputs) as arriving late. Users click into a half-hydrated tree, so disable actions until the node\'s props are complete.',
      },
      {
        heading: 'The three shapes have three failure modes',
        body: 'Token stream fails with an incomplete sentence: recover by showing the partial answer, a clear stop badge, and retry.\n\nPartial JSON fails with an invalid document: recover by rendering the fields you got and refusing the ones that never closed. Do not throw the whole card away.\n\nComponent tree fails with a mounted but broken subtree: recover by unmounting the bad node and streaming a repair. The worst pattern is a generic "something went wrong" that discards a paragraph the user could have used.',
      },
    ],
    takeaways: [
      'Name the shape before styling the surface. Token stream, partial JSON, component tree, pick one per surface.',
      'Emit high-signal fields first so the container is useful before the last byte lands.',
      'Reserve layout for the whole answer at t0, then stream into it. Never resize the page under the user.',
      'Failure recovery differs by shape. Do not paper over three modes with one error state.',
    ],
    terms: [
      { term: 'Token stream', meaning: 'Character or token append into a text container.' },
      { term: 'Partial JSON', meaning: 'Structured object whose keys resolve incrementally.' },
      { term: 'Component tree', meaning: 'Server or model emitted UI nodes mounted on the client.' },
      { term: 'streamUI', meaning: 'Vercel AI SDK function that streams React Server Components.' },
      { term: 'useObject', meaning: 'AI SDK hook that binds a partial JSON stream to a schema.' },
      { term: 'Hydration', meaning: 'Attaching client behavior to a server rendered node.' },
    ],
    demoCaption:
      'Step through one request as it arrives in three shapes: tokens append into prose, keys resolve into a form, nodes mount into a panel. Each rung of the ladder is a different commitment the UI has to honor.',
    demo: {
      archetype: 'sequence',
      badLabel: 'One container',
      goodLabel: 'Three shapes',
      badSequence: [
        'the model streams text',
        'the container is a paragraph',
        'a JSON stream flickers',
        'a component tree ghosts',
        'one fail state hides three failures',
      ],
      goodSequence: [
        'token stream  paragraph, caret at tail',
        'partial JSON  form, per-field skeleton',
        'component tree  panel, node identity stable',
        'fail: truncated sentence, keep partial + retry',
        'fail: invalid doc, keep closed fields',
        'fail: broken subtree, unmount + repair',
      ],
      badCaption:
        'One streaming container reused across three physics. Everything below prose feels broken because the container assumes the wrong shape.',
      goodCaption:
        'Each shape gets its own container and its own failure. The interface earns its consistency by naming the three ladders separately.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'streaming is not one pattern. it is three.',
        body:
          'streaming is not one pattern. it is three.\n\ntoken stream. partial JSON. component tree. each has a different container, a different loading state, and a different failure mode.\n\nyour chat reply and your generative panel are not the same component. ship them as different components.',
      },
      {
        kind: 'X · design angle',
        hook: 'partial JSON is a form filling itself in, ordered by signal.',
        body:
          'partial JSON is a form filling itself in, ordered by signal.\n\nverdict field first. evidence field last. per-field skeletons. never let the whole card wait on the last key.\n\nif your schema emits low-signal keys first, the card is a decoration until the model is done. that is a design bug in your schema.',
      },
      {
        kind: 'X · one-liner',
        hook: 'name the shape before you style the surface.',
        body:
          'name the shape before you style the surface.\n\ntokens append. keys resolve. nodes mount. three ladders, three containers, three fail states. pick one per surface and the interface stops feeling half-broken.',
      },
    ],
    source: {
      label: 'Vault note: Streaming UI has three shapes',
      url: 'https://sdk.vercel.ai/examples',
    },
  },

  {
    id: 'de-ai-generative-ui',
    phase: 'Design engineering',
    part: 'AI UX patterns',
    index: 'DE.AX.04',
    title: 'Generative UI is a component tree the model returns',
    oneLiner:
      'The model does not answer with prose. It composes an interface out of your components and hands the tree back to the client to mount. The design system stops being decoration and becomes an API.',
    readTime: '~6 min read',
    diagram: '/lessons/de/de-ai-generative-ui.png',
    diagramCaption:
      'The registry is the menu. The prompt is the order. The tree the model returns is composed from typed primitives, then mounted on the client with three verbs: regenerate, pin, explain.',
    whyItMatters:
      'For a decade, UI was a fixed set of screens the designer laid out and the developer wired to data. Generative UI inverts that: the model reads the request, picks the components, sets the props, and returns the layout. If your design system was a Figma library with loose codebase parity, the model cannot use it. If it is a typed, documented, code-connected registry of primitives, the model composes coherent screens without designer intervention. This is why AI SDK 3, OpenAI Apps SDK, and v0 all raise the ceiling for what a UI can be, and why they raise the floor for what a design system has to be.',
    sections: [
      {
        heading: 'The system prompt hands the model a component menu',
        body: 'The model does not know your components. You tell it, in the system prompt or a tool schema, that `PriceCard`, `FlightList`, `WeatherWidget`, and `RecipeSteps` exist with these props and these constraints.\n\nVercel\'s AI SDK expresses this through `streamUI` tools that resolve to React components. OpenAI Apps SDK expresses it as MCP resources that ship an HTML bundle. In both cases, the model chooses a component the way a designer chooses a Figma variant: from a finite, typed set, with props that are validated on the way in.',
      },
      {
        heading: 'Design decisions move from screen to registry',
        body: 'The composition happens at runtime, so screen-level Figma frames stop being the source of truth. What matters is the registry: which components exist, what props they take, what they are allowed to compose into, and how they degrade.\n\nThe design work is component API design plus a set of pattern rules ("Product picks always render at most three cards, always with a price and a rationale"). This is closer to writing a design lint rule than drawing a screen. If the registry is thin, the model composes junk; if the registry is thick, the same prompt yields a coherent interface across sessions.',
      },
      {
        heading: 'Interactions on generative UI need explicit escape hatches',
        body: 'The user is looking at a screen the model wrote, so they need a way to bring the model back into the loop. Three moves earn their keep.\n\nFirst, an inline action ("regenerate this card") that recomposes one node without redrawing the whole panel. Second, a pin control that stops the model from replacing a component the user is using. Third, a "why this" affordance that reveals the prompt or the tool call that produced the node. Without these, the interface behaves like a slot machine and the user has no way to steer.',
      },
      {
        heading: 'Ship a fallback for when the model returns a shape you did not register',
        body: 'The model will occasionally invent a component or pass props out of range. The client cannot render an unknown component, and it should not crash the whole tree either.\n\nDesign an `Unknown` primitive that renders a labeled block with the raw output and a "convert to text" action. This turns a hallucinated node into a debuggable one, and it lets the surrounding tree keep working. Log every fallback trigger. In an AI product, unknown components are how your design system tells you what to build next.',
      },
    ],
    takeaways: [
      'Treat your component library as the model\'s API. Types, defaults, and constraints matter more than styling.',
      'Move design work from screen frames to a registry with pattern rules and prop schemas.',
      'Generative surfaces need three verbs on every node: regenerate, pin, explain.',
      'Ship an `Unknown` fallback so hallucinated components degrade gracefully, and log every trigger.',
    ],
    terms: [
      { term: 'Generative UI', meaning: 'Interface composed by the model at runtime from a registered set.' },
      { term: 'Component registry', meaning: 'Typed catalog of primitives the model may pick from.' },
      { term: 'streamUI', meaning: 'Vercel AI SDK function that streams React Server Components.' },
      { term: 'Apps SDK', meaning: 'OpenAI protocol for shipping app UI into ChatGPT.' },
      { term: 'Artifact', meaning: 'Anthropic side pane where a full generated document lives.' },
      { term: 'Unknown fallback', meaning: 'Placeholder that renders when the model emits an unregistered node.' },
    ],
    demoCaption:
      'The plain reply says "here are your flights, in text." The generative reply picks `FlightList`, `PriceCard`, and `WeatherWidget` from the registry and returns a component tree. Same prompt, different ceiling.',
    demo: {
      archetype: 'before-after',
      subject: 'flights to Lisbon this weekend',
      badLabel: 'Prose reply',
      goodLabel: 'Composed tree',
      badLines: [
        'Here are three options for flights to Lisbon.',
        'TAP Air Portugal, Fri 08:15, from $412.',
        'Ryanair, Fri 14:40, from $287.',
        'Iberia, Sat 06:30, from $355.',
        'Weather looks clear all weekend.',
      ],
      goodLines: [
        'FlightList  3 options, sorted by price',
        'PriceCard  Ryanair $287  Fri 14:40  1 stop',
        'PriceCard  Iberia $355  Sat 06:30  direct',
        'PriceCard  TAP $412  Fri 08:15  direct',
        'WeatherWidget  Lisbon  clear  22-27 C',
      ],
      badCaption:
        'A paragraph the model wrote. Copyable, but the user cannot sort, pin, or drill into a card. The design system was decoration.',
      goodCaption:
        'A tree the model composed from typed primitives. Each node has regenerate, pin, and explain. The design system is now an API.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'the model does not answer with prose. it picks your components.',
        body:
          'the model does not answer with prose. it picks your components.\n\nyou hand it a registry in the system prompt: PriceCard, FlightList, WeatherWidget, props, constraints. it composes a tree. the client mounts it.\n\nyour design system stopped being a Figma library. it is an API.',
      },
      {
        kind: 'X · design angle',
        hook: 'generative surfaces need three verbs on every node.',
        body:
          'generative surfaces need three verbs on every node.\n\nregenerate this card. pin this card. explain this card.\n\nwithout them the interface is a slot machine and the user has no wheel. with them the model stays in the loop and the surface feels steerable.',
      },
      {
        kind: 'X · one-liner',
        hook: 'a thin registry composes junk. a thick registry composes a product.',
        body:
          'a thin registry composes junk. a thick registry composes a product.\n\ntyped props. pattern rules. Unknown fallback for the shapes you did not register. log every fallback: it is how the design system tells you what to build next.',
      },
    ],
    source: {
      label: 'Vault note: Generative UI is a component tree the model returns',
      url: 'https://vercel.com/blog/ai-sdk-3-generative-ui',
    },
  },

  {
    id: 'de-ai-grounding-spans',
    phase: 'Design engineering',
    part: 'AI UX patterns',
    index: 'DE.AX.05',
    title: 'Grounding UI cites the span, not the document',
    oneLiner:
      'A citation on a paragraph proves nothing. A citation on the clause that made the claim proves the claim. Ground at the span, not the whole source.',
    readTime: '~6 min read',
    diagram: '/lessons/de/de-ai-grounding-spans.png',
    diagramCaption:
      'Two grounding surfaces: inline chips at the clause and a filtered evidence panel by selection. Both entries hit the same source set, but the clause-level chip is a promise where the paragraph-level chip is an alibi.',
    whyItMatters:
      'Most RAG products drop a footnote at the end of a paragraph and call it grounding. The user cannot tell which sentence the source backs, so they either trust the whole answer or none of it. Perplexity, Elicit, and Consensus moved past this by attaching source chips to the exact clause they support, and by letting the reader select any span to check its sources. This is a design pattern, not a retrieval one: the model already returns per-claim sources, the UI just refuses to bury them at the end. Fix the citation surface and audit friction drops by an order of magnitude.',
    sections: [
      {
        heading: 'The chip belongs at the clause, not the paragraph',
        body: 'Attach a compact source chip (`nyt +2`) to the noun or verb the source backs, not to the paragraph. The chip does two jobs: it names the publisher so a reader can weight the claim without clicking, and it counts the corroborating sources when more than one supports the same clause.\n\nPerplexity\'s chips do both. Chips at the paragraph fail because a paragraph usually mixes claims from three sources, so the reader has to guess which chip covers which sentence. A chip at the clause is a promise. A chip at the paragraph is an alibi.',
      },
      {
        heading: 'Selection is the second grounding surface',
        body: 'Let the user select any span to see its sources. Perplexity splits this into two actions on a selection: "iterate" (follow up) and "check sources" (verify). The verify path opens a panel that lists only the sources that back the selected span, filtered from the full source list.\n\nThis is the citation equivalent of Command-F: it puts audit in the reading flow. Without span selection, the user has to hover every chip or scroll to the sources tab. With it, the audit is one drag, one click, and the reader stays in the answer.',
      },
      {
        heading: 'Ranked source lists earn their pane',
        body: 'A citation tab is not a bibliography, it is a ranked evidence panel. Order by how many claims the source supports, not by the order it was retrieved. Show a snippet from the passage that matched, not just the URL, so the reader knows why this source made the cut.\n\nElicit and Consensus both do this, with per-paper snippets and per-claim badges. If the panel is a list of URLs, the reader will not open it. If it is a ranked, snippeted, cross-referenced set, they will, and the answer becomes auditable in the reading UI itself.',
      },
      {
        heading: 'No source, no claim, or say so',
        body: 'If the model wants to state something it did not ground, the UI has to mark that clearly. A different chip color, a caveat pill, or an inline note ("no sources found for this claim") does the work.\n\nWhat must not happen is the same chip style on grounded and ungrounded claims, or worse, no chip at all, so the reader cannot tell what is quoted from what is inferred. This is the design equivalent of typed nulls: the shape of "no evidence" has to be as legible as the shape of "here is evidence."',
      },
    ],
    takeaways: [
      'Attach source chips to the clause they back, not the paragraph, and count corroborating sources on the chip.',
      'Make span selection open a filtered source list. It is the Command-F of grounding.',
      'The sources pane is a ranked evidence panel, not a bibliography. Snippet each entry.',
      'Make ungrounded claims visually distinct from grounded ones, or the citation system is a costume.',
    ],
    terms: [
      { term: 'Grounding', meaning: 'Anchoring a claim to a retrieved source.' },
      { term: 'Source chip', meaning: 'Compact inline element that names and counts sources.' },
      { term: 'Span citation', meaning: 'Citation attached to a text range rather than a whole paragraph.' },
      { term: 'Retrieval', meaning: 'Search step that returns candidate sources for the model.' },
      { term: 'Corroboration count', meaning: 'Number of sources that support the same claim.' },
      { term: 'Evidence panel', meaning: 'Ranked, snippeted list of sources with per-claim badges.' },
    ],
    demoCaption:
      'The paragraph carries one citation at the end and the reader has to guess which sentence it backs. Toggle to the clause-level version and the promise gets specific: chip on the noun, corroboration count next to it.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Perplexity answer, EV subsidies',
      badLabel: 'Paragraph citation',
      goodLabel: 'Span citation',
      badLines: [
        'The EU is phasing out combustion sales by 2035.',
        'Norway hit 90 percent EV share last quarter.',
        'US subsidies dropped in the 2025 bill.',
        'Sources: 4',
      ],
      goodLines: [
        'The EU is phasing out combustion sales by 2035.  [ec.europa +1]',
        'Norway hit 90 percent EV share last quarter.  [ssb.no]',
        'US subsidies dropped in the 2025 bill.  [reuters +2]',
        'Select any clause to open a filtered evidence panel.',
      ],
      badCaption:
        'One footnote for three claims from three sources. The reader trusts all of it or none of it, and audit means scrolling.',
      goodCaption:
        'Each clause carries the source it earned. The corroboration count is visible before the click, and selection opens a filtered evidence panel.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'a citation at the end of a paragraph proves nothing.',
        body:
          'a citation at the end of a paragraph proves nothing.\n\nthe paragraph mixes claims from three sources. the chip could back the first sentence or the last one. the reader has to trust the whole answer or none of it.\n\nchip at the clause is a promise. chip at the paragraph is an alibi.',
      },
      {
        kind: 'X · design angle',
        hook: 'span selection is the Command-F of grounding.',
        body:
          'span selection is the Command-F of grounding.\n\nselect any clause. the sources panel filters to what backs the selection. audit stays in the reading flow. no hunting through a bibliography.\n\nPerplexity, Elicit, Consensus all do this. it is a design pattern, not a retrieval one.',
      },
      {
        kind: 'X · one-liner',
        hook: 'if grounded and ungrounded claims look the same, the citation system is a costume.',
        body:
          'if grounded and ungrounded claims look the same, the citation system is a costume.\n\ndifferent chip color for ungrounded. caveat pill for "no sources found." the shape of "no evidence" has to be as legible as the shape of "here is evidence."',
      },
    ],
    source: {
      label: 'Vault note: Grounding UI cites the span, not the document',
      url: 'https://www.perplexity.ai',
    },
  },

  {
    id: 'de-ai-confidence-ux',
    phase: 'Design engineering',
    part: 'AI UX patterns',
    index: 'DE.AX.06',
    title: 'Confidence UX represents uncertainty as an affordance, not a number',
    oneLiner:
      '"87 percent confidence" is a design failure. Users cannot calibrate a percent against their own risk, and models cannot calibrate percents against reality. Turn confidence into an action a user can take.',
    readTime: '~6 min read',
    diagram: '/lessons/de/de-ai-confidence-ux.png',
    diagramCaption:
      'A percent maps to nothing the user can act on. A three-band severity plus a verb (verify, cite, explain, retry) maps every confidence state to a next click.',
    whyItMatters:
      'A confidence number pretends to be evidence. It gives the illusion of precision without giving the user anything to do. Products that show raw scores end up training users to ignore them, because a 62 percent one day feels the same as an 84 percent the next. Grammarly, Copilot, and Perplexity Pro all moved off numbers years ago. They use severity ranks, ghost text weight, hedged prose, or a "verify" affordance. The user does not need to know the number. They need to know whether this claim is safe to ship, or worth a second look, or should be checked before use.',
    sections: [
      {
        heading: 'Severity ranks beat percent scores',
        body: 'Grammarly renders suggestions as "critical," "advisory," and "enhancement" bands, with different colors and different acceptance costs. The user learns the ranks in a session and calibrates their skepticism.\n\nCopilot dims the ghost text for a lower-confidence completion so the eye reads it as "maybe" without a legend. Both encode uncertainty in the shape of the surface rather than a number in a tooltip. Humans are good at ranking three or four bands and bad at reading percents on unfamiliar scales. Design the bands and let the number drive them internally.',
      },
      {
        heading: 'Hedged prose is a UX choice, not a model quirk',
        body: 'When the model is unsure, its language should show it: "likely," "based on limited sources," "I could not verify." Perplexity Pro puts explicit source-gap notes in the answer body. Anthropic\'s system prompt instructs Claude to hedge when uncertain.\n\nThis is prose-level uncertainty design: the reader gets the confidence signal in the same stream as the claim, at the exact moment it matters. Absent hedging, every claim reads with the same weight, and users either over-trust everything or over-trust nothing. Prescribe the hedging vocabulary in the system prompt and enforce it in evals.',
      },
      {
        heading: 'The "verify" affordance turns uncertainty into an action',
        body: 'When confidence is low, do not just warn, do the work. Perplexity\'s "check sources" moves the user into a source list filtered to the questioned claim. Copilot\'s "explain" opens a rationale panel.\n\nIn an AI first product, low confidence should always have a companion verb: verify, cite, explain, or ask again. This changes the emotional weight of uncertainty from anxiety ("is this right?") to progress ("here is the next click"). If your uncertainty state is a passive badge with no verb, the user reads it as blame, not signal.',
      },
      {
        heading: 'Calibration is a design contract, not a model brag',
        body: 'If you show a "high confidence" tag, high-confidence answers had better be right more often than "medium" ones. Track calibration in evals and align the UX ranks to what the model actually delivers, not what the team hopes for.\n\nA miscalibrated confidence UI is worse than none, because the user extends more trust exactly where the model deserves less. Publish the calibration curve to the design team. Bands that do not reflect ground truth need to move, or the whole surface loses credibility over one bad Monday.',
      },
    ],
    takeaways: [
      'Never show a raw confidence percent. Use three or four severity bands the user can learn in a session.',
      'Hedge in prose when the model is unsure. Prescribe the vocabulary and enforce it in evals.',
      'Pair every low-confidence state with an action verb: verify, cite, explain, retry.',
      'Calibrate the bands against evals. Miscalibrated confidence is a trust leak.',
    ],
    terms: [
      { term: 'Confidence', meaning: 'Model\'s estimate of correctness for a claim or completion.' },
      { term: 'Calibration', meaning: 'Whether stated confidence matches empirical accuracy.' },
      { term: 'Severity band', meaning: 'Named tier (critical, advisory, hint) that encodes confidence.' },
      { term: 'Ghost text', meaning: 'Faint inline suggestion, opacity encodes acceptance likelihood.' },
      { term: 'Hedged prose', meaning: 'Language that signals uncertainty inside the answer itself.' },
      { term: 'Verify affordance', meaning: 'Companion action that lets the user check a low-confidence claim.' },
    ],
    demoCaption:
      'The bad side shows a bare 87 percent tag: precise, useless. The good side swaps it for a severity band and a verb the user can act on. Same underlying score, different behavior.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Grammarly suggestion',
      badLabel: 'Raw percent',
      goodLabel: 'Severity + verb',
      badLines: [
        'Suggestion: "Their" should be "There".',
        'Confidence: 87 percent',
        '[Accept]  [Dismiss]',
      ],
      goodLines: [
        'Critical  grammar',
        'Suggestion: "Their" should be "There".',
        '[Accept]  [Ignore rule]  [Explain]',
      ],
      badCaption:
        'A percent the user cannot calibrate against their own risk. 87 today, 62 tomorrow, no context. Users learn to ignore the tooltip.',
      goodCaption:
        'A three-band severity plus a verb. The band tells the reader what class of problem it is. The verb gives them a next click.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: '"87 percent confidence" is a design failure.',
        body:
          '"87 percent confidence" is a design failure.\n\nusers cannot calibrate a percent against their own risk. models cannot calibrate percents against reality. the number is precise and useless.\n\nseverity bands the user learns in a session. hedged prose. a verify verb. these are what confidence actually looks like in a product.',
      },
      {
        kind: 'X · design angle',
        hook: 'pair every low-confidence state with an action verb.',
        body:
          'pair every low-confidence state with an action verb.\n\nverify. cite. explain. retry.\n\na passive badge reads as blame. a verb reads as progress. same signal, different emotional weight. uncertainty becomes the next click instead of a stop sign.',
      },
      {
        kind: 'X · one-liner',
        hook: 'miscalibrated confidence is worse than no confidence.',
        body:
          'miscalibrated confidence is worse than no confidence.\n\nif your "high" band is right less often than your "medium" band, the surface is a trust leak. calibrate against evals and move the bands until they match ground truth. publish the curve.',
      },
    ],
    source: {
      label: 'Vault note: Confidence UX represents uncertainty as an affordance, not a number',
      url: 'https://www.perplexity.ai',
    },
  },

  {
    id: 'de-ai-system-prompt-microcopy',
    phase: 'Design engineering',
    part: 'AI UX patterns',
    index: 'DE.AX.07',
    title: 'A system prompt is microcopy the user never sees',
    oneLiner:
      'Every AI product has an invisible microcopy layer that shapes how it talks, what it refuses, and where it hedges. Designers own it or engineers write it in a hurry.',
    readTime: '~6 min read',
    diagram: '/lessons/de/de-ai-system-prompt-microcopy.png',
    diagramCaption:
      'The system prompt is a versioned document: persona, register, refusal grammar, hedge vocabulary, format constraints. Everything the model says downstream is compiled from it.',
    whyItMatters:
      'The system prompt is not an engineering artifact. It is the tone document, the refusal policy, the hedging vocabulary, and the persona in one place. Anthropic publishes Claude\'s release-note system prompts precisely because they are UX. Notion AI\'s leaked prompt reads like a content design brief. If a designer does not own this file, the product\'s voice drifts every release, and the "please describe the change" postmortem gets written every time. Treat the system prompt like landing copy: version it, review it, test it, and hold the same bar you hold the H1 to.',
    sections: [
      {
        heading: 'The prompt is where voice actually lives',
        body: 'Buttons carry ten words. The system prompt carries five hundred, and the model reproduces them every turn.\n\nAnthropic\'s published prompt for Claude specifies register ("clear, direct"), refusal grammar, hedge markers, formatting preferences, and a set of do-not-do rules for meta-commentary. This is the same job as a brand voice guide, except the reader is a model that will regurgitate what you wrote. If you want short answers, write a rule for it. If you want the assistant not to say "great question," write that. Vague brand words yield vague brand behavior.',
      },
      {
        heading: 'Version and diff it like content, not code',
        body: 'Anthropic\'s system-prompt changelog is the model. You can read exactly what changed between Claude 3.7 and Claude 4, and you can attribute regressions ("verbosity climbed after April 16") to a specific edit.\n\nDo the same in your product. Store the prompt in the repo, but review it in a doc surface where designers can comment on tone changes. A one-line edit ("respond in at most three sentences") is a UX change that affects every reply in the product. Treat it that way.',
      },
      {
        heading: 'Constraints belong here, not scattered across the codebase',
        body: 'The system prompt is the natural home for output constraints the UI depends on: markdown headings only, code fences with language tags, no more than four bullets, cite every claim.\n\nWhen these constraints live in the prompt, they move with the persona. When they live scattered across parsing code, they drift and the UI breaks silently. Instructions the UI depends on need to be executable in the model\'s head, which is what a system prompt is for.',
      },
      {
        heading: 'Guard the boundary between prompt and user input',
        body: 'The system prompt is trusted, the user message is not. If the UI mixes them, prompt injection becomes a copy-paste attack. Anthropic and OpenAI use explicit role separation for exactly this reason.\n\nThe design implication is that any user-authored persona, tool description, or shared conversation link needs to be quarantined visually and technically. From a UX standpoint, "custom instructions" and "share this chat" both cross the trust line, and the product must show which side of the line the reader is on.',
      },
    ],
    takeaways: [
      'Designers own the system prompt. If nobody does, the product\'s voice drifts every release.',
      'Write the prompt with the discipline of landing copy. Version it, diff it, review the tone changes.',
      'Put output constraints (length, format, citations) in the prompt, not in scattered parsing code.',
      'Quarantine user-authored content that pretends to be system content. It is a design surface, not a security nit.',
    ],
    terms: [
      { term: 'System prompt', meaning: 'Trusted instructions that precede every user message in a chat.' },
      { term: 'Persona', meaning: 'Consistent voice, register, and refusal style the model performs.' },
      { term: 'Refusal policy', meaning: 'Rules for when and how the model declines a request.' },
      { term: 'Prompt injection', meaning: 'User content that impersonates system instructions.' },
      { term: 'Custom instructions', meaning: 'User-authored preferences that layer onto the system prompt.' },
      { term: 'Release-note diff', meaning: 'Public changelog of system-prompt edits between model versions.' },
    ],
    demoCaption:
      'The bad prompt is product-neutral. The good prompt is voiced: short lines, no meta-commentary, hedge vocabulary, format rules. Same model, different product identity.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'system prompt, v0.4',
      badLabel: 'Product-neutral',
      goodLabel: 'Voiced',
      badLines: [
        'You are a helpful assistant.',
        'Answer the user\'s questions clearly and accurately.',
        'Use markdown if helpful.',
        'Be polite.',
      ],
      goodLines: [
        'You answer in three sentences or fewer unless asked for more.',
        'Never open with "great question" or restate the user.',
        'When unsure, use "likely" or "I could not verify" and offer a source.',
        'Cite every factual claim inline as [source +n].',
        'Never invent components. Refuse and explain.',
      ],
      badCaption:
        'Four words of brand vocabulary and nothing the model can act on. Voice drifts every release because there is no rule to hold it in place.',
      goodCaption:
        'A landing-copy document: register, length, refusal grammar, hedge vocabulary, citation format. Every reply inherits it.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'the system prompt is where your product\'s voice actually lives.',
        body:
          'the system prompt is where your product\'s voice actually lives.\n\nbuttons carry ten words. the system prompt carries five hundred, and the model reproduces them every turn.\n\nAnthropic ships a diff of their prompt with every release. that is not an engineering artifact. that is a landing-page changelog.',
      },
      {
        kind: 'X · design angle',
        hook: 'a one-line edit to the system prompt is a UX change to every reply.',
        body:
          'a one-line edit to the system prompt is a UX change to every reply.\n\n"respond in at most three sentences" ships across the whole product. store the prompt in the repo, review it in a doc surface, hold the same bar you hold the H1 to.\n\ncontent design work, not eng housekeeping.',
      },
      {
        kind: 'X · one-liner',
        hook: 'if the designer does not own the system prompt, the engineer wrote it in a hurry.',
        body:
          'if the designer does not own the system prompt, the engineer wrote it in a hurry.\n\nthe result is "you are a helpful assistant." the result is voice drift every release. the result is a postmortem you keep rewriting.\n\nclaim the file.',
      },
    ],
    source: {
      label: 'Vault note: A system prompt is microcopy the user never sees',
      url: 'https://docs.anthropic.com/en/release-notes/system-prompts',
    },
  },

  {
    id: 'de-ai-composer',
    phase: 'Design engineering',
    part: 'AI UX patterns',
    index: 'DE.AX.08',
    title: 'The composer is where AI product identity lives',
    oneLiner:
      'The input box is the whole product. Model, context menu, attachments, slash commands, mode toggles, and voice all sit in one component, and that component sets expectations for everything below it.',
    readTime: '~6 min read',
    diagram: '/lessons/de/de-ai-composer.png',
    diagramCaption:
      'The composer is a manifest: model picker, mode toggles, scope, slash commands, attachment chips, modality slot. The rest of the product inherits its ceiling from this one component.',
    whyItMatters:
      'Cursor\'s composer, ChatGPT\'s composer, Claude\'s composer, and Notion AI\'s slash menu look superficially similar and behave completely differently. The composer decides which affordances the user reaches for first: attaching a file, invoking a tool, switching to voice, picking a mode. That choice sets what people believe the product can do. A composer with only a text field says "chatbot." A composer with commands, attachments, and a mode picker says "agent." Get the composer wrong and the rest of the UI compensates. Get it right and the product teaches itself.',
    sections: [
      {
        heading: 'Model, mode, and scope choices live at the composer, not in settings',
        body: 'Cursor moved model selection into the composer because switching mid-task is common. Notion AI puts scope (page, database, workspace) next to the input for the same reason. ChatGPT\'s composer exposes web, image, and o-series modes as one-tap toggles.\n\nThis is the difference between an assistant you configure and an assistant you drive. Buried settings hide capability; composer toggles surface it. Rule of thumb: any control the user changes more than once per session belongs in the composer. Anything they set once belongs in settings. Misplacing the two is the loudest way to feel less capable than a competitor.',
      },
      {
        heading: 'Slash commands are the design system of the composer',
        body: 'Slack, Linear, Notion, and Cursor all use `/` to reveal a menu of typed actions. In an AI composer, slash commands are how you promote the actions the model can take without cluttering the surface: `/summarize`, `/cite`, `/rewrite`, `/plan`.\n\nThis is the closest thing an AI product has to a design system: a stable, discoverable vocabulary of verbs. If the composer supports free prompts only, the user has to guess the model\'s capabilities. If it exposes commands, the model\'s shape is legible from the input. Keep the command list small, name the verbs like a designer, not like an engineer.',
      },
      {
        heading: 'Attachments teach the model, not just the user',
        body: 'The composer\'s paperclip is a promise: "the file will be understood." OpenAI\'s Apps SDK, Claude Projects, and ChatGPT file uploads each take a different position on what happens to attached content, whether it stays in context, whether it gets embedded, whether it turns into a tool.\n\nWhatever the product does, the composer must make it clear. A paperclip that appears to attach but silently truncates is worse than none. Show the file\'s parse state (indexed, embedded, in-context) in a chip next to the composer, and let the user remove it inline.',
      },
      {
        heading: 'Voice, dictation, and multimodal enter the composer, then earn a shortcut',
        body: 'Voice is a modality, not a page. In products where it earned real use (Claude, ChatGPT, Superwhisper) it lives inside the composer as a mic button and, if it earns it, becomes a keyboard shortcut.\n\nCamera input, screenshot capture, and clipboard paste follow the same pattern. The composer is where new input modalities join the product without a redesign. Reserve one slot on the right side of the input for the modality of the moment, and treat it as a promotion track: if the affordance sticks, it earns hardware; if not, it retires cleanly.',
      },
    ],
    takeaways: [
      'The composer sets the ceiling for what users believe the product can do. Design it before the reply block.',
      'Anything the user changes twice per session belongs in the composer, not in settings.',
      'Slash commands are the AI product\'s design system. Name the verbs like a designer.',
      'Attachments and voice go through the composer first, and earn a shortcut only after they prove out.',
    ],
    terms: [
      { term: 'Composer', meaning: 'The primary input component that hosts prompt, controls, and modes.' },
      { term: 'Slash command', meaning: 'Typed shortcut that opens a menu of named actions.' },
      { term: 'Mode toggle', meaning: 'In-composer switch between capabilities (web, image, reasoning).' },
      { term: 'Attachment chip', meaning: 'Compact element showing a file\'s parse state next to the input.' },
      { term: 'Scope picker', meaning: 'Control that limits the model\'s context to a page, project, or workspace.' },
      { term: 'Modality slot', meaning: 'Reserved position for a non-text input (voice, camera, clipboard).' },
    ],
    demoCaption:
      'The bare textarea says "chatbot." The proper composer, with an @ menu, an attachment chip, a mode toggle, and a mic slot, says "agent." Same product code below it. Very different ceiling.',
    demo: {
      archetype: 'before-after',
      subject: 'AI product composer',
      badLabel: 'Bare textarea',
      goodLabel: 'Proper composer',
      badLines: [
        '[  Ask anything...                        ]',
        '[Send]',
        'no model picker',
        'no attachment state',
        'no discoverable actions',
      ],
      goodLines: [
        'model: Sonnet 4  |  mode: web  |  scope: this workspace',
        '@ mention  /summarize  /cite  /rewrite  /plan',
        'brief.pdf  indexed  [x]     screenshot.png  in-context  [x]',
        '[  Ask anything, or press / for actions...  ]',
        '[mic]  [camera]                                    [Send]',
      ],
      badCaption:
        'One text field and a send button. The user has to guess what the product can do, and the product feels like a chatbot no matter how capable the model is.',
      goodCaption:
        'A composer manifest: model, mode, scope, commands, attachments, modality slot. Capability is visible before the first message.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'the composer is the whole product.',
        body:
          'the composer is the whole product.\n\nmodel picker. mode toggle. scope. slash menu. attachment chip with parse state. modality slot. all in one component.\n\nwhat you put in that component is what users believe the product can do. everything below it inherits the ceiling.',
      },
      {
        kind: 'X · design angle',
        hook: 'anything the user changes twice per session belongs in the composer.',
        body:
          'anything the user changes twice per session belongs in the composer.\n\nmodel, mode, and scope are not settings. they are steering. buried in preferences they hide capability. surfaced in the composer they teach the product.\n\nmisplacing the two is the loudest way to feel less capable than a competitor.',
      },
      {
        kind: 'X · one-liner',
        hook: 'slash commands are the AI product\'s design system.',
        body:
          'slash commands are the AI product\'s design system.\n\na stable, discoverable vocabulary of verbs. /summarize, /cite, /rewrite, /plan.\n\nname them like a designer, not like an engineer. keep the list small. the model\'s shape becomes legible from the input.',
      },
    ],
    source: {
      label: 'Vault note: The composer is where AI product identity lives',
      url: 'https://cursor.sh',
    },
  },

  {
    id: 'de-ai-reply-block',
    phase: 'Design engineering',
    part: 'AI UX patterns',
    index: 'DE.AX.09',
    title: 'The reply block is a component with retries, edits, and citations',
    oneLiner:
      'A model response is not a paragraph on a page. It is a container with its own toolbar, footer, and history, and it has to earn every affordance it exposes.',
    readTime: '~6 min read',
    diagram: '/lessons/de/de-ai-reply-block.png',
    diagramCaption:
      'Header carries model, time, status. Body carries the stream, tool rows, and any artifact. Footer carries copy, regenerate, edit, cite, share. Every reply on every surface inherits this anatomy.',
    whyItMatters:
      'The reply block carries more state than any other component in an AI product: streaming status, model id, tool calls, cited spans, edit history, copy targets, and downstream actions. Yet most designs treat it as prose in a bubble. A well built reply block is a card with a container, a header that names the run, a body that streams the content, and a footer that exposes actions. When these pieces are defined, the same block can serve chat, search, agent output, and generative UI. When they are not, every surface reinvents the toolbar and the citations look different in each one.',
    sections: [
      {
        heading: 'Every reply has a header, a body, and a footer',
        body: 'The header carries model id or persona, the timestamp, and any status pill (streaming, stopped, tools running). The body is the shape from the streaming lesson: token stream, partial JSON, or component tree. The footer carries the primary actions: copy, regenerate, edit, react, cite, share.\n\nClaude, ChatGPT, and Perplexity all follow this three-part layout, though they vary which actions live where. The value of naming the layout is consistency: a chat reply, a search answer, and an agent tool result all inherit the same structure, so users learn the actions once.',
      },
      {
        heading: 'Regenerate is not refresh, and edit is not a text field',
        body: 'Regenerate produces a new version stacked on the previous one, with a version picker in the header. Edit rewrites the prompt and re-runs, replacing the previous version rather than layering. These are different verbs and belong in different places.\n\nChatGPT and Claude split them: regenerate lives on the reply, edit lives on the user message above it. When both are in the reply footer, users regenerate when they meant to edit and lose the thread. Give the two actions different homes, and log both so the version tray is coherent.',
      },
      {
        heading: 'Citations are footer chips with a per-claim behavior',
        body: 'Citation chips live in the reply footer as a compact summary ("sources: 4"), and expand to a filtered evidence list. The chip in the footer is the summary; the inline chips in the body are the per-claim binding.\n\nTogether they give the reader two entry points into the same source set. Perplexity, Elicit, and Consensus all use this pattern. A reply block without a footer chip forces the reader to scroll to find sources; a footer chip without inline binding forces them to guess which sentence a source backs.',
      },
      {
        heading: 'Tool calls belong inside the reply, not above it',
        body: 'When a model uses tools mid-response, the calls belong inside the reply block as collapsible steps, not as a separate log above the answer. Claude\'s tool-use rows and Cursor\'s composer steps show this: each call becomes a chip inside the reply, expandable to see the arguments and result.\n\nThis keeps the reply as one artifact the user can share, quote, or export. If the tool trace lives above the reply, exports drop it, and users who audit later cannot reconstruct what the model saw.',
      },
    ],
    takeaways: [
      'Formalize the reply block as header, body, footer. Every surface in the product inherits it.',
      'Split regenerate and edit into two places. They are different verbs with different histories.',
      'Put a citations chip in the footer and per-claim chips in the body. Both matter, and they are not the same.',
      'Tool calls live inside the reply so the artifact stays a single quotable, exportable unit.',
    ],
    terms: [
      { term: 'Reply block', meaning: 'Container that renders a single model response with header, body, footer.' },
      { term: 'Version picker', meaning: 'Header control that navigates between stacked regenerations.' },
      { term: 'Tool row', meaning: 'Collapsible step inside the reply that shows a tool call and its result.' },
      { term: 'Citation chip', meaning: 'Compact source count in the footer that opens the evidence panel.' },
      { term: 'Edit-and-rerun', meaning: 'Prompt-level revision that replaces the previous reply.' },
      { term: 'Regenerate', meaning: 'New draw with the same prompt, stacked as a new version.' },
    ],
    demoCaption:
      'Step through one reply as it earns each affordance: header status, streaming body, tool row, inline citations, footer chip, regenerate, edit, copy. Each step is a decision the block would otherwise leak to some other surface.',
    demo: {
      archetype: 'sequence',
      badLabel: 'Prose in a bubble',
      goodLabel: 'Reply block',
      badSequence: [
        'a paragraph appears',
        'a small refresh icon at the bottom',
        'sources link somewhere else',
        'tool calls logged above the answer',
        'export drops the tool trace',
      ],
      goodSequence: [
        'header: Sonnet 4  10:22  streaming',
        'body: tokens land, tool row appears mid-stream',
        'inline chips bind claims to sources',
        'footer: sources 4  |  copy  regenerate  cite  share',
        'regenerate stacks a v2 in the version picker',
        'edit lives on the user message above, replaces the run',
      ],
      badCaption:
        'Prose in a bubble with a refresh icon. Sources leak to a separate tab. Tool trace lives above and drops on export. Every surface reinvents the toolbar.',
      goodCaption:
        'A formalized container: header, body, footer, version picker, tool rows, inline and footer citations. Chat, search, agent output, and generative panels all inherit it.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'a model response is not prose in a bubble.',
        body:
          'a model response is not prose in a bubble.\n\nit is a container with a header (model, time, status), a body (stream, tool rows, artifact), and a footer (copy, regenerate, edit, cite, share).\n\nname the anatomy once. chat, search, agent output, and generative panels all inherit it. stop reinventing the toolbar per surface.',
      },
      {
        kind: 'X · design angle',
        hook: 'regenerate is not refresh, and edit is not a text field.',
        body:
          'regenerate is not refresh, and edit is not a text field.\n\nregenerate stacks a new version with a picker. edit rewrites the prompt and replaces the run. they are different verbs with different histories.\n\nput them in different homes. when both live in the same footer, users regenerate when they meant to edit and lose the thread.',
      },
      {
        kind: 'X · one-liner',
        hook: 'tool calls live inside the reply so the artifact stays quotable.',
        body:
          'tool calls live inside the reply so the artifact stays quotable.\n\nif the trace lives above the answer, exports drop it. audits later cannot reconstruct what the model saw. one artifact, header to footer, share and quote intact.',
      },
    ],
    source: {
      label: 'Vault note: The reply block is a component with retries, edits, and citations',
      url: 'https://claude.ai',
    },
  },
];
