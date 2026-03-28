import { db } from "@/lib/db";
import { questChapters, questLevels } from "../../../../drizzle/schema";
import { eq, and, asc } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import Badge from "@/components/ui/Badge";

export const revalidate = 3600;

const CHAPTER_ACCENT: Record<string, string> = {
  "rag-pipeline": "var(--rag)",
  "local-slm": "var(--slm)",
  "ml-monitoring": "var(--monitoring)",
  "fine-tuning": "var(--finetuning)",
  multimodal: "var(--multimodal)",
  capstone: "var(--capstone)",
};

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

// Slugs of all published chapters (for generateStaticParams)
export async function generateStaticParams() {
  try {
    const rows = await db
      .select({ slug: questChapters.slug })
      .from(questChapters)
      .where(eq(questChapters.isPublished, true));
    return rows.map((r) => ({ slug: r.slug }));
  } catch {
    return [];
  }
}

async function getChapterWithLevels(slug: string) {
  try {
    const [chapter] = await db
      .select()
      .from(questChapters)
      .where(
        and(eq(questChapters.slug, slug), eq(questChapters.isPublished, true)),
      )
      .limit(1);

    if (!chapter) return null;

    const levels = await db
      .select({
        id: questLevels.id,
        levelNumber: questLevels.levelNumber,
        title: questLevels.title,
        subtitle: questLevels.subtitle,
        gameType: questLevels.gameType,
        xpReward: questLevels.xpReward,
        estimatedMinutes: questLevels.estimatedMinutes,
        keyInsight: questLevels.keyInsight,
      })
      .from(questLevels)
      .where(
        and(
          eq(questLevels.chapterId, chapter.id),
          eq(questLevels.isPublished, true),
        ),
      )
      .orderBy(asc(questLevels.levelNumber));

    return { chapter, levels };
  } catch {
    return null;
  }
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getChapterWithLevels(slug);

  if (!data) notFound();

  const { chapter, levels } = data;
  const accentColor =
    CHAPTER_ACCENT[slug] ?? chapter.accentColor ?? "var(--rag)";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav
        className="flex items-center gap-2 text-xs mb-8"
        aria-label="Breadcrumb"
      >
        <Link
          href="/"
          className="transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color =
              "var(--text-secondary)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color =
              "var(--text-muted)";
          }}
        >
          Hub
        </Link>
        <svg
          className="w-3 h-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          style={{ color: "var(--text-muted)" }}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span style={{ color: accentColor }}>{chapter.title}</span>
      </nav>

      {/* Chapter header */}
      <div
        className="rounded-2xl p-6 mb-8"
        style={{
          background: `linear-gradient(135deg, ${accentColor}14 0%, transparent 60%)`,
          border: `1px solid ${accentColor}30`,
          borderLeft: `4px solid ${accentColor}`,
        }}
      >
        <div className="flex items-start gap-4">
          <span className="text-3xl" aria-hidden="true">
            {chapter.icon ?? "🧠"}
          </span>
          <div>
            <h1 style={{ color: "var(--text-primary)", fontSize: "1.75rem" }}>
              {chapter.title}
            </h1>
            {chapter.subtitle && (
              <p
                className="mt-1 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {chapter.subtitle}
              </p>
            )}
            {chapter.description && (
              <p
                className="mt-3 text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {chapter.description}
              </p>
            )}
            <div className="flex items-center gap-3 mt-3">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {levels.length} level{levels.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Level list */}
      {levels.length === 0 ? (
        <div
          className="rounded-xl p-8 text-center"
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            No levels published yet. Check back soon.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {levels.map((level) => (
            <LevelCard
              key={level.id}
              level={level}
              chapterSlug={slug}
              accentColor={accentColor}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LevelCard({
  level,
  chapterSlug,
  accentColor,
}: {
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
}) {
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
