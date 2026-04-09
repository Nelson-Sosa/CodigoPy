import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../navigation/Sidebar";
import { Menu } from "lucide-react";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar en móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-64 z-50">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Sidebar en desktop */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Contenido */}
      <section className="flex-1 overflow-y-auto bg-gray-100">
        {/* Botón menú móvil */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed bottom-4 left-4 z-40 bg-gray-900 text-white p-3 rounded-full shadow-lg"
        >
          <Menu size={24} />
        </button>
        <Outlet />
      </section>
    </div>
  );
};

export default MainLayout;
