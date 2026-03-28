import { Link } from "react-router";
import {
  Settings,
  ScrollText,
  Database,
  Trash2,
  Package,
  ArrowRight,
} from "lucide-react";
import { getProducts } from "~/lib/store";
import { getAuditLog } from "~/lib/audit-log";

export function meta() {
  return [
    { title: "Admin - SukiTrack" },
    { name: "robots", content: "noindex" },
  ];
}

const cards = [
  {
    to: "/admin/settings",
    title: "Store settings",
    desc: "Display name shown across the app.",
    icon: Settings,
  },
  {
    to: "/admin/audit",
    title: "Audit log",
    desc: "Product changes and imports (local only for now).",
    icon: ScrollText,
  },
  {
    to: "/admin/data",
    title: "Export / import",
    desc: "Backup JSON or merge another catalog.",
    icon: Database,
  },
  {
    to: "/admin/bulk",
    title: "Bulk delete",
    desc: "Remove many products in one action.",
    icon: Trash2,
  },
];

export default function AdminHome() {
  const products = getProducts();
  const audit = getAuditLog();

  return (
    <div>
      <h1
        className="font-display text-2xl md:text-3xl font-bold mb-2"
        style={{ color: "var(--c-text)" }}
      >
        Admin overview
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--c-text-3)" }}>
        These tools are gated by the admin password. Data stays in this browser until you connect
        Supabase.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <div className="rounded-2xl p-5" style={{ backgroundColor: "var(--c-card)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Package size={18} style={{ color: "var(--c-tint)" }} />
            <span className="font-display font-bold text-sm" style={{ color: "var(--c-text)" }}>
              Catalog
            </span>
          </div>
          <p className="font-display text-3xl font-bold" style={{ color: "var(--c-text)" }}>
            {products.length}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--c-text-3)" }}>
            products in local storage
          </p>
        </div>
        <div className="rounded-2xl p-5" style={{ backgroundColor: "var(--c-card)" }}>
          <div className="flex items-center gap-2 mb-2">
            <ScrollText size={18} style={{ color: "var(--c-tint)" }} />
            <span className="font-display font-bold text-sm" style={{ color: "var(--c-text)" }}>
              Audit entries
            </span>
          </div>
          <p className="font-display text-3xl font-bold" style={{ color: "var(--c-text)" }}>
            {audit.length}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--c-text-3)" }}>
            newest first (capped)
          </p>
        </div>
      </div>

      <h2 className="font-display font-bold text-sm mb-3" style={{ color: "var(--c-text-2)" }}>
        Quick links
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cards.map(({ to, title, desc, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="rounded-2xl p-5 flex items-start gap-4 transition-opacity hover:opacity-95 cursor-pointer group"
            style={{
              backgroundColor: "var(--c-card)",
              border: "1px solid var(--c-border)",
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "var(--c-card-alt)" }}
            >
              <Icon size={18} style={{ color: "var(--c-text-2)" }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display font-bold text-sm mb-0.5" style={{ color: "var(--c-text)" }}>
                {title}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--c-text-3)" }}>
                {desc}
              </p>
            </div>
            <ArrowRight
              size={16}
              className="flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: "var(--c-tint)" }}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
