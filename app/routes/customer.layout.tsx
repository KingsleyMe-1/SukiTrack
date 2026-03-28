import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation, useRouteError, isRouteErrorResponse } from "react-router";
import CustomerLayout from "~/components/CustomerLayout";
import { isCustomer } from "~/lib/user-session";

export default function CustomerLayoutRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isCustomer()) {
      const next = encodeURIComponent(location.pathname + location.search);
      navigate(`/auth/customer?next=${next}`, { replace: true });
    } else {
      setReady(true);
    }
  }, [navigate, location.pathname, location.search]);

  if (!ready) return null;

  return (
    <CustomerLayout>
      <Outlet />
    </CustomerLayout>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "Unexpected customer layout error";

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "var(--c-page-bg)" }}>
      <div className="max-w-lg w-full rounded-2xl p-6" style={{ backgroundColor: "var(--c-card)", border: "1px solid var(--c-border)" }}>
        <h1 className="font-display font-bold text-lg mb-2" style={{ color: "var(--c-text)" }}>
          Customer section unavailable
        </h1>
        <p className="text-sm" style={{ color: "var(--c-text-2)" }}>
          {message}
        </p>
      </div>
    </div>
  );
}
