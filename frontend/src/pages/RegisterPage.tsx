import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { DollarSign, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "vendedor">("vendedor");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Ingresá tu nombre");
      return;
    }
    if (!email.trim()) {
      setError("Ingresá tu correo");
      return;
    }
    if (!password || password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    const result = await register({ name, email, password, role });
    setLoading(false);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error || "Error al registrar");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <DollarSign className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">CodigoPy</h1>
          <p className="text-gray-500 mt-1">Sistema de Gestión</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Crear Cuenta</h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nombre completo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Juan Pérez"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm pr-12 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Rol
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "admin" | "vendedor")}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition"
                disabled={loading}
              >
                <option value="vendedor">Vendedor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="animate-spin" size={20} />}
              {loading ? "Registrando..." : "Crear Cuenta"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            ¿Ya tienes cuenta?{" "}
            <Link
              to="/login"
              className="text-green-600 font-medium hover:underline"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
