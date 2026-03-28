"use client";

import { useState } from "react";
import type { CostOptimizerConfig } from "@/types/content";

interface CostOptimizerProps {
  config: CostOptimizerConfig;
  accentColor: string;
  onComplete: (score: number, maxScore: number) => void;
}

export default function CostOptimizer({
  config,
  accentColor,
  onComplete,
}: CostOptimizerProps) {
  const { scenario, dimensions } = config;

  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(dimensions.map((d) => [d.name, (d.min + d.max) / 2])),
  );
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});

  const TOLERANCE = 0.2; // 20% tolerance

  const isInRange = (dim: (typeof dimensions)[0], val: number) => {
    const range = dim.max - dim.min;
    return Math.abs(val - dim.optimal) <= range * TOLERANCE;
  };

  const handleChange = (name: string, val: number) => {
    if (submitted) return;
    setValues((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = () => {
    if (submitted) return;
    setSubmitted(true);
    const result: Record<string, boolean> = {};
    dimensions.forEach((d) => {
      result[d.name] = isInRange(d, values[d.name]);
    });
    setResults(result);
    const correct = Object.values(result).filter(Boolean).length;
    setTimeout(() => onComplete(correct, dimensions.length), 600);
  };

  const allOptimal = dimensions.every((d) => isInRange(d, values[d.name]));

  return (
    <div className="flex flex-col gap-5">
      {/* Scenario */}
      <div
        className="rounded-xl p-3 text-sm leading-relaxed"
        style={{
          backgroundColor: `${accentColor}10`,
          border: `1px solid ${accentColor}25`,
          color: "var(--text-secondary)",
        }}
      >
        {scenario}
      </div>

      {/* Live status */}
      {!submitted && (
        <div
          className="flex items-center justify-between rounded-xl px-4 py-2.5 text-sm"
          style={{
            backgroundColor: allOptimal
              ? "rgba(245,197,66,0.08)"
              : "var(--color-bg-surface)",
            border: `1px solid ${allOptimal ? "rgba(245,197,66,0.3)" : "var(--color-border)"}`,
          }}
        >
          <span style={{ color: "var(--text-muted)" }}>Balance status</span>
          <span
            className="font-medium"
            style={{
              color: allOptimal ? "var(--success)" : "var(--text-secondary)",
            }}
          >
            {allOptimal
              ? "✓ All dimensions balanced"
              : "Adjust to find optimal balance"}
          </span>
        </div>
      )}

      {/* Dimension sliders */}
      <div className="flex flex-col gap-5">
        {dimensions.map((dim) => {
          const val = values[dim.name];
          const pct = ((val - dim.min) / (dim.max - dim.min)) * 100;
          const optPct = ((dim.optimal - dim.min) / (dim.max - dim.min)) * 100;
          const inRange = isInRange(dim, val);
          const sliderColor = submitted
            ? inRange
              ? "var(--success)"
              : "var(--error)"
            : allOptimal
              ? "var(--success)"
              : accentColor;

          return (
            <div key={dim.name} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {dim.name}
                </label>
                <span
                  className="text-sm font-mono font-medium tabular-nums"
                  style={{ color: sliderColor, transition: "color 0.3s" }}
                >
                  {val.toFixed(dim.unit === "%" ? 0 : 2)}
                  {dim.unit}
                </span>
              </div>

              {/* Visual gauge */}
              <div
                className="relative h-2 rounded-full"
                style={{ backgroundColor: "var(--color-border)" }}
              >
                {/* Optimal target line */}
                {submitted && (
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full z-10"
                    style={{
                      left: `${optPct}%`,
                      backgroundColor: "var(--success)",
                      opacity: 0.7,
                    }}
                  />
                )}
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: sliderColor,
                    transition: "width 0.15s, background-color 0.3s",
                  }}
                />
              </div>

              <input
                type="range"
                min={dim.min}
                max={dim.max}
                step={(dim.max - dim.min) / 100}
                value={val}
                disabled={submitted}
                onChange={(e) =>
                  handleChange(dim.name, parseFloat(e.target.value))
                }
                className="w-full h-1 appearance-none cursor-pointer rounded-full"
                style={{
                  accentColor: sliderColor,
                  opacity: submitted ? 0.5 : 1,
                }}
              />

              <div
                className="flex justify-between text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                <span>
                  {dim.min}
                  {dim.unit}
                </span>
                {submitted && (
                  <span
                    style={{
                      color: inRange ? "var(--success)" : "var(--error)",
                    }}
                  >
                    {inRange
                      ? `✓ Optimal: ${dim.optimal}${dim.unit}`
                      : `✗ Optimal: ${dim.optimal}${dim.unit}`}
                  </span>
                )}
                <span>
                  {dim.max}
                  {dim.unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit */}
      {!submitted && (
        <button
          type="button"
          onClick={handleSubmit}
          className="rounded-xl py-2.5 text-sm font-semibold transition-[background-color,color]"
          style={{
            backgroundColor: allOptimal ? "var(--success)" : accentColor,
            color: "#0c0c14",
            cursor: "pointer",
          }}
        >
          Submit Optimization
        </button>
      )}

      {/* Results summary */}
      {submitted && (
        <div
          className="rounded-xl p-4 flex flex-col gap-2"
          style={{
            backgroundColor: "var(--color-bg-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Optimization Results
          </p>
          {dimensions.map((dim) => {
            const inRange = results[dim.name];
            return (
              <div
                key={dim.name}
                className="flex items-center justify-between text-xs"
              >
                <span style={{ color: "var(--text-secondary)" }}>
                  {dim.name}
                </span>
                <span
                  style={{ color: inRange ? "var(--success)" : "var(--error)" }}
                >
                  {inRange
                    ? `✓ ${values[dim.name].toFixed(1)}${dim.unit} (optimal)`
                    : `✗ Your: ${values[dim.name].toFixed(1)}${dim.unit} → Target: ${dim.optimal}${dim.unit}`}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
