"use client";

import Link from "next/link";
import Badge from "@/components/ui/Badge";

const GAME_TYPE_LABELS: Record<string, string> = {
  SpeedQuiz: "Speed Quiz",
  PipelineBuilder: "Pipeline Builder",
  CodeDebugger: "Code Debugger",
  ConceptMatcher: "Concept Matcher",
  ParameterTuner: "Parameter Tuner",
  DiagnosisLab: "Diagnosis Lab",
  CostOptimizer: "Cost Optimizer",
  ArchitectureBattle: "Architecture Battle",
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

  return (
    <Link
      href={`/chapters/${chapterSlug}/levels/${level.levelNumber}`}
      style={{ textDecoration: "none" }}
    >
      <div
        className="flex items-center gap-4 rounded-xl px-4 py-3 transition-all duration-150 group"
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.backgroundColor = "var(--card-hover)";
          el.style.borderColor = "var(--border-hover)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.backgroundColor = "var(--card)";
          el.style.borderColor = "var(--border)";
        }}
      >
        {/* Level number badge */}
        <div
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
          style={{
            backgroundColor: `${accentColor}20`,
            color: accentColor,
            border: `1px solid ${accentColor}30`,
          }}
        >
          {level.levelNumber}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {level.title}
            </span>
            <Badge variant="default" size="xs">
              {gameLabel}
            </Badge>
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
            <span className="font-medium" style={{ color: "var(--success)" }}>
              +{level.xpReward} XP
            </span>
          )}
          {/* Chevron */}
          <svg
            className="w-4 h-4 opacity-30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
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
