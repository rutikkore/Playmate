import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const slots = await prisma.availabilitySlot.findMany({
    where: { turfId: 'cmr64o57e0008149d1cm2qf4o' },
    select: { date: true },
    distinct: ['date']
  });
  console.log('Dates for cmr64o57e0008149d1cm2qf4o:', slots.map(s => s.date.toISOString()));
}
run().finally(() => prisma.$disconnect());
