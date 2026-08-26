import { createHmac, timingSafeEqual } from "crypto";
import { isProduction } from "../common/security-config";

/** Default gateway fee rate for checkout preview only (live fees come from gateway callback). */
export function defaultGatewayFeeRate(): number {
  return Number(process.env.DEFAULT_GATEWAY_FEE_RATE ?? 0.025);
}

export function estimateGatewayFee(
  grossAmount: number,
  operatorAmount: number,
): {
  gateway_fee_rate: number;
  gateway_fee_amount: number;
  operator_net: number;
} {
  const rate = defaultGatewayFeeRate();
  const fee = grossAmount > 0 ? roundMoney(grossAmount * rate) : 0;
  return {
    gateway_fee_rate: rate,
    gateway_fee_amount: fee,
    operator_net: operatorNetAfterGatewayFee(operatorAmount, fee),
  };
}

export function operatorNetAfterGatewayFee(
  operatorAmount: number,
  gatewayFeeAmount: number,
): number {
  return roundMoney(Math.max(0, operatorAmount - gatewayFeeAmount));
}

export function signGatewayCallbackBody(rawBody: string, secret: string): string {
  return createHmac("sha256", secret).update(rawBody).digest("hex");
}

export function verifyGatewayCallbackSignature(
  signature: string | undefined,
  secret: string | undefined,
  rawBody?: string,
  timestamp?: string,
): boolean {
  if (!secret || !signature) return false;

  if (isProduction()) {
    if (!timestamp) return false;
    const ts = Number(timestamp);
    if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > 5 * 60 * 1000) {
      return false;
    }
  } else if (timestamp) {
    const ts = Number(timestamp);
    if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > 5 * 60 * 1000) {
      return false;
    }
  }

  if (rawBody) {
    const expected = signGatewayCallbackBody(rawBody, secret);
    if (
      /^[0-9a-f]+$/i.test(signature) &&
      signature.length === expected.length
    ) {
      try {
        if (
          timingSafeEqual(
            Buffer.from(signature, "hex"),
            Buffer.from(expected, "hex"),
          )
        ) {
          return true;
        }
      } catch {
        // fall through to legacy check in non-production
      }
    }
  }

  if (!isProduction() && signature === secret) {
    return true;
  }

  return false;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export type GatewayCallbackPayload = {
  order_id: string;
  status: "completed" | "failed";
  external_transaction_id?: string;
  gross_amount?: number;
  tax_amount?: number;
  operator_amount?: number;
  gateway_fee_rate?: number;
  gateway_fee_amount?: number;
  decline_reason?: string;
};
