"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

/** Save the dragged order of one sidebar group; other groups keep theirs. */
export async function saveAdminNavOrderAction(group: string, hrefs: string[]) {
  await requireAdmin();
  const clean = hrefs.filter((h) => typeof h === "string" && h.startsWith("/admin")).slice(0, 50);
  const row = await prisma.siteSettings.findUnique({ where: { id: 1 }, select: { adminNavOrder: true } });
  const current = (row?.adminNavOrder ?? {}) as Record<string, string[]>;
  const next = { ...current, [group.slice(0, 40)]: clean };
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: { id: 1, adminNavOrder: next },
    update: { adminNavOrder: next },
  });
  revalidatePath("/admin", "layout");
}
