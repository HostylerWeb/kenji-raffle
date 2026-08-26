"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useIsClient, usePlayerLoggedIn } from "@/lib/player-auth";

type ProtectedAccountLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
};

/** Sends guests to login with return URL instead of flashing protected account UI. */
export function ProtectedAccountLink({
  href,
  children,
  ...props
}: ProtectedAccountLinkProps) {
  const isClient = useIsClient();
  const loggedIn = usePlayerLoggedIn();
  const destination =
    isClient && !loggedIn ? `/login?next=${encodeURIComponent(href)}` : href;

  return (
    <Link href={destination} {...props}>
      {children}
    </Link>
  );
}
