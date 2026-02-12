import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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

  const days = await prisma.congeDay.findMany({
    where: {
      date: { gte: startDate, lt: endDate },
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(days);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { date, label, time } = body;

  if (!date) {
    return NextResponse.json(
      { error: "date is required" },
      { status: 400 }
    );
  }

  const congeTime = time === 0.5 ? 0.5 : 1;
  const congeDate = new Date(date + "T12:00:00Z");

  // Check it's not a weekend
  const dow = congeDate.getUTCDay();
  if (dow === 0 || dow === 6) {
    return NextResponse.json(
      { error: "Impossible d'ajouter un congé le weekend" },
      { status: 400 }
    );
  }

  // Check it's not a formation day
  const formationDay = await prisma.formationDay.findFirst({
    where: {
      date: {
        gte: new Date(Date.UTC(congeDate.getUTCFullYear(), congeDate.getUTCMonth(), congeDate.getUTCDate(), 0, 0, 0)),
        lt: new Date(Date.UTC(congeDate.getUTCFullYear(), congeDate.getUTCMonth(), congeDate.getUTCDate() + 1, 0, 0, 0)),
      },
    },
  });
  if (formationDay) {
    return NextResponse.json(
      { error: "Impossible d'ajouter un congé sur un jour de formation" },
      { status: 400 }
    );
  }

  // Delete entries on that day only if full-day congé
  if (congeTime >= 1) {
    await prisma.entry.deleteMany({
      where: {
        date: {
          gte: new Date(Date.UTC(congeDate.getUTCFullYear(), congeDate.getUTCMonth(), congeDate.getUTCDate(), 0, 0, 0)),
          lt: new Date(Date.UTC(congeDate.getUTCFullYear(), congeDate.getUTCMonth(), congeDate.getUTCDate() + 1, 0, 0, 0)),
        },
      },
    });
  } else {
    // For half-day congé, delete entries that would exceed remaining time (0.5j)
    const existingEntries = await prisma.entry.findMany({
      where: {
        date: {
          gte: new Date(Date.UTC(congeDate.getUTCFullYear(), congeDate.getUTCMonth(), congeDate.getUTCDate(), 0, 0, 0)),
          lt: new Date(Date.UTC(congeDate.getUTCFullYear(), congeDate.getUTCMonth(), congeDate.getUTCDate() + 1, 0, 0, 0)),
        },
      },
      orderBy: { createdAt: "desc" },
    });
    const maxTime = 1 - congeTime;
    let usedTime = 0;
    for (const entry of existingEntries) {
      usedTime += entry.time;
      if (usedTime > maxTime) {
        await prisma.entry.delete({ where: { id: entry.id } });
      }
    }
  }

  const conge = await prisma.congeDay.upsert({
    where: { date: congeDate },
    update: { label: label || "CONGÉ", time: congeTime },
    create: { date: congeDate, label: label || "CONGÉ", time: congeTime },
  });

  return NextResponse.json(conge, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json(
      { error: "date is required" },
      { status: 400 }
    );
  }

  const congeDate = new Date(date + "T12:00:00Z");

  await prisma.congeDay.deleteMany({
    where: {
      date: {
        gte: new Date(Date.UTC(congeDate.getUTCFullYear(), congeDate.getUTCMonth(), congeDate.getUTCDate(), 0, 0, 0)),
        lt: new Date(Date.UTC(congeDate.getUTCFullYear(), congeDate.getUTCMonth(), congeDate.getUTCDate() + 1, 0, 0, 0)),
      },
    },
  });

  return NextResponse.json({ success: true });
}
