"use client";

import { useState, useTransition, type ReactNode } from "react";
import { DocumentModal } from "@/components/document-modal";

/**
 * The pre-purchase consent on Prosinta's own checkout pages: the payment options below it
 * stay locked until the buyer confirms the Ön Bilgilendirme Formu and the Mesafeli Hizmet
 * Sözleşmesi. Ticking it records the time on the purchase (acceptAction), which the
 * payment actions check again on the server.
 */
export function PurchaseConsent({
  acceptAction,
  initiallyAccepted,
  consumer,
  onBilgilendirme,
  sozlesme,
  children,
}: {
  acceptAction: () => Promise<void>;
  initiallyAccepted: boolean;
  consumer: boolean;
  onBilgilendirme: ReactNode;
  sozlesme: ReactNode;
  children: ReactNode;
}) {
  const [accepted, setAccepted] = useState(initiallyAccepted);
  const [, startTransition] = useTransition();
  const [openDoc, setOpenDoc] = useState<"on" | "soz" | null>(null);

  // Ticks at once; the payment options unlock when the consent is on record.
  const [recorded, setRecorded] = useState(initiallyAccepted);
  function accept() {
    setAccepted(true);
    startTransition(async () => {
      await acceptAction();
      setRecorded(true);
    });
  }

  return (
    <div>
      <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => (e.target.checked ? accept() : setAccepted(false))}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-purple-600 focus:ring-purple-400"
        />
        <span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setOpenDoc("on");
            }}
            className="font-semibold text-purple-700 hover:underline"
          >
            Ön Bilgilendirme Formu
          </button>
          &apos;nu ve{" "}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setOpenDoc("soz");
            }}
            className="font-semibold text-purple-700 hover:underline"
          >
            Mesafeli Hizmet Sözleşmesi
          </button>
          &apos;ni okudum, onaylıyorum.
          {consumer && (
            <> Hizmetin ödeme onayıyla hemen başlamasını kabul ediyorum; bu nedenle cayma hakkımın bulunmadığını biliyorum.</>
          )}
        </span>
      </label>

      {openDoc && (
        <DocumentModal
          title={openDoc === "on" ? "Ön Bilgilendirme Formu" : "Mesafeli Hizmet Sözleşmesi"}
          onClose={() => setOpenDoc(null)}
          onAccept={accept}
        >
          {openDoc === "on" ? onBilgilendirme : sozlesme}
        </DocumentModal>
      )}

      <div
        className={`mt-6 ${accepted && recorded ? "" : "pointer-events-none select-none opacity-40"}`}
        aria-disabled={!(accepted && recorded)}
      >
        {!accepted && (
          <p className="mb-3 text-center text-xs font-semibold text-slate-500">Ödeme için önce yukarıdaki onayı ver.</p>
        )}
        {children}
      </div>
    </div>
  );
}
