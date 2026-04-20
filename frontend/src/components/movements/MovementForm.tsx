import { useEffect, useState, useRef } from "react";
import { productService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Package, ArrowDownCircle, ArrowUpCircle, Settings, Plus, Minus, Lock, Search } from "lucide-react";

interface Props {
  onMovementSaved: () => void;
}

interface Product {
  _id: string;
  id: string;
  sku: string;
  name: string;
  stock: number;
  salePrice?: number;
  costPrice?: number;
  category?: { name: string };
}

const MOTIVOS_SALIDA = [
  "Devolución a proveedor",
  "Merma/Baja calidad",
  "Robo/Pérdida",
  "Muestra gratis",
  "Transferencia",
  "Otro"
];

const MOTIVOS_ENTRADA = [
  "Compra a proveedor",
  "Devolución de cliente",
  "Ajuste positivo",
  "Producción propia",
  "Otro"
];

const MovementForm = ({ onMovementSaved }: Props) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(true);
  const [error, setError] = useState("");

  const [productId, setProductId] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const productInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [type, setType] = useState<"entrada" | "salida" | "ajuste">("entrada");
  const [quantity, setQuantity] = useState<number | "">("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const canManualExit = user?.role === "admin";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productService.getAll();
        const mapped = res.data.map((p: any) => ({
          ...p,
          id: p._id,
        }));
        setProducts(mapped);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setProductLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  ).slice(0, 8);

  const selectProduct = (product: Product) => {
    setProductId(product.id);
    setProductSearch("");
    setShowDropdown(false);
    setError("");
    productInputRef.current?.focus();
  };

  const selectedProduct = products.find(p => p.id === productId);

  const mapTypeToBackend = (t: string) => {
    if (t === "entrada") return "in";
    if (t === "salida") return "out";
    return "adjust";
  };

  const handleSubmit = async () => {
    if (!productId || quantity === "" || quantity <= 0 || !reason) {
      setError("Complete todos los campos obligatorios");
      return;
    }

    if (!selectedProduct) return;

    if (type === "salida" && quantity > selectedProduct.stock) {
      setError(`La salida no puede superar el stock disponible (${selectedProduct.stock})`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await productService.adjustStock(productId, {
        quantity: Number(quantity),
        type: mapTypeToBackend(type) as "in" | "out" | "adjust",
        reason,
      });

      setProductId("");
      setType("entrada");
      setQuantity("");
      setReason("");
      setNotes("");

      onMovementSaved();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al registrar movimiento");
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = () => {
    if (type === "entrada") return "text-green-600 bg-green-50 border-green-200";
    if (type === "salida") return "text-red-600 bg-red-50 border-red-200";
    return "text-yellow-600 bg-yellow-50 border-yellow-200";
  };

  const getMotivos = () => {
    if (type === "entrada") return MOTIVOS_ENTRADA;
    if (type === "salida") return MOTIVOS_SALIDA;
    return [...MOTIVOS_ENTRADA, ...MOTIVOS_SALIDA];
  };

  return (
    <div className="bg-white rounded-lg shadow-md border overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Package size={24} />
          Registrar Movimiento de Inventario
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Producto <span className="text-red-500">*</span>
              </label>
              {productLoading ? (
                <div className="border rounded-lg p-3 bg-gray-50 animate-pulse h-12"></div>
              ) : (
                <div className="relative">
                  {selectedProduct ? (
                    <div className="border border-blue-300 rounded-lg p-3 bg-blue-50 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-blue-800">{selectedProduct.name}</p>
                        <p className="text-sm text-blue-600">SKU: {selectedProduct.sku} | Stock: {selectedProduct.stock}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setProductId("");
                          setProductSearch("");
                          setShowDropdown(true);
                          productInputRef.current?.focus();
                        }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Cambiar
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        ref={productInputRef}
                        type="text"
                        value={productSearch}
                        onChange={e => {
                          setProductSearch(e.target.value);
                          setShowDropdown(true);
                          setError("");
                        }}
                        onFocus={() => setShowDropdown(true)}
                        placeholder="Buscar por nombre o SKU..."
                        className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {showDropdown && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                          {filteredProducts.length === 0 ? (
                            <div className="p-3 text-gray-500 text-center">
                              No se encontraron productos
                            </div>
                          ) : (
                            filteredProducts.map(p => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => selectProduct(p)}
                                className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b last:border-b-0 transition-colors"
                              >
                                <p className="font-medium text-gray-800">{p.name}</p>
                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                  <span>SKU: {p.sku}</span>
                                  <span>|</span>
                                  <span className={p.stock <= 5 ? "text-red-500 font-medium" : ""}>
                                    Stock: {p.stock}
                                  </span>
                                  {p.category && (
                                    <>
                                      <span>|</span>
                                      <span>{p.category.name}</span>
                                    </>
                                  )}
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {selectedProduct && (
              <div className="bg-gray-50 rounded-lg p-4 border">
                <h3 className="font-semibold text-gray-800 mb-3">Información del Producto</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="col-span-2">
                    <span className="text-gray-500">Descripción:</span>
                    <p className="font-medium">{selectedProduct.description || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">SKU:</span>
                    <p className="font-medium">{selectedProduct.sku}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Stock Actual:</span>
                    <p className="font-bold text-lg">{selectedProduct.stock} unidades</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Precio Venta:</span>
                    <p className="font-medium">${selectedProduct.salePrice?.toFixed(2) || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Precio Costo:</span>
                    <p className="font-medium">${selectedProduct.costPrice?.toFixed(2) || "N/A"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Movimiento <span className="text-red-500">*</span>
                {!canManualExit && (
                  <span className="text-xs text-gray-400 ml-2">(Ventas desde módulo Ventas)</span>
                )}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => { setType("entrada"); setReason(""); }}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                    type === "entrada"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                >
                  <ArrowDownCircle size={24} className="mb-1" />
                  <span className="text-sm font-medium">Entrada</span>
                </button>
                {canManualExit ? (
                  <button
                    type="button"
                    onClick={() => { setType("salida"); setReason(""); }}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                      type === "salida"
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    <ArrowUpCircle size={24} className="mb-1" />
                    <span className="text-sm font-medium">Salida</span>
                  </button>
                ) : (
                  <div className="flex flex-col items-center justify-center p-3 rounded-lg border-2 border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed">
                    <Lock size={24} className="mb-1" />
                    <span className="text-sm font-medium">Salida</span>
                    <span className="text-xs">(Solo admin)</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => { setType("ajuste"); setReason(""); }}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                    type === "ajuste"
                      ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                >
                  <Settings size={24} className="mb-1" />
                  <span className="text-sm font-medium">Ajuste</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={e => {
                    setQuantity(e.target.value === "" ? "" : Number(e.target.value));
                    setError("");
                  }}
                  placeholder="0"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(prev => (prev === "" ? 1 : Math.max(1, Number(prev) - 1)))}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Minus size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuantity(prev => (prev === "" ? 1 : Number(prev) + 1))}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo / Sección <span className="text-red-500">*</span>
              </label>
              <select
                value={reason}
                onChange={e => {
                  setReason(e.target.value);
                  setError("");
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione el motivo</option>
                {getMotivos().map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas / Referencia
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder="Ej: Compra a proveedor X, Nota de crédito #123, etc."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        {selectedProduct && quantity !== "" && quantity > 0 && (
          <div className={`rounded-lg p-4 border ${getTypeColor()}`}>
            <h3 className="font-semibold mb-3">Resumen del Movimiento</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="opacity-75">Tipo:</span>
                <p className="font-bold capitalize">{type}</p>
              </div>
              <div>
                <span className="opacity-75">Cantidad:</span>
                <p className="font-bold">{quantity} unidades</p>
              </div>
              <div>
                <span className="opacity-75">Stock Actual:</span>
                <p className="font-bold">{selectedProduct.stock}</p>
              </div>
              <div>
                <span className="opacity-75">Stock Después:</span>
                <p className="font-bold">
                  {type === "entrada"
                    ? selectedProduct.stock + Number(quantity)
                    : type === "salida"
                    ? selectedProduct.stock - Number(quantity)
                    : Number(quantity)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => {
              setProductId("");
              setProductSearch("");
              setType("entrada");
              setQuantity("");
              setReason("");
              setNotes("");
              setError("");
              setShowDropdown(false);
            }}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Limpiar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !productId || quantity === "" || !reason}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                Registrar Movimiento
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovementForm;
