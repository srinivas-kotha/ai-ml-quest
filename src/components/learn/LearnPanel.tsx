import type { LearnSection, SectionType } from "@/types/content";
import MarkdownText from "./MarkdownText";
import CalloutBox from "./CalloutBox";
import PlaceholderSection from "./PlaceholderSection";

interface LearnPanelProps {
  learnSections: LearnSection[];
  accentColor?: string;
  className?: string;
}

// Render a single section based on its type
function SectionRenderer({ section }: { section: LearnSection }) {
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

    // Placeholders for Phase 2 interactive components
    case "code":
    case "diagram":
    case "comparison":
    case "steps":
    case "playground":
      return (
        <PlaceholderSection
          sectionType={type}
          title={title}
          content={content}
        />
      );

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
              <SectionRenderer section={section} />
            </div>
          ))}
      </div>
    </div>
  );
}
