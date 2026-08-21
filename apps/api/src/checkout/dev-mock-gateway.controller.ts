import { Controller, Get, Query, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { FastifyReply } from "fastify";
import { PublicRoute } from "../tenant/tenant.decorators";

/**
 * Dev-only fake payment gateway page. Replace with real kenji-gateway in production.
 * Enable: GATEWAY_DEV_MOCK=true
 * Set: HARAMBE_GATEWAY_URL=http://localhost:4002/v1/payments/dev-mock-gateway/pay
 */
@ApiTags("payments")
@Controller("v1/payments/dev-mock-gateway")
export class DevMockGatewayController {
  @PublicRoute()
  @Get("pay")
  payPage(
    @Query("order_id") orderId: string | undefined,
    @Query("amount") amount: string | undefined,
    @Query("tenant_host") tenantHost: string | undefined,
    @Res() reply: FastifyReply,
  ) {
    if (process.env.GATEWAY_DEV_MOCK !== "true") {
      return reply.status(404).send("Dev mock gateway disabled");
    }
    if (!orderId || !amount) {
      return reply.status(400).send("Missing order_id or amount");
    }

    const secret = process.env.HARAMBE_CALLBACK_SECRET?.trim() ?? "dev-callback-secret";
    const callbackUrl = "/v1/payments/gateway/callback";
    const forwardedHost = tenantHost ?? "demo.kenji-raffle.local";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Dev mock gateway (replace with kenji-gateway)</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 420px; margin: 3rem auto; padding: 0 1rem; }
    .banner { background: #fef3c7; border: 1px solid #f59e0b; padding: 0.75rem; border-radius: 8px; margin-bottom: 1.5rem; font-size: 0.875rem; }
    button { display: block; width: 100%; padding: 0.75rem; margin: 0.5rem 0; font-size: 1rem; cursor: pointer; border-radius: 8px; border: none; }
    .pay { background: #16a34a; color: white; }
    .fail { background: #dc2626; color: white; }
    dl { display: grid; grid-template-columns: auto 1fr; gap: 0.25rem 1rem; }
  </style>
</head>
<body>
  <div class="banner"><strong>Dev mock only.</strong> Replace with <code>kenji-gateway</code> before production. GRA ledger still needs gateway <code>POST /v1/gateway/notify</code> (use GRA simulator separately).</div>
  <h1>Mock payment</h1>
  <dl>
    <dt>Order</dt><dd><code>${orderId}</code></dd>
    <dt>Amount</dt><dd>KES ${Number(amount).toLocaleString()}</dd>
  </dl>
  <button class="pay" type="button" id="pay">Pay (success)</button>
  <button class="fail" type="button" id="fail">Decline</button>
  <p id="msg"></p>
  <script>
    const orderId = ${JSON.stringify(orderId)};
    const amount = ${JSON.stringify(Number(amount))};
    const taxRate = 0.30;
    const feeRate = ${JSON.stringify(Number(process.env.DEFAULT_GATEWAY_FEE_RATE ?? 0.025))};
    const tax = Math.round(amount * taxRate * 100) / 100;
    const operator = Math.round((amount - tax) * 100) / 100;
    const fee = Math.round(amount * feeRate * 100) / 100;

    async function callback(status) {
      const body = status === "completed"
        ? {
            order_id: orderId,
            status: "completed",
            external_transaction_id: "dev-mock-" + Date.now(),
            gross_amount: amount,
            tax_amount: tax,
            operator_amount: operator,
            gateway_fee_rate: feeRate,
            gateway_fee_amount: fee,
          }
        : { order_id: orderId, status: "failed", decline_reason: "Dev mock decline" };

      const res = await fetch(${JSON.stringify(callbackUrl)}, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gateway-signature": ${JSON.stringify(secret)},
          "x-forwarded-host": ${JSON.stringify(forwardedHost)},
        },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      document.getElementById("msg").textContent = res.ok
        ? (status === "completed" ? "Paid — return to the raffle site." : "Failed — tickets released.")
        : JSON.stringify(data);
    }
    document.getElementById("pay").onclick = () => callback("completed");
    document.getElementById("fail").onclick = () => callback("failed");
  </script>
</body>
</html>`;

    reply.type("text/html").send(html);
  }
}
