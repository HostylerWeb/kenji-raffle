import { Suspense } from "react";
import CheckoutFailedClient from "./CheckoutFailedClient";

export default function CheckoutFailedPage() {
  return (
    <Suspense fallback={<main style={{ padding: 40 }}>Loading…</main>}>
      <CheckoutFailedClient />
    </Suspense>
  );
}
