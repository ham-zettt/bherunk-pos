export interface ProductRow {
  id: string;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  categoryId: string;
  categoryName: string;
  orderItemCount: number;
}

export interface CategoryOption {
  id: string;
  name: string;
}

export const LOW_STOCK_THRESHOLD = 10;
