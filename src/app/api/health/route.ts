import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";

export async function GET() {
  let database = "down";
  try {
    await db.execute(sql`select 1`);
    database = "up";
  } catch {
    database = "down";
  }

  return NextResponse.json({
    status: "ok",
    service: "academic-platform",
    database,
    time: new Date().toISOString(),
  });
}
