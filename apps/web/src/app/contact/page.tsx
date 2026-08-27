import Link from "next/link";
import { headers } from "next/headers";
import { ContactForm } from "@/components/ContactForm";
import { SitePageIntro } from "@/components/SitePageIntro";
import { getSiteCopy } from "@/lib/site-copy";
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
        title={tenant ? getSiteCopy(tenant, "contact.page.title") : "Contact us"}
        lead={tenant ? getSiteCopy(tenant, "contact.page.lead") : undefined}
        titleCopyKey="contact.page.title"
        leadCopyKey="contact.page.lead"
      />
      <ContactForm supportEmail={supportEmail} />
    </>
  );
}
