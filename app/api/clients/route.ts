import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const entries = await prisma.entry.findMany({
    select: { client: true },
    distinct: ["client"],
    orderBy: { client: "asc" },
  });

  const clients = entries.map((e) => e.client);
  return NextResponse.json(clients);
}
