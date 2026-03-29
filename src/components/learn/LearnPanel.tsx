"use client";

import type React from "react";
import type {
  LearnSection,
  SectionType,
  CodeContent,
  DiagramContent,
  ComparisonContent,
  StepsContent,
  PlaygroundContent,
  AnalogyContent,
  ExplorationContent,
  PredictionContent,
  D2DiagramContent,
} from "@/types/content";
import dynamic from "next/dynamic";
import MarkdownText from "./MarkdownText";
import CalloutBox from "./CalloutBox";
import PlaceholderSection from "./PlaceholderSection";

// Lightweight skeleton shown while heavy components load
function SectionSkeleton() {
  return (
    <div
      className="rounded-xl animate-pulse"
      style={{
        backgroundColor: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
        height: "160px",
      }}
    />
  );
}

// Lazy-load heavy interactive components
const AnnotatedCode = dynamic(() => import("./AnnotatedCode"), {
  loading: () => <SectionSkeleton />,
  ssr: false,
});

const PipelineDiagram = dynamic(() => import("./PipelineDiagram"), {
  loading: () => <SectionSkeleton />,
  ssr: false,
});

const SliderPlayground = dynamic(() => import("./SliderPlayground"), {
  loading: () => <SectionSkeleton />,
  ssr: false,
});

// BeforeAfter and StepReveal are moderately heavy but still benefit from lazy-loading
const BeforeAfter = dynamic(() => import("./BeforeAfter"), {
  loading: () => <SectionSkeleton />,
  ssr: false,
});

const StepReveal = dynamic(() => import("./StepReveal"), {
  loading: () => <SectionSkeleton />,
  ssr: false,
});

const AnalogyPanel = dynamic(() => import("./AnalogyPanel"), {
  loading: () => <SectionSkeleton />,
  ssr: false,
});

const ExplorationWrapper = dynamic(() => import("./ExplorationWrapper"), {
  loading: () => <SectionSkeleton />,
  ssr: false,
});

const PredictionPrompt = dynamic(() => import("./PredictionPrompt"), {
  loading: () => <SectionSkeleton />,
  ssr: false,
});

const DiagramViewer = dynamic(() => import("./DiagramViewer"), {
  loading: () => <SectionSkeleton />,
  ssr: false,
});

interface LearnPanelProps {
  learnSections: LearnSection[];
  accentColor?: string;
  className?: string;
}

// Render a single section based on its type
function SectionRenderer({
  section,
  accentColor,
}: {
  section: LearnSection;
  accentColor?: string;
}) {
  const { sectionType, content, title } = section;
  const type = sectionType as SectionType;

  switch (type) {
    case "text": {
      const textContent = content as { markdown: string };
      return (
        <div>
          {title && (
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--color-text-primary)" }}
            >
              {title}
            </h2>
          )}
          <MarkdownText content={textContent.markdown ?? ""} />
        </div>
      );
    }

    case "callout": {
      const calloutContent = content as {
        variant: "enterprise" | "tip" | "warning" | "insight";
        title?: string;
        content: string;
      };
      return (
        <CalloutBox
          variant={calloutContent.variant ?? "tip"}
          title={calloutContent.title ?? title ?? undefined}
          content={calloutContent.content ?? ""}
        />
      );
    }

    case "code": {
      const codeContent = content as CodeContent;
      return (
        <AnnotatedCode
          language={codeContent.language ?? "python"}
          title={codeContent.title ?? title ?? undefined}
          code={codeContent.code ?? ""}
          annotations={codeContent.annotations ?? []}
          accentColor={accentColor}
        />
      );
    }

    case "diagram": {
      const diagramContent = content as DiagramContent;
      return (
        <PipelineDiagram
          nodes={diagramContent.nodes ?? []}
          edges={diagramContent.edges ?? []}
          animate={diagramContent.animate ?? true}
          stepThrough={diagramContent.stepThrough ?? false}
          accentColor={accentColor}
        />
      );
    }

    case "comparison": {
      const compContent = content as ComparisonContent;
      return (
        <BeforeAfter
          before={compContent.before}
          after={compContent.after}
          accentColor={accentColor}
        />
      );
    }

    case "steps": {
      const stepsContent = content as StepsContent;
      return (
        <StepReveal
          steps={stepsContent.steps ?? []}
          accentColor={accentColor}
        />
      );
    }

    case "playground": {
      const playContent = content as PlaygroundContent;
      return (
        <SliderPlayground
          title={playContent.title ?? title ?? "Interactive Playground"}
          sliders={playContent.sliders ?? []}
          renderType={playContent.renderType ?? "chunkPreview"}
          sampleText={playContent.sampleText}
          customRenderer={playContent.customRenderer}
          accentColor={accentColor}
        />
      );
    }

    case "analogy": {
      const analogyContent = content as AnalogyContent;
      return (
        <AnalogyPanel
          analogies={analogyContent.analogies ?? []}
          accentColor={accentColor}
        />
      );
    }

    case "exploration": {
      const explorationContent = content as ExplorationContent;
      return (
        <ExplorationWrapper
          title={explorationContent.title ?? title ?? "Interactive Exploration"}
          description={explorationContent.description}
          nodes={explorationContent.nodes ?? []}
          edges={explorationContent.edges ?? []}
          accentColor={accentColor}
          staticFallbackUrl={explorationContent.staticFallbackUrl}
        />
      );
    }

    case "prediction": {
      const predictionContent = content as PredictionContent;
      return (
        <PredictionPrompt
          question={predictionContent.question ?? ""}
          options={predictionContent.options}
          reveal={predictionContent.reveal ?? ""}
          accentColor={accentColor}
        />
      );
    }

    case "d2_diagram": {
      const d2Content = content as D2DiagramContent;
      return (
        <DiagramViewer
          svgPath={d2Content.svgPath ?? ""}
          title={title ?? "Diagram"}
          altText={d2Content.altText ?? "Architecture diagram"}
          caption={d2Content.caption}
          accentColor={accentColor}
        />
      );
    }

    default:
      return (
        <PlaceholderSection
          sectionType={type}
          title={title}
          content={content}
        />
      );
  }
}

export default function LearnPanel({
  learnSections,
  accentColor,
  className = "",
}: LearnPanelProps) {
  const panelStyle: React.CSSProperties = {
    backgroundColor: "var(--color-bg-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "16px",
    ...(accentColor ? { borderTop: `2px solid ${accentColor}` } : {}),
  };

  if (learnSections.length === 0) {
    return (
      <div className={`p-6 ${className}`} style={panelStyle}>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          No content sections for this level yet.
        </p>
      </div>
    );
  }

  return (
    <div className={`p-6 overflow-y-auto ${className}`} style={panelStyle}>
      {/* Section list with dividers */}
      <div className="space-y-6">
        {learnSections
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((section, index) => (
            <div key={section.id}>
              {index > 0 && (
                <div
                  className="mb-6"
                  style={{
                    borderTop: "1px solid var(--color-border-subtle)",
                  }}
                />
              )}
              <SectionRenderer section={section} accentColor={accentColor} />
            </div>
          ))}
      </div>
    </div>
  );
}
