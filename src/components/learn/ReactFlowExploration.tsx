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

/** Decision node — rounded rect with gold border for branching questions */
function DecisionNode({ data }: { data: Record<string, unknown> }) {
  return (
    <div
      style={{
        backgroundColor: "var(--color-bg-card)",
        border: "2px solid var(--color-accent-gold)",
        borderRadius: "10px",
        padding: "8px 12px",
        width: "160px",
        minHeight: "52px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        boxShadow: "0 0 12px rgba(255, 184, 0, 0.15)",
      }}
    >
      <span
        style={{
          color: "var(--color-text-primary)",
          fontSize: "12px",
          fontWeight: 600,
          lineHeight: "1.35",
          whiteSpace: "pre-line",
        }}
      >
        {data.label as string}
      </span>
    </div>
  );
}

/** Outcome node — filled with branch accent color, for major outcomes */
function OutcomeNode({ data }: { data: Record<string, unknown> }) {
  const bg = (data.color as string) ?? "#3b82f6";
  return (
    <div
      style={{
        backgroundColor: bg,
        border: `2px solid ${bg}`,
        borderRadius: "10px",
        padding: "8px 12px",
        width: "130px",
        minHeight: "44px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        boxShadow: `0 0 16px ${bg}40`,
      }}
    >
      <span
        style={{
          color: "#ffffff",
          fontSize: "13px",
          fontWeight: 700,
          lineHeight: "1.35",
          whiteSpace: "pre-line",
        }}
      >
        {data.label as string}
      </span>
    </div>
  );
}

/** Leaf node — subtle tinted background for terminal outcomes */
function LeafNode({ data }: { data: Record<string, unknown> }) {
  const bg = (data.color as string) ?? "#3b82f6";
  return (
    <div
      style={{
        backgroundColor: `${bg}22`,
        border: `1.5px solid ${bg}`,
        borderRadius: "8px",
        padding: "7px 10px",
        width: "150px",
        minHeight: "44px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <span
        style={{
          color: "var(--color-text-primary)",
          fontSize: "11.5px",
          fontWeight: 600,
          lineHeight: "1.35",
          whiteSpace: "pre-line",
        }}
      >
        {data.label as string}
      </span>
    </div>
  );
}

const nodeTypes: NodeTypes = {
  concept: ConceptNode,
  decision: DecisionNode as unknown as NodeTypes[string],
  outcome: OutcomeNode as unknown as NodeTypes[string],
  leaf: LeafNode as unknown as NodeTypes[string],
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
  // Apply default edge styles — ensure edges are visible on both light and dark themes
  const styledEdges = initialEdges.map((edge) => ({
    ...edge,
    style: {
      stroke: "var(--color-text-muted)",
      strokeWidth: 1.5,
      ...edge.style,
    },
    labelStyle: {
      fill: "var(--color-text-secondary)",
      fontSize: 11,
      ...edge.labelStyle,
    },
    labelBgStyle: {
      fill: "var(--color-bg-card)",
      fillOpacity: 0.85,
      ...edge.labelBgStyle,
    },
  }));
  const [edges, , onEdgesChange] = useEdgesState(styledEdges);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={interactive ? onNodesChange : undefined}
      onEdgesChange={interactive ? onEdgesChange : undefined}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.15 }}
      panOnDrag={interactive}
      zoomOnScroll={interactive}
      zoomOnPinch={interactive}
      nodesDraggable={interactive}
      nodesConnectable={false}
      elementsSelectable={interactive}
      proOptions={{ hideAttribution: true }}
      style={{ backgroundColor: "var(--color-bg-card)" }}
    >
      <Background color="var(--color-border)" gap={20} size={1} />
      {interactive && <Controls />}
    </ReactFlow>
  );
}
