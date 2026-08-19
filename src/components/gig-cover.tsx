"use client";

import { useState } from "react";
import { coverArt } from "@/lib/cover-art";

/**
 * The seller's uploaded cover when there is one, otherwise a cover composed from the
 * category and the gig slug. Nothing is fetched for the composed case, so covers are
 * relevant to the category, distinct per listing and never wait on an image host.
 *
 * The emoji is sized in `cqh`, so it scales with whatever box the cover is placed in —
 * the 12rem card thumbnail and the 18rem detail-page header both get the same
 * proportions from one component.
 */
export function GigCover({
  categoryIcon,
  gigSlug,
  coverImage,
  alt = "",
  imageClassName = "",
}: {
  categoryIcon: string;
  gigSlug: string;
  coverImage?: string | null;
  alt?: string;
  imageClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  const art = coverArt(categoryIcon, gigSlug);
  const showUpload = Boolean(coverImage) && !failed;

  return (
    <>
      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden"
        style={{ background: art.background, containerType: "size" }}
        aria-hidden
      >
        <div
          className="absolute inset-0"
          style={{ backgroundImage: art.textureImage, backgroundSize: art.textureSize }}
        />
        {/* Soft halo so the emoji keeps its contrast whatever the gradient landed on. */}
        <div
          className="absolute"
          style={{
            width: "62cqh",
            height: "62cqh",
            borderRadius: "9999px",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.30), rgba(255,255,255,0.06) 62%, transparent 72%)",
          }}
        />
        <span
          className="relative leading-none"
          style={{ fontSize: "40cqh", filter: "drop-shadow(0 6px 14px rgba(15,23,42,0.35))" }}
        >
          {art.glyph}
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
