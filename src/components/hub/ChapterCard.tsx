"use client";

import Link from "next/link";
import ChapterProgressOverlay from "@/components/hub/ChapterProgressOverlay";

function LockIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
      style={{ color: "var(--text-muted)", opacity: 0.6 }}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
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
}

export default function ChapterCard({
  chapter,
  accentColor,
  isLocked,
  prereqs,
  isFeatured = false,
  chapterIndex = 1,
}: ChapterCardProps) {
  const cardInner = (
    <div
      className="relative overflow-hidden rounded-2xl h-full flex flex-col transition-all duration-200 group"
      style={{
        backgroundColor: "var(--card)",
        border: "1px solid var(--border)",
        borderLeft: `4px solid ${accentColor}`,
        opacity: isLocked ? 0.55 : 1,
        minHeight: isFeatured ? "180px" : "200px",
        boxShadow: "var(--shadow-card)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.backgroundColor = "var(--card-hover)";
        el.style.borderColor = accentColor;
        el.style.transform = "translateY(-4px)";
        el.style.boxShadow = `0 20px 60px rgba(0,0,0,0.45), 0 0 0 1px ${accentColor}40`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.backgroundColor = "var(--card)";
        el.style.borderColor = accentColor;
        el.style.borderLeftColor = accentColor;
        el.style.transform = "";
        el.style.boxShadow = "var(--shadow-card)";
      }}
    >
      {/* Ambient accent glow top-right */}
      <div
        className="absolute top-0 right-0 w-64 h-32 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `radial-gradient(ellipse 200px 120px at 80% 20%, ${accentColor}12 0%, transparent 70%)`,
        }}
      />

      {/* Large background chapter numeral */}
      <div
        className="absolute bottom-0 right-4 pointer-events-none select-none"
        aria-hidden="true"
        style={{
          fontSize: "120px",
          fontWeight: 900,
          lineHeight: 1,
          color: accentColor,
          opacity: 0.035,
          fontFamily: "var(--font-display)",
          letterSpacing: "-0.05em",
        }}
      >
        {chapterIndex}
      </div>

      {/* Card content */}
      <div
        className={`relative z-10 p-5 flex flex-col h-full ${isFeatured ? "sm:p-7" : ""}`}
      >
        {/* Icon row */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="flex items-center justify-center w-11 h-11 rounded-xl text-2xl flex-shrink-0"
            style={{
              backgroundColor: `${accentColor}15`,
              border: `1px solid ${accentColor}25`,
            }}
            aria-hidden="true"
          >
            {chapter.icon ?? "🧠"}
          </div>
          {isLocked && <LockIcon />}
        </div>

        {/* Title */}
        <h2
          className="mb-1.5"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-display)",
            fontSize: isFeatured ? "1.35rem" : "1.05rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.25,
          }}
        >
          {chapter.title}
        </h2>

        {/* Subtitle */}
        {chapter.subtitle && (
          <p
            className="text-sm mb-3 flex-1"
            style={{ color: "var(--text-secondary)", lineHeight: "1.5" }}
          >
            {chapter.subtitle}
          </p>
        )}

        {/* Footer row — level count + time */}
        <div
          className="flex items-center gap-3 mt-auto pt-3"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{ color: accentColor }}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {chapter.levelCount} level{chapter.levelCount !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Locked prereq hint */}
          {isLocked && prereqs.length > 0 && (
            <span
              className="text-xs ml-auto"
              style={{ color: "var(--text-muted)" }}
            >
              Requires: {prereqs.join(", ")}
            </span>
          )}

          {/* Arrow indicator on hover for unlocked cards */}
          {!isLocked && (
            <svg
              className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-60 transition-opacity duration-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{ color: accentColor }}
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

        {/* Progress overlay — reads session + localStorage */}
        {!isLocked && (
          <ChapterProgressOverlay
            chapterId={chapter.id}
            totalLevels={chapter.levelCount}
            accentColor={accentColor}
          />
        )}
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
