import type { UserRole, UserSession, StoreUserAccount, CustomerAccount } from "./types";
import {
  customerOtpRequestSchema,
  customerOtpVerifySchema,
  customerAccountSchema,
  storeUserAccountSchema,
  storeOwnerSignupInputSchema,
} from "./validation";

const SESSION_KEY = "sukitrack_user_session";
const STORE_USERS_KEY = "sukitrack_store_users";
const CUSTOMER_REGISTRY_KEY = "sukitrack_customer_registry";
const CUSTOMER_OTP_KEY = "sukitrack_customer_otp";

const PASSWORD_ITERATIONS = 120000;
const OTP_EXPIRY_MS = 10 * 60 * 1000;
const OTP_ATTEMPTS = 5;

export const USER_SESSION_CHANGED_EVENT = "sukitrack-user-session-changed";

type LegacyStoreUserAccount = StoreUserAccount & { password?: string };

interface PendingCustomerOtp {
  email: string;
  mode: "signup" | "login";
  code: string;
  expiresAt: number;
  attemptsRemaining: number;
  name?: string;
}

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

function toBase64(data: ArrayBuffer | Uint8Array): string {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

async function hashPasswordWithSalt(
  password: string,
  salt: Uint8Array,
  iterations: number
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt as unknown as BufferSource,
      iterations,
      hash: "SHA-256",
    },
    key,
    256
  );
  return toBase64(bits);
}

async function createPasswordRecord(password: string): Promise<{
  passwordHash: string;
  passwordSalt: string;
  passwordIterations: number;
}> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const passwordHash = await hashPasswordWithSalt(password, salt, PASSWORD_ITERATIONS);
  return {
    passwordHash,
    passwordSalt: toBase64(salt),
    passwordIterations: PASSWORD_ITERATIONS,
  };
}

async function verifyPasswordRecord(user: StoreUserAccount, password: string): Promise<boolean> {
  const derived = await hashPasswordWithSalt(
    password,
    fromBase64(user.passwordSalt),
    user.passwordIterations
  );
  return timingSafeEqual(fromBase64(user.passwordHash), fromBase64(derived));
}

function getStoreUsers(): LegacyStoreUserAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORE_USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LegacyStoreUserAccount[];
  } catch {
    return [];
  }
}

function saveStoreUsers(users: LegacyStoreUserAccount[]): void {
  localStorage.setItem(STORE_USERS_KEY, JSON.stringify(users));
}

export function getAllStoreUsers(): Omit<StoreUserAccount, "passwordHash" | "passwordSalt" | "passwordIterations">[] {
  return getStoreUsers().map((user) => {
    const { passwordHash, passwordSalt, passwordIterations, ...rest } = user;
    return {
      ...rest,
      passwordHash,
      passwordSalt,
      passwordIterations,
    };
  });
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

function getPendingCustomerOtps(): Record<string, PendingCustomerOtp> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CUSTOMER_OTP_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, PendingCustomerOtp>;
  } catch {
    return {};
  }
}

function savePendingCustomerOtps(entries: Record<string, PendingCustomerOtp>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CUSTOMER_OTP_KEY, JSON.stringify(entries));
}

function otpKey(email: string, mode: "signup" | "login"): string {
  return `${mode}:${email.toLowerCase().trim()}`;
}

