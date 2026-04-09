import { useNavigate } from "react-router-dom";

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold text-red-600 mb-4">
        Acceso no autorizado
      </h1>

      <p className="mb-6 text-gray-700">
        No tienes permisos para acceder a esta página.
      </p>

      <button
        onClick={() => navigate("/dashboard")}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Volver al Dashboard
      </button>
    </div>
  );
};

export default UnauthorizedPage;
