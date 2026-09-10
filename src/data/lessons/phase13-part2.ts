import type { Lesson } from '@/lib/lessons';

// Phase 13 · Part 2 · MCP, end to end (lessons 13.06-13.10, 13.14)
export const phase13Part2: Lesson[] = [
  {
    id: 'p13-06-mcp-fundamentals',
    phase: 'Phase 13 · Tools and Protocols',
    part: 'Part 2 · MCP, end to end',
    index: '13.06',
    title: 'Every request describes itself now: MCP drops the handshake',
    oneLiner:
      'MCP\'s 2026-07-28 revision deletes the initialize handshake and the protocol session it created. Every request now carries its own version, capabilities, and identity in a _meta block, checked fresh each time, with a mandatory server/discover method standing in for the old gate.',
    readTime: '~10 min read',
    diagram: '/lessons/p13-06.svg',
    diagramCaption:
      'The initialize handshake, then the operation phase where either side may originate a request per the negotiated capabilities.',
    whyItMatters:
      'The interface consequence is that there is no session left to indicate. A host used to render a connecting spinner, then a solid dot once initialize closed. Under the stateless core that dot has nothing to point at: two requests to the same server can land on two different replicas with no memory shared between them, so "connected" is a property of the last request, not of a session object. Any UI still showing a persistent connection light for an MCP server is showing state the protocol no longer keeps, and your empty and error states need to say so per call, not once per session.',
    learningObjectives: [
      'Distinguish MCP\'s three surviving server primitives, tools, resources, prompts, from the three that were retired: roots, sampling, logging.',
      'Build a valid 2026-07-28 JSON-RPC request carrying protocolVersion, clientCapabilities, and clientInfo inside params._meta.',
      'Explain why server/discover is mandatory for a server to implement but optional for a client to call first.',
      'Read a resultType: "complete" response and act on its ttlMs and cacheScope hints.',
      'Identify which pre-2025-11-25 MCP behaviors still require a separate, explicitly isolated legacy branch.',
    ],
    sections: [
      {
        heading: 'The bug that ended the session',
        body: 'A protocol session assumes one connection equals one client for its whole lifetime. That assumption breaks the moment a server runs behind a load balancer: two consecutive requests from different clients can land on the same worker, or one client\'s two requests can land on two different workers with nothing shared between them. A server that remembers what the first request declared can apply the wrong permissions to the second.\n\nMCP shipped from Anthropic in November 2024 and has published five revisions since: 2024-11-05, 2025-03-26, 2025-06-18, 2025-11-25, and 2026-07-28. Each one moved further from a stateful connection. The 2026-07-28 revision finishes the move: the protocol core has no session at all, and every request must be interpretable on its own.',
      },
      {
        heading: 'Three primitives survive, three retire',
        body: 'Server side, three primitives remain unchanged in shape: tools are model-controlled actions discovered with tools/list and invoked with tools/call, resources are URI-addressed data discovered with resources/list and read with resources/read, prompts are reusable templates discovered with prompts/list and rendered with prompts/get.\n\nThree client-side features from the handshake era are deprecated. Roots are replaced by explicit tool or resource inputs. Sampling is replaced by the client calling a model provider directly. Logging moves to stderr or OpenTelemetry instead of a protocol message. Elicitation survives under a new name: a handler that needs user input returns an input_required result, the client fulfills it, and retries the original call with a new request id. A modern server never opens an independent request of its own.',
      },
      {
        heading: 'The wire stays JSON-RPC, the envelope gets stricter',
        body: 'Requests, responses, and notifications keep their JSON-RPC 2.0 shapes: {jsonrpc, id, method, params} for a request, the same id plus result or error for a response, no id at all for a notification. What changes is what every request\'s params must now contain.\n\nEvery modern request carries a _meta object with io.modelcontextprotocol/protocolVersion and io.modelcontextprotocol/clientCapabilities, both required, plus a recommended io.modelcontextprotocol/clientInfo for display and debugging. The server must not infer any of these three values from an earlier request, a stdio process, or a transport header alone. Fill one from memory and you have quietly rebuilt the session you were told to delete.',
      },
      {
        heading: 'resultType, cache hints, and server identity',
        body: 'Every successful modern result carries resultType. An ordinary final answer uses "complete". Six methods are cacheable and therefore also carry ttlMs and cacheScope: tools/list, resources/list, prompts/list, resources/templates/list, resources/read, and server/discover. A safe default is ttlMs: 0 and cacheScope: "private".\n\nServers should also stamp their own identity into result _meta as io.modelcontextprotocol/serverInfo, useful for diagnostics but never a substitute for real authentication. List results should sort by a stable key so identical inputs produce identical cache keys and identical model context, rather than a fresh shuffle on every call.',
      },
      {
        heading: 'server/discover: mandatory, but optional to call',
        body: 'Every modern server must implement server/discover. Its result carries supportedVersions, capabilities, optional usage instructions, server identity, and cache hints, everything a client would once have learned only from a successful initialize.\n\nThe difference is that nothing forces a client to call it first. Because tools/list already carries its own protocol version and capabilities in _meta, a client can send it as the very first message and the server can validate and answer it on its own terms. Discovery is a convenience for building a stable snapshot before rendering a UI, not a gate a client must pass through before anything else works.',
      },
      {
        heading: 'Error codes replace ceremony',
        body: 'Where the old model failed a handshake, the new model fails one request. An unsupported protocol version returns JSON-RPC code -32022 with data shaped as {requested, supported}, and the client picks a mutually supported version and retries with a new request id. Missing or malformed _meta is invalid params, code -32602.\n\nTwo more codes, -32020 for a header-body mismatch and -32021 for a missing required capability, belong to the HTTP transport specifically and get their full treatment in lesson 13.09. The pattern across all four: the failure names exactly what was wrong with this one request, never a vague dropped connection.',
      },
      {
        heading: 'The legacy branch, kept deliberately separate',
        body: 'Versions through 2025-11-25 still use initialize, notifications/initialized, and connection-scoped capabilities. That is the exchange the diagram above shows, and it remains relevant wherever an old server is still running.\n\nA dual-era implementation keeps that handshake as an isolated compatibility branch beside the stateless modern core, never as the default path. It is selected only through an explicit fallback decision, never sent by default to a server that has already proven, through a recognized modern error, that it speaks the current vocabulary. Lesson 13.08 covers exactly how a client tells a genuinely old server apart from a modern one having a bad day.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p13-06-inline-request.svg',
        alt: 'A single self-describing request replaces a shared session',
        caption: 'Every 2026-07-28 request repeats its own protocol version and capabilities; nothing is inherited from a previous call.',
        diagramBrief:
          'Two side-by-side panels on cream paper background. Left panel labeled "Legacy, through 2025-11-25": three stacked boxes reading initialize, notifications/initialized, tools/call, joined by one vertical line labeled "one session". Right panel labeled "Modern, 2026-07-28": three separate boxes reading tools/list, tools/call, resources/read, each with its own small tag reading "_meta: version + capabilities", no connecting line, each pointing independently to a server icon. Monochrome ink, one accent color on the three modern tags.',
      },
      {
        src: '/lessons/p13-06-inline-primitives.svg',
        alt: 'Three primitives survive, three retire',
        caption: 'Tools, resources, and prompts remain server primitives; roots, sampling, and logging are deprecated in favor of explicit inputs, direct provider calls, and stderr.',
        diagramBrief:
          'A two-column table rendered as a diagram, cream paper background, black ink. Left column header "Still standing": tools, resources, prompts, each row with a small checkmark. Right column header "Retired": roots, sampling, logging, each row with a small arrow pointing to its replacement label (explicit input, direct provider API, stderr / OpenTelemetry). One accent color on the checkmarks only.',
      },
    ],
    takeaways: [
      'Six primitives, and every MCP feature belongs to exactly one: tools, resources, prompts on the server; roots, sampling, elicitation on the client.',
      'The initialize handshake is the feature gate for the whole session. Render capabilities per server, because the same server is differently capable in different hosts.',
      'Notifications have no id and must never be answered. notifications/tools/list_changed makes the tool list live data, so the picker needs a re-fetch path.',
      'The spec revision is a negotiated value, not a constant. 2025-11-25 adds async Tasks, URL-mode elicitation, sampling with tools, and incremental scope consent.',
    ],
    terms: [
      { term: 'MCP', gloss: '"the plumbing that lets a chatbot use tools"', meaning: 'An open protocol standardizing how a model host discovers and invokes external tools, resources, and prompt templates, independent of transport.' },
      { term: 'Stateless core', gloss: '"no connection to keep open"', meaning: 'In the 2026-07-28 revision, every request supplies its own protocol version and capabilities; no protocol session persists between requests.' },
      { term: '_meta', gloss: '"some extra metadata"', meaning: 'The required object inside params on every modern request, carrying protocolVersion, clientCapabilities, and a recommended clientInfo.' },
      { term: 'server/discover', gloss: '"a handshake replacement"', meaning: 'The mandatory modern method returning supported versions, capabilities, instructions, and cache hints; optional for a client to call before another method.' },
      { term: 'resultType', gloss: '"just a status field"', meaning: 'The required discriminator on every successful modern result; an ordinary response uses "complete".' },
      { term: 'cacheScope', gloss: '"how long to cache it"', meaning: 'Declares who may share a cached result: "public" for any authorized caller, "private" for the requesting credential only.' },
      { term: 'MRTR', gloss: '"the server asking a follow-up question"', meaning: 'Multi Round-Trip Request: the pattern that replaced elicitation, where a handler returns input_required and the client retries the original call with a new id.' },
      { term: 'Legacy era', gloss: '"the old version of MCP"', meaning: 'Revisions through 2025-11-25 that use initialize, notifications/initialized, and connection-scoped capabilities, still served through an isolated compatibility branch.' },
      { term: '-32022', gloss: '"a version error"', meaning: 'The JSON-RPC error code for an unsupported protocol version, returned with the requested version and the list of supported ones.' },
      { term: 'Deterministic list', gloss: '"the tools show up in some order"', meaning: 'A list result such as tools/list with stable item ordering, so identical inputs produce identical cache keys.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Write the params._meta object a client must attach to a tools/list request for protocol version 2026-07-28, with clientInfo name "design-tool" and version "1.0.0".' },
      { level: 'medium', prompt: 'A server receives a request declaring protocolVersion 2027-01-01 and supports only 2026-07-28. Write the JSON-RPC error the server returns, including its code and data fields.' },
      { level: 'hard', prompt: 'A client used to cache "the server supports sampling" after initialize and skip re-checking it on later calls. Explain exactly what breaks when that same client is pointed at a load-balanced, stateless 2026-07-28 server, and what the client must do instead on every request.' },
      { level: 'design', prompt: 'Sketch the connection indicator for an MCP server list in a host app, given that there is no more persistent session to reflect. What does the dot mean now, and how often does it have to refresh to stay honest?' },
    ],
    furtherReading: [
      { label: 'MCP Architecture, specification 2026-07-28', url: 'https://modelcontextprotocol.io/specification/2026-07-28/architecture', why: 'The canonical description of the stateless core and which primitives it kept.' },
      { label: 'MCP Base Protocol, specification 2026-07-28', url: 'https://modelcontextprotocol.io/specification/2026-07-28/basic', why: 'The JSON-RPC envelope, the required _meta fields, and the full error code table.' },
      { label: 'MCP Server Discovery', url: 'https://modelcontextprotocol.io/specification/2026-07-28/server/discover', why: 'The exact request and result shape for the mandatory discovery method.' },
      { label: 'MCP 2026-07-28 Changelog', url: 'https://modelcontextprotocol.io/specification/2026-07-28/changelog', why: 'What changed relative to 2025-11-25, in the spec authors\' own words.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Stateless MCP integration audit',
      body: '- Does every outgoing request build its own _meta block, or does some code path reuse one saved from an earlier call?\n- Does any part of the client assume a previously declared capability still holds on a later request?\n- Is server/discover implemented, and is it treated as optional to call rather than a required gate?\n- Do the six cacheable results (tools/list, resources/list, prompts/list, resources/templates/list, resources/read, server/discover) carry ttlMs and cacheScope?\n- Is the legacy initialize branch isolated behind an explicit allowlist, never the default path for a new peer?',
    },
    demoCaption:
      'Same four messages, two orderings. Calling tools/call before notifications/initialized is the bug that makes a server look broken on first connect: the handshake has not closed, so the capability set the call depends on is not agreed yet.',
    demo: {
      archetype: 'sequence',
      subject: 'MCP session start',
      badLabel: 'Skipped handshake',
      goodLabel: 'Spec lifecycle',
      badSequence: [
        'client sends initialize',
        'client sends tools/call immediately',
        'server rejects: capabilities not agreed',
        'client sends notifications/initialized',
      ],
      goodSequence: [
        'client sends initialize with its capabilities',
        'server returns capabilities, serverInfo, protocolVersion',
        'client sends notifications/initialized',
        'client sends tools/list, then tools/call',
      ],
      badCaption:
        'Firing a call the moment initialize goes out treats the handshake as a formality. It is the contract: until notifications/initialized closes it, neither side knows which methods are legal, and the failure surfaces as a dead server rather than a protocol error the user can read.',
      goodCaption:
        'initialize, response, initialized, then discovery. Discovery is a separate step for a reason: tools/list is live data and can change mid-session via notifications/tools/list_changed, so it is a fetch you repeat, not a constant you read once.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'MCP is six primitives and one message pair that decides what you are allowed to do.',
        body:
          'MCP is six primitives and one message pair that decides what you are allowed to do.\n\nserver: tools, resources, prompts.\nclient: roots, sampling, elicitation.\n\ninitialize is the gate. no sampling declared by the client means the server may never call sampling/createMessage. no resources.subscribe from the server means the client may never subscribe.\n\nthat symmetry is the whole reason 10,000 servers run in 300 clients.',
      },
      {
        kind: 'X · design angle',
        hook: 'capability negotiation is a UI problem, not a protocol footnote.',
        body:
          'capability negotiation is a UI problem, not a protocol footnote.\n\nthe same MCP server is fully wired in one host and half dark in another, because the client decides what it lends.\n\nso the surface is a per-server capability row, not a settings page. and the tool list is live: notifications/tools/list_changed means your picker needs a re-fetch path, not a mount-time fetch.',
      },
      {
        kind: 'X · one-liner',
        hook: 'MCP has no shutdown method.',
        body:
          'MCP has no shutdown method.\n\nthree lifecycle phases and only two of them are messages. phase three is the transport closing.\n\nwhich means your disconnected state is inferred from EOF, not announced. design it that way.',
      },
    ],
    source: {
      label: 'Full lesson: 13.06 06-mcp-fundamentals',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/13-tools-and-protocols/06-mcp-fundamentals',
    },
  },
  {
    id: 'p13-07-mcp-server',
    phase: 'Phase 13 · Tools and Protocols',
    part: 'Part 2 · MCP, end to end',
    index: '13.07',
    title: 'A server is a dispatch loop and a set of typed content blocks',
    oneLiner:
      'A working MCP server is still a dict of method name to handler and tool results returned as typed content blocks, but the 2026-07-28 dispatch loop revalidates protocol version and client capabilities on every single message. About 180 lines of stdlib, none of them allowed to remember what the last request said.',
    readTime: '~10 min read',
    diagram: '/lessons/p13-07.svg',
    diagramCaption:
      'The stdio dispatch loop: one JSON object per line in, handler lookup by method name, one response per id out.',
    whyItMatters:
      'Two things you author on the server land directly in someone\'s interface. Annotations, readOnlyHint, destructiveHint, idempotentHint, openWorldHint, are what a host reads to decide whether a call runs silently or raises a confirmation gate, so you are writing the permission UX from inside the tool definition. The error split still holds: a JSON-RPC error belongs to the client\'s plumbing, content plus isError true belongs in the model\'s context and the trace row. What is new in 2026-07-28 is that every list result you return carries a ttlMs, so a host that surfaces "last synced a moment ago" text under a tool picker is reading a number you chose, not rendering a guess.',
    learningObjectives: [
      'Implement server/discover as a mandatory method that advertises versions, capabilities, and cache hints without gating anything.',
      'Validate protocolVersion and clientCapabilities on every incoming request instead of caching them from an earlier one.',
      'Return content blocks, never bare strings, and split protocol errors from tool errors correctly.',
      'Author annotations, readOnlyHint, destructiveHint, idempotentHint, openWorldHint, that a host can turn into a confirmation dialog.',
      'Replace a server-initiated request with an input_required result the client can retry.',
    ],
    sections: [
      {
        heading: 'The problem: stdio is still the whole local story',
        body: 'Before a remote transport or an auth layer, you need a clean local server, and local still means stdio. The client spawns your server as a child process and messages flow newline-delimited over stdin and stdout, one JSON object per line, no length prefixes, no framing tricks.\n\nWhat changed underneath that familiar shape is what counts as a valid message. There is no more handshake to open before the first real call. The first line your server reads over stdin might already be tools/call, and it has to be just as ready to validate that line\'s _meta as it would be for the hundredth.',
      },
      {
        heading: 'The loop, now revalidating every line',
        body: 'Read a line, parse it, branch on whether it has an id. Has an id means request, so write exactly one response carrying the same id. No id means notification, so handle it and write nothing.\n\nThe rules that used to matter still do: stdout carries only JSON-RPC, logs go to stderr, flush after every write, exit cleanly on EOF. One rule is stricter now: params._meta must be checked against this message, never assumed from the last one. The dispatcher is still a dict from method name to handler function; the handler itself just cannot lean on any memory of a prior call.',
      },
      {
        heading: 'server/discover is mandatory, not a bootstrapping step',
        body: 'Every modern server implements server/discover. A complete result reports supportedVersions, a capabilities object, optional instructions, cache hints, and server identity in _meta, everything a client would once have learned only from a successful initialize.\n\nBut nothing requires a client to call it first, and nothing requires your server to wait for it. A client can send tools/list as its opening move because that request already carries protocolVersion and clientCapabilities. Declaring a capability you never actually implement, say resources.subscribe true with no working notification path, is worse than not declaring it: the client gates real behavior on that flag.',
      },
      {
        heading: 'The result wrapper: resultType, identity, and cache hints on one path',
        body: 'Every successful result needs resultType: "complete" and, for list and read methods, ttlMs plus cacheScope. The cleanest way to guarantee that is one wrapper function every handler routes through, something like a complete() helper that stamps resultType and server identity onto whatever payload the handler produced.\n\nCentralizing that wrapper is not ceremony. It is the difference between an occasional handler that forgets a required field and a server where every response, without exception, tells the client how fresh it is and who sent it.',
      },
      {
        heading: 'The result: content blocks, not strings',
        body: 'tools/call returns { content: [blocks], isError }. A block is typed: {type: "text", text}, {type: "resource", resource: {uri, text}}, {type: "image", data, mimeType}. Lesson 13.14 adds a UI block on top of that same list.\n\nEvery tool executor returns a list, never a bare string. The block type is what tells the host how to render the result: a text row, an attachment chip, an inline image, an iframe. Returning a stringified image is how a tool ends up rendering as a wall of base64 in someone\'s chat.',
      },
      {
        heading: 'Annotations are permission UX, still authored server side',
        body: 'Each tool can carry annotations. readOnlyHint true means safe to retry. destructiveHint true means irreversible, so the client should confirm before running it. idempotentHint true means same inputs, same outputs. openWorldHint true means it touches an external system. Hosts use these for confirmation dialogs, status indicators, and gateway routing.\n\nOne nuance worth stating plainly: annotations remain hints, not enforcement. A host can choose to skip the confirmation dialog. Your server must still check real authorization inside the handler, because the annotation only shapes what the user is asked, never what the server is allowed to do.',
      },
      {
        heading: 'No more server-initiated requests',
        body: 'Under the old handshake era, a server that declared sampling could push its own sampling/createMessage request to the client mid-call. A modern server cannot originate an independent JSON-RPC request at all.\n\nWhen a handler needs input it does not have, it returns an input_required result instead. The client fulfills the embedded request and retries the original method with a new id. That single change removes an entire class of server-to-client concurrency bugs: there is no longer a server-originated request competing with the client\'s own read loop for attention.',
      },
      {
        heading: 'The graduation: FastMCP and the TypeScript SDK',
        body: 'The stdlib version of this server is around 180 lines. FastMCP collapses it to decorators, an @app.tool() over a typed function, and lands under 80, with the TypeScript SDK offering the equivalent shape.\n\nThe wire behavior has to stay identical after the port: same _meta validation, same resultType and cache hints, same content blocks, same annotations. Re-run your test suite after switching frameworks rather than trusting that a shorter file means the same contract.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p13-07-inline-contentblocks.svg',
        alt: 'Content block types and what they render as',
        caption: 'A tool result is a list of typed blocks; the block type, not the tool name, decides how the host renders it.',
        diagramBrief:
          'A vertical stack of four labeled boxes on cream paper: {type: "text"} arrow to "chat row", {type: "resource"} arrow to "attachment chip", {type: "image"} arrow to "inline image", {type: "ui_resource"} arrow to "sandboxed iframe" (dashed, labeled "lesson 13.14"). Black ink, one accent color on the arrows.',
      },
      {
        src: '/lessons/p13-07-inline-errorsplit.svg',
        alt: 'Protocol error versus tool error',
        caption: 'A bad request fails at the plumbing layer; a valid call that failed fails inside the model\'s own context.',
        diagramBrief:
          'Two labeled paths branching from one box "tools/call received". Left path "malformed method or params" leads to a box "JSON-RPC error, code -32602" then to "client plumbing / retry logic". Right path "valid call, handler failed" leads to a box "content[] + isError: true" then to "model context + trace row". Cream background, black ink, one accent color distinguishing the two path labels.',
      },
    ],
    takeaways: [
      'stdout is the protocol. One JSON object per line, flush after every write, and every debug log goes to stderr or you corrupt the stream.',
      'Protocol errors and tool errors are different components. JSON-RPC error for bad method or params, content plus isError true for a valid call that failed.',
      'Annotations are permission UX authored server side. destructiveHint true is what makes a host raise a confirmation gate instead of running silently.',
      'Tool results are typed content blocks, never strings. The block type is how the host decides between a text row, an attachment, an image, or an iframe.',
    ],
    terms: [
      { term: 'stdio transport', gloss: '"the local mode"', meaning: 'The transport where the client spawns the server as a child process and both exchange newline-delimited JSON over stdin and stdout.' },
      { term: 'Dispatcher', gloss: '"the switch statement"', meaning: 'A map from JSON-RPC method name to handler function, the core of any MCP server regardless of transport.' },
      { term: 'Request revalidation', gloss: '"checking the token again"', meaning: 'The requirement that a stateless server confirm protocolVersion and clientCapabilities on every incoming message rather than caching them from an earlier one.' },
      { term: 'Complete result wrapper', gloss: '"a helper function"', meaning: 'A single code path that stamps resultType, server identity, and required cache hints onto every successful response so no handler can omit a field.' },
      { term: 'Content block', gloss: '"the reply text"', meaning: 'A typed element of a tool result: text, image, resource, or a UI resource, each rendered differently by the host.' },
      { term: 'isError', gloss: '"it failed"', meaning: 'A flag on a tool result meaning the tool ran and failed, distinct from a protocol-level JSON-RPC error.' },
      { term: 'Annotations', gloss: '"tags on a tool"', meaning: 'Per-tool safety hints, readOnly, destructive, idempotent, openWorld, that hosts turn into confirmation and routing behavior, never enforcement.' },
      { term: 'FastMCP', gloss: '"the easy way to write a server"', meaning: 'The decorator-based Python framework wrapping the raw protocol, with an equivalent shape in the TypeScript SDK.' },
      { term: 'input_required', gloss: '"the server needs more info"', meaning: 'The result a handler returns instead of sending its own JSON-RPC request; the client fulfills it and retries with a new id.' },
      { term: 'Deterministic ordering', gloss: '"the list looks the same each time"', meaning: 'Stable item order in a list result so identical inputs produce identical cache keys and stable model context.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Write the annotations object for a tool that deletes a note: which of readOnlyHint, destructiveHint, idempotentHint, openWorldHint should be true, and why does destructiveHint alone decide whether a host asks for confirmation?' },
      { level: 'medium', prompt: 'Sketch the complete() wrapper function in pseudocode. It must stamp resultType and server identity on every payload, and add ttlMs plus cacheScope only for list and read results.' },
      { level: 'hard', prompt: 'A server caches clientCapabilities in a module-level variable the first time it sees a request, then reuses it for every later call in the same process. Name the exact bug this causes once the process serves two different clients, and rewrite the check so it cannot happen.' },
      { level: 'design', prompt: 'A host renders a confirmation dialog only when destructiveHint is true, but a badly annotated tool set idempotentHint true on a delete action. Design the review step a host team should run before trusting a third-party server\'s annotations at all.' },
    ],
    furtherReading: [
      { label: 'MCP Specification 2026-07-28', url: 'https://modelcontextprotocol.io/specification/2026-07-28/', why: 'The full server-side contract this lesson compresses: discovery, tools, resources, prompts, and results.' },
      { label: 'MCP Server Discovery', url: 'https://modelcontextprotocol.io/specification/2026-07-28/server/discover', why: 'The exact discovery result shape, including cache hints and identity metadata.' },
      { label: 'MCP Tools', url: 'https://modelcontextprotocol.io/specification/2026-07-28/server/tools', why: 'The full annotation vocabulary and the content block types a tool result can carry.' },
      { label: 'MCP stdio Transport', url: 'https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/stdio', why: 'The framing rules, stdout discipline, and EOF behavior for a local server.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Server response wrapper checklist',
      body: '- Does every handler route through one wrapper that stamps resultType: "complete" and server identity?\n- Do tools/list, resources/list, prompts/list, resources/templates/list, and resources/read all carry ttlMs and cacheScope?\n- Does every tool executor return content[] blocks, never a bare string?\n- Are annotations set per tool, and does destructiveHint true actually correspond to an irreversible action?\n- Does any handler still try to send its own JSON-RPC request instead of returning input_required?',
    },
    demoCaption:
      'The tool list shows a name and a description. Expanding one shows what the host actually consumes: the input schema it validates against, the annotations that decide whether a confirmation gate appears, and the block types the result can contain.',
    demo: {
      archetype: 'reveal',
      subject: 'tools/list entry',
      badLabel: 'What the picker shows',
      goodLabel: 'What the host consumes',
      opaqueLabel: 'notes_delete: remove a note by id',
      revealedLines: [
        'inputSchema: { id: string, required }',
        'annotations.destructiveHint: true',
        'annotations.idempotentHint: true',
        'annotations.openWorldHint: false',
        'result: content[] blocks + isError',
        'failure path: isError true, not a JSON-RPC error',
      ],
      badCaption:
        'A name and a one-line description is what a tool picker renders, and it is not enough to decide anything. Nothing here tells the host that this call is irreversible, so nothing tells it to raise a confirmation before running.',
      goodCaption:
        'destructiveHint true is the flag the confirmation gate hangs off. inputSchema is what the client validates before it ever reaches your handler. And the failure path is content plus isError, which keeps the reason inside the model\'s context instead of only in a toast the model cannot read.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'an MCP server is a dict and a while loop.',
        body:
          'an MCP server is a dict and a while loop.\n\nread a line from stdin. parse json. has an id, write one response with that id. no id, it is a notification, write nothing.\n\nthree rules kill most bugs:\nstdout carries only JSON-RPC, logs go to stderr.\nflush after every write.\nexit on EOF, the client owns your lifetime.\n\n180 lines stdlib. under 80 with FastMCP.',
      },
      {
        kind: 'X · design angle',
        hook: 'you write the confirmation dialog from inside the tool definition.',
        body:
          'you write the confirmation dialog from inside the tool definition.\n\nannotations.destructiveHint true is what makes a host stop and ask. readOnlyHint true is what makes it retry silently.\n\nfour booleans, authored server side, and they decide whether the user gets a gate or a surprise.\n\nsame with errors. protocol error goes to the plumbing. tool failure comes back as content plus isError true, which means the model can read the reason. a toast cannot.',
      },
      {
        kind: 'X · one-liner',
        hook: 'never return a string from a tool.',
        body:
          'never return a string from a tool.\n\ntools/call returns typed content blocks: text, image, resource, ui. the type is how the host picks between a text row, an attachment chip, and an iframe.\n\nstringify an image and you have shipped a wall of base64 into someone\'s chat.',
      },
    ],
    source: {
      label: 'Full lesson: 13.07 07-building-an-mcp-server',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/13-tools-and-protocols/07-building-an-mcp-server',
    },
  },
  {
    id: 'p13-08-mcp-client',
    phase: 'Phase 13 · Tools and Protocols',
    part: 'Part 2 · MCP, end to end',
    index: '13.08',
    title: 'The client side is namespace merging and a non-blocking reader',
    oneLiner:
      'A host merges tool catalogs from several MCP peers into one namespace, and that used to be the hard part. On the stateless 2026-07-28 core the harder part is telling a genuinely legacy server from a modern one having a bad day, since both can produce the exact same timeout.',
    readTime: '~10 min read',
    diagram: '/lessons/p13-08.svg',
    diagramCaption:
      'Three servers, three sessions, one merged tool namespace, and a dispatch table from tool name back to the owning session.',
    whyItMatters:
      'The merged namespace is the model\'s tool picker, and it is also a per-peer health surface you have to render. Each peer carries independent state, its era and version, its last discovered tool list, its pending request ids, and whether it is alive, so that is a state machine per row, not one global spinner: spawning, discovering, ready, degraded, dead. Collision policy is still a real design choice with visible outcomes: prefix on collision keeps names honest, silent overwrite hides a shadowed tool and is a security hole wearing a convenience costume, rejection fails loudly and is the right default for anything that spends money. The newest failure mode is quieter: downgrading a modern server to legacy behavior by mistake, which a user experiences as a tool that suddenly asks for permissions it never used to need.',
    learningObjectives: [
      'Build a per-peer record, transport handle, era, capabilities, tool list, pending ids, instead of a shared client-side session object.',
      'Stamp fresh _meta onto every outgoing request rather than reusing a value saved from a previous call.',
      'Classify a server\'s response to a discovery probe as modern, recognized-modern-error, or ambiguous, and act correctly on each.',
      'Explain why an allowlist grants permission to probe for legacy behavior, not evidence that a peer is legacy.',
      'Apply a collision policy, prefix, reject, or never silent overwrite, when two peers expose the same tool name.',
    ],
    sections: [
      {
        heading: 'The problem: one host, many peers',
        body: 'A real host, Claude Desktop, Cursor, Goose, Gemini CLI, has a filesystem server, a Postgres server, and a GitHub server running at once. The client\'s job is six things: discover each peer independently, merge their tool lists into one flat namespace, route an incoming call by name to the peer that owns it, handle notifications from any peer without blocking, reconnect when a transport dies, and, now, decide whether a given peer even speaks the modern protocol at all.\n\nThe SDKs wrap most of this. The mental model still has to be yours, because every failure you debug lives in one of those six jobs.',
      },
      {
        heading: 'The peer record replaces the session',
        body: 'Keep one record per server process or endpoint, not a shared session object. A peer carries a transport handle or send function, its selected protocol era and version, its last discovered capabilities, its last deterministic tool list, and a pending map from request id to the future waiting on it.\n\nThat is client-side bookkeeping, not protocol state. The server still receives fresh version and capability metadata on every request regardless of what this record remembers. The pending map is what makes concurrency work: a call to peer A must never block a call in flight to peer B.',
      },
      {
        heading: 'Build every request from scratch',
        body: 'A helper that stamps a fresh _meta object onto every outgoing request, protocolVersion, clientCapabilities, clientInfo, prevents the most common client bug: attaching metadata once to a connection object and assuming it reached the wire on every later call.\n\nStamp and inspect the final serialized request, not the object you built it from. If a request is missing its _meta by the time it hits the transport, no amount of correct bookkeeping in the peer record saves you.',
      },
      {
        heading: 'Discovery is a recommended first move, not a gate',
        body: 'On stdio especially, sending server/discover before anything else creates a clean boundary between eras. Some legacy servers will accept an operation before initialization and produce an ambiguous success; discovery avoids that trap by asking the question directly.\n\nA modern peer answers with supportedVersions, capabilities, and identity. The client selects the highest mutually supported version and proceeds with per-request metadata from there. Nothing about this step is a gate the server enforces; it is a client-side convenience for building a clean startup sequence.',
      },
      {
        heading: 'Legacy detection: three outcome classes',
        body: 'A discovery probe returns one of three kinds of evidence. A DiscoverResult means the peer is modern; pick a version and continue. A recognized modern error, -32020 header mismatch, -32021 missing capability, -32022 unsupported version, still means the peer is modern; correct the request or retry an advertised version, never send initialize.\n\nAn ambiguous signal, an unrecognized error, a timeout, a connection close, an empty response, identifies nothing. Treating every one of these as legacy evidence is how a client downgrades a modern server by accident. Fail closed unless this exact peer is explicitly configured for legacy compatibility.',
      },
      {
        heading: 'Allowlisting is operator intent, not evidence',
        body: 'Legacy compatibility must be an explicit property of one pinned peer, bound to its exact configured command or endpoint, never a wildcard an arbitrary server can opt into. A peer without that flag fails after an ambiguous outcome and never receives initialize.\n\nThe allowlist only grants permission to probe. The client still sends one bounded initialize under a deadline and requires a structurally valid positive result, a matching response id, an object capabilities field, a non-empty serverInfo, before it selects the legacy era. A timeout or malformed result still fails closed, allowlisted or not.',
      },
      {
        heading: 'Collision-safe namespace merge',
        body: 'Two peers can both expose search. There are exactly three answers. Prefix by server name, notes/search, files/search, clear and a little ugly, and what Claude Desktop and VS Code do. Silent first-come, the later peer\'s search overrides the earlier one, cheap and dangerous, because the user thinks they are calling one tool and are calling another. Collision rejection, refuse to load the second peer and say so, what Cursor does, and the right default for anything security-sensitive.\n\nStore both the canonical and local names. The model sees the canonical one; the outgoing call uses the local name the owning peer actually declared.',
      },
      {
        heading: 'Subscriptions replace the old push model',
        body: 'Change notifications now arrive only on a client-opened subscriptions/listen stream, not a standalone push channel. The client sends a notifications filter, waits for notifications/subscriptions/acknowledged, and correlates every later event by the subscription id, which is simply the original listen request\'s id.\n\nWhen that stream drops, there is no resume. The client opens a new subscriptions/listen with a new request id and refetches whatever it needs. Build your reconnection logic around re-listening, not around replaying a dropped stream from where it left off.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p13-08-inline-decision.svg',
        alt: 'Three outcome classes from a discovery probe',
        caption: 'Only one of three discovery outcomes is real evidence of a legacy server; the other two are ambiguous and must fail closed.',
        diagramBrief:
          'A decision tree diagram on cream paper. Top box "server/discover sent". Three branches down: branch 1 "DiscoverResult returned" leads to a box "modern, select version" (accent color, solid line). Branch 2 "-32020 / -32021 / -32022 returned" leads to a box "still modern, correct and retry" (accent color, solid line). Branch 3 "timeout / connection close / unrecognized error" leads to a box "ambiguous: fail closed unless allowlisted" (dashed line, no accent). Black ink throughout, one accent color reserved for the two "modern" outcomes.',
      },
      {
        src: '/lessons/p13-08-inline-peer.svg',
        alt: 'A peer record replaces a shared session object',
        caption: 'Client-side bookkeeping per server, not one global connection state.',
        diagramBrief:
          'Three small boxes side by side labeled "files peer", "notes peer", "github peer", each containing five stacked lines of text: transport handle, era + version, capabilities, tool list, pending ids. Below all three, one shared box labeled "merged namespace" with arrows up into each peer box. Cream paper, black ink, one accent color on the "merged namespace" box.',
      },
    ],
    takeaways: [
      'One Session per server: process handle, declared capabilities, last tool list, pending request ids. There is no global client state that means anything.',
      'Collision policy is a visible design decision. Prefix keeps names honest, silent first-come hides a shadowed tool, rejection fails loudly and is right for anything that spends money.',
      'A background reader thread draining stdout into a queue is structural, not an optimization. Awaiting a call on the read loop is how notifications get lost.',
      'On stdio the process identity is the session and EOF is the only death signal, so a dead server is inferred, never announced.',
    ],
    terms: [
      { term: 'Peer', gloss: '"the connection to a server"', meaning: 'A client-side record for one server transport, its era, its discovered capabilities, and its tool list, distinct from any protocol-level session.' },
      { term: 'Protocol era', gloss: '"which version it speaks"', meaning: 'Whether a peer uses the modern 2026-07-28 per-request metadata or the legacy connection-scoped initialization from a version through 2025-11-25.' },
      { term: 'Recognized modern error', gloss: '"an error code we understand"', meaning: 'A -32020, -32021, or -32022 response that proves the peer is modern and forbids falling back to legacy initialize.' },
      { term: 'Legacy allowlist', gloss: '"servers we trust to be old"', meaning: 'Operator configuration permitting one bounded legacy compatibility probe for a specific, pinned peer, never a wildcard.' },
      { term: 'Positive legacy evidence', gloss: '"proof it is really old"', meaning: 'A valid, correlated initialize result for an explicitly supported legacy revision, the only thing that selects the legacy era.' },
      { term: 'Merged namespace', gloss: '"the tool list the model sees"', meaning: 'The flat set of canonical tool names across every active peer after collision resolution.' },
      { term: 'Collision policy', gloss: '"what happens when two tools share a name"', meaning: 'The prefix, reject, or never-silent-overwrite rule a client applies when two peers expose the same tool name.' },
      { term: 'subscriptions/listen', gloss: '"how you get live updates"', meaning: 'A client-opened, long-lived request whose response stream delivers only the notification types the client explicitly requested.' },
      { term: 'Era cache', gloss: '"remembering which version a server uses"', meaning: 'The selected modern or legacy behavior stored for one peer for the life of its transport, cleared on restart or reconnect.' },
      { term: 'Transport recovery', gloss: '"reconnecting"', meaning: 'Restarting or reconnecting a broken peer, then rediscovering, relisting, and re-listening rather than resuming stale state.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Write the peer record fields you would keep for a newly spawned filesystem server before its first request completes.' },
      { level: 'medium', prompt: 'A discovery probe times out after three seconds. Given the peer is not on the legacy allowlist, what does the client do next, and what does it do differently if the peer is allowlisted?' },
      { level: 'hard', prompt: 'A client receives -32601 method not found from a discovery probe. Explain why this is not, by itself, positive legacy evidence, and what exactly the client must still verify before sending initialize to that peer.' },
      { level: 'design', prompt: 'Design the status chip for one row in a multi-server tool picker. It needs to represent spawning, discovering, ready, degraded, dead, and legacy-fallback without using six different colors. What do you collapse, and what do you keep distinct?' },
    ],
    furtherReading: [
      { label: 'MCP Specification 2026-07-28', url: 'https://modelcontextprotocol.io/specification/2026-07-28/', why: 'The full client-side contract: request construction, discovery, and error codes.' },
      { label: 'MCP Server Discovery', url: 'https://modelcontextprotocol.io/specification/2026-07-28/server/discover', why: 'The exact discovery result and error shapes a client must classify.' },
      { label: 'MCP Versioning', url: 'https://modelcontextprotocol.io/specification/2026-07-28/basic/versioning', why: 'How version negotiation and legacy compatibility are meant to interact.' },
      { label: 'MCP stdio Transport', url: 'https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/stdio', why: 'The framing rules a stdio peer record has to track alongside its era and capabilities.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Legacy vs modern peer decision checklist',
      body: '- Did this peer return a DiscoverResult, or a recognized -32020/-32021/-32022 error? Then it is modern, full stop.\n- Did this peer time out, close the connection, or return an unrecognized error? That is ambiguous, not legacy evidence.\n- Is this exact peer explicitly allowlisted for legacy probing, by pinned command or endpoint, not a wildcard?\n- Did the bounded initialize probe return a structurally valid result: matching id, object capabilities, non-empty serverInfo?\n- Is the selected era cached per peer and cleared on reconnect, rather than re-probed on every call?',
    },
    demoCaption:
      'One tool picker reads as a flat list of 7 tools. Underneath, those 7 belong to three independent sessions with independent liveness, so a single dead server takes a specific slice of the namespace down while the rest keeps working.',
    demo: {
      archetype: 'meter',
      subject: 'Merged tool namespace',
      headline: '7 tools available',
      breakdown: [
        { label: 'files server (ready)', value: 3 },
        { label: 'notes server (ready)', value: 3 },
        { label: 'github server (dead, EOF)', value: 1 },
      ],
      badCaption:
        '"7 tools available" is a roll-up over three processes that fail independently. When the github session hits EOF, one of those 7 starts returning nothing and the count keeps saying 7 until something re-reads the list.',
      goodCaption:
        'Group the picker by session and give each row its own state (spawning, handshaking, ready, degraded, dead). The count is per server, the retry is per server, and a collision between two servers named search becomes visible instead of silently shadowed.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'the hard part of MCP is not the server. it is merging namespaces.',
        body:
          'the hard part of MCP is not the server. it is merging namespaces.\n\na host runs a filesystem server, a postgres server, and a github server at once. three spawns, three handshakes, three tool lists, one flat namespace for the model.\n\nthen two of them both expose search.\n\nthree answers: prefix by server, silent first-come, or refuse to load. claude desktop and vs code prefix. cursor rejects.',
      },
      {
        kind: 'X · design angle',
        hook: 'silent first-come collision resolution is a security hole in a convenience costume.',
        body:
          'silent first-come collision resolution is a security hole in a convenience costume.\n\ntwo MCP servers expose search. the later one wins. the user thinks they are calling one tool and they are calling another.\n\nso the picker should not be a flat list. group by session, one state per row: spawning, handshaking, ready, degraded, dead.\n\non stdio there is no session id and no death message. EOF is the whole signal. your dead state is inferred.',
      },
      {
        kind: 'X · one-liner',
        hook: 'the client bug everyone writes once: awaiting a tools/call on the read loop.',
        body:
          'the client bug everyone writes once: awaiting a tools/call on the read loop.\n\nmeanwhile notifications/tools/list_changed is sitting unread in the stream and your tool list is stale for the rest of the session.\n\nbackground reader thread, queue, dispatch by id or method. structural, not an optimization.',
      },
    ],
    source: {
      label: 'Full lesson: 13.08 08-building-an-mcp-client',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/13-tools-and-protocols/08-building-an-mcp-client',
    },
  },
  {
    id: 'p13-09-mcp-transports',
    phase: 'Phase 13 · Tools and Protocols',
    part: 'Part 2 · MCP, end to end',
    index: '13.09',
    title: 'stdio for this machine, Streamable HTTP for the network',
    oneLiner:
      'Two transports, no overlap, and Streamable HTTP has already outgrown its own first redesign. The 2025-03-26 revision gave it a session id and a resumable stream; the 2026-07-28 revision deleted both, making every POST to /mcp a self-contained request with the routing headers to prove it.',
    readTime: '~10 min read',
    diagram: '/lessons/p13-09.svg',
    diagramCaption:
      'Streamable HTTP on one path: POST carries requests, GET and DELETE are gone, both replaced by request-scoped streams and subscriptions/listen.',
    whyItMatters:
      'Remote transport is where MCP stops being invisible to the interface, and the 2026-07-28 failure taxonomy is more precise than the one it replaced. A 400 with -32020 means your headers disagree with your body, a 400 with -32022 means the version is a real mismatch, a 403 means Origin was rejected, a 404 with -32601 means an unknown method, a 405 means somebody sent a GET or DELETE to an endpoint that no longer answers them, and stdio EOF means a dead child process. That is six distinct components, not one error toast. Hosting is a budget too: request-scoped SSE and subscriptions/listen both hold a connection open, and a serverless tier with a ten-second timeout cannot host either one.',
    learningObjectives: [
      'Trace the three-generation history of MCP\'s HTTP transport, from two-endpoint SSE, through session-scoped Streamable HTTP, to the stateless POST-only version.',
      'Implement the single /mcp endpoint accepting POST, returning application/json or a request-scoped text/event-stream.',
      'Validate that MCP-Protocol-Version, Mcp-Method, and Mcp-Name headers match the JSON-RPC body before checking anything else.',
      'Explain why Mcp-Session-Id and Last-Event-ID are ignored in 2026-07-28, and what replaced the behavior they used to carry.',
      'Open a subscriptions/listen stream and correctly reissue it with a new id after a drop, instead of attempting to resume it.',
    ],
    sections: [
      {
        heading: 'The problem: Streamable HTTP already had one redesign',
        body: 'The first remote transport, shipped 2024-11, was HTTP+SSE: one endpoint for the client\'s POSTs and a separate Server-Sent-Events channel for server-to-client traffic. It worked and it was clumsy, two endpoints per session, broken caches behind some CDNs, a hard dependency on long-lived SSE that aggressive WAFs terminate.\n\nThe 2025-03-26 revision replaced it with a Streamable HTTP that added a server-minted Mcp-Session-Id, a standalone GET stream, a DELETE teardown, and Last-Event-ID resumption. The 2026-07-28 revision removed all four of those additions. If a document still describes session ids or stream resumption as the current transport, it is describing the 2025-03-26 middle generation, not what ships today.',
      },
      {
        heading: 'stdio, mostly unchanged',
        body: 'The local binding still works the way it always has: the client writes one UTF-8 JSON-RPC message per line to stdin, the server writes one per line to stdout, diagnostics go to stderr, and the server exits promptly on stdin EOF. The process may live for many calls, but it was never a protocol session and it still is not one.\n\nThe one real change is that every modern message, not just the first, carries protocolVersion and clientCapabilities in params._meta. If the process exits unexpectedly, in-flight requests are simply lost; restart, rediscover, and retry safe operations with new request ids.',
      },
      {
        heading: 'One endpoint, POST only',
        body: 'A modern server exposes exactly one MCP endpoint, conventionally /mcp, accepting POST. Every JSON-RPC request or notification is a new POST carrying one message in its body. For a request, the server answers with either application/json holding a single response, or text/event-stream holding notifications related to that request followed by its final response. An accepted notification gets a bare 202 with no body.\n\nGET /mcp and DELETE /mcp both return 405 Method Not Allowed. There is no standalone stream to open and no session to tear down, because there is no session.',
      },
      {
        heading: 'Headers must mirror the body, exactly',
        body: 'Every modern POST carries MCP-Protocol-Version, Mcp-Method, and Mcp-Name headers, and each one must equal its corresponding value in the JSON-RPC body: protocolVersion, method, and name (or uri for resources/read). Header values are case-sensitive even though header names are not, and an unsafe or non-ASCII name uses an exact Base64 sentinel the server decodes before comparing.\n\nAny mismatch is HTTP 400 with JSON-RPC -32022 for a version the parties agree on but the server does not support, or -32020 for anything else that disagrees. Validate this order deliberately: shape first, then header-body agreement, then version support, so a proxy and the origin server can never interpret two different requests as the same one.',
      },
      {
        heading: 'Origin validation, stricter now',
        body: 'A browser making an unrelated page POST to localhost:1234/mcp is a real attack surface, because Origin: http://evil.com is a perfectly valid cross-origin value that same-origin policy does nothing to stop. Servers must reject any request whose Origin is present and not on an exact allowlist, returning 403.\n\nExact matching only. A prefix check like origin.startswith("https://trusted.example") is unsafe because it accepts attacker-controlled suffixes. Local servers should also bind to 127.0.0.1 rather than every interface, and Origin validation is never a substitute for real authentication on a network-facing endpoint.',
      },
      {
        heading: 'Long streams without a session: subscriptions/listen',
        body: 'A server may hold one request-scoped SSE stream open for a single long-running call, POST tools/call, receive notifications/progress related to that id, then the final JSON-RPC response, then the stream closes. It must never send an independent request on that channel.\n\nOngoing change notifications work differently: the client sends subscriptions/listen as a normal POST, and the response stays open as SSE. Its first message is notifications/subscriptions/acknowledged, its request id becomes the subscription id every later event carries, and a dropped stream is not resumed. The client reissues subscriptions/listen with a new id and refetches whatever it needs.',
      },
      {
        heading: 'Explicit state instead of hidden session state',
        body: 'Removing the protocol session does not forbid a workflow with state, it just moves that state out of the transport. A request lands on replica 1 and starts a draft in that process\'s memory; if the response never returns a handle for it, the next request lands on replica 2, which has valid protocol metadata but nothing to load the draft by.\n\nThe fix is a server-minted opaque handle returned as an ordinary tool result and passed back as an ordinary argument on later calls, bound to the authenticated principal, unguessable, expiring, and authorized on every use. That handle is application state, not a resurrected protocol session.',
      },
      {
        heading: 'Dual-era migration at the transport layer',
        body: 'A client supporting both eras sends a modern POST first. On 400, 404, or 405, it inspects the body: a recognized modern JSON-RPC error proves the server is modern, so the client corrects the request or retries an advertised version and never downgrades. Only an empty body or an unrecognized response may indicate a genuinely legacy HTTP+SSE server, and only then does the client try the old GET endpoint and expect its legacy endpoint event.\n\nA server migrating both eras keeps the modern POST-only path and a separate legacy branch, and never presents legacy GET, DELETE, session id, or replay behavior as if it were part of 2026-07-28.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p13-09-inline-timeline.svg',
        alt: 'Three generations of Streamable HTTP',
        caption: 'The transport has already been redesigned once, and the middle generation is the one most tutorials still describe.',
        diagramBrief:
          'A horizontal timeline on cream paper with three labeled stops. Stop 1, "2024-11, HTTP+SSE": two small boxes, POST endpoint and GET/SSE endpoint, joined by a dashed line. Stop 2, "2025-03-26, Streamable HTTP": one box with a small tag "Mcp-Session-Id", plus GET stream and DELETE icons. Stop 3, "2026-07-28, stateless": one box only, labeled "/mcp, POST only", with GET and DELETE icons crossed out. Accent color highlights stop 3 as current.',
      },
      {
        src: '/lessons/p13-09-inline-headers.svg',
        alt: 'Header and body values must mirror each other',
        caption: 'Three headers, three body fields, checked for equality before anything else happens.',
        diagramBrief:
          'Two parallel columns on cream paper. Left column "HTTP headers": MCP-Protocol-Version, Mcp-Method, Mcp-Name, each with a short arrow pointing right. Right column "JSON-RPC body": protocolVersion, method, name (or uri), each receiving an arrow. Between the columns, an equals sign for each pair, with a small red x replacing one equals sign on the "Mcp-Method" row to show a mismatch example, labeled "400, -32020" beside it. Black ink, one accent color on the equals signs.',
      },
    ],
    takeaways: [
      'stdio for this machine, Streamable HTTP over the network, and no crossover. Tunneling stdio with SSH or socat means you should have used HTTP.',
      'Session ids are server-minted, 128 bits or more, and echoed on every request. Client-chosen ids are rejected on purpose.',
      'Five transport failures, five components: retriable 502, silent SSE replay via last-event-id, 404 requiring a full re-handshake, Origin rejection, stdio EOF.',
      'Origin allowlisting is the DNS-rebinding defense and it is required by the spec, because a browser POST to localhost carries a valid cross-origin Origin.',
    ],
    terms: [
      { term: 'stdio', gloss: '"the local transport"', meaning: 'Newline-delimited JSON-RPC over a client-launched subprocess, functionally unchanged in 2026-07-28 except for per-message _meta.' },
      { term: 'Streamable HTTP (2026-07-28)', gloss: '"the current remote transport"', meaning: 'A single endpoint accepting POST only; every message is a new, self-contained request with no session id and no resumable stream.' },
      { term: 'Request-scoped SSE', gloss: '"streaming one answer"', meaning: 'A POST response stream carrying notifications related to one request followed by its final JSON-RPC response, then closing.' },
      { term: 'subscriptions/listen', gloss: '"getting live updates"', meaning: 'A client-opened long-lived POST request whose response stream delivers only the notification types the client explicitly requested.' },
      { term: 'Header mirroring', gloss: '"matching headers to the body"', meaning: 'The requirement that MCP-Protocol-Version, Mcp-Method, and Mcp-Name equal their JSON-RPC body counterparts, or the request fails with -32020.' },
      { term: 'Origin validation', gloss: '"checking where the request came from"', meaning: 'An exact-match allowlist defense against DNS rebinding, required on every incoming connection and never a substitute for authentication.' },
      { term: 'Explicit state handle', gloss: '"a token for a draft"', meaning: 'An application-level, server-minted token passed as an ordinary argument instead of relying on a removed protocol session.' },
      { term: 'Legacy HTTP+SSE', gloss: '"the old remote transport"', meaning: 'The 2024-11 two-endpoint transport, one POST endpoint and one separate SSE channel, kept only for compatibility.' },
      { term: 'Mcp-Session-Id (retired)', gloss: '"the old session header"', meaning: 'A server-minted session identifier from the 2025-03-26 revision, ignored and never minted or echoed in 2026-07-28.' },
      { term: 'Last-Event-ID (retired)', gloss: '"resuming a dropped stream"', meaning: 'The SSE resumption header from the 2025-03-26 revision; modern streams are not resumable, so a drop means reissue with a new request id.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Write the three required headers, with correct values, for a POST request calling resources/read on uri notes://note-1 under protocol version 2026-07-28.' },
      { level: 'medium', prompt: 'A client sends a GET request to /mcp expecting the old standalone stream. What HTTP status comes back, and what should the client do differently once it sees that response?' },
      { level: 'hard', prompt: 'Explain, using the replica-1-then-replica-2 scenario, exactly what a hidden protocol session used to paper over, and why an explicit state handle fixes it even when the two requests land on different machines.' },
      { level: 'design', prompt: 'Design the reconnect UI for a subscriptions/listen stream that just dropped. Given there is no resumption, what does the user see between the drop and the moment the new subscription is confirmed, and what happens to any events that occurred during the gap?' },
    ],
    furtherReading: [
      { label: 'MCP Transport Overview, specification 2026-07-28', url: 'https://modelcontextprotocol.io/specification/2026-07-28/basic/transports', why: 'The full comparison of stdio and Streamable HTTP as the two supported bindings.' },
      { label: 'MCP Streamable HTTP', url: 'https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http', why: 'The exact POST-only contract, header rules, and error codes this lesson compresses.' },
      { label: 'MCP Subscriptions', url: 'https://modelcontextprotocol.io/specification/2026-07-28/basic/patterns/subscriptions', why: 'The subscriptions/listen request and event shapes in full, including the acknowledgement message.' },
      { label: 'MCP 2026-07-28 Changelog', url: 'https://modelcontextprotocol.io/specification/2026-07-28/changelog', why: 'What the spec authors say was removed relative to the 2025-03-26 transport.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Streamable HTTP 2026-07-28 migration checklist',
      body: '- Does the server expose exactly one endpoint, accepting POST only, with GET and DELETE returning 405?\n- Are MCP-Protocol-Version, Mcp-Method, and Mcp-Name validated against the JSON-RPC body before anything else runs?\n- Is Mcp-Session-Id ignored rather than minted or echoed, and is Last-Event-ID ignored rather than used for resumption?\n- Is Origin checked with an exact allowlist match, never a prefix check, returning 403 on a mismatch?\n- Does any workflow state live in a server-minted handle passed as an argument, rather than in transport or connection affinity?',
    },
    demoCaption:
      'Same session, two transport generations. The middle generation needed a session header and could resume a dropped stream with Last-Event-ID; the current one keys everything to one path and treats a drop as something you reissue, not resume.',
    demo: {
      archetype: 'before-after',
      subject: 'Remote MCP session',
      badLabel: 'HTTP+SSE (legacy)',
      goodLabel: 'Streamable HTTP',
      badLines: [
        'POST /messages plus GET /sse, two endpoints',
        'no session header, endpoint pairing is the session',
        'dropped stream loses the events in the gap',
        'CDN caching breaks the SSE channel',
        'removal deadlines already passed in mid-2026',
      ],
      goodLines: [
        'POST, GET, DELETE on one path /mcp',
        'Mcp-Session-Id, server-minted, 128+ bits',
        'reconnect with last-event-id replays the gap',
        'Origin allowlist rejects rebinding attempts',
        'DELETE gives you a clean session teardown',
      ],
      badCaption:
        'Two endpoints means the session lives in the pairing between them, so there is nothing to echo on reconnect and nothing to revoke. A dropped SSE channel silently loses whatever the server pushed during the gap.',
      goodCaption:
        'One path and one session header make every recovery path nameable: last-event-id replays a dropped stream, 404 means re-handshake, DELETE is a clean teardown. Your reconnect state can distinguish resuming from starting over.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'MCP has two transports and zero overlap.',
        body:
          'MCP has two transports and zero overlap.\n\nstdio: child process, newline-delimited json on stdin and stdout, no session id because the process identity is the session.\n\nstreamable HTTP: one path. POST for requests, GET for the server-to-client stream, DELETE to tear down. all keyed by an Mcp-Session-Id the server mints at 128+ bits.\n\nif you are tunneling stdio over ssh, you wanted HTTP.',
      },
      {
        kind: 'X · design angle',
        hook: 'remote MCP gives you five failure states, and they are five components.',
        body:
          'remote MCP gives you five failure states, and they are five components.\n\n502 or 504 from the proxy: retry once, short backoff, no UI.\ndropped SSE stream: re-GET with last-event-id, replay the gap, still no UI.\n404: the server revoked your session, full re-handshake, and you lost state.\nOrigin rejected: the user has to fix config.\nstdio EOF: dead child process.\n\none error toast for all five is how reconnect becomes indistinguishable from starting over.',
      },
      {
        kind: 'X · one-liner',
        hook: 'Origin validation is the DNS-rebinding defense, and the spec requires it.',
        body:
          'Origin validation is the DNS-rebinding defense, and the spec requires it.\n\nan attacker\'s page can make a browser POST to localhost:1234/mcp. same-origin policy does not help, because Origin: http://evil.com is a valid cross-origin value.\n\nallowlist or you are exposing a local server to the web.',
      },
    ],
    source: {
      label: 'Full lesson: 13.09 09-mcp-transports',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/13-tools-and-protocols/09-mcp-transports',
    },
  },
  {
    id: 'p13-10-resources-prompts',
    phase: 'Phase 13 · Tools and Protocols',
    part: 'Part 2 · MCP, end to end',
    index: '13.10',
    title: 'Tool, resource, or prompt: the split decides the affordance',
    oneLiner:
      'Tools get most of the attention and cause most of the bad servers. If the model should call it on every related query it is a tool, if the user should attach it to a conversation it is a resource, if a whole workflow is the reusable unit it is a prompt, and 2026-07-28 adds a stateless subscription flow plus a stricter error for a URI nobody chose.',
    readTime: '~10 min read',
    diagram: '/lessons/p13-10.svg',
    diagramCaption:
      'Sorting one server\'s capabilities across the three primitives, with the host affordance each choice unlocks.',
    whyItMatters:
      'This is still the one MCP decision that is purely an IA call, made in server code. Pick tool and the capability is only reachable through model judgment, no picker entry, no attachment chip, no subscription. Pick resource and it appears in a host\'s attachment panel, becomes addressable by URI, and can be watched through subscriptions/listen so context refreshes when something changes outside the host. Pick prompt and it becomes a slash-command with an argument form, the only affordance where the user, not the model, initiates a multi-step workflow. What changed under the surface is precision: an unknown resource URI is now explicitly invalid parameters, not a quiet empty read, and every list you return carries a cache scope that decides whether it is safe to share across users.',
    learningObjectives: [
      'Apply the who-initiates test to sort a set of server capabilities into tools, resources, and prompts.',
      'Explain why resources/read must return -32602 for an unknown or invalid URI rather than a successful empty result.',
      'Design a resource template for a parameterized family of URIs without weakening authorization or validation.',
      'Choose ttlMs and cacheScope correctly for public versus user-specific content.',
      'Open a subscriptions/listen stream, correlate its events by subscription id, and re-read on a change notification rather than trusting the event payload.',
    ],
    sections: [
      {
        heading: 'The problem: wrapping every read in a tool',
        body: 'The naive notes server exposes notes_read, notes_list, notes_search, all as tools. Three consequences follow. Every data access now depends on the model deciding to call it, on every query that might benefit. Read-only content cannot be watched, so the host cannot refresh a side panel when it changes. And client UIs built specifically to surface data, an attachment panel, an include-file picker, have nothing to show, because those panels read resources, not tools.\n\nYou did not just pick an implementation detail. You removed three affordances the host would otherwise have given you for free.',
      },
      {
        heading: 'The rule: who initiates, and how often',
        body: 'The test starts from intent, not from what the code happens to do.\n\n| Primitive | Primary intent | Selection owner | Typical result |\n|---|---|---|---|\n| Tool | Perform an operation | Model or application | Structured action result |\n| Resource | Read content at a URI | Host, application, or user | Text or binary content |\n| Prompt | Start a reusable message workflow | User through host UI | One or more prompt messages |\n\nA note at notes://note-14 is a resource because it is addressable content. delete_note is a tool because it changes state. review_note is a prompt because a user chooses a prepared workflow. Many capabilities split into a pair this way: the resource is the content, the tool is what finds which one you wanted.',
      },
      {
        heading: 'Resources: stable URIs, not empty reads',
        body: 'resources/list returns a deterministic array of {uri, name, mimeType, description}. resources/read takes a URI and returns its contents. An unknown or invalid URI is not a successful empty result, it is JSON-RPC error -32602, invalid params, with the offending URI in the error data.\n\nThat distinction matters: it lets a client tell "nothing here" apart from "a valid document that happens to be empty," and it stops a client from silently falling back to a broader lookup when the exact address it asked for does not exist.',
      },
      {
        heading: 'Resource templates for unbounded families',
        body: 'A resource template describes a family of parameterized URIs, notes://projects/{project}/decisions/{decision}, used when listing every concrete item would be expensive or unbounded. It tells a client how to form a valid address without enumerating everything that exists.\n\nA template does not relax anything. Parse its variables, apply authorization, enforce length and character limits, and build storage queries with typed parameters. Never concatenate an arbitrary URI tail into a filesystem path or a database statement just because the shape is declared as a template.',
      },
      {
        heading: 'Content is not trusted instruction',
        body: 'Resource text can carry prompt injection, secrets, misleading commands, or malformed markup, because it came from wherever the server\'s data lives, not from a person the user necessarily trusts. The host should preserve provenance and treat resource content as data to be read, never as instructions to follow.\n\nOn the server side, that means limiting content size, returning an accurate mimeType, redacting fields the caller cannot access, and never returning unrelated records padded onto a legitimate one. The safest resource server assumes its own content will eventually be misread by something downstream.',
      },
      {
        heading: 'Prompts: user-controlled templates, not system prompts',
        body: 'prompts/list is deterministic for a given authorization context. Each prompt has a stable name, a useful description, and argument declarations the host turns into a form before calling prompts/get. That method resolves arguments into a message list, not a string, which a host may render as a slash-command, a menu item, or a workflow button.\n\nMCP prompts are not system prompts. A well-behaved host layers them under its own operating instructions and never lets a server-supplied prompt override them. Validate prompt arguments at the same boundary you would validate a direct resource read; a prompt is not a side channel around resource access.',
      },
      {
        heading: 'Cache hints are part of correctness',
        body: 'ttlMs is how long a result may be reused. cacheScope, public or private, is who may share it. A public prompt catalog might reasonably carry a five-minute ttlMs; a private note read is safer at one minute or less.\n\nCache hints never replace authorization. A cache key must include every dimension that changes visibility, tenant, user, scope, locale, pagination cursor. If a shared cache cannot express those dimensions safely, use private with a zero ttlMs and enforce a stricter no-store rule at the host layer, since MCP itself only defines public and private as cacheScope values.',
      },
      {
        heading: 'Subscriptions: a listen request replaces the old push model',
        body: 'The client sends subscriptions/listen as a normal request; over HTTP, its response stays open as SSE. The notifications object is an allowlist, the server must never deliver a type the client did not request. Before any event, the server sends notifications/subscriptions/acknowledged, and the subscription id is simply the original listen request\'s id.\n\nA change event names the resource, it does not carry the new document. The client re-reads through resources/read, subject to whatever authorization applies at that moment. When the stream closes, a graceful shutdown returns a final resultType: "complete" correlated to the original request; a real drop means reissuing the listen with a new id.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p13-10-inline-selection.svg',
        alt: 'The primitive selection table as a diagram',
        caption: 'Three columns, one row per capability: what it does, who decides to use it, and what comes back.',
        diagramBrief:
          'A three-column table rendered as a diagram on cream paper. Column headers: "Tool", "Resource", "Prompt". Row 1 "who chooses": model or app, host or user, user through UI. Row 2 "example": delete_note, notes://note-14, review_note. Row 3 "host affordance": none by itself, attachment panel entry, slash-command form. Black ink, one accent color highlighting the "Resource" column to mark it as the one most often skipped.',
      },
      {
        src: '/lessons/p13-10-inline-subscription.svg',
        alt: 'The subscription lifecycle from listen to close',
        caption: 'A listen request opens a stream, an acknowledgement confirms the filter, events carry only the subscription id, and a client re-reads to get the actual change.',
        diagramBrief:
          'A horizontal sequence of five boxes connected by arrows on cream paper: "client sends subscriptions/listen (id 17)", "server sends notifications/subscriptions/acknowledged", "server sends notifications/resources/updated (subscriptionId 17)", "client calls resources/read again", "stream closes: resultType complete". One accent color on the subscriptionId label repeated in boxes 2 and 3 to show correlation.',
      },
    ],
    takeaways: [
      'Choosing tool over resource removes the attachment panel, the picker entry, and the subscription. That is an IA decision made in server code.',
      'The test is who initiates and how often: model on every related query means tool, user attaching context means resource, a whole reusable workflow means prompt.',
      'prompts/get returns a message list, and the host builds the argument form from your schema, so prompt argument naming is UI work.',
      'Stable URIs are cacheable, computed content needs a nonce or timestamp in the URI, and subscriptions are bounded per-session state you have to expire.',
    ],
    terms: [
      { term: 'Resource', gloss: '"a file the model can read"', meaning: 'URI-addressable read-only content the host can pull into context without the model deciding to call anything.' },
      { term: 'Resource URI', gloss: '"the address of a resource"', meaning: 'A scheme-prefixed identifier for a resource, file://, postgres://, notes://, or any custom scheme, validated before storage access.' },
      { term: 'Resource template', gloss: '"a pattern for a family of URIs"', meaning: 'A parameterized URI pattern like notes://{id} that lets a client form a valid address without the server enumerating every item.' },
      { term: '-32602 (invalid resource URI)', gloss: '"a bad request"', meaning: 'The JSON-RPC error a resources/read handler returns for an unknown or invalid URI, distinct from a successful empty document.' },
      { term: 'Prompt', gloss: '"a slash command"', meaning: 'A named, multi-message template with typed arguments, surfaced by hosts as a slash-command with a form, chosen by the user, never the model.' },
      { term: 'cacheScope', gloss: '"how shareable a cached result is"', meaning: 'Either "public", reusable across authorized callers, or "private", bound to the requesting user or credential context.' },
      { term: 'subscriptions/listen', gloss: '"watching for changes"', meaning: 'A client-opened, long-lived request whose response stream delivers only the notification types named in its filter.' },
      { term: 'Subscription ID', gloss: '"which subscription an event belongs to"', meaning: 'The original subscriptions/listen request\'s id, repeated in every acknowledgement and event so a client can demultiplex several subscriptions on one stream.' },
      { term: 'Deterministic list', gloss: '"same order every time"', meaning: 'A discovery, list, or read result with stable membership and ordering for the same request inputs, which keeps cache keys and model context stable.' },
      { term: 'Content as data', gloss: '"resource text isn\'t an instruction"', meaning: 'The principle that resource content may carry prompt injection or misleading text, so a host must treat it as untrusted data with preserved provenance.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Classify these five capabilities as tool, resource, or prompt: issue details, create issue, sprint review template, project policy document, close issue.' },
      { level: 'medium', prompt: 'Write the JSON-RPC error a server returns for resources/read on notes://missing, including its code and the data field naming the URI.' },
      { level: 'hard', prompt: 'Design the cache key for a resources/list result on a multi-tenant server where visibility depends on tenant, user, and a feature flag. Which of those dimensions can be safely dropped from the key, and which cannot?' },
      { level: 'design', prompt: 'From the project-tracker set in the easy exercise, decide which lists can be cached publicly, which reads must stay private, and which resources deserve a subscriptions/listen entry. Name the chooser for each: model, host, or user.' },
    ],
    furtherReading: [
      { label: 'MCP 2026-07-28 Resources', url: 'https://modelcontextprotocol.io/specification/2026-07-28/server/resources', why: 'The full URI, list, and read contract, including the -32602 error case.' },
      { label: 'MCP 2026-07-28 Prompts', url: 'https://modelcontextprotocol.io/specification/2026-07-28/server/prompts', why: 'How prompts/get resolves arguments into messages a host can render.' },
      { label: 'MCP 2026-07-28 Subscriptions', url: 'https://modelcontextprotocol.io/specification/2026-07-28/basic/patterns/subscriptions', why: 'The subscriptions/listen request, acknowledgement, and event shapes in full.' },
      { label: 'MCP 2026-07-28 Caching', url: 'https://modelcontextprotocol.io/specification/2026-07-28/basic/utilities/caching', why: 'How ttlMs and cacheScope are meant to interact with authorization.' },
    ],
    shipIt: {
      kind: 'rubric',
      name: 'Primitive selection rubric',
      body: '- Who chooses to invoke this: the model on a related query (tool), the host or user pulling in context (resource), or the user starting a prepared workflow (prompt)?\n- Does this capability change state? If yes, it cannot be a resource.\n- Would a host attachment panel or file picker want to show this? If yes, it should be a resource, not only a tool.\n- Is the content addressable by a stable URI? If not, design that URI before writing the handler.\n- Does an unknown identifier return -32602, or does it silently return an empty success? Fix the latter.\n- Does the list carry a cacheScope that matches who is actually allowed to see it?',
    },
    demoCaption:
      'Same notes server, two primitive splits. All-tools works and is invisible: nothing appears in the attachment panel, nothing can push an update, nothing is a slash-command. Splitting across the three primitives changes what the host can render without changing the code behind it.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Notes MCP server surface',
      badLabel: 'Everything a tool',
      goodLabel: 'Split by primitive',
      badLines: [
        'notes_read, notes_list, notes_search: all tools',
        'reachable only if the model decides to call',
        'attachment panel: empty',
        'no subscription, so edits outside the host go unseen',
        'no slash-command for the review workflow',
      ],
      goodLines: [
        'notes://{id} resource, with a template for completion',
        'notes://recent computed per read',
        'notes_search stays a tool, it filters',
        'resources.subscribe pushes updated on file change',
        '/review_note prompt with a note_id argument form',
      ],
      badCaption:
        'All-tools is a working server with three affordances deleted. The user cannot attach a note, the host cannot refresh when a file changes on disk, and the review workflow has no entry point the user can trigger themselves.',
      goodCaption:
        'Resources for content, tools for filtering and mutation, prompts for workflows the user re-runs. The template gives the picker autocomplete, the subscription keeps context fresh after an external edit, and the prompt becomes a slash-command with a generated argument form.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'most bad MCP servers make one mistake: everything is a tool.',
        body:
          'most bad MCP servers make one mistake: everything is a tool.\n\nthe rule is who initiates and how often.\n\nmodel should call it on every related query: tool.\nuser should attach it as context: resource.\nthe reusable unit is a whole workflow: prompt.\n\nnotes://note-14 is the resource. notes_search is the tool that finds which id you wanted. that pair is usually the right answer.',
      },
      {
        kind: 'X · design angle',
        hook: 'the tool vs resource choice is an IA decision you make in server code.',
        body:
          'the tool vs resource choice is an IA decision you make in server code.\n\npick tool and the capability is only reachable through model judgment. no attachment chip, no picker entry, no subscription.\n\npick resource and it shows up in claude desktop\'s attachment panel and cursor\'s include-file picker, and it can push resources/updated so context refreshes when the file changes outside the host.\n\nsame code. completely different discoverability.',
      },
      {
        kind: 'X · one-liner',
        hook: 'prompts/get returns a message list, not a string.',
        body:
          'prompts/get returns a message list, not a string.\n\nand the host generates the argument form from your schema, which makes prompt argument naming a UI decision.\n\nit is also the only place in MCP where the user, not the model, kicks off a multi-step workflow.',
      },
    ],
    source: {
      label: 'Full lesson: 13.10 10-mcp-resources-and-prompts',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/13-tools-and-protocols/10-mcp-resources-and-prompts',
    },
  },
  {
    id: 'p13-14-mcp-apps',
    phase: 'Phase 13 · Tools and Protocols',
    part: 'Part 2 · MCP, end to end',
    index: '13.14',
    title: 'MCP Apps: your UI ships through the protocol',
    oneLiner:
      'A tool can still return a ui:// resource that mounts as a sandboxed iframe under a server-declared CSP. What changed under 2026-07-28 is the negotiation: the UI extension opts in per request through capabilities.extensions, there is no core handshake left to piggyback on, and the CSP object now names four separate domain lists instead of three.',
    readTime: '~10 min read',
    diagram: '/lessons/p13-14.svg',
    diagramCaption:
      'A tool result carrying a ui:// resource, the host reading it, mounting the sandboxed iframe, and mediating the bridge over postMessage.',
    whyItMatters:
      'This is still the one MCP lesson where you are the author of the interface, not a consumer of it. Your deliverable is a self-contained HTML bundle with no build system, no external stylesheet, no CDN font, and no network unless connectDomains grants it, so every token and asset is inlined. You own four states inside a frame you do not control: loading before ui/initialize resolves, ready, permission-denied, and host-call-failed. A fifth state now matters just as much: revoked. Capabilities can be pulled mid-session because the user switches accounts, policy changes, or the server is quarantined, and a well-built App checks its authority at the moment it acts, not only once at load.',
    learningObjectives: [
      'Advertise the io.modelcontextprotocol/ui extension through capabilities.extensions on the requests where it matters, not through a core handshake.',
      'Bind a tool to a ui:// resource in tools/list metadata before the tool is ever called.',
      'Populate the four-part CSP object, connectDomains, resourceDomains, frameDomains, baseUriDomains, starting from empty.',
      'Distinguish the removed core initialize from the surviving Apps bridge method ui/initialize.',
      'Design the app\'s behavior when a capability is revoked mid-session, not only when it is first granted.',
    ],
    sections: [
      {
        heading: 'The problem: a paragraph where a timeline belonged',
        body: 'A visualize_timeline tool that returns "Here are 14 notes organized chronologically: ..." has given the user a paragraph where a timeline belonged. Before a standard existed, the choices were both bad: a client-specific widget API meant one implementation per host, or plain text output for data that is only legible as a chart, a map, or a table.\n\nMCP Apps standardizes the contract instead of leaving it to each host. One HTML bundle, built once, renders identically in every host that implements the extension, without a rewrite per client.',
      },
      {
        heading: 'The extension opts in per request, not at a handshake',
        body: 'Apps support is negotiated through io.modelcontextprotocol/ui inside clientCapabilities.extensions, declared on the request where it matters, server/discover or tools/list, not at a one-time handshake, because there is no core handshake left in 2026-07-28.\n\nA server can support the extension for hosts that ask for it and fall back to plain tools for hosts that do not, on the very same request cycle. This is a meaningfully different shape from the old model, where a capability, once negotiated at connection time, applied to the whole session regardless of which specific call needed it.',
      },
      {
        heading: 'Declare the UI on the tool, before the call',
        body: 'The binding lives in tools/list metadata: a tool carries _meta.ui.resourceUri pointing at its ui:// resource, deliberately available before the tool is ever invoked. That lets a host preload, cache, and security-review the HTML ahead of the moment it needs to display anything.\n\ntools/list stays cacheable like every other list result, with deterministic ordering, ttlMs, and cacheScope, private when the visible tool set genuinely varies by user or token. A UI binding does not exempt a tool from any of that.',
      },
      {
        heading: 'Return data, let the host bind the view',
        body: 'A tool call returns ordinary content plus structuredContent, the actual data the view will render, alongside isError. The host already knows which view belongs to which tool from the earlier binding, so there is no need to repeat the ui:// URI inside the result itself.\n\nKeeping data and presentation separate this way means the same structuredContent payload could, in principle, feed a text summary for a host without Apps support and a rendered timeline for one that has it, from the exact same tool call.',
      },
      {
        heading: 'The resource carries its own CSP object',
        body: 'The HTML resource\'s _meta.ui.csp now names four domain lists instead of the old three-field version: connectDomains for fetch, XHR, and WebSocket; resourceDomains for scripts, styles, images, and fonts; frameDomains; and baseUriDomains. A permissions object sits alongside it for camera, microphone, geolocation, and similar grants.\n\nStart every one of the four lists empty. Add exactly the origins a specific feature needs, one at a time, with a stated reason. A wide connectDomains buys a frame zero extra interactivity, since the bridge methods already route through the protocol; it only widens where the frame\'s data could go.',
      },
      {
        heading: 'Caching executable content is not caching prose',
        body: 'An App resource can execute bridge code and request host-mediated actions, so its cache key needs more than a URI: canonical ui:// address, admitted server identity and version, a content digest, and the authorization context whenever cacheScope is private. Never reuse a private App resource across two different users just because the URI is identical.\n\nInvalidate the entry on ttlMs expiry, a change to the tool\'s resourceUri binding, a server version change, or a resource-change notification naming that URI, and re-apply CSP and permission review before remounting rather than trusting a cached policy to still be current.',
      },
      {
        heading: 'Validation order: shape, then routing, then feature policy',
        body: 'Four failure conditions, in the order a server should check them. Header and body disagree on version, method, or name: 400, -32020. Header and body agree on a version the server does not support: 400, -32022, with exact requested and supported data. resources/read is called for a UI resource by a client that never declared the extension: 400, -32021, naming the missing capability. The method itself is unknown: 404, -32601.\n\nThat order keeps a proxy and the origin server from ever interpreting one request two different ways, the same discipline lesson 13.09 applies to every Streamable HTTP request.',
      },
      {
        heading: 'Host context is live, and capabilities can be revoked mid-session',
        body: 'Do not treat ui/initialize, which belongs to the iframe-to-host bridge and is entirely separate from the removed core handshake, as a one-time render input. Theme, locale, and size are live context: apply host tokens, react to theme changes, let the host cap iframe dimensions so content cannot escape its layout.\n\nCheck capability and authorization at the moment an action happens, not only at load. On revocation, whether from an account switch, a policy change, or a quarantined server, reject pending privileged calls, stop network activity that no longer fits policy, clear sensitive rendered state, and remount or fall back to text. A view that retries a refused action until the host relents has not implemented consent, it has implemented a workaround for it.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p13-14-inline-csp.svg',
        alt: 'The four-part CSP object, starting empty',
        caption: 'Four domain lists, each empty by default, widened one origin at a time.',
        diagramBrief:
          'Four labeled boxes in a row on cream paper: connectDomains, resourceDomains, frameDomains, baseUriDomains. Each box shown empty with a small "[]" inside, and a dashed arrow beneath each pointing to a faint example label ("api.example.com", "fonts.example.com", none, none) marked "add only if needed". Black ink, one accent color on the word "empty" repeated under each box.',
      },
      {
        src: '/lessons/p13-14-inline-twohandshakes.svg',
        alt: 'Two different things named initialize',
        caption: 'The core handshake is gone; the Apps bridge handshake is a separate, surviving mechanism at a different layer.',
        diagramBrief:
          'Two side-by-side boxes on cream paper. Left box, "MCP core (2026-07-28)": text "initialize" with a red line through it, labeled "removed, no session". Right box, "MCP Apps bridge": "ui/initialize" then arrow down to "ui/notifications/initialized", labeled "iframe to host only, unrelated to core". A faint dotted line separates the two boxes to emphasize they belong to different layers. One accent color on the right box\'s arrow.',
      },
    ],
    takeaways: [
      'Your deliverable is one self-contained HTML bundle: no CDN, no external font, no network beyond connect-src. Inline the tokens and data-URI the assets.',
      'ui/initialize hands you theme, locale, and a session token, so the frame is theme-aware from its first paint or it looks foreign in the host.',
      'Pin targetOrigin and validate event.origin on both sides of the postMessage channel. Never "*", because the payload carries host.callTool.',
      'Four states live inside the frame: loading before ui/initialize resolves, ready, permission-denied, and host-call-failed when host.callTool returns isError.',
    ],
    terms: [
      { term: 'MCP Apps', gloss: '"UI through MCP"', meaning: 'The optional extension letting a tool return interactive, sandboxed HTML instead of only text, negotiated per request rather than at a handshake.' },
      { term: 'io.modelcontextprotocol/ui', gloss: '"the feature flag for Apps"', meaning: 'The extension identifier both peers declare, the client inside clientCapabilities.extensions, the server inside its discovery capabilities.' },
      { term: 'ui:// scheme', gloss: '"the address of a UI bundle"', meaning: 'The resource URI scheme identifying an HTML bundle the host should mount as an app rather than read as ordinary content.' },
      { term: 'text/html;profile=mcp-app', gloss: '"the MIME type for an App"', meaning: 'The MIME type telling a host the HTML in a resource is an MCP App and must be sandboxed rather than rendered inline as a page.' },
      { term: '_meta.ui.resourceUri', gloss: '"linking a tool to its UI"', meaning: 'Tool-result metadata in tools/list binding a tool to its ui:// resource before the tool is ever called, so the host can preload and review it.' },
      { term: 'CSP domain lists', gloss: '"where the frame can reach"', meaning: 'The four-part policy object, connectDomains, resourceDomains, frameDomains, baseUriDomains, each empty by default and widened one origin at a time.' },
      { term: 'ui/initialize (bridge)', gloss: '"the app saying hello to the host"', meaning: 'The first postMessage from the iframe to its host, distinct from and unrelated to the removed core MCP handshake of the same rough shape.' },
      { term: 'ui/notifications/initialized', gloss: '"the app is ready"', meaning: 'The Apps bridge notification a view sends after receiving the host\'s ui/initialize response, before the host will send it further messages.' },
      { term: 'Text fallback', gloss: '"what a host without Apps support sees"', meaning: 'The plain content[] result a tool keeps returning for a host that never declared the UI extension, so the tool remains useful either way.' },
      { term: 'Capability revocation', gloss: '"losing permission mid-session"', meaning: 'The requirement that an App recheck authorization at the moment it acts, since account changes, policy changes, or quarantine can pull a grant after load.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Write the empty-by-default CSP object, all four domain lists present and empty, for a brand-new MCP App resource.' },
      { level: 'medium', prompt: 'A client declares no extensions in clientCapabilities. Describe exactly what tools/list returns for a tool that has a UI binding, and what the tool call itself returns.' },
      { level: 'hard', prompt: 'Explain why ui/initialize and the removed core initialize can share a name without being the same mechanism. What would go wrong if a client implementer assumed they were?' },
      { level: 'design', prompt: 'Design the visual treatment that makes an MCP App frame legible as "not host chrome" at a glance, given that a convincing fake system message inside the frame is a real prompt-injection vector.' },
    ],
    furtherReading: [
      { label: 'MCP base protocol, specification 2026-07-28', url: 'https://modelcontextprotocol.io/specification/2026-07-28/basic', why: 'The stateless core this extension sits on top of, including capabilities.extensions negotiation.' },
      { label: 'MCP Apps overview', url: 'https://modelcontextprotocol.io/extensions/apps/overview', why: 'The full extension contract: discovery, the ui:// resource, and the bridge lifecycle.' },
      { label: 'MCP Apps build guide', url: 'https://modelcontextprotocol.io/extensions/apps/build', why: 'Practical guidance for building the HTML bundle itself, including CSP defaults.' },
      { label: 'Official extension support matrix', url: 'https://modelcontextprotocol.io/extensions/client-matrix', why: 'Which hosts currently implement MCP Apps, useful before promising a client this feature.' },
    ],
    shipIt: {
      kind: 'snippet',
      name: 'Empty-by-default CSP object for a new MCP App',
      body: '{\n  "csp": {\n    "connectDomains": [],\n    "resourceDomains": [],\n    "frameDomains": [],\n    "baseUriDomains": []\n  },\n  "permissions": {}\n}\n\n// Add one origin at a time, with a written reason, to whichever\n// list the specific feature actually needs. Never start from a\n// wildcard and narrow down later.',
    },
    demoCaption:
      'Drag connect-src from none to wildcard. Interactivity does not improve past the first notch, because host.callTool already routes through the protocol. What grows is the set of destinations your frame can post the user\'s data to.',
    demo: {
      archetype: 'slider-map',
      subject: 'MCP App CSP breadth',
      sliderLabel: 'connect-src breadth (none, self, one host, wildcard)',
      outputLabel: 'what the frame gains',
      badCaption:
        'Reading connect-src as a capability dial invites the widest value that makes the frame work. It is not a capability dial. host.callTool, host.readResource, and host.getPrompt all route through the protocol and need no network grant at all, so a wide connect-src adds nothing to interactivity.',
      goodCaption:
        'connect-src is an exfiltration budget: it is the exact list of places your frame can send the user\'s data. Start at none, render from the payload the tool already returned, and widen one origin at a time with a stated reason. Wildcard means anything in the frame can reach anywhere.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'MCP Apps means your UI ships through the protocol.',
        body:
          'MCP Apps means your UI ships through the protocol.\n\nSEP-1724, official jan 26 2026. a tool returns a ui:// resource, MIME text/html;profile=mcp-app. the host calls resources/read, gets HTML, mounts it in a sandboxed iframe under the CSP your _meta.ui declared.\n\nthe frame talks back over a postMessage JSON-RPC dialect: host.callTool, host.readResource, host.getPrompt, host.close.\n\none bundle. claude desktop, chatgpt, goose, cursor.',
      },
      {
        kind: 'X · design angle',
        hook: 'building an MCP App is frontend work with three constraints you do not usually have.',
        body:
          'building an MCP App is frontend work with three constraints you do not usually have.\n\nno network. connect-src defaults to nothing, so inline every token, data-URI every asset, render from the payload the tool already returned.\n\nno theme of your own. ui/initialize hands you theme and locale, and you adopt them or you look foreign inside the host.\n\nfour states inside a frame you do not control: loading before ui/initialize resolves, ready, permission-denied, host-call-failed.',
      },
      {
        kind: 'X · one-liner',
        hook: 'connect-src is not a capability dial, it is an exfiltration budget.',
        body:
          'connect-src is not a capability dial, it is an exfiltration budget.\n\nhost.callTool already routes through the protocol, so a wider connect-src buys your MCP App zero interactivity. it only widens the list of places the frame can send the user\'s data.\n\nstart at none. add one origin at a time, with a reason.',
      },
    ],
    source: {
      label: 'Full lesson: 13.14 14-mcp-apps',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/13-tools-and-protocols/14-mcp-apps',
    },
  },
];
