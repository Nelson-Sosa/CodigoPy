import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import PurchasesPage from "../pages/PurchasesPage";
import PurchasesViewPage from "../pages/PurchasesViewPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";

const AppRouter = () => {
  return (
    <Routes>
      {/* PÚBLICAS */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* PROTEGIDAS */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin", "vendedor"]}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* ADMIN: Compras completas */}
      <Route
        path="/purchases"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <PurchasesPage />
          </ProtectedRoute>
        }
      />

      {/* VENDEDOR: Solo ver compras */}
      <Route
        path="/purchases-view"
        element={
          <ProtectedRoute allowedRoles={["vendedor"]}>
            <PurchasesViewPage />
          </ProtectedRoute>
        }
      />

      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<LoginPage />} />
    </Routes>
  );
};

export default AppRouter;

