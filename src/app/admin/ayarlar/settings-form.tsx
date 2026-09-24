"use client";

import { useActionState } from "react";
import type { SiteSettings } from "@/lib/settings";
import { NumberField, SaveBar, SettingsCard, Toggle } from "@/app/admin/settings-fields";
import { saveMembershipSettingsAction, type SettingsFormState } from "./actions";

const initialState: SettingsFormState = {};

export function MembershipSettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState(saveMembershipSettingsAction, initialState);

  return (
    <form action={formAction}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SettingsCard title="Prosinta Pro" hint="Tek seferlik ödeme, süresiz üyelik. Mevcut Pro üyeler etkilenmez.">
          <NumberField label="Pro fiyatı (₺)" name="proPriceTl" defaultValue={settings.proPriceTl} step="0.01" />
          <NumberField label="Görsel sınırı (normal)" name="portfolioImages" defaultValue={settings.portfolioImages} />
          <NumberField label="Görsel sınırı (Pro)" name="portfolioImagesPro" defaultValue={settings.portfolioImagesPro} />
        </SettingsCard>

        <SettingsCard
          title="Öne Çıkar (Sponsorlu)"
          status={{ on: settings.boostEnabled }}
          hint="İlanı ücret karşılığı varsayılan sıralamada en üste taşır. Kapatınca yeni satın alma olmaz, süresi devam edenler biter."
        >
          <Toggle label="Satış açık" name="boostEnabled" defaultChecked={settings.boostEnabled} />
          <NumberField label="Fiyat (₺)" name="boostPriceTl" defaultValue={settings.boostPriceTl} step="0.01" />
          <NumberField label="Süre (gün)" name="boostDays" defaultValue={settings.boostDays} />
        </SettingsCard>

        <SettingsCard
          title="Komisyon"
          hint="Sipariş tamamlanınca hakedişten kesilir; yalnızca sonraki siparişlere uygulanır, freelancer'a gösterilmez."
        >
          <NumberField label="Komisyon oranı (%)" name="commissionPercent" defaultValue={settings.commissionPercent} step="0.01" />
        </SettingsCard>

        <SettingsCard
          title="Kurucu Freelancer"
          status={{ on: settings.founderEnabled }}
          hint="İlk ilanı onaylanan gerçek freelancer'lara kalıcı rozet ve aramada öncelik. Kapatınca yeni rozet verilmez, verilenler kalır."
        >
          <Toggle label="Kampanya açık" name="founderEnabled" defaultChecked={settings.founderEnabled} />
          <NumberField label="Kontenjan (kişi)" name="founderLimit" defaultValue={settings.founderLimit} />
        </SettingsCard>

        <SettingsCard
          title="Kurumsal Paket"
          status={{ on: settings.corporateEnabled }}
          wide
          hint="Kapalıyken kullanıcılar görmez. Açınca kurumsal hesaplar Panel → Kurumsal Hesap'tan Havale/EFT ile toplu bakiye yükler (Admin → Kurumsal Hesaplar'dan onaylarsın) ve siparişleri bakiyeyle öder."
        >
          <Toggle label="Kurumsal paket açık" name="corporateEnabled" defaultChecked={settings.corporateEnabled} />
          <NumberField label="En düşük yükleme (₺)" name="corporateMinTopUpTl" defaultValue={settings.corporateMinTopUpTl} step="0.01" />
          <NumberField label="Yükleme bonusu (%)" name="corporateBonusPercent" defaultValue={settings.corporateBonusPercent} step="0.01" />
        </SettingsCard>
      </div>

      <SaveBar pending={pending} error={state.error} saved={state.saved} label="Ayarları Kaydet" />
    </form>
  );
}
