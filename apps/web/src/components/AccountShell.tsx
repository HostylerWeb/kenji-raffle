"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutPlayer } from "@/lib/player-api";

const LINKS = [
  { href: "/account", label: "Overview", exact: true },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/tickets", label: "My tickets" },
  { href: "/account/wins", label: "Wins" },
  { href: "/account/claims", label: "Prize claims" },
  { href: "/account/site-credit", label: "Site credit" },
  { href: "/account/settings", label: "Settings" },
  { href: "/account/play-safe", label: "Play Safe" },
];

export function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";

  return (
    <div className="site-account-layout">
      <nav className="site-account-nav" aria-label="Account">
        {LINKS.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`site-account-nav__link${active ? " site-account-nav__link--active" : ""}`}
            >
              {link.label}
            </Link>
          );
        })}
        <button type="button" className="site-account-nav__signout" onClick={() => signOutPlayer()}>
          Sign out
        </button>
      </nav>
      <div>{children}</div>
    </div>
  );
}
