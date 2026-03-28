import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { questChapters } from "../../../../../drizzle/schema";

function requireAdmin(role: string | undefined): boolean {
  return role === "admin";
}

// GET /api/admin/chapters — list ALL chapters (including unpublished)
export async function GET() {
  try {
    const session = await auth();

    if (!requireAdmin(session?.user?.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const chapters = await db
      .select()
      .from(questChapters)
      .orderBy(asc(questChapters.sortOrder));

    return NextResponse.json({ chapters });
  } catch (err) {
    console.error("[GET /api/admin/chapters] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch chapters" },
      { status: 500 },
    );
  }
}

interface CreateChapterBody {
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  accent_color?: string;
  sort_order: number;
  is_published?: boolean;
  prerequisites?: unknown[];
}

// POST /api/admin/chapters — create chapter
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!requireAdmin(session?.user?.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let body: CreateChapterBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const { slug, title, sort_order } = body;

    if (!slug || !title || sort_order === undefined) {
      return NextResponse.json(
        { error: "slug, title, and sort_order are required" },
        { status: 400 },
      );
    }

    const [created] = await db
      .insert(questChapters)
      .values({
        slug,
        title,
        subtitle: body.subtitle ?? null,
        description: body.description ?? null,
        icon: body.icon ?? null,
        accentColor: body.accent_color ?? "#3b82f6",
        sortOrder: sort_order,
        isPublished: body.is_published ?? false,
        prerequisites: body.prerequisites ?? [],
      })
      .returning();

    return NextResponse.json({ chapter: created }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/chapters] error:", err);
    return NextResponse.json(
      { error: "Failed to create chapter" },
      { status: 500 },
    );
  }
}
