// The unified library tree. One File-Explorer taxonomy across the whole app,
// grouped by what the material is ABOUT rather than by which phase of the
// curriculum it came from. Every lesson and every roadmap idea has exactly one
// home. Nothing gets moved: this tree references existing lesson ids and idea
// ids; the data files under src/data/ and src/lib/lessons.ts stay authoritative.

import { LESSONS, LESSON_FOLDERS, type Lesson } from '@/lib/lessons';
import { topics as ROADMAP_TOPICS } from '@/lib/data';
import type { SubNode } from '@/lib/types';

// ── The taxonomy ────────────────────────────────────────────────────────────
// Folders and their contents. `include` refers to existing folder keys
// (lesson parts) or roadmap topic ids; `lessons` names specific lesson ids
// when a part is split across multiple destinations; `ideaKinds` and
// `ideaTopicIds` filter roadmap ideas into the destination folder.

export interface FolderSpec {
  slug: string;
  title: string;
  blurb: string;
  children?: FolderSpec[];
  // Data pulls. Multiple pulls at the same level are concatenated.
  includeParts?: string[]; // curriculum part keys, e.g. 'p11-part1'
  includeLessonIds?: string[]; // specific lesson ids
  includeTopics?: string[]; // roadmap topic ids
  includeIdeaIds?: string[]; // specific roadmap idea ids
}

