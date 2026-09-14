import Script from "next/script";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { resolveTrackingConfig } from "@/lib/tracking";

/**
 * Site tracking via Next.js `@next/third-parties` (GTM + GA4) plus optional Meta Pixel.
 * @see https://nextjs.org/docs/app/guides/third-party-libraries
 */
export async function TrackingScripts() {
  const { ga4Id, gtmId, fbPixelId } = await resolveTrackingConfig();

  return (
    <>
      {gtmId ? <GoogleTagManager gtmId={gtmId} /> : null}
      {ga4Id ? <GoogleAnalytics gaId={ga4Id} /> : null}

      {fbPixelId ? (
        <Script id="fb-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${fbPixelId}');
          fbq('track', 'PageView');
        `}</Script>
      ) : null}
    </>
  );
}

/** GTM noscript fallback — place immediately after `<body>`. */
export async function GoogleTagManagerNoscript() {
  const { gtmId } = await resolveTrackingConfig();
  if (!gtmId) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height={0}
        width={0}
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
