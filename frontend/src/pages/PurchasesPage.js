import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useRef } from "react";
import { purchaseService, productService, supplierService, categoryService } from "../services/api";
import { Package, Plus, Search, Eye, X, Trash2, CheckCircle, Clock, Truck, DollarSign } from "lucide-react";
import { format } from "date-fns";
const PurchasesPage = () => {
    const [purchases, setPurchases] = useState([]);
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [saving, setSaving] = useState(false);
    const [supplierId, setSupplierId] = useState("");
    const [items, setItems] = useState([]);
    const [productSearch, setProductSearch] = useState("");
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("credit");
    const [tax, setTax] = useState(0);
    const [notes, setNotes] = useState("");
    const [error, setError] = useState("");
    const [showQuickProductModal, setShowQuickProductModal] = useState(false);
    const [quickProductData, setQuickProductData] = useState({
        name: "",
        description: "",
        sku: "",
        categoryId: "",
        cost: 0,
        salePrice: 0,
        initialStock: 1,
    });
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
            const [purchasesRes, productsRes, suppliersRes, categoriesRes] = await Promise.all([
                purchaseService.getAll(),
                productService.getAll(),
                supplierService.getAll(),
                categoryService.getAll(),
            ]);
            setPurchases(purchasesRes.data.purchases || []);
            setProducts(productsRes.data || []);
            setSuppliers(suppliersRes.data || []);
            setCategories(categoriesRes.data || []);
        }
        catch (err) {
            console.error("Error fetching data:", err);
        }
        finally {
            setLoading(false);
        }
    };
    const openQuickProductModal = () => {
        setQuickProductData({
            name: productSearch,
            description: "",
            sku: "",
            categoryId: "",
            cost: 0,
            salePrice: 0,
            initialStock: 1,
        });
        setShowQuickProductModal(true);
        setShowProductDropdown(false);
    };
    const handleQuickCreateProduct = (e) => {
        e.preventDefault();
        if (!quickProductData.name) {
            alert("El nombre del producto es obligatorio");
            return;
        }
        const newProductId = `new-${Date.now()}`;
        const newItem = {
            product: newProductId,
            productId: newProductId,
            productName: quickProductData.name,
            description: quickProductData.description,
            isNewProduct: true,
            sku: quickProductData.sku || `SKU-TEMP-${Date.now()}`,
            categoryId: quickProductData.categoryId || undefined,
            quantity: quickProductData.initialStock || 1,
            unitCost: quickProductData.cost,
            salePrice: quickProductData.salePrice || quickProductData.cost * 1.3,
            subtotal: (quickProductData.initialStock || 1) * quickProductData.cost,
        };
        setItems([...items, newItem]);
        setShowQuickProductModal(false);
        setProductSearch("");
        setShowProductDropdown(false);
        setQuickProductData({
            name: "",
            description: "",
            sku: "",
            categoryId: "",
            cost: 0,
            salePrice: 0,
            initialStock: 1,
        });
        productInputRef.current?.focus();
    };
    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase())).slice(0, 8);
    const addProduct = (product) => {
        const existing = items.find(item => (item.productId || item.product) === product._id);
        if (existing) {
            setItems(items.map(item => (item.productId || item.product) === product._id
                ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unitCost }
                : item));
        }
        else {
            setItems([...items, {
                    product: product._id,
                    productId: product._id,
                    productName: product.name,
                    quantity: 1,
                    unitCost: product.costPrice || 0,
                    subtotal: product.costPrice || 0,
                }]);
        }
        setProductSearch("");
        setShowProductDropdown(false);
        productInputRef.current?.focus();
    };
    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            setItems(items.filter(item => item.productId !== productId));
            return;
        }
        setItems(items.map(item => item.productId === productId
            ? { ...item, quantity, subtotal: quantity * item.unitCost }
            : item));
    };
    const updateUnitCost = (productId, unitCost) => {
        setItems(items.map(item => item.productId === productId
            ? { ...item, unitCost, subtotal: item.quantity * unitCost }
            : item));
    };
    const removeItem = (productId) => {
        setItems(items.filter(item => item.productId !== productId));
    };
    const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
    const total = subtotal + tax;
    const handleSubmit = async () => {
        if (items.length === 0) {
            setError("Agregue al menos un producto");
            return;
        }
        setSaving(true);
        setError("");
        try {
            await purchaseService.create({
                supplierId: supplierId || null,
                items: items.map(item => ({
                    productId: item.productId || item.product,
                    productName: item.productName,
                    description: item.description || '',
                    sku: item.sku || '',
                    categoryId: item.categoryId || null,
                    quantity: item.quantity,
                    unitCost: item.unitCost,
                    salePrice: item.salePrice || 0,
                })),
                subtotal,
                tax,
                total,
                paymentMethod,
                notes,
            });
            setShowForm(false);
            resetForm();
            fetchData();
            alert("¡Orden de compra creada exitosamente!");
        }
        catch (err) {
            setError(err.response?.data?.message || "Error al crear orden");
        }
        finally {
            setSaving(false);
        }
    };
    const resetForm = () => {
        setSupplierId("");
        setItems([]);
        setPaymentMethod("credit");
        setTax(0);
        setNotes("");
        setError("");
    };
    const handleReceive = async (purchase) => {
        if (!confirm(`¿Confirmar recepción de ${purchase.purchaseNumber}?\n\nSe会增加 el stock de ${purchase.items.length} productos.`))
            return;
        try {
            const res = await purchaseService.receive(purchase._id);
            fetchData();
            setSelectedPurchase(null);
            window.dispatchEvent(new Event('inventoryUpdate'));
            alert(res.data?.message || "¡Mercancía recibida y stock actualizado!");
        }
        catch (err) {
            alert(err.response?.data?.message || "Error al recibir mercancía");
        }
    };
    const handleCancel = async (purchase) => {
        if (!confirm(`¿Cancelar orden ${purchase.purchaseNumber}?`))
            return;
        try {
            await purchaseService.cancel(purchase._id);
            fetchData();
            setSelectedPurchase(null);
            alert("Orden cancelada");
        }
        catch (err) {
            alert(err.response?.data?.message || "Error al cancelar orden");
        }
    };
    const getStatusBadge = (status) => {
        if (status === "received")
            return "bg-green-100 text-green-800";
        if (status === "pending")
            return "bg-yellow-100 text-yellow-800";
        return "bg-red-100 text-red-800";
    };
    const getStatusLabel = (status) => {
        if (status === "received")
            return "Recibida";
        if (status === "pending")
            return "Pendiente";
        return "Cancelada";
    };
    if (loading) {
        return (_jsx("div", { className: "p-6 flex items-center justify-center min-h-screen", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" }) }));
    }
    const pendingCount = purchases.filter(p => p.status === "pending").length;
    const receivedCount = purchases.filter(p => p.status === "received").length;
    return (_jsxs("div", { className: "p-6 space-y-6 bg-gray-50 min-h-screen", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-bold text-gray-800 flex items-center gap-2", children: [_jsx(Truck, { className: "text-blue-600", size: 28 }), "\u00D3rdenes de Compra"] }), _jsxs("p", { className: "text-gray-500 text-sm", children: [purchases.length, " \u00F3rdenes registradas"] })] }), _jsxs("button", { onClick: () => { resetForm(); setShowForm(true); }, className: "bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition", children: [_jsx(Plus, { size: 20 }), "Nueva Orden"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx("div", { className: "bg-white p-5 rounded-xl shadow-md border-l-4 border-yellow-500", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Clock, { className: "text-yellow-500", size: 28 }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-500 text-sm", children: "Pendientes" }), _jsx("p", { className: "text-2xl font-bold", children: pendingCount })] })] }) }), _jsx("div", { className: "bg-white p-5 rounded-xl shadow-md border-l-4 border-green-500", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(CheckCircle, { className: "text-green-500", size: 28 }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-500 text-sm", children: "Recibidas" }), _jsx("p", { className: "text-2xl font-bold", children: receivedCount })] })] }) }), _jsx("div", { className: "bg-white p-5 rounded-xl shadow-md border-l-4 border-blue-500", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(DollarSign, { className: "text-blue-500", size: 28 }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-500 text-sm", children: "Total Compras" }), _jsxs("p", { className: "text-2xl font-bold", children: ["$", purchases.filter(p => p.status === "received").reduce((acc, p) => acc + p.total, 0).toFixed(2)] })] })] }) })] }), _jsx("div", { className: "bg-white rounded-xl shadow-md overflow-hidden", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { className: "text-left text-gray-500 text-sm", children: [_jsx("th", { className: "p-4", children: "Orden" }), _jsx("th", { className: "p-4", children: "Proveedor" }), _jsx("th", { className: "p-4", children: "Productos" }), _jsx("th", { className: "p-4 text-right", children: "Total" }), _jsx("th", { className: "p-4", children: "Estado" }), _jsx("th", { className: "p-4", children: "Fecha" }), _jsx("th", { className: "p-4", children: "Acciones" })] }) }), _jsxs("tbody", { children: [purchases.map(purchase => (_jsxs("tr", { className: "border-t hover:bg-gray-50", children: [_jsx("td", { className: "p-4 font-medium", children: purchase.purchaseNumber }), _jsx("td", { className: "p-4", children: purchase.supplier?.name || purchase.supplierName }), _jsxs("td", { className: "p-4", children: [purchase.items.length, " prod."] }), _jsxs("td", { className: "p-4 text-right font-bold text-blue-600", children: ["$", purchase.total.toFixed(2)] }), _jsx("td", { className: "p-4", children: _jsx("span", { className: `px-2 py-1 rounded text-xs font-medium ${getStatusBadge(purchase.status)}`, children: getStatusLabel(purchase.status) }) }), _jsx("td", { className: "p-4 text-gray-500", children: format(new Date(purchase.createdAt), 'dd/MM/yyyy') }), _jsx("td", { className: "p-4", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => setSelectedPurchase(purchase), className: "text-blue-600 hover:text-blue-800 p-1", children: _jsx(Eye, { size: 18 }) }), purchase.status === "pending" && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => handleReceive(purchase), className: "text-green-600 hover:text-green-800 p-1", title: "Recibir mercanc\u00EDa", children: _jsx(CheckCircle, { size: 18 }) }), _jsx("button", { onClick: () => handleCancel(purchase), className: "text-red-600 hover:text-red-800 p-1", title: "Cancelar", children: _jsx(X, { size: 18 }) })] }))] }) })] }, purchase._id))), purchases.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "p-8 text-center text-gray-400", children: "No hay \u00F3rdenes de compra" }) }))] })] }) }), showForm && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col", children: [_jsxs("div", { className: "sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10", children: [_jsxs("h2", { className: "text-xl font-bold flex items-center gap-2", children: [_jsx(Truck, { size: 24, className: "text-blue-600" }), "Nueva Orden de Compra"] }), _jsx("button", { onClick: () => setShowForm(false), className: "text-gray-400 hover:text-gray-600", children: _jsx(X, { size: 24 }) })] }), _jsxs("div", { className: "p-6 space-y-6 overflow-y-auto flex-1", children: [error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg", children: error })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Proveedor" }), _jsxs("select", { value: supplierId, onChange: (e) => setSupplierId(e.target.value), className: "w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 bg-white", children: [_jsx("option", { value: "", children: "Seleccionar proveedor" }), suppliers.map(s => (_jsxs("option", { value: s._id, children: [s.name, " ", s.phone ? `(${s.phone})` : ''] }, s._id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "M\u00E9todo de Pago" }), _jsxs("select", { value: paymentMethod, onChange: (e) => setPaymentMethod(e.target.value), className: "w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 bg-white", children: [_jsx("option", { value: "credit", children: "Cr\u00E9dito" }), _jsx("option", { value: "cash", children: "Efectivo" }), _jsx("option", { value: "transfer", children: "Transferencia" })] })] })] }), _jsxs("div", { className: "relative", ref: dropdownRef, children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1", children: [_jsx(Package, { size: 14 }), "Agregar Producto"] }), _jsxs("div", { className: "relative", children: [_jsx(Search, { size: 18, className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" }), _jsx("input", { ref: productInputRef, type: "text", value: productSearch, onChange: (e) => {
                                                        setProductSearch(e.target.value);
                                                        setShowProductDropdown(true);
                                                    }, onFocus: () => setShowProductDropdown(true), placeholder: "Buscar producto por nombre o SKU...", className: "w-full border rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500" })] }), showProductDropdown && productSearch && (_jsx("div", { className: "absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-72 overflow-y-auto", children: filteredProducts.length > 0 ? (filteredProducts.map(p => (_jsx("button", { onClick: () => addProduct(p), className: "w-full text-left px-4 py-3 hover:bg-blue-50 border-b last:border-b-0 transition", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("span", { className: "font-semibold text-gray-800", children: p.name }), _jsxs("span", { className: "text-gray-400 text-sm ml-2", children: ["SKU: ", p.sku] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("span", { className: "text-gray-600", children: ["Stock: ", p.stock] }), _jsxs("span", { className: "text-blue-600 text-sm block", children: ["Costo: $", p.costPrice.toFixed(2)] })] })] }) }, p._id)))) : (_jsxs("div", { className: "p-4", children: [_jsx("p", { className: "text-gray-400 text-center mb-3", children: "No se encontraron productos" }), _jsxs("button", { onClick: openQuickProductModal, className: "w-full bg-green-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition", children: [_jsx(Plus, { size: 18 }), "Crear nuevo producto"] })] })) }))] }), items.length > 0 && (_jsx("div", { className: "border rounded-lg overflow-hidden", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-100", children: _jsxs("tr", { className: "text-left text-sm text-gray-600", children: [_jsx("th", { className: "p-3", children: "Producto" }), _jsx("th", { className: "p-3 w-24", children: "Cantidad" }), _jsx("th", { className: "p-3 w-32", children: "Costo Unit." }), _jsx("th", { className: "p-3 w-28", children: "Subtotal" }), _jsx("th", { className: "p-3 w-12" })] }) }), _jsx("tbody", { children: items.map((item, idx) => (_jsxs("tr", { className: "border-t", children: [_jsx("td", { className: "p-3 font-medium", children: item.productName }), _jsx("td", { className: "p-3", children: _jsx("input", { type: "number", min: "1", value: item.quantity, onChange: (e) => updateQuantity(item.productId, Number(e.target.value)), className: "w-full border rounded px-2 py-1" }) }), _jsx("td", { className: "p-3", children: _jsx("input", { type: "number", min: "0", step: "0.01", value: item.unitCost, onChange: (e) => updateUnitCost(item.productId, Number(e.target.value)), className: "w-full border rounded px-2 py-1" }) }), _jsxs("td", { className: "p-3 font-medium", children: ["$", item.subtotal.toFixed(2)] }), _jsx("td", { className: "p-3", children: _jsx("button", { onClick: () => removeItem(item.productId), className: "text-red-500 hover:text-red-700", children: _jsx(Trash2, { size: 16 }) }) })] }, idx))) })] }) })), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4 space-y-3", children: [_jsxs("div", { className: "flex justify-between text-gray-600", children: [_jsx("span", { children: "Subtotal:" }), _jsxs("span", { className: "font-medium", children: ["$", subtotal.toFixed(2)] })] }), _jsxs("div", { className: "flex justify-between items-center text-gray-600", children: [_jsx("span", { children: "Impuestos:" }), _jsx("input", { type: "number", min: "0", step: "0.01", value: tax, onChange: (e) => setTax(Number(e.target.value)), className: "w-32 border rounded px-2 py-1 text-right" })] }), _jsxs("div", { className: "flex justify-between text-lg font-bold border-t pt-3", children: [_jsx("span", { children: "Total:" }), _jsxs("span", { className: "text-blue-600", children: ["$", total.toFixed(2)] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Notas" }), _jsx("textarea", { value: notes, onChange: (e) => setNotes(e.target.value), rows: 2, placeholder: "Notas adicionales...", className: "w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 resize-none" })] })] }), _jsxs("div", { className: "flex justify-end gap-3 p-6 border-t bg-gray-50", children: [_jsx("button", { onClick: () => setShowForm(false), className: "px-6 py-2.5 border rounded-lg hover:bg-gray-100 transition", children: "Cancelar" }), _jsx("button", { onClick: handleSubmit, disabled: saving || items.length === 0, className: "px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition", children: saving ? "Guardando..." : "Crear Orden de Compra" })] })] }) })), selectedPurchase && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-xl shadow-xl w-full max-w-lg", children: [_jsxs("div", { className: "border-b px-6 py-4 flex justify-between items-center", children: [_jsxs("h2", { className: "text-xl font-bold flex items-center gap-2", children: [_jsx(Eye, { size: 20 }), "Detalle de Orden"] }), _jsx("button", { onClick: () => setSelectedPurchase(null), className: "text-gray-400 hover:text-gray-600", children: _jsx(X, { size: 24 }) })] }), _jsxs("div", { className: "p-6 space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-500 text-sm block", children: "Orden:" }), _jsx("span", { className: "font-semibold", children: selectedPurchase.purchaseNumber })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500 text-sm block", children: "Fecha:" }), _jsx("span", { className: "font-medium", children: format(new Date(selectedPurchase.createdAt), 'dd/MM/yyyy HH:mm') })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500 text-sm block", children: "Proveedor:" }), _jsx("span", { className: "font-medium", children: selectedPurchase.supplier?.name || selectedPurchase.supplierName })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500 text-sm block", children: "Estado:" }), _jsx("span", { className: `px-2 py-1 rounded text-xs font-medium ${getStatusBadge(selectedPurchase.status)}`, children: getStatusLabel(selectedPurchase.status) })] })] }), _jsxs("div", { className: "border-t pt-4", children: [_jsx("h3", { className: "font-medium mb-2 text-gray-700", children: "Productos" }), _jsx("div", { className: "space-y-2", children: selectedPurchase.items.map((item, i) => (_jsxs("div", { className: "flex justify-between items-center py-2 border-b last:border-b-0", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: item.productName }), _jsxs("span", { className: "text-gray-400 text-sm ml-2", children: ["x", item.quantity] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("span", { className: "font-medium", children: ["$", item.subtotal.toFixed(2)] }), _jsxs("span", { className: "text-gray-400 text-xs block", children: ["P.U. $", item.unitCost] })] })] }, i))) })] }), _jsxs("div", { className: "border-t pt-4 space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Subtotal:" }), _jsxs("span", { children: ["$", selectedPurchase.subtotal.toFixed(2)] })] }), selectedPurchase.tax > 0 && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Impuestos:" }), _jsxs("span", { children: ["$", selectedPurchase.tax.toFixed(2)] })] })), _jsxs("div", { className: "flex justify-between font-bold text-lg border-t pt-2", children: [_jsx("span", { children: "Total:" }), _jsxs("span", { className: "text-blue-600", children: ["$", selectedPurchase.total.toFixed(2)] })] })] }), selectedPurchase.notes && (_jsxs("div", { className: "border-t pt-4", children: [_jsx("span", { className: "text-gray-500 text-sm block", children: "Notas:" }), _jsx("span", { className: "text-gray-700", children: selectedPurchase.notes })] })), selectedPurchase.status === "pending" && (_jsxs("div", { className: "border-t pt-4 flex justify-between gap-3", children: [_jsxs("button", { onClick: () => handleCancel(selectedPurchase), className: "px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2", children: [_jsx(X, { size: 16 }), "Cancelar"] }), _jsxs("button", { onClick: () => handleReceive(selectedPurchase), className: "px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-2", children: [_jsx(CheckCircle, { size: 16 }), "Recibir Mercanc\u00EDa"] })] })), selectedPurchase.status === "received" && selectedPurchase.receivedDate && (_jsxs("div", { className: "border-t pt-4 text-green-600 text-sm", children: ["\u2713 Recibida el ", format(new Date(selectedPurchase.receivedDate), 'dd/MM/yyyy HH:mm')] }))] })] }) })), showQuickProductModal && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col", children: [_jsxs("div", { className: "p-3 border-b flex justify-between items-center bg-green-50", children: [_jsxs("h3", { className: "font-bold text-green-800 flex items-center gap-2 text-sm", children: [_jsx(Package, { size: 18 }), "Crear Nuevo Producto"] }), _jsx("button", { onClick: () => setShowQuickProductModal(false), className: "text-gray-500 hover:text-gray-700", children: _jsx(X, { size: 20 }) })] }), _jsxs("form", { onSubmit: handleQuickCreateProduct, className: "p-3 space-y-3 overflow-y-auto flex-1", children: [_jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: "Nombre *" }), _jsx("input", { type: "text", value: quickProductData.name, onChange: (e) => setQuickProductData({ ...quickProductData, name: e.target.value }), className: "w-full border rounded px-2 py-1.5 text-sm", placeholder: "Nombre del producto", required: true, autoFocus: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: "Categor\u00EDa" }), _jsxs("select", { value: quickProductData.categoryId, onChange: (e) => setQuickProductData({ ...quickProductData, categoryId: e.target.value }), className: "w-full border rounded px-2 py-1.5 text-sm bg-white", children: [_jsx("option", { value: "", children: "Sin categor\u00EDa" }), categories.map(cat => (_jsx("option", { value: cat._id, children: cat.name }, cat._id)))] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: "Descripci\u00F3n / Detalle" }), _jsx("input", { type: "text", value: quickProductData.description, onChange: (e) => setQuickProductData({ ...quickProductData, description: e.target.value }), className: "w-full border rounded px-2 py-1.5 text-sm", placeholder: "Ej: iPhone 16 Pro Max 256GB Azul" })] }), _jsxs("div", { className: "grid grid-cols-3 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: "SKU" }), _jsx("input", { type: "text", value: quickProductData.sku, onChange: (e) => setQuickProductData({ ...quickProductData, sku: e.target.value }), className: "w-full border rounded px-2 py-1.5 text-sm", placeholder: "C\u00F3digo" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: "Costo" }), _jsx("input", { type: "number", min: "0", step: "1", value: quickProductData.cost, onChange: (e) => setQuickProductData({ ...quickProductData, cost: Number(e.target.value) }), className: "w-full border rounded px-2 py-1.5 text-sm", placeholder: "0" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: "Venta" }), _jsx("input", { type: "number", min: "0", step: "1", value: quickProductData.salePrice, onChange: (e) => setQuickProductData({ ...quickProductData, salePrice: Number(e.target.value) }), className: "w-full border rounded px-2 py-1.5 text-sm", placeholder: "0" })] })] }), _jsxs("div", { className: "flex gap-3 pt-2", children: [_jsx("button", { type: "button", onClick: () => setShowQuickProductModal(false), className: "flex-1 bg-gray-200 py-2 rounded text-sm hover:bg-gray-300", children: "Cancelar" }), _jsxs("button", { type: "submit", className: "flex-1 bg-green-600 text-white py-2 rounded text-sm hover:bg-green-700 flex items-center justify-center gap-1", children: [_jsx(Plus, { size: 16 }), "Agregar a Orden"] })] })] })] }) }))] }));
};
export default PurchasesPage;
