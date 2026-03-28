import { useSyncExternalStore } from "react";
import {
  isAdminAuthenticated,
  ADMIN_SESSION_CHANGED_EVENT,
} from "./admin-session";

function subscribe(onChange: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === "sukitrack_admin_session") onChange();
  };
  const onCustom = () => onChange();
  if (typeof window === "undefined") {
    return () => {};
  }
  window.addEventListener("storage", onStorage);
  window.addEventListener(ADMIN_SESSION_CHANGED_EVENT, onCustom);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(ADMIN_SESSION_CHANGED_EVENT, onCustom);
  };
}

function getSnapshot(): boolean {
  return isAdminAuthenticated();
}

function getServerSnapshot(): boolean {
  return false;
}

/** True when the user has signed in on the admin flow (local session). */
export function useIsAdmin(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
