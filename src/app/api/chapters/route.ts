import { NextResponse } from "next/server";
import { eq, asc, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  questChapters,
  questLevels,
  questUserProgress,
  questUsers,
} from "../../../../drizzle/schema";

export async function GET() {
  try {
    const session = await auth();

    // Fetch all published chapters ordered by sort_order
    const chapters = await db
      .select()
      .from(questChapters)
      .where(eq(questChapters.isPublished, true))
      .orderBy(asc(questChapters.sortOrder));

    if (!session?.user?.id) {
      // Guest: return chapters without progress
      return NextResponse.json({ chapters });
    }

    // Authenticated: include per-chapter progress summary
    const userId = parseInt(session.user.id, 10);

    // Confirm user exists in DB
    const dbUser = await db
      .select({ id: questUsers.id })
      .from(questUsers)
      .where(eq(questUsers.id, userId))
      .limit(1);

    if (dbUser.length === 0) {
      return NextResponse.json({ chapters });
    }

    // For each chapter, count total published levels and completed levels
    const chaptersWithProgress = await Promise.all(
      chapters.map(async (chapter) => {
        const levels = await db
          .select({ id: questLevels.id })
          .from(questLevels)
          .where(
            and(
              eq(questLevels.chapterId, chapter.id),
              eq(questLevels.isPublished, true),
            ),
          );

        const total = levels.length;
        let completedCount = 0;

        for (const level of levels) {
          const prog = await db
            .select({ completed: questUserProgress.completed })
            .from(questUserProgress)
            .where(
              and(
                eq(questUserProgress.userId, userId),
                eq(questUserProgress.levelId, level.id),
                eq(questUserProgress.completed, true),
              ),
            )
            .limit(1);
          if (prog.length > 0) completedCount++;
        }

        return {
          ...chapter,
          progress: { completed: completedCount, total },
        };
      }),
    );

    return NextResponse.json({ chapters: chaptersWithProgress });
  } catch (err) {
    console.error("[GET /api/chapters] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch chapters" },
      { status: 500 },
    );
  }
}
