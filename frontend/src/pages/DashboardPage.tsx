import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { productService, saleService } from "../services/api";
import ExchangeRateDisplay from "../components/common/ExchangeRateDisplay";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Package, TrendingUp, AlertTriangle, DollarSign, ShoppingCart, User } from "lucide-react";

const getPyDateKey = (): number => {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Asuncion',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(now);
  const year = parts.find(p => p.type === 'year')?.value || '2026';
  const month = parts.find(p => p.type === 'month')?.value || '01';
  const day = parts.find(p => p.type === 'day')?.value || '01';
  return Number(`${year}${month}${day}`);
};

const getMonthStartKey = (): number => {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Asuncion',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(now);
  const year = parts.find(p => p.type === 'year')?.value || '2026';
  const month = parts.find(p => p.type === 'month')?.value || '01';
  return Number(`${year}${month}01`);
};

interface Product {
  _id: string;
  id: string;
  name: string;
  sku: string;
  stock: number;
  minStock: number;
  salePrice?: number;
  costPrice?: number;
}

interface Sale {
  _id: string;
  dateKey: number;
  invoiceNumber: string;
  clientName: string;
  items: { productName: string; quantity: number; unitPrice: number; subtotal: number }[];
  subtotal: number;
  discount: number;
  total: number;
  profit: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

const DashboardPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, salesRes] = await Promise.all([
          productService.getAll().catch(() => ({ data: [] })),
          saleService.getAll().catch(() => ({ data: { sales: [] } })),
        ]);

        setProducts(productsRes.data.map((p: any) => ({ ...p, id: p._id })));
        setSales(salesRes.data.sales || []);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "Error al cargar el dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const handleStorageChange = () => {
      fetchData();
    };

    window.addEventListener('inventoryUpdate', handleStorageChange);
    window.addEventListener('saleCompleted', handleStorageChange);
    return () => {
      window.removeEventListener('inventoryUpdate', handleStorageChange);
      window.removeEventListener('saleCompleted', handleStorageChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500">
          <AlertTriangle size={48} className="mx-auto mb-4" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const todayKey = getPyDateKey();
  const monthStartKey = getMonthStartKey();

  const salesToday = sales.filter(s => s.dateKey === todayKey && s.status !== "cancelled");
  const salesMonth = sales.filter(s => s.dateKey >= monthStartKey && s.dateKey <= todayKey && s.status !== "cancelled");

  const totalSalesToday = salesToday.reduce((acc, s) => acc + s.total, 0);
  const totalSalesMonth = salesMonth.reduce((acc, s) => acc + s.total, 0);
  const totalProfitMonth = salesMonth.reduce((acc, s) => acc + (s.profit || 0), 0);

  const totalProductsToday = salesToday.reduce((acc, s) => acc + s.items.reduce((i, item) => i + item.quantity, 0), 0);
  const totalProductsMonth = salesMonth.reduce((acc, s) => acc + s.items.reduce((i, item) => i + item.quantity, 0), 0);

  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock < p.minStock);
  const outOfStockProducts = products.filter(p => p.stock === 0);
  const totalInventoryValue = products.reduce((acc, p) => {
    return acc + (p.stock || 0) * (p.costPrice || p.salePrice || 0);
  }, 0);

  const topProductsMap: Record<string, { name: string; totalSold: number; revenue: number }> = {};
  sales.filter(s => s.status !== "cancelled").forEach(sale => {
    sale.items.forEach(item => {
      const key = item.productName;
      if (!topProductsMap[key]) {
        topProductsMap[key] = { name: item.productName, totalSold: 0, revenue: 0 };
      }
      topProductsMap[key].totalSold += item.quantity;
      topProductsMap[key].revenue += item.subtotal;
    });
  });
  const topProducts = Object.values(topProductsMap)
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 5);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const daySales = sales.filter(s => 
      s.createdAt.startsWith(dateStr) && s.status !== "cancelled"
    );
    const dayTotal = daySales.reduce((acc, s) => acc + s.total, 0);
    return { date: dateStr, total: dayTotal, count: daySales.length };
  }).reverse();

  const recentSales = sales.filter(s => s.status !== "cancelled").slice(0, 10);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
      {user && (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">Bienvenido, {user.name || user.email}</p>
              <p className="text-gray-500 text-sm capitalize">({user.role})</p>
            </div>
          </div>
        </div>
      )}

      <ExchangeRateDisplay />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Productos</p>
              <p className="text-3xl font-bold">{products.length}</p>
            </div>
            <Package size={40} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Stock Bajo</p>
              <p className="text-3xl font-bold">{lowStockProducts.length}</p>
            </div>
            <AlertTriangle size={40} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Sin Stock</p>
              <p className="text-3xl font-bold">{outOfStockProducts.length}</p>
            </div>
            <TrendingUp size={40} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Valor Inventario</p>
              <div className="text-xl">${totalInventoryValue.toFixed(2)}</div>
            </div>
            <DollarSign size={40} className="opacity-80" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingCart className="text-green-500" size={24} />
            <h3 className="text-gray-500 text-sm">Ventas Hoy</h3>
          </div>
          <p className="text-2xl font-bold text-gray-800">${totalSalesToday.toFixed(2)}</p>
          <p className="text-sm text-gray-400">{totalProductsToday} productos vendidos</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-blue-500" size={24} />
            <h3 className="text-gray-500 text-sm">Ventas del Mes</h3>
          </div>
          <p className="text-2xl font-bold text-gray-800">${totalSalesMonth.toFixed(2)}</p>
          <p className="text-sm text-gray-400">{totalProductsMonth} productos vendidos</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="text-purple-500" size={24} />
            <h3 className="text-gray-500 text-sm">Ganancia del Mes</h3>
          </div>
          <p className="text-2xl font-bold text-purple-600">${totalProfitMonth.toFixed(2)}</p>
          <p className="text-sm text-gray-400">Margen operativo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Top 5 Productos más Vendidos</h2>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} unidades`, 'Cantidad']} />
                <Bar dataKey="totalSold" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Package size={48} className="mx-auto mb-2 opacity-50" />
                <p>No hay datos de ventas aún</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Ventas de los Últimos 7 Días</h2>
          {last7Days.some(d => d.total > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Ventas']} />
                <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <TrendingUp size={48} className="mx-auto mb-2 opacity-50" />
                <p>No hay ventas en los últimos 7 días</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl shadow">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Últimas Ventas</h2>
        {recentSales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="text-left text-gray-500 text-xs sm:text-sm border-b">
                  <th className="pb-3">Folio</th>
                  <th className="pb-3">Cliente</th>
                  <th className="pb-3">Vendedor</th>
                  <th className="pb-3 hidden sm:table-cell">Productos</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3 hidden md:table-cell">Ganancia</th>
                  <th className="pb-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale) => (
                  <tr key={sale._id} className="border-b hover:bg-gray-50 text-xs sm:text-sm">
                    <td className="py-3 font-medium">{sale.invoiceNumber}</td>
                    <td className="py-3">{sale.clientName}</td>
                    <td className="py-3">
                      <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {sale.createdBy?.name || '-'}
                      </span>
                    </td>
                    <td className="py-3 text-gray-600 hidden sm:table-cell">
                      {sale.items.length} prod.
                    </td>
                    <td className="py-3 font-bold text-green-600">${sale.total.toFixed(2)}</td>
                    <td className="py-3 text-blue-600 hidden md:table-cell">${(sale.profit || 0).toFixed(2)}</td>
                    <td className="py-3 text-gray-500">{new Date(sale.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400">
            <ShoppingCart size={48} className="mx-auto mb-2 opacity-50" />
            <p>No hay ventas registradas</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
