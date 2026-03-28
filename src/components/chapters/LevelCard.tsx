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
  accentColor: string;
}

export default function LevelCard({
  level,
  chapterSlug,
  accentColor,
}: LevelCardProps) {
  const gameLabel = GAME_TYPE_LABELS[level.gameType] ?? level.gameType;
  const gameColor = GAME_TYPE_COLOR[level.gameType] ?? accentColor;

  return (
    <Link
      href={`/chapters/${chapterSlug}/levels/${level.levelNumber}`}
      style={{ textDecoration: "none" }}
    >
      <div
        className="flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all duration-150 group"
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.backgroundColor = "var(--card-hover)";
          el.style.borderColor = accentColor + "40";
          el.style.transform = "translateX(2px)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.backgroundColor = "var(--card)";
          el.style.borderColor = "var(--border)";
          el.style.transform = "";
        }}
      >
        {/* Level number badge */}
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
          style={{
            backgroundColor: `${accentColor}18`,
            color: accentColor,
            border: `1px solid ${accentColor}30`,
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
                color: "var(--text-primary)",
                fontFamily: "var(--font-display)",
              }}
            >
              {level.title}
            </span>
            {/* Game type pill */}
            <span
              className="text-xs px-2 py-0.5 rounded-md font-medium"
              style={{
                backgroundColor: `${gameColor}12`,
                color: gameColor,
                border: `1px solid ${gameColor}25`,
              }}
            >
              {gameLabel}
            </span>
          </div>
          {level.subtitle && (
            <p
              className="text-xs mt-0.5 truncate"
              style={{ color: "var(--text-muted)" }}
            >
              {level.subtitle}
            </p>
          )}
        </div>

        {/* Meta: XP + time */}
        <div
          className="flex-shrink-0 flex items-center gap-3 text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          {level.estimatedMinutes && (
            <span className="hidden sm:block">
              {level.estimatedMinutes} min
            </span>
          )}
          {level.xpReward && (
            <span className="font-semibold" style={{ color: "var(--xp-gold)" }}>
              +{level.xpReward} XP
            </span>
          )}
          {/* Chevron — visible on hover */}
          <svg
            className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity duration-150"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
            style={{ color: accentColor }}
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
