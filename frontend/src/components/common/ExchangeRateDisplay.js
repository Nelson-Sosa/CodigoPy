import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useExchangeRate } from '../../hooks/useExchangeRate';
import { RefreshCw, DollarSign, AlertCircle } from 'lucide-react';
const ExchangeRateDisplay = ({ isAdmin = false }) => {
    const { gsRate, arsRate, loading, source, syncFromExternal, updateManual } = useExchangeRate();
    const [editing, setEditing] = useState(false);
    const [newGsRate, setNewGsRate] = useState(gsRate);
    const [newArsRate, setNewArsRate] = useState(arsRate);
    const [syncing, setSyncing] = useState(false);
    const handleSync = async () => {
        setSyncing(true);
        const success = await syncFromExternal();
        setSyncing(false);
        if (success) {
            alert('Tipo de cambio actualizado exitosamente');
        }
        else {
            alert('Error al sincronizar. Intenta manualmente.');
        }
    };
    const handleSave = async () => {
        const success = await updateManual(newGsRate, newArsRate);
        if (success) {
            setEditing(false);
            alert('Tipo de cambio actualizado');
        }
        else {
            alert('Error al guardar');
        }
    };
    const formatGs = (rate) => rate.toLocaleString('es-PY');
    return (_jsxs("div", { className: "bg-white rounded-lg border p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("h3", { className: "font-semibold text-gray-800 flex items-center gap-2", children: [_jsx(DollarSign, { size: 20, className: "text-blue-600" }), "Tipo de Cambio"] }), _jsxs("div", { className: "flex items-center gap-2", children: [source && (_jsxs("span", { className: "text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded", children: ["Fuente: ", source] })), isAdmin && (_jsxs("button", { onClick: handleSync, disabled: syncing, className: "flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50", children: [_jsx(RefreshCw, { size: 14, className: syncing ? 'animate-spin' : '' }), "Sincronizar"] }))] })] }), loading && !editing ? (_jsxs("div", { className: "flex items-center gap-2 text-gray-500", children: [_jsx(RefreshCw, { size: 16, className: "animate-spin" }), _jsx("span", { children: "Cargando..." })] })) : editing && isAdmin ? (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm text-gray-600 mb-1", children: "D\u00F3lar \u2192 Guaran\u00ED (Gs.)" }), _jsx("input", { type: "number", value: newGsRate, onChange: (e) => setNewGsRate(Number(e.target.value)), className: "w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm text-gray-600 mb-1", children: "D\u00F3lar \u2192 Peso Argentino ($a)" }), _jsx("input", { type: "number", value: newArsRate, onChange: (e) => setNewArsRate(Number(e.target.value)), className: "w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: handleSave, className: "flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700", children: "Guardar" }), _jsx("button", { onClick: () => {
                                    setEditing(false);
                                    setNewGsRate(gsRate);
                                    setNewArsRate(arsRate);
                                }, className: "px-4 py-2 border rounded-lg hover:bg-gray-50", children: "Cancelar" })] })] })) : (_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "bg-green-50 rounded-lg p-3 text-center", children: [_jsx("p", { className: "text-sm text-green-600 mb-1", children: "USD \u2192 Gs." }), _jsxs("p", { className: "text-xl font-bold text-green-700", children: ["Gs. ", formatGs(gsRate)] }), isAdmin && (_jsx("button", { onClick: () => setEditing(true), className: "text-xs text-green-600 hover:text-green-800 mt-1 underline", children: "Editar" }))] }), _jsxs("div", { className: "bg-yellow-50 rounded-lg p-3 text-center", children: [_jsx("p", { className: "text-sm text-yellow-600 mb-1", children: "USD \u2192 $a" }), _jsxs("p", { className: "text-xl font-bold text-yellow-700", children: ["$a ", formatGs(arsRate)] }), isAdmin && (_jsx("button", { onClick: () => setEditing(true), className: "text-xs text-yellow-600 hover:text-yellow-800 mt-1 underline", children: "Editar" }))] })] })), source === 'default' && isAdmin && (_jsxs("div", { className: "mt-3 flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded", children: [_jsx(AlertCircle, { size: 14, className: "mt-0.5 flex-shrink-0" }), _jsx("span", { children: "Usando valores por defecto. Sincroniza para obtener valores actuales." })] }))] }));
};
export default ExchangeRateDisplay;
