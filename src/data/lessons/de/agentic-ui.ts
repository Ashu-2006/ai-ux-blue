import type { Lesson } from '@/lib/lessons';

// Design engineering · Agentic UI (7 lessons, hand-authored from vault notes)
// Source vault folder: Vault/20 Areas/Design Engineering/Agentic-UI
export const deAgenticUi: Lesson[] = [
  {
    id: 'de-au-agentic-loop',
    phase: 'Design engineering',
    part: 'Agentic UI',
    index: 'DE.AG.01',
    title: 'An agentic workflow is a four-part loop, and the design lives at the seams',
    oneLiner:
      'Plan, act, observe, reflect. The interesting UI is not any single stage, it is the transitions between them.',
    readTime: '~10 min read',
    diagram: '/lessons/de/de-au-agentic-loop.png',
    diagramCaption:
      'The four stages of the agent loop with the three seams between them, each seam labelled with the affordance a user needs there.',
    whyItMatters:
      'A chat UI treats the model as a text generator. An agent UI treats it as a worker that plans a task, calls tools, reads results, and decides whether to keep going. Each of the four stages needs its own affordance, and the seams between them are where a user sees, steers, or stops a run. Devin\'s plan-updated banner, Claude Code\'s collapsible tool-call block, and Cursor\'s inline diff review are three different answers to the same three seams. Design one screen instead of four surfaces plus three seams, and the product reads as opaque no matter how good the model underneath is.',
    learningObjectives: [
      'Name the four stages of the agent loop (plan, act, observe, reflect) and the seam between each pair.',
      'Design an editable task-tree affordance for the plan stage that a user can rewrite before commit.',
      'Compare how Devin, Claude Code, Cursor, and Warp render the act stage differently.',
      'Diagnose why a single "thinking" spinner fails as a state indicator across four distinct moments.',
      'Specify a plan-diff view for the reflect stage that surfaces drift instead of hiding it.',
    ],
    sections: [
      {
        heading: 'Chat was one generation, agent is four',
        body:
          'A 2020 completion API returned one block of text and stopped there, no matter how the task actually needed to unfold. 2022\'s ReAct prompting pattern taught a model to interleave reasoning and tool calls inside a single completion, still invisible to the user reading only the final answer. By 2023, AutoGPT and BabyAGI ran that interleaved loop unsupervised for hours at a stretch, and by 2025 the loop had become the default shape of a coding agent: Devin, Claude Code, and Warp\'s Agent Mode all run plan-act-observe-reflect as a named cycle with its own screen.\n\nWarp\'s Agents 3.0 update (November 2025) added a dedicated /plan step specifically because teams kept shipping the older three-stage version and losing users right at the handoff between planning and execution. Each generation added one more visible stage. The UI job did not get simpler, it got more surfaces to design well.',
      },
      {
        heading: 'The plan stage needs a legible task tree',
        body:
          'Before any tool runs, the agent proposes a sequence. That plan is not decoration, it is the contract the user is agreeing to. Render it as a checklist or a tree, not as prose. Devin uses a bulleted timeline with checkboxes that fill in as steps complete. Cursor Composer shows a numbered step list above the diff. Devin 2.0\'s Interactive Planning feature (shipped March 2025) goes further: within seconds of a session starting, Devin researches the codebase and drafts a plan the user can edit before a single tool call fires.\n\nThe plan needs three properties: each step has a verb, each step has a target (file, URL, table), and each step is editable before commit. If the user cannot rewrite step 3 before it runs, the plan is a status bar wearing a checklist costume, not a contract.',
      },
      {
        heading: 'The act stage is a live tool call, not a spinner',
        body:
          'While a step executes, show the tool name, the exact arguments, and the streaming output. A generic "thinking" spinner tells the user nothing and trains them to look away. Claude Code inlines the tool call as a collapsible block with the command and its stdout. LangGraph Studio shows node highlighting with the payload flowing in.\n\nWarp\'s Full Terminal Use (Agents 3.0, November 2025) is the sharpest version of this idea: the agent drives interactive, full-screen terminal programs, debuggers, database REPLs, `top`, in the foreground, so the user watches keystrokes land in real time rather than staring at a detached background job. The design job is making the argument object and the live process legible, not hiding either one behind a loading state.',
      },
      {
        heading: 'The observe stage is where the human intervenes',
        body:
          'After a tool returns, the agent reads the result and picks the next step. This is the most decisive moment for the user, because a wrong observation compounds into a wrong plan two steps later. Give observations a distinct treatment from raw tool output: quoted, dimmed, with an inline "correct this" affordance. Cursor\'s inline diff review is the reference pattern here, the user accepts, rejects, or edits the model\'s interpretation before it becomes the next input.\n\nWarp\'s Interactive Code Review (November 2025) extends the same idea past the live run: a user leaves inline comments on the agent\'s finished diff and the agent addresses them in one pass, which is an observe-stage correction applied retroactively to code the agent already wrote. Without an intervene-on-observe hook somewhere in the flow, the loop is fully autonomous and the user is a spectator.',
      },
      {
        heading: 'The reflect stage decides whether to loop or stop',
        body:
          'At the end of each cycle the agent asks itself whether it is done. That decision needs surfacing: the completion criterion being checked, the confidence, and whether the plan updated. If the plan changed, diff it against the previous version so the user sees which steps were added, dropped, or reordered. Devin shows this as a plan-updated banner with the delta spelled out.\n\nWarp\'s /plan feature versions every edit: each change to the plan creates a new entry so the whole history is diffable, and the plan itself can be attached to a pull request for teammates who were not in the session. Without a reflect-stage surface, plan drift is invisible until the run has burned an hour and produced the wrong artifact.',
      },
      {
        heading: 'The three seams, side by side',
        body:
          'The stages get most of the design attention, but the seams are where trust actually breaks.\n\n| Seam | What fails silently | Fix | Product example |\n| --- | --- | --- | --- |\n| plan to act | user never really approved | editable tree, explicit start click | Devin Interactive Planning |\n| act to observe | wrong result quietly believed | quoted, dimmed observation + correct-this | Cursor inline diff review |\n| observe to reflect | plan drifts unnoticed | plan diff, plan-updated banner | Devin plan-updated banner, Warp /plan versions |\n\nEach row is a place where an autonomous system can go wrong without telling anyone. A seam with no affordance is a seam where the user finds out only after the fact.',
      },
      {
        heading: 'What a silent seam actually costs',
        body:
          'Warp 2.0 scored 52 percent on Terminal-Bench and 71 percent on SWE-bench Verified at launch, the best public numbers in the category at the time. Read those numbers straight: even the top agent gets roughly a third to a half of scored tasks wrong. A run given "fix this flaky CI test" with no visible stop criterion can re-run the same failing assertion forty times before anyone notices it never had a real completion check, burning an hour of compute on nothing.\n\nAt failure rates like that, the reflect stage is not decoration, it is where most wasted runs get caught if the UI surfaces the stop criterion, or wasted in full if it does not. A visible seam turns a 50 percent failure rate into a fast correction. An invisible one turns it into an hour lost per bad run.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-au-loop-seams.svg',
        alt: 'The three seams of the agent loop',
        caption: 'Plan, act, observe, and reflect as four boxes on a timeline, with the three seams between them each carrying a labelled affordance.',
        diagramBrief:
          'ASCII-style layout: four boxes left to right labelled PLAN, ACT, OBSERVE, REFLECT, connected by three arrows. Under each arrow, a small label naming the seam affordance: "editable tree + start click", "quoted observation + correct-this", "plan diff". Style: cream paper background (#faf6ef), monochrome ink, one accent color highlighting the three arrows (not the boxes). Aspect 16:9.',
      },
      {
        src: '/lessons/de/de-au-loop-comparison.svg',
        alt: 'One spinner versus four surfaces',
        caption: 'The same agent run rendered as a single spinner, and rendered as four distinct surfaces with a seam affordance at each transition.',
        diagramBrief:
          'Two stacked panels. Top panel: a single circular spinner icon with the caption "one state for 47 seconds". Bottom panel: the same 47 seconds split into four labelled blocks of proportional width (plan, act, observe, reflect) each with a tiny icon (checklist, terminal, magnifying glass, diff). Style: cream paper, black ink, one accent color on the bottom panel only to show the contrast. Aspect 4:3.',
      },
    ],
    takeaways: [
      'The loop has four stages, and each one needs its own affordance, not a shared spinner.',
      'The plan is a contract the user agrees to. Make it editable before commit.',
      'Tool calls render with arguments and streaming stdout. No generic "thinking" states.',
      'Observation is where humans steer. Give it a distinct treatment and an intervene hook.',
    ],
    terms: [
      { term: 'Agent loop', gloss: '"the AI thinking"', meaning: 'The named plan, act, observe, reflect cycle that repeats until a stop condition fires; each stage is a distinct UI state, not one undifferentiated wait.' },
      { term: 'Task tree', gloss: '"the plan"', meaning: 'The hierarchical, editable sequence of steps an agent proposes before executing anything, rendered as a checklist rather than a paragraph.' },
      { term: 'Tool call', gloss: '"the agent doing something"', meaning: 'A structured invocation of an external capability with named arguments, distinct from the model\'s own text generation.' },
      { term: 'Observation', gloss: '"the result"', meaning: 'The agent\'s interpretation of a tool\'s output, which can be wrong even when the tool itself returned correct data.' },
      { term: 'Plan drift', gloss: '"it changed its mind"', meaning: 'Silent divergence between the plan a user approved and the plan actually running, invisible without an explicit diff.' },
      { term: 'Intervene hook', gloss: '"a way to stop it"', meaning: 'A UI affordance placed at a specific seam that lets a user edit or reject an agent\'s decision before it becomes the next input.' },
      { term: 'Seam', gloss: '"the boring transition part"', meaning: 'The moment between two loop stages where control changes hands; most trust failures happen here, not inside a stage.' },
      { term: 'ReAct pattern', gloss: '"the model thinks then acts"', meaning: 'The 2022 prompting technique that interleaves a reasoning trace with tool calls inside one completion; the direct ancestor of today\'s visible agent loop.' },
      { term: 'Stop condition', gloss: '"when it\'s done"', meaning: 'The explicit criterion (test passed, user approved, budget exhausted) the reflect stage checks before deciding whether to loop again.' },
      { term: 'Interactive Planning', gloss: '"Devin makes a plan"', meaning: 'A Devin 2.0 feature (March 2025) that researches the codebase and drafts an editable plan within seconds of a session starting, before any tool call fires.' },
      { term: 'Full Terminal Use', gloss: '"the agent runs commands"', meaning: 'A Warp capability (Agents 3.0, November 2025) that lets the agent drive interactive, full-screen terminal programs like debuggers in the foreground instead of firing detached background commands.' },
      { term: 'Human in the loop', gloss: '"a person checks it"', meaning: 'An agent design pattern that yields control to a human at defined checkpoints rather than running fully unattended end to end.' },
    ],
    demoCaption:
      'Step through one cycle. Each stage lights its own affordance, and the seams between them are where the user gets to see, steer, or stop the run.',
    demo: {
      archetype: 'sequence',
      subject: 'Agent run · one full cycle',
      badLabel: 'One spinner',
      goodLabel: 'Four seams',
      badSequence: [
        'user asks the agent to do something',
        'spinner turns on for the whole run',
        'a wall of prose scrolls past',
        'a green check appears at the end',
        'user has no idea what actually happened',
      ],
      goodSequence: [
        'plan renders as an editable task tree, user rewrites step 3',
        'act stage shows the tool name, arguments, and streaming stdout',
        'observation is quoted and dimmed, with a correct-this affordance',
        'reflect stage diffs the new plan against the previous one',
        'each seam offers an intervene point before the next stage starts',
      ],
      badCaption:
        'A single spinner collapses four different moments into one opaque state. The user cannot edit the plan, cannot see the tool arguments, cannot correct the observation, and cannot notice plan drift, so the only feedback is whether the final artifact happened to be right.',
      goodCaption:
        'Rendering plan, act, observe, and reflect as four distinct surfaces with an intervene hook at every seam turns an autonomous loop into a steerable one. The user reads the contract before commit, corrects the observation before it compounds, and sees plan drift as a diff instead of a surprise.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'an agent is a four-part loop, not a chat with extra steps.',
        body:
          'an agent is a four-part loop, not a chat with extra steps.\n\nplan: a task tree the user should be able to edit before commit.\nact: a tool call with arguments and streaming stdout, no generic spinner.\nobserve: the agent\'s read of the result, editable before it becomes the next input.\nreflect: does the plan need to change, and if it did, diff it.\n\nthe UI job is the three seams between those stages. that is where users see, steer, or stop.',
      },
      {
        kind: 'X · design angle',
        hook: 'every agent UI I dislike has one spinner covering four different moments.',
        body:
          'every agent UI I dislike has one spinner covering four different moments.\n\nplan needs a legible tree. act needs the tool call visible. observe needs a correct-this hook. reflect needs a plan diff.\n\ncollapse them all into "thinking..." and you have shipped a status bar. the model can be excellent and the product will still feel opaque.',
      },
      {
        kind: 'X · one-liner',
        hook: 'the plan is a contract, not a loading state.',
        body:
          'the plan is a contract, not a loading state.\n\nif the user cannot rewrite step 3 before it runs, you did not ship a plan. you shipped a fancier spinner.',
      },
    ],
    exercises: [
      { level: 'easy', prompt: 'List the four stages of the agent loop and name one product (Devin, Claude Code, Cursor, or Warp) that renders each stage most visibly.' },
      { level: 'medium', prompt: 'A coding agent runs for 47 minutes and its plan silently grows from 4 approved steps to 10. Design the smallest UI change that would have surfaced that drift at minute 12 instead of minute 47.' },
      { level: 'medium', prompt: 'Warp 2.0 scores 52 percent on Terminal-Bench, meaning roughly half of scored tasks fail outright. Given that failure rate, decide where you would place a mandatory pause: after every tool call, or only at the reflect stage. Justify the choice in two sentences.' },
      { level: 'hard', prompt: 'Sketch the exact visual difference between a "still running" state and a "paused, awaiting your approval" state. List three properties beyond color that must differ.' },
      { level: 'design', prompt: 'Design the plan-stage screen for an agent that files expense reports. Each step has a verb and a target. Show what changes on screen the instant the user edits step 3, and what confirms the edit was received before the agent proceeds.' },
    ],
    furtherReading: [
      { label: 'Devin 2.0 announcement (Cognition)', url: 'https://cognition.com/blog/devin-2', why: 'Interactive Planning, Devin Search, and Devin Wiki are the plan and reflect stages shipped as named, dated product features.' },
      { label: 'Warp 2.0: the Agentic Development Environment', url: 'https://www.warp.dev/blog/reimagining-coding-agentic-development-environment', why: 'The management UI for running multiple concurrent agent loops, and the source of the Terminal-Bench and SWE-bench numbers used here.' },
      { label: 'Warp Agents 3.0: Full Terminal Use, /plan, Interactive Code Review', url: 'https://www.warp.dev/blog/agents-3-full-terminal-use-plan-code-review-integration', why: 'The concrete act-stage and observe-stage features (Full Terminal Use, Interactive Code Review) referenced in this lesson.' },
      { label: 'ReAct: Synergizing Reasoning and Acting in Language Models (arXiv:2210.03629)', url: 'https://arxiv.org/abs/2210.03629', why: 'The 2022 paper behind the interleaved reasoning-and-acting pattern the modern agent loop descends from.' },
      { label: 'Claude Code documentation', url: 'https://docs.claude.com/en/docs/claude-code', why: 'Reference implementation of an act-stage tool-call block and an Escape-to-cancel affordance.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Agent loop UI review checklist',
      body:
        '- Does the plan stage show each step as an editable verb plus target before commit?\n- Does the act stage show the tool name and arguments, or just a spinner?\n- Is the observation rendered distinctly from raw tool output, with a correct-this affordance?\n- Does the reflect stage show its stop criterion and diff the plan when it changes?\n- Can a new user point at any screen in the flow and say which of the four stages they are looking at?\n- Is there at least one intervene hook at each of the three seams, not just at the very end?',
    },
    source: {
      label: 'Vault note: An agentic workflow is a four-part loop, and the design lives at the seams',
      url: 'https://cognition.ai',
    },
  },
  {
    id: 'de-au-action-schema',
    phase: 'Design engineering',
    part: 'Agentic UI',
    index: 'DE.AG.02',
    title: 'The action schema is the permission surface',
    oneLiner:
      'The tools you expose to an agent become, field for field, the permission prompt your user sees. Design the schema and you have designed the modal.',
    readTime: '~10 min read',
    diagram: '/lessons/de/de-au-action-schema.png',
    diagramCaption:
      'A tool schema translated into a permission modal: name to title, description to body, typed arguments to field labels with the right treatment per type.',
    whyItMatters:
      'Every action an agent can take is declared in a JSON schema: name, description, typed arguments, and since March 2025, a set of MCP annotations (readOnlyHint, destructiveHint, idempotentHint, openWorldHint) that flag risk directly. That schema is not a backend concern, it is the copy on the confirmation dialog that lists what is about to be deleted before a destructive tool call fires. If the schema says execute_bash(cmd: string), the prompt will say exactly that, and the user has to guess whether the command is safe. Treat the schema as UX writing: the description is the modal body, the argument names are the field labels, and the hints are the color of the button.',
    learningObjectives: [
      'Rewrite a vague tool name into a concrete-verb name and predict how the permission prompt changes.',
      'Map MCP\'s four ToolAnnotations hints (readOnlyHint, destructiveHint, idempotentHint, openWorldHint) to their default values and to a specific client behavior.',
      'Group a set of five example tools into consent scopes at a sensible altitude.',
      'Explain why a hint from an untrusted server cannot be trusted the same way as one from a trusted server.',
      'Design a permission prompt for a destructive tool call that differs visibly from a read-only one.',
    ],
    sections: [
      {
        heading: 'A vague tool name yields a vague permission prompt',
        body:
          '`run_command` tells the user nothing. `read_calendar_event(event_id)` tells them exactly what will happen and what data is involved. Claude Desktop\'s MCP permission prompts render the tool name verbatim, followed by the arguments as a key-value list, no rewriting in between. If the name is a shrug, the prompt is a shrug, and the user either rubber stamps everything or panics and denies everything. Neither is consent.\n\nSplit broad tools into narrower ones with concrete verbs. `read_calendar_event` and `create_calendar_event` beat one flexible `calendar_action(type, payload)` every time on the permission surface, because the second one forces every reviewer to open the payload to know what is actually happening.',
      },
      {
        heading: 'Typed arguments become the field labels users read',
        body:
          'If a tool takes `body: string`, the modal shows one long blob and the user scans past it. If it takes `to: EmailAddress, subject: string, body: string`, the modal renders three labeled fields and the user reads the recipient first. Use narrow types (enums, tagged unions, branded strings) so the UI can render each field with the right treatment: an `amount: MoneyCents` gets currency formatting, a `destination: \'staging\' | \'prod\'` gets a colored chip.\n\nThe schema is where accessibility, formatting, and risk framing all originate at once. A designer who never touches the backend still owns this surface, because every argument name and type they request from an engineer becomes a label a real user reads under time pressure.',
      },
      {
        heading: 'MCP gives destructive intent a real field, not a naming convention',
        body:
          'The Model Context Protocol shipped `ToolAnnotations` in its 2025-03-26 spec revision: four boolean hints, `readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`, attached to every tool definition. The defaults are deliberately pessimistic: `destructiveHint` defaults to true and `readOnlyHint` defaults to false, so a tool with no annotations at all is assumed to be non-read-only, potentially destructive, and reaching outside the local environment.\n\nThis matters for UI because it is a structured field a client can act on directly: `readOnlyHint: true` from a trusted server can skip the confirmation dialog, `destructiveHint: true` can trigger a warning before execution. But every property is a hint, not a guarantee, an untrusted server can claim `readOnlyHint: true` and delete files anyway, so a client still has to treat annotations from unverified servers as informational only.',
      },
      {
        heading: 'Scopes group tools into consent bundles at the right altitude',
        body:
          'Asking permission for every single tool call is death by modal. Grouping tools into scopes (read files, write files, run code) lets the user grant once at the altitude they actually think about consent. Claude Code makes this concrete with named permission modes: `default` prompts on first use of each tool, `acceptEdits` auto-approves file edits and common filesystem commands inside the working directory, `plan` allows reads and exploration only, `auto` runs everything behind a background safety classifier, and `bypassPermissions` skips checks entirely except for a hard-coded circuit breaker on commands like `rm -rf /`.\n\nThat is five distinct altitudes for the same underlying question ("what can this agent do without asking me"), and the right default changes with the task: `plan` for exploring an unfamiliar repo, `acceptEdits` for iterating on code you are actively reviewing.',
      },
      {
        heading: 'Destructive actions need a different treatment than idempotent ones',
        body:
          'Reading a file and deleting a file are not the same class of risk, and the schema should mark that difference explicitly rather than leaving it to the reader\'s judgment. Cursor\'s tool approval modal separates safe, auto-approved tools from destructive ones that always prompt, mirroring MCP\'s `destructiveHint` and `idempotentHint` fields.\n\nThe UI should render those prompts differently: a red accent, a typed confirmation ("type DELETE to confirm"), an undo window where the underlying system allows one. Without this split, the sixth identical modal in a row conditions the user to click Approve on the seventh, which is the one that drops the production table.',
      },
      {
        heading: 'From OAuth scopes to tool annotations, the arc',
        body:
          'The shape is not new, only the object being described has changed. 2007\'s OAuth introduced delegated scopes so a third-party app could request "read your contacts" instead of your whole account. The 2010s brought mobile permission dialogs (iOS, Android) that surfaced the same idea per-capability at install or first use. 2023 gave us OpenAI\'s plugin manifest, a JSON file per plugin describing its endpoints for a model to call. 2024\'s MCP standardized the tool schema itself as the unit of trust across any agent client. 2025\'s ToolAnnotations added the four boolean hints described above, and by 2026 the MCP maintainers had already fielded five community proposals for new annotations, evidence that the community keeps finding more places where risk needs its own field rather than a naming convention.',
      },
      {
        heading: 'A hint is not a contract, and the UI has to remember that',
        body:
          'MCP\'s own maintainers are explicit: annotations are hints, not guarantees, and a client must treat hints from an untrusted server as informational only, never as the actual safety boundary. The practical UI implication is that a green "safe" badge on a tool call is a convenience for a trusted server, and a trap if it is rendered identically for an unverified one.\n\nThe real safety guarantee has to live somewhere else: an authorization layer, a sandbox, or a deterministic allow-list, the same way Claude Code\'s `permissions.deny` rule blocks an action before any classifier or hint is even consulted. Design the badge to communicate confidence, and design the actual gate to not depend on the badge being honest.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-au-schema-to-modal.svg',
        alt: 'A tool schema mapped field by field to a permission modal',
        caption: 'Each field in a tool schema (name, description, typed argument, annotation) lands on a specific piece of the permission modal.',
        diagramBrief:
          'Two columns connected by arrows. Left column: a JSON-schema-style block listing name, description, an argument with its type, and destructiveHint: true. Right column: a mockup permission modal with a title, body text, a labeled field with a colored chip, and a red confirmation button. Draw an arrow from each left item to the matching right element. Style: cream paper (#faf6ef), monochrome ink, one red accent on the destructiveHint arrow and confirm button only. Aspect 16:9.',
      },
      {
        src: '/lessons/de/de-au-hint-defaults.svg',
        alt: 'The four MCP ToolAnnotations hints and their pessimistic defaults',
        caption: 'MCP assumes the worst until a server says otherwise: every hint defaults toward "ask the user."',
        diagramBrief:
          'A small 4-row table rendered as a diagram. Columns: Hint name, Default value, What it means. Rows: readOnlyHint / false / "may modify things", destructiveHint / true / "assume destructive", idempotentHint / false / "not safe to retry", openWorldHint / true / "reaches outside". Style: cream paper, black ink, monospace-style font for hint names, one accent color highlighting the Default column since that is the point of the diagram. Aspect 4:3.',
      },
    ],
    takeaways: [
      'The tool schema is user-facing copy. Write it like a form label, not like an internal API.',
      'Narrow types, not stringly typed blobs. Enums and tagged unions become chips and colored labels.',
      'Group tools into scopes at the altitude the user actually thinks about consent.',
      'Mark destructive actions in the schema so the UI can prompt differently.',
    ],
    terms: [
      { term: 'Tool schema', gloss: '"the API spec"', meaning: 'The typed declaration of an action\'s name, description, and arguments that a client renders directly into a user-facing prompt.' },
      { term: 'Permission prompt', gloss: '"the popup"', meaning: 'The modal or inline consent surface that renders a tool call for a user\'s approval before it executes.' },
      { term: 'Scope', gloss: '"a permission"', meaning: 'A bundle of related tools granted together with a single consent, at a granularity the user can actually reason about.' },
      { term: 'Consent altitude', gloss: '"how much you\'re agreeing to"', meaning: 'The level of granularity at which a user thinks about permission: per session, per action, or per bundle.' },
      { term: 'Destructive action', gloss: '"something risky"', meaning: 'A tool call that cannot be undone or that changes state irreversibly, distinct from an additive or read-only one.' },
      { term: 'Rubber stamping', gloss: '"clicking approve without reading"', meaning: 'The failure mode where a run of identical, uninformative prompts trains a user to always approve, including the one that matters.' },
      { term: 'ToolAnnotations', gloss: '"the safety flags"', meaning: 'MCP\'s four boolean hints (readOnlyHint, destructiveHint, idempotentHint, openWorldHint), shipped in the 2025-03-26 spec, attached to a tool definition.' },
      { term: 'destructiveHint', gloss: '"this one is dangerous"', meaning: 'The MCP annotation that defaults to true, meaning a tool is assumed destructive unless the server explicitly marks it false.' },
      { term: 'Permission mode', gloss: '"the safety setting"', meaning: 'A named, switchable trust level (Claude Code\'s default, acceptEdits, plan, auto, dontAsk, bypassPermissions) that decides which actions run without asking.' },
      { term: 'Trust boundary', gloss: '"where the danger starts"', meaning: 'The point past which content or a tool call is treated as coming from an unverified source, informing openWorldHint-style decisions.' },
      { term: 'Consent bundle', gloss: '"a group of permissions"', meaning: 'A named set of scopes (read email, write files) granted together so the user is not asked forty separate times for related actions.' },
      { term: 'Circuit breaker', gloss: '"the hard stop"', meaning: 'A rule that forces a prompt or blocks an action unconditionally, regardless of permission mode, for the small set of actions that must never run silently.' },
    ],
    demoCaption:
      'Peel back the friendly "Run task" summary and the JSON schema underneath is the copy on the permission modal. Every field name, every type, every scope shows up in the prompt whether the designer edited it or not.',
    demo: {
      archetype: 'reveal',
      subject: 'Permission prompt · what is under the button',
      opaqueLabel: 'Approve · The agent wants to run a task',
      revealedLines: [
        'tool: send_transactional_email (destructive: true, scope: write.email)',
        'to: EmailAddress = "board@company.com"',
        'subject: string = "Q3 numbers revised"',
        'body: string = "..." (14 lines)',
        'attachment: FileRef = report-q3-v7.pdf (2.1 MB)',
        'this tool is marked destructive · confirmation required',
      ],
      badCaption:
        'A generic "Run task" button is the permission surface most users see. It hides the tool name, the recipient, the destructive flag, and the scope, so the click is not consent, it is compliance.',
      goodCaption:
        'The JSON schema underneath is already the modal copy. Concrete verb, typed arguments rendered per type, an explicit destructive flag, and a scope name that maps to the consent bundle the user granted. Designed as UX writing, the schema becomes a prompt a non-engineer can actually read.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'the JSON schema for your tools is the copy on your permission modal.',
        body:
          'the JSON schema for your tools is the copy on your permission modal.\n\ntool name becomes the modal title. description becomes the body. typed arguments become the field labels. destructive: true becomes the red confirmation.\n\nMCP and Claude Desktop render this literally. rename run_command to read_calendar_event(event_id) and the prompt gets readable, no UI work required.',
      },
      {
        kind: 'X · design angle',
        hook: 'agent governance UX starts three layers before the modal, in the tool schema.',
        body:
          'agent governance UX starts three layers before the modal, in the tool schema.\n\nvague names → vague prompts → rubber-stamped approvals.\nblob strings → unreadable payloads → users scan past.\nno destructive flag → the sixth modal trains the seventh click.\n\nif the schema is the copy, the API author is a UX writer whether they know it or not. tools change, prompts follow, governance moves.',
      },
      {
        kind: 'X · one-liner',
        hook: 'you cannot design your way out of a bad tool name.',
        body:
          'you cannot design your way out of a bad tool name.\n\nrun_command will read as run_command in the permission prompt, no matter what you put around it. the schema is the copy.',
      },
    ],
    exercises: [
      { level: 'easy', prompt: 'Rewrite `run_command(cmd: string)` as two narrower tools with concrete verbs, and predict how each permission prompt changes.' },
      { level: 'medium', prompt: 'A tool ships with no ToolAnnotations at all. State the default value MCP assumes for each of the four hints, and what a cautious client should do about the confirmation dialog as a result.' },
      { level: 'medium', prompt: 'Group these five tools into sensible consent scopes: read_file, write_file, delete_file, send_email, read_email. Name each scope and say which ones you would grant once per session versus prompt every time.' },
      { level: 'hard', prompt: 'A tool from an unverified third-party MCP server declares `readOnlyHint: true`. Explain in two sentences why a client still cannot skip its confirmation dialog based on that hint alone, and what should gate the decision instead.' },
      { level: 'design', prompt: 'Design two permission prompts for the same underlying action (delete a file) at two different destructiveHint values, one where the file is in a scratch folder and one where it is in a production bucket. Show what visibly differs beyond the accent color.' },
    ],
    furtherReading: [
      { label: 'MCP: Tools specification', url: 'https://modelcontextprotocol.info/specification/draft/server/tools/', why: 'The primary spec for how a tool\'s name, description, and inputSchema are defined and transmitted to a client.' },
      { label: 'Tool Annotations as Risk Vocabulary (MCP blog, March 2026)', url: 'https://blog.modelcontextprotocol.io/posts/2026-03-16-tool-annotations/', why: 'The authoritative source on ToolAnnotations defaults, what a hint can and cannot be trusted to do, and where the ecosystem is taking it next.' },
      { label: 'Claude Code: Permissions', url: 'https://code.claude.com/docs/en/permissions', why: 'A real, current implementation of scope-like permission modes (default, acceptEdits, plan, auto, dontAsk, bypassPermissions) at production scale.' },
      { label: 'Claude Code: Choose a permission mode', url: 'https://code.claude.com/docs/en/permission-modes', why: 'Shows the exact UI labels and switching mechanics (Shift+Tab cycling, status bar) for a multi-altitude consent system.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Tool schema UX review checklist',
      body:
        '- Does every tool name read as a concrete verb plus target, not a generic action?\n- Are string blobs replaced with typed, narrow arguments (enums, tagged unions, branded strings) wherever possible?\n- Does every tool declare readOnlyHint, destructiveHint, idempotentHint, and openWorldHint explicitly, rather than relying on defaults?\n- Are destructive tools rendered with a visibly different confirmation than read-only ones?\n- Are tools grouped into scopes at an altitude a non-engineer would actually recognize as one decision?\n- Does the client treat hints from unverified servers as informational only, with the real safety gate living elsewhere?',
    },
    source: {
      label: 'Vault note: The action schema is the permission surface',
      url: 'https://modelcontextprotocol.io',
    },
  },
  {
    id: 'de-au-trace-ui',
    phase: 'Design engineering',
    part: 'Agentic UI',
    index: 'DE.AG.03',
    title: 'Trace UI is the audit log a non-engineer can replay',
    oneLiner:
      'A trace turns an agent run into a scrubbable timeline of steps, inputs, and outputs. Done well, a PM or ops lead can figure out what went wrong without opening the code.',
    readTime: '~10 min read',
    diagram: '/lessons/de/de-au-trace-ui.png',
    diagramCaption:
      'A span tree as a waterfall: the "answer question" span contains retrieve, which contains three vector searches, each with a duration bar and an input and output pane.',
    whyItMatters:
      'Agents fail in ways stack traces do not capture. The model chose the wrong tool, the tool got the right result but the observation was misread, the plan updated in a way nobody noticed. A trace UI (LangSmith, Langfuse, Braintrust) is the surface that makes those failures debuggable by the people closest to the customer, and the click that opens a span\'s input and output panes is the exact moment a PM stops asking an engineer "why did it do that." At 2026 pricing, Langfuse runs roughly $101 a month self-hosted at one million events while LangSmith runs roughly $2,514 a month at one million traces, a 25x spread that is really a spread in how much polish the trace surface itself is worth to a team.',
    learningObjectives: [
      'Explain why a trace is modeled as a tree of nested spans rather than a flat log.',
      'Design an input/output pane for a span that a non-engineer can read without parsing raw JSON.',
      'Compare LangSmith, Langfuse, and Braintrust by center of gravity, not by feature checklist.',
      'Specify the filters a trace list needs before it survives ten thousand traces instead of ten.',
      'Decide where an evaluation score belongs in a trace UI so a failing example is one click away.',
    ],
    sections: [
      {
        heading: 'A trace is a tree of spans, not a flat log',
        body:
          'Each step in the agent loop is a span with a start, end, input, and output. Spans nest: an "answer question" span contains a "retrieve documents" span, which contains three "vector search" spans. Render this as a collapsible left rail with duration bars, the way Chrome DevTools shows waterfalls. Flat logs force the reader to reconstruct the hierarchy in their head.\n\nLangSmith and Langfuse both use the span tree as their primary control, and reviewers consistently rate LangSmith\'s tree the most polished of the major platforms for deeply nested agent traces. The tree is what turns "the agent took 47 seconds" into "step 3 spent 41 of those seconds in retrieval," which is the difference between a status update and a diagnosis.',
      },
      {
        heading: 'Every span needs input and output as first class views',
        body:
          'Clicking a span should open two panes: what went in and what came out. Not a raw JSON blob, but pretty printed with syntax highlighting, collapsible arrays, and a copy button on each field. If the input is a prompt, render markdown. If the output is a tool result, render the schema.\n\nBraintrust does this well with side by side prompt and completion views and a diff mode for comparing runs, reflecting its eval-first center of gravity: the whole product treats a prompt change as an experiment, so the input/output pane is built to support comparison, not just inspection. The design goal is that a non-engineer can read a span the way they would read an email thread, no mental parsing required.',
      },
      {
        heading: 'Filtering and search separate a demo from production use',
        body:
          'One trace is a demo. Ten thousand traces need filters: by user, by tool, by cost, by latency, by error, by evaluator score. The trace list is a data table with saved views, not a scroll. Langfuse\'s framework-agnostic, OpenTelemetry-native ingestion means it can sit under any stack and still expose the same faceted filters over the resulting traces.\n\nWithout this list-level tooling, the trace UI becomes write only: engineers export to CSV and read there, and the product surface effectively dies for anyone who is not an engineer. Half the real work in building trace UI is the list view, not the detail view underneath it.',
      },
      {
        heading: 'Evaluations belong on the trace, not in a separate dashboard',
        body:
          'An evaluation score (was the answer correct, did it hallucinate, did it follow instructions) is metadata on a specific span or run. Render it inline as a badge on the trace list and as a panel on the detail view. Braintrust\'s whole architecture is built around this: its CI-integrated evaluation gates can block a merge on a statistically significant regression, not merely log that quality dropped, because the eval score and the trace live in the same object from the start.\n\nSeparating eval dashboards from traces forces a context switch and hides the exact example that failed, which is the one thing needed to fix it. If a score cannot be clicked straight into the trace that produced it, the dashboard is decoration.',
      },
      {
        heading: 'Three tools, three centers of gravity',
        body:
          'The three major platforms optimize for different jobs, and the choice is really about which job matters most to a given team.\n\n| Platform | Center of gravity | Self-host | Rough cost at 1M events/traces per month |\n| --- | --- | --- | --- |\n| LangSmith | Deepest LangChain/LangGraph integration, most polished agent visualization | No, cloud only | ~$2,514/mo |\n| Langfuse | Framework-agnostic, OpenTelemetry-native, MIT open source | Yes, free | ~$101/mo managed, $0 self-hosted |\n| Braintrust | Evaluation-first: datasets, scorers, and CI regression gates | Hybrid, enterprise-only | Billed by processed data (GB), no hard cap |\n\nA team all-in on LangChain gets the deepest zero-config tracing from LangSmith. A team that wants to own its data gets Langfuse at a fraction of the cost. A team whose real bottleneck is "did this prompt change actually help" gets Braintrust\'s regression gates.',
      },
      {
        heading: 'Self-hosting a trace surface is a governance decision, not just a cost one',
        body:
          'Whether a trace platform can be self-hosted changes what a company can promise about where customer data lives. Langfuse is MIT licensed with a near-complete self-host build; only organization creators, an instance management API, and UI customization stay enterprise-gated. LangSmith offers no self-host option below an enterprise sales conversation, full stop.\n\nFor a team with data residency requirements, that difference decides the vendor before a single feature comparison happens. For a design engineer, the lesson generalizes: when picking any tool that will hold a customer\'s data, the licensing and hosting model is a product decision with UX consequences (can support look at a specific trace, can a customer audit their own data), not a line item for procurement alone.',
      },
      {
        heading: 'From print statements to span trees, the arc',
        body:
          'Debugging an LLM app in 2020 meant scattered print statements around an OpenAI completion call. 2022 brought OpenTelemetry-style distributed tracing, built for microservices, adapted awkwardly to single long LLM calls. 2023 saw LangSmith launch as the first dedicated LLM trace UI, tightly coupled to LangChain\'s own primitives. 2024 brought Langfuse\'s open-source rise, driven partly by LangChain removing its old free tier and pushing a visible wave of users toward self-hosting.\n\n2025 to 2026 brought eval-native platforms like Braintrust that treat a trace as one input to a regression test, not an end in itself, and the market has settled into three real centers of gravity rather than one dominant tool.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-au-span-waterfall.svg',
        alt: 'A waterfall diagram of nested agent spans',
        caption: 'Answer_question contains retrieve, which contains three vector searches, each drawn as a duration bar proportional to its time spent.',
        diagramBrief:
          'A horizontal waterfall chart: top row is a wide bar labelled "answer_question · 47.3s". Below and indented, a slightly narrower bar labelled "retrieve · 41.1s" starting a bit later. Below that, three thin bars labelled "vector_search 1/2/3" each roughly a third of the retrieve bar\'s width, staggered slightly. Style: cream paper background, black ink bars, one accent color highlighting the retrieve bar since it is the bottleneck. Aspect 16:9.',
      },
      {
        src: '/lessons/de/de-au-trace-tool-comparison.svg',
        alt: 'LangSmith, Langfuse, and Braintrust positioned by center of gravity',
        caption: 'Three platforms, three different bets: deepest integration, cheapest and most open, or eval-first with regression gates.',
        diagramBrief:
          'Three columns as simple cards, each with a platform name as header. LangSmith card: icon of a tightly coupled chain-link, subtext "LangChain-native, ~$2,514/mo at 1M traces". Langfuse card: icon of an open padlock, subtext "MIT open source, ~$101/mo at 1M events, self-host free". Braintrust card: icon of a checkmark/gate, subtext "eval-first, blocks bad merges". Style: cream paper, monochrome ink, one accent color per card header to visually separate the three. Aspect 3:2.',
      },
    ],
    takeaways: [
      'Traces are span trees, not flat logs. Render the hierarchy or the reader rebuilds it in their head.',
      'Every span has input and output as first class views, pretty printed and copyable.',
      'The list view is half the product. Filters, search, and saved views turn traces into a workflow.',
      'Attach eval scores directly to spans so failures are one click away, not a dashboard away.',
    ],
    terms: [
      { term: 'Span', gloss: '"one step"', meaning: 'A single timed unit of work in an agent run, with a start, end, input, and output, that can nest inside another span.' },
      { term: 'Trace', gloss: '"the whole run"', meaning: 'A tree of spans representing one full agent invocation from the first prompt to the final output.' },
      { term: 'Waterfall', gloss: '"the timeline view"', meaning: 'A horizontal layout showing each span\'s duration as a proportional bar, with nesting shown by indentation.' },
      { term: 'Faceted filter', gloss: '"narrowing down the list"', meaning: 'A multi-property filter over a trace list (by user, tool, cost, latency, score) that lets a reviewer isolate the traces that matter.' },
      { term: 'Evaluation score', gloss: '"did it do well"', meaning: 'A metric attached to a specific span or run assessing correctness, faithfulness, or safety, stored alongside the trace rather than in a separate system.' },
      { term: 'Run comparison', gloss: '"before and after"', meaning: 'A side by side diff of two traces on the same input, used to check whether a prompt or model change actually helped.' },
      { term: 'OpenTelemetry (OTel)', gloss: '"the standard tracing format"', meaning: 'An open standard for distributed tracing, originally built for microservices, that several LLM observability tools now use as a common ingestion format.' },
      { term: 'Self-hosting', gloss: '"running it yourself"', meaning: 'Deploying the trace platform on infrastructure you control rather than a vendor\'s cloud, which changes both cost and data residency guarantees.' },
      { term: 'Regression gate', gloss: '"a quality check that blocks merges"', meaning: 'A CI-integrated rule that stops a pull request from merging when an evaluation shows a statistically significant quality drop, not just a logged warning.' },
      { term: 'Center of gravity', gloss: '"what the tool is really for"', meaning: 'The core job a platform is architected around (integration depth, openness, or evaluation), which predicts its strengths better than a feature-by-feature list.' },
    ],
    demoCaption:
      'Flip between a run summary and a real trace. The summary tells you the agent finished. The trace tells you which span burned the time, what went in, what came out, and where the eval score dropped.',
    demo: {
      archetype: 'before-after',
      subject: 'Agent run · what the reviewer sees',
      badLabel: 'Opaque summary',
      goodLabel: 'Replayable trace',
      badLines: [
        'status: completed',
        'duration: 47.3s',
        'tokens: 12,842',
        'the agent answered the customer\'s question',
        '(no way to see which step burned the time)',
      ],
      goodLines: [
        'span tree: answer_question 47.3s > retrieve 41.1s > 3 vector searches',
        'click a span → input pane (prompt as markdown), output pane (JSON)',
        'eval badges inline: relevance 0.62 (below threshold), faithfulness 0.94',
        'faceted filters: by tool, by cost, by evaluator score',
        'compare runs side by side, one diff view',
      ],
      badCaption:
        'A "run complete" summary answers the wrong question. The PM wanted to know why the agent did what it did, not that it finished. Without the tree, the inputs, and the eval score, every debug session goes back to an engineer.',
      goodCaption:
        'The trace is the audit log a non-engineer can replay. Waterfall for hierarchy, span detail for cause, eval scores as inline badges for the exact failure, faceted filters and saved views so ten thousand traces stay usable. The product loop between production and fix closes without an eng handoff.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'a trace is a tree, not a log.',
        body:
          'a trace is a tree, not a log.\n\nevery agent step is a span with start, end, input, output. spans nest, so retrieve contains three vector searches, and answer_question contains retrieve.\n\nrender it as a waterfall (LangSmith, Langfuse). you get "step 3 burned 41 of the 47 seconds" instead of "it took a while." causal debugging, not vibes.',
      },
      {
        kind: 'X · design angle',
        hook: 'if only engineers can read your traces, your governance surface is dead on arrival.',
        body:
          'if only engineers can read your traces, your governance surface is dead on arrival.\n\nPMs, ops, and reviewers are the people closest to the failing example. they cannot ask "why did the agent do that" if the answer is a raw JSON dump behind an SSH.\n\ntrace UX is a first class product surface. the list view is half the product. eval scores belong on the trace, not on a separate dashboard.',
      },
      {
        kind: 'X · one-liner',
        hook: 'a completed status is not an explanation.',
        body:
          '"the agent answered" tells you nothing. "step 3 spent 41 of 47 seconds in retrieval, relevance 0.62" tells you what to fix.',
      },
    ],
    exercises: [
      { level: 'easy', prompt: 'Draw the span tree for a run that answers a question by retrieving three documents and then summarizing them, using correct nesting.' },
      { level: 'medium', prompt: 'A trace list has ten thousand entries. List the five filters you would ship first, and justify the order.' },
      { level: 'medium', prompt: 'Langfuse costs roughly $101/mo self-hosted at 1M events; LangSmith costs roughly $2,514/mo at 1M traces. Name two situations where the more expensive option is still the right call.' },
      { level: 'hard', prompt: 'Design where an evaluation score should live so that filtering to "relevance below 0.7" takes one click from the trace list to the exact failing span.' },
      { level: 'design', prompt: 'Sketch the input/output pane for a span whose input is a 40-line RAG prompt and whose output is a tool call with a nested JSON payload. Show what is expanded by default and what stays collapsed.' },
    ],
    furtherReading: [
      { label: 'LangSmith', url: 'https://smith.langchain.com', why: 'The most polished agent trace visualization available, and the reference for what a span tree can look like at its best.' },
      { label: 'Langfuse', url: 'https://langfuse.com', why: 'The open-source, self-hostable, OpenTelemetry-native alternative, and the current cost baseline for the category.' },
      { label: 'Braintrust', url: 'https://braintrust.dev', why: 'The eval-first platform whose CI regression gates show what it looks like when a trace and an evaluation are the same object.' },
      { label: 'OpenTelemetry', url: 'https://opentelemetry.io', why: 'The distributed tracing standard several LLM observability tools now use as a common ingestion format, worth understanding independent of any vendor.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Trace UI review checklist',
      body:
        '- Is the trace rendered as a nested span tree with duration bars, not a flat scrollable log?\n- Does clicking a span open pretty-printed, copyable input and output panes instead of raw JSON?\n- Can a reviewer filter the trace list by user, tool, cost, latency, and evaluator score?\n- Is an evaluation score visible inline on the list and the detail view, one click from its trace?\n- Have you named which of LangSmith, Langfuse, or Braintrust fits this team\'s center of gravity, and why?',
    },
    source: {
      label: 'Vault note: Trace UI is the audit log a non-engineer can replay',
      url: 'https://smith.langchain.com',
    },
  },
  {
    id: 'de-au-interrupt-design',
    phase: 'Design engineering',
    part: 'Agentic UI',
    index: 'DE.AG.04',
    title: 'Interrupt design distinguishes cancel from pause from rollback',
    oneLiner:
      'Cancel, pause, rollback, and guard are four different contracts. Collapsing them into one Stop button is where most agent products lose the user\'s trust.',
    readTime: '~10 min read',
    diagram: '/lessons/de/de-au-interrupt-design.png',
    diagramCaption:
      'Three interrupt affordances on one timeline: cancel mid stream, pause between steps, rollback after side effects, with the state each one leaves behind.',
    whyItMatters:
      'Long running agents demand a way out. But "stop" is not one action, it is at least four, and the user\'s expectation depends on which one they actually meant. Cancel means stop and forget, pause means hold here and let me steer, rollback means undo what already happened, and guard means block before it even starts. Claude Code binds Escape to a cancel that discards the current turn and updates its status line in the same frame the key is pressed. Warp\'s exit confirmation gives the user roughly two seconds to confirm before an in-progress conversation actually cancels. Each of these is a different contract, and using the wrong affordance for the wrong intent causes real damage.',
    learningObjectives: [
      'Distinguish cancel, pause, rollback, and guard by the state each one leaves behind.',
      'Explain why cancel is safe for read-only agents and unsafe as a default for agents with side effects.',
      'Design a paused state that is visually and behaviorally distinct from a still-running state.',
      'Specify what a rollback affordance should say when it cannot guarantee full restoration.',
      'Measure and design for an interrupt\'s acknowledgment latency, separate from its completion latency.',
    ],
    sections: [
      {
        heading: 'Cancel abandons the current step without touching side effects',
        body:
          'Cancel is the mid-stream interrupt. The user hits Escape or clicks Stop, the model stops generating, no more tool calls fire, and whatever has already committed stays committed. This is the right default for chat and for read-only agents. It is the wrong default for agents that write files or send emails, because the user\'s mental model of "stop" is "undo," and cancel does not undo.\n\nVercel AI SDK\'s abort signal on the stream is the reference implementation for the technical side. The UX side is a hotkey plus a visible affordance, never buried in a menu, because the moment a user wants to cancel is rarely a moment they want to go hunting for the right button.',
      },
      {
        heading: 'Pause holds the loop between steps and hands control back',
        body:
          'Pause is what LangGraph calls a human-in-the-loop interrupt. The agent completes its current step, then blocks before starting the next one and surfaces the pending plan for approval. This is the right pattern for consequential work: writing to production, spending money, sending communications. Warp\'s Agent Mode explicitly supports pausing an agent at any point to course-correct, distinct from cancelling it outright.\n\nThe design job is making the paused state legible: a distinct color, a clear "resume" or "edit and resume" affordance, and the pending action rendered in full. Without visual difference from "still running," users miss the handoff and the agent sits idle forever, burning nothing but the user\'s trust.',
      },
      {
        heading: 'Rollback reverses side effects the agent already caused',
        body:
          'Rollback is the hardest of the three because it requires the underlying system to support undo. v0 does it for file writes by keeping every generation as a diff. Cursor Composer offers "reject" on a diff to revert. Git is the backbone under most of these mechanisms.\n\nFor side effects that cannot be reversed (an email sent, a payment made, an API call to a third party), rollback is a lie and should not be offered at all. The design principle: only expose rollback where state can truly be restored, and label the affordance with what will actually happen ("revert 4 file changes"), not with the generic word Undo, which implies a guarantee the system may not be able to keep.',
      },
      {
        heading: 'A fourth control: guard, blocking before execution',
        body:
          'Cancel, pause, and rollback all react to an action that already started or finished. Claude Code\'s auto mode adds a fourth verb, guard: a classifier reviews every tool call before it runs, blocking anything that escalates beyond the original request, targets unrecognized infrastructure, or looks driven by hostile content the agent just read. Explicit deny rules bypass the classifier entirely and block unconditionally, since a classifier can be fooled but a hard-coded rule cannot.\n\nThis is a different UI problem from the other three: there is no button to design, only a policy to expose. The design surface is the permission-mode picker itself (default, acceptEdits, plan, auto, dontAsk, bypassPermissions), which determines which of the four controls are even active for a given session.',
      },
      {
        heading: 'Every interrupt needs a visible latency budget',
        body:
          'An interrupt that takes three seconds to register feels broken. The user hits Stop, the stream keeps going, they hit Stop again, and now they distrust the button. Warp handles this with an explicit two-step confirmation: the first exit attempt while a conversation is in progress shows "press again to exit," and the user has about two seconds to confirm before the cancellation actually takes effect, a rare example of a product making its own latency budget visible as a number rather than hiding it.\n\nClaude Code renders a status line change the moment Escape is pressed, before the model has actually finished responding. The user does not need the process to be instant, they need the acknowledgment to be instant. That is a UI job, not a backend job.',
      },
      {
        heading: 'From Ctrl-C to structured interrupts, the arc',
        body:
          'A terminal\'s Ctrl-C in the 2010s was a blunt kill signal with no awareness of partial state. 2023\'s early chat products added a "Stop generating" button, effectively cancel and nothing else. 2024 brought LangGraph\'s `interrupt()` primitive, giving pause a proper technical home with a resumable checkpoint. 2025 brought diff-based rollback in v0 and Cursor, treating every generation as a reversible git-like change.\n\n2025 into 2026 raised the bar again: Warp\'s Full Terminal Use means an agent can be running inside a live, interactive REPL when the user wants to interrupt it, a harder problem than stopping a stream, because the thing being interrupted is itself mid-conversation with another program.',
      },
      {
        heading: 'The four controls, side by side',
        body:
          'Naming the contract explicitly is the fix for all of the failure modes above.\n\n| Control | When it fires | State left behind | Product example |\n| --- | --- | --- | --- |\n| Cancel | mid-stream, on request | side effects already committed stay committed | Claude Code Escape |\n| Pause | between steps, on request | agent idles, pending plan awaits approval | LangGraph interrupt, Warp pause-anytime |\n| Rollback | after side effects, on request | state reverted, only where truly restorable | v0 file diffs, Cursor reject |\n| Guard | before execution, automatic | action blocked before it starts | Claude Code auto-mode classifier |\n\nFour rows, four different UI treatments. A single Stop button trying to cover all four is a button lying about at least one of them on any given click.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-au-interrupt-matrix.svg',
        alt: 'Four interrupt controls compared by timing and state left behind',
        caption: 'Cancel, pause, rollback, and guard fire at different points in a run and leave different state behind; one button cannot honestly represent all four.',
        diagramBrief:
          'A horizontal timeline with a run in progress (a long bar). Four labelled markers along and around it: "GUARD" before the bar starts (with a small shield icon), "CANCEL" mid-bar (stop-sign icon), "PAUSE" at a step boundary partway through (pause icon), "ROLLBACK" after the bar ends (backwards arrow icon). Under each marker, one short phrase for what state remains. Style: cream paper, monochrome ink, one accent color distinguishing the four marker icons from each other. Aspect 16:9.',
      },
      {
        src: '/lessons/de/de-au-latency-budget.svg',
        alt: 'The acknowledgment window after an interrupt click',
        caption: 'Warp gives the user roughly two seconds between a first exit attempt and confirmation; the acknowledgment is instant even though the cancellation is not.',
        diagramBrief:
          'A short timeline strip. At t=0, a click icon labelled "user hits Stop". Immediately after (near-zero gap), a label changes to "Stopping..." with a small clock icon showing "instant". Then a longer bracketed segment labelled "~2s confirmation window" leading to a final state "stopped at step 3". Style: cream paper, black ink, one accent color highlighting the near-zero "instant" gap versus the longer confirmation bracket. Aspect 3:1.',
      },
    ],
    takeaways: [
      'Cancel, pause, and rollback are three different contracts. Do not label all three "Stop."',
      'Cancel is safe for read only. For write agents, prefer pause between steps.',
      'Rollback only where state can truly be restored. Never offer it for sent emails or third party calls.',
      'Interrupt acknowledgment is a UI problem, solve it in the first frame after the click.',
    ],
    terms: [
      { term: 'Cancel', gloss: '"stop it"', meaning: 'A mid-stream interrupt that stops generation without reversing any side effects that already committed.' },
      { term: 'Pause', gloss: '"hold on a second"', meaning: 'A between-step interrupt that blocks before the next action and hands the pending plan back for approval.' },
      { term: 'Rollback', gloss: '"undo it"', meaning: 'Restoration of state to a previous checkpoint after side effects have already occurred, valid only where the underlying system supports it.' },
      { term: 'Guard', gloss: '"block it before it happens"', meaning: 'A preventive control (a classifier or a hard-coded deny rule) that stops an action from running at all, rather than reacting to one already underway.' },
      { term: 'Human in the loop', gloss: '"a person checks it"', meaning: 'An agent pattern that yields control to a human at defined checkpoints, the mechanism behind pause.' },
      { term: 'Abort signal', gloss: '"the cancel mechanism"', meaning: 'The technical primitive (fetch AbortController, LangGraph interrupt) behind cancel and pause at the implementation level.' },
      { term: 'Latency budget', gloss: '"how long it takes to respond"', meaning: 'The perceived time between a user\'s action and its acknowledgment, distinct from the time until the action is fully complete.' },
      { term: 'Permission mode', gloss: '"the safety setting"', meaning: 'A named trust level that determines which of cancel, pause, rollback, and guard are active for a given session.' },
      { term: 'Auto-mode classifier', gloss: '"the AI safety check"', meaning: 'A model that reviews a proposed tool call before execution and blocks anything that escalates beyond the user\'s request.' },
      { term: 'Deny rule', gloss: '"a hard no"', meaning: 'An explicit, unconditional rule that blocks an action before any classifier or user intent is consulted, immune to being talked around.' },
    ],
    demoCaption:
      'Watch one Stop button pretend to do three jobs, then split it into the three real verbs. Cancel, pause, and rollback are different contracts, and the failure modes only diverge when the button is pressed at the wrong time.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Long running agent · interrupt controls',
      badLabel: 'One Stop button',
      goodLabel: 'Cancel · Pause · Rollback',
      badLines: [
        'single Stop button, no label change on click',
        'user hits Stop mid email send, email already went out',
        'user hits Stop again, thinks the button is broken',
        'no visible acknowledgment, no state written',
        'no way to revert files the agent already wrote',
      ],
      goodLines: [
        'Cancel · mid stream, safe for read only, abort signal on the stream',
        'Pause · between steps, pending plan surfaced with resume / edit affordance',
        'Revert 4 file changes · only shown where state can truly be restored',
        'button flips to Stopping on click, status line names the step that stopped',
        'sent emails and third party calls do not offer rollback, ever',
      ],
      badCaption:
        'One Stop button collapses three contracts and lies about at least one of them. Users learn the button is unpredictable and start hesitating on the runs where they actually need it, which is exactly the wrong training signal for a governance affordance.',
      goodCaption:
        'Naming the three verbs, treating each one with its own affordance, and never offering rollback where state cannot be restored keeps the contract honest. The label flip to Stopping in the first frame solves the acknowledgment problem in the UI, before the backend has finished responding.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: '"stop" is not one action. it is three, and each one leaves a different state behind.',
        body:
          '"stop" is not one action. it is three, and each one leaves a different state behind.\n\ncancel: mid stream, model quits, side effects stay committed.\npause: between steps, agent blocks, hands the pending plan back to you.\nrollback: reverse side effects that already happened, only where state can be restored.\n\nlabel all three "Stop" and you have shipped a lie about at least one of them.',
      },
      {
        kind: 'X · design angle',
        hook: 'the governance UI on an agent lives or dies in the first frame after the click.',
        body:
          'the governance UI on an agent lives or dies in the first frame after the click.\n\nif the Stop button takes three seconds to acknowledge, the user hits it again, distrusts the button, and starts hesitating on the runs that need it most.\n\nflip the label to Stopping, disable further input, name the step you stopped at. the process does not have to be instant. the acknowledgment does. UI job, not backend.',
      },
      {
        kind: 'X · one-liner',
        hook: 'never offer rollback for a sent email.',
        body:
          'never offer rollback for a sent email.\n\nif the underlying system cannot restore state, "Undo" is a lie. label the affordance with what will actually happen, or hide it. rollback is a truthfulness constraint, not a nice-to-have.',
      },
    ],
    exercises: [
      { level: 'easy', prompt: 'For each of cancel, pause, and rollback, name one product that ships it and describe the affordance in one sentence.' },
      { level: 'medium', prompt: 'An agent is mid-way through sending three emails when a user hits Stop. Describe exactly what should happen to email 1 (already sent), email 2 (in flight), and email 3 (not yet started).' },
      { level: 'medium', prompt: 'Warp gives users about two seconds between a first exit attempt and confirmation. Argue for a shorter or longer window, citing one risk of getting it wrong in either direction.' },
      { level: 'hard', prompt: 'Design a guard-stage confirmation for an action the auto-mode classifier flags as escalating beyond the user\'s original request. What does the user see, and what are their two options?' },
      { level: 'design', prompt: 'Sketch the paused state for an agent that is about to deploy to production. Show three visual properties (beyond color) that make it unmistakably different from "still running," and the resume affordance.' },
    ],
    furtherReading: [
      { label: 'Claude Code: Choose a permission mode', url: 'https://code.claude.com/docs/en/permission-modes', why: 'The clearest current mapping between a named trust level and which interrupt controls are active for a session.' },
      { label: 'Claude Code: auto-mode configuration', url: 'https://code.claude.com/docs/en/auto-mode-config.md', why: 'How the guard control actually works: a classifier plus hard_deny/soft_deny/allow rules layered in front of it.' },
      { label: 'Warp Agents 3.0 announcement', url: 'https://www.warp.dev/blog/agents-3-full-terminal-use-plan-code-review-integration', why: 'Source for the pause-anytime and exit-confirmation behavior described in this lesson.' },
      { label: 'Vercel AI SDK: stream cancellation', url: 'https://sdk.vercel.ai', why: 'The technical abort-signal primitive most cancel affordances are built on top of.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Interrupt design review checklist',
      body:
        '- Does the product have separate affordances for cancel, pause, and rollback, or one button trying to be all three?\n- Is rollback only ever offered where the underlying system can actually restore state?\n- Does the interrupt button change its own label within the same frame the user clicks it?\n- Is there a guard-stage control (a classifier or deny rule) for actions that should never require a reactive interrupt at all?\n- Does the paused state look and behave differently from "still running," beyond just a color change?',
    },
    source: {
      label: 'Vault note: Interrupt design distinguishes cancel from pause from rollback',
      url: 'https://docs.claude.com/en/docs/claude-code',
    },
  },
  {
    id: 'de-au-handoff-attribution',
    phase: 'Design engineering',
    part: 'Agentic UI',
    index: 'DE.AG.05',
    title: 'Multi-agent handoff needs visible attribution',
    oneLiner:
      'When more than one agent contributes to an output, the UI must answer three questions on sight: which agent did which part, why the handoff happened, and who is speaking now.',
    readTime: '~10 min read',
    diagram: '/lessons/de/de-au-handoff-attribution.png',
    diagramCaption:
      'Two agents with stable identities and a first class handoff card between them, plus a spatial split for parallel work and a coordinator panel above.',
    whyItMatters:
      'Single agent UIs are a chat with one voice. Multi agent systems (a planner delegating to specialist agents, a swarm coordinating on files, a router picking a model per turn) mix voices, and if the UI does not attribute them, the user reads the transcript as one confused speaker. LangGraph implements a handoff as a `Command` object carrying a destination and a payload, which is exactly the data a handoff card needs to render: both avatars, the reason, and the state diff on hover. The design bar is that a user can point at any sentence, any file change, any tool call, and answer "who." Without attribution, debugging is impossible and trust erodes fast, and the user feels a bad handoff as the second agent simply forgetting them.',
    learningObjectives: [
      'Design a stable, session-persistent identity (name, avatar, color) for each agent in a multi-agent system.',
      'Render a handoff as a first class UI event carrying a reason and a payload, not an inline aside.',
      'Explain the LangGraph Command object mechanism and why a dropped state key breaks a handoff silently.',
      'Choose a spatial layout for concurrent agent work instead of forcing it into a serial transcript.',
      'Design a coordinator panel that makes an otherwise invisible orchestrator agent legible.',
    ],
    sections: [
      {
        heading: 'Give each agent a stable identity, not a generated name',
        body:
          'Every agent needs a name, an avatar or icon, and a color that persists across the entire session. Not "Agent 3," not a UUID, a role name the user chose to instantiate: Researcher, Editor, DBA. CrewAI\'s task cards render the assigned agent\'s avatar at the top of each output. Devin uses the file path as the identity anchor on parallel edits.\n\nThe rule is that identity is user-readable and stable. If the same agent shows up with a different label in two places, the user assumes two agents and misreads the transcript, which is the single fastest way to make a multi-agent system feel less trustworthy than a single one, even when the underlying work is identical.',
      },
      {
        heading: 'Render the handoff as a first class event, not an inline aside',
        body:
          'When Agent A delegates to Agent B, that transition is a moment the user must not miss. Render it as a divider or a card with both avatars, the reason ("needs SQL expertise"), and the payload that was passed. LangGraph Studio draws this as an edge between nodes with the state diff on hover, which is the correct level of detail: enough to inspect, collapsed by default.\n\nBuried inline as "let me hand this to the SQL agent," handoffs disappear into the prose and users blame the wrong agent when things go wrong. A distinct visual language for handoff is what makes the multi-agent nature of the system legible rather than merely technically true.',
      },
      {
        heading: 'Concurrent agents need a spatial layout, not a serial transcript',
        body:
          'If two agents work in parallel on different files, a linear chat cannot represent it honestly. Devin uses a file tree with per-file agent tags. Cursor Composer splits the diff by file with the agent identity per hunk. The pattern is that concurrency gets its own axis in the layout, usually the horizontal one, while time runs vertically inside each column.\n\nForcing parallel work into a serial log is the single most common failure mode of multi-agent UI, and it also masks the coordination bugs that only appear in parallel: two agents editing the same file, a race on a shared resource, a handoff that happens before its prerequisite step actually finished.',
      },
      {
        heading: 'Show the coordinator, not just the workers',
        body:
          'Multi agent systems usually have a controller (planner, router, orchestrator, often implemented as a LangGraph supervisor node) that assigns work. That agent is often invisible in the chat because its output is other agents\' inputs. Surface it explicitly: a persistent panel or a top-of-thread card showing the current plan, who is assigned to what, and what is done.\n\nA well-built supervisor pattern also carries a safety detail worth surfacing: an iteration counter or recursion limit that stops a runaway hand-off loop even if the routing logic has a bug, the same kind of invisible-until-it-matters safeguard a coordinator panel should make visible rather than silent.',
      },
      {
        heading: 'The technical primitive under a handoff: a Command with a destination and a payload',
        body:
          'LangGraph implements a handoff as an agent node returning a `Command` object carrying two things: a `goto` destination naming the target agent, and an `update` payload of state to pass along. When agents are nested subgraphs, a child sets `graph: Command.PARENT` to route control up to a sibling rather than staying inside its own subgraph.\n\nThe gotcha that matters for a designer: if a child agent writes a state key the parent graph does not define, LangGraph silently discards it, no error, just missing data. That is the exact mechanism behind the user experience of "the second agent forgot me": the payload the first agent thought it was passing never actually arrived, and nothing in the UI said so.',
      },
      {
        heading: 'From single-agent chatbots to visible swarms, the arc',
        body:
          '2023\'s chat products were single-voice by construction: one model, one thread, attribution was never a question. Late 2023 brought OpenAI\'s experimental Swarm framework, an early public pattern for tool-based handoffs between named agents. 2024\'s LangGraph formalized the same idea with subgraphs, a shared state key, and the `Command` object described above.\n\n2025 into 2026 brought the pattern into mainstream products: CrewAI\'s task cards, Devin\'s per-file agent tags on parallel edits, and LangGraph Studio\'s graph view becoming the tool teams reach for specifically because the chat log alone cannot answer "who did what."',
      },
      {
        heading: 'Three products, three attribution mechanics',
        body:
          'The identity, handoff-rendering, and concurrency mechanisms differ enough across tools to be worth comparing directly.\n\n| Product | Identity mechanism | Handoff rendering | Concurrency handling |\n| --- | --- | --- | --- |\n| CrewAI | Role name plus avatar on task cards | Implicit, via task assignment | Sequential task queue, not spatial |\n| LangGraph Studio | Node name in the graph | Edge with state diff on hover | Parallel branches shown as graph nodes |\n| Devin | File path as identity anchor | Per-file tag in the file tree | Spatial, one column per active file |\n\nNo single mechanism wins across all three axes, which is why a design engineer building a new multi-agent surface has to choose deliberately rather than copying one product wholesale.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-au-handoff-card.svg',
        alt: 'A handoff card between two named agents',
        caption: 'A handoff rendered as a first class card: both avatars, the reason for the delegation, and the payload passed, not a sentence buried in the transcript.',
        diagramBrief:
          'A horizontal card layout. Left side: an avatar circle labelled "Researcher" in one accent color. Right side: an avatar circle labelled "DBA" in a different accent color. Center: an arrow between them with a small label "needs SQL expertise" above it, and a collapsed payload chip below reading "3 fields" that implies expandability. Style: cream paper background, monochrome ink for the card border, two distinct accent colors for the two avatars only. Aspect 3:1.',
      },
      {
        src: '/lessons/de/de-au-command-object.svg',
        alt: 'The Command object routing control and state between agents',
        caption: 'A handoff tool call returns a Command with a destination and an update payload; a key the parent graph does not define is silently dropped.',
        diagramBrief:
          'A flow diagram: a box labelled "Agent A (subgraph)" produces an arrow labelled "Command { goto: Agent B, update: {messages, sql_context} }" pointing to a box labelled "Parent graph state". From the parent graph state, an arrow labelled "messages ✓, sql_context ✗ (key not in parent schema, silently dropped)" points to a box labelled "Agent B (subgraph)", with the dropped key crossed out or greyed. Style: cream paper, black ink, one red/warning accent color specifically on the dropped key to make the failure visible. Aspect 16:9.',
      },
    ],
    takeaways: [
      'Every agent gets a stable name, color, and icon for the whole session, not a per turn label.',
      'Handoffs are first class events with divider, reason, and payload. Never bury them inline.',
      'Concurrent work needs a spatial axis. A serial chat lies about parallelism.',
      'Surface the coordinator explicitly. Users cannot debug what they cannot see assigning work.',
    ],
    terms: [
      { term: 'Handoff', gloss: '"passing the task along"', meaning: 'An explicit transfer of control or task from one agent to another, carrying both a destination and a payload of context.' },
      { term: 'Coordinator', gloss: '"the manager agent"', meaning: 'The planner, router, or orchestrator agent that assigns work to specialist agents, often invisible unless deliberately surfaced.' },
      { term: 'Attribution', gloss: '"whodunit"', meaning: 'The mapping of a specific output (text, file change, tool call) back to the exact agent that produced it.' },
      { term: 'Subgraph', gloss: '"a nested agent"', meaning: 'A complete agent workflow that appears as a single node inside a larger parent graph, with its own internal state.' },
      { term: 'Fan out', gloss: '"splitting the work"', meaning: 'A pattern where one agent delegates parallel tasks to multiple specialist agents at once, rather than one at a time.' },
      { term: 'Session identity', gloss: '"the agent\'s name tag"', meaning: 'The stable name, color, and avatar an agent carries across an entire run, never regenerated or relabeled mid-session.' },
      { term: 'Command object', gloss: '"the handoff mechanism"', meaning: 'LangGraph\'s data structure combining a routing destination (goto) and a state update (update) returned from a node to trigger a handoff.' },
      { term: 'Shared state key', gloss: '"the context that travels with the handoff"', meaning: 'A field in the parent graph\'s state schema (like messages) that every subgraph can read and write, carrying context between agents.' },
      { term: 'Recursion limit', gloss: '"the safety cap"', meaning: 'An iteration counter that halts a runaway loop of handoffs between agents even if the routing logic itself has a bug.' },
      { term: 'Swarm architecture', gloss: '"lots of agents working together"', meaning: 'A multi-agent pattern (popularized by OpenAI\'s experimental Swarm framework) where peer agents hand off to each other via tool calls rather than a strict hierarchy.' },
    ],
    demoCaption:
      'Flip between a blended transcript and one with per agent attribution, a handoff card, and a coordinator panel. The same run reads as confused babble or as three named collaborators depending on the treatment.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Multi agent run · reviewer view',
      badLabel: 'One voice',
      goodLabel: 'Named agents',
      badLines: [
        'transcript alternates between three agents with no labels',
        '"let me hand this to the SQL agent" buried in prose',
        'parallel file edits collapsed into a serial log',
        'the coordinator is invisible, its plan lives in the model',
        'user cannot point at a sentence and answer "who"',
      ],
      goodLines: [
        'Researcher, Editor, DBA · stable avatar and color per session',
        'handoff card with both avatars, reason (needs SQL expertise), payload',
        'file tree with per file agent tags, time runs vertically per column',
        'coordinator panel at top: current plan, assignments, what is done',
        'every sentence, file change, and tool call has an agent on it',
      ],
      badCaption:
        'A blended chat lies about the number of speakers, buries handoffs as prose, and hides the coordinator. Users misattribute failures, blame the wrong agent, and lose trust in the system faster than any single model error would cause on its own.',
      goodCaption:
        'Stable identity per agent, a first class handoff card with reason and payload, a spatial axis for concurrent work, and a persistent coordinator panel make the multi agent nature legible. The design bar is that any output points back to a named producer.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'multi-agent UIs fail on attribution before they fail on capability.',
        body:
          'multi-agent UIs fail on attribution before they fail on capability.\n\nfour rules to make the system legible:\n\n1. every agent has a stable name, color, avatar across the session. not "Agent 3."\n2. handoffs are first class events with reason and payload, not inline asides.\n3. parallel work needs a spatial axis. a serial chat lies about concurrency.\n4. surface the coordinator explicitly, or the user cannot see who is assigning work.',
      },
      {
        kind: 'X · design angle',
        hook: 'if a user cannot point at any sentence and answer "who," the multi agent product does not exist yet.',
        body:
          'if a user cannot point at any sentence and answer "who," the multi agent product does not exist yet.\n\nblended transcripts read as one confused speaker. buried handoffs mean the wrong agent gets blamed. hidden coordinators turn the system into a black box.\n\nattribution is the governance surface on any run with more than one agent. build it first, add capability second.',
      },
      {
        kind: 'X · one-liner',
        hook: 'a serial chat log is the wrong shape for parallel agents.',
        body:
          'a serial chat log is the wrong shape for parallel agents.\n\nconcurrency needs an axis. time runs vertically, agents run horizontally. force it into one column and every coordination bug hides itself.',
      },
    ],
    exercises: [
      { level: 'easy', prompt: 'Name the three identity elements every agent needs in a multi-agent UI, and one product that ships each one well.' },
      { level: 'medium', prompt: 'A handoff from Agent A to Agent B silently loses a piece of context the user assumed carried over. Using the Command object mechanism, explain the most likely technical cause.' },
      { level: 'medium', prompt: 'Two agents edit different files in the same repo at the same time. Sketch a layout (not code) that represents this honestly, and explain why a single scrolling transcript cannot.' },
      { level: 'hard', prompt: 'Design a coordinator panel for a three-agent research pipeline. What three pieces of information does it show at all times, and what happens when an agent finishes its assignment?' },
      { level: 'design', prompt: 'A user reports "the second agent forgot everything the first one told it." Design the debugging UI you would add to make that failure visible the next time it happens, before the user has to report it at all.' },
    ],
    furtherReading: [
      { label: 'LangGraph: Multi-agent concepts', url: 'https://langchain-ai.github.io/langgraph/', why: 'The primary reference for the Command object, subgraphs, and the shared state key mechanism described in this lesson.' },
      { label: 'LangGraph Swarm', url: 'https://langchain-ai.github.io/langgraph/', why: 'A concrete multi-agent handoff implementation built on the same primitives, showing the pattern applied to a peer-to-peer (not strictly hierarchical) system.' },
      { label: 'CrewAI', url: 'https://www.crewai.com', why: 'A production example of role-based agent identity and task-card attribution at the product level.' },
      { label: 'Devin', url: 'https://cognition.ai', why: 'The reference implementation of file-path-as-identity-anchor for parallel, spatially laid out agent edits.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Multi-agent attribution checklist',
      body:
        '- Does every agent have a name, avatar, and color that stays the same for the whole session?\n- Is every handoff rendered as a distinct card or divider with a stated reason and the payload passed?\n- Can a user point at any sentence, file change, or tool call and identify which agent produced it?\n- Does concurrent work get its own spatial axis, or is it forced into one serial transcript?\n- Is the coordinator (planner, router, orchestrator) visible as its own panel, not just implied by its effects?\n- Is there a safeguard (an iteration counter or recursion limit) against a runaway handoff loop, and is it visible when it fires?',
    },
    source: {
      label: 'Vault note: Multi-agent handoff needs visible attribution',
      url: 'https://langchain-ai.github.io/langgraph/',
    },
  },
  {
    id: 'de-au-dia-browser',
    phase: 'Design engineering',
    part: 'Agentic UI',
    index: 'DE.AG.06',
    title: 'Dia Browser is a live study of agentic browsing UX',
    oneLiner:
      'Dia is not a component library, it is a shipping product from The Browser Company. Studying it is the fastest way to see agentic browsing UX decided in public, in real time.',
    readTime: '~10 min read',
    diagram: '/lessons/de/de-au-dia-browser.png',
    diagramCaption:
      'Dia\'s three design bets side by side: unified omnibox, tab aware chat panel with per tab consent, and Skills as a shareable saved workflow.',
    whyItMatters:
      'Dia ships no public SDK, so treat it as reference material rather than a dependency. What it ships is a working set of decisions on the hardest question in agentic UI: how to graft an agent onto an interface people already know without turning it into a chatbot bolted to a sidebar. The omnibox is unified, the chat panel is tab aware, and Skills is a first party primitive for reusable workflows built through a plain-sentence builder. If I am designing an agent inside an existing tool, Dia\'s v1.2.0 Skill Builder screen, the one where typing "help me prioritize my day" becomes a named, iconed, tool-scoped workflow in one step, is the closest public reference for how that retrofit gets done well.',
    learningObjectives: [
      'Explain why Dia treats mode selection (navigate, search, ask) as a cost the shell absorbs rather than the user.',
      'Describe the permission surface implied by Dia\'s tab-aware chat panel and how it differs from a plain chat feature.',
      'Trace how Dia\'s Skills evolved from a manual prompt-saving feature to a natural-language builder.',
      'Explain the strategic logic of building an AI-first shell on top of Chromium rather than a new engine.',
      'Evaluate what changes about a "free AI feature" once a company commits to a paywall, using Dia\'s own 2026 shift as the case.',
    ],
    sections: [
      {
        heading: 'The omnibox is the unified entry point',
        body:
          'Dia collapses navigate, search, and ask into a single input. Typing a URL navigates, typing a query searches, asking a question opens the chat panel with tab context. The user never has to choose which mode they are in, the system infers from the shape of the input. This is the core design bet: mode selection is a cost the AI can absorb.\n\nMost agent add-ons force a mode switch (a different bar, a different keystroke), and that friction is what keeps users from adopting them. The unified entry point is the single most portable idea in Dia, transferable to any product with more than one input surface competing for the same keystroke.',
      },
      {
        heading: 'The chat panel is tab aware, not chat aware',
        body:
          'Dia\'s assistant reads whatever tabs the user grants it. That is a permission surface (tab access consent) grafted onto a chat surface (message stream). The same question, "summarize this," means different things depending on which tabs are visible to the agent.\n\nThis is the browser version of a general lesson: agent context comes from what the surrounding UI exposes, not from what the model already knows. If I am designing a chat panel inside an app, the interesting design work is which app state I let the agent see, and how the user consents to it, not the chat bubble styling.',
      },
      {
        heading: 'Skills evolved from a manual prompt to a one-sentence builder',
        body:
          'Dia added Skills in mid-2025: community-authored shortcuts for repeatable workflows like fact-checking a page or generating a transcript, each discoverable, remixable, and runnable in one click. July 2025 brought an official 0.1 skill gallery. October 2025\'s v1.2.0 update replaced manual prompt-writing with a Natural Language Skill Builder: a user writes one plain sentence ("help me prioritize my day," "copyedit my Slack post"), and Dia assembles the name, icon, and only the tools actually needed (Gmail for drafts, Calendar for scheduling), then shows the steps for approval before saving.\n\nThe product move is turning agent prompts into a first class saveable, shareable object, the way browser bookmarks work, but now with the authoring step compressed to a single sentence.',
      },
      {
        heading: 'Chromium underneath is the strategic lesson for design engineers',
        body:
          'Dia is Chromium with the chrome stripped back, exactly as Arc was before it, the same company\'s earlier browser. That means the interesting work at The Browser Company is not the engine, it is the shell and the AI graft. For a design engineer, this is a template: pick an engine or framework that is boring and proven, then spend the design and engineering budget on the surface.\n\nRebuilding a browser from scratch would have killed the company\'s timeline. Rebuilding the UI on top of an existing engine shipped an original product instead. The same logic applies to using Vercel AI SDK, LangGraph, or MCP as boring, proven bases under a genuinely novel UI.',
      },
      {
        heading: 'The product is still moving, and moving toward paywalls',
        body:
          'A September 2026 update (v1.47.1) added Outlook and Teams support to Dia\'s Live Calendar view, which previously only integrated Google, plus an in-app "request a tool" feature listing the top 400 SaaS apps a user might want connected. More significant: reporting around the same release notes that Dia\'s AI features on macOS are moving behind a paywall, with an "Agentic Dia" and a Windows public release both slated for later in 2026.\n\nThe lesson for a design engineer: a product studied as free reference material today can change its business model in a single point release. Treat competitive analysis of any AI feature as a snapshot with a date on it, not a permanent fact.',
      },
      {
        heading: 'From Arc to Dia to Agentic Dia, the arc',
        body:
          '2015 to 2022, Arc built a loyal following as a Chromium-based browser with a genuinely different shell, no AI. 2024 bolted "Arc Max" AI features onto that existing shell. June 2025, The Browser Company launched Dia in beta, built AI-first from the ground up rather than retrofitted, with the omnibox and tab-aware chat as day-one bets. July to October 2025 layered Skills and the Skill Builder on top.\n\n2026 brings the next inflection: Windows and iOS versions expanding the audience, an "Agentic Dia" pushing past assistance into autonomous action, and a paywall arriving at the same time, three changes landing together rather than one at a time.',
      },
      {
        heading: 'Dia\'s three bets versus the naive alternative',
        body:
          'Each of Dia\'s core bets has an obvious, worse default that most products ship instead.\n\n| Bet | Naive default | Cost of the naive version |\n| --- | --- | --- |\n| Unified omnibox | Separate URL bar, search bar, AI sidebar | User must choose the right input before typing; wrong choice means starting over |\n| Tab-aware chat | AI sidebar with no page context | "Summarize this" fails or requires manually pasting content |\n| Skills as saveable objects | Every session starts from a blank prompt | Repeated workflows never compound; value stays stuck per user, never shared |\n\nEach naive default is not a hypothetical, it is what most competing agent features actually ship, which is why Dia is worth studying even without a public component kit to copy.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-au-omnibox-modes.svg',
        alt: 'One input inferring three different modes',
        caption: 'Dia\'s omnibox takes the same keystroke position and routes to navigate, search, or ask based on the shape of what was typed, no mode toggle required.',
        diagramBrief:
          'A single input box at the top, with three arrows branching downward from it to three labelled outcomes: "Navigate" (with a URL icon), "Search" (with a magnifying glass icon), "Ask" (with a chat bubble icon opening to a small tab-context indicator). Above the input box, a small caption reading "same box, same keystroke". Style: cream paper background, monochrome ink, one accent color on the branching arrows only. Aspect 16:9.',
      },
      {
        src: '/lessons/de/de-au-dia-timeline.svg',
        alt: 'Dia\'s evolution from Arc to Agentic Dia',
        caption: 'From a chrome-stripped Chromium shell with no AI, to Skills, to a 2026 inflection of Windows, iOS, agentic action, and a paywall arriving together.',
        diagramBrief:
          'A horizontal timeline with six labelled points left to right: "2015-2022 Arc, no AI" · "2024 Arc Max AI bolted on" · "June 2025 Dia beta, AI-first" · "July 2025 Skill gallery" · "Oct 2025 Natural Language Skill Builder" · "2026 Agentic Dia + Windows + paywall". Style: cream paper, black ink dots and connecting line, one accent color highlighting the final 2026 point since it marks the biggest simultaneous change. Aspect 21:9.',
      },
    ],
    takeaways: [
      'Dia has no public component kit. Study it as reference, do not wait for a library.',
      'Unify entry points. Mode switching is a cost the AI should absorb, not the user.',
      'Chat is tab aware, not just chat aware. Context comes from surrounding UI state.',
      'Turn repeatable prompts into first class saveable objects (Skills), or value stays trapped per user.',
    ],
    terms: [
      { term: 'Omnibox', gloss: '"the address bar"', meaning: 'A unified navigate, search, and ask input in a browser or app shell that infers user intent from the shape of the input, not a mode toggle.' },
      { term: 'Tab awareness', gloss: '"the AI can see my tabs"', meaning: 'An agent\'s read access to specific open tabs, granted per session as an explicit consent, not an ambient default.' },
      { term: 'Skill (Dia)', gloss: '"a saved AI shortcut"', meaning: 'A saved, shareable agent workflow that runs on demand, assembled from a single plain-language sentence since Dia\'s v1.2.0 update.' },
      { term: 'Skill Builder', gloss: '"the thing that makes Skills"', meaning: 'Dia\'s natural-language authoring flow (October 2025) that turns one sentence into a named, iconed, tool-scoped Skill with an approval step.' },
      { term: 'Chrome (browser)', gloss: '"the browser\'s frame"', meaning: 'The surrounding UI of a browser, tabs, address bar, menus, distinct from the underlying rendering engine.' },
      { term: 'Retrofit graft', gloss: '"bolting AI onto an existing product"', meaning: 'Adding an agent to a product users already know rather than building a new product from scratch, with its own set of design trade-offs.' },
      { term: 'Mode inference', gloss: '"the system guesses what I meant"', meaning: 'A system determining user intent from the shape of an input rather than requiring an explicit mode toggle beforehand.' },
      { term: 'Consent altitude', gloss: '"how much access I\'m granting"', meaning: 'The granularity at which a user thinks about what they are permitting an agent to see or do, here applied to which tabs are shared.' },
      { term: 'Paywalled AI feature', gloss: '"the free thing that stopped being free"', meaning: 'A previously included AI capability moved behind a subscription, a business-model shift a design engineer should expect from any competitive reference over time.' },
    ],
    demoCaption:
      'Flip between a traditional browser tab and Dia\'s. The URL bar looks the same in both, and the difference is in what the shell absorbs: the mode switch, the tab context, and the saved workflow.',
    demo: {
      archetype: 'before-after',
      subject: 'Browser tab · agent surface',
      badLabel: 'Traditional tab',
      goodLabel: 'Dia tab',
      badLines: [
        'URL bar for navigate, separate search bar, separate AI sidebar',
        'user picks the mode with a keystroke, wrong mode = wrong result',
        'AI sidebar has no access to the open tab, "summarize this" fails',
        'no way to save "fact check this page" as a reusable workflow',
        'every AI session starts from a blank prompt',
      ],
      goodLines: [
        'one omnibox: URL navigates, query searches, question opens chat with tab context',
        'chat panel reads only the tabs the user grants, per session consent',
        'Skills panel: named, remixable, one click, shareable workflows',
        'AI graft over Chromium, engine is boring, surface is where the design goes',
        'mode selection is a cost the shell absorbs, not the user',
      ],
      badCaption:
        'A traditional browser tab makes the user do the routing: which bar, which mode, which extension. The AI feature ends up bolted on as a sidebar with no context, so "summarize this" fails and adoption stalls.',
      goodCaption:
        'Dia\'s bet is that mode selection is a cost the AI can absorb. One omnibox, tab aware consent, and Skills as first class saveable workflows. The engine underneath is Chromium, so the design engineering budget goes to the shell where the product actually lives.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'Dia\'s one portable idea: mode selection is a cost the AI should absorb, not the user.',
        body:
          'Dia\'s one portable idea: mode selection is a cost the AI should absorb, not the user.\n\none omnibox takes URLs, queries, and questions. the shell infers intent from the shape of the input. no mode toggle, no different keystroke, no sidebar to remember.\n\nagent add ons that force a mode switch are why most of them do not stick. the unified entry point is the fix, and it copies out of Dia into any tool.',
      },
      {
        kind: 'X · design angle',
        hook: 'agent context comes from surrounding UI state, not from the model\'s memory.',
        body:
          'agent context comes from surrounding UI state, not from the model\'s memory.\n\nDia\'s chat panel is tab aware. "summarize this" means whatever tabs you granted, and consent is scoped to the session.\n\nthe design work on any chat inside an app is which app state you let the agent see, and how the user consents. that is a permission surface pretending to be a chat surface, and treating it as chat only ships something worse.',
      },
      {
        kind: 'X · one-liner',
        hook: 'if a repeatable prompt is not a saveable object, value stays stuck per user.',
        body:
          'if a repeatable prompt is not a saveable object, value stays stuck per user.\n\nDia\'s Skills are bookmarks for workflows: name it, save it, rerun it, share it. anything less and every conversation restarts from scratch.',
      },
    ],
    exercises: [
      { level: 'easy', prompt: 'Describe in one sentence how Dia\'s omnibox decides whether a keystroke is a navigation, a search, or a question.' },
      { level: 'medium', prompt: 'Design the consent moment for a chat panel to gain read access to a second browser tab mid-conversation. What does the user see, and can they revoke it later?' },
      { level: 'medium', prompt: 'Dia\'s Skill Builder turns one sentence into a named, tool-scoped workflow. List the three pieces of information the builder needs to infer, and one way it could get one of them wrong.' },
      { level: 'hard', prompt: 'Dia\'s AI features are reportedly moving behind a paywall in 2026. Design the upgrade prompt a free user sees the first time they try to use a Skill, without it feeling like a bait and switch.' },
      { level: 'design', prompt: 'Take a non-browser product you use daily and identify two separate input surfaces competing for the same user attention (a search bar and a command palette, for example). Sketch a unified entry point that absorbs the mode choice the way Dia\'s omnibox does.' },
    ],
    furtherReading: [
      { label: 'Dia Browser', url: 'https://www.diabrowser.com', why: 'The product itself; the fastest way to see the omnibox and tab-aware chat panel in daily use.' },
      { label: 'Dia v1.2.0 changelog: Natural Language Skill Builder', url: 'https://www.diabrowser.com/changelog/1-2-0', why: 'The primary source for how Skills moved from manual prompt-writing to a one-sentence builder.' },
      { label: 'TechCrunch: Dia launches a skill gallery', url: 'https://techcrunch.com/2025/07/21/dia-launches-a-skill-gallery-perplexity-to-add-tasks-to-comet/', why: 'Independent reporting on the July 2025 skill gallery launch and how community-authored Skills spread before the gallery existed.' },
      { label: 'The Browser Company', url: 'https://thebrowser.company', why: 'Company-level context connecting Dia\'s decisions to Arc, its predecessor product from the same team.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Retrofit-an-agent checklist (the Dia playbook)',
      body:
        '- Is there one entry point that infers mode from input shape, instead of a separate control per mode?\n- Does the agent only see the app state the user explicitly granted it, with a visible consent moment?\n- Can a user save a repeatable prompt as a named, iconed, shareable object in one step?\n- Is the underlying engine or framework a boring, proven choice, with the design budget spent on the shell instead?\n- Have you dated this competitive reference, since a free AI feature studied today can be paywalled by the next release?',
    },
    source: {
      label: 'Vault note: Dia Browser is a live study of agentic browsing UX',
      url: 'https://www.diabrowser.com',
    },
  },
  {
    id: 'de-au-agentic-libraries',
    phase: 'Design engineering',
    part: 'Agentic UI',
    index: 'DE.AG.07',
    title: 'Assistant UI and Vercel AI Elements are the agentic-UI component libraries to know',
    oneLiner:
      'Two production ready React libraries cover most of what a design engineer needs to ship an agent chat surface. Pick one and stop rebuilding the message list from scratch.',
    readTime: '~10 min read',
    diagram: '/lessons/de/de-au-agentic-libraries.png',
    diagramCaption:
      'The split between commodity primitives (message list, composer, streaming, abort, tool call block) that libraries own and the seams (plan trees, permission modals, trace, attribution, interrupts) that stay product specific.',
    whyItMatters:
      'Every agent app rebuilds the same primitives: message list, streaming assistant bubble, tool call block, code block, attachments, model picker, stop button. That is a month of design engineering that produces no differentiation. Assistant UI now ships 43 packages across its ecosystem with 8.6 million combined weekly npm downloads, its core `@assistant-ui/react` package alone at roughly 1.1 million a week and climbing 18 percent week over week, and Vercel AI Elements ships inside the AI SDK itself. The moment a design engineer should feel is opening a tool-call renderer that someone else already wired for streaming and abort, and spending the freed week on the permission modal instead.',
    learningObjectives: [
      'Distinguish a composable primitives library (Assistant UI) from an opinionated component set (Vercel AI Elements).',
      'Choose between the two libraries based on design system sovereignty rather than feature checklists.',
      'Identify the specific components (tool call renderer, generative UI) that remain product-specific no matter which library is used.',
      'Read a package\'s weekly-download growth rate as a signal for where agent runtimes are heading.',
      'Estimate the engineering time saved by adopting a primitives library versus hand-rolling a chat surface.',
    ],
    sections: [
      {
        heading: 'Assistant UI is the primitives library, not a monolithic chat widget',
        body:
          'Assistant UI ships composable primitives (Thread, Message, Composer, ToolCallDisplay) rather than a single ChatBot component. The CLI scaffolds a starter in Base UI or Radix UI flavor, so the visual language lives in your design system and the library owns the interaction plumbing. It supports OpenAI, Anthropic, Gemini, Mistral, Bedrock, and any custom HTTP backend through the Vercel AI SDK.\n\nThe ecosystem has grown well past a single package: 43 packages total, 8.6 million combined weekly downloads, with core packages like `@assistant-ui/react` at 1.1 million a week and `assistant-stream` at 1.3 million a week, both still growing double digits week over week. This is the right shape for a design engineer: streaming, abort, retry, and the message model handed over, typography and spacing kept sovereign.',
      },
      {
        heading: 'Vercel AI Elements pairs with the AI SDK for the fastest path to a working surface',
        body:
          'AI Elements is Vercel\'s React component set built on top of the AI SDK, with pre-made pieces for messages, code blocks, reasoning traces, and tool calls. Because it shares the SDK\'s streaming primitives, wiring is close to instant: `useChat` or `useAssistant` hooks feed the Elements directly.\n\nThe trade-off versus Assistant UI: Elements is more opinionated visually, leaning on shadcn conventions, and is the fastest way to a working v1. Assistant UI is more composable and better suited to a team with a strong existing design system it wants to keep sovereign. Both are actively maintained and both track the AI SDK\'s own release cadence closely.',
      },
      {
        heading: 'The comparison that matters is design system sovereignty',
        body:
          'Rule of thumb: if you have tokens and primitives you want to keep as the source of truth, Assistant UI, because you can restyle every part down to the Base UI or Radix scaffold underneath. If you are prototyping, or your product will read as an AI feature rather than a fully branded product, Vercel AI Elements, because the defaults are already good and you ship faster.\n\nBoth let you extend the tool call renderer, which is the single most product-specific part of any agent UI regardless of which library sits underneath it. This is not a religious choice; both libraries are actively maintained and both track the AI SDK, so switching cost later is lower than it looks up front.',
      },
      {
        heading: 'What neither library owns is where your design work goes',
        body:
          'Neither ships opinionated versions of permission modals, trace UI, plan trees, multi-agent attribution, or interrupt states. Those are the parts of an agent UI that vary most by product, and where a design engineer earns their keep. Use the library for the chat plumbing, build the seams yourself.\n\nThis mirrors the general lesson across this whole unit: the components are commoditizing, the seams between plan, act, observe, and reflect are not. Ship the library first to get a working v1, then invest the freed budget in the surfaces the library deliberately does not cover, because that is where a user actually forms their opinion of the product\'s trustworthiness.',
      },
      {
        heading: 'The adapter ecosystem shows where agent runtimes are heading',
        body:
          'Assistant UI ships dedicated runtime adapters beyond the core chat-completion path: `@assistant-ui/react-langgraph`, `@assistant-ui/react-langchain`, `@assistant-ui/react-google-adk`, `@assistant-ui/react-opencode`, and `@assistant-ui/react-pi` for a coding-agent runtime. The growth rates on the newer ones are the interesting data: `react-google-adk` is up 183 percent week over week, `react-opencode` up 51 percent, `react-pi` up 364 percent, and `react-generative-ui`, the package for rendering model-authored component trees rather than plain text, is up over 999 percent week over week.\n\nThat is a library ecosystem visibly chasing a moving target: agent backends are diversifying past a single chat-completion API, and a chat surface library has to keep pace with new runtimes, not just new model providers.',
      },
      {
        heading: 'From hand-rolled message lists to commodity primitives, the arc',
        body:
          '2023 saw every AI product ship its own half-finished streaming message list, usually with virtualization bugs at length and an abort signal that occasionally missed. Late 2024 brought the first shadcn-style AI component kits, useful for a demo, thin under real production load. By 2025, both Assistant UI and Vercel AI Elements had reached genuine production maturity, wired directly into the AI SDK\'s streaming primitives rather than reimplementing them.\n\nBy 2026, the primitives were commodity enough that the interesting design conversation moved entirely to the extension points: the tool call renderer and generative UI, the two places neither library can decide for you because they are the actual product.',
      },
      {
        heading: 'Assistant UI versus Vercel AI Elements, side by side',
        body:
          'Both are valid defaults; the right one depends on what a team already has and how fast it needs to move.\n\n| | Assistant UI | Vercel AI Elements |\n| --- | --- | --- |\n| Shape | Composable primitives (Thread, Message, Composer) | Pre-made components paired with the AI SDK |\n| Styling base | Base UI or Radix, fully restyleable | Opinionated, shadcn-leaning defaults |\n| Best for | A team with a design system to keep sovereign | Fastest path to a working v1 |\n| Ecosystem signal | 43 packages, 8.6M combined weekly downloads | Ships inside the AI SDK itself |\n| What you still build | Permission modals, trace, plan trees, attribution | Same list, no exceptions |\n\nThe last row is the one both columns share, and it is the actual point of this lesson.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-au-library-split.svg',
        alt: 'Commodity primitives versus product-specific seams',
        caption: 'A chat surface split into what a library already ships (streaming, composer, tool call block) and what stays yours to design (permission modal, trace, plan tree, attribution).',
        diagramBrief:
          'A single agent chat screen mockup divided by a dashed line into two zones. Left/top zone labelled "Library owns this" covering the message list, composer, and streaming bubble, shaded lightly. Right/bottom zone labelled "You design this" covering a permission modal, a trace panel, and a plan tree, left unshaded and outlined more heavily. Style: cream paper background, monochrome ink, one accent color used only for the "You design this" outline to draw the eye there. Aspect 4:3.',
      },
      {
        src: '/lessons/de/de-au-adapter-ecosystem.svg',
        alt: 'Assistant UI core with runtime adapters radiating outward',
        caption: 'A hub-and-spoke view of Assistant UI\'s adapter ecosystem, with week-over-week growth rates labelling the newest, fastest-growing spokes.',
        diagramBrief:
          'A central circle labelled "@assistant-ui/react core, 1.1M/wk". Five spokes radiating outward to smaller circles labelled: "react-langgraph", "react-langchain", "react-google-adk +183%", "react-opencode +51%", "react-pi +364%". Style: cream paper, black ink for the hub and older spokes, one accent color highlighting the three fastest-growing spokes (google-adk, opencode, pi) to show where growth is concentrated. Aspect 1:1.',
      },
    ],
    takeaways: [
      'Two production libraries: Assistant UI (composable primitives) and Vercel AI Elements (SDK paired components).',
      'Assistant UI wins when your design system is the source of truth. Elements wins when speed matters more.',
      'Both ship the boring plumbing (streaming, abort, retry). Neither ships permission, trace, or plan UI.',
      'Save the design budget for the seams: permission modals, plan trees, interrupts, attribution.',
    ],
    terms: [
      { term: 'Primitive', gloss: '"a building block component"', meaning: 'A small composable component that owns interaction behavior, not visual style, meant to be restyled rather than replaced.' },
      { term: 'Composer', gloss: '"the message input box"', meaning: 'The message input component handling send, stop, and attachment affordances at the bottom of a chat surface.' },
      { term: 'Streaming', gloss: '"the text appearing gradually"', meaning: 'Incremental rendering of assistant tokens as they arrive from the model, rather than waiting for the full response.' },
      { term: 'Tool call renderer', gloss: '"how a tool call looks"', meaning: 'The component that displays a structured tool invocation and its result, and the single part of any chat library that stays deliberately product-specific.' },
      { term: 'Design system sovereignty', gloss: '"owning your own look"', meaning: 'The property that visual tokens and primitives are owned by your own codebase rather than dictated by a third-party library\'s defaults.' },
      { term: 'AI SDK', gloss: '"Vercel\'s streaming toolkit"', meaning: 'Vercel\'s client and server library for streaming model responses and tool calls, the shared foundation under both libraries in this lesson.' },
      { term: 'Runtime adapter', gloss: '"a plug for a different backend"', meaning: 'A package that connects a chat UI library to a specific agent runtime (LangGraph, Google ADK, a custom coding-agent runtime) beyond a plain chat-completion API.' },
      { term: 'Generative UI', gloss: '"the model draws its own interface"', meaning: 'A pattern where the model authors an actual component tree rather than plain text, rendered by a dedicated package rather than a markdown parser.' },
      { term: 'CLI scaffold', gloss: '"the starter generator"', meaning: 'A command-line tool that generates a working starter project pre-wired to a library, so the first hour is spent on styling rather than plumbing.' },
    ],
    demoCaption:
      'Look at the same agent surface hand rolled and then rebuilt on library primitives. The chat plumbing is the same either way. The difference is which month of work goes into the seams.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Agent chat surface · what you built vs what you assembled',
      badLabel: 'Hand-rolled',
      goodLabel: 'Library primitives',
      badLines: [
        'own message list with virtualization bugs at length',
        'own streaming assistant bubble, retry logic half wired',
        'own abort signal plumbing, cancel occasionally misses',
        'own tool call block, styling inconsistent per tool',
        'a month of eng burned before the first product decision lands',
      ],
      goodLines: [
        'Thread, Message, Composer, ToolCallDisplay from Assistant UI or AI Elements',
        'streaming, abort, retry, model picker handed to you, restyleable',
        'sovereignty: keep your tokens (Assistant UI) or ship fastest v1 (Elements)',
        'tool call renderer is the one part you extend, product specific by design',
        'freed budget goes to the seams: permission modals, plan trees, trace, attribution',
      ],
      badCaption:
        'Every agent product that rebuilds the message list and the abort signal from scratch is paying tax on undifferentiated plumbing. The chat surface is not where the product wins, and the month spent on it is a month not spent on the seams.',
      goodCaption:
        'Assistant UI when the design system is the source of truth, Vercel AI Elements for the fastest v1. Both hand you streaming, abort, retry, and the message model, and neither ships permission modals, trace, or plan UI. That split is the whole point: assemble the commodity, invest in the seams.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'you can stop hand rolling the message list.',
        body:
          'you can stop hand rolling the message list.\n\ntwo React libraries cover the boring plumbing:\n\nAssistant UI: composable primitives (Thread, Message, Composer, ToolCallDisplay). CLI scaffolds in Base UI or Radix, keep your own tokens.\nVercel AI Elements: SDK paired, shadcn shaped, useChat and useAssistant feed the components directly. fastest v1.\n\nboth handle streaming, abort, retry. pick by how sovereign your design system needs to be.',
      },
      {
        kind: 'X · design angle',
        hook: 'the components are commoditizing. the seams are not.',
        body:
          'the components are commoditizing. the seams are not.\n\nneither Assistant UI nor Vercel AI Elements ships permission modals, plan trees, trace UI, multi agent attribution, or interrupt states. those are the surfaces your product lives or dies on.\n\nassemble the chat surface, spend the freed month on the four seams between plan, act, observe, reflect. that is where a design engineer earns their keep on an agent product.',
      },
      {
        kind: 'X · one-liner',
        hook: 'the tool call renderer is the one part you extend on purpose.',
        body:
          'the tool call renderer is the one part you extend on purpose.\n\neverything else in the chat surface is table stakes. how a tool call reads in your product is the one place the primitives cannot decide for you.',
      },
    ],
    exercises: [
      { level: 'easy', prompt: 'List the four chat-surface primitives Assistant UI ships (Thread, Message, Composer, ToolCallDisplay) and describe what each one owns.' },
      { level: 'medium', prompt: 'A team has an existing design system with strict tokens and wants to ship an agent chat feature in two weeks. Recommend a library and justify the choice in two sentences.' },
      { level: 'medium', prompt: '`@assistant-ui/react-generative-ui` grew over 999 percent week over week in a recent measurement. Explain what that growth rate suggests about how agent UIs are evolving, beyond plain text streaming.' },
      { level: 'hard', prompt: 'Estimate, in engineer-days, the difference between hand-rolling a message list, streaming, and abort signal versus adopting a primitives library, and name the two riskiest bugs the hand-rolled version is most likely to ship.' },
      { level: 'design', prompt: 'Design a tool-call renderer for a tool that queries a database and returns up to 200 rows. Decide what is shown by default, what requires an expand click, and how a destructive query (a DELETE) should look different from a read-only one.' },
    ],
    furtherReading: [
      { label: 'Assistant UI', url: 'https://www.assistant-ui.com', why: 'The primary docs and package overview, including the current weekly-download breakdown across all 43 packages referenced in this lesson.' },
      { label: 'Assistant UI on GitHub', url: 'https://github.com/assistant-ui/assistant-ui', why: 'Source code and issue tracker, useful for evaluating how actively a specific adapter (LangGraph, Google ADK) is maintained before depending on it.' },
      { label: 'Vercel AI Elements', url: 'https://ai-sdk.dev/elements/overview', why: 'The official Elements documentation, showing exactly how useChat and useAssistant feed the pre-built components.' },
      { label: 'Vercel AI SDK', url: 'https://sdk.vercel.ai', why: 'The shared streaming and tool-call foundation both libraries in this lesson are built on top of.' },
    ],
    shipIt: {
      kind: 'rubric',
      name: 'Assistant UI vs Vercel AI Elements decision rubric',
      body:
        '- Do we already have design tokens and primitives we want to keep as the source of truth? If yes, lean Assistant UI.\n- Is shipping a working v1 in days, not weeks, the top priority? If yes, lean Vercel AI Elements.\n- Do we need adapters beyond a plain chat-completion API (LangGraph, a custom agent runtime)? Check Assistant UI\'s adapter list first.\n- Have we budgeted separate design time for the tool call renderer regardless of which library we pick, since neither one ships it for us?\n- Have we budgeted separate design time for permission modals, trace UI, plan trees, and attribution, the seams neither library covers at all?',
    },
    source: {
      label: 'Vault note: Assistant UI and Vercel AI Elements are the agentic-UI component libraries to know',
      url: 'https://www.assistant-ui.com',
    },
  },
];
