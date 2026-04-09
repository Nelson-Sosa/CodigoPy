import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useAuth();
    // No autenticado → login
    if (!user) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    // Rol no autorizado → unauthorized
    if (!allowedRoles.includes(user.role)) {
        return _jsx(Navigate, { to: "/unauthorized", replace: true });
    }
    // Autorizado
    return _jsx(_Fragment, { children: children });
};
export default ProtectedRoute;
