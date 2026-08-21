"use client";

import Script from "next/script";
import { useEffect } from "react";

type AnalyticsConfig = {
  ga4_measurement_id?: string | null;
  facebook_pixel_id?: string | null;
};

export function AnalyticsScripts({ analytics }: { analytics: AnalyticsConfig | null }) {
  const gaId = analytics?.ga4_measurement_id;
  const fbId = analytics?.facebook_pixel_id;

  useEffect(() => {
    if (fbId && typeof window !== "undefined") {
      const w = window as Window & { fbq?: (...args: unknown[]) => void };
      if (w.fbq) {
        w.fbq("track", "PageView");
      }
    }
  }, [fbId]);

  if (!analytics) return null;

  return (
    <>
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}
          </Script>
        </>
      )}
      {fbId && (
        <Script id="fb-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${fbId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  );
}

export function trackPurchase(
  analytics: AnalyticsConfig | null,
  order: { order_id: string; total: number },
) {
  trackAnalyticsEvent(analytics, "purchase", {
    transaction_id: order.order_id,
    value: order.total,
    currency: "KES",
  });
}

export function trackAddToCart(
  analytics: AnalyticsConfig | null,
  item: { raffle_id: string; quantity: number; value?: number },
) {
  trackAnalyticsEvent(analytics, "add_to_cart", {
    items: [{ item_id: item.raffle_id, quantity: item.quantity }],
    value: item.value,
    currency: "KES",
  });
}

export function trackInitiateCheckout(
  analytics: AnalyticsConfig | null,
  total: number,
) {
  trackAnalyticsEvent(analytics, "initiate_checkout", {
    value: total,
    currency: "KES",
  });
}

function trackAnalyticsEvent(
  analytics: AnalyticsConfig | null,
  fbEvent: string,
  gaPayload: Record<string, unknown>,
) {
  if (!analytics) return;

  const w = window as Window & {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  };

  if (analytics.ga4_measurement_id && w.gtag) {
    const gaEvent =
      fbEvent === "purchase"
        ? "purchase"
        : fbEvent === "add_to_cart"
          ? "add_to_cart"
          : "begin_checkout";
    w.gtag("event", gaEvent, gaPayload);
  }

  if (analytics.facebook_pixel_id && w.fbq) {
    const fbName =
      fbEvent === "purchase"
        ? "Purchase"
        : fbEvent === "add_to_cart"
          ? "AddToCart"
          : "InitiateCheckout";
    w.fbq("track", fbName, gaPayload);
  }
}
