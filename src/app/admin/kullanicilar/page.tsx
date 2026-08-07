import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { toggleSuspensionAction, changeUserRoleAction } from "./actions";

const roleLabel: Record<string, string> = {
  BUYER: "Alıcı",
  FREELANCER: "Freelancer",
  ADMIN: "Admin",
};

export default async function AdminUsersPage() {
  const admin = await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      suspended: true,
      emailVerified: true,
      createdAt: true,
      _count: { select: { gigs: true, ordersMade: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Kullanıcılar</h1>
      <p className="mt-1 text-sm text-slate-500">{users.length} kayıtlı kullanıcı.</p>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-5 py-3 font-medium">Kullanıcı</th>
              <th className="px-5 py-3 font-medium">Rol</th>
              <th className="px-5 py-3 font-medium">Durum</th>
              <th className="px-5 py-3 font-medium">İlan / Sipariş</th>
              <th className="px-5 py-3 font-medium text-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-slate-100 last:border-0">
                <td className="px-5 py-4">
                  <p className="font-medium text-brand-navy">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </td>
                <td className="px-5 py-4 text-slate-600">{roleLabel[user.role] ?? user.role}</td>
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
                  {user._count.gigs} ilan · {user._count.ordersMade} sipariş
                </td>
                <td className="px-5 py-4">
                  {user.id === admin.id ? (
                    <p className="text-right text-xs text-slate-400">Bu sensin</p>
                  ) : (
                    <div className="flex flex-wrap items-center justify-end gap-2">
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
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
