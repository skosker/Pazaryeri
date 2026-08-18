"use client";

import { useState } from "react";
import { coverArt, COVER_VIEWBOX } from "@/lib/cover-art";

/**
 * The seller's uploaded cover when there is one, otherwise artwork drawn from the
 * category and the gig slug. Nothing is fetched for the generated case, so covers are
 * relevant to the category, distinct per listing and never wait on an image host.
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
      <div className="absolute inset-0" style={{ background: art.background }} aria-hidden>
        <svg
          className="h-full w-full"
          viewBox={COVER_VIEWBOX}
          preserveAspectRatio="xMidYMid slice"
        >
          {art.prims.map((p, i) =>
            p.t === "rect" ? (
              <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} rx={p.rx} fill={p.fill} opacity={p.o ?? 1} />
            ) : p.t === "circle" ? (
              <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill={p.fill} opacity={p.o ?? 1} />
            ) : (
              <path
                key={i}
                d={p.d}
                fill={p.fill ?? "none"}
                stroke={p.stroke}
                strokeWidth={p.sw}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={p.o ?? 1}
              />
            )
          )}
        </svg>
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
