"use client";

import { useState, useCallback } from "react";
import type { ParameterTunerConfig } from "@/types/content";

interface ParameterTunerProps {
  config: ParameterTunerConfig;
  accentColor: string;
  onComplete: (score: number, maxScore: number) => void;
}

export default function ParameterTuner({
  config,
  accentColor,
  onComplete,
}: ParameterTunerProps) {
  const { scenario, parameters } = config;

  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(parameters.map((p) => [p.name, (p.min + p.max) / 2])),
  );
  const [submitted, setSubmitted] = useState(false);
  const [scores, setScores] = useState<Record<string, boolean>>({});

  const TOLERANCE = 0.15; // 15% tolerance for "correct"

  const getGaugePercent = useCallback(
    (param: (typeof parameters)[0], val: number) => {
      return ((val - param.min) / (param.max - param.min)) * 100;
    },
    [parameters],
  );

  const isInRange = useCallback(
    (param: (typeof parameters)[0], val: number) => {
      const range = param.max - param.min;
      return Math.abs(val - param.optimal) <= range * TOLERANCE;
    },
    [],
  );

  const handleChange = (name: string, val: number) => {
    setValues((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = () => {
    if (submitted) return;
    setSubmitted(true);
    const result: Record<string, boolean> = {};
    parameters.forEach((p) => {
      result[p.name] = isInRange(p, values[p.name]);
    });
    setScores(result);
    const correct = Object.values(result).filter(Boolean).length;
    setTimeout(() => onComplete(correct, parameters.length), 600);
  };

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

      {/* Sliders */}
      <div className="flex flex-col gap-5">
        {parameters.map((param) => {
          const val = values[param.name];
          const pct = getGaugePercent(param, val);
          const optimalPct = getGaugePercent(param, param.optimal);
          const inRange = isInRange(param, val);
          const gaugeColor = submitted
            ? inRange
              ? "var(--success)"
              : "var(--error)"
            : accentColor;

          return (
            <div key={param.name} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {param.name}
                </label>
                <span
                  className="text-sm font-mono font-medium tabular-nums"
                  style={{ color: gaugeColor, transition: "color 0.3s" }}
                >
                  {val.toFixed(param.unit === "%" ? 0 : 2)}
                  {param.unit}
                </span>
              </div>

              {/* Gauge bar */}
              <div
                className="relative h-2 rounded-full overflow-visible"
                style={{ backgroundColor: "var(--color-border)" }}
              >
                {/* Optimal marker */}
                {submitted && (
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full z-10"
                    style={{
                      left: `${optimalPct}%`,
                      backgroundColor: "var(--success)",
                      opacity: 0.7,
                    }}
                    title={`Optimal: ${param.optimal}${param.unit}`}
                  />
                )}
                {/* Fill */}
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: gaugeColor,
                    transition: "width 0.15s, background-color 0.3s",
                  }}
                />
              </div>

              {/* Slider input */}
              <input
                type="range"
                min={param.min}
                max={param.max}
                step={(param.max - param.min) / 100}
                value={val}
                disabled={submitted}
                onChange={(e) =>
                  handleChange(param.name, parseFloat(e.target.value))
                }
                className="w-full h-1 rounded-full appearance-none cursor-pointer"
                style={{
                  accentColor: gaugeColor,
                  opacity: submitted ? 0.5 : 1,
                }}
              />

              <div
                className="flex justify-between text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                <span>
                  {param.min}
                  {param.unit}
                </span>
                {submitted && (
                  <span style={{ color: "var(--success)" }}>
                    Optimal: {param.optimal}
                    {param.unit}
                  </span>
                )}
                <span>
                  {param.max}
                  {param.unit}
                </span>
              </div>

              {submitted && (
                <div
                  className="text-xs px-2 py-1 rounded-lg"
                  style={{
                    backgroundColor: inRange
                      ? "rgba(245,197,66,0.08)"
                      : "rgba(239,68,68,0.08)",
                    color: inRange ? "var(--success)" : "var(--error)",
                    border: `1px solid ${inRange ? "rgba(245,197,66,0.25)" : "rgba(239,68,68,0.25)"}`,
                  }}
                >
                  {inRange
                    ? "✓ Within optimal range"
                    : `✗ Optimal is ${param.optimal}${param.unit}`}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && (
        <button
          type="button"
          onClick={handleSubmit}
          className="rounded-xl py-2.5 text-sm font-semibold transition-[background-color,color]"
          style={{
            backgroundColor: accentColor,
            color: "#0c0c14",
            cursor: "pointer",
          }}
        >
          Check Configuration
        </button>
      )}
    </div>
  );
}
