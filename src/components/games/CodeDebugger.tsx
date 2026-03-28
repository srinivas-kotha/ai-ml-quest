"use client";

import { useState } from "react";
import type { CodeDebuggerConfig } from "@/types/content";

interface CodeDebuggerProps {
  config: CodeDebuggerConfig;
  accentColor: string;
  onComplete: (score: number, maxScore: number) => void;
}

export default function CodeDebugger({
  config,
  accentColor,
  onComplete,
}: CodeDebuggerProps) {
  const { bugs } = config;
  const [bugIdx, setBugIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const currentBug = bugs[bugIdx];
  const isLast = bugIdx >= bugs.length - 1;

  const handleAnswer = (optIdx: number) => {
    if (submitted) return;
    setSelected(optIdx);
    setSubmitted(true);
    const correct = optIdx === currentBug.correct;
    if (correct) setScore((s) => s + 1);

    setTimeout(() => {
      if (isLast) {
        const finalScore = correct ? score + 1 : score;
        onComplete(finalScore, bugs.length);
      } else {
        setBugIdx((i) => i + 1);
        setSelected(null);
        setSubmitted(false);
      }
    }, 2000);
  };

  const lines = currentBug.code.split("\n");

  return (
    <div className="flex flex-col gap-4">
      {/* Progress */}
      <div
        className="flex items-center justify-between text-xs"
        style={{ color: "var(--text-muted)" }}
      >
        <span>
          Bug {bugIdx + 1} of {bugs.length}
        </span>
        <span
          className="px-2 py-0.5 rounded-full text-xs font-medium"
          style={{
            backgroundColor: `${accentColor}15`,
            color: accentColor,
          }}
        >
          {currentBug.language}
        </span>
      </div>

      {/* Code block */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div
          className="px-3 py-2 flex items-center gap-2"
          style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
        >
          <span
            className="text-xs font-mono"
            style={{ color: "var(--text-muted)" }}
          >
            What&apos;s wrong with this code?
          </span>
        </div>
        <div
          className="overflow-x-auto"
          style={{ backgroundColor: "var(--code-bg)" }}
        >
          <table
            className="w-full text-xs leading-6"
            style={{ borderCollapse: "collapse" }}
          >
            <tbody>
              {lines.map((line, i) => (
                <tr key={i}>
                  <td
                    className="select-none px-3 text-right w-8"
                    style={{
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-mono), monospace",
                      fontSize: "0.7rem",
                      userSelect: "none",
                    }}
                  >
                    {i + 1}
                  </td>
                  <td
                    className="pl-2 pr-4 py-0"
                    style={{
                      fontFamily: "var(--font-mono), monospace",
                      color: "var(--text-secondary)",
                      whiteSpace: "pre",
                    }}
                  >
                    {line || " "}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {currentBug.options.map((opt, i) => {
          let bg = "rgba(255,255,255,0.03)";
          let border = "rgba(255,255,255,0.08)";
          let textColor = "var(--text-secondary)";

          if (submitted) {
            if (i === currentBug.correct) {
              bg = "rgba(245,197,66,0.12)";
              border = "var(--success)";
              textColor = "var(--success)";
            } else if (i === selected && i !== currentBug.correct) {
              bg = "rgba(239,68,68,0.12)";
              border = "var(--error)";
              textColor = "var(--error)";
            }
          }

          return (
            <button
              key={i}
              type="button"
              disabled={submitted}
              onClick={() => handleAnswer(i)}
              className="text-sm text-left rounded-xl px-4 py-3 transition-all"
              style={{
                backgroundColor: bg,
                border: `1px solid ${border}`,
                color: textColor,
                cursor: submitted ? "default" : "pointer",
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {submitted && currentBug.explanation && (
        <div
          className="rounded-xl p-3 text-xs leading-relaxed"
          style={{
            backgroundColor:
              selected === currentBug.correct
                ? "rgba(245,197,66,0.08)"
                : "rgba(239,68,68,0.08)",
            border: `1px solid ${selected === currentBug.correct ? "rgba(245,197,66,0.25)" : "rgba(239,68,68,0.25)"}`,
            color: "var(--text-secondary)",
          }}
        >
          <span
            className="font-semibold"
            style={{
              color:
                selected === currentBug.correct
                  ? "var(--success)"
                  : "var(--error)",
            }}
          >
            {selected === currentBug.correct
              ? "✓ Correct — "
              : "✗ Incorrect — "}
          </span>
          {currentBug.explanation}
        </div>
      )}
    </div>
  );
}
