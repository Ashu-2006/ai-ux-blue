import type { Lesson } from '@/lib/lessons';

// Phase 14 · Part 2 · Memory and skills (lessons 14.07-14.10, 14.34)
export const phase14Part2: Lesson[] = [
  {
    id: 'p14-07-memgpt',
    phase: 'Phase 14 · Agent Engineering',
    part: 'Part 2 · Memory and skills',
    index: '14.07',
    title: 'Virtual context: paging memory in and out of the window',
    oneLiner:
      'The context window is RAM, an external store is disk, and the agent pages between them with tool calls. MemGPT named the pattern in 2023 and every production memory system since is a variant of it.',
    readTime: '~8 min read',
    diagram: '/lessons/p14-07.svg',
    diagramCaption:
      'Main context as RAM, external archival store as disk, and the memory tool call as the page fault that moves a record between them.',
    whyItMatters:
      'Paging is invisible until it fails, and when it fails the user sees a product that forgot. That makes it a UI problem: your transcript needs a state for "this answer came from archival memory, not from what you just said," with the session and turn it came from, because a recalled fact with no provenance is indistinguishable from a hallucination. The memory tool call is also a latency event the user did not ask for, so the streaming surface needs a retrieval affordance between the send and the first token. And every archival write is a row someone will eventually want to read, edit, or delete.',
    sections: [
      {
        heading: 'The problem: a bigger window does not buy memory',
        body: 'Three failures recur. Overflow: multi-turn conversations and tool-heavy trajectories cross the window and everything past the cutoff is gone. Dilution: even inside the window, stuffing irrelevant context spreads attention thin, and frontier models still degrade on long inputs. Persistence: a new session opens with an empty window, so the agent cannot say "remember when you asked me to."\n\nScale does not rescue this. Mem0\'s 2025 paper measured 128k-window baselines still missing long-horizon facts that a 4k-window agent with an external store catches. Capacity and recall are different problems.',
      },
      {
        heading: 'The move: restate OS virtual memory',
        body: 'MemGPT (Packer et al., arXiv 2310.08560) maps context management onto virtual memory. RAM becomes main context, the prompt the model always sees. Disk becomes external context, unbounded and searchable. A page fault becomes a memory tool call. The OS kernel becomes the agent control loop.\n\nThe agent runs an ordinary ReAct loop. The only addition is one class of tools that moves data across the boundary. Nothing about the model changes. The intelligence is in the control flow, which is why this pattern outlived the paper that introduced it.',
      },
      {
        heading: 'The tool surface you will render',
        body: 'The canonical five are core_memory_append(section, text), core_memory_replace(section, old, new), archival_memory_insert(text), archival_memory_search(query, top_k), and conversation_search(query). Two write to a pinned section of the prompt, two touch the external store, one scans past turns.\n\nThis is a schema, not a metaphor, and it is the schema your memory inspector renders. A replace is a diff, an insert is a new row, a search is a ranked list with scores. Each of those wants a different component, and users mostly want the replace one, because that is where they correct a wrong remembered fact.',
      },
      {
        heading: 'Memory as interrupt',
        body: 'Mid-conversation the agent invokes a memory tool, the runtime executes it, and the result splices into the next assistant turn as a fresh observation. It is a Unix read() syscall: the process blocks, bytes come back, the process continues.\n\nDesign consequence: the pause is real and it is unlabeled by default. If the agent stalls 600ms fetching three archival records, the user reads that as slowness rather than work. A small "checking what I know about this" state, retired the instant tokens start flowing, converts dead air into evidence that the agent is doing something specific.',
      },
      {
        heading: 'Where it rots and how it gets poisoned',
        body: 'Memory rot: writes accumulate faster than reads, so retrieval drowns in stale facts. Fix with periodic consolidation (14.08) or explicit invalidation (14.09). Citation loss: the agent recalls "the user asked me to ship X" and cannot cite which turn, so store session and turn ids on every archival write.\n\nMemory poisoning is the sharp one. External memory is retrieved text. If attacker-controlled content lands in a memory note, the agent re-ingests it next session. Prompt injection with a persistence layer. Any surface that lets third-party content reach a write path needs a trust label carried through to display.',
      },
    ],
    takeaways: [
      'Main context is RAM, the archival store is disk, and a memory tool call is the page fault. Capacity is a control-flow problem, not a window-size problem.',
      'A 4k-window agent with external memory beat 128k full-context baselines on long-horizon recall. Buying a bigger window is not buying memory.',
      'Every archival write needs session and turn ids attached, or the agent recalls facts it cannot cite and the UI cannot show provenance.',
      'A memory tool call is an unlabeled pause in the stream. Give retrieval its own state or users read it as latency.',
    ],
    terms: [
      { term: 'Virtual context', meaning: 'A fixed prompt tier plus an unbounded searchable tier, with tools moving records between them.' },
      { term: 'Main context', meaning: 'The prompt itself: fixed size, always visible to the model, the only thing it truly sees.' },
      { term: 'Archival memory', meaning: 'External persistent storage retrieved on demand by search rather than held in the prompt.' },
      { term: 'Core memory', meaning: 'Named sections pinned inside the main context that the agent can edit but never evict.' },
      { term: 'Memory interrupt', meaning: 'The agent pauses, the runtime fetches, and the result splices into the next turn as an observation.' },
      { term: 'Memory poisoning', meaning: 'Attacker-controlled text stored as a memory note and re-ingested as trusted context on later sessions.' },
    ],
    demoCaption:
      'A transcript that looks like one continuous conversation hides the moment the agent went to disk. Reveal the archival records behind the answer and you get the thing a user needs to trust a recalled fact: which session it came from, and a place to fix it if it is wrong.',
    demo: {
      archetype: 'reveal',
      subject: 'Recalled answer',
      badLabel: 'Answer only',
      goodLabel: 'With retrieval trace',
      opaqueLabel: 'You told me you prefer Postgres over Mongo for this project.',
      revealedLines: [
        'archival_memory_search("database preference") · 340ms · 3 hits',
        'hit 1 · score 0.81 · session 14, turn 6 · "let us stay on Postgres"',
        'hit 2 · score 0.44 · session 9, turn 22 · "Mongo was fine for the prototype"',
        'hit 3 · score 0.31 · session 3, turn 4 · stale, superseded by hit 1',
        'core memory unchanged · no write this turn',
      ],
      badCaption:
        'One confident sentence with no provenance reads exactly like a hallucination. The user has no way to tell recall from invention, and no place to correct hit 3 when it is the one that is wrong.',
      goodCaption:
        'Scores, session ids, and the 340ms retrieval turn the claim into an auditable record. Now "the agent forgot" and "the agent remembered the wrong thing" are two different states with two different fixes.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'a 4k agent with external memory beat a 128k full-context baseline on long-horizon recall.',
        body:
          'a 4k agent with external memory beat a 128k full-context baseline on long-horizon recall.\n\nbecause capacity was never the problem. MemGPT restated OS virtual memory: prompt = RAM, vector store = disk, memory tool call = page fault.\n\nthe model does not change. the control loop does.',
      },
      {
        kind: 'X · design angle',
        hook: 'a recalled fact with no provenance is indistinguishable from a hallucination.',
        body:
          'a recalled fact with no provenance is indistinguishable from a hallucination.\n\n"you said you prefer Postgres" is either memory or invention, and your UI shows the same sentence for both.\n\nstore session id and turn id on every archival write. render them. give the user a way to edit the row.\n\nprovenance is not a debug feature.',
      },
      {
        kind: 'X · one-liner',
        hook: 'the pause before your agent answers is a page fault.',
        body:
          'the pause before your agent answers is a page fault.\n\nit went to disk, searched, and spliced the result into the next turn. 300 to 600ms of unlabeled dead air that users read as slowness.\n\nlabel it. retrieval is work, not lag.',
      },
    ],
    source: {
      label: 'Full lesson: 14.07 07-memory-virtual-context-memgpt',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/14-agent-engineering/07-memory-virtual-context-memgpt',
    },
  },
  {
    id: 'p14-08-memory-blocks',
    phase: 'Phase 14 · Agent Engineering',
    part: 'Part 2 · Memory and skills',
    index: '14.08',
    title: 'Memory blocks and sleep-time compute',
    oneLiner:
      'Memory stops being a blob when you give it typed, editable, capped blocks. It stops costing latency when a second agent consolidates them while the user is not waiting.',
    readTime: '~8 min read',
    diagram: '/lessons/p14-08.svg',
    diagramCaption:
      'Three tiers (core, recall, archival), typed blocks pinned inside core, and a sleep-time agent rewriting them off the critical path.',
    whyItMatters:
      'A block is the first memory primitive that is actually renderable. It has an id, a label, a value, a character limit, and a description, which is a form schema: a labeled textarea with a live character counter and a save that the agent also writes to. That is the memory-editing surface users keep asking for. Sleep-time compute then breaks a core UI assumption, because a background agent rewrites those blocks while nobody is looking. If the user opens the Human block tomorrow and the value changed, you owe them a version history and a diff, or your product silently edited the user\'s own facts.',
    sections: [
      {
        heading: 'The problem: two-tier memory left three gaps',
        body: 'MemGPT solved control flow and exposed what it did not solve. Latency: every memory operation sits on the critical path, so pruning, summarizing, and reconciling all happen while the user waits and tail latency blows up. Memory rot: writes accumulate, contradicted facts stay, retrieval drowns.\n\nStructure loss is the third and the most design-relevant. A flat archival store cannot express "the Human block is always in the prompt, the Persona block is always in the prompt, the Task block swaps per session." Everything is one undifferentiated bag of text.',
      },
      {
        heading: 'Three tiers instead of two',
        body: 'Letta, the platform the MemGPT project became in 2024, splits memory into core, recall, and archival. Core is always visible inside the prompt, written by agent tool calls and sleep-time rewrites. Recall is conversation history including the evicted tail, written automatically by turn logging. Archival is arbitrary facts across vector, KV, and graph stores.\n\nThe split matters because the three tiers have different costs, different lifetimes, and different edit permissions. Collapsing them, as the two-tier design did, means the pinned identity facts and the searchable trivia live in the same place.',
      },
      {
        heading: 'A block is a typed object, not a paragraph',
        body: 'The paper defined two: a Human block holding facts about the user (name, role, preferences, goals) and a Persona block holding the agent\'s self-concept (identity, tone, constraints). Letta generalizes to any block you declare: Task for the current goal, Project for codebase facts, Safety for hard constraints.\n\nEach carries id, label, value, limit (a character cap) and description, which tells the model when to edit it. The tool surface is block_append, block_replace, block_read, and block_summarize. That last one exists because a cap forces a decision when a write would overflow.',
      },
      {
        heading: 'Sleep-time compute: move the work off the path',
        body: 'Letta\'s 2025 addition runs a second agent in the background. It processes transcripts and codebase context, writes learned_context into shared blocks, and consolidates or invalidates archival records.\n\nThree properties fall out. No latency cost, because primary responses never wait on memory ops. A stronger model is allowed, because the sleep-time agent is not latency-constrained and can be the slow expensive one. And a natural consolidation window, because dedup, summarization, and invalidating contradicted facts all happen when nobody is waiting. It is the shape of sleeping on a problem.',
      },
      {
        heading: 'Where blocks break',
        body: 'Block bloat: unbounded block_append hits the limit fast, so wire a summarizer before the write that would overflow the cap. Silent drift: the sleep-time agent rewrites a block and the primary agent never notices, so version blocks and surface diffs in the trace. That exercise ships as block_history(label), which exists precisely so an operator can answer "why did the agent forget X."\n\nPoisoned consolidation: the sleep-time agent processes attacker-reachable content straight into core. Treat sleep-time agents as untrusted writers, and require review before anything touches Persona or Safety.',
      },
    ],
    takeaways: [
      'A block has an id, label, value, limit, and description. That is a form schema, so memory editing is a build problem, not a research problem.',
      'Core, recall, and archival have different lifetimes and different edit permissions. One store for all three is why memory UIs feel like a text dump.',
      'Sleep-time compute takes memory work off the critical path, which also means a slower and stronger model can do it.',
      'A background agent rewriting user facts without a diff is silent drift. Version blocks and expose the history, or "why did it forget" is unanswerable.',
    ],
    terms: [
      { term: 'Memory block', meaning: 'A typed, persistent, model-editable section of core memory with a label and a character cap.' },
      { term: 'Human block', meaning: 'The pinned block holding facts about the user: name, role, preferences, goals.' },
      { term: 'Persona block', meaning: 'The pinned block holding the agent identity, tone, and hard constraints.' },
      { term: 'Sleep-time compute', meaning: 'A second agent consolidating memory in the background, off the user-facing latency path.' },
      { term: 'Block limit', meaning: 'The character cap on a block that forces summarization rather than unbounded growth.' },
      { term: 'Native reasoning', meaning: 'Provider-level thinking emitted on its own channel rather than a Thought prefix inside the prompt.' },
    ],
    demoCaption:
      'Same Human block, before and after a sleep-time pass. The left is what unbounded appends produce over four sessions. The right is what a consolidation pass leaves behind, including one fact quietly invalidated, which is exactly the change a user deserves to see in a diff.',
    demo: {
      archetype: 'before-after',
      subject: 'Human block (limit 400 chars)',
      badLabel: 'After 4 sessions of appends',
      goodLabel: 'After sleep-time pass',
      badLines: [
        'user is a designer',
        'user is a product designer',
        'user prefers dark mode',
        'user works at Ivish AI',
        'user mentioned dark mode again',
        'user is based in Berlin',
        'user is based in Lisbon',
        '412 / 400 chars · over limit',
      ],
      goodLines: [
        'Product designer, ships frontend (React, TS)',
        'Works at Ivish AI',
        'Prefers dark mode',
        'Based in Lisbon (was Berlin, invalidated session 12)',
        '178 / 400 chars',
        'v4 · rewritten by sleep-time agent · diff available',
      ],
      badCaption:
        'Appends never contradict each other, they just stack. Berlin and Lisbon both stay true, duplicates burn the cap, and the block overflows into whatever the summarizer decides to drop.',
      goodCaption:
        'Consolidation dedupes, invalidates the superseded fact, and stamps a version. The cost is that a background agent edited the user\'s own facts, so the diff and the version number are the product, not the debug output.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'agent memory got good when it stopped being a blob and became typed blocks.',
        body:
          'agent memory got good when it stopped being a blob and became typed blocks.\n\nHuman block. Persona block. Task block. each has an id, a label, a value, a character cap, and a description telling the model when to edit it.\n\nid + label + value + limit is a form schema. memory became renderable.',
      },
      {
        kind: 'X · design angle',
        hook: 'a background agent rewrote the user\'s own facts and your UI said nothing.',
        body:
          'a background agent rewrote the user\'s own facts and your UI said nothing.\n\nsleep-time compute consolidates memory while nobody is waiting. great for latency. it also means the Human block the user reads tomorrow is not the one they saw today.\n\nversion the blocks. show the diff. "why did it forget" needs an answer in the UI.',
      },
      {
        kind: 'X · one-liner',
        hook: 'the memory agent can be slower and smarter than the chat agent.',
        body:
          'the memory agent can be slower and smarter than the chat agent.\n\nit runs off the critical path. nobody is waiting on it. so you spend the expensive model on consolidation and the fast one on the reply.\n\nlatency budgets are a model-selection tool.',
      },
    ],
    source: {
      label: 'Full lesson: 14.08 08-memory-blocks-sleep-time-compute',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/14-agent-engineering/08-memory-blocks-sleep-time-compute',
    },
  },
  {
    id: 'p14-09-mem0',
    phase: 'Phase 14 · Agent Engineering',
    part: 'Part 2 · Memory and skills',
    index: '14.09',
    title: 'Hybrid memory: vector, KV, and graph behind one search',
    oneLiner:
      'Three query classes, three stores, one fused ranking. A single-store memory is always wrong for two out of three questions the user is about to ask.',
    readTime: '~8 min read',
    diagram: '/lessons/p14-09.svg',
    diagramCaption:
      'One add() writes a fact to vector, KV, and graph in parallel; one search() fuses the three recall paths through a weighted relevance, importance, and recency score.',
    whyItMatters:
      'The retrieved list your UI renders is not sorted by relevance. It is sorted by a weighted sum of relevance, importance, and recency, and those weights are a product decision you own: recency-heavy for a chat agent, importance-heavy for a compliance agent. Two things follow. A memory row needs to show why it ranked, or nobody can debug a bad recall. And the scope field (user, session, agent) is a hard permission gate, not metadata. Mixing scopes without thinking is how a product tells Alice about Bob\'s project, and no ranking tweak recovers from that.',
    sections: [
      {
        heading: 'The problem: one store is wrong for two thirds of the questions',
        body: 'Three query classes show up in the same session. Semantic similarity: "what did we discuss about agent drift last week?" Vector wins, KV and graph miss entirely. Fact lookup: "what is the user\'s phone number?" KV wins in O(1), vector is wasteful and graph is overkill. Relationship reasoning: "which customers share the same billing entity?" Graph wins and the other two simply cannot answer.\n\nProduction agents issue all three. Pick one store and you are structurally wrong on the other two.',
      },
      {
        heading: 'The move: write three ways, read fused',
        body: 'Mem0 (Chhikara et al., arXiv 2504.19413, April 2025) puts all three behind one add/search surface. On add(text, user_id, metadata) an LLM step extracts candidate facts, then each fact is written to the vector store as an embedding, to the KV store keyed on (user_id, fact_type, entity), and to the graph as typed edges.\n\nOn search(query, user_id), vector returns top-k by cosine, KV returns direct hits on the query-derived key, graph returns the subgraph reachable from query entities. A scoring layer fuses the three into one list.',
      },
      {
        heading: 'Fusion scoring is the ranking you ship',
        body: 'score = w_relevance * relevance + w_importance * importance + w_recency * recency. Relevance is vector cosine, KV exact match, or graph path weight depending on which store produced the hit. Importance is tagged at write time or learned, because names, IDs, and policies matter more than small talk. Recency is exponential decay since the record was last written or read.\n\nIt is a weighted sum, not a hierarchy, and the weights are tuned per product. Recency dominates for voice and chat. Importance dominates for compliance. Relevance dominates for retrieval.',
      },
      {
        heading: 'Temporal invalidation: contradiction without deletion',
        body: 'Mem0g adds a conflict detector. When a new fact contradicts an existing edge, the old edge is marked invalid rather than deleted. "User lives in Berlin" then "user lives in Lisbon" leaves both edges, one valid and one not, so a temporal query like "what was the user\'s city in March?" traverses the valid-at-time subgraph and answers correctly.\n\nSoft delete is a compliance behavior and a UX one. The wrong fact stays visible and reversible, which is what "no, I moved" needs to do in an interface.',
      },
      {
        heading: 'The numbers and the ways it degrades',
        body: 'The 2025 paper reports LoCoMo 91.6 on long-form conversation memory, LongMemEval 93.4 on long-horizon episodic, and BEAM 1M 64.1 on the million-token benchmark. Full-context 128k, flat vector, and flat KV baselines all lose by ten points or more.\n\nDegradation modes: embedding drift, where vector quality decays as the corpus grows, fixed by periodically re-embedding top-used records. KV schema creep, where every team invents a fact_type, fixed by auditing the type set quarterly. Graph explosion, where one noisy extractor adds 50 edges per message, fixed by capping writes per add.',
      },
    ],
    takeaways: [
      'Semantic search, fact lookup, and relationship reasoning are three different queries. One store answers one of them well and fails the other two.',
      'Ranking is a weighted sum of relevance, importance, and recency. Those weights are a product decision, so a memory row should show why it ranked.',
      'Scope (user, session, agent) is a permission gate. Mixing scopes is how an agent tells one user about another user\'s work.',
      'Contradicted facts get invalidated, not deleted. The old value stays queryable, which is what makes "no, I moved" a reversible correction.',
    ],
    terms: [
      { term: 'Hybrid memory', meaning: 'Vector, KV, and graph stores written in parallel and fused at retrieval behind one search call.' },
      { term: 'Fact extraction', meaning: 'The LLM step that breaks raw text into entity, relation, and fact tuples before any store is written.' },
      { term: 'Fusion scoring', meaning: 'The weighted sum of relevance, importance, and recency that produces the single ranked result list.' },
      { term: 'Scope', meaning: 'The namespace on a memory record (user, session, or agent) that decides who is allowed to retrieve it.' },
      { term: 'Temporal invalidation', meaning: 'Marking a contradicted record invalid while keeping it queryable as of an earlier time.' },
      { term: 'Embedding drift', meaning: 'Vector retrieval quality decaying as the corpus grows, fixed by re-embedding heavily used records.' },
    ],
    demoCaption:
      'Move the recency weight and watch the ranked list reorder. A chat agent wants the top result to be what you said an hour ago; a compliance agent wants the policy you signed in 2024. Same store, same query, different product.',
    demo: {
      archetype: 'slider-map',
      subject: 'search("where does the user live?")',
      sliderLabel: 'w_recency (recency weight in the fusion score)',
      outputLabel: 'Rank 1 result returned to the model',
      badCaption:
        'Reading the top result as "the most relevant match" hides the fact that relevance was one of three terms. A record can win on freshness alone, and the user sees a confident answer with no signal that a higher-relevance record lost by a tuning constant.',
      goodCaption:
        'Show the score components on the row and the ranking becomes debuggable: 0.81 relevance, 0.30 importance, 0.95 recency. Now a wrong recall points at a weight to change instead of at the model.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'agent memory needs three stores because users ask three different questions.',
        body:
          'agent memory needs three stores because users ask three different questions.\n\n"what did we discuss last week" -> vector\n"what is their phone number" -> KV\n"which customers share a billing entity" -> graph\n\nMem0 writes all three on add() and fuses them on search(). one store is wrong for two thirds of the traffic.',
      },
      {
        kind: 'X · design angle',
        hook: 'your memory list is not sorted by relevance.',
        body:
          'your memory list is not sorted by relevance.\n\nit is sorted by w_relevance * relevance + w_importance * importance + w_recency * recency.\n\nyou pick those weights. chat agents lean recency, compliance agents lean importance.\n\nput the three components on the row. otherwise a bad recall is unfixable, because nobody can see which term won.',
      },
      {
        kind: 'X · one-liner',
        hook: 'contradicted memory should be invalidated, never deleted.',
        body:
          'contradicted memory should be invalidated, never deleted.\n\n"user lives in Berlin" -> "user lives in Lisbon" keeps both edges, one marked invalid.\n\nso "what was true in March" is still answerable, and "no, I moved" is a reversible correction instead of a destructive write.',
      },
    ],
    source: {
      label: 'Full lesson: 14.09 09-hybrid-memory-mem0',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/14-agent-engineering/09-hybrid-memory-mem0',
    },
  },
  {
    id: 'p14-10-voyager',
    phase: 'Phase 14 · Agent Engineering',
    part: 'Part 2 · Memory and skills',
    index: '14.10',
    title: 'Skill libraries: memory for how, not what',
    oneLiner:
      'Voyager stored each learned capability as executable code, retrievable by description and composable with other skills. Every skill system you use in 2026, including the one in your editor, is that architecture.',
    readTime: '~8 min read',
    diagram: '/lessons/p14-10.svg',
    diagramCaption:
      'The Voyager loop: a curriculum proposes a task, the library retrieves similar skills, the agent composes and runs, and environment feedback folds back into the next version.',
    whyItMatters:
      'A skill library is a component library for agent behaviour, and it inherits the same problems: naming, discovery, versioning, and duplicates. Retrieval is similarity over descriptions, so the description is the API surface, which means a badly written one is an availability bug rather than a copy nit. Versioning is the harder UI problem. When a child skill is refined to v2, every parent pinned to v1 keeps the old behaviour, so your skill browser needs a dependency column and a "what breaks if I refine this" state. Otherwise the agent quietly regresses and no one can point at the commit.',
    sections: [
      {
        heading: 'The problem: agents that rebuild themselves every session',
        body: 'An agent with no procedural memory does three things wrong. It wastes tokens, because every task re-elicits the same reasoning from scratch. It loses progress, because a correction learned in session A never transfers to session B. And it fails at long-horizon composition, because complex tasks need capability hierarchies and a one-shot prompt cannot express one.\n\nRemembering facts (14.07 through 14.09) does not fix this. Knowing that the user prefers Postgres is not the same as knowing how to run the migration.',
      },
      {
        heading: 'The move: make the action space code',
        body: 'Most agents emit primitive commands. Voyager (Wang et al., arXiv 2305.16291, TMLR 2024) emits functions. A skill is a named async function composed from sub-skills: craftIronPickaxe calls mineIron, mineStick, placeCraftingTable, then craft. It is stored keyed on its description and embedding, and retrieved as a program rather than as a prompt.\n\nThat is the whole trick. Code is temporally extended, composable, and inspectable in a way a paragraph of instructions is not. This is exactly the shape a 2026 Claude Agent SDK skill takes: a name, a description, code, and instructions loaded on demand.',
      },
      {
        heading: 'Three components and one loop',
        body: 'Automatic curriculum: a curiosity-driven proposer picks the next task from the current skill set and environment state, aiming just above current capability. Skill library: successful tasks become new skills, retrieved by query-to-description similarity. Iterative prompting: on failure the agent gets execution errors, environment feedback, and self-verification output, then rewrites.\n\nThe refinement loop returns one of three signals per run: success, error with stack trace, or self-verification failure. Each rewrites the skill. It is Self-Refine with the environment as the verifier instead of the model.',
      },
      {
        heading: 'What it bought and what transfers',
        body: 'The Minecraft evaluation reported 3.3x more unique items, 8.5x faster stone tools, 6.4x faster iron tools, and 2.3x longer map traversal against baselines. Those numbers are Minecraft-specific and should not be quoted as general speedups. The pattern is what transfers.\n\nIn production it becomes Claude Agent SDK skills, skillkit for cross-agent skill management, and domain libraries: SQL skills for data agents, Terraform skills for infra agents. The retrieval-over-a-code-surface move is also what MCP resources implement, scoped to the current task.',
      },
      {
        heading: 'Where a skill library rots',
        body: 'Skill library rot: the same capability gets registered ten times with slightly different descriptions, so retrieval returns near-duplicates and the agent picks arbitrarily. Dedupe on write.\n\nComposed-skill drift: a parent depends on a child that was refined, and the parent pinned to v1 does not magically pick up v3. Version skills explicitly and make the pin visible.\n\nRetrieval quality: vector search over descriptions degrades past a few hundred skills. Supplement with tag filters and hard constraints like category equals tooling, which is a facet in your browser UI, not a prompt tweak.',
      },
    ],
    takeaways: [
      'Semantic memory stores what is true. A skill library stores how to do it, and only one of those survives a session boundary as behaviour.',
      'Skills are retrieved by similarity over their descriptions, so the description is the API surface and a vague one makes the skill unfindable.',
      'A refined child does not upgrade a pinned parent. Version skills and surface the dependency, or you get silent behavioural regressions.',
      'Past a few hundred skills, pure vector retrieval degrades. Tag filters and hard constraints are the facets your skill browser needs.',
    ],
    terms: [
      { term: 'Skill', meaning: 'A named chunk of executable code plus a description, stored so it can be retrieved by similarity.' },
      { term: 'Skill library', meaning: 'The persistent, searchable, composable store of learned capabilities an agent draws on across sessions.' },
      { term: 'Automatic curriculum', meaning: 'A proposer that picks the next task just above current capability, based on the existing skill set.' },
      { term: 'Composition', meaning: 'Skills invoking other skills, resolved by topological sort of the dependency graph before execution.' },
      { term: 'Iterative refinement', meaning: 'Rewriting a skill using execution errors, environment feedback, and self-verification as context.' },
      { term: 'Action-space-as-code', meaning: 'Emitting functions rather than primitive commands, so one action can span many environment steps.' },
    ],
    demoCaption:
      'The failure signal decides whether the next version of a skill is better or just different. Step through what the agent gets back after a run and note that only two of the three signals point at a specific line to change.',
    demo: {
      archetype: 'sequence',
      subject: 'One refinement round',
      badLabel: 'Prompt-only retry',
      goodLabel: 'Voyager refinement loop',
      badSequence: [
        'agent writes the skill',
        'run fails',
        'agent is told "that did not work"',
        'agent rewrites from the same prompt',
        'new failure, no information gained',
      ],
      goodSequence: [
        'agent writes the skill',
        'skill runs against the environment',
        'signal returns: success, error with stack trace, or self-verification failure',
        'signal is fed back as context, not as a vibe',
        'skill is rewritten and version-bumped to v2',
        'parents pinned to v1 keep the old behaviour',
      ],
      badCaption:
        'Retrying against the same prompt with "that failed" adds no information, so the second attempt is a different guess rather than a better one. This is the loop most retry buttons actually ship.',
      goodCaption:
        'A stack trace or a verification failure names the line to change, which is why the environment has to be the verifier. The version bump is the other half: refinement without versioning silently rewrites behaviour that other skills depend on.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'Voyager made the action space code instead of commands.',
        body:
          'Voyager made the action space code instead of commands.\n\na skill is a named function, composed from sub-skills, stored keyed on its description, retrieved as a program.\n\nthat is the architecture behind every agent skill system shipping in 2026, including the ones in your editor. the paper was 2023.',
      },
      {
        kind: 'X · design angle',
        hook: 'in a skill library, the description is the API.',
        body:
          'in a skill library, the description is the API.\n\nretrieval is similarity over descriptions. a vague description means the agent never finds the skill, which reads to the user as a capability that does not exist.\n\nthat makes naming an availability problem, not a copy problem. same as a component library. same failure mode too.',
      },
      {
        kind: 'X · one-liner',
        hook: '"remember my preferences" and "remember how to do this" are different memory systems.',
        body:
          '"remember my preferences" and "remember how to do this" are different memory systems.\n\nfacts go in a vector store. procedures go in a versioned skill library with dependencies.\n\nmost products build the first, promise the second, and ship an agent that relearns your workflow every morning.',
      },
    ],
    source: {
      label: 'Full lesson: 14.10 10-skill-libraries-voyager',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/14-agent-engineering/10-skill-libraries-voyager',
    },
  },
  {
    id: 'p14-34-repo-memory',
    phase: 'Phase 14 · Agent Engineering',
    part: 'Part 2 · Memory and skills',
    index: '14.34',
    title: 'Repo memory: state the next session can actually read',
    oneLiner:
      'Chat history is volatile, the repo is durable. Put agent state in schema-validated JSON files written atomically, and the next session, the next agent, and the reviewer all read the same source of truth.',
    readTime: '~8 min read',
    whyItMatters:
      'This is the one memory tier a designer can see in a diff, which makes it the only one that reviews well. agent_state.json is a rendered surface: active task, touched files, assumptions, open blockers, next action. That list is a resume screen, and the schema is its type definition, so a required field is an empty state you must design rather than a runtime crash. The failure to design for is a refused write: schema validation rejects the agent\'s update and the run must surface which field broke and stop, because a half-written state file is worse than no file at all.',
    sections: [
      {
        heading: 'The problem: the next session starts blind',
        body: 'The agent finishes. The chat closes. A new session opens and asks where to start. The model says "let me check the files," reads stale notes, and re-does work that was already complete. Or it rewrites a finished file, because nothing told it the file was finished.\n\nThe fix is to stop treating the transcript as the record. State lives in JSON files in the repo, written under a schema, persisted atomically, and diff-friendly in code review. Chat is a transient feed. The repo is the system of record.',
      },
      {
        heading: 'What belongs in repo memory',
        body: 'In: active task id, files touched this session, assumptions the agent made, open blockers, next action. Out: raw chat transcripts, token-level reasoning traces, "the user seemed frustrated," sampled completions, vendor-specific model ids.\n\nThe test is durability. Would this be useful three months from now during a CI rerun? If yes it goes in the repo. If no it is telemetry. That single question settles most arguments about what the state file should contain, and it keeps the file small enough that a human will actually read the diff.',
      },
      {
        heading: 'Schema first, or every writer invents a shape',
        body: 'JSON Schema is the contract. Without it every agent invents new fields, every reviewer learns a new shape, and every CI script special-cases past versions. With it a bad write is a refused write.\n\nThe schema covers required keys, allowed status values, forbidden values such as null for arrays, pattern constraints (task ids match T-\\d{3,}), and a schema_version field for migrations. When the manager loads a file at a version it cannot migrate, it refuses to read rather than guessing, and a migration script ships next to every schema bump.',
      },
      {
        heading: 'Atomic writes are not optional',
        body: 'Write to a tempfile in the same directory as the target, fsync, then os.replace over the target, which is an atomic rename on POSIX and Windows both. A half-written state file is worse than no file, because it resumes wrong instead of resuming not at all.\n\nA March 2026 Hive bug report documents the failure exactly: state.json written with write_text() and exceptions caught and silenced, so sessions resumed against corrupt state with no signal. Silent is the operative word. The corruption was recoverable, the missing error surface was not.',
      },
      {
        heading: 'Idempotency, artifacts, and event sourcing',
        body: 'Three patterns turn the minimum into something a multi-agent monorepo survives. Idempotency keys: log every tool call id to pending_calls.jsonl before execution, and on retry skip the call and use the cached result. Safe for reads, essential for emails, inserts, and uploads.\n\nSeparate large artifacts: keep CSVs and transcripts as files and store only the path in state, so checkpoints stay small. And event sourcing: append every mutation to state.events.jsonl, snapshot periodically, resume by reading the snapshot then replaying later events. The same shape Postgres uses for its WAL.',
      },
    ],
    takeaways: [
      'The durability test settles what goes in state: useful in a CI rerun three months out means repo, otherwise it is telemetry.',
      'The schema is a type definition for a resume screen. A required field is an empty state to design, not a crash to catch.',
      'Tempfile, fsync, atomic rename. A partially written state file resumes wrong, which is worse than not resuming at all.',
      'A refused write needs a visible error naming the field. Silenced exceptions are how corrupt state ships without a signal.',
    ],
    terms: [
      { term: 'Repo memory', meaning: 'Agent state stored in tracked, schema-validated files in the repository rather than in chat history.' },
      { term: 'Schema-first', meaning: 'Defining the state contract before any writer exists, so drifting writes are refused rather than absorbed.' },
      { term: 'Atomic write', meaning: 'Write to a tempfile, fsync, then rename over the target so a partial failure cannot corrupt the file.' },
      { term: 'Idempotency key', meaning: 'A logged tool-call id checked on retry so a crashed run does not send the same email twice.' },
      { term: 'Event sourcing', meaning: 'Appending every mutation to a log and snapshotting periodically, so decisions can be replayed verbatim.' },
      { term: 'System of record', meaning: 'The artifact the workbench treats as authoritative when the transcript and the file disagree.' },
    ],
    demoCaption:
      'agent_state.json is the resume screen for the next session, so its fields are UI, not plumbing. Compare a state file written as free-form notes against one written under a schema, and read them the way the next agent will: as the only thing it knows.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'agent_state.json at session end',
      badLabel: 'Free-form notes',
      goodLabel: 'Schema-validated state',
      badLines: [
        '"notes": "did the auth refactor, mostly works"',
        '"todo": "check the tests? maybe the login one"',
        '"files": null',
        '"status": "kinda done"',
        'written with write_text(), exception swallowed',
      ],
      goodLines: [
        '"schema_version": 2',
        '"active_task": "T-104"  (pattern T-\\d{3,})',
        '"status": "blocked"  (enum: todo | active | blocked | done)',
        '"touched_files": ["src/auth/session.ts", "src/auth/refresh.ts"]',
        '"assumptions": ["refresh tokens rotate on every use"]',
        '"blockers": ["needs the staging DB seed"]',
        '"next_action": "run the refresh-rotation test"',
        'written via tempfile, fsync, atomic rename',
      ],
      badCaption:
        '"Kinda done" and a null array give the next session nothing to branch on, so it re-reads the repo and guesses. The swallowed exception is the sharper problem: nobody learns the write failed until the resume goes wrong.',
      goodCaption:
        'Enums, patterns, and required fields make the file a contract the next agent can branch on and a reviewer can read in a diff. Each field is also a slot in the resume screen, including the blocker that has to be shown before work continues.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'chat history is volatile. the repo is durable.',
        body:
          'chat history is volatile. the repo is durable.\n\nput agent state in schema-validated JSON in the repo: active task, touched files, assumptions, blockers, next action.\n\ntempfile, fsync, atomic rename. a half-written state file resumes wrong, which is worse than not resuming.',
      },
      {
        kind: 'X · design angle',
        hook: 'agent_state.json is a resume screen with a type definition.',
        body:
          'agent_state.json is a resume screen with a type definition.\n\nactive task. files touched. assumptions made. open blockers. next action.\n\nthat is not plumbing, that is the screen the next session opens with. every required field in the schema is an empty state somebody has to design.',
      },
      {
        kind: 'X · one-liner',
        hook: 'the durability test: would this matter in a CI rerun three months from now?',
        body:
          'the durability test: would this matter in a CI rerun three months from now?\n\nyes -> repo memory, tracked, schema-validated, diff-friendly.\nno -> telemetry.\n\n"the user seemed frustrated" is telemetry. "blocked on the staging DB seed" is state.',
      },
    ],
    source: {
      label: 'Full lesson: 14.34 34-repo-memory-and-state',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/14-agent-engineering/34-repo-memory-and-state',
    },
  },
];
