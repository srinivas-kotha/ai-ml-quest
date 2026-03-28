"use client";

import { useState, useMemo } from "react";
import type { PlaygroundContent, PlaygroundSlider } from "@/types/content";

interface SliderPlaygroundProps extends PlaygroundContent {
  accentColor?: string;
}

// Distinct palette for chunk coloring (muted, dark-theme friendly)
const CHUNK_COLORS = [
  "rgba(59,130,246,0.25)", // blue
  "rgba(139,92,246,0.25)", // purple
  "rgba(16,185,129,0.25)", // green
  "rgba(245,158,11,0.25)", // amber
  "rgba(239,68,68,0.25)", // red
  "rgba(236,72,153,0.25)", // pink
  "rgba(20,184,166,0.25)", // teal
  "rgba(249,115,22,0.25)", // orange
];

const CHUNK_BORDER_COLORS = [
  "rgba(59,130,246,0.6)",
  "rgba(139,92,246,0.6)",
  "rgba(16,185,129,0.6)",
  "rgba(245,158,11,0.6)",
  "rgba(239,68,68,0.6)",
  "rgba(236,72,153,0.6)",
  "rgba(20,184,166,0.6)",
  "rgba(249,115,22,0.6)",
];

// ────────────────────────────────────────────────────────────────────────────
// Built-in renderer: chunkPreview
// ────────────────────────────────────────────────────────────────────────────
interface ChunkPreviewProps {
  values: Record<string, number>;
  sampleText: string;
}

