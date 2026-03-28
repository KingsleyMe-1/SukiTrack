import { useState } from "react";
import {
  Form,
  Link,
  useActionData,
  useNavigation,
  useSearchParams,
  redirect,
} from "react-router";
import { Shield, ArrowLeft } from "lucide-react";

export function meta() {
  return [
    { title: "Admin sign in - SukiTrack" },
    { name: "robots", content: "noindex" },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { isAdminAuthenticated } = await import("~/lib/admin-auth");
  if (await isAdminAuthenticated(request)) {
    const url = new URL(request.url);
    const next = url.searchParams.get("next") || "/admin";
    throw redirect(next);
  }
  return null;
}

export async function action({ request }: { request: Request }) {
  const { createAdminSessionRedirect, getConfiguredAdminPassword } = await import("~/lib/admin-auth");
  const formData = await request.formData();
  const password = String(formData.get("password") || "");
  const nextRaw = String(formData.get("next") || "/admin");
  const next = nextRaw.startsWith("/") ? nextRaw : "/admin";

  if (password !== getConfiguredAdminPassword()) {
    return { error: "Incorrect password." };
  }

  return createAdminSessionRedirect(request, next);
}

export default function AdminLogin() {
  const [searchParams] = useSearchParams();
  const actionData = useActionData() as { error?: string } | undefined;
  const navigation = useNavigation();
  const next = searchParams.get("next") || "/admin";
  const [password, setPassword] = useState("");
  const loading = navigation.state === "submitting";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: "var(--c-page-bg)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-7 sm:p-8 shadow-xl"
        style={{
          backgroundColor: "var(--c-card)",
          border: "1px solid var(--c-border)",
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <Shield className="w-6 h-6" style={{ color: "var(--primary-foreground)" }} />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg" style={{ color: "var(--c-text)" }}>
              Admin access
            </h1>
            <p className="text-xs" style={{ color: "var(--c-text-3)" }}>
              Server-validated session using secure HTTP-only cookies.
            </p>
          </div>
        </div>

        <Form method="post" className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--c-text-2)" }}
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
              style={{
                backgroundColor: "var(--c-input)",
                color: "var(--c-text)",
                border: "none",
              }}
              placeholder="Enter admin password"
              required
            />
          </div>

          {actionData?.error && (
            <p className="text-xs font-medium" style={{ color: "var(--c-error)" }}>
              {actionData.error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-50"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </Form>

        <Link
          to="/store"
          className="mt-6 inline-flex items-center gap-2 text-sm cursor-pointer hover:underline"
          style={{ color: "var(--c-tint)" }}
        >
          <ArrowLeft size={14} />
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
