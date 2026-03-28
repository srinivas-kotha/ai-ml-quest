"use client";

import { useState, useEffect, useCallback } from "react";
import type { StepsContent } from "@/types/content";
import MarkdownText from "./MarkdownText";

interface StepRevealProps extends StepsContent {
  accentColor?: string;
}

export default function StepReveal({
  steps,
  accentColor = "#3b82f6",
}: StepRevealProps) {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  const total = steps.length;

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= total || index === current) return;
      setVisible(false);
      setTimeout(() => {
        setCurrent(index);
        setVisible(true);
      }, 100);
    },
    [current, total],
  );

  const handlePrev = () => goTo(current - 1);
  const handleNext = () => {
    if (current < total - 1) goTo(current + 1);
  };

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(current - 1);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(current + 1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [current, goTo]);

  const step = steps[current];
  if (!step) return null;

  const accentRgb = hexToRgb(accentColor);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid var(--color-border)" }}
    >
      {/* Header: step counter + progress bar */}
      <div
        className="px-5 pt-4 pb-3"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            Step {current + 1} of {total}
          </span>
          {/* Progress fraction */}
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {Math.round(((current + 1) / total) * 100)}%
          </span>
        </div>
        {/* Thin progress bar */}
        <div
          className="h-1 rounded-full overflow-hidden"
          style={{ backgroundColor: "var(--color-border)" }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${((current + 1) / total) * 100}%`,
              backgroundColor: accentColor,
              transition: "width 250ms ease",
            }}
          />
        </div>
      </div>

      {/* Content area with fade */}
      <div
        className="px-5 py-5"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 150ms ease",
          minHeight: 120,
          backgroundColor: `rgba(${accentRgb}, 0.025)`,
        }}
      >
        {/* Step number badge + title */}
        <div className="flex items-start gap-3 mb-4">
          <span
            className="inline-flex items-center justify-center shrink-0 rounded-full text-xs font-bold"
            style={{
              width: 28,
              height: 28,
              backgroundColor: accentColor,
              color: "#fff",
              marginTop: 1,
            }}
          >
            {current + 1}
          </span>
          <h3
            className="text-base font-semibold"
            style={{ color: "var(--text-primary)", lineHeight: 1.4 }}
          >
            {step.title}
          </h3>
        </div>

        {/* Markdown content */}
        <div className="pl-10">
          <MarkdownText content={step.content} />

          {/* Optional visual reference */}
          {step.visual && (
            <div
              className="mt-3 text-xs rounded-lg px-3 py-2"
              style={{
                backgroundColor: "var(--color-bg-surface)",
                border: "1px solid var(--color-border)",
                color: "var(--text-muted)",
              }}
            >
              <span className="font-mono">{step.visual}</span>
            </div>
          )}
        </div>
      </div>

      {/* Dot indicators + nav buttons */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{
          borderTop: "1px solid var(--color-border)",
          backgroundColor: "var(--color-bg-surface)",
        }}
      >
        {/* Prev button */}
        <button
          onClick={handlePrev}
          disabled={current === 0}
          className="text-xs px-3 py-1.5 rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          style={{
            backgroundColor: "var(--color-bg-card)",
            color: "var(--text-secondary)",
            border: "1px solid var(--color-border)",
          }}
          aria-label="Previous step"
        >
          ← Prev
        </button>

        {/* Dot indicators */}
        <div
          className="flex items-center gap-1.5"
          role="tablist"
          aria-label="Step navigation"
        >
          {steps.map((s, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === current}
              aria-label={`Step ${i + 1}: ${s.title}`}
              onClick={() => goTo(i)}
              className="rounded-full cursor-pointer transition-[width,background-color]"
              style={{
                width: i === current ? 20 : 6,
                height: 6,
                backgroundColor:
                  i === current
                    ? accentColor
                    : i < current
                      ? `rgba(${accentRgb}, 0.4)`
                      : "var(--color-text-muted)",
                transition: "width 200ms ease, background-color 200ms ease",
              }}
            />
          ))}
        </div>

        {/* Next / Done button */}
        <button
          onClick={handleNext}
          disabled={current === total - 1}
          className="text-xs px-3 py-1.5 rounded cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          style={{
            backgroundColor:
              current === total - 1 ? "var(--color-bg-card)" : accentColor,
            color: current === total - 1 ? "var(--text-muted)" : "#fff",
            border: `1px solid ${current === total - 1 ? "var(--color-border)" : accentColor}`,
          }}
          aria-label={current === total - 1 ? "Last step" : "Next step"}
        >
          {current === total - 1 ? "Done ✓" : "Next →"}
        </button>
      </div>
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
