import db from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";
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

  if (password.length < 4) {
    return NextResponse.json(
      { error: "Le mot de passe doit contenir au moins 4 caractères" },
      { status: 400 }
    );
  }

  const normalizedUsername = username.trim().toLowerCase();

  // Check if username already exists
  const existing = await db.execute({
    sql: "SELECT id FROM User WHERE username = ?",
    args: [normalizedUsername],
  });

  if (existing.rows.length > 0) {
    return NextResponse.json(
      { error: "Ce nom d'utilisateur est déjà pris" },
      { status: 409 }
    );
  }

  const result = await db.execute({
    sql: "INSERT INTO User (username, password) VALUES (?, ?) RETURNING id, username",
    args: [normalizedUsername, hashPassword(password)],
  });

  const user = result.rows[0];
  await setSessionCookie(user.id as number);

  return NextResponse.json({ id: user.id, username: user.username, isNew: true }, { status: 201 });
}
