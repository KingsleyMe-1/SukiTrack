import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router";
import {
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  Store,
  Settings,
  HelpCircle,
  Bell,
  Search,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/catalog", label: "Catalog", icon: BookOpen },
  { to: "/trends", label: "Trends", icon: TrendingUp },
];

interface LayoutProps {
  children: React.ReactNode;
  storeName?: string;
}

export default function Layout({ children, storeName = "Erlinda Digman" }: LayoutProps) {
  const location = useLocation();
  const [dark, setDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sukitrack_theme");
    if (stored === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("sukitrack_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("sukitrack_theme", "light");
    }
  }

  return (
    <div style={{ backgroundColor: "var(--c-page-bg)", minHeight: "100vh" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: "var(--c-overlay)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full flex flex-col transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{
          width: 256,
          backgroundColor: "var(--c-sidebar-bg)",
          borderRight: "1px solid var(--c-border)",
        }}
      >
        {/* Mobile close button */}
        <button
          className="lg:hidden absolute right-3 top-3 w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors hover-btn"
          style={{ color: "var(--c-text-3)" }}
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        >
          <X size={16} />
        </button>

        {/* Store identity */}
        <div className="px-6 pt-8 pb-6 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #000000, #00174b)" }}
          >
            <Store className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p
              className="font-display font-bold text-sm"
              style={{ color: "var(--c-text)" }}
            >
              SukiTrack
            </p>
            <p className="text-xs truncate" style={{ color: "var(--c-text-2)" }}>
              {storeName}
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
            const isActive =
              to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  !isActive ? "hover-nav" : ""
                }`}
                style={
                  isActive
                    ? { background: "linear-gradient(135deg, #000000, #00174b)", color: "#ffffff" }
                    : { color: "var(--c-text-2)" }
                }
              >
                <Icon className="flex-shrink-0" size={18} />
                {label}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer links */}
        <div
          className="px-3 pb-6 space-y-1 pt-4"
          style={{ borderTop: "1px solid var(--c-border)" }}
        >
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors cursor-pointer hover-nav"
            style={{ color: "var(--c-text-3)" }}
          >
            <Settings size={16} />
            Store Settings
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors cursor-pointer hover-nav"
            style={{ color: "var(--c-text-3)" }}
          >
            <HelpCircle size={16} />
            Help Center
          </a>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col min-h-screen lg:ml-64">
        {/* Top header */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 h-16"
          style={{
            backgroundColor: "var(--c-header-bg)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid var(--c-header-border)",
          }}
        >
          {/* Hamburger — mobile/tablet */}
          <button
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer transition-colors hover-btn mr-2"
            style={{ color: "var(--c-text-2)" }}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {/* Search */}
          <div
            className="hidden sm:flex items-center gap-2.5 px-4 h-9 rounded-xl text-sm w-56 md:w-72"
            style={{ backgroundColor: "var(--c-card-alt)", color: "var(--c-text-3)" }}
          >
            <Search size={15} />
            <span>Search items…</span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={toggleDark}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer hover-btn"
              style={{ color: "var(--c-text-2)" }}
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer hover-btn"
              style={{ color: "var(--c-text-2)" }}
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ backgroundColor: "var(--c-error)" }}
              />
            </button>

            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-sm cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #000000, #00174b)",
                color: "#ffffff",
              }}
            >
              {storeName.charAt(0)}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 md:px-8 py-5 md:py-7">{children}</main>

        {/* Footer */}
        <footer
          className="px-4 md:px-8 py-4 text-xs flex items-center justify-between"
          style={{ color: "var(--c-text-3)", borderTop: "1px solid var(--c-border)" }}
        >
          <span>© {new Date().getFullYear()} SukiTrack</span>
          <span className="flex gap-4">
            <a href="#" className="hover:underline cursor-pointer">Privacy</a>
            <a href="#" className="hover:underline cursor-pointer">Terms</a>
          </span>
        </footer>
      </div>
    </div>
  );
}