"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { DiagramContent } from "@/types/content";

// Node dimensions
const NODE_W = 160;
const NODE_H = 60;
const H_GAP = 80; // horizontal gap between nodes
const PADDING = 32; // canvas padding

// Simple icon paths (inline SVG, no external lib)
const ICON_PATHS: Record<string, string> = {
  search: "M11 17a6 6 0 1 0 0-12 6 6 0 0 0 0 12zm4.24-1.76 3.5 3.5",
  cube: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  database:
    "M12 3C7 3 3 4.8 3 7s4 4 9 4 9-1.8 9-4-4-4-9-4zM3 7v5c0 2.2 4 4 9 4s9-1.8 9-4V7M3 12v5c0 2.2 4 4 9 4s9-1.8 9-4v-5",
  sparkles:
    "M12 3v1m0 16v1M4.22 4.22l.7.7m12.16 12.16.7.7M3 12h1m16 0h1M4.92 19.08l.7-.7M18.36 5.64l.7-.7M12 7a5 5 0 1 1 0 10A5 5 0 0 1 12 7z",
  cpu: "M9 3H5a2 2 0 0 0-2 2v4m6-6h6m-6 0v18m6-18h4a2 2 0 0 1 2 2v4m-6-6v18m0 0H9m6 0h4a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2m0 0V9M5 9h14M5 9V5",
  arrow: "M5 12h14M12 5l7 7-7 7",
  layers: "M12 2L2 7l10 5 10-5-10-5zM2 12l10 5 10-5M2 17l10 5 10-5",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zm11-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  settings:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7.07-1.07 1.42 1.42-1.42 1.42-1.42-1.42a7 7 0 0 1-3.65 1.07v2h-2v-2a7 7 0 0 1-3.65-1.07L6.93 16.35 5.51 14.93l1.42-1.42A7 7 0 0 1 6 9.07V7h2V9.07a7 7 0 0 1 3.07-1.07V6h2v2a7 7 0 0 1 3.07 1.07l1.42-1.42z",
  filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  check: "M20 6L9 17l-5-5",
  file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm0 0v6h6",
  code: "M16 18l6-6-6-6M8 6l-6 6 6 6",
  terminal: "M4 17l6-6-6-6m6 14h8",
  network: "M9 3H5l-2 9h14L15 3H11m-2 0v9m4-9v9",
  brain:
    "M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2zm5 0A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2z",
};

function DiagramIcon({ name, size = 16 }: { name: string; size?: number }) {
  const d = ICON_PATHS[name] ?? ICON_PATHS.sparkles;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {d
        .split("M")
        .filter(Boolean)
        .map((seg, i) => (
          <path key={i} d={`M${seg}`} />
        ))}
    </svg>
  );
}

// Compute topological order of node IDs
function topoSort(nodeIds: string[], edges: Array<[string, string]>): string[] {
  const inDegree: Record<string, number> = {};
  const adj: Record<string, string[]> = {};
  for (const id of nodeIds) {
    inDegree[id] = 0;
    adj[id] = [];
  }
  for (const [from, to] of edges) {
    adj[from]?.push(to);
    if (inDegree[to] !== undefined) inDegree[to]++;
  }
  const queue = nodeIds.filter((id) => inDegree[id] === 0);
  const result: string[] = [];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    result.push(cur);
    for (const next of adj[cur] ?? []) {
      inDegree[next]--;
      if (inDegree[next] === 0) queue.push(next);
    }
  }
  // Append any not reached (cycles)
  for (const id of nodeIds) {
    if (!result.includes(id)) result.push(id);
  }
  return result;
}

interface PipelineDiagramProps extends DiagramContent {
  accentColor?: string;
}

