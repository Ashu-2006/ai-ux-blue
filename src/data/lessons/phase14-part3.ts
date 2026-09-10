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
      'Anthropic split agentic systems into workflows, where the engineer owns the graph, and agents, where the model owns it. Five workflow patterns cover most production work.',
    readTime: '~10 min read',
    diagram: '/lessons/p14-12.svg',
    diagramCaption:
      'The five workflow patterns on top of the augmented LLM: prompt chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer.',
    whyItMatters:
      'Who owns the graph decides what your UI can promise. A workflow has a known step count, so you can render a real progress bar, name the current step, and quote a price before the run starts. An agent has an unknown step count, so the same component becomes an open-ended activity log with a stop control and a spend meter. Routing needs a confidence threshold and an escalate affordance. Parallelization needs result slots that fill out of order without the layout jumping. Evaluator-optimizer needs a visible revision counter the user can interrupt.',
    learningObjectives: [
      'Name Anthropic\'s five workflow patterns and state the one job each pattern does.',
      'Explain the workflow-versus-agent split in terms of who owns the graph, not who uses more model calls.',
      'Compute the LLM call count for a routing-plus-chaining feature, with and without a confidence-gated escalation step.',
      'Decide, given a feature brief, whether it needs a single augmented LLM call, a workflow, or an agent.',
      'Design the progress component a routing pattern needs above and below its confidence threshold.',
    ],
    sections: [
      {
        heading: 'Who owns the graph',
        body: 'Anthropic\'s December 2024 post, written by Erik Schluntz and Barry Zhang, drew a line that stuck across the industry. A workflow is LLMs and tools orchestrated through predefined code paths: the engineer owns the graph, the model fills in the blanks. An agent is a model dynamically directing its own tools and deciding its own next step: the model owns the graph.\n\nBoth are legitimate choices. Workflows are cheaper, faster, and debuggable because the shape lives in source control. Agents unlock open-ended problems and pay for it in failure modes nobody enumerated in advance. The post\'s central argument, still the most-cited pushback in the field two years later, is that teams reach for multi-agent frameworks when a single function call would do, and the framework then hides the prompts and the control flow that used to be visible.',
      },
      {
        heading: 'The augmented LLM: the atomic unit',
        body: 'Every one of the five patterns is built from one primitive: an LLM with three capabilities wired in. Search (retrieval), tools (actions), and memory (persistence). A single API call can carry all three at once, which is why "just call the API" is a legitimate architecture rather than a beginner\'s shortcut.\n\nThe practical test: describe your feature as one augmented call before you describe it as a graph. If that description holds, the extra structure you were about to add is a tax with no return. If it does not hold, the structure is earning its keep. Most features that ship a LangGraph or CrewAI dependency on day one never run this test first, and that is exactly the mistake the December 2024 post argues against.',
      },
      {
        heading: 'The five patterns, side by side',
        body: '| Pattern | Shape | Use when |\n|---|---|---|\n| Prompt chaining | Output of call 1 feeds call 2 | The task decomposes cleanly and linearly |\n| Routing | A classifier picks the downstream chain | Categorically different inputs (refund vs bug vs sales) |\n| Parallelization | N calls run concurrently, then aggregate | Independent chunks (sectioning) or majority vote (voting) |\n| Orchestrator-workers | An orchestrator picks which specialists run | Agent-shaped work that still has a bounded loop |\n| Evaluator-optimizer | One model proposes, another judges, repeat | Self-Refine, generalized, with an iteration cap |\n\nEach pattern in Anthropic\'s reference implementation runs 10 to 15 lines of code against a scripted LLM. The framework alternative for the same behavior is measured in the thousands.',
      },
      {
        heading: 'Where workflows win',
        body: 'Three axes favor a workflow. Predictable tasks: if you can enumerate the steps on a whiteboard, enumerate them in code instead of asking a model to rediscover them every run. Cost-bound tasks: a workflow has a fixed step count, so the dollar ceiling per request is a known number before you ship, where an agent can spiral into a run nobody budgeted for. Compliance-bound tasks: an auditor wants to read the graph in your repository, not reconstruct intent from a trajectory log after the fact.\n\nA five-step refund workflow, for instance, costs the same five calls whether the input is easy or hard. That predictability is the entire pitch, and it is worth more than the flexibility an agent offers on tasks that do not need it.',
      },
      {
        heading: 'Where agents win',
        body: 'The mirror image favors an agent. Open-ended research, where the next step depends on what the last step returned and cannot be scripted in advance. Variable-length work, where the honest answer to "how many steps" is "we do not know yet," anywhere from three calls to thirty. Novel domains, where you have not yet discovered the right workflow and exploration has to come before codification.\n\nThe tell is in the planning meeting. If someone can draw the boxes and the arrows between them in under a minute, it is a workflow wearing agent branding. If nobody in the room can draw it, that is the real signal to reach for an agent, not a vibe about how capable the feature needs to sound in the pitch deck.',
      },
      {
        heading: 'The budget behind every call: context as a resource',
        body: 'Anthropic\'s companion piece, "Effective context engineering for AI agents" (2025), reframes the context window as a budget rather than a container. A 200,000-token window is not free space to fill, it is a resource with diminishing returns per extra token and a real dollar cost per request. Every pattern above spends that budget differently: prompt chaining spends it linearly across calls, parallelization spends N times the input tokens for N branches, evaluator-optimizer spends more per iteration with no guaranteed ceiling unless you cap it.\n\nThat framing is why the workflow-versus-agent decision is also a cost decision. A five-step workflow has a knowable token bill. An uncapped evaluator-optimizer loop does not, and the design consequence shows up in the UI as a spend meter, not a static price.',
      },
      {
        heading: 'What this means for the surface you build',
        body: 'The step count is the difference between a determinate progress bar and an indeterminate one, and users read those two components differently within the first second. A workflow lets you show "step 3 of 5, drafting" with a real percentage and an estimate quoted before the run starts. An agent gives you a scrolling trace, a cancel button, and a token or dollar meter, because you cannot promise an end.\n\nRouting is the pattern that most needs a confidence threshold designed into the UI, not buried in the backend: below the threshold, escalate to a human, and that escalation path needs its own empty and pending states. Parallelization needs slots that fill out of order without the layout jumping, since five concurrent calls rarely return in the order they were sent.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p14-12-inline-patterns.svg',
        alt: 'The five workflow patterns as five labeled boxes',
        caption: 'Prompt chaining, routing, parallelization, orchestrator-workers, and evaluator-optimizer, each about a dozen lines of code.',
        diagramBrief: 'Cream paper background, black ink, one blue accent. Five equal-width boxes in a horizontal row, each labeled with a pattern name and a short shape hint underneath (for example "Prompt chaining / call 1 to call 2"). Below each box, a small line-count badge reading "~12 lines". Style matches the hero diagram: monochrome ink, one accent per highlighted box.',
      },
      {
        src: '/lessons/p14-12-inline-progress.svg',
        alt: 'Determinate progress bar vs indeterminate activity log',
        caption: 'Known step count renders as a percentage and an estimate. Unknown step count renders as a trace, a stop button, and a spend meter.',
        diagramBrief: 'Two side-by-side panels on cream paper. Left panel: a labeled progress bar at 60 percent, text "Step 3 of 5: checking refund policy", and a price line "Est. cost: $0.04". Right panel: a scrolling list of log lines fading at the top to suggest more above, a red stop button, and a running cost counter reading "Cost so far: $0.83, no ceiling". One accent color, black ink, minimal shading.',
      },
    ],
    takeaways: [
      'Workflow means the engineer owns the graph and the step count is known. Agent means the model owns it and the step count is not. That difference is a determinate vs indeterminate progress component.',
      'Start with one augmented LLM call (search + tools + memory). Add a pattern only when a specific behaviour needs it, because frameworks hide prompts and control flow.',
      'The five patterns are prompt chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer. Each is roughly a dozen lines, not a dependency.',
      'Routing without a confidence threshold and a human-escalation path is a classifier presented as a verdict. Design the below-threshold state first.',
    ],
    terms: [
      { term: 'Workflow', gloss: '"a predefined flow"', meaning: 'LLM and tool calls arranged through code paths the engineer owns; the model fills in the blanks, not the graph.' },
      { term: 'Agent', gloss: '"autonomous AI"', meaning: 'A system where the model dynamically picks its own tools and next step; the model owns the graph.' },
      { term: 'Augmented LLM', gloss: '"an LLM with tools"', meaning: 'One model call wired to search, tools, and memory. The atomic unit every pattern is built from.' },
      { term: 'Prompt chaining', gloss: '"sequential calls"', meaning: 'The output of call 1 becomes the input to call 2, with optional programmatic gates between steps.' },
      { term: 'Routing', gloss: '"classifier dispatch"', meaning: 'A classifier LLM picks which downstream chain or model handles the input.' },
      { term: 'Parallelization', gloss: '"fan out"', meaning: 'N calls run concurrently, aggregated by sectioning (different chunks) or voting (majority over N identical prompts).' },
      { term: 'Orchestrator-workers', gloss: '"a dispatcher agent"', meaning: 'An orchestrator model decides which specialist workers to run and synthesizes their output, without looping indefinitely.' },
      { term: 'Evaluator-optimizer', gloss: '"a proposer plus a judge"', meaning: 'One model proposes, a second evaluates, and the loop repeats until the evaluator passes. Self-Refine, generalized.' },
      { term: 'Context window as budget', gloss: '"more context is better"', meaning: 'Tokens have a real dollar cost and diminishing returns; the window is a resource to spend, not free space to fill.' },
      { term: 'Confidence threshold', gloss: '"a cutoff score"', meaning: 'The score below which a routing decision escalates to a human instead of resolving automatically.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A router classifies a request into one of four categories in one call, then a three-step chain handles it. How many total LLM calls does one request cost end to end?' },
      { level: 'medium', prompt: 'Parallelization by voting runs the same prompt 5 times at $0.002 per call and 900ms each in parallel. What does one vote round cost in dollars and in wall-clock time, and how does that change if the calls run sequentially instead?' },
      { level: 'hard', prompt: 'Design an evaluator-optimizer loop capped at 3 iterations. Iteration 2 fails the evaluator. Specify what the UI shows while iteration 3 runs, and what it shows if iteration 3 also fails.' },
      { level: 'design', prompt: 'Sketch the progress component for a routing workflow with a confidence threshold of 0.75. Specify the above-threshold state, the below-threshold state, and the one line of microcopy that explains the handoff to the person receiving it.' },
    ],
    furtherReading: [
      { label: 'Schluntz and Zhang, Building Effective Agents (Anthropic, December 2024)', url: 'https://www.anthropic.com/research/building-effective-agents', why: 'The original post naming the five patterns and the workflow-versus-agent distinction this lesson is built on.' },
      { label: 'Anthropic, Effective context engineering for AI agents (2025)', url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents', why: 'The companion piece on treating the context window as a spendable budget rather than a container.' },
      { label: 'LangGraph overview', url: 'https://docs.langchain.com/oss/python/langgraph/overview', why: 'Where to go once a workflow genuinely needs durable state and checkpointed resume.' },
      { label: 'OpenAI Agents SDK documentation', url: 'https://openai.github.io/openai-agents-python/', why: 'The orchestrator-workers pattern, productized as handoffs between named agents.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Workflow-or-agent picker',
      body: '- Can you draw the steps and arrows in under a minute? If yes, it is a workflow.\n- Is the step count the same regardless of input difficulty? If yes, workflow.\n- Does a compliance or audit reviewer need to read the graph, not infer it? If yes, workflow.\n- Does the next step genuinely depend on what the last step returned, in a way you cannot pre-script? If yes, agent.\n- Is the honest step-count estimate "somewhere between 3 and 30"? If yes, agent.\n- Before either: can one augmented LLM call (search plus tools plus memory) do this alone? If yes, skip the graph entirely.',
    },
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
      'Nodes are functions, edges are transitions, and state is serialized after every node. A 40-step run that dies at step 38 resumes at 38 instead of paying for the first 37 again.',
    readTime: '~10 min read',
    diagram: '/lessons/p14-13.svg',
    diagramCaption:
      'A state graph: typed state flowing through nodes, conditional edges branching, and the checkpointer writing after every node so resume is a load call.',
    whyItMatters:
      'Checkpoint-after-every-node is what makes "resume" a real product feature instead of a retry button that starts over. It buys three surfaces. A run-detail view that renders the exact state object, because it is already serialized. A human-approval gate that survives a page reload, so someone approves from their phone an hour later and the run continues. And per-node streaming, so the activity log names the current node instead of showing an undifferentiated spinner. Checkpoint only the conversation turns and all three break the moment a tool wrote something.',
    learningObjectives: [
      'Describe LangGraph\'s model: typed state, function nodes, conditional edges, and a checkpoint written after every node.',
      'Explain why checkpoint-after-every-node turns a crash-and-retry into a load-and-resume.',
      'Name the three orchestration topologies: supervisor, swarm, and hierarchical nested subgraphs.',
      'Identify when a checkpoint is too small to make resume trustworthy.',
      'Design a run-detail view and a durable approval gate from the state object a checkpointer already serializes.',
    ],
    sections: [
      {
        heading: 'The problem: fresh-run assumptions',
        body: 'Agents and workflows share one operational failure. A 40-step run dies at step 38, the library assumes every run starts fresh, and the operator hacks retries around the outside while the user pays for the first 37 steps a second time.\n\nLangGraph\'s answer is to make state a first-class typed object instead of an implicit pile of chat messages. Mutations are explicit, and the runtime writes a checkpoint after every node returns. Resume becomes a load call against a session id, not a re-run from the top. That single design choice is why LangGraph, not a thinner alternative, is the default answer once a run gets long enough to fail partway through.',
      },
      {
        heading: 'The model: state, nodes, edges',
        body: 'A graph is four things. A state type: a typed dict or Pydantic model every node reads and mutates. Nodes: pure functions from state to a state update, merged back in after the node returns. Edges: direct or conditional, chosen by a function of the current state. And START and END sentinels marking the boundary.\n\nA routing workflow becomes a graph with classify, refund, bug, sales, and done nodes. The piece people skip is the reducer: the function that decides how a node\'s update merges into current state. It matters enormously once two nodes run in parallel and both try to write.',
      },
      {
        heading: 'The four capabilities the docs lead with',
        body: 'Durable execution: the runtime serializes state to a checkpointer, SQLite, Postgres, Redis, or a custom backend, after each node, so a crash resumes at N+1 with exact state. LangGraph\'s docs name Klarna, Uber, and J.P. Morgan as production users, and the claim is not about the graph\'s shape, it is that graph plus checkpointing makes recovery cheap.\n\nStreaming: every node can yield partial output, and the graph emits per-node delta events as the run proceeds. Human-in-the-loop: pause before a critical node, surface state, accept edits, resume. Memory: short-term within a run, long-term across runs via the checkpointer plus a separate store, sometimes an external system like Mem0.',
      },
      {
        heading: 'Three topologies',
        body: 'Supervisor: a central router model dispatches to specialist subagents. LangGraph ships a create_supervisor helper in the langgraph-supervisor package, though the LangChain team\'s 2026 guidance is to do this through tool calls directly, for tighter control over what enters context.\n\nSwarm, or peer-to-peer: agents hand off to each other through a shared tool surface with no central router at all. Hierarchical: supervisors managing sub-supervisors, implemented as nested subgraphs, where an entire graph is used as a single node inside another graph.\n\nThe topology you pick doubles as an attribution problem. If the UI is going to say which agent produced which line, the graph has to carry that label all the way into the stream.',
      },
      {
        heading: 'Where it goes wrong',
        body: 'Checkpoints too small: serializing only conversation turns leaves tool state and memory writes unrecoverable, so a resume produces a run that silently disagrees with reality. Full state has to serialize, not a summary of it.\n\nNon-deterministic nodes: resume assumes the same inputs reproduce the same state update, so random seeds, wall-clock reads, and external API responses all need to be captured inside state rather than re-derived on replay.\n\nOver-conditional graphs: when every edge is conditional, you have built a state machine nobody can reason about, including the person who wrote it at 3 AM three weeks later. Prefer linear chains with occasional branches over a lattice of if-statements disguised as a graph.',
      },
      {
        heading: 'What a checkpoint buys the UI',
        body: 'Because state is serialized after every node, three product surfaces become possible that a stateless agent cannot offer. A run-detail view renders the actual typed state object, field by field, instead of a wall of text someone has to parse. A human-approval gate is durable: the pause lives in a checkpoint, not in memory, so a user can approve from a different device an hour later and the run continues exactly where it stopped.\n\nAnd per-node streaming means an activity log can say "checking refund policy" instead of "working...", because the node name and its partial output are both available events, not something reconstructed after the fact from a transcript.',
      },
      {
        heading: 'When the extra weight is not worth it',
        body: 'A stateless single-turn feature does not need a checkpointer at all, and adding one is pure overhead: extra serialization cost per node, a backend to run, a schema to version. LangGraph earns its cost once a run can plausibly fail partway through and resuming matters more than restarting.\n\nThe honest comparison is Agno or Mastra (Lesson 14.18) when instantiation speed matters more than durable graph state, or the actor model (Lesson 14.14) when the reliability problem is fault isolation between concurrent agents rather than recovering a single sequential run. Pick the checkpoint when the failure mode you are actually defending against is "died at step 38," not before.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p14-13-inline-checkpoint.svg',
        alt: 'Checkpoint written after every node',
        caption: 'A 40-step run dies at step 38. With a checkpoint after every node, resume loads state 37 and continues; without one, the run restarts at step 1.',
        diagramBrief: 'Cream paper, black ink, green accent for saved and red for lost. Horizontal row of 40 small numbered squares representing steps. Squares 1-37 filled solid (checkpointed), square 38 marked with a red X (failure). Below, two arrows: one labeled "no checkpoint: restart at 1" pointing back to square 1 in red, one labeled "checkpoint: resume at 38" pointing forward from square 37 in green.',
      },
      {
        src: '/lessons/p14-13-inline-topologies.svg',
        alt: 'Supervisor, swarm, and hierarchical topologies',
        caption: 'Three ways to arrange subagents: one router, peer handoffs, or nested subgraphs.',
        diagramBrief: 'Three small node-and-edge diagrams side by side on cream paper. Left: one central node with arrows fanning out to 4 leaf nodes, labeled "Supervisor". Middle: 4 nodes connected in a ring with bidirectional arrows, labeled "Swarm". Right: a big circle containing 3 small nodes (a subgraph), connected to 2 more subgraph circles, labeled "Hierarchical". Monochrome ink, one accent color per diagram.',
      },
    ],
    takeaways: [
      'Checkpoint after every node is what turns "retry" into "resume". Ship it and a 40-step failure costs one step, not forty.',
      'Because state is already serialized, a human-approval pause can be durable: the user approves an hour later on a different device and the run continues.',
      'Per-node streaming lets the activity log name the current node. That is the difference between "working..." and "checking the refund policy".',
      'If the checkpoint captures only messages and not tool state, resume produces a run that quietly disagrees with the world. Serialize the whole state object.',
    ],
    terms: [
      { term: 'State graph', gloss: '"agent as a flowchart"', meaning: 'Typed state plus nodes plus edges plus reducers, executed as a machine with an explicit shape.' },
      { term: 'Checkpointer', gloss: '"a save file"', meaning: 'The backend (SQLite, Postgres, Redis, custom) that serializes state after every node and enables resume by session id.' },
      { term: 'Reducer', gloss: '"a state merger"', meaning: 'The function that decides how a node\'s update combines with current state, critical once nodes run in parallel.' },
      { term: 'Conditional edge', gloss: '"a branch"', meaning: 'A transition chosen by evaluating a function of the current state rather than a fixed next step.' },
      { term: 'Subgraph', gloss: '"a nested workflow"', meaning: 'An entire graph used as a single node inside another graph, the mechanism behind hierarchical topologies.' },
      { term: 'Durable execution', gloss: '"resume from failure"', meaning: 'Restarting at the last successful node with exact state, instead of from the beginning of the run.' },
      { term: 'Supervisor', gloss: '"a router agent"', meaning: 'A central model that dispatches to specialist subagents, buildable with create_supervisor or plain tool calls.' },
      { term: 'Swarm', gloss: '"agents talking to agents"', meaning: 'Peer-to-peer handoffs through a shared tool surface, with no central router deciding who goes next.' },
      { term: 'Human-in-the-loop gate', gloss: '"an approval step"', meaning: 'A pause before a critical node that surfaces state to a person and resumes only after their edit or approval.' },
      { term: 'Non-deterministic node', gloss: '"randomness"', meaning: 'A node whose output depends on a seed, a clock, or an external API response that must be captured in state to replay correctly.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A graph has 8 nodes and checkpoints after each one. It fails at node 6. How many nodes does resume re-run, and how many does it skip?' },
      { level: 'medium', prompt: 'Two nodes run in parallel and both write to the same state field. Design the reducer that decides which write wins, and justify why "last write wins" is or is not the right default for a refund-amount field.' },
      { level: 'hard', prompt: 'A node calls an external pricing API and its result changes minute to minute. Explain what breaks on resume if the API response is not part of the checkpointed state, and how to fix it.' },
      { level: 'design', prompt: 'Sketch a run-detail view for a 6-node graph that failed at node 4. Show what a support engineer sees for nodes 1-3 (done), node 4 (failed), and nodes 5-6 (not yet run), using only fields the checkpointer already serializes.' },
    ],
    furtherReading: [
      { label: 'LangGraph overview', url: 'https://docs.langchain.com/oss/python/langgraph/overview', why: 'The reference docs for state, nodes, edges, and checkpointers.' },
      { label: 'langgraph-supervisor reference', url: 'https://reference.langchain.com/python/langgraph/supervisor/', why: 'The supervisor topology API, and the 2026 guidance to prefer direct tool calls for tighter context control.' },
      { label: 'AutoGen v0.4, Microsoft Research', url: 'https://www.microsoft.com/en-us/research/articles/autogen-v0-4-reimagining-the-foundation-of-agentic-ai-for-scale-extensibility-and-robustness/', why: 'The actor-model alternative to a checkpointed graph, useful when fault isolation matters more than durable resume.' },
      { label: 'Claude Agent SDK overview', url: 'https://platform.claude.com/docs/en/agent-sdk/overview', why: 'A session store and subagent model that solves a related but distinct isolation problem.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Is this run worth checkpointing',
      body: '- Can this run plausibly fail partway through a multi-step sequence? If no, skip the checkpointer.\n- Does resuming at the failure point matter more than the cost of restarting? If yes, checkpoint.\n- Does a human need to approve or edit state mid-run, possibly from a different device? If yes, checkpoint.\n- Is every node deterministic given its input state, or does it read a clock, a random seed, or a live API? If the latter, capture that value in state before checkpointing.\n- Would an auditor or a support engineer need to see the exact state at the point of failure? If yes, the checkpoint is your run-detail view for free.',
    },
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
      'Give every agent a private inbox and make messages the only way they interact. One agent crashing stops taking down the whole run, and concurrency stops being something you bolt on afterward.',
    readTime: '~10 min read',
    diagram: '/lessons/p14-14.svg',
    diagramCaption:
      'Actors with private state and inboxes, a runtime routing typed messages between them, and one handler failing without touching its neighbours.',
    whyItMatters:
      'Fault isolation is a UI taxonomy, not just a runtime property. In a synchronous stack, one agent failing gives exactly one error state: the run is dead, show a toast. Under the actor model, the runtime catches the failure inside that actor\'s handler, so the interface has to render a partial team instead: three agents done, one dead-lettered with a retry affordance, the rest still working. That is a per-actor status list, not a global spinner. Results also arrive out of order, so the layout needs stable slots rather than an append-only feed that reshuffles under the user.',
    learningObjectives: [
      'Describe the actor model: private state, an inbox, and a handler as the only unit of interaction.',
      'Explain why decoupling message delivery from handling gives fault isolation and native concurrency.',
      'Name AutoGen v0.4\'s three API layers and what each one is for.',
      'Design a per-actor status list for a team where one member fails mid-run.',
      'Decide when the actor model\'s fault isolation matters more than a checkpointed graph\'s durable resume.',
    ],
    sections: [
      {
        heading: 'The problem: synchronous stacks propagate everything',
        body: 'Most agent frameworks are synchronous. One agent produces, one consumes, both inside the same call stack. When something raises, the failure travels up that stack and kills the run. Concurrency gets bolted on afterward, and distributing the system across machines means rewriting it from underneath.\n\nAutoGen v0.4, from Microsoft Research in January 2025, rebuilt orchestration around the actor model specifically to break this. Each agent becomes an actor with a private inbox, messages are the only form of interaction between them, and the runtime decouples message delivery from message handling. That decoupling is the whole redesign, and everything else in this lesson follows from it.',
      },
      {
        heading: 'What an actor is',
        body: 'An actor has private state that nothing outside it can touch, an inbox that queues incoming messages, and a handler of the shape receive(message) returning effects. The permitted effects are deliberately small: reply, send to another actor, spawn a new actor, update its own state, or stop itself.\n\nTwo actors cannot share memory under any circumstance. They can only send messages. That single constraint is the entire design, and everything useful falls out of it: no shared mutable state means no lock contention, no partially observed writes, and no ambiguity about which actor owns which fact at any given moment.',
      },
      {
        heading: 'Why decoupling delivery from handling matters',
        body: 'In AutoGen\'s older v0.2 model, agent_a.chat(agent_b) blocks agent_a until agent_b returns, a synchronous call like any function call. In v0.4, send(agent_b, msg) drops the message into agent_b\'s inbox and returns immediately, with delivery and handling as separate steps. Three consequences follow directly.\n\nFault isolation: agent B crashing does not crash agent A, because the runtime catches the failure inside B\'s handler and decides what to do with it (log it, retry it, or dead-letter it). Natural concurrency: many messages are in flight at once, and actors work through their own inboxes concurrently rather than waiting in line. Distribution-ready: an inbox plus a transport is the same abstraction whether the actor lives in-process or on another host entirely.',
      },
      {
        heading: 'Team shapes and observability',
        body: 'Three API layers make up the surface. Core is the low-level actor framework: AgentRuntime, Agent, Message, Topic. AgentChat is the task-driven high-level API, with AssistantAgent, UserProxyAgent, and group chats. Extensions covers provider and tool integrations.\n\nThree team topologies sit on top: RoundRobinGroupChat rotates turns in a fixed order, SelectorGroupChat has a selector agent choose who goes next based on conversation state, and Magentic-One is the reference squad for web browsing, code execution, and file handling.\n\nOpenTelemetry is built in by default. Every message emits a span, and tool calls carry gen_ai.* attributes per the 2026 OTel GenAI semantic conventions, which is exactly where the per-agent attribution in a review UI should come from rather than being reconstructed after the fact.',
      },
      {
        heading: 'Status in 2026: maintenance mode',
        body: 'AutoGen v0.7.x is stable and fine for research and prototyping, but Microsoft has moved active development to the Microsoft Agent Framework, the production successor that entered public preview on October 1, 2025, with 1.0 GA targeted for the end of Q1 2026.\n\nThe framework itself is in maintenance mode, which is the right reason to learn the model rather than memorize the API surface. The actor model is the durable idea and it ports forward cleanly, the same way it ported forward from Erlang decades earlier into half a dozen other runtimes. Learn inbox, handler, fault isolation, and dead-letter, and the specific package name underneath it matters far less than it feels like it should right now.',
      },
      {
        heading: 'Fault isolation as a UI taxonomy',
        body: 'Compare the two worlds directly. A synchronous stack running four agents where one throws gives you exactly one state to design: run failed, show an error, offer start-over. An actor runtime running the same four agents gives you a spectrum: three done, one dead-lettered with a scoped retry, one still working, each rendered independently.\n\nThat spectrum needs a component a single error toast cannot express: a per-agent status list with four independent states, not one shared state for the whole run. And because message delivery is asynchronous, results land out of order, so the layout needs stable slots keyed to each agent rather than an append-only feed that reshuffles every time a new result arrives.',
      },
      {
        heading: 'Where it goes wrong',
        body: 'Inbox overflow: an actor that is slower than its incoming rate builds an unbounded queue, and nothing upstream notices until memory climbs or latency does. Cap inbox size and make a full inbox a dead-letter case, not a silent stall.\n\nOrdering assumptions: async delivery does not guarantee message order between two different senders, so any handler that assumes "message A arrives before message B" because A was sent first is wrong more often than a demo run reveals. Ordering must be encoded in the message itself, such as a sequence number, if it matters.\n\nDebugging by trace, not by breakpoint: a synchronous stack lets you step through a call chain. An actor system has no single call chain to step through, so OpenTelemetry spans and dead-letter logs are not optional tooling, they are the only way to reconstruct what happened.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p14-14-inline-actors.svg',
        alt: 'Actors with private inboxes exchanging messages',
        caption: 'No shared memory. Every interaction between actors is a message dropped into a private inbox.',
        diagramBrief: 'Cream paper, black ink, orange accent for a failing actor. Four labeled boxes (Reviewer, Linter, Security, Checklist), each with a small inbox icon attached. Arrows between boxes labeled "message" rather than direct lines touching the boxes, to show indirection through inboxes. The Reviewer box has a red broken outline with a "dead-letter" label pointing to a small tray icon beside it.',
      },
      {
        src: '/lessons/p14-14-inline-status.svg',
        alt: 'Per-agent status list after one actor fails',
        caption: 'Three agents complete, one lands in the dead-letter queue with a scoped retry, none of it takes down the run.',
        diagramBrief: 'Cream paper, four horizontal rows, one per agent (Reviewer, Linter, Security, Checklist). Each row has a status pill: "Complete" (green check) for Linter, Security, Checklist; "Dead-letter, retry" (red icon plus small retry button) for Reviewer. No global banner or spinner above the rows, only the four independent statuses.',
      },
    ],
    takeaways: [
      'Messages are the only interaction and no two actors share memory. Every guarantee in the model comes from that one constraint.',
      'Fault isolation means your UI needs a per-agent status list, not one global error state: three done, one dead-lettered with retry, two still running.',
      'Async delivery means results arrive out of order. Design stable slots, not an append-only feed that reshuffles under the user.',
      'AutoGen is in maintenance mode with Microsoft Agent Framework as the successor. Learn the actor model, not the import path.',
    ],
    terms: [
      { term: 'Actor', gloss: '"an agent"', meaning: 'A unit with private state, an inbox, and a handler; it shares no memory with any other actor.' },
      { term: 'Inbox', gloss: '"a mailbox"', meaning: 'The per-actor queue that holds incoming messages until the actor\'s handler processes them.' },
      { term: 'Runtime', gloss: '"the agent host"', meaning: 'The event loop that routes messages between actors and catches a handler\'s failure before it can propagate.' },
      { term: 'Topic', gloss: '"a channel"', meaning: 'A named publish-subscribe route that lets an actor broadcast to many listeners instead of addressing one peer.' },
      { term: 'Dead-letter queue', gloss: '"a failure log"', meaning: 'Where a message goes when its handler raises, held for a human or a retry policy to inspect later.' },
      { term: 'Fault isolation', gloss: '"let it crash"', meaning: 'The property that one actor\'s failure is contained inside its own handler and cannot take down another actor.' },
      { term: 'SelectorGroupChat', gloss: '"smart turn-taking"', meaning: 'A team shape where a selector agent picks who acts next based on the current conversation state.' },
      { term: 'RoundRobinGroupChat', gloss: '"taking turns"', meaning: 'A team shape where agents act in a fixed, repeating order regardless of conversation content.' },
      { term: 'gen_ai.* attributes', gloss: '"trace metadata"', meaning: 'The OpenTelemetry GenAI semantic-convention fields that tag spans with agent name and operation, the source of per-agent attribution in a UI.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Four actors run a review. One raises an exception inside its handler. List the four independent states your status list needs to render, one per actor.' },
      { level: 'medium', prompt: 'An actor\'s inbox is filling faster than it can process messages. Design the backpressure policy: does the sender block, does the message drop, or does it dead-letter? Justify the choice for a customer-facing review flow.' },
      { level: 'hard', prompt: 'Two actors send messages to a third at nearly the same time, and the third actor\'s handler assumes a specific arrival order. Explain what breaks and how a sequence number in the message payload fixes it.' },
      { level: 'design', prompt: 'Sketch a four-row status list for the reviewer, linter, security, and checklist actors from this lesson, after the reviewer dead-letters. Specify the retry affordance\'s scope: does it retry only the reviewer, or the whole run?' },
    ],
    furtherReading: [
      { label: 'AutoGen v0.4, Microsoft Research', url: 'https://www.microsoft.com/en-us/research/articles/autogen-v0-4-reimagining-the-foundation-of-agentic-ai-for-scale-extensibility-and-robustness/', why: 'The redesign post explaining why the actor model replaced the synchronous v0.2 orchestration.' },
      { label: 'LangGraph overview', url: 'https://docs.langchain.com/oss/python/langgraph/overview', why: 'The graph-shaped alternative, useful when durable resume matters more than fault isolation between concurrent agents.' },
      { label: 'OpenTelemetry GenAI semantic conventions', url: 'https://opentelemetry.io/docs/specs/semconv/gen-ai/', why: 'The span attribute standard AutoGen emits by default, and the source of per-agent attribution in a trace UI.' },
    ],
    shipIt: {
      kind: 'rubric',
      name: 'Actor-model fit check',
      body: '- Do your agents need to run concurrently with no shared state? Actor model fits.\n- Should one agent\'s crash never take down the others? Actor model fits.\n- Do you need durable, step-level resume of a single sequential run? A checkpointed graph (LangGraph) fits better.\n- Will the team eventually run across multiple machines? Actor model\'s inbox-plus-transport abstraction ports to distribution with the least rework.\n- Can you tolerate messages arriving out of order unless you explicitly sequence them? If not, add sequence numbers before you rely on ordering.',
    },
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
      'Four primitives, Agent, Task, Crew, Process, and two shapes. Crews are autonomous and exploratory. Flows are event-driven and deterministic. CrewAI\'s own docs say start with a Flow.',
    readTime: '~10 min read',
    diagram: '/lessons/p14-15.svg',
    diagramCaption:
      'Crew versus Flow: an LLM-routed team of roles on one side, an event-driven graph of @start and @listen steps on the other, with a Crew nested inside one Flow step.',
    whyItMatters:
      'The Crew-versus-Flow split is the replay question, and replay is a support surface. If a customer files a bug against a Crew run, there is no good run to diff the bad one against, so there is nothing for a run-detail view to render and nothing for on-call to read at 3 AM. A Flow gives you fixed topics, which means a per-step timeline with stable ids you can deep-link. The other design-visible primitive is output_pydantic on a Task: the difference between the next step reading a typed object your UI can render as fields, and it ad-libbing over free text.',
    learningObjectives: [
      'Name CrewAI\'s four primitives, Agent, Task, Crew, Process, and what each one owns.',
      'Distinguish Sequential from Hierarchical process, and compute the extra LLM calls Hierarchical adds.',
      'Explain the Crew-versus-Flow split and why CrewAI\'s own docs recommend starting with a Flow.',
      'Decide when output_pydantic on a Task changes what the next step, and the UI, can render.',
      'Identify the four CrewAI memory types and which one applies to a fact like "customer X is enterprise tier."',
    ],
    sections: [
      {
        heading: 'Four primitives, and that is the whole model',
        body: 'Agent is role plus goal plus backstory plus tools plus an optional model. The backstory matters more than decoration: it shapes tone, judgment, and when the agent decides to stop.\n\nTask is description plus expected_output plus an assigned agent, with optional context (upstream tasks whose outputs get passed in) and optional output_pydantic (a structured shape the response is validated against). Crew is the container: agents, tasks, process, plus optional memory, verbose, and manager_llm. Process is the execution strategy.\n\nAgents never see each other directly. Tasks reference agents, the Crew sequences tasks, and the Process decides who goes next. Everything else in the framework is configuration on top of those four nouns.',
      },
      {
        heading: 'Sequential versus Hierarchical, and the manager tax',
        body: 'Sequential runs tasks in declaration order and threads task N\'s output into task N+1 as context. Lowest cost, most predictable, correct whenever the order is fixed in advance.\n\nHierarchical adds a manager Agent that routes between specialists each round and can refuse or re-route. Use it with four or more specialists where the order genuinely depends on what a prior task returned.\n\nThe cost is concrete and worth the arithmetic: the manager is an extra LLM call before every specialist call, carrying the full task list plus every prior output. A five-task crew becomes six calls, with the largest prompt landing on that extra one, and total token cost can roughly triple on a five-step run. Consensus is a reserved name in the docs, not a shipped process. Do not build on it yet.',
      },
      {
        heading: 'Crews versus Flows: the framing the 2026 docs lead with',
        body: 'A Crew is LLM-driven autonomy: the framework picks the shape at runtime. Good for research, brainstorming, and first drafts, where the path taken is part of the answer. Cheap to prototype, hard to replay, hard to test.\n\nA Flow is an event-driven graph you own. @start marks the entry point, @listen(topic) marks a step that fires when another step emits that topic, and each step is plain Python that can call Crew.kickoff() internally. Observable, testable, deterministic.\n\nThe docs\' production recommendation is blunt: start with a Flow, then fold Crews in from inside Flow steps once autonomy earns its cost. The Flow supplies the audit trail, the Crew supplies the exploration. Compose the two rather than picking one forever.',
      },
      {
        heading: 'Tools: three ways to wire one in',
        body: 'The @tool decorator turns a pure function into a tool: the signature becomes the schema, the docstring becomes what the model reads. Best for one-off helpers with no state.\n\nA BaseTool subclass fits when the tool carries state (a client, a cache) or needs an explicit args schema and retries. Built-in toolkits like SerperDevTool, FileReadTool, and CodeInterpreterTool wire common integrations with one import each.\n\nStructured output uses Pydantic via output_pydantic on the Task, and CrewAI coerces the model\'s response or retries against the schema. Pair it with a tight expected_output string. Free text is fine for a draft an agent hands to another agent; a typed object is what a Flow step, or your UI, can actually render as fields instead of re-parsing.',
      },
      {
        heading: 'Four memory types',
        body: '| Type | Scope | Example |\n|---|---|---|\n| Short-term | Within one run, wiped after | A conversation buffer for the current kickoff |\n| Long-term | Across runs, vector-backed | Past briefs retrieved by similarity to the current task |\n| Entity | Keyed by customer or account | "Customer X is on the enterprise plan" |\n| Contextual | Retrieved at the moment it is needed | Pulling the right fact just before an agent acts on it |\n\nEnable all four on a Crew with memory=True, or configure per type. Backed by an embeddings provider you choose, defaulting to OpenAI and swappable to a local model. Validated against CrewAI 0.86 as of 2026-05; recent releases route these through one unified Memory entry point, though the four-way conceptual split still holds.',
      },
      {
        heading: 'The four failure modes',
        body: 'Prompt-bloat from backstories: a 2,000-word backstory across five agents burns the context budget before the first tool call fires. Keep backstories under 200 words and stop repeating house style five separate times.\n\nManager-LLM token tax: reaching for Hierarchical when Sequential would have done. Brittle handoffs: task N promises "an outline," produces four sections, and task N+1 was written to expect three, so the downstream agent ad-libs around the mismatch. Fix it with output_pydantic so the next step reads a typed object instead of guessing at prose.\n\nCrew-as-prod: shipping a free-form Crew with no Flow wrapper. Output variability is high, replay is impossible, and a tool with side effects can fire more times than intended. Anything that POSTs, DELETEs, or takes a payment belongs in a Flow step, never inside a bare Crew tool.',
      },
      {
        heading: 'When role-based teams fit, and when they do not',
        body: 'Three to six agents with named roles collaborating on drafting, reviewing, or brainstorming is the sweet spot, especially when the team would rather read role plus goal plus backstory than a graph definition.\n\nDeterministic DAGs with strict ordering belong in LangGraph instead; CrewAI\'s role framing is friction there, not help. Sub-second latency budgets rule out Hierarchical entirely, since it adds a round trip, and even Sequential serializes prompts carrying backstories and prior outputs that add up. A single-agent loop plus a tool registry is shorter than pulling in the framework at all.\n\nCrewAI is independent of LangChain, supports Python 3.10 through 3.13, and vendor benchmarks claim a speedup over LangGraph on QA workloads, but the methodology is unpublished, so treat framework-vendor numbers as directional, not proof.',
      },
      {
        heading: 'Replay as a support surface',
        body: 'The Crew-versus-Flow choice is not aesthetic, it decides what exists when something breaks. A customer files a bug against a free-form Crew and support gets one output blob and a timestamp: nothing to diff, nothing to deep-link, nothing for on-call to reconstruct at 3 AM.\n\nWrap the same three-role brief in a Flow and the run becomes a per-step timeline with stable ids: @start collect_sources, @listen(researched) draft (with the Crew nested one level in), @listen(drafted) edit, @listen(edited) publish. Each step shows its own duration and its own cost, and support can diff run 8c31 against run 8b02 and see exactly which step returned four sections instead of three. That diff is the entire reason the docs tell you to start with a Flow.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p14-15-inline-primitives.svg',
        alt: 'Agent, Task, Crew, Process as four nested primitives',
        caption: 'Agents never see each other. Tasks reference agents, the Crew sequences tasks, the Process decides who goes next.',
        diagramBrief: 'Cream paper, black ink. A large outer rounded rectangle labeled "Crew". Inside it, a "Process" label with a small gear icon. Inside the Crew, 3 "Task" boxes in a row, each with an arrow pointing to a small "Agent" box below it (role, goal, backstory listed in tiny text inside). One accent color highlighting the Process gear to show it decides task order.',
      },
      {
        src: '/lessons/p14-15-inline-crew-vs-flow.svg',
        alt: 'A free-form Crew run versus a Flow-wrapped run',
        caption: 'A Crew gives support one blob and a timestamp. A Flow gives a per-step timeline with stable ids to deep-link.',
        diagramBrief: 'Two panels side by side on cream paper. Left panel labeled "Crew only": one large opaque rectangle labeled "Output blob, 42s, $0.61" with a question mark icon, no internal structure. Right panel labeled "Flow wrapping the Crew": a vertical timeline of 4 labeled steps (collect_sources, draft, edit, publish) each with its own duration and cost, one step showing a nested small "Crew" box inside it. One accent color on the Flow panel to emphasize the deep-linkable steps.',
      },
    ],
    takeaways: [
      'Crew for exploration, Flow for production, and the docs mean it. Wrap the Crew in a Flow so there is a run you can replay and deep-link.',
      'output_pydantic on a Task is a UI decision: typed fields the next step and your detail view can render, instead of free text someone re-parses.',
      'Hierarchical adds an LLM call before every specialist call, carrying the full task list. Token cost can triple on five steps. Only pay when routing depends on output.',
      'Never put an irreversible action (POST, DELETE, payment) behind a Crew tool. A Crew can call it more times than you expected. Put it in a Flow step.',
    ],
    terms: [
      { term: 'Agent', gloss: '"a persona"', meaning: 'Role plus goal plus backstory plus tools; the backstory shapes tone, judgment, and stopping behaviour.' },
      { term: 'Task', gloss: '"a unit of work"', meaning: 'Description plus expected_output plus an assigned agent, with optional context and optional output_pydantic.' },
      { term: 'Crew', gloss: '"an agent team"', meaning: 'The container holding agents, tasks, a process, and optional memory settings.' },
      { term: 'Process', gloss: '"how the team runs"', meaning: 'The execution strategy: Sequential, Hierarchical, or the reserved-but-unshipped Consensus.' },
      { term: 'Flow', gloss: '"a deterministic workflow"', meaning: 'An event-driven graph of @start and @listen steps that you own, test, and can replay.' },
      { term: 'Backstory', gloss: '"persona flavor text"', meaning: 'The part of an Agent definition that measurably changes its tone, judgment, and when it stops.' },
      { term: 'expected_output', gloss: '"instructions"', meaning: 'The per-task contract string that tells the agent, and later an audit, exactly what shape to return.' },
      { term: 'output_pydantic', gloss: '"structured output"', meaning: 'A Pydantic model the task response is validated against, giving the next step typed fields instead of free text.' },
      { term: 'Manager LLM', gloss: '"a router"', meaning: 'The extra model call in Hierarchical process that picks the next task and can add roughly triple the token cost.' },
      { term: 'Entity memory', gloss: '"remembering the customer"', meaning: 'Facts keyed to a specific customer, account, or issue, surviving across separate kickoffs.' },
      { term: 'Long-term memory', gloss: '"the crew remembers"', meaning: 'Vector-backed memory retrieved by similarity to the current task, persisted across runs.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A five-task Crew switches from Sequential to Hierarchical. How many total LLM calls does one run cost now, and which call carries the largest prompt?' },
      { level: 'medium', prompt: 'Task N\'s expected_output says "an outline" and the model returns four sections when task N+1 expects three. Rewrite the contract using output_pydantic so the mismatch becomes a validation error instead of a downstream ad-lib.' },
      { level: 'hard', prompt: 'A Crew tool calls a payment API. Explain, using what you know about how Crews pick their own shape at runtime, why this is unsafe, and redesign it as a Flow step instead.' },
      { level: 'design', prompt: 'Sketch the support-engineer view for a bad run: one version backed by a free-form Crew, one backed by a Flow with 4 named steps. Specify exactly what each version lets the engineer click, diff, or deep-link.' },
    ],
    furtherReading: [
      { label: 'CrewAI documentation introduction', url: 'https://docs.crewai.com/en/introduction', why: 'The concepts overview and the docs\' own recommended production path.' },
      { label: 'CrewAI Flows guide', url: 'https://docs.crewai.com/en/concepts/flows', why: 'The event-driven shape, @start and @listen, in full.' },
      { label: 'CrewAI tools reference', url: 'https://docs.crewai.com/en/concepts/tools', why: '@tool, BaseTool, and the built-in toolkits, side by side.' },
      { label: 'CrewAI memory documentation', url: 'https://docs.crewai.com/en/concepts/memory', why: 'Short-term, long-term, entity, and contextual memory, and how they compose.' },
      { label: 'Schluntz and Zhang, Building Effective Agents (Anthropic, December 2024)', url: 'https://www.anthropic.com/research/building-effective-agents', why: 'The framing for when multi-agent collaboration helps and when it is friction.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Crew-or-Flow production check',
      body: '- Does this ship to production, or is it a research and brainstorming pass? Production means wrap it in a Flow.\n- Does any step POST, DELETE, or move money? That step is a Flow step, never a bare Crew tool.\n- Does the next task need a specific shape from this one? Add output_pydantic instead of trusting free text.\n- Are there four or more specialists whose order depends on prior output? Consider Hierarchical, and budget for roughly triple the token cost.\n- Would support need to diff a bad run against a good one? If yes, you need a Flow\'s stable step ids, not a Crew\'s single output blob.',
    },
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
      'Delegation is a tool call named transfer_to_<agent>. Guardrails run on input, output, or a specific tool, and whether they run in parallel or block is a latency-versus-token tradeoff you feel in the UI.',
    readTime: '~10 min read',
    diagram: '/lessons/p14-16.svg',
    diagramCaption:
      'A triage agent handing off via transfer_to_billing, with input, output, and tool guardrails wrapping the run and spans emitted at every boundary.',
    whyItMatters:
      'Handoff-as-a-tool means the transfer shows up as a tool call in the stream, which is the only reason a UI can attribute an answer to the right specialist. Without that boundary event you get one anonymous voice and no way to label who said what. The guardrail mode is a directly visible tradeoff: parallel guardrails stream the answer immediately and may have to retract it mid-render, which needs its own transition, not a jarring content swap. Blocking guardrails add a first-token delay you fill with a skeleton, and waste no tokens on a trip.',
    learningObjectives: [
      'Name the SDK\'s five primitives: Agent, Handoff, Guardrail, Session, Tracing.',
      'Explain why a handoff is modeled as a tool call rather than a hidden function.',
      'Distinguish input, output, and tool guardrails, and blocking mode from parallel mode.',
      'Compute the latency-versus-token tradeoff between a blocking and a parallel guardrail.',
      'Design the two different UI states a tripwire and a handoff each require.',
    ],
    sections: [
      {
        heading: 'Five primitives',
        body: 'Agent is model plus instructions plus tools plus handoffs. Handoff is delegation to another agent, represented to the model as a tool. Guardrail is validation on input, output, or tool invocation. Session is automatic conversation history persisted across turns, in SQLite, Redis, or a custom backend. Tracing is built-in spans for generations, tool calls, handoffs, and guardrails, on by default.\n\nThe SDK sits on top of the Responses API, and the whole surface is small enough to hold in your head at once, which is the point of it relative to the heavier graph frameworks covered earlier in this part.',
      },
      {
        heading: 'Handoffs are tools, and that is the useful part',
        body: 'The model sees transfer_to_billing_agent sitting in its tool list, indistinguishable in shape from any other tool. Calling it tells the runtime to copy the conversation context, or collapse it via the nest_handoff_history beta, initialize the target agent with its own instructions, and continue the run there.\n\nThis is the supervisor pattern, productized. The design consequence is that the handoff becomes an observable event in the stream with a name attached to it. A transcript can render a divider, relabel the speaker, and show which specialist owns the next block of text. Compare that to a monolithic prompt, where the same behaviour exists internally but stays invisible and unattributable to a user reading the output.',
      },
      {
        heading: 'Three guardrail flavors, two modes',
        body: 'Input guardrails run on the first agent\'s input and reject unsafe or out-of-scope requests before any main model call fires. Output guardrails run on the last agent\'s output, catching PII leaks, policy violations, and malformed responses. Tool guardrails run per function tool, validating arguments, checking permissions, and auditing execution.\n\nMode changes what the user experiences. Parallel is the default: the guardrail model runs alongside the main model, keeping tail latency low, but a trip discards work already paid for. Blocking (run_in_parallel=False) runs the guardrail first and wastes no main-model tokens on a trip, at the cost of a delay before anything appears at all.\n\nA trip raises a distinct tripwire exception, a different error class from a model failure, and it deserves a different component in the UI.',
      },
      {
        heading: 'Sessions and tracing',
        body: 'Session stores conversation history in a backend, and Runner.run(agent, input, session=session) loads and appends automatically. That single line is what lets a conversation survive a page reload without anyone hand-rolling a message table.\n\nTracing is on by default. Every generation, tool call, handoff, and guardrail emits a span, OPENAI_AGENTS_DISABLE_TRACING=1 opts out entirely, and add_trace_processor fans spans to a second backend alongside OpenAI\'s own. The span tree is the honest source for a run-detail view, since it already carries the parent-child structure a timeline component wants rather than something you would otherwise reconstruct from raw logs.',
      },
      {
        heading: 'Where it goes wrong',
        body: 'Handoff drift: agent A transfers to B, B transfers back to A, and the loop burns tokens while the UI shows activity that goes nowhere useful. Add a hop counter and refuse after N transfers, surfacing the refusal as its own distinct state rather than a generic error.\n\nGuardrail bypass: tool guardrails only fire on function tools. Built-in tools like the file reader and web fetch need a separate policy layer entirely, which is exactly the gap a security review will find first.\n\nOver-tracing: spans capture content by default, and sensitive content sitting inside a span is a leak waiting to happen. Pair tracing with the OTel GenAI content-capture rules: store the payload externally and reference it by id instead of inlining it into the span.',
      },
      {
        heading: 'The two components a mode change forces',
        body: 'Treating guardrail mode as a backend config value is the mistake. Blocking pushes latency in front of the first token, so it needs a skeleton state with an explicit label, "checking policy," not a blank screen. Parallel streams immediately and needs a designed retraction: freeze the partial text, fade it, replace it with the refusal state, rather than swapping content under the cursor the user is mid-sentence through.\n\nSame backend flag, same guardrail, two entirely different components on screen. Picking the mode without picking the matching component is how a support ticket ends up describing a UI bug that is actually a guardrail behaving exactly as configured.',
      },
      {
        heading: 'Comparing the delegation model to what came before',
        body: 'Compare this to CrewAI\'s Hierarchical process (Lesson 14.15) or LangGraph\'s supervisor topology (Lesson 14.13): all three solve the same delegation problem, but only the Agents SDK models the handoff itself as a first-class tool call the model chooses to invoke. That choice is why attribution here is nearly free, while a CrewAI manager\'s routing has to be inferred from its own separate LLM call, and a LangGraph supervisor\'s routing has to be read out of conditional-edge logic.\n\nThe tradeoff is scope: the SDK is deliberately lighter than either, with five primitives instead of a graph engine or a role-and-process model. Pick it when the product is genuinely OpenAI-first and the delegation shape is simple enough that a tool call is the whole mechanism you need.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p14-16-inline-handoff.svg',
        alt: 'A handoff rendered as a tool call in the stream',
        caption: 'transfer_to_billing_agent appears as a named tool call, which is what lets the transcript relabel the speaker.',
        diagramBrief: 'Cream paper, black ink. A chat transcript mockup: 2 messages from "Triage Agent", then a small pill labeled "tool call: transfer_to_billing_agent", then a divider line, then messages continuing under a new label "Billing Agent" in one accent color. Show the divider as the visual hinge between the two speakers.',
      },
      {
        src: '/lessons/p14-16-inline-guardrail-modes.svg',
        alt: 'Blocking guardrail versus parallel guardrail timelines',
        caption: 'Blocking delays the first token and wastes nothing on a trip. Parallel streams immediately and may need to retract.',
        diagramBrief: 'Two horizontal timelines stacked on cream paper. Top timeline "Blocking": a grey skeleton block labeled "checking policy" for 400ms, then the answer begins streaming. Bottom timeline "Parallel": the answer begins streaming at 0ms, then partway through a red marker labeled "tripwire" appears with a dotted arrow to a replacement refusal block, showing the retraction. One accent color for the tripwire moment in each.',
      },
    ],
    takeaways: [
      'A handoff is a tool call named transfer_to_<agent>, so the transfer is an event in the stream. That event is what lets your transcript attribute text to the right specialist.',
      'Parallel guardrails mean you may have to retract text the user is already reading. Design that transition deliberately; do not let content swap under the cursor.',
      'Blocking guardrails trade first-token latency for zero wasted tokens on a trip. Which one you pick decides whether you need a skeleton or a retraction.',
      'A tripwire is a policy refusal, not a model failure. Different cause, different recovery, different component.',
    ],
    terms: [
      { term: 'Agent', gloss: '"an LLM with instructions"', meaning: 'Model plus instructions plus tools plus handoffs, the SDK\'s core unit.' },
      { term: 'Handoff', gloss: '"a transfer"', meaning: 'Delegation to another agent, exposed to the model as a tool named transfer_to_<agent_name>.' },
      { term: 'Guardrail', gloss: '"a policy check"', meaning: 'Validation that runs on input, output, or a specific tool invocation.' },
      { term: 'Tripwire', gloss: '"a guardrail trip"', meaning: 'The distinct exception a guardrail raises on rejection, a different error class from a model failure.' },
      { term: 'Session', gloss: '"chat history"', meaning: 'Conversation history persisted in a backend and loaded automatically by Runner.run.' },
      { term: 'Tracing', gloss: '"logging"', meaning: 'Built-in spans over every generation, tool call, handoff, and guardrail, on by default.' },
      { term: 'Blocking guardrail', gloss: '"a sequential check"', meaning: 'run_in_parallel=False; the guardrail runs first, wasting no tokens on a trip but delaying the first token.' },
      { term: 'Parallel guardrail', gloss: '"a concurrent check"', meaning: 'The default mode; the guardrail runs alongside the main call, lowering latency but wasting tokens if it trips.' },
      { term: 'Hop counter', gloss: '"loop prevention"', meaning: 'A cap on transfers between agents that stops two specialists from bouncing a request back and forth forever.' },
      { term: 'nest_handoff_history', gloss: '"context trimming"', meaning: 'A beta option that collapses prior messages into a summary before transferring, instead of copying the full transcript.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A triage agent hands off to billing, which hands back to triage, which hands off to billing again. At what hop count should the SDK refuse, and what should the user see instead of a fourth transfer?' },
      { level: 'medium', prompt: 'An output guardrail runs in blocking mode and takes 600ms. Compute the user-perceived delay before the first token, and compare it to the same guardrail running in parallel mode where it trips 5% of the time.' },
      { level: 'hard', prompt: 'A tool guardrail validates arguments to a function tool, but the agent also has a built-in web-fetch tool with no guardrail coverage. Design the policy gap this creates and how you would close it.' },
      { level: 'design', prompt: 'Sketch the retraction transition for a parallel guardrail that trips after 40% of an answer has streamed. Specify what happens to the visible text: does it freeze, fade, or get replaced instantly, and what does the replacement state say?' },
    ],
    furtherReading: [
      { label: 'OpenAI Agents SDK documentation', url: 'https://openai.github.io/openai-agents-python/', why: 'The full primitive set: Agent, Handoff, Guardrail, Session, Tracing.' },
      { label: 'Claude Agent SDK overview', url: 'https://platform.claude.com/docs/en/agent-sdk/overview', why: 'The Claude-flavored counterpart, useful for comparing delegation models side by side.' },
      { label: 'Schluntz and Zhang, Building Effective Agents (Anthropic, December 2024)', url: 'https://www.anthropic.com/research/building-effective-agents', why: 'The reasoning for when handoffs and delegation earn their cost at all.' },
      { label: 'OpenTelemetry GenAI semantic conventions', url: 'https://opentelemetry.io/docs/specs/semconv/gen-ai/', why: 'The standard the Agents SDK\'s built-in tracing spans map onto.' },
    ],
    shipIt: {
      kind: 'rubric',
      name: 'Guardrail mode and component match',
      body: '- Blocking guardrail chosen: does the UI show a skeleton with a specific label ("checking policy"), not a blank screen? If not, fix the skeleton before shipping.\n- Parallel guardrail chosen: is there a designed retraction transition, distinct from a normal content update? If not, a trip will read as a rendering bug.\n- Every handoff: does the transcript relabel the speaker at the transfer point? If not, users cannot tell which specialist is answering.\n- Every tripwire: is it rendered as a policy refusal, with its own copy, rather than a generic "something went wrong"? If not, fix the copy before the mode.',
    },
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
    readTime: '~10 min read',
    diagram: '/lessons/p14-17.svg',
    diagramCaption:
      'An orchestrator spawning subagents with isolated context windows: only results return, so the orchestrator budget stays bounded while each subagent burns its own.',
    whyItMatters:
      'Subagent context isolation is why a long agent session does not degrade halfway through, and it is directly visible in what a UI can render. Only results come back to the orchestrator, so you get a bounded transcript plus a set of collapsed subagent rows, each expandable through get_subagent_messages(). PreToolUse is the actual permission gate, firing before a tool runs, which is where an approval modal has to sit if it is going to mean anything. And list_subkeys(session_id) is what turns a session into a tree you can render, instead of a flat log nobody can navigate.',
    learningObjectives: [
      'Distinguish the Anthropic client SDK (raw Messages API) from the Claude Agent SDK (the harness shape).',
      'Explain the two documented reasons to spawn a subagent: parallelization and context isolation.',
      'Name the session store\'s five operations and what list_subkeys enables.',
      'Identify PreToolUse as the only hook where an approval gate is a real gate, not a notification.',
      'Design a collapsed-row transcript for 20 parallel subagent lookups using only what the SDK returns.',
    ],
    sections: [
      {
        heading: 'Client SDK versus Agent SDK',
        body: 'The anthropic client SDK gives you the raw Messages API. You own the loop, the tool execution, the state, and everything that goes wrong in between each call.\n\nThe claude-agent-sdk package is the harness shape instead: built-in tool execution, MCP server connections, lifecycle hooks, subagent spawning, and a session store. It is the Claude Code loop exposed as an importable library, which is a useful way to read it. Watching Claude Code run is watching this exact surface render in a terminal. Building on the SDK means choosing which parts of that surface your own product exposes to a user, and which parts stay internal plumbing.\n\nThe SDK ships more than ten built-in tools out of the box: file read and write, shell, grep, glob, web fetch, and others, with custom tools registering through the standard tool-schema interface.',
      },
      {
        heading: 'Subagents: parallelization and context isolation',
        body: 'Anthropic documents two distinct reasons to spawn a subagent. Parallelization: independent work runs concurrently, so "find the test file for each of these 20 modules" becomes 20 parallel tasks instead of 20 sequential turns burning the same context window one after another.\n\nContext isolation: a subagent runs inside its own context window, and only its final result returns to the orchestrator. The orchestrator\'s budget stays preserved, which is why a long session stays coherent instead of degrading as the transcript grows past what a single window can hold cleanly.\n\nThe Python SDK added list_subagents() and get_subagent_messages() specifically for reading subagent transcripts after the fact. Those two calls are the difference between a subagent being an opaque black box in a UI and being a collapsed row a user can open on demand.',
      },
      {
        heading: 'Hooks: where the gates actually live',
        body: 'Registerable lifecycle hooks cover the whole run: PreToolUse and PostToolUse gate or audit tool calls, SessionStart and SessionEnd handle setup and teardown, UserPromptSubmit acts on user input before the model ever sees it, PreCompact runs before context compaction, Stop cleans up on exit, and Notification carries side-channel alerts.\n\nPreToolUse is the one to internalize above the rest. It fires before the tool executes, making it the only place an approval gate is a real gate rather than a confirmation shown after the write already happened. Rate limits, permission checks, and destructive-action confirmations all belong there, not one step later.\n\nPreCompact is the other design-relevant hook: it is the one chance to tell a user that the conversation is about to be summarized, before their earlier turns stop being verbatim text.',
      },
      {
        heading: 'Sessions and traces',
        body: 'The session store has protocol parity between Python and TypeScript: append(session_id, message) adds a turn, load(session_id) restores the conversation, list_sessions() enumerates every session, delete(session_id) cascades to subagent sessions automatically, and list_subkeys(session_id) lists the subagent keys nested under one session.\n\nThe CLI flag --session-mirror writes transcript turns to an external file as they stream, the practical way to debug a run that cannot be paused mid-flight.\n\nOTel spans active on the caller propagate into the CLI subprocess through W3C trace context headers, so a multi-process run shows up as one continuous trace rather than several orphaned fragments a backend has to stitch back together by hand.',
      },
      {
        heading: 'Claude Managed Agents: the hosted alternative',
        body: 'Claude Managed Agents (beta header managed-agents-2026-04-01) is the hosted path for long-running async work, with prompt caching and compaction built in rather than something you wire yourself. The trade is control for managed infrastructure: less to operate, less to customize.\n\nChoose it when a run genuinely spans hours rather than minutes and the operational cost of running your own harness outweighs the loss of low-level control. Choose the self-hosted SDK when you need custom hooks, a specific session backend, or subagent behaviour the managed product does not expose yet.',
      },
      {
        heading: 'Where it goes wrong',
        body: 'Subagent over-spawn: 100 subagents for 100 tiny tasks means spawn overhead dominates the actual work, and the UI turns into 100 rows of noise nobody scans. Batch instead, for example 20 tasks grouped into 4 batches of 5.\n\nHook creep: every team adds hooks, none ever removes one, and startup time balloons quietly over a year. Review the set on a schedule, the same way you would review middleware in a web server.\n\nSession bloat: sessions accumulate without bound. Use list_sessions() with an explicit expiry policy, and remember that delete cascades to subagent sessions, which is convenient right up until it is also how you lose more than you meant to in one call.',
      },
      {
        heading: 'The orchestrator budget, made visible',
        body: 'Run twenty file lookups inline inside one orchestrator and all twenty full tool transcripts land in the same window: the budget fills, compaction kicks in early, and a user scrolls past twenty blocks of raw output looking for the one line that answers their question.\n\nRun the same twenty lookups as isolated subagents and each one burns its own window, returning only a result line. The orchestrator context stays at roughly the same 12 percent used regardless of how many subagents ran, the transcript becomes twenty collapsed rows, and get_subagent_messages() opens any single one of them on demand. That difference, bounded orchestrator context versus a filling one, is the subagent model\'s actual product, not a backend implementation detail.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p14-17-inline-isolation.svg',
        alt: 'Twenty subagents with isolated context windows returning only results',
        caption: 'Only the result line returns to the orchestrator. Each subagent burns its own window, isolated from the rest.',
        diagramBrief: 'Cream paper, black ink. A central "Orchestrator" box at top with a slim context bar showing 12 percent filled. Below it, 20 small boxes in a grid, each labeled "Subagent" with its own filled context bar (varied fill levels), connected to the orchestrator by a thin arrow labeled "result only". One accent color on the orchestrator\'s thin bar to contrast with the fuller subagent bars.',
      },
      {
        src: '/lessons/p14-17-inline-hooks.svg',
        alt: 'The lifecycle hooks in run order, with PreToolUse marked as the real gate',
        caption: 'PreToolUse fires before the tool runs. Every hook after it is a notification about something that already happened.',
        diagramBrief: 'Cream paper, a horizontal timeline of 7 labeled points in order: SessionStart, UserPromptSubmit, PreToolUse, tool executes (drawn as a small gear icon), PostToolUse, PreCompact, Stop. PreToolUse is highlighted with an accent-colored box and a small padlock icon; the rest are plain black ink labels.',
      },
    ],
    takeaways: [
      'Subagents run in their own context window and return only results. That is why the orchestrator transcript stays bounded, and why subagent work renders as a collapsed row rather than inline noise.',
      'PreToolUse is the permission gate. An approval prompt anywhere later is a notification about something that already happened.',
      'list_subkeys(session_id) plus get_subagent_messages() are what let you render a session as an expandable tree instead of a flat log.',
      'Batch subagents rather than spawning one per tiny task. Spawn overhead dominates, and 100 rows is not a UI.',
    ],
    terms: [
      { term: 'Agent SDK', gloss: '"Claude Code as a library"', meaning: 'The harness shape: built-in tools, MCP connections, hooks, subagents, and a session store, all importable.' },
      { term: 'Subagent', gloss: '"a helper agent"', meaning: 'A child agent with its own context window whose result, not its transcript, returns to the orchestrator.' },
      { term: 'PreToolUse', gloss: '"a permission check"', meaning: 'The hook that fires before a tool executes, the only real place for an approval gate.' },
      { term: 'PreCompact', gloss: '"a summary warning"', meaning: 'The hook that fires before context compaction, the one chance to warn a user that earlier turns stop being verbatim.' },
      { term: 'Session store', gloss: '"chat history"', meaning: 'append, load, list_sessions, delete, and list_subkeys, operating over persisted conversation turns.' },
      { term: 'list_subkeys', gloss: '"see the subagents"', meaning: 'The call that lists the subagent session keys nested under one parent session, enabling a tree view.' },
      { term: 'W3C trace context', gloss: '"cross-process logging"', meaning: 'Headers that carry a parent span into a CLI subprocess so one run appears as one trace, not several.' },
      { term: 'Claude Managed Agents', gloss: '"hosted agents"', meaning: 'Anthropic\'s hosted alternative for long-running async work, trading control for managed infrastructure.' },
      { term: '--session-mirror', gloss: '"a debug log"', meaning: 'A CLI flag that writes session turns to an external file as they stream, for debugging a run you cannot pause.' },
      { term: 'MCP server', gloss: '"a tool plugin"', meaning: 'An external tool or resource source the agent connects to, separate from its built-in tools.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'An orchestrator runs 20 file lookups inline versus as isolated subagents. Which one keeps the orchestrator context bounded, and roughly what does the transcript look like in each case?' },
      { level: 'medium', prompt: 'Design a PreToolUse hook that rate-limits write_file to 5 calls per minute per session. What should the 6th call see: a queued state, a rejection, or something else?' },
      { level: 'hard', prompt: 'A team has added 12 hooks over a year and startup time has tripled. Design a quarterly hook-review process: what gets logged, and what is the bar for removing one?' },
      { level: 'design', prompt: 'Sketch the collapsed-row transcript for 20 parallel subagent file lookups. Specify what one row shows at rest, and what get_subagent_messages() reveals when a user expands it.' },
    ],
    furtherReading: [
      { label: 'Claude Agent SDK overview', url: 'https://platform.claude.com/docs/en/agent-sdk/overview', why: 'The library form of the Claude Code harness, in full.' },
      { label: 'Anthropic, Building agents with the Claude Agent SDK', url: 'https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk', why: 'Production patterns for subagents, hooks, and sessions.' },
      { label: 'Claude Managed Agents overview', url: 'https://platform.claude.com/docs/en/managed-agents/overview', why: 'The hosted alternative for long-running async work.' },
      { label: 'OpenAI Agents SDK documentation', url: 'https://openai.github.io/openai-agents-python/', why: 'A useful side-by-side counterpart with a lighter primitive set.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Subagent and hook review',
      body: '- Are any two subagent tasks independent enough to run in parallel? If yes, batch them instead of running inline.\n- Does the orchestrator context grow every time a subagent runs? If yes, the subagent is returning its transcript, not just its result.\n- Is every approval gate registered on PreToolUse, not PostToolUse? If not, the "approval" is a notification about a write that already happened.\n- Does PreCompact fire before the user loses verbatim access to earlier turns? If not, add a visible warning there.\n- How many hooks are currently registered, and when were they last reviewed? If the answer is "never," schedule the review.',
    },
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
      'Not every agent needs a graph framework. Agno optimizes Python instantiation to microseconds behind a stateless FastAPI backend. Mastra ships typed agents, tools, and workflows on the Vercel AI SDK, in the same TypeScript your frontend already runs.',
    readTime: '~10 min read',
    diagram: '/lessons/p14-18.svg',
    diagramCaption:
      'Two production shapes: a stateless session-scoped Python backend spawning a fresh agent per request, and a TypeScript runtime with Zod-typed tools sitting next to the app that renders them.',
    whyItMatters:
      'Mastra is the one that changes your day, because the agent and the component share a type system. A Zod tool schema is the same object your form validation and your rendered result use, so a tool-argument rename breaks the build instead of the run. Agno\'s stateless session-scoped shape has its own UI consequence: because a fresh agent is constructed per request and state lives in a database, resume and multi-device continuation are close to free, reconnect is just a session id. Neither gives durable graph checkpoints, so an interrupted run recovers to the last persisted session turn, not the last node.',
    learningObjectives: [
      'State Agno\'s published performance targets and the workload size where they actually matter.',
      'Name Mastra\'s three primitives and the scale of its Unified Model Router.',
      'Explain why a stateless session-scoped backend makes resume and multi-device continuation cheap.',
      'Compare a shared Zod schema against a schema that stops at an API boundary.',
      'Decide between Agno, Mastra, and LangGraph for a given stack and latency budget.',
    ],
    sections: [
      {
        heading: 'The problem: framework weight you did not ask for',
        body: 'LangGraph, AutoGen, and CrewAI are framework-heavy by design, because they are buying you graph semantics, actor semantics, or role templating respectively. Teams that want the agent loop, fast, inside the runtime they already operate reach for something thinner instead.\n\nAgno, Python, formerly Phi-data, and Mastra, TypeScript, are the 2026 pairing for that instinct. Both trade some framework-owned primitives for raw speed and a tighter fit to the surrounding stack. Neither is trying to be LangGraph, and the comparison between them is mostly about language fit and operational shape rather than raw capability.',
      },
      {
        heading: 'Agno: instantiation as the constraint',
        body: 'Agno\'s own positioning is blunt: "no graphs, chains, or convoluted patterns, just pure python." The published performance targets are roughly 2 microseconds per agent instantiation, about 3.75 KiB of memory per agent, and around 23 supported model providers.\n\nThe recommended production path is a stateless session-scoped FastAPI backend: each request constructs a fresh agent, and session state lives in a database rather than in process memory. Native multimodal support, text, image, audio, video, file, and agentic RAG are built in from the start.\n\nThose speed targets matter when thousands of short-lived agents run per second, chat fan-in or evaluation pipelines being the clearest cases. They matter close to zero when one agent runs for ten minutes, and picking Agno because "2 microseconds" sounds impressive is the mistake this lesson exists to prevent.',
      },
      {
        heading: 'Mastra: three primitives in the language your UI speaks',
        body: 'Mastra is TypeScript built on top of the Vercel AI SDK, with three primitives: Agents, Tools (Zod-typed), and Workflows. Its Unified Model Router covers more than 3,300 models across 94 providers as of March 2026.\n\nStorage is composite: memory, workflows, and observability can each go to a different backend, with ClickHouse recommended for observability at scale. Server adapters exist for Express, Hono, Fastify, and Koa, with first-class Next.js and Astro integration, and Mastra Studio runs locally at localhost:4111 for debugging a run without standing up a separate stack.\n\nAt 1.0 in January 2026 it reported more than 22,000 GitHub stars and more than 300,000 weekly npm downloads. Licensing is Apache 2.0 outside the ee/ directories, which are source-available, not Apache, so read those terms before forking.',
      },
      {
        heading: 'Picking one',
        body: '| Signal | Pick |\n|---|---|\n| Python backend, many short-lived agents, real perf needs | Agno |\n| TypeScript backend, Next.js or Vercel deploy, Zod tools | Mastra |\n| Durable state, explicit graph reasoning matters more than speed | LangGraph |\n| You want the provider\'s own productized shape | OpenAI or Claude Agent SDK |\n\nBoth Agno and Mastra integrate with Langfuse, Phoenix, and Opik, but Mastra Studio is first-party, a meaningful difference at 6 PM on a Friday when nobody wants to stand up an observability stack before finding out what broke.',
      },
      {
        heading: 'The three failure modes',
        body: 'Performance for its own sake: choosing Agno for a workload of one slow agent call per request, where instantiation overhead is a rounding error next to model latency measured in seconds. Measure your own instantiation cost before the 2-microsecond number means anything to your product.\n\nEcosystem lock-in: Mastra\'s Vercel-flavored integration is a genuine advantage on Vercel and a liability anywhere else. Be honest about where the product actually deploys before choosing it for that reason alone.\n\nLicense confusion: the ee/ directories are source-available, not open source. If a fork or a competing hosted product is on the roadmap, that distinction is the entire conversation, not a footnote.',
      },
      {
        heading: 'What durable resume actually means here',
        body: 'Neither runtime offers LangGraph-style per-node checkpoints. Agno\'s stateless session-scoped shape recovers to the last persisted session turn: a fresh agent reconstructed from database state, not a specific node in a graph. Mastra\'s Workflows give you step boundaries, but the resume guarantee is at the workflow-run level, not a serialized state object after every function.\n\nThe UI consequence is a smaller promise than a checkpointed graph makes. "Your conversation continues from where you left off" is honest. "Your run resumes at the exact step it failed" is not, unless you have specifically verified the workflow engine persists that granularly. Say the smaller true thing rather than the bigger one that only sounds better.',
      },
      {
        heading: 'The shared-type advantage, made concrete',
        body: 'Rename a tool argument in a Python backend, customer_id to something else, and the React component reading customerId keeps compiling. CI stays green. Nothing complains until a user triggers the tool in production and the result panel renders undefined, discovered by the person it broke for.\n\nIn Mastra, the Zod schema is one object imported by the tool, the form validation, and the result renderer. Rename the field and tsc fails in three places before the change is committed. The failure moved from runtime to build time, which is the entire pitch for choosing a TypeScript-native runtime when the frontend is already TypeScript.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p14-18-inline-shapes.svg',
        alt: 'Agno stateless FastAPI backend versus Mastra typed TypeScript runtime',
        caption: 'Two production shapes: a fresh agent per request backed by a database, and a runtime sharing one type system with its UI.',
        diagramBrief: 'Cream paper, two side-by-side panels. Left panel "Agno": a request arrow into a small "fresh agent" icon, then into a database cylinder icon labeled "session state". Right panel "Mastra": a "Zod schema" box with three arrows fanning out to "Tool", "Form validation", and "Result renderer" boxes, showing one shared type feeding all three. One accent color per panel.',
      },
      {
        src: '/lessons/p14-18-inline-rename.svg',
        alt: 'A tool argument rename caught at build time versus at runtime',
        caption: 'A shared Zod type fails the build in three places. A schema that stops at the API boundary fails silently in production.',
        diagramBrief: 'Cream paper, two vertical timelines. Left "No shared type": commit, CI green checkmark, deploy, then a red "prod: undefined" marker discovered by a user icon. Right "Shared Zod type": commit attempt, immediately 3 red "tsc error" marks before the commit lands. One accent color marking the moment of detection in each timeline.',
      },
    ],
    takeaways: [
      'Mastra puts the agent in the same type system as the component. A Zod tool schema is shared with your form validation and your rendered result, so a schema change fails the build, not the run.',
      'Agno\'s stateless session-scoped FastAPI shape makes resume and multi-device continuation cheap: a fresh agent per request, state in a DB, reconnect by session id.',
      'Neither gives you durable per-node checkpoints. An interrupted run recovers to the last persisted session turn, so do not promise step-level resume in the UI.',
      'The 2 microsecond instantiation target only matters at thousands of short-lived agents per second. For one ten-minute run it is noise.',
    ],
    terms: [
      { term: 'Agno', gloss: '"a fast python agent runtime"', meaning: 'A runtime built for near-zero instantiation cost, served through a stateless session-scoped backend.' },
      { term: 'Mastra', gloss: '"typescript agents"', meaning: 'A TypeScript runtime on the Vercel AI SDK with Agents, Zod-typed Tools, and Workflows.' },
      { term: 'Stateless session-scoped', gloss: '"no memory between requests"', meaning: 'A fresh agent constructed per request, with all continuity held in a database keyed by session id.' },
      { term: 'Unified Model Router', gloss: '"multi-provider access"', meaning: 'One client interface covering more than 3,300 models across 94 providers.' },
      { term: 'Composite storage', gloss: '"multiple databases"', meaning: 'Sending memory, workflow state, and observability data each to a different backend by design.' },
      { term: 'Mastra Studio', gloss: '"a local debugger"', meaning: 'A first-party UI at localhost:4111 for introspecting agent runs without a separate observability stack.' },
      { term: 'Source-available', gloss: '"open source"', meaning: 'A license that permits reading the source but restricts commercial use, distinct from Apache or MIT.' },
      { term: 'Zod-typed tool', gloss: '"a function tool"', meaning: 'A tool whose argument schema is a Zod object shared with the rest of the TypeScript codebase.' },
      { term: 'Workflow (Mastra)', gloss: '"a pipeline"', meaning: 'A composed sequence of typed steps, with resume guarantees at the run level, not per-step checkpoints.' },
      { term: 'Instantiation cost', gloss: '"startup time"', meaning: 'The time and memory it takes to construct one agent object, the specific number Agno optimizes.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A chat product spins up 4,000 short-lived agents per second for fan-in triage. Explain why Agno\'s microsecond instantiation target matters here and would not matter for a single 10-minute research agent.' },
      { level: 'medium', prompt: 'Compute the practical difference between Agno\'s stateless session-scoped resume and a LangGraph checkpoint: what does each one actually let a user resume, and from what point?' },
      { level: 'hard', prompt: 'A team plans to fork Mastra and sell a hosted version. Identify which directories in the repository need a license review before that plan proceeds, and why.' },
      { level: 'design', prompt: 'Sketch the error state a user sees when a Python-backend tool argument rename goes undetected until production, versus the error a developer sees at commit time with a shared Zod schema. Specify who sees each state and when.' },
    ],
    furtherReading: [
      { label: 'Agno Agent Framework documentation', url: 'https://www.agno.com/agent-framework', why: 'The published performance targets and the FastAPI production path.' },
      { label: 'Mastra documentation', url: 'https://mastra.ai/docs', why: 'Primitives, server adapters, and the Unified Model Router in detail.' },
      { label: 'LangGraph overview', url: 'https://docs.langchain.com/oss/python/langgraph/overview', why: 'The stateful-graph alternative, useful when per-node checkpoints matter more than instantiation speed.' },
      { label: 'Comet Opik product page', url: 'https://www.comet.com/site/products/opik/', why: 'One of the observability integrations both Agno and Mastra cite, for comparing trace tooling.' },
    ],
    shipIt: {
      kind: 'rubric',
      name: 'Agno vs Mastra vs LangGraph picker',
      body: '- Python backend with thousands of short-lived agents per second: Agno.\n- TypeScript backend, Next.js or Vercel deploy, frontend and agent sharing types: Mastra.\n- Need durable per-node checkpoints and explicit graph reasoning: LangGraph, not either of these.\n- Promising "resumes at the exact failed step" without verifying the runtime persists that granularly: stop, rewrite the copy to the smaller true claim.\n- Planning a fork or a competing hosted product: read the license (ee/ in Mastra) before writing code.',
    },
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
