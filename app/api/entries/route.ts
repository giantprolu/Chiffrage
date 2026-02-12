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
    sql: "SELECT id, date, client, ticket, comment, time, type, userId, createdAt, updatedAt FROM Entry WHERE date >= ? AND date < ? AND userId = ? ORDER BY date ASC",
    args: [startDate, endDate, userId],
  });

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json();
  const { date, client, ticket, comment, time, type } = body;

  if (!date || !client || !comment || time == null) {
    return NextResponse.json(
      { error: "date, client, comment, and time are required" },
      { status: 400 }
    );
  }

  // Block entries on formation days
  const entryDate = new Date(date + "T12:00:00Z");

  // Block weekends
  const dow = entryDate.getUTCDay();
  if (dow === 0 || dow === 6) {
    return NextResponse.json(
      { error: "Impossible d'ajouter une entrée le weekend" },
      { status: 400 }
    );
  }

  const dayStart = new Date(Date.UTC(entryDate.getUTCFullYear(), entryDate.getUTCMonth(), entryDate.getUTCDate(), 0, 0, 0)).toISOString();
  const dayEnd = new Date(Date.UTC(entryDate.getUTCFullYear(), entryDate.getUTCMonth(), entryDate.getUTCDate() + 1, 0, 0, 0)).toISOString();

  const formation = await db.execute({
    sql: "SELECT id, time FROM FormationDay WHERE date >= ? AND date < ? AND userId = ? LIMIT 1",
    args: [dayStart, dayEnd, userId],
  });
  if (formation.rows.length > 0 && (formation.rows[0].time as number) >= 1) {
    return NextResponse.json(
      { error: "Impossible d'ajouter une entrée sur un jour de formation complet" },
      { status: 400 }
    );
  }

  // Block entries on congé days (full day only)
  const conge = await db.execute({
    sql: "SELECT id, time FROM CongeDay WHERE date >= ? AND date < ? AND userId = ? LIMIT 1",
    args: [dayStart, dayEnd, userId],
  });
  if (conge.rows.length > 0 && (conge.rows[0].time as number) >= 1) {
    return NextResponse.json(
      { error: "Impossible d'ajouter une entrée sur un jour de congé complet" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const result = await db.execute({
    sql: "INSERT INTO Entry (date, client, ticket, comment, time, type, userId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *",
    args: [entryDate.toISOString(), client, ticket || null, comment, parseFloat(time), type || null, userId, now, now],
  });

  return NextResponse.json(result.rows[0], { status: 201 });
}
