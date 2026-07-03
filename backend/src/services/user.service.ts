import { prisma } from "../config/db.js";

export async function getUserProfile(firebaseUid: string) {
  return await prisma.user.findUnique({
    where: { firebaseUid },
  });
}
