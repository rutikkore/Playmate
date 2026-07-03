import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";

export type UserRole = "player" | "provider";

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  userName: string;
  isAuthenticated: boolean;
  login: (name: string, role: UserRole) => void;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user, logout: authLogout } = useAuth();
  const [role, setRoleState] = useState<UserRole>("player");

  // Synchronize UI role with the backend database role when user changes
  useEffect(() => {
    if (user?.role) {
      setRoleState(user.role.toLowerCase() as UserRole);
    }
  }, [user]);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
  };

  const login = (name: string, selectedRole: UserRole) => {
    setRoleState(selectedRole);
  };

  const logout = () => {
    authLogout();
  };

  const userName = user?.name || "Guest";
  const isAuthenticated = !!user;

  return (
    <RoleContext.Provider value={{ role, setRole, userName, isAuthenticated, login, logout }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}

