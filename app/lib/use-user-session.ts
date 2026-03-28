import { useSyncExternalStore } from "react";
import { USER_SESSION_CHANGED_EVENT } from "./user-session";
import type { UserSession } from "./types";

const SESSION_KEY = "sukitrack_user_session";
let cachedRaw: string | null = undefined as unknown as string | null;
let cachedSession: UserSession | null = null;

function readSession(): UserSession | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (raw === cachedRaw) return cachedSession;
  cachedRaw = raw;
  try {
    cachedSession = raw ? (JSON.parse(raw) as UserSession) : null;
  } catch {
    cachedSession = null;
  }
  return cachedSession;
}

function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === SESSION_KEY) onChange();
  };
  const onCustom = () => onChange();
  window.addEventListener("storage", onStorage);
  window.addEventListener(USER_SESSION_CHANGED_EVENT, onCustom);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(USER_SESSION_CHANGED_EVENT, onCustom);
  };
}

function getSnapshot(): UserSession | null {
  return readSession();
}

function getServerSnapshot(): UserSession | null {
  return null;
}

/** Returns the active user session (customer or store_owner), or null if not signed in. */
export function useUserSession(): UserSession | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
