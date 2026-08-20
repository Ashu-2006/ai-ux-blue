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
      'Adapter VLMs can read images but only ever answer in text. Chameleon turned images into discrete tokens from the same vocabulary as words, so one decoder can emit text and images interleaved in a single pass.',
    readTime: '~8 min read',
    diagram: 'lessons/p12-11.svg',
    diagramCaption:
      'Early fusion: a VQ-VAE maps the image to 1024 codebook indices that sit in the same token vocabulary as text, one sequence, one loss.',
    whyItMatters:
      'Whether a product can generate images inline, mid-answer, in the order the model chooses, is decided here, not in the UI. Adapter VLMs are structurally text-out, so any "illustrate this" feature on top of them is a pipeline of separate calls you have to orchestrate and design seams for. Early-fusion models emit mixed output natively, which is what makes a truly interleaved canvas or article-writing surface possible. The cost you inherit is the tokenizer ceiling: image quality caps at what the codebook can reconstruct, which shows up in your product as slightly soft, slightly wrong-in-the-details generations.',
    sections: [
      {
        heading: 'The problem: two input paths, one output modality',
        body: 'Every adapter VLM (BLIP-2, LLaVA, Qwen-VL) keeps text and images on separate rails. Text goes through the embedding table; images go through a vision encoder and a projector, merging partway in. Three consequences follow.\n\nThe model can consume images but never emit them: output is text only. Interleaved documents (an article alternating paragraphs and figures) are awkward to model. And visual tokens live in a different region of the hidden space than text tokens, a standing distributional mismatch. Chameleon (Meta, 2024) rejected the premise: make images literally the same kind of thing as words.',
      },
      {
        heading: 'The move: a VQ-VAE turns pixels into vocabulary entries',
        body: 'The tokenizer is a vector-quantized autoencoder. An encoder maps the image to a 32x32 grid of feature vectors; each vector snaps to its nearest neighbor in a learned codebook of 8192 entries; the integer index replaces the vector. A decoder learns to turn indices back into pixels.\n\nOne 512x512 image becomes 1024 integers. Concatenate that alphabet with the text BPE vocabulary (roughly 32k entries) plus <image> and </image> separators and you get one shared vocabulary of about 40k tokens. The transformer sees a single sequence and trains on a single next-token loss, whatever modality comes next.',
      },
      {
        heading: 'What the shared vocabulary buys: mixed-modality output',
        body: 'Inference is plain next-token prediction. Prompt "draw a cat and describe it" and the model may emit <image>, then 1024 codebook indices the decoder renders to pixels, then flowing text about the cat. It picks the order itself: image first, text first, or interleaved.\n\nNothing outside the model stitches this together. The same softmax that chooses the next word chooses the next patch of an image. That is the early-fusion thesis: generation across modalities is not a feature you bolt on, it is what falls out when everything shares one token space.',
      },
      {
        heading: 'The price: stability tricks and a lossy ceiling',
        body: 'Early fusion is unstable at scale. Gradients from image tokens can dominate, and Chameleon\'s 34B run diverged repeatedly until three fixes landed: QK-Norm (LayerNorm on queries and keys before their dot product, taming logit blowup), dropout after every residual add, and an extra norm on the final block\'s skip connection. The training recipe is as much the contribution as the architecture.\n\nAnd the tokenizer is lossy. At 8192 codes and 1024 tokens per image, reconstruction caps around 26 to 28 dB PSNR, visibly below continuous-space diffusion (Stable Diffusion 3 clears 32 dB). The codebook is the quality ceiling.',
      },
      {
        heading: 'When to pick which family',
        body: 'Early fusion (Chameleon, and its extensions like AnyGPT, which added speech and music the same way): one loss, one decoder, native mixed output, tokenizer-capped image quality, and a VQ decoder on the inference path for every generated image.\n\nAdapter VLMs (BLIP-2, LLaVA): vision in, text out only, but they reuse a pretrained LLM wholesale and skip the tokenizer bottleneck entirely for understanding. The rule of thumb holds in 2026: if the product needs image output, you are in the Chameleon family tree. If it only needs to understand images, an adapter model is simpler and recycles more pretrained compute.',
      },
    ],
    takeaways: [
      'Adapter VLMs are structurally text-out. Inline image generation requires the image to be in the output vocabulary, not just the input path.',
      'A VQ-VAE is a tokenizer for pixels: 512x512 becomes 1024 integers from an 8192-entry codebook, predictable like words.',
      'The tokenizer sets the quality ceiling (26-28 dB PSNR vs 32+ for diffusion). Soft, detail-poor generations trace back to the codebook, not the transformer.',
      'One shared vocabulary means the model chooses the output order itself. Design interleaved surfaces around that autonomy, not around fixed slots.',
    ],
    terms: [
      { term: 'Early fusion', meaning: 'Converting images to discrete tokens that share the transformer\'s vocabulary from the first layer on.' },
      { term: 'VQ-VAE', meaning: 'An autoencoder whose bottleneck snaps features to a learned codebook, turning images into integer indices.' },
      { term: 'Codebook', meaning: 'The learned set of K vectors an image feature can quantize to; size trades compression against fidelity.' },
      { term: 'Shared vocabulary', meaning: 'One token ID space covering text, image codes, and modality separators.' },
      { term: 'QK-Norm', meaning: 'LayerNorm on query and key projections before their dot product; prevents attention logit blowup at depth.' },
      { term: 'Tokenizer ceiling', meaning: 'The best reconstruction quality the VQ decoder can achieve; bounds generated image quality.' },
    ],
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
    readTime: '~8 min read',
    diagram: 'lessons/p12-12.svg',
    diagramCaption:
      'One decoder, one loss: text, 2D image tokens, and 3D video tokens drawn from a unified vocabulary, all trained with next-token prediction.',
    whyItMatters:
      'Emu3 settles a question that shapes product roadmaps: do you need a separate diffusion stack to ship image generation, or can the language model you already run do it? If next-token prediction matches diffusion, one backbone serves chat, perception, image gen, and video gen, which collapses infra, prompt logic, and safety review into one surface. The tradeoff you will feel in UX is latency: autoregressive image generation emits thousands of tokens sequentially, roughly two minutes per 512x512 image at 30 tokens per second, versus seconds for diffusion. That gap is a loading-state design problem before it is a research problem.',
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
        heading: 'The numbers, and the trick borrowed back from diffusion',
        body: 'Emu3 beat SDXL on MJHQ-30K FID (5.4 vs 5.6), tied it on GenEval (0.54 vs 0.55), and beat LLaVA-1.6 on VQAv2 (75.1 vs 72.4). Not a sweep, but "next-token prediction is all you need" became defensible across modalities.\n\nOne inference trick does heavy lifting: classifier-free guidance, imported from diffusion. Generate the logits twice, once with the caption and once without, and mix them with a guidance weight (3.0 to 7.0 typical). Temperature is tuned per role: 1.0 for perception, 0.8 for generation. Quality lives in the sampler as much as the weights.',
      },
      {
        heading: 'The standing cost: sequential tokens are slow',
        body: 'A 4096-token image at 30 tokens per second is about two minutes per 512x512 image; SDXL does it in 2 to 5 seconds. Speculative decoding and KV-cache work narrow the gap without closing it. Autoregressive image generation trades inference speed for architectural unity, and that trade is the durable one to remember.\n\nConceptually the bet paid off: two years on, the open unified-generation family (Emu3, Show-o, Janus-Pro, Transfusion) is the default research path, and production frontier models appear to run some variant. One transformer, one tokenizer per modality, scale.',
      },
    ],
    takeaways: [
      'Next-token prediction matched diffusion on image generation once the tokenizer got good enough. The objective was never the blocker.',
      'One checkpoint, three products (gen, chat, video) routed by prompt template. Unified models collapse infra and safety surface, not just research narrative.',
      'Autoregressive image gen pays in latency: ~2 minutes per image vs seconds for diffusion. Budget the waiting-state design accordingly.',
      'Classifier-free guidance and temperature are inference-time quality dials. The same weights ship very different output depending on the sampler.',
    ],
    terms: [
      { term: 'Next-token prediction', meaning: 'The standard autoregressive loss, applied to any modality once it is tokenized.' },
      { term: 'IBQ tokenizer', meaning: 'A VQ tokenizer class with large codebooks (32768+) and near-diffusion reconstruction quality.' },
      { term: '3D VQ', meaning: 'A spatiotemporal codebook where one token covers a 4x4x4 pixel cube across frames.' },
      { term: 'Classifier-free guidance', meaning: 'Mixing conditional and unconditional logits with a weight to sharpen generation quality.' },
      { term: 'Unified vocabulary', meaning: 'Text, image, and video tokens in one integer space; the model predicts whichever comes next.' },
      { term: 'MJHQ-30K', meaning: 'A 30k-prompt image generation benchmark where Emu3 reported beating SDXL on FID.' },
    ],
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
    readTime: '~8 min read',
    diagram: 'lessons/p12-13.svg',
    diagramCaption:
      'One backbone, two heads: cross-entropy on text tokens, flow-matching MSE on continuous image patches, joined by a block-triangular attention mask.',
    whyItMatters:
      'This is the architecture family your image-capable assistant almost certainly descends from: the lesson notes that 2026 production models which emit images appear to use some Transfusion or MMDiT descendant. The design-relevant insight is that "unified" does not have to mean "everything becomes a token." Keeping images continuous buys 3 to 5 FID points of visible quality over same-size discrete models, and denoising parallelizes where autoregressive tokens cannot, which is why generated images can appear as a progressively sharpening whole instead of a token stream. When you storyboard generation UX, that sampling loop is the real animation curve underneath.',
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
        body: 'Text must be causal or teacher forcing breaks: a word cannot attend to words after it. But an image is one snapshot, not a sequence, so its patches attend to each other freely within the image block. Text attends to images before it; image patches attend to text before them.\n\nThe result is a block-triangular attention mask: triangular across the document, solid blocks wherever an image sits. It is the load-bearing detail of the whole design, the one matrix that lets a causal language model host a bidirectional diffusion model without either corrupting the other.',
      },
      {
        heading: 'The sibling: MMDiT and Stable Diffusion 3',
        body: 'Stable Diffusion 3 shipped MMDiT (Multimodal Diffusion Transformer) the same year, and the architectures are siblings. MMDiT gives each block separate Q, K, V, and MLP weights for text versus image, sharing only the joint attention; it trains with rectified flow, a flow-matching variant with simpler math and fewer sampling steps than DDPM.\n\nBoth converge on the same core idea: one transformer runs next-token prediction on text and diffusion on continuous image representations. Transfusion scaled to 7B parameters; MMDiT backs SD3 at 2B and 8B.',
      },
      {
        heading: 'The scorecard against discrete',
        body: 'At 7B parameters, Transfusion beats a same-size Chameleon-style model by 3 to 5 FID points. No tokenizer needs training: the image path in is a linear projection. And inference can denoise all patches of an image in parallel over 10 to 30 steps, where autoregressive tokens are strictly sequential.\n\nThe cost is training complexity: two losses on different numerical scales need weight tuning, and a schedule mismatch can let one head dominate. Downstream, Janus-Pro decouples the encoders per task and Show-o swaps continuous diffusion for masked discrete diffusion; the family branches fast from here.',
      },
    ],
    takeaways: [
      '"Unified" does not require tokenizing everything. Route the loss per position: cross-entropy for text, diffusion for continuous patches, one shared body.',
      'The block-triangular mask is the enabling detail: causal across the document, bidirectional inside each image.',
      'Continuous beats discrete by 3-5 FID at equal size, and image denoising parallelizes where autoregressive tokens cannot.',
      'Two losses on one backbone means tuning their balance; training dynamics are the tax you pay for skipping the tokenizer.',
    ],
    terms: [
      { term: 'Two-loss training', meaning: 'One transformer optimizing text cross-entropy and image diffusion MSE in the same gradient step.' },
      { term: 'Flow matching', meaning: 'A diffusion variant that predicts the velocity field from noise to clean data; simpler math than DDPM.' },
      { term: 'Block-triangular mask', meaning: 'An attention mask that is causal over text but fully bidirectional within each image block.' },
      { term: 'MMDiT', meaning: 'Stable Diffusion 3\'s sibling architecture: joint attention with modality-specific weights per block.' },
      { term: 'Rectified flow', meaning: 'A flow-matching formulation that converges in fewer inference steps than classic diffusion.' },
      { term: 'v-parameterization', meaning: 'Training the network to output the velocity between noise and data rather than the noise itself.' },
    ],
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
    readTime: '~8 min read',
    diagram: 'lessons/p12-14.svg',
    diagramCaption:
      'Masked discrete diffusion: from a fully masked token grid, each step predicts all masked positions in parallel and commits the most confident, on a cosine schedule.',
    whyItMatters:
      'Show-o is the speed-versus-simplicity option in the unified-model menu, and it carries a product capability the others charge extra for: inpainting falls out of the training objective. Because the model learned to fill in masked tokens, "erase this region and regenerate it" is not a feature to build, it is the native operation. When you design an editing surface, that changes the primitive: region selection maps directly to token masking. And the 16-step parallel decode is what makes near-interactive generation plausible on open weights, versus the thousands of sequential passes an autoregressive image costs.',
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
        heading: 'The speed math',
        body: 'Compare full transformer passes per image. Chameleon and Emu3: one per token, 1024 to 4096 passes. Transfusion: about 20 denoising steps. Show-o: about 16 steps, each cheaper than a continuous-diffusion step because the output is discrete vocabulary logits rather than continuous regression.\n\nThe unmasking schedule shapes quality. Show-o recommends cosine: nearly everything stays masked early, the bulk of commitments happen mid-range where predictions are most informative, and the tail refines. Unmask everything at step 0 and the tokens are mutually incoherent; the iteration is what lets the image agree with itself.',
      },
      {
        heading: 'Where it sits in the 2026 taxonomy',
        body: 'The unified-generation space settled into four corners. Discrete plus autoregressive (Chameleon, Emu3): simplest, slowest. Discrete plus masked diffusion (Show-o, MaskGIT, Muse): parallel sampling, still tokenizer-capped. Continuous plus diffusion (Transfusion, MMDiT): highest quality, trickiest training. Continuous flow matching inside a VLM (JanusFlow, InternVL-U): the newest branch.\n\nShow-o2 (2025) scaled the recipe with a larger base LLM and better tokenizer, same pattern. Pick Show-o when you want T2I, inpainting, and VQA in one open model at reasonable speed; pick Transfusion-family when quality is paramount.',
      },
    ],
    takeaways: [
      'Masked prediction generalizes next-token prediction: text NTP is just the case where one token is masked. One cross-entropy covers both modalities.',
      'Parallel decoding cuts an image from 1024-4096 sequential passes to ~16 steps. That is the difference between batch and near-interactive generation.',
      'Inpainting is not a feature, it is the training objective. Region-erase-and-regenerate maps directly onto token masking.',
      'The unmasking schedule is a quality dial: cosine commits most tokens mid-process, where predictions are most informed by context.',
    ],
    terms: [
      { term: 'Masked discrete diffusion', meaning: 'Training to recover masked tokens, then generating by iteratively unmasking the most confident predictions.' },
      { term: 'Parallel decoding', meaning: 'Predicting all masked tokens in one forward pass and committing the top-K per step.' },
      { term: 'Cosine schedule', meaning: 'The unmasking curve that concentrates token commitments in the mid-range steps.' },
      { term: 'Hybrid attention', meaning: 'Causal masking over text combined with bidirectional attention within image blocks.' },
      { term: 'Inpainting', meaning: 'Filling a masked region of an image conditioned on the rest; free from the masked-prediction objective.' },
      { term: 'Commitment rate', meaning: 'How many tokens are finalized per iteration; the speed-versus-quality dial at inference.' },
    ],
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
    readTime: '~8 min read',
    diagram: 'lessons/p12-15.svg',
    diagramCaption:
      'Decoupled routing: SigLIP features feed the shared body for understanding; VQ tokens feed it (and come out of it) for generation.',
    whyItMatters:
      'Janus-Pro names a pattern designers already know: one artifact optimized for two jobs serves both badly. SigLIP embeddings put "cat" images near the word cat but cannot rebuild pixels; VQ codes rebuild pixels crisply but carry weak semantics. Every prior unified model forced one representation to do both and paid a visible quality tax on one side. Decoupling the encoders while sharing the reasoning body is why a 7B open model can beat DALL-E 3 on generation while matching LLaVA on understanding, and it is the honest answer to "should we use one unified model or two specialists": the reference architecture is now both at once.',
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
        heading: 'Janus vs Janus-Pro: the fix was mostly data',
        body: 'The original Janus introduced the decoupling at 1.3B parameters and modest data, and the results did not land. Janus-Pro (January 2025) scaled the same architecture: 7B parameters, 90M image-text pairs for alignment (up from 72M), 72M for unified training (up from 26M), plus 200k image-generation instruction samples.\n\nThe scoreboard turned: Janus-Pro-7B hits 0.80 on GenEval against DALL-E 3\'s 0.67, and matches LLaVA-class models on MMMU (60.3 vs about 58). One open checkpoint, competitive on both sides of the unified spectrum. The architecture was right the first time; the data mix made it true.',
      },
      {
        heading: 'The honest scope, and what came after',
        body: 'Decoupling costs complexity: two encoders to train, two input paths to maintain, two failure-mode inventories. If your product only understands images, Janus-Pro is over-engineered; take a LLaVA-family model. If it only generates, take a diffusion model. The architecture earns its keep exactly when you need both in one deployment.\n\nJanusFlow swaps the VQ generation path for continuous rectified flow, lifting the quality ceiling further while keeping the decoupled pattern. InternVL-U (2026) folds decoupled routing into a natively multimodal backbone. Decoupled encoders are now the default for unified models at scale.',
      },
    ],
    takeaways: [
      'Semantic features and reconstruction codes are different artifacts. Any single visual encoder serving both understanding and generation is compromising one.',
      'Decouple the encoders, share the transformer body: perception gets SigLIP, generation gets VQ, reasoning is common infrastructure.',
      'A shared text-style body can be initialized from a pretrained LLM, importing reasoning that from-scratch unified models lack.',
      'Janus to Janus-Pro was the same architecture with 5x the parameters and a bigger data mix. Scaling the recipe, not changing it, flipped the benchmarks.',
    ],
    terms: [
      { term: 'Decoupled encoding', meaning: 'Separate visual encoders per direction: semantic features for understanding, reconstruction codes for generation.' },
      { term: 'Shared body', meaning: 'The single transformer that processes either encoder\'s output, with no modality-specific weights per block.' },
      { term: 'SigLIP path', meaning: 'The understanding route: CLIP-family features rich in concepts but unable to reconstruct pixels.' },
      { term: 'VQ path', meaning: 'The generation route: quantized codes that decode cleanly back to pixels but carry weak semantics.' },
      { term: 'Routing tag', meaning: 'The prompt marker or task format that selects which encoder an input flows through.' },
      { term: 'JanusFlow', meaning: 'The variant that replaces the VQ generation path with continuous rectified flow for a higher quality ceiling.' },
    ],
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
    readTime: '~8 min read',
    diagram: 'lessons/p12-16.svg',
    diagramCaption:
      'The any-to-any pattern: four modality tokenizers feeding disjoint ranges of one shared vocabulary, one transformer, streaming decode out the other side.',
    whyItMatters:
      'Voice-first AI lives or dies on one number: time to first audio byte. Under about 500ms a reply feels conversational; above it, users start talking over the agent. MIO makes the budget legible: mic-to-tokens ~50ms, prefill ~100ms, first token ~50ms, speech decoding ~100-150ms, roughly 300ms before anything else goes wrong. When you design a voice interaction, you are designing against that pipeline, and every filler behavior, thinking sound, or barge-in affordance is a decision about which stage you are masking. The open models also explain the robotic timbre you hear: the speech tokenizer is lossy, and that is a tokenizer ceiling, not a personality choice.',
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
        heading: 'The curriculum, and a visual scratchpad',
        body: 'MIO trains in four stages, and each is load-bearing: alignment on modality pairs (builds the shared vocabulary), interleaved multimodal documents (builds cross-modality context), speech-enhanced data (lifts audio quality), then instruction tuning across tasks. Skip a stage and the corresponding capability visibly degrades.\n\nOne novel behavior: chain-of-visual-thought. For a spatial question the model can emit intermediate image tokens, a rendered sketch of the scene, then reason over its own sketch in text before answering. Chain-of-thought, but the scratchpad is a picture. Spatial-reasoning benchmarks improve.',
      },
      {
        heading: 'Why open any-to-any still trails',
        body: 'Two gaps persist into 2026. Speech quality: residual-VQ tokenizers are lossy, so open-model voices sound robotic next to ElevenLabs-class synthesis; the tokenizer ceiling from lesson 12.11 again, now audible instead of visible. And cross-modality reasoning: "sing about what you see" still fails far more often than pure-vision tasks, because few training documents ever demanded that composition.\n\nThe family map: AnyGPT was the proof of concept, MIO the scale-up, Unified-IO 2 the cousin with action and depth outputs, and streaming speech designs like Moshi and GLM-4-Voice push the latency frontier. Qwen3-Omni carries the open flag forward.',
      },
    ],
    takeaways: [
      'Any-to-any is early fusion at four modalities: per-modality tokenizers, disjoint ID ranges, one transformer over one ~48k vocabulary.',
      'Conversational voice has a hard budget: under ~500ms to first audio byte. The pipeline (tokenize, prefill, first token, decode) spends ~300ms before you add anything.',
      'Robotic open-model voices are a tokenizer ceiling, not a style choice: residual-VQ speech codes are lossy the way VQ image codes are.',
      'Training stages map to capabilities one-to-one: skip interleaved data and cross-modality context dies; skip speech enhancement and audio quality does.',
    ],
    terms: [
      { term: 'Any-to-any', meaning: 'One model that accepts and emits text, image, speech, and music in any direction.' },
      { term: 'Residual VQ', meaning: 'Stacked codebooks where the base layer encodes content and later layers add prosody and speaker detail.' },
      { term: 'SEED-Tokenizer', meaning: 'The discrete 4096-entry image tokenizer MIO uses for its vision token range.' },
      { term: 'Time-to-first-audio-byte', meaning: 'Latency from the user finishing speech to the first audio of the reply; under 500ms feels conversational.' },
      { term: 'Chain-of-visual-thought', meaning: 'Emitting an intermediate generated image as a reasoning scratchpad before the final answer.' },
      { term: 'Four-stage curriculum', meaning: 'Alignment, interleaved, speech-enhanced, then instruction tuning; each stage backs a specific capability.' },
    ],
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
