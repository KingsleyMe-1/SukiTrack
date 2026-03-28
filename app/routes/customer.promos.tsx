import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Tag, Package, TrendingDown, TrendingUp } from "lucide-react";
import { getProducts } from "~/lib/store";
import { getAllStoreUsers } from "~/lib/user-session";
import type { Product } from "~/lib/types";

export function meta() {
  return [
    { title: "Promos - SukiTrack" },
    { name: "description", content: "Current promotions and deals from local stores" },
  ];
}

export default function CustomerPromos() {
  const [promos, setPromos] = useState<Product[]>([]);
  const [storeNames, setStoreNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const allProds = getProducts();
    setPromos(allProds.filter((p) => p.isPromo));
    const storeUsers = getAllStoreUsers();
    const nameMap: Record<string, string> = {};
    storeUsers.forEach((s) => { nameMap[s.email] = s.storeName; });
    setStoreNames(nameMap);
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold" style={{ color: "var(--c-text)" }}>
          Promos &amp; Deals
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--c-text-3)" }}>
          {promos.length} item{promos.length !== 1 ? "s" : ""} currently on promotion
        </p>
      </div>

      {promos.length === 0 ? (
        <div className="py-20 text-center">
          <Tag size={40} className="mx-auto mb-4" style={{ color: "var(--c-border-strong)" }} />
          <p className="font-display font-bold text-lg mb-1" style={{ color: "var(--c-text)" }}>
            No active promos
          </p>
          <p className="text-sm" style={{ color: "var(--c-text-3)" }}>
            Check back later for deals from local stores.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {promos.map((product) => {
            const h = [...product.priceHistory].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            const delta = h.length >= 2 ? h[0].price - h[1].price : 0;
            const storeName = product.storeOwnerId ? storeNames[product.storeOwnerId] : null;

            return (
              <div
                key={product.id}
                className="rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden"
                style={{ backgroundColor: "var(--c-card)" }}
              >
                {/* Promo badge */}
                <div
                  className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: "var(--c-success-bg)", color: "var(--c-success-text)" }}
                >
                  Promo
                </div>

                <div className="flex items-start gap-3 pr-14">
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

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display font-bold text-xl" style={{ color: "var(--c-success)" }}>
                      ₱{product.currentPrice.toFixed(2)}
                    </p>
                    {delta < 0 && (
                      <span
                        className="flex items-center gap-0.5 text-xs font-medium"
                        style={{ color: "var(--c-success)" }}
                      >
                        <TrendingDown size={11} />
                        ₱{Math.abs(delta).toFixed(2)} off
                      </span>
                    )}
                    {delta > 0 && (
                      <span
                        className="flex items-center gap-0.5 text-xs font-medium"
                        style={{ color: "var(--c-error)" }}
                      >
                        <TrendingUp size={11} />+₱{delta.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {storeName && (
                  <Link
                    to={`/customer/catalog?store=${encodeURIComponent(product.storeOwnerId!)}`}
                    className="text-xs font-medium"
                    style={{ color: "var(--c-tint)" }}
                  >
                    {storeName} →
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
