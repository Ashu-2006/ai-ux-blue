import type { Lesson } from '@/lib/lessons';

// Phase 11 · Part 1 · Prompting and context (lessons 11.01-11.05, 11.15)
export const phase11Part1: Lesson[] = [
  {
    id: 'p11-01-prompt-engineering',
    phase: 'Phase 11 · LLM Engineering',
    part: 'Part 1 · Prompting and context',
    index: '11.01',
    title: 'Prompt engineering: instructions, not incantations',
    oneLiner:
      'A prompt is not a wish. It is a set of constraints that narrows which slice of the model\'s training data gets sampled. Vague in, median out.',
    readTime: '~8 min read',
    whyItMatters:
      'The system prompt is a string you ship, so it belongs in the same review as microcopy, and its clauses map one to one onto states your components must render. "If you are not confident, say so" is the difference between an uncertainty affordance and a bluff you have no hook to catch. The format clause decides whether you get a chat bubble or a typed object a table row can bind to. Keep it under about 500 tokens: rules compete with the task for attention, and every token is resent on every call. Test at temperature 0 so you are measuring the prompt, not the dice.',
    sections: [
      {
        heading: 'The problem: ambiguity is a branch point',
        body: 'Type "write me a marketing email" and you get something generic, bloated, unusable. The model did nothing wrong. It sampled the median of every marketing email in its training data, because that is what you asked for.\n\nEvery ambiguity in a prompt is a place where the model guesses. Length unspecified means it picks one. Audience unspecified means it picks one. Format unspecified means it picks one. Three unspecified dimensions and you are rolling dice on eight outcomes, then blaming the model when it lands wrong.',
      },
      {
        heading: 'The move: role, context, constraints, format',
        body: 'Four levers turn a vague request into a narrow one. Role biases the sampling distribution ("a senior backend engineer at a payments company" beats "a helpful assistant"). Context supplies the facts the model cannot infer. Constraints eliminate regions of output space. Format specifies the container.\n\nSpecificity has a ceiling. A role so narrow that little training text matches it ("the world\'s foremost expert on quantum gravity string topology") produces confident nonsense, because the model has nothing high-quality to sample from and generates anyway.',
      },
      {
        heading: 'Constraints do the heavy lifting',
        body: 'Three kinds earn their tokens. Negative constraints ("do not include code examples, do not exceed 200 words") work because eliminating output space is cheaper than describing what you want. Positive constraints ("always cite the source document") create structural guarantees you can test for. Conditional constraints ("if you are not confident, say so instead of guessing") handle the edge cases that otherwise ship as bugs.\n\nThat last one is a UX decision written as a rule. Whether your product hedges or bluffs under uncertainty is set right there, in one sentence of a system prompt.',
      },
      {
        heading: 'Temperature is the other knob',
        body: 'Temperature scales the logit distribution before sampling: low sharpens it, high flattens it. Roughly: 0.0 for extraction, classification, and code; 0.3 for summarization and technical writing; 0.7 for general answers; 1.0 for brainstorming. Above that is not creativity, it is noise.\n\nTop-p (nucleus sampling) restricts sampling to the smallest token set whose cumulative probability exceeds p. Use temperature or top-p, not both, because they interact unpredictably. Test prompts at temperature 0 first so you are measuring the prompt and not the dice.',
      },
      {
        heading: 'Anti-patterns that ship',
        body: 'Over-constraining: a 2,000-word system prompt spends the model\'s attention on obeying rules instead of doing the task. Under about 500 tokens is the working range for most jobs. Contradictory instructions ("be concise, also cover every edge case") make the model pick one arbitrarily, so audit prompts for internal conflict the way you audit a spec.\n\nPrompt injection is the security case: a user pastes "ignore previous instructions" and your rules lose. Delimiters, input validation, and output filtering reduce it. Nothing eliminates it, so design as if the system prompt is eventually readable.',
      },
    ],
    takeaways: [
      'Every unspecified dimension (length, audience, format, tone) is a coin flip you handed to the model. Name them.',
      'The system prompt is product behavior in English. It belongs in design review, not only in the repo.',
      'Temperature 0 for anything you need to be reproducible; test prompt changes there so you measure the prompt, not the sampling.',
      'Keep the system prompt under about 500 tokens. Rules compete with the task for the model\'s attention.',
    ],
    terms: [
      { term: 'System message', meaning: 'A high-priority message that sets identity, rules, and constraints for the whole conversation.' },
      { term: 'Role prompting', meaning: 'Naming a persona so sampling shifts toward a higher-quality slice of the training data.' },
      { term: 'Temperature', meaning: 'A scaling factor on the logit distribution; lower sharpens toward the likeliest token, higher flattens.' },
      { term: 'Top-p', meaning: 'Nucleus sampling: only consider the smallest set of tokens whose probabilities sum past p.' },
      { term: 'Assistant prefill', meaning: 'Starting the model\'s reply for it so the format is fixed and preamble is impossible. Anthropic supports this natively.' },
      { term: 'Prompt injection', meaning: 'User input that carries instructions overriding your system prompt. Mitigable, not solvable.' },
    ],
    demoCaption:
      'Flip between the same request written two ways. The vague version leaves length, audience, and format unspecified, so the model picks. Watch which parts of the output stop being a guess once each constraint is named.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Same task, two prompts',
      badLabel: 'Vague',
      goodLabel: 'Engineered',
      badLines: [
        'Write a marketing email for our new product.',
        'Length: unspecified, model picks',
        'Audience: unspecified, model picks',
        'Format: unspecified, model picks',
        'Tone: median of the training corpus',
      ],
      badCaption:
        'Three unspecified dimensions means eight plausible outputs, and you only wanted one. The model is not guessing badly, it is guessing at all, because nothing in the request removed the alternatives.',
      goodLines: [
        'Role: senior B2B SaaS copywriter',
        'Audience: engineering leads at 200+ person companies',
        'Constraints: under 120 words, no exclamation marks',
        'Format: subject line, 3 short paragraphs, one CTA',
        'If a claim needs a number you do not have, leave a bracket',
      ],
      goodCaption:
        'Each named constraint deletes a region of output space, so the remaining space is almost all acceptable. The last line is a UX decision in disguise: it decides whether the product hedges or bluffs when it lacks a fact.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: '"write me a marketing email" gets you the median marketing email. that is not a bug.',
        body:
          '"write me a marketing email" gets you the median marketing email. that is not a bug.\n\nthe model samples from everything it has read. an unconstrained request samples the middle of the distribution. role, audience, length, format each delete a region of output space.\n\nfewer valid outputs, higher odds of the one you wanted.',
      },
      {
        kind: 'X · design angle',
        hook: 'the system prompt is your product\'s default behavior, written in english, shipped without a build step.',
        body:
          'the system prompt is your product\'s default behavior, written in english, shipped without a build step.\n\ntone, refusal behavior, output shape, what it says when it does not know. all decided in a paragraph that usually nobody in design has read.\n\nif you write the microcopy, review the system prompt. same job, different altitude.',
      },
      {
        kind: 'X · one-liner',
        hook: 'every ambiguity in your prompt is a coin flip you handed to the model.',
        body:
          'every ambiguity in your prompt is a coin flip you handed to the model.\n\nlength unspecified: it picks. audience unspecified: it picks. format unspecified: it picks. three of those and you are rolling for one of eight outputs, then calling the model unreliable.',
      },
    ],
    source: {
      label: 'Full lesson: 11.01 prompt-engineering',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/11-llm-engineering/01-prompt-engineering',
    },
  },
  {
    id: 'p11-02-few-shot-cot',
    phase: 'Phase 11 · LLM Engineering',
    part: 'Part 1 · Prompting and context',
    index: '11.02',
    title: 'Few-shot, chain-of-thought, and the cost of thinking',
    oneLiner:
      'Telling a model what to do is prompting. Showing it how to think is engineering. The same model on the same task moves 13 points on grade-school math because you gave it scratch paper.',
    readTime: '~8 min read',
    whyItMatters:
      'The reasoning strategy is the latency budget for the surface, so you pick it per component, not per product. Chain-of-thought puts 50 to 200 tokens between the request and the first useful token, which is dead air unless you stream the reasoning or hold a skeleton through it. Self-consistency at N equals 5 is five calls with no partial output to show, so that surface owns a determinate progress state instead of a stream. Tree-of-thought at 39 calls is a background job with a notification, not an inline suggestion. Same model, three different components.',
    sections: [
      {
        heading: 'The problem: one forward pass is not much room',
        body: 'Ask GPT-4o a grade-school math word problem cold and it gets 78 percent right on GSM8K. Add five words, "let us think step by step", and it hits 91. Add worked examples with reasoning and it reaches 95. Same model, same temperature, same price per token.\n\nThe mechanism is not motivational. Without intermediate tokens, the model must compress every reasoning step into one forward pass. With them, each generated token becomes context for the next, so the reasoning tokens literally extend the computation available before the answer.',
      },
      {
        heading: 'Few-shot: examples are compressed instructions',
        body: 'Zero-shot gives the task. Few-shot gives examples first. On simple classification the two land within about 2 percent of each other. On multi-step arithmetic and symbolic reasoning, examples buy 10 to 25 points.\n\nSelection matters more than volume: examples semantically close to the input beat random ones by 5 to 15 percent on classification. Cover every output label, match the difficulty, and stop at 3 to 5. Below 3 there is not enough signal to extract a pattern, above 5 you are paying context tokens for diminishing returns.',
      },
      {
        heading: 'Self-consistency: sample many, vote once',
        body: 'One reasoning chain can contain one bad step and confidently reach a wrong answer. Sample N chains at temperature 0.7 and take the majority vote, and independent errors cancel. On the original PaLM experiments this moved GSM8K from 56.5 to 74.4 percent at N equals 40.\n\nThe technique shines when base accuracy sits between 60 and 85 percent. On a model already at 97 it buys a point. It costs N times the tokens and N times the latency, so N equals 5 is the practical setting and N equals 3 is the floor for a meaningful vote.',
      },
      {
        heading: 'Tree-of-thought and ReAct: when the path is a search',
        body: 'Chain-of-thought walks one path. Tree-of-thought generates several candidate next steps, scores each (the model grades its own partial solutions), and prunes. On Game of 24, standard prompting solves 7.3 percent and plain chain-of-thought actually drops to 4. Tree-of-thought hits 74, at a cost of up to 39 model calls for a branching factor of 3 at depth 3.\n\nReAct interleaves reasoning with tool calls in a thought, action, observation loop, so observations correct reasoning errors mid-run. It reaches 35.1 percent exact match on HotpotQA against 29.4 for reasoning alone, and it is the pattern under every agent framework.',
      },
      {
        heading: 'When thinking is the wrong move',
        body: 'Chain-of-thought hurts on simple factual recall and single-step classification. Asking a model to reason about the capital of France buys nothing and costs 50 to 200 tokens per call. On high-throughput, low-complexity work that is pure waste.\n\nThe bigger 2026 shift: reasoning models (the o-series, DeepSeek-R1) run chain-of-thought internally before emitting an answer. Telling them to think step by step is redundant and sometimes counterproductive, and their internal sampling already subsumes self-consistency. Know which kind of model you are calling before you add reasoning scaffolding.',
      },
    ],
    takeaways: [
      'Reasoning tokens are compute, not decoration. That is why "think step by step" moves accuracy at all.',
      '3 to 5 examples, chosen for similarity to the input, covering every label. More examples is not the lever; better ones are.',
      'Self-consistency costs N times latency and price for a majority vote. Reach for it when base accuracy is 60 to 85 percent, not when it is already 97.',
      'Reasoning models already think internally. Adding chain-of-thought prompts on top is redundant and can degrade output.',
    ],
    terms: [
      { term: 'Few-shot prompting', meaning: 'Including input-output examples in the prompt so the model matches a pattern instead of interpreting instructions.' },
      { term: 'Chain-of-thought', meaning: 'Eliciting intermediate reasoning tokens that extend the computation available before the final answer.' },
      { term: 'Self-consistency', meaning: 'Sampling N reasoning paths at temperature above zero and taking the majority answer.' },
      { term: 'Tree-of-thought', meaning: 'Searching over branching reasoning steps, scoring partial solutions and pruning weak branches.' },
      { term: 'ReAct', meaning: 'A loop of thought, action, observation that grounds reasoning in tool results mid-run.' },
      { term: 'Prompt chaining', meaning: 'Splitting a complex task into sequential calls where each output feeds the next input.' },
    ],
    demoCaption:
      'One headline accuracy number, six ways of getting there. Open the breakdown and the differences are not just points, they are calls per answer and tokens per call. That is the latency budget for whatever screen this sits behind.',
    demo: {
      archetype: 'meter',
      subject: 'GSM8K accuracy by reasoning strategy',
      headline: '"the model is 94% accurate"',
      breakdown: [
        { label: 'Zero-shot (1 call)', value: 94 },
        { label: 'Few-shot (1 call)', value: 96 },
        { label: 'Zero-shot CoT (1 call)', value: 97 },
        { label: 'Few-shot CoT (1 call)', value: 98 },
        { label: 'Self-consistency N=5 (5 calls)', value: 98.5 },
        { label: 'GPT-4o zero-shot, same task', value: 78 },
      ],
      badCaption:
        'A single accuracy figure hides which prompting strategy produced it. The same task on GPT-4o swings from 78 to 95 with no model change, so quoting one number tells you almost nothing about what your product will do.',
      goodCaption:
        'Read the number together with calls per answer and tokens per call. The last four points cost 5x the latency and 5x the bill, which makes this a per-surface decision: an inline suggestion and a compliance check should not use the same strategy.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: '"let us think step by step" is not a magic phrase. it is extra compute.',
        body:
          '"let us think step by step" is not a magic phrase. it is extra compute.\n\nwithout it the model squeezes every reasoning step into one forward pass. with it, each generated token becomes context for the next one.\n\nGPT-4o on GSM8K: 78% cold, 91% with the phrase, 95% with worked examples. same model, same price per token.',
      },
      {
        kind: 'X · design angle',
        hook: 'your reasoning strategy is your latency budget. pick it per screen.',
        body:
          'your reasoning strategy is your latency budget. pick it per screen.\n\nchain-of-thought: +50-200 tokens before the answer appears.\nself-consistency at N=5: 5x the calls, 5x the wait, ~1 extra point.\ntree-of-thought: up to 39 calls.\n\nan inline suggestion and a compliance check should not use the same one.',
      },
      {
        kind: 'X · one-liner',
        hook: 'few-shot is not "give it examples". it is give it 3-5 examples that look like the input.',
        body:
          'few-shot is not "give it examples". it is give it 3-5 examples that look like the input.\n\nsemantically similar examples beat random ones by 5-15% on classification. below 3 there is no pattern to extract. above 5 you are paying context rent for nothing.',
      },
    ],
    source: {
      label: 'Full lesson: 11.02 few-shot-cot',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/11-llm-engineering/02-few-shot-cot',
    },
  },
  {
    id: 'p11-03-structured-outputs',
    phase: 'Phase 11 · LLM Engineering',
    part: 'Part 1 · Prompting and context',
    index: '11.03',
    title: 'Structured outputs: making the model return a type',
    oneLiner:
      'Your model returns a string. Your interface needs a typed object. Closing that gap with "please respond in JSON" works 90 percent of the time, which is another way of saying it fails every tenth render.',
    readTime: '~8 min read',
    whyItMatters:
      'A schema is the prop type of the component you are about to write. Without constrained decoding you are binding a table row, a status chip, or a form field to a string that parses nine times out of ten, which means an error state on every tenth render. With it, malformed output, missing keys, and wrong types stop existing, and your error taxonomy collapses to one case: a correctly typed value that is factually wrong. That needs a confidence treatment and a review affordance, not a toast. Mark important fields required so a gap arrives as an explicit null, a state you can render, rather than an absent key.',
    sections: [
      {
        heading: 'The problem: this is a decoding problem, not a prompt problem',
        body: 'Ask for a product name, price, and availability and the model answers in a fluent sentence. Correct, and useless to an inventory system that needs keys and types.\n\nAdd "respond in JSON" and it works most of the time. The rest of the time you get markdown fences, a "here is the JSON" preamble, or a bracket closed early. The cause is mechanical: the model picks the likeliest next token from a vocabulary of 100,000-plus, and at any position most of those tokens would break the syntax. Nothing in the prompt stops it choosing one.',
      },
      {
        heading: 'The ladder: four levels of enforcement',
        body: 'Prompt-based ("respond in valid JSON") has no enforcement and lands around 90 percent. JSON mode guarantees the output parses, but not that it matches your shape: extra keys, wrong types, missing fields all still pass.\n\nSchema mode takes a JSON Schema and guarantees the exact keys, types, and constraints. In 2026 every major provider ships it natively. Constrained decoding is the mechanism underneath: at each token position the decoder masks every token that could not lead to a valid document, so an invalid output is not merely unlikely, it is unreachable.',
      },
      {
        heading: 'Schema is the contract, Pydantic is the ergonomics',
        body: 'JSON Schema is the shared language: object with a string product, a number price with a minimum of zero, a boolean in_stock, an optional array of string categories. It handles the awkward cases too, nested objects, typed arrays, enums that pin a string to an allowed set, regex patterns, and combinators for polymorphic output.\n\nIn Python nobody hand-writes it. You declare a Pydantic model and the schema is generated. Libraries like Instructor accept the model class and hand back a validated instance, retrying with the validation errors as feedback when the output misses.',
      },
      {
        heading: 'Two API surfaces, one outcome',
        body: 'OpenAI exposes it as response_format with a json_schema, enforced by constrained decoding. Anthropic routes structured output through tool use: define a tool with an input_schema and the model emits a typed call. Gemini uses response_schema with a JSON mime type. Different shapes, same guarantee.\n\nTool use is the better fit when the model must also choose which schema applies. With ten extraction shapes and an ambiguous input, you get selection and structure from one call instead of routing first and extracting second.',
      },
      {
        heading: 'What schemas cannot catch',
        body: 'Hallucinated values pass validation cleanly: the source says 348 and the model returns 299.99, correct type, wrong fact. Deep nesting past about four levels raises error rates because each level is another place to lose track. Array bounds like minItems are not enforced at the decoding level by every provider.\n\nOne practical rule: mark semantically important fields required even when the data is sometimes missing, so the model must emit an explicit null instead of quietly omitting the key. An explicit null is a state you can design for. An absent key is a silent hole.',
      },
    ],
    takeaways: [
      '"Respond in JSON" is a request. A schema with constrained decoding is a guarantee. Only one of them can back a UI component.',
      'Schema compliance and semantic correctness are different problems. Validation cannot tell you the price is wrong.',
      'Make important fields required so a missing value arrives as an explicit null, which is a designable state.',
      'Use tool use when the model must pick which schema applies, not just fill one in.',
    ],
    terms: [
      { term: 'JSON mode', meaning: 'A provider flag guaranteeing syntactically valid JSON, with no guarantee about the shape.' },
      { term: 'JSON Schema', meaning: 'A declarative language describing the keys, types, and constraints an output must satisfy.' },
      { term: 'Constrained decoding', meaning: 'Masking every token that could not lead to a valid document, so invalid output is unreachable.' },
      { term: 'Token masking', meaning: 'Setting specific token probabilities to zero during generation so the model cannot emit them.' },
      { term: 'Tool use', meaning: 'Structured output delivered as a typed function call, which also lets the model choose the schema.' },
      { term: 'Retry loop', meaning: 'Feeding validation errors back to the model so it repairs its own output, up to a set limit.' },
    ],
    demoCaption:
      'Step through the four levels of enforcement, from a polite request to token-level masking. The step where invalid output stops being unlikely and starts being impossible is the step where your components can stop defending themselves.',
    demo: {
      archetype: 'sequence',
      subject: 'Getting a typed object out of a model',
      badLabel: 'Hope and parse',
      goodLabel: 'Enforce and type',
      badSequence: [
        'Add "respond in valid JSON" to the prompt',
        'Model returns JSON wrapped in markdown fences',
        'Parser throws on the fence characters',
        'Strip fences with a regex, parse again',
        'Next call adds a "Here is the JSON:" preamble',
        'Retry loop fires, returns different data than attempt one',
      ],
      badCaption:
        'Every step here is downstream repair of a decoding problem, and each patch is specific to one failure mode you already saw. The retry that returns different values turns a parsing bug into a consistency bug.',
      goodSequence: [
        'Declare the shape as a Pydantic model or JSON Schema',
        'Pass it as response_format, or as a tool input_schema',
        'Decoder masks any token that cannot lead to valid output',
        'Response parses into a typed object on the first try',
        'Validation is free, so review the semantics instead',
        'Flag low-confidence fields for human check',
      ],
      goodCaption:
        'Constraint moves from the prompt into the decoder, so schema failures stop existing rather than getting caught. What is left is the failure worth designing for: a correctly typed value that is factually wrong, which needs a confidence treatment, not a try block.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: '"respond in JSON" works 90% of the time. that is the whole problem.',
        body:
          '"respond in JSON" works 90% of the time. that is the whole problem.\n\nit is not a prompting issue. the model picks the likeliest next token out of 100k+, and at most positions most of them break the syntax. nothing in your prompt stops it.\n\nconstrained decoding masks the invalid ones. bad JSON becomes unreachable, not unlikely.',
      },
      {
        kind: 'X · design angle',
        hook: 'schema validation changes which error states you have to design.',
        body:
          'schema validation changes which error states you have to design.\n\nbefore: malformed output, missing keys, wrong types, parse failures.\nafter: none of those. what is left is a correctly typed value that is simply wrong.\n\nthat is not an error banner. that is a confidence treatment and a review affordance.',
      },
      {
        kind: 'X · one-liner',
        hook: 'mark the field required even when the data is sometimes missing.',
        body:
          'mark the field required even when the data is sometimes missing.\n\nthen the model has to emit an explicit null instead of quietly dropping the key.\n\nan explicit null is a state you can design. an absent key is a silent hole in your table.',
      },
    ],
    source: {
      label: 'Full lesson: 11.03 structured-outputs',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/11-llm-engineering/03-structured-outputs',
    },
  },
  {
    id: 'p11-04-embeddings',
    phase: 'Phase 11 · LLM Engineering',
    part: 'Part 1 · Prompting and context',
    index: '11.04',
    title: 'Embeddings: meaning as geometry',
    oneLiner:
      'Keyword search matches spelling. Embeddings match meaning, by placing text as points in a few thousand dimensions where distance is similarity. Everything called semantic search is this one move.',
    readTime: '~8 min read',
    whyItMatters:
      'Similarity is a ranking, not a verdict, so a result list has no honest empty state: something always comes back, and the fifth hit at 0.31 renders identically to the first at 0.89 unless the score is a prop your row component reads. That score is what earns a relevance threshold, a low-confidence divider, and a "did you mean" affordance. The dials are yours to budget too: a two-stage retrieve-then-rerank adds a cross-encoder pass you must cover with a skeleton, and Matryoshka truncation from 1536 to 256 dimensions buys 6x storage for 3 to 5 percent recall.',
    sections: [
      {
        heading: 'The problem: vocabulary mismatch',
        body: 'You have 10,000 support tickets. A customer writes "my payment did not go through". Keyword search finds tickets containing those words and misses "transaction failed", "charge was declined", and "billing error", which are the same problem in different words.\n\nKeyword search treats each word as an independent symbol with no meaning. You need a representation where "declined" and "did not go through" sit close together, and where "my payment arrived on time" sits far away despite sharing the word payment.',
      },
      {
        heading: 'The mechanism: dense vectors and cosine distance',
        body: 'An embedding is a dense vector, typically 768 to 3072 floats, where every dimension carries signal. You never read the numbers. You compare them.\n\nWord2Vec (2013) proved geometry could carry meaning: the vector from man to woman ran roughly parallel to the one from king to queen. Sentence-level embeddings arrived through contrastive training (Sentence-BERT, 2019), pulling paraphrase pairs together and unrelated pairs apart. Cosine similarity, the angle between two vectors, is the default comparison for about 90 percent of use cases because it ignores magnitude and so tolerates length differences.',
      },
      {
        heading: 'Search at scale: HNSW, not brute force',
        body: 'Comparing a query against a million 1536-dimension vectors is 1.5 billion multiply-adds per query. Too slow.\n\nHNSW (Hierarchical Navigable Small World) builds a multi-layer graph: sparse long-range links up top, dense local links at the bottom. Search starts high and descends greedily, returning approximate top-k in logarithmic time rather than linear. It trades 95 to 99 percent recall for milliseconds instead of seconds at ten million vectors. Approximate is the default in every production vector store, which means your search misses a result occasionally by design.',
      },
      {
        heading: 'Chunking is the underrated decision',
        body: 'A 50-page PDF embedded whole becomes an average of everything and is similar to nothing specific. You split first. Fixed-size chunking splits every N tokens with overlap. Sentence-based never cuts a thought in half. Recursive tries section, then paragraph, then sentence, then characters, and handles mixed formats well. Semantic chunking embeds each sentence and starts a new chunk when similarity drops, expensive but most coherent.\n\nThe working default across most systems: 256 to 512 token chunks with about 50 tokens of overlap.',
      },
      {
        heading: 'The dials: retrieve then rerank, truncate, quantize',
        body: 'A bi-encoder embeds query and documents separately, so document vectors are precomputed and retrieval is fast. A cross-encoder reads query and document together and scores far more accurately, but cannot precompute anything. The production pattern is both: bi-encoder retrieves top 100, cross-encoder reranks to top 10.\n\nStorage has its own dials. Matryoshka training front-loads importance into early dimensions, so truncating 1536 to 256 cuts storage 6x for roughly 3 to 5 percent accuracy. Binary quantization keeps only the sign bit, 32x smaller, 5 to 10 percent recall cost, and rescoring the top 1000 at full precision recovers most of it.',
      },
    ],
    takeaways: [
      'Semantic search returns a ranked similarity list, not an answer set. There is no honest empty state, so the UI must expose score or relevance.',
      'Chunk size (256 to 512 tokens with overlap) decides retrieval quality more often than the choice of embedding model does.',
      'Retrieve wide with a bi-encoder, rerank narrow with a cross-encoder. That two-stage split is the standard latency and quality compromise.',
      'Matryoshka truncation and binary quantization buy 6x and 32x storage cuts for single-digit accuracy loss. Cost is a dial, not a fixed price.',
    ],
    terms: [
      { term: 'Embedding', meaning: 'A dense vector where geometric proximity encodes semantic similarity.' },
      { term: 'Cosine similarity', meaning: 'The cosine of the angle between two vectors: 1 is identical direction, 0 is unrelated.' },
      { term: 'HNSW', meaning: 'A layered graph index giving approximate nearest-neighbor search in logarithmic rather than linear time.' },
      { term: 'Bi-encoder', meaning: 'Encodes query and document independently so document vectors can be precomputed and searched fast.' },
      { term: 'Cross-encoder', meaning: 'Reads query and document jointly for a far more accurate score, with no precomputation possible.' },
      { term: 'Matryoshka embedding', meaning: 'A vector trained so its first N dimensions hold the most information, making truncation safe.' },
    ],
    demoCaption:
      'Drag the dimension count and watch storage, recall, and cost move together. This is the same dial behind a product decision about how many documents you can afford to make searchable, and how good that search is allowed to be.',
    demo: {
      archetype: 'slider-map',
      subject: 'Embedding dimensions',
      sliderLabel: 'Dimensions kept (Matryoshka truncation)',
      outputLabel: 'Storage for 10M documents, and retrieval recall',
      badLabel: 'Dimensions as a spec',
      goodLabel: 'Dimensions as a dial',
      badCaption:
        'Reading the dimension count as a fixed model property makes storage look like a bill you cannot argue with: 1536 floats times 10M documents is 61 GB, and that is that.',
      goodCaption:
        'Matryoshka training front-loads meaning into the early dimensions, so truncating 1536 to 256 cuts storage about 6x for 3 to 5 percent accuracy. Binary quantization takes 32x for 5 to 10 percent, recoverable by rescoring the top 1000. Every one of those is a product tradeoff about corpus size versus result quality.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'keyword search matches spelling. that is why "charge declined" misses "payment did not go through".',
        body:
          'keyword search matches spelling. that is why "charge declined" misses "payment did not go through".\n\nembeddings turn text into a point in ~1000 dimensions where distance is meaning. same complaint, different words, nearly the same vector.\n\nsemantic search is that one move, plus a graph index so it runs in milliseconds.',
      },
      {
        kind: 'X · design angle',
        hook: 'semantic search has no honest empty state.',
        body:
          'semantic search has no honest empty state.\n\nsomething always comes back. the 5th result at 0.31 similarity renders exactly like the 1st at 0.89, because your list component does not know the difference.\n\nyou are designing on top of a ranking with confidence. the UI has to show the confidence part.',
      },
      {
        kind: 'X · one-liner',
        hook: 'chunk size decides your search quality more often than the embedding model does.',
        body:
          'chunk size decides your search quality more often than the embedding model does.\n\nembed a 50-page PDF whole and its vector is the average of everything, close to nothing specific.\n\n256-512 tokens with ~50 overlap is the working default. teams argue about models and ship bad chunking.',
      },
    ],
    source: {
      label: 'Full lesson: 11.04 embeddings',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/11-llm-engineering/04-embeddings',
    },
  },
  {
    id: 'p11-05-context-engineering',
    phase: 'Phase 11 · LLM Engineering',
    part: 'Part 1 · Prompting and context',
    index: '11.05',
    title: 'Context engineering: the window is a budget',
    oneLiner:
      'Prompt engineering is one string. Context engineering is everything in the window: system rules, tool definitions, history, retrieved documents, examples. Deciding what goes in and where is the larger discipline.',
    readTime: '~8 min read',
    whyItMatters:
      'The window is a budget your interface spends, and the line items are features you shipped. Fifty tool definitions is 7,500 tokens taxed on every call, so "one more capability on this surface" is a measurable accuracy cost, not just IA clutter. History grows 200 tokens a turn until something summarizes it, which is why a session needs a visible compaction state rather than silently going vague. Lost-in-the-middle costs 10 to 20 points, so the assembly order is engineering. All of it argues for showing what the assistant is currently holding: a context chip row is the only honest affordance for a budget the user cannot otherwise see.',
    sections: [
      {
        heading: 'The problem: a big window is not a free window',
        body: 'Claude Opus 4.7 holds 200K tokens (1M in beta), GPT-5 400K, Gemini 3 Pro 2M. Those numbers sound infinite until you fill them. A real coding assistant: 500 tokens of system prompt, 8,000 for fifty tool definitions, 4,000 of retrieved docs, 6,000 of history, 200 for the query, 4,000 reserved for the answer.\n\nCapacity is not the constraint. Signal is. A curated 10K context routinely beats a dumped 100K one, because every irrelevant token is one more thing attention has to filter past.',
      },
      {
        heading: 'Lost-in-the-middle: position is a variable',
        body: 'The most useful empirical result in the field. Liu et al. (2023) placed one relevant document among twenty irrelevant ones and moved its position. First or last: 85 to 90 percent accuracy. Middle, position 10 of 20: 60 to 70 percent. The drop is 10 to 20 points across every current architecture.\n\nSo ordering is engineering, not tidiness. Critical instructions go first. The current query and its most relevant context go last. Treat the middle as the low-priority zone, and if something important must sit there, repeat the key point at the end.',
      },
      {
        heading: 'What competes for the space',
        body: 'System prompt: constant, repeated on every call, so every word is rent. Claude Code spends roughly 6,000 tokens on system plus tools. Tool definitions: 50 to 200 tokens each, so fifty tools is 7,500 tokens before anyone says anything.\n\nRetrieved context: quality-determining, and bad retrieval is worse than none because it fills the window with confident noise. History: linear growth, 50 turns at 200 tokens is 10,000 tokens of mostly stale material. Few-shot examples: two or three good ones beat thousands of tokens of instructions. Generation budget: reserve 2,000 to 4,000 or the model has no room to answer.',
      },
      {
        heading: 'Compression: the four moves',
        body: 'History summarization replaces ten verbatim turns with a 100-token digest of what was decided. Trigger it on a threshold, around 5,000 tokens of history.\n\nRelevance filtering scores retrieved chunks against the query and drops the weak ones. Three strong chunks beat ten mediocre ones. Tool pruning classifies query intent and includes only the matching tools, which cuts tool cost 60 to 80 percent (8,000 tokens down to 1,000). Recursive summarization handles very long documents in stages, summarizing sections then summarizing the summaries.',
      },
      {
        heading: 'Memory across three horizons',
        body: 'Short-term memory is the current conversation, living in the window, managed by truncation and summarization. Long-term memory is facts and preferences that persist across sessions, stored in a database and injected at start: "the user prefers TypeScript" costs 5 tokens and saves hundreds of repeated instructions. Episodic memory is specific past interactions retrieved by embedding similarity when the current conversation resembles an old one.\n\nThe pattern that separates good products from great ones is dynamic assembly: classify the intent, then select tools, documents, history, and examples per query rather than shipping one static block. The model is the same. The context is the differentiator.',
      },
    ],
    takeaways: [
      'Position changes accuracy by 10 to 20 points. Put critical instructions first, the live query last, and treat the middle as low-priority.',
      'Every capability you add taxes every call. Fifty tool definitions is 7,500 tokens before the user has typed anything.',
      'Bad retrieval is worse than no retrieval. Three relevant chunks beat ten mediocre ones, so filter before you inject.',
      'Reserve 2,000 to 4,000 tokens for the answer. A window filled to capacity leaves the model no room to respond.',
    ],
    terms: [
      { term: 'Context engineering', meaning: 'Deciding what enters the context window, in what order, and at what priority.' },
      { term: 'Lost-in-the-middle', meaning: 'The measured drop in retrieval accuracy for information placed in the middle of a long context.' },
      { term: 'Token budget', meaning: 'An explicit per-component allocation of the window across system, tools, history, retrieval, and generation.' },
      { term: 'Tool pruning', meaning: 'Including only the tool definitions that match the classified query intent.' },
      { term: 'History summarization', meaning: 'Replacing verbatim old turns with a short digest of what was decided.' },
      { term: 'Episodic memory', meaning: 'Past interactions stored as embeddings and retrieved when the current query resembles them.' },
    ],
    demoCaption:
      'A 200K window sounds like room to spare. Open the allocation and see what a normal coding assistant is already spending before the user types, and which line item you are quietly adding to every call when you ship one more tool.',
    demo: {
      archetype: 'reveal',
      subject: 'What is actually in the window',
      opaqueLabel: '200K context window, 22.7K used, 89% free',
      revealedLines: [
        'System prompt: 500 tokens, resent on every single call',
        'Tool definitions, 50 tools: 8,000 tokens, largest line item',
        'Retrieved documentation: 4,000 tokens, quality unverified',
        'Conversation history, 10 turns: 6,000 tokens, mostly stale',
        'Current user query: 200 tokens, the only new thing',
        'Generation headroom: 4,000 tokens, reserved or no answer fits',
      ],
      badCaption:
        '"89 percent free" reads like abundance and hides where the tokens went. Attention does not scale linearly with length, so the free space is not the number that predicts answer quality.',
      goodCaption:
        'Tool definitions dominate, which means every capability added to the product taxes every call whether or not it is relevant. Intent-based tool pruning cuts that line 60 to 80 percent, and position matters as much as size: mid-context facts lose 10 to 20 points of retrieval accuracy.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'a 200K context window is not 200K tokens of room. it is 200K tokens of competition.',
        body:
          'a 200K context window is not 200K tokens of room. it is 200K tokens of competition.\n\nreal coding assistant before the user types: 500 system, 8,000 for 50 tool definitions, 4,000 retrieved docs, 6,000 history, 4,000 reserved for the answer.\n\na curated 10K context beats a dumped 100K one. signal is the constraint, not capacity.',
      },
      {
        kind: 'X · design angle',
        hook: 'every feature you add to an AI product taxes every request, including the ones that do not use it.',
        body:
          'every feature you add to an AI product taxes every request, including the ones that do not use it.\n\n50 tools at 50-200 tokens each = 7,500 tokens of definitions, resent every call, competing with the actual question.\n\nscope creep in AI products is not just complexity. it is measurable accuracy loss.',
      },
      {
        kind: 'X · one-liner',
        hook: 'models read the beginning and the end. the middle is where facts go to be ignored.',
        body:
          'models read the beginning and the end. the middle is where facts go to be ignored.\n\nsame document, same model: 85-90% accuracy at position 1 or 20. 60-70% at position 10.\n\ncritical instructions first. live query last. if something important must sit in the middle, repeat it at the end.',
      },
    ],
    source: {
      label: 'Full lesson: 11.05 context-engineering',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/11-llm-engineering/05-context-engineering',
    },
  },
  {
    id: 'p11-15-prompt-caching',
    phase: 'Phase 11 · LLM Engineering',
    part: 'Part 1 · Prompting and context',
    index: '11.15',
    title: 'Prompt caching: pay once for the part that never changes',
    oneLiner:
      'Your system prompt and retrieved context go out with every request, and you pay full price for them every time. Caching the prefix cuts input cost 50 to 90 percent and first-token latency 40 to 85 percent, if the prefix is byte-identical.',
    readTime: '~8 min read',
    diagram: '/lessons/p11-15.svg',
    diagramCaption:
      'Write once, read cheap: the provider keeps the matching prefix warm as a KV-cache, so repeat requests skip re-encoding and pay a fraction of the input rate.',
    whyItMatters:
      'Caching matches prefixes only, so the block order in your prompt assembly is a layout decision with a latency number attached: stable blocks above the breakpoint, volatile ones below, and time to first token drops 40 to 85 percent on every repeat turn. The user reads that as the product speeding up as the conversation grows, which is the opposite of the default. It fails silently, though. A live timestamp at line one, or tools serialized in a reshuffled dict order, costs you the whole cache with nothing thrown. Split cached from uncached input tokens on the dashboard or the regression is invisible.',
    sections: [
      {
        heading: 'The problem: you resend the same tokens all day',
        body: 'A coding agent sends the same 15,000-token system prompt on every turn. Twenty turns at 3 dollars per million input tokens is 90 cents of input cost before the user has contributed anything. Ten thousand conversations a day and that is 9,000 dollars a day for text that never changes.\n\nYou cannot shrink the prompt without hurting quality, and you cannot skip sending it, because the model needs it each turn. The only remaining move is to stop paying full price for a prefix the provider has already encoded.',
      },
      {
        heading: 'The mechanism: a warm KV-cache on their side',
        body: 'When a request prefix matches a recent one, the provider serves the stored KV-cache instead of re-encoding those tokens. You pay a small write premium the first time and a large read discount every time after.\n\nAnthropic shipped explicit cache_control markers in August 2024, with a 1-hour extended TTL variant in 2025. OpenAI automated prefix detection later that year. Google shipped an explicit named CachedContent object alongside Gemini 1.5. Three API styles, one underlying trick: skip the prefill work you already did.',
      },
      {
        heading: 'Three flavors, three price shapes',
        body: 'Anthropic: explicit markers on content blocks, 90 percent off reads, 25 percent write surcharge, 5-minute default TTL extendable to an hour, minimum 1,024 cacheable tokens (2,048 on Haiku).\n\nOpenAI: nothing to configure, automatic matching on prefixes over 1,024 tokens, 50 percent off, no write premium, best-effort TTL up to an hour. Google: a named cache object billed for storage per token-hour, reads at roughly 25 percent of normal rate, minimum 4,096 tokens on Flash and 32,768 on Pro. Gemini is the right shape when one giant corpus gets reused across days.',
      },
      {
        heading: 'The invariant: prefix only',
        body: 'All three cache prefixes and nothing else. If one token differs, everything after the first differing token misses. That turns prompt assembly into document layout: stable content at the top, variable content at the bottom.\n\nSo the order is system prompt, then tool definitions, then few-shot examples, then static retrieved corpus, then the cache breakpoint, then conversation history, then the current user message. Put the user message above the system prompt, or interleave fresh retrievals between the few-shots, and the cache never hits at all.',
      },
      {
        heading: 'Break-even, and the pitfalls that still ship',
        body: 'Anthropic\'s 25 percent write premium means a block must be read at least twice to net save. One write plus one read averages 0.675x per request (32 percent saved). One write plus ten reads averages 0.205x (80 percent saved). Rule of thumb: cache anything you expect to reuse three or more times inside the TTL.\n\nThe recurring failures are small and silent. A live timestamp at the top of the system prompt misses every request. Tools serialized in a dict order that reshuffles between deploys breaks every hit. "You are helpful." versus "You are a helpful assistant." is a full miss for one byte. Blocks under the floor silently do not cache. And a cost dashboard that does not split cached from uncached input tokens cannot tell a cache win from a traffic drop.',
      },
    ],
    takeaways: [
      'Caching matches prefixes only. Prompt order stops being a style choice and becomes a cost and latency decision.',
      'Stable content on top, variable content at the bottom, breakpoint between. A timestamp in the system prompt misses every single request.',
      'Break-even on Anthropic is two reads. Cache anything reused three or more times inside the TTL.',
      'Split cached from uncached input tokens on the dashboard, and alert if the read fraction drops below about 80 percent after warmup.',
    ],
    terms: [
      { term: 'Prompt caching', meaning: 'Reusing a provider-side KV-cache for a matching prefix, billed at a fraction of the input rate.' },
      { term: 'cache_control', meaning: 'Anthropic\'s content-block marker declaring that everything up to this point is cacheable.' },
      { term: 'Cache write', meaning: 'The first request that populates the cache, billed at roughly 1.25x input rate on Anthropic.' },
      { term: 'Cache read', meaning: 'A later request matching the prefix, billed at 10 percent (Anthropic), 50 percent (OpenAI), or about 25 percent (Gemini).' },
      { term: 'TTL', meaning: 'How long the cached prefix stays warm: 5 minutes by default on Anthropic, extendable to an hour.' },
      { term: 'Prefix match', meaning: 'The rule that a hit requires every token from the start to the breakpoint to be byte-identical.' },
    ],
    demoCaption:
      'Two prompt layouts holding identical content in different order. One reuses a warm prefix on every turn, the other pays full rate forever, and the only difference is which blocks sit above the breakpoint.',
    demo: {
      archetype: 'before-after',
      subject: 'Prompt layout',
      badLabel: 'Cache-hostile',
      goodLabel: 'Cache-friendly',
      badLines: [
        'Current time: 2026-04-22 15:30:02',
        'User message (new every turn)',
        'Tools, serialized in dict order',
        'Retrieved chunks for this query',
        'System prompt, 15,000 tokens',
        'Result: full input rate, every request',
      ],
      badCaption:
        'The timestamp at line one differs on every call, so the match breaks before it starts and everything below is re-encoded. Nothing errors, nothing looks broken, and the bill just never goes down.',
      goodLines: [
        'System prompt, 15,000 tokens (stable)',
        'Tool definitions, stable serialization order',
        'Few-shot examples (stable)',
        'Static retrieved corpus (stable)',
        'Cache breakpoint',
        'History, then current message, then timestamp',
      ],
      goodCaption:
        'Stable blocks above the breakpoint, everything volatile below it, so each turn reads a warm prefix instead of re-encoding 15,000 tokens. That is 90 percent off input on Anthropic reads and a first-token drop the user reads as the product getting faster as the conversation grows.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'a coding agent resends the same 15,000-token system prompt every turn. you pay for it every turn.',
        body:
          'a coding agent resends the same 15,000-token system prompt every turn. you pay for it every turn.\n\n20 turns at $3/M input = $0.90 before the user says anything useful. 10k conversations a day = $9k/day for text that never changes.\n\nprompt caching keeps that prefix warm provider-side. anthropic reads at 10% of rate.',
      },
      {
        kind: 'X · design angle',
        hook: 'prompt caching is a layout problem wearing a cost problem\'s clothes.',
        body:
          'prompt caching is a layout problem wearing a cost problem\'s clothes.\n\ncaches match prefixes only. one differing token and everything after it misses.\n\nso: stable stuff on top (system, tools, examples), breakpoint, volatile stuff below (history, query, timestamp). get the order right and TTFT drops 40-85% on every repeat turn.',
      },
      {
        kind: 'X · one-liner',
        hook: '"current time: 15:30:02" at the top of your system prompt costs you the entire cache.',
        body:
          '"current time: 15:30:02" at the top of your system prompt costs you the entire cache.\n\none byte differs, every token after it misses, you pay full rate forever. nothing errors. nothing alerts.\n\nsplit cached vs uncached input tokens on your dashboard or you will never see it.',
      },
    ],
    source: {
      label: 'Full lesson: 11.15 prompt-caching',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/11-llm-engineering/15-prompt-caching',
    },
  },
];
