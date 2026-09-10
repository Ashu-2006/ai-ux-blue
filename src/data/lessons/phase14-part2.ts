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
      'The context window is RAM, an external store is disk, and the agent pages between them with tool calls. MemGPT named the pattern in 2023, and every production memory system since is a variant of it.',
    readTime: '~10 min read',
    diagram: '/lessons/p14-07.svg',
    diagramCaption:
      'Main context as RAM, external archival store as disk, and the memory tool call as the page fault that moves a record between them.',
    whyItMatters:
      'Paging is invisible until it fails, and when it fails the user sees a product that forgot. That makes it a UI problem: your transcript needs a state for "this answer came from archival memory, not from what you just said," with the session and turn it came from, because a recalled fact with no provenance is indistinguishable from a hallucination. The memory tool call is also a latency event the user did not ask for, so the streaming surface needs a retrieval affordance between the send and the first token. And every archival write is a row someone will eventually want to read, edit, or delete.',
    learningObjectives: [
      'Explain the OS analogy MemGPT restates: main context as RAM, external store as disk, memory tool call as page fault.',
      'Show how a 4k-window agent with external memory can outrank a 128k full-context baseline on long-horizon recall.',
      'List the five canonical memory tools and name which tier each one touches: core, archival, or conversation history.',
      'Trace the interrupt pattern: how a memory tool call pauses the loop and splices a result into the next turn.',
      'Identify memory rot, memory poisoning, and citation loss, and name one fix for each.',
      'Distinguish MemGPT\'s two-tier design from the four memory types (working, episodic, semantic, procedural) it only partly covers.',
    ],
    sections: [
      {
        heading: 'The problem: a bigger window does not buy memory',
        body: 'Three failures recur in production agents. Overflow: multi-turn conversations and tool-heavy trajectories cross the window, and everything past the cutoff is gone. Dilution: even inside the window, stuffing irrelevant context spreads attention thin, and frontier models still degrade on long inputs. Persistence: a new session opens with an empty window, so the agent cannot say "remember when you asked me to."\n\nScale does not rescue this. Mem0\'s 2025 paper (arXiv:2504.19413) measured 128k-window baselines still missing long-horizon facts that a 4k-window agent with an external store catches. Capacity and recall are different problems, and a bigger context window only buys you the first one.',
      },
      {
        heading: 'The move: restate OS virtual memory',
        body: 'MemGPT (Packer et al., arXiv:2310.08560, v2 Feb 2024) maps context management onto operating-system virtual memory. RAM becomes main context, the prompt the model always sees. Disk becomes external context, unbounded and searchable. A page fault becomes a memory tool call, one of memory.search, memory.read, or memory.write. The OS kernel becomes the agent\'s own control loop.\n\nThe agent runs an ordinary ReAct loop. The only addition is one class of tools that moves data across the boundary between the two tiers. Nothing about the model changes, and nothing about the base loop changes either. The intelligence sits in the control flow, which is why this pattern outlived the paper that introduced it.',
      },
      {
        heading: 'Two tiers, and what the paper actually tested',
        body: 'Main context is a fixed-size prompt holding the current task, always visible to the model. External context is unbounded, read when relevant, written when facts emerge. The 2023 paper evaluated the split on two tasks that sit past a normal window: document analysis over 100k tokens, and multi-session chat with memory that had to persist across days rather than turns.\n\nBoth tasks fail for a plain context-stuffing agent and succeed for the two-tier one, because the fix is not more tokens in the prompt, it is a rule for deciding what leaves the prompt and how to get it back. That rule is the whole contribution.',
      },
      {
        heading: 'The tool surface you will render',
        body: 'The canonical five are core_memory_append(section, text), core_memory_replace(section, old, new), archival_memory_insert(text), archival_memory_search(query, top_k), and conversation_search(query). Two write to a pinned section of the prompt, two touch the external store, one scans past turns.\n\nThis is a schema, not a metaphor, and it is the schema your memory inspector renders. A replace is a diff, an insert is a new row, a search is a ranked list with scores. Each of those wants a different component: a diff view, an append log, a results list. Users mostly reach for the replace one, because that is where they correct a wrong remembered fact, and it is the one interface most memory UIs in 2026 still do not ship.',
      },
      {
        heading: 'Memory as interrupt',
        body: 'Mid-conversation the agent invokes a memory tool, the runtime executes it, and the result splices into the next assistant turn as a fresh observation. It is a Unix read() syscall: the process blocks, bytes come back, the process continues.\n\nDesign consequence: the pause is real and it is unlabeled by default. If the agent stalls 300 to 600ms fetching three archival records, the user reads that as slowness rather than work. A small "checking what I know about this" state, retired the instant tokens start flowing, converts dead air into evidence that the agent is doing something specific instead of just being slow.',
      },
      {
        heading: 'Where the paper ends and production begins',
        body: 'In September 2024 the MemGPT research project became Letta, and the two-tier design grew a third tier: core, recall, archival (14.08). Letta also replaced the send_message and heartbeat pattern with native reasoning emitted on its own channel, and added sleep-time agents that consolidate memory off the critical path (14.08).\n\nThe MemGPT paper stays the 2026 foundation even where production runs Letta, Mem0, or a custom store. OpenAI\'s Assistants and Responses APIs manage memory through threads and files, and the Claude Agent SDK carries long-term memory through skills and a session store. Different operational shapes, same underlying page-fault pattern.',
      },
      {
        heading: 'The shape of agent memory: four types, five implementations',
        body: 'Paging solves capacity. It does not decide what to store. Four memory types recur across production systems: working memory (what matters right now, the in-context tier), episodic memory (what happened, past turns replayable by session and turn id), semantic memory (what is true, deduplicated facts about the user and domain), and procedural memory (how to do this, learned routines and preferences).\n\nOpen-source systems each pick one point of attack. Letta pages working memory in and out of a fixed budget. Zep stores episodic memory as a temporal knowledge graph with validity intervals. Mem0 (14.09) extracts and dedupes semantic memory across vector, KV, and graph stores. LangMem extracts semantic and procedural facts in the background. agentmemory captures sessions and consolidates them into typed records.',
      },
      {
        heading: 'Where it rots and how it gets poisoned',
        body: 'Memory rot: writes accumulate faster than reads, so retrieval drowns in stale facts. Fix with periodic consolidation (14.08) or explicit invalidation (14.09). Citation loss: the agent recalls "the user asked me to ship X" and cannot cite which turn, so store session and turn ids on every archival write.\n\nMemory poisoning is the sharp one. External memory is retrieved text. If attacker-controlled content lands in a memory note, the agent re-ingests it next session as trusted context, the same prompt-injection risk restated with a persistence layer underneath it. Any surface that lets third-party content reach a write path, a pasted email, a scraped page, needs a trust label carried through to display.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p14-07-inline-tools.svg',
        alt: 'The five MemGPT memory tools mapped to tiers',
        caption: 'Two tools write core memory, two touch archival, one scans conversation history: five calls, three different components to render.',
        diagramBrief: 'Cream paper background, black ink, one blue accent. Three columns labeled "Core (pinned prompt)", "Archival (external store)", "Conversation history". Under Core: two pill shapes labeled core_memory_append and core_memory_replace. Under Archival: two pills labeled archival_memory_insert and archival_memory_search. Under Conversation history: one pill labeled conversation_search. A thin arrow from each pill down to a small icon suggesting its UI: a diff icon under replace, a list-with-scores icon under search, a log icon under insert and append. Caption band underneath: "Same five tools, three different components."',
      },
      {
        src: '/lessons/p14-07-inline-taxonomy.svg',
        alt: 'Four memory types and the systems that implement each',
        caption: 'Working, episodic, semantic, and procedural memory are different questions, and 2026 open-source systems each answer a different one.',
        diagramBrief: 'Cream paper, black ink, one accent color. A 4-row table. Row labels down the left: Working, Episodic, Semantic, Procedural. Middle column: the question each answers (what matters now / what happened / what is true / how do I do this). Right column: the named system that leads on it (Letta / Zep / Mem0 / LangMem), with agentmemory noted spanning episodic and semantic with a small bracket. Style matches other inline tables in the app: thin rules, no gridlines, generous row height.',
      },
    ],
    takeaways: [
      'Main context is RAM, the archival store is disk, and a memory tool call is the page fault. Capacity is a control-flow problem, not a window-size problem.',
      'A 4k-window agent with external memory beat 128k full-context baselines on long-horizon recall. Buying a bigger window is not buying memory.',
      'Every archival write needs session and turn ids attached, or the agent recalls facts it cannot cite and the UI cannot show provenance.',
      'A memory tool call is an unlabeled pause in the stream. Give retrieval its own state or users read it as latency.',
    ],
    terms: [
      { term: 'Virtual context', gloss: '"unlimited memory"', meaning: 'A fixed prompt tier plus an unbounded searchable tier, with tools moving records between them.' },
      { term: 'Main context', gloss: '"working memory"', meaning: 'The prompt itself: fixed size, always visible to the model, the only thing it truly sees.' },
      { term: 'Archival memory', gloss: '"long-term store"', meaning: 'External persistent storage retrieved on demand by search rather than held in the prompt.' },
      { term: 'Core memory', gloss: '"persistent prompt section"', meaning: 'Named sections pinned inside the main context that the agent can edit but never evict.' },
      { term: 'Memory interrupt', gloss: '"memory page fault"', meaning: 'The agent pauses, the runtime fetches, and the result splices into the next turn as an observation.' },
      { term: 'Memory rot', gloss: '"stale facts"', meaning: 'Writes accumulate faster than reads, so retrieval drowns in outdated content.' },
      { term: 'Memory poisoning', gloss: '"injected persistent note"', meaning: 'Attacker-controlled text stored as a memory record and re-ingested as trusted context later.' },
      { term: 'Episodic memory', gloss: '"conversation history"', meaning: 'Past turns and trajectories stored with session and turn references, replayable on demand.' },
      { term: 'Semantic memory', gloss: '"facts about the user"', meaning: 'Deduplicated, updated facts about the user, the domain, or the world.' },
      { term: 'Procedural memory', gloss: '"how the agent behaves"', meaning: 'Learned routines, preferences, and rules that steer future behavior rather than recall.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'MainContext caps at 2,000 tokens and currently holds 1,850 tokens across 40 messages. At roughly 30 tokens per average message, how many more messages fit before core_memory eviction triggers?' },
      { level: 'medium', prompt: 'A user asks "what did I tell you about my database preference, and when?" Write the order of tool calls you would issue from the five-tool surface, and what each call is expected to return.' },
      { level: 'hard', prompt: 'Design a citation schema (fields, types) that archival_memory_insert must populate on every write so a later archival_memory_search result can be traced to an exact session and turn.' },
      { level: 'design', prompt: 'Sketch the retrieval affordance for the 300 to 600ms pause during an archival_memory_search call. What does the user see between send and first token, and what does it say if the search comes back empty?' },
    ],
    furtherReading: [
      { label: 'Packer et al., MemGPT, arXiv:2310.08560', url: 'https://arxiv.org/abs/2310.08560', why: 'The original paper. Read the OS-analogy section and the two evaluation tasks.' },
      { label: 'Letta, Memory Blocks blog', url: 'https://www.letta.com/blog/memory-blocks', why: 'How the two-tier design in this lesson grew a third tier in production.' },
      { label: 'Anthropic, Effective context engineering for AI agents', url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents', why: 'Treats context as a budget, the framing behind the retrieval affordance exercise.' },
      { label: 'Chhikara et al., Mem0, arXiv:2504.19413', url: 'https://arxiv.org/abs/2504.19413', why: 'The paper that measured 4k plus external memory beating 128k full context.' },
      { label: 'Zep, getzep/zep', url: 'https://github.com/getzep/zep', why: 'A temporal knowledge graph implementation of the episodic memory type from section 7.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Memory provenance checklist',
      body: '- Does every archival write carry a session id and a turn id?\n- Can the UI show which store answered: core, archival, or conversation search?\n- Is there a labeled state for the retrieval pause, distinct from ordinary latency?\n- Is there an edit or delete affordance on any recalled fact the agent surfaces?\n- Is third-party content entering a memory write path flagged untrusted before it is stored?',
    },
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
      'Memory stops being a blob once you give it typed, editable, capped blocks. It stops costing latency once a second agent consolidates them while the user is not waiting.',
    readTime: '~10 min read',
    diagram: '/lessons/p14-08.svg',
    diagramCaption:
      'Three tiers (core, recall, archival), typed blocks pinned inside core, and a sleep-time agent rewriting them off the critical path.',
    whyItMatters:
      'A block is the first memory primitive that is actually renderable. It has an id, a label, a value, a character limit, and a description, which is a form schema: a labeled textarea with a live character counter and a save that the agent also writes to. That is the memory-editing surface users keep asking for. Sleep-time compute then breaks a core UI assumption, because a background agent rewrites those blocks while nobody is looking. If the user opens the Human block tomorrow and the value changed, you owe them a version history and a diff, or your product silently edited the user\'s own facts.',
    learningObjectives: [
      'Name the three tiers Letta splits memory into (core, recall, archival) and what writes each one.',
      'Define a memory block by its five fields (id, label, value, limit, description) and explain why that shape renders as a form.',
      'Explain why sleep-time compute removes memory work from the latency path and what that buys in model choice.',
      'Diagnose block bloat, silent drift, and poisoned consolidation, and name the fix for each.',
      'Compare native reasoning (Letta V1) against the older send_message and heartbeat pattern.',
      'Design a version-history view for a memory block that a user can read as a diff.',
    ],
    sections: [
      {
        heading: 'The problem: two-tier memory left three gaps',
        body: 'MemGPT solved control flow and exposed what it did not solve. Latency: every memory operation sits on the critical path, so pruning, summarizing, and reconciling all happen while the user waits, and tail latency blows up. Memory rot: writes accumulate, contradicted facts stay, retrieval drowns.\n\nStructure loss is the third gap and the most design-relevant one. A flat archival store cannot express "the Human block is always in the prompt, the Persona block is always in the prompt, the Task block swaps per session." Everything sits in one undifferentiated bag of text, so the UI has no way to tell a pinned identity fact from a piece of searchable trivia.',
      },
      {
        heading: 'Three tiers instead of two',
        body: 'Letta, the platform the MemGPT project became in September 2024, splits memory into core, recall, and archival. Core is always visible inside the prompt, written by agent tool calls and by sleep-time rewrites. Recall is conversation history including the evicted tail, written automatically by turn logging. Archival is arbitrary facts spread across vector, KV, and graph stores.\n\nThe split matters because the three tiers carry different costs, different lifetimes, and different edit permissions. Collapsing them, the way the original two-tier design did, means the pinned identity facts and the searchable trivia end up living in the same place, with the same retrieval path and the same retention rules.',
      },
      {
        heading: 'A block is a typed object, not a paragraph',
        body: 'The MemGPT paper defined two blocks: a Human block holding facts about the user (name, role, preferences, goals) and a Persona block holding the agent\'s self-concept (identity, tone, constraints). Letta generalizes to any block you declare: a Task block for the current goal, a Project block for codebase facts, a Safety block for hard constraints.\n\nEach block carries an id, a label, a value, a limit (a character cap), and a description that tells the model when to edit it. The tool surface is block_append, block_replace, block_read, and block_summarize. That last one exists because a cap forces a decision the moment a write would overflow it.',
      },
      {
        heading: 'Sleep-time compute: move the work off the path',
        body: 'Letta\'s 2025 addition runs a second agent in the background. It processes transcripts and codebase context, writes learned_context into shared blocks, and consolidates or invalidates archival records.\n\nThree properties fall out. No latency cost, because primary responses never wait on memory operations. A stronger model is allowed, because the sleep-time agent is not latency-constrained and can be the slow, expensive one. And a natural consolidation window, because dedup, summarization, and invalidating contradicted facts all happen when nobody is waiting on an answer. It is the shape of sleeping on a problem, restated as an architecture, and it is why the two agents can run entirely different models.',
      },
      {
        heading: 'Native reasoning replaces send_message and heartbeat',
        body: 'Letta V1 (letta_v1_agent, 2026) drops the older send_message and heartbeat pattern along with inline Thought: prefixes inside the prompt. In its place, native reasoning is emitted on its own channel, the same move OpenAI\'s Responses API and Anthropic\'s extended thinking made: reasoning that is structural rather than prompt-shaped, and encrypted across providers in production so it cannot be read back by the wrong caller.\n\nThe control loop underneath is still ReAct. What changed is where the thinking lives: no longer text competing for space in the same window as the Human and Persona blocks, but a parallel channel the UI can choose to show or hide.',
      },
      {
        heading: 'Where blocks break',
        body: 'Block bloat: unbounded block_append hits the character limit fast, so wire a summarizer before the write that would overflow the cap, not after. Silent drift: the sleep-time agent rewrites a block and the primary agent never notices, so version blocks and surface diffs in the trace. block_history(label) exists precisely so an operator can answer "why did the agent forget X."\n\nPoisoned consolidation: the sleep-time agent processes attacker-reachable content straight into core memory. Treat sleep-time agents as untrusted writers by default, and require review before anything they produce touches the Persona or Safety block.',
      },
      {
        heading: 'Where blocks show up outside Letta',
        body: 'The block shape is not exclusive to Letta. A Claude Agent SDK skill in 2026 is a named, versioned, retrievable object carrying a description, code, and instructions, loaded on demand, which is the same id-label-value-description shape wearing a different name (14.10). OpenAI\'s Assistants store persistent facts in threads rather than blocks, trading the explicit schema for a managed, opaque store.\n\nThe tradeoff is the one you make with any typed object versus a blob: a schema costs setup and buys renderability. If your memory UI cannot show a labeled section with a cap and a description, you are looking at a blob no matter what the vendor calls it.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p14-08-inline-tiers.svg',
        alt: 'Core, recall, and archival as three tiers with different writers',
        caption: 'Three tiers, three lifetimes, three sets of edit permissions, one prompt.',
        diagramBrief: 'Cream paper, black ink, one accent. Three horizontal bands stacked: top band "Core" (small, pinned, accent-highlighted, labeled "always in prompt"), middle band "Recall" (labeled "conversation history, auto-logged"), bottom band "Archival" (largest, labeled "vector + KV + graph, retrieved on demand"). Small icons on the right of each band showing who writes it: a wrench icon (agent tool call) on Core and Archival, a clock icon (automatic) on Recall.',
      },
      {
        src: '/lessons/p14-08-inline-block-schema.svg',
        alt: 'A memory block rendered as a form',
        caption: 'id, label, value, limit, and description is a form schema, which is why a block is renderable and a blob is not.',
        diagramBrief: 'Cream paper, black ink, one accent. Draw a labeled textarea mockup: a header row "Human block", a text area with sample content, a character counter bottom right reading "178 / 400", and a small caption line below reading "description: facts about the user, edited by tool calls and sleep-time rewrites". Style like a real form component, not an abstract diagram.',
      },
    ],
    takeaways: [
      'A block has an id, label, value, limit, and description. That is a form schema, so memory editing is a build problem, not a research problem.',
      'Core, recall, and archival have different lifetimes and different edit permissions. One store for all three is why memory UIs feel like a text dump.',
      'Sleep-time compute takes memory work off the critical path, which also means a slower and stronger model can do it.',
      'A background agent rewriting user facts without a diff is silent drift. Version blocks and expose the history, or "why did it forget" is unanswerable.',
    ],
    terms: [
      { term: 'Memory block', gloss: '"editable prompt section"', meaning: 'A typed, persistent, model-editable section of core memory with a label and a character cap.' },
      { term: 'Human block', gloss: '"user memory"', meaning: 'The pinned block holding facts about the user: name, role, preferences, goals.' },
      { term: 'Persona block', gloss: '"agent identity"', meaning: 'The pinned block holding the agent\'s self-concept, tone, and hard constraints.' },
      { term: 'Core memory', gloss: '"always-visible memory"', meaning: 'The tier written directly into the prompt, edited by tool calls and sleep-time rewrites.' },
      { term: 'Recall memory', gloss: '"chat history"', meaning: 'Conversation turns including the evicted tail, logged automatically rather than written by a tool call.' },
      { term: 'Archival memory', gloss: '"long-term store"', meaning: 'Facts spread across vector, KV, and graph stores, written and consolidated on demand.' },
      { term: 'Sleep-time compute', gloss: '"background memory work"', meaning: 'A second agent consolidating memory off the user-facing latency path.' },
      { term: 'Block limit', gloss: '"character cap"', meaning: 'The size ceiling on a block that forces summarization rather than unbounded growth.' },
      { term: 'Native reasoning', gloss: '"thinking channel"', meaning: 'Provider-level reasoning emitted on its own channel, not a Thought: prefix competing for prompt space.' },
      { term: 'Silent drift', gloss: '"the agent forgot"', meaning: 'A background rewrite changing a block\'s value with no diff surfaced to the user or the primary agent.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A Human block has a 400-character limit and currently holds 380 characters. The agent needs to append a 45-character fact. What has to happen before the append succeeds?' },
      { level: 'medium', prompt: 'Sketch the four tool calls (block_append, block_replace, block_read, block_summarize) as a state diagram: which ones can run on the critical path and which are candidates for the sleep-time agent?' },
      { level: 'hard', prompt: 'Design block_history(label) end to end: what does one history entry need to store so an operator can answer "why did the agent forget X" without re-reading the whole transcript?' },
      { level: 'design', prompt: 'Design the Human block editing surface: a labeled textarea, a live character counter against the 400-char limit, and a save action the agent can also write to. What happens in the UI the moment a sleep-time rewrite lands while the user has the block open?' },
    ],
    furtherReading: [
      { label: 'Letta, Memory Blocks blog', url: 'https://www.letta.com/blog/memory-blocks', why: 'The block pattern in the platform\'s own words, with the field list this lesson builds on.' },
      { label: 'Letta, Sleep-time Compute blog', url: 'https://www.letta.com/blog/sleep-time-compute', why: 'Why consolidation moved off the critical path and what it buys in model choice.' },
      { label: 'Letta, Rearchitecting the Agent Loop', url: 'https://www.letta.com/blog/letta-v1-agent', why: 'The native-reasoning rewrite that replaced send_message and heartbeat.' },
      { label: 'Packer et al., MemGPT, arXiv:2310.08560', url: 'https://arxiv.org/abs/2310.08560', why: 'The two-tier origin this lesson\'s three-tier design is answering.' },
    ],
    shipIt: {
      kind: 'rubric',
      name: 'Memory block review rubric',
      body: '- Does every block declare id, label, value, limit, and description?\n- Is there a summarizer wired before any write that would overflow the cap?\n- Does the UI expose block_history so a version diff is one click away?\n- Are sleep-time writes to Persona or Safety gated behind a review step?\n- Can a user tell, from the interface alone, whether a block was last edited by them or by the sleep-time agent?',
    },
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
      'Three query classes, three stores, one fused ranking. A single-store memory is always wrong for two out of three questions a user is about to ask.',
    readTime: '~10 min read',
    diagram: '/lessons/p14-09.svg',
    diagramCaption:
      'One add() writes a fact to vector, KV, and graph in parallel; one search() fuses the three recall paths through a weighted relevance, importance, and recency score.',
    whyItMatters:
      'The retrieved list your UI renders is not sorted by relevance. It is sorted by a weighted sum of relevance, importance, and recency, and those weights are a product decision you own: recency-heavy for a chat agent, importance-heavy for a compliance agent. Two things follow. A memory row needs to show why it ranked, or nobody can debug a bad recall. And the scope field (user, session, agent) is a hard permission gate, not metadata. Mixing scopes without thinking is how a product tells Alice about Bob\'s project, and no ranking tweak recovers from that.',
    learningObjectives: [
      'Name the three query classes (semantic similarity, fact lookup, relationship reasoning) and which store answers each.',
      'Trace what happens on add() and search() across the vector, KV, and graph stores.',
      'Compute a fused rank from relevance, importance, and recency weights, and explain why it is a sum, not a hierarchy.',
      'Explain temporal invalidation and why a contradicted fact is marked invalid rather than deleted.',
      'Treat scope (user, session, agent) as a permission boundary, not just a metadata field.',
      'Diagnose embedding drift, KV schema creep, and graph explosion as three separate degradation modes.',
    ],
    sections: [
      {
        heading: 'The problem: one store is wrong for two thirds of the questions',
        body: 'Three query classes show up in the same session. Semantic similarity: "what did we discuss about agent drift last week?" Vector wins, KV and graph miss entirely. Fact lookup: "what is the user\'s phone number?" KV wins in O(1), vector is wasteful and graph is overkill. Relationship reasoning: "which customers share the same billing entity?" Graph wins, and the other two simply cannot answer.\n\nProduction agents issue all three query types in the same session, sometimes in the same turn. Pick one store and you are structurally wrong on the other two, no matter how well you tune it. The fix is not a better vector index, it is admitting you need three stores.',
      },
      {
        heading: 'The move: write three ways, read fused',
        body: 'Mem0 (Chhikara et al., arXiv:2504.19413, April 2025) puts all three behind one add/search surface. On add(text, user_id, metadata) an LLM step extracts candidate facts, then each fact is written to the vector store as an embedding, to the KV store keyed on (user_id, fact_type, entity), and to the graph as typed edges.\n\nOn search(query, user_id), vector returns top-k by cosine similarity, KV returns direct hits on the query-derived key, and graph returns the subgraph reachable from the query\'s entities. A scoring layer fuses the three result sets into one ranked list before anything reaches the model or the UI.',
      },
      {
        heading: 'Fusion scoring is the ranking you ship',
        body: 'score = w_relevance * relevance + w_importance * importance + w_recency * recency. Relevance is vector cosine, KV exact match, or graph path weight depending on which store produced the hit. Importance is tagged at write time or learned, because names, IDs, and policies matter more than small talk. Recency is exponential decay since the record was last written or read.\n\nIt is a weighted sum, not a hierarchy, and the weights are tuned per product. Recency dominates for voice and chat agents. Importance dominates for compliance agents. Relevance dominates for retrieval agents. Three products, three different rankings, same three inputs.',
      },
      {
        heading: 'Scope is a permission gate, not metadata',
        body: 'Every memory record picks one scope on write: user memory persists across sessions keyed on user_id, session memory persists within one thread, agent memory is per-instance state. Retrieval can query across scopes with per-scope weights, which is exactly where the boundary gets soft.\n\nTreat scope as a hard permission gate rather than a label. Mixing scopes without thinking is how a product tells Alice about Bob\'s project: not a ranking bug, a leak. No fusion-weight tweak recovers from that after the fact, because the record should never have been retrievable across the boundary in the first place.',
      },
      {
        heading: 'Temporal invalidation: contradiction without deletion',
        body: 'Mem0g adds a conflict detector. When a new fact contradicts an existing edge, the old edge is marked invalid rather than deleted. "User lives in Berlin" then "user lives in Lisbon" leaves both edges, one valid and one not, so a temporal query like "what was the user\'s city in March?" traverses the valid-at-time subgraph and answers correctly.\n\nSoft delete is a compliance behavior and a UX one. The wrong fact stays visible and reversible, which is what "no, I moved" needs to do in an interface: a correction, not a silent overwrite that erases the record something was ever different.',
      },
      {
        heading: 'The benchmark numbers',
        body: 'The 2025 paper reports LoCoMo 91.6 on long-form conversation memory, LongMemEval 93.4 on long-horizon episodic memory, and BEAM 1M 64.1 on the million-token benchmark. Full-context 128k, flat vector, and flat KV baselines all lose by ten points or more on each.\n\nBenchmarks alone do not justify a store choice, operational shape does: self-hosted versus managed, Postgres plus Qdrant plus Neo4j versus a single vendor API. But a ten-point-plus gap against three different single-store baselines is not a rounding error, and it is the number to cite when someone asks why a chat feature needs three databases instead of one.',
      },
      {
        heading: 'Where it degrades',
        body: 'Embedding drift: vector retrieval that looks right on the first hundred queries decays as the corpus grows, fixed by periodically re-embedding the most-used records rather than the whole store. KV schema creep: (user_id, fact_type, entity) looks simple until every team adds its own fact_type, fixed by auditing the type set on a fixed cadence.\n\nGraph explosion: one noisy extractor adds fifty edges per message, and the graph store stops being queryable at any reasonable latency. Cap writes per add() call and drop low-confidence edges before they land, rather than pruning the graph after it has already grown past the point anyone can read it.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p14-09-inline-three-queries.svg',
        alt: 'Three query classes routed to three stores',
        caption: 'Semantic similarity, fact lookup, and relationship reasoning are different questions, and one store answers exactly one of them well.',
        diagramBrief: 'Cream paper, black ink, one accent per store. Three rows, each: a query in quotes on the left ("what did we discuss last week", "what is their phone number", "which customers share a billing entity"), an arrow to the winning store on the right (Vector, KV, Graph), with the other two stores greyed out and marked with a small x.',
      },
      {
        src: '/lessons/p14-09-inline-fusion-row.svg',
        alt: 'A memory row showing the fused score breakdown',
        caption: 'Score is a weighted sum, so the row that shows relevance, importance, and recency separately is the row that is debuggable.',
        diagramBrief: 'Cream paper, black ink, one accent highlighting the winning term. A single result row mockup: left side the recalled fact text, right side three small labeled bars or numbers: "relevance 0.81", "importance 0.30", "recency 0.95", and below them the combined score "0.62". One bar (recency) has the accent color to show it is currently the dominant term.',
      },
    ],
    takeaways: [
      'Semantic search, fact lookup, and relationship reasoning are three different queries. One store answers one of them well and fails the other two.',
      'Ranking is a weighted sum of relevance, importance, and recency. Those weights are a product decision, so a memory row should show why it ranked.',
      'Scope (user, session, agent) is a permission gate. Mixing scopes is how an agent tells one user about another user\'s work.',
      'Contradicted facts get invalidated, not deleted. The old value stays queryable, which is what makes "no, I moved" a reversible correction.',
    ],
    terms: [
      { term: 'Hybrid memory', gloss: '"vector plus graph plus KV"', meaning: 'Vector, KV, and graph stores written in parallel and fused at retrieval behind one search call.' },
      { term: 'Fact extraction', gloss: '"memory ingestion"', meaning: 'The LLM step that breaks raw text into entity, relation, and fact tuples before any store is written.' },
      { term: 'Fusion scoring', gloss: '"relevance ranking"', meaning: 'The weighted sum of relevance, importance, and recency that produces the single ranked result list.' },
      { term: 'Scope', gloss: '"memory namespace"', meaning: 'The user, session, or agent boundary on a record that decides who is allowed to retrieve it.' },
      { term: 'Mem0g', gloss: '"memory graph"', meaning: 'Typed edges with temporal validity, used for relationship queries and conflict detection.' },
      { term: 'Temporal invalidation', gloss: '"soft delete"', meaning: 'Marking a contradicted record invalid while keeping it queryable as of an earlier time.' },
      { term: 'Embedding drift', gloss: '"retrieval rot"', meaning: 'Vector retrieval quality decaying as the corpus grows, fixed by re-embedding heavily used records.' },
      { term: 'KV schema creep', gloss: '"messy keys"', meaning: 'Every team inventing its own fact_type until the key space stops being auditable.' },
      { term: 'Graph explosion', gloss: '"too many edges"', meaning: 'A noisy extractor writing dozens of low-confidence edges per message until the graph is unqueryable.' },
      { term: 'Importance weight', gloss: '"what matters more"', meaning: 'A tagged or learned score that lets names, IDs, and policies outrank small talk regardless of recency.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'search("where does the user live?") returns three hits: relevance 0.81 / importance 0.30 / recency 0.45, relevance 0.40 / importance 0.20 / recency 0.95, relevance 0.55 / importance 0.90 / recency 0.10. With equal weights (0.33 each), which hit ranks first?' },
      { level: 'medium', prompt: 'A compliance agent needs importance to dominate recency by at least 3x. Propose a set of w_relevance, w_importance, w_recency that satisfies this and still sums to 1.' },
      { level: 'hard', prompt: 'Design the write path for a fact that arrives with no user_id, only a session_id. Which stores accept it, and what scope does it get on retrieval?' },
      { level: 'design', prompt: 'Design the memory row component: it must show the fused score plus its three components (relevance, importance, recency) so a wrong recall points at a weight to change instead of at the model. Sketch the layout in one sentence per element.' },
    ],
    furtherReading: [
      { label: 'Chhikara et al., Mem0, arXiv:2504.19413', url: 'https://arxiv.org/abs/2504.19413', why: 'The original paper: fusion scoring, Mem0g, and the LoCoMo, LongMemEval, and BEAM numbers.' },
      { label: 'Mem0 docs', url: 'https://docs.mem0.ai/platform/overview', why: 'The production API and the self-hosted versus managed tradeoff.' },
      { label: 'Packer et al., MemGPT, arXiv:2310.08560', url: 'https://arxiv.org/abs/2310.08560', why: 'The virtual-context predecessor this hybrid design answers.' },
      { label: 'Letta, Memory Blocks blog', url: 'https://www.letta.com/blog/memory-blocks', why: 'The three-tier sibling design, useful for comparing scope models.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Hybrid memory review checklist',
      body: '- Does every memory row expose its fused score plus the relevance, importance, and recency components?\n- Is scope (user, session, agent) enforced as a hard filter before ranking, not after?\n- Are contradicted facts invalidated rather than deleted, with the old value still queryable?\n- Is there a cap on edges written per add() call to prevent graph explosion?\n- Is there a recurring audit of the KV fact_type set?',
    },
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
    readTime: '~10 min read',
    diagram: '/lessons/p14-10.svg',
    diagramCaption:
      'The Voyager loop: a curriculum proposes a task, the library retrieves similar skills, the agent composes and runs, and environment feedback folds back into the next version.',
    whyItMatters:
      'A skill library is a component library for agent behaviour, and it inherits the same problems: naming, discovery, versioning, and duplicates. Retrieval is similarity over descriptions, so the description is the API surface, which means a badly written one is an availability bug rather than a copy nit. Versioning is the harder UI problem. When a child skill is refined to v2, every parent pinned to v1 keeps the old behaviour, so your skill browser needs a dependency column and a "what breaks if I refine this" state. Otherwise the agent quietly regresses and no one can point at the commit.',
    learningObjectives: [
      'Distinguish procedural memory (skill libraries) from semantic memory (facts) and explain why only one survives a session boundary as behavior.',
      'Name Voyager\'s three components (automatic curriculum, skill library, iterative prompting) and the role each plays.',
      'Explain why Voyager makes the action space code rather than primitive commands, and map that onto a 2026 Claude Agent SDK skill.',
      'Trace one refinement round: write, run, receive a signal (success, error, self-verification failure), rewrite, version-bump.',
      'Diagnose skill library rot, composed-skill drift, and retrieval degradation past a few hundred skills.',
      'Design a skill browser facet set for when vector retrieval alone stops being enough.',
    ],
    sections: [
      {
        heading: 'The problem: agents that rebuild themselves every session',
        body: 'An agent with no procedural memory does three things wrong. It wastes tokens, because every task re-elicits the same reasoning from scratch. It loses progress, because a correction learned in session A never transfers to session B. And it fails at long-horizon composition, because complex tasks need capability hierarchies, and a one-shot prompt cannot express one.\n\nRemembering facts (14.07 through 14.09) does not fix this. Knowing that the user prefers Postgres is not the same as knowing how to run the migration. One is a fact retrieved by similarity, the other is a procedure that has to compose correctly across several steps.',
      },
      {
        heading: 'The move: make the action space code',
        body: 'Most agents emit primitive commands. Voyager (Wang et al., arXiv:2305.16291, TMLR 2024) emits functions. A skill is a named async function composed from sub-skills: craftIronPickaxe calls mineIron, mineStick, placeCraftingTable, then craft. It is stored keyed on its description and embedding, and retrieved as a program rather than as a prompt.\n\nThat is the whole trick. Code is temporally extended, composable, and inspectable in a way a paragraph of instructions is not. This is exactly the shape a 2026 Claude Agent SDK skill takes: a name, a description, code, and instructions loaded on demand rather than kept resident in every prompt.',
      },
      {
        heading: 'Three components and one loop',
        body: 'Automatic curriculum: a curiosity-driven proposer picks the next task from the current skill set and environment state, aiming just above current capability. Skill library: successful tasks become new skills, retrieved by query-to-description similarity. Iterative prompting: on failure the agent gets execution errors, environment feedback, and self-verification output, then rewrites.\n\nThe refinement loop returns one of three signals per run: success, error with stack trace, or self-verification failure. Each rewrites the skill differently, because a stack trace names a line and a verification failure names a claim. It is Self-Refine (Madaan et al., arXiv:2303.17651) with the environment as the verifier instead of the model grading itself.',
      },
      {
        heading: 'The description is the API surface',
        body: 'Retrieval runs on similarity over the skill\'s stored description, not over its code. A vague description means the agent never finds the skill it needs, which reads to the user as a capability that simply does not exist, not as a search problem.\n\nThat makes naming an availability problem, the same failure mode a badly named component in a design system produces: the thing exists, nobody can find it, so it gets rebuilt slightly differently under a new name. Two skills that do almost the same thing, discoverable under different queries, is how a library quietly doubles in size without doubling in capability.',
      },
      {
        heading: 'What it bought, and what transfers',
        body: 'The Minecraft evaluation reported 3.3x more unique items, 8.5x faster stone tools, 6.4x faster iron tools, and 2.3x longer map traversal against baselines. Those numbers are Minecraft-specific and should not be quoted as a general speedup claim.\n\nThe pattern is what transfers. In production it becomes Claude Agent SDK skills, skillkit for cross-agent skill management across 32-plus coding agents, and domain libraries: SQL skills for data agents, Terraform skills for infra agents. The retrieval-over-a-code-surface move is also what MCP resources implement, scoped to whatever task is currently running.',
      },
      {
        heading: 'Where a skill library rots',
        body: 'Skill library rot: the same capability gets registered ten times with slightly different descriptions, so retrieval returns near-duplicates and the agent picks one arbitrarily. Dedupe on write, not after the library has already grown past the point anyone audits it.\n\nComposed-skill drift is the sharper one: a parent depends on a child that gets refined, and the parent pinned to v1 does not magically pick up v3. Version skills explicitly, and make the pin visible in whatever surface lists a skill\'s dependencies, or the agent quietly regresses and nobody can point at the commit that caused it.',
      },
      {
        heading: 'Retrieval degrades before you expect it to',
        body: 'Vector search over descriptions works well at a few dozen skills and degrades past a few hundred, the same curve any embedding-based search hits once the corpus gets crowded with near-neighbors. Supplement with tag filters and hard constraints, category equals tooling, rather than trusting similarity alone to narrow the field.\n\nThat is a facet in your skill browser, not a prompt tweak: a filter row above the search box, the same progressive-disclosure move a component library uses once a flat list of fifty components stops being scannable. The fix is UI, not a bigger embedding model.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p14-10-inline-loop.svg',
        alt: 'The Voyager loop: curriculum, library, refinement',
        caption: 'A curriculum proposes, the library retrieves, the agent composes and runs, and the environment feedback rewrites the next version.',
        diagramBrief: 'Cream paper, black ink, one accent. A circular loop diagram with four nodes: "curriculum proposes task" -> "library retrieves similar skills" -> "agent composes and runs" -> "environment returns success / error / verification failure" -> back to curriculum. Arrows curve clockwise. One accent-colored arrow from the feedback node looping back into the library node labeled "version bump".',
      },
      {
        src: '/lessons/p14-10-inline-composition.svg',
        alt: 'Skill composition as a dependency graph, with a pinned version',
        caption: 'A parent pinned to a child version does not silently pick up a refinement, which is what version pinning is for.',
        diagramBrief: 'Cream paper, black ink, one accent. A small dependency graph: top node "craftIronPickaxe (parent)" with arrows down to three child nodes "mineIron", "mineStick", "placeCraftingTable". One child node "mineIron" shown twice: "mineIron@v1 (pinned, in use)" in accent color and a greyed "mineIron@v3 (refined, not adopted)" off to the side with a dotted line, not connected to the parent.',
      },
    ],
    takeaways: [
      'Semantic memory stores what is true. A skill library stores how to do it, and only one of those survives a session boundary as behaviour.',
      'Skills are retrieved by similarity over their descriptions, so the description is the API surface and a vague one makes the skill unfindable.',
      'A refined child does not upgrade a pinned parent. Version skills and surface the dependency, or you get silent behavioural regressions.',
      'Past a few hundred skills, pure vector retrieval degrades. Tag filters and hard constraints are the facets your skill browser needs.',
    ],
    terms: [
      { term: 'Skill', gloss: '"reusable capability"', meaning: 'A named chunk of executable code plus a description, stored so it can be retrieved by similarity.' },
      { term: 'Skill library', gloss: '"agent memory of how-to"', meaning: 'The persistent, searchable, composable store of learned capabilities an agent draws on across sessions.' },
      { term: 'Automatic curriculum', gloss: '"task proposer"', meaning: 'A bottom-up generator that picks the next task just above current capability, based on the existing skill set.' },
      { term: 'Composition', gloss: '"skill DAG"', meaning: 'Skills invoking other skills, resolved by topological sort of the dependency graph before execution.' },
      { term: 'Iterative refinement', gloss: '"self-correcting loop"', meaning: 'Rewriting a skill using execution errors, environment feedback, and self-verification as context.' },
      { term: 'Action-space-as-code', gloss: '"programmatic actions"', meaning: 'Emitting functions rather than primitive commands, so one action can span many environment steps.' },
      { term: 'Dedup on write', gloss: '"skill collapse"', meaning: 'Near-duplicate skill descriptions collapsing to one canonical skill instead of registering separately.' },
      { term: 'Version pinning', gloss: '"locking a dependency"', meaning: 'A parent skill fixing which version of a child skill it composes, so a refinement does not silently propagate.' },
      { term: 'Self-Refine', gloss: '"the model checks its own work"', meaning: 'A loop where the model critiques and rewrites its own output, here grounded by environment feedback instead of self-critique alone.' },
      { term: 'Retrieval facet', gloss: '"a filter"', meaning: 'A tag or hard constraint, like category, that narrows a skill search once similarity alone stops being precise.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A skill library has 40 skills. A new task query returns 3 skills above the similarity threshold. Which of Voyager\'s three components decided whether this task got attempted at all?' },
      { level: 'medium', prompt: 'Skill A depends on skill B pinned at v1. B gets refined to v3 after fixing a bug that also affects A. Write the two options for what happens next, and name which one is silent drift.' },
      { level: 'hard', prompt: 'Design a dependency-cycle detector for compose(): skill A depends on B which depends on A. Should this error or warn, and what does the agent do differently in each case?' },
      { level: 'design', prompt: 'Design the skill browser facet row for a library past 300 skills: what filters sit above the search box, and what does an empty result state say when a filter plus a query returns zero skills?' },
    ],
    furtherReading: [
      { label: 'Wang et al., Voyager, arXiv:2305.16291', url: 'https://arxiv.org/abs/2305.16291', why: 'The original skill-library paper: the three components and the Minecraft numbers.' },
      { label: 'Claude Agent SDK overview', url: 'https://platform.claude.com/docs/en/agent-sdk/overview', why: 'The 2026 productization of the same skill shape: name, description, code, instructions.' },
      { label: 'Anthropic, Building agents with the Claude Agent SDK', url: 'https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk', why: 'Skills and subagents in production, past the toy library in the source lesson.' },
      { label: 'Madaan et al., Self-Refine, arXiv:2303.17651', url: 'https://arxiv.org/abs/2303.17651', why: 'The refinement loop Voyager runs with the environment standing in as the verifier.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Skill library audit checklist',
      body: '- Is every skill deduped on write, or can two near-identical descriptions both register?\n- Do composed skills pin an explicit version of every dependency they call?\n- Is there a visible dependency column showing what breaks if a skill is refined?\n- Past a few hundred skills, are tag filters available alongside similarity search?\n- Does a failed run return success, error, or self-verification failure as three distinct signals, not one generic retry?',
    },
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
    readTime: '~10 min read',
    whyItMatters:
      'This is the one memory tier a designer can see in a diff, which makes it the only one that reviews well. agent_state.json is a rendered surface: active task, touched files, assumptions, open blockers, next action. That list is a resume screen, and the schema is its type definition, so a required field is an empty state you must design rather than a runtime crash. The failure to design for is a refused write: schema validation rejects the agent\'s update and the run must surface which field broke and stop, because a half-written state file is worse than no file at all.',
    learningObjectives: [
      'Apply the durability test (useful in a CI rerun three months out?) to decide what belongs in repo memory versus telemetry.',
      'Write JSON Schema constraints (required keys, enums, patterns, schema_version) that turn a bad write into a refused write.',
      'Implement an atomic write (tempfile, fsync, rename) and explain why a half-written state file is worse than no file.',
      'Compare idempotency keys, artifact separation, and event sourcing as three patterns that harden a minimal state file for a multi-agent monorepo.',
      'Diagnose a real-world bug caused by a silenced exception on a non-atomic write, and name the fix.',
      'Design the empty and blocked states of agent_state.json as a resume screen, not a debug log.',
    ],
    sections: [
      {
        heading: 'The problem: the next session starts blind',
        body: 'The agent finishes. The chat closes. A new session opens and asks where to start. The model says "let me check the files," reads stale notes, and re-does work that was already complete. Or it rewrites a finished file, because nothing told it the file was finished.\n\nThe fix is to stop treating the transcript as the record. State lives in JSON files in the repo, written under a schema, persisted atomically, and diff-friendly in code review. Chat is a transient feed. The repo is the system of record, and it is the only tier of agent memory a designer can review the same way they review any other pull request.',
      },
      {
        heading: 'What belongs in repo memory',
        body: 'In: active task id, files touched this session, assumptions the agent made, open blockers, next action. Out: raw chat transcripts, token-level reasoning traces, "the user seemed frustrated," sampled completions, vendor-specific model ids.\n\nThe test is durability. Would this be useful three months from now during a CI rerun? If yes it goes in the repo. If no it is telemetry. That single question settles most arguments about what the state file should contain, and it keeps the file small enough that a human will actually read the diff instead of skimming past it.',
      },
      {
        heading: 'Schema first, or every writer invents a shape',
        body: 'JSON Schema is the contract. Without it every agent invents new fields, every reviewer learns a new shape, and every CI script special-cases past versions. With it a bad write is a refused write.\n\nThe schema covers required keys, allowed status values, forbidden values such as null for arrays, pattern constraints (task ids match T-\\d{3,}), and a schema_version field for migrations. A required field in that schema is not paperwork, it is an empty state you are choosing to design: what the resume screen shows before next_action has ever been set.',
      },
      {
        heading: 'Migrations: refuse to load rather than guess',
        body: 'The schema_version field is what makes the contract survive change. When the manager loads a file at a version it cannot migrate, it refuses to read rather than guessing at what an unfamiliar shape means, and a migration script ships next to every schema bump so the refusal is temporary, not permanent.\n\nThis is the same discipline a database migration enforces, just scoped to a JSON file instead of a table. Skip it and the failure mode is silent: an old field gets misread as a new one, the resume screen shows the wrong blocker, and nobody notices until the agent acts on stale information.',
      },
      {
        heading: 'Atomic writes are not optional',
        body: 'Write to a tempfile in the same directory as the target, fsync, then os.replace over the target, which is an atomic rename on POSIX and Windows both. A half-written state file is worse than no file at all, because it resumes wrong instead of resuming not at all.\n\nA March 2026 Hive bug report documents the failure exactly: state.json written with write_text() and exceptions caught and silenced, so sessions resumed against corrupt state with no signal. Silent is the operative word. The corruption was recoverable, the missing error surface was not, and the fix cost less than the schema did.',
      },
      {
        heading: 'Idempotency, artifacts, and event sourcing',
        body: 'Three patterns turn the minimum into something a multi-agent monorepo survives. Idempotency keys: log every tool call id to pending_calls.jsonl before execution, and on retry skip the call and use the cached result. Safe for reads, essential for emails, inserts, and uploads where a retried call is a duplicate side effect, not a no-op.\n\nSeparate large artifacts: keep CSVs and transcripts as files and store only the path in state, so checkpoints stay small. And event sourcing: append every mutation to state.events.jsonl, snapshot periodically, resume by reading the snapshot then replaying later events. The same shape Postgres uses for its write-ahead log.',
      },
      {
        heading: 'Where the pattern shows up beyond the toy',
        body: 'LangGraph checkpointers persist the same shape of state to SQLite or Postgres instead of a flat file; the schema this lesson teaches is what you reach for by hand when a checkpointer dies mid-run. Letta memory blocks (14.08) apply the identical discipline scoped to a long-running persona instead of a single session. OpenAI\'s Agents SDK session store is pluggable and schema-aware, with a local-file backend that is structurally this lesson\'s state manager.\n\nThree vendors, three storage backends, one contract: a typed, versioned file a human and a machine can both read after the chat window has closed.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p14-34-inline-durability.svg',
        alt: 'The durability test as a decision diagram',
        caption: 'One question sorts everything an agent session produces into repo memory or telemetry.',
        diagramBrief: 'Cream paper, black ink, one accent. A single diamond decision node labeled "useful in a CI rerun three months out?" with two arrows: YES goes to a folder icon labeled "repo memory (schema-validated JSON)", NO goes to a stream icon labeled "telemetry (logs, transcripts)". Below each branch, 2-3 example items in small text: repo side lists active task id, blockers, next action; telemetry side lists raw transcript, sampled completions, "user seemed frustrated".',
      },
      {
        src: '/lessons/p14-34-inline-atomic.svg',
        alt: 'Atomic write sequence: tempfile, fsync, rename',
        caption: 'Three steps stand between a state file and the corruption a silenced exception hides.',
        diagramBrief: 'Cream paper, black ink, one accent color highlighting the rename step. Horizontal sequence of 4 boxes left to right: "write to tempfile in same directory", "fsync", "os.replace (atomic rename)", "state.json updated". Under the sequence, a crossed-out alternate path in lighter ink: "write_text() directly -> exception silenced -> corrupt file" with a small warning glyph.',
      },
    ],
    takeaways: [
      'The durability test settles what goes in state: useful in a CI rerun three months out means repo, otherwise it is telemetry.',
      'The schema is a type definition for a resume screen. A required field is an empty state to design, not a crash to catch.',
      'Tempfile, fsync, atomic rename. A partially written state file resumes wrong, which is worse than not resuming at all.',
      'A refused write needs a visible error naming the field. Silenced exceptions are how corrupt state ships without a signal.',
    ],
    terms: [
      { term: 'Repo memory', gloss: '"notes file"', meaning: 'Agent state stored in tracked, schema-validated files in the repository rather than in chat history.' },
      { term: 'Schema-first', gloss: '"validate inputs"', meaning: 'Defining the state contract before any writer exists, so a drifting write is refused rather than absorbed.' },
      { term: 'Atomic write', gloss: '"just rename"', meaning: 'Write to a tempfile, fsync, then rename over the target, so a partial failure cannot corrupt the file.' },
      { term: 'Migration', gloss: '"schema bump"', meaning: 'A script that turns state written under version N into valid state under version N+1.' },
      { term: 'System of record', gloss: '"source of truth"', meaning: 'The artifact the workbench treats as authoritative when the transcript and the file disagree.' },
      { term: 'Idempotency key', gloss: '"a logged call id"', meaning: 'A tool-call id checked on retry so a crashed run does not repeat a non-reversible side effect.' },
      { term: 'Event sourcing', gloss: '"a mutation log"', meaning: 'Appending every state change to a log and snapshotting periodically, so decisions can be replayed verbatim.' },
      { term: 'Schema version', gloss: '"a version number"', meaning: 'The field that lets a state manager refuse to load a file shape it does not know how to migrate.' },
      { term: 'Durability test', gloss: '"is this worth keeping"', meaning: 'Asking whether a piece of state would matter in a CI rerun three months out, to decide repo versus telemetry.' },
      { term: 'Resume screen', gloss: '"where the agent left off"', meaning: 'The rendered view of agent_state.json a session opens with: active task, blockers, next action.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A state file has status: "kinda done" and files: null. List every schema rule from this lesson that rejects this write.' },
      { level: 'medium', prompt: 'Write the schema_version migration that renames blockers to risks going from v1 to v2. What does the manager do if it loads a v1 file with no migration script present?' },
      { level: 'hard', prompt: 'Two agents write to the same state file with a 50ms race. Walk through what atomic tempfile-and-rename does at each step and why the loser\'s write is never partially visible.' },
      { level: 'design', prompt: 'Design the resume screen rendering of agent_state.json: which of the five required fields (active task, touched files, assumptions, blockers, next action) gets top billing, and what does the blocked status look like before the user can dismiss it?' },
    ],
    furtherReading: [
      { label: 'JSON Schema specification', url: 'https://json-schema.org/specification.html', why: 'The contract vocabulary this lesson\'s schema rules (required, enum, pattern) are drawn from.' },
      { label: 'LangGraph checkpointers', url: 'https://langchain-ai.github.io/langgraph/concepts/persistence/', why: 'The same state discipline implemented against SQLite or Postgres instead of a flat file.' },
      { label: 'Letta memory blocks', url: 'https://docs.letta.com/concepts/memory', why: 'The sibling pattern from 14.08, scoped to a persona instead of a session.' },
      { label: 'Hive Issue 6263, non-atomic state.json writes silently ignored', url: 'https://github.com/aden-hive/hive/issues/6263', why: 'The real bug report behind the silenced-exception failure mode in this lesson.' },
      { label: 'Microsoft Agent Framework, Compaction', url: 'https://learn.microsoft.com/en-us/agent-framework/agents/conversations/compaction', why: 'A vendor checkpoint manager solving the same durability problem at scale.' },
    ],
    shipIt: {
      kind: 'snippet',
      name: 'Atomic state write',
      body: 'import os\nimport tempfile\n\ndef atomic_write(path: str, data: bytes) -> None:\n    directory = os.path.dirname(path) or \'.\'\n    fd, tmp_path = tempfile.mkstemp(dir=directory)\n    try:\n        with os.fdopen(fd, \'wb\') as f:\n            f.write(data)\n            f.flush()\n            os.fsync(f.fileno())\n        os.replace(tmp_path, path)\n    except Exception:\n        os.unlink(tmp_path)\n        raise',
    },
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
