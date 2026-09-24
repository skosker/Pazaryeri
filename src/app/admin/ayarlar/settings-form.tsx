"use client";

import { useActionState } from "react";
import type { SiteSettings } from "@/lib/settings";
import { NumberField, SaveBar, SettingsCard, Toggle } from "@/app/admin/settings-fields";
import { saveMembershipSettingsAction, type SettingsFormState } from "./actions";

const initialState: SettingsFormState = {};

/** "9.600 TL (ayda 800 TL)" — the yearly price the plan cards will show. */
function yearly(monthly: number, discountPercent: number): string {
  const perMonth = Math.round(monthly * (100 - discountPercent)) / 100;
  const fmt = (n: number) => n.toLocaleString("tr-TR", { maximumFractionDigits: 2 });
  return `${fmt(Math.round(perMonth * 1200) / 100)} TL (ayda ${fmt(perMonth)} TL)`;
}

export function MembershipSettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState(saveMembershipSettingsAction, initialState);

  return (
    <form action={formAction}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SettingsCard
          title="Üyelik Paketleri (Pro / Pro Plus)"
          wide
          hint="Yalnızca freelancer'lara satılır; aylık ya da yıllık, otomatik yenilenmez. Yıllık fiyat = aylık × 12, yıllık indirimle. Fiyat değişikliği yalnızca yeni satın almalara uygulanır; süresiz Pro üyeler etkilenmez."
        >
          <NumberField label="Pro aylık fiyat (TL)" name="proMonthlyTl" defaultValue={settings.proMonthlyTl} step="0.01" />
          <NumberField label="Pro Plus aylık fiyat (TL)" name="plusMonthlyTl" defaultValue={settings.plusMonthlyTl} step="0.01" />
          <NumberField label="Yıllık ödemede indirim (%)" name="yearlyDiscountPercent" defaultValue={settings.yearlyDiscountPercent} step="0.01" />
          <NumberField label="Pro Plus Öne Çıkar indirimi (%)" name="plusBoostDiscountPercent" defaultValue={settings.plusBoostDiscountPercent} step="0.01" />
          <NumberField label="Aylık ücretsiz Öne Çıkar – Pro (gün)" name="proFreeBoostDays" defaultValue={settings.proFreeBoostDays} />
          <NumberField label="Aylık ücretsiz Öne Çıkar – Pro Plus (gün)" name="plusFreeBoostDays" defaultValue={settings.plusFreeBoostDays} />
          <NumberField label="Görsel sınırı (Ücretsiz)" name="portfolioImages" defaultValue={settings.portfolioImages} />
          <NumberField label="Görsel sınırı (Pro)" name="portfolioImagesPro" defaultValue={settings.portfolioImagesPro} />
          <NumberField label="Görsel sınırı (Pro Plus)" name="portfolioImagesPlus" defaultValue={settings.portfolioImagesPlus} />
          <div className="sm:col-span-2 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-2">
            <Toggle label="Ücretsiz Pro denemesi açık" name="proTrialEnabled" defaultChecked={settings.proTrialEnabled} />
            <NumberField label="Deneme süresi (gün)" name="proTrialDays" defaultValue={settings.proTrialDays} />
          </div>
          <p className="sm:col-span-2 text-xs text-slate-500">
            Yıllık: Pro {yearly(settings.proMonthlyTl, settings.yearlyDiscountPercent)} · Pro Plus{" "}
            {yearly(settings.plusMonthlyTl, settings.yearlyDiscountPercent)} (kaydettikten sonra güncellenir)
          </p>
        </SettingsCard>

        <SettingsCard
          title="Öne Çıkar (Sponsorlu)"
          status={{ on: settings.boostEnabled }}
          hint="İlanı ücret karşılığı varsayılan sıralamada en üste taşır. Kapatınca yeni satın alma olmaz, süresi devam edenler biter."
        >
          <Toggle label="Satış açık" name="boostEnabled" defaultChecked={settings.boostEnabled} />
          <NumberField label="Fiyat (TL)" name="boostPriceTl" defaultValue={settings.boostPriceTl} step="0.01" />
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
          <NumberField label="En düşük yükleme (TL)" name="corporateMinTopUpTl" defaultValue={settings.corporateMinTopUpTl} step="0.01" />
          <NumberField label="Yükleme bonusu (%)" name="corporateBonusPercent" defaultValue={settings.corporateBonusPercent} step="0.01" />
        </SettingsCard>
      </div>

      <SaveBar pending={pending} error={state.error} saved={state.saved} label="Ayarları Kaydet" />
    </form>
  );
}
