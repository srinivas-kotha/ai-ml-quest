import type { CalloutVariant } from "@/types/content";
import MarkdownText from "./MarkdownText";

interface CalloutBoxProps {
  variant: CalloutVariant;
  title?: string;
  content: string;
  className?: string;
}

// ── Inline SVG icons (no external library) ─────────────────────────────────

function BriefcaseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function LightbulbIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" x2="12" y1="9" y2="13" />
      <line x1="12" x2="12.01" y1="17" y2="17" />
    </svg>
  );
}

function BrainIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  );
}

// ── Variant config ──────────────────────────────────────────────────────────

const VARIANT_CONFIG: Record<
  CalloutVariant,
  {
    borderColor: string;
    bgColor: string;
    iconColor: string;
    icon: React.ReactNode;
    defaultTitle: string;
  }
> = {
  enterprise: {
    borderColor: "#f5c542",
    bgColor: "rgba(245, 197, 66, 0.05)",
    iconColor: "#f5c542",
    icon: <BriefcaseIcon />,
    defaultTitle: "Enterprise Skills Bridge",
  },
  tip: {
    borderColor: "#3b82f6",
    bgColor: "rgba(59, 130, 246, 0.05)",
    iconColor: "#3b82f6",
    icon: <LightbulbIcon />,
    defaultTitle: "Tip",
  },
  warning: {
    borderColor: "#ef4444",
    bgColor: "rgba(239, 68, 68, 0.05)",
    iconColor: "#ef4444",
    icon: <AlertIcon />,
    defaultTitle: "Warning",
  },
  insight: {
    borderColor: "var(--color-accent-gold)",
    bgColor: "rgba(255, 184, 0, 0.08)",
    iconColor: "var(--color-accent-gold)",
    icon: <LightbulbIcon />,
    defaultTitle: "Key Insight",
  },
};

export default function CalloutBox({
  variant,
  title,
  content,
  className = "",
}: CalloutBoxProps) {
  const config = VARIANT_CONFIG[variant];
  const displayTitle = title ?? config.defaultTitle;

  return (
    <div
      className={`my-4 rounded-xl p-4 ${className}`}
      style={{
        backgroundColor: config.bgColor,
        borderLeft: `4px solid ${config.borderColor}`,
        border: `1px solid ${config.borderColor}22`,
        borderLeftWidth: 4,
        borderLeftColor: config.borderColor,
      }}
    >
      {/* Header row: icon + title */}
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color: config.iconColor }}>{config.icon}</span>
        <span
          className={
            variant === "insight"
              ? "text-xs font-bold uppercase"
              : "text-sm font-semibold"
          }
          style={{
            color: config.iconColor,
            letterSpacing: variant === "insight" ? "1.5px" : undefined,
          }}
        >
          {displayTitle}
        </span>
      </div>

      {/* Content rendered as markdown */}
      <div className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
        <MarkdownText content={content} />
      </div>
    </div>
  );
}
