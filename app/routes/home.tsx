import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  TrendingDown,
  TrendingUp,
  Minus,
  Package,
  Percent,
  AlertTriangle,
  Plus,
  ArrowRight,
} from "lucide-react";
import Layout from "~/components/Layout";
import { getProducts, saveProducts, computeAvgMargin } from "~/lib/store";
import { SEED_PRODUCTS } from "~/lib/seed-data";
import type { Product } from "~/lib/types";

export function meta() {
  return [
    { title: "Dashboard - SukiTrack" },
    { name: "description", content: "Your neighborhood price ledger" },
  ];
}

function TickerItem({ product }: { product: Product }) {
  const h = [...product.priceHistory].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const delta = h.length >= 2 ? h[0].price - h[1].price : 0;

  return (
    <span className="inline-flex items-center gap-1.5 px-3">
      <span className="font-display font-semibold" style={{ color: "#e6edf3" }}>
        {product.name}
      </span>
      <span className="font-display" style={{ color: "#e6edf3" }}>
        P{product.currentPrice.toFixed(2)}
      </span>
      {delta < 0 && (
        <span style={{ color: "#6ffbbe" }}>
          <TrendingDown size={12} className="inline" />{" "}
          {((Math.abs(delta) / (h[1]?.price || 1)) * 100).toFixed(0)}%
        </span>
      )}
      {delta > 0 && (
        <span style={{ color: "#ffdad6" }}>
          <TrendingUp size={12} className="inline" /> +
          {((delta / (h[1]?.price || 1)) * 100).toFixed(0)}%
        </span>
      )}
      {delta === 0 && <span style={{ color: "#8b949e" }}>-</span>}
      <span style={{ color: "#45464d" }}>*</span>
    </span>
  );
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const storeName = "Erlinda Digman";

  useEffect(() => {
    let prods = getProducts();
    if (!prods.length) {
      saveProducts(SEED_PRODUCTS);
      prods = SEED_PRODUCTS;
    }
    setProducts(prods);
  }, []);

  const totalItems = products.length;
  const lowStock = products.filter((p) => p.stockStatus === "low-stock").length;
  const priceDropsToday = products.filter((p) => {
    const h = [...p.priceHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return h.length >= 2 && h[0].price < h[1].price;
  });
  const avgMargin = computeAvgMargin(products);
  const quickItems = products.slice(0, 5);
  const topSeller = [...products].sort(
    (a, b) => (b.weeklyUnitsSold ?? 0) - (a.weeklyUnitsSold ?? 0)
  )[0];
  const mostVolatile = [...products]
    .filter((p) => p.priceHistory.length >= 2)
    .sort((a, b) => {
      const range = (p: Product) => {
        const prices = p.priceHistory.map((h) => h.price);
        return Math.max(...prices) - Math.min(...prices);
      };
      return range(b) - range(a);
    })[0];

  return (
    <Layout storeName={storeName}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-sm mb-0.5" style={{ color: "var(--c-text-3)" }}>
            Magandang Umaga!
          </p>
          <h1
            className="font-display text-2xl md:text-3xl font-bold"
            style={{ color: "var(--c-text)" }}
          >
            Your Neighborhood Ledger
          </h1>
        </div>
        <Link
          to="/catalog/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90 cursor-pointer self-start sm:self-auto"
          style={{ background: "linear-gradient(135deg, #000000, #00174b)" }}
        >
          <Plus size={16} />
          Add New Item
        </Link>
      </div>

      <div
        className="rounded-2xl overflow-hidden mb-8"
        style={{ backgroundColor: "#191c1e" }}
      >
        <div className="flex items-center overflow-hidden h-10">
          <div
            className="flex-shrink-0 flex items-center px-4 h-full text-xs font-display font-semibold text-white z-10"
            style={{ backgroundColor: "#000000" }}
          >
            Market Live
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="ticker-track flex whitespace-nowrap text-sm py-2">
              {[...products, ...products].map((p, i) => (
                <TickerItem key={`${p.id}-${i}`} product={p} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <div className="rounded-2xl p-6" style={{ backgroundColor: "var(--c-card)" }}>
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "var(--c-card-alt)" }}
            >
              <Package size={18} style={{ color: "var(--c-text-2)" }} />
            </div>
            <span
              className="text-xs px-2 py-1 rounded-full"
              style={{ backgroundColor: "var(--c-card-alt)", color: "var(--c-text-2)" }}
            >
              All time
            </span>
          </div>
          <p className="font-display text-4xl font-bold mb-1" style={{ color: "var(--c-text)" }}>
            {totalItems}
          </p>
          <p className="text-sm" style={{ color: "var(--c-text-3)" }}>
            Total Items Tracked
          </p>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{ background: "linear-gradient(135deg, #000000 0%, #00174b 100%)" }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10">
              <TrendingDown size={18} className="text-white" />
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70">
              Today
            </span>
          </div>
          <p className="font-display text-4xl font-bold mb-1 text-white">
            {priceDropsToday.length}
          </p>
          <p className="text-sm text-white/70">
            {priceDropsToday.length === 1 ? "Item dropped" : "Items dropped"} in price today
          </p>
        </div>

        <div
          className="rounded-2xl p-6 sm:col-span-2 lg:col-span-1"
          style={{ backgroundColor: "var(--c-card)" }}
        >
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "var(--c-card-alt)" }}
            >
              <Percent size={18} style={{ color: "var(--c-text-2)" }} />
            </div>
          </div>
          <p className="font-display text-4xl font-bold mb-1" style={{ color: "var(--c-text)" }}>
            {avgMargin}%
          </p>
          <p className="text-sm" style={{ color: "var(--c-text-3)" }}>
            Avg. Store Margin
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div
          className="lg:col-span-2 rounded-2xl p-6"
          style={{ backgroundColor: "var(--c-card)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2
              className="font-display font-bold text-lg"
              style={{ color: "var(--c-text)" }}
            >
              Quick Inventory Summary
            </h2>
            <Link
              to="/catalog"
              className="flex items-center gap-1 text-sm font-medium hover:underline cursor-pointer"
              style={{ color: "var(--c-tint)" }}
            >
              View All Catalog <ArrowRight size={14} />
            </Link>
          </div>

          <div>
            {quickItems.map((product, idx) => {
              const h = [...product.priceHistory].sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              );
              const delta = h.length >= 2 ? h[0].price - h[1].price : 0;

              return (
                <Link
                  key={product.id}
                  to={`/catalog/${product.id}`}
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
                      <p className="font-medium text-sm" style={{ color: "var(--c-text)" }}>
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
                      {delta !== 0 ? `${delta < 0 ? "" : "+"}P${delta.toFixed(2)}` : "Steady"}
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
        </div>

        <div className="space-y-4">
          {lowStock > 0 && (
            <div
              className="rounded-2xl p-5"
              style={{ backgroundColor: "var(--c-error-bg)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} style={{ color: "var(--c-error)" }} />
                <span
                  className="font-display font-semibold text-sm"
                  style={{ color: "var(--c-error)" }}
                >
                  Low Stock Alert
                </span>
              </div>
              <p className="text-sm" style={{ color: "var(--c-error-text)" }}>
                {lowStock} item{lowStock > 1 ? "s are" : " is"} running low. Restock soon.
              </p>
              <Link
                to="/catalog"
                className="inline-flex items-center gap-1 mt-3 text-xs font-semibold hover:underline cursor-pointer"
                style={{ color: "var(--c-error)" }}
              >
                Review Now <ArrowRight size={12} />
              </Link>
            </div>
          )}

          <div className="rounded-2xl p-5" style={{ backgroundColor: "var(--c-card)" }}>
            <h3
              className="font-display font-bold text-sm mb-4"
              style={{ color: "var(--c-text)" }}
            >
              Stock Trends
            </h3>
            <div className="space-y-4">
              {topSeller && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs" style={{ color: "var(--c-text-3)" }}>
                      Top Seller
                    </p>
                    <p
                      className="font-medium text-sm truncate max-w-[130px]"
                      style={{ color: "var(--c-text)" }}
                    >
                      {topSeller.name}
                    </p>
                  </div>
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{
                      backgroundColor: "var(--c-success-bg)",
                      color: "var(--c-success-text)",
                    }}
                  >
                    {topSeller.weeklyUnitsSold}/wk
                  </span>
                </div>
              )}
              {mostVolatile && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs" style={{ color: "var(--c-text-3)" }}>
                      Most Volatile
                    </p>
                    <p
                      className="font-medium text-sm truncate max-w-[130px]"
                      style={{ color: "var(--c-text)" }}
                    >
                      {mostVolatile.name}
                    </p>
                  </div>
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{
                      backgroundColor: "var(--c-card-alt)",
                      color: "var(--c-text-2)",
                    }}
                  >
                    Watch
                  </span>
                </div>
              )}
            </div>
          </div>

          {priceDropsToday.length > 0 && (
            <div
              className="rounded-2xl p-5"
              style={{ background: "linear-gradient(135deg, #000000 0%, #00174b 100%)" }}
            >
              <p className="font-display font-bold text-white text-sm mb-1">
                {priceDropsToday.length} Price Drop{priceDropsToday.length > 1 ? "s" : ""} Today
              </p>
              <p className="text-white/60 text-xs mb-3">
                Update your shelf labels to stay competitive.
              </p>
              <Link
                to="/catalog"
                className="inline-flex items-center gap-1 text-xs font-semibold text-white/80 hover:text-white cursor-pointer"
              >
                Review Updates <ArrowRight size={12} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}