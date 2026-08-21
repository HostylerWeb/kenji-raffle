import { platformPrisma } from "@kenji-raffle/database-platform";
import { createTenantPrismaClient } from "@kenji-raffle/database-tenant";
import { decryptSecret, requireEnv } from "@kenji-raffle/shared";
import { sendMail } from "./mailer";

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  return `${local.slice(0, 2)}***@${domain}`;
}

export async function sendWinnerEmailsForRaffle(
  operatorId: string,
  raffleId: string,
) {
  const operator = await platformPrisma.operators.findUnique({
    where: { id: operatorId },
    include: {
      settings: true,
      domains: { where: { is_primary: true }, take: 1 },
    },
  });
  if (!operator) return { sent: 0 };

  const db = await platformPrisma.tenant_databases.findUnique({
    where: { operator_id: operatorId },
  });
  if (!db || db.status !== "active") return { sent: 0 };

  const encryptionKey = requireEnv("CREDENTIALS_ENCRYPTION_KEY");
  const url = decryptSecret(db.connection_url_encrypted, encryptionKey);
  const client = createTenantPrismaClient(url);

  try {
    const raffle = await client.raffles.findUnique({
      where: { id: raffleId },
      select: { title: true },
    });
    if (!raffle) return { sent: 0 };

    const winners = await client.winners.findMany({
      where: { raffle_id: raffleId },
      include: {
        user: { select: { email: true } },
        ticket: { select: { ticket_number: true } },
        prize: { select: { name: true } },
      },
    });

    const hostname =
      operator.domains[0]?.hostname ?? `${operator.slug}.kenji-raffle.local`;
    const proto = process.env.PUBLIC_WEB_PROTOCOL ?? "http";
    const port = process.env.WEB_PORT ?? "3002";
    const siteUrl = `${proto}://${hostname}:${port}`;
    const fromEmail = operator.settings?.support_email ?? undefined;

    let sent = 0;
    for (const w of winners) {
      const prizeName = w.prize?.name ?? "Main prize";
      const ok = await sendMail({
        to: w.user.email,
        from: fromEmail,
        subject: `You won! — ${operator.name}`,
        text: `Congratulations! You won ${prizeName} in ${raffle.title} (ticket #${w.ticket.ticket_number}). Log in to claim: ${siteUrl}/account`,
        html: `<p>Congratulations!</p><p>You won <strong>${prizeName}</strong> in <strong>${raffle.title}</strong> (ticket #${w.ticket.ticket_number}).</p><p><a href="${siteUrl}/account">View your account</a></p>`,
      });
      if (ok) sent += 1;
      console.log(
        `Winner email → ${maskEmail(w.user.email)} raffle=${raffleId} sent=${ok}`,
      );
    }

    return { sent, total: winners.length };
  } finally {
    await client.$disconnect();
  }
}

export async function processSendEmailJob(data: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  from?: string;
}) {
  const sent = await sendMail({
    to: data.to,
    subject: data.subject,
    text: data.text,
    html: data.html,
    from: data.from,
  });
  return { sent };
}
