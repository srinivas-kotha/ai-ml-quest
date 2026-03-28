"use client";

import { useState, useEffect, useRef } from "react";
import type { GameType, GameConfig } from "@/types/content";
import { saveGuestProgress } from "@/lib/guest-progress";
import LevelComplete from "@/components/hud/LevelComplete";

// ── Individual game components ─────────────────────────────────────────────
import SpeedQuiz from "./SpeedQuiz";
import PipelineBuilder from "./PipelineBuilder";
import CodeDebugger from "./CodeDebugger";
import ConceptMatcher from "./ConceptMatcher";
import ParameterTuner from "./ParameterTuner";
import DiagnosisLab from "./DiagnosisLab";
import CostOptimizer from "./CostOptimizer";
import ArchitectureBattle from "./ArchitectureBattle";

// ── Types ──────────────────────────────────────────────────────────────────

interface GamePanelProps {
  gameType: GameType;
  gameConfig: GameConfig;
  accentColor?: string;
  levelTitle?: string;
  // New props for completion flow (optional — backwards compatible)
  levelId?: number;
  chapterId?: number;
  xpReward?: number;
  keyInsight?: string | null;
  chapterSlug?: string;
  nextLevelUrl?: string | null;
  backUrl?: string;
  isAuthenticated?: boolean;
}

const GAME_TYPE_LABELS: Record<GameType, string> = {
  SpeedQuiz: "Speed Quiz",
  PipelineBuilder: "Pipeline Builder",
  CodeDebugger: "Code Debugger",
  ConceptMatcher: "Concept Matcher",
  ParameterTuner: "Parameter Tuner",
  DiagnosisLab: "Diagnosis Lab",
  CostOptimizer: "Cost Optimizer",
  ArchitectureBattle: "Architecture Battle",
};

const GAME_TYPE_DESCRIPTIONS: Record<GameType, string> = {
  SpeedQuiz: "Answer multiple-choice questions under the clock",
  PipelineBuilder: "Drag and drop pipeline steps into the correct order",
  CodeDebugger: "Identify bugs in production code snippets",
  ConceptMatcher: "Match AI/ML concepts to their correct definitions",
  ParameterTuner: "Adjust model parameters and optimize for the target metric",
  DiagnosisLab: "Analyze metrics dashboards and diagnose system issues",
  CostOptimizer: "Balance quality, speed, and cost trade-offs",
  ArchitectureBattle: "Choose the right architectural pattern for the scenario",
};

const GAME_TYPE_ICONS: Record<GameType, string> = {
  SpeedQuiz: "⚡",
  PipelineBuilder: "🔗",
  CodeDebugger: "🐛",
  ConceptMatcher: "🧩",
  ParameterTuner: "🎛️",
  DiagnosisLab: "🔬",
  CostOptimizer: "💰",
  ArchitectureBattle: "⚔️",
};

// ── Game renderer switch ────────────────────────────────────────────────────

interface GameRendererProps {
  gameType: GameType;
  gameConfig: GameConfig;
  accentColor: string;
  onComplete: (score: number, maxScore: number) => void;
}

function GameRenderer({
  gameType,
  gameConfig,
  accentColor,
  onComplete,
}: GameRendererProps) {
  const commonProps = { accentColor, onComplete };

  switch (gameType) {
    case "SpeedQuiz":
      return (
        <SpeedQuiz
          config={gameConfig as import("@/types/content").SpeedQuizConfig}
          {...commonProps}
        />
      );
    case "PipelineBuilder":
      return (
        <PipelineBuilder
          config={gameConfig as import("@/types/content").PipelineBuilderConfig}
          {...commonProps}
        />
      );
    case "CodeDebugger":
      return (
        <CodeDebugger
          config={gameConfig as import("@/types/content").CodeDebuggerConfig}
          {...commonProps}
        />
      );
    case "ConceptMatcher":
      return (
        <ConceptMatcher
          config={gameConfig as import("@/types/content").ConceptMatcherConfig}
          {...commonProps}
        />
      );
    case "ParameterTuner":
      return (
        <ParameterTuner
          config={gameConfig as import("@/types/content").ParameterTunerConfig}
          {...commonProps}
        />
      );
    case "DiagnosisLab":
      return (
        <DiagnosisLab
          config={gameConfig as import("@/types/content").DiagnosisLabConfig}
          {...commonProps}
        />
      );
    case "CostOptimizer":
      return (
        <CostOptimizer
          config={gameConfig as import("@/types/content").CostOptimizerConfig}
          {...commonProps}
        />
      );
    case "ArchitectureBattle":
      return (
        <ArchitectureBattle
          config={
            gameConfig as import("@/types/content").ArchitectureBattleConfig
          }
          {...commonProps}
        />
      );
    default:
      return (
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Unknown game type: {gameType}
        </p>
      );
  }
}

