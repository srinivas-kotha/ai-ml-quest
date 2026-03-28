import { db } from "@/lib/db";
import {
  questChapters,
  questLevels,
  questLearnSections,
} from "../../../../../../drizzle/schema";
import { eq, and, asc } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import LearnPanel from "@/components/learn/LearnPanel";
import GamePanel from "@/components/games/GamePanel";
import type { LearnSection, GameType, GameConfig } from "@/types/content";

export const revalidate = 3600;

// ── Chapter accent mapping (mirrors page.tsx) ───────────────────────────────
const CHAPTER_ACCENT: Record<string, string> = {
  "rag-pipeline": "var(--rag)",
  "local-slm": "var(--slm)",
  "ml-monitoring": "var(--monitoring)",
  "fine-tuning": "var(--finetuning)",
  multimodal: "var(--multimodal)",
  capstone: "var(--capstone)",
};

// ── Static params (SSG) ──────────────────────────────────────────────────────
export async function generateStaticParams() {
  try {
    const rows = await db
      .select({
        slug: questChapters.slug,
        levelNumber: questLevels.levelNumber,
      })
      .from(questLevels)
      .innerJoin(questChapters, eq(questLevels.chapterId, questChapters.id))
      .where(
        and(
          eq(questChapters.isPublished, true),
          eq(questLevels.isPublished, true),
        ),
      );

    return rows.map((r) => ({
      slug: r.slug,
      levelNum: String(r.levelNumber),
    }));
  } catch {
    return [];
  }
}

// ── Data fetching ─────────────────────────────────────────────────────────────
async function getLevelData(slug: string, levelNum: number) {
  try {
    // Fetch chapter
    const [chapter] = await db
      .select()
      .from(questChapters)
      .where(
        and(eq(questChapters.slug, slug), eq(questChapters.isPublished, true)),
      )
      .limit(1);

    if (!chapter) return null;

    // Fetch this level
    const [level] = await db
      .select()
      .from(questLevels)
      .where(
        and(
          eq(questLevels.chapterId, chapter.id),
          eq(questLevels.levelNumber, levelNum),
          eq(questLevels.isPublished, true),
        ),
      )
      .limit(1);

    if (!level) return null;

    // Fetch learn sections ordered by sort_order
    const learnSections = await db
      .select()
      .from(questLearnSections)
      .where(eq(questLearnSections.levelId, level.id))
      .orderBy(asc(questLearnSections.sortOrder));

    // Fetch adjacent levels for navigation
    const allLevels = await db
      .select({
        id: questLevels.id,
        levelNumber: questLevels.levelNumber,
        title: questLevels.title,
      })
      .from(questLevels)
      .where(
        and(
          eq(questLevels.chapterId, chapter.id),
          eq(questLevels.isPublished, true),
        ),
      )
      .orderBy(asc(questLevels.levelNumber));

    const currentIndex = allLevels.findIndex((l) => l.levelNumber === levelNum);
    const prevLevel = currentIndex > 0 ? allLevels[currentIndex - 1] : null;
    const nextLevel =
      currentIndex < allLevels.length - 1 ? allLevels[currentIndex + 1] : null;

    return {
      chapter,
      level,
      learnSections,
      prevLevel,
      nextLevel,
      totalLevels: allLevels.length,
    };
  } catch {
    return null;
  }
}

// ── Chevron icon (inline) ────────────────────────────────────────────────────
function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

