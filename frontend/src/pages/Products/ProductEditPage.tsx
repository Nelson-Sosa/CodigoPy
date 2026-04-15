import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { productService, categoryService } from "../../services/api";
import type { Product } from "../../types/Product";
import { Package, Tag, Info } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const ProductEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [form, setForm] = useState<Partial<Product>>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/products");
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [prodRes, catRes] = await Promise.all([
          productService.getById(id),
          categoryService.getAll(),
        ]);
        const product = prodRes.data.product;
        setForm({
          ...product,
          id: product._id,
          price: product.salePrice,
          cost: product.costPrice,
        });
        setCategories(catRes.data);
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name?.trim()) newErrors.name = "El nombre es obligatorio";
    if (!form.sku?.trim()) newErrors.sku = "El SKU es obligatorio";
    if (!form.brand?.trim()) newErrors.brand = "La marca es obligatoria";
    if (!form.price || form.price <= 0) newErrors.price = "El precio debe ser mayor a 0";
    if (form.stock === undefined || form.stock < 0) newErrors.stock = "El stock no puede ser negativo";
    if (!form.categoryId) newErrors.categoryId = "La categoría es obligatoria";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm(prev => ({
      ...prev,
      [name]:
        name === "price" || name === "stock" || name === "cost" || name === "minStock" || name === "maxStock"
          ? Number(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || !id) return;

    if (!window.confirm("¿Seguro que deseas guardar los cambios del producto?")) return;

    setSaving(true);
    try {
      await productService.update(id, {
        sku: form.sku,
        name: form.name,
        brand: form.brand,
        description: form.description,
        categoryId: form.categoryId,
        price: form.price,
        cost: form.cost,
        stock: form.stock,
        minStock: form.minStock,
        maxStock: form.maxStock,
        unit: form.unit,
        imageUrl: form.imageUrl,
        status: form.status,
      });
      navigate("/products");
    } catch (err) {
      console.error("Error updating product:", err);
      setErrors({ submit: "Error al guardar el producto" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando producto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 bg-white rounded-lg shadow-md">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Package className="text-yellow-500" size={28} />
          Editar Producto
        </h2>
        <p className="text-gray-500 text-sm mt-1">Modifique los campos necesarios</p>
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex flex-col">
            <label className="font-medium mb-1 text-gray-700">
              SKU
            </label>
            <input
              name="sku"
              value={form.sku || ""}
              onChange={handleChange}
              placeholder="SKU"
              className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
            />
            {errors.sku && <span className="text-red-500 text-sm mt-1">{errors.sku}</span>}
          </div>

          <div className="flex flex-col lg:col-span-2">
            <label className="font-medium mb-1 text-gray-700">
              Nombre del Producto <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={form.name || ""}
              onChange={handleChange}
              placeholder="Nombre del producto"
              className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && <span className="text-red-500 text-sm mt-1">{errors.name}</span>}
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-1 text-gray-700 flex items-center gap-1">
              <Tag size={16} />
              Marca <span className="text-red-500">*</span>
            </label>
            <input
              name="brand"
              value={form.brand || ""}
              onChange={handleChange}
              placeholder="Marca"
              className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.brand && <span className="text-red-500 text-sm mt-1">{errors.brand}</span>}
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-1 text-gray-700">
              Categoría <span className="text-red-500">*</span>
            </label>
            <select
              name="categoryId"
              value={form.categoryId || ""}
              onChange={handleChange}
              className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Seleccionar categoría</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            {errors.categoryId && <span className="text-red-500 text-sm mt-1">{errors.categoryId}</span>}
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-1 text-gray-700">
              Precio de Venta <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                name="price"
                type="number"
                step="0.01"
                value={form.price || ""}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full border rounded-lg pl-8 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {errors.price && <span className="text-red-500 text-sm mt-1">{errors.price}</span>}
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-1 text-gray-700">Costo</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                name="cost"
                type="number"
                step="0.01"
                value={form.cost || ""}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full border rounded-lg pl-8 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-1 text-gray-700">
              Stock <span className="text-red-500">*</span>
            </label>
            <input
              name="stock"
              type="number"
              value={form.stock ?? ""}
              onChange={handleChange}
              placeholder="Cantidad"
              className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.stock && <span className="text-red-500 text-sm mt-1">{errors.stock}</span>}
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-1 text-gray-700">Stock Mínimo</label>
            <input
              name="minStock"
              type="number"
              value={form.minStock ?? ""}
              onChange={handleChange}
              placeholder="Alerta"
              className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-1 text-gray-700">Stock Máximo</label>
            <input
              name="maxStock"
              type="number"
              value={form.maxStock ?? ""}
              onChange={handleChange}
              placeholder="Máximo"
              className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-1 text-gray-700">Unidad</label>
            <select
              name="unit"
              value={form.unit || "unidad"}
              onChange={handleChange}
              className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="unidad">Unidad</option>
              <option value="pieza">Pieza</option>
              <option value="caja">Caja</option>
              <option value="kg">Kilogramo</option>
              <option value="litro">Litro</option>
              <option value="metro">Metro</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-1 text-gray-700">Estado</label>
            <select
              name="status"
              value={form.status || "active"}
              onChange={handleChange}
              className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="discontinued">Descontinuado</option>
            </select>
          </div>

          <div className="flex flex-col lg:col-span-2">
            <label className="font-medium mb-1 text-gray-700">URL de Imagen</label>
            <input
              name="imageUrl"
              value={form.imageUrl || ""}
              onChange={handleChange}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <label className="font-medium mb-1 text-gray-700 flex items-center gap-1">
            <Info size={16} />
            Descripción
          </label>
          <textarea
            name="description"
            value={form.description || ""}
            onChange={handleChange}
            placeholder="Características, especificaciones técnicas, modelo completo, etc."
            rows={4}
            className="border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {form.imageUrl && (
          <div className="border-t pt-4">
            <label className="font-medium mb-2 text-gray-700 block">Vista Previa</label>
            <img
              src={form.imageUrl}
              alt="Preview"
              className="w-48 h-48 object-contain border rounded-lg shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Guardando...
              </>
            ) : (
              "Guardar Cambios"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductEditPage;
