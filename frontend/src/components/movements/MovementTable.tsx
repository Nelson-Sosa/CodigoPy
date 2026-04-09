import { Movement } from "../../types/Movement";
import { Product } from "../../types/Product";
import { format } from "date-fns";

interface Props {
  movements: Movement[];
  products: Product[];
}

const MovementTable = ({ movements, products }: Props) => {
  const getTypeLabel = (type: string) => {
    if (type === "in") return "entrada";
    if (type === "out") return "salida";
    return "ajuste";
  };

  const getTypeColor = (type: string) => {
    if (type === "in") return "text-green-600";
    if (type === "out") return "text-red-600";
    return "text-yellow-600";
  };

  return (
    <div className="overflow-x-auto mt-4">
      <table className="min-w-full border-collapse shadow rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left text-sm font-semibold text-gray-700">Producto</th>
            <th className="border p-2 text-left text-sm font-semibold text-gray-700">Tipo</th>
            <th className="border p-2 text-left text-sm font-semibold text-gray-700">Cantidad</th>
            <th className="border p-2 text-left text-sm font-semibold text-gray-700">Stock anterior</th>
            <th className="border p-2 text-left text-sm font-semibold text-gray-700">Stock nuevo</th>
            <th className="border p-2 text-left text-sm font-semibold text-gray-700">Motivo</th>
            <th className="border p-2 text-left text-sm font-semibold text-gray-700">Usuario</th>
            <th className="border p-2 text-left text-sm font-semibold text-gray-700">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((m) => {
            const productId = m.product?._id || m.productId;
            const product = products.find((p) => p.id === productId || p._id === productId);

            return (
              <tr
                key={m.id}
                className="even:bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <td className="border p-2 text-sm text-gray-700">
                  {product?.name || m.product?.name || "N/A"}
                </td>
                <td className={`border p-2 text-sm font-medium ${getTypeColor(m.type)}`}>
                  {getTypeLabel(m.type)}
                </td>
                <td className="border p-2 text-sm text-gray-700">{m.quantity}</td>
                <td className="border p-2 text-sm text-gray-700">{m.previousStock}</td>
                <td className="border p-2 text-sm text-gray-700">{m.newStock}</td>
                <td className="border p-2 text-sm text-gray-700">{m.reason}</td>
                <td className="border p-2 text-sm text-gray-700">
                  {m.createdBy?.name || m.userId || "N/A"}
                </td>
                <td className="border p-2 text-sm text-gray-700">
                  {format(new Date(m.createdAt), "yyyy-MM-dd HH:mm")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MovementTable;
