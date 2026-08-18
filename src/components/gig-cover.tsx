"use client";

import { useState } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { coverArt } from "@/lib/cover-art";

/**
 * Shows the seller's uploaded cover when there is one. Otherwise the listing gets
 * artwork generated from its slug — unique per gig, drawn locally, with no stock-photo
 * lookup that could repeat across listings or return unsuitable imagery.
 */
export function GigCover({
  categoryIcon,
  gigSlug,
  coverImage,
  alt = "",
  imageClassName = "",
  iconClassName = "text-5xl",
}: {
  categoryIcon: string;
  gigSlug: string;
  coverImage?: string | null;
  alt?: string;
  imageClassName?: string;
  iconClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  const art = coverArt(gigSlug);
  const showUpload = Boolean(coverImage) && !failed;

  return (
    <>
      <div className="absolute inset-0 overflow-hidden" style={{ background: art.background }} aria-hidden>
        {art.blobs.map((blob, i) => (
          <span
            key={i}
            className="absolute rounded-full blur-2xl"
            style={{
              left: blob.cx,
              top: blob.cy,
              width: blob.r,
              aspectRatio: "1",
              background: blob.color,
              opacity: 0.55,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
        <span className="absolute inset-0 flex items-center justify-center opacity-70">
          <CategoryIcon icon={categoryIcon} className={iconClassName} />
        </span>
      </div>

      {showUpload && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverImage as string}
          alt={alt}
          onError={() => setFailed(true)}
          className={`relative h-full w-full object-cover ${imageClassName}`}
          loading="lazy"
        />
      )}
    </>
  );
}
