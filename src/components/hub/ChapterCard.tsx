"use client";

import Link from "next/link";
import ChapterProgressOverlay from "@/components/hub/ChapterProgressOverlay";

function LockIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
      style={{ color: "var(--color-text-muted)", opacity: 0.7 }}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}

interface ProgressRingProps {
  pct: number; // 0–1
  accentColor: string;
}

function ProgressRing({ pct, accentColor }: ProgressRingProps) {
  // circumference of circle r=16: 2π×16 ≈ 100.53
  const circumference = 100.53;
  const filled = pct * circumference;

  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      aria-label={`${Math.round(pct * 100)}% complete`}
      role="img"
    >
      {/* Track */}
      <circle
        cx="20"
        cy="20"
        r="16"
        fill="none"
        stroke="var(--color-border)"
        strokeWidth="3"
      />
      {/* Fill */}
      <circle
        cx="20"
        cy="20"
        r="16"
        fill="none"
        stroke={accentColor}
        strokeWidth="3"
        strokeDasharray={`${filled} ${circumference}`}
        strokeLinecap="round"
        transform="rotate(-90 20 20)"
        style={{
          transition:
            "stroke-dasharray 800ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      />
      {/* Percentage label */}
      <text
        x="20"
        y="20"
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--color-text-muted)"
        fontSize="10"
        fontWeight="500"
      >
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}

interface ChapterCardProps {
  chapter: {
    id: number;
    slug: string;
    title: string;
    subtitle: string | null;
    icon: string | null;
    levelCount: number;
  };
  accentColor: string;
  isLocked: boolean;
  prereqs: string[];
  isFeatured?: boolean;
  chapterIndex?: number;
  // Optional progress for the ring — ChapterProgressOverlay will supply this
  completedLevels?: number;
}

export default function ChapterCard({
  chapter,
  accentColor,
  isLocked,
  prereqs,
  isFeatured = false,
  chapterIndex = 1,
}: ChapterCardProps) {
  // Estimated reading time: ~3 min per level
  const estMinutes = chapter.levelCount * 3;
  const estTime =
    estMinutes >= 60 ? `${Math.round(estMinutes / 60)}h` : `${estMinutes}m`;

  const cardInner = (
    <div
      className="relative overflow-hidden rounded-2xl h-full flex flex-col group"
      style={{
        backgroundColor: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
        borderLeft: `4px solid ${accentColor}`,
        filter: isLocked ? "blur(2px)" : undefined,
        opacity: isLocked ? 0.5 : 1,
        minHeight: isFeatured ? "200px" : "220px",
        boxShadow: "var(--shadow-card)",
        transition:
          "transform 200ms ease-out, box-shadow 200ms ease-out, border-color 200ms ease-out",
      }}
      onMouseEnter={(e) => {
        if (isLocked) return;
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "translateY(-6px)";
        el.style.boxShadow = `0 20px 60px var(--color-shadow-gold), 0 0 0 1px rgba(255,184,0,0.3)`;
        el.style.borderColor = `rgba(255,184,0,0.3)`;
      }}
      onMouseLeave={(e) => {
        if (isLocked) return;
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "";
        el.style.boxShadow = "var(--shadow-card)";
        el.style.borderColor = "var(--color-border)";
      }}
    >
      {/* Ambient accent glow */}
      <div
        className="absolute top-0 right-0 w-64 h-32 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `radial-gradient(ellipse 200px 120px at 80% 20%, ${accentColor}18 0%, transparent 70%)`,
        }}
      />

      {/* Ghost chapter numeral */}
      <div
        className="absolute bottom-0 right-4 pointer-events-none select-none"
        aria-hidden="true"
        style={{
          fontSize: "120px",
          fontWeight: 900,
          lineHeight: 1,
          color: accentColor,
          opacity: 0.04,
          fontFamily: "var(--font-display)",
          letterSpacing: "-0.05em",
        }}
      >
        {chapterIndex}
      </div>

      {/* Progress ring — top right corner */}
      <div className="absolute top-4 right-4 z-20">
        <ChapterProgressOverlay
          chapterId={chapter.id}
          totalLevels={chapter.levelCount}
          accentColor={accentColor}
          renderAs="ring"
        />
      </div>

      {/* Lock overlay */}
      {isLocked && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl"
          style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
        >
          <LockIcon />
        </div>
      )}

      {/* Card content */}
      <div
        className={`relative z-10 p-5 flex flex-col h-full ${isFeatured ? "sm:p-7" : ""}`}
      >
        {/* Icon */}
        <div className="mb-4">
          <div
            className="flex items-center justify-center w-11 h-11 rounded-xl text-2xl flex-shrink-0"
            style={{
              backgroundColor: `${accentColor}18`,
              border: `1px solid ${accentColor}28`,
            }}
            aria-hidden="true"
          >
            {chapter.icon ?? "🧠"}
          </div>
        </div>

        {/* Title */}
        <h2
          className="font-display mb-1.5"
          style={{
            color: "var(--color-text-primary)",
            fontSize: "1.375rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          {chapter.title}
        </h2>

        {/* Subtitle */}
        {chapter.subtitle && (
          <p
            className="text-sm mb-3 flex-1"
            style={{
              color: "var(--color-text-secondary)",
              lineHeight: "1.5",
            }}
          >
            {chapter.subtitle}
          </p>
        )}

        {/* Footer row — level count + time */}
        <div
          className="flex items-center gap-3 mt-auto pt-3"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          <span
            className="text-xs"
            style={{ color: "var(--color-text-muted)" }}
          >
            {chapter.levelCount} level{chapter.levelCount !== 1 ? "s" : ""}
          </span>
          <span
            className="text-xs"
            style={{ color: "var(--color-text-muted)" }}
          >
            ·
          </span>
          <span
            className="text-xs"
            style={{ color: "var(--color-text-muted)" }}
          >
            ~{estTime}
          </span>

          {isLocked && prereqs.length > 0 && (
            <span
              className="text-xs ml-auto"
              style={{ color: "var(--color-text-muted)" }}
            >
              Requires: {prereqs.join(", ")}
            </span>
          )}

          {!isLocked && (
            <svg
              className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-60"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{
                color: accentColor,
                transition: "opacity 200ms ease-out",
              }}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );

  if (isLocked) {
    return (
      <div
        className="cursor-not-allowed h-full"
        title={
          prereqs.length > 0 ? `Requires: ${prereqs.join(", ")}` : "Locked"
        }
      >
        {cardInner}
      </div>
    );
  }

  return (
    <Link
      href={`/chapters/${chapter.slug}`}
      className="block h-full"
      style={{ textDecoration: "none" }}
    >
      {cardInner}
    </Link>
  );
}

// Export ProgressRing for use in ChapterProgressOverlay
export { ProgressRing };
