"use client";

import { useId, useRef, useState } from "react";

/** "Kadıköy" and "kadikoy" match: lower-cased the Turkish way, then without accents. */
function fold(text: string): string {
  return text
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/[âà]/g, "a")
    .replace(/[îì]/g, "i")
    .replace(/[ûù]/g, "u");
}

/**
 * A text box that only takes a value from `options`: type to filter, pick with the mouse
 * or the arrow keys and Enter. The chosen value is what the form submits (under `name`);
 * whatever is typed without picking is dropped when the box loses focus.
 */
export function Combobox({
  name,
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  className = "",
  emptyText = "Sonuç bulunamadı",
}: {
  name: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  emptyText?: string;
}) {
  const listId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const needle = fold(query.trim());
  const filtered = needle ? options.filter((option) => fold(option).includes(needle)) : options;

  function choose(option: string) {
    onChange(option);
    setOpen(false);
    setQuery("");
  }

  function move(step: number) {
    if (!open) setOpen(true);
    const next = Math.max(0, Math.min(filtered.length - 1, active + step));
    setActive(next);
    listRef.current?.children[next]?.scrollIntoView({ block: "nearest" });
  }

  return (
    <div className="relative">
      <input type="hidden" name={name} value={value} />
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        // Closed, the box shows the chosen value; open, what is being typed.
        value={open ? query : value}
        onFocus={() => {
          setQuery("");
          setActive(Math.max(0, options.indexOf(value)));
          setOpen(true);
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onBlur={() => {
          setOpen(false);
          setQuery("");
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            move(1);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            move(-1);
          } else if (e.key === "Enter" && open) {
            // Pick rather than submit the form half-filled.
            e.preventDefault();
            if (filtered[active]) choose(filtered[active]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className={`w-full pr-9 ${className} ${disabled ? "cursor-not-allowed bg-slate-50 text-slate-400" : ""}`}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">▾</span>

      {open && !disabled && (
        <ul
          id={listId}
          ref={listRef}
          role="listbox"
          className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-lg"
        >
          {filtered.length === 0 ? (
            <li className="px-4 py-2 text-slate-400">{emptyText}</li>
          ) : (
            filtered.map((option, i) => (
              <li
                key={option}
                role="option"
                aria-selected={option === value}
                // mousedown, not click: it lands before the input's blur closes the list.
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(option);
                }}
                onMouseEnter={() => setActive(i)}
                className={`cursor-pointer px-4 py-2 ${i === active ? "bg-purple-50 text-purple-800" : "text-slate-700"} ${
                  option === value ? "font-semibold" : ""
                }`}
              >
                {option}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
