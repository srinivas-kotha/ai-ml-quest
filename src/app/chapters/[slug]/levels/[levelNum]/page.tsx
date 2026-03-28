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
import LearnPanel from "@/components/learn/LearnPanel";
import GamePanel from "@/components/games/GamePanel";
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

// ── Key insight banner ───────────────────────────────────────────────────────
function KeyInsightBanner({
  insight,
}: {
  insight: string;
  accentColor: string;
}) {
  return (
    <div
      className="mt-8 rounded-xl p-5 flex items-start gap-4"
      style={{
        backgroundColor: "rgba(255, 184, 0, 0.08)",
        border: "1px solid rgba(255, 184, 0, 0.20)",
        borderLeft: "4px solid var(--color-accent-gold)",
      }}
    >
      {/* Lightbulb icon */}
      <div
        className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0 text-lg"
        style={{
          backgroundColor: "rgba(255, 184, 0, 0.15)",
          border: "1px solid rgba(255, 184, 0, 0.25)",
        }}
        aria-hidden="true"
      >
        💡
      </div>
      <div>
        <p
          className="text-xs font-bold uppercase mb-1.5"
          style={{
            color: "var(--color-accent-gold)",
            letterSpacing: "1.5px",
          }}
        >
          Key Insight
        </p>
        <p
          className="text-sm leading-relaxed font-medium"
          style={{ color: "var(--color-text-secondary)" }}
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

        {/* Level header */}
        <div
          className="relative overflow-hidden rounded-2xl p-5 mb-6"
          style={{
            background: `linear-gradient(135deg, ${accentColor}10 0%, transparent 60%)`,
            border: `1px solid ${accentColor}25`,
            borderLeft: `4px solid ${accentColor}`,
            backgroundColor: "var(--color-bg-card)",
          }}
        >
          {/* Ambient glow */}
          <div
            className="absolute top-0 right-0 w-64 h-32 pointer-events-none"
            aria-hidden="true"
            style={{
              background: `radial-gradient(ellipse 200px 120px at 80% 20%, ${accentColor}12 0%, transparent 70%)`,
            }}
          />

          {/* Level badge + hook */}
          <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
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
                  className="font-bold"
                  style={{
                    color: "var(--color-text-primary)",
                    fontSize: "1.25rem",
                    fontFamily: "var(--font-display)",
                    letterSpacing: "-0.025em",
                  }}
                >
                  {level.title}
                </h1>
              </div>

              {/* Subtitle */}
              {level.subtitle && (
                <p
                  className="text-sm ml-9 mb-2"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {level.subtitle}
                </p>
              )}

              {/* Hook — editorial pull-quote */}
              {level.hook && (
                <blockquote
                  className="ml-9 mt-3 relative pl-12 pt-8 pb-4 pr-4 rounded-r-lg"
                  style={{
                    borderLeft: `4px solid ${accentColor}`,
                    backgroundColor: `${accentColor}06`,
                  }}
                >
                  {/* Large opening quote glyph */}
                  <span
                    aria-hidden="true"
                    className="absolute top-0 left-3 font-display leading-none select-none"
                    style={{
                      fontSize: "80px",
                      color: "var(--color-accent-gold)",
                      lineHeight: 1,
                      top: "-4px",
                    }}
                  >
                    &ldquo;
                  </span>
                  <p
                    className="font-display italic leading-relaxed"
                    style={{
                      color: "var(--color-text-primary)",
                      fontSize: "clamp(1rem, 2vw, 1.375rem)",
                    }}
                  >
                    {level.hook}
                  </p>
                  <footer
                    className="mt-2 text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    — Level {level.levelNumber} &middot; {chapter.title}
                  </footer>
                </blockquote>
              )}
            </div>

            {/* Meta: XP + time */}
            <div
              className="flex flex-col items-end gap-1.5 text-xs flex-shrink-0"
              style={{ color: "var(--color-text-muted)" }}
            >
              {level.xpReward && (
                <span
                  className="font-bold px-2 py-0.5 rounded-lg"
                  style={{
                    color: "var(--color-accent-gold)",
                    backgroundColor: "rgba(245, 158, 11, 0.10)",
                    border: "1px solid rgba(245, 158, 11, 0.20)",
                  }}
                >
                  +{level.xpReward} XP
                </span>
              )}
              {level.estimatedMinutes && (
                <span>{level.estimatedMinutes} min</span>
              )}
              <span style={{ color: "var(--color-text-muted)" }}>
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
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150"
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
