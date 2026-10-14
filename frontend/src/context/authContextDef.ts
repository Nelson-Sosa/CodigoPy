import { createContext, useContext } from "react";

export interface User {
  _id?: string;
  id: string;
  name?: string;
  email: string;
  role: "admin" | "vendedor";
  token?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (data: { name: string; email: string; password: string; role?: string }) => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
