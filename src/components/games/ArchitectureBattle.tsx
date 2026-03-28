"use client";

import { useState } from "react";
import type { ArchitectureBattleConfig } from "@/types/content";

interface ArchitectureBattleProps {
  config: ArchitectureBattleConfig;
  accentColor: string;
  onComplete: (score: number, maxScore: number) => void;
}

export default function ArchitectureBattle({
  config,
  accentColor,
  onComplete,
}: ArchitectureBattleProps) {
  const { battles } = config;
  const [battleIdx, setBattleIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const current = battles[battleIdx];
  const isLast = battleIdx >= battles.length - 1;

  const handleSelect = (optIdx: number) => {
    if (submitted) return;
    setSelected(optIdx);
  };

  const handleSubmit = () => {
    if (submitted || selected === null) return;
    setSubmitted(true);
    const correct = selected === current.correct;
    if (correct) setScore((s) => s + 1);

    setTimeout(() => {
      if (isLast) {
        onComplete(correct ? score + 1 : score, battles.length);
      } else {
        setBattleIdx((i) => i + 1);
        setSelected(null);
        setSubmitted(false);
      }
    }, 2200);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Progress */}
      <div
        className="flex items-center justify-between text-xs"
        style={{ color: "var(--text-muted)" }}
      >
        <span>
          Battle {battleIdx + 1} of {battles.length}
        </span>
        <span style={{ color: accentColor }}>⚔ Architecture Battle</span>
      </div>

      {/* Scenario */}
      <div
        className="rounded-xl p-4 text-sm leading-relaxed font-medium"
        style={{
          backgroundColor: `${accentColor}10`,
          border: `1px solid ${accentColor}25`,
          color: "var(--text-primary)",
        }}
      >
        {current.scenario}
      </div>

      {/* VS layout */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-center">
        {current.options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = submitted && i === current.correct;
          const isWrong = submitted && i === selected && i !== current.correct;

          return (
            <div
              key={i}
              className={i === 1 ? "hidden sm:flex justify-center" : ""}
            >
              {i === 1 && (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    backgroundColor: "var(--color-bg-surface)",
                    color: "var(--text-muted)",
                  }}
                >
                  VS
                </div>
              )}
              <button
                key={opt.name}
                type="button"
                disabled={submitted}
                onClick={() => handleSelect(i)}
                className="w-full text-left rounded-xl p-4 flex flex-col gap-2 transition-[background-color,border-color,transform]"
                style={{
                  backgroundColor: isCorrect
                    ? "rgba(245,197,66,0.10)"
                    : isWrong
                      ? "rgba(239,68,68,0.10)"
                      : isSelected
                        ? `${accentColor}15`
                        : "var(--color-bg-surface)",
                  border: `2px solid ${
                    isCorrect
                      ? "var(--success)"
                      : isWrong
                        ? "var(--error)"
                        : isSelected
                          ? accentColor
                          : "var(--color-border)"
                  }`,
                  cursor: submitted ? "default" : "pointer",
                  transform:
                    isSelected && !submitted ? "scale(1.01)" : "scale(1)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-sm font-semibold"
                    style={{
                      color: isCorrect
                        ? "var(--success)"
                        : isWrong
                          ? "var(--error)"
                          : isSelected
                            ? accentColor
                            : "var(--text-primary)",
                    }}
                  >
                    {opt.name}
                  </span>
                  {isCorrect && (
                    <span
                      className="text-xs font-bold"
                      style={{ color: "var(--success)" }}
                    >
                      ✓ Correct
                    </span>
                  )}
                  {isWrong && (
                    <span
                      className="text-xs font-bold"
                      style={{ color: "var(--error)" }}
                    >
                      ✗ Wrong
                    </span>
                  )}
                  {!submitted && isSelected && (
                    <span
                      className="text-xs font-bold"
                      style={{ color: accentColor }}
                    >
                      ← Selected
                    </span>
                  )}
                </div>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "var(--text-muted)" }}
                >
                  {opt.description}
                </p>
              </button>
            </div>
          );
        })}
      </div>

      {/* VS divider on mobile */}
      <div className="flex sm:hidden items-center justify-center">
        <div
          className="h-px flex-1"
          style={{ backgroundColor: "var(--color-border)" }}
        />
        <span
          className="px-3 text-xs font-bold"
          style={{ color: "var(--text-muted)" }}
        >
          VS
        </span>
        <div
          className="h-px flex-1"
          style={{ backgroundColor: "var(--color-border)" }}
        />
      </div>

      {/* Mobile second option - needed because grid is 1 col on mobile */}

      {/* Submit */}
      {!submitted && (
        <button
          type="button"
          disabled={selected === null}
          onClick={handleSubmit}
          className="rounded-xl py-2.5 text-sm font-semibold transition-[background-color,color]"
          style={{
            backgroundColor:
              selected !== null ? accentColor : "var(--color-bg-surface)",
            color: selected !== null ? "#0c0c14" : "var(--text-muted)",
            cursor: selected !== null ? "pointer" : "not-allowed",
          }}
        >
          Submit Choice
        </button>
      )}

      {/* Explanation */}
      {submitted && current.explanation && (
        <div
          className="rounded-xl p-3 text-xs leading-relaxed"
          style={{
            backgroundColor:
              selected === current.correct
                ? "rgba(245,197,66,0.08)"
                : "rgba(239,68,68,0.08)",
            border: `1px solid ${selected === current.correct ? "rgba(245,197,66,0.25)" : "rgba(239,68,68,0.25)"}`,
            color: "var(--text-secondary)",
          }}
        >
          <span
            className="font-semibold"
            style={{
              color:
                selected === current.correct
                  ? "var(--success)"
                  : "var(--error)",
            }}
          >
            {selected === current.correct
              ? "✓ Right choice — "
              : "✗ Not optimal — "}
          </span>
          {current.explanation}
        </div>
      )}
    </div>
  );
}
