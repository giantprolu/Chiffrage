import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const entries = await prisma.entry.findMany({
    where: { userId },
    select: { client: true },
    distinct: ["client"],
    orderBy: { client: "asc" },
  });

  const clients = entries.map((e) => e.client);
  return NextResponse.json(clients);
}
