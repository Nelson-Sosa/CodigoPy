import { useEffect, useState } from "react";
import { purchaseService } from "../services/api";
import { Truck, Clock, CheckCircle, DollarSign } from "lucide-react";
import { format } from "date-fns";

interface Purchase {
  _id: string;
  purchaseNumber: string;
  supplier?: { name: string };
  supplierName: string;
  items: any[];
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  createdBy?: { name: string };
}

const PurchasesViewPage = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await purchaseService.getAll();
      setPurchases(res.data.purchases || res.data || []);
    } catch (err) {
      console.error("Error fetching purchases:", err);
    } finally {
      setLoading(false);
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

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: "Efectivo",
      card: "Tarjeta",
      transfer: "Transferencia",
      credit: "Crédito",
    };
    return labels[method] || method;
  };

  const getPaymentStatusBadge = (status: string) => {
    if (status === "paid") return "bg-green-100 text-green-800";
    if (status === "partial") return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  const getPaymentStatusLabel = (status: string) => {
    if (status === "paid") return "Pagado";
    if (status === "partial") return "Parcial";
    return "Pendiente";
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
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Truck className="text-blue-600" size={28} />
          Órdenes de Compra
        </h1>
        <p className="text-gray-500 text-sm">{purchases.length} órdenes registradas</p>
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-500 text-sm">
                <th className="p-4">Orden</th>
                <th className="p-4">Proveedor</th>
                <th className="p-4 text-right">Total</th>
                <th className="p-4">Estado Compra</th>
                <th className="p-4">Estado Pago</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map(purchase => (
                <tr key={purchase._id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-medium">{purchase.purchaseNumber}</td>
                  <td className="p-4">{purchase.supplierName}</td>
                  <td className="p-4 text-right font-semibold">${purchase.total.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(purchase.status)}`}>
                      {getStatusLabel(purchase.status)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusBadge(purchase.paymentStatus)}`}>
                      {getPaymentStatusLabel(purchase.paymentStatus)}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {format(new Date(purchase.createdAt), "dd/MM/yyyy")}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedPurchase(purchase)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              ))}
              {purchases.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    No hay órdenes de compra registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPurchase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold">{selectedPurchase.purchaseNumber}</h3>
              <button onClick={() => setSelectedPurchase(null)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Proveedor</p>
                  <p className="font-medium">{selectedPurchase.supplierName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Fecha</p>
                  <p className="font-medium">{format(new Date(selectedPurchase.createdAt), "dd/MM/yyyy HH:mm")}</p>
                </div>
                <div>
                  <p className="text-gray-500">Método de Pago</p>
                  <p className="font-medium">{getPaymentMethodLabel(selectedPurchase.paymentMethod)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Estado de Pago</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusBadge(selectedPurchase.paymentStatus)}`}>
                    {getPaymentStatusLabel(selectedPurchase.paymentStatus)}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500">Estado de Compra</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedPurchase.status)}`}>
                    {getStatusLabel(selectedPurchase.status)}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500">Registrado por</p>
                  <p className="font-medium">{selectedPurchase.createdBy?.name || "N/A"}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-500 text-sm mb-2">Productos</p>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr className="text-left">
                        <th className="p-3">Producto</th>
                        <th className="p-3 text-right">Cantidad</th>
                        <th className="p-3 text-right">Costo Unit.</th>
                        <th className="p-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPurchase.items.map((item: any, idx: number) => (
                        <tr key={idx} className="border-t">
                          <td className="p-3">{item.productName}</td>
                          <td className="p-3 text-right">{item.quantity}</td>
                          <td className="p-3 text-right">${item.unitCost.toFixed(2)}</td>
                          <td className="p-3 text-right">${item.subtotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={3} className="p-3 text-right font-semibold">Total:</td>
                        <td className="p-3 text-right font-bold">${selectedPurchase.total.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchasesViewPage;
