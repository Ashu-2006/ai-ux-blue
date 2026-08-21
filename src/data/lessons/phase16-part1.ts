import type { Lesson } from '@/lib/lessons';

// Phase 16 · Part 1 · Why more than one agent (lessons 16.01, 16.04-16.06, 16.08-16.09)
export const phase16Part1: Lesson[] = [
  {
    id: 'p16-01-why-multi-agent',
    phase: 'Phase 16 · Multi-Agent and Swarms',
    part: 'Part 1 · Why more than one agent',
    index: '16.01',
    title: 'The single-agent ceiling: three failures, not one',
    oneLiner:
      'One agent stops working for three separate reasons: the context window saturates, the system prompt tries to be four people, and everything runs serially. Each reason has a different fix, and only one of them is "add more agents".',
    readTime: '~8 min read',
    whyItMatters:
      'The moment you go from one agent to three, your run surface changes shape. One agent is one transcript, so a single streaming pane covers it. Three agents are three concurrent transcripts with three independent states, and the user now needs to know who is working, who is blocked, and what the whole run is waiting on. That is a per-agent status row plus a roll-up state, not a bigger spinner. It also changes the failure story: every agent boundary is a lossy compression step, so "the coder ignored the research" is now a legible bug you have to render, not a mystery.',
    sections: [
      {
        heading: 'The problem: the agent does not get dumber, the task gets wider',
        body: 'Point a working single agent at a real codebase: 200 files, three languages, tests that need infrastructure, and external API docs to read first. It chokes. The model did not degrade. The task exceeded what one loop holds.\n\nBy turn 30 the window carries 150k tokens of file contents, command output, and its own prior reasoning. Details from turn 5 are gone. Reading 50 files blows past 200k tokens outright. This is a capacity wall, and no prompt engineering moves it.',
      },
      {
        heading: 'Three failures wearing one coat',
        body: 'Context saturation: tool results pile up until the early turns are effectively deleted. Role confusion: a system prompt that says "you are a researcher, coder, reviewer, and tester" produces an agent that half-researches, half-codes, and never finishes reviewing. Sequential bottleneck: it reads file A, then B, then C, three serial calls where three parallel ones would do.\n\nThey look like one symptom (the agent is bad at this) and they have three different fixes: split the context, split the prompt, or fan out. Knowing which one you have decides the architecture.',
      },
      {
        heading: 'The spectrum, not the switch',
        body: 'Multi-agent is not binary. Single agent: one loop, one prompt. Subagents: a parent spawns children for scoped subtasks and keeps its own context clean, which is what Claude Code does with Task. Pipeline: A\'s output is B\'s input, good for research to code to review to test. Team: parallel agents on a shared message bus with an orchestrator. Swarm: many near-identical agents pulling work off a queue, no fixed orchestrator.\n\nProduction systems sit at specific points on this line. Devin runs a planner, a coder, and a browser agent with separate contexts. ChatGPT Deep Research fans out parallel search agents and synthesizes. Top SWE-bench systems use a researcher, a planner, and a coder; single-agent entries score lower.',
      },
      {
        heading: 'The four patterns you will actually wire',
        body: 'Pipeline: staged transformation, simple to reason about, one broken stage blocks everything downstream. Fan-out and fan-in: split independent subtasks, merge results, good when the work genuinely decomposes. Orchestrator-worker: a smart lead decides, delegates, and synthesizes, and the lead is itself an agent with spawn tools. Peer swarm: no center, decisions emerge from interaction, scales to many agents and is the hardest to debug.\n\nPick by the shape of the task, not by the framework you already installed. Ordering requirement points at pipeline. Independence points at fan-out. Unknown decomposition points at orchestrator.',
      },
      {
        heading: 'The cost you are actually paying',
        body: 'Every agent boundary is a lossy compression step: agent A\'s full context becomes one summary message for agent B. Coordination logic is its own bug surface. Latency floors at N serial calls and rises if agents talk back and forth. Cost multiplies because each agent burns tokens independently.\n\nThe rule of thumb from the source is blunt and worth keeping: if a task takes fewer than 20 tool calls and fits in 100k tokens, stay single-agent. Debugging goes from reading one conversation to tracing messages across five, and that shift lands on you twice, once in the code and once in the UI you have to build so anyone else can read the run.',
      },
    ],
    takeaways: [
      'Three distinct failures hide behind "the agent is bad at this": context saturation, role confusion, and serial execution. Diagnose which one before splitting anything.',
      'Under 20 tool calls and under 100k tokens of working data, stay single-agent. The coordination overhead costs more than it buys.',
      'Every agent boundary is a lossy compression step, so "the second agent ignored the first" is a structural bug, not bad luck.',
      'Three agents means three concurrent states, so the run surface is per-agent status rows plus one roll-up, not a larger spinner.',
    ],
    terms: [
      { term: 'Single-agent ceiling', meaning: 'The point where one loop, one window, and one prompt stop covering the task.' },
      { term: 'Context saturation', meaning: 'Tool results filling the window until early turns are effectively lost.' },
      { term: 'Role confusion', meaning: 'One system prompt naming several jobs, producing an agent that does all of them shallowly.' },
      { term: 'Subagent', meaning: 'A child agent spawned for a scoped subtask that reports a summary back to its parent.' },
      { term: 'Fan-out / fan-in', meaning: 'Splitting independent subtasks across parallel agents, then merging their results.' },
      { term: 'Lossy boundary', meaning: 'The compression that happens when one agent\'s full context becomes a single message for the next.' },
    ],
    demoCaption:
      'Same four-stage job, one agent versus three specialists. Watch what the context window holds at the review step. The single agent is reviewing code while still carrying 50k tokens of documentation it read an hour ago.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Research to code to review · one job',
      badLabel: 'One agent',
      goodLabel: 'Three specialists',
      badLines: [
        'one system prompt: researcher, coder, reviewer',
        'turn 30: 150k tokens of accumulated tool results',
        'review step still carries the docs it read at turn 4',
        'reads file A, then B, then C, serially',
        'turn 5 constraints already evicted',
      ],
      goodLines: [
        'three prompts, each naming one job',
        'reviewer context: the diff and the spec, nothing else',
        'researcher\'s 50k tokens never enter the reviewer',
        'independent reads run concurrently',
        'each handoff is one explicit artifact',
      ],
      badCaption:
        'The window is shared by four jobs, so quality drops at exactly the stage that needs the most attention. The reviewer is reasoning over documentation it no longer needs and has lost the constraint set from turn 5.',
      goodCaption:
        'Splitting the prompt is what buys the quality; splitting the context is what buys the headroom. Total token spend goes up because three agents each pay their own way, but every stage now reads a clean window scoped to one artifact.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: '"the agent is bad at this" is three different bugs.',
        body:
          '"the agent is bad at this" is three different bugs.\n\ncontext saturation: turn 30 holds 150k tokens of tool results, turn 5 is gone.\nrole confusion: one prompt naming four jobs does all four shallowly.\nsequential bottleneck: file A, then B, then C, three serial calls.\n\neach has a different fix. only one of them is "add more agents".',
      },
      {
        kind: 'X · design angle',
        hook: 'one agent is one transcript. three agents is an attribution problem.',
        body:
          'one agent is one transcript. three agents is an attribution problem.\n\nthe user needs to know who is working, who is blocked, and what the run as a whole is waiting on.\n\nthat is a per-agent status row plus one roll-up state. not a bigger spinner.\n\nand every agent boundary is a lossy compression step, so "the coder ignored the research" is a bug you now have to show, not hide.',
      },
      {
        kind: 'X · one-liner',
        hook: 'under 20 tool calls and under 100k tokens, stay single-agent.',
        body:
          'under 20 tool calls and under 100k tokens, stay single-agent.\n\nmulti-agent costs you N serial calls of latency, N agents of tokens, and a debugging story that goes from reading one conversation to tracing five.',
      },
    ],
    source: {
      label: 'Full lesson: 01 01-why-multi-agent',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/16-multi-agent-and-swarms/01-why-multi-agent',
    },
  },
  {
    id: 'p16-04-primitive-model',
    phase: 'Phase 16 · Multi-Agent and Swarms',
    part: 'Part 1 · Why more than one agent',
    index: '16.04',
    title: 'Four primitives read every framework in one paragraph',
    oneLiner:
      'Agent, handoff, shared state, orchestrator. That is the whole design space. AutoGen, LangGraph, CrewAI, the OpenAI Agents SDK, and Microsoft Agent Framework are just different defaults on those four axes.',
    readTime: '~8 min read',
    diagram: '/lessons/p16-04.svg',
    diagramCaption:
      'The four primitives and the axis each one sets: agent, handoff, shared state, orchestrator.',
    whyItMatters:
      'Three of the four primitives are stateless, which tells you exactly where your UI\'s truth lives. Agents are pure functions of prompt and tools. Handoffs are function calls. Orchestrators are schedulers. Shared state is the only thing that persists, so it is the only thing you can render, diff, replay, or attribute a claim to. That makes the orchestrator axis a product decision, not a framework preference: LLM-routed means the next step is unpredictable, so you need a live "deciding who is next" state and a route trace. Pinned in code means you can render the graph up front and show progress against it.',
    sections: [
      {
        heading: 'The problem: a new framework every six months',
        body: 'AutoGen in 2023. CrewAI in 2024. LangGraph and OpenAI Swarm in 2024. Google ADK in April 2025. Microsoft Agent Framework hit RC in February 2026. Every release claims to be the right abstraction.\n\nLearning them one at a time burns you out, partly because the vocabulary is deliberately different. One framework calls its shared memory a blackboard, another a message pool, a third a StateGraph. It reads like churn. It is not. Underneath the naming, four primitives have been stable the whole time.',
      },
      {
        heading: 'The four',
        body: 'Agent: a system prompt plus a tool list. Stateless, so every run starts from the prompt and the current message history. Two agents with the same prompt and tools are interchangeable.\n\nHandoff: a structured transfer of control. Mechanically either a tool call that returns a new agent or a graph edge that follows a condition.\n\nShared state: any structure more than one agent can read, and sometimes write. Message pool, blackboard, key-value store, vector memory.\n\nOrchestrator: whoever decides who speaks next. An explicit graph, an LLM speaker-selector, the last speaker\'s handoff call, or a scheduler over a queue.',
      },
      {
        heading: 'The mapping table is short on purpose',
        body: 'OpenAI Swarm and the Agents SDK: Agent(instructions, tools), handoff is a tool returning an Agent, shared state is the caller\'s problem, the orchestrator is the LLM\'s next handoff call. AutoGen v0.4 and AG2: ConversableAgent, speaker-selector on a GroupChat, a message pool, a selector function that is LLM or round-robin.\n\nCrewAI: Agent(role, goal, backstory), Process.Sequential or Hierarchical, Task outputs chained, a manager LLM or a static order. LangGraph: a node function, a graph edge plus condition, a StateGraph reducer, and a deterministic graph. Google ADK: an agent plus an A2A card, an A2A task, A2A artifacts, and the host decides.\n\nSurface syntax diverges wildly. The knobs are identical.',
      },
      {
        heading: 'The stateless insight, and where the bugs live',
        body: 'Every primitive except shared state is stateless. That is not a trivia fact, it is a debugging map. Shared state is the only stateful thing in the system, so every interesting bug is there: memory poisoning, message ordering, versioning, write contention.\n\nFrameworks that hide shared state (Swarm) push the problem to you. Frameworks that centralize it (a LangGraph checkpoint, an AutoGen pool) make it inspectable and shift the coordination cost onto the shared-state implementation. Neither is free; the choice decides whether you can replay a run.',
      },
      {
        heading: 'Three questions instead of a framework bake-off',
        body: 'Does the orchestrator trust the LLM to route (Swarm) or pin routing in code (LangGraph)? Is shared state full-history (GroupChat) or projected (a StateGraph reducer)? Can agents modify each other\'s prompts (a CrewAI manager) or only hand off (Swarm)?\n\nThose three answer roughly 80 percent of the fit question. Everything else, memory strategy, human-in-the-loop approval on a handoff, per-agent token budgets, tracing for replay, is implementable on top of the primitives. None of it is a new primitive, which is why a new release rarely changes your design.',
      },
    ],
    takeaways: [
      'Four primitives, four axes: agent, handoff, shared state, orchestrator. Read any new framework by naming its default on each.',
      'Shared state is the only stateful primitive, so it is the only surface you can render, diff, replay, or attribute a claim to.',
      'LLM-routed orchestration means the next step is unknowable in advance, so the UI needs a live routing state, not a pre-drawn progress bar.',
      'Three questions (who routes, full or projected state, can prompts be edited) settle most framework choices without a bake-off.',
    ],
    terms: [
      { term: 'Agent', meaning: 'A system prompt plus a tool list, stateless between runs.' },
      { term: 'Handoff', meaning: 'A structured transfer of control, either a tool returning an agent or a conditional graph edge.' },
      { term: 'Shared state', meaning: 'Any structure multiple agents can read, and the only stateful part of the system.' },
      { term: 'Orchestrator', meaning: 'Whatever decides who speaks next: a graph, an LLM selector, a handoff call, or a queue scheduler.' },
      { term: 'Projected state', meaning: 'A role-scoped view of shared state rather than the full history.' },
      { term: 'StateGraph reducer', meaning: 'LangGraph\'s function that folds global state into a node-specific slice.' },
    ],
    demoCaption:
      'The same three-agent pipeline under three orchestrators. Agents and shared state are identical across all three runs. Only who picks next changes, and that one axis decides whether you can draw the run before it happens.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Research to write to review · one pipeline',
      badLabel: 'LLM-routed',
      goodLabel: 'Graph-pinned',
      badLines: [
        'the active agent calls a handoff tool',
        'next step unknown until the call returns',
        'same input can route differently across runs',
        'a researcher that decides it is done skips agents',
        'replay is approximate, not exact',
      ],
      goodLines: [
        'edges declared at build time with conditions',
        'the full path is renderable before the run starts',
        'same input, same route, every time',
        'progress is a position on a known graph',
        'replay is exact from the checkpoint',
      ],
      badCaption:
        'LLM routing buys adaptability and costs you the ability to draw the run in advance. Your progress component cannot show step 3 of 5, because there may not be a step 5, so it has to show a live route trace instead.',
      goodCaption:
        'Pinning routing in code makes the graph a design asset: you can render it up front and mark position as the run advances. You pay for it when the task needs a decomposition nobody wrote an edge for.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'every multi-agent framework is four knobs.',
        body:
          'every multi-agent framework is four knobs.\n\nagent: prompt + tools.\nhandoff: a tool returning an agent, or a graph edge.\nshared state: pool, blackboard, kv, vector.\norchestrator: graph, LLM selector, handoff call, or queue.\n\nAutoGen, LangGraph, CrewAI, Agents SDK, Microsoft Agent Framework. same four knobs, different defaults.\n\nread the next release in one paragraph.',
      },
      {
        kind: 'X · design angle',
        hook: 'three of the four primitives are stateless. that tells you what you can render.',
        body:
          'three of the four primitives are stateless. that tells you what you can render.\n\nagents are functions. handoffs are calls. orchestrators are schedulers.\n\nshared state is the only thing that persists, so it is the only thing you can diff, replay, or attribute a claim to.\n\nframeworks that hide it push that problem to your UI.',
      },
      {
        kind: 'X · one-liner',
        hook: 'who routes decides whether you can draw the run before it happens.',
        body:
          'who routes decides whether you can draw the run before it happens.\n\nLLM-routed: no step count, so the UI shows a live route trace.\ngraph-pinned: the path is known, so progress is a position on a diagram.\n\nsame primitives. completely different progress component.',
      },
    ],
    source: {
      label: 'Full lesson: 04 04-primitive-model',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/16-multi-agent-and-swarms/04-primitive-model',
    },
  },
  {
    id: 'p16-05-supervisor',
    phase: 'Phase 16 · Multi-Agent and Swarms',
    part: 'Part 1 · Why more than one agent',
    index: '16.05',
    title: 'Supervisor pattern: 90 percent of the win is a fresh window',
    oneLiner:
      'One lead plans and delegates, workers execute in their own contexts and report back. Anthropic measured plus 90.2 percent over single-agent Opus 4 on internal research evals, and 80 percent of the BrowseComp variance was explained by token usage alone.',
    readTime: '~8 min read',
    diagram: '/lessons/p16-05.svg',
    diagramCaption:
      'A lead decomposing one query into three sub-questions, workers running in parallel contexts, and one synthesis step.',
    whyItMatters:
      'The supervisor pattern is where multi-agent progress UI stops being optional. Wall-clock time is max of the worker times plus plan plus synthesis, so the run has a shape: a planning phase where nothing is parallel yet, a fan-out where three things move at once, and a synthesis that blocks on the slowest worker. That is three distinct states in one component, and the middle one needs per-worker rows with their own sub-question and status. The synthesis conflict is the schema detail: two workers returning contradictory facts must render as a disagreement, because silently picking one side is the failure the user can never detect.',
    sections: [
      {
        heading: 'The problem: research is what single agents fail at',
        body: 'Ask one agent "what changed in multi-agent systems between 2023 and 2026." It reads five papers serially, fills half its window with their text, then has to reason across all of them at once. By paper five it has forgotten paper one. It cannot parallelize, so latency is the sum of the reads.\n\nThe supervisor pattern fixes the shape. One lead plans the search, delegates each sub-question to a worker, and synthesizes. Each worker gets its own 200k window for one narrow question. The lead never sees the raw papers, only the summaries.',
      },
      {
        heading: 'Three mechanisms, one of which dominates',
        body: 'Fresh context per subagent: a worker on one sub-question does not carry the 40k tokens the lead spent planning. Specialization via prompt: the lead\'s prompt is "decompose and synthesize", not "research", and each worker\'s is narrow. Parallelism: workers run concurrently, so wall-clock is roughly max of the worker times plus plan plus synthesis, not the sum.\n\nAnthropic\'s production Research system runs Opus 4 as lead with Sonnet 4 subagents and reports plus 90.2 percent on internal research evals against a single Opus 4. The same post reports that 80 percent of the BrowseComp variance is explained by token usage alone. Fresh context is the main mechanism; the rest is margin.',
      },
      {
        heading: 'The production lessons that survived to 2026',
        body: 'Scale effort to query complexity: simple queries get one agent and 3 to 10 tool calls, complex ones get 10 or more agents. Critically, the lead estimates this, not the caller, which means the number of agents is a runtime value your UI cannot hardcode.\n\nBroad then narrow: decompose into broad sub-questions first, then spawn more workers per sub-question if depth is warranted. Rainbow deployments: agents are long-running and stateful, so blue-green does not work; new versions roll out gradually while old ones drain. Token usage dominates: multi-agent runs roughly 15 times the tokens of single-agent, so only run it when the task value covers the bill.',
      },
      {
        heading: 'The graph-native turn',
        body: 'LangGraph originally shipped a langgraph-supervisor library with a high-level create_supervisor helper. In 2025 LangChain moved the recommendation to implementing the supervisor pattern via tool-calling directly.\n\nThe reason is worth keeping: tool calls give more control over what the supervisor sees. That is context engineering as an explicit API surface. The library still works, but the docs now recommend the tool-calling form, because deciding what enters the lead\'s window is the whole game.',
      },
      {
        heading: 'Three failure modes, and the one that lies to users',
        body: 'The lead hallucinates the plan: sub-questions that do not decompose the real question, so workers do precise research on the wrong target. Workers over-explore: without explicit scope boundaries they drift past their sub-question and pollute synthesis.\n\nSynthesis conflicts: two workers return contradictory facts. The lead must either re-ask, adding a round, or note the disagreement explicitly. Silently picking one side is the worst failure, because the user never learns disagreement happened. Supervisor is also simply wrong for strictly sequential tasks (parallelism buys nothing), for simple queries (single-agent is faster and cheaper), and where audit and replay matter more than adaptability, since delegation is LLM-selected.',
      },
    ],
    takeaways: [
      'Fresh context per worker is the dominant mechanism: 80 percent of the BrowseComp variance was token usage alone, not smarter coordination.',
      'Wall-clock is max of the workers plus plan plus synthesis, so the progress component has three phases and the middle one needs per-worker rows.',
      'The lead decides how many workers to spawn at runtime, so the worker count is a dynamic list, never a fixed layout.',
      'Silently resolving a synthesis conflict is the failure the user cannot detect. Render the disagreement instead.',
    ],
    terms: [
      { term: 'Supervisor pattern', meaning: 'One lead agent plans and delegates, workers execute in separate contexts and report summaries back.' },
      { term: 'Fresh context', meaning: 'Each worker starting from a clean window scoped to one sub-question.' },
      { term: 'Scale effort', meaning: 'The lead sizing agent count and tool calls to the complexity of the query.' },
      { term: 'Broad then narrow', meaning: 'Decomposing into wide sub-questions first, then spawning depth workers where warranted.' },
      { term: 'Rainbow deployment', meaning: 'Gradual rollout that drains old long-running agent versions instead of cutting over.' },
      { term: 'Synthesis conflict', meaning: 'Two workers returning contradictory facts that the lead must surface or re-ask, not quietly pick between.' },
    ],
    demoCaption:
      'Three workers on three sub-questions, 0.3 seconds each. Serial gives you 0.9 seconds and one saturated window. Parallel gives you roughly 0.35 and three clean ones. The second number is why the pattern exists.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Research query · three sub-questions',
      badLabel: 'Single agent, serial',
      goodLabel: 'Lead plus 3 workers',
      badLines: [
        'one window reads all five papers',
        'wall clock: sum of the reads',
        'paper one forgotten by paper five',
        'one generic prompt for plan and read and write',
        'no per-source attribution in the answer',
      ],
      goodLines: [
        'each worker gets a 200k window for one question',
        'wall clock: max(workers) + plan + synthesis',
        'lead reads summaries, never raw papers',
        'lead prompt is decompose and synthesize',
        'each claim traces to a named worker',
      ],
      badCaption:
        'Serial reading loses the early sources to eviction and pays sum-of-reads in latency. The answer arrives with no attribution, so a wrong claim cannot be traced back to the source that produced it.',
      goodCaption:
        'Fresh context per worker is doing most of the work here, roughly 80 percent of the measured variance. The by-product matters as much: every claim in the synthesis has a named origin, which is what makes a disagreement renderable.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'Anthropic\'s research system beat single-agent Opus 4 by 90.2 percent. the reason is boring.',
        body:
          'Anthropic\'s research system beat single-agent Opus 4 by 90.2 percent. the reason is boring.\n\n80 percent of the BrowseComp variance was explained by token usage alone.\n\nnot smarter coordination. not better prompts. each subagent gets a fresh 200k window for one narrow question, and the lead never reads the raw sources.\n\ncost: about 15x the tokens of single-agent.',
      },
      {
        kind: 'X · design angle',
        hook: 'the supervisor pattern has three phases, so your progress UI needs three states.',
        body:
          'the supervisor pattern has three phases, so your progress UI needs three states.\n\nplan: nothing is parallel yet.\nfan-out: N workers moving at once, each needing its own row, sub-question, and status.\nsynthesis: blocked on the slowest worker.\n\nand N is decided by the lead at runtime. so it is a dynamic list, never a fixed layout.',
      },
      {
        kind: 'X · one-liner',
        hook: 'two workers disagree. silently picking one is the worst possible failure.',
        body:
          'two workers disagree. silently picking one is the worst possible failure.\n\nthe user never learns that disagreement happened, so they trust a coin flip as a finding.\n\nre-ask and pay a round, or render the conflict. those are the two honest options.',
      },
    ],
    source: {
      label: 'Full lesson: 05 05-supervisor-orchestrator-pattern',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/16-multi-agent-and-swarms/05-supervisor-orchestrator-pattern',
    },
  },
  {
    id: 'p16-06-hierarchical',
    phase: 'Phase 16 · Multi-Agent and Swarms',
    part: 'Part 1 · Why more than one agent',
    index: '16.06',
    title: 'Hierarchical architecture and the managerial loop',
    oneLiner:
      'Hierarchical is supervisor nested: managers over sub-managers over workers. It is the right shape when the task is a real org chart, and the pattern most likely to collapse into managers reassigning work forever. Sequential often beats it.',
    readTime: '~8 min read',
    diagram: '/lessons/p16-06.svg',
    diagramCaption:
      'A three-level tree where every internal node plans, delegates, and synthesizes, and only leaves do work.',
    whyItMatters:
      'Depth is where attribution breaks. In a flat supervisor, a wrong claim traces back one hop to a named worker. In a three-level tree, the claim passed through two summarization steps, so the trace needs the whole path plus what each level actually said. That is a nested, expandable trace with a diff at each hop, because the recurring bug is meaning drifting one level at a time ("unable to verify X" arriving as "X not confirmed"). Consensus loops make it worse: a step limit is now a hyperparameter your UI has to surface as "reconciliation attempt 3 of 5", or the run just looks hung.',
    sections: [
      {
        heading: 'The problem: LLM managers are not human managers',
        body: 'Once the supervisor pattern clicks, the obvious next move is making the workers supervisors too. Teams have sub-teams, companies have departments of departments, and hierarchical architectures mirror that.\n\nThe catch is specific. A human manager has stable priors about what their reports know. An LLM manager re-reasons the org every turn from whatever is in its context. Small drift in that context and the whole tree misallocates work, with no memory that it used to allocate differently.',
      },
      {
        heading: 'The shape, and where it genuinely shines',
        body: 'Every internal node plans, delegates, and synthesizes. Only leaves do work.\n\nIt shines on clear org mapping. If the task really is departmental ("legal reviews the doc, finance reviews the doc, engineering reviews the doc, then summarize for exec"), the hierarchy is explicit rather than invented.\n\nThe second win is local summarization. Each sub-manager synthesizes its team before the top manager sees anything, so the top reads three sub-manager summaries instead of fifteen worker outputs. That is a real context saving, and it is also exactly the step where information goes missing.',
      },
      {
        heading: 'Three failure modes the post-mortems keep finding',
        body: 'Task assignment error: the manager reads the goal, hallucinates a decomposition, and delegates to the wrong sub-manager. The sub-manager obediently works on what it was given, so the error only surfaces at top synthesis, one level removed from where a human could have caught it.\n\nOutput misinterpretation: a sub-manager returns "unable to verify claim X" and the top manager summarizes it as "claim X not confirmed". Meaning drifts at every level, and each drift is individually defensible.\n\nConsensus loops: two sub-managers disagree, the top asks them to reconcile, they re-delegate down, workers re-run, sub-managers return slightly different answers, repeat. CrewAI\'s Process.hierarchical guards this with step limits, which means the limit itself is now a hyperparameter you have to tune and display.',
      },
      {
        heading: 'The deciding question',
        body: 'Sequential pipeline versus hierarchical comes down to one question: does your task actually have independent sub-teams, or is it one linear flow pretending to be a tree?\n\nIf it is linear, use sequential and keep the trace flat. If it genuinely branches, use hierarchical but budget explicit reconciliation rules up front, because the disagreement between two branches is not an edge case, it is the normal operating condition of a tree with more than one child.',
      },
      {
        heading: 'Two implementations, two debugging stories',
        body: 'CrewAI\'s Process.hierarchical wires a manager LLM over specialist crews. The manager receives the top-level task, assigns subtasks, evaluates crew outputs, then decides whether to accept, re-delegate, or iterate. That accept-or-re-delegate decision is the loop risk in one line.\n\nLangGraph nests create_supervisor calls: the inner supervisor has its own graph and the outer treats it as an opaque node. That is cleaner for debugging, since you can step through each graph separately, and harder when you want the tree reshaped dynamically at runtime. Pick by which of those two you will need more often, because retrofitting either is expensive.',
      },
    ],
    takeaways: [
      'Hierarchical earns its keep only when the task has genuinely independent sub-teams. One linear flow pretending to be a tree should be sequential.',
      'Local summarization saves the top manager\'s context and is simultaneously where meaning drifts one level at a time.',
      'A task assignment error surfaces at top synthesis, one level away from where anyone could have caught it, so the trace must show the path, not the result.',
      'Consensus loops make the step limit a hyperparameter, which means the UI has to show reconciliation attempt N of M or the run reads as hung.',
    ],
    terms: [
      { term: 'Hierarchical architecture', meaning: 'Nested supervisors: managers over sub-managers over workers, with only leaves doing work.' },
      { term: 'Local summarization', meaning: 'A sub-manager condensing its team\'s output before the level above reads it.' },
      { term: 'Task assignment error', meaning: 'A manager hallucinating a decomposition and delegating precise work on the wrong target.' },
      { term: 'Output misinterpretation', meaning: 'Meaning shifting as each level rewrites the level below\'s conclusion.' },
      { term: 'Consensus loop', meaning: 'Sub-managers repeatedly re-delegating a disagreement without converging.' },
      { term: 'Process.hierarchical', meaning: 'CrewAI\'s manager-LLM mode that assigns, evaluates, and can re-delegate crew work.' },
    ],
    demoCaption:
      'One mislabel at the top, three levels down. The manager sends the legal question to a finance branch, the branch does correct finance work, and the top synthesis reports findings nobody asked for. The original question is never answered or flagged.',
    demo: {
      archetype: 'sequence',
      subject: 'Doc review · 3-level tree',
      badLabel: 'Unchecked decomposition',
      goodLabel: 'Assignment echoed back',
      badSequence: [
        'top manager splits into engineering and finance',
        'the actual ask was engineering and legal',
        'finance sub-manager does correct finance work',
        'top synthesis reports the finance findings',
        'legal question never answered, never flagged',
      ],
      goodSequence: [
        'top manager splits into engineering and finance',
        'each branch echoes its assignment against the ask',
        'finance branch reports no matching request',
        'top manager re-decomposes, legal branch spawns',
        'synthesis covers both branches with named sources',
      ],
      badCaption:
        'Nothing crashes. Every level does competent work on what it was handed, so the only place the error is visible is the gap between the original ask and the final summary, two levels away from the mistake.',
      goodCaption:
        'Echoing the assignment back up before doing work turns a silent misroute into a cheap rejection at depth one. The cost is one extra hop per branch, which is far less than a full tree re-run plus a reconciliation loop.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'an LLM manager re-reasons the org chart every single turn.',
        body:
          'an LLM manager re-reasons the org chart every single turn.\n\na human manager has stable priors about what their reports know. an LLM has whatever is in its context right now.\n\nsmall drift, and the whole tree misallocates work. the sub-manager obediently does the wrong job, and the error only surfaces at top synthesis.\n\none level removed from where anyone could have caught it.',
      },
      {
        kind: 'X · design angle',
        hook: 'depth breaks attribution.',
        body:
          'depth breaks attribution.\n\nflat supervisor: a wrong claim traces one hop to a named worker.\n\nthree-level tree: that claim passed through two summarization steps. "unable to verify X" arrives as "X not confirmed".\n\nso the trace is not a list, it is a nested path with a diff at each hop. otherwise you can see the wrong answer and never find where it turned.',
      },
      {
        kind: 'X · one-liner',
        hook: 'the deciding question for hierarchical: independent sub-teams, or a linear flow pretending to be a tree?',
        body:
          'the deciding question for hierarchical: independent sub-teams, or a linear flow pretending to be a tree?\n\nif it is linear, go sequential and keep the trace flat.\n\nif it branches, budget reconciliation rules up front. two branches disagreeing is not an edge case, it is tuesday.',
      },
    ],
    source: {
      label: 'Full lesson: 06 06-hierarchical-architecture',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/16-multi-agent-and-swarms/06-hierarchical-architecture',
    },
  },
  {
    id: 'p16-08-role-specialization',
    phase: 'Phase 16 · Multi-Agent and Swarms',
    part: 'Part 1 · Why more than one agent',
    index: '16.08',
    title: 'Planner, executor, critic, verifier: the verifier is load-bearing',
    oneLiner:
      'Three coders in a group chat write three flavors of the same mediocre code. The fix is not more agents, it is different ones, and one of them must be a verifier whose pass or fail is decided by code. PwC moved accuracy from 10 percent to 70 percent by adding that one role.',
    readTime: '~8 min read',
    diagram: '/lessons/p16-08.svg',
    diagramCaption:
      'The four roles and their distinct tool sets: planner, executor, critic (subjective, LLM), verifier (objective, code).',
    whyItMatters:
      'Critic and verifier produce different schemas, so they cannot share a component. A critic returns accept or reject plus prose reasons, which renders as reviewable commentary you can disagree with. A verifier returns pass or fail plus evidence (a test name, an exit code, a schema path), which renders as a gate: the primary action is disabled and the failing check is named. Collapse them into one "review" panel and you lose the only signal a user can act on without reading. MAST traced 1642 failures and found 21.3 percent were pure verification gaps, meaning the system shipped an answer nothing had checked.',
    sections: [
      {
        heading: 'The problem: generic agents produce generic output',
        body: 'Put three coders in a group chat and you get three flavors of the same mediocre code. Add more agents, add more rounds, and the quality threshold stays where it was. Parallel guessing does not become correctness.\n\nThe fix is not more agents, it is different ones. Assign distinct roles. Give the critic tools the planner does not have. Give the verifier an objective test suite. Now the system has internal disagreement with grounded correction rather than a chorus.',
      },
      {
        heading: 'The four canonical roles',
        body: 'Planner: reads the goal, produces a step list or a spec. Tools are retrieval and docs. Output is a structured plan.\n\nExecutor: reads one plan step at a time and produces the artifact. Tools are the actual work tools, compiler, shell, API client.\n\nCritic: reads the executor\'s output against the planner\'s intent. Tools are read-only access plus static analysis. Output is accept or reject with reasons.\n\nVerifier: reads the artifact and runs a deterministic check. Tools are a test runner, a type checker, a schema validator. Output is pass or fail with evidence.',
      },
      {
        heading: 'MetaGPT encodes SOPs, ChatDev makes agents ask',
        body: 'MetaGPT (arXiv:2308.00352) encodes software SOPs as role prompts: Product Manager writes the PRD, Architect produces the design, Project Manager splits tasks, Engineer implements, QA Engineer runs tests. Each role has a strict input and output schema, and the formulation Code = SOP(Team) is the claim: deterministic SOPs turn a team of LLMs into a predictable pipeline.\n\nChatDev (arXiv:2307.07924) chains designer, programmer, reviewer, and tester through a chat chain and adds one important move called communicative dehallucination. When an executor needs a detail that was not in the plan, it explicitly asks the relevant role by name before continuing. The role prompt says so directly. This kills the classic failure of plausibly inventing the detail.',
      },
      {
        heading: 'Critic is not verifier, and the difference is the schema',
        body: 'A critic is an LLM reviewing an artifact for quality. Subjective, and fully capable of being fooled by plausible prose. A verifier is a deterministic program running on the artifact. Objective, and it hands you pass or fail with evidence.\n\nUse both. The critic catches taste issues the verifier cannot articulate. The verifier catches bugs the critic cannot see because they only appear at runtime. The anti-pattern is the system where every role is an LLM and every output is "looks good to me", which is a textbook MAST failure. At least one role\'s pass or fail must be decided by code.',
      },
      {
        heading: 'Why verification is the load-bearing role',
        body: 'Cemri et al. (MAST, arXiv:2503.13657) traced 1642 multi-agent execution failures. 21.3 percent were verification gaps, meaning the system shipped an answer nobody had checked. The remaining 79 percent often trace back to a check that failed silently or was never run at all.\n\nPwC reported, across CrewAI deployments in 2025, that adding a structured validation loop moved accuracy from 10 percent to 70 percent. A 7 times gain from one role. The framework surfaces are all there already: CrewAI\'s Agent(role, goal, backstory), specialized LangGraph nodes with pipeline-enforcing edges, role-specific AutoGen ConversableAgents, handoff tools between OpenAI Agents SDK agents. The roster is the design decision, not the framework.',
      },
    ],
    takeaways: [
      'Critic and verifier are different roles with different schemas: prose reasons you can argue with versus pass or fail with evidence you cannot.',
      'At least one role\'s verdict must be decided by code. An all-LLM roster where everything is "looks good to me" is a named MAST failure.',
      'MAST found 21.3 percent of 1642 failures were pure verification gaps, so the missing role is usually the verifier, not another executor.',
      'Communicative dehallucination is a prompt clause: when a detail is missing, ask the role that owns it by name instead of inventing it.',
    ],
    terms: [
      { term: 'Planner', meaning: 'The role that turns a goal into a structured plan or spec.' },
      { term: 'Executor', meaning: 'The role that produces the artifact from one plan step, holding the real work tools.' },
      { term: 'Critic', meaning: 'An LLM reviewing an artifact for quality, subjective and foolable by plausible prose.' },
      { term: 'Verifier', meaning: 'A deterministic program returning pass or fail with evidence, decided by code not judgement.' },
      { term: 'Code = SOP(Team)', meaning: 'MetaGPT\'s formulation: encoding standard operating procedures as role prompts to make a team predictable.' },
      { term: 'Communicative dehallucination', meaning: 'ChatDev\'s rule that an agent must ask the owning role for a missing detail rather than invent it.' },
    ],
    demoCaption:
      'The executor ships off-spec code that reads perfectly well. The critic accepts it because the prose is plausible. The verifier fails it because the test fails. Two reviewers, one useful signal, and only one of them can gate the action.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Off-spec function · same artifact',
      badLabel: 'Critic only',
      goodLabel: 'Critic plus verifier',
      badLines: [
        'reviews the artifact against stated intent',
        'output: accept, with reasons in prose',
        'plausible naming reads as correct',
        'nothing executed, nothing measured',
        'the run closes green',
      ],
      goodLines: [
        'critic still returns accept with reasons',
        'verifier runs the artifact against a test case',
        'output: fail, evidence is the failing assertion',
        'primary action disabled, failing check named',
        'the bug surfaces before merge',
      ],
      badCaption:
        'An LLM critic evaluates how the artifact reads, and off-spec code that is well named reads fine. Every role in the loop returning "looks good to me" is the exact roster MAST catalogued as a failure family.',
      goodCaption:
        'The verifier adds a verdict nothing can talk its way past, because a failing assertion is not an opinion. Keep both: the critic names taste problems no test encodes, the verifier names runtime bugs no reader sees.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'PwC went from 10 percent to 70 percent accuracy by adding one role.',
        body:
          'PwC went from 10 percent to 70 percent accuracy by adding one role.\n\nnot a better model. not more agents. a structured validation loop. 7x from a verifier.\n\nMAST traced 1642 multi-agent failures: 21.3 percent were pure verification gaps. the system shipped an answer nothing had checked.\n\nthe missing agent is almost never another executor.',
      },
      {
        kind: 'X · design angle',
        hook: 'critic and verifier cannot share a component.',
        body:
          'critic and verifier cannot share a component.\n\ncritic returns accept/reject plus prose. that renders as commentary you are allowed to disagree with.\n\nverifier returns pass/fail plus evidence: a test name, an exit code, a schema path. that renders as a gate. primary action disabled, failing check named.\n\ncollapse them into one "review" panel and you delete the only signal anyone can act on without reading.',
      },
      {
        kind: 'X · one-liner',
        hook: 'if every role in your system is an LLM, every review is "looks good to me".',
        body:
          'if every role in your system is an LLM, every review is "looks good to me".\n\nthat is a catalogued MAST failure mode, not a staffing preference.\n\nat least one verdict in the loop has to be decided by code.',
      },
    ],
    source: {
      label: 'Full lesson: 08 08-role-specialization',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/16-multi-agent-and-swarms/08-role-specialization',
    },
  },
  {
    id: 'p16-09-parallel-swarm',
    phase: 'Phase 16 · Multi-Agent and Swarms',
    part: 'Part 1 · Why more than one agent',
    index: '16.09',
    title: 'Swarm architectures: trading determinism for throughput',
    oneLiner:
      'Remove the orchestrator. Workers pull tasks off a shared queue and write results back, so the system scales until the queue does. You pay for it in determinism, traceability, and the ability to reproduce a bug.',
    readTime: '~8 min read',
    diagram: '/lessons/p16-09.svg',
    diagramCaption:
      'Workers pulling from one shared queue with no central decider, each writing results and optionally enqueuing follow-ups.',
    whyItMatters:
      'A swarm has no central log, which means there is no run to render. Supervisor gives you a plan and a position in it. A swarm gives you a queue depth, a per-worker current task, and a completion count, so the honest surface is a throughput dashboard, not a progress bar with a percentage. Partial results are the normal state rather than an error state: 340 of 500 done, 4 workers busy, 12 tasks aged past their priority window. Starvation is a UI problem too, because a long task that never gets pulled looks identical to a task that is quietly running.',
    sections: [
      {
        heading: 'The problem: the supervisor becomes the bottleneck',
        body: 'Supervisor scales to a few workers. What about hundreds? Every decision about who does what funnels through one agent, so one slow plan step stalls the entire system, and the lead\'s context is the ceiling on how many workers it can reason about at once.\n\nSwarm architectures flip the design. Instead of a central planner dispatching work, workers pull work off a shared queue. Coordination is baked into the event bus semantics rather than into an agent\'s reasoning. There is no orchestrator, and the system scales until the queue does.',
      },
      {
        heading: 'The shape, and where it fits',
        body: 'Each worker repeats one loop: pull a task, process it, write the result, optionally enqueue follow-ups. That is the whole protocol.\n\nIt fits many independent tasks, scraping, transforming, classifying, where nothing depends on anything else. It fits variable-duration work especially well: if some tasks take 100ms and others take 10 seconds, a swarm balances load automatically because fast workers just pull the next job, while a supervisor has to anticipate duration to assign well. And it fits when you care about total completion time rather than strict ordering.',
      },
      {
        heading: 'Where it fails, and it fails hard',
        body: 'Ordered workflows: if step 3 needs step 2\'s output, a swarm risks step 3 firing first. There is no scheduler holding that constraint for you.\n\nGlobal-plan tasks: a complex research question benefits from a planner. A swarm of researchers produces independent facts, not a coherent report, and no amount of workers fixes that.\n\nDebugging: with no central log and asynchronous work, reproducing a bug is expensive. This is the explicit trade the pattern makes, determinism and traceability for scalability, and it is worth naming out loud before you pick it.',
      },
      {
        heading: 'Matrix takes it to the conclusion',
        body: 'Matrix (arXiv:2511.21686) is the 2025 paper that pushes swarm all the way: both control flow and data flow are serialized messages on distributed queues. No central coordinator at all. Fault tolerance comes from message durability, and scalability becomes the message broker\'s problem rather than the system\'s.\n\nThe contribution is a programming model where coordination is "what message topic does this agent subscribe to" instead of "which agent does the supervisor pick next". The system stops looking like an org chart and starts looking like a pub/sub event mesh. LangGraph\'s 2025 docs describe Swarm Architecture in the same spirit: agents are nodes in a cyclic directed graph, and any node can activate from the pool by condition rather than by assignment.',
      },
      {
        heading: 'Starvation, hot-spotting, and the three fixes',
        body: 'If all workers pull the fastest available task, long-running tasks never get picked until they are the only ones left. That is classic queue starvation, and in an agent swarm it reads as a task that simply never happens.\n\nThree mitigations work. Priority queues with explicit aging, so priority rises with wait time. Worker specialization, where some workers only take long tasks. Back-pressure, limiting how many fast tasks enter the queue at all.\n\nSwarm also pairs naturally with content-based routing: instead of one generic queue, run one queue per message type and have specialist workers subscribe only to theirs. That is the basis for message-bus architectures that reach thousands of agents.',
      },
    ],
    takeaways: [
      'Swarm trades determinism and traceability for scale. Say that out loud before choosing it, because the debugging cost lands later.',
      'There is no plan, so there is no progress bar. The honest surface is queue depth, per-worker current task, and completion count.',
      'Partial results are the normal state in a swarm, not an error state, so the UI has to make 340 of 500 legible rather than pending.',
      'Starvation renders identically to slow progress, so aged priority or long-task workers is a UX fix as much as a scheduling one.',
    ],
    terms: [
      { term: 'Swarm architecture', meaning: 'Workers pulling tasks from shared queues with no central orchestrator.' },
      { term: 'Event bus semantics', meaning: 'Coordination encoded in queue and topic behavior rather than in an agent\'s reasoning.' },
      { term: 'Starvation', meaning: 'Long-running tasks never getting pulled because workers keep taking faster ones.' },
      { term: 'Priority aging', meaning: 'Raising a queued task\'s priority the longer it waits, to break starvation.' },
      { term: 'Back-pressure', meaning: 'Limiting how much work enters the queue to protect throughput and fairness.' },
      { term: 'Matrix', meaning: 'arXiv:2511.21686, a framework serializing both control and data flow as messages on distributed queues.' },
    ],
    demoCaption:
      'Twelve tasks of mixed duration across four workers. Pre-assigning them leaves fast workers idle while one grinds on a 10-second job. A shared queue distributes unevenly, which is the point: uneven is optimal when durations vary.',
    demo: {
      archetype: 'toggle-fix',
      subject: '12 tasks · 4 workers · mixed duration',
      badLabel: 'Fixed assignment',
      goodLabel: 'Shared queue',
      badLines: [
        'each task pre-assigned to a named worker',
        'worker 2 draws three 10s tasks',
        'workers 1, 3, 4 idle after 2s',
        'wall clock set by the unluckiest worker',
        'progress renders as 4 fixed lanes',
      ],
      goodLines: [
        'workers pull the next available task',
        'task counts end uneven, 5 / 2 / 3 / 2',
        'no worker idle while work remains',
        'wall clock near the theoretical floor',
        'progress renders as queue depth plus 4 current tasks',
      ],
      badCaption:
        'Assigning work up front requires knowing durations up front. When they vary by 100 times, one worker becomes the critical path and the other three sit idle holding a lane in your UI that says nothing.',
      goodCaption:
        'Pulling means the fast workers keep absorbing work, so uneven counts are the signature of correct load balancing. The cost shows up in the trace: no central log, so a bug needs the queue history to reproduce, and a starved long task looks exactly like a slow one.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'a swarm has no orchestrator, so it scales until the queue does.',
        body:
          'a swarm has no orchestrator, so it scales until the queue does.\n\nworkers repeat one loop: pull a task, process, write result, maybe enqueue follow-ups. coordination lives in the event bus, not in an agent\'s reasoning.\n\nMatrix (arXiv:2511.21686) takes it all the way: control flow and data flow are both just messages on distributed queues.\n\nfault tolerance becomes message durability. scale becomes the broker\'s problem.',
      },
      {
        kind: 'X · design angle',
        hook: 'no plan means no progress bar.',
        body:
          'no plan means no progress bar.\n\nsupervisor gives you a plan and a position in it. a swarm gives you queue depth, per-worker current task, and a completion count.\n\nso the honest surface is a throughput dashboard, and partial results are the normal state: 340 of 500 done, 4 workers busy, 12 tasks aged out.\n\nalso: a starved long task looks identical to a slow one. that is a UI bug before it is a scheduling bug.',
      },
      {
        kind: 'X · one-liner',
        hook: 'uneven worker task counts are the signature of correct load balancing.',
        body:
          'uneven worker task counts are the signature of correct load balancing.\n\n5 / 2 / 3 / 2 across four workers is not imbalance. it is what pulling looks like when durations vary by 100x.\n\nfixed assignment gives you even counts and an idle fleet.',
      },
    ],
    source: {
      label: 'Full lesson: 09 09-parallel-swarm-networks',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/16-multi-agent-and-swarms/09-parallel-swarm-networks',
    },
  },
];
