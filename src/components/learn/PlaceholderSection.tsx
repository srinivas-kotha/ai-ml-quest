import type { SectionType, LearnSectionContent } from "@/types/content";

interface PlaceholderSectionProps {
  sectionType: SectionType;
  title?: string | null;
  content: LearnSectionContent;
  className?: string;
}

const SECTION_LABELS: Record<SectionType, string> = {
  text: "Text",
  code: "Annotated Code",
  diagram: "Pipeline Diagram",
  comparison: "Before / After Comparison",
  steps: "Step-by-Step Reveal",
  playground: "Interactive Playground",
  callout: "Callout",
  analogy: "Analogy Panel",
  exploration: "Interactive Exploration",
  prediction: "Prediction Prompt",
  d2_diagram: "Architecture Diagram",
};

const SECTION_DESCRIPTIONS: Partial<Record<SectionType, string>> = {
  code: "Syntax-highlighted code block with clickable line annotations",
  diagram: "Animated SVG pipeline diagram with interactive node tooltips",
  comparison: "Tab-based before/after panel with fade transition",
  steps: "Progressive step disclosure with prev/next navigation",
  playground: "Live sliders that update a real-time preview",
};

export default function PlaceholderSection({
  sectionType,
  title,
  content,
  className = "",
}: PlaceholderSectionProps) {
  const label = SECTION_LABELS[sectionType] ?? sectionType;
  const description = SECTION_DESCRIPTIONS[sectionType];

  return (
    <div
      className={`my-4 rounded-xl p-5 ${className}`}
      style={{
        border: "1px dashed rgba(255,255,255,0.15)",
        backgroundColor: "rgba(255,255,255,0.02)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded"
          style={{
            backgroundColor: "rgba(255,255,255,0.06)",
            color: "var(--text-muted)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {label}
        </span>
        {title && (
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            {title}
          </span>
        )}
      </div>

      {/* Coming-soon label */}
      <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>
        {description
          ? `${description} — interactive component coming in Phase 1C.`
          : "Interactive component — coming in Phase 1C."}
      </p>

      {/* JSON content preview */}
      <details>
        <summary
          className="text-xs cursor-pointer select-none"
          style={{ color: "var(--text-muted)" }}
        >
          View raw content
        </summary>
        <pre
          className="mt-2 rounded-lg overflow-x-auto text-xs leading-relaxed p-3"
          style={{
            backgroundColor: "var(--code-bg)",
            color: "#94a3b8",
            fontFamily: "var(--font-mono), monospace",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {JSON.stringify(content, null, 2)}
        </pre>
      </details>
    </div>
  );
}
