"use client";

/** A dropdown filter that applies itself: choosing an option submits the surrounding GET form. */
export function FilterSelect({
  name,
  value,
  options,
}: {
  name: string;
  value: string;
  options: { value: string; label: string }[];
}) {
  const active = value !== "";
  return (
    <div className="relative">
      <select
        name={name}
        defaultValue={value}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className={`appearance-none rounded-full border py-2 pl-4 pr-9 text-sm outline-none focus:border-purple-400 ${
          active ? "border-purple-300 bg-purple-50 font-semibold text-purple-800" : "border-slate-300 bg-white text-slate-600"
        }`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">▾</span>
    </div>
  );
}
