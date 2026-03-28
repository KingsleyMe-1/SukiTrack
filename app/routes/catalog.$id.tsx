import { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router";
import {
  Package,
  Save,
  Trash2,
  ArrowLeft,
  TrendingDown,
  TrendingUp,
  Lightbulb,
  BarChart3,
  Lock,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import {
  getProduct,
  upsertProduct,
  deleteProduct,
  generateId,
} from "~/lib/store";
import type { Product, StockStatus } from "~/lib/types";
import { useUserSession } from "~/lib/use-user-session";
import { getUserSession } from "~/lib/user-session";

export function meta() {
  return [
    { title: "Item Price Editor - SukiTrack" },
    { name: "description", content: "Update item details and prices" },
  ];
}

const CATEGORIES = [
  "Grains", "Staples", "Canned Goods", "Beverages", "Snacks",
  "Condiments", "Household", "Fresh", "Personal Care", "Other",
];

function PriceChart({ history }: { history: Product["priceHistory"] }) {
  const data = [...history]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((h) => ({
      date: new Date(h.date).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
      }),
      price: h.price,
    }));

  if (data.length < 2) {
    return (
      <div
        className="flex items-center justify-center h-32 rounded-xl text-sm"
        style={{ backgroundColor: "var(--c-card-alt)", color: "var(--c-text-3)" }}
      >
        Not enough price history yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={data}>
        <CartesianGrid stroke="var(--c-border)" strokeDasharray="4 4" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "var(--c-text-3)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--c-text-3)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `P${v}`}
          width={52}
        />
        <Tooltip
          formatter={(v) => [`P${Number(v ?? 0).toFixed(2)}`, "Price"]}
          contentStyle={{
            borderRadius: 12,
            border: "none",
            backgroundColor: "var(--c-card)",
            color: "var(--c-text)",
            fontSize: 12,
          }}
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke="var(--c-tint)"
          strokeWidth={2}
          dot={{ fill: "var(--c-tint)", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function CatalogItemReadOnly({ product }: { product: Product }) {
  const location = useLocation();
  const next = encodeURIComponent(`${location.pathname}${location.search || ""}`);
  const prevPrice =
    product.priceHistory.length >= 2
      ? [...product.priceHistory].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )[1].price
      : null;
  const priceDelta = prevPrice !== null ? product.currentPrice - prevPrice : 0;

  return (
    <>
      <div
        className="rounded-2xl p-4 mb-6 flex flex-wrap items-center gap-3"
        style={{ backgroundColor: "var(--c-info-bg)", border: "1px solid var(--c-border)" }}
      >
        <Lock size={18} style={{ color: "var(--c-tint)" }} className="flex-shrink-0" />
        <p className="text-sm flex-1" style={{ color: "var(--c-text-2)" }}>
          You are viewing this item in read-only mode.{" "}
          <Link to={`/auth/store-owner?next=${next}`} className="font-semibold underline" style={{ color: "var(--c-tint)" }}>
            Sign in as store owner
          </Link>{" "}
          to add or edit products.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl p-6" style={{ backgroundColor: "var(--c-card)" }}>
            <h2 className="font-display font-bold text-base mb-5" style={{ color: "var(--c-text)" }}>
              Product Details
            </h2>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-xs font-medium mb-1" style={{ color: "var(--c-text-3)" }}>
                  Name
                </dt>
                <dd style={{ color: "var(--c-text)" }}>{product.name}</dd>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs font-medium mb-1" style={{ color: "var(--c-text-3)" }}>
                    Category
                  </dt>
                  <dd style={{ color: "var(--c-text)" }}>{product.category}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium mb-1" style={{ color: "var(--c-text-3)" }}>
                    Unit / Size
                  </dt>
                  <dd style={{ color: "var(--c-text)" }}>{product.unit}</dd>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs font-medium mb-1" style={{ color: "var(--c-text-3)" }}>
                    Stock status
                  </dt>
                  <dd style={{ color: "var(--c-text)", textTransform: "capitalize" }}>
                    {product.stockStatus.replace(/-/g, " ")}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium mb-1" style={{ color: "var(--c-text-3)" }}>
                    Stock count
                  </dt>
                  <dd style={{ color: "var(--c-text)" }}>{product.stockCount ?? "—"}</dd>
                </div>
              </div>
              <div>
                <dt className="text-xs font-medium mb-1" style={{ color: "var(--c-text-3)" }}>
                  Weekly units sold
                </dt>
                <dd style={{ color: "var(--c-text)" }}>{product.weeklyUnitsSold ?? "—"}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl p-6" style={{ backgroundColor: "var(--c-card)" }}>
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 size={18} style={{ color: "var(--c-tint)" }} />
              <h2 className="font-display font-bold text-base" style={{ color: "var(--c-text)" }}>
                Pricing
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs mb-1" style={{ color: "var(--c-text-3)" }}>
                  Current price
                </p>
                <p className="font-display text-xl font-bold" style={{ color: "var(--c-text)" }}>
                  P{product.currentPrice.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: "var(--c-text-3)" }}>
                  Target price
                </p>
                <p className="font-display text-xl font-bold" style={{ color: "var(--c-text)" }}>
                  {product.targetPrice != null ? `P${product.targetPrice.toFixed(2)}` : "—"}
                </p>
              </div>
            </div>
          </div>

          {product.priceHistory.length > 0 && (
            <div className="rounded-2xl p-6" style={{ backgroundColor: "var(--c-card)" }}>
              <h2 className="font-display font-bold text-base mb-5" style={{ color: "var(--c-text)" }}>
                Price History
              </h2>
              <PriceChart history={product.priceHistory} />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl p-6" style={{ backgroundColor: "var(--c-card)" }}>
            <span
              className="text-xs px-2 py-1 rounded-full font-medium"
              style={{ backgroundColor: "var(--c-card-alt)", color: "var(--c-text-2)" }}
            >
              Catalog preview
            </span>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center my-4"
              style={{ backgroundColor: "var(--c-card-alt)" }}
            >
              <Package size={22} style={{ color: "var(--c-text-3)" }} />
            </div>
            <p className="font-display font-bold text-base mb-0.5" style={{ color: "var(--c-text)" }}>
              {product.name}
            </p>
            <p className="text-xs mb-3" style={{ color: "var(--c-text-3)" }}>
              {product.unit} · {product.category}
            </p>
            <p className="font-display text-2xl font-bold" style={{ color: "var(--c-text)" }}>
              P{product.currentPrice.toFixed(2)}
            </p>
            {priceDelta !== 0 && (
              <div
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
                style={
                  priceDelta < 0
                    ? { backgroundColor: "var(--c-success-bg)", color: "var(--c-success-text)" }
                    : { backgroundColor: "var(--c-error-bg)", color: "var(--c-error)" }
                }
              >
                {priceDelta < 0 ? (
                  <>
                    <TrendingDown size={11} /> vs last entry
                  </>
                ) : (
                  <>
                    <TrendingUp size={11} /> vs last entry
                  </>
                )}
              </div>
            )}
          </div>

          {product.stockCount != null &&
            product.weeklyUnitsSold != null &&
            product.weeklyUnitsSold > 0 && (
              <div className="rounded-2xl p-5" style={{ backgroundColor: "var(--c-card-alt)" }}>
                <p className="font-display font-semibold text-sm mb-2" style={{ color: "var(--c-text)" }}>
                  Inventory Forecast
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--c-text-2)" }}>
                  Based on current sales,{" "}
                  <strong>{product.stockCount} units</strong> will be depleted in approximately{" "}
                  <strong>
                    {Math.ceil(
                      product.stockCount / (product.weeklyUnitsSold / 7)
                    )}{" "}
                    days
                  </strong>
                  .
                </p>
              </div>
            )}
        </div>
      </div>
    </>
  );
}

export default function CatalogItemEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const session = useUserSession();

  const isNew = id === "new";

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Staples");
  const [unit, setUnit] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [stockStatus, setStockStatus] = useState<StockStatus>("in-stock");
  const [stockCount, setStockCount] = useState("");
  const [weeklyUnitsSold, setWeeklyUnitsSold] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!isNew && id) {
      const p = getProduct(id);
      if (p) {
        setProduct(p);
        setName(p.name);
        setCategory(p.category);
        setUnit(p.unit);
        setCurrentPrice(p.currentPrice.toString());
        setTargetPrice(p.targetPrice?.toString() ?? "");
        setStockStatus(p.stockStatus);
        setStockCount(p.stockCount?.toString() ?? "");
        setWeeklyUnitsSold(p.weeklyUnitsSold?.toString() ?? "");
      }
    }
    setInitialized(true);
  }, [id, isNew]);

  useEffect(() => {
    if (isNew && !session) {
      navigate("/store/catalog", { replace: true });
    }
  }, [isNew, session, navigate]);

  const prevPrice =
    product && product.priceHistory.length >= 2
      ? [...product.priceHistory].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )[1].price
      : null;

  const newPriceNum = parseFloat(currentPrice) || 0;
  const targetPriceNum = parseFloat(targetPrice) || 0;
  const priceDelta = prevPrice !== null ? newPriceNum - prevPrice : 0;
  const targetDelta = targetPriceNum ? targetPriceNum - newPriceNum : 0;
  const targetPct = newPriceNum ? ((targetDelta / newPriceNum) * 100).toFixed(1) : "0";

  function buildHint(): string {
    if (!targetPriceNum || !newPriceNum) return "";
    const pct = Math.abs(parseFloat(targetPct));
    if (targetDelta < 0)
      return `Setting a target price of P${targetPriceNum.toFixed(2)} reflects a ${pct}% drop. This usually increases daily volume in your neighborhood.`;
    if (targetDelta > 0)
      return `Setting a target price of P${targetPriceNum.toFixed(2)} reflects a ${pct}% increase. Consider your competitors before raising.`;
    return "Target price matches current price.";
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !currentPrice) return;

    const now = new Date().toISOString();
    const priceNum = parseFloat(currentPrice);

    let updatedHistory = product?.priceHistory ?? [];
    const lastPrice = updatedHistory[updatedHistory.length - 1]?.price;
    if (lastPrice === undefined || lastPrice !== priceNum) {
      updatedHistory = [...updatedHistory, { date: now, price: priceNum }];
    }

    const updated: Product = {
      id: product?.id ?? generateId(),
      name: name.trim(),
      category,
      unit: unit.trim() || "unit",
      currentPrice: priceNum,
      targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
      stockStatus,
      stockCount: stockCount ? parseInt(stockCount) : undefined,
      weeklyUnitsSold: weeklyUnitsSold ? parseInt(weeklyUnitsSold) : undefined,
      priceHistory: updatedHistory,
      addedDate: product?.addedDate ?? now,
      isPromo: product?.isPromo,
      isFeatured: product?.isFeatured,
      storeOwnerId: product?.storeOwnerId ?? getUserSession()?.email,
    };

    upsertProduct(updated);
    setSaved(true);
    setTimeout(() => {
      navigate("/store/catalog");
    }, 900);
  }

  function handleDelete() {
    if (!product) return;
    deleteProduct(product.id);
    navigate("/store/catalog");
  }

  const inputStyle = {
    backgroundColor: "var(--c-input)",
    color: "var(--c-text)",
    border: "none",
  };

  if (!initialized) {
    return (
      <p className="text-sm" style={{ color: "var(--c-text-3)" }}>
        Loading…
      </p>
    );
  }

  if (isNew && !session) {
    return null;
  }

  if (!isNew && id && !product) {
    return (
      <>
        <Link
          to="/store/catalog"
          className="inline-flex items-center gap-2 text-sm mb-6"
          style={{ color: "var(--c-tint)" }}
        >
          <ArrowLeft size={16} />
          Back to catalog
        </Link>
        <p className="font-display font-bold text-lg" style={{ color: "var(--c-text)" }}>
          Product not found
        </p>
      </>
    );
  }

  if (!session && product) {
    return (
      <>
        <div className="flex items-center gap-3 mb-7">
          <Link
            to="/store/catalog"
            className="w-9 h-9 rounded-xl flex items-center justify-center hover-btn transition-colors cursor-pointer"
            style={{ color: "var(--c-text-2)" }}
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-display text-xl md:text-2xl font-bold" style={{ color: "var(--c-text)" }}>
              Product details
            </h1>
            <p className="text-sm" style={{ color: "var(--c-text-3)" }}>
              Read-only view
            </p>
          </div>
        </div>
        <CatalogItemReadOnly product={product} />
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-7">
        <Link
          to="/store/catalog"
          className="w-9 h-9 rounded-xl flex items-center justify-center hover-btn transition-colors cursor-pointer"
          style={{ color: "var(--c-text-2)" }}
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display text-xl md:text-2xl font-bold" style={{ color: "var(--c-text)" }}>
            {isNew ? "Add New Item" : "Update Inventory"}
          </h1>
          <p className="text-sm" style={{ color: "var(--c-text-3)" }}>
            {isNew
              ? "Add a new product to your catalog."
              : "Manage your store products and update prices instantly."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: form fields */}
          <div className="lg:col-span-2 space-y-5">
            {/* Basic info card */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: "var(--c-card)" }}>
              <h2 className="font-display font-bold text-base mb-5" style={{ color: "var(--c-text)" }}>
                Product Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--c-text-2)" }}>
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. San Miguel Pale Pilsen 320ml"
                    required
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    style={inputStyle}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--c-text-2)" }}>
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] cursor-pointer"
                      style={inputStyle}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--c-text-2)" }}>
                      Unit / Size
                    </label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="e.g. 320ml, per kg"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--c-text-2)" }}>
                      Stock Status
                    </label>
                    <select
                      value={stockStatus}
                      onChange={(e) => setStockStatus(e.target.value as StockStatus)}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] cursor-pointer"
                      style={inputStyle}
                    >
                      <option value="in-stock">In Stock</option>
                      <option value="low-stock">Low Stock</option>
                      <option value="out-of-stock">Out of Stock</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--c-text-2)" }}>
                      Stock Count
                    </label>
                    <input
                      type="number"
                      value={stockCount}
                      onChange={(e) => setStockCount(e.target.value)}
                      placeholder="e.g. 50"
                      min="0"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--c-text-2)" }}>
                    Weekly Units Sold
                  </label>
                  <input
                    type="number"
                    value={weeklyUnitsSold}
                    onChange={(e) => setWeeklyUnitsSold(e.target.value)}
                    placeholder="e.g. 25"
                    min="0"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Pricing ledger card */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: "var(--c-card)" }}>
              <div className="flex items-center gap-2 mb-5">
                <BarChart3 size={18} style={{ color: "var(--c-tint)" }} />
                <h2 className="font-display font-bold text-base" style={{ color: "var(--c-text)" }}>
                  Pricing Ledger
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--c-text-2)" }}>
                    Current Price (P) *
                  </label>
                  <div className="relative">
                    <span
                      className="absolute left-4 top-1/2 -translate-y-1/2 font-display font-semibold text-sm"
                      style={{ color: "var(--c-text-2)" }}
                    >
                      P
                    </span>
                    <input
                      type="number"
                      value={currentPrice}
                      onChange={(e) => setCurrentPrice(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                      className="w-full pl-8 pr-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--c-text-2)" }}>
                    Target Price (P)
                  </label>
                  <div className="relative">
                    <span
                      className="absolute left-4 top-1/2 -translate-y-1/2 font-display font-semibold text-sm"
                      style={{ color: "var(--c-text-2)" }}
                    >
                      P
                    </span>
                    <input
                      type="number"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full pl-8 pr-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              {targetPriceNum > 0 && (
                <div
                  className="flex gap-3 p-4 rounded-xl"
                  style={{ backgroundColor: "var(--c-card-alt)" }}
                >
                  <Lightbulb size={16} className="flex-shrink-0 mt-0.5" style={{ color: "var(--c-tint)" }} />
                  <p className="text-xs leading-relaxed" style={{ color: "var(--c-text-2)" }}>
                    {buildHint()}
                  </p>
                </div>
              )}
            </div>

            {/* Price history chart */}
            {product && product.priceHistory.length > 0 && (
              <div className="rounded-2xl p-6" style={{ backgroundColor: "var(--c-card)" }}>
                <h2 className="font-display font-bold text-base mb-5" style={{ color: "var(--c-text)" }}>
                  Price History
                </h2>
                <PriceChart history={product.priceHistory} />
              </div>
            )}
          </div>

          {/* Right: preview + actions */}
          <div className="space-y-4">
            {name && currentPrice && (
              <div className="rounded-2xl p-6" style={{ backgroundColor: "var(--c-card)" }}>
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{ backgroundColor: "var(--c-success-bg)", color: "var(--c-success-text)" }}
                  >
                    Live Catalog Preview
                  </span>
                  {stockStatus === "in-stock" && (
                    <span
                      className="text-xs px-2 py-1 rounded-full font-medium"
                      style={{ backgroundColor: "var(--c-info-bg)", color: "var(--c-info-text)" }}
                    >
                      Active
                    </span>
                  )}
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: "var(--c-card-alt)" }}
                >
                  <Package size={22} style={{ color: "var(--c-text-3)" }} />
                </div>
                <p className="font-display font-bold text-base mb-0.5" style={{ color: "var(--c-text)" }}>
                  {name}
                </p>
                <p className="text-xs mb-3" style={{ color: "var(--c-text-3)" }}>
                  {unit} · {category}
                </p>
                {currentPrice && (
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-2xl font-bold" style={{ color: "var(--c-text)" }}>
                      P{parseFloat(currentPrice).toFixed(2)}
                    </span>
                    {targetPriceNum > 0 && targetPriceNum !== newPriceNum && (
                      <span className="text-sm line-through" style={{ color: "var(--c-text-3)" }}>
                        P{targetPriceNum.toFixed(2)}
                      </span>
                    )}
                  </div>
                )}
                {priceDelta !== 0 && (
                  <div
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
                    style={
                      priceDelta < 0
                        ? { backgroundColor: "var(--c-success-bg)", color: "var(--c-success-text)" }
                        : { backgroundColor: "var(--c-error-bg)", color: "var(--c-error)" }
                    }
                  >
                    {priceDelta < 0 ? (
                      <><TrendingDown size={11} /> PRICE DROP</>
                    ) : (
                      <><TrendingUp size={11} /> PRICE INCREASE</>
                    )}
                  </div>
                )}
              </div>
            )}

            {product && stockCount && weeklyUnitsSold && (
              <div className="rounded-2xl p-5" style={{ backgroundColor: "var(--c-card-alt)" }}>
                <p className="font-display font-semibold text-sm mb-2" style={{ color: "var(--c-text)" }}>
                  Inventory Forecast
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--c-text-2)" }}>
                  Based on current sales,{" "}
                  <strong>{stockCount} units</strong> will be depleted in approximately{" "}
                  <strong>
                    {Math.ceil(parseInt(stockCount) / (parseInt(weeklyUnitsSold) / 7))} days
                  </strong>
                  . Plan your restock accordingly.
                </p>
              </div>
            )}

            <div className="space-y-3">
              <button
                type="submit"
                disabled={saved}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60 cursor-pointer"
                style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                <Save size={15} />
                {saved ? "Saved!" : "Save Changes"}
              </button>

              {!isNew && product && (
                <div>
                  {confirmDelete ? (
                    <div
                      className="rounded-xl p-4"
                      style={{ backgroundColor: "var(--c-error-bg)" }}
                    >
                      <p className="text-xs font-medium mb-3" style={{ color: "var(--c-error)" }}>
                        Delete this item permanently?
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(false)}
                          className="flex-1 py-2 rounded-lg text-xs font-medium cursor-pointer hover-btn transition-colors"
                          style={{ backgroundColor: "var(--c-card)", color: "var(--c-text-2)" }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleDelete}
                          className="flex-1 py-2 rounded-lg text-xs font-medium text-white cursor-pointer transition-opacity hover:opacity-90"
                          style={{ backgroundColor: "var(--c-error)" }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer hover-error"
                      style={{ color: "var(--c-error)" }}
                    >
                      <Trash2 size={15} />
                      Delete Item
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </>
  );
}