import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { productService, categoryService } from "../../services/api";
import type { Product } from "../../types/Product";
import { Package, Tag, Info } from "lucide-react";

const ProductForm = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    sku: "",
    barcode: "",
    name: "",
    brand: "",
    description: "",
    categoryId: "",
    price: "",
    cost: "",
    stock: "",
    minStock: "",
    maxStock: "",
    unit: "unidad",
    imageUrl: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          productService.getAll(),
          categoryService.getAll(),
        ]);
        const mappedProducts = prodRes.data.map((p: any) => ({
          ...p,
          id: p._id,
        }));
        setProducts(mappedProducts);
        setCategories(catRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.sku.trim()) newErrors.sku = "SKU requerido";
    if (products.some(p => p.sku?.toLowerCase() === form.sku.toLowerCase())) newErrors.sku = "El SKU ya existe";
    if (!form.name.trim()) newErrors.name = "Nombre requerido";
    if (!form.brand.trim()) newErrors.brand = "Marca requerida";
    if (!form.categoryId) newErrors.categoryId = "Seleccione categoría";
    if (!form.price || Number(form.price) <= 0) newErrors.price = "Precio inválido";
    if (!form.stock || Number(form.stock) < 0) newErrors.stock = "Stock requerido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!window.confirm("¿Desea guardar el producto?")) return;

    setLoading(true);
    try {
      await productService.create({
        sku: form.sku.toUpperCase(),
        barcode: form.barcode.toUpperCase(),
        name: form.name,
        brand: form.brand,
        description: form.description,
        categoryId: form.categoryId,
        price: Number(form.price),
        cost: Number(form.cost) || 0,
        stock: Number(form.stock),
        minStock: Number(form.minStock) || 5,
        maxStock: Number(form.maxStock) || 100,
        unit: form.unit,
        imageUrl: form.imageUrl,
        status: "active",
      });
      navigate("/products");
    } catch (err: any) {
      setErrors({ submit: err.response?.data?.message || "Error al crear producto" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 bg-white rounded-lg shadow-md">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Package className="text-blue-600" size={28} />
          Nuevo Producto
        </h2>
        <p className="text-gray-500 text-sm mt-1">Complete todos los campos obligatorios (*)</p>
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {errors.submit}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="flex flex-col">
          <label className="font-medium mb-1 text-gray-700">
            SKU <span className="text-red-500">*</span>
          </label>
          <input
            name="sku"
            placeholder="Ej: NBK-001"
            value={form.sku}
            onChange={handleChange}
            className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
          />
          {errors.sku && <span className="text-red-500 text-sm mt-1">{errors.sku}</span>}
        </div>

        <div className="flex flex-col">
          <label className="font-medium mb-1 text-gray-700 flex items-center gap-1">
            Código de Barras
          </label>
          <input
            name="barcode"
            placeholder="Ej: 123456789012"
            value={form.barcode}
            onChange={handleChange}
            className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
          />
          <span className="text-gray-400 text-xs mt-1">Opcional: código del fabricante</span>
        </div>

        <div className="flex flex-col lg:col-span-2">
          <label className="font-medium mb-1 text-gray-700">
            Nombre del Producto <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            placeholder="Ej: Notebook XPS 15 9530"
            value={form.name}
            onChange={handleChange}
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
            placeholder="Ej: Dell, Apple, Samsung"
            value={form.brand}
            onChange={handleChange}
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
            value={form.categoryId}
            onChange={handleChange}
            className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Seleccione categoría</option>
            {categories.map(c => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
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
              placeholder="0.00"
              value={form.price}
              onChange={handleChange}
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
              placeholder="0.00"
              value={form.cost}
              onChange={handleChange}
              className="w-full border rounded-lg pl-8 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <label className="font-medium mb-1 text-gray-700">
            Stock Inicial <span className="text-red-500">*</span>
          </label>
          <input
            name="stock"
            type="number"
            placeholder="Cantidad"
            value={form.stock}
            onChange={handleChange}
            className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.stock && <span className="text-red-500 text-sm mt-1">{errors.stock}</span>}
        </div>

        <div className="flex flex-col">
          <label className="font-medium mb-1 text-gray-700">Stock Mínimo</label>
          <input
            name="minStock"
            type="number"
            placeholder="Alerta"
            value={form.minStock}
            onChange={handleChange}
            className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-medium mb-1 text-gray-700">Stock Máximo</label>
          <input
            name="maxStock"
            type="number"
            placeholder="Máximo"
            value={form.maxStock}
            onChange={handleChange}
            className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-medium mb-1 text-gray-700">Unidad</label>
          <select
            name="unit"
            value={form.unit}
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

        <div className="flex flex-col lg:col-span-2">
          <label className="font-medium mb-1 text-gray-700">URL de Imagen</label>
          <input
            name="imageUrl"
            placeholder="https://ejemplo.com/imagen.jpg"
            value={form.imageUrl}
            onChange={handleChange}
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
          placeholder="Características, especificaciones técnicas, modelo completo, etc."
          value={form.description}
          onChange={handleChange}
          rows={4}
          className="border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <p className="text-gray-400 text-xs mt-1">
          Ej: 16GB RAM, 512GB SSD, Procesador Intel Core i7, Pantalla 15.6"
        </p>
      </div>

      {form.imageUrl && (
        <div className="border-t pt-4">
          <label className="font-medium mb-2 text-gray-700 block">Vista Previa</label>
          <img
            src={form.imageUrl}
            alt="preview"
            className="w-48 h-48 object-contain border rounded-lg shadow-sm"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          onClick={() => navigate("/products")}
          className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Guardando...
            </>
          ) : (
            <>
              <Package size={20} />
              Guardar Producto
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductForm;
