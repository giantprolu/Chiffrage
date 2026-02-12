import { prisma } from "@/lib/prisma";
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
  const existing = await prisma.user.findUnique({
    where: { username: normalizedUsername },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Ce nom d'utilisateur est déjà pris" },
      { status: 409 }
    );
  }

  const user = await prisma.user.create({
    data: {
      username: normalizedUsername,
      password: hashPassword(password),
    },
  });

  await setSessionCookie(user.id);

  return NextResponse.json({ id: user.id, username: user.username, isNew: true }, { status: 201 });
}
