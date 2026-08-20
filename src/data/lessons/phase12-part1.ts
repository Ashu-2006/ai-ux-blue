import type { Lesson } from '@/lib/lessons';

// Phase 12 · Part 1 · How images become tokens (lessons 12.01-12.03, hand-authored)
export const phase12Part1: Lesson[] = [
  {
    id: 'p12-01-patch-tokens',
    phase: 'Phase 12 · Multimodal AI',
    part: 'Part 1 · How images become tokens',
    index: '12.01',
    title: 'Vision transformers and the patch-token primitive',
    oneLiner:
      'An image cannot enter a transformer as pixels. It gets cut into a grid of small patches, and each patch becomes one token. Everything multimodal starts with this move.',
    readTime: '~8 min read',
    diagram: 'lessons/p12-01-patch-pipeline.svg',
    diagramCaption:
      'The patch-token pipeline: image, grid of patches, flatten, linear projection, position encoding, token sequence.',
    whyItMatters:
      'When you design an AI product that accepts images, the patch grid is the hidden meter running behind your UI. A screenshot is not "one attachment", it is hundreds to thousands of tokens that compete with the conversation for context, add latency, and cost real money. Knowing that resolution and patch size set the token count lets you reason about why image answers are slower, why fine text in screenshots gets misread at low resolution, and what an "image quality" setting in your product actually trades away.',
    sections: [
      {
        heading: 'The problem: transformers eat sequences, images are grids',
        body: 'A transformer operates on a sequence of vectors. Text arrives as a sequence already. An image is a 2D grid of pixels in three color channels, and flattening every pixel of a 224x224 image would produce about 150,000 tokens, which self-attention cannot afford (its cost grows with the square of sequence length).\n\nBefore 2020 the workaround was to bolt a CNN on the front and feed its small feature map to the transformer. It worked, but it inherited the CNN\'s built-in assumptions and gave up the transformer\'s ability to keep improving with scale.',
      },
      {
        heading: 'The move: patches as tokens',
        body: 'The Vision Transformer (ViT, 2020) skips the CNN entirely. Cut the image into fixed-size squares (16x16 pixels is the classic), flatten each square into one long vector, and push every one through the same learned projection matrix into the model\'s hidden dimension. Each patch is now a token, exactly like a word.\n\nThe canonical config: a 224x224 image with 16px patches gives a 14x14 grid, so 196 tokens. In production code the projection is implemented as a strided convolution, which is mathematically the same thing but fast.',
      },
      {
        heading: 'Position: the model must know where each patch was',
        body: 'Attention treats tokens as an unordered bag, so each patch token needs its position attached. Early ViTs learned one position vector per grid slot, which glued the model to its training resolution. Modern encoders use 2D rotary embeddings (2D-RoPE): the patch\'s row and column rotate its query and key vectors, so relative position is baked into the geometry and any grid size works at inference.',
      },
      {
        heading: 'One vector for the whole image, or all the patches?',
        body: 'For classification you need a single image-level vector: either a special CLS token that soaks up the summary, or a simple mean over all patch outputs (the modern default). Recent encoders also add a few "register" tokens, spare slots that absorb attention noise the model would otherwise dump into random patches, which measurably improves dense tasks like segmentation.\n\nFor vision-language models the answer is different: no pooling at all. Every patch token flows into the LLM as input, which is exactly why images are expensive in context.',
      },
      {
        heading: 'What changed between 2020 and now',
        body: 'The primitive held for five years; three upgrades made it production-grade. Self-supervised pretraining (DINOv2, MAE) removed the need for labels. Register tokens cleaned up attention artifacts. Native-resolution packing (SigLIP 2\'s NaFlex) let one model ingest any aspect ratio instead of squashing everything to a square.\n\nThe workhorse encoder in 2026 open models is SigLIP 2 SO400m: 400M parameters, 14px patches, 384px default resolution, which means 729 tokens per image, all of which land in the LLM\'s context for visual question answering.',
      },
    ],
    takeaways: [
      'One image = (height / patch size) x (width / patch size) tokens. Resolution and patch size are the two levers, and both are quadratic.',
      'Finer patches (14px vs 16px) read fine text better and cost more tokens. This is the mechanism behind every "image detail" setting.',
      'VLMs skip pooling: all patch tokens enter the LLM context. A single screenshot can outweigh pages of conversation.',
      'The encoder is frozen infrastructure in most products. What you can influence in design is what resolution you send and how many images you allow.',
    ],
    terms: [
      { term: 'Patch', meaning: 'A fixed-size square of the image that becomes exactly one token.' },
      { term: 'Patch embedding', meaning: 'The shared learned projection from raw patch pixels to a model-dimension vector.' },
      { term: 'CLS token', meaning: 'A prepended learnable token whose output summarizes the whole image. Optional now.' },
      { term: 'Register token', meaning: 'Spare learnable tokens that absorb attention noise; discarded before output.' },
      { term: '2D-RoPE', meaning: 'Positional scheme that rotates vectors by grid row and column, so any resolution works.' },
      { term: 'Vision tower', meaning: 'The pretrained image encoder whose patch tokens feed the LLM inside a VLM.' },
    ],
    demoCaption:
      'Drag the resolution and switch the patch size. Watch the grid, the token count, and how much of an 8k context one image eats. This is the meter running behind every image-upload UI.',
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'a screenshot is not "one attachment".',
        body:
          'a screenshot is not "one attachment".\n\nthe model cuts it into a grid of patches and every patch becomes a token. 384px at patch 14 = 729 tokens. one image can outweigh pages of conversation.\n\nthat is why image answers are slower and cost more. the meter is the grid, not the file size.',
      },
      {
        kind: 'X · design angle',
        hook: 'every "image quality" setting you have ever designed is secretly a patch-count setting.',
        body:
          'every "image quality" setting you have ever designed is secretly a patch-count setting.\n\nfiner grid = the model reads fine text better, costs more tokens, answers slower.\ncoarser grid = fast and cheap, misses the small print.\n\nresolution is quadratic. the tradeoff you expose in UI is literally (H/P) x (W/P).',
      },
      {
        kind: 'X · one-liner',
        hook: 'LLMs do not see images. they read them, 16 pixels at a time.',
        body:
          'LLMs do not see images. they read them, 16 pixels at a time.\n\nevery vision model since 2020 cuts the image into patch tokens and feeds them in like words. once you know that, image latency, OCR misses, and context limits all stop being mysterious.',
      },
    ],
    source: {
      label: 'Full lesson: 12.01 vision-transformer-patch-tokens',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/12-multimodal-ai/01-vision-transformer-patch-tokens',
    },
  },
  {
    id: 'p12-02-clip-contrastive',
    phase: 'Phase 12 · Multimodal AI',
    part: 'Part 1 · How images become tokens',
    index: '12.02',
    title: 'CLIP: images and text in one vector space',
    oneLiner:
      'CLIP trained an image encoder and a text encoder to agree, using 400M noisy web captions and no labels at all. The shared embedding space it produced is the substrate of modern multimodal AI.',
    readTime: '~8 min read',
    diagram: 'lessons/p12-02-contrastive-matrix.svg',
    diagramCaption:
      'The contrastive similarity matrix: N images vs N captions per batch. The diagonal pairs are pulled together, everything else is pushed apart.',
    whyItMatters:
      'CLIP-style embeddings are why "search my photos for the beach one" works without anyone tagging photos, and why AI features can classify things they were never trained on. For product work, the key intuition is that capability comes from proximity in a vector space: it is fuzzy, it has a ceiling, and it fails silently on concepts far from the training data. When you design search, moderation, or auto-tagging UX on top of embeddings, you are designing around similarity scores, not certainties, and the confidence treatment in your UI should say so.',
    sections: [
      {
        heading: 'The problem: labels do not scale',
        body: 'Supervised vision needed humans to label every class, which is expensive, biased toward what labelers agree on, and useless for tomorrow\'s categories. Meanwhile the web holds billions of image-caption pairs for free. A photo with alt text "my dog Max in the park" already carries supervision: the text describes the image.\n\nCLIP\'s bet (OpenAI, 2021) was that matching, not labeling, is enough: given a batch of images and captions, learn to pair each image with its own caption against all the others.',
      },
      {
        heading: 'The mechanism: two towers, one space',
        body: 'CLIP is two encoders. An image tower (a ViT, built from patch tokens per lesson 12.01) and a text tower (a small transformer). Both output a vector normalized to length 1, so similarity is just the dot product.\n\nTake a batch of N pairs and compute the full N x N similarity matrix between every image and every caption. Training pushes the diagonal (true pairs) up and everything else down, in both directions: each image must find its caption, each caption must find its image. Bigger batches mean more distractors per example, which is why CLIP trained at batch sizes above 32,000.',
      },
      {
        heading: 'Zero-shot: classification without training',
        body: 'The trained space does more than retrieval. Want a cat vs dog classifier? Embed the phrases "a photo of a cat" and "a photo of a dog", embed your image, pick the closer one. No training on cats or dogs ever happened.\n\nThe wording of the template shifts accuracy by several points, an early hint of what prompt engineering would become. This zero-shot trick caps out around 76 to 80 percent on ImageNet; when a task needs more, you train a small classifier head on top of frozen CLIP features.',
      },
      {
        heading: 'SigLIP: the scaling fix',
        body: 'CLIP\'s softmax loss needs the full similarity matrix assembled in one place, so distributed training pays a heavy synchronization tax that grows with GPU count. SigLIP (Google, 2023) replaced it with an independent yes-or-no judgment per pair: is this image and this caption a match? Each GPU scores its own block and no global gather is needed.\n\nSigLIP 2 (2025) added native aspect ratios, over 100 languages, and better dense features. It is the default vision tower inside 2026 open vision-language models.',
      },
      {
        heading: 'What the space is actually for',
        body: 'The benchmark number was never the point. The durable asset is the embedding space itself: it powers image search, deduplication, content moderation, recommendation, retrieval-augmented generation over screenshots and documents, and it is the frozen vision half of nearly every open VLM. When lesson 12.03 bridges vision into an LLM, this space is what gets bridged.',
      },
    ],
    takeaways: [
      'Contrastive training turns noisy web captions into supervision. No labels, just "these two belong together".',
      'Zero-shot means comparing embeddings to text prompts. It is a similarity ranking, not a verdict, and UX should treat it that way.',
      'Prompt template wording moves accuracy by points. Copy is a model input, not decoration.',
      'Softmax vs sigmoid loss is a distributed-systems decision, and it decided which encoder the whole ecosystem standardized on.',
    ],
    terms: [
      { term: 'Contrastive loss', meaning: 'Training signal that pulls matched pairs together and pushes mismatched pairs apart in the shared space.' },
      { term: 'Dual encoder', meaning: 'Two separate towers (image, text) projecting into the same vector space.' },
      { term: 'Zero-shot', meaning: 'Classifying by similarity to text prompts, with no training on the target classes.' },
      { term: 'Temperature', meaning: 'A learned scalar that sharpens or softens the similarity distribution before the loss.' },
      { term: 'Linear probe', meaning: 'A single trained layer on top of frozen features; the cheap upgrade over zero-shot.' },
      { term: 'SigLIP', meaning: 'CLIP with a per-pair sigmoid loss; cheaper to scale, now the standard vision tower.' },
    ],
    demoCaption:
      'Pick an image and read the similarity bars against three text prompts. The model never trained on these categories; it just measures distance in the shared space. Note how close the runner-up can get, and what your UI should do about that.',
    posts: [
      {
        kind: 'X · mechanism',
        hook: '"search my photos for the beach one" works because of a matching game played 400M times.',
        body:
          '"search my photos for the beach one" works because of a matching game played 400M times.\n\nCLIP trained an image encoder and a text encoder to agree: pull each photo toward its own caption, push it from everyone else\'s. no labels, just noisy alt text.\n\nthe leftover artifact is a space where words and pictures are neighbors. that space is the feature.',
      },
      {
        kind: 'X · design angle',
        hook: 'embeddings return rankings, not verdicts. most AI UIs present them as verdicts anyway.',
        body:
          'embeddings return rankings, not verdicts. most AI UIs present them as verdicts anyway.\n\nzero-shot classification is "which text prompt is closest". the runner-up is often a hair away.\n\nif your UI shows top-1 as fact with no alternatives and no correction path, the design is lying about the model\'s certainty.',
      },
      {
        kind: 'X · one-liner',
        hook: 'the prompt template moves accuracy by whole points. copy is a model input.',
        body:
          'the prompt template moves accuracy by whole points. copy is a model input.\n\n"a photo of a {class}" vs "a picture of a {class}" changes zero-shot results. writers have been doing prompt engineering since 2021, they just were not invited to the meeting.',
      },
    ],
    source: {
      label: 'Full lesson: 12.02 clip-contrastive-pretraining',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/12-multimodal-ai/02-clip-contrastive-pretraining',
    },
  },
  {
    id: 'p12-03-qformer-bridge',
    phase: 'Phase 12 · Multimodal AI',
    part: 'Part 1 · How images become tokens',
    index: '12.03',
    title: 'BLIP-2: bridging a frozen eye to a frozen brain',
    oneLiner:
      'CLIP can match images to text but cannot talk about them. BLIP-2 connected a frozen vision encoder to a frozen LLM with a tiny trainable bridge, and invented the adapter pattern every VLM now uses.',
    readTime: '~8 min read',
    diagram: 'lessons/p12-03-qformer-bridge.svg',
    diagramCaption:
      'The Q-Former bridge: 32 learnable queries cross-attend over frozen ViT patch tokens, then feed a frozen LLM as 32 visual tokens.',
    whyItMatters:
      'This lesson is the anatomy of every "chat with your screenshot" feature. The bridge architecture decides the product tradeoff you feel in UX: compress the image into few tokens (cheap, fast, more images per conversation, but detail gets lost) or pass every patch through (sharp OCR and detail, but the context fills fast and each image costs more). When a PM asks why the model misses small text, or why only N images fit per chat, the answer usually lives in this compression choice, not in the model being "bad".',
    sections: [
      {
        heading: 'The problem: two frozen giants, incompatible interfaces',
        body: 'By 2023 there were excellent frozen vision encoders (producing, say, 256 patch tokens of one dimensionality) and excellent frozen LLMs (expecting embeddings of another dimensionality). Retraining either costs millions. A naive linear bridge works but dumps all 256 visual tokens into the LLM\'s context per image.\n\nBLIP-2 (Salesforce, 2023) asked: can a small trainable module compress the image into far fewer tokens, well enough for captioning and question answering, while both giants stay frozen?',
      },
      {
        heading: 'The trick: learnable queries that interview the image',
        body: 'The Q-Former is a small transformer holding 32 learnable query vectors. These queries are model parameters, the same 32 for every image. Through cross-attention they interrogate the frozen encoder\'s patch tokens and each comes away holding a compressed slice of what the image contains.\n\nThe output is a fixed 32-token visual summary. Project those into the LLM\'s embedding space, prepend them to the text prompt, and the frozen LLM can now caption, answer, and reason about the image as if the tokens were words it read.',
      },
      {
        heading: 'Training a bridge without touching the towers',
        body: 'BLIP-2 trains in two stages. First, representation learning against text only: a contrastive objective (CLIP-style), a match-or-not classifier, and a caption-generation loss together force the 32 queries to encode content that language can express.\n\nOnly then is the frozen LLM attached, and a language-modeling loss tunes the bridge end to end. Total trained parameters: 188M, about 2.4 percent of the full stack. It matched a 50x larger end-to-end model on zero-shot visual question answering. The bridge works.',
      },
      {
        heading: 'The rival: LLaVA\'s "just use an MLP"',
        body: 'Months later LLaVA replaced the whole clever bridge with a two-layer MLP that projects every patch token straight into the LLM, several hundred tokens per image, no compression. Controversial, then dominant: with good visual instruction data the simple projector preserved more detail, and it scaled naturally to multiple images and video.\n\nBy 2026 the field settled into a split. Compressive bridges (Q-Former family, perceiver resamplers) win where token budget is the constraint, like long video. Pass-through projectors win where per-token quality matters, like reading documents.',
      },
      {
        heading: 'The pattern to remember',
        body: 'BLIP-2\'s durable contribution is not the specific module, it is the adapter pattern: keep the expensive pretrained parts frozen, train a thin interface between them. The same economics now drive LoRA finetuning, tool adapters, and most practical multimodal engineering. When you see a small team ship a capable multimodal product, an adapter between frozen giants is usually how.',
      },
    ],
    takeaways: [
      'Frozen encoder + frozen LLM + small trainable bridge = multimodal capability at 2 to 3 percent of the training cost.',
      'Compression vs pass-through is THE bridge decision: token budget against detail fidelity. Products inherit it as image limits and OCR quality.',
      'Learnable queries are a general compression idea: a fixed set of slots that attend over variable-size input.',
      'The adapter pattern (train thin interfaces, freeze the giants) is the economic engine of applied AI.',
    ],
    terms: [
      { term: 'Q-Former', meaning: 'A small transformer whose learnable queries compress patch tokens into a fixed visual summary.' },
      { term: 'Learnable query', meaning: 'A trained vector that extracts information from another modality via cross-attention.' },
      { term: 'Cross-attention', meaning: 'Attention where queries come from one stream and keys/values from another (text asks, image answers).' },
      { term: 'Adapter', meaning: 'A small trained module bridging frozen pretrained models.' },
      { term: 'MLP projector', meaning: 'LLaVA\'s simple alternative: project every patch token into LLM space, no compression.' },
      { term: 'Perceiver resampler', meaning: 'Flamingo\'s variant of the same idea: fixed queries resampling variable visual input.' },
    ],
    demoCaption:
      'Flip between the two bridge architectures. Compressive (32 tokens) keeps the context light but blurs fine detail; pass-through (576 tokens) reads the small print and fills the context fast. Products inherit whichever tradeoff their model picked.',
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'how do you teach a language model to see without retraining it? you do not. you train a translator.',
        body:
          'how do you teach a language model to see without retraining it? you do not. you train a translator.\n\nBLIP-2: frozen vision encoder + frozen LLM + a 188M bridge between them. 32 learned queries interview the image and hand the LLM a 32-token summary.\n\n2.4% of the parameters trained. matched models 50x bigger.',
      },
      {
        kind: 'X · design angle',
        hook: 'when your AI product misses the fine print in a screenshot, the model is probably not "bad". the bridge is compressive.',
        body:
          'when your AI product misses the fine print in a screenshot, the model is probably not "bad". the bridge is compressive.\n\nsome VLMs squeeze each image to ~32 tokens (cheap, fast, lossy). others pass ~576 through (sharp OCR, fat context).\n\nimage limits per chat and OCR quality are one architecture decision, inherited by your UX.',
      },
      {
        kind: 'X · one-liner',
        hook: 'the cheapest capability in AI: freeze two giants, train the handshake.',
        body:
          'the cheapest capability in AI: freeze two giants, train the handshake.\n\nBLIP-2 did it for vision + language. LoRA does it for finetuning. small teams ship multimodal products on exactly this economics.',
      },
    ],
    source: {
      label: 'Full lesson: 12.03 blip2-qformer-bridge',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/12-multimodal-ai/03-blip2-qformer-bridge',
    },
  },
];
