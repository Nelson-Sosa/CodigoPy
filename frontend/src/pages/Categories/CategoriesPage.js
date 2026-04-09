import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useCategories } from "../../hooks/useCategories";
import { useProducts } from "../../hooks/useProducts";
import CategoryForm from "../../components/Categories/CategoryForm";
import { Tag, Pencil, Trash2, Package } from "lucide-react";
const CategoriesPage = () => {
    const { categories, createCategory, deleteCategory, updateCategory, fetchCategories } = useCategories();
    const { products } = useProducts();
    const getProductCount = (categoryId) => products.filter(p => p.categoryId === categoryId).length;
    const canDeleteCategory = (categoryId) => !products.some(p => p.categoryId === categoryId);
    const [editingCategory, setEditingCategory] = useState(null);
    const handleSave = async (category) => {
        if (editingCategory && editingCategory.id) {
            await updateCategory(editingCategory.id, category);
        }
        else {
            await createCategory(category);
        }
        setEditingCategory(null);
        fetchCategories();
    };
    const handleDelete = async (category) => {
        if (!category.id)
            return;
        if (!canDeleteCategory(category.id)) {
            alert("No se puede eliminar una categoría con productos asociados");
            return;
        }
        if (confirm("¿Está seguro de eliminar esta categoría?")) {
            await deleteCategory(category.id);
            fetchCategories();
        }
    };
    return (_jsxs("div", { className: "p-6 space-y-6 bg-gray-50 min-h-screen", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-bold text-gray-800 flex items-center gap-2", children: [_jsx(Tag, { className: "text-blue-600", size: 28 }), "Categor\u00EDas"] }), _jsxs("p", { className: "text-gray-500 text-sm", children: [categories.length, " categor\u00EDas registradas"] })] }) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsx("div", { className: "lg:col-span-2", children: categories.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: categories.map(category => (_jsxs("div", { className: "bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition", children: [_jsxs("div", { className: "mb-3", children: [_jsx("h3", { className: "font-bold text-lg text-gray-800", children: category.name }), category.description && (_jsx("p", { className: "text-sm text-gray-500", children: category.description }))] }), _jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-500 mb-4", children: [_jsx(Package, { size: 16 }), _jsxs("span", { children: [getProductCount(category.id || category._id || ""), " productos"] })] }), _jsxs("div", { className: "flex gap-2 pt-3 border-t", children: [_jsxs("button", { onClick: () => setEditingCategory(category), className: "flex-1 px-3 py-2 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition flex items-center justify-center gap-1", children: [_jsx(Pencil, { size: 14 }), "Editar"] }), _jsxs("button", { onClick: () => handleDelete(category), disabled: !canDeleteCategory(category.id || category._id || ""), className: "flex-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition flex items-center justify-center gap-1 disabled:opacity-50", children: [_jsx(Trash2, { size: 14 }), "Eliminar"] })] })] }, category.id || category._id))) })) : (_jsxs("div", { className: "bg-white rounded-xl shadow-md p-12 text-center", children: [_jsx(Tag, { size: 64, className: "mx-auto mb-4 text-gray-300" }), _jsx("p", { className: "text-gray-500", children: "No hay categor\u00EDas registradas" }), _jsx("p", { className: "text-sm text-gray-400", children: "Crea tu primera categor\u00EDa usando el formulario" })] })) }), _jsx("div", { className: "lg:col-span-1", children: _jsx(CategoryForm, { onSave: handleSave, editingCategory: editingCategory, onCancel: () => setEditingCategory(null) }) })] })] }));
};
export default CategoriesPage;
