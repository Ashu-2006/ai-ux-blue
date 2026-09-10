import type { Lesson } from '@/lib/lessons';

// Phase 12 · Part 3 · Unified any-to-any models (lessons 12.11-12.16)
export const phase12Part3: Lesson[] = [
  {
    id: 'p12-11-chameleon',
    phase: 'Phase 12 · Multimodal AI',
    part: 'Part 3 · Unified any-to-any models',
    index: '12.11',
    title: 'Chameleon: images join the vocabulary',
    oneLiner:
      'Adapter VLMs read images but only answer in text. Chameleon converts images into discrete tokens from the same vocabulary as words, so one decoder emits text and images interleaved in a single pass.',
    readTime: '~10 min read',
    diagram: '/lessons/p12-11.svg',
    diagramCaption:
      'Early fusion: a VQ-VAE maps the image to 1024 codebook indices that sit in the same token vocabulary as text, one sequence, one loss.',
    whyItMatters:
      'Whether a product can generate images inline, mid-answer, in whatever order the model chooses, is decided at the architecture layer, not the UI layer. Adapter VLMs are structurally text-out, so "illustrate this" on top of one means orchestrating a second model and designing the seams yourself. Early-fusion models emit mixed output natively, which is what makes an interleaved canvas or article-writing surface possible without stitching. The cost you inherit is the tokenizer ceiling: image quality caps at whatever the codebook can reconstruct, and it shows up as generations that are slightly soft, slightly wrong in the details.',
    learningObjectives: [
      'Compute the image-token count and combined vocabulary size for a Chameleon-style VQ-VAE at a given codebook size and image resolution.',
      'Explain why adapter VLMs like LLaVA and BLIP-2 can consume images but structurally cannot emit them.',
      'Name Chameleon\'s three training-stability fixes (QK-Norm, dropout placement, extra LayerNorm) and the failure each one prevents.',
      'Compare early fusion (Chameleon) to late fusion (BLIP-2, LLaVA) on cost, output modality, and quality ceiling.',
      'Trace how a tokenizer\'s reconstruction PSNR bounds a product\'s generated-image quality before the transformer ever runs.',
    ],
    sections: [
      {
        heading: 'The problem: two input paths, one output modality',
        body: 'Every adapter VLM (BLIP-2, LLaVA, Qwen-VL) keeps text and images on separate rails. Text goes through the embedding table; images go through a vision encoder and a projector, merging partway in. Three consequences follow.\n\nThe model can consume images but never emit them: output is text only. Interleaved documents (an article alternating paragraphs and figures) are awkward to model. And visual tokens live in a different region of the hidden space than text tokens, a standing distributional mismatch. Chameleon (Meta, 2024) rejected the premise: make images literally the same kind of thing as words.',
      },
      {
        heading: 'The move: a VQ-VAE turns pixels into vocabulary entries',
        body: 'The tokenizer is a vector-quantized autoencoder. A CNN-plus-ViT encoder maps the image to a 32x32 grid of feature vectors, dimension 256; each vector snaps to its nearest neighbor (by L2 distance) in a learned codebook of 8192 entries, also dimension 256; the integer index replaces the vector. A CNN decoder learns to turn indices back into pixels, trained on reconstruction loss plus a commitment loss that keeps the encoder\'s output close to its assigned code.\n\nOne 512x512 image becomes 1024 integers. Concatenate that alphabet with the text BPE vocabulary (roughly 32k entries) plus <image> and </image> separators and you get one shared vocabulary of about 40k tokens.',
      },
      {
        heading: 'What the shared vocabulary buys: mixed-modality output',
        body: 'Inference is plain next-token prediction. Prompt "draw a cat and describe it" and the model may emit <image>, then 1024 codebook indices the decoder renders to pixels, then flowing text about the cat. It picks the order itself: image first, text first, or interleaved.\n\nNothing outside the model stitches this together. The same softmax that chooses the next word chooses the next patch of an image. That is the early-fusion thesis: generation across modalities is not a feature you bolt on, it is what falls out when everything shares one token space.',
      },
      {
        heading: 'Training stability: three fixes for a model that would not converge',
        body: 'Early fusion is unstable at scale. Gradients from image tokens can dominate, and Chameleon\'s 34B run diverged repeatedly until three fixes landed: QK-Norm (LayerNorm on queries and keys before their dot product, taming logit blowup at depth), dropout after every residual add rather than only after attention and MLP blocks, and an extra norm on the final block\'s skip connection to stabilize late-layer gradient flow.\n\nWithout these three changes, the paper reports training diverging at multiple checkpoints. With them, it converges. The training recipe is as much of the contribution as the architecture itself.',
      },
      {
        heading: 'The price: a lossy tokenizer ceiling',
        body: 'The tokenizer is lossy by construction. At 8192 codes and 1024 tokens per image, reconstruction caps around 26 to 28 dB PSNR, visibly below continuous-space diffusion (Stable Diffusion 3 clears 32 dB). Every generated image inherits that ceiling before the transformer even runs.\n\nBetter tokenizers lift it: MAGVIT-v2, IBQ, and the SBER-MoVQGAN family all push reconstruction higher. Emu3 (lesson 12.12) reaches SDXL-competitive image quality using this exact early-fusion recipe, just with a much better tokenizer. The architecture was never the bottleneck; the codebook was.',
      },
      {
        heading: 'Cousins: Fuyu skips the tokenizer, AnyGPT adds two more modalities',
        body: 'Fuyu (Adept, 2023) took the opposite simplification: skip the separate vision encoder and VQ-VAE entirely, feed raw image patches straight into the LLM\'s input projection as if they were tokens. Simpler than Chameleon, but understanding-only: there is no shared output vocabulary, so Fuyu cannot generate images.\n\nAnyGPT (Zhan et al., 2024) went the other direction, extending Chameleon\'s VQ trick to four modalities: text, image, speech, and music, each with its own tokenizer feeding one shared transformer. That is the direct ancestor of MIO (lesson 12.16), the any-to-any model this part ends on.',
      },
      {
        heading: 'When to pick which family',
        body: 'Early fusion (Chameleon, and extensions like AnyGPT): one loss, one decoder, native mixed output, tokenizer-capped image quality, and a VQ decoder on the inference path for every generated image.\n\nAdapter VLMs (BLIP-2, LLaVA): vision in, text out only, but they reuse a pretrained LLM wholesale and skip the tokenizer bottleneck entirely for understanding. The rule of thumb holds in 2026: if the product needs image output, you are in the Chameleon family tree. If it only needs to understand images, an adapter model is simpler and recycles more pretrained compute.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p12-11-inline-vqvae.svg',
        alt: 'VQ-VAE pixel-to-token pipeline',
        caption: 'A 512x512 image becomes a 32x32 grid of features, each snapped to one of 8192 codebook entries: 1024 integers total.',
        diagramBrief: 'Left to right flow diagram on cream paper (#faf6ef), black ink, one blue accent color on the codebook. Panel 1: a 512x512 image icon labeled "512x512 input". Arrow to Panel 2: a 32x32 grid of small dots labeled "encoder: 32x32 feature grid, dim 256". Arrow to Panel 3: a vertical column of 8192 small squares labeled "codebook, K=8192", with one square highlighted in the accent color and a dashed line from a feature dot to that square showing "nearest neighbor lookup". Arrow to Panel 4: a horizontal row of 1024 small numbered boxes labeled "1024 integer tokens". Below the whole flow, a caption bar: "512x512 -> 1024 tokens, same vocabulary as text".',
      },
      {
        src: '/lessons/p12-11-inline-vocab.svg',
        alt: 'Shared vocabulary layout',
        caption: 'Text BPE, image codes, and separators share one integer ID space; the output softmax is one head over all of it.',
        diagramBrief: 'A single horizontal bar on cream paper divided into three labeled segments proportional to size: segment 1 "text BPE, 0-31999" (widest), segment 2 "image codes, 32000-40191", segment 3 small "separators <image> </image>". Below the bar, one arrow pointing up into a single box labeled "one embedding table, one output softmax". Monochrome ink, one accent color highlighting the separators segment.',
      },
    ],
    takeaways: [
      'Adapter VLMs are structurally text-out. Inline image generation requires the image to be in the output vocabulary, not just the input path.',
      'A VQ-VAE is a tokenizer for pixels: 512x512 becomes 1024 integers from an 8192-entry codebook, predictable like words.',
      'The tokenizer sets the quality ceiling (26-28 dB PSNR vs 32+ for diffusion). Soft, detail-poor generations trace back to the codebook, not the transformer.',
      'One shared vocabulary means the model chooses the output order itself. Design interleaved surfaces around that autonomy, not around fixed slots.',
    ],
    terms: [
      { term: 'Early fusion', gloss: '"unified tokens"', meaning: 'Converting images to discrete tokens that share the transformer\'s vocabulary from the first layer on.' },
      { term: 'VQ-VAE', gloss: '"the image tokenizer"', meaning: 'An encoder-codebook-decoder network whose bottleneck snaps continuous features to a learned set of vectors, turning images into integer indices.' },
      { term: 'Codebook', gloss: '"the vocabulary of image codes"', meaning: 'The learned set of K vectors an image feature can quantize to; size trades compression against fidelity.' },
      { term: 'Shared vocabulary', gloss: '"one dictionary"', meaning: 'One token ID space covering text, image codes, and modality separators, with a single embedding table and output head.' },
      { term: 'QK-Norm', gloss: '"an attention stabilizer"', meaning: 'LayerNorm applied to query and key projections before their dot product, preventing attention logit blowup at depth.' },
      { term: 'Tokenizer ceiling', gloss: '"the reconstruction limit"', meaning: 'The best PSNR the VQ decoder can achieve; the hard upper bound on generated image quality.' },
      { term: 'Commitment loss', gloss: '"part of VQ-VAE training"', meaning: 'The term that pulls encoder outputs toward their assigned codebook vector, so the lookup stays stable during training.' },
      { term: 'Modality separator', gloss: '"the image tags"', meaning: 'Special tokens like <image> and </image> that mark where a run of image codes begins and ends in the sequence.' },
      { term: 'PSNR', gloss: '"image quality score"', meaning: 'Peak signal-to-noise ratio; a decibel measure of reconstruction fidelity, higher is closer to the original pixels.' },
      { term: 'Fuyu-style patching', gloss: '"no tokenizer"', meaning: 'Feeding raw image patches directly into the LLM\'s input projection, skipping a separate vision encoder and codebook entirely.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A 512x512 image at Chameleon\'s codebook (K=8192, 32x32 feature grid) becomes how many image tokens? What is the combined vocabulary size once you add a 32k-token text BPE vocabulary and 2 separators?' },
      { level: 'medium', prompt: 'A 4K image (3840x2160) tokenized at the same density as Chameleon\'s 512x512 case would produce roughly how many tokens? Name the first thing that breaks: context length, tokenizer quality, or KV cache.' },
      { level: 'medium', prompt: 'Estimate the compression ratio of Chameleon\'s VQ-VAE: 1024 tokens (13 bits each at K=8192) versus a raw 512x512 24-bit RGB image. Is that lossy, and by how much does it show?' },
      { level: 'design', prompt: 'A team wants a chat product to "draw inline while it explains." Spec the model requirement in one paragraph: what architecture family this needs, what quality tradeoff you are accepting, and one microcopy line that sets user expectations for image fidelity.' },
    ],
    furtherReading: [
      { label: 'Chameleon Team - Chameleon: Mixed-Modal Early-Fusion Foundation Models (arXiv:2405.09818)', url: 'https://arxiv.org/abs/2405.09818', why: 'The primary paper; Section 2.3 covers the training-stability fixes in full.' },
      { label: 'Zhan et al. - AnyGPT (arXiv:2402.12226)', url: 'https://arxiv.org/abs/2402.12226', why: 'Shows the same VQ trick extended to speech and music, the direct ancestor of MIO (lesson 12.16).' },
      { label: 'Adept - Fuyu-8B blog', url: 'https://www.adept.ai/blog/fuyu-8b', why: 'The no-tokenizer alternative: raw patches straight into the LLM, a useful contrast for what early fusion is buying you.' },
      { label: 'Aghajanyan et al. - CM3 (arXiv:2201.07520)', url: 'https://arxiv.org/abs/2201.07520', why: 'An earlier interleaved-document pretraining approach that Chameleon\'s thesis builds on.' },
      { label: 'Yu et al. - CM3Leon (arXiv:2309.02591)', url: 'https://arxiv.org/abs/2309.02591', why: 'The autoregressive text-to-image model that bridges CM3 and Chameleon.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Tokenizer-vs-adapter picker',
      body: '- Does the product need to generate images, or only understand them?\n- If generation: what tokenizer or codebook size backs the model, and what PSNR does it reconstruct at?\n- If understanding only: is a full VQ-VAE pipeline overkill? A late-fusion adapter model is simpler and cheaper.\n- What does "soft" or "slightly wrong" output trace back to: the transformer, or the tokenizer ceiling?\n- Does the UI need interleaved text and image output in one response, or are separate calls acceptable?\n- What is the fallback microcopy when the model can only describe, not draw?',
    },
    demoCaption:
      'Same prompt, two architectures. The adapter VLM can only describe; the early-fusion model emits image tokens and text in one pass, in the order it chooses.',
    demo: {
      archetype: 'toggle-fix',
      badLabel: 'Adapter VLM',
      goodLabel: 'Early fusion',
      subject: 'Prompt: "draw a cat and describe it"',
      badLines: [
        'embed(text) + vision_encoder(image) -> two input paths',
        'output head: text vocabulary only',
        '"I cannot generate images, but here is a description..."',
        'image output = a second model + orchestration glue',
      ],
      goodLines: [
        'one vocabulary: 32k text + 8192 image codes + separators',
        '<image> 4821 1029 2891 ... (1024 tokens) </image>',
        '"The cat is orange, sitting on a windowsill..."',
        'one decoder, one loss, model picks the order',
      ],
      badCaption:
        'The misreading: "the model understands images, so it can make them." Adapter VLMs merge vision in partway; the output head only knows text.',
      goodCaption:
        'The mechanism: images become vocabulary entries via a VQ codebook, so the same next-token softmax that writes words can paint patches. Mixed output is free; quality is capped by the tokenizer.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'most vision models can read images but never draw one. the fix was making pixels part of the vocabulary.',
        body:
          'most vision models can read images but never draw one. the fix was making pixels part of the vocabulary.\n\nchameleon: a VQ codebook turns a 512x512 image into 1024 integers. bolt those onto the text vocab and one decoder predicts words and image patches with the same softmax.\n\ntext out, image out, interleaved. one loss.',
      },
      {
        kind: 'X · design angle',
        hook: 'if your product generates images "inline", check whether the model does or the pipeline does.',
        body:
          'if your product generates images "inline", check whether the model does or the pipeline does.\n\nadapter VLMs are text-out by construction, so inline illustration means a second model and orchestration seams your UX has to hide.\n\nearly-fusion models emit image tokens mid-answer, natively. the interleaved canvas you want to design starts as an architecture decision.',
      },
      {
        kind: 'X · one-liner',
        hook: 'a generated image that looks slightly soft is usually not the model. it is the codebook.',
        body:
          'a generated image that looks slightly soft is usually not the model. it is the codebook.\n\nearly-fusion models squeeze every image through 8192 learned codes. reconstruction caps around 27 dB while diffusion clears 32. the tokenizer is the quality ceiling, and it was set before inference began.',
      },
    ],
    source: {
      label: 'Full lesson: 11 chameleon-early-fusion-tokens',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/12-multimodal-ai/11-chameleon-early-fusion-tokens',
    },
  },
  {
    id: 'p12-12-emu3',
    phase: 'Phase 12 · Multimodal AI',
    part: 'Part 3 · Unified any-to-any models',
    index: '12.12',
    title: 'Emu3: next-token prediction beats diffusion',
    oneLiner:
      'Emu3 trained one Llama-style decoder with nothing but next-token prediction across text, image, and video tokens, and beat SDXL on image generation anyway. A better tokenizer plus scale was the whole trick.',
    readTime: '~10 min read',
    diagram: '/lessons/p12-12.svg',
    diagramCaption:
      'One decoder, one loss: text, 2D image tokens, and 3D video tokens drawn from a unified vocabulary, all trained with next-token prediction.',
    whyItMatters:
      'Emu3 settles a question that shapes roadmaps: do you need a separate diffusion stack to ship image generation, or can the language model you already run do it? If next-token prediction matches diffusion, one backbone serves chat, perception, image gen, and video gen, collapsing infra, prompt logic, and safety review into one surface. The tradeoff lands in UX as latency: autoregressive image generation emits thousands of tokens sequentially, about two minutes per 512x512 image at 30 tokens per second, versus seconds for diffusion. That gap is a loading-state brief before it is a research question.',
    learningObjectives: [
      'Explain why next-token prediction reached diffusion-level image quality once the visual tokenizer improved, without changing the training objective.',
      'Compute image and video token counts for a given resolution, patch reduction, and codebook size.',
      'Name the three products (Emu3-Gen, Emu3-Chat, Emu3-Stage2) that ship from one checkpoint and what differs between them.',
      'Compare Emu3 against SDXL and LLaVA-1.6 on the specific benchmarks each family wins.',
      'Estimate autoregressive image-generation latency at a target resolution and budget a loading state for it.',
    ],
    sections: [
      {
        heading: 'The problem: everyone believed image generation needs diffusion',
        body: 'Through 2024 the conventional wisdom held that discrete image tokens lose too much detail and autoregressive sampling accumulates error over thousands of steps. Stable Diffusion, DALL-E 3, Imagen, and Midjourney all ran diffusion. Chameleon proved early fusion works but did not match SDXL on quality, which read as confirmation.\n\nEmu3 (BAAI, 2024, later published in Nature) attacked the belief directly: a better visual tokenizer, enough scale, and the plain next-token loss should produce diffusion-beating generation inside the same model that also does perception.',
      },
      {
        heading: 'The key ingredient: a much better tokenizer',
        body: 'Emu3 trained a custom IBQ-class tokenizer (the SBER-MoVQGAN family) with an 8x reduction per axis: a 512x512 image becomes a 64x64 grid, 4096 tokens, from a 32768-entry codebook. More tokens than Chameleon\'s 1024 and a 4x larger codebook.\n\nThe metric that matters: reconstruction PSNR of 30.5 dB, nearly closing the gap to Stable Diffusion\'s continuous latent space at 32 dB. For video, a 3D tokenizer quantizes 4x4x4 pixel cubes across space and time; a 4-second 256x256 clip at 8 FPS becomes 32,768 tokens. The lesson\'s blunt summary: Emu3\'s contribution is partly "we trained a very good tokenizer."',
      },
      {
        heading: 'One loss, three products',
        body: 'Training mixes captioned image generation, image question answering, video generation, video QA, and plain text, all formatted as sequences with modality tags, all optimized with next-token prediction. The model learns from the data distribution when to emit image tokens versus words.\n\nThe same checkpoint ships as three APIs: Emu3-Gen (text in, image tokens out), Emu3-Chat (image tokens in, text out), and Emu3-Stage2 (video in or out). No task-specific heads, just different prompt templates. That is the unified-model promise in its purest form: capability routing by prompt, not by architecture.',
      },
      {
        heading: 'Compute cost: what a 7B model on 300B tokens actually costs',
        body: 'Emu3 trained a 7B-parameter model on roughly 300 billion multimodal tokens, GPU-hours in the same ballpark as Llama-2-7B pretraining, on the order of 2,000 to 4,000 GPU-years on A100-class silicon. Stable Diffusion 3 trains in a similar compute budget but needs a separate text encoder, a separate VAE, and a diffusion scheduler on top.\n\nThe unified approach does not train cheaper; it trains simpler. One tokenizer per modality, one transformer, one loss function to debug, instead of three coupled components each with their own failure modes and their own hyperparameter search.',
      },
      {
        heading: 'The numbers, and the trick borrowed back from diffusion',
        body: 'Emu3 beat SDXL on MJHQ-30K FID (5.4 vs 5.6), tied it on GenEval (0.54 vs 0.55), and beat LLaVA-1.6 on VQAv2 (75.1 vs 72.4). Not a sweep, but "next-token prediction is all you need" became defensible across modalities.\n\nOne inference trick does heavy lifting: classifier-free guidance, imported from diffusion. Generate the logits twice, once with the caption and once without, and mix them with a guidance weight (3.0 to 7.0 typical). Temperature is tuned per role: 1.0 for perception, 0.8 for generation. Quality lives in the sampler as much as the weights.',
      },
      {
        heading: 'The standing cost: sequential tokens are slow',
        body: 'A 4096-token image at 30 tokens per second is about two minutes per 512x512 image; SDXL does it in 2 to 5 seconds. Speculative decoding and KV-cache work narrow the gap without closing it. Autoregressive image generation trades inference speed for architectural unity, and that trade is the durable one to remember.\n\nDouble the resolution and the token count roughly quadruples, since tokens scale with (height/8) x (width/8). A 1024px image costs about 16,384 tokens and nine minutes at the same throughput; a 2048px image costs about 65,536 tokens. The wait grows quadratically with resolution, not linearly.',
      },
      {
        heading: 'Where the bet led: Show-o, Janus-Pro, and a geographic pattern',
        body: 'Conceptually the bet paid off: two years on, the open unified-generation family (Emu3, Show-o, Janus-Pro, Transfusion) is the default research path, and production frontier models appear to run some variant. Show-o (lesson 12.14) keeps discrete tokens but generates them in parallel instead of sequentially; Janus-Pro (lesson 12.15) decouples the understanding and generation encoders entirely.\n\nOne pattern worth naming: Chinese labs (BAAI, DeepSeek) published more aggressively in this exact direction through 2025 than US labs did in the open, even as US labs shipped proprietary equivalents behind closed APIs.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p12-12-inline-tokencount.svg',
        alt: 'Image and video token counts by resolution',
        caption: 'Doubling resolution roughly quadruples token count; video adds a third axis and multiplies again.',
        diagramBrief: 'A small table rendered as a diagram on cream paper: three rows (512x512 image, 1024x1024 image, 4-second 256x256 video clip at 8fps) each showing an icon and a token count (4096, 16384, 32768) as a horizontal bar whose length scales with the count. One accent color on the video row to flag the extra temporal axis. Caption bar underneath: "tokens = (H/8) x (W/8), video adds x(frames/4)".',
      },
      {
        src: '/lessons/p12-12-inline-latency.svg',
        alt: 'Autoregressive vs diffusion generation time',
        caption: 'Emu3 at 4096 tokens and 30 tok/s takes about 2 minutes per image; SDXL takes 2 to 5 seconds.',
        diagramBrief: 'Two horizontal timeline bars stacked, cream paper background. Top bar labeled "Emu3 (autoregressive)": long bar spanning "~2 minutes", subdivided into many small tick marks representing sequential token steps. Bottom bar labeled "SDXL (diffusion)": short bar spanning "2-5 seconds", subdivided into roughly 20 denoising step blocks. One consistent accent color for both bars\' fill; the length difference should read immediately as a 20-40x gap.',
      },
    ],
    takeaways: [
      'Next-token prediction matched diffusion on image generation once the tokenizer got good enough. The objective was never the blocker.',
      'One checkpoint, three products (gen, chat, video) routed by prompt template. Unified models collapse infra and safety surface, not just research narrative.',
      'Autoregressive image gen pays in latency: ~2 minutes per image vs seconds for diffusion. Budget the waiting-state design accordingly.',
      'Classifier-free guidance and temperature are inference-time quality dials. The same weights ship very different output depending on the sampler.',
    ],
    terms: [
      { term: 'Next-token prediction', gloss: '"NTP"', meaning: 'The standard autoregressive loss, predicting token i+1 from tokens 0..i, applied identically regardless of modality once tokenized.' },
      { term: 'IBQ tokenizer', gloss: '"a very good tokenizer"', meaning: 'A VQ tokenizer class (Inverse Bottleneck Quantizer) with larger codebooks and closer-to-diffusion reconstruction quality than earlier VQ-VAEs.' },
      { term: '3D VQ', gloss: '"video tokenizer"', meaning: 'A spatiotemporal codebook where one token covers a 4x4x4 pixel-and-frame cube instead of a flat 2D patch.' },
      { term: 'Classifier-free guidance', gloss: '"CFG"', meaning: 'Generating logits twice, with and without the caption, then mixing them by a guidance weight to sharpen output quality at inference.' },
      { term: 'Unified vocabulary', gloss: '"shared tokens"', meaning: 'Text, image, and video tokens drawn from the same integer ID space; the model predicts whichever modality comes next.' },
      { term: 'MJHQ-30K', gloss: '"an image-gen benchmark"', meaning: 'A 30,000-prompt benchmark measuring FID against Midjourney-quality references; Emu3 reports beating SDXL here.' },
      { term: 'FID', gloss: '"image quality score"', meaning: 'Frechet Inception Distance; lower is better, measures how close generated images are to real ones in feature space.' },
      { term: 'GenEval', gloss: '"a compositional benchmark"', meaning: 'A benchmark scoring whether generated images correctly satisfy compositional prompts, such as counts, colors, and positions.' },
      { term: 'Temperature (sampling)', gloss: '"creativity dial"', meaning: 'A scalar that scales logits before softmax at inference; Emu3 tunes it separately per role, 1.0 for perception, 0.8 for generation.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Emu3 produces 4096 tokens for a 512x512 image. How many tokens for 1024x1024 at the same 8x reduction? For 2048x2048?' },
      { level: 'medium', prompt: 'A 4-second, 8fps, 256x256 video clip tokenizes to 32,768 tokens. At 30 tokens per second, how long does generating that clip take, and how does that compare to the image case?' },
      { level: 'medium', prompt: 'Emu3 beats SDXL on FID (5.4 vs 5.6) but only ties on GenEval (0.54 vs 0.55). What does that split tell you about what "beats diffusion" means in practice, versus a single headline claim?' },
      { level: 'design', prompt: 'You are speccing a product feature: "generate a 1024px hero image while the user waits." Given Emu3-class latency (~9 minutes at 1024px) versus SDXL (~5 seconds), write the one-sentence product decision and the loading-state copy for whichever model you would actually ship.' },
    ],
    furtherReading: [
      { label: 'Wang et al. - Emu3: Next-Token Prediction is All You Need (arXiv:2409.18869)', url: 'https://arxiv.org/abs/2409.18869', why: 'The primary paper; Section 3.3 covers the video tokenizer\'s 4x4x4 patch shape.' },
      { label: 'Yu et al. - MAGVIT-v2 (arXiv:2310.05737)', url: 'https://arxiv.org/abs/2310.05737', why: 'The tokenizer lineage Emu3\'s IBQ class descends from.' },
      { label: 'Tian et al. - VAR (arXiv:2404.02905)', url: 'https://arxiv.org/abs/2404.02905', why: 'A different autoregressive image-generation formulation, a useful contrast to Emu3\'s flat token sequence.' },
      { label: 'Sun et al. - Emu: Generative Pretraining in Multimodality (arXiv:2307.05222)', url: 'https://arxiv.org/abs/2307.05222', why: 'The predecessor this lesson\'s namesake builds on.' },
      { label: 'Liu et al. - LWM (arXiv:2402.08268)', url: 'https://arxiv.org/abs/2402.08268', why: 'A long-context video-and-language model tackling the same unified-token problem from the context-length side.' },
    ],
    shipIt: {
      kind: 'rubric',
      name: 'Autoregressive-vs-diffusion image gen decision rubric',
      body: '- Latency budget: does the feature tolerate 1-10 minutes per image, or does it need under 10 seconds?\n- Infra count: would one unified model replace a separate diffusion stack, or do you already have one working?\n- Quality bar: check FID and GenEval both, not just one; the two benchmarks reward different strengths.\n- Loading state: if autoregressive, design the wait explicitly, do not treat it as a diffusion-shaped progress bar.\n- Fallback: what happens if the user cancels mid-generation? Sequential tokens make partial results meaningful; diffusion mid-cancel usually is not.',
    },
    demoCaption:
      'Drag the target resolution and watch the token count and generation time. Autoregressive image gen emits every token in sequence; resolution is quadratic and the wait is real.',
    demo: {
      archetype: 'slider-map',
      sliderLabel: 'Generated image resolution (512 to 2048px)',
      outputLabel: 'Image tokens to emit, and minutes at 30 tok/s',
      badCaption:
        'The misreading: "generation time scales with image size a little." Doubling resolution feels like a 2x cost.',
      goodCaption:
        'The mechanism: tokens = (H/8) x (W/8), so resolution is quadratic. 512px = 4096 tokens (~2 min at 30 tok/s); 1024px = 16,384 tokens (~9 min); 2048px = 65,536 tokens. Diffusion does 512px in seconds. This gap is your loading-state brief.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'in 2024 everyone knew image generation needs diffusion. emu3 beat SDXL with a language model loss.',
        body:
          'in 2024 everyone knew image generation needs diffusion. emu3 beat SDXL with a language model loss.\n\nthe trick was not the objective. it was the tokenizer: 4096 tokens per image from a 32k codebook, 30.5 dB reconstruction vs diffusion\'s 32.\n\nonce pixels tokenize well enough, next-token prediction just works. FID 5.4 vs SDXL\'s 5.6.',
      },
      {
        kind: 'X · design angle',
        hook: 'unified models turn a latency question into a loading-state brief.',
        body:
          'unified models turn a latency question into a loading-state brief.\n\nautoregressive image gen emits 4096 tokens in sequence: ~2 minutes per 512px image at 30 tok/s. diffusion does it in 2-5 seconds.\n\nif your product bets on one-model-does-everything, the waiting experience is the design surface that absorbs the architecture\'s cost.',
      },
      {
        kind: 'X · one-liner',
        hook: 'one checkpoint, three products. the router is the prompt template.',
        body:
          'one checkpoint, three products. the router is the prompt template.\n\nemu3-gen, emu3-chat, and emu3 video are the same weights with different prompt formats. no task heads.\n\ncapability routing moved out of the architecture and into the prompt. worth internalizing before you design a mode switcher.',
      },
    ],
    source: {
      label: 'Full lesson: 12 emu3-next-token-for-generation',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/12-multimodal-ai/12-emu3-next-token-for-generation',
    },
  },
  {
    id: 'p12-13-transfusion',
    phase: 'Phase 12 · Multimodal AI',
    part: 'Part 3 · Unified any-to-any models',
    index: '12.13',
    title: 'Transfusion: two losses, one transformer',
    oneLiner:
      'Instead of forcing images through a lossy codebook, Transfusion keeps them continuous: one transformer trains next-token prediction on text and a diffusion loss on image patches, in the same gradient step.',
    readTime: '~10 min read',
    diagram: '/lessons/p12-13.svg',
    diagramCaption:
      'One backbone, two heads: cross-entropy on text tokens, flow-matching MSE on continuous image patches, joined by a block-triangular attention mask.',
    whyItMatters:
      'This is the architecture family your image-capable assistant likely descends from: 2026 production models that emit images appear to use some Transfusion or MMDiT descendant. The design-relevant point is that "unified" does not require tokenizing everything. Keeping images continuous buys 3 to 5 FID points of visible quality over same-size discrete models, and denoising parallelizes where autoregressive tokens cannot, which is why a generated image can sharpen as a whole instead of streaming in as a token sequence. That sampling loop is the real animation curve underneath your loading state.',
    learningObjectives: [
      'Explain how a single transformer routes two different losses, cross-entropy for text and a diffusion loss for image patches, in one gradient step.',
      'Describe the block-triangular attention mask and why text needs causal attention while image patches need bidirectional attention.',
      'Compare continuous-diffusion (Transfusion, MMDiT) against discrete-token (Chameleon, Emu3) unified models on FID, training complexity, and parallelism.',
      'Name MMDiT\'s architectural difference from Transfusion and which shipping product uses it.',
      'Predict what a progressive-reveal loading animation implies about the generation architecture underneath it.',
    ],
    sections: [
      {
        heading: 'The problem: the quantization tax',
        body: 'Discrete image tokens fit a transformer\'s native vocabulary, but the VQ step throws away detail; Chameleon and Emu3 both cap image fidelity at whatever their tokenizer can reconstruct. Diffusion models keep images continuous and produce exceptional quality, but they live in a separate model from the LLM with their own noise-schedule engineering and no clean way to interleave with text generation.\n\nTransfusion (Meta, 2024) asked for both: keep images continuous, drop the VQ-VAE entirely, and still train one model, by stitching two losses into one gradient step.',
      },
      {
        heading: 'The move: pick the loss per token',
        body: 'One decoder-only transformer processes a sequence containing discrete text tokens, continuous image patches (16x16 pixel blocks linearly projected into the hidden dimension, exactly a ViT input), and <image> tags marking where patches live.\n\nThe forward pass runs once. Then the loss routes per position: text tokens get standard cross-entropy on the vocabulary head; image patches get a diffusion loss, predicting how to remove noise that was added to them. Both gradients flow through the shared body. Transfusion uses flow matching: interpolate a patch toward noise by a random amount t, and train the model to predict the velocity pointing back to clean.',
      },
      {
        heading: 'The mask: causal for text, bidirectional inside images',
        body: 'Text must be causal or teacher forcing breaks: a word cannot attend to words after it. But an image is one snapshot, not a sequence, so its patches attend to each other freely within the image block. Text attends to images before it; image patches attend to text before them.\n\nThe result is a block-triangular attention mask: triangular across the document, solid blocks wherever an image sits. It is the one essential detail of the whole design, the one matrix that lets a causal language model host a bidirectional diffusion model without either corrupting the other.',
      },
      {
        heading: 'Flow matching in practice: three steps from noise to prediction',
        body: 'For each image patch x0, training samples a random timestep t and noise epsilon, then interpolates xt = (1-t) * x0 + t * epsilon, a straight line from clean data to pure noise. The transformer predicts the velocity v_theta(xt, t), and the loss is the mean-squared error between that prediction and the true velocity (epsilon - x0).\n\nAt inference, generation starts from pure noise and walks backward along the predicted velocity field over 10 to 30 steps, each one a full transformer forward pass over the whole patch grid at once. No patch waits for another to finish.',
      },
      {
        heading: 'The sibling: MMDiT and Stable Diffusion 3',
        body: 'Stable Diffusion 3 shipped MMDiT (Multimodal Diffusion Transformer) the same year, and the architectures are siblings. MMDiT gives each block separate Q, K, V, and MLP weights for text versus image, sharing only the joint attention; it trains with rectified flow, a flow-matching variant with simpler math and fewer sampling steps than DDPM.\n\nBoth converge on the same core idea: one transformer runs next-token prediction on text and diffusion on continuous image representations. Transfusion scaled to 7B parameters; MMDiT backs SD3 at 2B and 8B.',
      },
      {
        heading: 'The scorecard against discrete',
        body: 'At 7B parameters, Transfusion beats a same-size Chameleon-style model by 3 to 5 FID points. No tokenizer needs training: the image path in is a linear projection. And inference can denoise all patches of an image in parallel over 10 to 30 steps, where autoregressive tokens are strictly sequential.\n\nThe cost is training complexity: two losses on different numerical scales need weight tuning, and a schedule mismatch can let one head dominate. Downstream, Janus-Pro decouples the encoders per task and Show-o swaps continuous diffusion for masked discrete diffusion; the family branches fast from here.',
      },
      {
        heading: 'Training complexity is the real price',
        body: 'Transfusion trains on roughly 70 percent text tokens and 30 percent image patches by count, and the image diffusion loss runs at about 10x the magnitude of the text cross-entropy loss on a raw scale. Left unweighted, the image objective would dominate every gradient step and text quality would suffer.\n\nThe fix is a manually tuned loss-weighting term, retuned whenever the data mix or model size changes. That tuning search, not the architecture, is the standing engineering tax for skipping the tokenizer. It is a smaller cost than a quantization ceiling, but it is not free.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p12-13-inline-mask.svg',
        alt: 'Block-triangular attention mask',
        caption: 'Causal across the document, fully bidirectional inside each image block: one mask shape hosts both objectives.',
        diagramBrief: 'A square grid matrix diagram on cream paper, rows and columns both labeled with a token sequence "T T <img> P P P P </img> T". Shade cells to show the mask pattern: lower-triangular shading (causal) for text-to-text cells, a solid filled square block (bidirectional, accent color) for the image-patch-to-image-patch region, and appropriate one-directional shading for text-attends-to-prior-image and image-attends-to-prior-text cells. Legend below: "filled = attends, blank = masked".',
      },
      {
        src: '/lessons/p12-13-inline-sampling.svg',
        alt: 'Parallel denoising vs sequential token generation',
        caption: 'Autoregressive tokens commit one at a time; diffusion patches denoise together, which is why a generated image sharpens as a whole.',
        diagramBrief: 'Two side-by-side image grids on cream paper. Left grid labeled "discrete, autoregressive": squares fill in one at a time left-to-right, top-to-bottom, shown as a sequence of 4 snapshots getting progressively more filled corner-first. Right grid labeled "continuous, diffusion": the same size grid shown as 4 snapshots, each one uniformly less blurry across the whole grid at once, never partially blank. One accent color per label.',
      },
    ],
    takeaways: [
      '"Unified" does not require tokenizing everything. Route the loss per position: cross-entropy for text, diffusion for continuous patches, one shared body.',
      'The block-triangular mask is the enabling detail: causal across the document, bidirectional inside each image.',
      'Continuous beats discrete by 3-5 FID at equal size, and image denoising parallelizes where autoregressive tokens cannot.',
      'Two losses on one backbone means tuning their balance; training dynamics are the tax you pay for skipping the tokenizer.',
    ],
    terms: [
      { term: 'Two-loss training', gloss: '"NTP plus diffusion"', meaning: 'One transformer optimizing text cross-entropy and image diffusion MSE in the same gradient step, on shared weights.' },
      { term: 'Flow matching', gloss: '"a diffusion variant"', meaning: 'Training the network to predict the velocity field from noise toward clean data rather than the noise itself.' },
      { term: 'Block-triangular mask', gloss: '"causal plus bidirectional"', meaning: 'An attention mask that is causal over text but fully bidirectional within each image patch block.' },
      { term: 'MMDiT', gloss: '"Stable Diffusion 3\'s architecture"', meaning: 'A sibling design with modality-specific Q, K, V, and MLP weights per block, sharing only the joint attention.' },
      { term: 'Rectified flow', gloss: '"simpler diffusion math"', meaning: 'A flow-matching formulation using straight-line noise-to-data paths, converging in fewer inference steps than classic DDPM.' },
      { term: 'v-parameterization', gloss: '"velocity prediction"', meaning: 'Training the network to output the velocity between noise and data instead of the noise itself.' },
      { term: 'Linear patch projection', gloss: '"no tokenizer"', meaning: 'Turning a 16x16 pixel block into a continuous vector via one matrix multiply, the same input scheme a ViT uses.' },
      { term: 'Denoising steps', gloss: '"the diffusion loop"', meaning: 'The number of iterative refinement passes, 10 to 30 typical, needed to turn noise into a finished image at inference.' },
      { term: 'Loss-scale mismatch', gloss: '"a tuning headache"', meaning: 'The gap between text NTP loss magnitude and image diffusion loss magnitude that has to be weighted or one objective dominates training.' },
      { term: 'Codebook-free generation', gloss: '"continuous images"', meaning: 'Producing image content without ever mapping it to a discrete vocabulary entry, sidestepping the tokenizer\'s reconstruction ceiling.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A Transfusion sequence is [T, T, <image>, P, P, P, P, </image>, T]. Mark the block-triangular attention mask as a grid of 0s and 1s.' },
      { level: 'medium', prompt: 'Training mixes 70% text tokens and 30% image patches, and the image diffusion loss runs about 10x the magnitude of the text NTP loss. Propose a loss-weighting scheme that balances the two.' },
      { level: 'medium', prompt: 'At 7B parameters, Transfusion beats a same-size Chameleon-style model by 3 to 5 FID points. Given what you know about the tokenizer ceiling from lesson 12.11, explain in one paragraph why removing the codebook produces that gain.' },
      { level: 'design', prompt: 'Sketch the loading state for an image-generating chat product built on Transfusion. Given that patches denoise in parallel over 10-30 steps, what does the progressive reveal look like frame by frame, and how is it different from a token-by-token reveal you would design for Emu3?' },
    ],
    furtherReading: [
      { label: 'Zhou et al. - Transfusion (arXiv:2408.11039)', url: 'https://arxiv.org/abs/2408.11039', why: 'The primary paper; walks the two-loss training recipe and the attention mask in full.' },
      { label: 'Esser et al. - Stable Diffusion 3 / MMDiT (arXiv:2403.03206)', url: 'https://arxiv.org/abs/2403.03206', why: 'The sibling architecture shipping in a production model; compare Section 2 against Transfusion\'s mask design.' },
      { label: 'Peebles & Xie - DiT (arXiv:2212.09748)', url: 'https://arxiv.org/abs/2212.09748', why: 'The diffusion transformer Transfusion and MMDiT both build on.' },
      { label: 'Zhao et al. - MonoFormer (arXiv:2409.16280)', url: 'https://arxiv.org/abs/2409.16280', why: 'A concurrent take on one transformer for both autoregression and diffusion, a useful second data point.' },
      { label: 'Xie et al. - Show-o (arXiv:2408.12528)', url: 'https://arxiv.org/abs/2408.12528', why: 'The next lesson\'s discrete-diffusion alternative to Transfusion\'s continuous approach.' },
    ],
    shipIt: {
      kind: 'snippet',
      name: 'Block-triangular attention mask (pseudocode)',
      body: 'M[i, j] = 1 if:\n  (i is text and j is text and j <= i)                 # causal for text\n  OR (i is image and j is image and same_block(i, j))  # bidirectional in image\n  OR (i is text and j is image and j < image_end)      # text sees prior images\n  OR (i is image and j is text and j < image_start)    # image sees prior text\n\nUse this as the spec you hand an engineer when reviewing whether an "interleaved generation" feature request is architecturally possible on the current backbone.',
    },
    demoCaption:
      'Same image, two representations. Discrete VQ tokens pay the quantization tax; continuous patches keep the detail and denoise in parallel.',
    demo: {
      archetype: 'before-after',
      badLabel: 'Discrete (VQ tokens)',
      goodLabel: 'Continuous (patches)',
      subject: 'A 512x512 image inside one transformer',
      badLines: [
        'pixels -> codebook lookup -> 1024 integer tokens',
        'detail lost at the quantization step, ~27 dB ceiling',
        'generated token by token, strictly sequential',
        'one loss, but the tokenizer caps quality',
      ],
      goodLines: [
        'pixels -> linear projection -> continuous patch vectors',
        'no codebook, no reconstruction ceiling',
        'all patches denoised in parallel, 10-30 steps',
        'diffusion loss for patches, cross-entropy for text, 3-5 FID better',
      ],
      badCaption:
        'The misreading: "a unified model means everything becomes a token." Forcing images through a codebook taxes every generated pixel.',
      goodCaption:
        'The mechanism: route the loss per position instead of the data through a codebook. A block-triangular mask lets causal text and bidirectional image patches share one backbone.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'transfusion runs two losses on one transformer. the routing happens per token.',
        body:
          'transfusion runs two losses on one transformer. the routing happens per token.\n\ntext positions get cross-entropy. image patches stay continuous and get a diffusion loss. same forward pass, same weights, one gradient step.\n\nno VQ codebook, no quantization tax. beats same-size discrete models by 3-5 FID.',
      },
      {
        kind: 'X · design angle',
        hook: 'why do generated images sharpen as a whole instead of painting in from the corner? the sampling loop is the animation.',
        body:
          'why do generated images sharpen as a whole instead of painting in from the corner? the sampling loop is the animation.\n\nautoregressive models emit image tokens in sequence. diffusion-in-a-transformer denoises every patch in parallel over 10-30 steps.\n\nthe progressive-reveal loading state you design is a direct trace of which architecture is underneath.',
      },
      {
        kind: 'X · one-liner',
        hook: 'the cleverest part of transfusion is a matrix of zeros and ones.',
        body:
          'the cleverest part of transfusion is a matrix of zeros and ones.\n\nthe attention mask is causal across text and bidirectional inside each image block. that one shape lets a language model host a diffusion model without either breaking the other.\n\nyour image-capable assistant probably descends from this.',
      },
    ],
    source: {
      label: 'Full lesson: 13 transfusion-autoregressive-diffusion',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/12-multimodal-ai/13-transfusion-autoregressive-diffusion',
    },
  },
  {
    id: 'p12-14-show-o',
    phase: 'Phase 12 · Multimodal AI',
    part: 'Part 3 · Unified any-to-any models',
    index: '12.14',
    title: 'Show-o: images in 16 parallel steps',
    oneLiner:
      'Show-o keeps image tokens discrete but stops generating them one at a time. Start fully masked, predict everything in parallel, keep the confident guesses, repeat. An image lands in about 16 steps, and inpainting comes free.',
    readTime: '~10 min read',
    diagram: '/lessons/p12-14.svg',
    diagramCaption:
      'Masked discrete diffusion: from a fully masked token grid, each step predicts all masked positions in parallel and commits the most confident, on a cosine schedule.',
    whyItMatters:
      'Show-o is the speed-versus-simplicity option in the unified-model menu, and it carries a capability the others charge extra for: inpainting falls out of the training objective, not a feature you build. Because the model learned to fill in masked tokens, "erase this region and regenerate it" is the native operation, so an editing surface\'s region-select tool maps directly onto token masking. The 16-step parallel decode is also what makes near-interactive generation plausible on open weights, versus the thousands of sequential passes an autoregressive image costs.',
    learningObjectives: [
      'Explain masked discrete diffusion: how MaskGIT\'s unmask-the-confident loop generates an image in far fewer steps than one-token-at-a-time.',
      'Show why next-token prediction is the special case of masked prediction where exactly one token is masked.',
      'Compare per-image forward-pass counts across Chameleon/Emu3 (autoregressive), Transfusion (continuous diffusion), and Show-o (masked discrete diffusion).',
      'Explain why inpainting requires no extra training in a masked-prediction model.',
      'Choose an unmasking schedule (cosine vs linear) and reason about its effect on sample coherence.',
    ],
    sections: [
      {
        heading: 'The problem: Transfusion works but its training is touchy',
        body: 'Transfusion\'s continuous diffusion loss lives on a different numerical scale from the discrete text loss, so balancing them is a hyperparameter search, and the dual-head plumbing adds complexity. Meanwhile pure autoregressive discrete models (Chameleon, Emu3) are simple but slow: one forward pass per image token, 1024 to 4096 passes per image.\n\nShow-o (2024) proposed a third corner: keep both modalities discrete like Chameleon, but generate image tokens in parallel using masked discrete diffusion, so the whole model stays inside one cross-entropy formulation.',
      },
      {
        heading: 'The mechanism: MaskGIT\'s unmask-the-confident loop',
        body: 'The trick comes from MaskGIT (2022). Start from an image whose VQ tokens are all the special <MASK> id. Each step, predict every masked token in parallel, then commit only the top-K most confident predictions and re-mask the rest. After roughly 8 to 16 iterations the grid is filled.\n\nTraining is BERT\'s recipe scaled to generation: sample a masking ratio uniformly, hide that fraction of the image\'s tokens, train the transformer to recover them. Next-token prediction turns out to be the special case where exactly one token (the last) is masked; the objective generalizes rather than changes.',
      },
      {
        heading: 'One transformer, hybrid attention, four tasks',
        body: 'Show-o hosts this inside a causal LLM with a hybrid mask: causal over text, fully bidirectional within each image block (masked tokens need to see every other image token), with text attending to prior images and vice versa.\n\nOne checkpoint then serves four tasks selected purely by prompt format: text generation, visual question answering, text-to-image, and inpainting. The inpainting is the freebie: mask a region of the token grid, feed the rest plus a text prompt, and the model fills the hole. Nobody trained an editing feature; the objective was already one.',
      },
      {
        heading: 'Training the mask: one batch, four task formats',
        body: 'Training alternates between three data shapes on the same cross-entropy loss: standard next-token prediction on plain text, text-to-image samples where a caption precedes masked image tokens, and visual-question-answering samples where an image precedes masked text tokens.\n\nBecause each shape uses the identical masked-prediction loss, the same weights absorb all three without task-specific heads. The masking ratio sampled during T2I training, uniform over [0, 1], is what makes the model capable of the 16-step iterative unmasking at inference: it has seen every intermediate masking level, not just the fully masked start.',
      },
      {
        heading: 'The speed math',
        body: 'Compare full transformer passes per image. Chameleon and Emu3: one per token, 1024 to 4096 passes. Transfusion: about 20 denoising steps. Show-o: about 16 steps, each cheaper than a continuous-diffusion step because the output is discrete vocabulary logits rather than continuous regression.\n\nThe unmasking schedule shapes quality. Show-o recommends cosine: nearly everything stays masked early, the bulk of commitments happen mid-range where predictions are most informative, and the tail refines. Unmask everything at step 0 and the tokens are mutually incoherent; the iteration is what lets the image agree with itself.',
      },
      {
        heading: 'The compression math, and Show-o2',
        body: 'A 512x512 Show-o image is 1024 tokens at codebook size K=16384: 1024 * log2(16384) = 14,336 bits, about 1.75 KiB. Raw 24-bit RGB at that resolution is 512*512*24 bits, about 768 KiB. That is roughly a 440x compression ratio, and the quality it buys is visibly below raw pixels but competitive with other discrete-token approaches.\n\nShow-o2 (2025) scales the same recipe: a larger base LLM, a better tokenizer, and a refined unmasking schedule. The architecture did not change; the ingredients around it got better, the same pattern Emu3 followed on Chameleon.',
      },
      {
        heading: 'Where it sits in the 2026 taxonomy',
        body: 'The unified-generation space settled into four corners. Discrete plus autoregressive (Chameleon, Emu3): simplest, slowest. Discrete plus masked diffusion (Show-o, MaskGIT, Muse): parallel sampling, still tokenizer-capped. Continuous plus diffusion (Transfusion, MMDiT): highest quality, trickiest training. Continuous flow matching inside a VLM (JanusFlow, InternVL-U): the newest branch.\n\nPick Show-o when you want T2I, inpainting, and VQA in one open model at reasonable speed; pick Transfusion-family when quality is paramount.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p12-14-inline-maskgit.svg',
        alt: 'Masked discrete diffusion unmasking sequence',
        caption: 'From all-masked to complete in about 16 steps: each round predicts everything, keeps only the confident guesses.',
        diagramBrief: 'A horizontal filmstrip of 6 small grid panels on cream paper, each panel an 8x8 array of squares. Panel 1 fully gray (all masked, labeled "step 0"). Panels 2-5 progressively fewer gray squares and more filled squares in accent color, labeled "step 4", "step 8", "step 12". Panel 6 fully filled, labeled "step 16, complete". Below, a small cosine curve sketch labeled "unmask schedule" showing a slow start, fast middle, slow tail.',
      },
      {
        src: '/lessons/p12-14-inline-passcount.svg',
        alt: 'Forward passes per image across three architectures',
        caption: 'Chameleon and Emu3 spend one pass per token; Show-o spends about 16 passes total for the same image.',
        diagramBrief: 'Three horizontal bars on cream paper, bar length proportional to forward-pass count (log scale acceptable): "Chameleon/Emu3: 1024-4096 passes" (longest bar), "Transfusion: ~20 passes" (short bar), "Show-o: ~16 passes" (short bar, accent color). Caption: "same image, radically different pass counts".',
      },
    ],
    takeaways: [
      'Masked prediction generalizes next-token prediction: text NTP is just the case where one token is masked. One cross-entropy covers both modalities.',
      'Parallel decoding cuts an image from 1024-4096 sequential passes to ~16 steps. That is the difference between batch and near-interactive generation.',
      'Inpainting is not a feature, it is the training objective. Region-erase-and-regenerate maps directly onto token masking.',
      'The unmasking schedule is a quality dial: cosine commits most tokens mid-process, where predictions are most informed by context.',
    ],
    terms: [
      { term: 'Masked discrete diffusion', gloss: '"MaskGIT-style generation"', meaning: 'Training a model to recover randomly masked tokens, then generating by iteratively unmasking the most confident predictions.' },
      { term: 'Parallel decoding', gloss: '"all tokens at once"', meaning: 'Predicting every masked token in one forward pass per step, then committing only the top-K most confident.' },
      { term: 'Cosine schedule', gloss: '"the unmask curve"', meaning: 'The mask-ratio decay curve across inference steps that concentrates token commitments in the mid-range steps.' },
      { term: 'Hybrid attention', gloss: '"causal plus bidirectional, again"', meaning: 'Causal masking over text combined with full bidirectional attention within each image block.' },
      { term: 'Inpainting', gloss: '"fill-in editing"', meaning: 'Conditioning on an image with some tokens masked and predicting the missing ones; free from the masked-prediction training objective.' },
      { term: 'Commitment rate', gloss: '"top-K per step"', meaning: 'How many tokens get finalized per iteration; the dial that trades inference speed against sample quality.' },
      { term: 'MaskGIT', gloss: '"the ancestor technique"', meaning: 'The 2022 image-generation method Show-o\'s unmasking loop is built on.' },
      { term: 'Codebook compression', gloss: '"how small is a token"', meaning: 'The bit-cost of representing an image as VQ tokens versus raw pixels; Show-o\'s 1024 tokens at K=16384 is roughly 440x smaller than raw RGB.' },
      { term: 'Task alternation', gloss: '"one checkpoint, four jobs"', meaning: 'Training on interleaved batches of text generation, VQA, T2I, and inpainting so one set of weights learns all four.' },
      { term: 'Show-o2', gloss: '"the 2025 follow-up"', meaning: 'A scaled version of Show-o with a larger base LLM, an improved tokenizer, and a refined unmasking schedule.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Masked discrete diffusion samples an image in about 16 steps. Why not step 0 directly to a full image? What breaks if you unmask everything at once?' },
      { level: 'medium', prompt: 'Show-o encodes a 512x512 image as 1024 tokens at codebook size K=16384: 1024 * log2(16384) = 14,336 bits. Raw 24-bit RGB at that resolution is 512*512*24 bits. Compute the compression ratio and say what quality it costs.' },
      { level: 'medium', prompt: 'Trace a cosine unmasking schedule over 8 steps: how many tokens are unmasked at each step out of 1024 total? Compare to a linear schedule and say which concentrates commitments where predictions are most informed.' },
      { level: 'design', prompt: 'Design an inpainting brush for an image editor built on Show-o. Given that "erase and regenerate" is literally token masking, what does the brush control (a mask, not a prompt) and what one line of microcopy tells the user what happens to the erased region?' },
    ],
    furtherReading: [
      { label: 'Xie et al. - Show-o (arXiv:2408.12528)', url: 'https://arxiv.org/abs/2408.12528', why: 'The primary paper; Section 3 has the hybrid attention mask and task-alternation training recipe.' },
      { label: 'Show-o2 (arXiv:2506.15564)', url: 'https://arxiv.org/abs/2506.15564', why: 'The 2025 scale-up with the same architecture and a stronger tokenizer.' },
      { label: 'Chang et al. - MaskGIT (arXiv:2202.04200)', url: 'https://arxiv.org/abs/2202.04200', why: 'The original unmask-the-confident technique Show-o adapts into a language-model transformer.' },
      { label: 'Sun et al. - LlamaGen (arXiv:2406.06525)', url: 'https://arxiv.org/abs/2406.06525', why: 'A class-conditional autoregressive alternative, a useful contrast to Show-o\'s masked approach.' },
      { label: 'Chang et al. - Muse (arXiv:2301.00704)', url: 'https://arxiv.org/abs/2301.00704', why: 'Another masked-generative image model in the same family, at production scale.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Inpainting-as-masking design checklist',
      body: '- Does the edit map to a token region the model can mask, or does it require pixel-precise control the tokenizer cannot express?\n- Is the brush selecting a mask (native operation) or writing a new prompt (a different, harder capability)?\n- What is the smallest maskable unit at this tokenizer\'s resolution, and does it match the brush size you are designing?\n- How do you communicate that "erase" here means "regenerate," not "delete"?\n- What happens at the mask boundary: does the model blend or does the edit read as a visible seam?',
    },
    demoCaption:
      'Two ways to produce the same 1024-token image. Step through both: one forward pass per token, or sixteen parallel unmask rounds.',
    demo: {
      archetype: 'sequence',
      badLabel: 'Autoregressive',
      goodLabel: 'Masked parallel',
      badSequence: [
        'predict token 1 (1 forward pass)',
        'predict token 2 (pass 2)',
        'predict token 3 (pass 3)',
        '... one pass per token ...',
        'predict token 1024 (pass 1024)',
        'decode grid to pixels',
      ],
      goodSequence: [
        'start: all 1024 tokens = <MASK>',
        'step 1: predict all, commit the few most confident',
        'steps 2-8: cosine schedule, bulk commits mid-range',
        'steps 9-15: refine, fewer masks each round',
        'step 16: grid complete',
        'decode grid to pixels',
      ],
      badCaption:
        'The misreading: "discrete tokens mean one-at-a-time generation." Autoregressive image decoding spends a full forward pass per token, 1024 to 4096 per image.',
      goodCaption:
        'The mechanism: predict everything in parallel, keep only confident guesses, iterate. ~16 passes instead of ~1024, and because filling masked tokens IS the objective, inpainting comes free.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'show-o generates a 1024-token image in 16 forward passes instead of 1024. the trick is admitting uncertainty.',
        body:
          'show-o generates a 1024-token image in 16 forward passes instead of 1024. the trick is admitting uncertainty.\n\nstart fully masked. predict every token in parallel. commit only the confident ones, re-mask the rest, repeat on a cosine schedule.\n\nit is BERT\'s objective scaled into an image generator.',
      },
      {
        kind: 'X · design angle',
        hook: 'the best editing features are the ones the training objective already paid for.',
        body:
          'the best editing features are the ones the training objective already paid for.\n\nshow-o trains by masking image tokens and recovering them. so "erase this region and regenerate" is not a feature anyone built. it is the native operation.\n\nwhen you design an inpainting brush, you are drawing a token mask. the primitive was set at training time.',
      },
      {
        kind: 'X · one-liner',
        hook: 'next-token prediction is masked prediction with exactly one mask.',
        body:
          'next-token prediction is masked prediction with exactly one mask.\n\nshow-o\'s whole unification rests on that observation: one cross-entropy loss covers causal text and parallel image generation. the objectives were never different, one was just the edge case.',
      },
    ],
    source: {
      label: 'Full lesson: 14 show-o-discrete-diffusion-unified',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/12-multimodal-ai/14-show-o-discrete-diffusion-unified',
    },
  },
  {
    id: 'p12-15-janus-pro',
    phase: 'Phase 12 · Multimodal AI',
    part: 'Part 3 · Unified any-to-any models',
    index: '12.15',
    title: 'Janus-Pro: two eyes, one brain',
    oneLiner:
      'Understanding wants semantic features; generation wants reconstruction-friendly codes. One encoder cannot serve both well. Janus-Pro routes each task through its own encoder into a shared transformer, and beats DALL-E 3 on GenEval with 7B open weights.',
    readTime: '~10 min read',
    diagram: '/lessons/p12-15.svg',
    diagramCaption:
      'Decoupled routing: SigLIP features feed the shared body for understanding; VQ tokens feed it (and come out of it) for generation.',
    whyItMatters:
      'Janus-Pro names a pattern designers already know: one artifact optimized for two jobs serves both badly. SigLIP embeddings put "cat" images near the word cat but cannot rebuild pixels; VQ codes rebuild pixels crisply but carry weak semantics. Every prior unified model forced one representation to do both and paid a visible tax on one side. Decoupling the encoders while sharing the reasoning body is why a 7B open model beats DALL-E 3 on generation while matching LLaVA on understanding: the honest answer to "one unified model or two specialists" is now both at once.',
    learningObjectives: [
      'Explain why a single visual encoder cannot serve both image understanding and image generation without compromising one.',
      'Trace Janus-Pro\'s two input paths (SigLIP for understanding, VQ for generation) into one shared transformer body.',
      'Show how the same architecture at 1.3B (Janus) underperformed and at 7B with more data (Janus-Pro) beat DALL-E 3, and attribute the gain correctly.',
      'Compare decoupled-encoder (Janus-Pro), coupled-continuous (Transfusion), and coupled-discrete (Show-o) unified architectures.',
      'Decide when decoupled encoders are worth the added complexity versus a single-purpose model.',
    ],
    sections: [
      {
        heading: 'The problem: one tokenizer, two incompatible jobs',
        body: 'Chameleon, Show-o, and Transfusion all push understanding and generation through a single visual representation, and that representation is a compromise. Optimize it for reconstruction and you get VQ tokens that decode to crisp pixels but cluster poorly by meaning. Optimize it for semantics and you get SigLIP-style embeddings rich in concepts that cannot be rebuilt into an image.\n\nEach prior model pays the tax on one direction: perception scores lag, or generations look mushy. Janus (DeepSeek, 2024) asked the impolite question: why insist on one tokenizer when the two tasks want different things?',
      },
      {
        heading: 'The move: route by task, share the body',
        body: 'Janus-Pro keeps one transformer body and gives it two visual front doors. For understanding, the input image goes through SigLIP-SO400m and a small MLP into the body, which emits text. For generation, text goes into the body, which emits VQ token ids that a decoder renders to pixels; conditioning images enter as VQ tokens too.\n\nA task tag (or the prompt format itself) picks the route. Everything upstream and downstream of the body is task-specific; the body itself has no modality-specific weights per block. It is a plain LLM-style transformer with two input adapters.',
      },
      {
        heading: 'Why the shared body still works',
        body: 'The body sees two very different input distributions, SigLIP features and VQ codes, and the claim is that with enough parameters and data it absorbs the switching. Each loss now gets the representation it wants: perception trains on features tuned for semantic similarity, generation trains on codes tuned for reconstruction.\n\nOne more quiet advantage: because the body is a standard text-style transformer, it can be initialized from a pretrained LLM. Janus-Pro initializes from DeepSeek\'s 7B MoE, inheriting reasoning ability that from-scratch unified models struggle to reach. The eyes are new; the brain came pretrained.',
      },
      {
        heading: 'The data scaling that flipped the scoreboard',
        body: 'The original Janus introduced the decoupling at 1.3B parameters and modest data, and the results did not land. Janus-Pro (January 2025) scaled the same architecture: 7B parameters, 90M image-text pairs for alignment (up from 72M), 72M for unified training (up from 26M), plus 200k image-generation instruction samples.\n\nThe scoreboard turned: Janus-Pro-7B hits 0.80 on GenEval against DALL-E 3\'s 0.67, and matches LLaVA-class models on MMMU (60.3 vs about 58). One open checkpoint, competitive on both sides of the unified spectrum. The architecture was right the first time; the data mix made it true.',
      },
      {
        heading: 'JanusFlow: swapping VQ for rectified flow',
        body: 'JanusFlow (arXiv:2411.07975) keeps the decoupled-encoder pattern but replaces the generation-side VQ tokenizer with continuous rectified flow, the same flow-matching family Transfusion (lesson 12.13) uses. Understanding still routes through SigLIP; generation now denoises continuous patches instead of predicting discrete codes.\n\nThe result lifts the generation quality ceiling further, for the same reason Transfusion beats discrete models: no codebook, no reconstruction cap. JanusFlow is the point where the decoupled-encoder idea and the continuous-diffusion idea from the previous two lessons converge into one recipe.',
      },
      {
        heading: 'The honest scope, and what came after',
        body: 'Decoupling costs complexity: two encoders to train, two input paths to maintain, two failure-mode inventories. If your product only understands images, Janus-Pro is over-engineered; take a LLaVA-family model. If it only generates, take a diffusion model. The architecture earns its keep exactly when you need both in one deployment.\n\nInternVL-U (2026) folds decoupled routing into a natively multimodal backbone, adding editing on top. Decoupled encoders are now the default pattern for unified models at scale, even as the specific implementation keeps changing underneath it.',
      },
      {
        heading: 'A fourth encoder? Where decoupling could go next',
        body: 'Nothing about the pattern caps it at two encoders. A third front door, a DINO-style segmentation encoder or a MiDaS-style depth encoder, would route through the same shared body the same way SigLIP and VQ already do, with its own task tag and its own lightweight adapter.\n\nThe product motivation would decide the encoder: a depth encoder makes spatial-reasoning and robotics-adjacent features possible (this part\'s later lessons on robot policies build on exactly that idea); a segmentation encoder would make pixel-precise selective editing a native operation instead of a prompt-engineering workaround.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p12-15-inline-routing.svg',
        alt: 'Decoupled encoder routing into a shared body',
        caption: 'Two doors, one room: SigLIP features enter for understanding, VQ tokens enter and exit for generation, both through the same transformer.',
        diagramBrief: 'A diagram on cream paper with one large central box labeled "shared transformer body". Two input arrows enter from the left: top arrow from an icon labeled "image" through a small box "SigLIP-SO400m + MLP" labeled "understanding path", bottom arrow from an icon labeled "text" going directly in, and a separate arrow from "VQ tokenizer" labeled "generation path (input side)". Two output arrows exit to the right: top "text out" (understanding), bottom "VQ tokens -> decoder -> pixels" (generation). One accent color distinguishing the two paths throughout.',
      },
      {
        src: '/lessons/p12-15-inline-scaling.svg',
        alt: 'Janus to Janus-Pro data and parameter scaling',
        caption: 'Same architecture, 5x the parameters and roughly 3x the alignment data, and the benchmark flipped from behind to ahead of DALL-E 3.',
        diagramBrief: 'A small before/after bar-chart pair on cream paper. Left group "Janus (1.3B)": bars for params (1.3B), alignment pairs (72M), unified data (26M), GenEval score (below DALL-E 3\'s 0.67 line, dashed reference). Right group "Janus-Pro (7B)": bars for params (7B), alignment pairs (90M), unified data (72M), GenEval score (0.80, above the same dashed 0.67 reference line). One accent color highlighting the GenEval bars specifically.',
      },
    ],
    takeaways: [
      'Semantic features and reconstruction codes are different artifacts. Any single visual encoder serving both understanding and generation is compromising one.',
      'Decouple the encoders, share the transformer body: perception gets SigLIP, generation gets VQ, reasoning is common infrastructure.',
      'A shared text-style body can be initialized from a pretrained LLM, importing reasoning that from-scratch unified models lack.',
      'Janus to Janus-Pro was the same architecture with 5x the parameters and a bigger data mix. Scaling the recipe, not changing it, flipped the benchmarks.',
    ],
    terms: [
      { term: 'Decoupled encoding', gloss: '"two visual encoders"', meaning: 'Using a separate encoder per direction, semantic features for understanding and reconstruction codes for generation, instead of one shared tokenizer.' },
      { term: 'Shared body', gloss: '"one transformer"', meaning: 'The single transformer that processes either encoder\'s output, carrying no modality-specific weights per block.' },
      { term: 'SigLIP path', gloss: '"the understanding route"', meaning: 'A CLIP-family vision tower producing features rich in concepts but unable to reconstruct pixels.' },
      { term: 'VQ path', gloss: '"the generation route"', meaning: 'Quantized codes that decode cleanly back to pixels but carry comparatively weak semantic information.' },
      { term: 'Routing tag', gloss: '"task selector"', meaning: 'The prompt marker or task format that picks which encoder an input flows through.' },
      { term: 'JanusFlow', gloss: '"the flow-matching variant"', meaning: 'Janus-Pro with the VQ generation path replaced by continuous rectified flow, raising the generation quality ceiling.' },
      { term: 'GenEval', gloss: '"a compositional benchmark"', meaning: 'A benchmark scoring whether generated images satisfy compositional prompt constraints like counts and colors; Janus-Pro scores 0.80 here.' },
      { term: 'MMMU', gloss: '"a perception benchmark"', meaning: 'A multimodal understanding benchmark spanning college-level subjects; Janus-Pro roughly matches LLaVA-class models on it.' },
      { term: 'Pretrained-LLM initialization', gloss: '"starting from a real brain"', meaning: 'Initializing the shared transformer body\'s weights from an already-trained language model instead of from scratch, importing its reasoning ability.' },
      { term: 'InternVL-U', gloss: '"the 2026 follow-up"', meaning: 'A later framework that folds decoupled-encoder routing into a natively multimodal backbone with added editing capability.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Name the two encoders Janus-Pro routes through and the one property each one optimizes for that the other cannot provide.' },
      { level: 'medium', prompt: 'Janus (1.3B) underwhelmed; Janus-Pro (7B) beat DALL-E 3. List the three things that changed between them (parameters, alignment data, unified data) and rank which you would guess mattered most.' },
      { level: 'medium', prompt: 'Design a router: given a prompt like "describe this photo, then sketch a similar one," how do you decide which parts route through SigLIP and which through VQ? Where does the ambiguity actually live?' },
      { level: 'design', prompt: 'Propose a fourth encoder for a Janus-Pro-style model, for example a depth or segmentation encoder, aimed at a specific product feature. Name the feature, the encoder, and one UI element that becomes possible only because that encoder exists.' },
    ],
    furtherReading: [
      { label: 'Wu et al. - Janus (arXiv:2410.13848)', url: 'https://arxiv.org/abs/2410.13848', why: 'The original decoupled-encoder proposal at small scale, useful as the "before" baseline.' },
      { label: 'Chen et al. - Janus-Pro (arXiv:2501.17811)', url: 'https://arxiv.org/abs/2501.17811', why: 'The primary paper; Section 4.2 covers the data scaling that flipped the benchmarks.' },
      { label: 'Ma et al. - JanusFlow (arXiv:2411.07975)', url: 'https://arxiv.org/abs/2411.07975', why: 'The rectified-flow variant, a direct bridge to Transfusion\'s flow-matching approach.' },
      { label: 'InternVL-U (arXiv:2603.09877)', url: 'https://arxiv.org/abs/2603.09877', why: 'The 2026 framework that generalizes decoupled routing into a larger unified system.' },
      { label: 'Dong et al. - DreamLLM (arXiv:2309.11499)', url: 'https://arxiv.org/abs/2309.11499', why: 'An earlier attempt at the same understanding-plus-generation goal, useful historical contrast.' },
    ],
    shipIt: {
      kind: 'rubric',
      name: 'One-encoder-or-two decision rubric',
      body: '- Does the product need to both understand and generate images, or only one direction?\n- If only one direction: skip decoupling, take a specialist (LLaVA-family for understanding, diffusion for generation).\n- If both: what is the cost of maintaining two encoders and two failure-mode inventories versus the quality tax of forcing one encoder to do both?\n- Can the shared body be initialized from a pretrained LLM, and does that change the data budget needed to reach parity?\n- What is the benchmark you will actually be judged on (GenEval, MMMU, or a product-specific eval), and does the architecture choice target that metric directly?',
    },
    demoCaption:
      'One image task, two routings. Force everything through one encoder and one direction pays; route by task and each loss gets the representation it wants.',
    demo: {
      archetype: 'toggle-fix',
      badLabel: 'One shared encoder',
      goodLabel: 'Decoupled routing',
      subject: 'Unified model, 7B weights',
      badLines: [
        'one visual tokenizer serves understanding AND generation',
        'VQ codes: crisp pixels, weak semantics -> perception lags',
        'or SigLIP features: rich concepts, no reconstruction -> gen lags',
        'every prior unified model taxes one direction',
      ],
      goodLines: [
        'understand: image -> SigLIP -> MLP -> shared body -> text',
        'generate: text -> shared body -> VQ tokens -> decoder -> pixels',
        'body initialized from a pretrained 7B LLM',
        'GenEval 0.80 (DALL-E 3: 0.67), MMMU 60.3 (~LLaVA)',
      ],
      badCaption:
        'The misreading: "a unified model needs a unified representation." One encoder optimized for two jobs compromises at least one; the tax shows up as mushy generations or weak perception.',
      goodCaption:
        'The mechanism: route by task. Semantic features for reading, reconstruction codes for drawing, one shared reasoning body between them. Specialize the interfaces, share the intelligence.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'a 7B open model beat DALL-E 3 on generation by refusing to share an encoder.',
        body:
          'a 7B open model beat DALL-E 3 on generation by refusing to share an encoder.\n\nunderstanding wants semantic features (SigLIP). generation wants reconstruction codes (VQ). one encoder doing both compromises one.\n\njanus-pro routes each task through its own encoder into one shared transformer. GenEval 0.80 vs 0.67.',
      },
      {
        kind: 'X · design angle',
        hook: 'designers know this pattern: one artifact optimized for two jobs serves both badly.',
        body:
          'designers know this pattern: one artifact optimized for two jobs serves both badly.\n\nthe wireframe that doubles as a spec. the marketing site that doubles as docs.\n\njanus-pro is that lesson as an architecture: specialize the interfaces (two encoders), share the infrastructure (one transformer). the "one unified thing" instinct was the bug.',
      },
      {
        kind: 'X · one-liner',
        hook: 'same architecture, 5x the data, opposite result.',
        body:
          'same architecture, 5x the data, opposite result.\n\njanus at 1.3B underwhelmed. janus-pro scaled it to 7B with 90M alignment pairs and beat DALL-E 3 on GenEval.\n\nwhen an architecture "fails", check whether the idea failed or the recipe was underfed.',
      },
    ],
    source: {
      label: 'Full lesson: 15 janus-pro-decoupled-encoders',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/12-multimodal-ai/15-janus-pro-decoupled-encoders',
    },
  },
  {
    id: 'p12-16-mio',
    phase: 'Phase 12 · Multimodal AI',
    part: 'Part 3 · Unified any-to-any models',
    index: '12.16',
    title: 'MIO: any-to-any, streaming, in the open',
    oneLiner:
      'Four tokenizers (text, image, speech, music), disjoint ID ranges in one 48k vocabulary, one causal transformer over the lot. MIO is the open recipe for the GPT-4o-style agent that hears, sees, and talks back in near real time.',
    readTime: '~10 min read',
    diagram: '/lessons/p12-16.svg',
    diagramCaption:
      'The any-to-any pattern: four modality tokenizers feeding disjoint ranges of one shared vocabulary, one transformer, streaming decode out the other side.',
    whyItMatters:
      'Voice-first AI lives or dies on one number: time to first audio byte. Under about 500ms a reply feels conversational; above it, users start talking over the agent. MIO makes the budget legible: mic-to-tokens ~50ms, prefill ~100ms, first token ~50ms, speech decoding ~100-150ms, roughly 300ms before anything else goes wrong. When you design a voice interaction, you are designing against that pipeline, and every filler behavior, thinking sound, or barge-in affordance is a decision about which stage you are masking. The robotic timbre you hear in open models is a tokenizer ceiling, not a personality choice.',
    learningObjectives: [
      'Design a shared vocabulary that hosts text, image, speech, and music tokens in disjoint ID ranges without collisions.',
      'Itemize the four latency components between a user\'s spoken input and the first byte of audio reply.',
      'Explain why residual VQ tokenizes speech in layers, and what each layer contributes.',
      'Trace MIO\'s four-stage training curriculum and name the capability that degrades if a stage is skipped.',
      'Compare MIO, AnyGPT, and Unified-IO 2 on scope and maturity.',
    ],
    sections: [
      {
        heading: 'The problem: pipelines lose at every hop',
        body: 'Until 2024, most "any-to-any" systems were chains: a vision model writes text, a language model rewrites it, a speech model reads it aloud. Every hop drops information (tone, prosody, what the image actually showed), adds latency, and multiplies training complexity. GPT-4o demoed the single-model alternative with subsecond voice replies; open systems trailed by months.\n\nThe engineering constraints are brutal: tokenizers must exist for every modality and compress well enough to reconstruct; one vocabulary must host them all without collisions; and inference must stream fast enough for conversation, under 500ms to first audio.',
      },
      {
        heading: 'The move: four tokenizers, disjoint ranges, one transformer',
        body: 'MIO (2024) is Chameleon\'s early-fusion idea pushed to four modalities. Text uses standard BPE (~32k ids). Images use SEED-Tokenizer, a discrete codebook of 4096 entries. Speech uses SpeechTokenizer\'s residual VQ: eight stacked codebooks where the first layer carries coarse content and later layers add prosody and speaker identity. Music uses a similar residual-VQ stack from the Encodec family.\n\nEach modality gets a disjoint ID range: text 0 to 31999, image from 32000, speech from 36096, music from 40192, plus separators. About 48k ids total, one embedding table, one output projection over all of it.',
      },
      {
        heading: 'Streaming: the latency budget, itemized',
        body: 'Speech makes streaming tractable because one base-layer token covers about 50ms of audio. The loop: the mic-side tokenizer emits speech tokens every 50ms; the transformer consumes them incrementally; output tokens stream to a parallel residual-VQ decoder that renders audio 100 to 150ms behind.\n\nItemized: mic to tokens ~50ms, prefill ~100ms on an 8B model, first output token ~50ms, speech decode ~100-150ms. Total time-to-first-audio-byte lands around 300ms minimum; MIO and AnyGPT measure 400 to 600ms in practice, GPT-4o claims ~250ms, and Moshi gets to 160ms round-trip on one GPU.',
      },
      {
        heading: 'The four-stage curriculum: what each stage buys',
        body: 'MIO trains in four stages, and each one is necessary. Stage 1, alignment, trains on large modality-pair corpora (text-image, text-speech, text-music) and builds the shared vocabulary itself. Stage 2, interleaved, trains on multi-modality documents like blogs with images or podcasts with transcripts, and builds cross-modality context. Stage 3, speech-enhanced, adds extra audio-only data to lift speech quality specifically. Stage 4, instruction tuning, covers VQA, captioning, narration, and speech-to-speech dialogue.\n\nSkip a stage and the corresponding capability visibly degrades: skip stage 2 and cross-modality context breaks, skip stage 3 and speech quality suffers even though text and vision stay fine.',
      },
      {
        heading: 'Chain-of-visual-thought: a picture as a scratchpad',
        body: 'One novel behavior falls out of the architecture: for a spatial question, the model can emit intermediate image tokens, a rendered sketch of the scene, then reason over its own sketch in text before answering. Ask "is the cat climbing the tree?" and the model may render a simplified scene, describe what the sketch shows, then answer.\n\nThis is chain-of-thought with a picture instead of a paragraph as the intermediate step. Spatial-reasoning benchmarks improve measurably, because the model gets to check its own visual assumption before committing to an answer, the same benefit text chain-of-thought gives arithmetic.',
      },
      {
        heading: 'Why open any-to-any still trails',
        body: 'Two gaps persist into 2026. Speech quality: residual-VQ tokenizers are lossy, so open-model voices sound robotic next to ElevenLabs-class synthesis; the tokenizer ceiling from lesson 12.11 again, now audible instead of visible. And cross-modality reasoning: "sing about what you see" still fails far more often than pure-vision tasks, because few training documents ever demanded that composition.\n\nQwen3-Omni carries the open-model flag forward on both fronts, but neither gap is closed as of this writing.',
      },
      {
        heading: 'The competitive field',
        body: 'AnyGPT was the proof of concept: four modalities, the same VQ trick as Chameleon, smaller scale. Unified-IO 2 is the cousin with a different scope, adding action, depth, and normal-map outputs alongside text, image, and audio, for embodied and robotics tasks rather than conversation.\n\nNExT-GPT takes a different structural bet: an LLM core plus separate modality-specific diffusion decoders, not one single set of weights. CoDi composes via a shared latent space instead of a shared token vocabulary. MIO and AnyGPT are the two systems closest to pure single-model, single-vocabulary any-to-any; the rest trade some of that purity for other capabilities.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p12-16-inline-vocab.svg',
        alt: 'Four-modality vocabulary allocation',
        caption: 'Roughly 48k IDs split into four disjoint ranges: one embedding table, one output head, four tokenizers feeding it.',
        diagramBrief: 'A single horizontal bar on cream paper divided into four proportionally-sized segments labeled with their ID ranges: "text 0-31999" (widest), "image 32000-36095", "speech 36096-40191", "music 40192-48383", plus a thin final sliver "separators". Below, a downward arrow from the whole bar into one box labeled "shared embedding table + output softmax". One accent color on the speech segment to tie into the residual-VQ detail nearby.',
      },
      {
        src: '/lessons/p12-16-inline-latency.svg',
        alt: 'Time-to-first-audio-byte pipeline',
        caption: 'Four stages spend about 300ms before the reply starts: mic tokenize, prefill, first token, speech decode.',
        diagramBrief: 'A horizontal stacked timeline bar on cream paper, four segments left to right proportional to duration: "mic to tokens, 50ms", "prefill, 100ms", "first output token, 50ms", "speech decode, 100-150ms". Total bracket underneath spanning the whole bar labeled "~300ms to first audio byte". One accent color highlighting the speech-decode segment since it is the largest single cost.',
      },
    ],
    takeaways: [
      'Any-to-any is early fusion at four modalities: per-modality tokenizers, disjoint ID ranges, one transformer over one ~48k vocabulary.',
      'Conversational voice has a hard budget: under ~500ms to first audio byte. The pipeline (tokenize, prefill, first token, decode) spends ~300ms before you add anything.',
      'Robotic open-model voices are a tokenizer ceiling, not a style choice: residual-VQ speech codes are lossy the way VQ image codes are.',
      'Training stages map to capabilities one-to-one: skip interleaved data and cross-modality context dies; skip speech enhancement and audio quality does.',
    ],
    terms: [
      { term: 'Any-to-any', gloss: '"multimodal in and out"', meaning: 'A single model that accepts and emits text, image, speech, and music in any direction, without a chain of separate models.' },
      { term: 'Residual VQ', gloss: '"the speech tokenizer stack"', meaning: 'Stacked codebooks where the base layer encodes coarse content and later layers add prosody and speaker identity.' },
      { term: 'SEED-Tokenizer', gloss: '"the image codes"', meaning: 'A discrete image tokenizer with a 4096-entry codebook, one of MIO\'s four modality tokenizers.' },
      { term: 'Disjoint ID range', gloss: '"no collisions"', meaning: 'A vocabulary design where each modality\'s tokens occupy a distinct, non-overlapping slice of the integer ID space.' },
      { term: 'Time-to-first-audio-byte', gloss: '"TTFAB"', meaning: 'Latency from the user finishing speech to the first audio sample of the reply; under about 500ms feels conversational.' },
      { term: 'Chain-of-visual-thought', gloss: '"a picture as a scratchpad"', meaning: 'Generating an intermediate image as a reasoning step before producing the final text answer.' },
      { term: 'Four-stage curriculum', gloss: '"the training recipe"', meaning: 'Alignment, then interleaved documents, then speech-enhanced data, then instruction tuning, each stage backing a specific capability.' },
      { term: 'Barge-in', gloss: '"interrupting the agent"', meaning: 'A voice-UX affordance letting a user speak over an in-progress reply; its design depends on knowing which pipeline stage is running.' },
      { term: 'Speech-enhanced data', gloss: '"stage 3"', meaning: 'Extra audio-only training data added specifically to lift speech quality without degrading text capability.' },
      { term: 'Unified-IO 2', gloss: '"the cousin model"', meaning: 'A parallel any-to-any effort that adds action, depth, and normal-map outputs alongside text, image, and audio.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'MIO allocates 32000 text ids, 4096 image ids, and 4096 speech-base ids, plus separators. What is the minimum vocabulary size, and why must the ranges be disjoint rather than overlapping?' },
      { level: 'medium', prompt: 'Itemize the four latency stages from mic input to first audio byte and their typical durations. If a product needs a sub-200ms reply, which single stage would you attack first, and why?' },
      { level: 'medium', prompt: 'Residual-VQ speech tokenization uses 8 stacked codebooks. Explain why decoding those layers in parallel rather than sequentially matters for streaming latency.' },
      { level: 'design', prompt: 'Design the barge-in affordance for a voice agent built on this pipeline. Given the four latency stages, at what point in the pipeline does an interruption need to cancel generation, and what does the UI show the user in the 100-150ms speech-decode gap before their interruption visibly lands?' },
    ],
    furtherReading: [
      { label: 'Wang et al. - MIO (arXiv:2409.17692)', url: 'https://arxiv.org/abs/2409.17692', why: 'The primary paper; covers the four-tokenizer vocabulary design and the four-stage curriculum in full.' },
      { label: 'Zhan et al. - AnyGPT (arXiv:2402.12226)', url: 'https://arxiv.org/abs/2402.12226', why: 'MIO\'s direct conceptual ancestor and the earlier proof of concept at smaller scale.' },
      { label: 'Défossez et al. - Moshi (arXiv:2410.00037)', url: 'https://arxiv.org/abs/2410.00037', why: 'The streaming-speech design that gets closest to GPT-4o\'s latency, a useful contrast on the decode side.' },
      { label: 'Lu et al. - Unified-IO 2 (arXiv:2312.17172)', url: 'https://arxiv.org/abs/2312.17172', why: 'The cousin architecture adding action and depth outputs, a different slice of "any-to-any."' },
      { label: 'Wu et al. - NExT-GPT (arXiv:2309.05519)', url: 'https://arxiv.org/abs/2309.05519', why: 'A pipelined, not single-model, any-to-any approach, useful as the alternative MIO argues against.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Voice-agent latency budget checklist',
      body: '- What is your target time-to-first-audio-byte, and does it beat, match, or trail the ~300-500ms conversational threshold?\n- Have you itemized the four pipeline stages (mic tokenize, prefill, first token, speech decode) separately, or is "latency" still one undifferentiated number?\n- Which stage is the largest cost, and is that where your engineering effort is actually going?\n- What does the UI show during each stage: is there a filler sound, a streaming text preview, a thinking indicator?\n- Does barge-in cancel generation cleanly, and does the user get feedback that the interruption landed before the audio actually stops?',
    },
    demoCaption:
      'The headline says the voice agent replies in 300ms. Open the number: four pipeline stages spend that budget before the model has said a word too many.',
    demo: {
      archetype: 'meter',
      headline: '~300ms to first audio: "the model is just fast"',
      breakdown: [
        { label: 'Mic audio to speech tokens', value: 50 },
        { label: 'Prefill (tokens + history, 8B model)', value: 100 },
        { label: 'First output token', value: 50 },
        { label: 'Residual-VQ + speech decode', value: 125 },
      ],
      badCaption:
        'The misreading: voice latency is one number that better models shrink. If the agent feels slow, "wait for a faster model."',
      goodCaption:
        'The mechanism: time-to-first-audio-byte is a four-stage pipeline, and each stage is a separate engineering (and design) surface. Filler sounds, barge-in, and streaming text previews are all choices about which stage you mask.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'the open recipe for a GPT-4o-style voice agent is four tokenizers and one transformer.',
        body:
          'the open recipe for a GPT-4o-style voice agent is four tokenizers and one transformer.\n\nMIO: text BPE + image codes + residual-VQ speech + music codes, each in its own slice of a 48k vocabulary. one causal decoder over the lot.\n\nany modality in, any modality out, streaming. no pipeline hops losing tone at every step.',
      },
      {
        kind: 'X · design angle',
        hook: 'voice UX has one hard number: ~500ms to first audio byte. above it, users talk over your agent.',
        body:
          'voice UX has one hard number: ~500ms to first audio byte. above it, users talk over your agent.\n\nthe budget is a pipeline: mic tokenize 50ms, prefill 100ms, first token 50ms, speech decode 150ms. ~300ms spent before anything goes wrong.\n\nevery thinking sound and barge-in affordance you design is masking a specific stage.',
      },
      {
        kind: 'X · one-liner',
        hook: 'open-model voices sound robotic for the same reason early image gen looked soft: the tokenizer is lossy.',
        body:
          'open-model voices sound robotic for the same reason early image gen looked soft: the tokenizer is lossy.\n\nresidual-VQ squeezes speech through stacked codebooks and the prosody pays. it is the tokenizer ceiling again, audible this time. not a personality choice.',
      },
    ],
    source: {
      label: 'Full lesson: 16 mio-any-to-any-streaming',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/12-multimodal-ai/16-mio-any-to-any-streaming',
    },
  },
];
