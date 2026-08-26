import Link from "next/link";
import { headers } from "next/headers";
import { ContactForm } from "@/components/ContactForm";
import { SitePageIntro } from "@/components/SitePageIntro";
import { getRequestHost, getTenantContext } from "@/lib/tenant";

export default async function ContactPage() {
  const headerStore = await headers();
  const host = getRequestHost(headerStore);
  const tenant = await getTenantContext(host);
  const supportEmail = tenant?.branding?.support_email ?? null;

  return (
    <>
      <SitePageIntro
        breadcrumb="← Home"
        title="Contact us"
        lead="Have a question? Send us a message and we'll get back to you."
      />
      <ContactForm supportEmail={supportEmail} />
    </>
  );
}
