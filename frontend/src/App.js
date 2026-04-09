import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsx(AuthProvider, { children: _jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/register", element: _jsx(RegisterPage, {}) }), _jsxs(Route, { element: _jsx(MainLayout, {}), children: [_jsx(Route, { path: "/dashboard", element: _jsx(ProtectedRoute, { allowedRoles: ["admin", "supervisor", "operador"], children: _jsx(DashboardPage, {}) }) }), _jsx(Route, { path: "/products", element: _jsx(ProtectedRoute, { allowedRoles: ["admin", "supervisor"], children: _jsx(ProductsPage, {}) }) }), _jsx(Route, { path: "/products/new", element: _jsx(ProtectedRoute, { allowedRoles: ["admin", "supervisor"], children: _jsx(ProductForm, {}) }) }), _jsx(Route, { path: "/products/edit/:id", element: _jsx(ProtectedRoute, { allowedRoles: ["admin", "supervisor"], children: _jsx(ProductEditPage, {}) }) }), _jsx(Route, { path: "/products/:id", element: _jsx(ProtectedRoute, { allowedRoles: ["admin", "supervisor", "operador"], children: _jsx(ProductDetailPage, {}) }) }), _jsx(Route, { path: "/categories", element: _jsx(ProtectedRoute, { allowedRoles: ["admin", "supervisor"], children: _jsx(CategoriesPage, {}) }) }), _jsx(Route, { path: "/movements", element: _jsx(ProtectedRoute, { allowedRoles: ["admin", "supervisor", "operador"], children: _jsx(MovementsPage, {}) }) }), _jsx(Route, { path: "/reports", element: _jsx(ProtectedRoute, { allowedRoles: ["admin", "supervisor"], children: _jsx(ReportsPage, {}) }) }), _jsx(Route, { path: "/suppliers", element: _jsx(ProtectedRoute, { allowedRoles: ["admin", "supervisor"], children: _jsx(SuppliersPage, {}) }) }), _jsx(Route, { path: "/sales", element: _jsx(ProtectedRoute, { allowedRoles: ["admin", "supervisor", "operador"], children: _jsx(SalesPage, {}) }) }), _jsx(Route, { path: "/clients", element: _jsx(ProtectedRoute, { allowedRoles: ["admin", "supervisor"], children: _jsx(ClientsPage, {}) }) }), _jsx(Route, { path: "/cash-register", element: _jsx(ProtectedRoute, { allowedRoles: ["admin", "supervisor", "operador"], children: _jsx(CashRegisterPage, {}) }) }), _jsx(Route, { path: "/settings", element: _jsx(ProtectedRoute, { allowedRoles: ["admin", "supervisor"], children: _jsx(SettingsPage, {}) }) })] }), _jsx(Route, { path: "/unauthorized", element: _jsx(UnauthorizedPage, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/login", replace: true }) })] }) }) }));
}
export default App;
