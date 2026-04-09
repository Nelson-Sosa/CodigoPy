import { useEffect, useState } from "react";
import { categoryService } from "../services/api";
export const useCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchCategories();
    }, []);
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await categoryService.getAll();
            const mapped = res.data.map((c) => ({
                ...c,
                id: c._id,
            }));
            setCategories(mapped);
        }
        catch (err) {
            console.error("Error fetching categories:", err);
        }
        finally {
            setLoading(false);
        }
    };
    const createCategory = async (category) => {
        await categoryService.create(category);
        fetchCategories();
    };
    const updateCategory = async (id, category) => {
        await categoryService.update(id, category);
        fetchCategories();
    };
    const deleteCategory = async (id) => {
        await categoryService.delete(id);
        fetchCategories();
    };
    return {
        categories,
        loading,
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory,
    };
};
