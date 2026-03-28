/**
 * Seed script: inserts all 5 chapters into the database.
 * Run with: npx tsx seed/seed.ts
 *
 * Requires DATABASE_URL environment variable (or .env.local).
 * Idempotent: uses ON CONFLICT (upsert) for chapters and levels.
 */

import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load .env.local if present
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

interface LearnSection {
  sort_order: number;
  section_type: string;
  title: string;
  content: Record<string, unknown>;
}

interface Level {
  slug: string;
  level_number: number;
  title: string;
  subtitle: string;
  hook?: string;
  game_type: string;
  game_config: Record<string, unknown>;
  key_insight?: string;
  xp_reward: number;
  estimated_minutes: number;
  is_published: boolean;
  learn_sections: LearnSection[];
}

interface Chapter {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  accent_color: string;
  sort_order: number;
  is_published: boolean;
  prerequisites: string[];
}

interface SeedData {
  chapter: Chapter;
  levels: Level[];
}

/**
 * Seed a single chapter (upsert chapter + levels + learn sections).
 * Uses a single transaction — rolls back fully on any error.
 */
async function seedChapter(
  client: import("pg").PoolClient,
  data: SeedData,
): Promise<{ levelCount: number; sectionCount: number }> {
  // Upsert chapter
  const chapterResult = await client.query(
    `INSERT INTO quest_chapters (slug, title, subtitle, description, icon, accent_color, sort_order, is_published, prerequisites)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (slug) DO UPDATE SET
       title = EXCLUDED.title,
       subtitle = EXCLUDED.subtitle,
       description = EXCLUDED.description,
       icon = EXCLUDED.icon,
       accent_color = EXCLUDED.accent_color,
       sort_order = EXCLUDED.sort_order,
       is_published = EXCLUDED.is_published,
       prerequisites = EXCLUDED.prerequisites,
       updated_at = NOW()
     RETURNING id`,
    [
      data.chapter.slug,
      data.chapter.title,
      data.chapter.subtitle,
      data.chapter.description,
      data.chapter.icon,
      data.chapter.accent_color,
      data.chapter.sort_order,
      data.chapter.is_published,
      JSON.stringify(data.chapter.prerequisites),
    ],
  );

  const chapterId = chapterResult.rows[0].id;
  console.log(`  Chapter '${data.chapter.title}' upserted (id=${chapterId})`);

  let totalSections = 0;

  // Upsert levels
  for (const level of data.levels) {
    const levelResult = await client.query(
      `INSERT INTO quest_levels (chapter_id, slug, level_number, title, subtitle, hook, game_type, game_config, key_insight, xp_reward, estimated_minutes, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (chapter_id, level_number) DO UPDATE SET
         slug = EXCLUDED.slug,
         title = EXCLUDED.title,
         subtitle = EXCLUDED.subtitle,
         hook = EXCLUDED.hook,
         game_type = EXCLUDED.game_type,
         game_config = EXCLUDED.game_config,
         key_insight = EXCLUDED.key_insight,
         xp_reward = EXCLUDED.xp_reward,
         estimated_minutes = EXCLUDED.estimated_minutes,
         is_published = EXCLUDED.is_published,
         updated_at = NOW()
       RETURNING id`,
      [
        chapterId,
        level.slug,
        level.level_number,
        level.title,
        level.subtitle,
        level.hook ?? null,
        level.game_type,
        JSON.stringify(level.game_config),
        level.key_insight ?? null,
        level.xp_reward,
        level.estimated_minutes,
        level.is_published,
      ],
    );

    const levelId = levelResult.rows[0].id;
    console.log(
      `    Level ${level.level_number}: '${level.title}' upserted (id=${levelId})`,
    );

    // Delete existing learn sections and re-insert (ordered content — simpler than granular upsert)
    await client.query(`DELETE FROM quest_learn_sections WHERE level_id = $1`, [
      levelId,
    ]);

    for (const section of level.learn_sections) {
      await client.query(
        `INSERT INTO quest_learn_sections (level_id, sort_order, section_type, title, content)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          levelId,
          section.sort_order,
          section.section_type,
          section.title ?? null,
          JSON.stringify(section.content),
        ],
      );
    }

    totalSections += level.learn_sections.length;
    console.log(`      ${level.learn_sections.length} learn sections`);
  }

  return { levelCount: data.levels.length, sectionCount: totalSections };
}

async function seed() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const client = await pool.connect();

  // All 5 chapter seed files, in sort_order
  const seedFiles = [
    "chapter1-rag.json",
    "chapter2-slm.json",
    "chapter3-monitoring.json",
    "chapter4-finetuning.json",
    "chapter5-multimodal.json",
  ];

  try {
    console.log("Starting seed — all 5 chapters...\n");

    await client.query("BEGIN");

    let totalLevels = 0;
    let totalSections = 0;

    for (const filename of seedFiles) {
      const dataPath = path.resolve(__dirname, filename);

      if (!fs.existsSync(dataPath)) {
        console.warn(`  WARNING: ${filename} not found, skipping`);
        continue;
      }

      const data: SeedData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
      console.log(`\nSeeding: ${filename}`);

      const { levelCount, sectionCount } = await seedChapter(client, data);
      totalLevels += levelCount;
      totalSections += sectionCount;
    }

    await client.query("COMMIT");

    console.log(
      `\n✓ Seed complete: ${seedFiles.length} chapters, ${totalLevels} levels, ${totalSections} learn sections`,
    );
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seed failed, transaction rolled back:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
