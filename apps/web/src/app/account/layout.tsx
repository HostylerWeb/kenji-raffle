"use client";

import { usePathname } from "next/navigation";
import { AccountShell } from "@/components/AccountShell";
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";
import { RequirePlayerAuth } from "@/components/RequirePlayerAuth";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "/account";

  return (
    <RequirePlayerAuth next={pathname}>
      <AccountShell>
        <EmailVerificationBanner />
        {children}
      </AccountShell>
    </RequirePlayerAuth>
  );
}
