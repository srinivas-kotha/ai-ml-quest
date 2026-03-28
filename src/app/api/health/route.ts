import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  let dbStatus: "connected" | "error" = "error";

  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    dbStatus = "connected";
  } catch {
    dbStatus = "error";
  }

  return NextResponse.json({
    status: "ok",
    db: dbStatus,
    timestamp: new Date().toISOString(),
  });
}
