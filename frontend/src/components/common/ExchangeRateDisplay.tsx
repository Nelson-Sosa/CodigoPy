import { useState } from 'react';
import { useExchangeRate } from '../../hooks/useExchangeRate';
import { RefreshCw, DollarSign, AlertCircle, Save, X } from 'lucide-react';

interface ExchangeRateDisplayProps {
  isAdmin?: boolean;
  compact?: boolean;
}

const ExchangeRateDisplay = ({ isAdmin = false, compact = false }: ExchangeRateDisplayProps) => {
  const { gsRate, arsRate, loading, rates, syncFromExternal, updateRate, refresh } = useExchangeRate();
  const [editingCurrency, setEditingCurrency] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
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

  const handleEdit = (currency: string, currentRate: number) => {
    setEditingCurrency(currency);
    setEditValue(currentRate);
  };

  const handleSave = async () => {
    if (!editingCurrency) return;
    
    setSaving(true);
    const success = await updateRate(editingCurrency, editValue);
    setSaving(false);
    
    if (success) {
      setEditingCurrency(null);
    } else {
      alert('Error al guardar. Intenta de nuevo.');
    }
  };

  const handleCancel = () => {
    setEditingCurrency(null);
    setEditValue(0);
  };

  const getCurrencyLabel = (currency: string) => {
    return currency === 'PYG' ? 'Guaraní (Gs.)' : 'Peso Argentino ($a)';
  };

  const getCurrencySymbol = (currency: string) => {
    return currency === 'PYG' ? 'Gs.' : '$a';
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'manual': return 'bg-purple-100 text-purple-700';
      case 'api': return 'bg-blue-100 text-blue-700';
      default: return 'hidden';
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <span className="text-gray-500">USD→Gs:</span>
          <span className="font-semibold">{gsRate.toLocaleString('es-PY')}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-500">USD→$a:</span>
          <span className="font-semibold">{arsRate.toLocaleString('es-PY')}</span>
        </div>
        {loading && <RefreshCw size={14} className="animate-spin text-gray-400" />}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <DollarSign size={20} className="text-blue-600" />
          Tipo de Cambio
        </h3>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={handleSync}
              disabled={syncing || loading}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
              Sincronizar
            </button>
          )}
          <button
            onClick={refresh}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="Actualizar"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {['PYG', 'ARS'].map((currency) => {
          const rate = currency === 'PYG' ? gsRate : arsRate;
          const rateData = rates[currency];
          const isEditing = editingCurrency === currency;

          return (
            <div 
              key={currency} 
              className={`rounded-lg p-4 ${
                currency === 'PYG' ? 'bg-green-50' : 'bg-yellow-50'
              }`}
            >
              {isEditing ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    {getCurrencyLabel(currency)}
                  </p>
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(Number(e.target.value))}
                    className="w-full border rounded-lg px-3 py-2 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      <Save size={14} />
                      {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-3 py-2 border rounded-lg hover:bg-gray-100"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className={`text-sm font-medium mb-1 ${
                    currency === 'PYG' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {getCurrencyLabel(currency)}
                  </p>
                  <p className={`text-2xl font-bold ${
                    currency === 'PYG' ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    {getCurrencySymbol(currency)} {rate.toLocaleString('es-PY')}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    {rateData?.source && rateData.source !== 'default' && (
                      <span className={`text-xs px-2 py-0.5 rounded ${getSourceColor(rateData.source)}`}>
                        {rateData.source}
                      </span>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => handleEdit(currency, rate)}
                        className="text-xs text-gray-500 hover:text-gray-700 underline"
                      >
                        Editar
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {Object.values(rates).some(r => r.expired || r.warning) && (
        <div className="mt-4 flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-3 rounded-lg">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
          <span>Algunos valores pueden estar desactualizados. Sincroniza para actualizar.</span>
        </div>
      )}
    </div>
  );
};

export default ExchangeRateDisplay;
