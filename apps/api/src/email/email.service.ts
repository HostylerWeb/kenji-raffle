import { Injectable, Logger } from "@nestjs/common";
import type { TenantContext } from "@kenji-raffle/shared";
import { sendMail, type MailPayload } from "./mailer";
import { orderConfirmationText } from "./templates/order-confirmation";
import { PlatformQueueService } from "../platform/platform-queue.service";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly queue: PlatformQueueService) {}

  private async dispatch(payload: MailPayload): Promise<boolean> {
    if (process.env.EMAIL_ASYNC === "true") {
      await this.queue.enqueueSendEmail({
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
        from: payload.from,
      });
      return true;
    }
    return sendMail(payload);
  }

  private siteUrl(tenant: TenantContext): string {
    const proto = process.env.PUBLIC_WEB_PROTOCOL ?? "http";
    const port = process.env.WEB_PORT ?? "3002";
    const host = tenant.hostname.includes(":")
      ? tenant.hostname
      : `${tenant.hostname}:${port}`;
    return `${proto}://${host}`;
  }

  async sendVerifyEmail(
    tenant: TenantContext,
    email: string,
    token: string,
    fromEmail?: string | null,
  ) {
    const link = `${this.siteUrl(tenant)}/verify-email?token=${encodeURIComponent(token)}`;
    const sent = await this.dispatch({
      to: email,
      from: fromEmail ?? undefined,
      subject: `Verify your email — ${tenant.name}`,
      text: `Welcome to ${tenant.name}. Verify your email: ${link}`,
      html: `<p>Welcome to <strong>${tenant.name}</strong>.</p><p><a href="${link}">Verify your email</a></p>`,
    });
    this.logger.log(`verify email → ${email} (${tenant.slug}) sent=${sent}`);
    return { queued: true, sent };
  }

  async sendPasswordReset(
    tenant: TenantContext,
    email: string,
    token: string,
    audience: "player" | "operator",
    fromEmail?: string | null,
  ) {
    const path =
      audience === "operator" ? "/admin/reset-password" : "/reset-password";
    const link = `${this.siteUrl(tenant)}${path}?token=${encodeURIComponent(token)}`;
    const sent = await this.dispatch({
      to: email,
      from: fromEmail ?? undefined,
      subject: `Reset your password — ${tenant.name}`,
      text: `Reset your password: ${link} (expires in 24 hours)`,
      html: `<p><a href="${link}">Reset your password</a> (expires in 24 hours)</p>`,
    });
    return { queued: true, sent };
  }

  async sendOrderConfirmation(
    tenant: TenantContext,
    email: string,
    confirmation: {
      order_id: string;
      total: number;
      tickets: { ticket_number: number; raffle_title: string }[];
      instant_wins?: { name: string; prize_type: string; prize_value: number }[];
    },
    fromEmail?: string | null,
  ) {
    const ticketLines = confirmation.tickets
      .map((t) => `${t.raffle_title} — #${t.ticket_number}`)
      .join("\n");
    const winLines =
      confirmation.instant_wins?.length
        ? `\nInstant wins:\n${confirmation.instant_wins
            .map((w) => `${w.name} (${w.prize_type}) KES ${w.prize_value}`)
            .join("\n")}`
        : "";
    const templated = orderConfirmationText({
      orderId: confirmation.order_id,
      total: confirmation.total,
      tickets: ticketLines,
      instantWins: winLines || undefined,
    });
    const sent = await this.dispatch({
      to: email,
      from: fromEmail ?? undefined,
      subject: `Order confirmed — ${tenant.name}`,
      text: templated.text,
      html: templated.html,
    });
    this.logger.log(
      `order confirmation → ${email} order ${confirmation.order_id} sent=${sent}`,
    );
    return { queued: true, sent };
  }

  async sendPaymentFailed(
    tenant: TenantContext,
    email: string,
    orderId: string,
    fromEmail?: string | null,
  ) {
    const sent = await this.dispatch({
      to: email,
      from: fromEmail ?? undefined,
      subject: `Payment failed — ${tenant.name}`,
      text: `Your payment for order ${orderId} could not be completed. You can try again from your cart.`,
    });
    return { queued: true, sent };
  }

  async sendOperatorOrderAlert(
    tenant: TenantContext,
    operatorEmail: string,
    order: { order_id: string; total: number; customer_email: string },
  ) {
    const sent = await this.dispatch({
      to: operatorEmail,
      subject: `New order — ${tenant.name}`,
      text: `New order ${order.order_id} from ${order.customer_email} — KES ${order.total}`,
    });
    return { queued: true, sent };
  }

  async sendStaffInvite(
    tenant: TenantContext,
    email: string,
    password: string,
    fromEmail?: string | null,
  ) {
    const adminUrl = `${this.siteUrl(tenant)}/admin`;
    const sent = await this.dispatch({
      to: email,
      from: fromEmail ?? undefined,
      subject: `Staff account — ${tenant.name}`,
      text: `You have been invited to ${tenant.name} admin.\nURL: ${adminUrl}\nEmail: ${email}\nPassword: ${password}\nChange your password after first login.`,
    });
    return { queued: true, sent };
  }

  async sendContactMessage(
    tenant: TenantContext,
    operatorEmail: string,
    message: { from_email: string; name?: string; body: string },
  ) {
    const sent = await this.dispatch({
      to: operatorEmail,
      subject: `Contact form — ${tenant.name}`,
      text: `From: ${message.name ?? message.from_email}\n${message.body}`,
    });
    return { queued: true, sent };
  }

  async sendWinnerNotification(
    tenant: TenantContext,
    email: string,
    win: {
      raffle_title: string;
      ticket_number: number;
      prize_name: string;
    },
    fromEmail?: string | null,
  ) {
    const sent = await this.dispatch({
      to: email,
      from: fromEmail ?? undefined,
      subject: `You won! — ${tenant.name}`,
      text: `Congratulations! You won ${win.prize_name} in ${win.raffle_title} (ticket #${win.ticket_number}). Log in to your account to claim your prize.`,
      html: `<p>Congratulations!</p><p>You won <strong>${win.prize_name}</strong> in <strong>${win.raffle_title}</strong> (ticket #${win.ticket_number}).</p><p><a href="${this.siteUrl(tenant)}/account">View your account</a> to claim your prize.</p>`,
    });
    this.logger.log(`winner email → ${email} (${tenant.slug}) sent=${sent}`);
    return { queued: true, sent };
  }
}
