"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { PlayerLoginForm } from "@/components/PlayerLoginForm";

export default function LoginClient({
  logoUrl,
  tenantName,
}: {
  logoUrl?: string | null;
  tenantName?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/";

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your player account."
      logoUrl={logoUrl}
      tenantName={tenantName}
    >
      <PlayerLoginForm
        next={next}
        onAuthenticated={() => router.push(next)}
      />
    </AuthShell>
  );
}
