import { Suspense } from "react";
import { headers } from "next/headers";
import { getRequestHost, getTenantContext } from "@/lib/tenant";
import LoginClient from "./LoginClient";

export default async function LoginPage() {
  const headerStore = await headers();
  const host = getRequestHost(headerStore);
  const tenant = await getTenantContext(host);

  return (
    <Suspense fallback={<main style={{ padding: 40 }}>Loading…</main>}>
      <LoginClient
        logoUrl={tenant?.branding?.logo_url}
        tenantName={tenant?.name}
      />
    </Suspense>
  );
}
