import type { Lesson } from '@/lib/lessons';

// Phase 13 · Part 2 · MCP, end to end (lessons 13.06-13.10, 13.14)
export const phase13Part2: Lesson[] = [
  {
    id: 'p13-06-mcp-fundamentals',
    phase: 'Phase 13 · Tools and Protocols',
    part: 'Part 2 · MCP, end to end',
    index: '13.06',
    title: 'Six primitives, three phases, one wire format',
    oneLiner:
      'MCP is JSON-RPC 2.0 plus six named primitives and a three-phase lifecycle. Three primitives belong to the server (tools, resources, prompts) and three to the client (roots, sampling, elicitation), and the initialize handshake decides which of them are legal for the rest of the session.',
    readTime: '~8 min read',
    diagram: 'lessons/p13-06.svg',
    diagramCaption:
      'The initialize handshake, then the operation phase where either side may originate a request per the negotiated capabilities.',
    whyItMatters:
      'Capability negotiation is a feature gate you have to render. The client declares sampling, elicitation, and roots at initialize; the server declares tools.listChanged, resources.subscribe, prompts.listChanged. Everything the UI can offer for the rest of the session is fixed by that one message pair, so the surface is a per-server capability chip row, not a static settings page. It also means one server can appear fully wired in one host and half dark in another, and your empty state has to say which. Notifications are the other half: notifications/tools/list_changed means the tool list is live data, so the picker needs a re-fetch path, not a mount-time fetch.',
    sections: [
      {
        heading: 'The problem: every integration was a one-off',
        body: 'Before MCP, a Postgres query tool was written three times: once for Claude Desktop, once for Cursor, once for the VS Code Copilot extension, each against a different host API. Reuse meant copying code. Every host had an MCP-shaped tool system and none of them were compatible.\n\nMCP, shipped by Anthropic in November 2024 and handed to the Linux Foundation\'s Agentic AI Foundation in December 2025, standardizes discovery and invocation instead of the tools themselves. One server now runs in 300+ clients: Claude Desktop, ChatGPT, Cursor, VS Code, Gemini, Goose, Zed, Windsurf. 110M monthly SDK downloads, 10,000+ public servers.',
      },
      {
        heading: 'The move: three server primitives, three client primitives',
        body: 'Server side: tools are callable actions, resources are read-only content addressed by URI (file:///path, notes://14, db://query/...), prompts are reusable templates the host surfaces as slash-commands.\n\nClient side: roots are the set of URIs the server is allowed to touch, sampling lets the server ask the client\'s model for a completion (so the server needs no API key of its own), elicitation lets the server ask the user for structured input mid-flight via a form or a URL.\n\nEvery capability in the protocol belongs to exactly one of those six. Nothing floats.',
      },
      {
        heading: 'The wire: JSON-RPC 2.0, about fifteen methods',
        body: 'Requests carry jsonrpc, id, method, params. Responses carry the same id plus result or error. Notifications drop the id entirely, and a notification must never be answered.\n\nThe base spec has roughly fifteen methods. The ones you actually see: initialize and notifications/initialized, tools/list and tools/call, resources/list, resources/read, resources/subscribe, prompts/list, prompts/get, sampling/createMessage (server to client), and the notifications/*_changed family.\n\nREST would have been the obvious choice and the wrong one. MCP needs server-originated messages for sampling and notifications, and JSON-RPC\'s symmetric envelope composes over both stdio and HTTP without reinventing anything.',
      },
      {
        heading: 'The lifecycle: initialize, operation, shutdown',
        body: 'Phase one: the client sends initialize with its capabilities and clientInfo. The server answers with its capabilities, serverInfo, and the spec revision it speaks (2025-11-25 in current builds). The client sends notifications/initialized once it has digested that.\n\nPhase two is bidirectional. The client discovers with tools/list and invokes with tools/call. The server may push sampling/createMessage if the client declared sampling, and notifications/tools/list_changed when its tool set mutates.\n\nPhase three is not a method. There is no shutdown message; the transport carries the end of connection.',
      },
      {
        heading: 'The contract: what negotiation actually forbids',
        body: 'If the client does not declare sampling, the server must not call sampling/createMessage. If the server does not declare resources.subscribe, the client must not subscribe. That symmetry is why the ecosystem does not fragment: a client with no sampling support is still a valid client, a server that never samples is still a valid server, they just do not use that pair together.\n\nOne confusion worth naming: capabilities.tools is about list-changed notifications, not about whether the client will call a given tool. Whether the model chooses a tool at runtime is orthogonal to the spec-level flag.',
      },
    ],
    takeaways: [
      'Six primitives, and every MCP feature belongs to exactly one: tools, resources, prompts on the server; roots, sampling, elicitation on the client.',
      'The initialize handshake is the feature gate for the whole session. Render capabilities per server, because the same server is differently capable in different hosts.',
      'Notifications have no id and must never be answered. notifications/tools/list_changed makes the tool list live data, so the picker needs a re-fetch path.',
      'The spec revision is a negotiated value, not a constant. 2025-11-25 adds async Tasks, URL-mode elicitation, sampling with tools, and incremental scope consent.',
    ],
    terms: [
      { term: 'MCP', meaning: 'Open protocol standardizing how a model host discovers and invokes external tools, data, and templates.' },
      { term: 'Server primitive', meaning: 'What a server exposes: tools (actions), resources (data), prompts (templates).' },
      { term: 'Client primitive', meaning: 'What a client lends to servers: roots (scope), sampling (model callbacks), elicitation (user input).' },
      { term: 'JSON-RPC 2.0', meaning: 'The wire format: symmetric request, response, and notification envelopes over any byte stream.' },
      { term: 'Capability negotiation', meaning: 'The initialize message pair where both sides declare which features are legal for the session.' },
      { term: 'SEP', meaning: 'Spec Evolution Proposal, a named draft change to MCP (SEP-1686 for async Tasks, SEP-1724 for MCP Apps).' },
    ],
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
      'A working MCP server over stdio is a dict of method name to handler, a strict rule that stdout carries nothing but JSON-RPC, and tool results returned as typed content blocks rather than strings. About 180 lines of stdlib, or under 80 with FastMCP.',
    readTime: '~8 min read',
    diagram: 'lessons/p13-07.svg',
    diagramCaption:
      'The stdio dispatch loop: one JSON object per line in, handler lookup by method name, one response per id out.',
    whyItMatters:
      'Two things you author on the server land directly in someone\'s interface. First, annotations: readOnlyHint, destructiveHint, idempotentHint, openWorldHint. Those four booleans are what a host reads to decide whether a call runs silently or raises a confirmation gate, so you are writing the permission UX from inside the tool definition. Second, the error split: protocol errors are JSON-RPC errors and belong to the client\'s plumbing, while tool failures come back as content plus isError true and belong in the model\'s context and the trace row. Collapse them into one toast and you lose both the model\'s retry signal and the user\'s explanation.',
    sections: [
      {
        heading: 'The problem: stdio is the whole local story',
        body: 'Before a remote transport or an auth layer, you need a clean local server, and local means stdio. The client spawns your server as a child process and messages flow newline-delimited over stdin and stdout. One JSON object per line is the entire framing. No length prefixes, no SSE.\n\nThat last part matters because SSE was the old remote mode and is being removed through mid-2026: Atlassian\'s Rovo server dropped it on June 30, 2026, Keboola on April 1, 2026. If you are writing a local server today, stdio is the only correct answer.',
      },
      {
        heading: 'The loop: three rules that cause most bugs',
        body: 'Read a line, parse it, and branch on whether it has an id. Has an id means request, so write exactly one response carrying the same id. No id means notification, so handle it and write nothing.\n\nThree rules. Never print anything to stdout that is not a JSON-RPC envelope, because a stray debug line corrupts the stream; logs go to stderr. Flush after every write, because a buffered response looks like a hung server. Exit cleanly when stdin hits EOF, because the client owns your lifetime.\n\nThe dispatcher itself is a dict from method name to handler function. That is the architecture.',
      },
      {
        heading: 'The shape: declare only what you support',
        body: 'initialize returns protocolVersion 2025-11-25, a serverInfo block, and a capabilities object that is a promise. Declaring resources.subscribe true and then never emitting notifications/resources/updated is worse than not declaring it, because the client gates features on that value and will render a stale panel forever.\n\nA notes server is the right teaching shape because it exercises all three primitives at once: notes_create mutates so it is a tool, notes://{id} is read-only so it is a resource, review_note is a template so it is a prompt. Lesson 13.10 is the decision rule for that split.',
      },
      {
        heading: 'The result: content blocks, not strings',
        body: 'tools/call returns { content: [blocks], isError: bool }. A block is typed: {type: "text", text}, {type: "resource", resource: {uri, text}}, {type: "image", data, mimeType}. Lesson 13.14 adds a UI block on top of that list.\n\nSo every tool executor returns a list, never a bare string. That is not ceremony. The block type is what tells the host how to render the result: a text row, an attachment chip, an inline image, an iframe. Returning a stringified image is how a tool ends up rendering as a wall of base64 in someone\'s chat.',
      },
      {
        heading: 'The graduation: annotations and FastMCP',
        body: 'Each tool can carry annotations. readOnlyHint true means safe to retry. destructiveHint true means irreversible, so the client should confirm. idempotentHint true means same inputs, same outputs. openWorldHint true means it touches an external system. Hosts use these for confirmation dialogs, status indicators, and gateway routing.\n\nThe stdlib server is about 180 lines. FastMCP collapses it to decorators (@app.tool() over a typed function) and lands under 80, with the TypeScript SDK the same shape. The wire behavior must stay identical, so keep the JSON-RPC harness and re-run it after the port.',
      },
    ],
    takeaways: [
      'stdout is the protocol. One JSON object per line, flush after every write, and every debug log goes to stderr or you corrupt the stream.',
      'Protocol errors and tool errors are different components. JSON-RPC error for bad method or params, content plus isError true for a valid call that failed.',
      'Annotations are permission UX authored server side. destructiveHint true is what makes a host raise a confirmation gate instead of running silently.',
      'Tool results are typed content blocks, never strings. The block type is how the host decides between a text row, an attachment, an image, or an iframe.',
    ],
    terms: [
      { term: 'stdio transport', meaning: 'The local transport: the client spawns the server as a child process and they exchange newline-delimited JSON over stdin and stdout.' },
      { term: 'Dispatcher', meaning: 'A map from JSON-RPC method name to handler function, the core of any MCP server.' },
      { term: 'Content block', meaning: 'A typed element of a tool result: text, image, resource, or a UI resource.' },
      { term: 'isError', meaning: 'A flag on a tool result meaning the tool ran and failed, as distinct from a protocol-level JSON-RPC error.' },
      { term: 'Annotations', meaning: 'Per-tool safety hints (readOnly, destructive, idempotent, openWorld) that hosts turn into confirmation and routing behavior.' },
      { term: 'FastMCP', meaning: 'The decorator-based Python framework that wraps the raw protocol, with an equivalent shape in the TypeScript SDK.' },
    ],
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
      'A host runs several MCP servers at once, handshakes each independently, and flattens their tool lists into one namespace the model can see. The hard parts are collision policy, routing, and a reader loop that never blocks on a call while a notification waits in the stream.',
    readTime: '~8 min read',
    diagram: 'lessons/p13-08.svg',
    diagramCaption:
      'Three servers, three sessions, one merged tool namespace, and a dispatch table from tool name back to the owning session.',
    whyItMatters:
      'The merged namespace is the model\'s tool picker, and it is also a per-session health surface you have to render. Each server has independent state: capabilities from its handshake, its current tool list, its pending request ids, and whether it is alive. That is a state machine per row, not one global spinner: spawning, handshaking, ready, degraded, dead. Collision policy is a real design choice with three visible outcomes. Prefix-by-server (Claude Desktop, VS Code) makes names ugly but honest. Silent first-come hides the collision, which is a security hole wearing a convenience costume. Collision rejection (Cursor) fails loudly, which is the right default when a tool can spend money.',
    sections: [
      {
        heading: 'The problem: hosts load many servers, not one',
        body: 'A real host (Claude Desktop, Cursor, Goose, Gemini CLI) has a filesystem server, a Postgres server, and a GitHub server running at the same time. The client\'s job is six things: spawn each server, handshake each independently, call tools/list on each and flatten the result, route an incoming call by name to the server that owns it, handle notifications from any server without blocking, and reconnect when a transport dies.\n\nThe SDKs wrap all of that. The mental model still has to be yours, because every failure you will debug lives in one of those six.',
      },
      {
        heading: 'The state: one Session object per server',
        body: 'Spawn with stdin, stdout, and stderr piped, line-buffered, text mode. Hold one process handle per server.\n\nA Session carries four things: the process handle, the capabilities the server declared at initialize, the last tools/list result, and a pending map from request id to the future waiting on it.\n\nThat pending map is what makes concurrency work. Requests are async by nature, so a tools/call sent to server A must not block a call in flight to server B. Threads with queues or asyncio, either is fine, but the per-server bookkeeping is not optional.',
      },
      {
        heading: 'The merge: three collision policies, three products',
        body: 'Two servers can both expose search. There are exactly three answers.\n\nPrefix by server name: notes/search, files/search. Clear, ugly, and what Claude Desktop and VS Code do.\n\nSilent first-come: the later server\'s search overrides the earlier one. Cheap and dangerous, because the user thinks they are calling one tool and are calling another.\n\nCollision rejection: refuse to load the second server and tell the user. Cursor does this. It is the right default for anything security-sensitive, because a silently shadowed tool name is a working attack.',
      },
      {
        heading: 'The loop: the bug everyone writes once',
        body: 'After merging, routing is a dict from tool name to session. The model emits a call, you find the session, write tools/call to that server\'s stdin, await the matching id.\n\nThe classic client bug: blocking the read loop on that await while notifications/tools/list_changed sits unread in the stream. Fix it structurally. A background reader thread drains every line off stdout into a queue, the main thread dequeues and dispatches by id or by method. Notifications must not be acknowledged, so do not try to ack them.\n\nlist_changed means re-call tools/list. resources/updated means re-read if you are using that resource.',
      },
      {
        heading: 'The death: EOF is the only signal you get',
        body: 'Transports fail. The process crashes, the OS kills it, the pipe breaks. On stdio the client sees EOF on stdout and marks the session dead. There is no message.\n\nTwo reconnection policies. Silently restart and re-handshake, which is fine for read-only servers. Or surface the failure, which is required for stateful servers where the user has a visible session.\n\nStdio has no session id at all: the process identity is the session. Streamable HTTP replaces that with an Mcp-Session-Id header, which is why remote reconnection is a different problem (lesson 13.09).',
      },
    ],
    takeaways: [
      'One Session per server: process handle, declared capabilities, last tool list, pending request ids. There is no global client state that means anything.',
      'Collision policy is a visible design decision. Prefix keeps names honest, silent first-come hides a shadowed tool, rejection fails loudly and is right for anything that spends money.',
      'A background reader thread draining stdout into a queue is structural, not an optimization. Awaiting a call on the read loop is how notifications get lost.',
      'On stdio the process identity is the session and EOF is the only death signal, so a dead server is inferred, never announced.',
    ],
    terms: [
      { term: 'MCP client', meaning: 'The host process that spawns servers, negotiates with each, and orchestrates tool calls on the model\'s behalf.' },
      { term: 'Session', meaning: 'Per-server state: the process handle, its declared capabilities, its tool list, and its pending requests.' },
      { term: 'Merged namespace', meaning: 'The flat set of tool names across every active server, which is what the model actually sees.' },
      { term: 'Namespace collision', meaning: 'Two servers exposing the same tool name, resolved by prefixing, rejecting, or silently overriding.' },
      { term: 'Background reader', meaning: 'A thread or task that drains a server\'s stdout into a queue so awaiting a response cannot stall notifications.' },
      { term: 'Reconnection policy', meaning: 'What the client does when a transport dies: silent restart, or surface the dead session to the user.' },
    ],
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
      'Two transports, no overlap. stdio is a child process on the same box. Streamable HTTP is one endpoint handling POST, GET, and DELETE with a server-assigned Mcp-Session-Id. The old two-endpoint HTTP+SSE mode is deprecated and gone through mid-2026.',
    readTime: '~8 min read',
    diagram: 'lessons/p13-09.svg',
    diagramCaption:
      'Streamable HTTP on one path: POST carries requests, GET holds the server-to-client stream, both keyed by Mcp-Session-Id.',
    whyItMatters:
      'Remote transport is where MCP stops being invisible to the interface. Streamable HTTP gives you five distinct failure states that are five different components, not one error toast: a 502 or 504 from the proxy is retriable once after a short backoff, a dropped SSE stream resumes silently by re-GETing with the same session id plus last-event-id, a 404 means the server revoked your session and you must re-handshake from scratch, an Origin rejection is a configuration problem the user has to fix, and stdio EOF is a dead child process. Hosting is a budget too: the GET stream is long-lived, and Vercel\'s free tier caps at 10 seconds, so it cannot host one at all.',
    sections: [
      {
        heading: 'The problem: two endpoints aged badly',
        body: 'The first remote transport (2024-11) was HTTP+SSE: one endpoint for the client\'s POSTs and a separate Server-Sent-Events channel for server-to-client traffic. It worked and it was clumsy. Two endpoints per session, broken caches behind some CDNs, and a hard dependency on long-lived SSE that aggressive WAFs terminate.\n\nThe 2025-03-26 revision replaced it with Streamable HTTP. The old mode is on a clock: Atlassian Rovo removed it June 30, 2026, Keboola April 1, 2026, most remaining enterprise servers by end of 2026. If you are still on two endpoints you are on a migration, not a transport.',
      },
      {
        heading: 'The move: one endpoint, three methods',
        body: 'Streamable HTTP is a single path, conventionally /mcp, serving three HTTP methods.\n\nPOST /mcp carries a JSON-RPC message. The server answers with either a single JSON response or an SSE stream of one or more responses, which is how batched replies and request-scoped notifications arrive.\n\nGET /mcp opens the long-lived SSE channel the server uses for anything it originates: sampling, notifications, elicitation.\n\nDELETE /mcp terminates the session cleanly. Two-endpoint mode is still callable as legacy compatible, but every new server should be single-endpoint and the official SDKs emit that.',
      },
      {
        heading: 'The session: a header, not a cookie',
        body: 'The client sends its first request with no Mcp-Session-Id. The server mints a cryptographically random id (128 bits or more) and sets it on the response header. The client echoes it on every subsequent request and on the GET that opens the stream. Client-chosen ids are rejected, which closes off session fixation.\n\nThe lifecycle has a fifth state worth designing for: the server can revoke a session, and the client discovers that as a 404 on its next request. Recovery is a full re-initialize, not a retry, so the UI has to distinguish "reconnecting" from "re-handshaking" because only one of them loses state.',
      },
      {
        heading: 'The defense: Origin validation stops DNS rebinding',
        body: 'Browsers are not MCP clients today, but an attacker can serve a page that makes a browser POST to localhost:1234/mcp, where the user\'s local server is listening. Same-origin policy does not save you, because Origin: http://evil.com is a perfectly valid cross-origin value.\n\nThe 2025-11-25 spec therefore requires servers to reject any request whose Origin is not on an allowlist. That list is typically the client host (https://claude.ai, vscode-webview://*) plus localhost variants for local UIs. Wildcard patterns need care: https://*.example.com must accept https://app.example.com and reject https://evil.example.com.attacker.net.',
      },
      {
        heading: 'The recovery: replay, retry, or re-handshake',
        body: 'SSE streams drop for boring reasons: TCP reset, proxy timeout, the user changing networks. The client re-GETs with the same Mcp-Session-Id and echoes last-event-id, and the server replays what was missed inside a reasonable window. That is a silent recovery, not an error.\n\nProxy 502 and 504 are worth exactly one retry after a short backoff. Session revocation is a 404 and a full re-handshake. Clock skew resolves in favor of the server: treat its timestamps as authoritative.\n\nProduction hosting in 2026 is Cloudflare Workers, Vercel Functions, or containers, and the constraint is indefinite streams for the GET.',
      },
    ],
    takeaways: [
      'stdio for this machine, Streamable HTTP over the network, and no crossover. Tunneling stdio with SSH or socat means you should have used HTTP.',
      'Session ids are server-minted, 128 bits or more, and echoed on every request. Client-chosen ids are rejected on purpose.',
      'Five transport failures, five components: retriable 502, silent SSE replay via last-event-id, 404 requiring a full re-handshake, Origin rejection, stdio EOF.',
      'Origin allowlisting is the DNS-rebinding defense and it is required by the spec, because a browser POST to localhost carries a valid cross-origin Origin.',
    ],
    terms: [
      { term: 'Streamable HTTP', meaning: 'The current remote transport: one endpoint serving POST, GET, and DELETE, introduced in the 2025-03-26 spec.' },
      { term: 'HTTP+SSE', meaning: 'The legacy two-endpoint remote transport, deprecated and being removed through mid-2026.' },
      { term: 'Mcp-Session-Id', meaning: 'A server-assigned random header value the client echoes on every subsequent request to continue a session.' },
      { term: 'Origin allowlist', meaning: 'The set of approved Origin values a server accepts, which is what defeats DNS-rebinding attacks on local servers.' },
      { term: 'last-event-id', meaning: 'The SSE header a client echoes on reconnect so the server can replay events missed during the outage.' },
      { term: 'Session revocation', meaning: 'The server invalidating a session id, which the client sees as a 404 and must answer with a full re-handshake.' },
    ],
    demoCaption:
      'Same session, two transport shapes. The legacy mode needs two endpoints and has no way to resume a dropped stream without losing events; the current mode keys everything to one path and one session header, so a drop becomes a replay.',
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
      'Tools get most of the attention and cause most of the bad servers. If the model should call it on every related query it is a tool, if the user should attach it to a conversation it is a resource, if a whole workflow is the reusable unit it is a prompt. Each choice buys a different piece of host UI.',
    readTime: '~8 min read',
    diagram: 'lessons/p13-10.svg',
    diagramCaption:
      'Sorting one server\'s capabilities across the three primitives, with the host affordance each choice unlocks.',
    whyItMatters:
      'This is the one MCP decision that is purely an IA call, and it is made in server code. Pick tool and the capability is only reachable through model judgment: no picker entry, no attachment chip, no subscription. Pick resource and it appears in Claude Desktop\'s attachment panel and Cursor\'s include-file picker, becomes addressable by URI, and can push notifications/resources/updated so context refreshes when a file changes outside the host. Pick prompt and it becomes a slash-command with an argument form, which is the only affordance in MCP where the user, not the model, initiates a multi-step workflow. Same code behind all three; completely different discoverability.',
    sections: [
      {
        heading: 'The problem: wrapping every read in a tool',
        body: 'The naive notes server exposes notes_read, notes_list, notes_search, all as tools. Three consequences.\n\nEvery data access now depends on the model deciding to call it, on every query that might benefit. Read-only content cannot be subscribed to, so the host cannot stream it into a side panel. And client UIs that exist specifically to surface data (Claude Desktop\'s resource attachment panel, Cursor\'s include-file picker) have nothing to show, because those panels read resources, not tools.\n\nYou did not just pick an implementation. You removed three affordances.',
      },
      {
        heading: 'The rule: who initiates, and how often',
        body: 'Search, filter, or transform is a tool. Content the host should include as context is a resource. A reusable multi-step workflow is a prompt.\n\nSaid as a test: if the model would benefit from calling it on every related query, tool. If the user would benefit from attaching it to a conversation, resource. If the reusable unit is the whole workflow rather than one call, prompt.\n\nThe useful consequence is that many capabilities split into a pair. notes://note-14 is the resource, notes_search is the tool that finds which id you wanted.',
      },
      {
        heading: 'The resources: URIs, subscriptions, templates',
        body: 'resources/list returns {uri, name, mimeType, description}. resources/read takes a uri and returns contents with text, or blob as base64 plus a mimeType for binary.\n\nURIs can be anything addressable: file:///Users/alice/notes/mcp.md, postgres://my-db/query/..., notes://note-14, memory://session-2026-04-22/recent.\n\nDeclare resources.subscribe true and the client can subscribe per URI; you then push notifications/resources/updated and it re-reads. The 2025-11-25 spec adds resourceTemplates, a parameterized pattern like notes://{id} with completion, so the host picker can autocomplete ids instead of showing a flat list.',
      },
      {
        heading: 'The prompts: slash-commands with argument forms',
        body: 'prompts/list returns {name, description, arguments}. prompts/get takes a name and arguments and returns a filled message list, not a string. A code_review prompt taking file_path might return three messages: a system message, a user message carrying the file body, and an assistant kickoff that seeds the reasoning shape.\n\nHosts surface these as slash-commands with a form for the arguments. That form is generated from your argument schema, so naming and ordering there is UI work.\n\nAnd MCP prompts are not system prompts. A well-behaved client layers them under its own operating instructions and never lets a server override them.',
      },
      {
        heading: 'The caching trap: stable URIs and bounded subscriptions',
        body: 'A resource URI does not have to be a file. notes://recent can compute the latest five on every read. db://query/users/active can run a parameterized query.\n\nThe rule that follows: if the client may cache by URI, the URI must be stable. If the content is one-shot, put a timestamp or nonce in the URI so the client cache does not serve stale content forever.\n\nSubscriptions cost per-session server state, namely who is watching what, so keep that set bounded and time out disconnected clients. Polling by re-read is equally spec-compliant, and your capability declaration is what tells the client which it gets.',
      },
    ],
    takeaways: [
      'Choosing tool over resource removes the attachment panel, the picker entry, and the subscription. That is an IA decision made in server code.',
      'The test is who initiates and how often: model on every related query means tool, user attaching context means resource, a whole reusable workflow means prompt.',
      'prompts/get returns a message list, and the host builds the argument form from your schema, so prompt argument naming is UI work.',
      'Stable URIs are cacheable, computed content needs a nonce or timestamp in the URI, and subscriptions are bounded per-session state you have to expire.',
    ],
    terms: [
      { term: 'Resource', meaning: 'URI-addressable read-only content the host can pull into context without the model deciding to call anything.' },
      { term: 'Resource URI', meaning: 'A scheme-prefixed identifier for a resource: file://, postgres://, notes://, or any custom scheme.' },
      { term: 'resources/subscribe', meaning: 'A client opt-in per URI that lets the server push notifications/resources/updated when the content changes.' },
      { term: 'Resource template', meaning: 'A parameterized URI pattern like notes://{id} with completion hints, so a host picker can autocomplete.' },
      { term: 'Prompt', meaning: 'A named multi-message template with typed arguments, surfaced by hosts as a slash-command with a form.' },
      { term: 'Dynamic resource', meaning: 'A resource whose content is computed per read rather than stored, which is why URI stability governs caching.' },
    ],
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
      'SEP-1724, official January 26, 2026, lets a tool return a ui:// resource with MIME text/html;profile=mcp-app. The host mounts it in a sandboxed iframe under a server-declared CSP, and the UI talks back over a postMessage JSON-RPC dialect. One HTML bundle renders in Claude Desktop, ChatGPT, Goose, Cursor, and VS Code.',
    readTime: '~8 min read',
    diagram: 'lessons/p13-14.svg',
    diagramCaption:
      'A tool result carrying a ui:// resource, the host reading it, mounting the sandboxed iframe, and mediating host.callTool over postMessage.',
    whyItMatters:
      'This is the one MCP lesson where you are the author of the interface, not a consumer of it. Your deliverable is a self-contained HTML bundle with no build system, no external stylesheet, no CDN font, and no network unless connect-src grants it, so every token and asset is inlined and the whole thing has to be theme-aware from the ui/initialize payload, which hands you theme and locale. You own four states inside a frame you do not control: loading before ui/initialize resolves, ready, permission-denied when the user refuses camera or geolocation, and host-call-failed when host.callTool returns isError. And because your frame overlays host chrome, visual distinction from host UI is a security requirement, not a style preference.',
    sections: [
      {
        heading: 'The problem: a paragraph where a timeline belonged',
        body: 'A 2025-era visualize_timeline tool returns "Here are 14 notes organized chronologically: ..." and that is a paragraph. The user wanted the timeline.\n\nBefore SEP-1724 there were two options, both bad. Client-specific widget APIs, meaning Claude artifacts for one host and Custom GPT HTML for another and a rewrite per client. Or no UI at all, and text output for everything including data that is only legible as a chart, a map, or a table.\n\nMCP Apps standardizes the contract instead, so one bundle renders identically everywhere that supports it.',
      },
      {
        heading: 'The move: ui:// plus a MIME plus _meta.ui',
        body: 'A tool result carries a normal text block and a {type: "ui_resource", uri: "ui://notes/timeline"} block. Alongside it, _meta.ui declares three things: resourceUri, a csp object (defaultSrc, scriptSrc, connectSrc), and a permissions array.\n\nThe host then calls resources/read on that ui:// URI and gets back contents with mimeType text/html;profile=mcp-app and the HTML in text.\n\nSo the UI is a resource, which means everything from lesson 13.10 still applies: URI stability governs caching, and the same read path serves it. The MIME and the _meta.ui binding are the only new pieces.',
      },
      {
        heading: 'The sandbox: what the frame actually gets',
        body: 'The host mounts your HTML in an iframe with sandbox="allow-scripts allow-same-origin" or stricter, applies your declared CSP, and gives you nothing from its own origin: no cookies, no localStorage. Network is limited to whatever connect-src permits, which defaults to none.\n\nThat is the practical constraint on how you build. No CDN script, no external font file, no remote image, no fetch to your own API unless you asked for it and the user granted it. Inline everything, data-URI your assets, and render from the payload the tool already returned.\n\nThe permissions array is the escape hatch: camera, microphone, geolocation, network:*. Each one is a prompt the user sees before your UI renders, so each one is a reason your first paint might never happen.',
      },
      {
        heading: 'The channel: postMessage JSON-RPC, origin-pinned',
        body: 'After load, the iframe sends ui/initialize over postMessage with theme, locale, and sessionId. The host answers with capabilities and a session token, and you attach that token to every subsequent call.\n\nFour host methods are available: host.callTool(name, arguments), host.readResource(uri), host.getPrompt(name, arguments), host.close(). Each one goes through the real MCP protocol and inherits the server\'s permissions, so a UI cannot reach past what the server could already do.\n\nNon-negotiable on both sides: pin targetOrigin to the peer\'s exact origin, and validate event.origin against an allowlist in the message listener before touching event.data. Never "*". The body of these messages carries tool calls.',
      },
      {
        heading: 'The surface: four attacks the sandbox does not stop',
        body: 'HTML in an iframe is still HTML. Prompt injection via UI: your frame can render text styled to look like a host system message and mislead the user, which is why hosts must visibly distinguish server UI from host chrome. Exfiltration via connect-src: a permissive connect-src *, and the frame can post anything it has to anywhere. Clickjacking: the frame overlays host chrome, so hosts enforce z-index and opacity rules. Focus theft: the frame grabs keyboard focus and captures the next message, so hosts intercept.\n\nClient support as of April 2026: Claude Desktop and ChatGPT full, Goose full, Cursor beta behind a setting, VS Code insiders only, Zed and Windsurf roadmapped.',
      },
    ],
    takeaways: [
      'Your deliverable is one self-contained HTML bundle: no CDN, no external font, no network beyond connect-src. Inline the tokens and data-URI the assets.',
      'ui/initialize hands you theme, locale, and a session token, so the frame is theme-aware from its first paint or it looks foreign in the host.',
      'Pin targetOrigin and validate event.origin on both sides of the postMessage channel. Never "*", because the payload carries host.callTool.',
      'Four states live inside the frame: loading before ui/initialize resolves, ready, permission-denied, and host-call-failed when host.callTool returns isError.',
    ],
    terms: [
      { term: 'MCP Apps', meaning: 'The SEP-1724 extension, official January 26, 2026, letting a tool return interactive sandboxed HTML instead of text.' },
      { term: 'ui:// scheme', meaning: 'The resource URI scheme identifying a UI bundle the host should mount rather than read as content.' },
      { term: 'text/html;profile=mcp-app', meaning: 'The MIME type that tells a host the HTML in a resource is an MCP App and should be sandboxed accordingly.' },
      { term: '_meta.ui', meaning: 'Tool-result metadata binding a result to its UI resource, plus the CSP and permissions the frame requests.' },
      { term: 'ui/initialize', meaning: 'The first postMessage from frame to host, answered with capabilities, theme, locale, and a session token.' },
      { term: 'AppRenderer and AppFrame', meaning: 'The ext-apps SDK pair: server side wraps a component into a ui:// resource, client side mounts the iframe and mediates postMessage.' },
    ],
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
