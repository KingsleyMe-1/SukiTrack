/**
 * Temporary admin auth (localStorage). Replace with Supabase Auth + RLS later.
 */
const SESSION_KEY = "sukitrack_admin_session";

/** Fired on login/logout so UI + useIsAdmin() update in the same tab. */
export const ADMIN_SESSION_CHANGED_EVENT = "sukitrack-admin-session-changed";

function notifySessionChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ADMIN_SESSION_CHANGED_EVENT));
  }
}

export interface AdminSessionPayload {
  signedInAt: string;
}

export function getConfiguredAdminPassword(): string {
  const fromEnv = import.meta.env.VITE_ADMIN_PASSWORD;
  if (typeof fromEnv === "string" && fromEnv.length > 0) return fromEnv;
  return "changeme";
}

export function loginAdmin(password: string): boolean {
  if (typeof window === "undefined") return false;
  if (password !== getConfiguredAdminPassword()) return false;
  const payload: AdminSessionPayload = { signedInAt: new Date().toISOString() };
  localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
  notifySessionChanged();
  return true;
}

export function logoutAdmin(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  notifySessionChanged();
}

export function getAdminSession(): AdminSessionPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminSessionPayload;
  } catch {
    return null;
  }
}

export function isAdminAuthenticated(): boolean {
  return getAdminSession() !== null;
}
