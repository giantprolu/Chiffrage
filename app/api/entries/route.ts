import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const month = parseInt(searchParams.get("month") || "");
  const year = parseInt(searchParams.get("year") || "");

  if (isNaN(month) || isNaN(year)) {
    return NextResponse.json(
      { error: "month and year are required" },
      { status: 400 }
    );
  }

  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 1));

  const entries = await prisma.entry.findMany({
    where: {
      date: { gte: startDate, lt: endDate },
      userId,
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(entries);
}

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json();
  const { date, client, ticket, comment, time, type } = body;

  if (!date || !client || !comment || time == null) {
    return NextResponse.json(
      { error: "date, client, comment, and time are required" },
      { status: 400 }
    );
  }

  // Block entries on formation days
  const entryDate = new Date(date + "T12:00:00Z");

  // Block weekends
  const dow = entryDate.getUTCDay();
  if (dow === 0 || dow === 6) {
    return NextResponse.json(
      { error: "Impossible d'ajouter une entrée le weekend" },
      { status: 400 }
    );
  }

  const dayStart = new Date(Date.UTC(entryDate.getUTCFullYear(), entryDate.getUTCMonth(), entryDate.getUTCDate(), 0, 0, 0));
  const dayEnd = new Date(Date.UTC(entryDate.getUTCFullYear(), entryDate.getUTCMonth(), entryDate.getUTCDate() + 1, 0, 0, 0));

  const formationDay = await prisma.formationDay.findFirst({
    where: { date: { gte: dayStart, lt: dayEnd } },
  });
  if (formationDay) {
    return NextResponse.json(
      { error: "Impossible d'ajouter une entrée sur un jour de formation" },
      { status: 400 }
    );
  }

  // Block entries on congé days (full day only)
  const congeDay = await prisma.congeDay.findFirst({
    where: { date: { gte: dayStart, lt: dayEnd }, userId },
  });
  if (congeDay && congeDay.time >= 1) {
    return NextResponse.json(
      { error: "Impossible d'ajouter une entrée sur un jour de congé complet" },
      { status: 400 }
    );
  }

  const entry = await prisma.entry.create({
    data: {
      date: entryDate,
      client,
      ticket: ticket || null,
      comment,
      time: parseFloat(time),
      type: type || null,
      userId,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
