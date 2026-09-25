"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { saveAdminNavOrderAction } from "./nav-actions";

export type NavItem = { href: string; label: string };
export type NavGroup = { label: string | null; items: NavItem[] };

const isActive = (pathname: string, href: string) =>
  href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);

/**
 * The admin sidebar as a tree: each group opens and closes on click, and the group of the
 * page being shown starts open. Pages inside a group can be dragged up or down; the order
 * is saved for every admin.
 */
export function AdminNav({ groups: initial }: { groups: NavGroup[] }) {
  const pathname = usePathname();
  const [groups, setGroups] = useState(initial);
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      initial.filter((g) => g.label).map((g) => [g.label!, g.items.some((i) => isActive(pathname, i.href))])
    )
  );
  const [dragging, setDragging] = useState<{ group: string; href: string } | null>(null);
  const [, startTransition] = useTransition();

  // While dragging over another item of the same group, move the dragged one to its place.
  function moveOver(group: string, overHref: string) {
    if (!dragging || dragging.group !== group || dragging.href === overHref) return;
    setGroups((gs) =>
      gs.map((g) => {
        if (g.label !== group) return g;
        const items = [...g.items];
        const from = items.findIndex((i) => i.href === dragging.href);
        const to = items.findIndex((i) => i.href === overHref);
        if (from < 0 || to < 0) return g;
        const [moved] = items.splice(from, 1);
        items.splice(to, 0, moved);
        return { ...g, items };
      })
    );
  }

  function finishDrag() {
    if (!dragging) return;
    const group = groups.find((g) => g.label === dragging.group);
    setDragging(null);
    if (group?.label) {
      const hrefs = group.items.map((i) => i.href);
      startTransition(() => saveAdminNavOrderAction(group.label!, hrefs));
    }
  }

  const link = (item: NavItem, group: string | null) => {
    const active = isActive(pathname, item.href);
    const isDragged = dragging?.href === item.href;
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        draggable={group !== null}
        onDragStart={(e) => {
          if (!group) return;
          e.dataTransfer.effectAllowed = "move";
          setDragging({ group, href: item.href });
        }}
        onDragOver={(e) => {
          if (!group || dragging?.group !== group) return;
          e.preventDefault();
          moveOver(group, item.href);
        }}
        onDrop={(e) => e.preventDefault()}
        onDragEnd={finishDrag}
        className={`group/item flex items-center rounded-lg py-1.5 text-sm font-medium transition ${
          group ? "pl-7 pr-2" : "px-3"
        } ${active ? "bg-purple-50 text-purple-700" : "text-slate-600 hover:bg-slate-100 hover:text-brand-navy"} ${
          isDragged ? "opacity-40" : ""
        }`}
      >
        <span className="flex-1">{item.label}</span>
        {group && (
          <span
            className="cursor-grab text-slate-300 opacity-0 transition group-hover/item:opacity-100"
            title="Sürükleyerek sırala"
            aria-hidden
          >
            ⋮⋮
          </span>
        )}
      </Link>
    );
  };

  return (
    <nav className="flex flex-col gap-1">
      {groups.map((group) =>
        !group.label ? (
          <div key="genel">{group.items.map((i) => link(i, null))}</div>
        ) : (
          <div key={group.label}>
            <button
              type="button"
              aria-expanded={open[group.label]}
              onClick={() => setOpen((o) => ({ ...o, [group.label!]: !o[group.label!] }))}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wide text-slate-700 hover:bg-slate-100"
            >
              <svg
                className={`h-3 w-3 shrink-0 text-slate-400 transition-transform ${open[group.label] ? "rotate-90" : ""}`}
                viewBox="0 0 12 12"
                fill="currentColor"
                aria-hidden
              >
                <path d="M4 2.5 8 6l-4 3.5z" />
              </svg>
              {group.label}
              <span className="ml-auto text-[10px] font-semibold text-slate-400">{group.items.length}</span>
            </button>
            {open[group.label] && (
              <div className="relative mb-1 mt-0.5 flex flex-col gap-0.5 before:absolute before:bottom-1 before:left-[1.1rem] before:top-1 before:w-px before:bg-slate-200">
                {group.items.map((i) => link(i, group.label))}
              </div>
            )}
          </div>
        )
      )}
    </nav>
  );
}
