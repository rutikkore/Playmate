import { prisma } from "../config/db.js";
import { Role, VerificationStatus } from "@prisma/client";

export async function getProfileByUserId(userId: string) {
  return await prisma.providerProfile.findUnique({
    where: { userId },
    include: {
      user: true,
    },
  });
}

export async function createProfile(
  userId: string,
  data: { businessName: string; contactPhone?: string }
) {
  // Use transaction to ensure both user role update and profile creation succeed
  return await prisma.$transaction(async (tx) => {
    // 1. Update user role to PROVIDER
    await tx.user.update({
      where: { id: userId },
      data: { role: Role.PROVIDER },
    });

    // 2. Create provider profile
    return await tx.providerProfile.create({
      data: {
        userId,
        businessName: data.businessName,
        contactPhone: data.contactPhone,
        verificationStatus: VerificationStatus.PENDING, // default
      },
    });
  });
}

export async function updateProfile(
  userId: string,
  data: { businessName?: string; contactPhone?: string }
) {
  return await prisma.providerProfile.update({
    where: { userId },
    data: {
      businessName: data.businessName,
      contactPhone: data.contactPhone,
    },
  });
}
