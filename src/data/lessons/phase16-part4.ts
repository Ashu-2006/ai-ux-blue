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
      'In 2000 the IEEE ratified an agent communication language with twenty performatives, formal semantics, and a protocol library. It faded because ontologies were too heavy for the web. MCP, A2A, and ACP are the same envelope in JSON with looser semantics.',
    readTime: '~8 min read',
    diagram: '/lessons/p16-02.svg',
    diagramCaption:
      'A FIPA-ACL envelope beside an MCP tools/call: seven metadata fields around one payload, in both cases.',
    whyItMatters:
      'This one is a mental model rather than a component, and the payoff is a field. Every agent message carries an intent class (inform, request, propose, cfp, failure, not-understood), and if your trace viewer renders all messages as one uniform bubble, you have thrown away the only unambiguous part of the protocol. A message-type field lets you filter a trace by intent, style a failure differently from an inform, and correlate a request with its reply by conversation id. The heritage also names the failure you inherit by dropping ontologies: semantic drift, where two agents mean different things by "customer" and no validator catches it.',
    sections: [
      {
        heading: 'The problem: the 2026 protocol landscape is a rediscovery',
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
    ],
    takeaways: [
      'Every agent message has an intent class. Carry it as a field, or your trace UI cannot filter by intent, style failures distinctly, or pair a request with its reply.',
      'Ask five questions of any new protocol: what is the intent primitive, is there a correlation id, what is the content language, are interaction protocols first-class, and what happens on semantic drift.',
      'Contract Net, subscribe-notify, and request-when are worth porting. You are otherwise reimplementing them from scratch under new names.',
      'Dropping the ontology bought JSON and prose and cost you wire-time meaning checks. JSON Schema on content is the cheap part of that back.',
    ],
    terms: [
      { term: 'Speech act', meaning: 'Austin and Searle: an utterance that performs an action rather than describing the world.' },
      { term: 'FIPA-ACL', meaning: 'The IEEE agent communication language ratified in 2000: performative plus content plus metadata.' },
      { term: 'Performative', meaning: 'The intent class of a message: inform, request, propose, cfp, failure, and so on.' },
      { term: 'KQML', meaning: 'The 1993 predecessor to ACL, simpler and narrower, that first made speech acts a wire format.' },
      { term: 'Ontology', meaning: 'A formal definition of the concepts a content language refers to, required by FIPA and dropped since.' },
      { term: 'Semantic drift', meaning: 'Two agents using the same word for different concepts, with no validator to catch it.' },
    ],
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
      'Prompts are not differentiable, so gradient methods are out. PSO and ACO only need an evaluator. Model Swarms reports a 13.3 percent average gain over 12 baselines, and AMRO-S pheromone routing reports a 4.7x speedup with interpretable routing evidence.',
    readTime: '~8 min read',
    diagram: '/lessons/p16-19.svg',
    diagramCaption:
      'Stigmergy: agents leave a pheromone trail on routes that passed the quality gate, and the trail decays so routes can be rediscovered.',
    whyItMatters:
      'The product-level constraint here is a cost per iteration you have to expose before anyone hits run. N particles times T iterations times per-eval cost is the whole story: 20 particles over 50 iterations at roughly two cents a call is about 20 dollars, and a PSO that costs 500 dollars per iteration for half a point is not shippable. So the optimizer needs a live cost meter and a convergence curve, not a spinner. The ACO half gives you something rarer: pheromone strength is human-readable routing evidence, which means "why this agent" has a number behind it instead of a shrug.',
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
        body: 'Dorigo 1992. Ants traverse a graph, each path carries a pheromone trail, move probabilities weight by trail strength, ants that complete deposit pheromone proportional to solution quality, and pheromone decays over time.\n\nAMRO-S (arXiv:2603.12933) applies this to multi-agent routing. Each task type is a destination, each agent is a candidate route, and pheromones strengthen routes that produced good outputs. Three contributions: interpretable routing evidence, since pheromone strength is a human-readable signal; a quality-gated asynchronous update, so pheromones deposit only after quality checks pass, decoupling inference from learning; and a reported 4.7x speedup on the routing benchmark. The quality gate is the load-bearing part. Without it, fast-but-wrong agents accrue pheromone and the system locks onto bad routes.',
      },
      {
        heading: 'When to use which, and the three practical limits',
        body: 'PSO when the search space is continuous or maps to continuous parameters (prompt embeddings, LoRA weights, numeric generation parameters), fitness is cheap and automatic, and the population can stay small. ACO when the problem is routing or path selection, the same task types recur so decisions reinforce, and you need interpretable evidence for the routing decision.\n\nNeither when fitness requires human review, since per-iteration cost becomes prohibitive; when the space is discrete and combinatorial in a way PSO does not cover, where genetic algorithms fit better; or when latency is strict, since both converge slowly relative to a single-pass heuristic.\n\nThe limits: population budget, which is N times T times per-eval cost. Exploration versus exploitation, where decay rate and inertia trade off, too fast forgets good solutions and too slow sticks on early local optima. And catastrophic drift, where a shifted fitness landscape makes old personal bests and aged pheromones stale, so you reset or temporarily double the decay when the eval distribution changes.',
      },
    ],
    takeaways: [
      'Cost is N particles times T iterations times per-eval price. Surface it as a live meter, because the optimizer that gains 0.5 points for 500 dollars an iteration should be stoppable mid-run.',
      'The quality gate is what makes ACO routing safe. Ungated, fast-and-wrong agents accrue pheromone and the router locks in on them.',
      'Pheromone strength is interpretable routing evidence, so "why this agent" has a number rather than a shrug.',
      'Reset decay on distribution shift. Aged pheromones and stale personal bests are the failure that looks like the optimizer breaking for no reason.',
    ],
    terms: [
      { term: 'PSO', meaning: 'Particle Swarm Optimization, Kennedy and Eberhart 1995: a population-based gradient-free optimizer.' },
      { term: 'ACO', meaning: 'Ant Colony Optimization, Dorigo 1992: route selection via depositing and decaying pheromone trails.' },
      { term: 'LMPSO', meaning: 'PSO where the velocity is a prompt and the model generates the next candidate output.' },
      { term: 'Model Swarms', meaning: 'PSO over expert model weight subspaces, reporting 13.3 percent average gain over 12 baselines.' },
      { term: 'Pheromone', meaning: 'Routing memory: strength on an edge that deposits on quality and decays over time.' },
      { term: 'Catastrophic drift', meaning: 'A shifted fitness landscape making prior bests and accumulated pheromones stale.' },
    ],
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
      'MADDPG, QMIX, and MAPPO are three answers to one problem: independent learners see a non-stationary world and centralized control does not deploy. CTDE trains with global information and ships local policies. MAPPO is the 2026 default baseline.',
    readTime: '~8 min read',
    diagram: '/lessons/p16-20.svg',
    diagramCaption:
      'CTDE: a critic seeing all observations and actions during training, and actors that see only their own observation at runtime.',
    whyItMatters:
      'CTDE is worth taking as an architecture discipline even if you never train anything. During design you assume full team visibility; at runtime you enforce that each agent sees only its own observation. Most production multi-agent systems silently assume shared state everywhere, and the CTDE rule is what forces per-agent state to be explicit and partial observability to be a decision rather than an accident. The other transfer is a name for a bug you have already hit: non-stationarity, which in agent products reads as "my agent worked last month, then an upstream agent changed, and now mine misbehaves."',
    sections: [
      {
        heading: 'The problem: two obvious approaches, both broken',
        body: 'Agent systems increasingly want trained policies for inter-agent decisions: when to defer, when to act, which peer to call. The literature for that is multi-agent reinforcement learning, and it predates the current wave.\n\nIndependent RL, where each agent learns alone and treats the others as environment, is non-stationary from every agent\'s perspective. The environment includes other agents\' policies, those policies keep changing, and single-agent convergence proofs break.\n\nCentralized RL, where one policy controls everyone, does not scale and violates the execution constraint that each agent only observes its own slice. CTDE is the answer: train with global information, deploy with local policies.',
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
    takeaways: [
      'Take CTDE as a design rule even without training: full visibility at design time, strictly local observation at runtime. It forces per-agent state to be explicit.',
      'Non-stationarity is the name for "my agent broke when an upstream agent changed." Prompt fixes are faster; CTDE training is the durable one.',
      'Start with MAPPO. It is the 2026 baseline, it needed minimal tuning across five benchmark suites, and reproducing it first saves weeks.',
      'QMIX\'s monotonicity is what buys decentralized argmax, and it is also what excludes any reward where one agent sacrifices for the team.',
    ],
    terms: [
      { term: 'CTDE', meaning: 'Centralized training, decentralized execution: global information while learning, local policies at runtime.' },
      { term: 'MADDPG', meaning: 'Lowe et al. 2017: per-agent critics seeing all observations and actions; the original CTDE method.' },
      { term: 'QMIX', meaning: 'Rashid et al. 2018: monotone mixing of per-agent values so each agent can argmax independently.' },
      { term: 'MAPPO', meaning: 'Yu et al. 2022: PPO with a centralized value function, the 2026 default cooperative baseline.' },
      { term: 'Non-stationarity', meaning: 'Each agent\'s environment shifting as other agents change policy. The core MARL problem.' },
      { term: 'SMAC', meaning: 'StarCraft Multi-Agent Challenge: cooperative micro-management under partial observation.' },
    ],
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
      'Durable execution means a checkpoint after every super-step, so any worker resumes any run after any crash. Async is not an optimization at this scale, it is the architecture. And the honest default is still FastAPI plus Postgres until you measure it failing.',
    readTime: '~8 min read',
    diagram: '/lessons/p16-22.svg',
    diagramCaption:
      'A run checkpointing after each super-step, crashing mid-step, and a second worker picking up the thread from the last saved state.',
    whyItMatters:
      'Durability creates run states you have to design, not just states you have to store. A resumed run is not a retry: it continued from step 37 rather than starting over, and rendering them identically lies about what happened and about what the user was charged. An agent can also sleep indefinitely waiting for human input, which makes a waiting-on-you state a first-class item in a queue view rather than a stalled spinner. Exactly-once billing pushes a dedup key into every side-effect call, and rainbow deploys mean two runtime versions coexist, so a run detail view has to name which version produced it.',
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
        heading: 'Per-agent queues and the async requirement',
        body: 'MegaAgent (arXiv:2408.09955) ran thousands of concurrent agents on a per-agent producer-consumer queue: each agent has a state of Idle, Processing, or Response, an inbound queue of messages addressed to it, and an outbound queue of replies and side effects. Coordination is two-layer, dense intra-group chat plus sparse inter-group admin chat, which is what keeps cost linear into the thousands.\n\nThe concurrency point is blunter. Model calls are I O bound, and a thread waiting on the next token is idle 99 percent of the time. Threads cost roughly a megabyte of stack each, so 10,000 concurrent calls is 10GB of stacks alone. Fibers, meaning asyncio, goroutines, or tokio tasks, cooperatively yield on I O and fit the same 10,000 comfortably in one process. At agent scale async is the architecture, not an optimization. The exception is CPU-bound post-processing, which still wants threads or processes, so keep the I O layer and the CPU layer separate.',
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
    takeaways: [
      'A resume is not a retry. "Resumed from step 37" is its own state, and rendering it as a retry misreports both the run and the charge.',
      'Waiting on human input is a first-class run state. The agent sleeps and the worker is released, so the queue view needs a waiting-on-you row, not a stalled spinner.',
      'Async is the architecture for I O bound model calls. Threads at 10,000 concurrent calls is 10GB of stacks before any work happens.',
      'Start with FastAPI plus Postgres and upgrade on a measured failure. Under about 100 concurrent runs, ceremony buys nothing.',
    ],
    terms: [
      { term: 'Durable execution', meaning: 'The engine persists state after each step so crash recovery is deterministic resume, not restart.' },
      { term: 'Super-step', meaning: 'The unit of work between checkpoints, the transactional boundary in LangGraph terms.' },
      { term: 'Lease', meaning: 'A worker\'s temporary claim on a run; expiry lets another worker take over the thread.' },
      { term: 'Outbox pattern', meaning: 'Write side-effect intent to a table, then have a separate executor perform and mark it done.' },
      { term: 'Rainbow deploy', meaning: 'Multiple runtime versions running concurrently so long-lived runs survive a deploy.' },
      { term: 'Async fiber', meaning: 'User-mode cooperative concurrency, far cheaper than a thread for I O bound work.' },
    ],
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
      'Cemri et al. read 1642 execution traces across 7 open-source multi-agent systems and found 41 to 86.7 percent failure rates sorting into three root categories: specification problems at 41.77 percent, coordination failures at 36.94 percent, verification gaps at 21.30 percent.',
    readTime: '~8 min read',
    diagram: '/lessons/p16-23.svg',
    diagramCaption:
      'A retry storm: a 10 percent payment failure amplifying through order and inventory retries into 10x load, and the circuit breaker that caps it.',
    whyItMatters:
      'This taxonomy is a status-state inventory, and the strongest design angle in the phase. Three categories means three different things a run can be failing at, and none of them is a red toast. A specification problem is a pre-flight blocker: two agents both think they are the reviewer, so surface the role conflict before dispatch. A coordination failure is a live desync banner naming which two agents disagree on state. A verification gap is the dangerous one, because the run looks successful, so the surface is a not-yet-verified state visually distinct from done, plus slow-failure proxies (agreement rate, retry rate, output-length drift) rendered as trends.',
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
        heading: 'Groupthink, retry storms, and the audit discipline',
        body: 'The Groupthink family (arXiv:2508.05687) adds five homogeneity failures: monoculture collapse, where a shared base model means shared hallucinations; conformity bias, where agents adjust toward the loudest peer; deficient theory of mind; mixed-motive dynamics drifting to a compromise middle that satisfies nobody; and cascading reliability failures.\n\nThe canonical cascade is the retry storm. Payment fails 10 percent of requests, the order agent retries naively, each retry is a fresh inventory check, inventory sees 2x load, inventory starts timing out, every order retries the inventory check, inventory sees 10x load, the cluster goes down. The fix is borrowed unmodified from distributed systems: circuit breakers on every outbound call, opening at a 5 to 10 percent error rate and short-circuiting with cached or default results, plus capped retry budgets per request.\n\nSTRATUS (NeurIPS 2025) reports 1.5x mitigation-success improvement from three specialized roles: a detection agent watching symptom patterns, a diagnosis agent inferring root cause from the taxonomy, and a validation agent confirming symptoms cleared. The discipline around it is a quarterly audit: sample about 1000 traces, categorize failures against MAST and Groupthink, compute the per-category rate, rank mitigations by failures eliminated, pick two or three, re-audit next quarter.',
      },
    ],
    takeaways: [
      'Three categories, three surfaces. Specification is a pre-flight blocker, coordination is a live desync banner, verification is a not-yet-verified state distinct from done.',
      'Verification gaps are 21.30 percent by count and the most expensive per failure, because the run looks successful and exception logs never fire.',
      'Instrument slow-failure proxies as trends: agreement rate, retry rate, output-length distribution. Drift is what you catch before it becomes a visible error.',
      'Circuit breakers on every outbound call, opening at 5 to 10 percent error rate. The retry storm is the one failure you fix with borrowed distributed-systems parts.',
    ],
    terms: [
      { term: 'MAST', meaning: 'Cemri et al. 2025: 3 root failure categories and 14 sub-types from 1642 multi-agent traces.' },
      { term: 'Specification problem', meaning: 'Role or task under-defined, so agents do not know their boundary. 41.77 percent of failures.' },
      { term: 'Coordination failure', meaning: 'Communication or state-sync breakdown between agents. 36.94 percent of failures.' },
      { term: 'Verification gap', meaning: 'Output accepted with no independent check. 21.30 percent by count, worst per failure.' },
      { term: 'Retry storm', meaning: 'One failure triggering retries that amplify load downstream until a dependency collapses.' },
      { term: 'Memory poisoning', meaning: 'A hallucination entering shared memory and being read as fact by every downstream agent.' },
    ],
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
      'Frontier models score around 23 percent on SWE-bench Pro against 70 percent plus on Verified, and the gap is the contamination signal. COMMA finds frontier models struggling to beat random on multimodal coordination. MedAgentBoard finds multi-agent often does not beat one model.',
    readTime: '~8 min read',
    diagram: '/lessons/p16-24.svg',
    diagramCaption:
      'The same models on SWE-bench Verified and Pro, with the gap between the two bars standing in for benchmark contamination.',
    whyItMatters:
      'Every benchmark number in this lesson is a product constraint you will translate into interface. A 23 percent success rate means the primary flow is failure-handling, not the happy path. MedAgentBoard finding multi-agent often does not beat a single model is a direct argument against shipping an orchestration layer you cannot measure, since each layer you add is latency the user waits through. And the missing axis is the one you need most: nothing here measures cost-normalized performance, so a 90 percent solution at 20x cost arrives at your door as a pricing decision wearing a capability claim.',
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
        heading: 'The six-question checklist, and the four axes nobody measures',
        body: 'When someone claims a multi-agent result: which benchmark and which split, because Verified versus Pro changes everything. Contamination check, meaning was the benchmark released after the training cutoff. Baseline comparison against a single model, against random, and against prior multi-agent work, not against an untuned version of the same system. Statistical significance, with N trials and an interval, since frontier models are high-variance and single runs mislead. Task diversity, one task or many. And cost disclosure, tokens per task and wall-clock.\n\nWhat none of them measure well: long-horizon coordination, since all current benchmarks run short. Adversarial resilience, meaning what happens when one agent is compromised. Drift under deployment, since benchmarks are static and production distributions shift. And cost-normalized performance, since most report raw accuracy rather than accuracy per dollar. Which is why building an internal benchmark on the axis you actually care about is usually the right move, rebuilt quarterly, always including a random baseline.',
      },
    ],
    takeaways: [
      'Ask which split before you read the number. Roughly 23 percent on Pro against 70 percent plus on Verified is the same models, and the gap is contamination.',
      'A 23 percent success rate makes failure handling the primary flow. Design the recovery path first and the happy path second.',
      'MedAgentBoard found multi-agent often does not beat a single model. Every orchestration layer is latency the user waits through, so measure the layer before shipping it.',
      'No benchmark reports accuracy per dollar, so a 90 percent solution at 20x cost will reach you as a capability claim when it is a pricing decision.',
    ],
    terms: [
      { term: 'MARBLE', meaning: 'MultiAgentBench, ACL 2025: star, chain, tree, and graph topologies scored on milestone KPIs.' },
      { term: 'COMMA', meaning: 'Multimodal asymmetric-information coordination, where frontier models struggle to beat random.' },
      { term: 'MedAgentBoard', meaning: 'Four medical task categories where multi-agent often fails to dominate a single model.' },
      { term: 'SWE-bench Pro', meaning: '1865 problems over 41 repos, built to resist contamination. Roughly 23 percent versus 70 percent plus on Verified.' },
      { term: 'Milestone achievement', meaning: 'Partial credit for progress toward a task rather than only final success.' },
      { term: 'Contamination', meaning: 'A benchmark drifting into training corpora after release, inflating reported scores.' },
    ],
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
