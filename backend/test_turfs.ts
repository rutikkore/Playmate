import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const turfs = await prisma.turf.findMany({ select: { id: true, name: true, providerId: true } });
  console.log("All Turfs:");
  console.log(turfs);
}
run().finally(() => prisma.$disconnect());
