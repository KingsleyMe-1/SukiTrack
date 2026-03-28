import { Suspense, lazy } from "react";

const AdminData = lazy(() => import("../admin.data"));

export function meta() {
  return [
    { title: "Admin data - SukiTrack" },
    { name: "robots", content: "noindex" },
  ];
}

export default function AdminDataRouteLazy() {
  return (
    <Suspense fallback={<p className="text-sm" style={{ color: "var(--c-text-3)" }}>Loading import/export tools...</p>}>
      <AdminData />
    </Suspense>
  );
}
