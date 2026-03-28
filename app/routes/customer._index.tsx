import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Store, Package, Tag, AlertTriangle } from "lucide-react";
import { getAllStoreUsers } from "~/lib/user-session";
import { getProducts } from "~/lib/store";
import type { StoreUserAccount } from "~/lib/types";

export function meta() {
  return [
    { title: "Browse Stores - SukiTrack" },
    { name: "description", content: "Discover local sari-sari stores near you" },
  ];
}

interface StoreWithStats {
  info: Omit<StoreUserAccount, "password">;
  productCount: number;
  promoCount: number;
  lowStockCount: number;
}

export default function CustomerIndex() {
  const [stores, setStores] = useState<StoreWithStats[]>([]);

  useEffect(() => {
    const storeUsers = getAllStoreUsers();
    const allProducts = getProducts();
    const enriched: StoreWithStats[] = storeUsers.map((s) => {
      const prods = allProducts.filter((p) => p.storeOwnerId === s.email);
      return {
        info: s,
        productCount: prods.length,
        promoCount: prods.filter((p) => p.isPromo).length,
        lowStockCount: prods.filter((p) => p.stockStatus === "low-stock").length,
      };
    });
    setStores(enriched);
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold" style={{ color: "var(--c-text)" }}>
          Browse Stores
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--c-text-3)" }}>
          Discover sari-sari stores and view their price catalogs
        </p>
      </div>

      {stores.length === 0 ? (
        <div className="py-20 text-center">
          <Store size={40} className="mx-auto mb-4" style={{ color: "var(--c-border-strong)" }} />
          <p className="font-display font-bold text-lg mb-1" style={{ color: "var(--c-text)" }}>
            No stores yet
          </p>
          <p className="text-sm" style={{ color: "var(--c-text-3)" }}>
            Stores will appear here once store owners sign up.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {stores.map(({ info, productCount, promoCount, lowStockCount }) => (
            <div
              key={info.id}
              className="rounded-2xl p-6 flex flex-col gap-4"
              style={{ backgroundColor: "var(--c-card)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "var(--secondary)" }}
                >
                  <Store size={22} style={{ color: "var(--secondary-foreground)" }} />
                </div>
                <div className="min-w-0">
                  <p className="font-display font-bold text-base leading-snug" style={{ color: "var(--c-text)" }}>
                    {info.storeName}
                  </p>
                  <p className="text-xs truncate" style={{ color: "var(--c-text-3)" }}>
                    by {info.name}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl p-3 text-center" style={{ backgroundColor: "var(--c-card-alt)" }}>
                  <p className="font-display font-bold text-xl" style={{ color: "var(--c-text)" }}>
                    {productCount}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--c-text-3)" }}>Items</p>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ backgroundColor: "var(--c-card-alt)" }}>
                  <p className="font-display font-bold text-xl" style={{ color: "var(--c-success)" }}>
                    {promoCount}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--c-text-3)" }}>Promos</p>
                </div>
                <div
                  className="rounded-xl p-3 text-center"
                  style={{ backgroundColor: lowStockCount > 0 ? "var(--c-error-bg)" : "var(--c-card-alt)" }}
                >
                  <p
                    className="font-display font-bold text-xl"
                    style={{ color: lowStockCount > 0 ? "var(--c-error)" : "var(--c-text)" }}
                  >
                    {lowStockCount}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: lowStockCount > 0 ? "var(--c-error)" : "var(--c-text-3)" }}
                  >
                    Low Stock
                  </p>
                </div>
              </div>

              <Link
                to={`/customer/catalog?store=${encodeURIComponent(info.email)}`}
                className="w-full py-2.5 rounded-xl text-sm font-medium text-center transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)" }}
              >
                View Catalog
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
