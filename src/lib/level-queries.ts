import { eq, asc, and } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  questLevels,
  questLearnSections,
  questChapters,
} from "../../drizzle/schema";

/**
 * Full level detail including learn sections (ordered by sort_order)
 * and parent chapter info for breadcrumb navigation and accent theming.
 *
 * Returns null when the level does not exist or is not published.
 */
export async function getLevelWithSections(levelId: number) {
  // Fetch the published level with its chapter via a join
  const rows = await db
    .select({
      // Level fields
      id: questLevels.id,
      chapterId: questLevels.chapterId,
      slug: questLevels.slug,
      levelNumber: questLevels.levelNumber,
      title: questLevels.title,
      subtitle: questLevels.subtitle,
      hook: questLevels.hook,
      gameType: questLevels.gameType,
      gameConfig: questLevels.gameConfig,
      keyInsight: questLevels.keyInsight,
      xpReward: questLevels.xpReward,
      estimatedMinutes: questLevels.estimatedMinutes,
      isPublished: questLevels.isPublished,
      createdAt: questLevels.createdAt,
      updatedAt: questLevels.updatedAt,
      // Chapter fields (for breadcrumb + theming)
      chapterSlug: questChapters.slug,
      chapterTitle: questChapters.title,
      chapterAccentColor: questChapters.accentColor,
    })
    .from(questLevels)
    .innerJoin(questChapters, eq(questLevels.chapterId, questChapters.id))
    .where(and(eq(questLevels.id, levelId), eq(questLevels.isPublished, true)))
    .limit(1);

  if (rows.length === 0) {
    return null;
  }

  const row = rows[0];

  // Fetch learn sections ordered by sort_order
  const learnSections = await db
    .select()
    .from(questLearnSections)
    .where(eq(questLearnSections.levelId, levelId))
    .orderBy(asc(questLearnSections.sortOrder));

  // Reshape: pull chapter fields out of the flat join row
  const { chapterSlug, chapterTitle, chapterAccentColor, ...levelFields } = row;

  return {
    ...levelFields,
    learnSections,
    chapter: {
      slug: chapterSlug,
      title: chapterTitle,
      accentColor: chapterAccentColor,
    },
  };
}

/**
 * All published levels for a chapter (by chapter slug), ordered by level_number.
 * Used for next / prev level navigation within a chapter.
 */
export async function getChapterLevels(chapterSlug: string) {
  const rows = await db
    .select({
      id: questLevels.id,
      chapterId: questLevels.chapterId,
      slug: questLevels.slug,
      levelNumber: questLevels.levelNumber,
      title: questLevels.title,
      subtitle: questLevels.subtitle,
      hook: questLevels.hook,
      gameType: questLevels.gameType,
      xpReward: questLevels.xpReward,
      estimatedMinutes: questLevels.estimatedMinutes,
      isPublished: questLevels.isPublished,
      createdAt: questLevels.createdAt,
      updatedAt: questLevels.updatedAt,
    })
    .from(questLevels)
    .innerJoin(questChapters, eq(questLevels.chapterId, questChapters.id))
    .where(
      and(
        eq(questChapters.slug, chapterSlug),
        eq(questChapters.isPublished, true),
        eq(questLevels.isPublished, true),
      ),
    )
    .orderBy(asc(questLevels.levelNumber));

  return rows;
}
