"use client";

import { useSyncExternalStore } from "react";
import { getPlayerToken } from "./player-api";

export const PLAYER_AUTH_CHANGED_EVENT = "player-auth-changed";

export function notifyPlayerAuthChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PLAYER_AUTH_CHANGED_EVENT));
  }
}

function subscribeAuth(callback: () => void) {
  window.addEventListener(PLAYER_AUTH_CHANGED_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(PLAYER_AUTH_CHANGED_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function readLoggedIn() {
  return Boolean(getPlayerToken());
}

/** True once the client bundle has mounted (avoids SSR/client auth button flash). */
export function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function usePlayerLoggedIn() {
  return useSyncExternalStore(subscribeAuth, readLoggedIn, () => false);
}
