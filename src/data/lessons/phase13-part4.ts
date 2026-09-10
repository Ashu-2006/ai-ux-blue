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
      'An in-memory OAuth demo becomes a production surface at three points: enrollment without an admin, key refresh without a restart, and a token proving it was minted for this server alone.',
    readTime: '~10 min read',
    diagram: '/lessons/p13-18.svg',
    diagramCaption:
      'Discovery to validated tool call: protected-resource metadata, authorization-server metadata, enrollment, PKCE code flow with a resource indicator, then per-request JWT validation against a cached JWKS.',
    whyItMatters:
      'Every one of these mechanisms surfaces in your UI as a distinct state, never a generic error toast. A 401 with error="invalid_token" is a silent re-auth. A 403 with insufficient_scope plus a scope parameter is a step-up consent screen naming the exact permission. A stale JWKS produces a burst of 401s on sessions that worked five minutes earlier, which is a retry banner, not a logout. The consent screen itself carries a security requirement: show the redirect hostname, warn on localhost. WWW-Authenticate is the error taxonomy your UI renders from, already typed for you.',
    learningObjectives: [
      'Read RFC 8414 authorization-server metadata and refuse deployment when S256 is missing.',
      'Explain why Client ID Metadata Documents replaced RFC 7591 dynamic registration as the 2026-07-28 default.',
      'Trace a JWKS cache miss to a re-fetch, never a rotate, and say why the wrong wiring becomes a denial of service.',
      'Distinguish audience replay, a server-side aud check, from a mix-up attack, a client-side RFC 9207 iss check.',
      'Decide when a resource server needs opaque-token introspection instead of JWT decoding.',
      'Design the error states a consent and re-auth flow needs from WWW-Authenticate alone.',
    ],
    sections: [
      {
        heading: 'The problem: three gaps a memory-only simulator never shows',
        body: 'An in-process OAuth 2.1 walkthrough proves the state machine. Production adds three operational gaps it cannot see.\n\nEnrollment: a real org runs hundreds of MCP servers and thousands of clients, so nobody hand-registers every Cursor or Claude Code user as an OAuth client.\n\nKey rotation: the authorization server rotates signing keys on a schedule, often hourly and sometimes faster under incident response. A server that fetches the JWKS once at boot validates fine until the rotation window, then rejects every request until someone restarts it.\n\nAudience binding: a token minted for one MCP server must not work against another server in the same trust mesh, and that check has to run on every request, not once at session start, because the 2026-07-28 MCP revision removed protocol sessions entirely.',
      },
      {
        heading: 'Enrollment: CIMD first, DCR as the fallback',
        body: 'The 2026-07-28 MCP authorization revision deprecates RFC 7591 dynamic client registration and makes Client ID Metadata Documents (CIMD) the recommended default enrollment path.\n\nCIMD inverts registration from push to pull. The client uses an HTTPS URL it controls as its client_id, for example https://app.example.com/oauth/client.json. The authorization server fetches that JSON during the flow and rejects it unless the client_id field inside equals the URL it was served from. Trust is rooted in DNS, so there is no client_id namespace to exhaust and no per-server registration database to keep in sync.\n\nDCR still works as compatibility: POST /register, receive a client_id plus a registration_access_token, and declare the correct application_type, native or web. The client\'s priority order is a pre-registered id, then CIMD, then DCR, then a prompt to the user.',
      },
      {
        heading: 'The deployment gate: read the IdP metadata before you ship',
        body: 'RFC 8414 metadata at /.well-known/oauth-authorization-server is a contract you verify before you deploy, not a document you skim. Four checks decide whether an identity provider is usable for this server.\n\ncode_challenge_methods_supported must include S256. If the field is absent, the authorization server does not support PKCE and the spec says the client MUST refuse to proceed. There is no degraded mode, so this is a boot-time check that stops the server from starting, not a runtime warning a user ever sees.\n\ngrant_types_supported includes authorization_code and excludes password and implicit. response_types_supported is exactly ["code"]. And at least one enrollment path is advertised: client_id_metadata_document_supported true, or a registration_endpoint for DCR. Enrollment is the softer gate, since pre-registration can cover it.',
      },
      {
        heading: 'Rotate and refresh are different verbs',
        body: 'Rotate is what the authorization server does: mint a new signing key like k_2026_04, publish it in the JWKS, and retire k_2026_03 later. The resource server cannot rotate, because it never holds the private keys.\n\nRefresh is the only JWKS action a resource server performs: re-GET the published set into a cache. Wire a scheduled job that overwrites cache[issuer] on an interval, plus a single synchronous re-fetch when a token arrives carrying a kid the cache does not hold.\n\nThe fallback must be a re-fetch, never a rotate. A rotate produces a brand-new kid that still does not match the token, and an attacker spraying random kid values forces unbounded key creation, a self-inflicted denial of service. Two keys in the cache at once, k_2026_03 and k_2026_04 together, is the steady state during the overlap window, not an error.',
      },
      {
        heading: 'Audience replay: the protocol-layer defense against token reuse',
        body: 'Server A and Server B share an identity provider. A is compromised and an attacker replays a stolen notes.example.com token against tasks.example.com. Server B decodes the JWT, verifies the signature, checks iss against its allow-list and passes, then compares aud against its own canonical resource URL and fails.\n\nIt returns 401 with error="invalid_token", error_description="audience mismatch", and a resource_metadata parameter pointing at its RFC 9728 protected-resource document. The spec calls this access-token privilege restriction: an MCP server MUST reject any token that does not name it in the audience.\n\nA missing aud claim is not a wildcard. Some identity providers omit aud unless resource was present in the original token request, and skipping the check for performance, or running it only at session start, is the single most common production mistake in this whole surface.',
      },
      {
        heading: 'Mix-up attacks: the client-side check the server cannot provide',
        body: 'Mix-up is a different attack and it lives client-side. A malicious authorization server steers the client into redeeming an honest server\'s authorization code at the attacker\'s token endpoint. Audience binding does not help, because the attack happens before any token exists, and PKCE does not stop it either: the client hands its code_verifier to whatever endpoint it was steered to.\n\nRFC 9207 does. Before redirecting, the client records the issuer it validated from the authorization server\'s metadata. On the authorization response, it compares the returned iss parameter against that recorded issuer with a plain string match, before it sends the code anywhere. A mismatch, or a missing iss when the server advertised authorization_response_iss_parameter_supported, means reject without even rendering the error fields.\n\nOne naming note worth keeping straight: the spec reserves confused deputy for a related problem, an MCP server acting as an OAuth proxy that forwards a token without per-client consent.',
      },
      {
        heading: 'Opaque tokens: introspection instead of decoding',
        body: 'Not every access token is a JWT. When the identity provider issues opaque tokens, the resource server cannot decode claims out of them, so it calls the issuer\'s RFC 7662 introspection endpoint over an authenticated backchannel instead.\n\nA valid result requires active: true, the expected issuer, the exact MCP audience, unexpired time claims, and the scopes the specific tool needs. Cache introspection results by issuer, a one-way digest of the token, and the resource, never by the cleartext token. Bound a positive cache entry by the earliest of token expiry, issuer cache guidance, and the deployment\'s own revocation freshness target.\n\nThe validation mode itself, JWT versus introspection, is pinned to validated issuer metadata and deployment config, never chosen from attacker-controlled token contents. That single rule closes off a downgrade attack where a forged token header claims one type to dodge the check meant for the other.',
      },
      {
        heading: 'Revocation and dependency failure: two policies you must declare',
        body: 'Revoking a token at the authorization server does not erase copies already cached by every resource server, so revocation is a freshness contract you define, not a fact you assume. Opaque-token deployments get tighter revocation by introspecting on every high-risk call. JWT deployments combine short access-token lifetimes with refresh-token revocation and, for an issuer-wide incident, key retirement.\n\nDependency failure needs the same explicit policy. If the scheduled JWKS refresh fails but a known kid is still inside its bounded stale-on-error window, continue and emit degraded health evidence. If introspection is unavailable, fail closed, never convert a network error into active: true. If protected-resource metadata changes unexpectedly, stop new enrollment rather than trusting the new document blind.\n\nA dependency outage is an operational error with its own retry policy. A bad signature, issuer, audience, or scope is an authorization refusal. Neither should ever reach the tool handler, and neither belongs in an audit log as raw token contents.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p13-18-inline-jwks-cache.svg',
        alt: 'JWKS cache with two overlapping keys',
        caption: 'Refresh overwrites the cache on a schedule; a cache miss triggers one re-fetch, never a rotate.',
        diagramBrief:
          'ASCII-style diagram: left box labeled "Authorization server" with a padlock icon rotating from key k_2026_03 to k_2026_04. Arrow labeled "scheduled refresh, GET jwks_uri" pointing right to a box labeled "Resource server cache" containing two key chips: k_2026_03 (fading) and k_2026_04 (solid). A dotted arrow from an incoming token labeled "kid: k_2026_04" into the cache box, labeled "cache miss -> one re-fetch, not a rotate". Style: cream paper background, black ink line art, one red accent on the word "never" near a crossed-out rotate arrow.',
      },
      {
        src: '/lessons/p13-18-inline-error-taxonomy.svg',
        alt: 'WWW-Authenticate mapped to three UI states',
        caption: 'Three distinct WWW-Authenticate errors, three distinct UI surfaces: silent re-auth, hard stop, step-up consent.',
        diagramBrief:
          'Three-column comparison diagram on cream paper. Column 1: "401 invalid_token" above an icon of a silent spinner, label "silent re-auth, no user copy". Column 2: "401 audience mismatch" above an icon of a stop sign, label "hard stop, this token was never for you". Column 3: "403 insufficient_scope + scope param" above an icon of a consent dialog, label "step-up consent naming the exact permission". Monochrome ink, one blue accent per column header.',
      },
    ],
    takeaways: [
      'If the IdP metadata does not list S256, refuse to deploy. PKCE has no degraded mode, so this is a boot-time check, not a runtime warning.',
      'CIMD is the 2025-11-25 default: an HTTPS URL you control is the client_id, and the authorization server pulls the metadata. DCR is backwards compatibility.',
      'The JWKS cache-miss fallback is a re-fetch, never a rotate. Rotating on a miss cannot produce the missing kid and turns bogus kid values into a key-creation DoS.',
      'Validate aud on every request against this server\'s canonical URL, and never treat a missing aud as a wildcard. That claim is the whole protocol-layer defense against replay.',
    ],
    terms: [
      { term: 'CIMD', gloss: 'a client metadata URL', meaning: 'Client ID Metadata Document: an HTTPS URL the client controls, used as its client_id and fetched by the authorization server during the flow.' },
      { term: 'DCR', gloss: 'self-service client registration', meaning: 'RFC 7591 dynamic client registration; POST /register for a client_id on the spot, deprecated in the 2026-07-28 MCP revision and kept only for compatibility.' },
      { term: 'JWKS', gloss: 'the public keys', meaning: 'JSON Web Key Set published at jwks_uri, indexed by kid, used to verify token signatures.' },
      { term: 'Resource indicator', gloss: 'the audience parameter', meaning: 'The RFC 8707 resource parameter on a token request that pins the issued token to one canonical server URL.' },
      { term: 'Audience replay', gloss: 'token replay', meaning: 'Presenting a token minted for Server A to Server B, defeated by comparing aud against the canonical resource URL on every request.' },
      { term: 'Mix-up attack', gloss: 'wrong token endpoint', meaning: 'A client steered into redeeming an honest server\'s authorization code at an attacker\'s token endpoint, defeated client-side by the RFC 9207 iss check.' },
      { term: 'Confused deputy', gloss: 'proxy token misuse', meaning: 'An MCP server acting as an OAuth proxy with a static client ID, forwarding a token without per-client consent, a distinct failure from audience replay.' },
      { term: 'Introspection', gloss: 'checking if a token is valid', meaning: 'The RFC 7662 backchannel call a resource server makes to validate an opaque token it cannot decode itself.' },
      { term: 'Revocation freshness', gloss: 'how fast logout works', meaning: 'The maximum delay a deployment allows between a token being revoked and every cached replica refusing it.' },
      { term: 'WWW-Authenticate', gloss: 'the 401 response header', meaning: 'The header carrying a typed error, description, and a pointer to protected-resource metadata, the schema your UI\'s error states render from.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Given an RFC 8414 metadata document missing code_challenge_methods_supported, write the one-sentence refusal message the client should show at boot.' },
      { level: 'medium', prompt: 'A resource server\'s JWKS cache holds only k_2026_03. A token arrives signed with k_2026_04. Trace the two allowed outcomes, accept after one re-fetch or reject, and explain which dependency failure would force the reject path.' },
      { level: 'medium', prompt: 'Server A and Server B share an identity provider. Write the exact 401 response Server B returns when it receives a token whose aud is Server A\'s canonical URL.' },
      { level: 'design', prompt: 'Spec the consent screen a user sees during a step-up authorization for a "delete repository" scope. What does the screen have to show that a generic "Allow access?" dialog does not, and what happens if the redirect URI is localhost?' },
    ],
    furtherReading: [
      { label: 'MCP authorization specification (2026-07-28)', url: 'https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization', why: 'The current MCP authorization profile this lesson implements end to end.' },
      { label: 'RFC 8414: OAuth 2.0 Authorization Server Metadata', url: 'https://datatracker.ietf.org/doc/html/rfc8414', why: 'The metadata contract you check before trusting an identity provider.' },
      { label: 'OAuth Client ID Metadata Document (draft-ietf-oauth-client-id-metadata-document-00)', url: 'https://datatracker.ietf.org/doc/html/draft-ietf-oauth-client-id-metadata-document-00', why: 'The enrollment mechanism that replaced dynamic client registration as the default.' },
      { label: 'RFC 8707: Resource Indicators for OAuth 2.0', url: 'https://datatracker.ietf.org/doc/html/rfc8707', why: 'Resource indicators, the mechanism behind audience pinning.' },
      { label: 'RFC 9207: OAuth 2.0 Authorization Server Issuer Identification', url: 'https://datatracker.ietf.org/doc/html/rfc9207', why: 'The issuer parameter that defends against mix-up attacks, enforced client-side.' },
      { label: 'RFC 7662: OAuth 2.0 Token Introspection', url: 'https://datatracker.ietf.org/doc/html/rfc7662', why: 'Token introspection, the path a resource server uses for opaque tokens.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'MCP identity-provider deployment gate',
      body: '- Discovered issuer matches the exact HTTPS issuer your policy expects.\n- code_challenge_methods_supported lists S256, or refuse to deploy.\n- Enrollment path advertised: CIMD preferred, pre-registration accepted, DCR only as compatibility.\n- authorization_response_iss_parameter_supported true means you validate RFC 9207 iss on every redirect.\n- Token requests carry resource, and the resource server checks aud on every call, not once at session start.\n- Client credentials are keyed by issuer; access tokens are keyed by (issuer, resource).\n- JWKS cache has a scheduled refresh job plus a re-fetch-on-miss fallback, never a rotate-on-miss fallback.',
    },
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
      'MCP is agent-to-tool and transparent. A2A is agent-to-agent and deliberately opaque: send a Task, watch a lifecycle, receive Artifacts, and never learn how the other agent did it.',
    readTime: '~10 min read',
    diagram: '/lessons/p13-19.svg',
    diagramCaption:
      'A caller sends a Task with mixed Parts, the called agent moves through working and input-required, and returns a named Artifact while its internals stay hidden.',
    whyItMatters:
      'Opacity is a UI constraint disguised as a protocol principle. MCP lets you render a tool-call trace, so progress is a list of steps. A2A gives you seven lifecycle states and no interior, so progress is a state machine over submitted, working, input-required, and four terminal states. Two of those need real surfaces: input-required is a mid-task form that pauses your own run, and rejected is not failed, so retrying will not help. Output is an Artifact, a named typed object with a mimeType, streamed in chunks, not a string.',
    learningObjectives: [
      'Distinguish agent-to-tool (MCP) from agent-to-agent (A2A) delegation and name a scenario where only A2A fits.',
      'Fetch an Agent Card at /.well-known/agent.json and read its skills as the A2A analog of an MCP tool list.',
      'Trace a Task through its seven lifecycle states and identify which two need a dedicated UI surface.',
      'Explain why an Artifact is not a string, and how mimeType changes the render.',
      'Compare the two A2A transport bindings and say when to reach for gRPC over JSON-RPC.',
      'Decide, for a given feature, whether it needs MCP, A2A, or both.',
    ],
    sections: [
      {
        heading: 'The problem: MCP does not model agent collaboration',
        body: 'A customer-service agent needs a specialist writer agent to produce a report. Pre-A2A the options were all bad. A custom REST API works, but every pairing is a one-off integration. A shared codebase forces both agents onto the same framework. MCP does not fit, because MCP models calling a tool, not delegating a whole task to a peer that has its own reasoning.\n\nA2A models the interaction as one agent sending a Task to another, with a lifecycle, messages, and artifacts. Google announced it in April 2025, donated it to the Linux Foundation in June 2025, absorbed IBM\'s ACP that August, and shipped v1.0 in April 2026 with more than 150 supporting organizations, including AWS, Cisco, Microsoft, Salesforce, SAP, and ServiceNow. The AP2 payments extension landed in September 2025.',
      },
      {
        heading: 'The Agent Card: discovery as a fetchable document',
        body: 'Every A2A agent publishes a card at /.well-known/agent.json. The card names the A2A endpoint URL, a version, and a skills array, where a skill is a named callable operation, the A2A analog of an MCP tool: an id, a name, a description, and the input and output modes it accepts.\n\nDiscovery is therefore URL-based and cheap: fetch the card, read the endpoint, list the skills. That maps directly onto a picker UI, because you can render a remote agent\'s capabilities without invoking anything, the same way an app store listing describes a capability before install.\n\nA capabilities object on the card also declares whether the agent supports streaming and push notifications, which is what tells the client whether to open an SSE connection or poll.',
      },
      {
        heading: 'Signed cards and the AP2 trust model',
        body: 'Discovery alone has an obvious hole: anyone can publish a card claiming to be a known agent. The AP2 extension, shipped September 2025, closes it with cryptographic signatures. The publisher signs its own card with a JWT, and consumers verify that signature before trusting the listed skills or endpoint.\n\nThat is a materially different trust model from MCP. Where MCP authorizes a call with OAuth 2.1 and a bearer token the client presents, A2A trust starts at discovery: the card itself carries the proof, before any request is sent. A hostile agent impersonating "research-agent" fails at the signature check, not at the first tool call.\n\nFor a picker UI, this means the verify step runs before the card\'s skills ever populate the list, so an unverifiable card should never render as a selectable option.',
      },
      {
        heading: 'The Task lifecycle is the component you actually build',
        body: 'A client initiates with tasks/send. The called agent then transitions through submitted, working, input-required, and one of four terminal states: completed, failed, canceled, or rejected. Clients either subscribe to state updates over SSE or poll.\n\nTwo states deserve their own design. input-required is a pause where the called agent asks for a clarification, so your run stops and a form appears mid-flight, which means your own agent loop needs a suspend-and-resume path rather than a timeout. rejected is not failed: the agent declined the task outright, so a retry affordance is wrong, and the correct surface explains the decline instead of offering to try again.',
      },
      {
        heading: 'Messages, Parts, and Artifacts',
        body: 'A Message carries one or more Parts, and Parts are typed: text is plain content, file is a base64 blob with a mimeType, data is a typed JSON payload for structured input. One Task can carry a PDF and an instruction in the same message, for example a summarize_paper skill receiving both paper.pdf and {"targetLength": "3 paragraphs"}, which is why the input surface is an attachment composer, not a text field.\n\nOutputs are Artifacts, not raw strings. An Artifact is a named typed output, for example a summary artifact with mimeType text/markdown, and it can arrive as streamed chunks the caller accumulates. That is a different render than token streaming: you are appending to a named object of a known type, so the skeleton can be shaped before the first chunk lands.',
      },
      {
        heading: 'Two transport bindings, one logical shape',
        body: 'Two transport bindings carry the same logical shape. JSON-RPC over HTTP with optional Server-Sent Events is the default: a POST to the agent\'s /a2a endpoint for requests, SSE for streaming state and artifact chunks. gRPC is the second binding, for enterprise environments where gRPC is already the native wire format across services.\n\nNeither binding changes what the client renders. A Task is still submitted, working, input-required, or one of four terminal states regardless of transport, and an Artifact still carries a name and a mimeType. Pick the binding your organization already runs, not the one a demo happens to use, because the state machine and the render logic do not change either way.',
      },
      {
        heading: 'When to reach for A2A instead of MCP',
        body: 'Use MCP when you want to invoke a specific tool and see the call. Use A2A when you want to hand a whole task to another agent and accept not seeing inside. Many production systems run both: MCP for the tool layer, A2A for the collaboration layer.\n\n| | MCP | A2A |\n|---|---|---|\n| Use case | Agent-to-tool | Agent-to-agent |\n| Opacity | Transparent tool calls | Opaque inner reasoning |\n| State | Tool-call result | Task with a lifecycle |\n| Trust | OAuth 2.1 bearer tokens | Signed Agent Cards (AP2) |\n| Transport | Stdio or Streamable HTTP | JSON-RPC over HTTP or gRPC |\n\nThe opacity is intentional: it lets competitors collaborate without revealing internals, so "call this customer-service agent" does not leak how the service is implemented. The cost is debuggability. When an A2A sub-agent is slow you cannot see which of its tools hung, only that the Task sat in working.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p13-19-inline-lifecycle.svg',
        alt: 'A2A Task lifecycle diagram',
        caption: 'Seven states, one loop: input-required returns to working, and four terminal states never trade places.',
        diagramBrief:
          'State machine diagram on cream paper. Circle "submitted" connects by arrow to "working". From "working": an arrow to "input-required" labeled "pause, form appears", which loops back to "working". From "working", four arrows fan out to terminal circles in a row: "completed", "failed", "canceled", "rejected", each terminal circle drawn with a double border. One accent color highlights the input-required loop.',
      },
      {
        src: '/lessons/p13-19-inline-agent-card.svg',
        alt: 'Agent Card discovery and verification',
        caption: 'Discovery is a GET and a signature check, before a single skill is invoked.',
        diagramBrief:
          'Left-to-right flow on cream paper: a client icon, arrow labeled "GET /.well-known/agent.json" to a document icon labeled "Agent Card: endpoint, skills[], capabilities". Below the document, a small padlock icon labeled "AP2 signature verify" gates a checkmark before an arrow continues to a list of three skill chips. Monochrome ink, one accent color on the padlock.',
      },
    ],
    takeaways: [
      'A2A gives you seven lifecycle states and no interior. Your progress component is a state machine over those states, not a step trace.',
      'input-required is a mid-task pause, so the calling agent needs suspend-and-resume, and rejected is not failed, so it must not offer a retry.',
      'Outputs are named typed Artifacts that stream as chunks, which lets you shape the render target before the first chunk arrives.',
      'Run both protocols: MCP for the transparent tool layer, A2A for delegation, and accept that opacity trades debuggability for cross-framework reach.',
    ],
    terms: [
      { term: 'A2A', gloss: 'Agent2Agent protocol', meaning: 'An open, Linux Foundation-governed protocol for delegating a task between agents built on different frameworks, reaching v1.0 in April 2026.' },
      { term: 'Agent Card', gloss: 'the agent\'s profile', meaning: 'The JSON document at /.well-known/agent.json naming an agent\'s A2A endpoint, version, and skills.' },
      { term: 'Skill (A2A)', gloss: 'a callable capability', meaning: 'A named operation listed on an Agent Card, the A2A analog of an MCP tool, with declared input and output modes.' },
      { term: 'Task', gloss: 'a delegated job', meaning: 'A unit of work with a seven-state lifecycle and a final Artifact, initiated with tasks/send.' },
      { term: 'Part', gloss: 'a message attachment', meaning: 'A typed element of a Message: text for plain content, file for a base64 blob with a mimeType, or data for structured JSON input.' },
      { term: 'Artifact', gloss: 'the answer', meaning: 'A named, typed output returned on task completion, carrying a mimeType and optionally streamed as chunks.' },
      { term: 'Opacity', gloss: 'black-box collaboration', meaning: 'The A2A design principle that a called agent\'s reasoning and tool calls stay invisible to the caller, unlike MCP\'s transparent tool calls.' },
      { term: 'AP2', gloss: 'Agent Payments Protocol', meaning: 'The September 2025 extension adding JWT-signed Agent Cards, also how A2A verifies agent identity before trust.' },
      { term: 'input-required', gloss: 'the agent needs more info', meaning: 'A non-terminal lifecycle state where the called agent pauses and asks for clarification before it can continue working.' },
      { term: 'rejected', gloss: 'it failed', meaning: 'A terminal state distinct from failed: the agent declined the task outright, so a retry affordance is the wrong UI response.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Given an Agent Card whose capabilities.streaming is false, decide whether the client should poll or open an SSE connection, and how the progress UI differs.' },
      { level: 'medium', prompt: 'A Task sits in input-required for 40 seconds while the orchestrator\'s own run is paused. Design the timeout policy: does the orchestrator ever auto-cancel, and what tells the user this is not a hang?' },
      { level: 'medium', prompt: 'Compare an MCP tools/call result and an A2A Artifact for the same underlying report output. List the three fields the Artifact has that the tool result does not.' },
      { level: 'design', prompt: 'Sketch the progress component for a request that delegates to two A2A sub-agents in parallel, one of which enters input-required. What does the user see for each, and how do you avoid implying you can see inside either one?' },
    ],
    furtherReading: [
      { label: 'a2a-protocol.org', url: 'https://a2a-protocol.org/latest/', why: 'The canonical A2A specification, current on the Task lifecycle and transport bindings.' },
      { label: 'a2aproject/A2A on GitHub', url: 'https://github.com/a2aproject/A2A', why: 'Reference implementations and SDKs across the two transport bindings.' },
      { label: 'Linux Foundation launches the Agent2Agent Protocol project', url: 'https://www.linuxfoundation.org/press/linux-foundation-launches-the-agent2agent-protocol-project-to-enable-secure-intelligent-communication-between-ai-agents', why: 'The June 2025 governance transfer that moved A2A out of one vendor\'s control.' },
      { label: 'Google Cloud: A2A protocol is getting an upgrade', url: 'https://cloud.google.com/blog/products/ai-machine-learning/agent2agent-protocol-is-getting-an-upgrade', why: 'Roadmap and the partner momentum behind the April 2026 v1.0 release.' },
      { label: 'Google Dev: the A2A 1.0 milestone', url: 'https://discuss.google.dev/t/the-a2a-1-0-milestone-ensuring-and-testing-backward-compatibility/352258', why: 'Release notes and backward-compatibility guidance for the v1.0 milestone.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'A2A vs MCP decision checklist',
      body: '- Does the callee have its own reasoning and tool calls you are willing not to see? If yes, A2A.\n- Do you need to invoke one specific, named operation and see the call? If yes, MCP.\n- Does the output need a lifecycle, a pause for input, or an outright rejection? If yes, an A2A Task, not a tool result.\n- Is the output a single typed artifact you can stream in chunks? Design the render around Artifact, not token text.\n- Are you delegating across organizations or frameworks that should not share internals? A2A\'s opacity is a feature there, not a limitation.',
    },
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
      'An agent calls five tools, three MCP servers, two sub-agents. GenAI semantic conventions give every hop the same span attributes, so one trace id explains where the 30 seconds went.',
    readTime: '~10 min read',
    diagram: '/lessons/p13-20.svg',
    diagramCaption:
      'One trace id with nested spans: invoke_agent at the root, chat spans for the model, execute_tool spans for each dispatch, and a CLIENT span per MCP round-trip.',
    whyItMatters:
      'Latency you cannot attribute becomes latency you cannot design around. "Sometimes 30 seconds, sometimes 3" is not a slow model, it is a cold start on one MCP server, and only a per-hop span tells you which. That distinction changes the surface: a slow model gets streaming and a skeleton, a slow tool gets a named per-tool progress row, and a hanging server gets a scoped timeout with a retry. The other design decision is content capture, off by default. Turning on gen_ai.content.prompt puts user text into your observability backend, so it is a privacy decision, not a debug flag.',
    learningObjectives: [
      'Name the required gen_ai.* attributes for a model span, a tool span, and an agent span.',
      'Build a trace hierarchy that nests invoke_agent, chat, execute_tool, and MCP CLIENT spans under one trace id.',
      'Decide when a slow hop is a SpanKind.INTERNAL fix, yours to optimize, versus a SpanKind.CLIENT fix, a timeout and retry.',
      'Explain why content capture is opt-in, and what enabling it costs from a privacy standpoint.',
      'Propagate a traceparent across an MCP call, including the stdio gap the spec has not closed yet.',
    ],
    sections: [
      {
        heading: 'The problem: logs show the model call and nothing else',
        body: 'A February 2026 debug. Users report that the agent sometimes takes 30 seconds and sometimes 3. The logs show the LLM call. They do not show the tool dispatch, the MCP server round-trip, or the sub-agent. So you guess, and eventually you find it: one MCP server occasionally hangs on a cold start.\n\nWithout end-to-end tracing that bug is unfindable, because the only timing you recorded is the part that was fine. The GenAI semantic conventions settled through 2025 and 2026 under the OpenTelemetry semantic-conventions group, with stable attributes from v1.37, and they are natively parsed by Datadog, Langfuse, Arize Phoenix, OpenLLMetry, and AgentOps. Instrument once, ship anywhere OTLP is accepted.',
      },
      {
        heading: 'The span hierarchy and the attributes that make it queryable',
        body: 'Everything nests under one trace id, with parent-child links encoded by span ids: invoke_agent at the root, chat spans for model calls, execute_tool spans for each dispatch.\n\nThe required attributes for a model span are gen_ai.operation.name (chat, text_completion, embeddings, execute_tool, invoke_agent), gen_ai.provider.name, gen_ai.request.model, gen_ai.response.model, gen_ai.usage.input_tokens and output_tokens, and gen_ai.response.id for correlating with the provider.\n\nTool spans add gen_ai.tool.name and gen_ai.tool.call.id. Agent spans add gen_ai.agent.name and gen_ai.agent.id. Requested model and served model are two separate fields, gen_ai.request.model versus gen_ai.response.model, which is how you catch a silent downgrade nobody asked for.',
      },
      {
        heading: 'Span kinds mark the process boundaries',
        body: 'CLIENT is for calls that cross a process boundary: the model provider, an MCP server. INTERNAL is for the agent\'s own loop steps and for tool execution that happens in your process.\n\nThat one distinction is the most useful thing in the trace, because it separates "our code is slow" from "someone else\'s service is slow," and those two facts point at completely different fixes. A slow INTERNAL span is yours to optimize. A slow CLIENT span is a timeout, a retry policy, and a UI state that admits the wait belongs to a remote hop, not a smaller prompt.\n\nA real trace we read this way: both chat spans totalled 3.6 seconds of a 30.4-second run. The other 26.1 seconds sat in one CLIENT span, an MCP round-trip. Nobody needed a faster model.',
      },
      {
        heading: 'Metrics for dashboards that do not need per-call detail',
        body: 'Alongside spans, the conventions define metrics for dashboards that do not need per-call detail: gen_ai.client.token.usage, gen_ai.client.operation.duration, and gen_ai.tool.execution.duration, all histograms.\n\nA span answers "what happened on this one request." A metric answers "what does the last hour look like across every request." Wire both: spans for the incident you are debugging right now, metrics for the p50 and p95 latency you watch on a dashboard between incidents.\n\nBecause both share the gen_ai.* prefix and the same attribute vocabulary, a query against the metric, p95 gen_ai.tool.execution.duration for search_arxiv above 20 seconds, points you at exactly the span type to pull next, tool spans for that one tool name, not a generic APM trace with no GenAI context at all.',
      },
      {
        heading: 'Content capture is opt-in, and that is a privacy boundary',
        body: 'By default spans carry metrics and timing, not prompts or completions. Large payloads and personal data are off deliberately.\n\nEnabling them means setting OTEL_SEMCONV_STABILITY_OPT_IN=gen_ai_latest_experimental plus specific content-capture variables, after which span events appear: gen_ai.content.prompt for input messages, gen_ai.content.completion for outputs, gen_ai.content.tool_call for the call as recorded. Events time-order inside a span, which gives you a replay of exactly what the model saw and said.\n\nThat replay is genuinely the best debugging artifact available, and it also means user text now lives in your observability vendor. Treat the flag as a data-handling decision that needs a privacy review, not as a verbosity level you flip during an incident and forget to flip back.',
      },
      {
        heading: 'Propagating context across MCP, including the stdio gap',
        body: 'A trace only spans services if the context travels. When an MCP client calls a server, inject the W3C traceparent header. Streamable HTTP carries standard headers, so this is free.\n\nStdio does not carry HTTP headers at all. The protocol roadmap for 2026 discusses a _meta.traceparent field on JSON-RPC calls, and until it ships you put the traceparent into _meta on every request by hand and have the server log the trace id back out.\n\nExport is not the hard part. Jaeger, Tempo, Langfuse, Arize Phoenix, Datadog, and Honeycomb all speak OTLP, so your instrumentation does not encode a vendor. AgentOps wraps LangGraph, Pydantic AI, and CrewAI to emit spans automatically if you are on a supported framework, so the manual traceparent plumbing above is mostly a stdio-transport problem, not a framework problem.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p13-20-inline-span-tree.svg',
        alt: 'Nested span tree under one trace id',
        caption: 'invoke_agent at the root, chat and execute_tool as children, one CLIENT span for the MCP round-trip that ate 26.1 of 30.4 seconds.',
        diagramBrief:
          'Vertical tree diagram on cream paper. Root box "invoke_agent (INTERNAL)" at top. Three child boxes below connected by lines: "chat #1 (CLIENT) 1.8s", "execute_tool search_arxiv (INTERNAL) 0.4s" which itself has one child "MCP round-trip (CLIENT) 26.1s" drawn in a red accent outline, and "chat #2 (CLIENT) 1.8s". A horizontal timeline bar beneath the tree shows proportional widths matching the durations. Monochrome ink, one red accent on the 26.1s box.',
      },
      {
        src: '/lessons/p13-20-inline-spankind.svg',
        alt: 'SpanKind CLIENT versus INTERNAL as two different fixes',
        caption: 'The same slow span reads as two different engineering tickets depending on SpanKind.',
        diagramBrief:
          'Two-column comparison on cream paper. Left column header "SpanKind.INTERNAL", icon of a wrench, label "our code, optimize it". Right column header "SpanKind.CLIENT", icon of a clock with a retry arrow, label "someone else\'s service, add a scoped timeout and retry". A dividing vertical line down the middle, one blue accent per column icon.',
      },
    ],
    takeaways: [
      'Instrument every hop, not just the model call. "Sometimes 30 seconds" is almost always a tool or server span, and the model span will look fine the whole time.',
      'SpanKind CLIENT versus INTERNAL separates your slowness from someone else\'s, and those two facts demand different UI: optimization versus a scoped timeout and retry.',
      'gen_ai.request.model and gen_ai.response.model are separate attributes, so a silent model downgrade is visible in the trace rather than inferred from vibes.',
      'Content capture is off by default. Turning it on moves user text into your observability backend, which is a privacy review, not a log level.',
    ],
    terms: [
      { term: 'GenAI semconv', gloss: 'the OTel attribute standard', meaning: 'The OpenTelemetry semantic conventions defining stable gen_ai.* attribute names for model, tool, and agent spans.' },
      { term: 'Span', gloss: 'one logged step', meaning: 'One timed operation with a start, an end, and attributes, linked to a parent by span id.' },
      { term: 'Trace id', gloss: 'the request id', meaning: 'The shared identifier that ties every span of one request into a single tree.' },
      { term: 'SpanKind', gloss: 'CLIENT or SERVER or INTERNAL', meaning: 'A hint about direction: CLIENT for cross-process calls, INTERNAL for work that happens inside your own process.' },
      { term: 'OTLP', gloss: 'the export format', meaning: 'The OpenTelemetry wire protocol every supported backend accepts, which keeps instrumentation vendor-neutral.' },
      { term: 'traceparent', gloss: 'the trace header', meaning: 'The W3C header that carries trace context across services, absent from stdio and hand-placed in _meta until the MCP spec adds it.' },
      { term: 'gen_ai.request.model', gloss: 'the model you asked for', meaning: 'The requested model string, kept separate from gen_ai.response.model so a silent downgrade is visible in the trace.' },
      { term: 'Content capture', gloss: 'logging the prompt', meaning: 'The opt-in span events, gen_ai.content.prompt, .completion, .tool_call, that record actual message text, off by default for privacy.' },
      { term: 'gen_ai.tool.execution.duration', gloss: 'how long a tool took', meaning: 'A histogram metric for dashboard-level latency across many calls, distinct from the per-call detail a span carries.' },
      { term: 'AgentOps', gloss: 'an observability wrapper', meaning: 'A vendor layer that wraps LangGraph, Pydantic AI, and CrewAI to emit OTel GenAI spans automatically without manual instrumentation.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'List the four required gen_ai.* attributes on a chat span and the two additional ones a tool span needs.' },
      { level: 'medium', prompt: 'A trace shows one execute_tool span at 0.4s containing a nested CLIENT span at 26.1s. Which span do you optimize, and which do you wrap in a timeout?' },
      { level: 'medium', prompt: 'Write the OTEL_SEMCONV_STABILITY_OPT_IN value and the risk you are accepting when you turn on gen_ai.content.prompt in production.' },
      { level: 'design', prompt: 'Design the progress row a user sees while execute_tool search_arxiv is running. What changes in that row the moment the nested span becomes a CLIENT span sitting past its expected duration?' },
    ],
    furtherReading: [
      { label: 'OpenTelemetry: GenAI semantic conventions', url: 'https://opentelemetry.io/docs/specs/semconv/gen-ai/', why: 'The canonical attribute, span, and event definitions this lesson is built from.' },
      { label: 'OpenTelemetry: GenAI spans', url: 'https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-spans/', why: 'The exact required and recommended attributes per span type.' },
      { label: 'OpenTelemetry: GenAI agent spans', url: 'https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-agent-spans/', why: 'The invoke_agent span shape that sits at the root of the trace.' },
      { label: 'open-telemetry/semantic-conventions on GitHub', url: 'https://github.com/open-telemetry/semantic-conventions/blob/main/docs/gen-ai/gen-ai-spans.md', why: 'The source of truth the spec pages are generated from, useful when a page lags a merged change.' },
      { label: 'Datadog: the LLM OTel semantic convention', url: 'https://www.datadoghq.com/blog/llm-otel-semantic-convention/', why: 'A production integration walkthrough from a vendor that ingests these spans natively.' },
    ],
    shipIt: {
      kind: 'rubric',
      name: 'Trace readiness rubric',
      body: '- Every model call has gen_ai.request.model and gen_ai.response.model as separate fields.\n- Every tool dispatch has gen_ai.tool.name and gen_ai.tool.call.id.\n- Every cross-process call (model provider, MCP server) is SpanKind.CLIENT; everything else is INTERNAL.\n- One trace id covers the full request, agent loop through sub-agent.\n- Content capture is off by default and its enable path is a reviewed config change, not a debug toggle anyone can flip.\n- traceparent is propagated on every MCP call, including a manual _meta path for stdio transports.',
    },
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
      'MCP says what tools exist. A skill says how to do a task. AGENTS.md says how this project works. Three layers, three load times, and most agent frustration is a thing sitting in the wrong one.',
    readTime: '~10 min read',
    diagram: '/lessons/p13-22.svg',
    diagramCaption:
      'Three layers by load time: AGENTS.md at session start, SKILL.md on invocation with sub-resources pulled on demand, MCP tools when an action is needed.',
    whyItMatters:
      'This is the layer you already author, and load time is the whole design. AGENTS.md sits in context every turn, so every line is a permanent tax on the budget. A skill body loads only when invoked, so it can be long, and its sub-resources load only when the body says to read them, progressive disclosure applied to a prompt instead of a screen. A frontmatter description is a router: the only text the model sees when deciding whether to load, so a vague one produces a skill that never fires or fires on everything.',
    learningObjectives: [
      'Separate a skill from its six neighboring abstractions: prompt, repository instructions, MCP tool, hook, subagent, and plugin.',
      'Write a SKILL.md frontmatter description precise enough to route correctly, and explain what a vague one costs.',
      'Structure a skill body plus sub-resources so progressive disclosure actually reduces the token tax on unrelated turns.',
      'Name the eight stages of a skill\'s lifecycle and one failure mode each stage introduces.',
      'Decide whether a given workflow belongs in AGENTS.md, a skill, a tool, or a subagent.',
    ],
    sections: [
      {
        heading: 'The problem: one workflow, three copies',
        body: 'An engineer distills a release-notes workflow into a multi-step prompt: read the merged PRs, group by area, summarize each, write the changelog in the team\'s style, post a Slack draft. It goes into a Notion doc.\n\nThen they want it from Claude Code, from Cursor, and from Codex CLI, and each has its own way to load instructions. So they keep three copies, and the copies drift.\n\nThe fix is not a bigger prompt, it is separating what is project-specific from what is workflow-specific from what is an action. Those three things have different lifetimes, so they belong in different files, and conflating them is the single most common cause of "the agent almost never does what the doc says."',
      },
      {
        heading: 'The three layers and their load times',
        body: 'AGENTS.md sits at the repo root and every compatible agent reads it on session start: conventions, which commands run tests, how the project is laid out. It launched in late 2025 and was in more than 60,000 repos by April 2026, read by Claude Code, Cursor, Codex, Copilot Workspace, opencode, Windsurf, and Zed.\n\nSKILL.md is a portable bundle: YAML frontmatter with a name and a description, a markdown body, and optional resources. Anthropic released Agent Skills as an open standard in December 2025. Runtimes discover them by scanning known directories, keyed by folder name and frontmatter name.\n\nMCP is the third layer and holds the actual callable actions the skill invokes. Three layers, three load times: session start, invocation, and per-action call.',
      },
      {
        heading: 'The neighboring abstractions, and what a skill is not',
        body: 'A skill is easy to confuse with six neighbors, and each confusion produces a different bug. A prompt shapes one interaction and has no versioned package. Repository instructions explain one codebase\'s standing rules and should not carry a reusable cross-repo workflow. An MCP tool exposes a typed remote capability and should not carry a detailed operating procedure in its description. A hook runs deterministic logic on a declared event and must not depend on the model choosing to invoke it. A subagent delegates work into its own context and state, which a skill, running in your context, cannot substitute for. A plugin distributes a larger runtime extension and is not itself the portable skill contract.\n\nA release workflow can use all six at once: a skill for the procedure, an MCP server for the release registry, a hook forbidding direct pushes, a subagent auditing the candidate. They compose because each keeps one responsibility.',
      },
      {
        heading: 'Progressive disclosure, written as files',
        body: 'A skill body can reference sub-resources the agent fetches only when it needs them. SKILL.md says "see style-guide.md for the style rules," and style-guide.md enters context only while the skill is running.\n\nThis is the same disclosure discipline as a UI, applied to a context budget. The frontmatter description is the trigger affordance. The body is the default view. The sub-resources are the detail-on-demand layer.\n\nSo write the body as the shortest complete instruction set, and push tables, long examples, and reference material into files the body points at by name. A skill that inlines everything defeats the mechanism and just becomes a large prompt with a slash command in front of it.',
      },
      {
        heading: 'The portable core: two required fields, four optional ones',
        body: 'The specification requires exactly two frontmatter fields: name, a stable identifier matching the parent directory, and description, which doubles as documentation and as routing metadata, the one line a runtime uses to decide whether to load the skill at all.\n\nFour more fields are portable but optional: license states the terms, compatibility states environmental requirements, metadata carries string-valued extension data, and allowed-tools suggests pre-approved tools, though that last one is still experimental and host support varies.\n\nTreat frontmatter as executable metadata, not documentation. A malformed name breaks discovery. A vague description routes the wrong requests to the skill, or none at all. Review it like configuration code, version it, and put its routing behavior in your evals the same way you would test a function.',
      },
      {
        heading: 'Runtime extensions are a second layer, and they are not portable',
        body: 'Some hosts read extra frontmatter beyond the portable core, and none of it is automatically portable to another runtime. disable-model-invocation hides a skill from model routing while keeping direct user invocation. user-invocable hides it from the user\'s command menu while keeping model routing. argument-hint shows argument help in a command menu. context and agent run the skill in delegated context. model and effort pin reasoning settings. hooks register lifecycle automation.\n\nTreat every one of these as an adapter: keep the core workflow valid without it, document the fallback, and test the specific host that consumes it. A different runtime may ignore an unknown field, reject it outright, or silently preserve it without implementing the behavior, and you cannot tell which from the file alone.',
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
    inlineImages: [
      {
        src: '/lessons/p13-22-inline-lifecycle.svg',
        alt: 'The eight-stage skill lifecycle',
        caption: 'A discovered skill is not an active one, and an active skill is not an authorized one. Each arrow is a separate failure mode.',
        diagramBrief:
          'Horizontal eight-step pipeline on cream paper: Discovery, Validation, Cataloging, Selection, Activation, Disclosure, Execution, Verification, each step a labeled box connected by an arrow. Below the pipeline, a caption row with a one-word failure mode under each box: "missing", "malformed", "over-exposed", "wrong pick", "never loads", "over-inlined", "unpermitted", "unverified". Monochrome ink, one accent color on the arrows.',
      },
      {
        src: '/lessons/p13-22-inline-neighbors.svg',
        alt: 'A skill compared against six neighboring abstractions',
        caption: 'Six things a skill gets mistaken for, and the one job each actually owns.',
        diagramBrief:
          'A grid of labeled boxes on cream paper: Prompt, Repository instructions, Agent Skill (center, larger, accent-highlighted), MCP tool, Hook, Subagent, Plugin. Each box has a three-to-four word job label underneath, for example "Prompt: shapes one interaction". Thin connecting lines from Agent Skill to each neighbor labeled "not this". Monochrome ink, one accent color on the center Agent Skill box.',
      },
    ],
    takeaways: [
      'Pick the layer by load time: AGENTS.md is in context every turn and taxes the budget permanently, a skill body loads on invocation, sub-resources load only when named.',
      'The frontmatter description is a router, not a summary. Vague descriptions produce skills that never trigger or trigger on everything.',
      'One deterministic action is a tool. Wide reading you only want the conclusion of is a subagent. A rule that applies to every task is AGENTS.md.',
      'Write the skill body as the shortest complete instruction set and push tables and examples into sub-resources, or you have written a large prompt with a slash command in front of it.',
    ],
    terms: [
      { term: 'SKILL.md', gloss: 'a portable skill file', meaning: 'A directory whose entry point is SKILL.md: YAML frontmatter with name and description, a markdown body, and optional references, scripts, and assets.' },
      { term: 'AGENTS.md', gloss: 'the project rules file', meaning: 'A repo-root file of project conventions that compatible agents read at session start, in more than 60,000 repos by April 2026.' },
      { term: 'Progressive disclosure (skills)', gloss: 'loading detail on demand', meaning: 'Keeping detail in sub-resources the skill body pulls only when the task needs them, so the default view stays short.' },
      { term: 'Frontmatter description', gloss: 'what the skill does', meaning: 'The one line a runtime uses to decide whether to load a skill at all, functioning as a router, not a summary.' },
      { term: 'Runtime extension', gloss: 'extra config fields', meaning: 'Host-specific frontmatter, like disable-model-invocation or argument-hint, whose behavior requires an adapter and is not portable across runtimes.' },
      { term: 'Skill lifecycle', gloss: 'how a skill gets used', meaning: 'The eight stages a skill passes through: discovery, validation, cataloging, selection, activation, disclosure, execution, verification, each a separate failure boundary.' },
      { term: 'MCP tool (vs skill)', gloss: 'a callable action', meaning: 'A typed remote capability the model or application calls directly, distinct from a skill\'s procedural instructions for approaching a task.' },
      { term: 'Subagent', gloss: 'a sub-task worker', meaning: 'A delegated worker with its own context and state that returns a bounded result, spending its own budget instead of the caller\'s.' },
      { term: 'Claude Agent SDK', gloss: 'Anthropic\'s agent runtime', meaning: 'The TypeScript and Python runtime, @anthropic-ai/claude-agent-sdk and claude-agent-sdk, that loads skills at session start and dispatches to them from the agent loop.' },
      { term: 'Apps SDK', gloss: 'OpenAI\'s ChatGPT extension layer', meaning: 'An MCP server plus ChatGPT widget metadata and optional ui:// resources, launched October 2025, unifying the earlier Connectors and Custom GPT Actions.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Given a SKILL.md whose description reads "helps with stuff," rewrite it as one sentence that would route correctly for a release-notes workflow.' },
      { level: 'medium', prompt: 'Classify five workflows from a real project using the decision table: tool, skill, subagent, hook, or AGENTS.md. Defend any case where you pick more than one primitive.' },
      { level: 'medium', prompt: 'A skill inlines its entire style guide into the body instead of a sub-resource. Estimate the token cost paid on turns that never touch that workflow, given the body is 2,000 tokens and the project runs 400 unrelated turns a day.' },
      { level: 'design', prompt: 'Design the SKILL.md frontmatter description for a design-review skill that should trigger on "review this screen" but never on "review this PR." Write the one line, and explain what happens if it is too broad.' },
    ],
    furtherReading: [
      { label: 'Agent Skills specification', url: 'https://agentskills.io/specification', why: 'The portable directory and frontmatter contract this lesson is built from.' },
      { label: 'Agent Skills best practices', url: 'https://agentskills.io/skill-creation/best-practices', why: 'Scope, instruction style, and resource organization guidance from the spec authors.' },
      { label: 'OpenAI: build skills', url: 'https://learn.chatgpt.com/docs/build-skills', why: 'Codex\'s current discovery and invocation behavior, one concrete runtime implementation.' },
      { label: 'Claude Code: skills', url: 'https://code.claude.com/docs/en/skills', why: 'One runtime\'s invocation, argument, tool, and delegated-context extensions in full.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Skill vs tool vs subagent vs AGENTS.md',
      body: '- Reusable model judgment across several steps, procedure stable but decisions vary: skill.\n- Must happen every time an event fires, missing one execution is unacceptable: hook or application code.\n- Model needs an external capability with typed inputs, the operation lives outside model context: MCP tool.\n- Work needs isolated context, state, or ownership, a separate worker returns a bounded result: subagent.\n- Guidance specific to one repository, describes local commands and constraints: AGENTS.md.\n- One interaction is enough, no package lifecycle needed: prompt.',
    },
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
      'One question touches every primitive in the phase: an MCP server, an OAuth gateway with RBAC, an A2A sub-agent, a ui:// render surface, and one OTel trace over all of it.',
    readTime: '~10 min read',
    diagram: '/lessons/p13-23.svg',
    diagramCaption:
      'Client to gateway to MCP servers, with an A2A delegation to a writer agent, a ui:// resource returned to the host, and one trace id spanning every hop.',
    whyItMatters:
      'Composing the pieces is where interface decisions actually resolve. The task lifecycle means the surface is a long-running job with a progress state, not a request that returns. RBAC means the same screen renders differently for two users, so generate_report is a disabled affordance for a read-only role, not a 403 after the click. The report comes back as content blocks plus a ui:// resource rendered in a sandboxed iframe whose only outward call is host.callTool, so every interactive element in your dashboard is a tool invocation with a permission attached. One trace id is what makes a slow run explainable to the person waiting.',
    learningObjectives: [
      'Trace one request through discovery, authorization, delegation, rendering, and telemetry, naming the protocol at each hop.',
      'Explain what changed under the MCP 2026-07-28 revision: no sessions, per-request _meta identity, mandatory server/discover.',
      'Distinguish a Task returned as resultType: task from an immediate result, and drive it through tasks/get, tasks/update, tasks/cancel.',
      'Run a Rule of Two audit against a real tool list, not an architecture diagram.',
      'Map every simulated boundary in a capstone to the production component and test that must replace it.',
    ],
    sections: [
      {
        heading: 'The shape: search, delegate, render, trace',
        body: 'The scenario is research and report. A user asks for a summary of the three most-cited 2026 arXiv papers on agent protocols. The system searches arXiv through MCP, delegates paper summarization to a specialist writer agent over A2A, aggregates the results, renders an interactive report as an MCP Apps ui:// resource, and logs every step to OpenTelemetry.\n\nThis is not a contrived assembly. Production research assistants that shipped in 2026, Anthropic\'s Claude Research product, OpenAI\'s GPTs on the Apps SDK, and third-party systems, have this exact shape: a tool layer, a delegation layer, a render surface, and telemetry over all four.',
      },
      {
        heading: 'Stateless MCP changes the integration boundary',
        body: 'The MCP revision this capstone targets, 2026-07-28, removed protocol sessions entirely: no initialize handshake, no notifications/initialized, no Mcp-Session-Id. Every request instead carries its own version, capability, and identity fields inside params._meta, for example io.modelcontextprotocol/protocolVersion and io.modelcontextprotocol/clientCapabilities.\n\nThe server implements server/discover as a mandatory first call, returning ordinary results tagged resultType: complete or long-running ones tagged resultType: task. That single field is what tells the client whether to render an immediate answer or a progress state.\n\nStateless does not mean session-less UX. It means every request re-proves who is asking, which is a heavier per-call cost the client pays so no single compromised session can be replayed indefinitely.',
      },
      {
        heading: 'The gateway holds the credentials and the policy',
        body: 'OAuth 2.1 with PKCE and a resource indicator pins the audience to the gateway, so the client only ever holds a gateway-issued token. Upstream credentials stay at the gateway and the user never sees them.\n\nRBAC is enforced there too. In the reference setup alice has research:read and research:write and can call every tool. bob has research:read only, so generate_report is refused before any tokens are spent. The gateway also merges multiple backend servers into one namespace, prefixing tool names on collision, which is what lets the client hold one tool list instead of one per server.\n\nAnd it pins tool description hashes, dropping any server whose descriptions changed since the last review, which is the tool-poisoning defense applied continuously rather than once at install.',
      },
      {
        heading: 'The Tasks extension: tasks/get, not tasks/result',
        body: 'A tool call that takes longer than a request-response round-trip returns resultType: task instead of an answer. The client then polls tasks/get on an interval, calls tasks/update to send input the task is waiting on, or tasks/cancel to stop it. The completed Task carries the final result directly; there is no separate tasks/result call, and no tasks/list either, both were removed from the older draft this replaces.\n\nA client that wants a task-shaped result has to say so up front: it advertises io.modelcontextprotocol/tasks in the same request that might receive a task handle. Skip that and the server returns error -32021 naming the missing capability, which is a much better failure than a client silently blocking on a response type it never opted into.',
      },
      {
        heading: 'Two boundaries the design has to respect',
        body: 'The A2A call is an opacity boundary. The orchestrator sees the writer agent\'s task state and its returned artifact, never its reasoning or its own tool calls. That is deliberate, and it means a slow summarization step is a state, not a trace you can drill into.\n\nThe ui:// resource is a sandbox boundary. generate_report returns content blocks plus ui://report/current, and the host renders the interactive dashboard in a sandboxed iframe: a sorted paper list, citation counts, and a button that calls host.callTool with an arxiv_id. Every control inside that dashboard is a tool call crossing the sandbox, so it inherits the gateway\'s RBAC and shows up in the trace like any other dispatch.',
      },
      {
        heading: 'Defense in depth, and the Rule of Two audit',
        body: 'The security posture is layered rather than single-gate: OAuth 2.1 at the edge, RBAC per role, pinned description hashes, an audit log, and a Rule of Two review.\n\nThe Rule of Two check is the one worth running by hand. No single tool may combine untrusted input, access to sensitive data, and a consequential action. Any two of the three is tolerable, all three is the shape of a prompt-injection exploit.\n\nRun that audit against the tool list, not the architecture diagram, because the combination appears when a convenient tool grows one extra capability. Nothing in the gateway config changes; the exposure does, the moment generate_report starts accepting a free-text URL alongside its arxiv_id.',
      },
      {
        heading: 'Packaging is what makes it reproducible',
        body: 'The whole stack ships with an AGENTS.md and a SKILL.md, and those two files are the entire onboarding surface. A teammate on Claude Code, Cursor, Codex, or opencode drives the system by invoking the run-research skill. Deployment is docker compose up.\n\nThat is the real test of the phase. If another agent needs the source tree to reproduce the workflow, the packaging failed. If it needs two files and a compose command, the layering held.\n\nOne trace id runs through all of it, and its value is not only debugging. It is the only honest source for the progress UI, because it knows which hop is currently taking the time.',
      },
      {
        heading: 'Simulation versus production: the handoff table',
        body: 'A capstone that runs on stdlib Python is not a claim that MCP, A2A, OAuth, or OpenTelemetry are implemented. It is a control-flow model of the boundaries, and every layer has a stated production replacement.\n\n| Layer | Simulation | Production replacement |\n|---|---|---|\n| Discovery | server_discover() plus a static tool list | Real server/discover, cache-aware tools/list |\n| Auth | Token-keyed dictionary | OAuth authorization plus resource-server validation |\n| Tasks | Local handle, immediate tasks/get | Durable task store with tasks/get, update, cancel, TTL |\n| Delegation | Sleep plus a nested span | An A2A client resolving a real Agent Card |\n| Telemetry | In-memory span list | OTel SDK exporting to a real collector |\n\nA green local run validates the simulation only. Each row needs its own integration test the moment you promote it, and skipping that test is how a demo quietly ships as a security control.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p13-23-inline-architecture.svg',
        alt: 'Client to gateway to MCP servers, A2A, and a ui:// resource',
        caption: 'One request touches a gateway, two MCP servers, an opaque A2A agent, a rendered UI resource, and one shared trace id.',
        diagramBrief:
          'Left-to-right flow diagram on cream paper: User, arrow to Agent client, arrow to Authorization gateway, arrow to Research MCP server, with branches to Search/report tools, an A2A arrow down to an opaque box labeled "Writer agent (opaque)", and an arrow up to a UI box labeled "MCP App ui:// resource". A dotted line runs beneath the whole diagram labeled "one trace id, every hop" connecting to a Telemetry exporter box at bottom right. Monochrome ink, one accent color on the trace-id dotted line.',
      },
      {
        src: '/lessons/p13-23-inline-rule-of-two.svg',
        alt: 'The Rule of Two as a triangle of three risk factors',
        caption: 'Any two of the three is tolerable. All three in one tool is a prompt-injection exploit waiting to be found.',
        diagramBrief:
          'A triangle diagram on cream paper with three vertices labeled "Untrusted input", "Sensitive data access", "Consequential action". Each edge of the triangle labeled "tolerable pair". The triangle\'s interior, where all three meet, is shaded with a red accent and labeled "exploit shape". Monochrome ink otherwise.',
      },
    ],
    takeaways: [
      'A task lifecycle turns the surface into a long-running job: progress state, cancel, and a terminal state that is not just success or error.',
      'RBAC belongs in the render, not the response. A read-only role sees generate_report disabled with a reason, not a 403 after the click.',
      'A ui:// resource is a sandbox whose only outward call is host.callTool, so every control in it is a permissioned tool invocation and appears in the trace.',
      'Audit the tool list against the Rule of Two, not the diagram. Untrusted input plus sensitive data plus a consequential action in one tool is the exploit shape.',
    ],
    terms: [
      { term: 'Gateway-issued token', gloss: 'the only token the client sees', meaning: 'Transitive auth where the client holds only the gateway\'s token and the gateway keeps upstream credentials, so a leaked client token cannot reach the backend directly.' },
      { term: 'Merged namespace', gloss: 'one tool list', meaning: 'A flat tool list assembled from several backend MCP servers, with names prefixed on collision, letting the client hold one list instead of one per server.' },
      { term: 'Opacity boundary', gloss: 'the black box', meaning: 'The A2A edge past which a sub-agent\'s reasoning and tool calls are invisible to the orchestrator, by design.' },
      { term: 'ui:// resource', gloss: 'the interactive report', meaning: 'An MCP Apps resource the host renders in a sandboxed iframe, calling back only through host.callTool, which is why every button in it inherits the gateway\'s RBAC.' },
      { term: 'Rule of Two', gloss: 'the security audit rule', meaning: 'No one tool may combine untrusted input, sensitive data access, and a consequential action; any two of the three is tolerable, all three is the exploit shape.' },
      { term: 'Pinned description manifest', gloss: 'tool description hashes', meaning: 'Recorded hashes of tool descriptions, used to drop a server whose descriptions changed after install, a continuous defense against tool poisoning.' },
      { term: 'server/discover', gloss: 'the first call a client makes', meaning: 'The mandatory MCP 2026-07-28 call returning protocol version, capabilities, and server identity, replacing the removed initialize handshake.' },
      { term: 'Tasks extension', gloss: 'long tool calls', meaning: 'The optional io.modelcontextprotocol/tasks lifecycle of tasks/get, tasks/update, and tasks/cancel for a tool call that returns resultType: task instead of an immediate answer.' },
      { term: 'Stateless MCP', gloss: 'no session', meaning: 'The 2026-07-28 revision\'s removal of protocol sessions, Mcp-Session-Id, and the initialize handshake, replaced by version and identity fields on every request\'s params._meta.' },
      { term: 'Integration evidence', gloss: 'proof it actually works', meaning: 'A wire transcript, exported span, or receiver-side observation proving a real boundary was crossed, as opposed to a green run of the in-process simulation.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Given a client that omits io.modelcontextprotocol/tasks from its request capabilities, name the exact error code it gets back when generate_report would have returned a task handle.' },
      { level: 'medium', prompt: 'Run the Rule of Two audit against a tool list containing search_arxiv (untrusted input), read_user_profile (sensitive data), and send_email (consequential action) as separate tools. Now imagine generate_report gains an optional free-text notify_email field. Which rule does it now violate?' },
      { level: 'medium', prompt: 'A read-only user requests generate_report. Compare RBAC checked at the gateway edge versus RBAC checked on the response, and state which tokens get spent in each before the user sees a refusal.' },
      { level: 'design', prompt: 'Sketch the progress UI for the full seven-hop flow: MCP search, A2A delegation, ui:// render. Which hop can show a step-by-step trace, and which can only show a state, and why does the answer differ between them?' },
    ],
    furtherReading: [
      { label: 'MCP specification (2026-07-28)', url: 'https://modelcontextprotocol.io/specification/2026-07-28', why: 'The stateless request, discovery, tools, and authorization behavior this capstone targets.' },
      { label: 'MCP 2026-07-28 changelog', url: 'https://modelcontextprotocol.io/specification/2026-07-28/changelog', why: 'The exact session-removal and per-request metadata changes that make this revision different from the draft most tutorials still show.' },
      { label: 'MCP Tasks extension', url: 'https://tasks.extensions.modelcontextprotocol.io/specification/draft/tasks', why: 'The tasks/get, tasks/update, tasks/cancel contract, including which older methods it replaces.' },
      { label: 'MCP Apps SDK overview', url: 'https://github.com/modelcontextprotocol/ext-apps/blob/main/docs/overview.md', why: 'The App and app.callServerTool bridge behind the ui:// resource in this capstone.' },
      { label: 'A2A protocol specification', url: 'https://a2a-protocol.org/latest/', why: 'Agent Cards, task delegation, and artifacts, the protocol behind the opaque writer-agent hop.' },
      { label: 'OpenTelemetry GenAI semantic conventions', url: 'https://opentelemetry.io/docs/specs/semconv/gen-ai/', why: 'The trace and attribute conventions the one shared trace id in this capstone follows.' },
    ],
    shipIt: {
      kind: 'rubric',
      name: 'Production-readiness handoff rubric',
      body: '- Discovery: replaced the static tool list with real server/discover and tools/list calls?\n- Auth: replaced the token dictionary with OAuth authorization and resource-server validation?\n- RBAC: checked at the gateway edge, before the client renders any affordance, not on the response?\n- Tasks: durable store behind tasks/get, tasks/update, tasks/cancel, with a TTL and restart recovery?\n- Delegation: a real A2A client resolving a signed Agent Card, not a sleep and a nested span?\n- Sandbox: ui:// resource rendered with a real App bridge and a restrictive CSP?\n- Telemetry: spans exported to a real collector with parentage asserted at the receiver?\n- Audit: Rule of Two run against the actual tool list, not the architecture diagram?',
    },
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
