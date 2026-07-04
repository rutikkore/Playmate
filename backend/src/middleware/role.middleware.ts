import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware.js";
import { prisma } from "../config/db.js";
import { Role } from "@prisma/client";

export interface DBAuthenticatedRequest extends AuthenticatedRequest {
  dbUser?: {
    id: string;
    firebaseUid: string;
    email: string;
    name: string | null;
    photoUrl: string | null;
    role: Role;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
}

export async function attachDBUser(
  req: DBAuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: Missing user authentication" });
    }

    const dbUser = await prisma.user.findUnique({
      where: { firebaseUid: req.user.firebaseUid },
    });

    if (!dbUser) {
      return res.status(404).json({ error: "User profile not found in database" });
    }

    req.dbUser = dbUser;
    next();
  } catch (error) {
    console.error("attachDBUser middleware error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function requireProvider(
  req: DBAuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: Missing user authentication" });
    }

    const dbUser = await prisma.user.findUnique({
      where: { firebaseUid: req.user.firebaseUid },
    });

    if (!dbUser) {
      return res.status(404).json({ error: "User profile not found in database" });
    }

    if (dbUser.role !== Role.PROVIDER) {
      return res.status(403).json({ error: "Forbidden: Provider role required" });
    }

    req.dbUser = dbUser;
    next();
  } catch (error) {
    console.error("requireProvider middleware error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function requirePlayer(
  req: DBAuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: Missing user authentication" });
    }

    const dbUser = await prisma.user.findUnique({
      where: { firebaseUid: req.user.firebaseUid },
    });

    if (!dbUser) {
      return res.status(404).json({ error: "User profile not found in database" });
    }

    if (dbUser.role !== Role.PLAYER) {
      // Allow provider to also act as player? The requirement says:
      // "Authorization must use database roles."
      // Since it's strict, we can restrict PLAYER routes to Role.PLAYER.
      // Wait, is there any reason to allow PROVIDER to also be PLAYER?
      // In RoleContext.tsx, the user's UI role is stored, but in backend
      // we check DB user.role. Let's make it strict to Role.PLAYER, or allow both?
      // Usually favourites and discovering turfs are PLAYER actions, but a PROVIDER
      // can discover turfs too. To be safe, let's keep requirePlayer strict to PLAYER,
      // and if we need standard user check we can just use requireAuth.
      return res.status(403).json({ error: "Forbidden: Player role required" });
    }

    req.dbUser = dbUser;
    next();
  } catch (error) {
    console.error("requirePlayer middleware error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
