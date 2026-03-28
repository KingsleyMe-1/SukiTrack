import { createCookieSessionStorage, redirect } from "react-router";

const ADMIN_SESSION_COOKIE = "__sukitrack_admin";
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "dev-admin-session-secret-change-me";
const EIGHT_HOURS = 60 * 60 * 8;

const adminSessionStorage = createCookieSessionStorage({
  cookie: {
    name: ADMIN_SESSION_COOKIE,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: EIGHT_HOURS,
    secrets: [ADMIN_SESSION_SECRET],
  },
});

export function getConfiguredAdminPassword(): string {
  const fromEnv = process.env.ADMIN_PASSWORD;
  if (typeof fromEnv === "string" && fromEnv.length > 0) return fromEnv;
  return "changeme";
}

export async function isAdminAuthenticated(request: Request): Promise<boolean> {
  const session = await adminSessionStorage.getSession(request.headers.get("Cookie"));
  return session.get("authenticated") === true;
}

export async function requireAdmin(request: Request): Promise<void> {
  const ok = await isAdminAuthenticated(request);
  if (ok) return;
  const url = new URL(request.url);
  const next = encodeURIComponent(`${url.pathname}${url.search || ""}`);
  throw redirect(`/admin/login?next=${next}`);
}

export async function createAdminSessionRedirect(
  request: Request,
  nextPath: string
): Promise<Response> {
  const session = await adminSessionStorage.getSession(request.headers.get("Cookie"));
  session.set("authenticated", true);
  session.set("signedInAt", new Date().toISOString());
  return redirect(nextPath, {
    headers: {
      "Set-Cookie": await adminSessionStorage.commitSession(session),
    },
  });
}

export async function destroyAdminSessionRedirect(request: Request): Promise<Response> {
  const session = await adminSessionStorage.getSession(request.headers.get("Cookie"));
  return redirect("/admin/login", {
    headers: {
      "Set-Cookie": await adminSessionStorage.destroySession(session),
    },
  });
}
