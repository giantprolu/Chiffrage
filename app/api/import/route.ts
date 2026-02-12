import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

const SHEET_MONTHS: Record<string, { month: number; year: number }> = {
  Septembre: { month: 9, year: 2025 },
  Octobre: { month: 10, year: 2025 },
  Novembre: { month: 11, year: 2025 },
  Décembre: { month: 12, year: 2025 },
  Decembre: { month: 12, year: 2025 },
  "Décembre ": { month: 12, year: 2025 },
  Janvier: { month: 1, year: 2026 },
  Février: { month: 2, year: 2026 },
  Fevrier: { month: 2, year: 2026 },
  "Février ": { month: 2, year: 2026 },
  Mars: { month: 3, year: 2026 },
  Avril: { month: 4, year: 2026 },
  Mai: { month: 5, year: 2026 },
  Juin: { month: 6, year: 2026 },
  Juillet: { month: 7, year: 2026 },
  Août: { month: 8, year: 2026 },
  Aout: { month: 8, year: 2026 },
};

interface ParsedEntry {
  date: Date;
  client: string;
  ticket: string | null;
  comment: string;
  time: number;
  type: string | null;
}

function parseExcel(buffer: ArrayBuffer): ParsedEntry[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const allEntries: ParsedEntry[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheetConfig = SHEET_MONTHS[sheetName];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

    for (const row of rows) {
      const client = String(row["Client"] || "").trim();
      const comment = String(row["Commentaires"] || row["Commentaire"] || "").trim();
      if (!client && !comment) continue;

      let date: Date | null = null;
      const rawDate = row["Date"];
      if (typeof rawDate === "number") {
        const parsed = XLSX.SSF.parse_date_code(rawDate);
        date = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d, 12, 0, 0));
      } else if (typeof rawDate === "string" && rawDate.trim()) {
        const tmpDate = new Date(rawDate);
        if (!isNaN(tmpDate.getTime())) {
          date = new Date(Date.UTC(tmpDate.getFullYear(), tmpDate.getMonth(), tmpDate.getDate(), 12, 0, 0));
        }
      }

      if (!date || isNaN(date.getTime())) continue;

      // Fix year based on sheet config if available
      if (sheetConfig && sheetConfig.year === 2026 && date.getUTCFullYear() !== 2026) {
        date = new Date(Date.UTC(2026, date.getUTCMonth(), date.getUTCDate(), 12, 0, 0));
      }

      const rawTime = row["Temps"];
      let time = 0;
      if (typeof rawTime === "number") {
        time = rawTime;
      } else if (typeof rawTime === "string") {
        time = parseFloat(rawTime.replace(",", ".")) || 0;
      }
      if (time <= 0) continue;

      const ticket = row["Ticket"] ? String(row["Ticket"]).trim() : null;
      const type = row["Type"] ? String(row["Type"]).trim() : null;

      allEntries.push({ date, client, ticket, comment, time, type });
    }
  }

  return allEntries;
}

function parseCsv(buffer: ArrayBuffer): ParsedEntry[] {
  // raw: true prevents XLSX from auto-converting dates (DD/MM/YYYY → US format)
  const workbook = XLSX.read(buffer, { type: "array", raw: true, cellDates: false });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { raw: true });
  const entries: ParsedEntry[] = [];

  for (const row of rows) {
    const client = String(row["Client"] || "").trim();
    const comment = String(row["Commentaires"] || row["Commentaire"] || "").trim();
    if (!client && !comment) continue;

    let date: Date | null = null;
    const rawDate = row["Date"];
    if (typeof rawDate === "number") {
      const parsed = XLSX.SSF.parse_date_code(rawDate);
      date = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d, 12, 0, 0));
    } else if (typeof rawDate === "string" && rawDate.trim()) {
      // Try DD/MM/YYYY or YYYY-MM-DD
      const parts = rawDate.split("/");
      if (parts.length === 3) {
        const [d, m, y] = parts.map(Number);
        date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
      } else {
        const tmpDate = new Date(rawDate);
        if (!isNaN(tmpDate.getTime())) {
          date = new Date(Date.UTC(tmpDate.getFullYear(), tmpDate.getMonth(), tmpDate.getDate(), 12, 0, 0));
        }
      }
    }

    if (!date || isNaN(date.getTime())) continue;

    const rawTime = row["Temps"];
    let time = 0;
    if (typeof rawTime === "number") {
      time = rawTime;
    } else if (typeof rawTime === "string") {
      time = parseFloat(rawTime.replace(",", ".")) || 0;
    }
    if (time <= 0) continue;

    const ticket = row["Ticket"] ? String(row["Ticket"]).trim() : null;
    const type = row["Type"] ? String(row["Type"]).trim() : null;

    entries.push({ date, client, ticket, comment, time, type });
  }

  return entries;
}

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const replaceExisting = formData.get("replace") === "true";

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const buffer = await file.arrayBuffer();

    let entries: ParsedEntry[];

    if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      entries = parseExcel(buffer);
    } else if (fileName.endsWith(".csv")) {
      entries = parseCsv(buffer);
    } else {
      return NextResponse.json(
        { error: "Format non supporté. Utilisez .xlsx, .xls ou .csv" },
        { status: 400 }
      );
    }

    if (entries.length === 0) {
      return NextResponse.json(
        { error: "Aucune entrée valide trouvée dans le fichier" },
        { status: 400 }
      );
    }

    // Optionally delete all existing entries for this user before importing
    if (replaceExisting) {
      await prisma.entry.deleteMany({ where: { userId } });
    }

    // Create all entries for this user
    const data = entries.map((e) => ({
      ...e,
      userId,
    }));

    await prisma.entry.createMany({ data });

    return NextResponse.json({
      message: `${entries.length} entrées importées avec succès`,
      count: entries.length,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'import du fichier" },
      { status: 500 }
    );
  }
}
