import { putImage } from "@/lib/storage";
import { validateImage } from "@/lib/image-constraints";

/**
 * Reads the cover picker out of a gig form.
 *
 * `coverImage` is deliberately three-valued: a string replaces the cover, `null`
 * clears it, and `undefined` means the seller did not touch it — so an edit that
 * only changes the price leaves the existing cover alone.
 */
export async function readCoverFromForm(
  formData: FormData
): Promise<{ coverImage?: string | null; error?: string }> {
  const file = formData.get("cover");

  if (file instanceof File && file.size > 0) {
    const invalid = validateImage(file);
    if (invalid) return { error: invalid.error };
    return { coverImage: await putImage(file) };
  }

  if (formData.get("removeCover") === "1") return { coverImage: null };

  return {};
}
