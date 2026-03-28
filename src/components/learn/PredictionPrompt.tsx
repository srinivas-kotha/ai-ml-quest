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

        {options && !revealed && (
          <div className="space-y-2 mb-4">
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className="w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors duration-150"
                style={{
                  backgroundColor:
                    selected === i
                      ? `color-mix(in srgb, ${accentColor} 12%, var(--color-bg-surface))`
                      : "var(--color-bg-surface)",
                  border: `1px solid ${selected === i ? accentColor : "var(--color-border)"}`,
                  color: "var(--color-text-primary)",
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            disabled={options ? selected === null : false}
            className="btn-3d text-sm"
            style={{ opacity: options && selected === null ? 0.5 : 1 }}
          >
            Reveal Answer →
          </button>
        ) : (
          <div
            className="rounded-lg p-4 animate-fade-up"
            style={{
              backgroundColor: `color-mix(in srgb, ${accentColor} 6%, var(--color-bg-card))`,
              border: `1px solid ${accentColor}`,
              borderLeft: `4px solid ${accentColor}`,
            }}
          >
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-text-primary)" }}
            >
              {reveal}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
