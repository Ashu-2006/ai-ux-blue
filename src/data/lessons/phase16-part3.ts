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
      'Du et al. turned Minsky\'s 1986 premise into an algorithm: N agents answer, read each other, revise for R rounds, then vote. Agent count alone plateaus, round count alone barely moves, and both together produce the jump.',
    readTime: '~10 min read',
    diagram: '/lessons/p16-07.svg',
    diagramCaption:
      'Three agents over three rounds: independent answers, then each reading the others and revising, converging on a majority.',
    whyItMatters:
      'Debate turns one response into an N times R matrix, and that matrix is your interface. A 5-agent, 3-round debate is 15 calls on a growing context, already several times a single chain-of-thought call; push to 5 rounds and it is 25 calls, about 10 times CoT. So the surface is not a spinner: it is a round counter, a per-agent state, and a diff of what changed since the last round. Consensus is only fraction-on-majority, never truth, so the component needs an agreement read and a minority disclosure rather than a bare green answer.',
    learningObjectives: [
      'Explain why self-consistency saturates while multi-agent debate does not.',
      'Separate the two independent knobs, agent count and round count, and predict which configuration produces a jump versus a plateau.',
      'Compute the call count and cost multiple for an N-agent, R-round debate.',
      'Identify the three debate collapse modes, sycophancy cascade, topic drift, and compute blowup, and their mitigations.',
      'Design a debate interface that renders agreement fraction and minority disclosure rather than a single answer.',
    ],
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
      {
        heading: 'What the bill actually looks like',
        body: 'Self-consistency at N=40 is 40 calls on a flat context, cheap per call, and it saturates because every sample shares the same weights. A single chain-of-thought call is 1 call, the floor. A 5-agent, 3-round debate is 15 calls on a context that grows every round, because each agent carries the accumulating record of what its peers said.\n\nThe fifteen calls only earn their cost when disagreement is informative: open-ended reasoning, multi-step arithmetic, factuality checks where a wrong turn is visible to a peer. On tasks with one cheap, verifiable answer, a lookup, a regex match, self-consistency at N=5 or a single verified call beats debate on cost with no accuracy loss. Debate is not a universal upgrade. It is a tool for the specific failure mode where one model\'s correlated errors need a second, independent read.',
      },
      {
        heading: 'Debate, reflection, and self-consistency in one table',
        body: 'Method | Calls | What decorrelates errors | Ceiling\nSelf-consistency | N (flat) | Nothing, same weights every sample | Plateaus fast\nReflection | R (1 agent) | Nothing, same weights judging itself | Barely moves the needle\nDebate | N times R (growing) | Peer disagreement forces justify-or-update | Keeps rising through round 3\n\nThe table is the whole argument in one row: reflection looks like debate because it also has "rounds," but a single agent re-reading its own reasoning is not a second opinion, it is the same opinion read twice. Debate\'s extra calls buy something reflection\'s extra calls do not: an independent vantage point. That is also why capping at 3 rounds and 5 agents is not a compromise. Du et al.\'s ablations show most of the gain lands by round 3, and the calls past that point are buying context bloat, not decorrelation.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p16-07-inline-knobs.svg',
        alt: 'Agent count and round count as independent axes',
        caption: 'Agents alone plateaus. Rounds alone barely moves. Both together produce the jump.',
        diagramBrief:
          'Line chart on cream paper (#faf6ef), monochrome ink. X axis: rounds 1 to 5. Three lines: "agents=1" flat and low, "rounds=1, agents scaling" rising then flattening, "agents x rounds both scaling" rising steeply in one accent color. Small annotation arrow pointing to where the steep line pulls away from the other two.',
      },
      {
        src: '/lessons/p16-07-inline-cost.svg',
        alt: 'Call count grid for agents times rounds',
        caption: '5 agents times 5 rounds is 25 calls on growing context, about 10 times a single CoT call.',
        diagramBrief:
          '5x5 grid of small squares on cream paper, each square one LLM call, rows labeled by agent, columns labeled by round. Fill the full grid in one accent color, caption "25 calls" below. Beside it, a single small square labeled "1 call: single CoT" for scale comparison.',
      },
    ],
    takeaways: [
      'Agents and rounds contribute independently. Adding rounds to a single agent is reflection and it barely moves; you need both to get the jump.',
      'Cap at 3 rounds and 5 agents. Past that you are buying context bloat, and per-question cost can already reach 10 times a single CoT call.',
      'Consensus is fraction-on-majority, not truth. Render the agreement fraction and the minority, or you are shipping false confidence.',
      'Put an adversarial slot in the pool. Without one prompted dissenter, sycophancy cascade collapses the debate to the loudest agent.',
    ],
    terms: [
      { term: 'Society of Mind', gloss: '"Minsky\'s idea"', meaning: 'Intelligence as interacting specialists; 1986 framing now operationalized as LLM debate.' },
      { term: 'Multi-agent debate', gloss: '"Agents argue"', meaning: 'N agents propose, read and critique each other over R rounds, then majority-vote.' },
      { term: 'Consensus', gloss: '"They agree"', meaning: 'Not epistemic truth, just fraction-on-majority-answer. Can be confidently wrong.' },
      { term: 'Round', gloss: '"Exchange steps"', meaning: 'One pass where every agent reads the others\' latest answers and updates once.' },
      { term: 'Correlated error', gloss: '"Same model, same bug"', meaning: 'Shared bias across samples from the same model, the reason self-consistency saturates.' },
      { term: 'Heterogeneous debate', gloss: '"Mix model families"', meaning: 'Using different base model families in the pool to decorrelate errors.' },
      { term: 'Sycophancy cascade', gloss: '"Everyone agrees with the loud one"', meaning: 'Agents deferring to the most confident peer regardless of whether it is right.' },
      { term: 'NLSOM', gloss: '"129-agent society"', meaning: 'Natural-language society of mind; Zhuge et al.\'s scaled version where specialization emerged with size.' },
      { term: 'Topic drift', gloss: '"The conversation wanders"', meaning: 'Debate straying from the original question over many rounds; mitigated by re-injecting the question each round.' },
      { term: 'Compute blowup', gloss: '"It got expensive"', meaning: 'N agents times R rounds on growing context, which can exceed 10 times a single CoT call.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Three agents debate for 3 rounds. Agent 2 flips its answer after round 1, having seen the majority. Is that update justified reasoning or sycophancy? What would you need to see in the transcript to tell the difference?' },
      { level: 'medium', prompt: 'A debate configuration runs 5 agents for 5 rounds. Compute the total call count and estimate cost relative to a single chain-of-thought call, using the 10x figure this lesson cites.' },
      { level: 'medium', prompt: 'Read Du et al. Section 4 ablations (arXiv:2305.14325). Summarize the agents-only vs rounds-only vs both result in three sentences.' },
      { level: 'design', prompt: 'Sketch the round-by-round view for a 4-agent, 3-round debate. What does a user see change between round 1 and round 2, and how do you visually distinguish "updated its answer" from "held its position"?' },
      { level: 'hard', prompt: 'Read "Should we be going MAD?" (arXiv:2311.17371) and name two debate variants beyond round-robin. For each, what does the extra structure buy you and what does it cost?' },
    ],
    furtherReading: [
      { label: 'Du et al., Improving Factuality and Reasoning in Language Models through Multiagent Debate (arXiv:2305.14325)', url: 'https://arxiv.org/abs/2305.14325', why: 'The reference paper, ICML 2024, source of the agents-vs-rounds ablation.' },
      { label: 'Zhuge et al., Mindstorms in Natural Language-Based Societies of Mind (arXiv:2305.17066)', url: 'https://arxiv.org/abs/2305.17066', why: 'The 129-agent NLSOM extension showing specialization emerging with scale.' },
      { label: 'Should we be going MAD? A Look at Multi-Agent Debate Strategies for LLMs (arXiv:2311.17371)', url: 'https://arxiv.org/abs/2311.17371', why: 'Benchmarks debate variants against plain self-consistency at equal budget.' },
      { label: 'Debate project page (Du et al.)', url: 'https://composable-models.github.io/llm_debate/', why: 'Code, demos, and the full ablation detail behind the numbers in this lesson.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Debate deployment checklist',
      body: '- Cap rounds at 3. Most of the gain lands by round 3; more is cost, not quality.\n- Cap agents at 5. Beyond that, context bloat and compute dominate.\n- Heterogeneous by default: at least two different base models in the pool.\n- One adversarial slot: an agent prompted to disagree regardless, to break sycophancy cascade.\n- Log every round. A debate system that hides intermediate rounds cannot be debugged or audited.\n- Render the agreement fraction and the minority answer, never just the majority string.',
    },
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
    readTime: '~10 min read',
    diagram: '/lessons/p16-15.svg',
    diagramCaption:
      'The four topologies side by side, with the edge count that drives token cost growing from chain to fully connected graph.',
    whyItMatters:
      'Topology is the thing you actually pick in a config, and it sets both the latency profile and what you can show. A chain streams progressively, since each agent finishes before the next starts, so you can render a stepper. A graph resolves all at once and needs a bounded-round progress state with nothing partial to show. Star gives you one hub answer plus N worker rows. The coordination tax past 4 agents is a budget you should surface: cost and wall-clock grow faster than quality, so the config UI needs an agent count with a warning threshold, not an open number field.',
    learningObjectives: [
      'Compare star, chain, tree, and graph topologies by information flow and cost.',
      'Explain the coordination tax and why it appears past roughly 4 agents on graph topology.',
      'Decide when swapping a model beats adding an agent.',
      'Distinguish volunteer and conformity behaviors and identify which one is a liability.',
      'Choose a UI pattern, stepper versus bounded-round wait, that matches a given topology\'s completion shape.',
    ],
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
      {
        heading: 'Self-consistency: the baseline you have to beat',
        body: 'Before any multi-agent topology, there is Wang et al. 2022: sample one model N times at temperature above zero, majority-vote on the reasoning paths. On GSM8K that produced substantial gains at N=40 over a single greedy decode. It is one model, it is cheap per call, and it is the floor every topology has to clear.\n\nThe limit is structural: all N samples share the same weights, so a systematic bias rides along in every one of them. Self-consistency is the single-agent precursor to multi-agent voting, and it is worth running first. If a task is simple enough that N=5 self-consistency already saturates accuracy, no topology below is worth its coordination cost.',
      },
      {
        heading: 'Jury methods: the middle ground',
        body: 'Between plain majority vote and full multi-agent debate sits the jury: a small, role-differentiated panel. The Sibyl framework formalizes it with three roles, one agent cross-examines, one supplies context, one scores plausibility, and the panel votes after each stage rather than only at the end.\n\nA jury costs more than a vote, each role is a separate call, and less than full debate, no all-to-all exchange, no growing shared context. It buys some of debate\'s decorrelation, since the roles see the problem from different angles, without graph topology\'s N-squared edge growth. Treat it as the answer to "debate feels too expensive but voting feels too shallow": three specialized calls instead of five generalist ones arguing in a circle.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p16-15-inline-topologies.svg',
        alt: 'Star, chain, tree, and graph edge counts',
        caption: 'Edge count grows from chain (linear) to graph (N squared), and that edge count is the token-cost driver.',
        diagramBrief:
          'Four small node-and-edge diagrams side by side on cream paper (#faf6ef): star (1 hub, 4 spokes), chain (4 nodes in a line), tree (root plus 2 children plus 4 grandchildren), graph (4 nodes fully connected, 6 edges). Print the edge count below each. One accent color per diagram\'s edges, monochrome ink otherwise.',
      },
      {
        src: '/lessons/p16-15-inline-coordination-tax.svg',
        alt: 'Coordination tax curve past 4 agents',
        caption: 'Past roughly 4 agents on graph topology, cost and latency outrun quality.',
        diagramBrief:
          'Two overlaid line charts on cream paper, X axis agent count 1 to 8. Line 1 "quality" rises and flattens after 4. Line 2 "cost / latency" rises faster and keeps climbing past 4, in accent color. Shade the region past X=4 lightly and label it "coordination tax zone".',
      },
    ],
    takeaways: [
      'Topology is a product decision. Chain streams and gives you a stepper. Graph resolves all at once and gives you a bounded-round progress state.',
      'The coordination tax bites past roughly 4 agents on graph. Put a warning threshold on the agent-count control instead of an open field.',
      'Swap a model before you add an agent. Three different models beat five copies of one on tasks with clean ground truth.',
      'Log the minority cluster. A persistently correct minority is measurable diversity value, and hiding it makes consensus look better than it is.',
    ],
    terms: [
      { term: 'Self-consistency', gloss: '"Sample N times, vote"', meaning: 'Wang 2022. One model, N samples above temperature zero, majority vote on reasoning paths.' },
      { term: 'Heterogeneity', gloss: '"Different models"', meaning: 'An ensemble of different base models or prompt families in the pool, which breaks monoculture.' },
      { term: 'MAD', gloss: '"Multi-agent debate"', meaning: 'The generic term for agents exchanging critiques over rounds, per Du et al. 2023.' },
      { term: 'A-HMAD', gloss: '"Adversarial heterogeneous MAD"', meaning: 'A debate variant naming different base models plus a dissenting role.' },
      { term: 'Topology', gloss: '"Who talks to whom"', meaning: 'Star, chain, tree, or graph. It determines information flow and edge count.' },
      { term: 'Coordination tax', gloss: '"Diminishing returns"', meaning: 'Past roughly 4 agents on graph topology, cost and latency grow faster than quality.' },
      { term: 'Volunteer behavior', gloss: '"Unprompted help"', meaning: 'AgentVerse\'s emergent pattern where an agent offers to take the next step unasked.' },
      { term: 'Conformity behavior', gloss: '"Agreement under pressure"', meaning: 'An agent shifting its stance to match a critic, correct or not. The AgentVerse liability.' },
      { term: 'Jury', gloss: '"Small specialized panel"', meaning: 'A Sibyl-style role-differentiated ensemble (examiner, context supplier, scorer) between plain vote and full debate.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A team runs 5 agents in a fully connected graph for a fact-lookup task. Name two structural reasons this likely underperforms a single agent with self-consistency at N=5.' },
      { level: 'medium', prompt: 'At N=7 on graph topology, MARBLE\'s coordination tax means cost and latency outrun quality gains. Sketch the accuracy-vs-N and cost-vs-N curves you would expect and mark where they cross.' },
      { level: 'medium', prompt: 'Read MultiAgentBench (arXiv:2503.01935) Section 4. Name one topology-task pairing the paper measures that this lesson does not cover.' },
      { level: 'design', prompt: 'Design the progress component for a chain topology at N=4 versus a graph topology at N=4. What can the chain view show that the graph view structurally cannot?' },
      { level: 'hard', prompt: 'A jury of 3 role-differentiated agents (examiner, context supplier, scorer) replaces a 5-agent full debate. Estimate the call-count savings and name one accuracy risk of the smaller panel.' },
    ],
    furtherReading: [
      { label: 'Wang et al., Self-Consistency Improves Chain of Thought Reasoning (arXiv:2203.11171)', url: 'https://arxiv.org/abs/2203.11171', why: 'The single-model baseline every multi-agent topology has to beat.' },
      { label: 'MultiAgentBench / MARBLE (arXiv:2503.01935)', url: 'https://arxiv.org/abs/2503.01935', why: 'The topology benchmark: graph best for research, chain best for pipelines, coordination tax past ~4 agents.' },
      { label: 'Should we be going MAD? (arXiv:2311.17371)', url: 'https://arxiv.org/abs/2311.17371', why: 'Finds MAD often loses to self-consistency at equal budget unless agents are genuinely heterogeneous.' },
      { label: 'AgentVerse (ICLR 2024)', url: 'https://proceedings.iclr.cc/paper_files/paper/2024/file/578e65cdee35d00c708d4c64bce32971-Paper-Conference.pdf', why: 'Source of the volunteer and conformity emergent-behavior findings.' },
      { label: 'MARBLE reference implementation', url: 'https://github.com/ulab-uiuc/MARBLE', why: 'The benchmark harness behind the topology numbers in this lesson.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Topology picker',
      body: '- Start with self-consistency at N=5 on one strong base model. It is the cheap baseline.\n- Upgrade to heterogeneous voting at N=3 if accuracy matters, and measure the delta.\n- Only upgrade to a debate topology if the task has structure (research, multi-step) and bounded rounds are feasible.\n- Pick chain for stepwise pipelines, star for fast factual consolidation, graph only for genuine any-to-any critique.\n- Cap agents at 4 on graph topology and put a warning threshold on the control past that.\n- Always log the minority cluster and benchmark wall-clock and tokens alongside accuracy.',
    },
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
    readTime: '~10 min read',
    diagram: '/lessons/p16-16.svg',
    diagramCaption:
      'The OG-Narrator split: negotiation state feeds a deterministic offer generator, whose price the LLM wraps in language.',
    whyItMatters:
      'This is a schema boundary you will implement literally. The message a negotiating agent sends is two fields, not one: a numeric offer produced by code and a narration string produced by the model, and only the number is authoritative. That split determines what you render (the price as a typed value with a history chart, the framing as prose), what you validate (reject out-of-ZOPA offers at the protocol boundary), and the hardest part: private scratchpad context must never reach the counterpart\'s window. If your trace viewer shows reasoning in the same pane as sent messages, you have already leaked the reservation price.',
    learningObjectives: [
      'Explain why decomposing offer-generation from narration lifts deal rate without a larger model.',
      'Trace a Contract Net negotiation through cfp, propose, accept-proposal, and reject-proposal.',
      'Identify why concealing reasoning from a counterpart improves negotiation outcomes.',
      'Distinguish ZOPA and BATNA and use them to validate an incoming offer.',
      'Design a message schema that separates a typed numeric offer from a non-authoritative narration string.',
    ],
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
      {
        heading: 'Contract Net as a task market, not just a handshake',
        body: 'The modern reuse of Contract Net scales past two-party bargaining into task allocation. A manager agent decomposes a job into units and broadcasts a cfp to a pool of worker agents. Each worker replies with an offer of price, ETA, and confidence, three numbers, not prose. The manager awards the units and the losing bidders stay free to bid on the next call.\n\nThis is why the protocol survives past 100 workers where synchronous chat collapses: coordination is broadcast-and-respond, not a conversation everyone has to track. Microsoft Agent Framework\'s orchestration patterns and several LangGraph implementations use this shape for exactly that reason. The manager\'s UI is a bid table, not a transcript, and that table is what a user reviewing task allocation should actually see.',
      },
      {
        heading: 'N-party negotiation and secret scores',
        body: 'Two-party bargaining generalizes to coalition formation once you add a third stakeholder with its own private utility. The LLM-Stakeholders Interactive Negotiation benchmark (NeurIPS 2024) sets up multi-party scorable games where each party has a secret score and a minimum-acceptance threshold, and the model has to infer what the others value from what they say, not from a shared ledger.\n\nThis is the production case for a task market with heterogeneous workers: a manager, a specialist bidder, and a budget holder do not share a utility function, and no single message reveals all three. The engineering consequence is the same one CoT concealment forces on two-party deals: each party\'s private valuation lives in its own scratchpad, and the negotiation transcript only ever shows what was actually said.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p16-16-inline-schema.svg',
        alt: 'OG-Narrator message schema, two fields',
        caption: 'The message is two fields: a typed numeric offer and a non-authoritative narration string.',
        diagramBrief:
          'Cream paper (#faf6ef), a message box split into two labeled sub-boxes: left "offer: number (authoritative)" with a small lock icon in accent color, right "narration: string (decorative)" with a speech-bubble icon. Arrow from a "negotiation state" box on the far left into the offer box only, showing narration has no path back to state.',
      },
      {
        src: '/lessons/p16-16-inline-dealrate.svg',
        alt: 'Deal rate before and after decomposition',
        caption: 'All-model bargaining closes around 27 percent. Splitting offer from narration closes around 89 percent.',
        diagramBrief:
          'Two horizontal bar charts on cream paper stacked vertically. Bar 1 "model decides offer" filled to 27%. Bar 2 "code decides, model narrates" filled to 89%, accent color. Gridlines at 25/50/75/100.',
      },
    ],
    takeaways: [
      'The message is two fields. A number computed deterministically and a narration written by the model, with only the number authoritative.',
      'Deal rate moves from about 27 to about 89 percent through decomposition alone. No larger model buys that.',
      'Private scratchpad and public message must be different types, not the same string with a convention. Leaked reasoning is a leaked reservation price.',
      'Validate incoming offers at the protocol boundary. An out-of-ZOPA offer cannot close, so reject it before it enters the negotiation state.',
    ],
    terms: [
      { term: 'Contract Net', gloss: '"Task market"', meaning: 'Smith 1980, FIPA 1996: cfp, propose, accept-proposal, reject-proposal. The canonical task-market protocol.' },
      { term: 'ZOPA', gloss: '"Zone of possible agreement"', meaning: 'The overlap between the buyer\'s maximum and the seller\'s minimum; offers outside it cannot close.' },
      { term: 'BATNA', gloss: '"Best alternative to a negotiated agreement"', meaning: 'Your fallback if the deal fails, which sets your reservation price.' },
      { term: 'OG-Narrator', gloss: '"Offer generator plus narrator"', meaning: 'The decomposition where a deterministic function computes the price and the model only writes the framing.' },
      { term: 'Zeuthen strategy', gloss: '"Risk-minimizing concession"', meaning: 'A classical offer-generator rule that concedes based on a risk limit, one option for the deterministic half of OG-Narrator.' },
      { term: 'Rubinstein bargaining', gloss: '"Alternating-offer equilibrium"', meaning: 'A game-theoretic model for infinite-horizon bargaining with discounting, another deterministic offer-generator choice.' },
      { term: 'CoT concealment', gloss: '"Hide your reasoning"', meaning: 'Keeping strategy in a private scratchpad so the counterpart\'s context only ever contains the offer.' },
      { term: 'Persona manipulation', gloss: '"Emotional posturing"', meaning: 'Framing urgency or desperation in the narration only, worth roughly 20 percent payoff in NegotiationArena.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A negotiating agent\'s message contains an offer and a narration. Which field is authoritative, and what should happen if the two disagree?' },
      { level: 'medium', prompt: 'OG-Narrator moves deal rate from about 27 percent to about 89 percent without a larger model. Name the two anchoring failures decomposition removes.' },
      { level: 'medium', prompt: 'A Contract Net manager receives three bids of (price, eta, confidence) for one task. Two bids beat the reserve price on cost, one wins on confidence. Which award rule do you pick and why?' },
      { level: 'design', prompt: 'Sketch a negotiation trace viewer for a support agent negotiating a refund. Show where the private scratchpad lives relative to the sent-message log, and what happens to the design if a developer tries to put them in the same pane.' },
      { level: 'hard', prompt: 'Read the Large-Scale Autonomous Negotiation Competition paper (arXiv:2503.06416). What single design choice most explains why concealment-favoring agents won across roughly 180,000 negotiations?' },
    ],
    furtherReading: [
      { label: 'NegotiationArena (arXiv:2402.05863)', url: 'https://arxiv.org/abs/2402.05863', why: 'The canonical benchmark: persona manipulation and exploitation findings.' },
      { label: 'Measuring Bargaining Abilities of Language Models (arXiv:2402.15813)', url: 'https://arxiv.org/abs/2402.15813', why: 'Source of OG-Narrator and the 27-to-89-percent deal-rate result.' },
      { label: 'Large-Scale Autonomous Negotiation Competition (arXiv:2503.06416)', url: 'https://arxiv.org/abs/2503.06416', why: 'Roughly 180,000 negotiations; chain-of-thought concealment wins.' },
      { label: 'LLM-Stakeholders Interactive Negotiation (NeurIPS 2024)', url: 'https://proceedings.neurips.cc/paper_files/paper/2024/file/984dd3db213db2d1454a163b65b84d08-Paper-Datasets_and_Benchmarks_Track.pdf', why: 'Multi-party scorable games with secret utilities, the N-party generalization.' },
      { label: 'Smith 1980, The Contract Net Protocol', url: 'https://ieeexplore.ieee.org/document/1675516', why: 'The classical mechanism this lesson\'s task-market pattern reuses.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Production bargaining checklist',
      body: '- Separate scratchpad. Private state never reaches the counterpart\'s context. Non-negotiable.\n- Deterministic offer generation. Compute prices, quantities, and ETAs; do not prompt for them.\n- Validate all incoming offers against a schema. Reject out-of-ZOPA offers at the protocol boundary.\n- Bound rounds at 3 to 5. Escalate to a mediator on deadlock.\n- Measure deal rate and payoff variance continuously. A falling deal rate is a symptom of prompt drift or a counterpart-side attack.\n- Log all rejected proposals with the deterministic rationale, so losing bidders understand why.',
    },
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
    readTime: '~10 min read',
    diagram: '/lessons/p16-17.svg',
    diagramCaption:
      'Observations enter the append-only stream, reflection synthesizes higher-order beliefs back into it, and plans read from ranked retrieval.',
    whyItMatters:
      'The retrieval score is the interface. Memory ranks by recency times decay, plus self-rated importance, plus embedding relevance, and every action is driven by a top-k slice of that ranking. Which means the debuggable surface is a per-action panel showing exactly which memories won, with their three sub-scores visible, because "why did the agent do that" has a literal answer you can render. The append-only rule is a hard constraint on your data layer: corrections are new rows, never edits, so any UI that lets a user fix a memory writes a superseding entry and shows both.',
    learningObjectives: [
      'Describe the three components of the generative-agent architecture and what each contributes to believability.',
      'Compute a memory\'s retrieval score from its recency, importance, and relevance sub-scores.',
      'Trace how one seeded goal produces unscripted group behavior through observation, reflection, and plan.',
      'Identify the three documented failure modes and their mitigations.',
      'Design a per-action panel that exposes which memories drove a decision.',
    ],
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
      {
        heading: 'Five rules that keep the architecture honest',
        body: 'The three components only work if the implementation follows rules the paper is explicit about. Memory is append-only, never mutate an entry, a correction is a new entry, full stop. Importance scores are cheap: call the model once at write time, rate 1 to 10, cache it, never recompute. Retrieval is ranked, not filtered, a hard filter throws away context a weighted score would have surfaced. Reflection runs periodically, triggered when the summed importance of unprocessed memories crosses a threshold, not on a fixed clock. Plans are revisable, and only the contradicted segment regenerates, not the whole tree.\n\nEach rule maps to a specific bug if you skip it: mutate a memory and you lose the audit trail, filter hard and you lose serendipitous context, regenerate the whole plan and you burn the token budget rebuilding what a contradiction never touched.',
      },
      {
        heading: 'Where the architecture ships beyond Smallville',
        body: 'The three-component shape has outgrown the original sandbox. Policy and market research use Smallville-like populations to simulate how users might respond to a feature, faster than an A/B test and with contested accuracy, since a simulated user is not a real one. Game studios use it for NPC AI, replacing scripted quests with agents that generate their own storylines from memory and reflection. Evaluation itself has shifted: the metric is not task accuracy but believability and coherence over a long run, scored by human raters.\n\nThe dividing line to hold onto: tight task execution, a pipeline that must produce a correct answer, still wants the supervisor-and-roles patterns from earlier in this phase. Emergent social behavior, where the interesting output is the unscripted interaction itself, is what the memory-reflection-plan architecture is for. Using one where the other belongs is the actual failure mode.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p16-17-inline-retrieval.svg',
        alt: 'Three memory sub-scores combining into one retrieval score',
        caption: 'Recency, importance, and relevance combine into a weighted score; only the top-k enters the prompt.',
        diagramBrief:
          'Cream paper (#faf6ef). Three labeled bars (recency, importance, relevance) feeding into a plus sign, feeding into a single "score" box, feeding into a ranked list of 5 memory rows with the top 3 highlighted in accent color and the bottom 2 grayed out, labeled "never enters the prompt".',
      },
      {
        src: '/lessons/p16-17-inline-spread.svg',
        alt: 'One seeded goal spreading through a social graph',
        caption: 'Isabella\'s invitation becomes an observation, a reflection, then a plan in each neighbor, and neighbors tell neighbors.',
        diagramBrief:
          'Cream paper, a small social network of 8 to 10 dots. One dot (Isabella) in accent color at center. Arrows radiating outward labeled "invitation, observation, reflection, plan" in sequence to two neighbors, then further arrows from those neighbors to their neighbors showing second-hand spread. Final frame shows several dots converged near a small cafe icon.',
      },
    ],
    takeaways: [
      'Every action traces to a top-k retrieval. Show the winning memories with their recency, importance, and relevance sub-scores, and "why did it do that" stops being a mystery.',
      'Memory is append-only. A correction is a new superseding entry, which means your UI shows both the old belief and the fix.',
      'All three components are load-bearing. The ablations regress believability individually, so a "memory only" version is not a lighter version, it is a broken one.',
      'Cost is N agents times T ticks times O(k) calls per tick. Price the simulation before you scale the population.',
    ],
    terms: [
      { term: 'Memory stream', gloss: '"The agent\'s diary"', meaning: 'An append-only log of observations, actions, reflections, and plans, each entry carrying derived scores.' },
      { term: 'Recency', gloss: '"How new is the memory"', meaning: 'An exponential-decay score by age, one of the three terms in the retrieval score.' },
      { term: 'Importance', gloss: '"How much does the agent care"', meaning: 'A 1 to 10 self-rating the agent assigns a memory at write time, then cached.' },
      { term: 'Relevance', gloss: '"How related to the current query"', meaning: 'Embedding cosine similarity between a memory and the current query.' },
      { term: 'Reflection', gloss: '"Higher-order belief"', meaning: 'A synthesis generated from recent memories and written back into the stream as a new, retrievable entry.' },
      { term: 'Plan tree', gloss: '"Day, hour, action decomposition"', meaning: 'A top-down plan, revisable, where only the segment an observation contradicts gets regenerated.' },
      { term: 'Smallville', gloss: '"Park 2023\'s sandbox"', meaning: 'The 25-agent simulation that produced the unscripted Valentine\'s Day party.' },
      { term: 'Believability', gloss: '"The quality metric"', meaning: 'The human-rater score Park et al. used, highest with all three architecture components present.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'An agent\'s memory stream shows a reflection with importance 8 outranking a raw observation with importance 4. Under what condition should that be a red flag rather than the ranking working correctly?' },
      { level: 'medium', prompt: 'Compute the retrieval score for a memory with recency decay 0.74, importance 8, relevance 0.6, using equal weights of 1 for each term. Would it outrank a memory with recency 0.91, importance 3, relevance 0.5?' },
      { level: 'medium', prompt: 'One agent is seeded with a goal; 24 are not, and a party emerges. Name the three architecture components load-bearing for that outcome and what breaks in the outcome if each is dropped.' },
      { level: 'design', prompt: 'Design the per-action "why did it do that" panel for a generative-agent simulation. What three numbers does every row need, and how do you visually flag a reflection that outranks its own source observations?' },
      { level: 'hard', prompt: 'Read Park et al. Section 6 (arXiv:2304.03442). Name one documented emergent behavior beyond the Valentine\'s Day party and the architecture component most responsible for it.' },
    ],
    furtherReading: [
      { label: 'Park et al., Generative Agents: Interactive Simulacra of Human Behavior (arXiv:2304.03442)', url: 'https://arxiv.org/abs/2304.03442', why: 'The reference architecture: memory stream, reflection, plan, and the ablations.' },
      { label: 'UIST \'23 paper page', url: 'https://dl.acm.org/doi/10.1145/3586183.3606763', why: 'The publication venue, with the full experiment writeup.' },
      { label: 'Smallville code release', url: 'https://github.com/joonspk-research/generative_agents', why: 'The reference Python implementation of the three components.' },
      { label: 'Hayes-Roth 1985, A Blackboard Architecture for Control', url: 'https://www.sciencedirect.com/science/article/abs/pii/0004370285900639', why: 'Prior art for structured-memory agents, decades before Smallville.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Generative-agent simulation checklist',
      body: '- Memory is the database. Pick a real store (vector DB, Postgres) at scale; in-memory is for prototypes only.\n- Log the retrieval trace. For every action, log the top-k memories that drove it.\n- Budget per-agent tokens. Each agent\'s retrieve plus reflect plus plan is O(k) calls per tick; N agents times T ticks can dwarf your budget.\n- Compact memory periodically. Summarize-and-prune low-importance entries; retention policy is a design decision.\n- Detect spatial and social norm violations explicitly. The architecture does not learn them on its own.',
    },
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
    readTime: '~10 min read',
    diagram: '/lessons/p16-18.svg',
    diagramCaption:
      'A zeroth-order agent acting on its own observations, beside a first-order agent carrying an explicit per-peer belief model.',
    whyItMatters:
      'The load-bearing state is a per-peer belief map: agent id keyed to the beliefs you attribute to that agent, held outside the model context and injected per turn. That structure is the fix for the documented failure, which is identity-belief binding decay: over a long horizon the model forgets which belief belonged to whom and produces "I thought he thought X" errors that compound. So this is an external store with an explicit schema, not a prompt paragraph. And it gives you three measurable signals to render in a coordination view: complementarity, anticipation, and correction.',
    learningObjectives: [
      'Distinguish zeroth-, first-, and second-order theory of mind and what state each requires.',
      'Explain why coordination claims need a control condition and a significance test.',
      'Identify the mechanism by which long-horizon context degrades identity-belief binding.',
      'Recognize the three measurable coordination signals: complementarity, anticipation, and correction.',
      'Design an audit view that separates measured coordination from prompt-dressed appearance.',
    ],
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
      {
        heading: 'Why the illusion is so easy to produce',
        body: 'Three ordinary mistakes manufacture the appearance of coordination without the substance. A system prompt that says "work together" bakes coordination in before the agents do anything, so what you are measuring is prompt compliance, not emergent behavior. Observer bias does the rest: humans watching a multi-agent transcript see intentional-looking patterns whether or not they are there, the same way people see faces in clouds. Post-hoc selection finishes the job, a demo reel of the five best runs out of fifty looks like a capability rather than a lucky draw.\n\nRiedl\'s contribution is refusing all three shortcuts at once: a controlled prompt condition, a metric measured against a no-ToM baseline, and a significance test before any claim of coordination is allowed to stand. A product team that skips the control is not lying, exactly. It is reporting the demo reel as the mean.',
      },
      {
        heading: 'The three signals you can actually log',
        body: 'Three agents split three boxes with no communication channel, only each other\'s moves to read. Zeroth-order agents, no model of peers, duplicate effort on roughly 35 percent of trials, two agents reaching for the same box because neither can predict the other. First-order agents, holding a belief map per peer, cut that to roughly 5 percent.\n\nThe three signals that separate this from prompt dressing are loggable in any real system. Complementarity: over a multi-turn task, do actions cover disjoint subtasks rather than duplicate ones? Anticipation: does agent A\'s move at turn T+1 depend on a prediction about B at T+2 that turns out correct? Correction: when A misreads B\'s belief at turn T, does A fix it by T+2? None of these require a lab; a duplication counter and a turn-indexed action log produce all three from data you are probably already collecting.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p16-18-inline-orders.svg',
        alt: 'Zeroth, first, and second order theory of mind state',
        caption: 'Zeroth order holds no model of peers. First order holds one per-peer belief map. Second order nests one level deeper.',
        diagramBrief:
          'Cream paper (#faf6ef), three side-by-side boxes. Box 1 "zeroth order": single agent icon, no arrows out. Box 2 "first order": agent icon with arrows to two peer icons labeled "beliefs I attribute to them", in accent color. Box 3 "second order": same but one arrow has a nested smaller box inside labeled "what I think they think a third believes".',
      },
      {
        src: '/lessons/p16-18-inline-duplication.svg',
        alt: 'Duplication rate, zeroth order vs first order ToM',
        caption: 'First-order ToM cuts duplicate effort from about 35 percent to about 5 percent on a token-collection task.',
        diagramBrief:
          'Cream paper, two bar charts side by side. Left "zeroth order" bar filled to 35%. Right "first order" bar filled to 5%, accent color. Small icon above each bar: two hands reaching for the same box (left) vs two hands reaching for different boxes (right).',
      },
    ],
    takeaways: [
      'The state is a typed per-peer belief map held outside the context window, because identity-belief binding is what decays over a long horizon.',
      'Coordination claims need a control condition. A version without the coordination prompt, measured, or the claim is marketing.',
      'First-order ToM cut duplicate effort from roughly 35 percent to roughly 5 percent on the token task. Duplication rate is a cheap production proxy.',
      'Good ToM is an attack surface in adversarial settings, for the same reason a visible reservation price is.',
    ],
    terms: [
      { term: 'Theory of mind', gloss: '"Understanding others\' minds"', meaning: 'The capacity to model another agent\'s beliefs, graded by order: 0, 1, 2 and up.' },
      { term: 'First-order ToM', gloss: '"Alice believes X"', meaning: 'Modelling a peer\'s beliefs about facts directly, one level of attribution.' },
      { term: 'Second-order ToM', gloss: '"Alice believes Bob believes X"', meaning: 'Modelling recursive beliefs one level deeper than first-order.' },
      { term: 'Sally-Anne test', gloss: '"The false-belief test"', meaning: 'The 1985 developmental-psychology probe; models pass plain versions and fail long or indirect ones.' },
      { term: 'Identity-linked differentiation', gloss: '"Stable roles over time"', meaning: 'Riedl\'s metric for whether agents develop persistent role distinctions rather than shuffling randomly.' },
      { term: 'Goal-directed complementarity', gloss: '"Disjoint actions"', meaning: 'Riedl\'s metric for agents covering different subtasks rather than duplicating each other.' },
      { term: 'Higher-order synergy', gloss: '"Group exceeds any subset"', meaning: 'Riedl\'s statistical measure for whether the group achieves what no smaller subset could.' },
      { term: 'Coordination illusion', gloss: '"It looks coordinated"', meaning: 'Prompt-dressed apparent coordination that does not survive a control condition or a significance test.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'An agent\'s per-peer belief map has not been updated in 12 turns while the conversation has moved on. What failure mode does this predict, and what would you see in the transcript?' },
      { level: 'medium', prompt: 'First-order ToM cuts duplication from about 35 percent to about 5 percent at short horizon. Sketch the duplication-rate curve you would expect from 10 to 30 turns and mark where it starts eroding.' },
      { level: 'medium', prompt: 'A coordination demo claims "emergent teamwork" with no control condition. Name the three most likely mundane explanations for what you are seeing.' },
      { level: 'design', prompt: 'Design a coordination-claims audit panel for a multi-agent product page. What does it show alongside the success metric to prove the coordination is measured, not marketed?' },
      { level: 'hard', prompt: 'Read Riedl (arXiv:2510.05174). Name the one condition under which large models show coordination without the explicit ToM prompt, and by how much it lags the prompted condition.' },
    ],
    furtherReading: [
      { label: 'Li et al., Theory of Mind for Multi-Agent Collaboration via Large Language Models (arXiv:2310.10701)', url: 'https://arxiv.org/abs/2310.10701', why: 'Emergent ToM in cooperative games and the long-horizon degradation finding.' },
      { label: 'Riedl, Emergent Coordination in Multi-Agent Language Models (arXiv:2510.05174)', url: 'https://arxiv.org/abs/2510.05174', why: 'The population-scale measurement showing ToM prompting is the load-bearing condition.' },
      { label: 'Premack & Woodruff, Does the chimpanzee have a theory of mind?', url: 'https://www.cambridge.org/core/journals/behavioral-and-brain-sciences/article/does-the-chimpanzee-have-a-theory-of-mind/1E96B02CD9850E69AF20F81FA7EB3595', why: 'The 1978 origin of the theory-of-mind concept.' },
      { label: 'Baron-Cohen, Leslie, Frith, Does the autistic child have a theory of mind?', url: 'https://doi.org/10.1016/0010-0277(85)90022-8', why: 'The 1985 Sally-Anne paper that defines the false-belief test.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Coordination claims checklist',
      body: '- Control condition. Run a version of the system without the coordination prompt and measure it too.\n- Statistical test. Is the difference between system and control significant at p < 0.05 on your metric?\n- Complementarity measure. Action-disjointness over time, not just final success.\n- Failure-case log. When agents miscoordinate, capture what the ToM state looked like.\n- Model-capacity disclosure. If the effect vanishes on smaller models, say so.',
    },
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
    readTime: '~10 min read',
    diagram: '/lessons/p16-21.svg',
    diagramCaption:
      'Five agents bidding for one task slot: the highest value wins and pays the second-highest, which is what makes truthful bidding optimal.',
    whyItMatters:
      'Credit attribution is a schema you will render whether or not you use tokens. A joint output scored 0.8 splits into per-agent contributions, so the run detail view needs a contribution column, not just a transcript, and the number has to carry its own provenance: exact Shapley or sampled over K orderings, with the sampling error visible. Reputation is the part with a real product surface: a decayed per-agent score, slashable when a contribution fails verification, which becomes routing policy (send hard tasks to high-rep agents) and therefore needs an explanation affordance when a user asks why this agent got the work.',
    learningObjectives: [
      'Explain why joint-value tasks need individual credit attribution and why naive splits are gameable.',
      'Compute Shapley credit for a small coalition and explain why larger ones require sampling.',
      'Explain why second-price auctions are truthful under monotone aggregation.',
      'Describe the reputation update rule and why it ships before tokenized incentives.',
      'Identify the four ways agent-economy mechanisms fail: oracle manipulation, sybil attacks, verification cost, and regulatory overhang.',
    ],
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
        body: 'Oracle manipulation: if the credit function can be gamed, agents will game it. Every mechanism needs an adversarial test before the network opens.\n\nSybil attacks: one operator spins up N fake agents to inflate its own contribution. Durable identifiers slow this, but the actual defense is that reputation is costly to accumulate.\n\nVerification cost: credit attribution is only as fair as the verifier. Cheap verification (a small model) is gameable; expensive verification (a human panel) does not scale. Never distribute credit without an independent verification step, because self-reported quality is exactly what sybil games feed on.\n\nRegulatory overhang: tokenized agent payments sit in legal gray areas in several jurisdictions as of 2026. Which is why the order is reputation first, tokens later, and closed corporate systems can skip the economics entirely for managers assigning work against internal metrics.',
      },
      {
        heading: 'Who is actually running which layer',
        body: 'The five-layer stack, physical compute, identity, cognition, settlement, governance, is a reference map, and almost nobody implements all five. Bittensor covers compute and identity, partially wires cognition and settlement through its subnet structure, and skips governance: miners submit models, validators rank them, stake-weighted scoring pays out TAO per subnet, so you are paid for task-specific output quality, not for compute burned. Fetch.ai runs its ASI-1 Mini LLM on its own network and charges FET for inference, with agents able to pay each other directly, the peers-as-economy story is more literal here than in Bittensor. Gonka replaces hash-based proof-of-work with transformer forward passes as the work itself, paying miners for inference against known-correct outputs.\n\nMost corporate agent systems use layer 3 only, a reasoning loop, and skip the rest entirely. The stack tells you what exists, not what you need.',
      },
      {
        heading: 'Decentralizing the credit step',
        body: 'AAMAS 2025\'s decentralized LaMAS proposal combines three pieces this lesson already covers separately: DID-bound identity, Shapley-value credit attribution, and a lightweight auction mechanism, and makes one additional claim. Moving the credit-attribution step out of a single trusted auditor\'s hands and into a protocol that any participant can verify makes the system harder to manipulate at a single point. A corrupt or compromised auditor can quietly favor one agent under a centralized scheme; a decentralized attribution step has to be gamed in the open, against a rule every participant can check.\n\nThe tradeoff is the one you would expect: a decentralized credit mechanism is slower to compute and harder to change than "the platform owner decides," and it only pays for itself in open networks with operators who do not trust each other. Inside one company, a trusted auditor is still the cheaper answer.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p16-21-inline-shapley.svg',
        alt: 'Marginal contribution averaged over agent orderings',
        caption: 'Shapley value averages each agent\'s marginal contribution across every possible ordering; at N=10 that is 3.6 million orderings, so you sample.',
        diagramBrief:
          'Cream paper (#faf6ef), a small table of 6 rows (orderings for N=3), each row showing a sequence of 3 agent icons in a different order with the marginal value of the last-added agent circled in accent color. Below, an arrow to a single "averaged credit" bar per agent. Footnote text: "N=3: 6 orderings. N=10: 3.6M, sample 100-1000".',
      },
      {
        src: '/lessons/p16-21-inline-auction.svg',
        alt: 'Second-price auction: highest bid wins, pays the second-highest',
        caption: 'The winner pays the second-highest bid, which is what makes truthful bidding the optimal strategy.',
        diagramBrief:
          'Cream paper, five vertical bars of different heights representing five agents\' bids, tallest in accent color labeled "winner". A dashed horizontal line at the second-tallest bar\'s height labeled "price paid", with an arrow from the winner\'s bar down to that line.',
      },
    ],
    takeaways: [
      'Shapley is factorial. Sample 100 to 1000 orderings and show the number as an estimate, because an exact-looking contribution score you approximated is a lie in a tooltip.',
      'Second-price auctions are truthful under monotone aggregation, which is what lets you accept bids from agents you do not control.',
      'Ship reputation before tokens. A decayed slashable score buys you routing policy without the legal surface.',
      'Verify before you reward. Credit attribution without an independent verifier is a sybil incentive with a dashboard.',
    ],
    terms: [
      { term: 'Shapley value', gloss: '"Fair credit attribution"', meaning: 'The unique credit split satisfying efficiency, symmetry, linearity, and null.' },
      { term: 'Shapley sampling', gloss: '"Monte Carlo credit"', meaning: 'Averaging marginal contribution over K sampled orderings instead of enumerating all N factorial permutations.' },
      { term: 'Second-price auction', gloss: '"Vickrey auction"', meaning: 'The winner pays the second-highest bid, which makes truthful bidding the optimal strategy.' },
      { term: 'Monotone aggregation', gloss: '"Value depends on the pick"', meaning: 'The condition, value depends on which proposal is chosen and not on how many were bid, that makes the auction truthful.' },
      { term: 'Reputation capital', gloss: '"Accumulated quality score"', meaning: 'An identity-bound score accrued from verified contributions, decaying over time and slashable on failure.' },
      { term: 'Sybil attack', gloss: '"Fake agent farm"', meaning: 'One operator running many fake agents to inflate its own share of credit.' },
      { term: 'DePIN', gloss: '"Decentralized physical infrastructure"', meaning: 'Token-incentivized compute, storage, and bandwidth networks such as Bittensor subnets, Akash, and Render.' },
      { term: 'DID', gloss: '"Decentralized identifier"', meaning: 'A W3C-specified portable identity that reputation binds to, independent of any single platform.' },
      { term: 'ERC-4337', gloss: '"Account abstraction"', meaning: 'A contract-account standard that lets agents sponsor their own gas and pay each other directly.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Three agents produce a joint score of 0.8. Equal split gives each 0.267. Name one way an agent could game an equal-split rule that it could not game under Shapley.' },
      { level: 'medium', prompt: 'At N=10 agents, exact Shapley requires 3.6 million orderings. If you sample 500, what do you report alongside the credit number, and why does omitting it matter?' },
      { level: 'medium', prompt: 'Five agents bid for one task slot in a second-price auction. Agent A bids above its true value hoping to win cheaper. Under monotone aggregation, does this help A? Why or why not?' },
      { level: 'design', prompt: 'Design the run-detail view for a joint agent output. What column sits next to the transcript, and how do you show that a contribution number is sampled versus exact?' },
      { level: 'hard', prompt: 'Read the AAMAS 2025 decentralized LaMAS paper. What does decentralizing the credit-attribution step buy you that a single trusted auditor does not?' },
    ],
    furtherReading: [
      { label: 'The Agent Economy (arXiv:2602.14219)', url: 'https://arxiv.org/abs/2602.14219', why: 'A 2026 survey of the five-layer agent-economy stack this lesson maps.' },
      { label: 'Google Research, Mechanism design for large language models', url: 'https://research.google/blog/mechanism-design-for-large-language-models/', why: 'The source of the second-price token-auction proposal under monotone aggregation.' },
      { label: 'AAMAS 2025, decentralized LaMAS', url: 'https://www.ifaamas.org/Proceedings/aamas2025/pdfs/p2896.pdf', why: 'Shapley-value credit attribution combined with DID identity and an auction mechanism.' },
      { label: 'Bittensor TAO documentation', url: 'https://docs.bittensor.com/', why: 'Subnet structure and reward distribution for the largest production agent economy.' },
      { label: 'W3C Decentralized Identifiers (DIDs) spec', url: 'https://www.w3.org/TR/did-core/', why: 'The identity foundation that reputation capital binds to.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Agent economy checklist',
      body: '- Start with reputation, not tokens. Reputation is cheap to implement and valuable alone.\n- Verify before you reward. Never distribute credit without an independent verification step.\n- Shapley-sample, not Shapley-exact. Sample 100 to 1000 orderings; exact enumeration does not scale past small N.\n- Cap the decay factor and floor reputation. Unbounded decay wipes legitimate contributors; too-slow decay rewards stale high-rep agents.\n- Audit mechanisms adversarially. Run red-team scenarios before opening the network.',
    },
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
