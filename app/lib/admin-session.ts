/**
 * Legacy client-only admin session module.
 * Admin auth now runs on the server using httpOnly cookies in admin-auth.ts.
 */
export const ADMIN_SESSION_CHANGED_EVENT = "sukitrack-admin-session-changed";

export interface AdminSessionPayload {
  signedInAt: string;
}

export function getConfiguredAdminPassword(): string {
  return "";
}

export function loginAdmin(_password: string): boolean {
  return false;
}

export function logoutAdmin(): void {
  // no-op
}

export function getAdminSession(): AdminSessionPayload | null {
  return null;
}

export function isAdminAuthenticated(): boolean {
  return false;
}
