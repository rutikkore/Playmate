import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User as FirebaseUser, onAuthStateChanged, signOut as fbSignOut } from "firebase/auth";
import { auth } from "../config/firebase";
import { authService, BackendUser } from "../services/auth.service";
import { userService } from "../services/user.service";

interface AuthContextType {
  user: BackendUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: BackendUser | null) => void;
  // Phone auth states
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  otp: string;
  setOtp: (otp: string) => void;
  confirmationResult: any;
  setConfirmationResult: (result: any) => void;
  phoneLoading: boolean;
  phoneError: string | null;
  setPhoneError: (error: string | null) => void;
  // Phone auth functions
  sendPhoneOTP: (phone: string) => Promise<void>;
  verifyPhoneOTP: (otpCode: string, role: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Phone auth flow states
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const refreshUser = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const res = await userService.getMe();
        setUser(res.user);
      } catch (error) {
        console.error("Error refreshing user profile:", error);
      }
    } else {
      setUser(null);
    }
  };

  const sendPhoneOTP = async (phone: string) => {
    setPhoneLoading(true);
    setPhoneError(null);
    try {
      await authService.sendPhoneOTP(phone);
      setPhoneNumber(phone);
    } catch (error: any) {
      console.error("Error sending Phone OTP:", error);
      const msg = error?.message || "Failed to send OTP. Please check the number.";
      setPhoneError(msg);
      throw error;
    } finally {
      setPhoneLoading(false);
    }
  };

  const verifyPhoneOTP = async (otpCode: string, role: string) => {
    setPhoneLoading(true);
    setPhoneError(null);
    try {
      const result = await authService.verifyPhoneOTP(otpCode);
      setConfirmationResult(result);
      const idToken = await result.user.getIdToken();
      const res = await authService.phoneLogin(idToken, role.toUpperCase());
      setUser(res.user);
    } catch (error: any) {
      console.error("Error verifying Phone OTP:", error);
      const msg = error?.message || "Failed to verify OTP. Please try again.";
      setPhoneError(msg);
      throw error;
    } finally {
      setPhoneLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const res = await userService.getMe();
          setUser(res.user);
        } catch (error) {
          console.warn("Backend user profile fetch failed, trying to sync standard login:", error);
          try {
            const idToken = await fbUser.getIdToken();
            const isPhoneAuth = fbUser.providerData.some(p => p.providerId === 'phone') || (!fbUser.email && fbUser.phoneNumber);
            let res;
            if (isPhoneAuth) {
              res = await authService.phoneLogin(idToken, "");
            } else {
              res = await authService.login(idToken);
            }
            setUser(res.user);
          } catch (syncErr) {
            console.error("Failed to sync user with backend DB:", syncErr);
            setUser(null);
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    setLoading(true);
    try {
      await fbSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
      setPhoneNumber("");
      setOtp("");
      setConfirmationResult(null);
      setPhoneError(null);
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        logout,
        refreshUser,
        setUser,
        phoneNumber,
        setPhoneNumber,
        otp,
        setOtp,
        confirmationResult,
        setConfirmationResult,
        phoneLoading,
        phoneError,
        setPhoneError,
        sendPhoneOTP,
        verifyPhoneOTP,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
