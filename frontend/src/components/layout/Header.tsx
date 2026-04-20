import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">CodigoPy</h1>
      <div className="flex items-center gap-4">
        {user && (
          <span>
            {user.email} ({user.role})
          </span>
        )}
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
};

export default Header;

