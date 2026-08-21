import type { Lesson } from '@/lib/lessons';

// Phase 12 · Part 2 · lessons 12.04-12.10 (add-lessons pipeline)
export const phase12Part2: Lesson[] = [
  {
    id: 'p12-04-flamingo',
    phase: 'Phase 12 · Multimodal AI',
    part: 'Part 1 · How images become tokens',
    index: '12.04',
    title: 'Flamingo: gated cross-attention and few-shot vision',
    oneLiner:
      'Flamingo (DeepMind, 2022) threaded vision into a frozen 70B LLM through new cross-attention layers behind a tanh gate initialized to zero, so at step zero the model was still a perfect language model. It was the first VLM to read interleaved images and learn from examples in the prompt.',
    readTime: '~8 min read',
    diagram: '/lessons/p12-04.svg',
    diagramCaption:
      'Gated cross-attention: text flows through the frozen LLM as always; between blocks, a tanh-gated layer adds visual information from the Perceiver resampler on top.',
    whyItMatters:
      'Flamingo is the ancestor of every chat thread where a user pastes several screenshots and refers back to them, and of every "here are three examples, now do the fourth" prompt with images. Two product behaviors trace to its mechanism: multi-image conversations work because vision is added between LLM layers instead of crammed into the input, and text quality survives because the visual gate opens gradually from zero. When a fine-tuned multimodal model suddenly writes worse, the usual culprit is that gate opening too wide too fast, not the data.',
    sections: [
      {
        heading: 'The problem: many images in one conversation',
        body: 'BLIP-2 feeds 32 visual tokens into a frozen LLM\'s input layer, which works for one image per prompt. Real usage is messier: "here is image A, caption it; here is B; now C". Mixing image and text tokens in a single input stream raises a fussy question of which text positions may attend to which images, and every added image inflates the input.\n\nFlamingo\'s answer: do not touch the LLM\'s input stream at all. Insert new cross-attention layers between the frozen LLM\'s existing blocks, every 4 layers, and let text reach over to the visual features from there.',
      },
      {
        heading: 'The gate: zero at initialization, visual later',
        body: 'Each inserted layer computes y = tanh(alpha) * cross_attention + x, where alpha is a learnable scalar starting at zero. Since tanh(0) = 0, the new layers are no-ops at step zero: an untrained Flamingo is exactly the pretrained Chinchilla 70B on text. As training proceeds, alpha moves and visual information flows in smoothly.\n\nThe residual means even a fully open gate adds to the text representation rather than overwriting it. Visual conditioning is additive, gated, and zero at init. That single design choice is why the frozen LLM\'s abilities, including in-context learning, survive intact.',
      },
      {
        heading: 'The resampler: any image becomes 64 tokens',
        body: 'A prompt can hold zero, one, or many images at any resolution, so the cross-attention layers need a fixed interface. The Perceiver resampler provides it: 64 learnable latent vectors cross-attend over however many patch tokens the ViT produced, and after 6 blocks every image exits as exactly 64 visual tokens. A 196-patch image and a 900-patch image look identical downstream.\n\nFor video the resampler runs per frame with a temporal position encoding, so a clip becomes frames x 64 tokens. This is the same fixed-queries idea as BLIP-2\'s Q-Former, aimed at variable input instead of compression.',
      },
      {
        heading: 'Interleaving and the few-shot punchline',
        body: 'A masked cross-attention rule handles mixed sequences: each text token attends only to the most recent preceding image, keeping the reading order coherent. Trained on 43M interleaved web pages (plus 4.4B image-text pairs and 27M video clips), the model learned the natural rhythm of images embedded in text.\n\nThe payoff: give three (image, caption) examples in the prompt and Flamingo captions a fourth image with no gradient step. The frozen LLM\'s in-context learning carried through the gate. Few-shot multimodal prompting, now table stakes, was the paper\'s centerpiece.',
      },
      {
        heading: 'The lineage, and when to pick which bridge',
        body: 'OpenFlamingo reproduced the architecture openly at 3B to 9B; Otter added instruction tuning on top; Hugging Face\'s Idefics line progressively simplified it, with Idefics2 dropping the resampler for pooled patch tokens. Gemini\'s interleaved input format is the conceptual heir. OBELICS, the open 141M-page interleaved corpus, is what these models train on.\n\nThe cost split against BLIP-2 is stark: 188M trained parameters versus roughly 10B, days on 8 GPUs versus weeks on thousands of TPUs. Pick the cheap bridge for single-image answering, the Flamingo pattern for interleaved, multi-image, few-shot work.',
      },
    ],
    takeaways: [
      'Gated cross-attention adds vision between frozen LLM layers: y = tanh(alpha) * cross + x, with alpha at zero, so day-zero behavior is pure LLM.',
      'The Perceiver resampler turns any number of patches into exactly 64 tokens, giving variable image counts a fixed interface.',
      'Few-shot multimodal prompting works because the frozen LLM\'s in-context learning survives the additive gate.',
      'When a multimodal fine-tune degrades text quality, suspect the gate schedule before the data.',
    ],
    terms: [
      { term: 'Gated cross-attention', meaning: 'A residual layer y = tanh(alpha) * cross + x with learnable alpha initialized to zero.' },
      { term: 'Perceiver resampler', meaning: 'Fixed learnable latents that cross-attend over variable patch counts, emitting a constant 64 tokens per image.' },
      { term: 'Interleaved input', meaning: 'A prompt where images and text mix freely in reading order, like a web page.' },
      { term: 'Few-shot prompt', meaning: 'A handful of (image, answer) examples in the prompt; the model generalizes with no fine-tuning.' },
      { term: 'Gate schedule', meaning: 'How fast alpha moves during training; too fast erodes the LLM\'s text ability.' },
      { term: 'OBELICS', meaning: 'The open 141M-page corpus of web documents with images in reading order, used by Flamingo\'s open descendants.' },
    ],
    demoCaption:
      'Drag the gate value from zero upward and watch how much visual signal reaches the frozen LLM. At zero the model is untouched Chinchilla; the whole trick is that vision arrives as a gradual addition, never a replacement.',
    demo: {
      archetype: 'slider-map',
      sliderLabel: 'Gate value tanh(alpha)',
      outputLabel: 'Visual signal mixed into the LLM',
      badCaption:
        'The intuitive fear: wiring a vision module into a language model should scramble its text ability from day one, so you would have to retrain everything together.',
      goodCaption:
        'The mechanism: the gate starts at exactly zero, so the inserted layers are no-ops and the LLM is untouched. Training opens the gate gradually, and the residual only ever adds visual information on top of text.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'how do you add eyes to a 70B language model without breaking its brain? start with the eyes closed.',
        body:
          'how do you add eyes to a 70B language model without breaking its brain? start with the eyes closed.\n\nflamingo inserts cross-attention layers between the frozen LLM\'s blocks, each behind tanh(alpha) with alpha = 0. at step zero the model is a perfect chinchilla 70B. training opens the gate slowly.\n\nvisual conditioning as a gradual addition, never a rewrite.',
      },
      {
        kind: 'X · design angle',
        hook: 'multi-image chat threads exist because someone decided not to touch the input stream.',
        body:
          'multi-image chat threads exist because someone decided not to touch the input stream.\n\nflamingo routes vision in between LLM layers instead of stuffing image tokens into the prompt. any number of images, each resampled to a fixed 64 tokens, each text token reading only the image before it.\n\nthe UX pattern "paste three screenshots, discuss them in order" is this masking rule, shipped.',
      },
      {
        kind: 'X · one-liner',
        hook: 'tanh(0) = 0 is the most valuable line in multimodal AI.',
        body:
          'tanh(0) = 0 is the most valuable line in multimodal AI.\n\nflamingo\'s visual gate starts closed, so the frozen LLM keeps everything it knows, including learning from examples in the prompt. few-shot image captioning fell out for free.',
      },
    ],
    source: {
      label: 'Full lesson: 12.04 flamingo-gated-cross-attention',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/12-multimodal-ai/04-flamingo-gated-cross-attention',
    },
  },
  {
    id: 'p12-05-llava',
    phase: 'Phase 12 · Multimodal AI',
    part: 'Part 1 · How images become tokens',
    index: '12.05',
    title: 'LLaVA: the two-layer MLP that beat the clever bridges',
    oneLiner:
      'LLaVA (2023) replaced the Q-Former with a two-layer MLP, replaced gated cross-attention with plain token concatenation, and trained on 158k instruction turns written by GPT-4 from text captions. It became the most copied multimodal architecture on the planet.',
    readTime: '~8 min read',
    diagram: '/lessons/p12-05.svg',
    diagramCaption:
      'The LLaVA pipeline: ViT patches, a two-layer MLP projector into LLM space, and the <image> placeholder in the prompt replaced by 576 visual tokens.',
    whyItMatters:
      'LLaVA is the reason small teams ship vision features at all: the whole recipe runs in about a day on one 8-GPU node and the checkpoint is open. Two of its moves matter for product thinking. First, simplicity beat cleverness once contexts grew, a recurring pattern worth recognizing before betting on an intricate architecture. Second, its training data was synthesized by a stronger model from text alone, which means data pipelines, not annotation budgets, decide what a model learns. When you scope a domain-specific vision feature, the LLaVA data recipe is the cost model to reason from.',
    sections: [
      {
        heading: 'The problem: the clever bridge had a bottleneck',
        body: 'BLIP-2\'s Q-Former compresses an image to 32 tokens, which is elegant but lossy: the queries learn an intermediate representation trained on three proxy losses, and detail dies in the bottleneck. Worse, the 188M-parameter module had to be co-designed with its LLM. Swap the LLM, retrain the bridge. Every pairing was its own R&D project.\n\nLLaVA\'s answer was embarrassing in its simplicity: take all 576 patch tokens from the ViT, push each through a two-layer MLP into the LLM\'s embedding dimension, and concatenate them into the prompt. No compression, no proxy objectives, just language-modeling loss.',
      },
      {
        heading: 'The data trick: GPT-4 wrote the training set',
        body: 'The second insight was where instruction data came from. Take a COCO image\'s five human captions and its bounding-box list, hand that text to GPT-4 (which never saw the pixels), and ask for three things: a user-assistant conversation, a detailed description, and a complex reasoning question with its answer.\n\nParsing the outputs yielded 158k instruction-response turns with zero human annotation. GPT-4 hallucinated some plausible-but-wrong content, but the noise was survivable: 158k turns unlocked dialogue about images. The same pipeline can be rerun cheaply for any new domain.',
      },
      {
        heading: 'The recipe: two stages, one day, one node',
        body: 'Stage 1 freezes the ViT and the LLM and trains only the MLP (about 22M parameters) on 558k image-caption pairs, teaching it to map ViT space into LLM space. A few hours.\n\nStage 2 unfreezes the LLM and trains on the 158k instruction turns. About 20 hours on 8 A100s. That number is why LLaVA spread: one day, one node, reproducible, and the LLM is swappable (Vicuna, Llama, Mistral) by retraining a projector that costs almost nothing. By late 2023 there were more than 50 forks.',
      },
      {
        heading: 'Why simple beat clever',
        body: 'The Q-Former\'s one real advantage was token budget: 32 tokens versus LLaVA\'s 576 per image. Through 2023, LLM contexts grew from 2k to 32k and beyond, and the budget stopped binding. What remained was the MLP\'s advantages: more detail preserved per image, a single loss end to end, natural extension to multiple images and video by concatenation, and trivial LLM swaps.\n\nAt 2048 context an image ate 576 of the tokens; at 32k it is a rounding error. The constraint the clever design optimized for simply evaporated.',
      },
      {
        heading: 'What LLaVA became',
        body: 'LLaVA-1.5 added academic VQA data and a 32k context. LLaVA-NeXT added AnyRes: tile a high-resolution image into 336px crops plus a global thumbnail, roughly 2880 visual tokens, and OCR and chart benchmarks jumped. LLaVA-OneVision (lesson 12.08) unified single-image, multi-image, and video under one budget and curriculum.\n\nThe through-line: the projector never got smarter, the data and the resolution strategy did. Any practitioner who built a VLM between 2023 and 2026 built some variant of this recipe.',
      },
    ],
    takeaways: [
      'A two-layer MLP projecting all patch tokens into the LLM beat compressive bridges once contexts grew past the token-budget constraint.',
      'LLaVA\'s instruction data was written by GPT-4 from captions alone: synthesized data pipelines, not annotation, set the training cost.',
      'The full recipe runs in ~20 hours on one 8xA100 node, which is why it spawned 50+ forks and became the default.',
      'When an architecture and its simpler rival tie on quality, the one with fewer coupled parts wins the ecosystem.',
    ],
    terms: [
      { term: 'MLP projector', meaning: 'A two-layer MLP with GELU mapping ViT patch embeddings into the LLM\'s embedding dimension.' },
      { term: 'Image placeholder', meaning: 'The <image> marker in the prompt, replaced by the projected visual tokens before the LLM runs.' },
      { term: 'Visual instruction tuning', meaning: 'Stage-2 training on (image, instruction, response) triplets so the model converses instead of just captioning.' },
      { term: 'Stage 1 alignment', meaning: 'Training only the projector on caption pairs, with both towers frozen, to align the two spaces.' },
      { term: 'AnyRes', meaning: 'Tiling a high-resolution image into fixed-size crops plus a thumbnail, concatenating all their tokens.' },
      { term: 'ShareGPT4V', meaning: 'A dataset of ~1M dense GPT-4V-written captions used to improve alignment quality.' },
    ],
    demoCaption:
      'Two bridge recipes for the same image, side by side. The clever one compresses and couples everything; the simple one projects everything and swaps parts freely. The simple one is the industry standard.',
    demo: {
      archetype: 'before-after',
      subject: 'VLM bridge recipe',
      badLabel: 'Q-Former (clever)',
      goodLabel: 'MLP (simple)',
      badLines: [
        '188M-parameter bridge module',
        'Three proxy losses before the real one',
        '32 tokens per image, detail lost in the bottleneck',
        'Swap the LLM = retrain the bridge',
        'Multi-image and video: awkward',
      ],
      goodLines: [
        '~22M-parameter two-layer MLP',
        'One language-modeling loss end to end',
        '576 tokens per image, detail preserved',
        'Swap the LLM = retrain a cheap projector',
        'Multi-image and video: just concatenate',
      ],
      badCaption:
        'The 2023 assumption: images must be compressed before an LLM can afford them, so the bridge must be clever, and clever means coupled.',
      goodCaption:
        'The mechanism that won: pass everything through, spend context instead of engineering. Once LLM contexts hit 32k, the token budget stopped binding and simplicity took the ecosystem.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'the most copied multimodal architecture on earth is a 2-layer MLP.',
        body:
          'the most copied multimodal architecture on earth is a 2-layer MLP.\n\nllava: project all 576 patch tokens straight into the LLM, concatenate, train on LM loss. no compression module, no proxy objectives.\n\n~20 hours on 8 A100s. one day, one node. that number, not the architecture, is why it spawned 50+ forks.',
      },
      {
        kind: 'X · design angle',
        hook: 'llava\'s training data was written by a model that never saw the images.',
        body:
          'llava\'s training data was written by a model that never saw the images.\n\ngpt-4 (text-only) got COCO captions + bounding boxes and wrote 158k instruction turns: conversations, descriptions, reasoning questions.\n\nif you are scoping a domain vision feature, this is the cost model: synthesis pipelines, not annotation budgets, decide what your model learns.',
      },
      {
        kind: 'X · one-liner',
        hook: 'clever optimizes for a constraint. check whether the constraint will still exist next year.',
        body:
          'clever optimizes for a constraint. check whether the constraint will still exist next year.\n\nthe q-former saved tokens when contexts were 2k. contexts went to 32k and the simple MLP that "wasted" tokens took over the entire open VLM ecosystem.',
      },
    ],
    source: {
      label: 'Full lesson: 12.05 llava-visual-instruction-tuning',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/12-multimodal-ai/05-llava-visual-instruction-tuning',
    },
  },
  {
    id: 'p12-06-patch-n-pack',
    phase: 'Phase 12 · Multimodal AI',
    part: 'Part 1 · How images become tokens',
    index: '12.06',
    title: 'Any-resolution vision: patch-n-pack, AnyRes, M-RoPE',
    oneLiner:
      'Real images are receipts, charts, and phone screenshots, not 224px squares. Squashing them to a square destroys exactly the detail OCR needs. Patch-n-pack, tiling, and multimodal RoPE are the three ways models learned to eat images at native resolution.',
    readTime: '~8 min read',
    diagram: '/lessons/p12-06.svg',
    diagramCaption:
      'Patch-n-pack: three images of different sizes flattened into one packed sequence, with a block-diagonal mask keeping each image\'s patches attending only to themselves.',
    whyItMatters:
      'Aspect ratio is a product decision wearing an infrastructure costume. If your users upload receipts, documents, or phone screenshots, a model that square-resizes will silently misread the small print, and no prompt fixes it. The counterweight is cost: native resolution on a large document can be thousands of tokens, and tiling multiplies that. The 2026 knob is a per-task pixel cap (Qwen exposes it as min_pixels and max_pixels), which is effectively a quality slider your product sets per feature. Knowing these three strategies tells you which failure you will see: distortion, blowup, or both.',
    sections: [
      {
        heading: 'The problem: the world is not square',
        body: 'Transformers want equal-length sequences per batch, and fixed 224x224 inputs deliver that: 196 tokens every time. But documents are portrait, charts are 16:9, receipts run 1:3, and a phone screenshot is 1170x2532.\n\nThe three pre-2024 workarounds each fail in a named way. Resize to a square: text squishes, chart labels dissolve. Crop: you throw away most of the image and picking the crop is its own vision problem. Pad to the longest side: no distortion, but half your tokens are padding and attention pays quadratic cost on them anyway.',
      },
      {
        heading: 'Patch-n-pack: one sequence, many shapes',
        body: 'NaViT (2023) showed the mechanical fix. Patch each image at its native size, flatten each into its own variable-length run, concatenate all the runs into one long batch sequence, and build a block-diagonal attention mask so image A\'s patches attend only within image A.\n\nThree images of 576, 256, and 768 tokens become one 1600-token sequence with zero padding and zero wasted compute. FlashAttention\'s variable-length path skips the dense mask entirely using cumulative lengths, roughly 10x faster. Fractional patch dropping (drop 50% at random during training) regularizes and speeds it further; SigLIP 2 inherited both tricks.',
      },
      {
        heading: 'AnyRes: tiling when the encoder is frozen',
        body: 'If your encoder only speaks 336x336, LLaVA-NeXT\'s AnyRes is the pragmatic route: pick the grid layout (2x2, 1x3, and so on) that best fits the aspect ratio, cut the image into 336px tiles, encode each, and add a full-image thumbnail for global context.\n\nThe cost is multiplicative. A 672x672 image at 2x2 plus thumbnail is 2880 tokens; a 1344x1344 at 4x4 is nearly 9800, most of an 8k context for one image. AnyRes buys frozen-encoder compatibility with token explosion, which is why it suits high-value document reads more than casual photo chat.',
      },
      {
        heading: 'M-RoPE and NaFlex: native resolution as a primitive',
        body: 'Qwen2-VL\'s M-RoPE removes position tables entirely: each patch carries a 3D position (time, row, column) and rotary embeddings handle any height, width, or frame count. Feed any HxW, get H/14 x W/14 tokens, no tiles, no thumbnail, no multiplicative overhead.\n\nSigLIP 2\'s NaFlex mode packages the same idea for encoders: one checkpoint serving 256, 729, or 1024-token budgets at inference. Semantic task, pick 256. OCR or charts, pick 1024. The budget became a runtime parameter instead of an architecture decision, which is what makes per-feature quality settings possible.',
      },
      {
        heading: 'Token budgets by task',
        body: 'The 2026 production rule: set a per-task max-pixels cap, encode at native aspect ratio up to the cap, pack the batch, skip padding.\n\nWorking numbers: OCR and documents want 1024 to 4096 tokens; charts and UI screenshots 729 to 1024; natural photos are fine at 256 to 576 because the LLM does not need more; video runs 64 to 128 tokens per frame after pooling. Spend tokens where content density is high. A receipt deserves more budget than a beach photo ten times its pixel count.',
      },
    ],
    takeaways: [
      'Square-resize has three named failure modes: squished text, cropped content, wasted padding tokens. OCR complaints usually trace to the first.',
      'Patch-n-pack batches variable-size images in one sequence with a block-diagonal mask: zero padding, zero distortion.',
      'AnyRes tiling rescues frozen encoders at multiplicative token cost; M-RoPE gets native resolution linearly.',
      'A per-task pixel cap (min_pixels / max_pixels) is the production knob: it is a quality slider your product sets per feature.',
    ],
    terms: [
      { term: 'Patch-n-pack', meaning: 'Concatenating variable-length patch sequences from different images into one batch sequence.' },
      { term: 'Block-diagonal mask', meaning: 'The attention mask confining each image\'s patches to attend only within their own block.' },
      { term: 'AnyRes', meaning: 'Tiling a large image into fixed-size crops plus a global thumbnail for a fixed-resolution encoder.' },
      { term: 'NaFlex', meaning: 'SigLIP 2\'s mode where one checkpoint serves multiple token budgets (256/729/1024) at inference.' },
      { term: 'M-RoPE', meaning: '3D rotary position encoding (time, row, column) that handles any resolution without position tables.' },
      { term: 'max_pixels', meaning: 'Qwen\'s per-request cap on image pixels, and therefore on token count and cost.' },
    ],
    demoCaption:
      'The same receipt through both pipelines. Square-resize crushes a 1:2.5 document into a square and the line items go with it; native packing keeps every patch legible and pays only for real content.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Receipt, 600x1500 px',
      badLabel: 'Square-resize',
      goodLabel: 'Native + pack',
      badLines: [
        'Squashed to 336x336, aspect 1:2.5 forced to 1:1',
        'Line items compressed to ~2px text',
        'OCR output: "TOTAL $8?.??"',
        '576 tokens spent on distorted pixels',
      ],
      goodLines: [
        'Native grid: 43x107 patches at patch 14',
        'Digits stay at readable pixel density',
        'OCR output: "TOTAL $84.20"',
        'Packed batch, block-diagonal mask, no padding',
      ],
      badCaption:
        'The misreading: "the model is bad at receipts." The model never saw the receipt; it saw a square where the small print was crushed below patch resolution before encoding began.',
      goodCaption:
        'The mechanism: keep the native grid, pack variable-length images into one sequence, and mask so each image attends to itself. The detail survives because nothing was thrown away upstream.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'when a vision model misreads a receipt, the receipt was usually destroyed before the model saw it.',
        body:
          'when a vision model misreads a receipt, the receipt was usually destroyed before the model saw it.\n\npre-2024 pipelines squashed everything to a 224px square. a 1:2.5 receipt loses its digits in the resize, not in the reasoning.\n\nthe fix is mechanical: patch at native resolution, pack variable-length images into one sequence, block-diagonal mask. zero padding, zero distortion.',
      },
      {
        kind: 'X · design angle',
        hook: 'aspect ratio is a product decision wearing an infrastructure costume.',
        body:
          'aspect ratio is a product decision wearing an infrastructure costume.\n\nreceipts, docs, phone screenshots: portrait. charts: 16:9. a square-resizing model silently fails on all of them and no prompt fixes it.\n\nthe 2026 knob is a per-task pixel cap. OCR gets 1024-4096 tokens, photos get 256-576. that cap is a quality slider your product sets per feature.',
      },
      {
        kind: 'X · one-liner',
        hook: 'spend tokens where the content density is, not where the pixels are.',
        body:
          'spend tokens where the content density is, not where the pixels are.\n\na receipt deserves 4x the token budget of a beach photo ten times its size. modern encoders (NaFlex, M-RoPE) let you pick the budget per request. most products still send one size for everything.',
      },
    ],
    source: {
      label: 'Full lesson: 12.06 any-resolution-patch-n-pack',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/12-multimodal-ai/06-any-resolution-patch-n-pack',
    },
  },
  {
    id: 'p12-07-vlm-recipes',
    phase: 'Phase 12 · Multimodal AI',
    part: 'Part 2 · Open-weight VLM recipes',
    index: '12.07',
    title: 'Open-weight VLM recipes: which knob actually matters',
    oneLiner:
      'MM1, Idefics2, Molmo, Cambrian-1, and Prismatic ran hundreds of controlled ablations on VLM design. The verdict: visual token count and encoder choice explain most of the quality; the connector everyone argues about explains almost none.',
    readTime: '~8 min read',
    diagram: '/lessons/p12-07.svg',
    diagramCaption:
      'The five-axis VLM design space: encoder, connector, LLM, data mix, resolution schedule, sized by how much benchmark variance each axis explains.',
    whyItMatters:
      'This lesson is a prioritization exercise, and prioritization is design work. When a vision feature underperforms, the instinct is to debate architecture; the ablation literature says look at resolution, token budget, and data quality first, because that is where the variance lives. The Molmo result generalizes beyond ML: 712k dense human captions beat a larger competitor\'s distilled synthetic data on every benchmark. Quality of input beats quantity of machinery. If you ever help scope an AI training effort or evaluate a vendor\'s claims, knowing which axis moves the needle is the difference between a useful question and a decorative one.',
    sections: [
      {
        heading: 'The problem: a forest of ablation tables',
        body: 'Hundreds of open VLMs exist, and most of the gap between good and state-of-the-art is not architecture. Apple\'s MM1 tested 13 encoder-connector-data combinations. Idefics2 formalized the design space into five axes: image encoder, connector, LLM, data mix, resolution schedule. Cambrian-1 compared 20+ encoders. Prismatic ran 27 recipes with everything else held constant.\n\nThe practical stake: knowing which knob to turn first when a model underperforms saves a multi-million-GPU-hour mistake. Out of all the tables, a few results replicate everywhere.',
      },
      {
        heading: 'Encoder beats connector',
        body: 'MM1\'s ablation: swapping CLIP ViT-L for SigLIP SO400m added 3+ points on MMMU; swapping the connector from MLP to Perceiver resampler added less than 1. Idefics2 replicated it. Cambrian-1\'s 20-encoder match-up put DINOv2 and SigLIP at the top of vision-centric benchmarks with CLIP mid-pack, a 5 to 7 point spread.\n\nThe 2026 default: SigLIP 2 SO400m for semantics, sometimes concatenated with DINOv2 features when dense tasks like grounding matter. The encoder is the model\'s retina; the connector is just wiring, and wiring is fungible.',
      },
      {
        heading: 'The connector is a wash; the token count is not',
        body: 'At a fixed visual-token count, a 2-layer MLP performs within a point of a 32-query Q-Former. Four independent papers agree. What moves quality is how many tokens the LLM receives per image: 64 is too few for OCR, 576 to 1024 is the sweet spot, 2048+ pays off only on documents and charts.\n\nPrismatic\'s controlled decomposition puts numbers on it: per-image token count explains about 60% of variance, encoder choice about 20%, connector architecture about 5%, everything else the remaining 15%. Ablate in that order.',
      },
      {
        heading: 'Data: human captions beat distillation',
        body: 'Allen AI\'s Molmo is the data result to remember. Annotators described images in 1 to 3 minute spoken passes, transcribed into 712k dense captions (PixMo). No GPT-4V distillation anywhere. Molmo-72B beat Llama-3.2-90B-Vision on 11 of 11 benchmarks with a smaller model.\n\nThe delta is caption quality: a dense human caption carries 5 to 10x the information of web alt text and stays factually grounded where distilled synthetic captions inherit the teacher\'s hallucinations. The 2026 ordering: caption density beats caption quantity beats distillation convenience. LLM size still sets the reasoning ceiling: doubling 7B to 13B reliably adds 2 to 4 MMMU points.',
      },
      {
        heading: 'The 2026 default recipe',
        body: 'Every default below traces to a measured ablation. Encoder: SigLIP 2 SO400m at native resolution with NaFlex, plus DINOv2 if you need grounding. Connector: 2-layer MLP; skip the Q-Former unless token-constrained. LLM: 7B class for cost, 70B class for quality, chosen by latency target. Data: PixMo, ShareGPT4V, Cauldron, topped with task-specific instructions. Resolution: dynamic, 256 to 1280 pixels per long side, ramped during training since flat schedules plateau lower.\n\nStage 1 aligns the projector, stage 2 fine-tunes fully, stage 3 specializes. Boring, measured, and it works.',
      },
    ],
    takeaways: [
      'Prismatic\'s decomposition: visual token count ~60% of variance, encoder ~20%, connector ~5%. Ablate in that order.',
      'The encoder swap (CLIP to SigLIP) is worth 3+ benchmark points; the connector debate is worth less than 1.',
      'Molmo\'s 712k dense human captions beat a 90B model trained on distilled data on 11 of 11 benchmarks: input quality beats machinery.',
      'LLM size sets the reasoning ceiling; the vision encoder can only feed it, never reason for it.',
    ],
    terms: [
      { term: 'Ablation', meaning: 'Training runs that differ in exactly one design axis so the axis\'s effect can be measured.' },
      { term: 'Connector', meaning: 'The trainable module mapping encoder output into LLM token space (MLP, Q-Former, resampler).' },
      { term: 'Dense caption', meaning: 'A multi-sentence human description, typically 80 to 300 tokens, far richer than web alt text.' },
      { term: 'Distillation', meaning: 'Training data generated by a stronger proprietary model; convenient, but hallucinations are inherited.' },
      { term: 'Resolution ramp', meaning: 'A schedule that starts training at low resolution and increases it; trains faster and ends higher than flat.' },
      { term: 'PixMo', meaning: 'Allen AI\'s 712k densely human-captioned image dataset, the data behind Molmo\'s results.' },
    ],
    demoCaption:
      'One benchmark score, decomposed. The headline invites an architecture debate; the breakdown says the connector you are arguing about explains a twentieth of what the token count does.',
    demo: {
      archetype: 'meter',
      headline: 'MMMU moved 8 points. "Must be the new connector."',
      breakdown: [
        { label: 'Visual token count per image', value: 60 },
        { label: 'Encoder choice (SigLIP vs CLIP)', value: 20 },
        { label: 'Data mix, schedule, LR, rest', value: 15 },
        { label: 'Connector architecture', value: 5 },
      ],
      badCaption:
        'The misreading: benchmark deltas get credited to whichever component is newest and most discussed, usually the connector, because architecture is what papers name themselves after.',
      goodCaption:
        'The mechanism: Prismatic held everything constant and varied one axis at a time. Token count explains ~60% of variance, encoder ~20%, connector ~5%. When quality disappoints, turn the big knobs first.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'five papers ran hundreds of controlled VLM ablations. the component everyone debates explains 5% of the variance.',
        body:
          'five papers ran hundreds of controlled VLM ablations. the component everyone debates explains 5% of the variance.\n\nprismatic\'s decomposition: visual token count ~60%, encoder choice ~20%, connector architecture ~5%.\n\nswapping CLIP for SigLIP: +3 points. swapping MLP for a fancy resampler: <1. ablate the big knobs first.',
      },
      {
        kind: 'X · design angle',
        hook: 'molmo beat a model 25% larger on 11 of 11 benchmarks. the difference was not architecture. it was who wrote the captions.',
        body:
          'molmo beat a model 25% larger on 11 of 11 benchmarks. the difference was not architecture. it was who wrote the captions.\n\n712k images described by humans in 1-3 minute spoken passes vs distilled synthetic captions that inherit the teacher\'s hallucinations.\n\ninput quality beats machinery. that lesson transfers to every design system and dataset you will ever own.',
      },
      {
        kind: 'X · one-liner',
        hook: 'when the model underperforms, the instinct is an architecture debate. the evidence says check the token budget.',
        body:
          'when the model underperforms, the instinct is an architecture debate. the evidence says check the token budget.\n\n64 visual tokens per image cannot do OCR no matter how clever the bridge. 576-1024 is the sweet spot. the boring knob is the load-bearing one.',
      },
    ],
    source: {
      label: 'Full lesson: 12.07 open-weight-vlm-recipes',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/12-multimodal-ai/07-open-weight-vlm-recipes',
    },
  },
  {
    id: 'p12-08-llava-onevision',
    phase: 'Phase 12 · Multimodal AI',
    part: 'Part 2 · Open-weight VLM recipes',
    index: '12.08',
    title: 'LLaVA-OneVision: one budget, one curriculum, three scenarios',
    oneLiner:
      'Single-image, multi-image, and video used to need three separate models. LLaVA-OneVision trained one model to handle all three by fixing the visual token budget and ordering the training curriculum, and got emergent skills nobody trained.',
    readTime: '~8 min read',
    diagram: '/lessons/p12-08.svg',
    diagramCaption:
      'One token budget, three allocations: tiles for a single image, moderate resolution for image sets, aggressively pooled frames for video, all landing near the same total.',
    whyItMatters:
      'OneVision explains why one assistant now handles your screenshot, your photo set, and your screen recording without switching models, and why its cost is predictable: the visual budget per request is fixed, only the allocation changes. For product work the deeper lesson is the curriculum. Order of training data determines what a model becomes, the way onboarding order determines what a user learns; perception first, structure second, and reversing it produces a model that talks fluently about images it barely sees. The emergent skills (set-of-mark prompting, screenshot agents) are also a preview: capabilities can appear that nobody specified, which cuts both ways.',
    sections: [
      {
        heading: 'The problem: three scenarios, three budget shapes',
        body: 'Each input shape stresses a VLM differently. A single image wants maximum resolution: AnyRes tiling at around 2880 tokens to catch OCR-level detail. Multi-image wants 4 to 8 images at moderate resolution, roughly 576 tokens each, so cross-image reasoning fits in context. Video wants many frames at low resolution, around 200 tokens per frame, because the signal is temporal.\n\nBefore OneVision the field trained a specialist per shape: LLaVA-1.5 for images, Mantis for image sets, Video-LLaVA for clips. Each won its own benchmark and failed the neighbors\'.',
      },
      {
        heading: 'The move: fix the total, vary the allocation',
        body: 'OneVision picks a unified budget of roughly 3000 to 4000 visual tokens per sample and spends it differently per scenario. Single image: 3x3 tiles plus thumbnail, pooled to about 1820 tokens. Multi-image: six images at 729 tokens each, no tiling. Video: 32 frames pooled hard to 81 tokens per frame, about 2600 total.\n\nThe LLM never sees a batch that blows its context, whatever the input shape. Pooling happens on the 2D patch grid via bilinear interpolation, not on the flat token list, so spatial locality survives the shrink.',
      },
      {
        heading: 'The curriculum: order is the mechanism',
        body: 'Training runs in three stages, and the order is load-bearing. Stage one is single-image only, at high resolution: this builds the perceptual base, OCR, fine-grained understanding. Stage two mixes single-image, multi-image, and video under the shared budget, teaching heterogeneous structure. Stage three optionally leans toward the deployment mix.\n\nThe paper ablates the ordering explicitly: train video-first or multi-image-first and image performance ends worse on the same data. Structure without a perceptual base yields a model that follows cross-image reasoning patterns while being visually shallow. Perception first, composition second.',
      },
      {
        heading: 'Emergent skills nobody trained',
        body: 'Three capabilities showed up at inference without matching training data. Multi-camera reasoning: trained on multi-image and video separately, the model correctly integrates views of a driving scene across cameras. Set-of-mark prompting: annotate objects with numbered marks and it reasons about "mark 3 relative to mark 7" despite never seeing marks in training. And an iPhone-screenshot agent: shown a screen, it plans the next tap, generalized from UI screenshots plus workflow video plus before-after pairs.\n\nThese are compositions of trained skills, unlocked by the shared backbone and curriculum, not by any explicit task data.',
      },
      {
        heading: 'The contrast: fixed budget vs scaling budget',
        body: 'Qwen2.5-VL (lesson 12.09) makes the opposite bet: its token count scales with the input, so a one-minute video simply costs more than a five-second clip, with M-RoPE and dynamic FPS absorbing the variety. OneVision fixes the budget and scales the pooling instead.\n\nThe trade is configurability against predictability: Qwen adapts spend to content, OneVision guarantees per-request cost. The 2025 follow-up, OneVision-1.5, opened the full data and training stack with the same recipe: better base LLM and more data, no architecture change. The curriculum was the invention.',
      },
    ],
    takeaways: [
      'One model covers image, multi-image, and video by fixing total visual tokens (~3-4k) and varying the allocation per scenario.',
      'Curriculum order is load-bearing: perception (single-image) first, structure (multi-image, video) second. Reversed, the model is visually shallow.',
      'Pooling on the 2D patch grid, not the token list, is how frames shrink to 81 tokens without losing spatial locality.',
      'Emergent skills (set-of-mark, screenshot agents) arise from skill composition, not task data: capabilities can ship that nobody specified.',
    ],
    terms: [
      { term: 'OneVision scenario', meaning: 'One of the three input shapes (single image, multi-image, video) served under the shared budget.' },
      { term: 'Token budget', meaning: 'The total visual tokens per sample, held near-constant across scenarios, typically 3000 to 4000.' },
      { term: 'Curriculum', meaning: 'The deliberate stage ordering of training data, chosen so earlier skills transfer to later ones.' },
      { term: 'Bilinear pooling', meaning: 'Shrinking the patch grid by interpolation in 2D (24x24 to 12x12) to cut tokens while keeping locality.' },
      { term: 'AnyRes-k', meaning: 'A k-tile split of a high-resolution image plus one thumbnail; k of 4 or 9 is typical.' },
      { term: 'Emergent skill', meaning: 'A capability that appears at inference without matching training data, composed from trained parts.' },
    ],
    demoCaption:
      'Two training orders, same data. The sequence is the design: build perception before structure and both survive; reverse it and the model learns the shape of reasoning without the sight to back it.',
    demo: {
      archetype: 'sequence',
      badSequence: [
        'Train on video + multi-image first (structure-heavy)',
        'Model learns cross-image patterns on a weak perceptual base',
        'Add single-image data later',
        'Image benchmarks end lower on identical data',
        'Result: fluent about images it barely sees',
      ],
      goodSequence: [
        'Stage SI: single-image only, high resolution',
        'Perceptual base: OCR, fine detail, grounding',
        'Stage OV: mix image + multi-image + video, one budget',
        'Stage TT: lean toward the deployment mix',
        'Result: one model, three scenarios, emergent skills',
      ],
      badCaption:
        'The misreading: training data is a bag, so order should not matter as long as everything is in the mix somewhere.',
      goodCaption:
        'The mechanism: earlier stages build representations later stages compose. Perception first gives structure something to stand on; the paper\'s ablation shows the reversed order ends measurably worse on the same data.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'same data, different order, measurably different model. curriculum is a real variable.',
        body:
          'same data, different order, measurably different model. curriculum is a real variable.\n\nllava-onevision trains single-image first (perception), then mixes multi-image and video (structure). reverse the order and image benchmarks end lower on identical data.\n\nstructure without a perceptual base = a model fluent about images it barely sees.',
      },
      {
        kind: 'X · design angle',
        hook: 'your assistant handles a screenshot, a photo set, and a screen recording with one predictable cost. that is a budget decision, not a model size decision.',
        body:
          'your assistant handles a screenshot, a photo set, and a screen recording with one predictable cost. that is a budget decision, not a model size decision.\n\nonevision fixes ~3-4k visual tokens per request and reallocates: tiles for one image, 6x729 for image sets, 32 pooled frames for video.\n\nfixed budget = predictable latency and price. the allocation is the design.',
      },
      {
        kind: 'X · one-liner',
        hook: 'nobody trained the screenshot agent. it emerged.',
        body:
          'nobody trained the screenshot agent. it emerged.\n\nonevision saw UI screenshots, workflow videos, and before-after pairs. at inference it plans the next tap on a phone screen. capabilities can compose into features nobody specified. that cuts both ways.',
      },
    ],
    source: {
      label: 'Full lesson: 12.08 llava-onevision-single-multi-video',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/12-multimodal-ai/08-llava-onevision-single-multi-video',
    },
  },
  {
    id: 'p12-09-qwen-vl',
    phase: 'Phase 12 · Multimodal AI',
    part: 'Part 2 · Open-weight VLM recipes',
    index: '12.09',
    title: 'The Qwen-VL family: native resolution, real time, agent JSON',
    oneLiner:
      'Four Qwen-VL generations each made one architectural bet the open ecosystem copied within a year: native dynamic resolution via M-RoPE, timestamps as tokens with dynamic FPS, and structured JSON output that turned a chat model into a GUI agent.',
    readTime: '~8 min read',
    diagram: '/lessons/p12-09.svg',
    diagramCaption:
      'M-RoPE splits the hidden dimension into three bands, rotating each by temporal, height, and width position, so text, images, and video share one encoding.',
    whyItMatters:
      'The Qwen-VL lineage is where three product capabilities were normalized: reading dense documents at native resolution, understanding video with real timestamps ("at 0:42 the user taps checkout"), and emitting machine-parseable actions. The last one matters most for design: moving from free-form "click at (1024, 512)" to trained JSON output took GUI-grounding accuracy from 55% to 84%, and reliable computer-use agents became feasible at exactly that jump. Output format is not presentation, it is a trained capability with a measurable accuracy cost. When you spec an AI feature\'s output contract, you are making a model decision, not a formatting one.',
    sections: [
      {
        heading: 'The problem: resolution, video, structured output',
        body: 'Qwen-VL shipped in August 2023 aimed at three gaps LLaVA left open. Resolution: 336px is fine for photos, useless for an invoice or a dense spreadsheet screenshot; Qwen-VL started at 448 and trained grounding, emitting bounding-box coordinates as text so the model could point at things. Video: stacking per-frame encoders worked for short clips, not multi-minute footage where time is the signal. Structured output: agents need JSON, not prose.\n\nEvery subsequent generation extends one of those three axes. Reading the family chronologically explains why each knob is where it is.',
      },
      {
        heading: 'Qwen2-VL: M-RoPE and native resolution',
        body: 'The 2024 generation dropped the fixed-resolution stack. The ViT accepts any size divisible by 28; an 1120x672 image yields 960 tokens, no resize, no tiling, no thumbnail.\n\nThe enabler is M-RoPE: every token carries a 3D position (time, height, width), and the hidden dimension splits into three bands, each rotated by its own axis. Text uses its sequence index, images use row and column, video frames add time. One encoding, no branching code, no position tables to outgrow. The Q-Former was replaced by a plain MLP. Result: Qwen2-VL-7B beat GPT-4o on DocVQA, 94.5 to 88.4.',
      },
      {
        heading: 'Qwen2.5-VL: time becomes a token',
        body: 'The 2025 generation made video first-class. Instead of frame indices, the model sees absolute timestamps interleaved with frame tokens, so "at 0:04 the cat jumps" is grounded in real seconds. Dynamic FPS follows: sample slow footage at 1 FPS and action at 4 or more, with the budget math explicit: a 60-second clip at 4 FPS and 81 tokens per frame is about 19k tokens, fine in a 32k context.\n\nWindowed attention in the ViT bought throughput, and MRoPE-v2 scaled position frequencies so a 10-minute video does not run off the encoding range.',
      },
      {
        heading: 'Structured output: JSON is trained, not parsed',
        body: 'Qwen2.5-VL trained directly on tool-call data: the model emits {"tool": "mouse_click", "coords": [1024, 512]} instead of prose describing a click. Parsing becomes JSON.parse instead of regex and ambiguity handling.\n\nThe scoreboard tells you this is capability, not formatting: ScreenSpot GUI grounding jumped from Qwen2-VL\'s 55% to 84%, against 38% for GPT-4o at the time. Computer-use agents became practical at that jump. Qwen3-VL (late 2025) consolidated rather than reinvented: bigger backbone, more data, better OCR and reasoning, same ViT and M-RoPE. The primitives had stabilized.',
      },
      {
        heading: 'The budget logic you inherit',
        body: 'Deploying a Qwen-family model means deciding the sampling policy. Given duration T and token budget B, the maximum affordable FPS is B / (T x tokens_per_frame); pick from {1, 2, 4, 8} under that ceiling, higher when motion is high. A security feed can run at 1 FPS all day; a tennis rally needs 4+.\n\nThe per-request knobs min_pixels and max_pixels bound image cost the same way. These are product levers: they decide what your feature can see, how fast it answers, and what each request costs. Someone will set them; better if it is deliberate.',
      },
    ],
    takeaways: [
      'M-RoPE gives text, image, and video one position encoding by splitting the hidden dimension into time, height, and width bands.',
      'Absolute time tokens ground video answers in real seconds, which is what makes "what happened at 0:42" a reliable query.',
      'Training JSON output took GUI grounding from 55% to 84%: an output contract is a trained capability, not a formatting choice.',
      'Dynamic FPS is a budget equation (fps <= budget / (duration x tokens_per_frame)); set it per use case, not globally.',
    ],
    terms: [
      { term: 'M-RoPE', meaning: 'Rotary position encoding with three bands (time, height, width) in the hidden dimension.' },
      { term: 'Dynamic FPS', meaning: 'Choosing the video sampling rate per clip from motion, duration, and token budget.' },
      { term: 'Absolute time token', meaning: 'A timestamp token interleaved with frames so the model sees real seconds, not frame numbers.' },
      { term: 'Window attention', meaning: 'ViT self-attention restricted to local windows for speed, with periodic global layers.' },
      { term: 'Grounding', meaning: 'Emitting bounding-box coordinates as text so the model can point at regions; in Qwen since v1.' },
      { term: 'min_pixels / max_pixels', meaning: 'Per-request bounds on image pixel count, and therefore on tokens, latency, and cost.' },
    ],
    demoCaption:
      'Slide the motion level of a 30-second clip and watch the sampling rate follow. Fixed-FPS pipelines spend the same tokens on a lecture and a tennis rally; dynamic FPS spends where the events are.',
    demo: {
      archetype: 'slider-map',
      sliderLabel: 'Motion in the clip (lecture to tennis rally)',
      outputLabel: 'Frames sampled per second',
      badCaption:
        'The misreading: video is video, so sample every clip at the same fixed rate. Slow footage wastes tokens on identical frames while fast action drops the exact frames where the event happened.',
      goodCaption:
        'The mechanism: fps <= budget / (duration x tokens per frame), then pick higher within the ceiling when motion is high. Timestamps ride along as tokens, so the model knows 0:04 from 0:40 either way.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'qwen2.5-vl does not number video frames. it timestamps them.',
        body:
          'qwen2.5-vl does not number video frames. it timestamps them.\n\nabsolute time tokens sit interleaved with frame tokens, so "at 0:04 the cat jumps" is grounded in real seconds. sampling rate adapts per clip: 1 FPS for a security feed, 4+ for a rally, bounded by budget / (duration x tokens per frame).\n\nvideo understanding became a scheduling problem.',
      },
      {
        kind: 'X · design angle',
        hook: 'the same model went from 55% to 84% at clicking UI targets. the change was the output format.',
        body:
          'the same model went from 55% to 84% at clicking UI targets. the change was the output format.\n\nqwen2.5-vl trained on JSON tool calls instead of prose: {"tool": "mouse_click", "coords": [1024, 512]}. parsing became deterministic and grounding accuracy jumped 29 points.\n\nwhen you spec an AI feature\'s output contract, you are making a model decision, not a formatting one.',
      },
      {
        kind: 'X · one-liner',
        hook: 'four generations, one bet each, all copied within a year.',
        body:
          'four generations, one bet each, all copied within a year.\n\nqwen-vl: grounding. qwen2-vl: native resolution via M-RoPE. qwen2.5-vl: real timestamps + agent JSON. qwen3-vl: scale it.\n\nby 2025 the primitives stabilized. the open VLM you deploy next is running these decisions.',
      },
    ],
    source: {
      label: 'Full lesson: 12.09 qwen-vl-family-dynamic-fps',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/12-multimodal-ai/09-qwen-vl-family-dynamic-fps',
    },
  },
  {
    id: 'p12-10-internvl3',
    phase: 'Phase 12 · Multimodal AI',
    part: 'Part 2 · Open-weight VLM recipes',
    index: '12.10',
    title: 'InternVL3: native pretraining and the cost of bolted-on vision',
    oneLiner:
      'Every VLM so far bolted vision onto a finished text LLM and paid for it in alignment debt: forgotten text skills, drifting answers, self-contradiction. InternVL3 trained text and vision together from the first gradient step and matched Gemini 2.5 Pro on MMMU-Pro with open weights.',
    readTime: '~8 min read',
    diagram: '/lessons/p12-10.svg',
    diagramCaption:
      'Post-hoc vs native: bolt vision onto a finished LLM and repair the seams, or mix text, interleaved, caption, and video data into one pretraining run from step one.',
    whyItMatters:
      'Alignment debt is the technical name for a UX pattern you have seen: an assistant describes a screenshot correctly, then answers a question contradicting its own description. That inconsistency is architectural. Visual tokens bolted onto a finished LLM never participate in its internal consistency the way text does, and the model also forgets: post-hoc VLMs drop 5 to 10 points on math and text benchmarks. Native pretraining removes the debt at the price of a from-scratch run costing millions of GPU-hours. It is the classic retrofit-versus-rebuild decision, with the same economics: retrofits stay cheaper, rebuilds stay cleaner, and the benchmarks now quantify the gap.',
    sections: [
      {
        heading: 'The problem: bolt-on vision leaves a debt',
        body: 'The default VLM recipe takes an LLM that spent its entire pretraining budget on text and adds vision afterward: align a projector, fine-tune on instructions, ship. It works, and this whole part of the course is proof. But three measurable symptoms follow.\n\nCatastrophic forgetting: text benchmarks like GSM8K drop 5 to 10 points after vision training. Answer drift: rephrasing the same visual question changes the answer, because visual tokens bind to the LLM more weakly than its own vocabulary. Visual-text inconsistency: the model describes an image correctly, then contradicts its own description. MM1.5 quantifies all three.',
      },
      {
        heading: 'The move: one run, mixed from step one',
        body: 'InternVL3 (April 2025) rejects the retrofit. One pretraining run where text, image, and video tokens all participate in the same loss from the first gradient step. The corpus mix: 40% text-only, 35% interleaved image-text documents, 20% caption pairs, 5% video-text.\n\nNo alignment stage, no projector freezing, no forgetting to repair, because nothing was ever learned in isolation. Instruction tuning still follows, but the base model already treats visual tokens as first-class citizens. The claim is measurable: InternVL3-8B loses fewer text points per unit of vision gain than its post-hoc peers.',
      },
      {
        heading: 'What native buys on the scoreboard',
        body: 'At 78B parameters, InternVL3 matches Gemini 2.5 Pro on MMMU-Pro with open weights. At 38B it matches GPT-4o; at 8B it led the open leaderboard on release. One pretrain plus instruction tuning, no multi-stage repair work.\n\nA smaller refinement rides along: V2PE, a position encoding where text gets 1D, images 2D, and video 3D positions on a shared frequency base, with the band allocation learned rather than fixed as in Qwen\'s M-RoPE. Worth 1 to 2 points on video benchmarks at equal compute. Not a revolution; native pretraining is the headline, V2PE the tidying.',
      },
      {
        heading: 'Serving tricks: route the resolution, split the towers',
        body: 'Two deployment optimizations are worth stealing regardless of training strategy. The Visual Resolution Router (ViR) is a small classifier that predicts the minimum resolution a query needs before encoding: about 60% of production traffic is answerable at low or medium resolution, and routing it there yields 2 to 3x throughput at equal quality. An "image detail: auto" setting, learned instead of guessed.\n\nDecoupled deployment (DvD) puts the vision encoder and the LLM on separate GPUs with streaming handoff, since one is bandwidth-bound and runs once per image while the other is KV-cache-bound and runs per output token. Roughly doubles per-node throughput.',
      },
      {
        heading: 'The tradeoff: reuse vs debt',
        body: 'Native pretraining is not a free win. It costs what pretraining an LLM costs, millions of GPU-hours, where post-hoc adaptation reuses an existing model for a fraction of that. Interleaved multimodal data is scarce next to the 15T tokens of available text. And you surrender modularity: a post-hoc VLM can swap in next year\'s LLM by retraining an adapter; a native model cannot.\n\nInternVL3\'s bet is that the debt costs more than the reuse saves, and its benchmarks back it. Both strategies will coexist: post-hoc for most budgets, native at the frontier. InternVL3.5 scaled the recipe; the 2026 InternVL-U added image generation heads on the same backbone.',
      },
    ],
    takeaways: [
      'Alignment debt has three measurable symptoms: text-benchmark drops (5 to 10 points), answer drift on rephrasing, and self-contradiction between description and answer.',
      'Native pretraining mixes text (40%), interleaved (35%), captions (20%), and video (5%) into one loss from step one, so there is no seam to repair.',
      'A resolution router that picks minimum-needed detail per query serves ~60% of traffic cheaply: 2 to 3x throughput at equal quality.',
      'Retrofit vs rebuild economics apply: post-hoc stays cheaper and swappable, native stays cleaner and expensive. Pick by budget, not fashion.',
    ],
    terms: [
      { term: 'Native multimodal pretraining', meaning: 'Text, image, and video tokens sharing one loss from the first training step, never bolted on.' },
      { term: 'Alignment debt', meaning: 'The measurable regressions (forgetting, drift, inconsistency) from adding vision to a finished LLM.' },
      { term: 'V2PE', meaning: 'InternVL3\'s position encoding: per-modality dimensionality with learned band allocation.' },
      { term: 'ViR', meaning: 'A small router that predicts the minimum resolution a query needs before encoding, saving tokens.' },
      { term: 'DvD', meaning: 'Serving the vision encoder and LLM on separate GPUs with streaming handoff; ~2x node throughput.' },
      { term: 'Interleaved corpus', meaning: 'Web documents with images in natural reading order (OBELICS, MMC4); the scarce fuel of native pretraining.' },
    ],
    demoCaption:
      'The release headline shows the vision gains. Tap through to see what the retrofit quietly spent: the text skills, the consistency, and the self-agreement that were already there.',
    demo: {
      archetype: 'reveal',
      opaqueLabel: 'Post-hoc VLM release: vision benchmarks up across the board',
      revealedLines: [
        'GSM8K (math, text-only): down 5 to 10 points after vision training',
        'Same visual question, rephrased: different answer',
        'Describes the image correctly, then contradicts its own description',
        'Visual tokens never joined the LLM\'s internal consistency checks',
      ],
      badCaption:
        'The misreading: the launch chart only plots multimodal benchmarks, so bolting vision onto a finished LLM looks like pure gain.',
      goodCaption:
        'The mechanism: post-hoc training pays in alignment debt. The text LLM re-learns around the graft and forgets; visual tokens bind weakly. Native pretraining avoids the debt by never creating the seam.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'bolting vision onto a language model has a price tag: 5-10 points of math, quietly.',
        body:
          'bolting vision onto a language model has a price tag: 5-10 points of math, quietly.\n\npost-hoc VLM training makes GSM8K drop, answers drift on rephrasing, and the model contradict its own image descriptions. the field calls it alignment debt.\n\ninternvl3\'s fix: train text + vision in one run from step one. no seam, no debt. cost: a full pretrain.',
      },
      {
        kind: 'X · design angle',
        hook: 'when an assistant describes your screenshot correctly and then contradicts itself, that is architecture, not mood.',
        body:
          'when an assistant describes your screenshot correctly and then contradicts itself, that is architecture, not mood.\n\nvisual tokens grafted onto a finished LLM never join its internal consistency checks the way text does. the inconsistency you see in the UI is a training-strategy decision made months earlier.\n\nnative-pretrained models are measurably more self-consistent. worth asking your vendor which kind you bought.',
      },
      {
        kind: 'X · one-liner',
        hook: 'retrofit or rebuild. AI just joined the oldest argument in engineering.',
        body:
          'retrofit or rebuild. AI just joined the oldest argument in engineering.\n\npost-hoc VLMs: cheap, swappable, carry alignment debt. native pretraining: clean, expensive, locked in. internvl3 rebuilt and matched gemini 2.5 pro on MMMU-Pro with open weights. the economics stay classic.',
      },
    ],
    source: {
      label: 'Full lesson: 12.10 internvl3-native-multimodal',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/12-multimodal-ai/10-internvl3-native-multimodal',
    },
  },
];
