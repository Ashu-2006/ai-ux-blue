import raw from '@/data/roadmap.json';
import type { Roadmap, Topic, SubNode, SubKind } from './types';

export const roadmap = raw as unknown as Roadmap;
export const topics: Topic[] = roadmap.topics;

// Flat index of every sub-topic, for Cmd-K search.
export interface FlatSub {
  topicId: string;
  topicTitle: string;
  hue: Topic['hue'];
  sub: SubNode;
}

export const allSubs: FlatSub[] = topics.flatMap((t) =>
  t.subNodes.map((sub) => ({
    topicId: t.id,
    topicTitle: t.title,
    hue: t.hue,
    sub,
  })),
);

export function topicById(id: string): Topic | undefined {
  return topics.find((t) => t.id === id);
}

export const KIND_ORDER: SubKind[] = ['model', 'pattern', 'anti', 'invisible'];

export function countByKind(t: Topic): Record<SubKind, number> {
  const c: Record<SubKind, number> = { model: 0, pattern: 0, anti: 0, invisible: 0 };
  for (const s of t.subNodes) c[s.kind]++;
  return c;
}
