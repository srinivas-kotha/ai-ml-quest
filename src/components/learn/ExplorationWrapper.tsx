"use client";
import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import type { Node, Edge } from "@xyflow/react";

// Lazy-load React Flow to reduce initial bundle
const ReactFlowExploration = dynamic(() => import("./ReactFlowExploration"), {
  loading: () => <SectionSkeleton />,
  ssr: false,
});

interface ExplorationWrapperProps {
  title: string;
  description?: string;
  nodes: Node[]; // React Flow node data
  edges: Edge[]; // React Flow edge data
  accentColor?: string;
  staticFallbackUrl?: string; // URL to static image for mobile
}

function SectionSkeleton() {
  return (
    <div
      className="rounded-xl animate-pulse"
      style={{
        backgroundColor: "var(--color-bg-surface)",
        height: "400px",
        border: "1px solid var(--color-border)",
      }}
    />
  );
}

export default function ExplorationWrapper({
  title,
  description,
  nodes,
  edges,
  accentColor = "var(--color-accent-gold)",
  staticFallbackUrl,
}: ExplorationWrapperProps) {
  const [viewportWidth, setViewportWidth] = useState(1024);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setViewportWidth(window.innerWidth);
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!mounted) return <SectionSkeleton />;

  const isDesktop = viewportWidth >= 1024;
  const isTablet = viewportWidth >= 768;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: "var(--color-bg-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{
          backgroundColor: "var(--color-bg-card)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div>
          <span
            className="text-xs font-bold uppercase"
            style={{
              color: accentColor,
              letterSpacing: "1.5px",
            }}
          >
            Interactive Exploration
          </span>
          <h3
            className="font-display text-base mt-0.5"
            style={{ color: "var(--color-text-primary)" }}
          >
            {title}
          </h3>
        </div>
        {!isDesktop && (
          <span
            className="text-xs px-2 py-1 rounded-lg"
            style={{
              backgroundColor: "var(--color-bg-surface)",
              color: "var(--color-text-muted)",
              border: "1px solid var(--color-border)",
            }}
          >
            {isTablet ? "Click to explore" : "Swipe through steps"}
          </span>
        )}
      </div>

      {/* Content */}
      <div
        style={{
          height: isDesktop ? "450px" : isTablet ? "350px" : "auto",
          minHeight: "250px",
        }}
      >
        {isDesktop || isTablet ? (
          <Suspense fallback={<SectionSkeleton />}>
            <ReactFlowExploration
              nodes={nodes}
              edges={edges}
              interactive={isDesktop}
              accentColor={accentColor}
            />
          </Suspense>
        ) : /* Mobile fallback — static image or message */
        staticFallbackUrl ? (
          <img
            src={staticFallbackUrl}
            alt={title}
            className="w-full h-auto"
            loading="lazy"
          />
        ) : (
          <div
            className="p-5 text-center"
            style={{ color: "var(--color-text-muted)" }}
          >
            <p className="text-sm">
              View on a larger screen for the interactive exploration.
            </p>
            {description && (
              <p
                className="text-sm mt-2"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {description}
              </p>
            )}
          </div>
        )}
      </div>

      {description && (isDesktop || isTablet) && (
        <div
          className="px-5 py-3"
          style={{
            borderTop: "1px solid var(--color-border)",
            color: "var(--color-text-secondary)",
          }}
        >
          <p className="text-sm">{description}</p>
        </div>
      )}
    </div>
  );
}
