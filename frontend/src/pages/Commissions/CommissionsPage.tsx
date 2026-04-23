import { useEffect, useState } from "react";
import { commissionService, authService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { DollarSign, TrendingUp, Users, Target, Award } from "lucide-react";

interface CommissionData {
  _id: string;
  user: { _id: string; name: string; email: string; role: string };
  monthlyTarget: number;
  commissionPercent: number;
  stats: {
    salesCount: number;
    totalSales: number;
    totalCost: number;
    profit: number;
    percentTarget: number;
    commission: number;
  };
}

const CommissionsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "supervisor";
  const [commissions, setCommissions] = useState<CommissionData[]>([]);
  const [myStats, setMyStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ monthlyTarget: 0, commissionPercent: 0 });

  useEffect(() => {
    fetchData();
    if (isAdmin) {
      fetchUsers();
    }
  }, []);

  const fetchData = async () => {
    try {
      const res = await commissionService.getMyStats();
      setMyStats(res.data.stats);
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await authService.getUsers();
      const filtered = res.data.filter((u: any) => u.role === "vendedor");
      setUsers(filtered.map((u: any) => ({ ...u, id: u._id })));
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchCommissions();
    }
  }, []);

  const fetchCommissions = async () => {
    try {
      const res = await commissionService.getAll();
      setCommissions(res.data);
    } catch (err) {
      console.error("Error fetching commissions:", err);
    }
  };

  const handleSave = async (userId: string) => {
    try {
      await commissionService.upsert({
        userId,
        monthlyTarget: editForm.monthlyTarget,
        commissionPercent: editForm.commissionPercent,
      });
      setEditingId(null);
      fetchCommissions();
    } catch (err) {
      alert("Error al guardar configuración");
    }
  };

  const startEdit = (c: CommissionData) => {
    setEditingId(c.user._id);
    setEditForm({
      monthlyTarget: c.monthlyTarget || 0,
      commissionPercent: c.commissionPercent || 0,
    });
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 100) return "bg-green-500";
    if (percent >= 75) return "bg-blue-500";
    if (percent >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Award className="text-purple-600" size={28} />
          Comisiones
        </h1>
      </div>

      {/* Mi Dashboard - visible para todos */}
      {myStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">Ventas del Mes</span>
              <TrendingUp size={20} className="text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">${myStats.totalSales.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">Ganancia del Mes</span>
              <DollarSign size={20} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">${myStats.profit.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">Meta</span>
              <Target size={20} className="text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">
              ${myStats.commission?.monthlyTarget || 0}
            </p>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getProgressColor(myStats.percentTarget)}`}
                  style={{ width: `${Math.min(myStats.percentTarget, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{myStats.percentTarget.toFixed(0)}% completado</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">Mi Comisión</span>
              <Award size={20} className="text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-yellow-600">
              ${(myStats.commission?.commission || 0).toFixed(2)}
            </p>
            <p className="text-xs text-gray-400">
              ({myStats.commission?.commissionPercent || 0}% de ganancia)
            </p>
          </div>
        </div>
      )}

      {/* Admin: Configurar vendedores */}
      {isAdmin && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users size={20} />
            Configurar Comisiones por Vendedor
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-gray-600 text-sm">Vendedor</th>
                  <th className="text-left py-3 px-4 text-gray-600 text-sm">Meta ($)</th>
                  <th className="text-left py-3 px-4 text-gray-600 text-sm">% Comisión</th>
                  <th className="text-left py-3 px-4 text-gray-600 text-sm">Ganancia</th>
                  <th className="text-left py-3 px-4 text-gray-600 text-sm">% Meta</th>
                  <th className="text-left py-3 px-4 text-gray-600 text-sm">Comisión</th>
                  <th className="text-left py-3 px-4 text-gray-600 text-sm">Acción</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((c) => (
                  <tr key={c._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-medium">{c.user?.name}</span>
                    </td>
                    <td className="py-3 px-4">
                      {editingId === c.user._id ? (
                        <input
                          type="number"
                          value={editForm.monthlyTarget}
                          onChange={(e) => setEditForm(prev => ({ ...prev, monthlyTarget: Number(e.target.value) }))}
                          className="border rounded px-2 py-1 w-24"
                        />
                      ) : (
                        <span>${c.monthlyTarget}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingId === c.user._id ? (
                        <input
                          type="number"
                          value={editForm.commissionPercent}
                          onChange={(e) => setEditForm(prev => ({ ...prev, commissionPercent: Number(e.target.value) }))}
                          className="border rounded px-2 py-1 w-20"
                        />
                      ) : (
                        <span>{c.commissionPercent}%</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-green-600">
                      ${c.stats?.profit.toFixed(2) || "$0.00"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-24">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(c.stats?.percentTarget || 0)}`}
                            style={{ width: `${Math.min(c.stats?.percentTarget || 0, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{(c.stats?.percentTarget || 0).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-yellow-600">
                      ${(c.stats?.commission || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      {editingId === c.user._id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSave(c.user._id)}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(c)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          Configurar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {commissions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      No hay vendedores configurados
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

export default CommissionsPage;