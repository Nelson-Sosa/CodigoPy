import { Category } from "../../types/category";
import { useState } from "react";
import { Tag } from "lucide-react";

interface Props {
  onSave: (category: Omit<Category, "_id" | "id">) => void;
  editingCategory?: Category | null;
  onCancel?: () => void;
}

const CategoryForm = ({ onSave, editingCategory, onCancel }: Props) => {
  const [prevEditing, setPrevEditing] = useState(editingCategory);
  const [name, setName] = useState(editingCategory?.name ?? "");
  const [description, setDescription] = useState(editingCategory?.description ?? "");
  const [error, setError] = useState("");

  if (editingCategory !== prevEditing) {
    setPrevEditing(editingCategory);
    setName(editingCategory?.name ?? "");
    setDescription(editingCategory?.description ?? "");
    setError("");
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!name.trim()) {
      setError("El nombre es requerido");
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
    });

    setName("");
    setDescription("");
    setError("");
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border">
      <div className="flex items-center gap-2 mb-4">
        <Tag className="text-blue-600" size={24} />
        <h2 className="text-lg font-bold text-gray-800">
          {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
        </h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-4">
          <div>
            <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              id="category-name"
              type="text"
              placeholder="Ej: Laptops, Smartphones, Accesorios"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="category-description" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <input
              id="category-description"
              type="text"
              placeholder="Breve descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            {editingCategory ? "Actualizar" : "Crear Categoría"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;
