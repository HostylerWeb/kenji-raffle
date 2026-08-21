import { roundMoney } from "./checkout-pricing.helper";

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

export function verifyGatewayCallbackSignature(
  signature: string | undefined,
  secret: string | undefined,
): boolean {
  if (!secret) return false;
  return signature === secret;
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
