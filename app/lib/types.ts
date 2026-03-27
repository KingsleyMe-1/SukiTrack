export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export interface PriceEntry {
  date: string; // ISO date string
  price: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
  currentPrice: number;
  targetPrice?: number;
  stockStatus: StockStatus;
  stockCount?: number;
  priceHistory: PriceEntry[];
  imageUrl?: string;
  isPromo?: boolean;
  isFeatured?: boolean;
  addedDate: string;
  weeklyUnitsSold?: number;
}

export interface StoreStats {
  totalItems: number;
  lowStockCount: number;
  activePromos: number;
  avgMargin: number;
  priceDropsToday: number;
}
