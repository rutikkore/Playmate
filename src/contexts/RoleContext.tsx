import { createContext, useContext, useState, ReactNode } from "react";

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
  const [role, setRole] = useState<UserRole>("player");
  const [userName, setUserName] = useState("Arjun");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (name: string, selectedRole: UserRole) => {
    setUserName(name);
    setRole(selectedRole);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserName("");
    setRole("player");
  };

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
