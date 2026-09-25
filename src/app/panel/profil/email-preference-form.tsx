"use client";

import { useRef } from "react";
import { updateEmailPreferenceAction } from "./actions";

/** Saves as soon as a box is ticked or unticked; there is nothing else on the form. */
export function EmailPreferenceForm({
  campaignEmails,
  jobRequestEmails,
}: {
  campaignEmails: boolean;
  /** null while İş Talepleri is switched off: the box is not shown and the setting is left alone. */
  jobRequestEmails: boolean | null;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const box = "mt-0.5 h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-400";
  return (
    <form ref={formRef} action={updateEmailPreferenceAction} className="space-y-4">
      <label className="flex items-start gap-3 text-sm text-slate-600">
        <input
          type="checkbox"
          name="campaignEmails"
          defaultChecked={campaignEmails}
          onChange={() => formRef.current?.requestSubmit()}
          className={box}
        />
        <span>
          <span className="font-medium text-brand-navy">Kampanya ve fırsat duyuruları</span>
          <span className="block text-xs text-slate-500">
            Freelancer Günü gibi kampanyalar açıldığında e-posta ile haber ver. Sipariş ve hesap e-postaları bundan
            etkilenmez.
          </span>
        </span>
      </label>
      {jobRequestEmails !== null && (
        <label className="flex items-start gap-3 text-sm text-slate-600">
          <input type="hidden" name="jobRequestShown" value="1" />
          <input
            type="checkbox"
            name="jobRequestEmails"
            defaultChecked={jobRequestEmails}
            onChange={() => formRef.current?.requestSubmit()}
            className={box}
          />
          <span>
            <span className="font-medium text-brand-navy">Yeni iş talepleri</span>
            <span className="block text-xs text-slate-500">
              İlanlarının kategorilerinde yeni iş talebi açıldığında günde en fazla bir özet e-postası gönder.
            </span>
          </span>
        </label>
      )}
    </form>
  );
}
