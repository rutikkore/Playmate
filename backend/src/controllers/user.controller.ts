import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { getUserProfile } from "../services/user.service.js";
import { syncUserWithPostgres } from "../services/auth.service.js";

export async function getMe(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: Missing user info" });
    }

    let user = await getUserProfile(req.user.firebaseUid);
    if (!user) {
      // Auto-sync/upsert the user if they exist in Firebase but not in local DB
      user = await syncUserWithPostgres({
        firebaseUid: req.user.firebaseUid,
        email: req.user.email,
        name: req.user.name,
        photoUrl: req.user.photoUrl,
        emailVerified: req.user.emailVerified,
      });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("getMe error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return res.status(500).json({ error: message });
  }
}

