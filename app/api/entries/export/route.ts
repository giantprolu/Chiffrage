import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "csv";
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json(
      { error: "from and to dates are required" },
      { status: 400 }
    );
  }

  const entries = await prisma.entry.findMany({
    where: {
      date: { gte: new Date(from + "T00:00:00Z"), lte: new Date(to + "T23:59:59Z") },
      userId,
    },
    orderBy: { date: "asc" },
  });

  if (format === "csv") {
    const header = "Date,Jour,Client,Ticket,Commentaires,Temps,Type";
    const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const rows = entries.map((e) => {
      const d = new Date(e.date);
      const day = days[d.getUTCDay()];
      const dateStr = `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${d.getUTCFullYear()}`;
      const escapeCsv = (s: string | null) => {
        if (!s) return "";
        if (s.includes(",") || s.includes('"') || s.includes("\n")) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      };
      return `${dateStr},${day},${escapeCsv(e.client)},${escapeCsv(e.ticket)},${escapeCsv(e.comment)},${e.time},${escapeCsv(e.type)}`;
    });

    const csv = [header, ...rows].join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="chiffrage_${from}_${to}.csv"`,
      },
    });
  }

  // Excel format - return JSON for client-side xlsx conversion
  return NextResponse.json(entries);
}
