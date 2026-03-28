import { NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  questLevels,
  questUserProgress,
  questUserStats,
  questUsers,
} from "../../../../drizzle/schema";

interface ProgressBody {
  level_id: number;
  score: number;
  max_score: number;
  time_spent_seconds: number;
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id, 10);

    let body: ProgressBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const { level_id, score, max_score, time_spent_seconds } = body;

    if (
      typeof level_id !== "number" ||
      typeof score !== "number" ||
      typeof max_score !== "number" ||
      typeof time_spent_seconds !== "number"
    ) {
      return NextResponse.json(
        {
          error:
            "Missing or invalid fields: level_id, score, max_score, time_spent_seconds",
        },
        { status: 400 },
      );
    }

    // Verify level exists and get xp_reward
    const level = await db
      .select({ id: questLevels.id, xpReward: questLevels.xpReward })
      .from(questLevels)
      .where(eq(questLevels.id, level_id))
      .limit(1);

    if (level.length === 0) {
      return NextResponse.json({ error: "Level not found" }, { status: 404 });
    }

    const xpEarned = level[0].xpReward ?? 100;
    const now = new Date();
    const nowDate = now.toISOString().split("T")[0]; // YYYY-MM-DD

    // Upsert quest_user_progress
    const existing = await db
      .select()
      .from(questUserProgress)
      .where(
        and(
          eq(questUserProgress.userId, userId),
          eq(questUserProgress.levelId, level_id),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(questUserProgress).values({
        userId,
        levelId: level_id,
        completed: true,
        score,
        maxScore: max_score,
        attempts: 1,
        timeSpentSeconds: time_spent_seconds,
        completedAt: now,
      });
    } else {
      await db
        .update(questUserProgress)
        .set({
          completed: true,
          score: Math.max(existing[0].score ?? 0, score),
          maxScore: max_score,
          attempts: (existing[0].attempts ?? 0) + 1,
          timeSpentSeconds:
            (existing[0].timeSpentSeconds ?? 0) + time_spent_seconds,
          completedAt: existing[0].completedAt ?? now,
        })
        .where(
          and(
            eq(questUserProgress.userId, userId),
            eq(questUserProgress.levelId, level_id),
          ),
        );
    }

    // Get or create quest_user_stats
    const statsRows = await db
      .select()
      .from(questUserStats)
      .where(eq(questUserStats.userId, userId))
      .limit(1);

    if (statsRows.length === 0) {
      // First time: create stats row
      const newXp = xpEarned;
      const newPlayerLevel = Math.floor(newXp / 500) + 1;

      await db.insert(questUserStats).values({
        userId,
        xp: newXp,
        playerLevel: newPlayerLevel,
        streakDays: 1,
        longestStreak: 1,
        lastActiveDate: nowDate,
        totalLevelsCompleted: 1,
        totalTimeSeconds: time_spent_seconds,
      });
    } else {
      const stats = statsRows[0];
      const currentXp = stats.xp ?? 0;
      const newXp = currentXp + xpEarned;
      const newPlayerLevel = Math.floor(newXp / 500) + 1;

      // Streak calculation
      const lastDate = stats.lastActiveDate; // string YYYY-MM-DD or null
      let streakDays = stats.streakDays ?? 0;
      let longestStreak = stats.longestStreak ?? 0;

      if (lastDate === null) {
        streakDays = 1;
      } else {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        if (lastDate === nowDate) {
          // Already active today — no change to streak
        } else if (lastDate === yesterdayStr) {
          // Last active yesterday — extend streak
          streakDays += 1;
        } else {
          // Gap — reset streak
          streakDays = 1;
        }
      }

      longestStreak = Math.max(longestStreak, streakDays);

      // Only count as newly completed if this is the first completion
      const isFirstCompletion = existing.length === 0;

      await db
        .update(questUserStats)
        .set({
          xp: newXp,
          playerLevel: newPlayerLevel,
          streakDays,
          longestStreak,
          lastActiveDate: nowDate,
          totalLevelsCompleted: isFirstCompletion
            ? sql`${questUserStats.totalLevelsCompleted} + 1`
            : stats.totalLevelsCompleted,
          totalTimeSeconds: sql`${questUserStats.totalTimeSeconds} + ${time_spent_seconds}`,
        })
        .where(eq(questUserStats.userId, userId));
    }

    // Update user last_active_at
    await db
      .update(questUsers)
      .set({ lastActiveAt: now })
      .where(eq(questUsers.id, userId));

    return NextResponse.json({ success: true, xp_earned: xpEarned });
  } catch (err) {
    console.error("[POST /api/progress] error:", err);
    return NextResponse.json(
      { error: "Failed to save progress" },
      { status: 500 },
    );
  }
}
