import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation, useRouteError, isRouteErrorResponse } from "react-router";
import { isStoreOwner } from "~/lib/user-session";
import Layout from "~/components/Layout";

export default function StoreLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isStoreOwner()) {
      const next = encodeURIComponent(
        `${location.pathname}${location.search || ""}`
      );
      navigate(`/auth/store-owner?next=${next}`, { replace: true });
      return;
    }
    setReady(true);
  }, [navigate, location.pathname, location.search]);

  if (!ready) {
    return (
      <div
        className="min-h-screen flex items-center justify-center text-sm"
        style={{ backgroundColor: "var(--c-page-bg)", color: "var(--c-text-2)" }}
      >
        Checking access…
      </div>
    );
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "Unexpected store layout error";

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "var(--c-page-bg)" }}>
      <div className="max-w-lg w-full rounded-2xl p-6" style={{ backgroundColor: "var(--c-card)", border: "1px solid var(--c-border)" }}>
        <h1 className="font-display font-bold text-lg mb-2" style={{ color: "var(--c-text)" }}>
          Store section unavailable
        </h1>
        <p className="text-sm" style={{ color: "var(--c-text-2)" }}>
          {message}
        </p>
      </div>
    </div>
  );
}
