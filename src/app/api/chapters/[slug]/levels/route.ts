import { NextResponse } from "next/server";
import { eq, asc, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  questChapters,
  questLevels,
  questUserProgress,
} from "../../../../../../drizzle/schema";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    // Find the published chapter by slug
    const chapter = await db
      .select()
      .from(questChapters)
      .where(
        and(eq(questChapters.slug, slug), eq(questChapters.isPublished, true)),
      )
      .limit(1);

    if (chapter.length === 0) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    // Fetch published levels for this chapter
    const levels = await db
      .select()
      .from(questLevels)
      .where(
        and(
          eq(questLevels.chapterId, chapter[0].id),
          eq(questLevels.isPublished, true),
        ),
      )
      .orderBy(asc(questLevels.levelNumber));

    const session = await auth();

    if (!session?.user?.id) {
      // Guest: return levels without completion status
      return NextResponse.json({ levels });
    }

    const userId = parseInt(session.user.id, 10);

    // Augment each level with completion status
    const levelsWithStatus = await Promise.all(
      levels.map(async (level) => {
        const prog = await db
          .select({
            completed: questUserProgress.completed,
            score: questUserProgress.score,
            attempts: questUserProgress.attempts,
          })
          .from(questUserProgress)
          .where(
            and(
              eq(questUserProgress.userId, userId),
              eq(questUserProgress.levelId, level.id),
            ),
          )
          .limit(1);

        return {
          ...level,
          userProgress: prog.length > 0 ? prog[0] : null,
        };
      }),
    );

    return NextResponse.json({ levels: levelsWithStatus });
  } catch (err) {
    console.error("[GET /api/chapters/[slug]/levels] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch levels" },
      { status: 500 },
    );
  }
}
