import { jsx as _jsx } from "react/jsx-runtime";
import { Link } from "react-router-dom";
const Sidebar = () => {
    return (_jsx("aside", { className: "bg-gray-200 w-48 p-4 min-h-screen", children: _jsx("nav", { className: "flex flex-col space-y-2", children: _jsx(Link, { to: "/dashboard", className: "hover:underline", children: "Dashboard" }) }) }));
};
export default Sidebar;
