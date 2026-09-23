"use client";

import { useActionState } from "react";
import type { SiteSettings } from "@/lib/settings";
import { saveSettingsAction, type SettingsFormState } from "./actions";

const initialState: SettingsFormState = {};

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState(saveSettingsAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Section title="Prosinta Pro" hint="Tek seferlik ödeme, süresiz üyelik. Mevcut Pro üyeler etkilenmez.">
        <Field label="Pro fiyatı (₺)" name="proPriceTl" defaultValue={settings.proPriceTl} step="0.01" />
        <Field label="Örnek iş görseli sınırı (normal)" name="portfolioImages" defaultValue={settings.portfolioImages} />
        <Field label="Örnek iş görseli sınırı (Pro)" name="portfolioImagesPro" defaultValue={settings.portfolioImagesPro} />
      </Section>

      <Section
        title="Öne Çıkar (Sponsorlu)"
        hint="Freelancer ilanını ücret karşılığı varsayılan sıralamada en üste taşır. Kapatınca yeni satın alma yapılamaz, süresi devam edenler bitene kadar sürer."
      >
        <Toggle label="Öne Çıkar satışı açık" name="boostEnabled" defaultChecked={settings.boostEnabled} />
        <Field label="Fiyat (₺)" name="boostPriceTl" defaultValue={settings.boostPriceTl} step="0.01" />
        <Field label="Süre (gün)" name="boostDays" defaultValue={settings.boostDays} />
      </Section>

      <Section
        title="Komisyon"
        hint="Sipariş tamamlanınca hakedişten kesilir. Yalnızca bundan sonra tamamlanan siparişlere uygulanır; freelancer'a gösterilmez."
      >
        <Field label="Komisyon oranı (%)" name="commissionPercent" defaultValue={settings.commissionPercent} step="0.01" />
      </Section>

      <Section
        title="Kurucu Freelancer"
        hint="İlk ilanı onaylanan gerçek freelancer'lara kalıcı rozet ve aramada öncelik. Kapatınca yeni rozet verilmez ve kontenjan duyuruları gizlenir; verilmiş rozetler kalır."
      >
        <Toggle label="Kampanya açık" name="founderEnabled" defaultChecked={settings.founderEnabled} />
        <Field label="Kontenjan (kişi)" name="founderLimit" defaultValue={settings.founderLimit} />
      </Section>

      {state.error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{state.error}</p>}
      {state.saved && !pending && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Ayarlar kaydedildi, sitede hemen geçerli.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="brand-gradient w-fit rounded-full px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Kaydediliyor..." : "Ayarları Kaydet"}
      </button>
    </form>
  );
}

function Section({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-brand-navy">{title}</h2>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  name,
  defaultValue,
  step = "1",
}: {
  label: string;
  name: string;
  defaultValue: number;
  step?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
      {label}
      <input
        type="number"
        name={name}
        required
        min={0}
        step={step}
        defaultValue={defaultValue}
        className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-purple-400"
      />
    </label>
  );
}

function Toggle({ label, name, defaultChecked }: { label: string; name: string; defaultChecked: boolean }) {
  return (
    <label className="flex items-center gap-2 self-end pb-2.5 text-sm font-medium text-brand-navy sm:col-span-3">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 accent-purple-600" />
      {label}
    </label>
  );
}
