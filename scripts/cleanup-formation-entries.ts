import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const formationDays = await prisma.formationDay.findMany();
  let deleted = 0;

  for (const fd of formationDays) {
    const d = new Date(fd.date);
    const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
    const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1, 0, 0, 0));
    const result = await prisma.entry.deleteMany({
      where: { date: { gte: start, lt: end } },
    });
    deleted += result.count;
  }

  console.log(`Deleted ${deleted} entries on formation days`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
