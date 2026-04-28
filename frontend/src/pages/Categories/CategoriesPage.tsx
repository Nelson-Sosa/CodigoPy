import { useState } from "react";
import { useCategories } from "../../hooks/useCategories";
import { useProducts } from "../../hooks/useProducts";
import { Category } from "../../types/category";
import CategoryForm from "../../components/Categories/CategoryForm";
import { Tag, Pencil, Trash2, Package } from "lucide-react";

const CategoriesPage = () => {
  const { categories, createCategory, deleteCategory, updateCategory, fetchCategories } = useCategories();
  const { products } = useProducts();

  const getProductCount = (categoryId: string) =>
    products.filter(p => p.categoryId === categoryId).length;

  const canDeleteCategory = (categoryId: string) =>
    !products.some(p => p.categoryId === categoryId);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleSave = async (category: Omit<Category, "_id" | "id">) => {
    if (editingCategory && editingCategory.id) {
      await updateCategory(editingCategory.id, category);
    } else {
      await createCategory(category as Category);
    }
    setEditingCategory(null);
    fetchCategories();
  };

  const handleDelete = async (category: Category) => {
    if (!category.id) return;
    if (!canDeleteCategory(category.id)) {
      alert("No se puede eliminar una categoría con productos asociados");
      return;
    }
    if (confirm("¿Está seguro de eliminar esta categoría?")) {
      await deleteCategory(category.id);
      fetchCategories();
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Tag className="text-blue-600" size={28} />
            Categorías
          </h1>
          <p className="text-gray-500 text-sm">{categories.length} categorías registradas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map(category => (
                <div
                  key={category.id || category._id}
                  className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition"
                >
                  <div className="mb-3">
                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                      {category.icon || '📦'} {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-gray-500">{category.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Package size={16} />
                    <span>{getProductCount(category.id || category._id || "")} productos</span>
                  </div>

                  <div className="flex gap-2 pt-3 border-t">
                    <button
                      onClick={() => setEditingCategory(category)}
                      className="flex-1 px-3 py-2 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition flex items-center justify-center gap-1"
                    >
                      <Pencil size={14} />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(category)}
                      disabled={!canDeleteCategory(category.id || category._id || "")}
                      className="flex-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <Tag size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No hay categorías registradas</p>
              <p className="text-sm text-gray-400">Crea tu primera categoría usando el formulario</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <CategoryForm
            onSave={handleSave}
            editingCategory={editingCategory}
            onCancel={() => setEditingCategory(null)}
          />
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
