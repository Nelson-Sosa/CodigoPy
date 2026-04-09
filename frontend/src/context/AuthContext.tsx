import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService } from "../services/api";

export interface User {
  _id?: string;
  id: string;
  name?: string;
  email: string;
  role: "admin" | "supervisor" | "operador";
  token?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (data: { name: string; email: string; password: string; role?: string }) => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    return stored && token ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await authService.getMe();
        const userData = res.data;
        const userWithId = {
          ...userData,
          id: userData._id || userData.id,
        };
        setUser(userWithId);
        localStorage.setItem("user", JSON.stringify(userWithId));
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await authService.login(email, password);
      const { token, user: userData } = res.data;
      
      const userWithId = {
        ...userData,
        id: userData._id || userData.id,
        token,
      };
      
      setUser(userWithId);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userWithId));
      
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || "Error al iniciar sesión";
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const register = async (data: { name: string; email: string; password: string; role?: string }) => {
    try {
      const res = await authService.register(data);
      const { token, user: userData } = res.data;
      
      const userWithId = {
        ...userData,
        id: userData._id || userData.id,
        token,
      };
      
      setUser(userWithId);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userWithId));
      
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || "Error al registrar usuario";
      return { success: false, error: message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
