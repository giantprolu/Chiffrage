import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface FormationDayData {
  date: Date;
  label: string;
}

// Helper to create dates at noon UTC to avoid timezone offset issues
function utcDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day, 12, 0, 0));
}

const formationDays: FormationDayData[] = [
  // Septembre 2025 : 22-26, 29, 30
  ...[22, 23, 24, 25, 26, 29, 30].map((d) => ({
    date: utcDate(2025, 8, d),
    label: "FORMATION",
  })),
  // Octobre 2025 : 1, 2, 3, 20-24
  ...[1, 2, 3, 20, 21, 22, 23, 24].map((d) => ({
    date: utcDate(2025, 9, d),
    label: "FORMATION",
  })),
  // Novembre 2025 : 12, 13, 14
  ...[12, 13, 14].map((d) => ({
    date: utcDate(2025, 10, d),
    label: "FORMATION",
  })),
  // Décembre 2025 : 1-5, 15-19
  ...[1, 2, 3, 4, 5, 15, 16, 17, 18, 19].map((d) => ({
    date: utcDate(2025, 11, d),
    label: "FORMATION",
  })),
  // Janvier 2026 : 5-9
  ...[5, 6, 7, 8, 9].map((d) => ({
    date: utcDate(2026, 0, d),
    label: "FORMATION",
  })),
  // Février 2026 : 2-6, 23-27
  ...[2, 3, 4, 5, 6, 23, 24, 25, 26, 27].map((d) => ({
    date: utcDate(2026, 1, d),
    label: "FORMATION",
  })),
  // Mars 2026 : 16-20
  ...[16, 17, 18, 19, 20].map((d) => ({
    date: utcDate(2026, 2, d),
    label: "FORMATION",
  })),
  // Avril 2026 : 7-10, 27-30
  ...[7, 8, 9, 10, 27, 28, 29, 30].map((d) => ({
    date: utcDate(2026, 3, d),
    label: "FORMATION",
  })),
  // Mai 2026 : 18-22
  ...[18, 19, 20, 21, 22].map((d) => ({
    date: utcDate(2026, 4, d),
    label: "FORMATION",
  })),
  // Juin 2026 : 8-12, 15-19, 29-30
  ...[8, 9, 10, 11, 12, 15, 16, 17, 18, 19, 29, 30].map((d) => ({
    date: utcDate(2026, 5, d),
    label: "FORMATION",
  })),
  // Juillet 2026 : 1-3 FORMATION
  ...[1, 2, 3].map((d) => ({
    date: utcDate(2026, 6, d),
    label: "FORMATION",
  })),
  // Juillet 2026 : 7-11 SOUTENANCE
  ...[7, 8, 9, 10, 11].map((d) => ({
    date: utcDate(2026, 6, d),
    label: "SOUTENANCE",
  })),
];

async function main() {
  // Find the first user to assign formation days to
  const firstUser = await prisma.user.findFirst({ orderBy: { id: "asc" } });

  if (!firstUser) {
    console.log("No user found. Skipping formation days seed (formations are per-user).");
    return;
  }

  console.log(`Seeding formation days for user "${firstUser.username}" (id: ${firstUser.id})...`);

  for (const day of formationDays) {
    await prisma.formationDay.upsert({
      where: {
        date_userId: { date: day.date, userId: firstUser.id },
      },
      update: { label: day.label },
      create: { ...day, userId: firstUser.id },
    });
  }

  console.log(`Seeded ${formationDays.length} formation days.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
