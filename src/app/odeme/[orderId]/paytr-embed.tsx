"use client";

import Script from "next/script";

/**
 * PayTR's hosted card form, embedded via their iframe — unlike iyzico's checkout form
 * (an HTML snippet with an inline <script> that had to be re-executed by hand),
 * PayTR just wants a plain <iframe src>. iframeResizer keeps its height in sync with
 * whatever step the buyer is on (OTP, 3D Secure, bank selection, …) instead of leaving
 * a fixed box that clips or scrolls awkwardly.
 */
export function PaytrEmbed({ token }: { token: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <Script
        src="https://www.paytr.com/js/iframeResizer.min.js"
        strategy="afterInteractive"
        onReady={() => {
          window.iFrameResize?.({}, "#paytriframe");
        }}
      />
      <iframe
        src={`https://www.paytr.com/odeme/guvenli/${token}`}
        id="paytriframe"
        title="PayTR güvenli ödeme"
        frameBorder={0}
        scrolling="no"
        style={{ width: "100%", minHeight: 600 }}
      />
    </div>
  );
}

declare global {
  interface Window {
    iFrameResize?: (options: Record<string, unknown>, selector: string) => void;
  }
}
