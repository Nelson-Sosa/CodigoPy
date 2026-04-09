import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { format } from "date-fns";
const MovementsReport = ({ movements, products }) => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const getTypeLabel = (type) => {
        if (type === "in")
            return "entrada";
        if (type === "out")
            return "salida";
        return "ajuste";
    };
    const filtered = movements.filter(m => {
        const afterStart = !startDate || new Date(m.createdAt) >= new Date(startDate);
        const beforeEnd = !endDate || new Date(m.createdAt) <= new Date(endDate + "T23:59:59");
        return afterStart && beforeEnd;
    });
    return (_jsxs("div", { className: "border p-4 rounded space-y-2", children: [_jsx("h2", { className: "font-bold text-lg", children: "Movimientos por Per\u00EDodo" }), _jsxs("div", { className: "flex gap-2 mb-2", children: [_jsx("input", { type: "date", value: startDate, onChange: e => setStartDate(e.target.value), className: "border p-2 rounded" }), _jsx("input", { type: "date", value: endDate, onChange: e => setEndDate(e.target.value), className: "border p-2 rounded" })] }), _jsxs("table", { className: "w-full border", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { className: "border p-2", children: "Producto" }), _jsx("th", { className: "border p-2", children: "Tipo" }), _jsx("th", { className: "border p-2", children: "Cantidad" }), _jsx("th", { className: "border p-2", children: "Fecha" })] }) }), _jsx("tbody", { children: filtered.map(m => {
                            const productId = m.product?._id || m.productId;
                            const product = products.find(p => p.id === productId || p._id === productId);
                            return (_jsxs("tr", { children: [_jsx("td", { className: "border p-2", children: product?.name || m.product?.name || "N/A" }), _jsx("td", { className: "border p-2", children: getTypeLabel(m.type) }), _jsx("td", { className: "border p-2", children: m.quantity }), _jsx("td", { className: "border p-2", children: format(new Date(m.createdAt), "yyyy-MM-dd HH:mm") })] }, m.id));
                        }) })] })] }));
};
export default MovementsReport;
