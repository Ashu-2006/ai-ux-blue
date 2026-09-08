import type { DemoConfig } from '@/components/demos/archetypes';
import { phase11Part1 } from '@/data/lessons/phase11-part1';
import { phase11Part2 } from '@/data/lessons/phase11-part2';
import { phase11Part3 } from '@/data/lessons/phase11-part3';
import { phase14Part1 } from '@/data/lessons/phase14-part1';
import { phase14Part2 } from '@/data/lessons/phase14-part2';
import { phase14Part3 } from '@/data/lessons/phase14-part3';
import { phase14Part4 } from '@/data/lessons/phase14-part4';
import { phase14Part5 } from '@/data/lessons/phase14-part5';
import { phase14Part6 } from '@/data/lessons/phase14-part6';
import { phase13Part1 } from '@/data/lessons/phase13-part1';
import { phase13Part2 } from '@/data/lessons/phase13-part2';
import { phase13Part3 } from '@/data/lessons/phase13-part3';
import { phase13Part4 } from '@/data/lessons/phase13-part4';
import { phase15Part1 } from '@/data/lessons/phase15-part1';
import { phase15Part2 } from '@/data/lessons/phase15-part2';
import { phase15Part3 } from '@/data/lessons/phase15-part3';
import { phase15Part4 } from '@/data/lessons/phase15-part4';
import { phase16Part1 } from '@/data/lessons/phase16-part1';
import { phase16Part3 } from '@/data/lessons/phase16-part3';
import { phase16Part2 } from '@/data/lessons/phase16-part2';
import { phase16Part4 } from '@/data/lessons/phase16-part4';
import { deCraftVisual } from '@/data/lessons/de/craft-visual';
import { deCraftMotion } from '@/data/lessons/de/craft-motion';
import { deCraftInteraction } from '@/data/lessons/de/craft-interaction';
import { deAiUxPatterns } from '@/data/lessons/de/ai-ux-patterns';
import { deAgenticUi } from '@/data/lessons/de/agentic-ui';
import { dePractice } from '@/data/lessons/de/practice';
import { phase12Part1 } from '@/data/lessons/phase12-part1';
import { phase12Part2 } from '@/data/lessons/phase12-part2';
import { phase12Part3 } from '@/data/lessons/phase12-part3';
import { phase12Part4 } from '@/data/lessons/phase12-part4';
import { phase12Part5 } from '@/data/lessons/phase12-part5';

// Curriculum lessons - digestible rewrites of "AI Engineering from Scratch"
// (rohitg00, MIT), rewritten for a designer-engineer reader. Authored by the
// add-lessons skill (~/.claude/skills/add-lessons): research, rewrite, demo
// config, posts, diagram. Source of truth for the full lessons:
// D:\Claude\Learning\ai-engineering-from-scratch (local clone).
// Lesson data lives in src/data/lessons/, one file per folder/part.

export interface LessonSection {
  heading: string;
  body: string; // plain text, \n\n for paragraph breaks
}

export interface LessonTerm {
  term: string;
  gloss?: string; // what people usually say (often imprecise)
  meaning: string; // what it actually is
}

export interface LessonPost {
  kind: string; // "X · mechanism" | "X · one-liner" | "X · design angle"
  hook: string;
  body: string; // full copy-ready text
}

// A supporting visual inside the body. `diagramBrief` is a written spec for a
// diagram that has not been produced yet; when the SVG lands, drop the brief.
export interface LessonInlineImage {
  src: string; // path under public/ (planned or actual)
  alt: string;
  caption: string;
  diagramBrief?: string; // spec for the designer who will draw this
}

export interface LessonExercise {
  level: 'easy' | 'medium' | 'hard' | 'design';
  prompt: string;
}

export interface LessonFurtherReading {
  label: string;
  url: string;
  why: string; // one line, why this link earns its place
}

// The reusable artifact a reader takes away from the lesson.
export interface LessonShipIt {
  kind: 'prompt' | 'checklist' | 'snippet' | 'rubric';
  name: string;
  body: string; // markdown / plain text, ready to copy
}

// A folder groups related lessons (one folder per phase part / theme).
export interface LessonFolder {
  key: string;
  title: string;
  part?: string; // mono meta label next to the folder title
  blurb: string;
  lessonIds: string[];
}

