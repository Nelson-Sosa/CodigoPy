import { useState } from 'react';
import { useExchangeRate } from '../../hooks/useExchangeRate';
import { RefreshCw, DollarSign, X, ArrowRight, Clock, Edit3, Check } from 'lucide-react';

interface ExchangeRateDisplayProps {
  isAdmin?: boolean;
  compact?: boolean;
}

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

const FlagIcon = ({ code }: { code: string }) => (
  <img
    src={`https://flagcdn.com/32x24/${code}.png`}
    alt={code.toUpperCase()}
    className="w-8 h-6 rounded-sm shadow-sm"
    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
  />
);

const CurrencyCard = ({
  currency,
  rate,
  updatedAt,
  isAdmin,
  onEdit,
  onSave,
  onCancel,
  isEditing,
  editValue,
  onEditChange,
  saving,
}: {
  currency: typeof CURRENCIES[0];
  rate: number;
  updatedAt: string;
  isAdmin: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
  editValue: number;
  onEditChange: (v: number) => void;
  saving: boolean;
}) => {
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

  const c = colorClasses[currency.color as keyof typeof colorClasses];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Sin fecha';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-PY', { day: '2-digit', month: 'short' });
  };

  return (
    <div
      className={`
        relative ${c.bg} border-2 ${c.border} rounded-2xl p-5
        transition-all duration-200 ease-out
        hover:shadow-lg ${c.hover} hover:scale-[1.02]
        group flex flex-col justify-between
        min-h-[160px] max-h-[180px]
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlagIcon code={currency.flag.from} />
          <ArrowRight size={14} className={`${c.accent}`} />
          <FlagIcon code={currency.flag.to} />
        </div>
        <span className="text-xs text-gray-400 font-medium uppercase">{currency.code}</span>
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <div className="relative">
            <span className={`absolute left-2 top-1/2 -translate-y-1/2 ${c.accent} font-semibold text-sm`}>
              {currency.symbol}
            </span>
            <input
              type="number"
              value={editValue}
              onChange={(e) => onEditChange(Number(e.target.value))}
              className={`w-full pl-10 pr-3 py-2 text-xl font-bold ${c.accent} bg-white border-2 ${c.border} rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 ${c.ring}`}
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={onSave}
              disabled={saving}
              className={`flex-1 flex items-center justify-center gap-1 ${c.buttonBg} text-white py-1.5 rounded-lg text-sm font-medium ${c.buttonHover} disabled:opacity-50`}
            >
              <Check size={12} />
              {saving ? '...' : 'Guardar'}
            </button>
            <button
              onClick={onCancel}
              className="px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      ) : (
        <>
          <div>
            <p className={`text-2xl font-bold ${c.rate}`}>
              {currency.symbol} {rate.toLocaleString('es-PY')}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock size={10} />
              {formatDate(updatedAt)}
            </div>
            {isAdmin && (
              <button
                onClick={onEdit}
                className={`flex items-center gap-1 text-xs ${c.accent} hover:underline opacity-0 group-hover:opacity-100 transition-opacity`}
              >
                <Edit3 size={10} />
                Editar
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const ExchangeRateDisplay = ({ isAdmin = false, compact = false }: ExchangeRateDisplayProps) => {
  const { gsRate, arsRate, loading, rates, updateRate, refresh } = useExchangeRate();
  const [editingCurrency, setEditingCurrency] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  const handleEdit = (currency: string, currentRate: number) => {
    setEditingCurrency(currency);
    setEditValue(currentRate);
  };

  const handleSave = async () => {
    if (!editingCurrency) return;

    setSaving(true);
    try {
      await updateRate(editingCurrency, editValue);
      setEditingCurrency(null);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err.message || 'Error al guardar';
      alert(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingCurrency(null);
    setEditValue(0);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <FlagIcon code="us" />
          <span className="text-gray-400">→</span>
          <FlagIcon code="py" />
          <span className="font-semibold">{gsRate.toLocaleString('es-PY')}</span>
        </div>
        <div className="flex items-center gap-2">
          <FlagIcon code="us" />
          <span className="text-gray-400">→</span>
          <FlagIcon code="ar" />
          <span className="font-semibold">{arsRate.toLocaleString('es-PY')}</span>
        </div>
        {loading && <RefreshCw size={14} className="animate-spin text-gray-400" />}
      </div>
    );
  }

  const currencyData = CURRENCIES.map((c) => ({
    ...c,
    rate: c.code === 'PYG' ? gsRate : arsRate,
    updatedAt: rates[c.code]?.updatedAt || new Date().toISOString(),
  }));

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20">
            <DollarSign size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Tipos de Cambio</h3>
            <p className="text-xs text-slate-500">Configurados manualmente</p>
          </div>
        </div>

        <button
          onClick={refresh}
          disabled={loading}
          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all disabled:opacity-50"
          title="Actualizar"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {currencyData.map((currency) => (
          <CurrencyCard
            key={currency.code}
            currency={currency}
            rate={currency.rate}
            updatedAt={currency.updatedAt}
            isAdmin={isAdmin}
            onEdit={() => handleEdit(currency.code, currency.rate)}
            onSave={handleSave}
            onCancel={handleCancel}
            isEditing={editingCurrency === currency.code}
            editValue={editValue}
            onEditChange={setEditValue}
            saving={saving}
          />
        ))}
      </div>
    </div>
  );
};

export default ExchangeRateDisplay;
