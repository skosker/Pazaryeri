"use client";

import { useActionState } from "react";
import type { SiteSettings } from "@/lib/settings";
import { NumberField, SaveBar, SettingsCard, Toggle } from "@/app/admin/settings-fields";
import { saveOfferSettingsAction, type FormState } from "./actions";

const initialState: FormState = {};

export function OfferSettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState(saveOfferSettingsAction, initialState);
  return (
    <form action={formAction}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SettingsCard
          title="İlk Sipariş İndirimi"
          status={{ on: settings.firstOrderEnabled }}
          hint="Alıcının ilk siparişinde uygulanır; Prosinta karşılar, hakediş tam fiyattan."
        >
          <Toggle label="İndirim açık" name="firstOrderEnabled" defaultChecked={settings.firstOrderEnabled} />
          <NumberField label="Oran (%)" name="firstOrderPercent" defaultValue={settings.firstOrderPercent} step="0.01" />
          <NumberField label="En fazla (TL)" name="firstOrderMaxTl" defaultValue={settings.firstOrderMaxTl} step="0.01" />
        </SettingsCard>
        <SettingsCard
          title="Davet Programı"
          status={{ on: settings.referralEnabled }}
          hint="Davet edilenin ilk siparişi tamamlanınca davet edene ödül; ödülden yüksek bir sonraki siparişinde düşer."
        >
          <Toggle label="Program açık" name="referralEnabled" defaultChecked={settings.referralEnabled} />
          <NumberField label="Ödül (TL)" name="referralRewardTl" defaultValue={settings.referralRewardTl} step="0.01" />
        </SettingsCard>
      </div>
      <SaveBar pending={pending} error={state.error} saved={state.saved} label="İndirimleri Kaydet" />
    </form>
  );
}
