export interface Movement {
  _id?: string;
  id: string;
  productId: string;
  product?: {
    _id: string;
    name: string;
    sku?: string;
  };
  type: "in" | "out" | "adjust" | string;
  quantity: number;
  previousStock?: number;
  newStock?: number;
  reason?: string;
  userId?: string;
  createdBy?: {
    _id?: string;
    name: string;
  };
  createdAt: string;
}
