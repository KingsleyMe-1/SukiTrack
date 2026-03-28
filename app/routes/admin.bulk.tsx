import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router";
import { Trash2, Package } from "lucide-react";
import type { Product } from "~/lib/types";
import { getProducts, deleteProductsBulk } from "~/lib/store";

export function meta() {
  return [
    { title: "Bulk actions - SukiTrack" },
    { name: "robots", content: "noindex" },
  ];
}

export default function AdminBulk() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const refresh = useCallback(() => {
    setProducts(getProducts());
    setSelected(new Set());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const allIds = products.map((p) => p.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allIds));
    }
  }

  function handleDelete() {
    const ids = [...selected];
    if (!ids.length) return;
    if (
      !confirm(
        `Delete ${ids.length} product(s)? This cannot be undone.`
      )
    ) {
      return;
    }
    deleteProductsBulk(ids);
    refresh();
  }

  return (
    <div>
      <h1
        className="font-display text-2xl font-bold mb-2"
        style={{ color: "var(--c-text)" }}
      >
        Bulk delete
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--c-text-3)" }}>
        Select products to remove from local storage. Single-item edits stay on the catalog screens.
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button
          type="button"
          onClick={toggleAll}
          className="text-xs font-medium px-3 py-2 rounded-xl cursor-pointer hover-btn transition-colors"
          style={{ backgroundColor: "var(--c-card-alt)", color: "var(--c-text-2)" }}
        >
          {allSelected ? "Deselect all" : "Select all"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={!selected.size}
          className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          style={{ backgroundColor: "var(--c-error-bg)", color: "var(--c-error)" }}
        >
          <Trash2 size={14} />
          Delete selected ({selected.size})
        </button>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: "var(--c-card)", border: "1px solid var(--c-border)" }}
      >
        {products.length === 0 ? (
          <p className="py-12 text-center text-sm" style={{ color: "var(--c-text-3)" }}>
            No products to show.
          </p>
        ) : (
          <ul className="divide-y" style={{ borderColor: "var(--c-border)" }}>
            {products.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 px-4 py-3 sm:px-5"
              >
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={() => toggle(p.id)}
                  className="rounded cursor-pointer w-4 h-4 flex-shrink-0"
                  aria-label={`Select ${p.name}`}
                />
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "var(--c-card-alt)" }}
                >
                  <Package size={15} style={{ color: "var(--c-text-3)" }} />
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/catalog/${p.id}`}
                    className="font-medium text-sm hover:underline cursor-pointer"
                    style={{ color: "var(--c-text)" }}
                  >
                    {p.name}
                  </Link>
                  <p className="text-xs" style={{ color: "var(--c-text-3)" }}>
                    {p.category} · P{p.currentPrice.toFixed(2)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
