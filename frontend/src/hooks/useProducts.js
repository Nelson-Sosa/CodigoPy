import { useEffect, useState } from "react";
import { productService } from "../services/api";
export const useProducts = (params) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await productService.getAll(params);
            const mapped = res.data.map((p) => ({
                ...p,
                id: p._id,
                price: p.salePrice,
                cost: p.costPrice,
                categoryId: p.category?._id || p.category,
            }));
            setProducts(mapped);
        }
        catch (err) {
            console.error("Error fetching products:", err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchProducts();
    }, [params?.search, params?.category, params?.status, params?.lowStock]);
    const createProduct = async (product) => {
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
    const updateProduct = async (id, product) => {
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
    const deleteProduct = async (id) => {
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
