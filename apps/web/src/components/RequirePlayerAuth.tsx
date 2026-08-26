"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useIsClient, usePlayerLoggedIn } from "@/lib/player-auth";

type RequirePlayerAuthProps = {
  children: React.ReactNode;
  /** Override redirect target (defaults to current path). */
  next?: string;
};

export function RequirePlayerAuth({ children, next }: RequirePlayerAuthProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "/account";
  const isClient = useIsClient();
  const loggedIn = usePlayerLoggedIn();
  const redirectNext = next ?? pathname;

  useEffect(() => {
    if (isClient && !loggedIn) {
      router.replace(`/login?next=${encodeURIComponent(redirectNext)}`);
    }
  }, [isClient, loggedIn, router, redirectNext]);

  if (!isClient || !loggedIn) {
    return (
      <div className="site-auth-gate" aria-live="polite" aria-busy="true">
        <div className="site-skeleton site-auth-gate__skeleton" />
      </div>
    );
  }

  return children;
}
