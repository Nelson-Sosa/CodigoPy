import { useEffect, useState } from "react";
import { saleService } from "../services/api";
import { TrendingUp, DollarSign, Package, ShoppingCart, Calendar } from "lucide-react";
import { format } from "date-fns";
import CurrencyDisplay from "../components/common/CurrencyDisplay";

interface SalesStats {
  today: { count: number; total: number; profit: number; products: number };
  month: { count: number; total: number; profit: number; products: number };
  all: { count: number; total: number; profit: number; products: number };
  recentSales: any[];
}

const MySalesPage = () => {
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await saleService.getMySales();
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const StatCard = ({ title, value, subValue, icon: Icon, color }: any) => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      {subValue && <p className="text-sm text-gray-500">{subValue}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mis Ventas</h1>
          <p className="text-gray-500">Seguimiento de tu desempeño</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-green-100 font-medium">Hoy</span>
              <Calendar size={20} className="text-green-100" />
            </div>
            <CurrencyDisplay amount={stats?.today.total || 0} currency="USD" size="md" darkMode />
            <div className="mt-2 flex items-center gap-4 text-green-100 text-sm">
              <span>{stats?.today.count || 0} ventas</span>
              <span>{stats?.today.products || 0} productos</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-blue-100 font-medium">Este Mes</span>
              <TrendingUp size={20} className="text-blue-100" />
            </div>
            <CurrencyDisplay amount={stats?.month.total || 0} currency="USD" size="md" darkMode />
            <div className="mt-2 flex items-center gap-4 text-blue-100 text-sm">
              <span>{stats?.month.count || 0} ventas</span>
              <span>{stats?.month.products || 0} productos</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-purple-100 font-medium">Ganancia del Mes</span>
              <DollarSign size={20} className="text-purple-100" />
            </div>
            <CurrencyDisplay amount={stats?.month.profit || 0} currency="USD" size="md" darkMode />
            <div className="mt-2 flex items-center gap-4 text-purple-100 text-sm">
              <span>Total ganado</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Historial Reciente</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase">
                  <th className="px-6 py-3">Factura</th>
                  <th className="px-6 py-3">Fecha</th>
                  <th className="px-6 py-3">Cliente</th>
                  <th className="px-6 py-3 text-right">Total</th>
                  <th className="px-6 py-3 text-right">Ganancia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats?.recentSales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-gray-900">{sale.invoiceNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {format(new Date(sale.createdAt), "dd/MM/yyyy HH:mm")}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{sale.clientName || "Consumidor Final"}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">${sale.total.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm font-bold text-green-600 text-right">${sale.profit.toFixed(2)}</td>
                  </tr>
                ))}
                {(!stats?.recentSales || stats.recentSales.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      No hay ventas registradas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MySalesPage;
