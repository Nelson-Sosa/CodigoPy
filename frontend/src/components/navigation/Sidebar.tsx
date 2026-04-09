import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Truck, LayoutDashboard, Package, Tag, ArrowLeftRight, BarChart3, ShoppingCart, Users, Settings, DollarSign } from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Caja", path: "/cash-register", icon: DollarSign },
    { label: "Ventas", path: "/sales", icon: ShoppingCart },
    { label: "Productos", path: "/products", icon: Package },
    { label: "Categorías", path: "/categories", icon: Tag },
    { label: "Movimientos", path: "/movements", icon: ArrowLeftRight },
    { label: "Clientes", path: "/clients", icon: Users },
    { label: "Proveedores", path: "/suppliers", icon: Truck },
    { label: "Reportes", path: "/reports", icon: BarChart3 },
    { label: "Configuración", path: "/settings", icon: Settings },
  ];

  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col shadow-lg overflow-hidden">
      {/* Logo */}
      <div className="p-4 border-b border-gray-700">
        <h1
          className="text-2xl font-bold cursor-pointer hover:text-gray-300"
          onClick={() => navigate("/dashboard")}
        >
          CodigoPy
        </h1>
      </div>

      {/* Menú con scroll */}
      <nav className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative text-left px-4 py-2.5 rounded hover:bg-gray-700 transition-colors duration-200 w-full flex items-center gap-3 ${
                isActive ? "bg-gray-800 font-semibold" : ""
              }`}
            >
              {Icon && <Icon size={20} />}
              {/* Barra a la izquierda cuando está activo */}
              {isActive && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r"></span>
              )}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout siempre al fondo */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded w-full hover:bg-red-700 transition-colors duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
