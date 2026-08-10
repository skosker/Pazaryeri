"use client";

import { useActionState } from "react";
import { becomeFreelancerAction, type FormState } from "./actions";

const initialState: FormState = {};

export function BecomeFreelancerForm() {
  const [state, formAction, pending] = useActionState(becomeFreelancerAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
        Unvan
        <input
          name="title"
          required
          placeholder="ör. Grafik Tasarımcı"
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-purple-400"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
        Hakkımda
        <textarea
          name="bio"
          rows={4}
          placeholder="Kendinden ve uzmanlığından kısaca bahset"
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-purple-400"
        />
      </label>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="brand-gradient self-start rounded-full px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Kaydediliyor..." : "Freelancer Ol"}
      </button>
    </form>
  );
}
