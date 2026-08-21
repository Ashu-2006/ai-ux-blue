import type { Lesson } from '@/lib/lessons';

// Phase 16 · Part 3 · Debate, negotiation, and simulation (16.07, 16.15-16.18, 16.21)
export const phase16Part3: Lesson[] = [
  {
    id: 'p16-07-society-of-mind',
    phase: 'Phase 16 · Multi-Agent and Swarms',
    part: 'Part 3 · Debate, negotiation, and simulation',
    index: '16.07',
    title: 'Society of Mind: agents and rounds are two separate knobs',
    oneLiner:
      'Du et al. turned Minsky\'s 1986 premise into an algorithm: N agents answer, read each other, revise for R rounds, then majority-vote. The ablation is the real finding. More agents helps and plateaus, more rounds alone barely helps, and both together produce the jump.',
    readTime: '~8 min read',
    diagram: '/lessons/p16-07.svg',
    diagramCaption:
      'Three agents over three rounds: independent answers, then each reading the others and revising, converging on a majority.',
    whyItMatters:
      'Debate turns one response into an N times R matrix, and that matrix is your interface. A 5-agent, 3-round debate is 25 calls on a growing context and can cost 10 times a single chain-of-thought call, so the surface is not a spinner: it is a round counter, a per-agent state, and a diff of what changed since the last round. The output schema changes too. You render a converged answer plus the agreement fraction, and consensus is only fraction-on-majority, never truth, so the component needs a confidence read and a minority disclosure rather than a bare green answer.',
    sections: [
      {
        heading: 'The problem: self-consistency saturates',
        body: 'Sample one model many times and take the majority answer. That is self-consistency, the cheapest reasoning upgrade you can bolt on, and it works right up until it stops. Double your samples and the curve flattens.\n\nThe reason is structural, not budgetary. Every sample comes from the same weights, so the errors correlate by construction. If the model has a systematic bias, all N samples carry it, and averaging correlated errors gets you a confidently wrong answer faster rather than a right one.\n\nDebate breaks the correlation. N agents read each other\'s reasoning and revise, so the samples stop being independent draws from one distribution.',
      },
      {
        heading: 'The algorithm, in three steps',
        body: 'From arXiv:2305.14325 (ICML 2024). Step one: each of N agents produces an initial answer to the question. Step two: for each round r from 2 to R, every agent is shown the other agents\' round r-1 answers and asked for its updated answer. Step three: after R rounds, majority-vote the finals.\n\nThat is the whole method. No judge, no scoring model, no learned aggregator. The paper tests it on MMLU, GSM8K, MATH, biographies, and factuality benchmarks, and debate consistently beats both chain-of-thought and self-reflection.',
      },
      {
        heading: 'The ablation is the lesson: two independent knobs',
        body: 'Du et al. separated the two variables and the result is the part worth memorising.\n\nAgent count alone, meaning one round and a majority vote over N, beats a single agent on most tasks and then plateaus. Round count alone, meaning one agent re-reading its own prior reasoning, barely helps at all: that is reflection\'s known weakness, since the same weights are judging the same output.\n\nBoth together produce the jumps. The mechanism is exposure to disagreement. When an agent sees a different conclusion with a reasoning chain attached, it has to either justify or update, and either way round r+1 has richer context than round r.',
      },
      {
        heading: 'Heterogeneous debate, and the weak-model tax',
        body: 'A-HMAD and its relatives use different base models for different agents. Llama plus Claude plus GPT debating decorrelates errors further, because one model family\'s blind spots are not shared by the others. Monoculture collapse is the failure it avoids.\n\nThe cost is real: a weak model in the pool can drag consensus toward its wrong answer, which is what "Should we be going MAD?" (arXiv:2311.17371) documents. Diversity is only an asset when every participant is roughly competent.\n\nZhuge et al. pushed the scale question with NLSOM (arXiv:2305.17066), a 129-member society where specialization and self-organization emerged with size.',
      },
      {
        heading: 'The three ways it collapses',
        body: 'Sycophancy cascade: every agent defers to whichever one sounds most confident, and the debate becomes an expensive way to agree. The mitigation is an adversarial slot, one agent prompted to argue the counter-position regardless.\n\nTopic drift: over many rounds the debate wanders off the original question. Re-inject the question every round.\n\nCompute blowup: N agents times R rounds, each with a context that grows as it accumulates peers\' answers. Five agents at five rounds is 25 calls at inflating context, and per-question cost can exceed 10 times a single CoT call. The shipping defaults are cap rounds at 3, cap agents at 5, and log every round, because a debate system that hides intermediate rounds cannot be debugged or audited.',
      },
    ],
    takeaways: [
      'Agents and rounds contribute independently. Adding rounds to a single agent is reflection and it barely moves; you need both to get the jump.',
      'Cap at 3 rounds and 5 agents. Past that you are buying context bloat, and per-question cost can already reach 10 times a single CoT call.',
      'Consensus is fraction-on-majority, not truth. Render the agreement fraction and the minority, or you are shipping false confidence.',
      'Put an adversarial slot in the pool. Without one prompted dissenter, sycophancy cascade collapses the debate to the loudest agent.',
    ],
    terms: [
      { term: 'Society of Mind', meaning: 'Minsky\'s framing of intelligence as interacting specialists, now operationalized as LLM debate.' },
      { term: 'Multi-agent debate', meaning: 'N agents propose, read and critique each other over R rounds, then majority-vote.' },
      { term: 'Round', meaning: 'One pass where every agent reads the others\' latest answers and updates once.' },
      { term: 'Correlated error', meaning: 'Shared bias across samples from the same model, the reason self-consistency saturates.' },
      { term: 'Heterogeneous debate', meaning: 'Using different base model families in the pool to decorrelate errors.' },
      { term: 'Sycophancy cascade', meaning: 'Agents deferring to the most confident peer regardless of whether it is right.' },
    ],
    demoCaption:
      'Move the agent count and watch the two knobs separate. One agent over many rounds is reflection and flat. Many agents in one round plateaus. The gain lives where both are above one, and so does the 25-call bill.',
    demo: {
      archetype: 'slider-map',
      subject: 'Debate configuration · agents times rounds',
      sliderLabel: 'Agents in the pool (rounds held at 3)',
      outputLabel: 'Accuracy gain, call count, and the surface it needs',
      badCaption:
        'Reading debate as "more thinking" leads to one agent looping for five rounds, which is reflection with extra steps and almost no gain, or to five agents voting once, which plateaus. Both readings spend the budget on the knob that is not moving.',
      goodCaption:
        'Both knobs at once is where the jump lives, and the cost is the product not the sum: 5 agents times 3 rounds is 15 calls on a context that grows each round. That product is what your round counter, per-agent state, and cost meter have to represent.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'multi-agent debate has two knobs and everyone only turns one.',
        body:
          'multi-agent debate has two knobs and everyone only turns one.\n\nDu et al. ablated them separately.\n\nagents alone: beats a single agent, then plateaus.\nrounds alone: one agent rereading itself. barely helps. that is just reflection.\nboth: the actual jump.\n\nthe mechanism is exposure to disagreement. a peer with a different conclusion and a visible reasoning chain forces you to justify or update.',
      },
      {
        kind: 'X · design angle',
        hook: 'debate does not return a string, it returns a matrix.',
        body:
          'debate does not return a string, it returns a matrix.\n\n5 agents x 3 rounds = 15 calls on a context that grows every round. nothing to stream until the rounds resolve.\n\nso the surface is not a spinner. it is a round counter, a per-agent state, and a diff of what changed since last round.\n\nand consensus is fraction-on-majority, not truth. render the agreement number and the minority or you are shipping confidence you did not measure.',
      },
      {
        kind: 'X · one-liner',
        hook: '5 agents, 5 rounds is 25 calls at growing context. that is 10x a single CoT call.',
        body:
          '5 agents, 5 rounds is 25 calls at growing context. that is 10x a single CoT call.\n\nthe shipping defaults are cap rounds at 3, cap agents at 5, mix base models, and keep one agent prompted to disagree.\n\nwithout the dissenter you paid five times for the loudest opinion.',
      },
    ],
    source: {
      label: 'Full lesson: 07 07-society-of-mind-debate',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/16-multi-agent-and-swarms/07-society-of-mind-debate',
    },
  },
  {
    id: 'p16-15-voting-topology',
    phase: 'Phase 16 · Multi-Agent and Swarms',
    part: 'Part 3 · Debate, negotiation, and simulation',
    index: '16.15',
    title: 'Voting topology: who talks to whom decides whether debate helps',
    oneLiner:
      'Star, chain, tree, graph. MultiAgentBench measured all four and found graph best for research, chain for pipelines, star for fast factual answers, and a coordination tax past roughly 4 agents. Heterogeneity beats numerosity: three different models usually beat five copies of one.',
    readTime: '~8 min read',
    diagram: '/lessons/p16-15.svg',
    diagramCaption:
      'The four topologies side by side, with the edge count that drives token cost growing from chain to fully connected graph.',
    whyItMatters:
      'Topology is the thing you actually pick in a config, and it sets both the latency profile and what you can show. A chain streams progressively, since each agent finishes before the next starts, so you can render a stepper. A graph resolves all at once and needs a bounded-round progress state with nothing partial to show. Star gives you one hub answer plus N worker rows. The coordination tax past 4 agents is a budget you should surface: cost and wall-clock grow faster than quality, so the config UI needs an agent count with a warning threshold, not an open number field.',
    sections: [
      {
        heading: 'The problem: bolting on five agents often regresses',
        body: 'Teams add "run 5 agents and vote" to a task and get worse results than a single agent. The regressions are not random. They track four structural choices: who talks to whom (topology), how many rounds, whether the agents are heterogeneous, and whether an adversarial voice is present.\n\nThe baseline to beat is Wang et al. 2022 self-consistency: one model, N samples at temperature above zero, majority-vote on the reasoning paths. On GSM8K that produced substantial gains at N=40. It is cheap, it is one model, and its errors are correlated by construction. Multi-agent voting only earns its cost if it breaks that correlation.',
      },
      {
        heading: 'The four topologies and what each one is good at',
        body: 'Star: one hub, everyone else talks only to the hub. This is supervisor-worker with no back channel. Chain: linear, each agent sees the previous one\'s output. Pipeline-shaped. Tree: hierarchical, depth-2 or deeper aggregation. Graph: any-to-any, up to a fully connected clique.\n\nMultiAgentBench (MARBLE, ACL 2025, arXiv:2503.01935) benchmarked all four across research, coding, and planning tasks with milestone KPIs. Graph wins on research, because information flows any-to-any and agents can critique each other. Star wins on fast factual answers, because the hub filters and consolidates. Chain wins on stepwise pipelines where each stage refines the last.',
      },
      {
        heading: 'The coordination tax, and where the ceiling comes from',
        body: 'MARBLE\'s second measured result: past roughly 4 agents on graph topology, wall-clock and token cost grow faster than quality. That is the coordination tax.\n\nThe 4-agent ceiling is empirical, not fundamental. It reflects 2026 context capacity. Each agent\'s window fills with peers\' outputs, and once everyone can already see everyone, the marginal value of agent N+1 drops while its token cost does not. Cognitive planning adds about 3 percent milestone achievement across topologies, which is worth having and is not a substitute for picking the right shape.',
      },
      {
        heading: 'Heterogeneity beats numerosity',
        body: 'The consistent 2024 to 2026 practical finding: swapping one of your N agents for a different base model gives a bigger accuracy bump than incrementing N by one. Each new independent error source is worth more than another correlated sample. In the limit, three different models beat five copies of one on most tasks with clean ground truth.\n\nA-HMAD is the name papers use for adversarial heterogeneous debate: different models plus adversarial structure. "Should we be going MAD?" (arXiv:2311.17371) sharpens the warning: debate variants that are structurally just independent-sample-plus-aggregate often lose to plain self-consistency at equal budget. Debate earns its cost only when the agents are genuinely different and someone argues against.',
      },
      {
        heading: 'Two emergent behaviors, one of them a liability',
        body: 'AgentVerse (ICLR 2024) documented two behaviors that emerge from debate without anyone designing them.\n\nVolunteer: an agent offers unprompted to take the next step, which usefully routes work to whichever agent is most capable on that subtask. Conformity: an agent adjusts its stance to match a critic, even when the critic is wrong. Conformity is the debate-equivalent of sycophancy, and it is why debate-until-agreement rewards bullies.\n\nThe mitigations are structural: bound the rounds at 2 to 3, add a separate judge that scores but does not vote, and always log the minority cluster. A minority that is persistently right is a diversity signal you are otherwise throwing away.',
      },
    ],
    takeaways: [
      'Topology is a product decision. Chain streams and gives you a stepper. Graph resolves all at once and gives you a bounded-round progress state.',
      'The coordination tax bites past roughly 4 agents on graph. Put a warning threshold on the agent-count control instead of an open field.',
      'Swap a model before you add an agent. Three different models beat five copies of one on tasks with clean ground truth.',
      'Log the minority cluster. A persistently correct minority is measurable diversity value, and hiding it makes consensus look better than it is.',
    ],
    terms: [
      { term: 'Self-consistency', meaning: 'One model sampled N times above temperature zero, majority-voted on reasoning paths.' },
      { term: 'Topology', meaning: 'Who reads whom: star, chain, tree, or graph. It determines information flow and edge count.' },
      { term: 'Coordination tax', meaning: 'Cost and latency growing faster than quality, appearing past roughly 4 agents on graph.' },
      { term: 'A-HMAD', meaning: 'Adversarial heterogeneous multi-agent debate: different base models plus a dissenting role.' },
      { term: 'Conformity behavior', meaning: 'An agent shifting its stance to match a critic, correct or not. The AgentVerse liability.' },
      { term: 'Jury', meaning: 'A small role-differentiated panel (examiner, context supplier, scorer) between plain vote and full debate.' },
    ],
    demoCaption:
      'Switch between chain and graph on the same 5-agent task. The agent count is identical; the edge count, the latency shape, and the progress component you can build are not. Chain hands you a stepper, graph hands you a bounded-round wait.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Coordination topology · N=5',
      badLabel: 'Fully connected graph',
      goodLabel: 'Chain',
      badLines: [
        'every agent reads every peer each round',
        '20 directed edges per round',
        'nothing resolves until the round closes',
        'coordination tax already active past N=4',
      ],
      goodLines: [
        'each agent reads only the previous output',
        '4 directed edges total',
        'each stage completes before the next starts',
        'progressive rendering: a real stepper',
      ],
      badCaption:
        'Fully connected feels safest and is the expensive default: edges grow with N squared, every agent\'s context fills with peers, and MARBLE measured cost outrunning quality past about 4 agents. It also gives you nothing partial to render.',
      goodCaption:
        'Chain is the right shape for stepwise refinement and it changes the UI: 4 edges, staged completion, and a stepper you can stream. Reserve graph for research tasks where any-to-any critique is the actual mechanism, then bound the rounds and log the minority.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'star, chain, tree, graph. MultiAgentBench measured which wins where.',
        body:
          'star, chain, tree, graph. MultiAgentBench measured which wins where.\n\ngraph: research tasks. any-to-any critique is the mechanism.\nchain: stepwise pipelines. staged refinement.\nstar: fast factual. the hub filters.\n\nand a coordination tax past ~4 agents on graph. cost and wall-clock grow faster than quality, because everyone can already see everyone.\n\ntopology is not a detail, it is the result.',
      },
      {
        kind: 'X · design angle',
        hook: 'chain vs graph is a rendering decision, not just a cost one.',
        body:
          'chain vs graph is a rendering decision, not just a cost one.\n\nchain: each agent finishes before the next starts. you can stream a stepper. progress is real.\n\ngraph: nothing resolves until the round closes. no partial state exists. you get a bounded-round wait and a per-agent status grid.\n\nsame 5 agents. completely different component.',
      },
      {
        kind: 'X · one-liner',
        hook: 'swap a model before you add an agent.',
        body:
          'swap a model before you add an agent.\n\nthe 2024-2026 pattern: changing one of your N agents to a different base model beats incrementing N by 1.\n\neach new independent error source is worth more than another correlated sample. three different models beat five copies of one.\n\nheterogeneity beats numerosity.',
      },
    ],
    source: {
      label: 'Full lesson: 15 15-voting-debate-topology',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/16-multi-agent-and-swarms/15-voting-debate-topology',
    },
  },
  {
    id: 'p16-16-negotiation',
    phase: 'Phase 16 · Multi-Agent and Swarms',
    part: 'Part 3 · Debate, negotiation, and simulation',
    index: '16.16',
    title: 'Negotiation: let the model narrate, never let it compute the offer',
    oneLiner:
      'LLMs close tightly parameterized bargains at about 27 percent. Split the job in two, a deterministic offer generator plus an LLM narrator, and the deal rate goes to about 89 percent. Scale does not fix it; decomposition does.',
    readTime: '~8 min read',
    diagram: '/lessons/p16-16.svg',
    diagramCaption:
      'The OG-Narrator split: negotiation state feeds a deterministic offer generator, whose price the LLM wraps in language.',
    whyItMatters:
      'This is a schema boundary you will implement literally. The message a negotiating agent sends is two fields, not one: a numeric offer produced by code and a narration string produced by the model, and only the number is authoritative. That split determines what you render (the price as a typed value with a history chart, the framing as prose), what you validate (reject out-of-ZOPA offers at the protocol boundary), and the hardest part: private scratchpad context must never reach the counterpart\'s window. If your trace viewer shows reasoning in the same pane as sent messages, you have already leaked the reservation price.',
    sections: [
      {
        heading: 'The problem: a 27 percent deal rate that scale does not fix',
        body: 'Two agents need to agree on a price. Given pure language prompts, 2024 to 2026 models close tightly parameterized bargains at roughly 27 percent (arXiv:2402.15813). GPT-4 is not structurally better at bargaining than GPT-3.5. It is better at the language of bargaining.\n\nThe documented errors are specific. Models break the rules, offering at nonsensical prices or ignoring the counterpart\'s ZOPA. They anchor badly, accepting bad first offers and countering at symbolic rather than strategic amounts. Bigger models produce more plausible language with about the same strategic error.',
      },
      {
        heading: 'The move: OG-Narrator, and why decomposition wins',
        body: 'The root issue is that LLMs conflate two jobs: deciding the offer and narrating it. OG-Narrator separates them. A deterministic offer generator computes the numeric move from negotiation state, using a classical strategy such as Rubinstein bargaining, a Zeuthen risk-minimizing concession, or a simple tit-for-tat on price. The LLM only writes the accompaniment.\n\nDeal rate jumps from about 27 percent to about 89 percent. Three reasons: prices stay inside the bargaining zone, anchors are strategic rather than emotional, and the model does the one thing it is good at.',
      },
      {
        heading: 'Contract Net: the 1980 mechanism you already reinvented',
        body: 'Smith\'s Contract Net Protocol, later codified by FIPA as fipa-contract-net, is the canonical task market. A manager broadcasts a call for proposals. Bidders reply with propose messages carrying their offers. The manager sends accept-proposal to the winner and reject-proposal to the losers. Optional: refuse, where a bidder declines to bid at all.\n\nThe modern reuse: a manager agent decomposes a task, broadcasts the cfp to workers, each worker returns an offer of price, ETA, and confidence, and the manager awards. This scales past 100 workers because coordination is broadcast-and-respond rather than synchronous chat.',
      },
      {
        heading: 'Chain-of-thought concealment: the private channel is not optional',
        body: 'The Large-Scale Autonomous Negotiation Competition (arXiv:2503.06416) ran roughly 180,000 negotiations. Winners concealed their reasoning from counterparts.\n\nThe mechanism is blunt. If an agent writes "I will only go to 75, my reservation price is 70" into a scratchpad the opponent can read, the opponent reads it. Winners computed strategy privately and put only the offer plus minimum narration on the public channel. This is a 2026 echo of Aumann 1976: revealing your private valuation costs payoff. Models do not intuit this and will happily type their reservation into a trace that becomes visible.\n\nEngineering consequence: separate private-scratchpad context from public-message context, structurally, in the type system.',
      },
      {
        heading: 'The benchmark texture: personas, exploitation, and model styles',
        body: 'NegotiationArena (arXiv:2402.05863) is the canonical benchmark. Models improve payoffs about 20 percent by adopting personas such as "I am desperate to sell this by Friday," so persona manipulation is a real tactic. Fair and cooperative agents get exploited by adversarial ones, and defending requires explicit counter-posturing. Symmetric pair-ups still converge to inequitable outcomes on about 40 percent of scenarios. The read is not "models are bad negotiators," it is "models negotiate too much like humans, including the exploitable parts."\n\nBhattacharya et al. 2025, scored on Harvard Negotiation Project metrics, found Llama-3 most effective at striking bargains, Claude-3 most aggressive with high anchors and late concessions, and GPT-4 fairest with the smallest payoff variance. The snapshot ages; the point that base models have persistent negotiation styles does not.',
      },
    ],
    takeaways: [
      'The message is two fields. A number computed deterministically and a narration written by the model, with only the number authoritative.',
      'Deal rate moves from about 27 to about 89 percent through decomposition alone. No larger model buys that.',
      'Private scratchpad and public message must be different types, not the same string with a convention. Leaked reasoning is a leaked reservation price.',
      'Validate incoming offers at the protocol boundary. An out-of-ZOPA offer cannot close, so reject it before it enters the negotiation state.',
    ],
    terms: [
      { term: 'Contract Net', meaning: 'Smith 1980, FIPA 1996: cfp, propose, accept or reject. The canonical task-market protocol.' },
      { term: 'ZOPA', meaning: 'Zone of possible agreement: the overlap between the buyer\'s maximum and the seller\'s minimum.' },
      { term: 'BATNA', meaning: 'Best alternative to a negotiated agreement, the fallback that sets your reservation price.' },
      { term: 'OG-Narrator', meaning: 'The decomposition where code computes the offer and the model only writes the framing.' },
      { term: 'CoT concealment', meaning: 'Keeping strategy in a private scratchpad so the counterpart reads only the offer.' },
      { term: 'Persona manipulation', meaning: 'Framing urgency or desperation in narration, worth roughly 20 percent payoff in NegotiationArena.' },
    ],
    demoCaption:
      'Toggle the two architectures on the same bargain. The all-model bargainer writes both the price and the pitch and lands outside the ZOPA. The split version computes the price and lets the model write only the pitch, and closes.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Bargaining agent · one message',
      badLabel: 'Model decides the offer',
      goodLabel: 'Code decides, model narrates',
      badLines: [
        'prompt: "make a reasonable counter-offer"',
        'price chosen inside the prose',
        'anchors symbolically, drifts out of ZOPA',
        'reservation price typed into visible reasoning',
      ],
      goodLines: [
        'Zeuthen concession computes the number',
        'offer: typed numeric field',
        'narration: prose field, non-authoritative',
        'scratchpad is a separate private context',
      ],
      badCaption:
        'One model doing both jobs is the intuitive design and it closes tightly parameterized bargains around 27 percent of the time. The price is invented mid-sentence, so it anchors symbolically and wanders outside the zone where any deal exists.',
      goodCaption:
        'Splitting them takes the deal rate to roughly 89 percent, because prices stay inside the ZOPA and anchors come from a strategy rather than a mood. The typed offer field is also what you render, chart, and validate at the protocol boundary.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'let the model narrate. do not let the model compute the offer.',
        body:
          'let the model narrate. do not let the model compute the offer.\n\nall-LLM bargaining closes tight bargains at ~27%.\n\nsplit it: a deterministic offer generator computes the price from negotiation state, the model writes the framing around it.\n\n~89%.\n\nGPT-4 is not better at bargaining than GPT-3.5. it is better at the language of bargaining. decomposition is the fix, scale is not.',
      },
      {
        kind: 'X · design angle',
        hook: 'if your trace viewer shows reasoning next to sent messages, you leaked the reservation price.',
        body:
          'if your trace viewer shows reasoning next to sent messages, you leaked the reservation price.\n\n180k negotiations in the 2026 competition. winners concealed their chain of thought.\n\nmodels will happily type "my reservation price is 70" into a scratchpad the counterpart can read.\n\nprivate scratchpad and public message need to be different types, not one string with a convention.',
      },
      {
        kind: 'X · one-liner',
        hook: 'a negotiating agent sends two fields, and only one of them is authoritative.',
        body:
          'a negotiating agent sends two fields, and only one of them is authoritative.\n\noffer: number, computed by code, typed, validated against the ZOPA at the boundary.\nnarration: prose, written by the model, decorative.\n\nrender them differently because they are not the same kind of thing.',
      },
    ],
    source: {
      label: 'Full lesson: 16 16-negotiation-bargaining',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/16-multi-agent-and-swarms/16-negotiation-bargaining',
    },
  },
  {
    id: 'p16-17-generative-agents',
    phase: 'Phase 16 · Multi-Agent and Swarms',
    part: 'Part 3 · Debate, negotiation, and simulation',
    index: '16.17',
    title: 'Generative agents: memory stream, reflection, plan',
    oneLiner:
      'Park et al. populated Smallville with 25 agents on three components: an append-only memory stream, periodic reflection that synthesizes beliefs, and a revisable plan tree. One seeded goal produced a party that 24 unseeded agents organized themselves.',
    readTime: '~8 min read',
    diagram: '/lessons/p16-17.svg',
    diagramCaption:
      'Observations enter the append-only stream, reflection synthesizes higher-order beliefs back into it, and plans read from ranked retrieval.',
    whyItMatters:
      'The retrieval score is the interface. Memory ranks by recency times decay, plus self-rated importance, plus embedding relevance, and every action is driven by a top-k slice of that ranking. Which means the debuggable surface is a per-action panel showing exactly which memories won, with their three sub-scores visible, because "why did the agent do that" has a literal answer you can render. The append-only rule is a hard constraint on your data layer: corrections are new rows, never edits, so any UI that lets a user fix a memory writes a superseding entry and shows both.',
    sections: [
      {
        heading: 'The problem: scripted teams cannot produce emergence',
        body: 'Most multi-agent systems are tight scripts. Planner plans, coder codes, reviewer reviews. That works for well-defined tasks and it never produces the unscripted behavior that arises when agents have memory, priorities, and an open world.\n\nResearch simulation, market and policy modelling, and increasingly game AI need the second kind. Until Park et al. 2023 (UIST, arXiv:2304.03442), the best agent simulations were shallow script-followers. After it, the three-component shape is the default: if you build an agent simulation in 2026, you are either using it or explicitly justifying why not.',
      },
      {
        heading: 'The memory stream and the ranked retrieval',
        body: 'An append-only log of observations, actions, reflections, and plans. Each entry carries a timestamp, a type, a natural-language description, and three derived scores: recency (exponential decay by age), importance (self-rated 1 to 10 by the agent at write time, then cached), and relevance (cosine similarity to the current query).\n\nRetrieval combines all three: score equals a recency weight times the decay term, plus an importance weight times the importance, plus a relevance weight times the cosine similarity. Top-k enters the prompt. Critically, retrieval is ranked and not filtered. Hard filters lose context that a weighted score would have surfaced.',
      },
      {
        heading: 'Reflection and plan: the other two components',
        body: 'Reflection runs periodically, triggered when the summed importance of unprocessed memories crosses a threshold (roughly 150 in the reference implementation). The agent generates higher-order syntheses from recent memories, and those syntheses go back into the stream as retrievable entries. This is how the architecture gets long-term beliefs rather than a log.\n\nPlan is top-down decomposition: a day-level plan in broad strokes, then hour-level, then action-level. Plans are revisable, and the rule that matters is partial regeneration. When an observation contradicts a plan, regenerate only the affected segment, not the whole tree.',
      },
      {
        heading: 'The Valentine\'s Day emergence, step by step',
        body: 'One agent, Isabella Rodriguez, is seeded with "wants to throw a Valentine\'s Day party at Hobbs Cafe on Feb 14 at 5pm." The other 24 agents get nothing.\n\nIsabella\'s plan includes inviting people. Each invitation becomes an observation in a neighbor\'s memory stream. That neighbor\'s reflection generates the belief "Isabella is throwing a party." The neighbor\'s plan incorporates attending. Neighbors tell neighbors. At 5pm on Feb 14, several agents converge on Hobbs Cafe.\n\nThat is emergence in the technical sense: a system-level outcome from local bilateral interactions with no orchestrator. Park et al.\'s ablations show all three components are load-bearing. Drop observation and agents act on stale beliefs. Drop reflection and interactions stay shallow. Drop plan and behavior becomes reactive noise.',
      },
      {
        heading: 'The three documented failures, all of them yours to inherit',
        body: 'Spatial norm errors: agents walk into closed stores, try to share a single-person bathroom, eat in rooms not meant for eating. The model does not infer social-physical norms from the environment, so you detect these explicitly or they happen.\n\nMemory overflow: deep runs grow retrieval cost. The remedy is periodic compaction, summarize-and-prune, plus decay on low-importance entries. Retention policy is a design decision, not a detail.\n\nReflection hallucination: reflections invent relationships not present in the stream. The mitigation is provenance, include source memory ids in the reflection prompt and verify at retrieval. Budget note: each agent\'s retrieve plus reflect plus plan is O(k) model calls per tick, and N agents times T ticks times calls-per-tick will dwarf a naive budget.',
      },
    ],
    takeaways: [
      'Every action traces to a top-k retrieval. Show the winning memories with their recency, importance, and relevance sub-scores, and "why did it do that" stops being a mystery.',
      'Memory is append-only. A correction is a new superseding entry, which means your UI shows both the old belief and the fix.',
      'All three components are load-bearing. The ablations regress believability individually, so a "memory only" version is not a lighter version, it is a broken one.',
      'Cost is N agents times T ticks times O(k) calls per tick. Price the simulation before you scale the population.',
    ],
    terms: [
      { term: 'Memory stream', meaning: 'An append-only log of observations, actions, reflections, and plans with derived scores.' },
      { term: 'Importance', meaning: 'A 1 to 10 self-rating the agent assigns a memory at write time, then cached.' },
      { term: 'Relevance', meaning: 'Embedding cosine similarity between a memory and the current query.' },
      { term: 'Reflection', meaning: 'A higher-order synthesis generated from recent memories and written back as a new memory.' },
      { term: 'Plan tree', meaning: 'Day, hour, and action level decomposition, regenerated only in the segment an observation contradicts.' },
      { term: 'Believability', meaning: 'The human-rater score Park et al. used, highest with all three components present.' },
    ],
    demoCaption:
      'Open the retrieval behind one action. The summary says the agent decided to attend a party. The payload is the three memories that won the ranking, with recency, importance, and relevance broken out, which is the actual explanation.',
    demo: {
      archetype: 'reveal',
      subject: 'One agent action · why it happened',
      opaqueLabel: 'Klaus decided to attend the party at Hobbs Cafe',
      revealedLines: [
        'observation, importance 6, recency 0.91: Isabella invited me to a party',
        'reflection, importance 8, recency 0.74: Isabella is hosting on Feb 14 at 5pm',
        'observation, importance 4, recency 0.55: Hobbs Cafe is open until 8pm',
        'ranked score = w_recency * decay + w_importance * importance + w_relevance * cos_sim',
        'top-k = 3, so entry 4 onward never entered the prompt',
      ],
      badCaption:
        'A decision rendered as a sentence is unfalsifiable. You cannot tell whether the agent reasoned from an invitation, a stale belief, or a hallucinated reflection, so you also cannot tell which of the three failure modes you are looking at.',
      goodCaption:
        'Exposing the top-k with all three sub-scores turns the decision into an audit. You can see the reflection that carried it, check its provenance against the source observations, and notice when a hallucinated reflection outranked the raw record.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'generative agents are three components, and all three are load-bearing.',
        body:
          'generative agents are three components, and all three are load-bearing.\n\nmemory stream: append-only log, each entry scored on recency, self-rated importance, embedding relevance.\nreflection: periodic synthesis written back into the stream as retrievable belief.\nplan: day, hour, action decomposition, revised only where contradicted.\n\nPark et al. ablated each one. every drop regresses believability. there is no lighter version.',
      },
      {
        kind: 'X · design angle',
        hook: '"why did the agent do that" has a literal answer and almost nobody renders it.',
        body:
          '"why did the agent do that" has a literal answer and almost nobody renders it.\n\nevery action is driven by a top-k slice of a ranked memory retrieval. recency x decay + importance + relevance.\n\nso the debug surface is a per-action panel showing exactly which memories won, with the three sub-scores broken out.\n\nthat is also how you catch reflection hallucination: a synthesized belief outranking the observations it supposedly came from.',
      },
      {
        kind: 'X · one-liner',
        hook: '25 agents. one seeded goal. a party that 24 of them organized without an orchestrator.',
        body:
          '25 agents. one seeded goal. a party that 24 of them organized without an orchestrator.\n\nIsabella was told to throw a Valentine\'s party. nobody else was told anything.\n\ninvitation becomes observation becomes reflection becomes plan. neighbors tell neighbors. at 5pm they converge.\n\nemergence in the technical sense: system behavior from local interactions only.',
      },
    ],
    source: {
      label: 'Full lesson: 17 17-generative-agents-simulation',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/16-multi-agent-and-swarms/17-generative-agents-simulation',
    },
  },
  {
    id: 'p16-18-theory-of-mind',
    phase: 'Phase 16 · Multi-Agent and Swarms',
    part: 'Part 3 · Debate, negotiation, and simulation',
    index: '16.18',
    title: 'Theory of mind: coordination is prompt-conditional, not free',
    oneLiner:
      'Riedl measured coordination at population scale and found it only clears baseline under the theory-of-mind prompt condition. Without it, apparent coordination does not survive statistical controls. In a token-collection task, first-order ToM cut duplicate effort from about 35 percent to about 5 percent.',
    readTime: '~8 min read',
    diagram: '/lessons/p16-18.svg',
    diagramCaption:
      'A zeroth-order agent acting on its own observations, beside a first-order agent carrying an explicit per-peer belief model.',
    whyItMatters:
      'The load-bearing state is a per-peer belief map: agent id keyed to the beliefs you attribute to that agent, held outside the model context and injected per turn. That structure is the fix for the documented failure, which is identity-belief binding decay: over a long horizon the model forgets which belief belonged to whom and produces "I thought he thought X" errors that compound. So this is an external store with an explicit schema, not a prompt paragraph. And it gives you three measurable signals to render in a coordination view: complementarity, anticipation, and correction.',
    sections: [
      {
        heading: 'The problem: most "emergent coordination" is prompt dressing',
        body: 'Multi-agent coordination often looks magical. Agents divide labor, anticipate each other, avoid redundancy. Usually that is an artifact of someone having written "work together" into a system prompt. Remove the prompt, remove the coordination.\n\nRiedl (arXiv:2510.05174) made the test strict: N agents, a cooperative objective, controlled prompt conditions. Only under the theory-of-mind prompt condition do the coordination metrics clear baseline. Without it, moderate-capacity models hover near chance. Large models show some coordination unprompted, but the effect is smaller than with explicit prompting. Coordination is prompt-conditional and model-dependent.',
      },
      {
        heading: 'What theory of mind actually means, by order',
        body: 'Developmental psychology grades it. A 3-year-old assumes everyone\'s inner world matches theirs. A 5-year-old understands others hold different beliefs. A 7-year-old reasons about beliefs about beliefs.\n\nFor agents: zeroth-order means no model of others, acting on own observations only. First-order means holding a model of each peer\'s beliefs, "Alice believes X." Second-order means recursive, "Alice believes that Bob believes X."\n\nThe Sally-Anne false-belief test is the classic probe: Sally hides a marble, leaves, Anne moves it, where does Sally look? Current models pass the plain version and fail when the narrative is long, the scene changes several times, or the question is phrased indirectly. That is the practical 2026 state.',
      },
      {
        heading: 'Riedl\'s three metrics, which are your three signals',
        body: 'Identity-linked differentiation: do agents develop stable role distinctions that persist over time rather than shuffling randomly? Goal-directed complementarity: do their actions complement each other, covering different subtasks, rather than duplicating? Higher-order synergy: a statistical measure of whether the group achieves what no subset could.\n\nAll three produce signal above baseline only under the ToM condition. Reframed as things you can log: complementarity as action-disjointness over a multi-turn task, anticipation as agent A acting at T+1 on a correct prediction about B at T+2, and correction as A repairing a misread of B\'s belief by T+2. Those are the substantive version of the coordination narrative, and they are measurable in any logged system.',
      },
      {
        heading: 'The agent shape, and why long horizons break it',
        body: 'A minimal ToM agent carries three pieces of state: its own beliefs, a map from peer id to the beliefs it attributes to that peer, and a short history of others\' actions. On observation it updates its own beliefs directly and updates each peer model from that peer\'s action plus its prior attributed beliefs. On action selection it enumerates candidates, predicts what each peer will do next given their modeled beliefs, and picks the action maximizing the joint outcome.\n\nLi et al. (arXiv:2310.10701) found first- and second-order ToM emerge in cooperative games and degrade with horizon. Context limits cause the agent to forget which belief belonged to whom. Hallucination adds false beliefs to peer models. Both produce compounding attribution errors. The mitigations are structural: an explicit typed ToM state in the prompt, shorter reasoning chains per turn, and an external ToM store injected selectively rather than held in context.',
      },
      {
        heading: 'Where ToM actively hurts',
        body: 'Adversarial settings: an agent with good ToM is easier to manipulate, because a counterpart can model what you model of them and exploit it. This is the same finding as chain-of-thought concealment in negotiation, arriving from the other direction.\n\nHeterogeneous teams: a peer model tuned to one opponent does not generalize to a different base model with a different style.\n\nGround-truth tasks: ToM is about beliefs. When correctness depends on facts, modelling what a peer believes is a distraction from checking the fact. The shipping discipline is a control condition without the coordination prompt, a significance test against it, a complementarity measure rather than just final success, and disclosure when the effect vanishes on smaller models.',
      },
    ],
    takeaways: [
      'The state is a typed per-peer belief map held outside the context window, because identity-belief binding is what decays over a long horizon.',
      'Coordination claims need a control condition. A version without the coordination prompt, measured, or the claim is marketing.',
      'First-order ToM cut duplicate effort from roughly 35 percent to roughly 5 percent on the token task. Duplication rate is a cheap production proxy.',
      'Good ToM is an attack surface in adversarial settings, for the same reason a visible reservation price is.',
    ],
    terms: [
      { term: 'Theory of mind', meaning: 'The capacity to model another agent\'s beliefs, graded by order: 0, 1, 2 and up.' },
      { term: 'First-order ToM', meaning: 'Modelling a peer\'s beliefs about facts: "Alice believes X."' },
      { term: 'Second-order ToM', meaning: 'Modelling recursive beliefs one level deeper: "Alice believes Bob believes X."' },
      { term: 'Sally-Anne test', meaning: 'The 1985 false-belief probe; models pass plain versions and fail long or indirect ones.' },
      { term: 'Goal-directed complementarity', meaning: 'Riedl\'s metric for agents covering disjoint subtasks rather than duplicating.' },
      { term: 'Coordination illusion', meaning: 'Prompt-dressed apparent coordination that does not survive statistical controls.' },
    ],
    demoCaption:
      'Slide the horizon from 10 turns to 30 and watch first-order ToM decay. The duplication advantage is large early and erodes as identity-belief binding degrades in a filling context, which is the argument for an external store.',
    demo: {
      archetype: 'slider-map',
      subject: 'ToM coordination vs task horizon',
      sliderLabel: 'Turns in the cooperative task',
      outputLabel: 'Duplication rate and attribution integrity',
      badCaption:
        'Treating ToM as a prompt phrase produces a result that looks strong at 10 turns and quietly rots. The context fills with peers\' outputs, the agent loses track of which belief belonged to whom, and "I thought he thought X" errors compound without ever throwing an error.',
      goodCaption:
        'First-order ToM took duplication from about 35 percent to about 5 percent at short horizon. Holding it as a typed per-peer map outside the context and injecting only the relevant slice is what keeps that gain past turn 20, and duplication rate is the proxy you monitor.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'coordination in multi-agent systems is prompt-conditional. remove the prompt, remove the coordination.',
        body:
          'coordination in multi-agent systems is prompt-conditional. remove the prompt, remove the coordination.\n\nRiedl ran it at population scale with controls. only the theory-of-mind prompt condition clears baseline on all three metrics: stable role differentiation, disjoint actions, group-exceeds-subset synergy.\n\nwithout it, moderate models sit near chance. large models show a little, less than with prompting.\n\nemergence is not free.',
      },
      {
        kind: 'X · design angle',
        hook: 'theory of mind is a data structure, not a prompt paragraph.',
        body:
          'theory of mind is a data structure, not a prompt paragraph.\n\n{peer_id: [beliefs I attribute to them]}, held outside the model context, injected per turn.\n\nthe reason is the documented failure: over a long horizon the model forgets which belief belonged to whom and produces "I thought he thought X" errors that compound silently.\n\ntyped external store. selective injection. duplication rate as the monitor.',
      },
      {
        kind: 'X · one-liner',
        hook: 'first-order ToM cut duplicate effort from ~35% to ~5%.',
        body:
          'first-order ToM cut duplicate effort from ~35% to ~5%.\n\nthree agents, three boxes, no communication, inferring intent from each other\'s moves.\n\nzeroth order: both reach for the same box a third of the time.\nfirst order: they model each other and split.\n\nduplication rate is the cheapest coordination metric you are not logging.',
      },
    ],
    source: {
      label: 'Full lesson: 18 18-theory-of-mind-coordination',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/16-multi-agent-and-swarms/18-theory-of-mind-coordination',
    },
  },
  {
    id: 'p16-21-agent-economies',
    phase: 'Phase 16 · Multi-Agent and Swarms',
    part: 'Part 3 · Debate, negotiation, and simulation',
    index: '16.21',
    title: 'Agent economies: Shapley credit, second-price auctions, reputation',
    oneLiner:
      'When agents produce value jointly you have to reward them individually. Shapley values are fair by construction and factorially expensive, second-price auctions are truthful under monotone aggregation, and reputation is the cheap layer that actually ships first.',
    readTime: '~8 min read',
    diagram: '/lessons/p16-21.svg',
    diagramCaption:
      'Five agents bidding for one task slot: the highest value wins and pays the second-highest, which is what makes truthful bidding optimal.',
    whyItMatters:
      'Credit attribution is a schema you will render whether or not you use tokens. A joint output scored 0.8 splits into per-agent contributions, so the run detail view needs a contribution column, not just a transcript, and the number has to carry its own provenance: exact Shapley or sampled over K orderings, with the sampling error visible. Reputation is the part with a real product surface: a decayed per-agent score, slashable when a contribution fails verification, which becomes routing policy (send hard tasks to high-rep agents) and therefore needs an explanation affordance when a user asks why this agent got the work.',
    sections: [
      {
        heading: 'The problem: joint value, individual reward',
        body: 'Three agents collaborate. The output scores 0.8. Who contributed what?\n\nThe naive mechanisms are unfair or gameable. Equal split ignores that one agent did the work. Last-contributor-takes-all rewards whoever happened to write the final token. Both invite gaming the moment agents optimize for the metric.\n\nCoalition-based rewarding via Shapley values is fair by construction and expensive to compute. The 2025 to 2026 literature pushes usable approximations: Shapley sampling, monotone-aggregation auctions, and on-chain reputation that accrues from confirmed contributions. Long-horizon autonomous agents on METR\'s hours-long work curve need economic agency, and that means one of these has to be real.',
      },
      {
        heading: 'Shapley value, and why you sample it',
        body: 'The Shapley value is the unique credit allocation satisfying four axioms: efficiency (shares sum to total value), symmetry (identical contributions get identical credit), linearity, and null (a contributor who adds nothing gets nothing).\n\nComputing it: for each agent, average its marginal contribution across every possible ordering of the agents. For N=3 that is 6 permutations. For N=10 it is 3.6 million. So in practice you sample orderings rather than enumerate, typically 100 to 1000 draws.\n\nWhich means the number you display is an estimate with error bars, and the shipping rule is Shapley-sample, not Shapley-exact.',
      },
      {
        heading: 'Second-price auctions for aggregation',
        body: 'Google Research\'s mechanism-design work proposes second-price token auctions for aggregating model outputs. N agents each propose a completion, each holding a private value for being selected. The auctioneer picks the highest-value proposal and pays the second-highest value.\n\nUnder monotone aggregation, where value depends on which proposal is chosen and not on how many were bid, this is truthful: bidding your real value is optimal, so misreporting gains nothing. That property is the whole point. It lets you outsource completions to agents with different pricing, pick the best, pay fairly, and not have to police strategic bidding.',
      },
      {
        heading: 'Reputation is the layer that ships first',
        body: 'A durable identifier plus a decayed quality score. The update rule is one line: new reputation equals alpha times old reputation, plus one minus alpha times this round\'s contribution quality, with alpha close to 1.\n\nReputation is cheap to read for routing (send hard tasks to high-rep agents), expensive to forge because it accumulates over time and binds to an identity, and slashable when a contribution fails verification. Two calibration constraints: cap the decay factor and floor the score, since unbounded decay wipes legitimate contributors while too-slow decay keeps rewarding stale high-rep agents.\n\nThe five-layer reference stack around it: DePIN for physical compute, identity via W3C DIDs, cognition (the agent loop itself), settlement via account abstraction, and governance via agentic DAOs. Almost nothing uses all five. Bittensor rewards task-specific output quality per subnet, Fetch.ai charges FET for inference and lets agents pay each other, and Gonka makes the proof-of-work a verifiable transformer forward pass.',
      },
      {
        heading: 'The four ways the economics breaks',
        body: 'Oracle manipulation: if the credit function can be gamed, agents will game it. Every mechanism needs an adversarial test before the network opens.\n\nSybil attacks: one operator spins up N fake agents to inflate its own contribution. Durable identifiers slow this; the real mitigation is that reputation is costly to accumulate.\n\nVerification cost: credit attribution is only as fair as the verifier. Cheap verification (a small model) is gameable; expensive verification (a human panel) does not scale. Never distribute credit without an independent verification step, because self-reported quality is exactly what sybil games feed on.\n\nRegulatory overhang: tokenized agent payments sit in legal gray areas in several jurisdictions as of 2026. Which is why the order is reputation first, tokens later, and closed corporate systems can skip the economics entirely for managers assigning work against internal metrics.',
      },
    ],
    takeaways: [
      'Shapley is factorial. Sample 100 to 1000 orderings and show the number as an estimate, because an exact-looking contribution score you approximated is a lie in a tooltip.',
      'Second-price auctions are truthful under monotone aggregation, which is what lets you accept bids from agents you do not control.',
      'Ship reputation before tokens. A decayed slashable score buys you routing policy without the legal surface.',
      'Verify before you reward. Credit attribution without an independent verifier is a sybil incentive with a dashboard.',
    ],
    terms: [
      { term: 'Shapley value', meaning: 'The unique credit split satisfying efficiency, symmetry, linearity, and null.' },
      { term: 'Shapley sampling', meaning: 'Monte Carlo over K orderings instead of enumerating all N factorial permutations.' },
      { term: 'Second-price auction', meaning: 'The winner pays the second-highest bid, making truthful bidding optimal.' },
      { term: 'Monotone aggregation', meaning: 'Value depending on which proposal is chosen, not how many were bid. The truthfulness condition.' },
      { term: 'Reputation capital', meaning: 'An identity-bound quality score accumulated from verified contributions, decaying over time.' },
      { term: 'Sybil attack', meaning: 'One operator running many fake agents to inflate its own share of credit.' },
    ],
    demoCaption:
      'The run says three agents produced a 0.8 result. Open it and the credit split appears, along with how it was computed: sampled orderings, per-agent marginal contribution, and the efficiency check that the shares sum to the total.',
    demo: {
      archetype: 'reveal',
      subject: 'Joint run · score 0.80',
      opaqueLabel: 'Three agents collaborated. Result quality: 0.80',
      revealedLines: [
        'retriever: 0.31 credit (marginal contribution averaged over orderings)',
        'reasoner: 0.38 credit',
        'verifier: 0.11 credit',
        'sum = 0.80, efficiency axiom holds',
        'method: sampled 500 of 6 orderings possible at N=3, exact here',
        'at N=10 this is 3.6M orderings, so sampling with visible error',
      ],
      badCaption:
        'A single joint score tells you the run worked and nothing about who made it work, so you cannot route the next hard task, cannot slash a bad contributor, and cannot answer a user asking why one agent keeps getting the work.',
      goodCaption:
        'The per-agent split is the row your run view actually needs, and it has to carry its method: exact enumeration at small N, sampled with error bars past that. Shares summing to the total is the efficiency axiom, and it is a check you can assert in code.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'three agents produced a 0.8 result. who gets credit?',
        body:
          'three agents produced a 0.8 result. who gets credit?\n\nequal split ignores who did the work. last-contributor-takes-all rewards whoever wrote the final token.\n\nShapley value is the unique split satisfying efficiency, symmetry, linearity, null. average each agent\'s marginal contribution over every ordering.\n\nN=3: 6 orderings. N=10: 3.6 million. so you sample 100-1000 and report error.',
      },
      {
        kind: 'X · design angle',
        hook: 'reputation is the agent-economy layer with an actual product surface.',
        body:
          'reputation is the agent-economy layer with an actual product surface.\n\none line: rep = alpha * rep + (1-alpha) * verified_quality. decays, binds to a durable id, slashable on failed verification.\n\nit becomes routing policy: hard tasks to high-rep agents. which means the moment a user asks "why did that agent get this", you owe them an explanation affordance.\n\nship reputation before tokens. tokens add legal surface, not accuracy.',
      },
      {
        kind: 'X · one-liner',
        hook: 'second-price auctions are truthful, which is why you can take bids from agents you do not control.',
        body:
          'second-price auctions are truthful, which is why you can take bids from agents you do not control.\n\nhighest value wins, pays the second-highest. under monotone aggregation, misreporting your value gains nothing.\n\nthat single property is what makes an open agent marketplace tractable instead of a bidding war you have to police.',
      },
    ],
    source: {
      label: 'Full lesson: 21 21-agent-economies',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/16-multi-agent-and-swarms/21-agent-economies',
    },
  },
];
