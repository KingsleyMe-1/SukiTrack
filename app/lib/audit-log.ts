/**
 * Append-only audit trail in localStorage. Swap for Supabase `audit_log` table later.
 */
import type { Product } from "./types";

const AUDIT_KEY = "sukitrack_audit_log";
const MAX_ENTRIES = 300;

export type AuditAction =
  | "product_created"
  | "product_updated"
  | "product_deleted"
  | "bulk_delete"
  | "import_replace"
  | "import_merge"
  | "store_name_updated";

export interface AuditEntry {
  id: string;
  at: string;
  action: AuditAction;
  productId?: string;
  productName?: string;
  summary?: string;
}

function generateAuditId(): string {
  return `aud_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getAuditLog(): AuditEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AuditEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(entries: AuditEntry[]): void {
  localStorage.setItem(AUDIT_KEY, JSON.stringify(entries));
}

export function appendAudit(
  partial: Omit<AuditEntry, "id" | "at"> & { id?: string }
): void {
  if (typeof window === "undefined") return;
  const entry: AuditEntry = {
    id: partial.id ?? generateAuditId(),
    at: new Date().toISOString(),
    action: partial.action,
    productId: partial.productId,
    productName: partial.productName,
    summary: partial.summary,
  };
  const next = [entry, ...getAuditLog()].slice(0, MAX_ENTRIES);
  persist(next);
}

export function clearAuditLog(): void {
  if (typeof window === "undefined") return;
  persist([]);
}

export function summarizeProductDiff(before: Product | undefined, after: Product): string {
  if (!before) return `Created at P${after.currentPrice.toFixed(2)}`;
  const parts: string[] = [];
  if (before.currentPrice !== after.currentPrice) {
    parts.push(`price ${before.currentPrice} → ${after.currentPrice}`);
  }
  if (before.name !== after.name) parts.push("name changed");
  if (before.stockStatus !== after.stockStatus) parts.push(`stock ${before.stockStatus} → ${after.stockStatus}`);
  if (before.category !== after.category) parts.push("category changed");
  return parts.length ? parts.join("; ") : "Updated (no field diff detected)";
}
