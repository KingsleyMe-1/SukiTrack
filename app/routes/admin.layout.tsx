import {
  Outlet,
  NavLink,
  useLocation,
  Link,
  Form,
  useRouteError,
  isRouteErrorResponse,
} from "react-router";
import {
  Shield,
  LayoutDashboard,
  ScrollText,
  Database,
  Trash2,
  Settings,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { getStoreName } from "~/lib/store";

const ADMIN_NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/settings", label: "Store settings", icon: Settings, end: false },
  { to: "/admin/audit", label: "Audit log", icon: ScrollText, end: false },
  { to: "/admin/data", label: "Data", icon: Database, end: false },
  { to: "/admin/bulk", label: "Bulk actions", icon: Trash2, end: false },
];

export default function AdminLayoutRoute() {
  const location = useLocation();
  const storeLabel = getStoreName();

  return (
    <div style={{ backgroundColor: "var(--c-page-bg)", minHeight: "100vh" }}>
      <div className="flex flex-col lg:flex-row min-h-screen">
        <aside
          className="lg:w-56 flex-shrink-0 border-b lg:border-b-0 lg:border-r"
          style={{
            borderColor: "var(--c-border)",
            backgroundColor: "var(--c-sidebar-bg)",
          }}
        >
          <div className="px-5 py-6 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "var(--primary)" }}
            >
              <Shield className="w-5 h-5" style={{ color: "var(--primary-foreground)" }} />
            </div>
            <div className="min-w-0">
              <p
                className="font-display font-bold text-sm"
                style={{ color: "var(--c-text)" }}
              >
                Admin
              </p>
              <p className="text-xs truncate" style={{ color: "var(--c-text-2)" }}>
                {storeLabel}
              </p>
            </div>
          </div>

          <nav className="px-2 pb-4 space-y-1">
            {ADMIN_NAV.map(({ to, label, icon: Icon, end }) => {
              const isActive = end
                ? location.pathname === to
                : location.pathname === to ||
                  location.pathname.startsWith(`${to}/`);
              return (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    !isActive ? "hover-nav" : ""
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: "var(--primary)",
                          color: "var(--primary-foreground)",
                        }
                      : { color: "var(--c-text-2)" }
                  }
                >
                  <Icon size={17} className="flex-shrink-0" />
                  {label}
                </NavLink>
              );
            })}
          </nav>

          <div
            className="px-2 pb-6 pt-2 space-y-1"
            style={{ borderTop: "1px solid var(--c-border)" }}
          >
            <Link
              to="/store"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors cursor-pointer hover-nav"
              style={{ color: "var(--c-text-3)" }}
            >
              <ArrowLeft size={16} />
              Back to app
            </Link>
            <Form method="post">
              <button
                type="submit"
                name="intent"
                value="logout"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors cursor-pointer hover-nav text-left"
                style={{ color: "var(--c-error)" }}
              >
                <LogOut size={16} />
                Log out
              </button>
            </Form>
          </div>
        </aside>

        <main className="flex-1 px-4 md:px-8 py-6 md:py-8 max-w-5xl w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export async function loader({ request }: { request: Request }) {
  const { requireAdmin } = await import("~/lib/admin-auth");
  await requireAdmin(request);
  return null;
}

export async function action({ request }: { request: Request }) {
  const { destroyAdminSessionRedirect } = await import("~/lib/admin-auth");
  const formData = await request.formData();
  if (formData.get("intent") === "logout") {
    return destroyAdminSessionRedirect(request);
  }
  return null;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "Unexpected admin layout error";

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "var(--c-page-bg)" }}>
      <div className="max-w-lg w-full rounded-2xl p-6" style={{ backgroundColor: "var(--c-card)", border: "1px solid var(--c-border)" }}>
        <h1 className="font-display font-bold text-lg mb-2" style={{ color: "var(--c-text)" }}>
          Admin section unavailable
        </h1>
        <p className="text-sm" style={{ color: "var(--c-text-2)" }}>
          {message}
        </p>
      </div>
    </div>
  );
}
