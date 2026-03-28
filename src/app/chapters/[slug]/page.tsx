import { db } from "@/lib/db";
import { questChapters, questLevels } from "../../../../drizzle/schema";
import { eq, and, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import LevelCard from "@/components/chapters/LevelCard";
import BreadcrumbLink from "@/components/chapters/BreadcrumbLink";

export const dynamic = "force-dynamic";

const CHAPTER_ACCENT: Record<string, string> = {
  "rag-pipeline": "var(--rag)",
  "local-slm": "var(--slm)",
  "ml-monitoring": "var(--monitoring)",
  "fine-tuning": "var(--finetuning)",
  multimodal: "var(--multimodal)",
  capstone: "var(--capstone)",
};

// Per-chapter metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const [chapter] = await db
      .select({
        title: questChapters.title,
        subtitle: questChapters.subtitle,
        description: questChapters.description,
      })
      .from(questChapters)
      .where(
        and(eq(questChapters.slug, slug), eq(questChapters.isPublished, true)),
      )
      .limit(1);

    if (!chapter) return {};

    const description =
      chapter.description ??
      chapter.subtitle ??
      `Learn ${chapter.title} through interactive challenges on AI/ML Quest.`;

    return {
      title: chapter.title,
      description,
      openGraph: {
        title: `${chapter.title} | AI/ML Quest`,
        description,
        url: `https://quest.srinivaskotha.uk/chapters/${slug}`,
      },
    };
  } catch {
    return {};
  }
}

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
        <BreadcrumbLink href="/">Hub</BreadcrumbLink>
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
        className="relative overflow-hidden rounded-2xl p-6 mb-8"
        style={{
          background: `linear-gradient(135deg, ${accentColor}10 0%, rgba(9,9,11,0) 60%)`,
          border: `1px solid ${accentColor}30`,
          borderLeft: `4px solid ${accentColor}`,
          backgroundColor: "var(--card)",
        }}
      >
        {/* Ambient glow */}
        <div
          className="absolute top-0 right-0 w-72 h-40 pointer-events-none"
          aria-hidden="true"
          style={{
            background: `radial-gradient(ellipse 240px 160px at 80% 20%, ${accentColor}15 0%, transparent 70%)`,
          }}
        />
        <div className="relative z-10 flex items-start gap-4">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-xl text-2xl flex-shrink-0"
            style={{
              backgroundColor: `${accentColor}18`,
              border: `1px solid ${accentColor}30`,
            }}
            aria-hidden="true"
          >
            {chapter.icon ?? "🧠"}
          </div>
          <div className="flex-1 min-w-0">
            <h1
              style={{
                color: "var(--text-primary)",
                fontSize: "1.75rem",
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
              }}
            >
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
            <div className="flex items-center gap-3 mt-4">
              <span
                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-medium"
                style={{
                  backgroundColor: `${accentColor}15`,
                  color: accentColor,
                  border: `1px solid ${accentColor}25`,
                }}
              >
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
          {levels.map((level, i) => (
            <div
              key={level.id}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <LevelCard
                level={level}
                chapterSlug={slug}
                accentColor={accentColor}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
