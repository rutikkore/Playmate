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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

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
            const res = await authService.login(idToken);
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
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, logout, refreshUser, setUser }}>
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
