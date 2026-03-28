import type { UserRole, UserSession, StoreUserAccount, CustomerAccount } from "./types";

const SESSION_KEY = "sukitrack_user_session";
const STORE_USERS_KEY = "sukitrack_store_users";
const CUSTOMER_REGISTRY_KEY = "sukitrack_customer_registry";

export const USER_SESSION_CHANGED_EVENT = "sukitrack-user-session-changed";

function notify(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(USER_SESSION_CHANGED_EVENT));
  }
}

export function setUserSession(session: UserSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  notify();
}

export function getUserSession(): UserSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserSession;
  } catch {
    return null;
  }
}

export function getUserRole(): UserRole | null {
  return getUserSession()?.role ?? null;
}

export function isCustomer(): boolean {
  return getUserRole() === "customer";
}

export function isStoreOwner(): boolean {
  return getUserRole() === "store_owner";
}

export function logoutUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  notify();
}

function getStoreUsers(): StoreUserAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORE_USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoreUserAccount[];
  } catch {
    return [];
  }
}

function saveStoreUsers(users: StoreUserAccount[]): void {
  localStorage.setItem(STORE_USERS_KEY, JSON.stringify(users));
}

export function getAllStoreUsers(): Omit<StoreUserAccount, "password">[] {
  return getStoreUsers().map(({ password: _p, ...rest }) => rest);
}

function getCustomerRegistry(): CustomerAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOMER_REGISTRY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CustomerAccount[];
  } catch {
    return [];
  }
}

function saveCustomerRegistry(customers: CustomerAccount[]): void {
  localStorage.setItem(CUSTOMER_REGISTRY_KEY, JSON.stringify(customers));
}

export function signupStoreOwner(
  name: string,
  email: string,
  storeName: string,
  password: string
): { ok: boolean; error?: string } {
  if (typeof window === "undefined") return { ok: false, error: "Not in browser" };
  const users = getStoreUsers();
  if (users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim())) {
    return { ok: false, error: "An account with this email already exists." };
  }
  const newUser: StoreUserAccount = {
    id: `so_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    email: email.toLowerCase().trim(),
    name: name.trim(),
    storeName: storeName.trim(),
    password,
    createdAt: new Date().toISOString(),
  };
  saveStoreUsers([...users, newUser]);
  const session: UserSession = {
    role: "store_owner",
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    storeName: newUser.storeName,
    signedInAt: new Date().toISOString(),
  };
  setUserSession(session);
  return { ok: true };
}

export function loginStoreOwner(
  email: string,
  password: string
): { ok: boolean; error?: string } {
  if (typeof window === "undefined") return { ok: false, error: "Not in browser" };
  const users = getStoreUsers();
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase().trim()
  );
  if (!user) return { ok: false, error: "No account found with that email." };
  if (user.password !== password) return { ok: false, error: "Incorrect password." };
  const session: UserSession = {
    role: "store_owner",
    id: user.id,
    name: user.name,
    email: user.email,
    storeName: user.storeName,
    signedInAt: new Date().toISOString(),
  };
  setUserSession(session);
  return { ok: true };
}

export function signupCustomer(
  name: string,
  email: string
): { ok: boolean; error?: string } {
  if (typeof window === "undefined") return { ok: false, error: "Not in browser" };
  const registry = getCustomerRegistry();
  const normalizedEmail = email.toLowerCase().trim();
  const existing = registry.find((c) => c.email === normalizedEmail);
  if (existing) {
    // Email already registered — auto-login instead
    const session: UserSession = {
      role: "customer",
      id: existing.id,
      name: existing.name,
      email: existing.email,
      signedInAt: new Date().toISOString(),
    };
    setUserSession(session);
    return { ok: true };
  }
  const newCustomer: CustomerAccount = {
    id: `cust_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    email: normalizedEmail,
    name: name.trim(),
    createdAt: new Date().toISOString(),
  };
  saveCustomerRegistry([...registry, newCustomer]);
  const session: UserSession = {
    role: "customer",
    id: newCustomer.id,
    name: newCustomer.name,
    email: newCustomer.email,
    signedInAt: new Date().toISOString(),
  };
  setUserSession(session);
  return { ok: true };
}

export function loginCustomer(
  email: string
): { ok: boolean; error?: string } {
  if (typeof window === "undefined") return { ok: false, error: "Not in browser" };
  const registry = getCustomerRegistry();
  const customer = registry.find(
    (c) => c.email === email.toLowerCase().trim()
  );
  if (!customer) {
    return {
      ok: false,
      error: "No account found with this email. Please sign up first.",
    };
  }
  const session: UserSession = {
    role: "customer",
    id: customer.id,
    name: customer.name,
    email: customer.email,
    signedInAt: new Date().toISOString(),
  };
  setUserSession(session);
  return { ok: true };
}
