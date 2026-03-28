import { Suspense, lazy } from "react";

const AdminBulk = lazy(() => import("../admin.bulk"));

export function meta() {
  return [
    { title: "Admin bulk actions - SukiTrack" },
    { name: "robots", content: "noindex" },
  ];
}

export default function AdminBulkRouteLazy() {
  return (
    <Suspense fallback={<p className="text-sm" style={{ color: "var(--c-text-3)" }}>Loading bulk tools...</p>}>
      <AdminBulk />
    </Suspense>
  );
}
