"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { PlayerRegisterForm } from "@/components/PlayerRegisterForm";

export default function RegisterClient({
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
      title="Create your account"
      subtitle="You must be 18 or older to register and play."
      logoUrl={logoUrl}
      tenantName={tenantName}
    >
      <PlayerRegisterForm
        next={next}
        onAuthenticated={() => router.push(next)}
      />
    </AuthShell>
  );
}