const TAXONOMY: FolderSpec[] = [
  {
    slug: 'talking-to-a-model',
    title: 'Talking to a model',
    blurb:
      'How you instruct it, what you put in the window, and how the reply comes back. Prompting, structured outputs, embeddings, context budgets, and fine-tuning.',
    children: [
      { slug: 'prompting', title: 'Prompting', blurb: 'Instructions, few-shot, and chain-of-thought.',
        includeLessonIds: ['p11-01-prompt-engineering', 'p11-02-few-shot-cot'] },
      { slug: 'structured-outputs', title: 'Structured outputs', blurb: 'Making the model return a type your UI can render.',
        includeLessonIds: ['p11-03-structured-outputs', 'p13-04-structured-output'] },
      { slug: 'the-context-window', title: 'The context window', blurb: 'The window is a budget, and caching is how you afford it.',
        includeLessonIds: ['p11-05-context-engineering', 'p11-15-prompt-caching'] },
      { slug: 'fine-tuning', title: 'Fine-tuning', blurb: 'When prompting runs out: LoRA, adapters, and the economics.',
        includeLessonIds: ['p11-08-fine-tuning-lora'] },
    ],
  },
  {
    slug: 'making-it-know-things',
    title: 'Making it know things',
    blurb:
      'Retrieval, embeddings as geometry, RAG, reranking, and vision-native retrieval. How a model works on knowledge it never trained on.',
    children: [
      { slug: 'embeddings', title: 'Embeddings', blurb: 'Meaning as geometry, and the encoders behind semantic search.',
        includeLessonIds: ['p11-04-embeddings', 'p12-02-clip-contrastive'] },
      { slug: 'rag-basics', title: 'RAG basics', blurb: 'Giving the model documents it never trained on.',
        includeLessonIds: ['p11-06-rag'] },
      { slug: 'advanced-rag', title: 'Advanced RAG', blurb: 'Why similar is not the same as relevant.',
        includeLessonIds: ['p11-07-advanced-rag'] },
      { slug: 'multimodal-rag', title: 'Multimodal RAG', blurb: 'Retrieval across text, image, and audio, without extracting first.',
        includeLessonIds: ['p12-23-colpali', 'p12-24-multimodal-rag'] },
    ],
  },
  {
    slug: 'making-it-use-tools',
    title: 'Making it use tools',
    blurb:
      'Function calling, tool schemas as interface design, MCP end to end, and the auth, gateways, and cross-agent protocols that let a model act.',
    children: [
      { slug: 'the-tool-interface', title: 'The tool interface', blurb: 'A tool call is a form the model fills in.',
        includeLessonIds: ['p13-01-tool-interface', 'p13-02-function-calling', 'p13-03-parallel-streaming', 'p13-05-schema-design', 'p11-09-function-calling'] },
      { slug: 'mcp-end-to-end', title: 'MCP end to end', blurb: 'One wire format for every tool: primitives, servers, clients, transports.',
        includeLessonIds: ['p11-14-mcp', 'p13-06-mcp-fundamentals', 'p13-07-mcp-server', 'p13-08-mcp-client', 'p13-09-mcp-transports', 'p13-10-resources-prompts', 'p13-11-mcp-sampling', 'p13-12-roots-elicitation', 'p13-13-async-tasks', 'p13-14-mcp-apps'] },
      { slug: 'mcp-security-and-scale', title: 'MCP security and scale', blurb: 'What must be true before you approve a tool you did not write.',
        includeLessonIds: ['p13-15-tool-poisoning', 'p13-16-oauth', 'p13-17-gateways-registries', 'p13-18-mcp-auth-production'] },
      { slug: 'cross-agent', title: 'Cross-agent (A2A)', blurb: 'Delegating to an agent you cannot see inside.',
        includeLessonIds: ['p13-19-a2a', 'p16-02-fipa-acl', 'p16-12-a2a'] },
      { slug: 'model-routing', title: 'Model routing', blurb: 'One API surface, many models.',
        includeLessonIds: ['p13-21-llm-routing', 'p11-17-framework-tradeoffs'] },
    ],
  },
  {
    slug: 'reasoning-and-agents',
    title: 'Reasoning and agents',
    blurb:
      'The agent loop, planning patterns, workflow shapes, runtimes, and the workbench that makes a capable model reliable on a real repo.',
    children: [
      { slug: 'the-agent-loop', title: 'The agent loop', blurb: 'Observe, decide, act, look again. And the reasoning strategies layered on top.',
        includeParts: ['p14-part1'] },
      { slug: 'workflow-patterns', title: 'Workflow patterns', blurb: 'Five patterns that cover most real features.',
        includeLessonIds: ['p14-12-workflow-patterns', 'p14-13-langgraph', 'p14-28-orchestration', 'p11-16-langgraph'] },
      { slug: 'runtimes', title: 'Runtimes', blurb: 'Read each framework by what it makes easy to show a user.',
        includeLessonIds: ['p14-14-autogen', 'p14-15-crewai', 'p14-16-openai-agents-sdk', 'p14-17-claude-agent-sdk', 'p14-18-agno-mastra', 'p14-29-production-runtimes'] },
      { slug: 'the-agent-workbench', title: 'The agent workbench', blurb: 'Why capable models still fail on real repos, and the harness that fixes it.',
        includeParts: ['p14-part6'] },
      { slug: 'long-horizon-agents', title: 'Long-horizon agents', blurb: 'What breaks when a run lasts 14 hours instead of 14 seconds.',
        includeParts: ['p15-part1'] },
    ],
  },
  {
    slug: 'memory',
    title: 'Memory',
    blurb:
      'Why an agent forgets, and the four ways to fix it: paged context, editable blocks, hybrid retrieval, and a library of skills it wrote itself.',
    children: [
      { slug: 'working-memory', title: 'Working memory', blurb: 'Paging memory in and out of the window.',
        includeLessonIds: ['p14-07-memgpt'] },
      { slug: 'long-term-memory', title: 'Long-term memory', blurb: 'Editable blocks and hybrid retrieval.',
        includeLessonIds: ['p14-08-memory-blocks', 'p14-09-mem0'] },
      { slug: 'skill-libraries', title: 'Skill libraries', blurb: 'Memory for how, not what.',
        includeLessonIds: ['p14-10-voyager'] },
      { slug: 'repo-memory', title: 'Repo memory', blurb: 'State the next session can actually read.',
        includeLessonIds: ['p14-34-repo-memory'] },
    ],
  },
  {
    slug: 'multimodal',
    title: 'Multimodal',
    blurb:
      'How models see, hear, and move. Patches, VLMs, video, computer-use, embodied agents, and document AI.',
    children: [
      { slug: 'how-images-become-tokens', title: 'How images become tokens', blurb: 'From patches and CLIP to the bridges that let a frozen LLM read pictures.',
        includeParts: ['p12-part1'] },
      { slug: 'open-weight-vlms', title: 'Open-weight VLMs', blurb: 'The training recipes and family tradeoffs behind LLaVA-OneVision, Qwen-VL, InternVL.',
        includeParts: ['p12-part2'] },
      { slug: 'unified-any-to-any', title: 'Unified any-to-any', blurb: 'Models that understand and generate across modalities in one network.',
        includeParts: ['p12-part3'] },
      { slug: 'video', title: 'Video', blurb: 'Seeing over time: temporal grounding and million-token contexts.',
        includeLessonIds: ['p12-17-temporal-grounding', 'p12-18-long-video'] },
      { slug: 'computer-use-agents', title: 'Computer-use agents', blurb: 'The model that clicks your UI.',
        includeLessonIds: ['p12-25-computer-use', 'p14-21-computer-use'] },
      { slug: 'embodied', title: 'Embodied', blurb: 'When the output tokens move a robot arm.',
        includeLessonIds: ['p12-21-embodied-vlas'] },
      { slug: 'document-understanding', title: 'Document understanding', blurb: 'From Tesseract to VLM-native document AI.',
        includeLessonIds: ['p12-22-document-understanding'] },
    ],
  },
  {
    slug: 'voice-and-audio',
    title: 'Voice and audio',
    blurb: 'Audio-language models, voice agent latency budgets, and the omni Thinker-Talker split.',
    children: [
      { slug: 'audio-language-models', title: 'Audio-language models', blurb: 'From Whisper to Audio Flamingo 3.',
        includeLessonIds: ['p12-19-audio-language', 'p14-22-voice-agents'] },
      { slug: 'omni', title: 'Omni', blurb: 'The Thinker-Talker split, and models that listen and talk back.',
        includeLessonIds: ['p12-20-omni-thinker-talker'] },
    ],
  },
  {
    slug: 'trust-and-legibility',
    title: 'Trust and legibility',
    blurb:
      'Designing for calibrated trust: confidence UX, provenance, legibility of reasoning, auditability, hallucination, and blind signing.',
    // The roadmap topics that map cleanly onto trust UX; every idea inside them
    // is a folder-file here rather than something we split by kind.
    includeTopics: ['ai-agent-legibility', 'deceptive-patterns-trust'],
  },
  {
    slug: 'governance-and-control',
    title: 'Governance and control',
    blurb:
      'The gate, the budget stack, permission modes, rollback, and guardrails. Where oversight becomes interface.',
    children: [
      { slug: 'the-gate', title: 'The gate', blurb: 'Propose-then-commit, and the anti-patterns that fake it.',
        includeLessonIds: ['p15-15-propose-then-commit', 'ai-agent-legibility-anti-0'].filter((_) => false), // handled below
        includeIdeaIds: ['ai-agent-legibility-anti-0', 'ai-agent-legibility-mm-9', 'ai-agent-legibility-pat-0'] },
      { slug: 'budgets-and-limits', title: 'Budgets and limits', blurb: 'Cost as a stack, and the switches that end a run.',
        includeLessonIds: ['p15-13-cost-governors', 'p15-14-kill-switches', 'p11-11-caching-cost'] },
      { slug: 'permission-modes', title: 'Permission modes', blurb: 'A permission mode is a trust dial.',
        includeLessonIds: ['p15-10-permission-modes'] },
      { slug: 'rollback', title: 'Rollback', blurb: 'Whether undo is real.',
        includeLessonIds: ['p15-16-checkpoints-rollback'] },
      { slug: 'guardrails', title: 'Guardrails', blurb: 'The sandwich around every model call, and the gates the agent does not close for you.',
        includeLessonIds: ['p11-12-guardrails', 'p14-38-verification-gates', 'p14-27-prompt-injection'] },
      { slug: 'browser-and-durability', title: 'Browser agents and durability', blurb: 'Agents that act on untrusted text, and runs that survive a reboot.',
        includeLessonIds: ['p15-11-browser-agents', 'p15-12-durable-execution'] },
    ],
  },
  {
    slug: 'safety-and-alignment',
    title: 'Safety and alignment',
    blurb:
      'Failure modes, prompt injection, automated alignment, self-improvement bounds, and the frontier-safety frameworks that become product constraints.',
    children: [
      { slug: 'failure-modes', title: 'Failure modes', blurb: 'The five ways agents actually break.',
        includeLessonIds: ['p14-26-failure-modes'] },
      { slug: 'automated-alignment', title: 'Automated alignment', blurb: 'Constitutional AI, Llama Guard, and taxonomies that route rather than block.',
        includeLessonIds: ['p15-06-automated-alignment', 'p15-17-constitutional-ai', 'p15-18-llama-guard'] },
      { slug: 'self-improvement-bounds', title: 'Self-improvement bounds', blurb: 'What an agent is allowed to change about itself.',
        includeLessonIds: ['p15-04-darwin-godel', 'p15-07-recursive-self-improvement', 'p15-08-bounded-self-improvement'] },
      { slug: 'frontier-safety-frameworks', title: 'Frontier safety frameworks', blurb: 'The policy layer that becomes your product constraint.',
        includeLessonIds: ['p15-19-anthropic-rsp', 'p15-20-preparedness-fsf', 'p15-21-metr', 'p15-22-societal-risk'] },
    ],
  },
  {
    slug: 'shipping-to-production',
    title: 'Shipping to production',
    blurb:
      'Latency and streaming, caching and cost, evaluation, observability, and the production app that turns a demo into a product.',
    children: [
      { slug: 'the-production-app', title: 'The production app', blurb: 'Seven components, one request.',
        includeLessonIds: ['p11-13-production-app'] },
      { slug: 'evaluation', title: 'Evaluation', blurb: 'You cannot see a 5 percent regression by reading outputs.',
        includeLessonIds: ['p11-10-evaluation', 'p14-30-eval-driven', 'p14-19-swebench-gaia', 'p14-20-webarena-osworld'] },
      { slug: 'observability', title: 'Observability', blurb: 'What a trace must carry for a human to replay a run.',
        includeLessonIds: ['p13-20-otel-genai', 'p14-23-otel-genai', 'p14-24-observability'] },
      { slug: 'skills-and-agent-sdks', title: 'Skills and agent SDKs', blurb: 'When a skill is the wrong abstraction versus a tool or a subagent.',
        includeLessonIds: ['p13-22-skills-agent-sdks', 'p13-23-capstone-ecosystem'] },
    ],
  },
  {
    slug: 'multi-agent-systems',
    title: 'Multi-agent systems',
    blurb:
      'Why more than one agent, how they coordinate, and the patterns for debate, negotiation, and production swarms.',
    children: [
      { slug: 'why-more-than-one', title: 'Why more than one', blurb: 'The single-agent ceiling and the four primitives that read every framework.',
        includeParts: ['p16-part1'] },
      { slug: 'coordination', title: 'Coordination', blurb: 'Speaker selection, handoffs, blackboards, and consensus.',
        includeLessonIds: ['p16-03-communication-protocols', 'p16-10-group-chat', 'p16-11-handoffs', 'p16-13-blackboard', 'p16-14-consensus-bft'] },
      { slug: 'debate-and-negotiation', title: 'Debate and negotiation', blurb: 'Agents arguing, bargaining, and modeling each other.',
        includeParts: ['p16-part3'] },
      { slug: 'production-swarms', title: 'Production swarms', blurb: 'Queues, checkpoints, and the failure taxonomy that names your status states.',
        includeLessonIds: ['p16-19-swarm-optimization', 'p16-20-marl', 'p16-22-production-scaling', 'p16-23-failure-modes-mast', 'p16-24-eval-coordination', 'p14-25-multi-agent-debate'] },
    ],
  },
];

