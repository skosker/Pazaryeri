import { redirect } from "next/navigation";
import { activeUser } from "@/lib/active-user";

/**
 * Guards every admin screen and admin action.
 *
 * The role is read from the database rather than the session: a JWT keeps claiming the
 * role it was issued with, so taking someone's admin rights away would otherwise leave
 * them with a working admin session for as long as their token lasts.
 */
export async function requireAdmin() {
  const user = await activeUser();
  if (!user) redirect("/giris?callbackUrl=/admin");
  if (user.role !== "ADMIN") redirect("/panel");
  return user;
}
