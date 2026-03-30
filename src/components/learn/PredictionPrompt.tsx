"use client";
import { useState } from "react";

interface PredictionPromptProps {
  question: string;
  options?: string[];
  reveal: string;
  accentColor?: string;
}

export default function PredictionPrompt({
  question,
  options,
  reveal,
  accentColor = "var(--color-accent-gold)",
}: PredictionPromptProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleTryAgain = () => {
    setSelected(null);
    setRevealed(false);
    setCollapsed(false);
  };

  const answerVisible = revealed && !collapsed;

  return (
    <div
      className="rounded-xl overflow-hidden my-4"
      style={{
        border: `2px dashed ${accentColor}`,
        backgroundColor: "var(--color-bg-surface)",
      }}
    >
      <div
        className="px-5 py-3 flex items-center gap-2"
        style={{
          backgroundColor: "var(--color-bg-card)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <span className="text-lg">🤔</span>
        <span
          className="text-xs font-bold uppercase"
          style={{ color: accentColor, letterSpacing: "1px" }}
        >
          What do you think?
        </span>
      </div>

      <div className="p-5">
        <p
          className="text-sm font-medium mb-3"
          style={{ color: "var(--color-text-primary)" }}
        >
          {question}
        </p>

        {/* Options: interactive before reveal, non-interactive (highlighted) when collapsed */}
        {options && (!revealed || collapsed) && (
          <div className="space-y-2 mb-4">
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => (!collapsed ? setSelected(i) : undefined)}
                disabled={collapsed}
                className="w-full text-left px-4 py-2.5 rounded-lg text-sm transition-[background-color,border-color] duration-150"
                style={{
                  minHeight: "44px",
                  backgroundColor:
                    selected === i
                      ? `color-mix(in srgb, ${accentColor} 12%, var(--color-bg-surface))`
                      : "var(--color-bg-surface)",
                  border: `1px solid ${selected === i ? accentColor : "var(--color-border)"}`,
                  color: "var(--color-text-primary)",
                  cursor: collapsed ? "default" : "pointer",
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* State: not yet revealed */}
        {!revealed && (
          <button
            onClick={() => setRevealed(true)}
            disabled={options ? selected === null : false}
            className="btn-3d text-sm"
            style={{
              minHeight: "44px",
              opacity: options && selected === null ? 0.5 : 1,
            }}
          >
            Reveal Answer →
          </button>
        )}

        {/* State: revealed + expanded — show answer panel */}
        {revealed && !collapsed && (
          <div
            aria-expanded={true}
            className="rounded-lg p-4 motion-safe:animate-fade-up"
            style={{
              backgroundColor: `color-mix(in srgb, ${accentColor} 6%, var(--color-bg-card))`,
              border: `1px solid ${accentColor}`,
              borderLeft: `4px solid ${accentColor}`,
            }}
          >
            <p
              className="text-sm leading-relaxed mb-3"
              style={{ color: "var(--color-text-primary)" }}
            >
              {reveal}
            </p>
            <button
              onClick={() => setCollapsed(true)}
              className="text-xs"
              style={{
                color: "var(--color-text-secondary)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px 0",
                minHeight: "44px",
              }}
            >
              Hide answer ▲
            </button>
          </div>
        )}

        {/* Try again — shown below answer panel when expanded */}
        {revealed && !collapsed && (
          <button
            onClick={handleTryAgain}
            className="mt-3 text-xs"
            style={{
              color: "var(--color-text-secondary)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px 0",
              minHeight: "44px",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            }}
          >
            Try again
          </button>
        )}

        {/* State: revealed + collapsed — show "Reveal again" + "Reset prediction" */}
        {revealed && collapsed && (
          <div className="flex flex-col gap-2">
            <button
              aria-expanded={false}
              onClick={() => setCollapsed(false)}
              className="btn-3d text-sm"
              style={{ minHeight: "44px" }}
            >
              Reveal again →
            </button>
            <button
              onClick={handleTryAgain}
              className="text-xs"
              style={{
                color: "var(--color-text-secondary)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px 0",
                minHeight: "44px",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              Reset prediction
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
