import { Suspense, lazy } from "react";

const AdminSettings = lazy(() => import("../admin.settings"));

export function meta() {
  return [
    { title: "Admin settings - SukiTrack" },
    { name: "robots", content: "noindex" },
  ];
}

export default function AdminSettingsRouteLazy() {
  return (
    <Suspense fallback={<p className="text-sm" style={{ color: "var(--c-text-3)" }}>Loading settings...</p>}>
      <AdminSettings />
    </Suspense>
  );
}
