import { prisma } from "../config/db.js";
import { SlotStatus } from "@prisma/client";

export async function getSlots(turfId: string, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  return await prisma.availabilitySlot.findMany({
    where: {
      turfId,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      booking: true,
    },
    orderBy: {
      startTime: "asc",
    },
  });
}

export async function upsertSlots(
  turfId: string,
  date: Date,
  slots: Array<{ startTime: string; endTime: string; status: SlotStatus; price?: number }>
) {
  // Use transaction to upsert all slots atomically
  return await prisma.$transaction(
    slots.map((slot) =>
      prisma.availabilitySlot.upsert({
        where: {
          turfId_date_startTime: {
            turfId,
            date: date,
            startTime: slot.startTime,
          },
        },
        update: {
          status: slot.status,
          price: slot.price,
          endTime: slot.endTime,
        },
        create: {
          turfId,
          date: date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: slot.status,
          price: slot.price,
        },
      })
    )
  );
}
