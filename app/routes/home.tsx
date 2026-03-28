import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  TrendingDown,
  TrendingUp,
  Minus,
  Package,
  ArrowRight,
  CircleDollarSign,
  X,
} from "lucide-react";

import { getMyProducts } from "~/lib/store";
import { useUserSession } from "~/lib/use-user-session";
import type { Product } from "~/lib/types";

export function meta() {
  return [
    { title: "Dashboard - SukiTrack" },
    { name: "description", content: "Your neighborhood price ledger" },
  ];
}

type ModalType = "priceSpikes" | "priceDrops" | "totalRevenue" | null;

// ─── Shared helpers ───────────────────────────────────────────────────────────

function getLatestDelta(product: Product): number {
  const h = [...product.priceHistory].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return h.length >= 2 ? h[0].price - h[1].price : 0;
}

function PriceChange({ delta }: { delta: number }) {
  if (delta < 0)
    return (
      <span
        className="flex items-center gap-1 text-xs font-medium"
        style={{ color: "var(--c-success)" }}
      >
        <TrendingDown size={12} />-P{Math.abs(delta).toFixed(2)}
      </span>
    );
  if (delta > 0)
    return (
      <span
        className="flex items-center gap-1 text-xs font-medium"
        style={{ color: "var(--c-error)" }}
      >
        <TrendingUp size={12} />+P{delta.toFixed(2)}
      </span>
    );
  return (
    <span
      className="flex items-center gap-1 text-xs font-medium"
      style={{ color: "var(--c-text-3)" }}
    >
      <Minus size={12} />Steady
    </span>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="absolute inset-0 transition-opacity"
        style={{ backgroundColor: "var(--c-overlay)" }}
      />
      <div
        className="relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: "var(--card)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <h2
            className="font-display font-bold text-base"
            style={{ color: "var(--foreground)" }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover-btn cursor-pointer transition-colors"
            style={{ color: "var(--muted-foreground)" }}
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto scrollbar-none">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [modal, setModal] = useState<ModalType>(null);
  const session = useUserSession();

  useEffect(() => {
    setProducts(getMyProducts());
  }, []);

  const priceSpikedToday = products.filter((p) => {
    const h = [...p.priceHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return h.length >= 2 && h[0].price > h[1].price;
  });

  const priceDropsToday = products.filter((p) => {
    const h = [...p.priceHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return h.length >= 2 && h[0].price < h[1].price;
  });

  const totalRevenue = products.reduce(
    (acc, p) => acc + p.currentPrice * (p.stockCount ?? 0),
    0
  );

  const quickItems = products.slice(0, 5);

  const ownerFirstName = session?.name?.split(" ")[0] ?? "there";
  const storeName = session?.storeName ?? "Your";

  return (
    <>
      {/* ── Price Spikes Modal ──────────────────────────────────────────────── */}
      <Modal
        open={modal === "priceSpikes"}
        onClose={() => setModal(null)}
        title={`Items Spiked in Price Today (${priceSpikedToday.length})`}
      >
        {priceSpikedToday.length === 0 ? (
          <p
            className="text-sm text-center py-8"
            style={{ color: "var(--muted-foreground)" }}
          >
            No price spikes today.
          </p>
        ) : (
          <div>
            {priceSpikedToday.map((p, idx) => {
              const h = [...p.priceHistory].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
              );
              const delta = h[0].price - h[1].price;
              const pct = ((delta / h[1].price) * 100).toFixed(1);
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between py-3 ${
                    idx < priceSpikedToday.length - 1 ? "border-b" : ""
                  }`}
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "var(--c-error-bg)" }}
                    >
                      <TrendingUp size={14} style={{ color: "var(--c-error)" }} />
                    </div>
                    <div>
                      <p
                        className="font-medium text-sm"
                        style={{ color: "var(--foreground)" }}
                      >
                        {p.name}
                      </p>
                      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                        {p.category} · Was P{h[1].price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className="font-display font-semibold text-sm"
                      style={{ color: "var(--c-error)" }}
                    >
                      +P{delta.toFixed(2)}
                    </p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      ↑ {pct}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>

      {/* ── Price Drops Modal ───────────────────────────────────────────────── */}
      <Modal
        open={modal === "priceDrops"}
        onClose={() => setModal(null)}
        title={`Price Drops Today (${priceDropsToday.length})`}
      >
        {priceDropsToday.length === 0 ? (
          <p
            className="text-sm text-center py-8"
            style={{ color: "var(--muted-foreground)" }}
          >
            No price drops today.
          </p>
        ) : (
          <div>
            {priceDropsToday.map((p, idx) => {
              const h = [...p.priceHistory].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
              );
              const delta = h[0].price - h[1].price;
              const pct = ((Math.abs(delta) / h[1].price) * 100).toFixed(1);
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between py-3 ${
                    idx < priceDropsToday.length - 1 ? "border-b" : ""
                  }`}
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "var(--muted)" }}
                    >
                      <TrendingDown size={14} style={{ color: "var(--c-success)" }} />
                    </div>
                    <div>
                      <p
                        className="font-medium text-sm"
                        style={{ color: "var(--foreground)" }}
                      >
                        {p.name}
                      </p>
                      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                        {p.category} · Was P{h[1].price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className="font-display font-semibold text-sm"
                      style={{ color: "var(--c-success)" }}
                    >
                      -P{Math.abs(delta).toFixed(2)}
                    </p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      ↓ {pct}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>

      {/* ── Total Revenue Modal ─────────────────────────────────────────────── */}
      <Modal
        open={modal === "totalRevenue"}
        onClose={() => setModal(null)}
        title="Total Revenue Breakdown"
      >
        <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>
          Based on current price × stock count. Items with no stock count are excluded.
        </p>
        {products.filter((p) => p.stockCount && p.stockCount > 0).length === 0 ? (
          <p
            className="text-sm text-center py-6"
            style={{ color: "var(--muted-foreground)" }}
          >
            No stock count data available. Set stock counts in the Catalog.
          </p>
        ) : (
          <>
            <div>
              {[...products]
                .filter((p) => p.stockCount && p.stockCount > 0)
                .sort(
                  (a, b) =>
                    b.currentPrice * (b.stockCount ?? 0) -
                    a.currentPrice * (a.stockCount ?? 0)
                )
                .map((p, idx, arr) => {
                  const rev = p.currentPrice * (p.stockCount ?? 0);
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between py-3 ${
                        idx < arr.length - 1 ? "border-b" : ""
                      }`}
                      style={{ borderColor: "var(--border)" }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: "var(--muted)" }}
                        >
                          <Package
                            size={14}
                            style={{ color: "var(--muted-foreground)" }}
                          />
                        </div>
                        <div>
                          <p
                            className="font-medium text-sm"
                            style={{ color: "var(--foreground)" }}
                          >
                            {p.name}
                          </p>
                          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                            {p.stockCount} {p.unit} × P{p.currentPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <p
                        className="font-display font-semibold text-sm"
                        style={{ color: "var(--foreground)" }}
                      >
                        P{rev.toFixed(2)}
                      </p>
                    </div>
                  );
                })}
            </div>
            <div
              className="mt-4 pt-4 flex items-center justify-between"
              style={{ borderTop: "2px solid var(--border)" }}
            >
              <p
                className="font-display font-bold text-sm"
                style={{ color: "var(--foreground)" }}
              >
                Total
              </p>
              <p
                className="font-display font-bold text-lg"
                style={{ color: "var(--primary)" }}
              >
                ₱
                {totalRevenue.toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </>
        )}
      </Modal>

      {/* ── Hero heading ────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <p className="text-sm mb-0.5" style={{ color: "var(--c-text-3)" }}>
          Magandang Umaga, {ownerFirstName}!
        </p>
        <h1
          className="font-display text-2xl md:text-3xl font-bold"
          style={{ color: "var(--c-text)" }}
        >
          Dashboard
        </h1>
      </div>

      {/* ── Hero stat cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {/* Price Spikes Today */}
        <button
          type="button"
          onClick={() => setModal("priceSpikes")}
          className="rounded-2xl p-6 text-left transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.99] focus-visible:outline-none"
          style={{ backgroundColor: "var(--destructive)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-black/10">
              <TrendingUp size={18} style={{ color: "var(--destructive-foreground)" }} />
            </div>
            <span
              className="text-xs px-2 py-1 rounded-full bg-black/10"
              style={{ color: "var(--destructive-foreground)" }}
            >
              Today
            </span>
          </div>
          <p
            className="font-display text-4xl font-bold mb-1"
            style={{ color: "var(--destructive-foreground)" }}
          >
            {priceSpikedToday.length}
          </p>
          <p
            className="text-sm"
            style={{ color: "var(--destructive-foreground)", opacity: 0.75 }}
          >
            {priceSpikedToday.length === 1 ? "Item spiked" : "Items spiked"} in price today
          </p>
        </button>

        {/* Price Drops Today */}
        <button
          type="button"
          onClick={() => setModal("priceDrops")}
          className="rounded-2xl p-6 text-left transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.99] focus-visible:outline-none"
          style={{ backgroundColor: "var(--primary)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10">
              <TrendingDown size={18} style={{ color: "var(--primary-foreground)" }} />
            </div>
            <span
              className="text-xs px-2 py-1 rounded-full bg-white/10"
              style={{ color: "var(--primary-foreground)" }}
            >
              Today
            </span>
          </div>
          <p
            className="font-display text-4xl font-bold mb-1"
            style={{ color: "var(--primary-foreground)" }}
          >
            {priceDropsToday.length}
          </p>
          <p
            className="text-sm"
            style={{ color: "var(--primary-foreground)", opacity: 0.75 }}
          >
            {priceDropsToday.length === 1 ? "Item dropped" : "Items dropped"} in price today
          </p>
        </button>

        {/* Total Revenue */}
        <button
          type="button"
          onClick={() => setModal("totalRevenue")}
          className="rounded-2xl p-6 text-left transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.99] sm:col-span-2 lg:col-span-1 focus-visible:outline-none"
          style={{ backgroundColor: "var(--c-card)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "var(--c-card-alt)" }}
            >
              <CircleDollarSign size={18} style={{ color: "var(--c-text-2)" }} />
            </div>
            <span
              className="text-xs px-2 py-1 rounded-full"
              style={{ backgroundColor: "var(--c-card-alt)", color: "var(--c-text-2)" }}
            >
              If sold all
            </span>
          </div>
          <p
            className="font-display text-4xl font-bold mb-1"
            style={{ color: "var(--c-text)" }}
          >
            &#x20B1;
            {totalRevenue.toLocaleString("en-PH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-sm" style={{ color: "var(--c-text-3)" }}>
            Total Revenue
          </p>
        </button>
      </div>

      {/* ── Quick Inventory Summary ──────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-6"
        style={{ backgroundColor: "var(--c-card)", boxShadow: "var(--shadow-sm)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2
            className="font-display font-bold text-lg"
            style={{ color: "var(--c-text)" }}
          >
            Quick Inventory Summary
          </h2>
          <Link
            to="/store/catalog"
            className="flex items-center gap-1 text-sm font-medium hover:underline cursor-pointer"
            style={{ color: "var(--c-tint)" }}
          >
            View All Catalog <ArrowRight size={14} />
          </Link>
        </div>

        {quickItems.length === 0 ? (
          <p
            className="text-sm text-center py-8"
            style={{ color: "var(--muted-foreground)" }}
          >
            No items yet. Add items from the Catalog.
          </p>
        ) : (
          <div>
            {quickItems.map((product, idx) => {
              const delta = getLatestDelta(product);
              return (
                <Link
                  key={product.id}
                  to={`/store/catalog/${product.id}`}
                  className={`flex items-center justify-between py-3.5 cursor-pointer hover-row transition-colors rounded-lg px-2 -mx-2 ${
                    idx < quickItems.length - 1 ? "border-b" : ""
                  }`}
                  style={{ borderColor: "var(--c-border)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "var(--c-card-alt)" }}
                    >
                      <Package size={14} style={{ color: "var(--c-text-3)" }} />
                    </div>
                    <div>
                      <p
                        className="font-medium text-sm"
                        style={{ color: "var(--c-text)" }}
                      >
                        {product.name}
                      </p>
                      <p className="text-xs" style={{ color: "var(--c-text-3)" }}>
                        Category: {product.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span
                      className="flex items-center gap-1 text-xs font-medium"
                      style={{
                        color:
                          delta < 0
                            ? "var(--c-success)"
                            : delta > 0
                            ? "var(--c-error)"
                            : "var(--c-text-3)",
                      }}
                    >
                      {delta < 0 && <TrendingDown size={12} />}
                      {delta > 0 && <TrendingUp size={12} />}
                      {delta === 0 && <Minus size={12} />}
                      {delta !== 0
                        ? `${delta < 0 ? "" : "+"}P${delta.toFixed(2)}`
                        : "Steady"}
                    </span>
                    <p
                      className="font-display font-semibold text-sm"
                      style={{ color: "var(--c-text)" }}
                    >
                      P{product.currentPrice.toFixed(2)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
