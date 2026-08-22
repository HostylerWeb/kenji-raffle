"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  getOperatorToken,
  getOperatorUser,
  clearOperatorSession,
} from "@/lib/api";
import {
  ADMIN_NAV_SECTIONS,
  adminSectionEyebrow,
  isAdminNavActive,
} from "@/components/admin/adminNavigation";
import { IconExternal, IconLogout, IconMenu } from "@/components/admin/AdminIcons";

type Branding = {
  primary_color?: string;
  name?: string;
};

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

  const visibleSections = ADMIN_NAV_SECTIONS.map((section) => ({
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
          <div className="admin-sidebar__accent-bar" style={{ background: accent }} />
          <div className="admin-sidebar__brand-name">
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
                    isAdminNavActive(pathname, item.href, item.exact)
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
            <span className="admin-topbar__title">Operator console</span>
          </div>
          <div className="admin-topbar__actions">
            <Link href="/" className="admin-topbar__preview" target="_blank">
              <IconExternal />
              <span>Preview site</span>
            </Link>
          </div>
        </header>

        <div className="admin-page">
          <header className="admin-page-header">
            <div className="admin-page-header__row">
              <div>
                <p className="admin-page-header__eyebrow">{adminSectionEyebrow(pathname)}</p>
                <h1 className="admin-page-header__title">{title}</h1>
                {description && (
                  <p className="admin-page-header__description">{description}</p>
                )}
              </div>
              {actions && <div className="admin-page__actions">{actions}</div>}
            </div>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
