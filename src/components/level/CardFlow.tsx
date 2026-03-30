"use client";

import {
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import type { LearnSection } from "@/types/content";
import LearnPanel from "@/components/learn/LearnPanel";

// ── Types ──────────────────────────────────────────────────────────────────
interface CardFlowProps {
  learnSections: LearnSection[];
  accentColor?: string;
  gameType: string;
  gameTitle?: string;
  currentStep: number;
  onStepChange: (step: number) => void;
  totalSteps: number;
  children?: ReactNode;
}

// ── Navigation button ──────────────────────────────────────────────────────
interface NavButtonProps {
  onClick: () => void;
  disabled: boolean;
  direction: "back" | "next";
  label: string;
  accentColor: string;
  isPrimary?: boolean;
}

function NavButton({
  onClick,
  disabled,
  direction,
  label,
  accentColor,
  isPrimary = false,
}: NavButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "9px 18px",
        borderRadius: "var(--radius-button)",
        fontSize: "14px",
        fontWeight: 500,
        fontFamily: "var(--font-sans)",
        cursor: disabled ? "not-allowed" : "pointer",
        border: isPrimary ? "none" : "1px solid var(--color-border)",
        backgroundColor: isPrimary ? accentColor : "var(--color-bg-surface)",
        color: isPrimary
          ? "#1a1a2e"
          : disabled
            ? "var(--color-text-muted)"
            : "var(--color-text-primary)",
        opacity: disabled ? 0.4 : 1,
        transition:
          "background-color 150ms ease-out, border-color 150ms ease-out, opacity 150ms ease-out",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          const btn = e.currentTarget as HTMLButtonElement;
          if (isPrimary) {
            btn.style.filter = "brightness(1.07)";
          } else {
            btn.style.borderColor = accentColor;
            btn.style.color = accentColor;
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          const btn = e.currentTarget as HTMLButtonElement;
          if (isPrimary) {
            btn.style.filter = "";
          } else {
            btn.style.borderColor = "var(--color-border)";
            btn.style.color = "var(--color-text-primary)";
          }
        }
      }}
    >
      {direction === "back" && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M9 2L4 7L9 12"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {label}
      {direction === "next" && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M5 2L10 7L5 12"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function CardFlow({
  learnSections,
  accentColor = "var(--chapter-rag)",
  gameType: _gameType,
  gameTitle = "Challenge",
  currentStep,
  onStepChange,
  totalSteps,
  children,
}: CardFlowProps) {
  // Sorted sections — same sort order used by LearnPanel internally
  const sortedSections = [...learnSections].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  // Game step index = number of learn sections (0-based)
  const gameStepIndex = sortedSections.length;
  const isOnGameStep = currentStep === gameStepIndex;
  const isOnLastLearnStep = currentStep === gameStepIndex - 1;

  // Ref for the card heading — used to move focus when step changes
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Live region ref for announcing step changes
  const liveRef = useRef<HTMLDivElement>(null);

  // Focus the card heading on step change for keyboard / screen-reader users
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    // Update live region
    if (liveRef.current) {
      liveRef.current.textContent = `Step ${currentStep + 1} of ${totalSteps}`;
    }
  }, [currentStep, totalSteps]);

  // Keyboard navigation — Left/Right arrows when no input is focused
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      const isInputFocused =
        tag === "input" || tag === "textarea" || tag === "select";
      if (isInputFocused) return;

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        if (currentStep < totalSteps - 1) {
          onStepChange(currentStep + 1);
        }
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        if (currentStep > 0) {
          onStepChange(currentStep - 1);
        }
      }
    },
    [currentStep, totalSteps, onStepChange],
  );

  // Next button label
  const nextLabel = isOnLastLearnStep
    ? "Start Challenge →"
    : isOnGameStep
      ? "Challenge"
      : "Next";

  // Progress percentage for mobile bar
  const progressPct =
    totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 100;

  return (
    <div
      id="card-panel"
      onKeyDown={handleKeyDown}
      style={{ display: "flex", flexDirection: "column", flex: 1 }}
    >
      {/* ── Accessibility: live region for step announcements ── */}
      <div
        ref={liveRef}
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
        }}
      />

      {/* ── Mobile-only top progress bar ── */}
      <div
        className="card-flow-mobile-bar"
        aria-hidden="true"
        style={{ display: "block" }}
      >
        <div
          style={{
            height: "3px",
            width: "100%",
            backgroundColor: "var(--color-border-subtle)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: "100%",
              width: `${progressPct}%`,
              backgroundColor: accentColor,
              transition: "width 300ms ease-out",
            }}
          />
        </div>
        <style>{`
          @media (min-width: 768px) {
            .card-flow-mobile-bar {
              display: none !important;
            }
          }
        `}</style>
      </div>

      {/* ── Card area ── */}
      <div style={{ flex: 1, paddingBottom: "8px" }}>
        {/* Visually hidden heading receives focus on step change */}
        <h2
          ref={headingRef}
          tabIndex={-1}
          style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            overflow: "hidden",
            clip: "rect(0,0,0,0)",
            whiteSpace: "nowrap",
          }}
        >
          {isOnGameStep
            ? gameTitle
            : (sortedSections[currentStep]?.title ?? `Step ${currentStep + 1}`)}
        </h2>

        {/* Render each learn section card — all in DOM, only active visible */}
        {sortedSections.map((section, idx) => {
          const isExploration = section.sectionType === "exploration";
          return (
            <div
              key={section.id}
              id={`card-step-${idx}`}
              role="tabpanel"
              aria-labelledby={`step-tab-${idx}`}
              style={{
                display: currentStep === idx ? "block" : "none",
                maxWidth: isExploration ? "none" : "800px",
                margin: "0 auto",
                padding: "24px 16px",
              }}
            >
              <LearnPanel learnSections={[section]} accentColor={accentColor} />
            </div>
          );
        })}

        {/* Game step — rendered as last card */}
        {children && (
          <div
            id={`card-step-${gameStepIndex}`}
            role="tabpanel"
            aria-labelledby={`step-tab-${gameStepIndex}`}
            style={{
              display: isOnGameStep ? "block" : "none",
              maxWidth: "800px",
              margin: "0 auto",
              padding: "24px 16px",
            }}
          >
            {children}
          </div>
        )}
      </div>

      {/* ── Bottom navigation bar ── */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          zIndex: 10,
          backgroundColor: "var(--color-bg-surface)",
          borderTop: "1px solid var(--color-border)",
          padding: "12px 16px",
        }}
      >
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {/* Nav controls row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            {/* Back button */}
            <NavButton
              direction="back"
              label="Back"
              disabled={currentStep === 0}
              accentColor={accentColor}
              onClick={() => onStepChange(currentStep - 1)}
            />

            {/* Step counter */}
            <span
              style={{
                fontSize: "13px",
                fontFamily: "var(--font-sans)",
                color: "var(--color-text-muted)",
                whiteSpace: "nowrap",
              }}
              aria-label={`Step ${currentStep + 1} of ${totalSteps}`}
            >
              <span style={{ color: accentColor, fontWeight: 600 }}>
                {currentStep + 1}
              </span>
              {" of "}
              {totalSteps}
            </span>

            {/* Next / Start Challenge button */}
            <NavButton
              direction="next"
              label={nextLabel}
              disabled={isOnGameStep}
              accentColor={accentColor}
              isPrimary={isOnLastLearnStep}
              onClick={() => {
                if (!isOnGameStep) {
                  onStepChange(currentStep + 1);
                }
              }}
            />
          </div>

          {/* Skip to Challenge link — hidden when already on game step */}
          {!isOnGameStep && (
            <div style={{ textAlign: "center" }}>
              <button
                type="button"
                onClick={() => onStepChange(gameStepIndex)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontFamily: "var(--font-sans)",
                  color: accentColor,
                  opacity: 0.75,
                  padding: "2px 4px",
                  borderRadius: "4px",
                  transition: "opacity 150ms ease-out",
                  textDecoration: "underline",
                  textDecorationStyle: "dotted",
                  textUnderlineOffset: "2px",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = "0.75";
                }}
                aria-label="Skip all learn sections and go directly to the challenge"
              >
                Skip to Challenge →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
