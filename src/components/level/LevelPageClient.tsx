"use client";

import { useState } from "react";
import type { LearnSection, GameType, GameConfig } from "@/types/content";
import StepOutline from "@/components/level/StepOutline";
import CardFlow from "@/components/level/CardFlow";
import GamePanel from "@/components/games/GamePanel";
import LevelHeader from "@/components/level/LevelHeader";

// ── Helper: default title per section type ────────────────────────────────────
function getSectionDefaultTitle(type: string): string {
  const titles: Record<string, string> = {
    text: "Deep Dive",
    diagram: "Pipeline Diagram",
    d2_diagram: "Architecture Diagram",
    exploration: "Interactive Exploration",
    analogy: "You Already Know This",
    prediction: "What Do You Think?",
    comparison: "Before & After",
    callout: "Enterprise Insight",
    code: "Production Code",
    steps: "Step by Step",
    playground: "Interactive Playground",
  };
  return titles[type] ?? "Content";
}

// ── Props ─────────────────────────────────────────────────────────────────────
export interface LevelPageClientProps {
  learnSections: LearnSection[];
  accentColor: string;
  gameType: GameType;
  gameConfig: GameConfig;
  levelTitle: string;
  levelId: number;
  levelNum: number;
  chapterId: number;
  chapterSlug: string;
  chapterTitle: string;
  xpReward: number;
  keyInsight: string | null;
  nextLevelUrl: string | null;
  backUrl: string;
  isAuthenticated: boolean;
  // Header fields
  levelSubtitle?: string | null;
  hookQuote?: string | null;
  totalLevels: number;
  estimatedMinutes?: number | null;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function LevelPageClient({
  learnSections,
  accentColor,
  gameType,
  gameConfig,
  levelTitle,
  levelId,
  levelNum,
  chapterId,
  chapterSlug,
  chapterTitle,
  xpReward,
  keyInsight,
  nextLevelUrl,
  backUrl,
  isAuthenticated,
  levelSubtitle,
  hookQuote,
  totalLevels,
  estimatedMinutes,
}: LevelPageClientProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // totalSteps = all learn sections + 1 game step
  const totalSteps = learnSections.length + 1;

  // Build sidebar step items from learn sections (already sorted by server)
  const stepItems = learnSections.map((s, i) => ({
    type: s.sectionType,
    title: s.title ?? getSectionDefaultTitle(s.sectionType),
    index: i,
  }));

  return (
    <>
      <LevelHeader
        levelNum={levelNum}
        title={levelTitle}
        subtitle={levelSubtitle}
        hookQuote={hookQuote}
        accentColor={accentColor}
        currentStep={currentStep}
        totalLevels={totalLevels}
        chapterTitle={chapterTitle}
        xpReward={xpReward}
        estimatedMinutes={estimatedMinutes}
      />
      <div style={{ display: "flex", gap: 0, alignItems: "stretch" }}>
        {/* Desktop sidebar — hidden on mobile via StepOutline's internal media query */}
        <StepOutline
          sections={stepItems}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
          gameTitle={levelTitle}
          accentColor={accentColor}
        />

        {/* Main content area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <CardFlow
            learnSections={learnSections}
            accentColor={accentColor}
            gameType={gameType}
            gameTitle={levelTitle}
            currentStep={currentStep}
            onStepChange={setCurrentStep}
            totalSteps={totalSteps}
          >
            <GamePanel
              gameType={gameType}
              gameConfig={gameConfig}
              accentColor={accentColor}
              levelTitle={levelTitle}
              levelId={levelId}
              chapterId={chapterId}
              chapterSlug={chapterSlug}
              xpReward={xpReward}
              keyInsight={keyInsight}
              nextLevelUrl={nextLevelUrl}
              backUrl={backUrl}
              isAuthenticated={isAuthenticated}
            />
          </CardFlow>
        </div>
      </div>
    </>
  );
}
