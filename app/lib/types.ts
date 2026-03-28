export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export type UserRole = "customer" | "store_owner";

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
  /** Scopes this product to a store owner (email). "seed" = demo data. Replace with UUID on Supabase migration. */
  storeOwnerId?: string;
}

export interface StoreStats {
  totalItems: number;
  lowStockCount: number;
  activePromos: number;
  avgMargin: number;
  priceDropsToday: number;
}

/** Active user session — stored in localStorage. Replace with Supabase Auth JWT on migration. */
export interface UserSession {
  role: UserRole;
  id: string;
  name: string;
  email: string;
  storeName?: string;
  signedInAt: string;
}

/** Store owner account record in the local user registry. */
export interface StoreUserAccount {
  id: string;
  email: string;
  name: string;
  storeName: string;
  /** Plain-text password. Replace with Supabase Auth on migration. */
  password: string;
  createdAt: string;
}

/** Customer account record in the local customer registry. */
export interface CustomerAccount {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}
