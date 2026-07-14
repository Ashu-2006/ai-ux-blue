import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { SubKind } from '@/lib/types';

// ---- Node data shapes ----
export interface RootNodeData {
  title: string;
  subtitle: string;
  [key: string]: unknown;
}
export interface TopicNodeData {
  label: string;
  hue: string;
  count: number;
  index: number;
  [key: string]: unknown;
}
export interface SubNodeData {
  label: string;
  kind: SubKind;
  hue: string;
  side: 'left' | 'right';
  [key: string]: unknown;
}

// Map the data's hue names -> Apple hue CSS vars.
const HUE_VAR: Record<string, string> = {
  violet: 'var(--h-systems)',
  blue: 'var(--h-model)',
  cyan: 'var(--h-data)',
  teal: 'var(--h-dash)',
  green: 'var(--h-task)',
  amber: 'var(--h-deceptive)',
  rose: 'var(--h-buying)',
  slate: 'var(--h-methods)',
};
const hueVar = (h: string) => HUE_VAR[h] ?? 'var(--ink-3)';

// Node-type colour + tint (semantic, restrained)
const KIND_COLOR: Record<SubKind, { dot: string; tint: string }> = {
  model: { dot: 'var(--model)', tint: 'var(--model-tint)' },
  pattern: { dot: 'var(--pattern)', tint: 'var(--pattern-tint)' },
  anti: { dot: 'var(--anti)', tint: 'var(--anti-tint)' },
  invisible: { dot: 'var(--invisible)', tint: 'var(--invisible-tint)' },
};

// The centered lead title.
export function RootNode({ data }: NodeProps) {
  const d = data as RootNodeData;
  return (
    <div className="pointer-events-none select-none text-center">
      <div className="t-hero text-ink">{d.title}</div>
      <div className="t-lg mt-1.5 text-ink-3">{d.subtitle}</div>
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />
    </div>
  );
}

// A topic (cluster): a clean elevated card, hue as a quiet accent bar.
export function TopicNode({ data, selected }: NodeProps) {
  const d = data as TopicNodeData;
  return (
    <div
      className="pressable group relative w-[248px] cursor-pointer overflow-hidden rounded-[var(--r-lg)] text-left"
      style={{
        background: 'var(--surface)',
        boxShadow: selected
          ? `var(--shadow-float), 0 0 0 2px var(--accent)`
          : 'var(--shadow-card)',
        border: '0.5px solid var(--hairline)',
      }}
    >
      <span
        className="absolute left-0 top-0 h-full w-[3px]"
        style={{ background: hueVar(d.hue) }}
        aria-hidden
      />
      <div className="py-3.5 pl-5 pr-4">
        <div className="t-lg font-semibold text-ink">{d.label}</div>
        <div className="t-caption mt-1 uppercase text-ink-4">{d.count} sub-topics</div>
      </div>
      <Handle type="target" position={Position.Top} className="!opacity-0" />
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />
      <Handle type="source" position={Position.Left} id="l" className="!opacity-0" />
      <Handle type="source" position={Position.Right} id="r" className="!opacity-0" />
    </div>
  );
}

// A sub-topic: a soft tinted pill-card. Click opens the sheet.
export function SubNode({ data, selected }: NodeProps) {
  const d = data as SubNodeData;
  const c = KIND_COLOR[d.kind];
  return (
    <div
      className="pressable group relative w-[216px] cursor-pointer rounded-[var(--r-md)] px-3.5 py-2.5 text-left"
      style={{
        background: selected ? 'var(--surface)' : 'var(--surface)',
        boxShadow: selected
          ? `var(--shadow-float), 0 0 0 2px var(--accent)`
          : 'var(--shadow-card)',
        border: '0.5px solid var(--hairline)',
      }}
    >
      <div className="flex items-start gap-2.5">
        <span
          className="mt-[5px] h-2 w-2 shrink-0 rounded-full"
          style={{ background: c.dot, boxShadow: `0 0 0 3px ${c.tint}` }}
          aria-hidden
        />
        <span className="t-sm leading-snug text-ink">{d.label}</span>
      </div>
      <Handle
        type="target"
        position={d.side === 'left' ? Position.Right : Position.Left}
        className="!opacity-0"
      />
    </div>
  );
}

export const nodeTypes = {
  root: RootNode,
  topic: TopicNode,
  sub: SubNode,
};
