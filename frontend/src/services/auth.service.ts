import { auth } from "../config/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import API from "./api";

export interface BackendUser {
  id: string;
  firebaseUid: string;
  email: string;
  name: string | null;
  photoUrl: string | null;
  role: "PLAYER" | "PROVIDER";
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SyncUserResponse {
  user: BackendUser;
}

let recaptchaVerifier: RecaptchaVerifier | null = null;
let confirmationResult: ConfirmationResult | null = null;

export const authService = {
  async register(idToken: string, name: string, role: string): Promise<SyncUserResponse> {
    const { data } = await API.post<SyncUserResponse>("/auth/register", { idToken, name, role });
    return data;
  },

  async login(idToken: string): Promise<SyncUserResponse> {
    const { data } = await API.post<SyncUserResponse>("/auth/login", { idToken });
    return data;
  },

  async googleLogin(idToken: string, role: string): Promise<SyncUserResponse> {
    const { data } = await API.post<SyncUserResponse>("/auth/google", { idToken, role });
    return data;
  },

  async phoneLogin(idToken: string, role: string): Promise<SyncUserResponse> {
    const { data } = await API.post<SyncUserResponse>("/auth/phone", { idToken, role });
    return data;
  },

  initRecaptcha(containerId: string = 'recaptcha-container') {
    if (typeof window === 'undefined') return;
    const element = document.getElementById(containerId);
    if (!element) {
      console.warn(`reCAPTCHA container with id ${containerId} not found in DOM.`);
      return;
    }

    if (recaptchaVerifier) {
      console.log("Clearing existing reCAPTCHA verifier instance...");
      try {
        recaptchaVerifier.clear();
      } catch (err) {
        console.warn("Failed to clear existing recaptchaVerifier:", err);
      }
      recaptchaVerifier = null;
    }

    try {
      console.log("Initializing RecaptchaVerifier on container:", containerId);
      recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: (response: any) => {
          console.log("reCAPTCHA solved successfully.", response);
        },
        'expired-callback': () => {
          console.log("reCAPTCHA expired, clearing verifier...");
          if (recaptchaVerifier) {
            recaptchaVerifier.clear();
            recaptchaVerifier = null;
          }
        }
      });
    } catch (err) {
      console.error("Failed to construct RecaptchaVerifier:", err);
      throw err;
    }
  },

  async sendPhoneOTP(phoneNumber: string): Promise<void> {
    console.log("Starting sendPhoneOTP for:", phoneNumber);
    authService.initRecaptcha('recaptcha-container');
    if (!recaptchaVerifier) {
      throw new Error("reCAPTCHA verifier failed to initialize. Container may be missing from DOM.");
    }
    try {
      console.log("Calling signInWithPhoneNumber...");
      confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      console.log("signInWithPhoneNumber success. OTP sent.");
    } catch (err) {
      console.error("Error in signInWithPhoneNumber:", err);
      if (recaptchaVerifier) {
        try { recaptchaVerifier.clear(); } catch (_) {}
        recaptchaVerifier = null;
      }
      throw err;
    }
  },

  async verifyPhoneOTP(otp: string): Promise<any> {
    if (!confirmationResult) {
      throw new Error("No OTP confirmation result found. Please request OTP first.");
    }
    const result = await confirmationResult.confirm(otp);
    return result;
  },
};
