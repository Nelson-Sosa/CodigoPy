import { useEffect, useState } from "react";
import { productService } from "../services/api";

export interface Product {
  _id?: string;
  id: string;
  sku: string;
  name: string;
  description?: string;
  category?: { _id: string; name: string; color?: string; icon?: string };
  categoryId?: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  status: "active" | "inactive" | "discontinued";
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export const useProducts = (params?: { search?: string; category?: string; status?: string; lowStock?: boolean }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getAll(params);
      const mapped = res.data.map((p: any) => ({
        ...p,
        id: p._id,
        price: p.salePrice,
        cost: p.costPrice,
        categoryId: p.category?._id || p.category,
      }));
      setProducts(mapped);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [params?.search, params?.category, params?.status, params?.lowStock]);

  const createProduct = async (product: Omit<Product, "_id" | "id" | "createdAt" | "updatedAt">) => {
    const data = {
      sku: product.sku,
      name: product.name,
      description: product.description,
      categoryId: product.categoryId,
      price: product.price,
      cost: product.cost,
      stock: product.stock,
      minStock: product.minStock,
      maxStock: product.maxStock,
      unit: product.unit,
      imageUrl: product.imageUrl,
    };
    await productService.create(data);
    fetchProducts();
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    const data = {
      sku: product.sku,
      name: product.name,
      description: product.description,
      categoryId: product.categoryId,
      price: product.price,
      cost: product.cost,
      stock: product.stock,
      minStock: product.minStock,
      maxStock: product.maxStock,
      unit: product.unit,
      imageUrl: product.imageUrl,
      status: product.status,
    };
    await productService.update(id, data);
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    await productService.delete(id);
    fetchProducts();
  };

  return {
    products,
    loading,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};
