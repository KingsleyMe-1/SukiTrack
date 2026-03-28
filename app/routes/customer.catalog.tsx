import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { Package, Search, X, TrendingDown, TrendingUp, Minus, ChevronDown } from "lucide-react";
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

type PriceSort = "none" | "lowest" | "highest";

export default function CustomerCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const storeFilter = searchParams.get("store") ?? "All";

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [priceSort, setPriceSort] = useState<PriceSort>("none");
  const [storeNames, setStoreNames] = useState<Record<string, string>>({});

  useEffect(() => {
    setProducts(getProducts());
    const stores = getAllStoreUsers();
    const nameMap: Record<string, string> = {};
    stores.forEach((s) => {
      nameMap[s.email] = s.storeName;
    });
    setStoreNames(nameMap);
  }, []);

  const storeOptions = useMemo(() => {
    const ids = Array.from(
      new Set(products.map((p) => p.storeOwnerId).filter((id): id is string => !!id))
    );
    return ids.sort((a, b) => {
      const nameA = storeNames[a] ?? a;
      const nameB = storeNames[b] ?? b;
      return nameA.localeCompare(nameB);
    });
  }, [products, storeNames]);

  const filtered = useMemo(() => {
    const searched = products.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === "All" || p.category === activeCategory;
      const matchesStore = storeFilter === "All" || p.storeOwnerId === storeFilter;
      return matchesSearch && matchesCategory && matchesStore;
    });

    if (priceSort === "none") return searched;
    return [...searched].sort((a, b) =>
      priceSort === "lowest"
        ? a.currentPrice - b.currentPrice
        : b.currentPrice - a.currentPrice
    );
  }, [products, search, activeCategory, storeFilter, priceSort]);

  const currentStoreName = storeFilter !== "All" ? (storeNames[storeFilter] ?? "Store") : null;

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
      </div>

      <div className="flex flex-col gap-3 mb-6">
        <div
          className="flex items-center gap-3 px-4 h-11 rounded-xl w-full"
          style={{ backgroundColor: "var(--c-input)", border: "1px solid var(--c-border)" }}
        >
          <Search size={16} style={{ color: "var(--c-text-3)" }} />
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
          <div className="relative">
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="w-full h-10 px-3 pr-9 rounded-xl text-sm outline-none cursor-pointer appearance-none focus:ring-2 focus:ring-[var(--primary)]"
              style={{ backgroundColor: "var(--c-input)", color: "var(--c-text)", border: "1px solid var(--c-border)" }}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "All Categories" : cat}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--c-text-3)" }} />
          </div>

          <div className="relative">
            <select
              value={priceSort}
              onChange={(e) => setPriceSort(e.target.value as PriceSort)}
              className="w-full h-10 px-3 pr-9 rounded-xl text-sm outline-none cursor-pointer appearance-none focus:ring-2 focus:ring-[var(--primary)]"
              style={{ backgroundColor: "var(--c-input)", color: "var(--c-text)", border: "1px solid var(--c-border)" }}
            >
              <option value="none">Price: Default</option>
              <option value="lowest">Price: Lowest first</option>
              <option value="highest">Price: Highest first</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--c-text-3)" }} />
          </div>

          <div className="relative">
            <select
              value={storeFilter}
              onChange={(e) => {
                const next = e.target.value;
                if (next === "All") {
                  setSearchParams({});
                  return;
                }
                setSearchParams({ store: next });
              }}
              className="w-full h-10 px-3 pr-9 rounded-xl text-sm outline-none cursor-pointer appearance-none focus:ring-2 focus:ring-[var(--primary)]"
              style={{ backgroundColor: "var(--c-input)", color: "var(--c-text)", border: "1px solid var(--c-border)" }}
            >
              <option value="All">All Stores</option>
              {storeOptions.map((storeId) => (
                <option key={storeId} value={storeId}>
                  {storeNames[storeId] ?? storeId}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--c-text-3)" }} />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <Package size={36} className="mx-auto mb-3" style={{ color: "var(--c-border-strong)" }} />
          <p className="text-sm" style={{ color: "var(--c-text-3)" }}>
            {search || activeCategory !== "All" || storeFilter !== "All"
              ? "No products match your filter."
              : "No products available."}
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
                      P{product.currentPrice.toFixed(2)}
                    </p>
                    {delta !== 0 ? (
                      <span
                        className="flex items-center gap-0.5 text-xs font-medium justify-end"
                        style={{ color: delta < 0 ? "var(--c-success)" : "var(--c-error)" }}
                      >
                        {delta < 0 ? <TrendingDown size={11} /> : <TrendingUp size={11} />}
                        {delta < 0 ? "" : "+"}P{Math.abs(delta).toFixed(2)}
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

                {storeFilter === "All" && product.storeOwnerId && storeNames[product.storeOwnerId] && (
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
