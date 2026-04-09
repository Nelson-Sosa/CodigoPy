import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { productService } from "../../services/api";
import { Package, Tag, Info, PackagePlus, Pencil, ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";

interface Product {
  _id: string;
  id: string;
  sku: string;
  name: string;
  brand?: string;
  description?: string;
  category?: { name: string };
  stock: number;
  minStock: number;
  maxStock: number;
  price: number;
  cost: number;
  imageUrl?: string;
  status: string;
  createdAt: string;
  unit?: string;
}

interface Movement {
  _id: string;
  id: string;
  type: "in" | "out" | "adjust";
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  createdAt: string;
  createdBy?: { name: string };
}

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustQty, setAdjustQty] = useState<number | "">("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const res = await productService.getById(id);
        const prod = res.data.product;
        setProduct({
          ...prod,
          id: prod._id,
          price: prod.salePrice,
          cost: prod.costPrice,
        });
        setMovements(res.data.movements.map((m: any) => ({
          ...m,
          id: m._id,
        })));
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const submitAdjustStock = async () => {
    if (!product || !id || adjustQty === "") return;

    try {
      await productService.adjustStock(id, {
        quantity: Math.abs(Number(adjustQty)),
        type: Number(adjustQty) >= 0 ? "in" : "out",
        reason: reason || "Ajuste manual",
      });

      const res = await productService.getById(id);
      const prod = res.data.product;
      setProduct({
        ...prod,
        id: prod._id,
        price: prod.salePrice,
        cost: prod.costPrice,
      });
      setMovements(res.data.movements.map((m: any) => ({
        ...m,
        id: m._id,
      })));

      setAdjustQty("");
      setReason("");
      setShowAdjustModal(false);
    } catch (err) {
      console.error("Error adjusting stock:", err);
    }
  };

  const getTypeLabel = (type: string) => {
    if (type === "in") return "Entrada";
    if (type === "out") return "Salida";
    return "Ajuste";
  };

  const getTypeColor = (type: string) => {
    if (type === "in") return "bg-green-100 text-green-800";
    if (type === "out") return "bg-red-100 text-red-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const getStatusColor = (status: string) => {
    if (status === "active") return "bg-green-100 text-green-800";
    if (status === "inactive") return "bg-gray-100 text-gray-800";
    return "bg-red-100 text-red-800";
  };

  const getStatusLabel = (status: string) => {
    if (status === "active") return "Activo";
    if (status === "inactive") return "Inactivo";
    return "Descontinuado";
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

  if (!product) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Package size={64} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">Producto no encontrado</p>
        </div>
      </div>
    );
  }

  const stockPercentage = product.maxStock > 0 
    ? Math.min(100, (product.stock / product.maxStock) * 100) 
    : 0;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <button
        onClick={() => navigate("/products")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft size={20} />
        Volver a productos
      </button>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">{product.name}</h1>
              <p className="text-blue-100 flex items-center gap-2 mt-1">
                <Tag size={16} />
                {product.brand || "Sin marca"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/products/edit/${product.id}`)}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg flex items-center gap-2 hover:bg-blue-50 transition-colors"
              >
                <Pencil size={18} />
                Editar
              </button>
              <button
                onClick={() => setShowAdjustModal(true)}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg flex items-center gap-2 hover:bg-yellow-600 transition-colors"
              >
                <PackagePlus size={18} />
                Ajustar Stock
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              {product.imageUrl && (
                <div className="border rounded-xl p-4">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-64 object-contain rounded-lg"
                  />
                </div>
              )}

              {product.description && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Info size={18} />
                    Descripción
                  </h3>
                  <p className="text-gray-600 text-sm">{product.description}</p>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-blue-600 text-sm font-medium">SKU</p>
                  <p className="text-xl font-bold text-gray-800">{product.sku}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-purple-600 text-sm font-medium">Marca</p>
                  <p className="text-xl font-bold text-gray-800">{product.brand || "N/A"}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-500 text-sm font-medium">Estado</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(product.status)}`}>
                    {getStatusLabel(product.status)}
                  </span>
                </div>
              </div>

              <div className="border rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-gray-500 text-sm font-medium">Stock Actual</p>
                  <p className="text-2xl font-bold text-gray-800">{product.stock} {product.unit || "unidades"}</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all ${
                      product.stock === 0 ? "bg-red-500" :
                      product.stock < product.minStock ? "bg-yellow-500" : "bg-green-500"
                    }`}
                    style={{ width: `${stockPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0</span>
                  <span>Mín: {product.minStock}</span>
                  <span>Máx: {product.maxStock}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-green-600 text-sm font-medium flex items-center gap-1">
                    <TrendingUp size={16} />
                    Precio de Venta
                  </p>
                  <p className="text-2xl font-bold text-gray-800">${product.price.toFixed(2)}</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4">
                  <p className="text-orange-600 text-sm font-medium flex items-center gap-1">
                    <TrendingDown size={16} />
                    Costo
                  </p>
                  <p className="text-2xl font-bold text-gray-800">${product.cost.toFixed(2)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Categoría</span>
                  <span className="font-medium">{product.category?.name || "N/A"}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Fecha de Creación</span>
                  <span className="font-medium">{new Date(product.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Unidad</span>
                  <span className="font-medium capitalize">{product.unit || "unidad"}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Margen</span>
                  <span className="font-medium text-green-600">
                    {product.cost > 0 ? ((product.price - product.cost) / product.cost * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Historial de Movimientos</h2>
        {movements.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Package size={48} className="mx-auto mb-2 opacity-50" />
            <p>Sin movimientos registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 text-sm border-b">
                  <th className="pb-3">Fecha</th>
                  <th className="pb-3">Tipo</th>
                  <th className="pb-3">Cantidad</th>
                  <th className="pb-3">Stock Anterior</th>
                  <th className="pb-3">Stock Nuevo</th>
                  <th className="pb-3">Motivo</th>
                  <th className="pb-3">Usuario</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id} className="border-b hover:bg-gray-50">
                    <td className="py-3">{new Date(m.createdAt).toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(m.type)}`}>
                        {getTypeLabel(m.type)}
                      </span>
                    </td>
                    <td className="py-3 font-semibold">{m.quantity}</td>
                    <td className="py-3">{m.previousStock}</td>
                    <td className="py-3">{m.newStock}</td>
                    <td className="py-3 text-gray-600">{m.reason}</td>
                    <td className="py-3 text-gray-500">{m.createdBy?.name || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdjustModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">Ajustar Stock</h2>
            <p className="text-gray-500 mb-4">
              Stock actual: <strong>{product.stock}</strong> unidades
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nueva cantidad (+ entrada / - salida)
              </label>
              <input
                type="number"
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Ej: 10 (entrada) o -5 (salida)"
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej: Inventario físico"
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAdjustModal(false);
                  setAdjustQty("");
                  setReason("");
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={submitAdjustStock}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
