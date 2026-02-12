import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { date, client, ticket, comment, time, type } = body;

  // Verify ownership
  const existing = await prisma.entry.findUnique({ where: { id: parseInt(id) } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const entry = await prisma.entry.update({
    where: { id: parseInt(id) },
    data: {
      date: date ? new Date(date + "T12:00:00Z") : undefined,
      client,
      ticket: ticket ?? undefined,
      comment,
      time: time != null ? parseFloat(time) : undefined,
      type: type ?? undefined,
    },
  });

  return NextResponse.json(entry);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;

  // Verify ownership
  const existing = await prisma.entry.findUnique({ where: { id: parseInt(id) } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  await prisma.entry.delete({
    where: { id: parseInt(id) },
  });

  return NextResponse.json({ success: true });
}
