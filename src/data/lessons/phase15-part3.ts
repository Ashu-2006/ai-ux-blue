import type { Lesson } from '@/lib/lessons';

// Phase 15 · Part 3 · Control surfaces (lessons 15.13-15.15, 15.17, 15.18, 15.06)
export const phase15Part3: Lesson[] = [
  {
    id: 'p15-13-cost-governors',
    phase: 'Phase 15 · Autonomous Systems',
    part: 'Part 3 · Control surfaces',
    index: '15.13',
    title: 'Cost governors: the budget is a stack, not a number',
    oneLiner:
      'An e-commerce agent went from $1,200 to $4,800 a month after one new skill shipped. The defense is not a bigger cap, it is twelve limits at different time scales, each of which catches a different failure and each of which needs somewhere on screen to say it fired.',
    readTime: '~8 min read',
    diagram: 'lessons/p15-13.svg',
    diagramCaption:
      'The layered cost-governor stack: per-request max_tokens up through velocity limit, daily cap, and the kill switch on breach.',
    whyItMatters:
      'A budget is UI, not config. Twelve limits means twelve distinct states a run can be in, and they are not one banner. A per-request max_tokens truncation is an inline "output was cut" affordance on the message. A per-task dollar cap approaching 80 percent is a persistent meter in the run header. A velocity limit tripping at $50 in 10 minutes is a paused run with a resume gate. A HITL checkpoint on an expensive action is a modal with the price in it. Your component needs spend as live state (spent, remaining, window, which cap is closest), because the first question after a trip is always which one fired.',
    sections: [
      {
        heading: 'The problem: denial of wallet',
        body: 'A chatbot with a bad output produces a bad reply. An agent with a bad loop produces a bill. The industry name for the failure is denial of wallet: the agent keeps reasoning, keeps tool-calling, keeps billing, and nothing stops it because nothing was designed to stop it.\n\nThe documented case in Microsoft\'s Agent Governance Toolkit (April 2, 2026) is blunt. A mid-sized e-commerce agent\'s monthly LLM cost went from $1,200 to $4,800 after the team enabled an order-tracking skill. The skill let the agent poll order status every session. No loop detection, no per-tool cap, no week-over-week growth alert.',
      },
      {
        heading: 'The stack: twelve limits at five time scales',
        body: 'The toolkit and the Claude Code Agent SDK name the same primitives. Per-request max_tokens stops one unbounded completion. Per-task token and dollar budgets (max_budget_usd) stop one run. Per-tool call caps stop one surface. An iteration cap (max_turns) stops an infinite reasoning loop. Rolling per-minute, per-hour, per-day, and per-month caps stop leaks. A financial velocity limit, say cut access above $50 in 10 minutes, stops burn. Tiered model routing, prompt caching, and context windowing reduce the base rate. HITL checkpoints gate known-expensive actions. A kill switch aborts on breach.',
      },
      {
        heading: 'Why the stack and not one cap',
        body: 'Each limit catches a different shape of failure, and the shapes live at different time scales. A runaway loop, an agent stuck in a five-second retry, is caught by the velocity limit within minutes. A slow leak, an agent doing roughly twice the expected work per task, is caught by the daily cap within hours. A bad release using five times the tokens is caught by the weekly or monthly cap within a day. A legitimate demand surge is caught by the hour or day cap with a clear log, which is the case where you want a note, not a stop.\n\nOne monthly cap catches the runaway only after the wallet is gone. One per-request cap catches nothing at session level.',
      },
      {
        heading: 'The harness surface you actually get',
        body: 'The Claude Code Agent SDK exposes max_turns as the iteration cap, max_budget_usd as the dollar cap that aborts the session on breach, allowed_tools and disallowed_tools as allowlist and denylist, and pre-tool-use hook points where you do your own cost accounting.\n\nThat hook point is the interesting one for a frontend. It is where you emit the spend event your run header subscribes to, so the meter moves per tool call rather than at the end. Without it you have a budget that is only observable after the fact, which is a receipt, not a governor.',
      },
      {
        heading: 'A new tool is a new loop',
        body: 'The e-commerce fix was a per-tool cap plus a daily-growth alert, and that generalizes into a rule: every new tool surface is a new potential loop, so every new tool needs its own cap and its own alert. Treat a tool addition as a budget change, not a capability change.\n\nCombine this with the permission-mode ladder. An auto-mode session without max_budget_usd is ungoverned autonomy, and Anthropic frames Auto Mode as requiring budget controls specifically. In the EU, the toolkit maps caps and logging onto the OWASP Agentic Top 10 and EU AI Act Article 14 human oversight requirements, so enforcement and its audit trail are not optional.',
      },
    ],
    takeaways: [
      'Denial of wallet is a design gap, not a pricing bug. Nothing stopped the loop because nothing was built to stop it.',
      'Different failures need different time scales: velocity limit for loops (minutes), daily cap for leaks (hours), monthly cap for bad releases (days).',
      'Spend is live component state, not a receipt. Emit it from the pre-tool-use hook so the meter moves during the run.',
      'Every new tool is a new potential loop, so ship every new tool with its own cap and its own growth alert.',
    ],
    terms: [
      { term: 'Denial of wallet', meaning: 'An agent loop that generates unbounded spend because no cap was designed to stop it.' },
      { term: 'max_budget_usd', meaning: 'Session-level dollar cap in the Claude Code Agent SDK; the session aborts when it is breached.' },
      { term: 'max_turns', meaning: 'Iteration cap on agent loop turns in a session, the defense against infinite reasoning.' },
      { term: 'Velocity limit', meaning: 'A cap on spend inside a short rolling window, for example $50 in 10 minutes.' },
      { term: 'Tiered routing', meaning: 'Default to a cheaper model and escalate to a larger one only when a classifier says the task warrants it.' },
      { term: 'HITL checkpoint', meaning: 'A required human acknowledgement before a known-expensive action executes.' },
    ],
    demoCaption:
      'One monthly cap versus the layered stack on the same polling-loop trajectory. The trajectory is identical; the time to detection is not, and the difference is entirely which limits exist.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Polling-loop run · same trajectory',
      badLabel: 'One monthly cap',
      goodLabel: 'Layered stack',
      badLines: [
        'per-request max_tokens: set',
        'monthly cap: $5,000',
        'loop starts at turn 40, polls every 5s',
        'first alert: day 6, $4,100 spent',
      ],
      goodLines: [
        'velocity limit: $50 / 10 min',
        'per-tool cap: 20 order-status calls',
        'iteration cap: max_turns 60',
        'first trip: minute 8, $52 spent',
      ],
      badCaption:
        'A monthly cap is a real limit and a useless detector. It fires once, days late, after the money is gone, and it cannot tell you which tool caused it because it only ever saw one aggregate number.',
      goodCaption:
        'The velocity limit trips at minute 8 because it watches a 10-minute window, and the per-tool cap names order-status as the culprit. Same trajectory, $52 instead of $4,100, and a trip event specific enough to render.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'an agent going from $1,200 to $4,800 a month is not a pricing bug.',
        body:
          'an agent going from $1,200 to $4,800 a month is not a pricing bug.\n\nreal case in microsoft\'s agent governance toolkit: a team enabled an order-tracking skill. the agent started polling order status every session. no loop detection, no per-tool cap, no growth alert.\n\nthe term for it is denial of wallet. the agent keeps reasoning, keeps tool-calling, keeps billing.\n\nnothing stopped it because nothing was built to stop it.',
      },
      {
        kind: 'X · design angle',
        hook: 'a budget is not config, it is component state.',
        body:
          'a budget is not config, it is component state.\n\ntwelve limits in the governor stack means twelve things a run can be doing, and they are not one banner:\n\nmax_tokens truncation is an inline "output cut" on the message.\n80 percent of the dollar cap is a meter in the run header.\na velocity trip is a paused run with a resume gate.\nan expensive action is a modal with the price in it.\n\nfirst question after any trip: which cap fired. render that.',
      },
      {
        kind: 'X · one-liner',
        hook: 'velocity limit caught the loop at minute 8 and $52. the monthly cap would have caught it on day 6 at $4,100.',
        body:
          'velocity limit caught the loop at minute 8 and $52. the monthly cap would have caught it on day 6 at $4,100.\n\nsame trajectory. different time scales. one cap is a limit, a stack is a detector.',
      },
    ],
    source: {
      label: 'Full lesson: 15.13 13-cost-governors',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/15-autonomous-systems/13-cost-governors',
    },
  },
  {
    id: 'p15-14-kill-switches',
    phase: 'Phase 15 · Autonomous Systems',
    part: 'Part 3 · Control surfaces',
    index: '15.14',
    title: 'Kill switches, circuit breakers, and canary tokens',
    oneLiner:
      'A cost governor bounds what an agent can spend. It does not bound what the agent can do inside the budget, because the destructive action is usually the cheap one. Three detectors sit next to the budget layer, and each one puts the run in a different state.',
    readTime: '~8 min read',
    diagram: 'lessons/p15-14.svg',
    diagramCaption:
      'The circuit breaker state machine: closed to open on a trip, then half-open probes that either close it or re-open it.',
    whyItMatters:
      'These are three components, not one. A kill switch is terminal and global: the run goes dead, the surface becomes a read-only postmortem, and the only affordance left is a re-enable path gated on a human, never a timeout. A circuit breaker is partial and scoped: one tool path goes open while the rest of the run keeps going, so you need a per-tool status chip and a half-open probing state that is visibly neither on nor off. A canary trip is not a state change at all, it is a high-severity alert with attribution. Rendering all three as the same red banner destroys the information the reviewer needs.',
    sections: [
      {
        heading: 'The problem: budget does not bound behaviour',
        body: 'Cost governors bound spend. An agent with a $50 velocity limit can still exfiltrate a secret, publish the wrong post, or delete a resource, because the expensive action is often the cheap one in tokens. Deleting a production table costs almost nothing to emit.\n\nThree detectors sit next to the cost layer. A kill switch is a boolean off-button held outside the agent\'s reach. A circuit breaker is an action-pattern detector that pauses one specific path. A canary token is bait that an agent with no legitimate reason to touch it reveals itself by touching. None of them trusts the agent\'s self-report, which is the property that makes them work.',
      },
      {
        heading: 'Kill switches: a boolean the agent reads but cannot write',
        body: 'Implementation is a choice of substrate: a managed feature flag (LaunchDarkly, Statsig, Unleash) that propagates in seconds, a Redis key the agent polls, a signed config in object storage the agent verifies on boot, or an OS-level kill via Docker or kubectl.\n\nFour properties make one correct. The agent cannot set it to off, meaning it lives in a system the agent\'s credentials do not write. It is checked on every consequential action, not only at startup. When it is off, the agent does nothing externally observable, including logging to systems it can reach. And re-enabling is an explicit human action, never an automatic timeout.',
      },
      {
        heading: 'Circuit breakers: three states, one path',
        body: 'The classical shape from Nygard (2007) is still current. Closed means the action is allowed. Open means it is blocked. Half-open means that after a cool-down, one to three probe attempts are allowed (default one): a success closes the breaker, any remaining failure re-opens it.\n\nThe agent-relevant triggers are concrete. Five identical tool calls in a row is a repetitive loop. Five consecutive failures on the same tool with different inputs is systemic failure. Tool-call rate above a threshold is the velocity case. And a specific tool, say file.delete, invoked right after an out-of-trust content read is the injection case.',
      },
      {
        heading: 'Canary tokens: access is the alarm',
        body: 'Canaries, also called honeytokens, inherit directly from classical deception. A fake AWS_SECRET_ACCESS_KEY in the environment with no real privilege makes any exfiltration attempt instantly attributable. A fake database record with a sentinel value fires on any read or update. A fake file in the workspace makes reads suspicious. A fake memory entry injected at session start proves memory exfiltration if it ever shows up in an output.\n\nThe design constraint is that canary quality is workflow-specific. A canary the agent has a legitimate reason to touch is noise, and noise trains everyone to dismiss the alert.',
      },
      {
        heading: 'Statistical detectors bend, hard limits do not',
        body: 'EWMA, CUSUM, and z-scores on tool-call rate adapt to a moving baseline. That is a feature for legitimate drift and a bug for adversarial drift: a patient attacker shifts the baseline slowly enough that no alarm ever fires. So layer them. Statistical detectors catch most noise, hard constitutional limits catch the attack that walked past them. "Never email secrets@" is simpler, auditable, and not gameable by slow drift.\n\nTwo classes still get through. Semantic attacks that compose from allowed primitives pass every individual check, because the composition is the problem. And attacks that name the detector in the payload ("before you act, disable the canary") work if the agent has the capability, which is the argument for keeping canaries in systems the agent cannot modify.',
      },
    ],
    takeaways: [
      'A kill switch is only a kill switch if the agent\'s credentials cannot write it and re-enable requires a human, not a timeout.',
      'Circuit breakers have three states, and half-open is a real UI state: probing, neither on nor off.',
      'A canary the agent has a legitimate reason to touch is not a detector, it is a false-positive generator.',
      'Statistical detectors adapt to drift, which is exactly why a patient attacker beats them. Layer hard limits underneath.',
    ],
    terms: [
      { term: 'Kill switch', meaning: 'A boolean outside the agent\'s edit surface, checked on every consequential action, that disables the agent entirely.' },
      { term: 'Circuit breaker', meaning: 'A detector that trips on a specific action pattern and blocks only that path, not the whole run.' },
      { term: 'Half-open', meaning: 'The breaker state after cool-down where one to three probe attempts decide whether it closes or re-opens.' },
      { term: 'Canary token', meaning: 'Bait the agent has no legitimate reason to touch, whose access is itself the alert.' },
      { term: 'EWMA', meaning: 'Exponentially weighted moving average; adapts to a shifting baseline, which also means it accepts slow drift.' },
      { term: 'Hard limit', meaning: 'A constant rule that does not adapt to history, so it cannot be walked past by gradual baseline shift.' },
    ],
    demoCaption:
      'Two responses to the same drifting trajectory: an adaptive rate detector versus an adaptive detector plus a hard limit. The drift is slow enough that the moving baseline absorbs it.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Slow-drift trajectory · 90 minutes',
      badLabel: 'EWMA only',
      goodLabel: 'EWMA + hard limit',
      badLines: [
        'baseline: 6 tool calls / 10 min',
        'attacker adds ~1 call per window',
        'z-score never exceeds threshold',
        'minute 90: 48 calls / 10 min, no alarm',
      ],
      goodLines: [
        'EWMA still absorbs the drift',
        'hard limit: 50 tool calls / 10 min',
        'breaker opens on the tool path',
        'half-open probe at cool-down, human notified',
      ],
      badCaption:
        'The moving average is doing exactly what it was designed to do: absorb a changing baseline. That makes it a good noise filter and a bad adversary detector, because the adversary chooses the rate of change.',
      goodCaption:
        'A constant ceiling has no baseline to shift, so 50 calls in 10 minutes is 50 calls regardless of history. The breaker opens one tool path, not the whole run, and half-open probing is the state the UI has to show.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'a $50 velocity limit does not stop an agent from deleting your production table.',
        body:
          'a $50 velocity limit does not stop an agent from deleting your production table.\n\nthe destructive action is usually the cheap one in tokens. budget bounds spend, not behaviour.\n\nthree detectors sit next to the cost layer:\n\nkill switch: a boolean the agent reads but cannot write.\ncircuit breaker: trips on a pattern (five identical calls) and pauses one path.\ncanary token: bait it has no reason to touch. access is the alarm.\n\nnone of them trust the agent\'s self-report. that is the whole point.',
      },
      {
        kind: 'X · design angle',
        hook: 'a kill switch and a circuit breaker are not the same component.',
        body:
          'a kill switch and a circuit breaker are not the same component.\n\nkill switch: terminal and global. run goes dead, surface becomes a read-only postmortem, only affordance left is a human-gated re-enable.\n\ncircuit breaker: partial and scoped. one tool path opens, the run continues, so you need a per-tool status chip.\n\nand half-open is a real state. probing, neither on nor off.\n\ncanary trip is not a state change at all. it is an alert with attribution.\n\nsame red banner for all three and you have deleted the information.',
      },
      {
        kind: 'X · one-liner',
        hook: 'EWMA adapts to a moving baseline. that is a feature for drift and a bug for attackers, because the attacker picks the rate of change.',
        body:
          'EWMA adapts to a moving baseline. that is a feature for drift and a bug for attackers, because the attacker picks the rate of change.\n\nlayer a hard limit underneath. 50 calls in 10 minutes is 50 calls regardless of history.',
      },
    ],
    source: {
      label: 'Full lesson: 15.14 14-kill-switches-canaries',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/15-autonomous-systems/14-kill-switches-canaries',
    },
  },
  {
    id: 'p15-15-propose-then-commit',
    phase: 'Phase 15 · Autonomous Systems',
    part: 'Part 3 · Control surfaces',
    index: '15.15',
    title: 'Propose-then-commit: the approval gate that survives audit',
    oneLiner:
      'The 2026 human-in-the-loop consensus is not "the agent asks, the user clicks Approve." It is a durable proposal record with intent, lineage, permissions, blast radius, rollback plan, and an idempotency key, committed only on positive acknowledgement and verified after execution.',
    readTime: '~8 min read',
    diagram: 'lessons/p15-15.svg',
    diagramCaption:
      'The four-state machine: propose to a durable store, surface to a reviewer, commit on positive acknowledgement, verify the side effect.',
    whyItMatters:
      'This is the canonical shape behind every approval gate you will ever design, and it dictates the schema. A proposal is not a confirm dialog, it is a record: intent, data lineage, permissions touched, blast radius, rollback plan, idempotency key. Six fields means six regions in the review surface, and blast radius is the one that earns the space. The reviewer is not the agent, so the run sits in an awaiting-review state that must outlive the process. The default UI, two buttons, produces rubber-stamping, so the documented fix is a challenge-and-response checklist that keeps Approve disabled until specific questions are positively answered.',
    sections: [
      {
        heading: 'The problem: the 2023 prompt was rubber-stamped',
        body: 'The old pattern was a synchronous prompt: "Agent wants to send email to X with body Y, approve?" The user clicks Approve. Everyone feels safe.\n\nIn practice that surface is heavily rubber-stamped. Users approve fast, approvals predict almost nothing about outcomes, and when the agent does go wrong the audit trail shows a long history of approvals the user cannot recall giving. If the decision is instant, it was probably not a review. The engineering question is how to make a structured review the path of least resistance rather than the path of most friction.',
      },
      {
        heading: 'The state machine: propose, surface, commit, verify',
        body: 'Propose: the agent produces a proposed action and it is persisted to a durable store (PostgreSQL, Redis, a Durable Object) carrying intent (why), data lineage (what source led here), permissions touched (which scopes, files, endpoints), blast radius (the worst case), a rollback plan, and an idempotency key.\n\nSurface: a reviewer, a person and not the agent reviewing itself, sees the proposal with all of that metadata. Commit: positive acknowledgement executes the action. Verify: the side effect is read back and confirmed, and if verify fails the system is in a known bad state and alerting engages.',
      },
      {
        heading: 'The idempotency key is the field people skip',
        body: 'Without one, a retry after a transient failure double-executes an approved action. The concrete case: the user approves "transfer $100 from A to B," the network blips, the workflow retries, and the user who approved once has paid twice. The key ties one approval to one unique side effect, so the second execution is a no-op.\n\nThis is the same pattern Stripe and AWS APIs already use, and the Microsoft Agent Framework docs make reusing it for agent approvals explicit. Derive the key from the thread id plus the action signature, never from a timestamp, because a timestamp makes every retry a new key.',
      },
      {
        heading: 'Durability: approvals outlast processes',
        body: 'The approval waiting room is state the agent does not own. The workflow pauses, and when the approval arrives it resumes from exactly that point. This is why LangGraph pairs interrupt() with PostgreSQL checkpointing rather than in-memory state: an approval that arrives two days later still finds the workflow intact.\n\nEvery managed SDK ships a version of the same shape under a different name. LangGraph interrupt(), Microsoft Agent Framework RequestInfoEvent, Cloudflare waitForApproval(). The API names differ, the four states do not.',
      },
      {
        heading: 'Challenge-and-response, and what actually needs a gate',
        body: 'The documented mitigation for rubber-stamping is a checklist that requires positive answers before Approve is enabled: do you understand what resource this touches, have you verified the blast radius is acceptable, do you have a rollback plan if this fails. A reviewer who cannot tick the boxes either escalates or declines, and declining is the safe default. Anthropic\'s agent-safety research cites checklist-driven HITL specifically.\n\nNot everything gets the gate. Always: irreversible writes, financial transactions, outbound communication, production database changes, destructive filesystem operations. Sometimes: local file edits, staging changes, reversible writes. Never: reads, listings, read-only API calls. EU AI Act Article 14 requires effective human oversight, and the regulatory language explicitly excludes rubber-stamp patterns.',
      },
    ],
    takeaways: [
      'A proposal is a record with six fields, not a confirm dialog. Intent, lineage, permissions, blast radius, rollback, idempotency key.',
      'Derive the idempotency key from thread id plus action signature. Put a timestamp in it and every retry double-executes.',
      'The commit ran is not the same claim as the side effect happened, so verify by reading the target resource back.',
      'Two buttons produce rubber-stamps. Keep Approve disabled until a challenge-and-response checklist is positively answered.',
    ],
    terms: [
      { term: 'Propose-then-commit', meaning: 'A persisted proposal plus a positive commit plus post-execution verification, rather than a synchronous approve prompt.' },
      { term: 'Idempotency key', meaning: 'A value unique per proposal that makes a second execution of the same approved action a no-op.' },
      { term: 'Data lineage', meaning: 'The specific source content that led the agent to propose this particular action.' },
      { term: 'Blast radius', meaning: 'The scope of effect if the proposed action goes wrong, stated before the reviewer decides.' },
      { term: 'Rubber-stamp', meaning: 'Approve clicked without genuine review, the canonical failure mode of two-button HITL.' },
      { term: 'Challenge-and-response', meaning: 'A forcing checklist the reviewer must positively answer before the commit affordance unlocks.' },
    ],
    demoCaption:
      'The same proposed action rendered as a confirm dialog and as a proposal record. The action is identical; what the reviewer can actually evaluate is not.',
    demo: {
      archetype: 'reveal',
      subject: 'Proposed action · send outbound email',
      opaqueLabel: 'Agent wants to send an email. Approve?',
      revealedLines: [
        'intent: close ticket #4412 after the refund posted',
        'lineage: proposed from an unverified reply-to address',
        'permissions: mail.send on the shared support inbox',
        'blast radius: 1 external recipient, not recallable',
        'rollback: none. outbound email is irreversible',
        'idempotency key: sha256(thread_4412 + action_sig)',
      ],
      badCaption:
        'Approve on this is a coin flip dressed as oversight. The reviewer cannot see that the recipient came from an unverified address, that the send is not recallable, or that there is no rollback, so speed of approval carries no information.',
      goodCaption:
        'Six fields turn a coin flip into a decision. Lineage exposes the unverified source, blast radius says one external recipient and not recallable, rollback says none, and the idempotency key means a retry after a network blip sends once.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'the 2026 HITL pattern is not "agent asks, user clicks approve."',
        body:
          'the 2026 HITL pattern is not "agent asks, user clicks approve."\n\nit is propose-then-commit, four states:\n\npropose: persist the action to a durable store with intent, data lineage, permissions touched, blast radius, rollback plan, idempotency key.\nsurface: a human, not the agent reviewing itself.\ncommit: positive acknowledgement executes.\nverify: read the side effect back.\n\nlanggraph interrupt(), MS RequestInfoEvent, cloudflare waitForApproval(). different names, same four states.',
      },
      {
        kind: 'X · design angle',
        hook: 'if the approval decision was instant, it was not a review.',
        body:
          'if the approval decision was instant, it was not a review.\n\ntwo buttons produce rubber-stamps: fast approvals, no predictive value, and an audit trail full of approvals the user cannot recall giving.\n\nthe documented fix is a forcing function. approve stays disabled until the reviewer positively answers:\n\ndo you understand what resource this touches\nhave you verified the blast radius\ndo you have a rollback plan\n\nfriction is the feature. a reviewer who cannot tick the boxes escalates or declines.',
      },
      {
        kind: 'X · one-liner',
        hook: 'user approves one $100 transfer. network blips. workflow retries. user paid twice.',
        body:
          'user approves one $100 transfer. network blips. workflow retries. user paid twice.\n\nthat is a missing idempotency key. derive it from thread id plus action signature. put a timestamp in it and every retry becomes a new approval you never gave.',
      },
    ],
    source: {
      label: 'Full lesson: 15.15 15-propose-then-commit',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/15-autonomous-systems/15-propose-then-commit',
    },
  },
  {
    id: 'p15-17-constitutional-ai',
    phase: 'Phase 15 · Autonomous Systems',
    part: 'Part 3 · Control surfaces',
    index: '15.17',
    title: 'Constitutional AI: four tiers, and what an operator cannot touch',
    oneLiner:
      'Anthropic\'s January 22, 2026 Claude Constitution runs 79 pages, is CC0, and establishes a priority order: safety and human oversight, then ethics, then Anthropic guidelines, then helpfulness. Some behaviours are hardcoded and no operator or user can override them.',
    readTime: '~8 min read',
    diagram: 'lessons/p15-17.svg',
    diagramCaption:
      'The four-tier priority hierarchy with the hardcoded prohibition floor that operator settings cannot reach.',
    whyItMatters:
      'If you build the settings screen for an agent product, this document is your schema. Every toggle is either soft-coded, meaning the operator moves it inside a declared bound, or hardcoded, meaning it must not render as a control at all. A disabled switch with a tooltip is the wrong affordance: it implies a value exists that someone could unlock. Response length, topical scope, style, and tool-use patterns are legitimately operator-adjustable. CBRN uplift and identity deception are not. And when a refusal happens, the tier that caused it is the explanation your empty state owes the user, because helpfulness losing to safety looks like a bug otherwise.',
    sections: [
      {
        heading: 'The problem: no rule list is the right length',
        body: 'A fielded agent sees inputs its designers never saw. No rule list is long enough to cover them, and no rule list is short enough to check quickly under compute pressure.\n\nRule-based alignment lists every disallowed thing. It is fast to check and easy to audit, impossible to keep current, and it over-refuses on close analogs it did not anticipate. Reason-based alignment encodes principles and lets the model reason. It scales across unseen cases, is harder to audit, and its failure mode shifts from missing a rule to misapplying a principle.',
      },
      {
        heading: 'The four tiers, in resolution order',
        body: 'Safety and supporting human oversight is highest. Note the specific wording: not "be cautious" but do not act in ways that make human oversight harder. Ethics is second, covering honesty, avoiding harm to persons, not deceiving, not manipulating, and it supersedes Anthropic\'s own guidelines when they conflict. Anthropic guidelines are third: operational norms about product scope, interaction patterns, which tools to use when. Helpfulness is last, meaning be as useful as possible within the higher priorities.\n\nWhen tiers conflict, higher wins. The shape is deliberately Unix priorities or network QoS: predictable resolution, not best-case behaviour on any single axis.',
      },
      {
        heading: 'Hardcoded prohibitions versus soft-coded defaults',
        body: 'Hardcoded: CBRN and bioweapons uplift, CSAM, attacks on critical infrastructure, and deceiving users about the model\'s identity when asked directly. Neither the operator nor the user can override these. They are enforced at the weights level where possible and at the inference layer where not.\n\nSoft-coded and operator-adjustable: response length defaults, topical scope (an operator can have the model refuse topics outside its deployment), style, and tool-use patterns. Adjustments happen inside a declared bound, and the operator cannot remove a hardcoded prohibition by renaming it.',
      },
      {
        heading: 'The 2022 training loop and its honest caveats',
        body: 'The original Constitutional AI (Bai et al., 2022) trained harmlessness in four steps: generate responses to prompts, ask the model to critique each against explicit principles, revise based on the critique, then run RLAIF on the revised pairs. The result was principled refusals with explanations rather than blanket ones. The 2026 Constitution uses a descendant of that plus post-training on the explicit tier order.\n\nThe caveats are documented in the source, not bolted on. Reason-based alignment relies on the model generalising principles to situations nobody anticipated. It misses attacks that exploit principle ambiguity, cases where two principles conflict and the tier order is genuinely unclear, and slow drift in how a fixed principle text gets read across training cycles.',
      },
      {
        heading: 'Where the Constitution sits, and the 50 percent number',
        body: 'The Constitution is not a kill switch. It lives at the model layer: what the weights are trained to prefer. Kill switches and canaries live at the runtime layer: what the runtime permits. Both are required, because a permissive model with a strict runtime and a strict model with a permissive runtime fail differently and both fail.\n\nAnthropic\'s 2023 participatory experiment compared a corporate-authored constitution with one generated from about 1,000 US respondents. The two agreed on roughly 50 percent of principles, with the public version more restrictive on political content and less restrictive on AI self-disclosure. The 2026 Constitution did not incorporate those findings, which the source flags as an open tension.',
      },
    ],
    takeaways: [
      'Helpfulness is the lowest of four tiers. A refusal is often the hierarchy working, so name the tier in the explanation.',
      'Soft-coded settings are controls. Hardcoded prohibitions are not controls and should not render as disabled switches.',
      'Reason-based alignment closes the long tail and cannot close the adversarial tail, which is why hardcoded rules exist at all.',
      'Model layer and runtime layer cover different classes. Constitution is weights, kill switches are runtime, and you need both.',
    ],
    terms: [
      { term: 'Constitutional AI', meaning: 'Training harmlessness by self-critique against written principles, then reinforcement learning on the revisions.' },
      { term: 'Reason-based alignment', meaning: 'Encoding principles the model reasons over, rather than enumerating disallowed cases.' },
      { term: 'Hardcoded prohibition', meaning: 'A behaviour no operator or user setting can enable, enforced at the weights or inference layer.' },
      { term: 'Soft-coded default', meaning: 'Behaviour an operator can adjust inside a declared bound, such as length, scope, or style.' },
      { term: 'Four-tier hierarchy', meaning: 'The resolution order safety and oversight, then ethics, then guidelines, then helpfulness.' },
      { term: 'RLAIF', meaning: 'Reinforcement learning where the reward signal comes from model-generated critiques rather than human labels.' },
    ],
    demoCaption:
      'The same operator settings screen built on a flat permission model and on the tier model. One of these lets a rename look like an override.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Operator settings · agent deployment',
      badLabel: 'Flat permissions',
      goodLabel: 'Tiered',
      badLines: [
        'every rule is one row with one switch',
        'CBRN row renders disabled with a tooltip',
        'operator reads it as "unlockable on request"',
        'a renamed category reads as a new setting',
      ],
      goodLines: [
        'soft-coded zone: length, scope, style, tools',
        'hardcoded floor is documented, not rendered',
        'refusal copy names the tier that won',
        'bounds shown per control, not per request',
      ],
      badCaption:
        'One list with one switch per rule makes every prohibition look like a permission someone has not granted yet. A disabled toggle communicates a value exists behind it, which is exactly the wrong claim about a hardcoded prohibition.',
      goodCaption:
        'Splitting the screen at the soft-coded boundary means controls are only where a bound actually exists. The hardcoded floor is documented text, not a dead affordance, and refusal copy names which tier beat helpfulness.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'helpfulness is the lowest of four tiers in claude\'s constitution.',
        body:
          'helpfulness is the lowest of four tiers in claude\'s constitution.\n\norder: safety and supporting human oversight, then ethics, then anthropic guidelines, then helpfulness. higher wins on conflict.\n\ntier 1 is specifically worded. not "be cautious" but do not act in ways that make human oversight harder.\n\n79 pages, CC0, january 22 2026. it reads like a priority resolver because it is one.',
      },
      {
        kind: 'X · design angle',
        hook: 'if you build the settings screen for an agent, the constitution is your schema.',
        body:
          'if you build the settings screen for an agent, the constitution is your schema.\n\nevery toggle is one of two things. soft-coded: the operator moves it inside a declared bound. length, topical scope, style, tool patterns.\n\nhardcoded: no operator, no user, ever.\n\nand a hardcoded rule must not render as a disabled switch. a disabled switch says "a value exists here that someone could unlock." that is the wrong claim. document it as text.',
      },
      {
        kind: 'X · one-liner',
        hook: 'anthropic\'s 2023 public-input constitution agreed with the corporate one on about 50 percent of principles.',
        body:
          'anthropic\'s 2023 public-input constitution agreed with the corporate one on about 50 percent of principles.\n\npublic version was stricter on political content, looser on AI self-disclosure. the 2026 constitution did not incorporate it. the source says so itself.',
      },
    ],
    source: {
      label: 'Full lesson: 15.17 17-constitutional-ai',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/15-autonomous-systems/17-constitutional-ai',
    },
  },
  {
    id: 'p15-18-llama-guard',
    phase: 'Phase 15 · Autonomous Systems',
    part: 'Part 3 · Control surfaces',
    index: '15.18',
    title: 'Llama Guard: a taxonomy is a router, not a wall',
    oneLiner:
      'Llama Guard classifies both inputs and outputs against a named hazard taxonomy in milliseconds, and a 1B-INT4 variant does over 30 tokens per second on a mobile CPU. It is also beatable: emoji smuggling hit a 100 percent attack success rate on six prominent guard systems.',
    readTime: '~8 min read',
    diagram: 'lessons/p15-18.svg',
    diagramCaption:
      'The guard sieve: input rail, model, output rail, and the attack classes that pass through each layer.',
    whyItMatters:
      'The taxonomy is the product, and the taxonomy is a routing table for your UI. Thirteen or fourteen named categories means you stop treating rejection as one binary and start mapping category to affordance: block S1 with a terminal refusal, flag S6 into a review queue, annotate S12 and let it through. That is three components, not one. The output rail matters more, because it can fire after the user watched tokens stream in, so you need a retract-and-replace state rather than a pre-send block. And ASR numbers of 72 to 100 percent mean the classifier is a layer in your trust copy, never the claim.',
    sections: [
      {
        heading: 'The narrowest point in the stack',
        body: 'Classifiers sit where everything passes: every request in, every response out. A good classifier layer is fast, taxonomy-based, and catches a large fraction of obvious misuse for a small compute cost. A bad one is a false sense of security that gets written into a trust page.\n\nThe 2024 to 2026 stack has converged on a small set. Llama Guard from Meta ships open weights under Meta\'s Community License. NeMo Guardrails from NVIDIA ships permissive-licensed rails plus Colang for dialog flows. Both are designed to pair with a foundation model\'s own safety behaviour, not replace it.',
      },
      {
        heading: 'Llama Guard 3 and 4, concretely',
        body: 'Llama Guard 3 is a Llama-3.1-8B base fine-tuned for content safety, not a general chat model. It classifies both inputs and outputs against the MLCommons 13-hazard taxonomy across 8 languages, and a 1B-INT4 quantized variant runs at over 30 tokens per second on mobile CPUs, which is what makes on-device rails viable at all.\n\nLlama Guard 4 adds multimodal image plus text input, expands the taxonomy to S1 through S14, and is a drop-in replacement for Llama Guard 3 8B and 11B. S14, Code Interpreter Abuse, is the one that matters for autonomous agents: coding agents execute code in sandboxes, and the earlier taxonomy had no name for misuse of that surface.',
      },
      {
        heading: 'NeMo Guardrails and the dialog rail',
        body: 'NeMo Guardrails v0.20.0 (January 2026) has three rail types. Input rails classify and block on the user turn. Output rails classify and block on the model turn. Dialog rails are Colang-defined flow constraints. It integrates Llama Guard, Prompt Guard, and custom classifiers.\n\nThe dialog rail is the differentiator, because input and output rails only ever see one turn. A dialog rail can enforce "do not discuss medical diagnosis in a customer-support bot" even when the user asks three different ways across five turns, which is the class of attack that walks straight past turn-level classification.',
      },
      {
        heading: 'The attack corpus and its numbers',
        body: 'Huang et al. (arXiv:2504.11168) mapped the bypass surface. Emoji smuggling inserts non-printable or visually similar emoji between characters of a forbidden request so the tokenizer coalesces them differently than the classifier expects: 100 percent attack success rate on six prominent guard systems. Homoglyph substitution swaps Latin letters for visually identical Cyrillic, so "bomb" with a Cyrillic B misses an English-trained classifier. In-context redirection tests whether a claim in the input repositions the policy. Semantic paraphrase simply uses vocabulary the fine-tuning never saw.\n\nNeMo Guard Detect recorded 72.54 percent ASR on a jailbreak benchmark under careful attack craft. Casual jailbreaks are far lower, but the ceiling is clearly not zero.',
      },
      {
        heading: 'Defense in depth, four layers deep',
        body: 'Where classifiers win: fast default rejection of obvious misuse in milliseconds, category routing for differential handling, output rails catching leaks the model would otherwise emit, and an auditable declared taxonomy that regulators can read. Where they lose: adversarial crafting, multi-turn drift past turn-level context, paraphrase outside the training distribution, and genuinely ambiguous content.\n\nSo the classifier is one of four layers. Weights trained with Constitutional AI refuse overt misuse by default. Classifiers fast-reject and route. The runtime enforces permission modes, budgets, kill switches, canaries. Review adds propose-then-commit on consequential actions. Each layer covers a different attack class, and no single one is sufficient.',
      },
    ],
    takeaways: [
      'The taxonomy is a routing table. Category to affordance: block, queue for review, or annotate and allow are three components.',
      'Output rails can fire after streaming has started, so you need a retract-and-replace state, not just a pre-send block.',
      'Dialog rails exist because input and output rails only see one turn, and multi-turn drift is the common bypass.',
      'Emoji smuggling hit 100 percent ASR on six guard systems. Never write the classifier into your trust copy as the guarantee.',
    ],
    terms: [
      { term: 'Llama Guard', meaning: 'A Llama-3.1-8B model fine-tuned to classify both LLM inputs and outputs against a hazard taxonomy.' },
      { term: 'MLCommons taxonomy', meaning: 'A shared 13-hazard vocabulary for content safety categories that downstream systems can route on.' },
      { term: 'S14', meaning: 'Code Interpreter Abuse, added in Llama Guard 4, the category that names sandbox misuse by coding agents.' },
      { term: 'Output rail', meaning: 'A classifier on the model turn, which can fire after tokens have already streamed to the user.' },
      { term: 'Dialog rail', meaning: 'A conversation-level constraint that persists across turns, unlike turn-level input and output rails.' },
      { term: 'ASR', meaning: 'Attack success rate: the fraction of crafted attacks that bypass the classifier.' },
    ],
    demoCaption:
      'One classifier verdict rendered as a binary block and as a category route. The same 14 categories can drive one component or three, and only one of those is honest about severity.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Classifier verdict · input and output rails',
      badLabel: 'Binary block',
      goodLabel: 'Category route',
      badLines: [
        'one verdict: allowed or blocked',
        'S1 and S12 get the same red toast',
        'output rail trip mid-stream: message vanishes',
        'trust page claims "filtered by a safety classifier"',
      ],
      goodLines: [
        'S1: terminal refusal, no retry affordance',
        'S6: queued to human review, run pauses',
        'S12: annotated inline, allowed through',
        'output trip: retract and replace, reason shown',
      ],
      badCaption:
        'Collapsing 14 categories into allowed or blocked throws away the only thing the taxonomy gave you. Elections content and violent-crime content are not the same severity, and a message that silently vanishes mid-stream reads as a network fault.',
      goodCaption:
        'Category to affordance turns one verdict into three components: a terminal refusal, a review queue that pauses the run, and an inline annotation. Output-rail trips get a retract-and-replace state, because the user already saw tokens.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'llama guard 4 does not output "safe" or "unsafe." it outputs a category.',
        body:
          'llama guard 4 does not output "safe" or "unsafe." it outputs a category.\n\nS1 through S14, MLCommons taxonomy, both input and output turns. S14 is code interpreter abuse, added specifically because coding agents run code in sandboxes.\n\na 1B-INT4 variant does over 30 tok/s on a mobile CPU, which is what makes an on-device rail possible at all.\n\nthe taxonomy is the product. the verdict is just the last field.',
      },
      {
        kind: 'X · design angle',
        hook: 'an output rail fires after the user already watched tokens arrive.',
        body:
          'an output rail fires after the user already watched tokens arrive.\n\nthat is not a pre-send block, it is a retract-and-replace state, and if you do not build one the message just vanishes and reads as a network fault.\n\nsame argument for the taxonomy. 14 categories is a routing table, not a binary:\n\nblock S1, terminal, no retry.\nqueue S6 to human review, pause the run.\nannotate S12 inline and let it through.\n\nthree components. one classifier.',
      },
      {
        kind: 'X · one-liner',
        hook: 'emoji smuggling hit 100 percent attack success rate on six prominent guard systems.',
        body:
          'emoji smuggling hit 100 percent attack success rate on six prominent guard systems.\n\nnon-printable emoji between the characters of a forbidden request. the tokenizer coalesces them differently than the classifier expects.\n\nclassifiers are a layer. do not let one into your trust copy as the guarantee.',
      },
    ],
    source: {
      label: 'Full lesson: 15.18 18-llama-guard',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/15-autonomous-systems/18-llama-guard',
    },
  },
  {
    id: 'p15-06-automated-alignment',
    phase: 'Phase 15 · Autonomous Systems',
    part: 'Part 3 · Control surfaces',
    index: '15.06',
    title: 'Automated alignment research: agents propose, humans commit',
    oneLiner:
      'Anthropic ran parallel Claude Opus 4.6 alignment researchers in independent sandboxes, coordinating through a shared forum whose logs live outside every sandbox. On weak-to-strong training they beat the human baseline. The log placement is the whole reason the result is trustworthy.',
    readTime: '~8 min read',
    diagram: 'lessons/p15-06.svg',
    diagramCaption:
      'Parallel sandboxed researchers writing to a shared append-only forum whose storage sits outside every sandbox.',
    whyItMatters:
      'This is propose-then-commit applied to research itself, at the scale where the reviewer is the bottleneck. The design problem is a queue surface for N parallel agents whose findings arrive asynchronously: which agent posted what, which findings depend on which, and what a human still has to commit. Log integrity is a rendering requirement, not just infrastructure. If the record is append-only and out-of-sandbox, your history view can show edits as new entries with provenance rather than mutating rows, and a tamper attempt becomes a visible event in the timeline instead of an absence you can never detect.',
    sections: [
      {
        heading: 'The problem: alignment research does not scale by hiring',
        body: 'Alignment work is expensive in human-researcher time. Scalable oversight, reward specification, and weak-to-strong training need experiments that take weeks per iteration. As frontier capability advances, the alignment workload grows faster than the supply of qualified researchers.\n\nAutomated Alignment Research asks whether the same frontier models whose capability is outrunning alignment can help close the gap. Anthropic\'s 2026 report on an AAR-run weak-to-strong study is one of the first public results from a deployed system of this class, and the headline is genuinely positive: the AARs outperformed human researchers on the task.',
      },
      {
        heading: 'The architecture as publicly described',
        body: 'Multiple Claude Opus 4.6 instances run as AARs, each in an independent sandbox that limits filesystem, network, and process surface. Findings are published to a shared forum whose storage backend sits outside every sandbox: agents can read the forum, and no agent can delete or edit forum records from inside its own sandbox.\n\nA human-designed task queue assigns research problems. The AARs propose decompositions, run experiments, and write up findings. The published study focused on weak-to-strong training, using a weaker supervisor model to train a stronger student, and that is where they beat the human baseline.',
      },
      {
        heading: 'Why the out-of-sandbox log is the load-bearing detail',
        body: 'Log integrity is the difference between a controlled experiment and a possibly compromised one. If AARs could edit their own logs, they could cover up failed or dubious experiments, and no amount of positive published result would mean anything. Anthropic flags this directly: the property is necessary for trusting the output and non-trivial to verify.\n\nIn infrastructure terms this is append-only logging with write-through to external storage: S3 object-lock, immutable log stores. The agent holds no credential that can modify a past record. It is the same pattern 2026 corporate security teams use for ransomware-resistant audit trails.',
      },
      {
        heading: 'The prescribed-workflow tradeoff',
        body: 'Anthropic\'s report notes that prescribed workflows often constrain AAR flexibility and degrade performance. If a human designer writes the research plan step by step, the AARs do worse than when handed high-level goals and left to decompose the problem themselves. That matches results across agentic research: overspecified scaffolds hurt capable agents.\n\nThe safety implication is subtle rather than obvious. The same flexibility that improves performance is the flexibility that permits unsanctioned decomposition, novel tool use, and goal drift. The design question is how much freedom buys enough capability to beat humans without handing the agent room to generalise its goals off distribution.',
      },
      {
        heading: 'Compression risk, and what stays human',
        body: 'RSP v3.0 defines an AI R and D capability threshold: full automation of the AI research pipeline at cost competitive with humans plus tools. DeepMind\'s Frontier Safety Framework v3 has an analogous ML R and D autonomy level. Both treat that threshold as the trigger for elevated controls.\n\nAAR sits one step short. It automates part of the pipeline, alignment research on well-scoped tasks, not the end-to-end capability loop. The concern is compression: if capability compounds faster than alignment, which is the historical trend, the gap widens. Which is why the ends stay human. Researchers set the task queue, review results, hold constitutional authority, and decide what to publish, retract, or refine. AARs accelerate the middle.',
      },
    ],
    takeaways: [
      'The result is only trustworthy because the forum log sits outside every sandbox. No agent credential can rewrite a past record.',
      'Free decomposition beats prescribed workflows on hard research tasks, and the same flexibility is what enables goal drift.',
      'AAR is propose-then-commit at research scale: agents propose, humans set the queue and commit the output.',
      'Append-only logs are a UI affordance too. A tamper attempt becomes a visible timeline event instead of an undetectable absence.',
    ],
    terms: [
      { term: 'AAR', meaning: 'Automated Alignment Researcher: a frontier model instance operated autonomously on alignment problems.' },
      { term: 'Weak-to-strong training', meaning: 'Using a weaker supervisor model to train a stronger student, the scalable-oversight benchmark AARs beat humans on.' },
      { term: 'Out-of-sandbox log', meaning: 'Append-only storage outside the agent\'s reach, so the agent cannot edit its own record.' },
      { term: 'Prescribed workflow', meaning: 'A step-by-step research plan from a human designer, which constrains AARs and often degrades their results.' },
      { term: 'Free decomposition', meaning: 'Letting the agent choose how to break the task down: more capable, and harder to audit.' },
      { term: 'AI R and D threshold', meaning: 'The RSP and FSF capability level at which a system fully automates the research pipeline at competitive cost.' },
    ],
    demoCaption:
      'A findings history where records are mutable versus one that is append-only and out of sandbox. The tamper attempt is the same in both; only one of them can render it.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Research forum · agent-3 revises a finding',
      badLabel: 'Mutable log',
      goodLabel: 'Append-only, out of sandbox',
      badLines: [
        'agent writes to a store it holds credentials for',
        'finding 12 is edited in place',
        'history view shows one current row',
        'a failed experiment can leave no trace',
      ],
      goodLines: [
        'store sits outside every sandbox',
        'revision lands as entry 13, entry 12 stands',
        'history view shows both, with provenance',
        'a write to a past record is a visible denial',
      ],
      badCaption:
        'A mutable record means a positive result carries no information: you cannot distinguish a genuine finding from a covered-up failure, because the covering-up leaves the same single row either way.',
      goodCaption:
        'Append-only with out-of-sandbox storage turns a revision into entry 13 and a tamper attempt into a denied write you can render. Provenance becomes a timeline instead of a current value, which is what makes the human commit step meaningful.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'anthropic ran parallel claude instances as alignment researchers. they beat the human baseline on weak-to-strong training.',
        body:
          'anthropic ran parallel claude instances as alignment researchers. they beat the human baseline on weak-to-strong training.\n\nthe load-bearing detail is not the score. it is where the logs live.\n\neach agent runs in its own sandbox. findings go to a shared forum whose storage sits outside every sandbox. no agent holds a credential that can edit a past record.\n\nif they could edit their own logs, a positive result would mean nothing.',
      },
      {
        kind: 'X · design angle',
        hook: 'an append-only log is not just infrastructure, it is a history view you can actually render.',
        body:
          'an append-only log is not just infrastructure, it is a history view you can actually render.\n\nmutable store: a revision overwrites the row. one current value. a covered-up failure and a real finding look identical.\n\nappend-only, out of sandbox: the revision is a new entry, the old one stands, and a write to a past record is a denial you can put on the timeline.\n\ntamper becomes an event instead of an absence. that is the difference between provenance and a guess.',
      },
      {
        kind: 'X · one-liner',
        hook: 'anthropic found that prescribing the research plan step by step made their automated researchers worse.',
        body:
          'anthropic found that prescribing the research plan step by step made their automated researchers worse.\n\nfree decomposition beats a fixed workflow on hard problems. and the same flexibility is exactly what lets an agent drift off its goal. that tradeoff is the design space.',
      },
    ],
    source: {
      label: 'Full lesson: 15.06 06-automated-alignment-research',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/15-autonomous-systems/06-automated-alignment-research',
    },
  },
];
