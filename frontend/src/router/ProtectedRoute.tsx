import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: ("admin" | "supervisor" | "operador")[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user } = useAuth();

  // No autenticado → login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Rol no autorizado → unauthorized
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Autorizado
  return <>{children}</>;
};

export default ProtectedRoute;
