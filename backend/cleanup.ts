import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const turfs = await prisma.turf.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const nameMap = new Map<string, string>();
  const toDelete: string[] = [];

  for (const t of turfs) {
    if (!nameMap.has(t.name)) {
      nameMap.set(t.name, t.id); // keep the newest one
    } else {
      toDelete.push(t.id);
    }
  }

  if (toDelete.length > 0) {
    console.log(`Deleting ${toDelete.length} duplicate turfs...`);
    await prisma.turf.deleteMany({
      where: { id: { in: toDelete } }
    });
    console.log("Deleted duplicates.");
  } else {
    console.log("No duplicates found.");
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
