import { useEffect, useState } from "react";
import { categoryService } from "../services/api";

export interface Category {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  productCount?: number;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getAll();
      const mapped = res.data.map((c: any) => ({
        ...c,
        id: c._id,
      }));
      setCategories(mapped);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (category: Omit<Category, "_id" | "id" | "productCount">) => {
    await categoryService.create(category);
    fetchCategories();
  };

  const updateCategory = async (id: string, category: Partial<Category>) => {
    await categoryService.update(id, category);
    fetchCategories();
  };

  const deleteCategory = async (id: string) => {
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
