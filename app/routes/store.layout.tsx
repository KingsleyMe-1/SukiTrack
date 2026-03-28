import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
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
