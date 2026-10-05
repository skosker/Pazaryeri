"use client";

/** Opens the browser's print dialog; "PDF olarak kaydet" there gives a file to send. */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 print:hidden"
    >
      Yazdır / PDF
    </button>
  );
}
