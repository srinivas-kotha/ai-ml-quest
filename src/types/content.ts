// ============================================================
// Content type definitions — mapped from Drizzle schema types
// ============================================================

// ----------------------------------------------------------
// Chapter
// ----------------------------------------------------------
export interface Chapter {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  icon: string | null;
  accentColor: string | null;
  sortOrder: number;
  isPublished: boolean | null;
  prerequisites: unknown;
  createdAt: Date | null;
  updatedAt: Date | null;
}

// ----------------------------------------------------------
// Level
// ----------------------------------------------------------
export interface Level {
  id: number;
  chapterId: number | null;
  slug: string;
  levelNumber: number;
  title: string;
  subtitle: string | null;
  hook: string | null;
  gameType: GameType;
  gameConfig: GameConfig;
  keyInsight: string | null;
  xpReward: number | null;
  estimatedMinutes: number | null;
  isPublished: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

// ----------------------------------------------------------
// Learn Section
// ----------------------------------------------------------
export type SectionType =
  | "text"
  | "code"
  | "diagram"
  | "comparison"
  | "steps"
  | "playground"
  | "callout"
  | "analogy"
  | "exploration"
  | "prediction"
  | "d2_diagram";

export interface LearnSection {
  id: number;
  levelId: number | null;
  sortOrder: number;
  sectionType: SectionType;
  title: string | null;
  content: LearnSectionContent;
  createdAt: Date | null;
}

// ----------------------------------------------------------
// Section content schemas (per section_type)
// ----------------------------------------------------------

export interface TextContent {
  markdown: string;
}

export interface CodeContent {
  language: "python" | "javascript" | "typescript" | "sql" | "bash" | "json";
  title?: string;
  code: string;
  annotations?: Array<{
    lines: number[];
    text: string;
  }>;
}

export interface DiagramNode {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export interface DiagramContent {
  nodes: DiagramNode[];
  edges: Array<[string, string]>;
  animate: boolean;
  stepThrough?: boolean;
}

export interface ComparisonContent {
  before: { label: string; content: string };
  after: { label: string; content: string };
}

export interface StepsContent {
  steps: Array<{
    title: string;
    content: string;
    visual?: string;
  }>;
}

export interface PlaygroundSlider {
  name: string;
  label: string;
  min: number;
  max: number;
  default: number;
  step?: number;
  unit?: string;
}

export interface PlaygroundContent {
  title: string;
  sliders: PlaygroundSlider[];
  renderType: "chunkPreview" | "costCalculator" | "dimensionPreview" | "custom";
  sampleText?: string;
  customRenderer?: string;
}

export type CalloutVariant = "enterprise" | "tip" | "warning" | "insight";

export interface CalloutContent {
  variant: CalloutVariant;
  title?: string;
  content: string;
}

// ----------------------------------------------------------
// Analogy content schema
// ----------------------------------------------------------
export interface AnalogyItem {
  background: "frontend" | "backend" | "devops" | "general" | string;
  familiarConcept: string;
  familiarIcon: string; // emoji
  newConcept: string;
  newIcon: string; // emoji
  bridgeText: string;
  breakPoint: string; // where the analogy breaks down
}

export interface AnalogyContent {
  analogies: AnalogyItem[];
}

// ----------------------------------------------------------
// Exploration (React Flow) content schema
// ----------------------------------------------------------
export interface ReactFlowNodeData {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: {
    label: string;
    icon?: string;
    details?: string;
    active?: boolean;
    accentColor?: string;
    [key: string]: unknown;
  };
}

export interface ReactFlowEdgeData {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
  animated?: boolean;
  [key: string]: unknown;
}

export interface ExplorationContent {
  title: string;
  description?: string;
  nodes: ReactFlowNodeData[];
  edges: ReactFlowEdgeData[];
  staticFallbackUrl?: string;
}

// ----------------------------------------------------------
// Prediction prompt content schema
// ----------------------------------------------------------
export interface PredictionContent {
  question: string;
  options?: string[];
  reveal: string;
}

// ----------------------------------------------------------
// D2 diagram content schema
// ----------------------------------------------------------
export interface D2DiagramContent {
  svgPath: string; // path relative to public/, e.g. "/diagrams/rag-architecture-overview.svg"
  altText: string;
  caption?: string;
}

export type LearnSectionContent =
  | TextContent
  | CodeContent
  | DiagramContent
  | ComparisonContent
  | StepsContent
  | PlaygroundContent
  | CalloutContent
  | AnalogyContent
  | ExplorationContent
  | PredictionContent
  | D2DiagramContent;

// ----------------------------------------------------------
// Game types
// ----------------------------------------------------------
export type GameType =
  | "SpeedQuiz"
  | "PipelineBuilder"
  | "CodeDebugger"
  | "ConceptMatcher"
  | "ParameterTuner"
  | "DiagnosisLab"
  | "CostOptimizer"
  | "ArchitectureBattle";

export interface SpeedQuizConfig {
  timePerQuestion: number;
  questions: Array<{
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  }>;
}

export interface PipelineBuilderConfig {
  steps: Array<{ id: string; label: string; description: string }>;
  correctOrder: string[];
}

export interface CodeDebuggerConfig {
  bugs: Array<{
    code: string;
    language: string;
    options: string[];
    correct: number;
    explanation: string;
  }>;
}

export interface ConceptMatcherConfig {
  pairs: Array<{ left: string; right: string }>;
}

export interface ParameterTunerConfig {
  scenario: string;
  parameters: Array<{
    name: string;
    min: number;
    max: number;
    optimal: number;
    unit: string;
  }>;
}

export interface DiagnosisLabConfig {
  cases: Array<{
    scenario: string;
    metrics: Record<string, unknown>;
    options: string[];
    correct: number;
    explanation: string;
  }>;
}

export interface CostOptimizerConfig {
  scenario: string;
  dimensions: Array<{
    name: string;
    unit: string;
    min: number;
    max: number;
    optimal: number;
  }>;
}

export interface ArchitectureBattleConfig {
  battles: Array<{
    scenario: string;
    options: Array<{ name: string; description: string }>;
    correct: number;
    explanation: string;
  }>;
}

export type GameConfig =
  | SpeedQuizConfig
  | PipelineBuilderConfig
  | CodeDebuggerConfig
  | ConceptMatcherConfig
  | ParameterTunerConfig
  | DiagnosisLabConfig
  | CostOptimizerConfig
  | ArchitectureBattleConfig;
