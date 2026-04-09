import { useEffect, useState } from "react";
import { authService } from "../services/api";
import { User } from "../types/User";
import UsersTable from "../components/users/UsersTable";
import UserForm from "../components/users/UserForm";

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    refreshUsers();
  }, []);

  const refreshUsers = async () => {
    try {
      const res = await authService.getUsers();
      const mapped = res.data.map((u: any) => ({
        ...u,
        id: u._id || u.id,
        active: u.isActive !== false,
      }));
      setUsers(mapped);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>

      <UserForm
        selectedUser={selectedUser}
        onSaved={() => {
          setSelectedUser(null);
          refreshUsers();
        }}
      />

      <UsersTable
        users={users}
        onEdit={user => setSelectedUser(user)}
        onToggleActive={async user => {
          try {
            await authService.updateUser(user.id, { isActive: !user.active });
            refreshUsers();
          } catch (err) {
            console.error("Error updating user:", err);
          }
        }}
      />
    </div>
  );
};

export default UsersPage;
