import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="bg-gray-200 w-48 p-4 min-h-screen">
      <nav className="flex flex-col space-y-2">
        <Link to="/dashboard" className="hover:underline">
          Dashboard
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
