import db from "@/lib/db";
import { getSessionUserId, clearSessionCookie } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function DELETE() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Delete all user data then the user itself
  await db.batch([
    { sql: "DELETE FROM Entry WHERE userId = ?", args: [userId] },
    { sql: "DELETE FROM CongeDay WHERE userId = ?", args: [userId] },
    { sql: "DELETE FROM FormationDay WHERE userId = ?", args: [userId] },
    { sql: "DELETE FROM User WHERE id = ?", args: [userId] },
  ]);

  await clearSessionCookie();

  return NextResponse.json({ success: true });
}
