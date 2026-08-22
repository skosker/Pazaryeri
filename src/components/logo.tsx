import Link from "next/link";

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="prosinta-p" x1="4" y1="2" x2="44" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#e879f9" />
          <stop offset="0.5" stopColor="#9333ea" />
          <stop offset="1" stopColor="#4338ca" />
        </linearGradient>
        <linearGradient id="prosinta-fold" x1="2" y1="24" x2="26" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#c4b5fd" />
          <stop offset="1" stopColor="#312e81" />
        </linearGradient>
      </defs>
      <path
        d="M14 4h14a11 11 0 0 1 0 22H19v-8h9a3 3 0 0 0 0-6H18a4 4 0 0 0-4 4v9L4 35V15A11 11 0 0 1 14 4Z"
        fill="url(#prosinta-p)"
      />
      <path d="M14 26v9L4 44v-9l10-9Z" fill="url(#prosinta-fold)" />
    </svg>
  );
}

export function Logo({
  withText = true,
  size = 30,
  textClassName = "text-brand-navy",
}: {
  withText?: boolean;
  size?: number;
  textClassName?: string;
}) {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0">
      <LogoMark size={size} />
      {withText && (
        <span className={`text-xl font-extrabold tracking-tight ${textClassName}`}>Prosinta</span>
      )}
    </Link>
  );
}
