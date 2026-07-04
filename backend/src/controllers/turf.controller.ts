import { Response, Request } from "express";
import { DBAuthenticatedRequest } from "../middleware/role.middleware.js";
import {
  findTurfs,
  getTurfById,
  createTurf,
  updateTurf,
  softDeleteTurf,
} from "../services/turf.service.js";
import { prisma } from "../config/db.js";

export async function getTurfs(req: Request, res: Response) {
  try {
    const { sport, search, location, providerId } = req.query;

    const turfs = await findTurfs({
      sport: sport ? String(sport) : undefined,
      search: search ? String(search) : undefined,
      location: location ? String(location) : undefined,
      providerId: providerId ? String(providerId) : undefined,
    });

    return res.status(200).json({ turfs });
  } catch (error) {
    console.error("getTurfs error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getTurf(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const turf = await getTurfById(id);
    if (!turf) {
      return res.status(404).json({ error: "Turf not found" });
    }
    return res.status(200).json({ turf });
  } catch (error) {
    console.error("getTurf error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function createNewTurf(req: DBAuthenticatedRequest, res: Response) {
  try {
    if (!req.dbUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get provider profile
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: req.dbUser.id },
    });
    if (!providerProfile) {
      return res.status(403).json({
        error: "Forbidden: Provider profile required to create turf",
      });
    }

    const { name, description, location, pricePerHour, courts, images, sports } = req.body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ error: "Invalid name: must be at least 2 characters" });
    }
    if (!location || typeof location !== "string" || location.trim().length < 2) {
      return res.status(400).json({ error: "Invalid location: must be at least 2 characters" });
    }
    const price = Number(pricePerHour);
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ error: "Invalid pricePerHour: must be a positive number" });
    }
    const numCourts = Number(courts);
    if (isNaN(numCourts) || numCourts <= 0 || !Number.isInteger(numCourts)) {
      return res.status(400).json({ error: "Invalid courts count: must be a positive integer" });
    }
    if (!Array.isArray(sports) || sports.length === 0) {
      return res.status(400).json({ error: "Invalid sports: must choose at least one sport" });
    }

    const turf = await createTurf(providerProfile.id, {
      name: name.trim(),
      description: description ? String(description).trim() : undefined,
      location: location.trim(),
      pricePerHour: price,
      courts: numCourts,
      images: Array.isArray(images) ? images : undefined,
      sports,
    });

    return res.status(201).json({ turf });
  } catch (error) {
    console.error("createNewTurf error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function updateExistingTurf(req: DBAuthenticatedRequest, res: Response) {
  try {
    if (!req.dbUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;

    // Get provider profile
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: req.dbUser.id },
    });
    if (!providerProfile) {
      return res.status(403).json({
        error: "Forbidden: Provider profile required to update turf",
      });
    }

    const { name, description, location, pricePerHour, courts, images, status, sports } = req.body;

    // Validation
    if (name !== undefined && (typeof name !== "string" || name.trim().length < 2)) {
      return res.status(400).json({ error: "Invalid name" });
    }
    if (location !== undefined && (typeof location !== "string" || location.trim().length < 2)) {
      return res.status(400).json({ error: "Invalid location" });
    }
    if (pricePerHour !== undefined) {
      const price = Number(pricePerHour);
      if (isNaN(price) || price <= 0) {
        return res.status(400).json({ error: "Invalid pricePerHour" });
      }
    }
    if (courts !== undefined) {
      const numCourts = Number(courts);
      if (isNaN(numCourts) || numCourts <= 0 || !Number.isInteger(numCourts)) {
        return res.status(400).json({ error: "Invalid courts count" });
      }
    }
    if (sports !== undefined && (!Array.isArray(sports) || sports.length === 0)) {
      return res.status(400).json({ error: "Invalid sports" });
    }

    const turf = await updateTurf(id, providerProfile.id, {
      name: name ? name.trim() : undefined,
      description: description !== undefined ? String(description).trim() : undefined,
      location: location ? location.trim() : undefined,
      pricePerHour: pricePerHour ? Number(pricePerHour) : undefined,
      courts: courts ? Number(courts) : undefined,
      images,
      status,
      sports,
    });

    return res.status(200).json({ turf });
  } catch (error: any) {
    console.error("updateExistingTurf error:", error);
    if (error.message && error.message.includes("not found")) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function deleteTurf(req: DBAuthenticatedRequest, res: Response) {
  try {
    if (!req.dbUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;

    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: req.dbUser.id },
    });
    if (!providerProfile) {
      return res.status(403).json({
        error: "Forbidden: Provider profile required",
      });
    }

    await softDeleteTurf(id, providerProfile.id);

    return res.status(200).json({ message: "Turf soft-deleted successfully" });
  } catch (error: any) {
    console.error("deleteTurf error:", error);
    if (error.message && error.message.includes("not found")) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
