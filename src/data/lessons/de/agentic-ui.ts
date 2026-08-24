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
    readTime: '~6 min read',
    diagram: '/lessons/de/de-au-agentic-loop.png',
    diagramCaption:
      'The four stages of the agent loop with the three seams between them, each seam labelled with the affordance a user needs there.',
    whyItMatters:
      'A chat UI treats the model as a text generator. An agent UI treats the model as a worker that plans a task, calls tools, reads results, and decides whether to keep going. Each of those four stages needs its own affordance, and each seam between them is a moment where the user needs to see, steer, or stop the run. Devin, Cursor Composer, and Claude Code all ship the loop, they just render it differently. If I design one screen instead of four surfaces plus three seams, the product will feel opaque no matter how good the model is.',
    sections: [
      {
        heading: 'The plan stage needs a legible task tree',
        body: 'Before any tool runs, the agent proposes a sequence. That plan is not decoration, it is the contract the user is agreeing to. Render it as a checklist or a tree, not as prose. Devin uses a bulleted timeline with checkboxes that fill in. Cursor Composer shows a numbered step list above the diff. The plan needs three properties: each step has a verb, each step has a target (file, URL, table), and each step is editable before commit. If the user cannot rewrite step 3 before it runs, the plan is a status bar, not a contract.',
      },
      {
        heading: 'The act stage is a live tool call, not a spinner',
        body: 'While a step executes, show the tool name, the exact arguments, and the streaming output. A generic "thinking" spinner tells the user nothing and trains them to look away. Claude Code inlines the tool call as a collapsible block with the command and its stdout. LangGraph Studio shows the node highlighting and the payload flowing in. The design job is to make the argument object legible, not to hide it. Long outputs collapse by default with a peek of the first and last lines, and expand on click.',
      },
      {
        heading: 'The observe stage is where the human intervenes',
        body: 'After a tool returns, the agent reads the result and picks the next step. This is the highest leverage moment for the user, because a wrong observation compounds into wrong plans. Give observations a distinct treatment from tool output: quoted, dimmed, with an inline "correct this" affordance. Cursor\'s inline diff review is the gold standard here, the user can accept, reject, or edit the model\'s interpretation before it becomes the next input. Without an intervene-on-observe hook, the loop is fully autonomous and the user is a spectator.',
      },
      {
        heading: 'The reflect stage decides whether to loop or stop',
        body: 'At the end of each cycle the agent asks itself "am I done." That decision needs surfacing. Show the completion criterion the agent is checking against, the confidence, and whether the plan updated. If the plan changed, diff it against the previous version so the user sees which steps were added, dropped, or reordered. Devin shows this as a plan-updated banner with the delta. Without this, plan drift is invisible until the run has burned an hour and produced the wrong artifact.',
      },
    ],
    takeaways: [
      'The loop has four stages, and each one needs its own affordance, not a shared spinner.',
      'The plan is a contract the user agrees to. Make it editable before commit.',
      'Tool calls render with arguments and streaming stdout. No generic "thinking" states.',
      'Observation is where humans steer. Give it a distinct treatment and an intervene hook.',
    ],
    terms: [
      { term: 'Agent loop', meaning: 'The plan, act, observe, reflect cycle that repeats until a stop condition is met.' },
      { term: 'Task tree', meaning: 'The hierarchical plan an agent proposes before executing.' },
      { term: 'Tool call', meaning: 'A structured invocation of an external capability by the agent.' },
      { term: 'Observation', meaning: 'The agent\'s read of a tool result, distinct from the raw result itself.' },
      { term: 'Plan drift', meaning: 'Silent divergence between the initial plan and the running one.' },
      { term: 'Intervene hook', meaning: 'A UI affordance to edit or reject an agent decision mid-loop.' },
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
      'The tools you expose to an agent define, one to one, the permission prompts your users will see. Design the schema, and you have designed the modal.',
    readTime: '~6 min read',
    diagram: '/lessons/de/de-au-action-schema.png',
    diagramCaption:
      'A tool schema translated into a permission modal: name to title, description to body, typed arguments to field labels with the right treatment per type.',
    whyItMatters:
      'Every action an agent can take is declared in a JSON schema: name, description, and typed arguments. That schema is not a backend concern, it is the copy on the permission modal, the label on the audit row, and the parameters the user reviews before approval. If the schema says execute_bash(cmd: string), the permission prompt will say exactly that, and the user has to guess whether that command is safe. Treat the schema as UX writing. The tool description is the modal body. The argument names are the field labels.',
    sections: [
      {
        heading: 'A vague tool name yields a vague permission prompt',
        body: 'run_command tells the user nothing. read_calendar_event(event_id) tells the user what will happen and what data is involved. Claude Desktop\'s MCP permission prompts render the tool name verbatim, followed by the arguments as a key value list. If the name is a shrug, the prompt is a shrug, and the user either rubber stamps everything or panics and denies everything. Neither is consent. Split broad tools into narrower ones with concrete verbs. Two well named tools beat one flexible one every time on the permission surface.',
      },
      {
        heading: 'Typed arguments become the field labels users read',
        body: 'If a tool takes body: string, the modal shows the entire string blob and the user scans past it. If it takes to: EmailAddress, subject: string, body: string, the modal renders three labeled fields and the user reads the recipient first. Use narrow types (enums, tagged unions, branded strings) so the UI can render each field with the right treatment. An amount: MoneyCents gets currency formatting. A destination: staging or prod gets a colored chip. The schema is where accessibility, formatting, and risk framing all originate.',
      },
      {
        heading: 'Scopes group tools into consent bundles',
        body: 'Asking permission for every tool call is death by modal. Grouping tools into scopes (read email, write email, read files, write files, run code) lets the user grant once at the right altitude. OAuth taught us this shape. OpenAI\'s plugin flow and Claude Desktop\'s per-server allow lists both use it. The design work is choosing the scope boundaries: too coarse and the user is granting "do anything," too fine and they will click through forty prompts. The safe default is read scopes granted once, write and execute scopes prompted per session.',
      },
      {
        heading: 'Destructive actions need a different treatment than idempotent ones',
        body: 'Reading a file and deleting a file are not the same class. The schema should mark destructive and irreversible actions explicitly (a boolean, a category, or a naming convention), and the UI should render those prompts differently: red accent, typed confirmation, an undo window if the underlying system allows one. Cursor\'s tool approval modal separates safe auto-approved tools from destructive ones that always prompt. Without this split, the sixth modal in a row conditions the user to click Approve on the seventh, which is the one that drops the table.',
      },
    ],
    takeaways: [
      'The tool schema is user-facing copy. Write it like a form label, not like an internal API.',
      'Narrow types, not stringly typed blobs. Enums and tagged unions become chips and colored labels.',
      'Group tools into scopes at the altitude the user actually thinks about consent.',
      'Mark destructive actions in the schema so the UI can prompt differently.',
    ],
    terms: [
      { term: 'Tool schema', meaning: 'Typed declaration of an action\'s name, description, and arguments.' },
      { term: 'Permission prompt', meaning: 'The modal or inline consent surface that renders a tool call for approval.' },
      { term: 'Scope', meaning: 'A bundle of related tools granted together with a single consent.' },
      { term: 'Consent altitude', meaning: 'The granularity at which the user thinks about permission (session, action, bundle).' },
      { term: 'Destructive action', meaning: 'A tool call that cannot be undone or that changes state irreversibly.' },
      { term: 'Rubber stamping', meaning: 'The failure mode where identical prompts train the user to always approve.' },
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
    readTime: '~6 min read',
    diagram: '/lessons/de/de-au-trace-ui.png',
    diagramCaption:
      'A span tree as a waterfall: the "answer question" span contains retrieve, which contains three vector searches, each with a duration bar and an input and output pane.',
    whyItMatters:
      'Agents fail in ways stack traces do not capture. The model chose the wrong tool, the tool got the right result but the observation was misread, the plan updated in a way nobody noticed. A trace UI (LangSmith, Langfuse, Braintrust, Vercel AI Gateway) is the surface that makes those failures debuggable by the people closest to the customer. If only engineers can read traces, PMs will keep asking "why did it do that" and the loop between production behavior and product fix stays broken. Trace UX is a first class product surface, not a dev tool.',
    sections: [
      {
        heading: 'A trace is a tree of spans, not a flat log',
        body: 'Each step in the agent loop is a span with a start, end, input, and output. Spans nest: an "answer question" span contains a "retrieve documents" span, which contains three "vector search" spans. Render this as a collapsible left rail with duration bars, the way Chrome DevTools shows waterfalls. Flat logs force the reader to reconstruct the hierarchy in their head. LangSmith and Langfuse both use the span tree as their primary control. The tree is what turns "the agent took 47 seconds" into "step 3 spent 41 of those seconds in retrieval."',
      },
      {
        heading: 'Every span needs input and output as first class views',
        body: 'Clicking a span should open two panes: what went in and what came out. Not a raw JSON blob, but pretty printed with syntax highlighting, collapsible arrays, and a copy button on each field. If the input is a prompt, render markdown. If the output is a tool result, render the schema. Braintrust does this well with side by side prompt and completion views and a diff mode for comparing runs. The design goal is that a non engineer can read a span the way they would read an email thread, no mental parsing required.',
      },
      {
        heading: 'Filtering and search are the difference between a demo and production use',
        body: 'One trace is a demo. Ten thousand traces need filters: by user, by tool, by cost, by latency, by error, by evaluator score. The trace list is a data table with saved views, not a scroll. Add faceted filters in a left rail and a search over prompt text. Langfuse ships this pattern. Without it, the trace UI becomes write only, engineers export to CSV and read there, and the product surface dies. If I am building trace UI, half the work is the list view, not the detail view.',
      },
      {
        heading: 'Evaluations belong on the trace, not in a separate dashboard',
        body: 'An evaluation score (was the answer correct, did it hallucinate, did it follow instructions) is metadata on a specific span or run. Render it inline as a badge on the trace list and as a panel on the detail view. Braintrust and LangSmith both attach eval scores directly to runs so the reader can filter to "failed" or "low score" traces without leaving the surface. Separating eval dashboards from traces forces the reader to context switch and hides the exact example that failed, which is the one thing you need to fix it.',
      },
    ],
    takeaways: [
      'Traces are span trees, not flat logs. Render the hierarchy or the reader rebuilds it in their head.',
      'Every span has input and output as first class views, pretty printed and copyable.',
      'The list view is half the product. Filters, search, and saved views turn traces into a workflow.',
      'Attach eval scores directly to spans so failures are one click away, not a dashboard away.',
    ],
    terms: [
      { term: 'Span', meaning: 'A single timed step in an agent run with input, output, and duration.' },
      { term: 'Trace', meaning: 'A tree of spans representing one full agent invocation.' },
      { term: 'Waterfall', meaning: 'Horizontal timeline layout showing span duration and nesting.' },
      { term: 'Faceted filter', meaning: 'Multi property filter over a trace list (user, tool, score, latency).' },
      { term: 'Evaluation score', meaning: 'A metric attached to a span assessing quality, correctness, or safety.' },
      { term: 'Run comparison', meaning: 'Side by side diff of two traces on the same input.' },
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
          'a completed status is not an explanation.\n\n"the agent answered" tells you nothing. "step 3 spent 41 of 47 seconds in retrieval, relevance 0.62" tells you what to fix.',
      },
    ],
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
      'Three affordances, three mental models, three UI treatments. Collapsing them into one Stop button is where most agent products lose the user\'s trust.',
    readTime: '~6 min read',
    diagram: '/lessons/de/de-au-interrupt-design.png',
    diagramCaption:
      'Three interrupt affordances on one timeline: cancel mid stream, pause between steps, rollback after side effects, with the state each one leaves behind.',
    whyItMatters:
      'Long running agents demand a way out. But "stop" is not one action, it is three, and the user\'s expectation depends on which one they asked for. Cancel means "stop and forget," pause means "hold here and let me steer," rollback means "undo what you already did." Claude Code binds Escape to a cancel that discards the current turn. Cursor has a Stop button that halts streaming. v0 has undo that reverses generated files. Each of these is a different contract with the user, and using the wrong affordance for the wrong intent causes real damage.',
    sections: [
      {
        heading: 'Cancel abandons the current step without touching side effects',
        body: 'Cancel is the mid stream interrupt. The user hits Escape or clicks Stop, the model stops generating, no more tool calls fire, and whatever has already committed stays committed. This is the right default for chat and for read only agents. It is the wrong default for agents that write files or send emails, because the user\'s mental model of "stop" is "undo," and cancel does not undo. Vercel AI SDK\'s abort signal on the stream is the reference implementation for the technical side. The UX side is a hotkey plus a visible affordance, never buried in a menu.',
      },
      {
        heading: 'Pause holds the loop between steps and hands control back',
        body: 'Pause is what LangGraph calls a human in the loop interrupt. The agent completes its current step, then blocks before starting the next one and surfaces the pending plan for approval. This is the right pattern for agents doing consequential work: writing to production, spending money, sending communications. The design job is to make the paused state legible: a distinct color, a clear "resume" or "edit and resume" affordance, and the pending action rendered in full. Without visual difference from "still running," users miss the handoff and the agent sits idle forever.',
      },
      {
        heading: 'Rollback reverses side effects the agent already caused',
        body: 'Rollback is the hardest of the three because it requires the underlying system to support undo. v0 does it for file writes by keeping every generation as a diff. Cursor Composer offers "reject" on a diff to revert. Git is the backbone under most of these. For side effects that cannot be reversed (email sent, payment made, API call to a third party), rollback is a lie and should not be offered. The design principle: only expose rollback where you can truly restore state, and label the affordance with what will happen (revert 4 file changes) not with the generic word Undo.',
      },
      {
        heading: 'Every interrupt needs a visible latency budget',
        body: 'An interrupt that takes three seconds to register feels broken. The user hits Stop, the stream keeps going, they hit Stop again, and now they distrust the button. Show interrupt state immediately: change the button label to Stopping, disable further input, and stream a clear "stopped at step 3" confirmation. Claude Code renders this as a status line change the moment Escape is pressed, before the model has actually finished responding. The user does not need the process to be instant, they need the acknowledgment to be instant. That is a UI job, not a backend job.',
      },
    ],
    takeaways: [
      'Cancel, pause, and rollback are three different contracts. Do not label all three "Stop."',
      'Cancel is safe for read only. For write agents, prefer pause between steps.',
      'Rollback only where state can truly be restored. Never offer it for sent emails or third party calls.',
      'Interrupt acknowledgment is a UI problem, solve it in the first frame after the click.',
    ],
    terms: [
      { term: 'Cancel', meaning: 'Mid stream interrupt that stops generation without reversing side effects.' },
      { term: 'Pause', meaning: 'Between step interrupt that blocks before the next action and awaits approval.' },
      { term: 'Rollback', meaning: 'Restoration of state to a previous checkpoint after side effects have occurred.' },
      { term: 'Human in the loop', meaning: 'Agent pattern that yields control to a human at defined checkpoints.' },
      { term: 'Abort signal', meaning: 'The technical primitive (fetch AbortController, LangGraph interrupt) behind cancel and pause.' },
      { term: 'Latency budget', meaning: 'The perceived time between a user action and its acknowledgment.' },
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
      'When more than one agent contributes to an output, the UI has to answer three questions on sight: which agent did which part, why the handoff happened, and who is speaking now.',
    readTime: '~6 min read',
    diagram: '/lessons/de/de-au-handoff-attribution.png',
    diagramCaption:
      'Two agents with stable identities and a first class handoff card between them, plus a spatial split for parallel work and a coordinator panel above.',
    whyItMatters:
      'Single agent UIs are a chat with one voice. Multi agent systems (a planner delegating to specialist agents, a swarm coordinating on files, a router picking a model per turn) mix voices, and if the UI does not attribute them, the user reads the transcript as one confused speaker. LangGraph Studio, CrewAI, and Devin\'s agent per file view all confront this and each solves it differently. The design bar is that a user can point at any sentence, any file change, any tool call and answer "who." Without attribution, debugging is impossible and trust erodes fast.',
    sections: [
      {
        heading: 'Give each agent a stable identity, not a generated name',
        body: 'Every agent needs a name, an avatar or icon, and a color that persists across the entire session. Not "Agent 3," not a UUID, a role name the user chose to instantiate: Researcher, Editor, DBA. CrewAI\'s task cards render the assigned agent\'s avatar at the top of each output. Devin uses the file path as the identity anchor on parallel edits. The rule is that identity is user readable and stable. If the same agent shows up with a different label in two places, the user assumes two agents and misreads the transcript.',
      },
      {
        heading: 'Render the handoff as a first class event, not an inline aside',
        body: 'When Agent A delegates to Agent B, that transition is a moment the user must not miss. Render it as a divider or a card with both avatars, the reason ("needs SQL expertise"), and the payload that was passed. LangGraph Studio draws this as an edge between nodes with the state diff on hover. Buried inline as "let me hand this to the SQL agent," handoffs disappear into the prose and users blame the wrong agent when things go wrong. A distinct visual language for handoff is what makes the multi agent nature legible.',
      },
      {
        heading: 'Concurrent agents need a spatial layout, not a serial transcript',
        body: 'If two agents work in parallel on different files, a linear chat cannot represent it honestly. Devin uses a file tree with per file agent tags. Cursor Composer splits the diff by file with the agent identity per hunk. The pattern is that concurrency gets its own axis in the layout, usually the horizontal one, while time runs vertically inside each column. Forcing parallel work into a serial log is the single most common failure mode of multi agent UI. It also masks the coordination bugs that only appear in parallel.',
      },
      {
        heading: 'Show the coordinator, not just the workers',
        body: 'Multi agent systems usually have a controller (planner, router, orchestrator) that assigns work. That agent is often invisible in the chat because its output is other agents\' inputs. Surface it explicitly: a persistent panel or a top of thread card showing the current plan, who is assigned to what, and what is done. LangGraph Studio\'s graph view is this idea, and it is why the tool is used to debug rather than the chat log alone. Without a coordinator view, users cannot form a mental model of the system and treat it as a black box.',
      },
    ],
    takeaways: [
      'Every agent gets a stable name, color, and icon for the whole session, not a per turn label.',
      'Handoffs are first class events with divider, reason, and payload. Never bury them inline.',
      'Concurrent work needs a spatial axis. A serial chat lies about parallelism.',
      'Surface the coordinator explicitly. Users cannot debug what they cannot see assigning work.',
    ],
    terms: [
      { term: 'Handoff', meaning: 'An explicit transfer of control or task from one agent to another.' },
      { term: 'Coordinator', meaning: 'The planner, router, or orchestrator agent that assigns work.' },
      { term: 'Attribution', meaning: 'Mapping of output (text, file change, tool call) to the agent that produced it.' },
      { term: 'Subgraph', meaning: 'A nested agent workflow visible as a node in a parent graph.' },
      { term: 'Fan out', meaning: 'Pattern where one agent delegates parallel tasks to multiple specialist agents.' },
      { term: 'Session identity', meaning: 'The stable name, color, and avatar an agent carries across a run.' },
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
      'Dia is not a component library, it is a shipping product from The Browser Company. Studying it is the fastest way to see what agent browsers look like when the AI is a first class UI citizen.',
    readTime: '~6 min read',
    diagram: '/lessons/de/de-au-dia-browser.png',
    diagramCaption:
      'Dia\'s three design bets side by side: unified omnibox, tab aware chat panel with per tab consent, and Skills as a shareable saved workflow.',
    whyItMatters:
      'Dia does not ship a public "Kit" or SDK, so treat it as reference material rather than a dependency. What it does ship is a working set of design decisions on the hardest question in agentic UI: how do you graft an agent onto an interface people already know, without turning it into a chat bot bolted to a sidebar. The omnibox is unified, the chat panel is tab aware, and Skills is a first party primitive for reusable agent workflows. If I am designing an agent that lives inside an existing tool, Dia is the closest public reference for how the retrofit can be done well.',
    sections: [
      {
        heading: 'The omnibox is the unified entry point',
        body: 'Dia collapses navigate, search, and ask into a single input. Typing a URL navigates, typing a query searches, asking a question opens the chat panel with tab context. The user never has to choose which mode they are in, the system infers from the shape of the input. This is the core design bet: mode selection is a cost the AI can absorb. Most agent add ons force a mode switch (a different bar, a different keystroke), and that friction is what keeps users from adopting them. The unified entry point is the single most portable idea in Dia.',
      },
      {
        heading: 'The chat panel is tab aware, not chat aware',
        body: 'Dia\'s assistant reads whatever tabs the user grants it. That is a permission surface (tab access consent) grafted onto a chat surface (message stream). The result is that the same question ("summarize this") means different things depending on which tabs are visible to the agent. This is the browser version of the general lesson: agent context comes from what the surrounding UI exposes, not from what the model already knows. If I am designing a chat panel inside an app, the interesting design work is which app state I let the agent see, and how the user consents to it.',
      },
      {
        heading: 'Skills is a user authored workflow primitive',
        body: 'Dia added Skills, community authored shortcuts for repeatable agent workflows. Fact check this page, generate a transcript, extract structured data. Each Skill is discoverable, remixable, and runnable in one click. The product move is turning agent prompts into a first class saveable, shareable object, the way browser bookmarks work. If I am designing for power users, this is the pattern: let people name a workflow, save it, and rerun it, and let them share it with teammates. Otherwise every agent conversation starts from scratch and value stays stuck in individuals.',
      },
      {
        heading: 'Chromium underneath is the strategic lesson for design engineers',
        body: 'Dia is Chromium with the chrome stripped back, exactly as Arc was. That means the interesting work at The Browser Company is not the engine, it is the shell and the AI graft. For a design engineer, this is a template: pick an engine or framework that is boring and proven, then spend the design and engineering budget on the surface. Rebuilding a browser from scratch would kill the company. Rebuilding the UI on top of an existing engine ships an original product. The same logic applies to using Vercel AI SDK, LangGraph, or MCP as boring bases under a novel UI.',
      },
    ],
    takeaways: [
      'Dia has no public component kit. Study it as reference, do not wait for a library.',
      'Unify entry points. Mode switching is a cost the AI should absorb, not the user.',
      'Chat is tab aware, not just chat aware. Context comes from surrounding UI state.',
      'Turn repeatable prompts into first class saveable objects (Skills), or value stays trapped per user.',
    ],
    terms: [
      { term: 'Omnibox', meaning: 'Unified navigate, search, and ask input in a browser or app shell.' },
      { term: 'Tab awareness', meaning: 'Agent\'s read access to specific open tabs granted per session.' },
      { term: 'Skill (Dia)', meaning: 'A saved, shareable agent workflow that runs on demand.' },
      { term: 'Chrome (browser)', meaning: 'The surrounding UI of a browser, distinct from the rendering engine.' },
      { term: 'Retrofit graft', meaning: 'Adding an agent to a product users already know rather than building from scratch.' },
      { term: 'Mode inference', meaning: 'System determining user intent from input shape rather than a mode toggle.' },
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
      'Two verified, production ready React libraries cover most of what a design engineer needs to ship an agent chat surface. Pick one and stop rebuilding the message list from scratch.',
    readTime: '~6 min read',
    diagram: '/lessons/de/de-au-agentic-libraries.png',
    diagramCaption:
      'The split between commodity primitives (message list, composer, streaming, abort, tool call block) that libraries own and the seams (plan trees, permission modals, trace, attribution, interrupts) that stay product specific.',
    whyItMatters:
      'Every agent app rebuilds the same primitives: message list, streaming assistant bubble, tool call block, code block, attachments, model picker, stop button. That is a month of design engineering that produces no differentiation. Assistant UI and Vercel AI Elements have both shipped these primitives as composable, restyleable components with the streaming and tool call plumbing already wired. Verified during the write of this note: Assistant UI at assistant-ui.com with 50k plus monthly downloads, and Vercel AI Elements shipped inside the AI SDK. Use one, spend the saved time on the seams unique to your product.',
    sections: [
      {
        heading: 'Assistant UI is the primitives library, not a monolithic chat widget',
        body: 'Assistant UI ships composable primitives (Thread, Message, Composer, ToolCallDisplay) rather than a single ChatBot component. The CLI scaffolds a starter in Base UI or Radix UI flavor, so the visual language lives in your design system and the library owns the interaction plumbing. It supports OpenAI, Anthropic, Gemini, Mistral, Bedrock, and any custom HTTP backend through the Vercel AI SDK. This is the right shape for a design engineer: I want the streaming, the abort, the retry, and the message model handed to me, and I want to bring my own typography, spacing, and color.',
      },
      {
        heading: 'Vercel AI Elements pairs with the AI SDK for the fastest path to a working surface',
        body: 'AI Elements is Vercel\'s React component set built on top of the AI SDK, with pre made pieces for messages, code blocks, reasoning traces, and tool calls. Because it shares the SDK\'s streaming primitives, wiring is trivial: useChat or useAssistant hooks feed the Elements directly. Trade off versus Assistant UI: Elements is more opinionated visually, opinionated toward shadcn conventions, and the fastest way to a working v1. Assistant UI is more composable and better if you have a strong existing design system that you want to keep sovereign. Both are valid, pick based on how much design control you need.',
      },
      {
        heading: 'The comparison that matters is design system sovereignty',
        body: 'Rule of thumb: if you have tokens and primitives you want to keep as the source of truth, Assistant UI, because you can restyle every part. If you are prototyping, or your product will read as an AI feature rather than a branded product, Vercel AI Elements, because the defaults are already good and you ship faster. Both let you extend the tool call renderer, which is the single most product specific part of any agent UI. Do not treat this as a religious choice, both are actively maintained and both track the AI SDK.',
      },
      {
        heading: 'What neither library owns is where your design work goes',
        body: 'Neither ships opinionated versions of permission modals, trace UI, plan trees, multi agent attribution, or interrupt states. Those are the parts of an agent UI that vary most by product, and where a design engineer earns their keep. Use the library for the chat plumbing, build the seams yourself. This mirrors the general lesson in agent UI: the components are commoditizing, the seams between plan, act, observe, and reflect are not. Ship the library first to get a working v1, then invest the freed budget in the surfaces the library deliberately does not cover.',
      },
    ],
    takeaways: [
      'Two verified libraries: Assistant UI (composable primitives) and Vercel AI Elements (SDK paired components).',
      'Assistant UI wins when your design system is the source of truth. Elements wins when speed matters more.',
      'Both ship the boring plumbing (streaming, abort, retry). Neither ships permission, trace, or plan UI.',
      'Save the design budget for the seams: permission modals, plan trees, interrupts, attribution.',
    ],
    terms: [
      { term: 'Primitive', meaning: 'A small composable component that owns behavior, not visual style.' },
      { term: 'Composer', meaning: 'The message input component with send, stop, and attachment affordances.' },
      { term: 'Streaming', meaning: 'Incremental rendering of assistant tokens as they arrive from the model.' },
      { term: 'Tool call renderer', meaning: 'The component that displays a structured tool invocation and its result.' },
      { term: 'Design system sovereignty', meaning: 'The property that visual tokens and primitives are owned by your codebase, not the library.' },
      { term: 'AI SDK', meaning: 'Vercel\'s client and server library for streaming model responses and tool calls.' },
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
    source: {
      label: 'Vault note: Assistant UI and Vercel AI Elements are the agentic-UI component libraries to know',
      url: 'https://www.assistant-ui.com',
    },
  },
];
