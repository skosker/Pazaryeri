"use client";

import { useEffect, useRef, useState } from "react";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/image-constraints";

export function CoverImageField({ currentUrl }: { currentUrl?: string | null }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Object URLs leak until revoked, so tie each one to the life of the preview.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const shown = preview ?? (removed ? null : (currentUrl ?? null));

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return file ? URL.createObjectURL(file) : null;
    });
    if (file) setRemoved(false);
  }

  function clear() {
    if (inputRef.current) inputRef.current.value = "";
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return null;
    });
    setRemoved(true);
  }

  return (
    <div className="flex flex-col gap-1.5 text-sm font-medium text-brand-navy">
      Kapak görseli
      {/* Tells the server to drop an existing cover when the seller removed it
          without picking a replacement. */}
      {removed && !preview && <input type="hidden" name="removeCover" value="1" />}
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shown} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xs font-normal text-slate-400">
              Görsel yok
            </span>
          )}
        </div>

        <div className="flex flex-col items-start gap-2">
          <input
            ref={inputRef}
            type="file"
            name="cover"
            accept={ALLOWED_IMAGE_TYPES.join(",")}
            onChange={onPick}
            className="text-sm font-normal text-slate-600 file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-purple-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-purple-700 hover:file:bg-purple-100"
          />
          <p className="text-xs font-normal text-slate-400">
            JPG, PNG veya WebP · en fazla {MAX_IMAGE_BYTES / 1024 / 1024} MB. Boş bırakırsan
            kategori deseni kullanılır.
          </p>
          {shown && (
            <button
              type="button"
              onClick={clear}
              className="text-xs font-semibold text-slate-500 underline hover:text-red-600"
            >
              Görseli kaldır
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
