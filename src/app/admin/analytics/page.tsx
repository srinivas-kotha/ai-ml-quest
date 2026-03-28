import { db } from "@/lib/db";
import {
  questLevelAnalytics,
  questLevels,
  questChapters,
  questUsers,
  questUserStats,
} from "../../../../drizzle/schema";
import { eq, gte, count, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Analytics — Admin",
};

async function getAnalyticsOverview() {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [totalUsersResult] = await db.select({ n: count() }).from(questUsers);
    const [activeUsersResult] = await db
      .select({ n: count() })
      .from(questUsers)
      .where(gte(questUsers.lastActiveAt, sevenDaysAgo));

    // Chapter completion rates
    const chapterRows = await db
      .select({
        chapterId: questChapters.id,
        chapterTitle: questChapters.title,
        chapterSlug: questChapters.slug,
        totalLevels: count(questLevels.id),
      })
      .from(questChapters)
      .leftJoin(
        questLevels,
        sql`${questLevels.chapterId} = ${questChapters.id} AND ${questLevels.isPublished} = true`,
      )
      .groupBy(questChapters.id, questChapters.title, questChapters.slug)
      .orderBy(questChapters.sortOrder);

    // Aggregate analytics across all levels
    const levelAnalyticsRows = await db
      .select({
        levelId: questLevelAnalytics.levelId,
        title: questLevels.title,
        chapterTitle: questChapters.title,
        totalAttempts: questLevelAnalytics.totalAttempts,
        totalCompletions: questLevelAnalytics.totalCompletions,
        avgScore: questLevelAnalytics.avgScore,
        avgTimeSeconds: questLevelAnalytics.avgTimeSeconds,
        dropOffRate: questLevelAnalytics.dropOffRate,
      })
      .from(questLevelAnalytics)
      .innerJoin(questLevels, eq(questLevelAnalytics.levelId, questLevels.id))
      .innerJoin(questChapters, eq(questLevels.chapterId, questChapters.id));

    // Top 5 hardest (highest drop_off_rate)
    const hardestLevels = [...levelAnalyticsRows]
      .filter((r) => r.dropOffRate !== null)
      .sort((a, b) => Number(b.dropOffRate) - Number(a.dropOffRate))
      .slice(0, 5);

    // Top 5 easiest (highest avg_score)
    const easiestLevels = [...levelAnalyticsRows]
      .filter((r) => r.avgScore !== null)
      .sort((a, b) => Number(b.avgScore) - Number(a.avgScore))
      .slice(0, 5);

    // Avg time across all levels
    const levelsWithTime = levelAnalyticsRows.filter(
      (r) => r.avgTimeSeconds !== null,
    );
    const avgTimePerLevel =
      levelsWithTime.length > 0
        ? Math.round(
            levelsWithTime.reduce(
              (sum, r) => sum + (r.avgTimeSeconds ?? 0),
              0,
            ) / levelsWithTime.length,
          )
        : 0;

    return {
      totalUsers: Number(totalUsersResult.n),
      activeUsers: Number(activeUsersResult.n),
      chapterRows: chapterRows.map((r) => ({
        ...r,
        totalLevels: Number(r.totalLevels),
      })),
      hardestLevels,
      easiestLevels,
      avgTimePerLevel,
      levelAnalyticsRows,
    };
  } catch {
    return {
      totalUsers: 0,
      activeUsers: 0,
      chapterRows: [],
      hardestLevels: [],
      easiestLevels: [],
      avgTimePerLevel: 0,
      levelAnalyticsRows: [],
    };
  }
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsOverview();

  const maxLevelCount = Math.max(
    1,
    ...data.chapterRows.map((r) => r.totalLevels),
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Analytics
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Platform usage and completion metrics
        </p>
      </div>

      {/* User stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={data.totalUsers} />
        <StatCard label="Active (7d)" value={data.activeUsers} />
        <StatCard
          label="Levels with Data"
          value={data.levelAnalyticsRows.length}
        />
        <StatCard
          label="Avg Time / Level"
          value={data.avgTimePerLevel}
          format={(v) => formatTime(v)}
        />
      </div>

      {/* Chapter completion bar chart */}
      <section>
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Levels per Chapter
        </h2>
        <div
          className="rounded-md p-5 space-y-4"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          {data.chapterRows.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              No chapter data yet.
            </p>
          ) : (
            data.chapterRows.map((ch) => (
              <div key={ch.chapterId} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {ch.chapterTitle}
                  </span>
                  <span
                    className="text-xs tabular-nums"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {ch.totalLevels} levels
                  </span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: "var(--card)" }}
                >
                  <div
                    className="h-full rounded-full transition-[width]"
                    style={{
                      width: `${(ch.totalLevels / maxLevelCount) * 100}%`,
                      backgroundColor: "var(--rag)",
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Hardest levels */}
      <section>
        <h2
          className="text-lg font-semibold mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Top 5 Hardest Levels{" "}
          <span
            className="text-sm font-normal"
            style={{ color: "var(--text-muted)" }}
          >
            (highest drop-off rate)
          </span>
        </h2>
        <LevelTable rows={data.hardestLevels} metric="dropOff" />
      </section>

      {/* Easiest levels */}
      <section>
        <h2
          className="text-lg font-semibold mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Top 5 Easiest Levels{" "}
          <span
            className="text-sm font-normal"
            style={{ color: "var(--text-muted)" }}
          >
            (highest avg score)
          </span>
        </h2>
        <LevelTable rows={data.easiestLevels} metric="score" />
      </section>

      {/* Avg time per level */}
      <section>
        <h2
          className="text-lg font-semibold mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Average Time Per Level
        </h2>
        <div
          className="rounded-md p-5"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          {data.levelAnalyticsRows.filter((r) => r.avgTimeSeconds).length ===
          0 ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              No timing data yet.
            </p>
          ) : (
            <div className="space-y-3">
              {data.levelAnalyticsRows
                .filter((r) => r.avgTimeSeconds !== null)
                .sort(
                  (a, b) => (b.avgTimeSeconds ?? 0) - (a.avgTimeSeconds ?? 0),
                )
                .slice(0, 10)
                .map((r) => (
                  <div
                    key={r.levelId}
                    className="flex items-center justify-between text-sm"
                  >
                    <span style={{ color: "var(--text-secondary)" }}>
                      {r.title}
                    </span>
                    <span
                      className="tabular-nums font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {formatTime(r.avgTimeSeconds ?? 0)}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  format,
}: {
  label: string;
  value: number;
  format?: (v: number) => string;
}) {
  return (
    <div
      className="rounded-md px-4 py-4"
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <p
        className="text-xs uppercase tracking-wide mb-1"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </p>
      <p
        className="text-2xl font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        {format ? format(value) : value.toLocaleString()}
      </p>
    </div>
  );
}

type AnalyticsRow = {
  levelId: number;
  title: string;
  chapterTitle: string;
  totalAttempts: number | null;
  totalCompletions: number | null;
  avgScore: string | null;
  avgTimeSeconds: number | null;
  dropOffRate: string | null;
};

function LevelTable({
  rows,
  metric,
}: {
  rows: AnalyticsRow[];
  metric: "dropOff" | "score";
}) {
  if (rows.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        No data yet.
      </p>
    );
  }

  return (
    <div
      className="rounded-md overflow-hidden"
      style={{ border: "1px solid var(--border)" }}
    >
      <table className="w-full text-sm">
        <thead>
          <tr style={{ backgroundColor: "var(--surface)" }}>
            {[
              "Level",
              "Chapter",
              "Attempts",
              "Completions",
              metric === "dropOff" ? "Drop-off %" : "Avg Score",
            ].map((h) => (
              <th
                key={h}
                className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide"
                style={{ color: "var(--text-muted)" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody style={{ backgroundColor: "var(--card)" }}>
          {rows.map((r) => (
            <tr
              key={r.levelId}
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <td
                className="px-4 py-2.5"
                style={{ color: "var(--text-primary)" }}
              >
                {r.title}
              </td>
              <td
                className="px-4 py-2.5"
                style={{ color: "var(--text-muted)" }}
              >
                {r.chapterTitle}
              </td>
              <td
                className="px-4 py-2.5 tabular-nums"
                style={{ color: "var(--text-secondary)" }}
              >
                {r.totalAttempts ?? 0}
              </td>
              <td
                className="px-4 py-2.5 tabular-nums"
                style={{ color: "var(--text-secondary)" }}
              >
                {r.totalCompletions ?? 0}
              </td>
              <td
                className="px-4 py-2.5 tabular-nums font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {metric === "dropOff"
                  ? `${Number(r.dropOffRate ?? 0).toFixed(1)}%`
                  : `${Number(r.avgScore ?? 0).toFixed(1)}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
