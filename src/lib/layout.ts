import type { Node, Edge } from '@xyflow/react';
import type { Topic } from './types';

// Layout constants (px in flow coordinates). Matched to the Apple node sizes.
const SPINE_X = 0;
const ROOT_Y = -190;
const TOPIC_GAP_Y = 72; // extra gap between topic blocks
const SUB_H = 50; // sub-node row height incl gap
const SUB_COL_W = 300; // horizontal offset of a sub column from spine
const SUB_COL_STEP = 250; // extra offset per additional column
const TOPIC_W = 248;
const SUB_W = 216;

// Build nodes + edges for the whole roadmap in a central-spine layout:
// root title on top, topics down the middle, sub-topics fanned left/right.
export function buildGraph(topics: Topic[]): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  nodes.push({
    id: 'root',
    type: 'root',
    position: { x: SPINE_X - 120, y: ROOT_Y },
    data: { title: 'UX Design', subtitle: 'for AI & Crypto Products' },
    draggable: false,
    selectable: false,
  });

  let cursorY = 0;

  topics.forEach((t, ti) => {
    // Split sub-nodes into left/right columns. To keep each side readable we
    // stack up to `rowsPerCol` per column, then start a second column further out.
    const subs = t.subNodes;
    const half = Math.ceil(subs.length / 2);
    const leftSubs = subs.slice(0, half);
    const rightSubs = subs.slice(half);

    const rowsPerCol = 9;
    const leftCols = Math.max(1, Math.ceil(leftSubs.length / rowsPerCol));
    const rightCols = Math.max(1, Math.ceil(rightSubs.length / rowsPerCol));
    const maxRows = Math.max(
      Math.ceil(leftSubs.length / leftCols),
      Math.ceil(rightSubs.length / rightCols),
      1,
    );
    const blockH = maxRows * SUB_H;

    const topicY = cursorY + blockH / 2;
    const topicId = `topic-${t.id}`;

    nodes.push({
      id: topicId,
      type: 'topic',
      position: { x: SPINE_X - TOPIC_W / 2, y: topicY },
      data: { label: t.title, hue: t.hue, count: subs.length, index: ti, topicKey: t.id },
      draggable: false,
    });

    // spine edge from previous anchor to this topic
    const prevAnchor = ti === 0 ? 'root' : `topic-${topics[ti - 1].id}`;
    edges.push({
      id: `spine-${ti}`,
      source: prevAnchor,
      target: topicId,
      type: 'default',
      className: 'spine',
      selectable: false,
    });

    // place a side's sub-nodes in columns
    const placeSide = (
      sideSubs: typeof subs,
      side: 'left' | 'right',
      cols: number,
    ) => {
      const perCol = Math.ceil(sideSubs.length / cols);
      sideSubs.forEach((s, i) => {
        const col = Math.floor(i / perCol);
        const row = i % perCol;
        const colCount = Math.ceil(sideSubs.length / cols) || 1;
        const sideBlockH = colCount * SUB_H;
        const startY = topicY - sideBlockH / 2 + SUB_H / 2;
        const xOffset = SUB_COL_W + col * SUB_COL_STEP;
        const x = side === 'left' ? -xOffset - SUB_W : xOffset;
        const y = startY + row * SUB_H;
        nodes.push({
          id: s.id,
          type: 'sub',
          position: { x, y },
          data: { label: s.label, kind: s.kind, hue: t.hue, side, topicKey: t.id },
          draggable: false,
        });
        edges.push({
          id: `e-${s.id}`,
          source: topicId,
          sourceHandle: side === 'left' ? 'l' : 'r',
          target: s.id,
          type: 'default',
          selectable: false,
        });
      });
    };

    placeSide(leftSubs, 'left', leftCols);
    placeSide(rightSubs, 'right', rightCols);

    cursorY += blockH + TOPIC_GAP_Y + 40;
  });

  return { nodes, edges };
}
