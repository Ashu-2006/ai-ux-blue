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
      'A model emits tokens; a program takes actions. The tool interface is the contract between them: describe, decide, execute, observe. Function calling, MCP, and A2A are three encodings of that same loop.',
    readTime: '~10 min read',
    diagram: '/lessons/p13-01.svg',
    diagramCaption:
      'The four-step loop: host describes tools, model decides a call, host validates and executes, result returns as context.',
    whyItMatters:
      'This loop is the state machine your component owns. Four steps mean four render states, not one spinner: tools available, call proposed, call executing, result observed. Step three is where the permission gate lives, because get_weather runs silently while send_email needs a confirm showing the real arguments. Step four re-invokes the model, so one user message can produce five turns of UI. The turn cap is a product decision too: Claude Code stops at 20, OpenAI Assistants at 10, Cursor at 25, and that number is your worst-case loading state.',
    learningObjectives: [
      'Name the four steps of the tool-call loop (describe, decide, execute, observe) and who owns each one.',
      'Explain why a model that only emits tokens cannot call an API without a host program in the loop.',
      'Distinguish a pure tool from a consequential tool and say which one needs a confirmation gate.',
      'Compare how function calling, MCP, and A2A assign the describe, decide, and execute roles to different actors.',
      'State why prompting for JSON fails 5 to 15 percent of the time and native function calling does not.',
      'Set a turn-cap number for a new agent and justify it in one sentence.',
    ],
    sections: [
      {
        heading: 'The problem: a model cannot dial an API',
        body: 'An LLM emits a probability distribution over the next token. That is the entire output surface. Ask a chat model for the current weather in Bengaluru and it writes a plausible sentence, which is right by coincidence or three days stale.\n\nClosing that gap is the whole purpose of the tool interface. The host program (your runtime, Claude Desktop, Cursor, a script) advertises callable tools. The model emits a structured payload naming a tool and its arguments. The host parses it, runs the tool for real, and feeds the result back. The loop repeats until the model stops asking.\n\nThe contract shipped in stages: OpenAI\'s functions parameter in June 2023, Anthropic\'s tool_use blocks in Claude 2.1, Gemini\'s functionDeclarations a few months later. MCP generalized it in November 2024. A2A layered agent-to-agent delegation on top in April 2026 at v1.0. Four steps, one invariant, five years of naming it differently.',
      },
      {
        heading: 'Describe and decide: what the model sees and sends',
        body: 'Describe: the host declares each tool as three fields. A stable machine-readable name (get_weather, not "weather thing"), a one-paragraph usage brief, and a JSON Schema 2020-12 input schema. Modern providers fold this list into the request; you never hand-write the system-prompt template yourself.\n\nDecide: given the user message and the tool list, the model answers in text, calls one or more tools, or refuses. A call payload carries three stable fields: an id, a name, and an arguments object. The id exists so results correlate back to the right call when parallel calls return out of order, which is the subject of lesson 13.03.\n\nNothing about decide is guaranteed correct. A weak model calls the wrong tool or fills a field with a hallucinated value, which is why step three exists as a checkpoint, not a rubber stamp.',
      },
      {
        heading: 'Execute and observe: real code, then a second turn',
        body: 'Execute: the host validates arguments against the schema, then runs ordinary code. Python, TypeScript, a shell command, a database query. Invalid arguments mean the model hallucinated a field or used the wrong type, a common failure on weak models, and production hosts either fail fast, repair the JSON, or retry with the validation error injected into the prompt.\n\nObserve: the result is appended as a tool-role message carrying the matching id, and the model is re-invoked with it in context. The model now answers, or asks for more calls.\n\nThis is the step most UIs get wrong. A single user message can trigger five separate model turns before a final answer appears, and each one is a state your loading indicator has to survive, not paper over with one spinner.',
      },
      {
        heading: 'The trust split: pure versus consequential',
        body: 'Tools come in two flavors, and the difference is a gate, not a label. Pure tools are read-only and deterministic (get_weather, search_docs, get_current_time). They are safe to call speculatively, so a host can run them without asking.\n\nConsequential tools mutate state, spend money, or touch user data (send_email, delete_file, execute_trade). Meta\'s 2026 Rule of Two says a single turn may combine at most two of: untrusted input, sensitive data, consequential action. The tool interface is where that rule gets enforced, whether by rejecting the call, requiring confirmation, or escalating scopes.\n\nThe classification belongs in the tool registry, not in the UI layer, because a component that has to guess whether a call is safe will guess wrong under load.',
      },
      {
        heading: 'Why not just ask for JSON',
        body: 'Prompting the model to reply in JSON was the pattern before function calling shipped. It fails roughly 5 to 15 percent of the time on frontier models and far more on small ones: missing braces, trailing commas, hallucinated fields, wrong types, or a stray "Here is your JSON:" leaking into the reply.\n\nNative function calling wins for three reasons. The provider trains the model on the exact call shape, so valid-JSON rate reaches 98 to 99 percent under strict mode. The call payload sits in its own protocol slot, so a tool call never mixes into the user-visible text. And providers enforce compliance with constrained decoding, masking any token that would break the schema, so the output is guaranteed to validate rather than merely likely to.',
      },
      {
        heading: 'Same loop, four hosts',
        body: 'Strip the field names and the loop is identical everywhere; only who plays each role changes.\n\n| Context | Describes | Decides | Executes |\n|---|---|---|---|\n| Function calling (OpenAI, Anthropic, Gemini) | App developer | The model | App developer |\n| MCP | MCP server | The model, via an MCP client | MCP server |\n| A2A (v1.0, April 2026) | Agent Card publisher | Calling agent | Called agent |\n| Browser agent (WebMCP) | Browser extension | The model | Browser runtime |\n\nEverywhere, the same four steps. The column names change; the structure does not. Knowing which actor owns which column tells you where to put your permission gate before you build a single component.',
      },
      {
        heading: 'Circuit breakers: the bound is a product decision',
        body: 'The loop terminates when the model stops emitting calls or the host hits a turn cap. Production hosts set this between 5 and 20 turns: Claude Code defaults to 20, OpenAI Assistants to 10, Cursor\'s agent mode to 25.\n\nUnbounded loops show up every six months as an "agent spent $400 overnight" postmortem, because nothing stopped a model convinced it needed one more call. The cap is not a safety afterthought, it is the worst-case number your loading state has to survive: if the cap is 20, your progress UI needs to stay legible at turn 20, not just turn 2.\n\nPick the number before you build the component, because raising it later is a UX change disguised as a config change.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p13-01-inline-loop.svg',
        alt: 'The four-step tool-call loop',
        caption: 'Describe, decide, execute, observe: the same four steps recur in every 2026 agent stack.',
        diagramBrief:
          'Cream paper background, monochrome ink, one accent color. Draw a circular four-step loop with labeled arrows: DESCRIBE (host to model) then DECIDE (model emits call: id, name, arguments) then EXECUTE (host validates and runs code) then OBSERVE (result returns as tool-role message) back to DESCRIBE for the next turn. Two lane labels on the left: "Host" boxes for describe and execute, "Model" box for decide, "Both" for observe. Small annotation near EXECUTE: "permission gate lives here."',
      },
      {
        src: '/lessons/p13-01-inline-hosts.svg',
        alt: 'Same loop, four hosts',
        caption:
          'Function calling, MCP, A2A, and browser agents assign describe, decide, and execute to different actors, never a different structure.',
        diagramBrief:
          'Cream paper, monochrome ink, one accent. Render the four-context comparison table as a diagram: four columns (Function calling, MCP, A2A, Browser agent), three rows (Describes, Decides, Executes), with the loop arrow motif reused faintly behind the table to tie it back to the hero diagram.',
      },
    ],
    takeaways: [
      'Four steps means four render states. Tools available, call proposed, call executing, result observed, and none of them is a generic spinner.',
      'A tool is a triple: stable name, JSON Schema input, deterministic executor. Anything missing one of the three is not a tool yet.',
      'Pure versus consequential is a gate in step three. Read-only calls run silently; mutating calls need a confirm that shows the actual arguments.',
      'The turn cap is a product decision and your worst-case loading state. Claude Code stops at 20, OpenAI Assistants at 10, Cursor at 25.',
    ],
    terms: [
      { term: 'Tool', gloss: '"A thing the model can call"', meaning: 'A triple of a stable name, a JSON-Schema-typed input, and a deterministic executor function.' },
      { term: 'Function calling', gloss: '"Native tool use"', meaning: 'Provider-level API support for emitting structured tool calls instead of prose.' },
      { term: 'Tool call', gloss: '"The model\'s request to act"', meaning: 'A JSON payload with id, name, and arguments, emitted by the model in place of text.' },
      { term: 'Tool result', gloss: '"What the tool returned"', meaning: 'The executor\'s output, wrapped in a tool-role message carrying the matching id.' },
      { term: 'Parallel tool calls', gloss: '"Many calls at once"', meaning: 'Multiple independent call objects emitted in a single model turn.' },
      { term: 'Strict mode', gloss: '"Guaranteed JSON"', meaning: 'Constrained decoding that forces the model\'s output to validate against the declared schema.' },
      { term: 'Pure tool', gloss: '"Read-only tool"', meaning: 'A tool with no side effects, safe to call speculatively or re-run.' },
      { term: 'Consequential tool', gloss: '"Action tool"', meaning: 'A tool that mutates external state and therefore needs a gate, an audit trail, or confirmation.' },
      { term: 'Host', gloss: '"Agent runtime"', meaning: 'The program holding the tool registry, calling the model, and running the executor.' },
      { term: 'Circuit breaker', gloss: '"A safety limit"', meaning: 'A cap on tool-call iterations per user message, typically 5 to 20 turns.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Write the three-field description for a new tool get_stock_price(ticker): name, one-paragraph usage brief, and one JSON Schema property. State which of the four steps consumes each field.' },
      { level: 'medium', prompt: 'A host receives a call whose arguments object is missing a required field. Decide: reject before execution, or attempt repair with a constrained parser. Justify your choice in two sentences, citing which step owns the decision.' },
      { level: 'medium', prompt: 'Classify get_weather, send_email, and delete_file as pure or consequential, then say which one needs a confirm dialog showing the real arguments before step three runs.' },
      { level: 'design', prompt: 'Sketch the four render states (tools available, call proposed, call executing, result observed) for a chat composer calling send_email. Specify what step three\'s confirm dialog shows and what happens if the user cancels mid-loop.' },
      { level: 'hard', prompt: 'Claude Code caps tool loops at 20 turns, OpenAI Assistants at 10, Cursor at 25. Pick a number for a new coding agent and write the one-sentence product justification you would give an engineer who asks why.' },
    ],
    furtherReading: [
      { label: 'OpenAI, Function calling guide', url: 'https://platform.openai.com/docs/guides/function-calling', why: 'The canonical reference for OpenAI-style tool declarations and call shapes.' },
      { label: 'Anthropic, Tool use overview', url: 'https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview', why: 'Claude\'s tool_use and tool_result block format, explained end to end.' },
      { label: 'Google, Gemini function calling', url: 'https://ai.google.dev/gemini-api/docs/function-calling', why: 'functionDeclarations and parallel-call semantics in Gemini.' },
      { label: 'Model Context Protocol, Specification 2026-07-28', url: 'https://modelcontextprotocol.io/specification/2026-07-28', why: 'The current provider-agnostic generalization of the tool interface.' },
      { label: 'JSON Schema, 2020-12 release notes', url: 'https://json-schema.org/draft/2020-12/release-notes', why: 'The schema dialect every modern tool API speaks.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Tool definition loop-fitness checklist',
      body: '- Is the name stable and machine-readable, not a description in disguise?\n- Does the description state when to use it, in one sentence a model or a person could act on?\n- Is the input schema JSON Schema 2020-12, with required fields and no untyped any?\n- Is the tool classified pure or consequential, and does that classification live in the registry, not the UI?\n- Does a consequential tool have a confirmation step that shows the real arguments before it runs?\n- Is there a turn cap on the loop this tool lives inside, and do you know what it is?',
    },
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
        'The id is the essential part. It correlates a result back to the specific call, which is what makes parallel fan-out and out-of-order returns tractable later.',
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
      'OpenAI, Anthropic, and Gemini converged on one tool-call loop and diverged on every field name in it. Arguments come back as a string on one, an object on two others. A port costs days if you never built a translator.',
    readTime: '~10 min read',
    diagram: '/lessons/p13-02.svg',
    diagramCaption:
      'One canonical tool declaration translated into the OpenAI, Anthropic, and Gemini payload shapes.',
    whyItMatters:
      'Provider shape leaks into your types unless you stop it at the edge. OpenAI hands you arguments as a stringified JSON blob, Anthropic and Gemini hand you a parsed object, so a component typed against one provider throws on another. The tool caps are a real product constraint: 128 tools on OpenAI, 64 on Anthropic and Gemini, which sets how many integrations a picker can expose in a single request. And OpenAI strict mode forbids $ref and demands every property in required, so the schema your form renders is not the schema you wanted to write.',
    learningObjectives: [
      'State the three shape differences between OpenAI, Anthropic, and Gemini tool-call payloads: declaration, call, and result.',
      'Translate one canonical tool declaration into all three provider formats and predict where strict-mode rules diverge.',
      'Use tool_choice to force, forbid, or auto-pick a tool call on each of the three providers.',
      'Name the per-provider hard limits on tool count and schema depth, and the error each one emits when a limit breaks.',
      'Explain why OpenAI returns arguments as a string while Anthropic and Gemini return a parsed object.',
      'Decide when a translator abstraction earns its cost versus calling one provider directly.',
    ],
    sections: [
      {
        heading: 'The problem: one loop, three dialects',
        body: 'OpenAI takes tools as {type: "function", function: {name, description, parameters, strict}} and returns tool_calls with arguments as a JSON string you must parse yourself. The shape shipped as the functions parameter in June 2023 and was renamed tools later that year.\n\nAnthropic takes {name, description, input_schema} and returns a tool_use content block whose input is already a parsed object. You reply with a user message carrying a tool_result block keyed by tool_use_id. The shape arrived with Claude 2.1.\n\nGemini nests declarations under functionDeclarations and returns a functionCall part with name, args, and, from Gemini 3, a unique id. You reply with functionResponse. All three converged on one loop by late 2024 and diverged on every field name inside it, which is why porting a weather agent from OpenAI to Anthropic costs a team roughly two extra days, plumbing only, and one more day for Gemini.',
      },
      {
        heading: 'The five things every provider needs',
        body: 'Strip the field names and every function-calling API answers the same five questions. A tool list with per-tool name, description, and input schema. A tool-choice control. Call emission naming a tool and its arguments. A call id for correlation. And a result-injection mechanism tying the output back to the call.\n\nThat is why the translator pattern works. Define one canonical Tool in your own code, with name, description, input_schema, and a strict flag, then write three small functions that emit the three provider declarations. One canonical_call() function extracts {id, name, args} from all three response shapes, so the rest of your code never touches a provider-specific field name again.',
      },
      {
        heading: 'Limits you will actually hit',
        body: 'OpenAI: 128 tools per request, schema depth 5, argument string capped at 8192 bytes. Strict mode additionally forbids unresolved $ref and overlapping oneOf, anyOf, or allOf, and requires every property to appear in required.\n\nAnthropic: 64 tools per request, schema depth effectively unbounded but practically around 10, no strict flag. The schema reads as a contract the model tends to honor, so validate server-side anyway.\n\nGemini: 64 functions per request, and schemas follow an OpenAPI 3.0 subset rather than JSON Schema 2020-12. One live quirk worth remembering: enum on object fields is silently ignored, so validate it yourself rather than trust the declaration.',
      },
      {
        heading: 'tool_choice: forcing, forbidding, and the odd fourth mode',
        body: 'Three modes are universal under three names. Auto lets the model pick a tool or text, and is the default everywhere. Required or Any forces at least one tool call. None forbids tools entirely.\n\nEach provider then adds one mode of its own. OpenAI and Anthropic can force a specific named tool. Anthropic separates single-call from multi-call with disable_parallel_tool_use. Gemini adds mode VALIDATED, which routes every response through a schema validator regardless of what the model intended to send.\n\nForcing a named tool is the practical payoff: it turns a "run this now" button into something deterministic, instead of a suggestion the model is free to ignore.',
      },
      {
        heading: 'Streaming, in one paragraph',
        body: 'All three providers stream tool calls, and the wire shapes differ the same way the non-streaming ones do. OpenAI sends delta.tool_calls[i].function.arguments partials tagged with an index; you accumulate per index and parse at finish_reason "tool_calls". Anthropic opens a content_block_start per tool_use block, streams input_json_delta chunks, and closes with content_block_stop. Gemini 3 added streamFunctionCallArguments with a functionCallId per chunk, so parallel calls interleave cleanly on one wire instead of Gemini 2\'s single-call-at-a-time streaming.\n\nLesson 13.03 goes deep on reassembly and the parse-early trap. Here the point is narrower: a provider\'s streaming events are just its non-streaming shapes cut into pieces, correlated the same way.',
      },
      {
        heading: 'Errors look different too',
        body: 'On non-strict OpenAI, the model returns an arguments string that fails to parse, your JSON.parse throws, and you inject the error and re-call. On strict OpenAI, invalid JSON is impossible by construction, but a typed refusal can appear instead of a call.\n\nOn Anthropic, input may carry unexpected fields, because the schema is advisory rather than enforced; validate server-side regardless. On Gemini, the OpenAPI subset quietly drops constraints you thought you had declared, most often enum on object fields.\n\nThree providers, three different silent-failure shapes, one reason to never trust a schema you declared but did not also validate. A test suite that only exercises the happy path on one provider will pass in CI and still fail the first week it runs against a second one, because the failure shapes were never the same shape to begin with.',
      },
      {
        heading: 'The translator pattern, in production',
        body: 'Production teams do not hand-roll this per project. Pydantic AI wraps the translation in AbstractToolset, LangGraph in UniversalToolNode, LlamaIndex in BaseTool. Each takes one canonical tool definition and emits the three provider shapes, then parses all three response shapes back into one canonical call.\n\nThe abstraction is not decoration. It is the seam that keeps a provider swap from becoming a rewrite: change one adapter, not every call site that touches tool_calls, content[], or parts[]. Phase 13.17 builds the same idea one layer up, as an LLM gateway that exposes an OpenAI-shaped API in front of any of the three, so even the translator becomes something you configure rather than write.\n\nThe cost of skipping this is not hypothetical. A team that hardcodes OpenAI\'s tool_calls[].function.arguments string-parsing into a UI component ships a working demo, then discovers on the Anthropic port that half the parsing logic assumed a string that was never a string on the new provider.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p13-02-inline-shapes.svg',
        alt: 'One tool, three wire shapes',
        caption:
          'The same canonical tool declaration becomes three different envelopes: OpenAI\'s function object, Anthropic\'s input_schema, Gemini\'s functionDeclarations.',
        diagramBrief:
          'Cream paper, monochrome ink, one accent. Three side-by-side boxes labeled OpenAI, Anthropic, Gemini, each showing a small code-shaped rectangle with its declaration envelope name at the top (function, input_schema, functionDeclarations) and its response container at the bottom (tool_calls[], content[] tool_use, parts[] functionCall). A single arrow from a shared "canonical Tool" box at the top fans out into the three.',
      },
      {
        src: '/lessons/p13-02-inline-limits.svg',
        alt: 'Provider limits at a glance',
        caption:
          'Tool count, schema depth, and strict-mode rules differ enough to change how many integrations a picker can expose.',
        diagramBrief:
          'Cream paper, monochrome ink, one accent color on the strictest constraint. A simple three-column comparison card: OpenAI (128 tools, depth 5, strict-mode rules), Anthropic (64 tools, depth about 10, no strict flag), Gemini (64 functions, OpenAPI 3.0 subset). Render as a small table-as-diagram, not prose.',
      },
    ],
    takeaways: [
      'Normalize at the edge. One canonical Tool plus three translators, or provider field names leak into every component downstream.',
      'OpenAI returns arguments as a string; Anthropic and Gemini return objects. Code typed against one provider throws on another.',
      'Tool caps are a picker constraint: 128 on OpenAI, 64 on Anthropic and Gemini, per request.',
      'Forcing a named tool is how a "do this now" control becomes deterministic instead of a suggestion to the model.',
    ],
    terms: [
      { term: 'Tool declaration', gloss: '"Tool spec"', meaning: 'The name, description, and JSON Schema input payload the host sends per tool.' },
      { term: 'tool_choice', gloss: '"Force or forbid"', meaning: 'The control selecting auto, required, none, or a specific named tool.' },
      { term: 'Strict mode', gloss: '"Guaranteed schema"', meaning: 'An OpenAI flag that constrains decoding so output must match the declared schema exactly.' },
      { term: 'tool_use block', gloss: '"Anthropic\'s call shape"', meaning: 'An inline content block carrying id, name, and a parsed input object.' },
      { term: 'functionCall part', gloss: '"Gemini\'s call shape"', meaning: 'A parts entry with name, args, and, from Gemini 3, a unique id.' },
      { term: 'Arguments-as-string', gloss: '"Stringified JSON"', meaning: 'OpenAI\'s convention of returning tool arguments as JSON text rather than a parsed object.' },
      { term: 'Parallel tool calls', gloss: '"Fan-out in one turn"', meaning: 'Multiple independent tool calls emitted inside a single model turn.' },
      { term: 'Refusal', gloss: '"Model declines"', meaning: 'A strict-mode-only typed block returned instead of a call when the model will not comply.' },
      { term: 'OpenAPI 3.0 subset', gloss: '"Gemini\'s schema quirk"', meaning: 'Gemini\'s schema dialect, close to but not identical to JSON Schema 2020-12.' },
      { term: 'Translator pattern', gloss: '"A provider adapter"', meaning: 'One canonical tool definition plus per-provider functions that emit and parse its wire shape.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Take a canonical Tool with name, description, and input_schema, and add an enum parameter. Write the OpenAI, Anthropic, and Gemini declarations by hand and mark the one line that changes only for Gemini.' },
      { level: 'medium', prompt: 'A tool call comes back on OpenAI with arguments as the string {"city": "Bengaluru", "unit": "celsius"}. Write the two lines of code that turn it into the same object Anthropic and Gemini would have handed you directly.' },
      { level: 'medium', prompt: 'Map a canonical ToolChoice(mode="force", tool_name="get_weather") into all three provider shapes, then do the same for mode="none". Note which provider needs a mode string instead of a boolean.' },
      { level: 'hard', prompt: 'Pick one provider limit (128 tools on OpenAI, schema depth 10 on Anthropic, 64 functions on Gemini) and design a registry-scoping strategy for a workspace with 300 potential tool integrations.' },
      { level: 'design', prompt: 'Sketch a settings screen where a user assigns tools to a workspace. Given OpenAI\'s 128-tool cap and Gemini\'s 64, decide what the picker does at tool 65: hard stop, search-to-filter, or per-project subsets. State the one microcopy line that explains the limit.' },
    ],
    furtherReading: [
      { label: 'OpenAI, Function calling guide', url: 'https://platform.openai.com/docs/guides/function-calling', why: 'Includes strict mode and parallel calls, the canonical reference.' },
      { label: 'Anthropic, Tool use overview', url: 'https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview', why: 'tool_use and tool_result block semantics, spelled out field by field.' },
      { label: 'Google, Gemini function calling', url: 'https://ai.google.dev/gemini-api/docs/function-calling', why: 'Parallel calls, unique ids, and the OpenAPI subset.' },
      { label: 'Vertex AI, Function calling reference', url: 'https://docs.cloud.google.com/vertex-ai/generative-ai/docs/multimodal/function-calling', why: 'Gemini\'s enterprise surface, useful when the consumer API and enterprise API diverge.' },
      { label: 'OpenAI, Structured outputs', url: 'https://platform.openai.com/docs/guides/structured-outputs', why: 'The strict-mode schema enforcement details this lesson leans on.' },
    ],
    shipIt: {
      kind: 'snippet',
      name: 'Canonical tool translator scaffold',
      body: 'Tool(name, description, input_schema, strict)\n\nto_openai(tool) -> {type: "function", function: {name, description, parameters: input_schema, strict}}\nto_anthropic(tool) -> {name, description, input_schema}\nto_gemini(tool) -> {functionDeclarations: [{name, description, parameters: input_schema}]}\n\ncanonical_call(response, provider) -> {id, name, args}\n  openai: parse response.tool_calls[i].function.arguments (string) into args\n  anthropic: read response.content[] where type is tool_use, args is input (already parsed)\n  gemini: read response.candidates[0].content.parts[] where functionCall, args is functionCall.args',
    },
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
      'Three weather lookups run serially cost three model round trips. Run them in one turn and wall clock collapses from a sum to a max. Fan-out benchmarks show 60 to 70 percent reduction, and the price is id correlation plus a stream you cannot parse until it closes.',
    readTime: '~10 min read',
    diagram: '/lessons/p13-03.svg',
    diagramCaption:
      'One model turn emitting three calls, executed concurrently, results returned keyed by id in completion order.',
    whyItMatters:
      'Parallel calls change the shape of your progress component. Serial fan-out gives you a single-line status you can update in place. Parallel gives you N concurrent rows finishing out of order, each keyed by a call id, which means a list with per-row state, not a spinner with a label. Streaming adds a second decision: arguments arrive in fragments, so you can render "looking up weather in Beng..." live but you cannot parse it. The gate is the provider end-of-call signal, and shipping a brace counter as a completeness test is the classic self-inflicted bug.',
    learningObjectives: [
      'Explain why parallel_tool_calls turns executor time from a sum into a max, using the 400/600/800 ms example.',
      'Correlate a streamed argument chunk to the right tool-call id during parallel fan-out on each of the three providers.',
      'Name the gate that keeps a partial arguments string from being parsed too early, on each provider.',
      'Redesign a progress component from a single status line into per-row state keyed by call id.',
      'Decide when to turn parallel calls off, citing ordering dependencies or downstream rate limits.',
    ],
    sections: [
      {
        heading: 'The problem: serial fan-out pays for every leg',
        body: 'An agent answering "weather in Bengaluru, Tokyo, and Zurich" without parallel calls does three full round trips. Model calls get_weather, host executes and replies, model calls again, twice more, then answers. That is roughly 4x the ideal wall clock, because you pay both model latency and executor latency on every leg.\n\nWith parallel calls it is one model turn emitting three calls. The host runs all three concurrently and replies with three results. Executor time becomes the max of the three, not the sum. The harness numbers make it concrete: 400, 600, and 800 ms executors run 1800 ms serially and 800 ms in parallel, and production fan-out benchmarks on OpenAI, Anthropic, and Gemini report 60 to 70 percent wall-clock reduction on this shape of workload.',
      },
      {
        heading: 'The id is the only glue',
        body: 'Every call the model emits carries an id, and every result you return must echo it. OpenAI uses tool_call_id on each tool-role message, Anthropic uses tool_use_id on each tool_result block, Gemini uses id on each functionResponse.\n\nGemini 3 added unique ids specifically because Gemini 2 matched results by name, which broke the moment two parallel calls hit the same tool. Two get_weather calls came back indistinguishable, results silently swapped between cities. That is the failure worth remembering, because it is the whole argument for id correlation in one bug report.\n\nReply order does not affect correctness on any of the three providers, so long as ids match. Prefer replying in completion order with explicit ids anyway, because it makes a dropped or duplicated result visible instead of quietly wrong.',
      },
      {
        heading: 'Streaming: one accumulator per id',
        body: 'When the model streams, arguments arrive in pieces, and three parallel calls interleave on one wire. You need one string buffer per id, not one buffer for the whole response.\n\nOpenAI sends delta.tool_calls[i].function.arguments partials carrying an index; you accumulate per index, read the id when it first appears, and parse only at finish_reason "tool_calls". Anthropic sends content_block_start per tool_use block, then input_json_delta chunks, closed by content_block_stop. Gemini 3 ships streamFunctionCallArguments with a functionCallId per chunk, so calls interleave cleanly; before Gemini 3, streaming returned one complete call at a time, so this was never a problem worth solving.\n\nThree different event names for the identical idea: buffer by id, close on the provider\'s own signal.',
      },
      {
        heading: 'The parse-early trap',
        body: 'A partial arguments string like {"city": "Beng is not valid JSON and will throw. The correct gate is the provider\'s end-of-call signal: OpenAI\'s finish_reason "tool_calls", Anthropic\'s content_block_stop, Gemini\'s stream-end event.\n\nBrace counting is unreliable as a completeness test, because braces inside quoted strings and escaped content produce false positives. Treat it as a debug heuristic at most, never a gate. If you want a live UI, use an incremental JSON parser that emits events as structure completes, which is what OpenAI\'s own streaming guide recommends for a live thinking indicator.\n\nThe payoff for doing this correctly is real: you can start executing a call as soon as its own arguments finalize, rather than waiting for every parallel stream to close.',
      },
      {
        heading: 'Out-of-order completion',
        body: 'A fast API returns first, a slow one returns third, and the middle one lands in between. The host\'s reply must still cite ids explicitly, one entry per tool_call_id, regardless of which order the executors actually finished in.\n\nThis is the moment a status line stops being enough. A single spinner cannot represent three independent completions arriving at three different times; the interface needs three rows, each one keyed by call id, each one settling on its own schedule. Building the single-spinner version first and retrofitting per-row state later is the more expensive order to do it in.',
      },
      {
        heading: 'When to turn parallel off',
        body: 'Disable it when tools have ordering dependencies (create_file then write_file), when one call\'s output feeds another\'s input, or when the rate limiter cannot absorb the fan-out. OpenAI defaults parallel_tool_calls to true; Anthropic defaults disable_parallel_tool_use to false from Claude 3.5 on, meaning parallel is on unless you opt out; Gemini is parallel-capable by default with no separate flag.\n\nThe real-world caveat is downstream pressure. A 10-way fan-out into a rate-limited service fails, loudly and partially, which is the worst kind of failure to render because some rows succeed and some do not. Anthropic\'s own guidance is to disable parallelism specifically for consequential mutations on the same resource, where losing the ordering guarantee is not just slower, it is wrong.',
      },
      {
        heading: 'What the benchmark is actually measuring',
        body: 'The 60 to 70 percent figure is a wall-clock number, not a cost number. You still pay for three executor calls and, usually, one model turn either way; what changes is how much of that cost sits on the critical path the user is staring at.\n\nThat is why the saving grows with tool count rather than staying fixed: three executors at 400, 600, 800 ms go from a 1800 ms sum to an 800 ms max, but ten executors at similar latencies would go from a multi-second sum to roughly that same 800 ms to 1 second max. The ceiling is set by your slowest single tool, not by how many you fan out to, so the design question becomes which tool in the set to speed up next.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p13-03-inline-timeline.svg',
        alt: 'Serial versus parallel executor timeline',
        caption: 'Three executors at 400, 600, and 800 ms: 1800 ms in sum, 800 ms at the max.',
        diagramBrief:
          'Cream paper, monochrome ink, one accent on the parallel bar. Two horizontal timelines stacked. Top labeled SERIAL: three sequential bars of proportional length 400, 600, 800, summing to 1800 ms, with a bracket showing the total. Bottom labeled PARALLEL: three bars starting at the same x-position (same 400, 600, 800 lengths), with a bracket showing only 800 ms total, the length of the longest bar.',
      },
      {
        src: '/lessons/p13-03-inline-accumulator.svg',
        alt: 'One accumulator buffer per call id',
        caption:
          'Three interleaved streams reassemble into three complete argument objects, gated on each provider\'s own end-of-call signal.',
        diagramBrief:
          'Cream paper, monochrome ink, one accent per id (three light tints). Show a single wavy wire at the top with interleaved chunk labels (A1, B1, A2, C1, B2, A3). Below it, three separate buffer boxes labeled id A, id B, id C, each filling up as its chunks arrive, with a checkmark and a "closed on finish_reason / content_block_stop / stream end" label once each buffer completes.',
      },
    ],
    takeaways: [
      'Parallel turns a status line into a list. N rows, per-row state, finishing out of order, keyed by call id.',
      'Executor time becomes max instead of sum. 400 plus 600 plus 800 ms goes from 1800 ms to 800 ms, and the gap widens with tool count.',
      'Never parse a partial arguments string. Gate on the provider end-of-call signal, not on counting braces.',
      'Turn parallel off for ordering dependencies and consequential mutations on the same resource, or a partial failure renders as a mystery.',
    ],
    terms: [
      { term: 'Parallel tool calls', gloss: '"Fan-out in one turn"', meaning: 'Multiple independent tool calls emitted in a single model turn.' },
      { term: 'parallel_tool_calls', gloss: '"OpenAI\'s flag"', meaning: 'The boolean that enables or disables multi-call emission, true by default.' },
      { term: 'disable_parallel_tool_use', gloss: '"Anthropic\'s inverse"', meaning: 'An opt-out flag; the default is parallel enabled from Claude 3.5 on.' },
      { term: 'Tool call id', gloss: '"Correlation handle"', meaning: 'The per-call identifier that every returned result must echo so the model can line them up.' },
      { term: 'Accumulator', gloss: '"Stream buffer"', meaning: 'A per-id string buffer that collects partial argument chunks from a stream.' },
      { term: 'Out-of-order completion', gloss: '"Fastest first"', meaning: 'Parallel calls finishing in unpredictable order, correlated only by id.' },
      { term: 'Dependency graph', gloss: '"Ordering constraints"', meaning: 'The relationships between tools whose outputs feed other tools\' inputs, which cannot parallelize.' },
      { term: 'Parse-early trap', gloss: '"JSON.parse exploded"', meaning: 'Calling JSON.parse on an incomplete arguments string, which throws instead of waiting.' },
      { term: 'streamFunctionCallArguments', gloss: '"Gemini 3 feature"', meaning: 'Streamed argument chunks tagged with a functionCallId so parallel calls interleave cleanly.' },
      { term: 'Completion-order reply', gloss: '"Don\'t wait for all"', meaning: 'Replying with results as they arrive, each one keyed by its own id.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Given executors at 300, 500, and 900 ms, compute the serial total and the parallel total, and state the percentage wall-clock reduction.' },
      { level: 'medium', prompt: 'A stream delivers three interleaved chunks for calls A, B, and C. Sketch the three accumulator buffers after each chunk arrives, and say which provider event tells you buffer A is complete.' },
      { level: 'medium', prompt: 'Extend a tool registry with an ordering_dependency graph so create_file always executes before write_file, even when the model emits both in one parallel turn. Describe the one check the host adds before dispatch.' },
      { level: 'hard', prompt: 'Anthropic recommends disabling parallelism for consequential mutations on the same resource. Name a two-tool example where two parallel consequential calls would corrupt state if they ran concurrently, and explain the race.' },
      { level: 'design', prompt: 'Design the three-row progress list for a parallel weather fan-out. Specify what each row shows while pending, what changes when a row completes out of order, and what the row looks like if its executor fails while the other two succeed.' },
    ],
    furtherReading: [
      { label: 'OpenAI, Parallel function calling', url: 'https://platform.openai.com/docs/guides/function-calling#parallel-function-calling', why: 'The default behavior and the opt-out flag.' },
      { label: 'Anthropic, Implementing tool use', url: 'https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/implementing-tool-use', why: 'disable_parallel_tool_use and result batching, from the source.' },
      { label: 'Google, Gemini function calling, parallel section', url: 'https://ai.google.dev/gemini-api/docs/function-calling', why: 'Id-correlated parallel calls from Gemini 3 on.' },
      { label: 'OpenAI, Streaming responses with tools', url: 'https://platform.openai.com/docs/api-reference/responses-streaming', why: 'Chunked argument reassembly for OpenAI streams.' },
      { label: 'Anthropic, Streaming messages', url: 'https://docs.anthropic.com/en/api/messages-streaming', why: 'content_block_delta with input_json_delta, the Anthropic streaming shape.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Parallel tool call rollout checklist',
      body: '- Does every returned result echo the tool_call_id, tool_use_id, or functionResponse id it answers?\n- Is there one accumulator buffer per id, not one shared buffer for the whole stream?\n- Does the parse step wait for the provider\'s own end-of-call signal, not a brace count?\n- Is there an ordering_dependency check before dispatch, for tools whose outputs feed other tools\' inputs?\n- Has the downstream rate limit been checked against the widest fan-out this registry allows?\n- Is the progress UI a list of rows keyed by id, not a single spinner with a label?',
    },
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
      'Asking nicely for JSON fails 5 to 15 percent of the time on frontier models. Constrained decoding masks invalid tokens out of the sampling distribution, so the output is guaranteed to parse and validate. Three failure modes collapse to one: refusal.',
    readTime: '~10 min read',
    diagram: '/lessons/p13-04.svg',
    diagramCaption:
      'Prompt-for-JSON, validate-after, and constrained decoding compared: where each one can still fail.',
    whyItMatters:
      'Strict mode changes your error taxonomy from three states to one, and that reshapes the component. Parse error and schema violation both disappear, so the retry-with-error-injected path stops being a rendered state. What remains is refusal, and refusal is not an error: it is a typed outcome that needs its own surface, with the model\'s stated reason, because a refusal shown as "something went wrong" invites a pointless retry. The schema is also the shape your extraction UI renders, field by field, so additionalProperties false is the thing that stops a hallucinated field appearing in a form you never designed.',
    learningObjectives: [
      'Write a JSON Schema 2020-12 for an extraction target using enum, minimum and maximum, required, and pattern correctly.',
      'Explain why constrained decoding gives a different guarantee than validate-after-generation.',
      'Distinguish parse error, schema violation, and refusal as three separate failure modes, and say which ones strict mode removes.',
      'Bind the same schema to Pydantic and Zod and predict what each framework does with a validation failure.',
      'Cap a retry loop at three attempts and explain what a fourth failure actually tells you.',
      'Design the states for a refusal versus a generic error, and say why they should never look the same.',
    ],
    sections: [
      {
        heading: 'The problem: three approaches, three risk profiles',
        body: 'An agent turning a purchase-order email into {customer, line_items, total_usd} has three options.\n\nPrompt for JSON: works 85 to 95 percent of the time on frontier models, and fails six ways. Missing brace, trailing comma, wrong type, hallucinated field, truncation at the token limit, and leaked prose like "Here is your JSON:".\n\nValidate after generation: generate freely, parse, validate, retry on failure. Reliable and expensive, because you pay for every retry and a truncation bug costs an extra turn every time it happens.\n\nConstrained decoding: the provider enforces the schema at decode time. Invalid tokens are masked out of the sampling distribution before they can be sampled at all, so the failure surface collapses from six shapes to one.',
      },
      {
        heading: 'JSON Schema 2020-12 is the lingua franca',
        body: 'Every provider accepts it. The constructs that carry the weight: type, properties, required, enum for closed sets, minimum and maximum for numbers, minLength, maxLength, and pattern for strings, items for arrays, and additionalProperties false to forbid extra fields.\n\nOpenAI strict mode adds three requirements on top. Every property must appear in required. additionalProperties must be false everywhere. No unresolved $ref. Break any of them and the API returns 400 at request time, not at generation time, which is the good kind of failure: caught before you spend a token.',
      },
      {
        heading: 'The bindings: Pydantic and Zod',
        body: 'Pydantic v2 generates JSON Schema from a model via model_json_schema(). Pydantic AI wraps this so you declare an Invoice class with customer, line_items, and total_usd fields, and the framework translates it into OpenAI strict mode, Anthropic input_schema, or Gemini responseSchema at the edge, returning a typed instance rather than a dict.\n\nZod is the TypeScript equivalent. z.object({customer: z.string(), ...}) plus zodResponseFormat(Invoice) in the OpenAI Node SDK translates to the API\'s JSON Schema payload and validates the response at runtime. One declaration, enforced end to end, typed on both sides of the wire, so a field renamed in the schema breaks the build instead of breaking in production.',
      },
      {
        heading: 'Refusal is an outcome, not an error',
        body: 'Strict mode cannot force the model to answer. If the input cannot fit the schema, because the email was a poem and not an invoice, the model emits a refusal field carrying the reason.\n\nThat is a first-class outcome and your code has to treat it as one. It does not retry. The refusal is also a safety signal: a model asked to extract a credit card number from protected content returns a refusal with the safety reason attached, which is worth surfacing verbatim rather than translating into a generic error.\n\nOutside strict mode the recovery pattern is generate, parse, validate, inject the error, retry, capped at three. One retry usually suffices; needing more than three means the schema does not fit some real input, and the fix is the schema, not another retry.',
      },
      {
        heading: 'Why this decouples reliability from model size',
        body: 'Open-weight implementations use three techniques. Grammar-based decoding (outlines, guidance, lm-format-enforcer) builds a finite automaton from the schema and masks violating logits at each step. Logit masking runs a streaming JSON parser in lockstep to compute the valid next-token set. Speculative decoding lets a cheap draft model propose while a verifier enforces the schema.\n\nThe consequence is the headline. A 3B open model with grammar enforcement outperforms a 70B model with raw prompting on structured tasks. Reliability stops scaling with parameter count, which is what makes structured extraction affordable in production: the model you pick for the boring 80 percent of your pipeline can be the cheap one.',
      },
      {
        heading: 'Retry strategy, and where it stops working',
        body: 'The generate, parse, validate, inject-the-error, retry loop is only worth running a bounded number of times. Cap it at three. One retry catches the common flake, a second catches a weak model that needed the error spelled out once, and a third is generous.\n\nA fourth attempt rarely succeeds where the first three failed, because the failure is usually the schema, not the sample. If the model cannot produce a valid total_usd for a specific email shape after three tries, the schema is asking for something the input does not contain, and no amount of retrying fixes that. Log the failing input and fix the schema or the prompt, not the retry count.',
      },
      {
        heading: 'Where each provider stands in 2026',
        body: 'OpenAI: response_format {type: "json_schema", strict: true}, with a refusal field in the response when the model declines. Anthropic: schema enforcement on tool_use inputs; there is no dedicated refusal stop_reason, an end_turn with no tool call is the signal to watch for instead. Gemini: responseSchema at the request level, and as of 2026 ships token-level grammar constraints for selected types, closing the gap with OpenAI\'s strict mode.\n\nNone of the three guarantee an answer, only a valid shape when they do answer. That distinction, shape-guaranteed versus answer-guaranteed, is the one to keep straight when you design the empty and refusal states for an extraction feature.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p13-04-inline-funnel.svg',
        alt: 'Three approaches, narrowing failure modes',
        caption: 'Prompt for JSON risks six failure shapes; validate-after risks three; constrained decoding risks one: refusal.',
        diagramBrief:
          'Cream paper, monochrome ink, one accent on the surviving failure mode. Three vertical funnels side by side. Left funnel "Prompt for JSON" has six small labeled dots falling through (brace, comma, type, field, truncation, prose). Middle funnel "Validate after" has three dots (parse error, schema violation, refusal) with a retry loop arrow. Right funnel "Constrained decoding" has one dot only, labeled refusal, in the accent color.',
      },
      {
        src: '/lessons/p13-04-inline-retry.svg',
        alt: 'The retry loop, capped at three',
        caption: 'One retry catches a flake, three is generous; a fourth failure means the schema is wrong for this input.',
        diagramBrief:
          'Cream paper, monochrome ink. A simple loop diagram: generate to parse to validate to (on fail) inject error to retry, looping back to generate, with attempt counters 1, 2, 3 marked on the loop arrow and a stop icon after 3 labeled "fix the schema, not the retry count."',
      },
    ],
    takeaways: [
      'Strict mode collapses three failure modes into one. Parse error and schema violation become impossible; refusal remains.',
      'A refusal is a typed outcome with a reason, so it gets its own surface. Rendering it as a generic error invites a pointless retry.',
      'additionalProperties false is what stops a hallucinated field showing up in a form nobody designed.',
      'A 3B model with grammar enforcement beats a 70B model with raw prompting on structured extraction. Reliability is not a parameter-count problem.',
    ],
    terms: [
      { term: 'Constrained decoding', gloss: '"Logit masking"', meaning: 'Decode-time enforcement that masks any next-token which would violate the schema.' },
      { term: 'Strict mode', gloss: '"Guaranteed schema"', meaning: 'OpenAI\'s flag guaranteeing output validates, at the cost of extra schema requirements.' },
      { term: 'Refusal', gloss: '"Model declines"', meaning: 'A typed outcome where the model declines because the input cannot fit the schema.' },
      { term: 'Parse error', gloss: '"Invalid JSON"', meaning: 'Output that did not parse as JSON at all; impossible under strict mode.' },
      { term: 'Schema violation', gloss: '"Wrong shape"', meaning: 'Output that parses as JSON but breaks types, required, enum, or range constraints.' },
      { term: 'additionalProperties: false', gloss: '"No extras allowed"', meaning: 'The schema clause forbidding unknown fields, required throughout OpenAI strict mode.' },
      { term: 'Pydantic BaseModel', gloss: '"Typed output"', meaning: 'A Python class that both emits and validates JSON Schema for a given shape.' },
      { term: 'Zod schema', gloss: '"TypeScript output type"', meaning: 'A TS runtime schema used to validate provider output against a declared shape.' },
      { term: 'Grammar enforcement', gloss: '"Open-weights constrained decode"', meaning: 'FSM-based logit masking, as implemented by outlines and guidance.' },
      { term: 'JSON Schema 2020-12', gloss: '"The schema spec"', meaning: 'The IETF-draft schema dialect every modern provider and framework speaks.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Write a JSON Schema 2020-12 fragment for total_usd as a required, non-negative decimal, and state which strict-mode rule it must also satisfy.' },
      { level: 'medium', prompt: 'A validate-after pipeline has retried three times and still fails on the same invoice email. Decide whether to retry a fourth time or change the schema, and justify it in two sentences.' },
      { level: 'medium', prompt: 'Extend an Invoice schema so line_item is either a product or a service, tagged by a kind discriminator. Note the one strict-mode rule this interacts with.' },
      { level: 'hard', prompt: 'Construct ten inputs that should not be extractable as invoices (a poem, a blank note, a receipt in a currency the schema forbids) and predict which ones return a refusal versus which ones a weak model would hallucinate an answer for anyway.' },
      { level: 'design', prompt: 'Design the empty, error, and refusal states for an invoice-extraction feature. Specify the one sentence of copy for the refusal state, and why it must not include a retry button.' },
    ],
    furtherReading: [
      { label: 'OpenAI, Structured outputs', url: 'https://platform.openai.com/docs/guides/structured-outputs', why: 'Strict mode, refusals, and schema requirements, in full.' },
      { label: 'OpenAI, Introducing structured outputs', url: 'https://openai.com/index/introducing-structured-outputs-in-the-api/', why: 'The 2024 launch post explaining the decoding guarantee.' },
      { label: 'Pydantic AI, Output', url: 'https://ai.pydantic.dev/output/', why: 'Typed output_type bindings that serialize to each provider.' },
      { label: 'JSON Schema, 2020-12 release notes', url: 'https://json-schema.org/draft/2020-12/release-notes', why: 'The canonical spec every schema in this lesson depends on.' },
      { label: 'Microsoft, Structured outputs in Azure OpenAI', url: 'https://learn.microsoft.com/en-us/azure/foundry/openai/how-to/structured-outputs', why: 'Enterprise deployment notes and strict-mode caveats.' },
    ],
    shipIt: {
      kind: 'rubric',
      name: 'Structured-output failure-mode rubric',
      body: '- Parse error: output is not valid JSON. Strict mode: impossible. UI: should never be visible; if it is, strict mode is off somewhere.\n- Schema violation: output parses but breaks types, required, enum, or range. Strict mode: impossible. UI: same as above, a strict-mode leak.\n- Refusal: model declines because the input does not fit the schema. Strict mode: expected. UI: its own state, showing the model\'s stated reason, no retry affordance.',
    },
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
      'A tool schema is a form the model fills in, so every rule you already know applies: naming, affordance, constraint, error copy. Renaming and rewriting descriptions alone moved a 50-tool registry from 62 to 89 percent selection accuracy.',
    readTime: '~10 min read',
    diagram: '/lessons/p13-05.svg',
    diagramCaption:
      'A 30-tool registry with two ambiguous descriptions, and the disambiguating "Do not use for" line that separates them.',
    whyItMatters:
      'This is the lesson where the model becomes a user and the schema becomes a form. The tool name is a label, the description is helper text and empty-state guidance, enum is a select instead of a free-text input, pattern is client-side validation, and the error message is validation copy. You already know that "retrieve financial data" is a bad label and "Invalid input" is bad validation copy. The measured swings are the same size as usability swings on a human form: 62 to 89 percent selection accuracy on one 50-tool registry, from a description rewrite alone.',
    learningObjectives: [
      'Write a tool description using the "Use when X. Do not use for Y." pattern, staying under 1024 characters.',
      'Name a tool with snake_case, verb-noun order, and no arguments baked into the name.',
      'Decide when to split a monolithic action-string tool into atomic named tools.',
      'Write an error message that teaches the model what to send next, instead of leaking a stack trace.',
      'Version a tool without breaking a model that has already seen its old name or shape.',
      'Audit a tool description for injection-shaped text before it ships to a registry.',
    ],
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
        body: 'A monolithic do_everything(action, target, options) looks DRY and forces the model to pick action from a string and options from an untyped dict, the two worst input surfaces there are. Benchmarks show 15 to 30 percent worse selection. The rule of thumb: if action has more than three values, split the tool. Atomic tools (notes_list, notes_create, notes_delete, notes_search) let the model pick by name instead of parsing a string.\n\nThe parameter rules are input-control rules. Enum every closed set, because units: "celsius" or "fahrenheit" is a select and units: string is a free-text field. Add a pattern to typed ids to catch hallucinated ones. Never use type: any. Describe every field, because that description is part of the prompt.',
      },
      {
        heading: 'Error messages are validation copy',
        body: 'When a call fails, the error message goes back into the model\'s context. So write it for the reader, exactly as you would for a human.\n\nBad: TypeError: object of type NoneType has no attribute lower. Good: Invalid input: city is required. Example: {"city": "Bengaluru"}. Benchmarks show typed error messages cut retry counts in half on weak models, which is the same result good validation copy produces on a human form.\n\nThe habit transfers directly from web forms: name the field, state the constraint, show a valid example. A model reading "Invalid input: city is required" does exactly what a person reading the same line would do, and a stack trace teaches neither of them anything they can act on.',
      },
      {
        heading: 'Versioning: renaming is a breaking change',
        body: 'Tools evolve, and the rules read like API versioning because they are. Never rename a stable tool: add get_weather_v2 and deprecate get_weather rather than mutate it in place, because every model that has seen the old name in a few-shot example or a cached system prompt will keep calling it.\n\nNever change an argument\'s type: loosening string to string-or-number needs a new version, not a silent widen. Adding optional parameters is always safe, because a model that never learned about the new field just omits it.\n\nRemove tools only behind a deprecation window: publish a deprecated flag, wait one release cycle, then delete. Skipping the window is how a routine cleanup turns into a production incident three weeks later, when a model still calling the old name gets a 404 instead of a result.\n\nTreat a tool registry the way you would treat a public API, because from the model\'s side, that is exactly what it is: a contract other code depends on, just written by a different kind of caller.',
      },
      {
        heading: 'Tool poisoning, and the benchmarks that measure all of this',
        body: 'Descriptions land in the model\'s context verbatim, which cuts both ways. A well-written description improves selection; a hostile one can hide instructions, because nothing about the model treats a tool description as less trustworthy than a user message. Phase 13.15 covers the attack surface in full; here the discipline is a linter that rejects suspicious patterns before a description ships.\n\nThree open benchmarks make the naming and safety discipline measurable rather than a matter of taste. StableToolBench scores selection accuracy on a fixed registry. MCPToolBench++ extends that to MCP servers, capturing discovery as well as selection. SafeToolBench measures selection under adversarial, poisoned tool sets. All three run in under an hour on a modest GPU, cheap enough to put in CI next to your unit tests, and cheap enough that skipping them is a choice, not a resource constraint.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p13-05-inline-rules.svg',
        alt: 'Six naming and description rules at a glance',
        caption: 'snake_case, verb-noun order, no tense, stable names, namespace prefixes, and the two-sentence description pattern.',
        diagramBrief:
          'Cream paper, monochrome ink, one accent. A vertical list of six short rule cards, each with a one-line good-versus-bad pair, for example "get_weather not weather_get", "notes_list, notes_search not two generic list tools", "Use when X. Do not use for Y." Keep each card terse, like a style-guide poster.',
      },
      {
        src: '/lessons/p13-05-inline-split.svg',
        alt: 'One monolithic tool splitting into four atomic ones',
        caption: 'do_everything(action, target, options) becomes notes_list, notes_create, notes_delete, notes_search: same capability, four names the model can pick by.',
        diagramBrief:
          'Cream paper, monochrome ink, one accent on the atomic side. Left: a single box "do_everything(action, target, options)" with a messy tangle of arrows labeled with five action values. Right: four clean separate boxes notes_list, notes_create, notes_delete, notes_search, each with a single clean arrow in. A big arrow from left to right labeled "split when action has more than 3 values."',
      },
    ],
    takeaways: [
      'The model is a user filling in a form. Name is the label, description is helper text, enum is a select, pattern is validation, error copy is validation copy.',
      'The "Do not use for" sentence is the disambiguator, and it is the one most registries omit. One rewrite moved a 50-tool registry from 62 to 89 percent.',
      'Split a monolithic tool once its action argument has more than three values. Selection accuracy drops 15 to 30 percent otherwise.',
      'Write errors for the model. Typed messages naming the field and showing an example halve retry counts on weak models.',
    ],
    terms: [
      { term: 'Tool schema', gloss: '"Input shape"', meaning: 'The JSON Schema describing a tool\'s arguments, including required fields and types.' },
      { term: 'Tool description', gloss: '"The when-to-use-it paragraph"', meaning: 'The natural-language brief the model reads during selection, not documentation for humans.' },
      { term: 'Atomic tool', gloss: '"One tool, one action"', meaning: 'A tool whose name uniquely identifies one behavior, so selection happens by name.' },
      { term: 'Monolithic tool', gloss: '"Swiss Army"', meaning: 'A single tool with an action string argument, which measurably tanks selection accuracy.' },
      { term: 'Enum-closed set', gloss: '"Categorical parameter"', meaning: 'A string type restricted to an enum list, the correct shape for closed domains.' },
      { term: 'Tool poisoning', gloss: '"Injected description"', meaning: 'Hidden instructions embedded in a tool description, which land in the model\'s context verbatim.' },
      { term: 'Tool-selection accuracy', gloss: '"Did it pick right?"', meaning: 'The share of queries where the model calls the correct tool from the registry.' },
      { term: 'Description linter', gloss: '"CI for schemas"', meaning: 'An automated audit that enforces naming, length, and disambiguation rules.' },
      { term: 'Namespace prefix', gloss: '"notes_*"', meaning: 'A shared name prefix that groups related tools in a large registry.' },
      { term: 'StableToolBench', gloss: '"Selection benchmark"', meaning: 'A public benchmark for measuring tool-selection accuracy on a fixed registry.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Rename weather_get(loc) to follow the naming rules in this lesson. State which of the five rules it was breaking.' },
      { level: 'medium', prompt: 'Write the two-sentence description for a create_calendar_event tool that disambiguates it from update_calendar_event. Keep it under 1024 characters.' },
      { level: 'medium', prompt: 'A do_everything(action, target, options) tool has an action argument with five possible values. Split it into atomic tools and name all five.' },
      { level: 'hard', prompt: 'Rewrite this error, TypeError: object of type NoneType has no attribute lower, as validation copy a model can act on, naming the missing field and giving an example payload.' },
      { level: 'design', prompt: 'Audit a real MCP server\'s tool descriptions and find two ambiguous pairs. Propose the "Do not use for" sentence that would disambiguate each pair, and decide whether the fix belongs in the description or in a rename.' },
    ],
    furtherReading: [
      { label: 'Composio, How to build tools for AI agents: a field guide', url: 'https://composio.dev/blog/how-to-build-tools-for-ai-agents-a-field-guide', why: 'Naming and description patterns with measured accuracy lifts.' },
      { label: 'OneUptime, Tool schemas for agents', url: 'https://oneuptime.com/blog/post/2026-01-30-tool-schemas/view', why: 'Parameter design patterns pulled from production registries.' },
      { label: 'Databricks, Agent system design patterns', url: 'https://docs.databricks.com/aws/en/generative-ai/guide/agent-system-design-patterns', why: 'The 62 to 89 percent registry-rewrite result comes from here.' },
      { label: 'Anthropic, Building agents with the Claude Agent SDK', url: 'https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk', why: 'Description patterns specific to Claude-based agents.' },
      { label: 'OpenAI, Function calling best practices', url: 'https://platform.openai.com/docs/guides/function-calling#best-practices', why: 'Description length limits and atomic-tool guidance, straight from the provider.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Tool schema design review checklist',
      body: '- Is the name snake_case, verb-noun ordered, and free of baked-in arguments?\n- Does the description say "Use when X. Do not use for Y." in under 1024 characters?\n- Is every closed set an enum, never a free-text string?\n- Does the action argument, if any, have three or fewer values, or has the tool been split?\n- Does every error message name the field and show an example payload?\n- Is the tool versioned with a new name rather than a mutated one, with a deprecation window before removal?\n- Has the description been scanned for injection-shaped text before it shipped?',
    },
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
    readTime: '~10 min read',
    diagram: '/lessons/p13-21.svg',
    diagramCaption:
      'One OpenAI-shaped request hitting an alias, cascading down a priority fallback chain, with cost attributed per leg.',
    whyItMatters:
      'Routing is where your latency budget stops being one number. A live chat surface needs fast time to first token, a batch summarizer does not, so the same product carries two different budgets and the router is what enforces them. Failover is a visible state too: when the primary provider degrades and the chain lands on a fallback, quality and speed change under the user, and a silent swap reads as a regression. Model aliases are the ship-safety mechanism, since our_smart_model repoints server-side without touching your code. And per-key budgets are a real refusal your UI must render.',
    learningObjectives: [
      'Name the five reasons a product needs a routing layer: cost, failover, latency, compliance, and experimentation.',
      'Explain how a model alias turns a version upgrade into a config change instead of a deploy.',
      'Design a fallback chain with a bounded retry budget and say what a user experiences on each leg.',
      'Compare LiteLLM, OpenRouter, and Portkey on hosting, provider count, and guardrail defaults, and pick one for a stated constraint.',
      'Estimate the savings from semantic caching on a repeated agent loop.',
      'Design the refusal state a user sees when a per-key budget is hit.',
    ],
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
        heading: 'Fallback chains and semantic caching',
        body: 'A chain is an ordered list: primary, then a second provider on 5xx, then a third, then refuse. Retries count against a budget so a cascade cannot silently explode cost.\n\nSemantic caching keys on prompt embeddings rather than exact text, so near-identical prompts share a cache slot instead of each one paying full model latency. Savings on repeated agent loops run 30 to 60 percent, the single highest-return line item in most gateway configs, because agent loops repeat similar prompts far more than a human chat interface does.',
      },
      {
        heading: 'Guardrails and per-key rate limits',
        body: 'Guardrails live at the gateway, not scattered across call sites. PII redaction strips sensitive fields before a prompt leaves your infrastructure. Policy rejection blocks prohibited content before it reaches a provider. Output filters scrub completions for leaked secrets on the way back.\n\nPortkey and Kong ship opinionated guardrails out of the box; LiteLLM leaves them optional, which suits teams that already run their own redaction layer. Per-key rate limits give each team its own quota, so one team\'s runaway agent loop cannot drain the budget the rest of the org depends on. That last one is not a nice-to-have: it is the difference between one team\'s bug and an org-wide outage.',
      },
      {
        heading: 'Choosing between the three archetypes',
        body: 'LiteLLM is the open-source self-hosted proxy: your own keys, 100-plus providers, OpenTelemetry, and it wins when you have an SRE team and need data sovereignty.\n\nOpenRouter is the managed SaaS: 300-plus providers, credit-based billing, a dashboard, no infrastructure. It wins for rapid prototyping and single-subscription simplicity.\n\nPortkey is the production option, open-sourced in March 2026, available self-hosted or managed, with full OpenTelemetry and PII redaction built in. It wins when guardrails and compliance need to be there on day one rather than added later.',
      },
      {
        heading: 'Routing strategies and cost tracking',
        body: 'Five strategies cover most needs. Static priority: first in the list, fall back on error. Load balancing: round robin or weighted. Cost-aware: cheapest model meeting the latency and quality bar. Latency-aware: fastest model over the last N minutes. Task-aware: a prompt classifier sends coding one way and summarization another.\n\nCost tracking is the reporting layer underneath all of them. Every request carries provider, model, input tokens, and output tokens, multiplied by a maintained pricing sheet and aggregated per user, team, or project. Without this layer, a cost-aware strategy has nothing to optimize against, and a per-key budget has nothing to enforce.\n\nMost teams start with static priority because it needs no telemetry, then graduate to cost-aware or task-aware once the pricing sheet and the per-request logs exist to support it. The order matters: a cost-aware router built on guessed prices is worse than a static one, because it makes confidently wrong decisions instead of simple ones.',
      },
      {
        heading: 'Where routing meets MCP, and the refusal your UI must render',
        body: 'One gateway can route both LLM calls and MCP sampling requests, which is where the routing gateway and the MCP gateway sometimes merge into a single service: a sampling request\'s modelPreferences gets translated to the right backend the same way a chat completion does.\n\nThe part worth designing for deliberately is what happens at the budget ceiling. A per-key rate limit is not an edge case, it is a real, expected outcome the day a team\'s usage grows, and it needs its own state: a clear refused-for-budget message, not a generic error that reads like an outage. The same discipline applies to a fallback that lands on a third-choice provider: say so, rather than let quality silently shift under the user.\n\nNeither state is rare enough to skip designing. A gateway with real traffic hits both within its first month, so treating them as afterthoughts means shipping the two states your busiest week needs least prepared.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p13-21-inline-chain.svg',
        alt: 'A fallback chain under a retry budget',
        caption: 'Primary, then a second provider on 5xx, then a third, then refuse: each leg spends part of a bounded retry budget.',
        diagramBrief:
          'Cream paper, monochrome ink, one accent on the refuse endpoint. A horizontal chain of four boxes: Primary (openai), Fallback 1 (anthropic), Fallback 2 (gemini), Refuse, connected by arrows labeled "on 5xx". A small budget meter below the chain showing retries ticking down as the chain moves right.',
      },
      {
        src: '/lessons/p13-21-inline-archetypes.svg',
        alt: 'Three routing gateway archetypes',
        caption: 'LiteLLM (self-hosted), OpenRouter (managed SaaS), and Portkey (production, open-sourced March 2026) trade off control, setup, and guardrails.',
        diagramBrief:
          'Cream paper, monochrome ink, one accent per archetype. Three columns as simple cards: LiteLLM ("your keys, 100+ providers, OTel"), OpenRouter ("300+ providers, credits, dashboard"), Portkey ("OSS + managed, OTel + PII redaction"). One line under each stating who it wins for.',
      },
    ],
    takeaways: [
      'One product carries several latency budgets. Chat needs fast first token, batch does not, and the router is what enforces the split.',
      'A fallback is a visible state. When the chain drops to a second provider, quality and speed shift under the user, and a silent swap reads as a regression.',
      'Aliases make a model upgrade a config change. our_smart_model repoints server-side with no application release.',
      'Semantic caching returns 30 to 60 percent on repeated agent loops, because near-identical prompts share a cache slot by embedding.',
    ],
    terms: [
      { term: 'Routing gateway', gloss: '"LLM proxy"', meaning: 'A single-API layer in front of many model providers, handling retries, cost, and policy.' },
      { term: 'OpenAI-compatible', gloss: '"Speaks the OpenAI schema"', meaning: 'Accepts the /v1/chat/completions shape and translates it to any backend provider.' },
      { term: 'Model alias', gloss: '"our_smart_model"', meaning: 'A name in your code that the gateway maps to a concrete model, changeable server-side.' },
      { term: 'Fallback chain', gloss: '"Retry list"', meaning: 'An ordered list of providers attempted on failure, bounded by a retry budget.' },
      { term: 'Semantic caching', gloss: '"Prompt-embedding cache"', meaning: 'Caching keyed on prompt embeddings, so near-duplicate prompts share one cache hit.' },
      { term: 'Guardrails', gloss: '"Input and output filters"', meaning: 'Gateway-level filters that redact PII and reject policy violations.' },
      { term: 'Per-key rate limit', gloss: '"Team budget"', meaning: 'A quota scoped to one API key, typically one team, so nobody drains the shared pool.' },
      { term: 'Cost tracking', gloss: '"Per-request spend"', meaning: 'Aggregated token usage multiplied by price per model, rolled up per user, team, or project.' },
      { term: 'LiteLLM', gloss: '"The open proxy"', meaning: 'A self-hostable, open-source routing gateway with your own keys and OpenTelemetry.' },
      { term: 'Portkey', gloss: '"The production option"', meaning: 'A routing gateway, open-sourced in March 2026, with guardrails and PII redaction built in.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Sonnet costs roughly 3x Haiku. For a triage step and a synthesis step on the same request, decide which model each one gets and justify the split in one sentence.' },
      { level: 'medium', prompt: 'Design a fallback chain for a chat product: primary provider, one fallback, then refuse. State the retry budget and what happens to latency on the worst-case path.' },
      { level: 'medium', prompt: 'A gateway reports an average of $0.0041 per request, blended across four routes. Break down what that average hides, and name the one route a team should investigate first.' },
      { level: 'hard', prompt: 'Pick LiteLLM, OpenRouter, or Portkey for a startup with no SRE team that needs PII redaction on day one. Justify the pick against the other two by naming what each would have cost in setup time or missing guardrails.' },
      { level: 'design', prompt: 'Design the UI state a user sees when their team hits its per-key budget mid-conversation. Specify what happens to the in-flight request and the one line of copy that explains the limit without sounding like an error.' },
    ],
    furtherReading: [
      { label: 'LiteLLM, docs', url: 'https://docs.litellm.ai/', why: 'The self-hosted routing gateway, straight from the source.' },
      { label: 'OpenRouter, quickstart', url: 'https://openrouter.ai/docs/quickstart', why: 'The managed routing SaaS, credit billing and provider list included.' },
      { label: 'Portkey, docs', url: 'https://portkey.ai/docs', why: 'Production routing with guardrails, self-hosted or managed.' },
      { label: 'TrueFoundry, LiteLLM vs OpenRouter', url: 'https://www.truefoundry.com/blog/litellm-vs-openrouter', why: 'A decision guide that lines the two up on the criteria that matter.' },
      { label: 'Relayplane, LLM gateway comparison 2026', url: 'https://relayplane.com/blog/llm-gateway-comparison-2026', why: 'A wider vendor survey for when three archetypes are not enough.' },
    ],
    shipIt: {
      kind: 'rubric',
      name: 'Routing gateway selection rubric',
      body: '- LiteLLM: self-hosted, your own keys, 100+ providers, OpenTelemetry. Wins with an SRE team and a data-sovereignty requirement.\n- OpenRouter: managed SaaS, 300+ providers, credit-based billing, a dashboard. Wins for rapid prototyping and single-subscription simplicity.\n- Portkey: open-sourced March 2026, self-hosted or managed, full OpenTelemetry plus PII redaction built in. Wins when guardrails and compliance need to exist on day one.\n- In every case: confirm the fallback chain has a bounded retry budget, and the per-key budget has a named refusal state, before shipping.',
    },
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
