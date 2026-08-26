import type { ReactNode } from "react";

export type PlatformNavItem = {
  href: string;
  label: string;
  adminOnly: boolean;
  icon: ReactNode;
};

function Icon({ d }: { d: string }) {
  return (
    <svg
      className="nav-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}

export const PLATFORM_NAV: PlatformNavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    adminOnly: false,
    icon: (
      <Icon d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z" />
    ),
  },
  {
    href: "/operators",
    label: "Operators",
    adminOnly: false,
    icon: (
      <Icon d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
    ),
  },
  {
    href: "/reports",
    label: "Reports",
    adminOnly: false,
    icon: <Icon d="M4 19h16M6 17V9m4 8V5m4 12v-4m4 4V7" />,
  },
  {
    href: "/platform-users",
    label: "Platform users",
    adminOnly: true,
    icon: (
      <Icon d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8m13 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    adminOnly: false,
    icon: (
      <Icon d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM19.4 15a1.7 1.7 0 00.34 1.87l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.7 1.7 0 00-1.87-.34 1.7 1.7 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.7 1.7 0 00-1-1.51 1.7 1.7 0 00-1.87.34l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.7 1.7 0 004.6 15a1.7 1.7 0 00-1.51-1H3a2 2 0 010-4h.09a1.7 1.7 0 001.51-1 1.7 1.7 0 00-.34-1.87l-.06-.06a2 2 0 012.83-2.83l.06.06A1.7 1.7 0 009 4.6a1.7 1.7 0 001-1.51V3a2 2 0 014 0v.09a1.7 1.7 0 001 1.51 1.7 1.7 0 001.87-.34l.06-.06a2 2 0 012.83 2.83l-.06.06A1.7 1.7 0 0019.4 9a1.7 1.7 0 001.51 1H21a2 2 0 010 4h-.09a1.7 1.7 0 00-1.51 1z" />
    ),
  },
  {
    href: "/audit",
    label: "Audit log",
    adminOnly: false,
    icon: (
      <Icon d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6M16 13H8M16 17H8M10 9H8" />
    ),
  },
  {
    href: "/system",
    label: "System",
    adminOnly: false,
    icon: <Icon d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />,
  },
];
