"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Starts the one-time shine of the .offer-shine cards inside (see globals.css) the first
 * time they scroll into view, so on a phone it is not spent below the fold before anyone
 * sees it.
 */
export function ShineOnView({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setSeen(true);
        observer.disconnect();
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} data-shine={seen ? "on" : undefined}>
      {children}
    </div>
  );
}
