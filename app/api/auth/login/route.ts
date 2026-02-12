import db from "@/lib/db";
import { verifyPassword, setSessionCookie } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json(
      { error: "Nom d'utilisateur et mot de passe requis" },
      { status: 400 }
    );
  }

  const result = await db.execute({
    sql: "SELECT id, username, password FROM User WHERE username = ?",
    args: [username.trim().toLowerCase()],
  });

  const user = result.rows[0];

  if (!user || !verifyPassword(password, user.password as string)) {
    return NextResponse.json(
      { error: "Identifiants incorrects" },
      { status: 401 }
    );
  }

  await setSessionCookie(user.id as number);

  return NextResponse.json({ id: user.id, username: user.username });
}
