"use client";

import { useActionState } from "react";
import type { FormState } from "./actions";

const initialState: FormState = {};

export function CreateCategoryForm({
  action,
  iconOptions,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  iconOptions: string[];
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Ad</label>
        <input
          name="name"
          required
          placeholder="ör. Grafik Tasarım"
          className="w-56 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-purple-400"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">İkon</label>
        <select
          name="icon"
          defaultValue="sparkles"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 outline-none focus:border-purple-400"
        >
          {iconOptions.map((icon) => (
            <option key={icon} value={icon}>
              {icon}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="brand-gradient rounded-full px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Ekleniyor..." : "Ekle"}
      </button>
      {state.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
