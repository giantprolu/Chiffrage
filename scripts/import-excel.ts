import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";
import * as path from "path";

const prisma = new PrismaClient();

// All sheets have the same columns: Date | Jour | Client | Ticket | Commentaires | Temps | Type
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

async function main() {
  const filePath = path.resolve(process.cwd(), "Chiffrage_Nathan.xlsx");
  console.log(`Reading: ${filePath}`);

  const workbook = XLSX.readFile(filePath);
  let totalImported = 0;

  for (const sheetName of workbook.SheetNames) {
    const sheetConfig = SHEET_MONTHS[sheetName];
    if (!sheetConfig) {
      console.log(`Skipping unknown sheet: ${sheetName}`);
      continue;
    }

    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

    const entries: {
      date: Date;
      client: string;
      ticket: string | null;
      comment: string;
      time: number;
      type: string | null;
    }[] = [];

    for (const row of rows) {
      const client = String(row["Client"] || "").trim();
      const comment = String(row["Commentaires"] || "").trim();

      // Skip empty rows
      if (!client && !comment) continue;

      // Parse date
      let date: Date | null = null;
      const rawDate = row["Date"];
      if (typeof rawDate === "number") {
        // Excel serial date
        const parsed = XLSX.SSF.parse_date_code(rawDate);
        date = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d, 12, 0, 0));
      } else if (typeof rawDate === "string" && rawDate.trim()) {
        // Parse string date and store at noon UTC
        const tmpDate = new Date(rawDate);
        date = new Date(Date.UTC(tmpDate.getFullYear(), tmpDate.getMonth(), tmpDate.getDate(), 12, 0, 0));
      }

      if (!date || isNaN(date.getTime())) {
        console.log(`  Skipping row with invalid date in ${sheetName}:`, rawDate);
        continue;
      }

      // Fix year: months Feb-Aug should be 2026
      if (sheetConfig.year === 2026 && date.getUTCFullYear() !== 2026) {
        date = new Date(Date.UTC(2026, date.getUTCMonth(), date.getUTCDate(), 12, 0, 0));
      }

      // Parse time
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

    if (entries.length > 0) {
      await prisma.entry.createMany({ data: entries });
      totalImported += entries.length;
      console.log(`  ${sheetName}: ${entries.length} entries imported`);
    } else {
      console.log(`  ${sheetName}: no entries found`);
    }
  }

  console.log(`\nTotal: ${totalImported} entries imported.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
