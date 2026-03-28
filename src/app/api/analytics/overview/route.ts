import { NextResponse } from "next/server";
import { count, gte, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  questUsers,
  questChapters,
  questLevels,
  questLevelAnalytics,
  questUserProgress,
} from "../../../../../drizzle/schema";

function requireAdmin(role: string | undefined): boolean {
  return role === "admin";
}

// GET /api/analytics/overview — aggregated analytics (admin only)
export async function GET() {
  try {
    const session = await auth();

    if (!requireAdmin(session?.user?.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Total users
    const [totalUsersResult] = await db.select({ n: count() }).from(questUsers);

    // Active users (last 7 days)
    const [activeUsersResult] = await db
      .select({ n: count() })
      .from(questUsers)
      .where(gte(questUsers.lastActiveAt, sevenDaysAgo));

    // Chapter completion rates
    const chapters = await db
      .select({
        id: questChapters.id,
        slug: questChapters.slug,
        title: questChapters.title,
        sortOrder: questChapters.sortOrder,
      })
      .from(questChapters)
      .where(eq(questChapters.isPublished, true));

    const chapterCompletionRates = await Promise.all(
      chapters.map(async (chapter) => {
        const [levelCountResult] = await db
          .select({ n: count() })
          .from(questLevels)
          .where(eq(questLevels.chapterId, chapter.id));

        const [completionCountResult] = await db
          .select({ n: count() })
          .from(questUserProgress)
          .where(eq(questUserProgress.completed, true));

        const totalLevels = Number(levelCountResult.n);
        const totalCompletions = Number(completionCountResult.n);
        const totalUsers = Number(totalUsersResult.n);

        const completionRate =
          totalUsers > 0 && totalLevels > 0
            ? (totalCompletions / (totalUsers * totalLevels)) * 100
            : 0;

        return {
          chapterId: chapter.id,
          chapterSlug: chapter.slug,
          chapterTitle: chapter.title,
          completionRate: parseFloat(completionRate.toFixed(2)),
          totalLevels,
        };
      }),
    );

    // Level analytics
    const levelAnalytics = await db
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
    const hardestLevels = [...levelAnalytics]
      .filter((r) => r.dropOffRate !== null)
      .sort((a, b) => Number(b.dropOffRate) - Number(a.dropOffRate))
      .slice(0, 5)
      .map((r) => ({
        levelId: r.levelId,
        title: r.title,
        chapterTitle: r.chapterTitle,
        dropOffRate: parseFloat(String(r.dropOffRate ?? 0)),
        totalAttempts: r.totalAttempts,
        totalCompletions: r.totalCompletions,
      }));

    // Drop-off points (levels where users abandon)
    const dropOffPoints = [...levelAnalytics]
      .filter(
        (r) => (r.totalAttempts ?? 0) > 0 && Number(r.dropOffRate ?? 0) > 0,
      )
      .sort((a, b) => (b.totalAttempts ?? 0) - (a.totalAttempts ?? 0))
      .slice(0, 5)
      .map((r) => ({
        levelId: r.levelId,
        title: r.title,
        chapterTitle: r.chapterTitle,
        totalAttempts: r.totalAttempts ?? 0,
        dropOffRate: parseFloat(String(r.dropOffRate ?? 0)),
      }));

    return NextResponse.json({
      totalUsers: Number(totalUsersResult.n),
      activeUsers: Number(activeUsersResult.n),
      chapterCompletionRates,
      hardestLevels,
      dropOffPoints,
      totalLevelsWithData: levelAnalytics.length,
    });
  } catch (err) {
    console.error("[GET /api/analytics/overview] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