// ── Main GamePanel ──────────────────────────────────────────────────────────

export default function GamePanel({
  gameType,
  gameConfig,
  accentColor,
  levelTitle,
  levelId,
  chapterId,
  xpReward = 100,
  keyInsight,
  chapterSlug,
  nextLevelUrl,
  backUrl,
  isAuthenticated = false,
}: GamePanelProps) {
  const color = accentColor ?? "var(--rag)";
  const label = GAME_TYPE_LABELS[gameType] ?? gameType;
  const description = GAME_TYPE_DESCRIPTIONS[gameType] ?? "";
  const icon = GAME_TYPE_ICONS[gameType] ?? "🎮";

  const [gameKey, setGameKey] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalMaxScore, setFinalMaxScore] = useState(1);
  const [showCompletion, setShowCompletion] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  const computedBackUrl =
    backUrl ?? (chapterSlug ? `/chapters/${chapterSlug}` : "/");

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, [gameKey]);

  const handleComplete = async (score: number, maxScore: number) => {
    if (completed) return;
    setCompleted(true);
    setFinalScore(score);
    setFinalMaxScore(maxScore);

    const timeSpentSeconds = Math.round(
      (Date.now() - startTimeRef.current) / 1000,
    );

    // Save progress
    if (levelId !== undefined) {
      const progressData = {
        levelId,
        chapterId: chapterId ?? 0,
        completed: true,
        score,
        maxScore,
        attempts: 1,
        timeSpentSeconds,
        completedAt: new Date().toISOString(),
      };

      if (isAuthenticated) {
        // POST to API for authenticated users
        try {
          await fetch("/api/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              level_id: levelId,
              score,
              max_score: maxScore,
              time_spent_seconds: timeSpentSeconds,
            }),
          });
        } catch {
          // Silently fall back to guest storage
          saveGuestProgress(progressData);
        }
      } else {
        saveGuestProgress(progressData);
      }
    }

    // Show completion modal with small delay for animation readiness
    setTimeout(() => setShowCompletion(true), 300);
  };

  const handleRetry = () => {
    setCompleted(false);
    setShowCompletion(false);
    setGameKey((k) => k + 1);
    startTimeRef.current = Date.now();
  };

  return (
    <>
      <div
        className="p-6 flex flex-col"
        style={{
          backgroundColor: "var(--color-bg-card)",
          border: "1px solid var(--color-border)",
          borderRadius: "16px",
          borderTop: `4px solid ${color}`,
        }}
      >
        {/* Game type header */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{
              backgroundColor: `${color}18`,
              border: `1px solid ${color}30`,
            }}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <h3
              className="font-semibold text-sm truncate"
              style={{ color: "var(--color-text-primary)" }}
            >
              {levelTitle ? `${levelTitle}` : label}
            </h3>
            <p
              className="text-xs mt-0.5 line-clamp-1 uppercase"
              style={{
                color: "var(--color-text-muted)",
                letterSpacing: "1px",
              }}
            >
              {description}
            </p>
          </div>
        </div>

        {/* Game content */}
        <div className="flex-1">
          {completed && !showCompletion ? (
            // Brief "processing" state while we wait for modal
            <div className="flex flex-col items-center justify-center gap-3 py-10">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${color}15` }}
              >
                ✓
              </div>
              <p className="text-sm font-medium" style={{ color: color }}>
                Calculating results…
              </p>
            </div>
          ) : (
            <GameRenderer
              key={gameKey}
              gameType={gameType}
              gameConfig={gameConfig}
              accentColor={color}
              onComplete={handleComplete}
            />
          )}
        </div>

        {/* Retry button shown after completion is dismissed */}
        {completed && !showCompletion && (
          <button
            type="button"
            onClick={handleRetry}
            className="mt-4 rounded-xl py-2.5 text-sm font-semibold w-full"
            style={{
              backgroundColor: "var(--color-bg-surface)",
              color: "var(--color-text-secondary)",
              border: "1px solid var(--color-border)",
              transition:
                "background-color 150ms ease, border-color 150ms ease",
            }}
          >
            Try Again
          </button>
        )}
      </div>

      {/* Level completion modal */}
      {showCompletion && (
        <LevelComplete
          score={finalScore}
          maxScore={finalMaxScore}
          xpEarned={xpReward}
          keyInsight={keyInsight}
          accentColor={color}
          nextLevelUrl={nextLevelUrl}
          backUrl={computedBackUrl}
          onClose={() => {
            setShowCompletion(false);
          }}
        />
      )}
    </>
  );
}
