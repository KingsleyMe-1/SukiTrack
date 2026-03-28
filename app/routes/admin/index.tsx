import { Suspense, lazy } from "react";

const AdminOverview = lazy(() => import("../admin._index"));

export function meta() {
  return [
    { title: "Admin overview - SukiTrack" },
    { name: "robots", content: "noindex" },
  ];
}

export default function AdminOverviewRouteLazy() {
  return (
    <Suspense fallback={<p className="text-sm" style={{ color: "var(--c-text-3)" }}>Loading admin overview...</p>}>
      <AdminOverview />
    </Suspense>
  );
}
