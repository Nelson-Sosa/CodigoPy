import { useEffect, useState, useRef } from "react";
import { purchaseService, productService, supplierService, categoryService } from "../services/api";
import { Package, Plus, Search, Eye, X, Trash2, CheckCircle, Clock, Truck, DollarSign } from "lucide-react";
import { format } from "date-fns";

interface PurchaseItem {
  product?: string | { _id: string; name: string };
  productId: string;
  productName: string;
  description?: string;
  isNewProduct?: boolean;
  sku?: string;
  categoryId?: string;
  quantity: number;
  unitCost: number;
  salePrice?: number;
  subtotal: number;
}

interface Purchase {
  _id: string;
  purchaseNumber: string;
  supplier?: { _id?: string; name: string };
  supplierName: string;
  items: PurchaseItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  amountPaid: number;
  notes?: string;
  expectedDate?: string;
  receivedDate?: string;
  createdAt: string;
  createdBy?: { name: string };
}

interface Product {
  _id: string;
  name: string;
  sku: string;
  stock: number;
  costPrice: number;
}

interface Supplier {
  _id: string;
  name: string;
  phone?: string;
}

interface Category {
  _id: string;
  name: string;
  color?: string;
}

const PurchasesPage = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [saving, setSaving] = useState(false);

  const [supplierId, setSupplierId] = useState("");
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [tax, setTax] = useState(0);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  
  const [showQuickProductModal, setShowQuickProductModal] = useState(false);
  const [quickProductData, setQuickProductData] = useState({
    name: "",
    description: "",
    sku: "",
    categoryId: "",
    cost: 0,
    salePrice: 0,
    initialStock: 1,
  });

  const productInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowProductDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [purchasesRes, productsRes, suppliersRes, categoriesRes] = await Promise.all([
        purchaseService.getAll(),
        productService.getAll(),
        supplierService.getAll(),
        categoryService.getAll(),
      ]);
      setPurchases(purchasesRes.data.purchases || []);
      setProducts(productsRes.data || []);
      setSuppliers(suppliersRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const openQuickProductModal = () => {
    setQuickProductData({
      name: productSearch,
      description: "",
      sku: "",
      categoryId: "",
      cost: 0,
      salePrice: 0,
      initialStock: 1,
    });
    setShowQuickProductModal(true);
    setShowProductDropdown(false);
  };

  const handleQuickCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickProductData.name) {
      alert("El nombre del producto es obligatorio");
      return;
    }
    
    const newProductId = `new-${Date.now()}`;
    
    const newItem: PurchaseItem = {
      product: newProductId,
      productId: newProductId,
      productName: quickProductData.name,
      description: quickProductData.description,
      isNewProduct: true,
      sku: quickProductData.sku || `SKU-TEMP-${Date.now()}`,
      categoryId: quickProductData.categoryId || undefined,
      quantity: quickProductData.initialStock || 1,
      unitCost: quickProductData.cost,
      salePrice: quickProductData.salePrice || quickProductData.cost * 1.3,
      subtotal: (quickProductData.initialStock || 1) * quickProductData.cost,
    };
    
    setItems([...items, newItem]);
    setShowQuickProductModal(false);
    setProductSearch("");
    setShowProductDropdown(false);
    setQuickProductData({
      name: "",
      description: "",
      sku: "",
      categoryId: "",
      cost: 0,
      salePrice: 0,
      initialStock: 1,
    });
    productInputRef.current?.focus();
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  ).slice(0, 8);

  const addProduct = (product: Product) => {
    const existing = items.find(item => (item.productId || item.product) === product._id);
    if (existing) {
      setItems(items.map(item =>
        (item.productId || item.product) === product._id
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unitCost }
          : item
      ));
    } else {
      setItems([...items, {
        product: product._id,
        productId: product._id,
        productName: product.name,
        quantity: 1,
        unitCost: product.costPrice || 0,
        subtotal: product.costPrice || 0,
      }]);
    }
    setProductSearch("");
    setShowProductDropdown(false);
    productInputRef.current?.focus();
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(items.filter(item => item.productId !== productId));
      return;
    }
    setItems(items.map(item =>
      item.productId === productId
        ? { ...item, quantity, subtotal: quantity * item.unitCost }
        : item
    ));
  };

  const updateUnitCost = (productId: string, unitCost: number) => {
    setItems(items.map(item =>
      item.productId === productId
        ? { ...item, unitCost, subtotal: item.quantity * unitCost }
        : item
    ));
  };

  const removeItem = (productId: string) => {
    setItems(items.filter(item => item.productId !== productId));
  };

  const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
  const total = subtotal + tax;

  const handleSubmit = async () => {
    if (items.length === 0) {
      setError("Agregue al menos un producto");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await purchaseService.create({
        supplierId: supplierId || null,
        items: items.map(item => ({
          productId: item.productId || item.product,
          productName: item.productName,
          description: item.description || '',
          sku: item.sku || '',
          categoryId: item.categoryId || null,
          quantity: item.quantity,
          unitCost: item.unitCost,
          salePrice: item.salePrice || 0,
        })),
        subtotal,
        tax,
        total,
        paymentMethod,
        notes,
      });

      setShowForm(false);
      resetForm();
      fetchData();
      alert("¡Orden de compra creada exitosamente!");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al crear orden");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setSupplierId("");
    setItems([]);
    setPaymentMethod("credit");
    setTax(0);
    setNotes("");
    setError("");
  };

  const handleReceive = async (purchase: Purchase) => {
    if (!confirm(`¿Confirmar recepción de ${purchase.purchaseNumber}?\n\nSe会增加 el stock de ${purchase.items.length} productos.`)) return;

    try {
      const res = await purchaseService.receive(purchase._id);
      fetchData();
      setSelectedPurchase(null);
      window.dispatchEvent(new Event('inventoryUpdate'));
      alert(res.data?.message || "¡Mercancía recibida y stock actualizado!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al recibir mercancía");
    }
  };

  const handleCancel = async (purchase: Purchase) => {
    if (!confirm(`¿Cancelar orden ${purchase.purchaseNumber}?`)) return;

    try {
      await purchaseService.cancel(purchase._id);
      fetchData();
      setSelectedPurchase(null);
      alert("Orden cancelada");
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al cancelar orden");
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "received") return "bg-green-100 text-green-800";
    if (status === "pending") return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getStatusLabel = (status: string) => {
    if (status === "received") return "Recibida";
    if (status === "pending") return "Pendiente";
    return "Cancelada";
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const pendingCount = purchases.filter(p => p.status === "pending").length;
  const receivedCount = purchases.filter(p => p.status === "received").length;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Truck className="text-blue-600" size={28} />
            Órdenes de Compra
          </h1>
          <p className="text-gray-500 text-sm">{purchases.length} órdenes registradas</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Nueva Orden
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center gap-3">
            <Clock className="text-yellow-500" size={28} />
            <div>
              <p className="text-gray-500 text-sm">Pendientes</p>
              <p className="text-2xl font-bold">{pendingCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-green-500">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-500" size={28} />
            <div>
              <p className="text-gray-500 text-sm">Recibidas</p>
              <p className="text-2xl font-bold">{receivedCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-blue-500">
          <div className="flex items-center gap-3">
            <DollarSign className="text-blue-500" size={28} />
            <div>
              <p className="text-gray-500 text-sm">Total Compras</p>
              <p className="text-2xl font-bold">
                ${purchases.filter(p => p.status === "received").reduce((acc, p) => acc + p.total, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-500 text-sm">
              <th className="p-4">Orden</th>
              <th className="p-4">Proveedor</th>
              <th className="p-4">Productos</th>
              <th className="p-4 text-right">Total</th>
              <th className="p-4">Estado</th>
              <th className="p-4">Fecha</th>
              <th className="p-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map(purchase => (
              <tr key={purchase._id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-medium">{purchase.purchaseNumber}</td>
                <td className="p-4">{purchase.supplier?.name || purchase.supplierName}</td>
                <td className="p-4">{purchase.items.length} prod.</td>
                <td className="p-4 text-right font-bold text-blue-600">${purchase.total.toFixed(2)}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(purchase.status)}`}>
                    {getStatusLabel(purchase.status)}
                  </span>
                </td>
                <td className="p-4 text-gray-500">{format(new Date(purchase.createdAt), 'dd/MM/yyyy')}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedPurchase(purchase)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <Eye size={18} />
                    </button>
                    {purchase.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleReceive(purchase)}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Recibir mercancía"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          onClick={() => handleCancel(purchase)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Cancelar"
                        >
                          <X size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {purchases.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">
                  No hay órdenes de compra
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Truck size={24} className="text-blue-600" />
                Nueva Orden de Compra
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proveedor
                  </label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Seleccionar proveedor</option>
                    {suppliers.map(s => (
                      <option key={s._id} value={s._id}>{s.name} {s.phone ? `(${s.phone})` : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="credit">Crédito</option>
                    <option value="cash">Efectivo</option>
                    <option value="transfer">Transferencia</option>
                  </select>
                </div>
              </div>

              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Package size={14} />
                  Agregar Producto
                </label>
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    ref={productInputRef}
                    type="text"
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setShowProductDropdown(true);
                    }}
                    onFocus={() => setShowProductDropdown(true)}
                    placeholder="Buscar producto por nombre o SKU..."
                    className="w-full border rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {showProductDropdown && productSearch && (
                  <div className="absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-72 overflow-y-auto">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map(p => (
                        <button
                          key={p._id}
                          onClick={() => addProduct(p)}
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b last:border-b-0 transition"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-semibold text-gray-800">{p.name}</span>
                              <span className="text-gray-400 text-sm ml-2">SKU: {p.sku}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-gray-600">Stock: {p.stock}</span>
                              <span className="text-blue-600 text-sm block">Costo: ${p.costPrice.toFixed(2)}</span>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4">
                        <p className="text-gray-400 text-center mb-3">No se encontraron productos</p>
                        <button
                          onClick={openQuickProductModal}
                          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition"
                        >
                          <Plus size={18} />
                          Crear nuevo producto
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr className="text-left text-sm text-gray-600">
                        <th className="p-3">Producto</th>
                        <th className="p-3 w-24">Cantidad</th>
                        <th className="p-3 w-32">Costo Unit.</th>
                        <th className="p-3 w-28">Subtotal</th>
                        <th className="p-3 w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="p-3 font-medium">{item.productName}</td>
                          <td className="p-3">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                              className="w-full border rounded px-2 py-1"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitCost}
                              onChange={(e) => updateUnitCost(item.productId, Number(e.target.value))}
                              className="w-full border rounded px-2 py-1"
                            />
                          </td>
                          <td className="p-3 font-medium">${item.subtotal.toFixed(2)}</td>
                          <td className="p-3">
                            <button onClick={() => removeItem(item.productId)} className="text-red-500 hover:text-red-700">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Impuestos:</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={tax}
                    onChange={(e) => setTax(Number(e.target.value))}
                    className="w-32 border rounded px-2 py-1 text-right"
                  />
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-3">
                  <span>Total:</span>
                  <span className="text-blue-600">${total.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Notas adicionales..."
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 border rounded-lg hover:bg-gray-100 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving || items.length === 0}
                className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {saving ? "Guardando..." : "Crear Orden de Compra"}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Eye size={20} />
                Detalle de Orden
              </h2>
              <button onClick={() => setSelectedPurchase(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500 text-sm block">Orden:</span>
                  <span className="font-semibold">{selectedPurchase.purchaseNumber}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-sm block">Fecha:</span>
                  <span className="font-medium">{format(new Date(selectedPurchase.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-sm block">Proveedor:</span>
                  <span className="font-medium">{selectedPurchase.supplier?.name || selectedPurchase.supplierName}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-sm block">Estado:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(selectedPurchase.status)}`}>
                    {getStatusLabel(selectedPurchase.status)}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-2 text-gray-700">Productos</h3>
                <div className="space-y-2">
                  {selectedPurchase.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b last:border-b-0">
                      <div>
                        <span className="font-medium">{item.productName}</span>
                        <span className="text-gray-400 text-sm ml-2">x{item.quantity}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">${item.subtotal.toFixed(2)}</span>
                        <span className="text-gray-400 text-xs block">P.U. ${item.unitCost}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${selectedPurchase.subtotal.toFixed(2)}</span>
                </div>
                {selectedPurchase.tax > 0 && (
                  <div className="flex justify-between">
                    <span>Impuestos:</span>
                    <span>${selectedPurchase.tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span className="text-blue-600">${selectedPurchase.total.toFixed(2)}</span>
                </div>
              </div>

              {selectedPurchase.notes && (
                <div className="border-t pt-4">
                  <span className="text-gray-500 text-sm block">Notas:</span>
                  <span className="text-gray-700">{selectedPurchase.notes}</span>
                </div>
              )}

              {selectedPurchase.status === "pending" && (
                <div className="border-t pt-4 flex justify-between gap-3">
                  <button
                    onClick={() => handleCancel(selectedPurchase)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2"
                  >
                    <X size={16} />
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleReceive(selectedPurchase)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Recibir Mercancía
                  </button>
                </div>
              )}

              {selectedPurchase.status === "received" && selectedPurchase.receivedDate && (
                <div className="border-t pt-4 text-green-600 text-sm">
                  ✓ Recibida el {format(new Date(selectedPurchase.receivedDate), 'dd/MM/yyyy HH:mm')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showQuickProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-3 border-b flex justify-between items-center bg-green-50">
              <h3 className="font-bold text-green-800 flex items-center gap-2 text-sm">
                <Package size={18} />
                Crear Nuevo Producto
              </h3>
              <button onClick={() => setShowQuickProductModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleQuickCreateProduct} className="p-3 space-y-3 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={quickProductData.name}
                    onChange={(e) => setQuickProductData({ ...quickProductData, name: e.target.value })}
                    className="w-full border rounded px-2 py-1.5 text-sm"
                    placeholder="Nombre del producto"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Categoría</label>
                  <select
                    value={quickProductData.categoryId}
                    onChange={(e) => setQuickProductData({ ...quickProductData, categoryId: e.target.value })}
                    className="w-full border rounded px-2 py-1.5 text-sm bg-white"
                  >
                    <option value="">Sin categoría</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Descripción / Detalle</label>
                <input
                  type="text"
                  value={quickProductData.description}
                  onChange={(e) => setQuickProductData({ ...quickProductData, description: e.target.value })}
                  className="w-full border rounded px-2 py-1.5 text-sm"
                  placeholder="Ej: iPhone 16 Pro Max 256GB Azul"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">SKU</label>
                  <input
                    type="text"
                    value={quickProductData.sku}
                    onChange={(e) => setQuickProductData({ ...quickProductData, sku: e.target.value })}
                    className="w-full border rounded px-2 py-1.5 text-sm"
                    placeholder="Código"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Costo</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={quickProductData.cost}
                    onChange={(e) => setQuickProductData({ ...quickProductData, cost: Number(e.target.value) })}
                    className="w-full border rounded px-2 py-1.5 text-sm"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Venta</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={quickProductData.salePrice}
                    onChange={(e) => setQuickProductData({ ...quickProductData, salePrice: Number(e.target.value) })}
                    className="w-full border rounded px-2 py-1.5 text-sm"
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickProductModal(false)}
                  className="flex-1 bg-gray-200 py-2 rounded text-sm hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded text-sm hover:bg-green-700 flex items-center justify-center gap-1"
                >
                  <Plus size={16} />
                  Agregar a Orden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchasesPage;
