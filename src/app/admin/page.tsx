import { db } from "@/lib/db";
import {
  questChapters,
  questLevels,
  questUsers,
  questUserProgress,
} from "../../../drizzle/schema";
import { count, eq, sql } from "drizzle-orm";
import Link from "next/link";
import AdminChapterEditForm from "./AdminChapterEditForm";
import AdminLevelEditForm from "./AdminLevelEditForm";

export const dynamic = "force-dynamic";

async function getAdminStats() {
  try {
    const [usersResult] = await db.select({ n: count() }).from(questUsers);
    const [chaptersResult] = await db
      .select({ n: count() })
      .from(questChapters);
    const [levelsResult] = await db.select({ n: count() }).from(questLevels);
    const [completionsResult] = await db
      .select({ n: count() })
      .from(questUserProgress)
      .where(eq(questUserProgress.completed, true));

    const totalLevels = Number(levelsResult.n);
    const totalUsers = Number(usersResult.n);
    const totalCompletions = Number(completionsResult.n);
    const avgCompletionRate =
      totalUsers > 0 && totalLevels > 0
        ? ((totalCompletions / (totalUsers * totalLevels)) * 100).toFixed(1)
        : "0.0";

    return {
      totalUsers,
      totalChapters: Number(chaptersResult.n),
      totalLevels,
      totalCompletions,
      avgCompletionRate,
    };
  } catch {
    return {
      totalUsers: 0,
      totalChapters: 0,
      totalLevels: 0,
      totalCompletions: 0,
      avgCompletionRate: "0.0",
    };
  }
}

async function getAllChapters() {
  try {
    return await db
      .select()
      .from(questChapters)
      .orderBy(questChapters.sortOrder);
  } catch {
    return [];
  }
}

