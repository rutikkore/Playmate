import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const turfs = await prisma.turf.findMany({ where: { name: 'Green Arena 5-a-side' } });
  const dateStr = "2026-07-07T00:00:00.000Z";
  const date = new Date(dateStr);
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  for (const t of turfs) {
    const slots = await prisma.availabilitySlot.findMany({
      where: {
        turfId: t.id,
        date: { gte: startOfDay, lte: endOfDay }
      }
    });
    console.log(`Turf ${t.id} (${t.createdAt.toISOString()}) slots on ${dateStr}:`, slots.length);
  }
}
run().finally(() => prisma.$disconnect());
