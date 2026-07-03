import { prisma } from "../config/db.js";
import { Role } from "@prisma/client";

export async function syncUserWithPostgres(userData: {
  firebaseUid: string;
  email: string;
  name?: string;
  photoUrl?: string;
  role?: string;
  emailVerified?: boolean;
}) {
  const dbRole = userData.role?.toUpperCase() === "PROVIDER" ? Role.PROVIDER : Role.PLAYER;

  return await prisma.user.upsert({
    where: { firebaseUid: userData.firebaseUid },
    update: {
      email: userData.email,
      name: userData.name,
      photoUrl: userData.photoUrl,
      emailVerified: userData.emailVerified,
      ...(userData.role ? { role: dbRole } : {}),
    },
    create: {
      firebaseUid: userData.firebaseUid,
      email: userData.email,
      name: userData.name,
      photoUrl: userData.photoUrl,
      role: dbRole,
      emailVerified: userData.emailVerified || false,
    },
  });
}
