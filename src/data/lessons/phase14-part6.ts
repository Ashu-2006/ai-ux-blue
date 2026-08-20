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
      'The model is rarely the bottleneck. Seven surfaces around it (instructions, state, scope, feedback, verification, review, handoff) decide whether an agent run is shippable, and every one of them is a file you write.',
    readTime: '~8 min read',
    whyItMatters:
      'This is the diagnostic layer for your own setup. When an agent touches a file you never mentioned, invents a passing test run, or opens a session with no idea what yesterday decided, you can now name which of the seven surfaces was missing instead of blaming the model or rewriting the prompt. Each surface maps to an artifact in your repo: CLAUDE.md is instructions, a state file is session persistence, allowed globs are an authorization policy, captured command output is feedback. Same shape as any production system. Swap the model and the surfaces still hold; drop a surface and no model recovers it.',
    sections: [
      {
        heading: 'The problem: the model was not wrong about Python',
        body: 'Give a frontier model a real repo and ask it to add input validation. It opens four files, writes plausible code, declares success, stops. Two tests fail. A third file got touched that had nothing to do with validation. There is no record of what it assumed, what it tried first, or what is left.\n\nIt was not wrong about the language. It was wrong about the work: what counted as done, where it was allowed to write, which tests were authoritative, how the next session picks up. That is not a model bug, it is a workbench bug.',
      },
      {
        heading: 'The seven surfaces',
        body: 'A workbench is the operating environment wrapped around the model during a task. Instructions carry startup rules, forbidden actions, and the definition of done. State carries the active task, touched files, blockers, next action. Scope carries allowed and forbidden globs plus acceptance. Feedback carries real captured command output. Verification carries tests, lint, and the scope check. Review is a second pass with a different role. Handoff carries what changed, why, and what is left.\n\nMissing each one produces a signature symptom. No scope means edits leak. No feedback means the agent declares success on a 400.',
      },
      {
        heading: 'Underneath the labels: eight ordinary primitives',
        body: 'Strip the agent word off and a run is computation crossing time, processes, and machines. The seven surfaces are a UX layer over primitives every backend already has: functions, workers, triggers, runtimes, RPC, queues, session persistence, authorization policy.\n\nInstructions are policy plus function metadata. State is session persistence. Scope is an ACL per task. Feedback is an invocation log in a queue. Verification is a deterministic function that fails closed. Review is a separate worker with read-only access. Handoff is a durable record emitted by a session-end trigger. The vendor vocabulary changes every quarter; the engineering does not.',
      },
      {
        heading: 'The receipts',
        body: 'The harness-over-model claim has numbers now. On Terminal Bench 2.0 the same model moved from outside the top 30 to rank five with only a harness change. Vercel deleted 80 percent of its agent tools and success went from 80 to 100 percent. Harvey more than doubled legal-agent accuracy through harness work alone.\n\nAgainst that, 88 percent of enterprise agent projects never reach production, and the failures cluster in runtime, not reasoning. A 2025 study of three popular frameworks logged roughly 50 percent task completion, with long-context agents collapsing from 40-50 percent to under 10 percent, mostly infinite loops and goal loss.',
      },
      {
        heading: 'The loop closes on the repo, not on chat',
        body: 'Task feeds scope, scope feeds state, state feeds the agent loop, the loop emits feedback, feedback feeds verification, verification feeds review, review feeds handoff, and handoff writes back into state. The cycle closes on a file, because chat is volatile: sessions die, conversations get trimmed, context gets compacted. The repo is the system of record.\n\nThat is the test for anything you add to your setup. If losing the transcript loses the information, it was never a surface. It was a message.',
      },
    ],
    takeaways: [
      'Name the missing surface before touching the prompt. Instructions, state, scope, feedback, verification, review, handoff, in that order.',
      'The workbench is model-independent. You can swap the model and keep the surfaces; you cannot swap the surfaces and keep reliability.',
      'Every surface reduces to a primitive you already know: policy, persistence, queue, trigger, worker, function.',
      'If information dies with the transcript it was never a surface. Anything load-bearing lives in a file the next session reads.',
    ],
    terms: [
      { term: 'Workbench', meaning: 'The engineered surfaces around a model that make its work reliable and resumable.' },
      { term: 'Surface', meaning: 'A named, machine-readable file the agent reads or writes every turn.' },
      { term: 'System of record', meaning: 'The file the workbench treats as truth once chat history is gone.' },
      { term: 'Definition of done', meaning: 'An objective, file-backed checklist the agent cannot fake its way past.' },
      { term: 'Session persistence', meaning: 'State that survives crashes, restarts, and model swaps.' },
      { term: 'Authorization policy', meaning: 'Who may call which function on which paths; scope is this per task.' },
    ],
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
    readTime: '~8 min read',
    whyItMatters:
      'This is the direct verdict on your CLAUDE.md. A long instruction file is not coverage, it is an attention budget you already blew: the agent reads the first screen and acts on a fraction of the rest. Augment Code measured it both ways. A good router is worth roughly a model-tier upgrade; a bad one makes output worse than having no file at all. Treat the root file as navigation, under 50 lines of pointers, and push depth into topic docs loaded only when the task touches them. Progressive disclosure, applied to the agent instead of the user.',
    sections: [
      {
        heading: 'The problem: the 3000-line AGENTS.md',
        body: 'Most teams reach for a workbench by writing one enormous instructions file and calling it done. The model loads it, skims what it cannot summarize, and fails on exactly the surfaces it always failed on.\n\nThe file grows because every incident adds a rule and no incident removes one. A year in it is an encyclopedia, and the agent reads the index. You need the opposite shape: a tiny root file that routes into deeper files only when relevant, plus two machine-readable files that carry the things prose cannot carry.',
      },
      {
        heading: 'AGENTS.md is a router, not a manual',
        body: 'A good root file points at four things: the state file (where you are), the task board (what is left), the deeper rules (docs/agent-rules.md), and the verification command (how to know it worked). Anything longer goes into topic docs.\n\nTwo tests keep the layering honest. Reachability: the agent should reach any rule in at most two hops, so the router links topic docs by path rather than describing them in prose. Freshness: the router stays short enough that a reviewer rereads it on every PR, which is the only thing that stops it growing back.',
      },
      {
        heading: 'agent_state.json is the system of record',
        body: 'State carries the active task id, touched files, assumptions made, blockers, and the next action. The agent reads it at every turn and writes it at the end. The next session reads it instead of replaying chat.\n\nIt lives in a file because chat history is unreliable infrastructure. Sessions die. Conversations get trimmed. Compaction rewrites what you thought you said. The file does not move. If a piece of context matters tomorrow, it belongs here, not in a message you will scroll past.',
      },
      {
        heading: 'task_board.json is the queue',
        body: 'The board carries every task with status todo, in_progress, done, or blocked. It is the queue the agent pulls from when state is empty, and the thing you read when you want to know whether the run is on track. A task has an id, a goal, an owner (builder, reviewer, or human), and acceptance criteria.\n\nThe board is small on purpose. Once it grows past a screen you have a planning problem, not a board problem, and adding fields will not fix it.',
      },
      {
        heading: 'What monorepos add on top',
        body: 'Three patterns survive contact with a large repo. Nested routers with nearest-wins precedence: OpenAI ships 88 AGENTS.md files across its main repo, and Codex, Cursor, Claude Code, and Copilot all walk from the working file toward the root and concatenate what they find. Cross-tool symlinks keep one source of truth (ln -s AGENTS.md CLAUDE.md, and so on).\n\nAnd the anti-patterns to refuse: conflicting instructions dropped resolve rate from 48.8 to 28 percent in the ICLR 2026 AMBIG-SWE study, so number your priorities instead of stacking them flat, and never write a style rule without the exact lint command that enforces it.',
      },
    ],
    takeaways: [
      'Router, state, board. If a repo cannot carry those three files, no model upgrade will save the runs on it.',
      'Keep the root file under 50 lines of pointers. Depth belongs in topic docs the agent loads only when the task touches them.',
      'Conflicting instructions are worse than missing ones: 48.8 to 28 percent resolve rate. Number priorities, do not stack them flat.',
      'Every style rule ships with its enforcement command, or the agent will invent its own compliance.',
    ],
    terms: [
      { term: 'Router', meaning: 'The short root instructions file whose whole job is pointing at deeper files by path.' },
      { term: 'State file', meaning: 'Machine-readable record of active task, touched files, assumptions, and next action.' },
      { term: 'Task board', meaning: 'A small JSON queue of work with status, owner, and acceptance per task.' },
      { term: 'Nearest-wins precedence', meaning: 'Nested instruction files concatenate from the working file up to the repo root.' },
      { term: 'Progressive disclosure', meaning: 'Load only the depth the current task needs; the router is the map, not the encyclopedia.' },
      { term: 'Reachability test', meaning: 'Any rule must be at most two hops from the router, by path, not by description.' },
    ],
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
      'A rule with no check is a wish. Give every rule a category, a severity, and the name of a function that verifies it, and the instruction file stops being documentation and starts being a test suite.',
    readTime: '~8 min read',
    whyItMatters:
      'Go read your own rules file and mark each line operational or aspirational. "Be careful", "test thoroughly", "ask if unsure" score zero: nothing in the run can fail because of them. The upgrade is mechanical. Give each rule one of five categories (startup, forbidden, definition of done, uncertainty, approval), a severity of block, warn, or info, and a named check function. Now a run produces a rule report, the gate refuses only on block, and every override lands in an audit log. Same discipline as typed props over comments: the constraint is enforced, not requested.',
    sections: [
      {
        heading: 'The problem: aspirational instructions',
        body: 'A typical instructions file reads like onboarding. Be careful. Test thoroughly. Ask if unsure. Three days later the agent ships a change with no tests, writes to a forbidden directory, and never asks, because it never knew where the line was.\n\nNothing in that file is wrong. It is just unenforceable. Instructions are powerful when operational and weak when aspirational, and the difference is whether a run can fail because of them. If no execution path can turn a rule into a failure, the rule is decoration.',
      },
      {
        heading: 'Five categories that cover almost everything',
        body: 'Startup answers what must be true before work begins ("state file exists and is fresh"). Forbidden answers what must never happen ("do not edit scripts/release.sh"). Definition of done answers what proves completion ("pytest exits 0 and the acceptance line passes"). Uncertainty answers what to do when unsure ("open a question note instead of guessing"). Approval answers what needs a human ("any new dependency, any prod write").\n\nA rule that does not fit one of the five usually wants to be two rules. Force the split rather than inventing a sixth category.',
      },
      {
        heading: 'Each rule names its own check',
        body: 'A rule carries a slug, a category, a one-line description, and a check field naming a function in rule_checker.py. Adding a rule means adding a check, so the checker grows with the workbench instead of drifting behind it.\n\nSeverity is tagged at write time, not under deadline pressure: block halts the run, warn reports, info records. Teams overstate severity early and then quietly weaken it later, so forcing the calibration into the authoring moment is the point. Any override of a block rule gets signed into an overrides log.',
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
    takeaways: [
      'Audit your rules file by asking one question per line: can a run fail because of this? If not, delete it or give it a check.',
      'Five categories, no more: startup, forbidden, definition of done, uncertainty, approval. A rule that spans two is two rules.',
      'Tag severity at write time. Block halts, warn reports, info records, and every block override is signed into an audit log.',
      'Rules expire. Sets with expiry stayed under 30 rules per repo; sets without grew past 80, most never firing.',
    ],
    terms: [
      { term: 'Operational rule', meaning: 'A rule the workbench can check at runtime, because it names a function.' },
      { term: 'Aspirational rule', meaning: 'A rule with no check attached; either upgrade it or delete it.' },
      { term: 'Block severity', meaning: 'Violation halts the run and cannot be silenced without a signed operator override.' },
      { term: 'Rule expiry', meaning: 'An authored expiry date that forces a rule to be re-justified or retired.' },
      { term: 'Rule report', meaning: 'The per-run pass/fail record the verification gate and reviewer both consume.' },
      { term: 'Lock file', meaning: 'The generated JSON cache of the authored markdown rules, read on the hot path.' },
    ],
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
      'A per-task file lists allowed globs, forbidden globs, acceptance, and rollback, and a checker compares the final diff against it. One practitioner cut rabbit-hole rate from 52 to 21 percent with the contract alone.',
    readTime: '~8 min read',
    whyItMatters:
      'Creep happens at two altitudes and you feel both. Task creep is the login fix that also touched the email helper, the DB driver, and the README, each edit plausible in the moment and collectively a different change than the one you reviewed. Project creep is the session that finishes the fix and then decides the app also needs a settings page and a dark mode toggle. The first is bounded by a scope contract with allowed and forbidden globs; the second by a feature_list.json with exactly one in_progress. Both are values read off disk, not sentences the agent can rationalize past.',
    sections: [
      {
        heading: 'The problem: every step had a reason',
        body: 'The task is "fix the login bug". The diff touches the login route, the email helper, the database driver, the README, and the release script. Every one of those touches had a plausible justification at the moment it happened. Together they are a different change than the one that was scoped.\n\nScope creep is the most under-monitored failure mode in agent work precisely because the agent narrates each step in good faith. A stricter prompt does not fix it. A contract on disk plus a check that compares the result against the promise does.',
      },
      {
        heading: 'What the contract carries',
        body: 'Seven fields: task_id linking to the board, goal as one verifiable sentence, allowed_files as globs, forbidden_files as globs, acceptance_criteria as commands or assertion lines, a rollback_plan an operator could actually execute, and approvals_required for anything outside the boundary.\n\nA contract without forbidden_files is incomplete; the negative space is half the contract. Use globs, not raw paths, so a refactor between sessions does not invalidate the contract. And a contract you cannot roll back from is a contract that should not have been approved.',
      },
      {
        heading: 'The second altitude: one feature at a time',
        body: 'A contract bounds one task. It never bounds the project. So the second primitive is feature_list.json: the backlog as an ordered machine-readable file with an active field, and per feature an id, a status, a goal, and a done_when line.\n\nThe agent picks exactly one todo feature, writes its id into the active contract, and is forbidden from starting a second in the same session. The invariant "at most one in_progress" becomes a startup check: if the list shows two, the session refuses to start until a human resolves it. "One thing at a time" stops being a request.',
      },
      {
        heading: 'Budgets instead of binary failure',
        body: 'A gate that refuses everything gets disabled by the team that hated it. The OSS merge gates ship a violationBudget per task: minor slips within budget surface as warnings, and only exceeding the budget refuses the merge.\n\nSeverity is asymmetric by path family, and that asymmetry belongs in the contract because it is project-specific: off-scope writes to docs are usually warn, off-scope writes to scripts, migrations, or prod config are always block. Add a time_budget_minutes and a network_egress allowlist too. Files are a necessary scope dimension, not a sufficient one.',
      },
      {
        heading: 'Merging two contracts by least privilege',
        body: 'When a project-wide contract and a task contract both apply, the merge is mechanical: intersect allowed_files (both must permit the path), union forbidden_files (either can prohibit), take the minimum time budget, and accumulate approvals_required. For network_egress, None defers to the other side, two lists intersect, and deny-all stays deny-all.\n\nWrite that into the schema so the merge is reviewable rather than argued. Least privilege is only a principle until it is an operator you can run on two files.',
      },
    ],
    takeaways: [
      'A contract without forbidden globs is half a contract. The negative space carries most of the protection.',
      'Two altitudes: the scope contract bounds the task, feature_list.json bounds the project at one in_progress.',
      'Ship violation budgets and per-path severity, or the gate gets switched off the first week it blocks a deadline.',
      'Contracts merge by least privilege: intersect allowed, union forbidden, minimum budget, accumulate approvals.',
    ],
    terms: [
      { term: 'Scope contract', meaning: 'Per-task file listing allowed and forbidden globs, acceptance, rollback, and approvals.' },
      { term: 'Scope creep', meaning: 'Files changed in a task that the contract never permitted.' },
      { term: 'Feature list', meaning: 'The project backlog as an ordered file with exactly one feature in_progress.' },
      { term: 'Violation budget', meaning: 'An allowance of minor slips before the gate refuses, so the gate stays enabled.' },
      { term: 'Severity asymmetry', meaning: 'Off-scope writes to docs warn; off-scope writes to scripts or migrations block.' },
      { term: 'Least privilege merge', meaning: 'Two contracts combine by intersecting permissions and unioning prohibitions.' },
    ],
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
    readTime: '~8 min read',
    whyItMatters:
      'This is the difference between an agent reporting on reality and an agent reporting on its own expectations. Every command goes through one wrapper that writes a JSONL record: exact argv, deterministic head and tail truncation so a 50MB log cannot blow the context budget, exit code, wall-clock duration, and a one-line note of what the agent expected before it looked. The load-bearing rule is refuse-on-null: if there is no exit code, the loop may not claim progress. Null is a distinct state from zero, and your UI for a run should render it that way.',
    sections: [
      {
        heading: 'The problem: "all tests pass"',
        body: 'The agent says "running tests now". The next message says "all tests pass". The reality is that no test ran. Or it ran and nobody read the result. Or the result was read and the failing line got silently truncated away.\n\nAll three failures have the same shape: the agent is reacting to its prediction of the output instead of the output. Nothing in the loop distinguishes an imagined green run from a real one, because nothing in the loop is holding a captured exit code.',
      },
      {
        heading: 'What a feedback record holds',
        body: 'Seven fields. command as exact argv, so shell expansion cannot surprise you. stdout_tail and stderr_tail as separate deterministic tails. exit_code as the unambiguous success signal. duration_ms, which surfaces slow probes and runaway processes. started_at for replay. And agent_note, the one line the agent writes about what it expected before reading the result.\n\nThat last field is cheap and unusually diagnostic: comparing expectation against outcome is how you find the runs where the model was confidently wrong rather than merely unlucky.',
      },
      {
        heading: 'Truncation is deterministic, not sampled',
        body: 'A 50MB log destroys the loop. The runner keeps a head and a tail with an explicit "truncated N lines" marker in between, and the same output always produces the same record. No sampling, because sampling makes runs unreproducible and hides exactly the line you needed.\n\nHead plus tail is the right shape because the parts that matter (the invocation, then the final error and the summary) sit at the two ends. The middle of a test log is almost always the part you can afford to lose.',
      },
      {
        heading: 'Refuse to advance without feedback',
        body: 'If the runner errors before capturing an exit, the record carries exit_code null plus an error reason. The loop must not claim success on a null. No exit, no progress.\n\nThis is a three-state signal, not two: zero is success, non-zero is failure, null is "we do not know", and treating null as either of the others is how confident false reports get made. It is the same discipline as never collapsing loading, empty, and error into one state in a component.',
      },
      {
        heading: 'What hardens it for production',
        body: 'Redact at write, not at read, because the file on disk is what an attacker reaches: strip lines matching Bearer, password=, api_key=, AWS AKIA keys, Slack xox tokens, before the append. Rotate the JSONL at 1MB to .1 through .5 so the loader cost stays bounded while CI keeps the full set.\n\nAnd give every record a command_id, with retries carrying parent_command_id. Without that link, a retry chain reads as a series of independent successes and the audit quietly loses the failure history that explains the run.',
      },
    ],
    takeaways: [
      'Route every command through one wrapper. If the exit code is not in a file, it did not happen.',
      'Exit state is three-valued: zero, non-zero, and null. Null means unknown and must block progress, never pass as success.',
      'Truncate head plus tail deterministically. Sampling makes runs unreproducible and drops the failure line you needed.',
      'Redact at write time and chain retries with parent_command_id, or the audit shows successes where there was a struggle.',
    ],
    terms: [
      { term: 'Feedback record', meaning: 'A structured JSONL entry with argv, output tails, exit code, duration, and an agent note.' },
      { term: 'Refuse-on-null', meaning: 'The loop may not advance when exit_code is null, because unknown is not success.' },
      { term: 'Tail truncation', meaning: 'Deterministic head plus tail capture with an explicit marker, so records fit the token budget.' },
      { term: 'Agent note', meaning: 'The one-line prediction the agent writes before reading the actual result.' },
      { term: 'Telemetry split', meaning: 'Feedback serves the next turn; telemetry serves the operator later. Different files, different retention.' },
      { term: 'Retry chain', meaning: 'Records linked by parent_command_id so a sequence of attempts is not read as independent runs.' },
    ],
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
    readTime: '~8 min read',
    whyItMatters:
      'Acceptance is necessary and not sufficient, and that gap is where merged-then-regretted changes live. The gate confirms deterministic facts: acceptance ran, rules passed, scope held. The reviewer answers what the gate structurally cannot: did this solve the stated problem or a nearby one, were assumptions written down, is the handoff usable. Run it as a subagent with the builder\'s diff, state, feedback, and verdict as read-only inputs and a rubric as its only output. Same model is fine; the separation that matters is the inputs and the posture, not the weights.',
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
        body: 'You can run the reviewer on the same model as the builder. The discipline is the role: a different system prompt, a different input bundle, and no write access to the diff. Change the posture and you change the signal.\n\nThe reviewer reads the diff, the state, the feedback log, and the verdict, then writes a report. It does not patch anything. If the report says fix this, the next builder turn does the fix and the reviewer goes back to reviewing. Mixing the roles collapses the gap that was doing the work.',
      },
      {
        heading: 'Judges are biased in four measurable ways',
        body: 'Position bias: GPT-4 class judges are around 40 percent inconsistent when the same pair is presented as (A,B) versus (B,A). Verbosity bias inflates scores toward longer outputs by roughly 15 percent. Self-preference favours outputs from the same model family. Authority bias over-rates text that cites known names.\n\nMitigations are concrete: score both orderings and only count consistent wins, use a short scale that explicitly rewards concision, rotate judges across families, and strip author names before scoring. Then keep a calibration set of 10 to 20 historical tasks with known verdicts and refuse to ship a rubric change that drops agreement below 80 percent.',
      },
      {
        heading: 'What it looks like at scale',
        body: 'Cloudflare ran 131,246 review runs across 48,095 merge requests in 5,169 repos in 30 days, with a median review time of 3 minutes 39 seconds. Up to seven specialist reviewers (security, performance, code quality, docs, release management, compliance, an internal codex) ran in parallel under a coordinator that deduplicated findings and judged severity.\n\nThe tier split is the practical lesson: cheap models for the specialists, the strongest model reserved for the coordinator. One reviewer with a five-dimension rubric is right for a solo repo; specialists earn their keep once the codebase has distinct critical surfaces.',
      },
    ],
    takeaways: [
      'Never let the builder mark its own homework. Different prompt, different inputs, read-only on the diff, same model is fine.',
      'The gate and the reviewer split cleanly: deterministic facts to the gate, semantic judgment to the reviewer, no overlap.',
      'Design against the four judge biases up front: position, verbosity, self-preference, authority. Both orderings, short scales, rotated families.',
      'Keep a calibration set of 10 to 20 known verdicts. Below 80 percent agreement, the rubric ships nowhere.',
    ],
    terms: [
      { term: 'Reviewer rubric', meaning: 'Five dimensions scored 0 to 2, each with a written question rather than a vibe.' },
      { term: 'Soft fail', meaning: 'Total below 7. The builder gets findings to address and the task stays open.' },
      { term: 'Hard fail', meaning: 'Total below 5 or any dimension at 0. Halt and surface to a human.' },
      { term: 'Role separation', meaning: 'Same model, different system prompt, different inputs, no write access to the artifact.' },
      { term: 'Position bias', meaning: 'A judge scoring differently when the same two candidates are swapped in order.' },
      { term: 'Calibration set', meaning: 'Historical tasks with known correct verdicts, re-run on every rubric change.' },
    ],
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
    readTime: '~8 min read',
    whyItMatters:
      'You pay for a bad handoff every session for the life of the task. The next session rediscovers the same context, re-runs the same commands, and re-asks you the same questions, burning thirty minutes to recover thirty seconds. Two artifacts fix it and they are not the same artifact. The packet proves the next session knows where to start; the cleanup check proves the workbench is safe to leave. A perfect handoff written over a half-applied diff, a stray temp file, and a silent red test is a forwarded mess. And wrap up at 50 to 75 percent of the context budget, not at the wall.',
    sections: [
      {
        heading: 'The problem: "great, we made progress"',
        body: 'The session ends on a warm note. The next session opens and asks where we left off. The first agent\'s answer is gone: trimmed, compacted, or simply never written down anywhere durable.\n\nSo the next agent rediscovers the repo, re-runs the commands the last one already ran, re-asks the human the questions already answered, and burns half an hour recovering the last half minute of the previous session. That cost repeats every session, which is why it is worth automating rather than remembering.',
      },
      {
        heading: 'Seven fields, one of them load-bearing',
        body: 'summary, one paragraph of what was done. changed_files, the diff at a glance. commands_run, what actually executed. failed_attempts, what was tried and why it did not work. open_risks, what could bite next time, with severity. next_action, the first concrete step. verdict_pointer, paths to the verification and review reports.\n\nnext_action is the one that matters. A packet with all six others and no next_action is a status report. Useful, but the next session still has to decide where to start, which is exactly the expensive part.',
      },
      {
        heading: 'Generated, not written, in two forms',
        body: 'A hand-written handoff is a handoff that gets skipped on a hard day. The generator reads state, the verification verdict, the review report, and the feedback log, then emits the packet. The agent\'s job is to leave the workbench in a state the generator can summarize, not to compose a summary.\n\nTwo outputs from the same source: handoff.md for the human, handoff.json for the next agent. If they ever disagree, the JSON wins. The feedback log is trimmed to the last K entries plus every non-zero exit, so the packet stays small and the failures survive.',
      },
      {
        heading: 'Cleanup is a check, not a habit',
        body: 'Five checks before the packet is written. The working tree: everything committed or explicitly stashed with a note, because a half-applied diff reads as intentional work. Temp artifacts: no scratch dirs, no debug prints, no commented-out blocks polluting the diff. Tests: green, or red with the failure named in open_risks, because a silent red test is a trap. The feature board reflects reality. The branch is the expected one, no detached HEAD, no orphans.\n\nCleanup emits a clean_state.json of blocking issues, and an empty list is the precondition the generator asserts before writing anything.',
      },
      {
        heading: 'Handoff is not compaction',
        body: 'Compaction extends a session. A handoff closes one cleanly and starts the next in fresh context. The mistake is compressing until quality collapses; the fix is budgeting for an early clean exit at 50 to 75 percent of context rather than at 95.\n\nThe vendor mechanisms differ and do not matter: Codex CLI does a server-side compact with a local summary fallback, Claude Code runs five-stage progressive compaction at 95 percent, OpenCode hides by timestamp and summarizes under five headings. Same need underneath, so give the packet a branch, a last_known_good_commit, and a status of active, superseded, or archived. Exactly one active handoff per branch drives the next session.',
      },
    ],
    takeaways: [
      'A packet without next_action is a status report. The one concrete first step is the field that pays for the whole artifact.',
      'Generate the handoff from artifacts. Anything hand-written is the thing that gets skipped on the day it matters most.',
      'Cleanup is a separate check that gates the handoff: clean tree, no temp files, tests green or risks named, board accurate, right branch.',
      'End the session at 50 to 75 percent of context, not at 95. Cheap to write while context is intact, expensive after compression.',
    ],
    terms: [
      { term: 'Handoff packet', meaning: 'A generated artifact carrying the seven fields, emitted as both markdown and JSON.' },
      { term: 'next_action', meaning: 'The single concrete step that starts the next session, with no decision left to make.' },
      { term: 'Clean state check', meaning: 'The pre-handoff pass that proves the workbench is safe to leave, emitted as a blocking list.' },
      { term: 'Feedback trim', meaning: 'Last K records plus every non-zero exit, so the packet stays small and failures survive.' },
      { term: 'Compaction', meaning: 'In-place context compression that extends a session; distinct from closing one cleanly.' },
      { term: 'Handoff status', meaning: 'active, superseded, or archived. Exactly one active packet per branch drives the next session.' },
    ],
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
