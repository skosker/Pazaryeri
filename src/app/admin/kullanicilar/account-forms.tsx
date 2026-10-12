import { changeUserRoleAction, setMembershipAction } from "./actions";
import { ADMIN_MEMBERSHIP_OPTIONS } from "./membership-options";

const select = "rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-600 focus:border-purple-400 focus:outline-none";
const button = "rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50";

/** Alıcı / Freelancer / Admin, saved with its own button. */
export function RoleForm({ userId, role, allowAdmin = true }: { userId: string; role: string; allowAdmin?: boolean }) {
  return (
    <form action={changeUserRoleAction.bind(null, userId)} className="flex items-center gap-1.5">
      <select name="role" defaultValue={role} aria-label="Rol" className={select}>
        <option value="BUYER">Alıcı</option>
        <option value="FREELANCER">Freelancer</option>
        {allowAdmin && <option value="ADMIN">Admin</option>}
      </select>
      <button type="submit" className={button}>Kaydet</button>
    </form>
  );
}

/** Pro / Pro Plus for a freelancer, set without payment (testing, goodwill, corrections). */
export function MembershipForm({ userId }: { userId: string }) {
  return (
    <form action={setMembershipAction.bind(null, userId)} className="flex items-center gap-1.5">
      <select name="membership" defaultValue="" required aria-label="Üyelik" className={select}>
        <option value="" disabled>Üyelik…</option>
        {Object.entries(ADMIN_MEMBERSHIP_OPTIONS).map(([key, o]) => (
          <option key={key} value={key}>{o.label}</option>
        ))}
      </select>
      <button type="submit" className={button}>Uygula</button>
    </form>
  );
}
