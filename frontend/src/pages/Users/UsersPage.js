import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { authService } from "../../services/api";
import UserForm from "../../components/users/UserForm";
import UsersTable from "../../components/users/UsersTable";
const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await authService.getUsers();
            const mapped = res.data.map((u) => ({
                ...u,
                id: u._id || u.id,
                active: u.isActive !== false,
            }));
            setUsers(mapped);
            setError("");
        }
        catch (err) {
            console.error(err);
            setUsers([]);
            setError("No se pudo cargar la lista de usuarios.");
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchUsers();
    }, []);
    const handleToggleActive = async (user) => {
        try {
            await authService.updateUser(user.id, { isActive: !user.active });
            fetchUsers();
        }
        catch (err) {
            console.error(err);
            setError("No se pudo actualizar el estado del usuario.");
        }
    };
    return (_jsxs("div", { className: "p-6 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100", children: [_jsx("h1", { className: "text-2xl font-bold mb-4", children: "Gesti\u00F3n de Usuarios" }), error && _jsx("p", { className: "text-red-600 mb-4", children: error }), _jsx(UserForm, { selectedUser: editingUser, onSaved: () => {
                    setEditingUser(null);
                    fetchUsers();
                } }), loading ? (_jsx("p", { children: "Cargando usuarios..." })) : users.length === 0 ? (_jsx("p", { children: "No hay usuarios registrados" })) : (_jsx(UsersTable, { users: users, onEdit: setEditingUser, onToggleActive: handleToggleActive }))] }));
};
export default UsersPage;
