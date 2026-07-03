import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!admin.apps.length) {
  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });
    console.log("Firebase Admin SDK initialized successfully.");
  } else {
    console.warn("Firebase Admin environment variables are incomplete. App may fail verification.");
    // Fallback to ADC if available
    try {
      admin.initializeApp();
      console.log("Firebase Admin SDK initialized with Application Default Credentials (ADC).");
    } catch (error) {
      console.error("Failed to initialize Firebase Admin SDK:", error);
    }
  }
}

export const firebaseAuth = admin.auth();
