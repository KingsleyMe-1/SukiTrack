import { Suspense, lazy } from "react";

const AdminAudit = lazy(() => import("../admin.audit"));

export function meta() {
  return [
    { title: "Admin audit log - SukiTrack" },
    { name: "robots", content: "noindex" },
  ];
}

export default function AdminAuditRouteLazy() {
  return (
    <Suspense fallback={<p className="text-sm" style={{ color: "var(--c-text-3)" }}>Loading audit log...</p>}>
      <AdminAudit />
    </Suspense>
  );
}
