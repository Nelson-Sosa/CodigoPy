import { useEffect, useState } from "react";
import { categoryService } from "../../services/api";
import { Package } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  color: string;
  icon: string;
  productCount?: number;
}

const CategoriesViewPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      const res = await categoryService.getAll();
      console.log("Categories API response:", res.status, res.data);
      setCategories(res.data || []);
    } catch (err: any) {
      console.error("Categories error:", err.response?.status, err.message);
      if (err.response?.status === 401) {
        setError("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
      } else {
        setError("Error al cargar categorías. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="text-blue-600" size={28} />
          Categorías
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat._id} className="bg-white rounded-xl shadow-md p-5 flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
              style={{ backgroundColor: cat.color + '20', color: cat.color }}
            >
              {cat.icon || '📦'}
            </div>
            <div>
              <h3 className="font-bold text-gray-800">{cat.name}</h3>
              <p className="text-sm text-gray-500">{cat.productCount || 0} productos</p>
            </div>
          </div>
        ))}
      </div>

      {!error && categories.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No hay categorías registradas
        </div>
      )}
    </div>
  );
};

export default CategoriesViewPage;
