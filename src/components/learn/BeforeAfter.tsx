"use client";

import { useState, useEffect, useRef } from "react";
import type { ComparisonContent } from "@/types/content";
import MarkdownText from "./MarkdownText";

interface BeforeAfterProps extends ComparisonContent {
  accentColor?: string;
}

type Tab = "before" | "after";

export default function BeforeAfter({
  before,
  after,
  accentColor = "#3b82f6",
}: BeforeAfterProps) {
  const [activeTab, setActiveTab] = useState<Tab>("before");
  const [visible, setVisible] = useState(true);
  const prevTab = useRef<Tab>("before");

  // Crossfade: fade out → switch content → fade in
  const handleTabClick = (tab: Tab) => {
    if (tab === activeTab) return;
    setVisible(false);
    setTimeout(() => {
      setActiveTab(tab);
      prevTab.current = tab;
      setVisible(true);
    }, 120); // matches 150ms transition — start fading in at 120ms
  };

  // Keyboard: Tab navigates between tabs, Enter activates
  const handleKeyDown = (e: React.KeyboardEvent, tab: Tab) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleTabClick(tab);
    }
  };

  const currentContent = activeTab === "before" ? before : after;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* Tab bar */}
      <div
        className="flex"
        role="tablist"
        aria-label="Before and after comparison"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Before tab */}
        <button
          role="tab"
          aria-selected={activeTab === "before"}
          aria-controls="before-after-panel"
          onClick={() => handleTabClick("before")}
          onKeyDown={(e) => handleKeyDown(e, "before")}
          className="relative flex-1 flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium transition-colors cursor-pointer"
          style={{
            backgroundColor:
              activeTab === "before"
                ? "rgba(239,68,68,0.08)"
                : "rgba(255,255,255,0.02)",
            color: activeTab === "before" ? "#ef4444" : "var(--text-muted)",
            borderRight: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Before icon: X circle */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {before.label}
          {/* Active underline */}
          {activeTab === "before" && (
            <span
              className="absolute bottom-0 left-0 right-0 h-0.5"
              style={{ backgroundColor: "#ef4444" }}
            />
          )}
        </button>

        {/* After tab */}
        <button
          role="tab"
          aria-selected={activeTab === "after"}
          aria-controls="before-after-panel"
          onClick={() => handleTabClick("after")}
          onKeyDown={(e) => handleKeyDown(e, "after")}
          className="relative flex-1 flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium transition-colors cursor-pointer"
          style={{
            backgroundColor:
              activeTab === "after"
                ? "rgba(16,185,129,0.08)"
                : "rgba(255,255,255,0.02)",
            color: activeTab === "after" ? "#10b981" : "var(--text-muted)",
          }}
        >
          {/* After icon: check circle */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="8 12 11 15 16 9" />
          </svg>
          {after.label}
          {/* Active underline */}
          {activeTab === "after" && (
            <span
              className="absolute bottom-0 left-0 right-0 h-0.5"
              style={{ backgroundColor: "#10b981" }}
            />
          )}
        </button>
      </div>

      {/* Content area */}
      <div
        id="before-after-panel"
        role="tabpanel"
        className="p-5"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 150ms ease",
          backgroundColor:
            activeTab === "before"
              ? "rgba(239,68,68,0.03)"
              : "rgba(16,185,129,0.03)",
          minHeight: 80,
        }}
        aria-label={currentContent.label}
      >
        {/* Tab label badge */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded"
            style={{
              backgroundColor:
                activeTab === "before"
                  ? "rgba(239,68,68,0.15)"
                  : "rgba(16,185,129,0.15)",
              color: activeTab === "before" ? "#ef4444" : "#10b981",
            }}
          >
            {currentContent.label}
          </span>
        </div>

        <MarkdownText content={currentContent.content} />
      </div>
    </div>
  );
}
