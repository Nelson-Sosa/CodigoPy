import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { clientService } from "../services/api";
import { Users, Plus, Search, Edit2, Trash2, X, Phone, Mail, MapPin, FileText } from "lucide-react";
const ClientsPage = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
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
            setClients(res.data.map((c) => ({ ...c, id: c._id })));
        }
        catch (err) {
            console.error("Error fetching clients:", err);
        }
        finally {
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
    const openEditForm = (client) => {
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
            }
            else {
                await clientService.create(clientData);
            }
            setShowForm(false);
            resetForm();
            fetchClients();
        }
        catch (err) {
            setError(err.response?.data?.message || "Error al guardar cliente");
        }
        finally {
            setSaving(false);
        }
    };
    const handleDelete = async (client) => {
        if (!confirm(`¿Eliminar cliente "${client.name}"?`))
            return;
        try {
            await clientService.delete(client._id);
            fetchClients();
        }
        catch (err) {
            alert(err.response?.data?.message || "Error al eliminar cliente");
        }
    };
    if (loading && clients.length === 0) {
        return (_jsx("div", { className: "p-6 flex items-center justify-center min-h-screen", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" }) }));
    }
    return (_jsxs("div", { className: "p-6 space-y-6 bg-gray-50 min-h-screen", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-bold text-gray-800 flex items-center gap-2", children: [_jsx(Users, { className: "text-blue-600", size: 28 }), "Clientes"] }), _jsxs("p", { className: "text-gray-500 text-sm", children: [clients.length, " clientes registrados"] })] }), _jsxs("button", { onClick: openNewForm, className: "bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition", children: [_jsx(Plus, { size: 20 }), "Nuevo Cliente"] })] }), _jsx("div", { className: "bg-white rounded-xl shadow-md p-4", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { size: 18, className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" }), _jsx("input", { type: "text", value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Buscar por nombre, tel\u00E9fono, email o RUC...", className: "w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" })] }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [clients.map((client) => (_jsxs("div", { className: "bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition", children: [_jsxs("div", { className: "flex justify-between items-start mb-3", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-bold text-lg text-gray-800", children: client.name }), client.ruc && (_jsxs("p", { className: "text-gray-400 text-sm", children: ["RUC: ", client.ruc] }))] }), _jsxs("div", { className: "flex gap-1", children: [_jsx("button", { onClick: () => openEditForm(client), className: "p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition", children: _jsx(Edit2, { size: 16 }) }), _jsx("button", { onClick: () => handleDelete(client), className: "p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition", children: _jsx(Trash2, { size: 16 }) })] })] }), _jsxs("div", { className: "space-y-2 text-sm", children: [client.phone && (_jsxs("div", { className: "flex items-center gap-2 text-gray-600", children: [_jsx(Phone, { size: 14 }), _jsx("span", { children: client.phone })] })), client.email && (_jsxs("div", { className: "flex items-center gap-2 text-gray-600", children: [_jsx(Mail, { size: 14 }), _jsx("span", { className: "truncate", children: client.email })] })), (client.address || client.city) && (_jsxs("div", { className: "flex items-center gap-2 text-gray-600", children: [_jsx(MapPin, { size: 14 }), _jsx("span", { className: "truncate", children: [client.address, client.city].filter(Boolean).join(", ") })] }))] }), _jsxs("div", { className: "mt-4 pt-3 border-t flex justify-between text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-400", children: "Compras:" }), _jsx("span", { className: "font-medium ml-1", children: client.totalPurchases || 0 })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-400", children: "Total:" }), _jsxs("span", { className: "font-medium text-green-600 ml-1", children: ["$", (client.totalSpent || 0).toFixed(2)] })] })] })] }, client._id))), clients.length === 0 && (_jsxs("div", { className: "col-span-full text-center py-12 text-gray-400", children: [_jsx(Users, { size: 48, className: "mx-auto mb-3 opacity-50" }), _jsx("p", { children: search ? "No se encontraron clientes" : "No hay clientes registrados" })] }))] }), showForm && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center", children: [_jsxs("h2", { className: "text-xl font-bold flex items-center gap-2", children: [_jsx(Users, { size: 24, className: "text-blue-600" }), editingClient ? "Editar Cliente" : "Nuevo Cliente"] }), _jsx("button", { onClick: () => { setShowForm(false); resetForm(); }, className: "text-gray-400 hover:text-gray-600", children: _jsx(X, { size: 24 }) })] }), _jsxs("div", { className: "p-6 space-y-4", children: [error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg", children: error })), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["Nombre ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "text", value: name, onChange: (e) => setName(e.target.value), placeholder: "Nombre completo o raz\u00F3n social", className: "w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "RUC / C\u00E9dula" }), _jsx("input", { type: "text", value: ruc, onChange: (e) => setRuc(e.target.value), placeholder: "Identificaci\u00F3n fiscal", className: "w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Tel\u00E9fono" }), _jsx("input", { type: "tel", value: phone, onChange: (e) => setPhone(e.target.value), placeholder: "Ej: 0991234567", className: "w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Email" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "correo@ejemplo.com", className: "w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Direcci\u00F3n" }), _jsx("input", { type: "text", value: address, onChange: (e) => setAddress(e.target.value), placeholder: "Direcci\u00F3n principal", className: "w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Ciudad" }), _jsx("input", { type: "text", value: city, onChange: (e) => setCity(e.target.value), placeholder: "Ciudad de residencia", className: "w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1", children: [_jsx(FileText, { size: 14 }), "Notas"] }), _jsx("textarea", { value: notes, onChange: (e) => setNotes(e.target.value), rows: 2, placeholder: "Notas adicionales sobre el cliente...", className: "w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 resize-none" })] })] }), _jsxs("div", { className: "flex justify-end gap-3 p-6 border-t bg-gray-50", children: [_jsx("button", { onClick: () => { setShowForm(false); resetForm(); }, className: "px-6 py-2.5 border rounded-lg hover:bg-gray-100 transition", children: "Cancelar" }), _jsx("button", { onClick: handleSubmit, disabled: saving, className: "px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition", children: saving ? "Guardando..." : editingClient ? "Actualizar" : "Guardar Cliente" })] })] }) }))] }));
};
export default ClientsPage;
