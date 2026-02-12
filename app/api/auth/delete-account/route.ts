import { prisma } from "@/lib/prisma";
import { getSessionUserId, clearSessionCookie } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function DELETE() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Delete all user data then the user itself
  await prisma.$transaction([
    prisma.entry.deleteMany({ where: { userId } }),
    prisma.congeDay.deleteMany({ where: { userId } }),
    prisma.formationDay.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);

  await clearSessionCookie();

  return NextResponse.json({ success: true });
}
