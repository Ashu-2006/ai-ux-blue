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
      'A model cannot know what it never read. RAG retrieves your documents at question time and pastes the best passages into the prompt. It is the most deployed pattern in production AI.',
    readTime: '~10 min read',
    whyItMatters:
      'Retrieval changes the object your component binds to: not a string, but a claim plus the chunks it came from, each with a score, a document id, and a date. That is a real payload, so citation chips, a source drawer, and a stale-document badge become props rather than decoration. The timing is the gift. Retrieval finishes in 50 to 200ms and generation takes 500 to 3,000, so sources can render roughly ten times before the answer streams in, which turns the wait into evidence the user reads. Below threshold, you finally have an honest empty state instead of a confident guess.',
    learningObjectives: [
      'Explain why RAG changes the model\'s context per request instead of its weights, and when that trade beats fine-tuning.',
      'Compute the token math for a RAG prompt: chunk size, top-k, and context budget summing to a request under 16,000 tokens.',
      'Pick a chunk size for a given document type and justify it against the 256 to 512 token production band.',
      'Compare five vector store options (FAISS, Chroma, Pinecone, pgvector, Qdrant) and pick one for a stated deployment shape.',
      'Design the UI states a RAG answer needs: sourced, below-threshold empty state, and stale-document flag.',
    ],
    sections: [
      {
        heading: 'The problem: the model was not there',
        body: 'A customer asks about the enterprise refund window. The real answer, 60 days with pro-rated refunds, sits in a 200-page internal wiki. The model answers with a plausible generic SaaS policy instead, because it cannot know what it was not trained on.\n\nFine-tuning is one fix and a bad one here. A training run costs somewhere between $1,000 and $100,000, the model goes stale the moment a document changes, and you cannot trace an answer back to a source. Acquire a product line next month and you pay again.',
      },
      {
        heading: '2020 to 2026: from a paper to the default pattern',
        body: 'Patrick Lewis and coauthors at Facebook AI Research published the RAG paper in 2020, naming the retrieve-then-generate pattern this lesson teaches. The same year, Karpukhin and coauthors published Dense Passage Retrieval, proving a bi-encoder beats classic BM25 keyword search on open-domain question answering, which gave RAG its retrieval half.\n\nBy 2023 every serious LLM product carried some version of this pipeline: ChatGPT plugins reading a knowledge base, Notion AI searching a workspace, GitHub Copilot Chat reading a repo. By 2026 RAG is not a technique you choose, it is the default assumption for any product that answers questions about data the model was not trained on.',
      },
      {
        heading: 'The move: retrieve, then generate',
        body: 'RAG leaves the weights alone and changes the context instead. Four steps, every time: take the query, search a document store for relevant passages, paste those passages into the prompt above the question, generate.\n\nThe economics flip completely. Per query it costs roughly $0.01 to $0.10 in embedding plus generation. Re-indexing a changed document takes minutes. You can show exactly which passages were retrieved, so an answer is auditable. And the documents stay in your store rather than being baked into somebody\'s weights.',
      },
      {
        heading: 'Fine-tuning versus RAG, side by side',
        body: '| Concern | Fine-tuning | RAG |\n|---|---|---|\n| Cost | $1,000 to $100,000+ per run | $0.01 to $0.10 per query |\n| Freshness | Stale until retrained | Updated in minutes by re-indexing |\n| Auditability | Cannot trace an answer to a source | Shows exact retrieved passages |\n| Hallucination | Still hallucinates freely | Grounded in retrieved documents |\n\nThe one case fine-tuning wins: adopting a style, tone, or reasoning pattern prompting cannot reach. For factual knowledge, RAG wins nearly every time, which is why Lesson 11.08 treats fine-tuning as the third resort, not the first.',
      },
      {
        heading: 'Chunking is the decision that quietly sets quality',
        body: 'A 50-page PDF makes a terrible single embedding because it covers dozens of topics. So documents get split into chunks, each embedded separately, and chunk size matters more than teams expect.\n\nFixed-size chunking splits every 512 tokens with 50 tokens of overlap, simple and predictable. Semantic chunking splits at paragraph or header boundaries, more work to implement but better retrieval. Recursive chunking, the LangChain default, tries section headers first and falls back to paragraphs, then sentences, when a section is still too large.\n\nToo small (64 to 128 tokens) and a chunk loses its referent: "it increased 15 percent last quarter" means nothing alone. Too large (2048 plus) and relevance gets diluted, so a search for revenue returns a chunk that is 10 percent revenue and 90 percent headcount. The production sweet spot is 256 to 512 tokens with about 50 tokens of overlap, the range Anthropic\'s own RAG guidelines recommend.',
      },
      {
        heading: 'Embeddings, cosine, and the 2026 lineup',
        body: 'An embedding model turns text into a dense vector where similar meanings land near each other. "How do I reset my password?" and "I need to change my password" produce nearly identical vectors despite sharing almost no words.\n\nSimilarity is measured with cosine, the angle between two vectors, which ignores magnitude and so handles documents of different lengths gracefully. When someone says vector search, they almost always mean cosine.\n\nThe 2026 lineup runs from OpenAI text-embedding-3-small and text-embedding-3-large through Google Gemini Embedding 2 (3,072 dimensions, 8K context), Voyage AI voyage-4, Cohere embed-v4, and open-weight BGE-M3 and Qwen3-Embedding. Dimensions run 384 to 4,096 depending on the model, most of them truncatable to smaller sizes for storage savings.',
      },
      {
        heading: 'Picking a store: FAISS to Qdrant',
        body: '| Store | Type | Best for |\n|---|---|---|\n| FAISS | In-process library | Prototyping, small to medium datasets |\n| Chroma | Lightweight DB | Local development |\n| pgvector | Postgres extension | Already running Postgres |\n| Pinecone | Managed service | Production without ops overhead |\n| Qdrant | Self-hosted DB | High-performance production |\n\nA brute-force flat index scales to roughly 100,000 vectors before search gets slow. Past that, production systems switch to an approximate nearest neighbour algorithm like HNSW, which searches millions of vectors in milliseconds by trading a small amount of recall for speed.',
      },
      {
        heading: 'The numbers a designer should hold',
        body: 'Production RAG converges on a narrow band. Retrieve k = 5 to 10 chunks per query. Spend 2,500 to 5,000 tokens of retrieved content, inside a total prompt of roughly 8,000 to 16,000 tokens once system prompt, history, and query are counted. Retrieval takes 50 to 200ms; generation takes 500 to 3,000ms.\n\nThat split is the whole latency story. Search is effectively instant and the model is the wait, which is why a good RAG UI can show its sources long before it shows its answer.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p11-06-inline-timing.svg',
        alt: 'Retrieval versus generation latency',
        caption: 'Retrieval finishes in 50 to 200ms; generation takes 500 to 3,000ms, so sources can render well before the answer streams in.',
        diagramBrief: 'Cream paper background. A horizontal timeline from 0ms to 3000ms. A short blue bar from 0-200ms labeled "retrieval". A longer black bar from 200ms to 3000ms labeled "generation". Above the blue bar, a small callout: "sources visible here". Style: monochrome ink, one blue accent on the retrieval bar.',
      },
      {
        src: '/lessons/p11-06-inline-chunk-size.svg',
        alt: 'Chunk size tradeoff',
        caption: 'Too small loses context, too large dilutes relevance; 256 to 512 tokens is the production band.',
        diagramBrief: 'Cream paper background. Three stacked horizontal bars of increasing width labeled "64-128 tokens: loses referent", "256-512 tokens: sweet spot" (highlighted in blue), "2048+ tokens: dilutes relevance". Below each bar, one short example phrase in quotes. Style: black ink, one blue accent on the middle bar.',
      },
    ],
    takeaways: [
      'RAG changes the context, fine-tuning changes the weights. For facts that move, always change the context.',
      'Chunk size is a product decision: 256 to 512 tokens with overlap is the band that keeps chunks both self-contained and focused.',
      'Retrieval is 50 to 200ms, generation is 500 to 3,000ms. Sources can render before the answer does.',
      'Every answer has a provenance trail. If the UI does not expose it, you threw away RAG\'s biggest advantage over fine-tuning.',
    ],
    terms: [
      { term: 'RAG', gloss: '"AI that reads your docs"', meaning: 'Retrieve relevant passages at query time and paste them into the prompt so the answer is grounded in them.' },
      { term: 'Embedding', gloss: '"convert text to numbers"', meaning: 'A dense vector for a piece of text, positioned so similar meanings sit close together.' },
      { term: 'Chunk', gloss: '"a piece of the document"', meaning: 'A slice of a document, typically 256 to 512 tokens, that is embedded and retrieved as one unit.' },
      { term: 'Cosine similarity', gloss: '"how similar are two vectors"', meaning: 'The cosine of the angle between two vectors: 1 is identical direction, 0 is unrelated, -1 is opposite.' },
      { term: 'Top-k retrieval', gloss: '"get the best matches"', meaning: 'Returning the k highest-scoring chunks for a query, usually 5 to 10.' },
      { term: 'Indexing', gloss: '"preparing docs for search"', meaning: 'The offline pass that chunks, embeds, and stores documents so they can be searched later.' },
      { term: 'Vector database', gloss: '"a search engine for AI"', meaning: 'A data store built to hold vectors and find nearest neighbours by similarity, not to run SQL joins.' },
      { term: 'Context window', gloss: '"how much the model can read"', meaning: 'The maximum number of tokens a request can hold; retrieved chunks compete with system prompt and history for that budget.' },
      { term: 'TF-IDF', gloss: '"word importance scoring"', meaning: 'Term frequency times inverse document frequency; weights a word by how distinctive it is across the corpus, the pre-neural ancestor of dense embeddings.' },
      { term: 'Approximate nearest neighbour', gloss: '"fast vector search"', meaning: 'An index like HNSW that trades a small amount of recall for the ability to search millions of vectors in milliseconds.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A support document is 12,000 tokens. At a 400-token chunk size with 50-token overlap, roughly how many chunks does it produce?' },
      { level: 'medium', prompt: 'A query retrieves k=8 chunks averaging 350 tokens each. Add a 1,200-token system prompt and 2,000 tokens of conversation history. Is the total under a 16,000-token budget, and by how much?' },
      { level: 'medium', prompt: 'A document changes daily. At $0.02 per 1,000 chunks to re-index, compare that cost against re-fine-tuning weekly. At what document-change frequency does fine-tuning ever make sense for freshness alone?' },
      { level: 'hard', prompt: 'Given 2 million chunks and a flat index that scales to about 100,000 before slowing down, what has to change in the architecture, and what does that cost in recall?' },
      { level: 'design', prompt: 'Sketch the empty state for a RAG answer where no chunk scores above threshold. What does the UI say instead of an answer, and what does it offer the user to do next?' },
    ],
    furtherReading: [
      { label: 'Lewis et al., "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks" (2020)', url: 'https://arxiv.org/abs/2005.11401', why: 'The paper that named the retrieve-then-generate pattern this entire lesson teaches.' },
      { label: 'Karpukhin et al., "Dense Passage Retrieval for Open-Domain Question Answering" (EMNLP 2020)', url: 'https://arxiv.org/abs/2004.04906', why: 'Proved a bi-encoder retriever beats BM25 on open-domain QA and set the shape of the modern RAG retriever.' },
      { label: 'Anthropic, "Introducing Contextual Retrieval"', url: 'https://www.anthropic.com/news/contextual-retrieval', why: 'Anthropic\'s own guidance on chunk construction and retrieval quality for production RAG.' },
      { label: 'LlamaIndex High-Level Concepts', url: 'https://docs.llamaindex.ai/en/stable/getting_started/concepts.html', why: 'The vocabulary, loaders, node parsers, indices, retrievers, that most RAG frameworks borrow.' },
      { label: 'LangChain RAG tutorial', url: 'https://python.langchain.com/docs/tutorials/rag/', why: 'The chain-of-runnables view of the same retrieve-then-generate pattern, useful as a second framing.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'RAG answer surface checklist',
      body: '- Does every answer carry the chunks it was grounded in, not just the final text?\n- Is there a source drawer or citation chip, not just a paragraph of prose?\n- Below the retrieval threshold, does the UI say so, or does it let the model guess?\n- Is a document date attached to every chunk, so a stale source is visible?\n- Does the loading state show retrieved sources before the generated answer streams in?',
    },
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
      'Vector similarity is not relevance. Hybrid search, reranking, and query transformation are the fixes that separate a ten-document demo from a ten-million-document system.',
    readTime: '~10 min read',
    whyItMatters:
      'Each fix here spends latency you have to cover in the interface. Reranking adds a cross-encoder pass over 50 candidates before anything is displayable, so the result list cannot stream in progressively the way a plain vector search can. HyDE is worse: 500 to 2,000ms of a full model call before a single result exists, which is a skeleton with no rows in it, not a spinner over stale content. Hybrid search also changes the shape of the score you render, since RRF returns a fused rank rather than a 0-to-1 similarity, so any confidence chip bound to cosine breaks the day someone turns it on.',
    learningObjectives: [
      'Explain why a chunk can score high on cosine similarity and still fail to answer the question.',
      'Compute a Reciprocal Rank Fusion score for a document ranked in two lists, and explain why RRF uses rank instead of raw score.',
      'Compare bi-encoder retrieval against cross-encoder reranking on cost, latency, and accuracy.',
      'Decide when HyDE\'s extra LLM call is worth 500 to 2,000ms of added latency.',
      'Design a two-stage retrieval pipeline, recall then precision, for a corpus of a stated size.',
    ],
    sections: [
      {
        heading: 'The problem: similarity is not relevance',
        body: 'Ask "what was revenue last quarter?" and semantic search returns chunks about revenue strategy, revenue projections, and the CFO on revenue growth. The chunk that actually holds the number says "Q3 earnings were $47.2M" and never uses the word revenue, so it loses.\n\nThree failure classes recur. Ambiguous queries, where every near-miss is semantically closer than the answer. Multi-hop questions ("which team improved satisfaction most?") where no single chunk contains the answer. And scale: at 2 million chunks, approximate search error alone pushes the right chunk out of the top 5.',
      },
      {
        heading: 'Fix one: hybrid search',
        body: 'Vector search understands meaning. "How do I cancel my subscription?" matches "steps to terminate your plan" despite zero shared words. It is bad at exact strings: error code E-4021 can read as noise to an embedding model.\n\nBM25 keyword search, the ranking algorithm behind search engines since the 1990s, is the mirror image. E-4021 matches perfectly, "cancel my subscription" returns nothing. Hybrid runs both and merges the two ranked lists. Production hybrid usually sits at 0.3 to 0.7 weighting between the two, the alpha parameter in Weaviate\'s hybrid search API.',
      },
      {
        heading: 'Reciprocal Rank Fusion, worked',
        body: 'Reciprocal Rank Fusion merges two ranked lists by summing 1/(60 + rank) across them, using a constant of 60 so the top result in either list does not dominate. A document ranked #1 in vector search and #5 in BM25 scores 1/61 plus 1/65, about 0.0318. A document ranked #3 and #2 scores 1/63 plus 1/62, about 0.0320, edging ahead.\n\nBecause RRF uses ranks and not raw scores, the two systems\' incompatible scales stop mattering: cosine similarity lives between -1 and 1, BM25 scores are unbounded, and neither has to be normalized before fusing. This is what makes hybrid search a five-line function instead of a calibration problem.',
      },
      {
        heading: 'Fix two: rerank the shortlist',
        body: 'Retrieval uses bi-encoders: query and document are embedded independently, so document vectors can be precomputed and cached, which is what makes searching millions of chunks viable.\n\nA reranker uses a cross-encoder: query and candidate go into the model together, so it can see fine-grained interactions and recognise that "what were Q3 earnings?" belongs with "$47.2M in Q3". The cost is 100x to 1000x slower per pair, so you cannot precompute anything. The standard shape is therefore two-stage: retrieve top 50 cheaply, rerank to top 5 carefully. Cohere Rerank 3.5, Voyage rerank-2.5, and open-weight bge-reranker-v2-m3 are the 2026 defaults; ColBERTv2-style late-interaction rerankers split the difference at roughly the cost of the token count rather than the document count.',
      },
      {
        heading: 'Fix three: repair the query before searching',
        body: 'Sometimes retrieval is not the problem. "What was that thing about the new policy change?" has no specific terms, so its embedding is vague and no system can rescue it.\n\nQuery rewriting has an LLM rephrase it into a real search query. HyDE goes further: generate a hypothetical answer to the question, embed that, and search for real documents similar to it. The intuition is that questions and answers have different linguistic shapes, so a fake answer lands closer to the real answer in embedding space than the question ever does. It costs one extra LLM call, 500 to 2,000ms before retrieval even starts.',
      },
      {
        heading: 'Fix four: decouple search granularity from context granularity',
        body: 'Standard chunking forces a bad trade: small chunks retrieve precisely, large chunks give the model enough context to answer. Parent-child chunking refuses the trade. Index 128-token children for matching, but return the 512-token parent to the prompt. The child wins the search, the parent carries the surrounding meaning.\n\nMetadata filtering does the complementary job: narrow before you search. "What changed in the security policy last month?" should only search security documents from the last 30 days, not the whole corpus where a two-year-old memo is happy to look semantically similar.',
      },
      {
        heading: 'Evaluating whether any of this worked',
        body: 'Three metrics tell you whether any of this worked. Recall@k: for test questions with known answer chunks, what fraction show up in the top-k? Faithfulness: is the generated answer actually supported by the retrieved chunks, or did the model invent a detail despite having the right context? Answer correctness: does the final answer match the expected one, folding retrieval and generation quality into one number.\n\nA simple faithfulness check works without a judge model: take each claim in the answer, and verify its content words appear in the retrieved chunks. Below roughly half overlap, treat the claim as ungrounded. Lesson 11.10 builds the full evaluation harness this feeds into.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p11-07-inline-rrf.svg',
        alt: 'Reciprocal Rank Fusion worked example',
        caption: 'Two ranked lists merge by rank, not by raw score, which is why RRF tolerates incompatible scales.',
        diagramBrief: 'Cream paper, two columns of ranked boxes labeled "Vector search" and "BM25", numbered 1-5 each. Arrows from matching document boxes converge to a third column "Fused rank" with the 1/(60+rank) formula written above it. Highlight in blue the document that wins by placing well in both lists despite not being #1 in either. Monochrome ink, one blue accent.',
      },
      {
        src: '/lessons/p11-07-inline-twostage.svg',
        alt: 'Two-stage retrieval funnel',
        caption: 'Retrieve wide and cheap, then rerank narrow and expensive: 50 candidates down to 5.',
        diagramBrief: 'Cream paper, a funnel shape. Top: wide band labeled "Hybrid search: 50 candidates, milliseconds". Middle: narrowing band labeled "Cross-encoder rerank: 100-1000x slower per pair". Bottom: narrow band labeled "Top 5 to prompt". Style: black ink, blue accent on the bottom band.',
      },
    ],
    takeaways: [
      'A chunk can be semantically similar and useless. Hybrid search exists because exact strings and meaning are different retrieval problems.',
      'Two-stage retrieval is the production shape: cheap recall to 50 candidates, expensive precision down to 5.',
      'HyDE buys retrieval quality with 500 to 2,000ms of latency before any result exists. That is a UX decision, not just an infra one.',
      'Parent-child chunking breaks the precision-versus-context trade: search small, send large.',
    ],
    terms: [
      { term: 'BM25', gloss: '"keyword search"', meaning: 'A probabilistic ranking formula scoring documents by term frequency, rarity, and length, with diminishing returns per repeated term.' },
      { term: 'Hybrid search', gloss: '"best of both worlds"', meaning: 'Running vector and keyword search in parallel and merging the two ranked lists into one.' },
      { term: 'Reciprocal Rank Fusion', gloss: '"combine two rankings"', meaning: 'Merging ranked lists by summing 1/(k + rank) per document, typically k=60, so raw score scales stop mattering.' },
      { term: 'Bi-encoder', gloss: '"fast embedding model"', meaning: 'A model that embeds query and document independently, so document vectors can be precomputed and cached.' },
      { term: 'Cross-encoder', gloss: '"accurate but slow model"', meaning: 'A model that scores a query and document together, seeing their interaction, at 100 to 1000 times the cost of a bi-encoder per pair.' },
      { term: 'HyDE', gloss: '"search with a fake answer"', meaning: 'Generate a hypothetical answer, embed it, and retrieve documents similar to that instead of to the question.' },
      { term: 'Parent-child chunking', gloss: '"small search, big context"', meaning: 'Index small chunks for precise matching but return the larger parent chunk to the prompt for context.' },
      { term: 'Metadata filtering', gloss: '"narrow before searching"', meaning: 'Filtering by date, source, or category before running vector search, to cut the search space rather than trust similarity alone.' },
      { term: 'Faithfulness', gloss: '"did it stay grounded"', meaning: 'Whether the generated answer is actually supported by the retrieved chunks rather than invented from the model\'s training data.' },
      { term: 'Recall@k', gloss: '"did we find it"', meaning: 'The fraction of test questions whose known-correct chunk appears anywhere in the top-k retrieved results.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A document ranks #2 in vector search and #4 in BM25. Compute its RRF score with k=60.' },
      { level: 'medium', prompt: 'Retrieval returns 50 candidates in 80ms. Reranking those 50 with a cross-encoder at 12ms per pair adds how much latency, and what does the loading UI need to account for that a plain vector search UI does not?' },
      { level: 'medium', prompt: 'A support corpus has documents tagged by category and date. Write the metadata filter you would apply before vector search for the query "what changed in the API rate limits last month?"' },
      { level: 'hard', prompt: 'Faithfulness scoring flags 30 percent of answers as ungrounded on a corpus where retrieval Recall@5 is 95 percent. Where is the more likely fault, retrieval or generation, and what would you check first?' },
      { level: 'design', prompt: 'Sketch how a chat UI shows the user that an answer used HyDE, an extra 1 to 2 second step before results appeared. Does the user need to know, and if so, what is the microcopy?' },
    ],
    furtherReading: [
      { label: 'Robertson & Zaragoza, "The Probabilistic Relevance Framework: BM25 and Beyond" (2009)', url: 'https://doi.org/10.1561/1500000019', why: 'The probabilistic foundations behind the BM25 formula every keyword search still runs on.' },
      { label: 'Cormack et al., "Reciprocal Rank Fusion Outperforms Condorcet and Individual Rank Learning Methods" (2009)', url: 'https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf', why: 'The original proof that rank-based fusion beats more complex learned combination methods.' },
      { label: 'Gao et al., "Precise Zero-Shot Dense Retrieval without Relevance Labels" (2022)', url: 'https://arxiv.org/abs/2212.10496', why: 'The HyDE paper: generate a fake answer first, embed that, and retrieval improves without any training data.' },
      { label: 'Nogueira & Cho, "Passage Re-ranking with BERT" (2019)', url: 'https://arxiv.org/abs/1901.04085', why: 'Cross-encoder reranking on top of BM25, the paper that established the two-stage retrieve-then-rerank shape.' },
      { label: 'Asai et al., "Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection" (ICLR 2024)', url: 'https://arxiv.org/abs/2310.11511', why: 'The agentic frontier past static retrieve-then-generate: a model that critiques its own retrieval.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Advanced retrieval upgrade checklist',
      body: '- Are ambiguous or code-like queries (error codes, IDs) failing pure vector search? Add BM25 and fuse with RRF.\n- Is the top result "about" the topic but missing the fact? Add a cross-encoder rerank stage.\n- Are vague questions retrieving nothing useful? Try HyDE or query rewriting before blaming the retriever.\n- Are chunks either too small to be useful or too broad to be relevant? Add parent-child chunking.\n- Have you measured Recall@k and faithfulness on a real test set, or are you still reading five examples and calling it done?',
    },
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
      'Full fine-tuning an 8B model needs about 56GB of VRAM. LoRA trains under 1 percent of the parameters and matches its quality. QLoRA fits the same job into 6GB, a consumer graphics card.',
    readTime: '~10 min read',
    whyItMatters:
      'Fine-tuning buys style, format, and consistent structure, the things a system prompt can only nudge, and it buys none of your facts. That boundary is the routing decision behind every "make it sound like us" request: voice is an adapter, freshness is retrieval, and a training run aimed at a retrieval problem ships a model that is stale by Friday. The shipping shape matters too. An adapter is a 10 to 100MB file hot-swapped over one loaded base, so a persona picker or a per-workspace tone setting is a request parameter, not a separate deployment, and $2 of QLoRA on one consumer GPU makes that experiment affordable.',
    learningObjectives: [
      'Compute the parameter count and percentage LoRA trains for a given rank and layer shape.',
      'Explain why B is initialized to zero and what that guarantees about training\'s starting point.',
      'Compare full fine-tuning, LoRA, and QLoRA on VRAM, cost, and MMLU score for a 7B model.',
      'Decide which target layers and rank to use for a stated task: classification, instruction following, or code.',
      'Place fine-tuning correctly in the prompt-then-RAG-then-fine-tune decision order for a given product request.',
    ],
    sections: [
      {
        heading: 'The problem: full fine-tuning does not fit',
        body: 'Llama 3 8B in fp16 is 16GB of weights. Training also needs gradients (another 16GB), Adam optimizer state for momentum and variance (32GB), plus activations. Roughly 56GB of VRAM, so an A100 80GB barely holds it and two of them cost $3 to $4 an hour. Three epochs over 50,000 examples is 6 to 10 hours, so $30 to $40 an experiment, and you will run ten before the hyperparameters are right.\n\nThere is a quality problem too. Updating every weight can degrade what the model already knew, which is catastrophic forgetting: better at your task, worse at everything else.',
      },
      {
        heading: '2021 to 2023: from LoRA to QLoRA',
        body: 'Edward Hu and coauthors at Microsoft published LoRA in June 2021, testing it up to GPT-3 175B with rank as low as 4. The insight sat mostly in research circles until the open-weight model wave of 2023, when Llama and Mistral gave people a base model worth adapting cheaply.\n\nTim Dettmers and coauthors at the University of Washington published QLoRA in May 2023, adding 4-bit quantisation of the frozen base to the same trick, and enabling 65B fine-tuning on a single 48GB GPU. That paper is why an open-weight fine-tuning community exists at all: it moved the entry cost from a rented A100 cluster to a gaming GPU under a desk.',
      },
      {
        heading: 'The insight: the update is low rank',
        body: 'Microsoft\'s LoRA paper noticed that the weight change during fine-tuning has low intrinsic rank. You do not need all 16.7 million parameters of a 4096x4096 projection to express the useful part of the update. A rank 16 approximation carries it.\n\nSo freeze W and add a detour: instead of updating W, learn two skinny matrices whose product has the same shape. For rank 16 on that layer, (4096 x 16) + (16 x 4096) = 131,072 parameters against 16,777,216, which is 0.78 percent. B is initialised at zero so training starts from the model\'s original behaviour and departs gradually.',
      },
      {
        heading: 'The dials: rank, alpha, and target layers',
        body: 'Rank sets expressiveness. Rank 4 handles simple classification, 8 covers single-domain question answering, 16 is the workhorse for instruction following, 32 suits complex reasoning and code. Past 64 the returns vanish and the memory advantage starts to erode.\n\nAlpha scales how hard the adapter pushes: alpha equal to rank is 1x and conservative, alpha at twice rank is the common convention. Target layers matter more than people expect. Query plus value projections is the sweet spot at 9.4M trainable parameters on a 7B model. Adding every linear layer roughly quadruples the count to 37.7M for marginal gain.',
      },
      {
        heading: 'QLoRA: quantise the frozen half',
        body: 'QLoRA loads the frozen base in 4-bit and trains fp16 adapters on top. Weight memory for a 7B drops from 14GB to 3.5GB and training memory from about 18GB to 6GB, which turns an A100 requirement into an RTX 3090.\n\nThree pieces make it work. NF4 places its 16 quantisation levels at the quantiles of a normal distribution, which is where neural network weights actually live. Double quantisation compresses the quantisation constants themselves, 0.4GB down to 0.1GB. Paged optimizers spill Adam state to CPU RAM instead of crashing on an out-of-memory error.',
      },
      {
        heading: 'The quality question: what you give up',
        body: 'Does any of this cost quality? Full fine-tuning of Llama 2 7B scores 48.3 on MMLU, 6.72 on MT-Bench, 14.6 on HumanEval. LoRA at r=16 scores 47.9, 6.68, and 14.0, within a point across the board. QLoRA at r=16 gives up another fraction: 47.5, 6.61, 13.4. QLoRA at r=64 recovers most of it: 48.1 MMLU, 6.70 MT-Bench, 14.2 HumanEval, closely matching full fine-tuning while using roughly 90 percent less memory.\n\nThe pattern holds across tasks: rank is the knob that trades memory for capacity, and the trade stays generous until well past r=64.',
      },
      {
        heading: 'Adapters as artifacts, and when not to do this at all',
        body: 'A trained adapter is a 10 to 100MB file, not a model. Keep it separate and you can hot-swap a support adapter for a code adapter over one loaded base, which is how a single deployment serves many specialisations. Merge it (W plus the scaled product) and you get a normal model with no inference overhead but no swapping.\n\nThe order of operations matters more than the technique. First prompt engineering, which is free and takes minutes. Second RAG, when the model needs to know your data. Only third fine-tuning, for style, format, reasoning pattern, or distilling a big model into a small one.',
      },
      {
        heading: 'The 2026 tooling',
        body: '| Framework | Pick when |\n|---|---|\n| Hugging Face PEFT | Raw control, training loop already on transformers.Trainer |\n| TRL | DPO or GRPO after SFT, built on PEFT |\n| Unsloth | 2-5x speedup and half the VRAM via Triton kernels, no accuracy loss |\n| Axolotl | Reproducible YAML-configured runs, wraps PEFT, TRL, DeepSpeed, Unsloth |\n| LLaMA-Factory | Zero-code fine-tuning across 100+ model families |\n\nQLoRA r=16 on one RTX 4090 with Unsloth is about 2.5 hours and $2. The same job on a bare T4 is 12 hours and $4. The tooling layer, not the hardware, is what makes ten experiments affordable instead of one.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p11-08-inline-params.svg',
        alt: 'LoRA parameter reduction at rank 16',
        caption: 'A 4096x4096 projection has 16.7M parameters; rank-16 LoRA trains 131,072, about 0.78 percent.',
        diagramBrief: 'Cream paper. Left: large black square grid labeled "W: 4096 x 4096 = 16.7M params (frozen)". Right: two thin rectangles labeled "A: 4096 x 16" and "B: 16 x 4096" stacked with a small plus sign, labeled "131,072 params (trained)". Style: monochrome ink, blue accent on the trained rectangles.',
      },
      {
        src: '/lessons/p11-08-inline-costladder.svg',
        alt: 'Cost ladder from full fine-tune to QLoRA on Unsloth',
        caption: 'Full fine-tuning an 8B model costs about $32 on two A100s; QLoRA with Unsloth costs about $2 on one consumer GPU.',
        diagramBrief: 'Cream paper. A vertical bar chart with 4 bars decreasing in height left to right: "Full fine-tune: 2x A100, 8h, $32", "LoRA: 1x A100, 4h, $8", "QLoRA: 1x RTX 4090, 6h, $5", "QLoRA+Unsloth: 1x RTX 4090, 2.5h, $2". Blue accent on the last bar.',
      },
    ],
    takeaways: [
      'LoRA trains roughly 0.8 percent of the parameters and lands within 1 percent of full fine-tuning quality. The savings are not a compromise.',
      'Rank 8 to 16 covers most real tasks. Rank above 64 is almost never justified.',
      'QLoRA turns a data-centre job into a consumer-GPU job: 56GB to 6GB, about $2 a run.',
      'Prompt first, RAG second, fine-tune third. Fine-tuning buys style and format, never fresh facts.',
    ],
    terms: [
      { term: 'LoRA', gloss: '"efficient fine-tuning"', meaning: 'Freeze the base weights and train two small matrices whose product approximates the full weight update.' },
      { term: 'QLoRA', gloss: '"fine-tune on a laptop"', meaning: 'LoRA on a 4-bit quantised base model, bringing 7B fine-tuning down to about 6GB of VRAM.' },
      { term: 'Rank (r)', gloss: '"how much the model can learn"', meaning: 'The inner dimension of the two adapter matrices; it sets how expressive the adaptation can be.' },
      { term: 'Alpha', gloss: '"LoRA learning rate"', meaning: 'A scaling factor on the adapter output; alpha divided by rank controls how strongly it shifts the base behaviour.' },
      { term: 'NF4', gloss: '"4-bit quantisation"', meaning: 'A 4-bit number format whose 16 levels sit at normal-distribution quantiles, matched to how neural network weights are actually distributed.' },
      { term: 'Catastrophic forgetting', gloss: '"fine-tuning broke everything else"', meaning: 'Losing previously learned capabilities because updating every weight overwrote the ones that held them.' },
      { term: 'Adapter', gloss: '"the small trained part"', meaning: 'The LoRA A and B matrices saved as a 10 to 100MB file, loadable on top of any copy of the frozen base model.' },
      { term: 'Target modules', gloss: '"which layers to LoRA"', meaning: 'The specific linear layers, usually q_proj and v_proj, where adapter matrices get injected.' },
      { term: 'Merging', gloss: '"bake it in"', meaning: 'Computing W plus the scaled adapter product and replacing the original weight, removing the adapter overhead at inference.' },
      { term: 'Paged optimizer', gloss: '"do not run out of memory"', meaning: 'Offloading Adam\'s momentum and variance to CPU RAM when GPU memory runs out, at some cost to throughput.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A 2048x2048 projection layer gets LoRA at rank 8. How many trainable parameters does that add, and what percentage of the full 4.19M parameters is that?' },
      { level: 'medium', prompt: 'A team runs three epochs over 50,000 examples. At LoRA speeds (about 4 hours on one A100 at $2/hour) versus full fine-tuning (8 hours on two A100s at $3.50/hour each), what is the cost difference per experiment, and per ten experiments?' },
      { level: 'medium', prompt: 'A task is single-domain FAQ answering. Using the rank guidance in this lesson, which rank would you start with, and what would make you move up to the next one?' },
      { level: 'hard', prompt: 'QLoRA r=64 nearly matches full fine-tuning on MMLU, MT-Bench, and HumanEval while using about 90 percent less memory. What is the argument for ever choosing full fine-tuning over QLoRA r=64 in 2026?' },
      { level: 'design', prompt: 'A product wants a per-workspace tone setting: formal, casual, terse. Sketch how you would ship this as adapters rather than three separate deployed models, and what the settings UI exposes to an admin choosing between them.' },
    ],
    furtherReading: [
      { label: 'Hu et al., "LoRA: Low-Rank Adaptation of Large Language Models" (2021)', url: 'https://arxiv.org/abs/2106.09685', why: 'The original low-rank decomposition paper, tested on GPT-3 175B down to rank 4.' },
      { label: 'Dettmers et al., "QLoRA: Efficient Finetuning of Quantized Language Models" (2023)', url: 'https://arxiv.org/abs/2305.14314', why: 'Introduces NF4, double quantisation, and paged optimizers; enables 65B fine-tuning on one 48GB GPU.' },
      { label: 'PEFT library documentation', url: 'https://huggingface.co/docs/peft', why: 'The standard library for LoRA, QLoRA, and other parameter-efficient methods in the Hugging Face ecosystem.' },
      { label: 'Yadav et al., "TIES-Merging: Resolving Interference When Merging Models" (2023)', url: 'https://arxiv.org/abs/2306.01708', why: 'How to combine multiple LoRA adapters without one overwriting the other\'s capability.' },
      { label: 'Unsloth documentation', url: 'https://docs.unsloth.ai/', why: 'The fused-kernel layer that turns a 6-hour QLoRA run into 2.5 hours on the same GPU.' },
    ],
    shipIt: {
      kind: 'rubric',
      name: 'Prompt vs RAG vs fine-tune decision rubric',
      body: '- Does the model just need better instructions or examples? Fix the prompt first, it is free.\n- Does the model need to know specific documents or facts that change over time? Build RAG, do not train on it.\n- Does the model need a consistent voice, format, or reasoning pattern prompting cannot reach? Fine-tune with LoRA, rank 8-16 to start.\n- Does the task need very low latency with no room for few-shot examples? Consider fine-tuning to bake the pattern in.\n- Are you about to fine-tune to fix a freshness problem? Stop, that is a RAG problem wearing a training budget.',
    },
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
      'An LLM cannot check the weather, query a database, or send an email, it only generates text. Function calling is the JSON protocol that names a function and its arguments, and your code does the acting.',
    readTime: '~10 min read',
    whyItMatters:
      'The model proposes and your code disposes, and that seam is where the permission gate physically goes: it is the last frame before something irreversible runs. So an agent component owns a real state machine, proposed then confirmed then executing then result or error, not a loading boolean, and a dry-run preview renders the parsed arguments before execution rather than after. Parallel calls collapse 5 to 10 sequential waits into one round trip, worth 60 to 80 percent of the latency, which is the difference between one progress affordance and a stack of them. Errors come back as structured tool results, so the taxonomy is retriable versus terminal, two components.',
    learningObjectives: [
      'Trace the five-step function-calling loop from user message to final answer, and name where your code, not the model, executes anything.',
      'Write a tool description that a model can reliably select between, and explain why the description text functions as a prompt.',
      'Compare tool_choice modes, auto, required, named, and pick the right one for a given product flow.',
      'Apply the five non-negotiable security rules to a tool that touches a database or the filesystem.',
      'Design the UI state machine an agentic action needs between "model proposes" and "code executes."',
    ],
    sections: [
      {
        heading: 'The problem: the model has no hands',
        body: 'A user asks for the weather in Tokyo right now. The model answers that it lacks real-time data but the season suggests around 15 degrees. That is a hallucination wearing a disclaimer.\n\nThe real answer needs an API call. The model cannot make one, your code can, and the missing piece is a structured way for the model to say "call the weather function with city equals Tokyo" that your code can parse and execute. Without that protocol an LLM is an encyclopedia. With it, it is an agent.',
      },
      {
        heading: 'History: from ReAct to native tool calling',
        body: 'Shunyu Yao and coauthors published ReAct in 2022, the Thought-Action-Observation loop that first gave language models a formal way to interleave reasoning with tool use, though every tool call still had to be parsed out of free text by hand. OpenAI shipped native function calling in June 2023, turning that parsing problem into a JSON Schema the model fills in directly.\n\nBy 2024 Anthropic, Google, and the open-weight labs had converged on near-identical shapes, and Anthropic\'s Model Context Protocol standardised the wire format so one server could serve tools to any client. Function calling is the inline case; MCP is what you reach for once a tool needs to be shared across more than one host.',
      },
      {
        heading: 'The loop: five steps, one boundary',
        body: 'User message goes in. The model receives it along with tool definitions. Instead of text the model emits a tool call, a JSON object naming a function and its arguments. Your code executes that function and captures the result. The result goes back into the conversation, and the model produces its final answer using real data.\n\nThe critical line is between steps three and four. The model never executes anything. It only decides what should be called and with what. Everything that actually touches the world happens in code you wrote, which means every guardrail you want to exist has a natural home.',
      },
      {
        heading: 'The schema is a prompt in disguise',
        body: '| Provider | Parameter | Call format | Forced calling |\n|---|---|---|---|\n| OpenAI (GPT-5, o4) | tools | tool_calls[].function | tool_choice="required" |\n| Anthropic (Claude 4.6/4.7) | tools | tool_use content block | tool_choice={"type":"any"} |\n| Google (Gemini 3) | function_declarations | functionCall | function_calling_config |\n| Llama 4 | native tools | mixed, matches OpenAI shape | model-dependent |\n\nEach tool is a JSON Schema: a name, a description, typed parameters. The description fields do the real work, because the model reads them to decide when a tool applies. "Gets weather" produces measurably worse tool selection than "get current weather for a city, returns temperature in Celsius and conditions".',
      },
      {
        heading: 'Control: auto, required, specific, and parallel',
        body: 'Tool choice decides how much freedom the model gets. Auto lets it answer directly when no tool is needed, which is right for "what is 2 plus 2". Required forces at least one call, which stops the model guessing when you already know a lookup is necessary. Naming a specific function is routing: upstream logic already decided, the model just fills arguments.\n\nParallel calling matters most for perceived speed. "Weather in Tokyo and New York" produces two tool calls in one turn, executed concurrently, one round trip instead of two. On agents making 5 to 10 calls per query this cuts latency 60 to 80 percent.',
      },
      {
        heading: 'Structured outputs versus function calling',
        body: 'Lesson 11.03 covered structured outputs: forcing a model to produce data in a specific shape as the final product, extracting {name, price, in_stock} from a paragraph. Function calling reuses the same JSON Schema machinery for a different purpose. The output is not the answer, it is a request to act: get_weather(city="Tokyo") is the model asking your code to go find out something it does not know.\n\nUse structured outputs when you want data extraction from text already in hand. Use function calling when the model needs your code to reach outside the conversation, an API, a database, a file, before it can answer.',
      },
      {
        heading: 'The security rules are not optional',
        body: 'This is the most dangerous capability you can hand a model, because the model chooses what runs. Five rules hold. Never pass model-generated SQL to a database, parameterise and allowlist operations instead. Allowlist functions, never build a generic "execute any function by name" tool. Validate every argument against types and ranges before execution. Sanitise tool results, because whatever comes back tends to end up verbatim in the model\'s response, secrets included. And rate limit: 10 to 20 calls per conversation stops runaway loops.\n\nOne counterintuitive practice: return failures as structured tool results rather than throwing. Models self-correct well from "error: city not found, check spelling" and badly from silence.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p11-09-inline-loop.svg',
        alt: 'Five-step function calling loop',
        caption: 'The model only ever proposes a call; your code is the only thing that executes.',
        diagramBrief: 'Cream paper. Five numbered boxes in a horizontal sequence: "1 User message", "2 Model + tool defs", "3 Model emits tool_call JSON", "4 Your code executes", "5 Result returns, model answers". A vertical divider line between boxes 3 and 4 labeled "the model never crosses this line". Blue accent on the divider.',
      },
      {
        src: '/lessons/p11-09-inline-parallel.svg',
        alt: 'Parallel tool calls collapsing round trips',
        caption: 'Two tool calls emitted in one turn execute concurrently, cutting latency 60 to 80 percent on multi-tool queries.',
        diagramBrief: 'Cream paper. Top row: single arrow "1 round trip" pointing to two boxes side by side "get_weather(Tokyo)" and "get_weather(New York)" executing in parallel. Bottom row for contrast: two sequential arrows labeled "2 round trips" for the serial case. Blue accent on the parallel row.',
      },
    ],
    takeaways: [
      'The model proposes, your code executes. Every confirmation, permission, and undo affordance belongs at that seam.',
      'Tool descriptions are prompts. Rewriting a schema description is a real fix for wrong-tool selection.',
      'Parallel tool calls cut latency 60 to 80 percent on multi-tool queries. Serial execution is a design smell, not just an infra one.',
      'Return errors as structured tool results. Models recover from a clear error message and stall on a generic one.',
    ],
    terms: [
      { term: 'Function calling', gloss: '"tool use"', meaning: 'The model emits structured JSON naming a function and arguments; your application executes it, the model never does.' },
      { term: 'Tool definition', gloss: '"function schema"', meaning: 'A JSON Schema describing a tool\'s name, purpose, and typed parameters, which the model reads to decide when and how to use it.' },
      { term: 'Tool choice', gloss: '"calling mode"', meaning: 'The setting that lets the model decide (auto), forces any tool call (required), or names one specific tool.' },
      { term: 'Parallel calling', gloss: '"multi-tool"', meaning: 'Multiple tool calls emitted in a single turn and executed concurrently, collapsing round trips.' },
      { term: 'Agent loop', gloss: '"ReAct loop"', meaning: 'The cycle of model decides, code executes, result returns, repeated until the model has enough to answer.' },
      { term: 'Structured outputs', gloss: '"force a JSON shape"', meaning: 'Using JSON Schema to make the model\'s final answer, not an intermediate action, conform to a fixed structure.' },
      { term: 'Tool poisoning', gloss: '"prompt injection via tools"', meaning: 'An attack where a tool result carries instructions that hijack the model, which is why results get sanitised before returning.' },
      { term: 'Argument validation', gloss: '"input checking"', meaning: 'Verifying model-generated arguments against expected types, ranges, and formats before a tool executes.' },
      { term: 'MCP', gloss: '"tool protocol"', meaning: 'Model Context Protocol, an open standard where tools are served once and consumed by any compatible client.' },
      { term: 'Allowlist', gloss: '"which functions are callable"', meaning: 'The fixed, explicit set of functions a model may invoke; never a generic "run any function by name" tool.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Write the JSON Schema description for a "cancel_subscription" tool that takes a user id and a reason string, worded so the model picks it over a similarly named "pause_subscription" tool.' },
      { level: 'medium', prompt: 'A query needs weather for three cities. At 400ms per sequential call versus one parallel round trip at 450ms total, what is the latency saved, and as a percentage?' },
      { level: 'medium', prompt: 'A tool call returns an error: "city not found." Write the structured error object you would return, and the model-visible message that helps it retry correctly.' },
      { level: 'hard', prompt: 'A tool set includes a database query function. List the five security rules from this lesson and identify which one is being violated if a model can call it with a raw SQL string.' },
      { level: 'design', prompt: 'Sketch a confirmation UI that sits at the seam between "model proposes: delete_file(path)" and "code executes." What does the user see before the delete runs, and what happens if they navigate away mid-confirmation?' },
    ],
    furtherReading: [
      { label: 'OpenAI Function Calling Guide', url: 'https://platform.openai.com/docs/guides/function-calling', why: 'The reference for tool use with GPT-5-class models, including parallel and forced calling.' },
      { label: 'Anthropic Tool Use Guide', url: 'https://docs.anthropic.com/en/docs/tool-use', why: 'Claude\'s implementation: input_schema, multi-block tool_use, and tool_choice configuration.' },
      { label: 'Model Context Protocol Specification', url: 'https://modelcontextprotocol.io', why: 'The open standard for tool interoperability once a tool needs to serve more than one client.' },
      { label: 'Yao et al., "ReAct: Synergizing Reasoning and Acting in Language Models" (ICLR 2023)', url: 'https://arxiv.org/abs/2210.03629', why: 'The Thought-Action-Observation loop underneath every agent loop built on tool calls.' },
      { label: 'Anthropic, "Building effective agents" (Dec 2024)', url: 'https://www.anthropic.com/research/building-effective-agents', why: 'Five composable patterns built from the single tool-use primitive: chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Tool schema and permission-gate checklist',
      body: '- Does every tool description say what it does and what it returns, in one specific sentence?\n- Is tool_choice set deliberately (auto, required, or named), not left on the default without thinking about it?\n- Does the code path between "model proposes" and "code executes" have a visible confirmation state for anything irreversible?\n- Are arguments validated against type, range, and allowlist before the function runs?\n- Are tool results sanitised before they go back to the model, so a poisoned result cannot hijack the next turn?',
    },
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
      'Most teams ship LLM changes by reading ten outputs and calling it fine. Automated evals score against rubrics, compute confidence intervals, and block the merge when quality regresses.',
    readTime: '~10 min read',
    whyItMatters:
      'The criteria list is the spec for the surface, so it should read like the states you built: correctness, but also helpfulness, or you will ship a component whose refusal state fires 34 percent more often than intended and call it a safety win. Write the anchored rubric yourself, since naming observable behaviour per level cuts judge variance 30 to 40 percent and that is the same work as writing acceptance criteria. Sample size settles the arguments: at 50 cases the interval is 19 points wide, so nobody can tell 80 percent from 96. Use 200 as the floor for anything gating a merge.',
    learningObjectives: [
      'Explain why reading a handful of outputs cannot detect a 5 percent quality regression.',
      'Compute the 95 percent confidence interval width at 50, 200, and 1,000 test cases, and state the minimum sample size for a deploy gate.',
      'Write an anchored rubric for one criterion and explain why anchoring reduces judge variance.',
      'Compare string metrics, LLM-as-judge, and human evaluation on cost, speed, and correlation with human judgment.',
      'Design a regression-testing gate that blocks a merge on a specific criterion, not just an overall average.',
    ],
    sections: [
      {
        heading: 'The problem: nobody notices for eleven days',
        body: 'A support chatbot is working. Someone tightens the system prompt to reduce hallucinations, and it works: hallucination rate falls. Answer completeness also falls 34 percent, because the model now refuses anything it is not fully certain about. Nobody notices for 11 days. Self-service revenue drops and ticket volume spikes.\n\nThis is the default outcome of evaluating by vibes. LLM outputs are stochastic. A prompt that passes 5 test cases fails the 6th. A model scoring 92 percent on your benchmark scores 71 percent on the edge cases users actually send.',
      },
      {
        heading: 'Three methods, one workhorse',
        body: 'String metrics (BLEU, ROUGE, BERTScore) are free and instant, scoring 10,000 outputs in seconds, but they correlate with human judgment only 40 to 70 percent. Two answers can share no words and both be right.\n\n| Method | Cost per 1,000 evals | Correlation with humans |\n|---|---|---|\n| BLEU/ROUGE | $0 | 40-60% |\n| BERTScore | $0 | 55-70% |\n| LLM-as-judge (GPT-5-mini) | ~$8 | 82-86% |\n| LLM-as-judge (Claude Opus 4.7) | ~$25 | 85-88% |\n| Human expert | ~$500 | 100% by definition |\n\nHuman evaluation is the gold standard, reserved for calibration rather than every commit. LLM-as-judge is what you will use 90 percent of the time. The rule that matters: the judge must be at least as capable as the model being judged.',
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
        body: 'Three kinds of cases earn their place. A golden set of 50 to 100 curated pairs covering core use cases, which every change must pass. 20 to 50 adversarial cases: injections, ambiguity, out-of-domain questions, requests for harmful content. And 100 to 200 sampled from real production traffic, which catch what curated tests never imagine.\n\nWire it to CI. Run the suite on baseline, make the change, run it again, compare with a paired test, block on statistically significant regression in any criterion. A 200-case suite on GPT-5-mini costs about $4 a run, so ten PRs a week is $160 a month against 11 days of silent degradation. promptfoo, DeepEval, Braintrust, LangSmith, and Arize Phoenix all provide the plumbing.',
      },
      {
        heading: 'History: from BLEU to judge models',
        body: 'BLEU arrived in 2002 for machine translation, scoring n-gram overlap against a reference. ROUGE followed in 2004 for summarization, doing the recall-oriented mirror image. Both are fast, free, and blind to meaning: two paraphrases with zero shared words score near zero even when both are correct.\n\nLLM-as-judge is a 2023 idea, formalised in the MT-Bench and Chatbot Arena paper, which showed a strong model grading another model\'s output correlates with human raters well enough to automate at scale. By 2026 it is the default: promptfoo, DeepEval, and Braintrust all ship it as the primary scorer, with string metrics kept around as a free first-pass filter.',
      },
      {
        heading: 'Anti-patterns that quietly ship a regression',
        body: 'Five anti-patterns keep shipping the same regression. Vibes-based evaluation: reading five outputs and calling it good, when the brain reliably cherry-picks confirming examples. Testing on training examples: an eval case that overlaps your prompt or fine-tuning data measures memorisation, not generalisation. Single-metric obsession: optimising correctness alone produces answers that are technically right and useless. Evaluating without a baseline: a score of 4.2 out of 5 means nothing without knowing yesterday\'s score. Using a weak judge: a model less capable than the one it grades produces noisy, inconsistent scores.\n\nEvery one of these passes a demo and fails in production, which is exactly the gap eval infrastructure exists to close.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p11-10-inline-ci-width.svg',
        alt: 'Confidence interval width shrinking with sample size',
        caption: 'At 50 cases the interval is 19 points wide; at 200 it is 9. Use 200 as the floor for any deploy gate.',
        diagramBrief: 'Cream paper. A horizontal bar chart, one bar per sample size (50, 100, 200, 500, 1000), each bar showing an error-bar-style interval width shrinking from 19 points down to 3 points. Label each bar with its width. Blue accent on the 200-case bar with a callout "deploy gate floor".',
      },
      {
        src: '/lessons/p11-10-inline-criteria-breakdown.svg',
        alt: 'One overall score hiding a per-criterion collapse',
        caption: 'Overall quality moved from 4.0 to 4.1, but helpfulness dropped 34 percent underneath it.',
        diagramBrief: 'Cream paper. A single large bar labeled "Overall: 4.0 to 4.1" at the top, small and unremarkable. Below it, four smaller bars for Safety (up), Correctness (up), Relevance (flat), Helpfulness (down, clearly shorter, dark accent). Arrow connecting the top bar down to the four, labeled "the average hides this."',
      },
    ],
    takeaways: [
      'Below 200 test cases your confidence interval is too wide to gate a deploy on. 50 cases cannot separate 80 percent from 96.',
      'Score at least four criteria. Optimising correctness alone produces answers that are technically right and useless.',
      'Anchored rubrics cut judge variance 30 to 40 percent, which makes rubric writing a real design contribution.',
      'The judge must be at least as strong as the model it judges, and an eval suite has to run automatically or it will not run.',
    ],
    terms: [
      { term: 'Eval', gloss: '"testing"', meaning: 'Systematically scoring LLM outputs against defined criteria using automated metrics, LLM judges, or human review.' },
      { term: 'LLM-as-judge', gloss: '"AI grading"', meaning: 'Using a strong model to score outputs against a rubric; correlates 82 to 88 percent with human raters.' },
      { term: 'Anchored rubric', gloss: '"a scoring guide"', meaning: 'A rubric that names observable behaviour at each score level instead of leaving the scale to the judge\'s invention.' },
      { term: 'Golden test set', gloss: '"core evals"', meaning: 'The curated 50 to 100 cases covering core use cases that every change must pass before shipping.' },
      { term: 'Confidence interval', gloss: '"error bars"', meaning: 'The range around a measured score showing how much uncertainty the sample size leaves; narrower with more test cases.' },
      { term: 'Regression testing', gloss: '"before and after"', meaning: 'Running the same eval suite on the old and new version to catch degradation before it ships.' },
      { term: 'Pairwise comparison', gloss: '"A versus B"', meaning: 'Showing a judge two outputs and asking which is better, which removes the need to calibrate an absolute scale.' },
      { term: 'BLEU/ROUGE', gloss: '"text overlap score"', meaning: 'N-gram overlap metrics from machine translation and summarization; fast and free but blind to meaning.' },
      { term: 'Faithfulness', gloss: '"stayed grounded"', meaning: 'Whether a generated answer is supported by its retrieved or given context rather than invented.' },
      { term: 'Wilson interval', gloss: '"pass-rate confidence"', meaning: 'A confidence interval for a proportion, like a pass rate, that stays accurate even at small sample sizes.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'At n=50 and a measured 90 percent pass rate, the 95 percent confidence interval is roughly 19 points wide. What two scores at the edges of that interval could both be the "true" rate?' },
      { level: 'medium', prompt: 'Rewrite this rubric level so it is anchored: "3 out of 5: pretty good but not great." Name the specific observable behaviour a 3 should describe.' },
      { level: 'medium', prompt: 'A prompt change raises correctness from 4.3 to 4.6 and drops helpfulness from 4.1 to 2.7. The overall average moves from 4.0 to 4.1. What does a gate that blocks on any single criterion regressing beyond 0.3 do with this change that a gate on overall average alone would miss?' },
      { level: 'hard', prompt: 'A team wants to compare two close prompt versions where a 3-point quality difference matters. Using the sample-size guidance in this lesson, what is the minimum n you would insist on, and why would 100 cases not be enough?' },
      { level: 'design', prompt: 'Sketch the PR-level UI for an eval report: what does an engineer see when a merge is blocked for a regression, and what is the one thing that has to be visible without opening a log file?' },
    ],
    furtherReading: [
      { label: 'Zheng et al., "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena" (2023)', url: 'https://arxiv.org/abs/2306.05685', why: 'The paper that established LLM-as-judge as a calibrated, scalable evaluation method.' },
      { label: 'promptfoo documentation', url: 'https://promptfoo.dev/docs/intro', why: 'The fastest practical path from zero to a YAML-configured eval pipeline with CI integration.' },
      { label: 'Ribeiro et al., "Beyond Accuracy: Behavioral Testing of NLP Models with CheckList" (2020)', url: 'https://arxiv.org/abs/2005.04118', why: 'A systematic behavioral-testing methodology that applies directly to LLM eval design.' },
      { label: 'Es et al., "RAGAS: Automated Evaluation of Retrieval Augmented Generation" (EACL 2024)', url: 'https://arxiv.org/abs/2309.15217', why: 'Reference-free RAG metrics, faithfulness, answer relevancy, context precision, that scale without human labelers.' },
      { label: 'Liu et al., "G-Eval: NLG Evaluation using GPT-4 with Better Human Alignment" (EMNLP 2023)', url: 'https://arxiv.org/abs/2303.16634', why: 'The chain-of-thought judge protocol and its calibration failure modes, essential reading before building your own judge.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Eval-gate readiness checklist',
      body: '- Do you have at least 200 test cases, or is your confidence interval too wide to trust a merge decision?\n- Does your rubric name observable behaviour per score level, not just a bare 1-5 scale?\n- Are you scoring at least four criteria (relevance, correctness, helpfulness, safety), not one?\n- Is the judge model at least as capable as the model being judged?\n- Does the gate block on any single criterion regressing, not just on the overall average moving?',
    },
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
