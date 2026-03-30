"use client";

import { useEffect, useRef } from "react";

export interface LevelHeaderProps {
  levelNum: number;
  title: string;
  subtitle?: string | null;
  hookQuote?: string | null;
  accentColor: string;
  currentStep: number;
  totalLevels: number;
  chapterTitle?: string | null;
  xpReward?: number | null;
  estimatedMinutes?: number | null;
}

export default function LevelHeader({
  levelNum,
  title,
  subtitle,
  hookQuote,
  accentColor,
  currentStep,
  totalLevels,
  chapterTitle,
  xpReward,
  estimatedMinutes,
}: LevelHeaderProps) {
  const isExpanded = currentStep === 0;

  // Ref to the collapsible area for height animation
  const collapseRef = useRef<HTMLDivElement>(null);

  // Whether there is any collapsible content to show
  const hasCollapsibleContent = !!(subtitle || hookQuote);

  // Drive the height transition via inline style on the ref node.
  // We use maxHeight (not height) so we don't need to measure exact content height.
  useEffect(() => {
    const el = collapseRef.current;
    if (!el) return;

    // Respect prefers-reduced-motion: skip transition, snap immediately.
    // Guard for environments (SSR, jsdom) where matchMedia may not exist.
    const prefersReduced =
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;

    if (prefersReduced) {
      // Disable transitions first, then set values
      el.style.transition = "none";
    }
    el.style.maxHeight = isExpanded ? "500px" : "0px";
    el.style.opacity = isExpanded ? "1" : "0";
  }, [isExpanded]);

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 mb-6"
      style={{
        background: `linear-gradient(135deg, ${accentColor}10 0%, transparent 60%)`,
        border: `1px solid ${accentColor}25`,
        borderLeft: `4px solid ${accentColor}`,
        backgroundColor: "var(--color-bg-card)",
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-0 right-0 w-64 h-32 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `radial-gradient(ellipse 200px 120px at 80% 20%, ${accentColor}12 0%, transparent 70%)`,
        }}
      />

      {/* Level badge + content */}
      <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          {/* Level number + title — always visible */}
          <div className="flex items-center gap-2.5 mb-1 flex-wrap">
            <span
              className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold flex-shrink-0"
              style={{
                backgroundColor: `${accentColor}20`,
                color: accentColor,
                border: `1px solid ${accentColor}40`,
              }}
            >
              {levelNum}
            </span>
            <h1
              className="font-bold"
              style={{
                color: "var(--color-text-primary)",
                fontSize: "1.25rem",
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.025em",
              }}
            >
              {title}
            </h1>
          </div>

          {/* Collapsible section: subtitle + hook quote — only rendered if content exists */}
          {hasCollapsibleContent && (
            <div
              ref={collapseRef}
              style={{
                overflow: "hidden",
                maxHeight: isExpanded ? "500px" : "0px",
                opacity: isExpanded ? 1 : 0,
                transition: "max-height 300ms ease-out, opacity 200ms ease-out",
              }}
              aria-hidden={!isExpanded}
            >
              {/* Subtitle */}
              {subtitle && (
                <p
                  className="text-sm ml-9 mb-2"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {subtitle}
                </p>
              )}

              {/* Hook — editorial pull-quote */}
              {hookQuote && (
                <blockquote
                  className="ml-9 mt-3 relative pl-12 pt-8 pb-4 pr-4 rounded-r-lg"
                  style={{
                    borderLeft: `4px solid ${accentColor}`,
                    backgroundColor: `${accentColor}06`,
                  }}
                >
                  {/* Large opening quote glyph */}
                  <span
                    aria-hidden="true"
                    className="absolute left-3 font-display leading-none select-none"
                    style={{
                      fontSize: "80px",
                      color: "var(--color-accent-gold)",
                      lineHeight: 1,
                      top: "-4px",
                    }}
                  >
                    &ldquo;
                  </span>
                  <p
                    className="font-display italic leading-relaxed"
                    style={{
                      color: "var(--color-text-primary)",
                      fontSize: "clamp(1rem, 2vw, 1.375rem)",
                    }}
                  >
                    {hookQuote}
                  </p>
                  {chapterTitle && (
                    <footer
                      className="mt-2 text-xs"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      — Level {levelNum} &middot; {chapterTitle}
                    </footer>
                  )}
                </blockquote>
              )}
            </div>
          )}
        </div>

        {/* Meta: XP + time + level counter — always visible */}
        <div
          className="flex flex-col items-end gap-1.5 text-xs flex-shrink-0"
          style={{ color: "var(--color-text-muted)" }}
        >
          {xpReward && (
            <span
              className="font-bold px-2 py-0.5 rounded-lg"
              style={{
                color: "var(--color-accent-gold)",
                backgroundColor: "rgba(245, 158, 11, 0.10)",
                border: "1px solid rgba(245, 158, 11, 0.20)",
              }}
            >
              +{xpReward} XP
            </span>
          )}
          {estimatedMinutes && <span>{estimatedMinutes} min</span>}
          <span style={{ color: "var(--color-text-muted)" }}>
            {levelNum} / {totalLevels}
          </span>
        </div>
      </div>
    </div>
  );
}