function ChunkPreview({ values, sampleText }: ChunkPreviewProps) {
  const chunkSize = Math.max(1, values.chunkSize ?? 80);
  const overlap = Math.min(Math.max(0, values.overlap ?? 20), chunkSize - 1);

  const chunks = useMemo(() => {
    const words = sampleText.split(/\s+/);
    // Simulate token-based chunking using words as token proxies
    const avgTokenPerWord = 1.3;
    const chunkWords = Math.max(1, Math.round(chunkSize / avgTokenPerWord));
    const overlapWords = Math.max(0, Math.round(overlap / avgTokenPerWord));
    const stride = Math.max(1, chunkWords - overlapWords);

    const result: { text: string; start: number; end: number }[] = [];
    let start = 0;
    while (start < words.length) {
      const end = Math.min(start + chunkWords, words.length);
      result.push({
        text: words.slice(start, end).join(" "),
        start,
        end,
      });
      if (end >= words.length) break;
      start += stride;
    }
    return result;
  }, [sampleText, chunkSize, overlap]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-xs font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          Preview: {chunks.length} chunk{chunks.length !== 1 ? "s" : ""}
        </span>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          ~{chunkSize} tokens each, {overlap} overlap
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {chunks.map((chunk, i) => {
          const colorIdx = i % CHUNK_COLORS.length;
          return (
            <span
              key={i}
              className="text-xs px-2 py-1 rounded leading-relaxed"
              style={{
                backgroundColor: CHUNK_COLORS[colorIdx],
                border: `1px solid ${CHUNK_BORDER_COLORS[colorIdx]}`,
                color: "var(--text-secondary)",
                fontFamily: "var(--font-mono), monospace",
              }}
              title={`Chunk ${i + 1} (${chunk.end - chunk.start} words)`}
            >
              {chunk.text.length > 60
                ? chunk.text.slice(0, 57) + "…"
                : chunk.text}
            </span>
          );
        })}
      </div>

      {overlap > 0 && (
        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
          Adjacent chunks share ~{overlap} overlapping tokens to preserve
          context across boundaries.
        </p>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Built-in renderer: costCalculator
// ────────────────────────────────────────────────────────────────────────────
interface CostCalculatorProps {
  values: Record<string, number>;
}

// Embedding model cost ($/1K tokens): mapped from slider value 1-5
const EMBED_COSTS = [0.00002, 0.0001, 0.0002, 0.001, 0.002];
const EMBED_NAMES = [
  "text-embedding-3-small",
  "text-embedding-3-large",
  "Cohere Embed v3",
  "Custom Hosted",
  "Voyage AI",
];

// LLM model cost ($/1K tokens): mapped from slider value 1-5
const LLM_COSTS = [0.001, 0.002, 0.01, 0.06, 0.15];
const LLM_NAMES = [
  "GPT-3.5 Turbo",
  "GPT-4o Mini",
  "Llama-3 70B",
  "Claude 3 Sonnet",
  "GPT-4o",
];

function CostCalculator({ values }: CostCalculatorProps) {
  const queriesPerDay = Math.max(1, values.queriesPerDay ?? 1000);
  const embedModel =
    Math.min(5, Math.max(1, Math.round(values.embeddingModel ?? 1))) - 1;
  const llmModel =
    Math.min(5, Math.max(1, Math.round(values.llmModel ?? 1))) - 1;
  const tokensPerQuery = Math.max(100, values.tokensPerQuery ?? 500);

  const embedCostPerQuery =
    (tokensPerQuery / 1000) * (EMBED_COSTS[embedModel] ?? 0.00002);
  const llmCostPerQuery =
    ((tokensPerQuery * 2) / 1000) * (LLM_COSTS[llmModel] ?? 0.001); // 2x for input+output estimate
  const totalPerQuery = embedCostPerQuery + llmCostPerQuery;
  const totalPerDay = totalPerQuery * queriesPerDay;
  const totalPerMonth = totalPerDay * 30;

  const fmt = (n: number) =>
    n < 0.01
      ? `$${(n * 1000).toFixed(3)}m` // millidollars
      : n < 1
        ? `$${n.toFixed(4)}`
        : `$${n.toFixed(2)}`;

  const rows = [
    {
      label: "Embedding cost / query",
      value: fmt(embedCostPerQuery),
      detail: EMBED_NAMES[embedModel],
    },
    {
      label: "LLM cost / query",
      value: fmt(llmCostPerQuery),
      detail: LLM_NAMES[llmModel],
    },
    { label: "Total / query", value: fmt(totalPerQuery), detail: "" },
    {
      label: "Daily total",
      value: fmt(totalPerDay),
      detail: `${queriesPerDay.toLocaleString()} queries`,
    },
    {
      label: "Monthly estimate",
      value: fmt(totalPerMonth),
      detail: "30-day projection",
      highlight: true,
    },
  ];

  return (
    <div>
      <table className="w-full text-sm border-collapse">
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.label}
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                backgroundColor: row.highlight
                  ? "rgba(245,197,66,0.06)"
                  : "transparent",
              }}
            >
              <td
                className="py-2 pr-4 text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                {row.label}
              </td>
              <td
                className="py-2 text-right font-mono font-medium text-sm"
                style={{
                  color: row.highlight ? "#f5c542" : "var(--text-primary)",
                }}
              >
                {row.value}
              </td>
              {row.detail && (
                <td
                  className="py-2 pl-4 text-xs text-right"
                  style={{ color: "var(--text-muted)" }}
                >
                  {row.detail}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Built-in renderer: dimensionPreview
// ────────────────────────────────────────────────────────────────────────────
interface DimensionPreviewProps {
  values: Record<string, number>;
  accentColor: string;
}

function DimensionPreview({ values, accentColor }: DimensionPreviewProps) {
  const dims = Math.max(64, Math.min(3072, values.dimensions ?? 768));

  // Relative quality score (logarithmic — more dims = diminishing returns past 768)
  const qualityScore = Math.min(
    100,
    Math.round((Math.log(dims) / Math.log(3072)) * 115),
  );
  // Storage: linear (768 dims = baseline 1.0)
  const storageScore = Math.round((dims / 768) * 100);
  // Latency: slight increase with dims
  const latencyScore = Math.round(50 + (dims / 3072) * 50);

  const bars = [
    { label: "Retrieval Quality", score: qualityScore, color: accentColor },
    { label: "Storage Cost", score: storageScore, color: "#ef4444" },
    { label: "Search Latency", score: latencyScore, color: "#f59e0b" },
  ];

  return (
    <div>
      <div
        className="mb-4 text-xs flex items-center gap-3"
        style={{ color: "var(--text-muted)" }}
      >
        <span
          className="font-mono font-medium text-sm"
          style={{ color: "var(--text-primary)" }}
        >
          {dims}d
        </span>
        <span>embedding dimensions</span>
      </div>
      <div className="space-y-3">
        {bars.map((bar) => (
          <div key={bar.label}>
            <div className="flex items-center justify-between mb-1">
              <span
                className="text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                {bar.label}
              </span>
              <span className="text-xs font-mono" style={{ color: bar.color }}>
                {bar.score}%
              </span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${bar.score}%`,
                  backgroundColor: bar.color,
                  transition: "width 100ms ease",
                  opacity: 0.8,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
        Sweet spot: 768-1536 dims — best quality/cost ratio. 3072+ dims cost 4x
        more storage with minimal quality gain.
      </p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Main component
// ────────────────────────────────────────────────────────────────────────────
export default function SliderPlayground({
  title,
  sliders,
  renderType,
  sampleText = "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump! The five boxing wizards jump quickly.",
  accentColor = "#3b82f6",
}: SliderPlaygroundProps) {
  // Initialize state from defaults
  const defaults = useMemo(() => {
    const d: Record<string, number> = {};
    for (const s of sliders) d[s.name] = s.default;
    return d;
  }, [sliders]);

  const [values, setValues] = useState<Record<string, number>>(defaults);

  const handleChange = (name: string, value: number) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => setValues(defaults);

  const accentRgb = hexToRgb(accentColor);
  const isDirty = sliders.some((s) => values[s.name] !== s.default);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{
          backgroundColor: "rgba(255,255,255,0.03)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <span
          className="text-sm font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </span>
        <button
          onClick={handleReset}
          disabled={!isDirty}
          className="text-xs px-2.5 py-1 rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          style={{
            backgroundColor: "rgba(255,255,255,0.05)",
            color: "var(--text-muted)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          aria-label="Reset all sliders to defaults"
        >
          Reset
        </button>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Sliders panel */}
        <div
          className="p-4 space-y-5 md:w-56 shrink-0"
          style={{
            borderRight: "1px solid rgba(255,255,255,0.06)",
            backgroundColor: "rgba(255,255,255,0.01)",
          }}
        >
          {sliders.map((slider) => {
            const val = values[slider.name] ?? slider.default;
            const pct = ((val - slider.min) / (slider.max - slider.min)) * 100;

            return (
              <div key={slider.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor={`slider-${slider.name}`}
                    className="text-xs font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {slider.label}
                  </label>
                  <span
                    className="text-xs font-mono font-medium tabular-nums"
                    style={{ color: accentColor }}
                  >
                    {val}
                    {slider.unit ? ` ${slider.unit}` : ""}
                  </span>
                </div>
                <div className="relative h-4 flex items-center">
                  {/* Track background */}
                  <div
                    className="absolute left-0 right-0 h-1.5 rounded-full"
                    style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                  />
                  {/* Track fill */}
                  <div
                    className="absolute left-0 h-1.5 rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: accentColor,
                      opacity: 0.7,
                    }}
                  />
                  {/* Input range (invisible but interactive) */}
                  <input
                    id={`slider-${slider.name}`}
                    type="range"
                    min={slider.min}
                    max={slider.max}
                    step={slider.step ?? 1}
                    value={val}
                    onChange={(e) =>
                      handleChange(slider.name, Number(e.target.value))
                    }
                    className="absolute left-0 right-0 w-full cursor-pointer"
                    style={{
                      appearance: "none",
                      WebkitAppearance: "none",
                      background: "transparent",
                      height: 16,
                      margin: 0,
                      padding: 0,
                    }}
                    aria-label={`${slider.label}: ${val}${slider.unit ? " " + slider.unit : ""}`}
                  />
                </div>
                <div
                  className="flex justify-between text-[10px] mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  <span>
                    {slider.min}
                    {slider.unit ? slider.unit[0] : ""}
                  </span>
                  <span>
                    {slider.max}
                    {slider.unit ? slider.unit[0] : ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Preview panel */}
        <div
          className="flex-1 p-4"
          style={{ backgroundColor: `rgba(${accentRgb}, 0.02)` }}
        >
          <div
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "var(--text-muted)" }}
          >
            Live Preview
          </div>

          {renderType === "chunkPreview" && (
            <ChunkPreview values={values} sampleText={sampleText} />
          )}
          {renderType === "costCalculator" && (
            <CostCalculator values={values} />
          )}
          {renderType === "dimensionPreview" && (
            <DimensionPreview values={values} accentColor={accentColor} />
          )}
          {(renderType === "custom" ||
            !["chunkPreview", "costCalculator", "dimensionPreview"].includes(
              renderType,
            )) && (
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>
              Custom renderer: <code className="font-mono">{renderType}</code>
              <pre
                className="mt-2 rounded-lg p-3 text-xs overflow-x-auto"
                style={{ backgroundColor: "var(--code-bg)", color: "#94a3b8" }}
              >
                {JSON.stringify(values, null, 2)}
              </pre>
            </div>
          )}
        </div>
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
