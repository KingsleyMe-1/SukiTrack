import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { Shield, ArrowLeft } from "lucide-react";
import { isAdminAuthenticated, loginAdmin } from "~/lib/admin-session";

export function meta() {
  return [
    { title: "Admin sign in - SukiTrack" },
    { name: "robots", content: "noindex" },
  ];
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next") || "/admin";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAdminAuthenticated()) {
      navigate(next, { replace: true });
    }
  }, [navigate, next]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!loginAdmin(password)) {
      setError("Incorrect password.");
      return;
    }
    navigate(next, { replace: true });
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: "var(--c-page-bg)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-7 sm:p-8 shadow-xl"
        style={{
          backgroundColor: "var(--c-card)",
          border: "1px solid var(--c-border)",
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <Shield className="w-6 h-6" style={{ color: "var(--primary-foreground)" }} />
          </div>
          <div>
            <h1
              className="font-display font-bold text-lg"
              style={{ color: "var(--c-text)" }}
            >
              Admin access
            </h1>
            <p className="text-xs" style={{ color: "var(--c-text-3)" }}>
              Local session only — replace with Supabase Auth later.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--c-text-2)" }}
            >
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
              style={{
                backgroundColor: "var(--c-input)",
                color: "var(--c-text)",
                border: "none",
              }}
              placeholder="Enter admin password"
              required
            />
            <p className="text-xs mt-2" style={{ color: "var(--c-text-3)" }}>
              Default is <code className="text-[11px]">changeme</code> unless{" "}
              <code className="text-[11px]">VITE_ADMIN_PASSWORD</code> is set.
            </p>
          </div>

          {error && (
            <p className="text-xs font-medium" style={{ color: "var(--c-error)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            Sign in
          </button>
        </form>

        <Link
          to="/store"
          className="mt-6 inline-flex items-center gap-2 text-sm cursor-pointer hover:underline"
          style={{ color: "var(--c-tint)" }}
        >
          <ArrowLeft size={14} />
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