// ── Runtime tree ────────────────────────────────────────────────────────────

export type Node = FolderNode | LessonNode | IdeaNode;

export interface FolderNode {
  kind: 'folder';
  slug: string;
  path: string[]; // slug segments from root
  title: string;
  blurb: string;
  children: Node[];
  lessonCount: number; // deep count of all lesson + idea leaves
}

export interface LessonNode {
  kind: 'lesson';
  slug: string; // lesson id
  path: string[]; // slug segments from root, ending in this slug
  title: string;
  lesson: Lesson;
}

export interface IdeaNode {
  kind: 'idea';
  slug: string; // idea id
  path: string[];
  title: string;
  idea: SubNode;
  topicId: string;
}

// ── Build ───────────────────────────────────────────────────────────────────

const LESSON_BY_ID = new Map(LESSONS.map((l) => [l.id, l]));
const PART_BY_KEY = new Map(LESSON_FOLDERS.map((p) => [p.key, p]));
const IDEA_BY_ID = new Map<string, { idea: SubNode; topicId: string }>();
for (const t of ROADMAP_TOPICS) {
  for (const s of t.subNodes) IDEA_BY_ID.set(s.id, { idea: s, topicId: t.id });
}

function ideaTitle(idea: SubNode): string {
  return idea.label.replace(/\s*\([^)]+\)\s*$/, '').trim();
}

