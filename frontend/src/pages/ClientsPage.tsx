import { useEffect, useState } from "react";
import { clientService } from "../services/api";
import { Users, Plus, Search, Edit2, Trash2, X, Phone, Mail, MapPin, FileText } from "lucide-react";

interface Client {
  _id: string;
  id: string;
  name: string;
  ruc: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes: string;
  isActive: boolean;
  totalPurchases: number;
  totalSpent: number;
  createdAt: string;
}

const ClientsPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [ruc, setRuc] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await clientService.getAll({ search });
      setClients(res.data.map((c: any) => ({ ...c, id: c._id })));
    } catch (err) {
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchClients();
    }, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const resetForm = () => {
    setName("");
    setRuc("");
    setPhone("");
    setEmail("");
    setAddress("");
    setCity("");
    setNotes("");
    setError("");
    setEditingClient(null);
  };

  const openNewForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (client: Client) => {
    setEditingClient(client);
    setName(client.name);
    setRuc(client.ruc || "");
    setPhone(client.phone || "");
    setEmail(client.email || "");
    setAddress(client.address || "");
    setCity(client.city || "");
    setNotes(client.notes || "");
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    setSaving(true);
    setError("");

    const clientData = {
      name: name.trim(),
      ruc: ruc.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      city: city.trim(),
      notes: notes.trim(),
    };

    try {
      if (editingClient) {
        await clientService.update(editingClient._id, clientData);
      } else {
        await clientService.create(clientData);
      }
      setShowForm(false);
      resetForm();
      fetchClients();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al guardar cliente");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (client: Client) => {
    if (!confirm(`¿Eliminar cliente "${client.name}"?`)) return;

    try {
      await clientService.delete(client._id);
      fetchClients();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al eliminar cliente");
    }
  };

  if (loading && clients.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-blue-600" size={28} />
            Clientes
          </h1>
          <p className="text-gray-500 text-sm">{clients.length} clientes registrados</p>
        </div>
        <button
          onClick={openNewForm}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Nuevo Cliente
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, teléfono, email o RUC..."
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((client) => (
          <div key={client._id} className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800">{client.name}</h3>
                {client.ruc && (
                  <p className="text-gray-400 text-sm">RUC: {client.ruc}</p>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEditForm(client)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(client)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {client.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={14} />
                  <span>{client.phone}</span>
                </div>
              )}
              {client.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={14} />
                  <span className="truncate">{client.email}</span>
                </div>
              )}
              {(client.address || client.city) && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={14} />
                  <span className="truncate">
                    {[client.address, client.city].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t flex justify-between text-sm">
              <div>
                <span className="text-gray-400">Compras:</span>
                <span className="font-medium ml-1">{client.totalPurchases || 0}</span>
              </div>
              <div>
                <span className="text-gray-400">Total:</span>
                <span className="font-medium text-green-600 ml-1">
                  ${(client.totalSpent || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}

        {clients.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            <Users size={48} className="mx-auto mb-3 opacity-50" />
            <p>{search ? "No se encontraron clientes" : "No hay clientes registrados"}</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users size={24} className="text-blue-600" />
                {editingClient ? "Editar Cliente" : "Nuevo Cliente"}
              </h2>
              <button
                onClick={() => { setShowForm(false); resetForm(); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre completo o razón social"
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RUC / Cédula
                </label>
                <input
                  type="text"
                  value={ruc}
                  onChange={(e) => setRuc(e.target.value)}
                  placeholder="Identificación fiscal"
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej: 0991234567"
                    className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Dirección principal"
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ciudad de residencia"
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <FileText size={14} />
                  Notas
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Notas adicionales sobre el cliente..."
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => { setShowForm(false); resetForm(); }}
                className="px-6 py-2.5 border rounded-lg hover:bg-gray-100 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {saving ? "Guardando..." : editingClient ? "Actualizar" : "Guardar Cliente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;
