"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { useSiteCopyText } from "@/components/site-copy/SiteCopyEditorProvider";
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
  const title = useSiteCopyText("auth.register.title");
  const lead = useSiteCopyText("auth.register.lead");

  return (
    <AuthShell
      title={title}
      subtitle={lead}
      titleCopyKey="auth.register.title"
      subtitleCopyKey="auth.register.lead"
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
