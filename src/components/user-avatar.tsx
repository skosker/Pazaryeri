"use client";

import { useState } from "react";

/**
 * A person's profile photo. Generated freelancer profiles point at /api/avatar/[seed],
 * which draws one; everyone else has no photo yet and gets the first letter of their
 * name, the way the app showed sellers before photos existed. That is also the fallback
 * when an image fails to load, so a broken URL never leaves an empty circle.
 *
 * Sizing comes from the caller: pass the height/width classes the surrounding layout
 * needs, plus a text size for the letter.
 */
export function UserAvatar({
  name,
  image,
  className = "",
  fallbackClassName = "bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-white",
}: {
  name: string;
  image?: string | null;
  className?: string;
  fallbackClassName?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!image || failed) {
    return (
      <span
        aria-hidden
        className={`flex items-center justify-center rounded-full font-semibold ${fallbackClassName} ${className}`}
      >
        {name.charAt(0)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={`rounded-full bg-slate-100 object-cover ${className}`}
    />
  );
}
