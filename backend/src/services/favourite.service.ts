import { prisma } from "../config/db.js";

export async function getFavourites(userId: string) {
  return await prisma.favourite.findMany({
    where: { userId },
    include: {
      turf: {
        include: {
          sports: {
            include: {
              sport: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function addFavourite(userId: string, turfId: string) {
  // Check if turf exists and is not deleted
  const turf = await prisma.turf.findFirst({
    where: { id: turfId, isDeleted: false },
  });
  if (!turf) {
    throw new Error("Turf not found");
  }

  return await prisma.favourite.upsert({
    where: {
      userId_turfId: {
        userId,
        turfId,
      },
    },
    update: {}, // nothing to update if it exists
    create: {
      userId,
      turfId,
    },
  });
}

export async function removeFavourite(userId: string, turfId: string) {
  return await prisma.favourite.delete({
    where: {
      userId_turfId: {
        userId,
        turfId,
      },
    },
  });
}
