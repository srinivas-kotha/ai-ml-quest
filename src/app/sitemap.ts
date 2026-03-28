import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { questChapters, questLevels } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

const BASE_URL = "https://quest.srinivaskotha.uk";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  try {
    // Published chapters
    const chapters = await db
      .select({
        slug: questChapters.slug,
        updatedAt: questChapters.updatedAt,
      })
      .from(questChapters)
      .where(eq(questChapters.isPublished, true));

    for (const chapter of chapters) {
      entries.push({
        url: `${BASE_URL}/chapters/${chapter.slug}`,
        lastModified: chapter.updatedAt ?? new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }

    // Published levels
    const levels = await db
      .select({
        slug: questChapters.slug,
        levelNumber: questLevels.levelNumber,
        updatedAt: questLevels.updatedAt,
      })
      .from(questLevels)
      .innerJoin(questChapters, eq(questLevels.chapterId, questChapters.id))
      .where(
        and(
          eq(questChapters.isPublished, true),
          eq(questLevels.isPublished, true),
        ),
      );

    for (const level of levels) {
      entries.push({
        url: `${BASE_URL}/chapters/${level.slug}/levels/${level.levelNumber}`,
        lastModified: level.updatedAt ?? new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  } catch {
    // DB unavailable at build time — return static entries only
  }

  return entries;
}
