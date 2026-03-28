import { NextResponse } from "next/server";
import { eq, asc, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { questLevels, questLearnSections } from "../../../../../drizzle/schema";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const levelId = parseInt(id, 10);

    if (isNaN(levelId)) {
      return NextResponse.json({ error: "Invalid level id" }, { status: 400 });
    }

    // Fetch the published level
    const level = await db
      .select()
      .from(questLevels)
      .where(
        and(eq(questLevels.id, levelId), eq(questLevels.isPublished, true)),
      )
      .limit(1);

    if (level.length === 0) {
      return NextResponse.json({ error: "Level not found" }, { status: 404 });
    }

    // Fetch learn sections ordered by sort_order
    const learnSections = await db
      .select()
      .from(questLearnSections)
      .where(eq(questLearnSections.levelId, levelId))
      .orderBy(asc(questLearnSections.sortOrder));

    return NextResponse.json({
      level: {
        ...level[0],
        learnSections,
      },
    });
  } catch (err) {
    console.error("[GET /api/levels/[id]] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch level" },
      { status: 500 },
    );
  }
}
