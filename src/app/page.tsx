import { db } from "@/lib/db";
import { questChapters, questLevels } from "../../drizzle/schema";
import { eq, count, sql } from "drizzle-orm";
import Link from "next/link";
import ChapterProgressOverlay from "@/components/hub/ChapterProgressOverlay";

export const dynamic = "force-dynamic"; // Always fetch fresh from DB

// Chapter slug → accent CSS variable mapping
const CHAPTER_ACCENT: Record<string, string> = {
  "rag-pipeline": "var(--rag)",
  "local-slm": "var(--slm)",
  "ml-monitoring": "var(--monitoring)",
  "fine-tuning": "var(--finetuning)",
  multimodal: "var(--multimodal)",
  capstone: "var(--capstone)",
};

function LockIcon() {
  return (
    <svg
      className="w-4 h-4 opacity-50"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}

interface ChapterWithCount {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  icon: string | null;
  accentColor: string | null;
  sortOrder: number;
  prerequisites: unknown;
  levelCount: number;
}

async function getChaptersWithLevelCounts(): Promise<ChapterWithCount[]> {
  try {
    const rows = await db
      .select({
        id: questChapters.id,
        slug: questChapters.slug,
        title: questChapters.title,
        subtitle: questChapters.subtitle,
        icon: questChapters.icon,
        accentColor: questChapters.accentColor,
        sortOrder: questChapters.sortOrder,
        prerequisites: questChapters.prerequisites,
        levelCount: count(questLevels.id),
      })
      .from(questChapters)
      .leftJoin(
        questLevels,
        sql`${questLevels.chapterId} = ${questChapters.id} AND ${questLevels.isPublished} = true`,
      )
      .where(eq(questChapters.isPublished, true))
      .groupBy(questChapters.id)
      .orderBy(questChapters.sortOrder);

    return rows.map((r) => ({ ...r, levelCount: Number(r.levelCount) }));
  } catch {
    // DB not yet seeded or not available during build
    return [];
  }
}

function CourseJsonLd({ chapters }: { chapters: ChapterWithCount[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "AI/ML Quest",
    description:
      "Interactive AI/ML learning platform for enterprise engineers pivoting to AI. Master RAG, fine-tuning, local SLMs, monitoring, and multimodal AI through hands-on challenges.",
    url: "https://quest.srinivaskotha.uk",
    provider: {
      "@type": "Person",
      name: "Srinivas Kotha",
      url: "https://srinivaskotha.uk",
    },
    educationalLevel: "Advanced",
    inLanguage: "en",
    isAccessibleForFree: true,
    hasCourseInstance: chapters.map((ch) => ({
      "@type": "CourseInstance",
      name: ch.title,
      description: ch.subtitle ?? undefined,
      url: `https://quest.srinivaskotha.uk/chapters/${ch.slug}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function HubPage() {
  const chapters = await getChaptersWithLevelCounts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <CourseJsonLd chapters={chapters} />
      {/* Header */}
      <div className="mb-10">
        <h1 className="mb-2" style={{ color: "var(--text-primary)" }}>
          AI/ML Quest
        </h1>
        <p
          className="text-base max-w-xl"
          style={{ color: "var(--text-secondary)" }}
        >
          Enterprise-framed AI/ML learning for engineers who already know
          backend systems. Pick a chapter and start building.
        </p>
      </div>

      {/* Chapter grid */}
      {chapters.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {chapters.map((chapter) => {
            const accentColor =
              CHAPTER_ACCENT[chapter.slug] ??
              chapter.accentColor ??
              "var(--rag)";
            const prereqs = Array.isArray(chapter.prerequisites)
              ? (chapter.prerequisites as string[])
              : [];
            const isLocked = false; // prerequisite check implemented in Phase 1B with auth

            return (
              <ChapterCard
                key={chapter.id}
                chapter={chapter}
                accentColor={accentColor}
                isLocked={isLocked}
                prereqs={prereqs}
              />
            );
          })}
        </div>
      )}

      {/* Guest sign-in banner */}
      <GuestSignInBanner />
    </div>
  );
}

function ChapterCard({
  chapter,
  accentColor,
  isLocked,
  prereqs,
}: {
  chapter: ChapterWithCount;
  accentColor: string;
  isLocked: boolean;
  prereqs: string[];
}) {
  const cardInner = (
    <div
      className="relative rounded-2xl p-5 h-full flex flex-col transition-all duration-200"
      style={{
        backgroundColor: "var(--card)",
        border: `1px solid var(--border)`,
        borderLeft: `3px solid ${accentColor}`,
        opacity: isLocked ? 0.6 : 1,
      }}
    >
      {/* Icon + lock */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl" aria-hidden="true">
          {chapter.icon ?? "🧠"}
        </span>
        {isLocked && <LockIcon />}
      </div>

      {/* Title + subtitle */}
      <h2
        className="mb-1 font-semibold"
        style={{
          color: "var(--text-primary)",
          fontSize: "1rem",
          fontWeight: 600,
          letterSpacing: "-0.01em",
        }}
      >
        {chapter.title}
      </h2>
      {chapter.subtitle && (
        <p
          className="text-sm mb-3 flex-1"
          style={{ color: "var(--text-secondary)", lineHeight: "1.5" }}
        >
          {chapter.subtitle}
        </p>
      )}

      {/* Level count */}
      <div className="flex items-center gap-1.5 mt-auto">
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          style={{ color: accentColor }}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {chapter.levelCount} level{chapter.levelCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Progress overlay — client component reads session + localStorage */}
      {!isLocked && (
        <ChapterProgressOverlay
          chapterId={chapter.id}
          totalLevels={chapter.levelCount}
          accentColor={accentColor}
        />
      )}
    </div>
  );

  if (isLocked) {
    return (
      <div
        className="cursor-not-allowed"
        title={
          prereqs.length > 0 ? `Requires: ${prereqs.join(", ")}` : "Locked"
        }
      >
        {cardInner}
      </div>
    );
  }

  return (
    <Link
      href={`/chapters/${chapter.slug}`}
      className="block"
      style={{ textDecoration: "none" }}
      onMouseEnter={(e) => {
        const card = e.currentTarget.querySelector(
          ".rounded-2xl",
        ) as HTMLDivElement | null;
        if (card) {
          card.style.backgroundColor = "var(--card-hover)";
          card.style.borderColor = "var(--border-hover)";
          card.style.transform = "translateY(-2px)";
          card.style.boxShadow = `0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px ${accentColor}33`;
        }
      }}
      onMouseLeave={(e) => {
        const card = e.currentTarget.querySelector(
          ".rounded-2xl",
        ) as HTMLDivElement | null;
        if (card) {
          card.style.backgroundColor = "var(--card)";
          card.style.borderColor = "var(--border)";
          card.style.transform = "";
          card.style.boxShadow = "";
        }
      }}
    >
      {cardInner}
    </Link>
  );
}

function EmptyState() {
  return (
    <div
      className="rounded-2xl p-12 text-center"
      style={{
        backgroundColor: "var(--card)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="text-4xl mb-4">🚧</div>
      <h2
        className="text-lg font-semibold mb-2"
        style={{ color: "var(--text-primary)" }}
      >
        Content loading
      </h2>
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        Chapters will appear once the database is seeded.
      </p>
    </div>
  );
}

function GuestSignInBanner() {
  return (
    <div
      className="mt-10 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap"
      style={{
        backgroundColor: "rgba(59, 130, 246, 0.06)",
        border: "1px solid rgba(59, 130, 246, 0.15)",
      }}
    >
      <div>
        <p
          className="text-sm font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          Sync your progress across devices
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          Sign in with GitHub to save your progress to the cloud.
        </p>
      </div>
      <Link
        href="/api/auth/signin"
        className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
        style={{
          backgroundColor: "rgba(59, 130, 246, 0.15)",
          color: "#3b82f6",
          border: "1px solid rgba(59, 130, 246, 0.3)",
          textDecoration: "none",
        }}
      >
        Sign in free
      </Link>
    </div>
  );
}
