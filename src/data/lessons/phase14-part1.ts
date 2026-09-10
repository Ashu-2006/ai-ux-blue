import type { Lesson } from '@/lib/lessons';

// Phase 14 · Part 1 · The agent loop and reasoning (lessons 14.01-14.06, 14.11)
export const phase14Part1: Lesson[] = [
  {
    id: 'p14-01-agent-loop',
    phase: 'Phase 14 · Agent Engineering',
    part: 'Part 1 · The agent loop and reasoning',
    index: '14.01',
    title: 'The agent loop: observe, think, act',
    oneLiner:
      'Every agent shipping in 2026 runs a variant of the ReAct loop from 2022: think, call a tool, read the result, repeat until a stop condition fires. Everything else is scaffolding.',
    readTime: '~10 min read',
    diagram: '/lessons/p14-01.svg',
    diagramCaption:
      'One iteration of the loop: message buffer, model turn, tool dispatch, observation appended, stop condition checked.',
    whyItMatters:
      'A chat UI renders one request and one response. An agent run renders 40 to 400 steps, and the loop is the state machine your components own. Each iteration renders live: a reasoning block, a tool call with arguments, an observation that may be a 400 error. Your run view needs a per-step status, a turn counter against a budget, and a stop reason that distinguishes finished, capped, and guardrail-tripped. Those three stop reasons are three different empty states, not one toast. Tool output is also untrusted input, so the observation block is where you mark provenance rather than letting it read as the agent speaking.',
    learningObjectives: [
      'Name the three parts of one ReAct turn (Thought, Action, Observation) and say which part carries the plan across steps.',
      'Set a turn budget for a task class, using Anthropic\'s guidance that production agents run 40 to 400 steps per task.',
      'Distinguish the three stop reasons (finished, capped, guardrail-tripped) and map each to its own terminal UI state.',
      'Match a 2026 framework (Claude Agent SDK, OpenAI Agents SDK, LangGraph, AutoGen v0.4) to the layer it adds around the invariant loop.',
      'Write an observation formatter that turns a tool\'s error response into a readable string instead of a crash.',
    ],
    sections: [
      {
        heading: 'The problem: a model alone cannot check anything',
        body: 'An LLM by itself is autocomplete. Ask it a question, get a string back. It cannot read a file, run a query, open a browser, or verify a claim, and if its training data is stale it states the wrong thing with full confidence and stops there.\n\nAgents fix this with one pattern: a loop that lets the model pause, call a tool, read the result, and keep thinking. That is the whole idea behind every agent product shipping in 2026, from a coding assistant to a browser operator. Memory, planning, subagents, debate, and evals in the rest of this phase are all scaffolding built around this one loop, so it is worth learning cold before touching any framework.',
      },
      {
        heading: 'ReAct: the canonical three-part turn',
        body: 'Yao et al. (ICLR 2023, arXiv:2210.03629) named the format Reason plus Act. Each turn emits a Thought, an Action, and an Observation, in that order, in one stream. Thought: I need the capital of France. Action: search("capital of France"). Observation: Paris is the capital of France.\n\nThe original paper measured three absolute wins over imitation and RL baselines: plus 34 points success rate on ALFWorld with only one or two in-context examples, plus 10 points on WebShop, and recovery from hallucination on HotpotQA because every step is grounded in retrieval.\n\nThe reasoning trace does three things action-only prompting cannot: induce a plan, carry the plan across steps, and handle the exception when an action returns something unexpected. That third one is the reason a bare function-calling loop without a Thought step still drifts on anything longer than two hops.',
      },
      {
        heading: 'The 2026 shift: reasoning moved to its own channel',
        body: 'Printing "Thought:" as literal tokens was a 2022 workaround. The Responses API lineage replaced it with native reasoning: the model emits reasoning content on a separate channel, and that channel is passed through turns, encrypted across providers in production. Letta V1 deprecated the old send_message plus heartbeat scheme for exactly this reason.\n\nClaude\'s extended thinking and OpenAI\'s o-series reasoning tokens both ship this as a distinct block type rather than a string embedded in the answer. What did not change is the control flow. Observe, think, act, observe, think, act, stop. For the interface this is a schema change, not a behaviour change: reasoning is now a distinct block type you can collapse by default instead of a substring you have to parse out of the answer, and a run view that still greps for "Thought:" is reading a 2022 transcript format.',
      },
      {
        heading: 'Five ingredients, and what each one costs you in UI',
        body: 'Miss any one and you have a chatbot, not an agent. A message buffer that grows: user, assistant, tool, assistant, tool, final. A tool registry the model invokes by name. A stop condition: an explicit finish call, an assistant turn with no tool calls, max turns, max tokens, or a tripped guardrail. A turn budget, because Anthropic\'s computer use guidance says dozens to hundreds of steps per task is normal and the right cap is per task class. And an observation formatter, because every 400 error in your stack has to arrive as a readable observation string rather than a crash.\n\nThe budget and the stop reason are the two the user has to see. The other three, buffer, registry, formatter, are plumbing a user should never notice unless it breaks.',
      },
      {
        heading: 'Why the loop is invariant across every framework',
        body: 'Claude Agent SDK, OpenAI Agents SDK, LangGraph, AutoGen v0.4, CrewAI, Agno, Mastra: all of them run a ReAct-shaped loop underneath. What differs is what lives around it: state checkpointing in LangGraph, actor-model message passing in AutoGen v0.4, role templates in CrewAI, tracing spans in OpenAI Agents SDK.\n\nThat invariance is the reason picking a framework is an ergonomics decision, not a control-flow decision. Once you own the loop, evaluating a new framework is a matter of asking what it makes easy to render: does it checkpoint state so a run can resume after a crash, does it expose a tracing span per tool call, does it give you a native reasoning block or a string you have to parse.',
      },
      {
        heading: 'Three ways the loop breaks in production',
        body: 'Trust boundary collapse is the first. Tool output is untrusted input: a PDF the agent retrieved from the web can carry an instruction the model treats as a command. OpenAI\'s computer-use docs are explicit that only direct instructions from the user count as permission, which is why an observation block needs a provenance marker rather than reading as the agent\'s own voice.\n\nCascading failure is the second. Agents cannot reliably tell "I failed" from "this is impossible," and a 400 error four calls deep often gets reported back as success. Loop length explosion is the third: most 2026 agents run 40 to 400 steps, and debugging a wrong decision at step 38 requires that step 38 was actually recorded, with its reasoning block, its tool call, and its observation intact.\n\nAll three point at the same fix: the trace is not a debugging nicety, it is the only way anyone finds out what happened.',
      },
      {
        heading: 'Reading a trace like an engineer',
        body: 'A trace worth reading has five fields per turn: a turn index against the budget, the reasoning block collapsed by default, the tool call with its arguments, the observation with a provenance tag, and the stop reason if the turn ended the run. Anthropic, OpenAI, and Bedrock all require a tool_use_id correlator once calls run in parallel, because two tool calls in one turn can return out of order and a swapped ID routes the wrong result to the wrong call.\n\nA run view that only shows the final answer is throwing away the one artifact that makes a 400-step agent debuggable. Ship the trace as a first-class object, not a side effect of logging, and the "why did it do that" question becomes a scroll instead of a guess.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p14-01-inline-trace-schema.svg',
        alt: 'One turn of an agent trace, field by field',
        caption: 'Each turn carries a turn index, a collapsible reasoning block, a tool call with arguments, and an observation tagged with provenance.',
        diagramBrief: 'ASCII-style diagram: a single horizontal row labeled "Turn 12 of 80". Below it, four stacked boxes left to right: "Reasoning (collapsed)", "Tool call: search(query)", "Observation: tagged [tool output, untrusted]", "Stop reason: none, loop continues". Style: cream paper background, black ink line art, one blue accent highlighting the provenance tag on the observation box.',
      },
      {
        src: '/lessons/p14-01-inline-stop-reasons.svg',
        alt: 'Three stop reasons as three distinct terminal states',
        caption: 'Finished, capped, and guardrail-tripped are three different endings, not one toast.',
        diagramBrief: 'Three small panels side by side, each showing a run ending. Panel 1 "Finished": a checkmark icon, label "explicit finish call". Panel 2 "Capped": a clock icon, label "turn budget reached, 80 of 80". Panel 3 "Guardrail-tripped": a shield icon, label "policy violation detected". Style: cream paper, black ink, one accent color per panel (green, amber, red) to reinforce these are visually distinct states.',
      },
    ],
    takeaways: [
      'An agent run is a state machine with 40 to 400 steps, not one request. Render the turn counter against the budget from the first step.',
      'There are at least three stop reasons: finished, budget exhausted, guardrail tripped. Each one is a different terminal state in the UI.',
      'Tool output is untrusted input. Mark observation provenance in the transcript so an injected instruction never reads as the agent\'s own voice.',
      'Reasoning is now a separate channel, so the transcript schema has a collapsible block type rather than a string you parse.',
    ],
    terms: [
      { term: 'ReAct', gloss: '"reasoning and acting"', meaning: 'The loop format that interleaves Thought, Action, and Observation in one stream (Yao et al., 2022).' },
      { term: 'Observation', gloss: '"the tool result"', meaning: 'The string form of a tool result, fed back into the next model prompt, tagged with provenance.' },
      { term: 'Reasoning channel', gloss: '"thinking tokens"', meaning: 'Native model reasoning emitted on a separate stream and passed through turns, distinct from the visible answer.' },
      { term: 'Stop condition', gloss: '"the exit clause"', meaning: 'The rule that ends the loop: explicit finish, no tool calls, max turns, max tokens, or a guardrail trip.' },
      { term: 'Turn budget', gloss: '"max steps"', meaning: 'A hard cap on iterations, set per task class rather than globally, because agents run 40 to 400 steps.' },
      { term: 'Trace', gloss: '"the transcript"', meaning: 'The full recorded sequence of thought, action, and observation tuples for one run, with turn index and stop reason.' },
      { term: 'Tool registry', gloss: '"the function list"', meaning: 'The name-to-callable map the model invokes by name, with schema validation on the way in.' },
      { term: 'Message buffer', gloss: '"the conversation"', meaning: 'The growing sequence of user, assistant, and tool turns that gets replayed into the model on every step.' },
      { term: 'Trust boundary', gloss: '"input from the model"', meaning: 'The line between instructions the user gave and text a tool retrieved, which the model cannot tell apart on its own.' },
      { term: 'Provenance', gloss: '"where this came from"', meaning: 'A marker on an observation that says it came from a tool, not from the user, so it never reads as a command.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A task class averages 8 steps per subtask and the turn budget is 50. How many subtasks fit in one run before the cap trips?' },
      { level: 'medium', prompt: 'A tool call returns a 429 rate-limit error at step 12 of a 40-step budget. Write the observation string the loop should feed back, and say what stop reason applies if the model retries the identical call three times in a row.' },
      { level: 'hard', prompt: 'Compare an explicit finish tool against a "no tool calls means done" stop path. Which one fails more safely when the model silently stalls, and what backup condition does the other one need?' },
      { level: 'design', prompt: 'Sketch a run view for a 120-step agent task. Decide what renders by default versus what collapses, where the turn counter sits relative to the budget, and how the three stop reasons (finished, capped, guardrail-tripped) become three visually distinct endings instead of one toast.' },
    ],
    furtherReading: [
      { label: 'Yao et al., ReAct: Synergizing Reasoning and Acting in Language Models (arXiv:2210.03629)', url: 'https://arxiv.org/abs/2210.03629', why: 'The canonical paper. Read the ALFWorld and HotpotQA sections for the actual point deltas.' },
      { label: 'Anthropic, Building Effective Agents', url: 'https://www.anthropic.com/research/building-effective-agents', why: 'The clearest statement of when a loop earns its complexity versus a fixed workflow.' },
      { label: 'Letta, Rearchitecting the Agent Loop', url: 'https://www.letta.com/blog/letta-v1-agent', why: 'The native-reasoning rewrite that replaced literal Thought tokens with a passed-through channel.' },
      { label: 'Claude Agent SDK overview', url: 'https://platform.claude.com/docs/en/agent-sdk/overview', why: 'The 2026 production harness shape: built-in tools, subagents, lifecycle hooks around this loop.' },
      { label: 'OpenAI Agents SDK docs', url: 'https://openai.github.io/openai-agents-python/', why: 'Handoffs, Guardrails, Sessions, and Tracing as the layer wrapped around the same invariant loop.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Agent run view checklist',
      body: '- Turn counter rendered against the budget, not hidden behind a spinner\n- Reasoning block present and collapsed by default, not parsed out of a string\n- Every tool call shows its arguments and a distinct tool_use_id\n- Every observation carries a provenance tag (tool output, not user or agent speech)\n- Three stop reasons render as three different terminal states: finished, capped, guardrail-tripped\n- A failed step at turn N is inspectable on its own, not buried in a wall of text\n- 400 and other tool errors arrive as readable observation strings, never as a blank crash',
    },
    demoCaption:
      'Step through one agent run and watch what each iteration appends to the buffer. Note where the turn counter sits against the cap, and which of the three stop reasons ends the run.',
    demo: {
      archetype: 'sequence',
      subject: 'Agent run',
      badLabel: 'Chat framing',
      goodLabel: 'Loop framing',
      badSequence: [
        'User sends a request',
        'Model streams one answer',
        'UI shows a spinner until done',
        'Run ends, no record of steps',
      ],
      goodSequence: [
        'User request enters the message buffer',
        'Model turn: reasoning block plus a tool call',
        'Runtime dispatches the tool, validates arguments',
        'Observation appended (may be a 400 error string)',
        'Turn counter checked against the budget',
        'Loop repeats or a stop reason terminates the run',
      ],
      badCaption:
        'One spinner for the whole run hides 40 to 400 decisions. When it fails at step 38 there is nothing to show the user and nothing to debug against.',
      goodCaption:
        'Each iteration appends a typed block: reasoning, tool call, observation. The turn counter and the stop reason are rendered state, so a capped run and a guardrail trip are visibly different endings.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'every agent you have used in 2026 is the same 2022 loop.',
        body:
          'every agent you have used in 2026 is the same 2022 loop.\n\nthink, call a tool, read the result, repeat until a stop condition fires. ReAct, Yao et al, 2022. +34 points on ALFWorld with two examples.\n\nclaude code, cursor, devin, operator. the framework differences are checkpointing and tracing. the loop is invariant.',
      },
      {
        kind: 'X · design angle',
        hook: 'a spinner is the wrong component for an agent run.',
        body:
          'a spinner is the wrong component for an agent run.\n\nchat = 1 request, 1 response.\nagent = 40 to 400 steps, each one a typed block you can render.\n\nyou need a turn counter against a budget and three distinct terminal states: finished, capped, guardrail tripped. those are not one toast.',
      },
      {
        kind: 'X · one-liner',
        hook: 'tool output is untrusted input.',
        body:
          'tool output is untrusted input.\n\na PDF the agent retrieved can contain an instruction. openai\'s own computer-use docs say only the user\'s direct instructions count as permission.\n\nso observations need provenance in the transcript. otherwise injected text reads as the agent speaking.',
      },
    ],
    source: {
      label: 'Full lesson: 14.01 01-the-agent-loop',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/14-agent-engineering/01-the-agent-loop',
    },
  },
  {
    id: 'p14-02-rewoo',
    phase: 'Phase 14 · Agent Engineering',
    part: 'Part 1 · The agent loop and reasoning',
    index: '14.02',
    title: 'ReWOO and plan-and-execute: decoupled planning',
    oneLiner:
      'ReAct interleaves thinking and acting in one stream. ReWOO separates them: one plan up front, then execution. Roughly 5x fewer tokens and plus 4 points on HotpotQA, and the plan becomes an object you can show a human before anything runs.',
    readTime: '~10 min read',
    diagram: '/lessons/p14-02.svg',
    diagramCaption:
      'Planner emits a DAG with evidence references, workers execute nodes in dependency order, solver composes the final answer.',
    whyItMatters:
      'ReWOO hands you the one artifact interleaved ReAct never produces: a complete plan that exists before any side effect. That is the approval surface. You can render the DAG, mark which nodes write and which only read, and gate the run behind a single confirm instead of interrupting per step. Failure localization is per node, not per step, so a failed node is a row with its own retry affordance rather than a dead run. And because worker prompts carry no chain, the plan is stable enough to diff: if a replanner revises it, you can show the user exactly which nodes changed.',
    learningObjectives: [
      'Explain why ReWOO\'s Planner, Worker, Solver split cuts tokens versus ReAct\'s interleaved loop, using the paper\'s roughly 5x figure.',
      'Trace a plan DAG through evidence references (#E1, #E2) to see how a worker\'s output flows to a dependent node.',
      'Decide when a task should run as plan-then-execute versus interleaved ReAct, using Anthropic\'s five-workflow-pattern framing.',
      'Identify what planner distillation buys you: a 7B planner returning a reviewable plan while a larger executor is still cold.',
      'Recognize when Plan-and-Act\'s synthetic plan data is needed for long-horizon web or mobile tasks past 30 steps.',
    ],
    sections: [
      {
        heading: 'The problem: interleaving makes context grow quadratically',
        body: 'ReAct is simple and flexible, but every tool call has to carry the full prior context, including every previous thought. At step 10 the prompt contains thought 1, action 1, observation 1, thought 2, action 2, observation 2, and so on, plus a redundant copy of the original prompt at each step. Token usage grows with depth, and on a 40-step run that redundancy is most of the bill.\n\nWorse, when a tool fails mid-loop the model has to re-derive the entire plan from an error observation, in the middle of a stream, with no way for anyone to inspect what it decided. ReWOO (Xu et al., May 2023, arXiv:2305.18323) made a different bet: plan the whole thing up front, fetch evidence in parallel, compose the answer at the end.',
      },
      {
        heading: 'The move: planner, workers, solver',
        body: 'ReWOO splits the agent into three roles. The planner takes the user question and emits a plan DAG. Each node names a tool, its arguments, and which earlier nodes it depends on, using evidence references like #E1 and #E2. Workers execute nodes in topological order, in parallel where the DAG allows. The solver reads the question, the plan, and all the evidence, and composes the answer.\n\nThe planner never sees observations. That is the constraint that makes everything else work: one large planner prompt, N small worker prompts that each contain only their own tool call, and one solver prompt. On HotpotQA the paper measures roughly 5x fewer tokens and plus 4 points absolute accuracy.',
      },
      {
        heading: 'Failure gets a location instead of a stream position',
        body: 'If worker 3 fails in ReAct, the loop has to reason its way out of the error mid-stream and the user sees a run that wandered. In ReWOO, worker 3 returns an error string and the solver reads it alongside the original plan, which lets it degrade gracefully or report what is missing.\n\nFor an interface this is the difference between a failed run and a failed row. The plan is already a list of nodes on screen, so an error attaches to node 3, retry attaches to node 3, and everything downstream of node 3 can be marked blocked rather than silently wrong.',
      },
      {
        heading: 'Distillation: the planner does not need a frontier model',
        body: 'The paper\'s second result follows from the same constraint. Because the planner never sees observations, its outputs are compact and structured enough to fine-tune on. The authors distilled planner traces from a 175B teacher into a 7B model.\n\nThat split is now standard: a small planner, a large executor, or the reverse. It matters for product economics because the expensive model runs only where it earns its cost, and it matters for latency because a small planner returns the plan fast enough to render for approval while the workers are still cold.',
      },
      {
        heading: 'Plan-and-execute, plan-and-act, and picking one',
        body: 'LangChain generalized ReWOO into plan-and-execute in August 2023: an up-front planner emits a step list, an executor runs each step, and an optional replanner revises after seeing results. That replanner brings observations back into planning, which costs some of the token savings and buys reactivity. Plan-and-Act (Erdogan et al., ICML 2025) scaled the shape to long-horizon web and mobile work with synthetic plan training data, keeping coherence past 30 to 50 steps where a single ReAct trajectory falls apart.\n\nThe selection rule: ReAct for short tasks in unknown environments, ReWOO for structured tasks with known tools and parallelizable evidence, plan-and-execute when you need replanning, plan-and-act above 30 steps. Anthropic\'s guidance is to start with the simplest thing that works.',
      },
      {
        heading: 'What a plan DAG buys the interface, concretely',
        body: 'Render the DAG as it exists before dispatch and you get four things a chat transcript cannot give you. A node list a user can read in under a minute instead of a 40-turn scroll. A mark for which nodes write and which only read, so approval can gate the write nodes and let reads proceed. A diff surface, because when a replanner revises the DAG you can show exactly which nodes changed rather than restating the whole plan. And a place to attach cost: since worker prompts are small and independent, you can price the plan node by node before running it, the way an invoice itemizes line items instead of quoting one total.\n\nNone of this exists in interleaved ReAct, where the plan lives only as a pattern across many turns of a single stream.',
      },
      {
        heading: 'Where the token savings run out',
        body: 'ReWOO trades flexibility for structure, and that trade fails in two shapes. First, tasks with genuinely unknown environments: if step 2\'s result changes what step 3 should even be, a static plan cannot adapt, and you need the replanner from plan-and-execute or you need ReAct outright. Second, tasks under 3 steps: the overhead of a planner call and a solver call is pure loss when a single tool call would answer the question directly.\n\nThe practical rule from Anthropic\'s Dec 2024 guidance holds here too: reach for the simplest thing that works. A one-tool-call task does not need a DAG, and a 40-step web task does not need ReWOO\'s static plan, it needs Plan-and-Act\'s explicit long-horizon training.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p14-02-inline-token-growth.svg',
        alt: 'Token cost of ReAct versus ReWOO as steps increase',
        caption: 'ReAct repeats every prior thought at each step. ReWOO pays one planner call, N small worker calls, one solver call.',
        diagramBrief: 'Two line charts side by side sharing an x-axis labeled "step number, 1 to 10". Left chart "ReAct": a steadily climbing line, bars stacking taller at each step to show accumulated context. Right chart "ReWOO": three flat small bars (planner, workers, solver) that do not grow with step count. Style: cream paper, black ink, one accent color on the ReWOO bars to show the contrast.',
      },
      {
        src: '/lessons/p14-02-inline-dag-approval.svg',
        alt: 'A plan DAG marked for approval before execution',
        caption: 'Read and write nodes are marked before dispatch, so a single confirm gates only the nodes that have side effects.',
        diagramBrief: 'A small DAG: 4 nodes labeled 1 through 4, arrows showing dependencies (1 and 2 feed into 3, 3 feeds into 4). Nodes 1 and 2 tagged "read" in a neutral color, node 4 tagged "write, requires approval" in a highlighted accent color with a small lock icon. Style: cream paper, black ink, one accent color reserved for the write node.',
      },
    ],
    takeaways: [
      'The plan exists before any side effect, which makes it the natural approval gate: one confirm on a DAG beats a confirm per step.',
      'Roughly 5x fewer tokens and plus 4 points on HotpotQA is the tradeoff for a static plan. Buy it when the tools are known.',
      'Failures localize to a node, so error and retry are row-level affordances and downstream nodes render as blocked, not broken.',
      'A distilled 7B planner returns the plan fast enough to render for review while the executor is still warming up.',
    ],
    terms: [
      { term: 'ReWOO', gloss: '"reasoning without observations"', meaning: 'Plan first, gather evidence, then solve, with no observations present in the planning prompt.' },
      { term: 'Plan DAG', gloss: '"the plan"', meaning: 'The planner output: nodes naming a tool and arguments, edges naming which node depends on which.' },
      { term: 'Evidence reference', gloss: '"a placeholder"', meaning: 'A tag like #E1 in a plan node, substituted with a prior worker result at dispatch time.' },
      { term: 'Solver', gloss: '"the final step"', meaning: 'The call that reads the question, the plan, and all evidence, and writes the answer.' },
      { term: 'Replanner', gloss: '"re-planning"', meaning: 'The optional node that revises the plan after partial execution, which turns ReWOO into plan-and-execute.' },
      { term: 'Planner distillation', gloss: '"a small planner"', meaning: 'Fine-tuning a small model on planner traces from a large teacher, so planning stops needing a frontier model.' },
      { term: 'Plan-and-Act', gloss: '"scaled plan-execute"', meaning: 'A planner-executor split trained on synthetic long-horizon plan data, holding coherence past 30 to 50 steps.' },
      { term: 'Topological order', gloss: '"dependency order"', meaning: 'The execution order that runs each node only after every node it depends on has finished.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A ReWOO plan has 6 nodes: nodes 1 and 2 have no dependencies, nodes 3 and 4 depend only on 1, node 5 depends on 2 and 3, node 6 depends on 4 and 5. Draw the DAG and say which nodes can run in the same parallel batch.' },
      { level: 'medium', prompt: 'Node 3 in a 6-node plan fails with a timeout. Write what the solver receives about node 3, and say which downstream nodes should render as blocked rather than simply missing.' },
      { level: 'hard', prompt: 'A planner is distilled from a 175B teacher into a 7B model. What happens to plan quality if the task distribution at inference time drifts from the distillation set, and how would you detect that drift before a user sees a bad plan?' },
      { level: 'design', prompt: 'Design the approval screen for a plan DAG with 8 nodes, 3 of them writes. Decide what a user sees before approving: full DAG, only write nodes, or a summary. Justify the choice against a user who approves 40 of these a day.' },
    ],
    furtherReading: [
      { label: 'Xu et al., ReWOO: Decoupling Reasoning from Observations (arXiv:2305.18323)', url: 'https://arxiv.org/abs/2305.18323', why: 'The canonical paper, including the HotpotQA token and accuracy numbers.' },
      { label: 'Erdogan et al., Plan-and-Act (arXiv:2503.09572)', url: 'https://arxiv.org/abs/2503.09572', why: 'Shows the synthetic plan data that keeps a planner coherent past 30 steps on web and mobile tasks.' },
      { label: 'LangGraph, Plan-and-Execute tutorial', url: 'https://docs.langchain.com/oss/python/langgraph/overview', why: 'The production recipe for a plan DAG with an optional replanner node.' },
      { label: 'Anthropic, Building Effective Agents', url: 'https://www.anthropic.com/research/building-effective-agents', why: 'The rule for picking the simplest pattern, which is the deciding factor between ReWOO and plain ReAct.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Plan-DAG approval checklist',
      body: '- Every node names its tool, its arguments, and its dependencies before anything executes\n- Write nodes are visually marked apart from read nodes\n- One confirm gates the write nodes; reads can proceed without blocking\n- A failed node renders as a blocked row, with everything downstream marked blocked, not silently wrong\n- If a replanner revises the DAG, the diff against the prior plan is visible, not just the new plan\n- Node-level cost is itemized where worker calls are priced individually',
    },
    demoCaption:
      'Toggle between the interleaved run and the decoupled plan. Watch where the plan becomes visible, and what a human could approve or reject in each case.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Research task',
      badLabel: 'Interleaved ReAct',
      goodLabel: 'ReWOO plan first',
      badLines: [
        'Step 1: thought, action, observation',
        'Step 2: carries all of step 1 forward',
        'Step 3: carries steps 1 and 2 forward',
        'Plan exists only implicitly, inside the stream',
        'Failure at step 3 restarts the reasoning',
      ],
      goodLines: [
        'Plan: 4 nodes, dependencies shown',
        'Node 2 and node 3 marked read-only',
        'Node 4 marked write, requires approval',
        'Workers run in dependency order',
        'Solver composes evidence into the answer',
      ],
      badCaption:
        'The plan never becomes an object, so there is nothing to approve and nothing to diff. Context grows with depth because every step carries all prior thoughts, and a mid-stream failure forces the model to re-derive intent.',
      goodCaption:
        'The DAG is emitted before any side effect, which turns it into a review surface: nodes are rows, write nodes can be gated, and a failed node blocks its dependents instead of killing the run. Roughly 5x fewer tokens on HotpotQA.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'ReAct carries every prior thought into every tool call.',
        body:
          'ReAct carries every prior thought into every tool call. at step 10 you are paying for steps 1 through 9 again.\n\nReWOO splits it: 1 planner call, N tiny worker calls, 1 solver call. the planner never sees observations.\n\nresult on hotpotQA: about 5x fewer tokens, +4 points accuracy.',
      },
      {
        kind: 'X · design angle',
        hook: 'plan-first agents are the only ones you can actually put an approval gate on.',
        body:
          'plan-first agents are the only ones you can actually put an approval gate on.\n\ninterleaved: the plan lives inside the stream. nothing to show a human before the first side effect.\n\nReWOO: the plan is a DAG that exists before anything runs. mark the write nodes, gate those, let the reads go.\n\none confirm on a plan beats a confirm per step.',
      },
      {
        kind: 'X · one-liner',
        hook: 'if the planner never sees observations, you can distill it into a 7B model.',
        body:
          'if the planner never sees observations, you can distill it into a 7B model.\n\nthat is the actual ReWOO result people skip. small planner, big executor.\n\nthe plan comes back fast enough to render for review while the workers are still cold.',
      },
    ],
    source: {
      label: 'Full lesson: 14.02 02-rewoo-plan-and-execute',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/14-agent-engineering/02-rewoo-plan-and-execute',
    },
  },
  {
    id: 'p14-03-reflexion',
    phase: 'Phase 14 · Agent Engineering',
    part: 'Part 1 · The agent loop and reasoning',
    index: '14.03',
    title: 'Reflexion: verbal reinforcement learning',
    oneLiner:
      'Gradient RL needs thousands of trials and a GPU cluster to fix one failure mode. Reflexion fixes it in a sentence: the agent writes down why it failed, stores it, and reads it before the next attempt.',
    readTime: '~10 min read',
    diagram: '/lessons/p14-03.svg',
    diagramCaption:
      'Actor produces a trajectory, evaluator scores it, self-reflector writes a reflection into episodic memory, and the next trial starts fresh with that memory prepended.',
    whyItMatters:
      'Reflexion turns learned behaviour into a text buffer, which means it is editable, and anything editable is a UI surface. Every reflection is a row: the failure it came from, when it was written, and whether it still applies. Users need to read, pin, correct, and delete them, because the failure mode of this pattern is memory rot, a buffer full of superstition from one flaky run that quietly steers every future trial. Give reflections a TTL and show it. Show which reflections were in context for a given run, so when an agent behaves oddly the explanation is one click away rather than invisible.',
    learningObjectives: [
      'Name Reflexion\'s three components (Actor, Evaluator, Self-Reflector) and the role episodic memory plays between trials.',
      'Choose among scalar, heuristic, and self-evaluated feedback for a given task, and say which one earns the least trust.',
      'Explain why verbal reinforcement fixes a failure mode in one sentence where gradient-based RL needs thousands of trials.',
      'Design a reflection\'s lifecycle: how it is written, how long it lives, and what retires it.',
      'Diagnose memory rot in a reflection buffer and name two mitigations.',
    ],
    sections: [
      {
        heading: 'The problem: weight updates are the wrong tool for one bad run',
        body: 'An agent fails a task. Standard reinforcement learning says run thousands more trials, compute gradients, update weights. That is expensive, slow, and no production agent has a training budget for every failure it hits on a Tuesday.\n\nReflexion (Shinn et al., NeurIPS 2023) asked a smaller question: what if the agent simply thought about why it failed and tried again with that thought in its prompt? No weight update, no gradient, just natural language carried between trials. On ALFWorld it beat ReAct and other non-fine-tuned baselines, it improved on HotpotQA, and on HumanEval and MBPP code generation it set state of the art at the time, all with zero gradient steps.',
      },
      {
        heading: 'Three components and one buffer',
        body: 'The Actor generates a trajectory, typically a ReAct-style loop. The Evaluator scores it. The Self-Reflector writes a natural-language diagnosis of the failure, something like "I picked the wrong tool because I read the question as asking about X when it was asking about Y."\n\nThat reflection goes into episodic memory, a bounded list of prior reflections. The next trial starts completely fresh, with no trajectory carried over, but the reflection is prepended to the prompt. The learning lives entirely in the text.',
      },
      {
        heading: 'Three evaluator types, and which signal you actually have',
        body: 'Scalar evaluators are external binary signals: ALFWorld succeeds or fails, HumanEval tests pass or fail. Simplest and highest signal. Heuristic evaluators are predefined failure signatures: the same action twice in a row means stuck, more than 50 steps means inefficient. Self-evaluated means the model scores its own trajectory, which is what you fall back to with no ground truth, and it is the weakest signal.\n\nThe 2026 default is a mix: scalar when it exists, self-eval when it does not, heuristics as safety rails. The choice matters in the interface because a scalar pass and a self-rated pass deserve visibly different confidence treatment.',
      },
      {
        heading: 'You have already used this pattern',
        body: 'Reflexion is less an algorithm than a named pattern, and almost every self-healing agent runs a variant. Letta\'s sleep-time compute runs a separate agent that reflects on past conversations and writes to memory blocks off the hot path. Claude Code\'s CLAUDE.md and save-memory behaviour captures learnings that get prepended to future sessions. The learn-rule command in pro-workflow captures corrections as explicit rules. LangGraph ships reflection as a node that scores output and routes to refine.\n\nAll of them bet the same thing: natural language is a rich enough medium to carry "what I learned from failing" between runs.',
      },
      {
        heading: 'When it helps, and how it rots',
        body: 'Reflexion helps when there is a clear failure signal, when the task class is reproducible, and when there is enough remaining action budget for the next attempt to do better. It does not help when the agent already succeeds first try, when the failure was external (the network was down, and reflecting on that teaches nothing), or when the reflection becomes superstition about a one-off flake.\n\nThe 2026 pitfall has a name: memory rot. Reflections accumulate, some go obsolete, some were wrong to begin with, and re-runs get slower as the buffer grows. The mitigations are periodic compaction, a TTL on reflections, or a separate sleep-time cleanup agent.',
      },
      {
        heading: 'The reflection as a first-class object, not a hidden state update',
        body: 'Treat a reflection like any other record a user might need to inspect: it has a source trial, a timestamp, an evaluator type, and a body of text. Shinn et al.\'s original ALFWorld result reported a large absolute jump in success rate after a handful of reflected trials, which is a big enough behaviour change that a user watching the agent "get better" deserves to see why.\n\nThe object also needs an age and a scope. A reflection written for one task class, wrong tool for invoice lookups, should not silently leak into an unrelated task class, and a reflection from a run three weeks ago is a different confidence level than one from this morning. Neither distinction exists if the reflection is just a string appended to a system prompt.',
      },
      {
        heading: 'Reflexion versus fine-tuning: when text is not enough',
        body: 'Verbal reinforcement is cheap because it needs no training run, but it has a ceiling. It works when the fix is expressible as a sentence: check the ID format before submitting. It does not work when the fix is a distributional shift the model cannot articulate, like a subtle bias across thousands of examples, which is what gradient-based fine-tuning or RLHF still exists for.\n\nThe practical split in 2026 production agents: reflection handles per-task, per-user corrections that show up daily and change fast. Fine-tuning handles the slow-moving, hard-to-articulate patterns that show up across thousands of runs. Reaching for a training run to fix what a reflection could fix in one line is the same mistake as reaching for a reflection to fix what actually needs retraining.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p14-03-inline-reflection-lifecycle.svg',
        alt: 'A reflection\'s lifecycle from trial to retirement',
        caption: 'Written after a failed trial, read on the next attempt, and retired by a TTL or a user correction.',
        diagramBrief: 'A horizontal timeline with four labeled points: "Trial 1 fails", "Reflection written (source, timestamp, evaluator type)", "Reflection read on Trial 2", "TTL expires or user corrects, entry removed". Style: cream paper, black ink, one accent color marking the reflection object itself as it moves along the timeline.',
      },
      {
        src: '/lessons/p14-03-inline-evaluator-confidence.svg',
        alt: 'Three evaluator types rendered as three confidence levels',
        caption: 'Scalar, heuristic, and self-evaluated reflections are not the same badge.',
        diagramBrief: 'Three rows, each showing an evaluator type on the left (Scalar, Heuristic, Self-evaluated) and a confidence bar on the right, longest for Scalar, medium for Heuristic, shortest for Self-evaluated. Style: cream paper, black ink, one accent color scaled by row to show decreasing confidence.',
      },
    ],
    takeaways: [
      'Learning lives in an editable text buffer, so reflections need list, pin, correct, and delete affordances like any other user-owned data.',
      'Show which reflections were in context for a run. Otherwise an agent that changed behaviour looks arbitrary.',
      'A scalar pass and a self-rated pass are different confidence states. Do not render them with the same badge.',
      'Memory rot is the failure mode: give reflections a TTL, surface staleness, and compact on a schedule.',
    ],
    terms: [
      { term: 'Reflexion', gloss: '"self-correction"', meaning: 'Actor, evaluator, and self-reflector plus episodic memory, improving behaviour without weight updates.' },
      { term: 'Verbal reinforcement', gloss: '"learning without gradients"', meaning: 'Carrying a lesson between trials as natural language prepended to the next prompt.' },
      { term: 'Episodic memory', gloss: '"remembering past attempts"', meaning: 'A bounded buffer of prior reflections scoped to one task class.' },
      { term: 'Scalar evaluator', gloss: '"pass or fail"', meaning: 'A binary or numeric success signal from ground truth, such as a passing test.' },
      { term: 'Heuristic evaluator', gloss: '"a red flag pattern"', meaning: 'A predefined failure signature such as repeated actions or exceeding a step count.' },
      { term: 'Self-evaluated', gloss: '"the model grades itself"', meaning: 'The model scoring its own trajectory with no ground truth, the weakest of the three signals.' },
      { term: 'Memory rot', gloss: '"the agent got worse over time"', meaning: 'Accumulated obsolete or wrong reflections that slow runs down and steer them badly.' },
      { term: 'Sleep-time compute', gloss: '"background learning"', meaning: 'Running the self-reflector off the hot path so the primary agent stays latency-bound.' },
      { term: 'TTL', gloss: '"expiration"', meaning: 'A time-to-live on a reflection, after which it is treated as stale unless it re-triggers.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A reflection buffer holds 40 entries with no TTL. Estimate how many of them are likely stale after 90 days of daily runs, and say what evidence would tell you.' },
      { level: 'medium', prompt: 'An agent fails a task because the staging API was down for ten minutes. The self-reflector writes a reflection about it anyway. Explain why this reflection should not survive to the next trial, and what evaluator type would have caught the distinction.' },
      { level: 'hard', prompt: 'Design a scope rule that stops a reflection written for "invoice lookups" from leaking into an unrelated task class like "user onboarding," while still letting genuinely general reflections, like a tool-selection habit, apply broadly.' },
      { level: 'design', prompt: 'Sketch the reflection list view for a support agent a user manages daily. Show list, pin, correct, and delete affordances, plus how a reflection\'s age and evaluator type render so the user can tell a strong correction from a shaky one at a glance.' },
    ],
    furtherReading: [
      { label: 'Shinn et al., Reflexion: Language Agents with Verbal Reinforcement Learning (arXiv:2303.11366)', url: 'https://arxiv.org/abs/2303.11366', why: 'The canonical paper, including the ALFWorld and HumanEval results.' },
      { label: 'Letta, Sleep-time Compute', url: 'https://www.letta.com/blog/sleep-time-compute', why: 'Reflexion running off the hot path in a shipping product, not a research demo.' },
      { label: 'Anthropic, Effective context engineering for AI agents', url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents', why: 'Treats the episodic buffer as context to manage, which is where memory rot gets fixed.' },
      { label: 'LangGraph overview', url: 'https://docs.langchain.com/oss/python/langgraph/overview', why: 'The reflection-node pattern as it ships in a production graph runtime.' },
    ],
    shipIt: {
      kind: 'rubric',
      name: 'Reflection quality rubric',
      body: '- Source trial and timestamp are attached, not just the text\n- Evaluator type is recorded (scalar, heuristic, self-evaluated) and rendered with matching confidence\n- Scope is explicit: which task class this reflection applies to\n- A TTL or re-trigger condition exists; nothing lives forever by default\n- The reflection names a specific correctable behaviour, not a vague narrative about a one-off flake\n- A user can list, pin, correct, and delete it like any other owned record',
    },
    demoCaption:
      'Open the episodic buffer behind a run that "just got better". Every entry is a row a user should be able to read, correct, or expire.',
    demo: {
      archetype: 'reveal',
      subject: 'Trial 3 succeeded',
      opaqueLabel: 'Agent improved after 2 failed attempts',
      revealedLines: [
        'Reflection 1 (trial 1, scalar fail): wrong tool, misread the question scope',
        'Reflection 2 (trial 2, heuristic stuck): repeated the same action twice',
        'Reflection 3 (trial 2, self-rated): assumed the ID format, never verified it',
        'Stale (14 days, never re-triggered): the staging API was down',
        'In context for this run: reflections 1, 2, 3',
      ],
      badCaption:
        '"The agent learned" is not an explanation a user can act on. Behaviour changed, the cause is invisible, and there is nothing to correct when a reflection is wrong.',
      goodCaption:
        'Every reflection is a row with its source trial, its evaluator type, and its age. Users can correct a bad one and expire a stale one, which is the only defense against a buffer full of superstition steering every future run.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'reflexion is reinforcement learning where the gradient is a sentence.',
        body:
          'reflexion is reinforcement learning where the gradient is a sentence.\n\nagent fails. evaluator scores it. reflector writes "i picked the wrong tool because i misread the scope". that line gets prepended to the next attempt.\n\nno weight updates. SOTA on humaneval at the time with zero gradient steps.',
      },
      {
        kind: 'X · design angle',
        hook: 'if your agent "learns", the learning is a text buffer and users should be able to edit it.',
        body:
          'if your agent "learns", the learning is a text buffer and users should be able to edit it.\n\nevery reflection is a row: what failed, when, whether it still applies.\n\nthe failure mode is memory rot. one flaky run writes a superstition and it steers every future trial, invisibly. give reflections a TTL and show which ones were in context.',
      },
      {
        kind: 'X · one-liner',
        hook: 'CLAUDE.md is reflexion.',
        body:
          'CLAUDE.md is reflexion.\n\nletta sleep-time compute, langgraph reflection nodes, /learn-rule, save-memory. same pattern, different wrapper.\n\nnatural language is a rich enough medium to carry "what i learned from failing" across runs. that was the whole 2023 paper.',
      },
    ],
    source: {
      label: 'Full lesson: 14.03 03-reflexion-verbal-rl',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/14-agent-engineering/03-reflexion-verbal-rl',
    },
  },
  {
    id: 'p14-04-tree-of-thoughts',
    phase: 'Phase 14 · Agent Engineering',
    part: 'Part 1 · The agent loop and reasoning',
    index: '14.04',
    title: 'Tree of Thoughts and LATS: deliberate search',
    oneLiner:
      'A single chain of thought cannot backtrack. Tree of Thoughts turns reasoning into a scored tree, taking Game of 24 from 4 percent to 74 percent, and LATS wraps it in Monte Carlo Tree Search for 92.7 percent pass@1 on HumanEval. The bill is 100 to 1000x the tokens.',
    readTime: '~10 min read',
    diagram: '/lessons/p14-04.svg',
    diagramCaption:
      'A thought tree: each node expands to K children, each child gets a self-evaluated score, and search keeps the promising branches and abandons the rest.',
    whyItMatters:
      'Search is the only agent pattern where the cost is 100 to 1000x, which makes it a budget you must render rather than absorb. If a run can branch, the UI needs a live node counter, a spend meter against a cap, and a stop control that is not a page refresh. Progress is also non-monotonic: a promising branch gets abandoned, so a linear progress bar lies. Show explored versus pruned instead. And put the search behind an explicit gate, because the honest default is a single trajectory with tool-grounded verification, and search is the escalation the user opts into once and can see the price of.',
    learningObjectives: [
      'Explain why chain-of-thought commits to its first mistake, using the 4 percent Game of 24 baseline as the failure case.',
      'Walk through ToT\'s expand-and-self-evaluate cycle and name the three self-evaluation formats the paper tested.',
      'Trace one MCTS iteration in LATS through select, expand, simulate, and backpropagate.',
      'Estimate the token multiplier of a search run (100 to 1000x) and decide whether a task\'s value function justifies it.',
      'Design the escalation gate that puts search behind an explicit opt-in rather than a silent default.',
    ],
    sections: [
      {
        heading: 'The problem: a linear chain commits to its first mistake',
        body: 'Chain of thought is a single walk. If step one is wrong, every step after it reasons correctly on a bad premise. On Game of 24, where you combine four digits with arithmetic to reach 24, GPT-4 with chain of thought hits 4 percent. The model picks a bad subexpression early and has no way back.\n\nWhat reasoning needs is the ability to propose several candidates, score them, keep the promising ones, and backtrack from dead ends. That is search, and Tree of Thoughts and LATS are the two canonical formulations of it for language models.',
      },
      {
        heading: 'Tree of Thoughts: nodes, expansion, self-evaluation',
        body: 'Each node in ToT (Yao et al., NeurIPS 2023) is a coherent intermediate step, a thought. Each node expands to K children. The model self-evaluates each node with a scoring prompt, and the search walks the tree breadth first, depth first, or with a beam.\n\nSelf-evaluation is the essential part. The paper tested three scoring variants: a sure, likely, or impossible classification, a 1 to 10 numeric score, and a vote among candidates. All three beat chain of thought substantially, taking Game of 24 from 4 percent to 74 percent with GPT-4.',
      },
      {
        heading: 'LATS: search that reads the environment',
        body: 'LATS (Zhou et al., ICML 2024) unifies ToT, ReAct, and Reflexion under Monte Carlo Tree Search. The model plays three roles: policy, proposing candidate next actions; value function, scoring a partial trajectory; and self-reflector, writing a natural-language reflection on failure that reseeds future rollouts.\n\nFour phases per iteration. Select walks from root to leaf using UCT, which balances exploitation against exploration. Expand generates K children. Simulate rolls out from a child and scores the leaf. Backpropagate pushes the reward up the path, updating visit counts. The difference from ToT is that real observations mix into the value function, so the search is informed by tool results and not only model opinion. Reported results: 92.7 percent pass@1 on HumanEval with GPT-4, and 75.9 average on WebShop with GPT-3.5.',
      },
      {
        heading: 'The cost reality: search is a token multiplier',
        body: 'ToT on Game of 24 uses 100 to 1000 times the tokens of chain of thought. LATS is comparable. That is not a rounding error, it is a category change in unit economics, and it belongs in the interface as a visible meter, not a surprise on an invoice.\n\nReserve it for tasks where a single trajectory is demonstrably insufficient, where correctness matters more than wall clock, and crucially where there is a cheap reliable value function: unit tests for code, an explicit target for math. If the task has one right answer and a noisy evaluator, search often makes things worse, because it reliably finds a high-scoring wrong answer.',
      },
      {
        heading: 'Where search actually ships in 2026',
        body: 'Most production agents do not run LATS. They run ReAct with tool-grounded verification, which is the CRITIC pattern from lesson 14.05. Search appears in specific niches: coding agents that use a test suite as the value function, deep-research agents exploring multiple query paths, and planning-heavy subgraphs inside LangGraph.\n\nIn practice it usually sits behind a gate that reads like "if task complexity is above a threshold, use search". AlphaEvolve is the 2025 extreme of the same idea: evolutionary search over code with a machine-checkable fitness function, which produced the first improvement to 4x4 matrix multiplication in 56 years. Lesson 14.11 covers it.',
      },
      {
        heading: 'UCT, in the amount of math a designer actually needs',
        body: 'The selection formula in MCTS is Q(s,a) plus c times the square root of ln N(s) over N(s,a). The first term rewards a branch that has scored well so far, exploitation. The second term rewards a branch that has been visited rarely, exploration, and it shrinks as visits accumulate. The constant c tunes the balance and gets set per task.\n\nWhat this means for the interface: a search run\'s "best branch so far" is not stable early on, because the algorithm is deliberately still exploring low-visit nodes that might outscore it. A live leaderboard of top branches will reorder itself for the first several iterations before it settles, and a UI that shows only the current leader without that caveat will look like it is flip-flopping for no reason.',
      },
      {
        heading: 'The verifier is the actual product decision',
        body: 'Search amplifies whatever scores it. A cheap, reliable value function, a passing unit test suite, a numeric target in a math problem, turns 100 to 1000x the tokens into a real accuracy gain, 4 percent to 74 percent on Game of 24. A noisy value function turns the same multiplier into a confident wrong answer found faster, because MCTS optimizes for whatever the scorer rewards, not for what is actually correct.\n\nSo the decision to enable search is really a decision about the evaluator, made before the budget question. If the only available scorer is another model call rating plausibility, the honest move is to skip search and spend the tokens on a single well-verified trajectory instead, the way lesson 14.05\'s CRITIC pattern does it.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p14-04-inline-search-tree.svg',
        alt: 'A thought tree with scored and pruned branches',
        caption: 'Most of the tree gets scored and thrown away. The final answer is one surviving branch out of dozens explored.',
        diagramBrief: 'A branching tree diagram, root at top, 3 levels deep, roughly 12 total nodes. Most nodes are drawn faded or crossed out (pruned), one path from root to a leaf at the bottom is highlighted solid with an accent color and labeled "kept". Style: cream paper, black ink, one accent color on the surviving path only.',
      },
      {
        src: '/lessons/p14-04-inline-token-multiplier.svg',
        alt: 'Token cost of chain-of-thought versus tree search',
        caption: 'One chain versus a searched tree: 100 to 1000x the tokens for a task where the evaluator can be trusted.',
        diagramBrief: 'Two bars side by side. Left bar short, labeled "Chain of thought, 1x tokens". Right bar 100 times taller (compressed visually with a break mark), labeled "Tree search, 100 to 1000x tokens". A small callout box next to the right bar: "worth it only with a reliable value function". Style: cream paper, black ink, one accent color on the right bar.',
      },
    ],
    takeaways: [
      'Search costs 100 to 1000x the tokens of a single chain. That is a rendered budget with a cap and a stop control, not a background cost.',
      'Progress is non-monotonic because branches get abandoned. Show nodes explored and pruned instead of a progress bar that only moves forward.',
      'Search amplifies the evaluator. With a noisy value function it finds confident wrong answers faster, so verify the evaluator before enabling it.',
      'Put search behind an explicit escalation gate. A single trajectory with tool-grounded verification is the honest default.',
    ],
    terms: [
      { term: 'Tree of Thoughts', gloss: '"branching chain of thought"', meaning: 'Reasoning as a tree of intermediate thought nodes, each self-evaluated and expanded or pruned.' },
      { term: 'LATS', gloss: '"MCTS for language models"', meaning: 'Monte Carlo Tree Search over agent trajectories, unifying ToT, ReAct, and Reflexion.' },
      { term: 'Value function', gloss: '"how good is this state"', meaning: 'The score for a partial trajectory, from a prompted model or a real environment reward.' },
      { term: 'UCT', gloss: '"the selection formula"', meaning: 'The rule balancing a node\'s known value against how little it has been explored, Q(s,a) plus an exploration bonus.' },
      { term: 'Rollout', gloss: '"a simulated attempt"', meaning: 'One simulated walk from a node to a leaf, scored to update the tree.' },
      { term: 'Backpropagate', gloss: '"updating the tree"', meaning: 'Pushing a leaf\'s reward back up its ancestors, updating visit counts and value estimates.' },
      { term: 'Self-evaluation', gloss: '"the model grades its own step"', meaning: 'A scoring prompt applied to each node: sure, likely, or impossible, a numeric score, or a vote.' },
      { term: 'Escalation gate', gloss: '"when to turn search on"', meaning: 'The explicit threshold, such as task complexity or verifier availability, that decides whether search runs at all.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A search run explores 40 branches and keeps 1. If chain of thought costs 500 tokens, and search costs 300x that, estimate the total token spend and say whether a task worth $0.02 in chain-of-thought tokens is worth running search on.' },
      { level: 'medium', prompt: 'A value function scores partial code trajectories by asking a second model "does this look correct," with no test execution. Predict what happens to accuracy as you increase the number of rollouts, and explain why.' },
      { level: 'hard', prompt: 'Walk through one MCTS iteration by hand on a 3-level tree: pick a select path using UCT with c = 1.0 given made-up visit counts and values, expand one node, simulate a rollout, and backpropagate the result.' },
      { level: 'design', prompt: 'Design the approval moment before a user\'s task escalates into a search run. What number do you show before they commit tokens, what happens to the "best answer so far" display while branches are still being explored and reordered, and what is the stop control.' },
    ],
    furtherReading: [
      { label: 'Yao et al., Tree of Thoughts (arXiv:2305.10601)', url: 'https://arxiv.org/abs/2305.10601', why: 'The canonical paper, including the three self-evaluation formats and the Game of 24 results.' },
      { label: 'Zhou et al., LATS (arXiv:2310.04406)', url: 'https://arxiv.org/abs/2310.04406', why: 'MCTS unified with ReAct and Reflexion, including the HumanEval and WebShop numbers.' },
      { label: 'LangGraph overview', url: 'https://docs.langchain.com/oss/python/langgraph/overview', why: 'Subgraph patterns for search, for teams building this on an existing runtime.' },
      { label: 'Novikov et al., AlphaEvolve (arXiv:2506.13131)', url: 'https://arxiv.org/abs/2506.13131', why: 'The 2025 extreme case: evolutionary search with a fully machine-checkable evaluator, covered in lesson 14.11.' },
    ],
    shipIt: {
      kind: 'rubric',
      name: 'Search-eligibility rubric',
      body: '- A cheap, deterministic value function exists (unit tests, an explicit numeric target) rather than another model guessing plausibility\n- The task has demonstrably failed on a single trajectory, not just "might be hard"\n- Wall-clock time matters less than correctness for this task class\n- The user or system has explicitly opted into the cost, not defaulted into it\n- A live meter shows nodes explored, nodes pruned, and spend against a cap, not a single spinner\n- A stop control exists that is not a page refresh',
    },
    demoCaption:
      'One headline token cost, opened up by branch. The number a user sees before approving a search run should be the sum of the branches, including the ones that get thrown away.',
    demo: {
      archetype: 'meter',
      subject: 'Search run cost',
      headline: 'One answer, 1 visible result',
      breakdown: [
        { label: 'Branch kept (final answer)', value: 8 },
        { label: 'Branches scored then pruned', value: 34 },
        { label: 'Rollouts simulated to a leaf', value: 41 },
        { label: 'Self-evaluation scoring calls', value: 17 },
      ],
      badCaption:
        'A single returned answer reads like a single trajectory, so the run looks like a normal request. The 4 percent to 74 percent jump on Game of 24 came from everything the user never saw.',
      goodCaption:
        'Most of the spend is in branches that were scored and thrown away. That is the meter to render before a user approves search: nodes explored, nodes pruned, and a hard cap with a stop control.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'chain of thought cannot backtrack. that is the whole limitation.',
        body:
          'chain of thought cannot backtrack. that is the whole limitation.\n\nfirst step wrong, every step after it reasons perfectly on a bad premise. game of 24 with GPT-4 CoT: 4%.\n\ntree of thoughts scores each node and prunes: 74%. LATS adds MCTS and real tool feedback: 92.7% pass@1 on humaneval.',
      },
      {
        kind: 'X · design angle',
        hook: 'search is the one agent pattern where you have to render the bill.',
        body:
          'search is the one agent pattern where you have to render the bill.\n\n100 to 1000x the tokens of a single chain. that is not a rounding error, it is a different product.\n\nand a progress bar lies here, because branches get abandoned. show explored vs pruned, a spend cap, and a stop control that is not a page refresh.',
      },
      {
        kind: 'X · one-liner',
        hook: 'search amplifies your evaluator, including its noise.',
        body:
          'search amplifies your evaluator, including its noise.\n\ngood value function (unit tests, an explicit target): search finds the right answer.\nnoisy value function: search efficiently finds a confident wrong answer.\n\nverify the evaluator before you pay 100x for more of it.',
      },
    ],
    source: {
      label: 'Full lesson: 14.04 04-tree-of-thoughts-lats',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/14-agent-engineering/04-tree-of-thoughts-lats',
    },
  },
  {
    id: 'p14-05-self-refine',
    phase: 'Phase 14 · Agent Engineering',
    part: 'Part 1 · The agent loop and reasoning',
    index: '14.05',
    title: 'Self-Refine and CRITIC: iterative output improvement',
    oneLiner:
      'Self-Refine runs one model in three roles, generate, critique, revise, for plus 20 absolute across seven tasks. CRITIC fixes its blind spot: a model cannot verify its own facts, so route the critique through real tools.',
    readTime: '~10 min read',
    diagram: '/lessons/p14-05.svg',
    diagramCaption:
      'The refine loop: generate, feedback or external verification, revise with full history, and a stop condition that combines a passing verifier with an iteration cap.',
    whyItMatters:
      'This is the pattern that decides what "reviewed" means in your UI. A self-rated pass and a verifier-backed pass look identical in a component unless you make them different, and only one of them is evidence. Render the verifier that ran, what it returned, and which iteration produced the shipped version. Budget the loop at one to three passes and make the fourth an escalation to a human, because latency is per pass and the honest ceiling is low. The rubber-stamp failure is a design failure too: if evaluator and generator look the same to the user, "approved" stops meaning anything.',
    learningObjectives: [
      'State Self-Refine\'s three prompts (generate, feedback, refine) and explain why dropping history collapses quality.',
      'Explain CRITIC\'s fix for Self-Refine\'s blind spot: routing verification through external tools instead of the same model.',
      'Design a stop condition that combines a passing verifier with an iteration cap, and say why neither alone is safe.',
      'Map this pattern to Anthropic\'s evaluator-optimizer workflow and OpenAI Agents SDK\'s output guardrails.',
      'Diagnose a rubber-stamp loop from its symptom: same-style prompts converging on "looks good."',
    ],
    sections: [
      {
        heading: 'The problem: almost right, and nobody checks',
        body: 'An agent produces an answer that is nearly correct. A line of code has a syntax error, a summary runs long, a plan misses an edge case. What you want is for the agent to critique its own output and fix it before it reaches anyone.\n\nSelf-Refine (Madaan et al., NeurIPS 2023) showed this works with one model, no training data and no reinforcement learning. But it has a catch that CRITIC named: models are bad at verifying their own factual claims, because a hallucination usually looks convincing to the model that produced it.',
      },
      {
        heading: 'Self-Refine: three prompts and one non-negotiable detail',
        body: 'One model plays three roles. Generate produces output zero. Feedback critiques it. Refine rewrites it given the task, the output, the critique, and the history. Then feedback runs again on the new output, and so on, stopping when feedback reports no issues or the budget runs out.\n\nThe history is the essential detail. Refine sees every prior output and every prior critique, so it does not cycle back through mistakes it already made. The paper ablates this and quality drops sharply without it. Headline result: plus 20 absolute averaged across seven tasks including math, code, acronym generation, and dialogue, with no training and no external tools.',
      },
      {
        heading: 'CRITIC: ground the critique in something that is not the model',
        body: 'CRITIC (Gou et al., 2023, v4 Feb 2024) replaces the feedback step with verification against real tools: a search engine for factual claims, a code interpreter for correctness, a calculator for arithmetic, and domain verifiers such as unit tests, type checkers, and linters. The verifier emits a structured critique grounded in actual tool results, and the refiner conditions on that.\n\nCRITIC beats Self-Refine on factual tasks precisely because the critique has grounding. On tasks with no external verifier, creative writing or formatting, CRITIC degenerates back into Self-Refine, so paying the latency for a stub verifier buys nothing.',
      },
      {
        heading: 'The stop condition is never one condition',
        body: 'Two shapes exist. The verifier passes, which is preferred wherever a real test exists. Or the model issues no feedback, which is cheap and unreliable on its own.\n\nThe 2026 default combines them: stop if the verifier passes, or if the model reports no issues and at least two iterations have run, or if the iteration cap is reached. That third clause is the one users feel, because each refine pass costs a full round trip of latency. Budget one to three, then escalate to human review rather than looping.',
      },
      {
        heading: 'The same pattern, in every framework, under three names',
        body: 'Anthropic named it evaluator-optimizer, one of five workflow patterns: an evaluator scores and critiques, an optimizer revises, loop until pass. Their engineering note matters, which is that the evaluator and optimizer prompts must be substantially different or the model rubber-stamps its own work. OpenAI Agents SDK ships it as output guardrails, validators that run on final output and can call tools (CRITIC-shaped) or be pure functions (Self-Refine-shaped). LangGraph ships a reflection node. Gemini 2.5 Computer Use runs a per-step safety evaluator before committing an action, which is a CRITIC variant applied to actions rather than text.\n\nThe pitfalls repeat across all of them: rubber-stamp loops from same-style prompts, over-refinement that burns latency for diminishing returns, and CRITIC deployed where no verifier exists.',
      },
      {
        heading: 'What "reviewed" should mean in a transcript',
        body: 'A badge that says approved is a claim, and a claim needs a citation. Render three things next to it: which verifier ran, what it returned, and which iteration of the output is the one shipped. A model\'s own "looks good" is a valid signal when nothing else exists, but it should never render identically to a test suite reporting 20 of 20 passing, because a user cannot tell the difference between confidence and evidence from a single green checkmark.\n\nThe diff between iterations matters too. If refine ran three times, the third output is not self-evidently better than the first without the intermediate critiques attached, and a user auditing a decision later needs to see what changed and why, not just the final state.',
      },
      {
        heading: 'Latency is the real budget, not tokens',
        body: 'Each refine pass is a full model round trip, and three passes at a few seconds each is real time a user is waiting through before anything ships. That is the reason the 2026 default caps at one to three passes rather than looping until convergence: past that point, the marginal quality gain per pass drops while the wait keeps accumulating.\n\nThe corollary is that a fourth pass should not silently happen. It should read as an explicit escalation, a handoff to a human reviewer or a flagged low-confidence state, rather than one more invisible round trip stacked onto a spinner the user has already been staring at.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p14-05-inline-refine-history.svg',
        alt: 'The refine prompt carrying full history versus dropping it',
        caption: 'Refine must see every prior output and critique, or it repeats the same mistake on the next pass.',
        diagramBrief: 'Two side-by-side sequences of 3 boxes each labeled "Output 1, Critique 1, Output 2". Top row "With history": an arrow looping back from Output 2 showing it references both prior boxes, quality bar shown rising. Bottom row "Without history": Output 2 shown disconnected from Output 1, with a repeated error icon, quality bar shown flat. Style: cream paper, black ink, one accent color on the "with history" arrows.',
      },
      {
        src: '/lessons/p14-05-inline-badge-evidence.svg',
        alt: 'Two approved badges with different evidence underneath',
        caption: 'Same badge, different evidence: a model rating itself and a test suite that ran are not the same claim.',
        diagramBrief: 'Two identical-looking green "Approved" badges side by side. Below badge 1: small text "Self-rated, same model, same prompt style". Below badge 2: small text "Verifier: test suite, 20 of 20 passing". A dividing line between them labeled "same component, different evidence". Style: cream paper, black ink, badges in neutral green, the evidence text in a contrasting accent color.',
      },
    ],
    takeaways: [
      'A self-rated pass and a verifier-backed pass are different evidence. Render the verifier that ran, or the badge is decoration.',
      'Refine needs full history of prior outputs and critiques. Drop it and quality collapses, so the transcript keeps every iteration.',
      'Budget one to three passes, then escalate to a human. Each pass is a full round trip of latency the user is waiting through.',
      'Evaluator and optimizer prompts must be structurally different, or the loop converges on "looks good to me" and approval means nothing.',
    ],
    terms: [
      { term: 'Self-Refine', gloss: '"the model fixes itself"', meaning: 'A generate, feedback, refine loop in a single model, with full history carried into each revision.' },
      { term: 'CRITIC', gloss: '"tool-grounded verification"', meaning: 'Self-Refine with the feedback step replaced by verification against external tools.' },
      { term: 'Evaluator-optimizer', gloss: '"Anthropic\'s workflow name"', meaning: 'One role scores, another revises, looped to convergence, with the two prompts kept structurally different.' },
      { term: 'Output guardrail', gloss: '"a post-hoc check"', meaning: 'A validator that runs on an agent\'s final output and can reject it for retry.' },
      { term: 'Refine history', gloss: '"what it already tried"', meaning: 'The prior outputs and critiques prepended to the revision prompt; dropping it collapses quality.' },
      { term: 'Rubber-stamp loop', gloss: '"self-agreement"', meaning: 'A critique step that approves everything because it shares prompt style with the generator.' },
      { term: 'Verifier-backed pass', gloss: '"a real check ran"', meaning: 'An approval grounded in an external tool result, distinct from a model rating its own output.' },
      { term: 'Iteration cap', gloss: '"the retry limit"', meaning: 'The hard stop on refine passes, usually one to three, after which the task escalates to a human.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A Self-Refine loop runs 3 iterations at a few seconds each. What is the total added latency versus a single-pass generation, and at what point does a fourth pass need to become a visible escalation instead of a silent retry?' },
      { level: 'medium', prompt: 'A CRITIC-style verifier for a code task has no real test suite, so it falls back to "ask the model if the code looks correct." Explain why this configuration is functionally Self-Refine wearing CRITIC\'s name, and what it would take to make it CRITIC again.' },
      { level: 'hard', prompt: 'Design an evaluator prompt and an optimizer prompt for a summarization task that are structurally different enough to avoid a rubber-stamp loop. Say specifically what differs: role framing, information given, or output format.' },
      { level: 'design', prompt: 'Design the approval UI for a document an agent revised twice before shipping. Show the iteration count, the verifier used, and a way to inspect the diff between iteration 1 and iteration 3, without making the reader dig through a raw log.' },
    ],
    furtherReading: [
      { label: 'Madaan et al., Self-Refine (arXiv:2303.17651)', url: 'https://arxiv.org/abs/2303.17651', why: 'The canonical paper, including the ablation showing history is essential to the result.' },
      { label: 'Gou et al., CRITIC (arXiv:2305.11738)', url: 'https://arxiv.org/abs/2305.11738', why: 'Tool-grounded verification and why models are unreliable at checking their own facts.' },
      { label: 'Anthropic, Building Effective Agents', url: 'https://www.anthropic.com/research/building-effective-agents', why: 'Names the evaluator-optimizer pattern and the rule that the two prompts must differ structurally.' },
      { label: 'OpenAI Agents SDK docs', url: 'https://openai.github.io/openai-agents-python/', why: 'Output guardrails as the shipped, CRITIC-shaped version of this pattern.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Verifier-backed approval checklist',
      body: '- The badge names the verifier that ran, not just "approved"\n- A self-rated pass and a verifier-backed pass render as visually distinct states\n- Refine history (prior outputs and critiques) is retained and viewable, not discarded after the final pass\n- Iteration count is shown against the cap, so a user can tell "converged" from "ran out"\n- Evaluator and optimizer prompts are confirmed structurally different, not variations of the same instruction\n- A fourth pass never happens silently; it becomes an explicit human escalation',
    },
    demoCaption:
      'Two runs that both end in a green check. One check is a model rating itself, the other is a test suite that ran. Only one of them is evidence.',
    demo: {
      archetype: 'before-after',
      subject: 'Approved output',
      badLabel: 'Self-rated pass',
      goodLabel: 'Verifier-backed pass',
      badLines: [
        'Status: approved',
        'Critique: "looks good"',
        'Same model, same prompt style',
        'Iterations: 1',
        'Evidence available: none',
      ],
      goodLines: [
        'Status: approved',
        'Verifier: test suite, 20 of 20 passing',
        'Evaluator prompt distinct from generator',
        'Iterations: 3 of 3, cap reached',
        'Diff from iteration 2 available',
      ],
      badCaption:
        'The model critiqued itself with the same prompt style that produced the output, so it converged on "looks good". The badge reads identical to a real pass and carries none of the same weight.',
      goodCaption:
        'A named verifier ran and returned a result the user can open. Iteration count against the cap tells them whether the loop converged or simply ran out, which is the difference between confidence and a deadline.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'self-refine is one model in three roles: generate, critique, revise.',
        body:
          'self-refine is one model in three roles: generate, critique, revise.\n\n+20 absolute averaged over 7 tasks. no training, no tools.\n\nthe detail everyone drops: refine must see the full history of prior outputs and critiques. ablate it and the gains collapse.',
      },
      {
        kind: 'X · design angle',
        hook: 'a green check from a model rating itself and a green check from a test suite are the same component and different evidence.',
        body:
          'a green check from a model rating itself and a green check from a test suite are the same component and different evidence.\n\nCRITIC exists because models cannot verify their own facts. a hallucination looks convincing to whoever produced it.\n\nso render the verifier that ran. otherwise "approved" is decoration.',
      },
      {
        kind: 'X · one-liner',
        hook: 'if the critic prompt looks like the generator prompt, you built a rubber stamp.',
        body:
          'if the critic prompt looks like the generator prompt, you built a rubber stamp.\n\nanthropic\'s evaluator-optimizer note says it plainly: the two prompts have to be structurally different or the model approves its own work.\n\nbudget 1 to 3 refine passes, then escalate to a human.',
      },
    ],
    source: {
      label: 'Full lesson: 14.05 05-self-refine-and-critic',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/14-agent-engineering/05-self-refine-and-critic',
    },
  },
  {
    id: 'p14-06-tool-use',
    phase: 'Phase 14 · Agent Engineering',
    part: 'Part 1 · The agent loop and reasoning',
    index: '14.06',
    title: 'Tool use and function calling',
    oneLiner:
      'Single-turn function calling is effectively solved. Berkeley Function Calling Leaderboard V4 weights 40 percent agentic and 30 percent multi-turn because the remaining failures are memory, long chains, and knowing when not to call a tool at all.',
    readTime: '~10 min read',
    diagram: '/lessons/p14-06.svg',
    diagramCaption:
      'A tool call from schema to result: description-driven selection, argument validation and coercion, sandboxed execution, and correlation by tool_use_id.',
    whyItMatters:
      'The tool schema is a contract your UI renders on both ends. The description field is not documentation, it is the input that decides which tool gets picked, so bad descriptions are the top cause of wrong-tool failures and that makes them a copy problem you own. On the other end, every argument the model produces is untrusted until validated, and validation has three distinct outcomes: coerced, rejected with a retryable error, or executed. Those are three states, not a generic error toast. Parallel calls arrive with correlation IDs, so the transcript is a set of concurrent rows, and swapping an ID routes the wrong result to the wrong call.',
    learningObjectives: [
      'Explain Toolformer\'s self-supervised signal: keep a tool annotation only when it reduces next-token loss.',
      'Name BFCL V4\'s five evaluation categories and the percentage weight each carries.',
      'Write a tool description that states a trigger condition, not just a function, and say why that field decides selection.',
      'Classify a validation failure into one of three outcomes: coerced, rejected retryably, or executed.',
      'Design the correlation handling for parallel tool calls so a swapped tool_use_id cannot route a result to the wrong call.',
    ],
    sections: [
      {
        heading: 'The problem moved from one call to forty',
        body: 'Early tool use asked whether the model could predict one correct function call. That question is largely closed. Modern tool use asks whether a model can chain tools across 40 steps, with memory, under partial observability, recovering from tool failures, without inventing tools that do not exist.\n\nToolformer established the baseline and BFCL V4 defines the current evaluation target. The gap between the two is exactly where production agents live.',
      },
      {
        heading: 'Toolformer: the model annotates its own training data',
        body: 'Toolformer (Schick et al., NeurIPS 2023) let the model insert candidate API calls into its own pretraining corpus, execute each one, and keep the annotation only if including the tool result reduced loss on the next token. Then fine-tune on the filtered corpus. Tools covered a calculator, a question-answering system, search, translation, and a calendar, with no human labels anywhere in the signal.\n\nThe scale finding is the one with product consequences: tool use emerges with size. Small models got worse from tool annotations, large models got better. That is why 2026 frontier models have strong tool use baked in while most 7B models need explicit tool-use fine-tuning before they are reliable.',
      },
      {
        heading: 'BFCL V4: where the remaining failures live',
        body: 'The Berkeley Function Calling Leaderboard is the de facto 2026 evaluation. V4 splits into agentic at 40 percent, full trajectories with memory and dynamic decisions; multi-turn at 30 percent, interactive conversations with tool chains; live at 10 percent, real user-submitted prompts; non-live at 10 percent, synthetic cases; and hallucination at 10 percent, detecting when no tool should be called at all.\n\nV3 changed the scoring to state-based: after a tool sequence, check whether the API state actually changed, rather than matching the syntax of the calls. V4 added web search, memory, and format sensitivity. The finding to design around is that failures now concentrate in carrying context across turns, choosing tools based on prior results, drifting after 20-plus steps, and refusing to call when nothing fits.',
      },
      {
        heading: 'The schema, and why the description field is copy work',
        body: 'Every provider has the same shape: a name, a description of what the tool does and when to use it, and a JSON Schema of the arguments. Anthropic calls it input_schema, OpenAI nests it under function.parameters, both take JSON Schema.\n\nDescriptions decide the outcome. The model reads them to pick a tool, and bad descriptions are the number one root cause of wrong-tool-picked failures. That sentence is written by whoever owns the product language, not whoever owns the endpoint, which puts tool descriptions in the same bucket as button labels and empty-state copy: user-facing text with a measurable failure rate.',
      },
      {
        heading: 'Validate everything, and correlate parallel calls',
        body: 'Trust no tool call. Coerce types when unambiguous, such as the string "5" against an int schema, and reject when it is not. Validate enums: if the schema allows open or closed and the model emits in_progress, reject with a descriptive error. Missing required fields return an error observation, never a crash. Validate formats such as dates, emails, and URLs with real parsers rather than regex. Every failure returns structured text so the model can retry in the right shape.\n\nModern providers emit several tool calls in one assistant turn, each with a distinct tool_use_id, executed in parallel where independent, with results correlated back by that ID. Treat the IDs as essential to correctness: swap them and the wrong result routes to the wrong call. Execution is also the sandbox boundary, where each tool declares its read and write surface, network access, timeout, and memory cap. A generic run_shell is a red flag; a specific git_status is not.',
      },
      {
        heading: 'The hallucination category is a UI decision, not just a benchmark line',
        body: 'BFCL V4 dedicates 10 percent of its score to a model correctly refusing to call any tool when none fits. That is a capability, not a default, and most tool registries do not give the model an explicit way to exercise it: if every option is a named tool, "do nothing" is not on the menu.\n\nThe fix is a real entry in the registry, something like a no_tool option with its own description, use when the question can be answered without data access, so refusal is a selection the model can make rather than a behaviour it has to invent. Without it, the model either forces a bad call to the nearest-sounding tool or produces an answer with no grounding at all, and both failure modes look identical to a user until someone checks the trace.',
      },
      {
        heading: 'Multi-turn is the harder 30 percent, and it is a memory problem',
        body: 'Single-turn tool selection is close to solved; BFCL V4 weights it into the smaller non-live and live categories at 10 percent each. The 30 percent multi-turn weight and the 40 percent agentic weight are where accuracy actually drops, and both failures trace back to the same root cause: a tool choice at turn 6 depends on a result from turn 2, and the model has to carry that dependency across turns without it being restated.\n\nThis is the tool-use version of the memory problem covered in Phase 14 Part 2. A UI implication follows directly: if a multi-turn tool chain fails, the fix is rarely improving the prompt for this one call, it is checking whether the context from three turns back actually survived into the current turn\'s working set.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p14-06-inline-bfcl-weights.svg',
        alt: 'BFCL V4 category weights as a stacked bar',
        caption: 'Agentic and multi-turn carry 70 percent of the score combined; single-turn accuracy is nearly solved.',
        diagramBrief: 'A single horizontal stacked bar divided into 5 segments proportional to: Agentic 40%, Multi-Turn 30%, Live 10%, Non-Live 10%, Hallucination 10%. Each segment labeled with its name and percentage. Style: cream paper, black ink, the Agentic and Multi-Turn segments in one shared accent color to visually group the 70 percent that is hardest, the other three in neutral tones.',
      },
      {
        src: '/lessons/p14-06-inline-validation-states.svg',
        alt: 'Three outcomes of tool-call argument validation',
        caption: 'Every argument the model produces resolves to one of three states before execution.',
        diagramBrief: 'A flowchart: a box "Model emits tool call with arguments" branches into three outcome boxes: "Coerced (unambiguous type fix)", "Rejected (structured retryable error sent back)", "Executed (validated, dispatched)". Style: cream paper, black ink, three distinct accent colors on the outcome boxes (neutral, amber, green).',
      },
    ],
    takeaways: [
      'Tool descriptions are product copy with a measured failure rate. They decide selection, so they belong in review alongside labels and empty states.',
      'Validation has three outcomes: coerced, rejected retryably, executed. Three states in the transcript, not one error toast.',
      'Parallel calls are concurrent rows correlated by tool_use_id. Losing the correlation routes results to the wrong call silently.',
      'BFCL V4 weights agentic and multi-turn at 70 percent combined, so evaluate chains and memory, not single-call accuracy.',
    ],
    terms: [
      { term: 'Tool schema', gloss: '"the function signature"', meaning: 'A tool\'s name, its description of when to use it, and a JSON Schema for its arguments.' },
      { term: 'Toolformer', gloss: '"self-supervised tool learning"', meaning: 'A training method that keeps only the tool calls whose results reduce next-token loss.' },
      { term: 'BFCL', gloss: '"the function-calling benchmark"', meaning: 'The Berkeley Function Calling Leaderboard, weighted 40 percent agentic and 30 percent multi-turn in V4.' },
      { term: 'tool_use_id', gloss: '"the correlation ID"', meaning: 'The identifier that ties one tool call to its result, essential once calls run in parallel.' },
      { term: 'Argument coercion', gloss: '"fixing the type"', meaning: 'Repairing unambiguous type mismatches such as a numeric string, and rejecting anything ambiguous.' },
      { term: 'Hallucination detection', gloss: '"knowing when not to call"', meaning: 'The evaluation category for correctly refusing to call a tool when none fits.' },
      { term: 'State-based evaluation', gloss: '"did it actually work"', meaning: 'Checking whether the API\'s real state changed after a tool sequence, not just matching the call syntax.' },
      { term: 'Sandboxing', gloss: '"the execution boundary"', meaning: 'Per-tool read and write surface, network access, timeout, and memory cap enforced at dispatch.' },
      { term: 'no_tool option', gloss: '"do nothing"', meaning: 'An explicit registry entry that lets the model select refusal instead of forcing a call to the nearest tool.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Rewrite this tool description to name a trigger condition: get_data(id): "gets data by ID."' },
      { level: 'medium', prompt: 'A model emits get_invoice(id="INV-2024-001") against a schema expecting id as an integer. Classify this as coerced, rejected, or executed, and write the observation string the loop should return.' },
      { level: 'hard', prompt: 'Three tool calls arrive in one assistant turn with tool_use_id values A, B, and C. The runtime executes them in parallel and B finishes first. Describe exactly how the results must be routed back so nothing depends on completion order.' },
      { level: 'design', prompt: 'Audit five tool descriptions from a real product (yours or one you use) against the BFCL hallucination category. For each, decide whether a no_tool option exists as a real registry entry, and if not, write one.' },
    ],
    furtherReading: [
      { label: 'Schick et al., Toolformer (arXiv:2302.04761)', url: 'https://arxiv.org/abs/2302.04761', why: 'The self-supervised tool-annotation method and the finding that tool use emerges with scale.' },
      { label: 'Berkeley Function Calling Leaderboard (V4)', url: 'https://gorilla.cs.berkeley.edu/leaderboard.html', why: 'Run your own agent against it before shipping if tool use is central to the product.' },
      { label: 'Claude Agent SDK overview', url: 'https://platform.claude.com/docs/en/agent-sdk/overview', why: 'The production tool schema (input_schema) and how descriptions are consumed at selection time.' },
      { label: 'OpenAI Agents SDK docs', url: 'https://openai.github.io/openai-agents-python/', why: 'The function tool type and Guardrails as production validation around tool calls.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Tool description review checklist',
      body: '- Each description states when to use the tool, not just what it does\n- A no_tool option exists in the registry with its own trigger condition\n- Every argument path resolves to coerced, rejected, or executed, never a crash\n- Enum and format fields are validated with real parsers, not regex\n- Parallel calls carry distinct tool_use_id values and results route back by ID, never by arrival order\n- Each tool declares its read and write surface, network access, timeout, and memory cap',
    },
    demoCaption:
      'Slide the tool description from vague to specific and watch which tool the model selects. The description is the only thing the model reads before choosing.',
    demo: {
      archetype: 'slider-map',
      subject: 'Tool selection',
      sliderLabel: 'Description specificity (when to use, not just what it does)',
      outputLabel: 'Correct tool selected',
      badLines: [
        'get_data: "gets data"',
        'fetch_record: "fetches a record"',
        'lookup: "looks things up"',
      ],
      goodLines: [
        'get_invoice(id): "returns one invoice by ID. Use when the user names a specific invoice number."',
        'search_invoices(query): "returns up to 20 matching invoices. Use when the user describes an invoice but has no ID."',
        'no_tool: "use when the question can be answered without data access."',
      ],
      badCaption:
        'Three descriptions that say what a tool does and never when to use it. The model picks by name similarity, which is the number one root cause of wrong-tool failures, and no amount of argument validation catches a correctly-formed call to the wrong tool.',
      goodCaption:
        'Each description names its trigger condition, and an explicit no-tool option gives the model somewhere to go when nothing fits, which is 10 percent of BFCL V4. Selection accuracy tracks description quality, so this copy sits in review with your labels.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'single-turn function calling is basically solved. that is not where agents fail.',
        body:
          'single-turn function calling is basically solved. that is not where agents fail.\n\nBFCL V4 weights it: 40% agentic, 30% multi-turn, 10% hallucination detection.\n\nfailures now live in carrying context across turns, picking tools from prior results, drift past 20 steps, and knowing when not to call anything.',
      },
      {
        kind: 'X · design angle',
        hook: 'the tool description field is product copy, not documentation.',
        body:
          'the tool description field is product copy, not documentation.\n\nit is the only thing the model reads before choosing a tool. bad descriptions are the #1 cause of wrong-tool-picked failures.\n\n"gets data" vs "returns one invoice by ID, use when the user names a specific number". same endpoint, different failure rate.',
      },
      {
        kind: 'X · one-liner',
        hook: 'a validation failure is not an error. it is a retry.',
        body:
          'a validation failure is not an error. it is a retry.\n\ncoerced, rejected-with-reason, executed: three states, three treatments. a missing required field returns a structured observation the model can act on, not a crash.\n\nand keep the tool_use_id straight or parallel results route to the wrong call.',
      },
    ],
    source: {
      label: 'Full lesson: 14.06 06-tool-use-and-function-calling',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/14-agent-engineering/06-tool-use-and-function-calling',
    },
  },
  {
    id: 'p14-11-planning',
    phase: 'Phase 14 · Agent Engineering',
    part: 'Part 1 · The agent loop and reasoning',
    index: '14.11',
    title: 'Planning with HTN and evolutionary search',
    oneLiner:
      'Two cases the LLM loop handles badly: plans that must be provably sound, and optimizations with a machine-checkable score. HTN owns the first, AlphaEvolve owns the second, and in both the model is an amplifier that never touches the correctness layer.',
    readTime: '~10 min read',
    diagram: '/lessons/p14-11.svg',
    diagramCaption:
      'HTN decomposition: a compound task expands through methods into primitive operators, each gated by preconditions, with an LLM fallback proposing candidates the schema must accept.',
    whyItMatters:
      'This lesson gives you the vocabulary for the strongest guarantee an agent product can offer: the plan is sound by construction because a symbolic layer, not the model, validated every step. That is a badge with actual meaning, and it changes what the approval UI shows. Preconditions encode policy, so a blocked step can name the unmet fact instead of returning a vague refusal, which turns a dead end into a fixable one. When an LLM fallback proposes a decomposition, mark those nodes: a user reviewing a plan should see which steps came from the method library and which came from a suggestion the validator merely accepted.',
    learningObjectives: [
      'Define an HTN\'s four parts (tasks, methods, operators, state) and explain what makes a plan "sound by construction."',
      'Trace ChatHTN\'s hybrid loop: symbolic decomposition first, LLM fallback only when no method matches, validated before acceptance.',
      'Explain why AlphaEvolve requires a deterministic, machine-checkable evaluator and what happens without one.',
      'Choose between HTN, AlphaEvolve, and ReAct or ReWOO for a given task, using the problem-class table as a decision rule.',
      'Design a blocked-plan-step message that names the unmet precondition instead of returning a generic refusal.',
    ],
    sections: [
      {
        heading: 'The problem: two jobs the LLM loop does badly',
        body: 'ReAct, ReWOO, and plan-and-execute cover most agent planning. Two cases they do not. First, plans that must be provably correct: scheduling, flight pathing, compliance workflows, where a fluent plan that occasionally hallucinates a step is unacceptable. Second, optimizations with a machine-checkable fitness function: matrix multiplication, scheduling heuristics, compiler passes, where the goal is not a correct plan but the best one.\n\nHierarchical task networks handle the first, AlphaEvolve handles the second, and both use the model as an amplifier rather than a replacement.',
      },
      {
        heading: 'HTN: tasks, methods, operators, preconditions, effects',
        body: 'An HTN has four pieces. Tasks, which are either compound (needing decomposition) or primitive (directly executable). Methods, which are ways to decompose a compound task into subtasks, each with preconditions. Operators, the primitive actions with preconditions and effects. And state, a set of facts.\n\nPlanning means finding a decomposition of the goal task into primitive operators whose preconditions all hold in sequence. HTN predates LLMs entirely and remains the reference for provably correct plans. The consequence worth carrying into product work: a precondition is policy written as a fact, so "cannot proceed" always has a nameable reason.',
      },
      {
        heading: 'ChatHTN: the model expands the library, not the plan',
        body: 'ChatHTN (Gopalakrishnan et al., 2025) interleaves symbolic search with model queries. Try to decompose the current compound task with existing methods. If none applies, ask the model how it would decompose this task in this state. Translate the response into candidate subtasks. Validate against the operator schema and reject anything invalid. Recurse.\n\nThe central claim: every plan produced is provably sound, because model suggestions enter only as candidate decompositions and never as direct plan edits. The symbolic layer owns correctness, the model expands the method library. A 2025 follow-up adds online method learning that generalizes accepted decompositions by regression, cutting model query frequency by up to 75 percent.',
      },
      {
        heading: 'AlphaEvolve: mutation plus a fitness function that cannot lie',
        body: 'AlphaEvolve (Novikov et al., DeepMind, June 2025) is a different shape: evolutionary code search orchestrated by a Gemini 2.0 Flash and Pro ensemble. Start with a seed program and a programmatic evaluator returning a fitness score. The ensemble proposes mutations, the evaluator scores them, the best survive and mutate again.\n\nPublished wins: the first improvement over Strassen for 4x4 complex matrix multiplication in 56 years, at 48 scalar multiplications; 0.7 percent of Google compute recovered through a Borg scheduling heuristic; a 32 percent FlashAttention speedup on a frontier workload. The hard constraint is the evaluator. It must be deterministic, fast, and machine-checkable. Evolutionary search over prose does not converge, because there is nothing to converge toward.',
      },
      {
        heading: 'Picking one, and the three ways it goes wrong',
        body: 'Scheduling with hard constraints goes to HTN with a ChatHTN fallback, for provable soundness. Compiler optimization and code improvement with tests go to AlphaEvolve, because the tests are the evaluator. Multi-step task execution stays with ReAct or ReWOO, with no formal guarantees. Policy-bound automation goes to HTN, because preconditions encode the policy directly.\n\nThree failure modes. HTN without operator schemas, where the soundness claim collapses because there is nothing to reject an invalid model suggestion. AlphaEvolve without a real evaluator, where "ask the model if the code is better" is not a fitness function. And over-engineering, which is the common one: most agent tasks need neither, and ReAct or ReWOO is the honest first reach.',
      },
      {
        heading: 'Soundness is a claim about the layer, not the model',
        body: '"Sound by construction" is a specific, checkable claim: every step in the plan satisfies its preconditions given the state before it, verified by a symbolic layer rather than asserted by a fluent model. That distinction matters because a plan can read as completely coherent prose and still be wrong, and coherence is exactly what a model is good at producing regardless of correctness.\n\nThe practical test is whether an auditor could take the plan and the state and re-derive the same soundness verdict without trusting the model at all. If yes, the operator schema is doing real work. If the verification is another model call asked to check the first model call\'s plan, nothing has actually been proven, and the badge is decoration.',
      },
      {
        heading: 'Where the two patterns meet: hybrid pipelines',
        body: 'HTN and AlphaEvolve solve different problems, but real systems often chain them: use HTN to decompose a compound task into a sequence of primitive operators, then hand one operator, such as generate the fastest sort implementation for this input distribution, to an evolutionary search with a test suite as the fitness function. The symbolic layer keeps the overall plan auditable, and the evolutionary layer optimizes the one step that has a machine-checkable target.\n\nThe failure mode to watch for is applying the wrong layer to the wrong step: running evolutionary search on a step that has no real evaluator just burns compute on drift, and running HTN decomposition on a step whose goal is better, not correct, produces a plan that is sound but not optimal.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p14-11-inline-htn-decomposition.svg',
        alt: 'A compound task decomposing into primitive operators through methods',
        caption: 'Each method decomposes a compound task into subtasks, gated by preconditions, until only primitive operators remain.',
        diagramBrief: 'A tree diagram: root node "Compound task: schedule flight" branches via two method boxes into 3 subtask nodes, one of which is still compound and branches once more into 2 primitive operator nodes at the bottom, each tagged with a small precondition label. Style: cream paper, black ink, primitive operators highlighted in one accent color to distinguish executable leaves from compound nodes.',
      },
      {
        src: '/lessons/p14-11-inline-alphaevolve-loop.svg',
        alt: 'The evolutionary search loop: mutate, evaluate, select',
        caption: 'An ensemble proposes mutations, a deterministic evaluator scores them, and the best survive to mutate again.',
        diagramBrief: 'A circular loop diagram with 4 stages labeled clockwise: "Seed program", "LLM ensemble proposes mutations", "Deterministic evaluator scores each", "Best survive, mutate again" looping back to stage 2. Style: cream paper, black ink, the evaluator stage highlighted in one accent color to emphasize it is the only non-negotiable, deterministic step.',
      },
    ],
    takeaways: [
      'Sound by construction is a claim you can only make when a symbolic layer validates every step. It survives an audit; a fluent plan does not.',
      'Preconditions are policy as facts, so a blocked step names the missing condition instead of refusing vaguely.',
      'Mark model-proposed decompositions in the plan view. Library-derived and validator-accepted are different provenance, and reviewers need to see which.',
      'Evolutionary search needs a deterministic machine-checkable evaluator. Without one there is no fitness, only drift.',
    ],
    terms: [
      { term: 'HTN', gloss: '"hierarchical planner"', meaning: 'Hierarchical task network: planning by decomposing compound tasks into primitive operators.' },
      { term: 'Method', gloss: '"a decomposition rule"', meaning: 'A rule for decomposing one compound task into subtasks, guarded by preconditions.' },
      { term: 'Operator', gloss: '"a primitive action"', meaning: 'A primitive executable action with explicit preconditions and effects on state.' },
      { term: 'ChatHTN', gloss: '"LLM plus HTN"', meaning: 'A hybrid planner where the symbolic layer asks a model for a decomposition only when no method applies.' },
      { term: 'AlphaEvolve', gloss: '"evolutionary code search"', meaning: 'Evolutionary code search where a model ensemble mutates programs and a deterministic evaluator selects.' },
      { term: 'Fitness function', gloss: '"the evaluator"', meaning: 'A deterministic, machine-checkable score over candidate outputs, the thing evolution optimizes.' },
      { term: 'Precondition', gloss: '"a requirement"', meaning: 'A fact that must hold in the current state before an operator or method can apply.' },
      { term: 'Sound by construction', gloss: '"provably correct"', meaning: 'A plan verified step by step against preconditions by a symbolic layer, not asserted by a fluent model.' },
      { term: 'Online method learning', gloss: '"caching what the model suggested"', meaning: 'Generalizing accepted model decompositions by regression, cutting future model queries by up to 75 percent.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'An operator "transfer_funds" has precondition approval_recorded(step_3). The current state does not include that fact. Write the blocked-step message a user should see, naming the exact unmet condition.' },
      { level: 'medium', prompt: 'ChatHTN asks the model for a decomposition because no method matches. The model proposes a subtask that is not in the operator schema. Walk through what the symbolic layer does next, step by step.' },
      { level: 'hard', prompt: 'You are choosing between HTN and AlphaEvolve for a task: produce the fastest valid database migration script for a given schema change, verified by a test suite that checks correctness but not speed. Decide which pattern fits which part of the task and justify the split.' },
      { level: 'design', prompt: 'Design a plan-review screen that distinguishes library-derived steps from model-proposed steps that the validator merely accepted. Decide what visual signal marks the difference and what a reviewer should be prompted to check on a model-proposed step that they would not need to check on a library step.' },
    ],
    furtherReading: [
      { label: 'Gopalakrishnan et al., ChatHTN (arXiv:2505.11814)', url: 'https://arxiv.org/abs/2505.11814', why: 'The symbolic-plus-LLM hybrid planner and its soundness argument.' },
      { label: 'Novikov et al., AlphaEvolve (arXiv:2506.13131)', url: 'https://arxiv.org/abs/2506.13131', why: 'The evolutionary search paper, including the matrix multiplication and Borg scheduling results.' },
      { label: 'Anthropic, Building Effective Agents', url: 'https://www.anthropic.com/research/building-effective-agents', why: 'The reminder that most tasks need neither HTN nor evolutionary search; start with ReAct or ReWOO.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Sound-plan review checklist',
      body: '- Every plan step traces to an operator with explicit preconditions and effects, not just a fluent description\n- A blocked step names the specific unmet precondition and the action that would unblock it\n- Model-proposed decompositions are visually marked apart from library-derived steps\n- The evaluator behind any optimization step is deterministic and machine-checkable, not another model asked to judge quality\n- The soundness claim could survive an audit that does not trust the model at all',
    },
    demoCaption:
      'The same plan step, refused two ways. One refusal ends the interaction; the other names the fact that is missing and tells the user what would unblock it.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Blocked plan step',
      badLabel: 'Fluent refusal',
      goodLabel: 'Precondition as policy',
      badLines: [
        'Step 4: transfer funds',
        'Status: cannot complete',
        'Reason: "I am unable to do that"',
        'Next action available: none',
      ],
      goodLines: [
        'Step 4: transfer funds',
        'Status: blocked, precondition unmet',
        'Required fact: approval_recorded(step_3)',
        'Held facts: account_verified, limit_ok',
        'Unblock: approve step 3, then re-plan from node 4',
      ],
      badCaption:
        'A model-generated refusal is prose, so it cannot be checked, audited, or acted on. The user learns that something is wrong and nothing about what would fix it.',
      goodCaption:
        'The symbolic layer names the unmet precondition, which makes the block a fixable state with a specific unblock action. Preconditions are policy written as facts, which is also why the plan is sound by construction rather than sound by fluency.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'ChatHTN lets an LLM into a symbolic planner without letting it break the guarantee.',
        body:
          'ChatHTN lets an LLM into a symbolic planner without letting it break the guarantee.\n\nno method matches? ask the model for a decomposition. then validate it against the operator schema and reject anything invalid.\n\nmodel suggestions enter as candidates, never as plan edits. the symbolic layer keeps correctness.',
      },
      {
        kind: 'X · design angle',
        hook: '"i am unable to do that" is a refusal. "precondition approval_recorded(step_3) is unmet" is a fixable state.',
        body:
          '"i am unable to do that" is a refusal. "precondition approval_recorded(step_3) is unmet" is a fixable state.\n\nHTN preconditions are policy written as facts. that means a blocked step can name the missing condition and the exact action that unblocks it.\n\nauditable beats fluent when the plan touches money.',
      },
      {
        kind: 'X · one-liner',
        hook: 'alphaevolve found the first improvement to 4x4 matmul in 56 years.',
        body:
          'alphaevolve found the first improvement to 4x4 matmul in 56 years. 48 scalar multiplications. plus 0.7% of google compute recovered from a scheduling heuristic.\n\nthe whole thing runs on one requirement: a deterministic, machine-checkable evaluator.\n\nno fitness function, no evolution. just drift.',
      },
    ],
    source: {
      label: 'Full lesson: 14.11 11-planning-htn-and-evolutionary',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/14-agent-engineering/11-planning-htn-and-evolutionary',
    },
  },
];
