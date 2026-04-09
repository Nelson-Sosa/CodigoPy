import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { productService } from "../../services/api";
import { Package, Tag, Info, PackagePlus, Pencil, ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [adjustQty, setAdjustQty] = useState("");
    const [reason, setReason] = useState("");
    useEffect(() => {
        const fetchData = async () => {
            if (!id)
                return;
            try {
                const res = await productService.getById(id);
                const prod = res.data.product;
                setProduct({
                    ...prod,
                    id: prod._id,
                    price: prod.salePrice,
                    cost: prod.costPrice,
                });
                setMovements(res.data.movements.map((m) => ({
                    ...m,
                    id: m._id,
                })));
            }
            catch (err) {
                console.error("Error fetching product:", err);
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);
    const submitAdjustStock = async () => {
        if (!product || !id || adjustQty === "")
            return;
        try {
            await productService.adjustStock(id, {
                quantity: Math.abs(Number(adjustQty)),
                type: Number(adjustQty) >= 0 ? "in" : "out",
                reason: reason || "Ajuste manual",
            });
            const res = await productService.getById(id);
            const prod = res.data.product;
            setProduct({
                ...prod,
                id: prod._id,
                price: prod.salePrice,
                cost: prod.costPrice,
            });
            setMovements(res.data.movements.map((m) => ({
                ...m,
                id: m._id,
            })));
            setAdjustQty("");
            setReason("");
            setShowAdjustModal(false);
        }
        catch (err) {
            console.error("Error adjusting stock:", err);
        }
    };
    const getTypeLabel = (type) => {
        if (type === "in")
            return "Entrada";
        if (type === "out")
            return "Salida";
        return "Ajuste";
    };
    const getTypeColor = (type) => {
        if (type === "in")
            return "bg-green-100 text-green-800";
        if (type === "out")
            return "bg-red-100 text-red-800";
        return "bg-yellow-100 text-yellow-800";
    };
    const getStatusColor = (status) => {
        if (status === "active")
            return "bg-green-100 text-green-800";
        if (status === "inactive")
            return "bg-gray-100 text-gray-800";
        return "bg-red-100 text-red-800";
    };
    const getStatusLabel = (status) => {
        if (status === "active")
            return "Activo";
        if (status === "inactive")
            return "Inactivo";
        return "Descontinuado";
    };
    if (loading) {
        return (_jsx("div", { className: "p-6 flex items-center justify-center min-h-screen", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-500", children: "Cargando producto..." })] }) }));
    }
    if (!product) {
        return (_jsx("div", { className: "p-6 flex items-center justify-center min-h-screen", children: _jsxs("div", { className: "text-center", children: [_jsx(Package, { size: 64, className: "mx-auto mb-4 text-gray-300" }), _jsx("p", { className: "text-gray-500", children: "Producto no encontrado" })] }) }));
    }
    const stockPercentage = product.maxStock > 0
        ? Math.min(100, (product.stock / product.maxStock) * 100)
        : 0;
    return (_jsxs("div", { className: "p-6 space-y-6 bg-gray-50 min-h-screen", children: [_jsxs("button", { onClick: () => navigate("/products"), className: "flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors", children: [_jsx(ArrowLeft, { size: 20 }), "Volver a productos"] }), _jsxs("div", { className: "bg-white rounded-xl shadow-md overflow-hidden", children: [_jsx("div", { className: "bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-white", children: product.name }), _jsxs("p", { className: "text-blue-100 flex items-center gap-2 mt-1", children: [_jsx(Tag, { size: 16 }), product.brand || "Sin marca"] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { onClick: () => navigate(`/products/edit/${product.id}`), className: "px-4 py-2 bg-white text-blue-600 rounded-lg flex items-center gap-2 hover:bg-blue-50 transition-colors", children: [_jsx(Pencil, { size: 18 }), "Editar"] }), _jsxs("button", { onClick: () => setShowAdjustModal(true), className: "px-4 py-2 bg-yellow-500 text-white rounded-lg flex items-center gap-2 hover:bg-yellow-600 transition-colors", children: [_jsx(PackagePlus, { size: 18 }), "Ajustar Stock"] })] })] }) }), _jsx("div", { className: "p-6", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-1", children: [product.imageUrl && (_jsx("div", { className: "border rounded-xl p-4", children: _jsx("img", { src: product.imageUrl, alt: product.name, className: "w-full h-64 object-contain rounded-lg" }) })), product.description && (_jsxs("div", { className: "mt-4 p-4 bg-gray-50 rounded-xl", children: [_jsxs("h3", { className: "font-semibold text-gray-700 flex items-center gap-2 mb-2", children: [_jsx(Info, { size: 18 }), "Descripci\u00F3n"] }), _jsx("p", { className: "text-gray-600 text-sm", children: product.description })] }))] }), _jsxs("div", { className: "lg:col-span-2 space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-blue-50 rounded-xl p-4", children: [_jsx("p", { className: "text-blue-600 text-sm font-medium", children: "SKU" }), _jsx("p", { className: "text-xl font-bold text-gray-800", children: product.sku })] }), _jsxs("div", { className: "bg-purple-50 rounded-xl p-4", children: [_jsx("p", { className: "text-purple-600 text-sm font-medium", children: "Marca" }), _jsx("p", { className: "text-xl font-bold text-gray-800", children: product.brand || "N/A" })] }), _jsxs("div", { className: "bg-gray-50 rounded-xl p-4", children: [_jsx("p", { className: "text-gray-500 text-sm font-medium", children: "Estado" }), _jsx("span", { className: `inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(product.status)}`, children: getStatusLabel(product.status) })] })] }), _jsxs("div", { className: "border rounded-xl p-4", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("p", { className: "text-gray-500 text-sm font-medium", children: "Stock Actual" }), _jsxs("p", { className: "text-2xl font-bold text-gray-800", children: [product.stock, " ", product.unit || "unidades"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-3", children: _jsx("div", { className: `h-3 rounded-full transition-all ${product.stock === 0 ? "bg-red-500" :
                                                            product.stock < product.minStock ? "bg-yellow-500" : "bg-green-500"}`, style: { width: `${stockPercentage}%` } }) }), _jsxs("div", { className: "flex justify-between text-xs text-gray-400 mt-1", children: [_jsx("span", { children: "0" }), _jsxs("span", { children: ["M\u00EDn: ", product.minStock] }), _jsxs("span", { children: ["M\u00E1x: ", product.maxStock] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "bg-green-50 rounded-xl p-4", children: [_jsxs("p", { className: "text-green-600 text-sm font-medium flex items-center gap-1", children: [_jsx(TrendingUp, { size: 16 }), "Precio de Venta"] }), _jsxs("p", { className: "text-2xl font-bold text-gray-800", children: ["$", product.price.toFixed(2)] })] }), _jsxs("div", { className: "bg-orange-50 rounded-xl p-4", children: [_jsxs("p", { className: "text-orange-600 text-sm font-medium flex items-center gap-1", children: [_jsx(TrendingDown, { size: 16 }), "Costo"] }), _jsxs("p", { className: "text-2xl font-bold text-gray-800", children: ["$", product.cost.toFixed(2)] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { className: "flex justify-between py-2 border-b", children: [_jsx("span", { className: "text-gray-500", children: "Categor\u00EDa" }), _jsx("span", { className: "font-medium", children: product.category?.name || "N/A" })] }), _jsxs("div", { className: "flex justify-between py-2 border-b", children: [_jsx("span", { className: "text-gray-500", children: "Fecha de Creaci\u00F3n" }), _jsx("span", { className: "font-medium", children: new Date(product.createdAt).toLocaleDateString() })] }), _jsxs("div", { className: "flex justify-between py-2 border-b", children: [_jsx("span", { className: "text-gray-500", children: "Unidad" }), _jsx("span", { className: "font-medium capitalize", children: product.unit || "unidad" })] }), _jsxs("div", { className: "flex justify-between py-2 border-b", children: [_jsx("span", { className: "text-gray-500", children: "Margen" }), _jsxs("span", { className: "font-medium text-green-600", children: [product.cost > 0 ? ((product.price - product.cost) / product.cost * 100).toFixed(1) : 0, "%"] })] })] })] })] }) })] }), _jsxs("div", { className: "bg-white rounded-xl shadow-md p-6", children: [_jsx("h2", { className: "text-xl font-bold text-gray-800 mb-4", children: "Historial de Movimientos" }), movements.length === 0 ? (_jsxs("div", { className: "text-center py-8 text-gray-400", children: [_jsx(Package, { size: 48, className: "mx-auto mb-2 opacity-50" }), _jsx("p", { children: "Sin movimientos registrados" })] })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "text-left text-gray-500 text-sm border-b", children: [_jsx("th", { className: "pb-3", children: "Fecha" }), _jsx("th", { className: "pb-3", children: "Tipo" }), _jsx("th", { className: "pb-3", children: "Cantidad" }), _jsx("th", { className: "pb-3", children: "Stock Anterior" }), _jsx("th", { className: "pb-3", children: "Stock Nuevo" }), _jsx("th", { className: "pb-3", children: "Motivo" }), _jsx("th", { className: "pb-3", children: "Usuario" })] }) }), _jsx("tbody", { children: movements.map((m) => (_jsxs("tr", { className: "border-b hover:bg-gray-50", children: [_jsx("td", { className: "py-3", children: new Date(m.createdAt).toLocaleString() }), _jsx("td", { className: "py-3", children: _jsx("span", { className: `px-2 py-1 rounded text-xs font-medium ${getTypeColor(m.type)}`, children: getTypeLabel(m.type) }) }), _jsx("td", { className: "py-3 font-semibold", children: m.quantity }), _jsx("td", { className: "py-3", children: m.previousStock }), _jsx("td", { className: "py-3", children: m.newStock }), _jsx("td", { className: "py-3 text-gray-600", children: m.reason }), _jsx("td", { className: "py-3 text-gray-500", children: m.createdBy?.name || "N/A" })] }, m.id))) })] }) }))] }), showAdjustModal && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50", children: _jsxs("div", { className: "bg-white p-6 rounded-xl shadow-xl w-96", children: [_jsx("h2", { className: "text-xl font-bold mb-4", children: "Ajustar Stock" }), _jsxs("p", { className: "text-gray-500 mb-4", children: ["Stock actual: ", _jsx("strong", { children: product.stock }), " unidades"] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Nueva cantidad (+ entrada / - salida)" }), _jsx("input", { type: "number", value: adjustQty, onChange: (e) => setAdjustQty(e.target.value === "" ? "" : Number(e.target.value)), placeholder: "Ej: 10 (entrada) o -5 (salida)", className: "w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Motivo" }), _jsx("input", { type: "text", value: reason, onChange: (e) => setReason(e.target.value), placeholder: "Ej: Inventario f\u00EDsico", className: "w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { onClick: () => {
                                        setShowAdjustModal(false);
                                        setAdjustQty("");
                                        setReason("");
                                    }, className: "px-4 py-2 border rounded-lg hover:bg-gray-50", children: "Cancelar" }), _jsx("button", { onClick: submitAdjustStock, className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700", children: "Guardar" })] })] }) }))] }));
};
export default ProductDetailPage;
