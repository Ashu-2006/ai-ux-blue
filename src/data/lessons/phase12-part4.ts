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
      'Video is not a stack of photos: it has ordering, actions, and timing. The models that can answer "at what second does the cat jump?" earned it through one specific mechanism, timestamps baked into position encoding.',
    readTime: '~8 min read',
    diagram: 'lessons/p12-17.svg',
    diagramCaption:
      'Three temporal designs side by side: Q-former per clip, pooled tokens per frame, and TMRoPE with an absolute timestamp on every token.',
    whyItMatters:
      'Every "jump to the moment" feature (video search that scrubs to the answer, chapter markers, moderation flags with timestamps, sports highlights) depends on whether the model knows time as an absolute value or only as a frame index. That is an architecture choice, not a prompt choice. If the model you build on encodes "frame 15" instead of "4.2 seconds", your UI can never offer a precise seek target, and no copy tweak fixes it. Knowing the frame-sampling and pooling levers also explains why video answers cost what they cost, and what a "fast vs detailed" video setting actually trades.',
    sections: [
      {
        heading: 'The problem: a minute of video is 352k tokens',
        body: 'One minute at 30 FPS is 1800 frames. At 196 visual tokens per frame, that is roughly 352,000 tokens, larger than any 2024-era LLM context. Video models survive by throwing information away in three places: subsample frames (1 to 8 FPS depending on content), pool each frame\'s patch tokens (a 3x3 pool cuts 576 tokens to 64), or compress whole clips through a Q-former.\n\nEach cut loses something different. Subsampling loses temporal detail, pooling loses spatial detail, clip compression loses a little of both. The second axis, easy to miss, is how the model knows frame 5 came before frame 6 at all.',
      },
      {
        heading: 'First generation: compress the clip, lose the clock',
        body: 'Video-LLaMA (2023), the first open video-LLM, took 16-frame clips at 2 FPS, ran a video Q-former across all 16 frames, and handed the LLM 32 learned queries per clip, plus a parallel audio branch built the same way. Video-LLaVA simplified: one encoder trained on both images and frames, an MLP projector, 8 frames.\n\nBoth worked for "what happens in this clip". Neither could locate anything in time. Position was per clip or per frame index, so the best possible answer to "when does the cat jump?" was "early in the clip". The clock was not in the representation.',
      },
      {
        heading: 'TMRoPE: put the timestamp in the geometry',
        body: 'Qwen2.5-VL\'s TMRoPE gives every patch token a 3D position (t, h, w) where t is the actual timestamp, not the frame index. The rotation applied to each token\'s attention vectors encodes "this happened at 4.2 seconds" directly.\n\nThree consequences. Absolute time: the model can output "at 4.2 seconds", not "around frame 15". Per-token rotation: every visual token carries its own moment. Dynamic FPS compatibility: sample at 2 FPS in quiet stretches and 4 FPS in action, and the uneven spacing is handled natively because position is time, not sequence order. This one encoding change is what closed most of the gap with proprietary video models.',
      },
      {
        heading: 'Sampling and pooling: the budget levers',
        body: 'Uniform sampling takes N frames evenly and misses motion peaks. Dynamic FPS uses frame differencing to sample densely where things move. Event-driven sampling runs a lightweight detector first. Keyframe sampling cuts at shot boundaries for cinematic content.\n\nThen pool. At 1 FPS and 576 tokens per frame, a 5-minute clip is 172,800 tokens: technically fits a 128k-context 72B model only after trimming. A 3x3 bilinear pool takes it to 19,200 tokens, the sweet spot for most tasks. A 6x6 pool (16 tokens per frame) suits agent workflows where spatial detail matters less. The 2026 recipe: dynamic FPS, 3x3 pooling, TMRoPE-style encoding.',
      },
      {
        heading: 'Grounding outputs, and how to test them',
        body: 'Three output formats exist for time-localized answers. Free text ("around the 4-second mark") is easy to read and imprecise. Structured JSON with event, start, and end fields parses directly into a seek action; Qwen2.5-VL trains on it. Token-based formats interleave special time tokens with the answer for maximum precision.\n\nEvaluation splits across four benchmarks that stress different axes: VideoMME spans short to long clips, TempCompass isolates before-and-after ordering, EgoSchema tests reasoning over 3-plus minutes of first-person video, and Video-MMMU covers multi-discipline questions. A model can ace one and fail another; ask which axis your product needs.',
      },
    ],
    takeaways: [
      'Temporal grounding is an encoding property, not a prompting trick. If timestamps are not in the position encoding, "at what second" is unanswerable.',
      'Video token cost = frames sampled x tokens per frame after pooling. Both levers are yours to reason about when scoping a video feature.',
      'Structured JSON grounding output ({event, start, end}) is what turns a model answer into a seek action in UI.',
      'Benchmarks stress different axes: TempCompass is ordering, EgoSchema is long-horizon. Pick the one that matches the job, not the leaderboard.',
    ],
    terms: [
      { term: 'Temporal grounding', meaning: 'The model outputs a specific timestamp range for when an event happens in the video.' },
      { term: 'TMRoPE', meaning: 'Rotary position encoding where every token carries an absolute timestamp plus its spatial grid position.' },
      { term: 'Dynamic FPS', meaning: 'Motion-aware sampling: more frames where the video moves, fewer where it is static.' },
      { term: 'Frame pooling', meaning: 'Reducing each frame\'s patch tokens by bilinear interpolation (3x3 turns 576 into 64) before the LLM.' },
      { term: 'Video Q-former', meaning: 'A cross-attention bottleneck that compresses a whole clip of frames into a fixed set of learned queries.' },
      { term: 'VideoMME', meaning: 'The comprehensive video benchmark spanning short, medium, and long clips, 2500-plus samples.' },
    ],
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
      'An hour of video overflows every context window that exists. Four escape routes emerged: buy a bigger context, distribute attention across devices, compress clips to summary tokens, or stop feeding the video in at all and retrieve from it instead.',
    readTime: '~8 min read',
    diagram: 'lessons/p12-18.svg',
    diagramCaption:
      'The token budget wall: video duration against token count, with the four scaling paths (brute context, ring attention, compression, retrieval) marked where each takes over.',
    whyItMatters:
      'When a stakeholder asks "can users chat with a 2-hour recording?", the honest answer is a strategy choice with distinct UX signatures. Brute context is accurate and slow and expensive per query. Compression is cheap but sometimes misses the exact frame, so the UI needs a "not fully sure" affordance. Retrieval is fast and cheap but only as good as its index, and it fails silently when the index misses. The duration slider in your product spec quietly picks the architecture, and the architecture picks the failure mode your empty states and confidence treatments must handle.',
    sections: [
      {
        heading: 'The problem: duration times FPS times tokens per frame',
        body: 'The math is unforgiving. At 384px native resolution a frame is about 729 tokens; a 3x3 pool cuts that to 81. A 30-minute clip at 1 FPS is 1800 frames, 145,800 tokens: doable on 2025 open VLMs, tight. Double to 2 FPS and it is 291,600, and only the biggest contexts fit. A 2-hour movie at 1 FPS is 583,000 tokens, beyond most 2026 open models.\n\nA 1-hour 4K video, fully patched with nothing thrown away, is on the order of 60 million tokens. Nobody processes that raw. Every long-video system is a compromise, and there are exactly four families of compromise.',
      },
      {
        heading: 'Path 1: brute context',
        body: 'Scale the window until the video fits. Gemini 1.5 opened this era in March 2024 with contexts from 1M to 10M tokens and documented needle-in-a-haystack recall of 99.7 percent up to about 9.5M tokens. Gemini 2.5 Pro handles hours of video reliably in 2026.\n\nThe engineering behind it (a memory hierarchy of local, global, and sparse attention plus MoE routing) is not fully published and not open source. Brute context is the accuracy king and the closed-model moat: you rent it per token, and an hour of video is a lot of tokens on every single query.',
      },
      {
        heading: 'Paths 2 and 3: distribute or compress',
        body: 'Ring attention splits the sequence across devices arranged in a ring; each holds a chunk, computes partial attention, and rotates. Training compute scales linearly with context instead of quadratically. LWM trained a 1M-token model this way; LongVILA adapted it to video, packing 1400 frames at 192 tokens each into a 268k context across 8-way parallelism.\n\nToken compression is cheaper: Video-XL collapses each clip of N frames into a single summary token, and LongVA stretches context from 200k to 2M by training long on text and transferring to video. The cost is precision: the model knows what generally happened but sometimes misses the exact frame.',
      },
      {
        heading: 'Path 4: stop feeding, start retrieving',
        body: 'VideoAgent treats the video as a database, not an input. The LLM reads the question, asks a retrieval tool for relevant segments ("show me clips with a cat"), gets timestamps back, reads only those clips through a VLM, and composes the answer or queries again.\n\nInference is cheap because only relevant clips are ever encoded. And on 2-plus-hour content, retrieval can match or beat raw context, because a good index hits the needle regardless of how long the haystack is. The catch: retrieval quality becomes the whole system\'s ceiling, and a bad index fails silently, returning a confident answer built on the wrong clips.',
      },
      {
        heading: 'What production actually does: hybrid',
        body: 'The needle-in-a-haystack numbers draw the map. Gemini 2.5 Pro holds above 99 percent recall out to 90-minute videos; open 72B models (Qwen2.5-VL-72B, InternVL3-78B) sit around 85 to 90 percent at 30 minutes and degrade past 60.\n\nSo 2026 production pipelines blend the paths: run dynamic-FPS sampling with aggressive pooling to get a roughly 100k-token global representation, pass it to a 72B VLM for the overall summary, then answer detailed questions through agentic retrieval that uses the summary as its index. Global understanding from context, local precision from retrieval, cost from neither alone.',
      },
    ],
    takeaways: [
      'Long-video capacity is arithmetic: duration x FPS x tokens-per-frame-after-pooling. Run the numbers before promising a duration in a spec.',
      'The four paths trade differently: brute context buys recall with cost, compression buys scale with precision, retrieval buys cost with index risk.',
      'Retrieval fails silently. If your product uses it, design for confident-but-wrong answers, not just slow ones.',
      'Production is hybrid: pooled global summary for the overview, retrieval for the detail question. Two UX modes, one pipeline.',
    ],
    terms: [
      { term: 'Brute context', meaning: 'Scale the LLM context to millions of tokens and process the whole video in one pass.' },
      { term: 'Ring attention', meaning: 'Distributed attention where each device holds a sequence chunk and rotates it around a ring, making training scale linearly.' },
      { term: 'Token compression', meaning: 'A learned compressor that collapses each clip into summary tokens before the LLM sees the sequence.' },
      { term: 'Agentic retrieval', meaning: 'An LLM queries a retrieval tool for relevant clips, reads only those via a VLM, and composes the answer.' },
      { term: 'Needle-in-a-haystack', meaning: 'The long-context test: hide a unique marker at a random point and measure whether the model recalls it.' },
      { term: 'Hierarchical summary', meaning: 'Summarize chunks, then summarize the summaries; the fallback when nothing else fits the duration.' },
    ],
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
      'Whisper made transcription a commodity. But a transcript is not the audio: emotion, speakers, music, and timing all live in the sound and die in the text. Audio-LLMs feed the sound itself into the model.',
    readTime: '~8 min read',
    diagram: 'lessons/p12-19.svg',
    diagramCaption:
      'The arc from ASR to audio reasoning: waveform to log-Mel spectrogram, through paired Whisper and BEATs encoders, into an audio Q-former, into the LLM.',
    whyItMatters:
      'Products keep shipping "AI that understands your calls" built on a transcribe-then-summarize cascade, and users keep noticing what it misses: who was frustrated, who interrupted whom, what the mood was. Those are not model quality gaps; they are pipeline gaps. The transcript physically does not contain them. Knowing where the cascade\'s ceiling sits tells you which features are safe to promise on cheap infrastructure (summaries, action items) and which require an end-to-end audio model (emotion, speaker dynamics, music, anything time-located in sound). That line belongs in the product spec, not discovered in QA.',
    sections: [
      {
        heading: 'The problem: recognition is not reasoning',
        body: 'Whisper (2022) settled speech recognition with 680k hours of weakly supervised multilingual audio and a plain encoder-decoder transformer. OCR-of-audio became a commodity.\n\nBut commodity stops at the transcript. "What instruments are in this recording?", "what emotion is the speaker expressing?", "at what second does the explosion happen?": none of these are answerable from text, because the answer was in the acoustics and transcription discarded it. Three routes exist: cascade (transcribe, then reason over text), end-to-end (audio tokens straight into the LLM), or a hybrid that can do both. The interesting engineering is in the second and third.',
      },
      {
        heading: 'The shared input: log-Mel spectrogram',
        body: 'Every audio encoder starts from the same feature. Resample to 16 kHz. Slice with 25ms windows hopping every 10ms and take a Fourier transform of each slice. Warp the frequencies through about 80 Mel filter banks so resolution matches human hearing, then log-compress the magnitudes.\n\nThe result is a 2D array of time frames by 80 frequency bins: a 30-second clip becomes a (3000, 80) image of sound. That is the move worth remembering: audio becomes an image, and from there the machinery is familiar. Patches, transformer encoder, one hidden vector per time frame.',
      },
      {
        heading: 'Two ears: Whisper for words, BEATs for everything else',
        body: 'Whisper\'s encoder was trained on speech-dominant data, so it hears language well and music and environmental sound poorly. BEATs, a self-supervised transformer trained on AudioSet, captures exactly what Whisper misses at the same parameter count: instruments, ambience, mechanical sounds.\n\nAudio Flamingo 3\'s answer is both: concatenate Whisper features (the linguistic signal) with BEATs features (the acoustic signal) into one input. Then the BLIP-2 pattern from lesson 12.03 repeats verbatim: a Q-former with 64 learnable queries cross-attends over the encoder frames and hands the LLM a fixed set of audio tokens. Same adapter economics, new modality.',
      },
      {
        heading: 'The arc: SALMONN to Qwen-Audio to AF3',
        body: 'Progress is legible on MMAU, the 10,000-question benchmark spanning speech, music, and environmental sound. SALMONN (2023), the first open audio-LLM with real reasoning: about 0.55. Qwen-Audio, richer data and multi-turn tuning: about 0.60. Audio Flamingo 3 (NVIDIA, July 2025), an 8B backbone with the Whisper-plus-BEATs hybrid encoder and 1M-plus instruction pairs: 0.72, against a proprietary frontier around 0.78.\n\nAF3 also added on-demand chain-of-thought for audio: the model can emit thinking tokens ("let me identify the instruments first") before answering, lifting complex-task accuracy 3 to 5 points. The open-closed gap here is smaller than video\'s.',
      },
      {
        heading: 'Cascade or end-to-end: the product line',
        body: 'The cascade (Whisper transcribes, LLM reasons) is cheaper, simpler, and completely sufficient for "summarize this podcast". It structurally cannot do: mood of a song (in the sound, not the words), who is speaking (speaker identity is acoustic), when the explosion happens (timing dissolves in text), or whether audio is a deepfake (detection needs the waveform\'s fingerprint).\n\nThe 2026 recipe is honest about this: cascade when transcription is genuinely the goal and there is no music, emotion, or speaker question in the roadmap. End-to-end (AF3, Qwen-Audio family) the moment any of those appear. The mistake is shipping the cascade and promising the other list.',
      },
    ],
    takeaways: [
      'A transcript is a lossy render of audio. Emotion, speakers, music, and timing are discarded at the transcription step, unrecoverable downstream.',
      'Audio becomes an image (the log-Mel spectrogram), and then the whole vision playbook applies: encoder, Q-former, frozen LLM.',
      'Pairing encoders is the trick: Whisper hears words, BEATs hears the world, AF3 concatenates both.',
      'Spec features against the pipeline: summaries are cascade-safe; anything acoustic (mood, speakers, timing) requires end-to-end. Draw that line before committing a roadmap.',
    ],
    terms: [
      { term: 'Log-Mel spectrogram', meaning: 'A 2D time-by-frequency array of log magnitudes after Mel filtering; the image of sound every encoder eats.' },
      { term: 'Audio Q-former', meaning: 'Learnable queries that cross-attend over audio encoder frames and emit a fixed set of audio tokens for the LLM.' },
      { term: 'Cascaded pipeline', meaning: 'Whisper transcribes, a text LLM reasons over the transcript; all acoustic information is lost at the handoff.' },
      { term: 'End-to-end audio-LLM', meaning: 'Audio features enter the LLM directly, preserving emotion, speaker, and environmental signal.' },
      { term: 'BEATs', meaning: 'A self-supervised audio encoder trained on AudioSet; strong on music and environmental sound where Whisper is weak.' },
      { term: 'MMAU', meaning: 'The audio reasoning benchmark: 10k QA pairs across speech, music, and environment; open SOTA 0.72 vs frontier 0.78.' },
    ],
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
      'Real-time voice AI feels conversational under roughly 500ms of round-trip. The architecture that gets there splits the model in two: a big Thinker that decides what to say and a small Talker that starts saying it before the thought is finished.',
    readTime: '~8 min read',
    diagram: 'lessons/p12-20.svg',
    diagramCaption:
      'The Thinker-Talker pipeline: mic to audio tokens, Thinker emitting text tokens, Talker converting each into speech tokens, and the streaming decoder playing audio while the Thinker is still mid-thought.',
    whyItMatters:
      'Voice UX lives or dies on a number users never see: time to first audio byte. Above about half a second the assistant feels like a phone tree; near 250ms it feels like a person. That number is a budget spent across mic capture, prefill, and synthesis, and the design decisions you own (persona verbosity, system prompt length, whether vision-in is on) spend real milliseconds from it. GPT-4o\'s 2024 demo was disruptive as a product shape, not a model: the same reasoning with streaming speech attached reads as a different species. Latency is the material voice products are made of.',
    sections: [
      {
        heading: 'The problem: every step adds latency, nothing can batch',
        body: 'A real-time voice assistant must hear (tokenize speech live, detect via VAD when the user stopped), optionally see (camera frames at 2 to 4 FPS streaming in), think (compose a response over the history), and speak (synthesize speech tokens, decode to waveform, stream to speakers).\n\nConversational feel requires the whole round trip under about 500ms; below that, the lag stops registering. GPT-4o claims around 250ms, Moshi about 160ms, Qwen2.5-Omni 350 to 500ms. The constraint that shapes everything: every stage must stream. Any component that waits for a complete input before starting blows the budget on its own.',
      },
      {
        heading: 'The split: a big Thinker, a deliberately small Talker',
        body: 'Qwen2.5-Omni (March 2025), the reference open design, decomposes the job. The Thinker is a 7B-to-80B transformer consuming interleaved text, image, and audio tokens, emitting text: what to say. The Talker is a 200M-to-1B transformer consuming that text stream plus recent speech context, emitting discrete speech tokens. A streaming decoder turns those into waveform in real time.\n\nThe asymmetry is the point. Reasoning quality scales with Thinker size. The Talker\'s job is local (text to speech tokens), so a bigger Talker is not more expressive, just slower. They run in parallel: by the time the Thinker reaches token four, audio for tokens one through three is already playing.',
      },
      {
        heading: 'Why the Talker must be small: token-rate math',
        body: 'Speech at 16 kHz with 50 Hz base speech tokens needs 50 tokens generated per second of audio, forever, without falling behind. Typical LLM throughput on an H100 is 30 to 80 tokens per second: a 7B model used as the mouth would starve its own voice mid-sentence. A 200-to-300M Talker clears the rate with headroom.\n\nMoshi (October 2024) proves the split is a design choice, not a law: one 7B transformer emits text and speech tokens on alternating positions, with an "inner monologue" separating the thinking stream from the speaking stream. Effectively Thinker and Talker fused by training, and at 160ms it is the fastest open implementation.',
      },
      {
        heading: 'TMRoPE again: aligning eyes, ears, and text on one clock',
        body: 'The Thinker ingests camera frames at 4 FPS, audio frames at 50 per second, and text, all at once. Naive ordering (all images, then all audio, then text) destroys simultaneity. TMRoPE stamps every token with its absolute timestamp: a vision token at t=2.3s, an audio token at t=2.32s, the user\'s "stop" at t=2.35s all rotate to nearly identical positions, so the model perceives them as concurrent.\n\nThis is the infrastructure that makes "he waved while saying hello" resolvable. The same encoding that gave video models temporal grounding in lesson 12.17 gives omni models a shared clock across modalities.',
      },
      {
        heading: 'The budget, line by line',
        body: 'Time to first audio byte, component by component: mic to audio tokens, 40 to 80ms. Prefill over prompt and history, 100 to 200ms at 7B and much more at 70B. First Thinker text token, 40ms. Talker consumes it, 20ms. First speech tokens, 40ms. Residual-VQ decode, 30ms. Waveform decode, 50 to 80ms. Total: 320 to 510ms at 7B, 600 to 900ms at 70B. Frontier reasoning quality wants 70B-plus; hence the frontier latency gap.\n\nTurn-taking is its own layer: half-duplex (strict alternation via a roughly 200ms VAD silence threshold) is the default; full-duplex (the model can backchannel or interrupt) is much harder, and Moshi supports it. Qwen3-Omni (November 2025) pushed open weights near GPT-4o\'s 250ms.',
      },
    ],
    takeaways: [
      'Voice UX is a latency budget: about 500ms total, spent across seven pipeline stages. Every design choice that lengthens prefill spends from it.',
      'Split the model by job: reasoning scales with size, speech synthesis is rate-bound. A big Talker is not better, it is late.',
      'The Talker must sustain 50 tokens per second of audio forever. Throughput, not quality, sizes the mouth.',
      'Half-duplex vs full-duplex is an interaction-design decision with an architecture bill: interruptions and backchannels need a model trained to listen while speaking.',
    ],
    terms: [
      { term: 'Thinker', meaning: 'The large text-generating transformer that consumes interleaved multimodal tokens and decides what to say.' },
      { term: 'Talker', meaning: 'The small transformer that converts the Thinker\'s text stream into discrete speech tokens in real time.' },
      { term: 'TTFAB', meaning: 'Time to first audio byte: from the user finishing speaking to the first sample of the reply playing.' },
      { term: 'VAD', meaning: 'Voice activity detection; a silence threshold (around 200ms) that signals the user has finished their turn.' },
      { term: 'Full-duplex', meaning: 'Both parties can speak at once; the model can backchannel or interrupt, which half-duplex turn-taking cannot.' },
      { term: 'Inner monologue', meaning: 'Moshi\'s single-model design where thinking tokens and speaking tokens interleave in one stream.' },
    ],
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
