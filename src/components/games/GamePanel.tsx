"use client";

import { useState } from "react";
import type { GameType, GameConfig } from "@/types/content";

interface GamePanelProps {
  gameType: GameType;
  gameConfig: GameConfig;
  accentColor?: string;
  levelTitle?: string;
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
  CodeDebugger: "Identify and fix bugs in production code snippets",
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

export default function GamePanel({
  gameType,
  gameConfig,
  accentColor,
  levelTitle,
}: GamePanelProps) {
  const [showConfig, setShowConfig] = useState(false);

  const label = GAME_TYPE_LABELS[gameType] ?? gameType;
  const description = GAME_TYPE_DESCRIPTIONS[gameType] ?? "";
  const icon = GAME_TYPE_ICONS[gameType] ?? "🎮";
  const color = accentColor ?? "var(--rag)";

  return (
    <div
      className="glass-panel p-6 flex flex-col h-full"
      style={{ borderTop: `2px solid ${color}` }}
    >
      {/* Game type header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{
            backgroundColor: `${color}18`,
            border: `1px solid ${color}30`,
          }}
        >
          {icon}
        </div>
        <div>
          <h3
            className="font-semibold text-sm"
            style={{ color: "var(--text-primary)" }}
          >
            {label}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {description}
          </p>
        </div>
      </div>

      {/* Coming soon card */}
      <div
        className="flex-1 rounded-xl flex flex-col items-center justify-center text-center p-6 gap-3"
        style={{
          backgroundColor: "rgba(255,255,255,0.02)",
          border: "1px dashed rgba(255,255,255,0.12)",
          minHeight: 220,
        }}
      >
        <div className="text-4xl mb-1" aria-hidden="true">
          🎮
        </div>
        <p
          className="text-sm font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          {levelTitle ? `${levelTitle} — ` : ""}
          {label}
        </p>
        <p
          className="text-xs max-w-[240px]"
          style={{ color: "var(--text-muted)" }}
        >
          Game components are being built in Phase 1C. Check back soon!
        </p>
        <div
          className="mt-2 px-3 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: `${color}15`,
            color,
            border: `1px solid ${color}30`,
          }}
        >
          Coming in Phase 1C
        </div>
      </div>

      {/* Collapsible config preview */}
      <div className="mt-4">
        <button
          type="button"
          className="flex items-center gap-1.5 text-xs transition-colors"
          style={{ color: "var(--text-muted)" }}
          onClick={() => setShowConfig((v) => !v)}
          aria-expanded={showConfig}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform"
            style={{ transform: showConfig ? "rotate(90deg)" : "rotate(0deg)" }}
            aria-hidden="true"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
          {showConfig ? "Hide" : "View"} game config
        </button>

        {showConfig && (
          <pre
            className="mt-2 rounded-lg overflow-x-auto text-xs leading-relaxed p-3"
            style={{
              backgroundColor: "var(--code-bg)",
              color: "#94a3b8",
              fontFamily: "var(--font-mono), monospace",
              border: "1px solid rgba(255,255,255,0.06)",
              maxHeight: 300,
              overflowY: "auto",
            }}
          >
            {JSON.stringify(gameConfig, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
