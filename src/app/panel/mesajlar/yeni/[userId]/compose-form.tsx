"use client";

import { useActionState } from "react";
import { startConversationAction, type ComposeState } from "../../actions";

const initialState: ComposeState = {};

export function ComposeForm({
  otherId,
  orderId,
  prefill,
}: {
  otherId: string;
  orderId: string | null;
  prefill: string;
}) {
  const [state, formAction, pending] = useActionState(
    startConversationAction.bind(null, otherId, orderId),
    initialState
  );

  return (
    <form action={formAction} className="rounded-2xl border border-slate-200 bg-white p-5">
      <label htmlFor="compose-body" className="text-sm font-medium text-brand-navy">
        Mesajın
      </label>
      <textarea
        id="compose-body"
        name="body"
        required
        maxLength={2000}
        rows={6}
        defaultValue={prefill}
        autoFocus
        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-purple-400"
        placeholder="Ne yaptırmak istediğini, bütçeni ve zamanlamanı kısaca anlat."
      />
      {state.error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="brand-gradient mt-4 min-h-[44px] rounded-full px-6 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Gönderiliyor…" : "Mesajı Gönder"}
      </button>
    </form>
  );
}
