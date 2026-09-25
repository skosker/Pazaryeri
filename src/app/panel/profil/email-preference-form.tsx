"use client";

import { useRef } from "react";
import { updateEmailPreferenceAction } from "./actions";

/** Saves as soon as the box is ticked or unticked; there is nothing else on the form. */
export function EmailPreferenceForm({ campaignEmails }: { campaignEmails: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form ref={formRef} action={updateEmailPreferenceAction}>
      <label className="flex items-start gap-3 text-sm text-slate-600">
        <input
          type="checkbox"
          name="campaignEmails"
          defaultChecked={campaignEmails}
          onChange={() => formRef.current?.requestSubmit()}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-400"
        />
        <span>
          <span className="font-medium text-brand-navy">Kampanya ve fırsat duyuruları</span>
          <span className="block text-xs text-slate-500">
            Freelancer Günü gibi kampanyalar açıldığında e-posta ile haber ver. Sipariş ve hesap e-postaları bundan
            etkilenmez.
          </span>
        </span>
      </label>
    </form>
  );
}
