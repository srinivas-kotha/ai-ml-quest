import { db } from "@/lib/db";
import {
  questChapters,
  questLevels,
  questLearnSections,
} from "../../../../../../drizzle/schema";
import { eq, and, asc } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import LevelPageClient from "@/components/level/LevelPageClient";
import type { LearnSection, GameType, GameConfig } from "@/types/content";

export const dynamic = "force-dynamic";

// ── Chapter accent mapping (mirrors page.tsx) ───────────────────────────────
const CHAPTER_ACCENT: Record<string, string> = {
  "rag-pipeline": "var(--rag)",
  "local-slm": "var(--slm)",
  "ml-monitoring": "var(--monitoring)",
  "fine-tuning": "var(--finetuning)",
  multimodal: "var(--multimodal)",
  capstone: "var(--capstone)",
};

// ── Per-level metadata ────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; levelNum: string }>;
}): Promise<Metadata> {
  const { slug, levelNum: levelNumStr } = await params;
  const levelNum = Number(levelNumStr);

  if (!Number.isInteger(levelNum) || levelNum < 1) return {};

  try {
    const [row] = await db
      .select({
        levelTitle: questLevels.title,
        levelSubtitle: questLevels.subtitle,
        chapterTitle: questChapters.title,
      })
      .from(questLevels)
      .innerJoin(questChapters, eq(questLevels.chapterId, questChapters.id))
      .where(
        and(
          eq(questChapters.slug, slug),
          eq(questLevels.levelNumber, levelNum),
          eq(questChapters.isPublished, true),
          eq(questLevels.isPublished, true),
        ),
      )
      .limit(1);

    if (!row) return {};

    const description =
      row.levelSubtitle ??
      `Level ${levelNum} of ${row.chapterTitle} — interactive AI/ML challenge on AI/ML Quest.`;

    return {
      title: `${row.levelTitle} — ${row.chapterTitle}`,
      description,
      openGraph: {
        title: `${row.levelTitle} | ${row.chapterTitle} | AI/ML Quest`,
        description,
        url: `https://quest.srinivaskotha.uk/chapters/${slug}/levels/${levelNum}`,
      },
    };
  } catch {
    return {};
  }
}

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
  // Sort sections by sortOrder before passing to the client
  const sortedSections = [...typedLearnSections].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
  const gameType = level.gameType as GameType;
  const gameConfig = level.gameConfig as unknown as GameConfig;

  const nextLevelUrl = nextLevel
    ? `/chapters/${slug}/levels/${nextLevel.levelNumber}`
    : null;
  const chapterUrl = `/chapters/${slug}`;

  const learningResourceJsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: level.title,
    description:
      level.subtitle ??
      `Level ${level.levelNumber} of ${chapter.title} on AI/ML Quest.`,
    url: `https://quest.srinivaskotha.uk/chapters/${slug}/levels/${level.levelNumber}`,
    isPartOf: {
      "@type": "Course",
      name: chapter.title,
      url: `https://quest.srinivaskotha.uk/chapters/${slug}`,
    },
    educationalLevel: "Advanced",
    inLanguage: "en",
    isAccessibleForFree: true,
    provider: {
      "@type": "Person",
      name: "Srinivas Kotha",
      url: "https://srinivaskotha.uk",
    },
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-bg-primary)" }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(learningResourceJsonLd),
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav
          className="flex items-center gap-1.5 text-xs mb-6"
          aria-label="Breadcrumb"
        >
          <Link
            href="/"
            className="transition-colors"
            style={{ color: "var(--color-text-muted)" }}
          >
            Hub
          </Link>
          <ChevronRight className="opacity-30" />
          <Link
            href={`/chapters/${slug}`}
            className="transition-colors"
            style={{ color: "var(--color-text-muted)" }}
          >
            {chapter.title}
          </Link>
          <ChevronRight className="opacity-30" />
          <span style={{ color: accentColor }}>Level {level.levelNumber}</span>
        </nav>

        {/* Step-flow layout: sidebar outline + card-by-card content (includes collapsible header) */}
        <LevelPageClient
          learnSections={sortedSections}
          accentColor={accentColor}
          gameType={gameType}
          gameConfig={gameConfig}
          levelTitle={level.title}
          levelId={level.id}
          levelNum={level.levelNumber}
          chapterId={chapter.id}
          chapterSlug={slug}
          chapterTitle={chapter.title}
          xpReward={level.xpReward ?? 100}
          keyInsight={level.keyInsight ?? null}
          nextLevelUrl={nextLevelUrl}
          backUrl={chapterUrl}
          isAuthenticated={!!session?.user?.id}
          levelSubtitle={level.subtitle ?? null}
          hookQuote={level.hook ?? null}
          totalLevels={totalLevels}
          estimatedMinutes={level.estimatedMinutes ?? null}
        />

        {/* Level navigation */}
        <nav
          className="mt-8 flex items-center justify-between gap-4"
          aria-label="Level navigation"
        >
          {prevLevel ? (
            <Link
              href={`/chapters/${slug}/levels/${prevLevel.levelNumber}`}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-[background-color,border-color,color] duration-150"
              style={{
                backgroundColor: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-secondary)",
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
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-[background-color,border-color,color] duration-150"
              style={{
                backgroundColor: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-secondary)",
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
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-[background-color,border-color,color] duration-150"
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
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-[background-color,border-color,color] duration-150"
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
