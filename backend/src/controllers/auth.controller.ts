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
    const email = decodedToken.email || (decodedToken.phone_number ? `${decodedToken.phone_number}@playmate.phone` : `${decodedToken.uid}@playmate.phone`);
    
    const user = await syncUserWithPostgres({
      firebaseUid: decodedToken.uid,
      email: email,
      name: name || decodedToken.name || decodedToken.phone_number || "",
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
    const email = decodedToken.email || (decodedToken.phone_number ? `${decodedToken.phone_number}@playmate.phone` : `${decodedToken.uid}@playmate.phone`);

    const user = await syncUserWithPostgres({
      firebaseUid: decodedToken.uid,
      email: email,
      name: decodedToken.name || decodedToken.phone_number || "",
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
    const email = decodedToken.email || (decodedToken.phone_number ? `${decodedToken.phone_number}@playmate.phone` : `${decodedToken.uid}@playmate.phone`);

    const user = await syncUserWithPostgres({
      firebaseUid: decodedToken.uid,
      email: email,
      name: decodedToken.name || decodedToken.phone_number || "",
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

export async function phoneLogin(req: Request, res: Response) {
  try {
    const { idToken, role } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: "Missing ID Token" });
    }

    const decodedToken = await firebaseAuth.verifyIdToken(idToken);
    const phoneNumber = decodedToken.phone_number || "";
    const email = decodedToken.email || (phoneNumber ? `${phoneNumber}@playmate.phone` : `${decodedToken.uid}@playmate.phone`);
    const name = decodedToken.name || phoneNumber || "Phone User";

    const user = await syncUserWithPostgres({
      firebaseUid: decodedToken.uid,
      email: email,
      name: name,
      photoUrl: decodedToken.picture || "",
      role: role || "player",
      emailVerified: true, // Phone numbers are verified via SMS OTP
    });

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Phone login error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return res.status(500).json({ error: message });
  }
}

