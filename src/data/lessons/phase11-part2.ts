import type { Lesson } from '@/lib/lessons';

// Phase 11 · Part 2 · Retrieval and tuning (lessons 11.06-11.10)
export const phase11Part2: Lesson[] = [
  {
    id: 'p11-06-rag',
    phase: 'Phase 11 · LLM Engineering',
    part: 'Part 2 · Retrieval and tuning',
    index: '11.06',
    title: 'RAG: giving the model documents it never trained on',
    oneLiner:
      'A model cannot know what it never read. RAG searches your documents at question time, pastes the best passages into the prompt, and lets the model answer from them. It is the most deployed pattern in production AI.',
    readTime: '~8 min read',
    whyItMatters:
      'Retrieval changes the object your component binds to: not a string, but a claim plus the chunks it came from, each with a score, a document id, and a date. That is a real payload, so citation chips, a source drawer, and a stale-document badge become props rather than decoration. The timing is the gift. Retrieval finishes in 50 to 200ms and generation takes 500 to 3,000, so sources can render roughly ten times before the answer streams in, which turns the wait into evidence the user reads. Below threshold, you finally have an honest empty state instead of a confident guess.',
    sections: [
      {
        heading: 'The problem: the model was not there',
        body: 'A customer asks about the enterprise refund window. The real answer, 60 days with pro-rated refunds, sits in a 200-page internal wiki. The model answers with a plausible generic SaaS policy instead, because it cannot know what it was not trained on.\n\nFine-tuning is one fix and a bad one here. A training run costs somewhere between a thousand and a hundred thousand dollars, the model goes stale the moment a document changes, and you cannot trace an answer back to a source. Acquire a product line next month and you pay again.',
      },
      {
        heading: 'The move: retrieve, then generate',
        body: 'RAG leaves the weights alone and changes the context instead. Four steps, every time: take the query, search a document store for relevant passages, paste those passages into the prompt above the question, generate.\n\nThe economics flip completely. Per query it costs roughly one to ten cents in embedding plus generation. Re-indexing a changed document takes minutes. You can show exactly which passages were retrieved, so an answer is auditable. And the documents stay in your store rather than being baked into somebody\'s weights.',
      },
      {
        heading: 'Chunking is the decision that quietly sets quality',
        body: 'A 50-page PDF makes a terrible single embedding because it covers dozens of topics. So documents get split into chunks, each embedded separately, and chunk size matters more than teams expect.\n\nToo small (64 to 128 tokens) and a chunk loses its referent: "it increased 15 percent last quarter" means nothing alone. Too large (2048 plus) and relevance gets diluted, so a search for revenue returns a chunk that is 10 percent revenue and 90 percent headcount. The production sweet spot is 256 to 512 tokens with about 50 tokens of overlap so a sentence never gets cut at an unlucky boundary.',
      },
      {
        heading: 'Embeddings, cosine, and the store',
        body: 'An embedding model turns text into a dense vector where similar meanings land near each other. "How do I reset my password?" and "I need to change my password" produce nearly identical vectors despite sharing almost no words. Similarity is measured with cosine, the angle between the two vectors, which ignores magnitude and so handles documents of different lengths gracefully. When someone says vector search, they almost always mean cosine.\n\nThe 2026 lineup runs from text-embedding-3-small and Gemini Embedding 2 through open-weight BGE-M3 and Qwen3-Embedding. The store is FAISS or Chroma for prototypes, pgvector or Pinecone or Qdrant in production, where approximate nearest neighbour indexes search millions of vectors in milliseconds.',
      },
      {
        heading: 'The numbers a designer should hold',
        body: 'Production RAG converges on a narrow band. Retrieve k = 5 to 10 chunks per query. Spend 2,500 to 5,000 tokens of retrieved content, inside a total prompt of roughly 8,000 to 16,000 tokens once system prompt, history, and query are counted. Retrieval takes 50 to 200ms; generation takes 500 to 3,000ms.\n\nThat split is the whole latency story. Search is effectively instant and the model is the wait, which is why a good RAG UI can show its sources long before it shows its answer.',
      },
    ],
    takeaways: [
      'RAG changes the context, fine-tuning changes the weights. For facts that move, always change the context.',
      'Chunk size is a product decision: 256 to 512 tokens with overlap is the band that keeps chunks both self-contained and focused.',
      'Retrieval is 50 to 200ms, generation is 500 to 3,000ms. Sources can render before the answer does.',
      'Every answer has a provenance trail. If the UI does not expose it, you threw away RAG\'s biggest advantage over fine-tuning.',
    ],
    terms: [
      { term: 'RAG', meaning: 'Retrieve relevant passages at query time and paste them into the prompt so the answer is grounded in them.' },
      { term: 'Embedding', meaning: 'A dense vector for a piece of text, positioned so similar meanings sit close together.' },
      { term: 'Chunk', meaning: 'A slice of a document (typically 256 to 512 tokens) that is embedded and retrieved as one unit.' },
      { term: 'Cosine similarity', meaning: 'The cosine of the angle between two vectors: 1 is identical direction, 0 is unrelated.' },
      { term: 'Top-k retrieval', meaning: 'Returning the k highest-scoring chunks for a query, usually 5 to 10.' },
      { term: 'Indexing', meaning: 'The offline pass that chunks, embeds, and stores documents so they can be searched later.' },
    ],
    demoCaption:
      'Step through the same question twice: once with the model answering from memory, once through the retrieve-then-generate pipeline. Watch where the source enters, and where it can be shown to the user.',
    demo: {
      archetype: 'sequence',
      subject: 'Question: "What is the refund window for enterprise plans?"',
      badLabel: 'No retrieval',
      goodLabel: 'RAG pipeline',
      badSequence: [
        'User asks the question',
        'Prompt goes to the model as-is',
        'Model draws on training data (wiki never seen)',
        'Answer: "typically 30 days for SaaS plans"',
        'Confident, generic, wrong, and unciteable',
      ],
      goodSequence: [
        'User asks the question',
        'Query embedded, vector store searched (50 to 200ms)',
        'Top 5 chunks returned, including the policy page',
        'Chunks pasted above the question in the prompt',
        'Answer: "60 days, pro-rated", with the source chunk attached',
      ],
      badCaption:
        'Nothing in this path can produce the number, so the model produces the most plausible number instead. The output looks identical in quality to a correct one, which is exactly what makes it dangerous: there is no signal in the response for the user to distrust.',
      goodCaption:
        'Retrieval inserts a step between question and generation, and that step leaves an artifact. The retrieved chunks are a real object you can render: citation chips, a source panel, a document date. It also gives you a genuine empty state, when nothing scores above threshold, the honest move is to say so rather than generate.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'RAG is not the model reading your docs. it is search, then paste.',
        body:
          'RAG is not the model reading your docs. it is search, then paste.\n\nquery in, vector search over your chunks, top 5 pasted above the question, model answers from those.\n\nthe weights never change. that is the whole point: re-index in minutes, cite the source, pay cents not thousands.',
      },
      {
        kind: 'X · design angle',
        hook: 'retrieval takes 50-200ms. generation takes 500-3000ms. design around that gap.',
        body:
          'retrieval takes 50-200ms. generation takes 500-3000ms. design around that gap.\n\nsources are ready roughly ten times before the answer is. showing them first is not a loading state, it is the most useful thing on screen: the user starts reading the evidence while the model is still writing.',
      },
      {
        kind: 'X · one-liner',
        hook: 'chunk size is a product decision that gets made in a config file.',
        body:
          'chunk size is a product decision that gets made in a config file.\n\n128 tokens: "it increased 15% last quarter". increased what?\n2048 tokens: 10% about revenue, 90% about headcount.\n256-512 with overlap: self-contained and focused.\n\nnobody in the design review knows this number exists.',
      },
    ],
    source: {
      label: 'Full lesson: 11.06 rag',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/11-llm-engineering/06-rag',
    },
  },
  {
    id: 'p11-07-advanced-rag',
    phase: 'Phase 11 · LLM Engineering',
    part: 'Part 2 · Retrieval and tuning',
    index: '11.07',
    title: 'Advanced RAG: why similar is not the same as relevant',
    oneLiner:
      'Basic RAG breaks on exact codes, ambiguous questions, and multi-hop reasoning, because vector similarity is not relevance. Hybrid search, reranking, and query transformation are the four fixes that separate a 10-document demo from a 10-million-document system.',
    readTime: '~8 min read',
    whyItMatters:
      'Each fix here spends latency you have to cover in the interface. Reranking adds a cross-encoder pass over 50 candidates before anything is displayable, so the result list cannot stream in progressively the way a plain vector search can. HyDE is worse: 500 to 2,000ms of a full model call before a single result exists, which is a skeleton with no rows in it, not a spinner over stale content. Hybrid search also changes the shape of the score you render, since RRF returns a fused rank rather than a 0-to-1 similarity, so any confidence chip bound to cosine breaks the day someone turns it on.',
    sections: [
      {
        heading: 'The problem: similarity is not relevance',
        body: 'Ask "what was revenue last quarter?" and semantic search returns chunks about revenue strategy, revenue projections, and the CFO on revenue growth. The chunk that actually holds the number says "Q3 earnings were $47.2M" and never uses the word revenue, so it loses.\n\nThree failure classes recur. Ambiguous queries, where every near-miss is semantically closer than the answer. Multi-hop questions ("which team improved satisfaction most?") where no single chunk contains the answer. And scale: at 2 million chunks, approximate search error alone pushes the right chunk out of the top 5.',
      },
      {
        heading: 'Fix one: hybrid search',
        body: 'Vector search understands meaning. "How do I cancel my subscription?" matches "steps to terminate your plan" despite zero shared words. It is bad at exact strings: error code E-4021 can read as noise to an embedding model.\n\nBM25 keyword search is the mirror image. E-4021 matches perfectly, "cancel my subscription" returns nothing. Hybrid runs both and merges with Reciprocal Rank Fusion: score each document as the sum of 1/(60 + rank) across the two lists. Because RRF uses ranks and not raw scores, the two systems\' incompatible score scales stop mattering. Production hybrid usually sits at 0.3 to 0.7 weighting between the two.',
      },
      {
        heading: 'Fix two: rerank the shortlist',
        body: 'Retrieval uses bi-encoders: query and document are embedded independently, so document vectors can be precomputed and cached, which is what makes searching millions of chunks viable.\n\nA reranker uses a cross-encoder: query and candidate go into the model together, so it can see fine-grained interactions and recognise that "what were Q3 earnings?" belongs with "$47.2M in Q3". The cost is 100x to 1000x slower per pair, so you cannot precompute anything. The standard shape is therefore two-stage: retrieve top 50 cheaply, rerank to top 5 carefully. Cohere Rerank 3.5, Voyage rerank-2.5, and open-weight bge-reranker-v2-m3 are the 2026 defaults.',
      },
      {
        heading: 'Fix three: repair the query before searching',
        body: 'Sometimes retrieval is not the problem. "What was that thing about the new policy change?" has no specific terms, so its embedding is vague and no system can rescue it.\n\nQuery rewriting has an LLM rephrase it into a real search query. HyDE goes further: generate a hypothetical answer to the question, embed that, and search for real documents similar to it. The intuition is that questions and answers have different linguistic shapes, so a fake answer lands closer to the real answer in embedding space than the question ever does. It costs one extra LLM call, 500 to 2,000ms before retrieval even starts.',
      },
      {
        heading: 'Fix four: decouple search granularity from context granularity',
        body: 'Standard chunking forces a bad trade: small chunks retrieve precisely, large chunks give the model enough context to answer. Parent-child chunking refuses the trade. Index 128-token children for matching, but return the 512-token parent to the prompt. The child wins the search, the parent carries the surrounding meaning.\n\nMetadata filtering does the complementary job: narrow before you search. "What changed in the security policy last month?" should only search security documents from the last 30 days, not the whole corpus where a two-year-old memo is happy to look semantically similar.',
      },
    ],
    takeaways: [
      'A chunk can be semantically similar and useless. Hybrid search exists because exact strings and meaning are different retrieval problems.',
      'Two-stage retrieval is the production shape: cheap recall to 50 candidates, expensive precision down to 5.',
      'HyDE buys retrieval quality with 500 to 2,000ms of latency before any result exists. That is a UX decision, not just an infra one.',
      'Parent-child chunking breaks the precision-versus-context trade: search small, send large.',
    ],
    terms: [
      { term: 'BM25', meaning: 'Classic keyword ranking that scores by term frequency, rarity, and document length, with diminishing returns per repeat.' },
      { term: 'Hybrid search', meaning: 'Running vector and keyword search in parallel and merging the two ranked lists.' },
      { term: 'Reciprocal Rank Fusion', meaning: 'Merging ranked lists by summing 1/(k + rank), typically k = 60, so raw score scales stop mattering.' },
      { term: 'Cross-encoder', meaning: 'A model that scores a query and document together, far more accurate and far too slow for full-corpus search.' },
      { term: 'HyDE', meaning: 'Generate a hypothetical answer, embed it, and retrieve documents similar to that instead of to the question.' },
      { term: 'Faithfulness', meaning: 'Whether the generated answer is actually supported by the retrieved chunks rather than invented.' },
    ],
    demoCaption:
      'One query, two retrieval stacks. Switch between them and read what comes back at rank 1. The failure is not that the model is weak, it is that the right chunk never reached it.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Query: "What was revenue last quarter?"',
      badLabel: 'Vector only',
      goodLabel: 'Hybrid + rerank',
      badLines: [
        '1. "Revenue strategy for the coming year" (0.89)',
        '2. "Revenue projections, FY26 planning" (0.87)',
        '3. "CFO commentary on revenue growth" (0.86)',
        'The chunk saying "Q3 earnings were $47.2M" ranks 23rd',
        'Model answers fluently from three chunks with no number in them',
      ],
      goodLines: [
        'BM25 catches "Q3" and "earnings" as exact terms',
        'RRF fuses both lists: 1/(60 + rank) summed per doc',
        'Top 50 candidates go to a cross-encoder reranker',
        '1. "Q3 earnings were $47.2M" (rerank score 0.94)',
        'Answer carries the number and the chunk it came from',
      ],
      badCaption:
        'Three chunks about the topic of revenue outrank the one chunk containing revenue. Embeddings measure aboutness, and aboutness is a weaker signal than the presence of the actual answer. The generation step cannot recover what retrieval never handed it.',
      goodCaption:
        'Keyword matching rescues the exact tokens an embedding smooths away, RRF merges the two rankings without needing their scores to be comparable, and the cross-encoder reads query and candidate together to make the final call. Recall first, precision second: retrieve 50, keep 5.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'vector search finds chunks about revenue. not the chunk with the revenue.',
        body:
          'vector search finds chunks about revenue. not the chunk with the revenue.\n\n"revenue strategy" scores 0.89. "Q3 earnings were $47.2M" ranks 23rd because it never says the word.\n\nfix: BM25 for the exact tokens, RRF to merge the rankings, cross-encoder to rerank the top 50 down to 5.',
      },
      {
        kind: 'X · design angle',
        hook: 'HyDE costs 500-2000ms before a single search result exists.',
        body:
          'HyDE costs 500-2000ms before a single search result exists.\n\nthe model writes a fake answer first, embeds that, and searches with it. retrieval quality goes up because answers sit near answers in embedding space.\n\nsomeone has to decide whether the better result is worth two seconds of nothing. that someone is design.',
      },
      {
        kind: 'X · one-liner',
        hook: 'small chunks retrieve well. big chunks answer well. pick both.',
        body:
          'small chunks retrieve well. big chunks answer well. pick both.\n\nparent-child chunking indexes 128-token children for matching and hands the 512-token parent to the prompt. the child wins the search, the parent carries the context.\n\nmost RAG trade-offs are only trade-offs until someone decouples the two jobs.',
      },
    ],
    source: {
      label: 'Full lesson: 11.07 advanced-rag',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/11-llm-engineering/07-advanced-rag',
    },
  },
  {
    id: 'p11-08-fine-tuning-lora',
    phase: 'Phase 11 · LLM Engineering',
    part: 'Part 2 · Retrieval and tuning',
    index: '11.08',
    title: 'LoRA and QLoRA: fine-tuning 1 percent of a model',
    oneLiner:
      'Full fine-tuning of an 8B model needs about 56GB of VRAM. LoRA trains under 1 percent of the parameters and matches full fine-tuning quality on most tasks. QLoRA squeezes the same job into 6GB, which is a consumer graphics card.',
    readTime: '~8 min read',
    whyItMatters:
      'Fine-tuning buys style, format, and consistent structure, the things a system prompt can only nudge, and it buys none of your facts. That boundary is the routing decision behind every "make it sound like us" request: voice is an adapter, freshness is retrieval, and a training run aimed at a retrieval problem ships a model that is stale by Friday. The shipping shape matters too. An adapter is a 10 to 100MB file hot-swapped over one loaded base, so a persona picker or a per-workspace tone setting is a request parameter, not a separate deployment, and 2 dollars of QLoRA on one consumer GPU makes that experiment affordable.',
    sections: [
      {
        heading: 'The problem: full fine-tuning does not fit',
        body: 'Llama 3 8B in fp16 is 16GB of weights. Training also needs gradients (another 16GB), Adam optimizer state for momentum and variance (32GB), plus activations. Roughly 56GB of VRAM, so an A100 80GB barely holds it and two of them cost 3 to 4 dollars an hour. Three epochs over 50,000 examples is 6 to 10 hours, so 30 to 40 dollars an experiment, and you will run ten before the hyperparameters are right.\n\nThere is a quality problem too. Updating every weight can degrade what the model already knew, which is catastrophic forgetting: better at your task, worse at everything else.',
      },
      {
        heading: 'The insight: the update is low rank',
        body: 'Microsoft\'s LoRA paper (2021) noticed that the weight change during fine-tuning has low intrinsic rank. You do not need all 16.7 million parameters of a 4096x4096 projection to express the useful part of the update. A rank 16 approximation carries it.\n\nSo freeze W and add a detour: instead of updating W, learn two skinny matrices whose product has the same shape. For rank 16 on that layer, (4096 x 16) + (16 x 4096) = 131,072 parameters against 16,777,216, which is 0.78 percent. B is initialised at zero so training starts from the model\'s original behaviour and departs gradually.',
      },
      {
        heading: 'The dials: rank, alpha, and target layers',
        body: 'Rank sets expressiveness. Rank 4 handles simple classification, 8 covers single-domain question answering, 16 is the workhorse for instruction following, 32 suits complex reasoning and code. Past 64 the returns vanish and the memory advantage starts to erode.\n\nAlpha scales how hard the adapter pushes: alpha equal to rank is 1x and conservative, alpha at twice rank is the common convention. Target layers matter more than people expect. Query plus value projections is the sweet spot at 9.4M trainable parameters on a 7B model. Adding every linear layer doubles the count to 37.7M for marginal gain.',
      },
      {
        heading: 'QLoRA: quantise the frozen half',
        body: 'QLoRA (2023) loads the frozen base in 4-bit and trains fp16 adapters on top. Weight memory for a 7B drops from 14GB to 3.5GB and training memory from 18GB to about 6GB, which turns an A100 requirement into an RTX 3090.\n\nThree pieces make it work. NF4 places its 16 quantisation levels at the quantiles of a normal distribution, which is where neural network weights actually live. Double quantisation compresses the quantisation constants themselves, 0.4GB down to 0.1GB. Paged optimizers spill Adam state to CPU RAM instead of crashing on an out-of-memory error.\n\nThe quality cost is small: full fine-tuning of Llama 2 7B scores 48.3 on MMLU, LoRA r=16 scores 47.9, QLoRA r=16 scores 47.5, and QLoRA r=64 gets back to 48.1.',
      },
      {
        heading: 'Adapters as artifacts, and when not to do this at all',
        body: 'A trained adapter is a 10 to 100MB file, not a model. Keep it separate and you can hot-swap a support adapter for a code adapter over one loaded base, which is how a single deployment serves many specialisations. Merge it (W plus the scaled product) and you get a normal model with no inference overhead but no swapping.\n\nThe order of operations matters more than the technique. First prompt engineering, which is free and takes minutes. Second RAG, when the model needs to know your data. Only third fine-tuning, for style, format, reasoning pattern, or distilling a big model into a small one. In 2026 the tooling is PEFT for control, Axolotl with Unsloth kernels for repeatable pipelines, LLaMA-Factory for zero-code runs. QLoRA r=16 on one RTX 4090 with Unsloth is about 2.5 hours and 2 dollars.',
      },
    ],
    takeaways: [
      'LoRA trains roughly 0.8 percent of the parameters and lands within 1 percent of full fine-tuning quality. The savings are not a compromise.',
      'Rank 8 to 16 covers most real tasks. Rank above 64 is almost never justified.',
      'QLoRA turns a data-centre job into a consumer-GPU job: 56GB to 6GB, about 2 dollars a run.',
      'Prompt first, RAG second, fine-tune third. Fine-tuning buys style and format, never fresh facts.',
    ],
    terms: [
      { term: 'LoRA', meaning: 'Freeze the base weights and train two small matrices whose product approximates the full weight update.' },
      { term: 'Rank (r)', meaning: 'The inner dimension of those two matrices; it sets how expressive the adaptation can be.' },
      { term: 'Alpha', meaning: 'A scaling factor on the adapter output, controlling how strongly it shifts the base behaviour.' },
      { term: 'QLoRA', meaning: 'LoRA on a 4-bit quantised base model, bringing 7B fine-tuning down to about 6GB of VRAM.' },
      { term: 'NF4', meaning: 'A 4-bit number format whose levels sit at normal-distribution quantiles, matched to how weights are distributed.' },
      { term: 'Catastrophic forgetting', meaning: 'Losing previously learned capabilities because fine-tuning overwrote the weights that held them.' },
    ],
    demoCaption:
      'Move the rank and watch trainable parameters, memory, and cost move with it. The curve is the reason r=16 shows up in almost every config file you will ever read.',
    demo: {
      archetype: 'slider-map',
      subject: 'Fine-tuning Llama 3 8B on 50,000 support tickets',
      sliderLabel: 'LoRA rank (r)',
      outputLabel: 'Trainable parameters, VRAM, and run cost',
      badLabel: 'Full fine-tune',
      goodLabel: 'LoRA / QLoRA',
      badCaption:
        'Every parameter updates, so memory is weights plus gradients plus Adam state plus activations: about 56GB for an 8B model, two A100s, 8 hours, 32 dollars an experiment. Ten experiments to tune hyperparameters and the bill lands at 400 dollars before anything ships, with catastrophic forgetting waiting at the end.',
      goodCaption:
        'Rank sets the size of the detour around the frozen weights, and the parameter count is linear in r while quality saturates fast. r=8 to 16 captures nearly all the adaptation for most tasks, so doubling rank past 32 buys fractions of a point. Quantise the frozen base to NF4 and the whole run fits on one consumer GPU: 6GB, 2.5 hours, about 2 dollars.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'fine-tuning an 8B model needs 56GB of VRAM. LoRA needs 6.',
        body:
          'fine-tuning an 8B model needs 56GB of VRAM. LoRA needs 6.\n\nthe trick: weight updates during fine-tuning are low rank. so freeze W and train two skinny matrices instead. rank 16 on a 4096x4096 layer = 131k params instead of 16.7M.\n\n0.78% of the parameters. within 1% of the quality.',
      },
      {
        kind: 'X · design angle',
        hook: 'fine-tuning buys voice. RAG buys facts. teams keep confusing the two.',
        body:
          'fine-tuning buys voice. RAG buys facts. teams keep confusing the two.\n\n"make it sound like us" is a fine-tune. "make it know our docs" is retrieval. paying for a training run to solve a retrieval problem gets you a model that is stale by friday.\n\nprompt first. RAG second. fine-tune third.',
      },
      {
        kind: 'X · one-liner',
        hook: 'a fine-tuned model is a 100MB file sitting on top of someone else\'s weights.',
        body:
          'a fine-tuned model is a 100MB file sitting on top of someone else\'s weights.\n\nadapters are hot-swappable. one base model in memory, a support adapter, a code adapter, a translation adapter, switched per request.\n\nyou are not shipping models any more. you are shipping deltas.',
      },
    ],
    source: {
      label: 'Full lesson: 11.08 fine-tuning-lora',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/11-llm-engineering/08-fine-tuning-lora',
    },
  },
  {
    id: 'p11-09-function-calling',
    phase: 'Phase 11 · LLM Engineering',
    part: 'Part 2 · Retrieval and tuning',
    index: '11.09',
    title: 'Function calling: the model asks, your code acts',
    oneLiner:
      'An LLM cannot check the weather, query a database, or send an email. It can only generate text. Function calling is the protocol where that text is structured JSON naming a function and its arguments, and your code does the acting.',
    readTime: '~8 min read',
    whyItMatters:
      'The model proposes and your code disposes, and that seam is where the permission gate physically goes: it is the last frame before something irreversible runs. So an agent component owns a real state machine, proposed then confirmed then executing then result or error, not a loading boolean, and a dry-run preview renders the parsed arguments before execution rather than after. Parallel calls collapse 5 to 10 sequential waits into one round trip, worth 60 to 80 percent of the latency, which is the difference between one progress affordance and a stack of them. Errors come back as structured tool results, so the taxonomy is retriable versus terminal, two components.',
    sections: [
      {
        heading: 'The problem: the model has no hands',
        body: 'A user asks for the weather in Tokyo right now. The model answers that it lacks real-time data but the season suggests around 15 degrees. That is a hallucination wearing a disclaimer.\n\nThe real answer needs an API call. The model cannot make one, your code can, and the missing piece is a structured way for the model to say "call the weather function with city equals Tokyo" that your code can parse and execute. Without that protocol an LLM is an encyclopedia. With it, it is an agent.',
      },
      {
        heading: 'The loop: five steps, one boundary',
        body: 'User message goes in. The model receives it along with tool definitions. Instead of text the model emits a tool call, a JSON object naming a function and its arguments. Your code executes that function and captures the result. The result goes back into the conversation, and the model produces its final answer using real data.\n\nThe critical line is between steps three and four. The model never executes anything. It only decides what should be called and with what. Everything that actually touches the world happens in code you wrote, which means every guardrail you want to exist has a natural home.',
      },
      {
        heading: 'The schema is a prompt in disguise',
        body: 'Each tool is a JSON Schema: a name, a description, typed parameters. The description fields do the real work, because the model reads them to decide when a tool applies. "Gets weather" produces measurably worse tool selection than "get current weather for a city, returns temperature in Celsius and conditions". Vague parameter descriptions produce malformed arguments.\n\nBy 2026 the three big providers have converged on near-identical JSON-Schema shapes: OpenAI passes tools with tool_calls back, Anthropic uses input_schema with tool_use content blocks, Google uses function_declarations. Llama 4 ships a native tools field matching OpenAI\'s shape. When a tool needs to be shared across hosts, MCP standardises the transport so one server serves any client.',
      },
      {
        heading: 'Control: auto, required, specific, and parallel',
        body: 'Tool choice decides how much freedom the model gets. Auto lets it answer directly when no tool is needed, which is right for "what is 2 plus 2". Required forces at least one call, which stops the model guessing when you already know a lookup is necessary. Naming a specific function is routing: upstream logic already decided, the model just fills arguments.\n\nParallel calling matters most for perceived speed. "Weather in Tokyo and New York" produces two tool calls in one turn, executed concurrently, one round trip instead of two. On agents making 5 to 10 calls per query this cuts latency 60 to 80 percent.',
      },
      {
        heading: 'The security rules are not optional',
        body: 'This is the most dangerous capability you can hand a model, because the model chooses what runs. Five rules hold. Never pass model-generated SQL to a database, parameterise and allowlist operations instead. Allowlist functions, never build a generic "execute any function by name" tool. Validate every argument against types and ranges before execution. Sanitise tool results, because whatever comes back tends to end up verbatim in the model\'s response, secrets included. And rate limit: 10 to 20 calls per conversation stops runaway loops.\n\nOne counterintuitive practice: return failures as structured tool results rather than throwing. Models self-correct well from "error: city not found, check spelling" and badly from silence.',
      },
    ],
    takeaways: [
      'The model proposes, your code executes. Every confirmation, permission, and undo affordance belongs at that seam.',
      'Tool descriptions are prompts. Rewriting a schema description is a real fix for wrong-tool selection.',
      'Parallel tool calls cut latency 60 to 80 percent on multi-tool queries. Serial execution is a design smell, not just an infra one.',
      'Return errors as structured tool results. Models recover from a clear error message and stall on a generic one.',
    ],
    terms: [
      { term: 'Function calling', meaning: 'The model emits structured JSON naming a function and arguments; your application executes it.' },
      { term: 'Tool definition', meaning: 'A JSON Schema describing a tool\'s name, purpose, and typed parameters, which the model reads to decide usage.' },
      { term: 'Tool choice', meaning: 'The setting that lets the model decide (auto), forces any tool (required), or names one specific tool.' },
      { term: 'Parallel calling', meaning: 'Multiple tool calls emitted in one turn and executed concurrently, collapsing round trips.' },
      { term: 'Agent loop', meaning: 'The cycle of model decides, code executes, result returns, repeated until the model can answer.' },
      { term: 'Tool poisoning', meaning: 'An attack where a tool result carries instructions that hijack the model, which is why results get sanitised.' },
    ],
    demoCaption:
      'The chat shows a sentence. Open it up and the turn is really a JSON object your code parsed, executed, and fed back. Everything you can govern lives in that hidden payload.',
    demo: {
      archetype: 'reveal',
      subject: 'User: "What is the weather in Tokyo and New York?"',
      badLabel: 'What the chat shows',
      goodLabel: 'What the turn actually contains',
      opaqueLabel: '"It is 18C and clear in Tokyo, 7C and raining in New York."',
      revealedLines: [
        'Model emits tool_use: get_weather { city: "Tokyo", units: "celsius" }',
        'Model emits tool_use: get_weather { city: "New York", units: "celsius" }',
        'Your code validates both argument sets against the schema',
        'Your code executes both concurrently: one round trip, not two',
        'tool_result blocks go back: { temp_c: 18, conditions: "clear" }',
        'Model reads real data and writes the sentence the user sees',
      ],
      badCaption:
        'Read as a single fluent reply, this looks like the model knowing something. Nothing in the surface tells the user which parts came from a live lookup and which came from the model, and nothing offers a place to intervene before a call runs.',
      goodCaption:
        'The turn is a negotiation: the model names functions and arguments, your code validates and executes them, results return as structured blocks. Two calls in one turn is parallel calling, which is where the 60 to 80 percent latency saving on multi-tool queries comes from. Every guardrail (allowlist, argument validation, rate limit, confirmation prompt) attaches to the execution step, not to the model.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'the model never calls your API. it writes a JSON object asking you to.',
        body:
          'the model never calls your API. it writes a JSON object asking you to.\n\nuser asks -> model emits { name: "get_weather", args: { city: "Tokyo" } } -> your code executes it -> result goes back into the conversation -> model answers with real data.\n\n"agent" is that loop. the model is the brain, your code is the hands.',
      },
      {
        kind: 'X · design angle',
        hook: 'the seam between "model proposes" and "code executes" is where your UI belongs.',
        body:
          'the seam between "model proposes" and "code executes" is where your UI belongs.\n\nthat is the last moment before something irreversible happens. confirmation, scope, undo, dry-run preview: all of it attaches there.\n\nan agent that acts without exposing that seam has not removed the risk. it has just hidden the checkpoint.',
      },
      {
        kind: 'X · one-liner',
        hook: 'tool descriptions are prompts. writers should be reviewing your JSON schemas.',
        body:
          'tool descriptions are prompts. writers should be reviewing your JSON schemas.\n\n"gets weather" picks the wrong tool more often than "get current weather for a city, returns temperature in celsius and conditions".\n\nsame model, same code, different copy. the fix was a sentence.',
      },
    ],
    source: {
      label: 'Full lesson: 11.09 function-calling',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/11-llm-engineering/09-function-calling',
    },
  },
  {
    id: 'p11-10-evaluation',
    phase: 'Phase 11 · LLM Engineering',
    part: 'Part 2 · Retrieval and tuning',
    index: '11.10',
    title: 'Evaluation: you cannot see a 5 percent regression by reading outputs',
    oneLiner:
      'Most teams ship LLM changes by reading ten outputs and saying it looks fine. That is hope, not engineering. Automated evals score outputs against rubrics, compute confidence intervals, and block the merge when quality drops.',
    readTime: '~8 min read',
    whyItMatters:
      'The criteria list is the spec for the surface, so it should read like the states you built: correctness, but also helpfulness, or you will ship a component whose refusal state fires 34 percent more often than intended and call it a safety win. Write the anchored rubric yourself, since naming observable behaviour per level cuts judge variance 30 to 40 percent and that is the same work as writing acceptance criteria. Sample size settles the arguments: at 50 cases the interval is 19 points wide, so nobody can tell 80 percent from 96. Use 200 as the floor for anything gating a merge.',
    sections: [
      {
        heading: 'The problem: nobody notices for eleven days',
        body: 'A support chatbot is working. Someone tightens the system prompt to reduce hallucinations, and it works: hallucination rate falls. Answer completeness also falls 34 percent, because the model now refuses anything it is not fully certain about. Nobody notices for 11 days. Self-service revenue drops and ticket volume spikes.\n\nThis is the default outcome of evaluating by vibes. LLM outputs are stochastic. A prompt that passes 5 test cases fails the 6th. A model scoring 92 percent on your benchmark scores 71 percent on the edge cases users actually send.',
      },
      {
        heading: 'Three methods, one workhorse',
        body: 'String metrics (BLEU, ROUGE, BERTScore) are free and instant, scoring 10,000 outputs in seconds, but they correlate with human judgment only 40 to 70 percent. Two answers can share no words and both be right.\n\nHuman evaluation is the gold standard at roughly 500 dollars and two hours per thousand cases, so it belongs in calibration, not in CI.\n\nLLM-as-judge is what you will use 90 percent of the time: a strong model scores outputs against a rubric, correlating 82 to 88 percent with humans. Cost per 1,000 evals runs about 3 dollars with Gemini 3 Flash, 8 with GPT-5-mini, 25 with Claude Opus 4.7. The rule that matters: the judge must be at least as capable as the model being judged.',
      },
      {
        heading: 'Rubric design is a writing problem',
        body: '"Rate this 1 to 5" produces noise, because the judge has to invent the scale each time. Anchored rubrics name observable behaviour per level: 5 is factually correct, directly on the question, specific, actionable. 3 is mostly correct with a minor inaccuracy or a partly missed intent. 1 is wrong, off-topic, or harmful.\n\nAnchoring cuts judge variance by 30 to 40 percent. Four criteria cover most applications: relevance, correctness, helpfulness, safety. Pairwise comparison sidesteps calibration entirely by showing two outputs and asking which wins, which is the cleaner instrument for A-versus-B prompt tests.',
      },
      {
        heading: 'Sample size is the argument you will actually have',
        body: 'At 50 test cases scoring 90 percent, the 95 percent confidence interval spans 78 to 97 percent, a 19-point range. You cannot distinguish a system at 80 percent from one at 96 percent, so any decision made on 50 cases is a coin flip with extra steps.\n\nAt 200 cases the interval narrows to 85 to 94, about 9 points, which is enough to catch a 5 percent regression. At 500 it is 5 points, at 1,000 it is 3. Use 200 as the floor for anything gating a deploy, and 500 or more when comparing two systems that are close.',
      },
      {
        heading: 'The dataset and the gate',
        body: 'Three kinds of cases earn their place. A golden set of 50 to 100 curated pairs covering core use cases, which every change must pass. 20 to 50 adversarial cases: injections, ambiguity, out-of-domain questions, requests for harmful content. And 100 to 200 sampled from real production traffic, which catch what curated tests never imagine.\n\nWire it to CI. Run the suite on baseline, make the change, run it again, compare with a paired test, block on statistically significant regression in any criterion. A 200-case suite on GPT-5-mini costs about 4 dollars a run, so ten PRs a week is 160 dollars a month against 11 days of silent degradation. promptfoo, DeepEval, Braintrust, LangSmith, and Arize Phoenix all provide the plumbing.',
      },
    ],
    takeaways: [
      'Below 200 test cases your confidence interval is too wide to gate a deploy on. 50 cases cannot separate 80 percent from 96.',
      'Score at least four criteria. Optimising correctness alone produces answers that are technically right and useless.',
      'Anchored rubrics cut judge variance 30 to 40 percent, which makes rubric writing a real design contribution.',
      'The judge must be at least as strong as the model it judges, and an eval suite has to run automatically or it will not run.',
    ],
    terms: [
      { term: 'LLM-as-judge', meaning: 'Using a strong model to score outputs against a rubric; correlates 82 to 88 percent with human raters.' },
      { term: 'Anchored rubric', meaning: 'A scoring guide that defines each level by observable behaviour instead of leaving the scale implicit.' },
      { term: 'Golden test set', meaning: 'The curated 50 to 100 cases covering core use cases that every change must pass.' },
      { term: 'Confidence interval', meaning: 'The range around a measured score that shows how much uncertainty the sample size leaves.' },
      { term: 'Regression testing', meaning: 'Running the same suite on the old and new versions to catch degradation before it ships.' },
      { term: 'Pairwise comparison', meaning: 'Showing a judge two outputs and asking which is better, removing the need to calibrate a scale.' },
    ],
    demoCaption:
      'A single headline score looks like progress. Open the per-criterion breakdown and the prompt change that "reduced hallucinations" shows what it actually cost.',
    demo: {
      archetype: 'meter',
      subject: 'Prompt v2 vs v1, 200-case eval suite',
      headline: 'Overall quality: 4.1 / 5, up from 4.0',
      breakdown: [
        { label: 'Safety: 4.9, up from 4.2', value: 98 },
        { label: 'Correctness: 4.6, up from 4.3', value: 92 },
        { label: 'Relevance: 4.2, flat', value: 84 },
        { label: 'Helpfulness: 2.7, down from 4.1', value: 54 },
      ],
      badCaption:
        'Overall moved from 4.0 to 4.1, so the change reads as a small win and gets merged. A mean over four criteria hides the shape of the distribution underneath: two criteria climbed hard, one collapsed, and the average absorbed all of it.',
      goodCaption:
        'The stricter prompt bought safety and correctness by making the model refuse anything uncertain, and helpfulness paid for it: 4.1 down to 2.7, a 34 percent drop in answer completeness. This is why evals score multiple criteria and gate on regression in any single one, not on the roll-up. At 200 cases the interval is about 9 points wide, which is just tight enough to see this before users do.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'at 50 test cases, a 90% score has a confidence interval of 78-97%.',
        body:
          'at 50 test cases, a 90% score has a confidence interval of 78-97%.\n\nnineteen points wide. you cannot tell an 80% system from a 96% one.\n\n200 cases narrows it to 9 points. 500 gets you 5. below 200, you are not measuring, you are guessing with a spreadsheet.',
      },
      {
        kind: 'X · design angle',
        hook: 'a team reduced hallucinations and lost 34% of answer completeness. nobody noticed for 11 days.',
        body:
          'a team reduced hallucinations and lost 34% of answer completeness. nobody noticed for 11 days.\n\nthe prompt got stricter, the model started refusing anything uncertain. safety up. helpfulness down. overall score barely moved.\n\nthe criteria you choose to score are a product spec. score one thing and you will get exactly one thing.',
      },
      {
        kind: 'X · one-liner',
        hook: 'writing the rubric cuts judge variance 30-40%. that is a writing job.',
        body:
          'writing the rubric cuts judge variance 30-40%. that is a writing job.\n\n"rate 1-5 how good it is" gives you noise. anchoring each level to observable behaviour gives you a measurement.\n\nsomebody on your team is good at this and is currently not invited to the eval design.',
      },
    ],
    source: {
      label: 'Full lesson: 11.10 evaluation',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/11-llm-engineering/10-evaluation',
    },
  },
];
