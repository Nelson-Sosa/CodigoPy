import { useEffect, useState, useRef, useMemo } from "react";
import { saleService, clientService, productService, authService } from "../services/api";
import { ShoppingCart, Plus, Eye, X, Trash2, Search, User, Package, Edit2, Printer, Receipt, TrendingUp, DollarSign, Calendar, Check, FileText, Ticket } from "lucide-react";
import { printInvoice } from "../components/invoice/InvoiceGenerator";
import { printTicket } from "../utils/ticketPrinter";
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";

interface SaleItem {
  product: string;
  productName: string;
  description: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  subtotal: number;
}

interface Sale {
  _id: string;
  invoiceNumber: string;
  client?: { _id?: string; name: string };
  clientName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  totalCost: number;
  profit: number;
  paymentMethod: string;
  status: string;
  notes?: string;
  createdAt: string;
  createdBy?: { name: string };
}

interface Product {
  _id: string;
  name: string;
  sku: string;
  salePrice: number;
  costPrice: number;
  stock: number;
}

interface Client {
  _id: string;
  name: string;
  phone?: string;
}

interface UserType {
  _id: string;
  name: string;
  email: string;
  role: string;
}

const SalesPage = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [saving, setSaving] = useState(false);
  const [completedSale, setCompletedSale] = useState<any>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [filterUserId, setFilterUserId] = useState<string>("");
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");

  const [clientId, setClientId] = useState("");
  const [items, setItems] = useState<SaleItem[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");

  const productInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowProductDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [filterUserId, filterStartDate, filterEndDate, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      
      if (user?.role === "vendedor") {
        params.userId = user.id || user._id;
      } else if (filterUserId) {
        params.userId = filterUserId;
      }
      
      const [salesRes, clientsRes, productsRes] = await Promise.all([
        saleService.getAll(params),
        clientService.getAll(),
        productService.getAll(),
      ]);
      
      setSales(salesRes.data.sales || []);
      setClients(clientsRes.data || []);
      setProducts(productsRes.data.map((p: any) => ({
        ...p,
        salePrice: p.salePrice || 0,
        costPrice: p.costPrice || 0,
        stock: p.stock || 0,
      })));
      
      if (user?.role === "admin") {
        const usersRes = await authService.getUsers();
        setUsers(usersRes.data || []);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  ).filter(p => p.stock > 0).slice(0, 8);

  const addProduct = (product: Product) => {
    if (product.stock <= 0) {
      alert("Producto sin stock disponible");
      return;
    }

    const existing = items.find(item => item.product === product._id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        alert("No hay suficiente stock");
        return;
      }
      setItems(items.map(item =>
        item.product === product._id
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unitPrice }
          : item
      ));
    } else {
      setItems([...items, {
        product: product._id,
        productName: product.name,
        description: product.description || '',
        sku: product.sku,
        quantity: 1,
        unitPrice: product.salePrice,
        costPrice: product.costPrice,
        subtotal: product.salePrice,
      }]);
    }
    setProductSearch("");
    setShowProductDropdown(false);
    productInputRef.current?.focus();
  };

  const handleSkuSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && productSearch) {
      const exactMatch = products.find(p => 
        p.sku.toLowerCase() === productSearch.toLowerCase() && p.stock > 0
      );
      if (exactMatch) {
        addProduct(exactMatch);
      }
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    const item = items.find(i => i.product === productId);
    if (item && quantity > products.find(p => p._id === productId)?.stock!) {
      alert("No hay suficiente stock");
      return;
    }
    setItems(items.map(item =>
      item.product === productId
        ? { ...item, quantity, subtotal: quantity * item.unitPrice }
        : item
    ));
  };

  const updateUnitPrice = (productId: string, unitPrice: number) => {
    const item = items.find(i => i.product === productId);
    if (!item) return;
    
    if (unitPrice > 0 && unitPrice < item.costPrice) {
      alert(`El precio no puede ser menor al costo ($${item.costPrice.toFixed(2)})`);
      return;
    }
    
    const validPrice = unitPrice || 0;
    setItems(items.map(i =>
      i.product === productId
        ? { ...i, unitPrice: validPrice, subtotal: i.quantity * validPrice }
        : i
    ));
  };

  const removeItem = (productId: string) => {
    setItems(items.filter(item => item.product !== productId));
  };

  const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
  const totalCost = items.reduce((acc, item) => acc + (item.costPrice * item.quantity), 0);
  const total = subtotal - discount;
  const profit = total - totalCost;

  const handleSubmit = async () => {
    if (items.length === 0) {
      alert("Agregue al menos un producto");
      return;
    }

    setSaving(true);
    try {
      const saleData: any = {
        items: items.map(item => ({
          product: item.product,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          costPrice: item.costPrice,
          subtotal: item.subtotal,
        })),
        subtotal,
        discount,
        total,
        paymentMethod,
        notes,
      };

      if (clientId) {
        saleData.clientId = clientId;
      }

      let newSale;
      if (editingSale) {
        await saleService.update(editingSale._id, saleData);
      } else {
        const res = await saleService.create(saleData);
        newSale = res.data;
      }

      setShowForm(false);
      resetForm();
      fetchData();
      window.dispatchEvent(new Event('inventoryUpdate'));

      if (newSale) {
        setCompletedSale(newSale);
        setShowPrintModal(true);
      } else {
        alert("┬íVenta actualizada exitosamente!");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al guardar venta");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setClientId("");
    setItems([]);
    setPaymentMethod("cash");
    setDiscount(0);
    setNotes("");
    setEditingSale(null);
  };

  const openEditForm = (sale: Sale) => {
    setEditingSale(sale);
    setClientId(sale.client?._id || "");
      setItems(sale.items.map(item => ({
        product: typeof item.product === 'object' ? (item.product as any)._id : item.product,
        productName: item.productName,
        sku: item.sku || "",
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        costPrice: item.costPrice,
        subtotal: item.subtotal,
      })));
    setPaymentMethod(sale.paymentMethod);
    setDiscount(sale.discount);
    setNotes(sale.notes || "");
    setShowForm(true);
    setSelectedSale(null);
  };

  const getStatusBadge = (status: string) => {
    if (status === "completed") return "bg-green-100 text-green-800";
    if (status === "pending") return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getPaymentLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: "Efectivo",
      card: "Tarjeta",
      transfer: "Transferencia",
      credit: "Cr├®dito",
    };
    return labels[method] || method;
  };

  const displayStats = useMemo(() => {
    const today = new Date();
    const todayKey = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    
    let startOfPeriod: Date;
    let endOfPeriod: Date;
    let periodLabel = "Este Mes";
    
    if (filterStartDate && filterEndDate) {
      startOfPeriod = new Date(filterStartDate + 'T00:00:00');
      endOfPeriod = new Date(filterEndDate + 'T23:59:59');
      periodLabel = `${format(new Date(filterStartDate + 'T00:00:00'), 'dd/MM')} - ${format(new Date(filterEndDate + 'T00:00:00'), 'dd/MM')}`;
    } else {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      startOfPeriod = startOfMonth;
      endOfPeriod = today;
    }
    
    const startKey = startOfPeriod.getFullYear() * 10000 + (startOfPeriod.getMonth() + 1) * 100 + startOfPeriod.getDate();
    const endKey = endOfPeriod.getFullYear() * 10000 + (endOfPeriod.getMonth() + 1) * 100 + endOfPeriod.getDate();
    
    let todaySales = [];
    let periodSales = [];
    
    sales.forEach(sale => {
      const saleDate = new Date(sale.createdAt);
      const saleKey = saleDate.getFullYear() * 10000 + (saleDate.getMonth() + 1) * 100 + saleDate.getDate();
      
      if (saleKey === todayKey) {
        todaySales.push(sale);
      }
      if (saleKey >= startKey && saleKey <= endKey) {
        periodSales.push(sale);
      }
    });
    
    return {
      today: {
        count: todaySales.length,
        total: todaySales.reduce((acc, s) => acc + s.total, 0),
        profit: todaySales.reduce((acc, s) => acc + (s.profit || 0), 0),
      },
      period: {
        count: periodSales.length,
        total: periodSales.reduce((acc, s) => acc + s.total, 0),
        profit: periodSales.reduce((acc, s) => acc + (s.profit || 0), 0),
      },
      periodLabel,
    };
  }, [sales, filterStartDate, filterEndDate]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingCart className="text-blue-600" size={28} />
            Ventas
          </h1>
          <p className="text-gray-500 text-sm">{sales.length} ventas</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Nueva Venta
        </button>
      </div>

      {filterStartDate && filterEndDate ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-100 font-medium text-sm flex items-center gap-1">
                <Calendar size={14} /> Per├¡odo: {displayStats.periodLabel}
              </span>
              <DollarSign size={18} className="text-blue-100" />
            </div>
            <p className="text-2xl font-bold">${displayStats.period.total.toFixed(2)}</p>
            <p className="text-blue-100 text-sm">{displayStats.period.count} ventas</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-100 font-medium text-sm">Ganancia del Per├¡odo</span>
              <DollarSign size={18} className="text-purple-100" />
            </div>
            <p className="text-2xl font-bold">${displayStats.period.profit.toFixed(2)}</p>
            <p className="text-purple-100 text-sm">Total ganado</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-100 font-medium text-sm flex items-center gap-1">
                <Calendar size={14} /> Hoy
              </span>
              <TrendingUp size={18} className="text-green-100" />
            </div>
            <p className="text-2xl font-bold">${displayStats.today.total.toFixed(2)}</p>
            <p className="text-green-100 text-sm">{displayStats.today.count} ventas</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-100 font-medium text-sm flex items-center gap-1">
                <Calendar size={14} /> {displayStats.periodLabel}
              </span>
              <DollarSign size={18} className="text-blue-100" />
            </div>
            <p className="text-2xl font-bold">${displayStats.period.total.toFixed(2)}</p>
            <p className="text-blue-100 text-sm">{displayStats.period.count} ventas</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-100 font-medium text-sm">Ganancia del Mes</span>
              <DollarSign size={18} className="text-purple-100" />
            </div>
            <p className="text-2xl font-bold">${displayStats.period.profit.toFixed(2)}</p>
            <p className="text-purple-100 text-sm">Total ganado</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b flex flex-wrap gap-4 items-center">
          <span className="text-sm font-medium text-gray-600">Filtros:</span>
          {user?.role === "admin" && (
            <select
              value={filterUserId}
              onChange={(e) => setFilterUserId(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm bg-white"
            >
              <option value="">Todos los vendedores</option>
              {users.map(u => (
                <option key={u._id} value={u._id}>{u.name}</option>
              ))}
            </select>
          )}
          <input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm"
            placeholder="Desde"
          />
          <input
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm"
            placeholder="Hasta"
          />
          {(filterUserId || filterStartDate || filterEndDate) && (
            <button
              onClick={() => { setFilterUserId(""); setFilterStartDate(""); setFilterEndDate(""); }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Limpiar filtros
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-500 text-sm">
              <th className="p-4">Folio</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Total</th>
              <th className="p-4">Ganancia</th>
              <th className="p-4">Método</th>
              <th className="p-4">Fecha</th>
              <th className="p-4">Vendedor</th>
              <th className="p-4">Estado</th>
              <th className="p-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sales.map(sale => (
              <tr key={sale._id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-medium">{sale.invoiceNumber}</td>
                <td className="p-4">{sale.client?.name || sale.clientName}</td>
                <td className="p-4 font-bold text-green-600">${sale.total.toFixed(2)}</td>
                <td className="p-4 text-blue-600">${(sale.profit || 0).toFixed(2)}</td>
                <td className="p-4">{getPaymentLabel(sale.paymentMethod)}</td>
                <td className="p-4 text-gray-500">{new Date(sale.createdAt).toLocaleDateString()}</td>
                <td className="p-4 text-sm">
                  {sale.createdBy?.name || <span className="text-gray-400">-</span>}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(sale.status)}`}>
                    {sale.status === "completed" ? "Completada" : sale.status === "pending" ? "Pendiente" : "Cancelada"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    {sale.status !== "cancelled" && (
                      <button
                        onClick={() => openEditForm(sale)}
                        className="text-yellow-600 hover:text-yellow-800 p-1"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedSale(sale)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-gray-400">
                  No hay ventas registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingCart size={24} className="text-blue-600" />
                {editingSale ? "Editar Venta" : "Nueva Venta"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <User size={14} />
                    Cliente
                  </label>
                  <div className="relative">
                    <select
                      value={clientId}
                      onChange={(e) => {
                        setClientId(e.target.value);
                      }}
                      className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                    >
                      <option value="">Consumidor Final (sin registro)</option>
                      {clients.map(c => (
                        <option key={c._id} value={c._id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Dejar vacío para venta a consumidor final</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="cash">💵 Efectivo</option>
                    <option value="card">💳 Tarjeta</option>
                    <option value="transfer">🏦 Transferencia</option>
                    <option value="credit">📋 Crédito/Fiado</option>
                  </select>
                </div>
              </div>

              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Package size={14} />
                  Buscar Producto
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
                    onKeyDown={handleSkuSearch}
                    placeholder="Buscar por nombre, SKU o presionar Enter para buscar por código..."
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
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 text-sm">{p.name}</div>
                              <div className="text-xs font-mono bg-gray-100 text-gray-600 mt-1 inline-block px-1.5 py-0.5 rounded">
                                SKU: {p.sku}
                              </div>
                              {p.description && (
                                <div className="text-xs text-blue-600 mt-1 leading-snug">
                                  {p.description.length > 60 ? p.description.substring(0, 60) + '...' : p.description}
                                </div>
                              )}
                            </div>
                            <div className="text-right ml-3 flex-shrink-0">
                              <span className="text-green-600 font-bold">${p.salePrice.toFixed(2)}</span>
                              <span className={`block text-xs ${p.stock <= 5 ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                                Stock: {p.stock}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="p-4 text-gray-400 text-center">
                        {products.some(p => p.sku.toLowerCase() === productSearch.toLowerCase()) 
                          ? "Producto sin stock" 
                          : "No se encontraron productos"}
                      </p>
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
                        <th className="p-3 w-24 text-center">Cantidad</th>
                        <th className="p-3 w-24 text-center">Costo</th>
                        <th className="p-3 w-28 text-center">P. Unit.</th>
                        <th className="p-3 w-28 text-right">Subtotal</th>
                        <th className="p-3 w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => (
                        <tr key={item.product} className="border-t">
                          <td className="p-3">
                            <div className="font-medium text-gray-900 text-sm">{item.productName}</div>
                            <div className="text-xs font-mono bg-gray-100 text-gray-600 mt-1 inline-block px-1.5 py-0.5 rounded">
                              SKU: {item.sku}
                            </div>
                            {item.description && (
                              <div className="text-xs text-blue-600 mt-1">
                                {item.description}
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => updateQuantity(item.product, item.quantity - 1)}
                                className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300 font-bold text-sm"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.product, Number(e.target.value))}
                                className="w-12 border rounded px-1 py-0.5 text-center text-sm"
                              />
                              <button
                                onClick={() => updateQuantity(item.product, item.quantity + 1)}
                                className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300 font-bold text-sm"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="p-3 text-center text-gray-500 text-sm">
                            ${item.costPrice.toFixed(2)}
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice || ''}
                              onChange={(e) => updateUnitPrice(item.product, Number(e.target.value))}
                              className="w-full border rounded px-2 py-1 text-center text-green-600 font-medium text-sm"
                            />
                          </td>
                          <td className="p-3 text-right font-medium text-sm">${item.subtotal.toFixed(2)}</td>
                          <td className="p-3">
                            <button 
                              onClick={() => removeItem(item.product)} 
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 size={14} />
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
                  <span>Descuento:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">$</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-24 border rounded px-2 py-1 text-right"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-3">
                  <span>Total:</span>
                  <span className="text-green-600">${total.toFixed(2)}</span>
                </div>
                {items.length > 0 && (
                  <div className="flex justify-between text-sm text-blue-600 border-t pt-2">
                    <span>Ganancia estimada:</span>
                    <span className="font-medium">${profit.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas / Observaciones</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Observaciones adicionales..."
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
                className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    {editingSale ? "Actualizar Venta" : "Completar Venta"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="border-b px-4 py-3 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">
                  {selectedSale.invoiceNumber}
                </span>
                <span className="text-gray-500 text-sm">{new Date(selectedSale.createdAt).toLocaleDateString()}</span>
              </div>
              <button onClick={() => setSelectedSale(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs text-gray-500">Cliente</p>
                  <p className="font-semibold">{selectedSale.client?.name || selectedSale.clientName}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Método</p>
                  <p className="font-medium">{getPaymentLabel(selectedSale.paymentMethod)}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Subtotal</span>
                  <span>${selectedSale.subtotal.toFixed(2)}</span>
                </div>
                {selectedSale.discount > 0 && (
                  <div className="flex justify-between items-center mb-2 text-red-500">
                    <span className="text-sm">Descuento</span>
                    <span>-${selectedSale.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t font-bold text-lg">
                  <span>Total</span>
                  <span className="text-green-600">${selectedSale.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-blue-600 mt-1">
                  <span>Ganancia</span>
                  <span>${(selectedSale.profit || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Productos ({selectedSale.items.length})</p>
                <div className="space-y-2">
                  {selectedSale.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-sm bg-white border rounded-lg p-2">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-xs text-gray-400">{item.quantity} x ${item.unitPrice}</p>
                      </div>
                      <span className="font-semibold">${item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedSale.notes && (
                <div className="mb-4 p-2 bg-yellow-50 rounded border border-yellow-200">
                  <p className="text-xs text-yellow-600">Nota:</p>
                  <p className="text-sm">{selectedSale.notes}</p>
                </div>
              )}

              {selectedSale.createdBy && (
                <p className="text-xs text-gray-400 mb-4">Vendido por: {selectedSale.createdBy.name}</p>
              )}

              {selectedSale.status === "cancelled" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center text-red-600 font-medium">
                  Esta venta est├í cancelada
                </div>
              )}
            </div>
            
            <div className="border-t p-3 flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => printInvoice(selectedSale)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm"
              >
                <Printer size={16} />
                Factura
              </button>
              <button
                onClick={() => printTicket(selectedSale)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-sm"
              >
                <Receipt size={16} />
                Ticket
              </button>
              {selectedSale.status !== "cancelled" && (
                <>
                  <button
                    onClick={() => openEditForm(selectedSale)}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition flex items-center gap-2 text-sm"
                  >
                    <Edit2 size={16} />
                    Editar
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm(`┬┐Cancelar venta ${selectedSale.invoiceNumber}?`)) return;
                      try {
                        await saleService.cancel(selectedSale._id);
                        setSelectedSale(null);
                        fetchData();
                        window.dispatchEvent(new Event('inventoryUpdate'));
                      } catch (err: any) {
                        alert(err.response?.data?.message || "Error al cancelar venta");
                      }
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2 text-sm"
                  >
                    <X size={16} />
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showPrintModal && completedSale && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center text-white">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold">┬íVenta Completada!</h3>
              <p className="text-green-100 text-sm mt-1">{completedSale.invoiceNumber}</p>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 text-center mb-6">┬┐Desea imprimir un comprobante?</p>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    printTicket(completedSale);
                    setShowPrintModal(false);
                    setCompletedSale(null);
                  }}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/30"
                >
                  <Ticket size={22} />
                  <div className="text-left">
                    <span className="font-semibold block">Imprimir Ticket</span>
                    <span className="text-xs text-blue-100">Comprobante corto</span>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    printInvoice(completedSale);
                    setShowPrintModal(false);
                    setCompletedSale(null);
                  }}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/30"
                >
                  <FileText size={22} />
                  <div className="text-left">
                    <span className="font-semibold block">Imprimir Factura</span>
                    <span className="text-xs text-purple-100">Comprobante completo</span>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    setShowPrintModal(false);
                    setCompletedSale(null);
                  }}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <X size={20} />
                  <span className="font-medium">No imprimir</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesPage;

