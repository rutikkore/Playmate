import { prisma } from "../config/db.js";

export async function getAllSports() {
  return await prisma.sport.findMany({
    orderBy: { name: "asc" },
  });
}