export interface Lesson {
  id: string;
  phase: string; // e.g. "Phase 12 · Multimodal AI"
  part: string; // grouping inside the phase
  index: string; // "12.01"
  title: string;
  oneLiner: string;
  readTime: string;
  diagram?: string; // path under public/
  diagramCaption?: string;
  whyItMatters: string; // the design / product / engineering lens
  learningObjectives?: string[]; // verb-led measurable bullets (4-6)
  sections: LessonSection[];
  inlineImages?: LessonInlineImage[]; // supporting visuals inside the body
  takeaways: string[];
  terms: LessonTerm[];
  exercises?: LessonExercise[]; // easy -> hard, at least one designer-facing
  furtherReading?: LessonFurtherReading[]; // 3-6 real primary links
  shipIt?: LessonShipIt; // the reusable artifact the reader takes away
  demoCaption?: string; // shown above the interactive demo
  // config-driven interactive (ArchetypeDemo); bespoke demos override via
  // LESSON_DEMOS in components/demos/lessonDemos.tsx
  demo?: DemoConfig;
  posts: LessonPost[];
  source: { label: string; url: string };
}

export const LESSONS: Lesson[] = [
  ...deCraftVisual,
  ...deCraftMotion,
  ...deCraftInteraction,
  ...deAiUxPatterns,
  ...deAgenticUi,
  ...dePractice,
  ...phase11Part1,
  ...phase11Part2,
  ...phase11Part3,
  ...phase14Part1,
  ...phase14Part2,
  ...phase14Part3,
  ...phase14Part4,
  ...phase14Part5,
  ...phase14Part6,
  ...phase13Part1,
  ...phase13Part2,
  ...phase13Part3,
  ...phase13Part4,
  ...phase15Part1,
  ...phase15Part2,
  ...phase15Part3,
  ...phase15Part4,
  ...phase16Part1,
  ...phase16Part2,
  ...phase16Part3,
  ...phase16Part4,
  ...phase12Part1,
  ...phase12Part2,
  ...phase12Part3,
  ...phase12Part4,
  ...phase12Part5,
];

