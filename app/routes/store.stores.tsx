import { useState } from "react";
import { Store, Package, ArrowRight, Search, X, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { getAllStoreUsers } from "~/lib/user-session";
import { getProducts } from "~/lib/store";
import { useUserSession } from "~/lib/use-user-session";
import type { Product } from "~/lib/types";

export function meta() {
  return [
    { title: "Browse Stores — SukiTrack" },
    { name: "description", content: "Browse other stores' catalogs" },
  ];
}

function priceDelta(p: Product): number {
  const h = [...p.priceHistory].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return h.length >= 2 ? h[0].price - h[1].price : 0;
}

interface StoreCatalogProps {
  storeEmail: string;
  storeName: string;
  products: Product[];
  onClose: () => void;
}

function StoreCatalogDrawer({ storeEmail, storeName, products, onClose }: StoreCatalogProps) {
  const [search, setSearch] = useState("");
  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ backgroundColor: "var(--c-overlay)" }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-2xl max-h-[90vh] rounded-t-3xl sm:rounded-2xl flex flex-col overflow-hidden"
        style={{ backgroundColor: "var(--c-page-bg)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: "1px solid var(--c-border)", backgroundColor: "var(--c-card)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "var(--primary)" }}
            >
              <Store size={16} style={{ color: "var(--primary-foreground)" }} />
            </div>
            <div>
              <p className="font-display font-bold text-sm" style={{ color: "var(--c-text)" }}>
                {storeName}
              </p>
              <p className="text-xs" style={{ color: "var(--c-text-3)" }}>
                {products.length} product{products.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer hover-btn transition-colors"
            style={{ color: "var(--c-text-3)" }}
            aria-label="Close"
          >
            <X size={17} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3" style={{ backgroundColor: "var(--c-card)" }}>
          <div
            className="flex items-center gap-2.5 px-4 h-10 rounded-xl text-sm"
            style={{ backgroundColor: "var(--c-input)" }}
          >
            <Search size={14} style={{ color: "var(--c-text-3)" }} />
            <input
              type="text"
              placeholder="Search items…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: "var(--c-text)" }}
            />
          </div>
        </div>

        {/* Product list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-sm" style={{ color: "var(--c-text-3)" }}>
              No products found.
            </div>
          ) : (
            filtered.map((p) => {
              const delta = priceDelta(p);
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-3 px-4 rounded-xl"
                  style={{ backgroundColor: "var(--c-card)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "var(--c-card-alt)" }}
                    >
                      <Package size={13} style={{ color: "var(--c-text-3)" }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--c-text)" }}>
                        {p.name}
                      </p>
                      <p className="text-xs" style={{ color: "var(--c-text-3)" }}>
                        {p.unit} · {p.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span
                      className="flex items-center gap-1 text-xs"
                      style={{
                        color:
                          delta < 0
                            ? "var(--c-success)"
                            : delta > 0
                            ? "var(--c-error)"
                            : "var(--c-text-3)",
                      }}
                    >
                      {delta < 0 && <TrendingDown size={11} />}
                      {delta > 0 && <TrendingUp size={11} />}
                      {delta === 0 && <Minus size={11} />}
                    </span>
                    <p
                      className="font-display font-semibold text-sm"
                      style={{ color: "var(--c-text)" }}
                    >
                      P{p.currentPrice.toFixed(2)}
                    </p>
                    {p.isPromo && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: "var(--c-error-bg)", color: "var(--c-error)" }}
                      >
                        PROMO
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default function StoreStores() {
  const session = useUserSession();
  const [openStoreEmail, setOpenStoreEmail] = useState<string | null>(null);

  // All stores except the current user's own store
  const allStores = getAllStoreUsers().filter(
    (s) => s.email !== session?.email
  );
  const allProducts = getProducts();

  const openStore = openStoreEmail
    ? allStores.find((s) => s.email === openStoreEmail)
    : null;
  const openProducts = openStoreEmail
    ? allProducts.filter((p) => p.storeOwnerId === openStoreEmail)
    : [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div>
          <h1
            className="font-display text-2xl md:text-3xl font-bold"
            style={{ color: "var(--c-text)" }}
          >
            Browse Stores
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--c-text-3)" }}>
            Explore catalogs from other store owners on the network.
          </p>
        </div>
      </div>

      {allStores.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ backgroundColor: "var(--c-card)" }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "var(--c-card-alt)" }}
          >
            <Store size={22} style={{ color: "var(--c-text-3)" }} />
          </div>
          <p className="font-display font-semibold text-base mb-1" style={{ color: "var(--c-text)" }}>
            No other stores yet
          </p>
          <p className="text-sm" style={{ color: "var(--c-text-3)" }}>
            Once other store owners register, their catalogs will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allStores.map((store) => {
            const storeProducts = allProducts.filter(
              (p) => p.storeOwnerId === store.email
            );
            const promoCount = storeProducts.filter((p) => p.isPromo).length;
            const lowStockCount = storeProducts.filter(
              (p) => p.stockStatus === "low-stock"
            ).length;

            return (
              <button
                key={store.id}
                type="button"
                onClick={() => setOpenStoreEmail(store.email)}
                className="group rounded-2xl p-6 text-left transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                style={{
                  backgroundColor: "var(--c-card)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    <span className="font-display font-bold text-sm" style={{ color: "var(--primary-foreground)" }}>
                      {store.storeName.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p
                      className="font-display font-bold text-sm truncate"
                      style={{ color: "var(--c-text)" }}
                    >
                      {store.storeName}
                    </p>
                    <p className="text-xs truncate" style={{ color: "var(--c-text-3)" }}>
                      by {store.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-5">
                  <div className="text-center">
                    <p
                      className="font-display font-bold text-lg"
                      style={{ color: "var(--c-text)" }}
                    >
                      {storeProducts.length}
                    </p>
                    <p className="text-xs" style={{ color: "var(--c-text-3)" }}>
                      Products
                    </p>
                  </div>
                  {promoCount > 0 && (
                    <div className="text-center">
                      <p
                        className="font-display font-bold text-lg"
                        style={{ color: "var(--c-error)" }}
                      >
                        {promoCount}
                      </p>
                      <p className="text-xs" style={{ color: "var(--c-text-3)" }}>
                        Promos
                      </p>
                    </div>
                  )}
                  {lowStockCount > 0 && (
                    <div className="text-center">
                      <p
                        className="font-display font-bold text-lg"
                        style={{ color: "var(--c-error)" }}
                      >
                        {lowStockCount}
                      </p>
                      <p className="text-xs" style={{ color: "var(--c-text-3)" }}>
                        Low Stock
                      </p>
                    </div>
                  )}
                </div>

                <div
                  className="flex items-center gap-1 text-sm font-medium"
                  style={{ color: "var(--c-tint)" }}
                >
                  View catalog
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {openStore && (
        <StoreCatalogDrawer
          storeEmail={openStore.email}
          storeName={openStore.storeName}
          products={openProducts}
          onClose={() => setOpenStoreEmail(null)}
        />
      )}
    </div>
  );
}
