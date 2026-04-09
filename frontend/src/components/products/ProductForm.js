import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { productService, categoryService } from "../../services/api";
import { Package, Tag, Info } from "lucide-react";
const ProductForm = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        sku: "",
        name: "",
        brand: "",
        description: "",
        categoryId: "",
        price: "",
        cost: "",
        stock: "",
        minStock: "",
        maxStock: "",
        unit: "unidad",
        imageUrl: "",
    });
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, catRes] = await Promise.all([
                    productService.getAll(),
                    categoryService.getAll(),
                ]);
                const mappedProducts = prodRes.data.map((p) => ({
                    ...p,
                    id: p._id,
                }));
                setProducts(mappedProducts);
                setCategories(catRes.data);
            }
            catch (err) {
                console.error("Error fetching data:", err);
            }
        };
        fetchData();
    }, []);
    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    const validate = () => {
        const newErrors = {};
        if (!form.sku.trim())
            newErrors.sku = "SKU requerido";
        if (products.some(p => p.sku?.toLowerCase() === form.sku.toLowerCase()))
            newErrors.sku = "El SKU ya existe";
        if (!form.name.trim())
            newErrors.name = "Nombre requerido";
        if (!form.brand.trim())
            newErrors.brand = "Marca requerida";
        if (!form.categoryId)
            newErrors.categoryId = "Seleccione categoría";
        if (!form.price || Number(form.price) <= 0)
            newErrors.price = "Precio inválido";
        if (!form.stock || Number(form.stock) < 0)
            newErrors.stock = "Stock requerido";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async () => {
        if (!validate())
            return;
        if (!window.confirm("¿Desea guardar el producto?"))
            return;
        setLoading(true);
        try {
            await productService.create({
                sku: form.sku.toUpperCase(),
                name: form.name,
                brand: form.brand,
                description: form.description,
                categoryId: form.categoryId,
                price: Number(form.price),
                cost: Number(form.cost) || 0,
                stock: Number(form.stock),
                minStock: Number(form.minStock) || 5,
                maxStock: Number(form.maxStock) || 100,
                unit: form.unit,
                imageUrl: form.imageUrl,
                status: "active",
            });
            navigate("/products");
        }
        catch (err) {
            setErrors({ submit: err.response?.data?.message || "Error al crear producto" });
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "p-6 max-w-4xl mx-auto space-y-6 bg-white rounded-lg shadow-md", children: [_jsxs("div", { className: "border-b pb-4", children: [_jsxs("h2", { className: "text-2xl font-bold flex items-center gap-2", children: [_jsx(Package, { className: "text-blue-600", size: 28 }), "Nuevo Producto"] }), _jsx("p", { className: "text-gray-500 text-sm mt-1", children: "Complete todos los campos obligatorios (*)" })] }), errors.submit && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg", children: errors.submit })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "flex flex-col", children: [_jsxs("label", { className: "font-medium mb-1 text-gray-700", children: ["SKU ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { name: "sku", placeholder: "Ej: NBK-001", value: form.sku, onChange: handleChange, className: "border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase" }), errors.sku && _jsx("span", { className: "text-red-500 text-sm mt-1", children: errors.sku })] }), _jsxs("div", { className: "flex flex-col lg:col-span-2", children: [_jsxs("label", { className: "font-medium mb-1 text-gray-700", children: ["Nombre del Producto ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { name: "name", placeholder: "Ej: Notebook XPS 15 9530", value: form.name, onChange: handleChange, className: "border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" }), errors.name && _jsx("span", { className: "text-red-500 text-sm mt-1", children: errors.name })] }), _jsxs("div", { className: "flex flex-col", children: [_jsxs("label", { className: "font-medium mb-1 text-gray-700 flex items-center gap-1", children: [_jsx(Tag, { size: 16 }), "Marca ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { name: "brand", placeholder: "Ej: Dell, Apple, Samsung", value: form.brand, onChange: handleChange, className: "border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" }), errors.brand && _jsx("span", { className: "text-red-500 text-sm mt-1", children: errors.brand })] }), _jsxs("div", { className: "flex flex-col", children: [_jsxs("label", { className: "font-medium mb-1 text-gray-700", children: ["Categor\u00EDa ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs("select", { name: "categoryId", value: form.categoryId, onChange: handleChange, className: "border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white", children: [_jsx("option", { value: "", children: "Seleccione categor\u00EDa" }), categories.map(c => (_jsx("option", { value: c._id, children: c.name }, c._id)))] }), errors.categoryId && _jsx("span", { className: "text-red-500 text-sm mt-1", children: errors.categoryId })] }), _jsxs("div", { className: "flex flex-col", children: [_jsxs("label", { className: "font-medium mb-1 text-gray-700", children: ["Precio de Venta ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-4 top-1/2 -translate-y-1/2 text-gray-400", children: "$" }), _jsx("input", { name: "price", type: "number", step: "0.01", placeholder: "0.00", value: form.price, onChange: handleChange, className: "w-full border rounded-lg pl-8 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), errors.price && _jsx("span", { className: "text-red-500 text-sm mt-1", children: errors.price })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("label", { className: "font-medium mb-1 text-gray-700", children: "Costo" }), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-4 top-1/2 -translate-y-1/2 text-gray-400", children: "$" }), _jsx("input", { name: "cost", type: "number", step: "0.01", placeholder: "0.00", value: form.cost, onChange: handleChange, className: "w-full border rounded-lg pl-8 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" })] })] }), _jsxs("div", { className: "flex flex-col", children: [_jsxs("label", { className: "font-medium mb-1 text-gray-700", children: ["Stock Inicial ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { name: "stock", type: "number", placeholder: "Cantidad", value: form.stock, onChange: handleChange, className: "border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" }), errors.stock && _jsx("span", { className: "text-red-500 text-sm mt-1", children: errors.stock })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("label", { className: "font-medium mb-1 text-gray-700", children: "Stock M\u00EDnimo" }), _jsx("input", { name: "minStock", type: "number", placeholder: "Alerta", value: form.minStock, onChange: handleChange, className: "border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("label", { className: "font-medium mb-1 text-gray-700", children: "Stock M\u00E1ximo" }), _jsx("input", { name: "maxStock", type: "number", placeholder: "M\u00E1ximo", value: form.maxStock, onChange: handleChange, className: "border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("label", { className: "font-medium mb-1 text-gray-700", children: "Unidad" }), _jsxs("select", { name: "unit", value: form.unit, onChange: handleChange, className: "border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white", children: [_jsx("option", { value: "unidad", children: "Unidad" }), _jsx("option", { value: "pieza", children: "Pieza" }), _jsx("option", { value: "caja", children: "Caja" }), _jsx("option", { value: "kg", children: "Kilogramo" }), _jsx("option", { value: "litro", children: "Litro" }), _jsx("option", { value: "metro", children: "Metro" })] })] }), _jsxs("div", { className: "flex flex-col lg:col-span-2", children: [_jsx("label", { className: "font-medium mb-1 text-gray-700", children: "URL de Imagen" }), _jsx("input", { name: "imageUrl", placeholder: "https://ejemplo.com/imagen.jpg", value: form.imageUrl, onChange: handleChange, className: "border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" })] })] }), _jsxs("div", { className: "flex flex-col", children: [_jsxs("label", { className: "font-medium mb-1 text-gray-700 flex items-center gap-1", children: [_jsx(Info, { size: 16 }), "Descripci\u00F3n"] }), _jsx("textarea", { name: "description", placeholder: "Caracter\u00EDsticas, especificaciones t\u00E9cnicas, modelo completo, etc.", value: form.description, onChange: handleChange, rows: 4, className: "border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" }), _jsx("p", { className: "text-gray-400 text-xs mt-1", children: "Ej: 16GB RAM, 512GB SSD, Procesador Intel Core i7, Pantalla 15.6\"" })] }), form.imageUrl && (_jsxs("div", { className: "border-t pt-4", children: [_jsx("label", { className: "font-medium mb-2 text-gray-700 block", children: "Vista Previa" }), _jsx("img", { src: form.imageUrl, alt: "preview", className: "w-48 h-48 object-contain border rounded-lg shadow-sm", onError: (e) => {
                            e.target.style.display = 'none';
                        } })] })), _jsxs("div", { className: "flex justify-end gap-3 pt-4 border-t", children: [_jsx("button", { onClick: () => navigate("/products"), className: "px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors", children: "Cancelar" }), _jsx("button", { onClick: handleSubmit, disabled: loading, className: "px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2", children: loading ? (_jsxs(_Fragment, { children: [_jsxs("svg", { className: "animate-spin h-5 w-5", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4", fill: "none" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" })] }), "Guardando..."] })) : (_jsxs(_Fragment, { children: [_jsx(Package, { size: 20 }), "Guardar Producto"] })) })] })] }));
};
export default ProductForm;
