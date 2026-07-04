import { prisma } from "../config/db.js";

export async function findTurfs(filters: {
  sport?: string;
  search?: string;
  location?: string;
  providerId?: string;
}) {
  const whereClause: any = {
    isDeleted: false,
  };

  if (filters.providerId) {
    whereClause.providerId = filters.providerId;
  } else {
    whereClause.status = "active";
  }

  if (filters.location) {
    whereClause.location = {
      contains: filters.location,
      mode: "insensitive",
    };
  }

  if (filters.search) {
    whereClause.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { location: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.sport && filters.sport !== "All") {
    whereClause.sports = {
      some: {
        sport: {
          OR: [
            { name: { contains: filters.sport, mode: "insensitive" } },
            { slug: { contains: filters.sport, mode: "insensitive" } },
          ],
        },
      },
    };
  }

  return await prisma.turf.findMany({
    where: whereClause,
    include: {
      sports: {
        include: {
          sport: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTurfById(id: string) {
  return await prisma.turf.findFirst({
    where: { id, isDeleted: false },
    include: {
      sports: {
        include: {
          sport: true,
        },
      },
      provider: true,
    },
  });
}

export async function createTurf(
  providerId: string,
  data: {
    name: string;
    description?: string;
    location: string;
    pricePerHour: number;
    courts: number;
    images?: string[];
    sports: string[]; // array of sport IDs
  }
) {
  return await prisma.$transaction(async (tx) => {
    const turf = await tx.turf.create({
      data: {
        name: data.name,
        description: data.description,
        location: data.location,
        pricePerHour: data.pricePerHour,
        courts: data.courts,
        images: data.images || [],
        providerId,
        status: "active",
      },
    });

    if (data.sports && data.sports.length > 0) {
      await tx.turfSport.createMany({
        data: data.sports.map((sportId) => ({
          turfId: turf.id,
          sportId,
        })),
      });
    }

    return turf;
  });
}

export async function updateTurf(
  id: string,
  providerId: string,
  data: {
    name?: string;
    description?: string;
    location?: string;
    pricePerHour?: number;
    courts?: number;
    images?: string[];
    status?: string;
    sports?: string[]; // array of sport IDs
  }
) {
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.turf.findFirst({
      where: { id, providerId, isDeleted: false },
    });
    if (!existing) {
      throw new Error("Turf not found or not owned by provider");
    }

    const turf = await tx.turf.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        location: data.location,
        pricePerHour: data.pricePerHour,
        courts: data.courts,
        images: data.images,
        status: data.status,
      },
    });

    if (data.sports !== undefined) {
      await tx.turfSport.deleteMany({
        where: { turfId: id },
      });
      if (data.sports.length > 0) {
        await tx.turfSport.createMany({
          data: data.sports.map((sportId) => ({
            turfId: id,
            sportId,
          })),
        });
      }
    }

    return turf;
  });
}

export async function softDeleteTurf(id: string, providerId: string) {
  const existing = await prisma.turf.findFirst({
    where: { id, providerId, isDeleted: false },
  });
  if (!existing) {
    throw new Error("Turf not found or not owned by provider");
  }

  return await prisma.turf.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });
}
