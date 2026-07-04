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
    const email = decodedToken.email || (decodedToken.phone_number ? `${decodedToken.phone_number}@playmate.phone` : `${decodedToken.uid}@playmate.phone`);
    const name = decodedToken.name || decodedToken.phone_number || "Phone User";

    req.user = {
      firebaseUid: decodedToken.uid,
      email: email,
      emailVerified: decodedToken.email_verified || (!!decodedToken.phone_number) || false,
      name: name,
      photoUrl: decodedToken.picture || "",
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ error: "Unauthorized: Token verification failed" });
  }
}