export async function signupStoreOwner(
  name: string,
  email: string,
  storeName: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  if (typeof window === "undefined") return { ok: false, error: "Not in browser" };

  const parsed = storeOwnerSignupInputSchema.safeParse({
    name,
    email,
    storeName,
    password,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const users = getStoreUsers();
  const normalizedEmail = parsed.data.email.toLowerCase().trim();
  if (users.find((u) => u.email.toLowerCase() === normalizedEmail)) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const passwordRecord = await createPasswordRecord(parsed.data.password);
  const candidate: StoreUserAccount = {
    id: `so_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    email: normalizedEmail,
    name: parsed.data.name.trim(),
    storeName: parsed.data.storeName.trim(),
    passwordHash: passwordRecord.passwordHash,
    passwordSalt: passwordRecord.passwordSalt,
    passwordIterations: passwordRecord.passwordIterations,
    createdAt: new Date().toISOString(),
  };
  const userCheck = storeUserAccountSchema.safeParse(candidate);
  if (!userCheck.success) {
    return { ok: false, error: "Could not create account." };
  }
  const newUser = userCheck.data;

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
): Promise<{ ok: boolean; error?: string }> {
  return loginStoreOwnerInternal(email, password);
}

async function loginStoreOwnerInternal(
  email: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  if (typeof window === "undefined") return { ok: false, error: "Not in browser" };
  const users = getStoreUsers();
  const normalizedEmail = email.toLowerCase().trim();
  const user = users.find(
    (u) => u.email.toLowerCase() === normalizedEmail
  );
  if (!user) return { ok: false, error: "No account found with that email." };

  let verified = false;
  if (typeof user.passwordHash === "string" && typeof user.passwordSalt === "string") {
    verified = await verifyPasswordRecord(user as StoreUserAccount, password);
  } else if (typeof user.password === "string") {
    verified = user.password === password;
    if (verified) {
      const passwordRecord = await createPasswordRecord(password);
      const migrated: StoreUserAccount = {
        id: user.id,
        email: user.email,
        name: user.name,
        storeName: user.storeName,
        passwordHash: passwordRecord.passwordHash,
        passwordSalt: passwordRecord.passwordSalt,
        passwordIterations: passwordRecord.passwordIterations,
        createdAt: user.createdAt,
      };
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx >= 0) {
        users[idx] = migrated;
        saveStoreUsers(users);
      }
    }
  }

  if (!verified) return { ok: false, error: "Incorrect password." };

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
  const request = requestCustomerOtp(email, "signup", name);
  if (!request.ok) return request;
  return { ok: false, error: "Use OTP verification to finish customer sign up." };
}

export function loginCustomer(
  email: string
): { ok: boolean; error?: string } {
  const request = requestCustomerOtp(email, "login");
  if (!request.ok) return request;
  return { ok: false, error: "Use OTP verification to finish customer sign in." };
}

export function requestCustomerOtp(
  email: string,
  mode: "signup" | "login",
  name?: string
): { ok: boolean; error?: string; debugCode?: string } {
  if (typeof window === "undefined") return { ok: false, error: "Not in browser" };

  const parsed = customerOtpRequestSchema.safeParse({ email, name, mode });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const normalizedEmail = parsed.data.email.toLowerCase().trim();
  const registry = getCustomerRegistry();
  const existing = registry.find((c) => c.email === normalizedEmail);
  if (mode === "signup" && existing) {
    return { ok: false, error: "This email is already registered. Please sign in instead." };
  }
  if (mode === "login" && !existing) {
    return { ok: false, error: "No account found with this email. Please sign up first." };
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const pending = getPendingCustomerOtps();
  pending[otpKey(normalizedEmail, mode)] = {
    email: normalizedEmail,
    mode,
    code,
    attemptsRemaining: OTP_ATTEMPTS,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    name: parsed.data.name?.trim(),
  };
  savePendingCustomerOtps(pending);
  return { ok: true, debugCode: code };
}

export function verifyCustomerOtp(
  email: string,
  code: string,
  mode: "signup" | "login",
  name?: string
): { ok: boolean; error?: string } {
  if (typeof window === "undefined") return { ok: false, error: "Not in browser" };

  const parsed = customerOtpVerifySchema.safeParse({ email, code, mode, name });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid OTP payload." };
  }

  const normalizedEmail = parsed.data.email.toLowerCase().trim();
  const key = otpKey(normalizedEmail, mode);
  const pending = getPendingCustomerOtps();
  const attempt = pending[key];

  if (!attempt) {
    return { ok: false, error: "OTP not found. Request a new code." };
  }
  if (attempt.expiresAt < Date.now()) {
    delete pending[key];
    savePendingCustomerOtps(pending);
    return { ok: false, error: "OTP expired. Request a new code." };
  }
  if (attempt.code !== parsed.data.code) {
    attempt.attemptsRemaining -= 1;
    if (attempt.attemptsRemaining <= 0) {
      delete pending[key];
      savePendingCustomerOtps(pending);
      return { ok: false, error: "Too many failed attempts. Request a new code." };
    }
    pending[key] = attempt;
    savePendingCustomerOtps(pending);
    return {
      ok: false,
      error: `Incorrect code. ${attempt.attemptsRemaining} attempt(s) left.`,
    };
  }

  delete pending[key];
  savePendingCustomerOtps(pending);

  const registry = getCustomerRegistry();
  const existing = registry.find((c) => c.email === normalizedEmail);

  if (mode === "signup") {
    if (existing) {
      return { ok: false, error: "This email is already registered. Please sign in instead." };
    }
    const candidate: CustomerAccount = {
      id: `cust_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      email: normalizedEmail,
      name: (parsed.data.name ?? attempt.name ?? "Customer").trim(),
      createdAt: new Date().toISOString(),
    };
    const accountCheck = customerAccountSchema.safeParse(candidate);
    if (!accountCheck.success) {
      return { ok: false, error: accountCheck.error.issues[0]?.message ?? "Invalid account." };
    }
    const newCustomer = accountCheck.data;
    saveCustomerRegistry([...registry, newCustomer]);
    setUserSession({
      role: "customer",
      id: newCustomer.id,
      name: newCustomer.name,
      email: newCustomer.email,
      signedInAt: new Date().toISOString(),
    });
    return { ok: true };
  }

  if (!existing) {
    return { ok: false, error: "No account found with this email. Please sign up first." };
  }
  setUserSession({
    role: "customer",
    id: existing.id,
    name: existing.name,
    email: existing.email,
    signedInAt: new Date().toISOString(),
  });
  return { ok: true };
}