function build(spec: FolderSpec, parentPath: string[]): FolderNode {
  const path = [...parentPath, spec.slug];
  const children: Node[] = [];

  if (spec.children) {
    for (const c of spec.children) children.push(build(c, path));
  }

  const ids = new Set<string>();
  const pushLesson = (l: Lesson) => {
    if (ids.has(l.id)) return;
    ids.add(l.id);
    children.push({
      kind: 'lesson',
      slug: l.id,
      path: [...path, l.id],
      title: l.title,
      lesson: l,
    });
  };

  if (spec.includeParts) {
    for (const partKey of spec.includeParts) {
      const part = PART_BY_KEY.get(partKey);
      if (!part) continue;
      for (const id of part.lessonIds) {
        const l = LESSON_BY_ID.get(id);
        if (l) pushLesson(l);
      }
    }
  }
  if (spec.includeLessonIds) {
    for (const id of spec.includeLessonIds) {
      const l = LESSON_BY_ID.get(id);
      if (l) pushLesson(l);
    }
  }

  if (spec.includeTopics) {
    for (const topicId of spec.includeTopics) {
      const t = ROADMAP_TOPICS.find((x) => x.id === topicId);
      if (!t) continue;
      for (const idea of t.subNodes) {
        if (ids.has(idea.id)) continue;
        ids.add(idea.id);
        children.push({
          kind: 'idea',
          slug: idea.id,
          path: [...path, idea.id],
          title: ideaTitle(idea),
          idea,
          topicId,
        });
      }
    }
  }
  if (spec.includeIdeaIds) {
    for (const id of spec.includeIdeaIds) {
      if (ids.has(id)) continue;
      const entry = IDEA_BY_ID.get(id);
      if (!entry) continue;
      ids.add(id);
      children.push({
        kind: 'idea',
        slug: id,
        path: [...path, id],
        title: ideaTitle(entry.idea),
        idea: entry.idea,
        topicId: entry.topicId,
      });
    }
  }

  return {
    kind: 'folder',
    slug: spec.slug,
    path,
    title: spec.title,
    blurb: spec.blurb,
    children,
    lessonCount: deepLeafCount(children),
  };
}

