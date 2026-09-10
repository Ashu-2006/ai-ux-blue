import type { Lesson } from '@/lib/lessons';

// Phase 12 · Part 4 · Video, audio, and omni models (lessons 12.17-12.20)
export const phase12Part4: Lesson[] = [
  {
    id: 'p12-17-temporal-grounding',
    phase: 'Phase 12 · Multimodal AI',
    part: 'Part 4 · Video, audio, and omni models',
    index: '12.17',
    title: 'Video-language models and temporal grounding',
    oneLiner:
      'Video has order and timing a stack of photos does not. Whether a model can answer "at what second" instead of "early in the clip" comes down to one mechanism: timestamps baked into position encoding.',
    readTime: '~10 min read',
    diagram: '/lessons/p12-17.svg',
    diagramCaption:
      'Three temporal designs side by side: Q-former per clip, pooled tokens per frame, and TMRoPE with an absolute timestamp on every token.',
    whyItMatters:
      'Every "jump to the moment" feature (video search that scrubs to the answer, chapter markers, moderation flags with timestamps, sports highlights) depends on whether the model knows time as an absolute value or only as a frame index. That is an architecture choice, not a prompt choice: if the model encodes "frame 15" instead of "4.2 seconds," no copy tweak gives you a precise seek target. The same sampling and pooling levers also explain what a "fast vs detailed" video setting actually trades away.',
    learningObjectives: [
      'Explain why temporal position encoding, not the vision encoder, decides whether a video model can answer "at what second."',
      'Compute the token cost of a video clip at a given FPS, resolution, and pooling factor.',
      'Compare Video-LLaMA\'s Q-former-per-clip, Video-LLaVA\'s pooled-per-frame, and Qwen2.5-VL\'s TMRoPE-per-token designs on what each can and cannot locate in time.',
      'Choose a frame-sampling strategy, uniform, dynamic FPS, event-driven, or keyframe, for a stated video content type.',
      'Pick a grounding output format, free text, structured JSON, or time tokens, based on what the downstream UI needs to do with it.',
      'Match a video benchmark, VideoMME, TempCompass, EgoSchema, or Video-MMMU, to the axis a product feature actually needs measured.',
    ],
    sections: [
      {
        heading: 'The problem: a minute of video is 352,000 tokens',
        body: 'One minute of video at 30 FPS is 1,800 frames. At 196 visual tokens per frame (a ViT-B/16 running at 224px), that is roughly 352,000 tokens, more than any 2024-era LLM context could hold in one pass. Video models survive by throwing information away in three places: subsample frames (1 to 8 FPS depending on content), pool each frame\'s patch tokens (a 3x3 pool cuts 576 tokens to 64), or compress a whole clip through a Q-former that reads 16 frames and returns a fixed handful of queries.\n\nEach cut loses something different. Subsampling loses temporal detail between the frames you drop. Pooling loses spatial detail inside the frames you keep. Clip compression loses a little of both. A second axis, easy to miss entirely, is whether the model knows frame 5 came before frame 6, or actually knows it happened 0.2 seconds earlier.',
      },
      {
        heading: 'Video-LLaMA: a Q-former per clip, plus an audio branch',
        body: 'Video-LLaMA (Zhang et al., June 2023) was the first open video-LLM, and its shape set the pattern others would react to. It samples 16-frame clips at 2 FPS (8 seconds of footage), runs each frame through a ViT, and feeds the result to a Video Q-former: 32 learned queries cross-attending over all 16 frames at once, collapsing the clip into a fixed handful of tokens for the LLM. A parallel audio branch does the same job for sound: waveform into an ImageBind encoder, into an Audio Q-former, into 32 more queries.\n\nThe strength is real audio-visual joint reasoning, unusual for 2023. The weakness is baked into the clip length: position lived per clip or per frame index, so the best answer to "when does the cat jump?" was "early in the clip." The clock was never part of the representation.',
      },
      {
        heading: 'VideoChat and Video-LLaVA: simplify, then unify the encoder',
        body: 'VideoChat kept Video-LLaMA\'s Q-former idea but dropped the audio branch, trading a capability for simplicity. Video-LLaVA (Lin et al., 2023) went further: instead of training separate encoders for images and video frames, it trained one visual encoder on both, an approach the paper calls alignment before projection. An MLP projector then maps that shared representation into the LLM, sampling 8 frames per clip.\n\nBoth systems answer "what happens in this clip" well. Neither can locate anything precisely in time, because both are 8-to-16-frame systems with position encoded per clip or per frame index, the same ceiling Video-LLaMA hit. Unifying the encoder solved a training-efficiency problem, not a temporal-grounding one. That problem needed a fix that touched position encoding directly, not the encoder feeding it.',
      },
      {
        heading: 'TMRoPE: put the timestamp inside the token',
        body: 'Qwen2.5-VL\'s TMRoPE (Temporal-Modality Rotary Position Embedding) gives every patch token a 3D position, (t, h, w), where t is the actual timestamp in seconds, not the frame index. The rotation applied to each token\'s attention vectors encodes "this happened at 4.2 seconds" directly into the geometry the model attends over.\n\nThree consequences follow. Absolute time: the model can output "4.2 seconds," not "around frame 15." Per-token rotation: every visual token carries its own moment, not a shared clip-level position. Dynamic FPS compatibility: sample at 2 FPS in a quiet stretch and 4 FPS during action, and the uneven spacing is handled natively, because position is time, not sequence order. This one encoding change, published in 2025, closed most of the gap between open video models and frontier proprietary ones.',
      },
      {
        heading: 'Sampling: four ways to choose which frames survive',
        body: 'Uniform sampling takes N frames evenly across the duration; simple, and blind to motion peaks it happens to skip. Dynamic FPS samples adaptively, using optical flow or frame differencing to sample densely where things move and sparsely where nothing changes; Qwen2.5-VL trains directly on this. Event-driven sampling runs a lightweight detector first and samples around what it flags, the approach VideoAgent uses. Keyframe-plus-context sampling cuts at shot boundaries and grabs a few adjacent frames, suited to edited, cinematic content where the cut itself carries meaning.\n\nNone of these choices is free. Uniform sampling is the cheapest to compute and the easiest to reason about; the other three trade extra preprocessing for a better chance of catching the frame that actually answers the question.',
      },
      {
        heading: 'Pooling: the other budget lever',
        body: 'At 1 FPS and 576 tokens per frame, a 5-minute clip is 172,800 tokens, technically inside a 128k-context 72B model\'s window only after trimming elsewhere in the prompt. A 3x3 bilinear pool takes each frame from 576 tokens to 64, so the same clip drops to 19,200 tokens, the sweet spot most 2026 systems land on. A 6x6 pool goes further, 16 tokens per frame, useful for agent workflows where knowing roughly what is on screen matters more than reading fine detail off it.\n\nSampling and pooling are independent levers. Sample sparsely and pool lightly, or sample densely and pool hard; the 2026 default recipe pairs dynamic FPS with 3x3 pooling and TMRoPE-style encoding underneath both.',
      },
      {
        heading: 'Grounding output formats: free text, JSON, time tokens',
        body: 'Three formats carry a time-localized answer out of the model. Free text ("around the 4-second mark") is easy for a person to read and useless for software to act on; a UI cannot seek to "around." Structured JSON, `{"event": "jump", "start": 4.1, "end": 4.3}`, parses directly into a seek action, and Qwen2.5-VL trains on exactly this shape. Token-based formats interleave special time tokens, like `<time>4.1</time>`, directly inside the answer for maximum precision, the internal format Qwen2.5-VL reasons in before it gets rendered to JSON.\n\nThe choice is not cosmetic. A product that needs a scrub bar to jump precisely needs structured output; a product that only needs a paragraph summary can tolerate free text and skip the schema-following overhead.',
      },
      {
        heading: 'Four benchmarks, four different axes',
        body: 'VideoMME is the broad one: 2,500-plus samples spanning short, medium, and long clips, built to catch general video understanding rather than one narrow skill. TempCompass isolates ordering specifically, before-and-after question pairs that punish a model for getting sequence wrong even when it names the right objects. EgoSchema tests long-horizon reasoning over 3-plus minutes of first-person video, where the question cannot be answered from any single frame. Video-MMMU crosses into multi-discipline territory, questions that require domain knowledge beyond what is visible on screen.\n\nA model can lead one leaderboard and trail on another, because they are not measuring the same thing. Picking a benchmark for a product decision means asking which axis, ordering, duration, or domain knowledge, actually matches the feature being shipped.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p12-17-inline-token-budget.svg',
        alt: 'Token cost of a 5-minute clip at three pooling levels',
        caption: 'The same 5-minute clip at 1 FPS costs 172,800 tokens raw, 19,200 tokens after a 3x3 pool, and about 4,800 tokens after a 6x6 pool.',
        diagramBrief: 'Cream paper background (#faf6ef), black ink, one blue accent. Draw three vertical bars side by side on a shared axis labeled "tokens". Bar 1 tall, labeled "raw, 576/frame: 172,800 tokens". Bar 2 much shorter, labeled "3x3 pool, 64/frame: 19,200 tokens" and filled with the accent color to mark it as the recommended default. Bar 3 shortest, labeled "6x6 pool, 16/frame: 4,800 tokens". Add a small caption line under the chart: "same 5-minute clip, same content, three different bills."',
      },
      {
        src: '/lessons/p12-17-inline-tmrope.svg',
        alt: 'TMRoPE token position versus frame-index position',
        caption: 'Two position schemes for the same clip: frame-index (one integer per clip) versus TMRoPE (an absolute timestamp on every token).',
        diagramBrief: 'Cream paper background, black ink, one accent color. Top row: a horizontal sequence of 6 small squares labeled "frame index: 1, 2, 3, 4, 5, 6" with a caption "position = order only, no clock". Bottom row: the same 6 squares, each now labeled with a timestamp in the accent color ("t=0.0s, t=0.3s, t=0.5s, t=0.9s, t=1.1s, t=1.4s"), uneven spacing between some squares to show variable sampling, with a caption "position = absolute time, spacing can vary freely". Draw a small clock icon above the bottom row only.',
      },
    ],
    takeaways: [
      'Temporal grounding is an encoding property, not a prompting trick. If timestamps are not in the position encoding, "at what second" is unanswerable.',
      'Video token cost = frames sampled x tokens per frame after pooling. Both levers are yours to reason about when scoping a video feature.',
      'Structured JSON grounding output ({event, start, end}) is what turns a model answer into a seek action in UI.',
      'Benchmarks stress different axes: TempCompass is ordering, EgoSchema is long-horizon. Pick the one that matches the job, not the leaderboard.',
    ],
    terms: [
      { term: 'Temporal grounding', gloss: '"time-localized answers"', meaning: 'The model outputs a specific start and end timestamp for when an event happens in a video, not just a description of it.' },
      { term: 'TMRoPE', gloss: '"time-aware RoPE"', meaning: 'Rotary position encoding where every visual token carries a 3D (t, h, w) position, with t the absolute timestamp rather than the frame index.' },
      { term: 'Dynamic FPS', gloss: '"smart frame sampling"', meaning: 'Motion-aware sampling that grabs more frames per second in high-motion segments and fewer in static ones, usually via optical flow or frame differencing.' },
      { term: 'Frame pooling', gloss: '"shrinking each frame"', meaning: 'Reducing the number of patch tokens per frame through bilinear interpolation (a 3x3 pool turns 576 tokens into 64) before the sequence reaches the LLM.' },
      { term: 'Video Q-former', gloss: '"clip compressor"', meaning: 'A cross-attention bottleneck where a fixed number of learned queries attend over every frame in a clip and emit a fixed-length set of tokens, as in Video-LLaMA.' },
      { term: 'Alignment before projection', gloss: '"shared encoder trick"', meaning: 'Video-LLaVA\'s technique of training one visual encoder on both static images and video frames before the MLP projector, so image and video tokens land in the same space.' },
      { term: 'Structured JSON grounding', gloss: '"machine-readable timestamp"', meaning: 'An output like `{"event": "jump", "start": 4.1, "end": 4.3}` that a UI parses directly into a seek action, instead of free text a person has to interpret.' },
      { term: 'VideoMME', gloss: '"the video benchmark"', meaning: 'A benchmark of 2,500-plus samples spanning short, medium, and long clips, used to test general video understanding rather than one narrow skill.' },
      { term: 'TempCompass', gloss: '"the ordering test"', meaning: 'A benchmark isolating fine-grained temporal reasoning, specifically before-and-after question pairs a model must get in the right sequence.' },
      { term: 'EgoSchema', gloss: '"the long first-person test"', meaning: 'A benchmark testing reasoning over 3-plus minutes of first-person video, stressing long-horizon memory rather than single-frame recognition.' },
      { term: 'Video-MMMU', gloss: '"the multi-subject video test"', meaning: 'A benchmark of multi-discipline video questions, testing whether a model can reason across different subject domains inside video content.' },
      { term: 'Uniform sampling', gloss: '"just grab every Nth frame"', meaning: 'Sampling frames at fixed, evenly spaced intervals regardless of motion content, simple but blind to whatever motion peak falls between two sampled frames.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A 3-minute cooking demo needs frame sampling at 576 tokens per frame before pooling. Compute the token count for uniform sampling at 1 FPS versus dynamic FPS averaging 0.6 FPS, then justify which one you would ship for a recipe app.' },
      { level: 'easy', prompt: 'TMRoPE assigns every token an absolute timestamp instead of a frame index. Name one query a TMRoPE-encoded model can answer that a frame-index-encoded model (Video-LLaMA) structurally cannot, and explain why the second model\'s answer must stay vague.' },
      { level: 'medium', prompt: 'Write the JSON schema for a temporal-grounding output field: event, start, end, and one confidence or error field for when the model is not sure the event occurred at all. Explain what your UI does when that error field fires.' },
      { level: 'hard', prompt: 'As of 2026, VideoMME shows a leaderboard gap between the top open model and the top proprietary model. Given that TMRoPE-class encoding is now open (Qwen2.5-VL), argue how much of the remaining gap is attributable to temporal encoding versus base LLM reasoning scale.' },
      { level: 'design', prompt: 'Sketch a video player\'s "jump to moment" search box. When the backing model is Video-LLaVA (frame-index only) instead of TMRoPE, what does the search box degrade to, and what one line of microcopy tells the user why they cannot ask "at what second"?' },
    ],
    furtherReading: [
      { label: 'Zhang et al. - Video-LLaMA (arXiv:2306.02858)', url: 'https://arxiv.org/abs/2306.02858', why: 'The first open video-LLM with audio-visual grounding; read it to see why fixed 16-frame clips cap what a system can locate in time.' },
      { label: 'Lin et al. - Video-LLaVA (arXiv:2311.10122)', url: 'https://arxiv.org/abs/2311.10122', why: 'Section 3, "Alignment Before Projection," is the clearest account of why one shared encoder beats training separate image and video encoders.' },
      { label: 'Qwen Team - Qwen2.5-VL (arXiv:2502.13923)', url: 'https://arxiv.org/abs/2502.13923', why: 'The TMRoPE paper, the mechanism that turned "early in the clip" into "at 4.2 seconds."' },
      { label: 'Lin et al. - VILA-1.5 (arXiv:2312.07533)', url: 'https://arxiv.org/abs/2312.07533', why: 'A production-scale open VLM family that documents its frame-sampling and pooling choices in detail.' },
      { label: 'Li et al. - VideoChat (arXiv:2305.06355)', url: 'https://arxiv.org/abs/2305.06355', why: 'Shows the intermediate step between Video-LLaMA and Video-LLaVA: same idea, audio dropped, pattern simplified.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Video feature scoping checklist',
      body: '- What frame rate does the sampler run: uniform, dynamic FPS, or event-driven?\n- What pooling factor ships (3x3, 6x6), and what spatial detail does it cost?\n- Does the encoder carry an absolute timestamp per token (TMRoPE) or only a frame index?\n- What output format does grounding use: free text, structured JSON, or time tokens?\n- Which benchmark matches this feature\'s job: VideoMME (general), TempCompass (ordering), EgoSchema (long-horizon), Video-MMMU (multi-discipline)?\n- Can the UI parse the model\'s timestamp output directly into a seek action, or does a person have to interpret it first?',
    },
    demoCaption:
      'Same question, two temporal encodings. Flip between a clip-compressed model and a timestamp-encoded one and compare what each can actually tell you about when.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Q: at what second does the cat jump?',
      badLabel: 'Per-clip position',
      goodLabel: 'TMRoPE timestamps',
      badLines: [
        'A: "The cat jumps early in the clip."',
        'position = clip index, frame order only',
        'no seek target for the player',
        'UI can only replay the whole clip',
      ],
      goodLines: [
        'A: {"event": "jump", "start": 4.1, "end": 4.3}',
        'position = absolute time on every token',
        'parses straight into a seek action',
        'UI scrubs to 4.1s and highlights the range',
      ],
      badCaption:
        'The misreading: the model seems vague, so you prompt harder. But "early in the clip" is the ceiling; time was never encoded, only frame order.',
      goodCaption:
        'The mechanism: TMRoPE rotates each token by its actual timestamp, so "4.2 seconds" exists inside the model. Precise seek UX is inherited from position encoding.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'why can one video model say "at 4.2 seconds" while another can only say "early in the clip"?',
        body:
          'why can one video model say "at 4.2 seconds" while another can only say "early in the clip"?\n\nposition encoding. older video LLMs encoded frame order: frame 5 before frame 6, no clock. Qwen2.5-VL\'s TMRoPE stamps every visual token with its absolute timestamp.\n\nsame encoder, same LLM scale. the clock lives in the rotation.',
      },
      {
        kind: 'X · design angle',
        hook: '"jump to the moment" is not a feature you design. it is a property your model has or lacks.',
        body:
          '"jump to the moment" is not a feature you design. it is a property your model has or lacks.\n\nif timestamps are in the position encoding, the model can emit {"event": "jump", "start": 4.1, "end": 4.3} and your player seeks to it.\n\nif they are not, the best answer is "early in the clip", and no UI polish recovers the precision.',
      },
      {
        kind: 'X · one-liner',
        hook: 'a minute of raw video is 352,000 tokens. every video AI feature is a story about what got thrown away.',
        body:
          'a minute of raw video is 352,000 tokens. every video AI feature is a story about what got thrown away.\n\nsample fewer frames: lose motion. pool each frame: lose detail. compress the clip: lose a little of both.\n\nthe "fast vs detailed" toggle in a video AI product is literally choosing the loss.',
      },
    ],
    source: {
      label: 'Full lesson: 12.17 video-language-temporal-grounding',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/12-multimodal-ai/17-video-language-temporal-grounding',
    },
  },
  {
    id: 'p12-18-long-video',
    phase: 'Phase 12 · Multimodal AI',
    part: 'Part 4 · Video, audio, and omni models',
    index: '12.18',
    title: 'Long video: four ways to survive a million tokens',
    oneLiner:
      'An hour of video overflows every context window that exists. Four escape routes exist: bigger context, distributed attention, clip compression, or retrieval instead of raw frames.',
    readTime: '~10 min read',
    diagram: '/lessons/p12-18.svg',
    diagramCaption:
      'The token budget wall: video duration against token count, with the four scaling paths (brute context, ring attention, compression, retrieval) marked where each takes over.',
    whyItMatters:
      'When a stakeholder asks "can users chat with a 2-hour recording," the honest answer is a strategy choice with its own UX signature. Brute context is accurate and expensive per query. Compression is cheap but sometimes misses the exact frame, so the UI needs a "not fully sure" affordance. Retrieval is fast and cheap but only as good as its index, and it fails silently when the index misses. The duration slider in a product spec quietly picks the architecture, and the architecture picks the failure mode your empty states have to handle.',
    learningObjectives: [
      'Compute total visual-token counts for a video at a stated duration, FPS, and pooling factor.',
      'Explain the tradeoff each of the four long-video paths makes: brute context, ring attention, token compression, agentic retrieval.',
      'Predict which path a given video duration and accuracy requirement points to, using the needle-in-a-haystack recall numbers in this lesson.',
      'Describe why retrieval fails silently and design a UI response for when it does.',
      'Justify why 2026 production systems combine a pooled global summary with retrieval instead of committing to one path exclusively.',
    ],
    sections: [
      {
        heading: 'The problem: duration times FPS times tokens per frame',
        body: 'The arithmetic is unforgiving before any model choice enters the picture. At 384px native resolution a frame runs about 729 tokens; a 3x3 pool cuts that to 81. A 30-minute clip at 1 FPS is 1,800 frames, 145,800 tokens, doable on 2025-era open VLMs but tight. Double the sampling rate to 2 FPS and it is 291,600 tokens, and only the largest contexts fit. A 2-hour movie at 1 FPS is 583,000 tokens, beyond most 2026 open models entirely.\n\nPush the numbers further and they stop looking like engineering and start looking like a wall: a 1-hour 4K video, patched with nothing thrown away, is on the order of 60 million tokens. Nobody processes that raw. Every long-video system is a negotiated compromise, and there are exactly four families of compromise.',
      },
      {
        heading: 'Path 1: brute context',
        body: 'Scale the context window until the video fits, and process the whole thing in one forward pass. Gemini 1.5 opened this era in March 2024 with contexts from 1 million to 10 million tokens, and its paper documents needle-in-a-haystack recall of 99.7 percent up to about 9.5 million tokens. Gemini 2.5 Pro, in 2026, handles hours of video reliably at this scale.\n\nThe engineering underneath (a memory hierarchy of local, global, and sparse attention, plus mixture-of-experts routing to keep per-token cost down) is not fully published and is not open source. Brute context is the accuracy king and the closed-model moat: you rent it per token, and an hour of video is a lot of tokens spent on every single query, not just the first one.',
      },
      {
        heading: 'Path 2: ring attention',
        body: 'Ring attention distributes a long sequence across devices arranged in a ring: each device holds one chunk, computes partial attention over it, and passes results to the next device in rotation. Training compute scales linearly with context length instead of quadratically, because the expensive full-sequence attention is amortized across every device in the ring rather than computed on one.\n\nLWM (Liu et al., 2024) trained a 1-million-token model this way. LongVILA adapted the pattern specifically to video: 1,400-frame clips at 192 tokens per frame, packed into a 268,000-token context, trained across 8-way ring parallelism. Ring attention answers a training-time problem; it does not by itself reduce how many tokens an inference request costs, only how affordably that scale was reached.',
      },
      {
        heading: 'Path 3: token compression',
        body: 'Compress the clip before the LLM ever sees the full sequence. Video-XL collapses each clip of N frames into a single learned summary token that attends over all N, so a long video shrinks to one token per clip rather than hundreds. LongVA takes a different route: it stretches an LLM\'s context from 200,000 to 2 million tokens by training on long text first, then transferring that extended capacity to video through a shared representation.\n\nThe cost is precision, not scale. A compressed model knows what generally happened across a clip but sometimes misses the exact frame a question is asking about, because that frame\'s detail got averaged away in the compression step. Compression buys duration; it spends the ability to answer "at exactly what second."',
      },
      {
        heading: 'Path 4: agentic retrieval',
        body: 'VideoAgent treats the video as a database instead of an input. The LLM reads the question, asks a retrieval tool for relevant segments ("show me clips with a cat"), gets back timestamps, reads only those clips through a VLM, and either composes an answer or issues another query if the first pass was not enough.\n\nInference stays cheap because only relevant clips are ever encoded, not the whole video. On 2-plus-hour content, retrieval can match or beat raw context, because a good index hits the needle regardless of how long the haystack is; brute context has to hold the whole haystack in memory to get the same result. The catch is that retrieval quality becomes the system\'s ceiling, and a bad index fails silently, returning a confident answer built on the wrong clips.',
      },
      {
        heading: 'Needle-in-a-haystack: how the paths are actually scored',
        body: 'The standard long-context test hides a unique marker at a random point in a video, then asks a question that requires recalling it. Gemini 2.5 Pro holds above 99 percent recall out to 90-minute videos on this test. Open 72B models, Qwen2.5-VL-72B and InternVL3-78B among them, sit around 85 to 90 percent recall at 30 minutes and degrade noticeably past 60.\n\nVideoAgent-style retrieval can match or beat both at 2-plus hours, precisely because its score does not degrade with duration the way brute-context recall does; it degrades with index quality instead. That difference is the whole argument for retrieval on very long content: past a certain duration, index-quality risk is the cheaper failure mode to manage than recall decay.',
      },
      {
        heading: 'Which path to pick, by duration',
        body: 'For a 15-minute clip at frontier accuracy, an open 72B model with native context usually works; Qwen2.5-VL-72B is the reasonable default. For 30 minutes to an hour, LongVILA or Video-XL cover the open-weight case, while Gemini 2.5 Pro covers it if the quality bar demands a closed model. For 2-plus hours, agentic retrieval (VideoAgent-style) or hierarchical summarization are what remain; brute context is off the table for nearly every open deployment at that length.\n\nThis is a table worth keeping next to any product spec that mentions video duration, because the tier a feature falls into decides which failure mode you are designing for: a slightly wrong recall, a missed exact frame, or a silently wrong retrieval.',
      },
      {
        heading: 'What production actually does: hybrid',
        body: 'The needle-in-a-haystack numbers draw the real map. So 2026 production pipelines blend the paths instead of picking one: run dynamic-FPS sampling with aggressive pooling to get a roughly 100,000-token global representation of the whole video, pass that to a 72B VLM for an overall summary, then answer detailed follow-up questions through agentic retrieval that uses the summary itself as an index.\n\nGlobal understanding comes from context, local precision comes from retrieval, and the combined cost stays lower than either path alone would need to hit both bars. The split also matches how users actually ask questions: a first message wants the gist, later messages want the exact clip, and the pipeline can afford to answer the first cheaply and the second precisely.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p12-18-inline-recall.svg',
        alt: 'Needle-in-haystack recall by duration and strategy',
        caption: 'Gemini 2.5 Pro holds above 99 percent recall to 90 minutes; open 72B models sit at 85-90 percent at 30 minutes and fall off past 60.',
        diagramBrief: 'Cream paper background, black ink, one accent color. Line chart, x-axis "video duration (minutes)" from 0 to 120, y-axis "recall %" from 0 to 100. Draw a flat accent-colored line near the top (99%) labeled "Gemini 2.5 Pro" that stays flat out to 90 minutes then dips slightly. Draw a second black line starting around 90% at 30 minutes and sloping downward after 60 minutes, labeled "open 72B models". Add a small dotted horizontal reference line at 85%.',
      },
      {
        src: '/lessons/p12-18-inline-four-paths.svg',
        alt: 'The four long-video scaling paths compared',
        caption: 'Brute context, ring attention, token compression, and agentic retrieval, each trading a different resource for duration.',
        diagramBrief: 'Cream paper background, black ink, one accent color. Four columns, each a labeled box: "Brute context: accuracy king, highest cost per query", "Ring attention: linear training cost, does not shrink inference tokens", "Token compression: cheap, sometimes misses the exact frame", "Agentic retrieval: cheapest inference, fails silently on a bad index". Draw a small icon above each box (a stack of tokens, a ring of nodes, a funnel, a magnifying glass). Connect all four with a horizontal baseline labeled "duration increases left to right".',
      },
    ],
    takeaways: [
      'Long-video capacity is arithmetic: duration x FPS x tokens-per-frame-after-pooling. Run the numbers before promising a duration in a spec.',
      'The four paths trade differently: brute context buys recall with cost, compression buys scale with precision, retrieval buys cost with index risk.',
      'Retrieval fails silently. If your product uses it, design for confident-but-wrong answers, not just slow ones.',
      'Production is hybrid: pooled global summary for the overview, retrieval for the detail question. Two UX modes, one pipeline.',
    ],
    terms: [
      { term: 'Brute context', gloss: '"just more tokens"', meaning: 'Scaling the LLM\'s context window to millions of tokens and processing the entire video in a single forward pass, as Gemini 1.5 and 2.5 do.' },
      { term: 'Ring attention', gloss: '"LWM-style parallel training"', meaning: 'A distributed attention pattern where each device holds one chunk of the sequence and rotates it around a ring, so training compute scales linearly instead of quadratically with context length.' },
      { term: 'Token compression', gloss: '"summary tokens"', meaning: 'A learned module that collapses each clip of N frames into far fewer, sometimes one, summary tokens before the LLM ever sees the sequence.' },
      { term: 'Agentic retrieval', gloss: '"LLM as query planner"', meaning: 'The LLM treats the video as a database, asks a retrieval tool for relevant clips by description, and only encodes the clips it gets back.' },
      { term: 'Needle-in-a-haystack', gloss: '"the long-context recall test"', meaning: 'Inserting a unique marker at a random point in a long video and measuring whether the model can recall it at test time, scored as Recall@k.' },
      { term: 'VideoAgent', gloss: '"the retrieval pattern"', meaning: 'The canonical agentic-retrieval design: question, retrieval tool call, matching clip timestamps, VLM reads only those clips, answer composed or another query issued.' },
      { term: 'Hierarchical summary', gloss: '"summarize the summaries"', meaning: 'Summarizing chunks of video, then summarizing those summaries; the fallback strategy when neither brute context nor compression fits a video\'s duration.' },
      { term: 'Visual summary token', gloss: '"one token per clip"', meaning: 'Video-XL\'s approach of compressing each clip of N frames down to a single token that attends over all N, drastically shrinking the sequence the LLM processes.' },
      { term: 'Long-context transfer', gloss: '"train on text, use on video"', meaning: 'LongVA\'s technique of extending an LLM\'s context on long text data, then transferring that extended capacity to long video through a shared representation.' },
      { term: 'Recall@k', gloss: '"the accuracy number"', meaning: 'The metric scoring whether a model correctly retrieves or recalls information across a range of positions (k) within a long sequence.' },
      { term: 'Global representation', gloss: '"the whole-video summary"', meaning: 'A compact, roughly 100,000-token pooled encoding of an entire video used for overview questions, distinct from the fine-grained retrieval used for detail questions.' },
      { term: 'Index risk', gloss: '"retrieval can miss"', meaning: 'The failure mode unique to retrieval-based systems, where a bad or incomplete index causes the model to answer confidently from the wrong clips, with no signal that it went wrong.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A 45-minute lecture is sampled at 1 FPS with 81 tokens per frame after pooling. Compute the total token count. Which model contexts from this lesson can hold it directly, and which need compression or retrieval?' },
      { level: 'medium', prompt: 'Design a needle-in-a-haystack test for a 30-minute product demo video: pick the minute you inject the marker, and write the exact query format you would score the model against.' },
      { level: 'medium', prompt: 'Compare a brute-context Qwen2.5-VL-72B (128k context) against a VideoAgent-style retrieval pipeline on a 1-hour customer support recording. Which wins on recall? Which wins on latency? Which fails more dangerously when it fails?' },
      { level: 'hard', prompt: 'Ring attention scales memory linearly in sequence length and linearly in device count. Explain why, and describe what breaks if you skip the ring-rotation phase and just split the sequence into independent chunks.' },
      { level: 'design', prompt: 'Your product spec says "chat with any recording up to 3 hours." Write the one paragraph of user-facing copy that discloses which duration tier uses native context (precise) and which uses retrieval (fast but can miss), so users calibrate trust correctly.' },
    ],
    furtherReading: [
      { label: 'Gemini Team - Gemini 1.5 (arXiv:2403.05530)', url: 'https://arxiv.org/abs/2403.05530', why: 'Section 5 documents the needle-in-a-haystack recall numbers this lesson\'s ceiling chart is built from.' },
      { label: 'Liu et al. - LWM / Ring Attention (arXiv:2402.08268)', url: 'https://arxiv.org/abs/2402.08268', why: 'The original ring-attention scaling proof; explains why training compute stays linear as context grows.' },
      { label: 'Xue et al. - LongVILA (arXiv:2408.10188)', url: 'https://arxiv.org/abs/2408.10188', why: 'Shows ring attention adapted specifically to video, with the 268k-token, 1,400-frame configuration cited in this lesson.' },
      { label: 'Shu et al. - Video-XL (arXiv:2409.14485)', url: 'https://arxiv.org/abs/2409.14485', why: 'The visual-summary-token compression design, and where its precision loss shows up in practice.' },
      { label: 'Wang et al. - VideoAgent (arXiv:2403.10517)', url: 'https://arxiv.org/abs/2403.10517', why: 'The reference agentic-retrieval design for video, worth reading end to end if retrieval is your product\'s duration strategy.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Long-video architecture decision checklist',
      body: '- What is the longest video duration this feature must handle, in minutes?\n- At the target sampling rate and pooling factor, what is the raw token count?\n- Does that count fit inside your model\'s native context, or does it require compression or retrieval?\n- If retrieval: what happens in the UI when the index misses? Is there a "not fully sure" affordance?\n- If compression: does the product actually need the exact frame, or just the general gist?\n- Does the spec\'s duration promise match an architecture that has been benchmarked at that duration?',
    },
    demoCaption:
      'Drag the video duration and watch the token count cross each model\'s ceiling. The strategy switches are not preferences; they are walls.',
    demo: {
      archetype: 'slider-map',
      sliderLabel: 'Video duration (1 FPS, 81 tokens/frame)',
      outputLabel: 'Visual tokens vs context ceilings',
      badCaption:
        'The misreading: "the model supports video, so length is a product decision". Teams spec "chat with any recording" assuming capacity is smooth and continuous.',
      goodCaption:
        'The mechanism: tokens = seconds x 81. At 30 min you are at 146k and open 72B models are already tight; at 2 hours you are at 583k and only retrieval or hierarchical summaries remain. Each ceiling forces an architecture change, and each architecture has its own failure mode.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'a 2-hour movie at 1 frame per second is 583,000 tokens. here are the only four ways anyone handles that.',
        body:
          'a 2-hour movie at 1 frame per second is 583,000 tokens. here are the only four ways anyone handles that.\n\n1. brute context: scale the window to millions (Gemini).\n2. ring attention: split the sequence across devices.\n3. compression: one summary token per clip.\n4. retrieval: treat the video as a database, fetch clips.\n\naccuracy, scale, cost, index risk. pick your poison.',
      },
      {
        kind: 'X · design angle',
        hook: 'the duration limit in your video AI spec is secretly an architecture decision.',
        body:
          'the duration limit in your video AI spec is secretly an architecture decision.\n\n15 min: open 72B, native context, precise.\n1 hour: compression, cheaper, sometimes misses the exact frame.\n2+ hours: retrieval, fast, fails silently when the index misses.\n\neach tier needs different UI honesty. the confidence treatment should change with the duration.',
      },
      {
        kind: 'X · one-liner',
        hook: 'retrieval beats a million-token context on 2-hour videos. a good index does not care how long the haystack is.',
        body:
          'retrieval beats a million-token context on 2-hour videos. a good index does not care how long the haystack is.\n\nbrute context degrades with length. retrieval degrades with index quality. past a certain duration, the second problem is the cheaper one to have.',
      },
    ],
    source: {
      label: 'Full lesson: 12.18 long-video-million-token',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/12-multimodal-ai/18-long-video-million-token',
    },
  },
  {
    id: 'p12-19-audio-language',
    phase: 'Phase 12 · Multimodal AI',
    part: 'Part 4 · Video, audio, and omni models',
    index: '12.19',
    title: 'Audio-language models: from Whisper to Audio Flamingo 3',
    oneLiner:
      'Whisper made transcription a commodity, but a transcript is not the audio. Emotion, speakers, music, and timing live in the sound and die in the text; audio-LLMs feed the sound in directly.',
    readTime: '~10 min read',
    diagram: '/lessons/p12-19.svg',
    diagramCaption:
      'The arc from ASR to audio reasoning: waveform to log-Mel spectrogram, through paired Whisper and BEATs encoders, into an audio Q-former, into the LLM.',
    whyItMatters:
      'Products keep shipping "AI that understands your calls" on a transcribe-then-summarize cascade, and users keep noticing what it misses: who was frustrated, who interrupted whom, what the mood was. Those are not model-quality gaps, they are pipeline gaps, the transcript never contained them. Knowing where the cascade\'s ceiling sits tells you which features are safe on cheap infrastructure (summaries, action items) and which require an end-to-end audio model (emotion, speaker dynamics, music, anything time-located in sound). That line belongs in the spec, not in a QA report.',
    learningObjectives: [
      'Compute a log-Mel spectrogram\'s shape given sample rate, window, hop, and Mel bin count.',
      'Explain why Whisper hears speech well and music poorly, and what BEATs adds that Whisper does not.',
      'Trace the audio Q-former\'s two training stages, alignment then instruction, and what each one teaches it.',
      'Decide, for a stated product feature, whether a cascaded pipeline is sufficient or an end-to-end audio-LLM is required.',
      'Read an MMAU score by sub-task category rather than as one composite number, and say what that breakdown rules in or out for a feature.',
    ],
    sections: [
      {
        heading: 'The problem: recognition is not reasoning',
        body: 'Whisper (Radford et al., December 2022) settled speech recognition: 680,000 hours of weakly supervised multilingual audio, a plain encoder-decoder transformer, and a benchmark every subsequent ASR release still cites. OCR-of-audio became a commodity almost overnight.\n\nBut commodity stops at the transcript. "What instruments are in this recording," "what emotion is the speaker expressing," "at what second does the explosion happen": none of these are answerable from text, because the answer lived in the acoustics and transcription discarded it on the way out. Three routes exist from here: cascade (transcribe, then reason over the text), end-to-end (feed audio tokens straight into the LLM), or a hybrid that can do a bit of both. The interesting engineering, and the one worth a designer\'s attention, sits in the second and third.',
      },
      {
        heading: 'The shared input: log-Mel spectrogram',
        body: 'Every audio encoder starts from the same feature. Resample to 16 kHz. Slice the waveform into 25ms windows hopping every 10ms, and take a Fourier transform of each slice. Warp the resulting frequencies through about 80 Mel filter banks so resolution matches human hearing rather than raw physics, then log-compress the magnitudes for dynamic range.\n\nThe result is a 2D array, time frames by frequency bins: a 30-second clip becomes a (3,000, 80) array, a picture of sound rather than a recording of it. That reframing is the move worth remembering. Once audio is an array shaped like an image, the machinery that already exists for vision applies directly: patches, a transformer encoder, one hidden vector per time frame.',
      },
      {
        heading: 'Two ears: Whisper for words, BEATs for everything else',
        body: 'Whisper\'s encoder trained on speech-dominant data, so it hears language well and hears music and environmental sound poorly. BEATs (Chen et al., 2022), a self-supervised transformer trained on AudioSet, captures exactly what Whisper misses at a comparable parameter count: instruments, ambience, mechanical sound, anything that is not someone talking.\n\nAudio Flamingo 3\'s answer is to use both: concatenate Whisper features (the linguistic signal) with BEATs features (the acoustic signal) into one combined input. The BLIP-2 pattern from an earlier lesson then repeats: an audio Q-former with learned queries cross-attending over the encoder frames, handing the LLM a fixed set of audio tokens. Same adapter economics as vision, applied to a new modality with two encoders feeding it instead of one.',
      },
      {
        heading: 'Audio Q-former: the same bottleneck, trained in two stages',
        body: 'The audio Q-former is structurally identical to BLIP-2\'s visual one: a fixed number of learnable queries, often 32 or 64, cross-attend over the encoder\'s output frames and become the tokens the LLM actually reads. Getting there takes two training stages. First, an alignment stage trains the Q-former alone against contrastive and captioning losses on paired audio-text datasets like AudioCaps and Clotho, teaching the queries to summarize audio content before anything downstream depends on them.\n\nSecond, an instruction stage unfreezes more of the pipeline, often the LLM itself, and trains end-to-end on instruction-following audio-text data. Skipping the alignment stage produces a noticeably weaker Q-former, because the queries never learned a clean summarization signal before being asked to serve open-ended instructions.',
      },
      {
        heading: 'The arc: SALMONN to Qwen-Audio to AF3',
        body: 'Progress is legible on MMAU, the 10,000-question benchmark spanning speech, music, and environmental sound. SALMONN (2023), the first open audio-LLM with real reasoning, scores about 0.55. Qwen-Audio, with richer data and multi-turn tuning, reaches about 0.60. Audio Flamingo 3 (NVIDIA, July 2025), an 8B backbone pairing the Whisper-plus-BEATs hybrid encoder with 1 million-plus instruction pairs, hits 0.72, against a proprietary frontier sitting around 0.78.\n\nLTU (Gong et al., 2023) took a different path through the same period, betting on explicit chain-of-thought reasoning data over raw scale, and stayed competitive at a smaller size. The open-closed gap on MMAU is smaller than video\'s equivalent gap on VideoMME, one sign audio-LLMs are maturing faster relative to their video counterparts.',
      },
      {
        heading: 'On-demand chain-of-thought: AF3\'s thinking mode',
        body: 'AF3 adds a feature none of its predecessors had: on-demand chain-of-thought for audio. Before answering, the model can optionally emit thinking tokens, "let me identify the instruments first," reasoning through the acoustic evidence in the open, the same pattern text-only reasoning models use before a final answer.\n\nThe measured effect is a 3-to-5-point accuracy lift on complex reasoning tasks when thinking is enabled, at the cost of extra tokens and latency per response. That tradeoff is a product decision, not just a model setting: a quick "what genre is this" query does not need it, but "why does this recording sound suspicious" benefits from the model showing its acoustic reasoning before committing to an answer a user might need to trust or challenge.',
      },
      {
        heading: 'Cascade or end-to-end: the product line',
        body: 'The cascade, Whisper transcribes, an LLM reasons over the transcript, is cheaper, simpler, and completely sufficient for "summarize this podcast." It structurally cannot do: mood of a song (that lives in the sound, not the words), who is speaking (speaker identity is acoustic, not lexical), when the explosion happens (timing dissolves the moment it becomes text), or whether audio is a deepfake (detection needs the waveform\'s fingerprint, which a transcript never had).\n\nThe honest 2026 recipe: cascade when transcription is genuinely the whole goal and there is no music, emotion, or speaker question anywhere on the roadmap. End-to-end, AF3 or the Qwen-Audio family, the moment any of those appear. The mistake products keep making is shipping the cascade and promising the other list anyway.',
      },
      {
        heading: 'MMAU: the benchmark that catches what cascades miss',
        body: 'MMAU (Massive Multimodal Audio Understanding) is built specifically to expose the cascade\'s blind spot: 10,000 audio-text QA pairs across speech, music, and environmental sound, split across classification, temporal reasoning, causal reasoning, and open-ended questions. A cascaded pipeline can do well on classification and some open-ended questions, wherever the answer happens to survive transcription, and collapses on temporal and causal questions that require the acoustic signal itself.\n\nReading a model\'s MMAU score by category, not just as one composite number, tells you more about what a product built on it can promise than the headline 0.72-versus-0.78 gap does. A model strong on classification and weak on temporal reasoning is a fine music-tagging backend and a bad choice for "at what second does this happen."',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p12-19-inline-spectrogram.svg',
        alt: 'Waveform to log-Mel spectrogram pipeline',
        caption: 'A 30-second clip at 16 kHz becomes a (3,000, 80) array: 3,000 time frames by 80 Mel frequency bins, log-compressed.',
        diagramBrief: 'Cream paper background, black ink, one accent color. Left: a simple waveform line (amplitude over time). Arrow to a box labeled "STFT: 25ms window, 10ms hop". Arrow to a box labeled "80 Mel filter banks". Arrow to a box labeled "log compress". Arrow to a small 2D grid on the right (rows x columns) labeled "(3000, 80) log-Mel array", shaded in the accent color to look like a heatmap with a few darker patches.',
      },
      {
        src: '/lessons/p12-19-inline-cascade-vs-e2e.svg',
        alt: 'Cascaded versus end-to-end audio pipeline',
        caption: 'Cascade discards the waveform at the transcript step; end-to-end carries audio tokens all the way into the LLM.',
        diagramBrief: 'Cream paper background, black ink, one accent color. Two horizontal lanes. Top lane labeled "Cascade": waveform icon -> Whisper box -> text bubble "Fine, let\'s go with your plan" -> LLM box -> answer. Mark the transition from waveform to text bubble with a small "x" in accent color and the label "acoustic signal dropped here". Bottom lane labeled "End-to-end": waveform icon -> Whisper+BEATs box -> Q-former box -> LLM box -> answer, with a continuous accent-colored line running the whole lane labeled "acoustic signal carried through".',
      },
    ],
    takeaways: [
      'A transcript is a lossy render of audio. Emotion, speakers, music, and timing are discarded at the transcription step, unrecoverable downstream.',
      'Audio becomes an image (the log-Mel spectrogram), and then the whole vision playbook applies: encoder, Q-former, frozen LLM.',
      'Pairing encoders is the trick: Whisper hears words, BEATs hears the world, AF3 concatenates both.',
      'Spec features against the pipeline: summaries are cascade-safe; anything acoustic (mood, speakers, timing) requires end-to-end. Draw that line before committing a roadmap.',
    ],
    terms: [
      { term: 'Log-Mel spectrogram', gloss: '"Mel features"', meaning: 'A 2D array of log-compressed magnitude values across time frames and Mel-warped frequency bins, produced by short-time Fourier transform plus filter banks; the shared input every audio encoder consumes.' },
      { term: 'Whisper', gloss: '"the transcription model"', meaning: 'OpenAI\'s December 2022 encoder-decoder transformer trained on 680,000 hours of weakly supervised multilingual speech; it solved recognition, not reasoning about sound.' },
      { term: 'BEATs', gloss: '"the other audio encoder"', meaning: 'A self-supervised transformer trained on AudioSet that captures music and environmental sound at the parameter count where Whisper, trained on speech-heavy data, is weak.' },
      { term: 'Audio Q-former', gloss: '"audio perceiver"', meaning: 'A cross-attention bottleneck, structurally identical to BLIP-2\'s visual Q-former, where a fixed number of learnable queries attend over audio encoder frames and emit tokens for the LLM.' },
      { term: 'Cascaded pipeline', gloss: '"ASR then LLM"', meaning: 'A two-stage design where Whisper transcribes audio to text and a separate text LLM reasons over the transcript, discarding every acoustic signal at the handoff.' },
      { term: 'End-to-end audio-LLM', gloss: '"the model that actually hears"', meaning: 'An architecture where audio features enter the LLM directly through an encoder and Q-former, preserving emotion, speaker identity, and environmental sound that transcription would erase.' },
      { term: 'MMAU', gloss: '"the audio reasoning benchmark"', meaning: 'A 10,000-question benchmark spanning speech, music, and environmental sound, covering classification, temporal reasoning, causal reasoning, and open-ended QA; the 2024-2025 standard eval.' },
      { term: 'On-demand thinking', gloss: '"audio chain-of-thought"', meaning: 'Audio Flamingo 3\'s option to emit reasoning tokens ("let me identify the instruments first") before its final answer, lifting complex-task accuracy 3 to 5 points when enabled.' },
      { term: 'AudioCaps / Clotho', gloss: '"the audio-text training sets"', meaning: 'Paired audio-caption datasets used in the Q-former\'s alignment stage, where contrastive and captioning losses teach the queries to summarize audio content before instruction tuning begins.' },
      { term: 'Alignment stage', gloss: '"step one of training"', meaning: 'The training phase where only the Q-former is trained, encoders and LLM frozen, on audio-text pairs, before the instruction-tuning stage unfreezes the LLM.' },
      { term: 'Instruction stage', gloss: '"step two of training"', meaning: 'The training phase where the full pipeline, often including the LLM, is tuned end-to-end on instruction-following audio-text data.' },
      { term: 'Deepfake detection', gloss: '"is this audio real"', meaning: 'A task that structurally requires the raw waveform\'s acoustic fingerprint; a transcript-only cascade has already discarded the evidence needed to answer it.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Compute the log-Mel spectrogram shape for a 30-second clip at 16 kHz, 25ms windows, 10ms hop, 80 Mel bins. How does the shape change if you resample to 48 kHz first but keep the same window and hop in milliseconds?' },
      { level: 'medium', prompt: 'Whisper underperforms on music. Name two specific audio features BEATs captures that Whisper\'s speech-dominant training does not, and explain why concatenating the two (as AF3 does) is cheaper than retraining Whisper on music.' },
      { level: 'medium', prompt: 'MMAU splits into classification, temporal reasoning, causal reasoning, and open-ended QA. Pick one of these categories and explain what a cascaded pipeline would score near zero on, and why.' },
      { level: 'hard', prompt: 'AF3\'s on-demand thinking mode lifts complex-task accuracy 3 to 5 points. Propose three audio product tasks where you would always enable it, and one where you would keep it off for latency reasons.' },
      { level: 'design', prompt: 'Spec a meeting-notes product\'s "what did I miss" summary feature. Write the one line of UI copy that tells a user whether the summary is transcript-based (words only) or audio-based (tone and speaker aware), and justify which one you would ship first for cost.' },
    ],
    furtherReading: [
      { label: 'Radford et al. - Whisper (arXiv:2212.04356)', url: 'https://arxiv.org/abs/2212.04356', why: 'The paper that made transcription a commodity; the 680k-hour training recipe explains why it hears speech so well and music so poorly.' },
      { label: 'Chu et al. - Qwen-Audio (arXiv:2311.07919)', url: 'https://arxiv.org/abs/2311.07919', why: 'The multi-turn, richer-data step between SALMONN and AF3 on the MMAU arc.' },
      { label: 'Goel et al. - Audio Flamingo 3 (arXiv:2507.08128)', url: 'https://arxiv.org/abs/2507.08128', why: 'Section 4 covers on-demand thinking in detail; the current open state of the art at MMAU 0.72.' },
      { label: 'Tang et al. - SALMONN (arXiv:2310.13289)', url: 'https://arxiv.org/abs/2310.13289', why: 'The first open audio-LLM with real reasoning ability, and the architecture AF3 still resembles at a high level.' },
      { label: 'Gong et al. - LTU (arXiv:2305.10790)', url: 'https://arxiv.org/abs/2305.10790', why: 'A smaller, chain-of-thought-focused design that shows reasoning depth does not require frontier parameter count.' },
    ],
    shipIt: {
      kind: 'rubric',
      name: 'Cascade vs end-to-end audio feature rubric',
      body: '- Is the answer fully contained in words, with no tone, speaker, or timing component? -> cascade is sufficient.\n- Does the feature need mood, emotion, or sentiment beyond word choice? -> end-to-end required.\n- Does the feature need to distinguish who is speaking? -> end-to-end required.\n- Does the feature need to locate a sound event in time (an explosion, a door slam)? -> end-to-end required.\n- Does the feature involve music, singing, or environmental sound? -> end-to-end required.\n- Is deepfake or authenticity detection in scope? -> end-to-end required, cascade cannot see the waveform.\n- If two or more end-to-end rows are checked, budget for an audio-LLM (AF3-class), not a transcription API.',
    },
    demoCaption:
      'This is what your meeting-notes AI receives when the pipeline is transcribe-then-reason. Reveal what the audio actually carried and the transcript silently dropped.',
    demo: {
      archetype: 'reveal',
      opaqueLabel: 'Transcript: "Fine. Let\'s go with your plan then."',
      revealedLines: [
        'tone: clipped, flat pitch, 40% louder than baseline (frustration)',
        'speaker: Priya, not Sam (the transcript does not know who)',
        '2.1s pause before "Fine." (hesitation, lost in text)',
        'keyboard slam at 00:41 (environmental context, gone)',
        'sarcastic stress on "your" (meaning inverted, not transcribed)',
      ],
      badCaption:
        'The misreading: the transcript says agreement, so the cascade summarizes "team aligned on the plan". The LLM reasoned perfectly over the text it was given.',
      goodCaption:
        'The mechanism: an end-to-end audio-LLM receives the acoustics themselves as tokens. Frustration, speaker identity, and timing are in its input, so they can be in its answer. The cascade never had them.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'your meeting AI thinks "Fine. Let\'s go with your plan then." is agreement. the audio knows it is surrender.',
        body:
          'your meeting AI thinks "Fine. Let\'s go with your plan then." is agreement. the audio knows it is surrender.\n\nmost audio products are a cascade: Whisper transcribes, an LLM reasons over the text. tone, speaker identity, pauses, sarcasm: all discarded at the transcription step.\n\nend-to-end audio-LLMs feed the sound in directly. the difference is not model quality. it is what the model was allowed to hear.',
      },
      {
        kind: 'X · design angle',
        hook: 'before you promise an audio AI feature, ask one question: is the answer in the words or in the sound?',
        body:
          'before you promise an audio AI feature, ask one question: is the answer in the words or in the sound?\n\nin the words: summaries, action items, search. a cheap transcribe-then-reason cascade handles it.\n\nin the sound: emotion, who spoke, music, when it happened. structurally impossible for the cascade at any model size.\n\nthat line belongs in the spec, not in the QA report.',
      },
      {
        kind: 'X · one-liner',
        hook: 'audio models do not hear. they read a picture of the sound.',
        body:
          'audio models do not hear. they read a picture of the sound.\n\nwaveform -> log-Mel spectrogram: a 2D image of time vs frequency. a 30-second clip becomes a (3000, 80) array, and from there it is the vision playbook: encoder, Q-former, LLM.\n\nonce audio is an image, everything multimodal already built just applies.',
      },
    ],
    source: {
      label: 'Full lesson: 12.19 audio-language-whisper-to-af3',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/12-multimodal-ai/19-audio-language-whisper-to-af3',
    },
  },
  {
    id: 'p12-20-omni-thinker-talker',
    phase: 'Phase 12 · Multimodal AI',
    part: 'Part 4 · Video, audio, and omni models',
    index: '12.20',
    title: 'Omni models: the Thinker-Talker split',
    oneLiner:
      'Real-time voice AI feels human under about 500ms round-trip. The trick: split the model in two, a big Thinker deciding what to say and a small Talker saying it before the thought finishes.',
    readTime: '~10 min read',
    diagram: '/lessons/p12-20.svg',
    diagramCaption:
      'The Thinker-Talker pipeline: mic to audio tokens, Thinker emitting text tokens, Talker converting each into speech tokens, and the streaming decoder playing audio while the Thinker is still mid-thought.',
    whyItMatters:
      'Voice UX lives or dies on a number users never see: time to first audio byte. Above about half a second the assistant feels like a phone tree; near 250ms it feels like a person. That number is a budget spent across mic capture, prefill, and synthesis, and design decisions you own, persona verbosity, system prompt length, whether vision-in is on, spend real milliseconds from it. GPT-4o\'s 2024 demo was disruptive as a product shape, not a model: the same reasoning with streaming speech attached reads as a different species.',
    learningObjectives: [
      'Split a real-time voice pipeline into its seven latency-contributing stages and assign each an approximate millisecond cost.',
      'Explain why the Talker must stay small using the 50-tokens-per-second constraint, not intuition about model quality.',
      'Compare the Thinker-Talker split (Qwen2.5-Omni) against the fused inner-monologue design (Moshi) on latency and training complexity.',
      'Describe what TMRoPE contributes to an omni model beyond what it contributes to a video-only model.',
      'Decide between half-duplex and full-duplex turn-taking for a stated product scenario, and name the training requirement full-duplex adds.',
    ],
    sections: [
      {
        heading: 'The problem: every step adds latency, nothing can batch',
        body: 'A real-time voice assistant has to hear (tokenize speech live, detect via voice activity detection when the user has stopped), optionally see (camera frames streaming in at 2 to 4 FPS), think (compose a response conditioned on the conversation history), and speak (synthesize speech tokens, decode them to waveform, stream the result to speakers), all without a pause between steps.\n\nConversational feel requires the whole round trip to land under about 500ms; below that threshold, the lag stops registering as lag. GPT-4o claims around 250ms, Moshi about 160ms, Qwen2.5-Omni 350 to 500ms. The constraint that shapes every design choice downstream: every stage must stream. Any component that waits for a complete input before it starts working blows the budget on its own.',
      },
      {
        heading: 'The split: a big Thinker, a deliberately small Talker',
        body: 'Qwen2.5-Omni (March 2025), the reference open design, decomposes the job into two models instead of one. The Thinker is a 7B-to-80B transformer consuming interleaved text, image, and audio tokens, and it emits text: what to say. The Talker is a 200M-to-1B transformer that consumes that text stream plus recent speech context, and it emits discrete speech tokens; a streaming decoder turns those into waveform in real time.\n\nThe asymmetry is the entire point. Reasoning quality scales with the Thinker\'s size. The Talker\'s job is local, text to speech tokens, so a bigger Talker is not more expressive, just slower. The two run in parallel: by the time the Thinker reaches its fourth text token, audio for the first three is already playing.',
      },
      {
        heading: 'Why the Talker must be small: token-rate math',
        body: 'Speech at 16 kHz with 50 Hz base speech tokens needs 50 tokens generated per second of audio, forever, without ever falling behind. Typical LLM throughput on an H100 sits at 30 to 80 tokens per second, so a 7B model pressed into service as its own mouth would starve mid-sentence the first time reasoning got expensive. A 200-to-300M Talker clears the 50-tokens-per-second bar with headroom to spare.\n\nMoshi (October 2024) proves the two-model split is a design choice, not a law of physics: one 7B transformer emits text and speech tokens on alternating positions, with an "inner monologue" separating the thinking stream from the speaking stream inside a single set of weights. Effectively Thinker and Talker fused by training, and at 160ms it is the fastest open implementation that exists.',
      },
      {
        heading: 'Mini-Omni and the streaming interleave',
        body: 'Mini-Omni (Xie & Wu, 2024) established the pattern both Qwen2.5-Omni and Moshi build on: language models can hear, talk while thinking, in streaming. The Thinker\'s output tokens and the Talker\'s output tokens interleave inside the same generation loop, with no batch boundary anywhere in the sequence. The Talker fires the instant the Thinker commits its next text token, rather than waiting for a sentence or even a complete word.\n\nThis is the detail that turns "the model is fast" into "the model feels instant." A model can generate a complete reply quickly and still feel slow in conversation, if it generates the whole reply before speech synthesis is allowed to begin. Streaming interleave removes that wait entirely, and it is a training-time decision, not something a faster GPU fixes afterward.',
      },
      {
        heading: 'TMRoPE again: aligning eyes, ears, and text on one clock',
        body: 'The Thinker ingests camera frames at 4 FPS, audio frames at 50 per second, and text, all arriving at once and needing a shared sense of time. Naive ordering, all images first, then all audio, then text, destroys simultaneity entirely. TMRoPE stamps every token with its absolute timestamp instead: a vision token at t=2.3s, an audio token at t=2.32s, the user\'s "stop" at t=2.35s all rotate to nearly identical positions, so the model perceives them as concurrent rather than sequential.\n\nThis is the infrastructure that makes "he waved while saying hello" resolvable at all. The same encoding that gave video models temporal grounding in an earlier lesson gives omni models a shared clock across every modality feeding the Thinker at once.',
      },
      {
        heading: 'VAD and turn-taking: half-duplex versus full-duplex',
        body: 'Voice activity detection runs on the input side, watching for a roughly 200ms silence threshold that signals the user has finished their turn. Half-duplex, strict alternation, user speaks then model speaks, is the default across nearly every shipping voice product, because it is simple to reason about and simple to debug when it goes wrong.\n\nFull-duplex, where both parties can speak at once and the model can backchannel ("uh-huh") or interrupt mid-sentence, is much harder, because it requires a model trained to generate speech while it is still listening, not just a UI that allows overlapping audio. Moshi supports full-duplex natively; Qwen2.5-Omni supports half-duplex by default and leaves full-duplex handling to the application layer.',
      },
      {
        heading: 'The budget, line by line',
        body: 'Time to first audio byte, component by component: mic to audio tokens, 40 to 80ms. Prefill over the prompt and conversation history, 100 to 200ms at 7B and considerably more at 70B. First Thinker text token, 40ms. Talker consuming it, 20ms. First speech tokens committed, 40ms. Residual-VQ decode, 30ms. Waveform decode, 50 to 80ms. Total: 320 to 510ms at 7B, 600 to 900ms at 70B.\n\nFrontier reasoning quality tends to want 70B-plus, which is exactly where the frontier latency gap comes from: the better-reasoning model is also the slower-talking one, and closing that gap is an active area, not a solved one.',
      },
      {
        heading: 'Qwen3-Omni and where the gap closed',
        body: 'Qwen3-Omni (November 2025) pushed the open side of this arc further: a Qwen3-80B Thinker, a larger Talker, and an improved TMRoPE-v2, landing latency close to GPT-4o\'s 250ms with open weights, something no open model managed a year earlier. On OmniBench, the benchmark spanning combined vision-audio-text reasoning, it lands competitively against Gemini 2.0 Live.\n\nThe arc from Qwen2.5-Omni\'s 350-500ms to Qwen3-Omni\'s near-250ms in eight months says the Thinker-Talker split is not a fixed ceiling; it keeps absorbing better training and better decoders. For a product spec written today, the latency budget worth designing against is closer to "the number will keep improving" than "this is the floor."',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/p12-20-inline-pipeline.svg',
        alt: 'Thinker-Talker parallel streaming pipeline',
        caption: 'The Thinker emits text token by token; the Talker converts each one to speech tokens immediately, so audio for token 1 plays while the Thinker is still writing token 4.',
        diagramBrief: 'Cream paper background, black ink, one accent color. Two horizontal lanes stacked. Top lane labeled "Thinker": a row of 6 small boxes labeled t1 through t6, generated left to right. Bottom lane labeled "Talker + decoder", offset slightly to the right, with accent-colored sound-wave icons appearing under t1, t2, t3 while the Thinker box for t4 is still highlighted as "in progress". Add a vertical dashed line at t4 labeled "audio for t1-t3 already playing".',
      },
      {
        src: '/lessons/p12-20-inline-latency-budget.svg',
        alt: 'Time-to-first-audio-byte budget breakdown',
        caption: 'Seven stages sum to 320-510ms at 7B and 600-900ms at 70B; each stage is a place a product decision spends milliseconds.',
        diagramBrief: 'Cream paper background, black ink, one accent color. A single horizontal stacked bar divided into 7 segments proportional to: mic (40-80ms), prefill (100-200ms), first Thinker token (40ms), Talker (20ms), first speech tokens (40ms), residual-VQ decode (30ms), waveform decode (50-80ms). Label each segment with its name and ms range. Draw a bracket under the whole bar labeled "total: 320-510ms at 7B" and a second, longer ghosted bar below labeled "600-900ms at 70B" for comparison.',
      },
    ],
    takeaways: [
      'Voice UX is a latency budget: about 500ms total, spent across seven pipeline stages. Every design choice that lengthens prefill spends from it.',
      'Split the model by job: reasoning scales with size, speech synthesis is rate-bound. A big Talker is not better, it is late.',
      'The Talker must sustain 50 tokens per second of audio forever. Throughput, not quality, sizes the mouth.',
      'Half-duplex vs full-duplex is an interaction-design decision with an architecture bill: interruptions and backchannels need a model trained to listen while speaking.',
    ],
    terms: [
      { term: 'Thinker', gloss: '"the reasoning brain"', meaning: 'The large (7B-80B) text-generating transformer that consumes interleaved text, image, and audio tokens and decides what to say next.' },
      { term: 'Talker', gloss: '"the speaking mouth"', meaning: 'A small (200M-1B) transformer that converts the Thinker\'s text stream, plus recent speech context, into discrete speech tokens in real time.' },
      { term: 'TTFAB', gloss: '"the latency number"', meaning: 'Time to first audio byte, measured from the moment the user stops speaking to the first sample of the reply\'s audio playing.' },
      { term: 'TMRoPE', gloss: '"time-aligned RoPE"', meaning: 'A position encoding that stamps every token, vision, audio, or text, with its absolute timestamp, so the Thinker perceives a gesture and the word describing it as concurrent.' },
      { term: 'Half-duplex', gloss: '"turn-taking"', meaning: 'A conversational pattern where the user and model strictly alternate, with a voice-activity-detection silence threshold (roughly 200ms) signaling when the user has finished.' },
      { term: 'Full-duplex', gloss: '"talk over each other"', meaning: 'A pattern where both parties can speak at once; the model can backchannel or interrupt, which requires training the model to listen while it is speaking.' },
      { term: 'Inner monologue', gloss: '"Moshi\'s trick"', meaning: 'Moshi\'s single-model design where a thinking-token stream and a speaking-token stream interleave inside one transformer, fusing Thinker and Talker into one set of weights.' },
      { term: 'VAD', gloss: '"silence detector"', meaning: 'Voice activity detection; the mechanism that watches the incoming audio stream for a silence threshold and signals that the user has finished their turn.' },
      { term: 'Residual-VQ', gloss: '"how speech becomes tokens"', meaning: 'Residual vector quantization, the technique that converts continuous speech into a sequence of discrete token indices the Talker can generate and a decoder can reconstruct.' },
      { term: 'Streaming decoder', gloss: '"the thing that makes sound"', meaning: 'A waveform decoder (the SNAC or MoVQGAN family) that converts speech tokens into audio samples continuously, without waiting for a complete utterance.' },
      { term: 'Token-rate math', gloss: '"can the mouth keep up"', meaning: 'The constraint that a Talker must sustain at least 50 speech tokens per second (at 16 kHz, 50Hz base tokens) forever, which is why a large, slower model cannot serve as its own voice.' },
      { term: 'OmniBench', gloss: '"the omni-model leaderboard"', meaning: 'A benchmark comparing omni models\' combined vision-audio-text reasoning quality, cited when comparing Qwen3-Omni against Gemini 2.0 Live.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Your target TTFAB is 300ms on a 7B Thinker and a 300M Talker. Using the per-stage numbers in this lesson, write out every component\'s latency and check whether the budget is met.' },
      { level: 'medium', prompt: 'A camera catches a user\'s gesture at t=1.2s while they start speaking at t=1s. Describe what the Thinker\'s input sequence looks like under naive frame-then-audio-then-text ordering, versus under TMRoPE, and why only one lets the model reason about "he waved while saying hello."' },
      { level: 'medium', prompt: 'Speech requires 50 tokens per second of output, sustained. Given a Talker throughput of 60 tokens per second, how many seconds of audio backlog build up per minute if reasoning briefly spikes and steals 10 percent of that throughput?' },
      { level: 'hard', prompt: 'Moshi fuses Thinker and Talker into one 7B model using an "inner monologue" separation instead of Qwen2.5-Omni\'s two-model split. Explain what Moshi gives up and what it gains in latency, and when you would pick the fused design over the split one.' },
      { level: 'design', prompt: 'A voice assistant persona spec asks for longer, warmer responses and an always-on camera feed. Using the latency budget in this lesson, write the one-paragraph tradeoff memo explaining to a non-technical stakeholder why both requests spend milliseconds from the same 500ms budget, and what you would cut first.' },
    ],
    furtherReading: [
      { label: 'Xu et al. - Qwen2.5-Omni (arXiv:2503.20215)', url: 'https://arxiv.org/abs/2503.20215', why: 'The reference Thinker-Talker architecture this lesson is built from, including the full latency budget breakdown.' },
      { label: 'Défossez et al. - Moshi (arXiv:2410.00037)', url: 'https://arxiv.org/abs/2410.00037', why: 'Section 4 explains the "inner monologue" fused design; the fastest open TTFAB at 160ms on a single A100.' },
      { label: 'Xie & Wu - Mini-Omni (arXiv:2408.16725)', url: 'https://arxiv.org/abs/2408.16725', why: 'The paper that established streaming interleave: the Talker fires as soon as the Thinker commits its next token.' },
      { label: 'Qwen Team - Qwen3-Omni (arXiv:2509.17765)', url: 'https://arxiv.org/html/2509.17765v1', why: 'The November 2025 successor, closing most of the latency gap to GPT-4o with open weights.' },
      { label: 'Zeng et al. - GLM-4-Voice (arXiv:2412.02612)', url: 'https://arxiv.org/abs/2412.02612', why: 'Shows the Thinker-Talker pattern extended to a second language ecosystem, useful if a product needs bilingual voice.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Voice product latency budget checklist',
      body: '- What is the target time-to-first-audio-byte, and does it assume a 7B or 70B Thinker?\n- Does the system prompt length or persona verbosity add measurable prefill time?\n- Is vision-in (camera) enabled, and has its prefill cost been added to the budget?\n- Does every stage stream, or does any stage wait for a complete input before starting?\n- Is the interaction half-duplex (turn-taking) or full-duplex (interrupts, backchannel)? Full-duplex needs a model trained for it, not just a UI affordance.\n- Does the Talker\'s token rate exceed 50 tokens per second of audio, sustained, at the chosen model size?',
    },
    demoCaption:
      'Two ways to schedule the same reply. Step through the batch pipeline, then the streaming one, and watch where the first audible word lands.',
    demo: {
      archetype: 'sequence',
      badLabel: 'Batch pipeline',
      goodLabel: 'Streaming Thinker-Talker',
      badSequence: [
        'user stops speaking (VAD fires)',
        'Thinker generates the FULL reply text',
        'synthesizer renders the FULL waveform',
        'audio starts playing: 2-4s later',
        'user has already said "hello??"',
      ],
      goodSequence: [
        'user stops speaking (VAD fires)',
        'Thinker emits text token 1',
        'Talker converts it to speech tokens immediately',
        'decoder streams audio: first word at ~350ms',
        'Thinker still writing while the reply is audible',
      ],
      badCaption:
        'The misreading: "we need a faster model". The model was never the bottleneck; the pipeline waits for every stage to finish before the next starts, so latency is the sum of everything.',
      goodCaption:
        'The mechanism: every stage streams. The Talker fires on each text token as the Thinker commits it, so time to first audio is the sum of first-token latencies, not full-generation times.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'why voice AI needs two models: the brain cannot keep up with the mouth.',
        body:
          'why voice AI needs two models: the brain cannot keep up with the mouth.\n\nspeech needs 50 tokens per second of audio, sustained. an H100 pushes an LLM at 30-80 tok/s, so a 7B model speaking for itself starves mid-sentence.\n\nthe fix: a 7-80B Thinker decides what to say, a ~300M Talker says it. the mouth is small because the job is local.',
      },
      {
        kind: 'X · design angle',
        hook: 'your voice assistant\'s persona has a latency bill.',
        body:
          'your voice assistant\'s persona has a latency bill.\n\ntime to first audio byte is a budget: mic 40-80ms, prefill 100-200ms, thinking 40ms, synthesis ~140ms. total ~350-500ms before it feels like a phone tree.\n\na longer system prompt spends prefill. vision-in spends prefill. verbosity spends everything. persona design is latency design.',
      },
      {
        kind: 'X · one-liner',
        hook: 'the voice assistant starts talking before it finishes thinking. that is the whole trick.',
        body:
          'the voice assistant starts talking before it finishes thinking. that is the whole trick.\n\nby the time the Thinker writes token four, audio for tokens one through three is already playing. streaming does not hide the latency. it never accumulates it.',
      },
    ],
    source: {
      label: 'Full lesson: 12.20 omni-models-thinker-talker',
      url: 'https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/12-multimodal-ai/20-omni-models-thinker-talker',
    },
  },
];
