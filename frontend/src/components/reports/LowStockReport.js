import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const LowStockReport = ({ products }) => {
    const lowStock = products.filter(p => (p.stock || 0) <= (p.minStock || 0)); // ✅ CORREGIDO
    if (lowStock.length === 0)
        return null;
    return (_jsxs("div", { className: "border p-4 rounded space-y-2", children: [_jsx("h2", { className: "font-bold text-lg text-red-600", children: "Productos con Stock Bajo" }), _jsxs("table", { className: "w-full border", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { className: "border p-2", children: "SKU" }), _jsx("th", { className: "border p-2", children: "Producto" }), _jsx("th", { className: "border p-2", children: "Stock" })] }) }), _jsx("tbody", { children: lowStock.map(p => (_jsxs("tr", { children: [_jsx("td", { className: "border p-2", children: p.sku }), _jsx("td", { className: "border p-2", children: p.name }), _jsx("td", { className: "border p-2", children: p.stock })] }, p.id))) })] })] }));
};
export default LowStockReport;
