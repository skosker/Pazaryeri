"use client";

import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

/**
 * A one-time celebratory announcement on the home page. Shown once per browser — closing
 * it sets a localStorage flag so returning visitors are not nagged by an old milestone
 * forever. If localStorage is unavailable (private window, blocked site data) it simply
 * shows every visit instead of failing.
 *
 * Whether it was already dismissed is only knowable in the browser, so it is read via
 * useSyncExternalStore rather than an effect: the server (and the very first client
 * render, before hydration) always sees "dismissed", and the real answer replaces it
 * right after — the sanctioned way to adopt a client-only value without a hydration
 * mismatch or an effect that just mirrors state.
 */
const DISMISS_KEY = "prosinta-milestone-5000-dismissed";

function subscribe() {
  return () => {};
}

function getSnapshot() {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

function getServerSnapshot() {
  return true;
}

export function MilestonePopup() {
  const dismissed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [closedByUser, setClosedByUser] = useState(false);
  const open = !dismissed && !closedByUser;

  function close() {
    setClosedByUser(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Nothing to persist to; it will just show again next visit.
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="milestone-title"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-8 text-center shadow-2xl">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-600 opacity-20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 opacity-10 blur-3xl"
        />

        <button
          type="button"
          onClick={close}
          aria-label="Kapat"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path d="M4.3 4.3a1 1 0 011.4 0L10 8.6l4.3-4.3a1 1 0 111.4 1.4L11.4 10l4.3 4.3a1 1 0 01-1.4 1.4L10 11.4l-4.3 4.3a1 1 0 01-1.4-1.4L8.6 10 4.3 5.7a1 1 0 010-1.4z" />
          </svg>
        </button>

        <div className="relative">
          <span className="brand-gradient mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-3xl shadow-lg shadow-fuchsia-500/30">
            🎉
          </span>

          <h2 id="milestone-title" className="mt-5 text-2xl font-extrabold text-brand-navy">
            İlk haftamızda 5.000 üyeye ulaştık!
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Bize gösterdiğiniz güven için teşekkür ederiz. Prosinta ailesine katılan her
            freelancer ve işveren, bu yolculuğu daha da anlamlı kılıyor.
          </p>

          <Button onClick={close} className="mt-7 w-full">
            Teşekkürler, devam et
          </Button>
        </div>
      </div>
    </div>
  );
}
