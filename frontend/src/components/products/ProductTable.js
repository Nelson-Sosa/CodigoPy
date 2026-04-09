import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Eye, Pencil, Trash2, PackagePlus } from "lucide-react";
const ProductTable = ({ products, onDelete, onView, onEdit, onAdjustStock }) => {
    const [sortField, setSortField] = useState(null);
    const [sortOrder, setSortOrder] = useState("asc");
    const sortedProducts = [...products].sort((a, b) => {
        if (!sortField)
            return 0;
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === "number" && typeof valB === "number") {
            return sortOrder === "asc" ? valA - valB : valB - valA;
        }
        return sortOrder === "asc"
            ? String(valA).localeCompare(String(valB))
            : String(valB).localeCompare(String(valA));
    });
    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        }
        else {
            setSortField(field);
            setSortOrder("asc");
        }
    };
    return (_jsx("div", { className: "w-full overflow-x-auto rounded-lg border bg-white shadow-sm", children: _jsxs("table", { className: "w-full border-collapse text-sm", children: [_jsx("thead", { className: "bg-gray-100 text-gray-700", children: _jsxs("tr", { children: [_jsx("th", { onClick: () => handleSort("sku"), className: "cursor-pointer px-3 py-2 text-left hover:text-blue-600", children: "SKU" }), _jsx("th", { onClick: () => handleSort("name"), className: "cursor-pointer px-3 py-2 text-left hover:text-blue-600", children: "Nombre" }), _jsx("th", { onClick: () => handleSort("stock"), className: "cursor-pointer px-3 py-2 text-left hover:text-blue-600", children: "Stock" }), _jsx("th", { onClick: () => handleSort("price"), className: "cursor-pointer px-3 py-2 text-left hover:text-blue-600", children: "Precio" }), _jsx("th", { onClick: () => handleSort("createdAt"), className: "cursor-pointer px-3 py-2 text-left hover:text-blue-600", children: "Creado" }), _jsx("th", { className: "px-3 py-2 text-left", children: "Estado" }), _jsx("th", { className: "px-3 py-2 text-left", children: "Acciones" })] }) }), _jsx("tbody", { className: "divide-y", children: sortedProducts.map((p) => {
                        const stock = p.stock || 0;
                        const minStock = p.minStock || 0;
                        let stockColor = "text-green-600 font-medium";
                        if (stock === 0)
                            stockColor = "text-red-600 font-medium";
                        else if (stock < minStock)
                            stockColor = "text-yellow-600 font-medium";
                        return (_jsxs("tr", { className: "hover:bg-gray-50 transition-colors", children: [_jsx("td", { className: "px-3 py-2", children: p.sku || "N/A" }), _jsx("td", { className: "px-3 py-2 font-medium text-gray-900", children: p.name }), _jsx("td", { className: `px-3 py-2 ${stockColor}`, children: stock }), _jsxs("td", { className: "px-3 py-2", children: ["$", p.price || p.salePrice || 0] }), _jsx("td", { className: "px-3 py-2", children: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "N/A" }), _jsx("td", { className: "px-3 py-2 capitalize", children: p.status }), _jsx("td", { className: "px-3 py-2", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: () => onView(p.id), className: "text-blue-600 hover:text-blue-800", title: "Ver", children: _jsx(Eye, { size: 18 }) }), _jsx("button", { onClick: () => onEdit(p.id), className: "text-yellow-600 hover:text-yellow-800", title: "Editar", children: _jsx(Pencil, { size: 18 }) }), _jsx("button", { onClick: () => onAdjustStock(p), className: "text-purple-600 hover:text-purple-800", title: "Ajustar stock", children: _jsx(PackagePlus, { size: 18 }) }), _jsx("button", { onClick: () => onDelete(p.id), className: "text-red-600 hover:text-red-800", title: "Eliminar", children: _jsx(Trash2, { size: 18 }) })] }) })] }, p.id));
                    }) })] }) }));
};
export default ProductTable;
