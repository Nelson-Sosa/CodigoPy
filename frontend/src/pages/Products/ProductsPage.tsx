import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { productService, categoryService } from "../../services/api";
import ProductTable from "../../components/products/ProductTable";
import type { Product } from "../../types/Product";
import { useAuth } from "../../context/AuthContext";
import { Package, Plus } from "lucide-react";

const ProductsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [stockFilter, setStockFilter] = useState<"low" | "out" | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustReason, setAdjustReason] = useState("");

  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
      ]);
      setProducts(prodRes.data.map((p: any) => ({ ...p, id: p._id })));
      setCategories(catRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return products
      .filter(p =>
        (p.name?.toLowerCase().includes(term) ?? false) ||
        (p.sku?.toLowerCase().includes(term) ?? false) ||
        (p.description?.toLowerCase().includes(term) ?? false)
      )
      .filter(p => !categoryFilter || p.categoryId === categoryFilter)
      .filter(p => !statusFilter || p.status === statusFilter)
      .filter(p => {
        const stock = p.stock || 0;
        const minStock = p.minStock || 0;
        return stockFilter === "low" ? stock < minStock && stock > 0 :
               stockFilter === "out" ? stock === 0 : true;
      });
  }, [products, searchTerm, categoryFilter, statusFilter, stockFilter]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleView = (id: string) => navigate(`/products/${id}`);
  const handleEdit = (id: string) => navigate(`/products/edit/${id}`);
  const handleAdjustStock = (product: Product) => setAdjustProduct(product);

  const submitAdjustStock = async () => {
    if (!adjustProduct || !adjustProduct.id) return;
    try {
      await productService.adjustStock(adjustProduct.id, {
        quantity: Math.abs(adjustQty),
        type: adjustQty >= 0 ? "in" : "out",
        reason: adjustReason || "Ajuste de stock",
      });
      fetchData();
      setAdjustProduct(null);
      setAdjustQty(0);
      setAdjustReason("");
    } catch (err) {
      console.error("Error adjusting stock:", err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteProductId) {
      try {
        await productService.delete(deleteProductId);
        fetchData();
        setDeleteProductId(null);
      } catch (err) {
        console.error("Error deleting product:", err);
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Package className="text-blue-600" size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Gestión de Productos</h1>
            <p className="text-gray-500 text-sm">{products.length} productos en inventario</p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={() => navigate("/products/new")}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2.5 py-1.5 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl flex items-center justify-center gap-1 sm:gap-2 hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-green-500/30 font-medium text-xs sm:text-sm"
          >
            <Plus size={14} sm:size={18} />
            <span>Agregar</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 items-center mb-4">
        <input
          type="text"
          placeholder="Buscar por SKU, nombre o descripción"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <select
          onChange={e => setCategoryFilter(e.target.value || null)}
          className="border p-2 rounded"
        >
          <option value="">Todas las categorías</option>
          {categories.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <select
          onChange={e => setStatusFilter(e.target.value || null)}
          className="border p-2 rounded"
        >
          <option value="">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
          <option value="discontinued">Descontinuado</option>
        </select>
        <select
          onChange={e => setStockFilter(e.target.value as any)}
          className="border p-2 rounded"
        >
          <option value="">Todos los stocks</option>
          <option value="low">Stock bajo</option>
          <option value="out">Sin stock</option>
        </select>
        <select
          onChange={e => setItemsPerPage(Number(e.target.value))}
          className="border p-2 rounded"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>

      {loading ? (
        <p>Cargando productos...</p>
      ) : (
        <ProductTable
          products={currentProducts}
          onView={handleView}
          onEdit={handleEdit}
          onAdjustStock={handleAdjustStock}
          onDelete={setDeleteProductId}
          canEdit={isAdmin}
        />
      )}

      <div className="flex justify-between items-center mt-4">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span>Página {currentPage} de {totalPages}</span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>

      {adjustProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow w-96">
            <h2 className="text-xl font-bold mb-4">Ajustar Stock: {adjustProduct.name}</h2>
            <p className="text-sm text-gray-600 mb-4">Stock actual: {adjustProduct.stock}</p>
            <input
              type="number"
              value={adjustQty}
              onChange={e => setAdjustQty(Number(e.target.value))}
              placeholder="Cantidad (+ entrada, - salida)"
              className="border p-2 w-full mb-2"
            />
            <input
              type="text"
              value={adjustReason}
              onChange={e => setAdjustReason(e.target.value)}
              placeholder="Motivo"
              className="border p-2 w-full mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setAdjustProduct(null)} className="px-4 py-2 border rounded">
                Cancelar
              </button>
              <button onClick={submitAdjustStock} className="px-4 py-2 bg-green-600 text-white rounded">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteProductId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow w-96">
            <h2 className="text-xl font-bold mb-4">Confirmar eliminación</h2>
            <p>¿Estás seguro que quieres descontinuar este producto?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setDeleteProductId(null)} className="px-4 py-2 border rounded">
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
