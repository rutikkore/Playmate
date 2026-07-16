import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const turfs = await prisma.turf.findMany({ include: { _count: { select: { slots: true } } } });
  for (const t of turfs) {
    console.log(`Turf ${t.name}: ${t._count.slots} slots`);
  }
}
run().finally(() => prisma.$disconnect());
