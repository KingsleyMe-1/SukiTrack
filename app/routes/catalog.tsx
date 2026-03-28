import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router";
import {
  Plus,
  Package,
  Search,
  TrendingDown,
  TrendingUp,
  Minus,
  Pencil,
  Trash2,
  AlertTriangle,
  X,
  Check,
  Eye,
} from "lucide-react";

import {
  getMyProducts,
  deleteProduct,
  generateId,
  upsertProduct,
} from "~/lib/store";

import type { Product, StockStatus } from "~/lib/types";
import { useUserSession } from "~/lib/use-user-session";
import { getUserSession } from "~/lib/user-session";
import { StockBadge } from "~/components/ui/Badge";

export function meta() {
  return [
    { title: "Product Catalog - SukiTrack" },
    { name: "description", content: "Manage your sari-sari store inventory" },
  ];
}

const CATEGORIES = [
  "All",
  "Grains",
  "Staples",
  "Canned Goods",
  "Beverages",
  "Snacks",
  "Condiments",
  "Household",
  "Fresh",
  "Personal Care",
  "Other",
];

interface ProductRowProps {
  product: Product;
  onDelete: (id: string) => void;
  isAdmin: boolean;
  basePath?: string;
}

function ProductRow({ product, onDelete, isAdmin, basePath = "/store/catalog" }: ProductRowProps) {
  const h = [...product.priceHistory].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const delta = h.length >= 2 ? h[0].price - h[1].price : 0;

  return (
    <tr
      className="group transition-colors hover-row cursor-pointer"
      style={{ borderBottom: "1px solid var(--c-border)" }}
    >
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "var(--c-card-alt)" }}
          >
            <Package size={15} style={{ color: "var(--c-text-3)" }} />
          </div>
          <div>
            <p className="font-medium text-sm" style={{ color: "var(--c-text)" }}>
              {product.name}
            </p>
            <p className="text-xs" style={{ color: "var(--c-text-3)" }}>
              {product.unit}
            </p>
          </div>
        </div>
      </td>
      <td className="py-4 px-6 text-sm" style={{ color: "var(--c-text-2)" }}>
        {product.category}
      </td>
      <td className="py-4 px-6">
        <StockBadge status={product.stockStatus} />
      </td>
      <td className="py-4 px-6 text-right">
        <p className="font-display font-semibold text-sm" style={{ color: "var(--c-text)" }}>
          P{product.currentPrice.toFixed(2)}
        </p>
      </td>
      <td className="py-4 px-6">
        {delta !== 0 ? (
          <span
            className="flex items-center gap-1 text-xs font-medium"
            style={{ color: delta < 0 ? "var(--c-success)" : "var(--c-error)" }}
          >
            {delta < 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
            {delta < 0 ? "" : "+"}P{Math.abs(delta).toFixed(2)}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs" style={{ color: "var(--c-text-3)" }}>
            <Minus size={12} /> Steady
          </span>
        )}
      </td>
      <td className="py-4 px-6 text-right">
        {isAdmin ? (
          <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
            <Link
              to={`${basePath}/${product.id}`}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer hover-btn"
              style={{ color: "var(--c-text-2)" }}
              title="Edit"
            >
              <Pencil size={14} />
            </Link>
            <button
              type="button"
              onClick={() => onDelete(product.id)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer hover-error"
              style={{ color: "var(--c-error)" }}
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ) : (
          <Link
            to={`${basePath}/${product.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold"
            style={{ color: "var(--c-tint)" }}
          >
            <Eye size={14} />
            View
          </Link>
        )}
      </td>
    </tr>
  );
}

function ProductCard({ product, onDelete, isAdmin, basePath = "/store/catalog" }: ProductRowProps) {
  const h = [...product.priceHistory].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const delta = h.length >= 2 ? h[0].price - h[1].price : 0;

  return (
    <div
      className="rounded-2xl p-4"
      style={{ backgroundColor: "var(--c-card)", border: "1px solid var(--c-border)" }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "var(--c-card-alt)" }}
          >
            <Package size={15} style={{ color: "var(--c-text-3)" }} />
          </div>
          <div>
            <p className="font-medium text-sm" style={{ color: "var(--c-text)" }}>
              {product.name}
            </p>
            <p className="text-xs" style={{ color: "var(--c-text-3)" }}>
              {product.unit} · {product.category}
            </p>
          </div>
        </div>
        <StockBadge status={product.stockStatus} />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {delta !== 0 ? (
            <span
              className="flex items-center gap-1 text-xs font-medium"
              style={{ color: delta < 0 ? "var(--c-success)" : "var(--c-error)" }}
            >
              {delta < 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
              {delta < 0 ? "" : "+"}P{Math.abs(delta).toFixed(2)}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs" style={{ color: "var(--c-text-3)" }}>
              <Minus size={12} /> Steady
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <p className="font-display font-semibold text-sm" style={{ color: "var(--c-text)" }}>
            P{product.currentPrice.toFixed(2)}
          </p>
          {isAdmin ? (
            <>
              <Link
                to={`${basePath}/${product.id}`}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer hover-btn"
                style={{ color: "var(--c-text-2)" }}
                title="Edit"
              >
                <Pencil size={14} />
              </Link>
              <button
                type="button"
                onClick={() => onDelete(product.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer hover-error"
                style={{ color: "var(--c-error)" }}
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </>
          ) : (
            <Link
              to={`${basePath}/${product.id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg"
              style={{ color: "var(--c-tint)", backgroundColor: "var(--c-card-alt)" }}
            >
              <Eye size={14} />
              View
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

interface AddProductModalProps {
  onClose: () => void;
  onSave: (product: Product) => void;
}

function AddProductModal({ onClose, onSave }: AddProductModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Staples");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState("");
  const [stockStatus, setStockStatus] = useState<StockStatus>("in-stock");
  const [stockCount, setStockCount] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !price) return;
    const now = new Date().toISOString();
    const product: Product = {
      id: generateId(),
      name: name.trim(),
      category,
      unit: unit.trim() || "unit",
      currentPrice: parseFloat(price),
      stockStatus,
      stockCount: stockCount ? parseInt(stockCount) : undefined,
      priceHistory: [{ date: now, price: parseFloat(price) }],
      addedDate: now,
    };
    onSave(product);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ backgroundColor: "var(--c-overlay)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 sm:p-7 shadow-xl"
        style={{ backgroundColor: "var(--c-card)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-lg" style={{ color: "var(--c-text)" }}>
            Add New Product
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer hover-btn"
            style={{ color: "var(--c-text-3)" }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--c-text-2)" }}>
              Product Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rice (Sinandomeng)"
              required
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
              style={{ backgroundColor: "var(--c-input)", color: "var(--c-text)", border: "none" }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--c-text-2)" }}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] cursor-pointer"
                style={{ backgroundColor: "var(--c-input)", color: "var(--c-text)", border: "none" }}
              >
                {CATEGORIES.filter((c) => c !== "All").map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--c-text-2)" }}>
                Unit
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. per kg"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
                style={{ backgroundColor: "var(--c-input)", color: "var(--c-text)", border: "none" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--c-text-2)" }}>
                Current Price (P) *
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
                style={{ backgroundColor: "var(--c-input)", color: "var(--c-text)", border: "none" }}
              />
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
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
                style={{ backgroundColor: "var(--c-input)", color: "var(--c-text)", border: "none" }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--c-text-2)" }}>
              Stock Status
            </label>
            <div className="flex gap-2">
              {(["in-stock", "low-stock", "out-of-stock"] as StockStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStockStatus(s)}
                  className="flex-1 py-2 rounded-xl text-xs font-medium transition-colors capitalize cursor-pointer"
                  style={
                    stockStatus === s
                      ? { backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }
                      : { backgroundColor: "var(--c-card-alt)", color: "var(--c-text-2)" }
                  }
                >
                  {s.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium cursor-pointer hover-btn transition-colors"
              style={{ backgroundColor: "var(--c-card-alt)", color: "var(--c-text-2)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 cursor-pointer transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              <Check size={14} /> Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const TABLE_HEAD_ADMIN = ["Product", "Category", "Status", "Price", "Change", ""];
const TABLE_HEAD_VIEW = ["Product", "Category", "Status", "Price", "Change", "View"];

export default function Catalog() {
  const session = useUserSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const prods = getMyProducts();
    setProducts(prods);
  }, []);

  const filtered = products.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const totalItems = products.length;
  const lowStockCount = products.filter((p) => p.stockStatus === "low-stock").length;
  const activePromos = products.filter((p) => p.isPromo).length;

  const handleDelete = useCallback(
    (id: string) => {
      deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirm(null);
    },
    []
  );

  const handleSaveNew = useCallback((product: Product) => {
    upsertProduct(product);
    setProducts(getMyProducts());
    setShowAddModal(false);
  }, []);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold" style={{ color: "var(--c-text)" }}>
            Product Catalog
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--c-text-3)" }}>
            {session
              ? "Manage your inventory and pricing strategy"
              : "Browse inventory and prices (read only)"}
          </p>
        </div>
        {session ? (
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90 cursor-pointer self-start sm:self-auto"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            <Plus size={16} />
            Add New Product
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
        {[
          { label: "Total Items", value: totalItems, sub: "in catalog" },
          { label: "Low Stock", value: lowStockCount, sub: "need restocking", alert: lowStockCount > 0 },
          { label: "Active Promos", value: activePromos, sub: "on sale" },
        ].map(({ label, value, sub, alert }) => (
          <div
            key={label}
            className="rounded-2xl p-5"
            style={{ backgroundColor: alert ? "var(--c-error-bg)" : "var(--c-card)" }}
          >
            <p
              className="font-display text-3xl font-bold"
              style={{ color: alert ? "var(--c-error)" : "var(--c-text)" }}
            >
              {value}
            </p>
            <p className="text-sm font-medium mt-0.5" style={{ color: alert ? "var(--c-error)" : "var(--c-text)" }}>
              {label}
            </p>
            <p className="text-xs mt-0.5" style={{ color: alert ? "var(--c-error-text)" : "var(--c-text-3)" }}>
              {sub}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div
          className="flex items-center gap-2.5 px-4 h-10 rounded-xl w-full sm:w-64 flex-shrink-0"
          style={{ backgroundColor: "var(--c-card)" }}
        >
          <Search size={15} style={{ color: "var(--c-text-3)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="flex-1 text-sm bg-transparent outline-none"
            style={{ color: "var(--c-text)" }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="cursor-pointer"
              style={{ color: "var(--c-text-3)" }}
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none w-full sm:w-auto pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer"
              style={
                activeCategory === cat
                  ? { backgroundColor: "var(--c-text)", color: "var(--c-card)" }
                  : { backgroundColor: "var(--c-card)", color: "var(--c-text-2)" }
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop table */}
      <div
        className="rounded-2xl overflow-hidden hidden md:block"
        style={{ backgroundColor: "var(--c-card)" }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--c-border)" }}>
              {(session ? TABLE_HEAD_ADMIN : TABLE_HEAD_VIEW).map((h) => (
                <th
                  key={h || "actions"}
                  className={`py-3 px-6 text-xs font-medium text-left ${
                    h === "Price" ? "text-right" : ""
                  }`}
                  style={{ color: "var(--c-text-3)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <Package size={32} className="mx-auto mb-3" style={{ color: "var(--c-border-strong)" }} />
                  <p className="text-sm" style={{ color: "var(--c-text-3)" }}>
                    {search || activeCategory !== "All"
                      ? "No products match your filter."
                      : session
                        ? "No products yet. Add your first one!"
                        : "No products yet."}
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((product) =>
                session && deleteConfirm === product.id ? (
                  <tr
                    key={product.id}
                    style={{ backgroundColor: "var(--c-error-bg)", borderBottom: "1px solid var(--c-border)" }}
                  >
                    <td colSpan={4} className="py-4 px-6">
                      <p className="text-sm font-medium" style={{ color: "var(--c-error)" }}>
                        Delete "{product.name}"? This cannot be undone.
                      </p>
                    </td>
                    <td colSpan={2} className="py-4 px-6">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-4 py-1.5 rounded-lg text-xs font-medium cursor-pointer hover-btn transition-colors"
                          style={{ backgroundColor: "var(--c-card)", color: "var(--c-text-2)" }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="px-4 py-1.5 rounded-lg text-xs font-medium text-white cursor-pointer transition-opacity hover:opacity-90"
                          style={{ backgroundColor: "var(--c-error)" }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <ProductRow
                    key={product.id}
                    product={product}
                    onDelete={(id) => setDeleteConfirm(id)}
                    isAdmin={!!session}
                  />
                )
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Package size={32} className="mx-auto mb-3" style={{ color: "var(--c-border-strong)" }} />
            <p className="text-sm" style={{ color: "var(--c-text-3)" }}>
              {search || activeCategory !== "All"
                ? "No products match your filter."
                : session
                  ? "No products yet. Add your first one!"
                  : "No products yet."}
            </p>
          </div>
        ) : (
          filtered.map((product) =>
            session && deleteConfirm === product.id ? (
              <div
                key={product.id}
                className="rounded-2xl p-4"
                style={{ backgroundColor: "var(--c-error-bg)", border: "1px solid var(--c-error-bg)" }}
              >
                <p className="text-sm font-medium mb-3" style={{ color: "var(--c-error)" }}>
                  Delete "{product.name}"?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 py-2 rounded-xl text-sm font-medium cursor-pointer hover-btn transition-colors"
                    style={{ backgroundColor: "var(--c-card)", color: "var(--c-text-2)" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 py-2 rounded-xl text-sm font-medium text-white cursor-pointer transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "var(--c-error)" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <ProductCard
                key={product.id}
                product={product}
                onDelete={(id) => setDeleteConfirm(id)}
                isAdmin={!!session}
              />
            )
          )
        )}
      </div>

      {showAddModal && session && (
        <AddProductModal onClose={() => setShowAddModal(false)} onSave={handleSaveNew} />
      )}

      {lowStockCount > 0 && (
        <div
          className="fixed bottom-6 right-4 sm:right-6 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-medium text-white shadow-lg"
          style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          <AlertTriangle size={16} />
          {lowStockCount} item{lowStockCount > 1 ? "s" : ""} low on stock
        </div>
      )}
    </>
  );
}