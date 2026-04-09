import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./router/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Rutas protegidas dentro del layout */}
          <Route element={<MainLayout />}>
            
            {/* Dashboard - todos los roles */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin","supervisor","operador"]}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Productos - solo admin y supervisor */}
            <Route
              path="/products"
              element={
                <ProtectedRoute allowedRoles={["admin","supervisor"]}>
                  <ProductsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/new"
              element={
                <ProtectedRoute allowedRoles={["admin","supervisor"]}>
                  <ProductForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/edit/:id"
              element={
                <ProtectedRoute allowedRoles={["admin","supervisor"]}>
                  <ProductEditPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/:id"
              element={
                <ProtectedRoute allowedRoles={["admin","supervisor","operador"]}>
                  <ProductDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Categorías - solo admin y supervisor */}
            <Route
              path="/categories"
              element={
                <ProtectedRoute allowedRoles={["admin","supervisor"]}>
                  <CategoriesPage />
                </ProtectedRoute>
              }
            />

            {/* Movimientos - todos los roles */}
            <Route
              path="/movements"
              element={
                <ProtectedRoute allowedRoles={["admin","supervisor","operador"]}>
                  <MovementsPage />
                </ProtectedRoute>
              }
            />

            {/* Reportes - solo admin y supervisor */}
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={["admin","supervisor"]}>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />

            {/* Proveedores - solo admin y supervisor */}
            <Route
              path="/suppliers"
              element={
                <ProtectedRoute allowedRoles={["admin","supervisor"]}>
                  <SuppliersPage />
                </ProtectedRoute>
              }
            />

            {/* Ventas - todos los roles */}
            <Route
              path="/sales"
              element={
                <ProtectedRoute allowedRoles={["admin","supervisor","operador"]}>
                  <SalesPage />
                </ProtectedRoute>
              }
            />

            {/* Clientes - solo admin y supervisor */}
            <Route
              path="/clients"
              element={
                <ProtectedRoute allowedRoles={["admin","supervisor"]}>
                  <ClientsPage />
                </ProtectedRoute>
              }
            />

            {/* Caja - todos los roles */}
            <Route
              path="/cash-register"
              element={
                <ProtectedRoute allowedRoles={["admin","supervisor","operador"]}>
                  <CashRegisterPage />
                </ProtectedRoute>
              }
            />

            {/* Configuración - admin y supervisor */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={["admin", "supervisor"]}>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Acceso no autorizado */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Ruta comodín */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
