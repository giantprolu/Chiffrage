import db from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let entriesResult;
  if (from && to) {
    entriesResult = await db.execute({
      sql: "SELECT * FROM Entry WHERE date >= ? AND date <= ? AND userId = ? ORDER BY date ASC",
      args: [from + "T00:00:00Z", to + "T23:59:59Z", userId],
    });
  } else {
    entriesResult = await db.execute({
      sql: "SELECT * FROM Entry WHERE userId = ? ORDER BY date ASC",
      args: [userId],
    });
  }
  const entries = entriesResult.rows;

  const byClient: Record<string, number> = {};
  for (const e of entries) {
    byClient[e.client as string] = (byClient[e.client as string] || 0) + (e.time as number);
  }

  const byType: Record<string, number> = {};
  for (const e of entries) {
    const t = (e.type as string) || "Non défini";
    byType[t] = (byType[t] || 0) + (e.time as number);
  }

  const byMonth: Record<string, number> = {};
  for (const e of entries) {
    const d = new Date(e.date as string);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    byMonth[key] = (byMonth[key] || 0) + (e.time as number);
  }

  let formationResult;
  if (from && to) {
    formationResult = await db.execute({
      sql: "SELECT * FROM FormationDay WHERE date >= ? AND date <= ? AND userId = ?",
      args: [from + "T00:00:00Z", to + "T23:59:59Z", userId],
    });
  } else {
    formationResult = await db.execute({
      sql: "SELECT * FROM FormationDay WHERE userId = ?",
      args: [userId],
    });
  }
  const formationDays = formationResult.rows;

  const formationByMonth: Record<string, number> = {};
  for (const f of formationDays) {
    const d = new Date(f.date as string);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    formationByMonth[key] = (formationByMonth[key] || 0) + ((f.time as number) ?? 1);
  }

  return NextResponse.json({
    byClient,
    byType,
    byMonth,
    formationByMonth,
    totalDays: entries.reduce((sum, e) => sum + (e.time as number), 0),
    totalFormation: formationDays.reduce((sum, f) => sum + ((f.time as number) ?? 1), 0),
  });
}
