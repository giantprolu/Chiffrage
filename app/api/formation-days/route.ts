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

  const days = await prisma.formationDay.findMany({
    where: {
      date: { gte: startDate, lt: endDate },
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(days);
}
