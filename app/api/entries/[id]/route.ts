import db from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const entryId = parseInt(id);
  const body = await request.json();
  const { date, client, ticket, comment, time, type } = body;

  // Verify ownership
  const existing = await db.execute({
    sql: "SELECT id, userId FROM Entry WHERE id = ?",
    args: [entryId],
  });
  if (existing.rows.length === 0 || existing.rows[0].userId !== userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const now = new Date().toISOString();
  const result = await db.execute({
    sql: `UPDATE Entry SET
      date = COALESCE(?, date),
      client = COALESCE(?, client),
      ticket = ?,
      comment = COALESCE(?, comment),
      time = COALESCE(?, time),
      type = ?,
      updatedAt = ?
      WHERE id = ? RETURNING *`,
    args: [
      date ? new Date(date + "T12:00:00Z").toISOString() : null,
      client || null,
      ticket ?? null,
      comment || null,
      time != null ? parseFloat(time) : null,
      type ?? null,
      now,
      entryId,
    ],
  });

  return NextResponse.json(result.rows[0]);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const entryId = parseInt(id);

  // Verify ownership
  const existing = await db.execute({
    sql: "SELECT id, userId FROM Entry WHERE id = ?",
    args: [entryId],
  });
  if (existing.rows.length === 0 || existing.rows[0].userId !== userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  await db.execute({
    sql: "DELETE FROM Entry WHERE id = ?",
    args: [entryId],
  });

  return NextResponse.json({ success: true });
}
