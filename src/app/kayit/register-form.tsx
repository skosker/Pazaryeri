"use client";

import { useRef, useState, type ReactNode } from "react";
import { DocumentModal } from "@/components/document-modal";
import { useActionState } from "react";
import { registerAction, type FormState } from "./actions";

const initialState: FormState = {};

export function RegisterForm({
  role,
  documents,
}: {
  role: "BUYER" | "FREELANCER";
  /** The agreement texts, rendered on the server and shown in a pop-up. */
  documents: { uyelik: ReactNode; kullanim: ReactNode };
}) {
  const [state, formAction, pending] = useActionState(registerAction, initialState);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [corporate, setCorporate] = useState(false);
  const [openDoc, setOpenDoc] = useState<"uyelik" | "kullanim" | null>(null);
  const termsRef = useRef<HTMLInputElement>(null);
  const typed = state.values ?? {};
  const inputClass =
    "rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-purple-400";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {/* Chosen on the previous step; the account is created with this role. Either
          side can still switch later from the panel. */}
      <input type="hidden" name="role" value={role} />

      {role === "BUYER" && (
        <>
          <input type="hidden" name="accountType" value={corporate ? "KURUMSAL" : "BIREYSEL"} />
          <div className="grid grid-cols-2 gap-1 rounded-full bg-slate-100 p-1 text-sm font-semibold" role="tablist">
            {[
              { value: false, label: "Bireysel" },
              { value: true, label: "Kurumsal" },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                role="tab"
                aria-selected={corporate === option.value}
                onClick={() => setCorporate(option.value)}
                className={`rounded-full py-2 transition ${
                  corporate === option.value ? "bg-white text-brand-navy shadow-sm" : "text-slate-500"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}

      {corporate && (
        <>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
            Şirket Unvanı
            <input name="companyName" defaultValue={typed.companyName} type="text" required autoComplete="organization" placeholder="Örnek Teknoloji A.Ş." className={inputClass} />
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
              Vergi Dairesi
              <input name="taxOffice" defaultValue={typed.taxOffice} type="text" required placeholder="Kadıköy" className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
              Vergi Numarası
              <input
                name="taxNumber" defaultValue={typed.taxNumber}
                type="text"
                inputMode="numeric"
                required
                pattern="[0-9 ]{10,13}"
                placeholder="10 haneli VKN"
                className={inputClass}
              />
            </label>
          </div>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
            Fatura Adresi
            <textarea name="billingAddress" defaultValue={typed.billingAddress} required rows={2} autoComplete="street-address" placeholder="Mahalle, cadde, no, ilçe / il" className={inputClass} />
          </label>
        </>
      )}

      <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
        {corporate ? "Yetkili Ad Soyad" : "Ad Soyad"}
        <input
          name="name"
          defaultValue={typed.name}
          type="text"
          required
          autoComplete="name"
          placeholder="Adın Soyadın"
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-purple-400"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
        E-posta
        <input
          name="email"
          defaultValue={typed.email}
          type="email"
          required
          autoComplete="email"
          placeholder="ornek@eposta.com"
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-purple-400"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
        Şifre
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="En az 6 karakter, büyük/küçük harf ve rakam"
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-purple-400"
        />
      </label>

      <label className="flex items-start gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          name="acceptedTerms"
          ref={termsRef}
          required
          defaultChecked={typed.acceptedTerms === "on"}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-400"
        />
        <span>
          {/* Buttons, not links: the text opens over the form instead of in a new tab.
              preventDefault keeps the click from also toggling the checkbox. */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setOpenDoc("uyelik");
            }}
            className="font-semibold text-purple-700 hover:underline"
          >
            Üyelik Sözleşmesi
          </button>
          &apos;ni ve{" "}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setOpenDoc("kullanim");
            }}
            className="font-semibold text-purple-700 hover:underline"
          >
            Kullanım Şartları
          </button>
          &apos;nı okudum, kabul ediyorum.
        </span>
      </label>

      {openDoc && (
        <DocumentModal
          title={openDoc === "uyelik" ? "Üyelik Sözleşmesi" : "Kullanım Şartları"}
          onClose={() => setOpenDoc(null)}
          onAccept={() => {
            if (termsRef.current) termsRef.current.checked = true;
            setAcceptedTerms(true);
          }}
        >
          {openDoc === "uyelik" ? documents.uyelik : documents.kullanim}
        </DocumentModal>
      )}

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !acceptedTerms}
        className="brand-gradient mt-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Hesap oluşturuluyor..." : "Kayıt Ol"}
      </button>
    </form>
  );
}
