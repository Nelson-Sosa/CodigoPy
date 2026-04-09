import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { saleService, productService, clientService } from "../services/api";
import { BarChart3, FileText, Download, TrendingUp, Users, Package, DollarSign, ShoppingCart } from "lucide-react";
import { format } from "date-fns";
const ReportsPage = () => {
    const [sales, setSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeReport, setActiveReport] = useState("sales");
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
    useEffect(() => {
        fetchData();
    }, []);
    const fetchData = async () => {
        try {
            setLoading(true);
            const [salesRes, productsRes, clientsRes] = await Promise.all([
                saleService.getAll(),
                productService.getAll(),
                clientService.getAll(),
            ]);
            setSales(salesRes.data.sales || []);
            setProducts(productsRes.data || []);
            setClients(clientsRes.data || []);
        }
        catch (err) {
            console.error("Error fetching data:", err);
        }
        finally {
            setLoading(false);
        }
    };
    const filteredSales = sales.filter(s => {
        const saleDate = new Date(s.createdAt);
        return saleDate >= new Date(startDate) && saleDate <= new Date(endDate + 'T23:59:59') && s.status !== "cancelled";
    });
    const exportToCSV = (data, filename, headers) => {
        const csvContent = [
            headers.join(","),
            ...data.map(row => Object.values(row).join(","))
        ].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        link.click();
    };
    const totalSalesAmount = filteredSales.reduce((acc, s) => acc + s.total, 0);
    const totalProfits = filteredSales.reduce((acc, s) => acc + (s.profit || 0), 0);
    const totalCost = filteredSales.reduce((acc, s) => acc + (s.totalCost || 0), 0);
    const avgTicket = filteredSales.length > 0 ? totalSalesAmount / filteredSales.length : 0;
    const byPaymentMethod = filteredSales.reduce((acc, s) => {
        if (!acc[s.paymentMethod])
            acc[s.paymentMethod] = { count: 0, total: 0 };
        acc[s.paymentMethod].count++;
        acc[s.paymentMethod].total += s.total;
        return acc;
    }, {});
    const topProducts = filteredSales.reduce((acc, sale) => {
        sale.items.forEach(item => {
            const key = item.productName;
            if (!acc[key])
                acc[key] = { name: key, quantity: 0, revenue: 0, profit: 0 };
            acc[key].quantity += item.quantity;
            acc[key].revenue += item.subtotal;
            acc[key].profit += (item.unitPrice - item.costPrice) * item.quantity;
        });
        return acc;
    }, {});
    const topClients = [...clients]
        .filter(c => c.totalPurchases > 0 || c.totalSpent > 0)
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10);
    const getPaymentLabel = (method) => {
        const labels = {
            cash: "Efectivo",
            card: "Tarjeta",
            transfer: "Transferencia",
            credit: "Crédito"
        };
        return labels[method] || method;
    };
    if (loading) {
        return (_jsx("div", { className: "p-6 flex items-center justify-center min-h-screen", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" }) }));
    }
    return (_jsxs("div", { className: "p-6 space-y-6 bg-gray-50 min-h-screen", children: [_jsx("div", { className: "flex justify-between items-center", children: _jsxs("h1", { className: "text-2xl font-bold text-gray-800 flex items-center gap-2", children: [_jsx(BarChart3, { className: "text-blue-600", size: 28 }), "Reportes"] }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx("div", { className: "bg-white p-5 rounded-xl shadow-md border-l-4 border-blue-500", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-gray-500 text-sm", children: "Ventas del Per\u00EDodo" }), _jsxs("p", { className: "text-2xl font-bold text-gray-800", children: ["$", totalSalesAmount.toFixed(2)] })] }), _jsx(ShoppingCart, { className: "text-blue-500", size: 32 })] }) }), _jsx("div", { className: "bg-white p-5 rounded-xl shadow-md border-l-4 border-green-500", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-gray-500 text-sm", children: "Ganancia del Per\u00EDodo" }), _jsxs("p", { className: "text-2xl font-bold text-green-600", children: ["$", totalProfits.toFixed(2)] })] }), _jsx(TrendingUp, { className: "text-green-500", size: 32 })] }) }), _jsx("div", { className: "bg-white p-5 rounded-xl shadow-md border-l-4 border-purple-500", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-gray-500 text-sm", children: "Ticket Promedio" }), _jsxs("p", { className: "text-2xl font-bold text-purple-600", children: ["$", avgTicket.toFixed(2)] })] }), _jsx(DollarSign, { className: "text-purple-500", size: 32 })] }) }), _jsx("div", { className: "bg-white p-5 rounded-xl shadow-md border-l-4 border-orange-500", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-gray-500 text-sm", children: "Transacciones" }), _jsx("p", { className: "text-2xl font-bold text-orange-600", children: filteredSales.length })] }), _jsx(FileText, { className: "text-orange-500", size: 32 })] }) })] }), _jsx("div", { className: "bg-white rounded-xl shadow-md p-4", children: _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsxs("button", { onClick: () => setActiveReport("sales"), className: `px-4 py-2 rounded-lg flex items-center gap-2 transition ${activeReport === "sales" ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`, children: [_jsx(ShoppingCart, { size: 18 }), "Ventas por Per\u00EDodo"] }), _jsxs("button", { onClick: () => setActiveReport("inventory"), className: `px-4 py-2 rounded-lg flex items-center gap-2 transition ${activeReport === "inventory" ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`, children: [_jsx(Package, { size: 18 }), "Inventario Actual"] }), _jsxs("button", { onClick: () => setActiveReport("profits"), className: `px-4 py-2 rounded-lg flex items-center gap-2 transition ${activeReport === "profits" ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`, children: [_jsx(TrendingUp, { size: 18 }), "Ganancias Detalladas"] }), _jsxs("button", { onClick: () => setActiveReport("clients"), className: `px-4 py-2 rounded-lg flex items-center gap-2 transition ${activeReport === "clients" ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`, children: [_jsx(Users, { size: 18 }), "Top Clientes"] })] }) }), activeReport === "sales" && (_jsxs("div", { className: "bg-white rounded-xl shadow-md p-6 space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-lg font-bold", children: "Reporte de Ventas" }), _jsxs("div", { className: "flex gap-4 items-center", children: [_jsxs("div", { className: "flex gap-2 items-center", children: [_jsx("label", { className: "text-sm text-gray-600", children: "Desde:" }), _jsx("input", { type: "date", value: startDate, onChange: (e) => setStartDate(e.target.value), className: "border rounded px-3 py-1.5 text-sm" })] }), _jsxs("div", { className: "flex gap-2 items-center", children: [_jsx("label", { className: "text-sm text-gray-600", children: "Hasta:" }), _jsx("input", { type: "date", value: endDate, onChange: (e) => setEndDate(e.target.value), className: "border rounded px-3 py-1.5 text-sm" })] }), _jsxs("button", { onClick: () => exportToCSV(filteredSales.map(s => ({
                                            Folio: s.invoiceNumber,
                                            Cliente: s.clientName,
                                            'Subtotal': s.subtotal,
                                            'Descuento': s.discount,
                                            Total: s.total,
                                            Ganancia: s.profit?.toFixed(2),
                                            'Método Pago': getPaymentLabel(s.paymentMethod),
                                            Fecha: format(new Date(s.createdAt), 'yyyy-MM-dd HH:mm')
                                        })), 'reporte_ventas', ['Folio', 'Cliente', 'Subtotal', 'Descuento', 'Total', 'Ganancia', 'Método Pago', 'Fecha']), className: "bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition", children: [_jsx(Download, { size: 18 }), "Exportar CSV"] })] })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { className: "text-left", children: [_jsx("th", { className: "p-3 font-medium", children: "Folio" }), _jsx("th", { className: "p-3 font-medium", children: "Cliente" }), _jsx("th", { className: "p-3 font-medium text-right", children: "Subtotal" }), _jsx("th", { className: "p-3 font-medium text-right", children: "Descuento" }), _jsx("th", { className: "p-3 font-medium text-right", children: "Total" }), _jsx("th", { className: "p-3 font-medium text-right", children: "Ganancia" }), _jsx("th", { className: "p-3 font-medium", children: "M\u00E9todo" }), _jsx("th", { className: "p-3 font-medium", children: "Fecha" })] }) }), _jsxs("tbody", { children: [filteredSales.map(sale => (_jsxs("tr", { className: "border-t hover:bg-gray-50", children: [_jsx("td", { className: "p-3 font-medium", children: sale.invoiceNumber }), _jsx("td", { className: "p-3", children: sale.clientName }), _jsxs("td", { className: "p-3 text-right", children: ["$", sale.subtotal.toFixed(2)] }), _jsxs("td", { className: "p-3 text-right text-red-500", children: ["$", sale.discount > 0 ? `-${sale.discount.toFixed(2)}` : '0.00'] }), _jsxs("td", { className: "p-3 text-right font-bold text-green-600", children: ["$", sale.total.toFixed(2)] }), _jsxs("td", { className: "p-3 text-right text-blue-600", children: ["$", (sale.profit || 0).toFixed(2)] }), _jsx("td", { className: "p-3", children: getPaymentLabel(sale.paymentMethod) }), _jsx("td", { className: "p-3 text-gray-500", children: format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm') })] }, sale._id))), filteredSales.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 8, className: "p-8 text-center text-gray-400", children: "No hay ventas en este per\u00EDodo" }) }))] }), filteredSales.length > 0 && (_jsx("tfoot", { className: "bg-gray-50 font-bold", children: _jsxs("tr", { children: [_jsx("td", { colSpan: 2, className: "p-3", children: "TOTALES" }), _jsxs("td", { className: "p-3 text-right", children: ["$", filteredSales.reduce((a, s) => a + s.subtotal, 0).toFixed(2)] }), _jsxs("td", { className: "p-3 text-right", children: ["$", filteredSales.reduce((a, s) => a + s.discount, 0).toFixed(2)] }), _jsxs("td", { className: "p-3 text-right text-green-600", children: ["$", totalSalesAmount.toFixed(2)] }), _jsxs("td", { className: "p-3 text-right text-blue-600", children: ["$", totalProfits.toFixed(2)] }), _jsx("td", { colSpan: 2 })] }) }))] }) }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 mt-4", children: [_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsx("p", { className: "text-gray-500 text-sm", children: "Efectivo" }), _jsxs("p", { className: "font-bold", children: ["$", (byPaymentMethod['cash']?.total || 0).toFixed(2)] }), _jsxs("p", { className: "text-xs text-gray-400", children: [(byPaymentMethod['cash']?.count || 0), " ventas"] })] }), _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsx("p", { className: "text-gray-500 text-sm", children: "Tarjeta" }), _jsxs("p", { className: "font-bold", children: ["$", (byPaymentMethod['card']?.total || 0).toFixed(2)] }), _jsxs("p", { className: "text-xs text-gray-400", children: [(byPaymentMethod['card']?.count || 0), " ventas"] })] }), _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsx("p", { className: "text-gray-500 text-sm", children: "Transferencia" }), _jsxs("p", { className: "font-bold", children: ["$", (byPaymentMethod['transfer']?.total || 0).toFixed(2)] }), _jsxs("p", { className: "text-xs text-gray-400", children: [(byPaymentMethod['transfer']?.count || 0), " ventas"] })] }), _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsx("p", { className: "text-gray-500 text-sm", children: "Cr\u00E9dito" }), _jsxs("p", { className: "font-bold", children: ["$", (byPaymentMethod['credit']?.total || 0).toFixed(2)] }), _jsxs("p", { className: "text-xs text-gray-400", children: [(byPaymentMethod['credit']?.count || 0), " ventas"] })] })] })] })), activeReport === "inventory" && (_jsxs("div", { className: "bg-white rounded-xl shadow-md p-6 space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-lg font-bold", children: "Inventario Actual" }), _jsxs("button", { onClick: () => exportToCSV(products.map(p => ({
                                    SKU: p.sku,
                                    Nombre: p.name,
                                    Categoría: p.category?.name || 'Sin categoría',
                                    Stock: p.stock,
                                    'Stock Mínimo': p.minStock,
                                    'Precio Costo': p.costPrice,
                                    'Precio Venta': p.salePrice,
                                    Valor: (p.stock * p.costPrice).toFixed(2)
                                })), 'inventario', ['SKU', 'Nombre', 'Categoría', 'Stock', 'Stock Mínimo', 'Precio Costo', 'Precio Venta', 'Valor']), className: "bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition", children: [_jsx(Download, { size: 18 }), "Exportar CSV"] })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { className: "text-left", children: [_jsx("th", { className: "p-3 font-medium", children: "SKU" }), _jsx("th", { className: "p-3 font-medium", children: "Producto" }), _jsx("th", { className: "p-3 font-medium", children: "Categor\u00EDa" }), _jsx("th", { className: "p-3 font-medium text-right", children: "Stock" }), _jsx("th", { className: "p-3 font-medium text-right", children: "Stock M\u00EDn." }), _jsx("th", { className: "p-3 font-medium text-right", children: "P. Costo" }), _jsx("th", { className: "p-3 font-medium text-right", children: "P. Venta" }), _jsx("th", { className: "p-3 font-medium text-right", children: "Valor Total" }), _jsx("th", { className: "p-3 font-medium", children: "Estado" })] }) }), _jsx("tbody", { children: products.map(product => (_jsxs("tr", { className: "border-t hover:bg-gray-50", children: [_jsx("td", { className: "p-3 font-medium", children: product.sku }), _jsx("td", { className: "p-3", children: product.name }), _jsx("td", { className: "p-3 text-gray-500", children: product.category?.name || '-' }), _jsx("td", { className: "p-3 text-right font-bold", children: product.stock }), _jsx("td", { className: "p-3 text-right text-gray-500", children: product.minStock }), _jsxs("td", { className: "p-3 text-right", children: ["$", product.costPrice.toFixed(2)] }), _jsxs("td", { className: "p-3 text-right", children: ["$", product.salePrice.toFixed(2)] }), _jsxs("td", { className: "p-3 text-right", children: ["$", (product.stock * product.costPrice).toFixed(2)] }), _jsx("td", { className: "p-3", children: product.stock === 0 ? (_jsx("span", { className: "px-2 py-1 rounded text-xs bg-red-100 text-red-700", children: "Sin Stock" })) : product.stock < product.minStock ? (_jsx("span", { className: "px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700", children: "Stock Bajo" })) : (_jsx("span", { className: "px-2 py-1 rounded text-xs bg-green-100 text-green-700", children: "Normal" })) })] }, product._id))) }), _jsx("tfoot", { className: "bg-gray-50 font-bold", children: _jsxs("tr", { children: [_jsx("td", { colSpan: 3, children: "TOTALES" }), _jsx("td", { className: "p-3 text-right", children: products.reduce((a, p) => a + p.stock, 0) }), _jsx("td", { colSpan: 3 }), _jsxs("td", { className: "p-3 text-right text-green-600", children: ["$", products.reduce((a, p) => a + (p.stock * p.costPrice), 0).toFixed(2)] }), _jsx("td", {})] }) })] }) })] })), activeReport === "profits" && (_jsxs("div", { className: "bg-white rounded-xl shadow-md p-6 space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-lg font-bold", children: "An\u00E1lisis de Ganancias" }), _jsxs("button", { onClick: () => {
                                    const topProductsList = Object.values(topProducts)
                                        .sort((a, b) => b.profit - a.profit)
                                        .map((p, i) => ({ '#': i + 1, ...p, profit: p.profit.toFixed(2), revenue: p.revenue.toFixed(2) }));
                                    exportToCSV(topProductsList, 'ganancias_productos', ['#', 'Producto', 'Cantidad Vendida', 'Ingresos', 'Ganancia']);
                                }, className: "bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition", children: [_jsx(Download, { size: 18 }), "Exportar CSV"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-gradient-to-br from-green-500 to-green-600 text-white p-5 rounded-xl", children: [_jsx("p", { className: "text-green-100 text-sm", children: "Ingresos Totales" }), _jsxs("p", { className: "text-3xl font-bold", children: ["$", totalSalesAmount.toFixed(2)] })] }), _jsxs("div", { className: "bg-gradient-to-br from-red-500 to-red-600 text-white p-5 rounded-xl", children: [_jsx("p", { className: "text-red-100 text-sm", children: "Costo Total" }), _jsxs("p", { className: "text-3xl font-bold", children: ["$", totalCost.toFixed(2)] })] }), _jsxs("div", { className: "bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5 rounded-xl", children: [_jsx("p", { className: "text-blue-100 text-sm", children: "Ganancia Neta" }), _jsxs("p", { className: "text-3xl font-bold", children: ["$", totalProfits.toFixed(2)] }), _jsxs("p", { className: "text-sm text-blue-200", children: ["Margen: ", totalSalesAmount > 0 ? ((totalProfits / totalSalesAmount) * 100).toFixed(1) : 0, "%"] })] })] }), _jsx("h3", { className: "font-bold text-lg mt-6", children: "Productos m\u00E1s Rentables" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { className: "text-left", children: [_jsx("th", { className: "p-3 font-medium", children: "#" }), _jsx("th", { className: "p-3 font-medium", children: "Producto" }), _jsx("th", { className: "p-3 font-medium text-right", children: "Cantidad Vendida" }), _jsx("th", { className: "p-3 font-medium text-right", children: "Ingresos" }), _jsx("th", { className: "p-3 font-medium text-right", children: "Ganancia" }), _jsx("th", { className: "p-3 font-medium text-right", children: "% del Total" })] }) }), _jsxs("tbody", { children: [Object.values(topProducts)
                                            .sort((a, b) => b.profit - a.profit)
                                            .slice(0, 20)
                                            .map((product, i) => (_jsxs("tr", { className: "border-t hover:bg-gray-50", children: [_jsx("td", { className: "p-3 font-medium", children: i + 1 }), _jsx("td", { className: "p-3", children: product.name }), _jsx("td", { className: "p-3 text-right font-bold", children: product.quantity }), _jsxs("td", { className: "p-3 text-right", children: ["$", product.revenue.toFixed(2)] }), _jsxs("td", { className: "p-3 text-right text-green-600 font-bold", children: ["$", product.profit.toFixed(2)] }), _jsxs("td", { className: "p-3 text-right text-gray-500", children: [totalProfits > 0 ? ((product.profit / totalProfits) * 100).toFixed(1) : 0, "%"] })] }, product.name))), Object.keys(topProducts).length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "p-8 text-center text-gray-400", children: "No hay datos de ventas" }) }))] })] }) })] })), activeReport === "clients" && (_jsxs("div", { className: "bg-white rounded-xl shadow-md p-6 space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-lg font-bold", children: "Top Clientes" }), _jsxs("button", { onClick: () => exportToCSV(topClients.map((c, i) => ({
                                    '#': i + 1,
                                    Nombre: c.name,
                                    'Total Compras': c.totalPurchases,
                                    'Total Gastado': c.totalSpent.toFixed(2)
                                })), 'top_clientes', ['#', 'Nombre', 'Total Compras', 'Total Gastado']), className: "bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition", children: [_jsx(Download, { size: 18 }), "Exportar CSV"] })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { className: "text-left", children: [_jsx("th", { className: "p-3 font-medium", children: "#" }), _jsx("th", { className: "p-3 font-medium", children: "Cliente" }), _jsx("th", { className: "p-3 font-medium text-right", children: "Compras Realizadas" }), _jsx("th", { className: "p-3 font-medium text-right", children: "Total Gastado" }), _jsx("th", { className: "p-3 font-medium text-right", children: "Ticket Promedio" }), _jsx("th", { className: "p-3 font-medium", children: "Estado" })] }) }), _jsxs("tbody", { children: [topClients.map((client, i) => (_jsxs("tr", { className: "border-t hover:bg-gray-50", children: [_jsx("td", { className: "p-3 font-bold", children: i + 1 }), _jsx("td", { className: "p-3", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: `w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-400' : 'bg-blue-500'}`, children: client.name.charAt(0).toUpperCase() }), _jsx("span", { className: "font-medium", children: client.name })] }) }), _jsx("td", { className: "p-3 text-right font-bold", children: client.totalPurchases }), _jsxs("td", { className: "p-3 text-right text-green-600 font-bold", children: ["$", client.totalSpent.toFixed(2)] }), _jsxs("td", { className: "p-3 text-right", children: ["$", client.totalPurchases > 0 ? (client.totalSpent / client.totalPurchases).toFixed(2) : '0.00'] }), _jsxs("td", { className: "p-3", children: [i === 0 && _jsx("span", { className: "px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700", children: "\uD83E\uDD47 Top" }), i === 1 && _jsx("span", { className: "px-2 py-1 rounded text-xs bg-gray-100 text-gray-700", children: "\uD83E\uDD48 2do" }), i === 2 && _jsx("span", { className: "px-2 py-1 rounded text-xs bg-orange-100 text-orange-700", children: "\uD83E\uDD49 3ro" }), i > 2 && _jsx("span", { className: "px-2 py-1 rounded text-xs bg-blue-100 text-blue-700", children: "Cliente" })] })] }, client._id))), topClients.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "p-8 text-center text-gray-400", children: "No hay datos de clientes con compras" }) }))] })] }) })] }))] }));
};
export default ReportsPage;
