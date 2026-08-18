"use client";

import { useState } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { coverImageUrl } from "@/lib/cover-colors";
import { coverArt } from "@/lib/cover-art";

/**
 * Covers, in order of preference: the seller's upload, then a photo keyed to the gig
 * slug. Generated artwork sits underneath and shows through when a photo cannot be
 * fetched, so a blocked or slow image host never leaves a broken glyph on the card.
 */
export function GigCover({
  categoryIcon,
  gigSlug,
  coverImage,
  size,
  alt = "",
  imageClassName = "",
  iconClassName = "text-5xl",
}: {
  categoryIcon: string;
  gigSlug: string;
  coverImage?: string | null;
  size?: `${number}/${number}`;
  alt?: string;
  imageClassName?: string;
  iconClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  const art = coverArt(gigSlug);

  return (
    <>
      <div className="absolute inset-0 overflow-hidden" style={{ background: art.background }} aria-hidden>
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {art.shapes.map((shape, i) =>
            shape.kind === "circle" ? (
              <circle key={i} cx={shape.cx} cy={shape.cy} r={shape.r} fill={shape.fill} opacity={shape.opacity} />
            ) : shape.kind === "rect" ? (
              <rect
                key={i}
                x={shape.x}
                y={shape.y}
                width={shape.w}
                height={shape.h}
                fill={shape.fill}
                opacity={shape.opacity}
                transform={`rotate(${shape.rotate} 50 50)`}
              />
            ) : (
              <path key={i} d={shape.d} fill={shape.fill} opacity={shape.opacity} />
            )
          )}
        </svg>
        <span className="absolute inset-0 flex items-center justify-center opacity-80">
          <CategoryIcon icon={categoryIcon} className={iconClassName} />
        </span>
      </div>

      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverImage || coverImageUrl(gigSlug, size)}
          alt={alt}
          onError={() => setFailed(true)}
          className={`relative h-full w-full object-cover ${imageClassName}`}
          loading="lazy"
        />
      )}
    </>
  );
}
