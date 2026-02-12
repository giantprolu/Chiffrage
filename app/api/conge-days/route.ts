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
    sql: "SELECT * FROM CongeDay WHERE date >= ? AND date < ? AND userId = ? ORDER BY date ASC",
    args: [startDate, endDate, userId],
  });

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json();
  const { date, label, time } = body;

  if (!date) {
    return NextResponse.json(
      { error: "date is required" },
      { status: 400 }
    );
  }

  const congeTime = time === 0.5 ? 0.5 : 1;
  const congeDate = new Date(date + "T12:00:00Z");

  // Check it's not a weekend
  const dow = congeDate.getUTCDay();
  if (dow === 0 || dow === 6) {
    return NextResponse.json(
      { error: "Impossible d'ajouter un congé le weekend" },
      { status: 400 }
    );
  }

  // Check it's not a formation day
  const dayStart = new Date(Date.UTC(congeDate.getUTCFullYear(), congeDate.getUTCMonth(), congeDate.getUTCDate(), 0, 0, 0)).toISOString();
  const dayEnd = new Date(Date.UTC(congeDate.getUTCFullYear(), congeDate.getUTCMonth(), congeDate.getUTCDate() + 1, 0, 0, 0)).toISOString();

  const formationCheck = await db.execute({
    sql: "SELECT id, time FROM FormationDay WHERE date >= ? AND date < ? AND userId = ? LIMIT 1",
    args: [dayStart, dayEnd, userId],
  });
  if (formationCheck.rows.length > 0) {
    return NextResponse.json(
      { error: "Impossible d'ajouter un congé sur un jour de formation" },
      { status: 400 }
    );
  }

  // Delete entries on that day only if full-day congé
  if (congeTime >= 1) {
    await db.execute({
      sql: "DELETE FROM Entry WHERE date >= ? AND date < ? AND userId = ?",
      args: [dayStart, dayEnd, userId],
    });
  } else {
    // For half-day congé, delete entries that would exceed remaining time (0.5j)
    const existingEntries = await db.execute({
      sql: "SELECT id, time FROM Entry WHERE date >= ? AND date < ? AND userId = ? ORDER BY createdAt DESC",
      args: [dayStart, dayEnd, userId],
    });
    const maxTime = 1 - congeTime;
    let usedTime = 0;
    for (const entry of existingEntries.rows) {
      usedTime += entry.time as number;
      if (usedTime > maxTime) {
        await db.execute({ sql: "DELETE FROM Entry WHERE id = ?", args: [entry.id] });
      }
    }
  }

  // Find existing congé for this user on this day
  const existing = await db.execute({
    sql: "SELECT id FROM CongeDay WHERE date >= ? AND date < ? AND userId = ? LIMIT 1",
    args: [dayStart, dayEnd, userId],
  });

  let conge;
  if (existing.rows.length > 0) {
    const result = await db.execute({
      sql: "UPDATE CongeDay SET label = ?, time = ? WHERE id = ? RETURNING *",
      args: [label || "CONGÉ", congeTime, existing.rows[0].id],
    });
    conge = result.rows[0];
  } else {
    const result = await db.execute({
      sql: "INSERT INTO CongeDay (date, label, time, userId) VALUES (?, ?, ?, ?) RETURNING *",
      args: [congeDate.toISOString(), label || "CONGÉ", congeTime, userId],
    });
    conge = result.rows[0];
  }

  return NextResponse.json(conge, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json(
      { error: "date is required" },
      { status: 400 }
    );
  }

  const congeDate = new Date(date + "T12:00:00Z");
  const dayStart = new Date(Date.UTC(congeDate.getUTCFullYear(), congeDate.getUTCMonth(), congeDate.getUTCDate(), 0, 0, 0)).toISOString();
  const dayEnd = new Date(Date.UTC(congeDate.getUTCFullYear(), congeDate.getUTCMonth(), congeDate.getUTCDate() + 1, 0, 0, 0)).toISOString();

  await db.execute({
    sql: "DELETE FROM CongeDay WHERE date >= ? AND date < ? AND userId = ?",
    args: [dayStart, dayEnd, userId],
  });

  return NextResponse.json({ success: true });
}
