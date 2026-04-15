import { useState } from "react";
import { Product } from "../../types/Product";
import { Eye, Pencil, Trash2, PackagePlus } from "lucide-react";


interface Props {
  products: Product[];
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onAdjustStock: (product: Product) => void;
  canEdit?: boolean;
}

const ProductTable = ({ products, onDelete, onView, onEdit, onAdjustStock, canEdit = false }: Props) => {
  const [sortField, setSortField] = useState<keyof Product | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const sortedProducts = [...products].sort((a, b) => {
    if (!sortField) return 0;
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === "number" && typeof valB === "number") {
      return sortOrder === "asc" ? valA - valB : valB - valA;
    }
    return sortOrder === "asc"
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
  <div className="w-full overflow-x-auto rounded-lg border bg-white shadow-sm">
    <table className="w-full border-collapse text-sm">
      <thead className="bg-gray-100 text-gray-700">
        <tr>
          <th onClick={() => handleSort("sku")} className="cursor-pointer px-3 py-2 text-left hover:text-blue-600">
            SKU
          </th>
          <th onClick={() => handleSort("name")} className="cursor-pointer px-3 py-2 text-left hover:text-blue-600">
            Nombre
          </th>
          <th onClick={() => handleSort("stock")} className="cursor-pointer px-3 py-2 text-left hover:text-blue-600">
            Stock
          </th>
          <th onClick={() => handleSort("price")} className="cursor-pointer px-3 py-2 text-left hover:text-blue-600">
            Precio
          </th>
          <th onClick={() => handleSort("createdAt")} className="cursor-pointer px-3 py-2 text-left hover:text-blue-600">
            Creado
          </th>
          <th className="px-3 py-2 text-left">Estado</th>
          <th className="px-3 py-2 text-left">Acciones</th>
        </tr>
      </thead>

      <tbody className="divide-y">
        {sortedProducts.map((p) => {
          const stock = p.stock || 0;
          const minStock = p.minStock || 0;
          let stockColor = "text-green-600 font-medium";
          if (stock === 0) stockColor = "text-red-600 font-medium";
          else if (stock < minStock) stockColor = "text-yellow-600 font-medium";

          return (
            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-3 py-2">{p.sku || "N/A"}</td>
              <td className="px-3 py-2 font-medium text-gray-900">{p.name}</td>
              <td className={`px-3 py-2 ${stockColor}`}>{stock}</td>
              <td className="px-3 py-2">${p.price || p.salePrice || 0}</td>
              <td className="px-3 py-2">
                {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "N/A"}
              </td>
              <td className="px-3 py-2 capitalize">{p.status}</td>
              <td className="px-3 py-2">
  <div className="flex items-center gap-3">
    <button
      onClick={() => onView(p.id)}
      className="text-blue-600 hover:text-blue-800"
      title="Ver"
    >
      <Eye size={18} />
    </button>

    {canEdit && (
      <>
        <button
          onClick={() => onEdit(p.id)}
          className="text-yellow-600 hover:text-yellow-800"
          title="Editar"
        >
          <Pencil size={18} />
        </button>

        <button
          onClick={() => onAdjustStock(p)}
          className="text-purple-600 hover:text-purple-800"
          title="Ajustar stock"
        >
          <PackagePlus size={18} />
        </button>

        <button
          onClick={() => onDelete(p.id)}
          className="text-red-600 hover:text-red-800"
          title="Eliminar"
        >
          <Trash2 size={18} />
        </button>
      </>
    )}
  </div>
</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

};

export default ProductTable;
