"use client";
import { useState } from "react";

interface AnalogyItem {
  background: string; // "frontend" | "backend" | "devops" | "general"
  familiarConcept: string;
  familiarIcon: string; // emoji
  newConcept: string;
  newIcon: string; // emoji
  bridgeText: string;
  breakPoint: string; // where the analogy breaks
}

interface AnalogyPanelProps {
  analogies: AnalogyItem[];
  accentColor?: string;
}

const TAB_LABELS: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  devops: "DevOps",
  general: "General",
};

function formatTabLabel(bg: string): string {
  return TAB_LABELS[bg] ?? bg.charAt(0).toUpperCase() + bg.slice(1);
}

export default function AnalogyPanel({
  analogies,
  accentColor = "var(--color-accent-gold)",
}: AnalogyPanelProps) {
  // Extract all unique backgrounds, preserving insertion order
  const allBackgrounds = [...new Set(analogies.map((a) => a.background))];
  const hasGeneral = allBackgrounds.includes("general");

  // Non-general tabs first, then General if it exists
  const tabs = [
    ...allBackgrounds.filter((b) => b !== "general"),
    ...(hasGeneral ? ["general"] : []),
  ];

  const [selectedBg, setSelectedBg] = useState(tabs[0] ?? "general");
  const [currentIndex, setCurrentIndex] = useState(0);

  // Each tab shows ONLY exact-match analogies (no bleed-in of "general")
  const filtered = analogies.filter((a) => a.background === selectedBg);
  const analogy = filtered[currentIndex] ?? filtered[0];

  if (!analogy) return null;

  const handleBgChange = (bg: string) => {
    setSelectedBg(bg);
    setCurrentIndex(0);
  };

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === filtered.length - 1;

  const handlePrev = () => {
    if (!isFirst) setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (!isLast) setCurrentIndex((prev) => prev + 1);
  };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: "var(--color-bg-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      {/* Header with background selector tabs */}
      <div
        className="flex items-center gap-2 px-5 py-3 flex-wrap"
        style={{
          borderBottom: "1px solid var(--color-border)",
          backgroundColor: "var(--color-bg-card)",
        }}
      >
        <span
          className="text-xs font-medium"
          style={{ color: "var(--color-accent-gold)" }}
        >
          💡 YOU ALREADY KNOW THIS
        </span>
        <div className="ml-auto flex gap-1 flex-wrap">
          {tabs.map((bg) => (
            <button
              key={bg}
              onClick={() => handleBgChange(bg)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium transition-[background-color,color,border-color] duration-150"
              style={{
                backgroundColor:
                  selectedBg === bg
                    ? "var(--color-accent-gold)"
                    : "var(--color-bg-surface)",
                color:
                  selectedBg === bg
                    ? "var(--color-bg-primary)"
                    : "var(--color-text-muted)",
                border: `1px solid ${selectedBg === bg ? "var(--color-accent-gold)" : "var(--color-border)"}`,
              }}
            >
              {formatTabLabel(bg)}
            </button>
          ))}
        </div>
      </div>

      {/* Analogy body */}
      <div className="p-5">
        <div className="flex items-center gap-4 mb-4">
          {/* Familiar concept */}
          <div
            className="flex-1 text-center p-4 rounded-xl"
            style={{
              backgroundColor: "var(--color-bg-card)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="text-3xl mb-2">{analogy.familiarIcon}</div>
            <div
              className="text-sm font-medium"
              style={{ color: "var(--color-text-primary)" }}
            >
              {analogy.familiarConcept}
            </div>
          </div>

          {/* Arrow */}
          <div className="text-2xl" style={{ color: accentColor }}>
            →
          </div>

          {/* New concept */}
          <div
            className="flex-1 text-center p-4 rounded-xl"
            style={{
              backgroundColor: `color-mix(in srgb, ${accentColor} 8%, var(--color-bg-card))`,
              border: `2px solid ${accentColor}`,
              borderLeftWidth: "4px",
            }}
          >
            <div className="text-3xl mb-2">{analogy.newIcon}</div>
            <div
              className="text-sm font-medium"
              style={{ color: "var(--color-text-primary)" }}
            >
              {analogy.newConcept}
            </div>
          </div>
        </div>

        {/* Bridge text */}
        <p
          className="text-sm leading-relaxed mb-3"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {analogy.bridgeText}
        </p>

        {/* Break point */}
        <details
          className="text-xs mb-3"
          style={{ color: "var(--color-text-muted)" }}
        >
          <summary className="cursor-pointer hover:text-[var(--color-accent-gold)] transition-colors duration-150">
            🎓 Where this analogy breaks...
          </summary>
          <p
            className="mt-2 pl-4"
            style={{ borderLeft: "2px solid var(--color-border)" }}
          >
            {analogy.breakPoint}
          </p>
        </details>

        {/* Pagination — always visible when there is at least 1 item */}
        {filtered.length >= 1 && (
          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              onClick={handlePrev}
              disabled={isFirst}
              aria-disabled={isFirst}
              aria-label="Previous analogy"
              style={{
                opacity: isFirst ? 0.3 : 1,
                color: accentColor,
                minWidth: "44px",
                minHeight: "44px",
                background: "none",
                border: "none",
                cursor: isFirst ? "default" : "pointer",
                fontSize: "1.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "opacity 150ms",
              }}
            >
              ←
            </button>
            <span
              className="text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {currentIndex + 1} of {filtered.length}
            </span>
            <button
              onClick={handleNext}
              disabled={isLast}
              aria-disabled={isLast}
              aria-label="Next analogy"
              style={{
                opacity: isLast ? 0.3 : 1,
                color: accentColor,
                minWidth: "44px",
                minHeight: "44px",
                background: "none",
                border: "none",
                cursor: isLast ? "default" : "pointer",
                fontSize: "1.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "opacity 150ms",
              }}
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
