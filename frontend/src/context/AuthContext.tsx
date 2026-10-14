import { useState, useEffect, ReactNode } from "react";
import { AxiosError } from "axios";
import { authService } from "../services/api";
import { AuthContext, User } from "./authContextDef";

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
      const storedUser = localStorage.getItem("user");
      
      // Si no hay token, no verificar
      if (!token) {
        setLoading(false);
        return;
      }
      
      // Si hay usuario en localStorage, usarlo MIENTRAS se verifica
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
        } catch (e) {
          console.warn("Error al parsear el usuario almacenado:", e);
        }
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
      } catch (error: unknown) {
        // Solo limpiar si el token es realmente inválido (401)
        if (error instanceof AxiosError && error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
        // Si es error de red, mantener el usuario existente
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
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response) {
          const message = (error.response.data as { message?: string })?.message || "Credenciales inválidas";
          return { success: false, error: message };
        } else if (error.request) {
          return { success: false, error: "No se pudo conectar al servidor. Verifica tu conexión." };
        }
      }
      return { success: false, error: "Error al iniciar sesión" };
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
    } catch (error: unknown) {
      const message = (error instanceof AxiosError && (error.response?.data as { message?: string })?.message) || "Error al registrar usuario";
      return { success: false, error: message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
