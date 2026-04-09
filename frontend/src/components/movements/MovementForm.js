import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { productService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Package, ArrowDownCircle, ArrowUpCircle, Settings, Plus, Minus, Lock } from "lucide-react";
const MOTIVOS_SALIDA = [
    "Devolución a proveedor",
    "Merma/Baja calidad",
    "Robo/Pérdida",
    "Muestra gratis",
    "Transferencia",
    "Otro"
];
const MOTIVOS_ENTRADA = [
    "Compra a proveedor",
    "Devolución de cliente",
    "Ajuste positivo",
    "Transferencia entrante",
    "Producción propia",
    "Otro"
];
const MovementForm = ({ onMovementSaved }) => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [productLoading, setProductLoading] = useState(true);
    const [error, setError] = useState("");
    const [productId, setProductId] = useState("");
    const [type, setType] = useState("entrada");
    const [quantity, setQuantity] = useState("");
    const [reason, setReason] = useState("");
    const [notes, setNotes] = useState("");
    const canManualExit = user?.role === "admin" || user?.role === "supervisor";
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await productService.getAll();
                const mapped = res.data.map((p) => ({
                    ...p,
                    id: p._id,
                }));
                setProducts(mapped);
            }
            catch (err) {
                console.error("Error fetching products:", err);
            }
            finally {
                setProductLoading(false);
            }
        };
        fetchProducts();
    }, []);
    const selectedProduct = products.find(p => p.id === productId);
    const mapTypeToBackend = (t) => {
        if (t === "entrada")
            return "in";
        if (t === "salida")
            return "out";
        return "adjust";
    };
    const handleSubmit = async () => {
        if (!productId || quantity === "" || quantity <= 0 || !reason) {
            setError("Complete todos los campos obligatorios");
            return;
        }
        if (!selectedProduct)
            return;
        if (type === "salida" && quantity > selectedProduct.stock) {
            setError(`La salida no puede superar el stock disponible (${selectedProduct.stock})`);
            return;
        }
        setLoading(true);
        setError("");
        try {
            await productService.adjustStock(productId, {
                quantity: Number(quantity),
                type: mapTypeToBackend(type),
                reason,
            });
            setProductId("");
            setType("entrada");
            setQuantity("");
            setReason("");
            setNotes("");
            onMovementSaved();
        }
        catch (err) {
            setError(err.response?.data?.message || "Error al registrar movimiento");
        }
        finally {
            setLoading(false);
        }
    };
    const getTypeColor = () => {
        if (type === "entrada")
            return "text-green-600 bg-green-50 border-green-200";
        if (type === "salida")
            return "text-red-600 bg-red-50 border-red-200";
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
    };
    const getMotivos = () => {
        if (type === "entrada")
            return MOTIVOS_ENTRADA;
        if (type === "salida")
            return MOTIVOS_SALIDA;
        return [...MOTIVOS_ENTRADA, ...MOTIVOS_SALIDA];
    };
    return (_jsxs("div", { className: "bg-white rounded-lg shadow-md border overflow-hidden", children: [_jsx("div", { className: "bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4", children: _jsxs("h2", { className: "text-xl font-bold text-white flex items-center gap-2", children: [_jsx(Package, { size: 24 }), "Registrar Movimiento de Inventario"] }) }), _jsxs("div", { className: "p-6 space-y-6", children: [error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg", children: error })), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["Producto ", _jsx("span", { className: "text-red-500", children: "*" })] }), productLoading ? (_jsx("div", { className: "border rounded-lg p-3 bg-gray-50 animate-pulse h-12" })) : (_jsxs("select", { value: productId, onChange: e => {
                                                    setProductId(e.target.value);
                                                    setError("");
                                                }, className: "w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500", children: [_jsx("option", { value: "", children: "Seleccione un producto" }), products.map(p => (_jsxs("option", { value: p.id, children: [p.sku, " - ", p.name, " (Stock: ", p.stock, ")"] }, p.id)))] }))] }), selectedProduct && (_jsxs("div", { className: "bg-gray-50 rounded-lg p-4 border", children: [_jsx("h3", { className: "font-semibold text-gray-800 mb-3", children: "Informaci\u00F3n del Producto" }), _jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "SKU:" }), _jsx("p", { className: "font-medium", children: selectedProduct.sku })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Stock Actual:" }), _jsxs("p", { className: "font-bold text-lg", children: [selectedProduct.stock, " unidades"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Precio Venta:" }), _jsxs("p", { className: "font-medium", children: ["$", selectedProduct.salePrice?.toFixed(2) || "N/A"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Precio Costo:" }), _jsxs("p", { className: "font-medium", children: ["$", selectedProduct.costPrice?.toFixed(2) || "N/A"] })] })] })] }))] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["Tipo de Movimiento ", _jsx("span", { className: "text-red-500", children: "*" }), !canManualExit && (_jsx("span", { className: "text-xs text-gray-400 ml-2", children: "(Ventas desde m\u00F3dulo Ventas)" }))] }), _jsxs("div", { className: "grid grid-cols-3 gap-2", children: [_jsxs("button", { type: "button", onClick: () => { setType("entrada"); setReason(""); }, className: `flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${type === "entrada"
                                                            ? "border-green-500 bg-green-50 text-green-700"
                                                            : "border-gray-200 hover:border-gray-300 text-gray-600"}`, children: [_jsx(ArrowDownCircle, { size: 24, className: "mb-1" }), _jsx("span", { className: "text-sm font-medium", children: "Entrada" })] }), canManualExit ? (_jsxs("button", { type: "button", onClick: () => { setType("salida"); setReason(""); }, className: `flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${type === "salida"
                                                            ? "border-red-500 bg-red-50 text-red-700"
                                                            : "border-gray-200 hover:border-gray-300 text-gray-600"}`, children: [_jsx(ArrowUpCircle, { size: 24, className: "mb-1" }), _jsx("span", { className: "text-sm font-medium", children: "Salida" })] })) : (_jsxs("div", { className: "flex flex-col items-center justify-center p-3 rounded-lg border-2 border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed", children: [_jsx(Lock, { size: 24, className: "mb-1" }), _jsx("span", { className: "text-sm font-medium", children: "Salida" }), _jsx("span", { className: "text-xs", children: "(Solo admin)" })] })), _jsxs("button", { type: "button", onClick: () => { setType("ajuste"); setReason(""); }, className: `flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${type === "ajuste"
                                                            ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                                                            : "border-gray-200 hover:border-gray-300 text-gray-600"}`, children: [_jsx(Settings, { size: 24, className: "mb-1" }), _jsx("span", { className: "text-sm font-medium", children: "Ajuste" })] })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["Cantidad ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: "number", min: "1", value: quantity, onChange: e => {
                                                            setQuantity(e.target.value === "" ? "" : Number(e.target.value));
                                                            setError("");
                                                        }, placeholder: "0", className: "w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500" }), _jsxs("div", { className: "absolute right-3 top-1/2 -translate-y-1/2 flex gap-1", children: [_jsx("button", { type: "button", onClick: () => setQuantity(prev => (prev === "" ? 1 : Math.max(1, Number(prev) - 1))), className: "p-1 text-gray-400 hover:text-gray-600", children: _jsx(Minus, { size: 18 }) }), _jsx("button", { type: "button", onClick: () => setQuantity(prev => (prev === "" ? 1 : Number(prev) + 1)), className: "p-1 text-gray-400 hover:text-gray-600", children: _jsx(Plus, { size: 18 }) })] })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["Motivo / Secci\u00F3n ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs("select", { value: reason, onChange: e => {
                                                    setReason(e.target.value);
                                                    setError("");
                                                }, className: "w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "", children: "Seleccione el motivo" }), getMotivos().map(m => (_jsx("option", { value: m, children: m }, m)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Notas / Referencia" }), _jsx("textarea", { value: notes, onChange: e => setNotes(e.target.value), rows: 3, placeholder: "Ej: Compra a proveedor X, Nota de cr\u00E9dito #123, etc.", className: "w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" })] })] })] }), selectedProduct && quantity !== "" && quantity > 0 && (_jsxs("div", { className: `rounded-lg p-4 border ${getTypeColor()}`, children: [_jsx("h3", { className: "font-semibold mb-3", children: "Resumen del Movimiento" }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "opacity-75", children: "Tipo:" }), _jsx("p", { className: "font-bold capitalize", children: type })] }), _jsxs("div", { children: [_jsx("span", { className: "opacity-75", children: "Cantidad:" }), _jsxs("p", { className: "font-bold", children: [quantity, " unidades"] })] }), _jsxs("div", { children: [_jsx("span", { className: "opacity-75", children: "Stock Actual:" }), _jsx("p", { className: "font-bold", children: selectedProduct.stock })] }), _jsxs("div", { children: [_jsx("span", { className: "opacity-75", children: "Stock Despu\u00E9s:" }), _jsx("p", { className: "font-bold", children: type === "entrada"
                                                    ? selectedProduct.stock + Number(quantity)
                                                    : type === "salida"
                                                        ? selectedProduct.stock - Number(quantity)
                                                        : Number(quantity) })] })] })] })), _jsxs("div", { className: "flex justify-end gap-3 pt-4 border-t", children: [_jsx("button", { type: "button", onClick: () => {
                                    setProductId("");
                                    setType("entrada");
                                    setQuantity("");
                                    setReason("");
                                    setNotes("");
                                    setError("");
                                }, className: "px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors", children: "Limpiar" }), _jsx("button", { onClick: handleSubmit, disabled: loading || !productId || quantity === "" || !reason, className: "px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2", children: loading ? (_jsxs(_Fragment, { children: [_jsxs("svg", { className: "animate-spin h-5 w-5", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4", fill: "none" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" })] }), "Guardando..."] })) : (_jsxs(_Fragment, { children: [_jsx(Package, { size: 20 }), "Registrar Movimiento"] })) })] })] })] }));
};
export default MovementForm;
