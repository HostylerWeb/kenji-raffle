"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { useSiteCopyText } from "@/components/site-copy/SiteCopyEditorProvider";
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
  const title = useSiteCopyText("auth.login.title");
  const lead = useSiteCopyText("auth.login.lead");

  return (
    <AuthShell
      title={title}
      subtitle={lead}
      titleCopyKey="auth.login.title"
      subtitleCopyKey="auth.login.lead"
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
