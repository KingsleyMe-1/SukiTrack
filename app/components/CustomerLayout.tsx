import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { useUserSession } from "~/lib/use-user-session";
import { logoutUser } from "~/lib/user-session";
import {
  Store,
  BookOpen,
  CheckSquare,
  Percent,
  HelpCircle,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
  User,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/customer", label: "Stores", icon: Store, exact: true },
  { to: "/customer/catalog", label: "Catalogs", icon: BookOpen, exact: false },
  { to: "/customer/checklist", label: "My Checklist", icon: CheckSquare, exact: false },
  { to: "/customer/promos", label: "Promos", icon: Percent, exact: false },
];

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const location = useLocation();
  const session = useUserSession();
  const navigate = useNavigate();
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

  function handleLogout() {
    logoutUser();
    navigate("/", { replace: true });
  }

  const displayName = session?.name ?? "Customer";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="bg-background min-h-screen">
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
        className={`fixed left-0 top-0 z-50 h-full flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{
          width: 260,
          backgroundColor: "var(--c-sidebar-bg)",
          borderRight: "1px solid var(--border)",
        }}
      >
        {/* Mobile close */}
        <button
          className="lg:hidden absolute right-3 top-3 w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors hover-btn"
          style={{ color: "var(--muted-foreground)" }}
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        >
          <X size={16} />
        </button>

        {/* Brand */}
        <div className="px-5 pt-7 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "var(--customer-color)", color: "var(--customer-color-fg)" }}
            >
              <Store className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm leading-none" style={{ color: "var(--foreground)" }}>
                SukiTrack
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                Customer
              </p>
            </div>
          </div>
        </div>

        {/* User chip */}
        <div className="px-5 mb-5">
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
            style={{ backgroundColor: "var(--muted)" }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0"
            style={{ backgroundColor: "var(--customer-color)", color: "var(--customer-color-fg)" }}
            >
              {initial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>
                {displayName}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto scrollbar-none">
          {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => {
            const isActive = exact
              ? location.pathname === to
              : location.pathname === to || location.pathname.startsWith(`${to}/`);
            return (
              <NavLink
                key={to}
                to={to}
                end={exact}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                  !isActive ? "hover-nav" : ""
                }`}
                style={
                  isActive
                    ? { backgroundColor: "var(--customer-color)", color: "var(--customer-color-fg)" }
                    : { color: "var(--muted-foreground)" }
                }
              >
                <Icon className="flex-shrink-0" size={17} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={14} className="opacity-60" />}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-5 pt-4 space-y-0.5" style={{ borderTop: "1px solid var(--border)" }}>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors cursor-pointer hover-nav"
            style={{ color: "var(--muted-foreground)" }}
          >
            <HelpCircle size={16} />
            Help Center
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors cursor-pointer text-left hover-error"
            style={{ color: "var(--destructive)" }}
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col min-h-screen lg:ml-[260px]">
        {/* Header */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 h-14"
          style={{
            backgroundColor: "var(--c-header-bg)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <button
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors hover-btn"
            style={{ color: "var(--muted-foreground)" }}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={19} />
          </button>

          <span className="hidden lg:flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            <User size={15} style={{ color: "var(--muted-foreground)" }} />
            {displayName}
          </span>

          <div className="flex items-center gap-1.5 ml-auto">
            <button
              onClick={toggleDark}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer hover-btn"
              style={{ color: "var(--muted-foreground)" }}
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <button
              className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer hover-btn"
              style={{ color: "var(--muted-foreground)" }}
              aria-label="Notifications"
            >
              <Bell size={17} />
            </button>

            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer"
              style={{ backgroundColor: "var(--customer-color)", color: "var(--customer-color-fg)" }}
            >
              {initial}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 md:px-6 py-5 md:py-6">{children}</main>

        <footer
          className="px-4 md:px-6 py-3 text-xs flex items-center justify-between"
          style={{ color: "var(--muted-foreground)", borderTop: "1px solid var(--border)" }}
        >
          <span>© {new Date().getFullYear()} SukiTrack</span>
          <span>Customer View</span>
        </footer>
      </div>
    </div>
  );
}
