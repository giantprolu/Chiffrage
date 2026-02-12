import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where =
    from && to
      ? { date: { gte: new Date(from + "T00:00:00Z"), lte: new Date(to + "T23:59:59Z") }, userId }
      : { userId };

  const entries = await prisma.entry.findMany({
    where,
    orderBy: { date: "asc" },
  });

  const byClient: Record<string, number> = {};
  for (const e of entries) {
    byClient[e.client] = (byClient[e.client] || 0) + e.time;
  }

  const byType: Record<string, number> = {};
  for (const e of entries) {
    const t = e.type || "Non défini";
    byType[t] = (byType[t] || 0) + e.time;
  }

  const byMonth: Record<string, number> = {};
  for (const e of entries) {
    const d = new Date(e.date);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    byMonth[key] = (byMonth[key] || 0) + e.time;
  }

  const formationWhere =
    from && to
      ? { date: { gte: new Date(from + "T00:00:00Z"), lte: new Date(to + "T23:59:59Z") }, userId }
      : { userId };
  const formationDays = await prisma.formationDay.findMany({
    where: formationWhere,
  });

  const formationByMonth: Record<string, number> = {};
  for (const f of formationDays) {
    const d = new Date(f.date);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    formationByMonth[key] = (formationByMonth[key] || 0) + 1;
  }

  return NextResponse.json({
    byClient,
    byType,
    byMonth,
    formationByMonth,
    totalDays: entries.reduce((sum, e) => sum + e.time, 0),
    totalFormation: formationDays.length,
  });
}
