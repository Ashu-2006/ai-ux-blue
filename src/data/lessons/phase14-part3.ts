import type { Lesson } from '@/lib/lessons';

// Phase 14 · Part 3 · Patterns and runtimes (lessons 14.12-14.18)
export const phase14Part3: Lesson[] = [
  {
    id: 'p14-12-workflow-patterns',
    phase: 'Phase 14 · Agent Engineering',
    part: 'Part 3 · Patterns and runtimes',
    index: '14.12',
    title: 'Workflows vs agents: the five patterns that cover most of it',
    oneLiner:
      'Anthropic split agentic systems in two: workflows, where the engineer owns the graph, and agents, where the model owns it. Five workflow patterns cover most production work, and each one renders as a different UI.',
    readTime: '~8 min read',
    diagram: '/lessons/p14-12.svg',
    diagramCaption:
      'The five workflow patterns on top of the augmented LLM: prompt chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer.',
    whyItMatters:
      'Who owns the graph decides what your UI can promise. A workflow has a known step count, so you can render a real progress indicator, name the current step, and quote a price before the run starts. An agent has an unknown step count, so the same component has to become an open-ended activity log with a stop control and a spend meter. Picking the pattern is therefore a component decision, not just a backend one. Routing needs a confidence state and an escalate affordance. Parallelization needs N independent result slots that fill out of order. Evaluator-optimizer needs a revision counter the user can watch and interrupt.',
    sections: [
      {
        heading: 'The distinction: who owns the graph',
        body: 'Anthropic\'s December 2024 post drew a line that stuck. A workflow is LLMs and tools orchestrated through predefined code paths: the engineer owns the graph, the model fills in the blanks. An agent is a model dynamically directing its own tools and deciding its own next step: the model owns the graph.\n\nBoth are legitimate. Workflows are cheaper, faster, and debuggable because the shape is in your source control. Agents unlock open-ended problems, and pay for it in failure modes you cannot enumerate in advance. The post\'s core argument is that teams reach for multi-agent frameworks when a single function call was the right answer, and the frameworks then hide the prompts and the control flow.',
      },
      {
        heading: 'The atomic unit: the augmented LLM',
        body: 'Every pattern is built from one primitive: an LLM with three capabilities wired in. Search (retrieval), tools (actions), and memory (persistence). Any single API call can carry all three, which is why "just call the API" is a real architecture and not a beginner move.\n\nThe practical consequence is that you should be able to describe your feature as one augmented call before you describe it as a graph. If you cannot, the extra structure is doing work. If you can, the extra structure is a tax you are paying for nothing.',
      },
      {
        heading: 'The five patterns',
        body: 'Prompt chaining: the output of call 1 is the input to call 2, with optional programmatic gates between steps. Use it when the task decomposes cleanly and linearly.\n\nRouting: a classifier LLM picks which downstream chain or model handles the input. Use it when categorically different inputs need different handling (refund vs bug vs sales).\n\nParallelization: N calls run concurrently, then aggregate. Two shapes, sectioning (different chunks) and voting (same prompt N times, take the majority).\n\nOrchestrator-workers: an orchestrator LLM decides which specialist workers to run and synthesizes the results. Agent-shaped, but it does not loop forever.\n\nEvaluator-optimizer: one model proposes, another judges, iterate until the judge passes. Self-Refine, generalized.',
      },
      {
        heading: 'When to pick which',
        body: 'Workflows win on three axes. Predictable tasks: if you can enumerate the steps, enumerate them. Cost-bound tasks: a workflow has a bounded step count, an agent can spiral. Compliance-bound tasks: auditors want to read the graph, not infer it from trajectories.\n\nAgents win on the mirror image. Open-ended research, where the next step depends on what the last step returned. Variable-length work, where the step count is genuinely unknown. Novel domains, where you do not yet know the right workflow and exploration comes before codification.\n\nEach pattern in the source is 10 to 15 lines of code against a scripted LLM. The framework alternative is measured in thousands.',
      },
      {
        heading: 'What this means for the surface you build',
        body: 'The step count is the difference between a determinate progress bar and an indeterminate one, and users read those two components very differently. A workflow lets you show "step 3 of 5, drafting" and a real estimate. An agent gives you a scrolling trace, a cancel button, and a token or dollar meter, because you cannot promise an end.\n\nRouting is the pattern that most needs a confidence threshold in the design, not just the backend: below the threshold, escalate to a human, and the escalation path is a component with its own empty and pending states. Parallelization needs slots that fill out of order without the layout jumping.',
      },
    ],
    takeaways: [
      'Workflow means the engineer owns the graph and the step count is known. Agent means the model owns it and the step count is not. That difference is a determinate vs indeterminate progress component.',
      'Start with one augmented LLM call (search + tools + memory). Add a pattern only when a specific behaviour needs it, because frameworks hide prompts and control flow.',
      'The five patterns are prompt chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer. Each is roughly a dozen lines, not a dependency.',
      'Routing without a confidence threshold and a human-escalation path is a classifier presented as a verdict. Design the below-threshold state first.',
    ],
    terms: [
      { term: 'Workflow', meaning: 'LLM and tool calls arranged through predefined code paths that the engineer owns.' },
      { term: 'Agent', meaning: 'A system where the model dynamically chooses its own tools and next steps.' },
      { term: 'Augmented LLM', meaning: 'One model call wired to search, tools, and memory: the atomic unit of every pattern.' },
      { term: 'Prompt chaining', meaning: 'Sequential calls where each output becomes the next input, with optional gates between.' },
      { term: 'Orchestrator-workers', meaning: 'An orchestrator model picks specialist workers dynamically and synthesizes their output.' },
      { term: 'Evaluator-optimizer', meaning: 'A proposer and a judge iterating until the judge passes; Self-Refine generalized.' },
    ],
    demoCaption:
      'Flip between the workflow framing and the agent framing of the same feature. Watch what the progress component is allowed to promise in each. Step count is the property your UI inherits.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Support request handler',
      badLabel: 'Agent for everything',
      goodLabel: 'Workflow where steps are known',
      badCaption:
        'Model owns the graph, so the step count is unknown. The progress bar is a lie, the estimate is a guess, and the only honest controls are a stop button and a spend meter. Cost per run has no ceiling.',
      goodCaption:
        'Engineer owns the graph. Five steps, named, bounded. The UI can say "step 3 of 5, checking the refund policy", quote a price before the run, and an auditor can read the graph instead of reconstructing it from traces.',
      badLines: [
        'Working on it...',
        'Progress: unknown (spinner)',
        'Steps taken: 14 and counting',
        'Cost so far: $0.83, no ceiling',
        'Controls: stop',
      ],
      goodLines: [
        'Step 3 of 5: check refund policy',
        'Progress: 60% (determinate)',
        'Route: refund (confidence 0.91)',
        'Est. cost: $0.04, bounded',
        'Controls: skip, edit, approve',
      ],
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'workflow vs agent is one question: who owns the graph.',
        body:
          'workflow vs agent is one question: who owns the graph.\n\nworkflow = the engineer owns it. predefined paths, bounded steps, readable in source control.\nagent = the model owns it. dynamic tools, unknown step count.\n\nfive workflow patterns cover most production work: chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer. each is 10-15 lines.',
      },
      {
        kind: 'X · design angle',
        hook: 'the step count decides which progress component you are allowed to ship.',
        body:
          'the step count decides which progress component you are allowed to ship.\n\nknown steps: "step 3 of 5, drafting" plus a real estimate and a price quoted upfront.\nunknown steps: a scrolling trace, a stop button, a spend meter.\n\nputting a determinate bar on an agent run is a design lying about the architecture.',
      },
      {
        kind: 'X · one-liner',
        hook: 'most "multi-agent systems" are one API call wearing a framework.',
        body:
          'most "multi-agent systems" are one API call wearing a framework.\n\nsearch + tools + memory on a single LLM call is a real architecture. anthropic wrote the pushback in dec 2024 and it is still the most-cited advice in the space.\n\nadd complexity when it earns its cost, not before.',
      },
    ],
    source: {
      label: 'Full lesson: 14.12 12-anthropic-workflow-patterns',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/14-agent-engineering/12-anthropic-workflow-patterns',
    },
  },
  {
    id: 'p14-13-langgraph',
    phase: 'Phase 14 · Agent Engineering',
    part: 'Part 3 · Patterns and runtimes',
    index: '14.13',
    title: 'LangGraph: the agent as a checkpointed state machine',
    oneLiner:
      'Nodes are functions, edges are transitions, and state is serialized after every node. When a 40-step run dies at step 38, you resume at 38 instead of paying for the first 37 again.',
    readTime: '~8 min read',
    diagram: '/lessons/p14-13.svg',
    diagramCaption:
      'A state graph: typed state flowing through nodes, conditional edges branching, and the checkpointer writing after every node so resume is a load call.',
    whyItMatters:
      'Checkpoint-after-every-node is what makes "resume" a real product feature instead of a retry button that starts over. It gives you three surfaces you cannot build otherwise. A run detail view that renders the exact state object, because it is already serialized. A human-in-the-loop gate where the pause is a durable state, so a user can approve on their phone an hour later and the run continues. And per-node streaming deltas, which means your activity log can name the current node rather than showing an undifferentiated spinner. If the checkpoint only captures conversation turns, all three of those break the moment a tool wrote something.',
    sections: [
      {
        heading: 'The problem: fresh-run assumptions',
        body: 'Agents and workflows share one operational failure. A 40-step run dies at step 38, and the library assumes every run starts fresh, so the operator hacks retries around the outside and the user pays for the first 37 steps twice.\n\nLangGraph\'s design answer is to make state a first-class typed object rather than an implicit accumulation of messages. Mutations are explicit, and the runtime writes a checkpoint after every node. Resume becomes a load call against a session id, not a re-run.',
      },
      {
        heading: 'The model: typed state, function nodes, conditional edges',
        body: 'A graph is four things. A state type, a typed dict or Pydantic model every node reads and mutates. Nodes, which are pure functions from state to a state update, merged back after return. Edges, direct or conditional, chosen by a function of state. And START and END sentinels marking the boundary.\n\nA routing workflow becomes a graph with classify, refund, bug, sales, and done nodes. The reducer is the piece people skip: it is the function that decides how a node\'s update merges into current state, which matters enormously once two nodes run in parallel.',
      },
      {
        heading: 'The four capabilities the docs lead with',
        body: 'Durable execution: the runtime serializes state to a checkpointer (SQLite, Postgres, Redis, or your own) after each node, so a crash resumes at N+1 with exact state. The named production users are Klarna, Uber, and J.P. Morgan, and the claim is not about graph shape, it is that graph plus checkpointing makes recovery cheap.\n\nStreaming: every node can yield partial output, and the graph emits per-node delta events so the UI updates as the run proceeds. Human-in-the-loop: pause before a critical node, surface state, accept edits, resume. Memory: short-term inside the run, long-term across runs via the checkpointer plus a separate store.',
      },
      {
        heading: 'Three topologies',
        body: 'Supervisor: a central router model dispatches to specialist subagents. There is a create_supervisor helper, though the LangChain team\'s 2026 guidance is to do this through tool calls directly for tighter context control.\n\nSwarm, or peer-to-peer: agents hand off to each other through a shared tool surface with no central router. Hierarchical: supervisors managing sub-supervisors, implemented as nested subgraphs, where a whole graph is used as a single node inside another graph.\n\nThe topology you pick is also an attribution problem. If the UI is going to say which agent did what, the graph has to carry that label into the stream.',
      },
      {
        heading: 'Where it goes wrong',
        body: 'Checkpoints too small: serializing only conversation turns leaves tool state and memory writes unrecoverable, so the resume produces a run that silently disagrees with reality. Full state must serialize.\n\nNon-deterministic nodes: resume assumes the same inputs produce the same state update, so random seeds, wall-clock reads, and external API responses have to be captured in state rather than re-derived.\n\nOver-conditional graphs: when every edge is conditional you have a state machine nobody can reason about, including you at 3 AM. Prefer linear chains with occasional branches.',
      },
    ],
    takeaways: [
      'Checkpoint after every node is what turns "retry" into "resume". Ship it and a 40-step failure costs one step, not forty.',
      'Because state is already serialized, a human-approval pause can be durable: the user approves an hour later on a different device and the run continues from the gate.',
      'Per-node streaming lets the activity log name the current node. That is the difference between "working..." and "checking the refund policy".',
      'If the checkpoint captures only messages and not tool state, resume produces a run that quietly disagrees with the world. Serialize the whole state object.',
    ],
    terms: [
      { term: 'State graph', meaning: 'Typed state plus nodes plus edges plus reducers, executed as a machine.' },
      { term: 'Checkpointer', meaning: 'The backend that serializes state after every node and enables resume by session id.' },
      { term: 'Reducer', meaning: 'The function that merges a node\'s update into current state, especially under parallel edges.' },
      { term: 'Conditional edge', meaning: 'A transition chosen by evaluating a function of the current state.' },
      { term: 'Subgraph', meaning: 'An entire graph used as a single node inside another graph, giving hierarchy.' },
      { term: 'Durable execution', meaning: 'Restarting at the last successful node with exact state instead of from the beginning.' },
    ],
    demoCaption:
      'Kill the run at step 38 with and without checkpoints. The sequence shows what gets replayed, what gets paid for twice, and where the human-approval gate can honestly live.',
    demo: {
      archetype: 'sequence',
      subject: 'A 40-step run that fails at step 38',
      badLabel: 'No checkpoints',
      goodLabel: 'Checkpoint after every node',
      badCaption:
        'Failure at 38 means the runtime has nothing to load, so it starts at step 1. The user pays 37 steps of tokens and latency again, tool side effects repeat, and an approval gate cannot survive a page refresh.',
      goodCaption:
        'State is serialized after every node, so resume(session_id) picks up at 38 with exact state. The same mechanism makes the approval gate durable: the user can approve an hour later from another device and the run continues.',
      badSequence: [
        'Steps 1-37 run, state held in memory',
        'Step 38 throws, process dies',
        'Nothing persisted, session lost',
        'Retry restarts at step 1',
        'Tool side effects fire twice',
      ],
      goodSequence: [
        'Each node returns, state serialized',
        'Step 38 throws, checkpoint 37 intact',
        'UI renders the stored state object',
        'Human edits state at the gate',
        'resume(session_id) continues at 38',
      ],
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'a 40-step agent run that dies at step 38 should cost you one step, not forty.',
        body:
          'a 40-step agent run that dies at step 38 should cost you one step, not forty.\n\nlanggraph\'s model: nodes are functions, edges are transitions, and the runtime serializes typed state to a checkpointer after every single node.\n\nresume is load_state(session_id). klarna, uber and j.p. morgan run on that property, not on the graph shape.',
      },
      {
        kind: 'X · design angle',
        hook: 'durable state is what makes a human-approval gate a real feature instead of a modal you cannot leave.',
        body:
          'durable state is what makes a human-approval gate a real feature instead of a modal you cannot leave.\n\nif the pause is only in memory, the user has to sit there. if the pause is a checkpoint, they approve an hour later from their phone and the run picks up at the same node.\n\nsame reason the activity log can say "checking refund policy" instead of "working...". per-node streaming gives you the label.',
      },
      {
        kind: 'X · one-liner',
        hook: 'checkpointing conversation turns is not checkpointing.',
        body:
          'checkpointing conversation turns is not checkpointing.\n\nif tool writes and memory updates are not in the serialized state, your resume produces a run that quietly disagrees with the world. it looks like it worked. it did not.\n\nserialize the whole state object or admit you only have retry.',
      },
    ],
    source: {
      label: 'Full lesson: 14.13 13-langgraph-stateful-graphs',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/14-agent-engineering/13-langgraph-stateful-graphs',
    },
  },
  {
    id: 'p14-14-autogen',
    phase: 'Phase 14 · Agent Engineering',
    part: 'Part 3 · Patterns and runtimes',
    index: '14.14',
    title: 'The actor model: private inboxes and failures that stay local',
    oneLiner:
      'Give every agent a private inbox and make messages the only way they interact. One agent crashing stops being a stack trace that takes down the run, and concurrency stops being something you bolt on.',
    readTime: '~8 min read',
    diagram: '/lessons/p14-14.svg',
    diagramCaption:
      'Actors with private state and inboxes, a runtime routing typed messages between them, and one handler failing without touching its neighbours.',
    whyItMatters:
      'Fault isolation is a UI taxonomy, not just a runtime property. In a synchronous stack, one agent failing gives you exactly one error state: the run is dead, show a toast. Under the actor model the runtime catches the failure inside that actor\'s handler, so your interface has to render a partial team: three agents done, one in a dead-letter state with a retry affordance, the rest still working. That is a per-actor status list with independent states, not a global spinner. It also means results arrive out of order, so your layout needs stable slots rather than an append-only feed.',
    sections: [
      {
        heading: 'The problem: synchronous stacks propagate everything',
        body: 'Most agent frameworks are synchronous. One agent produces, one consumes, both inside a call stack. When something raises, the failure travels up the stack and kills the run. Concurrency gets bolted on afterwards, and distributing the system means rewriting it.\n\nAutoGen v0.4 (Microsoft Research, January 2025) rebuilt orchestration around the actor model to break exactly this. Each agent is an actor with a private inbox, messages are the only interaction, and the runtime decouples delivery from handling.',
      },
      {
        heading: 'What an actor is',
        body: 'An actor has private state that nothing outside touches, an inbox that queues incoming messages, and a handler of the shape receive(message) returning effects. The permitted effects are small: reply, send to another actor, spawn a new actor, update state, stop self.\n\nTwo actors cannot share memory. They can only send messages. That constraint is the whole design, and everything useful falls out of it: no shared mutable state means no lock contention, no partially-observed writes, and no ambiguity about who owns a fact.',
      },
      {
        heading: 'Why decoupling delivery from handling matters',
        body: 'In the older v0.2 model, agent_a.chat(agent_b) blocks agent_a until agent_b returns. In v0.4, send(agent_b, msg) drops the message in agent_b\'s inbox and returns immediately. Three consequences follow.\n\nFault isolation: agent B crashing does not crash agent A. The runtime catches the failure inside B\'s handler and decides what to do (log, retry, dead-letter). Natural concurrency: many messages are in flight at once and actors work their inboxes concurrently. Distribution-ready: inbox plus transport is the same abstraction whether the actor is in-process or on another host.',
      },
      {
        heading: 'Team shapes and observability',
        body: 'The three API layers are Core (the low-level actor framework: AgentRuntime, Agent, Message, Topic), AgentChat (task-driven high-level API with AssistantAgent, UserProxyAgent, and group chats), and Extensions (provider and tool integrations).\n\nTeam topologies: RoundRobinGroupChat rotates turns in a fixed order, SelectorGroupChat has a selector agent pick who goes next based on conversation state, and Magentic-One is the reference squad for web browsing, code execution, and file handling.\n\nOpenTelemetry is built in. Every message emits a span and tool calls carry gen_ai.* attributes per the 2026 OTel GenAI conventions, which is where the per-agent attribution in your UI should come from.',
      },
      {
        heading: 'Status in 2026',
        body: 'AutoGen v0.7.x is stable and fine for research and prototyping, but Microsoft moved active development to the Microsoft Agent Framework, the production successor (public preview 1 October 2025, with 1.0 GA targeted for the end of Q1 2026).\n\nThe framework is in maintenance mode, and that is the right reason to learn the model rather than the API. The actor model is the durable idea and it ports forward cleanly, the same way it ported forward from Erlang. Learn inbox, handler, fault isolation, and dead-letter, and the specific package name matters much less.',
      },
    ],
    takeaways: [
      'Messages are the only interaction and no two actors share memory. Every guarantee in the model comes from that one constraint.',
      'Fault isolation means your UI needs a per-agent status list, not one global error state: three done, one dead-lettered with retry, two still running.',
      'Async delivery means results arrive out of order. Design stable slots, not an append-only feed that reshuffles under the user.',
      'AutoGen is in maintenance mode with Microsoft Agent Framework as the successor. Learn the actor model, not the import path.',
    ],
    terms: [
      { term: 'Actor', meaning: 'An agent with private state, an inbox, and a handler; no shared memory with anyone.' },
      { term: 'Inbox', meaning: 'The per-actor queue of pending messages the runtime delivers into.' },
      { term: 'Runtime', meaning: 'The event loop that routes messages between actors and isolates handler failures.' },
      { term: 'Topic', meaning: 'A named publish-subscribe route so actors can broadcast rather than address one peer.' },
      { term: 'Dead-letter queue', meaning: 'Where a message goes when its handler raises, so a human can inspect it later.' },
      { term: 'SelectorGroupChat', meaning: 'A team shape where a selector agent picks who acts next based on conversation state.' },
    ],
    demoCaption:
      'The same four-agent review with a synchronous stack and with actor inboxes. One agent fails in both. Compare what the interface can still show the user afterwards.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Four-agent code review, one agent fails',
      badLabel: 'Synchronous stack',
      goodLabel: 'Actors with inboxes',
      badCaption:
        'The exception travels up the call stack and kills the run. Completed work from the other three agents is lost with it, so the only honest UI is one error state and a start-over button.',
      goodCaption:
        'The runtime catches the failure inside that actor\'s handler. Three results survive, one message lands in the dead-letter queue, and the interface renders a per-agent status list with a retry scoped to the one that broke.',
      badLines: [
        'Reviewer: raised TimeoutError',
        'Run status: failed',
        'Linter result: lost',
        'Security result: lost',
        'UI: one toast, start over',
      ],
      goodLines: [
        'Reviewer: dead-letter, retry available',
        'Linter: complete',
        'Security: complete',
        'Checklist: still running',
        'UI: four rows, four states',
      ],
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'the actor model is one rule: agents never share memory, they only send messages.',
        body:
          'the actor model is one rule: agents never share memory, they only send messages.\n\nevery agent gets private state, an inbox, and a handler. send() drops a message in the inbox and returns instead of blocking.\n\nfault isolation, native concurrency and distribution all fall out of that single constraint. autogen v0.4 rebuilt on it in jan 2025.',
      },
      {
        kind: 'X · design angle',
        hook: 'fault isolation is a UI taxonomy, not a backend detail.',
        body:
          'fault isolation is a UI taxonomy, not a backend detail.\n\nsynchronous stack: one agent throws, run is dead, one error state, start over.\nactor runtime: three agents finished, one is dead-lettered, one still running.\n\nthat second world needs a per-agent status list with independent states and a retry scoped to the one row that broke. and results land out of order, so use stable slots, not an append-only feed.',
      },
      {
        kind: 'X · one-liner',
        hook: 'autogen is in maintenance mode. learn the model, not the import path.',
        body:
          'autogen is in maintenance mode. learn the model, not the import path.\n\nmicrosoft moved active work to the microsoft agent framework (public preview oct 2025). the actor model survives the migration because erlang proved it decades ago.\n\ninbox, handler, dead-letter, let it crash. the package name is the least durable part.',
      },
    ],
    source: {
      label: 'Full lesson: 14.14 14-autogen-actor-model',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/14-agent-engineering/14-autogen-actor-model',
    },
  },
  {
    id: 'p14-15-crewai',
    phase: 'Phase 14 · Agent Engineering',
    part: 'Part 3 · Patterns and runtimes',
    index: '14.15',
    title: 'CrewAI: role-based crews, and the Flow you actually ship',
    oneLiner:
      'Four primitives (Agent, Task, Crew, Process) and two shapes. Crews are autonomous and exploratory. Flows are event-driven and deterministic. CrewAI\'s own docs say start with a Flow.',
    readTime: '~8 min read',
    diagram: '/lessons/p14-15.svg',
    diagramCaption:
      'Crew versus Flow: an LLM-routed team of roles on one side, an event-driven graph of @start and @listen steps on the other, with a Crew nested inside one Flow step.',
    whyItMatters:
      'The Crew-vs-Flow split is the replay question, and replay is a support surface. If a customer files a bug against a Crew run, you cannot diff the bad run against a good one, so there is nothing to render in a run detail view and nothing for on-call to read at 3 AM. A Flow gives you fixed topics, which means a per-step timeline component with stable ids you can deep-link. The other design-visible primitive is output_pydantic on a Task: it is the difference between the next step reading a typed object your UI can render as fields, and it ad-libbing over free text.',
    sections: [
      {
        heading: 'Four primitives, and that is the whole model',
        body: 'Agent is role plus goal plus backstory plus tools plus an optional model. The backstory is load-bearing: it shapes tone, judgment, and when the agent decides to stop.\n\nTask is description plus expected_output plus an assigned agent, with optional context (upstream tasks whose outputs get passed in) and optional output_pydantic (a structured shape the response is validated against).\n\nCrew is the container: agents, tasks, process, plus optional memory, verbose, and manager_llm. Process is the execution strategy.\n\nAgents never see each other directly. Tasks reference agents, the Crew sequences tasks, the Process decides who goes next. Everything else is config.',
      },
      {
        heading: 'Sequential, Hierarchical, and the manager tax',
        body: 'Sequential runs tasks in declaration order and threads task N\'s output into task N+1 as context. Lowest cost, most predictable, correct whenever the order is fixed.\n\nHierarchical adds a manager Agent that routes between specialists each round and can refuse or re-route. Use it with four or more specialists where the order genuinely depends on prior output.\n\nThe cost is concrete: the manager is an extra LLM call before every specialist call, carrying the full task list plus prior outputs. A five-task crew becomes six calls with the biggest prompt on the extra one, and token cost can triple on a five-step run. Consensus is a reserved name in the docs, not a shipped process. Do not build on it.',
      },
      {
        heading: 'Crews vs Flows: the framing the 2026 docs lead with',
        body: 'A Crew is LLM-driven autonomy: the framework picks the shape at runtime. Good for research, brainstorming, and first drafts, where the path is part of the answer. Cheap to prototype, hard to replay, hard to test.\n\nA Flow is an event-driven graph you own. @start marks the entry, @listen(topic) marks a step that fires when another step emits that topic, and each step is plain Python that can call Crew.kickoff() internally. Observable, testable, deterministic.\n\nThe docs\' production recommendation is blunt: start with a Flow, then fold Crews in from inside Flow steps when autonomy earns its cost. The Flow gives you the audit trail, the Crew gives you the exploration. Compose rather than pick.',
      },
      {
        heading: 'Tools, structured output, and four memory types',
        body: 'Three ways to give an Agent a tool: the @tool decorator (the signature is the schema, the docstring is what the model reads), a BaseTool subclass when the tool has state or needs an explicit args schema and retries, and built-in toolkits like SerperDevTool, FileReadTool, and CodeInterpreterTool.\n\nStructured output uses Pydantic via output_pydantic on the Task, and CrewAI coerces or retries against the model. Pair it with a tight expected_output string.\n\nMemory comes in four kinds: short-term (buffer within a run), long-term (vector-backed, survives kickoffs), entity (facts keyed by customer or account), and contextual (retrieved at the moment the agent needs it). Validated against CrewAI 0.86 as of 2026-05; recent releases route these through a unified Memory entry point.',
      },
      {
        heading: 'The four failure modes',
        body: 'Prompt-bloat from backstories: a 2000-word backstory across five agents burns the context budget before the first tool call. Keep backstories under 200 words and stop repeating house style five times.\n\nManager-LLM token tax: Hierarchical when Sequential would do. Brittle handoffs: task N promises "an outline", produces four sections, and task N+1 was written to parse three, so the downstream agent ad-libs. Fix it with output_pydantic so the next step reads a typed object.\n\nCrew-as-prod: shipping a free-form Crew with no Flow wrapper. Output variability is high, replay is impossible, and tool side effects can fire more times than you expected. Anything that POSTs, DELETEs, or takes payment belongs in a Flow step, never a Crew tool.',
      },
    ],
    takeaways: [
      'Crew for exploration, Flow for production, and the docs mean it. Wrap the Crew in a Flow so there is a run you can replay and deep-link.',
      'output_pydantic on a Task is a UI decision: typed fields the next step and your detail view can render, instead of free text someone re-parses.',
      'Hierarchical adds an LLM call before every specialist call, carrying the full task list. Token cost can triple on five steps. Only pay when routing depends on output.',
      'Never put an irreversible action (POST, DELETE, payment) behind a Crew tool. A Crew can call it more times than you expected. Put it in a Flow step.',
    ],
    terms: [
      { term: 'Crew', meaning: 'A container of agents and tasks run under a process; autonomy is decided at runtime.' },
      { term: 'Flow', meaning: 'An event-driven graph of @start and @listen steps that you own and can replay.' },
      { term: 'Backstory', meaning: 'The persona text on an Agent that shapes its tone, judgment, and stopping behaviour.' },
      { term: 'expected_output', meaning: 'The per-task contract string telling the agent and the audit what shape to return.' },
      { term: 'output_pydantic', meaning: 'A Pydantic model the task response is validated against, giving downstream steps typed fields.' },
      { term: 'Entity memory', meaning: 'Facts keyed to a customer, account, or issue that survive across runs.' },
    ],
    demoCaption:
      'The same three-role brief run as a Crew and as a Flow. The reveal shows what a support engineer can actually open when a customer reports a bad run.',
    demo: {
      archetype: 'reveal',
      subject: 'A bad run lands in support',
      badLabel: 'Crew only',
      goodLabel: 'Flow wrapping the Crew',
      badCaption:
        'The LLM picked the shape at runtime, so there is no fixed step list to render and no good run to diff against. Support sees one blob of output and a timestamp. The bug report cannot be reproduced.',
      goodCaption:
        'Fixed topics mean a per-step timeline with stable ids you can deep-link. Each step shows its typed output, its duration, and its cost, and the Crew that ran inside step 2 is one expandable row rather than the whole story.',
      opaqueLabel: 'Run 8c31 · brief generated · 42s · $0.61',
      revealedLines: [
        '@start collect_sources · 6s · 3 urls · typed',
        '@listen(researched) draft · 19s · Crew.kickoff inside',
        '  crew: researcher, writer, editor · 3 turns',
        '@listen(drafted) edit · 11s · output_pydantic Brief',
        '@listen(edited) publish · 6s · gated, not a Crew tool',
        'diff vs run 8b02: step 3 returned 4 sections, not 3',
      ],
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'crewai\'s whole model is four nouns: agent, task, crew, process.',
        body:
          'crewai\'s whole model is four nouns: agent, task, crew, process.\n\nagents never see each other. tasks reference agents. the crew sequences tasks. the process picks who goes next. everything else is config.\n\nthe part that costs money: hierarchical adds a manager LLM call before every specialist call, carrying the full task list. five tasks becomes six calls and token cost can triple.',
      },
      {
        kind: 'X · design angle',
        hook: 'replay is a support surface, and free-form crews do not have one.',
        body:
          'replay is a support surface, and free-form crews do not have one.\n\na customer reports a bad run. with a crew you get one blob and a timestamp. nothing to diff, nothing to deep-link, nothing for on-call at 3am.\n\nwrap it in a flow and the same run becomes a per-step timeline with stable ids, typed outputs and per-step cost. crewai\'s own docs say start with a flow.',
      },
      {
        kind: 'X · one-liner',
        hook: 'never put a payment behind a crew tool.',
        body:
          'never put a payment behind a crew tool.\n\na crew decides its own shape at runtime, which means it can call a tool more times than you expected. POST, DELETE, charge: those belong in a flow step you own.\n\nautonomy is fine for drafts. it is not fine for anything irreversible.',
      },
    ],
    source: {
      label: 'Full lesson: 14.15 15-crewai-role-based-crews',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/14-agent-engineering/15-crewai-role-based-crews',
    },
  },
  {
    id: 'p14-16-openai-agents-sdk',
    phase: 'Phase 14 · Agent Engineering',
    part: 'Part 3 · Patterns and runtimes',
    index: '14.16',
    title: 'OpenAI Agents SDK: handoffs as tools, guardrails as gates',
    oneLiner:
      'Delegation is modeled as a tool the model calls, named transfer_to_<agent>. Guardrails run on input, output, or a specific tool, and whether they run in parallel or block is a latency-versus-token tradeoff you feel in the UI.',
    readTime: '~8 min read',
    diagram: '/lessons/p14-16.svg',
    diagramCaption:
      'A triage agent handing off via transfer_to_billing, with input, output, and tool guardrails wrapping the run and spans emitted at every boundary.',
    whyItMatters:
      'Handoff-as-a-tool means the transfer shows up as a tool call in the stream, which is the only reason your UI can attribute an answer to the right specialist. Without that boundary event you get one anonymous voice and no way to label who said what. The guardrail mode is a directly visible tradeoff: parallel guardrails stream the main answer immediately and may have to retract it mid-render, which needs a specific transition (not a jarring content swap). Blocking guardrails add a first-token delay you must fill with a skeleton, and waste no tokens on a trip.',
    sections: [
      {
        heading: 'Five primitives',
        body: 'Agent: model plus instructions plus tools plus handoffs. Handoff: delegation to another agent, represented to the model as a tool. Guardrail: validation on input, output, or tool invocation. Session: automatic conversation history across turns, persisted in SQLite, Redis, or a custom backend. Tracing: built-in spans for generations, tool calls, handoffs, and guardrails, on by default.\n\nThe SDK sits on the Responses API. The whole surface is small enough to hold in your head, which is the point of it relative to the graph frameworks.',
      },
      {
        heading: 'Handoffs are tools, and that is the useful part',
        body: 'The model sees transfer_to_billing_agent in its tool list. Calling it tells the runtime to copy the conversation context (or collapse it via the nest_handoff_history beta), initialize the target agent with its own instructions, and continue the run there.\n\nThis is the supervisor pattern productized. The design consequence is that the handoff is an observable event in the stream with a name attached. Your transcript can render a divider, relabel the speaker, and show which specialist owns the next block of text. Compare that to a monolithic prompt, where the same behaviour exists but is invisible and unattributable.',
      },
      {
        heading: 'Three guardrail flavors and two modes',
        body: 'Input guardrails run on the first agent\'s input and reject unsafe or out-of-scope requests before any main LLM call. Output guardrails run on the last agent\'s output to catch PII leaks, policy violations, and malformed responses. Tool guardrails run per function tool to validate arguments, check permissions, and audit execution.\n\nMode matters. Parallel is the default: the guardrail model runs alongside the main model, which keeps tail latency low, but a trip discards work you already paid for. Blocking (run_in_parallel=False) runs the guardrail first and wastes no main-model tokens on a trip, at the cost of extra latency before anything appears.\n\nA trip raises a tripwire exception, which is a different error class from a model failure and deserves a different component.',
      },
      {
        heading: 'Sessions and tracing',
        body: 'Session stores conversation history in a backend and Runner.run(agent, input, session=session) loads and appends automatically. That is what lets a conversation survive a page reload without you hand-rolling a message table.\n\nTracing is on by default. Every generation, tool call, handoff, and guardrail emits a span, OPENAI_AGENTS_DISABLE_TRACING=1 opts out, and add_trace_processor fans spans to your own backend alongside OpenAI\'s. The span tree is the honest source for a run detail view: it already has the parent-child structure your timeline component wants.',
      },
      {
        heading: 'Where it goes wrong',
        body: 'Handoff drift: agent A transfers to B, B transfers back to A, and the loop burns tokens while the UI shows activity that goes nowhere. Add a hop counter and refuse after N transfers, then surface the refusal as its own state rather than a generic error.\n\nGuardrail bypass: tool guardrails only fire on function tools. Built-in tools like the file reader and web fetch need separate policy, which is exactly the gap a security review will find.\n\nOver-tracing: spans capture content, and sensitive content in spans is a leak. Pair with the OTel GenAI content-capture rules: store the payload externally and reference it by id.',
      },
    ],
    takeaways: [
      'A handoff is a tool call named transfer_to_<agent>, so the transfer is an event in the stream. That event is what lets your transcript attribute text to the right specialist.',
      'Parallel guardrails mean you may have to retract text the user is already reading. Design that transition deliberately; do not let content swap under the cursor.',
      'Blocking guardrails trade first-token latency for zero wasted tokens on a trip. Which one you pick decides whether you need a skeleton or a retraction.',
      'A tripwire is a policy refusal, not a model failure. Different cause, different recovery, different component.',
    ],
    terms: [
      { term: 'Handoff', meaning: 'Delegation exposed to the model as a tool named transfer_to_<agent_name>.' },
      { term: 'Guardrail', meaning: 'A validation check on input, output, or a specific tool invocation.' },
      { term: 'Tripwire', meaning: 'The exception raised when a guardrail rejects, distinct from a model error.' },
      { term: 'Session', meaning: 'Conversation history persisted in a backend and loaded automatically per run.' },
      { term: 'Parallel guardrail', meaning: 'A check running alongside the main call: lower tail latency, wasted tokens on a trip.' },
      { term: 'Hop counter', meaning: 'A cap on transfers between agents, preventing two specialists from bouncing a request forever.' },
    ],
    demoCaption:
      'Slide the guardrail from fully blocking to fully parallel and watch first-token latency trade against wasted tokens and the chance of retracting text mid-render.',
    demo: {
      archetype: 'slider-map',
      subject: 'Guardrail mode on a support answer',
      sliderLabel: 'Guardrail mode (blocking to parallel)',
      outputLabel: 'First-token latency and retraction risk',
      badLabel: 'Read as a backend setting',
      goodLabel: 'Read as a rendering contract',
      badCaption:
        'Treating the mode as a config value means the UI ships one loading state for both. Parallel then retracts text the user is mid-sentence through, and blocking shows a dead 900ms with nothing on screen.',
      goodCaption:
        'Blocking pushes latency in front of the first token, so it needs a skeleton with an explicit "checking policy" label. Parallel streams immediately and needs a designed retraction: freeze, fade, replace with the refusal state. Same backend flag, two different components.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'in the openai agents sdk, delegation is just a tool call.',
        body:
          'in the openai agents sdk, delegation is just a tool call.\n\nthe model sees transfer_to_billing_agent in its tool list. calling it copies context, initializes the target agent with its own instructions, and continues the run there.\n\nfive primitives total: agent, handoff, guardrail, session, tracing. tracing is on by default and every handoff emits a span.',
      },
      {
        kind: 'X · design angle',
        hook: 'guardrail mode is not a backend setting. it decides which component you build.',
        body:
          'guardrail mode is not a backend setting. it decides which component you build.\n\nblocking: the check runs first. zero wasted tokens on a trip, but a dead delay before the first token. you need a skeleton that says what it is waiting on.\n\nparallel: streams immediately, then may have to retract text the user is already reading. that retraction needs a designed transition, not a content swap under the cursor.',
      },
      {
        kind: 'X · one-liner',
        hook: 'a guardrail trip is not an error. stop rendering it as one.',
        body:
          'a guardrail trip is not an error. stop rendering it as one.\n\nthe model did not fail. a policy refused. different cause, different recovery path, different component. "something went wrong, try again" is wrong on all three counts.\n\nthe sdk even gives it its own exception class. use the distinction it handed you.',
      },
    ],
    source: {
      label: 'Full lesson: 14.16 16-openai-agents-sdk',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/14-agent-engineering/16-openai-agents-sdk',
    },
  },
  {
    id: 'p14-17-claude-agent-sdk',
    phase: 'Phase 14 · Agent Engineering',
    part: 'Part 3 · Patterns and runtimes',
    index: '14.17',
    title: 'Claude Agent SDK: the harness as a library',
    oneLiner:
      'The same loop Claude Code runs, importable: built-in tools, subagents with their own context windows, lifecycle hooks, a session store, and W3C trace propagation across the process boundary.',
    readTime: '~8 min read',
    diagram: '/lessons/p14-17.svg',
    diagramCaption:
      'An orchestrator spawning subagents with isolated context windows: only results return, so the orchestrator budget stays bounded while each subagent burns its own.',
    whyItMatters:
      'Subagent context isolation is the reason a long agent session does not degrade halfway through, and it is directly visible in what you can render. Only results come back to the orchestrator, so you get a bounded transcript plus a set of collapsed subagent rows, each expandable via get_subagent_messages(). PreToolUse is the actual permission gate: it fires before a tool runs, which is where an approval modal has to sit if it is going to mean anything. And list_subkeys(session_id) is what turns a session into a tree you can render, rather than a flat log.',
    sections: [
      {
        heading: 'Client SDK vs Agent SDK',
        body: 'The anthropic client SDK gives you the raw Messages API. You own the loop, the tool execution, the state, and everything that goes wrong in between.\n\nThe claude-agent-sdk package is the harness shape: built-in tool execution, MCP server connections, lifecycle hooks, subagent spawning, and a session store. It is the Claude Code loop exposed as a library, which is a useful way to read it. When you use Claude Code, you are watching this surface render. Building on the SDK means you are choosing which parts of that surface your own product exposes.\n\nIt ships more than ten built-in tools out of the box: file read and write, shell, grep, glob, web fetch, and others. Custom tools register through the standard tool-schema interface.',
      },
      {
        heading: 'Subagents: parallelization and context isolation',
        body: 'Anthropic documents two reasons to spawn a subagent. Parallelization: independent work runs concurrently, and "find the test file for each of these 20 modules" is 20 parallel tasks rather than 20 sequential turns.\n\nContext isolation: a subagent runs in its own context window and only its result returns to the orchestrator. The orchestrator\'s budget is preserved, which is why a long session stays coherent instead of degrading as the transcript grows.\n\nThe Python SDK added list_subagents() and get_subagent_messages() for reading subagent transcripts. Those two calls are the difference between a subagent being an opaque black box in your UI and being a collapsed row the user can open.',
      },
      {
        heading: 'Hooks: where the gates actually live',
        body: 'Registerable lifecycle hooks: PreToolUse and PostToolUse gate or audit tool calls, SessionStart and SessionEnd handle setup and teardown, UserPromptSubmit acts on user input before the model sees it, PreCompact runs before context compaction, Stop cleans up on exit, and Notification carries side-channel alerts.\n\nPreToolUse is the one to internalize. It fires before the tool executes, so it is the only place an approval gate is a real gate rather than a confirmation shown after the write already happened. Rate limits, permission checks, and destructive-action confirmations all belong there.\n\nPreCompact is the other design-relevant one: it is your chance to tell the user that the conversation is about to be summarized, before their earlier turns stop being verbatim.',
      },
      {
        heading: 'Sessions and traces',
        body: 'The session store has protocol parity between Python and TypeScript: append(session_id, message) adds a turn, load(session_id) restores the conversation, list_sessions() enumerates, delete(session_id) cascades to subagent sessions, and list_subkeys(session_id) lists the subagent keys under a session. The CLI flag --session-mirror writes transcript turns to an external file as they stream, which is the practical way to debug a run you cannot pause.\n\nOTel spans active on the caller propagate into the CLI subprocess via W3C trace context headers, so a multi-process run shows up as one trace rather than several orphans.\n\nClaude Managed Agents is the hosted alternative (beta header managed-agents-2026-04-01) for long-running async work, with prompt caching and compaction built in. You trade control for managed infrastructure.',
      },
      {
        heading: 'Where it goes wrong',
        body: 'Subagent over-spawn: 100 subagents for 100 tiny tasks means spawn overhead dominates the actual work, and the UI turns into 100 rows of noise. Batch instead, for example 20 tasks into groups of five.\n\nHook creep: every team adds hooks, none removes them, and startup time balloons. Review the set quarterly, the same way you would review middleware.\n\nSession bloat: sessions accumulate and grow. Use list_sessions() with an expiry policy, and remember that delete cascades to subagent sessions, which is both convenient and a way to lose more than you meant to.',
      },
    ],
    takeaways: [
      'Subagents run in their own context window and return only results. That is why the orchestrator transcript stays bounded, and why subagent work renders as a collapsed row rather than inline noise.',
      'PreToolUse is the permission gate. An approval prompt anywhere later is a notification about something that already happened.',
      'list_subkeys(session_id) plus get_subagent_messages() are what let you render a session as an expandable tree instead of a flat log.',
      'Batch subagents rather than spawning one per tiny task. Spawn overhead dominates, and 100 rows is not a UI.',
    ],
    terms: [
      { term: 'Agent SDK', meaning: 'The Claude Code harness as an importable library: tools, MCP, hooks, subagents, sessions.' },
      { term: 'Subagent', meaning: 'A child agent with its own context window whose result, not transcript, returns to the orchestrator.' },
      { term: 'PreToolUse', meaning: 'The hook that fires before a tool executes, making it the only real place for an approval gate.' },
      { term: 'PreCompact', meaning: 'The hook that fires before context compaction, your warning that earlier turns stop being verbatim.' },
      { term: 'Session store', meaning: 'append, load, list_sessions, delete, and list_subkeys over persisted conversation turns.' },
      { term: 'W3C trace context', meaning: 'Headers that carry the parent span into the CLI subprocess so one run is one trace.' },
    ],
    demoCaption:
      'One orchestrator, twenty file lookups. Compare running them inline against spawning subagents, and watch what happens to the orchestrator context budget and to the transcript the user reads.',
    demo: {
      archetype: 'meter',
      subject: 'Orchestrator context after 20 file lookups',
      badLabel: 'Inline in the orchestrator',
      goodLabel: 'Isolated subagents',
      badCaption:
        'Twenty full tool transcripts land in the orchestrator window. The budget fills, compaction kicks in early, and the user scrolls past twenty blocks of raw file output to find the answer.',
      goodCaption:
        'Each subagent burns its own window and returns only a result line. The orchestrator stays bounded, the transcript is twenty collapsed rows, and get_subagent_messages() opens any one of them on demand.',
      headline: 'Orchestrator context: 12% used, 20 tasks done',
      breakdown: [
        { label: 'Orchestrator: prompt and plan', value: 5 },
        { label: 'Orchestrator: 20 result lines', value: 7 },
        { label: 'Subagent 1-5 windows (isolated)', value: 22 },
        { label: 'Subagent 6-10 windows (isolated)', value: 21 },
        { label: 'Subagent 11-15 windows (isolated)', value: 24 },
        { label: 'Subagent 16-20 windows (isolated)', value: 19 },
      ],
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'the claude agent sdk is the claude code loop, importable.',
        body:
          'the claude agent sdk is the claude code loop, importable.\n\nbuilt-in tools (read, write, shell, grep, glob, fetch), MCP connections, lifecycle hooks, a session store, and subagents.\n\nthe subagent bit is the one that matters: a subagent runs in its own context window and only the result comes back. the orchestrator budget stays bounded no matter how long the run gets.',
      },
      {
        kind: 'X · design angle',
        hook: 'PreToolUse is your permission gate. everything after it is a notification.',
        body:
          'PreToolUse is your permission gate. everything after it is a notification.\n\nthe hook fires before the tool executes. that is the only point where an approval modal actually prevents something. a confirmation shown at PostToolUse is telling the user about a write that already landed.\n\nsame logic for PreCompact: it is your one chance to warn someone their earlier turns are about to stop being verbatim.',
      },
      {
        kind: 'X · one-liner',
        hook: 'context isolation is a UI feature, not just a budget trick.',
        body:
          'context isolation is a UI feature, not just a budget trick.\n\nsubagents return results, not transcripts. so twenty parallel file lookups render as twenty collapsed rows instead of twenty blocks of raw output the user scrolls past.\n\nlist_subkeys + get_subagent_messages turn that into an expandable tree. the isolation is what makes the tree possible.',
      },
    ],
    source: {
      label: 'Full lesson: 14.17 17-claude-agent-sdk',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/14-agent-engineering/17-claude-agent-sdk',
    },
  },
  {
    id: 'p14-18-agno-mastra',
    phase: 'Phase 14 · Agent Engineering',
    part: 'Part 3 · Patterns and runtimes',
    index: '14.18',
    title: 'Agno and Mastra: runtimes that fit the stack you already have',
    oneLiner:
      'Not every agent needs a graph framework. Agno optimizes Python instantiation to microseconds behind a stateless FastAPI backend. Mastra ships typed agents, tools, and workflows on the Vercel AI SDK, in the same TypeScript your frontend is written in.',
    readTime: '~8 min read',
    diagram: '/lessons/p14-18.svg',
    diagramCaption:
      'Two production shapes: a stateless session-scoped Python backend spawning a fresh agent per request, and a TypeScript runtime with Zod-typed tools sitting next to the app that renders them.',
    whyItMatters:
      'Mastra is the one that changes your day, because the agent and the component share a type system. A Zod tool schema is the same object your form validation and your rendered result use, so a tool argument change breaks the build instead of the run. Agno\'s stateless session-scoped shape has its own UI consequence: because a fresh agent is constructed per request and state lives in a DB, resume and multi-device continuation are free and reconnect is just a session id. Neither offers durable graph checkpoints, so an interrupted run recovers to the last persisted session turn, not the last node.',
    sections: [
      {
        heading: 'The problem: framework weight you did not ask for',
        body: 'LangGraph, AutoGen, and CrewAI are framework-heavy by design, because they are buying you graph semantics, actor semantics, or role templating. Teams that want the agent loop, fast, inside the runtime they already operate reach for something thinner.\n\nAgno (Python, formerly Phi-data) and Mastra (TypeScript) are the 2026 pairing. Both trade some framework-owned primitives for raw speed and a tighter fit to the surrounding stack. Neither is trying to be LangGraph, and the comparison is mostly about language fit and operational shape rather than capability.',
      },
      {
        heading: 'Agno: instantiation as the constraint',
        body: 'Agno\'s positioning is "no graphs, chains, or convoluted patterns, just pure python". The published performance targets are roughly 2 microseconds per agent instantiation, about 3.75 KiB of memory per agent, and around 23 model providers.\n\nThe recommended production path is a stateless session-scoped FastAPI backend: each request constructs a fresh agent and session state lives in a database. Native multimodal support (text, image, audio, video, file) and agentic RAG are built in.\n\nThose speed targets matter when you have thousands of short-lived agents per second, like chat fan-in or evaluation pipelines. They matter close to zero when one agent runs for ten minutes, and picking Agno because "2 microseconds" sounds good is the classic mistake here.',
      },
      {
        heading: 'Mastra: three primitives in the language your UI speaks',
        body: 'Mastra is TypeScript on top of the Vercel AI SDK, with three primitives: Agents, Tools (Zod-typed), and Workflows. The Unified Model Router covers 3,300-plus models across 94 providers as of March 2026.\n\nStorage is composite: memory, workflows, and observability can each go to a different backend, with ClickHouse recommended for observability at scale. Server adapters exist for Express, Hono, Fastify, and Koa, with first-class Next.js and Astro integration, and Mastra Studio runs on localhost:4111 for debugging.\n\nAt 1.0 in January 2026 it reported 22k-plus GitHub stars and 300k-plus weekly npm downloads. Licensing is Apache 2.0 except the ee/ directories, which are source-available and not Apache. Read those before you fork.',
      },
      {
        heading: 'Picking one',
        body: 'Agno: Python backend, many short-lived agents, real performance requirements, a FastAPI shop. Mastra: TypeScript backend, Next.js or Vercel deploy, unified multi-provider model routing, Zod-typed tools.\n\nLangGraph when durable state and explicit graph reasoning matter more than raw speed. The OpenAI or Claude Agent SDK when you want the provider\'s productized shape.\n\nBoth Agno and Mastra integrate with Langfuse, Phoenix, and Opik, but Mastra Studio is first-party, which is a meaningful difference when you are debugging at 6 PM on a Friday and do not want to stand up an observability stack first.',
      },
      {
        heading: 'The three failure modes',
        body: 'Performance for its own sake: choosing Agno for a workload of one slow agent call per request, where instantiation overhead is a rounding error next to the model latency. Measure your own instantiation cost before the 2 microseconds means anything.\n\nEcosystem lock-in: Mastra\'s Vercel-flavored integration is a genuine advantage on Vercel and a liability elsewhere. Be honest about where you deploy.\n\nLicense confusion: the ee/ directories are source-available, not open source. If you are planning a fork or building a competing hosted product, that distinction is the whole conversation.',
      },
    ],
    takeaways: [
      'Mastra puts the agent in the same type system as the component. A Zod tool schema is shared with your form validation and your rendered result, so a schema change fails the build, not the run.',
      'Agno\'s stateless session-scoped FastAPI shape makes resume and multi-device continuation cheap: a fresh agent per request, state in a DB, reconnect by session id.',
      'Neither gives you durable per-node checkpoints. An interrupted run recovers to the last persisted session turn, so do not promise step-level resume in the UI.',
      'The 2 microsecond instantiation target only matters at thousands of short-lived agents per second. For one ten-minute run it is noise.',
    ],
    terms: [
      { term: 'Agno', meaning: 'A Python agent runtime built for near-zero instantiation cost and stateless session-scoped serving.' },
      { term: 'Mastra', meaning: 'A TypeScript runtime on the Vercel AI SDK with Agents, Zod-typed Tools, and Workflows.' },
      { term: 'Stateless session-scoped', meaning: 'A fresh agent constructed per request, with all continuity held in a database keyed by session.' },
      { term: 'Unified Model Router', meaning: 'One client covering 3,300-plus models across 94 providers behind a single interface.' },
      { term: 'Composite storage', meaning: 'Sending memory, workflow state, and observability each to a different backend.' },
      { term: 'Source-available', meaning: 'A license that lets you read the source but restricts commercial use; not open source.' },
    ],
    demoCaption:
      'A tool argument gets renamed. Compare a runtime where the schema stops at the API boundary against one where the agent and the component share a Zod type.',
    demo: {
      archetype: 'before-after',
      subject: 'Renaming a tool argument',
      badLabel: 'Schema stops at the boundary',
      goodLabel: 'Shared Zod type',
      badCaption:
        'The Python tool takes customer_id, the React component still reads customerId. Nothing complains until a user triggers the tool in production and the result panel renders undefined.',
      goodCaption:
        'The Zod schema is one object imported by the tool, the form validation, and the result renderer. Rename the field and tsc fails in three places before you commit. The failure moved from runtime to build time.',
      badLines: [
        'tools.py: def lookup(customer_id: str)',
        'ResultPanel.tsx: data.customerId',
        'CI: green',
        'Prod: result panel renders undefined',
        'Detected by: a user',
      ],
      goodLines: [
        'schema.ts: z.object({ customerId: z.string() })',
        'tool + form + renderer import it',
        'Rename the field',
        'tsc: 3 errors before commit',
        'Detected by: the build',
      ],
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'not every agent needs a graph framework.',
        body:
          'not every agent needs a graph framework.\n\nagno: python, ~2 microsecond instantiation, ~3.75 KiB per agent, stateless session-scoped fastapi backend. fresh agent per request, state in a db.\n\nmastra: typescript on the vercel ai sdk. agents, zod-typed tools, workflows, 3,300+ models across 94 providers.\n\nboth trade framework primitives for fitting the runtime you already operate.',
      },
      {
        kind: 'X · design angle',
        hook: 'mastra\'s real feature is that the agent and the component share a type system.',
        body:
          'mastra\'s real feature is that the agent and the component share a type system.\n\none zod schema imported by the tool, the form validation and the result renderer. rename a field and tsc fails in three places before you commit.\n\nin a python-backend setup the same rename fails silently in production and a user finds it. the schema is the seam, and typescript on both sides closes it.',
      },
      {
        kind: 'X · one-liner',
        hook: '2 microsecond agent instantiation is noise if your agent runs for ten minutes.',
        body:
          '2 microsecond agent instantiation is noise if your agent runs for ten minutes.\n\nagno\'s numbers are real and they matter at thousands of short-lived agents per second. chat fan-in, eval pipelines.\n\nfor one slow call per request the bottleneck is the model, not the constructor. measure your own instantiation cost before the benchmark means anything.',
      },
    ],
    source: {
      label: 'Full lesson: 14.18 18-agno-and-mastra-runtimes',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/14-agent-engineering/18-agno-and-mastra-runtimes',
    },
  },
];
