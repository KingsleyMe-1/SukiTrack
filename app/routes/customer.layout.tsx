import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
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
