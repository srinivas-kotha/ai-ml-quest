"use client";

import Link from "next/link";

const GAME_TYPE_LABELS: Record<string, string> = {
  SpeedQuiz: "Speed Quiz",
  PipelineBuilder: "Pipeline Builder",
  CodeDebugger: "Code Debugger",
  ConceptMatcher: "Concept Matcher",
  ParameterTuner: "Parameter Tuner",
  DiagnosisLab: "Diagnosis Lab",
  CostOptimizer: "Cost Optimizer",
  ArchitectureBattle: "Arch Battle",
};

// Game type → subtle tint color
const GAME_TYPE_COLOR: Record<string, string> = {
  SpeedQuiz: "#3b82f6",
  PipelineBuilder: "#10b981",
  CodeDebugger: "#ef4444",
  ConceptMatcher: "#8b5cf6",
  ParameterTuner: "#f59e0b",
  DiagnosisLab: "#ec4899",
  CostOptimizer: "#14b8a6",
  ArchitectureBattle: "#4f46e5",
};

interface LevelCardProps {
  level: {
    id: number;
    levelNumber: number;
    title: string;
    subtitle: string | null;
    gameType: string;
    xpReward: number | null;
    estimatedMinutes: number | null;
    keyInsight: string | null;
  };
  chapterSlug: string;
  /** CSS var string like `var(--chapter-rag)` — used for text/border colors */
  accentColor: string;
  /** Hex color like `#3b82f6` — used for rgba() opacity tricks in backgrounds */
  accentHex: string;
}

export default function LevelCard({
  level,
  chapterSlug,
  accentColor,
  accentHex,
}: LevelCardProps) {
  const gameLabel = GAME_TYPE_LABELS[level.gameType] ?? level.gameType;
  const gameColor = GAME_TYPE_COLOR[level.gameType] ?? accentHex;

  return (
    <Link
      href={`/chapters/${chapterSlug}/levels/${level.levelNumber}`}
      style={{ textDecoration: "none", display: "block" }}
    >
      <div
        className="flex items-center gap-4 rounded-xl px-4 py-3.5 group"
        style={{
          backgroundColor: "var(--color-bg-card)",
          border: "1px solid var(--color-border)",
          transition:
            "background-color 200ms ease-out, border-color 200ms ease-out, transform 200ms ease-out",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.backgroundColor = "var(--color-bg-card-hover)";
          el.style.borderColor = `${accentHex}40`;
          el.style.transform = "translateX(2px)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.backgroundColor = "var(--color-bg-card)";
          el.style.borderColor = "var(--color-border)";
          el.style.transform = "";
        }}
      >
        {/* Level number badge */}
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
          style={{
            backgroundColor: `${accentHex}20`,
            color: accentColor,
            border: `1px solid ${accentHex}35`,
            fontFamily: "var(--font-display)",
          }}
        >
          {level.levelNumber}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-sm font-semibold"
              style={{
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-display)",
              }}
            >
              {level.title}
            </span>
            {/* Game type pill */}
            <span
              className="text-xs px-2 py-0.5 rounded-md font-medium"
              style={{
                backgroundColor: `${gameColor}15`,
                color: gameColor,
                border: `1px solid ${gameColor}28`,
              }}
            >
              {gameLabel}
            </span>
          </div>
          {level.subtitle && (
            <p
              className="text-xs mt-0.5 truncate"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {level.subtitle}
            </p>
          )}
        </div>

        {/* Meta: XP + time + chevron */}
        <div
          className="flex-shrink-0 flex items-center gap-3 text-xs"
          style={{ color: "var(--color-text-muted)" }}
        >
          {level.estimatedMinutes && (
            <span className="hidden sm:block">
              {level.estimatedMinutes} min
            </span>
          )}
          {level.xpReward && (
            <span
              className="font-semibold"
              style={{ color: "var(--color-accent-gold)" }}
            >
              +{level.xpReward} XP
            </span>
          )}
          {/* Chevron — slides right on hover */}
          <svg
            className="w-4 h-4 opacity-0 group-hover:opacity-60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
            style={{
              color: accentColor,
              transition: "opacity 200ms ease-out, transform 200ms ease-out",
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
