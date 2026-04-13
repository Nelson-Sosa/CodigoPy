import { useEffect, useState } from "react";
import { cashRegisterService, saleService } from "../services/api";
import { DollarSign, Lock, Unlock, ShoppingCart, CreditCard, Banknote, ArrowRightLeft, History, X, Eye } from "lucide-react";
import { format } from "date-fns";
import { formatPrice } from "../utils/formatters";
import { useExchangeRate } from "../hooks/useExchangeRate";

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

const FlagIcon = ({ code }: { code: string }) => (
  <img
    src={`https://flagcdn.com/w40/${code}.png`}
    alt={code.toUpperCase()}
    className="inline-block rounded-sm shadow-sm w-6 h-auto"
    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
  />
);

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

  const { gsRate, arsRate } = useExchangeRate();

  const isOpen = summary?.todayStatus === 'open';
  const isClosedYesterday = summary?.todayStatus === 'closed';
  const shouldShowOpenCaja = !isOpen && !isClosedYesterday;
  const register = summary?.todayRegister;

  const showPrice = (amount: number, className: string = "") => (
    <span className={`inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs ${className}`}>
      <span className="inline-flex items-center gap-0.5">
        <FlagIcon code="us" />
        <span className="font-bold text-green-600 text-sm">{formatPrice(amount)} US</span>
      </span>
      <span className="text-gray-300">|</span>
      <span className="inline-flex items-center gap-0.5">
        <FlagIcon code="py" />
        <span className="text-gray-600">{(amount * gsRate).toLocaleString("es-PY")} Py</span>
      </span>
      <span className="text-gray-300">|</span>
      <span className="inline-flex items-center gap-0.5">
        <FlagIcon code="ar" />
        <span className="text-gray-600">{(amount * arsRate).toLocaleString("es-AR")} $a</span>
      </span>
    </span>
  );

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote size={16} className="text-green-500" />;
      case 'card': return <CreditCard size={16} className="text-blue-500" />;
      case 'transfer': return <ArrowRightLeft size={16} className="text-purple-500" />;
      case 'credit': return <ShoppingCart size={16} className="text-orange-500" />;
      default: return <DollarSign size={16} />;
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
      
      console.log('API Response:', summaryRes.data);
      console.log('Today Start:', todayStart.toISOString());
      console.log('Today End:', todayEnd.toISOString());
      
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
      alert("✓ Caja cerrada exitosamente");
      fetchData();
      setShowPreCloseModal(false);
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al cerrar caja");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSaleFromModal = async (sale: Sale) => {
    if (!confirm(`¿Cancelar venta #${sale.invoiceNumber}?\n\nTotal: $${sale.total.toFixed(2)}\n\nEsta acción reversará el stock.`)) {
      return;
    }
    setActionLoading(true);
    try {
      await saleService.cancel(sale._id);
      alert("Venta cancelada");
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al cancelar venta");
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
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <DollarSign className="text-blue-600" size={28} />
          Caja
        </h1>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
            showHistory ? "bg-gray-700 text-white" : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          <History size={18} />
          {showHistory ? "Ver Caja" : "Historial"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">{error}</p>
          <button
            onClick={fetchData}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {showHistory ? (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold mb-4">Historial de Cajas</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left">
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Usuario</th>
                  <th className="p-3 text-right">Ventas</th>
                  <th className="p-3 text-right">Efectivo</th>
                  <th className="p-3 text-right">Tarjeta</th>
                  <th className="p-3 text-right">Transfer.</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3 text-right">Diferencia</th>
                  <th className="p-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item._id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{item.date ? format(new Date(item.date), 'dd/MM/yyyy') : '-'}</td>
                    <td className="p-3">{item.user?.name}</td>
                    <td className="p-3 text-right">{item.salesCount}</td>
                    <td className="p-3 text-right">${item.cashSales.toFixed(2)}</td>
                    <td className="p-3 text-right">${item.cardSales.toFixed(2)}</td>
                    <td className="p-3 text-right">${item.transferSales.toFixed(2)}</td>
                    <td className="p-3 text-right font-bold">${item.totalSales.toFixed(2)}</td>
                    <td className="p-3 text-right">
                      {item.closingAmount !== null ? (
                        <span className={item.closingAmount >= item.expectedAmount ? 'text-green-600' : 'text-red-600'}>
                          ${(item.closingAmount - item.expectedAmount).toFixed(2)}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.status === 'closed' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {item.status === 'closed' ? 'Cerrada' : 'Abierta'}
                      </span>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-400">No hay historial</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl shadow-sm ${isOpen ? 'bg-green-50 border-2 border-green-500' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold flex items-center gap-2">
                  {isOpen ? (
                    <>
                      <Unlock className="text-green-500" size={20} />
                      <span className="text-green-700">Caja Abierta</span>
                    </>
                  ) : (
                    <>
                      <Lock className="text-gray-400" size={20} />
                      <span className="text-gray-600">Caja Cerrada</span>
                    </>
                  )}
                </h2>
                {register && (
                  <span className="text-xs text-gray-500">
                    {register.openedAt ? format(new Date(register.openedAt), 'HH:mm') : '-'}
                  </span>
                )}
              </div>

              {shouldShowOpenCaja && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Ingresa el dinero inicial en caja</p>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Dinero inicial en caja
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        min="0"
                        value={openingAmount}
                        onChange={(e) => setOpeningAmount(Number(e.target.value))}
                        className="w-full border rounded-lg pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleOpen}
                    disabled={actionLoading}
                    className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition text-sm"
                  >
                    {actionLoading ? "Abriendo..." : "Abrir Caja"}
                  </button>
                </div>
              )}

              {isOpen && register && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Dinero Inicial</p>
                      {showPrice(register.openingAmount, "text-sm")}
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Ventas en Efectivo</p>
                      {showPrice(register.cashSales, "text-sm")}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-600">Dinero Esperado en Caja</p>
                    <div className="text-xl font-bold text-blue-700">
                      {showPrice(register.totalCash)}
                    </div>
                    <p className="text-xs text-blue-500 mt-1">
                      = Dinero inicial + Ventas en efectivo
                    </p>
                  </div>
                  <button
                    onClick={handlePreClose}
                    disabled={actionLoading}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2 text-sm"
                  >
                    <Eye size={16} />
                    Verificar Cierre de Caja
                  </button>
                </div>
              )}

              {isClosedYesterday && (
                <div className="bg-green-50 p-3 rounded-lg text-center border border-green-200">
                  <p className="text-green-700 text-sm font-medium">✓ La caja del día anterior fue cerrada</p>
                  <p className="text-green-600 text-xs mt-1">Listo para abrir nueva caja</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {isOpen && register && (
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <h3 className="font-bold mb-3 text-sm">Ventas por Método de Pago</h3>
                  <div className="space-y-2">
                    {[
                      { label: 'Efectivo', amount: register.cashSales, color: 'text-green-500', bg: 'bg-green-50' },
                      { label: 'Tarjeta', amount: register.cardSales, color: 'text-blue-500', bg: 'bg-blue-50' },
                      { label: 'Transferencia', amount: register.transferSales, color: 'text-purple-500', bg: 'bg-purple-50' },
                      { label: 'Crédito', amount: register.creditSales, color: 'text-orange-500', bg: 'bg-orange-50' },
                    ].map((item) => (
                      <div key={item.label} className={`flex items-center justify-between p-2 rounded-lg ${item.bg}`}>
                        <div className="flex items-center gap-2">
                          {item.label === 'Efectivo' && <Banknote size={16} className={item.color} />}
                          {item.label === 'Tarjeta' && <CreditCard size={16} className={item.color} />}
                          {item.label === 'Transferencia' && <ArrowRightLeft size={16} className={item.color} />}
                          {item.label === 'Crédito' && <ShoppingCart size={16} className={item.color} />}
                          <span className="font-medium text-xs">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-semibold">
                          <FlagIcon code="us" />
                          <span>{item.amount.toFixed(2)} US</span>
                        </div>
                      </div>
                    ))}
                    <div className="border-t pt-2 bg-green-50 p-2 rounded-lg">
                      <div className="flex items-center justify-between font-bold text-xs">
                        <span>TOTAL</span>
                        <div className="flex items-center gap-1">
                          <FlagIcon code="us" />
                          <span className="text-green-600">{register.totalSales.toFixed(2)} US</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center text-gray-500 text-xs">
                      {register.salesCount} ventas hoy
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <h3 className="font-bold mb-2 text-sm flex items-center gap-2">
                  <DollarSign className="text-blue-600" size={16} />
                  Dinero en Caja
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">Inicial:</span>
                    <span className="font-bold text-blue-800">{formatPrice(register?.openingAmount || 0)} US</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">Ventas Efvo:</span>
                    <span className="font-bold text-blue-800">{formatPrice(register?.cashSales || 0)} US</span>
                  </div>
                  <div className="border-t border-blue-300 pt-2 flex justify-between items-center">
                    <span className="text-blue-800 font-medium">Esperado:</span>
                    <span className="font-bold text-green-600">{formatPrice(register?.totalCash || 0)} US</span>
                  </div>
                </div>
                <p className="text-xs text-blue-500 mt-2">
                  💡 Solo efectivo físico
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm">
                <h3 className="font-bold mb-3 text-sm">Resumen del Mes</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span>Total ventas:</span>
                    <span className="font-bold">{formatPrice(summary?.monthTotal || 0)} US</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Efectivo:</span>
                    <span className="font-bold text-green-600">{formatPrice(summary?.monthCash || 0)} US</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ventas:</span>
                    <span className="font-bold">{summary?.monthSalesCount || 0}</span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t">
                  <h4 className="font-semibold mb-2 text-xs flex items-center gap-1">
                    💳 Métodos (Mes)
                  </h4>
                  <div className="space-y-2">
                    {[
                      { label: 'Efvo', percent: summary?.monthTotal ? Math.round((summary.monthCash / summary.monthTotal) * 100) : 0, color: 'bg-green-500' },
                      { label: 'Tarj', percent: summary?.monthTotal ? Math.round((summary.monthCard / summary.monthTotal) * 100) : 0, color: 'bg-blue-500' },
                      { label: 'Trans', percent: summary?.monthTotal ? Math.round((summary.monthTransfer / summary.monthTotal) * 100) : 0, color: 'bg-purple-500' },
                      { label: 'Créd', percent: summary?.monthTotal ? Math.round((summary.monthCredit / summary.monthTotal) * 100) : 0, color: 'bg-orange-500' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2">
                        <div className="w-12 text-xs text-gray-600">{item.label}:</div>
                        <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`${item.color} h-full rounded-full transition-all`}
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                        <div className="w-10 text-xs font-semibold text-gray-700 text-right">
                          {item.percent}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {isOpen && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                  <h3 className="font-bold">Ventas del Día</h3>
                  <span className="text-sm text-gray-500">{todaySales.length} ventas</span>
                </div>
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr className="text-left">
                        <th className="p-3">N°</th>
                        <th className="p-3">Hora</th>
                        <th className="p-3">Cliente</th>
                        <th className="p-3">Pago</th>
                        <th className="p-3 text-right">Total</th>
                        <th className="p-3 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todaySales.map((sale) => (
                        <tr key={sale._id} className="border-t hover:bg-gray-50">
                          <td className="p-3 font-mono text-xs">{sale.invoiceNumber}</td>
                          <td className="p-3">{sale.createdAt ? format(new Date(sale.createdAt), 'HH:mm') : '-'}</td>
                          <td className="p-3">{sale.clientName || 'Consumidor Final'}</td>
                          <td className="p-3">
                            <span className="flex items-center gap-1">
                              {getPaymentIcon(sale.paymentMethod)}
                              {sale.paymentMethod === 'cash' && 'Efectivo'}
                              {sale.paymentMethod === 'card' && 'Tarjeta'}
                              {sale.paymentMethod === 'transfer' && 'Transfer.'}
                              {sale.paymentMethod === 'credit' && 'Crédito'}
                            </span>
                          </td>
                          <td className="p-3 text-right font-bold">${sale.total.toFixed(2)}</td>
                          <td className="p-3 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => setSelectedSale(sale)}
                                className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                                title="Ver detalle"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => handleCancelSale(sale)}
                                disabled={actionLoading}
                                className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 disabled:opacity-50"
                                title="Cancelar venta"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {todaySales.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-gray-400">No hay ventas hoy</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h3 className="font-bold">Detalle de Venta</h3>
              <button onClick={() => setSelectedSale(null)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Factura:</span>
                <span className="font-mono font-bold">{selectedSale.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Fecha/Hora:</span>
                <span>{selectedSale.createdAt ? format(new Date(selectedSale.createdAt), 'dd/MM/yyyy HH:mm') : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cliente:</span>
                <span>{selectedSale.clientName || 'Consumidor Final'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Método de Pago:</span>
                <span className="flex items-center gap-1">
                  {getPaymentIcon(selectedSale.paymentMethod)}
                  {selectedSale.paymentMethod === 'cash' && 'Efectivo'}
                  {selectedSale.paymentMethod === 'card' && 'Tarjeta'}
                  {selectedSale.paymentMethod === 'transfer' && 'Transferencia'}
                  {selectedSale.paymentMethod === 'credit' && 'Crédito'}
                </span>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Productos</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedSale.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.productName}</span>
                      <span className="font-medium">${item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t pt-4 flex justify-between items-center">
                <span className="font-bold text-lg">Total:</span>
                <span className="font-bold text-xl text-green-600">${selectedSale.total.toFixed(2)}</span>
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setSelectedSale(null)}
                className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreCloseModal && register && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-blue-600 text-white">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Eye size={24} />
                Verificación de Cierre de Caja
              </h3>
              <button 
                onClick={() => setShowPreCloseModal(false)} 
                className="text-white hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-bold text-green-800 mb-2">Resumen de Ventas del Día</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                  <div className="bg-white p-2 rounded text-center">
                    <p className="text-gray-500">Efectivo</p>
                    <p className="font-bold text-green-600">
                      <span className="flex items-center justify-center gap-1">
                        <FlagIcon code="us" />
                        {register.cashSales.toFixed(2)} US
                      </span>
                    </p>
                  </div>
                  <div className="bg-white p-2 rounded text-center">
                    <p className="text-gray-500">Tarjeta</p>
                    <p className="font-bold text-blue-600">
                      <span className="flex items-center justify-center gap-1">
                        <FlagIcon code="us" />
                        {register.cardSales.toFixed(2)} US
                      </span>
                    </p>
                  </div>
                  <div className="bg-white p-2 rounded text-center">
                    <p className="text-gray-500">Transferencia</p>
                    <p className="font-bold text-purple-600">
                      <span className="flex items-center justify-center gap-1">
                        <FlagIcon code="us" />
                        {register.transferSales.toFixed(2)} US
                      </span>
                    </p>
                  </div>
                  <div className="bg-white p-2 rounded text-center">
                    <p className="text-gray-500">Crédito</p>
                    <p className="font-bold text-orange-600">
                      <span className="flex items-center justify-center gap-1">
                        <FlagIcon code="us" />
                        {register.creditSales.toFixed(2)} US
                      </span>
                    </p>
                  </div>
                  <div className="bg-green-600 text-white p-2 rounded text-center">
                    <p className="text-green-100">TOTAL</p>
                    <p className="font-bold">
                      <span className="flex items-center justify-center gap-1">
                        <FlagIcon code="us" />
                        {register.totalSales.toFixed(2)} US
                      </span>
                    </p>
                  </div>
                </div>
                <p className="text-center text-sm text-green-700 mt-2">
                  {register.salesCount} ventas registradas
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-2">Control de Efectivo</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600">Dinero Inicial:</span>
                    <span className="inline-flex items-center gap-1">
                      <FlagIcon code="us" />
                      <span className="font-bold">{register.openingAmount.toFixed(2)} US</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600">Ventas Efectivo:</span>
                    <span className="inline-flex items-center gap-1">
                      <FlagIcon code="us" />
                      <span className="font-bold">{register.cashSales.toFixed(2)} US</span>
                    </span>
                  </div>
                  <div className="col-span-2 border-t border-blue-300 pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <span className="text-blue-800 font-bold">Dinero Esperado:</span>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                        <span className="inline-flex items-center gap-0.5">
                          <FlagIcon code="us" />
                          <span className="font-bold text-green-600">{register.totalCash.toFixed(2)} US</span>
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="inline-flex items-center gap-0.5">
                          <FlagIcon code="py" />
                          <span>{(register.totalCash * gsRate).toLocaleString("es-PY")} Py</span>
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="inline-flex items-center gap-0.5">
                          <FlagIcon code="ar" />
                          <span>{(register.totalCash * arsRate).toLocaleString("es-AR")} $a</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-gray-800">Detalle de Ventas</h4>
                  <span className="text-sm text-gray-500">{todaySales.length} ventas</span>
                </div>
                <div className="overflow-x-auto max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white sticky top-0">
                      <tr className="text-left">
                        <th className="p-2">Factura</th>
                        <th className="p-2">Hora</th>
                        <th className="p-2">Cliente</th>
                        <th className="p-2">Pago</th>
                        <th className="p-2 text-right">Total</th>
                        <th className="p-2 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todaySales.map((sale) => (
                        <tr key={sale._id} className="border-t">
                          <td className="p-2 font-mono text-xs">{sale.invoiceNumber}</td>
                          <td className="p-2">{sale.createdAt ? format(new Date(sale.createdAt), 'HH:mm') : '-'}</td>
                          <td className="p-2">{sale.clientName || 'Consumidor Final'}</td>
                          <td className="p-2">
                            <span className="flex items-center gap-1">
                              {getPaymentIcon(sale.paymentMethod)}
                              <span className="text-xs">
                                {sale.paymentMethod === 'cash' && 'Efectivo'}
                                {sale.paymentMethod === 'card' && 'Tarjeta'}
                                {sale.paymentMethod === 'transfer' && 'Transfer.'}
                                {sale.paymentMethod === 'credit' && 'Crédito'}
                              </span>
                            </span>
                          </td>
                          <td className="p-2 text-right">
                            <div className="flex flex-col items-end gap-0.5">
                              <span className="inline-flex items-center gap-0.5">
                                <FlagIcon code="us" />
                                <span className="font-bold text-green-600 text-sm">{sale.total.toFixed(2)} US</span>
                              </span>
                              <span className="inline-flex items-center gap-0.5 text-xs text-gray-500">
                                <FlagIcon code="py" /> {(sale.total * gsRate).toLocaleString("es-PY")} Py
                              </span>
                              <span className="inline-flex items-center gap-0.5 text-xs text-gray-400">
                                <FlagIcon code="ar" /> {(sale.total * arsRate).toLocaleString("es-AR")} $a
                              </span>
                            </div>
                          </td>
                          <td className="p-2 text-center">
                            <button
                              onClick={() => handleCancelSaleFromModal(sale)}
                              disabled={actionLoading}
                              className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 disabled:opacity-50 text-xs"
                              title="Cancelar venta"
                            >
                              <X size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {todaySales.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-4 text-center text-gray-400">No hay ventas</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h4 className="font-bold text-amber-800 mb-3">Confirmar Cierre de Caja</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dinero REAL en caja
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        min="0"
                        value={preCloseClosingAmount}
                        onChange={(e) => setPreCloseClosingAmount(Number(e.target.value))}
                        className="w-full border border-amber-300 rounded-lg pl-7 pr-4 py-2 focus:ring-2 focus:ring-amber-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Diferencia:</span>
                    <span className={`font-bold ${preCloseClosingAmount >= register.totalCash ? 'text-green-600' : 'text-red-600'}`}>
                      ${(preCloseClosingAmount - register.totalCash).toFixed(2)}
                    </span>
                  </div>
                  <textarea
                    value={preCloseNotes}
                    onChange={(e) => setPreCloseNotes(e.target.value)}
                    rows={2}
                    placeholder="Notas del cierre (opcional)"
                    className="w-full border rounded-lg px-4 py-2 text-sm resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex gap-3">
              <button
                onClick={() => setShowPreCloseModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Volver
              </button>
              <button
                onClick={handlePreCloseSubmit}
                disabled={actionLoading}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition"
              >
                {actionLoading ? "Cerrando..." : "✓ Confirmar Cierre"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashRegisterPage;
