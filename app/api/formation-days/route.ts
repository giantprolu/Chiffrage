import db from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const month = parseInt(searchParams.get("month") || "");
  const year = parseInt(searchParams.get("year") || "");

  if (isNaN(month) || isNaN(year)) {
    return NextResponse.json(
      { error: "month and year are required" },
      { status: 400 }
    );
  }

  const startDate = new Date(Date.UTC(year, month - 1, 1)).toISOString();
  const endDate = new Date(Date.UTC(year, month, 1)).toISOString();

  const result = await db.execute({
    sql: "SELECT * FROM FormationDay WHERE date >= ? AND date < ? AND userId = ? ORDER BY date ASC",
    args: [startDate, endDate, userId],
  });

  return NextResponse.json(result.rows);
}
