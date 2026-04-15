import { useState, useEffect } from "react";
import { User } from "../../types/User";
import { authService } from "../../services/api";

interface Props {
  selectedUser: User | null;
  onSaved: () => void;
}

const UserForm = ({ selectedUser, onSaved }: Props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<User["role"]>("vendedor");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedUser) {
      setName(selectedUser.name || "");
      setEmail(selectedUser.email);
      setRole(selectedUser.role);
      setPassword("");
    } else {
      setName("");
      setEmail("");
      setRole("vendedor");
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
      } else {
        await authService.register({ name, email, password, role });
      }
      onSaved();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al guardar el usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border p-4 rounded space-y-2 max-w-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <h2 className="font-bold text-lg">{selectedUser ? "Editar Usuario" : "Crear Usuario"}</h2>
      {error && <p className="text-red-600">{error}</p>}

      <input
        placeholder="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border p-2 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      />
      <input
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border p-2 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      />
      {!selectedUser && (
        <input
          placeholder="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      )}
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as User["role"])}
        className="w-full border p-2 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      >
        <option value="admin">Administrador</option>
        <option value="vendedor">Vendedor</option>
      </select>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? "Guardando..." : selectedUser ? "Guardar Cambios" : "Crear Usuario"}
      </button>
    </div>
  );
};

export default UserForm;
