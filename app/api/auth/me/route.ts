import db from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const userId = await getSessionUserId();

  if (!userId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const result = await db.execute({
    sql: "SELECT id, username FROM User WHERE id = ?",
    args: [userId],
  });

  const user = result.rows[0];

  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  return NextResponse.json(user);
}
