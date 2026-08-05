"use client";

import { useActionState, useState } from "react";
import { submitReviewAction, type ReviewFormState } from "./actions";

const initialState: ReviewFormState = {};

export function ReviewForm({ orderId }: { orderId: string }) {
  const action = submitReviewAction.bind(null, orderId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [rating, setRating] = useState(5);

  return (
    <form action={formAction} className="rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="font-semibold text-brand-navy">Değerlendirme Bırak</h3>

      <div className="mt-3 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={`h-8 w-8 text-lg ${n <= rating ? "text-amber-400" : "text-slate-200"}`}
            aria-label={`${n} yıldız`}
          >
            ★
          </button>
        ))}
      </div>
      <input type="hidden" name="rating" value={rating} />

      <textarea
        name="comment"
        required
        minLength={5}
        rows={3}
        placeholder="Deneyimini paylaş"
        className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-purple-400"
      />

      {state.error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="brand-gradient mt-3 rounded-full px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Gönderiliyor..." : "Değerlendirmeyi Gönder"}
      </button>
    </form>
  );
}
