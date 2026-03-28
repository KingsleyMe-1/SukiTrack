import type { Product } from "./types";
import { appendAudit, summarizeProductDiff } from "./audit-log";
import { isAdminAuthenticated } from "./admin-session";
import { isStoreOwner, getUserSession } from "./user-session";

export class AdminMutationForbiddenError extends Error {
  constructor(message = "Only administrators can change data.") {
    super(message);
    this.name = "AdminMutationForbiddenError";
  }
}

function requireAdminForMutations(): void {
  if (typeof window === "undefined") return;
  if (!isAdminAuthenticated() && !isStoreOwner()) {
    throw new AdminMutationForbiddenError();
  }
}

const STORE_KEY = "sukitrack_products";
const STORE_NAME_KEY = "sukitrack_store_name";

export const STORE_NAME_CHANGED_EVENT = "sukitrack-store-name";

export function getStoreName(): string {
  if (typeof window === "undefined") return "The Hearth Store";
  return localStorage.getItem(STORE_NAME_KEY) ?? "The Hearth Store";
}

export function setStoreName(name: string): void {
  requireAdminForMutations();
  const trimmed = name.trim();
  localStorage.setItem(STORE_NAME_KEY, trimmed || "The Hearth Store");
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(STORE_NAME_CHANGED_EVENT));
  }
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

export function getMyProducts(): Product[] {
  if (typeof window === "undefined") return [];
  const session = getUserSession();
  const all = getProducts();
  if (!session || session.role !== "store_owner") return all;
  return all.filter((p) => p.storeOwnerId === session.email);
}

export function seedNewStoreOwner(products: Product[]): void {
  if (typeof window === "undefined") return;
  const all = getProducts();
  saveProducts([...all, ...products]);
}

export function upsertProduct(
  product: Product,
  options?: { skipAudit?: boolean }
): void {
  requireAdminForMutations();
  const products = getProducts();
  const idx = products.findIndex((p) => p.id === product.id);
  const previous = idx >= 0 ? products[idx] : undefined;
  if (idx >= 0) {
    products[idx] = product;
  } else {
    products.unshift(product);
  }
  saveProducts(products);
  if (!options?.skipAudit) {
    appendAudit({
      action: previous ? "product_updated" : "product_created",
      productId: product.id,
      productName: product.name,
      summary: summarizeProductDiff(previous, product),
    });
  }
}

export function deleteProduct(id: string, options?: { skipAudit?: boolean }): void {
  requireAdminForMutations();
  const existing = getProduct(id);
  saveProducts(getProducts().filter((p) => p.id !== id));
  if (!options?.skipAudit && existing) {
    appendAudit({
      action: "product_deleted",
      productId: id,
      productName: existing.name,
    });
  }
}

export function replaceAllProducts(products: Product[]): void {
  requireAdminForMutations();
  saveProducts(products);
  appendAudit({
    action: "import_replace",
    summary: `Replaced catalog with ${products.length} product(s)`,
  });
}

export function mergeProductsFromImport(incoming: Product[]): void {
  requireAdminForMutations();
  const map = new Map(getProducts().map((p) => [p.id, p]));
  for (const p of incoming) {
    map.set(p.id, p);
  }
  const next = Array.from(map.values());
  saveProducts(next);
  appendAudit({
    action: "import_merge",
    summary: `Merged ${incoming.length} product(s); catalog now ${next.length} item(s)`,
  });
}

export function deleteProductsBulk(ids: string[]): void {
  requireAdminForMutations();
  if (!ids.length) return;
  const idSet = new Set(ids);
  const products = getProducts();
  const removed = products.filter((p) => idSet.has(p.id));
  saveProducts(products.filter((p) => !idSet.has(p.id)));
  if (removed.length) {
    const preview = removed.map((r) => r.name).slice(0, 5).join(", ");
    appendAudit({
      action: "bulk_delete",
      summary: `Removed ${removed.length} product(s): ${preview}${removed.length > 5 ? "…" : ""}`,
    });
  }
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
