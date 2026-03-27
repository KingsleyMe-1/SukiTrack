import type { Product } from "./types";

const STORE_KEY = "sukitrack_products";
const STORE_NAME_KEY = "sukitrack_store_name";

export function getStoreName(): string {
  if (typeof window === "undefined") return "The Hearth Store";
  return localStorage.getItem(STORE_NAME_KEY) ?? "The Hearth Store";
}

export function setStoreName(name: string): void {
  localStorage.setItem(STORE_NAME_KEY, name);
}

export function getProducts(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Product[];
  } catch {
    return [];
  }
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(products));
}

export function getProduct(id: string): Product | undefined {
  return getProducts().find((p) => p.id === id);
}

export function upsertProduct(product: Product): void {
  const products = getProducts();
  const idx = products.findIndex((p) => p.id === product.id);
  if (idx >= 0) {
    products[idx] = product;
  } else {
    products.unshift(product);
  }
  saveProducts(products);
}

export function deleteProduct(id: string): void {
  saveProducts(getProducts().filter((p) => p.id !== id));
}

export function generateId(): string {
  return `prod_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/** Returns products where price dropped since the previous entry, within the last 24 h */
export function getPriceDropsToday(products: Product[]): Product[] {
  return products.filter((p) => {
    if (p.priceHistory.length < 2) return false;
    const sorted = [...p.priceHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return sorted[0].price < sorted[1].price;
  });
}

export function computeAvgMargin(products: Product[]): number {
  if (!products.length) return 0;
  const margins = products.map((p) => {
    const h = p.priceHistory;
    if (h.length < 2) return 0;
    const sorted = [...h].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const oldest = sorted[0].price;
    if (!oldest) return 0;
    return ((p.currentPrice - oldest) / oldest) * 100;
  });
  return Math.round(margins.reduce((a, b) => a + b, 0) / margins.length);
}
