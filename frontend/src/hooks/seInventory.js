import { useEffect, useState } from "react";
import { productService, movementService } from "../services/api";
export const useInventory = () => {
    const [products, setProducts] = useState([]);
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, movRes] = await Promise.all([
                    productService.getAll(),
                    movementService.getAll({ limit: 100 }),
                ]);
                const mappedProducts = prodRes.data.map((p) => ({
                    ...p,
                    id: p._id,
                    cost: p.costPrice || p.cost,
                }));
                const mappedMovements = movRes.data.map((m) => ({
                    ...m,
                    id: m._id,
                }));
                setProducts(mappedProducts);
                setMovements(mappedMovements);
            }
            catch (err) {
                console.error("Error fetching inventory:", err);
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.stock < p.minStock && p.stock > 0);
    const outOfStockProducts = products.filter(p => p.stock === 0);
    const totalInventoryValue = products.reduce((acc, p) => acc + p.stock * p.cost, 0);
    const today = new Date().toISOString().slice(0, 10);
    const movementsToday = movements.filter(m => m.createdAt.startsWith(today));
    const movementCount = {};
    movements.forEach(m => {
        const productId = m.product?._id || m.productId;
        movementCount[productId] = (movementCount[productId] || 0) + m.quantity;
    });
    const top5Products = Object.entries(movementCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([productId, qty]) => ({
        product: products.find(p => p._id === productId || p.id === productId)?.name || productId,
        quantity: qty,
    }));
    return {
        products,
        movements,
        loading,
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        totalInventoryValue,
        movementsToday,
        top5Products,
    };
};
