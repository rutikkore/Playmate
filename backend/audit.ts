import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const turfs = await prisma.turf.findMany({
    include: {
      slots: true,
    }
  });

  const nameMap = new Map<string, string[]>();
  for (const t of turfs) {
    if (!nameMap.has(t.name)) nameMap.set(t.name, []);
    nameMap.get(t.name)!.push(t.id);
  }

  for (const [name, ids] of nameMap.entries()) {
    if (ids.length > 1) {
      console.log(`Duplicate Turf found for name "${name}":`);
      for (const id of ids) {
        const slotsCount = await prisma.availabilitySlot.count({ where: { turfId: id } });
        console.log(`  - Turf ID: ${id}, Slots: ${slotsCount}`);
      }
    }
  }

  const allSlots = await prisma.availabilitySlot.findMany({ select: { id: true, turfId: true } });
  let orphanSlots = 0;
  for (const s of allSlots) {
    const t = turfs.find(t => t.id === s.turfId);
    if (!t) orphanSlots++;
  }
  console.log("Orphan slots:", orphanSlots);
}

run().catch(console.error).finally(() => prisma.$disconnect());
