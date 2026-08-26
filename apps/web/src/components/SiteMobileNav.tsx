"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useIsClient, usePlayerLoggedIn } from "@/lib/player-auth";

function NavIcon({ d }: { d: string }) {
  return (
    <svg className="site-mobile-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d={d} />
    </svg>
  );
}

const ITEMS = [
  { href: "/", label: "Home", icon: "M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z", exact: true, protected: false },
  { href: "/raffles", label: "Raffles", icon: "M4 19h16M6 17V7l6-4 6 4v10M10 17v-4h4v4", exact: false, protected: false },
  { href: "/cart", label: "Cart", icon: "M6 6h15l-1.5 9h-12L6 6zM9 20a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z", exact: true, protected: false },
  { href: "/account", label: "Account", icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z", exact: false, protected: true },
];

export function SiteMobileNav() {
  const pathname = usePathname() ?? "";
  const isClient = useIsClient();
  const loggedIn = usePlayerLoggedIn();

  return (
    <nav className="site-mobile-nav site-mobile-nav--commerce" aria-label="Mobile">
      <div className="site-mobile-nav__inner">
        {ITEMS.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const href =
            item.protected && isClient && !loggedIn
              ? `/login?next=${encodeURIComponent(item.href)}`
              : item.href;

          return (
            <Link
              key={item.href}
              href={href}
              className={`site-mobile-nav__item${active ? " site-mobile-nav__item--active" : ""}`}
            >
              <NavIcon d={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
