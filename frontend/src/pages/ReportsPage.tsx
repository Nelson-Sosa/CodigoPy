import { useEffect, useState } from "react";
import { saleService, productService, clientService, authService } from "../services/api";
import { BarChart3, FileText, Download, TrendingUp, Users, Package, DollarSign, ShoppingCart } from "lucide-react";
import { format } from "date-fns";

interface Sale {
  _id: string;
  invoiceNumber: string;
  clientName: string;
  items: { productName: string; quantity: number; unitPrice: number; costPrice: number; subtotal: number }[];
  subtotal: number;
  discount: number;
  total: number;
  totalCost: number;
  profit: number;
  paymentMethod: string;
  status: string;
  dateKey?: number;
  createdAt: string;
  createdBy?: { _id: string; name: string };
}

interface Product {
  _id: string;
  name: string;
  sku: string;
  stock: number;
  minStock: number;
  costPrice: number;
  salePrice: number;
  category?: { name: string };
}

interface Client {
  _id: string;
  name: string;
  totalPurchases: number;
  totalSpent: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

type ReportType = "sales" | "inventory" | "profits" | "clients";

const formatDateKey = (dateKey: number | undefined, fallback: string) => {
    if (!dateKey) return fallback;
    const str = dateKey.toString();
    const year = str.slice(0, 4);
    const month = str.slice(4, 6);
    const day = str.slice(6, 8);
    return `${day}/${month}/${year}`;
  };

const ReportsPage = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeReport, setActiveReport] = useState<ReportType>("sales");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [invPage, setInvPage] = useState(1);
  const [invTotalPages, setInvTotalPages] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    fetchData();
  }, [selectedUserId, startDate, endDate, currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, limit: pageSize };
      if (selectedUserId) params.userId = selectedUserId;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const [salesRes, productsRes, clientsRes, usersRes] = await Promise.all([
        saleService.getAll(params),
        productService.getAll(),
        clientService.getAll(),
        authService.getUsers(),
      ]);
      setSales(salesRes.data.sales || []);
      setTotalPages(salesRes.data.pages || 1);
      setProducts(productsRes.data || []);
      setClients(clientsRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = sales.filter(s => s.status !== "cancelled");

  const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    const csvContent = [
      headers.join(","),
      ...data.map(row => Object.values(row).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const totalSalesAmount = filteredSales.reduce((acc, s) => acc + s.total, 0);
  const totalProfits = filteredSales.reduce((acc, s) => acc + (s.profit || 0), 0);
  const totalCost = filteredSales.reduce((acc, s) => acc + (s.totalCost || 0), 0);
  const avgTicket = filteredSales.length > 0 ? totalSalesAmount / filteredSales.length : 0;

  const byPaymentMethod = filteredSales.reduce((acc, s) => {
    if (!acc[s.paymentMethod]) acc[s.paymentMethod] = { count: 0, total: 0 };
    acc[s.paymentMethod].count++;
    acc[s.paymentMethod].total += s.total;
    return acc;
  }, {} as Record<string, { count: number; total: number }>);

  const topProducts = filteredSales.reduce((acc, sale) => {
    sale.items.forEach(item => {
      const key = item.productName;
      if (!acc[key]) acc[key] = { name: key, quantity: 0, revenue: 0, profit: 0 };
      acc[key].quantity += item.quantity;
      acc[key].revenue += item.subtotal;
      acc[key].profit += (item.unitPrice - item.costPrice) * item.quantity;
    });
    return acc;
  }, {} as Record<string, { name: string; quantity: number; revenue: number; profit: number }>);

  const topClients = [...clients]
    .filter(c => c.totalPurchases > 0 || c.totalSpent > 0)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10);

  const getPaymentLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: "Efectivo",
      card: "Tarjeta",
      transfer: "Transferencia",
      credit: "Crédito"
    };
    return labels[method] || method;
  };

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
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="text-blue-600" size={28} />
          Reportes
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Ventas del Período</p>
              <p className="text-2xl font-bold text-gray-800">${totalSalesAmount.toFixed(2)}</p>
            </div>
            <ShoppingCart className="text-blue-500" size={32} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Ganancia del Período</p>
              <p className="text-2xl font-bold text-green-600">${totalProfits.toFixed(2)}</p>
            </div>
            <TrendingUp className="text-green-500" size={32} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Ticket Promedio</p>
              <p className="text-2xl font-bold text-purple-600">${avgTicket.toFixed(2)}</p>
            </div>
            <DollarSign className="text-purple-500" size={32} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Transacciones</p>
              <p className="text-2xl font-bold text-orange-600">{filteredSales.length}</p>
            </div>
            <FileText className="text-orange-500" size={32} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveReport("sales")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
              activeReport === "sales" ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            <ShoppingCart size={18} />
            Ventas por Período
          </button>
          <button
            onClick={() => setActiveReport("inventory")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
              activeReport === "inventory" ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            <Package size={18} />
            Inventario Actual
          </button>
          <button
            onClick={() => setActiveReport("profits")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
              activeReport === "profits" ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            <TrendingUp size={18} />
            Ganancias Detalladas
          </button>
          <button
            onClick={() => setActiveReport("clients")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
              activeReport === "clients" ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            <Users size={18} />
            Top Clientes
          </button>
        </div>
      </div>

      {activeReport === "sales" && (
        <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h2 className="text-lg font-bold">Reporte de Ventas</h2>
            <div className="flex gap-4 items-center flex-wrap">
              <div className="flex gap-2 items-center">
                <label className="text-sm text-gray-600">Vendedor:</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="border rounded px-3 py-1.5 text-sm bg-white"
                >
                  <option value="">Todos</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>{user.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 items-center">
                <label className="text-sm text-gray-600">Desde:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border rounded px-3 py-1.5 text-sm"
                />
              </div>
              <div className="flex gap-2 items-center">
                <label className="text-sm text-gray-600">Hasta:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border rounded px-3 py-1.5 text-sm"
                />
              </div>
              <button
                onClick={() => exportToCSV(
                  filteredSales.map(s => ({
                    Folio: s.invoiceNumber,
                    Vendedor: s.createdBy?.name || 'Sistema',
                    Cliente: s.clientName,
                    'Subtotal': s.subtotal,
                    'Descuento': s.discount,
                    Total: s.total,
                    Ganancia: s.profit?.toFixed(2),
                    'Método Pago': getPaymentLabel(s.paymentMethod),
                    Fecha: s.dateKey ? formatDateKey(s.dateKey, '') : format(new Date(s.createdAt), 'yyyy-MM-dd HH:mm')
                  })),
                  'reporte_ventas',
                  ['Folio', 'Vendedor', 'Cliente', 'Subtotal', 'Descuento', 'Total', 'Ganancia', 'Método Pago', 'Fecha']
                )}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
              >
                <Download size={18} />
                Exportar CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left">
                  <th className="p-3 font-medium">Folio</th>
                  <th className="p-3 font-medium">Vendedor</th>
                  <th className="p-3 font-medium">Cliente</th>
                  <th className="p-3 font-medium text-right">Subtotal</th>
                  <th className="p-3 font-medium text-right">Descuento</th>
                  <th className="p-3 font-medium text-right">Total</th>
                  <th className="p-3 font-medium text-right">Ganancia</th>
                  <th className="p-3 font-medium">Método</th>
                  <th className="p-3 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map(sale => (
                  <tr key={sale._id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{sale.invoiceNumber}</td>
                    <td className="p-3 text-sm">
                      <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                        {sale.createdBy?.name || 'Sistema'}
                      </span>
                    </td>
                    <td className="p-3">{sale.clientName}</td>
                    <td className="p-3 text-right">${sale.subtotal.toFixed(2)}</td>
                    <td className="p-3 text-right text-red-500">${sale.discount > 0 ? `-${sale.discount.toFixed(2)}` : '0.00'}</td>
                    <td className="p-3 text-right font-bold text-green-600">${sale.total.toFixed(2)}</td>
                    <td className="p-3 text-right text-blue-600">${(sale.profit || 0).toFixed(2)}</td>
                    <td className="p-3">{getPaymentLabel(sale.paymentMethod)}</td>
                    <td className="p-3 text-gray-500">{formatDateKey(sale.dateKey, format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm'))}</td>
                  </tr>
                ))}
                {filteredSales.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-400">
                      No hay ventas en este período
                    </td>
                  </tr>
                )}
              </tbody>
              {filteredSales.length > 0 && (
                <tfoot className="bg-gray-50 font-bold">
                  <tr>
                    <td colSpan={3} className="p-3">TOTALES</td>
                    <td className="p-3 text-right">${filteredSales.reduce((a, s) => a + s.subtotal, 0).toFixed(2)}</td>
                    <td className="p-3 text-right">${filteredSales.reduce((a, s) => a + s.discount, 0).toFixed(2)}</td>
                    <td className="p-3 text-right text-green-600">${totalSalesAmount.toFixed(2)}</td>
                    <td className="p-3 text-right text-blue-600">${totalProfits.toFixed(2)}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="px-3 py-1 text-sm">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-500 text-sm">Efectivo</p>
              <p className="font-bold">${(byPaymentMethod['cash']?.total || 0).toFixed(2)}</p>
              <p className="text-xs text-gray-400">{(byPaymentMethod['cash']?.count || 0)} ventas</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-500 text-sm">Tarjeta</p>
              <p className="font-bold">${(byPaymentMethod['card']?.total || 0).toFixed(2)}</p>
              <p className="text-xs text-gray-400">{(byPaymentMethod['card']?.count || 0)} ventas</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-500 text-sm">Transferencia</p>
              <p className="font-bold">${(byPaymentMethod['transfer']?.total || 0).toFixed(2)}</p>
              <p className="text-xs text-gray-400">{(byPaymentMethod['transfer']?.count || 0)} ventas</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-500 text-sm">Crédito</p>
              <p className="font-bold">${(byPaymentMethod['credit']?.total || 0).toFixed(2)}</p>
              <p className="text-xs text-gray-400">{(byPaymentMethod['credit']?.count || 0)} ventas</p>
            </div>
          </div>
        </div>
      )}

      {activeReport === "inventory" && (
        <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">Inventario Actual</h2>
            <button
              onClick={() => exportToCSV(
                products.map(p => ({
                  SKU: p.sku,
                  Nombre: p.name,
                  Categoría: p.category?.name || 'Sin categoría',
                  Stock: p.stock,
                  'Stock Mínimo': p.minStock,
                  'Precio Costo': p.costPrice,
                  'Precio Venta': p.salePrice,
                  Valor: (p.stock * p.costPrice).toFixed(2)
                })),
                'inventario',
                ['SKU', 'Nombre', 'Categoría', 'Stock', 'Stock Mínimo', 'Precio Costo', 'Precio Venta', 'Valor']
              )}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
            >
              <Download size={18} />
              Exportar CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left">
                  <th className="p-3 font-medium">SKU</th>
                  <th className="p-3 font-medium">Producto</th>
                  <th className="p-3 font-medium">Categoría</th>
                  <th className="p-3 font-medium text-right">Stock</th>
                  <th className="p-3 font-medium text-right">Stock Mín.</th>
                  <th className="p-3 font-medium text-right">P. Costo</th>
                  <th className="p-3 font-medium text-right">P. Venta</th>
                  <th className="p-3 font-medium text-right">Valor Total</th>
                  <th className="p-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {products.slice((invPage - 1) * pageSize, invPage * pageSize).map(product => (
                  <tr key={product._id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{product.sku}</td>
                    <td className="p-3">{product.name}</td>
                    <td className="p-3 text-gray-500">{product.category?.name || '-'}</td>
                    <td className="p-3 text-right font-bold">{product.stock}</td>
                    <td className="p-3 text-right text-gray-500">{product.minStock}</td>
                    <td className="p-3 text-right">${product.costPrice.toFixed(2)}</td>
                    <td className="p-3 text-right">${product.salePrice.toFixed(2)}</td>
                    <td className="p-3 text-right">${(product.stock * product.costPrice).toFixed(2)}</td>
                    <td className="p-3">
                      {product.stock === 0 ? (
                        <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-700">Sin Stock</span>
                      ) : product.stock < product.minStock ? (
                        <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700">Stock Bajo</span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">Normal</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-bold">
                <tr>
                  <td colSpan={3}>TOTALES</td>
                  <td className="p-3 text-right">{products.reduce((a, p) => a + p.stock, 0)}</td>
                  <td colSpan={3}></td>
                  <td className="p-3 text-right text-green-600">
                    ${products.reduce((a, p) => a + (p.stock * p.costPrice), 0).toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {products.length > pageSize && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <button
                onClick={() => setInvPage(p => Math.max(1, p - 1))}
                disabled={invPage === 1}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="px-3 py-1 text-sm">
                Página {invPage} de {Math.ceil(products.length / pageSize)}
              </span>
              <button
                onClick={() => setInvPage(p => Math.min(Math.ceil(products.length / pageSize), p + 1))}
                disabled={invPage >= Math.ceil(products.length / pageSize)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}

      {activeReport === "profits" && (
        <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">Análisis de Ganancias</h2>
            <button
              onClick={() => {
                const topProductsList = Object.values(topProducts)
                  .sort((a, b) => b.profit - a.profit)
                  .map((p, i) => ({ '#': i + 1, ...p, profit: p.profit.toFixed(2), revenue: p.revenue.toFixed(2) }));
                exportToCSV(
                  topProductsList,
                  'ganancias_productos',
                  ['#', 'Producto', 'Cantidad Vendida', 'Ingresos', 'Ganancia']
                );
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
            >
              <Download size={18} />
              Exportar CSV
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-5 rounded-xl">
              <p className="text-green-100 text-sm">Ingresos Totales</p>
              <p className="text-3xl font-bold">${totalSalesAmount.toFixed(2)}</p>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-5 rounded-xl">
              <p className="text-red-100 text-sm">Costo Total</p>
              <p className="text-3xl font-bold">${totalCost.toFixed(2)}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5 rounded-xl">
              <p className="text-blue-100 text-sm">Ganancia Neta</p>
              <p className="text-3xl font-bold">${totalProfits.toFixed(2)}</p>
              <p className="text-sm text-blue-200">
                Margen: {totalSalesAmount > 0 ? ((totalProfits / totalSalesAmount) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>

          <h3 className="font-bold text-lg mt-6">Productos más Rentables</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left">
                  <th className="p-3 font-medium">#</th>
                  <th className="p-3 font-medium">Producto</th>
                  <th className="p-3 font-medium text-right">Cantidad Vendida</th>
                  <th className="p-3 font-medium text-right">Ingresos</th>
                  <th className="p-3 font-medium text-right">Ganancia</th>
                  <th className="p-3 font-medium text-right">% del Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(topProducts)
                  .sort((a, b) => b.profit - a.profit)
                  .slice(0, 20)
                  .map((product, i) => (
                    <tr key={product.name} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-medium">{i + 1}</td>
                      <td className="p-3">{product.name}</td>
                      <td className="p-3 text-right font-bold">{product.quantity}</td>
                      <td className="p-3 text-right">${product.revenue.toFixed(2)}</td>
                      <td className="p-3 text-right text-green-600 font-bold">${product.profit.toFixed(2)}</td>
                      <td className="p-3 text-right text-gray-500">
                        {totalProfits > 0 ? ((product.profit / totalProfits) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  ))}
                {Object.keys(topProducts).length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                      No hay datos de ventas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReport === "clients" && (
        <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">Top Clientes</h2>
            <button
              onClick={() => exportToCSV(
                topClients.map((c, i) => ({
                  '#': i + 1,
                  Nombre: c.name,
                  'Total Compras': c.totalPurchases,
                  'Total Gastado': c.totalSpent.toFixed(2)
                })),
                'top_clientes',
                ['#', 'Nombre', 'Total Compras', 'Total Gastado']
              )}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
            >
              <Download size={18} />
              Exportar CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left">
                  <th className="p-3 font-medium">#</th>
                  <th className="p-3 font-medium">Cliente</th>
                  <th className="p-3 font-medium text-right">Compras Realizadas</th>
                  <th className="p-3 font-medium text-right">Total Gastado</th>
                  <th className="p-3 font-medium text-right">Ticket Promedio</th>
                  <th className="p-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {topClients.map((client, i) => (
                  <tr key={client._id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-bold">{i + 1}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-400' : 'bg-blue-500'
                        }`}>
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{client.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-bold">{client.totalPurchases}</td>
                    <td className="p-3 text-right text-green-600 font-bold">${client.totalSpent.toFixed(2)}</td>
                    <td className="p-3 text-right">
                      ${client.totalPurchases > 0 ? (client.totalSpent / client.totalPurchases).toFixed(2) : '0.00'}
                    </td>
                    <td className="p-3">
                      {i === 0 && <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700">🥇 Top</span>}
                      {i === 1 && <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">🥈 2do</span>}
                      {i === 2 && <span className="px-2 py-1 rounded text-xs bg-orange-100 text-orange-700">🥉 3ro</span>}
                      {i > 2 && <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">Cliente</span>}
                    </td>
                  </tr>
                ))}
                {topClients.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                      No hay datos de clientes con compras
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
