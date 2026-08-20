import type { Lesson } from '@/lib/lessons';

// Phase 13 · Part 4 · The tool ecosystem (lessons 13.18-13.20, 13.22, 13.23)
export const phase13Part4: Lesson[] = [
  {
    id: 'p13-18-mcp-auth-production',
    phase: 'Phase 13 · Tools and Protocols',
    part: 'Part 4 · The tool ecosystem',
    index: '13.18',
    title: 'MCP auth in production: enrollment, JWKS refresh, audience pinning',
    oneLiner:
      'An in-memory OAuth demo becomes a production auth surface at three points: how clients enroll without an admin, how signing keys refresh without a restart, and how a token proves it was minted for this server and no other.',
    readTime: '~8 min read',
    diagram: 'lessons/p13-18.svg',
    diagramCaption:
      'Discovery to validated tool call: protected-resource metadata, authorization-server metadata, enrollment, PKCE code flow with a resource indicator, then per-request JWT validation against a cached JWKS.',
    whyItMatters:
      'Every one of these mechanisms surfaces in your UI as a distinct state, and none of them is a generic error toast. A 401 with error="invalid_token" is a silent re-auth. A 403 with insufficient_scope plus a scope parameter is a step-up consent screen naming exactly the permission being requested. A stale JWKS produces a burst of 401s on previously working sessions, which is a retry banner, not a logout. And the consent screen itself carries a security requirement: display the redirect hostname, warn on localhost. The WWW-Authenticate header is the schema your error taxonomy renders from.',
    sections: [
      {
        heading: 'The problem: three gaps a memory-only simulator never shows',
        body: 'An in-process OAuth 2.1 walkthrough proves the state machine. Production adds three operational gaps it cannot see.\n\nEnrollment: a real org runs hundreds of MCP servers and thousands of clients. Nobody hand-registers every Cursor user as an OAuth client.\n\nKey rotation: the authorization server rotates signing keys, often hourly. A server that fetches the JWKS once at boot validates fine until the rotation window, then rejects everything until restart.\n\nAudience binding: a token minted for one MCP server must not work against another server in the same trust mesh. That check has to run on every request, not at session start.',
      },
      {
        heading: 'Enrollment: CIMD first, DCR as the fallback',
        body: 'The 2025-11-25 MCP authorization spec demoted RFC 7591 dynamic client registration from SHOULD to MAY and made Client ID Metadata Documents the recommended default.\n\nCIMD inverts registration from push to pull. The client uses an HTTPS URL it controls as its client_id. The authorization server fetches that JSON during the flow and rejects it unless the client_id inside equals the URL it was served from. Trust is rooted in DNS, so there is no client_id namespace to exhaust and no per-server registration state.\n\nDCR still works: POST /register, receive a client_id plus a registration_access_token. The client priority order is pre-registered id, then CIMD, then DCR, then prompt the user.',
      },
      {
        heading: 'The deployment gate: read the IdP metadata before you ship',
        body: 'RFC 8414 metadata at /.well-known/oauth-authorization-server is a contract you verify, not a document you skim. Four checks.\n\ncode_challenge_methods_supported must include S256. If the field is absent the authorization server does not support PKCE and the client MUST refuse to proceed. There is no degraded mode, so the server refuses to start.\n\ngrant_types_supported includes authorization_code and rejects password and implicit. response_types_supported is exactly ["code"]. And at least one enrollment path is advertised: client_id_metadata_document_supported true, or a registration_endpoint. Enrollment is the softer gate, because pre-registration can cover it.',
      },
      {
        heading: 'Rotate and refresh are different verbs',
        body: 'Rotate is what the authorization server does: mint a new signing key, publish it, retire the old one later. The resource server cannot rotate, it does not hold the private keys.\n\nRefresh is the only JWKS action a resource server performs: re-GET the published set into a cache. Wire a scheduled job that overwrites cache[issuer] on an interval, and a single synchronous re-fetch when a token arrives with a kid the cache does not hold.\n\nThe fallback must be a re-fetch, never a rotate. A rotate produces a brand new kid that still does not match, and an attacker spraying random kid values forces unbounded key creation: a self-inflicted denial of service. Two keys in the cache at once is steady state during the overlap window.',
      },
      {
        heading: 'Audience replay, and the mix-up attack the server cannot fix',
        body: 'Server A and Server B share an IdP. A is compromised and replays a notes token against B. B decodes, verifies the signature, passes the iss allow-list, then compares aud against its own canonical resource URL and fails. It returns 401 with error="invalid_token", error_description="audience mismatch", and resource_metadata pointing at the RFC 9728 document. The spec calls this access-token privilege restriction.\n\nMix-up is a different attack and lives client-side. A malicious authorization server steers the client into redeeming an honest server\'s code at the attacker\'s token endpoint. PKCE does not stop it, because the client hands the verifier to whatever endpoint it was steered to. RFC 9207 does: record the expected issuer before redirecting, compare the returned iss before redeeming.',
      },
    ],
    takeaways: [
      'If the IdP metadata does not list S256, refuse to deploy. PKCE has no degraded mode, so this is a boot-time check, not a runtime warning.',
      'CIMD is the 2025-11-25 default: an HTTPS URL you control is the client_id, and the authorization server pulls the metadata. DCR is backwards compatibility.',
      'The JWKS cache-miss fallback is a re-fetch, never a rotate. Rotating on a miss cannot produce the missing kid and turns bogus kid values into a key-creation DoS.',
      'Validate aud on every request against this server\'s canonical URL, and never treat a missing aud as a wildcard. That claim is the whole protocol-layer defense against replay.',
    ],
    terms: [
      { term: 'CIMD', meaning: 'Client ID Metadata Document: an HTTPS URL the client controls, used as its client_id and fetched by the authorization server.' },
      { term: 'DCR', meaning: 'RFC 7591 dynamic client registration: the client posts to /register and gets a client_id on the spot.' },
      { term: 'JWKS', meaning: 'JSON Web Key Set published at jwks_uri, indexed by kid, used to verify token signatures.' },
      { term: 'Resource indicator', meaning: 'The RFC 8707 resource parameter on a token request that pins the issued token to one server.' },
      { term: 'Audience replay', meaning: 'Presenting a token minted for Server A to Server B, defeated by comparing aud to the canonical resource URL.' },
      { term: 'Mix-up attack', meaning: 'A client steered into redeeming an honest server\'s authorization code at an attacker\'s token endpoint, defeated by the RFC 9207 iss check.' },
    ],
    demoCaption:
      'Fetch the JWKS once at boot and every session survives until the authorization server rotates a key, then all of them fail at once. Add a scheduled refresh plus a one-shot re-fetch on kid miss and the same rotation is invisible.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'JWKS handling at the resource server',
      badLabel: 'Fetch at boot',
      goodLabel: 'Refresh job plus miss re-fetch',
      badLines: [
        'GET jwks.json once at process start',
        'cache holds k_2026_03 forever',
        'AS publishes k_2026_04, retires k_2026_03',
        'every request 401s until restart',
      ],
      goodLines: [
        'scheduled job overwrites cache[issuer]',
        'unknown kid triggers one synchronous re-fetch',
        'cache holds both keys during overlap',
        'rotation costs zero failed requests',
      ],
      badCaption:
        'Boot-time fetch looks correct in every test, because tests never span a rotation window. In production it converts a routine hourly key roll into a total outage that only a restart clears.',
      goodCaption:
        'A cron refresh plus an idempotent re-fetch on cache miss covers both the schedule and the case where a token signed by a newer key arrives early. Wiring the miss path to a rotate instead produces a fresh kid that still does not match, and lets random kid values drive unbounded key creation.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'rotate and refresh are not the same verb, and conflating them is a real outage.',
        body:
          'rotate and refresh are not the same verb, and conflating them is a real outage.\n\nrotate: the authorization server mints a new signing key and retires the old one. your resource server cannot do this, it has no private keys.\n\nrefresh: your resource server re-GETs the published JWKS into a cache. that is the only JWKS action it ever performs.\n\nwire the cache-miss path to a rotate and you get a kid that still does not match, plus unbounded key creation from any attacker spraying random kids.',
      },
      {
        kind: 'X · design angle',
        hook: 'the WWW-Authenticate header is your error taxonomy, already typed.',
        body:
          'the WWW-Authenticate header is your error taxonomy, already typed.\n\n401 invalid_token: silent re-auth, no user-facing copy.\n401 audience mismatch: hard stop, this token was never for you.\n403 insufficient_scope with a scope param: step-up consent naming the exact permission.\n\nthree different components. one generic error toast throws away every distinction the protocol handed you for free.',
      },
      {
        kind: 'X · one-liner',
        hook: 'if the IdP metadata does not list S256, the MCP server refuses to start.',
        body:
          'if the IdP metadata does not list S256, the MCP server refuses to start.\n\nPKCE has no degraded mode. an absent code_challenge_methods_supported field means the authorization server does not support it, and the spec says MUST refuse.\n\nthat is a boot check, not a runtime warning.',
      },
    ],
    source: {
      label: 'Full lesson: 13.18 18-mcp-auth-production',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/13-tools-and-protocols/18-mcp-auth-production',
    },
  },
  {
    id: 'p13-19-a2a',
    phase: 'Phase 13 · Tools and Protocols',
    part: 'Part 4 · The tool ecosystem',
    index: '13.19',
    title: 'A2A: delegating a task to an agent you cannot see inside',
    oneLiner:
      'MCP is agent-to-tool and transparent. A2A is agent-to-agent and deliberately opaque: you send a Task, you watch a lifecycle, you receive Artifacts, and you never learn how the other agent did it.',
    readTime: '~8 min read',
    diagram: 'lessons/p13-19.svg',
    diagramCaption:
      'A caller sends a Task with mixed Parts, the called agent moves through working and input-required, and returns a named Artifact while its internals stay hidden.',
    whyItMatters:
      'Opacity is a UI constraint disguised as a protocol principle. With MCP you can render a tool-call trace, so the progress state is a list of steps. With A2A you have exactly seven lifecycle states and no interior, so the progress component is a state machine over submitted, working, input-required, completed, failed, canceled, rejected. Two of those need real surfaces: input-required is a mid-task form that pauses your own run, and rejected is different from failed because retrying will not help. Output is an Artifact, so you render a named typed object with a mimeType, streamed in chunks, not a string.',
    sections: [
      {
        heading: 'The problem: MCP does not model agent collaboration',
        body: 'A customer-service agent needs a specialist writer agent to produce a report. Pre-A2A the options were all bad. A custom REST API works, but every pairing is a one-off. A shared codebase forces both agents onto the same framework. MCP does not fit, because MCP models calling a tool, not delegating work to a peer that has its own reasoning.\n\nA2A models the interaction as one agent sending a Task to another, with a lifecycle, messages, and artifacts. Google announced it in April 2025, donated it to the Linux Foundation in June 2025, and v1.0 landed in April 2026 with over 150 supporting organizations including AWS, Cisco, Microsoft, Salesforce, SAP, and ServiceNow. It absorbed IBM\'s ACP and gained the AP2 payments extension.',
      },
      {
        heading: 'The Agent Card: discovery as a fetchable document',
        body: 'Every A2A agent publishes a card at /.well-known/agent.json. The card names the A2A endpoint URL and enumerates the agent\'s skills, where a skill is a named callable operation, the A2A analog of an MCP tool.\n\nDiscovery is therefore URL-based and cheap: fetch the card, read the endpoint, list the skills. That maps directly onto a picker UI, because you can render a remote agent\'s capabilities without invoking anything.\n\nThe AP2 extension (September 2025) adds cryptographic signatures. The publisher signs its own card with a JWT and consumers verify, which is what stops a hostile agent from impersonating a known one. Where MCP authorizes with OAuth 2.1, A2A trust starts with a signed card.',
      },
      {
        heading: 'The Task lifecycle is the component you actually build',
        body: 'A client initiates with tasks/send. The called agent then transitions: submitted, working, input-required, and terminally completed, failed, canceled, or rejected. Clients either subscribe to state updates over SSE or poll.\n\nTwo states deserve their own design. input-required is a pause where the called agent asks for a clarification, so your run stops and a form appears mid-flight, which means your own agent loop needs a suspend-and-resume path rather than a timeout. rejected is not failed: the agent declined the task outright, so a retry affordance is wrong and the correct surface explains the decline.',
      },
      {
        heading: 'Messages, Parts, and Artifacts',
        body: 'A Message carries one or more Parts, and Parts are typed: text is plain content, file is a base64 blob with a mimeType, data is a typed JSON payload for structured input. One Task can carry a PDF and an instruction in the same message, which is why the input surface is an attachment composer, not a text field.\n\nOutputs are Artifacts, not raw strings. An Artifact is a named typed output and can arrive as streamed chunks that the caller accumulates. That is a different render than token streaming: you are appending to a named object with a known type, so the skeleton can be shaped before the first chunk lands.',
      },
      {
        heading: 'When to reach for A2A instead of MCP',
        body: 'Use MCP when you want to invoke a specific tool and see the call. Use A2A when you want to hand a whole task to another agent and accept not seeing inside. Many production systems run both: MCP for the tool layer, A2A for the collaboration layer.\n\nThe opacity is intentional. It lets competitors collaborate without revealing internals, so "call this customer-service agent" does not leak how the service is implemented. The cost is debuggability. When an A2A sub-agent is slow you cannot see which of its tools hung, only that the Task sat in working. Two transport bindings carry the same logical shape: JSON-RPC over HTTP with optional SSE is the default, gRPC is for enterprise environments where gRPC is native.',
      },
    ],
    takeaways: [
      'A2A gives you seven lifecycle states and no interior. Your progress component is a state machine over those states, not a step trace.',
      'input-required is a mid-task pause, so the calling agent needs suspend-and-resume, and rejected is not failed, so it must not offer a retry.',
      'Outputs are named typed Artifacts that stream as chunks, which lets you shape the render target before the first chunk arrives.',
      'Run both protocols: MCP for the transparent tool layer, A2A for delegation, and accept that opacity trades debuggability for cross-framework reach.',
    ],
    terms: [
      { term: 'A2A', meaning: 'Agent2Agent, an open protocol for collaboration between opaque agents built on different frameworks.' },
      { term: 'Agent Card', meaning: 'The document at /.well-known/agent.json naming an agent\'s endpoint and skills.' },
      { term: 'Task', meaning: 'A unit of delegated work with a lifecycle and a final artifact.' },
      { term: 'Part', meaning: 'A typed element of a message: text, file with mimeType, or structured data.' },
      { term: 'Artifact', meaning: 'A named typed output returned on task completion, optionally streamed in chunks.' },
      { term: 'Opacity', meaning: 'The design principle that the called agent\'s reasoning and tool calls stay invisible to the caller.' },
    ],
    demoCaption:
      'An MCP tool call and an A2A task both return an answer, but they hand you different amounts of interior. Compare what the progress UI can honestly show in each.',
    demo: {
      archetype: 'before-after',
      subject: 'What the caller can render',
      badLabel: 'MCP tool call',
      goodLabel: 'A2A task',
      badLines: [
        'tools/call search_arxiv',
        'arguments visible in the trace',
        'result returned inline',
        'you can render every step',
      ],
      goodLines: [
        'tasks/send with text plus file parts',
        'state: submitted, working, input-required',
        'artifact: report.md, text/markdown',
        'inner tool calls never surfaced',
      ],
      badCaption:
        'MCP is transparent by design, so the progress surface can be a literal step list and a failure names the tool that broke. That transparency is exactly what a peer agent will not give you.',
      goodCaption:
        'A2A hands you a lifecycle and an artifact. The honest progress UI is a state machine, input-required needs a mid-flight form, and when a task sits in working you cannot say which of the sub-agent\'s tools hung.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'MCP is agent-to-tool. A2A is agent-to-agent. the difference is opacity, on purpose.',
        body:
          'MCP is agent-to-tool. A2A is agent-to-agent. the difference is opacity, on purpose.\n\nyou send a Task. it moves through submitted, working, input-required, then completed or failed or canceled or rejected. you get back named typed Artifacts.\n\nwhat you never get: the other agent\'s chain of thought, its tool calls, its own sub-agents.\n\nthat is what lets two competitors collaborate without either shipping their internals.',
      },
      {
        kind: 'X · design angle',
        hook: 'opacity is a protocol principle that lands on your loading state.',
        body:
          'opacity is a protocol principle that lands on your loading state.\n\nwith MCP the progress UI can be a step list, because you see every tool call.\n\nwith A2A you have seven states and no interior. so it is a state machine, and two of those states need real surfaces:\n\ninput-required is a form that appears mid-run, so your loop needs suspend and resume.\nrejected is not failed. no retry button.',
      },
      {
        kind: 'X · one-liner',
        hook: 'A2A outputs are Artifacts, not strings.',
        body:
          'A2A outputs are Artifacts, not strings.\n\nnamed, typed, with a mimeType, streamable in chunks.\n\nthat is not token streaming. you know the shape of the thing before the first chunk arrives, so the skeleton can be right on frame one.',
      },
    ],
    source: {
      label: 'Full lesson: 13.19 19-a2a-protocol',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/13-tools-and-protocols/19-a2a-protocol',
    },
  },
  {
    id: 'p13-20-otel-genai',
    phase: 'Phase 13 · Tools and Protocols',
    part: 'Part 4 · The tool ecosystem',
    index: '13.20',
    title: 'OpenTelemetry GenAI: one trace across the model, the tools, and the sub-agents',
    oneLiner:
      'An agent calls five tools, three MCP servers, and two sub-agents. The GenAI semantic conventions give every one of those hops a span with the same attribute names, so a single trace id explains where the 30 seconds went.',
    readTime: '~8 min read',
    diagram: 'lessons/p13-20.svg',
    diagramCaption:
      'One trace id with nested spans: invoke_agent at the root, chat spans for the model, execute_tool spans for each dispatch, and a CLIENT span per MCP round-trip.',
    whyItMatters:
      'Latency you cannot attribute becomes latency you cannot design around. "Sometimes 30 seconds, sometimes 3" is not a slow model, it is a cold-start on one MCP server, and only a per-hop span tells you which. That distinction changes the surface: a slow model gets streaming and a skeleton, a slow tool gets a named per-tool progress row, and a hanging server gets a timeout with a retry scoped to that hop. The other design decision is content capture, which is off by default. Turning on gen_ai.content.prompt puts user text into your observability backend, so it is a privacy decision, not a debug flag.',
    sections: [
      {
        heading: 'The problem: logs show the model call and nothing else',
        body: 'A February 2026 debug. Users report that the agent sometimes takes 30 seconds and sometimes 3. The logs show the LLM call. They do not show the tool dispatch, the MCP server round-trip, or the sub-agent. So you guess, and eventually you find it: one MCP server occasionally hangs on a cold start.\n\nWithout end-to-end tracing that bug is unfindable, because the only timing you recorded is the part that was fine. The GenAI semantic conventions settled in 2025 and 2026 under the OpenTelemetry semantic-conventions group, with stable attributes from v1.37, and they are natively parsed by Datadog, Langfuse, Arize Phoenix, OpenLLMetry, and AgentOps. Instrument once, ship anywhere.',
      },
      {
        heading: 'The span hierarchy and the attributes that make it queryable',
        body: 'Everything nests under one trace id, with parent-child encoded by span ids: invoke_agent at the root, chat spans for model calls, execute_tool spans for each dispatch.\n\nThe required attributes for a model span are gen_ai.operation.name (chat, text_completion, embeddings, execute_tool, invoke_agent), gen_ai.provider.name, gen_ai.request.model, gen_ai.response.model, gen_ai.usage.input_tokens and output_tokens, and gen_ai.response.id for correlating with the provider.\n\nTool spans add gen_ai.tool.name and gen_ai.tool.call.id. Agent spans add gen_ai.agent.name and id. Requested model and served model are two separate fields, which is how you catch a silent downgrade.',
      },
      {
        heading: 'Span kinds mark the process boundaries',
        body: 'CLIENT is for calls that cross a process boundary: the model provider, an MCP server. INTERNAL is for the agent\'s own loop steps and for tool execution that happens in your process.\n\nThat one distinction is the most useful thing in the trace, because it separates "our code is slow" from "someone else\'s service is slow," and those two facts point at completely different fixes. A slow INTERNAL span is yours to optimize. A slow CLIENT span is a timeout, a retry policy, and a UI state that admits the wait belongs to a remote hop.\n\nAlongside spans, the conventions define metrics: gen_ai.client.token.usage, gen_ai.client.operation.duration, and gen_ai.tool.execution.duration, all histograms, for dashboards that do not need per-call detail.',
      },
      {
        heading: 'Content capture is opt-in, and that is a privacy boundary',
        body: 'By default spans carry metrics and timing, not prompts or completions. Large payloads and personal data are off deliberately.\n\nEnabling them means setting OTEL_SEMCONV_STABILITY_OPT_IN=gen_ai_latest_experimental plus specific content-capture variables, after which span events appear: gen_ai.content.prompt for input messages, gen_ai.content.completion for outputs, gen_ai.content.tool_call for the call as recorded. Events time-order inside a span, which gives you a replay.\n\nThat replay is genuinely the best debugging artifact available, and it also means user text now lives in your observability vendor. Treat the flag as a data-handling decision that needs review, not as a verbosity level.',
      },
      {
        heading: 'Propagating context across MCP, including the stdio gap',
        body: 'A trace only spans services if the context travels. When an MCP client calls a server, inject the W3C traceparent header. Streamable HTTP carries standard headers, so this is free.\n\nStdio does not carry HTTP headers at all. The protocol roadmap for 2026 discusses a _meta.traceparent field on JSON-RPC calls, and until it ships you put the traceparent into _meta on every request by hand and have the server log the trace id.\n\nExport is not the hard part. Jaeger, Tempo, Langfuse, Arize Phoenix, Datadog, and Honeycomb all speak OTLP, so your instrumentation does not encode a vendor. AgentOps wraps LangGraph, Pydantic AI, and CrewAI to emit spans automatically if you are on a supported framework.',
      },
    ],
    takeaways: [
      'Instrument every hop, not just the model call. "Sometimes 30 seconds" is almost always a tool or server span, and the model span will look fine the whole time.',
      'SpanKind CLIENT versus INTERNAL separates your slowness from someone else\'s, and those two facts demand different UI: optimization versus a scoped timeout and retry.',
      'gen_ai.request.model and gen_ai.response.model are separate attributes, so a silent model downgrade is visible in the trace rather than inferred from vibes.',
      'Content capture is off by default. Turning it on moves user text into your observability backend, which is a privacy review, not a log level.',
    ],
    terms: [
      { term: 'GenAI semconv', meaning: 'The OpenTelemetry semantic conventions defining stable gen_ai.* attribute names for model, tool, and agent spans.' },
      { term: 'Span', meaning: 'One timed operation with a start, an end, and attributes, linked to a parent by span id.' },
      { term: 'Trace id', meaning: 'The shared identifier that ties every span of one request into a single tree.' },
      { term: 'SpanKind', meaning: 'A hint about direction: CLIENT for cross-process calls, INTERNAL for in-process work.' },
      { term: 'OTLP', meaning: 'The OpenTelemetry wire protocol every supported backend accepts, which keeps instrumentation vendor-neutral.' },
      { term: 'traceparent', meaning: 'The W3C header that carries trace context across services, absent from stdio and hand-placed in _meta until the spec adds it.' },
    ],
    demoCaption:
      'One request took 30 seconds. The roll-up number hides where they went, and the per-span breakdown moves the fix from the model to a single cold-starting MCP server.',
    demo: {
      archetype: 'meter',
      subject: 'Agent run · total latency',
      headline: 'total 30.4s',
      breakdown: [
        { label: 'invoke_agent overhead (INTERNAL)', value: 0.3 },
        { label: 'chat span, first model call (CLIENT)', value: 1.8 },
        { label: 'execute_tool search_arxiv (INTERNAL)', value: 0.4 },
        { label: 'MCP round-trip, cold start (CLIENT)', value: 26.1 },
        { label: 'chat span, final synthesis (CLIENT)', value: 1.8 },
      ],
      badCaption:
        '30.4 seconds with only a model-call log reads as a slow model, so the instinct is to swap models or trim the prompt. Both model spans together are 3.6 seconds and were never the problem.',
      goodCaption:
        'Per-span attribution puts 26.1 of the 30.4 seconds in one CLIENT span, an MCP server cold start. That is a scoped timeout, a retry on that hop, and a named progress row, not a smaller prompt.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: '"sometimes 30 seconds, sometimes 3" is not a slow model. it is an unattributed hop.',
        body:
          '"sometimes 30 seconds, sometimes 3" is not a slow model. it is an unattributed hop.\n\nthe OTel GenAI conventions give every hop the same attribute names. invoke_agent at the root, chat spans for the model, execute_tool for each dispatch, one trace id across all of it.\n\nwe traced a real 30s case: both model spans totalled 3.6s. 26.1s was one MCP server cold-starting.\n\nyou cannot fix what you never timed.',
      },
      {
        kind: 'X · design angle',
        hook: 'SpanKind CLIENT vs INTERNAL is a UI decision, not an ops detail.',
        body:
          'SpanKind CLIENT vs INTERNAL is a UI decision, not an ops detail.\n\nINTERNAL slow means our code is slow. that is optimization work.\n\nCLIENT slow means someone else\'s service is slow. that is a timeout, a retry scoped to that hop, and a progress row that names which remote thing you are waiting on.\n\none generic spinner collapses two problems with two different fixes into one shrug.',
      },
      {
        kind: 'X · one-liner',
        hook: 'gen_ai.content.prompt is off by default and that default is correct.',
        body:
          'gen_ai.content.prompt is off by default and that default is correct.\n\nturning it on gives you the best replay artifact you will ever have for debugging an agent, and it puts user text inside your observability vendor.\n\nthat is a privacy review, not a log level.',
      },
    ],
    source: {
      label: 'Full lesson: 13.20 20-opentelemetry-genai',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/13-tools-and-protocols/20-opentelemetry-genai',
    },
  },
  {
    id: 'p13-22-skills-agent-sdks',
    phase: 'Phase 13 · Tools and Protocols',
    part: 'Part 4 · The tool ecosystem',
    index: '13.22',
    title: 'Skills, AGENTS.md, and knowing which layer a thing belongs in',
    oneLiner:
      'MCP says what tools exist. A skill says how to do a task. AGENTS.md says how this project works. Three layers with three load times, and most agent frustration is a thing sitting in the wrong one.',
    readTime: '~8 min read',
    diagram: 'lessons/p13-22.svg',
    diagramCaption:
      'Three layers by load time: AGENTS.md at session start, SKILL.md on invocation with sub-resources pulled on demand, MCP tools when an action is needed.',
    whyItMatters:
      'This is the layer you already author, and the load time is the whole design. AGENTS.md is in context for every turn, so every line you add is a permanent tax on the budget. A skill body loads only when invoked, so it can be long, and its sub-resources load only when the body says to read them, which is progressive disclosure applied to a prompt instead of a screen. A frontmatter description is a router: it is the only text the model sees when deciding whether to load, so a vague one produces a skill that never fires or one that fires on everything.',
    sections: [
      {
        heading: 'The problem: one workflow, three copies',
        body: 'An engineer distills a release-notes workflow into a multi-step prompt: read the merged PRs, group by area, summarize each, write the changelog in the team\'s style, post a Slack draft. It goes into a Notion doc.\n\nThen they want it from Claude Code, from Cursor, and from Codex CLI, and each has its own way to load instructions. So they keep three copies, and the copies drift.\n\nThe fix is not a bigger prompt, it is separating what is project-specific from what is workflow-specific from what is an action. Those three things have different lifetimes, so they belong in different files.',
      },
      {
        heading: 'The three layers and their load times',
        body: 'AGENTS.md sits at the repo root and every compatible agent reads it on session start: conventions, which commands run tests, how the project is laid out. It launched in late 2025 and was in more than 60,000 repos by April 2026, read by Claude Code, Cursor, Codex, Copilot Workspace, opencode, Windsurf, and Zed.\n\nSKILL.md is a portable bundle: YAML frontmatter with a name and a description, a markdown body, and optional resources. Anthropic released Agent Skills as an open standard in December 2025. Runtimes discover them by scanning known directories, keyed by folder name and frontmatter name.\n\nMCP is the third layer and holds the actual callable actions the skill invokes.',
      },
      {
        heading: 'Progressive disclosure, written as files',
        body: 'A skill body can reference sub-resources the agent fetches only when it needs them. SKILL.md says "see style-guide.md for the style rules," and style-guide.md enters context only while the skill is running.\n\nThis is the same disclosure discipline as a UI, applied to a context budget. The frontmatter description is the trigger affordance. The body is the default view. The sub-resources are the detail-on-demand layer.\n\nSo write the body as the shortest complete instruction set, and push tables, long examples, and reference material into files the body points at by name. A skill that inlines everything defeats the mechanism and just becomes a large prompt with a slash command in front of it.',
      },
      {
        heading: 'When a skill is the wrong abstraction',
        body: 'Three honest failure cases.\n\nIf the thing is one deterministic action with a fixed input and output, it is a tool, not a skill. A skill wrapping a single call adds a routing decision and a prompt-load for nothing, and a tool schema is stricter than prose.\n\nIf the thing is long-running, needs its own context window, or the output is a summary you want without the intermediate reading, it is a subagent. Skills run in your context and spend your budget; that is exactly what you do not want for a wide search.\n\nAnd if the instruction applies to every task in the repo, it is AGENTS.md. A skill nobody remembers to invoke is documentation with extra steps.',
      },
      {
        heading: 'Portability, and where the ecosystem sits',
        body: 'The Claude Agent SDK, TypeScript as @anthropic-ai/claude-agent-sdk and Python as claude-agent-sdk, loads skills at session start and exposes them as callable agents inside the runtime, so the loop dispatches to a skill on invocation.\n\nOpenAI\'s Apps SDK, launched October 2025, is built directly on MCP: an MCP server plus widget metadata for the ChatGPT UI plus an optional ui:// resource for interactive surfaces. It unified the earlier Connectors and Custom GPT Actions onto one protocol, which is why an MCP server you already ship is most of an Apps SDK app.\n\nCross-agent layers like SkillKit translate one SKILL.md into the native format of 32 or more agents. One source of truth, many consumers, which is the same argument as a design token.',
      },
    ],
    takeaways: [
      'Pick the layer by load time: AGENTS.md is in context every turn and taxes the budget permanently, a skill body loads on invocation, sub-resources load only when named.',
      'The frontmatter description is a router, not a summary. Vague descriptions produce skills that never trigger or trigger on everything.',
      'One deterministic action is a tool. Wide reading you only want the conclusion of is a subagent. A rule that applies to every task is AGENTS.md.',
      'Write the skill body as the shortest complete instruction set and push tables and examples into sub-resources, or you have written a large prompt with a slash command in front of it.',
    ],
    terms: [
      { term: 'SKILL.md', meaning: 'A portable skill file: YAML frontmatter plus a markdown body, loaded by name when invoked.' },
      { term: 'AGENTS.md', meaning: 'A repo-root file of project conventions that compatible agents read at session start.' },
      { term: 'Progressive disclosure', meaning: 'Keeping detail in sub-resources the skill body pulls only when the task needs them.' },
      { term: 'Frontmatter description', meaning: 'The one line the model uses to decide whether to load a skill, so it functions as a router.' },
      { term: 'Claude Agent SDK', meaning: 'Anthropic\'s runtime that loads skills at session start and dispatches to them from the agent loop.' },
      { term: 'Apps SDK', meaning: 'OpenAI\'s developer surface: an MCP server plus ChatGPT widget metadata and optional ui:// resources.' },
    ],
    demoCaption:
      'The same release-notes workflow, written twice. One inlines everything into the skill body, the other splits by load time, and the difference shows up as tokens spent on turns that never needed them.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Release-notes workflow · where the words live',
      badLabel: 'One big file',
      goodLabel: 'Split by load time',
      badLines: [
        'AGENTS.md: full changelog style guide inlined',
        'SKILL.md: steps plus every example plus the tone table',
        'no sub-resources',
        'the style guide is in context on every unrelated turn',
      ],
      goodLines: [
        'AGENTS.md: test command, layout, conventions only',
        'SKILL.md frontmatter: a description precise enough to route',
        'SKILL.md body: the shortest complete step list',
        'style-guide.md and examples.md read only while running',
      ],
      badCaption:
        'Inlining reads as thorough and spends the budget on turns that never touch release notes. It also blurs the trigger: a description buried under a tone table gives the router nothing to match on.',
      goodCaption:
        'Split by when each thing is needed. Session-start rules in AGENTS.md, the instruction set in the body, reference material in files the body names. The description does one job, which is deciding whether to load at all.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'three layers, three load times. most agent frustration is a thing in the wrong one.',
        body:
          'three layers, three load times. most agent frustration is a thing in the wrong one.\n\nAGENTS.md: read at session start, in context every turn.\nSKILL.md: loaded when invoked.\nsub-resources: pulled only when the body names them.\nMCP: called when an action is needed.\n\nAGENTS.md at 60,000+ repos by April 2026. skills shipped as an open standard in December 2025.\n\nthe load time is the design.',
      },
      {
        kind: 'X · design angle',
        hook: 'a skill is progressive disclosure for a context budget.',
        body:
          'a skill is progressive disclosure for a context budget.\n\nthe frontmatter description is the trigger affordance. the body is the default view. sub-resources are detail on demand.\n\nso the same rule applies as on a screen: if everything is in the default view, you have not disclosed anything. you have written a large prompt with a slash command on the front.',
      },
      {
        kind: 'X · one-liner',
        hook: 'not everything should be a skill.',
        body:
          'not everything should be a skill.\n\none deterministic call with a fixed input and output is a tool. a schema is stricter than prose.\n\nwide reading where you only want the conclusion is a subagent. skills spend your context, subagents spend theirs.\n\na rule that applies to every task is AGENTS.md.',
      },
    ],
    source: {
      label: 'Full lesson: 13.22 22-skills-and-agent-sdks',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/13-tools-and-protocols/22-skills-and-agent-sdks',
    },
  },
  {
    id: 'p13-23-capstone-ecosystem',
    phase: 'Phase 13 · Tools and Protocols',
    part: 'Part 4 · The tool ecosystem',
    index: '13.23',
    title: 'Capstone: the whole tool ecosystem in one request',
    oneLiner:
      'One question, "summarize the three most-cited 2026 arXiv papers on agent protocols," touches every primitive in the phase: an MCP server, an OAuth gateway with RBAC, an A2A sub-agent, a ui:// render surface, and one OTel trace over all of it.',
    readTime: '~8 min read',
    diagram: 'lessons/p13-23.svg',
    diagramCaption:
      'Client to gateway to MCP servers, with an A2A delegation to a writer agent, a ui:// resource returned to the host, and one trace id spanning every hop.',
    whyItMatters:
      'Composing the pieces is where the interface decisions actually resolve. The task lifecycle means the surface is a long-running job with a progress state, not a request that returns. RBAC means the same screen renders differently for two users, so generate_report is a disabled affordance for a read-only role and not a 403 after the click. The report comes back as content blocks plus a ui:// resource rendered in a sandboxed iframe whose only outward call is host.callTool, so every interactive element in your dashboard is a tool invocation with a permission attached. One trace id is what makes a slow run explainable to the person waiting.',
    sections: [
      {
        heading: 'The shape: search, delegate, render, trace',
        body: 'The scenario is research and report. A user asks for a summary of the three most-cited 2026 arXiv papers on agent protocols. The system searches arXiv through MCP, delegates paper summarization to a specialist writer agent over A2A, aggregates the results, renders an interactive report as an MCP Apps ui:// resource, and logs every step to OTel.\n\nThis is not a contrived assembly. Production research assistants shipped in 2026, Anthropic\'s Claude Research product, OpenAI\'s GPTs on the Apps SDK, and third-party systems, have this exact shape: a tool layer, a delegation layer, a render surface, and telemetry.',
      },
      {
        heading: 'The gateway holds the credentials and the policy',
        body: 'OAuth 2.1 with PKCE and a resource indicator pins the audience to the gateway, so the client only ever holds a gateway-issued token. Upstream credentials stay at the gateway and the user never sees them.\n\nRBAC is enforced there too. In the reference setup alice has research:read and research:write and can call every tool. bob has research:read only, so generate_report is refused. The gateway also merges multiple backend servers into one namespace, prefixing on collision, which is what lets the client hold one tool list instead of one per server.\n\nAnd it pins tool description hashes, dropping any server whose descriptions changed, which is the tool-poisoning defense applied continuously rather than once at install.',
      },
      {
        heading: 'Two boundaries the design has to respect',
        body: 'The A2A call is an opacity boundary. The orchestrator sees the writer agent\'s task state and its returned artifact, never its reasoning or its own tool calls. That is deliberate, and it means a slow summarization step is a state, not a trace you can drill into.\n\nThe ui:// resource is a sandbox boundary. generate_report returns content blocks plus ui://report/current, and the host renders the interactive dashboard in a sandboxed iframe: a sorted paper list, citation counts, and a button that calls host.callTool with an arxiv_id. Every control inside that dashboard is a tool call crossing the sandbox, so it inherits the gateway\'s RBAC and shows up in the trace like any other dispatch.',
      },
      {
        heading: 'Defense in depth, and the Rule of Two audit',
        body: 'The security posture is layered rather than single-gate: OAuth 2.1 at the edge, RBAC per role, pinned description hashes, an audit log, and a Rule of Two review.\n\nThe Rule of Two check is the one worth running by hand. No single tool may combine untrusted input, access to sensitive data, and a consequential action. Any two of the three is tolerable, all three is the shape of a prompt-injection exploit.\n\nRun that audit against the tool list, not the architecture diagram, because the combination appears when a convenient tool grows one extra capability. Nothing in the gateway config changes; the exposure does.',
      },
      {
        heading: 'Packaging is what makes it reproducible',
        body: 'The whole stack ships with an AGENTS.md and a SKILL.md, and those two files are the entire onboarding surface. A teammate on Claude Code, Cursor, Codex, or opencode drives the system by invoking the run-research skill. Deployment is docker compose up.\n\nThat is the real test of the phase. If another agent needs the source tree to reproduce the workflow, the packaging failed. If it needs two files and a compose command, the layering held.\n\nOne trace id runs through all of it, and its value is not only debugging. It is the only honest source for the progress UI, because it knows which hop is currently taking the time.',
      },
    ],
    takeaways: [
      'A task lifecycle turns the surface into a long-running job: progress state, cancel, and a terminal state that is not just success or error.',
      'RBAC belongs in the render, not the response. A read-only role sees generate_report disabled with a reason, not a 403 after the click.',
      'A ui:// resource is a sandbox whose only outward call is host.callTool, so every control in it is a permissioned tool invocation and appears in the trace.',
      'Audit the tool list against the Rule of Two, not the diagram. Untrusted input plus sensitive data plus a consequential action in one tool is the exploit shape.',
    ],
    terms: [
      { term: 'Gateway-issued token', meaning: 'Transitive auth where the client holds only the gateway\'s token and the gateway keeps upstream credentials.' },
      { term: 'Merged namespace', meaning: 'One flat tool list assembled from several backend MCP servers, prefixed when names collide.' },
      { term: 'Opacity boundary', meaning: 'The A2A edge past which a sub-agent\'s reasoning and tool calls are invisible to the orchestrator.' },
      { term: 'ui:// resource', meaning: 'An MCP Apps resource the host renders in a sandboxed iframe, calling back only through host.callTool.' },
      { term: 'Rule of Two', meaning: 'The audit rule that no one tool may combine untrusted input, sensitive data access, and a consequential action.' },
      { term: 'Pinned description manifest', meaning: 'Recorded hashes of tool descriptions, used to drop a server whose descriptions changed after install.' },
    ],
    demoCaption:
      'One request, seven hops, in order. The positions of the OAuth check and the RBAC decision are the whole design, because moving them later turns a disabled button into a failure after the click.',
    demo: {
      archetype: 'sequence',
      subject: 'Research and report · one request',
      badLabel: 'Check on the way out',
      goodLabel: 'Check at the edge',
      badSequence: [
        'client sends the query straight through',
        'gateway merges tools from every backend',
        'orchestrator dispatches search_arxiv',
        'orchestrator dispatches generate_report',
        'A2A writer agent runs the summaries',
        'gateway checks the role on the response',
        '403 renders after the work is already paid for',
      ],
      goodSequence: [
        'OAuth 2.1 with PKCE, audience pinned to the gateway',
        'gateway resolves the role and filters the tool list',
        'client renders generate_report disabled for read-only',
        'search_arxiv dispatched, span opens on the trace',
        'A2A delegation, task state visible, internals opaque',
        'ui://report/current returned to the host sandbox',
        'one trace id explains every hop after the fact',
      ],
      badCaption:
        'Authorizing on the way out means the tool list the user sees does not match the tool list they may call. The role failure lands as a 403 on a button that looked live, after the tokens are spent.',
      goodCaption:
        'Resolve the role at the edge and the filtered tool list becomes render state: a read-only user sees generate_report disabled with a reason. The trace id opens at the first hop, so the progress UI can name which step is currently slow.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'one question touches every primitive in the phase.',
        body:
          'one question touches every primitive in the phase.\n\n"summarize the three most-cited 2026 arXiv papers on agent protocols."\n\nMCP for the arXiv search. OAuth 2.1 with an audience pinned to the gateway. RBAC on the tool list. A2A to a writer agent for the summaries. a ui:// resource for the report. one OTel trace id over all of it.\n\nproduction research assistants shipped in 2026 have exactly this shape.',
      },
      {
        kind: 'X · design angle',
        hook: 'RBAC belongs in the render, not the response.',
        body:
          'RBAC belongs in the render, not the response.\n\nresolve the role at the gateway edge and filter the tool list before the client draws anything. a read-only user sees generate_report disabled, with a reason.\n\ncheck on the way out instead and the same user gets a live-looking button, a full agent run, and a 403 after the tokens are spent.\n\nsame policy. completely different product.',
      },
      {
        kind: 'X · one-liner',
        hook: 'a ui:// resource is a sandbox with exactly one way out: host.callTool.',
        body:
          'a ui:// resource is a sandbox with exactly one way out: host.callTool.\n\nwhich means every button in your interactive report is a permissioned tool invocation. it inherits the gateway RBAC and it shows up in the trace like any other dispatch.\n\ndashboard controls and agent actions stop being two different things.',
      },
    ],
    source: {
      label: 'Full lesson: 13.23 23-capstone-tool-ecosystem',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/13-tools-and-protocols/23-capstone-tool-ecosystem',
    },
  },
];
