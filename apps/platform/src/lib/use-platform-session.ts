"use client";

import { useEffect, useState } from "react";
import { getPlatformUser, isPlatformAdmin, type PlatformUser } from "./api";

/** Client session from localStorage — safe for SSR (false until mounted). */
export function usePlatformSession() {
  const [user, setUser] = useState<PlatformUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getPlatformUser());
    setIsAdmin(isPlatformAdmin());
    setReady(true);
  }, []);

  return { user, isAdmin, ready };
}
