import type { Lesson } from '@/lib/lessons';

// Phase 13 · Part 1 · The tool interface (lessons 13.01-13.05, 13.21)
export const phase13Part1: Lesson[] = [
  {
    id: 'p13-01-tool-interface',
    phase: 'Phase 13 · Tools and Protocols',
    part: 'Part 1 · The tool interface',
    index: '13.01',
    title: 'The tool interface: four steps under every agent',
    oneLiner:
      'A model emits tokens. A program takes actions. The tool interface is the contract between them, and it is always the same four steps: describe, decide, execute, observe. Function calling, MCP, and A2A are three encodings of that one loop.',
    readTime: '~8 min read',
    diagram: 'lessons/p13-01.svg',
    diagramCaption:
      'The four-step loop: host describes tools, model decides a call, host validates and executes, result returns as context.',
    whyItMatters:
      'This loop is the state machine your component owns. Four steps means four render states, not one spinner: tools available, call proposed, call executing, result observed. Step three is where a permission gate belongs, because pure and consequential tools need different treatment (get_weather runs silently, send_email needs a confirm showing the real arguments). Step four re-invokes the model, so a single user message can produce five turns of UI. And the circuit breaker is a product decision: Claude Code stops at 20 turns, OpenAI Assistants at 10, Cursor at 25. That bound is your worst-case loading state.',
    sections: [
      {
        heading: 'The problem: a model cannot dial an API',
        body: 'An LLM emits a probability distribution over the next token. That is the entire output surface. Ask a chat model for the current weather in Bengaluru and it writes a plausible sentence, which is right by coincidence or three days stale.\n\nClosing that gap is the whole purpose of the tool interface. The host program (your runtime, Claude Desktop, Cursor, a script) advertises callable tools. The model emits a structured payload naming a tool and its arguments. The host parses it, runs the tool for real, and feeds the result back. The loop continues until the model stops asking.',
      },
      {
        heading: 'Describe, decide, execute, observe',
        body: 'Describe: the host declares each tool as three fields. A stable machine-readable name (get_weather, not "weather thing"), a one-paragraph usage brief, and a JSON Schema 2020-12 input schema.\n\nDecide: the model answers in text, calls one or more tools, or refuses. A call payload carries three stable fields: an id, a name, and an arguments object. The id exists so results correlate back when parallel calls return out of order.\n\nExecute: the host validates arguments against the schema, then runs ordinary code. Observe: the result is appended as a tool-role message with the matching id, and the model is re-invoked with it in context.',
      },
      {
        heading: 'The trust split: pure versus consequential',
        body: 'Tools come in two flavors and the difference is a gate, not a label. Pure tools are read-only and deterministic (get_weather, search_docs, get_current_time). They are safe to call speculatively, so they can run without asking.\n\nConsequential tools mutate state, spend money, or touch user data (send_email, delete_file, execute_trade). Meta\'s 2026 Rule of Two says a single turn may combine at most two of: untrusted input, sensitive data, consequential action. The tool interface is where that rule is enforced, by rejecting the call, requiring confirmation, or escalating scopes.',
      },
      {
        heading: 'Why not just ask for JSON',
        body: 'Prompting the model to reply in JSON was the pattern before function calling shipped. It fails roughly 5 to 15 percent of the time on frontier models and far more on small ones: missing braces, trailing commas, hallucinated fields, wrong types.\n\nNative function calling wins for three reasons. The provider trains the model on the exact call shape, so valid-JSON rate reaches 98 to 99 percent under strict mode. The call payload sits in its own protocol slot, so a tool call never leaks into the user-visible reply. And providers enforce compliance with constrained decoding, so the output is guaranteed to validate.',
      },
      {
        heading: 'The same loop wherever it lives',
        body: 'In single-turn function calling, the app developer describes, the LLM decides, the app developer executes. In MCP, an MCP server describes and executes while the LLM decides through a client. In A2A (v1.0, April 2026) an Agent Card publisher describes, the calling agent decides, the called agent executes. Column names change; structure does not.\n\nThe loop terminates when the model stops emitting calls or the host hits a turn cap. Unbounded loops show up every six months as an "agent spent $400 overnight" postmortem. Do not ship without a bound.',
      },
    ],
    takeaways: [
      'Four steps means four render states. Tools available, call proposed, call executing, result observed, and none of them is a generic spinner.',
      'A tool is a triple: stable name, JSON Schema input, deterministic executor. Anything missing one of the three is not a tool yet.',
      'Pure versus consequential is a gate in step three. Read-only calls run silently; mutating calls need a confirm that shows the actual arguments.',
      'The turn cap is a product decision and your worst-case loading state. Claude Code stops at 20, OpenAI Assistants at 10, Cursor at 25.',
    ],
    terms: [
      { term: 'Tool', meaning: 'A triple of stable name, JSON-Schema-typed input, and a deterministic executor function.' },
      { term: 'Tool call', meaning: 'A JSON payload with id, name, and arguments emitted by the model instead of prose.' },
      { term: 'Host', meaning: 'The program holding the tool registry, calling the model, and running the executor.' },
      { term: 'Pure tool', meaning: 'Read-only and side-effect free, so it is safe to re-run or call speculatively.' },
      { term: 'Consequential tool', meaning: 'A tool that mutates external state and therefore needs a gate, an audit trail, or confirmation.' },
      { term: 'Circuit breaker', meaning: 'A cap on tool-call iterations per user message, typically 5 to 20 turns.' },
    ],
    demoCaption:
      'Step through one user message with and without the loop. Without tools the model writes a fluent sentence from stale weights; with the loop the host validates, executes, and returns real state before the model answers.',
    demo: {
      archetype: 'sequence',
      subject: 'One message: weather in Bengaluru',
      badLabel: 'No tools',
      goodLabel: 'Four-step loop',
      badSequence: [
        'user asks for current conditions',
        'model samples the next likely tokens',
        'answer reads confident and specific',
        'no API was ever contacted',
        'value is coincidence or 3 days stale',
      ],
      goodSequence: [
        'host describes get_weather with a schema',
        'model emits call id, name, arguments',
        'host validates args, then executes',
        'result appended as tool role with the id',
        'model answers with real state in context',
      ],
      badCaption:
        'Fluency is not access. The output surface is a token distribution, so a plausible number costs the model nothing to produce and carries no connection to any live source.',
      goodCaption:
        'The id is the load-bearing part. It correlates a result back to the specific call, which is what makes parallel fan-out and out-of-order returns tractable later.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'every agent stack is the same four steps.',
        body:
          'every agent stack is the same four steps.\n\ndescribe: host declares name, brief, JSON Schema.\ndecide: model emits id, name, arguments.\nexecute: host validates, then runs real code.\nobserve: result goes back as context, model re-invoked.\n\nfunction calling, MCP, A2A. different field names, one loop. everything else in the protocol stack is an elaboration.',
      },
      {
        kind: 'X · design angle',
        hook: 'four steps is four render states, not one spinner.',
        body:
          'four steps is four render states, not one spinner.\n\ntools available. call proposed. call executing. result observed.\n\nand step three is where the permission gate lives. get_weather runs silently. send_email needs a confirm showing the real arguments, before the send.\n\none user message can produce 5 model turns. your loading state has to survive all of them.',
      },
      {
        kind: 'X · one-liner',
        hook: '"reply in JSON" fails 5 to 15 percent of the time on frontier models.',
        body:
          '"reply in JSON" fails 5 to 15 percent of the time on frontier models.\n\nnative function calling hits 98 to 99 under strict mode, because the provider trains on the call shape and masks invalid tokens at decode time.\n\nbonus: the call sits in its own protocol slot, so it never leaks into the visible reply.',
      },
    ],
    source: {
      label: 'Full lesson: 13.01 01-the-tool-interface',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/13-tools-and-protocols/01-the-tool-interface',
    },
  },
  {
    id: 'p13-02-function-calling',
    phase: 'Phase 13 · Tools and Protocols',
    part: 'Part 1 · The tool interface',
    index: '13.02',
    title: 'Function calling across three providers: same loop, different shapes',
    oneLiner:
      'OpenAI, Anthropic, and Gemini converged on the same tool-call loop and diverged on every field name in it. Arguments come back as a string on one, an object on two. Ids look different. Limits differ by 2x. The port costs days if you did not build a translator.',
    readTime: '~8 min read',
    diagram: 'lessons/p13-02.svg',
    diagramCaption:
      'One canonical tool declaration translated into the OpenAI, Anthropic, and Gemini payload shapes.',
    whyItMatters:
      'Provider shape leaks into your types unless you stop it at the edge. OpenAI hands you arguments as a stringified JSON blob, Anthropic and Gemini hand you a parsed object, so a component typed against one provider throws on another. The tool caps are a real product constraint: 128 tools on OpenAI, 64 on Anthropic and Gemini, which sets how many integrations a picker can expose in a single request. And OpenAI strict mode forbids $ref and demands every property in required, so the schema your form renders is not the schema you wanted to write.',
    sections: [
      {
        heading: 'The problem: one loop, three dialects',
        body: 'OpenAI takes tools as {type: "function", function: {name, description, parameters, strict}} and returns tool_calls with arguments as a JSON string you must parse yourself.\n\nAnthropic takes {name, description, input_schema} and returns a tool_use content block whose input is already an object. You reply with a user message carrying a tool_result block keyed by tool_use_id.\n\nGemini nests declarations under functionDeclarations and returns a functionCall part with name, args, and (from Gemini 3) a unique id. You reply with functionResponse. Same loop, different nesting, different string-versus-object conventions.',
      },
      {
        heading: 'The five things every provider needs',
        body: 'Strip the field names and every function-calling API is the same five slots. A tool list with per-tool name, description, and input schema. A tool choice control. Call emission naming tool and arguments. A call id for correlation. And a result injection mechanism that ties the output back to the call.\n\nThat is why the translator pattern works. Define one canonical Tool in your own code with name, description, input_schema, and a strict flag, then write three tiny functions that emit the three provider declarations. One canonical_call() extracts {id, name, args} from all three response shapes.',
      },
      {
        heading: 'Limits you will actually hit',
        body: 'OpenAI: 128 tools per request, schema depth 5, argument string capped at 8192 bytes. Strict mode additionally forbids unresolved $ref and overlapping oneOf, anyOf, or allOf, and requires every property to appear in required.\n\nAnthropic: 64 tools per request, schema depth effectively unbounded but practically around 10, no strict flag. The schema is a contract the model tends to honor, so validate server-side anyway.\n\nGemini: 64 functions per request, and schemas follow an OpenAPI 3.0 subset rather than JSON Schema 2020-12. One live quirk: enum on object fields is silently ignored, so validate yourself.',
      },
      {
        heading: 'tool_choice: forcing, forbidding, and the odd fourth mode',
        body: 'Three modes are universal under three names. Auto lets the model pick tool or text, and is the default. Required or Any forces at least one tool call. None forbids tools entirely.\n\nThen each provider adds one of its own. OpenAI and Anthropic can force a named tool. Anthropic separates single from multi with disable_parallel_tool_use. Gemini adds mode VALIDATED, which routes every response through a schema validator regardless of model intent.\n\nThis matters more than it looks: forcing a tool is how you make a "run this now" button deterministic instead of hoping the model chooses.',
      },
      {
        heading: 'Errors look different too',
        body: 'On non-strict OpenAI, the model returns an arguments string that does not parse, your JSON.parse throws, and you inject the error and re-call. On strict OpenAI, invalid JSON is impossible by construction but a typed refusal can appear instead of a call.\n\nOn Anthropic, input may carry unexpected fields because the schema is advisory. On Gemini, the OpenAPI subset quietly drops constraints you thought you declared.\n\nProduction teams wrap the translator in an abstraction: AbstractToolset in Pydantic AI, UniversalToolNode in LangGraph, BaseTool in LlamaIndex. The abstraction is not decoration, it is the seam that keeps a provider swap from being a rewrite.',
      },
    ],
    takeaways: [
      'Normalize at the edge. One canonical Tool plus three translators, or provider field names leak into every component downstream.',
      'OpenAI returns arguments as a string; Anthropic and Gemini return objects. Code typed against one provider throws on another.',
      'Tool caps are a picker constraint: 128 on OpenAI, 64 on Anthropic and Gemini, per request.',
      'Forcing a named tool is how a "do this now" control becomes deterministic instead of a suggestion to the model.',
    ],
    terms: [
      { term: 'Tool declaration', meaning: 'The name, description, and JSON Schema input payload the host sends per tool.' },
      { term: 'tool_choice', meaning: 'The control selecting auto, required, none, or a specific named tool.' },
      { term: 'Strict mode', meaning: 'An OpenAI flag that constrains decoding so output must match the declared schema.' },
      { term: 'tool_use block', meaning: 'Anthropic\'s call shape: an inline content block carrying id, name, and a parsed input object.' },
      { term: 'functionCall part', meaning: 'Gemini\'s call shape: a parts entry with name, args, and (from Gemini 3) a unique id.' },
      { term: 'Arguments-as-string', meaning: 'OpenAI\'s convention of returning tool arguments as JSON text rather than a parsed object.' },
    ],
    demoCaption:
      'Reveal what one canonical tool becomes on each provider. The declaration and the response both change shape, which is why a component typed against a single provider breaks on port day.',
    demo: {
      archetype: 'reveal',
      subject: 'get_weather · one tool, three wire shapes',
      opaqueLabel: 'Tool(name, description, input_schema, strict)',
      revealedLines: [
        'OpenAI: {type: function, function: {parameters}} then tool_calls[].function.arguments as STRING',
        'Anthropic: {name, description, input_schema} then content[] tool_use with input as OBJECT',
        'Gemini: {functionDeclarations: [...]} then parts[] functionCall with args OBJECT plus UUID',
        'caps: 128 tools OpenAI, 64 Anthropic, 64 Gemini',
        'strict mode: no $ref, every property in required',
      ],
      badCaption:
        'One canonical Tool reads like a portable abstraction, and that is exactly the trap. Nothing in the local type tells you which provider assumptions already leaked into the calling code.',
      goodCaption:
        'Three declaration envelopes, three response containers, two argument conventions. The translator is small; discovering you needed one after shipping is not.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'OpenAI hands you tool arguments as a string. Anthropic and Gemini hand you an object.',
        body:
          'OpenAI hands you tool arguments as a string. Anthropic and Gemini hand you an object.\n\nthat single difference breaks a port on day one.\n\nfield names too: parameters vs input_schema. tool_calls vs content[] tool_use vs parts[] functionCall. call_ vs toolu_ vs UUID.\n\nsame five slots underneath: tool list, tool choice, call, id, result injection.',
      },
      {
        kind: 'X · design angle',
        hook: 'tool caps are a UI constraint, not a footnote.',
        body:
          'tool caps are a UI constraint, not a footnote.\n\n128 tools per request on OpenAI. 64 on Anthropic. 64 on Gemini.\n\nthat is the ceiling on how many integrations your picker can have live at once. past it you need scoping, search, or per-workspace subsets, which is IA work, not plumbing.\n\nand strict mode wants every property in required, so the form you render is not the form you designed.',
      },
      {
        kind: 'X · one-liner',
        hook: 'forcing a named tool is how a button becomes deterministic.',
        body:
          'forcing a named tool is how a button becomes deterministic.\n\ntool_choice auto means the model may decide your "summarize this" control was unnecessary.\n\nforce the tool by name and the action fires every time. OpenAI and Anthropic both support it; Gemini gets there with mode ANY.',
      },
    ],
    source: {
      label: 'Full lesson: 13.02 02-function-calling-deep-dive',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/13-tools-and-protocols/02-function-calling-deep-dive',
    },
  },
  {
    id: 'p13-03-parallel-streaming',
    phase: 'Phase 13 · Tools and Protocols',
    part: 'Part 1 · The tool interface',
    index: '13.03',
    title: 'Parallel and streaming tool calls: the progress UI decision',
    oneLiner:
      'Three weather lookups run serially is three model round trips. Run them in one turn and wall clock collapses from the sum of latencies to the max. Production fan-out benchmarks show 60 to 70 percent reduction, and the price is id correlation plus a stream you cannot parse yet.',
    readTime: '~8 min read',
    diagram: 'lessons/p13-03.svg',
    diagramCaption:
      'One model turn emitting three calls, executed concurrently, results returned keyed by id in completion order.',
    whyItMatters:
      'Parallel calls change the shape of your progress component. Serial fan-out gives you a single-line status you can update in place. Parallel gives you N concurrent rows finishing out of order, each keyed by a call id, which means a list with per-row state, not a spinner with a label. Streaming adds a second decision: arguments arrive in fragments, so you can render "looking up weather in Beng..." live but you cannot parse it. The gate is the provider end-of-call signal, and shipping a brace counter as a completeness test is the classic self-inflicted bug.',
    sections: [
      {
        heading: 'The problem: serial fan-out pays for every leg',
        body: 'An agent answering "weather in Bengaluru, Tokyo, and Zurich" without parallel calls does three full round trips. Model calls get_weather, host executes and replies, model calls again, twice more, then answers. That is roughly 4x the ideal wall clock, because you pay both model latency and executor latency per leg.\n\nWith parallel calls it is one model turn emitting three calls. The host runs all three concurrently and replies with three results. Executor time becomes the max of the three, not the sum. The harness numbers make it concrete: 400, 600, and 800 ms executors run 1800 ms serially and 800 ms in parallel.',
      },
      {
        heading: 'The id is the only glue',
        body: 'Every call the model emits carries an id, and every result you return must echo it. OpenAI uses tool_call_id on each tool-role message, Anthropic uses tool_use_id on each tool_result block, Gemini uses id on each functionResponse.\n\nGemini 3 added unique ids specifically because Gemini 2 matched by name, which broke the moment two parallel calls hit the same tool. That is the failure worth remembering: two get_weather calls, indistinguishable, results swapped.\n\nReply order does not affect correctness on any of the three providers, so long as ids match. Prefer replying in completion order with explicit ids, because it makes a dropped or duplicated result visible.',
      },
      {
        heading: 'Streaming: one accumulator per id',
        body: 'When the model streams, arguments arrive in pieces and three parallel calls interleave on one wire. You need one string buffer per id.\n\nOpenAI sends delta.tool_calls[i].function.arguments partials carrying an index; you accumulate per index, read the id when it first appears, and parse at finish_reason "tool_calls". Anthropic sends content_block_start per tool_use block, then input_json_delta chunks, closed by content_block_stop. Gemini 3 ships streamFunctionCallArguments with a functionCallId per chunk so calls interleave cleanly.',
      },
      {
        heading: 'The parse-early trap',
        body: 'A partial arguments string like {"city": "Beng is not valid JSON and will throw. The correct gate is the provider end-of-call signal: OpenAI finish_reason "tool_calls", Anthropic content_block_stop, Gemini stream end.\n\nBrace counting is unreliable as a completeness test, because braces inside quoted strings and escaped content produce false positives. Treat it as a debug heuristic and nothing more. If you want live UI, use an incremental JSON parser that emits events as structure completes, which is what OpenAI recommends for a live thinking indicator.\n\nThe payoff is real: you can start executing a call as soon as its own arguments finalize, rather than waiting for every stream to close.',
      },
      {
        heading: 'When to turn parallel off',
        body: 'Disable it when tools have ordering dependencies (create_file then write_file), when one call\'s output feeds another\'s input, or when the rate limiter cannot absorb the fan-out. OpenAI defaults parallel_tool_calls to true; Anthropic defaults disable_parallel_tool_use to false from Claude 3.5 on; Gemini is parallel-capable by default.\n\nThe real-world caveat is downstream pressure. A 10-way fan-out into a rate-limited service fails, loudly and partially, which is the worst kind of failure to render. Anthropic\'s own guidance is to disable parallelism for consequential mutations on the same resource.',
      },
    ],
    takeaways: [
      'Parallel turns a status line into a list. N rows, per-row state, finishing out of order, keyed by call id.',
      'Executor time becomes max instead of sum. 400 plus 600 plus 800 ms goes from 1800 ms to 800 ms, and the gap widens with tool count.',
      'Never parse a partial arguments string. Gate on the provider end-of-call signal, not on counting braces.',
      'Turn parallel off for ordering dependencies and consequential mutations on the same resource, or a partial failure renders as a mystery.',
    ],
    terms: [
      { term: 'Parallel tool calls', meaning: 'Multiple independent tool calls emitted in a single model turn.' },
      { term: 'Tool call id', meaning: 'The per-call identifier that every returned result must echo so the model can line them up.' },
      { term: 'Accumulator', meaning: 'A per-id string buffer that collects partial argument chunks from a stream.' },
      { term: 'Parse-early trap', meaning: 'Calling JSON.parse on an incomplete arguments string, which throws instead of waiting.' },
      { term: 'Out-of-order completion', meaning: 'Parallel calls finishing in unpredictable order, correlated only by id.' },
      { term: 'Dependency graph', meaning: 'The ordering constraints between tools whose outputs feed other tools\' inputs.' },
    ],
    demoCaption:
      'Compare serial and parallel fan-out on the same three executors (400, 600, 800 ms). The number changes from a sum to a max, and the surface changes from one status line to three rows finishing out of order.',
    demo: {
      archetype: 'before-after',
      subject: 'Weather fan-out · 3 cities',
      badLabel: 'Serial',
      goodLabel: 'Parallel',
      badLines: [
        '3 model round trips, one per city',
        'executor time 400 + 600 + 800 = 1800 ms',
        'progress UI: one status line, updated in place',
        'order is deterministic, latency is additive',
      ],
      goodLines: [
        '1 model turn emitting 3 calls',
        'executor time max(400, 600, 800) = 800 ms',
        'progress UI: 3 rows keyed by call id',
        'rows settle out of order, 60 to 70 percent faster',
      ],
      badCaption:
        'Serial is easy to render and expensive to run. Each leg pays model latency plus executor latency, so the total grows linearly with the number of cities the user names.',
      goodCaption:
        'One turn, three concurrent executors, and the id becomes load bearing. The component is now a list with per-row state, because rows settle in completion order and the fast city lands before the slow one.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'parallel tool calls turn a sum into a max.',
        body:
          'parallel tool calls turn a sum into a max.\n\nthree executors at 400, 600, 800 ms.\nserial: 1800 ms plus three model round trips.\nparallel: 800 ms and one round trip.\n\nproduction fan-out benchmarks land at 60 to 70 percent wall clock reduction. the saving grows with tool count, because you are trading a sum for a max.',
      },
      {
        kind: 'X · design angle',
        hook: 'parallel calls are a progress-UI decision before they are a perf decision.',
        body:
          'parallel calls are a progress-UI decision before they are a perf decision.\n\nserial: one status line you mutate in place.\nparallel: N rows keyed by call id, settling out of order, fast one first.\n\nstreaming adds a second layer. you can show "looking up weather in Beng..." live, but you cannot parse it yet. gate execution on the end-of-call signal.',
      },
      {
        kind: 'X · one-liner',
        hook: 'Gemini 2 matched parallel tool results by name. two calls to the same tool were indistinguishable.',
        body:
          'Gemini 2 matched parallel tool results by name. two calls to the same tool were indistinguishable.\n\nGemini 3 added unique ids to fix it.\n\nthat is the whole argument for id correlation in one bug: without an id, two get_weather calls come back and you cannot tell which city you are holding.',
      },
    ],
    source: {
      label: 'Full lesson: 13.03 03-parallel-and-streaming-tool-calls',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/13-tools-and-protocols/03-parallel-and-streaming-tool-calls',
    },
  },
  {
    id: 'p13-04-structured-output',
    phase: 'Phase 13 · Tools and Protocols',
    part: 'Part 1 · The tool interface',
    index: '13.04',
    title: 'Structured output: constrained decoding beats validating after',
    oneLiner:
      'Asking nicely for JSON fails 5 to 15 percent of the time on frontier models. Constrained decoding masks invalid tokens out of the sampling distribution, so the output is guaranteed to parse and guaranteed to validate. Three failure modes collapse to one: refusal.',
    readTime: '~8 min read',
    diagram: 'lessons/p13-04.svg',
    diagramCaption:
      'Prompt-for-JSON, validate-after, and constrained decoding compared: where each one can still fail.',
    whyItMatters:
      'Strict mode changes your error taxonomy from three states to one, and that reshapes the component. Parse error and schema violation both disappear, so the retry-with-error-injected path stops being a rendered state. What remains is refusal, and refusal is not an error: it is a typed outcome that needs its own surface, with the model\'s stated reason, because a refusal shown as "something went wrong" invites a pointless retry. The schema is also the shape your extraction UI renders, field by field, so additionalProperties false is the thing that stops a hallucinated field appearing in a form you never designed.',
    sections: [
      {
        heading: 'The problem: three approaches, three risk profiles',
        body: 'An agent turning a purchase-order email into {customer, line_items, total_usd} has three options.\n\nPrompt for JSON: works 85 to 95 percent of the time on frontier models, and fails six ways. Missing brace, trailing comma, wrong type, hallucinated field, truncation at the token limit, and leaked prose like "Here is your JSON:".\n\nValidate after generation: generate freely, parse, validate, retry on failure. Reliable and expensive, because you pay for every retry and truncation costs an extra turn each time it happens.\n\nConstrained decoding: the provider enforces the schema at decode time. Invalid tokens are masked out of the sampling distribution.',
      },
      {
        heading: 'JSON Schema 2020-12 is the lingua franca',
        body: 'Every provider accepts it. The constructs that carry the weight: type, properties, required, enum for closed sets, minimum and maximum for numbers, minLength, maxLength, and pattern for strings, items for arrays, and additionalProperties false to forbid extra fields.\n\nOpenAI strict mode adds three requirements on top. Every property must appear in required. additionalProperties must be false everywhere. No unresolved $ref. Break any of them and the API returns 400 at request time, not at generation time, which is the good kind of failure.',
      },
      {
        heading: 'The bindings: Pydantic and Zod',
        body: 'Pydantic v2 generates JSON Schema from a model via model_json_schema(). Pydantic AI wraps this so you declare an Invoice class and the framework translates it into OpenAI strict mode, Anthropic input_schema, or Gemini responseSchema at the edge, returning a typed instance.\n\nZod is the TypeScript equivalent. z.object({customer: z.string(), ...}) plus zodResponseFormat(Invoice) in the OpenAI Node SDK translates to the API JSON Schema payload and validates the response at runtime. One declaration, enforced end to end, typed on both sides of the wire.',
      },
      {
        heading: 'Refusal is an outcome, not an error',
        body: 'Strict mode cannot force the model to answer. If the input cannot fit the schema, because the email was a poem and not an invoice, the model emits a refusal field carrying the reason.\n\nThat is a first-class outcome and your code has to treat it as one. It does not retry. The refusal is also a safety signal: a model asked to extract a credit card number from protected content returns a refusal with the safety reason attached.\n\nOutside strict mode the recovery pattern is generate, parse, validate, inject the error, retry, capped at three. One retry usually suffices. Needing more than three means the schema is wrong for some inputs.',
      },
      {
        heading: 'Why this decouples reliability from model size',
        body: 'Open-weight implementations use three techniques. Grammar-based decoding (outlines, guidance, lm-format-enforcer) builds a finite automaton from the schema and masks violating logits at each step. Logit masking runs a streaming JSON parser in lockstep to compute the valid next-token set. Speculative decoding lets a cheap draft model propose while a verifier enforces the schema.\n\nThe consequence is the headline. A 3B open model with grammar enforcement outperforms a 70B model with raw prompting on structured tasks. Reliability stops scaling with parameter count, which is what makes structured extraction affordable in production.',
      },
    ],
    takeaways: [
      'Strict mode collapses three failure modes into one. Parse error and schema violation become impossible; refusal remains.',
      'A refusal is a typed outcome with a reason, so it gets its own surface. Rendering it as a generic error invites a pointless retry.',
      'additionalProperties false is what stops a hallucinated field showing up in a form nobody designed.',
      'A 3B model with grammar enforcement beats a 70B model with raw prompting on structured extraction. Reliability is not a parameter-count problem.',
    ],
    terms: [
      { term: 'Constrained decoding', meaning: 'Decode-time enforcement that masks any next-token which would violate the schema.' },
      { term: 'Strict mode', meaning: 'OpenAI\'s flag guaranteeing output validates, at the cost of extra schema requirements.' },
      { term: 'Refusal', meaning: 'A typed outcome where the model declines because the input cannot fit the schema.' },
      { term: 'Schema violation', meaning: 'Output that parses as JSON but breaks types, required, enum, or range constraints.' },
      { term: 'additionalProperties false', meaning: 'The schema clause forbidding unknown fields, required throughout OpenAI strict mode.' },
      { term: 'Grammar enforcement', meaning: 'Open-weight constrained decoding built on a finite automaton derived from the schema.' },
    ],
    demoCaption:
      'Toggle between validate-after and constrained decoding on the same invoice extraction. The failure list goes from six shapes to one, and the one that remains needs a reason surfaced rather than a retry.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Invoice extraction · {customer, line_items, total_usd}',
      badLabel: 'Prompt then validate',
      goodLabel: 'Constrained decode',
      badLines: [
        '85 to 95 percent valid on frontier models',
        'fails 6 ways: brace, comma, type, extra field, truncation, prose',
        'retry loop capped at 3, paid per attempt',
        'UI needs parse-error, schema-error, and refusal states',
      ],
      goodLines: [
        'invalid tokens masked out of the distribution',
        'parse error and schema violation impossible',
        'one remaining outcome: typed refusal with a reason',
        '3B model with grammar enforcement beats 70B prompted',
      ],
      badCaption:
        'Validating after generation catches the bad output but pays for it twice, once to generate and once to retry. The error taxonomy stays wide, so three distinct states have to exist in the interface.',
      goodCaption:
        'Enforcement at decode time removes two of the three failure modes by construction. The state that survives is refusal, which carries a reason and must not be rendered as a retriable error.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'constrained decoding does not validate the output. it makes the bad output unreachable.',
        body:
          'constrained decoding does not validate the output. it makes the bad output unreachable.\n\nat every step, tokens that would break the schema get masked out of the sampling distribution. the model literally cannot emit a trailing comma.\n\nthree failure modes collapse to one. parse error: impossible. schema violation: impossible. refusal: still real.',
      },
      {
        kind: 'X · design angle',
        hook: 'a refusal is not an error, and rendering it as one costs you a retry.',
        body:
          'a refusal is not an error, and rendering it as one costs you a retry.\n\nstrict mode cannot force an answer. if the email was a poem and not an invoice, the model returns a typed refusal with a reason.\n\nthat needs its own surface: the reason, verbatim, and no retry affordance. "something went wrong" sends the user in a circle.\n\nalso: additionalProperties false is what keeps a hallucinated field out of your form.',
      },
      {
        kind: 'X · one-liner',
        hook: 'a 3B model with grammar enforcement beats a 70B model with raw prompting on structured extraction.',
        body:
          'a 3B model with grammar enforcement beats a 70B model with raw prompting on structured extraction.\n\nthat is the real reason structured output matters. it decouples reliability from parameter count, so the cheap model becomes shippable for the boring 80 percent of your pipeline.',
      },
    ],
    source: {
      label: 'Full lesson: 13.04 04-structured-output',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/13-tools-and-protocols/04-structured-output',
    },
  },
  {
    id: 'p13-05-schema-design',
    phase: 'Phase 13 · Tools and Protocols',
    part: 'Part 1 · The tool interface',
    index: '13.05',
    title: 'Tool schema design is interface design for a model',
    oneLiner:
      'A tool schema is a form the model fills in, so every rule you already know applies. Naming, affordance, constraint, error copy. Renaming and rewriting descriptions alone moved selection accuracy 10 to 20 points, and one 50-tool registry went from 62 percent to 89 percent.',
    readTime: '~8 min read',
    diagram: 'lessons/p13-05.svg',
    diagramCaption:
      'A 30-tool registry with two ambiguous descriptions, and the disambiguating "Do not use for" line that separates them.',
    whyItMatters:
      'This is the lesson where the model becomes a user and the schema becomes a form. The tool name is a label, the description is helper text and empty-state guidance, enum is a select instead of a free-text input, pattern is client-side validation, and the error message is validation copy. You already know that "retrieve financial data" is a bad label and "Invalid input" is bad validation copy. The measured swings are the same size as usability swings on a human form: 62 to 89 percent selection accuracy on one 50-tool registry, from a description rewrite alone.',
    sections: [
      {
        heading: 'The problem: two silent failures in a 30-tool registry',
        body: 'Every query triggers selection. The model reads every description and picks one. Two shapes of failure recur.\n\nWrong tool picked: the model chooses search_contacts when it should have chosen get_customer_details, because both descriptions say "look up people" and nothing in either one disambiguates.\n\nNo tool picked when one fits: the user asks for a stock price and the model answers with a plausible hallucinated number, because the description said "retrieve financial data" and the model never mapped the phrase.\n\nBoth are label problems. Neither is a model problem.',
      },
      {
        heading: 'Naming is labelling, and it is measurable',
        body: 'Composio measured 10 to 20 percentage-point accuracy swings purely from renaming tools and rewriting descriptions. Databricks reported a 50-tool registry with ambiguous descriptions selecting correctly 62 percent of the time, and 89 percent after a rewrite. That is the cheapest lever in the stack.\n\nThe rules read like naming conventions because they are. snake_case, because camelCase fragments across token boundaries on some tokenizers. Verb-noun order: get_weather, not weather_get. No tense markers. No arguments baked into the name. Namespace prefixes once the registry is large: notes_list, notes_search, notes_create beats three generic names.',
      },
      {
        heading: 'The description is helper text, and the second sentence does the work',
        body: 'The pattern that consistently lifts selection accuracy is two sentences. "Use when {condition}. Do not use for {close-but-wrong-cases}."\n\nUse when the user asks about current conditions for a specific city. Do not use for historical weather or multi-day forecasts.\n\nThe first sentence is the affordance. The second is the disambiguator against close competitors in the registry, and it is the line most teams skip. Stay under 1024 characters, because OpenAI truncates longer descriptions in strict mode. Add format hints the way you would add input hints: accepts city names in English, returns Celsius unless units says otherwise.',
      },
      {
        heading: 'Atomic over monolithic, enum over free text',
        body: 'A monolithic do_everything(action, target, options) looks DRY and forces the model to pick action from a string and options from an untyped dict, the two worst input surfaces there are. Benchmarks show 15 to 30 percent worse selection. The rule of thumb: if action has more than three values, split the tool. Atomic tools (notes_list, notes_create, notes_delete, notes_search) let the model pick by name instead of parsing a string.\n\nThe parameter rules are input-control rules. Enum every closed set, because units: "celsius" | "fahrenheit" is a select and units: string is a free-text field. Add a pattern to typed ids (^note-[0-9]{8}$) to catch hallucinated ones. Never type: any. Describe every field, because that description is part of the prompt.',
      },
      {
        heading: 'Error messages are validation copy',
        body: 'When a call fails, the error message goes back into the model\'s context. So write it for the reader, exactly as you would for a human.\n\nBad: TypeError: object of type NoneType has no attribute lower. Good: Invalid input: city is required. Example: {"city": "Bengaluru"}. Benchmarks show typed error messages cut retry counts in half on weak models, which is the same result good validation copy produces on a human form.\n\nVersioning is the other discipline: never rename a stable tool, add get_weather_v2 and deprecate. Never change an argument type. Adding optional parameters is always safe. And descriptions land in context verbatim, so a hostile server can hide instructions in one, which is why the linter screens for injection-shaped text.',
      },
    ],
    takeaways: [
      'The model is a user filling in a form. Name is the label, description is helper text, enum is a select, pattern is validation, error copy is validation copy.',
      'The "Do not use for" sentence is the disambiguator, and it is the one most registries omit. One rewrite moved a 50-tool registry from 62 to 89 percent.',
      'Split a monolithic tool once its action argument has more than three values. Selection accuracy drops 15 to 30 percent otherwise.',
      'Write errors for the model. Typed messages naming the field and showing an example halve retry counts on weak models.',
    ],
    terms: [
      { term: 'Tool-selection accuracy', meaning: 'The share of queries where the model calls the correct tool from the registry.' },
      { term: 'Atomic tool', meaning: 'A tool whose name uniquely identifies one behavior, so selection happens by name.' },
      { term: 'Monolithic tool', meaning: 'A single tool with an action string argument, which tanks selection accuracy.' },
      { term: 'Namespace prefix', meaning: 'A shared name prefix grouping related tools in a large registry, such as notes_.' },
      { term: 'Tool poisoning', meaning: 'Hidden instructions embedded in a tool description, which land in the model\'s context verbatim.' },
      { term: 'StableToolBench', meaning: 'A public benchmark measuring tool-selection accuracy on a fixed registry.' },
    ],
    demoCaption:
      'Toggle two registry entries between ambiguous and disambiguated. Same tools, same capabilities. The only change is label and helper text, and it is worth 27 points of selection accuracy on the Databricks registry.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Registry entry · people lookup',
      badLabel: 'Ambiguous',
      goodLabel: 'Disambiguated',
      badLines: [
        'search_contacts: "look up people"',
        'get_customer_details: "look up people"',
        'do_everything(action, target, options)',
        'units: string',
        'error: TypeError: NoneType has no attribute lower',
      ],
      goodLines: [
        'contacts_search: "Use when matching a name fragment. Do not use for billing records."',
        'customers_get: "Use when you have a customer id. Do not use for name search."',
        'notes_list, notes_create, notes_delete, notes_search',
        'units: enum ["celsius", "fahrenheit"]',
        'error: Invalid input: city is required. Example: {"city": "Bengaluru"}',
      ],
      badCaption:
        'Two entries with identical helper text give the model nothing to choose on, so it guesses. An action string plus an untyped options dict is the free-text version of a form that should have been four buttons.',
      goodCaption:
        'The second sentence carries the disambiguation, enum turns a text field into a select, and the error names the field and shows an example. Typed errors halve retry counts on weak models.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'a tool schema is a form the model fills in.',
        body:
          'a tool schema is a form the model fills in.\n\nname is the label. description is helper text. enum is a select instead of a text input. pattern is client-side validation. the error message is validation copy.\n\nso the rules you already use on human forms transfer directly. "retrieve financial data" is a bad label whether a person or a model reads it.',
      },
      {
        kind: 'X · design angle',
        hook: 'the second sentence of a tool description is the one that matters.',
        body:
          'the second sentence of a tool description is the one that matters.\n\n"Use when X." is the affordance.\n"Do not use for Y." is the disambiguator against the close competitor in the registry.\n\nmost teams write the first and skip the second, then wonder why the model picks search_contacts over get_customer_details when both say "look up people".\n\nDatabricks: 62 percent to 89 percent from a rewrite.',
      },
      {
        kind: 'X · one-liner',
        hook: 'if your action argument has more than three values, that is not one tool.',
        body:
          'if your action argument has more than three values, that is not one tool.\n\ndo_everything(action, target, options) looks DRY and costs 15 to 30 percent selection accuracy, because you handed the model a free-text field where four buttons belonged.\n\nsplit it. notes_list, notes_create, notes_delete, notes_search.',
      },
    ],
    source: {
      label: 'Full lesson: 13.05 05-tool-schema-design',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/13-tools-and-protocols/05-tool-schema-design',
    },
  },
  {
    id: 'p13-21-llm-routing',
    phase: 'Phase 13 · Tools and Protocols',
    part: 'Part 1 · The tool interface',
    index: '13.21',
    title: 'The routing layer: one API surface, many models',
    oneLiner:
      'Sonnet costs about 3x Haiku, so a triage step and a synthesis step should not hit the same model. A routing gateway gives you one OpenAI-shaped API plus aliases, fallback chains, semantic caching worth 30 to 60 percent, cost tracking, and guardrails.',
    readTime: '~8 min read',
    diagram: 'lessons/p13-21.svg',
    diagramCaption:
      'One OpenAI-shaped request hitting an alias, cascading down a priority fallback chain, with cost attributed per leg.',
    whyItMatters:
      'Routing is where your latency budget stops being one number. A live chat surface needs fast time to first token, a batch summarizer does not, so the same product carries two different budgets and the router is what enforces them. Failover is a visible state too: when the primary provider degrades and the chain lands on a fallback, quality and speed change under the user, and a silent swap reads as a regression. Model aliases are the ship-safety mechanism, since our_smart_model repoints server-side without touching your code. And per-key budgets are a real refusal your UI must render.',
    sections: [
      {
        heading: 'Five reasons routing exists',
        body: 'Cost: Sonnet costs roughly 3x Haiku. Haiku is enough for triage; Sonnet earns its price on synthesis. Route per request rather than per app.\n\nFailover: OpenAI has a bad hour and every request fails. You want automatic fallback to Anthropic without a redeploy.\n\nLatency: a live chat UI needs fast time to first token, a batch summarizer does not. Route by SLA.\n\nCompliance: EU users stay in EU regions. Route by region. Experimentation: A/B two models on the same workload, route by bucket.\n\nHand-coding all five per integration is the repetition a gateway removes.',
      },
      {
        heading: 'Aliases and the OpenAI-compatible shape',
        body: 'Everyone speaks OpenAI shape. The gateway exposes /v1/chat/completions, accepts the OpenAI schema, and proxies internally to Anthropic, Gemini, Cohere, Ollama, anything. The client does not care.\n\nOn top of that sit aliases. Your code says our_smart_model instead of a pinned snapshot id, and the gateway maps the alias to a concrete model. When a provider ships a new generation you change the mapping server-side and no application code moves. That is the difference between a model upgrade being a config change and being a release.',
      },
      {
        heading: 'Fallback chains, cache, guardrails',
        body: 'A chain is an ordered list: primary, then a second provider on 5xx, then a third, then refuse. Retries count against a budget so a cascade cannot explode cost.\n\nSemantic caching keys on prompt embeddings rather than exact text, so near-identical prompts share a slot. Savings on repeated agent loops run 30 to 60 percent.\n\nGuardrails at gateway level: PII redaction before the prompt leaves, policy rejection on prohibited content, output filters scrubbing completions for leaks. Portkey and Kong ship opinionated ones; LiteLLM leaves them optional. Per-key rate limits give each team its own quota so one team cannot drain the shared pool.',
      },
      {
        heading: 'Choosing between the three archetypes',
        body: 'LiteLLM is the open-source self-hosted proxy: your own keys, 100-plus providers, OpenTelemetry, and it wins when you have an SRE team and need data sovereignty.\n\nOpenRouter is the managed SaaS: 300-plus providers, credit-based billing, a dashboard, no infrastructure. It wins for rapid prototyping and single-subscription simplicity.\n\nPortkey is the production option, open-sourced in March 2026, available self-hosted or managed, with full OpenTelemetry and PII redaction built in. It wins when guardrails and compliance need to be there on day one rather than added later.',
      },
      {
        heading: 'Routing strategies and the MCP overlap',
        body: 'Five strategies cover most needs. Static priority: first in the list, fall back on error. Load balancing: round robin or weighted. Cost-aware: cheapest model meeting the latency and quality bar. Latency-aware: fastest model over the last N minutes. Task-aware: a prompt classifier sends coding one way and summarization another.\n\nCost tracking is the reporting layer underneath all of them. Every request carries provider, model, input tokens, and output tokens, multiplied by a maintained pricing sheet and aggregated per user, team, or project.\n\nOne gateway can route both LLM calls and MCP sampling requests, which is where the routing gateway and the MCP gateway sometimes merge into one service.',
      },
    ],
    takeaways: [
      'One product carries several latency budgets. Chat needs fast first token, batch does not, and the router is what enforces the split.',
      'A fallback is a visible state. When the chain drops to a second provider, quality and speed shift under the user, and a silent swap reads as a regression.',
      'Aliases make a model upgrade a config change. our_smart_model repoints server-side with no application release.',
      'Semantic caching returns 30 to 60 percent on repeated agent loops, because near-identical prompts share a cache slot by embedding.',
    ],
    terms: [
      { term: 'Routing gateway', meaning: 'A single-API layer in front of many model providers, handling retries, cost, and policy.' },
      { term: 'Model alias', meaning: 'A name in your code that the gateway maps to a concrete provider model, changeable server-side.' },
      { term: 'Fallback chain', meaning: 'An ordered list of providers attempted on failure, bounded by a retry budget.' },
      { term: 'Semantic caching', meaning: 'Caching keyed on prompt embeddings, so near-duplicate prompts share one hit.' },
      { term: 'Guardrails', meaning: 'Gateway-level input and output filters for PII redaction and policy violations.' },
      { term: 'Per-key rate limit', meaning: 'A quota scoped to one API key, typically one team, so nobody drains the shared pool.' },
    ],
    demoCaption:
      'One alias, four legs. The headline says a single average cost per request; the breakdown shows the routing decisions and the fallback leg hiding inside it, which is the leg your users felt.',
    demo: {
      archetype: 'meter',
      subject: 'our_smart_model · 1000 requests',
      headline: 'avg $0.0041 per request, p50 latency 620 ms',
      breakdown: [
        { label: 'Haiku, triage route, cache hit', value: 41 },
        { label: 'Haiku, triage route, cold', value: 28 },
        { label: 'Sonnet, synthesis route', value: 24 },
        { label: 'Gemini, fallback after 5xx', value: 7 },
      ],
      badCaption:
        'A blended average across four routes describes none of them. The synthesis route costs multiples of the triage route, and the two are averaged into a number no single user experienced.',
      goodCaption:
        'The 7 percent fallback leg is the interesting row. Those users got a different model at a different speed and quality, and nothing in the interface told them, so the shift reads as an unexplained regression.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'a routing gateway is one API surface and five decisions.',
        body:
          'a routing gateway is one API surface and five decisions.\n\ncost: Sonnet is roughly 3x Haiku, so triage and synthesis should not share a model.\nfailover: 5xx cascades down a priority chain, bounded by a retry budget.\nlatency, region, and A/B bucket handle the rest.\n\nsemantic caching on prompt embeddings returns 30 to 60 percent on repeated agent loops.',
      },
      {
        kind: 'X · design angle',
        hook: 'a fallback is a visible state, and most products ship it silent.',
        body:
          'a fallback is a visible state, and most products ship it silent.\n\nprimary provider degrades, the chain lands on a backup, and the user gets a different model at a different speed and a different quality.\n\nnothing in the UI says so, so it reads as your product getting worse.\n\nrouting also splits your latency budget: chat needs fast first token, batch does not. one number stops being enough.',
      },
      {
        kind: 'X · one-liner',
        hook: 'model aliases turn an upgrade from a release into a config change.',
        body:
          'model aliases turn an upgrade from a release into a config change.\n\nyour code says our_smart_model. the gateway maps it to a concrete snapshot. new generation ships, you repoint the alias server-side, nothing in the app moves.\n\npinned snapshot ids in application code are how you end up shipping a deploy to change a model.',
      },
    ],
    source: {
      label: 'Full lesson: 13.21 21-llm-routing-layer',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/13-tools-and-protocols/21-llm-routing-layer',
    },
  },
];
