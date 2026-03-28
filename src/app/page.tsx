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

// Game types for showcase section
const GAME_TYPES = [
  { icon: "⚡", name: "Speed Quiz" },
  { icon: "🔧", name: "Pipeline Builder" },
  { icon: "🐛", name: "Code Debugger" },
  { icon: "🔗", name: "Concept Matcher" },
  { icon: "🎛️", name: "Parameter Tuner" },
  { icon: "🔬", name: "Diagnosis Lab" },
  { icon: "💰", name: "Cost Optimizer" },
  { icon: "⚔️", name: "Architecture Battle" },
];

// Stagger class map — matches globals.css stagger-1..8
const STAGGER: string[] = [
  "stagger-1",
  "stagger-2",
  "stagger-3",
  "stagger-4",
  "stagger-5",
  "stagger-6",
  "stagger-7",
  "stagger-8",
];

export default async function HubPage() {
  const chapters = await getChaptersWithLevelCounts();
  const totalLevels = chapters.reduce((sum, ch) => sum + ch.levelCount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <CourseJsonLd chapters={chapters} />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-16 text-center">
        {/* Ambient gold glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 640px 420px at 50% 55%, rgba(255,184,0,0.07) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10">
          {/* Eyebrow */}
          <p
            className="text-xs font-medium uppercase tracking-eyebrow mb-5"
            style={{ color: "var(--color-accent-gold)" }}
          >
            Interactive Learning Platform
          </p>

          {/* H1 */}
          <h1
            className="font-display mb-5"
            style={{
              fontSize: "clamp(40px, 5.5vw, 88px)",
              fontWeight: 400,
              letterSpacing: "-0.75px",
              lineHeight: 1.05,
              color: "var(--color-text-primary)",
            }}
          >
            AI/ML{" "}
            <em
              style={{
                fontStyle: "italic",
                color: "var(--color-text-primary)",
              }}
            >
              Quest
            </em>
          </h1>

          {/* Subtitle */}
          <p
            className="max-w-xl mx-auto mb-8"
            style={{
              fontSize: "1.25rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.5,
            }}
          >
            The AI/ML course that doesn&apos;t start at &ldquo;what is a neural
            network.&rdquo;
          </p>

          {/* CTA row */}
          <div className="flex gap-3 justify-center flex-wrap mb-10">
            <Link href="#chapters" className="btn-3d">
              Start Free →
            </Link>
            <Link href="#chapters" className="btn-ghost">
              View Syllabus
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 md:gap-12 mb-10">
            <StatPill value={String(totalLevels || 54)} label="Levels" />
            <div
              className="w-px h-8 hidden sm:block"
              style={{ backgroundColor: "var(--color-border)" }}
              aria-hidden="true"
            />
            <StatPill value="5" label="Chapters" />
            <div
              className="w-px h-8 hidden sm:block"
              style={{ backgroundColor: "var(--color-border)" }}
              aria-hidden="true"
            />
            <StatPill value="8" label="Game Types" />
          </div>

          {/* Logo strip */}
          <p
            className="text-xs tracking-wide"
            style={{ color: "var(--color-text-muted)", opacity: 0.6 }}
          >
            Built for engineers working with:{" "}
            <span className="font-medium">
              HuggingFace · LangChain · PyTorch · Ollama · pgvector
            </span>
          </p>
        </div>
      </section>

      {/* ── Chapter Bento Grid ────────────────────────────────────── */}
      <section id="chapters" className="pt-6 pb-4">
        <h2
          className="font-display text-3xl mb-8"
          style={{ fontWeight: 400, letterSpacing: "-0.02em" }}
        >
          Chapters
        </h2>

        {chapters.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="chapter-bento-grid">
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
              // Last chapter (capstone) gets span-2 as well
              const isCapstone =
                i === chapters.length - 1 && chapters.length > 1;

              return (
                <div
                  key={chapter.id}
                  className={`animate-fade-up ${STAGGER[i] ?? ""} ${
                    isFeatured ? "bento-featured" : ""
                  } ${isCapstone ? "bento-capstone" : ""}`}
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

      {/* ── Second CTA ────────────────────────────────────────────── */}
      <div className="text-center py-12">
        <Link href="#chapters" className="btn-3d">
          Start Learning →
        </Link>
      </div>

      {/* ── How It Works ──────────────────────────────────────────── */}
      <section className="py-16 max-w-4xl mx-auto">
        <h2
          className="font-display text-center mb-12"
          style={{
            fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
            fontWeight: 400,
            letterSpacing: "-0.02em",
          }}
        >
          How it works
        </h2>

        <div className="how-it-works-grid">
          {/* Step 1 */}
          <HowItWorksStep
            number="1"
            title="Pick a Level"
            body="Choose from 54 levels across 5 chapters covering the full AI/ML engineering stack — from RAG pipelines to multimodal systems."
            delay="stagger-1"
          />

          {/* Dashed connector */}
          <div className="how-it-works-connector" aria-hidden="true" />

          {/* Step 2 */}
          <HowItWorksStep
            number="2"
            title="Learn &amp; Play"
            body="Each level teaches a concept with interactive diagrams, annotated code, and live sliders — then tests you with a hands-on challenge."
            delay="stagger-2"
          />

          {/* Dashed connector */}
          <div className="how-it-works-connector" aria-hidden="true" />

          {/* Step 3 */}
          <HowItWorksStep
            number="3"
            title="Master AI/ML"
            body="Build real skills you can use in production and articulate in interviews. Every level ends with a one-sentence insight to own."
            delay="stagger-3"
          />
        </div>
      </section>

      {/* ── 8 Ways to Learn ───────────────────────────────────────── */}
      <section className="py-16 max-w-4xl mx-auto">
        <h2
          className="font-display text-center mb-8"
          style={{
            fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
            fontWeight: 400,
            letterSpacing: "-0.02em",
          }}
        >
          8 ways to learn
        </h2>

        <div className="game-types-grid">
          {GAME_TYPES.map((game, i) => (
            <div
              key={game.name}
              className={`game-type-tile animate-fade-up ${STAGGER[i]}`}
            >
              <span className="game-type-icon" aria-hidden="true">
                {game.icon}
              </span>
              <p
                className="text-sm font-medium mt-2"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {game.name}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── What is AI/ML Quest? (Value Props) ────────────────────── */}
      <section className="py-16 max-w-4xl mx-auto">
        <h2
          className="font-display text-center mb-10"
          style={{
            fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
            fontWeight: 400,
            letterSpacing: "-0.02em",
          }}
        >
          Not another course. An interactive challenge.
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <ValuePropCard
            icon="🎮"
            title="Learn by Playing"
            body="8 interactive game types — drag pipelines, debug code, tune parameters, battle architectures. No passive video watching."
            delay="stagger-1"
          />
          <ValuePropCard
            icon="🏭"
            title="Production, Not Theory"
            body="Real costs, real latencies, real architecture decisions. Every concept includes production benchmarks and enterprise examples."
            delay="stagger-2"
          />
          <ValuePropCard
            icon="💼"
            title="Interview Ready"
            body="Every level ends with a one-sentence insight you can use in interviews. Built to help you land AI Engineering roles."
            delay="stagger-3"
          />
        </div>
      </section>

      {/* ── Guest sign-in banner ──────────────────────────────────── */}
      <GuestSignInBanner />

      {/* Bottom spacing */}
      <div className="h-16" />
    </div>
  );
}

/* ── Sub-components ────────────────────────────────────────────── */

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div
        className="font-display"
        style={{
          fontSize: "2rem",
          fontWeight: 700,
          color: "var(--color-accent-gold)",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        className="text-xs mt-1"
        style={{ color: "var(--color-text-muted)" }}
      >
        {label}
      </div>
    </div>
  );
}

function HowItWorksStep({
  number,
  title,
  body,
  delay,
}: {
  number: string;
  title: string;
  body: string;
  delay: string;
}) {
  return (
    <div className={`how-it-works-step animate-fade-up ${delay}`}>
      {/* Step badge */}
      <div
        className="font-display flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold mb-4 mx-auto lg:mx-0 flex-shrink-0"
        style={{
          backgroundColor: "var(--color-accent-gold)",
          color: "var(--color-bg-primary)",
          fontWeight: 700,
        }}
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: number }}
      />
      <h3
        className="font-display text-lg mb-2 text-center lg:text-left"
        style={{ fontWeight: 600, letterSpacing: "-0.01em" }}
      >
        {title}
      </h3>
      <p
        className="text-sm text-center lg:text-left"
        style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </div>
  );
}

function ValuePropCard({
  icon,
  title,
  body,
  delay,
}: {
  icon: string;
  title: string;
  body: string;
  delay: string;
}) {
  return (
    <div
      className={`value-prop-card animate-fade-up ${delay}`}
      style={{
        backgroundColor: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div className="value-prop-icon" aria-hidden="true">
        {icon}
      </div>
      <h3
        className="font-display text-lg mb-2"
        style={{ fontWeight: 600, letterSpacing: "-0.01em" }}
      >
        {title}
      </h3>
      <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
        {body}
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="rounded-2xl p-16 text-center"
      style={{
        backgroundColor: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div className="text-5xl mb-4">🚧</div>
      <h2
        className="text-lg font-semibold mb-2"
        style={{ color: "var(--color-text-primary)" }}
      >
        Content loading
      </h2>
      <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
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
          "linear-gradient(135deg, rgba(255,184,0,0.06) 0%, rgba(79,70,229,0.06) 100%)",
        border: "1px solid rgba(255,184,0,0.15)",
      }}
    >
      <div>
        <p
          className="text-sm font-semibold"
          style={{ color: "var(--color-text-primary)" }}
        >
          Sync your progress across devices
        </p>
        <p
          className="text-xs mt-1"
          style={{ color: "var(--color-text-muted)" }}
        >
          Sign in with GitHub — free forever, no tracking.
        </p>
      </div>
      <Link
        href="/api/auth/signin"
        className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,184,0,0.15), rgba(79,70,229,0.15))",
          color: "var(--color-accent-gold)",
          border: "1px solid rgba(255,184,0,0.25)",
          textDecoration: "none",
          transition: "border-color 200ms ease-out, color 200ms ease-out",
        }}
      >
        Sign in free
      </Link>
    </div>
  );
}
