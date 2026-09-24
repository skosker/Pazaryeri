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

export function CampaignForm({ id, values }: { id: string | null; values: CampaignFormValues }) {
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
      <SaveBar pending={pending} error={state.error} saved={state.saved} label={id ? "Kampanyayı Kaydet" : "Kampanyayı Oluştur"} />
    </form>
  );
}
