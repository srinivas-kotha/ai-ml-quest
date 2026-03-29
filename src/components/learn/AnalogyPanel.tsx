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

export default function AnalogyPanel({
  analogies,
  accentColor = "var(--color-accent-gold)",
}: AnalogyPanelProps) {
  const backgrounds = [...new Set(analogies.map((a) => a.background))];
  const nonGeneralBackgrounds = backgrounds.filter((b) => b !== "general");
  const [selectedBg, setSelectedBg] = useState(
    nonGeneralBackgrounds[0] || "general",
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  const filtered = analogies.filter(
    (a) => a.background === selectedBg || a.background === "general",
  );
  const analogy = filtered[currentIndex] || filtered[0];

  if (!analogy) return null;

  const handleBgChange = (bg: string) => {
    setSelectedBg(bg);
    setCurrentIndex(0);
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
          {nonGeneralBackgrounds.map((bg) => (
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
              {bg.charAt(0).toUpperCase() + bg.slice(1)}
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

        {/* Pagination dots for multiple analogies */}
        {filtered.length > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() =>
                setCurrentIndex((prev) =>
                  prev > 0 ? prev - 1 : filtered.length - 1,
                )
              }
              className="text-xs px-2 py-1 rounded transition-[background-color,color] duration-150"
              style={{
                color: "var(--color-text-muted)",
                backgroundColor: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
              }}
              aria-label="Previous analogy"
            >
              ←
            </button>
            {filtered.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className="w-2 h-2 rounded-full transition-[background-color] duration-150"
                style={{
                  backgroundColor:
                    currentIndex === idx
                      ? accentColor
                      : "var(--color-text-muted)",
                  opacity: currentIndex === idx ? 1 : 0.4,
                }}
                aria-label={`Analogy ${idx + 1}`}
              />
            ))}
            <button
              onClick={() =>
                setCurrentIndex((prev) =>
                  prev < filtered.length - 1 ? prev + 1 : 0,
                )
              }
              className="text-xs px-2 py-1 rounded transition-[background-color,color] duration-150"
              style={{
                color: "var(--color-text-muted)",
                backgroundColor: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
              }}
              aria-label="Next analogy"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
