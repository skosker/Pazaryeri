import { avatarSvg } from "@/lib/avatar-art";

/**
 * Serves the drawn profile photo for a seed. This is what `User.image` points at for
 * generated freelancer profiles, and it is what makes a thousand of them cheap: the
 * picture is composed on the fly from the seed, so nothing is stored per profile.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ seed: string }> }) {
  const { seed } = await params;

  return new Response(avatarSvg(seed), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      // The drawing is a pure function of the seed, so a given URL never changes.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
