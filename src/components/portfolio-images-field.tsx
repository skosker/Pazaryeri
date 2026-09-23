"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, MAX_PORTFOLIO_IMAGES } from "@/lib/image-constraints";

export function PortfolioImagesField({
  currentUrls = [],
  maxImages = MAX_PORTFOLIO_IMAGES,
  proMaxImages,
}: {
  currentUrls?: string[];
  maxImages?: number;
  /** The Pro limit, shown as an upgrade hint when it is higher than the seller's own. */
  proMaxImages?: number;
}) {
  const [removedUrls, setRemovedUrls] = useState<string[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      newPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const kept = currentUrls.filter((url) => !removedUrls.includes(url));
  const remainingSlots = Math.max(0, maxImages - kept.length - newPreviews.length);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    newPreviews.forEach((url) => URL.revokeObjectURL(url));
    setNewPreviews(files.slice(0, maxImages - kept.length).map((f) => URL.createObjectURL(f)));
  }

  function removeExisting(url: string) {
    setRemovedUrls((prev) => [...prev, url]);
  }

  function clearNewSelection() {
    if (inputRef.current) inputRef.current.value = "";
    newPreviews.forEach((url) => URL.revokeObjectURL(url));
    setNewPreviews([]);
  }

  return (
    <div className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
      Örnek işler
      <input type="hidden" name="removedPortfolio" value={removedUrls.join(",")} />
      <p className="text-xs font-normal text-slate-400">
        Yorumun henüz olmadığı ilanlarda alıcıya en çok güven veren şey daha önce yaptığın
        işlerdir — en fazla {maxImages} görsel ekleyebilirsin.
        {proMaxImages !== undefined && maxImages < proMaxImages && (
          <>
            {" "}
            <Link href="/panel/pro-ol" className="font-medium text-purple-700 hover:underline">
              Pro üyeler {proMaxImages} görsel ekleyebilir.
            </Link>
          </>
        )}
      </p>

      {(kept.length > 0 || newPreviews.length > 0) && (
        <div className="mt-1 flex flex-wrap gap-3">
          {kept.map((url) => (
            <div key={url} className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeExisting(url)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white hover:bg-black/80"
                aria-label="Görseli kaldır"
              >
                ×
              </button>
            </div>
          ))}
          {newPreviews.map((url) => (
            <div key={url} className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-purple-200 bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <span className="absolute bottom-1 left-1 rounded bg-purple-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                Yeni
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2 flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          name="portfolio"
          multiple
          accept={ALLOWED_IMAGE_TYPES.join(",")}
          onChange={onPick}
          disabled={remainingSlots === 0 && newPreviews.length === 0}
          className="text-sm font-normal text-slate-600 file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-purple-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-purple-700 hover:file:bg-purple-100"
        />
        {newPreviews.length > 0 && (
          <button
            type="button"
            onClick={clearNewSelection}
            className="text-xs font-semibold text-slate-500 underline hover:text-red-600"
          >
            Seçimi temizle
          </button>
        )}
      </div>
      <p className="text-xs font-normal text-slate-400">
        JPG, PNG veya WebP · en fazla {MAX_IMAGE_BYTES / 1024 / 1024} MB.
      </p>
    </div>
  );
}
