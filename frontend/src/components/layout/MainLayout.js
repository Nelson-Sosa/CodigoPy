import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../navigation/Sidebar";
import { Menu } from "lucide-react";
const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return (_jsxs("div", { className: "flex h-screen overflow-hidden", children: [sidebarOpen && (_jsxs("div", { className: "fixed inset-0 z-50 lg:hidden", children: [_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50", onClick: () => setSidebarOpen(false) }), _jsx("aside", { className: "fixed left-0 top-0 bottom-0 w-64 z-50", children: _jsx(Sidebar, { onClose: () => setSidebarOpen(false) }) })] })), _jsx("aside", { className: "hidden lg:block w-64 flex-shrink-0", children: _jsx(Sidebar, {}) }), _jsxs("section", { className: "flex-1 overflow-y-auto bg-gray-100", children: [_jsx("button", { onClick: () => setSidebarOpen(true), className: "lg:hidden fixed bottom-4 left-4 z-40 bg-gray-900 text-white p-3 rounded-full shadow-lg", children: _jsx(Menu, { size: 24 }) }), _jsx(Outlet, {})] })] }));
};
export default MainLayout;
