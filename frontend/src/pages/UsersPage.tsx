import { useEffect, useState } from "react";
import { authService } from "../services/api";
import { User } from "../types/User";
import { ToastContainer, useToast } from "../components/common/Toast";
import { UserPlus, Users, Shield, UserCog, Trash2, Key, X } from "lucide-react";

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ password: "", confirmPassword: "" });
  const [formData, setFormData] = useState({ name: "", email: "", role: "vendedor" as User["role"] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { toasts, addToast, removeToast } = useToast();

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
      addToast("Error al cargar usuarios", "error");
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role });
    setShowForm(true);
    setError("");
  };

  const handleNew = () => {
    setSelectedUser(null);
    setFormData({ name: "", email: "", role: "vendedor" });
    setShowForm(true);
    setError("");
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      setError("Complete todos los campos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (selectedUser) {
        await authService.updateUser(selectedUser.id, { name: formData.name, email: formData.email, role: formData.role });
        addToast("Usuario actualizado correctamente", "success");
      } else {
        await authService.register({ ...formData, password: "temp123" });
        addToast("Usuario creado correctamente", "success");
      }
      setShowForm(false);
      refreshUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`¿Eliminar al usuario "${user.name}"?\n\nEsta acción no se puede deshacer.`)) return;
    
    try {
      await authService.deleteUser(user.id);
      addToast("Usuario eliminado correctamente", "success");
      refreshUsers();
    } catch (err: any) {
      addToast(err.response?.data?.message || "Error al eliminar", "error");
    }
  };

  const handleToggleActive = async (user: User) => {
    const action = user.active ? "desactivar" : "activar";
    if (!confirm(`¿${action.charAt(0).toUpperCase() + action.slice(1)} al usuario "${user.name}"?`)) return;

    try {
      await authService.updateUser(user.id, { isActive: !user.active });
      addToast(`Usuario ${action === "desactivar" ? "desactivado" : "activado"}`, "success");
      refreshUsers();
    } catch (err: any) {
      addToast(err.response?.data?.message || "Error", "error");
    }
  };

  const handleOpenPasswordModal = (user: User) => {
    setSelectedUser(user);
    setPasswordData({ password: "", confirmPassword: "" });
    setShowPasswordModal(true);
    setError("");
  };

  const handleChangePassword = async () => {
    if (passwordData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (passwordData.password !== passwordData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      await authService.changePassword(selectedUser!.id, passwordData.password);
      addToast("Contraseña actualizada correctamente", "success");
      setShowPasswordModal(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cambiar contraseña");
    }
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "Nunca";
    return new Date(date).toLocaleDateString("es-PY", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Users className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
              <p className="text-sm text-gray-500">{users.length} usuario(s) registrado(s)</p>
            </div>
          </div>
          <button
            onClick={handleNew}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/30 text-sm sm:text-base"
          >
            <UserPlus size={20} />
            <span className="hidden sm:inline">Nuevo Usuario</span>
            <span className="sm:hidden">Agregar</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rol</th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Último Acceso</th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.role === "admin" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"}`}>
                          {user.role === "admin" ? <Shield size={18} /> : <UserCog size={18} />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {user.role === "admin" ? "Administrador" : "Vendedor"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        user.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {user.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(user.lastLogin)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                          title="Editar"
                        >
                          <UserCog size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenPasswordModal(user)}
                          className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-yellow-100 hover:text-yellow-600 transition-colors"
                          title="Cambiar contraseña"
                        >
                          <Key size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            user.active
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                          }`}
                        >
                          {user.active ? "Desactivar" : "Activar"}
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      No hay usuarios registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900">
                {selectedUser ? "Editar Usuario" : "Nuevo Usuario"}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="email@ejemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as User["role"] })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="vendedor">Vendedor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 rounded-b-2xl flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900">
                Cambiar Contraseña
              </h3>
              <button onClick={() => setShowPasswordModal(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Usuario: <strong>{selectedUser?.name}</strong>
              </p>
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                <input
                  type="password"
                  value={passwordData.password}
                  onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="Repita la contraseña"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 rounded-b-2xl flex gap-3">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleChangePassword}
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                Cambiar
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default UsersPage;
