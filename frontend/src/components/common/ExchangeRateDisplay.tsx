import { useState } from 'react';
import { useExchangeRate } from '../../hooks/useExchangeRate';
import { RefreshCw, DollarSign, AlertCircle } from 'lucide-react';

interface Props {
  isAdmin?: boolean;
}

const ExchangeRateDisplay = ({ isAdmin = false }: Props) => {
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
    } else {
      alert('Error al sincronizar. Intenta manualmente.');
    }
  };

  const handleSave = async () => {
    const success = await updateManual(newGsRate, newArsRate);
    if (success) {
      setEditing(false);
      alert('Tipo de cambio actualizado');
    } else {
      alert('Error al guardar');
    }
  };

  const formatGs = (rate: number) => rate.toLocaleString('es-PY');

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <DollarSign size={20} className="text-blue-600" />
          Tipo de Cambio
        </h3>
        <div className="flex items-center gap-2">
          {source && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Fuente: {source}
            </span>
          )}
          {isAdmin && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
              Sincronizar
            </button>
          )}
        </div>
      </div>

      {loading && !editing ? (
        <div className="flex items-center gap-2 text-gray-500">
          <RefreshCw size={16} className="animate-spin" />
          <span>Cargando...</span>
        </div>
      ) : editing && isAdmin ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Dólar → Guaraní (Gs.)
            </label>
            <input
              type="number"
              value={newGsRate}
              onChange={(e) => setNewGsRate(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Dólar → Peso Argentino ($a)
            </label>
            <input
              type="number"
              value={newArsRate}
              onChange={(e) => setNewArsRate(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Guardar
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setNewGsRate(gsRate);
                setNewArsRate(arsRate);
              }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-sm text-green-600 mb-1">USD → Gs.</p>
            <p className="text-xl font-bold text-green-700">
              Gs. {formatGs(gsRate)}
            </p>
            {isAdmin && (
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-green-600 hover:text-green-800 mt-1 underline"
              >
                Editar
              </button>
            )}
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 text-center">
            <p className="text-sm text-yellow-600 mb-1">USD → $a</p>
            <p className="text-xl font-bold text-yellow-700">
              $a {formatGs(arsRate)}
            </p>
            {isAdmin && (
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-yellow-600 hover:text-yellow-800 mt-1 underline"
              >
                Editar
              </button>
            )}
          </div>
        </div>
      )}

      {source === 'default' && isAdmin && (
        <div className="mt-3 flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
          <span>Usando valores por defecto. Sincroniza para obtener valores actuales.</span>
        </div>
      )}
    </div>
  );
};

export default ExchangeRateDisplay;
