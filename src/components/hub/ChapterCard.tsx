"use client";

import Link from "next/link";
import ChapterProgressOverlay from "@/components/hub/ChapterProgressOverlay";

function LockIcon() {
  return (
    <svg
      className="w-4 h-4 opacity-50"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
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
}

export default function ChapterCard({
  chapter,
  accentColor,
  isLocked,
  prereqs,
}: ChapterCardProps) {
  const cardInner = (
    <div
      className="relative rounded-2xl p-5 h-full flex flex-col transition-all duration-200"
      style={{
        backgroundColor: "var(--card)",
        border: `1px solid var(--border)`,
        borderLeft: `3px solid ${accentColor}`,
        opacity: isLocked ? 0.6 : 1,
      }}
    >
      {/* Icon + lock */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl" aria-hidden="true">
          {chapter.icon ?? "🧠"}
        </span>
        {isLocked && <LockIcon />}
      </div>

      {/* Title + subtitle */}
      <h2
        className="mb-1 font-semibold"
        style={{
          color: "var(--text-primary)",
          fontSize: "1rem",
          fontWeight: 600,
          letterSpacing: "-0.01em",
        }}
      >
        {chapter.title}
      </h2>
      {chapter.subtitle && (
        <p
          className="text-sm mb-3 flex-1"
          style={{ color: "var(--text-secondary)", lineHeight: "1.5" }}
        >
          {chapter.subtitle}
        </p>
      )}

      {/* Level count */}
      <div className="flex items-center gap-1.5 mt-auto">
        <svg
          className="w-3.5 h-3.5"
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

      {/* Progress overlay — reads session + localStorage */}
      {!isLocked && (
        <ChapterProgressOverlay
          chapterId={chapter.id}
          totalLevels={chapter.levelCount}
          accentColor={accentColor}
        />
      )}
    </div>
  );

  if (isLocked) {
    return (
      <div
        className="cursor-not-allowed"
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
      className="block"
      style={{ textDecoration: "none" }}
      onMouseEnter={(e) => {
        const card = e.currentTarget.querySelector(
          ".rounded-2xl",
        ) as HTMLDivElement | null;
        if (card) {
          card.style.backgroundColor = "var(--card-hover)";
          card.style.borderColor = "var(--border-hover)";
          card.style.transform = "translateY(-2px)";
          card.style.boxShadow = `0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px ${accentColor}33`;
        }
      }}
      onMouseLeave={(e) => {
        const card = e.currentTarget.querySelector(
          ".rounded-2xl",
        ) as HTMLDivElement | null;
        if (card) {
          card.style.backgroundColor = "var(--card)";
          card.style.borderColor = "var(--border)";
          card.style.transform = "";
          card.style.boxShadow = "";
        }
      }}
    >
      {cardInner}
    </Link>
  );
}
