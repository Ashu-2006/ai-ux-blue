import { useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
  type Node,
} from '@xyflow/react';
import { nodeTypes } from './nodes';
import { buildGraph } from '@/lib/layout';
import { topics } from '@/lib/data';

interface Props {
  onSelect: (payload: { topicKey: string; subId?: string }) => void;
  focusNodeId?: string | null;
}

function GraphInner({ onSelect, focusNodeId }: Props) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildGraph(topics),
    [],
  );
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const rf = useReactFlow();

  // Open near the top at a readable zoom (roadmap.sh style), not fit-the-whole-tree.
  useEffect(() => {
    const root = nodes.find((x) => x.id === 'root');
    if (root) rf.setCenter(root.position.x + 60, root.position.y + 260, { zoom: 0.85, duration: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When Cmd-K picks a node, pan/zoom to it and select it.
  useEffect(() => {
    if (!focusNodeId) return;
    const n = nodes.find((x) => x.id === focusNodeId);
    if (n) {
      rf.setCenter(n.position.x + 105, n.position.y + 20, { zoom: 1.1, duration: 500 });
    }
  }, [focusNodeId, nodes, rf]);

  const handleNodeClick = (_: unknown, node: Node) => {
    const key = (node.data as { topicKey?: string }).topicKey;
    if (!key) return;
    if (node.type === 'topic') onSelect({ topicKey: key });
    else if (node.type === 'sub') onSelect({ topicKey: key, subId: node.id });
  };

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={handleNodeClick}
      defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
      minZoom={0.15}
      maxZoom={2}
      proOptions={{ hideAttribution: true }}
      nodesConnectable={false}
      nodesDraggable={false}
      elevateNodesOnSelect
    >
      <Background variant={BackgroundVariant.Dots} gap={30} size={1.2} color="var(--hairline)" />
      <Controls showInteractive={false} position="bottom-right" />
    </ReactFlow>
  );
}

export function RoadmapGraph(props: Props) {
  return (
    <ReactFlowProvider>
      <GraphInner {...props} />
    </ReactFlowProvider>
  );
}
