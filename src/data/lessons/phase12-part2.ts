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
      'Flamingo (DeepMind, 2022) wired vision into a frozen 70B LLM through a cross-attention gate initialized to zero, so day-zero behavior was pure text. It was the first VLM to learn from prompt examples with no gradient step.',
    readTime: '~10 min read',
    diagram: '/lessons/p12-04.svg',
    diagramCaption:
      'Gated cross-attention: text flows through the frozen LLM as always; between blocks, a tanh-gated layer adds visual information from the Perceiver resampler on top.',
    whyItMatters:
      'Flamingo is the ancestor of every thread where a user pastes several screenshots and refers back to them, and every "here are three examples, now do the fourth" prompt with images. Two behaviors trace to its mechanism: multi-image conversations work because vision enters between LLM layers instead of the input stream, and text quality survives because the gate opens from zero. When a multimodal fine-tune suddenly writes worse, check the gate schedule before the data.',
    learningObjectives: [
      'Explain why tanh(alpha) gated at zero keeps Flamingo\'s day-zero output identical to a text-only Chinchilla 70B.',
      'Trace how the Perceiver resampler turns any patch count into a fixed 64 visual tokens per image.',
      'Compute the trained-parameter fraction of Flamingo-9B against its frozen 9B backbone.',
      'Compare Flamingo\'s masked cross-attention to BLIP-2\'s single Q-Former bridge for interleaved, multi-image prompts.',
      'Diagnose a multimodal fine-tune that degrades text quality by inspecting its gate schedule instead of its data.',
    ],
    sections: [
      {
        heading: 'The problem: many images in one conversation',
        body: 'BLIP-2 (lesson 12.03) feeds 32 visual tokens from its Q-Former into a frozen LLM\'s input layer. That covers one image per prompt cleanly. Real usage is messier: "here is image A, caption it; here is B; now C." Mixing image and text tokens in a single input stream raises a fussy question, which text positions may attend to which images, and every added image inflates the sequence the LLM has to process as ordinary text.\n\nFlamingo\'s answer, from DeepMind in April 2022: do not touch the LLM\'s input stream at all. Keep a frozen Chinchilla 70B exactly as it was pretrained, and insert new cross-attention layers between its existing blocks, one every 4 layers, so text can reach over to visual features from outside the input sequence entirely.',
      },
      {
        heading: 'The gate: zero at initialization, visual later',
        body: 'Each inserted layer computes y = tanh(alpha) * cross_attention(x, resampler_output) + x, where alpha is a learnable scalar starting at zero. Since tanh(0) = 0, the new layers are no-ops at step zero: an untrained Flamingo is exactly the pretrained Chinchilla 70B on text. As training proceeds, alpha moves and visual information flows in smoothly, layer by layer.\n\nThe residual term means even a fully open gate adds to the text representation rather than overwriting it. For Flamingo-9B, the frozen LLM is 9B parameters; the gated cross-attention layers add about 1.4B trained parameters, the resampler another 64M. Roughly 14% of the model trains, and none of it can ever fully erase the other 86%.',
      },
      {
        heading: 'The resampler: any image becomes 64 tokens',
        body: 'A prompt can hold zero, one, or many images at any resolution, so the cross-attention layers need one fixed interface. The Perceiver resampler provides it: 64 learnable latent vectors of dimension 1024 cross-attend over however many patch tokens the ViT produced, then run self-attention and a feed-forward block among themselves. After 6 such blocks, every image exits as exactly 64 visual tokens, whether the ViT emitted 196 patches from a 224px image or 900 from a 480px one.\n\nFor video the resampler runs per frame with a temporal position encoding added, so a clip becomes frame-count times 64 tokens. This is the same fixed-queries idea as BLIP-2\'s Q-Former, aimed at variable input shape instead of compression ratio.',
      },
      {
        heading: 'Masked cross-attention for interleaved prompts',
        body: 'A prompt like "<image A> caption A <image B> caption B <image C> ?" needs a rule for which image a given text token can see. Flamingo\'s choice: each text token attends only to the most recent preceding image, not to every image that came before it. A caption about image C never leaks attention back to image A.\n\nThe alternative, attending to all preceding images, was available and rejected; the paper found the single-most-recent rule easier to train and closer to how a reader actually processes a sequence of captioned images. This is the mechanism behind a familiar product pattern: paste three screenshots into a chat thread and discuss them one at a time, and the model naturally keeps its attention on the one you are currently asking about.',
      },
      {
        heading: 'The few-shot punchline',
        body: 'Trained on 43M interleaved web pages (M3W), 4.4B image-text pairs (ALIGN and LTIP), and 27M video clips, the model learned the natural rhythm of images embedded in running text. The payoff: give three (image, caption) examples in the prompt and Flamingo captions a fourth image correctly, with no gradient step and no fine-tuning.\n\nThe frozen LLM\'s in-context learning, the same capability GPT-3 showed for text, carried through the gate intact. Few-shot multimodal prompting, table stakes in every chat product by 2026, was this paper\'s centerpiece result, not a footnote.',
      },
      {
        heading: 'The lineage, and when to pick which bridge',
        body: 'OpenFlamingo reproduced the architecture openly at 3B to 9B parameters on LLaMA and MPT bases; Otter added instruction tuning on top using the MIMIC-IT dataset. Hugging Face\'s Idefics line progressively simplified it, with Idefics2 dropping the resampler for pooled patch tokens directly. Gemini\'s interleaved input format is the conceptual heir, and OBELICS, the open 141M-page interleaved corpus, is what most of these open descendants train on.\n\nThe cost split against BLIP-2 is stark: about 188M trained parameters versus roughly 10B, days on 8 A100s versus weeks on thousands of TPUv4 chips. Pick the cheap bridge for single-image answering on a budget. Pick the Flamingo pattern for interleaved, multi-image, few-shot work, where the extra parameters buy a capability BLIP-2 was never built for.',
      },
      {
        heading: 'BLIP-2 vs Flamingo, side by side',
        body: '| | BLIP-2 | Flamingo |\n|---|---|---|\n| Visual bridge | Q-Former once at input | Gated cross-attention every 4 layers |\n| Visual tokens | 32 per image | 64 per image per cross-attn layer |\n| Frozen LLM | Yes | Yes, Chinchilla 70B |\n| Few-shot in-context | Weak | Strong, the paper\'s centerpiece |\n| Interleaved inputs | No native support | Yes, the design target |\n| Training data | 130M pairs | 1.3B pairs + 43M interleaved pages |\n| Trained parameters | 188M | ~10B |\n| Compute | Days on 8 A100s | Weeks on thousands of TPUv4 |\n\nRead the table as a decision, not trivia: if your product needs one image answered once, BLIP-2\'s cost is hard to beat. If it needs a running conversation across several images, Flamingo\'s extra machinery is what makes that conversation coherent.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p12-04-inline-gate.svg',
        alt: 'Gate value opening during training',
        caption: 'alpha moves from 0 toward open as training proceeds; tanh keeps the curve smooth and bounded.',
        diagramBrief:
          'Line chart, x-axis "training steps" (0 to 10k), y-axis "tanh(alpha)" (0 to 1). Cream paper background, black ink line rising from 0 and flattening near 0.9. Dashed horizontal line at 1.0 labeled "fully open". Single blue accent dot marking "step 0: exactly Chinchilla 70B".',
      },
      {
        src: '/lessons/p12-04-inline-mask.svg',
        alt: 'Masked cross-attention over an interleaved prompt',
        caption: 'Each text token attends only to the most recent preceding image, never to earlier ones.',
        diagramBrief:
          'Horizontal sequence of boxes: [image A] [caption A text] [image B] [caption B text] [image C] [?]. Draw arrows from each text token box down to the nearest preceding image box only, in blue. Cream paper background, black ink boxes, blue arrows. Label underneath: "text attends to most recent image only".',
      },
    ],
    takeaways: [
      'Gated cross-attention adds vision between frozen LLM layers: y = tanh(alpha) * cross + x, with alpha at zero, so day-zero behavior is pure LLM.',
      'The Perceiver resampler turns any number of patches into exactly 64 tokens, giving variable image counts a fixed interface.',
      'Few-shot multimodal prompting works because the frozen LLM\'s in-context learning survives the additive gate.',
      'When a multimodal fine-tune degrades text quality, suspect the gate schedule before the data.',
    ],
    terms: [
      { term: 'Perceiver resampler', gloss: '"Fixed-latent cross-attention"', meaning: 'A module with 64 learnable latent vectors that cross-attend over however many patch tokens an image produced, always emitting exactly 64 tokens.' },
      { term: 'Gated cross-attention', gloss: '"Tanh-gated bridge"', meaning: 'A residual layer y = tanh(alpha) * cross_attention + x, with a learnable alpha initialized to zero.' },
      { term: 'Interleaved input', gloss: '"Mixed sequence"', meaning: 'A prompt format where images and text mix freely in reading order, like a web page.' },
      { term: 'Frozen LLM', gloss: '"No LLM gradients"', meaning: 'The text LLM\'s weights never update; only the resampler and cross-attention layers train.' },
      { term: 'Few-shot prompt', gloss: '"In-context examples"', meaning: 'A handful of (image, answer) pairs placed in the prompt; the model generalizes to a new example with no fine-tuning.' },
      { term: 'OBELICS', gloss: '"Interleaved web corpus"', meaning: 'The open 141M-page dataset of web documents with images in natural reading order, used by Flamingo\'s open descendants.' },
      { term: 'Chinchilla', gloss: '"70B frozen base"', meaning: 'DeepMind\'s 70B-parameter text LLM, trained separately, that Flamingo wires vision into without touching its weights.' },
      { term: 'Gate schedule', gloss: '"How alpha moves"', meaning: 'The rate at which the cross-attention gate opens during training; too fast erodes the LLM\'s text ability.' },
      { term: 'Cross-attention frequency', gloss: '"Every M layers"', meaning: 'How often a gated cross-attention block is inserted between frozen LLM blocks; Flamingo uses M=4.' },
      { term: 'OpenFlamingo', gloss: '"Open reproduction"', meaning: 'A 3B-to-9B open checkpoint on LLaMA or MPT bases, architecturally identical to Flamingo but trained on less data.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Flamingo-9B has a 9B frozen LLM, 1.4B trained cross-attention parameters, and a 64M resampler. What fraction of the total model actually trains?' },
      { level: 'medium', prompt: 'At alpha = 0, tanh(alpha) = 0 and the gated layer is a no-op. At alpha = 2, tanh(2) is about 0.96. Describe in one sentence what a visual contribution at 96% strength means for the residual output.' },
      { level: 'hard', prompt: 'Flamingo masks cross-attention so a text token sees only the most recent preceding image, not every image before it. Read Flamingo section 2.4 (arXiv:2204.14198) and explain the tradeoff against attending to all preceding images.' },
      { level: 'design', prompt: 'Sketch a UI affordance for a chat thread with three pasted screenshots. When the model answers a question about screenshot C, how do you show the user which image the model is actually attending to, given the masking rule only looks at the most recent one?' },
    ],
    furtherReading: [
      { label: 'Alayrac et al. - Flamingo (arXiv:2204.14198)', url: 'https://arxiv.org/abs/2204.14198', why: 'The original paper; section 2.4 covers the masked cross-attention rule.' },
      { label: 'Awadalla et al. - OpenFlamingo (arXiv:2308.01390)', url: 'https://arxiv.org/abs/2308.01390', why: 'The open reproduction; section 3.2 explains batching prompts with different image counts.' },
      { label: 'Laurençon et al. - OBELICS (arXiv:2306.16527)', url: 'https://arxiv.org/abs/2306.16527', why: 'The open interleaved web corpus that Flamingo\'s descendants train on.' },
      { label: 'Jaegle et al. - Perceiver IO (arXiv:2107.14795)', url: 'https://arxiv.org/abs/2107.14795', why: 'The general Perceiver architecture the resampler borrows from.' },
      { label: 'Laurençon et al. - Idefics2 (arXiv:2405.02246)', url: 'https://arxiv.org/abs/2405.02246', why: 'Shows how the field simplified Flamingo\'s bridge over two years.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Gated-bridge diagnostic checklist',
      body: '- Does the model have a resampler (fixed token count regardless of image size), or does token count scale with resolution?\n- What is the cross-attention frequency (every N layers)? Lower N means more visual influence per layer.\n- Is there a learnable gate initialized near zero, or does vision mix in at full strength from step one?\n- If a fine-tuned checkpoint answers worse on text-only prompts than its base model, check whether the gate schedule opened too fast before checking the data.\n- Does the prompt format support more than one image? If not, this is a BLIP-2-style bridge, not a Flamingo-style one.',
    },
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
      'LLaVA (2023) swapped BLIP-2\'s Q-Former for a two-layer MLP and trained on 158k instruction turns GPT-4 wrote from text captions alone. It became the most copied multimodal architecture on the planet.',
    readTime: '~10 min read',
    diagram: '/lessons/p12-05.svg',
    diagramCaption:
      'The LLaVA pipeline: ViT patches, a two-layer MLP projector into LLM space, and the <image> placeholder in the prompt replaced by 576 visual tokens.',
    whyItMatters:
      'LLaVA is the reason small teams ship vision features at all: the whole recipe runs in about a day on one 8-GPU node and the checkpoint is open. Two of its moves matter for product thinking. First, simplicity beat cleverness once contexts grew, a pattern worth recognizing before betting on an intricate architecture. Second, its training data was synthesized by a stronger model from text alone, which means data pipelines, not annotation budgets, decide what a model learns. When you scope a domain-specific vision feature, the LLaVA data recipe is the cost model to reason from.',
    learningObjectives: [
      'Build the mental model of a two-layer MLP projector mapping 1024-dim ViT patches to a 4096-dim LLM embedding space.',
      'Walk the two-stage LLaVA recipe: projector alignment on 558k caption pairs, then instruction tuning on 158k GPT-4-written turns.',
      'Explain why GPT-4 could write useful visual-instruction data despite never seeing the images.',
      'Compare Q-Former and MLP bridges on token budget, coupling, and multi-image support.',
      'Compute how many tokens a 576-token image costs at 2048, 8k, and 32k context sizes.',
    ],
    sections: [
      {
        heading: 'The problem: the clever bridge had a bottleneck',
        body: 'BLIP-2\'s Q-Former (lesson 12.03) compresses an image to 32 tokens, which is elegant but lossy. Stage 1 trains the queries on three proxy losses at once, image-text contrastive, image-text matching, and image-grounded text generation, none of which is the LLM\'s actual language-modeling objective. Stage 2 then asks the LLM to decode whatever the queries learned. Detail dies in that bottleneck.\n\nWorse, the 188M-parameter Q-Former had to be co-designed with its target LLM. Swap the LLM, retrain the bridge. Swap the vision encoder, retrain again. Every new pairing was its own research project, not a configuration change.',
      },
      {
        heading: 'The fix: project everything, compress nothing',
        body: 'LLaVA\'s answer, from Liu et al. in April 2023, was embarrassing in its simplicity. Take all 576 patch tokens a CLIP ViT-L/14 produces at 336px, push each through a two-layer MLP with a GELU activation (1024 to 4096 to 4096 dimensions) into the LLM\'s embedding space, and concatenate them straight into the prompt where an `<image>` placeholder used to sit.\n\nNo compression, no proxy objectives, just one language-modeling loss end to end. The image now occupies 576 tokens of context: at 2048 tokens that is more than a quarter of the budget, at 32k it is a rounding error.',
      },
      {
        heading: 'The data trick: GPT-4 wrote the training set',
        body: 'The second insight was where the instruction data came from. Take a COCO image\'s five human captions and its bounding-box list, hand that text, not the pixels, to GPT-4, and prompt it three ways: write a back-and-forth conversation, write a detailed description, or ask a complex reasoning question and answer it.\n\nParsing the outputs yielded 158k instruction-response turns with zero human annotation. GPT-4 hallucinated some plausible-but-wrong details since it never saw the image, but the noise was survivable: 158k turns was enough to unlock genuine dialogue about images. The same four-step pipeline (caption, prompt, generate, parse) can be rerun cheaply for any new domain, medical scans or satellite imagery included.',
      },
      {
        heading: 'The recipe: two stages, one day, one node',
        body: 'Stage 1 freezes the ViT and the LLM and trains only the MLP, about 22M parameters, on 558k image-caption pairs from LAION-CC-SBU. A few hours at batch 128 teaches the projector to map ViT space into LLM space with no task-specific supervision.\n\nStage 2 unfreezes the LLM and trains on the 158k instruction turns. About 20 hours on 8 A100s. That number, not the architecture, is why LLaVA spread: one day, one node, reproducible, and the LLM is swappable (Vicuna, Llama, Mistral) by retraining a projector that costs almost nothing next to the base model. By late 2023 there were more than 50 forks.',
      },
      {
        heading: 'Why simple beat clever',
        body: 'The Q-Former\'s one real advantage was token budget: 32 tokens versus LLaVA\'s 576 per image. Through 2023 and 2024, LLM context windows grew from 2k to 32k and beyond, and that budget stopped binding. What remained was the MLP\'s advantages: more detail preserved per image, one loss end to end instead of three, natural extension to multiple images and video by concatenation, and a trivial swap of the LLM underneath.\n\nAt 2048 context an image ate a quarter of the budget; at 32k it is under 2%. The constraint the clever design optimized for simply evaporated, and nothing else about the Q-Former\'s cleverness survived the trade.',
      },
      {
        heading: 'What LLaVA became',
        body: 'LLaVA-1.5 (October 2023) added academic VQA data and stretched context to 32k. LLaVA-NeXT (January 2024) added AnyRes: tile a high-resolution image into 336px crops plus a global thumbnail, roughly 2880 visual tokens for a 672x672 image, and OCR and chart benchmarks jumped. LLaVA-OneVision (lesson 12.08) unified single-image, multi-image, and video under one shared token budget and training curriculum.\n\nThe through-line across every generation: the projector never got smarter. The data and the resolution strategy did. Any practitioner who built a VLM between 2023 and 2026 built some variant of this recipe, whether they knew LLaVA\'s name or not.',
      },
      {
        heading: 'Q-Former vs MLP, side by side',
        body: '| | Q-Former (BLIP-2) | MLP (LLaVA) |\n|---|---|---|\n| Visual tokens per image | 32 | 576 (base), 2880 with AnyRes |\n| Trainable bridge params | 188M | ~22M |\n| Stage 1 loss | ITC + ITM + ITG | Language modeling only |\n| Swap the LLM | Retrain the bridge | Retrain a cheap projector |\n| Multi-image, video | Awkward | Concatenate and go |\n| Training cost | Days on 8 A100s | ~20 hours on 8 A100s |\n\nThe table looks like a tie until you read the last two rows. A bridge that survives an LLM swap and a multi-image prompt without redesign is the one an ecosystem builds on top of.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p12-05-inline-context.svg',
        alt: 'Image token share of context window by size',
        caption: '576 visual tokens cost a quarter of a 2048-token context and under 2% of a 32k one.',
        diagramBrief:
          'Three horizontal bar charts stacked, each showing a context window as a full bar: 2048 tokens (576 shaded blue, rest black outline), 8192 tokens (576 shaded, much smaller share), 32768 tokens (576 shaded, sliver). Cream paper background, black ink bars, blue fill for the image-token portion. Label each bar with its total and the resulting percentage.',
      },
      {
        src: '/lessons/p12-05-inline-pipeline.svg',
        alt: 'GPT-4 instruction-data generation pipeline',
        caption: 'GPT-4 never saw the pixels; it wrote 158k instruction turns from captions and boxes alone.',
        diagramBrief:
          'Left to right flow: box "COCO image" with a dotted line (not solid) to a box "5 captions + bounding boxes" (solid line, meaning this is what GPT-4 actually receives), arrow to "GPT-4 (text-only)" box, arrow branching into three output boxes: "conversation", "detailed description", "reasoning Q+A". Cream paper, black ink, one blue accent on the GPT-4 box. Caption underneath: "158k turns, zero human annotation."',
      },
    ],
    takeaways: [
      'A two-layer MLP projecting all patch tokens into the LLM beat compressive bridges once contexts grew past the token-budget constraint.',
      'LLaVA\'s instruction data was written by GPT-4 from captions alone: synthesized data pipelines, not annotation, set the training cost.',
      'The full recipe runs in ~20 hours on one 8xA100 node, which is why it spawned 50+ forks and became the default.',
      'When an architecture and its simpler rival tie on quality, the one with fewer coupled parts wins the ecosystem.',
    ],
    terms: [
      { term: 'MLP projector', gloss: '"The bridge"', meaning: 'A two-layer MLP with a GELU activation mapping each ViT patch embedding into the LLM\'s embedding dimension.' },
      { term: 'Image placeholder', gloss: '"<image> tag"', meaning: 'The <image> marker in the prompt template, replaced by the projected visual tokens before the LLM runs.' },
      { term: 'Visual instruction tuning', gloss: '"Stage 2 training"', meaning: 'Fine-tuning on (image, instruction, response) triplets so the model converses about images instead of only captioning them.' },
      { term: 'Stage 1 alignment', gloss: '"Projector pretraining"', meaning: 'Training only the projector on caption pairs with both the ViT and LLM frozen, to align the two embedding spaces.' },
      { term: 'AnyRes', gloss: '"Multi-crop tiling"', meaning: 'Splitting a high-resolution image into a grid of fixed-size tiles plus one thumbnail, then concatenating every tile\'s tokens.' },
      { term: 'ShareGPT4V', gloss: '"Better captions"', meaning: 'A dataset of about 1M dense, GPT-4V-written image captions used to improve alignment quality in later LLaVA generations.' },
      { term: 'Vision encoder freeze', gloss: '"Backbone locked"', meaning: 'CLIP\'s weights do not update during stage 1, and sometimes stay frozen through stage 2 too.' },
      { term: 'VQA', gloss: '"Visual Q&A"', meaning: 'The task of answering a free-form natural-language question about the content of an image.' },
      { term: 'LLaVA-Instruct-150k', gloss: '"GPT-4-generated data"', meaning: '158k instruction-response pairs synthesized by GPT-4 from COCO captions and bounding boxes, with no human annotators.' },
      { term: 'Prismatic VLMs', gloss: '"The design-space paper"', meaning: 'Karamcheti et al.\'s 2024 controlled ablation study isolating which VLM design choices actually move benchmark scores.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A two-layer MLP projector maps 1024 to 4096 to 4096 dimensions with GELU and bias. Roughly how many parameters is that, and what fraction of a 13B LLaVA model does it represent?' },
      { level: 'medium', prompt: 'A 1344x672 image under LLaVA-NeXT AnyRes uses a 2x1 tile grid plus a thumbnail. Each tile and the thumbnail cost 576 tokens. Compute the total visual token count and compare it to the base 576-token single-crop cost.' },
      { level: 'hard', prompt: 'Prismatic VLMs (arXiv:2402.07865) ablates skipping stage 1 and going straight to stage 2. Read the relevant section and explain what breaks in the projector when alignment pretraining is skipped.' },
      { level: 'design', prompt: 'Sketch the four-step data pipeline (caption, prompt GPT-4, generate, parse) adapted for a new domain: satellite imagery for an insurance-claims product. At which of the four steps is a human reviewer most necessary, and what should their review screen show them?' },
    ],
    furtherReading: [
      { label: 'Liu et al. - Visual Instruction Tuning (arXiv:2304.08485)', url: 'https://arxiv.org/abs/2304.08485', why: 'The original LLaVA paper.' },
      { label: 'Liu et al. - Improved Baselines with Visual Instruction Tuning (arXiv:2310.03744)', url: 'https://arxiv.org/abs/2310.03744', why: 'LLaVA-1.5: what academic VQA data and longer context added.' },
      { label: 'Chen et al. - ShareGPT4V (arXiv:2311.12793)', url: 'https://arxiv.org/abs/2311.12793', why: 'The dense-caption dataset that improved later alignment quality.' },
      { label: 'Karamcheti et al. - Prismatic VLMs (arXiv:2402.07865)', url: 'https://arxiv.org/abs/2402.07865', why: 'The controlled ablation study behind lesson 12.07\'s design-space claims.' },
      { label: 'Li et al. - LLaVA-OneVision (arXiv:2408.03326)', url: 'https://arxiv.org/abs/2408.03326', why: 'Where this recipe unified single-image, multi-image, and video (lesson 12.08).' },
    ],
    shipIt: {
      kind: 'rubric',
      name: 'VLM bridge selection rubric',
      body: '- Token budget: does your context window comfortably fit 576+ tokens per image alongside your system prompt and chat history?\n- Multi-image or video: do you need to concatenate several images in one request? If yes, favor an MLP-style bridge over a fixed-size compressive one.\n- LLM churn: will you swap the base LLM within a year? An MLP projector retrains in hours; a co-designed bridge does not.\n- Data cost: can you synthesize instruction data from existing captions via a strong text-only model, or do you need human annotation?\n- Compute ceiling: one 8-GPU node for a day is the LLaVA bar. If your budget is below that, look at fine-tuning an existing open checkpoint instead of training from scratch.',
    },
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
      'Real images are receipts, charts, and phone screenshots, not 224px squares, and squashing them to fit destroys exactly the detail OCR needs. Patch-n-pack, AnyRes tiling, and M-RoPE are the three ways models learned to eat images at native resolution.',
    readTime: '~10 min read',
    diagram: '/lessons/p12-06.svg',
    diagramCaption:
      'Patch-n-pack: three images of different sizes flattened into one packed sequence, with a block-diagonal mask keeping each image\'s patches attending only to themselves.',
    whyItMatters:
      'Aspect ratio is a product decision wearing an infrastructure costume. If your users upload receipts, documents, or phone screenshots, a model that square-resizes will silently misread the small print, and no prompt fixes it. The counterweight is cost: native resolution on a large document can be thousands of tokens, and tiling multiplies that. The 2026 knob is a per-task pixel cap (Qwen exposes it as min_pixels and max_pixels), effectively a quality slider your product sets per feature. Knowing these three strategies tells you which failure you will see: distortion, blowup, or both.',
    learningObjectives: [
      'Name the three failure modes of square-resizing an image before a VLM ever sees it.',
      'Explain how patch-n-pack batches variable-resolution images in one sequence using a block-diagonal attention mask.',
      'Compare AnyRes tiling, M-RoPE, and NaFlex on token cost, encoder compatibility, and multiplicative overhead.',
      'Compute the visual token count for a given image size under square-resize, AnyRes, and native-resolution encoding.',
      'Set a per-task pixel cap (min_pixels / max_pixels) that matches token spend to content density.',
    ],
    sections: [
      {
        heading: 'The problem: the world is not square',
        body: 'Transformers want equal-length sequences per batch, and a fixed 224x224 input delivers exactly that: 196 tokens every time, no padding logic required. But documents are portrait at roughly 2:3, charts run 16:9, receipts are tall and thin at 1:3, and a typical phone screenshot is 1170x2532, nearly 1:2.2.\n\nThree pre-2024 workarounds each fail in a named way. Resize to a square and text squishes, chart labels dissolve below patch resolution. Crop to a fixed ratio and you throw away most of the image, and picking the crop location becomes its own vision problem. Pad to the longest side and distortion disappears, but half your tokens are padding, and attention still pays its full quadratic cost on them.',
      },
      {
        heading: 'Patch-n-pack: one sequence, many shapes',
        body: 'NaViT (Dehghani et al., Google, 2023) showed the mechanical fix. Patch each image at its native size, flatten each into its own variable-length run, concatenate all the runs into one long batch sequence, and build a block-diagonal attention mask so image A\'s patches attend only within image A.\n\nThree images of 576, 256, and 768 tokens become one 1600-token sequence with zero padding and zero wasted compute. FlashAttention\'s variable-length path skips the dense mask entirely, using a cumulative-length tensor called `cu_seqlens` instead, roughly 10x faster than a dense mask for typical batches. Fractional patch dropping, discarding 50% of patches at random during training, regularizes the model further and speeds it up; SigLIP 2 inherited both tricks.',
      },
      {
        heading: 'AnyRes: tiling when the encoder is frozen',
        body: 'If your encoder only speaks 336x336, LLaVA-NeXT\'s AnyRes is the pragmatic route: pick the grid layout (1x2, 2x2, 1x3, and so on) that best fits the image\'s aspect ratio, cut the image into 336px tiles, encode each tile through the frozen encoder, and add one full-image thumbnail for global context.\n\nThe cost is multiplicative. A 672x672 image at a 2x2 grid plus thumbnail comes to 4 x 576 + 576 = 2880 tokens. A 1344x1344 image at a 4x4 grid runs to roughly 9800 tokens, nearly filling an 8k context on one image. AnyRes buys frozen-encoder compatibility at that price, which is why it suits high-value document reads more than casual photo chat.',
      },
      {
        heading: 'M-RoPE: native resolution as a position, not a tile',
        body: 'Qwen2-VL\'s M-RoPE removes position tables entirely. Each patch carries a 3D position, time, row, and column, and rotary embeddings handle any height, width, or frame count without a lookup table to outgrow. Feed the encoder any HxW divisible by 28, get H/14 by W/14 tokens back, no tiles, no thumbnail, no multiplicative overhead.\n\nAn 1120x672 image yields 960 tokens directly, the same order of magnitude as a single AnyRes tile but without stacking four of them. The tradeoff: M-RoPE still expects one image per forward pass; batching across many different resolutions in one training step still needs patch-n-pack layered on top.',
      },
      {
        heading: 'NaFlex: one checkpoint, several token budgets',
        body: 'SigLIP 2\'s NaFlex mode packages the patch-n-pack idea for encoders specifically: one checkpoint serves 256, 729, or 1024-token budgets at inference, chosen per request with no retraining. A semantic task like classification or retrieval gets 256 tokens. OCR or chart reading gets 1024.\n\nThe token budget became a runtime parameter instead of an architecture decision baked in at training time. That shift is what makes a per-feature quality setting possible in a product: the same encoder checkpoint can serve a thumbnail-grade photo feed and a document-reading feature, at different costs, without maintaining two models.',
      },
      {
        heading: 'Token budgets by task',
        body: 'The 2026 production rule: set a per-task max-pixels cap, encode at native aspect ratio up to that cap, pack the batch, and skip padding entirely. Working numbers from current open VLMs: OCR and documents want 1024 to 4096 tokens, charts and UI screenshots 729 to 1024, natural photos are fine at 256 to 576 because the LLM does not need more detail than that, and video runs 64 to 128 tokens per frame after pooling.\n\nSpend tokens where content density is high. A receipt with forty line items deserves more budget than a beach photo with ten times its pixel count and one subject.',
      },
      {
        heading: 'Square-resize vs native packing, side by side',
        body: '| | Square-resize | AnyRes tiling | M-RoPE / NaFlex |\n|---|---|---|---|\n| Aspect ratio | Forced to 1:1 | Preserved via tiles | Preserved natively |\n| Token cost | Fixed, low | Multiplicative | Linear in pixel count |\n| Small print / OCR | Destroyed below patch resolution | Preserved per tile | Preserved |\n| Encoder requirement | Any fixed-res encoder | Any fixed-res encoder | Needs a native-res-capable encoder |\n| Failure mode | Squish | Token explosion on large images | Cost scales predictably, no distortion |\n\nA product that only ever sees square-ish photos may never notice square-resize\'s cost. A product that sees one receipt is telling you which row of this table it lives in.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p12-06-inline-patchpack.svg',
        alt: 'Patch-n-pack batching three images into one sequence',
        caption: 'Three images of different native sizes become one packed sequence with a block-diagonal mask.',
        diagramBrief:
          'Three rectangles of different aspect ratios on the left labeled "576 tok", "256 tok", "768 tok". Arrow to a single long horizontal strip divided into three shaded sections matching those lengths, labeled "1600-token packed sequence". Below it, a small square block-diagonal matrix icon (three shaded squares on the diagonal, rest blank) labeled "attention mask". Cream paper, black ink, one blue accent per image section matched across both diagrams.',
      },
      {
        src: '/lessons/p12-06-inline-tokenbudget.svg',
        alt: 'Token budget by content type',
        caption: 'OCR and documents earn the largest token budget; natural photos need the least.',
        diagramBrief:
          'Horizontal bar chart, four bars: "Natural photo" (256-576), "Charts / UI" (729-1024), "OCR / documents" (1024-4096), "Video per frame" (64-128). Cream paper background, black ink bars, blue fill proportional to the upper bound of each range. Label each bar with its token range.',
      },
    ],
    takeaways: [
      'Square-resize has three named failure modes: squished text, cropped content, wasted padding tokens. OCR complaints usually trace to the first.',
      'Patch-n-pack batches variable-size images in one sequence with a block-diagonal mask: zero padding, zero distortion.',
      'AnyRes tiling rescues frozen encoders at multiplicative token cost; M-RoPE gets native resolution linearly.',
      'A per-task pixel cap (min_pixels / max_pixels) is the production knob: it is a quality slider your product sets per feature.',
    ],
    terms: [
      { term: 'Patch-n-pack', gloss: '"NaViT-style packing"', meaning: 'Concatenating variable-length patch sequences from different images into one batch sequence with no padding.' },
      { term: 'Block-diagonal mask', gloss: '"Packing mask"', meaning: 'The attention mask that confines each image\'s patches to attend only within their own block, not their neighbors in the pack.' },
      { term: 'AnyRes', gloss: '"LLaVA-NeXT tiling"', meaning: 'Splitting a high-resolution image into a grid of fixed-size tiles plus a global thumbnail, then encoding every tile with a fixed-resolution encoder.' },
      { term: 'NaFlex', gloss: '"SigLIP 2 native-flex"', meaning: 'A single SigLIP 2 checkpoint that serves 256, 729, or 1024-token budgets at inference without retraining.' },
      { term: 'M-RoPE', gloss: '"Multimodal RoPE"', meaning: '3D rotary position encoding (time, row, column) that handles any resolution or frame count without a position table.' },
      { term: 'cu_seqlens', gloss: '"FlashAttention packing"', meaning: 'The cumulative-length tensor FlashAttention\'s variable-length path uses instead of building a dense block-diagonal mask.' },
      { term: 'min_pixels / max_pixels', gloss: '"Resolution bounds"', meaning: 'Qwen2.5-VL\'s per-request knobs capping total image pixel count, and therefore token count, latency, and cost.' },
      { term: 'Visual token budget', gloss: '"How many tokens per image"', meaning: 'The count of patch tokens emitted per image, which sets both the LLM\'s prompt budget and the attention compute cost.' },
      { term: 'Fractional patch dropping', gloss: '"Patch dropout"', meaning: 'Randomly discarding a fraction of patches during training to regularize and speed up training; inherited by SigLIP 2 from NaViT.' },
      { term: 'Native resolution', gloss: '"No resize"', meaning: 'Encoding an image at its actual pixel dimensions rather than resizing or cropping it to a fixed shape first.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A receipt is 600x1500 pixels. At patch size 14, how many native-resolution tokens does it produce? How many after a square-resize to 336x336?' },
      { level: 'medium', prompt: 'A 1920x1080 video frame at patch 14 costs how many tokens per frame if encoded whole? At 30 fps over 5 minutes, how many total tokens before any pooling?' },
      { level: 'hard', prompt: 'Build the block-diagonal mask for a packed batch of four images with lengths 256, 576, 729, and 1024 tokens. Verify the full attention matrix is 2585x2585 and count exactly how many entries are non-zero.' },
      { level: 'design', prompt: 'Sketch an "image detail" setting for a chat product with three options: low, medium, high. What does each option send to the model in terms of token budget, and how do you explain the tradeoff in one line of microcopy next to the toggle?' },
    ],
    furtherReading: [
      { label: 'Dehghani et al. - Patch n\' Pack: NaViT (arXiv:2307.06304)', url: 'https://arxiv.org/abs/2307.06304', why: 'The paper that proved variable-resolution packing works at scale.' },
      { label: 'Wang et al. - Qwen2-VL (arXiv:2409.12191)', url: 'https://arxiv.org/abs/2409.12191', why: 'M-RoPE and native dynamic resolution, read section 3.2 on min_pixels / max_pixels.' },
      { label: 'Laurençon et al. - Idefics2 (arXiv:2405.02246)', url: 'https://arxiv.org/abs/2405.02246', why: 'Formalizes the resolution-schedule axis against the rest of the VLM design space.' },
      { label: 'Tschannen et al. - SigLIP 2 (arXiv:2502.14786)', url: 'https://arxiv.org/abs/2502.14786', why: 'NaFlex: one checkpoint, several inference-time token budgets.' },
      { label: 'Qwen Team - Qwen2.5-VL Technical Report (arXiv:2502.13923)', url: 'https://arxiv.org/abs/2502.13923', why: 'Production-grade min_pixels / max_pixels knobs in a shipping model.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Resolution strategy checklist',
      body: '- What aspect ratios does your product actually receive? Portrait documents, wide charts, and tall receipts each break square-resize differently.\n- Is your vision encoder fixed-resolution (needs AnyRes tiling) or native-resolution-capable (M-RoPE, NaFlex)?\n- What per-task pixel cap fits your latency budget? Set min_pixels and max_pixels deliberately, not at the library default.\n- Does a single feature need more than one token budget (a thumbnail feed vs a document reader)? If yes, that is two configurations of one encoder, not two models.\n- Before shipping, test on your worst-case aspect ratio, not your best-case square photo.',
    },
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
      'MM1, Idefics2, Molmo, Cambrian-1, and Prismatic ran hundreds of controlled ablations on VLM design. The verdict: visual token count and encoder choice explain most of the quality gap; the connector everyone argues about explains almost none.',
    readTime: '~10 min read',
    diagram: '/lessons/p12-07.svg',
    diagramCaption:
      'The five-axis VLM design space: encoder, connector, LLM, data mix, resolution schedule, sized by how much benchmark variance each axis explains.',
    whyItMatters:
      'This lesson is a prioritization exercise, and prioritization is design work. When a vision feature underperforms, the instinct is to debate architecture; the ablation literature says look at resolution, token budget, and data quality first, because that is where the variance lives. The Molmo result generalizes beyond ML: 712k dense human captions beat a larger competitor\'s distilled synthetic data on every benchmark. Quality of input beats quantity of machinery. If you ever help scope an AI training effort or evaluate a vendor\'s claims, knowing which axis moves the needle is the difference between a useful question and a decorative one.',
    learningObjectives: [
      'Name the five-axis VLM design space: image encoder, connector, LLM, data mix, resolution schedule.',
      'Read an ablation table (MM1, Idefics2, Cambrian-1) and predict which axis moved a given benchmark score.',
      'Explain why Molmo\'s human-captioned data beat a larger model\'s distilled synthetic captions on every benchmark.',
      'Rank the five design axes by how much benchmark variance each explains, per Prismatic\'s controlled decomposition.',
      'Pick a 2026-default recipe (encoder, connector, LLM, data, resolution) for a given compute budget and task mix.',
    ],
    sections: [
      {
        heading: 'The problem: a forest of ablation tables',
        body: 'Hundreds of open VLMs exist, and most of the gap between good and state-of-the-art is not architecture. Apple\'s MM1 tested 13 encoder-connector-data combinations. Idefics2 formalized the design space into five axes: image encoder, connector, LLM, data mix, resolution schedule. Cambrian-1 compared more than 20 encoders on a vision-centric benchmark. Prismatic VLMs ran 27 recipes with everything else held constant.\n\nThe practical stake: knowing which knob to turn first when a model underperforms saves a multi-million-GPU-hour mistake. Out of all those tables, a handful of results replicate everywhere, and this lesson is those results, not the tables.',
      },
      {
        heading: 'Encoder beats connector',
        body: 'MM1\'s ablation: swapping CLIP ViT-L for SigLIP SO400m added more than 3 points on MMMU; swapping the connector from an MLP to a Perceiver resampler added less than 1. Idefics2 replicated the finding independently. Cambrian-1\'s 20-plus-encoder match-up put DINOv2 and SigLIP at the top of vision-centric benchmarks with CLIP mid-pack, a 5 to 7 point spread on CV-Bench.\n\nThe 2026 default is SigLIP 2 SO400m for semantics, sometimes concatenated with DINOv2 features when dense tasks like grounding or segmentation matter. The encoder is the model\'s retina; the connector is wiring, and wiring, it turns out, is fungible.',
      },
      {
        heading: 'The connector is a wash; the token count is not',
        body: 'At a fixed visual-token count, a 2-layer MLP performs within a point of a 32-query Q-Former. Four independent papers, MM1, Idefics2, Prismatic, and MM-Interleaved, agree on this. What actually moves quality is how many tokens the LLM receives per image: 64 is too few for OCR, 576 to 1024 is the sweet spot for most tasks, and 2048 or more only pays off on documents and charts.\n\nPrismatic\'s controlled decomposition puts numbers on it: per-image token count explains about 60% of benchmark variance, encoder choice about 20%, connector architecture about 5%, and everything else, data mix, learning-rate schedule, the rest, the remaining 15%. Ablate in that order, not in order of what is newest.',
      },
      {
        heading: 'Data: human captions beat distillation',
        body: 'Allen AI\'s Molmo is the data result to remember. Annotators described images in 1 to 3 minute spoken passes, transcribed into 712k dense captions that became the PixMo dataset. No GPT-4V distillation anywhere in the training data. Molmo-72B beat Llama-3.2-90B-Vision, a model 25% larger, on 11 of 11 benchmarks.\n\nThe delta is caption quality: a dense human caption carries 5 to 10x the information of typical web alt text and stays factually grounded, where distilled synthetic captions inherit the teacher model\'s hallucinations. The 2026 ordering: caption density beats caption quantity beats distillation convenience. LLM size still sets a ceiling on top of this, doubling 7B to 13B reliably adds 2 to 4 MMMU points regardless of data quality.',
      },
      {
        heading: 'Resolution and its schedule',
        body: 'Idefics2\'s ablations found that going from 384 to 448 resolution adds 1 to 2 points, and 448 to 980 with image splitting (AnyRes-style) adds another 3 to 5 points on OCR benchmarks specifically, with little effect elsewhere. Flat resolution training, the same resolution for the whole run, plateaus at medium accuracy; ramping resolution up over training, starting at 224 and finishing at 448 or native, trains faster and ends higher on identical compute.\n\nCambrian-1 frames this as a trade at fixed compute: more tokens at lower resolution, or fewer tokens at higher resolution. Higher resolution wins for OCR-heavy tasks; lower resolution with more tokens wins for general scene understanding. The 2026 production recipe trains stage 1 at a fixed 384, then ramps stage 2 up to 1280 for OCR-heavy targets.',
      },
      {
        heading: 'The 2026 default recipe',
        body: 'Every default below traces to a measured ablation, not a guess. Encoder: SigLIP 2 SO400m at native resolution with NaFlex, plus DINOv2 if grounding matters. Connector: a 2-layer MLP; skip the Q-Former unless the deployment is genuinely token-constrained. LLM: 7B class for cost, 70B class for quality, chosen by latency target, not preference. Data: PixMo, ShareGPT4V, and Cauldron, topped with task-specific instructions. Resolution: dynamic, 256 to 1280 pixels per long side, ramped during training since flat schedules plateau lower.\n\nStage 1 aligns the projector, stage 2 fine-tunes fully, stage 3 specializes for the deployment task mix. Boring, measured, and it works, which is the entire point of running 27 ablations instead of trusting intuition.',
      },
      {
        heading: 'Where the benchmark points actually come from',
        body: '| Design axis | Share of benchmark variance (Prismatic) | Typical point swing |\n|---|---|---|\n| Visual token count per image | ~60% | 64 to 1024 tokens: several points on OCR |\n| Encoder choice | ~20% | CLIP to SigLIP: 3+ points MMMU |\n| Data mix, schedule, LR, rest | ~15% | Human vs distilled captions: up to 11/11 benchmark wins |\n| Connector architecture | ~5% | MLP to Q-Former: under 1 point |\n\nRead this table before your next architecture debate. The axis with the most opinions attached to it, the connector, is the one that moves the least.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p12-07-inline-decomposition.svg',
        alt: 'Prismatic\'s variance decomposition across five VLM design axes',
        caption: 'Token count explains about 60% of benchmark variance; the connector explains about 5%.',
        diagramBrief:
          'Horizontal stacked bar (one bar, 100% wide) divided into four segments proportional to 60/20/15/5, labeled "visual token count", "encoder choice", "data + schedule", "connector". Cream paper background, black ink outline, blue fill on the largest (60%) segment to draw the eye there first. Caption beneath: "ablate in this order."',
      },
      {
        src: '/lessons/p12-07-inline-molmo.svg',
        alt: 'Molmo vs Llama-3.2-90B-Vision on 11 benchmarks',
        caption: 'A smaller model trained on dense human captions beat a 25% larger model trained on distilled data, 11 out of 11.',
        diagramBrief:
          '11 small paired bar-pairs in a row, each pair representing one benchmark, Molmo-72B bar taller than Llama-3.2-90B-Vision bar in every pair. Cream paper, black ink bars, blue fill for the Molmo bars. Label: "Molmo-72B (human captions) vs Llama-3.2-90B-Vision (distilled), 11 for 11."',
      },
    ],
    takeaways: [
      'Prismatic\'s decomposition: visual token count ~60% of variance, encoder ~20%, connector ~5%. Ablate in that order.',
      'The encoder swap (CLIP to SigLIP) is worth 3+ benchmark points; the connector debate is worth less than 1.',
      'Molmo\'s 712k dense human captions beat a 90B model trained on distilled data on 11 of 11 benchmarks: input quality beats machinery.',
      'LLM size sets the reasoning ceiling; the vision encoder can only feed it, never reason for it.',
    ],
    terms: [
      { term: 'Ablation', gloss: '"Turning one knob"', meaning: 'A set of training runs that differ in exactly one design-space axis, holding everything else constant, so that axis\'s effect can be measured.' },
      { term: 'Connector', gloss: '"Bridge" or "projector"', meaning: 'The trainable module mapping vision encoder output into the LLM\'s token space: an MLP, a Q-Former, or a Perceiver resampler.' },
      { term: 'Dense caption', gloss: '"Detailed caption"', meaning: 'A multi-sentence human-written description, typically 80 to 300 tokens, far richer than a short web alt-text caption.' },
      { term: 'Distillation', gloss: '"GPT-4V captions"', meaning: 'Training data generated by a stronger proprietary model rather than a human; convenient, but any hallucination in the teacher model is inherited by the student.' },
      { term: 'Resolution ramp', gloss: '"Curriculum"', meaning: 'A training schedule that starts at low image resolution and increases it over the run; trains faster and ends more accurate than a flat schedule.' },
      { term: 'Vision-centric benchmark', gloss: '"CV-Bench"', meaning: 'An evaluation designed to stress fine-grained visual perception specifically, rather than language-heavy reasoning about an image.' },
      { term: 'PixMo', gloss: '"Molmo\'s data"', meaning: 'Allen AI\'s 712k-image dataset of dense human captions, transcribed from 1-to-3-minute spoken descriptions.' },
      { term: 'Five-axis design space', gloss: '"VLM recipe"', meaning: 'Idefics2\'s framing of every VLM design choice as a pick along five axes: encoder, connector, LLM, data mix, resolution schedule.' },
      { term: 'Variance decomposition', gloss: '"What actually moved the score"', meaning: 'Prismatic\'s controlled attribution of benchmark movement to each design axis, expressed as a rough percentage share.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'MM1 found swapping CLIP ViT-L for SigLIP SO400m adds 3+ MMMU points, while swapping the connector adds under 1. If a colleague proposes redesigning the connector to chase a 2-point benchmark gain, what should you check first?' },
      { level: 'medium', prompt: 'Idefics2 found 384 to 448 resolution adds 1 to 2 points, and 448 to 980 with AnyRes-style splitting adds 3 to 5 more, concentrated on OCR benchmarks. If your product has no OCR use case, which resolution would you actually ship, and why?' },
      { level: 'hard', prompt: 'Read Cambrian-1\'s "Cambrian Vision Encoders Match-Up" section. It finds concatenating DINOv2 and SigLIP features outperforms either alone on vision-centric benchmarks but adds no signal on MMMU. Explain why a benchmark can be indifferent to an encoder upgrade that clearly helps perception.' },
      { level: 'design', prompt: 'You are scoping a vision feature for a mobile UI agent running on a 2B-parameter LLM. Using the five-axis framework, pick an encoder, connector, resolution, and data mix, and justify each choice with a specific ablation result from this lesson.' },
    ],
    furtherReading: [
      { label: 'McKinzie et al. - MM1 (arXiv:2403.09611)', url: 'https://arxiv.org/abs/2403.09611', why: 'The 13-combination ablation behind the encoder-vs-connector finding.' },
      { label: 'Laurençon et al. - Idefics2 / What matters when building VLMs (arXiv:2405.02246)', url: 'https://arxiv.org/abs/2405.02246', why: 'Names the five-axis design space this lesson is built around.' },
      { label: 'Deitke et al. - Molmo and PixMo (arXiv:2409.17146)', url: 'https://arxiv.org/abs/2409.17146', why: 'The human-caption-beats-distillation result, with the 11-of-11 benchmark table.' },
      { label: 'Tong et al. - Cambrian-1 (arXiv:2406.16860)', url: 'https://arxiv.org/abs/2406.16860', why: 'The 20-plus encoder match-up and the resolution-vs-tokens trade-off.' },
      { label: 'Karamcheti et al. - Prismatic VLMs (arXiv:2402.07865)', url: 'https://arxiv.org/abs/2402.07865', why: 'The controlled 27-recipe study behind the 60/20/15/5 variance decomposition.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'VLM underperformance triage checklist',
      body: '- Check visual token count per image first. Below 576 for a document-heavy task is the most common silent cause.\n- Check encoder choice second. CLIP vs SigLIP alone is worth 3+ MMMU points; confirm you are not on a weaker encoder by default.\n- Check data quality third. Ask whether training captions are human-written or distilled from another model, and how dense they are.\n- Check the connector last, if at all. Swapping MLP for Q-Former or a resampler at fixed token count is rarely the fix.\n- Before proposing an architecture change, write down which axis you expect it to move and by how much. If you cannot, it is a hunch, not an ablation.',
    },
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
      'Single-image, multi-image, and video used to need three separate models. LLaVA-OneVision trained one model for all three by fixing the visual token budget and ordering the training curriculum, and got emergent skills nobody trained for.',
    readTime: '~10 min read',
    diagram: '/lessons/p12-08.svg',
    diagramCaption:
      'One token budget, three allocations: tiles for a single image, moderate resolution for image sets, aggressively pooled frames for video, all landing near the same total.',
    whyItMatters:
      'OneVision explains why one assistant now handles your screenshot, your photo set, and your screen recording without switching models, and why its cost is predictable: the visual budget per request is fixed, only the allocation changes. For product work the deeper lesson is the curriculum. Order of training data determines what a model becomes, the way onboarding order determines what a user learns; perception first, structure second, and reversing it produces a model that talks fluently about images it barely sees. The emergent skills (set-of-mark prompting, screenshot agents) are also a preview: capabilities can appear that nobody specified, which cuts both ways.',
    learningObjectives: [
      'Design a visual-token budget that holds roughly constant across single-image, multi-image, and video inputs.',
      'Explain why training single-image data before multi-image and video data produces a stronger model on identical data.',
      'Describe how bilinear pooling on the 2D patch grid shrinks tokens without losing spatial locality.',
      'Name the three emergent capabilities LLaVA-OneVision reported and what training data each composed from.',
      'Contrast a fixed-budget strategy (OneVision) with a scaling-budget strategy (Qwen2.5-VL) on cost predictability.',
    ],
    sections: [
      {
        heading: 'The problem: three scenarios, three budget shapes',
        body: 'Each input shape stresses a VLM differently. A single image wants maximum resolution, AnyRes tiling at around 2880 tokens, to catch OCR-level detail. Multi-image wants 4 to 8 images at moderate resolution, roughly 576 tokens each, so cross-image reasoning still fits in context. Video wants many frames at low resolution, around 200 tokens per frame, because the signal that matters is temporal, not per-frame detail.\n\nBefore LLaVA-OneVision, the field trained a specialist per shape: LLaVA-1.5 for images, Mantis and VILA for image sets, Video-LLaVA and Video-LLaMA for clips. Each won its own benchmark, and each failed at its neighbors\' tasks the moment you asked.',
      },
      {
        heading: 'The move: fix the total, vary the allocation',
        body: 'LLaVA-OneVision picks a unified budget of roughly 3000 to 4000 visual tokens per sample and spends it differently per scenario. Single image: a 3x3 tile grid plus thumbnail, pooled down to about 1820 tokens. Multi-image: six images at 729 tokens each with no tiling, about 4374 tokens. Video: 32 frames pooled hard to 81 tokens per frame, about 2600 tokens total.\n\nThe LLM never sees a batch that blows its context, whatever the input shape. Pooling happens on the 2D patch grid via bilinear interpolation, shrinking a 24x24 grid to 12x12 or 8x8, not on the flattened token list, so spatial locality survives the shrink.',
      },
      {
        heading: 'The curriculum: order is the mechanism',
        body: 'Training runs in three stages, and the order is load-bearing, not incidental. Stage SI is single-image only, at high resolution: this builds the perceptual base, OCR, fine-grained understanding, before anything else is asked of the model. Stage OV mixes single-image, multi-image, and video under the shared budget, teaching heterogeneous structure on top of that base. Stage TT optionally leans toward the target deployment mix.\n\nThe paper ablates the ordering explicitly: train video-first or multi-image-first and single-image performance ends measurably worse on the exact same data. Structure without a perceptual base yields a model that follows cross-image reasoning patterns while being visually shallow underneath them. Perception first, composition second, is not a slogan here; it is a measured result.',
      },
      {
        heading: 'Emergent skills nobody trained',
        body: 'Three capabilities showed up at inference without any matching training data. Multi-camera reasoning: trained on multi-image and video separately, the model correctly integrates several camera views of a driving scene despite never seeing that exact format. Set-of-mark prompting: annotate objects in an image with numbered marks and the model reasons about "mark 3 relative to mark 7," despite never training on marks. And an iPhone-screenshot agent: shown a screen, it plans the next tap, generalized purely from UI screenshots, workflow video, and before-after image pairs.\n\nEach of these is a composition of trained skills, unlocked by the shared backbone and the curriculum\'s ordering, not by any explicit task-specific data.',
      },
      {
        heading: 'Visual-token pooling in patch-grid space',
        body: 'The unified budget requires pooling, and where you pool matters. OneVision applies bilinear interpolation directly on the 2D patch grid: a 24x24 grid of 576 patches becomes 12x12 (144 tokens, a 2x factor per dimension) or 8x8 (64 tokens, a 3x factor), rather than pooling the flattened 1D token sequence.\n\nPooling in grid space keeps each surviving token an accurate local average of its neighborhood; pooling in sequence space would blend patches that were never spatially adjacent. The pooling factor per scenario is itself a tunable choice: less pooling keeps more tokens and richer detail, more pooling fits more frames or images into the same shared budget.',
      },
      {
        heading: 'The contrast: fixed budget vs scaling budget',
        body: 'Qwen2.5-VL (lesson 12.09) makes the opposite bet. Its token count scales with the input: a one-minute video simply costs more tokens than a five-second clip, with M-RoPE and dynamic FPS absorbing the variety instead of a fixed pooling schedule. LLaVA-OneVision fixes the total budget and scales the pooling factor instead.\n\nThe trade is configurability against predictability. Qwen adapts spend to content; OneVision guarantees a per-request cost regardless of what arrives. The 2025 follow-up, LLaVA-OneVision-1.5, opened the full data and training stack on the same recipe, better base LLM, more data, no architecture change. The curriculum, not the architecture, was the invention worth keeping.',
      },
      {
        heading: 'Reading a OneVision-style budget plan',
        body: '| Scenario | Resolution strategy | Approx. tokens | What it optimizes for |\n|---|---|---|---|\n| Single image | 3x3 tiles + thumbnail, pooled | ~1820 | OCR, fine detail |\n| Multi-image (6 images) | 729 each, no tiling | ~4374 | Cross-image reasoning |\n| Video (32 frames) | Aggressive 3x3 pooling | ~2600 | Temporal signal over per-frame detail |\n\nEvery row spends a similar total; only the shape of the spend changes. That is the entire design: one budget, reallocated per scenario, so a single deployed model has one predictable cost regardless of what a user uploads.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p12-08-inline-curriculum.svg',
        alt: 'Three-stage OneVision curriculum, in order',
        caption: 'Perception (single-image) trains first; structure (multi-image, video) trains second. Reversing the order measurably hurts image performance.',
        diagramBrief:
          'Three sequential stage boxes left to right: "Stage SI: single-image, high-res" then "Stage OV: image + multi-image + video, shared budget" then "Stage TT: deployment mix". Arrows connecting them left to right in black ink. Below, a small red X over a reversed-order arrow (right to left) labeled "reversed order: image benchmarks end lower on identical data". Cream paper background, one blue accent on the correct-order arrows.',
      },
      {
        src: '/lessons/p12-08-inline-pooling.svg',
        alt: 'Bilinear pooling on the 2D patch grid, not the token list',
        caption: 'Pooling a 24x24 grid to 12x12 preserves spatial locality; pooling the flattened token sequence would not.',
        diagramBrief:
          'Two side-by-side grids: left labeled "24x24 patch grid" with a 2x2 block highlighted in blue, right labeled "12x12 pooled grid" with the corresponding single cell highlighted in blue and an arrow connecting the highlighted block to the single cell. Cream paper, black ink grid lines, blue highlight boxes.',
      },
    ],
    takeaways: [
      'One model covers image, multi-image, and video by fixing total visual tokens (~3-4k) and varying the allocation per scenario.',
      'Curriculum order is load-bearing: perception (single-image) first, structure (multi-image, video) second. Reversed, the model is visually shallow.',
      'Pooling on the 2D patch grid, not the token list, is how frames shrink to 81 tokens without losing spatial locality.',
      'Emergent skills (set-of-mark, screenshot agents) arise from skill composition, not task data: capabilities can ship that nobody specified.',
    ],
    terms: [
      { term: 'OneVision scenario', gloss: '"Single-image, multi-image, or video"', meaning: 'One of the three input shapes served under the same shared visual-token budget in one model.' },
      { term: 'Token budget', gloss: '"How many tokens per sample"', meaning: 'The total visual tokens the LLM sees per sample, held roughly constant across scenarios, typically 3000 to 4000.' },
      { term: 'Curriculum', gloss: '"Training order"', meaning: 'The deliberate stage ordering of training data, chosen so skills learned earlier transfer to scenarios trained later.' },
      { term: 'Bilinear pooling', gloss: '"Token shrink"', meaning: 'Applying bilinear interpolation to the 2D patch grid to reduce token count while preserving spatial locality.' },
      { term: 'AnyRes-k', gloss: '"k-tile setup"', meaning: 'A split of a high-resolution image into k fixed-size sub-tiles plus one global thumbnail, typically k of 4 or 9.' },
      { term: 'Emergent skill', gloss: '"Not trained, still works"', meaning: 'A capability that appears at inference without any matching training data, composed from separately trained skills.' },
      { term: 'Task transfer', gloss: '"Cross-scenario generalization"', meaning: 'Skills learned on one input shape (single-image) that transfer to another (video) via the shared backbone and curriculum.' },
      { term: 'Set-of-mark prompting', gloss: '"Numbered annotations"', meaning: 'Annotating objects in an image with numbered marks so the model can reason about relationships between specific marked items.' },
      { term: 'Unified visual-token budget', gloss: '"One cost for every input shape"', meaning: 'A near-constant total token allocation across scenarios, so a deployed model has one predictable per-request cost.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Your product mix is 80% single-image, 10% multi-image (2 to 4 images), 10% video (8 to 16 frames). Given a 4000-token shared budget, roughly how many tokens would you allocate per scenario, and where would you spend the surplus you save from light multi-image use?' },
      { level: 'medium', prompt: 'Bilinear pooling shrinks a 24x24 patch grid to 12x12, a 4x reduction in token count. What resolution and pooling factor combination would you pick for a video product where frames arrive at 384px and you need to fit 64 frames in a 4000-token budget?' },
      { level: 'hard', prompt: 'The paper trains video benchmarks using only 8 frames per training sample. Does that generalize to a 30-second clip at inference time? Name which breaks first as clip length grows: the token budget or the temporal reasoning, and why.' },
      { level: 'design', prompt: 'Propose a fourth emergent skill this curriculum would plausibly unlock beyond the three the paper reports (multi-camera reasoning, set-of-mark prompting, screenshot agent). Sketch the product surface where a user would first notice it working, and where they would first notice it failing.' },
    ],
    furtherReading: [
      { label: 'Li et al. - LLaVA-OneVision (arXiv:2408.03326)', url: 'https://arxiv.org/abs/2408.03326', why: 'The original paper; section 4.3 covers the emergent capabilities.' },
      { label: 'LLaVA-OneVision-1.5: Fully Open Framework (arXiv:2509.23661)', url: 'https://arxiv.org/abs/2509.23661', why: 'The fully open 2025 follow-up with the same curriculum and more data.' },
      { label: 'Lin et al. - Video-LLaVA (arXiv:2311.10122)', url: 'https://arxiv.org/abs/2311.10122', why: 'One of the pre-OneVision video specialists this lesson contrasts against.' },
      { label: 'Lin et al. - VILA (arXiv:2312.07533)', url: 'https://arxiv.org/abs/2312.07533', why: 'A pre-OneVision multi-image specialist.' },
      { label: 'Wang et al. - Qwen2-VL (arXiv:2409.12191)', url: 'https://arxiv.org/abs/2409.12191', why: 'The scaling-budget alternative to OneVision\'s fixed-budget strategy, covered in lesson 12.09.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Unified-scenario VLM curriculum checklist',
      body: '- Does training start with single-image data at high resolution before introducing multi-image or video? If the order is reversed, expect measurably worse image performance on identical data.\n- Is the total visual-token budget held roughly constant across scenarios, with only the allocation changing? A budget that balloons for video will make cost unpredictable in production.\n- Is pooling applied on the 2D patch grid, not the flattened token sequence? Pooling in the wrong space silently destroys spatial locality.\n- Have you tested for emergent skills you did not train for, both the useful ones and the risky ones? Capabilities can ship that nobody specified.\n- Does your budget plan account for your product\'s actual scenario mix, not the paper\'s default 3000 to 4000 tokens?',
    },
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
    readTime: '~10 min read',
    diagram: '/lessons/p12-09.svg',
    diagramCaption:
      'M-RoPE splits the hidden dimension into three bands, rotating each by temporal, height, and width position, so text, images, and video share one encoding.',
    whyItMatters:
      'The Qwen-VL lineage is where three product capabilities were normalized: reading dense documents at native resolution, understanding video with real timestamps ("at 0:42 the user taps checkout"), and emitting machine-parseable actions. The last one matters most for design: moving from free-form "click at (1024, 512)" to trained JSON output took GUI-grounding accuracy from 55% to 84%, and reliable computer-use agents became feasible at exactly that jump. Output format is not presentation, it is a trained capability with a measurable accuracy cost. When you spec an AI feature\'s output contract, you are making a model decision, not a formatting one.',
    learningObjectives: [
      'Compute M-RoPE\'s three-axis rotation (temporal, height, width) for a given patch position.',
      'Pick a dynamic-FPS sampling rate for a video given its duration, motion level, and token budget.',
      'Name the four Qwen-VL generations in order and the one architectural bet each made.',
      'Explain why training a model to emit JSON instead of prose changed its GUI-grounding accuracy from 55% to 84%.',
      'Set min_pixels and max_pixels as a deliberate per-feature cost and quality control, not a library default.',
    ],
    sections: [
      {
        heading: 'The problem: resolution, video, structured output',
        body: 'Qwen-VL shipped in August 2023, aimed at three gaps LLaVA left open. Resolution: 336px is fine for photos, useless for a dense invoice or spreadsheet screenshot, so Qwen-VL started at 448px and trained explicit grounding, emitting bounding-box coordinates as text so the model could point at things. Video: stacking per-frame encoders, the Video-LLaMA approach, worked for short clips but not multi-minute footage where time itself is the signal. Structured output: an agent needs JSON, not prose describing a click.\n\nEvery subsequent generation extends exactly one of those three axes. Reading the family chronologically explains why each knob sits where it does today.',
      },
      {
        heading: 'Qwen-VL: grounding as a first-class output',
        body: 'The first generation paired an OpenCLIP ViT-bigG/14 encoder (2.5B parameters) with a 256-query bridge and a Qwen-7B base, trained bilingually in Chinese and English from the start. Its headline feature was grounding: trained on image-text pairs with explicit coordinate-token output, so a caption like "the cat is at <box>(112, 204), (280, 344)</box>" became something the model could produce directly.\n\nAt release it was competitive with GPT-4V on English benchmarks and dominant on Chinese ones. The grounding supervision, not the resolution bump alone, was the real headline: pointing at regions of an image as text tokens is the seed of everything the family later built into agent output.',
      },
      {
        heading: 'Qwen2-VL: M-RoPE and native resolution',
        body: 'The 2024 generation dropped the fixed-resolution stack entirely. The ViT accepts any size divisible by 28; an 1120x672 image yields 960 tokens with no resize, no tiling, no thumbnail.\n\nThe enabler is M-RoPE: every token carries a 3D position (time, height, width), and the hidden dimension splits into three bands, each rotated by its own axis. Text uses its sequence index, images use row and column, video frames add time. One encoding, no branching code, no position table to outgrow. The Q-Former was replaced by a plain MLP. Result: Qwen2-VL-7B beat GPT-4o on DocVQA, 94.5 to 88.4.',
      },
      {
        heading: 'M-RoPE, mathematically',
        body: 'Classical RoPE rotates a query vector by its position using paired coordinates and a frequency `theta_i = 10000^(-2i/d)`. M-RoPE splits the hidden dimension into three bands instead of one: with `d = 96`, say 32 dimensions go to temporal, 32 to height, 32 to width, each rotated by its own axis position.\n\nA patch at time 5, row 10, column 20 gets three separate rotations applied to its three bands. Text tokens use their sequence index for the temporal axis and a fixed value for height and width, keeping them compatible with the same encoding. The result is one position scheme for text, images, and video, with no branching logic and no separate table to run out of positions on a long video.',
      },
      {
        heading: 'Qwen2.5-VL: time becomes a token',
        body: 'The 2025 generation made video first-class. Instead of frame indices, the model sees absolute timestamps interleaved with frame tokens, so "at 0:04 the cat jumps" is grounded in real seconds, not a frame count that means nothing without knowing the frame rate. Dynamic FPS follows directly: sample slow footage at 1 FPS and fast action at 4 or more, with the budget math explicit, a 60-second clip at 4 FPS and 81 tokens per frame comes to about 19,000 tokens, comfortable inside a 32k context.\n\nWindow attention in the ViT bought throughput by restricting most spatial attention to local blocks, with periodic global layers. MRoPE-v2 scaled position frequencies so a 10-minute video does not run off the encoding\'s range.',
      },
      {
        heading: 'Structured output: JSON is trained, not parsed',
        body: 'Qwen2.5-VL trained directly on tool-call data: the model emits `{"tool": "mouse_click", "coords": [1024, 512]}` instead of prose describing a click. Parsing becomes a plain `JSON.parse` instead of regex and ambiguity handling.\n\nThe scoreboard says this is capability, not formatting: ScreenSpot GUI-grounding accuracy jumped from Qwen2-VL\'s 55% to 84%, against 38% for GPT-4o at the time. Computer-use agents became practical at exactly that jump. Qwen3-VL (November 2025) consolidated rather than reinvented: a bigger backbone, more data, better OCR and reasoning, the same ViT and M-RoPE underneath. The primitives had stabilized by then.',
      },
      {
        heading: 'The budget logic you inherit',
        body: 'Deploying a Qwen-family model means deciding a sampling policy. Given a clip of duration T and a token budget B, the maximum affordable FPS is `B / (T x tokens_per_frame)`; pick from {1, 2, 4, 8} under that ceiling, higher when the footage has more motion. A security feed can run at 1 FPS all day without losing anything that matters; a tennis rally needs 4 or more to not miss the point of contact.\n\nThe per-request knobs `min_pixels` and `max_pixels` bound image cost the same way, on the spatial axis instead of the temporal one. These are product levers: they decide what a feature can see, how fast it answers, and what each request costs. Someone sets them, deliberately or by accident; better if it is deliberate.',
      },
      {
        heading: 'The four generations, side by side',
        body: '| Generation | Year | The one bet | What it unlocked |\n|---|---|---|---|\n| Qwen-VL | 2023 | Grounding as text output | Pointing at image regions |\n| Qwen2-VL | 2024 | M-RoPE, native resolution | No resize, no tiling, any aspect ratio |\n| Qwen2.5-VL | 2025 | Absolute time tokens, dynamic FPS, JSON output | Real-second video queries, agent-ready output |\n| Qwen3-VL | 2025 | Scale the recipe | Bigger backbone, same primitives |\n\nBy the fourth generation, the open ecosystem had copied every bet from the row above it within roughly a year. The primitives, not the parameter count, are what a 2026 deployment inherits.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p12-09-inline-mrope.svg',
        alt: 'M-RoPE splitting the hidden dimension into three rotated bands',
        caption: 'Each patch gets three rotations, temporal, height, and width, from three separate bands of the same hidden dimension.',
        diagramBrief:
          'A horizontal bar representing the hidden dimension (say 96 units) divided into three labeled segments: "temporal (32)", "height (32)", "width (32)". Below each segment, a small rotation arrow icon with its own angle. Cream paper background, black ink, one blue accent per segment in a different shade to distinguish the three bands. Caption: "one position scheme for text, image, and video."',
      },
      {
        src: '/lessons/p12-09-inline-fps.svg',
        alt: 'Dynamic FPS budget equation applied to three video types',
        caption: 'The same token budget buys 1 FPS on a security feed and 4+ FPS on a tennis rally.',
        diagramBrief:
          'Three video-strip icons side by side: "security feed (low motion)" sampled at wide intervals (1 FPS, sparse frame marks), "recipe demo (medium motion)" at medium intervals (2 FPS), "tennis rally (high motion)" at tight intervals (4+ FPS). All three strips the same total length, showing the frame count differs but fits the same budget. Cream paper, black ink strips, blue frame-mark ticks.',
      },
    ],
    takeaways: [
      'M-RoPE gives text, image, and video one position encoding by splitting the hidden dimension into time, height, and width bands.',
      'Absolute time tokens ground video answers in real seconds, which is what makes "what happened at 0:42" a reliable query.',
      'Training JSON output took GUI grounding from 55% to 84%: an output contract is a trained capability, not a formatting choice.',
      'Dynamic FPS is a budget equation (fps <= budget / (duration x tokens_per_frame)); set it per use case, not globally.',
    ],
    terms: [
      { term: 'M-RoPE', gloss: '"Multimodal RoPE"', meaning: 'Rotary position encoding split into three bands (time, height, width) within the hidden dimension, so one scheme covers text, image, and video.' },
      { term: 'Dynamic FPS', gloss: '"Smart sampling"', meaning: 'Choosing a video\'s frame-sampling rate per clip based on motion level, duration, and the available token budget.' },
      { term: 'Absolute time token', gloss: '"Timestamp token"', meaning: 'A token carrying a real elapsed-time value, interleaved with frame tokens, so the model sees actual seconds instead of a frame index.' },
      { term: 'Window attention', gloss: '"Local attention"', meaning: 'ViT self-attention restricted to small local windows for speed, with periodic full-image global attention layers added back in.' },
      { term: 'Grounding', gloss: '"Point at it"', meaning: 'Outputting bounding-box coordinates as text tokens so the model can indicate a specific region of an image; present since Qwen-VL v1.' },
      { term: 'min_pixels / max_pixels', gloss: '"Resolution bounds"', meaning: 'Per-request bounds on total image pixel count, and therefore on token count, latency, and cost.' },
      { term: 'Structured agent output', gloss: '"JSON mode"', meaning: 'Training supervision that teaches a VLM to emit parseable JSON with tool names and coordinates instead of free-form prose.' },
      { term: 'ScreenSpot', gloss: '"GUI-grounding benchmark"', meaning: 'The benchmark measuring how accurately a model can click the correct on-screen UI element given an instruction.' },
      { term: 'MRoPE-v2', gloss: '"Scaled M-RoPE"', meaning: 'A revision that scales M-RoPE\'s position frequencies with the maximum input size, so long videos do not exceed the encoding\'s range.' },
      { term: 'Qwen3 thinking mode', gloss: '"Reasoning mode"', meaning: 'Qwen3-VL\'s inherited reasoning capability from its larger Qwen3 language backbone, layered on top of the unchanged vision stack.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A 10-minute security-camera recording sampled at 1 FPS produces how many frames? At 384 resolution with 3x pooling giving 81 tokens per frame, how many total tokens, and does that fit a 32k context?' },
      { level: 'medium', prompt: 'Pick a sampling FPS for a 30-second tennis rally, a 30-second recipe demo, and a 30-second UI-agent screen recording, using the rule fps <= budget / (duration x tokens_per_frame). Justify each choice by the motion in the clip.' },
      { level: 'hard', prompt: 'Compute M-RoPE\'s rotation angles for a patch at position (t=3, h=5, w=7) with a hidden dimension of 48 split into three 16-dimensional bands and a base theta of 10000. Show the angle for the first pair in each band.' },
      { level: 'design', prompt: 'You are speccing a computer-use agent\'s output contract. Sketch the tradeoff between free-form prose output ("click near the blue button") and structured JSON output ({"tool": "click", "coords": [x, y]}) for your engineering team, using the 55% to 84% ScreenSpot jump as your evidence.' },
    ],
    furtherReading: [
      { label: 'Bai et al. - Qwen-VL (arXiv:2308.12966)', url: 'https://arxiv.org/abs/2308.12966', why: 'The first generation and its grounding-as-text-output design.' },
      { label: 'Wang et al. - Qwen2-VL (arXiv:2409.12191)', url: 'https://arxiv.org/abs/2409.12191', why: 'M-RoPE and native dynamic resolution in full detail.' },
      { label: 'Qwen Team - Qwen2.5-VL Technical Report (arXiv:2502.13923)', url: 'https://arxiv.org/abs/2502.13923', why: 'Dynamic FPS, absolute time tokens, and the JSON agent output format.' },
      { label: 'Qwen Team - Qwen3-VL (arXiv:2511.21631)', url: 'https://arxiv.org/abs/2511.21631', why: 'The consolidation generation: what scaled and what stayed fixed.' },
      { label: 'Zhu et al. - InternVL3 (arXiv:2504.10479)', url: 'https://arxiv.org/abs/2504.10479', why: 'A contrasting position-encoding choice (V2PE) covered next in lesson 12.10.' },
    ],
    shipIt: {
      kind: 'snippet',
      name: 'Dynamic-FPS budget calculator',
      body: 'Given clip duration T (seconds), token budget B, and tokens_per_frame:\n\nfps_max = B / (T * tokens_per_frame)\n\nPick fps from {1, 2, 4, 8} such that fps <= fps_max.\nBias toward the higher end of that set when the clip has fast motion (sports, UI interaction); bias toward the lower end for static or slow footage (lectures, security feeds).\n\nExample: a 60-second clip, budget 20,000 tokens, 81 tokens per frame.\nfps_max = 20000 / (60 * 81) = 4.1, so pick fps = 4.\nTotal cost: 60 * 4 * 81 = 19,440 tokens, inside a 32k context.',
    },
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
      'Every VLM so far bolted vision onto a finished text LLM and paid for it in alignment debt: forgotten text skills, answer drift, self-contradiction. InternVL3 trained text and vision together from the first gradient step and matched Gemini 2.5 Pro on MMMU-Pro with open weights.',
    readTime: '~10 min read',
    diagram: '/lessons/p12-10.svg',
    diagramCaption:
      'Post-hoc vs native: bolt vision onto a finished LLM and repair the seams, or mix text, interleaved, caption, and video data into one pretraining run from step one.',
    whyItMatters:
      'Alignment debt is the technical name for a UX pattern you have seen: an assistant describes a screenshot correctly, then answers a question contradicting its own description. That inconsistency is architectural. Visual tokens bolted onto a finished LLM never participate in its internal consistency the way text does, and the model also forgets: post-hoc VLMs drop 5 to 10 points on math and text benchmarks. Native pretraining removes the debt at the price of a from-scratch run costing millions of GPU-hours. It is the classic retrofit-versus-rebuild decision, with the same economics: retrofits stay cheaper, rebuilds stay cleaner, and the benchmarks now quantify the gap.',
    learningObjectives: [
      'Name the three measurable symptoms of alignment debt: catastrophic forgetting, answer drift, and visual-text inconsistency.',
      'Describe InternVL3\'s native pretraining corpus mix and explain why the text-only share stays as high as 40%.',
      'Compare V2PE\'s learned per-modality position allocation to Qwen2-VL\'s fixed M-RoPE split.',
      'Explain how the Visual Resolution Router and Decoupled Vision-Language deployment each raise serving throughput.',
      'Decide between post-hoc adaptation and native pretraining for a new VLM project given a stated compute budget.',
    ],
    sections: [
      {
        heading: 'The problem: bolt-on vision leaves a debt',
        body: 'The default VLM recipe, the one every lesson in this part has covered so far, takes an LLM that spent its entire pretraining budget on text and adds vision afterward: align a projector, fine-tune on instructions, ship. It works, and this whole part of the course is proof. But three measurable symptoms follow that recipe home.\n\nCatastrophic forgetting: text benchmarks like GSM8K and Hellaswag drop 5 to 10 points after vision training, and pure-text agent tasks regress. Answer drift: rephrasing the same visual question changes the answer, because visual tokens bind to the LLM more weakly than its own vocabulary does. Visual-text inconsistency: the model describes an image correctly, then contradicts its own description when asked a follow-up question. MM1.5 quantifies all three.',
      },
      {
        heading: 'The move: one run, mixed from step one',
        body: 'InternVL3 (Zhu et al., April 2025) rejects the retrofit. One pretraining run where text, image, and video tokens all participate in the same loss from the first gradient step. The corpus mix: 40% text-only data, 35% interleaved image-text documents, 20% caption pairs, 5% video-text.\n\nThe text-only share stays large on purpose. Interleaved and captioned multimodal data is scarce next to the roughly 15T tokens of text available, and a model that never sees enough plain text still needs to reason in language. No alignment stage, no projector-freezing step, no forgetting to repair afterward, because nothing was ever learned in isolation to begin with. Instruction tuning still follows, but the base model already treats visual tokens as first-class from the start.',
      },
      {
        heading: 'What native buys on the scoreboard',
        body: 'At 78B parameters, InternVL3 matches Gemini 2.5 Pro on MMMU-Pro with open weights. At 38B it matches GPT-4o. At 8B it led the open leaderboard on release. One pretraining run plus instruction tuning, no multi-stage repair work bolted on afterward.\n\nThe alignment-debt hypothesis is measurable, not just argued: InternVL3-8B loses fewer text-benchmark points per unit of vision-benchmark gain than comparable post-hoc models trained at similar scale. The model behaves more like a generalist because its training was one piece, not two pieces stitched together.',
      },
      {
        heading: 'V2PE: a smaller refinement riding along',
        body: 'A position-encoding refinement travels with the pretraining change. V2PE gives text tokens a 1D position, image patches a 2D position (row, column), and video frames a 3D position (time, row, column), all sharing one rotary frequency base, with the per-band dimension allocation learned rather than fixed as in Qwen2-VL\'s M-RoPE.\n\nThe ablation claim is modest: 1 to 2 points on video benchmarks over M-RoPE at equal compute. Not a revolution. Native pretraining is the headline of this lesson; V2PE is the tidying that came along for the ride, worth knowing but not worth over-indexing on.',
      },
      {
        heading: 'Serving tricks: route the resolution, split the towers',
        body: 'Two deployment optimizations are worth stealing regardless of which training strategy you pick. The Visual Resolution Router (ViR) is a small classifier that predicts the minimum resolution a query needs before encoding even starts. In production traffic, about 60% of queries turn out to be answerable at low or medium resolution, and routing them there yields 2 to 3x throughput at equal quality, an "image detail: auto" setting that is learned rather than guessed.\n\nDecoupled Vision-Language deployment (DvD) puts the vision encoder and the LLM on separate GPUs with a streaming handoff between them, since one is bandwidth-bound and runs once per image while the other is KV-cache-bound and runs once per output token. For an 8B-plus-400M-encoder model, this roughly doubles per-node throughput.',
      },
      {
        heading: 'The tradeoff: reuse vs debt',
        body: 'Native pretraining is not a free win. It costs what pretraining an LLM costs from scratch, millions of GPU-hours, where post-hoc adaptation reuses an existing model for a fraction of that. Interleaved multimodal data is scarce next to the roughly 15T tokens of available text, a hard ceiling on how much native pretraining data exists to train on. And you surrender modularity: a post-hoc VLM can swap in next year\'s LLM by retraining an adapter; a native model cannot, the vision understanding is baked into the one backbone.\n\nInternVL3\'s bet is that the debt costs more than the reuse saves, and its benchmarks back the claim. Both strategies will keep coexisting: post-hoc for most budgets, native at the frontier where the debt is most expensive to carry.',
      },
      {
        heading: 'What came after',
        body: 'InternVL3.5 (August 2025) scaled the same recipe with more data and more parameters; MMMU improvements were incremental, which is itself evidence the architecture had found its footing. InternVL-U (2026) added image-generation heads onto the same native-pretrained backbone, chasing the same unified-model bet as the Transfusion-style architectures covered later in this phase.\n\nThe pattern across both follow-ups: once a lab commits to native pretraining, later generations spend their effort on data and heads, not on re-litigating whether the retrofit-versus-rebuild decision was right the first time.',
      },
      {
        heading: 'Post-hoc vs native, side by side',
        body: '| | Post-hoc (LLaVA, Qwen-VL, Idefics) | Native (InternVL3) |\n|---|---|---|\n| Training cost | Reuses an existing LLM, cheap | Full pretrain, millions of GPU-hours |\n| Text-skill retention | 5-10 point drops common | Measurably smaller drops |\n| Answer consistency | Drift and self-contradiction reported | Fewer reported inconsistencies |\n| LLM swappability | Retrain a cheap adapter | Locked to the trained backbone |\n| Best fit | Most product budgets | Frontier labs absorbing the debt cost |\n\nThe classic retrofit-versus-rebuild tradeoff, now with benchmark numbers attached instead of just engineering folklore.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p12-10-inline-alignmentdebt.svg',
        alt: 'The three measurable symptoms of alignment debt',
        caption: 'Forgetting, drift, and self-contradiction are the three symptoms a post-hoc VLM pays for bolting vision onto a finished LLM.',
        diagramBrief:
          'Three stacked icon-and-label rows: "Catastrophic forgetting: GSM8K down 5-10 points", "Answer drift: same question rephrased, different answer", "Visual-text inconsistency: describes correctly, then contradicts itself". Cream paper background, black ink icons (a downward arrow, a wavy line, a speech-bubble with a crossed-out check), one blue accent line connecting all three to a single source box labeled "bolted-on vision, no shared training".',
      },
      {
        src: '/lessons/p12-10-inline-corpusmix.svg',
        alt: 'InternVL3\'s native pretraining corpus mix',
        caption: 'Text stays the largest share even in a natively multimodal pretraining run: 40% text, 35% interleaved, 20% captions, 5% video.',
        diagramBrief:
          'A pie or stacked bar chart with four segments: 40% (largest, labeled "text-only"), 35% (labeled "interleaved image-text"), 20% (labeled "caption pairs"), 5% (smallest, labeled "video-text"). Cream paper background, black ink outlines, blue fill gradient darkest on the largest segment. Caption: "one loss, from the first gradient step."',
      },
    ],
    takeaways: [
      'Alignment debt has three measurable symptoms: text-benchmark drops (5 to 10 points), answer drift on rephrasing, and self-contradiction between description and answer.',
      'Native pretraining mixes text (40%), interleaved (35%), captions (20%), and video (5%) into one loss from step one, so there is no seam to repair.',
      'A resolution router that picks minimum-needed detail per query serves ~60% of traffic cheaply: 2 to 3x throughput at equal quality.',
      'Retrofit vs rebuild economics apply: post-hoc stays cheaper and swappable, native stays cleaner and expensive. Pick by budget, not fashion.',
    ],
    terms: [
      { term: 'Native multimodal pretraining', gloss: '"From scratch, together"', meaning: 'Text, image, and video tokens participating in the same training loss from the first gradient step, never added to a finished model afterward.' },
      { term: 'Alignment debt', gloss: '"Post-hoc penalty"', meaning: 'The measurable regressions, forgetting, drift, and inconsistency, that come from adding vision to an already-finished text LLM.' },
      { term: 'Catastrophic forgetting', gloss: '"The model got dumber at text"', meaning: 'A drop in a model\'s pure-text benchmark scores after it is trained on vision data, typically 5 to 10 points on benchmarks like GSM8K.' },
      { term: 'Answer drift', gloss: '"Inconsistent answers"', meaning: 'Getting a different answer to the same visual question when it is rephrased, a symptom of weak binding between visual tokens and the LLM.' },
      { term: 'V2PE', gloss: '"Variable visual position encoding"', meaning: 'InternVL3\'s position scheme giving each modality its own dimensionality, with the per-band allocation learned rather than fixed.' },
      { term: 'ViR', gloss: '"Resolution router"', meaning: 'A small classifier that predicts the minimum image resolution a query needs before encoding, saving tokens on the majority of traffic.' },
      { term: 'DvD', gloss: '"Decoupled deployment"', meaning: 'Serving the vision encoder and the LLM on separate GPUs with a streaming handoff, roughly doubling per-node throughput for large VLMs.' },
      { term: 'Interleaved corpus', gloss: '"OBELICS / MMC4"', meaning: 'Web documents with images placed in their natural reading order among the text; the scarce raw material native pretraining depends on.' },
      { term: 'Retrofit vs rebuild', gloss: '"The classic engineering tradeoff"', meaning: 'Adapting an existing system cheaply but inheriting its seams, versus rebuilding from scratch at higher cost but without the seams.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'InternVL3\'s corpus mix is 40% text, 35% interleaved, 20% caption pairs, 5% video. If a competitor proposed dropping the text-only share to 10% to fit more multimodal data, what would you expect to happen to the model\'s reasoning ability, and why?' },
      { level: 'medium', prompt: 'ViR routes about 60% of production traffic to low- or medium-resolution encoding, yielding 2 to 3x throughput at equal quality. What kinds of queries does a resolution router most likely misroute, sending to low-resolution when high-resolution detail was actually needed?' },
      { level: 'hard', prompt: 'Read MM1.5\'s section on forgetting. Name the specific benchmark where post-hoc training showed the largest regression, and how many points it cost. Compare that number to InternVL3\'s reported retention.' },
      { level: 'design', prompt: 'A vendor tells you their assistant "describes your screenshot correctly, then sometimes contradicts itself when you ask a follow-up." Using this lesson\'s framework, write the three questions you would ask them about their training strategy before deciding whether this is fixable with better prompting or requires a different model.' },
    ],
    furtherReading: [
      { label: 'Chen et al. - InternVL 1 (arXiv:2312.14238)', url: 'https://arxiv.org/abs/2312.14238', why: 'The lineage this native-pretraining generation builds on.' },
      { label: 'Zhu et al. - InternVL3 (arXiv:2504.10479)', url: 'https://arxiv.org/abs/2504.10479', why: 'The native pretraining paper itself, with the corpus mix and benchmark claims.' },
      { label: 'InternVL3.5 (arXiv:2508.18265)', url: 'https://arxiv.org/abs/2508.18265', why: 'The 2025 scale-up of the same recipe.' },
      { label: 'Zhang et al. - MM1.5 (arXiv:2409.20566)', url: 'https://arxiv.org/abs/2409.20566', why: 'Section 4 quantifies the alignment-debt symptoms this lesson opens with.' },
      { label: 'Wang et al. - Qwen2-VL (arXiv:2409.12191)', url: 'https://arxiv.org/abs/2409.12191', why: 'The fixed M-RoPE scheme that V2PE revises with learned band allocation.' },
    ],
    shipIt: {
      kind: 'rubric',
      name: 'Native vs post-hoc VLM decision rubric',
      body: '- Compute budget: can you afford a full pretraining run (millions of GPU-hours), or only an adaptation pass on an existing LLM?\n- Text-quality sensitivity: does your product rely on the base LLM\'s text reasoning staying fully intact after adding vision? If yes, weight toward native.\n- Consistency requirements: can your users tolerate occasional answer drift or self-contradiction on visual questions? If no, weight toward native.\n- LLM churn: do you expect to swap the underlying LLM within a year or two? If yes, weight toward post-hoc, since native pretraining locks in the backbone.\n- Data availability: do you have or can you access enough interleaved multimodal data (OBELICS-scale) to make native pretraining viable at all?',
    },
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
