import db from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const result = await db.execute({
    sql: "SELECT DISTINCT client FROM Entry WHERE userId = ? ORDER BY client ASC",
    args: [userId],
  });

  const clients = result.rows.map((r) => r.client as string);
  return NextResponse.json(clients);
}
