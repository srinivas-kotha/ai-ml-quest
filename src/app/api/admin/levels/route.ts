import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  questLevels,
  questLearnSections,
  questChapters,
} from "../../../../../drizzle/schema";

function requireAdmin(role: string | undefined): boolean {
  return role === "admin";
}

// GET /api/admin/levels — list ALL levels (including unpublished)
export async function GET() {
  try {
    const session = await auth();

    if (!requireAdmin(session?.user?.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const levels = await db
      .select({
        id: questLevels.id,
        chapterId: questLevels.chapterId,
        slug: questLevels.slug,
        levelNumber: questLevels.levelNumber,
        title: questLevels.title,
        subtitle: questLevels.subtitle,
        hook: questLevels.hook,
        gameType: questLevels.gameType,
        keyInsight: questLevels.keyInsight,
        xpReward: questLevels.xpReward,
        estimatedMinutes: questLevels.estimatedMinutes,
        isPublished: questLevels.isPublished,
        createdAt: questLevels.createdAt,
        updatedAt: questLevels.updatedAt,
        chapterTitle: questChapters.title,
      })
      .from(questLevels)
      .leftJoin(questChapters, eq(questLevels.chapterId, questChapters.id))
      .orderBy(asc(questChapters.sortOrder), asc(questLevels.levelNumber));

    return NextResponse.json({ levels });
  } catch (err) {
    console.error("[GET /api/admin/levels] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch levels" },
      { status: 500 },
    );
  }
}

interface LearnSectionInput {
  sort_order: number;
  section_type: string;
  title?: string;
  content: unknown;
}

interface CreateLevelBody {
  chapter_id: number;
  slug: string;
  level_number: number;
  title: string;
  subtitle?: string;
  hook?: string;
  game_type: string;
  game_config: unknown;
  key_insight?: string;
  xp_reward?: number;
  estimated_minutes?: number;
  is_published?: boolean;
  learn_sections?: LearnSectionInput[];
}

// POST /api/admin/levels — create level with optional learn_sections
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!requireAdmin(session?.user?.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let body: CreateLevelBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const { chapter_id, slug, level_number, title, game_type, game_config } =
      body;

    if (
      !chapter_id ||
      !slug ||
      level_number === undefined ||
      !title ||
      !game_type ||
      !game_config
    ) {
      return NextResponse.json(
        {
          error:
            "chapter_id, slug, level_number, title, game_type, and game_config are required",
        },
        { status: 400 },
      );
    }

    const [created] = await db
      .insert(questLevels)
      .values({
        chapterId: chapter_id,
        slug,
        levelNumber: level_number,
        title,
        subtitle: body.subtitle ?? null,
        hook: body.hook ?? null,
        gameType: game_type,
        gameConfig: game_config,
        keyInsight: body.key_insight ?? null,
        xpReward: body.xp_reward ?? 100,
        estimatedMinutes: body.estimated_minutes ?? 5,
        isPublished: body.is_published ?? false,
      })
      .returning();

    // Insert learn_sections if provided
    if (body.learn_sections && body.learn_sections.length > 0) {
      await db.insert(questLearnSections).values(
        body.learn_sections.map((s) => ({
          levelId: created.id,
          sortOrder: s.sort_order,
          sectionType: s.section_type,
          title: s.title ?? null,
          content: s.content,
        })),
      );
    }

    return NextResponse.json({ level: created }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/levels] error:", err);
    return NextResponse.json(
      { error: "Failed to create level" },
      { status: 500 },
    );
  }
}
