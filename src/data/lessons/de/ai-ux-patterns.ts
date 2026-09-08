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
      'A model answers the same prompt differently across runs, sometimes within seconds. The design job is making that variance legible, comparable, and recoverable, not hiding it behind a fake single answer.',
    readTime: '~10 min read',
    diagram: '/lessons/de/de-ai-non-determinism.png',
    diagramCaption:
      'One prompt becomes a run, which becomes a stored version, which lives in a tray. Regenerate stacks new versions instead of overwriting the old one.',
    whyItMatters:
      'Designers reach for AI expecting a database and get a distribution. Ask Perplexity the same question twice and the source ranking shifts before the index has meaningfully changed; ask Claude to redo a paragraph at temperature 0 and the tool graph still resolves differently. Under determinism, the fix is to hide the seams. Under non-determinism, the seams are the product, and Claude\'s artifact panel proves the fix is versioning, not repetition.',
    learningObjectives: [
      'Explain why sampling temperature, tool call ordering, and retrieval freshness make identical prompts return non-identical answers.',
      'State what OpenAI\'s seed parameter and system_fingerprint field each guarantee, and where that guarantee breaks down.',
      'Design a version tray that stores every regenerated answer as a separate, comparable, timestamped artifact.',
      'Specify the minimum trace metadata a support ticket needs to reproduce a reported discrepancy.',
      'Redesign a regenerate control that reads as a plain refresh icon into three distinct, labeled actions.',
      'Decide, for a given feature, whether non-determinism is variance to surface or a defect to eliminate.',
    ],
    sections: [
      {
        heading: 'Same prompt, different answer, is the default, not the bug',
        body: 'Sampling temperature, tool ordering, tool latency, retrieval freshness, and speculative decoding all inject variance into a single request. Perplexity re-runs the same query and returns a different source ranking within minutes, before its index has meaningfully changed. Claude rewrites whole paragraphs at temperature 0 because the tool graph resolves in a different order on the second call.\n\nThe UI has to teach this in one glance: a regenerate control that reads as expected, a visible timestamp on the answer, a version tray that keeps prior runs one click away. Do not present variance as an error state, and do not silently overwrite the previous run. Two people running the identical query minutes apart should be able to compare, not argue.',
      },
      {
        heading: 'Show the run as a versioned artifact, not a live prop',
        body: 'Treat each answer as a stored version, not a screen state. Give it an id, a timestamp, and a shareable anchor. Claude\'s artifact panel and ChatGPT canvas both do this: the answer sits in a container with a history, and regenerate stacks a new version rather than mutating the old one.\n\nThis flips the mental model from "the model changed its mind" to "I have three drafts to compare." For ranked lists (search results, product picks) the same logic applies: pin the ranking the user is discussing, and mark which run they were looking at when they asked the follow-up. A version without an id is not a version, it is a rumor.',
      },
      {
        heading: 'What a seed actually buys you',
        body: 'OpenAI\'s API exposes a seed parameter and a system_fingerprint field specifically because the default behavior is non-deterministic. Set the same integer seed across calls and, per OpenAI\'s own docs, you get "mostly" identical outputs, not guaranteed identical ones. The system_fingerprint changes whenever OpenAI adjusts backend configuration, which happens several times a year, and when it changes, your fixed seed stops helping.\n\nAzure OpenAI\'s reproducible-output docs say the same thing more bluntly: identical seed, identical parameters, and identical system_fingerprint can still produce different responses, and longer max_tokens values make this worse. A seed is a lever, not a guarantee. Design for the case where it fails, because it will, and put engineering effort into trace logging instead of chasing perfect reproducibility.',
      },
      {
        heading: 'Pin the seed, publish the parameters, or you cannot support the user',
        body: 'If the user says "the answer was different yesterday," you need something to correlate against. Store the model id, the prompt hash, the tool call trace, and the seed when the provider exposes one. Surface at least a short version stamp in the UI so support tickets carry a lookup key.\n\nThis is the AI equivalent of a build number. Without it, every reproducibility question becomes a guessing game, and the design team gets blamed for what is really a missing engineering primitive. A support agent who can pull up "run 4f21, model claude-opus-4-6, seed none, fingerprint fp_9a2" resolves the ticket in one message. One without any of that spends twenty minutes asking the user to describe what they remember.',
      },
      {
        heading: 'Design the regenerate control like a real affordance, not a refresh icon',
        body: 'Regenerate is the primary way users negotiate with a non-deterministic system, yet most products bury it behind a small circular arrow sized like a spinner. Give it a label, a real hit target, and enough visual weight to read as a first-class action.\n\nDistinguish "regenerate with the same prompt," "regenerate with a different model," and "regenerate this paragraph only." Bracket it with edit and copy so the user\'s real question, "what do I do with this draft," has three answers side by side. Regenerate is not undo. It is a new roll of the dice, and the control has to say so instead of pretending it is a retry.',
      },
      {
        heading: 'Temperature is a dial, not a toggle',
        body: 'Temperature 0 does not mean deterministic. It means the model always picks the highest-probability token at each step, which still varies when the tool graph, retrieval order, or server-side batching changes between calls. Temperature 1 samples from the full distribution and varies far more visibly, which is why creative-writing features default higher and factual-lookup features default lower.\n\nMost production chat products hide this dial entirely and pick something in the 0.3 to 0.7 range as a compromise between repeatability and personality. If your product exposes creativity as a user-facing slider, the way some writing tools do, label the ends by outcome, "more consistent" to "more varied," never by the raw number. Nobody calibrates their expectations against 0.7.',
      },
      {
        heading: 'Not every surface should tolerate the same variance',
        body: 'A marketing-copy generator can regenerate five times and let the user pick a favorite, that is variance as a feature. A tax-calculation assistant, a medical-summary tool, or anything feeding an eval suite needs the opposite: a fixed seed where possible, a logged system_fingerprint, and a visible warning when determinism cannot be guaranteed.\n\nTreat this as a decision per feature, not a platform-wide default. Ask what happens if two people on the same team get different answers to the same compliance question. If the answer is "a meeting to resolve the discrepancy," you need reproducibility infrastructure, not just a version tray. If the answer is "no big deal, pick either," you need the tray and nothing more.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-ai-non-determinism-inline-seed.svg',
        alt: 'What a seed and a fingerprint actually pin down',
        caption:
          'Same seed, same parameters, different system_fingerprint: the output can still drift. Only when all three match does reproducibility hold, and even then not always.',
        diagramBrief:
          'Three-column comparison diagram, cream paper background, black ink, one accent color. Column headers: "Seed only", "Seed + fingerprint match", "Seed + fingerprint + max_tokens controlled". Each column shows a small icon stack (dice, fingerprint mark, checkmark) and a one-line verdict underneath: "still drifts", "mostly stable", "closest to reproducible". A footnote line at the bottom: "reproducibility is never guaranteed, per OpenAI and Azure docs."',
      },
      {
        src: '/lessons/de/de-ai-non-determinism-inline-tray.svg',
        alt: 'Version tray anatomy',
        caption:
          'A version tray holds every regeneration as a separate, comparable artifact: id, timestamp, and a pin control, never an overwrite.',
        diagramBrief:
          'Vertical stack of three rounded cards labeled v1, v2, v3, cream paper background, black ink, one accent color highlighting v2 as "pinned". Each card shows a mini row: timestamp, model id, a small diff icon. An arrow from a "regenerate" button at the top points down into a new v4 card appearing at the bottom of the stack, not replacing any existing card.',
      },
    ],
    takeaways: [
      'Treat every answer as a stored version with an id, a timestamp, and a diff against the previous run.',
      'Non-determinism is a feature to surface, not a bug to hide, and regenerate is its primary affordance.',
      'Log model id, prompt hash, tool trace, and seed so a support conversation has a lookup key.',
      'If the user cannot pin, compare, or return to a prior run, the product is silently gaslighting them.',
    ],
    terms: [
      { term: 'Non-determinism', gloss: '"the model is being random"', meaning: 'Same input can yield different outputs across runs because of sampling, tool ordering, or backend changes.' },
      { term: 'Temperature', gloss: '"the creativity setting"', meaning: 'Sampling parameter that widens or narrows the probability distribution the model draws its next token from.' },
      { term: 'Seed', gloss: '"makes it deterministic"', meaning: 'Integer that fixes the random draw when a provider exposes it; reduces variance without guaranteeing identical output.' },
      { term: 'System fingerprint', gloss: '"a version number"', meaning: 'Identifier for the backend configuration serving the request; changes when the provider updates infrastructure, breaking seed-based reproducibility.' },
      { term: 'Version tray', gloss: '"the history panel"', meaning: 'UI surface that keeps prior generations one click away instead of discarding them on regenerate.' },
      { term: 'Regenerate', gloss: '"try again"', meaning: 'Explicit user request for a new draw with the same prompt, producing a new stacked version, not an overwrite.' },
      { term: 'Trace id', gloss: '"a ticket number"', meaning: 'Correlation key that ties a UI answer back to a stored run for support and audit.' },
      { term: 'Prompt hash', gloss: '"the question, fingerprinted"', meaning: 'Deterministic fingerprint of the exact prompt sent, used to confirm two runs were actually asked the same thing.' },
      { term: 'Top_p', gloss: '"another randomness knob"', meaning: 'Nucleus-sampling parameter that caps the token pool by cumulative probability instead of by raw temperature.' },
      { term: 'Speculative decoding', gloss: '"a speed trick"', meaning: 'Inference technique where a small draft model proposes tokens a larger model verifies; changes output distribution slightly run to run.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A chat reply is logged with a model id and a timestamp but no seed and no prompt hash. List the two fields you would add first to make a "why was yesterday different" ticket resolvable in one message.' },
      { level: 'medium', prompt: 'A user reports that a compliance summary changed between two runs made ninety seconds apart with identical input. You have the model id and system_fingerprint for both runs and they match. What do you check next, and what do you tell the user if the fingerprints are actually identical?' },
      { level: 'hard', prompt: 'Design the diff logic for two answer versions that agree on every underlying fact but differ in the order sources are presented. Specify what counts as a real change worth flagging versus a cosmetic reordering that should stay silent.' },
      { level: 'design', prompt: 'Sketch a version tray for a chat product that has produced three regenerations of one answer. Define what is visible in the collapsed state, what is revealed on expand, and write the one line of microcopy that answers "why did this change" without sounding like an apology.' },
    ],
    furtherReading: [
      { label: 'OpenAI - Reproducible outputs with the seed parameter', url: 'https://developers.openai.com/cookbook/examples/reproducible_outputs_with_the_seed_parameter', why: 'Shows exactly what seed and system_fingerprint promise, and the specific conditions under which they still fail to reproduce a result.' },
      { label: 'Azure OpenAI - How to generate reproducible output', url: 'https://learn.microsoft.com/en-us/azure/foundry-classic/openai/how-to/reproducible-output', why: 'The plainest statement that determinism is not guaranteed even with matching seed and fingerprint, with the max_tokens caveat.' },
      { label: 'Anthropic - Introducing Claude Artifacts', url: 'https://www.anthropic.com/news/artifacts', why: 'The shipped version of treating every answer as a stored artifact, the pattern this lesson argues every AI product needs.' },
      { label: 'Perplexity', url: 'https://www.perplexity.ai', why: 'Run the same factual query twice within a few minutes and watch the source ranking change, a live demonstration of retrieval-freshness variance.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Non-determinism support checklist',
      body: '- Does every answer get a stored id, a timestamp, and a model id?\n- Is the prompt hash logged so two runs can be confirmed as "the same question"?\n- Is the seed logged when the provider exposes one, and the system_fingerprint alongside it?\n- Is the full tool call trace stored, not just the final answer?\n- Can a support agent pull up all four of the above from a single trace id?\n- Does the regenerate control say what it will do (same prompt, different model, one paragraph) before the user clicks it?\n- Is there a version tray, or does regenerate silently overwrite the previous answer?\n- For this specific feature, is variance a feature (let the user pick a favorite) or a liability (needs a fixed seed and a visible warning)?',
    },
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
    readTime: '~10 min read',
    diagram: '/lessons/de/de-ai-ttft-latency.png',
    diagramCaption:
      'Between submit and last byte lie four events: container render, first token, inter-token gap, last token. The user only feels the first two.',
    whyItMatters:
      'Backends optimize total completion time. Users optimize the feeling of did anything happen. Gemini 2.5 Flash-Lite ships a 0.35 second TTFT while GPT-4 Turbo runs closer to a full second, and that gap is what a designer feels as snappy versus sluggish before either model has said anything useful. Pick TTFT as the constraint and the whole loading vocabulary changes: prime the surface, hint the shape, land the first token, then keep the stream visible until the tail arrives.',
    learningObjectives: [
      'Define TTFT and TTLB and explain why chat perception lives on the first, not the second.',
      'State the approximate millisecond thresholds separating instant, lagged, and abandonment-risk waits.',
      'Design a container that renders before the first token arrives, so the wait is not spent on the surface.',
      'Distinguish honest progress language from decorative loading animation, with an example of each failing loudly.',
      'Explain the near-linear relationship between prompt length and TTFT, and estimate the cost of a much longer prompt.',
      'Critique a product that streams filler tokens to lower its TTFT metric, and propose the fix.',
    ],
    sections: [
      {
        heading: 'TTFT is the perception latency, TTLB is the throughput latency',
        body: 'TTFT is the interval from request to the first byte the client can render. TTLB is request to the last byte. Chat perception lives almost entirely on TTFT: Jakob Nielsen\'s decades-old response-time thresholds still map onto it, and 2026 benchmark data puts the practical cutoffs around 200ms feels instant, 500ms feels lagged, 800ms tips people toward abandoning the wait.\n\nTTLB still matters for long-form output, a full artifact, a batch export, and for any downstream step gated on completion. Design against both, but name TTFT as the number the interface owes the user first. A backend team proud of a fast total completion time can still ship a product that feels broken if the first token is slow.',
      },
      {
        heading: 'Prime the surface before the first token lands',
        body: 'Under 200ms you can render intent: an empty answer block with a caret, a placeholder card with a shape that hints at the reply type, or a status line ("searching your docs"). The user sees "the system heard me."\n\nVercel\'s AI SDK templates render the answer container immediately and stream tokens into it, which is why an 800ms TTFT feels shorter there than the same latency in a form that only reveals content on completion. If the surface arrives late, the wait feels late, even when the model itself is fast.',
      },
      {
        heading: 'Prompt length taxes TTFT before the model says a word',
        body: 'The prefill pass, where the model processes everything already in context, dominates TTFT for long conversations. Measurements from Glean found each additional input token adds roughly 0.24ms to P95 TTFT, so a 3,000-token prompt split into three parallel 1,000-token calls can cut TTFT by close to 480ms compared to sending it as one block. Separate benchmark data across GPT-4 Turbo, Claude Opus, and Gemini Pro shows TTFT growing from around 500-650ms at 50 input tokens to 6,800-8,500ms at 10,000 tokens.\n\nThe design consequence: a long conversation history or a large system prompt is not free. If your composer lets users attach big documents, warn them the first reply will be slower, or trim context aggressively and say so, rather than let the product silently feel broken.',
      },
      {
        heading: 'Where the 2026 models actually land',
        body: 'Benchmarks in mid-2026 put Gemini 2.5 Flash-Lite at roughly 0.35 seconds TTFT and 213 tokens per second, the fastest widely available combination at that price point, around $0.10 per million input tokens. GPT-4o mini streams tokens at only about 54 per second, four times slower than a similarly priced competitor, even with a comparable TTFT. Claude\'s Sonnet tier typically lands in the 500-750ms TTFT range, trading some speed for reasoning depth.\n\nThe lesson for a designer picking a model tier per feature: TTFT and throughput are two separate dials, and a fast-starting, slow-streaming model can feel worse on a long answer than a slower-starting, fast-streaming one. Benchmark your feature\'s typical output length before picking a tier, do not trust a single headline number.',
      },
      {
        heading: 'Progress must be honest, not decorative',
        body: 'A shimmer that repeats forever is a lie. If the stream has stalled, say so; if a tool call is running, name it; if a retry is in flight, show it. Cursor\'s composer names each subtask, ChatGPT\'s plan mode shows tool steps as they resolve.\n\nNever confuse loading with progress. Loading says something is happening. Progress says how much has happened, and it fails loudly when the model gets stuck. A status line that has said "searching" for twelve seconds without updating is worse than no status line at all, because it actively hides the failure.',
      },
      {
        heading: 'Cost of skipping ahead: fake speed feels worse than real waiting',
        body: 'Products sometimes stream junk (filler intros, restated questions) to hit a low TTFT. The metric improves; trust drops. The user learns that the first tokens are not signal, and their eyes skip to the middle.\n\nBetter designs invest the first tokens in the answer itself: the number, the verdict, the recommendation, then the reasoning. This aligns TTFT with information value, which is the actual thing users are timing. If your model cannot lead with the answer, cache and precompute the lead so it can.',
      },
      {
        heading: 'Budget the wait like a stack, not a single number',
        body: 'A production latency budget separates five moments: TTFT, time-to-first-render (which can lag TTFT if your renderer is slow), inter-token cadence, time-to-usable (the point where the user can act on partial content), and total completion. A 2026 benchmarking methodology recommends reporting P50, P95, and P99 for each, since an average hides the bimodal sessions that feel abandoned.\n\nFor a voice-adjacent feature, budget under 250ms TTFT; for a standard chat surface, under 500-800ms; for an agent step with a tool call, expect the tool stall to dominate and design a distinct "running a tool" state rather than reusing the token-stream loading pattern.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-ai-ttft-latency-inline-stack.svg',
        alt: 'The five-part latency stack',
        caption: 'TTFT, first render, inter-token cadence, time-to-usable, and total completion are five different numbers. Most teams only measure one.',
        diagramBrief:
          'Horizontal timeline, cream paper background, black ink, one accent color marking the "TTFT" segment. Five labeled ticks left to right: request sent, TTFT (first token), first render, time-to-usable, total completion (TTLB). Small annotation under each tick giving a rough millisecond range. Style should read like a race-track split timer.',
      },
      {
        src: '/lessons/de/de-ai-ttft-latency-inline-models.svg',
        alt: 'TTFT versus throughput are two different dials',
        caption: 'A fast-starting, slow-streaming model can feel worse on a long answer than a slower-starting, fast-streaming one.',
        diagramBrief:
          'Scatter-style diagram, cream paper, black ink, one accent color. X-axis "TTFT (ms), lower is better", Y-axis "throughput (tokens/sec), higher is better". Plot four labeled points: fast-TTFT/high-throughput top-left labeled "best of both", fast-TTFT/low-throughput bottom-left labeled "quick start, slow crawl", slow-TTFT/high-throughput top-right labeled "slow start, fast finish", and one mid-chart labeled "typical chat model".',
      },
    ],
    takeaways: [
      'Target TTFT under 500ms P95 for chat, under 300ms for anything voice-adjacent.',
      'Render the answer container before the first token arrives, so the surface is not part of the wait.',
      'Use progress language that fails loudly: name the tool, name the step, name the retry.',
      'First tokens are ad copy for the whole answer. Spend them on the verdict, not the throat-clear.',
    ],
    terms: [
      { term: 'TTFT', gloss: '"how fast it feels"', meaning: 'Time from request to the first token the client can render.' },
      { term: 'TTLB', gloss: '"total load time"', meaning: 'Time from request to the last token, the full completion latency.' },
      { term: 'ITL', gloss: '"typing speed"', meaning: 'Inter-token latency, the gap between successive tokens once streaming has started.' },
      { term: 'Prefill', gloss: '"reading the prompt"', meaning: 'The pass where the model processes everything already in context; dominates TTFT for long prompts.' },
      { term: 'Skeleton', gloss: '"loading placeholder"', meaning: 'A layout-reserving placeholder shown while the stream has not yet produced renderable content.' },
      { term: 'P95 latency', gloss: '"typical speed"', meaning: 'The latency value below which 95 percent of requests complete; the number that captures tail pain an average hides.' },
      { term: 'Time-to-usable', gloss: '"when it is ready"', meaning: 'The product-level milestone where partial streamed content becomes actionable, not just visible.' },
      { term: 'Tool-call stall', gloss: '"the pause"', meaning: 'The gap between a tool call starting and its result resuming the stream, which often dominates perceived latency in agent flows.' },
      { term: 'Speculative decoding', gloss: '"the speed trick"', meaning: 'A draft model proposes tokens that a larger model verifies in one pass, cutting latency 2 to 3x without changing output quality.' },
      { term: 'Prompt caching', gloss: '"reuse the setup"', meaning: 'Storing the processed representation of a repeated prompt prefix so the prefill pass is skipped on the next call.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A chat feature has a P95 TTFT of 620ms and a P95 TTLB of 4.1 seconds. Which number do you report to the design team as "the wait users feel," and why?' },
      { level: 'medium', prompt: 'Your product streams a 3,000-token system prompt plus conversation history on every turn. Using the roughly 0.24ms-per-token relationship, estimate how much P95 TTFT you could save by trimming that context to 1,000 tokens, and name one tradeoff of trimming it.' },
      { level: 'hard', prompt: 'Design the loading-state decision tree for an agent feature with three phases: a 400ms model "thinking" pause, a 2-second tool call, and a final 800ms streamed answer. Specify what UI element covers each phase and where the transitions happen.' },
      { level: 'design', prompt: 'Sketch a status line for a research assistant that runs five tool calls before answering. What does the user see during each call, what happens if one call takes 8 seconds while the others take under 1, and what is the microcopy when a call fails partway through?' },
    ],
    furtherReading: [
      { label: 'Kunal Ganglani - LLM Latency Benchmark Methodology', url: 'https://www.kunalganglani.com/blog/llm-latency-benchmark-methodology', why: 'Lays out the full latency stack (TTFT, cadence, time-to-usable, tool stall) and why an average hides the sessions that actually feel broken.' },
      { label: 'Kunal Ganglani - LLM Latency Benchmarks 2026', url: 'https://www.kunalganglani.com/blog/llm-latency-benchmark-optimization', why: 'Current 2026 TTFT and throughput numbers across models, and six architectural levers for cutting latency without switching models.' },
      { label: 'Glean - How input token count impacts AI chat latency', url: 'https://www.glean.com/blog/glean-input-token-llm-latency', why: 'The empirical 0.24ms-per-token relationship between prompt length and TTFT, with the parallel-prompt-splitting trick.' },
      { label: 'Vercel AI SDK - Generative User Interfaces', url: 'https://ai-sdk.dev/v5/docs/ai-sdk-ui/generative-user-interfaces', why: 'Shows the container-renders-before-first-token pattern this lesson argues for, in a runnable template.' },
    ],
    shipIt: {
      kind: 'rubric',
      name: 'TTFT-first loading rubric',
      body: '- P95 TTFT under 500ms for chat, under 250ms for anything voice-adjacent: pass or fail?\n- Does the answer container render before the first token, or only after?\n- Is there a status line naming the current step (searching, calling a tool, retrying), or a generic spinner?\n- Does the shimmer or skeleton ever run forever without an honest fallback?\n- Are the first tokens spent on the verdict, or on a restated question and a throat-clear?\n- Is TTFT reported as a distribution (P50/P95/P99), or as a single misleading average?\n- Is there a distinct UI state for a tool-call stall, separate from the token-stream loading state?',
    },
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
      '"Streaming" is not one pattern, it is three: token stream, partial JSON, component tree. Each demands its own container, its own loading state, and its own failure mode, or the interface looks broken even when the model is right.',
    readTime: '~10 min read',
    diagram: '/lessons/de/de-ai-streaming-shapes.png',
    diagramCaption:
      'Three ladders of commitment. Tokens append into text. Keys resolve into fields. Nodes mount into a tree. Each ladder needs its own container and its own fail state.',
    whyItMatters:
      'Designers ship one streaming component and reuse it for everything, which is why AI products feel inconsistent: a chat reply reads well, a structured card flickers, an Apps SDK widget shows a half-rendered ghost. The three shapes have different physics, and Vercel\'s own docs now warn that its React Server Components streaming path is not production-ready. Pick the shape first, build the right container and the right failure state for it, then style the surface.',
    learningObjectives: [
      'Name the three streaming shapes and identify which one a given model output belongs to.',
      'Explain why AI SDK RSC\'s streamUI is now marked experimental and what production alternative the AI SDK recommends instead.',
      'Design a per-field skeleton for a partial-JSON card that puts the highest-signal field first.',
      'Specify the fail state for each of the three shapes and explain why one generic error state cannot cover all three.',
      'Compare a data-tool/render-tool split against a single tool that does both, and explain the flicker it prevents.',
    ],
    sections: [
      {
        heading: 'Token streaming is prose landing character by character',
        body: 'This is the ChatGPT, Claude, Perplexity default. The container is a text block, the loading state is a caret or shimmer at the tail, and the fail mode is a truncated sentence with a retry.\n\nDesign decisions live in typography: line height that does not jump as tokens land, code fences that render partial fences without collapsing, and a stable cursor that never leaves the reader guessing. Reveal actions (copy, regenerate, edit) after the last token, not during. If actions live on hover, keep them consistent while streaming so the answer does not shift under the pointer.',
      },
      {
        heading: 'Partial JSON is a form filling itself in',
        body: 'Structured outputs stream by key: `{"title": "..."` arrives, then `"summary": "..."`, then `"items": [...`. The container is a form or card, not a paragraph. Vercel\'s AI SDK exposes `useObject` for this, streaming into a Zod schema so each field renders as soon as its value closes; a newer enum output mode lets the same hook stream a single classification, a support ticket\'s category or a document\'s risk level, as soon as the model commits to one of a fixed set of options.\n\nDesign decisions: skeletons per field, ordered emission that puts the highest-signal field first, and a visible resolve for arrays that grow. Never let the whole card wait on the last key.',
      },
      {
        heading: 'Component tree streaming is UI the model writes, with a production caveat',
        body: 'The model emits nodes and the client mounts them, three different ways depending on the platform. Vercel\'s AI SDK RSC package streams React Server Components through `streamUI`, but Vercel\'s own docs now mark this experimental and steer teams toward AI SDK UI\'s tool-call-plus-component-mapping pattern for anything shipping to production, because RSC streams cannot be aborted mid-request and remount on completion, causing a visible flicker. OpenAI\'s Apps SDK renders sandboxed HTML/CSS/JS bundles inline in ChatGPT through an iframe bridge. Anthropic\'s artifacts stream a full document into a side pane.\n\nReserve the panel before the first node arrives, keep node identity stable, and treat interactivity as arriving late: a button the model has not finished configuring should render disabled, not broken.',
      },
      {
        heading: 'Separate the tool that fetches data from the tool that renders it',
        body: 'OpenAI\'s Apps SDK guidance is explicit on this: if one tool call is wired to a widget template, every re-render of that tool re-renders the whole iframe, which flickers. The fix is a two-tool split. A data tool (`search_listings`) fetches and returns structured content with no widget attached. A render tool (`render_listings_widget`) takes the prepared data and is the only one carrying the widget metadata.\n\nThis mirrors the partial-JSON rule at the architecture level: separate what changes on every keystroke from what should mount once and stay stable. A generative UI surface that mixes the two re-mounts constantly, and users read a remounting card as a bug even when every individual render is correct.',
      },
      {
        heading: 'The three shapes have three failure modes',
        body: 'Token stream fails with an incomplete sentence: recover by showing the partial answer, a clear stop badge, and retry. Partial JSON fails with an invalid document: recover by rendering the fields you got and refusing the ones that never closed, do not throw the whole card away. Component tree fails with a mounted but broken subtree: recover by unmounting the bad node and streaming a repair.\n\nDesign each fail mode explicitly. The worst pattern is a generic "something went wrong" that discards a paragraph the user could have used, or a rendered card that is one field short of usable.',
      },
      {
        heading: 'Display mode is part of the shape, not an afterthought',
        body: 'OpenAI\'s Apps SDK ships four distinct display modes for a reason: an inline card for a single action or a small structured result, a carousel for three to eight scannable options, fullscreen for a rich multi-step task like an explorable map, and picture-in-picture for a persistent session like a live game. Each mode caps what belongs in it: an inline card allows at most two primary actions and no internal scrolling, a carousel caps metadata at two lines per item.\n\nThe same generative content picked for the wrong mode looks broken even if every component renders correctly. A comparison table crammed into an inline card scrolls internally, which the guidelines explicitly forbid, because internal scroll inside a chat bubble reads as a bug, not a feature.',
      },
      {
        heading: 'Hydration lag is a state, design it explicitly',
        body: 'Between "node mounted" and "node fully configured with real props" there is a gap, sometimes tens of milliseconds, sometimes a full round trip if the node is waiting on a second tool call. React calls this hydration; the user experiences it as a button that looks clickable but does nothing yet.\n\nDisable interactive elements until their props resolve, and show a visibly different affordance (a dimmed button, a skeleton input) rather than a fully styled control that silently does nothing. The worst version of this bug is invisible: the button looks done, the user clicks it, nothing happens, and they conclude the whole feature is broken rather than "not finished loading yet."',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-ai-streaming-shapes-inline-ladder.svg',
        alt: 'Three streaming shapes, three containers',
        caption: 'Tokens append into text. Keys resolve into fields. Nodes mount into a tree. Each ladder needs its own container and its own failure state.',
        diagramBrief:
          'Three vertical ladders side by side, cream paper background, black ink, one accent color. Ladder 1 "Token stream": rungs are characters appending into a paragraph shape. Ladder 2 "Partial JSON": rungs are labeled keys (title, summary, items) filling into a card shape. Ladder 3 "Component tree": rungs are UI nodes (header, list, button) mounting into a panel shape. Each ladder ends in a small "fail" icon with a one-word label unique to that shape (truncated, invalid, broken subtree).',
      },
      {
        src: '/lessons/de/de-ai-streaming-shapes-inline-split.svg',
        alt: 'Data tool versus render tool',
        caption: 'One tool fetches, a separate tool renders. Mixing the two remounts the whole widget on every follow-up.',
        diagramBrief:
          'Two-box flow diagram, cream paper, black ink, one accent color. Left box "data tool: search_listings" outputs structured content only (no widget icon). Arrow to right box "render tool: render_listings_widget" which takes that data and is the only box with a widget/iframe icon attached. Below, a crossed-out alternative showing a single box doing both, with a "flicker" warning icon next to it.',
      },
    ],
    takeaways: [
      'Name the shape before styling the surface. Token stream, partial JSON, component tree pick one per surface.',
      'Emit high-signal fields first so the container is useful before the last byte lands.',
      'Reserve layout for the whole answer at t0, then stream into it. Never resize the page under the user.',
      'Failure recovery differs by shape. Do not paper over three modes with one error state.',
    ],
    terms: [
      { term: 'Token stream', gloss: '"the text typing itself"', meaning: 'Character or token append into a text container, no structure beyond prose.' },
      { term: 'Partial JSON', gloss: '"a form that fills in"', meaning: 'Structured object whose keys resolve incrementally as the model streams values.' },
      { term: 'Component tree', gloss: '"generative UI"', meaning: 'Server or model emitted UI nodes mounted on the client as they arrive.' },
      { term: 'streamUI', gloss: '"the AI SDK function for this"', meaning: 'Vercel AI SDK RSC function that streams React Server Components; marked experimental, not recommended for production.' },
      { term: 'useObject', gloss: '"binding JSON to a schema"', meaning: 'AI SDK hook that binds a partial JSON stream to a Zod schema, including an enum mode for single-classification streams.' },
      { term: 'Hydration', gloss: '"making it interactive"', meaning: 'Attaching client behavior to a server-rendered or model-emitted node; a gap exists between mount and full interactivity.' },
      { term: 'Data tool / render tool split', gloss: '"avoiding the flicker"', meaning: 'Architecture pattern that separates a tool fetching content from the tool carrying the widget template, so re-fetching does not remount the UI.' },
      { term: 'Display mode', gloss: '"how much space it gets"', meaning: 'The container class (inline card, carousel, fullscreen, picture-in-picture) a generative surface renders into, each with its own content caps.' },
      { term: 'MCP Apps bridge', gloss: '"the wire format"', meaning: 'JSON-RPC over postMessage connecting a sandboxed widget iframe to its host, such as ChatGPT or any MCP Apps-compatible client.' },
      { term: 'Widget session id', gloss: '"keeping state across turns"', meaning: 'Identifier that lets a widget\'s state persist and sync across multiple tool calls in the same conversation.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A model streams `{"title": "..."` then later `"items": [...`. Name the shape and the container type it belongs in.' },
      { level: 'medium', prompt: 'A generative UI panel remounts and flickers every time the user asks a follow-up question about the same data. Diagnose the likely architecture mistake and name the fix.' },
      { level: 'hard', prompt: 'Design the fail state for a partial-JSON product card where the "price" field never closes because the tool call that would supply it times out. Specify what renders, what does not, and what action the user is offered.' },
      { level: 'design', prompt: 'Pick a generative surface you use weekly (an IDE\'s inline suggestions, a search product\'s answer card, a spreadsheet AI feature). Identify which of the three shapes it uses, and redesign one part of its loading state that currently reads as broken rather than as "still streaming."' },
    ],
    furtherReading: [
      { label: 'Vercel AI SDK - Migrating from RSC to UI', url: 'https://ai-sdk.dev/v5/docs/ai-sdk-rsc/migrating-to-ui', why: 'States plainly why streamUI and RSC streaming are not production-ready (flicker on remount, no mid-stream abort) and what to use instead.' },
      { label: 'Vercel AI SDK - Generative User Interfaces', url: 'https://ai-sdk.dev/v5/docs/ai-sdk-ui/generative-user-interfaces', why: 'The current, production-recommended pattern for binding tool results to React components.' },
      { label: 'OpenAI Apps SDK - Build your ChatGPT UI', url: 'https://developers.openai.com/apps-sdk/build/chatgpt-ui', why: 'Documents the data-tool/render-tool split and the MCP Apps bridge that keeps a generative widget from flickering.' },
      { label: 'OpenAI Apps SDK - UI guidelines', url: 'https://developers.openai.com/apps-sdk/concepts/ui-guidelines', why: 'Defines the four display modes and their content caps, the reference for matching a generative shape to the right container.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Streaming shape audit',
      body: '- Which of the three shapes (token stream, partial JSON, component tree) is this surface actually producing?\n- Does the container match the shape, or is prose being forced into a card, or structured data forced into a paragraph?\n- Is the highest-signal field emitted first, or does the whole card wait on the last key?\n- Is there a dedicated fail state per shape, or one generic error message covering all three?\n- If this is a component tree: is the data-fetching tool separated from the rendering tool?\n- Is every interactive element disabled until its props are fully resolved?\n- Does the display mode (inline, carousel, fullscreen, picture-in-picture) match the content, or is a rich multi-step task crammed into a small card?',
    },
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
      'The model does not answer with prose, it composes an interface from your components and hands the tree back to the client to mount. Your design system stops being decoration and becomes an API the model calls.',
    readTime: '~10 min read',
    diagram: '/lessons/de/de-ai-generative-ui.png',
    diagramCaption:
      'The registry is the menu. The prompt is the order. The tree the model returns is composed from typed primitives, then mounted on the client with three verbs: regenerate, pin, explain.',
    whyItMatters:
      'For a decade, UI was a fixed set of screens a designer laid out and a developer wired to data. Generative UI inverts that: v0, OpenAI\'s Apps SDK, and Vercel\'s AI SDK all let the model pick components, set props, and return the layout. A Figma library with loose codebase parity is invisible to a model. A typed, documented, code-connected registry is what it composes from, which raises the floor for what a design system has to be.',
    learningObjectives: [
      'Explain how a system prompt or tool schema turns a component library into an API the model can call.',
      'Distinguish a thin registry from a thick registry and predict which one composes a coherent screen across sessions.',
      'Design the three escape-hatch verbs (regenerate, pin, explain) for one node in a generative tree.',
      'Specify an Unknown fallback component and what it must preserve when the model emits an unregistered shape.',
      'Apply platform content caps (two actions per card, three to eight items per carousel) to a generative screen you are designing.',
    ],
    sections: [
      {
        heading: 'The system prompt hands the model a component menu',
        body: 'The model does not know your components. You tell it, in the system prompt or a tool schema, that `PriceCard`, `FlightList`, `WeatherWidget`, and `RecipeSteps` exist with these props and these constraints.\n\nVercel\'s AI SDK expresses this through tool calls that resolve to React components. OpenAI\'s Apps SDK expresses it as MCP resources that ship an HTML bundle, tied to a tool response through `_meta.ui.resourceUri` metadata. In both cases, the model chooses a component the way a designer chooses a Figma variant: from a finite, typed set, with props validated on the way in.',
      },
      {
        heading: 'Design decisions move from screen to registry',
        body: 'The composition happens at runtime, so screen-level Figma frames stop being the source of truth. What matters is the registry: which components exist, what props they take, what they are allowed to compose into, and how they degrade.\n\nThe design work is component API design plus a set of pattern rules ("Product picks always render at most three cards, always with a price and a rationale"). This is closer to writing a design lint rule than drawing a screen. If the registry is thin, the model composes junk; if it is thick, the same prompt yields a coherent interface across sessions.',
      },
      {
        heading: 'A registry entry is a contract, not a component',
        body: 'A registry entry needs more than a name and a prop list to be usable by a model: a description of when to use it ("PriceCard: a single priced item with a rationale, not a list"), a constraint on composition ("FlightList renders 1-3 PriceCard children, never more"), and a stated degrade path. OpenAI\'s Apps SDK formalizes part of this with resourceUri metadata tying a specific tool call to a specific widget template, so the model cannot pair mismatched data and UI.\n\nWithout an explicit "when to use" description, the model either avoids a component it should use or overuses one that happens to be well documented. The entry is closer to a well-written API endpoint description than a Figma annotation panel.',
      },
      {
        heading: 'Interactions on generative UI need explicit escape hatches',
        body: 'The user is looking at a screen the model wrote, so they need a way to bring the model back into the loop. Three moves earn their keep. First, an inline action ("regenerate this card") that recomposes one node without redrawing the whole panel. Second, a pin control that stops the model from replacing a component the user is using. Third, a "why this" affordance that reveals the prompt or tool call that produced the node.\n\nWithout these, the interface behaves like a slot machine and the user has no way to steer it.',
      },
      {
        heading: 'Ship a fallback for when the model returns a shape you did not register',
        body: 'The model will occasionally invent a component or pass props out of range. The client cannot render an unknown component, and it should not crash the whole tree either.\n\nDesign an `Unknown` primitive that renders a labeled block with the raw output and a "convert to text" action. This turns a hallucinated node into a debuggable one, and it lets the surrounding tree keep working. Log every fallback trigger. In an AI product, unknown components are how your design system tells you what to build next.',
      },
      {
        heading: 'Content caps make a registry usable at every size',
        body: 'A thick registry still produces junk if it has no rules about density. OpenAI\'s Apps SDK guidelines are specific: an inline card gets at most two primary actions and must never scroll internally, a carousel holds three to eight items with no more than two lines of metadata each.\n\nBuild the same caps into your own registry rules regardless of platform: "ProductPicks renders at most 3 cards, always with a price and a one-line rationale" is a content cap, not a visual style rule, and it belongs in the same document as the prop schema, not in a separate style guide the model never sees.',
      },
      {
        heading: 'State has to survive the next tool call',
        body: 'A generative UI that forgets what the user just did between turns feels broken in a specific way: the user adds an item to a cart, asks a follow-up question, and the cart resets. OpenAI\'s Apps SDK addresses this with a widget session id that keeps widget state synced across tool calls, so the model and the widget share one state instead of each holding a stale copy.\n\nDesign this explicitly: decide what state belongs to the widget, what belongs to the model, and what belongs to neither. A registry without a state contract will eventually ship a component that quietly resets on the third turn, and a user will file a bug calling the product forgetful.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-ai-generative-ui-inline-registry.svg',
        alt: 'A registry entry as a contract',
        caption: 'A component entry is a prop schema, a when-to-use line, a composition rule, and a content cap, not just a name and a shape.',
        diagramBrief:
          'A single card diagram, cream paper background, black ink, one accent color, styled like an index card. Title "PriceCard" at top. Four labeled rows beneath: "props: title, price, rationale (required)", "when to use: single priced item with a rationale", "composes into: FlightList, max 3 children", "cap: one line rationale, 40 characters". A small stamp icon in the corner reading "contract, not decoration".',
      },
      {
        src: '/lessons/de/de-ai-generative-ui-inline-verbs.svg',
        alt: 'Three escape-hatch verbs on one node',
        caption: 'Regenerate, pin, and explain turn a composed screen from a slot machine into something the user can steer.',
        diagramBrief:
          'A single generative card (e.g. a FlightList item) drawn center, cream paper, black ink, one accent color. Three small icon buttons anchored to its corner: a circular arrow labeled "regenerate", a pin icon labeled "pin", a question mark bubble labeled "explain". A dotted line from "explain" points to a small popover showing "prompt: find cheapest morning flight" as an example of what it reveals.',
      },
    ],
    takeaways: [
      'Treat your component library as the model\'s API. Types, defaults, and constraints matter more than styling.',
      'Move design work from screen frames to a registry with pattern rules and prop schemas.',
      'Generative surfaces need three verbs on every node: regenerate, pin, explain.',
      'Ship an `Unknown` fallback so hallucinated components degrade gracefully, and log every trigger.',
    ],
    terms: [
      { term: 'Generative UI', gloss: '"AI builds the screen"', meaning: 'Interface composed by the model at runtime from a registered set of typed primitives.' },
      { term: 'Component registry', gloss: '"the design system, but for the model"', meaning: 'Typed catalog of primitives, their props, and their composition rules, exposed to the model in a system prompt or tool schema.' },
      { term: 'streamUI', gloss: '"the streaming function"', meaning: 'Vercel AI SDK RSC function that streams React Server Components; superseded in production use by tool-call plus component mapping.' },
      { term: 'Apps SDK', gloss: '"OpenAI\'s version of this"', meaning: 'OpenAI protocol, built on MCP, for shipping sandboxed app UI into ChatGPT.' },
      { term: 'Artifact', gloss: '"the side panel"', meaning: 'Anthropic\'s side pane where a full generated document or component lives, separate from the chat stream.' },
      { term: 'Unknown fallback', gloss: '"the safety net"', meaning: 'Placeholder primitive that renders a labeled block with raw output when the model emits an unregistered component.' },
      { term: 'Content cap', gloss: '"how much fits"', meaning: 'A platform or registry rule limiting item count, action count, or text length per component, so density stays legible.' },
      { term: 'Widget session id', gloss: '"shared memory"', meaning: 'Identifier keeping a widget\'s state synced with the model across multiple tool calls in one conversation.' },
      { term: 'Resource URI', gloss: '"which widget goes with which tool"', meaning: 'Metadata tying a specific tool response to a specific widget template, preventing mismatched data and UI.' },
      { term: 'MCP resource', gloss: '"the wire format for a widget"', meaning: 'A Model Context Protocol resource type used to register and serve a UI bundle alongside a tool\'s data.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A registry has five components but only two have a documented "when to use" description. Predict which two the model will overuse, and explain why.' },
      { level: 'medium', prompt: 'A generative shopping cart resets every time the user asks an unrelated follow-up question. Diagnose which state contract is missing and propose the fix.' },
      { level: 'hard', prompt: 'Design the Unknown fallback for a hallucinated component called `LiveStockTicker` that the model invents mid-conversation. Specify exactly what the fallback preserves and what action it offers the user.' },
      { level: 'design', prompt: 'Pick three components for a travel-booking assistant (FlightList, PriceCard, WeatherWidget). Write the registry entry for one of them: name, props, a one-line "when to use," a composition constraint, and a content cap. Then sketch the three escape-hatch verbs on it.' },
    ],
    furtherReading: [
      { label: 'Vercel - AI SDK 3 Generative UI', url: 'https://vercel.com/blog/ai-sdk-3-generative-ui', why: 'The original announcement explaining why a design system needs to become a typed, model-readable registry.' },
      { label: 'OpenAI Apps SDK - Build your ChatGPT UI', url: 'https://developers.openai.com/apps-sdk/build/chatgpt-ui', why: 'Documents resourceUri metadata, the data-tool/render-tool split, and widget session state, the mechanics behind a real generative registry.' },
      { label: 'OpenAI Apps SDK - UI guidelines', url: 'https://developers.openai.com/apps-sdk/concepts/ui-guidelines', why: 'The content caps (two actions per card, three to eight items per carousel) that keep a thick registry from producing dense, illegible screens.' },
      { label: 'openai/openai-apps-sdk-examples', url: 'https://github.com/openai/openai-apps-sdk-examples', why: 'Working registry examples (Pizzaz, kitchen sink, shopping cart) showing state sync and widget composition end to end.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Registry entry checklist',
      body: '- Name and prop schema, typed and validated.\n- A one-line "when to use this, not that" description the model can read.\n- A composition constraint (what it can contain, what it cannot).\n- A content cap (max items, max actions, max text length).\n- A stated degrade path if a prop is missing or out of range.\n- The three escape-hatch verbs: does this node support regenerate, pin, and explain?\n- A state contract: what does the widget own, what does the model own, what resets on the next turn versus what persists.\n- Is there an Unknown fallback registered for shapes outside this catalog, and is every fallback trigger logged?',
    },
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
      'A citation on a paragraph proves nothing when that paragraph mixes three claims from three sources. Ground at the clause the source actually backs, not the document it came from.',
    readTime: '~10 min read',
    diagram: '/lessons/de/de-ai-grounding-spans.png',
    diagramCaption:
      'Two grounding surfaces: inline chips at the clause and a filtered evidence panel by selection. Both entries hit the same source set, but the clause-level chip is a promise where the paragraph-level chip is an alibi.',
    whyItMatters:
      'Most RAG products drop a footnote at the end of a paragraph and call it grounding, so the reader trusts the whole answer or none of it. Perplexity binds citation brackets mid-sentence and averages 5 to 10 sources per answer; Elicit and Consensus attach per-paper snippets to every claim. This is a design pattern, not a retrieval one: the model already returns per-claim sources, the interface just has to stop burying them at the end.',
    learningObjectives: [
      'Explain why a citation attached to a paragraph fails when the paragraph mixes claims from multiple sources.',
      'Compare inline citation formats across at least three products and state which binds mid-sentence versus at sentence end.',
      'Design a source chip that carries a corroboration count and opens a filtered evidence panel on selection.',
      'Specify the visual distinction between a grounded and an ungrounded claim, and defend why no chip at all is the worst option.',
      'Apply a feedback taxonomy that separates a wrong source from bad writing to a negative-feedback flow.',
    ],
    sections: [
      {
        heading: 'The chip belongs at the clause, not the paragraph',
        body: 'Attach a compact source chip (`nyt +2`) to the noun or verb the source backs, not to the paragraph. The chip does two jobs: it names the publisher so a reader can weight the claim without clicking, and it counts the corroborating sources when more than one supports the same clause.\n\nPerplexity\'s chips do both. Chips at the paragraph fail because a paragraph usually mixes claims from three sources, so the reader has to guess which chip covers which sentence. A chip at the clause is a promise. A chip at the paragraph is an alibi.',
      },
      {
        heading: 'Citation formats are not interchangeable across products',
        body: 'A 2026 comparison of citation formats across engines found real structural differences, not just visual ones. Perplexity binds bracket markers mid-sentence, often stacking multiple brackets when several sources support one claim, and averages 5 to 10 sources per answer. ChatGPT\'s browse-mode citations sit at sentence end as numeric superscripts and average closer to 3 to 6. Google\'s AI Overviews use an icon chip with roughly 13 sources per answer but push the source list into a side panel rather than inline.\n\nMid-sentence binding tells the reader exactly which clause a source backs. Sentence-end binding forces a guess when a sentence contains two claims, which in practice is most paragraphs.',
      },
      {
        heading: 'Selection is the second grounding surface',
        body: 'Let the user select any span to see its sources. Perplexity splits this into two actions on a selection: "iterate" (follow up) and "check sources" (verify). The verify path opens a panel listing only the sources that back the selected span, filtered from the full source list.\n\nThis is the citation equivalent of Command-F: it puts audit in the reading flow. Without span selection, the user has to hover every chip or scroll to the sources tab. With it, the audit is one drag, one click, and the reader stays in the answer.',
      },
      {
        heading: 'Ranked source lists earn their pane',
        body: 'A citation tab is not a bibliography, it is a ranked evidence panel. Order by how many claims the source supports, not by retrieval order. Show a snippet from the matched passage, not just the URL, so the reader knows why this source made the cut.\n\nElicit and Consensus both do this, with per-paper snippets and per-claim badges. If the panel is a list of URLs, the reader will not open it. If it is a ranked, snippeted, cross-referenced set, they will, and the answer becomes auditable inside the reading UI itself.',
      },
      {
        heading: 'Hover previews trade discoverability for effort',
        body: 'Perplexity\'s citation markers expand into a preview card on hover, showing favicon, domain, and a matched snippet, without requiring a click. This is fast for a reader already scanning with a mouse, and nearly invisible on a touchscreen, where hover does not exist. Products with a meaningful mobile audience need a tap-to-expand equivalent, not a scaled-down hover state.\n\nRegardless of trigger, the preview\'s job is to answer one question in under a second: does this source look credible enough that I do not need to leave the answer. A preview showing only a bare URL fails that job.',
      },
      {
        heading: 'No source, no claim, or say so',
        body: 'If the model wants to state something it did not ground, the UI has to mark that clearly. A different chip color, a caveat pill, or an inline note ("no sources found for this claim") does the work.\n\nWhat must not happen is the same chip style on grounded and ungrounded claims, or worse, no chip at all, so the reader cannot tell what is quoted from what is inferred. This is the design equivalent of typed nulls: the shape of "no evidence" has to be as legible as the shape of "here is evidence."',
      },
      {
        heading: 'A feedback taxonomy that separates bad sourcing from bad writing',
        body: 'Perplexity\'s negative-feedback flow includes a distinct "wrong sources" category, separate from a general "inaccurate" flag. This matters because the two failures need different fixes: a wrong source is a retrieval problem, engineering\'s to solve, while bad writing from a correct source is a generation problem the prompt or model choice should fix.\n\nIf your product collects feedback on generated, cited content, split the taxonomy at minimum into wrong source, missing source, and correct source but wrong interpretation. Route each to a different team, and the citation UI itself measurably improves within a few product cycles instead of accumulating unlabeled complaints.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-ai-grounding-spans-inline-formats.svg',
        alt: 'Citation binding compared across products',
        caption: 'Mid-sentence bracket binding tells the reader which clause a source backs. Sentence-end binding forces a guess when a sentence carries two claims.',
        diagramBrief:
          'Two stacked sentence examples, cream paper background, black ink, one accent color. Top example: a sentence with two clauses, each with a bracket chip immediately after the clause it supports, labeled "mid-sentence binding, e.g. Perplexity". Bottom example: the same two-clause sentence with a single superscript number only at the very end, labeled "sentence-end binding, e.g. ChatGPT browse mode", with a small question mark hovering over the first clause showing the ambiguity.',
      },
      {
        src: '/lessons/de/de-ai-grounding-spans-inline-panel.svg',
        alt: 'Evidence panel versus bibliography',
        caption: 'A ranked evidence panel with snippets gets opened. A flat list of URLs does not.',
        diagramBrief:
          'Two side-by-side panel mockups, cream paper background, black ink, one accent color highlighting the recommended one. Left panel "bibliography": a plain numbered list of five bare URLs. Right panel "evidence panel": five rows each with a favicon, domain name, a one-line snippet, and a small badge showing how many claims it supports, sorted by that badge descending. A checkmark over the right panel, an X over the left.',
      },
    ],
    takeaways: [
      'Attach source chips to the clause they back, not the paragraph, and count corroborating sources on the chip.',
      'Make span selection open a filtered source list. It is the Command-F of grounding.',
      'The sources pane is a ranked evidence panel, not a bibliography. Snippet each entry.',
      'Make ungrounded claims visually distinct from grounded ones, or the citation system is a costume.',
    ],
    terms: [
      { term: 'Grounding', gloss: '"backing up the claim"', meaning: 'Anchoring a generated claim to a specific retrieved source.' },
      { term: 'Source chip', gloss: '"the little citation tag"', meaning: 'Compact inline element naming a publisher and counting corroborating sources for one claim.' },
      { term: 'Span citation', gloss: '"citing the sentence, not the page"', meaning: 'A citation bound to a specific text range (a clause or sentence) rather than an entire paragraph or document.' },
      { term: 'Mid-sentence binding', gloss: '"where the bracket sits"', meaning: 'Attaching a citation marker to the exact clause it supports, even inside a sentence with multiple claims.' },
      { term: 'Retrieval', gloss: '"the search step"', meaning: 'The step that returns candidate source documents for the model to ground claims against.' },
      { term: 'Corroboration count', gloss: '"how many sources agree"', meaning: 'The number of independently retrieved sources that support the same claim.' },
      { term: 'Evidence panel', gloss: '"the sources tab, done right"', meaning: 'A ranked, snippeted list of sources with per-claim badges, distinct from a flat bibliography of URLs.' },
      { term: 'Hover preview', gloss: '"quick verify"', meaning: 'An inline expansion showing a source\'s favicon, title, and matched snippet without a full click-through.' },
      { term: 'Wrong-sources feedback', gloss: '"a specific complaint category"', meaning: 'A negative-feedback taxonomy entry that isolates a retrieval failure from a general accuracy complaint.' },
      { term: 'Passage-level binding', gloss: '"citing the exact paragraph, not just the domain"', meaning: 'Grounding tied to the specific retrieved passage that matched, not merely to the source document as a whole.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A paragraph carries one citation chip at the end and contains three distinct factual claims. State the specific failure this causes for a skeptical reader.' },
      { level: 'medium', prompt: 'Compare mid-sentence bracket binding against sentence-end superscript binding for a paragraph containing two claims from two different sources. Which format lets the reader identify which source backs which claim without clicking anything?' },
      { level: 'hard', prompt: 'Design the evidence panel for an answer with 7 sources, where 2 sources each support 3 different claims and one source supports only 1 claim. Specify the sort order and what per-source metadata earns a place in the ranked list.' },
      { level: 'design', prompt: 'Sketch a negative-feedback flow for a cited-answer product. Design at least three distinct complaint categories, not just "inaccurate," and specify which team each one routes to.' },
    ],
    furtherReading: [
      { label: 'Geodocs - AI Citation Format Specification by Engine, 2026', url: 'https://geodocs.dev/reference/ai-citation-format-spec-by-engine', why: 'A direct structural comparison of citation placement and average source count across Perplexity, ChatGPT, Google AI Mode, and Claude.' },
      { label: 'AIUXPlayground - Perplexity Citations UX teardown', url: 'https://aiuxplayground.com/teardowns/perplexity/citations', why: 'A full teardown of Perplexity\'s layered citation system, from inline chips to the sources sidebar to the wrong-sources feedback path.' },
      { label: 'Elicit', url: 'https://elicit.com', why: 'Live example of per-paper snippets and per-claim evidence badges in a ranked evidence panel, the pattern this lesson argues every RAG product needs.' },
      { label: 'Consensus', url: 'https://consensus.app', why: 'A second live example of citation badges scoped to a scientific claim, useful for comparing against Elicit\'s layout.' },
    ],
    shipIt: {
      kind: 'rubric',
      name: 'Grounding UI rubric',
      body: '- Is every chip attached to the clause it backs, or only to the end of the paragraph?\n- Does the chip carry a corroboration count when more than one source agrees?\n- Can the user select any span and see a filtered evidence list for just that selection?\n- Is the evidence panel ranked by claims supported, with a matching snippet, or is it a flat list of URLs?\n- Is there a distinct visual treatment for an ungrounded claim, or does it look identical to a grounded one?\n- Does the hover or tap preview show domain, title, and a matched snippet, or just a bare link?\n- Does the feedback flow separate "wrong source" from "wrong writing," or is there only one generic complaint box?',
    },
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
      '"87 percent confidence" is a design failure. Users cannot calibrate a percent against their own risk, and a model cannot calibrate a percent against reality. Turn confidence into a severity band and an action the user can take.',
    readTime: '~10 min read',
    diagram: '/lessons/de/de-ai-confidence-ux.png',
    diagramCaption:
      'A percent maps to nothing the user can act on. A three-band severity plus a verb (verify, cite, explain, retry) maps every confidence state to a next click.',
    whyItMatters:
      'A confidence number pretends to be evidence while giving the user nothing to do with it. Grammarly renders severity bands instead of scores, Copilot dims ghost text instead of showing a percentage, and Figma\'s AI design checking uses definitive phrasing for certain findings and suggestive phrasing for tentative ones. None of them show a raw number, because humans rank three or four bands well and read unfamiliar percentages badly.',
    learningObjectives: [
      'Explain why a raw confidence percent fails to calibrate against a user\'s own risk tolerance.',
      'Compare severity-band encoding against ghost-text opacity encoding, and state which products use which.',
      'Design a companion verb (verify, cite, explain, retry) for a specific low-confidence state.',
      'Distinguish definitive phrasing from suggestive phrasing and apply the distinction to a UI copy decision.',
      'Evaluate whether a "high confidence" band is actually calibrated against ground truth, and describe what evidence that requires.',
    ],
    sections: [
      {
        heading: 'Severity ranks beat percent scores',
        body: 'Grammarly renders suggestions as "critical," "advisory," and "enhancement" bands, with different colors and different acceptance costs. The user learns the ranks in a session and calibrates their skepticism.\n\nCopilot dims the ghost text for a lower-confidence completion so the eye reads it as "maybe" without a legend. Both encode uncertainty in the shape of the surface rather than a number in a tooltip. This works because humans are good at ranking three or four bands and bad at reading percents on unfamiliar scales. Design the bands and let the number drive them internally.',
      },
      {
        heading: 'Definitive versus suggestive phrasing is a copy decision, not a badge decision',
        body: 'Figma\'s AI design checking distinguishes what it is certain about from what it is merely suggesting, entirely through language, not a percentage. An exact token mismatch, a color that is `#3B82F5` instead of the design system\'s `#3B82F6`, gets flagged with definitive phrasing: "this color does not match your token." A layout recommendation gets suggestive phrasing: "consider aligning this to the 8px grid."\n\nThe distinction protects trust in both directions. A system that phrases everything with equal certainty either undersells its strong findings or oversells its weak ones, and a user burned by a low-confidence suggestion starts distrusting the high-confidence flags too.',
      },
      {
        heading: 'Hedged prose is a UX choice, not a model quirk',
        body: 'When the model is unsure, its language should show it: "likely," "based on limited sources," "I could not verify." Perplexity Pro puts explicit source-gap notes in the answer body. Anthropic\'s system prompt instructs Claude to hedge when uncertain.\n\nThis is prose-level uncertainty design: the reader gets the confidence signal in the same stream as the claim, at the exact moment it matters. Absent hedging, every claim reads with the same weight, and users either over-trust everything or over-trust nothing. Prescribe the hedging vocabulary in the system prompt and enforce it in evals.',
      },
      {
        heading: 'The accept-reject-edit pattern makes distrust free',
        body: 'GitHub Copilot\'s ghost text, shipped as a technical preview in June 2021, works because rejecting a suggestion costs nothing: keep typing and the suggestion vanishes, no dialog, no undo. Accepting costs one deliberate keystroke, Tab. This asymmetry, cheap to reject, deliberate to accept, is itself a confidence signal: the interface tells the user they do not owe the suggestion trust by default.\n\nContrast this with a feature that applies a change automatically and makes the user hunt for undo. At identical accuracy, the second design produces more anxiety, because distrust now costs effort.',
      },
      {
        heading: 'The verify affordance turns uncertainty into an action',
        body: 'When confidence is low, do not just warn, do the work. Perplexity\'s "check sources" moves the user into a source list filtered to the questioned claim. Copilot\'s "explain" opens a rationale panel.\n\nIn an AI-first product, low confidence should always have a companion verb: verify, cite, explain, or ask again. This changes the emotional weight of uncertainty from anxiety ("is this right?") to progress ("here is the next click"). A passive badge with no verb reads as blame, not signal.',
      },
      {
        heading: 'Calibration is a design contract, not a model brag',
        body: 'If you show a "high confidence" tag, high-confidence answers had better be right more often than "medium" ones. Track calibration in evals and align the UX ranks to what the model actually delivers, not what the team hopes for.\n\nA miscalibrated confidence UI is worse than none, because the user extends more trust exactly where the model deserves less. Publish the calibration curve to the design team. Bands that do not reflect ground truth need to move, or the whole surface loses credibility over one bad Monday.',
      },
      {
        heading: 'Not every low-confidence surface should hide behind ghost text',
        body: 'When GitHub built Copilot for CLI, the team deliberately rejected ghost text and kept a "double trigger" confirmation step, because shell commands are short, high-consequence, and rarely peer-reviewed before they run. A wrong ghost-text suggestion in an IDE gets caught by a compiler; a wrong shell command can delete a production database before anyone notices.\n\nMatch the friction of the confidence affordance to the reversibility and blast radius of the action, not to a house style. A severity band and a one-tap accept are right for a grammar suggestion. A visible confirmation step is right for anything that runs, deletes, or sends.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-ai-confidence-ux-inline-phrasing.svg',
        alt: 'Definitive versus suggestive phrasing',
        caption: 'A high-certainty finding gets stated as fact. A lower-certainty one gets framed as optional. Same UI slot, two different registers.',
        diagramBrief:
          'Two example UI rows, cream paper background, black ink, one accent color. Row 1 labeled "definitive (high certainty)": icon of a solid checkmark or flag, text "This color does not match your token." Row 2 labeled "suggestive (lower certainty)": icon of a dotted outline or lightbulb, text "Consider aligning this to the 8px grid." A small note beneath: "same component, different phrasing register, chosen by evidential strength."',
      },
      {
        src: '/lessons/de/de-ai-confidence-ux-inline-friction.svg',
        alt: 'Friction matched to blast radius',
        caption: 'A grammar suggestion earns one-tap accept and free rejection. A shell command earns a visible confirmation step. Same ghost-text mechanic, different stakes.',
        diagramBrief:
          '2x2 matrix diagram, cream paper background, black ink, one accent color. X-axis "reversibility: easy to hard". Y-axis "blast radius: small to large". Plot four example AI suggestions as small labeled dots: "grammar fix" (easy, small, bottom-left, marked "ghost text, free reject"), "code completion" (easy-medium, small-medium), "shell command" (hard, large, top-right, marked "confirmation required"), "auto-send email" (hard, large, top-right, also marked "confirmation required").',
      },
    ],
    takeaways: [
      'Never show a raw confidence percent. Use three or four severity bands the user can learn in a session.',
      'Hedge in prose when the model is unsure. Prescribe the vocabulary and enforce it in evals.',
      'Pair every low-confidence state with an action verb: verify, cite, explain, retry.',
      'Calibrate the bands against evals. Miscalibrated confidence is a trust leak.',
    ],
    terms: [
      { term: 'Confidence', gloss: '"how sure the model is"', meaning: 'The model\'s internal estimate of correctness for a claim or completion, rarely exposed as a raw number to users.' },
      { term: 'Calibration', gloss: '"does the number mean anything"', meaning: 'Whether a stated or implied confidence level matches empirical accuracy across many instances.' },
      { term: 'Severity band', gloss: '"critical, advisory, hint"', meaning: 'A named tier that encodes confidence through category rather than through a percentage.' },
      { term: 'Ghost text', gloss: '"the greyed-out suggestion"', meaning: 'A faint inline completion whose opacity or styling can encode the model\'s estimated acceptance likelihood.' },
      { term: 'Hedged prose', gloss: '"likely, based on limited sources"', meaning: 'Language inside the answer itself that signals uncertainty at the exact point a claim is made.' },
      { term: 'Verify affordance', gloss: '"the next click"', meaning: 'A companion action, verify, cite, explain, or retry, that turns a low-confidence state into something the user can act on instead of worry about.' },
      { term: 'Definitive phrasing', gloss: '"this is wrong"', meaning: 'Copy used for a high-certainty finding, stating the issue as fact rather than as a suggestion.' },
      { term: 'Suggestive phrasing', gloss: '"consider trying"', meaning: 'Copy used for a lower-certainty recommendation, framed as optional rather than corrective.' },
      { term: 'Accept-reject-edit', gloss: '"the Copilot pattern"', meaning: 'An interaction model where accepting a suggestion takes one deliberate action and rejecting it takes none.' },
      { term: 'Blast radius', gloss: '"how much breaks if this is wrong"', meaning: 'The scope of potential damage from a wrong or accepted-too-quickly AI suggestion, used to decide how much friction its confirmation needs.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A feature shows "confidence: 71%" on a suggested edit. Rewrite that into a severity band with no visible number.' },
      { level: 'medium', prompt: 'A code-suggestion feature and a shell-command feature both use ghost text with the same acceptance mechanics. Explain why this is a mistake for the shell-command feature specifically, using blast radius as the deciding factor.' },
      { level: 'hard', prompt: 'Design the calibration check you would run before shipping a three-band confidence UI (high, medium, low) for a legal-document review tool. Specify what ground truth you need and what "the bands are miscalibrated" would look like in the data.' },
      { level: 'design', prompt: 'Pick one AI feature you use that currently shows a raw percent or an unlabeled badge. Redesign it with a severity band, a companion verb, and a one-line distinction between definitive and suggestive phrasing for two example findings.' },
    ],
    furtherReading: [
      { label: 'Ideaplan - Designing for AI Trust (2026)', url: 'https://www.ideaplan.io/blog/designing-for-ai-trust-patterns', why: 'Explains Figma\'s definitive-versus-suggestive phrasing pattern and the Copilot accept-reject-edit asymmetry in detail, both cited in this lesson.' },
      { label: 'GitHub Blog - A guide to designing and shipping AI developer tools', url: 'https://github.blog/ai-and-ml/github-copilot/a-guide-to-designing-and-shipping-ai-developer-tools/', why: 'The original account of why Copilot for CLI rejected ghost text and kept a confirmation step, from the designers who made the call.' },
      { label: 'VS Code docs - Inline suggestions from GitHub Copilot', url: 'https://code.visualstudio.com/docs/editing/ai-powered-suggestions', why: 'Documents the actual ghost-text and next-edit-suggestion mechanics this lesson describes.' },
      { label: 'Simon Willison - Highlights from the Claude 4 system prompt', url: 'https://simonwillison.net/2025/May/25/claude-4-system-prompt/', why: 'Shows the hedging vocabulary Anthropic prescribes directly in Claude\'s system prompt, the mechanism behind prose-level uncertainty design.' },
    ],
    shipIt: {
      kind: 'rubric',
      name: 'Confidence UX rubric',
      body: '- Is a raw percent ever shown to the user, and if so, can it be replaced with a severity band?\n- Does copy on high-certainty findings read as definitive, and copy on low-certainty findings read as suggestive?\n- Is rejecting a suggestion free (no dialog, no undo needed), and is accepting it a single deliberate action?\n- Does every low-confidence state carry a companion verb: verify, cite, explain, or retry?\n- Is the friction of the confirmation step matched to the blast radius of the action, not to a house style?\n- Has the band system been checked against ground truth, and would a miscalibration actually be visible in the data you collect?',
    },
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
      'Every AI product has an invisible microcopy layer, the system prompt, that shapes how it talks, what it refuses, and where it hedges. A designer owns it deliberately, or an engineer writes it in a hurry.',
    readTime: '~10 min read',
    diagram: '/lessons/de/de-ai-system-prompt-microcopy.png',
    diagramCaption:
      'The system prompt is a versioned document: persona, register, refusal grammar, hedge vocabulary, format constraints. Everything the model says downstream is compiled from it.',
    whyItMatters:
      'The system prompt is the tone document, the refusal policy, and the hedging vocabulary in one file. Anthropic publishes Claude\'s system prompt with every release, down to specific banned words and a rule for when bullet points are allowed, precisely because it is UX, not engineering plumbing. If a designer does not own this file, the product\'s voice drifts every release and nobody can say why.',
    learningObjectives: [
      'Explain why Anthropic treats Claude\'s system prompt as a versioned, public-facing document rather than an internal artifact.',
      'Identify at least three concrete, testable rules from a real system prompt excerpt, not vague brand words.',
      'Design one output constraint (length, format, or citation rule) that belongs in the system prompt rather than in parsing code.',
      'Distinguish a system-level style feature from a one-off custom instruction, and explain why they need different trust boundaries.',
      'Critique a generic "you are a helpful assistant" prompt and rewrite three of its rules to be enforceable.',
    ],
    sections: [
      {
        heading: 'The prompt is where voice actually lives',
        body: 'Buttons carry ten words. The system prompt carries five hundred, and the model reproduces them every turn. Claude\'s current system prompt is specific down to word choice: it instructs Claude to avoid "genuinely," "honestly," and "straightforward" because they read as disingenuous filler, and it has an explicit rule banning bullet points in casual conversation, reserving them for responses complex enough to need them.\n\nVague brand words yield vague brand behavior. If you want short answers, write a rule for it. If you want the assistant not to say "great question," write that down.',
      },
      {
        heading: 'Version and diff it like content, not code',
        body: 'Anthropic\'s system-prompt changelog is the model. You can read exactly what changed between one Claude version and the next, and attribute a behavior shift to a specific edit. Do the same in your product. Store the prompt in the repo, but review it in a doc surface where designers can comment on tone changes.\n\nA one-line edit ("respond in at most three sentences") is a UX change that affects every reply in the product. Treat it that way, with the same review discipline as a release, not a typo fix.',
      },
      {
        heading: 'A real system prompt handles a real current event, live',
        body: 'Anthropic\'s July 2026 system prompt update for two Claude models is a working example of the prompt as tone document under pressure. When those models were briefly suspended in June 2026 to comply with U.S. export controls and then restored, Anthropic wrote explicit instructions into the prompt for how Claude should discuss it: confirm the suspension happened, do not deny it, treat the topic like any other current political matter with a fair account rather than a personal opinion, and point to Anthropic\'s own public statement for anything further.\n\nThis is content design responding to a news cycle in real time. No frontend deploy was needed to change how the product talked about the event; the system prompt shipped it.',
      },
      {
        heading: 'Constraints belong here, not scattered across the codebase',
        body: 'The system prompt is the natural home for output constraints the UI depends on: markdown headings only, code fences with language tags, no more than four bullets, cite every claim.\n\nWhen these constraints live in the prompt, they move with the persona. When they live scattered across parsing code, they drift and the UI breaks silently. Instructions the UI depends on need to be executable in the model\'s head, which is what a system prompt is for.',
      },
      {
        heading: 'Styles are a second, user-facing prompt layer',
        body: 'Claude\'s system prompt reserves a distinct slot for "styles," user-selectable presets such as Concise, Explanatory, Formal, or a custom one the user writes, that inject their own tone instructions on top of the base persona. The prompt explicitly resolves conflicts: if the user\'s in-chat instructions contradict their selected style, the live instruction wins, and Claude tells the user the style can be changed in settings rather than silently overriding it.\n\nThis is a second microcopy layer above the base persona, and it needs its own design ownership: someone has to decide what "Concise" actually constrains, or the style options become five different flavors of vague.',
      },
      {
        heading: 'Guard the boundary between prompt and user input',
        body: 'The system prompt is trusted, the user message is not. If the UI mixes them, prompt injection becomes a copy-paste attack. Anthropic and OpenAI use explicit role separation for exactly this reason.\n\nThe design implication is that any user-authored persona, tool description, or shared conversation link needs to be quarantined visually and technically. "Custom instructions" and "share this chat" both cross the trust line, and the product must show which side of the line the reader is on.',
      },
      {
        heading: 'Knowledge cutoff disclosure is a hedging rule with a date attached',
        body: 'Claude\'s system prompt states its reliable knowledge cutoff explicitly and instructs the model to answer the way a highly informed individual at that date would, flagging when a claim might be stale and pointing to web search for anything current. This is the confidence-UX hedging rule applied to time instead of accuracy: the model is told exactly when to say "I might be out of date" instead of guessing silently.\n\nAny product shipping a model with a fixed training cutoff needs an equivalent, explicit rule, not an implicit hope that the model volunteers its own limitation.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-ai-system-prompt-inline-layers.svg',
        alt: 'Two microcopy layers stacked',
        caption: 'A base persona sits underneath a user-selectable style, and the prompt has to state explicitly which one wins when they disagree.',
        diagramBrief:
          'Two stacked horizontal bands, cream paper background, black ink, one accent color. Bottom band labeled "base system prompt: persona, refusal grammar, hedge vocabulary, format rules". Top band labeled "style preset: Concise / Formal / Scholarly / custom", drawn as a translucent overlay on top of the bottom band. An arrow labeled "conflict rule: latest user instruction wins" pointing from the top band down into the bottom one.',
      },
      {
        src: '/lessons/de/de-ai-system-prompt-inline-diff.svg',
        alt: 'A one-line prompt diff as a UX change',
        caption: 'A single edited line in the system prompt reaches every reply in the product the next time it loads. Treat it with release-level review, not a typo fix.',
        diagramBrief:
          'A diff-style code block visual, cream paper background, black ink, one accent color for additions. Two lines shown: a struck-through line reading "- Answer the user\'s questions clearly." and a highlighted added line reading "+ Respond in three sentences or fewer unless asked for more." Below, a fan-out arrow to five small icons representing different surfaces (chat, search, mobile, email digest, API) all labeled "inherits this line".',
      },
    ],
    takeaways: [
      'Designers own the system prompt. If nobody does, the product\'s voice drifts every release.',
      'Write the prompt with the discipline of landing copy. Version it, diff it, review the tone changes.',
      'Put output constraints (length, format, citations) in the prompt, not in scattered parsing code.',
      'Quarantine user-authored content that pretends to be system content. It is a design surface, not a security nit.',
    ],
    terms: [
      { term: 'System prompt', gloss: '"the invisible instructions"', meaning: 'Trusted instructions that precede every user message in a chat, shaping tone, refusals, and format.' },
      { term: 'Persona', gloss: '"the brand voice"', meaning: 'The consistent register, tone, and refusal style a model performs across a product.' },
      { term: 'Refusal policy', gloss: '"when it says no"', meaning: 'Rules for when and how a model declines a request, and what tone the decline takes.' },
      { term: 'Prompt injection', gloss: '"fake system instructions"', meaning: 'User-authored content that impersonates or overrides system-level instructions.' },
      { term: 'Custom instructions', gloss: '"user preferences"', meaning: 'User-authored preferences that layer onto the base system prompt for that user\'s sessions only.' },
      { term: 'Style preset', gloss: '"Concise, Formal, Scholarly..."', meaning: 'A named, user-selectable tone preset that injects its own instructions on top of the base persona, with defined conflict-resolution rules.' },
      { term: 'Release-note diff', gloss: '"the prompt changelog"', meaning: 'A public changelog of edits to a system prompt between model versions, letting outside observers attribute behavior changes to specific lines.' },
      { term: 'Knowledge cutoff disclosure', gloss: '"I might be out of date"', meaning: 'An explicit instruction telling the model when and how to flag that its training data may be stale.' },
      { term: 'Lists-and-bullets rule', gloss: '"when bullets are allowed"', meaning: 'A formatting constraint restricting bullet points to responses complex enough to need them, banning them from casual conversation.' },
      { term: 'Banned-word list', gloss: '"words the model won\'t say"', meaning: 'Specific vocabulary, filler intensifiers or meta-commentary phrases, a system prompt explicitly instructs the model to avoid.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A system prompt says "be concise." Rewrite it as an enforceable rule with a concrete limit (sentence count, word count, or structure).' },
      { level: 'medium', prompt: 'Your product needs to announce a service disruption inside the assistant\'s own replies starting today, without a frontend deploy. Draft the two or three lines you would add to the system prompt to handle it, modeled on Anthropic\'s export-control notice.' },
      { level: 'hard', prompt: 'Design the conflict-resolution rule for a product that offers three user-selectable tone presets plus free-text custom instructions. Specify which wins when they contradict, and what the user is told when that happens.' },
      { level: 'design', prompt: 'Take a generic "you are a helpful assistant, be polite" system prompt and rewrite three of its vaguest rules into specific, testable instructions (a banned phrase, a formatting constraint, a hedging rule). Show the before and after side by side.' },
    ],
    furtherReading: [
      { label: 'Anthropic - System prompts release notes', url: 'https://platform.claude.com/docs/en/release-notes/system-prompts', why: 'The primary source: Anthropic\'s actual, current system prompt text, including the July 2026 export-control notice and the banned-word list.' },
      { label: 'Anthropic - System prompts overview', url: 'https://platform.claude.com/docs/en/release-notes/system-prompts/overview', why: 'Explains why these prompts are published, versioned by model snapshot, and updated independently of the API.' },
      { label: 'Simon Willison - Highlights from the Claude 4 system prompt', url: 'https://simonwillison.net/2025/May/25/claude-4-system-prompt/', why: 'A close, annotated read of an earlier prompt version, including the leaked tool-use instructions Anthropic did not publish itself.' },
      { label: 'Notion AI', url: 'https://www.notion.so/product/ai', why: 'A second product to compare against: try the AI writer in a page and notice a differently voiced persona shaped by a differently written prompt.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'System prompt design review checklist',
      body: '- Is every tone rule specific and testable (a banned phrase, a sentence limit, a formatting rule), not a vague brand adjective?\n- Is the prompt versioned and diffable, with a changelog a designer can review before it ships?\n- Do output constraints the UI depends on (format, length, citation style) live in the prompt, not scattered in parsing code?\n- If the product offers user-selectable styles or custom instructions, is the conflict-resolution rule explicit and disclosed to the user?\n- Is user-authored content (custom instructions, shared conversation links) visually and technically separated from trusted system content?\n- Does the prompt state the model\'s knowledge cutoff and the fallback behavior for anything that might be stale?\n- Who owns this file: is it a designer\'s responsibility, or whatever an engineer wrote in a hurry before launch?',
    },
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
      'The input box is the whole product. Model picker, mode toggle, attachments, slash commands, and voice all sit in one component, and what you put there sets what users believe the product can do.',
    readTime: '~10 min read',
    diagram: '/lessons/de/de-ai-composer.png',
    diagramCaption:
      'The composer is a manifest: model picker, mode toggles, scope, slash commands, attachment chips, modality slot. The rest of the product inherits its ceiling from this one component.',
    whyItMatters:
      'Cursor\'s composer, ChatGPT\'s composer, and Claude\'s composer look superficially similar and behave completely differently, because each makes a different bet on what the user reaches for first. A bare textarea says chatbot. A composer with a visible mode dial, a model picker, and a slash-command menu says agent, even when the model underneath is identical. Get the composer wrong and the rest of the product spends its budget compensating.',
    learningObjectives: [
      'Distinguish "mode" from "model" as two independent dials in a composer, using Cursor\'s Ask/Agent/Plan/Debug modes versus its model picker as the example.',
      'Apply the rule "anything changed twice per session belongs in the composer" to decide where a new control should live.',
      'Design a slash-command vocabulary of four to six verbs for a specific AI product\'s composer.',
      'Specify the parse-state chip an attachment needs, and why a silent truncation is worse than a rejected upload.',
      'Evaluate whether a new input modality has earned a permanent composer slot or a keyboard shortcut, based on usage.',
    ],
    sections: [
      {
        heading: 'Model, mode, and scope choices live at the composer, not in settings',
        body: 'Cursor makes the clearest version of this distinction explicit: mode (Ask, Agent, Plan, Debug) controls which tools the agent may use, read-only search versus full file edits versus a research-and-plan pass, while the model picker, a separate axis entirely, controls which model reasons about the problem. You can run the same fast model, Composer 2.5, in Ask mode or in Agent mode; picking a mode never changes which model is doing the thinking.\n\nRule of thumb: any control the user changes more than once per session belongs in the composer. Anything set once belongs in settings. Conflating mode and model is the single most common composer mistake.',
      },
      {
        heading: 'Slash commands are the design system of the composer',
        body: 'Slack, Linear, Notion, and Cursor all use `/` to reveal a menu of typed actions. In an AI composer, slash commands are how you promote the actions the model can take without cluttering the surface: `/summarize`, `/cite`, `/rewrite`, `/plan`.\n\nThis is the closest thing an AI product has to a design system: a stable, discoverable vocabulary of verbs. If the composer supports free prompts only, the user has to guess the model\'s capabilities. Keep the command list small, name the verbs like a designer, not like an engineer.',
      },
      {
        heading: 'A slash command can jump straight past its own menu',
        body: 'Cursor\'s newer slash commands do not just open a picker, several execute directly: typing `/opus` or `/composer` switches the active model with no further click, and each family remembers your last specific choice, so `/composer` defaults to whichever variant you used last. `/fast` toggles a speed mode when the current model supports it.\n\nThe design lesson generalizes past coding tools: once a slash vocabulary is established and used often enough, some entries deserve to skip the confirmation step entirely. Track which commands get typed and immediately confirmed without hesitation, and promote those to direct-execute; leave ambiguous or destructive ones behind a menu.',
      },
      {
        heading: 'Attachments teach the model, not just the user',
        body: 'The composer\'s paperclip is a promise: "the file will be understood." OpenAI\'s Apps SDK, Claude Projects, and ChatGPT file uploads each take a different position on what happens to attached content, whether it stays in context, whether it gets embedded, whether it turns into a tool.\n\nWhatever the product does, the composer must make it clear. A paperclip that appears to attach but silently truncates is worse than none. Show the file\'s parse state (indexed, embedded, in-context) in a chip next to the composer, and let the user remove it inline.',
      },
      {
        heading: 'Model and mode both deserve a visible current-state readout',
        body: 'A composer that lets you switch mode and model needs to show both at all times, not just at the moment of switching. Cursor\'s CLI keeps a persistent footer summarizing the active model and its parameters, a MAX-mode indicator, a reasoning-effort label, so a user scrolling back through a long session can tell, without re-opening a picker, what was actually reasoning at any given message.\n\nWithout this, users lose track mid-session, ask a follow-up expecting the smart model, and get a fast one instead, then blame the product for getting dumber.',
      },
      {
        heading: 'Voice, dictation, and multimodal enter the composer, then earn a shortcut',
        body: 'Voice is a modality, not a page. In products where it earned real use (Claude, ChatGPT, dedicated dictation tools) it lives inside the composer as a mic button and, if it earns it, becomes a keyboard shortcut.\n\nCamera input, screenshot capture, and clipboard paste follow the same pattern. The composer is where new input modalities join the product without a redesign. Reserve one slot on the right side of the input for the modality of the moment, and treat it as a promotion track: if the affordance sticks, it earns hardware; if not, it retires cleanly.',
      },
      {
        heading: 'A composer that hides capability behind a picker feels less capable than one that does not',
        body: 'Two products can wire an identical model to an identical set of tools and still feel meaningfully different in capability, purely because of where the controls live. A composer that buries mode and model behind a settings menu, changed rarely, reads as "configure once and forget." A composer that surfaces them as one-tap toggles reads as "drive this in real time."\n\nUsers infer a product\'s ceiling from what its primary input surface makes reachable in one click, not from a capabilities page nobody reads. This is why a bare textarea with a send button gets called "just a chatbot," while a composer with visible mode, model, scope, and commands gets called "an agent," even when the underlying model is identical.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-ai-composer-inline-dials.svg',
        alt: 'Mode and model as two independent dials',
        caption: 'Switching mode changes which tools the agent may use. Switching model changes which model is reasoning. The same model can run in any mode.',
        diagramBrief:
          'Two vertical dial illustrations side by side, cream paper background, black ink, one accent color. Left dial labeled "MODE" with four positions marked Ask, Agent, Plan, Debug. Right dial labeled "MODEL" with positions marked Fast, Balanced, Frontier. A dotted horizontal line connecting one position on each dial to show they move independently, with a caption beneath: "any model, any mode, two separate choices".',
      },
      {
        src: '/lessons/de/de-ai-composer-inline-manifest.svg',
        alt: 'The composer as a manifest',
        caption: 'Model, mode, scope, commands, attachments, and a modality slot, all visible in one row before the first message is sent.',
        diagramBrief:
          'A single wide composer bar illustration, cream paper background, black ink, one accent color highlighting the send button. Left to right within the bar: a small model/mode label, a scope tag, a text input placeholder reading "Ask anything, or press / for actions", an attachment chip showing "brief.pdf indexed", a mic icon, a camera icon, and a send button. Below the bar, a callout line: "capability is visible before the first message, not discovered later."',
      },
    ],
    takeaways: [
      'The composer sets the ceiling for what users believe the product can do. Design it before the reply block.',
      'Anything the user changes twice per session belongs in the composer, not in settings.',
      'Slash commands are the AI product\'s design system. Name the verbs like a designer.',
      'Attachments and voice go through the composer first, and earn a shortcut only after they prove out.',
    ],
    terms: [
      { term: 'Composer', gloss: '"the input box"', meaning: 'The primary input component hosting the prompt, plus controls for mode, model, scope, attachments, and modality.' },
      { term: 'Slash command', gloss: '"the / menu"', meaning: 'A typed shortcut that opens a menu of named actions, or in newer implementations, executes one directly.' },
      { term: 'Mode toggle', gloss: '"what the agent can touch"', meaning: 'An in-composer switch between capability levels (read-only, full edit, plan-only) that changes available tools, not the underlying model.' },
      { term: 'Model picker', gloss: '"which brain is thinking"', meaning: 'A separate composer control selecting which specific model reasons about the request, independent of mode.' },
      { term: 'Attachment chip', gloss: '"file parse state"', meaning: 'A compact element showing whether an uploaded file is indexed, embedded, or held in-context, next to the composer.' },
      { term: 'Scope picker', gloss: '"how much context"', meaning: 'A control limiting the model\'s context to a page, project, or workspace.' },
      { term: 'Modality slot', gloss: '"voice, camera, paste"', meaning: 'A reserved composer position for a non-text input, promoted to a permanent shortcut only after proving out.' },
      { term: 'Direct-execute command', gloss: '"skips the menu"', meaning: 'A slash command that performs its action immediately on typing, rather than opening a confirmation menu first.' },
      { term: 'Persistent state readout', gloss: '"what is active right now"', meaning: 'A visible, always-on summary of the current mode and model, so the user does not lose track mid-session.' },
      { term: 'Blast radius (composer context)', gloss: '"how much this mode can change"', meaning: 'The scope of what a given mode is allowed to touch, used to decide how much confirmation friction that mode\'s actions deserve.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A user asks a follow-up question expecting the smart, slow model but gets the fast, cheap one instead. Name the composer design failure and the one-line fix.' },
      { level: 'medium', prompt: 'Design the difference between a mode toggle and a model picker for a hypothetical research assistant that has three modes (quick answer, deep research, fact-check only) and two models (fast, thorough). Specify what changes when each control is touched.' },
      { level: 'hard', prompt: 'A slash command vocabulary has grown to fifteen commands over a year and users report they can only remember four. Diagnose the likely cause and propose a restructuring, including which commands, if any, should become direct-execute.' },
      { level: 'design', prompt: 'Design the composer for a new AI note-taking product from scratch. Decide what lives in the composer versus in settings, sketch four to six slash commands, and specify the modality slot for voice input, including when, if ever, it earns a keyboard shortcut.' },
    ],
    furtherReading: [
      { label: 'Cursor - Prompting the Agent', url: 'https://cursor.com/docs/agent/prompting', why: 'Documents the @ mention system and the model picker as a control independent of the chat input itself.' },
      { label: 'Learn Cursor - Ask vs Agent vs Composer: The Mental Model', url: 'https://www.learncursor.dev/learn/cursor-basics/ask-vs-agent-vs-composer', why: 'The clearest available explanation of mode-versus-model as two independent axes, the core distinction this lesson builds on.' },
      { label: 'Cursor - CLI Changelog', url: 'https://cursor.com/docs/cli/changelog', why: 'Shows the direct-execute slash command pattern (/opus, /composer, /fast) and the persistent model-state footer in active development.' },
      { label: 'Cursor - Composer', url: 'https://cursor.com/composer', why: 'Product page for the fast model this lesson uses as the running example of model as a dial independent of mode.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Composer design checklist',
      body: '- Does anything the user changes more than once per session live in the composer, not buried in settings?\n- Are mode (what the agent can touch) and model (what reasons about it) two visibly separate controls?\n- Is the current mode and model always visible, not just at the moment of switching?\n- Does the slash command vocabulary stay small enough that a user can name most of it from memory?\n- Do the most-used, least-ambiguous commands skip their own confirmation menu?\n- Does every attachment show a parse-state chip (indexed, embedded, in-context), and can the user remove it inline?\n- Has voice, camera, or clipboard input earned a permanent composer slot based on actual usage, or is it still provisional?',
    },
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
      'A model response is not a paragraph in a bubble. It is a container with a header, a streaming body, and a footer of actions, and it has to earn every affordance it exposes.',
    readTime: '~10 min read',
    diagram: '/lessons/de/de-ai-reply-block.png',
    diagramCaption:
      'Header carries model, time, status. Body carries the stream, tool rows, and any artifact. Footer carries copy, regenerate, edit, cite, share. Every reply on every surface inherits this anatomy.',
    whyItMatters:
      'The reply block carries more state than any other component in an AI product: streaming status, model id, tool calls, cited spans, edit history, and export targets. Perplexity narrates three named phases in its header before the answer even starts. Claude, ChatGPT, and Perplexity all use the same three-part anatomy underneath, which is exactly why naming it once, instead of reinventing a toolbar per surface, is the fix.',
    learningObjectives: [
      'Name the three parts of a formalized reply block and state what each carries.',
      'Explain why regenerate and edit need different homes in the layout, with a concrete example of the confusion when they share one.',
      'Design a footer citation chip plus its expansion behavior, distinct from the inline per-claim chips in the body.',
      'Specify why a tool call belongs inside the reply block rather than in a log above it, using export or share as the forcing case.',
      'Apply the reply-block anatomy to a non-chat surface and identify what changes and what stays the same.',
    ],
    sections: [
      {
        heading: 'Every reply has a header, a body, and a footer',
        body: 'The header carries model id or persona, the timestamp, and any status pill (streaming, stopped, tools running). The body is the shape from the streaming lesson: token stream, partial JSON, or component tree. The footer carries the primary actions: copy, regenerate, edit, react, cite, share.\n\nClaude, ChatGPT, and Perplexity all follow this three-part layout, though they vary which actions live where. The value of naming the layout is consistency: a chat reply, a search answer, and an agent tool result all inherit the same structure, so users learn the actions once.',
      },
      {
        heading: 'Perplexity\'s header status is a three-phase narration, not a spinner',
        body: 'Perplexity streams its header status through three named phases over Server-Sent Events: "Searching" while it retrieves sources, "Reading" while it analyzes them, and "Writing" while it synthesizes the answer. Sources appear in the header before the answer body starts streaming, specifically to build trust before the wait, since a reader who sees several source favicons appear during "Searching" has evidence the system is doing real work, not just spinning.\n\nThis is the header carrying more than a static "streaming" pill: it is a narrated status that changes meaning over the life of one reply, and it directly reduces the anxiety a silent multi-second wait produces.',
      },
      {
        heading: 'Regenerate is not refresh, and edit is not a text field',
        body: 'Regenerate produces a new version stacked on the previous one, with a version picker in the header. Edit rewrites the prompt and re-runs, replacing the previous version rather than layering. These are different verbs and belong in different places.\n\nChatGPT and Claude split them: regenerate lives on the reply, edit lives on the user message above it. When both are in the reply footer, users regenerate when they meant to edit and lose the thread. Give the two actions different homes, and log both so the version tray is coherent.',
      },
      {
        heading: 'Citations are footer chips with a per-claim behavior',
        body: 'Citation chips live in the reply footer as a compact summary ("sources: 4"), and expand to a filtered evidence list. The chip in the footer is the summary; the inline chips in the body are the per-claim binding.\n\nTogether they give the reader two entry points into the same source set. A reply block without a footer chip forces the reader to scroll to find sources; a footer chip without inline binding forces them to guess which sentence a source backs. Perplexity averages 5 to 10 footer-visible sources, ChatGPT closer to 3 to 6.',
      },
      {
        heading: 'The footer is where products actually diverge',
        body: 'Claude, ChatGPT, and Perplexity all use a three-part reply layout, but their footers carry different action sets because their products have different jobs. Perplexity\'s footer centers a source count and a "check sources" verify action, because its product is answers-with-evidence. ChatGPT\'s footer centers regenerate, copy, and a thumbs up or down, because its product is closer to general assistance where citation is occasional.\n\nThe anatomy (header, body, footer) is the invariant. Which actions populate the footer is the product decision, and it should follow directly from what the product is actually for, not from copying whichever competitor shipped first.',
      },
      {
        heading: 'Tool calls belong inside the reply, not above it',
        body: 'When a model uses tools mid-response, the calls belong inside the reply block as collapsible steps, not as a separate log above the answer. Claude\'s tool-use rows and Cursor\'s composer steps show this: each call becomes a chip inside the reply, expandable to see the arguments and result.\n\nThis keeps the reply as one artifact the user can share, quote, or export. If the tool trace lives above the reply, exports drop it, and users who audit later cannot reconstruct what the model saw.',
      },
      {
        heading: 'One reply block, many surfaces, means one design system for AI output',
        body: 'Once header, body, and footer are formalized as a reusable component, a search answer, a chat reply, an agent\'s task summary, and a generative panel all inherit the same anatomy instead of each surface inventing its own toolbar. This is the same argument as a design system\'s component library, applied one layer up: the reply block is the atomic unit of AI output the way a button or a card is the atomic unit of a normal interface.\n\nTeams that skip this step end up with three different copy icons, two different regenerate mechanics, and citations that look different depending on which feature produced them, purely because nobody named the container once.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-ai-reply-block-inline-anatomy.svg',
        alt: 'Reply block anatomy, three parts',
        caption: 'Header carries model, time, and status. Body carries the stream and tool rows. Footer carries the actions. Every surface inherits this shape.',
        diagramBrief:
          'A single tall card diagram, cream paper background, black ink, one accent color. Three horizontal sections stacked: top "HEADER" with small icons for model badge, clock, status pill; middle "BODY" showing a paragraph with one collapsed tool-row chip and two inline citation chips; bottom "FOOTER" with a row of icon buttons labeled copy, regenerate, cite, share. A bracket on the right side spanning all three labeled "one reusable component, every surface".',
      },
      {
        src: '/lessons/de/de-ai-reply-block-inline-phases.svg',
        alt: 'Three-phase header status',
        caption: 'Searching, reading, writing: a header status that narrates real stages instead of spinning in place.',
        diagramBrief:
          'A horizontal three-step progress diagram, cream paper background, black ink, one accent color marking the active step. Step 1 "Searching" with small favicon-stack icon. Step 2 "Reading" with a document/magnifying-glass icon. Step 3 "Writing" with a pen icon, this one highlighted as active with a cursor/caret. A thin connecting line runs left to right through all three, with the completed steps shown as solid and the active step marked with a dashed outline.',
      },
    ],
    takeaways: [
      'Formalize the reply block as header, body, footer. Every surface in the product inherits it.',
      'Split regenerate and edit into two places. They are different verbs with different histories.',
      'Put a citations chip in the footer and per-claim chips in the body. Both matter, and they are not the same.',
      'Tool calls live inside the reply so the artifact stays a single quotable, exportable unit.',
    ],
    terms: [
      { term: 'Reply block', gloss: '"the response container"', meaning: 'The formalized container rendering one model response with a header, a body, and a footer.' },
      { term: 'Version picker', gloss: '"switch between drafts"', meaning: 'A header control that navigates between stacked regenerations of the same reply.' },
      { term: 'Tool row', gloss: '"a step, collapsed"', meaning: 'A collapsible element inside the reply body showing a tool call\'s name, arguments, and result.' },
      { term: 'Citation chip (footer)', gloss: '"sources: 4"', meaning: 'A compact summary count in the footer that expands into the full evidence panel.' },
      { term: 'Edit-and-rerun', gloss: '"revise the question"', meaning: 'A prompt-level revision on the user\'s message that replaces the previous reply rather than stacking a new version.' },
      { term: 'Regenerate', gloss: '"roll again"', meaning: 'A request for a new draw with the same prompt, stacked as a new version rather than replacing the old one.' },
      { term: 'Three-phase status', gloss: '"Searching, Reading, Writing"', meaning: 'A header status pattern that narrates named stages of a streaming answer instead of showing a single generic spinner.' },
      { term: 'Artifact action', gloss: '"open in the side pane"', meaning: 'A footer or header action specific to replies that produced a document or component rather than plain prose.' },
      { term: 'SSE', gloss: '"how the phases stream"', meaning: 'Server-Sent Events, the streaming transport carrying a reply\'s phased status updates from server to client.' },
      { term: 'Reply anatomy', gloss: '"the reusable shape"', meaning: 'The invariant three-part structure (header, body, footer) that every AI-generated response on a given product should share, regardless of surface.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A reply footer has a regenerate icon and an edit icon sitting next to each other with identical styling. State the specific user error this layout invites.' },
      { level: 'medium', prompt: 'Design a three-phase header status for a code-review assistant that fetches a diff, runs a linter, and writes a summary. Name each phase and specify what visual element represents each.' },
      { level: 'hard', prompt: 'Design the export behavior for a reply block containing two tool calls and three inline citations. Specify exactly what the exported artifact must preserve from the original reply, and what it is allowed to drop.' },
      { level: 'design', prompt: 'Take the reply block anatomy (header, body, footer) and apply it to a non-chat surface: an agent\'s task-completion summary in a project-management tool. Sketch what populates each of the three parts, and name one action that belongs in this footer but would not belong in a plain chat reply\'s footer.' },
    ],
    furtherReading: [
      { label: 'Blake Crosley - Perplexity: AI-Native Search Design', url: 'https://blakecrosley.com/guides/design/perplexity', why: 'Documents the Searching/Reading/Writing three-phase header status and the always-visible sources panel this lesson describes.' },
      { label: 'Claude', url: 'https://claude.ai', why: 'Live reference for tool-use rows inside a reply and artifact-specific footer actions when a reply produces a document.' },
      { label: 'ChatGPT', url: 'https://chatgpt.com', why: 'Compare its footer action set (regenerate, copy, thumbs) against Claude\'s and Perplexity\'s to see how footer contents follow product purpose.' },
      { label: 'AIUXPlayground - Perplexity Citations UX teardown', url: 'https://aiuxplayground.com/teardowns/perplexity/citations', why: 'Detailed breakdown of the footer sources-count row sitting at the same elevation as copy and share, the pattern cited in section 5.' },
    ],
    shipIt: {
      kind: 'snippet',
      name: 'Reply block anatomy spec',
      body: 'header:\n  - model id or persona\n  - timestamp\n  - status: idle | streaming | tools-running | stopped (consider a named 3-phase variant: searching, reading, writing)\n\nbody:\n  - shape: token stream | partial JSON | component tree\n  - tool rows: collapsible, name + args + result, stay inside the reply\n  - inline citation chips: bound to clause, not paragraph\n\nfooter:\n  - copy\n  - regenerate (stacks new version, lives here)\n  - cite (sources: N, expands to evidence panel)\n  - share / export (must preserve tool rows and citations)\n  - product-specific actions (open artifact, thumbs, etc)\n\nnote: edit lives on the user message above the reply, not in this footer.',
    },
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
