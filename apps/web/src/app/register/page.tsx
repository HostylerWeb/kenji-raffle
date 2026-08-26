import { Suspense } from "react";
import { headers } from "next/headers";
import { getRequestHost, getTenantContext } from "@/lib/tenant";
import RegisterClient from "./RegisterClient";

export default async function RegisterPage() {
  const headerStore = await headers();
  const host = getRequestHost(headerStore);
  const tenant = await getTenantContext(host);

  return (
    <Suspense fallback={<main style={{ padding: 40 }}>Loading…</main>}>
      <RegisterClient
        logoUrl={tenant?.branding?.logo_url}
        tenantName={tenant?.name}
      />
    </Suspense>
  );
}
