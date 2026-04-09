import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { productService, categoryService } from "../../services/api";
import ProductTable from "../../components/products/ProductTable";
const ProductsPage = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState(null);
    const [statusFilter, setStatusFilter] = useState(null);
    const [stockFilter, setStockFilter] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [adjustProduct, setAdjustProduct] = useState(null);
    const [adjustQty, setAdjustQty] = useState(0);
    const [adjustReason, setAdjustReason] = useState("");
    const [deleteProductId, setDeleteProductId] = useState(null);
    const fetchData = async () => {
        try {
            setLoading(true);
            const [prodRes, catRes] = await Promise.all([
                productService.getAll(),
                categoryService.getAll(),
            ]);
            setProducts(prodRes.data.map((p) => ({ ...p, id: p._id })));
            setCategories(catRes.data);
        }
        catch (err) {
            console.error("Error fetching data:", err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, []);
    const filteredProducts = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return products
            .filter(p => (p.name?.toLowerCase().includes(term) ?? false) ||
            (p.sku?.toLowerCase().includes(term) ?? false) ||
            (p.description?.toLowerCase().includes(term) ?? false))
            .filter(p => !categoryFilter || p.categoryId === categoryFilter)
            .filter(p => !statusFilter || p.status === statusFilter)
            .filter(p => {
            const stock = p.stock || 0;
            const minStock = p.minStock || 0;
            return stockFilter === "low" ? stock < minStock && stock > 0 :
                stockFilter === "out" ? stock === 0 : true;
        });
    }, [products, searchTerm, categoryFilter, statusFilter, stockFilter]);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const handleView = (id) => navigate(`/products/${id}`);
    const handleEdit = (id) => navigate(`/products/edit/${id}`);
    const handleAdjustStock = (product) => setAdjustProduct(product);
    const submitAdjustStock = async () => {
        if (!adjustProduct || !adjustProduct.id)
            return;
        try {
            await productService.adjustStock(adjustProduct.id, {
                quantity: Math.abs(adjustQty),
                type: adjustQty >= 0 ? "in" : "out",
                reason: adjustReason || "Ajuste de stock",
            });
            fetchData();
            setAdjustProduct(null);
            setAdjustQty(0);
            setAdjustReason("");
        }
        catch (err) {
            console.error("Error adjusting stock:", err);
        }
    };
    const handleDeleteConfirm = async () => {
        if (deleteProductId) {
            try {
                await productService.delete(deleteProductId);
                fetchData();
                setDeleteProductId(null);
            }
            catch (err) {
                console.error("Error deleting product:", err);
            }
        }
    };
    return (_jsxs("div", { className: "p-6 space-y-4", children: [_jsx("h1", { className: "text-2xl font-bold mb-4", children: "Gesti\u00F3n de Productos" }), _jsx("div", { className: "flex justify-between items-center mb-4", children: _jsx("button", { onClick: () => navigate("/products/new"), className: "bg-green-600 text-white px-4 py-2 rounded", children: "+ Agregar producto" }) }), _jsxs("div", { className: "flex flex-wrap gap-2 items-center mb-4", children: [_jsx("input", { type: "text", placeholder: "Buscar por SKU, nombre o descripci\u00F3n", value: searchTerm, onChange: e => setSearchTerm(e.target.value), className: "border p-2 rounded flex-1" }), _jsxs("select", { onChange: e => setCategoryFilter(e.target.value || null), className: "border p-2 rounded", children: [_jsx("option", { value: "", children: "Todas las categor\u00EDas" }), categories.map(c => (_jsx("option", { value: c._id, children: c.name }, c._id)))] }), _jsxs("select", { onChange: e => setStatusFilter(e.target.value || null), className: "border p-2 rounded", children: [_jsx("option", { value: "", children: "Todos los estados" }), _jsx("option", { value: "active", children: "Activo" }), _jsx("option", { value: "inactive", children: "Inactivo" }), _jsx("option", { value: "discontinued", children: "Descontinuado" })] }), _jsxs("select", { onChange: e => setStockFilter(e.target.value), className: "border p-2 rounded", children: [_jsx("option", { value: "", children: "Todos los stocks" }), _jsx("option", { value: "low", children: "Stock bajo" }), _jsx("option", { value: "out", children: "Sin stock" })] }), _jsxs("select", { onChange: e => setItemsPerPage(Number(e.target.value)), className: "border p-2 rounded", children: [_jsx("option", { value: 10, children: "10" }), _jsx("option", { value: 25, children: "25" }), _jsx("option", { value: 50, children: "50" })] })] }), loading ? (_jsx("p", { children: "Cargando productos..." })) : (_jsx(ProductTable, { products: currentProducts, onView: handleView, onEdit: handleEdit, onAdjustStock: handleAdjustStock, onDelete: setDeleteProductId })), _jsxs("div", { className: "flex justify-between items-center mt-4", children: [_jsx("button", { disabled: currentPage === 1, onClick: () => setCurrentPage(prev => Math.max(prev - 1, 1)), className: "px-4 py-2 border rounded disabled:opacity-50", children: "Anterior" }), _jsxs("span", { children: ["P\u00E1gina ", currentPage, " de ", totalPages] }), _jsx("button", { disabled: currentPage === totalPages, onClick: () => setCurrentPage(prev => Math.min(prev + 1, totalPages)), className: "px-4 py-2 border rounded disabled:opacity-50", children: "Siguiente" })] }), adjustProduct && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center", children: _jsxs("div", { className: "bg-white p-6 rounded shadow w-96", children: [_jsxs("h2", { className: "text-xl font-bold mb-4", children: ["Ajustar Stock: ", adjustProduct.name] }), _jsxs("p", { className: "text-sm text-gray-600 mb-4", children: ["Stock actual: ", adjustProduct.stock] }), _jsx("input", { type: "number", value: adjustQty, onChange: e => setAdjustQty(Number(e.target.value)), placeholder: "Cantidad (+ entrada, - salida)", className: "border p-2 w-full mb-2" }), _jsx("input", { type: "text", value: adjustReason, onChange: e => setAdjustReason(e.target.value), placeholder: "Motivo", className: "border p-2 w-full mb-4" }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { onClick: () => setAdjustProduct(null), className: "px-4 py-2 border rounded", children: "Cancelar" }), _jsx("button", { onClick: submitAdjustStock, className: "px-4 py-2 bg-green-600 text-white rounded", children: "Guardar" })] })] }) })), deleteProductId && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center", children: _jsxs("div", { className: "bg-white p-6 rounded shadow w-96", children: [_jsx("h2", { className: "text-xl font-bold mb-4", children: "Confirmar eliminaci\u00F3n" }), _jsx("p", { children: "\u00BFEst\u00E1s seguro que quieres descontinuar este producto?" }), _jsxs("div", { className: "flex justify-end gap-2 mt-4", children: [_jsx("button", { onClick: () => setDeleteProductId(null), className: "px-4 py-2 border rounded", children: "Cancelar" }), _jsx("button", { onClick: handleDeleteConfirm, className: "px-4 py-2 bg-red-600 text-white rounded", children: "Confirmar" })] })] }) }))] }));
};
export default ProductsPage;
