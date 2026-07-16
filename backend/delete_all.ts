import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  console.log("Deleting all bookings...");
  await prisma.booking.deleteMany({});
  console.log("Deleting all turfs...");
  await prisma.turf.deleteMany({});
  console.log("Done.");
}
run().finally(() => prisma.$disconnect());
