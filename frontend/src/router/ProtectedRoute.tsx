import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: ("admin" | "vendedor")[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // 🔥 1. Esperar a que termine la validación del token
  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <p>Cargando sistema...</p>
      </div>
    );
  }
  
  // No autenticado → login (guardar la ruta intentada)
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Rol no autorizado → unauthorized
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Autorizado
  return <>{children}</>;
};

export default ProtectedRoute;
