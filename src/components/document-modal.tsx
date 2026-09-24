"use client";

import { useEffect, type ReactNode } from "react";
import { legalProseClass } from "@/components/legal-prose";

/**
 * An agreement shown over the page instead of in a new tab, so a user reading it in the
 * middle of signing up does not lose the form. Closes on Esc, the backdrop or the X.
 */
export function DocumentModal({
  title,
  children,
  onClose,
  onAccept,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  /** When given, shows "Okudum, Kabul Ediyorum" which runs this and closes. */
  onAccept?: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-brand-navy">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className={`overflow-y-auto px-6 py-5 ${legalProseClass}`}>{children}</div>
        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Kapat
          </button>
          {onAccept && (
            <button
              type="button"
              onClick={() => {
                onAccept();
                onClose();
              }}
              className="brand-gradient rounded-full px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Okudum, Kabul Ediyorum
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
