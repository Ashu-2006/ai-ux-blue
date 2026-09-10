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
    readTime: '~10 min read',
    whyItMatters:
      'The moment you go from one agent to three, your run surface changes shape. One agent is one transcript, so a single streaming pane covers it. Three agents are three concurrent transcripts with three independent states, and the user now needs to know who is working, who is blocked, and what the whole run is waiting on. That is a per-agent status row plus a roll-up state, not a bigger spinner. It also changes the failure story: every agent boundary is a lossy compression step, so "the coder ignored the research" is now a legible bug you have to render, not a mystery.',
    learningObjectives: [
      'Diagnose which of three single-agent failures (context saturation, role confusion, sequential bottleneck) a stalled run is hitting.',
      'Apply the under-20-tool-calls, under-100k-tokens rule to decide whether a task needs one agent or many.',
      'Compare the five points on the multi-agent spectrum (single, subagents, pipeline, team, swarm) and name a production system at each.',
      'Choose one of the four wiring patterns (pipeline, fan-out/fan-in, orchestrator-worker, peer swarm) for a given task shape.',
      'Design the run-status UI a three-agent job needs: per-agent state rows plus one roll-up.',
    ],
    sections: [
      {
        heading: 'The problem: the agent does not get dumber, the task gets wider',
        body: 'Point a working single agent at a real codebase: 200 files, three languages, tests that need infrastructure, and external API docs to read first. It chokes. The model did not degrade. The task exceeded what one loop holds.\n\nBy turn 30 the window carries 150k tokens of file contents, command output, and its own prior reasoning. Details from turn 5 are gone. Reading 50 files blows past 200k tokens outright. This is a capacity wall, and no prompt engineering moves it.\n\nThe failure looks like a model problem from the outside: slower answers, missed constraints, code that contradicts a requirement stated three tool calls ago. It is a plumbing problem. One window cannot hold research notes, file contents, test output, and review feedback at once and reason well over all of it.',
      },
      {
        heading: 'Three failures wearing one coat',
        body: 'Context saturation: tool results pile up until the early turns are effectively deleted, and by turn 30 the model is reasoning over a window that no longer contains the constraint it agreed to at turn 5. Role confusion: a system prompt that says "you are a researcher, coder, reviewer, and tester" produces an agent that half-researches, half-codes, and never finishes reviewing, because one prompt cannot hold four different quality bars at once. Sequential bottleneck: it reads file A, then B, then C, three serial calls at several seconds each, where three parallel calls would return in the time of one.\n\nThey look like one symptom, "the agent is bad at this", and they have three different fixes: split the context, split the prompt, or fan out. Knowing which one you have decides the architecture, and guessing wrong means you add agents to a problem that was never about agent count.',
      },
      {
        heading: 'The spectrum, not the switch',
        body: 'Multi-agent is not binary. Single agent: one loop, one prompt. Subagents: a parent spawns children for scoped subtasks and keeps its own context clean, which is what Claude Code does with its Task tool. Pipeline: agent A\'s output is agent B\'s input, good for research to code to review to test. Team: parallel agents on a shared message bus with an orchestrator. Swarm: many near-identical agents pulling work off a queue, no fixed orchestrator, scaling to hundreds of workers where a supervisor would become the bottleneck.\n\nProduction systems sit at specific points on this line, not at the extremes. Devin runs a planner, a coder, and a browser agent with separate contexts. Top SWE-bench systems use a researcher, a planner, and a coder in a pipeline; single-agent entries score lower on the same benchmark. The position on the spectrum is a decision, not a default.',
      },
      {
        heading: 'Real systems, one line each',
        body: 'Four production systems make the spectrum concrete. Claude Code spawns a child agent with the Task tool for a scoped subtask; the parent\'s context stays clean and the child returns a summary, not its full transcript. Devin runs three separate contexts: a planner that breaks work into steps, a coder that writes it, and a browser agent that reads documentation, so a slow doc lookup never pollutes the coder\'s window.\n\nTop-performing entries on SWE-bench chain a researcher that reads the codebase, a planner that designs the fix, and a coder that implements it; single-agent entries on the same leaderboard score measurably lower. ChatGPT Deep Research spawns several search agents in parallel, each exploring one angle of a question, then synthesizes their findings into one answer. None of these four systems debate the choice in the abstract. Each picked a point on the spectrum because a specific single-agent failure showed up first.',
      },
      {
        heading: 'The four patterns you will actually wire',
        body: 'Pipeline: staged transformation, simple to reason about, one broken stage blocks everything downstream. Fan-out and fan-in: split independent subtasks, merge results, good when the work genuinely decomposes. Orchestrator-worker: a smart lead decides, delegates, and synthesizes, and the lead is itself an agent with spawn tools. Peer swarm: no center, decisions emerge from interaction, scales to many agents and is the hardest to debug, because there is no single place a bug report can point to.\n\nPick by the shape of the task, not by the framework you already installed. Ordering requirement points at pipeline. Independence points at fan-out. Unknown decomposition points at orchestrator. Reach for peer swarm only once the other three have been ruled out.',
      },
      {
        heading: 'The cost you are actually paying',
        body: 'Every agent boundary is a lossy compression step: agent A\'s full context becomes one summary message for agent B. Coordination logic is its own bug surface. Latency floors at N serial calls and rises if agents talk back and forth. Cost multiplies because each agent burns tokens independently.\n\nThe rule of thumb from the source is blunt and worth keeping: if a task takes fewer than 20 tool calls and fits in 100k tokens, stay single-agent. Debugging goes from reading one conversation to tracing messages across five, and that shift lands on you twice, once in the code and once in the UI you have to build so anyone else can read the run.',
      },
      {
        heading: 'When to stay single-agent, and what it costs when you do not',
        body: 'The rule of thumb is specific for a reason: under 20 tool calls and under 100k tokens of working data, one agent is faster and cheaper than any split you could design. Multi-agent systems run roughly 15 times the tokens of a single agent doing comparable work, because every agent pays its own prompt and context cost independently, not a shared one.\n\nThat number is not a warning against multi-agent, it is a budget line. A task worth 15 times the tokens is a task where the quality gain or the parallel speedup pays for itself: research questions, large migrations, anything with genuine independent sub-work. A task that does not clear that bar and gets split anyway pays the multiplier for no return: more latency from coordination overhead, more surface area for a message to get lost, and a debugging session that now starts with "which of the five agents said this."',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p16-01-inline-context.svg',
        alt: 'Context window fill over 30 turns, one agent versus three',
        caption: 'At turn 30 the single agent carries 150k tokens across four jobs. Three specialists each hold one clean window scoped to one artifact.',
        diagramBrief: 'Two stacked horizontal bar charts on cream paper (#faf6ef), black ink, one accent color. Top bar: "Single agent, turn 30" filled to 150k/200k tokens, labeled with four overlapping bands (research, code, review, test) shown as different-shaded stripes inside the same bar to show mixing. Bottom: three short bars labeled Researcher, Coder, Reviewer, each filled to a small, clean, single-shade fraction of the same 200k scale. A caption strip under each bar set shows the token count.',
      },
      {
        src: '/lessons/p16-01-inline-spectrum.svg',
        alt: 'Five points on the multi-agent spectrum',
        caption: 'Single agent, subagents, pipeline, team, and swarm are five points on one line, not five separate technologies.',
        diagramBrief: 'A single horizontal line on cream paper from left (labeled SIMPLE) to right (labeled COMPLEX) with five labeled nodes: Single Agent (one box), Subagents (one box with a smaller child box beneath it), Pipeline (three boxes in a row connected by arrows), Team (three boxes around a small bus line with an orchestrator box above), Swarm (four small identical boxes around a shared queue cylinder, no orchestrator box). Monochrome ink, one accent color highlighting the orchestrator boxes only, since orchestrator presence is the one property that changes left to right.',
      },
    ],
    takeaways: [
      'Three distinct failures hide behind "the agent is bad at this": context saturation, role confusion, and serial execution. Diagnose which one before splitting anything.',
      'Under 20 tool calls and under 100k tokens of working data, stay single-agent. The coordination overhead costs more than it buys.',
      'Every agent boundary is a lossy compression step, so "the second agent ignored the first" is a structural bug, not bad luck.',
      'Three agents means three concurrent states, so the run surface is per-agent status rows plus one roll-up, not a larger spinner.',
    ],
    terms: [
      { term: 'Single-agent ceiling', gloss: 'the model just is not good enough', meaning: 'The point where one loop, one window, and one prompt stop covering the task.' },
      { term: 'Context saturation', gloss: 'the agent forgot', meaning: 'Tool results filling the window until early turns are effectively lost.' },
      { term: 'Role confusion', gloss: 'the agent got confused', meaning: 'One system prompt naming several jobs, producing an agent that does all of them shallowly.' },
      { term: 'Subagent', gloss: 'a helper agent', meaning: 'A child agent spawned for a scoped subtask that reports a summary back to its parent.' },
      { term: 'Fan-out / fan-in', gloss: 'map-reduce for agents', meaning: 'Splitting independent subtasks across parallel agents, then merging their results.' },
      { term: 'Lossy boundary', gloss: 'information gets lost between agents', meaning: 'The compression that happens when one agent\'s full context becomes a single message for the next.' },
      { term: 'Swarm', gloss: 'a hive mind of AI agents', meaning: 'A set of peer agents with shared state and no fixed leader; behavior emerges from local interactions.' },
      { term: 'Orchestrator', gloss: 'the boss agent', meaning: 'An agent whose tools include spawning and managing other agents. It plans and delegates but may not do the actual work.' },
      { term: 'Coordinator', gloss: 'the traffic cop', meaning: 'A non-agent component, often just code, that routes messages between agents based on rules.' },
      { term: 'Message passing', gloss: 'agents talk to each other', meaning: 'Structured data sent from one agent to another, replacing a shared context window.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A task needs 15 tool calls and 60k tokens of working data. Single agent or split? Justify with the rule of thumb.' },
      { level: 'medium', prompt: 'Take the overloaded single-agent prompt ("you are a researcher, coder, reviewer, and tester") and split it into three specialist prompts. What does each one lose access to that it used to have?' },
      { level: 'medium', prompt: 'A pipeline goes research to code to review. Convert the review step into a fan-out: run a security reviewer and a style reviewer in parallel, then merge. What do you do if they disagree?' },
      { level: 'design', prompt: 'Sketch the run-status surface for a four-agent job (researcher, coder, reviewer, tester). What does the roll-up state show when one agent is blocked and the others are idle waiting on it?' },
      { level: 'hard', prompt: 'Devin uses a planner, a coder, and a browser agent with separate contexts. Diagram the handoff messages between all three for a task that fails the first review and needs a second pass.' },
    ],
    furtherReading: [
      { label: 'Kapoor et al., The Landscape of Emerging AI Agent Architectures (arXiv:2409.02977)', url: 'https://arxiv.org/abs/2409.02977', why: 'A survey of the pipeline, fan-out, orchestrator, and swarm patterns this lesson names.' },
      { label: 'Wu et al., AutoGen: Enabling Next-Gen LLM Applications (arXiv:2308.08155)', url: 'https://arxiv.org/abs/2308.08155', why: 'Microsoft\'s original multi-agent conversation framework, the 2023 starting point for this design space.' },
      { label: 'Claude Code subagents documentation', url: 'https://docs.anthropic.com/en/docs/claude-code', why: 'How the Task tool spawns a child agent with a clean context and returns a summary.' },
      { label: 'CrewAI documentation', url: 'https://docs.crewai.com/', why: 'The role-based framework referenced throughout this phase for its Agent(role, goal, backstory) surface.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Single-agent vs multi-agent decision checklist',
      body: '- Does the task fit under 100k tokens of working data end to end?\n- Does it take fewer than 20 tool calls to finish?\n- Does every stage need the same system prompt, or does one stage need a different quality bar?\n- Does any part of the work not depend on another part finishing first?\n- If you split it: what is the one summary message that crosses each agent boundary, and what does it drop?\n- What per-agent status row and roll-up state does the UI need before you write the first prompt?',
    },
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
    readTime: '~10 min read',
    diagram: '/lessons/p16-04.svg',
    diagramCaption:
      'The four primitives and the axis each one sets: agent, handoff, shared state, orchestrator.',
    whyItMatters:
      'Three of the four primitives are stateless, which tells you exactly where your UI\'s truth lives. Agents are pure functions of prompt and tools. Handoffs are function calls. Orchestrators are schedulers. Shared state is the only thing that persists, so it is the only thing you can render, diff, replay, or attribute a claim to. That makes the orchestrator axis a product decision, not a framework preference: LLM-routed means the next step is unpredictable, so you need a live "deciding who is next" state and a route trace. Pinned in code means you can render the graph up front and show progress against it.',
    learningObjectives: [
      'Name the four primitives, agent, handoff, shared state, orchestrator, that every multi-agent framework parameterizes.',
      'Map any framework (AutoGen, LangGraph, CrewAI, Agents SDK, Agent Framework) onto the four axes in one paragraph.',
      'Explain why shared state is the only stateful primitive and what bug classes live there.',
      'Distinguish full-history shared state from projected, role-scoped state and their scaling tradeoffs.',
      'Decide, given an orchestrator\'s routing method, whether a run\'s path can be drawn before it starts.',
    ],
    sections: [
      {
        heading: 'The problem: a new framework every six months',
        body: 'AutoGen in 2023. CrewAI in 2024. LangGraph and OpenAI Swarm in 2024. Google ADK in April 2025. Microsoft Agent Framework hit RC in February 2026. Every release claims to be the right abstraction.\n\nLearning them one at a time burns you out, partly because the vocabulary is deliberately different. One framework calls its shared memory a blackboard, another a message pool, a third a StateGraph. It reads like churn. It is not. Underneath the naming, four primitives have been stable the whole time. The result is a stack of "getting started" tutorials nobody finishes, each teaching the same four ideas under a new name.',
      },
      {
        heading: 'The four',
        body: 'Agent: a system prompt plus a tool list. Stateless, so every run starts from the prompt and the current message history. Two agents with the same prompt and tools are interchangeable.\n\nHandoff: a structured transfer of control. Mechanically either a tool call that returns a new agent or a graph edge that follows a condition.\n\nShared state: any structure more than one agent can read, and sometimes write. Message pool, blackboard, key-value store, vector memory.\n\nOrchestrator: whoever decides who speaks next. An explicit graph, an LLM speaker-selector, the last speaker\'s handoff call, or a scheduler over a queue.',
      },
      {
        heading: 'Anatomy: agent and handoff',
        body: 'Written out, an agent is a triple: system prompt, tool list, model, plus an optional name. No memory, no state. Two agents that share a system prompt and tools are interchangeable, which is why swapping one model for another inside the same role rarely breaks the pipeline; everything that looks like per-agent memory is actually sitting in shared state or in the handoff payload.\n\nA handoff is a (from agent, to agent, reason, payload) tuple, and three implementations cover nearly every framework. Function return: the tool call itself returns the next agent, OpenAI Swarm\'s pattern, so routing lives inside the tool schema. Graph edge: LangGraph declares edges up front and a condition selects which one fires. Speaker selection: AutoGen\'s GroupChat runs a selector function, sometimes itself an LLM call, that reads the message pool and names who speaks next.',
      },
      {
        heading: 'Anatomy: shared state and the four orchestrator flavors',
        body: 'Shared state, at minimum, is a list of messages. Production systems add more: CrewAI\'s structured Task outputs, LangGraph\'s typed reducers, an external memory layer over MCP or a vector database. Two topologies matter. A full pool gives every agent every message, simple to reason about and scales badly past a handful of agents. A projected pool gives each agent a role-scoped view, which scales but costs you upfront schema design.\n\nOrchestrators split into four flavors. Static: the graph is fixed at build time, LangGraph\'s deterministic mode and CrewAI\'s Sequential process. LLM-selected: an LLM reads the pool and names the next speaker, AutoGen and CrewAI Hierarchical. Handoff-driven: the current agent decides by calling a handoff tool, OpenAI Swarm. Queue-driven: workers pull from a shared queue with no explicit next-speaker at all, the swarm architectures covered later in this phase.',
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
    inlineImages: [
      {
        src: '/lessons/p16-04-inline-primitives.svg',
        alt: 'The four primitives as one small diagram each',
        caption: 'Agent, handoff, shared state, and orchestrator: three of the four are stateless functions, one is the only thing that persists.',
        diagramBrief: 'Four-panel grid on cream paper, one primitive per panel. Panel 1 Agent: a box labeled prompt+tools+model with a small "stateless" tag. Panel 2 Handoff: an arrow from box A to box B labeled with the three mechanisms as small sub-labels (function return / graph edge / speaker select). Panel 3 Shared state: a cylinder icon, the only panel with a filled accent color to show it is the one stateful primitive. Panel 4 Orchestrator: a small decision-diamond feeding into the other three panels. Monochrome ink, one accent color reserved for the shared-state cylinder.',
      },
      {
        src: '/lessons/p16-04-inline-mapping.svg',
        alt: 'Six frameworks mapped onto the same four columns',
        caption: 'OpenAI Swarm, AutoGen, CrewAI, LangGraph, Microsoft Agent Framework, and Google ADK read as six rows of the same four-column table.',
        diagramBrief: 'A rendered table diagram, six rows (one per framework name) by four columns (Agent / Handoff / Shared state / Orchestrator), each cell holding one short phrase pulled from the lesson\'s mapping table. Style: cream paper background, thin black rules, no color besides one accent line under the header row.',
      },
    ],
    takeaways: [
      'Four primitives, four axes: agent, handoff, shared state, orchestrator. Read any new framework by naming its default on each.',
      'Shared state is the only stateful primitive, so it is the only surface you can render, diff, replay, or attribute a claim to.',
      'LLM-routed orchestration means the next step is unknowable in advance, so the UI needs a live routing state, not a pre-drawn progress bar.',
      'Three questions (who routes, full or projected state, can prompts be edited) settle most framework choices without a bake-off.',
    ],
    terms: [
      { term: 'Agent', gloss: 'an LLM with tools', meaning: 'A (system prompt, tools, model) triple, stateless between runs.' },
      { term: 'Handoff', gloss: 'transfer of control', meaning: 'A structured transfer of control, either a tool returning an agent or a conditional graph edge.' },
      { term: 'Shared state', gloss: 'memory, or context', meaning: 'Any structure multiple agents can read, and the only stateful part of the system.' },
      { term: 'Orchestrator', gloss: 'the coordinator', meaning: 'Whatever decides who speaks next: a graph, an LLM selector, a handoff call, or a queue scheduler.' },
      { term: 'Primitive', gloss: 'an abstraction', meaning: 'One of the four axes every framework parameterizes, not a framework-specific feature.' },
      { term: 'Message pool', gloss: 'shared chat history', meaning: 'Full-history shared state. Easy to reason about, scales badly.' },
      { term: 'Projected state', gloss: 'a scoped view', meaning: 'A role-scoped view of shared state rather than the full history.' },
      { term: 'StateGraph reducer', gloss: 'the state merger', meaning: 'LangGraph\'s function that folds global state into a node-specific slice.' },
      { term: 'Speaker selection', gloss: 'who talks next', meaning: 'An orchestrator pattern where a function, often an LLM, picks the next agent from a group.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Read OpenAI Swarm\'s cookbook example. Name its default on all four axes: agent, handoff, shared state, orchestrator.' },
      { level: 'medium', prompt: 'A framework centralizes shared state in a checkpoint you can inspect. What does it cost you in coordination overhead versus a framework that hides shared state entirely?' },
      { level: 'medium', prompt: 'Given a StateGraph reducer that projects only a role-scoped view to each node, describe one bug this prevents and one bug it can still allow.' },
      { level: 'design', prompt: 'You are handed a brand-new framework release with unfamiliar vocabulary, its own words for agent, handoff, state, and router. Write the one-paragraph mapping you would produce before writing a line of integration code.' },
      { level: 'hard', prompt: 'LLM-routed orchestration means the next step is unknown until the handoff call returns. Design the two UI states, an in-progress route trace and a completed path, a product needs to render both cases honestly.' },
    ],
    furtherReading: [
      { label: 'OpenAI cookbook, Orchestrating Agents: Routines and Handoffs', url: 'https://developers.openai.com/cookbook/examples/orchestrating_agents', why: 'The clearest articulation of handoff-driven orchestration.' },
      { label: 'AutoGen stable docs', url: 'https://microsoft.github.io/autogen/stable/', why: 'GroupChat plus speaker selection is the reference for LLM-selected orchestration.' },
      { label: 'LangGraph, Workflows and Agents', url: 'https://docs.langchain.com/oss/python/langgraph/workflows-agents', why: 'Graph-edge orchestration and reducer-based shared state, explained by the team that ships it.' },
      { label: 'CrewAI introduction', url: 'https://docs.crewai.com/en/introduction', why: 'Role-goal-backstory agents plus Sequential and Hierarchical processes.' },
      { label: 'AG2, the community AutoGen continuation', url: 'https://github.com/ag2ai/ag2', why: 'The live AutoGen v0.2 line after Microsoft moved v0.4 into maintenance.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Framework-primitive mapping checklist',
      body: '- What is the agent unit: a class, a function, a config file?\n- How is a handoff implemented: function return, graph edge, or speaker selection?\n- Is shared state a full message pool or a projected, role-scoped view?\n- Who orchestrates: a static graph, an LLM selector, the current agent\'s handoff call, or a queue?\n- Write the mapping in one paragraph before reading past the quickstart. If you cannot fill all four blanks, the docs are incomplete or the framework has invented a fifth primitive worth naming.',
    },
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
    readTime: '~10 min read',
    diagram: '/lessons/p16-05.svg',
    diagramCaption:
      'A lead decomposing one query into three sub-questions, workers running in parallel contexts, and one synthesis step.',
    whyItMatters:
      'The supervisor pattern is where multi-agent progress UI stops being optional. Wall-clock time is max of the worker times plus plan plus synthesis, so the run has a shape: a planning phase where nothing is parallel yet, a fan-out where three things move at once, and a synthesis that blocks on the slowest worker. That is three distinct states in one component, and the middle one needs per-worker rows with their own sub-question and status. The synthesis conflict is the schema detail: two workers returning contradictory facts must render as a disagreement, because silently picking one side is the failure the user can never detect.',
    learningObjectives: [
      'Explain why fresh context per worker, not smarter prompting, accounts for 80 percent of Anthropic\'s measured research-eval variance.',
      'Compute wall-clock time for a supervisor run as max(worker times) plus plan plus synthesis.',
      'Apply the scale-effort-to-complexity rule to decide agent count for a query.',
      'Identify the three supervisor failure modes, a hallucinated plan, over-exploring workers, and a synthesis conflict, from a run trace.',
      'Design the three-phase progress UI, plan, fan-out, synthesis, a supervisor run needs.',
    ],
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
        heading: 'Guardrails before you deploy one',
        body: 'Anthropic\'s production checklist reads like a systems document, not a prompting tip sheet. Pair models by role: the lead runs on a reasoning-tier model, workers run on a faster, cheaper model, because the lead\'s job is judgment and the workers\' job is throughput. Give every worker a timeout at roughly twice the median runtime; past that, the lead either re-spawns it with a narrower scope or proceeds without it and says so in the synthesis.\n\nCap tokens per worker at some multiple of the expected synthesis input, so one runaway worker cannot blow the run\'s budget alone. Trace the lead\'s plan, every worker\'s tool calls, and the synthesis step, because that trace is the only way to debug a run after the fact. None of this is optional once the pattern runs in production; a supervisor with no timeout and no token cap is one slow page away from an unbounded bill.',
      },
      {
        heading: 'Three failure modes, and the one that lies to users',
        body: 'The lead hallucinates the plan: sub-questions that do not decompose the real question, so workers do precise research on the wrong target. A lead that mis-splits "summarize what changed in multi-agent research since 2023" into three sub-questions about a single 2024 framework will return three confident, well-cited answers to the wrong question, and nothing in synthesis catches that on its own. Workers over-explore: without explicit scope boundaries they drift past their sub-question and pollute synthesis.\n\nSynthesis conflicts: two workers return contradictory facts. The lead must either re-ask, adding a round, or note the disagreement explicitly. Silently picking one side is the worst failure, because the user never learns disagreement happened.',
      },
      {
        heading: 'When supervisor is the wrong pattern',
        body: 'Supervisor is also simply wrong for strictly sequential tasks, since parallelism buys nothing when step two needs step one\'s finished output. It is wrong for simple queries, where a single agent is faster and cheaper and the lead\'s own scale-effort check should catch this before spawning anyone. And it is wrong where audit and replay matter more than adaptability, because delegation is LLM-selected and the same query can route to a different worker split on a different run.\n\nThe tell is in the question you ask before reaching for the pattern: does this task genuinely decompose into independent sub-questions, or does it just look complicated? A task that is one long sequential chain wearing a research question\'s clothes will cost you the 15 times token multiplier for a result a single agent would have produced in one pass.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p16-05-inline-wallclock.svg',
        alt: 'Bar comparison of serial reading versus parallel supervised workers',
        caption: 'Wall clock is max of the workers plus plan plus synthesis, not the sum of the workers.',
        diagramBrief: 'Two horizontal timelines on cream paper. Top: "Single agent, serial" showing five stacked segments back to back (reading paper 1 through 5) ending far right. Bottom: "Lead + 3 workers" showing a short plan segment, then three parallel segments stacked vertically starting at the same point (worker 1/2/3, different lengths), then a synthesis segment starting where the longest worker ends. Total length of the bottom timeline is visibly shorter. One accent color marks the synthesis segment on both.',
      },
      {
        src: '/lessons/p16-05-inline-progress.svg',
        alt: 'Three-phase progress component sketch: plan, fan-out, synthesis',
        caption: 'The supervisor run has three phases, and the middle one needs a dynamic list, not a fixed layout.',
        diagramBrief: 'A UI sketch in three horizontal panels labeled Plan, Fan-out, Synthesis. Plan panel: a single spinner row. Fan-out panel: a variable-height stack of worker rows, show 3 as solid and one more as a dashed placeholder row to signal the count is decided at runtime, each with a sub-question label and a status dot. Synthesis panel: one row with a "waiting on slowest worker" label. Wireframe style, cream paper, black ink, one accent color on the active phase.',
      },
    ],
    takeaways: [
      'Fresh context per worker is the dominant mechanism: 80 percent of the BrowseComp variance was token usage alone, not smarter coordination.',
      'Wall-clock is max of the workers plus plan plus synthesis, so the progress component has three phases and the middle one needs per-worker rows.',
      'The lead decides how many workers to spawn at runtime, so the worker count is a dynamic list, never a fixed layout.',
      'Silently resolving a synthesis conflict is the failure the user cannot detect. Render the disagreement instead.',
    ],
    terms: [
      { term: 'Supervisor', gloss: 'lead agent', meaning: 'An orchestrator agent that plans, delegates, and synthesizes but does not do the work itself.' },
      { term: 'Worker', gloss: 'subagent', meaning: 'A focused agent invoked by the supervisor with narrow scope and its own context window.' },
      { term: 'Orchestrator-worker', gloss: 'supervisor pattern', meaning: 'Same thing, different name. Both terms appear in the 2026 literature.' },
      { term: 'Fresh context', gloss: 'a clean window', meaning: 'A worker\'s context starting from its system prompt and assigned question, not the lead\'s history.' },
      { term: 'Rainbow deployment', gloss: 'a gradual rollout', meaning: 'Gradual rollout that drains old long-running agent versions instead of cutting over.' },
      { term: 'Token dominance', gloss: 'context is the variable', meaning: '80 percent of research-eval variance came from total tokens used, not model choice, per Anthropic.' },
      { term: 'Scale effort', gloss: 'match agent count to complexity', meaning: 'The lead sizing agent count and tool calls to the complexity of the query.' },
      { term: 'Broad then narrow', gloss: 'search wide before you search deep', meaning: 'Decomposing into wide sub-questions first, then spawning depth workers where warranted.' },
      { term: 'Synthesis conflict', gloss: 'workers disagree', meaning: 'Two workers returning contradictory facts that the lead must surface or re-ask, not quietly pick between.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Three workers take 0.4s, 0.6s, and 0.3s. Plan takes 0.1s and synthesis takes 0.2s. Compute wall-clock time.' },
      { level: 'medium', prompt: 'A lead spawns 12 workers for a query a human would call simple. What went wrong, and which rule, scale effort to complexity, should have prevented it?' },
      { level: 'medium', prompt: 'Two workers return contradictory facts during synthesis. Write the lead\'s decision rule: when does it re-ask, and when does it render the disagreement?' },
      { level: 'design', prompt: 'Design the three-phase progress component (plan, fan-out, synthesis) for a research job. What does the fan-out phase show when the lead spawns a dynamic number of workers, say 7, decided at runtime?' },
      { level: 'hard', prompt: 'Anthropic reports multi-agent runs cost roughly 15 times single-agent tokens. Write the one-sentence rule you would put in a product spec for when this cost is justified.' },
    ],
    furtherReading: [
      { label: 'Anthropic engineering, How we built our multi-agent research system', url: 'https://www.anthropic.com/engineering/multi-agent-research-system', why: 'The production reference for the supervisor pattern and its measured numbers.' },
      { label: 'LangGraph, Workflows and Agents', url: 'https://docs.langchain.com/oss/python/langgraph/workflows-agents', why: 'Why the tool-calling supervisor form is now the recommended pattern.' },
      { label: 'LangGraph supervisor reference', url: 'https://reference.langchain.com/python/langgraph-supervisor', why: 'The legacy create_supervisor helper, still used in 2026 production.' },
      { label: 'OpenAI cookbook, Orchestrating Agents: Routines and Handoffs', url: 'https://developers.openai.com/cookbook/examples/orchestrating_agents', why: 'A handoff-based variant of the same supervisor idea.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Supervisor pattern deployment checklist',
      body: '- Lead on a reasoning-tier model, workers on a faster and cheaper one.\n- Worker timeout at roughly 2x median runtime; the lead re-spawns narrower or proceeds without it.\n- Token cap per worker so one runaway worker cannot blow the budget.\n- Trace the plan, every worker\'s tool calls, and the synthesis step for post-hoc debugging.\n- Rainbow rollout for new lead or worker versions; these are long-running, stateful agents, not stateless services you can blue-green.\n- A synthesis-conflict rule: re-ask and pay a round, or render the disagreement. Never pick silently.',
    },
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
    readTime: '~10 min read',
    diagram: '/lessons/p16-06.svg',
    diagramCaption:
      'A three-level tree where every internal node plans, delegates, and synthesizes, and only leaves do work.',
    whyItMatters:
      'Depth is where attribution breaks. In a flat supervisor, a wrong claim traces back one hop to a named worker. In a three-level tree, the claim passed through two summarization steps, so the trace needs the whole path plus what each level actually said. That is a nested, expandable trace with a diff at each hop, because the recurring bug is meaning drifting one level at a time ("unable to verify X" arriving as "X not confirmed"). Consensus loops make it worse: a step limit is now a hyperparameter your UI has to surface as "reconciliation attempt 3 of 5", or the run just looks hung.',
    learningObjectives: [
      'Distinguish hierarchical from flat supervisor by counting who plans, delegates, and synthesizes versus who only executes.',
      'Diagnose a task-assignment error versus an output-misinterpretation error from where in the tree the failure surfaces.',
      'Decide, given a task, whether it needs hierarchy or is a linear flow pretending to be a tree.',
      'Apply the depth-2 ceiling and reconciliation-budget guardrails before shipping a manager tree.',
      'Design a nested, expandable attribution trace that shows meaning drift at each level.',
    ],
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
      {
        heading: 'Guardrails that make hierarchical shippable',
        body: 'Four guardrails separate a hierarchy that ships from one that quietly rots. Cap tree depth at two levels; a third level already hides most errors from anyone watching the run, because each level is one more summarization step between the mistake and the person who could catch it. Set an explicit reconciliation budget, usually two rounds, before the top manager must commit to an answer rather than asking sub-managers to keep reconciling.\n\nRequire provenance on every synthesis: each node\'s summary must cite which leaf outputs produced it, so a wrong claim has a path back to its source. And add a canary question, one worker at each sub-manager level that is always asked the original, unmodified user question. When the canary\'s answer disagrees with what the tree eventually synthesizes, that disagreement is the cheapest signal you will ever get that decomposition drifted somewhere above it.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p16-06-inline-tree.svg',
        alt: 'Three-level manager tree with a provenance path highlighted',
        caption: 'A claim in the top synthesis traces back through two summarization steps to the leaf that actually produced it.',
        diagramBrief: 'A three-level tree diagram on cream paper: one top manager node, two sub-manager nodes beneath it, five worker leaf nodes beneath those. Standard black ink lines for the tree. One accent-colored path highlighted from a single leaf up through its sub-manager to the top node, with small annotation marks at each hop reading "summarized here".',
      },
      {
        src: '/lessons/p16-06-inline-misroute.svg',
        alt: 'A legal question misrouted to a finance branch',
        caption: 'Nothing crashes. Every level does competent work on the wrong assignment, and the gap only shows up at the top.',
        diagramBrief: 'A simple before/after two-column diagram. Left column "Asked": engineering + legal, two labeled boxes. Right column "Delivered": engineering + finance, two labeled boxes, with the legal box from the left crossed out faintly and a finance box added with no connecting line back to the original ask. One accent color on the mismatch, the crossed-out legal box and the unconnected finance box.',
      },
    ],
    takeaways: [
      'Hierarchical earns its keep only when the task has genuinely independent sub-teams. One linear flow pretending to be a tree should be sequential.',
      'Local summarization saves the top manager\'s context and is simultaneously where meaning drifts one level at a time.',
      'A task assignment error surfaces at top synthesis, one level away from where anyone could have caught it, so the trace must show the path, not the result.',
      'Consensus loops make the step limit a hyperparameter, which means the UI has to show reconciliation attempt N of M or the run reads as hung.',
    ],
    terms: [
      { term: 'Hierarchical architecture', gloss: 'org chart pattern', meaning: 'Nested supervisors, managers over sub-managers over workers, with only leaves doing work.' },
      { term: 'Local summarization', gloss: 'the sub-manager\'s condensed report', meaning: 'A sub-manager condensing its team\'s output before the level above reads it.' },
      { term: 'Task assignment error', gloss: 'the boss assigned it wrong', meaning: 'A manager hallucinating a decomposition and delegating precise work on the wrong target.' },
      { term: 'Output misinterpretation', gloss: 'the message got retold wrong', meaning: 'Meaning shifting as each level rewrites the level below\'s conclusion.' },
      { term: 'Consensus loop', gloss: 'endless meetings', meaning: 'Sub-managers repeatedly re-delegating a disagreement without converging.' },
      { term: 'Process.hierarchical', gloss: 'CrewAI\'s manager mode', meaning: 'CrewAI\'s manager-LLM mode that assigns, evaluates, and can re-delegate crew work.' },
      { term: 'Decomposition drift', gloss: 'the boss lost the plot', meaning: 'The manager\'s current split no longer covers what the user actually asked.' },
      { term: 'Depth-2 ceiling', gloss: 'do not go deeper than 2 levels', meaning: 'An empirical guardrail: a third level of management collapses observability.' },
      { term: 'Canary question', gloss: 'ground truth at every level', meaning: 'A worker always asked the original, unmodified query, used to detect drift.' },
      { term: 'Provenance chain', gloss: 'who said what', meaning: 'A trace from each synthesis back to the leaf outputs that produced it.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A task has three levels: top manager to two sub-managers to five workers. A claim in the final synthesis is wrong. How many hops does the attribution trace need to walk to find the point of drift?' },
      { level: 'medium', prompt: 'A manager decomposes "review the contract" into engineering and finance branches, missing legal. Where does this error first become visible to a human, and where should it become visible?' },
      { level: 'medium', prompt: 'Design a canary question: a worker at each sub-manager that is always asked the original, unmodified user question. What should happen when the canary\'s answer disagrees with the synthesized answer?' },
      { level: 'design', prompt: 'Build the nested, expandable trace UI for a three-level hierarchy. At each hop, what diff do you show between what a level was told and what it reported upward?' },
      { level: 'hard', prompt: 'CrewAI\'s Process.hierarchical caps reconciliation with a step limit. Argue for a specific number (2, 3, 5) and what UI element tells the user which attempt they are watching.' },
    ],
    furtherReading: [
      { label: 'CrewAI introduction, Process.hierarchical', url: 'https://docs.crewai.com/en/introduction', why: 'The textbook hierarchical process with a manager LLM.' },
      { label: 'LangGraph supervisor reference', url: 'https://reference.langchain.com/python/langgraph-supervisor', why: 'Nested supervisors via create_supervisor, LangGraph\'s hierarchical form.' },
      { label: 'Anthropic engineering, Research system', url: 'https://www.anthropic.com/engineering/multi-agent-research-system', why: 'Why Anthropic deliberately chose a flat supervisor over a hierarchical one.' },
      { label: 'Cemri et al., Why Do Multi-Agent LLM Systems Fail? (arXiv:2503.13657)', url: 'https://arxiv.org/abs/2503.13657', why: 'The MAST taxonomy; its coordination-failure section documents decomposition drift directly.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Hierarchical architecture guardrail checklist',
      body: '- Cap tree depth at 2 levels.\n- Explicit reconciliation budget, usually 2 rounds, before the top manager commits.\n- Provenance on every synthesis: each summary cites the leaf outputs behind it.\n- A canary worker at each sub-manager level, always asked the original unmodified question.\n- Alert when the manager\'s logged decomposition no longer covers the original user query.',
    },
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
    title: 'Planner, executor, critic, verifier: the verifier holds the veto',
    oneLiner:
      'Three coders in a group chat write three flavors of the same mediocre code. The fix is not more agents, it is different ones, and one of them must be a verifier whose pass or fail is decided by code. PwC moved accuracy from 10 percent to 70 percent by adding that one role.',
    readTime: '~10 min read',
    diagram: '/lessons/p16-08.svg',
    diagramCaption:
      'The four roles and their distinct tool sets: planner, executor, critic (subjective, LLM), verifier (objective, code).',
    whyItMatters:
      'Critic and verifier produce different schemas, so they cannot share a component. A critic returns accept or reject plus prose reasons, which renders as reviewable commentary you can disagree with. A verifier returns pass or fail plus evidence (a test name, an exit code, a schema path), which renders as a gate: the primary action is disabled and the failing check is named. Collapse them into one "review" panel and you lose the only signal a user can act on without reading. MAST traced 1642 failures and found 21.3 percent were pure verification gaps, meaning the system shipped an answer nothing had checked.',
    learningObjectives: [
      'Distinguish a critic\'s schema, accept/reject plus prose, from a verifier\'s schema, pass/fail plus evidence.',
      'Explain why an all-LLM role roster is a named MAST failure mode rather than a staffing choice.',
      'Apply communicative dehallucination: write a role-prompt clause that makes an agent ask instead of invent.',
      'Order a four-role pipeline (planner, executor, critic, verifier) by cost, running cheap checks before slow ones.',
      'Design a UI gate that disables a primary action until a named verifier check passes.',
    ],
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
        heading: 'Why verification decides the outcome',
        body: 'Cemri et al. (MAST, arXiv:2503.13657) traced 1642 multi-agent execution failures. 21.3 percent were verification gaps, meaning the system shipped an answer nobody had checked. The remaining 79 percent often trace back to a check that failed silently or was never run at all.\n\nPwC reported, across CrewAI deployments in 2025, that adding a structured validation loop moved accuracy from 10 percent to 70 percent. A 7 times gain from one role, and the gain came from adding a verifier, not from adding another coder or another round of critique. That is the number worth remembering when a system underperforms: check the roster for a verifier before you reach for a bigger model.',
      },
      {
        heading: 'Order the roles by cost, not by instinct',
        body: 'Run critic before verifier, not the other way round. A critic is a single LLM call: cheap, fast, and good at catching design and taste issues a test suite has no vocabulary for, a misleading variable name, a function doing two jobs, an approach that technically works but will not survive the next requirement. A verifier is slower: it compiles, runs a sandbox, executes a test suite, and only then returns pass or fail.\n\nCatching the cheap issues first means the expensive verifier only runs on artifacts that already cleared the cheap bar, which is strictly more efficient than running both in parallel and reconciling. Cap the critic-executor revision loop at two rounds before escalating to a human; a critic that keeps rejecting past round two is usually disagreeing with the plan, not the code, and no amount of re-execution fixes a disagreement one level up.',
      },
      {
        heading: 'The roster is the design decision, not the framework',
        body: 'Every major framework already gives you the surface to build this roster: CrewAI\'s Agent(role, goal, backstory) is the textbook specialization primitive, LangGraph lets you write specialized prompts per node with edges that enforce the pipeline order, AutoGen names role-specific ConversableAgents inside a GroupChat, and the OpenAI Agents SDK wires role-specialized agents together with handoff tools.\n\nNone of these frameworks ship a verifier for you by default; each treats verification as just another agent unless you deliberately wire a deterministic check into the loop. That is the actual decision a team makes when it adopts one of these frameworks, not which framework, but which of the four roles get a real implementation and which get skipped because an LLM playing the part felt close enough at the time.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p16-08-inline-schema.svg',
        alt: 'Critic and verifier return different shapes',
        caption: 'A critic returns prose you can argue with. A verifier returns evidence you cannot.',
        diagramBrief: 'Two-panel comparison on cream paper. Left panel "Critic": a speech-bubble icon containing the words "accept / reject + reasons", styled as commentary with a dashed border and an editable feel. Right panel "Verifier": a gate icon, a barrier or turnstile shape, containing "pass / fail + evidence" with a small test-name tag, styled as a hard block with a solid border and a locked feel. One accent color on the verifier gate to signal it is the one that blocks an action.',
      },
      {
        src: '/lessons/p16-08-inline-mast.svg',
        alt: 'MAST failure taxonomy and the PwC accuracy jump',
        caption: '21.3 percent of 1642 traced failures were pure verification gaps. Adding one verifier moved PwC\'s accuracy from 10 to 70 percent.',
        diagramBrief: 'Two small charts side by side on cream paper. Left: a horizontal stacked bar labeled "1642 failures" split into two segments, one shaded segment at 21.3 percent labeled "verification gaps", the rest at 78.7 percent labeled "other causes". Right: a simple before/after bar pair labeled "10%" and "70%" with an arrow between them labeled "+1 verifier role". One accent color used consistently for the verifier-related segments in both charts.',
      },
    ],
    takeaways: [
      'Critic and verifier are different roles with different schemas: prose reasons you can argue with versus pass or fail with evidence you cannot.',
      'At least one role\'s verdict must be decided by code. An all-LLM roster where everything is "looks good to me" is a named MAST failure.',
      'MAST found 21.3 percent of 1642 failures were pure verification gaps, so the missing role is usually the verifier, not another executor.',
      'Communicative dehallucination is a prompt clause: when a detail is missing, ask the role that owns it by name instead of inventing it.',
    ],
    terms: [
      { term: 'Planner', gloss: 'the one who makes the plan', meaning: 'The role that turns a goal into a structured plan or spec.' },
      { term: 'Executor', gloss: 'the one who does the work', meaning: 'The role that produces the artifact from one plan step, holding the real work tools.' },
      { term: 'Critic', gloss: 'an LLM reviewer', meaning: 'An LLM reviewing an artifact for quality, subjective and foolable by plausible prose.' },
      { term: 'Verifier', gloss: 'a deterministic check', meaning: 'A deterministic program returning pass or fail with evidence, decided by code not judgment.' },
      { term: 'Code = SOP(Team)', gloss: 'an encoded standard operating procedure', meaning: 'MetaGPT\'s formulation: encoding standard operating procedures as role prompts to make a team predictable.' },
      { term: 'Communicative dehallucination', gloss: 'ask before inventing', meaning: 'ChatDev\'s rule that an agent must ask the owning role for a missing detail rather than invent it.' },
      { term: 'Verification gap', gloss: 'no one checked', meaning: 'A shipped answer that no deterministic check ran against, 21.3 percent of MAST\'s traced failures.' },
      { term: 'Revision loop', gloss: 'the critic sends it back', meaning: 'A critic rejection triggering an executor re-run with feedback, which needs a round budget.' },
      { term: 'All-LLM anti-pattern', gloss: 'looks good to me', meaning: 'Every role is an LLM, no deterministic check anywhere in the loop; a classic MAST failure.' },
      { term: 'Role specialization', gloss: 'different agents, different jobs', meaning: 'Distinct system prompts tuned for planner, executor, critic, and verifier roles.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Given a code artifact, a critic returns "accept, looks well structured" and a verifier returns "fail, assertion error on line 12". Which one gates the merge button?' },
      { level: 'medium', prompt: 'Write the role-prompt clause that implements communicative dehallucination for an executor that is missing a required config value.' },
      { level: 'medium', prompt: 'MAST found 21.3 percent of 1642 failures were pure verification gaps. Name a task type where a deterministic verifier is not possible, and describe what you would use instead.' },
      { level: 'design', prompt: 'Design the two components a critic-plus-verifier system needs: a commentary panel and a gate. What does each render when the two roles disagree with each other?' },
      { level: 'hard', prompt: 'PwC measured a 7x accuracy gain, 10 percent to 70 percent, from adding one structured validation loop. Sketch the before and after roster and name which role was missing.' },
    ],
    furtherReading: [
      { label: 'Hong et al., MetaGPT: Meta Programming for Multi-Agent Collaboration (arXiv:2308.00352)', url: 'https://arxiv.org/abs/2308.00352', why: 'The SOP-as-role-prompt reference paper, five roles with strict schemas.' },
      { label: 'Qian et al., Communicative Agents for Software Development, ChatDev (arXiv:2307.07924)', url: 'https://arxiv.org/abs/2307.07924', why: 'The chat-chain design plus communicative dehallucination in detail.' },
      { label: 'Cemri et al., Why Do Multi-Agent LLM Systems Fail? (arXiv:2503.13657)', url: 'https://arxiv.org/abs/2503.13657', why: 'The MAST taxonomy; verification gaps are 21.3 percent of traced failures.' },
      { label: 'CrewAI docs, Agent roles', url: 'https://docs.crewai.com/en/introduction', why: 'The production role-specification surface referenced by the roster mapping above.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Role roster checklist',
      body: '- At least one role\'s verdict is decided by code, never all-LLM.\n- Explicit input/output schema per role: the planner returns a spec, not prose.\n- Communicative dehallucination clause: an agent asks the role that owns a missing detail instead of inventing it.\n- Critic runs before verifier; cheap checks first, expensive checks second.\n- Loop budget: max 2 critic-executor revision rounds before escalating to a human.',
    },
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
    readTime: '~10 min read',
    diagram: '/lessons/p16-09.svg',
    diagramCaption:
      'Workers pulling from one shared queue with no central decider, each writing results and optionally enqueuing follow-ups.',
    whyItMatters:
      'A swarm has no central log, which means there is no run to render. Supervisor gives you a plan and a position in it. A swarm gives you a queue depth, a per-worker current task, and a completion count, so the honest surface is a throughput dashboard, not a progress bar with a percentage. Partial results are the normal state rather than an error state: 340 of 500 done, 4 workers busy, 12 tasks aged past their priority window. Starvation is a UI problem too, because a long task that never gets pulled looks identical to a task that is quietly running.',
    learningObjectives: [
      'Explain why a swarm has no run to render and what dashboard fields replace a progress bar.',
      'Compute the fit of swarm versus supervisor for a given task using independence, duration variance, and ordering requirements.',
      'Diagnose starvation from a completion-count trace and apply one of three mitigations.',
      'Distinguish worker idempotency requirements in a swarm from the state assumptions a supervisor pattern makes.',
      'Design a throughput dashboard showing queue depth, per-worker current task, and completion count.',
    ],
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
        body: 'If all workers pull the fastest available task, long-running tasks never get picked until they are the only ones left. That is classic queue starvation, and in an agent swarm it reads as a task that simply never happens, not as an error anyone gets paged for.\n\nThree mitigations work. Priority queues with explicit aging, so a task\'s priority rises the longer it waits. Worker specialization, where some workers only take long tasks, so they never compete with fast ones for the queue\'s attention. Back-pressure, limiting how many fast tasks enter the queue at all, so producers slow down before workers drown.',
      },
      {
        heading: 'Production hygiene: idempotency and durable queues',
        body: 'A swarm\'s queue assumption breaks quietly if you skip two properties. Worker idempotency: a worker can crash mid-task, and the task gets pulled again by another worker, so every task must produce the same result whether it runs once or twice. An update that increments a counter is not idempotent; an update that sets a value to a specific state is.\n\nDurable queues: an in-process queue disappears the moment the process restarts, which is fine for a demo and unacceptable in production. Kafka, Redis Streams, or a database-backed queue survive a crash and let a worker resume where the fleet left off. Add a trace ID to every task and have every worker log start and end against it; that log is the only replacement you get for the central log a supervisor pattern gives you for free.',
      },
      {
        heading: 'Content-based routing, and where swarm ends',
        body: 'Swarm pairs naturally with content-based routing: instead of one generic queue, run one queue per message type and let specialist workers subscribe only to theirs. A scraping swarm might route by domain, a document-processing swarm by file type. This is the basis for message-bus architectures that scale to thousands of agents, because no single queue becomes a shared point of contention.\n\nIt is also where the honest limit of the pattern sits. Content-based routing solves distribution, not coherence. A swarm of routed workers still cannot hold a plan across tasks, cannot notice that two of its results contradict each other, and cannot decide when the whole job is actually done rather than merely empty of pending tasks. Those are supervisor problems, and pretending a well-routed swarm has solved them is how a throughput win quietly becomes a correctness bug.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p16-09-inline-queue.svg',
        alt: 'Four workers under fixed assignment versus a shared queue',
        caption: 'Fixed assignment leaves fast workers idle. A shared queue keeps every worker busy until the work runs out.',
        diagramBrief: 'Two-panel comparison on cream paper. Left panel "Fixed assignment": four worker lanes, each with pre-assigned task blocks of different lengths, three lanes ending early and shown with a hatched idle fill for the remaining time, one lane running long. Right panel "Shared queue": four worker lanes pulling variable-length blocks from a shared queue icon, all four lanes ending at roughly the same time with no idle fill, uneven block counts per lane labeled 5 / 2 / 3 / 2. One accent color on the idle hatching in the left panel to make the waste visible.',
      },
      {
        src: '/lessons/p16-09-inline-starvation.svg',
        alt: 'Priority aging rescuing a long task from starvation',
        caption: 'A starved long task and a slow-but-running task look identical from the outside. Priority aging is what tells them apart.',
        diagramBrief: 'A timeline diagram on cream paper showing one long task entering a queue at time 0, with its priority value drawn as a rising line as short tasks keep cutting ahead of it, crossing an accent-colored threshold line at which point it finally gets pulled. A small annotation at the crossing point reads "priority now exceeds incoming short tasks". Below it, a second identical-looking task with no aging rule is shown as a flat line that never crosses the threshold, labeled "never runs".',
      },
    ],
    takeaways: [
      'Swarm trades determinism and traceability for scale. Say that out loud before choosing it, because the debugging cost lands later.',
      'There is no plan, so there is no progress bar. The honest surface is queue depth, per-worker current task, and completion count.',
      'Partial results are the normal state in a swarm, not an error state, so the UI has to make 340 of 500 legible rather than pending.',
      'Starvation renders identically to slow progress, so aged priority or long-task workers is a UX fix as much as a scheduling one.',
    ],
    terms: [
      { term: 'Swarm architecture', gloss: 'decentralized agents', meaning: 'Workers pulling tasks from shared queues with no central orchestrator.' },
      { term: 'Event bus semantics', gloss: 'agents subscribe to topics', meaning: 'Coordination encoded in queue and topic behavior rather than in an agent\'s reasoning.' },
      { term: 'Starvation', gloss: 'a task never runs', meaning: 'Long-running tasks never getting pulled because workers keep taking faster ones.' },
      { term: 'Priority aging', gloss: 'the queue remembers how long you waited', meaning: 'Raising a queued task\'s priority the longer it waits, to break starvation.' },
      { term: 'Back-pressure', gloss: 'slow down the producer', meaning: 'Limiting how much work enters the queue to protect throughput and fairness.' },
      { term: 'Matrix', gloss: 'a full message-passing swarm', meaning: 'arXiv:2511.21686, a framework serializing both control and data flow as messages on distributed queues.' },
      { term: 'Hot-spotting', gloss: 'one worker drowns', meaning: 'A load imbalance where one worker ends up handling most of the tasks.' },
      { term: 'Idempotent worker', gloss: 'safe to re-run', meaning: 'A task processed twice produces the same result, required because workers may crash mid-run.' },
      { term: 'Durable queue', gloss: 'survives crashes', meaning: 'A queue backed by disk or replicated storage; tasks are not lost when a worker crashes.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Four workers, 12 tasks of mixed duration. Fixed assignment gives 3 tasks each. Explain why a shared queue instead gives an uneven split like 5/2/3/2, and why that is correct.' },
      { level: 'medium', prompt: 'A worker crashes mid-task. The task gets pulled again by another worker. What property must every worker have for this to be safe?' },
      { level: 'medium', prompt: 'Design a priority-aging rule that prevents a long task from starving under continuous arrival of short tasks.' },
      { level: 'design', prompt: 'Design the throughput dashboard for a 500-task swarm run: what three numbers replace the progress bar, and how do you render a task that has been aged past its priority window without it reading as an error?' },
      { level: 'hard', prompt: 'Matrix (arXiv:2511.21686) serializes both control and data flow as queue messages. Name one thing this buys in scalability and one thing it costs in traceability, in your own words.' },
    ],
    furtherReading: [
      { label: 'LangGraph, Workflows and Agents, Swarm Architecture', url: 'https://docs.langchain.com/oss/python/langgraph/workflows-agents', why: 'Explicit swarm support inside a graph-native framework.' },
      { label: 'Matrix, A Decentralized Framework for Multi-Agent Systems (arXiv:2511.21686)', url: 'https://arxiv.org/abs/2511.21686', why: 'The full message-passing swarm that removes the orchestrator entirely.' },
      { label: 'Anthropic engineering, Research system', url: 'https://www.anthropic.com/engineering/multi-agent-research-system', why: 'Why a specific production system chose supervisor over swarm, and what that decision cost.' },
      { label: 'AutoGen v0.4, actor-model docs', url: 'https://microsoft.github.io/autogen/stable/', why: 'The event-driven actor rewrite, closer to swarm than v0.2\'s GroupChat.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Swarm production checklist',
      body: '- Priority queue with explicit aging to prevent long-task starvation.\n- Every worker is idempotent: a task pulled twice produces the same result.\n- A durable queue (Kafka, Redis Streams, or a database-backed queue), not an in-memory one, backs production traffic.\n- Every task carries a trace ID; every worker logs start and end against it.\n- Back-pressure on the producer once queue depth outpaces worker throughput.',
    },
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
