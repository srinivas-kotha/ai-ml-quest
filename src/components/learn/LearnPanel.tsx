import type {
  LearnSection,
  SectionType,
  CodeContent,
  DiagramContent,
  ComparisonContent,
  StepsContent,
  PlaygroundContent,
} from "@/types/content";
import MarkdownText from "./MarkdownText";
import CalloutBox from "./CalloutBox";
import PlaceholderSection from "./PlaceholderSection";
import AnnotatedCode from "./AnnotatedCode";
import PipelineDiagram from "./PipelineDiagram";
import BeforeAfter from "./BeforeAfter";
import StepReveal from "./StepReveal";
import SliderPlayground from "./SliderPlayground";

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
              style={{ color: "var(--text-primary)" }}
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
  if (learnSections.length === 0) {
    return (
      <div
        className={`glass-panel p-6 ${className}`}
        style={accentColor ? { borderTop: `2px solid ${accentColor}` } : {}}
      >
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          No content sections for this level yet.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`glass-panel p-6 overflow-y-auto ${className}`}
      style={accentColor ? { borderTop: `2px solid ${accentColor}` } : {}}
    >
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
                    borderTop: "1px solid rgba(255,255,255,0.06)",
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
