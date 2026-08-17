"use client";

import { useState } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { coverGradientClass, coverImageUrl } from "@/lib/cover-colors";
import { getCategoryAccent } from "@/lib/category-style";

/**
 * Prefers the seller's uploaded cover and falls back to a third-party placeholder
 * photo when the gig has none. Either can fail — the host may be blocked,
 * rate-limited or simply slow — so the gradient and the watermarked category icon
 * are painted underneath and stay visible, which beats the broken-image glyph.
 */
export function GigCover({
  categorySlug,
  categoryIcon,
  gigSlug,
  coverColor,
  coverImage,
  size,
  alt = "",
  imageClassName = "",
  iconClassName = "text-5xl",
}: {
  categorySlug: string;
  categoryIcon: string;
  gigSlug: string;
  coverColor: string;
  coverImage?: string | null;
  size?: `${number}/${number}`;
  alt?: string;
  imageClassName?: string;
  iconClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  const accent = getCategoryAccent(categorySlug);

  return (
    <>
      <div
        className={`absolute inset-0 bg-gradient-to-br ${coverGradientClass(coverColor)}`}
        aria-hidden
      >
        <span className={`flex h-full w-full items-center justify-center ${accent.text} opacity-25`}>
          <CategoryIcon icon={categoryIcon} className={iconClassName} />
        </span>
      </div>

      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverImage || coverImageUrl(categorySlug, gigSlug, size)}
          alt={alt}
          onError={() => setFailed(true)}
          className={`relative h-full w-full object-cover ${imageClassName}`}
          loading="lazy"
        />
      )}
    </>
  );
}
