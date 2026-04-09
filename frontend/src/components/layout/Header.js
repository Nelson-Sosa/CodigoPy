import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuth } from "../../context/AuthContext";
const Header = () => {
    const { user, logout } = useAuth();
    return (_jsxs("header", { className: "bg-blue-600 text-white p-4 flex justify-between items-center", children: [_jsx("h1", { className: "text-xl font-bold", children: "CodigoPy" }), _jsxs("div", { className: "flex items-center gap-4", children: [user && (_jsxs("span", { children: [user.email, " (", user.role, ")"] })), _jsx("button", { onClick: logout, className: "bg-red-500 hover:bg-red-600 px-3 py-1 rounded", children: "Logout" })] })] }));
};
export default Header;
