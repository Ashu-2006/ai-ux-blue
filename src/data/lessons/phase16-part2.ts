import type { Lesson } from '@/lib/lessons';

// Phase 16 · Part 2 · Talking, handing off, agreeing (lessons 16.03, 16.10-16.14)
export const phase16Part2: Lesson[] = [
  {
    id: 'p16-03-communication-protocols',
    phase: 'Phase 16 · Multi-Agent and Swarms',
    part: 'Part 2 · Talking, handing off, agreeing',
    index: '16.03',
    title: 'Four protocols, four different problems',
    oneLiner:
      'MCP connects an agent to tools. A2A connects an agent to other agents. ACP adds a trajectory audit trail. ANP adds cryptographic identity for agents you do not control. They are layers, not competitors.',
    readTime: '~10 min read',
    whyItMatters:
      'Each protocol hands your UI a different schema, and that is the real reason to know which one you are on. A2A gives you an 8-state task lifecycle with 4 terminal states, so your run component is a state machine with two non-obvious mid-run states, INPUT_REQUIRED and AUTH_REQUIRED, that both mean the run is waiting on the human and neither of which is an error. ACP\'s TrajectoryMetadata is the payload behind a "show the reasoning" disclosure. ANP\'s DID document carries humanAuthorization keys, which is a permission gate with a biometric affordance. Same word, four contracts.',
    learningObjectives: [
      'Trace a request through MCP, A2A, ACP, and ANP and name which layer owns which problem.',
      'Read an A2A task through its 8 states and identify the 2 that mean "waiting on a human," not "broken."',
      'Explain why ACP\'s TrajectoryMetadata is the payload behind a reasoning-disclosure UI, not a logging afterthought.',
      'Decide, given a cross-org agent call, whether Agent Card auth, mTLS, or ANP\'s humanAuthorization gate is the right fit.',
      'Diagnose schema drift versus a state machine violation from the same symptom: garbage output or a dropped update.',
    ],
    sections: [
      {
        heading: 'The problem: just pass strings works until it does not',
        body: 'You split the system into a researcher, a coder, and a reviewer. Each is good at its job. Now they have to talk. The first attempt is obvious: pass blobs of text and let the receiver parse however it can.\n\nIt works until the coder misinterprets a research summary, two agents deadlock waiting on each other, or you need agents built by different teams to collaborate. Without a shared contract for exchange, multi-agent systems are fragile, unauditable, and impossible to scale past the handful you personally wrote.\n\nThe industry answered with four protocols, each solving a different slice: MCP for tool access, A2A for peer collaboration, ACP for audit trails, ANP for cross-organization trust. FIPA\'s Agent Communication Language tried this in the 1990s and never left academia. The 2024-2026 wave shipped because the underlying model, tool-calling, was already production-grade.',
      },
      {
        heading: 'MCP and A2A: tool access versus peer collaboration',
        body: 'MCP (Anthropic, covered in Phase 13) is agent to tool: client-server, JSON-RPC, the agent discovers and calls whatever a server exposes. It does not help two agents talk to each other at all.\n\nA2A (Google, April 2025, now Linux Foundation as lf.a2a.v1, spec 1.0.0) is peer to peer. Each agent publishes an Agent Card at GET /.well-known/agent-card.json, and other agents read it, check its skills, and delegate. A card lists skills with IDs, tags, and supported input and output MIME types, plus supportedInterfaces, since one agent can speak JSON-RPC, REST, and gRPC at once, and its security schemes, so the client knows what auth it needs before the first request.\n\nMCP is vertical. A2A is horizontal. Production systems run both: an A2A peer calls its own MCP tools on its side of the boundary, and you never see its tool calls.',
      },
      {
        heading: 'The A2A task lifecycle is a state machine you have to render',
        body: 'Tasks are the unit of work and they move through defined states. SUBMITTED (acknowledged, not processing yet), WORKING, INPUT_REQUIRED (the agent needs more from the client), AUTH_REQUIRED, then four terminal ones: COMPLETED, FAILED, CANCELED, REJECTED. Eight states total.\n\nOnce a task reaches a terminal state it is immutable, no further messages. A follow-up creates a new task inside the same contextId, which is exactly how a threaded conversation maps onto the protocol. Streaming runs over SSE, with statusUpdate and artifactUpdate events. The two states worth designing carefully are INPUT_REQUIRED and AUTH_REQUIRED: both stall the run pending a human, and neither is a failure, so rendering them as errors is a mistake users will read as broken.',
      },
      {
        heading: 'ACP: trajectories as an audit trail',
        body: 'ACP (IBM/BeeAI, OpenAPI 3.1.1, merging into A2A) is the enterprise layer, and despite what most summaries claim, it is not JSON-LD. It is a REST/JSON API, and its differentiator is TrajectoryMetadata: every message part can carry a log of the reasoning steps and tool calls that produced it. For regulated industries that is the whole value, a provable chain from answer back to inputs. It also supports CitationMetadata for source attribution.\n\nACP uses Runs rather than Tasks, with three modes: sync (blocking), async (202 then poll), and stream (SSE). Discovery has four methods: a runtime GET /agents, an open .well-known/agent.yml, a centralized registry, or embedded container labels. The AgentManifest is simpler than an A2A Agent Card: name, description, input and output content types, and a metadata block naming the framework and recommended model.',
      },
      {
        heading: 'ANP: decentralized identity for agents you do not control',
        body: 'ANP (community, founded by GaoWei Chang) uses W3C DIDs under a custom did:wba method, so did:wba:example.com:user:alice resolves to a document at that domain. Key separation is enforced: signing keys (secp256k1) sit apart from encryption keys (X25519, used for HPKE per RFC 9180). Its unique field is humanAuthorization: keys that require explicit human approval, biometric, password, or HSM, before use. High-risk operations like fund transfers route through that path.\n\nTrust is bilateral and per-interaction, verified through domain TLS plus DID signature plus least privilege. There is no web of trust and no reputation score. ANP\'s most novel feature is meta-protocol negotiation: two agents that have never met exchange candidate formats in natural language, agree within 10 rounds, and generate code to handle the result.',
      },
      {
        heading: 'Four protocols, side by side',
        body: 'Line the four up and the differences are concrete, not philosophical.\n\n| Protocol | Creator | Wire format | Discovery | Unique feature |\n|---|---|---|---|---|\n| MCP | Anthropic | JSON-RPC | Tool listing | Tool schemas |\n| A2A | Google / Linux Foundation | JSON-RPC, REST, gRPC | Agent Card | Skills plus 8-state task lifecycle |\n| ACP | IBM / BeeAI | OpenAPI 3.1 REST | GET /agents, agent.yml | TrajectoryMetadata |\n| ANP | Community | JSON-RPC over DIDs | DID service endpoints | humanAuthorization, meta-protocol negotiation |\n\nA realistic enterprise system runs MCP inside each agent, A2A between agents in the same org, ACP-style trajectory logging wrapped around every response for compliance, and ANP where an agent needs to trust an organization it does not control.',
      },
      {
        heading: 'What actually breaks',
        body: 'Schema drift: agent A advertises application/json output, the schema changes between versions, agent B parses the old shape and gets garbage. Version your skills and output schemas; A2A puts version on the Agent Card for exactly this reason.\n\nState machine violations: a handler yields completed and then tries to yield more artifacts. The task is immutable, so updates get dropped or throw. Check terminal state before yielding.\n\nTrust resolution failures: B\'s domain is down, so its DID document cannot be fetched. Fail open and accept unverified agents, or fail closed? ANP recommends fail closed with least privilege.\n\nTrajectory bloat: a 200-tool-call run produces a massive audit entry, so log at configurable verbosity, full detail for regulated workloads, tool names only otherwise. Discovery thundering herd: 50 agents hitting GET /agents at startup, fixed with TTL caching, staggered intervals, or push registration.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p16-03-inline-protocol-stack.svg',
        alt: 'The four protocols as layers',
        caption: 'MCP sits under the agent, A2A between agents, ACP wraps every response, ANP verifies identity at the edge.',
        diagramBrief: 'ASCII stack diagram, four horizontal bands top to bottom: ANP (identity, edge), A2A (agent to agent), ACP (audit wrapper, dashed border around A2A to show it wraps), MCP (agent to tool, bottom). Right side, small icon of two agent boxes connected by an arrow labeled Agent Card. Style: cream paper background, black ink, one accent color (blue) on the A2A band.',
      },
      {
        src: '/lessons/p16-03-inline-lifecycle.svg',
        alt: 'The A2A 8-state task lifecycle',
        caption: 'Two mid-run states, INPUT_REQUIRED and AUTH_REQUIRED, both mean waiting on a person, not a failure.',
        diagramBrief: 'State diagram: SUBMITTED into WORKING into a branch to INPUT_REQUIRED and AUTH_REQUIRED, both looping back to WORKING, then into four terminal boxes in a row: COMPLETED, FAILED, CANCELED, REJECTED, each with a small lock icon indicating immutable. Style: cream paper, black ink, orange highlight on INPUT_REQUIRED and AUTH_REQUIRED boxes to mark them as the two non-error mid-run states.',
      },
    ],
    takeaways: [
      'MCP is vertical (agent to tool) and A2A is horizontal (agent to agent). Production systems run both, not one instead of the other.',
      'INPUT_REQUIRED and AUTH_REQUIRED are mid-run states waiting on a human. Rendering either as an error teaches users the system is broken.',
      'A terminal A2A task is immutable, so a follow-up is a new task in the same contextId. That is the threading model, for free.',
      'ANP\'s humanAuthorization keys are a permission gate in the protocol itself: high-risk actions cannot proceed without explicit human approval.',
    ],
    terms: [
      { term: 'Agent Card', gloss: '"the agent\'s business card"', meaning: 'A2A\'s JSON descriptor at /.well-known/agent-card.json listing skills, interfaces, and security schemes.' },
      { term: 'contextId', gloss: '"the conversation id"', meaning: 'The A2A identifier that groups follow-up tasks into one continuing conversation.' },
      { term: 'TrajectoryMetadata', gloss: '"the audit log"', meaning: 'ACP\'s per-message record of the reasoning steps and tool calls that produced an answer.' },
      { term: 'did:wba', gloss: '"a decentralized ID"', meaning: 'ANP\'s web-based DID method resolving an agent identity to a document on its own domain.' },
      { term: 'humanAuthorization', gloss: '"a permission check"', meaning: 'ANP keys requiring explicit human approval (biometric, password, HSM) before a high-risk action.' },
      { term: 'Schema drift', gloss: '"a breaking change"', meaning: 'An advertised output schema changing between versions while callers still parse the old shape.' },
      { term: 'Run', gloss: '"a task, basically"', meaning: 'ACP\'s unit of work, with three modes: sync, async with polling, or an SSE stream.' },
      { term: 'Meta-protocol negotiation', gloss: '"agents figuring it out"', meaning: 'ANP agents exchanging natural-language proposals for a shared format, bounded to 10 rounds before timeout.' },
      { term: 'Opaque lifecycle', gloss: '"a black box"', meaning: 'A2A\'s deliberate choice to expose task state and artifacts but never the remote agent\'s internal steps.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A remote A2A task sits in INPUT_REQUIRED for six minutes. Write the one-line status a user should see, and the one it should never see.' },
      { level: 'medium', prompt: 'An agent card advertises output mode application/json v1, then the server ships v2 with a renamed field. Name the two places, client and card, where this should have been caught before it shipped.' },
      { level: 'medium', prompt: 'Sketch the ACP TrajectoryMetadata payload for a three-tool-call research answer. What fields does your UI need to render a "show reasoning" disclosure without a follow-up API call?' },
      { level: 'design', prompt: 'Design the review screen for a fund-transfer action gated by ANP\'s humanAuthorization. What does the user see before they approve: the DID, the requesting agent\'s name, the amount, all three?' },
      { level: 'hard', prompt: 'A partner org\'s DID document fails to resolve mid-task. Decide fail-open versus fail-closed for your product, and write the one-sentence error copy that follows from your choice.' },
    ],
    furtherReading: [
      { label: 'Google A2A specification', url: 'https://github.com/google/A2A', why: 'The canonical spec and SDKs, v1.0.0 under the Linux Foundation.' },
      { label: 'IBM/BeeAI ACP specification', url: 'https://github.com/i-am-bee/acp', why: 'The OpenAPI 3.1 source for Runs, TrajectoryMetadata, and CitationMetadata.' },
      { label: 'Agent Network Protocol repository', url: 'https://github.com/agent-network-protocol/AgentNetworkProtocol', why: 'The did:wba spec and the meta-protocol negotiation walkthrough.' },
      { label: 'W3C Decentralized Identifiers (DID) Core', url: 'https://www.w3.org/TR/did-core/', why: 'The identity standard ANP builds did:wba on top of.' },
      { label: 'RFC 9180, Hybrid Public Key Encryption', url: 'https://www.rfc-editor.org/rfc/rfc9180', why: 'The encryption scheme behind ANP\'s keyAgreement keys.' },
      { label: 'FIPA Agent Communication Language specification', url: 'http://www.fipa.org/specs/fipa00061/SC00061G.html', why: 'The 1990s academic precursor these protocols quietly rebuilt.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Cross-protocol integration checklist',
      body: '- Which protocol owns this call: MCP (tool), A2A (peer), ACP (audit), or ANP (trust)?\n- Does the Agent Card declare a version? Does your client check it?\n- Are INPUT_REQUIRED and AUTH_REQUIRED rendered as prompts, never as errors?\n- Does every response destined for a regulated workflow carry TrajectoryMetadata or an equivalent?\n- Is there a fail-open or fail-closed decision written down for identity resolution failures?\n- Is discovery cached with a TTL so a cold start does not become a thundering herd?',
    },
    demoCaption:
      'The A2A task lifecycle as your run component sees it. Four terminal states, and two mid-run states that mean "waiting on a person". Treating those two as failures is the difference between a paused run and a broken product.',
    demo: {
      archetype: 'sequence',
      subject: 'A2A task · one delegated job',
      badLabel: 'Two-state UI',
      goodLabel: 'Full lifecycle',
      badSequence: [
        'task submitted, UI shows a spinner',
        'agent needs a missing field',
        'INPUT_REQUIRED arrives, UI shows an error',
        'user retries the whole task',
        'a second task starts from zero',
      ],
      goodSequence: [
        'SUBMITTED: acknowledged, queued, not yet working',
        'WORKING: artifacts stream in over SSE',
        'INPUT_REQUIRED: inline prompt for the missing field',
        'WORKING resumes on the same task id',
        'COMPLETED: terminal, immutable, follow-ups reuse contextId',
      ],
      badCaption:
        'Collapsing eight states into loading and error throws away the two that a human can act on. The user reads a request for input as a crash, restarts, and pays for the work twice.',
      goodCaption:
        'INPUT_REQUIRED and AUTH_REQUIRED are the states where the run is legitimately waiting on the person, so they render as inline prompts rather than failures. The terminal state is immutable, which makes contextId the natural thread key for follow-ups.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'four agent protocols, four different problems. they are layers, not rivals.',
        body:
          'four agent protocols, four different problems. they are layers, not rivals.\n\nMCP: agent to tool.\nA2A: agent to agent, Agent Cards at /.well-known/agent-card.json.\nACP: same but with TrajectoryMetadata, a provable chain from answer to inputs.\nANP: W3C DIDs, so agents from different orgs can verify each other with no central authority.\n\na real enterprise system runs all four at different levels.',
      },
      {
        kind: 'X · design angle',
        hook: 'A2A has 8 task states. two of them mean "waiting on a human".',
        body:
          'A2A has 8 task states. two of them mean "waiting on a human".\n\nINPUT_REQUIRED and AUTH_REQUIRED are not errors. the run is paused, pending a person.\n\ncollapse the lifecycle into loading + error and users read a request for input as a crash. they restart. you pay for the work twice.\n\nthe 4 terminal states are immutable, which hands you threading for free: a follow-up is a new task in the same contextId.',
      },
      {
        kind: 'X · one-liner',
        hook: 'ANP puts a permission gate in the protocol.',
        body:
          'ANP puts a permission gate in the protocol.\n\nhumanAuthorization keys are separate from signing keys and require explicit human approval, biometric or password or HSM, before use.\n\nhigh-risk actions like fund transfers route through that path. the gate is not in your UI as an afterthought, it is in the identity document.',
      },
    ],
    source: {
      label: 'Full lesson: 03 03-communication-protocols',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/16-multi-agent-and-swarms/03-communication-protocols',
    },
  },
  {
    id: 'p16-10-group-chat',
    phase: 'Phase 16 · Multi-Agent and Swarms',
    part: 'Part 2 · Talking, handing off, agreeing',
    index: '16.10',
    title: 'Group chat: the selector is the whole design',
    oneLiner:
      'Put N agents in one conversation and a selector function decides who speaks next. Round-robin is deterministic and context-blind. LLM-selected is context-aware and adds a model call per turn. That one choice sets everything else.',
    readTime: '~10 min read',
    diagram: '/lessons/p16-10.svg',
    diagramCaption:
      'N agents on one shared message pool with a selector invoked between turns to pick the next speaker.',
    whyItMatters:
      'Group chat is the only pattern where the routing decision itself is user-visible content. Every turn, something chose a speaker, and if you do not render why, the transcript reads as arbitrary. That is a selector trace row between messages, not a hidden field. Two failure modes are pure UI: a hot speaker dominating means your turn distribution needs to be visible as a count per agent, and context bloat means every agent reading every message, so the token cost per turn climbs with transcript length and your budget display has to be per-turn, not per-run.',
    learningObjectives: [
      'Name the three selector flavors, round-robin, LLM-selected, custom, and what each trades off in determinism, latency, and cost.',
      'Read a GroupChat transcript and identify whether the routing came from a fixed cycle or a context-aware call.',
      'Trace the AutoGen to AG2 to Microsoft Agent Framework lineage and say which one to build against today.',
      'Design a turn-distribution display that surfaces a hot speaker before a user has to notice it themselves.',
      'Pick at least two termination conditions for a given group chat and explain why one alone is not enough.',
    ],
    sections: [
      {
        heading: 'The problem: static graphs cannot express a real conversation',
        body: 'LangGraph-style static graphs are great when the workflow is known. Real conversations are not static. Sometimes the coder asks the reviewer, sometimes the researcher, sometimes the writer. Hardcoding every possible handoff produces an edge explosion, and most of those edges fire once.\n\nWhat you want instead is agents reacting to a shared pool, with some function deciding who talks next. That is exactly what AutoGen GroupChat does: every agent sees every message, and a selector is invoked at each turn to pick the next speaker. The shape is one shared pool feeding N agents plus a selector, not an edge wired between every possible pair.',
      },
      {
        heading: 'The three selector flavors',
        body: 'Round-robin: a fixed cycle. Deterministic, scales linearly in N, and completely ignores context, so the coder gets a turn even when the topic is legal review.\n\nLLM-selected: a model call reads the recent pool and returns the best next speaker. Context-aware and slow, because every turn now costs an extra call. This is AutoGen\'s default.\n\nCustom: a Python function with whatever logic you like. The typical shape is LLM-selected with fallback rules, such as always giving the verifier the turn after the coder. That hybrid is usually the right answer in production, because it pins the handoffs you actually care about and leaves the rest adaptive.',
      },
      {
        heading: 'Wiring it: ConversableAgent, GroupChat, GroupChatManager',
        body: 'AutoGen\'s API surface is three objects. A ConversableAgent takes a name, a system_message, and an llm_config, the same shape as any single agent. A GroupChat wraps a list of agents plus an empty messages array. A GroupChatManager wraps the GroupChat with its own llm_config, and that manager is what actually holds the selector.\n\nWhen an agent finishes a turn, the manager calls the selector, the selector returns the next agent, and the loop continues until a termination condition fires. Nothing about the topology is declared up front; it emerges from however the selector reads the pool on a given turn. That is the tradeoff stated plainly: no graph to draw, but also no graph to audit before the first run.',
      },
      {
        heading: 'Manager, termination, and the loop',
        body: 'A GroupChatManager holds the selector. When an agent completes a turn, the manager calls the selector, which returns the next agent, and the loop continues until a termination condition fires.\n\nThree termination patterns dominate. Max rounds: a hard cap on total turns, which is the one that saves you from bill surprises. A TERMINATE token: agents emit a sentinel and the manager stops when it appears. A goal-reached check: a lightweight verifier runs each turn and stops the chat when the work is done. Pick at least two, because a token-only termination fails silently when no agent ever emits it.',
      },
      {
        heading: 'Group chat versus supervisor',
        body: 'Group chat fits emergent conversations where you do not want to pre-wire every next speaker: role-mixing tasks where the coder asks the researcher who asks the archivist who asks the coder back, flow that is not a DAG. Think brainstorm meeting, not assembly line.\n\nSupervisor and group chat share the same primitives, agent, message, tool, selector; they just default differently. Supervisor: one agent plans and the rest execute, so the selector is effectively "ask the planner what to do." Group chat: all agents are peers, and the selector is a function over the shared pool rather than a single agent\'s judgment. Reach for supervisor when one role should own the plan; reach for group chat when no single agent should.',
      },
      {
        heading: 'The lineage, because the names moved',
        body: 'In early 2025 Microsoft began a major rewrite of AutoGen (v0.4) around an event-driven actor model. The community forked v0.2\'s GroupChat semantics as AG2, preserving the API early adopters had already integrated.\n\nIn February 2026 Microsoft announced AutoGen would go to maintenance mode, with the event-driven actor model merging into Microsoft Agent Framework, which hit RC in February 2026 and is now merged with Semantic Kernel. The GroupChat concept survives in both tracks; the implementation differs. AG2 is the preferred upstream for v0.2-compatible code. The primitive outlived three renames, which is the argument for learning the primitive.',
      },
      {
        heading: 'Four ways it breaks',
        body: 'Strict determinism: the LLM selector is inconsistent, so the same prompt across runs picks different next speakers. If audit and replay matter, this pattern is wrong.\n\nSycophancy cascades: agents defer to whoever spoke most confidently. Counter-prompt this explicitly, because it does not self-correct.\n\nContext bloat: every agent reads every message, so after 10 turns the context is enormous. Projections that scope each agent\'s view are the fix. Hot speakers: the selector favors one agent\'s specialties and it dominates the conversation, which needs speaker balance built into the selector itself. Compared with supervisor, the primitives are identical; group chat just defaults to LLM-selected orchestration over a full pool.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p16-10-inline-selector-flavors.svg',
        alt: 'Three selector flavors compared',
        caption: 'Round-robin is free and blind. LLM-selected costs a call and reads the room. Custom pins the handoffs that matter.',
        diagramBrief: 'Three-column comparison diagram. Column 1 "Round-robin": a circular arrow cycling through three agent icons labeled A, B, C, tag "0 extra calls, deterministic". Column 2 "LLM-selected": the three agent icons with a small magnifying-glass icon reading the pool, arrow to a highlighted agent, tag "plus 1 call per turn, context-aware". Column 3 "Custom": the LLM-selected icon plus a padlock icon on one fixed arrow (verifier-after-coder), tag "hybrid". Style: cream paper, black ink, one accent color per column.',
      },
      {
        src: '/lessons/p16-10-inline-lineage.svg',
        alt: 'AutoGen to AG2 to Microsoft Agent Framework',
        caption: 'The GroupChat primitive survived three renames in about 18 months.',
        diagramBrief: 'Horizontal timeline from early 2025 to February 2026. Nodes: "AutoGen v0.2 GroupChat" branching into two arrows, one labeled "forked as AG2, preserves v0.2 API" and one labeled "AutoGen v0.4, event-driven actor model". Both arrows converge into a final node "Feb 2026: AutoGen to maintenance mode, actor model merges into Microsoft Agent Framework, with Semantic Kernel". Style: cream paper, black ink, one accent color marking the surviving primitive across all nodes.',
      },
    ],
    takeaways: [
      'The selector is the design. Round-robin, LLM-selected, or custom sets determinism, latency, and cost in one choice.',
      'LLM-selected orchestration is non-reproducible across runs, so it is the wrong pattern anywhere audit or exact replay matters.',
      'The routing decision is user-visible content: render why each speaker was chosen or the transcript reads as arbitrary.',
      'Full pool means token cost per turn grows with transcript length, so the budget display has to be per-turn, not per-run.',
    ],
    terms: [
      { term: 'GroupChat', gloss: '"agents in one chat room"', meaning: 'N agents sharing one message pool with a selector picking the next speaker each turn.' },
      { term: 'Selector', gloss: '"who goes next"', meaning: 'The function deciding who speaks next: round-robin, an LLM call, or custom logic.' },
      { term: 'GroupChatManager', gloss: '"the meeting host"', meaning: 'The component that holds the selector and drives the turn loop until termination.' },
      { term: 'ConversableAgent', gloss: '"the base agent class"', meaning: 'AutoGen\'s base agent type: a name, a system_message, and an llm_config, nothing more.' },
      { term: 'TERMINATE token', gloss: '"the stop word"', meaning: 'A sentinel message an agent emits to end the chat.' },
      { term: 'Sycophancy cascade', gloss: '"agreeableness"', meaning: 'Agents deferring to whoever spoke most confidently rather than reasoning independently.' },
      { term: 'Hot speaker', gloss: '"the chatty one"', meaning: 'One agent dominating the conversation because the selector keeps favoring its specialties.' },
      { term: 'Projection', gloss: '"a scoped view"', meaning: 'A per-agent slice of shared state, used to stop context bloat once a chat runs long.' },
      { term: 'AG2', gloss: '"the AutoGen fork"', meaning: 'The community continuation of AutoGen v0.2\'s GroupChat API after Microsoft rewrote v0.4 around an actor model.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A three-agent round-robin chat runs 12 turns. Compute how many turns each agent gets and whether that distribution matches who should be talking.' },
      { level: 'medium', prompt: 'An LLM-selected chat produces a different next speaker on two runs with an identical prompt. List two product surfaces this breaks (replay, support ticket review) and one it does not.' },
      { level: 'medium', prompt: 'Design a custom selector: LLM-selected with one pinned rule, verifier always follows coder. Write the rule in plain language a teammate could implement without seeing your code.' },
      { level: 'design', prompt: 'Sketch the selector-trace row that renders between two chat messages. What three pieces of information does it need to make "why this agent spoke" legible at a glance?' },
      { level: 'hard', prompt: 'A hot speaker has taken 60 percent of turns in a 20-turn chat. Propose a selector change that rebalances without hardcoding a fixed cycle.' },
    ],
    furtherReading: [
      { label: 'AutoGen GroupChat design pattern docs', url: 'https://microsoft.github.io/autogen/stable/user-guide/core-user-guide/design-patterns/group-chat.html', why: 'The reference implementation and its default selector behavior.' },
      { label: 'AG2 repository', url: 'https://github.com/ag2ai/ag2', why: 'The community continuation of AutoGen v0.2\'s GroupChat API.' },
      { label: 'Microsoft Agent Framework documentation', url: 'https://learn.microsoft.com/en-us/agent-framework/', why: 'The merged successor, RC February 2026, now folded in with Semantic Kernel.' },
      { label: 'AutoGen v0.4 release notes', url: 'https://microsoft.github.io/autogen/stable/', why: 'The event-driven actor model rewrite that triggered the AG2 fork.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'GroupChat selector checklist',
      body: '- Max rounds cap set (10-20 for typical tasks)?\n- Turn count per agent tracked and an imbalance threshold set to alert on?\n- A termination token or dedicated verifier agent wired, not just a token nobody emits?\n- A projection or scoped memory plan for chats past roughly 10 messages?\n- Selector input and output logged for every LLM-selected turn, so a wrong route is debuggable?',
    },
    demoCaption:
      'The same three-agent chat under round-robin and LLM-selected. Watch turn 2. Round-robin hands the coder the floor during a legal question because the cycle says so; the LLM selector reads the pool and costs you a call to do it.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Coder, reviewer, manager · one pool',
      badLabel: 'Round-robin',
      goodLabel: 'LLM-selected',
      badLines: [
        'fixed cycle: coder, reviewer, manager, repeat',
        'zero extra model calls per turn',
        'same route every single run',
        'coder speaks during a legal question',
        'turn distribution perfectly even, often wrong',
      ],
      goodLines: [
        'selector reads the recent pool each turn',
        'one extra model call per turn',
        'route varies across runs on identical input',
        'the relevant agent gets the floor',
        'hot speakers emerge unless balance is enforced',
      ],
      badCaption:
        'A fixed cycle is free and reproducible, and it hands the floor to whoever is next rather than whoever is relevant. In a mixed-role conversation that wastes most turns on agents with nothing to add.',
      goodCaption:
        'Context-aware selection costs a model call per turn and buys relevance, then gives up reproducibility: the same input can route differently across runs. Production usually lands on custom, an LLM selector with pinned fallback rules like verifier-after-coder.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'in a group chat, the selector is the entire architecture.',
        body:
          'in a group chat, the selector is the entire architecture.\n\nround-robin: deterministic, free, context-blind. the coder gets the floor during a legal question.\nLLM-selected: reads the pool, picks the relevant agent, costs a model call per turn.\ncustom: LLM selection with pinned fallbacks like verifier-after-coder.\n\nthat one function sets determinism, latency, and cost.',
      },
      {
        kind: 'X · design angle',
        hook: 'group chat is the one pattern where routing is user-visible content.',
        body:
          'group chat is the one pattern where routing is user-visible content.\n\nevery turn, something chose a speaker. if you do not render why, the transcript reads as arbitrary and nobody trusts it.\n\nso: a selector trace row between messages, and a turn count per agent, because a hot speaker dominating is invisible until you can see the distribution.\n\nalso every agent reads every message, so token cost per turn grows with transcript length. budget per turn, not per run.',
      },
      {
        kind: 'X · one-liner',
        hook: 'the GroupChat primitive outlived three renames in 18 months.',
        body:
          'the GroupChat primitive outlived three renames in 18 months.\n\nAutoGen v0.2 -> forked as AG2. AutoGen v0.4 rewrote it as an actor model. February 2026: AutoGen to maintenance mode, the model merges into Microsoft Agent Framework with Semantic Kernel.\n\nlearn the primitive. the packaging keeps moving.',
      },
    ],
    source: {
      label: 'Full lesson: 10 10-group-chat-speaker-selection',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/16-multi-agent-and-swarms/10-group-chat-speaker-selection',
    },
  },
  {
    id: 'p16-11-handoffs',
    phase: 'Phase 16 · Multi-Agent and Swarms',
    part: 'Part 2 · Talking, handing off, agreeing',
    index: '16.11',
    title: 'Handoffs and routines: two primitives, and memory is your problem',
    oneLiner:
      'OpenAI Swarm reduced multi-agent orchestration to a routine (a prompt plus tools) and a handoff (a tool that returns another agent). No DSL, no state machine. It is stateless, which is why "the second agent forgot what I said" is a structural outcome, not a bug.',
    readTime: '~10 min read',
    diagram: '/lessons/p16-11.svg',
    diagramCaption:
      'A triage agent calling handoff tools that return refund, sales, or support agents, each with its own tools.',
    whyItMatters:
      'This is the pattern where the user feels the seam. A handoff resets the conversation to the new agent\'s prompt plus whatever history transferred, so continuity of context is a decision you make explicitly or lose. The user does not experience a handoff, they experience "I already told you my order number". Two surfaces follow: a visible transfer moment naming who is now handling the request, and a carried-context summary the user can see and correct. The Agents SDK added handoff filters precisely because "what context transfers" is a control you need, and a dropped field must be re-suppliable once, not force a repeat.',
    learningObjectives: [
      'Define a routine and a handoff in one sentence each, and say which object the runtime watches for to switch agents.',
      'Trace what a handoff resets versus what a handoff filter can preserve, and name the user-facing symptom of getting it wrong.',
      'Compare Swarm\'s agent-decides-next model to GroupChat\'s manager-decides-next model and say where you would look first when a route is wrong.',
      'Design a carried-context summary surface a user can review and correct after a handoff.',
      'List three limits that follow directly from Swarm being stateless, and which of them the OpenAI Agents SDK actually fixes.',
    ],
    sections: [
      {
        heading: 'The problem: every framework wants you to learn its DSL',
        body: 'LangGraph has nodes and edges. CrewAI has crews and tasks. AutoGen has GroupChat and managers. These are real abstractions, and they make multi-agent feel heavier than the thing actually is.\n\nSwarm (OpenAI, October 2024) pushes the other way: use the tool-calling capability the model already has. Handoffs become tool calls. The orchestrator is whichever agent currently holds the conversation. The state machine is implicit in the agents\' system prompts, never written down as a graph.',
      },
      {
        heading: 'Two primitives, and that is the whole abstraction',
        body: 'Routine: a system prompt defining an agent\'s role and its available tools. A scoped set of instructions, such as "you are a triage agent; if the user asks about refunds, hand off to the refund agent."\n\nHandoff: a tool the agent can call that returns a new Agent object. The runtime detects the Agent return value and switches the active agent for the next turn.\n\nThat is it. The triage agent\'s prompt makes it choose the right handoff based on the user message, and the model\'s tool-calling does the routing. Swarm\'s entire source fits in a few hundred lines, which is why it remains the cleanest conceptual reference even though the OpenAI Agents SDK (March 2025) is the production successor.',
      },
      {
        heading: 'The triage pattern, spelled out',
        body: 'The reference shape is a triage agent with three handoff tools: transfer_to_refunds, transfer_to_sales, transfer_to_support. Each function\'s entire body is return refund_agent, or its peer, nothing else. Swarm\'s runtime watches for a function call that returns an Agent object, and when it sees one, it swaps the active agent for the next turn.\n\nThe triage agent\'s system prompt is the only place routing logic lives: "you are a triage agent, if the user asks about refunds hand off to the refund agent." There is no router class, no rules engine. The model reads the user message, matches it against the prompt\'s routing instructions, and calls the matching tool. A few lines of Python per handoff function is the entire mechanism.',
      },
      {
        heading: 'Why it went viral',
        body: 'Small API: two concepts to learn, and both map to things you already understand. It uses what the model already does, since tool calling is production-grade across every major provider. And there is no state-machine burden: you never describe the graph, because the agents\' prompts describe who they hand off to.\n\nThe cost of that elegance is that the routing logic is now distributed across prompts rather than centralized in a graph. Nothing in the codebase shows you the full topology. You reconstruct it by reading every agent\'s instructions, which is fine at four agents and unpleasant at fourteen.',
      },
      {
        heading: 'The stateless trade, which the user feels',
        body: 'Swarm is explicitly stateless between runs. The framework keeps a message history during a run and persists nothing after. Memory, continuity, and long-running tasks are all the caller\'s problem.\n\nThat surfaces as three concrete limits. Long sessions with shared memory: a handoff resets conversation state to the new agent\'s prompt plus history, so there is no persistent state across agents unless you manage it. Parallel execution: handoff is one-at-a-time because the active agent switches, so parallelism means orchestrating multiple runs yourself. Audit and replay: stateless runs are hard to replay exactly, because the handoff choice is not deterministic.',
      },
      {
        heading: 'Where it fits and where it struggles',
        body: 'Triage patterns fit best: a front-line agent routing to a refund, sales, or support specialist, each scoped to its own tools. Skill-based handoffs work the same way for short, bounded conversations, an FAQ that escalates to a ticket, a simple workflow with three or four stops.\n\nIt struggles at the edges Swarm never hid. Long sessions needing shared memory: nothing persists by default. Parallel execution: handoff is one-at-a-time, since only one agent is active, so parallelism means orchestrating multiple runs yourself. Audit and replay: a stateless run\'s handoff choice is not deterministic, so replaying an exact transcript is not guaranteed even with the same input.',
      },
      {
        heading: 'What the SDK added, and Swarm versus GroupChat',
        body: 'The OpenAI Agents SDK (March 2025) keeps the handoff primitive and adds the production ergonomics: session state persisting a thread across runs, guardrails as input and output validation hooks, tracing on every tool call and handoff, and handoff filters that control what context transfers. That last one is the important addition, because "what the next agent knows" was previously implicit.\n\nSwarm and GroupChat both use LLM-driven routing and differ on who picks next. GroupChat: a selector outside the agents picks the next speaker. Swarm: the current agent picks its successor by calling a handoff tool. Swarm is "agent decides what is next", GroupChat is "manager decides what is next". The decision lives in the active agent\'s tool call versus in the GroupChatManager.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p16-11-inline-handoff-shape.svg',
        alt: 'A handoff as a function returning an Agent',
        caption: 'transfer_to_refunds() does nothing but return an Agent object. The runtime sees that and switches who is active.',
        diagramBrief: 'Simple flow diagram: a chat bubble "user asks about a refund" arrow into a box "triage_agent (routine: prompt + 3 handoff tools)". From that box, an arrow labeled "calls transfer_to_refunds()" pointing at a small function icon that outputs "return refund_agent". That output feeds into a new box "refund_agent (active for next turn)". Style: cream paper, black ink, one accent color highlighting the function-returns-Agent moment.',
      },
      {
        src: '/lessons/p16-11-inline-context-transfer.svg',
        alt: 'What crosses a handoff, filtered versus unfiltered',
        caption: 'Full history is expensive, nothing is silent, a filtered summary is the usual answer.',
        diagramBrief: 'Three-lane comparison. Lane 1 "No transfer": triage box, arrow to refund box with an empty envelope icon, label "asks for order number again". Lane 2 "Full history": arrow with a large stack-of-papers icon, label "expensive, most of it irrelevant". Lane 3 "Filtered handoff": arrow with a small labeled card icon reading "order id, reason, sentiment", label "the OpenAI Agents SDK default pattern". Style: cream paper, black ink, one accent color on lane 3.',
      },
    ],
    takeaways: [
      'Two primitives: a routine is a prompt plus tools, a handoff is a tool that returns an agent. The graph is never written down.',
      'Statelessness means "the second agent forgot what I said" is the default behavior. Continuity of context is something you build, not something you get.',
      'Handoff filters decide what the next agent knows, so a visible carried-context summary the user can correct is the matching surface.',
      'Swarm is agent-decides-next, GroupChat is manager-decides-next. Same LLM routing, different place to look when the route is wrong.',
    ],
    terms: [
      { term: 'Routine', gloss: '"the agent prompt"', meaning: 'A system prompt plus tool list defining one agent\'s scoped role.' },
      { term: 'Handoff', gloss: '"transfer to another agent"', meaning: 'A tool call that returns another Agent, switching who holds the conversation.' },
      { term: 'Stateless run', gloss: '"no memory between runs"', meaning: 'A run that keeps message history in memory during execution and persists nothing after it ends.' },
      { term: 'Handoff filter', gloss: '"a gate on transfer"', meaning: 'An Agents SDK control over which context transfers to the receiving agent.' },
      { term: 'Session state', gloss: '"remembering the thread"', meaning: 'Persistent thread state across runs, added by the Agents SDK on top of the handoff primitive.' },
      { term: 'Triage pattern', gloss: '"the router agent"', meaning: 'A front-line agent that routes a user to the right specialist by handoff.' },
      { term: 'Active agent', gloss: '"who\'s speaking now"', meaning: 'The agent currently holding the conversation; a handoff is the only thing that changes it.' },
      { term: 'Handoff loop', gloss: '"ping-pong"', meaning: 'A failure mode where two agents keep handing the conversation back to each other.' },
      { term: 'OpenAI Agents SDK', gloss: '"production Swarm"', meaning: 'The March 2025 successor adding session state, guardrails, and tracing on top of the same handoff primitive.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A user gives their order number to triage, then triage hands off to refund with no filter. Write the line the refund agent says first, and why it repeats the question.' },
      { level: 'medium', prompt: 'Design a handoff filter for a support-to-billing transfer. List exactly three fields it carries and one it deliberately drops.' },
      { level: 'medium', prompt: 'Two agents hand off to each other three times in a row on the same user turn. Write the loop-detection rule and the fallback it should trigger.' },
      { level: 'design', prompt: 'Sketch the transfer moment in a chat transcript: what tells the user the voice just changed, without a paragraph of explanation?' },
      { level: 'hard', prompt: 'Compare a Swarm handoff to a GroupChatManager selector for which one makes prompt injection worse. State your answer and the one sentence of reasoning behind it.' },
    ],
    furtherReading: [
      { label: 'OpenAI cookbook, Orchestrating Agents: Routines and Handoffs', url: 'https://developers.openai.com/cookbook/examples/orchestrating_agents', why: 'The original articulation of the two-primitive model, with a plain code walkthrough.' },
      { label: 'OpenAI Swarm repository', url: 'https://github.com/openai/swarm', why: 'The reference implementation, still the cleanest read even though it is not the production path.' },
      { label: 'OpenAI Agents SDK documentation', url: 'https://openai.github.io/openai-agents-python/', why: 'The production successor: sessions, guardrails, tracing, and handoff filters.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Handoff design checklist',
      body: '- Does every handoff write a trace event: from-agent, to-agent, context snapshot?\n- Is the context transfer rule explicit: full history, last N messages, or a summary?\n- Is a handoff to a specialist with different tool permissions authenticated, not just routed?\n- Is there a loop-detection rule for repeat handoffs between the same two agents?\n- Is there a fallback agent if a handoff target does not exist?',
    },
    demoCaption:
      'Same refund request, same three agents. The difference is what crossed the handoff. In the first, the specialist restarts from its own prompt and asks for the order number again. In the second, a carried summary arrives with it and the user is asked for nothing twice.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Triage to refund specialist',
      badLabel: 'No carried context',
      goodLabel: 'Filtered handoff',
      badLines: [
        'user gives order number and reason to triage',
        'triage calls transfer_to_refund()',
        'refund agent starts from its own prompt',
        '"can I get your order number?"',
        'user reads this as the system forgetting',
      ],
      goodLines: [
        'handoff filter carries order id, reason, sentiment',
        'transfer moment named in the transcript',
        'refund agent opens with the order already loaded',
        'carried summary shown and editable',
        'one correction affordance, not a repeat',
      ],
      badCaption:
        'A handoff resets the conversation to the new agent\'s prompt plus whatever history transferred, so nothing carried means the specialist genuinely does not know. The user does not perceive an architecture, they perceive being asked twice.',
      goodCaption:
        'The filter is the continuity contract: name what crosses, then show it. Rendering the carried summary lets the user fix a wrong field once instead of re-litigating the whole conversation, and naming the transfer explains why the voice changed.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'OpenAI Swarm reduced multi-agent orchestration to two things.',
        body:
          'OpenAI Swarm reduced multi-agent orchestration to two things.\n\nroutine: a system prompt plus tools.\nhandoff: a tool that returns another agent. the runtime sees the Agent return value and switches who holds the conversation.\n\nno DSL. no graph. the state machine lives in the agents\' prompts.\n\nthe whole source fits in a few hundred lines, which is why it is still the cleanest reference.',
      },
      {
        kind: 'X · design angle',
        hook: '"the second agent forgot what I said" is not a bug. it is the default.',
        body:
          '"the second agent forgot what I said" is not a bug. it is the default.\n\na handoff resets the conversation to the new agent\'s prompt plus whatever history transferred. stateless means continuity is your problem.\n\nusers never perceive a handoff. they perceive being asked for their order number twice.\n\ntwo surfaces fix it: name the transfer, and show the carried context so they can correct one field instead of repeating everything.',
      },
      {
        kind: 'X · one-liner',
        hook: 'Swarm is agent-decides-next. GroupChat is manager-decides-next.',
        body:
          'Swarm is agent-decides-next. GroupChat is manager-decides-next.\n\nsame LLM routing, different place to look when the route is wrong: the active agent\'s tool call, or the GroupChatManager\'s selector.\n\nthat is the whole distinction, and it decides where you put your trace.',
      },
    ],
    source: {
      label: 'Full lesson: 11 11-handoffs-and-routines',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/16-multi-agent-and-swarms/11-handoffs-and-routines',
    },
  },
  {
    id: 'p16-12-a2a',
    phase: 'Phase 16 · Multi-Agent and Swarms',
    part: 'Part 2 · Talking, handing off, agreeing',
    index: '16.12',
    title: 'A2A: HTTP for agents, with an opaque lifecycle',
    oneLiner:
      'Google announced A2A in April 2025; by April 2026 it has 150 plus backing organizations. Agent Cards for discovery, tasks with typed artifacts, and a deliberately opaque lifecycle: you see state transitions and results, never how the remote agent got there.',
    readTime: '~10 min read',
    diagram: '/lessons/p16-12.svg',
    diagramCaption:
      'Discovery, task submission, polling or SSE, and a typed artifact returned across an organizational boundary.',
    whyItMatters:
      'Opaque lifecycle is the design constraint, not a footnote. Across an A2A boundary you cannot show a step trace, because the remote agent does not owe you one. All you have is a state, an elapsed time, and eventually a typed artifact, so the surface is a delegation card with a status and an owner, not a reasoning stream. Artifacts being typed is the good news: text, structured JSON, image, audio, and video are first-class, so your renderer switches on artifact type rather than parsing prose. And hours-long tasks are normal here, which means the run has to survive a page reload by task id.',
    learningObjectives: [
      'Explain what an Agent Card declares and why discovery is a single GET request rather than a handshake.',
      'Trace the A2A task lifecycle from submitted to a terminal state and say what the opaque lifecycle deliberately hides.',
      'Decide when to use A2A versus a direct RPC call, based on latency and organizational boundary, not habit.',
      'Compare A2A to ACP, ANP, and NLIP well enough to say which one a partner org is likely already running.',
      'Design a delegation card UI for a task that could run for hours, built only from what the protocol actually gives you.',
    ],
    sections: [
      {
        heading: 'The problem: every agent pair becomes a custom integration',
        body: 'Your agent needs to call another agent on another system. You expose an HTTP endpoint, define a bespoke JSON schema, and hope the other side speaks it. Do that across five partners and you have five integrations with five failure modes and no shared vocabulary for "the task is still running".\n\nA2A is the universal wire protocol for that call: standard discovery, standard task model, standard transport, standard artifacts. HTTP and REST did this for documents. A2A does it for agents as first-class citizens.',
      },
      {
        heading: 'Agent Card and Task: discovery plus the unit of work',
        body: 'Agent Card: a JSON document at /.well-known/agent.json describing the agent, its name, skills, endpoints, supported modalities, and auth requirements. Discovery is reading the card, a single GET request before anything else happens.\n\nTask: the unit of work. Async and stateful, with a lifecycle from submitted to working to completed, failed, or canceled. A client sends a task and then polls GET /tasks/{id} or subscribes to /tasks/{id}/events over SSE. A four-minute remote task and a hung one look identical without a state and an elapsed time to show.',
      },
      {
        heading: 'Artifact and opaque lifecycle: what crosses the boundary',
        body: 'Artifact: the typed result. Text, structured JSON, image, video, audio, all first-class rather than stuffed into a string. A code-review skill can return structured findings as JSON; a video-summarize skill can return an mp4 plus a JSON transcript in the same task.\n\nOpaque lifecycle: A2A does not prescribe how the remote agent solves the task. The client sees state transitions and artifacts; the implementation is free to use any framework internally, LangGraph, CrewAI, or hand-rolled Python. That is deliberate. The boundary is where the abstraction changes from "what tools did it use" to "what task did it accept and what did it return," and the client has no way to ask for more.',
      },
      {
        heading: 'The MCP split, and why you run both',
        body: 'MCP is vertical: agent to tool, JSON-RPC to a tool server, stateless by default. A2A is horizontal: agent to agent, a peer protocol where both sides are agents with their own reasoning.\n\nProduction multi-agent systems run both, and the division is clean. An A2A peer calls MCP tools on its own side of the boundary. You never see its tool calls, and it never sees yours. That is the point: the boundary is where the question changes from "what tools did it use" to "what task did it accept and what did it return".',
      },
      {
        heading: 'Discovery, auth, and adoption',
        body: 'The flow is: fetch the Agent Card, check the skills match, submit a task, then either poll for state or subscribe to SSE at the events endpoint for push updates.\n\nAuth supports three common patterns: bearer token (OAuth2 or opaque), mTLS where both organizations prove identity, and signed requests using HMAC over the payload. Auth is declared in the Agent Card, so clients discover the requirement and comply rather than guessing.\n\nEnterprise adoption drove the scale. By April 2026 the spec sits at a2a-protocol.org with 150 plus backing organizations, and A2A has become the way enterprise agent systems cross trust boundaries. Google Cloud shipped A2A support in Vertex AI Agent Builder, Microsoft Agent Framework supports it, and LangGraph, CrewAI, and AutoGen all ship adapters.',
      },
      {
        heading: 'Sibling specs: ACP, ANP, and NLIP',
        body: 'Three related specs share the neighborhood. ACP (IBM, Linux Foundation) came first and is narrower in scope, now merging its trajectory-metadata idea into A2A rather than competing with it. ANP (Agent Network Protocol) is peer-discovery-heavy and decentralized-first, built on W3C DIDs rather than a hosted Agent Card. NLIP (Ecma\'s Natural Language Interaction Protocol, standardized December 2025) defines a natural-language content type rather than a full task model.\n\nA2A is the most adopted peer protocol as of April 2026; arXiv:2505.02279 (Liu et al., "A Survey of Agent Interoperability Protocols") is the paper that lines all four up side by side. Knowing the neighbors matters less than knowing which one your partner org already speaks, since the choice is rarely yours alone.',
      },
      {
        heading: 'Where it wins and where it is overhead',
        body: 'It wins on cross-organization calls, where without it every pair is a bespoke contract. On heterogeneous frameworks, since a LangGraph agent calling a CrewAI agent calling custom Python normalizes through one protocol. On typed artifacts, where a video or structured JSON result does not need encoding into text. And on long-running tasks, because the opaque lifecycle plus polling makes hours-long work straightforward instead of exotic.\n\nIt is overhead for latency-sensitive micro-calls, since the lifecycle is async and sub-millisecond does not fit; use direct RPC. It is overhead for tightly coupled in-process agents, where an HTTP round-trip is absurd. And it is overhead for small internal-only teams, where the spec formality costs more than the interoperability buys.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p16-12-inline-discovery-flow.svg',
        alt: 'A2A discovery, submit, poll, artifact',
        caption: 'Four steps: read the card, submit a task, poll or subscribe, receive a typed artifact.',
        diagramBrief: 'Sequence diagram, client on left, agent server on right. Four arrows down: 1) GET /.well-known/agent.json, 2) POST /tasks returns task_id and state=submitted, 3) GET /tasks/{id} returns state=working with a percent, 4) GET /tasks/{id} returns state=completed plus an artifact icon (a small labeled box: text / json / video). Style: cream paper, black ink, one accent color on the artifact box.',
      },
      {
        src: '/lessons/p16-12-inline-boundary.svg',
        alt: 'The MCP to A2A boundary',
        caption: 'MCP is vertical inside each agent. A2A is horizontal between agents. Neither side sees the other\'s internals.',
        diagramBrief: 'Two boxes labeled "Agent A" and "Agent B" side by side, connected by a horizontal double-arrow labeled "A2A: task + artifact, opaque lifecycle". Inside each box, a small vertical arrow labeled "MCP: agent to its own tools" pointing down to a row of tool icons. A dashed vertical line between the two boxes representing the org boundary. Style: cream paper, black ink, one accent color on the A2A arrow.',
      },
    ],
    takeaways: [
      'The lifecycle is opaque by design, so across an A2A boundary you render a status and an owner, never a reasoning trace you do not have.',
      'Artifacts are typed, so the renderer switches on artifact type instead of parsing prose out of a text field.',
      'Auth is declared in the Agent Card, which means the client discovers what it needs before the first request rather than failing into it.',
      'Hours-long tasks are the normal case here, so the run must survive a reload by task id, not live in component state.',
    ],
    terms: [
      { term: 'A2A', gloss: '"agent to agent"', meaning: 'The peer protocol for agents to call other agents across systems: cards for discovery, tasks for work, typed artifacts for results.' },
      { term: 'Agent Card', gloss: '"the agent\'s business card"', meaning: 'JSON at /.well-known/agent.json declaring skills, endpoints, modalities, and auth.' },
      { term: 'Task', gloss: '"the unit of work"', meaning: 'An async, stateful object with a lifecycle from submitted to a terminal state, artifacts produced on completion.' },
      { term: 'Artifact', gloss: '"the result"', meaning: 'A typed task result: text, structured JSON, image, audio, or video as a first-class value.' },
      { term: 'Opaque lifecycle', gloss: '"a black box"', meaning: 'The client sees state transitions and results but never how the remote agent solved the task.' },
      { term: 'mTLS', gloss: '"mutual auth"', meaning: 'Mutual TLS where both organizations prove identity to each other before a task is accepted.' },
      { term: 'NLIP', gloss: '"natural-language HTTP"', meaning: 'Ecma\'s Natural Language Interaction Protocol, standardized December 2025, defining a natural-language content type.' },
      { term: 'Discovery', gloss: '"finding the agent"', meaning: 'A single GET on a well-known path that returns the Agent Card, no handshake required.' },
      { term: 'Idempotent task creation', gloss: '"no duplicate work"', meaning: 'A retry of the same task submission should produce one task, not two, under network retries.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A remote task has been in state working for four minutes with no elapsed-time display. Name the one field that would tell a user whether it is stuck.' },
      { level: 'medium', prompt: 'An Agent Card advertises modalities text and structured. Your client needs a video result. Write the one-line error the client should show before submitting the task.' },
      { level: 'medium', prompt: 'Design an Agent Card auth section for a partner integration that needs mTLS. What does the card need to declare so the client never guesses?' },
      { level: 'design', prompt: 'Design the delegation card for an hours-long A2A task: task id, elapsed time, declared skill, auth method, expected artifact type. Which of these five does a user actually need to see first?' },
      { level: 'hard', prompt: 'Two orgs both claim to speak A2A, but one is actually running ACP under the hood. What symptom in the wire format gives it away?' },
    ],
    furtherReading: [
      { label: 'A2A specification', url: 'https://a2a-protocol.org/latest/specification/', why: 'The canonical spec, kept current as the primary reference.' },
      { label: 'Google Developers Blog, A2A announcement', url: 'https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/', why: 'The April 2025 launch post and the original framing of the protocol\'s scope.' },
      { label: 'A2A GitHub repository', url: 'https://github.com/a2aproject/A2A', why: 'Reference implementations and SDKs across languages.' },
      { label: 'Liu et al., A Survey of Agent Interoperability Protocols', url: 'https://arxiv.org/html/2505.02279v1', why: 'The paper comparing MCP, ACP, A2A, and ANP head to head.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'A2A integration checklist',
      body: '- Does the Agent Card declare a protocol version your client checks?\n- Is task creation idempotent against network retries?\n- Are artifact schemas declared and validated by consumers, not assumed?\n- Is auth (bearer, mTLS, signed requests) declared in the card rather than negotiated ad hoc?\n- Is there a dead-letter path for tasks that fail, so recurring failure types are visible over time?',
    },
    demoCaption:
      'What a delegated A2A task actually gives you versus what a local agent run gives you. The remote side owes you a state and an artifact and nothing else, so the component that renders it is a delegation card, not a transcript.',
    demo: {
      archetype: 'reveal',
      subject: 'Delegated task · partner agent',
      opaqueLabel: 'working',
      revealedLines: [
        'taskId: t_9f2c, contextId: c_41a',
        'state: WORKING, elapsed 4m 12s',
        'skill: video-summarize (from the Agent Card)',
        'auth: mTLS, declared in the card',
        'artifact type on completion: video/mp4 plus application/json',
        'internal steps: not exposed, by design',
      ],
      badCaption:
        'A bare status string is all a naive integration surfaces, so a four-minute remote task is indistinguishable from a hung one. The user has no owner, no elapsed time, and no idea what shape the result will take.',
      goodCaption:
        'Everything the protocol does give you is worth rendering: task id, elapsed time, the declared skill, the auth method, and the artifact types to expect. The internal steps stay hidden because the lifecycle is opaque on purpose, so design the card around what crosses the boundary.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'A2A is HTTP for agents. four elements, that is the whole spec surface.',
        body:
          'A2A is HTTP for agents. four elements, that is the whole spec surface.\n\nAgent Card at /.well-known/agent.json: skills, endpoints, modalities, auth.\ntask: async, stateful, submitted -> working -> completed/failed/canceled.\nartifact: typed. text, JSON, image, audio, video, all first-class.\nopaque lifecycle: you see states and results, never the internals.\n\n150+ organizations backing it as of April 2026.',
      },
      {
        kind: 'X · design angle',
        hook: 'across an A2A boundary you cannot show a reasoning trace. so stop trying.',
        body:
          'across an A2A boundary you cannot show a reasoning trace. so stop trying.\n\nthe remote agent does not owe you its steps. that is the opaque lifecycle, and it is deliberate.\n\nwhat you get: a task id, a state, elapsed time, a declared skill, and eventually a typed artifact.\n\nso the surface is a delegation card with a status and an owner, not a transcript. and since these tasks run for hours, it has to survive a reload by task id.',
      },
      {
        kind: 'X · one-liner',
        hook: 'MCP is vertical, A2A is horizontal, and you run both.',
        body:
          'MCP is vertical, A2A is horizontal, and you run both.\n\nMCP: your agent to your tools.\nA2A: your agent to somebody else\'s agent, which calls its own MCP tools on its side.\n\nthe boundary is exactly where the question changes from "what tools did it use" to "what task did it accept".',
      },
    ],
    source: {
      label: 'Full lesson: 12 12-a2a-protocol',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/16-multi-agent-and-swarms/12-a2a-protocol',
    },
  },
  {
    id: 'p16-13-blackboard',
    phase: 'Phase 16 · Multi-Agent and Swarms',
    part: 'Part 2 · Talking, handing off, agreeing',
    index: '16.13',
    title: 'Shared memory: where a hallucination becomes a fact',
    oneLiner:
      'Message pool or blackboard, shared state is the only stateful part of a multi-agent system, so it is where every interesting bug lives. The reference failure is memory poisoning: one agent writes 42 percent when the source said 4.2 percent, and every downstream agent adopts it as verified.',
    readTime: '~10 min read',
    diagram: '/lessons/p16-13.svg',
    diagramCaption:
      'A full message pool where everyone reads everything, beside a topic-subscribed blackboard that routes only relevant writes.',
    whyItMatters:
      'Provenance is a rendering requirement, not a logging nicety. If shared state records who wrote each entry, when, under what prompt, and which source it cited, then a claim in the final answer can carry its origin and a confidence treatment. If it does not, your UI presents a laundered hallucination in the same typography as a verified fact, and the user has no affordance to tell them apart. Poisoning also fails silently: nothing crashes, no test goes red, accuracy just decays, so the surface has to include a flagged state and a retraction path, because "correct" and "corrected" are different states a reader must be able to see.',
    learningObjectives: [
      'Explain why memory poisoning fails silently, no crash and no red test, and what that implies for how you monitor it.',
      'Compare a full message pool to a topic-subscribed blackboard and say which one a 6-agent team versus a 40-agent swarm should use.',
      'Design a provenance record for a shared-state write that a UI could actually render as a source attribution.',
      'State the one rule that keeps a read-only verifier from becoming a second point of poisoning.',
      'Trace the difference between an in-place correction and an append-only supersession, and why only one preserves an audit trail.',
    ],
    sections: [
      {
        heading: 'The problem: shared facts need somewhere to live',
        body: 'Multi-agent systems need a place to share facts. Passing everything in messages reinvents shared state with extra copying. A global log everyone reads grows unbounded and poisons easily. Projecting a per-agent view scales but demands schema work up front.\n\nAnd when one agent hallucinates and writes that hallucination into shared state, every downstream agent that reads it adopts it as fact. By the time a human notices, the reasoning chain is five steps deep and the root cause is the third message ever written. Debugging accuracy decay is harder than debugging a crash, because there is no crash.',
      },
      {
        heading: 'Two topologies, two scaling stories',
        body: 'Full message pool: every agent reads every message. AutoGen GroupChat and MetaGPT work this way. Simple, transparent, inspectable, and it does not scale past roughly 10 agents because each agent\'s context fills with everyone else\'s work.\n\nBlackboard with subscription: agents declare interest in topics and the substrate routes only relevant messages. CA-MCP (arXiv:2601.11595) and the Matrix decentralized framework (arXiv:2511.21686) use this. It scales further and requires upfront schema design to make subscriptions meaningful.\n\nFull pool wins with few agents (under 10), heterogeneous roles, short horizons. Blackboard wins with many agents, homogeneous roles in many instances, long-running conversations. Production often mixes: a small full pool at the planning layer, blackboards below at the worker layer.',
      },
      {
        heading: 'Memory poisoning in five steps',
        body: 'Three agents on a research task. A retrieves, B summarizes, C analyses.\n\nA fetches a page and writes "the study reports a 42 percent accuracy improvement". The page actually said 4.2 percent; A hallucinated a decimal. B reads shared state and writes "large 42 percent accuracy gain reported (source: A)". C reads and writes "recommend adoption, 42 percent lift is transformative". The final report cites a number that never existed.\n\nNo agent crashed. No test failed. The system worked. Without shared state, A\'s hallucination would have stayed in A\'s context and downstream agents might have re-derived and caught it. With naive shared state, A\'s context became everyone\'s context and the hallucination was laundered into fact. This is the second-most-documented failure family in MAST (Cemri et al., arXiv:2503.13657), and it is structural.',
      },
      {
        heading: 'Three mitigations that actually work',
        body: 'Attribute provenance on every write. Every entry records who wrote it, when, under what prompt, and what source the agent cited. Downstream agents read with skepticism keyed to provenance, and your UI gets something to attribute against.\n\nVersion writes and treat them as append-only. A correction is a new entry superseding the old, never an in-place update, so the audit trail survives.\n\nKeep at least one agent that cannot write to shared state. A read-only verifier samples entries, re-fetches sources, and flags inconsistencies. Because it cannot write to the pool, it cannot be poisoned by the pool.',
      },
      {
        heading: 'The unwritable verifier, implementation rules',
        body: 'The read-only verifier is the load-bearing mitigation, and its wiring matters as much as its existence. It reads the pool or the blackboard like anyone else. It has no write handle to shared state, only to a separate verification channel. It independently fetches the sources cited in a write rather than trusting the citation. And its own output routes to a human or to a separate decision agent, never back into the pool it is checking.\n\nSkip that last rule and a poisoned pool poisons the verifier too, whose verifications then poison everything downstream of them. The verifier catching an error is only useful if the error\'s correction cannot itself become a new hallucination laundered through the same channel it was meant to guard.',
      },
      {
        heading: 'Older than LLMs, and the contention patterns to reuse',
        body: 'The blackboard pattern predates LLM agents by four decades. Hayes-Roth (1985, "A Blackboard Architecture for Control") described specialist Knowledge Sources observing a global blackboard, contributing partial solutions, and triggering other sources. The 2026 version is the same pattern with LLM agents as Knowledge Sources and JSON blobs as partial solutions, which means the old literature already solved write contention, opportunistic control, and consistency.\n\nThree contention patterns work today. Sequential writer: all writes go through one coordinator, simple and a bottleneck. Optimistic concurrency with versioning: writers fail on a version mismatch and retry, the classic database technique. Topic partitioning: different agents own different topics, no cross-topic contention, but it requires designed boundaries up front. Most 2026 frameworks default to sequential writer, because LLM calls are slow enough that contention is rare and the bottleneck does not hurt.',
      },
      {
        heading: 'Per-agent projection versus full view',
        body: 'Beyond a topic-scoped blackboard sits per-agent projection: each agent gets a view customized to its own role rather than a shared topic feed. LangGraph state reducers are the canonical 2026 implementation, a reducer function folds global state into a role-specific slice before the agent ever sees it.\n\nProjection scales further than either full pool or plain blackboard, but it needs a schema up front. Skip the schema and every agent rebuilds an ad-hoc version of the same filtering inside its own prompt, which is exactly the kind of implicit logic that made static graphs painful in the first place. The design tradeoff repeats across this whole lesson: more structure up front buys more scale later, and nothing is free.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p16-13-inline-topologies.svg',
        alt: 'Full message pool versus topic-subscribed blackboard',
        caption: 'A full pool scales to about 10 agents. A blackboard routes by topic and scales further, for a schema cost.',
        diagramBrief: 'Two-panel diagram. Left panel "Full pool": three agent icons (A, B, C) with arrows both into and out of a single central box labeled "shared pool, everyone reads everything". Right panel "Blackboard": three agent icons publishing into three separate labeled topic lanes (prices, orders, alerts), each lane routing only to the one or two agents subscribed. Style: cream paper, black ink, one accent color on the blackboard\'s topic lanes.',
      },
      {
        src: '/lessons/p16-13-inline-poisoning.svg',
        alt: 'A hallucinated decimal laundered into fact across five writes',
        caption: 'No agent crashed. No test failed. A 4.2 percent finding became a 42 percent recommendation.',
        diagramBrief: 'Five-step vertical sequence. Step 1: agent A writes "42% improvement" (small red flag icon: source actually said 4.2%). Step 2: agent B writes "large 42% gain (source: A)". Step 3: agent C writes "recommend adoption, 42% is transformative". Step 4: final report box quoting 42%. Step 5, shown as an alternate branch: a verifier icon intercepting after step 1, re-fetching the source, appending a correction entry instead of overwriting. Style: cream paper, black ink, red accent on the bad number, green accent on the verifier\'s correction branch.',
      },
    ],
    takeaways: [
      'Shared state is the only stateful primitive, so provenance on every write is what makes any downstream claim attributable.',
      'Memory poisoning fails silently: no crash, no red test, just decaying accuracy, so the UI needs a flagged state and a retraction path.',
      'Corrections are append-only new entries superseding old ones, never in-place edits, or the audit trail disappears exactly when needed.',
      'The read-only verifier is the load-bearing mitigation, and its output must never re-enter the pool it is checking.',
    ],
    terms: [
      { term: 'Message pool', gloss: '"shared chat history"', meaning: 'Shared state where every agent reads every message; simple and capped around 10 agents.' },
      { term: 'Blackboard', gloss: '"a shared workspace"', meaning: 'Topic-subscribed shared state that routes only relevant writes to interested agents.' },
      { term: 'Memory poisoning', gloss: '"hallucinations spreading"', meaning: 'One agent\'s hallucination entering shared state and being adopted as fact downstream.' },
      { term: 'Provenance', gloss: '"who wrote what"', meaning: 'A per-write record of who wrote it, when, under what prompt, and from which source.' },
      { term: 'Unwritable verifier', gloss: '"an independent auditor"', meaning: 'A read-only agent that re-fetches cited sources and flags inconsistencies without write access to the pool.' },
      { term: 'Per-agent projection', gloss: '"a scoped view"', meaning: 'Folding global state into a role-specific slice, as LangGraph reducers do.' },
      { term: 'Append-only', gloss: '"no overwriting"', meaning: 'Corrections are new entries that supersede the old one; the original is never edited in place.' },
      { term: 'Knowledge Source', gloss: '"a specialist agent"', meaning: 'Hayes-Roth\'s 1985 term for a blackboard participant that contributes partial solutions.' },
      { term: 'Topic partitioning', gloss: '"lane ownership"', meaning: 'Different agents own different topics so writes never contend across topic boundaries.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A shared pool has 14 agents in it and every agent\'s context keeps filling up. Name the topology that fixes this and the cost it adds.' },
      { level: 'medium', prompt: 'An agent writes a claim with no provenance attached. Write the three fields a minimal provenance record needs before that claim can be attributed in a UI.' },
      { level: 'medium', prompt: 'A verifier flags a hallucinated number after two downstream agents already cited it. Design the correction: what gets appended, and what stays visible from the original chain.' },
      { level: 'design', prompt: 'Sketch how a final report renders a claim that was later flagged and corrected. What visually distinguishes "verified" from "corrected" without a legend the user has to learn?' },
      { level: 'hard', prompt: 'A verifier\'s own flag gets written back into the same pool it audits. Explain the failure this creates and the one architectural rule that prevents it.' },
    ],
    furtherReading: [
      { label: 'Cemri et al., Why Do Multi-Agent LLM Systems Fail?', url: 'https://arxiv.org/abs/2503.13657', why: 'The MAST taxonomy; memory poisoning sits in its coordination-failure family.' },
      { label: 'CA-MCP, Context-Aware Multi-Server MCP', url: 'https://arxiv.org/abs/2601.11595', why: 'A production-shaped Shared Context Store built on the blackboard pattern.' },
      { label: 'LangGraph state and reducers', url: 'https://docs.langchain.com/oss/python/langgraph/workflows-agents', why: 'The per-agent projection pattern as it actually ships.' },
      { label: 'Anthropic, How we built our multi-agent research system', url: 'https://www.anthropic.com/engineering/multi-agent-research-system', why: 'Provenance and verification notes from a real production deployment.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Shared-memory provenance checklist',
      body: '- Does every write record writer, timestamp, prompt hash, and cited source?\n- Is the log append-only, with corrections as new entries that reference the superseded one?\n- Is there at least one read-only verifier with independent source access?\n- Does the verifier\'s output route to a human or a separate channel, never back into the pool it checks?\n- Is the ratio of supersession writes to total writes tracked as an early hallucination signal?',
    },
    demoCaption:
      'The 42 percent that never existed, in five writes. Then the same run with provenance on every entry and a read-only verifier that re-fetches the source. The second run does not prevent the bad write, it makes it visible and retractable.',
    demo: {
      archetype: 'sequence',
      subject: 'Research pool · one hallucinated decimal',
      badLabel: 'Naive pool',
      goodLabel: 'Provenance plus verifier',
      badSequence: [
        'A writes: study reports 42 percent improvement',
        'source actually said 4.2 percent',
        'B writes: large 42 percent gain reported (source A)',
        'C writes: recommend adoption, 42 percent is transformative',
        'final report cites a number that never existed',
      ],
      goodSequence: [
        'A writes with writer, timestamp, prompt hash, source URI',
        'read-only verifier samples the entry',
        'verifier re-fetches the source, finds 4.2 percent',
        'entry flagged, correction appended, original preserved',
        'report renders the retraction beside the claim',
      ],
      badCaption:
        'Nothing errors. A hallucinated decimal is laundered into a verified fact by two agents that had no way to doubt it, and the final answer presents it in the same typography as everything else.',
      goodCaption:
        'Provenance gives every claim an origin your UI can attribute and a source a verifier can independently re-fetch. The correction appends rather than overwrites, so "correct" and "corrected" stay visibly different states for the reader.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'agent A hallucinated a decimal. the final report cited 42 percent instead of 4.2.',
        body:
          'agent A hallucinated a decimal. the final report cited 42 percent instead of 4.2.\n\nA wrote it to shared state. B summarized it as "large 42 percent gain (source: A)". C wrote "recommend adoption, transformative".\n\nno crash. no failing test. the system worked.\n\nwithout shared state, A\'s error stays in A\'s context. with naive shared state, it gets laundered into fact.',
      },
      {
        kind: 'X · design angle',
        hook: 'provenance is a rendering requirement, not a logging nicety.',
        body:
          'provenance is a rendering requirement, not a logging nicety.\n\nif every write records who, when, under what prompt, and from which source, a claim can carry its origin and a confidence treatment.\n\nif it does not, your UI shows a laundered hallucination in the same typography as a verified fact, and the reader has no affordance to tell them apart.\n\ncorollary: corrections append, never overwrite. "correct" and "corrected" are different states.',
      },
      {
        kind: 'X · one-liner',
        hook: 'keep one agent that cannot write to shared memory.',
        body:
          'keep one agent that cannot write to shared memory.\n\na read-only verifier re-fetches cited sources and flags inconsistencies. because it cannot write to the pool, the pool cannot poison it.\n\nand route its output to a human, never back into the pool. otherwise a poisoned pool poisons the verifier, which poisons its verifications.',
      },
    ],
    source: {
      label: 'Full lesson: 13 13-shared-memory-blackboard',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/16-multi-agent-and-swarms/13-shared-memory-blackboard',
    },
  },
  {
    id: 'p16-14-consensus-bft',
    phase: 'Phase 16 · Multi-Agent and Swarms',
    part: 'Part 2 · Talking, handing off, agreeing',
    index: '16.14',
    title: 'Consensus and BFT: agreement is not correctness',
    oneLiner:
      'Classical BFT assumes independent faults, honest honest nodes, and a ground truth. LLM agents violate all three: same base model means correlated hallucinations, so a majority can be confidently, unanimously wrong.',
    readTime: '~10 min read',
    diagram: '/lessons/p16-14.svg',
    diagramCaption:
      'Three attack shapes against a vote: a byzantine lie, a sycophantic copy, and a correlated-error monoculture.',
    whyItMatters:
      'A consensus result is a distribution, and rendering it as a single answer throws away the only trust signal you had. The honest schema is the winning answer plus the vote spread plus the aggregator that produced it, because 5 to 0 and 3 to 2 mean completely different things to a reader. Sub-threshold is a first-class state, not an error: below roughly 0.5 to 0.67 for n of 5 to 7 the correct behavior is escalate to a human, which means a review queue and an explicit "no agreement reached" state. And on ambiguous questions the result is an opinion, so label it as one.',
    learningObjectives: [
      'State the three assumptions classical BFT makes and name which one LLM agents violate in each of three attack shapes.',
      'Distinguish a byzantine lie from sycophantic conformity from correlated-error monoculture, and say which one classical PBFT actually handles.',
      'Explain why semantic clustering, not string equality, is the one step in a BFT round with no classical precedent.',
      'Design a vote-result display that shows the spread and the aggregator, not just a winning answer.',
      'Decide the escalation behavior for a sub-threshold consensus round instead of shipping the weak majority.',
    ],
    sections: [
      {
        heading: 'The problem: a false majority',
        body: 'N agents each produce an answer. They disagree. Majority vote picks the wrong one because two agents are correlated, same base model, same training data, same failure modes. A third happens to be wrong in a novel way, so the majority is false.\n\nNow add a deceptive agent that lies on purpose, or a sycophantic one that agrees with whoever spoke last. Classical BFT assumes Byzantine nodes are a fraction f under n over 3 and behave arbitrarily. LLM nodes are stochastic even when honest, correlated across models, and influenced by each other\'s output. You cannot treat them as independent Bernoulli voters.',
      },
      {
        heading: 'What classical BFT gives you, and what it assumes',
        body: 'PBFT (Castro and Liskov, OSDI 1999) tolerates f under n over 3 Byzantine nodes across three phases (pre-prepare, prepare, commit) with two primitives (signed messages, quorum certificates). Agreement on a single value among n at least 3f plus 1 nodes. The guarantees are strong.\n\nThey rest on three assumptions. Independent faults: Byzantines do not coordinate. Honest nodes are truly honest, so correctness of honest output is a non-issue and the protocol only aligns disagreement. And the question has a ground-truth answer, because consensus on a wrong fact is still consensus.\n\nLLM agents violate all three. Two agents on the same base model share faults. An honest LLM still hallucinates. On ambiguous questions the truth is whatever the agents decide, with no external oracle.',
      },
      {
        heading: 'Three attacks, only one of which classical BFT handles',
        body: 'Byzantine lie: one agent outputs a deliberately wrong answer. Classical BFT handles this cleanly if f is under n over 3.\n\nSycophantic conformity: one agent reads others before voting and aligns with whoever spoke last. Not malicious, but it correlates with the loudest voice. BFT does not prevent it because the agent passes every signature check.\n\nCorrelated-error monoculture: three agents share a base model and hallucinate the same wrong answer. The majority is wrong and BFT does not help, because all three honestly agree. This is the failure mode that makes model diversity an architectural requirement rather than a nice-to-have.',
      },
      {
        heading: 'CP-WBFT and DecentLLMs: confidence and geometric medians',
        body: 'CP-WBFT (arXiv:2511.10400), Confidence-Probed Weighted BFT, has each voter attach a confidence probe, either a self-reported probability or a separate calibration model\'s prediction, and vote weights scale with that confidence. Reported plus 85.71 percent BFT improvement on complete graphs. It mitigates sycophancy specifically, because an agent that conformed to someone else\'s position tends to report low confidence in it.\n\nDecentLLMs (arXiv:2507.14928) drops the leader entirely. Worker agents propose in parallel, evaluator agents score the proposals, and the final answer is the geometric median of scored positions, robust when f is under n over 2. A geometric median is robust to outliers and pulls toward the dense cluster rather than the model-biased average, which is exactly what catches both byzantine lies and correlated errors.',
      },
      {
        heading: 'WBFT: Core and Edge',
        body: 'WBFT (arXiv:2505.05103) combines weighted voting with Hierarchical Structure Clustering. Weights come from response quality plus a trust score learned from history, and agents split into Core and Edge: Core must reach consensus first, Edge follows Core\'s lead.\n\nThat split buys two things. Scalability, because Core consensus runs over a small group and stays fast even as Edge grows to dozens of agents. And a partial answer to monoculture, since Core can be deliberately chosen for model diversity even if Edge is not. None of the three 2025-2026 responses solves every attack: CP-WBFT targets sycophancy, DecentLLMs targets byzantine lies and correlated errors, WBFT targets scale and partial monoculture. Picking one means picking which attack you are betting against.',
      },
      {
        heading: 'A minimal BFT round, stripped down',
        body: 'Stripped to its core, a BFT round for LLM agents runs six steps. Each agent produces an answer and attaches a confidence probe between 0 and 1. An aggregator collects every answer-confidence pair and groups them by semantic cluster, not string equality, since "the study reports 4.2 percent" and "4.2 percent improvement" are the same claim in different words. It sums confidence within each cluster, and the cluster with the highest weight wins if that weight clears a threshold; otherwise the round escalates rather than forcing a decision. Minority clusters get logged with their provenance rather than discarded, because a minority cluster today is the early-warning signal for a correlated failure tomorrow. Semantic clustering is the one step with no classical-BFT equivalent, and skipping it is the most common implementation mistake.',
      },
      {
        heading: 'The uncomfortable empirical result, and where consensus does not help',
        body: '"Can AI Agents Agree?" (arXiv:2603.01213) measures scalar agreement across frontier models. With no adversaries at all, LLM agents disagree on scalar questions at rates above 30 percent on many benchmarks. A single agent adopting a deceptive persona can pull Mixture-of-Agents consensus 40 plus percentage points off the honest baseline. Disagreement rates also correlate with model diversity: heterogeneous ensembles disagree more, which is good because errors are uncorrelated, and drift more slowly toward agreement, which is bad because time-to-agreement grows.\n\nConsensus does not help everywhere. On ambiguous questions the result is an opinion, so label it as one. On compound questions, vote each part separately rather than one blended score. Across many adversarial rounds, agents that observe prior rounds start agreeing regardless of truth, so bound rounds to two or three. BFT gives you machinery to align outputs. It does not tell you whether the aligned output is right.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p16-14-inline-attacks.svg',
        alt: 'Three attack shapes against a vote',
        caption: 'A byzantine lie, a sycophantic copy, and a correlated-error monoculture look identical in a plain vote count.',
        diagramBrief: 'Three small panels side by side, each showing 5 agent icons voting. Panel 1 "Byzantine lie": 4 icons green (correct), 1 icon red with a small mask icon (lying). Panel 2 "Sycophantic conformity": first icon green, next 3 icons shown copying with a dotted arrow chain from icon 1 to icons 2-4, one icon independent. Panel 3 "Correlated-error monoculture": 3 icons sharing one small "model A" tag, all wrong the same way, 2 icons independent and correct. Style: cream paper, black ink, red accent on the wrong votes in each panel.',
      },
      {
        src: '/lessons/p16-14-inline-vote-spread.svg',
        alt: 'A vote result rendered as a distribution, not a single answer',
        caption: '5-0 and 3-2 are different claims. Collapsing them into one string destroys the only trust signal you had.',
        diagramBrief: 'A horizontal bar split into segments showing vote weight per cluster (for example 60 percent one answer, 40 percent another), labeled with the aggregator name below (CP-WBFT or DecentLLMs) and a small threshold marker line at 0.5 to 0.67. Below it, a second bar showing a below-threshold case routed to an "escalate to human review" icon instead of a winner. Style: cream paper, black ink, one accent color marking the threshold line.',
      },
    ],
    takeaways: [
      'Correlated-error monoculture beats majority vote, so model diversity is an architectural requirement, not a procurement preference.',
      'Render the vote spread alongside the answer. 5 to 0 and 3 to 2 are different claims and collapsing them destroys the trust signal.',
      'Sub-threshold is a first-class state: below roughly 0.5 to 0.67 for n of 5 to 7, escalate to a human review queue rather than shipping a weak majority.',
      'Semantic clustering before counting, because "4.2 percent improvement" and "the study reports 4.2 percent" are the same vote.',
    ],
    terms: [
      { term: 'PBFT', gloss: '"the classic protocol"', meaning: 'Castro and Liskov (1999), tolerating fewer than n over 3 Byzantine nodes across three message phases.' },
      { term: 'Byzantine lie', gloss: '"a deliberate lie"', meaning: 'One agent outputting a deliberately wrong answer; classical BFT handles this cleanly if f is under n over 3.' },
      { term: 'Sycophantic conformity', gloss: '"agreeing with the loud voice"', meaning: 'An agent aligning with whoever spoke last rather than reasoning independently, invisible to signature checks.' },
      { term: 'Correlated-error monoculture', gloss: '"same model, same mistake"', meaning: 'Agents on the same base model sharing a hallucination, producing a wrong unanimous majority.' },
      { term: 'CP-WBFT', gloss: '"confidence-weighted voting"', meaning: 'Confidence-probed weighted BFT, scaling each vote by a self-reported or calibrated confidence.' },
      { term: 'DecentLLMs', gloss: '"leaderless consensus"', meaning: 'Parallel proposals scored by evaluator agents, aggregated by geometric median.' },
      { term: 'Geometric median', gloss: '"a robust average"', meaning: 'The point minimizing total distance to all sample points; resists outliers in a way a mean does not.' },
      { term: 'Core/Edge', gloss: '"tiered voting"', meaning: 'WBFT\'s split where a small Core reaches consensus first and a larger Edge group follows.' },
      { term: 'Semantic clustering', gloss: '"same answer, different words"', meaning: 'Grouping votes by meaning, via embeddings or canonicalization, rather than by exact string match.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Five agents vote and three share one base model, all wrong the same way. Compute the plurality result and say why it is wrong despite a clean majority.' },
      { level: 'medium', prompt: 'Two answers, "4.2 percent improvement" and "the study reports 4.2 percent," are counted as different votes by a naive aggregator. Fix the counting logic in one sentence.' },
      { level: 'medium', prompt: 'A consensus round lands at weight 0.55 against a threshold of 0.6. Write the one-line product copy for the state the user sees instead of a winning answer.' },
      { level: 'design', prompt: 'Design the vote-result card for a consensus decision: which three pieces of information does a reader need to trust a 3-2 result more than a bare answer?' },
      { level: 'hard', prompt: 'An ensemble is diversified to reduce monoculture risk, and it now takes twice as many rounds to reach threshold. Decide whether that tradeoff is worth it and justify the call.' },
    ],
    furtherReading: [
      { label: 'Castro and Liskov, Practical Byzantine Fault Tolerance (OSDI 1999)', url: 'https://pmg.csail.mit.edu/papers/osdi99.pdf', why: 'The foundation every LLM-specific consensus scheme still builds on.' },
      { label: 'CP-WBFT, Confidence-Probed Weighted BFT', url: 'https://arxiv.org/abs/2511.10400', why: 'The vote-weighting scheme that targets sycophantic conformity specifically.' },
      { label: 'DecentLLMs', url: 'https://arxiv.org/abs/2507.14928', why: 'Leaderless consensus via geometric-median aggregation over scored proposals.' },
      { label: 'WBFT, Weighted BFT with Hierarchical Structure Clustering', url: 'https://arxiv.org/abs/2505.05103', why: 'The Core/Edge split that trades some monoculture resistance for scale.' },
      { label: 'Can AI Agents Agree?', url: 'https://arxiv.org/abs/2603.01213', why: 'The empirical measurement of scalar-agreement fragility and the deceptive-persona attack.' },
    ],
    shipIt: {
      kind: 'rubric',
      name: 'Consensus result rubric',
      body: '- Does the UI show the winning answer plus the vote spread plus which aggregator produced it?\n- Is sub-threshold treated as a first-class state (escalate to human review), not silently rounded up?\n- Are minority clusters logged with provenance, not discarded?\n- Is semantic clustering in place before counting, not string equality?\n- Are rounds bounded (2-3) to avoid rewarding sycophancy in multi-round settings?\n- Is the ensemble diversified across base models, not just prompted differently?',
    },
    demoCaption:
      'Five voters, three of them on the same base model, all wrong the same way. Plurality returns the wrong answer with a clean 3 to 2. The geometric median pulls toward the honest cluster because it is robust to the correlated block.',
    demo: {
      archetype: 'meter',
      subject: 'Monoculture attack · n=5',
      headline: 'consensus reached, 3 of 5 agree',
      breakdown: [
        { label: 'wrong answer, model A instance 1', value: 20 },
        { label: 'wrong answer, model A instance 2', value: 20 },
        { label: 'wrong answer, model A instance 3', value: 20 },
        { label: 'correct answer, model B', value: 20 },
        { label: 'correct answer, model C', value: 20 },
      ],
      badCaption:
        'A clean 3 to 2 reads as settled, and it is three copies of one model sharing one hallucination against two independent agents that got it right. Plurality cannot see the correlation because every vote passes every check.',
      goodCaption:
        'Showing the spread and the model behind each vote is what makes the false majority visible. Confidence weighting catches the sycophant, and a geometric median over scored proposals pulls toward the dense honest cluster instead of the model-biased average.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'classical BFT assumes independent faults. LLM agents share training data.',
        body:
          'classical BFT assumes independent faults. LLM agents share training data.\n\nPBFT tolerates f < n/3 arbitrary nodes. it does not handle three agents on the same base model hallucinating the same wrong answer, because all three honestly agree.\n\nthat is correlated-error monoculture, and it beats majority vote every time.\n\nmodel diversity is not procurement. it is the mitigation.',
      },
      {
        kind: 'X · design angle',
        hook: 'a consensus result is a distribution. shipping one string throws away the trust signal.',
        body:
          'a consensus result is a distribution. shipping one string throws away the trust signal.\n\n5-0 and 3-2 mean completely different things to a reader. so the schema is: answer + vote spread + which aggregator produced it.\n\nand sub-threshold is a state, not an error. below roughly 0.5-0.67 at n=5-7, the correct behavior is escalate, which means a review queue and an explicit "no agreement reached".',
      },
      {
        kind: 'X · one-liner',
        hook: 'with zero adversaries, LLM agents disagree on scalar questions over 30 percent of the time.',
        body:
          'with zero adversaries, LLM agents disagree on scalar questions over 30 percent of the time.\n\nadd one agent with a deceptive persona and Mixture-of-Agents consensus moves 40+ points off the honest baseline. (arXiv:2603.01213)\n\nBFT aligns outputs. it does not tell you the aligned output is right.',
      },
    ],
    source: {
      label: 'Full lesson: 14 14-consensus-and-bft',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/16-multi-agent-and-swarms/14-consensus-and-bft',
    },
  },
];
