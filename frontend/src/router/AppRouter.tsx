import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
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

      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<LoginPage />} />
    </Routes>
  );
};

export default AppRouter;

