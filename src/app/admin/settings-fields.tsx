import type { ReactNode } from "react";

/** Building blocks for the admin settings forms (membership and campaigns). */

export function SettingsCard({
  title,
  hint,
  status,
  children,
  wide = false,
}: {
  title: string;
  hint?: string;
  /** Shown as a pill next to the title, e.g. whether the feature is switched on. */
  status?: { on: boolean; label?: string };
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${wide ? "lg:col-span-2" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-semibold text-brand-navy">{title}</h2>
        {status && (
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
              status.on ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
            }`}
          >
            {status.label ?? (status.on ? "Açık" : "Kapalı")}
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-xs leading-relaxed text-slate-500">{hint}</p>}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}

const inputClass =
  "rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-purple-400";

export function NumberField({
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
    <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
      {label}
      <input type="number" name={name} required min={0} step={step} defaultValue={defaultValue} className={inputClass} />
    </label>
  );
}

export function TextField({
  label,
  name,
  defaultValue,
  required = true,
  wide = false,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
  wide?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-1 text-xs font-medium text-slate-600 ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      <input type="text" name={name} required={required} defaultValue={defaultValue ?? ""} className={inputClass} />
    </label>
  );
}

/** Shows a stored instant as Istanbul wall-clock time for a datetime-local input. */
export function toIstanbulInput(date: Date | null | undefined): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(date)
    .replace(" ", "T");
}

export function DateTimeField({ label, name, defaultValue }: { label: string; name: string; defaultValue: string }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
      {label}
      <input type="datetime-local" name={name} required defaultValue={defaultValue} className={inputClass} />
    </label>
  );
}

export function Toggle({ label, name, defaultChecked }: { label: string; name: string; defaultChecked: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-brand-navy sm:col-span-2">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 accent-purple-600" />
      {label}
    </label>
  );
}

export function SaveBar({ pending, error, saved, label = "Kaydet" }: { pending: boolean; error?: string; saved?: boolean; label?: string }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-1 mt-6 flex flex-wrap items-center gap-3 border-t border-slate-200 bg-background/95 px-1 py-3 backdrop-blur">
      <button
        type="submit"
        disabled={pending}
        className="brand-gradient rounded-full px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Kaydediliyor..." : label}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && !pending && !error && <p className="text-sm text-emerald-700">Kaydedildi, sitede hemen geçerli.</p>}
    </div>
  );
}

/** Reads a number from a form, accepting Turkish decimals ("2,5"). */
export function formNumber(formData: FormData, key: string): number {
  return Number(String(formData.get(key) ?? "").trim().replace(",", "."));
}

export const isPrice = (v: number) => Number.isFinite(v) && v >= 0 && v <= 1_000_000;
export const isWhole = (v: number, min: number, max: number) => Number.isInteger(v) && v >= min && v <= max;
export const round2 = (v: number) => Math.round(v * 100) / 100;
