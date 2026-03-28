import { NextResponse } from "next/server";
import { getLevelWithSections } from "@/lib/level-queries";

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

    const level = await getLevelWithSections(levelId);

    if (!level) {
      return NextResponse.json({ error: "Level not found" }, { status: 404 });
    }

    return NextResponse.json({ level });
  } catch (err) {
    console.error("[GET /api/levels/[id]] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch level" },
      { status: 500 },
    );
  }
}
