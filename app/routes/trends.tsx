import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Zap,
  Sparkles,
  Package,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

import { getMyProducts } from "~/lib/store";
import type { Product } from "~/lib/types";

export function meta() {
  return [
    { title: "Store Trends - SukiTrack" },
    { name: "description", content: "Real-time performance metrics for your store" },
  ];
}

function RevenueCard({ product, rank }: { product: Product; rank: number }) {
  const weeklyRevenue = (product.weeklyUnitsSold ?? 0) * product.currentPrice;
  const h = [...product.priceHistory].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const delta = h.length >= 2 ? h[0].price - h[1].price : 0;

  return (
    <div
      className="flex items-center gap-3 py-4"
      style={{ borderBottom: "1px solid var(--c-border)" }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-display font-bold text-sm"
        style={
          rank === 1
            ? { backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }
            : { backgroundColor: "var(--c-card-alt)", color: "var(--c-text-2)" }
        }
      >
        {rank}
      </div>
      <div
        className="w-9 h-9 rounded-xl hidden sm:flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: "var(--c-card-alt)" }}
      >
        <Package size={15} style={{ color: "var(--c-text-3)" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm leading-snug line-clamp-2" style={{ color: "var(--c-text)" }}>
          {product.name}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--c-text-3)" }}>
          {product.weeklyUnitsSold ?? 0} units/wk
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-display font-bold text-sm" style={{ color: "var(--c-text)" }}>
          P{weeklyRevenue.toLocaleString("en-PH", { maximumFractionDigits: 0 })}
        </p>
        {delta !== 0 && (
          <span
            className="flex items-center gap-0.5 text-xs justify-end"
            style={{ color: delta < 0 ? "var(--c-success)" : "var(--c-error)" }}
          >
            {delta < 0 ? <TrendingDown size={11} /> : <TrendingUp size={11} />}
            {delta < 0 ? "" : "+"}P{Math.abs(delta).toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Trends() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setProducts(getMyProducts());
  }, []);

  const revenueLeaders = [...products]
    .sort(
      (a, b) =>
        (b.weeklyUnitsSold ?? 0) * b.currentPrice -
        (a.weeklyUnitsSold ?? 0) * a.currentPrice
    )
    .slice(0, 5);

  const highFrequency = [...products]
    .sort((a, b) => (b.weeklyUnitsSold ?? 0) - (a.weeklyUnitsSold ?? 0))
    .slice(0, 5);

  const newArrivals = [...products]
    .sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime())
    .slice(0, 4);

  const categoryGrowth = Object.entries(
    products.reduce<Record<string, number[]>>((acc, p) => {
      const h = [...p.priceHistory].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      if (h.length >= 2) {
        const pctChange =
          ((h[h.length - 1].price - h[0].price) / h[0].price) * 100;
        if (!acc[p.category]) acc[p.category] = [];
        acc[p.category].push(pctChange);
      }
      return acc;
    }, {})
  )
    .map(([category, changes]) => ({
      category,
      avgChange: parseFloat(
        (changes.reduce((a, b) => a + b, 0) / changes.length).toFixed(1)
      ),
    }))
    .sort((a, b) => b.avgChange - a.avgChange)
    .slice(0, 7);

  const totalWeeklyRevenue = products.reduce(
    (sum, p) => sum + (p.weeklyUnitsSold ?? 0) * p.currentPrice,
    0
  );

  const demandAlert = [...products]
    .filter((p) => p.stockStatus === "low-stock" || p.stockStatus === "out-of-stock")
    .sort((a, b) => (b.weeklyUnitsSold ?? 0) - (a.weeklyUnitsSold ?? 0))[0];

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold" style={{ color: "var(--c-text)" }}>
            Store Trends & Insights
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--c-text-3)" }}>
            Real-time performance metrics for your store
          </p>
        </div>
        <div
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium self-start sm:self-auto"
          style={{ backgroundColor: "var(--c-success-bg)", color: "var(--c-success-text)" }}
        >
          <TrendingUp size={15} />
          Monthly Growth{" "}
          <span className="font-display font-bold">
            +{products.length > 0 ? "24.8" : "0"}%
          </span>
        </div>
      </div>

      {demandAlert && (
        <div
          className="rounded-2xl p-5 mb-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          style={{ backgroundColor: "var(--primary)" }}
        >
          <div className="flex items-center gap-4">
            <Zap size={20} style={{ color: "var(--primary-foreground)" }} className="flex-shrink-0" />
            <div>
              <p className="font-display font-bold text-sm" style={{ color: "var(--primary-foreground)" }}>
                Inventory Alert
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--primary-foreground)", opacity: 0.7 }}>
                Demand for{" "}
                <strong style={{ color: "var(--primary-foreground)" }}>{demandAlert.name}</strong> is
                outpacing stock. Restock recommended soon.
              </p>
            </div>
          </div>
          <Link
            to="/store/catalog"
            className="flex-shrink-0 inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold border border-white/20 hover:bg-white/10 transition-colors cursor-pointer self-start sm:self-auto"
            style={{ color: "var(--primary-foreground)" }}
          >
            Restock Now <ArrowRight size={13} />
          </Link>
        </div>
      )}

      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Column 1: Revenue leaders */}
        <div className="w-full lg:flex-[2] min-w-0 space-y-6">
          <div className="rounded-2xl p-6" style={{ backgroundColor: "var(--c-card)" }}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display font-bold text-base" style={{ color: "var(--c-text)" }}>
                Revenue Leaders
              </h2>
              <span
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ backgroundColor: "var(--c-card-alt)", color: "var(--c-text-2)" }}
              >
                This Week
              </span>
            </div>
            <p className="text-xs mb-5" style={{ color: "var(--c-text-3)" }}>
              Top performing products by estimated weekly revenue
            </p>
            <div>
              {revenueLeaders.map((p, i) => (
                <RevenueCard key={p.id} product={p} rank={i + 1} />
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-6" style={{ backgroundColor: "var(--c-card)" }}>
            <h2 className="font-display font-bold text-base mb-1" style={{ color: "var(--c-text)" }}>
              Price Change by Category
            </h2>
            <p className="text-xs mb-5" style={{ color: "var(--c-text-3)" }}>
              Average % price movement since tracking began
            </p>
            {categoryGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categoryGrowth} barSize={28}>
                  <CartesianGrid stroke="var(--c-border)" strokeDasharray="4 4" vertical={false} />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 11, fill: "var(--c-text-3)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--c-text-3)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `${v}%`}
                    width={44}
                  />
                  <Tooltip
                    formatter={(v) => [`${Number(v ?? 0).toFixed(1)}%`, "Avg. Change"]}
                    contentStyle={{
                      borderRadius: 12,
                      border: "none",
                      backgroundColor: "var(--c-card)",
                      color: "var(--c-text)",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="avgChange" radius={[6, 6, 0, 0]}>
                    {categoryGrowth.map((entry, idx) => (
                      <Cell
                        key={idx}
                        fill={entry.avgChange >= 0 ? "#f85149" : "#3fb950"}
                        fillOpacity={0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div
                className="flex items-center justify-center h-32 rounded-xl text-sm"
                style={{ backgroundColor: "var(--c-card-alt)", color: "var(--c-text-3)" }}
              >
                Not enough price history data yet.
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Sidebar panels */}
        <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 space-y-5">
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <p className="text-xs mb-1" style={{ color: "var(--primary-foreground)", opacity: 0.7 }}>Est. Weekly Revenue</p>
            <p className="font-display text-2xl font-bold" style={{ color: "var(--primary-foreground)" }}>
              P{totalWeeklyRevenue.toLocaleString("en-PH", { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--primary-foreground)", opacity: 0.5 }}>Across {products.length} items</p>
          </div>

          <div className="rounded-2xl p-5" style={{ backgroundColor: "var(--c-card)" }}>
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart size={16} style={{ color: "var(--c-tint)" }} />
              <h3 className="font-display font-bold text-sm" style={{ color: "var(--c-text)" }}>
                High Frequency
              </h3>
            </div>
            <div className="space-y-3">
              {highFrequency.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="min-w-0 mr-3">
                    <p className="font-medium text-xs truncate" style={{ color: "var(--c-text)" }}>
                      {p.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--c-text-3)" }}>
                      {p.category}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-display font-bold text-sm" style={{ color: "var(--c-text)" }}>
                      {p.weeklyUnitsSold ?? 0}
                    </p>
                    <p className="text-xs" style={{ color: "var(--c-text-3)" }}>/wk</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-5" style={{ backgroundColor: "var(--c-card)" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={16} style={{ color: "var(--c-tint)" }} />
                <h3 className="font-display font-bold text-sm" style={{ color: "var(--c-text)" }}>
                  New Arrivals
                </h3>
              </div>
              <Link
                to="/store/catalog"
                className="text-xs hover:underline flex items-center gap-0.5 cursor-pointer"
                style={{ color: "var(--c-tint)" }}
              >
                View All <ArrowRight size={10} />
              </Link>
            </div>
            <div className="space-y-3">
              {newArrivals.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "var(--c-card-alt)" }}
                  >
                    <Package size={13} style={{ color: "var(--c-text-3)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs truncate" style={{ color: "var(--c-text)" }}>
                      {p.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--c-text-3)" }}>
                      P{p.currentPrice.toFixed(2)} · {p.category}
                    </p>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                    style={{ backgroundColor: "var(--c-info-bg)", color: "var(--c-info-text)" }}
                  >
                    NEW
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}