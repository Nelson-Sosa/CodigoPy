import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const RegisterPage = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("operator");
    const [error, setError] = useState("");
    const handleRegister = async (e) => {
        e.preventDefault();
        if (!name || !email || !password) {
            setError("Todos los campos son obligatorios");
            return;
        }
        const result = await register({ name, email, password, role });
        if (result.success) {
            navigate("/dashboard");
        }
        else {
            setError(result.error || "Error al registrar");
        }
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-100", children: _jsxs("form", { onSubmit: handleRegister, className: "bg-white p-8 rounded shadow-md w-full max-w-sm", children: [_jsx("h2", { className: "text-2xl font-bold mb-4", children: "Registro" }), error && _jsx("p", { className: "text-red-500 mb-4", children: error }), _jsxs("label", { className: "block mb-2", children: ["Nombre", _jsx("input", { type: "text", value: name, onChange: (e) => setName(e.target.value), className: "border p-2 w-full rounded mt-1", required: true })] }), _jsxs("label", { className: "block mb-2", children: ["Email", _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "border p-2 w-full rounded mt-1", required: true })] }), _jsxs("label", { className: "block mb-2", children: ["Password", _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), className: "border p-2 w-full rounded mt-1", required: true })] }), _jsxs("label", { className: "block mb-4", children: ["Rol", _jsxs("select", { value: role, onChange: (e) => setRole(e.target.value), className: "border p-2 w-full rounded mt-1", children: [_jsx("option", { value: "operator", children: "Operador" }), _jsx("option", { value: "supervisor", children: "Supervisor" }), _jsx("option", { value: "admin", children: "Admin" })] })] }), _jsx("button", { type: "submit", className: "bg-green-600 text-white p-2 rounded w-full hover:bg-green-700", children: "Registrar" }), _jsxs("p", { className: "mt-4 text-center text-sm", children: ["\u00BFYa tienes cuenta?", " ", _jsx("span", { onClick: () => navigate("/login"), className: "text-blue-600 cursor-pointer hover:underline", children: "Inicia sesi\u00F3n" })] })] }) }));
};
export default RegisterPage;
