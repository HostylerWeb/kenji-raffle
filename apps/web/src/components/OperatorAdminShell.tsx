"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  getOperatorToken,
  getOperatorUser,
  clearOperatorSession,
  type OperatorStaffRole,
} from "@/lib/api";
import {
  IconDashboard,
  IconTicket,
  IconCart,
  IconCreditCard,
  IconChart,
  IconUsers,
  IconGift,
  IconWallet,
  IconTrophy,
  IconImage,
  IconShield,
  IconGlobe,
  IconSettings,
  IconTag,
  IconFolder,
  IconClipboard,
  IconExternal,
  IconMenu,
  IconLogout,
} from "@/components/admin/AdminIcons";

type Branding = {
  primary_color?: string;
  name?: string;
};

type NavItem = {
  href: string;
  label: string;
  roles: OperatorStaffRole[];
  icon: React.ReactNode;
  exact?: boolean;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        roles: ["owner", "manager", "support", "finance"],
        icon: <IconDashboard />,
        exact: true,
      },
    ],
  },
  {
    label: "Commerce",
    items: [
      { href: "/admin/raffles", label: "Raffles", roles: ["owner", "manager"], icon: <IconTicket /> },
      { href: "/admin/orders", label: "Orders", roles: ["owner", "manager", "finance"], icon: <IconCart /> },
      { href: "/admin/payments", label: "Payments", roles: ["owner", "manager", "finance"], icon: <IconCreditCard /> },
      { href: "/admin/reports", label: "Reports", roles: ["owner", "manager", "finance"], icon: <IconChart /> },
      { href: "/admin/coupons", label: "Coupons", roles: ["owner", "manager", "finance"], icon: <IconTag /> },
    ],
  },
  {
    label: "Players",
    items: [
      { href: "/admin/players", label: "Players", roles: ["owner", "manager", "support"], icon: <IconUsers /> },
      { href: "/admin/prize-claims", label: "Prize claims", roles: ["owner", "manager", "support"], icon: <IconGift /> },
      { href: "/admin/withdrawals", label: "Withdrawals", roles: ["owner", "manager", "finance"], icon: <IconWallet /> },
      { href: "/admin/winners", label: "Winners", roles: ["owner", "manager", "support"], icon: <IconTrophy /> },
    ],
  },
  {
    label: "Site",
    items: [
      { href: "/admin/categories", label: "Categories", roles: ["owner", "manager"], icon: <IconFolder /> },
      { href: "/admin/media", label: "Media", roles: ["owner", "manager"], icon: <IconImage /> },
      { href: "/admin/domains", label: "Domains", roles: ["owner", "manager"], icon: <IconGlobe /> },
    ],
  },
  {
    label: "Compliance",
    items: [
      { href: "/admin/gra-events", label: "GRA events", roles: ["owner", "manager", "support"], icon: <IconShield /> },
      { href: "/admin/audit", label: "Audit log", roles: ["owner", "manager"], icon: <IconClipboard /> },
    ],
  },
  {
    label: "Team",
    items: [
      { href: "/admin/staff", label: "Staff", roles: ["owner", "manager"], icon: <IconUsers /> },
      { href: "/admin/settings", label: "Settings", roles: ["owner", "manager"], icon: <IconSettings /> },
    ],
  },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function OperatorAdminShell({
  title,
  description,
  actions,
  branding,
  children,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  branding?: Branding;
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const accent = branding?.primary_color ?? "#00a551";
  const [user, setUser] = useState<ReturnType<typeof getOperatorUser>>(null);

  useEffect(() => {
    setUser(getOperatorUser());
  }, []);

  const role = user?.role ?? "owner";

  useEffect(() => {
    if (!getOperatorToken() && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [pathname, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    const root = document.querySelector(".admin-root") as HTMLElement | null;
    if (root) {
      root.style.setProperty("--admin-accent", accent);
      root.style.setProperty(
        "--admin-accent-soft",
        `color-mix(in srgb, ${accent} 14%, transparent)`,
      );
    }
  }, [accent]);

  function signOut() {
    clearOperatorSession();
    router.replace("/admin/login");
  }

  const visibleSections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.roles.includes(role)),
  })).filter((section) => section.items.length > 0);

  const avatarLetter = (user?.email?.[0] ?? "O").toUpperCase();

  return (
    <div className="admin-shell">
      <div
        className={`admin-sidebar-backdrop${sidebarOpen ? " admin-sidebar-backdrop--open" : ""}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside className={`admin-sidebar${sidebarOpen ? " admin-sidebar--open" : ""}`}>
        <div className="admin-sidebar__brand">
          <div className="admin-sidebar__accent-bar" />
          <div className="admin-sidebar__brand-name" style={{ marginTop: 16 }}>
            {branding?.name ?? "Operator Admin"}
          </div>
          <div className="admin-sidebar__brand-sub">Operator console</div>
        </div>

        <nav className="admin-sidebar__nav">
          {visibleSections.map((section) => (
            <div key={section.label} className="admin-sidebar__section">
              <div className="admin-sidebar__section-label">{section.label}</div>
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`admin-sidebar__link${
                    isActive(pathname, item.href, item.exact)
                      ? " admin-sidebar__link--active"
                      : ""
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          {user && (
            <div className="admin-sidebar__user">
              <div className="admin-sidebar__avatar">{avatarLetter}</div>
              <div style={{ minWidth: 0 }}>
                <div className="admin-sidebar__user-email">{user.email}</div>
                <div className="admin-sidebar__user-role">{user.role}</div>
              </div>
            </div>
          )}
          <button type="button" className="admin-btn-logout" onClick={signOut}>
            <IconLogout />
            Sign out
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              type="button"
              className="admin-topbar__menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <IconMenu />
            </button>
            <h1 className="admin-topbar__title">{title}</h1>
          </div>
          <div className="admin-topbar__actions">
            <Link href="/" className="admin-topbar__preview" target="_blank">
              <IconExternal />
              <span>Preview site</span>
            </Link>
          </div>
        </header>

        <div className="admin-page">
          {(description || actions) && (
            <div className="admin-page-lead">
              {description && <p className="admin-page__description">{description}</p>}
              {actions && <div className="admin-page__actions">{actions}</div>}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
