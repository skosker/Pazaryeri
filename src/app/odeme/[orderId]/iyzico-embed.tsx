"use client";

import { useEffect, useRef } from "react";

/**
 * iyzico's checkoutFormContent is an HTML snippet containing a <script> tag
 * that renders the hosted card form into #iyzipay-checkout-form. Content set
 * via dangerouslySetInnerHTML does not execute embedded <script> tags, so we
 * recreate the script node manually to force execution.
 */
export function IyzicoEmbed({ checkoutFormContent }: { checkoutFormContent: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";
    const wrapper = document.createElement("div");
    wrapper.innerHTML = checkoutFormContent;

    const scripts = Array.from(wrapper.querySelectorAll("script"));
    scripts.forEach((oldScript) => oldScript.remove());

    container.appendChild(wrapper);

    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) =>
        newScript.setAttribute(attr.name, attr.value)
      );
      newScript.text = oldScript.text;
      container.appendChild(newScript);
    });
  }, [checkoutFormContent]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div id="iyzipay-checkout-form" ref={containerRef} className="responsive" />
    </div>
  );
}
