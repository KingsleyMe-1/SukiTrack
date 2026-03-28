import type { ReactNode } from "react";
import type { StockStatus } from "~/lib/types";

export type BadgeVariant =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "muted"
  | "primary"
  | "customer";

const VARIANT_STYLES: Record<BadgeVariant, React.CSSProperties> = {
  success: { backgroundColor: "var(--c-success-bg)", color: "var(--c-success-text)" },
  error:   { backgroundColor: "var(--c-error-bg)",   color: "var(--c-error)" },
  warning: { backgroundColor: "oklch(0.97 0.04 80)", color: "oklch(0.45 0.12 80)" },
  info:    { backgroundColor: "var(--c-info-bg)",    color: "var(--c-info-text)" },
  muted:   { backgroundColor: "var(--muted)",        color: "var(--muted-foreground)" },
  primary: { backgroundColor: "var(--primary)",      color: "var(--primary-foreground)" },
  customer:{ backgroundColor: "var(--customer-color)", color: "var(--customer-color-fg)" },
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = "muted", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${className}`}
      style={VARIANT_STYLES[variant]}
    >
      {children}
    </span>
  );
}

/** Pre-built stock status badge — drop-in for catalog rows and cards. */
const STOCK_VARIANT: Record<StockStatus, BadgeVariant> = {
  "in-stock":    "success",
  "low-stock":   "error",
  "out-of-stock":"muted",
};

const STOCK_LABEL: Record<StockStatus, string> = {
  "in-stock":    "In Stock",
  "low-stock":   "Low Stock",
  "out-of-stock":"Out of Stock",
};

export function StockBadge({ status }: { status: StockStatus }) {
  return <Badge variant={STOCK_VARIANT[status]}>{STOCK_LABEL[status]}</Badge>;
}
