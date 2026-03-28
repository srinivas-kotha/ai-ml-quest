"use client";

import { useState } from "react";
import type { DiagnosisLabConfig } from "@/types/content";

interface DiagnosisLabProps {
  config: DiagnosisLabConfig;
  accentColor: string;
  onComplete: (score: number, maxScore: number) => void;
}

function MetricCard({
  name,
  value,
  accentColor,
}: {
  name: string;
  value: unknown;
  accentColor: string;
}) {
  const str = String(value);
  const isAlarm =
    str.includes("↑") ||
    str.includes("↓") ||
    str.includes("HIGH") ||
    str.includes("LOW") ||
    str.includes("FAIL") ||
    str.includes("ERR");
  const isOk = str.includes("OK") || str.includes("✓") || str.includes("PASS");

  return (
    <div
      className="rounded-xl p-3 flex flex-col gap-1"
      style={{
        backgroundColor: isAlarm
          ? "rgba(239,68,68,0.08)"
          : isOk
            ? "rgba(245,197,66,0.08)"
            : `${accentColor}08`,
        border: `1px solid ${
          isAlarm
            ? "rgba(239,68,68,0.25)"
            : isOk
              ? "rgba(245,197,66,0.25)"
              : `${accentColor}25`
        }`,
      }}
    >
      <div
        className="text-base font-mono font-bold tabular-nums"
        style={{
          color: isAlarm
            ? "var(--error)"
            : isOk
              ? "var(--success)"
              : accentColor,
        }}
      >
        {str}
      </div>
      <div className="text-xs" style={{ color: "var(--text-muted)" }}>
        {name}
      </div>
    </div>
  );
}

export default function DiagnosisLab({
  config,
  accentColor,
  onComplete,
}: DiagnosisLabProps) {
  const { cases } = config;
  const [caseIdx, setCaseIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const current = cases[caseIdx];
  const isLast = caseIdx >= cases.length - 1;
  const metrics = current.metrics as Record<string, unknown>;

  const handleAnswer = (optIdx: number) => {
    if (submitted) return;
    setSelected(optIdx);
    setSubmitted(true);
    const correct = optIdx === current.correct;
    if (correct) setScore((s) => s + 1);

    setTimeout(() => {
      if (isLast) {
        onComplete(correct ? score + 1 : score, cases.length);
      } else {
        setCaseIdx((i) => i + 1);
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
          Case {caseIdx + 1} of {cases.length}
        </span>
        <span style={{ color: accentColor }}>Diagnosis Lab</span>
      </div>

      {/* Scenario */}
      <div
        className="rounded-xl p-3 text-sm leading-relaxed"
        style={{
          backgroundColor: `${accentColor}10`,
          border: `1px solid ${accentColor}25`,
          color: "var(--text-secondary)",
        }}
      >
        {current.scenario}
      </div>

      {/* Metrics dashboard */}
      <div>
        <p
          className="text-xs font-semibold mb-2"
          style={{ color: "var(--text-muted)" }}
        >
          System Metrics
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.entries(metrics).map(([key, val]) => (
            <MetricCard
              key={key}
              name={key}
              value={val}
              accentColor={accentColor}
            />
          ))}
        </div>
      </div>

      {/* Diagnosis question */}
      <p
        className="text-sm font-semibold"
        style={{ color: "var(--text-primary)" }}
      >
        What&apos;s the root cause?
      </p>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {current.options.map((opt, i) => {
          let bg = "rgba(255,255,255,0.03)";
          let border = "rgba(255,255,255,0.08)";
          let textColor = "var(--text-secondary)";

          if (submitted) {
            if (i === current.correct) {
              bg = "rgba(245,197,66,0.12)";
              border = "var(--success)";
              textColor = "var(--success)";
            } else if (i === selected && i !== current.correct) {
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
              ? "✓ Correct diagnosis — "
              : "✗ Incorrect — "}
          </span>
          {current.explanation}
        </div>
      )}
    </div>
  );
}
