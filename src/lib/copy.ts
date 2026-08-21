// Editorial copy for the interfaces.dev-style landing page.
// One-line, "you"-voice descriptions per topic (the source has none), plus the
// four-kind legend. Edit freely — this is the only place the marketing copy lives.

import type { SubKind } from './types';

// Per-topic descriptions, keyed by Topic.id. Sentence case, addressed to "you".
export const TOPIC_BLURB: Record<string, string> = {
  'ai-agent-legibility':
    'Make what the agent is doing, and how sure it is, legible to the person watching.',
  'systems-state-design':
    'Model the states, transitions, and edges so the product behaves predictably under pressure.',
  'data-heavy-screens':
    'Turn dense tables, logs, and dashboards into something a person can actually read and act on.',
  'dashboards-entry-points':
    'Design the first screen so it answers "what now?" instead of dumping every metric at once.',
  'task-based-saas':
    'Organize the product around the jobs people came to do, not around your feature list.',
  'deceptive-patterns-trust':
    'Spot the dark patterns that quietly burn trust, and reach for the honest move instead.',
  'buying-psychology-hesitation':
    'Understand the hesitation before a purchase, and remove the friction that is fear in disguise.',
  'methods-teardown-strategy':
    'The methods, teardowns, and measurements that turn taste into a repeatable practice.',
};

// The four kinds, as a legend used in HowItWorks + the Categories filter.
export const KINDS: { kind: SubKind; label: string; blurb: string; varName: string }[] = [
  { kind: 'model', label: 'Mental model', varName: 'model',
    blurb: 'A way of seeing the problem that makes the right design obvious.' },
  { kind: 'pattern', label: 'Pattern', varName: 'pattern',
    blurb: 'A move that reliably works — reach for it when you see the setup.' },
  { kind: 'anti', label: 'Anti-pattern', varName: 'anti',
    blurb: 'A tempting move that quietly backfires. Learn to recognize and avoid it.' },
  { kind: 'invisible', label: 'Invisible problem', varName: 'invisible',
    blurb: "A failure you don't notice until you know to look for it." },
];

export const KIND_COLOR: Record<SubKind, string> = {
  model: 'var(--model)',
  pattern: 'var(--pattern)',
  anti: 'var(--anti)',
  invisible: 'var(--invisible)',
};

// Hero copy (trust-focused headline you selected).
export const HERO = {
  eyebrow: 'A learning roadmap · 8 topics · 256 ideas',
  headline: 'What makes an AI or crypto product feel trustworthy?',
  description:
    '256 ideas worth knowing for designing AI and crypto interfaces people actually trust — each one a mental model, a pattern to reach for, an anti-pattern to avoid, or an invisible problem you did not know you had. Browse by topic, or hit ⌘K and jump straight to any of them.',
};
