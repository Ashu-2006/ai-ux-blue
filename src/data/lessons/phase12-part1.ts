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
      'A transformer eats sequences, not pixels. Cut a 224px image into 16px squares and you get a 14x14 grid, 196 tokens, one per patch. Every multimodal model since ViT (2020) starts here.',
    readTime: '~10 min read',
    diagram: '/lessons/p12-01-patch-pipeline.svg',
    diagramCaption:
      'The patch-token pipeline: image, grid of patches, flatten, linear projection, position encoding, token sequence.',
    whyItMatters:
      'When you design a product that accepts images, the patch grid is the hidden meter running behind the upload button. A screenshot is not "one attachment": at SigLIP 2\'s default 384px and patch 14, it is 729 tokens competing with the conversation for context, latency, and cost. Claude Opus 4.7 processes images natively at 2576px. Knowing that resolution and patch size set the token count explains why image answers are slower, why fine print gets misread at low resolution, and what an "image quality" toggle actually trades away.',
    learningObjectives: [
      'Compute the patch-token sequence length for a given resolution and patch size, e.g. 384px at patch 14 versus 224px at patch 16.',
      'Explain why 2D-RoPE replaced learned 1D position tables in 2026 vision encoders.',
      'Compare CLS token, mean pooling, and register tokens, and pick the right one for a classification task versus a VLM.',
      'Name the three pretraining objectives, supervised, contrastive, and self-distilled, that produced ViT\'s 2026 descendants and what each backbone is good for.',
      'Estimate the token cost an image adds to a chat model\'s context window at a stated resolution and patch size.',
    ],
    sections: [
      {
        heading: 'The problem: transformers eat sequences, images are grids',
        body: 'A transformer operates on a sequence of vectors. Text arrives as a sequence already: bytes or tokens, one after another. An image is a 2D grid of pixels across three color channels, and flattening every pixel of a 224x224 image produces roughly 150,000 tokens. Self-attention cost grows with the square of sequence length, so that number is a non-starter.\n\nBefore 2020 the workaround was a CNN feature extractor bolted onto the front: a ResNet reduces the image to a 7x7 grid of 2048-dim vectors, and only those 49 tokens reach the transformer. It worked, but it inherited the CNN\'s built-in assumptions (local receptive fields, translation equivariance) and gave up the transformer\'s appetite for scaling with data.',
      },
      {
        heading: 'The move: patches as tokens',
        body: 'The Vision Transformer (Dosovitskiy et al., 2020) skips the CNN. Cut the image into fixed-size squares, flatten each square into one long vector, and push every one through the same learned projection matrix into the model\'s hidden dimension. Each patch is now a token, exactly like a word.\n\nThe canonical config, ViT-B/16: a 224x224 image with 16px patches gives a 14x14 grid, so 196 tokens, each patch holding 16 x 16 x 3 = 768 pixel values before projection. In production code the projection is a strided convolution (`Conv2d(3, D, kernel_size=P, stride=P)`), mathematically identical to the linear version but faster on GPUs. At the time, vision without convolutions read as heresy. With enough training data (JFT-300M, then LAION), it beat ResNet and kept improving with scale.',
      },
      {
        heading: 'Position: why the grid needs coordinates',
        body: 'Attention treats tokens as an unordered bag, so each patch token needs its position attached or the model cannot tell a sky patch from a ground patch. Early ViTs learned one position vector per grid slot, 197 of them for ViT-B/16 including the CLS slot. That glued the model to its training resolution: change the grid and you have to interpolate the position table.\n\nModern encoders use 2D rotary embeddings (2D-RoPE), the scheme behind Qwen2-VL\'s M-RoPE and SigLIP 2\'s default. The patch\'s row and column rotate its query and key vectors, so relative position is baked into the geometry itself. No table to interpolate. Any grid size works at inference, which is what lets a single model accept a square screenshot and a widescreen photo without retraining.',
      },
      {
        heading: 'CLS token vs mean pool vs register tokens',
        body: 'Three ways to turn a grid of patch tokens into one decision.\n\n| Approach | Mechanism | Who ships it |\n|---|---|---|\n| CLS token | Prepended learnable vector; its final hidden state summarizes the image | Original ViT, CLIP |\n| Mean pool | Average every patch token\'s output | SigLIP, DINOv2, most 2026 VLMs |\n| Register tokens | 4-16 extra learnable slots that absorb attention noise, discarded before output | DINOv2, SigLIP 2 |\n\nDarcet et al. (2023) found that ViTs trained without a sink token develop high-norm "artifact" patches that hijack self-attention; registers absorb that load and measurably improve dense tasks like segmentation and depth. Vision-language models skip pooling entirely: every patch token flows into the LLM as input, which is exactly why images are expensive in context.',
      },
      {
        heading: 'Pretraining recipes: what each backbone is actually good for',
        body: 'The 2020 ViT trained with supervised classification on JFT-300M. Four alternatives replaced it fast. CLIP (2021) aligns images and text contrastively on 400M pairs, covered in lesson 12.02. MAE (He et al., 2021) masks 75 percent of patches and reconstructs pixels, pure self-supervision with no captions needed. DINO and DINOv2 (2021, 2023) use student-teacher self-distillation with no labels and no text at all; DINOv2 ViT-g/14 is the strongest purely visual backbone for dense features. SigLIP and SigLIP 2 (2023, 2025) pair CLIP\'s contrastive idea with a cheaper sigmoid loss and native aspect ratios.\n\nThe pretraining objective sets what the backbone is for: CLIP and SigLIP for matching images to text, DINOv2 for dense visual features like depth and segmentation, MAE as a cheap starting point before finetuning.',
      },
      {
        heading: 'The two scaling levers: patch size and resolution',
        body: 'Two knobs set the token count and the fidelity. Patch size trades sequence length for detail: patch 14 produces more tokens per image than patch 16, better for OCR and dense tasks, slower. Resolution trades the same way, and going from 224 to 384 to 512 pixels almost always helps quality at quadratic FLOPs cost.\n\n| Encoder | Patch | Resolution | Tokens | Params |\n|---|---|---|---|---|\n| ViT-B/16 | 16 | 224 | 196 | ~86M |\n| ViT-L/14 | 14 | 336 | 576 | ~300M |\n| DINOv2 ViT-g/14 | 14 | 224 | 256 | ~1.1B |\n| SigLIP 2 SO400m/14 | 14 | 384 | 729 | 400M |\n\nBall-park a backbone this way before loading the checkpoint. Its size sets the VRAM floor for anything you bolt on top.',
      },
      {
        heading: 'What changed between 2020 and 2026',
        body: 'The primitive held for six years; three upgrades made it production-grade. Self-supervised pretraining (DINOv2, MAE) removed the need for labels entirely. Register tokens cleaned up attention artifacts that hurt dense prediction. Native-resolution packing, SigLIP 2\'s NaFlex, let one model ingest any aspect ratio instead of squashing everything to a square.\n\nThe workhorse encoder inside 2026 open models is SigLIP 2 SO400m/14: 400M parameters, 14px patches, 384px default resolution, 729 tokens per image, all of which land in the LLM\'s context for visual question answering. Frontier closed models push further: Claude Opus 4.7 processes images natively at 2576px. The trend line across five years points the same direction, more tokens per image, spent on sharper detail.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p12-01-inline-pooling.svg',
        alt: 'CLS token vs mean pool vs register tokens',
        caption: 'Three ways to turn a patch grid into one decision: CLS token, mean pool, or register tokens that soak up attention noise.',
        diagramBrief: 'Three small panels side by side, cream paper background (#faf6ef), black ink line art, one blue accent color. Panel 1 "CLS token": a row of 9 small squares (patches) with one starred square prepended labeled CLS, an arrow from the starred square to a single output vector. Panel 2 "Mean pool": the same 9 squares, arrows from every square converging into one averaged output vector. Panel 3 "Register tokens": the 9 squares plus 3 small hollow squares labeled "register" mixed in, accent color highlighting the registers, with a note "discarded before output". Caption band beneath each panel names which models use it (ViT/CLIP, SigLIP/DINOv2, DINOv2/SigLIP 2).',
      },
      {
        src: '/lessons/p12-01-inline-scaling-table.svg',
        alt: 'Token count and parameter count across four vision encoders',
        caption: 'Patch size and resolution are the two levers. Finer patches and higher resolution both raise the token count.',
        diagramBrief: 'A horizontal bar chart, cream paper background, black ink, one blue accent bar. Four bars for ViT-B/16 @ 224 (196 tokens), ViT-L/14 @ 336 (576 tokens), DINOv2 ViT-g/14 @ 224 (256 tokens), SigLIP 2 SO400m/14 @ 384 (729 tokens, accent color, labeled "2026 default"). Bar length maps to token count. Small parameter-count label under each bar.',
      },
    ],
    takeaways: [
      'One image = (height / patch size) x (width / patch size) tokens. Resolution and patch size are the two levers, and both are quadratic.',
      'Finer patches (14px vs 16px) read fine text better and cost more tokens. This is the mechanism behind every "image detail" setting.',
      'VLMs skip pooling: all patch tokens enter the LLM context. A single screenshot can outweigh pages of conversation.',
      'The encoder is frozen infrastructure in most products. What you can influence in design is what resolution you send and how many images you allow.',
    ],
    terms: [
      { term: 'Patch', gloss: '"16x16 pixel square"', meaning: 'A fixed-size non-overlapping region of the input image; becomes exactly one token.' },
      { term: 'Patch embedding', gloss: '"Linear projection"', meaning: 'A shared learned matrix, or a Conv2d with stride P, mapping flattened patch pixels to a D-dimensional vector.' },
      { term: 'CLS token', gloss: '"Class token"', meaning: 'A prepended learnable vector whose final hidden state represents the whole image; optional in 2026 encoders.' },
      { term: 'Register token', gloss: '"Sink token"', meaning: 'Extra learnable tokens that absorb the high-norm attention artifacts ViTs develop during pretraining, discarded before output.' },
      { term: 'Position embedding', gloss: '"Positional info"', meaning: 'A per-position vector or rotation that makes the sequence order-aware; 2D-RoPE is the 2026 default.' },
      { term: 'Grid', gloss: '"Patch grid"', meaning: 'The (H/P) x (W/P) 2D array of patches produced by a given resolution and patch size.' },
      { term: 'NaFlex', gloss: '"Native flexible resolution"', meaning: 'SigLIP 2\'s feature letting one model serve multiple aspect ratios and resolutions without retraining.' },
      { term: 'Vision tower', gloss: '"Backbone"', meaning: 'The pretrained image encoder whose patch-token outputs feed the LLM inside a VLM.' },
      { term: 'Pooling', gloss: '"Image-level summary"', meaning: 'The strategy for turning patch tokens into one vector: CLS, mean, or register-based.' },
      { term: 'Patch 14 vs 16', gloss: '"Finer vs coarser grid"', meaning: 'Patch 14 produces more tokens per image, better fidelity for OCR; patch 16 is the faster classic default.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Given a 512x512 image at patch 16, compute the token count.' },
      { level: 'medium', prompt: 'A 1920x1080 frame at patch 14 produces how many tokens? At 30 fps over 5 minutes of video, how many total visual tokens before any pooling?' },
      { level: 'medium', prompt: 'Read section 3 of "Vision Transformers Need Registers" (arXiv:2309.16588). Describe in two sentences what artifact the registers absorb and why it matters for dense prediction.' },
      { level: 'hard', prompt: 'ViT-B/16 at 224px works out to roughly 86M parameters (patch embed + position embed + 12 transformer blocks). Redo the calculation for SigLIP 2 SO400m/14 at 384px and check your estimate against the published 400M.' },
      { level: 'design', prompt: 'Sketch an "image detail" setting for a chat product with low, medium, and high options. Name what resolution and patch size each option sends to the model, and write the one-line microcopy that explains the tradeoff to a non-technical user.' },
    ],
    furtherReading: [
      { label: 'Dosovitskiy et al., An Image is Worth 16x16 Words (arXiv:2010.11929)', url: 'https://arxiv.org/abs/2010.11929', why: 'The original ViT paper; read section 3 for the patch-embedding math.' },
      { label: 'He et al., Masked Autoencoders Are Scalable Vision Learners (arXiv:2111.06377)', url: 'https://arxiv.org/abs/2111.06377', why: 'The self-supervised alternative to labeled pretraining.' },
      { label: 'Oquab et al., DINOv2 (arXiv:2304.07193)', url: 'https://arxiv.org/abs/2304.07193', why: 'Self-distillation at scale, the strongest purely visual backbone for dense features.' },
      { label: 'Darcet et al., Vision Transformers Need Registers (arXiv:2309.16588)', url: 'https://arxiv.org/abs/2309.16588', why: 'Explains the artifact that register tokens exist to absorb.' },
      { label: 'Tschannen et al., SigLIP 2 (arXiv:2502.14786)', url: 'https://arxiv.org/abs/2502.14786', why: 'The default 2026 vision tower and its NaFlex native-resolution trick.' },
      { label: 'Zhai et al., Scaling Vision Transformers (arXiv:2106.04560)', url: 'https://arxiv.org/abs/2106.04560', why: 'The empirical scaling laws behind the patch-size and resolution tradeoffs.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Vision-backbone token budget checklist',
      body: '- What resolution does this backbone default to, and can I change it?\n- What patch size, and what token count does that resolution and patch size produce?\n- Does the product pool to one vector (classification) or pass every patch through (VLM)?\n- How many images can one conversation hold before the context fills?\n- Does a "quality" or "detail" toggle in the UI map to a real resolution change, and does the copy say so?\n- What is the VRAM floor implied by the backbone\'s parameter count?',
    },
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
      'CLIP trained an image encoder and a text encoder to agree on 400M noisy web captions, no labels. SigLIP replaced its softmax with a per-pair sigmoid in 2023 and scaled past it. The resulting space is the substrate every 2026 VLM builds on.',
    readTime: '~10 min read',
    diagram: '/lessons/p12-02-contrastive-matrix.svg',
    diagramCaption:
      'The contrastive similarity matrix: N images vs N captions per batch. The diagonal pairs are pulled together, everything else is pushed apart.',
    whyItMatters:
      'CLIP-style embeddings are why "find the beach photo" works without anyone tagging photos, and why a moderation model can flag a concept it never saw labeled. The mechanism is proximity in a vector space, not a verdict: it has a ceiling (CLIP tops out near 76 percent zero-shot on ImageNet) and it fails quietly on concepts far from its training data. When you design search, moderation, or auto-tag UX on embeddings, you are designing around a similarity score, and the confidence treatment in the UI should say so.',
    learningObjectives: [
      'Derive the contrastive loss as a matching problem: pair each image with its own caption against every other caption in the batch.',
      'Explain why SigLIP\'s per-pair sigmoid loss scales to batch sizes past 32,000 where CLIP\'s softmax cannot.',
      'Run a zero-shot classification by comparing an image embedding to a set of text-prompt embeddings.',
      'Compare zero-shot, linear probe, and full finetuning, and name what each regime costs and what it protects.',
      'Explain why prompt template wording moves zero-shot accuracy by several points, and what that implies for interface copy.',
    ],
    sections: [
      {
        heading: 'The problem: labels do not scale',
        body: 'Supervised vision needs a human to label every class: expensive, biased toward whatever labelers agree on, and useless for tomorrow\'s categories. ImageNet, the field\'s benchmark for a decade, holds 1.2M images across 1,000 classes, each one hand-labeled.\n\nMeanwhile the open web holds over a billion image-caption pairs for free. A photo with alt text "my dog Max in the park" already carries supervision: the caption describes the picture. CLIP\'s bet (OpenAI, 2021) was that matching, not labeling, is enough. Given a batch of images and captions, learn to pair each image with its own caption against every other caption in the batch. No class labels. No human annotation beyond captions the web already wrote.',
      },
      {
        heading: 'The mechanism: two towers, one space',
        body: 'CLIP is two encoders: an image tower (a ViT, built from the patch tokens of lesson 12.01) and a text tower (a small transformer). Both output a vector normalized to length 1, so similarity between an image and a caption is just their dot product.\n\nTake a batch of N pairs and compute the full N x N similarity matrix between every image and every caption. Training pushes the diagonal, the true pairs, up, and every off-diagonal cell down, in both directions: each image must find its caption, each caption must find its image. Bigger batches mean more distractors per example, which is why CLIP trained at batch sizes above 32,000: more negatives, stronger signal.',
      },
      {
        heading: 'Temperature and the InfoNCE loss',
        body: 'The loss is InfoNCE, a symmetric cross-entropy computed over the similarity matrix\'s rows (image-to-text) and columns (text-to-image), averaged. A learned temperature `tau` scales the similarities before the softmax: low tau sharpens the distribution and acts like hard-negative mining, high tau softens it so every sample contributes a little.\n\nCLIP parametrizes `log(1/tau)` and clips it to stop the temperature collapsing toward zero, which would make training unstable. The softmax step is also the bottleneck: it needs the entire similarity matrix assembled in one place, so distributed training pays a synchronization tax, an all-gather of every embedding to every GPU, that grows with the number of replicas.',
      },
      {
        heading: 'SigLIP: the scaling fix',
        body: 'SigLIP (Google, 2023) replaces the softmax with an independent yes-or-no judgment per pair: is this image and this caption a match? Each pair\'s loss is a binary sigmoid classification, computed locally, so each GPU scores its own block of the matrix and no global gather is needed. Communication cost drops from scaling with the square of world size to scaling linearly.\n\nSigLIP 2 (2025) added native aspect ratios (NaFlex), coverage of over 100 languages where CLIP was English-only, and denser features tuned for use as a frozen backbone. It scales cheaply to batch sizes from 32,000 up to 512,000 and is the default vision tower inside 2026 open vision-language models.',
      },
      {
        heading: 'Zero-shot: classification without training',
        body: 'The trained space does more than retrieval. Want a cat-versus-dog classifier with no training data? Embed the phrases "a photo of a cat" and "a photo of a dog", embed the image, pick whichever text embedding is closer. No training on cats or dogs ever happened.\n\nThe wording of the template shifts accuracy: CLIP\'s original paper averaged 80 templates per class (plain, painting, sketch, low-resolution) for a 3-point gain over a single template, an early hint of what prompt engineering would become. This trick caps out around 76 to 80 percent on ImageNet; SigLIP 2 pushes past 80. When a task needs more than that ceiling, train a small linear classifier on top of frozen features instead.',
      },
      {
        heading: 'Linear probe, finetuning, and the family tree',
        body: 'Three regimes sit between zero-shot and a fully custom model.\n\n| Regime | What you train | Wins when |\n|---|---|---|\n| Zero-shot | Nothing | Fast prototyping, novel classes |\n| Linear probe | One layer on frozen features | In-domain task, small labeled set |\n| Full finetune | The whole encoder | In-domain accuracy matters most, at the cost of zero-shot transfer |\n\nThe same family split three ways after CLIP. ALIGN (Google, 2021) proved noisy data scales to 1.8B pairs, 90 percent of it messy. OpenCLIP reproduced CLIP openly on LAION-400M and LAION-2B, the checkpoint most open pipelines actually load. EVA-CLIP starts from masked image modeling for a stronger backbone. All four ship the same dual-encoder idea with different data and tuning.',
      },
      {
        heading: 'What the space is actually for',
        body: 'The benchmark number was never the point. The durable asset is the embedding space itself: it powers image search, deduplication, content moderation, recommendation, and retrieval-augmented generation over screenshots and documents. It is the frozen vision half of nearly every open VLM shipped in 2026, from LLaVA-OneVision to Qwen-VL. When lesson 12.03 bridges vision into an LLM with BLIP-2\'s Q-Former, this space is exactly what gets bridged, unchanged, into a system that can finally talk about what it sees.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p12-02-inline-regimes.svg',
        alt: 'Zero-shot vs linear probe vs full finetune',
        caption: 'Three regimes for using a frozen CLIP or SigLIP backbone, in order of how much you train and how much accuracy you trade for it.',
        diagramBrief: 'A horizontal spectrum diagram, cream paper background (#faf6ef), black ink, blue accent. Three labeled stops left to right: "Zero-shot" (icon: a lock, nothing trains), "Linear probe" (icon: a single thin bar on top of a frozen block), "Full finetune" (icon: the whole block unlocked). Under each stop, one line of text: what trains, what it costs, what it is good for. Arrow beneath spanning the whole spectrum labeled "more training, more in-domain accuracy, less zero-shot transfer".',
      },
      {
        src: '/lessons/p12-02-inline-loss-compare.svg',
        alt: 'Softmax InfoNCE vs sigmoid pairwise loss',
        caption: 'CLIP\'s softmax needs the whole similarity matrix gathered on one device. SigLIP\'s sigmoid scores each pair independently, which is why it scales to bigger batches.',
        diagramBrief: 'Two side-by-side panels, cream paper background, black ink, one accent color. Left panel "CLIP (softmax)": an N x N grid with a dashed box around the whole grid labeled "all-gather across GPUs", one central node. Right panel "SigLIP (sigmoid)": the same N x N grid split into colored blocks, each block assigned to a separate GPU icon, no dashed box, labeled "local, independent". Caption strip below: "communication cost: quadratic in GPU count vs linear."',
      },
    ],
    takeaways: [
      'Contrastive training turns noisy web captions into supervision. No labels, just "these two belong together".',
      'Zero-shot means comparing embeddings to text prompts. It is a similarity ranking, not a verdict, and UX should treat it that way.',
      'Prompt template wording moves accuracy by points. Copy is a model input, not decoration.',
      'Softmax vs sigmoid loss is a distributed-systems decision, and it decided which encoder the whole ecosystem standardized on.',
    ],
    terms: [
      { term: 'Contrastive loss', gloss: '"the pull and push loss"', meaning: 'A training signal that pulls matched pairs together and pushes mismatched pairs apart in a shared vector space.' },
      { term: 'InfoNCE', gloss: '"the CLIP loss"', meaning: 'Cross-entropy computed over a batch\'s similarity matrix; each item\'s positive is its paired item, every other item in the batch is a negative.' },
      { term: 'Dual encoder', gloss: '"two towers"', meaning: 'Two separate networks, one per modality, that project into the same shared vector space.' },
      { term: 'Zero-shot', gloss: '"no-finetune classification"', meaning: 'Classifying by cosine similarity to text-prompt embeddings, with no training on the target classes at all.' },
      { term: 'Temperature', gloss: '"tau"', meaning: 'A learned scalar that scales similarity scores before the loss, controlling how sharp or soft the resulting distribution is.' },
      { term: 'Linear probe', gloss: '"frozen features plus one layer"', meaning: 'A single trained classification layer on top of otherwise frozen features; the cheap upgrade over zero-shot.' },
      { term: 'Sigmoid loss', gloss: '"SigLIP loss"', meaning: 'A per-pair binary classification loss that needs no global gather, which is why it scales past softmax.' },
      { term: 'Prompt template', gloss: '"a photo of a..."', meaning: 'The text scaffold wrapped around a class name before embedding; its wording measurably shifts zero-shot accuracy.' },
      { term: 'NaFlex', gloss: '"native flexible resolution"', meaning: 'SigLIP 2\'s ability to ingest any aspect ratio and resolution in one model, without resizing to a fixed square.' },
      { term: 'Hard negative', gloss: '"a tough distractor"', meaning: 'A negative example similar enough to the true match that the model has to work to tell them apart.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Given a batch of 4 image-caption pairs, construct the 4x4 similarity matrix by hand and mark which cells are positives.' },
      { level: 'medium', prompt: 'Build a zero-shot classifier for cats versus dogs with two prompt templates, "a photo of a {class}" and "a picture of a {class}". Measure accuracy on 100 test images. Does averaging both templates beat either one alone?' },
      { level: 'medium', prompt: 'Read section 3 of the SigLIP paper (arXiv:2303.15343) on the bias term `b`. Explain in two sentences what role it plays when negatives vastly outnumber positives in a batch.' },
      { level: 'hard', prompt: 'Compute the communication cost of softmax InfoNCE versus sigmoid pairwise loss for a 512-GPU run at batch size 32,000. Which one scales with the square of GPU count, and which scales linearly?' },
      { level: 'design', prompt: 'Design the confidence treatment for a "search my photos" feature built on CLIP embeddings. The top match scores 0.31 cosine similarity and the runner-up scores 0.29. What does the UI show, and what does it never claim?' },
    ],
    furtherReading: [
      { label: 'Radford et al., Learning Transferable Visual Models From Natural Language Supervision (arXiv:2103.00020)', url: 'https://arxiv.org/abs/2103.00020', why: 'The original CLIP paper and its zero-shot results.' },
      { label: 'Zhai et al., Sigmoid Loss for Language Image Pre-Training (arXiv:2303.15343)', url: 'https://arxiv.org/abs/2303.15343', why: 'SigLIP\'s per-pair loss and why it scales past CLIP\'s softmax.' },
      { label: 'Tschannen et al., SigLIP 2 (arXiv:2502.14786)', url: 'https://arxiv.org/abs/2502.14786', why: 'The 2026 default vision tower, multilingual and native-resolution.' },
      { label: 'Jia et al., ALIGN (arXiv:2102.05918)', url: 'https://arxiv.org/abs/2102.05918', why: 'Proof that noisy web data scales to 1.8B pairs without curation.' },
      { label: 'Cherti et al., Reproducible Scaling Laws for Contrastive Language-Image Learning (arXiv:2212.07143)', url: 'https://arxiv.org/abs/2212.07143', why: 'The OpenCLIP scaling-law figures behind the data-size tradeoffs.' },
    ],
    shipIt: {
      kind: 'rubric',
      name: 'Embedding-similarity confidence rubric',
      body: '- Below 0.20 cosine similarity: treat as no match, do not surface.\n- 0.20 to 0.30: surface as a low-confidence suggestion, always show at least one alternative.\n- Runner-up within 0.03 of the top match: never present the top match as a sole answer, show both.\n- Above 0.35: safe to lead with, but still offer a correction path.\n- Never render a similarity score as a percentage of "certainty" to a user; it is a distance, not a probability.',
    },
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
      'CLIP can match images to text but cannot talk about them. BLIP-2 (Salesforce, 2023) bridged a frozen ViT-g/14 to a frozen 11B LLM with a 188M-parameter Q-Former, 2.4 percent of the total stack, and invented the adapter pattern every VLM now uses.',
    readTime: '~10 min read',
    diagram: '/lessons/p12-03-qformer-bridge.svg',
    diagramCaption:
      'The Q-Former bridge: 32 learnable queries cross-attend over frozen ViT patch tokens, then feed a frozen LLM as 32 visual tokens.',
    whyItMatters:
      'This is the anatomy of every "chat with your screenshot" feature. The bridge decides a tradeoff you feel directly in the UI: compress the image into 32 tokens (cheap, fast, more images per conversation, detail gets lost) or pass 576 patches through (sharp OCR, but the context fills fast and each image costs more). When a PM asks why the model misses small text in a screenshot, or why only a handful of images fit per chat, the answer usually lives in this compression choice, not in the model being bad.',
    learningObjectives: [
      'Explain why a trainable bottleneck between a frozen vision encoder and a frozen LLM beats retraining either one end to end.',
      'Walk through the Q-Former\'s two training stages: representation learning against text only, then generative learning with the LLM attached.',
      'Compare the Q-Former\'s compression against LLaVA\'s MLP projector and pick the right one for a token-budget-constrained product versus a document-reading product.',
      'Compute the visual-token cost per frame for a video sampled at 1 FPS under both bridge designs.',
      'Name the parameter-efficiency ratio (trained bridge vs frozen stack) that makes adapter-based VLMs cheap to build.',
    ],
    sections: [
      {
        heading: 'The problem: two frozen giants, incompatible interfaces',
        body: 'By 2023 there were excellent frozen vision encoders producing patch tokens of one dimensionality (a ViT-g/14 outputs 256 tokens at 1408 dims) and excellent frozen LLMs expecting embeddings of another (a 7B model might expect 4096 dims). Retraining either from scratch costs millions of dollars. A naive linear bridge from 1408 to 4096 works, but it dumps all 256 visual tokens into the LLM\'s context for every single image; a batch of 32 images costs 8,192 tokens on vision alone.\n\nBLIP-2 (Salesforce, 2023) asked a sharper question: can a small trainable module compress the image into far fewer tokens, say 32, well enough for captioning and question answering, while both giants stay frozen and untouched?',
      },
      {
        heading: 'The trick: learnable queries that interview the image',
        body: 'The Q-Former is a small transformer (about 12 layers, roughly 100M parameters) holding 32 learnable query vectors. These queries are model parameters, the same 32 for every image that ever passes through. Through cross-attention they interrogate the frozen encoder\'s patch tokens, and each query comes away holding a compressed slice of what the image contains.\n\nThe output is a fixed 32-token visual summary regardless of input resolution. Project those 32 vectors into the LLM\'s embedding space, prepend them to the text prompt, and the frozen LLM reasons about the image as if the tokens were words it had read, because to the LLM\'s attention layers, that is exactly what they are.',
      },
      {
        heading: 'Two-stage training without touching the towers',
        body: 'Stage one trains the Q-Former alone, with the ViT frozen and no LLM involved, on three losses at once: image-text contrastive (CLIP-style matching), image-text matching (a binary classifier on hard-negative pairs), and image-grounded text generation (a captioning loss). Together they force the 32 queries to encode content that language can actually express, not just visual features that happen to cluster.\n\nStage two attaches the frozen LLM. A small linear layer projects the 32 query outputs into the LLM\'s embedding dimension, and only that projection plus the Q-Former train, tuned end to end on a language-modeling loss over the concatenated image-and-text prompt.\n\nTotal trained parameters: 188M, about 2.4 percent of the full stack. It matched a model 50 times larger on zero-shot visual question answering.',
      },
      {
        heading: 'Instruction-aware queries and projector-only shortcuts',
        body: 'InstructBLIP (2023) gave the Q-Former a second input at cross-attention time: the instruction text itself, alongside the image patches. The 32 queries can now specialize per instruction, "count the cars" pulls different information than "describe the mood", instead of learning one fixed summary for every task. Benchmark gains showed up specifically on instructions the model had never seen during training.\n\nMiniGPT-4 (2023) took the opposite shortcut: keep BLIP-2\'s pretrained Q-Former exactly as is and train only the output linear projection. Cheap to iterate, but the queries were tuned for someone else\'s objective, not the new product\'s, and quality reflected that.',
      },
      {
        heading: 'The rival: LLaVA\'s "just use an MLP"',
        body: 'Months later LLaVA (2023) replaced the whole Q-Former with a two-layer MLP that projects every patch token straight into the LLM: 576 tokens per image for a 24x24 grid, no compression at all. At the time this read as a step backward. By late 2023, with strong visual instruction data (LLaVA-Instruct-150k), it was dominant: the simple projector preserved more per-token detail and scaled naturally to multiple images and video frames without redesigning the bridge.\n\nBy 2026 the field split along one line. Compressive bridges, the Q-Former family and perceiver resamplers, win where token budget is the hard constraint, like long video. Pass-through projectors win where per-token quality matters most, like reading a dense document.',
      },
      {
        heading: 'Flamingo\'s gated cross-attention: the ancestor',
        body: 'Flamingo (DeepMind, 2022) predated BLIP-2 with the same learnable-query idea, a perceiver resampler, but applied gated cross-attention at every layer of the frozen LLM rather than as one bridge at the input. BLIP-2\'s contribution was showing you can compress at the input only and still get strong results, which is far cheaper to train and to serve.\n\n| Bridge | Where it attaches | Tokens per image | Example |\n|---|---|---|---|\n| Perceiver resampler | Every LLM layer | Fixed, small | Flamingo |\n| Q-Former | Input only | 32 | BLIP-2, InstructBLIP |\n| MLP projector | Input only | ~576 | LLaVA, LLaVA-OneVision |\n\nGemini and Idefics combine ideas: interleaved input tokens plus optional gated cross-attention for in-context few-shot examples.',
      },
      {
        heading: 'The pattern to remember',
        body: 'BLIP-2\'s durable contribution is not the specific module, it is the adapter pattern: keep the expensive pretrained parts frozen, train a thin interface between them. The same economics now drive LoRA finetuning, tool adapters, and most practical multimodal engineering in 2026. When a small team ships a capable multimodal product on a modest budget, an adapter between two frozen giants is usually how.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p12-03-inline-two-stage.svg',
        alt: 'BLIP-2 two-stage training',
        caption: 'Stage one trains the Q-Former alone against text. Stage two attaches the frozen LLM and tunes only the bridge.',
        diagramBrief: 'Two-panel horizontal diagram, cream paper background (#faf6ef), black ink, blue accent. Panel 1 "Stage 1: representation": a frozen ViT icon (locked padlock) feeding patch tokens into a Q-Former box (32 dots inside), three small loss labels beneath it: ITC, ITM, ITG, no LLM present. Panel 2 "Stage 2: generative": the same Q-Former box now with an arrow through a small "linear proj" box into a frozen LLM icon (locked padlock, larger), text prompt tokens flowing in alongside. Accent color highlights only the components that train: the Q-Former and the projection box.',
      },
      {
        src: '/lessons/p12-03-inline-bridge-compare.svg',
        alt: 'Q-Former, perceiver resampler, and MLP projector compared',
        caption: 'Three bridge designs, three token budgets: 32 for Q-Former, fixed and small for a perceiver resampler, roughly 576 for an MLP projector.',
        diagramBrief: 'A three-column comparison chart, cream paper background, black ink, one accent color. Each column shows a small architecture icon and a stacked bar representing token count per image: Q-Former column with a short bar (32), perceiver resampler column with a similarly short bar attached at multiple LLM-layer icons, MLP projector column with a tall bar (576). Row of labels beneath: model examples (BLIP-2/InstructBLIP, Flamingo, LLaVA family). Bottom caption: "shorter bar, cheaper context, more compression; taller bar, more raw detail."',
      },
    ],
    takeaways: [
      'Frozen encoder + frozen LLM + small trainable bridge = multimodal capability at 2 to 3 percent of the training cost.',
      'Compression vs pass-through is THE bridge decision: token budget against detail fidelity. Products inherit it as image limits and OCR quality.',
      'Learnable queries are a general compression idea: a fixed set of slots that attend over variable-size input.',
      'The adapter pattern (train thin interfaces, freeze the giants) is the economic engine of applied AI.',
    ],
    terms: [
      { term: 'Q-Former', gloss: '"querying transformer"', meaning: 'A small transformer whose 32 learnable query vectors cross-attend to a frozen ViT\'s patch tokens and compress them into a fixed summary.' },
      { term: 'Learnable query', gloss: '"a soft prompt for vision"', meaning: 'A trained parameter vector that extracts information from another modality through cross-attention, shared across every input.' },
      { term: 'Cross-attention', gloss: '"query from here, key and value from there"', meaning: 'Attention where the query comes from one stream and the key and value come from another, the mechanism that lets queries pull from image patches.' },
      { term: 'ITC', gloss: '"image-text contrastive"', meaning: 'A CLIP-style loss applied to the Q-Former\'s pooled query output against the text encoder\'s output.' },
      { term: 'ITM', gloss: '"image-text matching"', meaning: 'A binary classifier trained on hard-negative-mined pairs that forces the queries to catch fine-grained mismatches.' },
      { term: 'ITG', gloss: '"image-grounded text generation"', meaning: 'A causal language-modeling loss where text is generated conditioned on the queries, forcing them to encode content language can express.' },
      { term: 'Adapter', gloss: '"a bridge module"', meaning: 'A small trained component connecting two frozen pretrained models, the pattern BLIP-2 popularized beyond vision-language work.' },
      { term: 'MLP projector', gloss: '"the simple bridge"', meaning: 'LLaVA\'s alternative: a two-layer network that projects every patch token into LLM space with no compression.' },
      { term: 'Perceiver resampler', gloss: '"Flamingo\'s version"', meaning: 'A learnable-query cross-attention module applied at every frozen LLM layer rather than as a single input-side bridge.' },
      { term: 'Frozen backbone', gloss: '"do not finetune"', meaning: 'A pretrained model whose weights stay fixed during training; only the adapter between two frozen backbones updates.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'BLIP-2 uses 32 learnable queries against 256 patch tokens. What shape is the resulting cross-attention weight matrix, and what should each row sum to after softmax?' },
      { level: 'medium', prompt: 'Write the forward signature, in pseudocode, for each of the three stage-one losses (ITC, ITM, ITG). Which one requires the text-encoder path to stay active?' },
      { level: 'medium', prompt: 'Compare parameter counts: a Q-Former (12 layers, 768 hidden) versus a 2-layer MLP projector (1408 to 4096 dims). At roughly what LLM scale does the larger Q-Former investment pay back in training efficiency?' },
      { level: 'hard', prompt: 'A 10-minute video sampled at 1 FPS gives 600 frames. Compute the total visual-token cost under a Q-Former bridge (32 tokens per frame) versus an MLP projector (576 tokens per frame). Which one fits inside a 128k-token context window, and by how much room?' },
      { level: 'design', prompt: 'Two products ship the same underlying LLM: one uses a compressive Q-Former bridge, one uses a pass-through MLP projector. Write the one-line copy each product should show next to its image-upload limit, so a non-technical user understands why the limits differ.' },
    ],
    furtherReading: [
      { label: 'Li et al., BLIP-2 (arXiv:2301.12597)', url: 'https://arxiv.org/abs/2301.12597', why: 'The core paper; section 3.2 covers Q-Former initialization from BERT-base.' },
      { label: 'Li et al., BLIP (arXiv:2201.12086)', url: 'https://arxiv.org/abs/2201.12086', why: 'The predecessor that introduced the ITC, ITM, ITG loss trio.' },
      { label: 'Li et al., ALBEF (arXiv:2107.07651)', url: 'https://arxiv.org/abs/2107.07651', why: '"Align before fuse", the conceptual ancestor of BLIP-2\'s stage-one training.' },
      { label: 'Dai et al., InstructBLIP (arXiv:2305.06500)', url: 'https://arxiv.org/abs/2305.06500', why: 'The instruction-aware Q-Former and its gains on held-out tasks.' },
      { label: 'Zhu et al., MiniGPT-4 (arXiv:2304.10592)', url: 'https://arxiv.org/abs/2304.10592', why: 'The projector-only shortcut that reuses BLIP-2\'s Q-Former and trains just the final layer.' },
      { label: 'Jaegle et al., Perceiver IO (arXiv:2107.14795)', url: 'https://arxiv.org/abs/2107.14795', why: 'The general architecture behind learnable-query cross-attention.' },
    ],
    shipIt: {
      kind: 'snippet',
      name: 'Bridge-choice decision snippet',
      body: '// Pick a modality bridge by token budget vs quality-per-token\nif (tokenBudgetIsTight || manyImagesPerConversation || isLongVideo) {\n  bridge = "Q-Former or perceiver resampler"; // ~32 tokens/image, compressive\n} else if (perTokenQualityMatters || isDenseDocumentOrOCR) {\n  bridge = "MLP projector"; // ~576 tokens/image, pass-through\n} else {\n  bridge = "start with MLP projector, measure context pressure, downgrade to Q-Former if it fills";\n}',
    },
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
