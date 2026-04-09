import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useRef } from "react";
import { saleService, clientService, productService } from "../services/api";
import { ShoppingCart, Plus, Eye, X, Trash2, Search, User, Package, Edit2, Printer, Receipt } from "lucide-react";
import { printInvoice } from "../components/invoice/InvoiceGenerator";
import { printTicket } from "../utils/ticketPrinter";
const SalesPage = () => {
    const [sales, setSales] = useState([]);
    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingSale, setEditingSale] = useState(null);
    const [selectedSale, setSelectedSale] = useState(null);
    const [saving, setSaving] = useState(false);
    const [clientId, setClientId] = useState("");
    const [items, setItems] = useState([]);
    const [productSearch, setProductSearch] = useState("");
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [discount, setDiscount] = useState(0);
    const [notes, setNotes] = useState("");
    const productInputRef = useRef(null);
    const dropdownRef = useRef(null);
    useEffect(() => {
        fetchData();
    }, []);
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowProductDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const fetchData = async () => {
        try {
            setLoading(true);
            const [salesRes, clientsRes, productsRes] = await Promise.all([
                saleService.getAll(),
                clientService.getAll(),
                productService.getAll(),
            ]);
            setSales(salesRes.data.sales || []);
            setClients(clientsRes.data || []);
            setProducts(productsRes.data.map((p) => ({
                ...p,
                salePrice: p.salePrice || 0,
                costPrice: p.costPrice || 0,
                stock: p.stock || 0,
            })));
        }
        catch (err) {
            console.error("Error fetching data:", err);
        }
        finally {
            setLoading(false);
        }
    };
    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase())).filter(p => p.stock > 0).slice(0, 8);
    const addProduct = (product) => {
        if (product.stock <= 0) {
            alert("Producto sin stock disponible");
            return;
        }
        const existing = items.find(item => item.productId === product._id);
        if (existing) {
            if (existing.quantity >= product.stock) {
                alert("No hay suficiente stock");
                return;
            }
            setItems(items.map(item => item.productId === product._id
                ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unitPrice }
                : item));
        }
        else {
            setItems([...items, {
                    productId: product._id,
                    productName: product.name,
                    sku: product.sku,
                    quantity: 1,
                    unitPrice: product.salePrice,
                    costPrice: product.costPrice,
                    subtotal: product.salePrice,
                }]);
        }
        setProductSearch("");
        setShowProductDropdown(false);
        productInputRef.current?.focus();
    };
    const handleSkuSearch = (e) => {
        if (e.key === "Enter" && productSearch) {
            const exactMatch = products.find(p => p.sku.toLowerCase() === productSearch.toLowerCase() && p.stock > 0);
            if (exactMatch) {
                addProduct(exactMatch);
            }
        }
    };
    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeItem(productId);
            return;
        }
        const item = items.find(i => i.productId === productId);
        if (item && quantity > products.find(p => p._id === productId)?.stock) {
            alert("No hay suficiente stock");
            return;
        }
        setItems(items.map(item => item.productId === productId
            ? { ...item, quantity, subtotal: quantity * item.unitPrice }
            : item));
    };
    const removeItem = (productId) => {
        setItems(items.filter(item => item.productId !== productId));
    };
    const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
    const totalCost = items.reduce((acc, item) => acc + (item.costPrice * item.quantity), 0);
    const total = subtotal - discount;
    const profit = total - totalCost;
    const handleSubmit = async () => {
        if (items.length === 0) {
            alert("Agregue al menos un producto");
            return;
        }
        setSaving(true);
        try {
            const saleData = {
                items: items.map(item => ({
                    productId: item.productId,
                    productName: item.productName,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    subtotal: item.subtotal,
                })),
                subtotal,
                discount,
                total,
                paymentMethod,
                notes,
            };
            if (clientId) {
                saleData.clientId = clientId;
            }
            if (editingSale) {
                await saleService.update(editingSale._id, saleData);
                alert("¡Venta actualizada exitosamente!");
            }
            else {
                await saleService.create(saleData);
                alert("¡Venta registrada exitosamente!");
            }
            setShowForm(false);
            resetForm();
            fetchData();
            window.dispatchEvent(new Event('inventoryUpdate'));
        }
        catch (err) {
            alert(err.response?.data?.message || "Error al guardar venta");
        }
        finally {
            setSaving(false);
        }
    };
    const resetForm = () => {
        setClientId("");
        setItems([]);
        setPaymentMethod("cash");
        setDiscount(0);
        setNotes("");
        setEditingSale(null);
    };
    const openEditForm = (sale) => {
        setEditingSale(sale);
        setClientId(sale.client?._id || "");
        setItems(sale.items.map(item => ({
            productId: typeof item.product === 'object' ? item.product._id : item.productId,
            productName: item.productName,
            sku: item.sku || "",
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            costPrice: item.costPrice,
            subtotal: item.subtotal,
        })));
        setPaymentMethod(sale.paymentMethod);
        setDiscount(sale.discount);
        setNotes(sale.notes || "");
        setShowForm(true);
        setSelectedSale(null);
    };
    const getStatusBadge = (status) => {
        if (status === "completed")
            return "bg-green-100 text-green-800";
        if (status === "pending")
            return "bg-yellow-100 text-yellow-800";
        return "bg-red-100 text-red-800";
    };
    const getPaymentLabel = (method) => {
        const labels = {
            cash: "Efectivo",
            card: "Tarjeta",
            transfer: "Transferencia",
            credit: "Crédito",
        };
        return labels[method] || method;
    };
    if (loading) {
        return (_jsx("div", { className: "p-6 flex items-center justify-center min-h-screen", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" }) }));
    }
    return (_jsxs("div", { className: "p-6 space-y-6 bg-gray-50 min-h-screen", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-bold text-gray-800 flex items-center gap-2", children: [_jsx(ShoppingCart, { className: "text-blue-600", size: 28 }), "Ventas"] }), _jsxs("p", { className: "text-gray-500 text-sm", children: [sales.length, " ventas registradas"] })] }), _jsxs("button", { onClick: () => { resetForm(); setShowForm(true); }, className: "bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition", children: [_jsx(Plus, { size: 20 }), "Nueva Venta"] })] }), _jsx("div", { className: "bg-white rounded-xl shadow-md overflow-hidden", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { className: "text-left text-gray-500 text-sm", children: [_jsx("th", { className: "p-4", children: "Folio" }), _jsx("th", { className: "p-4", children: "Cliente" }), _jsx("th", { className: "p-4", children: "Total" }), _jsx("th", { className: "p-4", children: "Ganancia" }), _jsx("th", { className: "p-4", children: "M\u00E9todo" }), _jsx("th", { className: "p-4", children: "Fecha" }), _jsx("th", { className: "p-4", children: "Estado" }), _jsx("th", { className: "p-4", children: "Acciones" })] }) }), _jsxs("tbody", { children: [sales.map(sale => (_jsxs("tr", { className: "border-t hover:bg-gray-50", children: [_jsx("td", { className: "p-4 font-medium", children: sale.invoiceNumber }), _jsx("td", { className: "p-4", children: sale.client?.name || sale.clientName }), _jsxs("td", { className: "p-4 font-bold text-green-600", children: ["$", sale.total.toFixed(2)] }), _jsxs("td", { className: "p-4 text-blue-600", children: ["$", (sale.profit || 0).toFixed(2)] }), _jsx("td", { className: "p-4", children: getPaymentLabel(sale.paymentMethod) }), _jsx("td", { className: "p-4 text-gray-500", children: new Date(sale.createdAt).toLocaleDateString() }), _jsx("td", { className: "p-4", children: _jsx("span", { className: `px-2 py-1 rounded text-xs font-medium ${getStatusBadge(sale.status)}`, children: sale.status === "completed" ? "Completada" : sale.status === "pending" ? "Pendiente" : "Cancelada" }) }), _jsx("td", { className: "p-4", children: _jsxs("div", { className: "flex gap-2", children: [sale.status !== "cancelled" && (_jsx("button", { onClick: () => openEditForm(sale), className: "text-yellow-600 hover:text-yellow-800 p-1", title: "Editar", children: _jsx(Edit2, { size: 18 }) })), _jsx("button", { onClick: () => setSelectedSale(sale), className: "text-blue-600 hover:text-blue-800 p-1", children: _jsx(Eye, { size: 18 }) })] }) })] }, sale._id))), sales.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 8, className: "p-8 text-center text-gray-400", children: "No hay ventas registradas" }) }))] })] }) }), showForm && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col", children: [_jsxs("div", { className: "sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10", children: [_jsxs("h2", { className: "text-xl font-bold flex items-center gap-2", children: [_jsx(ShoppingCart, { size: 24, className: "text-blue-600" }), editingSale ? "Editar Venta" : "Nueva Venta"] }), _jsx("button", { onClick: () => setShowForm(false), className: "text-gray-400 hover:text-gray-600", children: _jsx(X, { size: 24 }) })] }), _jsxs("div", { className: "p-6 space-y-6 overflow-y-auto flex-1", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1", children: [_jsx(User, { size: 14 }), "Cliente"] }), _jsx("div", { className: "relative", children: _jsxs("select", { value: clientId, onChange: (e) => {
                                                            setClientId(e.target.value);
                                                        }, className: "w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 appearance-none bg-white", children: [_jsx("option", { value: "", children: "Consumidor Final (sin registro)" }), clients.map(c => (_jsxs("option", { value: c._id, children: [c.name, " ", c.phone ? `(${c.phone})` : ''] }, c._id)))] }) }), _jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Dejar vac\u00EDo para venta a consumidor final" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "M\u00E9todo de Pago" }), _jsxs("select", { value: paymentMethod, onChange: (e) => setPaymentMethod(e.target.value), className: "w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 bg-white", children: [_jsx("option", { value: "cash", children: "\uD83D\uDCB5 Efectivo" }), _jsx("option", { value: "card", children: "\uD83D\uDCB3 Tarjeta" }), _jsx("option", { value: "transfer", children: "\uD83C\uDFE6 Transferencia" }), _jsx("option", { value: "credit", children: "\uD83D\uDCCB Cr\u00E9dito/Fiado" })] })] })] }), _jsxs("div", { className: "relative", ref: dropdownRef, children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1", children: [_jsx(Package, { size: 14 }), "Buscar Producto"] }), _jsxs("div", { className: "relative", children: [_jsx(Search, { size: 18, className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" }), _jsx("input", { ref: productInputRef, type: "text", value: productSearch, onChange: (e) => {
                                                        setProductSearch(e.target.value);
                                                        setShowProductDropdown(true);
                                                    }, onFocus: () => setShowProductDropdown(true), onKeyDown: handleSkuSearch, placeholder: "Buscar por nombre, SKU o presionar Enter para buscar por c\u00F3digo...", className: "w-full border rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500" })] }), showProductDropdown && productSearch && (_jsx("div", { className: "absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-72 overflow-y-auto", children: filteredProducts.length > 0 ? (filteredProducts.map(p => (_jsx("button", { onClick: () => addProduct(p), className: "w-full text-left px-4 py-3 hover:bg-blue-50 border-b last:border-b-0 transition", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("span", { className: "font-semibold text-gray-800", children: p.name }), _jsxs("span", { className: "text-gray-400 text-sm ml-2", children: ["SKU: ", p.sku] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("span", { className: "text-green-600 font-bold", children: ["$", p.salePrice.toFixed(2)] }), _jsxs("span", { className: `block text-xs ${p.stock <= 5 ? 'text-red-500' : 'text-gray-400'}`, children: ["Stock: ", p.stock] })] })] }) }, p._id)))) : (_jsx("p", { className: "p-4 text-gray-400 text-center", children: products.some(p => p.sku.toLowerCase() === productSearch.toLowerCase())
                                                    ? "Producto sin stock"
                                                    : "No se encontraron productos" })) }))] }), items.length > 0 && (_jsx("div", { className: "border rounded-lg overflow-hidden", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-100", children: _jsxs("tr", { className: "text-left text-sm text-gray-600", children: [_jsx("th", { className: "p-3", children: "Producto" }), _jsx("th", { className: "p-3 w-24", children: "Cantidad" }), _jsx("th", { className: "p-3 w-28", children: "P. Unit." }), _jsx("th", { className: "p-3 w-28", children: "Subtotal" }), _jsx("th", { className: "p-3 w-12" })] }) }), _jsx("tbody", { children: items.map(item => (_jsxs("tr", { className: "border-t", children: [_jsxs("td", { className: "p-3", children: [_jsx("span", { className: "font-medium", children: item.productName }), _jsx("span", { className: "text-gray-400 text-xs block", children: item.sku })] }), _jsx("td", { className: "p-3", children: _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("button", { onClick: () => updateQuantity(item.productId, item.quantity - 1), className: "w-7 h-7 bg-gray-200 rounded hover:bg-gray-300 font-bold", children: "-" }), _jsx("input", { type: "number", min: "1", value: item.quantity, onChange: (e) => updateQuantity(item.productId, Number(e.target.value)), className: "w-14 border rounded px-2 py-1 text-center" }), _jsx("button", { onClick: () => updateQuantity(item.productId, item.quantity + 1), className: "w-7 h-7 bg-gray-200 rounded hover:bg-gray-300 font-bold", children: "+" })] }) }), _jsxs("td", { className: "p-3", children: ["$", item.unitPrice.toFixed(2)] }), _jsxs("td", { className: "p-3 font-medium", children: ["$", item.subtotal.toFixed(2)] }), _jsx("td", { className: "p-3", children: _jsx("button", { onClick: () => removeItem(item.productId), className: "text-red-500 hover:text-red-700 p-1", children: _jsx(Trash2, { size: 16 }) }) })] }, item.productId))) })] }) })), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4 space-y-3", children: [_jsxs("div", { className: "flex justify-between text-gray-600", children: [_jsx("span", { children: "Subtotal:" }), _jsxs("span", { className: "font-medium", children: ["$", subtotal.toFixed(2)] })] }), _jsxs("div", { className: "flex justify-between items-center text-gray-600", children: [_jsx("span", { children: "Descuento:" }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("span", { className: "text-gray-500", children: "$" }), _jsx("input", { type: "number", min: "0", step: "1", value: discount, onChange: (e) => setDiscount(Number(e.target.value)), className: "w-24 border rounded px-2 py-1 text-right", placeholder: "0" })] })] }), _jsxs("div", { className: "flex justify-between text-lg font-bold border-t pt-3", children: [_jsx("span", { children: "Total:" }), _jsxs("span", { className: "text-green-600", children: ["$", total.toFixed(2)] })] }), items.length > 0 && (_jsxs("div", { className: "flex justify-between text-sm text-blue-600 border-t pt-2", children: [_jsx("span", { children: "Ganancia estimada:" }), _jsxs("span", { className: "font-medium", children: ["$", profit.toFixed(2)] })] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Notas / Observaciones" }), _jsx("textarea", { value: notes, onChange: (e) => setNotes(e.target.value), rows: 2, placeholder: "Observaciones adicionales...", className: "w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 resize-none" })] })] }), _jsxs("div", { className: "flex justify-end gap-3 p-6 border-t bg-gray-50", children: [_jsx("button", { onClick: () => setShowForm(false), className: "px-6 py-2.5 border rounded-lg hover:bg-gray-100 transition", children: "Cancelar" }), _jsx("button", { onClick: handleSubmit, disabled: saving || items.length === 0, className: "px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2", children: saving ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" }), "Procesando..."] })) : (_jsxs(_Fragment, { children: [_jsx(ShoppingCart, { size: 18 }), editingSale ? "Actualizar Venta" : "Completar Venta"] })) })] })] }) })), selectedSale && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col", children: [_jsxs("div", { className: "border-b px-4 py-3 flex justify-between items-center bg-gray-50", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold", children: selectedSale.invoiceNumber }), _jsx("span", { className: "text-gray-500 text-sm", children: new Date(selectedSale.createdAt).toLocaleDateString() })] }), _jsx("button", { onClick: () => setSelectedSale(null), className: "text-gray-400 hover:text-gray-600", children: _jsx(X, { size: 20 }) })] }), _jsxs("div", { className: "flex-1 overflow-y-auto p-4", children: [_jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500", children: "Cliente" }), _jsx("p", { className: "font-semibold", children: selectedSale.client?.name || selectedSale.clientName })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-xs text-gray-500", children: "M\u00E9todo" }), _jsx("p", { className: "font-medium", children: getPaymentLabel(selectedSale.paymentMethod) })] })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-3 mb-4", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Subtotal" }), _jsxs("span", { children: ["$", selectedSale.subtotal.toFixed(2)] })] }), selectedSale.discount > 0 && (_jsxs("div", { className: "flex justify-between items-center mb-2 text-red-500", children: [_jsx("span", { className: "text-sm", children: "Descuento" }), _jsxs("span", { children: ["-$", selectedSale.discount.toFixed(2)] })] })), _jsxs("div", { className: "flex justify-between items-center pt-2 border-t font-bold text-lg", children: [_jsx("span", { children: "Total" }), _jsxs("span", { className: "text-green-600", children: ["$", selectedSale.total.toFixed(2)] })] }), _jsxs("div", { className: "flex justify-between items-center text-sm text-blue-600 mt-1", children: [_jsx("span", { children: "Ganancia" }), _jsxs("span", { children: ["$", (selectedSale.profit || 0).toFixed(2)] })] })] }), _jsxs("div", { className: "mb-4", children: [_jsxs("p", { className: "text-xs text-gray-500 mb-2", children: ["Productos (", selectedSale.items.length, ")"] }), _jsx("div", { className: "space-y-2", children: selectedSale.items.map((item, i) => (_jsxs("div", { className: "flex justify-between items-center text-sm bg-white border rounded-lg p-2", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: item.productName }), _jsxs("p", { className: "text-xs text-gray-400", children: [item.quantity, " x $", item.unitPrice] })] }), _jsxs("span", { className: "font-semibold", children: ["$", item.subtotal.toFixed(2)] })] }, i))) })] }), selectedSale.notes && (_jsxs("div", { className: "mb-4 p-2 bg-yellow-50 rounded border border-yellow-200", children: [_jsx("p", { className: "text-xs text-yellow-600", children: "Nota:" }), _jsx("p", { className: "text-sm", children: selectedSale.notes })] })), selectedSale.createdBy && (_jsxs("p", { className: "text-xs text-gray-400 mb-4", children: ["Vendido por: ", selectedSale.createdBy.name] })), selectedSale.status === "cancelled" && (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-3 text-center text-red-600 font-medium", children: "Esta venta est\u00E1 cancelada" }))] }), _jsxs("div", { className: "border-t p-3 flex flex-wrap gap-2 justify-center", children: [_jsxs("button", { onClick: () => printInvoice(selectedSale), className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm", children: [_jsx(Printer, { size: 16 }), "Factura"] }), _jsxs("button", { onClick: () => printTicket(selectedSale), className: "px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-sm", children: [_jsx(Receipt, { size: 16 }), "Ticket"] }), selectedSale.status !== "cancelled" && (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: () => openEditForm(selectedSale), className: "px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition flex items-center gap-2 text-sm", children: [_jsx(Edit2, { size: 16 }), "Editar"] }), _jsxs("button", { onClick: async () => {
                                                if (!confirm(`¿Cancelar venta ${selectedSale.invoiceNumber}?`))
                                                    return;
                                                try {
                                                    await saleService.cancel(selectedSale._id);
                                                    setSelectedSale(null);
                                                    fetchData();
                                                    window.dispatchEvent(new Event('inventoryUpdate'));
                                                }
                                                catch (err) {
                                                    alert(err.response?.data?.message || "Error al cancelar venta");
                                                }
                                            }, className: "px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2 text-sm", children: [_jsx(X, { size: 16 }), "Cancelar"] })] }))] })] }) }))] }));
};
export default SalesPage;
