import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";

import ProductsPage from "./pages/Products/ProductsPage";
import ProductDetailPage from "./pages/Products/ProductDetailPage";
import ProductEditPage from "./pages/Products/ProductEditPage";
import ProductForm from "./components/products/ProductForm";

import CategoriesPage from "./pages/Categories/CategoriesPage";
import MovementsPage from "./pages/movements/MovementsPage";
import ReportsPage from "./pages/ReportsPage";
import SuppliersPage from "./pages/SuppliersPage";
import SalesPage from "./pages/SalesPage";
import ClientsPage from "./pages/ClientsPage";
import SettingsPage from "./pages/SettingsPage";
import CashRegisterPage from "./pages/CashRegisterPage";
import UsersPage from "./pages/UsersPage";

import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./router/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Rutas protegidas dentro del layout */}
          <Route element={<MainLayout />}>
            
            {/* Dashboard - admin y vendedor */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin","vendedor"]}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Productos - admin tiene todo, vendedor solo ve */}
            <Route
              path="/products"
              element={
                <ProtectedRoute allowedRoles={["admin","vendedor"]}>
                  <ProductsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/new"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ProductForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/edit/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ProductEditPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/:id"
              element={
                <ProtectedRoute allowedRoles={["admin","vendedor"]}>
                  <ProductDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Categorías - solo admin */}
            <Route
              path="/categories"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <CategoriesPage />
                </ProtectedRoute>
              }
            />

            {/* Movimientos - solo admin */}
            <Route
              path="/movements"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <MovementsPage />
                </ProtectedRoute>
              }
            />

            {/* Reportes - solo admin */}
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />

            {/* Proveedores - solo admin */}
            <Route
              path="/suppliers"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <SuppliersPage />
                </ProtectedRoute>
              }
            />

            {/* Ventas - admin y vendedor */}
            <Route
              path="/sales"
              element={
                <ProtectedRoute allowedRoles={["admin","vendedor"]}>
                  <SalesPage />
                </ProtectedRoute>
              }
            />

            {/* Clientes - admin y vendedor */}
            <Route
              path="/clients"
              element={
                <ProtectedRoute allowedRoles={["admin","vendedor"]}>
                  <ClientsPage />
                </ProtectedRoute>
              }
            />

            {/* Caja - admin y vendedor */}
            <Route
              path="/cash-register"
              element={
                <ProtectedRoute allowedRoles={["admin","vendedor"]}>
                  <CashRegisterPage />
                </ProtectedRoute>
              }
            />

            {/* Configuración - solo admin */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Usuarios - solo admin */}
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Acceso no autorizado */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Ruta comodín */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
