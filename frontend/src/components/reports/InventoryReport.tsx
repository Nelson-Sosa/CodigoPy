// (todos los productos con stock)
import { Product } from "../../types/Product";

interface Props {
  products: Product[];
}

const InventoryReport = ({ products }: Props) => {
  return (
    <div className="border p-4 rounded space-y-2">
      <h2 className="font-bold text-lg">Inventario Actual</h2>

      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">SKU</th>
            <th className="border p-2">Producto</th>
            <th className="border p-2">Stock</th>
          </tr>
        </thead>

        <tbody>
          {products.map((p) => (
            <tr key={p.id || p.id}>
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

export default InventoryReport;