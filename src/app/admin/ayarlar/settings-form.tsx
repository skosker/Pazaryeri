"use client";

import { useActionState, useState } from "react";
import type { SiteSettings } from "@/lib/settings";
import { NumberField, SaveBar, SettingsCard, SettingsMatrix, Toggle } from "@/app/admin/settings-fields";
import { saveMembershipSettingsAction, type SettingsFormState } from "./actions";

const initialState: SettingsFormState = {};

/** "9.600 TL (ayda 800 TL)" — the yearly price the plan cards will show. */
function yearly(monthly: number, discountPercent: number): string {
  const perMonth = Math.round(monthly * (100 - discountPercent)) / 100;
  const fmt = (n: number) => n.toLocaleString("tr-TR", { maximumFractionDigits: 2 });
  return `${fmt(Math.round(perMonth * 1200) / 100)} TL (ayda ${fmt(perMonth)} TL)`;
}

const TABS = [
  { key: "bireysel", label: "Bireysel", sub: "Freelancer üyelikleri, Öne Çıkar, komisyon" },
  { key: "kurumsal", label: "Kurumsal", sub: "Şirket bakiyesi ve kurumsal paketler" },
] as const;

/**
 * One form in two tabs. Both tabs stay in the page (the hidden one only hidden), so a
 * single "Ayarları Kaydet" saves every field whichever tab is showing.
 */
