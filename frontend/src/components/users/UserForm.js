import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { authService } from "../../services/api";
const UserForm = ({ selectedUser, onSaved }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("operator");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (selectedUser) {
            setName(selectedUser.name || "");
            setEmail(selectedUser.email);
            setRole(selectedUser.role);
            setPassword("");
        }
        else {
            setName("");
            setEmail("");
            setRole("operator");
            setPassword("");
        }
    }, [selectedUser]);
    const handleSubmit = async () => {
        if (!name || !email) {
            setError("Complete todos los campos");
            return;
        }
        if (!selectedUser && !password) {
            setError("La contraseña es requerida para nuevos usuarios");
            return;
        }
        setLoading(true);
        setError("");
        try {
            if (selectedUser) {
                await authService.updateUser(selectedUser.id, { name, email, role });
            }
            else {
                await authService.register({ name, email, password, role });
            }
            onSaved();
        }
        catch (err) {
            setError(err.response?.data?.message || "Error al guardar el usuario");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "border p-4 rounded space-y-2 max-w-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100", children: [_jsx("h2", { className: "font-bold text-lg", children: selectedUser ? "Editar Usuario" : "Crear Usuario" }), error && _jsx("p", { className: "text-red-600", children: error }), _jsx("input", { placeholder: "Nombre", value: name, onChange: (e) => setName(e.target.value), className: "w-full border p-2 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" }), _jsx("input", { placeholder: "Email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full border p-2 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" }), !selectedUser && (_jsx("input", { placeholder: "Contrase\u00F1a", type: "password", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full border p-2 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" })), _jsxs("select", { value: role, onChange: (e) => setRole(e.target.value), className: "w-full border p-2 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100", children: [_jsx("option", { value: "admin", children: "Admin" }), _jsx("option", { value: "supervisor", children: "Supervisor" }), _jsx("option", { value: "operator", children: "Operador" })] }), _jsx("button", { onClick: handleSubmit, disabled: loading, className: "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50", children: loading ? "Guardando..." : selectedUser ? "Guardar Cambios" : "Crear Usuario" })] }));
};
export default UserForm;
