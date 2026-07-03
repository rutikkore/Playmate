import { Request, Response } from "express";
import { firebaseAuth } from "../config/firebase.js";
import { syncUserWithPostgres } from "../services/auth.service.js";

export async function register(req: Request, res: Response) {
  try {
    const { idToken, name, role } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: "Missing ID Token" });
    }

    const decodedToken = await firebaseAuth.verifyIdToken(idToken);
    const user = await syncUserWithPostgres({
      firebaseUid: decodedToken.uid,
      email: decodedToken.email || "",
      name: name || decodedToken.name || "",
      photoUrl: decodedToken.picture || "",
      role: role || "player",
      emailVerified: decodedToken.email_verified || false,
    });

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Registration error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return res.status(500).json({ error: message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: "Missing ID Token" });
    }

    const decodedToken = await firebaseAuth.verifyIdToken(idToken);
    const user = await syncUserWithPostgres({
      firebaseUid: decodedToken.uid,
      email: decodedToken.email || "",
      name: decodedToken.name || "",
      photoUrl: decodedToken.picture || "",
      emailVerified: decodedToken.email_verified || false,
    });

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Login error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return res.status(500).json({ error: message });
  }
}

export async function googleLogin(req: Request, res: Response) {
  try {
    const { idToken, role } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: "Missing ID Token" });
    }

    const decodedToken = await firebaseAuth.verifyIdToken(idToken);
    const user = await syncUserWithPostgres({
      firebaseUid: decodedToken.uid,
      email: decodedToken.email || "",
      name: decodedToken.name || "",
      photoUrl: decodedToken.picture || "",
      role: role || "player",
      emailVerified: decodedToken.email_verified || false,
    });

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Google login error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return res.status(500).json({ error: message });
  }
}

