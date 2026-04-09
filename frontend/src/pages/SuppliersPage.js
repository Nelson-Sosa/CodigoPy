import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { supplierService } from "../services/api";
import { Truck, Plus, Pencil, Trash2, Phone, Mail, MapPin, X } from "lucide-react";
const SuppliersPage = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
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
            setSuppliers(res.data.map((s) => ({ ...s, id: s._id })));
        }
        catch (err) {
            console.error("Error fetching suppliers:", err);
        }
        finally {
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
    const openEdit = (supplier) => {
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
        const newErrors = {};
        if (!form.name.trim())
            newErrors.name = "El nombre es requerido";
        if (!form.phone.trim())
            newErrors.phone = "El teléfono es requerido";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async () => {
        if (!validate())
            return;
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
            }
            else {
                await supplierService.create(data);
            }
            setShowForm(false);
            resetForm();
            fetchSuppliers();
        }
        catch (err) {
            setErrors({ submit: err.response?.data?.message || "Error al guardar" });
        }
        finally {
            setSaving(false);
        }
    };
    const handleDelete = async (supplier) => {
        if (!confirm(`¿Eliminar al proveedor "${supplier.name}"?`))
            return;
        try {
            await supplierService.delete(supplier.id);
            fetchSuppliers();
        }
        catch (err) {
            console.error("Error deleting supplier:", err);
        }
    };
    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    if (loading) {
        return (_jsx("div", { className: "p-6 flex items-center justify-center min-h-screen", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" }) }));
    }
    return (_jsxs("div", { className: "p-6 space-y-6 bg-gray-50 min-h-screen", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-bold text-gray-800 flex items-center gap-2", children: [_jsx(Truck, { className: "text-blue-600", size: 28 }), "Proveedores"] }), _jsxs("p", { className: "text-gray-500 text-sm", children: [suppliers.length, " proveedores registrados"] })] }), _jsxs("button", { onClick: () => { resetForm(); setShowForm(true); }, className: "bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition", children: [_jsx(Plus, { size: 20 }), "Nuevo Proveedor"] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: suppliers.map(supplier => (_jsxs("div", { className: "bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition", children: [_jsxs("div", { className: "flex justify-between items-start mb-3", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-bold text-lg text-gray-800", children: supplier.name }), supplier.businessName && (_jsx("p", { className: "text-sm text-gray-500", children: supplier.businessName }))] }), _jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${supplier.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`, children: supplier.isActive ? "Activo" : "Inactivo" })] }), supplier.contactName && (_jsxs("p", { className: "text-sm text-gray-600 mb-2", children: [_jsx("span", { className: "font-medium", children: "Contacto:" }), " ", supplier.contactName] })), _jsxs("div", { className: "space-y-1 text-sm text-gray-600", children: [supplier.phone && (_jsxs("p", { className: "flex items-center gap-2", children: [_jsx(Phone, { size: 14 }), " ", supplier.phone] })), supplier.email && (_jsxs("p", { className: "flex items-center gap-2", children: [_jsx(Mail, { size: 14 }), " ", supplier.email] })), supplier.city && (_jsxs("p", { className: "flex items-center gap-2", children: [_jsx(MapPin, { size: 14 }), " ", supplier.city] }))] }), supplier.categories && supplier.categories.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-1 mt-3", children: supplier.categories.slice(0, 3).map((cat, i) => (_jsx("span", { className: "px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs", children: cat }, i))) })), _jsxs("div", { className: "flex gap-2 mt-4 pt-3 border-t", children: [_jsx("button", { onClick: () => setSelectedSupplier(supplier), className: "flex-1 px-3 py-1.5 text-sm border rounded hover:bg-gray-50 transition", children: "Ver" }), _jsxs("button", { onClick: () => openEdit(supplier), className: "flex-1 px-3 py-1.5 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition", children: [_jsx(Pencil, { size: 14, className: "inline mr-1" }), "Editar"] }), _jsxs("button", { onClick: () => handleDelete(supplier), className: "flex-1 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition", children: [_jsx(Trash2, { size: 14, className: "inline mr-1" }), "Eliminar"] })] })] }, supplier.id))) }), suppliers.length === 0 && (_jsxs("div", { className: "text-center py-12 text-gray-400", children: [_jsx(Truck, { size: 64, className: "mx-auto mb-4 opacity-30" }), _jsx("p", { children: "No hay proveedores registrados" })] })), showForm && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center", children: [_jsx("h2", { className: "text-xl font-bold", children: editingSupplier ? "Editar Proveedor" : "Nuevo Proveedor" }), _jsx("button", { onClick: () => { setShowForm(false); resetForm(); }, className: "text-gray-400 hover:text-gray-600", children: _jsx(X, { size: 24 }) })] }), _jsxs("div", { className: "p-6 space-y-5", children: [errors.submit && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg", children: errors.submit })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "flex flex-col", children: [_jsxs("label", { className: "font-medium text-gray-700 mb-1", children: ["Nombre ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { name: "name", value: form.name, onChange: handleChange, placeholder: "Nombre del proveedor", className: "border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" }), errors.name && _jsx("span", { className: "text-red-500 text-sm", children: errors.name })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("label", { className: "font-medium text-gray-700 mb-1", children: "RFC" }), _jsx("input", { name: "taxId", value: form.taxId, onChange: handleChange, placeholder: "RFC", className: "border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase" })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("label", { className: "font-medium text-gray-700 mb-1", children: "Persona de Contacto" }), _jsx("input", { name: "contactName", value: form.contactName, onChange: handleChange, placeholder: "Nombre del vendedor", className: "border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { className: "flex flex-col", children: [_jsxs("label", { className: "font-medium text-gray-700 mb-1", children: ["Tel\u00E9fono ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { name: "phone", value: form.phone, onChange: handleChange, placeholder: "55-1234-5678", className: "border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" }), errors.phone && _jsx("span", { className: "text-red-500 text-sm", children: errors.phone })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("label", { className: "font-medium text-gray-700 mb-1", children: "Email" }), _jsx("input", { name: "email", type: "email", value: form.email, onChange: handleChange, placeholder: "correo@ejemplo.com", className: "border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("label", { className: "font-medium text-gray-700 mb-1", children: "Ciudad" }), _jsx("input", { name: "city", value: form.city, onChange: handleChange, placeholder: "Ciudad", className: "border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("label", { className: "font-medium text-gray-700 mb-1", children: "Direcci\u00F3n" }), _jsx("input", { name: "address", value: form.address, onChange: handleChange, placeholder: "Direcci\u00F3n", className: "border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("label", { className: "font-medium text-gray-700 mb-1", children: "Productos que surte" }), _jsx("input", { name: "categories", value: form.categories, onChange: handleChange, placeholder: "Laptops, Tablets (separar con coma)", className: "border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("label", { className: "font-medium text-gray-700 mb-1", children: "Tiempo de Entrega" }), _jsx("input", { name: "deliveryTime", type: "number", value: form.deliveryTime, onChange: handleChange, placeholder: "D\u00EDas", className: "border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("label", { className: "font-medium text-gray-700 mb-1", children: "Condiciones de Pago" }), _jsxs("select", { name: "paymentTerms", value: form.paymentTerms, onChange: handleChange, className: "border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white", children: [_jsx("option", { value: "contado", children: "Contado" }), _jsx("option", { value: "credito", children: "Cr\u00E9dito" })] })] }), form.paymentTerms === "credito" && (_jsxs("div", { className: "flex flex-col", children: [_jsx("label", { className: "font-medium text-gray-700 mb-1", children: "D\u00EDas de Cr\u00E9dito" }), _jsx("input", { name: "creditDays", type: "number", value: form.creditDays, onChange: handleChange, placeholder: "Ej: 30", className: "border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" })] }))] }), _jsxs("div", { className: "flex justify-end gap-3 pt-4 border-t", children: [_jsx("button", { onClick: () => { setShowForm(false); resetForm(); }, className: "px-6 py-2.5 border rounded-lg hover:bg-gray-50 transition", children: "Cancelar" }), _jsx("button", { onClick: handleSubmit, disabled: saving, className: "px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2", children: saving ? "Guardando..." : editingSupplier ? "Actualizar" : "Crear Proveedor" })] })] })] }) })), selectedSupplier && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-xl shadow-xl w-full max-w-lg", children: [_jsxs("div", { className: "border-b px-6 py-4 flex justify-between items-center", children: [_jsx("h2", { className: "text-xl font-bold", children: "Detalles del Proveedor" }), _jsx("button", { onClick: () => setSelectedSupplier(null), className: "text-gray-400 hover:text-gray-600", children: _jsx(X, { size: 24 }) })] }), _jsxs("div", { className: "p-6 space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-bold text-gray-800", children: selectedSupplier.name }), selectedSupplier.businessName && (_jsx("p", { className: "text-gray-500", children: selectedSupplier.businessName }))] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [selectedSupplier.taxId && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "RFC:" }), _jsx("p", { className: "font-medium", children: selectedSupplier.taxId })] })), selectedSupplier.contactName && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Contacto:" }), _jsx("p", { className: "font-medium", children: selectedSupplier.contactName })] })), selectedSupplier.phone && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Tel\u00E9fono:" }), _jsx("p", { className: "font-medium", children: selectedSupplier.phone })] })), selectedSupplier.email && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Email:" }), _jsx("p", { className: "font-medium", children: selectedSupplier.email })] })), selectedSupplier.city && (_jsxs("div", { className: "col-span-2", children: [_jsx("span", { className: "text-gray-500", children: "Ciudad:" }), _jsx("p", { className: "font-medium", children: [selectedSupplier.address, selectedSupplier.city].filter(Boolean).join(", ") })] })), selectedSupplier.deliveryTime !== undefined && selectedSupplier.deliveryTime > 0 && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Tiempo de entrega:" }), _jsxs("p", { className: "font-medium", children: [selectedSupplier.deliveryTime, " d\u00EDas"] })] })), selectedSupplier.paymentTerms && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Pago:" }), _jsxs("p", { className: "font-medium capitalize", children: [selectedSupplier.paymentTerms, selectedSupplier.creditDays ? ` - ${selectedSupplier.creditDays} días` : ""] })] }))] }), selectedSupplier.categories && selectedSupplier.categories.length > 0 && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-500 text-sm", children: "Categor\u00EDas que surte:" }), _jsx("div", { className: "flex flex-wrap gap-1 mt-1", children: selectedSupplier.categories.map((cat, i) => (_jsx("span", { className: "px-2 py-1 bg-blue-50 text-blue-600 rounded text-sm", children: cat }, i))) })] }))] })] }) }))] }));
};
export default SuppliersPage;
