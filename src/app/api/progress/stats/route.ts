import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { questUserStats } from "../../../../../drizzle/schema";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id, 10);

    const stats = await db
      .select()
      .from(questUserStats)
      .where(eq(questUserStats.userId, userId))
      .limit(1);

    if (stats.length === 0) {
      // Return zeroed stats for a new user who hasn't completed any levels
      return NextResponse.json({
        stats: {
          xp: 0,
          playerLevel: 1,
          streakDays: 0,
          longestStreak: 0,
          lastActiveDate: null,
          totalLevelsCompleted: 0,
          totalTimeSeconds: 0,
        },
      });
    }

    const s = stats[0];
    return NextResponse.json({
      stats: {
        xp: s.xp,
        playerLevel: s.playerLevel,
        streakDays: s.streakDays,
        longestStreak: s.longestStreak,
        lastActiveDate: s.lastActiveDate,
        totalLevelsCompleted: s.totalLevelsCompleted,
        totalTimeSeconds: s.totalTimeSeconds,
      },
    });
  } catch (err) {
    console.error("[GET /api/progress/stats] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
