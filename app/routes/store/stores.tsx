import { Suspense, lazy } from "react";

const StoresRoute = lazy(() => import("../store.stores"));

export function meta() {
  return [{ title: "Browse stores - SukiTrack" }];
}

export default function StoreStoresRouteLazy() {
  return (
    <Suspense fallback={<p className="text-sm" style={{ color: "var(--c-text-3)" }}>Loading stores...</p>}>
      <StoresRoute />
    </Suspense>
  );
}
