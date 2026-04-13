import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useExchangeRate } from '../../hooks/useExchangeRate';
import { RefreshCw, DollarSign, AlertCircle, Save, X } from 'lucide-react';
const ExchangeRateDisplay = ({ isAdmin = false, compact = false }) => {
    const { gsRate, arsRate, loading, rates, syncFromExternal, updateRate, refresh } = useExchangeRate();
    const [editingCurrency, setEditingCurrency] = useState(null);
    const [editValue, setEditValue] = useState(0);
    const [syncing, setSyncing] = useState(false);
    const [saving, setSaving] = useState(false);
    const handleSync = async () => {
        setSyncing(true);
        const success = await syncFromExternal();
        setSyncing(false);
        if (!success) {
            alert('Error al sincronizar. Intenta de nuevo.');
        }
    };
    const handleEdit = (currency, currentRate) => {
        setEditingCurrency(currency);
        setEditValue(currentRate);
    };
    const handleSave = async () => {
        if (!editingCurrency)
            return;
        setSaving(true);
        try {
            await updateRate(editingCurrency, editValue);
            setEditingCurrency(null);
        }
        catch (err) {
            const errorMsg = err?.response?.data?.message || err.message || 'Error al guardar';
            alert(errorMsg);
        }
        finally {
            setSaving(false);
        }
    };
    const handleCancel = () => {
        setEditingCurrency(null);
        setEditValue(0);
    };
    const getCurrencyLabel = (currency) => {
        return currency === 'PYG' ? 'Guaraní (Gs.)' : 'Peso Argentino ($a)';
    };
    const getCurrencySymbol = (currency) => {
        return currency === 'PYG' ? 'Gs.' : '$a';
    };
    const getSourceColor = (source) => {
        switch (source) {
            case 'manual': return 'bg-purple-100 text-purple-700';
            case 'api': return 'bg-blue-100 text-blue-700';
            default: return 'hidden';
        }
    };
    if (compact) {
        return (_jsxs("div", { className: "flex items-center gap-4 text-sm", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("span", { className: "text-gray-500", children: "USD\u2192Gs:" }), _jsx("span", { className: "font-semibold", children: gsRate.toLocaleString('es-PY') })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("span", { className: "text-gray-500", children: "USD\u2192$a:" }), _jsx("span", { className: "font-semibold", children: arsRate.toLocaleString('es-PY') })] }), loading && _jsx(RefreshCw, { size: 14, className: "animate-spin text-gray-400" })] }));
    }
    return (_jsxs("div", { className: "bg-white rounded-lg border p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("h3", { className: "font-semibold text-gray-800 flex items-center gap-2", children: [_jsx(DollarSign, { size: 20, className: "text-blue-600" }), "Tipo de Cambio"] }), _jsxs("div", { className: "flex items-center gap-2", children: [isAdmin && (_jsxs("button", { onClick: handleSync, disabled: syncing || loading, className: "flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50", children: [_jsx(RefreshCw, { size: 14, className: syncing ? 'animate-spin' : '' }), "Sincronizar"] })), _jsx("button", { onClick: refresh, className: "p-1 text-gray-400 hover:text-gray-600", title: "Actualizar", children: _jsx(RefreshCw, { size: 16, className: loading ? 'animate-spin' : '' }) })] })] }), _jsx("div", { className: "grid grid-cols-2 gap-4", children: ['PYG', 'ARS'].map((currency) => {
                    const rate = currency === 'PYG' ? gsRate : arsRate;
                    const rateData = rates[currency];
                    const isEditing = editingCurrency === currency;
                    return (_jsx("div", { className: `rounded-lg p-4 ${currency === 'PYG' ? 'bg-green-50' : 'bg-yellow-50'}`, children: isEditing ? (_jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-sm font-medium text-gray-700", children: getCurrencyLabel(currency) }), _jsx("input", { type: "number", value: editValue, onChange: (e) => setEditValue(Number(e.target.value)), className: "w-full border rounded-lg px-3 py-2 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500", autoFocus: true }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { onClick: handleSave, disabled: saving, className: "flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1 disabled:opacity-50", children: [_jsx(Save, { size: 14 }), saving ? 'Guardando...' : 'Guardar'] }), _jsx("button", { onClick: handleCancel, className: "px-3 py-2 border rounded-lg hover:bg-gray-100", children: _jsx(X, { size: 14 }) })] })] })) : (_jsxs(_Fragment, { children: [_jsx("p", { className: `text-sm font-medium mb-1 ${currency === 'PYG' ? 'text-green-600' : 'text-yellow-600'}`, children: getCurrencyLabel(currency) }), _jsxs("p", { className: `text-2xl font-bold ${currency === 'PYG' ? 'text-green-700' : 'text-yellow-700'}`, children: [getCurrencySymbol(currency), " ", rate.toLocaleString('es-PY')] }), _jsxs("div", { className: "flex items-center justify-between mt-2", children: [rateData?.source && rateData.source !== 'default' && (_jsx("span", { className: `text-xs px-2 py-0.5 rounded ${getSourceColor(rateData.source)}`, children: rateData.source })), isAdmin && (_jsx("button", { onClick: () => handleEdit(currency, rate), className: "text-xs text-gray-500 hover:text-gray-700 underline", children: "Editar" }))] })] })) }, currency));
                }) }), Object.values(rates).some(r => r.expired || r.warning) && (_jsxs("div", { className: "mt-4 flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-3 rounded-lg", children: [_jsx(AlertCircle, { size: 14, className: "mt-0.5 flex-shrink-0" }), _jsx("span", { children: "Algunos valores pueden estar desactualizados. Sincroniza para actualizar." })] }))] }));
};
export default ExchangeRateDisplay;
