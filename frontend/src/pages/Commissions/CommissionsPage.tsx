import { useEffect, useState } from "react";
import { commissionService, authService, saleService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { DollarSign, TrendingUp, Users, Target, Award, X, Calendar, Trophy, TrendingDown, ShoppingCart } from "lucide-react";

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

const getMonthInfo = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const mesNombre = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][month];
  return {
    mes: mesNombre,
    anio: year,
    inicio: firstDay.toLocaleDateString('es-PY'),
    fin: lastDay.toLocaleDateString('es-PY'),
  };
};

const CommissionsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "supervisor";
  const [commissions, setCommissions] = useState<CommissionData[]>([]);
  const [myStats, setMyStats] = useState<any>(null);
  const [myCommission, setMyCommission] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ monthlyTarget: 0, commissionPercent: 0 });
  const [showHistory, setShowHistory] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any>(null);
  const [mySales, setMySales] = useState<any[]>([]);
  const monthInfo = getMonthInfo();

  useEffect(() => {
    fetchData();
    if (isAdmin) {
      fetchUsers();
    }
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, salesRes] = await Promise.all([
        commissionService.getMyStats(),
        !isAdmin ? saleService.getMySales() : Promise.resolve({ data: { recentSales: [] } }),
      ]);
      setMyStats(statsRes.data.stats);
      setMyCommission(statsRes.data.commission);
      console.log("Sales response:", salesRes.data);
      if (!isAdmin) {
        setMySales(salesRes.data.recentSales || []);
      }
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

  const handleViewHistory = async (userId: string, userName: string) => {
    try {
      const res = await commissionService.getHistory(userId, 6);
      setSelectedUser({ _id: userId, name: userName });
      setHistoryData(res.data);
      setShowHistory(true);
    } catch (err) {
      alert("Error al cargar historial");
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

      {/* Dashboard Admin: Stats Globales */}
      {isAdmin && myStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">Ventas del Mes (Global)</span>
              <TrendingUp size={20} className="text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">${myStats.totalSales.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">Ganancia del Mes (Global)</span>
              <DollarSign size={20} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">${myStats.profit.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Dashboard Vendedor: Stats Personales */}
      {!isAdmin && myStats && (
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
              <span className="text-gray-500 text-sm">Meta de {monthInfo.mes}</span>
              <Target size={20} className="text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">
              ${myCommission?.monthlyTarget || 0}
            </p>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
              <Calendar size={12} />
              Hasta: {monthInfo.fin}
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
              ${(myStats?.commission || 0).toFixed(2)}
            </p>
            <p className="text-xs text-gray-400">
              ({myCommission?.commissionPercent || 0}% de ganancia)
            </p>
          </div>
        </div>
      )}

      {/* Admin: Configurar vendedores */}
      {isAdmin && (
        <>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users size={20} />
              Configurar Comisiones por Vendedor
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 text-gray-600 text-sm font-semibold">Vendedor</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm font-semibold">Meta ($/mes)</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm font-semibold">% Comisión</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm font-semibold">Ganancia Mes</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm font-semibold">% Meta</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm font-semibold">Comisión</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm font-semibold">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((u) => {
                      const existing = commissions.find(c => c.user?._id === u._id);
                      const isEditing = editingId === u._id;
                      
                      return (
                        <tr key={u._id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <span className="font-medium">{u.name}</span>
                          </td>
                          <td className="py-3 px-4">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editForm.monthlyTarget}
                                onChange={(e) => setEditForm(prev => ({ ...prev, monthlyTarget: Number(e.target.value) }))}
                                className="border rounded px-2 py-1 w-24"
                                placeholder="0"
                              />
                            ) : (
                              <span>${existing?.monthlyTarget || 0}</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editForm.commissionPercent}
                                onChange={(e) => setEditForm(prev => ({ ...prev, commissionPercent: Number(e.target.value) }))}
                                className="border rounded px-2 py-1 w-20"
                                placeholder="0"
                              />
                            ) : (
                              <span>{existing?.commissionPercent || 0}%</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-semibold text-green-600">
                            ${existing?.stats?.profit.toFixed(2) || "0.00"}
                          </td>
                          <td className="py-3 px-4">
                            <div className="w-24">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${getProgressColor(existing?.stats?.percentTarget || 0)}`}
                                  style={{ width: `${Math.min(existing?.stats?.percentTarget || 0, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500">{(existing?.stats?.percentTarget || 0).toFixed(0)}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-bold text-yellow-600">
                            ${(existing?.stats?.commission || 0).toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            {isEditing ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSave(u._id)}
                                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                >
                                  Guardar
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditingId(u._id);
                                    setEditForm({
                                      monthlyTarget: existing?.monthlyTarget || 200,
                                      commissionPercent: existing?.commissionPercent || 10,
                                    });
                                  }}
                                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                >
                                  Configurar
                                </button>
                                <button
                                  onClick={() => handleViewHistory(u._id, u.name)}
                                  className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                                >
                                  Historial
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-400">
                        No hay vendedores registrados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Historial Modal */}
          {showHistory && selectedUser && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-purple-700 p-4 text-white flex justify-between items-center">
                  <h3 className="text-lg font-bold">Historial - {selectedUser.name}</h3>
                  <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-white/20 rounded">
                    <X size={20} />
                  </button>
                </div>
                <div className="p-4 overflow-y-auto max-h-[60vh]">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-2 px-3 text-gray-600 text-sm">Mes</th>
                          <th className="text-left py-2 px-3 text-gray-600 text-sm">Ventas</th>
                          <th className="text-left py-2 px-3 text-gray-600 text-sm">Ganancia</th>
                          <th className="text-left py-2 px-3 text-gray-600 text-sm">% Meta</th>
                          <th className="text-left py-2 px-3 text-gray-600 text-sm">Comisión</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyData?.history?.map((h: any, idx: number) => (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-3 font-medium">{h.monthName} {h.year}</td>
                            <td className="py-2 px-3">{h.salesCount}</td>
                            <td className="py-2 px-3 font-semibold text-green-600">${h.profit.toFixed(2)}</td>
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${getProgressColor(h.percentTarget)}`}
                                    style={{ width: `${Math.min(h.percentTarget, 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs">{h.percentTarget.toFixed(0)}%</span>
                              </div>
                            </td>
                            <td className="py-2 px-3 font-bold text-yellow-600">${h.commission.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
</div>
      )}

      {/* Ranking de Vendedores (Admin) */}
          {isAdmin && commissions.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Trophy size={20} className="text-yellow-600" />
                Ranking de Vendedores - {monthInfo.mes}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-center py-3 px-4 text-gray-600 text-sm font-semibold">#</th>
                      <th className="text-left py-3 px-4 text-gray-600 text-sm font-semibold">Vendedor</th>
                      <th className="text-right py-3 px-4 text-gray-600 text-sm font-semibold">Ventas</th>
                      <th className="text-right py-3 px-4 text-gray-600 text-sm font-semibold">Ganancia</th>
                      <th className="text-right py-3 px-4 text-gray-600 text-sm font-semibold">Meta</th>
                      <th className="text-center py-3 px-4 text-gray-600 text-sm font-semibold">% Meta</th>
                      <th className="text-right py-3 px-4 text-gray-600 text-sm font-semibold">Comisión</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions
                      .sort((a, b) => (b.stats?.profit || 0) - (a.stats?.profit || 0))
                      .slice(0, 5)
                      .map((c, index) => (
                        <tr key={c._id} className="border-b hover:bg-gray-50">
                          <td className="text-center py-3 px-4">
                            {index === 0 ? <Trophy size={18} className="text-yellow-500 mx-auto" /> : 
                             index === 1 ? <Trophy size={18} className="text-gray-400 mx-auto" /> :
                             index === 2 ? <Trophy size={18} className="text-amber-700 mx-auto" /> :
                             <span className="text-gray-500 font-medium">{index + 1}</span>}
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-800">{c.user?.name || c.user?.email}</td>
                          <td className="text-right py-3 px-4">${c.stats?.totalSales?.toFixed(2) || '0.00'}</td>
                          <td className="text-right py-3 px-4 text-green-600">${c.stats?.profit?.toFixed(2) || '0.00'}</td>
                          <td className="text-right py-3 px-4">${c.monthlyTarget}</td>
                          <td className="text-center py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              (c.stats?.percentTarget || 0) >= 100 ? 'bg-green-100 text-green-700' :
                              (c.stats?.percentTarget || 0) >= 50 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {(c.stats?.percentTarget || 0).toFixed(0)}%
                            </span>
                          </td>
                          <td className="text-right py-3 px-4 font-bold text-yellow-600">${c.stats?.commission?.toFixed(2) || '0.00'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Mis Ventas del Mes */}
          {!isAdmin && mySales.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <ShoppingCart size={20} className="text-blue-600" />
                Mis Ventas de {monthInfo.mes} {monthInfo.anio}
              </h3>
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Meta mensual</p>
                    <p className="text-xl font-bold text-purple-600">${myCommission?.monthlyTarget || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Vendido</p>
                    <p className="text-xl font-bold text-green-600">${myStats?.totalSales?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Faltante</p>
                    <p className="text-xl font-bold text-red-500">${Math.max(0, (myCommission?.monthlyTarget || 0) - (myStats?.totalSales || 0)).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">% Logrado</p>
                    <p className="text-xl font-bold text-blue-600">{myStats?.percentTarget?.toFixed(0) || 0}%</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getProgressColor(myStats?.percentTarget || 0)}`}
                      style={{ width: `${Math.min(myStats?.percentTarget || 0, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-2 px-3 text-gray-600 text-sm font-semibold">Fecha</th>
                      <th className="text-left py-2 px-3 text-gray-600 text-sm font-semibold">Cliente</th>
                      <th className="text-right py-2 px-3 text-gray-600 text-sm font-semibold">Total</th>
                      <th className="text-center py-2 px-3 text-gray-600 text-sm font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mySales.slice(0, 20).map((sale: any) => (
                      <tr key={sale._id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3 text-sm">{new Date(sale.createdAt).toLocaleDateString('es-PY')}</td>
                        <td className="py-2 px-3 text-sm font-medium">{sale.clientName || '-'}</td>
                        <td className="py-2 px-3 text-sm text-right">${sale.total?.toFixed(2)}</td>
                        <td className="py-2 px-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            sale.status === 'completed' ? 'bg-green-100 text-green-700' :
                            sale.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {sale.status === 'completed' ? 'Completado' : sale.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {mySales.length > 20 && (
                  <p className="text-sm text-gray-500 mt-2 text-center">+ {mySales.length - 20} ventas más</p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CommissionsPage;