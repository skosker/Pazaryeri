"use client";

import { useActionState } from "react";
import { DateTimeField, NumberField, SaveBar, SettingsCard, TextField, Toggle } from "@/app/admin/settings-fields";
import { saveCampaignAction, type FormState } from "./actions";

const initialState: FormState = {};

export type CampaignFormValues = {
  name: string;
  tagline: string | null;
  enabled: boolean;
  /** datetime-local strings, Istanbul time. */
  start: string;
  end: string;
  minPercent: number;
  maxPercent: number;
  proDiscountPercent: number;
  boostDiscountPercent: number;
};

export function CampaignForm({
  id,
  values,
  announcement,
}: {
  id: string | null;
  values: CampaignFormValues;
  /** Already sent ("15 Ekim 2026 · 312 kişi"), or how many it would go to. */
  announcement: { sentLabel: string | null; audience: number };
}) {
  const [state, formAction, pending] = useActionState(saveCampaignAction.bind(null, id), initialState);
  return (
    <form action={formAction}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SettingsCard
          title="Kampanya"
          status={{ on: values.enabled }}
          hint="Kapalıyken kullanıcılar hiçbir şey görmez. Açınca freelancer'lar bitişe kadar ilanlarını katabilir; alıcılar indirimleri yalnızca başlangıç ile bitiş arasında görür. Saatler İstanbul saatidir."
        >
          <Toggle label="Kampanya açık" name="enabled" defaultChecked={values.enabled} />
          <TextField label="Kampanya adı" name="name" defaultValue={values.name} wide />
          <TextField label="Kısa açıklama (kampanya sayfasında)" name="tagline" defaultValue={values.tagline} required={false} wide />
          <DateTimeField label="Başlangıç" name="start" defaultValue={values.start} />
          <DateTimeField label="Bitiş" name="end" defaultValue={values.end} />
          <div className="sm:col-span-2 border-t border-slate-100 pt-3">
            {announcement.sentLabel ? (
              <p className="text-xs text-emerald-700">Freelancer&apos;lara duyuru gönderildi: {announcement.sentLabel}</p>
            ) : (
              <>
                <Toggle label="Kaydedince freelancer'lara e-posta ile duyur" name="announce" defaultChecked={!values.enabled} />
                <p className="mt-1 text-xs text-slate-500">
                  Kampanya açıkken kaydedersen e-postası doğrulanmış {announcement.audience.toLocaleString("tr-TR")} freelancer&apos;a
                  bir kez gider (duyuruları kapatanlar hariç).
                </p>
              </>
            )}
          </div>
        </SettingsCard>

        <SettingsCard
          title="İndirimler"
          hint="İlan indirimini freelancer bu aralıkta seçer ve karşılar. Pro ve Öne Çıkar indirimleri kampanya yayındayken freelancer'lara uygulanır (0 = yok)."
        >
          <NumberField label="İlan indirimi en az (%)" name="minPercent" defaultValue={values.minPercent} />
          <NumberField label="İlan indirimi en çok (%)" name="maxPercent" defaultValue={values.maxPercent} />
          <NumberField label="Pro üyelik indirimi (%)" name="proDiscountPercent" defaultValue={values.proDiscountPercent} />
          <NumberField label="Öne Çıkar indirimi (%)" name="boostDiscountPercent" defaultValue={values.boostDiscountPercent} />
        </SettingsCard>
      </div>
      {state.announced !== undefined && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Duyuru {state.announced.toLocaleString("tr-TR")} freelancer&apos;a gönderildi.
        </p>
      )}
      <SaveBar pending={pending} error={state.error} saved={state.saved} label={id ? "Kampanyayı Kaydet" : "Kampanyayı Oluştur"} />
    </form>
  );
}
