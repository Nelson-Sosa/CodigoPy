import { Outlet } from "react-router-dom";
import Sidebar from "../navigation/Sidebar";

const MainLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Contenido */}
      <section className="flex-1 overflow-y-auto bg-gray-100">
        <Outlet />
      </section>
    </div>
  );
};

export default MainLayout;