export default function PipelineDiagram({
  nodes,
  edges,
  animate,
  stepThrough = false,
  accentColor = "#3b82f6",
}: PipelineDiagramProps) {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [step, setStep] = useState<number>(-1); // -1 = not started
  const [tooltipNode, setTooltipNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const orderedIds = topoSort(
    nodes.map((n) => n.id),
    edges,
  );
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Assign x positions based on topological order
  const nodePositions: Record<string, { x: number; y: number }> = {};
  orderedIds.forEach((id, i) => {
    nodePositions[id] = {
      x: PADDING + i * (NODE_W + H_GAP),
      y: PADDING,
    };
  });

  const svgWidth =
    PADDING + orderedIds.length * (NODE_W + H_GAP) - H_GAP + PADDING;
  const svgHeight = NODE_H + PADDING * 2 + 40; // +40 for tooltip area

  // Determine which nodes are "active" (visited) in step-through mode
  const visitedIds = new Set<string>();
  if (step >= 0) {
    for (let i = 0; i <= step; i++) {
      visitedIds.add(orderedIds[i]);
    }
  }
  const currentId = step >= 0 ? orderedIds[step] : null;

  // Edge active check: edge is active if both endpoints are visited and the edge leads TO current
  function isEdgeActive(from: string, to: string) {
    if (!stepThrough || step < 0) return animate;
    return visitedIds.has(from) && visitedIds.has(to);
  }

  function isEdgeCurrent(from: string, to: string) {
    if (!stepThrough || step < 0) return false;
    return visitedIds.has(from) && to === currentId;
  }

  const handleNodeClick = (id: string) => {
    setTooltipNode((prev) => (prev === id ? null : id));
    if (!stepThrough) setActiveNode((prev) => (prev === id ? null : id));
  };

  const handleNext = () => {
    setStep((prev) => {
      const next = prev + 1;
      if (next >= orderedIds.length) return prev;
      setTooltipNode(orderedIds[next]);
      return next;
    });
  };

  const handlePrev = () => {
    setStep((prev) => {
      if (prev <= 0) return prev;
      const next = prev - 1;
      setTooltipNode(orderedIds[next]);
      return next;
    });
  };

  const handleReset = () => {
    setStep(-1);
    setTooltipNode(null);
    setActiveNode(null);
  };

  // Keyboard navigation for step-through
  useEffect(() => {
    if (!stepThrough) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        handleReset();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const tooltipNodeData = tooltipNode ? nodeMap.get(tooltipNode) : null;

  // Build edge path: straight line with slight curve if parallel
  function edgePath(from: string, to: string) {
    const p1 = nodePositions[from];
    const p2 = nodePositions[to];
    if (!p1 || !p2) return "";
    const x1 = p1.x + NODE_W;
    const y1 = p1.y + NODE_H / 2;
    const x2 = p2.x;
    const y2 = p2.y + NODE_H / 2;
    const mx = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`;
  }

  const accentRgb = hexToRgb(accentColor);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid var(--color-border)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{
          backgroundColor: "var(--color-bg-surface)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--text-muted)" }}
        >
          Pipeline Diagram
        </span>
        {stepThrough && (
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {step < 0
              ? "Press Next to start"
              : `Step ${step + 1} of ${orderedIds.length}`}
          </span>
        )}
      </div>

      {/* SVG canvas */}
      <div
        className="w-full overflow-x-auto"
        style={{ backgroundColor: "var(--code-bg)" }}
      >
        <svg
          ref={svgRef}
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ minWidth: svgWidth, display: "block" }}
          role="img"
          aria-label="Pipeline diagram"
        >
          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrow"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L8,3 L0,6 Z" fill="var(--color-text-muted)" />
            </marker>
            <marker
              id="arrow-active"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L8,3 L0,6 Z" fill={accentColor} />
            </marker>
          </defs>

          {/* Edges */}
          {edges.map(([from, to]) => {
            const active = isEdgeActive(from, to);
            const isCurrent = isEdgeCurrent(from, to);
            const d = edgePath(from, to);
            return (
              <path
                key={`${from}-${to}`}
                d={d}
                fill="none"
                stroke={
                  isCurrent
                    ? accentColor
                    : active
                      ? accentColor
                      : "var(--color-text-muted)"
                }
                strokeWidth={isCurrent ? 2 : 1.5}
                strokeDasharray={active ? "8 12" : undefined}
                strokeOpacity={active ? 1 : 0.6}
                markerEnd={isCurrent ? "url(#arrow-active)" : "url(#arrow)"}
                className={active ? "edge-path" : undefined}
                style={
                  active
                    ? { animation: "flowPulse 1s linear infinite" }
                    : undefined
                }
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const pos = nodePositions[node.id];
            if (!pos) return null;
            const isActive = activeNode === node.id || currentId === node.id;
            const isVisited = visitedIds.has(node.id);
            const isDimmed = stepThrough && step >= 0 && !isVisited;
            const isTooltipOpen = tooltipNode === node.id;

            return (
              <g
                key={node.id}
                onClick={() => handleNodeClick(node.id)}
                style={{ cursor: "pointer" }}
                role="button"
                tabIndex={0}
                aria-label={`${node.label}: ${node.description}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    handleNodeClick(node.id);
                }}
              >
                {/* Node glow effect */}
                {isActive && (
                  <rect
                    x={pos.x - 4}
                    y={pos.y - 4}
                    width={NODE_W + 8}
                    height={NODE_H + 8}
                    rx="14"
                    fill="none"
                    stroke={accentColor}
                    strokeWidth="1.5"
                    strokeOpacity="0.4"
                    filter={`drop-shadow(0 0 10px ${accentColor})`}
                  />
                )}

                {/* Node rectangle */}
                <rect
                  x={pos.x}
                  y={pos.y}
                  width={NODE_W}
                  height={NODE_H}
                  rx="10"
                  fill={
                    isActive
                      ? `rgba(${accentRgb}, 0.18)`
                      : isVisited && stepThrough
                        ? `rgba(${accentRgb}, 0.08)`
                        : "var(--color-bg-surface)"
                  }
                  stroke={
                    isActive
                      ? accentColor
                      : isTooltipOpen
                        ? accentColor
                        : "var(--color-border)"
                  }
                  strokeWidth={isActive ? 1.5 : 1}
                  opacity={isDimmed ? 0.35 : 1}
                  style={{ transition: "all 200ms" }}
                />

                {/* Icon + Label */}
                <foreignObject
                  x={pos.x}
                  y={pos.y}
                  width={NODE_W}
                  height={NODE_H}
                  style={{
                    opacity: isDimmed ? 0.35 : 1,
                    transition: "opacity 200ms",
                  }}
                >
                  <div
                    style={{
                      width: NODE_W,
                      height: NODE_H,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                    }}
                  >
                    <span
                      style={{
                        color: isActive ? accentColor : "var(--text-muted)",
                      }}
                    >
                      <DiagramIcon name={node.icon} size={14} />
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: isActive
                          ? "var(--text-primary)"
                          : "var(--text-secondary)",
                        textAlign: "center",
                        padding: "0 8px",
                        lineHeight: 1.3,
                        transition: "color 200ms",
                      }}
                    >
                      {node.label}
                    </span>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Tooltip / description panel */}
      {tooltipNodeData && (
        <div
          className="px-4 py-3 text-sm"
          style={{
            backgroundColor: `rgba(${accentRgb}, 0.07)`,
            borderTop: `1px solid rgba(${accentRgb}, 0.18)`,
            color: "var(--text-secondary)",
          }}
        >
          <div className="flex items-start gap-2">
            <span style={{ color: accentColor, marginTop: 2 }}>
              <DiagramIcon name={tooltipNodeData.icon} size={14} />
            </span>
            <div>
              <p
                className="font-medium text-sm mb-0.5"
                style={{ color: "var(--text-primary)" }}
              >
                {tooltipNodeData.label}
              </p>
              <p style={{ color: "var(--text-secondary)" }}>
                {tooltipNodeData.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Step-through controls */}
      {stepThrough && (
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{
            borderTop: "1px solid var(--color-border)",
            backgroundColor: "var(--color-bg-surface)",
          }}
        >
          <button
            onClick={handleReset}
            className="text-xs px-2.5 py-1 rounded cursor-pointer"
            style={{
              color: "var(--text-muted)",
              border: "1px solid var(--color-border)",
            }}
          >
            Reset
          </button>
          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              disabled={step <= 0}
              className="text-xs px-2.5 py-1 rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "var(--color-bg-card)",
                color: "var(--text-secondary)",
                border: "1px solid var(--color-border)",
              }}
              aria-label="Previous step"
            >
              ← Prev
            </button>
            <button
              onClick={handleNext}
              disabled={step >= orderedIds.length - 1}
              className="text-xs px-2.5 py-1 rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                backgroundColor:
                  step < 0 ? accentColor : "var(--color-bg-card)",
                color: step < 0 ? "#fff" : "var(--text-secondary)",
                border: `1px solid ${step < 0 ? accentColor : "var(--color-border)"}`,
              }}
              aria-label="Next step"
            >
              {step < 0
                ? "Start →"
                : step >= orderedIds.length - 1
                  ? "Done ✓"
                  : "Next →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `${r},${g},${b}`;
}