export const LESSON_FOLDERS: LessonFolder[] = [
  {
    key: 'de-craft-visual',
    title: 'Craft · Visual',
    part: 'Design engineering · Visual craft',
    blurb: 'The visual craft of a design engineer: OKLCH, corner radii, optical alignment, type scale, clamp, semantic tokens, grids, contrast, iconography.',
    lessonIds: deCraftVisual.map((l) => l.id),
  },
  {
    key: 'de-craft-motion',
    title: 'Craft · Motion',
    part: 'Design engineering · Motion craft',
    blurb: 'Motion tokens, perceived-performance thresholds, spring vs tween, motion for state, reduced-motion, stagger, Framer Motion primitives.',
    lessonIds: deCraftMotion.map((l) => l.id),
  },
  {
    key: 'de-craft-interaction',
    title: 'Craft · Interaction',
    part: 'Design engineering · Interaction craft',
    blurb: 'Progressive disclosure, overlay taxonomy, master-detail, keyboard-first, the four required states, optimistic UI, a z-index budget.',
    lessonIds: deCraftInteraction.map((l) => l.id),
  },
  {
    key: 'de-ai-ux-patterns',
    title: 'AI UX patterns',
    part: 'Design engineering · AI UX patterns',
    blurb: 'Non-determinism, TTFT latency, streaming shapes, generative UI, grounding spans, confidence UX, prompt-as-microcopy, composer and reply.',
    lessonIds: deAiUxPatterns.map((l) => l.id),
  },
  {
    key: 'de-agentic-ui',
    title: 'Agentic UI',
    part: 'Design engineering · Agentic UI',
    blurb: 'The agentic loop as UX, action schema as permission surface, trace UI, interrupt design, handoff attribution, agentic UI libraries.',
    lessonIds: deAgenticUi.map((l) => l.id),
  },
  {
    key: 'de-practice',
    title: 'Practice',
    part: 'Design engineering · Practice',
    blurb: 'Design engineering cultures and people: Linear, Vercel/Geist, Emil Kowalski, Paco Coursey, Anthropic, token theory from Comeau/Curtis/Hupé.',
    lessonIds: dePractice.map((l) => l.id),
  },
  {
    key: 'p11-part1',
    title: 'Prompting and context',
    part: 'Phase 11 · LLM Engineering · Part 1',
    blurb:
      'The controls you actually have over a model you did not train: how you instruct it, what you put in the window, and what that window costs you per request.',
    lessonIds: phase11Part1.map((l) => l.id),
  },
  {
    key: 'p11-part2',
    title: 'Retrieval and tuning',
    part: 'Phase 11 · LLM Engineering · Part 2',
    blurb:
      'Making a model work on knowledge it never trained on, and changing its behaviour when prompting runs out: RAG, reranking, LoRA, tools, and how you know any of it worked.',
    lessonIds: phase11Part2.map((l) => l.id),
  },
  {
    key: 'p11-part3',
    title: 'Shipping to production',
    part: 'Phase 11 · LLM Engineering · Part 3',
    blurb:
      'What separates a demo from a product: unit economics, guardrails, the seven components behind one request, MCP, and the state machines that make an agent resumable.',
    lessonIds: phase11Part3.map((l) => l.id),
  },
  {
    key: 'p14-part1',
    title: 'The agent loop and reasoning',
    part: 'Phase 14 · Agent Engineering · Part 1',
    blurb:
      'What an agent actually is once you strip the branding: a loop that observes, decides, acts, and looks again. Plus the reasoning strategies layered on top, and what each one costs you in calls and latency.',
    lessonIds: phase14Part1.map((l) => l.id),
  },
  {
    key: 'p14-part2',
    title: 'Memory and skills',
    part: 'Phase 14 · Agent Engineering · Part 2',
    blurb:
      'Why an agent forgets, and the four ways to fix it: paged context, editable memory blocks, hybrid retrieval, and a library of skills it wrote itself. Memory is where products feel magical or broken.',
    lessonIds: phase14Part2.map((l) => l.id),
  },
  {
    key: 'p14-part3',
    title: 'Patterns and runtimes',
    part: 'Phase 14 · Agent Engineering · Part 3',
    blurb:
      'The five workflow patterns that cover most real features, and the runtimes that implement them. Read each framework by what it makes easy to show a user: streaming, interrupting, resuming, attributing.',
    lessonIds: phase14Part3.map((l) => l.id),
  },
  {
    key: 'p14-part4',
    title: 'Benchmarks and observability',
    part: 'Phase 14 · Agent Engineering · Part 4',
    blurb:
      'How to read an agent benchmark as a product constraint, and what a trace has to carry before a human can replay a run. A 30 percent success rate means you are mostly building failure-handling UI.',
    lessonIds: phase14Part4.map((l) => l.id),
  },
  {
    key: 'p14-part5',
    title: 'Failure modes and defense',
    part: 'Phase 14 · Agent Engineering · Part 5',
    blurb:
      'The five ways agents actually break, prompt injection and the validator that sits before the tool, and verification gates. The closest material in the curriculum to agent governance UX.',
    lessonIds: phase14Part5.map((l) => l.id),
  },
  {
    key: 'p14-part6',
    title: 'The agent workbench',
    part: 'Phase 14 · Agent Engineering · Part 6',
    blurb:
      'Why a capable model still fails on a real repo, and the harness that fixes it: executable constraints, scope contracts, exit codes over narration, a reviewer that is not the builder, and a handoff packet.',
    lessonIds: phase14Part6.map((l) => l.id),
  },
  {
    key: 'p13-part1',
    title: 'The tool interface',
    part: 'Phase 13 · Tools and Protocols · Part 1',
    blurb:
      'A tool call is a form the model fills in, so schema design is interface design: naming, affordances, constraints, and error copy, plus the progress UI that parallel and streaming calls force on you.',
    lessonIds: phase13Part1.map((l) => l.id),
  },
  {
    key: 'p13-part2',
    title: 'MCP, end to end',
    part: 'Phase 13 · Tools and Protocols · Part 2',
    blurb:
      'One wire format for every tool: the six primitives, writing a server and a client, choosing a transport, and MCP Apps, where your UI ships through the protocol itself.',
    lessonIds: phase13Part2.map((l) => l.id),
  },
  {
    key: 'p13-part3',
    title: 'Trust, auth, and scale',
    part: 'Phase 13 · Tools and Protocols · Part 3',
    blurb:
      'What has to be true before you approve a tool you did not write: sampling ledgers, mid-run elicitation, async waits, tool poisoning, OAuth scopes that step up, and gateways.',
    lessonIds: phase13Part3.map((l) => l.id),
  },
  {
    key: 'p13-part4',
    title: 'The tool ecosystem',
    part: 'Phase 13 · Tools and Protocols · Part 4',
    blurb:
      'Production auth, delegating to agents you cannot see inside, one trace across model and tools and subagents, and knowing which layer a thing belongs in: skill, tool, or subagent.',
    lessonIds: phase13Part4.map((l) => l.id),
  },
  {
    key: 'p15-part1',
    title: 'Long-horizon and self-improving agents',
    part: 'Phase 15 · Autonomous Systems · Part 1',
    blurb:
      'What breaks when a run lasts 14 hours instead of 14 seconds. Per-step reliability compounds, so the design problem becomes progress legibility, checkpoints, and where the stop control lives.',
    lessonIds: phase15Part1.map((l) => l.id),
  },
  {
    key: 'p15-part2',
    title: 'Coding agents and durable execution',
    part: 'Phase 15 · Autonomous Systems · Part 2',
    blurb:
      'The scaffold is the product, not the model. Permission modes as a trust dial, browser agents acting on untrusted text, runs that survive a reboot, and whether your undo is real.',
    lessonIds: phase15Part2.map((l) => l.id),
  },
  {
    key: 'p15-part3',
    title: 'Control surfaces',
    part: 'Phase 15 · Autonomous Systems · Part 3',
    blurb:
      'The governance controls themselves: budgets as a stack, kill switches and canaries, propose-then-commit, constitutional tiers, and taxonomies that route instead of block.',
    lessonIds: phase15Part3.map((l) => l.id),
  },
  {
    key: 'p15-part4',
    title: 'Frontier safety frameworks',
    part: 'Phase 15 · Autonomous Systems · Part 4',
    blurb:
      'The policy layer that becomes your product constraint: capability thresholds, responsible scaling, external evaluation, and what a model tier is allowed to do unattended.',
    lessonIds: phase15Part4.map((l) => l.id),
  },
  {
    key: 'p16-part1',
    title: 'Why more than one agent',
    part: 'Phase 16 · Multi-Agent and Swarms · Part 1',
    blurb:
      'When splitting the work actually helps, and the shapes it takes: supervisors, hierarchies, role specialization, and parallel swarms. Multi-agent is an attribution problem in the UI.',
    lessonIds: phase16Part1.map((l) => l.id),
  },
  {
    key: 'p16-part2',
    title: 'Talking, handing off, agreeing',
    part: 'Phase 16 · Multi-Agent and Swarms · Part 2',
    blurb:
      'How agents coordinate: speaker selection, handoffs that lose context, A2A, shared blackboards, and consensus. The user feels a bad handoff as the second agent forgetting them.',
    lessonIds: phase16Part2.map((l) => l.id),
  },
  {
    key: 'p16-part3',
    title: 'Debate, negotiation, and simulation',
    part: 'Phase 16 · Multi-Agent and Swarms · Part 3',
    blurb:
      'Agents arguing, bargaining, and modeling each other: debate topologies, voting, negotiation, generative-agent simulation, theory of mind, and agent economies.',
    lessonIds: phase16Part3.map((l) => l.id),
  },
  {
    key: 'p16-part4',
    title: 'Running a swarm in production',
    part: 'Phase 16 · Multi-Agent and Swarms · Part 4',
    blurb:
      'Queues, checkpoints, and the failure taxonomy that tells you which multi-agent breakages need their own status states. Plus the algorithm heritage behind the patterns.',
    lessonIds: phase16Part4.map((l) => l.id),
  },
  {
    key: 'p12-part1',
    title: 'How images become tokens',
    part: 'Phase 12 · Multimodal AI · Part 1',
    blurb:
      'How models see. What happens between a user dropping an image into a chat box and the model answering: patches, shared embedding spaces, and the bridges that let a frozen LLM read pictures.',
    lessonIds: phase12Part1.map((l) => l.id).concat(phase12Part2.slice(0, 3).map((l) => l.id)),
  },
  {
    key: 'p12-part2',
    title: 'Open-weight VLM recipes',
    part: 'Phase 12 · Multimodal AI · Part 2',
    blurb:
      'How the open vision-language models you can actually ship are put together: the training recipes, resolution tricks, and family tradeoffs behind LLaVA-OneVision, Qwen-VL, and InternVL.',
    lessonIds: phase12Part2.slice(3).map((l) => l.id),
  },
  {
    key: 'p12-part3',
    title: 'Unified any-to-any models',
    part: 'Phase 12 · Multimodal AI · Part 3',
    blurb:
      'Models that both understand and generate across modalities in one network: early fusion, next-token image generation, and the architectures betting that one model does it all.',
    lessonIds: phase12Part3.map((l) => l.id),
  },
  {
    key: 'p12-part4',
    title: 'Video, audio, and omni models',
    part: 'Phase 12 · Multimodal AI · Part 4',
    blurb:
      'Seeing over time and hearing at all: temporal grounding, million-token video contexts, audio-language models, and the omni models that listen, think, and talk back.',
    lessonIds: phase12Part4.map((l) => l.id),
  },
  {
    key: 'p12-part5',
    title: 'Multimodal in the real world',
    part: 'Phase 12 · Multimodal AI · Part 5',
    blurb:
      'Where multimodal earns money: robot policies, document and diagram understanding, vision-native retrieval, multimodal RAG, and the computer-use agents that click your UI.',
    lessonIds: phase12Part5.map((l) => l.id),
  },
];

export function getLesson(id: string | undefined): Lesson | undefined {
  return id ? LESSONS.find((l) => l.id === id) : undefined;
}
