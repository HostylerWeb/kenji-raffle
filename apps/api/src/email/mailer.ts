import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

export type MailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  from?: string;
};

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST;
  if (!host) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_PORT === "465",
      auth:
        process.env.SMTP_USER
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS ?? "",
            }
          : undefined,
    });
  }
  return transporter;
}

export async function sendMail(payload: MailPayload): Promise<boolean> {
  const transport = getTransporter();
  const from =
    payload.from ??
    process.env.SMTP_FROM ??
    process.env.SMTP_USER ??
    "noreply@kenji-raffle.local";

  if (!transport) {
    console.log(
      `[email-stub] to=${payload.to} subject=${payload.subject} ${payload.text.slice(0, 120)}`,
    );
    return false;
  }

  await transport.sendMail({
    from,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html ?? payload.text,
  });
  return true;
}
