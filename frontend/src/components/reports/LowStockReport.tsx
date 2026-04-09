import { Product } from "../../types/Product";

interface Props {
  products: Product[];
}

const LowStockReport = ({ products }: Props) => {
  const lowStock = products.filter(p => (p.stock || 0) <= (p.minStock || 0)); // ✅ CORREGIDO

  if (lowStock.length === 0) return null;

  return (
    <div className="border p-4 rounded space-y-2">
      <h2 className="font-bold text-lg text-red-600">
        Productos con Stock Bajo
      </h2>

      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">SKU</th>
            <th className="border p-2">Producto</th>
            <th className="border p-2">Stock</th>
          </tr>
        </thead>
        <tbody>
          {lowStock.map(p => (
            <tr key={p.id}>
              <td className="border p-2">{p.sku}</td>
              <td className="border p-2">{p.name}</td>
              <td className="border p-2">{p.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LowStockReport;