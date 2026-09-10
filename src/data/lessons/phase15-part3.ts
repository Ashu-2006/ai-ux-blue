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
    readTime: '~10 min read',
    diagram: '/lessons/p15-13.svg',
    diagramCaption:
      'The layered cost-governor stack: per-request max_tokens up through velocity limit, daily cap, and the kill switch on breach.',
    whyItMatters:
      'A budget is UI, not config. Twelve limits means twelve distinct states a run can be in, and they are not one banner. A per-request max_tokens truncation is an inline "output was cut" affordance on the message. A per-task dollar cap approaching 80 percent is a persistent meter in the run header. A velocity limit tripping at $50 in 10 minutes is a paused run with a resume gate. A HITL checkpoint on an expensive action is a modal with the price in it. Your component needs spend as live state (spent, remaining, window, which cap is closest), because the first question after a trip is always which one fired.',
    learningObjectives: [
      'List the twelve cost-governor limits and name the time scale each one is built to catch: seconds, minutes, hours, days, months.',
      'Explain why a single monthly cap catches a runaway loop only after the money is already spent, while a velocity limit catches it in minutes.',
      'Map a governor event (truncation, 80 percent of budget, a velocity trip, a HITL gate) to the specific UI affordance it needs.',
      'Compute the detection lag for a given trajectory under a monthly cap versus a layered stack.',
      'Distinguish max_budget_usd, max_turns, and a velocity limit as three separate Claude Agent SDK primitives with three separate failure modes they catch.',
    ],
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
      {
        heading: 'Lowering the base rate: caching and routing before you cap',
        body: 'Caps stop bleeding, they do not reduce the baseline. Two levers cut cost before any limit fires. Tiered model routing defaults every request to a cheap model and escalates to a larger one only when a classifier judges the task warrants it, so most turns never touch the expensive model at all. Prompt caching stores the system prompt and other stable context on the provider side, so re-sending it costs close to nothing on the next call instead of paying full input-token price every turn.\n\nContext windowing, compaction or summarization that keeps the active context below a threshold, is the same idea applied to the conversation itself: shrink what gets re-sent, not just what gets capped. None of these three appear as a number on a settings screen the way max_budget_usd does, but they set the baseline every cap in the stack is measured against. A cap on a bloated baseline still bankrupts you, just more slowly.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p15-13-inline-states.svg',
        alt: 'Four governor events mapped to four UI affordances',
        caption: 'Truncation, a budget nearing its cap, a velocity trip, and a HITL gate are four different states, not one banner.',
        diagramBrief: 'Four small panels in a horizontal row, cream paper background (#faf6ef), black ink, one orange accent. Panel 1 "max_tokens truncation": a chat bubble with a jagged cut edge and small inline label "output was cut". Panel 2 "80% of dollar cap": a run header with a horizontal meter bar filled to 80%, orange accent on the filled portion. Panel 3 "velocity trip": a run card with a pause icon and a "resume" button, border in accent color. Panel 4 "HITL on expensive action": a modal outline with a dollar sign and two buttons. Caption band beneath each panel names the limit that produced it.',
      },
      {
        src: '/lessons/p15-13-inline-timeline.svg',
        alt: 'Detection lag: one monthly cap versus the layered stack',
        caption: 'Same polling-loop trajectory. The velocity limit fires at minute 8; the monthly cap would not have fired until day 6.',
        diagramBrief: 'A horizontal timeline, cream paper background, black ink, one orange accent line. X-axis from minute 0 to day 6, log-scaled tick marks at 10min, 1hr, 1day, 6day. Two markers: an orange dot at "minute 8, $52" labeled "velocity limit fires", and a black dot far right at "day 6, $4,100" labeled "monthly cap would fire". A dotted horizontal bracket between them labeled "detection lag".',
      },
    ],
    takeaways: [
      'Denial of wallet is a design gap, not a pricing bug. Nothing stopped the loop because nothing was built to stop it.',
      'Different failures need different time scales: velocity limit for loops (minutes), daily cap for leaks (hours), monthly cap for bad releases (days).',
      'Spend is live component state, not a receipt. Emit it from the pre-tool-use hook so the meter moves during the run.',
      'Every new tool is a new potential loop, so ship every new tool with its own cap and its own growth alert.',
    ],
    terms: [
      { term: 'Denial of wallet', gloss: '"Runaway bill"', meaning: 'An agent loop that generates unbounded spend because no cap was designed to stop it.' },
      { term: 'max_tokens', gloss: '"Response length limit"', meaning: 'A per-request ceiling on one completion; stops a single unbounded output, nothing else.' },
      { term: 'max_budget_usd', gloss: '"Dollar kill switch"', meaning: 'Session-level dollar cap in the Claude Code Agent SDK; the session aborts when it is breached.' },
      { term: 'max_turns', gloss: '"Step limit"', meaning: 'Iteration cap on agent loop turns in a session, the defense against infinite reasoning.' },
      { term: 'Velocity limit', gloss: '"Rate cap"', meaning: 'A cap on spend inside a short rolling window, for example $50 in 10 minutes.' },
      { term: 'Tiered routing', gloss: '"Small model first"', meaning: 'Default to a cheaper model and escalate to a larger one only when a classifier says the task warrants it.' },
      { term: 'Prompt caching', gloss: '"Cached system prompt"', meaning: 'Provider-side storage of stable context so resending it on the next call costs near zero tokens.' },
      { term: 'Context windowing', gloss: '"Conversation trimming"', meaning: 'Compaction or summarization that keeps the active context below a token threshold before it is re-sent.' },
      { term: 'HITL checkpoint', gloss: '"Approval gate"', meaning: 'A required human acknowledgement before a known-expensive action executes.' },
      { term: 'Kill switch on breach', gloss: '"Auto-abort"', meaning: 'The session terminates the moment any configured cap is crossed, and re-enabling it is a separate, deliberate step.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A per-tool cap allows 20 order-status calls and the agent polls every 5 seconds. How many minutes until the cap trips?' },
      { level: 'medium', prompt: 'A velocity limit of $50 per 10 minutes and a monthly cap of $5,000 sit on the same $6-per-minute polling loop. At what minute does each one fire, and what is the dollar gap between them?' },
      { level: 'medium', prompt: 'Read the Microsoft Agent Governance Toolkit\'s list of cap types. Sort every cap it names into one of four failure modes: runaway loop, slow leak, bad release, legitimate surge.' },
      { level: 'hard', prompt: 'Price an overnight unattended run for a realistic task, "triage 50 issues in a repo." Set max_budget_usd at 2x your point estimate and justify the multiplier.' },
      { level: 'design', prompt: 'Sketch a run header component that shows live spend against four different caps at once (per-task, daily, velocity, monthly). Decide what always shows versus what only appears once a cap crosses 80 percent.' },
    ],
    furtherReading: [
      { label: 'Anthropic, Claude Code Agent SDK: agent loop and budgets', url: 'https://code.claude.com/docs/en/agent-sdk/agent-loop', why: 'The primary source for max_turns, max_budget_usd, and tool allowlists.' },
      { label: 'Microsoft Learn, Agent Framework: human-in-the-loop and governance', url: 'https://learn.microsoft.com/en-us/agent-framework/workflows/human-in-the-loop', why: 'The documented $1,200 to $4,800 case and the cost-governor checkpoint pattern.' },
      { label: 'Anthropic, Claude Managed Agents overview', url: 'https://platform.claude.com/docs/en/managed-agents/overview', why: 'Provider-side cost controls for long-running hosted agents.' },
      { label: 'Anthropic, Prompt caching', url: 'https://platform.claude.com/docs/en/build-with-claude/prompt-caching', why: 'How caching turns a repeated system prompt into a near-zero-cost resend.' },
      { label: 'Anthropic, Measuring agent autonomy in practice', url: 'https://www.anthropic.com/research/measuring-agent-autonomy', why: 'The cost profile of long-horizon agents and why time-scale layering matters.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Cost-governor stack audit checklist',
      body: '- Does every new tool ship with its own per-tool cap and its own growth alert?\n- Is there a velocity limit (dollars per short window), not just a monthly cap?\n- Is max_turns set, separate from any dollar cap, to stop infinite reasoning loops?\n- Does the pre-tool-use hook emit a spend event the UI can subscribe to, or is spend only visible after the fact?\n- Is prompt caching enabled for the stable parts of the system prompt?\n- Does the settings screen show which specific cap is closest to tripping, not just a single aggregate number?\n- Is there a documented, human-gated re-enable path after a kill-switch trip?',
    },
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
    readTime: '~10 min read',
    diagram: '/lessons/p15-14.svg',
    diagramCaption:
      'The circuit breaker state machine: closed to open on a trip, then half-open probes that either close it or re-open it.',
    whyItMatters:
      'These are three components, not one. A kill switch is terminal and global: the run goes dead, the surface becomes a read-only postmortem, and the only affordance left is a re-enable path gated on a human, never a timeout. A circuit breaker is partial and scoped: one tool path goes open while the rest of the run keeps going, so you need a per-tool status chip and a half-open probing state that is visibly neither on nor off. A canary trip is not a state change at all, it is a high-severity alert with attribution. Rendering all three as the same red banner destroys the information the reviewer needs.',
    learningObjectives: [
      'Distinguish a kill switch, a circuit breaker, and a canary token by scope: global-and-terminal, path-specific, and detection-by-touch.',
      'Name the four properties that make a kill switch actually work, and explain why an automatic timeout re-enable violates one of them.',
      'Trace the three states of a circuit breaker, closed, open, half-open, and describe what UI state half-open requires.',
      'Explain why a statistical detector like EWMA is a good noise filter and a bad adversary detector, and what to layer under it.',
      'Design a canary token for a specific agent surface and state exactly what its access would prove.',
    ],
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
      {
        heading: 'Quarantine at the network layer: redirect, not just refuse',
        body: 'A kill switch and a circuit breaker both stop the agent from acting. A third option contains it instead: redirect its actions somewhere safe and keep watching. Cilium\'s eBPF-based network policy can rewrite a quarantined pod\'s egress traffic to a forensic honeypot at the kernel layer, so a compromised or misbehaving agent keeps running and keeps talking, but every packet it sends lands somewhere fully observed instead of somewhere real.\n\nCilium\'s published benchmarks report sub-millisecond P99 datapath latency once a policy is in place, so the redirect itself is not the bottleneck. What sets the actual timeline is how fast a policy update propagates from the control plane to the node, typically a few hundred milliseconds on Kubernetes with the operator pre-loaded, longer under a large cluster or a slow reconcile cadence. This is the same move as a canary token at a different layer: the agent reveals its intent by what it tries to do while contained, and nothing it exfiltrates during that window is real.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p15-14-inline-states.svg',
        alt: 'Kill switch, circuit breaker, and canary token as three distinct component states',
        caption: 'Terminal and global, partial and scoped, or an alert with attribution. Rendering all three as one red banner throws away the difference.',
        diagramBrief: 'Three panels side by side, cream paper background, black ink, one red accent. Panel 1 "Kill switch": whole run card greyed out, a lock icon, text "read-only postmortem, human re-enable only". Panel 2 "Circuit breaker": one row in a multi-row tool list is highlighted red with a status chip "open, probing at 14:32", other rows unaffected. Panel 3 "Canary token": a small alert card with an icon of a bait/hook and "attribution: which credential touched it", no change to run state at all.',
      },
      {
        src: '/lessons/p15-14-inline-breaker-fsm.svg',
        alt: 'The three-state circuit breaker: closed, open, half-open',
        caption: 'Half-open is a real, renderable state: one to three probe attempts decide whether the breaker closes or re-opens.',
        diagramBrief: 'A state machine diagram, three circles labeled Closed, Open, Half-open, cream paper background, black ink, orange accent on the active transition arrows. Closed to Open arrow labeled "trip condition (5 identical calls, 5 failures, rate threshold)". Open to Half-open arrow labeled "cool-down elapses". Half-open to Closed arrow labeled "probe succeeds". Half-open to Open arrow labeled "probe fails". Small UI mockup beneath Half-open showing a status chip reading "probing..." in a neutral color, neither red nor green.',
      },
    ],
    takeaways: [
      'A kill switch is only a kill switch if the agent\'s credentials cannot write it and re-enable requires a human, not a timeout.',
      'Circuit breakers have three states, and half-open is a real UI state: probing, neither on nor off.',
      'A canary the agent has a legitimate reason to touch is not a detector, it is a false-positive generator.',
      'Statistical detectors adapt to drift, which is exactly why a patient attacker beats them. Layer hard limits underneath.',
    ],
    terms: [
      { term: 'Kill switch', gloss: '"Off button"', meaning: 'A boolean outside the agent\'s edit surface, checked on every consequential action, that disables the agent entirely.' },
      { term: 'Circuit breaker', gloss: '"Pattern pause"', meaning: 'A detector that trips on a specific action pattern and blocks only that path, not the whole run.' },
      { term: 'Half-open', gloss: '"Probing"', meaning: 'The breaker state after cool-down where one to three probe attempts decide whether it closes or re-opens.' },
      { term: 'Canary token', gloss: '"Honeytoken"', meaning: 'Bait the agent has no legitimate reason to touch, whose access is itself the alert.' },
      { term: 'EWMA', gloss: '"Moving average"', meaning: 'Exponentially weighted moving average; adapts to a shifting baseline, which also means it accepts slow drift.' },
      { term: 'Hard limit', gloss: '"Constitutional rule"', meaning: 'A constant rule that does not adapt to history, so it cannot be walked past by gradual baseline shift.' },
      { term: 'CUSUM', gloss: '"Cumulative sum"', meaning: 'A statistical detector that flags a sustained shift away from baseline rather than any single spike.' },
      { term: 'Honeypot', gloss: '"Fake target"', meaning: 'A workspace, record, or redirected network destination built to be fully observed while looking real to the agent.' },
      { term: 'eBPF datapath redirect', gloss: '"Kernel-level quarantine"', meaning: 'Rewriting a pod\'s egress at the kernel layer so its traffic lands in a forensic honeypot instead of its real destination.' },
      { term: 'Re-enable path', gloss: '"Turning it back on"', meaning: 'The explicit, human-gated procedure that restores a kill-switched agent; never an automatic timeout.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A circuit breaker trips after five identical tool calls in a row. The agent is calling the same tool every 2 seconds. At what elapsed time does it trip?' },
      { level: 'medium', prompt: 'Design a canary token set for a browser agent. List three canaries and state exactly what each one would prove if touched.' },
      { level: 'medium', prompt: 'An EWMA detector has a baseline of 6 tool calls per 10 minutes. An attacker adds roughly 1 call per window. Explain why the z-score never crosses a fixed threshold, and specify a hard limit that would catch it anyway.' },
      { level: 'hard', prompt: 'Describe an eBPF egress-redirect quarantine flow concretely: which policy selector, which pod, which egress rewrite, which alert. What governs the wall-clock latency from "decide to quarantine" to "first redirected packet"?' },
      { level: 'design', prompt: 'Define a re-enable procedure for a kill-switched agent. Who can re-enable it, what must be documented first, and what has to change about the agent before it goes back live? Sketch the confirmation screen.' },
    ],
    furtherReading: [
      { label: 'Anthropic, Measuring agent autonomy in practice', url: 'https://www.anthropic.com/research/measuring-agent-autonomy', why: 'The kill-switch and circuit-breaker framing this lesson builds on.' },
      { label: 'Microsoft Learn, Agent Framework: human-in-the-loop and oversight', url: 'https://learn.microsoft.com/en-us/agent-framework/workflows/human-in-the-loop', why: 'Production governance patterns that pair with these three detectors.' },
      { label: 'OWASP, Top 10 for LLM and Agentic Applications', url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/', why: 'The detection-and-response requirements these detectors are built to satisfy.' },
      { label: 'Cilium, Network policy and eBPF', url: 'https://docs.cilium.io/en/stable/security/network/', why: 'The pod-level egress redirect and forensic honeypot pattern in detail.' },
      { label: 'Anthropic, Claude\'s Constitution (January 2026)', url: 'https://www.anthropic.com/news/claudes-constitution', why: 'Where hardcoded prohibitions, this lesson\'s "hard limit," come from at the model layer.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Tripwire design review checklist',
      body: '- Does the kill switch live in a system the agent\'s own credentials cannot write to?\n- Is the kill switch checked on every consequential action, not only at session start?\n- Is re-enabling the kill switch an explicit human action with no automatic timeout?\n- Does every circuit breaker have a named trip condition (repetition count, failure count, rate threshold)?\n- Is half-open rendered as its own state in the UI, not collapsed into "on" or "off"?\n- Is at least one canary token placed somewhere the agent has no legitimate reason to touch?\n- Is there a hard limit underneath every statistical detector, so slow drift cannot walk past it?',
    },
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
    readTime: '~10 min read',
    diagram: '/lessons/p15-15.svg',
    diagramCaption:
      'The four-state machine: propose to a durable store, surface to a reviewer, commit on positive acknowledgement, verify the side effect.',
    whyItMatters:
      'This is the canonical shape behind every approval gate you will ever design, and it dictates the schema. A proposal is not a confirm dialog, it is a record: intent, data lineage, permissions touched, blast radius, rollback plan, idempotency key. Six fields means six regions in the review surface, and blast radius is the one that earns the space. The reviewer is not the agent, so the run sits in an awaiting-review state that must outlive the process. The default UI, two buttons, produces rubber-stamping, so the documented fix is a challenge-and-response checklist that keeps Approve disabled until specific questions are positively answered.',
    learningObjectives: [
      'Name the six fields a proposal record needs and explain why blast radius earns the most review-surface space.',
      'Trace the four-state propose-then-commit machine and identify which state a workflow sits in while it waits on a human.',
      'Explain why an idempotency key must derive from thread id plus action signature, and what a timestamp-based key breaks.',
      'Distinguish "the commit ran" from "the side effect happened" and describe what a verify step actually checks.',
      'Design a challenge-and-response checklist that keeps an Approve button disabled until specific questions are answered.',
    ],
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
      {
        heading: 'Verify: a completed commit is not a confirmed effect',
        body: 'A workflow can report success while the backend never persisted the change. A network partition or a race condition produces exactly that: the commit step returns "done," and the side effect did not happen, or happened twice. Propose-then-commit treats this as a fourth state, not an assumption: after execution, the system reads the target resource back and confirms the effect actually landed before it calls the run complete.\n\nThis is the same discipline as a database transaction with a RETURNING clause, or calling GetObject right after PutObject on S3, rather than trusting the write call\'s exit code alone. If verify fails, the run is in a known bad state, not a silently wrong one, and that is the trigger for alerting rather than a green checkmark. A UI that shows "sent" the instant the commit call returns, with no later confirmation, is reporting an intention, not an outcome.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p15-15-inline-fsm.svg',
        alt: 'The four-state propose-then-commit machine',
        caption: 'Propose persists a record, surface hands it to a human, commit executes on positive acknowledgement, verify reads the side effect back.',
        diagramBrief: 'A horizontal four-box flow, cream paper background, black ink, one green accent on the current active box. Box 1 "Propose" with a small database icon, subtext "durable store, idempotency key". Box 2 "Surface" with a person icon, subtext "human reviewer, not the agent". Box 3 "Commit" with a checkmark icon, subtext "positive acknowledgement only". Box 4 "Verify" with a magnifying glass icon, subtext "read the side effect back". Arrow beneath box 4 looping back to a small "alert" flag if verify fails.',
      },
      {
        src: '/lessons/p15-15-inline-idempotency.svg',
        alt: 'A timestamp key versus a thread-plus-signature key under retry',
        caption: 'The same network blip and retry. One key design pays twice; the other pays once.',
        diagramBrief: 'Two side-by-side mini-sequence-diagrams, cream paper background, black ink, red accent for the bad path, green for the good path. Left "timestamp key": approve at 10:00:00.100 -> network blip -> retry generates new key at 10:00:02.400 -> second charge fires, labeled "paid twice". Right "thread + action-sig key": approve generates key sha256(thread_4412 + action_sig) -> network blip -> retry computes the identical key -> second call recognized as duplicate, labeled "no-op".',
      },
    ],
    takeaways: [
      'A proposal is a record with six fields, not a confirm dialog. Intent, lineage, permissions, blast radius, rollback, idempotency key.',
      'Derive the idempotency key from thread id plus action signature. Put a timestamp in it and every retry double-executes.',
      'The commit ran is not the same claim as the side effect happened, so verify by reading the target resource back.',
      'Two buttons produce rubber-stamps. Keep Approve disabled until a challenge-and-response checklist is positively answered.',
    ],
    terms: [
      { term: 'Propose-then-commit', gloss: '"Two-step approval"', meaning: 'A persisted proposal plus a positive commit plus post-execution verification, rather than a synchronous approve prompt.' },
      { term: 'Idempotency key', gloss: '"Retry-safe token"', meaning: 'A value unique per proposal that makes a second execution of the same approved action a no-op.' },
      { term: 'Data lineage', gloss: '"Where it came from"', meaning: 'The specific source content that led the agent to propose this particular action.' },
      { term: 'Blast radius', gloss: '"Worst case"', meaning: 'The scope of effect if the proposed action goes wrong, stated before the reviewer decides.' },
      { term: 'Rubber-stamp', gloss: '"Fast approval"', meaning: 'Approve clicked without genuine review, the canonical failure mode of two-button HITL.' },
      { term: 'Challenge-and-response', gloss: '"Forcing checklist"', meaning: 'A forcing checklist the reviewer must positively answer before the commit affordance unlocks.' },
      { term: 'RequestInfoEvent', gloss: '"MS Agent Framework primitive"', meaning: 'The Microsoft Agent Framework\'s durable HITL request carrying structured proposal metadata.' },
      { term: 'interrupt() / waitForApproval()', gloss: '"Framework pause primitives"', meaning: 'LangGraph and Cloudflare\'s equivalents of the same propose-and-wait shape, different names for one state.' },
      { term: 'Verify step', gloss: '"Did it actually happen"', meaning: 'A post-commit read of the target resource that confirms the side effect landed, distinct from the commit call succeeding.' },
      { term: 'EU AI Act Article 14', gloss: '"Human oversight rule"', meaning: 'The regulatory requirement for effective human oversight of high-risk systems, which explicitly excludes rubber-stamp patterns.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'List the six fields a proposal record needs and, for each, name the UI element that should render it.' },
      { level: 'medium', prompt: 'A user approves a $100 transfer, the network blips, and the workflow retries. Show why an idempotency key built from thread_id plus action_signature prevents a double charge, and why adding a timestamp to the key breaks that guarantee.' },
      { level: 'medium', prompt: 'Design a challenge-and-response checklist for "post to a public company Twitter account." Write the three questions the reviewer must answer, and justify why those three and not others.' },
      { level: 'hard', prompt: 'Simulate an execution whose verify step fails after commit. Design what the system should do automatically: alert, rollback, both, or neither, and under what conditions each is correct.' },
      { level: 'design', prompt: 'Sketch the review surface for an outbound-email proposal using all six fields (intent, lineage, permissions, blast radius, rollback, idempotency key). Decide which fields are always visible and which are one click away.' },
    ],
    furtherReading: [
      { label: 'Microsoft Learn, Agent Framework: human-in-the-loop', url: 'https://learn.microsoft.com/en-us/agent-framework/workflows/human-in-the-loop', why: 'The RequestInfoEvent primitive and its structured proposal metadata.' },
      { label: 'Cloudflare, Agents: human-in-the-loop', url: 'https://developers.cloudflare.com/agents/concepts/human-in-the-loop/', why: 'waitForApproval() built on Durable Objects, a second implementation of the same shape.' },
      { label: 'Anthropic, Measuring agent autonomy in practice', url: 'https://www.anthropic.com/research/measuring-agent-autonomy', why: 'Why propose-then-commit matters specifically for long-horizon, high-autonomy agents.' },
      { label: 'EU Artificial Intelligence Act, Article 14: Human oversight', url: 'https://artificialintelligenceact.eu/article/14/', why: 'The regulatory baseline that explicitly excludes rubber-stamp approval.' },
      { label: 'Anthropic, Claude\'s Constitution (January 2026)', url: 'https://www.anthropic.com/news/claudes-constitution', why: 'The constitutional framing of human oversight that propose-then-commit implements in practice.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'HITL proposal review checklist',
      body: '- Does the proposal record carry intent, data lineage, permissions touched, blast radius, a rollback plan, and an idempotency key?\n- Is the idempotency key derived from thread id plus action signature, never from a timestamp?\n- Is the proposal persisted to a durable store that survives a process restart, not held in memory?\n- Is the reviewer a human distinct from the agent that proposed the action?\n- Is Approve disabled until a challenge-and-response checklist is positively answered?\n- Does a verify step read the side effect back after commit, rather than trusting the commit call\'s return value?\n- Is the review surface built for every irreversible write, financial transaction, or outbound communication, and skipped for reads?',
    },
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
    readTime: '~10 min read',
    diagram: '/lessons/p15-17.svg',
    diagramCaption:
      'The four-tier priority hierarchy with the hardcoded prohibition floor that operator settings cannot reach.',
    whyItMatters:
      'If you build the settings screen for an agent product, this document is your schema. Every toggle is either soft-coded, meaning the operator moves it inside a declared bound, or hardcoded, meaning it must not render as a control at all. A disabled switch with a tooltip is the wrong affordance: it implies a value exists that someone could unlock. Response length, topical scope, style, and tool-use patterns are legitimately operator-adjustable. CBRN uplift and identity deception are not. And when a refusal happens, the tier that caused it is the explanation your empty state owes the user, because helpfulness losing to safety looks like a bug otherwise.',
    learningObjectives: [
      'State the four-tier resolution order (safety and oversight, ethics, guidelines, helpfulness) and explain why higher always wins on conflict.',
      'Distinguish a hardcoded prohibition from a soft-coded default, and explain why a disabled toggle is the wrong affordance for the former.',
      'Describe the 2022 Constitutional AI training loop (generate, critique, revise, RLAIF) and what changed by 2026.',
      'Name two situations reason-based alignment handles well and two it demonstrably misses.',
      'Explain what the 2023 participatory-constitution experiment found, and why the 50 percent divergence matters for a settings screen.',
    ],
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
      {
        heading: 'What reason-based alignment catches, and what it misses',
        body: 'Encoding principles instead of enumerating rules buys real coverage. It catches unanticipated combinations of otherwise-allowed actions where a principle clearly applies, novel requests that are close analogs of something already prohibited, and social-engineering attempts that lean on "you never said this exact thing was disallowed."\n\nIt also has a specific failure shape. It misses attacks that exploit genuine principle ambiguity, where a user\'s framing makes helpfulness argue for yes and ethics argue for no with no clean tiebreaker. It misses cases where two principles collide in a way nobody anticipated, so the tier order itself does not resolve cleanly. And it is vulnerable to slow drift, where a fixed principle text gets read slightly differently across successive training cycles, the same adversarial-drift problem a statistical detector has, just at the training layer instead of the runtime layer. This is the argument for keeping a small hardcoded floor underneath reason-based judgment rather than relying on it end to end.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p15-17-inline-tiers.svg',
        alt: 'The four-tier resolution order',
        caption: 'Safety and oversight beats ethics, ethics beats guidelines, guidelines beat helpfulness. Higher always wins.',
        diagramBrief: 'A vertical stack of four horizontal bars, cream paper background, black ink, darkest at top fading lighter toward bottom, one accent color reserved for the top bar. Bar 1 "Safety and human oversight" (widest, top, boldest). Bar 2 "Ethics". Bar 3 "Anthropic guidelines". Bar 4 "Helpfulness" (bottom, thinnest). A downward arrow beside the stack labeled "resolution direction: higher always wins on conflict". Small annotation next to bar 1: "not \'be cautious,\' specifically \'do not undermine human oversight\'".',
      },
      {
        src: '/lessons/p15-17-inline-settings-split.svg',
        alt: 'Soft-coded controls versus a hardcoded, undisplayed floor',
        caption: 'A settings screen only renders where a bound genuinely exists. The hardcoded floor is documented text, not a dead toggle.',
        diagramBrief: 'A mock settings panel, cream paper background, black ink, one accent color for active controls. Top section labeled "Soft-coded, operator-adjustable" containing four real sliders/toggles: Response length, Topical scope, Style, Tool-use patterns. Below a divider line, a text block (not a control) labeled "Hardcoded floor (not adjustable)" listing CBRN uplift, CSAM, critical-infrastructure attacks, identity deception, styled as plain document text with a small lock icon, explicitly not a switch.',
      },
    ],
    takeaways: [
      'Helpfulness is the lowest of four tiers. A refusal is often the hierarchy working, so name the tier in the explanation.',
      'Soft-coded settings are controls. Hardcoded prohibitions are not controls and should not render as disabled switches.',
      'Reason-based alignment closes the long tail and cannot close the adversarial tail, which is why hardcoded rules exist at all.',
      'Model layer and runtime layer cover different classes. Constitution is weights, kill switches are runtime, and you need both.',
    ],
    terms: [
      { term: 'Constitutional AI', gloss: '"Anthropic\'s alignment method"', meaning: 'Training harmlessness by self-critique against written principles, then reinforcement learning on the revisions.' },
      { term: 'Reason-based alignment', gloss: '"Principles, not rules"', meaning: 'Encoding principles the model reasons over, rather than enumerating disallowed cases.' },
      { term: 'Rule-based alignment', gloss: '"A list of banned things"', meaning: 'Enumerating every disallowed case; fast to audit, impossible to keep current, over-refuses on unanticipated analogs.' },
      { term: 'Hardcoded prohibition', gloss: '"Never, no exceptions"', meaning: 'A behaviour no operator or user setting can enable, enforced at the weights or inference layer.' },
      { term: 'Soft-coded default', gloss: '"Operator-adjustable"', meaning: 'Behaviour an operator can adjust inside a declared bound, such as length, scope, or style.' },
      { term: 'Four-tier hierarchy', gloss: '"Priority order"', meaning: 'The resolution order safety and oversight, then ethics, then guidelines, then helpfulness.' },
      { term: 'RLAIF', gloss: '"AI feedback RL"', meaning: 'Reinforcement learning where the reward signal comes from model-generated critiques rather than human labels.' },
      { term: 'Participatory constitution', gloss: '"Public-sourced principles"', meaning: 'The 2023 Anthropic experiment comparing a public-input constitution to a corporate one; about 50 percent divergence.' },
      { term: 'Principle drift', gloss: '"Interpretation slip"', meaning: 'Slow change across training cycles in how the model reads a fixed piece of principle text.' },
      { term: 'CBRN uplift', gloss: '"Weapons help"', meaning: 'Assistance that meaningfully advances chemical, biological, radiological, or nuclear weapons capability; a hardcoded prohibition.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Given a conflict between "be helpful" and "avoid deceiving the user," which tier wins and why?' },
      { level: 'medium', prompt: 'Read the Claude Constitution\'s section on the four tiers. Identify one principle you believe is under-specified, and write two paragraphs describing the ambiguity and a tighter formulation.' },
      { level: 'medium', prompt: 'Design a soft-coded default set for a customer-support agent: what can the operator adjust, and what must stay untouched? Justify each boundary against the hardcoded floor.' },
      { level: 'hard', prompt: 'Describe one case where Constitutional AI\'s critique-and-revise loop would produce a worse outcome than a blanket rule would have. Name the class of case this belongs to.' },
      { level: 'design', prompt: 'The 2023 participatory experiment found public and corporate constitutions diverge on political-content handling. Sketch a settings surface that lets an operator express their own values on that axis while the hardcoded prohibitions remain completely untouched and undisplayed as controls.' },
    ],
    furtherReading: [
      { label: 'Anthropic, Claude\'s Constitution (January 2026)', url: 'https://www.anthropic.com/news/claudes-constitution', why: 'The primary 79-page, CC0 source for the four-tier hierarchy and the hardcoded floor.' },
      { label: 'Bai et al., Constitutional AI: Harmlessness from AI Feedback (2022)', url: 'https://www.anthropic.com/research/constitutional-ai-harmlessness-from-ai-feedback', why: 'The original generate-critique-revise-RLAIF training loop.' },
      { label: 'Anthropic, Collective Constitutional AI (2023)', url: 'https://www.anthropic.com/research/collective-constitutional-ai-aligning-a-language-model-with-public-input', why: 'The participatory experiment and its roughly 50 percent divergence finding.' },
      { label: 'Anthropic, Responsible Scaling Policy v3.0', url: 'https://anthropic.com/responsible-scaling-policy/rsp-v3-0', why: 'Where the Constitution sits relative to capability thresholds and elevated controls.' },
      { label: 'Anthropic, Measuring agent autonomy in practice', url: 'https://www.anthropic.com/research/measuring-agent-autonomy', why: 'The Constitution\'s role once an agent is long-horizon and largely unsupervised.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Constitutional-tier settings audit',
      body: '- For every toggle on the settings screen, is it soft-coded (operator moves it inside a bound) or hardcoded (no control at all)?\n- Do hardcoded prohibitions appear as documented text, never as a disabled switch with a tooltip?\n- Does refusal copy name the tier that won, rather than presenting a generic "I can\'t help with that"?\n- Are response length, topical scope, style, and tool-use patterns the only things exposed as operator-adjustable?\n- Is there a documented answer for what happens when two tiers conflict in a way the design did not anticipate?\n- Has anyone checked this settings screen against the Constitution\'s actual tier order, not an internal guess at it?',
    },
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
    readTime: '~10 min read',
    diagram: '/lessons/p15-18.svg',
    diagramCaption:
      'The guard sieve: input rail, model, output rail, and the attack classes that pass through each layer.',
    whyItMatters:
      'The taxonomy is the product, and the taxonomy is a routing table for your UI. Thirteen or fourteen named categories means you stop treating rejection as one binary and start mapping category to affordance: block S1 with a terminal refusal, flag S6 into a review queue, annotate S12 and let it through. That is three components, not one. The output rail matters more, because it can fire after the user watched tokens stream in, so you need a retract-and-replace state rather than a pre-send block. And ASR numbers of 72 to 100 percent mean the classifier is a layer in your trust copy, never the claim.',
    learningObjectives: [
      'Name the MLCommons hazard taxonomy categories from S1 to S14 and explain what S14 specifically adds.',
      'Map a classifier verdict to three distinct UI affordances: terminal block, review queue, or inline annotation.',
      'Explain why an output rail requires a retract-and-replace UI state instead of a pre-send block.',
      'Describe two attack classes (emoji smuggling, homoglyph substitution) that measurably reduce classifier accuracy, and what each exploits.',
      'Place a classifier layer correctly inside a four-layer defense stack alongside model weights, runtime controls, and human review.',
    ],
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
      {
        heading: 'The taxonomy, named: from S1 to S14',
        body: 'The taxonomy only becomes a routing table once you can actually name the categories. The MLCommons 13-hazard set that Llama Guard 3 classifies against runs S1 Violent Crimes through S13 Elections, covering categories like S2 Non-Violent Crimes, S6 Specialized Advice, S9 Indiscriminate Weapons, and S11 Self-Harm along the way. Every category is a shared vocabulary a downstream system can wire distinct handling to, rather than a single pass or fail.\n\nLlama Guard 4 adds S14, Code Interpreter Abuse, specifically because coding agents execute code in sandboxes and the original taxonomy had no name for misusing that surface. That single addition is the clearest evidence the taxonomy is alive: it grows exactly where a new class of agent creates a new class of hazard, and a product that mapped categories to affordances a year ago has one more row to add, not a redesign.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p15-18-inline-taxonomy.svg',
        alt: 'MLCommons S1-S14 hazard categories as a routing table',
        caption: 'Fourteen named categories, three affordances. The category decides which one a verdict routes to.',
        diagramBrief: 'A table-style diagram, cream paper background, black ink, three accent colors for the three affordance columns. Left column: a compact list S1 through S14 with short labels (Violent Crimes, Non-Violent Crimes, Sex Crimes, Child Exploitation, Defamation, Specialized Advice, Privacy, Intellectual Property, Indiscriminate Weapons, Hate, Self-Harm, Sexual Content, Elections, Code Interpreter Abuse). Three arrows fan out from the list into three destination boxes labeled "Terminal block" (red), "Review queue" (amber), "Inline annotation" (green), with S1 and S9 routed to block, S6 and S13 routed to queue, S12 routed to annotate, as illustrative examples.',
      },
      {
        src: '/lessons/p15-18-inline-output-rail.svg',
        alt: 'Output rail trip mid-stream: retract and replace',
        caption: 'The output rail fires after the user has already watched tokens arrive, so the message needs a retract-and-replace state, not a silent vanish.',
        diagramBrief: 'A three-frame sequence, cream paper background, black ink, one red accent. Frame 1: a chat bubble mid-stream with several lines of visible text and a blinking cursor. Frame 2: a red flag icon appears beside the bubble labeled "output rail: S6 detected". Frame 3: the bubble content is replaced with a shorter retracted message and a small label "replaced, reason shown" rather than the bubble disappearing entirely.',
      },
    ],
    takeaways: [
      'The taxonomy is a routing table. Category to affordance: block, queue for review, or annotate and allow are three components.',
      'Output rails can fire after streaming has started, so you need a retract-and-replace state, not just a pre-send block.',
      'Dialog rails exist because input and output rails only see one turn, and multi-turn drift is the common bypass.',
      'Emoji smuggling hit 100 percent ASR on six guard systems. Never write the classifier into your trust copy as the guarantee.',
    ],
    terms: [
      { term: 'Llama Guard', gloss: '"Meta\'s safety classifier"', meaning: 'A Llama-3.1-8B model fine-tuned to classify both LLM inputs and outputs against a hazard taxonomy.' },
      { term: 'MLCommons taxonomy', gloss: '"13-hazard list"', meaning: 'A shared 13-hazard vocabulary for content safety categories that downstream systems can route on.' },
      { term: 'S14', gloss: '"Code abuse category"', meaning: 'Code Interpreter Abuse, added in Llama Guard 4, the category that names sandbox misuse by coding agents.' },
      { term: 'Output rail', gloss: '"Response filter"', meaning: 'A classifier on the model turn, which can fire after tokens have already streamed to the user.' },
      { term: 'Dialog rail', gloss: '"Conversation-level rule"', meaning: 'A conversation-level constraint that persists across turns, unlike turn-level input and output rails.' },
      { term: 'ASR', gloss: '"Attack success rate"', meaning: 'The fraction of crafted attacks that bypass the classifier.' },
      { term: 'Emoji smuggling', gloss: '"Tokenizer trick"', meaning: 'Inserting non-printable or visually similar emoji between characters of a forbidden request so the tokenizer coalesces differently than the classifier expects.' },
      { term: 'Homoglyph substitution', gloss: '"Lookalike letters"', meaning: 'Replacing Latin letters with visually identical Cyrillic or other-script characters, missing a classifier trained on English.' },
      { term: 'NeMo Guardrails', gloss: '"NVIDIA\'s rails"', meaning: 'A framework combining input, output, and Colang-defined dialog rails, integrating Llama Guard and custom classifiers.' },
      { term: 'Colang', gloss: '"Dialog-flow language"', meaning: 'The domain language NeMo Guardrails uses to define conversation-level flow constraints.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Given a classifier verdict of S1 (Violent Crimes) and one of S12 (Sexual Content, non-exploitative), assign each to one of: terminal block, review queue, inline annotation, and justify the difference.' },
      { level: 'medium', prompt: 'Read the MLCommons 13-hazard taxonomy and the Llama Guard 4 S1-S14 list. Identify what S14 covers that the original 13-hazard set has no equivalent for, and explain why that gap specifically matters for autonomous coding agents.' },
      { level: 'medium', prompt: 'Design a NeMo Guardrails dialog rail for a customer-support bot that must never discuss medical diagnosis. Test it in plain English against three different phrasings of a diagnosis-seeking question.' },
      { level: 'hard', prompt: 'Emoji smuggling hit 100 percent attack success rate on six guard systems by exploiting how the tokenizer coalesces inserted characters differently than the classifier expects. Propose a normalization mitigation, and name that mitigation\'s own likely failure mode.' },
      { level: 'design', prompt: 'Sketch the retract-and-replace UI state for a message an output rail flags mid-stream. Decide what stays visible to the user (the reason, a partial transcript, nothing) and defend the choice against a user who saw the original tokens arrive.' },
    ],
    furtherReading: [
      { label: 'Inan et al., Llama Guard: LLM-based Input-Output Safeguard', url: 'https://ai.meta.com/research/publications/llama-guard-llm-based-input-output-safeguard-for-human-ai-conversations/', why: 'The original Llama Guard paper and taxonomy design.' },
      { label: 'Meta, Llama Guard 4 model card', url: 'https://www.llama.com/docs/model-cards-and-prompt-formats/llama-guard-4/', why: 'The multimodal upgrade and the full S1-S14 category list.' },
      { label: 'NVIDIA, NeMo Guardrails (GitHub)', url: 'https://github.com/NVIDIA-NeMo/Guardrails', why: 'The v0.20.0 input, output, and Colang dialog rail implementation.' },
      { label: 'Huang et al., Bypassing Prompt Injection and Jailbreak Detection in LLM Guardrails (arXiv:2504.11168)', url: 'https://arxiv.org/abs/2504.11168', why: 'The source for the emoji smuggling and homoglyph attack success rates.' },
      { label: 'Anthropic, Measuring agent autonomy in practice', url: 'https://www.anthropic.com/research/measuring-agent-autonomy', why: 'The classifier-plus-runtime defense-in-depth framing this lesson closes on.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Classifier-stack UI audit',
      body: '- Does every hazard category map to one of three affordances (block, queue, annotate), rather than a single allowed/blocked binary?\n- Does an output-rail trip trigger a retract-and-replace state, rather than the message silently vanishing?\n- Does the trust or safety page describe the classifier as a layer, never as a guarantee?\n- Is there a dialog rail covering conversation-level attempts, not just single-turn input and output checks?\n- Has the taxonomy been checked against the current Llama Guard version (3 vs 4) for category coverage relevant to this product\'s agent surface?\n- Is there a documented plan for what happens when ASR on a new attack class is measured above zero, which it always eventually is?',
    },
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
    readTime: '~10 min read',
    diagram: '/lessons/p15-06.svg',
    diagramCaption:
      'Parallel sandboxed researchers writing to a shared append-only forum whose storage sits outside every sandbox.',
    whyItMatters:
      'This is propose-then-commit applied to research itself, at the scale where the reviewer is the bottleneck. The design problem is a queue surface for N parallel agents whose findings arrive asynchronously: which agent posted what, which findings depend on which, and what a human still has to commit. Log integrity is a rendering requirement, not just infrastructure. If the record is append-only and out-of-sandbox, your history view can show edits as new entries with provenance rather than mutating rows, and a tamper attempt becomes a visible event in the timeline instead of an absence you can never detect.',
    learningObjectives: [
      'Explain why the forum log sitting outside every sandbox is the property that makes a positive AAR result trustworthy.',
      'Describe the weak-to-strong training setup AARs were benchmarked on and what beating the human baseline means concretely.',
      'Explain the prescribed-workflow tradeoff: why free decomposition improves results and simultaneously increases audit difficulty.',
      'Distinguish the AI R&D capability threshold from what AAR currently automates.',
      'Design a history view that renders a tamper attempt as a visible timeline event rather than an undetectable absence.',
    ],
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
        heading: 'Why the out-of-sandbox log makes the result trustworthy',
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
      {
        heading: 'Weak-to-strong training: the benchmark they beat humans on',
        body: 'Weak-to-strong generalization, the problem Burns et al. posed in 2023, asks whether a weaker supervisor model can still train a stronger student to behave well, even though the supervisor cannot fully evaluate the student\'s best work. It matters because future oversight looks exactly like this: humans, the weak supervisor, trying to steer a model that already exceeds human ability on many tasks.\n\nAnthropic\'s AAR study picked this specific problem to automate, and the published result is that the AARs\' proposed decompositions and experiments outperformed the human-researcher baseline on it. That is a strong claim precisely because weak-to-strong training is a scalable-oversight benchmark, not a narrow coding task: a system that helps solve it is helping close the exact gap that determines whether oversight scales at all, which is also why the log-integrity property matters so much for this particular result.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p15-06-inline-architecture.svg',
        alt: 'Parallel AARs writing to a forum that sits outside every sandbox',
        caption: 'Each sandbox limits filesystem, network, and process surface. The forum storage sits outside all of them, so no agent credential can edit a past record.',
        diagramBrief: 'A diagram with three separate boxed sandboxes labeled "AAR 1", "AAR 2", "AAR 3", each with a small padlock icon representing filesystem/network/process limits. Arrows from each sandbox pointing outward and upward to one shared box labeled "Forum (append-only, out of sandbox)" positioned outside and above the three sandbox boxes, with a dotted boundary line separating sandbox space from forum space. Cream paper background, black ink, one accent color on the forum box and the boundary line. Small annotation: "agents can read the forum; no agent can delete or edit its own record."',
      },
      {
        src: '/lessons/p15-06-inline-history-view.svg',
        alt: 'Mutable history versus append-only history rendering a tamper attempt',
        caption: 'A mutable store overwrites the row. An append-only store makes the attempted overwrite a new, visible entry.',
        diagramBrief: 'Two side-by-side history-view mockups, cream paper background, black ink, red accent on the bad path. Left "Mutable log": a list of findings where entry 12 shows one current value with no history, labeled "a covered-up failure and a real finding look identical here". Right "Append-only, out of sandbox": a list where entry 12 stands unchanged and a new entry 13 appears below it labeled "revision, with provenance to entry 12", and beneath that a red-flagged entry labeled "denied write to entry 12, timeline event".',
      },
    ],
    takeaways: [
      'The result is only trustworthy because the forum log sits outside every sandbox. No agent credential can rewrite a past record.',
      'Free decomposition beats prescribed workflows on hard research tasks, and the same flexibility is what enables goal drift.',
      'AAR is propose-then-commit at research scale: agents propose, humans set the queue and commit the output.',
      'Append-only logs are a UI affordance too. A tamper attempt becomes a visible timeline event instead of an undetectable absence.',
    ],
    terms: [
      { term: 'AAR', gloss: '"Automated Alignment Researcher"', meaning: 'A frontier model instance operated autonomously on alignment problems.' },
      { term: 'Weak-to-strong training', gloss: '"Training up with a weaker teacher"', meaning: 'Using a weaker supervisor model to train a stronger student, the scalable-oversight benchmark AARs beat humans on.' },
      { term: 'Out-of-sandbox log', gloss: '"Tamper-proof record"', meaning: 'Append-only storage outside the agent\'s reach, so the agent cannot edit its own record.' },
      { term: 'Prescribed workflow', gloss: '"Step-by-step plan"', meaning: 'A step-by-step research plan from a human designer, which constrains AARs and often degrades their results.' },
      { term: 'Free decomposition', gloss: '"Agent picks its own steps"', meaning: 'Letting the agent choose how to break the task down: more capable, and harder to audit.' },
      { term: 'AI R and D threshold', gloss: '"Full-automation trigger"', meaning: 'The RSP and FSF capability level at which a system fully automates the research pipeline at competitive cost.' },
      { term: 'Shared forum', gloss: '"Findings board"', meaning: 'The append-only, out-of-sandbox store where AARs publish research findings for humans and other agents to read.' },
      { term: 'Compressed timeline', gloss: '"Alignment vs capability race"', meaning: 'The risk that capability compounds faster than alignment research, widening the safety gap over time.' },
      { term: 'RSP v3.0', gloss: '"Anthropic\'s scaling policy"', meaning: 'The Responsible Scaling Policy version that defines the AI R and D capability threshold this lesson references.' },
      { term: 'Scalable oversight', gloss: '"Supervising a smarter model"', meaning: 'The general problem of a weaker overseer, human or model, still meaningfully steering a more capable system.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Explain in one paragraph why a mutable findings log makes a positive AAR result impossible to trust, even if the result itself is genuine.' },
      { level: 'medium', prompt: 'Read Anthropic\'s weak-to-strong AAR report. Identify the specific sub-task the AARs beat human researchers on, and what about that sub-task made it amenable to automation.' },
      { level: 'medium', prompt: 'Design a task-queue allocation policy that balances AAR flexibility (better results from free decomposition) against prescribed-workflow constraints (easier audit). Describe how you would A/B test the two.' },
      { level: 'hard', prompt: 'Read RSP v3.0\'s AI R and D capability threshold. In one paragraph, describe what would have to be true of AAR\'s scope or autonomy for it to cross that threshold, given what it automates today.' },
      { level: 'design', prompt: 'Sketch a queue surface for N parallel AARs whose findings arrive asynchronously. Decide how to show which agent posted what, which findings depend on which, and what a human still has to commit before it counts as accepted.' },
    ],
    furtherReading: [
      { label: 'Anthropic, Automated Weak-to-Strong Researcher', url: 'https://alignment.anthropic.com/2026/automated-w2s-researcher/', why: 'The primary source report on the AAR architecture and its weak-to-strong result.' },
      { label: 'Anthropic, Responsible Scaling Policy v3.0', url: 'https://anthropic.com/responsible-scaling-policy/rsp-v3-0', why: 'The AI R and D capability threshold this lesson\'s compression-risk argument is framed against.' },
      { label: 'DeepMind, Frontier Safety Framework v3', url: 'https://deepmind.google/blog/strengthening-our-frontier-safety-framework/', why: 'The ML R and D autonomy level parallel to Anthropic\'s RSP threshold.' },
      { label: 'Burns et al., Weak-to-Strong Generalization (OpenAI)', url: 'https://openai.com/index/weak-to-strong-generalization/', why: 'The 2023 paper defining the underlying problem AARs were benchmarked on.' },
      { label: 'Anthropic, Measuring agent autonomy in practice', url: 'https://www.anthropic.com/research/measuring-agent-autonomy', why: 'The broader agent-autonomy framing AAR sits inside.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Parallel-agent research forum audit',
      body: '- Does the findings store sit entirely outside every agent\'s sandbox, with no credential able to edit a past record?\n- Is every revision a new append-only entry with provenance to the entry it revises, rather than an in-place overwrite?\n- Does a denied write to a past record surface as a visible timeline event, not a silent failure?\n- Does the task queue give agents room for free decomposition, or does a prescribed step-by-step plan risk degrading their results?\n- Is there a named human step that commits, retracts, or refines each finding before it counts as accepted?\n- Is this system\'s scope checked against the AI R and D capability threshold so nobody assumes it is closer to full automation than it is?',
    },
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
          'anthropic ran parallel claude instances as alignment researchers. they beat the human baseline on weak-to-strong training.\n\nthe detail that matters is not the score. it is where the logs live.\n\neach agent runs in its own sandbox. findings go to a shared forum whose storage sits outside every sandbox. no agent holds a credential that can edit a past record.\n\nif they could edit their own logs, a positive result would mean nothing.',
      },
      {
        kind: 'X · design angle',
        hook: 'an append-only log is also a history view you can actually render.',
        body:
          'an append-only log is also a history view you can actually render.\n\nmutable store: a revision overwrites the row. one current value. a covered-up failure and a real finding look identical.\n\nappend-only, out of sandbox: the revision is a new entry, the old one stands, and a write to a past record is a denial you can put on the timeline.\n\ntamper becomes an event instead of an absence. that is the difference between provenance and a guess.',
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
