import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { date, client, ticket, comment, time, type } = body;

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
  const { id } = await params;

  await prisma.entry.delete({
    where: { id: parseInt(id) },
  });

  return NextResponse.json({ success: true });
}
