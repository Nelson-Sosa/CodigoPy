import { useState, useEffect } from "react";
import { authService } from "../../services/api";
import UserForm from "../../components/users/UserForm";
import UsersTable from "../../components/users/UsersTable";
import { User } from "../../types/User";

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await authService.getUsers();
      const mapped = res.data.map((u: any) => ({
        ...u,
        id: u._id || u.id,
        active: u.isActive !== false,
      }));
      setUsers(mapped);
      setError("");
    } catch (err) {
      console.error(err);
      setUsers([]);
      setError("No se pudo cargar la lista de usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (user: User) => {
    try {
      await authService.updateUser(user.id, { isActive: !user.active });
      fetchUsers();
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar el estado del usuario.");
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-4">Gestión de Usuarios</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <UserForm
        selectedUser={editingUser}
        onSaved={() => {
          setEditingUser(null);
          fetchUsers();
        }}
      />

      {loading ? (
        <p>Cargando usuarios...</p>
      ) : users.length === 0 ? (
        <p>No hay usuarios registrados</p>
      ) : (
        <UsersTable
          users={users}
          onEdit={setEditingUser}
          onToggleActive={handleToggleActive}
        />
      )}
    </div>
  );
};

export default UsersPage;
