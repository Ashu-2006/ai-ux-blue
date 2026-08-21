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
      'Every agent shipping in 2026 is a variant of the ReAct loop from 2022. The model thinks, calls a tool, reads the result, and repeats until a stop condition fires. Everything else is scaffolding.',
    readTime: '~8 min read',
    diagram: '/lessons/p14-01.svg',
    diagramCaption:
      'One iteration of the loop: message buffer, model turn, tool dispatch, observation appended, stop condition checked.',
    whyItMatters:
      'A chat UI renders one request and one response. An agent run renders 40 to 400 steps, and the loop is the state machine your components own. Each iteration renders live: a reasoning block, a tool call with arguments, an observation that may be a 400 error. Your run view needs a per-step status, a turn counter against a budget, and a stop reason that distinguishes finished, capped, and guardrail-tripped. Those three stop reasons are three different empty states, not one toast. Tool output is also untrusted input, so the observation block is where you mark provenance rather than letting it read as the agent speaking.',
    sections: [
      {
        heading: 'The problem: a model alone cannot check anything',
        body: 'An LLM by itself is autocomplete. Ask it a question, get a string. It cannot read a file, run a query, open a browser, or verify a claim. If its information is stale it will state the wrong thing confidently and stop.\n\nAgents fix this with one pattern: a loop that lets the model pause, call a tool, read the result, and keep thinking. That is the whole idea. Memory, planning, subagents, debate, and evals are all scaffolding built around this loop.',
      },
      {
        heading: 'ReAct: the canonical three-part turn',
        body: 'Yao et al. (ICLR 2023) named the format Reason plus Act. Each turn emits a Thought, an Action, and an Observation, in that order, in one stream. Thought: I need the capital of France. Action: search("capital of France"). Observation: Paris is the capital of France.\n\nThe original paper measured three absolute wins over imitation and RL baselines: plus 34 points success rate on ALFWorld with only one or two in-context examples, plus 10 points on WebShop, and recovery from hallucination on HotpotQA because every step is grounded in retrieval.\n\nThe reasoning trace does three things action-only prompting cannot: induce a plan, carry the plan across steps, and handle the exception when an action returns something unexpected.',
      },
      {
        heading: 'The 2026 shift: reasoning moved to its own channel',
        body: 'Printing "Thought:" as literal tokens was a 2022 workaround. The Responses API lineage replaced it with native reasoning: the model emits reasoning content on a separate channel, and that channel is passed through turns, encrypted across providers in production. Letta V1 deprecated the old send_message plus heartbeat scheme for exactly this.\n\nWhat did not change is the control flow. Observe, think, act, observe, think, act, stop. For the interface this is a schema change, not a behaviour change: reasoning is now a distinct block type you can collapse by default instead of a substring you have to parse out of the answer.',
      },
      {
        heading: 'Five ingredients, and what each one costs you in UI',
        body: 'Miss any one and you have a chatbot, not an agent. A message buffer that grows: user, assistant, tool, assistant, tool, final. A tool registry the model invokes by name. A stop condition: an explicit finish call, an assistant turn with no tool calls, max turns, max tokens, or a tripped guardrail. A turn budget, because Anthropic\'s computer use guidance says dozens to hundreds of steps per task is normal and the right cap is per task class. And an observation formatter, because every 400 error in your stack has to arrive as a readable observation string rather than a crash.\n\nThe budget and the stop reason are the two the user has to see.',
      },
      {
        heading: 'Why the loop is invariant across every framework',
        body: 'Claude Agent SDK, OpenAI Agents SDK, LangGraph, AutoGen v0.4, CrewAI, Agno, Mastra: all of them run a ReAct-shaped loop underneath. What differs is what lives around it, which is state checkpointing, actor-model message passing, role templates, or tracing spans.\n\nThe pitfalls are also shared. Trust boundary collapse: a retrieved PDF can carry an instruction that the model treats as a command, which is why OpenAI\'s computer-use docs say only direct instructions from the user count as permission. Cascading failure: agents cannot tell "I failed" from "this is impossible" and often hallucinate success on a 400. Loop length explosion: debugging step 38 requires that step 38 was recorded.',
      },
    ],
    takeaways: [
      'An agent run is a state machine with 40 to 400 steps, not one request. Render the turn counter against the budget from the first step.',
      'There are at least three stop reasons: finished, budget exhausted, guardrail tripped. Each one is a different terminal state in the UI.',
      'Tool output is untrusted input. Mark observation provenance in the transcript so an injected instruction never reads as the agent\'s own voice.',
      'Reasoning is now a separate channel, so the transcript schema has a collapsible block type rather than a string you parse.',
    ],
    terms: [
      { term: 'ReAct', meaning: 'The loop format that interleaves Thought, Action, and Observation in one stream (Yao et al., 2022).' },
      { term: 'Observation', meaning: 'The string form of a tool result, fed back into the next model prompt.' },
      { term: 'Reasoning channel', meaning: 'Native model reasoning emitted on a separate stream and passed through turns.' },
      { term: 'Stop condition', meaning: 'The rule that ends the loop: explicit finish, no tool calls, max turns, max tokens, or a guardrail trip.' },
      { term: 'Turn budget', meaning: 'A hard cap on iterations, set per task class rather than globally.' },
      { term: 'Trace', meaning: 'The full recorded sequence of thought, action, and observation tuples for one run.' },
    ],
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
    readTime: '~8 min read',
    diagram: '/lessons/p14-02.svg',
    diagramCaption:
      'Planner emits a DAG with evidence references, workers execute nodes in dependency order, solver composes the final answer.',
    whyItMatters:
      'ReWOO hands you the one artifact interleaved ReAct never produces: a complete plan that exists before any side effect. That is the approval surface. You can render the DAG, mark which nodes write and which only read, and gate the run behind a single confirm instead of interrupting per step. Failure localization is per node, not per step, so a failed node is a row with its own retry affordance rather than a dead run. And because worker prompts carry no chain, the plan is stable enough to diff: if a replanner revises it, you can show the user exactly which nodes changed.',
    sections: [
      {
        heading: 'The problem: interleaving makes context grow quadratically',
        body: 'ReAct is simple and flexible, but every tool call has to carry the full prior context, including every previous thought. At step 10 the prompt contains thought 1, action 1, observation 1, thought 2, action 2, observation 2, and so on, plus a redundant copy of the original prompt at each step. Token usage grows with depth.\n\nWorse, when a tool fails mid-loop the model has to re-derive the entire plan from an error observation, in the middle of a stream, with no way for anyone to inspect what it decided.',
      },
      {
        heading: 'The move: planner, workers, solver',
        body: 'ReWOO (Xu et al., May 2023) splits the agent into three roles. The planner takes the user question and emits a plan DAG. Each node names a tool, its arguments, and which earlier nodes it depends on, using evidence references like #E1 and #E2. Workers execute nodes in topological order, in parallel where the DAG allows. The solver reads the question, the plan, and all the evidence, and composes the answer.\n\nThe planner never sees observations. That is the constraint that makes everything else work: one large planner prompt, N small worker prompts that each contain only their own tool call, and one solver prompt. On HotpotQA the paper measures roughly 5x fewer tokens and plus 4 points absolute accuracy.',
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
    ],
    takeaways: [
      'The plan exists before any side effect, which makes it the natural approval gate: one confirm on a DAG beats a confirm per step.',
      'Roughly 5x fewer tokens and plus 4 points on HotpotQA is the tradeoff for a static plan. Buy it when the tools are known.',
      'Failures localize to a node, so error and retry are row-level affordances and downstream nodes render as blocked, not broken.',
      'A distilled 7B planner returns the plan fast enough to render for review while the executor is still warming up.',
    ],
    terms: [
      { term: 'ReWOO', meaning: 'Reasoning without observations: plan first, gather evidence, then solve, with no observations in the planning prompt.' },
      { term: 'Plan DAG', meaning: 'The planner output: nodes naming a tool and arguments, edges naming dependencies.' },
      { term: 'Evidence reference', meaning: 'A placeholder like #E1 in a plan node, substituted with a prior worker result at dispatch time.' },
      { term: 'Solver', meaning: 'The final call that reads question, plan, and all evidence, and writes the answer.' },
      { term: 'Replanner', meaning: 'The optional node that revises the plan after partial execution; what makes ReWOO into plan-and-execute.' },
      { term: 'Planner distillation', meaning: 'Fine-tuning a small model on planner traces from a large teacher, so planning stops needing a frontier model.' },
    ],
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
    readTime: '~8 min read',
    diagram: '/lessons/p14-03.svg',
    diagramCaption:
      'Actor produces a trajectory, evaluator scores it, self-reflector writes a reflection into episodic memory, and the next trial starts fresh with that memory prepended.',
    whyItMatters:
      'Reflexion turns learned behaviour into a text buffer, which means it is editable, and anything editable is a UI surface. Every reflection is a row: the failure it came from, when it was written, and whether it still applies. Users need to read, pin, correct, and delete them, because the failure mode of this pattern is memory rot, a buffer full of superstition from one flaky run that quietly steers every future trial. Give reflections a TTL and show it. Show which reflections were in context for a given run, so when an agent behaves oddly the explanation is one click away rather than invisible.',
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
    ],
    takeaways: [
      'Learning lives in an editable text buffer, so reflections need list, pin, correct, and delete affordances like any other user-owned data.',
      'Show which reflections were in context for a run. Otherwise an agent that changed behaviour looks arbitrary.',
      'A scalar pass and a self-rated pass are different confidence states. Do not render them with the same badge.',
      'Memory rot is the failure mode: give reflections a TTL, surface staleness, and compact on a schedule.',
    ],
    terms: [
      { term: 'Reflexion', meaning: 'Actor, evaluator, and self-reflector plus episodic memory, improving behaviour without weight updates.' },
      { term: 'Verbal reinforcement', meaning: 'Carrying a lesson between trials as natural language prepended to the next prompt.' },
      { term: 'Episodic memory', meaning: 'A bounded buffer of prior reflections scoped to one task class.' },
      { term: 'Scalar evaluator', meaning: 'A binary or numeric success signal from ground truth, such as a passing test.' },
      { term: 'Heuristic evaluator', meaning: 'A predefined failure signature such as repeated actions or exceeding a step count.' },
      { term: 'Memory rot', meaning: 'Accumulated obsolete or wrong reflections that slow runs down and steer them badly.' },
    ],
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
    readTime: '~8 min read',
    diagram: '/lessons/p14-04.svg',
    diagramCaption:
      'A thought tree: each node expands to K children, each child gets a self-evaluated score, and search keeps the promising branches and abandons the rest.',
    whyItMatters:
      'Search is the only agent pattern where the cost is 100 to 1000x, which makes it a budget you must render rather than absorb. If a run can branch, the UI needs a live node counter, a spend meter against a cap, and a stop control that is not a page refresh. Progress is also non-monotonic: a promising branch gets abandoned, so a linear progress bar lies. Show explored versus pruned instead. And put the search behind an explicit gate, because the honest default is a single trajectory with tool-grounded verification, and search is the escalation the user opts into once and can see the price of.',
    sections: [
      {
        heading: 'The problem: a linear chain commits to its first mistake',
        body: 'Chain of thought is a single walk. If step one is wrong, every step after it reasons correctly on a bad premise. On Game of 24, where you combine four digits with arithmetic to reach 24, GPT-4 with chain of thought hits 4 percent. The model picks a bad subexpression early and has no way back.\n\nWhat reasoning needs is the ability to propose several candidates, score them, keep the promising ones, and backtrack from dead ends. That is search, and Tree of Thoughts and LATS are the two canonical formulations of it for language models.',
      },
      {
        heading: 'Tree of Thoughts: nodes, expansion, self-evaluation',
        body: 'Each node in ToT (Yao et al., NeurIPS 2023) is a coherent intermediate step, a thought. Each node expands to K children. The model self-evaluates each node with a scoring prompt, and the search walks the tree breadth first, depth first, or with a beam.\n\nSelf-evaluation is the load-bearing part. The paper tested three scoring variants: a sure, likely, or impossible classification, a 1 to 10 numeric score, and a vote among candidates. All three beat chain of thought substantially, taking Game of 24 from 4 percent to 74 percent with GPT-4.',
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
    ],
    takeaways: [
      'Search costs 100 to 1000x the tokens of a single chain. That is a rendered budget with a cap and a stop control, not a background cost.',
      'Progress is non-monotonic because branches get abandoned. Show nodes explored and pruned instead of a progress bar that only moves forward.',
      'Search amplifies the evaluator. With a noisy value function it finds confident wrong answers faster, so verify the evaluator before enabling it.',
      'Put search behind an explicit escalation gate. A single trajectory with tool-grounded verification is the honest default.',
    ],
    terms: [
      { term: 'Tree of Thoughts', meaning: 'Reasoning as a tree of intermediate thought nodes, each self-evaluated and expanded or pruned.' },
      { term: 'LATS', meaning: 'Monte Carlo Tree Search over agent trajectories, unifying ToT, ReAct, and Reflexion.' },
      { term: 'Value function', meaning: 'The score for a partial trajectory, from a prompted model or a real environment reward.' },
      { term: 'UCT', meaning: 'The selection formula balancing a node\'s known value against how little it has been explored.' },
      { term: 'Rollout', meaning: 'One simulated walk from a node to a leaf, scored to update the tree.' },
      { term: 'Backpropagate', meaning: 'Pushing a leaf\'s reward back up its ancestors, updating visit counts and value estimates.' },
    ],
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
    readTime: '~8 min read',
    diagram: '/lessons/p14-05.svg',
    diagramCaption:
      'The refine loop: generate, feedback or external verification, revise with full history, and a stop condition that combines a passing verifier with an iteration cap.',
    whyItMatters:
      'This is the pattern that decides what "reviewed" means in your UI. A self-rated pass and a verifier-backed pass look identical in a component unless you make them different, and only one of them is evidence. Render the verifier that ran, what it returned, and which iteration produced the shipped version. Budget the loop at one to three passes and make the fourth an escalation to a human, because latency is per pass and the honest ceiling is low. The rubber-stamp failure is a design failure too: if evaluator and generator look the same to the user, "approved" stops meaning anything.',
    sections: [
      {
        heading: 'The problem: almost right, and nobody checks',
        body: 'An agent produces an answer that is nearly correct. A line of code has a syntax error, a summary runs long, a plan misses an edge case. What you want is for the agent to critique its own output and fix it before it reaches anyone.\n\nSelf-Refine (Madaan et al., NeurIPS 2023) showed this works with one model, no training data and no reinforcement learning. But it has a catch that CRITIC named: models are bad at verifying their own factual claims, because a hallucination usually looks convincing to the model that produced it.',
      },
      {
        heading: 'Self-Refine: three prompts and one non-negotiable detail',
        body: 'One model plays three roles. Generate produces output zero. Feedback critiques it. Refine rewrites it given the task, the output, the critique, and the history. Then feedback runs again on the new output, and so on, stopping when feedback reports no issues or the budget runs out.\n\nThe history is the load-bearing detail. Refine sees every prior output and every prior critique, so it does not cycle back through mistakes it already made. The paper ablates this and quality drops sharply without it. Headline result: plus 20 absolute averaged across seven tasks including math, code, acronym generation, and dialogue, with no training and no external tools.',
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
    ],
    takeaways: [
      'A self-rated pass and a verifier-backed pass are different evidence. Render the verifier that ran, or the badge is decoration.',
      'Refine needs full history of prior outputs and critiques. Drop it and quality collapses, so the transcript keeps every iteration.',
      'Budget one to three passes, then escalate to a human. Each pass is a full round trip of latency the user is waiting through.',
      'Evaluator and optimizer prompts must be structurally different, or the loop converges on "looks good to me" and approval means nothing.',
    ],
    terms: [
      { term: 'Self-Refine', meaning: 'A generate, feedback, refine loop in a single model, with full history carried into each revision.' },
      { term: 'CRITIC', meaning: 'Self-Refine with the feedback step replaced by verification against external tools.' },
      { term: 'Evaluator-optimizer', meaning: 'Anthropic\'s name for the pattern: one role scores, another revises, looped to convergence.' },
      { term: 'Output guardrail', meaning: 'A validator that runs on an agent\'s final output and can reject it for retry.' },
      { term: 'Refine history', meaning: 'The prior outputs and critiques prepended to the revision prompt; dropping it collapses quality.' },
      { term: 'Rubber-stamp loop', meaning: 'A critique step that approves everything because it shares prompt style with the generator.' },
    ],
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
    readTime: '~8 min read',
    diagram: '/lessons/p14-06.svg',
    diagramCaption:
      'A tool call from schema to result: description-driven selection, argument validation and coercion, sandboxed execution, and correlation by tool_use_id.',
    whyItMatters:
      'The tool schema is a contract your UI renders on both ends. The description field is not documentation, it is the input that decides which tool gets picked, so bad descriptions are the top cause of wrong-tool failures and that makes them a copy problem you own. On the other end, every argument the model produces is untrusted until validated, and validation has three distinct outcomes: coerced, rejected with a retryable error, or executed. Those are three states, not a generic error toast. Parallel calls arrive with correlation IDs, so the transcript is a set of concurrent rows, and swapping an ID routes the wrong result to the wrong call.',
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
        body: 'Every provider has the same shape: a name, a description of what the tool does and when to use it, and a JSON Schema of the arguments. Anthropic calls it input_schema, OpenAI nests it under function.parameters, both take JSON Schema.\n\nDescriptions are load-bearing. The model reads them to pick a tool, and bad descriptions are the number one root cause of wrong-tool-picked failures. That sentence is written by whoever owns the product language, not whoever owns the endpoint, which puts tool descriptions in the same bucket as button labels and empty-state copy: user-facing text with a measurable failure rate.',
      },
      {
        heading: 'Validate everything, and correlate parallel calls',
        body: 'Trust no tool call. Coerce types when unambiguous, such as the string "5" against an int schema, and reject when it is not. Validate enums: if the schema allows open or closed and the model emits in_progress, reject with a descriptive error. Missing required fields return an error observation, never a crash. Validate formats such as dates, emails, and URLs with real parsers rather than regex. Every failure returns structured text so the model can retry in the right shape.\n\nModern providers emit several tool calls in one assistant turn, each with a distinct tool_use_id, executed in parallel where independent, with results correlated back by that ID. Treat the IDs as load-bearing: swap them and the wrong result routes to the wrong call. Execution is also the sandbox boundary, where each tool declares its read and write surface, network access, timeout, and memory cap. A generic run_shell is a red flag; a specific git_status is not.',
      },
    ],
    takeaways: [
      'Tool descriptions are product copy with a measured failure rate. They decide selection, so they belong in review alongside labels and empty states.',
      'Validation has three outcomes: coerced, rejected retryably, executed. Three states in the transcript, not one error toast.',
      'Parallel calls are concurrent rows correlated by tool_use_id. Losing the correlation routes results to the wrong call silently.',
      'BFCL V4 weights agentic and multi-turn at 70 percent combined, so evaluate chains and memory, not single-call accuracy.',
    ],
    terms: [
      { term: 'Tool schema', meaning: 'A tool\'s name, its description of when to use it, and a JSON Schema for its arguments.' },
      { term: 'Toolformer', meaning: 'Self-supervised tool learning that keeps only the tool calls whose results reduce next-token loss.' },
      { term: 'BFCL', meaning: 'The Berkeley Function Calling Leaderboard, weighted 40 percent agentic and 30 percent multi-turn in V4.' },
      { term: 'tool_use_id', meaning: 'The correlation ID that ties one tool call to its result, essential once calls run in parallel.' },
      { term: 'Argument coercion', meaning: 'Repairing unambiguous type mismatches such as a numeric string, and rejecting anything ambiguous.' },
      { term: 'Hallucination detection', meaning: 'The evaluation category for correctly refusing to call a tool when none fits.' },
    ],
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
    readTime: '~8 min read',
    diagram: '/lessons/p14-11.svg',
    diagramCaption:
      'HTN decomposition: a compound task expands through methods into primitive operators, each gated by preconditions, with an LLM fallback proposing candidates the schema must accept.',
    whyItMatters:
      'This lesson gives you the vocabulary for the strongest guarantee an agent product can offer: the plan is sound by construction because a symbolic layer, not the model, validated every step. That is a badge with actual meaning, and it changes what the approval UI shows. Preconditions encode policy, so a blocked step can name the unmet fact instead of returning a vague refusal, which turns a dead end into a fixable one. When an LLM fallback proposes a decomposition, mark those nodes: a user reviewing a plan should see which steps came from the method library and which came from a suggestion the validator merely accepted.',
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
    ],
    takeaways: [
      'Sound by construction is a claim you can only make when a symbolic layer validates every step. It survives an audit; a fluent plan does not.',
      'Preconditions are policy as facts, so a blocked step names the missing condition instead of refusing vaguely.',
      'Mark model-proposed decompositions in the plan view. Library-derived and validator-accepted are different provenance, and reviewers need to see which.',
      'Evolutionary search needs a deterministic machine-checkable evaluator. Without one there is no fitness, only drift.',
    ],
    terms: [
      { term: 'HTN', meaning: 'Hierarchical task network: planning by decomposing compound tasks into primitive operators.' },
      { term: 'Method', meaning: 'A rule for decomposing one compound task into subtasks, guarded by preconditions.' },
      { term: 'Operator', meaning: 'A primitive executable action with explicit preconditions and effects on state.' },
      { term: 'ChatHTN', meaning: 'A hybrid planner where the symbolic layer asks a model for a decomposition only when no method applies.' },
      { term: 'AlphaEvolve', meaning: 'Evolutionary code search where a model ensemble mutates programs and a deterministic evaluator selects.' },
      { term: 'Fitness function', meaning: 'A deterministic machine-checkable score over candidate outputs, the thing evolution optimizes.' },
    ],
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
