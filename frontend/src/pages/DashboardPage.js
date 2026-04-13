import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { productService, saleService } from "../services/api";
import ExchangeRateDisplay from "../components/common/ExchangeRateDisplay";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, LineChart, Line, } from "recharts";
import { Package, TrendingUp, AlertTriangle, DollarSign, ShoppingCart } from "lucide-react";
const DashboardPage = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, salesRes] = await Promise.all([
                    productService.getAll().catch(() => ({ data: [] })),
                    saleService.getAll().catch(() => ({ data: { sales: [] } })),
                ]);
                setProducts(productsRes.data.map((p) => ({ ...p, id: p._id })));
                setSales(salesRes.data.sales || []);
            }
            catch (err) {
                console.error("Error fetching data:", err);
                setError(err.message || "Error al cargar el dashboard");
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
        const handleStorageChange = () => {
            fetchData();
        };
        window.addEventListener('inventoryUpdate', handleStorageChange);
        return () => window.removeEventListener('inventoryUpdate', handleStorageChange);
    }, []);
    if (loading) {
        return (_jsx("div", { className: "p-6 flex items-center justify-center min-h-screen", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-500", children: "Cargando dashboard..." })] }) }));
    }
    if (error) {
        return (_jsx("div", { className: "p-6 flex items-center justify-center min-h-screen", children: _jsxs("div", { className: "text-center text-red-500", children: [_jsx(AlertTriangle, { size: 48, className: "mx-auto mb-4" }), _jsx("p", { children: error })] }) }));
    }
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const salesToday = sales.filter(s => new Date(s.createdAt) >= startOfDay && s.status !== "cancelled");
    const salesMonth = sales.filter(s => new Date(s.createdAt) >= startOfMonth && s.status !== "cancelled");
    const totalSalesToday = salesToday.reduce((acc, s) => acc + s.total, 0);
    const totalSalesMonth = salesMonth.reduce((acc, s) => acc + s.total, 0);
    const totalProfitMonth = salesMonth.reduce((acc, s) => acc + (s.profit || 0), 0);
    const totalProductsToday = salesToday.reduce((acc, s) => acc + s.items.reduce((i, item) => i + item.quantity, 0), 0);
    const totalProductsMonth = salesMonth.reduce((acc, s) => acc + s.items.reduce((i, item) => i + item.quantity, 0), 0);
    const lowStockProducts = products.filter(p => p.stock > 0 && p.stock < p.minStock);
    const outOfStockProducts = products.filter(p => p.stock === 0);
    const totalInventoryValue = products.reduce((acc, p) => {
        return acc + (p.stock || 0) * (p.costPrice || p.salePrice || 0);
    }, 0);
    const topProductsMap = {};
    sales.filter(s => s.status !== "cancelled").forEach(sale => {
        sale.items.forEach(item => {
            const key = item.productName;
            if (!topProductsMap[key]) {
                topProductsMap[key] = { name: item.productName, totalSold: 0, revenue: 0 };
            }
            topProductsMap[key].totalSold += item.quantity;
            topProductsMap[key].revenue += item.subtotal;
        });
    });
    const topProducts = Object.values(topProductsMap)
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 5);
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const daySales = sales.filter(s => s.createdAt.startsWith(dateStr) && s.status !== "cancelled");
        const dayTotal = daySales.reduce((acc, s) => acc + s.total, 0);
        return { date: dateStr, total: dayTotal, count: daySales.length };
    }).reverse();
    const recentSales = sales.filter(s => s.status !== "cancelled").slice(0, 10);
    return (_jsxs("div", { className: "p-6 space-y-6 bg-gray-50 min-h-screen", children: [user && (_jsxs("div", { className: "bg-white rounded-lg shadow p-4", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-800", children: "Dashboard" }), _jsxs("p", { className: "text-gray-600", children: ["Bienvenido, ", _jsx("strong", { children: user.name || user.email }), " (", _jsx("span", { className: "capitalize", children: user.role }), ")"] })] })), _jsx(ExchangeRateDisplay, {}), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx("div", { className: "bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-blue-100 text-sm", children: "Total Productos" }), _jsx("p", { className: "text-3xl font-bold", children: products.length })] }), _jsx(Package, { size: 40, className: "opacity-80" })] }) }), _jsx("div", { className: "bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-yellow-100 text-sm", children: "Stock Bajo" }), _jsx("p", { className: "text-3xl font-bold", children: lowStockProducts.length })] }), _jsx(AlertTriangle, { size: 40, className: "opacity-80" })] }) }), _jsx("div", { className: "bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-red-100 text-sm", children: "Sin Stock" }), _jsx("p", { className: "text-3xl font-bold", children: outOfStockProducts.length })] }), _jsx(TrendingUp, { size: 40, className: "opacity-80" })] }) }), _jsx("div", { className: "bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-green-100 text-sm", children: "Valor Inventario" }), _jsxs("div", { className: "text-xl", children: ["$", totalInventoryValue.toFixed(2)] })] }), _jsx(DollarSign, { size: 40, className: "opacity-80" })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-white p-6 rounded-xl shadow", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx(ShoppingCart, { className: "text-green-500", size: 24 }), _jsx("h3", { className: "text-gray-500 text-sm", children: "Ventas Hoy" })] }), _jsxs("p", { className: "text-2xl font-bold text-gray-800", children: ["$", totalSalesToday.toFixed(2)] }), _jsxs("p", { className: "text-sm text-gray-400", children: [totalProductsToday, " productos vendidos"] })] }), _jsxs("div", { className: "bg-white p-6 rounded-xl shadow", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx(TrendingUp, { className: "text-blue-500", size: 24 }), _jsx("h3", { className: "text-gray-500 text-sm", children: "Ventas del Mes" })] }), _jsxs("p", { className: "text-2xl font-bold text-gray-800", children: ["$", totalSalesMonth.toFixed(2)] }), _jsxs("p", { className: "text-sm text-gray-400", children: [totalProductsMonth, " productos vendidos"] })] }), _jsxs("div", { className: "bg-white p-6 rounded-xl shadow", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx(DollarSign, { className: "text-purple-500", size: 24 }), _jsx("h3", { className: "text-gray-500 text-sm", children: "Ganancia del Mes" })] }), _jsxs("p", { className: "text-2xl font-bold text-purple-600", children: ["$", totalProfitMonth.toFixed(2)] }), _jsx("p", { className: "text-sm text-gray-400", children: "Margen operativo" })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white p-6 rounded-xl shadow", children: [_jsx("h2", { className: "text-lg font-bold text-gray-800 mb-4", children: "Top 5 Productos m\u00E1s Vendidos" }), topProducts.length > 0 ? (_jsx(ResponsiveContainer, { width: "100%", height: 250, children: _jsxs(BarChart, { data: topProducts, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "name", tick: { fontSize: 11 }, interval: 0, angle: -20, textAnchor: "end", height: 60 }), _jsx(YAxis, {}), _jsx(Tooltip, { formatter: (value) => [`${value} unidades`, 'Cantidad'] }), _jsx(Bar, { dataKey: "totalSold", fill: "#3b82f6", radius: [4, 4, 0, 0] })] }) })) : (_jsx("div", { className: "h-64 flex items-center justify-center text-gray-400", children: _jsxs("div", { className: "text-center", children: [_jsx(Package, { size: 48, className: "mx-auto mb-2 opacity-50" }), _jsx("p", { children: "No hay datos de ventas a\u00FAn" })] }) }))] }), _jsxs("div", { className: "bg-white p-6 rounded-xl shadow", children: [_jsx("h2", { className: "text-lg font-bold text-gray-800 mb-4", children: "Ventas de los \u00DAltimos 7 D\u00EDas" }), last7Days.some(d => d.total > 0) ? (_jsx(ResponsiveContainer, { width: "100%", height: 250, children: _jsxs(LineChart, { data: last7Days, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "date", tick: { fontSize: 11 } }), _jsx(YAxis, {}), _jsx(Tooltip, { formatter: (value) => [`$${Number(value).toFixed(2)}`, 'Ventas'] }), _jsx(Line, { type: "monotone", dataKey: "total", stroke: "#10b981", strokeWidth: 2, dot: { fill: '#10b981' } })] }) })) : (_jsx("div", { className: "h-64 flex items-center justify-center text-gray-400", children: _jsxs("div", { className: "text-center", children: [_jsx(TrendingUp, { size: 48, className: "mx-auto mb-2 opacity-50" }), _jsx("p", { children: "No hay ventas en los \u00FAltimos 7 d\u00EDas" })] }) }))] })] }), _jsxs("div", { className: "bg-white p-6 rounded-xl shadow", children: [_jsx("h2", { className: "text-lg font-bold text-gray-800 mb-4", children: "\u00DAltimas Ventas" }), recentSales.length > 0 ? (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "text-left text-gray-500 text-sm border-b", children: [_jsx("th", { className: "pb-3", children: "Folio" }), _jsx("th", { className: "pb-3", children: "Cliente" }), _jsx("th", { className: "pb-3", children: "Productos" }), _jsx("th", { className: "pb-3", children: "Total" }), _jsx("th", { className: "pb-3", children: "Ganancia" }), _jsx("th", { className: "pb-3", children: "Fecha" })] }) }), _jsx("tbody", { children: recentSales.map((sale) => (_jsxs("tr", { className: "border-b hover:bg-gray-50", children: [_jsx("td", { className: "py-3 font-medium", children: sale.invoiceNumber }), _jsx("td", { className: "py-3", children: sale.clientName }), _jsxs("td", { className: "py-3 text-gray-600", children: [sale.items.length, " prod."] }), _jsxs("td", { className: "py-3 font-bold text-green-600", children: ["$", sale.total.toFixed(2)] }), _jsxs("td", { className: "py-3 text-blue-600", children: ["$", (sale.profit || 0).toFixed(2)] }), _jsx("td", { className: "py-3 text-gray-500", children: new Date(sale.createdAt).toLocaleDateString() })] }, sale._id))) })] }) })) : (_jsxs("div", { className: "py-12 text-center text-gray-400", children: [_jsx(ShoppingCart, { size: 48, className: "mx-auto mb-2 opacity-50" }), _jsx("p", { children: "No hay ventas registradas" })] }))] })] }));
};
export default DashboardPage;
