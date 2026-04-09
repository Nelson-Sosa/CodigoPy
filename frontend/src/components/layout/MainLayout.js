import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from "react-router-dom";
import Sidebar from "../navigation/Sidebar";
const MainLayout = () => {
    return (_jsxs("div", { className: "flex h-screen overflow-hidden", children: [_jsx("aside", { className: "w-64 flex-shrink-0", children: _jsx(Sidebar, {}) }), _jsx("section", { className: "flex-1 overflow-y-auto bg-gray-100", children: _jsx(Outlet, {}) })] }));
};
export default MainLayout;
