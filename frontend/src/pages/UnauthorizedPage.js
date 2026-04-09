import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
const UnauthorizedPage = () => {
    const navigate = useNavigate();
    return (_jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center bg-gray-100", children: [_jsx("h1", { className: "text-3xl font-bold text-red-600 mb-4", children: "Acceso no autorizado" }), _jsx("p", { className: "mb-6 text-gray-700", children: "No tienes permisos para acceder a esta p\u00E1gina." }), _jsx("button", { onClick: () => navigate("/dashboard"), className: "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700", children: "Volver al Dashboard" })] }));
};
export default UnauthorizedPage;