export function MembershipSettingsForm({ settings: s }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState(saveMembershipSettingsAction, initialState);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("bireysel");

  return (
    <form action={formAction}>
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-xl px-4 py-2 text-left transition ${
              tab === t.key ? "bg-white shadow-sm" : "hover:bg-white/60"
            }`}
          >
            <span className="block text-sm font-semibold text-brand-navy">{t.label}</span>
            <span className="block text-[11px] text-slate-500">{t.sub}</span>
          </button>
        ))}
      </div>

      <div className={tab === "bireysel" ? "mt-4 space-y-4" : "hidden"} role="tabpanel">
        <SettingsCard
          title="Üyelik Paketleri"
          hint="Yalnızca freelancer'lara; aylık/yıllık, otomatik yenilenmez. Fiyat değişikliği yeni satın almalara uygulanır."
          cols={3}
        >
          <SettingsMatrix
            columns={["Ücretsiz", "Pro", "Pro Plus"]}
            rows={[
              {
                label: "Aylık fiyat (TL)",
                cells: [
                  null,
                  { name: "proMonthlyTl", value: s.proMonthlyTl, step: "0.01" },
                  { name: "plusMonthlyTl", value: s.plusMonthlyTl, step: "0.01" },
                ],
              },
              {
                label: "Örnek iş görseli (ilan başına)",
                cells: [
                  { name: "portfolioImages", value: s.portfolioImages },
                  { name: "portfolioImagesPro", value: s.portfolioImagesPro },
                  { name: "portfolioImagesPlus", value: s.portfolioImagesPlus },
                ],
              },
              {
                label: "Aylık ücretsiz Öne Çıkar (gün)",
                cells: [
                  null,
                  { name: "proFreeBoostDays", value: s.proFreeBoostDays },
                  { name: "plusFreeBoostDays", value: s.plusFreeBoostDays },
                ],
              },
              {
                label: "Öne Çıkar satın alma indirimi (%)",
                cells: [null, null, { name: "plusBoostDiscountPercent", value: s.plusBoostDiscountPercent, step: "0.01" }],
              },
            ]}
          />
          <NumberField label="Yıllık ödemede indirim (%)" name="yearlyDiscountPercent" defaultValue={s.yearlyDiscountPercent} step="0.01" />
          <Toggle label="Ücretsiz Pro denemesi" name="proTrialEnabled" defaultChecked={s.proTrialEnabled} inline />
          <NumberField label="Deneme süresi (gün)" name="proTrialDays" defaultValue={s.proTrialDays} />
          <p className="col-span-full text-xs text-slate-500">
            Yıllık: Pro {yearly(s.proMonthlyTl, s.yearlyDiscountPercent)} · Pro Plus{" "}
            {yearly(s.plusMonthlyTl, s.yearlyDiscountPercent)}
          </p>
        </SettingsCard>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <SettingsCard
            title="Öne Çıkar"
            status={{ on: s.boostEnabled }}
            hint="İlanı sıralamada en üste taşır. Kapatınca yeni satış olmaz."
          >
            <Toggle label="Satış açık" name="boostEnabled" defaultChecked={s.boostEnabled} />
            <NumberField label="Fiyat (TL)" name="boostPriceTl" defaultValue={s.boostPriceTl} step="0.01" />
            <NumberField label="Süre (gün)" name="boostDays" defaultValue={s.boostDays} />
          </SettingsCard>

          <SettingsCard
            title="Kurucu Freelancer"
            status={{ on: s.founderEnabled }}
            hint="İlk ilanı onaylananlara kalıcı rozet. Kapatınca verilenler kalır."
          >
            <Toggle label="Kampanya açık" name="founderEnabled" defaultChecked={s.founderEnabled} />
            <NumberField label="Kontenjan (kişi)" name="founderLimit" defaultValue={s.founderLimit} />
          </SettingsCard>

          <SettingsCard
            title="Komisyon"
            hint="Tamamlanan siparişin hakedişinden kesilir; freelancer'a gösterilmez."
            cols={1}
          >
            <NumberField label="Komisyon oranı (%)" name="commissionPercent" defaultValue={s.commissionPercent} step="0.01" />
          </SettingsCard>
        </div>
      </div>

      <div className={tab === "kurumsal" ? "mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5" : "hidden"} role="tabpanel">
        <div className="lg:col-span-2">
          <SettingsCard
            title="Kurumsal Hesap (Bakiye)"
            status={{ on: s.corporateEnabled }}
            hint="Açıkken şirketler Havale/EFT ile toplu bakiye yükler (Admin → Kurumsal Hesaplar'dan onaylarsın) ve siparişleri bakiyeyle öder."
          >
            <Toggle label="Kurumsal hesap açık" name="corporateEnabled" defaultChecked={s.corporateEnabled} />
            <NumberField label="En düşük yükleme (TL)" name="corporateMinTopUpTl" defaultValue={s.corporateMinTopUpTl} step="0.01" />
            <NumberField label="Yükleme bonusu (%)" name="corporateBonusPercent" defaultValue={s.corporateBonusPercent} step="0.01" />
          </SettingsCard>
        </div>

        <div className="lg:col-span-3">
          <SettingsCard
            title="Kurumsal Paketler (Abonelik)"
            status={{ on: s.corporateEnabled && s.corporatePlansEnabled }}
            hint="Kurumsal hesapla birlikte açıkken aylık/yıllık satılır (yıllık indirim üyeliklerle aynı). İndirim ve bonusu Prosinta karşılar; indirim üst sınırını paket fiyatının altında tut."
          >
            <Toggle label="Kurumsal paketler açık" name="corporatePlansEnabled" defaultChecked={s.corporatePlansEnabled} />
            <SettingsMatrix
              columns={["Kurumsal", "Kurumsal Plus"]}
              rows={[
                {
                  label: "Aylık fiyat (TL)",
                  cells: [
                    { name: "corpMonthlyTl", value: s.corpMonthlyTl, step: "0.01" },
                    { name: "corpPlusMonthlyTl", value: s.corpPlusMonthlyTl, step: "0.01" },
                  ],
                },
                {
                  label: "Sipariş indirimi (%)",
                  cells: [
                    { name: "corpOrderDiscountPercent", value: s.corpOrderDiscountPercent, step: "0.01" },
                    { name: "corpPlusOrderDiscountPercent", value: s.corpPlusOrderDiscountPercent, step: "0.01" },
                  ],
                },
                {
                  label: "Aylık indirim üst sınırı (TL)",
                  cells: [
                    { name: "corpOrderDiscountMaxTl", value: s.corpOrderDiscountMaxTl, step: "0.01" },
                    { name: "corpPlusOrderDiscountMaxTl", value: s.corpPlusOrderDiscountMaxTl, step: "0.01" },
                  ],
                },
                {
                  label: "Yükleme bonusu (%)",
                  cells: [
                    { name: "corpTopUpBonusPercent", value: s.corpTopUpBonusPercent, step: "0.01" },
                    { name: "corpPlusTopUpBonusPercent", value: s.corpPlusTopUpBonusPercent, step: "0.01" },
                  ],
                },
              ]}
            />
          </SettingsCard>
        </div>
      </div>

      <SaveBar pending={pending} error={state.error} saved={state.saved} label="Ayarları Kaydet" />
    </form>
  );
}
