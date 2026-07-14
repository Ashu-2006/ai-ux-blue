// Shape of src/data/roadmap.json (generated from the 8 research files).

export type SubKind = 'model' | 'pattern' | 'anti' | 'invisible';

export interface SubNode {
  id: string;
  kind: SubKind;
  label: string;
  oneLiner: string;
  body: string;
}

export interface Method {
  method: string;
  measures: string;
}

export interface Resource {
  type: string;
  title: string;
  source: string;
  why: string;
  url: string;
}

export interface TeardownTarget {
  product: string;
  why: string;
}

export type Hue =
  | 'violet' | 'blue' | 'cyan' | 'teal' | 'green' | 'amber' | 'rose' | 'slate';

export interface Topic {
  key: string;
  id: string;
  title: string;
  fullTitle: string;
  hue: Hue;
  methods: Method[];
  tactics: string[];
  resources: Resource[];
  teardownTargets: TeardownTarget[];
  subNodes: SubNode[];
}

export interface Roadmap {
  meta: {
    title: string;
    subtitle: string;
    topicCount: number;
    subTopicCount: number;
  };
  topics: Topic[];
}

export const KIND_LABEL: Record<SubKind, string> = {
  model: 'Mental model',
  pattern: 'Pattern',
  anti: 'Anti-pattern',
  invisible: 'Invisible problem',
};

// status kept for a future progress layer; not wired into UI yet
export type Status = 'pending' | 'learning' | 'done';
