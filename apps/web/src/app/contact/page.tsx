import Link from "next/link";
import { headers } from "next/headers";
import { ContactForm } from "@/components/ContactForm";
import { getRequestHost, getTenantContext } from "@/lib/tenant";

export default async function ContactPage() {
  const headerStore = await headers();
  const host = getRequestHost(headerStore);
  const tenant = await getTenantContext(host);
  const supportEmail = tenant?.branding?.support_email ?? null;

  return (
    <>
      <Link href="/" className="site-breadcrumb">← Home</Link>
      <h1 className="site-page-title">Contact us</h1>
      <p className="site-lead" style={{ marginBottom: 24 }}>
        Have a question? Send us a message and we&apos;ll get back to you.
      </p>
      <ContactForm supportEmail={supportEmail} />
    </>
  );
}
