import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Tag } from "lucide-react";
const CategoryForm = ({ onSave, editingCategory, onCancel }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    useEffect(() => {
        if (editingCategory) {
            setName(editingCategory.name);
            setDescription(editingCategory.description || "");
        }
        else {
            setName("");
            setDescription("");
        }
    }, [editingCategory]);
    const handleSubmit = () => {
        if (!name.trim()) {
            setError("El nombre es requerido");
            return;
        }
        onSave({
            name: name.trim(),
            description: description.trim(),
        });
        setName("");
        setDescription("");
        setError("");
    };
    return (_jsxs("div", { className: "bg-white rounded-xl shadow-md p-6 border", children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx(Tag, { className: "text-blue-600", size: 24 }), _jsx("h2", { className: "text-lg font-bold text-gray-800", children: editingCategory ? "Editar Categoría" : "Nueva Categoría" })] }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm", children: error })), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["Nombre ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "text", placeholder: "Ej: Laptops, Smartphones, Accesorios", value: name, onChange: (e) => {
                                    setName(e.target.value);
                                    setError("");
                                }, className: "w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Descripci\u00F3n" }), _jsx("input", { type: "text", placeholder: "Breve descripci\u00F3n", value: description, onChange: (e) => setDescription(e.target.value), className: "w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" })] })] }), _jsxs("div", { className: "flex gap-3 mt-6", children: [onCancel && (_jsx("button", { type: "button", onClick: onCancel, className: "flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 transition", children: "Cancelar" })), _jsx("button", { type: "button", onClick: handleSubmit, className: "flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium", children: editingCategory ? "Actualizar" : "Crear Categoría" })] })] }));
};
export default CategoryForm;
