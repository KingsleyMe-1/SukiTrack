import { Suspense, lazy } from "react";

const TrendsRoute = lazy(() => import("../trends"));

export function meta() {
  return [
    { title: "Pricing trends - SukiTrack" },
    { name: "description", content: "Price trends and demand insights" },
  ];
}

export default function StoreTrendsRouteLazy() {
  return (
    <Suspense fallback={<p className="text-sm" style={{ color: "var(--c-text-3)" }}>Loading trends...</p>}>
      <TrendsRoute />
    </Suspense>
  );
}
