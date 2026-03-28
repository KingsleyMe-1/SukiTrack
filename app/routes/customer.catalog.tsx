import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Package, Search, X, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { getProducts } from "~/lib/store";
import { getAllStoreUsers } from "~/lib/user-session";
import type { Product } from "~/lib/types";
import { StockBadge } from "~/components/ui/Badge";

export function meta() {
  return [
    { title: "Catalogs - SukiTrack" },
    { name: "description", content: "Browse product catalogs from local sari-sari stores" },
  ];
}

const CATEGORIES = [
  "All", "Grains", "Staples", "Canned Goods", "Beverages", "Snacks",
  "Condiments", "Household", "Fresh", "Personal Care", "Other",
];

export default function CustomerCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const storeFilter = searchParams.get("store") ?? "";

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [storeNames, setStoreNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const allProds = getProducts();
    setProducts(storeFilter ? allProds.filter((p) => p.storeOwnerId === storeFilter) : allProds);
    const storeUsers = getAllStoreUsers();
    const nameMap: Record<string, string> = {};
    storeUsers.forEach((s) => { nameMap[s.email] = s.storeName; });
    setStoreNames(nameMap);
  }, [storeFilter]);

  const filtered = products.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const currentStoreName = storeFilter ? (storeNames[storeFilter] ?? "Store") : null;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold" style={{ color: "var(--c-text)" }}>
            {currentStoreName ? `${currentStoreName} Catalog` : "All Catalogs"}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--c-text-3)" }}>
            {currentStoreName
              ? "Browsing products from this store"
              : "Browse products from all stores"}
          </p>
        </div>
        {storeFilter && (
          <button
            onClick={() => setSearchParams({})}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer hover-btn self-start"
            style={{ color: "var(--c-text-2)", backgroundColor: "var(--c-card)" }}
          >
            <X size={14} />
            All Stores
          </button>
        )}
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
            <button onClick={() => setSearch("")} className="cursor-pointer" style={{ color: "var(--c-text-3)" }}>
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

      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <Package size={36} className="mx-auto mb-3" style={{ color: "var(--c-border-strong)" }} />
          <p className="text-sm" style={{ color: "var(--c-text-3)" }}>
            {search || activeCategory !== "All" ? "No products match your filter." : "No products available."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product) => {
            const h = [...product.priceHistory].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            const delta = h.length >= 2 ? h[0].price - h[1].price : 0;
            return (
              <div
                key={product.id}
                className="rounded-2xl p-4 flex flex-col gap-3"
                style={{ backgroundColor: "var(--c-card)" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "var(--c-card-alt)" }}
                    >
                      <Package size={16} style={{ color: "var(--c-text-3)" }} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm leading-snug" style={{ color: "var(--c-text)" }}>
                        {product.name}
                      </p>
                      <p className="text-xs truncate" style={{ color: "var(--c-text-3)" }}>
                        {product.unit} · {product.category}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <StockBadge status={product.stockStatus} />
                  <div className="text-right">
                    <p className="font-display font-bold text-base" style={{ color: "var(--c-text)" }}>
                      ₱{product.currentPrice.toFixed(2)}
                    </p>
                    {delta !== 0 ? (
                      <span
                        className="flex items-center gap-0.5 text-xs font-medium justify-end"
                        style={{ color: delta < 0 ? "var(--c-success)" : "var(--c-error)" }}
                      >
                        {delta < 0 ? <TrendingDown size={11} /> : <TrendingUp size={11} />}
                        {delta < 0 ? "" : "+"}₱{Math.abs(delta).toFixed(2)}
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-xs justify-end" style={{ color: "var(--c-text-3)" }}>
                        <Minus size={11} /> Steady
                      </span>
                    )}
                  </div>
                </div>

                {product.isPromo && (
                  <div
                    className="text-xs font-medium px-2.5 py-1 rounded-full text-center"
                    style={{ backgroundColor: "var(--c-success-bg)", color: "var(--c-success-text)" }}
                  >
                    On Promo
                  </div>
                )}

                {!storeFilter && product.storeOwnerId && storeNames[product.storeOwnerId] && (
                  <p className="text-xs" style={{ color: "var(--c-text-3)" }}>
                    From: {storeNames[product.storeOwnerId]}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
