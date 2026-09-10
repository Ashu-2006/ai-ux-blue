import type { Lesson } from '@/lib/lessons';

// Phase 16 · Part 4 · Running a swarm in production (16.02, 16.19-16.20, 16.22-16.24)
export const phase16Part4: Lesson[] = [
  {
    id: 'p16-02-fipa-acl',
    phase: 'Phase 16 · Multi-Agent and Swarms',
    part: 'Part 4 · Running a swarm in production',
    index: '16.02',
    title: 'FIPA-ACL heritage: why every message carries a performative',
    oneLiner:
      'In 2000 the IEEE ratified an agent communication language with twenty performatives and formal semantics. MCP, A2A, and ACP are the same envelope in JSON, with the ontology dropped for looser semantics.',
    readTime: '~10 min read',
    diagram: '/lessons/p16-02.svg',
    diagramCaption:
      'A FIPA-ACL envelope beside an MCP tools/call: seven metadata fields around one payload, in both cases.',
    whyItMatters:
      'This one is a mental model rather than a component, and the payoff is a field. Every agent message carries an intent class (inform, request, propose, cfp, failure, not-understood), and a trace viewer that renders all messages as one uniform bubble has thrown away the only unambiguous part of the protocol. A message-type field lets you filter a trace by intent, style a failure differently from an inform, and correlate a request with its reply by conversation id. The heritage also names the failure you inherit by dropping ontologies: semantic drift, where two agents mean different things by "customer" and no validator catches it.',
    learningObjectives: [
      'Name the seven envelope fields a FIPA-ACL message carries and match each to its MCP or A2A equivalent.',
      'List at least six of FIPA\'s twenty performatives and identify which modern protocol re-adds each one.',
      'Explain why FIPA-ACL faded from industry and what modern protocols traded away to win adoption.',
      'Diagnose a semantic-drift bug in a running agent system and name two wire-time mitigations.',
      'Design a trace-viewer field that renders a message\'s intent class distinctly from its content.',
      'Map Contract Net, subscribe-notify, and request-when to a 2026 system component each.',
    ],
    sections: [
      {
        heading: 'The problem: the 2026 agent-protocol boom is a rediscovery',
        body: 'MCP for tools, A2A for agents, ACP for enterprise audit, ANP for decentralized trust, NLIP for natural-language content, plus CA-MCP and two dozen research proposals. Each announces itself as foundational.\n\nThe honest read is that most are rediscovering a twenty-year-old decision tree. Speech-act theory from Austin (1962) and Searle (1969) gave us "utterances are actions." KQML (1993) turned that into a wire protocol. FIPA-ACL, ratified 2000, produced the reference standardization: twenty performatives, content languages SL0 and SL1, and interaction protocols for contract-net and subscribe-notify. JADE and JACK were the Java runtimes. The effort faded around 2010 when ontology overhead lost to HTTP plus JSON.',
      },
      {
        heading: 'The performative catalog, which you will re-add one at a time',
        body: 'Austin noticed some sentences do not describe the world, they change it. "I promise." "I request." Searle formalized five categories. FIPA standardized around twenty performatives, and the useful ones read like a changelog of every agent protocol since: inform, request, query-if, query-ref, propose, accept-proposal, reject-proposal, agree, refuse, confirm, disconfirm, not-understood, cfp, subscribe, cancel, failure.\n\nThe point is not to memorize them. The point is that every one corresponds to a primitive an LLM protocol eventually re-adds, usually after someone files an issue asking how to cancel a running task or how to signal that a message did not parse.',
      },
      {
        heading: 'The envelope, then and now',
        body: 'A canonical ACL message carries sender, receiver, content, language, ontology, protocol, conversation-id, and reply-with. Seven fields of envelope around one field of payload.\n\nPut a FIPA request next to an MCP tools/call and the correspondence is exact: who, whom, intent, payload, correlation id. Same envelope, different syntax. Liu et al. (arXiv:2505.02279) make the lineage explicit: MCP maps to tool-use speech acts, A2A to agent-peer speech acts, ACP to audit-trail speech acts, ANP to decentralized-identity extensions. Read the mapping table top to bottom and the pattern is consistent: keep the structural primitive, drop the formalism, let the model paper over the ambiguity.',
      },
      {
        heading: 'The trade, stated plainly',
        body: 'What FIPA gave you and modern specs drop: formal semantics, so you could prove that an inform implies the sender believes the content. A canonical performative catalog, so you never re-argue whether to have a cancel. Decades of interaction protocols with known correctness properties.\n\nWhat modern specs give you and FIPA did not: JSON-native payloads every tool already speaks, natural-language content that models interpret without a hand-coded ontology, web transport (HTTP, SSE, WebSocket), and capability discovery through self-describing documents such as MCP listTools or an A2A Agent Card.\n\nLooser intent semantics for easier implementation. That is the exact trade, and it is usually the right one.',
      },
      {
        heading: 'The three protocols worth porting, and the one failure you inherit',
        body: 'FIPA shipped around fifteen interaction protocols. Three carry forward cleanly. Contract Net: manager issues cfp, bidders propose, manager accepts or rejects, which is the canonical task market. Subscribe-notify: subscriber sends subscribe, publisher informs on change, which is every event bus in 2026. Request-when: do X when condition Y holds, whose modern analog is a deferred task in a durable workflow engine.\n\nThe inherited failure is semantic drift. Without a shared ontology, agents infer meaning from natural language, and two agents can use "customer" for subtly different concepts while the receiver acts on the wrong reading and no schema validator objects. The partial mitigations without going full ontology: JSON Schema on the content field to reject structural errors at the wire, typed artifacts to reject wrong modality, and an explicit performative in the envelope so intent stays unambiguous even when content is prose.',
      },
      {
        heading: 'Mapping the 2026 specs to speech-act heritage',
        body: 'Read the correspondence top to bottom and the pattern holds across every current spec.\n\n| Modern spec | FIPA analog | Keeps | Drops |\n|---|---|---|---|\n| MCP `tools/call` | request | explicit intent, correlation id | formal semantics, ontology |\n| MCP `resources/read` | query-ref | explicit intent, correlation id | formal semantics |\n| A2A task lifecycle | contract-net plus request-when | async lifecycle, state transitions | formal completeness guarantees |\n| A2A streaming events | subscribe-notify | async push | typed-predicate subscription |\n| CA-MCP shared context | blackboard (Hayes-Roth 1985) | multi-writer shared memory | logical consistency model |\n| NLIP | natural-language content | LLM-native prose | schema |\n\nEvery row keeps the structural primitive and drops the formalism, betting that the model papers over the ambiguity. That bet is usually fine for inform and request. It is where semantic drift enters for anything resembling propose or agree, since agreement is exactly the speech act formal semantics were built to make provable.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p16-02-inline-envelope.svg',
        alt: 'FIPA envelope fields lined up against an MCP tools/call payload',
        caption: 'Seven envelope fields, one payload field, in both 2000 and 2026.',
        diagramBrief:
          'Two-column comparison card, cream paper background (#faf6ef), black ink, one accent color highlighting the shared fields. Left column headed "FIPA-ACL, 2000" lists seven rows: sender, receiver, performative, content, ontology, protocol, conversation-id. Right column headed "MCP tools/call, 2026" lists the same seven rows relabeled: implicit sender, implicit receiver, method, params, (blank, no ontology), (blank, no protocol field), id. Draw a connecting line between each matched row except the two blank rows, which get a dashed outline in the accent color to flag what is missing. Aspect ratio 4:3.',
      },
      {
        src: '/lessons/p16-02-inline-performatives.svg',
        alt: 'A trace viewer legend with one chip per performative',
        caption: 'Twenty performatives collapse to a handful of chip colors once intent is a field instead of prose.',
        diagramBrief:
          'A horizontal row of eight rounded chips on cream paper (#faf6ef), black ink outlines, each chip labeled with one performative: inform, request, propose, cfp, agree, refuse, not-understood, failure. Give three chips (not-understood, refuse, failure) a single shared accent-color fill to show a "failure family" grouping; leave the rest outline-only. Below the row, one mono-space caption line: "one field, filterable." Aspect ratio 16:9.',
      },
    ],
    takeaways: [
      'Every agent message has an intent class. Carry it as a field, or your trace UI cannot filter by intent, style failures distinctly, or pair a request with its reply.',
      'Ask five questions of any new protocol: what is the intent primitive, is there a correlation id, what is the content language, are interaction protocols first-class, and what happens on semantic drift.',
      'Contract Net, subscribe-notify, and request-when are worth porting. You are otherwise reimplementing them from scratch under new names.',
      'Dropping the ontology bought JSON and prose and cost you wire-time meaning checks. JSON Schema on content is the cheap part of that back.',
    ],
    terms: [
      { term: 'Speech act', gloss: '"an utterance that does something"', meaning: 'Austin and Searle: an utterance that performs an action rather than describing the world.' },
      { term: 'FIPA', gloss: '"that old XML thing"', meaning: 'The IEEE Foundation for Intelligent Physical Agents, which ratified ACL in 2000.' },
      { term: 'ACL', gloss: '"agent communication language"', meaning: 'FIPA\'s envelope format: performative plus content plus metadata.' },
      { term: 'Performative', gloss: '"the verb"', meaning: 'The intent class of a message: inform, request, propose, cfp, and so on.' },
      { term: 'KQML', gloss: '"FIPA\'s predecessor"', meaning: 'The 1993 Knowledge Query and Manipulation Language, simpler and narrower, that first made speech acts a wire format.' },
      { term: 'Ontology', gloss: '"shared vocabulary"', meaning: 'A formal definition of the concepts a content language refers to, required by FIPA and dropped since.' },
      { term: 'SL0 / SL1', gloss: '"FIPA\'s content languages"', meaning: 'Semantic Language levels 0 and 1, the formal content-language family behind FIPA\'s truth conditions.' },
      { term: 'Contract Net', gloss: '"task market"', meaning: 'Manager issues cfp, bidders propose, manager accepts. The canonical interaction protocol for task allocation.' },
      { term: 'Interaction protocol', gloss: '"pattern of messages"', meaning: 'A sequence of performatives with known correctness properties, such as request-when or subscribe-notify.' },
      { term: 'Semantic drift', gloss: '"we\'re speaking the same language"', meaning: 'Two agents using the same word for different concepts, with no validator to catch it.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'In the canonical FIPA-ACL message in this lesson, which field plays the same role as MCP\'s `id` field, and which field has no equivalent in a `tools/call` payload at all?' },
      { level: 'medium', prompt: 'Map inform, request, cfp, and not-understood to their closest MCP or A2A analog. Which one of the four has the weakest modern equivalent, and what breaks without it?' },
      { level: 'hard', prompt: 'Read Liu et al. (arXiv:2505.02279). For ACP specifically, list which FIPA performative families it keeps and which it drops, and explain why an audit-trail protocol keeps more formalism than MCP does.' },
      { level: 'design', prompt: 'Sketch a trace-viewer row for a multi-agent conversation. Using only color and one chip, show the difference between an inform, a request, and a failure message without adding a second UI element.' },
    ],
    furtherReading: [
      { label: 'Liu et al., A Survey of Agent Interoperability Protocols: MCP, ACP, A2A, ANP (arXiv:2505.02279)', url: 'https://arxiv.org/html/2505.02279v1', why: 'The canonical 2025 survey mapping every current protocol back to its FIPA speech-act family.' },
      { label: 'FIPA ACL Message Structure Specification (fipa00037)', url: 'http://www.fipa.org/specs/fipa00037/', why: 'The ratified 2000 envelope format and the full twenty-performative catalog, read sections 4.1 to 4.3.' },
      { label: 'MCP specification, 2026-07-28', url: 'https://modelcontextprotocol.io/specification/2026-07-28', why: 'The current stateless tool-use analog of FIPA\'s request and query-ref.' },
      { label: 'A2A specification', url: 'https://a2a-protocol.org/latest/specification/', why: 'The modern agent-peer analog of contract-net and subscribe-notify, with task lifecycle in place of formal completeness.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Five questions for any new agent protocol',
      body: '- What is the intent primitive (performative) of each message type?\n- Is there a correlation id for request-response pairing and cancellation?\n- Is there an explicit content language (JSON-RPC, plain text, typed artifact), or is meaning inferred from prose alone?\n- Are interaction protocols first-class, or are you re-implementing contract-net and subscribe-notify from scratch under a new name?\n- What happens when two agents disagree about what a shared term means, and what catches it before a bad action executes?',
    },
    demoCaption:
      'The same request in both syntaxes. Toggle between the 2000 ACL envelope and the 2026 JSON-RPC call and count the fields: the envelope is unchanged, the formal semantics and the ontology are what went missing.',
    demo: {
      archetype: 'before-after',
      subject: 'One tool request · two decades apart',
      badLabel: 'FIPA-ACL, 2000',
      goodLabel: 'MCP tools/call, 2026',
      badLines: [
        'performative: request',
        'sender / receiver: agent1, tool-server',
        'content: (lookup stock IBM)',
        'ontology: finance (parse fails without it)',
        'conversation-id: c42',
      ],
      goodLines: [
        'method: tools/call (the performative, renamed)',
        'implicit sender / receiver: the transport',
        'params: {name, arguments}',
        'no ontology: meaning inferred from prose',
        'id: 42 (the correlation id, renamed)',
      ],
      badCaption:
        'The 2000 envelope carried who, whom, intent, payload, and a correlation id, plus formal semantics letting you prove an inform implied sender belief. The ontology requirement is what killed it: agreeing on one is a multi-year standards process.',
      goodCaption:
        'The 2026 version is the same five things in JSON with looser semantics, which is why it shipped. What you gave up is wire-time meaning validation, so semantic drift is now your problem: put JSON Schema on content and keep the intent class as an explicit field.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'MCP tools/call is a FIPA request with the ontology field deleted.',
        body:
          'MCP tools/call is a FIPA request with the ontology field deleted.\n\nFIPA-ACL, ratified 2000: twenty performatives, formal semantics, contract-net and subscribe-notify in the protocol library.\n\nboth envelopes carry the same five things: who, whom, intent, payload, correlation id.\n\nlooser intent semantics for easier implementation. that is the entire trade, and it is usually the right one.',
      },
      {
        kind: 'X · design angle',
        hook: 'if every message in your agent trace renders as the same bubble, you deleted the protocol.',
        body:
          'if every message in your agent trace renders as the same bubble, you deleted the protocol.\n\nFIPA named twenty intent classes: inform, request, propose, cfp, cancel, failure, not-understood.\n\nkeep that as a field and you get: filter a trace by intent, style a failure differently from an inform, pair a request with its reply by conversation id.\n\ndrop it and every message is prose you have to read to classify.',
      },
      {
        kind: 'X · one-liner',
        hook: 'every new agent protocol eventually re-adds cancel.',
        body:
          'every new agent protocol eventually re-adds cancel.\n\nand not-understood. and subscribe. and cfp.\n\nFIPA catalogued twenty performatives in 2000. the 2026 specs are rediscovering them one github issue at a time.\n\nread the old catalog once and you stop being surprised by your own roadmap.',
      },
    ],
    source: {
      label: 'Full lesson: 02 02-fipa-acl-heritage',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/16-multi-agent-and-swarms/02-fipa-acl-heritage',
    },
  },
  {
    id: 'p16-19-swarm-optimization',
    phase: 'Phase 16 · Multi-Agent and Swarms',
    part: 'Part 4 · Running a swarm in production',
    index: '16.19',
    title: 'Swarm optimization: PSO for prompts, ACO for routing',
    oneLiner:
      'Prompts are not differentiable, so gradient methods are out. PSO and ACO only need an evaluator: Model Swarms reports 13.3 percent average gain over 12 baselines, AMRO-S reports a 4.7x routing speedup.',
    readTime: '~10 min read',
    diagram: '/lessons/p16-19.svg',
    diagramCaption:
      'Stigmergy: agents leave a pheromone trail on routes that passed the quality gate, and the trail decays so routes can be rediscovered.',
    whyItMatters:
      'The product-level constraint here is a cost per iteration you have to expose before anyone hits run. N particles times T iterations times per-eval cost is the whole story: 20 particles over 50 iterations at roughly two cents a call is about 20 dollars, and a PSO costing 500 dollars per iteration for half a point of gain is not shippable. So the optimizer needs a live cost meter and a convergence curve, not a spinner. The ACO half gives you something rarer: pheromone strength is human-readable routing evidence, which means "why this agent" has a number behind it instead of a shrug.',
    learningObjectives: [
      'Compute the total cost of a PSO run given particle count, iteration count, and per-evaluation price.',
      'Decide between PSO, ACO, and a genetic algorithm for a given optimization problem.',
      'Explain why LMPSO\'s "velocity" is a prompt rather than a vector, and what that requires of the candidate output.',
      'Diagnose why an ungated pheromone trail converges on a fast-but-wrong agent instead of a correct one.',
      'Design a cost meter and convergence curve for a swarm-optimizer run that a non-engineer can read.',
      'Name catastrophic drift and the two mitigations that reset it.',
    ],
    sections: [
      {
        heading: 'The problem: you cannot backprop through a prompt',
        body: 'Your prompt scores 62 percent on the task eval and you want it higher. Manual tweaking does not scale. Reinforcement learning needs a reward signal and enough rollouts to train against. Backprop is not available, because a prompt is a discrete string rather than a differentiable parameter.\n\nThat regime, gradient-free and population-based with cheap per-evaluation cost, is exactly what classical bio-inspired optimization was designed for. PSO covers continuous search spaces, ACO covers path selection. Pair either with a model for the candidate-generation step and you have a practical optimizer that needs only an evaluator function.',
      },
      {
        heading: 'PSO, and PSO on model outputs',
        body: 'Kennedy and Eberhart 1995. A population of particles, each with a position and a velocity in a continuous space. Every iteration, the velocity updates as inertia times current velocity, plus a cognitive pull toward the particle\'s own best, plus a social pull toward the swarm\'s best, each scaled by a random factor. Position moves by velocity. Evaluate fitness, update personal best and global best.\n\nLMPSO (arXiv:2504.09247) adapts this for structured model outputs such as math expressions and programs. Each particle is a candidate output; the velocity is a prompt describing how to move the current output toward the personal or global best; the model generates the new candidate. Inertia becomes a prompt like "make small incremental changes." It works when the output is parseable, fitness is automatic (test runs, arithmetic evaluation), and the population is small, roughly 10 to 30.',
      },
      {
        heading: 'Model Swarms: PSO on the weight manifold',
        body: 'Model Swarms (arXiv:2410.11163) moves PSO off the output layer and into the model layer. Each particle is an expert model, and the swarm moves parameters toward the collective best with a gradient-free update.\n\nReported: 13.3 percent average gain over 12 baselines across 9 datasets, with just 200 instances per iteration. The reason it is cheap is that expert models are already nearby in a shared parameter manifold. Adapter weights and LoRA deltas live in a low-dimensional subspace, and PSO over that subspace is a small search rather than a giant one.',
      },
      {
        heading: 'ACO and AMRO-S: routing with a memory that decays',
        body: 'Dorigo 1992. Ants traverse a graph, each path carries a pheromone trail, move probabilities weight by trail strength, ants that complete deposit pheromone proportional to solution quality, and pheromone decays over time.\n\nAMRO-S (arXiv:2603.12933) applies this to multi-agent routing. Each task type is a destination, each agent is a candidate route, and pheromones strengthen routes that produced good outputs. Three contributions: interpretable routing evidence, since pheromone strength is a human-readable signal; a quality-gated asynchronous update, so pheromones deposit only after quality checks pass, decoupling inference from learning; and a reported 4.7x speedup on the routing benchmark. The quality gate is the part that matters most. Without it, fast-but-wrong agents accrue pheromone and the system locks onto bad routes.',
      },
      {
        heading: 'Why bio-inspired optimization still wins',
        body: 'Gradient-based methods need a differentiable signal. LLM outputs and routing decisions do not offer one, and pseudo-gradient stand-ins such as reinforcement-learned routers or DPO-style prompt tuners work but need expensive training runs to get there.\n\nPSO and ACO need only an evaluator function. If you can score a candidate output or a routing decision, whether by a test suite, an arithmetic check, or a rubric, you can optimize over the space without training anything. That is the entire appeal: the bar for applicability is low, because the only requirement is a function that returns a number.\n\nThe honest tradeoff is convergence speed. Neither algorithm gets you the sample efficiency of a trained reward model, and both need enough iterations to explore before they exploit, which is exactly the cost this lesson keeps returning to.',
      },
      {
        heading: 'When to use PSO, ACO, or neither',
        body: 'PSO fits when the search space is continuous or maps to continuous parameters (prompt embeddings, LoRA weights, numeric generation parameters), fitness is cheap and automatic, and the population can stay small. ACO fits when the problem is routing or path selection, the same task types recur so decisions can reinforce, and you need interpretable evidence for the routing choice.\n\nNeither fits when fitness requires human review, since per-iteration cost becomes prohibitive; when the space is discrete and combinatorial in a way PSO does not cover, where genetic algorithms fit better; or when latency is strict, since both converge slowly relative to a single-pass heuristic.\n\nSwarmPrompt (ICAART 2025) sits at the boundary: it hybridizes PSO with Grey Wolf optimization specifically for prompt search, trading PSO\'s simplicity for a second population dynamic when a single metaheuristic plateaus.',
      },
      {
        heading: 'The three practical limits',
        body: 'Population budget is N times T times per-eval price, and it is the one number that has to be visible before a run starts, not after the invoice.\n\nExploration versus exploitation is the decay rate and inertia tradeoff: too fast and the swarm forgets good solutions, too slow and it sticks on an early local optimum. Tune one, watch the convergence curve, tune the other.\n\nCatastrophic drift is what happens when the fitness surface shifts mid-run, so old personal bests and aged pheromones go stale and the optimizer looks broken when it is actually optimizing against yesterday\'s distribution. The fix is to reset decay, or temporarily double it, whenever the eval distribution changes.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p16-19-inline-costmeter.svg',
        alt: 'A cost-per-iteration meter beside a convergence curve',
        caption: '20 particles times 50 iterations at two cents a call is about 20 dollars; the meter and the curve belong on the same screen.',
        diagramBrief:
          'Split panel, cream paper (#faf6ef), black ink. Left half: a small horizontal gauge labeled "cost this run: $19.80" with an accent-color fill bar at roughly 40 percent, and below it the formula "N x T x $/eval" in mono-space. Right half: a simple line chart, x-axis "iteration" 0 to 50, y-axis "fitness", a rising curve that flattens after iteration 30, with a small accent-color dot marking the current iteration. Aspect ratio 16:9.',
      },
      {
        src: '/lessons/p16-19-inline-pheromone.svg',
        alt: 'Two pheromone matrices, gated and ungated, after 100 routed tasks',
        caption: 'Ungated, the fastest agent gets darkest regardless of correctness. Gated, only the verified-good route darkens.',
        diagramBrief:
          'Two small grids side by side on cream paper (#faf6ef), each 4 columns (task types A-D) by 3 rows (agent 1-3), black ink outlines. Left grid titled "ungated": cell for task A / fast agent shaded darkest in the accent color despite being wrong. Right grid titled "gated": cell for task A / correct agent shaded darkest instead, fast-wrong cell left nearly white. Aspect ratio 4:3.',
      },
    ],
    takeaways: [
      'Cost is N particles times T iterations times per-eval price. Surface it as a live meter, because the optimizer that gains 0.5 points for 500 dollars an iteration should be stoppable mid-run.',
      'The quality gate is what makes ACO routing safe. Ungated, fast-and-wrong agents accrue pheromone and the router locks in on them.',
      'Pheromone strength is interpretable routing evidence, so "why this agent" has a number rather than a shrug.',
      'Reset decay on distribution shift. Aged pheromones and stale personal bests are the failure that looks like the optimizer breaking for no reason.',
    ],
    terms: [
      { term: 'PSO', gloss: '"particle swarm optimization"', meaning: 'Kennedy and Eberhart 1995: a population-based gradient-free optimizer over a continuous space.' },
      { term: 'ACO', gloss: '"ant colony optimization"', meaning: 'Dorigo 1992: route selection via depositing and decaying pheromone trails.' },
      { term: 'LMPSO', gloss: '"PSO with an LLM in the loop"', meaning: 'PSO where the velocity is a prompt and the model generates the next candidate output.' },
      { term: 'Model Swarms', gloss: '"PSO on model weights"', meaning: 'PSO over expert-model weight subspaces, reporting 13.3 percent average gain over 12 baselines.' },
      { term: 'AMRO-S', gloss: '"ACO for routing"', meaning: 'A pheromone-matrix routing scheme over task-type by agent, reporting a 4.7x speedup.' },
      { term: 'SwarmPrompt', gloss: '"another prompt optimizer"', meaning: 'A 2025 hybrid of PSO and Grey Wolf optimization built specifically for prompt search.' },
      { term: 'p_best / g_best', gloss: '"personal and global best"', meaning: 'The best solution a single particle has found, and the best any particle in the swarm has found.' },
      { term: 'Pheromone', gloss: '"routing memory"', meaning: 'Strength on a route that deposits on quality and decays over time.' },
      { term: 'Quality-gated update', gloss: '"only learn from good runs"', meaning: 'A pheromone or best-solution update conditioned on passing a quality check first.' },
      { term: 'Catastrophic drift', gloss: '"the optimizer stopped working"', meaning: 'A shifted fitness surface making prior bests and accumulated pheromones stale.' },
    ],
    exercises: [
      { level: 'easy', prompt: '20 particles, 50 iterations, roughly two cents per evaluation call. Compute the total cost of the run.' },
      { level: 'medium', prompt: 'Vary population size across 5, 10, 20, and 50 particles on the same task. At what size does time-to-convergence saturate, and why does adding particles past that point stop paying for itself?' },
      { level: 'hard', prompt: 'Read AMRO-S (arXiv:2603.12933). Sketch the decoupled inference fast-path with asynchronous pheromone update, and explain what latency it removes from the hot path versus what it defers.' },
      { level: 'design', prompt: 'Design the cost meter and convergence curve for a swarm-optimization run as one compact UI element. Specify what changes color or shape to signal that a run should probably be stopped.' },
    ],
    furtherReading: [
      { label: 'Kennedy and Eberhart, Particle Swarm Optimization (1995)', url: 'https://ieeexplore.ieee.org/document/488968', why: 'The original PSO paper: position, velocity, personal best, global best.' },
      { label: 'Dorigo, Ant Colony Optimization (1992)', url: 'https://www.aco-metaheuristic.org/about.html', why: 'The pheromone-trail foundations that AMRO-S adapts for agent routing.' },
      { label: 'LMPSO (arXiv:2504.09247)', url: 'https://arxiv.org/abs/2504.09247', why: 'PSO where velocity is a prompt and the model generates the next candidate output.' },
      { label: 'Model Swarms (arXiv:2410.11163)', url: 'https://arxiv.org/abs/2410.11163', why: 'PSO over expert-model weight subspaces, with the 13.3 percent average-gain result.' },
      { label: 'AMRO-S (arXiv:2603.12933)', url: 'https://arxiv.org/abs/2603.12933', why: 'The quality-gated pheromone routing scheme behind the 4.7x speedup claim.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Before you start a swarm-optimization run',
      body: '- Population budget stated as N x T x per-eval cost, visible before the run starts.\n- A live cost meter and a convergence curve, not a spinner.\n- Quality gate on any pheromone or best-solution update, so fast-and-wrong cannot out-accumulate slow-and-right.\n- A decay-reset rule for when the eval distribution shifts mid-run.\n- A stop condition: at what convergence-curve flatness does the run auto-stop rather than keep spending.',
    },
    demoCaption:
      'Step through 100 routed tasks with the quality gate off, then on. Ungated, the fastest agent accrues the most pheromone regardless of whether it was right, and the router converges on it. Gated, only verified-good runs deposit.',
    demo: {
      archetype: 'sequence',
      subject: 'Pheromone routing · 100 tasks',
      badLabel: 'Ungated deposit',
      goodLabel: 'Quality-gated deposit',
      badSequence: [
        'task type A routed to the fast agent',
        'run returns in 400ms, output is wrong',
        'pheromone deposits on completion alone',
        'trail on the fast route keeps strengthening',
        'router locks in: 80 percent of A goes to the wrong agent',
      ],
      goodSequence: [
        'task type A routed to the fast agent',
        'run returns in 400ms, eval scores 0.31',
        'gate rejects: no deposit below threshold',
        'slower agent scores 0.86, deposits',
        'trail converges on the correct route, decay keeps A explorable',
      ],
      badCaption:
        'Depositing on completion rewards speed and nothing else, so a fast wrong agent out-accumulates a slow right one and the router converges on it. The trail still looks like evidence, which is what makes it dangerous.',
      goodCaption:
        'Gating the deposit on a quality check decouples inference from learning: routing stays fast while the trail only records verified-good runs. Decay is the other half, keeping alternate routes rediscoverable when the distribution shifts.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'you cannot backprop through a prompt, so 1995 came back.',
        body:
          'you cannot backprop through a prompt, so 1995 came back.\n\nPSO and ACO need one thing: an evaluator. no gradients, no reward model, no training run.\n\nLMPSO: each particle is a candidate output, the velocity is a prompt telling the model how to move toward the best.\nModel Swarms: particles are expert weights. 13.3% average gain over 12 baselines on 9 datasets.\n\nlow bar for applicability is the whole appeal.',
      },
      {
        kind: 'X · design angle',
        hook: 'an optimizer without a live cost meter is a spinner with a credit card.',
        body:
          'an optimizer without a live cost meter is a spinner with a credit card.\n\nswarm optimization cost is N particles x T iterations x per-eval price. 20 particles, 50 iterations, ~$0.02/call is ~$20. scale either number and it moves fast.\n\nso the run needs a convergence curve and a cost-per-iteration readout, stoppable mid-run.\n\n"gained 0.5 points for $500 an iteration" should be visible at iteration 3, not in the invoice.',
      },
      {
        kind: 'X · one-liner',
        hook: 'ungated pheromone routing converges on the fastest wrong agent.',
        body:
          'ungated pheromone routing converges on the fastest wrong agent.\n\nACO deposits trail proportional to solution quality. skip the quality check and "completed" becomes the proxy for "correct".\n\nfast-and-wrong out-accumulates slow-and-right, the trail hardens, and it still looks like evidence.\n\nquality-gate the deposit. decay so alternates stay rediscoverable.',
      },
    ],
    source: {
      label: 'Full lesson: 19 19-swarm-optimization-pso-aco',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/16-multi-agent-and-swarms/19-swarm-optimization-pso-aco',
    },
  },
  {
    id: 'p16-20-marl',
    phase: 'Phase 16 · Multi-Agent and Swarms',
    part: 'Part 4 · Running a swarm in production',
    index: '16.20',
    title: 'MARL: centralized training, decentralized execution',
    oneLiner:
      'MADDPG, QMIX, and MAPPO answer one problem: independent learners see a non-stationary world, centralized control does not deploy. CTDE trains on global information and ships local policies; MAPPO is the 2026 default.',
    readTime: '~10 min read',
    diagram: '/lessons/p16-20.svg',
    diagramCaption:
      'CTDE: a critic seeing all observations and actions during training, and actors that see only their own observation at runtime.',
    whyItMatters:
      'CTDE is worth taking as an architecture discipline even if you never train anything. During design you assume full team visibility; at runtime you enforce that each agent sees only its own observation. Most production multi-agent systems silently assume shared state everywhere, and the CTDE rule is what forces per-agent state to be explicit and partial observability to be a decision rather than an accident. The other transfer is a name for a bug you have already hit: non-stationarity, which in agent products reads as "my agent worked last month, then an upstream agent changed, and now mine misbehaves."',
    learningObjectives: [
      'Explain why independent RL and fully centralized RL both fail for multi-agent training, and state the CTDE fix.',
      'Trace the actor and critic split in MADDPG and name its scaling failure mode.',
      'Explain why QMIX\'s monotonicity constraint is required for decentralized argmax, and name a reward structure it excludes.',
      'State why MAPPO is the 2026 default baseline and what reproducing it first saves you.',
      'Apply CTDE as an architecture rule to a system with no training involved, naming what becomes explicit at design time.',
      'Diagnose a "my agent broke when the upstream one changed" bug as non-stationarity.',
    ],
    sections: [
      {
        heading: 'The problem: two obvious approaches, both broken',
        body: 'Agent systems increasingly want trained policies for inter-agent decisions: when to defer, when to act, which peer to call. The literature for that is multi-agent reinforcement learning, and it predates the current wave.\n\nIndependent RL, where each agent learns alone and treats the others as environment, is non-stationary from every agent\'s perspective. The environment includes other agents\' policies, those policies keep changing, and single-agent convergence proofs break.\n\nCentralized RL, where one policy controls everyone, does not scale and violates the execution constraint that each agent only observes its own slice. CTDE is the answer: train with global information, deploy with local policies.',
      },
      {
        heading: 'Three benchmarks, three algorithms',
        body: 'Each MARL algorithm in this lesson was built against a specific testbed, and the fit is not incidental. Particle World, a simple 2D physics environment with cooperative and competitive tasks, was MADDPG\'s original proving ground: mixed-motive settings where a centralized critic per agent made sense.\n\nStarCraft Multi-Agent Challenge (SMAC) is cooperative micro-management under partial observation, homogeneous units, one team reward. That is QMIX\'s home turf, and the fit is close to perfect for value decomposition.\n\nGoogle Research Football, Hanabi, and MPE are where MAPPO ran its 2022 benchmark sweep. Different environments test different properties: continuous versus discrete actions, full versus partial observability, two agents versus dozens. Reading an algorithm\'s claimed advantage without checking which of these it was measured on is the first way to misapply it.',
      },
      {
        heading: 'MADDPG 2017: the CTDE pattern itself',
        body: 'Lowe et al., NeurIPS 2017 (arXiv:1706.02275). Each agent has an actor mapping its own observation to an action, and a critic that during training sees all observations and all actions. The actor updates by policy gradient against its critic\'s evaluation; the critic updates by temporal-difference on the joint estimate.\n\nWhy this works: at training time we know everyone\'s actions, and using that reduces variance in each critic. At deploy time each agent only reads its own observation and calls its own actor. It handles cooperative, competitive, and mixed settings.\n\nThe failure mode is scale. Critic input includes all agents\' actions, so it grows with N and does not go far past roughly 10 agents without approximations.',
      },
      {
        heading: 'QMIX 2018: value decomposition and why the monotonicity matters',
        body: 'Rashid et al., ICML 2018 (arXiv:1803.11485). Cooperative only. The joint action-value is a monotone function of the per-agent action-values, with the derivative of the mixer with respect to each agent\'s value constrained non-negative.\n\nThat constraint is the entire trick. Monotonicity guarantees the argmax of the joint value can be computed by each agent independently taking its own argmax, which is exactly the decentralized execution property you need. During training a mixing network produces the joint value from the per-agent values.\n\nQMIX dominates the StarCraft Multi-Agent Challenge because SMAC is cooperative micro-management with homogeneous agents, local observations, and a global reward: a perfect fit. Its failure is the same constraint. Reward structures that are not monotone decomposable, such as one agent sacrificing for the team, do not fit, and QTRAN and QPLEX exist to relax it.',
      },
      {
        heading: 'MAPPO 2022: the overlooked default',
        body: 'Yu et al., NeurIPS 2022 (arXiv:2103.01955). PPO with a centralized value function: each agent has its own policy, and the value functions see the full state.\n\nBenchmarked against MADDPG, QMIX, and their extensions on five suites, MAPPO matched or beat the off-policy methods on particle world, SMAC, Google Research Football, Hanabi, and MPE, with minimal hyperparameter tuning and stable reproducible training across seeds.\n\nThe community underrated on-policy MARL until this paper landed. In 2026 MAPPO is the default cooperative-MARL baseline, and any new method has to beat it. The practical instruction is to reproduce MAPPO first, which saves weeks of chasing fancier methods that turn out not to clear it.',
      },
      {
        heading: 'What actually transfers to agent systems',
        body: 'Three direct uses. Router training: a meta-agent choosing which sub-agent handles a task is a MARL problem with N decentralized workers and one centralized router, and MAPPO fits. Role emergence: training agents into complementary roles is MARL in disguise, and QMIX-style value decomposition forces complementarity by construction. Multi-agent tool use: when agents share tools and compete for a budget, CTDE produces deployable local policies that respect the resource constraint.\n\nThe honest caveat: in 2026 most production agent systems prompt their policies rather than train them. MARL earns its keep only when you have interaction data, a clear reward signal, and appetite for training infrastructure, all three. And the standing warning is reward shaping. MARL is exquisitely sensitive to it, one coordination bug in the shaping and agents learn to exploit it, so adversarial tests are not optional.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p16-20-inline-phases.svg',
        alt: 'Training-time visibility versus runtime visibility for one agent',
        caption: 'The same agent sees everything while training and only its own observation once deployed.',
        diagramBrief:
          'Two-panel diagram on cream paper (#faf6ef), black ink. Left panel labeled "training": a central critic node with arrows in from three agent icons, each arrow labeled with that agent\'s observation and action. Right panel labeled "runtime": three separate agent icons, each with a short arrow only to its own observation, no central node. Use one accent color on the critic node in the left panel to show it disappears on the right. Aspect ratio 16:9.',
      },
      {
        src: '/lessons/p16-20-inline-comparison.svg',
        alt: 'MADDPG, QMIX, and MAPPO compared across four axes',
        caption: 'Three algorithms, four axes: cooperative-only, agent-count ceiling, tuning burden, and home benchmark.',
        diagramBrief:
          'A 4-row by 3-column table rendered as a diagram on cream paper (#faf6ef), black ink grid lines. Columns: MADDPG, QMIX, MAPPO. Rows: "cooperative only?", "scales past 10 agents?", "tuning burden", "home benchmark". Fill cells with short text (yes/no, low/med/high, SMAC etc). Highlight the MAPPO column header in the accent color since the lesson names it the current default. Aspect ratio 4:3.',
      },
    ],
    takeaways: [
      'Take CTDE as a design rule even without training: full visibility at design time, strictly local observation at runtime. It forces per-agent state to be explicit.',
      'Non-stationarity is the name for "my agent broke when an upstream agent changed." Prompt fixes are faster; CTDE training is the durable one.',
      'Start with MAPPO. It is the 2026 baseline, it needed minimal tuning across five benchmark suites, and reproducing it first saves weeks.',
      'QMIX\'s monotonicity is what buys decentralized argmax, and it is also what excludes any reward where one agent sacrifices for the team.',
    ],
    terms: [
      { term: 'MARL', gloss: '"multi-agent RL"', meaning: 'Reinforcement learning where more than one agent learns simultaneously in a shared environment.' },
      { term: 'CTDE', gloss: '"centralized training, decentralized execution"', meaning: 'Train with global information across all agents, deploy with policies that see only local state.' },
      { term: 'MADDPG', gloss: '"multi-agent DDPG"', meaning: 'Lowe et al. 2017: per-agent critics seeing all observations and actions; the original CTDE method.' },
      { term: 'QMIX', gloss: '"value decomposition"', meaning: 'Rashid et al. 2018: monotone mixing of per-agent values so each agent can argmax independently.' },
      { term: 'MAPPO', gloss: '"multi-agent PPO"', meaning: 'Yu et al. 2022: PPO with a centralized value function, the 2026 default cooperative baseline.' },
      { term: 'Value decomposition', gloss: '"sum of individual Qs"', meaning: 'Representing a joint action-value as a function, constrained monotone, of per-agent action-values.' },
      { term: 'Non-stationarity', gloss: '"moving targets"', meaning: 'Each agent\'s environment shifting as other agents change policy. The core MARL problem.' },
      { term: 'On-policy / off-policy', gloss: '"learn from current data or replay"', meaning: 'PPO-family methods like MAPPO are on-policy; DDPG and Q-learning methods like MADDPG and QMIX are off-policy.' },
      { term: 'SMAC', gloss: '"StarCraft Multi-Agent Challenge"', meaning: 'Cooperative micro-management under partial observation, QMIX\'s home benchmark.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A MADDPG critic takes every agent\'s action as input. How does critic input size scale with agent count N, and at roughly what N does this stop being practical without approximation?' },
      { level: 'medium', prompt: 'Explain why QMIX\'s monotonicity constraint cannot express a reward structure where one agent sacrifices its own score for the team\'s benefit.' },
      { level: 'medium', prompt: 'On a 6x6 grid instead of the lesson\'s 4x4, does the steps-to-goal gap between independent learners and CTDE grow or shrink? Reason from what non-stationarity does as the state space grows.' },
      { level: 'design', prompt: 'Apply CTDE to a research-agent, summarizer, and coder system with no training involved. Name what information is visible at design time that no single agent sees at runtime, and sketch the one UI surface that would leak that information if you got the boundary wrong.' },
    ],
    furtherReading: [
      { label: 'Lowe et al., Multi-Agent Actor-Critic for Mixed Cooperative-Competitive Environments (arXiv:1706.02275)', url: 'https://arxiv.org/abs/1706.02275', why: 'The MADDPG paper and the original CTDE pattern, NeurIPS 2017.' },
      { label: 'Rashid et al., QMIX: Monotonic Value Function Factorisation (arXiv:1803.11485)', url: 'https://arxiv.org/abs/1803.11485', why: 'The monotonicity proof behind decentralized argmax, ICML 2018.' },
      { label: 'Yu et al., The Surprising Effectiveness of PPO in Cooperative Multi-Agent Games (arXiv:2103.01955)', url: 'https://arxiv.org/abs/2103.01955', why: 'The 2022 paper that made MAPPO the default baseline.' },
      { label: 'BAIR blog on MAPPO', url: 'https://bair.berkeley.edu/blog/2021/07/14/mappo/', why: 'A readable walkthrough of why centralized-value PPO closes the gap on off-policy MARL.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'CTDE as an architecture discipline, even without training',
      body: '- At design time, write down what full team visibility would look like: what would a full view of this system see.\n- At runtime, enforce that each agent\'s prompt or state only contains its own observation. No silent shared state.\n- Name the non-stationarity risk: which upstream agent, if it changes behavior, breaks this agent\'s assumptions.\n- If you ever do train a policy, reproduce MAPPO first before reaching for MADDPG or QMIX.\n- Log every agent\'s observation and action stream. Debugging coordination without per-agent traces is close to hopeless.',
    },
    demoCaption:
      'Toggle between independent learners and CTDE on the same 2-agent grid task. The independent pair treats each other as weather and averages about 6 steps to the goal. The CTDE pair trains against a joint critic and converges near 3.5, with optimal at 3.',
    demo: {
      archetype: 'toggle-fix',
      subject: '2 agents, 4x4 grid, one pellet',
      badLabel: 'Independent learners',
      goodLabel: 'CTDE',
      badLines: [
        'each agent treats the other as environment',
        'the other policy keeps changing mid-training',
        'convergence proofs do not hold',
        'about 6 steps to goal on average',
      ],
      goodLines: [
        'training: critic sees all observations and actions',
        'runtime: each actor reads only its own observation',
        'variance drops, the value estimate is stationary',
        'about 3.5 steps to goal, optimal is 3',
      ],
      badCaption:
        'Independent learning is the default you get for free and it is non-stationary by construction: the environment each agent optimizes against includes peer policies that are still moving, so learning chases a target that keeps relocating.',
      goodCaption:
        'CTDE separates the two phases. Global information during training makes each value estimate stationary; strictly local observation at runtime keeps the policies deployable. The same split is worth enforcing architecturally even when nothing is being trained.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'independent multi-agent learning is non-stationary by construction.',
        body:
          'independent multi-agent learning is non-stationary by construction.\n\neach agent optimizes against an environment that includes the other agents\' policies. those policies are still changing. the target relocates while you aim at it.\n\nCTDE is the fix: critic sees everything during training, actors see only their own observation at runtime.\n\nMADDPG 2017 introduced it. QMIX 2018 got decentralized argmax from a monotonicity constraint. MAPPO 2022 is the current baseline.',
      },
      {
        kind: 'X · design angle',
        hook: 'CTDE is worth stealing as an architecture rule even if you never train anything.',
        body:
          'CTDE is worth stealing as an architecture rule even if you never train anything.\n\ndesign time: assume full team visibility.\nruntime: each agent sees only its own observation. enforce it.\n\nmost production multi-agent systems silently assume shared state everywhere. this rule makes per-agent state explicit and turns partial observability into a decision instead of an accident.\n\nit also names the bug: "my agent broke when the upstream one changed" is non-stationarity.',
      },
      {
        kind: 'X · one-liner',
        hook: 'start with MAPPO. it is the baseline any new method has to beat.',
        body:
          'start with MAPPO. it is the baseline any new method has to beat.\n\nPPO plus a centralized value function. matched or beat the off-policy MARL methods on five benchmark suites with minimal tuning and reproducible seeds.\n\nthe community underrated on-policy MARL until the 2022 paper. reproducing it first saves weeks of chasing fancier methods that do not clear it.',
      },
    ],
    source: {
      label: 'Full lesson: 20 20-marl-maddpg-qmix-mappo',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/16-multi-agent-and-swarms/20-marl-maddpg-qmix-mappo',
    },
  },
  {
    id: 'p16-22-production-scaling',
    phase: 'Phase 16 · Multi-Agent and Swarms',
    part: 'Part 4 · Running a swarm in production',
    index: '16.22',
    title: 'Production scaling: checkpoints, queues, and starting simple',
    oneLiner:
      'A checkpoint after every super-step means any worker can resume any run after any crash. Async is the architecture at this scale, and the honest default is still FastAPI plus Postgres until you measure it failing.',
    readTime: '~10 min read',
    diagram: '/lessons/p16-22.svg',
    diagramCaption:
      'A run checkpointing after each super-step, crashing mid-step, and a second worker picking up the thread from the last saved state.',
    whyItMatters:
      'Durability creates run states you have to design, not just states you have to store. A resumed run is not a retry: it continued from step 37 rather than starting over, and rendering them identically lies about what happened and about what the user was charged. An agent can also sleep indefinitely waiting for human input, which makes a waiting-on-you state a first-class item in a queue view rather than a stalled spinner. Exactly-once billing pushes a dedup key into every side-effect call, and rainbow deploys mean two runtime versions coexist, so a run detail view has to name which version produced it.',
    learningObjectives: [
      'List the three preconditions durable execution requires: serializable state, deterministic resume, idempotent side effects.',
      'Trace the lease-handover sequence when a worker crashes mid-super-step.',
      'Compute the memory difference between 10,000 threads and 10,000 async fibers handling concurrent LLM calls.',
      'State Bedi\'s start-simple rule and the concrete load level where it starts to strain.',
      'Design the run states a durable multi-agent queue view needs: resumed, waiting-on-you, and rainbow version.',
      'Apply the outbox pattern plus a dedup key to make one paid side effect exactly-once effective.',
    ],
    sections: [
      {
        heading: 'The problem: the in-memory loop does none of it',
        body: 'A prototype with three agents in an in-memory event loop works on one laptop. Then production arrives with four requirements the loop cannot meet.\n\nAgents sometimes run for hours, on long research or waiting on a human. Worker processes crash, and restarting loses state. Peak load is 10x average, so you need horizontal scaling. And users pay per agent-run, so you need exactly-once semantics for charging.\n\nThe 2026 options are a workflow engine with checkpoints (Temporal, the LangGraph runtime), a message queue plus a state store, an actor-model framework with a per-agent queue, or hand-rolled FastAPI plus Postgres.',
      },
      {
        heading: 'Durable execution, and its three preconditions',
        body: 'A durable engine persists full program state after each step. On crash: the worker dies mid-step, the lease times out, another worker picks up the thread id, resumes from the last checkpoint, and produces no duplicate side effects.\n\nThree things have to be true for that to work. Serializable state, so all agent state is persistable, which rules out closures holding live database connections. Deterministic resume, so the same state and inputs produce the same actions, or defer to an external oracle for model calls. Idempotent side effects, so external calls are either idempotent or carry a deduplication key.\n\nLangGraph writes a checkpoint per super-step keyed by thread id, Postgres by default; Temporal writes after each activity; Restate uses event-sourced journals. Same pattern, three implementations. Agents can also interrupt to wait for human input, and the runtime persists and releases the worker, so any worker resumes when the input arrives.',
      },
      {
        heading: 'MegaAgent\'s per-agent queue',
        body: 'MegaAgent (arXiv:2408.09955) ran thousands of concurrent agents on a per-agent producer-consumer queue: each agent has a state of Idle, Processing, or Response, an inbound queue of messages addressed to it, and an outbound queue of replies and side effects.\n\nCoordination is two-layer: dense intra-group chat between agents on the same team, and sparse inter-group admin chat for high-level routing between teams. That split is what keeps cost linear as the agent count climbs into the thousands, because most conversation stays local and only routing decisions cross group boundaries.\n\nThe pattern generalizes past MegaAgent\'s specific numbers. Any system with more than a handful of agents benefits from separating dense local coordination from sparse global coordination, whether the implementation is a literal queue or a message bus with topic scoping.',
      },
      {
        heading: 'The async requirement',
        body: 'The concurrency point is blunter than an architecture preference. Model calls are I O bound, and a thread waiting on the next token is idle 99 percent of the time. Threads cost roughly a megabyte of stack each, so 10,000 concurrent calls is 10GB of stacks alone, before any of them have done useful work.\n\nFibers, meaning asyncio, goroutines, or tokio tasks, cooperatively yield on I O and fit the same 10,000 comfortably in one process. At agent scale, async is the architecture, not an optimization layered on top of one.\n\nThe exception is CPU-bound post-processing: embedding, tokenization, anything that actually burns cycles instead of waiting. That still wants threads or processes, so the practical rule is to keep the I O layer and the CPU layer on separate code paths rather than mixing concurrency models in one loop.',
      },
      {
        heading: 'The counterpoint: start simple, and mean it',
        body: '"Scaling Agentic Software" (Bedi, 2026) argues most teams over-engineer before measuring load. The pragmatic default: FastAPI plus Postgres, each agent run as a row with state updated in place under optimistic concurrency, background jobs via pg_notify or one simple worker, and retry policy in application code.\n\nUnder roughly 100 concurrent agent-runs on manageable tasks, that is often the whole system. Upgrade when you measure it failing.\n\nThe rule that follows: adopt a durable-execution framework when you hit a concrete problem simple architecture cannot solve. Hour-long human-in-the-loop waits, cross-region coordination, and complex retry or compensation policies are those problems. Premature adoption spends the quarter on ceremony that does not pay off.',
      },
      {
        heading: 'Exactly-once, and deploying over live runs',
        body: 'For paid runs you want exactly-once effective, which in practice is at-least-once delivery plus an idempotent consumer. Three moves: a dedup key per run included in every side-effect call; the outbox pattern, where side effects write to a table first and a separate process executes them, both steps idempotent; and compensating transactions for when the effect succeeds but its tracking write fails. None of this is model-specific. The only tax the model adds is that its calls are slow; everything else is standard distributed systems.\n\nRainbow deployment is the other consequence of long runs. Anthropic\'s multi-agent research system runs multiple runtime versions concurrently so hour-long agents are not killed on every deploy: canary the new version on a slice, retire old versions as their agents finish. The production checklist is durable state, idempotent side effects, an async I O layer, at-least-once with dedup, rainbow deploys, and per-agent traces with a super-step audit and a retry counter.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p16-22-inline-queueview.svg',
        alt: 'Four run states in a durable multi-agent queue view',
        caption: 'Running, resumed, waiting-on-you, and degraded are four different things, and a queue view that renders them all as "in progress" hides the one that needs a person.',
        diagramBrief:
          'A vertical list of four rows on cream paper (#faf6ef), black ink, each row a small status chip plus one line of label text: "Running" (plain outline), "Resumed from step 37" (accent-color left border), "Waiting on you" (accent-color fill, distinct from the others), "Degraded, breaker open" (dashed outline). Keep each row visually distinct at a glance, no two rows sharing a treatment. Aspect ratio 4:3.',
      },
      {
        src: '/lessons/p16-22-inline-threadsvfibers.svg',
        alt: 'Memory footprint of 10,000 threads versus 10,000 async fibers',
        caption: '10,000 threads cost about 10GB of stacks before any work happens. 10,000 fibers fit in one process.',
        diagramBrief:
          'Two stacked-block towers side by side on cream paper (#faf6ef), black ink. Left tower labeled "10,000 threads": a tall stack of small blocks reaching near the top of the frame, annotated "~10GB stacks". Right tower labeled "10,000 fibers": a single small block near the bottom, annotated "one process". Use the accent color only on the annotation text, not the blocks. Aspect ratio 16:9.',
      },
    ],
    takeaways: [
      'A resume is not a retry. "Resumed from step 37" is its own state, and rendering it as a retry misreports both the run and the charge.',
      'Waiting on human input is a first-class run state. The agent sleeps and the worker is released, so the queue view needs a waiting-on-you row, not a stalled spinner.',
      'Async is the architecture for I O bound model calls. Threads at 10,000 concurrent calls is 10GB of stacks before any work happens.',
      'Start with FastAPI plus Postgres and upgrade on a measured failure. Under about 100 concurrent runs, ceremony buys nothing.',
    ],
    terms: [
      { term: 'Durable execution', gloss: '"persist the program state"', meaning: 'The engine persists state after each step so crash recovery is deterministic resume, not restart.' },
      { term: 'Super-step', gloss: '"transactional boundary"', meaning: 'The unit of work between checkpoints, LangGraph\'s term for it.' },
      { term: 'thread_id', gloss: '"the run\'s identifier"', meaning: 'The key that binds a run\'s checkpoints and resume logic together across workers.' },
      { term: 'Lease', gloss: '"who owns this run right now"', meaning: 'A worker\'s temporary claim on a run; expiry lets another worker take over the thread.' },
      { term: 'Idempotency', gloss: '"safe to retry"', meaning: 'Repeating a side effect produces the same result as performing it once.' },
      { term: 'Outbox pattern', gloss: '"decouple the side effect"', meaning: 'Write side-effect intent to a table first, then have a separate executor perform and mark it done.' },
      { term: 'At-least-once delivery', gloss: '"might duplicate"', meaning: 'Message-queue semantics where a dedup key on the consumer side is what makes it effectively-once.' },
      { term: 'Rainbow deploy', gloss: '"blue-green, but longer"', meaning: 'Multiple runtime versions running concurrently so long-lived runs survive a deploy.' },
      { term: 'Async fiber', gloss: '"lightweight thread"', meaning: 'User-mode cooperative concurrency, far cheaper than an OS thread for I O bound work.' },
      { term: 'Checkpoint', gloss: '"a save point"', meaning: 'Serialized state at a super-step boundary, the artifact a resume reads from.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A checkpoint fires after every super-step. A worker crashes at step 37 of 60. At what step does the resumed run continue?' },
      { level: 'medium', prompt: 'Design an outbox table for a paid side effect with a dedup key. What are the minimum three columns it needs, and what does each one prevent?' },
      { level: 'medium', prompt: 'At roughly what concurrent-agent-run count does Bedi\'s FastAPI-plus-Postgres default typically get outgrown, and what is the first concrete symptom that triggers the upgrade?' },
      { level: 'design', prompt: 'Design the queue view for a multi-agent ops dashboard. Specify the visual treatment for four run states: running, resumed, waiting on you, and degraded (breaker open), and explain why none of the four should share a treatment.' },
    ],
    furtherReading: [
      { label: 'LangChain, The runtime behind production deep agents', url: 'https://www.langchain.com/conceptual-guides/runtime-behind-production-deep-agents', why: 'The LangGraph checkpoint-per-super-step design this lesson uses as the reference implementation.' },
      { label: 'MegaAgent (arXiv:2408.09955)', url: 'https://arxiv.org/abs/2408.09955', why: 'The per-agent producer-consumer queue and two-layer coordination that keeps cost linear into the thousands.' },
      { label: 'Temporal docs', url: 'https://docs.temporal.io/', why: 'The reference durable-execution engine, checkpointing per activity instead of per super-step.' },
      { label: 'Anthropic, Multi-agent research system', url: 'https://www.anthropic.com/engineering/multi-agent-research-system', why: 'Production notes on rainbow deployment for hour-long agent runs.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Production readiness for a multi-agent runtime',
      body: '- Durable state: a checkpoint or event log survives any single worker crash.\n- Idempotent side effects: every paid or external call carries a dedup key.\n- Async I O layer for model calls, threads or processes reserved for CPU-bound work only.\n- At-least-once delivery with a dedup consumer, not a promise of exactly-once you cannot back up.\n- Rainbow or canary deploys so an hour-long run is never killed by a routine deploy.\n- Per-agent traces with a super-step audit and a retry counter, so a resumed run is visibly different from a retried one.',
    },
    demoCaption:
      'Step through a crash at step 37 with and without checkpoints. Without, the run restarts from zero and re-fires every side effect it already performed. With, a second worker picks up the thread and continues, and the UI owes the user a different word than retry.',
    demo: {
      archetype: 'sequence',
      subject: 'One agent run · worker dies at step 37',
      badLabel: 'In-memory loop',
      goodLabel: 'Checkpoint per super-step',
      badSequence: [
        'run reaches step 37 of 60',
        'worker process crashes',
        'no persisted state, the run is gone',
        'user retries: restart from step 1',
        'every side effect from steps 1 to 36 fires again',
      ],
      goodSequence: [
        'each super-step writes a checkpoint keyed by thread id',
        'worker crashes at step 37, lease expires',
        'a second worker claims the thread id',
        'state deserializes, run continues from step 37',
        'dedup keys make already-performed side effects no-ops',
      ],
      badCaption:
        'Without a checkpoint the crash costs the whole run and a restart re-fires 36 steps of side effects, which for a paid run means charging twice for work the user already received once.',
      goodCaption:
        'Checkpoint per super-step turns the crash into a lease handover, and the resumed run is a distinct state that continued rather than restarted. Idempotent side effects and a dedup key are what make the second pass safe.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'durable execution is three requirements, and most prototypes fail all three.',
        body:
          'durable execution is three requirements, and most prototypes fail all three.\n\nserializable state: no closures holding live db connections.\ndeterministic resume: same state, same inputs, same actions.\nidempotent side effects: or a dedup key.\n\nthen a crash is just a lease handover. worker dies, lease expires, another worker claims the thread id and continues from the last checkpoint.\n\nLangGraph checkpoints per super-step. Temporal per activity. same pattern.',
      },
      {
        kind: 'X · design angle',
        hook: 'a resume is not a retry and rendering them the same way lies to the user.',
        body:
          'a resume is not a retry and rendering them the same way lies to the user.\n\na retry starts over. a resume continued from step 37. different work, different cost, different thing to say.\n\ndurability also creates a state most queue views do not have: waiting on human input. the agent sleeps, the worker is released, and that is a "waiting on you" row, not a stalled spinner.\n\nand under rainbow deploys, two runtime versions coexist. the run detail owes you which one produced it.',
      },
      {
        kind: 'X · one-liner',
        hook: '10,000 concurrent model calls on threads is 10GB of stacks before any work happens.',
        body:
          '10,000 concurrent model calls on threads is 10GB of stacks before any work happens.\n\na thread waiting on the next token is idle 99% of the time and costs ~1MB of stack for the privilege.\n\nfibers yield on I/O and fit the same 10k in one process.\n\nat agent scale async is not an optimization, it is the architecture. keep CPU-bound post-processing on its own layer.',
      },
    ],
    source: {
      label: 'Full lesson: 22 22-production-scaling-queues-checkpoints',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/16-multi-agent-and-swarms/22-production-scaling-queues-checkpoints',
    },
  },
  {
    id: 'p16-23-failure-modes-mast',
    phase: 'Phase 16 · Multi-Agent and Swarms',
    part: 'Part 4 · Running a swarm in production',
    index: '16.23',
    title: 'MAST: three failure categories, three different status states',
    oneLiner:
      'Cemri et al. read 1642 traces across 7 multi-agent systems and found 41 to 86.7 percent failure rates in three categories: specification (41.77%), coordination (36.94%), verification (21.30%).',
    readTime: '~10 min read',
    diagram: '/lessons/p16-23.svg',
    diagramCaption:
      'A retry storm: a 10 percent payment failure amplifying through order and inventory retries into 10x load, and the circuit breaker that caps it.',
    whyItMatters:
      'This taxonomy is a status-state inventory, and the strongest design angle in the phase. Three categories means three different things a run can be failing at, and none of them is a red toast. A specification problem is a pre-flight blocker: two agents both think they are the reviewer, so surface the role conflict before dispatch. A coordination failure is a live desync banner naming which two agents disagree on state. A verification gap is the dangerous one, because the run looks successful, so the surface is a not-yet-verified state visually distinct from done, plus slow-failure proxies (agreement rate, retry rate, output-length drift) rendered as trends.',
    learningObjectives: [
      'Sort a described agent failure into one of MAST\'s three root categories using its defining symptom.',
      'State the percentage share of each MAST category and identify which one is most expensive per failure despite the smallest count.',
      'Name two Groupthink-family failures and the production symptom each produces.',
      'Trace a retry storm from a 10 percent payment failure to cluster overload, and name the fix.',
      'Design three distinct run-status states, one per MAST category, for an agent-trace UI.',
      'Run a quarterly MAST audit: sample size, categorization step, and mitigation-ranking step.',
    ],
    sections: [
      {
        heading: 'The problem: a 41 to 86.7 percent failure rate is not debuggable by vibes',
        body: 'MAST (Cemri et al., NeurIPS 2025, arXiv:2503.13657) is derived from 1642 execution traces across 7 state-of-the-art open-source multi-agent systems. The measured failure rate spans 41 to 86.7 percent depending on the system and task.\n\nThat is not fixable by adding agents. The failures have structural causes, and the taxonomy gives them names in three root categories with 14 sub-types. The 2026 production practice that follows is to treat failure modes as design inputs: your architecture is not good enough until you can point at each category and name the mitigation you deployed.',
      },
      {
        heading: 'Specification problems: 41.77 percent, and they happen before dispatch',
        body: 'The largest category and the earliest. The task or the role was not defined tightly enough. Role ambiguity, where two agents both believe they are the reviewer. Underspecified task, where "summarize this" was asked but a specific angle was wanted. Implicit success criteria, where the agent cannot tell whether it succeeded.\n\nThe mitigations are all pre-flight. Explicit role contracts, where each agent\'s prompt states what it does and what it does not do. Acceptance tests per task, defining what done looks like before the agent starts. And a pre-flight spec check, a separate agent reviewing the task definition before dispatch. Which means the surface is a blocker at submit time, not an error after the run.',
      },
      {
        heading: 'Coordination failures: 36.94 percent, and they happen live',
        body: 'Communication or state breakdown between agents. Two agents updating shared state without synchronization. A message lost to a queue failure or timeout. State drift, where agent A believes the task is done while agent B is still executing.\n\nMitigations: versioned shared state with optimistic concurrency, explicit acknowledgment on critical messages with retry until acked, and periodic state-sync checkpoints so drift is detected early rather than discovered late.\n\nThis is the category with a live surface. A desync is something you can name while it is happening: these two agents disagree about state, here is which fields differ, here is the last consistent checkpoint.',
      },
      {
        heading: 'Verification gaps: 21.30 percent by count, most expensive per failure',
        body: 'No independent check on outputs. One agent claims success and nobody verifies. A chain of agents each trusting the previous one\'s output. No coverage on the composed emergent behavior.\n\nMitigations: an independent verifier with read-only independent source access, an explicit handoff contract where A\'s output must pass checker C before B starts, and outcome logging for post-hoc analysis.\n\nThe reason this is the most expensive category despite being the smallest by count is silence. A system that fails loudly can be monitored. A system producing plausible-but-wrong output cannot be caught by exception logs. Memory poisoning is the archetype: one agent\'s hallucination enters shared memory, downstream agents treat it as fact, and accuracy decays gradually rather than crashing, which makes root cause painful to find.',
      },
      {
        heading: 'Groupthink: five ways homogeneity fails',
        body: 'The Groupthink family (arXiv:2508.05687) names five failures that show up when agents converge instead of covering for each other. Monoculture collapse: a shared base model means shared hallucinations, so three agents built on the same model do not actually triple-check anything. Conformity bias: agents adjust toward the loudest or most confident peer, even when that peer is wrong.\n\nDeficient theory of mind: agents fail to model what a peer actually believes, so coordination messages talk past each other. Mixed-motive dynamics: agents with partially aligned incentives drift toward a compromise middle that satisfies nobody. Cascading reliability failures: one component\'s error pattern triggers matching error patterns downstream.\n\nAll five are diagnosable from the same symptom: the system\'s outputs correlate more than the task should allow. If three independent checks agree suspiciously often, the checks are not independent.',
      },
      {
        heading: 'Retry storms and the audit discipline',
        body: 'The canonical cascade: payment fails 10 percent of requests, the order agent retries naively, each retry is a fresh inventory check, inventory sees 2x load, inventory starts timing out, every order retries the inventory check, inventory sees 10x load, the cluster goes down. The fix is borrowed unmodified from distributed systems: circuit breakers on every outbound call, opening at a 5 to 10 percent error rate and short-circuiting with cached or default results, plus capped retry budgets per request.\n\nSTRATUS (NeurIPS 2025) reports a 1.5x mitigation-success improvement from three specialized roles: a detection agent watching symptom patterns, a diagnosis agent inferring root cause from the taxonomy, and a validation agent confirming symptoms cleared.\n\nThe discipline around all of this is a quarterly audit: sample about 1000 traces, categorize failures against MAST and Groupthink, compute the per-category rate, rank mitigations by failures eliminated, pick two or three, re-audit next quarter.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p16-23-inline-taxonomy.svg',
        alt: 'MAST\'s three failure categories sized by share and annotated with a status state',
        caption: 'Specification (41.77%), coordination (36.94%), and verification (21.30%) each need a different surface, not one red toast.',
        diagramBrief:
          'Three horizontal bars on cream paper (#faf6ef), black ink, stacked vertically, widths proportional to 41.77, 36.94, and 21.30 out of 100. Label each bar with its category name, percentage, and a short status-state tag to its right: "pre-flight blocker", "live desync banner", "not-yet-verified state". Fill the verification bar (smallest, most expensive) in the accent color to flag it as the dangerous one. Aspect ratio 16:9.',
      },
      {
        src: '/lessons/p16-23-inline-stratus.svg',
        alt: 'The STRATUS detection, diagnosis, validation trio',
        caption: 'Three specialized agents running the incident-response loop that SRE teams already know.',
        diagramBrief:
          'Three connected boxes in a horizontal flow on cream paper (#faf6ef), black ink, labeled "Detection" (watches for symptom patterns), "Diagnosis" (infers root cause from MAST taxonomy), "Validation" (confirms symptoms cleared), with an arrow looping from validation back to detection to show the cycle repeats. Highlight the loop arrow in the accent color. Aspect ratio 4:3.',
      },
    ],
    takeaways: [
      'Three categories, three surfaces. Specification is a pre-flight blocker, coordination is a live desync banner, verification is a not-yet-verified state distinct from done.',
      'Verification gaps are 21.30 percent by count and the most expensive per failure, because the run looks successful and exception logs never fire.',
      'Instrument slow-failure proxies as trends: agreement rate, retry rate, output-length distribution. Drift is what you catch before it becomes a visible error.',
      'Circuit breakers on every outbound call, opening at 5 to 10 percent error rate. The retry storm is the one failure you fix with borrowed distributed-systems parts.',
    ],
    terms: [
      { term: 'MAST', gloss: '"the 2026 taxonomy"', meaning: 'Cemri et al. 2025: three root failure categories and fourteen sub-types from 1642 multi-agent traces.' },
      { term: 'Specification problem', gloss: '"role ambiguity"', meaning: 'A task or role under-defined, so agents do not know their boundary. 41.77 percent of failures.' },
      { term: 'Coordination failure', gloss: '"state drift"', meaning: 'A communication or state-sync breakdown between agents. 36.94 percent of failures.' },
      { term: 'Verification gap', gloss: '"nobody checked"', meaning: 'Output accepted with no independent check. 21.30 percent by count, worst per failure.' },
      { term: 'Groupthink family', gloss: '"homogeneity failures"', meaning: 'Five related patterns: monoculture, conformity, deficient theory of mind, mixed-motive, cascading.' },
      { term: 'Monoculture collapse', gloss: '"same model, same blind spots"', meaning: 'Correlated errors that come from a shared base model or shared training data.' },
      { term: 'Retry storm', gloss: '"cascading amplification"', meaning: 'One failure triggering retries that amplify load downstream until a dependency collapses.' },
      { term: 'Circuit breaker', gloss: '"fail fast on error rate"', meaning: 'A pattern that opens when error rate exceeds a threshold and short-circuits with a cached or default result.' },
      { term: 'STRATUS', gloss: '"incident-response trio"', meaning: 'Detection, diagnosis, and validation agents working together, reporting a 1.5x mitigation-success improvement.' },
      { term: 'Memory poisoning', gloss: '"hallucinations propagate"', meaning: 'A hallucination entering shared memory and being read as fact by every downstream agent.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A trace shows two agents both executing the "reviewer" role on the same task. Which MAST category does this fall under, and what is the pre-flight mitigation?' },
      { level: 'medium', prompt: 'A payment service fails 10 percent of requests and downstream retries are naive. Walk the retry-storm sequence step by step, and name where a circuit breaker set at 8 percent error rate would cut it off.' },
      { level: 'medium', prompt: 'Name one slow-failure proxy metric for monoculture collapse. What does a sudden drop in that metric mean, and why would exception logs never catch it?' },
      { level: 'design', prompt: 'Design three distinct status chips for an agent-run list: specification, coordination, and verification. Specify color, icon, and one line of copy for each, and explain why none of the three should default to a generic red toast.' },
    ],
    furtherReading: [
      { label: 'Cemri et al., Why Do Multi-Agent LLM Systems Fail? (arXiv:2503.13657)', url: 'https://arxiv.org/abs/2503.13657', why: 'The MAST taxonomy itself, NeurIPS 2025, built from 1642 execution traces.' },
      { label: 'Groupthink failures in multi-agent LLMs (arXiv:2508.05687)', url: 'https://arxiv.org/abs/2508.05687', why: 'The five homogeneity failures: monoculture, conformity, deficient ToM, mixed-motive, cascading.' },
      { label: 'Nygard, Release It! (stability patterns)', url: 'https://pragprog.com/titles/mnee2/release-it-second-edition/', why: 'The canonical circuit-breaker reference this lesson borrows unmodified.' },
      { label: 'Anthropic, Multi-agent research system', url: 'https://www.anthropic.com/engineering/multi-agent-research-system', why: 'Production failure-mode notes that predate and corroborate MAST.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Quarterly MAST failure-mode audit',
      body: '- Sample roughly 1000 real execution traces.\n- Categorize each failure against MAST\'s three root categories and the Groupthink five.\n- Compute the failure rate per category for your system specifically, not the published averages.\n- Rank candidate mitigations by how many failures each would eliminate.\n- Pick two or three mitigations, ship them, and re-audit next quarter rather than annually.',
    },
    demoCaption:
      'Watch the retry storm build from a 10 percent payment failure, then toggle the circuit breaker. Ungated, load reaches 10x in seconds and the cluster goes down. Gated, the breaker opens at threshold and serves degraded responses instead.',
    demo: {
      archetype: 'sequence',
      subject: 'Retry cascade · payment fails 10 percent',
      badLabel: 'No circuit breaker',
      goodLabel: 'Circuit breaker at 8 percent',
      badSequence: [
        'payment service fails 10 percent of requests',
        'order agent retries with naive backoff',
        'each retry re-runs the inventory check',
        'inventory sees 2x load, starts timing out',
        'every order now retries inventory: 10x load, cluster down',
      ],
      goodSequence: [
        'payment service fails 10 percent of requests',
        'error rate crosses the 8 percent threshold',
        'breaker opens, calls short-circuit immediately',
        'cached or default result served, retry budget capped',
        'load stays flat, degraded mode is a visible state',
      ],
      badCaption:
        'Naive retries turn a 10 percent dependency failure into a cluster outage, because each retry is a fresh downstream call and the amplification compounds across agents in seconds.',
      goodCaption:
        'The breaker opens on error rate and short-circuits with a cached or default result, which caps the amplification and turns the incident into a degraded mode you can render. Degraded is a state worth designing, since it is the one the user actually sees.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'multi-agent systems fail 41 to 86.7% of the time. MAST sorted 1642 traces into why.',
        body:
          'multi-agent systems fail 41 to 86.7% of the time. MAST sorted 1642 traces into why.\n\nspecification problems: 41.77%. role ambiguity, underspecified task, implicit success criteria.\ncoordination failures: 36.94%. unsynchronized state, lost messages, drift.\nverification gaps: 21.30%. nobody checked.\n\nthree root categories, 14 sub-types, 7 open-source systems. these are structural, not model limits.',
      },
      {
        kind: 'X · design angle',
        hook: 'three failure categories means three status states, and none of them is a red toast.',
        body:
          'three failure categories means three status states, and none of them is a red toast.\n\nspecification: a pre-flight blocker. two agents both think they are the reviewer, so surface the role conflict before dispatch.\ncoordination: a live banner naming which two agents disagree on state and which fields differ.\nverification: the hard one. the run looks successful, so you need a "not yet verified" state visually distinct from done.\n\nplus slow-failure proxies as trends: agreement rate, retry rate, output-length drift.',
      },
      {
        kind: 'X · one-liner',
        hook: 'verification gaps are 21% of failures and the most expensive per failure.',
        body:
          'verification gaps are 21% of failures and the most expensive per failure.\n\nbecause a system that crashes can be monitored. a system producing plausible-but-wrong output cannot be caught by exception logs.\n\nmemory poisoning is the shape: one hallucination enters shared memory, downstream agents read it as fact, accuracy decays gradually instead of failing.\n\nno crash, no alert, no root cause.',
      },
    ],
    source: {
      label: 'Full lesson: 23 23-failure-modes-mast-groupthink',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/16-multi-agent-and-swarms/23-failure-modes-mast-groupthink',
    },
  },
  {
    id: 'p16-24-eval-coordination',
    phase: 'Phase 16 · Multi-Agent and Swarms',
    part: 'Part 4 · Running a swarm in production',
    index: '16.24',
    title: 'Reading a multi-agent benchmark claim without being had',
    oneLiner:
      'Frontier models score near 23 percent on SWE-bench Pro against 70 percent plus on Verified, and the gap is contamination. COMMA and MedAgentBoard both find multi-agent often underperforms one model.',
    readTime: '~10 min read',
    diagram: '/lessons/p16-24.svg',
    diagramCaption:
      'The same models on SWE-bench Verified and Pro, with the gap between the two bars standing in for benchmark contamination.',
    whyItMatters:
      'Every benchmark number in this lesson is a product constraint you will translate into interface. A 23 percent success rate means the primary flow is failure-handling, not the happy path. MedAgentBoard finding multi-agent often does not beat a single model is a direct argument against shipping an orchestration layer you cannot measure, since each layer you add is latency the user waits through. And the missing axis is the one you need most: nothing here measures cost-normalized performance, so a 90 percent solution at 20x cost arrives at your door as a pricing decision wearing a capability claim.',
    learningObjectives: [
      'Explain why SWE-bench Verified and SWE-bench Pro report different numbers for the same model, and name the cause.',
      'State which coordination topology MARBLE found best for research versus stepwise coding, and where the coordination tax appears.',
      'Apply the six-question checklist to a multi-agent benchmark claim before repeating it in a deck.',
      'Name one benchmark finding, from COMMA or MedAgentBoard, that argues against adding a multi-agent layer by default.',
      'List the four measurement axes no current benchmark reports well.',
      'Design a status treatment for a product feature whose backing benchmark scores near 23 percent.',
    ],
    sections: [
      {
        heading: 'The problem: better than what, on what, measured how',
        body: 'The 2023 to 2024 era of multi-agent evaluation was chaos. Everyone picked their own metrics, their own baselines, and their own task sets, so no two claims were comparable. The 2025 to 2026 benchmarks imposed structure.\n\nThe sharper problem is contamination. SWE-bench Verified drifted into training corpora by mid-2025, frontier scores inflated, and the number stopped measuring capability. Pro was designed as an uncontaminated reality check. Without hold-out benchmarks you cannot distinguish a model that solves problems from a model that has seen them.',
      },
      {
        heading: 'MARBLE and COMMA: topology, and a null result worth respecting',
        body: 'MultiAgentBench (MARBLE, ACL 2025, arXiv:2503.01935) evaluates star, chain, tree, and graph coordination on research, coding, and planning with milestone KPIs that give partial credit for progress rather than only final success. Measured: graph best for research, chain best for stepwise coding, star best for fast-factual consolidation, a coordination tax past roughly 4 agents on graph, and cognitive planning adding about 3 percent milestone achievement across topologies.\n\nCOMMA covers multimodal asymmetric-information coordination, where agents observe through different modalities and must coordinate without full sharing. The reported result is uncomfortable: frontier models including GPT-4o struggle to beat a random baseline on agent-agent collaboration. Single-modality cooperation is handled reasonably; multimodal coordination collapses. A null result is still a finding, and this one says measure before claiming.',
      },
      {
        heading: 'MedAgentBoard and AgentArch: the layers you cannot justify',
        body: 'MedAgentBoard (arXiv:2505.12371) covers four medical task categories, diagnosis, treatment planning, report generation, and patient communication, comparing multi-agent against single model and against conventional rule-based systems.\n\nThe finding: multi-agent does not dominate single-model on most categories. The advantage is narrow. Task decomposition helps when subtasks are cleanly separable, such as diagnosis plus treatment, and hurts when coordination overhead exceeds the specialization gain, as in report generation. If that generalizes, many proposed multi-agent systems are over-engineered.\n\nAgentArch (arXiv:2509.10769) benchmarks enterprise stacks with tool use, memory, and orchestration layered together, and isolates each layer\'s contribution. How much does adding tools help? Adding memory? Adding orchestration? It exists so you stop buying layers whose value you cannot measure.',
      },
      {
        heading: 'SWE-bench Pro: the contamination gap, and the agent-team delta',
        body: 'SWE-bench Pro (arXiv:2509.16941) is 1865 problems across 41 repositories spanning business apps, B2B services, and developer tools, designed to be uncontaminated against later training cutoffs. Frontier models score roughly 23 percent on Pro against 70 percent plus on Verified. That gap is the contamination signal, not a difficulty signal.\n\nApril 2026 numbers: Claude Opus 4.7 reported at 64.3 percent on Pro with explicit agent-teams coordination, though with no Anthropic primary source published, so treat it as preliminary. Verdent, an agent scaffold, at 76.1 percent pass at 1 on Verified. Frontier raw scores on Pro without agent scaffolding around 23 to 35 percent.\n\nThe takeaway cuts both ways. "We beat SWE-bench Verified" is no longer evidence of capability, and Pro is the current gating test. And agent-team scaffolding produces a measurable 30 to 40 point delta on Pro, which is one of the strongest empirical arguments for multi-agent coordination in 2026.',
      },
      {
        heading: 'The six-question checklist',
        body: 'When someone claims a multi-agent result, six questions separate a real claim from a headline. Which benchmark and which split, because Verified versus Pro changes everything about the same model. Contamination check: was the benchmark released after the training cutoff. Baseline comparison against a single model, against random, and against prior multi-agent work, not against an untuned version of the same system.\n\nStatistical significance, with N trials and an interval, since frontier models are high-variance and single runs mislead. Task diversity: one task or many. And cost disclosure: tokens per task and wall-clock time.\n\nMissing any one of the six is itself the answer. A claim that survives all six is rare enough that you should notice when it happens.',
      },
      {
        heading: 'The four axes nobody measures',
        body: 'What none of the benchmarks in this lesson measure well: long-horizon coordination, since all current benchmarks run short relative to a production agent that might work for days. Adversarial resilience, meaning what happens when one agent in the system is compromised or malicious.\n\nDrift under deployment, since benchmarks are static snapshots and production distributions shift under them within a quarter. And cost-normalized performance, since almost every benchmark reports raw accuracy rather than accuracy per dollar, which is the number that actually determines whether a result ships.\n\nBuilding an internal benchmark on the axis you actually care about, rebuilt quarterly and always including a random baseline, is usually the right move precisely because the public benchmarks stop at accuracy.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p16-24-inline-topology.svg',
        alt: 'MARBLE\'s topology recommendation by task type',
        caption: 'Graph wins for research, chain wins for stepwise coding, star wins for fast-factual consolidation, and a coordination tax shows up past roughly 4 agents on graph.',
        diagramBrief:
          'A 3-row by 4-column grid on cream paper (#faf6ef), black ink. Columns: star, chain, tree, graph. Rows: research, coding, fast-factual. Mark the best-fit cell in each row with a filled accent-color dot, leave the rest as empty circles. Below the grid, one annotation line: "coordination tax appears past ~4 agents on graph." Aspect ratio 4:3.',
      },
      {
        src: '/lessons/p16-24-inline-checklist.svg',
        alt: 'The six-question checklist as a rubric card',
        caption: 'Missing any one of the six questions is itself the answer.',
        diagramBrief:
          'A single vertical card on cream paper (#faf6ef), black ink border, with six numbered rows, each a short question fragment: "which split?", "contamination checked?", "baseline vs what?", "N trials + interval?", "one task or many?", "cost disclosed?". Each row has an empty checkbox to its left. Leave all six checkboxes empty to signal "verify before you believe it." Aspect ratio 3:4.',
      },
    ],
    takeaways: [
      'Ask which split before you read the number. Roughly 23 percent on Pro against 70 percent plus on Verified is the same models, and the gap is contamination.',
      'A 23 percent success rate makes failure handling the primary flow. Design the recovery path first and the happy path second.',
      'MedAgentBoard found multi-agent often does not beat a single model. Every orchestration layer is latency the user waits through, so measure the layer before shipping it.',
      'No benchmark reports accuracy per dollar, so a 90 percent solution at 20x cost will reach you as a capability claim when it is a pricing decision.',
    ],
    terms: [
      { term: 'MARBLE', gloss: '"MultiAgentBench"', meaning: 'ACL 2025: star, chain, tree, and graph topologies scored on milestone KPIs.' },
      { term: 'COMMA', gloss: '"the multimodal benchmark"', meaning: 'Multimodal asymmetric-information coordination, where frontier models struggle to beat random.' },
      { term: 'MedAgentBoard', gloss: '"the medical benchmark"', meaning: 'Four medical task categories where multi-agent often fails to dominate a single model.' },
      { term: 'AgentArch', gloss: '"the enterprise benchmark"', meaning: 'Isolates the contribution of tools, memory, and orchestration layered together in enterprise agent stacks.' },
      { term: 'SWE-bench Pro', gloss: '"the harder SWE-bench"', meaning: '1865 problems over 41 repos, built to resist contamination. Roughly 23 percent versus 70 percent plus on Verified.' },
      { term: 'Milestone achievement', gloss: '"partial credit"', meaning: 'Scoring progress toward a task rather than only final success.' },
      { term: 'Contamination', gloss: '"the benchmark leaked"', meaning: 'A benchmark drifting into training corpora after release, inflating reported scores.' },
      { term: 'WMAC', gloss: '"the 2026 conference track"', meaning: 'The AAAI 2026 Bridge Program\'s Workshop on Multi-Agent Coordination, the community\'s 2026 focal point.' },
      { term: 'Cost-normalized performance', gloss: '"accuracy per dollar"', meaning: 'The measurement almost no published benchmark reports, which is what actually determines whether a result should ship.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A paper reports "91 percent on SWE-bench" with no split named. Which two questions from the six-question checklist do you ask first, and why do those two come before the rest?' },
      { level: 'medium', prompt: 'MARBLE found a coordination tax past roughly 4 agents on graph topology. What does that imply for the default agent count in a research-agent product, and what would you measure to confirm the tax applies to your system?' },
      { level: 'medium', prompt: 'MedAgentBoard found multi-agent underperforms a single model specifically on report generation. Explain the mechanism: why does coordination overhead exceed the specialization gain there but not in diagnosis plus treatment planning?' },
      { level: 'design', prompt: 'Design the confidence or verified badge for a feature backed by a benchmark scoring near 23 percent. What does the badge say, and what does the failure-recovery flow next to it look like?' },
    ],
    furtherReading: [
      { label: 'MultiAgentBench / MARBLE (arXiv:2503.01935)', url: 'https://arxiv.org/abs/2503.01935', why: 'The topology benchmark with milestone KPIs behind the graph-chain-star findings, ACL 2025.' },
      { label: 'MedAgentBoard (arXiv:2505.12371)', url: 'https://arxiv.org/abs/2505.12371', why: 'The domain stress test finding multi-agent often does not dominate a single model.' },
      { label: 'AgentArch (arXiv:2509.10769)', url: 'https://arxiv.org/abs/2509.10769', why: 'Isolates the contribution of tools, memory, and orchestration layered together in enterprise stacks.' },
      { label: 'SWE-bench Pro (arXiv:2509.16941)', url: 'https://arxiv.org/abs/2509.16941', why: 'The 1865-problem, 41-repo benchmark built to resist contamination, source of the 23 percent number.' },
      { label: 'SWE-bench leaderboards', url: 'https://www.swebench.com/', why: 'Current Verified and Pro scores for frontier models, updated as new runs are reported.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Six questions before you believe a multi-agent benchmark claim',
      body: '- Which benchmark, and which split. Verified and Pro are not the same claim.\n- Was the benchmark released after the model\'s training cutoff.\n- What is the baseline: a single model, a random baseline, and prior multi-agent work, not an untuned version of the same system.\n- N trials and a confidence interval, not one lucky run.\n- One task or many: does the result generalize.\n- Cost disclosed: tokens per task and wall-clock, since a 90 percent solution at 20x cost is a pricing decision, not a capability claim.',
    },
    demoCaption:
      'The headline says frontier models solve 70 percent of software engineering tasks. Open the breakdown and the same models are near 23 percent on the uncontaminated split, with the agent-scaffolded runs sitting in between.',
    demo: {
      archetype: 'meter',
      subject: 'SWE-bench · one model, two splits',
      headline: '70 percent plus on SWE-bench Verified',
      breakdown: [
        { label: 'Verified (contaminated by mid-2025)', value: 70 },
        { label: 'Pro, raw, no agent scaffolding', value: 23 },
        { label: 'Pro, with agent-teams coordination (preliminary)', value: 64 },
        { label: 'Verified, best agent scaffold, pass at 1', value: 76 },
      ],
      badCaption:
        'A single headline percentage hides which split produced it, so the same model reads as either near-solved or barely working. Verified drifted into training corpora by mid-2025, which means the high number stopped measuring capability and started measuring exposure.',
      goodCaption:
        'Split apart, the 23 percent on the uncontaminated set is the honest capability read and the 30 to 40 point lift from agent-teams scaffolding is the real argument for coordination. Both numbers are product constraints: one sets how much failure handling you build, the other sets what the orchestration layer is worth.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: '70%+ on SWE-bench Verified. ~23% on Pro. same models.',
        body:
          '70%+ on SWE-bench Verified. ~23% on Pro. same models.\n\nthe gap is not difficulty, it is contamination. Verified drifted into training corpora by mid-2025 and the number stopped measuring capability.\n\nPro: 1865 problems, 41 repos, built against later training cutoffs.\n\nagent-teams scaffolding adds a measurable 30-40 points on Pro. that delta is currently the strongest empirical case for multi-agent coordination.',
      },
      {
        kind: 'X · design angle',
        hook: 'a 23% success rate means failure handling is the primary flow.',
        body:
          'a 23% success rate means failure handling is the primary flow.\n\nyou are not building a happy path with error states bolted on. you are building a recovery surface that occasionally succeeds.\n\nand MedAgentBoard found multi-agent often does not beat a single model. every orchestration layer is latency the user waits through.\n\nmeasure the layer against a single-model baseline before you ship it. AgentArch exists for exactly this.',
      },
      {
        kind: 'X · one-liner',
        hook: 'no multi-agent benchmark reports accuracy per dollar.',
        body:
          'no multi-agent benchmark reports accuracy per dollar.\n\nso a 90% solution at 20x cost arrives at your desk as a capability claim when it is a pricing decision.\n\nsix questions before you believe a number: which split, contamination checked, baseline against what, N trials and interval, one task or many, tokens and wall-clock disclosed.\n\nmissing any of the six is the answer.',
      },
    ],
    source: {
      label: 'Full lesson: 24 24-evaluation-coordination-benchmarks',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/16-multi-agent-and-swarms/24-evaluation-coordination-benchmarks',
    },
  },
];
