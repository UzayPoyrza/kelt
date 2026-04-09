"use client";

import Script from "next/script";
import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

/** Declare gtag on window */
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/** Fire a Google Ads conversion event */
export function trackConversion(label: string) {
  if (typeof window !== "undefined" && window.gtag && ADS_ID) {
    window.gtag("event", "conversion", {
      send_to: `${ADS_ID}/${label}`,
    });
  }
}

/**
 * Detects ?conversion=signup in the URL (appended by auth callback),
 * fires the conversion, and cleans the param from the URL.
 */
function ConversionTracker() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const conversion = searchParams.get("conversion");
    if (conversion === "signup") {
      const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_LABEL;
      if (label) {
        trackConversion(label);
        console.log("[gtag] Signup conversion fired");
      }

      // Remove the conversion param from URL without navigation
      const params = new URLSearchParams(searchParams.toString());
      params.delete("conversion");
      const remaining = params.toString();
      const cleanUrl = remaining ? `${pathname}?${remaining}` : pathname;
      router.replace(cleanUrl, { scroll: false });
    }
  }, [searchParams, router, pathname]);

  return null;
}

/**
 * Loads the Google Ads gtag.js script and tracks signup conversions.
 * Renders nothing if NEXT_PUBLIC_GOOGLE_ADS_ID is not set.
 */
export default function GoogleAdsTag() {
  if (!ADS_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${ADS_ID}');
        `}
      </Script>
      <Suspense fallback={null}>
        <ConversionTracker />
      </Suspense>
    </>
  );
}
