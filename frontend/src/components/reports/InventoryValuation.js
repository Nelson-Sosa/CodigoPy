import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const InventoryValuation = ({ products }) => {
    const totalValue = products.reduce((sum, p) => {
        const cost = p.costPrice || p.cost || 0;
        const stock = p.stock || 0;
        return sum + (stock * cost);
    }, 0);
    const totalQuantity = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    return (_jsxs("div", { className: "border p-4 rounded space-y-2", children: [_jsx("h2", { className: "font-bold text-lg", children: "Valorizaci\u00F3n del Inventario" }), _jsxs("p", { children: ["Total unidades: ", _jsx("strong", { children: totalQuantity })] }), _jsxs("p", { children: ["Valor total inventario: ", _jsxs("strong", { children: ["$", totalValue.toFixed(2)] })] }), _jsxs("table", { className: "w-full border mt-4", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { className: "border p-2", children: "Producto" }), _jsx("th", { className: "border p-2", children: "Stock" }), _jsx("th", { className: "border p-2", children: "Costo Unit." }), _jsx("th", { className: "border p-2", children: "Valor Total" })] }) }), _jsx("tbody", { children: products.map(p => (_jsxs("tr", { children: [_jsx("td", { className: "border p-2", children: p.name }), _jsx("td", { className: "border p-2", children: p.stock || 0 }), _jsxs("td", { className: "border p-2", children: ["$", (p.costPrice || p.cost || 0).toFixed(2)] }), _jsxs("td", { className: "border p-2", children: ["$", ((p.stock || 0) * (p.costPrice || p.cost || 0)).toFixed(2)] })] }, p.id))) })] })] }));
};
export default InventoryValuation;