async function getAllLevels() {
  try {
    const rows = await db
      .select({
        id: questLevels.id,
        chapterId: questLevels.chapterId,
        slug: questLevels.slug,
        levelNumber: questLevels.levelNumber,
        title: questLevels.title,
        gameType: questLevels.gameType,
        xpReward: questLevels.xpReward,
        isPublished: questLevels.isPublished,
        chapterTitle: questChapters.title,
        chapterSlug: questChapters.slug,
      })
      .from(questLevels)
      .leftJoin(questChapters, eq(questLevels.chapterId, questChapters.id))
      .orderBy(questChapters.sortOrder, questLevels.levelNumber);
    return rows;
  } catch {
    return [];
  }
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    editChapter?: string;
    editLevel?: string;
  }>;
}) {
  const { tab, editChapter, editLevel } = await searchParams;

  const [stats, chapters, levels] = await Promise.all([
    getAdminStats(),
    getAllChapters(),
    getAllLevels(),
  ]);

  const editingChapter = editChapter
    ? chapters.find((c) => c.id === parseInt(editChapter, 10))
    : null;

  const editingLevel = editLevel
    ? levels.find((l) => l.id === parseInt(editLevel, 10))
    : null;

  const activeTab = tab ?? "overview";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Admin Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Manage content and view platform stats
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.totalUsers} />
        <StatCard label="Chapters" value={stats.totalChapters} />
        <StatCard label="Levels" value={stats.totalLevels} />
        <StatCard label="Completions" value={stats.totalCompletions} />
      </div>

      {/* Avg completion rate */}
      <div
        className="px-4 py-3 rounded-md flex items-center gap-3"
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Avg Completion Rate:
        </span>
        <span
          className="text-lg font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          {stats.avgCompletionRate}%
        </span>
      </div>

      {/* Tab navigation */}
      <div
        className="flex gap-1 p-1 rounded-md w-fit"
        style={{ backgroundColor: "var(--surface)" }}
      >
        {(["overview", "chapters", "levels"] as const).map((t) => (
          <Link
            key={t}
            href={`/admin?tab=${t}`}
            className="px-4 py-1.5 rounded text-sm font-medium transition-colors capitalize"
            style={
              activeTab === t
                ? {
                    backgroundColor: "var(--card)",
                    color: "var(--text-primary)",
                  }
                : { color: "var(--text-muted)" }
            }
          >
            {t}
          </Link>
        ))}
      </div>

      {/* Chapters tab */}
      {(activeTab === "chapters" || activeTab === "overview") && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Chapters
            </h2>
            <Link
              href="/admin?tab=chapters&editChapter=new"
              className="text-xs px-3 py-1.5 rounded"
              style={{ backgroundColor: "var(--rag)", color: "#fff" }}
            >
              + New Chapter
            </Link>
          </div>

          {editingChapter && (
            <div className="mb-4">
              <AdminChapterEditForm chapter={editingChapter} />
            </div>
          )}

          <Table
            headers={["ID", "Title", "Slug", "Sort", "Published", "Actions"]}
          >
            {chapters.map((ch) => (
              <tr
                key={ch.id}
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <Td>{ch.id}</Td>
                <Td>
                  <span
                    className="font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {ch.title}
                  </span>
                </Td>
                <Td>
                  <code
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {ch.slug}
                  </code>
                </Td>
                <Td>{ch.sortOrder}</Td>
                <Td>
                  <Badge published={ch.isPublished ?? false} />
                </Td>
                <Td>
                  <Link
                    href={`/admin?tab=chapters&editChapter=${ch.id}`}
                    className="text-xs underline"
                    style={{ color: "var(--rag)" }}
                  >
                    Edit
                  </Link>
                </Td>
              </tr>
            ))}
          </Table>
        </section>
      )}

      {/* Levels tab */}
      {(activeTab === "levels" || activeTab === "overview") && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Levels
            </h2>
            <Link
              href="/admin?tab=levels&editLevel=new"
              className="text-xs px-3 py-1.5 rounded"
              style={{ backgroundColor: "var(--rag)", color: "#fff" }}
            >
              + New Level
            </Link>
          </div>

          {editingLevel && (
            <div className="mb-4">
              <AdminLevelEditForm level={editingLevel} chapters={chapters} />
            </div>
          )}

          <Table
            headers={[
              "ID",
              "Chapter",
              "Lvl#",
              "Title",
              "Game Type",
              "XP",
              "Published",
              "Actions",
            ]}
          >
            {levels.map((lv) => (
              <tr
                key={lv.id}
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <Td>{lv.id}</Td>
                <Td>
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {lv.chapterTitle ?? "—"}
                  </span>
                </Td>
                <Td>{lv.levelNumber}</Td>
                <Td>
                  <span style={{ color: "var(--text-primary)" }}>
                    {lv.title}
                  </span>
                </Td>
                <Td>
                  <code className="text-xs">{lv.gameType}</code>
                </Td>
                <Td>{lv.xpReward}</Td>
                <Td>
                  <IsPublishedToggle
                    levelId={lv.id}
                    isPublished={lv.isPublished ?? false}
                  />
                </Td>
                <Td>
                  <Link
                    href={`/admin?tab=levels&editLevel=${lv.id}`}
                    className="text-xs underline"
                    style={{ color: "var(--rag)" }}
                  >
                    Edit
                  </Link>
                </Td>
              </tr>
            ))}
          </Table>
        </section>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: number }) {
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
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function Table({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-md overflow-hidden"
      style={{ border: "1px solid var(--border)" }}
    >
      <table className="w-full text-sm">
        <thead>
          <tr style={{ backgroundColor: "var(--surface)" }}>
            {headers.map((h) => (
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
        <tbody style={{ backgroundColor: "var(--card)" }}>{children}</tbody>
      </table>
    </div>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td className="px-4 py-2.5" style={{ color: "var(--text-secondary)" }}>
      {children}
    </td>
  );
}

function Badge({ published }: { published: boolean }) {
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={
        published
          ? { backgroundColor: "rgba(16,185,129,0.15)", color: "#10b981" }
          : {
              backgroundColor: "rgba(100,116,139,0.15)",
              color: "var(--text-muted)",
            }
      }
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}

function IsPublishedToggle({
  levelId,
  isPublished,
}: {
  levelId: number;
  isPublished: boolean;
}) {
  return (
    <form action={`/api/admin/levels/${levelId}`} method="POST">
      <input type="hidden" name="_method" value="PUT" />
      <input type="hidden" name="is_published" value={String(!isPublished)} />
      <button
        type="submit"
        className="text-xs underline"
        style={{ color: isPublished ? "#10b981" : "var(--text-muted)" }}
        title={`Click to ${isPublished ? "unpublish" : "publish"}`}
      >
        {isPublished ? "Published" : "Draft"}
      </button>
    </form>
  );
}
