import Script from "next/script";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { resolveTrackingConfig } from "@/lib/tracking";
import { isValidFbPixelId, isValidGa4Id, isValidGtmId } from "@/lib/tracking-ids";

/**
 * Prefer GTM when both GTM and GA4 are configured (avoids double-counting).
 * Meta Pixel loads lazily and only with a validated numeric ID.
 */
export async function TrackingScripts() {
  const raw = await resolveTrackingConfig();
  const gtmId = isValidGtmId(raw.gtmId) ? raw.gtmId : "";
  const ga4Id = isValidGa4Id(raw.ga4Id) ? raw.ga4Id : "";
  const fbPixelId = isValidFbPixelId(raw.fbPixelId) ? raw.fbPixelId : "";

  const useGtm = Boolean(gtmId);
  // Skip standalone GA4 when GTM is present — load GA via GTM container instead.
  const useGa4 = Boolean(ga4Id) && !useGtm;

  return (
    <>
      {useGtm ? <GoogleTagManager gtmId={gtmId} /> : null}
      {useGa4 ? <GoogleAnalytics gaId={ga4Id} /> : null}

      {fbPixelId ? (
        <Script id="fb-pixel" strategy="lazyOnload">{`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', ${JSON.stringify(fbPixelId)});
          fbq('track', 'PageView');
        `}</Script>
      ) : null}
    </>
  );
}

/** GTM noscript fallback — place immediately after `<body>`. */
export async function GoogleTagManagerNoscript() {
  const { gtmId } = await resolveTrackingConfig();
  if (!gtmId || !isValidGtmId(gtmId)) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(gtmId)}`}
        height={0}
        width={0}
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
