import { useEffect, useState } from "react";
import { supplierService } from "../services/api";
import { Truck, Plus, Pencil, Trash2, Phone, Mail, MapPin, X } from "lucide-react";

interface Supplier {
  _id: string;
  id: string;
  name: string;
  businessName?: string;
  taxId?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  categories?: string[];
  deliveryTime?: number;
  paymentTerms?: string;
  creditDays?: number;
  isActive: boolean;
}

interface SupplierFormData {
  name: string;
  businessName: string;
  taxId: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  categories: string;
  deliveryTime: string;
  paymentTerms: string;
  creditDays: string;
}

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<SupplierFormData>({
    name: "",
    businessName: "",
    taxId: "",
    contactName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    categories: "",
    deliveryTime: "",
    paymentTerms: "contado",
    creditDays: "",
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await supplierService.getAll();
      setSuppliers(res.data.map((s: any) => ({ ...s, id: s._id })));
    } catch (err) {
      console.error("Error fetching suppliers:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      businessName: "",
      taxId: "",
      contactName: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      categories: "",
      deliveryTime: "",
      paymentTerms: "contado",
      creditDays: "",
    });
    setEditingSupplier(null);
    setErrors({});
  };

  const openEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setForm({
      name: supplier.name,
      businessName: supplier.businessName || "",
      taxId: supplier.taxId || "",
      contactName: supplier.contactName || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
      city: supplier.city || "",
      categories: supplier.categories?.join(", ") || "",
      deliveryTime: supplier.deliveryTime?.toString() || "",
      paymentTerms: supplier.paymentTerms || "contado",
      creditDays: supplier.creditDays?.toString() || "",
    });
    setShowForm(true);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "El nombre es requerido";
    if (!form.phone.trim()) newErrors.phone = "El teléfono es requerido";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      const data = {
        name: form.name.trim(),
        businessName: form.businessName.trim() || undefined,
        taxId: form.taxId.trim() || undefined,
        contactName: form.contactName.trim() || undefined,
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        categories: form.categories.split(",").map(c => c.trim()).filter(c => c),
        deliveryTime: form.deliveryTime ? Number(form.deliveryTime) : 0,
        paymentTerms: form.paymentTerms,
        creditDays: form.creditDays ? Number(form.creditDays) : 0,
      };

      if (editingSupplier) {
        await supplierService.update(editingSupplier.id, data);
      } else {
        await supplierService.create(data);
      }

      setShowForm(false);
      resetForm();
      fetchSuppliers();
    } catch (err: any) {
      setErrors({ submit: err.response?.data?.message || "Error al guardar" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (supplier: Supplier) => {
    if (!confirm(`¿Eliminar al proveedor "${supplier.name}"?`)) return;
    try {
      await supplierService.delete(supplier.id);
      fetchSuppliers();
    } catch (err) {
      console.error("Error deleting supplier:", err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Truck className="text-blue-600" size={28} />
            Proveedores
          </h1>
          <p className="text-gray-500 text-sm">{suppliers.length} proveedores registrados</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition text-sm sm:text-base"
        >
          <Plus size={18} sm:size={20} />
          <span className="hidden sm:inline">Nuevo Proveedor</span>
          <span className="sm:hidden">Agregar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map(supplier => (
          <div key={supplier.id} className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{supplier.name}</h3>
                {supplier.businessName && (
                  <p className="text-sm text-gray-500">{supplier.businessName}</p>
                )}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                supplier.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
              }`}>
                {supplier.isActive ? "Activo" : "Inactivo"}
              </span>
            </div>

            {supplier.contactName && (
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Contacto:</span> {supplier.contactName}
              </p>
            )}

            <div className="space-y-1 text-sm text-gray-600">
              {supplier.phone && (
                <p className="flex items-center gap-2">
                  <Phone size={14} /> {supplier.phone}
                </p>
              )}
              {supplier.email && (
                <p className="flex items-center gap-2">
                  <Mail size={14} /> {supplier.email}
                </p>
              )}
              {supplier.city && (
                <p className="flex items-center gap-2">
                  <MapPin size={14} /> {supplier.city}
                </p>
              )}
            </div>

            {supplier.categories && supplier.categories.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {supplier.categories.slice(0, 3).map((cat, i) => (
                  <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
                    {cat}
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2 mt-4 pt-3 border-t">
              <button
                onClick={() => setSelectedSupplier(supplier)}
                className="flex-1 px-3 py-1.5 text-sm border rounded hover:bg-gray-50 transition"
              >
                Ver
              </button>
              <button
                onClick={() => openEdit(supplier)}
                className="flex-1 px-3 py-1.5 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition"
              >
                <Pencil size={14} className="inline mr-1" />
                Editar
              </button>
              <button
                onClick={() => handleDelete(supplier)}
                className="flex-1 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
              >
                <Trash2 size={14} className="inline mr-1" />
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {suppliers.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Truck size={64} className="mx-auto mb-4 opacity-30" />
          <p>No hay proveedores registrados</p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {editingSupplier ? "Editar Proveedor" : "Nuevo Proveedor"}
              </h2>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {errors.submit}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Nombre del proveedor"
                    className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
                </div>

                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">RFC</label>
                  <input
                    name="taxId"
                    value={form.taxId}
                    onChange={handleChange}
                    placeholder="RFC"
                    className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">Persona de Contacto</label>
                  <input
                    name="contactName"
                    value={form.contactName}
                    onChange={handleChange}
                    placeholder="Nombre del vendedor"
                    className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">
                    Teléfono <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="55-1234-5678"
                    className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.phone && <span className="text-red-500 text-sm">{errors.phone}</span>}
                </div>

                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                    className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">Ciudad</label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Ciudad"
                    className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">Dirección</label>
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Dirección"
                    className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">Productos que surte</label>
                  <input
                    name="categories"
                    value={form.categories}
                    onChange={handleChange}
                    placeholder="Laptops, Tablets (separar con coma)"
                    className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">Tiempo de Entrega</label>
                  <input
                    name="deliveryTime"
                    type="number"
                    value={form.deliveryTime}
                    onChange={handleChange}
                    placeholder="Días"
                    className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">Condiciones de Pago</label>
                  <select
                    name="paymentTerms"
                    value={form.paymentTerms}
                    onChange={handleChange}
                    className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="contado">Contado</option>
                    <option value="credito">Crédito</option>
                  </select>
                </div>

                {form.paymentTerms === "credito" && (
                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-1">Días de Crédito</label>
                    <input
                      name="creditDays"
                      type="number"
                      value={form.creditDays}
                      onChange={handleChange}
                      placeholder="Ej: 30"
                      className="border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="px-6 py-2.5 border rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? "Guardando..." : editingSupplier ? "Actualizar" : "Crear Proveedor"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Detalles del Proveedor</h2>
              <button onClick={() => setSelectedSupplier(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{selectedSupplier.name}</h3>
                {selectedSupplier.businessName && (
                  <p className="text-gray-500">{selectedSupplier.businessName}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedSupplier.taxId && (
                  <div>
                    <span className="text-gray-500">RFC:</span>
                    <p className="font-medium">{selectedSupplier.taxId}</p>
                  </div>
                )}
                {selectedSupplier.contactName && (
                  <div>
                    <span className="text-gray-500">Contacto:</span>
                    <p className="font-medium">{selectedSupplier.contactName}</p>
                  </div>
                )}
                {selectedSupplier.phone && (
                  <div>
                    <span className="text-gray-500">Teléfono:</span>
                    <p className="font-medium">{selectedSupplier.phone}</p>
                  </div>
                )}
                {selectedSupplier.email && (
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p className="font-medium">{selectedSupplier.email}</p>
                  </div>
                )}
                {selectedSupplier.city && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Ciudad:</span>
                    <p className="font-medium">
                      {[selectedSupplier.address, selectedSupplier.city].filter(Boolean).join(", ")}
                    </p>
                  </div>
                )}
                {selectedSupplier.deliveryTime !== undefined && selectedSupplier.deliveryTime > 0 && (
                  <div>
                    <span className="text-gray-500">Tiempo de entrega:</span>
                    <p className="font-medium">{selectedSupplier.deliveryTime} días</p>
                  </div>
                )}
                {selectedSupplier.paymentTerms && (
                  <div>
                    <span className="text-gray-500">Pago:</span>
                    <p className="font-medium capitalize">
                      {selectedSupplier.paymentTerms}
                      {selectedSupplier.creditDays ? ` - ${selectedSupplier.creditDays} días` : ""}
                    </p>
                  </div>
                )}
              </div>

              {selectedSupplier.categories && selectedSupplier.categories.length > 0 && (
                <div>
                  <span className="text-gray-500 text-sm">Categorías que surte:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedSupplier.categories.map((cat, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-sm">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersPage;
