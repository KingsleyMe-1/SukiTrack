import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import type { Product } from "~/lib/types";
import { getProducts, replaceAllProducts, mergeProductsFromImport } from "~/lib/store";

export function meta() {
  return [
    { title: "Admin data - SukiTrack" },
    { name: "robots", content: "noindex" },
  ];
}

function isProduct(x: unknown): x is Product {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    typeof o.category === "string" &&
    typeof o.unit === "string" &&
    typeof o.currentPrice === "number" &&
    typeof o.stockStatus === "string" &&
    Array.isArray(o.priceHistory) &&
    typeof o.addedDate === "string"
  );
}

function parseProductsFile(text: string): Product[] | null {
  try {
    const data = JSON.parse(text) as unknown;
    let raw: unknown[];
    if (Array.isArray(data)) {
      raw = data;
    } else if (data && typeof data === "object" && Array.isArray((data as { products?: unknown }).products)) {
      raw = (data as { products: unknown[] }).products;
    } else {
      return null;
    }
    const products = raw.filter(isProduct);
    return products.length ? products : null;
  } catch {
    return null;
  }
}

export default function AdminData() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  function handleExport() {
    const products = getProducts();
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      products,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sukitrack-catalog-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ type: "ok", text: `Exported ${products.length} product(s).` });
  }

  function runImport(mode: "replace" | "merge") {
    const input = fileRef.current;
    if (!input?.files?.[0]) {
      setMessage({ type: "err", text: "Choose a JSON file first." });
      return;
    }
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      const products = parseProductsFile(text);
      if (!products) {
        setMessage({
          type: "err",
          text: "Invalid file. Expected an array of products or { products: [...] }.",
        });
        return;
      }
      if (mode === "replace") {
        replaceAllProducts(products);
        setMessage({ type: "ok", text: `Replaced catalog with ${products.length} product(s).` });
      } else {
        mergeProductsFromImport(products);
        setMessage({
          type: "ok",
          text: `Merged ${products.length} product(s). Refresh other tabs if open.`,
        });
      }
      input.value = "";
    };
    reader.readAsText(file);
  }

  return (
    <div>
      <h1
        className="font-display text-2xl font-bold mb-2"
        style={{ color: "var(--c-text)" }}
      >
        Export & import
      </h1>
      <p className="text-sm mb-8 max-w-2xl" style={{ color: "var(--c-text-3)" }}>
        Download a JSON backup of your catalog, or upload one exported from this app. Use merge to
        keep existing IDs and overwrite matching ones; use replace to wipe local products first.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
        <div className="rounded-2xl p-6" style={{ backgroundColor: "var(--c-card)" }}>
          <h2 className="font-display font-bold text-sm mb-3" style={{ color: "var(--c-text)" }}>
            Export
          </h2>
          <p className="text-xs mb-4 leading-relaxed" style={{ color: "var(--c-text-3)" }}>
            Saves <code className="text-[11px]">version</code>,{" "}
            <code className="text-[11px]">exportedAt</code>, and{" "}
            <code className="text-[11px]">products</code>.
          </p>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white cursor-pointer transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            <Download size={16} />
            Download JSON
          </button>
        </div>

        <div className="rounded-2xl p-6" style={{ backgroundColor: "var(--c-card)" }}>
          <h2 className="font-display font-bold text-sm mb-3" style={{ color: "var(--c-text)" }}>
            Import
          </h2>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="block w-full text-xs mb-4"
            style={{ color: "var(--c-text-2)" }}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => runImport("merge")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors hover-btn"
              style={{ backgroundColor: "var(--c-card-alt)", color: "var(--c-text)" }}
            >
              <Upload size={16} />
              Merge
            </button>
            <button
              type="button"
              onClick={() => runImport("replace")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-opacity hover:opacity-90"
              style={{ color: "var(--c-error)", backgroundColor: "var(--c-error-bg)" }}
            >
              Replace all
            </button>
          </div>
        </div>
      </div>

      {message && (
        <p
          className="mt-6 text-sm font-medium max-w-2xl"
          style={{ color: message.type === "ok" ? "var(--c-success-text)" : "var(--c-error)" }}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
