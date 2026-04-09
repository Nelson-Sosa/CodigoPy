import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        const result = await login(email, password);
        if (!result.success) {
            setError(result.error || "Credenciales inválidas");
            return;
        }
        navigate("/dashboard");
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-100", children: _jsxs("form", { onSubmit: handleLogin, className: "bg-white p-8 rounded shadow-md w-full max-w-sm", children: [_jsx("h2", { className: "text-2xl font-bold mb-4", children: "Login" }), error && _jsx("p", { className: "text-red-500 mb-4", children: error }), _jsxs("label", { className: "block mb-2", children: ["Email", _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "border p-2 w-full rounded mt-1", required: true })] }), _jsxs("label", { className: "block mb-2", children: ["Password", _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), className: "border p-2 w-full rounded mt-1", required: true })] }), _jsx("button", { type: "submit", className: "bg-blue-600 text-white p-2 rounded w-full hover:bg-blue-700", children: "Iniciar sesi\u00F3n" }), _jsxs("p", { className: "mt-4 text-center text-sm", children: ["\u00BFNo tienes cuenta?", " ", _jsx("span", { onClick: () => navigate("/register"), className: "text-blue-600 cursor-pointer hover:underline", children: "Reg\u00EDstrate" })] })] }) }));
};
export default LoginPage;
