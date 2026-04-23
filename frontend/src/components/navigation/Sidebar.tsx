import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LayoutDashboard, Package, Tag, ArrowLeftRight, BarChart3, ShoppingCart, Users, Settings, DollarSign, X, UserCog, Award, ClipboardList } from "lucide-react";

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar = ({ onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleCerrarSesion = () => {
    logout();
    navigate("/login");
    onClose?.();
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose?.();
  };

  const isAdmin = user?.role === "admin";

  const menuItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, roles: ["admin", "vendedor"] },
    { label: "Caja", path: "/cash-register", icon: DollarSign, roles: ["admin", "vendedor"] },
    { label: "Ventas", path: "/sales", icon: ShoppingCart, roles: ["admin", "vendedor"] },
    { label: "Productos", path: "/products", icon: Package, roles: ["admin", "vendedor"] },
    { label: "Categorías", path: "/categories", icon: Tag, roles: ["admin"] },
    { label: "Compras", path: user?.role === "admin" || user?.role === "supervisor" ? "/purchases" : "/purchases-view", icon: ClipboardList, roles: ["admin", "supervisor", "vendedor"] },
    { label: "Clientes", path: "/clients", icon: Users, roles: ["admin", "vendedor"] },
    { label: "Proveedores", path: "/suppliers", icon: Users, roles: ["admin"] },
    { label: "Movimientos", path: "/movements", icon: ArrowLeftRight, roles: ["admin"] },
    { label: "Reportes", path: "/reports", icon: BarChart3, roles: ["admin"] },
    { label: "Comisiones", path: "/commissions", icon: Award, roles: ["admin", "supervisor", "vendedor"] },
    { label: "Configuración", path: "/settings", icon: Settings, roles: ["admin"] },
    { label: "Usuarios", path: "/users", icon: UserCog, roles: ["admin"] },
  ].filter(item => user && item.roles.includes(user.role));

  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col shadow-lg overflow-hidden">
      {/* Logo y botón cerrar móvil */}
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h1
          className="text-2xl font-bold cursor-pointer hover:text-gray-300"
          onClick={() => handleNavigate("/dashboard")}
        >
          CodigoPy
        </h1>
        <button
          onClick={onClose}
          className="lg:hidden p-1 hover:bg-gray-700 rounded"
        >
          <X size={24} />
        </button>
      </div>

      {/* Menú con scroll */}
      <nav className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`relative text-left px-4 py-2.5 rounded hover:bg-gray-700 transition-colors duration-200 w-full flex items-center gap-3 ${
                isActive ? "bg-gray-800 font-semibold" : ""
              }`}
            >
              {Icon && <Icon size={20} />}
              {isActive && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r"></span>
              )}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Cerrar sesión siempre al fondo */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleCerrarSesion}
          className="bg-red-600 text-white px-4 py-2 rounded w-full hover:bg-red-700 transition-colors duration-200"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
