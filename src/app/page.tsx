import { db } from "@/lib/db";
import { questChapters, questLevels } from "../../drizzle/schema";
import { eq, count, sql } from "drizzle-orm";
import Link from "next/link";
import ChapterCard from "@/components/hub/ChapterCard";

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

// Stagger delay class map
const STAGGER = [
  "delay-1",
  "delay-2",
  "delay-3",
  "delay-4",
  "delay-5",
  "delay-6",
];

export default async function HubPage() {
  const chapters = await getChaptersWithLevelCounts();

  const totalLevels = chapters.reduce((sum, ch) => sum + ch.levelCount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <CourseJsonLd chapters={chapters} />

      {/* ── Hero Section ──────────────────────────────────────────── */}
      <section className="relative pt-20 pb-16 text-center">
        {/* Ambient glow behind hero text */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 600px 400px at 50% 60%, rgba(79, 70, 229, 0.10) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "var(--accent-teal)" }}
          >
            Interactive Learning Platform
          </p>

          <h1
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-gradient mb-5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            AI/ML Quest
          </h1>

          <p
            className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Master AI/ML Engineering through interactive challenges.
          </p>
          <p
            className="text-base max-w-xl mx-auto"
            style={{ color: "var(--text-muted)" }}
          >
            No prerequisites. No fluff. Built for engineers who ship.
          </p>

          <div className="mt-8 flex gap-3 justify-center flex-wrap">
            <Link
              href="#chapters"
              className="px-6 py-3 rounded-xl font-semibold text-white text-sm transition-all duration-200"
              style={{
                background:
                  "linear-gradient(135deg, var(--accent-teal), var(--accent-indigo))",
                boxShadow: "0 0 24px rgba(20, 184, 166, 0.25)",
              }}
            >
              Start Learning
            </Link>
            <Link
              href="/api/auth/signin"
              className="px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200"
              style={{
                border: "1px solid var(--border-hover)",
                color: "var(--text-secondary)",
                backgroundColor: "rgba(255,255,255,0.02)",
                textDecoration: "none",
              }}
            >
              Sign in with GitHub
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Row ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-10 md:gap-16 mb-16">
        <StatPill value={String(totalLevels || 54)} label="Levels" />
        <div
          className="w-px h-8"
          style={{ backgroundColor: "var(--border-hover)" }}
          aria-hidden="true"
        />
        <StatPill value="5" label="Chapters" />
        <div
          className="w-px h-8"
          style={{ backgroundColor: "var(--border-hover)" }}
          aria-hidden="true"
        />
        <StatPill value="8" label="Game Types" />
      </div>

      {/* ── Chapter Grid ──────────────────────────────────────────── */}
      <section id="chapters">
        <h2 className="sr-only">Chapters</h2>

        {chapters.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
            {chapters.map((chapter, i) => {
              const accentColor =
                CHAPTER_ACCENT[chapter.slug] ??
                chapter.accentColor ??
                "var(--rag)";
              const prereqs = Array.isArray(chapter.prerequisites)
                ? (chapter.prerequisites as string[])
                : [];
              const isLocked = false;
              const isFeatured = i === 0;

              return (
                <div
                  key={chapter.id}
                  className={`animate-fade-up ${STAGGER[i] ?? ""}`}
                  style={isFeatured ? { gridColumn: "span 2" } : undefined}
                >
                  <ChapterCard
                    chapter={chapter}
                    accentColor={accentColor}
                    isLocked={isLocked}
                    prereqs={prereqs}
                    isFeatured={isFeatured}
                    chapterIndex={i + 1}
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Guest sign-in banner ──────────────────────────────────── */}
      <GuestSignInBanner />

      {/* Bottom spacing */}
      <div className="h-16" />
    </div>
  );
}

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div
        className="text-3xl font-extrabold text-gradient"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {value}
      </div>
      <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
        {label}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="rounded-2xl p-16 text-center"
      style={{
        backgroundColor: "var(--card)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="text-5xl mb-4">🚧</div>
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
      className="mt-12 rounded-2xl p-6 flex items-center justify-between gap-4 flex-wrap"
      style={{
        background:
          "linear-gradient(135deg, rgba(20, 184, 166, 0.05) 0%, rgba(79, 70, 229, 0.05) 100%)",
        border: "1px solid rgba(20, 184, 166, 0.15)",
      }}
    >
      <div>
        <p
          className="text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Sync your progress across devices
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          Sign in with GitHub — free forever, no tracking.
        </p>
      </div>
      <Link
        href="/api/auth/signin"
        className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
        style={{
          background:
            "linear-gradient(135deg, rgba(20, 184, 166, 0.15), rgba(79, 70, 229, 0.15))",
          color: "var(--accent-teal)",
          border: "1px solid rgba(20, 184, 166, 0.25)",
          textDecoration: "none",
        }}
      >
        Sign in free
      </Link>
    </div>
  );
}
