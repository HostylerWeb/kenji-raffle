"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function MfaQrCode({ value }: { value: string }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, {
      width: 220,
      margin: 2,
      errorCorrectionLevel: "M",
    })
      .then((url) => {
        if (!cancelled) setSrc(url);
      })
      .catch(() => {
        if (!cancelled) setSrc("");
      });
    return () => {
      cancelled = true;
    };
  }, [value]);

  if (!src) {
    return <div className="mfa-qr mfa-qr-placeholder">Generating QR code…</div>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="QR code for Google Authenticator"
      width={220}
      height={220}
      className="mfa-qr"
    />
  );
}
