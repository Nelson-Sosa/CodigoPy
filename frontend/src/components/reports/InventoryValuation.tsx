import { Product } from "../../types/Product";

interface Props {
  products: Product[];
}

const InventoryValuation = ({ products }: Props) => {
  const totalValue = products.reduce((sum, p) => {
    const cost = p.costPrice || p.cost || 0;
    const stock = p.stock || 0;
    return sum + (stock * cost);
  }, 0);

  const totalQuantity = products.reduce((sum, p) => sum + (p.stock || 0), 0);

  return (
    <div className="border p-4 rounded space-y-2">
      <h2 className="font-bold text-lg">Valorización del Inventario</h2>
      <p>Total unidades: <strong>{totalQuantity}</strong></p>
      <p>Valor total inventario: <strong>${totalValue.toFixed(2)}</strong></p>

      <table className="w-full border mt-4">
        <thead>
          <tr>
            <th className="border p-2">Producto</th>
            <th className="border p-2">Stock</th>
            <th className="border p-2">Costo Unit.</th>
            <th className="border p-2">Valor Total</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td className="border p-2">{p.name}</td>
              <td className="border p-2">{p.stock || 0}</td>
              <td className="border p-2">${(p.costPrice || p.cost || 0).toFixed(2)}</td>
              <td className="border p-2">
                ${((p.stock || 0) * (p.costPrice || p.cost || 0)).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryValuation;
