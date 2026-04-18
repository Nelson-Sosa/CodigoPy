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
  <div className="w-full overflow-x-auto rounded-xl border bg-white shadow-sm">
    <table className="w-full min-w-[700px] border-collapse text-sm">
      <thead className="bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700">
        <tr>
          <th onClick={() => handleSort("sku")} className="cursor-pointer px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs font-semibold uppercase tracking-wider hover:text-blue-600 transition-colors">
            SKU
          </th>
          <th onClick={() => handleSort("name")} className="cursor-pointer px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs font-semibold uppercase tracking-wider hover:text-blue-600 transition-colors">
            Nombre
          </th>
          <th onClick={() => handleSort("stock")} className="cursor-pointer px-2 sm:px-4 py-2.5 sm:py-3 text-left text-xs font-semibold uppercase tracking-wider hover:text-blue-600 transition-colors">
            Stock
          </th>
          <th onClick={() => handleSort("price")} className="cursor-pointer px-2 sm:px-4 py-2.5 sm:py-3 text-left text-xs font-semibold uppercase tracking-wider hover:text-blue-600 transition-colors">
            Precio
          </th>
          <th onClick={() => handleSort("createdAt")} className="cursor-pointer px-2 sm:px-4 py-2.5 sm:py-3 text-left text-xs font-semibold uppercase tracking-wider hover:text-blue-600 transition-colors hidden sm:table-cell">
            Creado
          </th>
          <th className="px-2 sm:px-4 py-2.5 sm:py-3 text-left text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Estado</th>
          <th className="px-2 sm:px-4 py-2.5 sm:py-3 text-left text-xs font-semibold uppercase tracking-wider">Acciones</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-100">
        {sortedProducts.map((p) => {
          const stock = p.stock || 0;
          const minStock = p.minStock || 0;
          let stockBadge = "bg-emerald-100 text-emerald-700";
          if (stock === 0) stockBadge = "bg-red-100 text-red-700";
          else if (stock < minStock) stockBadge = "bg-yellow-100 text-yellow-700";

          return (
            <tr key={p.id} className="hover:bg-slate-50 transition-all duration-150">
              <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                <span className="font-mono text-xs bg-slate-100 text-slate-600 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                  {p.sku || "N/A"}
                </span>
              </td>
              <td className="px-3 sm:px-4 py-2.5 sm:py-3 font-medium text-gray-900 text-xs sm:text-sm">{p.name}</td>
              <td className="px-2 sm:px-4 py-2.5 sm:py-3">
                <span className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${stockBadge}`}>
                  {stock}
                </span>
              </td>
              <td className="px-2 sm:px-4 py-2.5 sm:py-3 font-semibold text-green-600 text-xs sm:text-sm">${(p.price || p.salePrice || 0).toFixed(2)}</td>
              <td className="px-2 sm:px-4 py-2.5 sm:py-3 text-gray-500 text-xs hidden sm:table-cell">
                {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "N/A"}
              </td>
              <td className="px-2 sm:px-4 py-2.5 sm:py-3 hidden md:table-cell">
                <span className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                  p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {p.status === 'active' ? 'Activo' : p.status || 'N/A'}
                </span>
              </td>
              <td className="px-2 sm:px-4 py-2.5 sm:py-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onView(p.id)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Ver"
                  >
                    <Eye size={16} />
                  </button>

                  {canEdit && (
                    <>
                      <button
                        onClick={() => onEdit(p.id)}
                        className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => onAdjustStock(p)}
                        className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Ajustar stock"
                      >
                        <PackagePlus size={16} />
                      </button>

                      <button
                        onClick={() => onDelete(p.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
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
