import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import { getCartSessionSecret } from "../common/security-config";

const SIGNATURE_LENGTH = 16;

function signRawSessionId(rawId: string): string {
  const signature = createHmac("sha256", getCartSessionSecret())
    .update(rawId)
    .digest("hex")
    .slice(0, SIGNATURE_LENGTH);
  return `${rawId}.${signature}`;
}

function isValidSignedCartSession(sessionId: string): boolean {
  const dot = sessionId.lastIndexOf(".");
  if (dot <= 0) return false;

  const rawId = sessionId.slice(0, dot);
  const provided = sessionId.slice(dot + 1);
  if (rawId.length < 8 || provided.length !== SIGNATURE_LENGTH) return false;

  const expected = createHmac("sha256", getCartSessionSecret())
    .update(rawId)
    .digest("hex")
    .slice(0, SIGNATURE_LENGTH);

  try {
    return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
  } catch {
    return false;
  }
}

/** Resolve a signed cart session id for DB storage and client responses. */
export function resolveCartSessionId(header?: string): string {
  if (header && isValidSignedCartSession(header)) {
    return header;
  }
  return signRawSessionId(randomUUID());
}