function deepLeafCount(nodes: Node[]): number {
  let n = 0;
  for (const c of nodes) {
    if (c.kind === 'folder') n += c.lessonCount;
    else n += 1;
  }
  return n;
}

// The root. A synthetic folder whose children are the 12 topic roots.
export const ROOT: FolderNode = (() => {
  const roots = TAXONOMY.map((s) => build(s, []));
  return {
    kind: 'folder',
    slug: '',
    path: [],
    title: 'Home',
    blurb: 'Twelve areas that cover the AI product surface: what you talk to, what you make it know, and everything that has to be true before it acts.',
    children: roots,
    lessonCount: deepLeafCount(roots),
  };
})();

// Walk to a node by path. Returns Home for empty path.
export function nodeAtPath(path: string[]): Node | null {
  let node: Node = ROOT;
  for (const seg of path) {
    if (node.kind !== 'folder') return null;
    const next: Node | undefined = node.children.find((c) => c.slug === seg);
    if (!next) return null;
    node = next;
  }
  return node;
}

// Every leaf reachable from a folder, for search/filter/sort.
export function collectLeaves(folder: FolderNode): (LessonNode | IdeaNode)[] {
  const out: (LessonNode | IdeaNode)[] = [];
  const walk = (n: Node) => {
    if (n.kind === 'folder') n.children.forEach(walk);
    else out.push(n);
  };
  folder.children.forEach(walk);
  return out;
}

// URL round-tripping: '?p=a/b/c' <-> ['a','b','c'].
export function parsePath(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean);
}
export function serializePath(path: string[]): string {
  return path.join('/');
}

// Ancestor chain for breadcrumb rendering, including Home at index 0.
export function ancestors(path: string[]): FolderNode[] {
  const out: FolderNode[] = [ROOT];
  let node: Node = ROOT;
  for (const seg of path) {
    if (node.kind !== 'folder') break;
    const next: Node | undefined = node.children.find((c) => c.slug === seg);
    if (!next || next.kind !== 'folder') break;
    out.push(next);
    node = next;
  }
  return out;
}
