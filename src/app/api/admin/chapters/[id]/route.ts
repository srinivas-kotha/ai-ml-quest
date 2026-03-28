import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { questChapters } from "../../../../../../drizzle/schema";

function requireAdmin(role: string | undefined): boolean {
  return role === "admin";
}

interface UpdateChapterBody {
  title?: string;
  subtitle?: string | null;
  description?: string | null;
  icon?: string | null;
  accent_color?: string;
  sort_order?: number;
  is_published?: boolean;
  prerequisites?: unknown[];
}

// PUT /api/admin/chapters/[id] — update chapter
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
    const chapterId = parseInt(id, 10);

    if (isNaN(chapterId)) {
      return NextResponse.json(
        { error: "Invalid chapter id" },
        { status: 400 },
      );
    }

    let body: UpdateChapterBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const updatePayload: Partial<typeof questChapters.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (body.title !== undefined) updatePayload.title = body.title;
    if (body.subtitle !== undefined) updatePayload.subtitle = body.subtitle;
    if (body.description !== undefined)
      updatePayload.description = body.description;
    if (body.icon !== undefined) updatePayload.icon = body.icon;
    if (body.accent_color !== undefined)
      updatePayload.accentColor = body.accent_color;
    if (body.sort_order !== undefined)
      updatePayload.sortOrder = body.sort_order;
    if (body.is_published !== undefined)
      updatePayload.isPublished = body.is_published;
    if (body.prerequisites !== undefined)
      updatePayload.prerequisites = body.prerequisites;

    const [updated] = await db
      .update(questChapters)
      .set(updatePayload)
      .where(eq(questChapters.id, chapterId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    return NextResponse.json({ chapter: updated });
  } catch (err) {
    console.error("[PUT /api/admin/chapters/[id]] error:", err);
    return NextResponse.json(
      { error: "Failed to update chapter" },
      { status: 500 },
    );
  }
}
