import type { Lesson } from '@/lib/lessons';

// Phase 14 · Part 6 · The agent workbench (lessons 14.31-14.40, hand-authored)
export const phase14Part6: Lesson[] = [
  {
    id: 'p14-31-why-models-fail',
    phase: 'Phase 14 · Agent Engineering',
    part: 'Part 6 · The agent workbench',
    index: '14.31',
    title: 'Why capable models still fail on real repos',
    oneLiner:
      'The model is rarely the bottleneck. Seven surfaces (instructions, state, scope, feedback, verification, review, handoff) decide whether a run ships, and each one is a file you write.',
    readTime: '~10 min read',
    whyItMatters:
      'This is the diagnostic layer for your own Claude Code or Cursor setup. When an agent edits a file you never mentioned, invents a passing test run, or opens a session with no memory of yesterday\'s decision, name which of the seven surfaces was missing instead of rewriting the prompt again. CLAUDE.md is instructions. A state file is session persistence. Allowed globs are an authorization policy. Same shape as any production backend: swap the model and the surfaces still hold, drop a surface and no model recovers it.',
    learningObjectives: [
      'Name which of the seven workbench surfaces, instructions, state, scope, feedback, verification, review, or handoff, is missing when an agent run fails.',
      'Map each surface to the distributed-systems primitive underneath it: function, worker, trigger, queue, session persistence, authorization policy.',
      'Cite the measured harness-over-model evidence (Terminal Bench 2.0, Vercel, Harvey) when arguing for workbench investment over a model upgrade.',
      'Apply the survive-the-transcript test to decide whether a piece of context belongs in a durable file or stays as a chat message.',
      'Translate a vendor\'s harness vocabulary (guardrails, hooks, sandboxes, skills) back into the eight primitives before adopting a new pattern.',
    ],
    sections: [
      {
        heading: 'The problem: the model was not wrong about Python',
        body: 'Give a frontier model a real repo and ask it to add input validation. It opens four files, writes plausible code, declares success, stops. Two tests fail. A third file got touched that had nothing to do with validation. There is no record of what it assumed, what it tried first, or what is left.\n\nIt was not wrong about the language. It was wrong about the work: what counted as done, where it was allowed to write, which tests were authoritative, how the next session picks up. A 2025 benchmark across three popular open-source agent frameworks logged roughly 50 percent task completion, and long-context runs collapsed from 40-50 percent to under 10 percent, mostly infinite loops and goal loss. None of that is a language problem. That is a workbench bug.',
      },
      {
        heading: 'The seven surfaces',
        body: 'A workbench is the operating environment wrapped around the model during a task. Instructions carry startup rules, forbidden actions, and the definition of done. State carries the active task, touched files, blockers, and the next action. Scope carries allowed and forbidden globs plus acceptance. Feedback carries real captured command output. Verification carries tests, lint, and the scope check. Review is a second pass with a different role. Handoff carries what changed, why, and what is left.\n\nEach one produces a signature symptom when it is missing. No scope means edits leak into files nobody scoped. No feedback means the agent declares success on a stack trace it never read. No handoff means the next session re-discovers everything the last one already knew.',
      },
      {
        heading: 'Underneath the labels: eight ordinary primitives',
        body: 'Strip the agent word off and a run is computation crossing time, processes, and machines. The seven surfaces are a UX layer over primitives every backend already has: function, worker, trigger, runtime, RPC, queue, session persistence, authorization policy.\n\nInstructions are policy plus function metadata. State is session persistence, the same job Redis or a checkpoint store does for a web app. Scope is an access-control list per task. Feedback is an invocation log written into a queue. Verification is a deterministic function that fails closed. Review is a separate worker with read-only access to the builder\'s artifacts. Handoff is a durable record emitted by a session-end trigger. The vendor vocabulary changes every quarter; a queue is still a queue.',
      },
      {
        heading: 'Patterns in circulation, translated to primitives',
        body: 'Every popular harness pattern reduces to those eight primitives once you strip the branding. The Ralph Loop (Claude Code, Codex) re-injects the original task into a fresh context window when an agent tries to stop early: that is a trigger that re-enqueues work, with session persistence carrying the goal forward. Plan-Execute-Verify is three workers passing state through a queue. Open Agent Passport, announced March 2026, signs and audits every tool call against a declarative policy before execution: that is authorization policy plus a signed audit queue.\n\nAnthropic and OpenAI\'s April 2026 harness-compute separation announcements restate control-plane and data-plane, a split that predates the agent label by decades. Useful labels for a blog post; not new engineering.',
      },
      {
        heading: 'The receipts',
        body: 'The harness-over-model claim has numbers now. On Terminal Bench 2.0 the same model moved from outside the top 30 to rank five with only a harness change. Vercel deleted 80 percent of its agent tools and success went from 80 to 100 percent. Harvey more than doubled legal-agent accuracy through harness work alone, no model swap.\n\nAgainst that, 88 percent of enterprise agent projects never reach production, and a March 2026 preprints.org study found the failures cluster in runtime, not reasoning. The takeaway is not that harnesses win forever; models do absorb harness tricks over time. It is that today, the engineering that decides outcomes sits around the model, and the primitives carrying that work are ones every production system already needed.',
      },
      {
        heading: 'Where vendor writeups stop short',
        body: 'LangChain\'s Anatomy of an Agent Harness enumerates eleven components, prompts, tools, hooks, sandboxes, orchestration, memory, skills, subagents, a runtime loop, but never names queues, workers as a deployment unit, or authorization policy as its own concern. Addy Osmani\'s Agent = Model + Harness framing is a stance, not a spec. The agentic_harness book calls the harness the primary security boundary, which is just authorization policy restated.\n\nAn April 2026 Hacker News thread, The agent harness belongs outside the sandbox, argues the harness should sit like a hypervisor that authorizes access based on context. That is authorization policy as a separate plane, again. None of these pieces are wrong. They are UX descriptions of a system that already has a name in distributed systems.',
      },
      {
        heading: 'The loop closes on the repo, not on chat',
        body: 'Task feeds scope, scope feeds state, state feeds the agent loop, the loop emits feedback, feedback feeds verification, verification feeds review, review feeds handoff, and handoff writes back into state. The cycle closes on a file, because chat is volatile: sessions die, conversations get trimmed, context gets compacted.\n\nThat is the test for anything you add to your own setup. If losing the transcript loses the information, it was never a surface, it was a message. A CLAUDE.md line that only ever lived in a conversation you had with the model last Tuesday is already gone. The same line written into agent_state.json survives the next ten sessions.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p14-31-seven-surfaces-inline.svg',
        alt: 'The seven workbench surfaces mapped to their underlying primitive',
        caption: 'Each surface is a UX label over a primitive distributed systems already named: instructions is policy, state is persistence, review is a read-only worker.',
        diagramBrief:
          'Two-column table rendered as a diagram. Left column header "Surface" lists seven rows: Instructions, State, Scope, Feedback, Verification, Review, Handoff. Right column header "Primitive" lists the matching row: Policy + function metadata, Session persistence, Authorization policy, Invocation log in a queue, Deterministic function, Read-only worker, Durable record from a session-end trigger. Style: cream paper background, black ink, one accent color used only on the arrows connecting each row pair. Aspect ratio 4:3.',
      },
      {
        src: '/lessons/p14-31-loop-closes-on-repo-inline.svg',
        alt: 'The workbench loop closing on a file instead of on chat',
        caption: 'Task feeds scope, scope feeds state, the loop emits feedback, verification and review gate the handoff, and the handoff writes back into state. Chat never appears in the cycle.',
        diagramBrief:
          'Circular flow diagram, seven nodes arranged clockwise: Task, Scope, State, Agent Loop, Feedback, Verification, Review, Handoff, looping back to State. Draw the cycle as a closed ring with arrows. Cross out or grey a "Chat history" box floating outside the ring with a dashed line and an X, labeled "volatile, not part of the loop". Style: cream paper, black ink, one accent color for the ring itself.',
      },
    ],
    takeaways: [
      'Name the missing surface before touching the prompt. Instructions, state, scope, feedback, verification, review, handoff, in that order.',
      'The workbench is model-independent. You can swap the model and keep the surfaces; you cannot swap the surfaces and keep reliability.',
      'Every surface reduces to a primitive you already know: policy, persistence, queue, trigger, worker, function.',
      'If information dies with the transcript it was never a surface. Anything load-bearing lives in a file the next session reads.',
    ],
    terms: [
      { term: 'Workbench', gloss: '"the setup"', meaning: 'The engineered surfaces around a model that make its work reliable and resumable.' },
      { term: 'Surface', gloss: '"a doc" or "a script"', meaning: 'A named, machine-readable file the agent reads or writes every turn.' },
      { term: 'System of record', gloss: '"the notes"', meaning: 'The file the workbench treats as truth once chat history is gone.' },
      { term: 'Definition of done', gloss: '"acceptance"', meaning: 'An objective, file-backed checklist the agent cannot fake its way past.' },
      { term: 'Session persistence', gloss: '"memory"', meaning: 'State that survives crashes, restarts, and model swaps.' },
      { term: 'Authorization policy', gloss: '"permissions"', meaning: 'Who may call which function on which paths; scope is this per task.' },
      { term: 'Trigger', gloss: '"a hook"', meaning: 'An event source, a loop tick, a file change, a cron, that invokes a function.' },
      { term: 'Worker', gloss: '"an agent"', meaning: 'A long-lived process that owns one or more functions and a lifecycle: the builder, the reviewer, an MCP server.' },
      { term: 'Queue', gloss: '"a log"', meaning: 'A durable buffer between a trigger and a worker that gives back-pressure, retry, and idempotency.' },
      { term: 'Harness', gloss: '"the setup", again', meaning: 'The vendor-agnostic word for the same primitives; useful vocabulary, not a different system.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Score your own agent setup on the seven surfaces, 0 for missing, 1 for partial, 2 for healthy. Which one scores lowest?' },
      { level: 'medium', prompt: 'Pick three "harness" terms you have seen in a vendor blog post (guardrail, hook, sandbox, skill). Translate each into one of the eight primitives.' },
      { level: 'medium', prompt: 'A 2025 benchmark study logged agents collapsing from 40-50 percent completion to under 10 percent on long-context tasks. Which surface, if any, would you expect to catch that failure first?' },
      { level: 'hard', prompt: 'Design a failure-mode report generator that flags a run claiming "all tests pass" with no captured exit code. Which surface is missing, and what does the report say instead of "pass"?' },
      { level: 'design', prompt: 'Sketch a compact status strip for a coding-agent product that shows the state of all seven surfaces at a glance. What do you show by default, and what needs a click to expand?' },
    ],
    furtherReading: [
      { label: 'MongoDB, The Agent Harness: Why the LLM Is the Smallest Part of Your Agent System', url: 'https://www.mongodb.com/company/blog/technical/agent-harness-why-llm-is-smallest-part-of-your-agent-system', why: 'The clearest receipts: Vercel 80 to 100 percent, Harvey doubling accuracy, Terminal Bench top-30-to-top-5.' },
      { label: 'Martin Fowler / Birgitta Böckeler, Harness engineering for coding agent users', url: 'https://martinfowler.com/articles/harness-engineering.html', why: 'The cleanest control-theory framing: guides as feedforward, sensors as feedback.' },
      { label: 'LangChain, The Anatomy of an Agent Harness', url: 'https://blog.langchain.com/the-anatomy-of-an-agent-harness/', why: 'The eleven-component taxonomy this lesson argues is incomplete; read it to see the gap yourself.' },
      { label: 'Anthropic, Effective harnesses for long-running agents', url: 'https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents', why: 'The vendor writeup that goes deepest on surfaces, from inside one specific runtime.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Workbench surface audit',
      body: '- Instructions: does every rule name a check, or is it a wish?\n- State: does the next session read a file, or does it read your chat history?\n- Scope: is there a forbidden list, or only an allowed one?\n- Feedback: is there a captured exit code for the last command, or a sentence about one?\n- Verification: does a gate run automatically at task close, or does the agent self-report?\n- Review: does a second pass with different inputs exist, or does the builder mark its own homework?\n- Handoff: could a stranger start the next session from a file alone?',
    },
    demoCaption:
      'Toggle between a prompt-only run and a workbench run on the same task with the same model. Read what each surface is actually holding, and which symptom appears the moment one is missing.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Task: add input validation to the signup handler',
      badLabel: 'Prompt only',
      goodLabel: 'Workbench',
      badLines: [
        'Instruction: "add validation, be careful, test thoroughly"',
        'Files touched: 4, one unrelated to validation',
        'Tests: claimed pass, never captured an exit code',
        'State at session end: nothing written',
        'Result: 2 failing tests, no record of assumptions',
      ],
      goodLines: [
        'Instructions: startup rules plus definition of done',
        'Scope: allowed app/**, forbidden scripts/**',
        'Feedback: pytest exit 1 captured, agent reacted',
        'Verification: acceptance command ran and passed',
        'Handoff: changed files, failed attempts, next action',
      ],
      badCaption:
        'Four plausible file edits and a confident "done". The model knew Python fine. It had no definition of done, no write boundary, and no captured exit code, so nothing in the run could contradict its own narration.',
      goodCaption:
        'Same model, same task. The surfaces are files: rules, globs, a captured exit code, an acceptance command, a handoff packet. Each one converts an assumption the model was making silently into a value it reads off disk.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'your agent did not fail because the model is dumb.',
        body:
          'your agent did not fail because the model is dumb.\n\nit failed because seven surfaces were missing: instructions, state, scope, feedback, verification, review, handoff.\n\nsame model, harness change only: terminal bench 2.0, outside top 30 to rank 5. vercel deleted 80% of its tools, success went 80% to 100%.\n\nthe load is around the model, not inside it.',
      },
      {
        kind: 'X · design angle',
        hook: 'the test for anything in your CLAUDE.md: does it survive the transcript dying?',
        body:
          'the test for anything in your CLAUDE.md: does it survive the transcript dying?\n\nif the information lives only in chat, it is a message, not a surface. sessions get trimmed. context gets compacted. the repo does not.\n\nthe agent loop closes on a file. everything load-bearing has to be readable by a session that has never met you.',
      },
      {
        kind: 'X · one-liner',
        hook: '88% of enterprise agent projects never reach production. almost none of it is reasoning.',
        body:
          '88% of enterprise agent projects never reach production. almost none of it is reasoning.\n\nthe failures cluster in runtime: no scope, no captured output, no state, no handoff.\n\nyou can swap the model and keep the surfaces. you cannot swap the surfaces and keep reliability.',
      },
    ],
    source: {
      label: 'Full lesson: 31 agent-workbench-why-models-fail',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/14-agent-engineering/31-agent-workbench-why-models-fail',
    },
  },
  {
    id: 'p14-32-minimal-workbench',
    phase: 'Phase 14 · Agent Engineering',
    part: 'Part 6 · The agent workbench',
    index: '14.32',
    title: 'The minimal workbench is three files',
    oneLiner:
      'A router, a state file, and a task board. AGENTS.md points, agent_state.json remembers, task_board.json queues. Everything later in the track assumes these three exist.',
    readTime: '~10 min read',
    whyItMatters:
      'This is the direct verdict on your CLAUDE.md. A long instruction file is not coverage, it is an attention budget you already blew: the agent reads the first screen and acts on a fraction of the rest. Augment Code measured it both ways. A good router is worth roughly a model-tier upgrade; a bad one makes output worse than having no file at all. Treat the root file as navigation, under 50 lines of pointers, and push depth into topic docs loaded only when the task touches them. Progressive disclosure, applied to the agent instead of the user.',
    learningObjectives: [
      'Write the three files a workbench needs before anything else: a router, a state file, a task board.',
      'Explain why a short root router outperforms a long monolithic AGENTS.md, citing Augment Code\'s measured quality jump.',
      'Apply nearest-wins precedence to a monorepo with nested AGENTS.md files, the way Codex, Cursor, Claude Code, and Copilot already do.',
      'Diagnose why conflicting instructions cost more than missing ones, a 48.8 to 28 percent resolve-rate drop, and fix it by numbering priorities.',
      'Decide what belongs in the root router versus a topic doc, using the two-hop reachability test.',
    ],
    sections: [
      {
        heading: 'The problem: the 3000-line AGENTS.md',
        body: 'Most teams reach for a workbench by writing one enormous instructions file and calling it done. The model loads it, skims what it cannot summarize, and fails on exactly the surfaces it always failed on.\n\nThe file grows because every incident adds a rule and no incident removes one. A year in, it reads like an encyclopedia and the agent reads the index. Augment Code measured what that costs: a good AGENTS.md is worth roughly a model-tier upgrade, Haiku to Opus; a bad one makes output worse than having no file at all. You need the opposite shape: a tiny root file that routes into deeper files only when relevant, plus two machine-readable files that carry the things prose cannot carry.',
      },
      {
        heading: 'AGENTS.md is a router, not a manual',
        body: 'A good root file points at four things: the state file (where you are), the task board (what is left), the deeper rules under docs/agent-rules.md, and the verification command (how to know it worked). Anything longer goes into topic docs, loaded only when the task touches them.\n\nTwo tests keep the layering honest. Reachability: the agent should reach any rule in at most two hops, so the router links topic docs by path rather than describing them in prose. Freshness: the router stays short enough that a reviewer rereads it on every pull request, which is the only thing that stops it growing back into the encyclopedia it replaced. A pointer that no longer resolves is worse than a missing rule.',
      },
      {
        heading: 'agent_state.json is the system of record',
        body: 'State carries the active task id, touched files, assumptions made, blockers, and the next action. The agent reads it at every turn and writes it at the end. The next session reads the file instead of replaying chat.\n\nIt lives in a file because chat history is unreliable infrastructure. Sessions die. Conversations get trimmed. Compaction rewrites what you thought you said. LangGraph calls the same idea a checkpoint; a custom Python agent calls it agent_state.json. The storage backend does not matter, file, key-value store, database, the persistence semantics do: if a piece of context matters tomorrow, it belongs here, not in a message you will scroll past.',
      },
      {
        heading: 'task_board.json is the queue',
        body: 'The board carries every task with status todo, in_progress, done, or blocked. It is the queue the agent pulls from when state is empty, and the thing you read when you want to know whether the run is on track. A task has an id, a goal, an owner (builder, reviewer, or human), and acceptance criteria.\n\nThe board is small on purpose. Once it grows past a screen you have a planning problem, not a board problem, and adding fields will not fix it. Codex and Cursor keep the same shape as queued tasks in a chat sidebar; the name changes, the shape does not.',
      },
      {
        heading: 'Nested routers, nearest-wins precedence',
        body: 'Three patterns survive contact with a large repo. OpenAI ships 88 AGENTS.md files across its main repo, one per subcomponent, and Codex, Cursor, Claude Code, and Copilot all walk from the working file toward the root and concatenate every file they find along the way. A sub-directory file extends the root file rather than replacing it.\n\nCodex alone supports AGENTS.override.md to replace rather than extend; avoid it for anything meant to work across tools. Cross-tool symlinks keep one source of truth: link AGENTS.md to CLAUDE.md, link it again to .cursorrules. Nx\'s nx ai-setup automates this across Claude Code, Cursor, Copilot, Gemini, Codex, and OpenCode from a single config, which is the only sane way to maintain six files that are supposed to say the same thing.',
      },
      {
        heading: 'The anti-patterns to refuse',
        body: 'Conflicting instructions are worse than missing ones. The ICLR 2026 AMBIG-SWE study measured a resolve-rate drop from 48.8 to 28 percent when two rules in the same file quietly disagreed, because the agent silently switches from interactive to greedy mode rather than asking. Number your priorities instead of stacking them flat.\n\nA style rule with no enforcement command is an invitation to invent compliance: "follow the Google Python Style Guide" means nothing without the lint command that checks it. And lead with commands, not style; burying the verification path at line 1800 while style guidance sits at the top is how a router turns into exactly the manual it was supposed to replace.',
      },
      {
        heading: 'Three files is the floor, not the ceiling',
        body: 'Later lessons in this track add scope contracts, feedback runners, verification gates, reviewer checklists, and handoff packets. Every one of them assumes these three files already exist and already work: a router the agent actually reads, a state file the agent actually writes, a board the agent actually pulls from.\n\nIf a repo cannot carry those three, no amount of prompt engineering downstream fixes it. Build the floor first. Everything after this lesson is furniture on top of it.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p14-32-three-files-inline.svg',
        alt: 'The three files of a minimal workbench',
        caption: 'AGENTS.md points, agent_state.json remembers, task_board.json queues. The agent loop reads all three and writes back to two.',
        diagramBrief:
          'Three labeled boxes in a row: AGENTS.md, agent_state.json, task_board.json. Below them, a box labeled "Agent Loop" with arrows up from AGENTS.md (read only, one-way arrow) and bidirectional arrows to agent_state.json and task_board.json (read and write). Style: cream paper, black ink, one accent color on the bidirectional arrows to distinguish them from the one-way arrow.',
      },
      {
        src: '/lessons/p14-32-nested-agents-inline.svg',
        alt: 'Nested AGENTS.md files concatenating toward the repo root',
        caption: 'OpenAI ships 88 AGENTS.md files across its main repo. Every major coding agent walks from the working file to the root and concatenates what it finds.',
        diagramBrief:
          'A simple folder tree, three levels deep: repo root at top with AGENTS.md, a middle folder "packages/api" with its own AGENTS.md, a leaf folder "packages/api/handlers" with its own AGENTS.md. Draw an upward arrow chain from the leaf file through the middle file to the root file, labeled "concatenated, nearest first". Style: cream paper, black ink, one accent color on the arrow chain.',
      },
    ],
    takeaways: [
      'Router, state, board. If a repo cannot carry those three files, no model upgrade will save the runs on it.',
      'Keep the root file under 50 lines of pointers. Depth belongs in topic docs the agent loads only when the task touches them.',
      'Conflicting instructions are worse than missing ones: 48.8 to 28 percent resolve rate. Number priorities, do not stack them flat.',
      'Every style rule ships with its enforcement command, or the agent will invent its own compliance.',
    ],
    terms: [
      { term: 'Router', gloss: '"the instructions file"', meaning: 'The short root file whose whole job is pointing at deeper files by path, not explaining them.' },
      { term: 'State file', gloss: '"memory"', meaning: 'Machine-readable record of active task, touched files, assumptions, and next action.' },
      { term: 'Task board', gloss: '"the backlog"', meaning: 'A small JSON queue of work with status, owner, and acceptance per task.' },
      { term: 'Nearest-wins precedence', gloss: '"inheritance"', meaning: 'Nested instruction files concatenate from the working file up to the repo root, each extending rather than replacing the last.' },
      { term: 'Progressive disclosure', gloss: '"keeping it simple"', meaning: 'Load only the depth the current task needs; the router is the map, not the encyclopedia.' },
      { term: 'Reachability test', gloss: '"is it documented"', meaning: 'Any rule must sit at most two hops from the router, reached by path, not by description.' },
      { term: 'Freshness test', gloss: '"keeping docs updated"', meaning: 'The router stays short enough that a reviewer actually rereads it on every pull request.' },
      { term: 'AGENTS.override.md', gloss: '"an exception file"', meaning: 'A Codex-specific mechanism that replaces rather than extends a parent router; avoid it for cross-tool setups.' },
      { term: 'Cross-tool symlink', gloss: '"keeping tools in sync"', meaning: 'One authored file, linked under every tool-specific filename, so there is exactly one source of truth to edit.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Count the lines in your current AGENTS.md or CLAUDE.md. If it is over 100 lines, list which parts are pointers and which are prose that could move to a topic doc.' },
      { level: 'medium', prompt: 'Write agent_state.json for a task you are mid-way through right now. What five fields does it need that your last chat session already forgot?' },
      { level: 'medium', prompt: 'Two rules in your rules file quietly disagree. Reproduce the AMBIG-SWE finding: predict which one the agent would silently follow, then check.' },
      { level: 'hard', prompt: 'Set up cross-tool symlinks (AGENTS.md to CLAUDE.md, .cursorrules) for a repo you use with more than one coding agent. What breaks first?' },
      { level: 'design', prompt: 'Design the empty state for a task board UI shown to a non-technical stakeholder. What do you show when task_board.json has zero tasks, one blocked task, and twelve done tasks?' },
    ],
    furtherReading: [
      { label: 'agents.md, the open spec', url: 'https://agents.md/', why: 'The open specification Cursor, Codex, Claude Code, Copilot, Gemini, and OpenCode all adopted independently.' },
      { label: 'Augment Code, A good AGENTS.md is a model upgrade. A bad one is worse than no docs at all', url: 'https://www.augmentcode.com/blog/how-to-write-good-agents-dot-md-files', why: 'The measured quality jump behind this lesson\'s central claim, and the failure mode of a bad router.' },
      { label: 'Datadog Frontend, Steering AI Agents in Monorepos with AGENTS.md', url: 'https://dev.to/datadog-frontend-dev/steering-ai-agents-in-monorepos-with-agentsmd-13g0', why: 'Nested precedence in a real monorepo, not a toy example.' },
      { label: 'Nx Blog, Teach Your AI Agent How to Work in a Monorepo', url: 'https://nx.dev/blog/nx-ai-agent-skills', why: 'Single-source generation across six different coding agents from one config.' },
    ],
    shipIt: {
      kind: 'snippet',
      name: 'Minimal workbench starter (3 files)',
      body: 'AGENTS.md (router, under 50 lines):\n- What this repo is, one paragraph.\n- Read agent_state.json before acting.\n- Read task_board.json for the next task.\n- Deeper rules: docs/agent-rules.md.\n- Verify with: <your test command>.\n\nagent_state.json:\n{ "active_task": null, "touched_files": [], "assumptions": [], "blockers": [], "next_action": null }\n\ntask_board.json:\n{ "tasks": [ { "id": "", "goal": "", "status": "todo", "owner": "builder", "acceptance": "" } ] }',
    },
    demoCaption:
      'Two shapes of the same instruction set: one monolith, one router plus files. Watch which parts the agent actually reaches, and where the depth goes when it leaves the root file.',
    demo: {
      archetype: 'before-after',
      subject: 'Repo instructions',
      badLabel: 'Monolith',
      goodLabel: 'Router plus files',
      badLines: [
        'AGENTS.md, 3000 lines, every rule ever added',
        'Style guidance first, commands buried at line 1800',
        'Two rules about tests that quietly contradict',
        'No pointer to state; the board lives in chat',
        'Agent reads the first screen and guesses the rest',
      ],
      goodLines: [
        'AGENTS.md, under 50 lines, pointers only',
        'docs/agent-rules.md, one screen per category',
        'docs/testing.md, loaded only for test work',
        'agent_state.json, read every turn, written at end',
        'task_board.json, status, owner, acceptance',
      ],
      badCaption:
        'Everything is technically documented, which is why none of it is reliably read. Attention is the budget, and 3000 lines spend it on prose the agent skims. Conflicting rules cost more than missing ones: resolve rate fell from 48.8 to 28 percent.',
      goodCaption:
        'The root file is navigation, and depth is loaded on demand. Any rule sits at most two hops away, by path. State and the board hold what prose cannot: where the work is and what is next.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'the minimum viable agent setup is three files, not a 3000-line rules doc.',
        body:
          'the minimum viable agent setup is three files, not a 3000-line rules doc.\n\nAGENTS.md: a router, under 50 lines, pointers only.\nagent_state.json: where the work is, read every turn.\ntask_board.json: what is left, with acceptance.\n\nlong manuals get skimmed. short routers get followed.',
      },
      {
        kind: 'X · design angle',
        hook: 'progressive disclosure is not just a UI pattern. your agent needs it too.',
        body:
          'progressive disclosure is not just a UI pattern. your agent needs it too.\n\nroot file = the map. topic docs = the pages. the agent walks to the page the task touches and ignores the rest.\n\nreachability test: any rule at most 2 hops from the router, linked by path. if you are describing a doc in prose instead of linking it, you built an encyclopedia.',
      },
      {
        kind: 'X · one-liner',
        hook: 'a good AGENTS.md is worth a model upgrade. a bad one is worse than no file at all.',
        body:
          'a good AGENTS.md is worth a model upgrade. a bad one is worse than no file at all.\n\nthat is measured, not vibes. and the fastest way to write a bad one is two rules that quietly disagree: 48.8% to 28% resolve rate in AMBIG-SWE.\n\nnumber your priorities. do not stack them flat.',
      },
    ],
    source: {
      label: 'Full lesson: 32 minimal-agent-workbench',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/14-agent-engineering/32-minimal-agent-workbench',
    },
  },
  {
    id: 'p14-33-executable-constraints',
    phase: 'Phase 14 · Agent Engineering',
    part: 'Part 6 · The agent workbench',
    index: '14.33',
    title: 'Instructions as executable constraints',
    oneLiner:
      'A rule with no check is a wish. Give every rule a category, a severity, and a named check function, and the instructions file becomes a test suite instead of documentation.',
    readTime: '~10 min read',
    whyItMatters:
      'Go read your own rules file and mark each line operational or aspirational. "Be careful", "test thoroughly", "ask if unsure" score zero: nothing in the run can fail because of them. The upgrade is mechanical. Give each rule one of five categories (startup, forbidden, definition of done, uncertainty, approval), a severity of block, warn, or info, and a named check function. Now a run produces a rule report, the gate refuses only on block, and every override lands in an audit log. Same discipline as typed props over comments: the constraint is enforced, not requested.',
    learningObjectives: [
      'Separate operational rules (checkable at runtime) from aspirational ones ("be careful") in an existing instructions file.',
      'Classify any rule into one of five categories: startup, forbidden, definition of done, uncertainty, approval.',
      'Attach a severity, block, warn, or info, to a rule at write time rather than under deadline pressure.',
      'Explain why rule expiry (default 90 days) keeps a rule set under 30 rules instead of the 80-plus Cloudflare measured without it.',
      'Apply the markdown-as-source, JSON-as-cache split so the rule set stays reviewable and the checker stays fast.',
    ],
    sections: [
      {
        heading: 'The problem: aspirational instructions',
        body: 'A typical instructions file reads like onboarding. Be careful. Test thoroughly. Ask if unsure. Three days later the agent ships a change with no tests, writes to a forbidden directory, and never asks, because it never knew where the line was.\n\nNothing in that file is wrong. It is just unenforceable. Instructions are powerful when operational and weak when aspirational, and the difference is whether a run can fail because of them. If no execution path can turn a rule into a failure, the rule is decoration, the same way a code comment reading "validate this" is decoration next to a type that actually enforces it.',
      },
      {
        heading: 'Five categories that cover almost everything',
        body: 'Startup answers what must be true before work begins ("state file exists and is fresh"). Forbidden answers what must never happen ("do not edit scripts/release.sh"). Definition of done answers what proves completion ("pytest exits 0 and the acceptance line passes"). Uncertainty answers what to do when unsure ("open a question note instead of guessing"). Approval answers what needs a human ("any new dependency, any prod write").\n\nA rule that does not fit one of the five usually wants to be two rules. Force the split. Five is not a magic number, it is the number that stopped a real rules file from growing a category for every new incident.',
      },
      {
        heading: 'Progressive disclosure: a map, not an encyclopedia',
        body: 'The reason a rules file keeps growing is that every incident adds a rule and no incident removes one. A year in, the file is two thousand lines, and the agent reads the first screen, runs out of attention budget, and acts on a fraction of what it was told.\n\nThe fix is a layered file, not a shorter one. The root router stays small enough to read every session and holds nothing but pointers. Depth lives in topic files, docs/agent-rules.md, docs/testing.md, docs/deploy.md, loaded only when the task touches them. Two tests keep this honest: reachability, any rule reachable in at most two hops by path, and freshness, the router short enough that a reviewer actually rereads it on every pull request.',
      },
      {
        heading: 'Each rule names its own check',
        body: 'A rule carries a slug, a category, a one-line description, and a check field naming a function in rule_checker.py. Adding a rule means adding a check, so the checker grows with the workbench instead of drifting behind it.\n\nRules live one per heading in a single markdown file. Renames are visible in diffs. New rules sit at the top of their category. Stale rules get deleted, not commented out, because the workbench is the source of truth, not a log of how the team felt last quarter.',
      },
      {
        heading: 'Severity tagging happens at write time',
        body: 'Severity is tagged at write time, not under deadline pressure: block halts the run, warn reports, info records. Teams overstate severity early and then quietly weaken it later under a deadline, so forcing the calibration into the authoring moment is the point.\n\nAny override of a block rule gets signed into an overrides log rather than silently bypassed. Rick Hightower\'s Agent RuleZ implementation ships exactly this three-tier severity in production, and the audit log turns "we decided to skip that check" from a Slack message into a record a reviewer can actually find six months later.',
      },
      {
        heading: 'Expiry keeps the set from calcifying',
        body: 'Every rule carries an expires_at, default 90 days. The checker warns when a rule has had zero violations for 60 consecutive days, and the next review either justifies it, weakens it to info, or deletes it. Stale rules get removed, not commented out; the workbench is the source of truth, not a log of how the team felt last quarter.\n\nCloudflare\'s production data (131,246 review runs across 5,169 repos in 30 days) showed rule sets with explicit expiry staying under 30 rules per repo, while sets without it grew past 80, most of which never fired.',
      },
      {
        heading: 'Markdown as source, JSON as cache',
        body: 'agent-rules.md is the authored file and agent-rules.lock.json is the cache the checker reads in the hot path, regenerated by a pre-commit hook. Markdown diffs stay reviewable; JSON parsing stays out of every turn. It is the same split as package.json and package-lock.json.\n\nThe rule set is also the human-readable contract that runtime guardrails implement. SDK guardrails and graph interrupts catch violations during a turn; the rule set is how you prove the runtime is enforcing the thing you actually agreed to.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p14-33-rule-anatomy-inline.svg',
        alt: 'The four parts of an operational rule',
        caption: 'A slug, a category, a severity, and a named check turn a wish into something a gate can refuse.',
        diagramBrief:
          'A single rule card diagram: one rectangle divided into four stacked labeled fields, "slug: acceptance-command-ran", "category: definition_of_done", "severity: block", "check: pytest exits 0 and acceptance line passes". An arrow from the card points right to a small gear icon labeled "rule_checker.py", then another arrow to a document icon labeled "rule_report.json". Style: cream paper, black ink, one accent color on the arrows.',
      },
      {
        src: '/lessons/p14-33-expiry-calcify-inline.svg',
        alt: 'Rule sets with and without expiry, Cloudflare production data',
        caption: 'Rule sets with explicit expiry stayed under 30 rules per repo across 131,246 review runs. Sets without it grew past 80, most of which never fired.',
        diagramBrief:
          'Two simple bar charts side by side, cream paper background. Left bar, short, labeled "with expiry: under 30 rules per repo". Right bar, tall, labeled "without expiry: 80+ rules per repo, most never firing". Style: black ink bars, one accent color fill on the left (healthy) bar only.',
      },
    ],
    takeaways: [
      'Audit your rules file by asking one question per line: can a run fail because of this? If not, delete it or give it a check.',
      'Five categories, no more: startup, forbidden, definition of done, uncertainty, approval. A rule that spans two is two rules.',
      'Tag severity at write time. Block halts, warn reports, info records, and every block override is signed into an audit log.',
      'Rules expire. Sets with expiry stayed under 30 rules per repo; sets without grew past 80, most never firing.',
    ],
    terms: [
      { term: 'Operational rule', gloss: '"a real instruction"', meaning: 'A rule the workbench can check at runtime, because it names a function.' },
      { term: 'Aspirational rule', gloss: '"be careful"', meaning: 'A rule with no check attached; either upgrade it or delete it.' },
      { term: 'Block severity', gloss: '"a hard rule"', meaning: 'Violation halts the run and cannot be silenced without a signed operator override.' },
      { term: 'Warn severity', gloss: '"a soft rule"', meaning: 'Violation is reported in the rule report but does not halt the run.' },
      { term: 'Rule expiry', gloss: '"a stale-rule sweep"', meaning: 'An authored expiry date, default 90 days, that forces a rule to be re-justified or retired.' },
      { term: 'Rule report', gloss: '"the checklist result"', meaning: 'The per-run pass/fail record the verification gate and reviewer both consume.' },
      { term: 'Lock file', gloss: '"the cache"', meaning: 'The generated JSON cache of the authored markdown rules, read on the hot path.' },
      { term: 'Reachability test', gloss: '"is it documented"', meaning: 'Any rule must be reachable in at most two hops from the router, by path.' },
      { term: 'Framework guardrail', gloss: '"a safety feature"', meaning: 'The runtime-level enforcement (OpenAI Agents SDK guardrails, LangGraph interrupts) that the rule set is the human-readable contract for.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Pull up your own rules file and mark each line operational or aspirational. What fraction has no check?' },
      { level: 'medium', prompt: 'Classify ten real rules from a public AGENTS.md into the five categories. Which ones needed splitting into two?' },
      { level: 'medium', prompt: 'Add a severity field (block, warn, info) to three existing rules. Which one did you have to downgrade once you were honest about it?' },
      { level: 'hard', prompt: 'Write the rule_checker.py function signature for a definition-of-done rule that checks "pytest exits 0 and the acceptance line passes." What does it need as input?' },
      { level: 'design', prompt: 'Design a small UI badge that shows a rule\'s severity and days until expiry in a settings panel. What color and icon logic tells a non-technical reviewer this rule is about to lapse?' },
    ],
    furtherReading: [
      { label: 'OpenAI Agents SDK guardrails', url: 'https://openai.github.io/openai-agents-python/guardrails/', why: 'The runtime-level enforcement this lesson\'s rule set is the reviewable contract for.' },
      { label: 'LangGraph interrupts', url: 'https://langchain-ai.github.io/langgraph/how-tos/human_in_the_loop/breakpoints/', why: 'How a rule violation becomes a human-in-the-loop pause instead of a silent failure.' },
      { label: 'Rick Hightower, Agent RuleZ: A Deterministic Policy Engine', url: 'https://medium.com/@richardhightower/agent-rulez-a-deterministic-policy-engine-for-ai-coding-agents-9489e0561edf', why: 'Block, warn, info severity running in a real production policy engine.' },
      { label: 'Cloudflare, Orchestrating AI Code Review at Scale', url: 'https://blog.cloudflare.com/ai-code-review/', why: 'The 131,246-run dataset behind the rule-expiry numbers in this lesson.' },
    ],
    shipIt: {
      kind: 'rubric',
      name: 'Rule audit rubric',
      body: 'For every line in your instructions file, answer:\n1. Category: startup, forbidden, definition of done, uncertainty, or approval? If none fit cleanly, split it into two rules.\n2. Check: name the function or command that verifies this rule. No name, no rule, delete or upgrade it.\n3. Severity: block, warn, or info, decided now, not under deadline pressure.\n4. Expiry: a date, default 90 days out.\n5. Override path: if severity is block, where does an override get signed?\nA rule that fails question 2 is decoration. Delete it or give it a check today.',
    },
    demoCaption:
      'Flip one instruction between its prose form and its constraint form. The words barely change; what changes is whether any part of the run can fail because of it.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'One line from agent-rules.md',
      badLabel: 'Prose',
      goodLabel: 'Constraint',
      badLines: [
        '"Please test thoroughly before saying done."',
        'Category: none',
        'Severity: none',
        'Check: none',
        'Run outcome: cannot fail on this line',
      ],
      goodLines: [
        'slug: acceptance-command-ran',
        'category: definition_of_done',
        'severity: block',
        'check: pytest exits 0 and acceptance line passes',
        'expires_at: 90 days, override signed to audit log',
      ],
      badCaption:
        'Nothing in the run can contradict this, so the agent grades itself and passes. Aspirational rules are not weak instructions, they are absent ones wearing instruction clothes.',
      goodCaption:
        'A slug, a category, a severity, and a named check turn the same intent into something the gate can refuse and the reviewer can score. Expiry keeps the set from growing past 80 rules that never fire.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: '"test thoroughly" is not an instruction. nothing in the run can fail because of it.',
        body:
          '"test thoroughly" is not an instruction. nothing in the run can fail because of it.\n\nan actual rule has 4 parts: a slug, a category, a severity, and the name of a function that checks it.\n\ncategories: startup, forbidden, definition of done, uncertainty, approval. anything that spans two is two rules.',
      },
      {
        kind: 'X · design angle',
        hook: 'rules need expiry dates for the same reason feature flags do.',
        body:
          'rules need expiry dates for the same reason feature flags do.\n\nevery incident adds a rule. no incident removes one. a year later the file is an encyclopedia the agent skims.\n\ncloudflare, 131k review runs: sets with expiry stayed under 30 rules per repo. sets without grew past 80, most never firing.\n\nzero violations in 60 days is a deletion candidate, not a win.',
      },
      {
        kind: 'X · one-liner',
        hook: 'audit your CLAUDE.md line by line: can a run fail because of this line?',
        body:
          'audit your CLAUDE.md line by line: can a run fail because of this line?\n\nif no, it is decoration. delete it or give it a check command.\n\nthe test is the same one you apply to a comment vs a type. one requests. the other is enforced.',
      },
    ],
    source: {
      label: 'Full lesson: 33 instructions-as-executable-constraints',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/14-agent-engineering/33-instructions-as-executable-constraints',
    },
  },
  {
    id: 'p14-36-scope-contracts',
    phase: 'Phase 14 · Agent Engineering',
    part: 'Part 6 · The agent workbench',
    index: '14.36',
    title: 'Scope contracts and the two altitudes of creep',
    oneLiner:
      'Allowed globs, forbidden globs, acceptance, rollback: one file per task, checked against the final diff. One practitioner cut rabbit-hole rate from 52 to 21 percent with the contract alone.',
    readTime: '~10 min read',
    whyItMatters:
      'Creep happens at two altitudes and you feel both. Task creep is the login fix that also touched the email helper, the DB driver, and the README, each edit plausible in the moment and collectively a different change than the one you reviewed. Project creep is the session that finishes the fix and then decides the app also needs a settings page and a dark mode toggle. The first is bounded by a scope contract with allowed and forbidden globs; the second by a feature_list.json with exactly one in_progress. Both are values read off disk, not sentences the agent can rationalize past.',
    learningObjectives: [
      'Write a scope contract with all seven fields: task_id, goal, allowed_files, forbidden_files, acceptance_criteria, rollback_plan, approvals_required.',
      'Distinguish task creep (files outside the contract) from project creep (a second feature started mid-session) and name the file that bounds each.',
      'Apply severity asymmetry, docs writes warn, migrations and prod config block, when deciding what a scope violation should do.',
      'Merge two scope contracts by least privilege: intersect allowed, union forbidden, minimum time budget, accumulated approvals.',
      'Explain why a violation budget keeps a scope gate enabled instead of getting switched off after the first blocked deadline.',
    ],
    sections: [
      {
        heading: 'The problem: every step had a reason',
        body: 'The task is "fix the login bug". The diff touches the login route, the email helper, the database driver, the README, and the release script. Every one of those touches had a plausible justification at the moment it happened. Together they are a different change than the one that was scoped.\n\nScope creep is the most under-monitored failure mode in agent work precisely because the agent narrates each step in good faith, the same as a well-meaning contractor who ends up rewiring the whole kitchen because "while I was in there". A stricter prompt does not fix it. A contract on disk, plus a check that compares the result against the promise, does.',
      },
      {
        heading: 'What the contract carries',
        body: 'Seven fields: task_id linking to the board, goal as one verifiable sentence, allowed_files as globs, forbidden_files as globs, acceptance_criteria as commands or assertion lines, a rollback_plan an operator could actually execute, and approvals_required for anything outside the boundary.\n\nA contract without forbidden_files is incomplete, the negative space is half the contract. Use globs (app/auth/**, tests/test_signup*.py), not raw paths, so a refactor between sessions does not silently invalidate the contract. And a rollback_plan is not paperwork: writing down how to undo a change forces the author to think about what could go wrong before approving it. A contract you cannot roll back from is a contract that should not have been approved in the first place.',
      },
      {
        heading: 'The second altitude: one feature at a time',
        body: 'A contract bounds one task. It never bounds the project. So the second primitive is feature_list.json: the backlog as an ordered machine-readable file with an active field, and per feature an id, a status, a goal, and a done_when line.\n\nThe agent picks exactly one todo feature, writes its id into the active contract, and is forbidden from starting a second in the same session. The invariant "at most one in_progress" becomes a startup check: if the list shows two, the session refuses to start until a human resolves it. "One thing at a time" stops being a request.',
      },
      {
        heading: 'Budgets instead of binary failure',
        body: 'A gate that refuses everything gets disabled by the team that hated it. The OSS merge gates ship a violationBudget per task: minor slips within budget surface as warnings, and only exceeding the budget refuses the merge. Pair with a violationSeverity of error or warning.\n\nagent-guardrails, the merge gate used via MCP by Claude Code, Cursor, Windsurf, and Codex, is where this pattern is actually running in production today. The budget is the difference between a gate that ships and a gate that gets switched off the first week it blocks someone\'s deadline.',
      },
      {
        heading: 'Severity asymmetry, time, and network',
        body: 'Severity is asymmetric by path family, and that asymmetry belongs in the contract because it is project-specific: off-scope writes to docs are usually warn, off-scope writes to scripts, migrations, or prod config are always block.\n\nFiles are a necessary scope dimension, not a sufficient one. Add a time_budget_minutes so the runtime refuses to continue past a wall-clock limit without re-approval, and a network_egress allowlist on hostnames so the agent cannot quietly call an external API that was never part of the task. A practitioner running scope contracts in YAML before invoking the agent, a practice called specsmaxxing, cut rabbit-hole rate from 52 to 21 percent in three weeks without touching the model.',
      },
      {
        heading: 'Merging two contracts by least privilege',
        body: 'When a project-wide contract and a task contract both apply, the merge is mechanical: intersect allowed_files (both must permit the path), union forbidden_files (either can prohibit), take the minimum time budget, and accumulate approvals_required. For network_egress, None defers to the other side, two lists intersect, and deny-all stays deny-all.\n\nWrite that into the schema so the merge is reviewable rather than argued. Least privilege is only a principle until it is an operator you can run on two files.',
      },
      {
        heading: 'Scope contracts specialize the rule set per task',
        body: 'The rule set from the executable-constraints lesson is project-wide: five categories, checked every session. The scope contract is task-specific: it says which globs this particular task may touch, not what the repo forbids forever.\n\nThe two compose rather than compete. A forbidden-files entry in a task contract can be stricter than the project rules but never looser; the merge in this lesson, intersect allowed, union forbidden, is exactly how that composition stays mechanical instead of argued about in a pull request comment. Treat the scope contract as the rule set\'s per-task instance, generated fresh for every task and archived once the task closes.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p14-36-two-altitudes-inline.svg',
        alt: 'Two altitudes of scope creep: task and project',
        caption: 'A scope contract bounds one task. A feature list with exactly one in_progress bounds the project. Both are files, not sentences.',
        diagramBrief:
          'Two stacked layers diagram. Bottom layer labeled "Task altitude: scope_contract.json" with a small box showing allowed_files and forbidden_files. Top layer labeled "Project altitude: feature_list.json" with three small task chips, one highlighted as "in_progress" and the other two greyed out as "todo". A vertical arrow connects the highlighted in_progress chip down to the task-altitude box, labeled "writes task_id into the active contract". Style: cream paper, black ink, one accent color on the in_progress chip.',
      },
      {
        src: '/lessons/p14-36-merge-least-privilege-inline.svg',
        alt: 'Merging two scope contracts by least privilege',
        caption: 'Allowed files intersect, forbidden files union, time budget takes the minimum, approvals accumulate. The merge is mechanical, not argued.',
        diagramBrief:
          'Two overlapping circles (Venn diagram), left labeled "Project contract", right labeled "Task contract". In the overlap region, write "allowed_files: intersect". Outside the overlap on both sides combined, draw a dashed outline labeled "forbidden_files: union (either can prohibit)". Below the Venn diagram, two small text lines: "time_budget: minimum of both" and "approvals_required: accumulate". Style: cream paper, black ink, one accent color on the overlap region only.',
      },
    ],
    takeaways: [
      'A contract without forbidden globs is half a contract. The negative space carries most of the protection.',
      'Two altitudes: the scope contract bounds the task, feature_list.json bounds the project at one in_progress.',
      'Ship violation budgets and per-path severity, or the gate gets switched off the first week it blocks a deadline.',
      'Contracts merge by least privilege: intersect allowed, union forbidden, minimum budget, accumulate approvals.',
    ],
    terms: [
      { term: 'Scope contract', gloss: '"the task brief"', meaning: 'Per-task file listing allowed and forbidden globs, acceptance, rollback, and approvals.' },
      { term: 'Scope creep', gloss: '"it also touched..."', meaning: 'Files changed in a task that the contract never permitted.' },
      { term: 'Feature list', gloss: '"the backlog"', meaning: 'The project backlog as an ordered file with exactly one feature in_progress.' },
      { term: 'Violation budget', gloss: '"a warning threshold"', meaning: 'An allowance of minor slips before the gate refuses, so the gate stays enabled.' },
      { term: 'Severity asymmetry', gloss: '"some rules matter more"', meaning: 'Off-scope writes to docs warn; off-scope writes to scripts or migrations block.' },
      { term: 'Least privilege merge', gloss: '"combining the rules"', meaning: 'Two contracts combine by intersecting permissions and unioning prohibitions.' },
      { term: 'Rollback plan', gloss: '"we can revert"', meaning: 'The one-paragraph operator runbook an approver checks before signing off on a contract.' },
      { term: 'Network egress allowlist', gloss: '"API access"', meaning: 'A list of hostnames a task is allowed to reach; empty means deny-all, absent means unenforced.' },
      { term: 'Specsmaxxing', gloss: '"writing a really detailed brief"', meaning: 'Writing a scope contract in YAML before invoking the agent; measured to cut rabbit-hole rate from 52 to 21 percent.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Write the seven fields of a scope contract for a task you are about to hand an agent. What goes in forbidden_files that you would not have thought to write down otherwise?' },
      { level: 'medium', prompt: 'Your contract allows app/auth/** and forbids scripts/**. The agent writes a migration file at db/migrations/0042.sql. In scope, out of scope, or does the contract not say?' },
      { level: 'medium', prompt: 'Merge a project-wide contract (forbidden: prod/**) with a task contract (allowed: app/**, prod/config.yaml) using intersect-allowed, union-forbidden. What is the result?' },
      { level: 'hard', prompt: 'Design a violationBudget for a repo where docs edits are common and harmless but config edits are rare and dangerous. What numbers do you pick and why?' },
      { level: 'design', prompt: 'Sketch the review UI a human sees when a scope checker flags one warn-level violation and zero block-level ones. Does the merge button stay enabled? What copy explains the warning?' },
    ],
    furtherReading: [
      { label: 'LangGraph human-in-the-loop interrupts', url: 'https://langchain-ai.github.io/langgraph/concepts/human_in_the_loop/', why: 'How a scope violation becomes a pause a human resolves instead of a silent merge.' },
      { label: 'logi-cmd/agent-guardrails', url: 'https://github.com/logi-cmd/agent-guardrails', why: 'The merge gate implementation behind the violationBudget and severity-tier numbers in this lesson.' },
      { label: 'Agentic Coding Is Not a Trap (production logs)', url: 'https://dev.to/jtorchia/agentic-coding-is-not-a-trap-i-answered-the-viral-hn-post-with-my-own-production-logs-33d9', why: 'The specsmaxxing receipts, 52 to 21 percent rabbit-hole rate, from a real production log.' },
      { label: 'Augment Code, AI Spec Template', url: 'https://www.augmentcode.com/guides/ai-spec-template', why: 'A three-tier must/ask/never boundary system you can adapt into allowed_files and forbidden_files.' },
    ],
    shipIt: {
      kind: 'snippet',
      name: 'Scope contract template',
      body: '{\n  "task_id": "",\n  "goal": "one verifiable sentence",\n  "allowed_files": ["app/auth/**"],\n  "forbidden_files": ["scripts/**", "migrations/**", "config/prod/**"],\n  "acceptance_criteria": ["pytest tests/test_login.py exits 0"],\n  "rollback_plan": "git revert <commit>, redeploy previous tag",\n  "approvals_required": ["any new dependency"],\n  "time_budget_minutes": 45,\n  "network_egress": []\n}',
    },
    demoCaption:
      'Same task, same model, one diff run against the contract. Step through the file writes and watch where the boundary actually catches, and which paths only warn.',
    demo: {
      archetype: 'sequence',
      subject: 'Task: fix the login bug',
      badLabel: 'No contract',
      goodLabel: 'Contract plus checker',
      badSequence: [
        'Edit app/auth/login.py, the actual fix',
        'Edit app/mail/helper.py, "related"',
        'Edit db/driver.py, "while I am here"',
        'Edit README.md, "documenting it"',
        'Edit scripts/release.sh, silently',
        'Report done, diff reviewed as a login fix',
      ],
      goodSequence: [
        'Read scope_contract.json, allowed app/auth/**',
        'Edit app/auth/login.py, in scope',
        'Attempt app/mail/helper.py, off scope, warn',
        'Attempt scripts/release.sh, forbidden, block',
        'Open a question note instead of guessing',
        'Checker emits scope_report.json, gate reads it',
      ],
      badCaption:
        'Every edit had a reason at the moment it happened, which is exactly why nothing stopped it. The review then sees a login fix and a release-script change bundled as one change.',
      goodCaption:
        'The contract is read at task start and the diff is checked at task end, so the boundary is a value on disk rather than a sentence in a prompt. Specsmaxxing receipts: rabbit-hole rate 52 percent to 21 percent, same agent.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'agents creep because every single step had a plausible reason.',
        body:
          'agents creep because every single step had a plausible reason.\n\n"fix the login bug" touches the login route, the email helper, the db driver, the readme, the release script. each one narrated in good faith.\n\nthe fix is not a stricter prompt. it is a contract on disk: allowed globs, forbidden globs, acceptance, rollback. then diff the result against the promise.',
      },
      {
        kind: 'X · design angle',
        hook: 'there are two altitudes of scope creep and you only bounded one.',
        body:
          'there are two altitudes of scope creep and you only bounded one.\n\ntask creep: the diff touched files outside the task. bounded by a scope contract.\n\nproject creep: the agent finished the task and decided the app also needs a settings page. bounded by feature_list.json with exactly one in_progress, enforced as a startup check.\n\n"one thing at a time" only works when it is a file.',
      },
      {
        kind: 'X · one-liner',
        hook: 'a scope contract without forbidden_files is half a contract.',
        body:
          'a scope contract without forbidden_files is half a contract.\n\nthe negative space is where the protection lives. globs, not paths, so a refactor does not void it.\n\nreceipts: one team went from a 52% rabbit-hole rate to 21% in three weeks. the model never changed.',
      },
    ],
    source: {
      label: 'Full lesson: 36 scope-contracts',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/14-agent-engineering/36-scope-contracts',
    },
  },
  {
    id: 'p14-37-runtime-feedback',
    phase: 'Phase 14 · Agent Engineering',
    part: 'Part 6 · The agent workbench',
    index: '14.37',
    title: 'Runtime feedback loops: exit codes over narration',
    oneLiner:
      'Agents that never see real command output predict it instead. A feedback runner captures argv, stdout tail, stderr tail, exit code, and duration into a structured record the next turn has to read.',
    readTime: '~10 min read',
    whyItMatters:
      'This is the difference between an agent reporting on reality and an agent reporting on its own expectations. Every command goes through one wrapper that writes a JSONL record: exact argv, deterministic head and tail truncation so a 50MB log cannot blow the context budget, exit code, wall-clock duration, and a one-line note of what the agent expected before it looked. The rule that carries the whole lesson is refuse-on-null: if there is no exit code, the loop may not claim progress. Null is a distinct state from zero, and your UI for a run should render it that way.',
    learningObjectives: [
      'Distinguish runtime feedback (for the next turn) from observability telemetry (for a human operator later).',
      'Build a feedback record with all seven fields: command, stdout_tail, stderr_tail, exit_code, duration_ms, started_at, agent_note.',
      'Explain why exit status is a three-valued signal, zero, non-zero, null, and why null must block progress rather than pass as success.',
      'Apply deterministic head-plus-tail truncation instead of sampling when a captured log exceeds the token budget.',
      'Redact secrets at write time, not read time, and chain retries with parent_command_id so an audit does not read a struggle as a string of successes.',
    ],
    sections: [
      {
        heading: 'The problem: "all tests pass"',
        body: 'The agent says "running tests now". The next message says "all tests pass". The reality is that no test ran. Or it ran and nobody read the result. Or the result was read and the failing line got silently truncated away.\n\nAll three failures have the same shape: the agent is reacting to its prediction of the output instead of the output. Nothing in the loop distinguishes an imagined green run from a real one, because nothing in the loop is holding a captured exit code. Claude Code\'s Bash tool already captures stdout, stderr, exit, and duration for exactly this reason; a feedback runner is the framework-agnostic version of the same idea.',
      },
      {
        heading: 'What a feedback record holds',
        body: 'Seven fields. command as exact argv, so shell expansion cannot surprise you. stdout_tail and stderr_tail as separate deterministic tails. exit_code as the unambiguous success signal. duration_ms, which surfaces slow probes and runaway processes. started_at for replay. And agent_note, the one line the agent writes about what it expected before reading the result.\n\nThat last field is cheap and unusually diagnostic: comparing expectation against outcome is how you find the runs where the model was confidently wrong rather than merely unlucky. A 41-millisecond duration next to an agent_note reading "expect 12 passed" is the tell that nothing actually ran.',
      },
      {
        heading: 'Truncation is deterministic, not sampled',
        body: 'A 50MB log destroys the loop. The runner keeps a head and a tail with an explicit "truncated N lines" marker in between, and the same output always produces the same record. No sampling, because sampling makes runs unreproducible and hides exactly the line you needed.\n\nHead plus tail is the right shape because the parts that matter (the invocation, then the final error and the summary) sit at the two ends. The middle of a test log is almost always the part you can afford to lose.',
      },
      {
        heading: 'Feedback versus telemetry',
        body: 'Telemetry, the OpenTelemetry GenAI semantic conventions this curriculum covers elsewhere, is for human operators reviewing runs across time: dashboards, alerting, cost tracking. Feedback is for the next turn of this specific run: did the last command succeed, what should the agent do now.\n\nThe two share fields, command name, duration, exit code, but they live in different files with different retention. Feedback lives in feedback_record.jsonl, read by the agent loop every turn. Telemetry ships to an observability platform like Langfuse or Phoenix, read by a human days later. Conflating them means either the agent loop reads a firehose meant for dashboards, or the dashboard is missing the record it needed.',
      },
      {
        heading: 'Refuse to advance without feedback',
        body: 'If the runner errors before capturing an exit, the record carries exit_code null plus an error reason. The loop must not claim success on a null. No exit, no progress.\n\nThis is a three-state signal, not two: zero is success, non-zero is failure, null is "we do not know", and treating null as either of the others is how confident false reports get made. It is the same discipline as never collapsing loading, empty, and error into one state in a component.',
      },
      {
        heading: 'Redact at write, rotate before it grows',
        body: 'Redact at write, not at read, because the file on disk is what an attacker reaches: strip lines matching Bearer, password=, api_key=, AWS AKIA keys, Slack xox tokens, before the append. Redaction at read time is a foot-gun, since the unredacted version already exists on disk by the time anyone gets around to reading it.\n\nRotate the JSONL at 1MB to .1 through .5 so the loader cost stays bounded on every turn while CI keeps the full rotated set for later audit. Without rotation, the feedback file itself becomes the bottleneck the agent waits on before its next action.',
      },
      {
        heading: 'Retry chains need a parent id',
        body: 'Give every record a command_id, with retries carrying parent_command_id pointing at the previous attempt. Without that link, a retry chain reads as a series of independent successes and the audit quietly loses the failure history that explains the run.\n\nThis is the field a reviewer agent reads to build its "failed attempts" list: not just that the final command passed, but that it took three tries and what each try\'s exit code was. A handoff packet inherits the same chain. One field, two downstream consumers.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p14-37-three-state-exit-inline.svg',
        alt: 'Exit status as a three-state signal, not two',
        caption: 'Zero is success, non-zero is failure, null is unknown. Collapsing null into success is how confident false reports get made.',
        diagramBrief:
          'Three small labeled boxes in a horizontal row: "0 = success" (filled with a check icon), "non-zero = failure" (filled with an X icon), "null = unknown" (filled with a question mark icon, drawn in a dashed outline to signal it is a distinct, blocking state). Below the null box, an arrow pointing down to a stop-sign icon labeled "loop refuses to advance". Style: cream paper, black ink, one accent color used only on the null box and the stop sign.',
      },
      {
        src: '/lessons/p14-37-feedback-record-anatomy-inline.svg',
        alt: 'The seven fields of a feedback record',
        caption: 'command, stdout_tail, stderr_tail, exit_code, duration_ms, started_at, agent_note: one JSONL line the next turn has to read before it can claim anything.',
        diagramBrief:
          'A single wide rectangle representing one JSONL record, divided into seven small labeled cells left to right: command, stdout_tail, stderr_tail, exit_code, duration_ms, started_at, agent_note. Draw a small arrow from the exit_code cell down to a separate callout box reading "null blocks the loop; 0 and non-zero do not". Style: cream paper, black ink, one accent color on the exit_code cell only.',
      },
    ],
    takeaways: [
      'Route every command through one wrapper. If the exit code is not in a file, it did not happen.',
      'Exit state is three-valued: zero, non-zero, and null. Null means unknown and must block progress, never pass as success.',
      'Truncate head plus tail deterministically. Sampling makes runs unreproducible and drops the failure line you needed.',
      'Redact at write time and chain retries with parent_command_id, or the audit shows successes where there was a struggle.',
    ],
    terms: [
      { term: 'Feedback record', gloss: '"a run log"', meaning: 'A structured JSONL entry with argv, output tails, exit code, duration, and an agent note.' },
      { term: 'Refuse-on-null', gloss: '"block on missing data"', meaning: 'The loop may not advance when exit_code is null, because unknown is not success.' },
      { term: 'Tail truncation', gloss: '"trimming the log"', meaning: 'Deterministic head plus tail capture with an explicit marker, so records fit the token budget.' },
      { term: 'Agent note', gloss: '"a comment"', meaning: 'The one-line prediction the agent writes before reading the actual result.' },
      { term: 'Telemetry split', gloss: '"logging"', meaning: 'Feedback serves the next turn; telemetry serves the operator later. Different files, different retention.' },
      { term: 'Retry chain', gloss: '"trying again"', meaning: 'Records linked by parent_command_id so a sequence of attempts is not read as independent runs.' },
      { term: 'Redaction at write', gloss: '"scrubbing logs"', meaning: 'Stripping secret patterns before the record hits disk, because the file on disk is what an attacker reaches.' },
      { term: 'Log rotation', gloss: '"clearing old logs"', meaning: 'Capping the active file at a size and rolling overflow into numbered archive files.' },
      { term: 'Command_id', gloss: '"a request ID"', meaning: 'A unique identifier per feedback record, the anchor a parent_command_id points back to.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A command exits with code null and an empty stdout_tail. What does the agent do next, and what does it explicitly not do?' },
      { level: 'medium', prompt: 'Design the regex set for redacting Bearer tokens, password= assignments, AWS AKIA keys, and Slack xox tokens. What is one secret shape none of these catch?' },
      { level: 'medium', prompt: 'A 50 MB test log needs to fit a feedback record. Write the head-plus-tail truncation rule, including where the "...truncated N lines..." marker goes.' },
      { level: 'hard', prompt: 'Chain three retry attempts with command_id and parent_command_id. What does the reviewer agent\'s "failed attempts" list look like for this chain?' },
      { level: 'design', prompt: 'Design how a run\'s status renders in a coding-agent UI when exit_code is null versus zero versus non-zero. What color, icon, and microcopy distinguish "unknown" from "failed" without making them look like the same bad outcome?' },
    ],
    furtherReading: [
      { label: 'OpenTelemetry GenAI semantic conventions', url: 'https://opentelemetry.io/docs/specs/semconv/gen-ai/', why: 'The telemetry-side conventions that feedback records deliberately do not duplicate.' },
      { label: 'Anthropic, Effective harnesses for long-running agents', url: 'https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents', why: 'Where feedback capture sits inside a real long-running agent harness.' },
      { label: 'Guardrails AI x MLflow', url: 'https://guardrailsai.com/blog/guardrails-mlflow', why: 'Redaction patterns treated as regression tests, not one-off regexes.' },
      { label: 'Aport.io, Best AI Agent Guardrails 2026', url: 'https://aport.io/blog/best-ai-agent-guardrails-2026-pre-action-authorization-compared/', why: 'Pre-action and post-tool capture compared across guardrail products.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Feedback record health check',
      body: '- Does every shell command go through one wrapper, with no direct subprocess calls elsewhere?\n- Does a failed capture write exit_code: null plus an error reason, instead of silently omitting the field?\n- Is truncation head-plus-tail and deterministic, never sampled?\n- Are secrets stripped before the record is written to disk, not after?\n- Does every retry carry a parent_command_id back to the attempt before it?\n- Does the loop refuse to claim success on a null exit code, every time, with no exception path?',
    },
    demoCaption:
      'A run that claims a clean test pass, opened up against the record it should have produced. The interesting field is the one that is null.',
    demo: {
      archetype: 'reveal',
      subject: 'Agent turn: "running tests now"',
      opaqueLabel: 'all tests pass, moving on to the handoff',
      revealedLines: [
        'command: ["pytest", "-q", "tests/test_signup.py"]',
        'exit_code: null',
        'error: runner exited before capture',
        'stdout_tail: (empty)',
        'stderr_tail: (empty)',
        'duration_ms: 41',
        'agent_note: "expect 12 passed"',
      ],
      badCaption:
        'One confident sentence with nothing behind it. The summary is generated from the agent\'s expectation, and no field in the turn can disagree with it.',
      goodCaption:
        'Exit code null means unknown, not zero. Refuse-on-null blocks the loop here, and the agent_note ("expect 12 passed") is the tell: it was reporting its prediction, 41ms after starting a suite that takes seconds.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: '"all tests pass" is a prediction unless there is an exit code in a file.',
        body:
          '"all tests pass" is a prediction unless there is an exit code in a file.\n\nevery command goes through one wrapper. every record carries argv, stdout tail, stderr tail, exit code, duration, and a one-line note of what the agent expected.\n\nthen the next turn reacts to facts instead of to its own forecast of facts.',
      },
      {
        kind: 'X · design angle',
        hook: 'exit status is three states, not two, and most agent loops render it as two.',
        body:
          'exit status is three states, not two, and most agent loops render it as two.\n\n0 = success. non-zero = failure. null = we do not know.\n\ncollapsing null into success is how you get confident false reports. it is the same bug as collapsing loading, empty, and error into one state in a component. no exit, no progress.',
      },
      {
        kind: 'X · one-liner',
        hook: 'truncate logs head plus tail, deterministically. never sample.',
        body:
          'truncate logs head plus tail, deterministically. never sample.\n\na 50MB log destroys the loop, but sampling destroys reproducibility and drops the exact failure line you needed.\n\nthe invocation and the final error live at the two ends. the middle is the part you can afford to lose.',
      },
    ],
    source: {
      label: 'Full lesson: 37 runtime-feedback-loops',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/14-agent-engineering/37-runtime-feedback-loops',
    },
  },
  {
    id: 'p14-39-reviewer-agent',
    phase: 'Phase 14 · Agent Engineering',
    part: 'Part 6 · The agent workbench',
    index: '14.39',
    title: 'The reviewer agent: separate the builder from the marker',
    oneLiner:
      'A gate proves the tests ran. A reviewer asks whether the right work happened. Five dimensions scored 0 to 2, read-only access to the builder\'s artifacts, and no permission to patch the diff.',
    readTime: '~10 min read',
    whyItMatters:
      'Acceptance is necessary and not sufficient, and that gap is where merged-then-regretted changes live. The gate confirms deterministic facts: acceptance ran, rules passed, scope held. The reviewer answers what the gate structurally cannot: did this solve the stated problem or a nearby one, were assumptions written down, is the handoff usable. Run it as a subagent with the builder\'s diff, state, feedback, and verdict as read-only inputs and a rubric as its only output. Same model is fine; the separation that matters is the inputs and the posture, not the weights.',
    learningObjectives: [
      'Explain why the agent that wrote the code cannot reliably grade it, and what changes when review is a separate role instead of a separate model.',
      'Score a run against the five-dimension rubric: problem fit, scope discipline, assumptions, verification quality, handoff readiness.',
      'Distinguish a soft fail (below 7 of 10) from a hard fail (below 5, or any dimension at 0) and route each to the right next step.',
      'Name the four measured judge biases, position, verbosity, self-preference, authority, and the mitigation for each.',
      'Decide when one reviewer with a rubric is enough and when a specialist pool with a coordinator earns its keep.',
    ],
    sections: [
      {
        heading: 'The problem: the gate said pass',
        body: 'You ask for a bug fix. The agent edits four files, runs the tests, reports done. The verification gate confirms acceptance ran and scope held and returns passed. You merge. Two days later you find the fix solved the wrong half of the bug.\n\nNothing failed. The gate answered the questions it can answer, and those questions are all deterministic: did the command run, did it exit zero, did the diff stay inside the globs. Whether the change addressed the actual problem is not in that set.',
      },
      {
        heading: 'The rubric: five dimensions, zero to two',
        body: 'Problem fit: did the change solve the task as stated, not a nearby task? Scope discipline: were edits confined to the contract, or was the contract grown deliberately? Assumptions: are the hidden assumptions written somewhere reviewable? Verification quality: does the acceptance command actually prove the goal, or a weaker version of it? Handoff readiness: could the next session pick up cleanly?\n\nTen points total. Below seven is a soft fail and the builder gets findings to address. Below five, or any single dimension at zero, is a hard fail that halts and surfaces to a human.',
      },
      {
        heading: 'Role separation, not model separation',
        body: 'You can run the reviewer on the same model as the builder. The discipline is the role: a different system prompt, a different input bundle, read-only access to the diff, state, feedback log, and verdict, and no write access to anything. Change the posture and you change the signal.\n\nThe reviewer writes a report. It does not patch the diff. If the report says fix this, the next builder turn does the fix and the reviewer goes back to reviewing. Mixing the roles collapses the exact gap that was doing the work. Anthropic\'s Claude Code subagents implement this as a genuinely separate context window, not just a separate prompt in the same conversation.',
      },
      {
        heading: 'Judges are biased in four measurable ways',
        body: 'Position bias: GPT-4-class judges are around 40 percent inconsistent when the same pair is presented as (A,B) versus (B,A). Verbosity bias inflates scores toward longer outputs by roughly 15 percent. Self-preference favours outputs from the same model family. Authority bias over-rates text that cites known names.\n\nMitigations are concrete: score both orderings and only count consistent wins, use a short scale that explicitly rewards concision, rotate judges across model families, and strip author names before scoring. Treat these four numbers as a design requirement for the rubric, not an optimization to bolt on afterward.',
      },
      {
        heading: 'A calibration set keeps the rubric honest',
        body: 'Keep a calibration set of 10 to 20 historical tasks with known correct verdicts, close-outs where a human already decided pass or fail. Run the reviewer over the set on every rubric or prompt change.\n\nIf agreement with the historical record falls below 80 percent, the rubric ships nowhere until it is revised. This is the step every team eventually rediscovers the hard way, after a rubric change silently starts passing work it used to catch; better to start with the calibration set than to back into it after an incident. The set doubles as a regression test for the reviewer itself, the same job a snapshot test does for a UI component.',
      },
      {
        heading: 'What it looks like at scale',
        body: 'Cloudflare ran 131,246 review runs across 48,095 merge requests in 5,169 repos in 30 days, with a median review time of 3 minutes 39 seconds. Up to seven specialist reviewers (security, performance, code quality, docs, release management, compliance, an internal codex) ran in parallel under a coordinator that deduplicated findings and judged severity.\n\nThe tier split is the practical lesson: cheap models for the specialists, the strongest model reserved for the coordinator. One reviewer with a five-dimension rubric is right for a solo repo; specialists earn their keep once the codebase has distinct critical surfaces.',
      },
      {
        heading: 'The gate and the reviewer are a hybrid, not a replacement',
        body: 'The verification gate proves deterministic facts: did acceptance run, did the rules pass, did scope hold. The reviewer answers what the gate structurally cannot: did this solve the stated problem, were assumptions written down, is the handoff usable.\n\nAnthropic\'s guidance on this split is explicit: do not ask the reviewer to redo what the gate already proves. A rubric that re-checks whether tests passed wastes a dimension on a question the gate already answered for free. Render both verdicts separately in your UI, verified and reviewed, because a run can be green on the first and a hard fail on the second, and collapsing them into one status hides exactly the gap this lesson exists to close.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p14-39-gate-vs-reviewer-inline.svg',
        alt: 'What the verification gate proves versus what the reviewer judges',
        caption: 'The gate answers deterministic questions. The reviewer answers whether the work was right. A run can pass one and hard-fail the other.',
        diagramBrief:
          'Two side-by-side columns. Left column headed "Verification gate" listing three bullet lines: "acceptance ran", "rules passed", "scope held", with a green check icon at the bottom. Right column headed "Reviewer" listing three bullet lines: "problem fit", "assumptions documented", "handoff readiness", with a red X icon at the bottom to represent a possible hard fail even when the left column is all green. A dividing vertical line between columns. Style: cream paper, black ink, one accent color used only on the two status icons.',
      },
      {
        src: '/lessons/p14-39-judge-bias-inline.svg',
        alt: 'Four measured LLM judge biases and their mitigations',
        caption: 'Position, verbosity, self-preference, and authority bias are measured, not theoretical. Each has a concrete design mitigation.',
        diagramBrief:
          'A four-row table rendered as a diagram. Each row has a bias name on the left (Position, about 40 percent inconsistent on reordering; Verbosity, about 15 percent inflation toward longer outputs; Self-preference; Authority) and its mitigation on the right (score both orderings, short concise-rewarding scale, rotate judge model families, strip author names). Style: cream paper, black ink, one accent color used as a small icon next to each bias name.',
      },
    ],
    takeaways: [
      'Never let the builder mark its own homework. Different prompt, different inputs, read-only on the diff, same model is fine.',
      'The gate and the reviewer split cleanly: deterministic facts to the gate, semantic judgment to the reviewer, no overlap.',
      'Design against the four judge biases up front: position, verbosity, self-preference, authority. Both orderings, short scales, rotated families.',
      'Keep a calibration set of 10 to 20 known verdicts. Below 80 percent agreement, the rubric ships nowhere.',
    ],
    terms: [
      { term: 'Reviewer rubric', gloss: '"a checklist"', meaning: 'Five dimensions scored 0 to 2, each with a written question rather than a vibe.' },
      { term: 'Soft fail', gloss: '"needs revisions"', meaning: 'Total below 7. The builder gets findings to address and the task stays open.' },
      { term: 'Hard fail', gloss: '"reject"', meaning: 'Total below 5, or any dimension at 0. Halt and surface to a human.' },
      { term: 'Role separation', gloss: '"a second opinion"', meaning: 'Same model allowed, different system prompt, different inputs, no write access to the artifact.' },
      { term: 'Position bias', gloss: '"order should not matter, but"', meaning: 'A judge scoring differently when the same two candidates are swapped in presentation order.' },
      { term: 'Verbosity bias', gloss: '"longer sounds better"', meaning: 'Roughly 15 percent score inflation toward longer outputs, independent of quality.' },
      { term: 'Calibration set', gloss: '"a regression test for the reviewer"', meaning: 'Historical tasks with known correct verdicts, re-run on every rubric change.' },
      { term: 'Specialist pool', gloss: '"more reviewers"', meaning: 'Multiple narrow reviewers (security, performance, docs) under a coordinator, instead of one reviewer running a broad rubric.' },
      { term: 'Verification gate', gloss: '"the tests passed"', meaning: 'The deterministic check that acceptance ran and scope held; necessary and not sufficient on its own.' },
      { term: 'Confidence floor', gloss: '"do not guess"', meaning: 'Refusing to emit a rubric verdict when the reviewer\'s own confidence in a dimension is too low to trust.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Score a change you recently shipped yourself against the five-dimension rubric. Which dimension would have caught the thing you found two days later?' },
      { level: 'medium', prompt: 'A run scores 8 out of 10 with problem fit at 0. Is this a soft fail or a hard fail? Why does the total not decide it alone?' },
      { level: 'medium', prompt: 'Design a reviewer prompt that reads the diff, state, feedback log, and gate verdict, but has no tool that can write to the diff. What tools does it need instead?' },
      { level: 'hard', prompt: 'Build a 10-task calibration set from your own project history. Run a rubric change against it. Where does the new rubric disagree with what you know actually happened?' },
      { level: 'design', prompt: 'Design the two-status UI (verified, reviewed) for a merge screen where a run is green on verification and a hard fail on review. What copy and layout stop a reviewer from merging on the green check alone?' },
    ],
    furtherReading: [
      { label: 'OpenAI Agents SDK handoffs', url: 'https://openai.github.io/openai-agents-python/handoffs/', why: 'How a builder-to-reviewer handoff is implemented as a first-class runtime primitive.' },
      { label: 'Anthropic Claude Code subagents', url: 'https://code.claude.com/docs/en/sub-agents', why: 'Reviewer-as-subagent with a genuinely separate context window, not just a separate prompt.' },
      { label: 'Cloudflare, Orchestrating AI Code Review at Scale', url: 'https://blog.cloudflare.com/ai-code-review/', why: 'The 131,246-run, seven-specialist-plus-coordinator architecture behind the scale numbers in this lesson.' },
      { label: 'Adnan Masood, Rubric-Based Evaluations and LLM-as-a-Judge', url: 'https://medium.com/@adnanmasood/rubric-based-evals-llm-as-a-judge-methodologies-and-empirical-validation-in-domain-context-71936b989e80', why: 'The four measured judge biases and their mitigations, in one place.' },
      { label: 'LangChain, How to Calibrate LLM-as-a-Judge with Human Corrections', url: 'https://www.langchain.com/articles/llm-as-a-judge', why: 'The calibration-set workflow this lesson\'s 80 percent threshold comes from.' },
    ],
    shipIt: {
      kind: 'rubric',
      name: 'Five-dimension reviewer rubric',
      body: 'Score each 0 (fails), 1 (partial), 2 (clear pass). Total out of 10.\n1. Problem fit: did the change solve the task as stated, not a nearby task?\n2. Scope discipline: were edits confined to the contract, or was the contract grown without flagging it?\n3. Assumptions: are the hidden assumptions written down somewhere reviewable?\n4. Verification quality: does the acceptance command prove the actual goal, or a weaker version of it?\n5. Handoff readiness: could the next session pick up cleanly from what is on disk right now?\nBelow 7: soft fail, findings go back to the builder. Below 5, or any single 0: hard fail, halt and surface to a human.',
    },
    demoCaption:
      'One change that passed every deterministic check, scored across the five rubric dimensions. The headline verdict and the dimension breakdown disagree, which is the entire reason the reviewer exists.',
    demo: {
      archetype: 'meter',
      subject: 'Task close-out: "fix the login bug"',
      headline: 'Gate verdict: passed. Acceptance ran, scope held, rules clean.',
      breakdown: [
        { label: 'Problem fit', value: 0 },
        { label: 'Scope discipline', value: 2 },
        { label: 'Assumptions written down', value: 1 },
        { label: 'Verification quality', value: 1 },
        { label: 'Handoff readiness', value: 2 },
      ],
      badCaption:
        'Passed is true and not enough. The gate can only answer deterministic questions: did the command run, did it exit zero, did the diff stay inside the globs. Whether it fixed the right half of the bug is outside that set.',
      goodCaption:
        'Six out of ten with problem fit at zero. Any dimension at zero is a hard fail regardless of total, so this halts and surfaces to a human instead of merging on a green check.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'the agent that wrote the code cannot grade it.',
        body:
          'the agent that wrote the code cannot grade it.\n\nreviewer = second loop, different system prompt, read-only on the diff, no permission to patch. 5 dimensions scored 0-2: problem fit, scope discipline, assumptions, verification quality, handoff readiness.\n\nsame model is fine. the separation is inputs and posture, not weights.',
      },
      {
        kind: 'X · design angle',
        hook: 'a green check is a claim about the command, not about the work.',
        body:
          'a green check is a claim about the command, not about the work.\n\nthe gate proves deterministic facts: acceptance ran, scope held, rules passed. it structurally cannot ask whether you fixed the right half of the bug.\n\nso do not render one status. render two: verified, and reviewed. a run can be green on the first and a hard fail on the second.',
      },
      {
        kind: 'X · one-liner',
        hook: 'LLM judges have 4 measured biases. design around them or your rubric is noise.',
        body:
          'LLM judges have 4 measured biases. design around them or your rubric is noise.\n\nposition (~40% inconsistent on A,B vs B,A). verbosity (~15% inflation for longer answers). self-preference. authority.\n\nfix: score both orderings, keep the scale short, rotate model families, strip author names. then calibrate against 10-20 known verdicts.',
      },
    ],
    source: {
      label: 'Full lesson: 39 reviewer-agent',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/14-agent-engineering/39-reviewer-agent',
    },
  },
  {
    id: 'p14-40-multi-session-handoff',
    phase: 'Phase 14 · Agent Engineering',
    part: 'Part 6 · The agent workbench',
    index: '14.40',
    title: 'Multi-session handoff: the packet and the clean state',
    oneLiner:
      'The session ends, the work does not. A handoff packet is generated from the workbench artifacts, carries seven fields, and lives or dies on one of them: next_action.',
    readTime: '~10 min read',
    whyItMatters:
      'You pay for a bad handoff every session for the life of the task. The next session rediscovers the same context, re-runs the same commands, and re-asks you the same questions, burning thirty minutes to recover thirty seconds. Two artifacts fix it and they are not the same artifact. The packet proves the next session knows where to start; the cleanup check proves the workbench is safe to leave. A perfect handoff written over a half-applied diff, a stray temp file, and a silent red test is a forwarded mess. And wrap up at 50 to 75 percent of the context budget, not at the wall.',
    learningObjectives: [
      'Generate a handoff packet from workbench artifacts (state, verdict, review, feedback log) instead of hand-writing a summary.',
      'Identify next_action as the one field that turns a status report into a handoff, and write one that leaves no decision for the next session.',
      'Run the five-check clean state pass (working tree, temp artifacts, tests, feature board, branch) before a handoff is allowed to generate.',
      'Distinguish compaction, which extends a session, from a handoff, which closes one and starts the next in fresh context.',
      'Decide when to end a session, at 50 to 75 percent of context budget, not at the wall, and explain what that budget buys.',
    ],
    sections: [
      {
        heading: 'The problem: "great, we made progress"',
        body: 'The session ends on a warm note. The next session opens and asks where we left off. The first agent\'s answer is gone: trimmed, compacted, or simply never written down anywhere durable.\n\nSo the next agent rediscovers the repo, re-runs the commands the last one already ran, re-asks the human the questions already answered, and burns half an hour recovering the last half minute of the previous session. That cost repeats every session, which is why it is worth automating rather than remembering.',
      },
      {
        heading: 'Seven fields, one of them does the real work',
        body: 'summary, one paragraph of what was done. changed_files, the diff at a glance. commands_run, what actually executed. failed_attempts, what was tried and why it did not work. open_risks, what could bite next time, with severity. next_action, the first concrete step. verdict_pointer, paths to the verification and review reports.\n\nnext_action is the one that matters. A packet with all six others and no next_action is a status report. Useful, but the next session still has to decide where to start, which is exactly the expensive part.',
      },
      {
        heading: 'Generated, not written, in two forms',
        body: 'A hand-written handoff is a handoff that gets skipped on a hard day. The generator reads state, the verification verdict, the review report, and the feedback log, then emits the packet. The agent\'s job is to leave the workbench in a state the generator can summarize, not to compose a summary.\n\nTwo outputs from the same source: handoff.md for the human, handoff.json for the next agent. If they ever disagree, the JSON wins, because the next session\'s startup trigger reads the JSON, not the prose. A pull request template can reuse the same markdown body directly; a reviewer then reads one file instead of opening five.',
      },
      {
        heading: 'Feedback log trimming',
        body: 'The full feedback_record.jsonl may hold hundreds of entries by the time a session ends. The handoff carries only the last K entries plus every entry with a non-zero exit, so the packet stays small and the failures survive the trim.\n\nThe next session loads the full log only if it needs the detail; the packet itself is the fast path. This is the same shape as a stack trace: you do not need every frame the first time you look, you need the ones that were actually involved in the failure.',
      },
      {
        heading: 'Cleanup is a check, not a habit',
        body: 'Five checks before the packet is written. The working tree: everything committed or explicitly stashed with a note, because a half-applied diff reads as intentional work. Temp artifacts: no scratch dirs, no debug prints, no commented-out blocks polluting the diff. Tests: green, or red with the failure named in open_risks, because a silent red test is a trap. The feature board reflects reality. The branch is the expected one, no detached HEAD, no orphans.\n\nCleanup emits a clean_state.json of blocking issues, and an empty list is the precondition the generator asserts before writing anything.',
      },
      {
        heading: 'Handoff is not compaction',
        body: 'Compaction extends a session. A handoff closes one cleanly and starts the next in fresh context. The mistake is compressing until quality collapses; the fix is budgeting for an early clean exit at 50 to 75 percent of context rather than at 95.\n\nThe vendor mechanisms differ and do not matter: Codex CLI does a server-side compact with a local summary fallback, Claude Code runs five-stage progressive compaction at 95 percent, OpenCode hides by timestamp and summarizes under five headings. Same need underneath: serialize what survives compression into a portable artifact.',
      },
      {
        heading: 'One active handoff per branch',
        body: 'Multi-agent coordination breaks down on stale handoffs more than on bad model output. Every packet carries branch, last_known_good_commit, and a status of active, superseded, or archived. Stale handoffs get archived; only the active one drives the next session.\n\nThis is the difference between handoff-as-notes and handoff-as-state: notes can pile up and contradict each other, state has exactly one current value. Build with one product, Claude Code, and continue with another, Codex, and the packet is the lingua franca between them, because neither tool needs to understand the other\'s compaction mechanism, only the shared schema.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p14-40-seven-fields-inline.svg',
        alt: 'The seven fields of a handoff packet, with next_action carrying the weight',
        caption: 'Six fields describe the past. One field, next_action, starts the next session. A packet missing it is a status report.',
        diagramBrief:
          'A vertical stack of seven labeled bars: summary, changed_files, commands_run, failed_attempts, open_risks, verdict_pointer, next_action. The first six bars are drawn in plain black ink outline. The seventh bar, next_action, is filled solid with the accent color and slightly wider, with a small arrow pointing right out of it labeled "starts next session". Style: cream paper background.',
      },
      {
        src: '/lessons/p14-40-cleanup-gates-handoff-inline.svg',
        alt: 'The clean state check gates the handoff generator',
        caption: 'Five checks (working tree, temp artifacts, tests, feature board, branch) must return an empty blocking list before the generator is allowed to write a packet.',
        diagramBrief:
          'A five-item checklist on the left (working tree, temp artifacts, tests, feature board, branch), each with a checkbox. An arrow from the checklist, gated by a small padlock icon, points right to a box labeled "handoff.md + handoff.json". The padlock is drawn open only when all five checkboxes are ticked; otherwise closed with the label "blocked". Style: cream paper, black ink, one accent color on the padlock.',
      },
    ],
    takeaways: [
      'A packet without next_action is a status report. The one concrete first step is the field that pays for the whole artifact.',
      'Generate the handoff from artifacts. Anything hand-written is the thing that gets skipped on the day it matters most.',
      'Cleanup is a separate check that gates the handoff: clean tree, no temp files, tests green or risks named, board accurate, right branch.',
      'End the session at 50 to 75 percent of context, not at 95. Cheap to write while context is intact, expensive after compression.',
    ],
    terms: [
      { term: 'Handoff packet', gloss: '"a session summary"', meaning: 'A generated artifact carrying the seven fields, emitted as both markdown and JSON.' },
      { term: 'next_action', gloss: '"what to do first"', meaning: 'The single concrete step that starts the next session, with no decision left to make.' },
      { term: 'Clean state check', gloss: '"tidying up"', meaning: 'The pre-handoff pass that proves the workbench is safe to leave, emitted as a blocking list.' },
      { term: 'Feedback trim', gloss: '"a log summary"', meaning: 'Last K records plus every non-zero exit, so the packet stays small and failures survive.' },
      { term: 'Compaction', gloss: '"summarizing the chat"', meaning: 'In-place context compression that extends a session; distinct from closing one cleanly.' },
      { term: 'Handoff status', gloss: '"is this current"', meaning: 'active, superseded, or archived. Exactly one active packet per branch drives the next session.' },
      { term: 'Status report', gloss: '"what we did"', meaning: 'A document missing next_action; useful as a record, but not a handoff.' },
      { term: 'Verdict pointer', gloss: '"a receipt"', meaning: 'Path to the verification and review reports, for traceability without duplicating their content.' },
      { term: 'Last known good commit', gloss: '"the safe point"', meaning: 'The commit the next session can trust as a rollback target if the current work is unusable.' },
      { term: 'Detached HEAD', gloss: '"a weird git state"', meaning: 'A branch check the cleanup pass runs; leaving one behind sends the next session\'s first commit nowhere useful.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Write a handoff packet for a task you stopped mid-way through today. Which of the seven fields did you not have an answer for?' },
      { level: 'medium', prompt: 'A handoff has summary, changed_files, commands_run, failed_attempts, and open_risks filled in, but next_action is empty. What does the next session have to do before it can start working?' },
      { level: 'medium', prompt: 'Run the five-check clean state pass on a real branch: working tree, temp artifacts, tests, feature board, correct branch. Which check fails first?' },
      { level: 'hard', prompt: 'Design the trim rule for a feedback log where a run had 200 commands, three of which failed. Write out exactly which entries make it into the handoff.' },
      { level: 'design', prompt: 'Design the moment a session-end hook fires in a coding-agent product: what does the user see while the packet generates, and what happens if the clean-state check finds a blocking issue?' },
    ],
    furtherReading: [
      { label: 'Anthropic, Effective harnesses for long-running agents', url: 'https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents', why: 'The harness-level framing that treats a handoff as a designed artifact, not an afterthought.' },
      { label: 'Justin3go, Shedding Heavy Memories', url: 'https://justin3go.com/en/posts/2026/04/09-context-compaction-in-codex-claude-code-and-opencode', why: 'A three-vendor comparison of Codex, Claude Code, and OpenCode compaction, the source for this lesson\'s vendor mechanisms.' },
      { label: 'JD Hodges, Claude Handoff Prompt', url: 'https://www.jdhodges.com/blog/ai-session-handoffs-keep-context-across-conversations/', why: 'The CLAUDE.md plus HANDOVER.md pattern and the 50 to 75 percent context budget rule.' },
      { label: 'OpenAI Agents SDK handoffs', url: 'https://openai.github.io/openai-agents-python/handoffs/', why: 'Handoff as a first-class SDK primitive, not a bespoke script.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Session-end handoff checklist',
      body: 'Before generating the packet:\n- Working tree: everything committed or explicitly stashed with a note.\n- Temp artifacts: no scratch dirs, debug prints, or commented-out blocks.\n- Tests: green, or red with the failure named in open_risks.\n- Feature board: status reflects reality.\n- Branch: expected branch, no detached HEAD, no orphan branches.\nAfter generating the packet:\n- next_action names one concrete first step, not a decision.\n- verdict_pointer resolves to real verification and review files.\n- Exactly one handoff has status: active for this branch.',
    },
    demoCaption:
      'Two session endings, same work completed. Read what the next session opens to in each, and note which single missing field turns a handoff back into a status report.',
    demo: {
      archetype: 'before-after',
      subject: 'End of session',
      badLabel: 'Status report',
      goodLabel: 'Handoff packet',
      badLines: [
        'summary: "made good progress on the importer"',
        'changed_files: not recorded',
        'failed_attempts: lost with the transcript',
        'open_risks: none listed, one test silently red',
        'next_action: missing',
      ],
      goodLines: [
        'summary plus changed_files plus commands_run',
        'failed_attempts: 2, with the exit codes that killed them',
        'open_risks: test_import red, severity high',
        'next_action: run pytest tests/test_import.py, fix the null path',
        'branch, last_known_good_commit, status: active',
      ],
      badCaption:
        'Everything here is true and none of it starts the next session. Without next_action the incoming agent still has to rediscover the state and decide where to begin, which is the expensive half.',
      goodCaption:
        'Generated from state, verdict, review, and the trimmed feedback log, gated on a clean_state check with an empty blocking list. The next session\'s first minute is deterministic instead of archaeological.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'a session summary without next_action is not a handoff. it is a status report.',
        body:
          'a session summary without next_action is not a handoff. it is a status report.\n\n7 fields: summary, changed files, commands run, failed attempts, open risks, next action, verdict pointer.\n\nsix of them describe the past. one of them starts the next session. guess which one gets dropped first.',
      },
      {
        kind: 'X · design angle',
        hook: 'end the session at 50-75% context, not at 95%.',
        body:
          'end the session at 50-75% context, not at 95%.\n\ncompaction extends a session. a handoff closes one and opens a fresh context cleanly. these are different moves and most people only use the first.\n\nwriting the packet is cheap while context is intact. it is expensive once the model is already losing its place.',
      },
      {
        kind: 'X · one-liner',
        hook: 'a perfect handoff over a dirty tree is a forwarded mess.',
        body:
          'a perfect handoff over a dirty tree is a forwarded mess.\n\nhalf-applied diff, stray temp files, a silent red test, a stale board, wrong branch. the next session spends its first ten minutes cleaning up instead of building.\n\ncleanup is a check that gates the handoff, not a habit you rely on at 1am.',
      },
    ],
    source: {
      label: 'Full lesson: 40 multi-session-handoff',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/14-agent-engineering/40-multi-session-handoff',
    },
  },
];
