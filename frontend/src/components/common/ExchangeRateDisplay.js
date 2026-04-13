import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useExchangeRate } from '../../hooks/useExchangeRate';
import { RefreshCw, DollarSign, X, ArrowRight, Clock, Edit3, Check } from 'lucide-react';
const CURRENCIES = [
    {
        code: 'PYG',
        name: 'Guaraní',
        symbol: 'Gs.',
        flag: { from: 'us', to: 'py' },
        color: 'emerald',
    },
    {
        code: 'ARS',
        name: 'Peso Argentino',
        symbol: '$a',
        flag: { from: 'us', to: 'ar' },
        color: 'amber',
    },
];
const FlagIcon = ({ code }) => (_jsx("img", { src: `https://flagcdn.com/32x24/${code}.png`, alt: code.toUpperCase(), className: "w-8 h-6 rounded-sm shadow-sm", onError: (e) => { e.target.style.display = 'none'; } }));
const CurrencyCard = ({ currency, rate, updatedAt, isAdmin, onEdit, onSave, onCancel, isEditing, editValue, onEditChange, saving, }) => {
    const colorClasses = {
        emerald: {
            bg: 'bg-gradient-to-br from-emerald-50 to-white',
            border: 'border-emerald-100',
            accent: 'text-emerald-600',
            rate: 'text-emerald-700',
            hover: 'hover:border-emerald-300 hover:shadow-emerald-200',
            buttonBg: 'bg-emerald-600',
            buttonHover: 'hover:bg-emerald-700',
            ring: 'focus:ring-emerald-400',
        },
        amber: {
            bg: 'bg-gradient-to-br from-amber-50 to-white',
            border: 'border-amber-100',
            accent: 'text-amber-600',
            rate: 'text-amber-700',
            hover: 'hover:border-amber-300 hover:shadow-amber-200',
            buttonBg: 'bg-amber-600',
            buttonHover: 'hover:bg-amber-700',
            ring: 'focus:ring-amber-400',
        },
    };
    const c = colorClasses[currency.color];
    const formatDate = (dateStr) => {
        if (!dateStr)
            return 'Sin fecha';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-PY', { day: '2-digit', month: 'short' });
    };
    return (_jsxs("div", { className: `
        relative ${c.bg} border-2 ${c.border} rounded-2xl p-5
        transition-all duration-200 ease-out
        hover:shadow-lg ${c.hover} hover:scale-[1.02]
        group flex flex-col justify-between
        min-h-[160px] max-h-[180px]
      `, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(FlagIcon, { code: currency.flag.from }), _jsx(ArrowRight, { size: 14, className: `${c.accent}` }), _jsx(FlagIcon, { code: currency.flag.to })] }), _jsx("span", { className: "text-xs text-gray-400 font-medium uppercase", children: currency.code })] }), isEditing ? (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "relative", children: [_jsx("span", { className: `absolute left-2 top-1/2 -translate-y-1/2 ${c.accent} font-semibold text-sm`, children: currency.symbol }), _jsx("input", { type: "number", value: editValue, onChange: (e) => onEditChange(Number(e.target.value)), className: `w-full pl-10 pr-3 py-2 text-xl font-bold ${c.accent} bg-white border-2 ${c.border} rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 ${c.ring}`, autoFocus: true })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { onClick: onSave, disabled: saving, className: `flex-1 flex items-center justify-center gap-1 ${c.buttonBg} text-white py-1.5 rounded-lg text-sm font-medium ${c.buttonHover} disabled:opacity-50`, children: [_jsx(Check, { size: 12 }), saving ? '...' : 'Guardar'] }), _jsx("button", { onClick: onCancel, className: "px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200", children: _jsx(X, { size: 12 }) })] })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { children: _jsxs("p", { className: `text-2xl font-bold ${c.rate}`, children: [currency.symbol, " ", rate.toLocaleString('es-PY')] }) }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-1 text-xs text-gray-400", children: [_jsx(Clock, { size: 10 }), formatDate(updatedAt)] }), isAdmin && (_jsxs("button", { onClick: onEdit, className: `flex items-center gap-1 text-xs ${c.accent} hover:underline opacity-0 group-hover:opacity-100 transition-opacity`, children: [_jsx(Edit3, { size: 10 }), "Editar"] }))] })] }))] }));
};
const ExchangeRateDisplay = ({ isAdmin = false, compact = false }) => {
    const { gsRate, arsRate, loading, rates, updateRate, refresh } = useExchangeRate();
    const [editingCurrency, setEditingCurrency] = useState(null);
    const [editValue, setEditValue] = useState(0);
    const [saving, setSaving] = useState(false);
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
    if (compact) {
        return (_jsxs("div", { className: "flex items-center gap-4 text-sm", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(FlagIcon, { code: "us" }), _jsx("span", { className: "text-gray-400", children: "\u2192" }), _jsx(FlagIcon, { code: "py" }), _jsx("span", { className: "font-semibold", children: gsRate.toLocaleString('es-PY') })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(FlagIcon, { code: "us" }), _jsx("span", { className: "text-gray-400", children: "\u2192" }), _jsx(FlagIcon, { code: "ar" }), _jsx("span", { className: "font-semibold", children: arsRate.toLocaleString('es-PY') })] }), loading && _jsx(RefreshCw, { size: 14, className: "animate-spin text-gray-400" })] }));
    }
    const currencyData = CURRENCIES.map((c) => ({
        ...c,
        rate: c.code === 'PYG' ? gsRate : arsRate,
        updatedAt: rates[c.code]?.updatedAt || new Date().toISOString(),
    }));
    return (_jsxs("div", { className: "bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 border border-slate-200", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20", children: _jsx(DollarSign, { size: 18, className: "text-white" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-base font-bold text-slate-800", children: "Tipos de Cambio" }), _jsx("p", { className: "text-xs text-slate-500", children: "Configurados manualmente" })] })] }), _jsx("button", { onClick: refresh, disabled: loading, className: "p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all disabled:opacity-50", title: "Actualizar", children: _jsx(RefreshCw, { size: 14, className: loading ? 'animate-spin' : '' }) })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: currencyData.map((currency) => (_jsx(CurrencyCard, { currency: currency, rate: currency.rate, updatedAt: currency.updatedAt, isAdmin: isAdmin, onEdit: () => handleEdit(currency.code, currency.rate), onSave: handleSave, onCancel: handleCancel, isEditing: editingCurrency === currency.code, editValue: editValue, onEditChange: setEditValue, saving: saving }, currency.code))) })] }));
};
export default ExchangeRateDisplay;
