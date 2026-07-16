import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const providerUser = await prisma.user.findUnique({
    where: { firebaseUid: 'demo-provider-uid' }
  });
  console.log("Demo provider user:", providerUser);
  const profile = await prisma.providerProfile.findUnique({
    where: { userId: providerUser?.id }
  });
  console.log("Profile:", profile);
}
run().finally(() => prisma.$disconnect());
