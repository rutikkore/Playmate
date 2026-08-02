import { prisma } from "../config/db.js";
import { SlotStatus } from "@prisma/client";

export async function getSlots(turfId: string, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const slots = await prisma.availabilitySlot.findMany({
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

  if (slots.length === 0) {
    const timeSlots = [
      "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
      "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
      "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM",
    ];

    const slotsToInsert = timeSlots.map((time) => {
      const [hourStr, modifier] = time.split(" ");
      let [hours] = hourStr.split(":").map(Number);
      if (modifier === "PM" && hours < 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      let endHours = hours + 1;
      let endModifier = "AM";
      if (endHours >= 12) {
        endModifier = "PM";
        if (endHours > 12) endHours -= 12;
      } else if (endHours === 0) {
        endHours = 12;
      }
      const endTime = `${endHours}:00 ${endModifier}`;

      return {
        turfId,
        date: startOfDay,
        startTime: time,
        endTime: endTime,
        status: SlotStatus.AVAILABLE,
      };
    });

    await prisma.availabilitySlot.createMany({
      data: slotsToInsert,
      skipDuplicates: true,
    });

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

  return slots;
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
