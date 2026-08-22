import { looksFeminine } from "@/lib/turkish-names";

/**
 * The address of a profile's drawn avatar.
 *
 * Two things need it and they must agree: the generator, which writes it when a profile
 * is created, and the revert in profile-photos.ts, which puts it back when the fetched
 * photographs are dropped. Deriving it from the name and the e-mail — rather than storing
 * it — keeps the two in step without another column to migrate.
 *
 * The shapes are fixed, because these URLs are written into migrations:
 *   generated profiles  uzman42@…  →  /api/avatar/k-elif-yildirim-42
 *   older demo sellers  fl121@…    →  /api/avatar/e-ahmet-a-fl121
 * The generated ones are numbered by their own index; the older ones carry the local part
 * of the address, because several of them share a display name.
 *
 * The "k-"/"e-" prefix tells the drawing which face to compose (see avatar-art.ts). A name
 * in neither list gets no prefix and the drawing picks for itself.
 */

/** ASCII form of a name, so avatar URLs stay readable and path-safe. */
export function slugifyName(name: string) {
  return name
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function drawnAvatarUrl(name: string, email: string) {
  const feminine = looksFeminine(name.split(" ")[0]);
  const prefix = feminine === null ? "" : feminine ? "k-" : "e-";
  const handle = email.split("@")[0];
  const generatedIndex = handle.match(/^uzman(\d+)$/)?.[1];

  return `/api/avatar/${prefix}${slugifyName(name)}-${generatedIndex ?? handle}`;
}
