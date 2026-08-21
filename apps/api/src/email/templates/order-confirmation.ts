export function wrapEmailHtml(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;line-height:1.5;color:#0f172a">
<h1 style="font-size:18px">${title}</h1>
${bodyHtml}
</body></html>`;
}

export function orderConfirmationText(input: {
  orderId: string;
  total: number;
  tickets: string;
  instantWins?: string;
}): { text: string; html: string } {
  const text = `Order ${input.orderId}\nTotal: KES ${input.total}\n\nTickets:\n${input.tickets}${input.instantWins ?? ""}`;
  const html = wrapEmailHtml(
    "Order confirmed",
    `<p>Order <strong>${input.orderId}</strong></p>
<p>Total: KES ${input.total.toLocaleString()}</p>
<pre>${input.tickets}${input.instantWins ?? ""}</pre>`,
  );
  return { text, html };
}
