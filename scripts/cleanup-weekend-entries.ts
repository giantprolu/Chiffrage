import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Find and delete entries on weekends
  const allEntries = await prisma.entry.findMany();
  let deleted = 0;

  for (const entry of allEntries) {
    const day = entry.date.getUTCDay(); // 0=Sun, 6=Sat
    if (day === 0 || day === 6) {
      await prisma.entry.delete({ where: { id: entry.id } });
      console.log(
        `Deleted entry: ${entry.date.toISOString().slice(0, 10)} - ${entry.client} (${entry.comment})`
      );
      deleted++;
    }
  }

  // Find and delete formation days on weekends
  const allFormation = await prisma.formationDay.findMany();
  let deletedFormation = 0;

  for (const f of allFormation) {
    const day = f.date.getUTCDay();
    if (day === 0 || day === 6) {
      await prisma.formationDay.delete({ where: { id: f.id } });
      console.log(
        `Deleted formation day: ${f.date.toISOString().slice(0, 10)} - ${f.label}`
      );
      deletedFormation++;
    }
  }

  console.log(`\nDone: ${deleted} entries and ${deletedFormation} formation days on weekends removed.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
