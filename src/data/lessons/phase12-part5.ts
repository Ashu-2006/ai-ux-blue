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
      'A vision-language-action model outputs motion, not text: joint targets, gripper commands, whole-body poses. RT-2 proved the trick works; OpenVLA, π0, and GR00T turned it into a product category.',
    readTime: '~10 min read',
    diagram: '/lessons/p12-21.svg',
    diagramCaption:
      'The VLA lineage: RT-2 discretizes actions as text tokens, FAST compresses them, π0 goes continuous with flow matching, GR00T splits planning from control.',
    whyItMatters:
      'VLAs make the latency budget physical: a 30 Hz control loop gives the model 33 milliseconds per action, so token format versus flow matching is a response-time decision, like debouncing a search box, except a miss dents hardware instead of a frame. The transferable pattern for any agent product: the VLA\'s output is a suggestion, not a command. A control layer it cannot override holds the hard limits. That is the same capability-versus-authority split that belongs in every software agent with real-world side effects.',
    learningObjectives: [
      'Compute the token count for a 10-DOF action at 30 Hz under 256-bin discretization, and say whether a 7B VLM can decode it in real time.',
      'Explain why co-fine-tuning web VQA data with robot demonstrations, at roughly a 1:1 ratio, is what lets a VLA follow instructions no robot dataset ever contained.',
      'Compare RT-2, OpenVLA, FAST-tokenized models, and π0 on action format and effective control frequency.',
      'Describe GR00T\'s System 1 / System 2 split and why it maps to Kahneman\'s fast-and-slow thinking.',
      'Identify which safety checks belong in the control layer instead of the model, and why the VLA cannot be trusted to enforce its own limits.',
    ],
    sections: [
      {
        heading: 'The problem: language out is easy, torque out is not',
        body: 'A robot that does chores from a sentence has been the target since the 1970s. The 2020s answer reuses the VLM stack, but actions break three assumptions text never had. Action spaces are continuous and high-dimensional: a 7-DOF arm plus a gripper is 10 dimensions, emitted 30 times a second, a 33-millisecond budget per decision. Robot data is scarce: Open X-Embodiment holds about 970,000 trajectories across 22 robots, while web image-text data runs past 5 billion pairs. And the cost of a wrong output is not a bad sentence, it is a broken object, a dropped part, or a hurt person. Every design choice downstream, discrete tokens versus continuous flow, one model versus two, single-robot versus cross-embodiment training, traces back to these three constraints.',
      },
      {
        heading: 'The move: actions as text tokens (RT-2)',
        body: 'RT-2 (Google DeepMind, July 2023) made actions speak the model\'s native language. Normalize each joint target to [-1, 1], discretize into 256 bins, map each bin to a vocabulary ID. A 10-DOF action becomes 10 tokens, decoded like words, at 3 to 5 Hz, the ceiling set by autoregressive decoding.\n\nThe payoff came from co-fine-tuning: mix web image-text pairs with robot demonstrations at roughly a 1:1 ratio. Web knowledge survives, so the model follows "move toward the fast-moving object" even though "fast-moving" never appeared in robot data. Robot-only training produces models that fail the moment the phrasing is novel, because there is nothing left in the weights to fall back on.',
      },
      {
        heading: 'OpenVLA: the open 7B reference',
        body: 'OpenVLA (Kim et al., June 2024) is the open-weights answer to RT-2: a 7B Llama backbone paired with a dual vision encoder, DINOv2 for spatial detail and SigLIP for semantics, using the same 256-bin action tokenization. It trains on the full Open X-Embodiment corpus and ships with LoRA fine-tuning support, so a team can adapt it to a new robot on 100 to 1,000 task-specific demonstrations instead of collecting a dataset from zero.\n\nInference runs at 4 to 5 Hz on an A100 with quantization, close to RT-2\'s ceiling and fast enough for careful manipulation, not for anything approaching high-frequency control. OpenVLA is the reason a lab without Google-scale infrastructure can run the RT-2 recipe at all.',
      },
      {
        heading: 'Faster actions: FAST compression and π0\'s flow matching',
        body: 'RT-2 and OpenVLA both decode at 3 to 5 Hz, throttled by token-by-token generation. Two fixes followed. FAST (Pertsch et al., 2024) compresses action trajectories in the frequency domain: discrete-cosine-transform the sequence, quantize the coefficients, and a 30-step trajectory that cost 300 discrete-bin tokens becomes about 10 FAST tokens, a 3 to 5x speedup with no quality loss.\n\nπ0 (Physical Intelligence, October 2024) drops tokens entirely. A small flow-matching action expert reads the VLM\'s hidden states and emits a continuous 50-step action sequence in about 5 denoising steps, effectively 50 Hz control. Continuity preserves the smoothness that discretization destroys, and Physical Intelligence reports π0 beating both OpenVLA and Octo across a wide manipulation suite.',
      },
      {
        heading: 'GR00T: plan slowly, act quickly',
        body: 'NVIDIA\'s GR00T N1 (March 2025) targets humanoids with more than 30 degrees of freedom, where one model cannot both think and keep up. So it splits: System 2, a large VLM, reads the scene and instruction and produces subgoals at about 1 Hz. System 1, a small action transformer, turns subgoals into 50 to 100 Hz joint commands.\n\nThe split is Kahneman\'s fast-and-slow thinking as an architecture. Slow planning never blocks fast control, and the fast half stays small enough to meet the latency budget. GR00T N1.7 (late 2025) extends the same split with sim-to-real training data generated in NVIDIA\'s Omniverse. The pattern is spreading well beyond robots: any agent with a cheap high-frequency loop and an expensive low-frequency one is running the same architecture.',
      },
      {
        heading: 'Open X-Embodiment: one corpus, 22 robots',
        body: 'Every model in this lineage trains on the same base: Open X-Embodiment, assembled by the RT-X collaboration (October 2023) from 22 datasets, ALOHA, Bridge V2, Droid, RT-2 Kitchen, and Language Table among them, into roughly 970,000 cross-robot trajectories. Each sample pairs robot state, camera views, an instruction, and an action sequence, unified into one action space with normalized joint ranges and resized cameras.\n\nThat shared corpus is what makes fine-tuning cheap. A team with a new robot does not retrain from scratch, it runs LoRA fine-tuning on 100 to 1,000 task-specific demonstrations to close the domain gap. The corpus is doing for robotics what ImageNet did for vision: one dataset everyone trains against, so architecture comparisons mean something.',
      },
      {
        heading: 'Co-fine-tuning: the ratio that decides generalization',
        body: 'The mixing ratio between web data and robot demonstrations is a real hyperparameter, not a rounding choice. RT-2 trains at roughly 1:1 web-to-robot; OpenVLA and π0 run closer to 0.5:1. Too much web data and the model\'s actions degrade; too much robot data and it forgets the general knowledge that made it useful in the first place.\n\nThe practical test: "pick up the red cube" is in the demonstration data and every model gets it right. "Pick up the third largest object from the left" is not, and only a co-fine-tuned model grounds it, because counting and size comparison came from the web half of training, not the robot half. Robot-only training is a narrower, more brittle model even though it saw more robot examples.',
      },
      {
        heading: 'The guardrails: the VLA proposes, the control layer disposes',
        body: 'Every production VLA ships wrapped in checks it cannot override: hard joint limits set by the hardware spec, velocity clipping, workspace bounds so an end-effector cannot leave the table, and a human approval step for any task outside the trained distribution.\n\nThese live outside the model, in the control layer, which is the same trust architecture worth copying into any agent product with real-world side effects: capability sits in the model, authority sits in the code around it. A VLA that scores well on a benchmark still gets the same guardrails as one that scores poorly, because the guardrails are not a hedge against a bad model, they are the definition of what output is even allowed to reach the hardware.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p12-21-inline-tokens.svg',
        alt: 'Action token counts across three formats',
        caption: 'A 30-step trajectory at 10 DOF: 300 discrete-bin tokens, about 10 FAST tokens, or one continuous flow-matched sequence.',
        diagramBrief:
          'ASCII bar chart: three horizontal bars stacked vertically, labeled "Discrete bins: 300 tokens", "FAST: ~10 tokens", "Flow matching: 1 continuous sequence, ~5 denoising steps". Bar lengths proportional to token count (first bar very long, second short, third a smooth wavy line instead of a bar). Style: cream paper background (#faf6ef), monochrome ink, one accent color on the FAST bar. Aspect 16:9.',
      },
      {
        src: '/lessons/p12-21-inline-groot.svg',
        alt: 'GR00T\'s System 1 / System 2 split',
        caption: 'System 2 plans at about 1 Hz; System 1 turns each subgoal into 50 to 100 Hz joint commands.',
        diagramBrief:
          'Two boxes side by side. Left box labeled "System 2: large VLM" with a small clock icon showing "~1 Hz" and text "reads scene + instruction, emits subgoal". Right box labeled "System 1: small action transformer" with a clock icon showing "50-100 Hz" and text "turns subgoal into joint commands". An arrow from left box to right box labeled "subgoal". A looping arrow on the right box alone showing it repeats many times per one left-box cycle. Style: cream paper, black ink, one accent color on System 1\'s box to show it is the fast, frequently-firing half. Aspect 4:3.',
      },
    ],
    takeaways: [
      'A VLA is the VQA architecture with actions as output. The hard parts are continuous action spaces, scarce robot data, and a 33ms-per-action latency budget.',
      'Co-fine-tuning web data with robot demos (roughly 1:1) is what preserves generalization. Robot-only training fails on any novel phrasing.',
      'Action format is the speed lever: 256-bin tokens run 3 to 5 Hz, FAST compression 3 to 5x faster, π0\'s flow matching effectively 50 Hz.',
      'The VLA\'s output is a suggestion. Hard limits, workspace bounds, and human approval live in a control layer the model cannot override.',
    ],
    terms: [
      { term: 'VLA', gloss: '"a robot AI"', meaning: 'A vision-language-action model: takes an image plus an instruction and outputs robot action commands instead of text.' },
      { term: 'Action tokenization', gloss: '"turning motion into words"', meaning: 'Quantizing a continuous joint target into 256 bins per dimension, each bin mapped to a vocabulary ID the VLM can emit like a word.' },
      { term: 'FAST tokenizer', gloss: '"a compressed action format"', meaning: 'A frequency-domain, DCT-based compression that turns a 30-step action trajectory into about 10 tokens instead of 300.' },
      { term: 'Flow-matching action head', gloss: '"π0\'s smooth output"', meaning: 'A small transformer trained with rectified-flow loss that emits a continuous 50-step action sequence in about 5 denoising steps.' },
      { term: 'Co-fine-tuning', gloss: '"training on everything at once"', meaning: 'Training on web image-text data alongside robot demonstrations, at a tuned ratio, so general knowledge survives into the control policy.' },
      { term: 'Open X-Embodiment', gloss: '"the robot dataset"', meaning: 'The cross-robot corpus of about 970,000 trajectories from 22 robots and 22 source datasets, unified into one action space.' },
      { term: 'System 1 / System 2', gloss: '"fast and slow thinking"', meaning: 'GR00T\'s dual-model split: a large VLM plans subgoals slowly, a small action transformer executes them at high frequency.' },
      { term: 'LoRA fine-tuning', gloss: '"customizing the model"', meaning: 'Low-rank adapter training on 100 to 1,000 task-specific demos that closes the gap between a base VLA and one specific robot.' },
      { term: 'Control layer', gloss: '"the safety code"', meaning: 'The non-model software wrapping every VLA deployment that enforces joint limits, velocity clipping, workspace bounds, and approval gates.' },
      { term: 'Domain gap', gloss: '"it doesn\'t work on our robot"', meaning: 'The performance drop between a VLA\'s training distribution (Open X-Embodiment) and a specific robot\'s hardware, sensors, and workspace.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A 7-DOF arm plus gripper (10 DOF) runs at 30 Hz with 256-bin discrete tokenization. How many action tokens per second does the model need to decode, and can a 7B VLM at 4 to 5 Hz keep up?' },
      { level: 'medium', prompt: 'FAST compresses a 30-step trajectory to about 10 tokens by keeping the dominant frequency components. What kind of motion, drumming or a slow reach, loses the most fidelity to that compression, and why?' },
      { level: 'medium', prompt: 'π0 denoises a full 50-step action sequence in about 5 steps. Compare its effective throughput to OpenVLA\'s autoregressive decode at 4 to 5 Hz, and say which one a 30 Hz control loop actually needs.' },
      { level: 'design', prompt: 'Design the human-approval screen a warehouse operator sees before a VLA-controlled arm executes a task outside its training distribution. What does the screen show (image, planned action, confidence, the specific rule that flagged it), and what is the one button that matters most?' },
    ],
    furtherReading: [
      { label: 'Brohan et al., RT-2 (arXiv:2307.15818)', url: 'https://arxiv.org/abs/2307.15818', why: 'The original paper: action-as-text-tokens and the co-fine-tuning recipe that makes web knowledge transfer to robots.' },
      { label: 'Kim et al., OpenVLA (arXiv:2406.09246)', url: 'https://arxiv.org/abs/2406.09246', why: 'The open 7B reference implementation, including the LoRA fine-tuning path teams actually use to adapt it.' },
      { label: 'Black et al., π0 (arXiv:2410.24164)', url: 'https://arxiv.org/abs/2410.24164', why: 'The flow-matching action head and the benchmark claims against OpenVLA and Octo.' },
      { label: 'NVIDIA, GR00T N1 (arXiv:2503.14734)', url: 'https://arxiv.org/abs/2503.14734', why: 'The System 1 / System 2 architecture for humanoid control, including the sim-to-real training pipeline.' },
      { label: 'Open X-Embodiment Collaboration, RT-X (arXiv:2310.08864)', url: 'https://arxiv.org/abs/2310.08864', why: 'The shared 22-robot training corpus every model in this lesson trains on.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'VLA action-format and guardrail checklist',
      body:
        '- What is the robot\'s control frequency, and what latency budget per action does that set?\n- Discrete-bin tokens, FAST compression, or continuous flow matching: which fits that budget?\n- What is the co-fine-tuning ratio, and does it preserve instruction generalization or just demo replay?\n- Does the base model train on Open X-Embodiment, and how many task-specific demos does LoRA fine-tuning need to close the domain gap?\n- What hard joint limits, velocity clips, and workspace bounds live in the control layer, outside the model?\n- Which tasks require human approval before the first action executes, and what does that approval screen show?',
    },
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
      'Documents are not photos: layout and tables carry meaning raw OCR throws away. Document AI moved through three eras, and by 2026 the frontier answer is just feeding the page image to a VLM.',
    readTime: '~10 min read',
    diagram: '/lessons/p12-22.svg',
    diagramCaption:
      'Three eras of document AI: staged OCR pipeline, OCR-free specialists that emit markup, and VLM-native page reading at high resolution.',
    whyItMatters:
      'Document ingestion is where agent governance meets messy reality: policies, invoices, and contracts all arrive as PDFs, and the stack you pick decides what an auditor can verify. A deterministic OCR pipeline fails predictably and leaves an inspectable trail; a VLM-native reader reads tables and handwriting better and can hallucinate a field with full confidence. For an Armoriq-style compliance surface, that is a product decision: it sets whether extraction needs a confidence treatment and a review queue, or can be presented as fact.',
    learningObjectives: [
      'Name the three eras of document AI (OCR pipeline, OCR-free, VLM-native) and the year each became the default.',
      'Explain what LayoutLMv3\'s three input streams (text, bounding boxes, image patches) capture that flat OCR text cannot.',
      'Compare Donut, Nougat, LayoutLMv3, and a VLM-native reader on DocVQA accuracy and failure mode.',
      'Decide, for a given document-AI project, whether a pipeline, an OCR-free specialist, or a VLM-native reader minimizes cost without losing accuracy.',
      'Design a hybrid extraction flow for a regulated document type that surfaces disagreement instead of hiding it.',
    ],
    sections: [
      {
        heading: 'The problem: the text is only 90 percent of the signal',
        body: '"Understand this PDF" hides real structure. About 90 percent of the signal lives in text content, and the rest lives in layout (headers, footnotes, two-column flow), tables with merged cells, figures, handwritten annotations, and the typography that separates a title from body copy.\n\nRaw OCR dumps the words and discards everything else. An invoice system needs to know that "Total: $1,245" came from the bottom-right summary block, not from a footnote near the terms and conditions. Position is semantics, and a flat text stream cannot carry it, which is the whole reason document AI needed three separate eras to get right.',
      },
      {
        heading: 'Era 1: the OCR pipeline (pre-2021)',
        body: 'The classic stack ran five stages: render the PDF to page images, extract words plus bounding boxes with Tesseract or a commercial OCR engine, detect layout blocks, parse table structure, then apply domain rules and regex to pull fields.\n\nIt works on clean printed text and breaks on handwriting, skewed scans, complex tables, and non-Latin scripts, with every failure needing a custom exception path. TrOCR (Li et al., 2021) replaced the classic CNN-CTC OCR stage with a transformer encoder-decoder, a clean win on handwritten and multilingual text, but the architecture stayed a fragile chain of five stages, any one of which could break the whole extraction.',
      },
      {
        heading: 'Era 2: OCR-free specialists (2022 to 2023)',
        body: 'Donut (Kim et al., 2022) and Nougat (Blecher et al., 2023) skip detection and OCR entirely, mapping page pixels straight to structured output through a single encoder-decoder transformer. Donut emits JSON for forms; Nougat, trained specifically on scientific papers, emits LaTeX and markdown and became the model every arXiv parser calls.\n\nBoth are specialists, not generalists: Donut fails on a scientific paper, Nougat fails on an invoice. On a parallel track, LayoutLMv3 (Huang et al., 2022) kept OCR but fused three input streams, text tokens, per-token bounding boxes, and image patches, under one masked training objective. It is the peak of OCR-based document understanding and still the cost-efficient pick for printed forms at scale.',
      },
      {
        heading: 'DocLLM: layout-aware generation',
        body: 'DocLLM (Wang et al., 2023) is LayoutLM\'s generative sibling: instead of classification heads, it generates free-form answers conditioned on layout tokens, which makes it better suited to document question-answering than LayoutLMv3\'s fixed output types.\n\nIt still depends on an OCR stage upstream to produce the text and bounding boxes it conditions on, so it inherits every failure mode of Era 1\'s detection step. DocLLM is the clearest marker of where the field was heading before VLMs made the whole OCR-plus-layout stack optional: generative output, but still bolted onto a pipeline. The next era removed the pipeline instead of improving it.',
      },
      {
        heading: 'Era 3: VLM-native (2024 onward)',
        body: 'By 2024, general VLMs got good enough to replace the pipeline: feed the page image at high resolution, ask the question, get an answer. Qwen2.5-VL handles 2048px natively; Claude Opus 4.7 takes 2576px pages; PaliGemma 2 (April 2025) trains specifically on documents and handwriting.\n\nThe early-2026 numbers tell the story: on DocVQA, Claude Opus 4.7 scores about 95, PaliGemma 2 about 88, a pipelined LayoutLMv3 about 83, Nougat about 77. On ChartQA, Claude 4.7 scores about 92 against GPT-4V\'s 78. VLM-native now wins on mixed handwriting, merged-cell tables, embedded equations, and annotated figures. The gap closed mostly through resolution and base-LLM scale, not a fundamentally new architecture.',
      },
      {
        heading: 'Where the pipeline still wins',
        body: 'Pipelines still win three cases: massive pure-scan workloads where per-page cost dominates and a VLM call is too expensive to run millions of times a day, environments that need deterministic failures instead of fluent hallucinations, and regulated settings that require auditable OCR output as a matter of policy, not just accuracy.\n\nHandwriting mixed with print, doctors\' notes, filled forms, is still the hardest sub-task and the clearest case where OCR pipelines beat VLMs on cost even as VLMs close the accuracy gap. The lesson is not "VLM-native always wins," it is "VLM-native wins on accuracy, pipelines win on guarantees."',
      },
      {
        heading: 'The 2026 recipe: match the stack to the risk',
        body: 'So the recipe is a routing table, not a single answer. Printed invoices at 10 million pages a day: LayoutLMv3 plus rules, because per-page cost dominates at that volume. Mixed messy documents: VLM-native, because the accuracy gain is large and volume is moderate. Scientific ingestion: Nougat for equations, a VLM for the tricky pages Nougat mishandles.\n\nRegulatory documents: an OCR pipeline as the primary, auditable extraction, with a VLM running as a cross-check and a defined path for what happens when the two disagree. That last case is the one product teams get wrong most often, because it is tempting to treat disagreement as noise instead of designing for it.',
      },
      {
        heading: 'Reading DocVQA numbers as a design constraint',
        body: 'The benchmark gap between VLM-native and pipelined extraction, about 95 versus 83 on DocVQA, is not just an accuracy story, it changes what a review UI has to do. A pipeline fails on a document it cannot parse, so the failure is visible: an empty field, a parsing error, a document routed to a human queue.\n\nA VLM-native reader can fail by producing a confident, well-formatted, wrong number, with no signal that anything went wrong. Designing for that difference means the review UI for a VLM-native pipeline needs a confidence treatment and a sampling-based audit even when the extraction looks clean, because clean and correct are no longer the same guarantee they were with a pipeline.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p12-22-inline-eras.svg',
        alt: 'Three eras of document AI on a timeline',
        caption: 'OCR pipeline (pre-2021), OCR-free specialists (2022-2023), VLM-native (2024 onward), with DocVQA scores rising left to right.',
        diagramBrief:
          'Horizontal timeline with three labeled segments: "Pipeline (pre-2021)" showing a 5-box chain (render, OCR, layout, table, rules), "OCR-free (2022-23)" showing a single box labeled "Donut / Nougat", "VLM-native (2024+)" showing a single box labeled "page image -> VLM -> answer". Below each segment, a small DocVQA score label: "~83", "~77-88", "~95". Style: cream paper background (#faf6ef), monochrome ink, one accent color highlighting the rising score line beneath. Aspect 16:9.',
      },
      {
        src: '/lessons/p12-22-inline-invoice.svg',
        alt: 'Flat OCR text versus layout-aware reading of the same invoice',
        caption: 'The same invoice text, once as a flat stream with no position, once anchored to the summary block that makes it "the total."',
        diagramBrief:
          'Two side-by-side panels. Left panel: a jumbled list of words and numbers in a single column with no structure, labeled "flat OCR stream". Right panel: a simplified invoice layout (header box, two-row table, bottom-right summary box) with "$1,245" placed inside the summary box and labeled "Total (position = meaning)". Style: cream paper, black ink, one accent color highlighting the summary box on the right panel only. Aspect 4:3.',
      },
    ],
    takeaways: [
      'Layout is semantics. A field\'s position on the page carries meaning that flat OCR text cannot represent, which is why pipelines needed a layout model at all.',
      'OCR-free specialists (Donut, Nougat) beat pipelines inside their domain and fail outside it. Specialization is a real deployment constraint, not a footnote.',
      'VLM-native reading wins on accuracy by 2026 (DocVQA about 95 vs 83 pipelined), but it fails by hallucinating fluently where a pipeline fails detectably.',
      'Regulated document flows want the hybrid: deterministic OCR as the auditable primary, a VLM as cross-check, and UI that surfaces disagreement instead of hiding it.',
    ],
    terms: [
      { term: 'OCR pipeline', gloss: '"the old way"', meaning: 'The staged five-step stack (render, OCR, layout detect, table parse, rules) that is deterministic and fragile.' },
      { term: 'OCR-free', gloss: '"no text extraction step"', meaning: 'A single transformer (Donut, Nougat) that maps page pixels directly to structured output without an explicit OCR stage.' },
      { term: 'LayoutLMv3', gloss: '"the layout model"', meaning: 'A model fusing text tokens, per-token bounding boxes, and image patches under one masked training objective; still needs OCR upstream.' },
      { term: 'DocLLM', gloss: '"generative LayoutLM"', meaning: 'A layout-aware model that generates free-form answers instead of classification labels, still dependent on an OCR stage.' },
      { term: 'Nougat', gloss: '"the arXiv parser"', meaning: 'An OCR-free specialist trained on scientific papers that converts page images directly into LaTeX and markdown.' },
      { term: 'VLM-native', gloss: '"just show the model the page"', meaning: 'Feeding the full page image to a frontier VLM at high resolution, with no OCR or layout pipeline at all.' },
      { term: 'DocVQA', gloss: '"the doc benchmark"', meaning: 'The standard document question-answering benchmark; the most-cited comparison point across all three eras of document AI.' },
      { term: 'TrOCR', gloss: '"better OCR"', meaning: 'A transformer encoder-decoder (2021) that replaced classic CNN-CTC OCR, a clean accuracy win on handwriting within the pipeline era.' },
      { term: 'Bounding box', gloss: '"where the word is"', meaning: 'The pixel coordinates of a detected text region, the unit that lets a layout model know position, not just content.' },
      { term: 'Domain specialist', gloss: '"a model that only does one thing"', meaning: 'A model like Donut or Nougat trained for one document type, accurate inside it and unreliable outside it.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A pipeline extracts "$1,245" and "$124.50" as flat text with no position data. Explain in one sentence why a rules engine cannot reliably tell which number is the total.' },
      { level: 'medium', prompt: 'Your project processes 10 million printed invoices a day. Using the DocVQA numbers in this lesson (LayoutLMv3 about 83, Claude Opus 4.7 about 95), justify why the higher-accuracy option is not automatically the right pick.' },
      { level: 'medium', prompt: 'Nougat outputs LaTeX for scientific papers. Describe one case where a VLM-native reader would beat Nougat\'s LaTeX fidelity, and one where Nougat still wins.' },
      { level: 'design', prompt: 'Design the review queue for a compliance team using a VLM-native extractor on contracts. What does the UI show for a field the model extracted with high confidence but that a human later needs to overturn, and how does the interface make that correction feed back into future extractions?' },
    ],
    furtherReading: [
      { label: 'Li et al., TrOCR (arXiv:2109.10282)', url: 'https://arxiv.org/abs/2109.10282', why: 'The transformer OCR upgrade that fixed handwriting recognition inside the pipeline era, before OCR-free models existed.' },
      { label: 'Kim et al., Donut (arXiv:2111.15664)', url: 'https://arxiv.org/abs/2111.15664', why: 'The first OCR-free document transformer; the direct ancestor of every "skip OCR entirely" architecture that followed.' },
      { label: 'Blecher et al., Nougat (arXiv:2308.13418)', url: 'https://arxiv.org/abs/2308.13418', why: 'The scientific-paper specialist and the model most arXiv parsing tools still call in 2026.' },
      { label: 'Huang et al., LayoutLMv3 (arXiv:2204.08387)', url: 'https://arxiv.org/abs/2204.08387', why: 'The three-stream fusion architecture, still the cost-efficient pick for high-volume printed forms.' },
      { label: 'Wang et al., DocLLM (arXiv:2401.00908)', url: 'https://arxiv.org/abs/2401.00908', why: 'The generative, layout-aware model that marks the transition point before VLM-native reading took over.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Document-AI stack picker',
      body:
        '- What is the document type: clean print, scientific paper, mixed handwriting, or regulated form?\n- What is the daily page volume, and does per-page cost dominate the decision at that scale?\n- Does the workflow require an auditable, deterministic failure mode, or is a confident wrong answer an acceptable risk?\n- Pick one: OCR pipeline plus rules, an OCR-free specialist (Donut or Nougat), or VLM-native reading.\n- If regulated: what is the cross-check step, and what happens when the pipeline and the VLM disagree?\n- Does the review UI show a confidence treatment, or does it present extraction as fact?',
    },
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
      'Text-RAG on PDFs drops charts and breaks tables across five lossy steps. ColPali embeds the page image directly and retrieves with MaxSim, beating text-RAG by 20-40% on visual documents.',
    readTime: '~10 min read',
    diagram: '/lessons/p12-23.svg',
    diagramCaption:
      'MaxSim over patches: each query token picks its best-matching page patch, and the page\'s score is the sum of those maxima.',
    whyItMatters:
      'If your product answers questions over PDFs, the retrieval layer decides what the model can even see, before generation quality matters at all. Text-RAG silently deletes exactly the content teams care about: the revenue chart, the signature block, the annotated figure. ColPali\'s lesson for product work is that fidelity is bought with storage, roughly 30x raw, 5 to 10x compressed, which turns "how good is search" into a costed, tunable dial instead of a mystery. When a stakeholder asks why the assistant cannot find the chart from the Q3 report, this architecture choice is usually the answer.',
    learningObjectives: [
      'Explain the difference between a bi-encoder (one vector per document) and a late-interaction retriever (many vectors per document).',
      'Compute the MaxSim score for a small set of query-token and document-token similarities by hand.',
      'Describe what ColPali\'s patch embeddings preserve that OCR-based text-RAG discards.',
      'Compute the storage cost of a ColPali index for a given page count, patch count, and embedding dimension, raw and after product quantization.',
      'Decide, for a given corpus, whether ColPali, VisRAG, or plain text-RAG is the right default.',
    ],
    sections: [
      {
        heading: 'The problem: five lossy steps between the PDF and the model',
        body: 'The standard text-RAG pipeline runs five steps: convert the PDF to text via OCR, split into 300 to 500 token chunks, embed each chunk into one vector, retrieve by cosine similarity, hand the top chunks to the LLM.\n\nEvery step loses signal. OCR drops chart data outright. Chunking cuts table rows in half at arbitrary boundaries. Single-vector embedding averages an entire page into one point, which is where fine-grained evidence disappears first. A financial report\'s Q3 growth usually lives in a chart; a contract\'s signature block is a layout fact, not a text fact. By the time retrieval runs, that content no longer exists anywhere in the index to be found.',
      },
      {
        heading: 'The prior art: ColBERT\'s late interaction',
        body: 'ColBERT (Khattab and Zaharia, 2020) is a text retrieval idea: keep one vector per token instead of one per document. At query time, every query token searches the document\'s token vectors, takes its single best match, and the document\'s score is the sum of those maxima. That operation is MaxSim: for each query token, the highest similarity against any document token, summed across all query tokens.\n\nThe payoff is granularity: each query term finds its own evidence anywhere in the document instead of hoping one averaged vector points the right way. The cost is storage: many vectors per document instead of one, which is the tradeoff every model in this lineage inherits.',
      },
      {
        heading: 'The move: MaxSim over image patches',
        body: 'ColPali (Faysse et al., July 2024) applies the same pattern to pages. Encode each page image with PaliGemma into patch embeddings, roughly 729 vectors per page at typical resolution, each capturing local layout and content. Encode the text query into token embeddings. Score each page with MaxSim: every query token picks its best patch, sum the maxima, return the top-k pages.\n\nNo OCR runs anywhere in this pipeline. Charts, fonts, figures, and layout all survive into retrieval because nothing extracted them out first. On the ViDoRe benchmark, ColPali scores about 80 percent nDCG@5 where text-RAG on the same documents manages 50 to 60, the clearest single number in this lesson.',
      },
      {
        heading: 'The family: ColQwen2, ColSmol, VisRAG',
        body: 'The pattern spawned a family with real tradeoffs. ColQwen2 swaps PaliGemma for a Qwen2-VL encoder, trading a bit of latency for better retrieval quality. ColSmol runs at about 1 billion parameters, small enough for a consumer GPU, the pick when the deployment target is local or edge rather than a server cluster.\n\nVisRAG (Yu et al., 2024) takes a different bet: pool each page into a single vector with a VLM, then retrieve with a standard bi-encoder. That gives up MaxSim\'s granularity in exchange for smaller storage and faster indexing. Quality or scale: the family lets a team pick per corpus instead of committing to one architecture for every document type.',
      },
      {
        heading: 'M3DocRAG: retrieval across pages and documents',
        body: 'M3DocRAG (Cho et al., 2024) extends the same idea past a single document: it retrieves relevant pages across an entire multi-document corpus and composes a multi-page context for the generator, instead of assuming the answer lives on one page of one file.\n\nThat matters for the realistic case, a question that requires reading page 12 of one report against page 3 of another. Single-document ColPali retrieval has no mechanism for that; M3DocRAG\'s multi-page attention is the piece that makes vision-native retrieval work at corpus scale instead of just single-PDF scale.',
      },
      {
        heading: 'The bill: storage is the tradeoff',
        body: 'A 50-page report at 729 patches per page and 128-dim embeddings costs about 18 MB raw, versus roughly 150 kB for 50 text chunks at 768 dimensions. That is close to 30x more storage per document, brought down to 5 to 10x with product quantization, which compresses vectors while preserving similarity.\n\nAt the scale of a single team\'s document set, that difference is invisible. At the scale of a multi-million-page archive, it is a real infrastructure line item, which is why the fidelity ColPali buys needs to be priced into the decision up front, not discovered after the index is built.',
      },
      {
        heading: 'When text-RAG still wins',
        body: 'Vision-native retrieval is not a universal upgrade. Pure-text corpora with no layout signal, wikis, chat logs, internal memos, get nothing from patch embeddings and pay the storage bill anyway. Multi-million-page archives can be dominated by storage cost before accuracy ever enters the decision. And regulated flows that must produce extractable OCR text alongside retrieval still need the text pipeline running in parallel, whatever the retriever underneath.\n\nFor the visually rich cases, financial reports, scientific papers, contracts, medical records, and design documentation, the 2026 default has flipped: embed the page, not the extraction. The question worth asking per corpus is not "which is better" but "does this corpus have layout signal worth paying storage for."',
      },
      {
        heading: 'Reading a MaxSim score before you trust it',
        body: 'A MaxSim score is a sum of maxima, which means a page can score well because one query token found a perfect match even if the rest of the page is irrelevant. That is usually the right behavior, a single strong chart match should outrank a page of vaguely related prose, but it means the score is not an average relevance judgment the way a cosine similarity over one pooled vector is.\n\nTeams evaluating retrieval quality should look at which patches drove the top score, not just the score itself, the same instinct that makes a per-modality breakdown more useful than a single composite number in the multimodal RAG lesson that follows this one.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p12-23-inline-maxsim.svg',
        alt: 'MaxSim scoring across query tokens and page patches',
        caption: 'Each query token picks its single best-matching patch; the page score is the sum of those best matches.',
        diagramBrief:
          'Left column: three small boxes labeled "Q3", "revenue", "growth" (query tokens). Right side: a grid representing a page divided into patches, with one patch highlighted per query token via a dotted line from each query token to its best-matching patch (the chart region should be one of the highlighted patches). Below, a small equation "score = max1 + max2 + max3". Style: cream paper background (#faf6ef), monochrome ink, one accent color on the three matched patches and their connecting lines. Aspect 16:9.',
      },
      {
        src: '/lessons/p12-23-inline-storage.svg',
        alt: 'Storage cost comparison: text-RAG vs ColPali raw vs ColPali quantized',
        caption: 'A 50-page report: about 150 kB for text-RAG, about 18 MB for ColPali raw, about 2 to 4 MB after product quantization.',
        diagramBrief:
          'Three vertical bars of very different heights on a shared baseline, labeled "text-RAG: ~150kB", "ColPali raw: ~18MB", "ColPali quantized: ~2-4MB". Use a broken axis or log-scale label to make the small bar still visible. Style: cream paper, black ink, one accent color on the quantized bar to show it as the practical middle ground. Aspect 4:3.',
      },
    ],
    takeaways: [
      'Retrieval quality is capped by what survives indexing. Text-RAG deletes charts, tables, and layout before the model ever gets a chance.',
      'MaxSim is the mechanism: each query token picks its best-matching patch, so fine-grained evidence anywhere on the page can win the retrieval.',
      'The fidelity is bought with storage: about 30x raw, 5 to 10x after product quantization. That is a costed dial, not a mystery.',
      'Match the retriever to the corpus: ColPali family for visually rich documents, VisRAG for scale, plain text-RAG for text-only corpora.',
    ],
    terms: [
      { term: 'Late interaction', gloss: '"ColBERT-style"', meaning: 'Retrieval that keeps many vectors per document and matches at query time, instead of collapsing the document into one pre-pooled vector.' },
      { term: 'MaxSim', gloss: '"best-match scoring"', meaning: 'For each query token, take its highest similarity against any document vector, then sum those maxima across all query tokens.' },
      { term: 'Bi-encoder', gloss: '"single-vector search"', meaning: 'A retriever that embeds a document into one vector; fast and cheap, but averages away granular evidence.' },
      { term: 'Patch embedding', gloss: '"a piece of the page"', meaning: 'One vector per image patch of a page, about 729 per page for ColPali, capturing local content and layout together.' },
      { term: 'ViDoRe', gloss: '"the ColPali benchmark"', meaning: 'The visual document retrieval benchmark, scored with nDCG@5, that ColPali and its family report results against.' },
      { term: 'Product quantization', gloss: '"vector compression"', meaning: 'A compression technique that shrinks stored vector size roughly 8x while preserving the similarity comparisons retrieval depends on.' },
      { term: 'ColQwen2', gloss: '"a better ColPali"', meaning: 'A ColPali variant using a Qwen2-VL encoder instead of PaliGemma, trading some latency for retrieval quality.' },
      { term: 'VisRAG', gloss: '"cheaper ColPali"', meaning: 'A vision-native retriever that pools each page into a single vector instead of keeping per-patch embeddings, trading recall for storage and speed.' },
      { term: 'M3DocRAG', gloss: '"multi-document ColPali"', meaning: 'An extension that retrieves pages across an entire multi-document corpus and composes a multi-page context for generation.' },
      { term: 'nDCG@5', gloss: '"the retrieval score"', meaning: 'A ranking-quality metric that rewards relevant results appearing near the top of the first five retrieved items.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A 200-page annual report indexed at 729 patches per page, 128-dim embeddings, 4-byte floats. Compute the raw storage size in megabytes, and the size after 8x product quantization.' },
      { level: 'medium', prompt: 'MaxSim is the sum, across query tokens, of each token\'s best match against the document. Explain what this captures that a simple mean-pooled similarity would miss on a page with one small chart and a lot of unrelated prose.' },
      { level: 'medium', prompt: 'A corpus is entirely internal wiki pages and chat logs, no charts or scanned documents. Argue for or against switching from text-RAG to ColPali for this corpus.' },
      { level: 'design', prompt: 'Design the "why did we retrieve this page" affordance for a document-RAG product. Given that a MaxSim score is a sum of per-token maxima rather than an average, what should the UI highlight on the retrieved page so a user trusts the match?' },
    ],
    furtherReading: [
      { label: 'Faysse et al., ColPali (arXiv:2407.01449)', url: 'https://arxiv.org/abs/2407.01449', why: 'The original paper: PaliGemma patch embeddings plus ColBERT-style MaxSim retrieval, and the ViDoRe benchmark it introduces.' },
      { label: 'Khattab and Zaharia, ColBERT (arXiv:2004.12832)', url: 'https://arxiv.org/abs/2004.12832', why: 'The 2020 late-interaction idea for text retrieval that ColPali generalizes to image patches.' },
      { label: 'Yu et al., VisRAG (arXiv:2410.10594)', url: 'https://arxiv.org/abs/2410.10594', why: 'The pooled-vector alternative to ColPali, useful when storage and indexing speed matter more than maximum recall.' },
      { label: 'Cho et al., M3DocRAG (arXiv:2411.04952)', url: 'https://arxiv.org/abs/2411.04952', why: 'Multi-page, multi-document retrieval, the piece that makes vision-native RAG work past a single PDF.' },
      { label: 'illuin-tech/colpali (GitHub)', url: 'https://github.com/illuin-tech/colpali', why: 'The reference implementation and the ColQwen2 and ColSmol checkpoints referenced in this lesson.' },
    ],
    shipIt: {
      kind: 'rubric',
      name: 'Vision-native vs text-RAG decision rubric',
      body:
        '- Layout signal: does the corpus have charts, tables, or annotated figures that carry meaning beyond the words? If no, text-RAG is likely enough.\n- Scale: is the corpus in the millions of pages, where storage cost could dominate the decision regardless of accuracy?\n- Regulatory need: must the pipeline produce extractable OCR text alongside retrieval, independent of which retriever is used?\n- Quality bar: does the product need ViDoRe-level accuracy (about 80 percent nDCG@5), or is text-RAG\'s 50 to 60 percent tolerable?\n- Budget: raw storage is about 30x a text index; product quantization brings that to 5 to 10x. Is that line item acceptable at this corpus size?\n- Pick one: ColPali/ColQwen2 for quality, VisRAG for scale, text-RAG for text-only corpora.',
    },
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
      'Production multimodal RAG retrieves evidence across modalities: "quiet vegan brunch" needs reviews, photos, and sound. It fuses the scores and cites images and audio the way text-RAG cites passages.',
    readTime: '~10 min read',
    diagram: '/lessons/p12-24.svg',
    diagramCaption:
      'The multimodal RAG pipeline: decompose the query, retrieve per modality, fuse scores, generate with cross-modal citations.',
    whyItMatters:
      'Multimodal RAG is where retrieval becomes an orchestration problem: which retriever handles which fragment of the query, how scores merge, and how the answer proves itself. Two ideas transfer straight to product work. First, fusion is where quality quietly dies: a single composite score can hide that one modality returned near-noise, so the evaluation and the UI both need the per-modality breakdown. Second, grounded generation defines the citation UX: "[img 3]" and "[audio 2 at 0:34]" are interface contracts, and how a user verifies cross-modal evidence is the actual trust surface of the product.',
    learningObjectives: [
      'Decompose a natural-language query into the modality-specific sub-queries that actually carry its evidence.',
      'Compare shared embedding spaces (CLIP, CLAP), translator modules, and VLM hidden states as cross-modal retrieval methods.',
      'Compare score fusion, attention-based fusion, and MoE fusion, and say which one hides a dead retriever most easily.',
      'Design a grounded-generation citation format for a query answered from mixed text, image, and audio sources.',
      'Identify which evaluation metric, per-modality recall or fused top-k accuracy, diagnoses a specific retrieval failure.',
    ],
    sections: [
      {
        heading: 'The problem: one query, several kinds of evidence',
        body: '"Find me a quiet vegan brunch with natural light" is three retrieval problems wearing one sentence. "Vegan brunch" lives in menu text, "natural light" lives in photos, "quiet" lives in reviews or ambient audio. Single-modality RAG, embed the query, retrieve, stuff into the LLM, cannot serve this, because no single embedding space contains all three kinds of evidence.\n\nA multimodal system needs retrieval heads per modality, a way to fuse their results, generation that cites mixed sources, and evaluation that covers all of it. Three 2025 surveys, Abootorabi et al., Mei et al., and Zhao et al., converged on exactly this four-part taxonomy independently, which is a strong signal it is the right decomposition.',
      },
      {
        heading: 'Cross-modal retrieval: three ways to bridge spaces',
        body: 'Retrieving modality B from a modality A query has three patterns. Shared embedding spaces: CLIP for text-image, CLAP for text-audio, where cosine similarity works across modalities directly but only for the pairs the model was trained on. Per-modality encoders plus a small translator module mapping between spaces: more flexible, more moving parts to maintain. Or use a VLM\'s hidden states as the retrieval representation directly: works for any modality the VLM supports, highest quality, most expensive to run at query time.\n\nThe 2026 defaults: SigLIP 2 for text plus image, CLAP for text plus audio, VLM hidden states reserved for cases where quality justifies the added cost.',
      },
      {
        heading: 'Fusion: merging 5 images, 3 passages, and 2 audio clips',
        body: 'Score fusion is the cheapest: normalize scores within each modality, then take a weighted sum. Simple, and it often works. Attention-based fusion concatenates the retrieved items and lets a trained network weight them, which needs training data to learn the weights from. MoE fusion routes through a gating network, so a visual question weights image evidence higher automatically, without a human tuning the weight by hand.\n\nThe production default is score fusion with a bias toward the query\'s dominant modality; upgrade to MoE only when an A/B test shows a real win. The failure mode to watch: a weighted sum happily blends strong text evidence with garbage audio evidence into one confident-looking number, and nothing in the math flags that one input was noise.',
      },
      {
        heading: 'Grounding and the agentic loop',
        body: 'A grounded answer tags each claim with its source: standard "[1]" for text, "[img 3]" with a short caption for images, "[audio 2 at 0:34]" for sound. Generators trained on grounding-tagged data emit these citations naturally, which is what makes the answer verifiable rather than merely fluent, and what lets a user check a claim against the actual evidence instead of taking the model\'s word for it.\n\nWhen first-pass retrieval comes back weak, agentic multi-hop kicks in: the model reformulates ("too noisy, filter for under 40 dB") and retrieves again, or spots a menu inside a photo and pulls the menu text as a second retrieval target. Each hop buys accuracy with latency, which is a tradeoff worth surfacing to the user rather than hiding behind a longer spinner.',
      },
      {
        heading: 'MuRAG and the lineage',
        body: 'MuRAG (Chen et al., 2022) is the paper that proved the pattern before the VLM wave made it easy: retrieve image and text jointly from a multimodal knowledge base, then generate an answer conditioned on both. It predates CLIP-scale shared embeddings being standard practice and showed feasibility, not production quality.\n\nModern systems, REACT, VisRAG, M3DocRAG, all build on the same retrieve-then-generate shape MuRAG established, just with stronger encoders and fusion. Knowing the lineage matters for one practical reason: the four-part taxonomy, retrieval, fusion, grounding, evaluation, that the 2025 surveys formalized is not new theory, it is the same shape MuRAG shipped in 2022, now with better parts.',
      },
      {
        heading: 'Evaluation: still the immature part',
        body: 'No standard benchmark spans all modalities the way DocVQA does for documents or ViDoRe does for vision-native retrieval. Teams lean on proxies: recall@k per modality, fused top-k accuracy, human-judged end-to-end satisfaction, and task-level outcomes like bookings completed.\n\nThe practical consequence: per-modality recall is the diagnostic that matters, because the composite number hides which retriever failed. Mei et al.\'s 2025 survey maps the open evaluation problems directly; most of them are still unsolved as of this writing. Build the per-modality breakdown view first, before the fusion logic, because it is the only way to know which half of the system needs the next round of work.',
      },
      {
        heading: 'The design surface: citations as trust, not decoration',
        body: 'Once a source stops being text, citation stops being a footnote format and becomes an interaction design problem with no settled answer yet. A text citation is a link a user can click and read in a second. An audio citation at "0:34" requires either an inline player or a transcript excerpt, and an image citation needs enough of a thumbnail to actually verify the claim without opening a new tab.\n\nThe product that gets this right treats each modality\'s citation as its own component with its own verification affordance, not one generic "[source]" chip reused across three different kinds of evidence that need three different ways to check.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p12-24-inline-decompose.svg',
        alt: 'One query decomposed into three modality-specific retrievals',
        caption: '"Quiet vegan brunch with natural light" splits into a text query, an image query, and an audio query before fusion.',
        diagramBrief:
          'One input box at top: "quiet vegan brunch with natural light". Three arrows fan out downward to three boxes: "Text retriever (reviews): quiet, vegan brunch", "Image retriever (photos): natural light", "Audio retriever (ambience): quiet". A final arrow from all three converging into a box labeled "Fusion -> composite score". Style: cream paper background (#faf6ef), monochrome ink, one accent color on the fusion box. Aspect 16:9.',
      },
      {
        src: '/lessons/p12-24-inline-composite.svg',
        alt: 'A composite score breaking down into per-modality components',
        caption: 'Composite match 0.84 decomposed: text 92, image 88, audio 21, the dead retriever the roll-up hid.',
        diagramBrief:
          'A large circular or bar gauge showing "0.84" prominently at top. Below it, three smaller horizontal bars labeled "Text: 92", "Image: 88", "Audio: 21", the audio bar visibly short and in a different (warning) shade. Style: cream paper, black ink, one accent color used only on the short audio bar to draw the eye. Aspect 4:3.',
      },
    ],
    takeaways: [
      'Decompose the query before you retrieve: each fragment of intent routes to the modality that actually holds the evidence.',
      'Start with score fusion plus a dominant-modality bias; adopt MoE fusion only when an A/B test proves it on your domain.',
      'A fused composite score can hide a dead retriever. Instrument and display per-modality recall, not just the roll-up.',
      'Cross-modal citations ([img 3], [audio 2 at 0:34]) are an interface contract; how users verify them is the product\'s trust surface.',
    ],
    terms: [
      { term: 'Cross-modal retrieval', gloss: '"search across types"', meaning: 'Querying in one modality and retrieving results in another, via a shared embedding space or a translator module.' },
      { term: 'Score fusion', gloss: '"combining the results"', meaning: 'Normalizing per-modality retrieval scores and combining them as a weighted sum; the cheapest and most common fusion method.' },
      { term: 'MoE fusion', gloss: '"smart combining"', meaning: 'A gating network that routes trust across modality-specific experts per query, instead of a fixed weighted sum.' },
      { term: 'Grounded generation', gloss: '"citing sources"', meaning: 'Answer text in which each claim is tagged with the specific retrieved item, text, image, or audio clip, that supports it.' },
      { term: 'Agentic multi-hop', gloss: '"trying again"', meaning: 'The model reformulates a query and re-retrieves when first-pass results come back low-confidence, at the cost of added latency.' },
      { term: 'CLAP', gloss: '"audio CLIP"', meaning: 'The contrastive audio-language model that produces a shared text-audio embedding space, CLIP\'s equivalent for sound.' },
      { term: 'MuRAG', gloss: '"the first multimodal RAG"', meaning: 'A 2022 paper that retrieved image and text jointly from a multimodal knowledge base, establishing the pattern modern systems extend.' },
      { term: 'Recall@k per modality', gloss: '"did it find the right stuff"', meaning: 'The fraction of relevant items a single modality\'s retriever surfaces in its top k results, measured separately per modality.' },
      { term: 'Translator module', gloss: '"a bridge between models"', meaning: 'A small trained network mapping one modality\'s embedding space into another\'s when no shared space like CLIP already exists.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Decompose "find me a loud, cheap arcade bar near downtown with good reviews" into its modality-specific sub-queries. Which modality does each fragment route to?' },
      { level: 'medium', prompt: 'Score fusion is a weighted sum of per-modality scores. Describe a scenario where this hides a dead retriever, and explain in one sentence why MoE fusion would surface the same failure instead.' },
      { level: 'medium', prompt: 'A trip-planner\'s composite match score is 0.84 for a listing where audio retrieval never indexed a clip and defaulted to near-zero. Propose one UI change that would have surfaced this before the user booked.' },
      { level: 'design', prompt: 'Design the citation component for an answer that mixes a text passage, a photo, and a 12-second audio clip. Specify what each citation looks like at rest and what happens when a user taps it to verify the claim.' },
    ],
    furtherReading: [
      { label: 'Abootorabi et al., Ask in Any Modality (arXiv:2502.08826)', url: 'https://arxiv.org/abs/2502.08826', why: 'The broadest 2025 survey; the four-part taxonomy (retrieval, fusion, grounding, evaluation) this lesson follows comes from here.' },
      { label: 'Mei et al., A Survey of Multimodal RAG (arXiv:2504.08748)', url: 'https://arxiv.org/abs/2504.08748', why: 'Focused on sub-task benchmarks and failure modes; the source for why evaluation is called out as the immature part.' },
      { label: 'Zhao et al., Vision RAG Survey (arXiv:2503.18016)', url: 'https://arxiv.org/abs/2503.18016', why: 'The vision-focused survey, strongest on the ColPali-family work this lesson builds on from the previous one.' },
      { label: 'Chen et al., MuRAG (arXiv:2210.02928)', url: 'https://arxiv.org/abs/2210.02928', why: 'The 2022 paper that proved multimodal retrieve-then-generate worked before the VLM wave made it standard.' },
      { label: 'Liu et al., REACT (arXiv:2301.10382)', url: 'https://arxiv.org/abs/2301.10382', why: 'A modern system extending the MuRAG pattern with stronger encoders and agentic retrieval.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Multimodal RAG fusion and citation checklist',
      body:
        '- Decompose the query: which fragment of intent maps to which modality, and does a retriever exist for each?\n- Cross-modal bridge: shared embedding space (CLIP, CLAP), translator module, or VLM hidden states, and why that one?\n- Fusion method: score fusion by default; only move to MoE after an A/B test shows a real win.\n- Per-modality recall: is it instrumented and visible, or does the product only ever show the composite score?\n- Grounding: does the generator tag each claim with its specific source, text, image, or audio, and timestamp where relevant?\n- Citation UI: does each modality have its own verification affordance, or is there one generic source chip doing three jobs?',
    },
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
      'The capstone of multimodal AI: an agent reads screenshots, emits click and type actions as JSON, and loops until done. The primitive works; hard benchmarks hold the frontier under 40 percent.',
    readTime: '~10 min read',
    diagram: '/lessons/p12-25.svg',
    diagramCaption:
      'The agent loop: screenshot in, plan, one JSON action out, execute, observe the new state, repeat until done.',
    whyItMatters:
      'Computer-use agents are the thing agent governance exists to govern, which makes this lesson a map of the control points. The action schema is the permission surface: every capability the agent has is a line in that JSON, so scoping, allowlisting, and auditing happen there, not in the prompt. Errors compound across a 20-step loop, and some actions, submit, pay, delete, are irreversible, exactly where approval gates belong. For Armoriq-style work, the design brief is the oversight surface: replayable action logs, interception before irreversible steps, and benchmarks read as risk numbers, since about 30 percent on hard tasks means unattended runs fail most of the time.',
    learningObjectives: [
      'Describe the four-part agent loop (perceive, reason, act, observe) and where errors compound across a 20-step run.',
      'Design a 6 to 10 type action schema and identify which actions require a human approval gate before execution.',
      'Compare screenshot-only, accessibility-tree, and hybrid grounding on reliability and generality.',
      'Choose a memory-compression strategy (summary-chain, skip-frame, tool-recorded log) for a long-horizon workflow.',
      'Read a computer-use benchmark score (ScreenSpot-Pro vs AgentVista) as a statement about what still needs human supervision.',
    ],
    sections: [
      {
        heading: 'The loop: perceive, reason, act, observe, repeat',
        body: 'The target workflow: "find me a flight to Tokyo for April 15, aisle seat under $800, book it." The agent screenshots the browser, parses image plus URL plus goal into a plan, emits one structured action (click at x,y; type "Tokyo"; scroll; select), a wrapper executes it, and the next screenshot comes back as the new state.\n\nEvery step is a VLM call whose output must be parseable JSON, no exceptions, a malformed action stalls the whole loop. And because each action\'s outcome feeds the next decision, errors compound: a wrong click on step 3 poisons steps 4 through 20, the way a single misread variable early in a script corrupts everything downstream of it.',
      },
      {
        heading: 'Grounding: the primitive that mostly works',
        body: 'GUI grounding is the core primitive: given a screenshot and an instruction, output the coordinate to act on. SeeClick (Cheng et al., 2024) proved it at scale by fine-tuning a VLM to emit coordinates as plain text; CogAgent (Hong et al., 2024) added 1120x1120 high-resolution encoding for dense UIs and hit about 84 percent on web navigation; Ferret-UI extended the same idea to mobile, integrating with iOS accessibility data.\n\nOn ScreenSpot-Pro, the grounding-only benchmark, open models reach about 85 percent and the frontier about 90. That number alone would suggest computer-use is solved. It is not, because grounding is only the first of four loop stages, and the other three are where accuracy actually collapses.',
      },
      {
        heading: 'The action schema',
        body: 'A production action schema typically defines 6 to 10 types: click, type, scroll, drag, select, hover, navigate, wait, and done, each with typed arguments like `{"action": "click", "x": 384, "y": 220, "element_desc": "Search button"}`.\n\nThe `element_desc` field matters more than it looks: if pixel positions drift between screenshots, because the page reflowed or an ad loaded, the semantic hint lets the system re-ground on the right element instead of clicking blind at stale coordinates. Every capability the agent has is a line in this schema, which is exactly why it doubles as the permission surface a security review should read line by line, not the prompt around it.',
      },
      {
        heading: 'Screenshot, accessibility tree, or both',
        body: 'Screenshot-only agents are the most general: any pixels on any app, no structural help required. Accessibility-tree agents read the structured DOM or platform accessibility APIs, which makes grounding far more reliable, but only where a tree actually exists and is populated correctly.\n\nProduction agents go hybrid when they can: the tree grounds atomic actions precisely, the screenshot supplies semantic context the tree lacks, like which button is visually most prominent. There is a quiet design lesson inside this: the accessibility work teams deferred for years, adding proper ARIA labels and roles, is now literally the machine-readable interface that makes a product automatable at all.',
      },
      {
        heading: 'Visual tool use: crop, zoom, detect',
        body: 'ChartAgent (2025) introduced visual tool use for the hardest perception cases: the agent can output "crop to region (100, 200, 300, 400) then call OCR" as a tool call, get back the cropped, zoomed detail as text, and continue reasoning with that higher-resolution read.\n\nThis generalizes past charts: set-of-mark prompting, region annotation, and external detection tools all fit the same "emit a tool call, receive a structured response" schema the rest of the agent already uses. It is a workaround for a real limit, a single screenshot at agent-friendly resolution often cannot show both the whole page and a small icon clearly, and giving the model a zoom tool is cheaper than always sending 4K screenshots.',
      },
      {
        heading: 'Memory: 20 steps means 20 screenshots',
        body: 'A long workflow fills the context with images fast. Three compression strategies compete: summary-chain (every 5 steps, summarize progress in text and drop old screenshots), skip-frame (keep the first, last, and every third screenshot), and the tool-recorded log (keep a text log of actions taken, never re-look at old screenshots at all).\n\nClaude\'s computer-use API uses the log pattern: simpler and more reliable than managing an image history, because a text log of "clicked Search, typed Tokyo, selected April 15" cannot silently drop the one screenshot that mattered. The general rule from this phase applies one last time: text is cheap memory, pixels are expensive memory.',
      },
      {
        heading: 'The benchmarks: why 30 percent is the honest number',
        body: 'On ScreenSpot-Pro, pure grounding, open models reach about 85 percent and the frontier about 90: the primitive works. End-to-end is another story entirely. VisualWebArena holds open models near 20 percent, Gemini 3 Pro around 27. AgentVista, the hard 2026 benchmark of realistic workflows across 12 domains, holds even Gemini 3 Pro and Claude Opus 4.7 to roughly 27 to 40 percent, and open models to 10 to 20 percent.\n\nThe bottlenecks: fine-scale grounding ("click the small X"), long-horizon drift after 10 or so actions, untrained error recovery when a click hits the wrong target, and state lost across tabs and long forms. Autonomy is not there yet; supervision is the product being sold.',
      },
      {
        heading: 'Designing for a 30 percent success rate',
        body: 'A benchmark score is a design requirement, not a research footnote. If unattended runs fail on roughly 6 or 7 out of 10 hard tasks, the product cannot ship as "set it and walk away," it has to ship as a supervised loop with three specific affordances: a replayable action log a human can step through after the fact, verification between an action and its irreversible consequence, and an approval gate placed in front of anything that cannot be undone.\n\nThe teams that read 30 percent as "needs a bit more training" ship an agent that quietly books the wrong flight. The teams that read it as "design the supervision layer first" ship the same underlying model as a product people actually trust, because the failure rate did not change, only what happens when it fails did.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p12-25-inline-loop.svg',
        alt: 'The four-stage computer-use agent loop with error compounding',
        caption: 'Perceive, reason, act, observe, repeat, with a wrong click on step 3 poisoning every step after it.',
        diagramBrief:
          'Four boxes in a circular loop labeled "Perceive (screenshot)", "Reason (plan)", "Act (JSON action)", "Observe (new state)", with an arrow looping back to Perceive. Overlay a red dotted line starting at "Act" on one iteration labeled "step 3: wrong click" that visibly branches the loop path and shows it diverging further from a "goal" marker over the following iterations. Style: cream paper background (#faf6ef), monochrome ink, one accent color on the error path only. Aspect 16:9.',
      },
      {
        src: '/lessons/p12-25-inline-benchmarks.svg',
        alt: 'Grounding accuracy versus end-to-end success rate',
        caption: 'ScreenSpot-Pro (grounding) near 90 percent versus AgentVista (end-to-end) at 27 to 40 percent for the same frontier models.',
        diagramBrief:
          'Two side-by-side vertical bars. Left bar tall, labeled "ScreenSpot-Pro (grounding): ~90%". Right bar much shorter, labeled "AgentVista (end-to-end): 27-40%". A bracket beneath both bars labeled "same frontier models, same underlying primitive". Style: cream paper, black ink, one accent color on the shorter right-hand bar to draw attention to the gap. Aspect 4:3.',
      },
    ],
    takeaways: [
      'The agent loop is perceive, reason, act, observe. Errors compound across steps, so recovery design matters more than single-step accuracy.',
      'The action schema is the permission surface: every capability is a line of JSON, which is where scoping, allowlisting, and audit belong.',
      'Hybrid grounding (screenshot plus accessibility tree) beats either alone. Accessibility markup is now the machine-readable API of your UI.',
      'Grounding is near-solved (about 90 percent); end-to-end workflows are not (27 to 40 percent on AgentVista). Design for supervised runs, not autonomy.',
    ],
    terms: [
      { term: 'GUI grounding', gloss: '"clicking the right spot"', meaning: 'Given a screenshot and an instruction, outputting the exact coordinate or element to act on.' },
      { term: 'Action schema', gloss: '"what the agent can do"', meaning: 'The JSON definition of the agent\'s legal actions, typically 6 to 10 types (click, type, scroll, drag, done, and so on).' },
      { term: 'Accessibility tree', gloss: '"the structured page"', meaning: 'The machine-readable UI hierarchy exposed by browser or OS accessibility APIs; the reliable grounding substrate where it exists.' },
      { term: 'Hybrid agent', gloss: '"screenshot plus tree"', meaning: 'An agent using both the screenshot and the accessibility tree together, more reliable at grounding than either alone.' },
      { term: 'Visual tool use', gloss: '"zoom and crop"', meaning: 'The agent calling external vision tools, crop, zoom, OCR, mid-plan and continuing to reason on the structured result.' },
      { term: 'Summary-chain', gloss: '"memory compression"', meaning: 'Periodically replacing old screenshots with a text summary of progress instead of keeping every image in context.' },
      { term: 'Element description', gloss: '"a label for the click"', meaning: 'A semantic hint, like "Search button", attached to a coordinate action, used to re-ground if pixel positions drift.' },
      { term: 'ScreenSpot-Pro', gloss: '"the grounding benchmark"', meaning: 'A pure grounding benchmark on about 1,000 web screenshots; near-solved, with open models around 85 percent.' },
      { term: 'AgentVista', gloss: '"the hard 2026 benchmark"', meaning: 'A 12-domain realistic-workflow benchmark where even frontier models score 27 to 40 percent end to end.' },
      { term: 'Approval gate', gloss: '"a confirm button"', meaning: 'A required human check placed before an irreversible action (submit, pay, delete) that the agent cannot execute unattended.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Given the action schema `{"action": "click", "x": 384, "y": 220, "element_desc": "Search button"}`, explain in one sentence what the `element_desc` field is for and what would break without it.' },
      { level: 'medium', prompt: 'ScreenSpot-Pro (grounding only) sits near 90 percent for frontier models; AgentVista (end-to-end) sits near 30 to 40 percent. Explain why a high grounding score does not predict a high end-to-end success rate.' },
      { level: 'medium', prompt: 'A workflow needs to jump between three browser tabs. Which memory strategy, summary-chain, skip-frame, or tool-recorded log, best preserves the state needed to complete it, and why?' },
      { level: 'design', prompt: 'Design the approval-gate screen a user sees before an agent executes a "Confirm and pay" action it planned itself. What does the screen show (the action, the price, the flight, a diff against the stated budget), and what happens if the user does nothing for 30 seconds?' },
    ],
    furtherReading: [
      { label: 'Cheng et al., SeeClick (arXiv:2401.10935)', url: 'https://arxiv.org/abs/2401.10935', why: 'The paper that proved GUI grounding at scale by fine-tuning a VLM to emit coordinates as text.' },
      { label: 'Hong et al., CogAgent (arXiv:2312.08914)', url: 'https://arxiv.org/abs/2312.08914', why: 'High-resolution encoding for dense UIs, the architecture behind the about-84-percent web navigation number.' },
      { label: 'You et al., Ferret-UI (arXiv:2404.05719)', url: 'https://arxiv.org/abs/2404.05719', why: 'Extends grounding to mobile UIs and iOS accessibility data, the counterpart to the browser-focused models above.' },
      { label: 'Koh et al., VisualWebArena (arXiv:2401.13649)', url: 'https://arxiv.org/abs/2401.13649', why: 'The end-to-end web-task benchmark that shows the gap between grounding accuracy and completing a real workflow.' },
      { label: 'AgentVista (arXiv:2602.23166)', url: 'https://arxiv.org/abs/2602.23166', why: 'The hardest 2026 benchmark, the source of the 27 to 40 percent frontier number this lesson treats as a design constraint.' },
    ],
    shipIt: {
      kind: 'rubric',
      name: 'Computer-use agent supervision rubric',
      body:
        '- Does every action type in the schema have a named risk level (safe, reversible, irreversible)?\n- Is there an approval gate in front of every irreversible action, not just a general "are you sure" at the end of the run?\n- Is the action log replayable by a human after the fact, with screenshots or state snapshots at each step?\n- Does the agent verify the outcome of an action (price, selection, confirmation text) before treating it as ground truth for the next step?\n- What is the target benchmark score for this task category, and does the product design assume supervision at that failure rate?\n- Does long-horizon memory use a strategy (summary-chain, skip-frame, log) matched to whether cross-tab or cross-form state actually matters for this workflow?',
    },
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
