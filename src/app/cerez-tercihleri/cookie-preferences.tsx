"use client";

import { useState, useSyncExternalStore } from "react";

/**
 * Çerez tercihleri ekranı.
 *
 * The choice lives in the visitor's own browser: there is no consent record kept
 * server-side yet, and pretending otherwise would be worse than saying so. Reads and
 * writes are guarded because a browser can refuse storage entirely (private window,
 * blocked site data) and the page still has to work when it does.
 *
 * The stored value is read through useSyncExternalStore rather than an effect, so the
 * first client render already has it — a switch that flips a moment after the page
 * appears looks like the page changed its own mind.
 */

const STORAGE_KEY = "profestia-cerez-tercihleri";

type Preferences = {
  performans: boolean;
  hedefleme: boolean;
};

const defaults: Preferences = { performans: false, hedefleme: false };

const groups = [
  {
    key: "zorunlu" as const,
    title: "Zorunlu Çerezler",
    description:
      "Zorunlu çerezler, Platform’u görüntülemeniz esnasında cihazınıza yerleştirilen ve sunulan online servislerin düzgün şekilde çalışabilmesi için gerekli olan çerezlerdir. Söz konusu çerezler kullanıcının talep etmiş olduğu bir bilgi toplumu hizmetinin yerine getirilmesi için zorunlu olarak kullanılmaktadır.",
  },
  {
    key: "performans" as const,
    title: "Performans ve Analiz İçin Gerekli Olan Çerezler",
    description:
      "Performans çerezleri, Platform ziyaret ve trafiğini takip ve analiz etmemizi ve bu analiz amacıyla istatistiki ölçüm yapmamızı sağlar. Bu çerezler sayesinde Platform üzerindeki alanlardan hangilerinin en sık ya da seyrek ziyaret edildiği gibi bilgileri edinebilir ve Platform’un trafiğini optimize edebiliriz. İlgili bilgi toplumu hizmetini açıkça talep etmediğiniz hallerde söz konusu olan çerezlerin ve üçüncü taraf analitik çerezlerinin kullanımı esnasında gerçekleştirdiğimiz veri işleme faaliyetleri için Kanun m.5 kapsamında, söz konusu olması halinde, açık rızanıza dayanmaktayız.",
  },
  {
    key: "hedefleme" as const,
    title: "Hedefleme ve Kişiselleştirilmiş Reklam Çerezleri",
    description:
      "Hedefleme ve kişiselleştirilmiş reklam çerezleri, sizlere Platform’da veya Platform haricindeki mecralarda görüntüleme geçmişinize ve ziyaretçi profilinize uygun olarak kişiselleştirilmiş ürün ve hizmet tanıtımı yapmak için kullanılır. Bu çerezlerin kullanımı esnasında gerçekleştirdiğimiz veri işleme faaliyetleri için Kanun m.5 kapsamında veri işleme şartı olarak “açık rızanıza” dayanmaktadır.",
  },
];

/** Cross-tab changes come through the storage event; nothing else writes this key. */
function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function readRaw() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function parse(raw: string | null): Preferences {
  if (!raw) return defaults;
  try {
    const parsed = JSON.parse(raw) as Partial<Preferences>;
    return { performans: Boolean(parsed.performans), hedefleme: Boolean(parsed.hedefleme) };
  } catch {
    return defaults;
  }
}

export function CookiePreferences() {
  const stored = useSyncExternalStore(
    subscribe,
    readRaw,
    () => null // sunucuda depolama yok: varsayılanlarla çizilir
  );

  // Kaydedilmemiş değişiklikler; kaydedilince tekrar depodaki değere dönülür.
  const [pending, setPending] = useState<Preferences | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const preferences = pending ?? parse(stored);

  function persist(next: Preferences) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Tarayıcı depolamaya izin vermiyor; tercih yalnızca bu sayfa açıkken geçerli olur.
    }
    setPending(next);
    setSaved(true);
  }

  return (
    <div className="mt-8">
      <div className="space-y-3">
        {groups.map((group) => {
          const expanded = open === group.key;
          const required = group.key === "zorunlu";
          const checked = required ? true : preferences[group.key];

          return (
            <div key={group.key} className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-3.5">
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : group.key)}
                  aria-expanded={expanded}
                  className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                >
                  <span
                    aria-hidden
                    className={`text-slate-400 transition ${expanded ? "rotate-180" : ""}`}
                  >
                    ▾
                  </span>
                  <span className="font-semibold text-brand-navy">{group.title}</span>
                </button>

                {required ? (
                  <span className="shrink-0 text-sm font-semibold text-purple-700">
                    Her Zaman Etkin
                  </span>
                ) : (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={checked}
                    aria-label={`${group.title} tercihi`}
                    onClick={() => {
                      setSaved(false);
                      setPending({ ...preferences, [group.key]: !checked });
                    }}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                      checked ? "bg-purple-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                        checked ? "left-[1.375rem]" : "left-0.5"
                      }`}
                    />
                  </button>
                )}
              </div>

              {expanded && (
                <p className="border-t border-slate-100 px-4 py-4 text-sm leading-relaxed text-slate-600">
                  {group.description}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
        {saved && (
          <span className="mr-auto text-sm text-emerald-700">Tercihleriniz kaydedildi.</span>
        )}
        <button
          type="button"
          onClick={() => persist(preferences)}
          className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Tercihlerimi Kaydet
        </button>
        <button
          type="button"
          onClick={() => persist({ performans: true, hedefleme: true })}
          className="rounded-full bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700"
        >
          Tümünü Kabul Et
        </button>
      </div>
    </div>
  );
}
