import type { ReactNode } from "react";
import type { OperatorStaffRole } from "@/lib/api";
import {
  IconCart,
  IconChart,
  IconClipboard,
  IconCreditCard,
  IconDashboard,
  IconFolder,
  IconGift,
  IconGlobe,
  IconImage,
  IconSettings,
  IconShield,
  IconTag,
  IconTicket,
  IconTrophy,
  IconUsers,
  IconWallet,
} from "@/components/admin/AdminIcons";

export type AdminNavItem = {
  href: string;
  label: string;
  roles: OperatorStaffRole[];
  icon: ReactNode;
  exact?: boolean;
};

export type AdminNavSection = {
  label: string;
  items: AdminNavItem[];
};

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
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
      {
        href: "/admin/onboarding",
        label: "GRA onboarding",
        roles: ["owner", "manager"],
        icon: <IconClipboard />,
      },
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

export function adminSectionEyebrow(pathname: string): string {
  if (pathname.startsWith("/admin/raffles")) return "Commerce";
  if (
    pathname.startsWith("/admin/orders") ||
    pathname.startsWith("/admin/payments") ||
    pathname.startsWith("/admin/reports") ||
    pathname.startsWith("/admin/coupons")
  ) {
    return "Commerce";
  }
  if (
    pathname.startsWith("/admin/players") ||
    pathname.startsWith("/admin/prize-claims") ||
    pathname.startsWith("/admin/withdrawals") ||
    pathname.startsWith("/admin/winners")
  ) {
    return "Players";
  }
  if (
    pathname.startsWith("/admin/categories") ||
    pathname.startsWith("/admin/media") ||
    pathname.startsWith("/admin/domains")
  ) {
    return "Site";
  }
  if (pathname.startsWith("/admin/onboarding")) {
    return "Compliance";
  }
  if (pathname.startsWith("/admin/gra-events") || pathname.startsWith("/admin/audit")) {
    return "Compliance";
  }
  if (pathname.startsWith("/admin/staff") || pathname.startsWith("/admin/settings")) {
    return "Team";
  }
  return "Overview";
}

export function isAdminNavActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
