export interface Product {
  _id?: string;
  id: string;
  sku?: string;
  barcode?: string;
  name: string;
  brand?: string;
  description?: string;
  category?: { _id?: string; name: string; color?: string; icon?: string };
  categoryId?: string;
  price?: number;
  salePrice?: number;
  cost?: number;
  costPrice?: number;
  stock?: number;
  minStock?: number;
  maxStock?: number;
  unit?: string;
  status?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}
