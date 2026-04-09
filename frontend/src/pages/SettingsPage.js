import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { settingsService } from "../services/api";
import { Settings, Save, Building2, Receipt, FileText } from "lucide-react";
const SettingsPage = () => {
    const [settings, setSettings] = useState({
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
        }
        catch (err) {
            console.error("Error fetching settings:", err);
        }
        finally {
            setLoading(false);
        }
    };
    const handleChange = (field, value) => {
        setSettings(prev => ({ ...prev, [field]: value }));
        setSaved(false);
    };
    const handleSubmit = async (e) => {
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
        }
        catch (err) {
            alert("Error al guardar configuración");
        }
        finally {
            setSaving(false);
        }
    };
    const nextInvoiceNumber = () => {
        const num = String(settings.currentInvoiceNumber + 1).padStart(7, '0');
        return `${settings.invoiceEstablishment}-${settings.invoicePoint}-${num}`;
    };
    if (loading) {
        return (_jsx("div", { className: "p-6 flex items-center justify-center min-h-screen", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" }) }));
    }
    return (_jsxs("div", { className: "p-6 space-y-6 bg-gray-50 min-h-screen", children: [_jsx("div", { className: "flex justify-between items-center", children: _jsxs("h1", { className: "text-2xl font-bold text-gray-800 flex items-center gap-2", children: [_jsx(Settings, { className: "text-blue-600", size: 28 }), "Configuraci\u00F3n"] }) }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white rounded-xl shadow-md p-6", children: [_jsxs("h2", { className: "text-lg font-bold text-gray-800 mb-4 flex items-center gap-2", children: [_jsx(Building2, { className: "text-blue-500", size: 20 }), "Datos de la Empresa"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Nombre de la Empresa" }), _jsx("input", { type: "text", value: settings.businessName, onChange: (e) => handleChange("businessName", e.target.value), className: "w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500", placeholder: "Mi Empresa S.A." })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "RUC" }), _jsx("input", { type: "text", value: settings.ruc, onChange: (e) => handleChange("ruc", e.target.value), className: "w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500", placeholder: "12345678-9" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Direcci\u00F3n" }), _jsx("input", { type: "text", value: settings.address, onChange: (e) => handleChange("address", e.target.value), className: "w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500", placeholder: "Av. Principal #123" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Ciudad" }), _jsx("input", { type: "text", value: settings.city, onChange: (e) => handleChange("city", e.target.value), className: "w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500", placeholder: "Asunci\u00F3n" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Tel\u00E9fono" }), _jsx("input", { type: "text", value: settings.phone, onChange: (e) => handleChange("phone", e.target.value), className: "w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500", placeholder: "+595 21 123 456" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Email" }), _jsx("input", { type: "email", value: settings.email, onChange: (e) => handleChange("email", e.target.value), className: "w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500", placeholder: "contacto@miempresa.com" })] })] })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white rounded-xl shadow-md p-6", children: [_jsxs("h2", { className: "text-lg font-bold text-gray-800 mb-4 flex items-center gap-2", children: [_jsx(Receipt, { className: "text-blue-500", size: 20 }), "Timbrado (SET Paraguay)"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "N\u00FAmero de Timbrado" }), _jsx("input", { type: "text", value: settings.timbradoNumber, onChange: (e) => handleChange("timbradoNumber", e.target.value), className: "w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500", placeholder: "12345678" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Vigencia desde" }), _jsx("input", { type: "date", value: settings.timbradoFrom, onChange: (e) => handleChange("timbradoFrom", e.target.value), className: "w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Vigencia hasta" }), _jsx("input", { type: "date", value: settings.timbradoTo, onChange: (e) => handleChange("timbradoTo", e.target.value), className: "w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500" })] })] })] })] }), _jsxs("div", { className: "bg-white rounded-xl shadow-md p-6", children: [_jsxs("h2", { className: "text-lg font-bold text-gray-800 mb-4 flex items-center gap-2", children: [_jsx(FileText, { className: "text-blue-500", size: 20 }), "Numeraci\u00F3n de Facturas"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Establecimiento" }), _jsx("input", { type: "text", value: settings.invoiceEstablishment, onChange: (e) => handleChange("invoiceEstablishment", e.target.value), className: "w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 text-center", placeholder: "001" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Punto Exp." }), _jsx("input", { type: "text", value: settings.invoicePoint, onChange: (e) => handleChange("invoicePoint", e.target.value), className: "w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 text-center", placeholder: "001" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Siguiente N\u00B0" }), _jsx("input", { type: "number", min: "0", value: settings.currentInvoiceNumber, onChange: (e) => handleChange("currentInvoiceNumber", Number(e.target.value)), className: "w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 text-center" })] })] }), _jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-3 text-center", children: [_jsx("p", { className: "text-sm text-blue-600", children: "Pr\u00F3xima factura:" }), _jsx("p", { className: "text-lg font-bold text-blue-800", children: nextInvoiceNumber() })] })] })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white rounded-xl shadow-md p-6", children: [_jsx("h2", { className: "text-lg font-bold text-gray-800 mb-4", children: "Configuraci\u00F3n de Impuestos" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Nombre del Impuesto" }), _jsxs("select", { value: settings.taxName, onChange: (e) => handleChange("taxName", e.target.value), className: "w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 bg-white", children: [_jsx("option", { value: "IVA", children: "IVA" }), _jsx("option", { value: "ITBMS", children: "ITBMS" }), _jsx("option", { value: "I.V.A.", children: "I.V.A." }), _jsx("option", { value: "GST", children: "GST" }), _jsx("option", { value: "Otro", children: "Otro" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Tasa (%)" }), _jsx("input", { type: "number", min: "0", max: "100", step: "0.01", value: settings.taxRate, onChange: (e) => handleChange("taxRate", Number(e.target.value)), className: "w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500" })] })] })] }), _jsxs("div", { className: "bg-white rounded-xl shadow-md p-6", children: [_jsx("h2", { className: "text-lg font-bold text-gray-800 mb-4", children: "Moneda" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Moneda" }), _jsxs("select", { value: settings.currency, onChange: (e) => handleChange("currency", e.target.value), className: "w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 bg-white", children: [_jsx("option", { value: "USD", children: "USD - D\u00F3lar" }), _jsx("option", { value: "PYG", children: "PYG - Guaran\u00ED" }), _jsx("option", { value: "ARS", children: "ARS - Peso Argentino" }), _jsx("option", { value: "MXN", children: "MXN - Peso Mexicano" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "S\u00EDmbolo" }), _jsx("input", { type: "text", value: settings.currencySymbol, onChange: (e) => handleChange("currencySymbol", e.target.value), className: "w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500", placeholder: "$" })] })] }), _jsxs("div", { className: "mt-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Tipo de Cambio (USD \u2192 Gs.)" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-gray-500 text-sm", children: "1 USD =" }), _jsx("input", { type: "number", min: "1", step: "100", value: settings.exchangeRate, onChange: (e) => handleChange("exchangeRate", Number(e.target.value)), className: "flex-1 border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500", placeholder: "6600" }), _jsx("span", { className: "text-gray-500 text-sm", children: "Gs." })] }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Este valor se usar\u00E1 para mostrar precios en Guaran\u00EDes" })] })] })] }), _jsxs("div", { className: "bg-white rounded-xl shadow-md p-6", children: [_jsx("h2", { className: "text-lg font-bold text-gray-800 mb-4", children: "Mensaje al Pie de Factura" }), _jsx("textarea", { value: settings.footerMessage, onChange: (e) => handleChange("footerMessage", e.target.value), rows: 2, className: "w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 resize-none", placeholder: "Gracias por su compra" })] }), _jsx("div", { className: "flex justify-end", children: _jsxs("button", { type: "submit", disabled: saving, className: `px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition ${saved ? "bg-green-500 text-white" : "bg-blue-600 text-white hover:bg-blue-700"}`, children: [_jsx(Save, { size: 20 }), saving ? "Guardando..." : saved ? "¡Guardado!" : "Guardar Configuración"] }) })] })] }));
};
export default SettingsPage;
