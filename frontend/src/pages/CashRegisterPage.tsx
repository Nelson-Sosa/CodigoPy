import { useEffect, useState } from "react";
import { cashRegisterService, saleService } from "../services/api";
import { DollarSign, Lock, Unlock, ShoppingCart, CreditCard, Banknote, ArrowRightLeft, History, X, Eye, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { useExchangeRate } from "../hooks/useExchangeRate";
import CurrencyDisplay from "../components/common/CurrencyDisplay";

interface SaleItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Sale {
  _id: string;
  invoiceNumber: string;
  clientName: string;
  items: SaleItem[];
  total: number;
  profit: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

interface CashRegister {
  _id?: string;
  status: string;
  openingAmount: number;
  closingAmount?: number;
  expectedAmount?: number;
  cashSales: number;
  cardSales: number;
  transferSales: number;
  creditSales: number;
  totalSales: number;
  totalCash: number;
  salesCount: number;
  openedAt?: string;
  closedAt?: string;
  reopenedAt?: string;
  date?: string;
  user?: { name: string };
}

interface Summary {
  todayStatus: string;
  todayRegister?: CashRegister;
  monthTotal: number;
  monthCash: number;
  monthCard: number;
  monthTransfer: number;
  monthCredit: number;
  monthSalesCount: number;
}

interface HistoryItem {
  _id: string;
  date: string;
  user: { name: string };
  openingAmount: number;
  closingAmount: number;
  expectedAmount: number;
  cashSales: number;
  cardSales: number;
  transferSales: number;
  creditSales: number;
  totalSales: number;
  status: string;
  openedAt: string;
  closedAt: string;
  salesCount: number;
}

const CashRegisterPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [todaySales, setTodaySales] = useState<Sale[]>([]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showPreCloseModal, setShowPreCloseModal] = useState(false);
  const [preCloseClosingAmount, setPreCloseClosingAmount] = useState(0);
  const [preCloseNotes, setPreCloseNotes] = useState("");
  const [openingAmount, setOpeningAmount] = useState(0);
  const [reopenAmount, setReopenAmount] = useState(0);

  const { gsRate, arsRate } = useExchangeRate();

  const isOpen = summary?.todayStatus === 'open';
  const isClosedYesterday = summary?.todayStatus === 'closed';
  const shouldShowOpenCaja = !isOpen && !isClosedYesterday;
  const register = summary?.todayRegister;

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote size={18} />;
      case 'card': return <CreditCard size={18} />;
      case 'transfer': return <ArrowRightLeft size={18} />;
      case 'credit': return <ShoppingCart size={18} />;
      default: return <DollarSign size={18} />;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const localDate = new Date(new Date().getTime() - 4 * 60 * 60 * 1000);
      const todayStart = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate());
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate());
      todayEnd.setHours(23, 59, 59, 999);

      const [summaryRes, historyRes, salesRes] = await Promise.all([
        cashRegisterService.getSummary(),
        cashRegisterService.getHistory({ page: 1, limit: 10 }),
        saleService.getAll(),
      ]);
      
      setSummary(summaryRes.data);
      setHistory(historyRes.data.history || []);
      
      const filteredSales = (salesRes.data.sales || salesRes.data || []).filter((s: Sale) => {
        const saleDate = new Date(s.createdAt);
        return saleDate >= todayStart && saleDate <= todayEnd && s.status !== 'cancelled';
      });
      setTodaySales(filteredSales);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.message || "Error al cargar los datos. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = async () => {
    if (confirm("¿Abrir caja con $ " + openingAmount + "?")) {
      setActionLoading(true);
      try {
        await cashRegisterService.open(openingAmount);
        alert("Caja abierta exitosamente");
        fetchData();
        setOpeningAmount(0);
      } catch (err: any) {
        alert(err.response?.data?.message || "Error al abrir caja");
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleReopen = async () => {
    if (confirm("¿Reabrir caja con $ " + reopenAmount + "?")) {
      setActionLoading(true);
      try {
        await cashRegisterService.reopen(reopenAmount);
        alert("Caja reopenta exitosamente");
        fetchData();
        setReopenAmount(0);
      } catch (err: any) {
        alert(err.response?.data?.message || "Error al reabrir caja");
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handlePreClose = async () => {
    setPreCloseClosingAmount(register?.totalCash || 0);
    setPreCloseNotes("");
    setShowPreCloseModal(true);
  };

  const handlePreCloseSubmit = async () => {
    if (!summary?.todayRegister) return;
    setActionLoading(true);
    try {
      await cashRegisterService.close({
        closingAmount: preCloseClosingAmount,
        notes: preCloseNotes,
      });
      alert("Caja cerrada exitosamente");
      fetchData();
      setShowPreCloseModal(false);
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al cerrar caja");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSale = async (sale: Sale) => {
    if (!confirm(`¿Cancelar venta #${sale.invoiceNumber}?\n\nTotal: $${sale.total.toFixed(2)}\n\nEsta acción reversará el stock.`)) {
      return;
    }
    setActionLoading(true);
    try {
      await saleService.cancel(sale._id);
      alert("Venta cancelada exitosamente");
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al cancelar venta");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isOpen ? 'bg-green-100' : 'bg-gray-100'}`}>
                <DollarSign className={`${isOpen ? 'text-green-600' : 'text-gray-400'}`} size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Caja</h1>
                <p className="text-sm text-gray-500">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isOpen ? (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 font-semibold text-sm border border-green-200">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Caja Abierta
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-700 font-semibold text-sm border border-red-200">
                  <Lock size={14} />
                  Caja Cerrada
                </span>
              )}
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-200"
              >
                <History size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <X className="text-red-500" size={20} />
            </div>
            <p className="text-red-700 flex-1 font-medium">{error}</p>
            <button onClick={fetchData} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-all duration-200">
              Reintentar
            </button>
          </div>
        )}

        {showHistory ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="font-bold text-lg text-gray-900">Historial de Cajas</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100/50">
                  <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Fecha</th>
                    <th className="px-6 py-3">Usuario</th>
                    <th className="px-6 py-3 text-right">Ventas</th>
                    <th className="px-6 py-3 text-right">Efectivo</th>
                    <th className="px-6 py-3 text-right">Tarjeta</th>
                    <th className="px-6 py-3 text-right">Total</th>
                    <th className="px-6 py-3 text-right">Diferencia</th>
                    <th className="px-6 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 transition-all duration-200">
                      <td className="px-6 py-4 text-sm text-gray-900">{item.date ? format(new Date(item.date), 'dd/MM/yyyy') : '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.user?.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">{item.salesCount}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">${item.cashSales.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">${item.cardSales.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">${item.totalSales.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-right">
                        {item.closingAmount !== null ? (
                          <span className={item.closingAmount >= item.expectedAmount ? 'text-green-600' : 'text-red-600'}>
                            ${(item.closingAmount - item.expectedAmount).toFixed(2)}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          item.status === 'closed' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {item.status === 'closed' ? 'Cerrada' : 'Abierta'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-400">No hay historial de cajas</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <>
            {shouldShowOpenCaja && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6 hover:shadow-xl transition-all duration-300">
                <div className="max-w-md mx-auto text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Unlock className="text-white" size={40} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Abrir Caja</h2>
                  <p className="text-gray-500 mb-6">Ingresa el dinero inicial para comenzar el día</p>
                  <div className="relative mb-6">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-3xl">$</span>
                    <input
                      type="number"
                      min="0"
                      value={openingAmount}
                      onChange={(e) => setOpeningAmount(Number(e.target.value))}
                      className="w-full border-2 border-gray-200 rounded-2xl pl-12 pr-5 py-4 text-3xl text-center font-bold focus:border-green-500 focus:ring-0 transition-all duration-200"
                      placeholder="0.00"
                    />
                  </div>
                  <button
                    onClick={handleOpen}
                    disabled={actionLoading}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-green-500/30"
                  >
                    {actionLoading ? 'Abriendo...' : 'Abrir Caja'}
                  </button>
                </div>
              </div>
            )}

            {isClosedYesterday && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6 hover:shadow-xl transition-all duration-300">
                <div className="max-w-md mx-auto text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Unlock className="text-white" size={40} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Reabrir Caja</h2>
                  <p className="text-gray-500 mb-6">La caja anterior fue cerrada. Ingresa el dinero inicial para continuar</p>
                  <div className="relative mb-6">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-3xl">$</span>
                    <input
                      type="number"
                      min="0"
                      value={reopenAmount}
                      onChange={(e) => setReopenAmount(Number(e.target.value))}
                      className="w-full border-2 border-gray-200 rounded-2xl pl-12 pr-5 py-4 text-3xl text-center font-bold focus:border-green-500 focus:ring-0 transition-all duration-200"
                      placeholder="0.00"
                    />
                  </div>
                  <button
                    onClick={handleReopen}
                    disabled={actionLoading}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-green-500/30"
                  >
                    {actionLoading ? 'Reabriendo...' : 'Reabrir Caja'}
                  </button>
                </div>
              </div>
            )}

            {isOpen && register && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
                          <DollarSign className="text-blue-600" size={22} />
                        </div>
                        <span className="text-sm text-gray-500 font-medium">Caja Inicial</span>
                      </div>
                      <CurrencyDisplay amount={register.openingAmount} currency="USD" size="md" />
                      <CurrencyDisplay amount={register.openingAmount * gsRate} currency="PYG" size="sm" />
                      <CurrencyDisplay amount={register.openingAmount * arsRate} currency="ARS" size="sm" />
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">
                          <Banknote className="text-green-600" size={22} />
                        </div>
                        <span className="text-sm text-gray-500 font-medium">Efectivo</span>
                      </div>
                      <CurrencyDisplay amount={register.cashSales} currency="USD" size="md" />
                      <CurrencyDisplay amount={register.cashSales * gsRate} currency="PYG" size="sm" />
                      <CurrencyDisplay amount={register.cashSales * arsRate} currency="ARS" size="sm" />
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center">
                          <CreditCard className="text-purple-600" size={22} />
                        </div>
                        <span className="text-sm text-gray-500 font-medium">Otros</span>
                      </div>
                      <CurrencyDisplay amount={(register.cardSales + register.transferSales + register.creditSales)} currency="USD" size="md" />
                      <CurrencyDisplay amount={(register.cardSales + register.transferSales + register.creditSales) * gsRate} currency="PYG" size="sm" />
                      <CurrencyDisplay amount={(register.cardSales + register.transferSales + register.creditSales) * arsRate} currency="ARS" size="sm" />
                    </div>

                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg p-5 text-white">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
                          <TrendingUp className="text-white" size={22} />
                        </div>
                        <span className="text-sm text-indigo-100 font-medium">Total Ventas</span>
                      </div>
                      <CurrencyDisplay amount={register.totalSales} currency="USD" size="md" />
                      <CurrencyDisplay amount={register.totalSales * gsRate} currency="PYG" size="sm" showFlag={false} />
                      <CurrencyDisplay amount={register.totalSales * arsRate} currency="ARS" size="sm" showFlag={false} />
                      <p className="text-xs text-indigo-200 mt-2">{register.salesCount} ventas</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">Ventas del Día</h3>
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">{todaySales.length} ventas</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50/50">
                          <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <th className="px-6 py-3">Factura</th>
                            <th className="px-6 py-3">Hora</th>
                            <th className="px-6 py-3">Cliente</th>
                            <th className="px-6 py-3">Pago</th>
                            <th className="px-6 py-3 text-right">Total</th>
                            <th className="px-6 py-3 text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {todaySales.map((sale) => (
                            <tr key={sale._id} className="hover:bg-gray-50 transition-all duration-200">
                              <td className="px-6 py-4 text-sm font-mono text-gray-900">{sale.invoiceNumber}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{format(new Date(sale.createdAt), 'HH:mm')}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{sale.clientName || 'Consumidor Final'}</td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
                                  {getPaymentIcon(sale.paymentMethod)}
                                  {sale.paymentMethod === 'cash' && 'Efectivo'}
                                  {sale.paymentMethod === 'card' && 'Tarjeta'}
                                  {sale.paymentMethod === 'transfer' && 'Transfer.'}
                                  {sale.paymentMethod === 'credit' && 'Credito'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">${sale.total.toFixed(2)}</td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => setSelectedSale(sale)}
                                    className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-200"
                                  >
                                    <Eye size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleCancelSale(sale)}
                                    className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {todaySales.length === 0 && (
                            <tr>
                              <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No hay ventas registradas</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-blue-100 font-medium">Dinero Esperado</span>
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                        <DollarSign size={24} />
                      </div>
                    </div>
                    <p className="text-4xl font-bold mb-1">${register.totalCash.toFixed(2)}</p>
                    <CurrencyDisplay amount={register.totalCash * gsRate} currency="PYG" size="sm" showFlag={false} />
                    <CurrencyDisplay amount={register.totalCash * arsRate} currency="ARS" size="sm" showFlag={false} />
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Contar Dinero</h3>
                    <div className="relative mb-4">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-2xl">$</span>
                      <input
                        type="number"
                        min="0"
                        value={preCloseClosingAmount || ''}
                        onChange={(e) => setPreCloseClosingAmount(Number(e.target.value))}
                        className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-4 text-2xl text-center font-bold focus:border-blue-500 transition-all duration-200"
                        placeholder="0.00"
                      />
                    </div>
                    {preCloseClosingAmount > 0 && (
                      <div className={`p-4 rounded-xl mb-4 text-center ${preCloseClosingAmount === register.totalCash ? 'bg-green-50 border-2 border-green-200' : preCloseClosingAmount > register.totalCash ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-red-50 border-2 border-red-200'}`}>
                        <p className={`text-lg font-bold ${preCloseClosingAmount === register.totalCash ? 'text-green-700' : preCloseClosingAmount > register.totalCash ? 'text-yellow-700' : 'text-red-700'}`}>
                          {preCloseClosingAmount === register.totalCash ? '¡Cuadrado!' : preCloseClosingAmount > register.totalCash ? 'Sobrante' : 'Faltante'}
                        </p>
                        <p className={`text-2xl font-bold ${preCloseClosingAmount === register.totalCash ? 'text-green-600' : preCloseClosingAmount > register.totalCash ? 'text-yellow-600' : 'text-red-600'}`}>
                          ${Math.abs(preCloseClosingAmount - register.totalCash).toFixed(2)}
                        </p>
                      </div>
                    )}
                    <button
                      onClick={handlePreClose}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-red-500/30"
                    >
                      Cerrar Caja
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Por Método de Pago</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                            <Banknote className="text-green-600" size={18} />
                          </div>
                          <span className="text-sm font-medium text-gray-700">Efectivo</span>
                        </div>
                        <span className="font-bold text-green-600">${register.cashSales.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                            <CreditCard className="text-blue-600" size={18} />
                          </div>
                          <span className="text-sm font-medium text-gray-700">Tarjeta</span>
                        </div>
                        <span className="font-bold text-blue-600">${register.cardSales.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
                            <ArrowRightLeft className="text-purple-600" size={18} />
                          </div>
                          <span className="text-sm font-medium text-gray-700">Transferencia</span>
                        </div>
                        <span className="font-bold text-purple-600">${register.transferSales.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-100">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
                            <ShoppingCart className="text-orange-600" size={18} />
                          </div>
                          <span className="text-sm font-medium text-gray-700">Credito</span>
                        </div>
                        <span className="font-bold text-orange-600">${register.creditSales.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Resumen del Mes</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Total ventas:</span>
                        <span className="font-bold text-gray-900">${(summary?.monthTotal || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Efectivo:</span>
                        <span className="font-bold text-green-600">${(summary?.monthCash || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Ventas:</span>
                        <span className="font-bold text-gray-900">{summary?.monthSalesCount || 0}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-2 font-medium">Distribucion (Mes)</p>
                      <div className="space-y-2">
                        {[
                          { label: 'Efectivo', percent: summary?.monthTotal ? Math.round((summary.monthCash / summary.monthTotal) * 100) : 0, color: 'bg-green-500' },
                          { label: 'Tarjeta', percent: summary?.monthTotal ? Math.round((summary.monthCard / summary.monthTotal) * 100) : 0, color: 'bg-blue-500' },
                          { label: 'Transfer', percent: summary?.monthTotal ? Math.round((summary.monthTransfer / summary.monthTotal) * 100) : 0, color: 'bg-purple-500' },
                          { label: 'Credito', percent: summary?.monthTotal ? Math.round((summary.monthCredit / summary.monthTotal) * 100) : 0, color: 'bg-orange-500' },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center gap-3">
                            <div className="w-16 text-xs text-gray-600">{item.label}:</div>
                            <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                              <div className={`${item.color} h-full rounded-full transition-all duration-500`} style={{ width: `${item.percent}%` }} />
                            </div>
                            <div className="w-10 text-xs font-semibold text-gray-700 text-right">{item.percent}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {selectedSale && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900">Detalle de Venta</h3>
              <button onClick={() => setSelectedSale(null)} className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Factura:</span>
                <span className="font-mono font-bold">{selectedSale.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Hora:</span>
                <span>{format(new Date(selectedSale.createdAt), 'HH:mm')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cliente:</span>
                <span>{selectedSale.clientName || 'Consumidor Final'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pago:</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
                  {getPaymentIcon(selectedSale.paymentMethod)}
                  {selectedSale.paymentMethod === 'cash' && 'Efectivo'}
                  {selectedSale.paymentMethod === 'card' && 'Tarjeta'}
                  {selectedSale.paymentMethod === 'transfer' && 'Transferencia'}
                  {selectedSale.paymentMethod === 'credit' && 'Credito'}
                </span>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-2">Productos:</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedSale.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.quantity}x {item.productName}</span>
                      <span className="font-medium">${item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t pt-4 flex justify-between items-center">
                <span className="font-bold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-green-600">${selectedSale.total.toFixed(2)}</span>
              </div>
              {selectedSale.profit > 0 && (
                <div className="bg-green-50 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-sm text-green-700">Ganancia:</span>
                  <span className="text-lg font-bold text-green-600">+${selectedSale.profit.toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex gap-3">
              <button
                onClick={() => setSelectedSale(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
              >
                Cerrar
              </button>
              <button
                onClick={() => { handleCancelSale(selectedSale); setSelectedSale(null); }}
                className="flex-1 bg-red-100 text-red-600 py-3 rounded-xl font-medium hover:bg-red-200 transition-all duration-200"
              >
                Cancelar Venta
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreCloseModal && register && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-2xl">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Eye size={22} />
                Confirmar Cierre de Caja
              </h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-5 gap-3">
                <div className="text-center p-3 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-xs text-gray-500 mb-1">Efectivo</p>
                  <p className="font-bold text-green-600">${register.cashSales.toFixed(2)}</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-xs text-gray-500 mb-1">Tarjeta</p>
                  <p className="font-bold text-blue-600">${register.cardSales.toFixed(2)}</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <p className="text-xs text-gray-500 mb-1">Transfer</p>
                  <p className="font-bold text-purple-600">${register.transferSales.toFixed(2)}</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-xl border border-orange-100">
                  <p className="text-xs text-gray-500 mb-1">Credito</p>
                  <p className="font-bold text-orange-600">${register.creditSales.toFixed(2)}</p>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl">
                  <p className="text-xs text-green-100 mb-1">Total</p>
                  <p className="font-bold">${register.totalSales.toFixed(2)}</p>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-700">Inicial:</span>
                  <span className="font-bold">${register.openingAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-700">+ Ventas Efectivo:</span>
                  <span className="font-bold">${register.cashSales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                  <span className="text-blue-800 font-bold">Esperado:</span>
                  <span className="font-bold text-green-600 text-lg">${register.totalCash.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dinero REAL en caja
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-2xl">$</span>
                  <input
                    type="number"
                    min="0"
                    value={preCloseClosingAmount || ''}
                    onChange={(e) => setPreCloseClosingAmount(Number(e.target.value))}
                    className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-4 text-2xl text-center font-bold focus:border-blue-500 transition-all duration-200"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <textarea
                value={preCloseNotes}
                onChange={(e) => setPreCloseNotes(e.target.value)}
                rows={2}
                placeholder="Notas del cierre (opcional)"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:border-blue-500 focus:ring-0 transition-all duration-200"
              />
            </div>

            <div className="px-6 py-4 border-t bg-gray-50 rounded-b-2xl flex gap-3">
              <button
                onClick={() => setShowPreCloseModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
              >
                Volver
              </button>
              <button
                onClick={handlePreCloseSubmit}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all duration-200"
              >
                Confirmar Cierre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashRegisterPage;
