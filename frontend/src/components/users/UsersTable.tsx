import { User } from "../../types/User";
import { format } from "date-fns";

interface Props {
  users: User[];
  onEdit: (user: User) => void;
  onToggleActive: (user: User) => void;
}

const UsersTable = ({ users, onEdit, onToggleActive }: Props) => {
  return (
    <div className="overflow-x-auto mt-4">
      <table className="w-full border border-gray-300 dark:border-gray-700">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th className="border p-2">Nombre</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Rol</th>
            <th className="border p-2">Activo</th>
            <th className="border p-2">Último Acceso</th>
            <th className="border p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center p-4">
                No hay usuarios
              </td>
            </tr>
          ) : (
            users.map((u) => (
              <tr key={u.id} className="even:bg-gray-50 dark:even:bg-gray-800">
                <td className="border p-2">{u.name}</td>
                <td className="border p-2">{u.email}</td>
                <td className="border p-2 capitalize">{u.role}</td>
                <td className="border p-2">{u.active ? "Sí" : "No"}</td>
                <td className="border p-2">
                  {u.lastLogin ? format(new Date(u.lastLogin), "yyyy-MM-dd HH:mm") : "Nunca"}
                </td>
                <td className="border p-2 flex gap-2">
                  <button
                    onClick={() => onEdit(u)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onToggleActive(u)}
                    className={`px-2 py-1 rounded ${
                      u.active ? "bg-red-600 text-white" : "bg-green-600 text-white"
                    }`}
                  >
                    {u.active ? "Desactivar" : "Activar"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
