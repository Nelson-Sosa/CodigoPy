import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { productService, categoryService } from "../../services/api";
import { Package, Tag, Info } from "lucide-react";
const ProductEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({});
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        const fetchData = async () => {
            if (!id)
                return;
            try {
                const [prodRes, catRes] = await Promise.all([
                    productService.getById(id),
                    categoryService.getAll(),
                ]);
                const product = prodRes.data.product;
                setForm({
                    ...product,
                    id: product._id,
                    price: product.salePrice,
                    cost: product.costPrice,
                });
                setCategories(catRes.data);
            }
            catch (err) {
                console.error("Error fetching product:", err);
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);
    const validate = () => {
        const newErrors = {};
        if (!form.name?.trim())
            newErrors.name = "El nombre es obligatorio";
        if (!form.sku?.trim())
            newErrors.sku = "El SKU es obligatorio";
        if (!form.brand?.trim())
            newErrors.brand = "La marca es obligatoria";
        if (!form.price || form.price <= 0)
            newErrors.price = "El precio debe ser mayor a 0";
        if (form.stock === undefined || form.stock < 0)
            newErrors.stock = "El stock no puede ser negativo";
        if (!form.categoryId)
            newErrors.categoryId = "La categoría es obligatoria";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: name === "price" || name === "stock" || name === "cost" || name === "minStock" || name === "maxStock"
                ? Number(value) || 0
                : value,
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate() || !id)
            return;
        if (!window.confirm("¿Seguro que deseas guardar los cambios del producto?"))
            return;
        setSaving(true);
        try {
            await productService.update(id, {
                sku: form.sku,
                name: form.name,
                brand: form.brand,
                description: form.description,
                categoryId: form.categoryId,
                price: form.price,
                cost: form.cost,
                stock: form.stock,
                minStock: form.minStock,
                maxStock: form.maxStock,
                unit: form.unit,
                imageUrl: form.imageUrl,
                status: form.status,
            });
            navigate("/products");
        }
        catch (err) {
            console.error("Error updating product:", err);
            setErrors({ submit: "Error al guardar el producto" });
        }
        finally {
            setSaving(false);
        }
    };
    if (loading) {
        return (_jsx("div", { className: "p-6 flex items-center justify-center min-h-screen", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-500", children: "Cargando producto..." })] }) }));
    }
    return (_jsxs("div", { className: "p-6 max-w-4xl mx-auto space-y-6 bg-white rounded-lg shadow-md", children: [_jsxs("div", { className: "border-b pb-4", children: [_jsxs("h2", { className: "text-2xl font-bold flex items-center gap-2", children: [_jsx(Package, { className: "text-yellow-500", size: 28 }), "Editar Producto"] }), _jsx("p", { className: "text-gray-500 text-sm mt-1", children: "Modifique los campos necesarios" })] }), errors.submit && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg", children: errors.submit })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "flex flex-col", children: [_jsx("label", { className: "font-medium mb-1 text-gray-700", children: "SKU" }), _jsx("input", { name: "sku", value: form.sku || "", onChange: handleChange, placeholder: "SKU", className: "border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase" }), errors.sku && _jsx("span", { className: "text-red-500 text-sm mt-1", children: errors.sku })] }), _jsxs("div", { className: "flex flex-col lg:col-span-2", children: [_jsxs("label", { className: "font-medium mb-1 text-gray-700", children: ["Nombre del Producto ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { name: "name", value: form.name || "", onChange: handleChange, placeholder: "Nombre del producto", className: "border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" }), errors.name && _jsx("span", { className: "text-red-500 text-sm mt-1", children: errors.name })] }), _jsxs("div", { className: "flex flex-col", children: [_jsxs("label", { className: "font-medium mb-1 text-gray-700 flex items-center gap-1", children: [_jsx(Tag, { size: 16 }), "Marca ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { name: "brand", value: form.brand || "", onChange: handleChange, placeholder: "Marca", className: "border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" }), errors.brand && _jsx("span", { className: "text-red-500 text-sm mt-1", children: errors.brand })] }), _jsxs("div", { className: "flex flex-col", children: [_jsxs("label", { className: "font-medium mb-1 text-gray-700", children: ["Categor\u00EDa ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs("select", { name: "categoryId", value: form.categoryId || "", onChange: handleChange, className: "border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white", children: [_jsx("option", { value: "", children: "Seleccionar categor\u00EDa" }), categories.map(c => (_jsx("option", { value: c._id, children: c.name }, c._id)))] }), errors.categoryId && _jsx("span", { className: "text-red-500 text-sm mt-1", children: errors.categoryId })] }), _jsxs("div", { className: "flex flex-col", children: [_jsxs("label", { className: "font-medium mb-1 text-gray-700", children: ["Precio de Venta ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-4 top-1/2 -translate-y-1/2 text-gray-400", children: "$" }), _jsx("input", { name: "price", type: "number", step: "0.01", value: form.price || "", onChange: handleChange, placeholder: "0.00", className: "w-full border rounded-lg pl-8 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), errors.price && _jsx("span", { className: "text-red-500 text-sm mt-1", children: errors.price })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("label", { className: "font-medium mb-1 text-gray-700", children: "Costo" }), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-4 top-1/2 -translate-y-1/2 text-gray-400", children: "$" }), _jsx("input", { name: "cost", type: "number", step: "0.01", value: form.cost || "", onChange: handleChange, placeholder: "0.00", className: "w-full border rounded-lg pl-8 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" })] })] }), _jsxs("div", { className: "flex flex-col", children: [_jsxs("label", { className: "font-medium mb-1 text-gray-700", children: ["Stock ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { name: "stock", type: "number", value: form.stock ?? "", onChange: handleChange, placeholder: "Cantidad", className: "border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" }), errors.stock && _jsx("span", { className: "text-red-500 text-sm mt-1", children: errors.stock })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("label", { className: "font-medium mb-1 text-gray-700", children: "Stock M\u00EDnimo" }), _jsx("input", { name: "minStock", type: "number", value: form.minStock ?? "", onChange: handleChange, placeholder: "Alerta", className: "border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("label", { className: "font-medium mb-1 text-gray-700", children: "Stock M\u00E1ximo" }), _jsx("input", { name: "maxStock", type: "number", value: form.maxStock ?? "", onChange: handleChange, placeholder: "M\u00E1ximo", className: "border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("label", { className: "font-medium mb-1 text-gray-700", children: "Unidad" }), _jsxs("select", { name: "unit", value: form.unit || "unidad", onChange: handleChange, className: "border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white", children: [_jsx("option", { value: "unidad", children: "Unidad" }), _jsx("option", { value: "pieza", children: "Pieza" }), _jsx("option", { value: "caja", children: "Caja" }), _jsx("option", { value: "kg", children: "Kilogramo" }), _jsx("option", { value: "litro", children: "Litro" }), _jsx("option", { value: "metro", children: "Metro" })] })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("label", { className: "font-medium mb-1 text-gray-700", children: "Estado" }), _jsxs("select", { name: "status", value: form.status || "active", onChange: handleChange, className: "border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white", children: [_jsx("option", { value: "active", children: "Activo" }), _jsx("option", { value: "inactive", children: "Inactivo" }), _jsx("option", { value: "discontinued", children: "Descontinuado" })] })] }), _jsxs("div", { className: "flex flex-col lg:col-span-2", children: [_jsx("label", { className: "font-medium mb-1 text-gray-700", children: "URL de Imagen" }), _jsx("input", { name: "imageUrl", value: form.imageUrl || "", onChange: handleChange, placeholder: "https://ejemplo.com/imagen.jpg", className: "border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" })] })] }), _jsxs("div", { className: "flex flex-col", children: [_jsxs("label", { className: "font-medium mb-1 text-gray-700 flex items-center gap-1", children: [_jsx(Info, { size: 16 }), "Descripci\u00F3n"] }), _jsx("textarea", { name: "description", value: form.description || "", onChange: handleChange, placeholder: "Caracter\u00EDsticas, especificaciones t\u00E9cnicas, modelo completo, etc.", rows: 4, className: "border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" })] }), form.imageUrl && (_jsxs("div", { className: "border-t pt-4", children: [_jsx("label", { className: "font-medium mb-2 text-gray-700 block", children: "Vista Previa" }), _jsx("img", { src: form.imageUrl, alt: "Preview", className: "w-48 h-48 object-contain border rounded-lg shadow-sm", onError: (e) => {
                                    e.target.style.display = 'none';
                                } })] })), _jsxs("div", { className: "flex justify-end gap-3 pt-4 border-t", children: [_jsx("button", { type: "button", onClick: () => navigate("/products"), className: "px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors", children: "Cancelar" }), _jsx("button", { type: "submit", disabled: saving, className: "px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2", children: saving ? (_jsxs(_Fragment, { children: [_jsxs("svg", { className: "animate-spin h-5 w-5", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4", fill: "none" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" })] }), "Guardando..."] })) : ("Guardar Cambios") })] })] })] }));
};
export default ProductEditPage;
