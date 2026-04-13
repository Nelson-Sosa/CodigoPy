import { useState } from 'react';
import { useExchangeRate } from '../../hooks/useExchangeRate';
import { RefreshCw, DollarSign, AlertCircle, X, ArrowRight, Clock, Edit3, Check } from 'lucide-react';

interface ExchangeRateDisplayProps {
  isAdmin?: boolean;
  compact?: boolean;
}

const CURRENCIES = [
  {
    code: 'PYG',
    name: 'Guaraní Paraguayo',
    symbol: 'Gs.',
    flag: { from: '🇺🇸', to: '🇵🇾' },
    color: 'emerald',
  },
  {
    code: 'ARS',
    name: 'Peso Argentino',
    symbol: '$a',
    flag: { from: '🇺🇸', to: '🇦🇷' },
    color: 'amber',
  },
];

const SourceBadge = ({ source, isExpired }: { source: string; isExpired?: boolean }) => {
  if (isExpired || source === 'default') return null;

  const styles = {
    manual: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    api: 'bg-amber-100 text-amber-700 border-amber-200',
  };

  const labels = {
    manual: '🟢 Cambios Chaco',
    api: '🟡 API',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${styles[source as keyof typeof styles] || ''}`}>
      {labels[source as keyof typeof labels] || source}
    </span>
  );
};

const CurrencyCard = ({
  currency,
  rate,
  source,
  updatedAt,
  isExpired,
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
  source: string;
  updatedAt: string;
  isExpired?: boolean;
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
      hover: 'hover:border-emerald-300 hover:shadow-emerald-100',
      buttonBg: 'bg-emerald-600',
      buttonHover: 'hover:bg-emerald-700',
      ring: 'focus:ring-emerald-400',
    },
    amber: {
      bg: 'bg-gradient-to-br from-amber-50 to-white',
      border: 'border-amber-100',
      accent: 'text-amber-600',
      rate: 'text-amber-700',
      hover: 'hover:border-amber-300 hover:shadow-amber-100',
      buttonBg: 'bg-amber-600',
      buttonHover: 'hover:bg-amber-700',
      ring: 'focus:ring-amber-400',
    },
  };

  const c = colorClasses[currency.color as keyof typeof colorClasses];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Sin fecha';
    const date = new Date(dateStr);
    return date.toLocaleString('es-PY', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={`relative ${c.bg} border-2 ${c.border} rounded-2xl p-6 transition-all duration-300 hover:shadow-lg ${c.hover} group`}
    >
      {isExpired && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
          <AlertCircle size={12} />
          Desactualizado
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{currency.flag.from}</span>
          <ArrowRight size={16} className={`${c.accent} transition-transform group-hover:translate-x-1`} />
          <span className="text-2xl">{currency.flag.to}</span>
        </div>
        <SourceBadge source={source} isExpired={isExpired} />
      </div>

      <div className="mb-2">
        <p className="text-sm text-gray-500 font-medium">{currency.name}</p>
        <p className="text-xs text-gray-400 font-mono">{currency.code}</p>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div className="relative">
            <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${c.accent} font-semibold`}>
              {currency.symbol}
            </span>
            <input
              type="number"
              value={editValue}
              onChange={(e) => onEditChange(Number(e.target.value))}
              className={`w-full pl-12 pr-4 py-3 text-2xl font-bold ${c.accent} bg-white border-2 ${c.border} rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 ${c.ring} transition-all`}
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={onSave}
              disabled={saving}
              className={`flex-1 flex items-center justify-center gap-2 ${c.buttonBg} text-white py-2.5 rounded-xl font-medium ${c.buttonHover} transition-colors disabled:opacity-50`}
            >
              <Check size={16} />
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className={`text-3xl font-bold ${c.rate}`}>
              {currency.symbol} {rate.toLocaleString('es-PY')}
            </p>
            <p className="text-xs text-gray-400 mt-1">1 USD = 1 {currency.code}</p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Clock size={12} />
              {formatDate(updatedAt)}
            </div>
            {isAdmin && (
              <button
                onClick={onEdit}
                className={`flex items-center gap-1 text-sm ${c.accent} hover:underline opacity-0 group-hover:opacity-100 transition-opacity`}
              >
                <Edit3 size={12} />
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
  const { gsRate, arsRate, loading, rates, syncFromExternal, updateRate, refresh } = useExchangeRate();
  const [editingCurrency, setEditingCurrency] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncFromExternal();
      setLastSync(new Date());
    } catch {
      alert('Error al sincronizar. Intenta de nuevo.');
    } finally {
      setSyncing(false);
    }
  };

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
        <div className="flex items-center gap-1">
          <span>🇺🇸→🇵🇾</span>
          <span className="text-gray-500">Gs:</span>
          <span className="font-semibold">{gsRate.toLocaleString('es-PY')}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>🇺🇸→🇦🇷</span>
          <span className="text-gray-500">$a:</span>
          <span className="font-semibold">{arsRate.toLocaleString('es-PY')}</span>
        </div>
        {loading && <RefreshCw size={14} className="animate-spin text-gray-400" />}
      </div>
    );
  }

  const currencyData = CURRENCIES.map((c) => ({
    ...c,
    rate: c.code === 'PYG' ? gsRate : arsRate,
    source: rates[c.code]?.source || 'default',
    updatedAt: rates[c.code]?.updatedAt || new Date().toISOString(),
    isExpired: rates[c.code]?.expired,
  }));

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20">
            <DollarSign size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Tipos de Cambio</h3>
            <p className="text-xs text-slate-500">Actualización en tiempo real</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lastSync && (
            <span className="text-xs text-slate-400 hidden sm:block">
              Sincronizado {lastSync.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {isAdmin && (
            <button
              onClick={handleSync}
              disabled={syncing || loading}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Sincronizar</span>
            </button>
          )}
          <button
            onClick={refresh}
            disabled={loading}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all disabled:opacity-50"
            title="Actualizar"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currencyData.map((currency) => (
          <CurrencyCard
            key={currency.code}
            currency={currency}
            rate={currency.rate}
            source={currency.source}
            updatedAt={currency.updatedAt}
            isExpired={currency.isExpired}
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

      {Object.values(rates).some((r) => r.expired || r.warning) && (
        <div className="mt-4 flex items-start gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 p-3 rounded-xl">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>Algunos valores pueden estar desactualizados. Sincroniza para actualizar.</span>
        </div>
      )}
    </div>
  );
};

export default ExchangeRateDisplay;
