import { membershipSelect, membershipTier } from "@/lib/membership";
import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { toggleSuspensionAction, changeUserRoleAction, toggleProFreelancerAction } from "./actions";
import { DeleteUserButton } from "./delete-user-button";

const roleLabel: Record<string, string> = {
  BUYER: "Alıcı",
  FREELANCER: "Freelancer",
  ADMIN: "Admin",
};

const dateFmt = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });

const PAGE_SIZE = 50;

function toSingle(value: string | string[] | undefined): string {
  if (!value) return "";
  return Array.isArray(value) ? value[0] : value;
}

function pageHref(page: number, search: string, showGenerated: boolean): string {
  const params = new URLSearchParams();
  if (search) params.set("ara", search);
  if (showGenerated) params.set("uretilmis", "1");
  if (page > 1) params.set("sayfa", String(page));
  const qs = params.toString();
  return qs ? `/admin/kullanicilar?${qs}` : "/admin/kullanicilar";
}

/**
 * The generated showcase profiles outnumber the real accounts by a wide margin and
 * nothing here applies to them — they cannot log in, order or be suspended — so the
 * list holds real sign-ups only. ?uretilmis=1 still includes them for the rare case
 * where one needs looking at.
 */
export default async function AdminUsersPage(props: PageProps<"/admin/kullanicilar">) {
  const admin = await requireAdmin();
  const searchParams = await props.searchParams;
  const showGenerated = toSingle(searchParams.uretilmis) === "1";
  const search = toSingle(searchParams.ara).trim();
  const page = Math.max(1, Number(toSingle(searchParams.sayfa)) || 1);

  const where = {
    ...(showGenerated ? {} : { synthetic: false }),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const totalUsers = await prisma.user.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalUsers / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      name: true,
      role: true,
      suspended: true,
      ...membershipSelect,
      synthetic: true,
      emailVerified: true,
      importedOrderCount: true,
      createdAt: true,
      _count: { select: { gigs: true, ordersMade: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Kullanıcılar</h1>

      <form method="get" className="mt-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          name="ara"
          defaultValue={search}
          placeholder="İsim veya e-posta ara…"
          className="w-64 rounded-full border border-slate-300 px-4 py-2 text-sm outline-none focus:border-purple-400"
        />
        {showGenerated && <input type="hidden" name="uretilmis" value="1" />}
        <button
          type="submit"
          className="rounded-full bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700"
        >
          Ara
        </button>
        {search && (
          <Link
            href={showGenerated ? "/admin/kullanicilar?uretilmis=1" : "/admin/kullanicilar"}
            className="text-sm font-medium text-slate-500 hover:text-brand-navy"
          >
            Temizle
          </Link>
        )}
        <span className="ml-auto text-sm text-slate-400">
          {totalUsers === 0
            ? "0 kullanıcı"
            : `${(currentPage - 1) * PAGE_SIZE + 1}-${(currentPage - 1) * PAGE_SIZE + users.length} / ${totalUsers} kullanıcı`}
        </span>
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-5 py-3 font-medium">Kullanıcı</th>
              <th className="px-5 py-3 font-medium">Rol</th>
              <th className="px-5 py-3 font-medium">Durum</th>
              <th className="px-5 py-3 font-medium">İlan / Sipariş</th>
              <th className="px-5 py-3 font-medium">Kayıt Tarihi</th>
              <th className="px-5 py-3 font-medium text-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-slate-100 last:border-0">
                <td className="px-5 py-4">
                  <p className="font-medium text-brand-navy">
                    {user.name}
                    {user.synthetic && (
                      <span className="ml-1.5 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                        Üretilmiş
                      </span>
                    )}
                  </p>
                </td>
                <td className="px-5 py-4 text-slate-600">
                  <span>{roleLabel[user.role] ?? user.role}</span>
                  {user.role === "FREELANCER" && membershipTier(user) && (
                    <span className="ml-1.5 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      {membershipTier(user) === "PRO_PLUS" ? "Pro Plus" : "Pro"}
                    </span>
                  )}
                </td>
                <td className="px-5 py-4">
                  {user.suspended ? (
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                      Askıya Alındı
                    </span>
                  ) : !user.emailVerified ? (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      Doğrulanmadı
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Aktif
                    </span>
                  )}
                </td>
                <td className="px-5 py-4 text-slate-500">
                  {user._count.gigs} ilan ·{" "}
                  {user.importedOrderCount ?? user._count.ordersMade} sipariş
                </td>
                <td className="px-5 py-4 text-slate-500">{dateFmt.format(user.createdAt)}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Link
                      href={`/admin/kullanicilar/${user.id}`}
                      className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Detay
                    </Link>
                    {user.id === admin.id ? (
                      <p className="text-xs text-slate-400">Bu sensin</p>
                    ) : (
                      <>
                        <form
                          action={changeUserRoleAction.bind(null, user.id)}
                          className="flex items-center gap-1.5"
                        >
                          <select
                            name="role"
                            defaultValue={user.role}
                            className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-slate-600 focus:border-purple-400 focus:outline-none"
                          >
                            <option value="BUYER">Alıcı</option>
                            <option value="FREELANCER">Freelancer</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                          <button
                            type="submit"
                            className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                          >
                            Kaydet
                          </button>
                        </form>
                        <form action={toggleSuspensionAction.bind(null, user.id)}>
                          <button
                            type="submit"
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                              user.suspended
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "bg-red-50 text-red-600 hover:bg-red-100"
                            }`}
                          >
                            {user.suspended ? "Askıyı Kaldır" : "Askıya Al"}
                          </button>
                        </form>
                        {user.role === "FREELANCER" && (
                          <form action={toggleProFreelancerAction.bind(null, user.id)}>
                            <button
                              type="submit"
                              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                                user.isPro
                                  ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                  : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                              }`}
                            >
                              {user.isPro ? "Süresiz Pro Kaldır" : "Süresiz Pro Yap"}
                            </button>
                          </form>
                        )}
                        <DeleteUserButton
                          userId={user.id}
                          name={user.name}
                          gigCount={user._count.gigs}
                          orderCount={user._count.ordersMade}
                        />
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          {currentPage > 1 ? (
            <Link
              href={pageHref(currentPage - 1, search, showGenerated)}
              className="rounded-full border border-slate-300 px-4 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Önceki
            </Link>
          ) : (
            <span className="rounded-full border border-slate-200 px-4 py-1.5 text-sm font-semibold text-slate-300">
              Önceki
            </span>
          )}
          <span className="text-sm text-slate-500">
            Sayfa {currentPage} / {totalPages}
          </span>
          {currentPage < totalPages ? (
            <Link
              href={pageHref(currentPage + 1, search, showGenerated)}
              className="rounded-full border border-slate-300 px-4 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Sonraki
            </Link>
          ) : (
            <span className="rounded-full border border-slate-200 px-4 py-1.5 text-sm font-semibold text-slate-300">
              Sonraki
            </span>
          )}
        </div>
      )}
    </div>
  );
}
