import { useEffect, useState } from "react";
import { settingsService, cashRegisterService, productService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import ExchangeRateDisplay from "../components/common/ExchangeRateDisplay";
import { Settings, Save, Building2, Receipt, FileText, Trash2, Download } from "lucide-react";

interface SettingsData {
  businessName: string;
  ruc: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  taxName: string;
  taxRate: number;
  invoiceEstablishment: string;
  invoicePoint: string;
  currentInvoiceNumber: number;
  timbradoNumber: string;
  timbradoFrom: string;
  timbradoTo: string;
  currency: string;
  currencySymbol: string;
  exchangeRate: number;
  footerMessage: string;
}

const SettingsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [settings, setSettings] = useState<SettingsData>({
    businessName: "",
    ruc: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    website: "",
    taxName: "IVA",
    taxRate: 0,
    invoiceEstablishment: "001",
    invoicePoint: "001",
    currentInvoiceNumber: 0,
    timbradoNumber: "",
    timbradoFrom: "",
    timbradoTo: "",
    currency: "USD",
    currencySymbol: "$",
    exchangeRate: 6600,
    footerMessage: "Gracias por su compra",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [cleaning, setCleaning] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await settingsService.get();
      const data = res.data;
      setSettings({
        ...data,
        timbradoFrom: data.timbradoFrom ? new Date(data.timbradoFrom).toISOString().split('T')[0] : '',
        timbradoTo: data.timbradoTo ? new Date(data.timbradoTo).toISOString().split('T')[0] : '',
      });
    } catch (err) {
      console.error("Error fetching settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof SettingsData, value: string | number) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const dataToSave = {
        ...settings,
        timbradoFrom: settings.timbradoFrom ? new Date(settings.timbradoFrom) : null,
        timbradoTo: settings.timbradoTo ? new Date(settings.timbradoTo) : null,
      };
      await settingsService.update(dataToSave);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert("Error al guardar configuración");
    } finally {
      setSaving(false);
    }
  };

  const nextInvoiceNumber = () => {
    const num = String(settings.currentInvoiceNumber + 1).padStart(7, '0');
    return `${settings.invoiceEstablishment}-${settings.invoicePoint}-${num}`;
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
          <Settings className="text-blue-600" size={28} />
          Configuración
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Building2 className="text-blue-500" size={20} />
              Datos de la Empresa
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Empresa</label>
                <input
                  type="text"
                  value={settings.businessName}
                  onChange={(e) => handleChange("businessName", e.target.value)}
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                  placeholder="Mi Empresa S.A."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RUC</label>
                <input
                  type="text"
                  value={settings.ruc}
                  onChange={(e) => handleChange("ruc", e.target.value)}
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                  placeholder="12345678-9"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                  placeholder="Av. Principal #123"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={settings.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                    placeholder="Asunción"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                    placeholder="+595 21 123 456"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                  placeholder="contacto@miempresa.com"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Receipt className="text-blue-500" size={20} />
                Timbrado (SET Paraguay)
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número de Timbrado</label>
                  <input
                    type="text"
                    value={settings.timbradoNumber}
                    onChange={(e) => handleChange("timbradoNumber", e.target.value)}
                    className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                    placeholder="12345678"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vigencia desde</label>
                    <input
                      type="date"
                      value={settings.timbradoFrom}
                      onChange={(e) => handleChange("timbradoFrom", e.target.value)}
                      className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vigencia hasta</label>
                    <input
                      type="date"
                      value={settings.timbradoTo}
                      onChange={(e) => handleChange("timbradoTo", e.target.value)}
                      className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="text-blue-500" size={20} />
                Numeración de Facturas
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Establecimiento</label>
                    <input
                      type="text"
                      value={settings.invoiceEstablishment}
                      onChange={(e) => handleChange("invoiceEstablishment", e.target.value)}
                      className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 text-center"
                      placeholder="001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Punto Exp.</label>
                    <input
                      type="text"
                      value={settings.invoicePoint}
                      onChange={(e) => handleChange("invoicePoint", e.target.value)}
                      className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 text-center"
                      placeholder="001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Siguiente N°</label>
                    <input
                      type="number"
                      min="0"
                      value={settings.currentInvoiceNumber}
                      onChange={(e) => handleChange("currentInvoiceNumber", Number(e.target.value))}
                      className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 text-center"
                    />
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <p className="text-sm text-blue-600">Próxima factura:</p>
                  <p className="text-lg font-bold text-blue-800">{nextInvoiceNumber()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Configuración de Impuestos</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Impuesto</label>
                <select
                  value={settings.taxName}
                  onChange={(e) => handleChange("taxName", e.target.value)}
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="IVA">IVA</option>
                  <option value="ITBMS">ITBMS</option>
                  <option value="I.V.A.">I.V.A.</option>
                  <option value="GST">GST</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tasa (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={settings.taxRate}
                  onChange={(e) => handleChange("taxRate", Number(e.target.value))}
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Moneda</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleChange("currency", e.target.value)}
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="USD">USD - Dólar</option>
                  <option value="PYG">PYG - Guaraní</option>
                  <option value="ARS">ARS - Peso Argentino</option>
                  <option value="MXN">MXN - Peso Mexicano</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Símbolo</label>
                <input
                  type="text"
                  value={settings.currencySymbol}
                  onChange={(e) => handleChange("currencySymbol", e.target.value)}
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                  placeholder="$"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cambio (USD → Gs.)</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">1 USD =</span>
                <input
                  type="number"
                  min="1"
                  step="100"
                  value={settings.exchangeRate}
                  onChange={(e) => handleChange("exchangeRate", Number(e.target.value))}
                  className="flex-1 border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                  placeholder="6600"
                />
                <span className="text-gray-500 text-sm">Gs.</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Este valor se usará para mostrar precios en Guaraníes
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Mensaje al Pie de Factura</h2>
          <textarea
            value={settings.footerMessage}
            onChange={(e) => handleChange("footerMessage", e.target.value)}
            rows={2}
            className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Gracias por su compra"
          />
        </div>

        {isAdmin && (
          <ExchangeRateDisplay isAdmin={true} />
        )}

        {isAdmin && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Trash2 className="text-red-500" size={20} />
              Mantenimiento
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Limpiar registros duplicados de caja</p>
                <p className="text-xs text-gray-400">Elimina múltiples registros de caja en la misma fecha</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (!window.confirm("¿Eliminar registros duplicados de caja? Se mantendrá el más reciente.")) return;
                  setCleaning(true);
                  try {
                    const res = await cashRegisterService.cleanDuplicates();
                    alert(res.data.message);
                  } catch (err) {
                    alert("Error al limpiar duplicados");
                  } finally {
                    setCleaning(false);
                  }
                }}
                disabled={cleaning}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {cleaning ? "Limpiando..." : "Limpiar Duplicados"}
              </button>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="text-sm text-gray-600">Corregir cierre automático de caja</p>
                <p className="text-xs text-gray-400">Corrige cierres con closingAmount=0 (ayer)</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (!window.confirm("¿Corregir cierre de caja de ayer?")) return;
                  setCleaning(true);
                  try {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const dateKey = yesterday.getFullYear() * 10000 + (yesterday.getMonth() + 1) * 100 + yesterday.getDate();
                    const res = await cashRegisterService.fixClosing(dateKey);
                    alert(res.data.message || "Cierre corregido");
                  } catch (err) {
                    alert(err.response?.data?.message || "Error al corregir cierre");
                  } finally {
                    setCleaning(false);
                  }
                }}
                disabled={cleaning}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
              >
                Corregir Cierre Ayer
              </button>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="text-sm text-gray-600">Exportar productos</p>
                <p className="text-xs text-gray-400">Descarga CSV con todos los productos</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  setCleaning(true);
                  try {
                    const res = await productService.getAll();
                    const products = res.data.map((p: any) => ({
                      SKU: p.sku,
                      Nombre: p.name,
                      Marca: p.brand || '',
                      Descripcion: p.description || '',
                      'Codigo de Barras': p.barcode || '',
                      'Precio Venta': p.salePrice,
                      'Precio Costo': p.costPrice,
                      Stock: p.stock,
                      'Stock Min': p.minStock,
                      'Stock Max': p.maxStock,
                      Unidad: p.unit,
                      Estado: p.status,
                    }));

                    const headers = Object.keys(products[0] || {}).join(',');
                    const rows = products.map((p: any) => Object.values(p).join(',')).join('\n');
                    const csv = headers + '\n' + rows;

                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `productos_${new Date().toISOString().split('T')[0]}.csv`;
                    link.click();
                    URL.revokeObjectURL(url);

                    alert(`Exportados ${products.length} productos`);
                  } catch (err) {
                    alert("Error al exportar productos");
                  } finally {
                    setCleaning(false);
                  }
                }}
                disabled={cleaning}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Download size={18} />
                Exportar CSV
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className={`px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition ${
              saved ? "bg-green-500 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            <Save size={20} />
            {saving ? "Guardando..." : saved ? "¡Guardado!" : "Guardar Configuración"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
