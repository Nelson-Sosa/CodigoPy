import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { authService } from "../services/api";
import UsersTable from "../components/users/UsersTable";
import UserForm from "../components/users/UserForm";
const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    useEffect(() => {
        refreshUsers();
    }, []);
    const refreshUsers = async () => {
        try {
            const res = await authService.getUsers();
            const mapped = res.data.map((u) => ({
                ...u,
                id: u._id || u.id,
                active: u.isActive !== false,
            }));
            setUsers(mapped);
        }
        catch (err) {
            console.error("Error fetching users:", err);
        }
    };
    return (_jsxs("div", { className: "p-6 space-y-6", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Gesti\u00F3n de Usuarios" }), _jsx(UserForm, { selectedUser: selectedUser, onSaved: () => {
                    setSelectedUser(null);
                    refreshUsers();
                } }), _jsx(UsersTable, { users: users, onEdit: user => setSelectedUser(user), onToggleActive: async (user) => {
                    try {
                        await authService.updateUser(user.id, { isActive: !user.active });
                        refreshUsers();
                    }
                    catch (err) {
                        console.error("Error updating user:", err);
                    }
                } })] }));
};
export default UsersPage;
