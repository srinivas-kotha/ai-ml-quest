import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { questLevels } from "../../../../../../drizzle/schema";

function requireAdmin(role: string | undefined): boolean {
  return role === "admin";
}

interface UpdateLevelBody {
  title?: string;
  subtitle?: string | null;
  hook?: string | null;
  game_type?: string;
  game_config?: unknown;
  key_insight?: string | null;
  xp_reward?: number;
  estimated_minutes?: number;
  is_published?: boolean;
}

// PUT /api/admin/levels/[id] — update level
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!requireAdmin(session?.user?.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const levelId = parseInt(id, 10);

    if (isNaN(levelId)) {
      return NextResponse.json({ error: "Invalid level id" }, { status: 400 });
    }

    let body: UpdateLevelBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const updatePayload: Partial<typeof questLevels.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (body.title !== undefined) updatePayload.title = body.title;
    if (body.subtitle !== undefined) updatePayload.subtitle = body.subtitle;
    if (body.hook !== undefined) updatePayload.hook = body.hook;
    if (body.game_type !== undefined) updatePayload.gameType = body.game_type;
    if (body.game_config !== undefined)
      updatePayload.gameConfig = body.game_config;
    if (body.key_insight !== undefined)
      updatePayload.keyInsight = body.key_insight;
    if (body.xp_reward !== undefined) updatePayload.xpReward = body.xp_reward;
    if (body.estimated_minutes !== undefined)
      updatePayload.estimatedMinutes = body.estimated_minutes;
    if (body.is_published !== undefined)
      updatePayload.isPublished = body.is_published;

    const [updated] = await db
      .update(questLevels)
      .set(updatePayload)
      .where(eq(questLevels.id, levelId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Level not found" }, { status: 404 });
    }

    return NextResponse.json({ level: updated });
  } catch (err) {
    console.error("[PUT /api/admin/levels/[id]] error:", err);
    return NextResponse.json(
      { error: "Failed to update level" },
      { status: 500 },
    );
  }
}
