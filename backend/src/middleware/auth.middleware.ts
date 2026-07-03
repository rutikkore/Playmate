import { Request, Response, NextFunction } from "express";
import { firebaseAuth } from "../config/firebase.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    firebaseUid: string;
    email: string;
    emailVerified: boolean;
    name?: string;
    photoUrl?: string;
  };
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: Missing or invalid token format" });
    }

    const token = authHeader.split("Bearer ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: Token is empty" });
    }

    const decodedToken = await firebaseAuth.verifyIdToken(token);
    req.user = {
      firebaseUid: decodedToken.uid,
      email: decodedToken.email || "",
      emailVerified: decodedToken.email_verified || false,
      name: decodedToken.name || "",
      photoUrl: decodedToken.picture || "",
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ error: "Unauthorized: Token verification failed" });
  }
}
