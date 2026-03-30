"use client";

import { useRef, useEffect } from "react";

// ── Icon mapping ───────────────────────────────────────────────────────────
const SECTION_TYPE_ICONS: Record<string, string> = {
  text: "📝",
  diagram: "📊",
  d2_diagram: "📐",
  exploration: "🔍",
  analogy: "💡",
  prediction: "🎯",
  comparison: "⚖️",
  callout: "💼",
  code: "💻",
  steps: "📋",
  playground: "🎮",
  game: "⚡",
};

// ── Types ──────────────────────────────────────────────────────────────────
interface StepItem {
  type: string;
  title: string;
  index: number;
}

interface StepOutlineProps {
  sections: StepItem[];
  currentStep: number;
  onStepClick: (index: number) => void;
  gameTitle?: string;
  accentColor?: string;
}

// ── Checkmark SVG ──────────────────────────────────────────────────────────
function CheckIcon({ color }: { color: string }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M2 5l2.5 2.5L8 3"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Step item ─────────────────────────────────────────────────────────────
interface StepItemProps {
  item: StepItem;
  isActive: boolean;
  isCompleted: boolean;
  isFuture: boolean;
  isGame: boolean;
  totalCount: number;
  accentColor: string;
  onClick: () => void;
}

function StepItemButton({
  item,
  isActive,
  isCompleted,
  isFuture,
  isGame,
  totalCount,
  accentColor,
  onClick,
}: StepItemProps) {
  const icon = isGame
    ? SECTION_TYPE_ICONS.game
    : (SECTION_TYPE_ICONS[item.type] ?? "📄");

  // Truncate long titles for sidebar
  const displayTitle =
    item.title.length > 28 ? item.title.slice(0, 26) + "…" : item.title;

  const stepNumber = item.index + 1;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-label={`Step ${stepNumber} of ${totalCount}: ${item.title}`}
      aria-controls="card-panel"
      id={`step-tab-${item.index}`}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        width: "100%",
        textAlign: "left",
        padding: "8px 12px",
        borderRadius: "10px",
        cursor: "pointer",
        border: "none",
        backgroundColor: isActive ? `${accentColor}18` : "transparent",
        outline: "none",
        transition:
          "background-color 150ms ease-out, border-color 150ms ease-out",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
            "var(--color-bg-card)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
            "transparent";
        }
      }}
    >
      {/* Step number circle / checkmark */}
      <div
        style={{
          flexShrink: 0,
          width: "22px",
          height: "22px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "10px",
          fontWeight: 700,
          fontFamily: "var(--font-sans)",
          backgroundColor: isActive
            ? accentColor
            : isCompleted
              ? `${accentColor}20`
              : "var(--color-bg-card)",
          color: isActive
            ? "#1a1a2e"
            : isCompleted
              ? accentColor
              : "var(--color-text-muted)",
          border: `1.5px solid ${
            isActive
              ? accentColor
              : isCompleted
                ? `${accentColor}50`
                : "var(--color-border)"
          }`,
          transition:
            "background-color 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out",
        }}
      >
        {isCompleted && !isActive ? (
          <CheckIcon color={accentColor} />
        ) : (
          stepNumber
        )}
      </div>

      {/* Icon + label */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          minWidth: 0,
        }}
      >
        <span
          style={{
            fontSize: "13px",
            lineHeight: 1,
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          {icon}
        </span>
        <span
          style={{
            fontSize: "12px",
            lineHeight: 1.35,
            fontFamily: "var(--font-sans)",
            fontWeight: isActive ? 600 : isGame ? 600 : 400,
            color: isActive
              ? accentColor
              : isFuture
                ? "var(--color-text-muted)"
                : isGame
                  ? "var(--color-text-primary)"
                  : "var(--color-text-secondary)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            transition: "color 150ms ease-out",
          }}
        >
          {displayTitle}
        </span>
      </div>

      {/* Active indicator dot */}
      {isActive && (
        <div
          style={{
            marginLeft: "auto",
            flexShrink: 0,
            width: "5px",
            height: "5px",
            borderRadius: "50%",
            backgroundColor: accentColor,
          }}
          aria-hidden="true"
        />
      )}
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function StepOutline({
  sections,
  currentStep,
  onStepClick,
  gameTitle = "Challenge",
  accentColor = "var(--chapter-rag)",
}: StepOutlineProps) {
  const activeRef = useRef<HTMLDivElement>(null);

  // Scroll active step into view when currentStep changes
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [currentStep]);

  // Combine learn sections + game step
  const allSteps: StepItem[] = [
    ...sections,
    {
      type: "game",
      title: gameTitle,
      index: sections.length,
    },
  ];

  const totalCount = allSteps.length;

  return (
    /* Hidden on mobile — mobile uses the progress bar in CardFlow */
    <aside
      aria-label="Level steps"
      style={{
        display: "none",
        // Revealed via media query below (inline styles can't express @media,
        // so we use a CSS custom-property trick via className + CSS var fallback.
        // The actual responsive behavior is handled with a data attribute trick below.)
      }}
      className="step-outline-sidebar"
    >
      <nav
        role="tablist"
        aria-label="Level steps"
        style={{
          position: "sticky",
          top: "80px",
          width: "220px",
          flexShrink: 0,
          backgroundColor: "var(--color-bg-surface)",
          borderRight: "1px solid var(--color-border)",
          minHeight: "calc(100vh - 80px)",
          padding: "16px 8px",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "0 12px 12px",
            borderBottom: "1px solid var(--color-border-subtle)",
            marginBottom: "8px",
          }}
        >
          <p
            style={{
              fontSize: "10px",
              fontFamily: "var(--font-sans)",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
            }}
          >
            In this level
          </p>
        </div>

        {/* Step list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {allSteps.map((step, idx) => {
            const isActive = currentStep === step.index;
            const isCompleted = step.index < currentStep;
            const isFuture = step.index > currentStep;
            const isGame = step.type === "game";

            return (
              <div key={step.index} ref={isActive ? activeRef : undefined}>
                {/* Divider before game step */}
                {isGame && (
                  <div
                    style={{
                      margin: "8px 12px",
                      borderTop: "1px solid var(--color-border-subtle)",
                    }}
                    aria-hidden="true"
                  />
                )}
                <StepItemButton
                  item={step}
                  isActive={isActive}
                  isCompleted={isCompleted}
                  isFuture={isFuture}
                  isGame={isGame}
                  totalCount={totalCount}
                  accentColor={accentColor}
                  onClick={() => onStepClick(step.index)}
                />
              </div>
            );
          })}
        </div>

        {/* Progress summary at bottom */}
        <div
          style={{
            marginTop: "16px",
            padding: "10px 12px",
            borderTop: "1px solid var(--color-border-subtle)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "6px",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                fontFamily: "var(--font-sans)",
                color: "var(--color-text-muted)",
              }}
            >
              Progress
            </span>
            <span
              style={{
                fontSize: "10px",
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
                color: accentColor,
              }}
            >
              {Math.min(currentStep, totalCount)}/{totalCount}
            </span>
          </div>
          <div
            className="progress-bar-container"
            style={{ height: "4px" }}
            role="progressbar"
            aria-valuenow={Math.min(currentStep, totalCount)}
            aria-valuemin={0}
            aria-valuemax={totalCount}
            aria-label="Level progress"
          >
            <div
              className="progress-bar-fill"
              style={{
                width: `${(Math.min(currentStep, totalCount) / totalCount) * 100}%`,
                backgroundColor: accentColor,
              }}
            />
          </div>
        </div>
      </nav>

      {/* Inline responsive CSS — renders the sidebar on desktop */}
      <style>{`
        @media (min-width: 1024px) {
          .step-outline-sidebar {
            display: block !important;
          }
        }
      `}</style>
    </aside>
  );
}
