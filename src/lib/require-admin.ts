import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/panel");
  return session.user;
}
