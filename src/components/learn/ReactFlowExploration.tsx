"use client";
import { useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  type NodeTypes,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Custom node component
function ConceptNode({ data }: { data: Record<string, unknown> }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="cursor-pointer rounded-xl transition-[border-color,box-shadow,max-width] duration-200"
      style={{
        backgroundColor: data.active
          ? "var(--color-bg-card)"
          : "var(--color-bg-surface)",
        border: `2px solid ${data.active ? (data.accentColor as string) || "var(--color-accent-gold)" : "var(--color-border)"}`,
        padding: "12px 16px",
        minWidth: "140px",
        maxWidth: expanded ? "280px" : "180px",
        boxShadow: data.active
          ? `0 0 20px ${(data.accentColor as string) || "var(--color-accent-gold)"}20`
          : "none",
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">{data.icon as string}</span>
        <span
          className="text-sm font-medium"
          style={{ color: "var(--color-text-primary)" }}
        >
          {data.label as string}
        </span>
      </div>
      {expanded && typeof data.details === "string" && (
        <p
          className="text-xs mt-2 leading-relaxed"
          style={{
            color: "var(--color-text-secondary)",
          }}
        >
          {data.details}
        </p>
      )}
    </div>
  );
}

const nodeTypes: NodeTypes = {
  concept: ConceptNode,
};

interface ReactFlowExplorationProps {
  nodes: Node[];
  edges: Edge[];
  interactive?: boolean;
  accentColor?: string;
}

export default function ReactFlowExploration({
  nodes: initialNodes,
  edges: initialEdges,
  interactive = true,
}: ReactFlowExplorationProps) {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={interactive ? onNodesChange : undefined}
      onEdgesChange={interactive ? onEdgesChange : undefined}
      nodeTypes={nodeTypes}
      fitView
      panOnDrag={interactive}
      zoomOnScroll={interactive}
      zoomOnPinch={interactive}
      nodesDraggable={interactive}
      nodesConnectable={false}
      elementsSelectable={interactive}
      proOptions={{ hideAttribution: true }}
      style={{ backgroundColor: "var(--color-code-bg)" }}
    >
      <Background color="var(--color-border)" gap={20} size={1} />
      {interactive && <Controls />}
    </ReactFlow>
  );
}
