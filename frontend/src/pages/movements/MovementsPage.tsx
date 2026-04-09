import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { movementService, productService } from "../../services/api";
import { format } from "date-fns";

import MovementForm from "../../components/movements/MovementForm";
import MovementTable from "../../components/movements/MovementTable";

interface Product {
  _id: string;
  id: string;
  name: string;
  sku: string;
}

interface Movement {
  _id: string;
  id: string;
  product?: { _id: string; name: string };
  productId: string;
  type: "in" | "out" | "adjust";
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  createdBy?: { name: string };
  createdAt: string;
}

const MovementsPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);

  const [filterType, setFilterType] = useState("Todos");
  const [filterProduct, setFilterProduct] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const loadData = async () => {
    try {
      const [productsRes, movementsRes] = await Promise.all([
        productService.getAll(),
        movementService.getAll({ limit: 200 }),
      ]);

      const mappedProducts = productsRes.data.map((p: any) => ({
        ...p,
        id: p._id,
      }));

      const mappedMovements = movementsRes.data
        .filter((m: any) => !m.reason?.startsWith("Venta "))
        .map((m: any) => ({
          ...m,
          id: m._id,
        }));

      setProducts(mappedProducts);
      setMovements(mappedMovements);
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getTypeLabel = (type: string) => {
    if (type === "in") return "entrada";
    if (type === "out") return "salida";
    return "ajuste";
  };

  const filteredMovements = movements.filter((m) => {
    const mappedType = getTypeLabel(m.type);
    const matchesType = filterType === "Todos" || mappedType === filterType;
    const matchesProduct = !filterProduct || (m.product?._id || m.productId) === filterProduct;
    const matchesStart =
      !filterStartDate || new Date(m.createdAt) >= new Date(filterStartDate);
    const matchesEnd =
      !filterEndDate || new Date(m.createdAt) <= new Date(filterEndDate + "T23:59:59");

    return matchesType && matchesProduct && matchesStart && matchesEnd;
  });

  const exportCSV = () => {
    const headers = [
      "Producto",
      "Tipo",
      "Cantidad",
      "Stock anterior",
      "Stock nuevo",
      "Motivo",
      "Usuario",
      "Fecha",
    ];

    const rows = filteredMovements.map((m) => [
      m.product?.name || "",
      getTypeLabel(m.type),
      m.quantity,
      m.previousStock,
      m.newStock,
      m.reason,
      m.createdBy?.name || "",
      format(new Date(m.createdAt), "yyyy-MM-dd HH:mm"),
    ]);

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `movements_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Movimientos de Inventario</h1>
          <p className="text-gray-500 text-sm mt-1">
            Entradas por compra, ajustes y movimientos internos. 
            <span className="text-blue-600 ml-1">Ventas → Módulo Ventas</span>
          </p>
        </div>
      </div>

      <MovementForm onMovementSaved={loadData} />

      <div className="flex flex-wrap gap-3 items-center mt-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="Todos">Todos</option>
          <option value="entrada">Entrada</option>
          {(user?.role === "admin" || user?.role === "supervisor") && (
            <option value="salida">Salida manual</option>
          )}
          <option value="ajuste">Ajuste</option>
        </select>

        <select
          value={filterProduct}
          onChange={(e) => setFilterProduct(e.target.value)}
          className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Todos los productos</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filterStartDate}
          onChange={(e) => setFilterStartDate(e.target.value)}
          className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="date"
          value={filterEndDate}
          onChange={(e) => setFilterEndDate(e.target.value)}
          className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          onClick={exportCSV}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Exportar CSV
        </button>
      </div>

      <MovementTable movements={filteredMovements} products={products} />
    </div>
  );
};

export default MovementsPage;
