import type { Lesson } from '@/lib/lessons';

// Phase 12 · Part 5 · Multimodal in the real world (lessons 12.21-12.25)
export const phase12Part5: Lesson[] = [
  {
    id: 'p12-21-embodied-vlas',
    phase: 'Phase 12 · Multimodal AI',
    part: 'Part 5 · Multimodal in the real world',
    index: '12.21',
    title: 'Embodied VLAs: when the output tokens move a robot arm',
    oneLiner:
      'A vision-language-action model is a VLM whose output is not text but motion: joint targets, gripper commands, whole-body poses. RT-2 proved web knowledge transfers to robots; OpenVLA, π0, and GR00T made it a product category.',
    readTime: '~8 min read',
    diagram: 'lessons/p12-21.svg',
    diagramCaption:
      'The VLA lineage: RT-2 discretizes actions as text tokens, FAST compresses them, π0 goes continuous with flow matching, GR00T splits planning from control.',
    whyItMatters:
      'VLAs make the latency budget physical. A 30 Hz control loop gives the model 33ms per action, so every architecture choice (discrete tokens vs flow matching, one model vs a dual system) is a response-time decision you would recognize from interface work, except a miss damages hardware instead of dropping a frame. The other transferable idea: the VLA\'s output is a suggestion, and a separate control layer holds the hard limits. That is the same trust architecture as any agent product: capability in the model, authority in the guardrails around it.',
    sections: [
      {
        heading: 'The problem: language out is easy, torque out is not',
        body: 'A robot that does chores from a sentence has been the target since the 1970s. The 2020s answer reuses the VLM stack, but actions break three assumptions text never had. Action spaces are continuous and high-dimensional: a 7-DOF arm plus gripper is 10 dimensions, emitted 30 times a second. Robot data is scarce: Open X-Embodiment holds about 1M trajectories while web image-text runs past 5B pairs. And the cost of a wrong output is not a bad sentence, it is a broken object or a hurt person.',
      },
      {
        heading: 'The move: actions as text tokens',
        body: 'RT-2 (Google DeepMind, 2023) made actions speak the model\'s native language. Normalize each joint target to [-1, 1], discretize into 256 bins, map each bin to a vocabulary ID. A 10-DOF action becomes 10 tokens, decoded like words.\n\nThe payoff came from co-fine-tuning: mix web VQA data with robot demonstrations at roughly 1:1. Web knowledge survives, so the robot follows "move toward the fast-moving object" even though "fast-moving" never appeared in robot data. Robot-only training produces models that fail the moment the phrasing is novel.',
      },
      {
        heading: 'Faster actions: FAST compression and π0\'s flow matching',
        body: 'RT-2 decoded at 3 to 5 Hz, throttled by autoregressive generation. Two fixes followed. FAST compresses action trajectories in the frequency domain: a 30-step trajectory that cost 300 discrete-bin tokens becomes about 10 FAST tokens, a 3 to 5x speedup with no quality loss.\n\nπ0 (Physical Intelligence, 2024) dropped tokens entirely. A small flow-matching action expert reads the VLM\'s hidden states and emits a continuous 50-step action sequence in about 5 denoising steps, effectively 50 Hz control. Continuity preserves the smoothness that discretization destroys.',
      },
      {
        heading: 'GR00T: plan slowly, act quickly',
        body: 'NVIDIA\'s GR00T N1 (2025) targets humanoids with more than 30 degrees of freedom, where one model cannot both think and keep up. So it splits: System 2, a large VLM, reads the scene and instruction and produces subgoals at about 1 Hz. System 1, a small action transformer, turns subgoals into 50 to 100 Hz joint commands.\n\nThe split is Kahneman\'s fast-and-slow thinking as an architecture. Slow planning never blocks fast control, and the fast half stays small enough to meet the latency budget. The pattern is spreading well beyond robots.',
      },
      {
        heading: 'The data and the guardrails',
        body: 'Everyone trains on Open X-Embodiment: 22 datasets, about 970k trajectories across 22 robots, unified action spaces and normalized joint ranges. The domain gap to your specific robot closes with LoRA fine-tuning on 100 to 1000 task demos.\n\nAnd every production VLA ships wrapped in checks it cannot override: hard joint limits, velocity clipping, workspace bounds, human approval for novel tasks. These live outside the model in the control layer. The VLA proposes; the guardrails dispose.',
      },
    ],
    takeaways: [
      'A VLA is the VQA architecture with actions as output. The hard parts are continuous action spaces, scarce robot data, and a 33ms-per-action latency budget.',
      'Co-fine-tuning web data with robot demos (roughly 1:1) is what preserves generalization. Robot-only training fails on any novel phrasing.',
      'Action format is the speed lever: 256-bin tokens run 3 to 5 Hz, FAST compression 3 to 5x faster, π0\'s flow matching effectively 50 Hz.',
      'The VLA\'s output is a suggestion. Hard limits, workspace bounds, and human approval live in a control layer the model cannot override.',
    ],
    terms: [
      { term: 'VLA', meaning: 'Vision-language-action model: takes an image plus an instruction, outputs robot action commands.' },
      { term: 'Action tokenization', meaning: 'Quantizing continuous joint targets into 256 bins per dimension, each bin a vocabulary ID.' },
      { term: 'FAST tokenizer', meaning: 'Frequency-domain compression that turns a 30-step action trajectory into about 10 tokens.' },
      { term: 'Flow-matching action head', meaning: 'π0\'s small transformer that emits a continuous 50-step action sequence via rectified flow.' },
      { term: 'Co-fine-tuning', meaning: 'Training on web VQA data alongside robot demos so general knowledge survives into control.' },
      { term: 'Open X-Embodiment', meaning: 'The cross-robot corpus of about 1M trajectories from 22 robots that VLAs train on.' },
    ],
    demoCaption:
      'Same robot, same instruction, two training recipes. Flip between a robot-only model and a co-fine-tuned one and watch what happens when the phrasing leaves the training distribution.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Instruction: "pick up the third largest object from the left"',
      badLabel: 'Robot-only',
      goodLabel: 'Co-fine-tuned',
      badLines: [
        'Trained on: 970k robot trajectories, nothing else',
        'Knows: "pick up the red cube" (seen in demos)',
        '"third largest"? never appeared in robot data',
        'Result: grabs the nearest object, task failed',
      ],
      goodLines: [
        'Trained on: robot trajectories + web VQA, ~1:1 mix',
        'Web data taught counting, size comparison, spatial language',
        'Grounds "third largest from the left" via general knowledge',
        'Result: correct object, novel phrasing handled',
      ],
      badCaption:
        'The misreading: more robot data should mean a better robot. But robot-only training overwrites the general knowledge the VLM arrived with, so any instruction outside the demo distribution fails.',
      goodCaption:
        'The mechanism: co-fine-tuning keeps web-scale language and vision knowledge alive next to the action data. The mixing ratio is a real hyperparameter: too much VQA and actions degrade, too much robot data and language understanding collapses.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'how does a language model move a robot arm? it spells the motion.',
        body:
          'how does a language model move a robot arm? it spells the motion.\n\nRT-2: normalize each joint target, cut the range into 256 bins, give each bin a vocab ID. a 10-DOF action = 10 tokens, decoded like words.\n\ntrained half on web data, half on robot demos. the web half is why it follows instructions no robot dataset ever contained.',
      },
      {
        kind: 'X · design angle',
        hook: 'robotics has the honest version of every agent product\'s trust model.',
        body:
          'robotics has the honest version of every agent product\'s trust model.\n\nthe VLA proposes an action. a control layer it cannot override holds the hard limits: joint specs, velocity clips, workspace bounds, human approval for novel tasks.\n\ncapability in the model, authority in the guardrails. if your software agent skips that split, the robot people already know how it ends.',
      },
      {
        kind: 'X · one-liner',
        hook: 'a robot control loop gives the model 33ms per decision. your app gives it 30 seconds.',
        body:
          'a robot control loop gives the model 33ms per decision. your app gives it 30 seconds.\n\nthat gap is why robotics invented the dual-system trick: big model plans at 1 Hz, tiny model acts at 50-100 Hz. plan slowly, act quickly. it will show up in your product category next.',
      },
    ],
    source: {
      label: 'Full lesson: 12.21 embodied-vlas-openvla-pi0-groot',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/12-multimodal-ai/21-embodied-vlas-openvla-pi0-groot',
    },
  },
  {
    id: 'p12-22-document-understanding',
    phase: 'Phase 12 · Multimodal AI',
    part: 'Part 5 · Multimodal in the real world',
    index: '12.22',
    title: 'Document AI: three eras, from Tesseract to VLM-native',
    oneLiner:
      'Documents are not photos: layout, tables, and typography carry meaning that raw OCR throws away. Document AI moved through three eras, and by 2026 the frontier answer is "feed the page image to the VLM", with the pipeline surviving only where audit trails matter.',
    readTime: '~8 min read',
    diagram: 'lessons/p12-22.svg',
    diagramCaption:
      'Three eras of document AI: staged OCR pipeline, OCR-free specialists that emit markup, and VLM-native page reading at high resolution.',
    whyItMatters:
      'Document ingestion is where agent governance meets messy reality: policies, invoices, contracts, and evidence all arrive as PDFs, and the stack you pick decides what an auditor can verify. A deterministic OCR pipeline fails predictably and leaves an inspectable text trail; a VLM-native reader is more accurate on tables and handwriting but can hallucinate a field with full confidence. For Armoriq-style compliance surfaces, that is a product decision, not a model one: it sets whether your UI needs confidence treatments, disagreement flags, and a review queue, or can present extraction as fact.',
    sections: [
      {
        heading: 'The problem: the text is only 90 percent of the signal',
        body: '"Understand this PDF" hides real structure. The information lives in text content, but also in layout (headers, footnotes, two-column flow), tables with merged cells, figures, handwritten annotations, and typography that separates a title from body copy.\n\nRaw OCR dumps the words and discards everything else. An invoice system needs to know that "Total: $1,245" came from the bottom-right summary block, not from a footnote. Position is semantics, and a flat text stream cannot carry it.',
      },
      {
        heading: 'Era 1: the pipeline (pre-2021)',
        body: 'The classic stack ran five stages: render the PDF to images, extract words plus bounding boxes with Tesseract or a commercial OCR, detect layout blocks, parse table structure, then apply domain rules and regex to pull fields.\n\nIt works on clean printed text and breaks on handwriting, skewed scans, complex tables, and non-Latin scripts, with every failure needing a custom exception path. TrOCR (2021) upgraded the OCR stage itself with a transformer encoder-decoder, a clean win on handwriting, but the architecture stayed a fragile chain of stages.',
      },
      {
        heading: 'Era 2: skip the OCR entirely (2022-2023)',
        body: 'OCR-free models map page pixels straight to structured output. Donut emits JSON for forms; Nougat, trained on scientific papers, emits LaTeX and markdown and became the model every arXiv parser calls. Both are specialists: Donut fails on a paper, Nougat fails on an invoice.\n\nOn a parallel track, LayoutLMv3 kept OCR but fused three input streams (text tokens, per-token bounding boxes, image patches) under one masked objective. It is the peak of OCR-based document understanding and still the cost-efficient pick for printed forms at scale.',
      },
      {
        heading: 'Era 3: VLM-native (2024 onward)',
        body: 'By 2024, general VLMs got good enough to replace the pipeline: feed the page image at high resolution, ask the question. Qwen2.5-VL handles 2048px natively; Claude Opus 4.7 takes 2576px pages; PaliGemma 2 trains specifically on documents and handwriting.\n\nThe early-2026 numbers tell the story: on DocVQA, Claude 4.7 scores about 95, PaliGemma 2 about 88, a pipelined LayoutLMv3 about 83, Nougat about 77. VLM-native now wins on mixed handwriting, merged-cell tables, embedded equations, and annotated figures. The gap is mostly resolution plus base-LLM scale.',
      },
      {
        heading: 'The 2026 recipe: match the stack to the risk',
        body: 'Pipelines still win three cases: massive pure-scan workloads where per-page cost dominates, environments that need deterministic failures instead of fluent hallucinations, and regulated settings that require auditable OCR output.\n\nSo the recipe is a routing table. Printed invoices at 10M pages a day: LayoutLMv3 plus rules. Mixed messy documents: VLM-native. Scientific ingestion: Nougat for equations, a VLM for tricky pages. Regulatory: OCR pipeline as primary with a VLM cross-check, and a defined path for when they disagree.',
      },
    ],
    takeaways: [
      'Layout is semantics. A field\'s position on the page carries meaning that flat OCR text cannot represent, which is why pipelines needed a layout model at all.',
      'OCR-free specialists (Donut, Nougat) beat pipelines inside their domain and fail outside it. Specialization is a real deployment constraint, not a footnote.',
      'VLM-native reading wins on accuracy by 2026 (DocVQA about 95 vs 83 pipelined), but it fails by hallucinating fluently where a pipeline fails detectably.',
      'Regulated document flows want the hybrid: deterministic OCR as the auditable primary, a VLM as cross-check, and UI that surfaces disagreement instead of hiding it.',
    ],
    terms: [
      { term: 'OCR pipeline', meaning: 'The staged stack: detect, OCR, layout, rules. Deterministic and fragile.' },
      { term: 'OCR-free', meaning: 'A single transformer that maps page pixels directly to structured output, no explicit text extraction.' },
      { term: 'LayoutLMv3', meaning: 'The layout-aware model fusing text tokens, bounding boxes, and image patches under one masked objective.' },
      { term: 'Nougat', meaning: 'The OCR-free specialist that converts scientific papers into LaTeX and markdown.' },
      { term: 'VLM-native', meaning: 'Feeding the full page image to a frontier VLM at high resolution, no pipeline at all.' },
      { term: 'DocVQA', meaning: 'The standard document question-answering benchmark; the most-cited document AI score.' },
    ],
    demoCaption:
      'One invoice, two readers. The left side is what a flat OCR dump preserves; the right is what a layout-aware reading returns. The difference is not the words, it is knowing where they were.',
    demo: {
      archetype: 'before-after',
      subject: 'Invoice #8841, one page',
      badLabel: 'Flat OCR dump',
      goodLabel: 'Layout-aware reading',
      badLines: [
        'ACME Corp Invoice 8841 Net 30',
        'Widget A 12 $340 Widget B 3 $905',
        '$1,245 $124.50 Thank you for your business',
        'Which number is the total? The reader must guess.',
      ],
      goodLines: [
        'Header: ACME Corp, Invoice 8841, terms Net 30',
        'Table: 2 line items, qty and amount columns intact',
        'Summary block (bottom-right): Total $1,245, tax $124.50',
        'Footer text excluded from extraction',
      ],
      badCaption:
        'OCR preserved every word and lost the document. Without position, the total, the tax, and a footnote are just three numbers in a stream, and downstream rules break on the first unusual template.',
      goodCaption:
        'Layout-aware models (bounding-box streams, or a VLM reading the full page image) keep position as part of meaning. "Total" is the number in the bottom-right summary block. That is what the three eras of document AI were converging toward.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'OCR gives you every word on the invoice and still loses the invoice.',
        body:
          'OCR gives you every word on the invoice and still loses the invoice.\n\n"$1,245" means nothing in a flat text stream. it means "the total" because it sits in the bottom-right summary block. position is semantics.\n\ndocument AI spent a decade rebuilding that one fact: bbox streams (LayoutLM), then markup emitters (Donut, Nougat), then just feeding the page image to a VLM.',
      },
      {
        kind: 'X · design angle',
        hook: 'the document stack you pick decides what your review UI has to be.',
        body:
          'the document stack you pick decides what your review UI has to be.\n\nOCR pipeline: fails predictably, leaves an auditable trail. worse accuracy.\nVLM-native: reads tables and handwriting better, and hallucinates a field with full confidence.\n\nif the extraction feeds compliance, the design answer is a hybrid plus a disagreement queue, not a bigger model.',
      },
      {
        kind: 'X · one-liner',
        hook: 'document AI in 2026: the pipeline lost on accuracy and survives on auditability.',
        body:
          'document AI in 2026: the pipeline lost on accuracy and survives on auditability.\n\nDocVQA: frontier VLM ~95, pipelined LayoutLMv3 ~83. but one of them can show a regulator exactly which pixels produced which field. guess which one regulated industries still run.',
      },
    ],
    source: {
      label: 'Full lesson: 12.22 document-diagram-understanding',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/12-multimodal-ai/22-document-diagram-understanding',
    },
  },
  {
    id: 'p12-23-colpali',
    phase: 'Phase 12 · Multimodal AI',
    part: 'Part 5 · Multimodal in the real world',
    index: '12.23',
    title: 'ColPali: retrieval that never extracts the text',
    oneLiner:
      'Text-RAG on PDFs is five lossy steps that drop charts, break tables, and flatten layout. ColPali embeds the page image directly and retrieves with ColBERT-style MaxSim over patches, beating text-RAG by 20 to 40 percent on visually rich documents.',
    readTime: '~8 min read',
    diagram: 'lessons/p12-23.svg',
    diagramCaption:
      'MaxSim over patches: each query token picks its best-matching page patch, and the page\'s score is the sum of those maxima.',
    whyItMatters:
      'If your product answers questions over PDFs, the retrieval layer decides what the model can even see, before generation quality matters at all. Text-RAG silently deletes exactly the content teams care about: the revenue chart, the signature block, the annotated figure. ColPali\'s lesson for product work is that fidelity is bought with storage (roughly 30x raw, 5 to 10x compressed), which turns "how good is search" into a costed, tunable dial rather than a mystery. When a stakeholder asks why the assistant cannot find the chart from the Q3 report, this architecture choice is usually the answer.',
    sections: [
      {
        heading: 'The problem: five lossy steps between the PDF and the model',
        body: 'The standard text-RAG pipeline: convert PDF to text via OCR, split into 300 to 500 token chunks, embed each chunk into one vector, retrieve by cosine similarity, hand chunks to the LLM.\n\nEvery step loses signal. OCR drops chart data. Chunking cuts table rows in half. Single-vector embedding averages a page into one point. A financial report\'s Q3 growth usually lives in a chart; a contract\'s signature block is a layout fact. By the time retrieval runs, that content no longer exists in the index.',
      },
      {
        heading: 'The prior art: ColBERT\'s late interaction',
        body: 'ColBERT (2020) is a text retrieval idea: keep one vector per token instead of one per document. At query time, every query token searches the document\'s token vectors, takes its single best match, and the document\'s score is the sum of those maxima. That operation is MaxSim.\n\nThe payoff is granularity: each query term gets to find its own evidence anywhere in the document instead of hoping the average vector points the right way. The cost is storage, many vectors per document instead of one.',
      },
      {
        heading: 'The move: MaxSim over image patches',
        body: 'ColPali (2024) applies the pattern to pages. Encode each page image with PaliGemma into patch embeddings, hundreds of vectors per page, each capturing local layout and content. Encode the text query into token embeddings. Score each page with MaxSim: every query token picks its best patch, sum the maxima, return the top-k pages.\n\nNo OCR anywhere. Charts, fonts, figures, and layout all survive into retrieval. On the ViDoRe benchmark ColPali scores about 80 percent nDCG@5 where text-RAG on the same documents manages 50 to 60.',
      },
      {
        heading: 'The bill: storage is the tradeoff',
        body: 'A 50-page report at 729 patches per page and 128-dim embeddings costs about 18 MB raw, versus roughly 150 kB for 50 text chunks. That is about 30x per document, brought down to 5 to 10x with product quantization.\n\nThe family spans the tradeoff. ColQwen2 swaps in a stronger encoder for better retrieval. ColSmol runs at about 1B parameters on a consumer GPU. VisRAG pools each page into a single vector: cheaper storage and faster indexing, weaker recall. Quality or scale, pick per corpus.',
      },
      {
        heading: 'When text-RAG still wins',
        body: 'Vision-native retrieval is not a universal upgrade. Pure-text corpora with no layout signal (wikis, chat logs) get nothing from patches and pay the storage bill anyway. Multi-million-page archives can be dominated by storage cost. And regulated flows that must produce extractable OCR text alongside retrieval still need the text pipeline.\n\nFor the visually rich cases, financial reports, scientific papers, contracts, medical records, and design documentation, the 2026 default has flipped: embed the page, not the extraction.',
      },
    ],
    takeaways: [
      'Retrieval quality is capped by what survives indexing. Text-RAG deletes charts, tables, and layout before the model ever gets a chance.',
      'MaxSim is the mechanism: each query token picks its best-matching patch, so fine-grained evidence anywhere on the page can win the retrieval.',
      'The fidelity is bought with storage: about 30x raw, 5 to 10x after product quantization. That is a costed dial, not a mystery.',
      'Match the retriever to the corpus: ColPali family for visually rich documents, VisRAG for scale, plain text-RAG for text-only corpora.',
    ],
    terms: [
      { term: 'Late interaction', meaning: 'Retrieval that keeps many vectors per document and matches at query time, instead of one pre-pooled vector.' },
      { term: 'MaxSim', meaning: 'For each query token, take the highest similarity against the document\'s vectors, then sum across query tokens.' },
      { term: 'Bi-encoder', meaning: 'One vector per document; fast and cheap, but granular evidence gets averaged away.' },
      { term: 'Patch embedding', meaning: 'One vector per image patch of the page, capturing local content and layout.' },
      { term: 'ViDoRe', meaning: 'ColPali\'s benchmark for visual document retrieval, scored with nDCG@5.' },
      { term: 'Product quantization', meaning: 'Vector compression that preserves similarity while shrinking storage about 8x.' },
    ],
    demoCaption:
      'The query asks for chart data. Flip between the two retrieval stacks and trace where the chart survives, and where it silently disappears before the model ever sees the page.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Query: "What was Q3 revenue growth?"',
      badLabel: 'Text-RAG',
      goodLabel: 'ColPali',
      badLines: [
        'OCR extracts text: the revenue chart becomes nothing',
        'Chunking splits the summary table across two chunks',
        'One vector per chunk: page meaning averaged to a point',
        'Top-k returns prose near "revenue"; the answer is gone',
      ],
      goodLines: [
        'Page embedded as 729 patch vectors, chart included',
        'Query tokens: "Q3", "revenue", "growth"',
        'MaxSim: each token picks its best patch; chart region wins',
        'Top page returned as an image; the VLM reads the chart',
      ],
      badCaption:
        'The misreading: "our RAG is bad at charts, we need a better LLM." The LLM never saw the chart. OCR deleted it at ingestion, three steps before generation.',
      goodCaption:
        'The mechanism: index the page image itself and let each query token hunt for its own best patch. Fidelity costs storage (about 30x raw, 5 to 10x quantized), which is why this is a per-corpus decision, not a default.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'your RAG did not fail to answer. it failed to index.',
        body:
          'your RAG did not fail to answer. it failed to index.\n\ntext-RAG on PDFs: OCR drops the chart, chunking breaks the table, one-vector embedding averages the page away. the answer was deleted three steps before the LLM ran.\n\nColPali skips extraction: embed the page image as patch vectors, retrieve with MaxSim. 20-40% better on visually rich docs.',
      },
      {
        kind: 'X · design angle',
        hook: '"why can\'t the assistant find the chart from the Q3 report" is an architecture question with a price tag.',
        body:
          '"why can\'t the assistant find the chart from the Q3 report" is an architecture question with a price tag.\n\nvision-native retrieval keeps charts, tables, layout. it costs ~30x storage raw, 5-10x quantized.\n\nthat makes search quality a costed dial you can present in a roadmap review, not a model mystery. decide per corpus, not by default.',
      },
      {
        kind: 'X · one-liner',
        hook: 'ColPali\'s whole thesis: stop extracting the text. the page was already the data.',
        body:
          'ColPali\'s whole thesis: stop extracting the text. the page was already the data.\n\nembed the page image, let every query token pick its best patch, sum the maxima. ~80% nDCG@5 where text-RAG gets 50-60 on the same documents.',
      },
    ],
    source: {
      label: 'Full lesson: 12.23 colpali-vision-native-rag',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/12-multimodal-ai/23-colpali-vision-native-rag',
    },
  },
  {
    id: 'p12-24-multimodal-rag',
    phase: 'Phase 12 · Multimodal AI',
    part: 'Part 5 · Multimodal in the real world',
    index: '12.24',
    title: 'Multimodal RAG: retrieving across text, image, and audio',
    oneLiner:
      'Production multimodal RAG retrieves evidence across modalities ("quiet vegan brunch with natural light" needs reviews, photos, and sound), fuses the scores, and generates an answer that cites images and audio clips the way text-RAG cites passages.',
    readTime: '~8 min read',
    diagram: 'lessons/p12-24.svg',
    diagramCaption:
      'The multimodal RAG pipeline: decompose the query, retrieve per modality, fuse scores, generate with cross-modal citations.',
    whyItMatters:
      'Multimodal RAG is where retrieval becomes an orchestration design problem: which retriever handles which part of the query, how scores merge, and how the answer proves itself. Two ideas transfer directly to product work. First, fusion is where quality quietly dies: a single composite score can hide that one modality returned garbage, so your evaluation and your UI both need the per-modality breakdown. Second, grounded generation defines the citation UX: "[img 3]" and "[audio 2 at 0:34]" are interface contracts, and designing how users verify cross-modal evidence is the actual trust surface of the product.',
    sections: [
      {
        heading: 'The problem: one query, several kinds of evidence',
        body: '"Find me a quiet vegan brunch with natural light" is three retrieval problems wearing one sentence. "Vegan brunch" lives in menu text, "natural light" in photos, "quiet" in reviews or ambient audio. Single-modality RAG (embed, retrieve, stuff into the LLM) cannot serve this.\n\nA multimodal system needs retrieval heads per modality, a way to fuse their results, generation that cites mixed sources, and evaluation that covers all of it. Three 2025 surveys (Abootorabi, Mei, Zhao) converged on exactly this taxonomy.',
      },
      {
        heading: 'Cross-modal retrieval: three ways to bridge spaces',
        body: 'Retrieving modality B from a modality A query has three patterns. Shared embedding spaces: CLIP for text-image, CLAP for text-audio, where cosine similarity works across modalities directly but only for trained pairs. Per-modality encoders plus a small translator module mapping between spaces: flexible, more moving parts. Or use a VLM\'s hidden states as the retrieval representation: any modality the VLM supports, highest quality, most expensive.\n\nThe 2026 defaults: SigLIP 2 for text plus image, CLAP for text plus audio, VLM hidden states when quality justifies cost.',
      },
      {
        heading: 'Fusion: merging 5 images, 3 passages, and 2 audio clips',
        body: 'Score fusion is the cheapest: normalize scores within each modality, then take a weighted sum. Simple, and it often works. Attention-based fusion concatenates the retrieved items and lets a trained network weight them. MoE fusion routes through a gating network, so a visual question weights image evidence higher.\n\nThe production default is score fusion with a bias toward the query\'s dominant modality; upgrade to MoE only when an A/B test shows real wins. The failure mode to watch: a weighted sum happily blends strong text evidence with garbage audio evidence into one confident-looking number.',
      },
      {
        heading: 'Grounding and the agentic loop',
        body: 'A grounded answer tags each claim with its source: standard "[1]" for text, "[img 3]" with a short caption for images, "[audio 2 at 0:34]" for sound. Generators trained on grounding-tagged data emit these citations naturally, which is what makes the answer verifiable rather than merely fluent.\n\nWhen first-pass retrieval comes back weak, agentic multi-hop kicks in: the model reformulates ("too noisy, filter for under 40 dB") and retrieves again, or spots a menu inside a photo and pulls the menu text. Each hop buys accuracy with latency.',
      },
      {
        heading: 'Evaluation: still the immature part',
        body: 'No standard benchmark spans all modalities. Teams lean on proxies: recall@k per modality, fused top-k accuracy, human-judged end-to-end satisfaction, and task-level outcomes like bookings completed.\n\nThe practical consequence: per-modality recall is the diagnostic that matters, because the composite number hides which retriever failed. MuRAG (2022) proved the pattern before the VLM wave; the 2025 surveys mapped the open problems; most of them, especially evaluation, are still open. Build the breakdown view first.',
      },
    ],
    takeaways: [
      'Decompose the query before you retrieve: each fragment of intent routes to the modality that actually holds the evidence.',
      'Start with score fusion plus a dominant-modality bias; adopt MoE fusion only when an A/B test proves it on your domain.',
      'A fused composite score can hide a dead retriever. Instrument and display per-modality recall, not just the roll-up.',
      'Cross-modal citations ([img 3], [audio 2 at 0:34]) are an interface contract; how users verify them is the product\'s trust surface.',
    ],
    terms: [
      { term: 'Cross-modal retrieval', meaning: 'Querying in one modality and retrieving results in another, via a shared space or a translator.' },
      { term: 'Score fusion', meaning: 'Normalizing per-modality retrieval scores and combining them as a weighted sum.' },
      { term: 'MoE fusion', meaning: 'A gating network that routes trust across modality-specific experts per query.' },
      { term: 'Grounded generation', meaning: 'Answer text in which each claim is tagged with the retrieved item that supports it.' },
      { term: 'Agentic multi-hop', meaning: 'The model reformulates and re-retrieves when first-pass results come back low-confidence.' },
      { term: 'CLAP', meaning: 'The contrastive audio-language model; CLIP\'s equivalent for text-audio retrieval.' },
    ],
    demoCaption:
      'A trip planner returns one composite match score. Open the breakdown and see what the roll-up was hiding: one modality never delivered, and the headline number never said so.',
    demo: {
      archetype: 'meter',
      subject: 'Top result: Cafe Flora, composite match 0.84',
      headline: 'Composite match: 0.84',
      breakdown: [
        { label: 'Text (reviews): "vegan brunch, calm"', value: 92 },
        { label: 'Image (photos): "large windows, airy"', value: 88 },
        { label: 'Audio (ambience): no clips indexed', value: 21 },
      ],
      badCaption:
        'The misreading: 0.84 looks like a confident match on all three requirements. But a weighted sum happily blends two strong signals with one dead retriever into a single reassuring number.',
      goodCaption:
        'The mechanism: fusion is a weighted sum over per-modality scores, so the composite can only be trusted alongside its breakdown. The "quiet" requirement was never verified; audio retrieval returned near-noise. This is why multimodal RAG evaluation tracks recall per modality, and why the UI should expose it.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: '"quiet vegan brunch with natural light" is three retrieval problems in one sentence.',
        body:
          '"quiet vegan brunch with natural light" is three retrieval problems in one sentence.\n\n"vegan brunch" lives in menu text. "natural light" lives in photos. "quiet" lives in audio.\n\nmultimodal RAG: decompose the query, retrieve per modality, fuse the scores, generate with citations across all three. the fusion step is where quality quietly dies.',
      },
      {
        kind: 'X · design angle',
        hook: 'a composite relevance score is a progress bar for a process the user cannot see.',
        body:
          'a composite relevance score is a progress bar for a process the user cannot see.\n\n0.84 match can mean: text 92, image 88, audio 21. one requirement was never verified and the roll-up never said so.\n\nif your product fuses evidence across modalities, the per-modality breakdown is not a debug view. it is the trust surface.',
      },
      {
        kind: 'X · one-liner',
        hook: 'text-RAG cites [1]. multimodal RAG cites [img 3] and [audio 2 at 0:34].',
        body:
          'text-RAG cites [1]. multimodal RAG cites [img 3] and [audio 2 at 0:34].\n\nonce sources stop being text, citation stops being a footnote format and becomes a verification UI problem. nobody has fully designed it yet.',
      },
    ],
    source: {
      label: 'Full lesson: 12.24 multimodal-rag-cross-modal',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/12-multimodal-ai/24-multimodal-rag-cross-modal',
    },
  },
  {
    id: 'p12-25-computer-use',
    phase: 'Phase 12 · Multimodal AI',
    part: 'Part 5 · Multimodal in the real world',
    index: '12.25',
    title: 'Computer-use agents: the model that clicks your UI',
    oneLiner:
      'The capstone of multimodal AI: an agent that reads screenshots, emits click and type actions as JSON, and loops until the workflow is done. The primitive works; the hard benchmarks still hold the frontier under 40 percent.',
    readTime: '~8 min read',
    diagram: 'lessons/p12-25.svg',
    diagramCaption:
      'The agent loop: screenshot in, plan, one JSON action out, execute, observe the new state, repeat until done.',
    whyItMatters:
      'Computer-use agents are the thing agent governance exists to govern, which makes this lesson a map of the control points. The action schema is the permission surface: every capability the agent has is a line in that JSON, so scoping, allowlisting, and auditing happen there, not in the prompt. Errors compound across a 20-step loop, and some actions (submit, pay, delete) are irreversible, which is exactly where approval gates belong. For Armoriq-style work, the design brief is the oversight surface: action logs a human can replay, interception before irreversible steps, and benchmarks read as risk numbers, since about 30 percent on hard tasks means unattended workflows fail most of the time.',
    sections: [
      {
        heading: 'The loop: perceive, reason, act, observe, repeat',
        body: 'The target workflow: "find me a flight to Tokyo for April 15, aisle seat under $800, book it." The agent screenshots the browser, parses image plus URL plus goal into a plan, emits one structured action (click at x,y; type "Tokyo"; scroll; select), the wrapper executes it, and the next screenshot comes back as the new state.\n\nEvery step is a VLM call whose output must be parseable JSON. And because each action\'s outcome feeds the next decision, errors compound: a wrong click on step 3 poisons steps 4 through 20.',
      },
      {
        heading: 'Grounding and the action schema',
        body: 'GUI grounding is the primitive: given a screenshot and an instruction, output the coordinate to act on. SeeClick proved it at scale by fine-tuning a VLM to emit coordinates as text; CogAgent added 1120x1120 high-resolution encoding for dense UIs and hit about 84 percent on web navigation; Ferret-UI extended it to mobile.\n\nThe action schema is typically 6 to 10 types: click, type, scroll, drag, select, hover, navigate, wait, done. A good action carries an element_desc alongside coordinates, so if positions drift between screenshots, the semantic hint lets the system re-ground.',
      },
      {
        heading: 'Screenshot, accessibility tree, or both',
        body: 'Screenshot-only agents are the most general: any pixels on any app, no structural help. Accessibility-tree agents read the structured DOM or platform accessibility APIs, which makes grounding far more reliable, but only where a tree exists.\n\nProduction agents go hybrid when they can: the tree grounds atomic actions precisely, the screenshot supplies semantic context the tree lacks. There is a quiet design lesson inside this: the accessibility work teams deferred for years is now literally the machine-readable interface that makes their product automatable.',
      },
      {
        heading: 'Memory: 20 steps means 20 screenshots',
        body: 'A long workflow fills the context with images fast. Three compression strategies compete: summary-chain (every 5 steps, summarize progress and drop old screenshots), skip-frame (keep the first, last, and every third), and the tool-recorded log (keep a text log of actions taken, never re-look at old screenshots).\n\nClaude\'s computer-use API uses the log pattern: simpler and more reliable than managing an image history. The general rule from this phase applies one last time: text is cheap memory, pixels are expensive memory.',
      },
      {
        heading: 'The benchmarks: why 30 percent is the honest number',
        body: 'On ScreenSpot-Pro, pure grounding, open models reach about 85 percent and the frontier about 90: the primitive works. End-to-end is another story. VisualWebArena holds open models near 20 percent; AgentVista, the hard 2026 benchmark of realistic workflows across 12 domains, holds even Gemini 3 Pro and Claude Opus 4.7 to roughly 27 to 40 percent.\n\nThe bottlenecks: fine-scale grounding ("click the small X"), long-horizon drift after 10 or so actions, untrained error recovery, and state lost across tabs and long forms. Autonomy is not there; supervision is the product.',
      },
    ],
    takeaways: [
      'The agent loop is perceive, reason, act, observe. Errors compound across steps, so recovery design matters more than single-step accuracy.',
      'The action schema is the permission surface: every capability is a line of JSON, which is where scoping, allowlisting, and audit belong.',
      'Hybrid grounding (screenshot plus accessibility tree) beats either alone. Accessibility markup is now the machine-readable API of your UI.',
      'Grounding is near-solved (about 90 percent); end-to-end workflows are not (27 to 40 percent on AgentVista). Design for supervised runs, not autonomy.',
    ],
    terms: [
      { term: 'GUI grounding', meaning: 'Given a screenshot and an instruction, outputting the coordinate or element to act on.' },
      { term: 'Action schema', meaning: 'The JSON definition of the agent\'s legal actions: click, type, scroll, drag, done, and so on.' },
      { term: 'Accessibility tree', meaning: 'The machine-readable UI hierarchy from browser or OS APIs; the reliable grounding substrate.' },
      { term: 'Hybrid agent', meaning: 'An agent using both the screenshot and the accessibility tree, more reliable than either alone.' },
      { term: 'Summary-chain', meaning: 'Memory compression that periodically replaces old screenshots with a text summary of progress.' },
      { term: 'AgentVista', meaning: 'The hard 2026 benchmark of realistic 12-domain workflows; frontier models score 27 to 40 percent.' },
    ],
    demoCaption:
      'Two runs of the same booking task. Step through both sequences and find where the unsupervised run crosses the line it cannot uncross, and where the governed run stops to check.',
    demo: {
      archetype: 'sequence',
      subject: 'Task: book the Tokyo flight under $800',
      badLabel: 'Ungoverned run',
      goodLabel: 'Governed run',
      badSequence: [
        'Screenshot: search results page',
        'Click "Select" on flight row 2 (misread price: $1,240)',
        'Type passenger details into the form',
        'Click "Confirm and pay" (irreversible)',
        'Observe failure: wrong flight booked, money spent',
      ],
      goodSequence: [
        'Screenshot: search results page',
        'Click "Select" on flight row 2',
        'Verify state: price on review page is $1,240, over the $800 limit',
        'Recovery: back to results, re-ground on the $760 flight',
        'Pause at "Confirm and pay": human approval gate, then submit',
      ],
      badCaption:
        'Each action looked locally reasonable, and nothing checked the outcome before the irreversible step. Errors compound across the loop, and step 4 is the one you cannot undo.',
      goodCaption:
        'The mechanism: verification between action and consequence, plus an approval gate in front of irreversible actions. The action schema defines what the agent can do; governance decides which of those actions require a human. That split is the product.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'a computer-use agent is a loop, and the loop is the whole story.',
        body:
          'a computer-use agent is a loop, and the loop is the whole story.\n\nscreenshot in, one JSON action out (click at x,y with an element description), execute, observe, repeat.\n\ngrounding is ~90% solved. end-to-end workflows: 27-40% on AgentVista, even for frontier models. errors compound across 20 steps, and recovery is barely in the training data.',
      },
      {
        kind: 'X · design angle',
        hook: 'the agent\'s action schema is a permission surface. treat it like one.',
        body:
          'the agent\'s action schema is a permission surface. treat it like one.\n\nevery capability the agent has is a line of JSON: click, type, navigate, pay. scoping and audit live there, not in the prompt.\n\nand the accessibility tree your team deferred? it is now the machine-readable API that decides whether agents can use your product reliably.',
      },
      {
        kind: 'X · one-liner',
        hook: 'frontier models score ~30% on realistic computer-use benchmarks. read that as a design requirement.',
        body:
          'frontier models score ~30% on realistic computer-use benchmarks. read that as a design requirement.\n\nunattended workflows fail most of the time. the product is not autonomy, it is supervision: replayable action logs, verification between steps, approval gates before anything irreversible.',
      },
    ],
    source: {
      label: 'Full lesson: 12.25 multimodal-agents-computer-use',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/12-multimodal-ai/25-multimodal-agents-computer-use',
    },
  },
];
