import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { format } from "date-fns";
const MovementTable = ({ movements, products }) => {
    const getTypeLabel = (type) => {
        if (type === "in")
            return "entrada";
        if (type === "out")
            return "salida";
        return "ajuste";
    };
    const getTypeColor = (type) => {
        if (type === "in")
            return "text-green-600";
        if (type === "out")
            return "text-red-600";
        return "text-yellow-600";
    };
    return (_jsx("div", { className: "overflow-x-auto mt-4", children: _jsxs("table", { className: "min-w-full border-collapse shadow rounded-lg", children: [_jsx("thead", { className: "bg-gray-100", children: _jsxs("tr", { children: [_jsx("th", { className: "border p-2 text-left text-sm font-semibold text-gray-700", children: "Producto" }), _jsx("th", { className: "border p-2 text-left text-sm font-semibold text-gray-700", children: "Tipo" }), _jsx("th", { className: "border p-2 text-left text-sm font-semibold text-gray-700", children: "Cantidad" }), _jsx("th", { className: "border p-2 text-left text-sm font-semibold text-gray-700", children: "Stock anterior" }), _jsx("th", { className: "border p-2 text-left text-sm font-semibold text-gray-700", children: "Stock nuevo" }), _jsx("th", { className: "border p-2 text-left text-sm font-semibold text-gray-700", children: "Motivo" }), _jsx("th", { className: "border p-2 text-left text-sm font-semibold text-gray-700", children: "Usuario" }), _jsx("th", { className: "border p-2 text-left text-sm font-semibold text-gray-700", children: "Fecha" })] }) }), _jsx("tbody", { children: movements.map((m) => {
                        const productId = m.product?._id || m.productId;
                        const product = products.find((p) => p.id === productId || p._id === productId);
                        return (_jsxs("tr", { className: "even:bg-gray-50 hover:bg-gray-100 transition-colors", children: [_jsx("td", { className: "border p-2 text-sm text-gray-700", children: product?.name || m.product?.name || "N/A" }), _jsx("td", { className: `border p-2 text-sm font-medium ${getTypeColor(m.type)}`, children: getTypeLabel(m.type) }), _jsx("td", { className: "border p-2 text-sm text-gray-700", children: m.quantity }), _jsx("td", { className: "border p-2 text-sm text-gray-700", children: m.previousStock }), _jsx("td", { className: "border p-2 text-sm text-gray-700", children: m.newStock }), _jsx("td", { className: "border p-2 text-sm text-gray-700", children: m.reason }), _jsx("td", { className: "border p-2 text-sm text-gray-700", children: m.createdBy?.name || m.userId || "N/A" }), _jsx("td", { className: "border p-2 text-sm text-gray-700", children: format(new Date(m.createdAt), "yyyy-MM-dd HH:mm") })] }, m.id));
                    }) })] }) }));
};
export default MovementTable;
