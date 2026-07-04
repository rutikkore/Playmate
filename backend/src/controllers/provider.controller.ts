import { Response } from "express";
import { DBAuthenticatedRequest } from "../middleware/role.middleware.js";
import { getProfileByUserId, createProfile, updateProfile } from "../services/provider.service.js";

export async function getProviderProfile(req: DBAuthenticatedRequest, res: Response) {
  try {
    if (!req.dbUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const profile = await getProfileByUserId(req.dbUser.id);
    if (!profile) {
      return res.status(200).json({ profile: null });
    }

    return res.status(200).json({ profile });
  } catch (error) {
    console.error("getProviderProfile error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function createProviderProfile(req: DBAuthenticatedRequest, res: Response) {
  try {
    if (!req.dbUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { businessName, contactPhone } = req.body;

    // Validation
    if (!businessName || typeof businessName !== "string" || businessName.trim().length < 2) {
      return res.status(400).json({ error: "Invalid businessName: must be at least 2 characters" });
    }

    // Check if profile already exists
    const existing = await getProfileByUserId(req.dbUser.id);
    if (existing) {
      return res.status(400).json({ error: "Provider profile already exists" });
    }

    const profile = await createProfile(req.dbUser.id, {
      businessName: businessName.trim(),
      contactPhone: contactPhone ? String(contactPhone).trim() : undefined,
    });

    return res.status(201).json({ profile });
  } catch (error) {
    console.error("createProviderProfile error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function updateProviderProfile(req: DBAuthenticatedRequest, res: Response) {
  try {
    if (!req.dbUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { businessName, contactPhone } = req.body;

    // Validation
    if (businessName !== undefined) {
      if (typeof businessName !== "string" || businessName.trim().length < 2) {
        return res.status(400).json({ error: "Invalid businessName: must be at least 2 characters" });
      }
    }

    const existing = await getProfileByUserId(req.dbUser.id);
    if (!existing) {
      return res.status(404).json({ error: "Provider profile not found" });
    }

    const profile = await updateProfile(req.dbUser.id, {
      businessName: businessName ? businessName.trim() : undefined,
      contactPhone: contactPhone !== undefined ? String(contactPhone).trim() : undefined,
    });

    return res.status(200).json({ profile });
  } catch (error) {
    console.error("updateProviderProfile error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
