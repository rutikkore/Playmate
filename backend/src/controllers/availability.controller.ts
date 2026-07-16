import { Response, Request } from "express";
import { DBAuthenticatedRequest } from "../middleware/role.middleware.js";
import { getSlots, upsertSlots } from "../services/availability.service.js";
import { prisma } from "../config/db.js";
import { SlotStatus } from "@prisma/client";

export async function getAvailability(req: Request, res: Response) {
  try {
    const { turfId, date: dateStr } = req.query;

    if (!turfId || typeof turfId !== "string") {
      return res.status(400).json({ error: "Missing or invalid turfId" });
    }
    if (!dateStr || typeof dateStr !== "string") {
      return res.status(400).json({ error: "Missing or invalid date" });
    }

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const slots = await getSlots(turfId, date);
    return res.status(200).json({ slots });
  } catch (error) {
    console.error("getAvailability error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function updateAvailability(req: DBAuthenticatedRequest, res: Response) {
  try {
    if (!req.dbUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { turfId, date: dateStr, slots } = req.body;

    if (!turfId || typeof turfId !== "string") {
      return res.status(400).json({ error: "Missing or invalid turfId" });
    }
    if (!dateStr || typeof dateStr !== "string") {
      return res.status(400).json({ error: "Missing or invalid date" });
    }
    if (!Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ error: "Slots must be a non-empty array" });
    }

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    // Verify provider profile
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: req.dbUser.id },
    });
    if (!providerProfile) {
      return res.status(403).json({ error: "Forbidden: Provider profile required" });
    }

    // Verify provider owns the turf
    const turf = await prisma.turf.findFirst({
      where: { id: turfId, providerId: providerProfile.id, isDeleted: false },
    });
    if (!turf) {
      return res.status(403).json({ error: "Forbidden: You do not own this turf" });
    }

    // Validate each slot in the request
    for (const slot of slots) {
      if (!slot.startTime || typeof slot.startTime !== "string") {
        return res.status(400).json({ error: "Each slot must have a valid startTime" });
      }
      if (!slot.endTime || typeof slot.endTime !== "string") {
        return res.status(400).json({ error: "Each slot must have a valid endTime" });
      }
      if (slot.status !== SlotStatus.AVAILABLE && slot.status !== SlotStatus.BLOCKED) {
        return res.status(400).json({ error: "Each slot status must be AVAILABLE or BLOCKED" });
      }

      // M3: Check for active booking before allowing BLOCKED status
      if (slot.status === SlotStatus.BLOCKED) {
        const existingSlot = await prisma.availabilitySlot.findUnique({
          where: {
            turfId_date_startTime: {
              turfId,
              date: date,
              startTime: slot.startTime,
            }
          },
          include: { booking: true }
        });
        
        if (existingSlot?.booking && existingSlot.booking.status !== 'CANCELLED') {
          return res.status(400).json({ error: `Cannot block slot ${slot.startTime} because it has an active booking.` });
        }
      }
    }

    const updatedSlots = await upsertSlots(
      turfId,
      date,
      slots.map((s) => ({
        startTime: s.startTime,
        endTime: s.endTime,
        status: s.status as SlotStatus,
        price: s.price !== undefined ? Number(s.price) : undefined,
      }))
    );

    return res.status(200).json({ slots: updatedSlots });
  } catch (error) {
    console.error("updateAvailability error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
