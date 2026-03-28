import { Outlet } from "react-router";
import { TrendingUp } from "lucide-react";
import { Link } from "react-router";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-background">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-2.5 mb-8 group">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
          style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          <TrendingUp className="w-4 h-4" />
        </div>
        <span className="font-bold text-base" style={{ color: "var(--foreground)" }}>
          SukiTrack
        </span>
      </Link>

      {/* Auth card */}
      <div
        className="w-full max-w-md rounded-2xl p-7 sm:p-8"
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <Outlet />
      </div>

      <p className="mt-6 text-xs" style={{ color: "var(--muted-foreground)" }}>
        <Link to="/" className="hover:underline">← Back to home</Link>
      </p>
    </div>
  );
}