// ── Key insight banner ───────────────────────────────────────────────────────
function KeyInsightBanner({
  insight,
  accentColor,
}: {
  insight: string;
  accentColor: string;
}) {
  return (
    <div
      className="mt-8 rounded-xl p-4 flex items-start gap-3"
      style={{
        background: `linear-gradient(135deg, ${accentColor}10 0%, transparent 70%)`,
        border: `1px solid ${accentColor}30`,
      }}
    >
      <span className="text-lg flex-shrink-0" aria-hidden="true">
        💡
      </span>
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-1"
          style={{ color: accentColor }}
        >
          Key Insight
        </p>
        <p
          className="text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {insight}
        </p>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function LevelPage({
  params,
}: {
  params: Promise<{ slug: string; levelNum: string }>;
}) {
  const { slug, levelNum: levelNumStr } = await params;
  const levelNum = Number(levelNumStr);

  if (!Number.isInteger(levelNum) || levelNum < 1) notFound();

  const [data, session] = await Promise.all([
    getLevelData(slug, levelNum),
    auth(),
  ]);
  if (!data) notFound();

  const { chapter, level, learnSections, prevLevel, nextLevel, totalLevels } =
    data;

  const accentColor =
    CHAPTER_ACCENT[slug] ?? chapter.accentColor ?? "var(--rag)";

  // Cast DB types to our content types
  const typedLearnSections = learnSections as unknown as LearnSection[];
  const gameType = level.gameType as GameType;
  const gameConfig = level.gameConfig as unknown as GameConfig;

  const nextLevelUrl = nextLevel
    ? `/chapters/${slug}/levels/${nextLevel.levelNumber}`
    : null;
  const chapterUrl = `/chapters/${slug}`;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav
          className="flex items-center gap-1.5 text-xs mb-6"
          aria-label="Breadcrumb"
        >
          <Link
            href="/"
            className="transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            Hub
          </Link>
          <ChevronRight className="opacity-30" />
          <Link
            href={`/chapters/${slug}`}
            className="transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            {chapter.title}
          </Link>
          <ChevronRight className="opacity-30" />
          <span style={{ color: accentColor }}>Level {level.levelNumber}</span>
        </nav>

        {/* Level header */}
        <div
          className="rounded-2xl p-5 mb-6"
          style={{
            background: `linear-gradient(135deg, ${accentColor}10 0%, transparent 60%)`,
            border: `1px solid ${accentColor}25`,
            borderLeft: `4px solid ${accentColor}`,
          }}
        >
          {/* Level badge + hook */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              {/* Level number + title */}
              <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                <span
                  className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold flex-shrink-0"
                  style={{
                    backgroundColor: `${accentColor}20`,
                    color: accentColor,
                    border: `1px solid ${accentColor}40`,
                  }}
                >
                  {level.levelNumber}
                </span>
                <h1
                  className="text-xl font-bold"
                  style={{
                    color: "var(--text-primary)",
                    fontSize: "1.25rem",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {level.title}
                </h1>
              </div>

              {/* Subtitle */}
              {level.subtitle && (
                <p
                  className="text-sm ml-9 mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {level.subtitle}
                </p>
              )}

              {/* Hook (enterprise pain point) */}
              {level.hook && (
                <blockquote
                  className="ml-9 mt-2 pl-3 text-sm italic leading-relaxed"
                  style={{
                    color: "var(--text-secondary)",
                    borderLeft: `2px solid ${accentColor}50`,
                  }}
                >
                  {level.hook}
                </blockquote>
              )}
            </div>

            {/* Meta: XP + time */}
            <div
              className="flex items-center gap-3 text-xs flex-shrink-0"
              style={{ color: "var(--text-muted)" }}
            >
              {level.estimatedMinutes && (
                <span>{level.estimatedMinutes} min</span>
              )}
              {level.xpReward && (
                <span
                  className="font-semibold"
                  style={{ color: "var(--success)" }}
                >
                  +{level.xpReward} XP
                </span>
              )}
              <span>
                {level.levelNumber} / {totalLevels}
              </span>
            </div>
          </div>
        </div>

        {/* Main two-column layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Learn panel — 60% on desktop */}
          <div className="w-full lg:w-[60%]">
            <LearnPanel
              learnSections={typedLearnSections}
              accentColor={accentColor}
              className="min-h-[400px]"
            />
          </div>

          {/* Game panel — 40% on desktop, sticky on scroll */}
          <div className="w-full lg:w-[40%] lg:sticky lg:top-6">
            <GamePanel
              gameType={gameType}
              gameConfig={gameConfig}
              accentColor={accentColor}
              levelTitle={level.title}
              levelId={level.id}
              chapterId={chapter.id}
              chapterSlug={slug}
              xpReward={level.xpReward ?? 100}
              keyInsight={level.keyInsight ?? null}
              nextLevelUrl={nextLevelUrl}
              backUrl={chapterUrl}
              isAuthenticated={!!session?.user?.id}
            />
          </div>
        </div>

        {/* Key insight */}
        {level.keyInsight && (
          <KeyInsightBanner
            insight={level.keyInsight}
            accentColor={accentColor}
          />
        )}

        {/* Level navigation */}
        <nav
          className="mt-8 flex items-center justify-between gap-4"
          aria-label="Level navigation"
        >
          {prevLevel ? (
            <Link
              href={`/chapters/${slug}/levels/${prevLevel.levelNumber}`}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150"
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
                textDecoration: "none",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
              <span className="hidden sm:inline">{prevLevel.title}</span>
              <span className="sm:hidden">Level {prevLevel.levelNumber}</span>
            </Link>
          ) : (
            // Back to chapter when on level 1
            <Link
              href={`/chapters/${slug}`}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150"
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
                textDecoration: "none",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
              All levels
            </Link>
          )}

          {nextLevel ? (
            <Link
              href={`/chapters/${slug}/levels/${nextLevel.levelNumber}`}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150"
              style={{
                backgroundColor: `${accentColor}18`,
                border: `1px solid ${accentColor}35`,
                color: accentColor,
                textDecoration: "none",
              }}
            >
              <span className="hidden sm:inline">{nextLevel.title}</span>
              <span className="sm:hidden">Level {nextLevel.levelNumber}</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          ) : (
            // Chapter complete
            <Link
              href={`/chapters/${slug}`}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150"
              style={{
                backgroundColor: `${accentColor}18`,
                border: `1px solid ${accentColor}35`,
                color: accentColor,
                textDecoration: "none",
              }}
            >
              Chapter complete 🎉
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
}
