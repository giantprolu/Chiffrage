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

  const formationTime = time === 0.5 ? 0.5 : 1;
  const formationDate = new Date(date + "T12:00:00Z");

  // Check it's not a weekend
  const dow = formationDate.getUTCDay();
  if (dow === 0 || dow === 6) {
    return NextResponse.json(
      { error: "Impossible d'ajouter une formation le weekend" },
      { status: 400 }
    );
  }

  const dayStart = new Date(Date.UTC(formationDate.getUTCFullYear(), formationDate.getUTCMonth(), formationDate.getUTCDate(), 0, 0, 0)).toISOString();
  const dayEnd = new Date(Date.UTC(formationDate.getUTCFullYear(), formationDate.getUTCMonth(), formationDate.getUTCDate() + 1, 0, 0, 0)).toISOString();

  // Check it's not a congé day
  const congeCheck = await db.execute({
    sql: "SELECT id FROM CongeDay WHERE date >= ? AND date < ? AND userId = ? LIMIT 1",
    args: [dayStart, dayEnd, userId],
  });
  if (congeCheck.rows.length > 0) {
    return NextResponse.json(
      { error: "Impossible d'ajouter une formation sur un jour de congé" },
      { status: 400 }
    );
  }

  // Delete entries on that day only if full-day formation
  if (formationTime >= 1) {
    await db.execute({
      sql: "DELETE FROM Entry WHERE date >= ? AND date < ? AND userId = ?",
      args: [dayStart, dayEnd, userId],
    });
  } else {
    // For half-day formation, delete entries that would exceed remaining time (0.5j)
    const existingEntries = await db.execute({
      sql: "SELECT id, time FROM Entry WHERE date >= ? AND date < ? AND userId = ? ORDER BY createdAt DESC",
      args: [dayStart, dayEnd, userId],
    });
    const maxTime = 1 - formationTime;
    let usedTime = 0;
    for (const entry of existingEntries.rows) {
      usedTime += entry.time as number;
      if (usedTime > maxTime) {
        await db.execute({ sql: "DELETE FROM Entry WHERE id = ?", args: [entry.id] });
      }
    }
  }

  // Find existing formation for this user on this day
  const existing = await db.execute({
    sql: "SELECT id FROM FormationDay WHERE date >= ? AND date < ? AND userId = ? LIMIT 1",
    args: [dayStart, dayEnd, userId],
  });

  let formation;
  if (existing.rows.length > 0) {
    const result = await db.execute({
      sql: "UPDATE FormationDay SET label = ?, time = ? WHERE id = ? RETURNING *",
      args: [label || "FORMATION", formationTime, existing.rows[0].id],
    });
    formation = result.rows[0];
  } else {
    const result = await db.execute({
      sql: "INSERT INTO FormationDay (date, label, time, userId) VALUES (?, ?, ?, ?) RETURNING *",
      args: [formationDate.toISOString(), label || "FORMATION", formationTime, userId],
    });
    formation = result.rows[0];
  }

  return NextResponse.json(formation, { status: 201 });
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

  const formationDate = new Date(date + "T12:00:00Z");
  const dayStart = new Date(Date.UTC(formationDate.getUTCFullYear(), formationDate.getUTCMonth(), formationDate.getUTCDate(), 0, 0, 0)).toISOString();
  const dayEnd = new Date(Date.UTC(formationDate.getUTCFullYear(), formationDate.getUTCMonth(), formationDate.getUTCDate() + 1, 0, 0, 0)).toISOString();

  await db.execute({
    sql: "DELETE FROM FormationDay WHERE date >= ? AND date < ? AND userId = ?",
    args: [dayStart, dayEnd, userId],
  });

  return NextResponse.json({ success: true });
}
