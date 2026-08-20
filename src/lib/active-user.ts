import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/generated/prisma/client";

export type ActiveUser = { id: string; name: string; email: string; role: Role };

/**
 * The signed-in user as the database sees them right now, or null.
 *
 * Sessions here are JWTs: they carry whatever was true when the person signed in and go
 * on saying it until the token expires, which is weeks. Suspending an account or taking
 * its role away therefore has no effect on a session that is already open — the login
 * checks in auth.ts only run at login. Anything that acts on the caller's behalf has to
 * read the row to find out where they stand.
 *
 * Returns null when there is no session, when the account has been deleted, and when it
 * is suspended, so callers can treat all three the same way.
 */
export async function activeUser(): Promise<ActiveUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, suspended: true },
  });

  if (!user || user.suspended) return null;

  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

/** Message shown when a session outlives the account's right to use it. */
export const INACTIVE_MESSAGE =
  "Oturumun artık geçerli değil. Çıkış yapıp tekrar giriş yap; hesabın askıya alınmış olabilir.";
