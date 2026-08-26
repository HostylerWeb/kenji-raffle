const ERROR_RULES: { match: string | RegExp; message: string }[] = [
  {
    match: "Play Safe is active",
    message:
      "Play Safe is active — purchases are paused until your cooling-off period ends.",
  },
  {
    match: "Spending limit exceeded",
    message: "This order would exceed your spending limit for this period.",
  },
  {
    match: /Maximum \d+ tickets per person/,
    message:
      "Ticket limit reached for this competition (includes cart and pending orders).",
  },
  {
    match: "Not enough tickets available",
    message: "Not enough tickets left — try a lower quantity.",
  },
  {
    match: "You already have a pending order",
    message:
      "You already have a pending order — complete or cancel payment first.",
  },
  {
    match: "Verify your email before purchasing",
    message: "Please verify your email before checkout.",
  },
  {
    match: "Account disabled",
    message: "Your account is disabled. Contact support for help.",
  },
  {
    match: "Checkout is temporarily disabled",
    message: "Checkout is temporarily unavailable. Please try again later.",
  },
  {
    match: "This raffle has ended",
    message: "This competition has ended.",
  },
  {
    match: "This raffle has not started yet",
    message: "This competition has not started yet.",
  },
  {
    match: "Raffle is not available",
    message: "This competition is not available for purchase.",
  },
  {
    match: "Invalid coupon",
    message: "That coupon code is not valid.",
  },
  {
    match: "Coupon has expired",
    message: "That coupon has expired.",
  },
  {
    match: "Coupon is not yet valid",
    message: "That coupon is not valid yet.",
  },
  {
    match: "already used this coupon",
    message: "You have already used this coupon.",
  },
  {
    match: "does not meet coupon minimum",
    message: "Your order does not meet the minimum for this coupon.",
  },
];

export function friendlyPlayerError(raw: string): string {
  for (const rule of ERROR_RULES) {
    if (typeof rule.match === "string") {
      if (raw.includes(rule.match)) return rule.message;
    } else if (rule.match.test(raw)) {
      return rule.message;
    }
  }
  return raw;
}
