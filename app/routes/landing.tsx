import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Store, ShoppingCart, ArrowRight, TrendingUp, Sparkles } from "lucide-react";
import { getUserSession } from "~/lib/user-session";

export function meta() {
  return [
    { title: "SukiTrack — Neighborhood Price Tracker" },
    { name: "description", content: "Track prices at your favorite sari-sari store." },
  ];
}

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    const session = getUserSession();
    if (!session) return;
    if (session.role === "store_owner") navigate("/store", { replace: true });
    else if (session.role === "customer") navigate("/customer", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-12 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="font-bold text-base" style={{ color: "var(--foreground)" }}>
            SukiTrack
          </span>
        </div>
        <span
          className="text-xs px-2.5 py-1 rounded-full font-medium"
          style={{ backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }}
        >
          Free · No login required for customers
        </span>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-24">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}
        >
          <Sparkles size={12} />
          Neighborhood Price Ledger
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center leading-tight mb-5 max-w-2xl" style={{ color: "var(--foreground)" }}>
          Your Suki Store,{" "}
          <span style={{ color: "var(--primary)" }}>Tracked.</span>
        </h1>

        <p className="text-center text-base md:text-lg max-w-lg mx-auto mb-14 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
          Monitor prices, manage inventory, and stay on top of every deal — whether you run the store or just shop there.
        </p>

        {/* Role cards */}
        <div className="w-full max-w-2xl grid sm:grid-cols-2 gap-4">
          {/* Customer card */}
          <Link
            to="/auth/customer"
            className="group rounded-2xl p-7 flex flex-col gap-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "var(--customer-color)", color: "var(--customer-color-fg)" }}
            >
              <ShoppingCart size={20} />
            </div>
            <div>
              <p className="font-bold text-lg mb-1.5" style={{ color: "var(--foreground)" }}>
                I'm a Customer
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                Browse store catalogs, compare prices, and keep a personal shopping checklist.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold mt-auto" style={{ color: "var(--customer-color)" }}>
              Continue
              <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Store Owner card */}
          <Link
            to="/auth/store-owner"
            className="group rounded-2xl p-7 flex flex-col gap-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: "oklch(from var(--primary) l c h / 0.2)", color: "var(--primary-foreground)" }}>
              <Store size={20} />
            </div>
            <div>
              <p className="font-bold text-lg mb-1.5">
                I'm a Store Owner
              </p>
              <p className="text-sm leading-relaxed opacity-75">
                Manage your catalog, update prices, and get real-time insights on your store.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold mt-auto opacity-90">
              Continue
              <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs py-4 px-4" style={{ color: "var(--muted-foreground)", borderTop: "1px solid var(--border)" }}>
        © {new Date().getFullYear()} SukiTrack · Built for Philippine neighborhood stores
      </footer>
    </div>
  );
}

