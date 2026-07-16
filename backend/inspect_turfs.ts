import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const turfs = await prisma.turf.findMany({
    orderBy: { createdAt: 'asc' }
  });
  console.log(turfs.map(t => ({ id: t.id, name: t.name, providerId: t.providerId, createdAt: t.createdAt })));
  
  const providers = await prisma.providerProfile.findMany();
  console.log("Providers:", providers);
}
run().finally(() => prisma.$disconnect());
