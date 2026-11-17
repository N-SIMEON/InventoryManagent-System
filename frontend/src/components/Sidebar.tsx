"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./ui";

const NAV = [
  { group: "Procurement", items: [
    { href: "/suppliers", label: "Suppliers", icon: Icon.users },
    { href: "/purchase-orders", label: "Purchase Orders", icon: Icon.truck },
  ]},
  { group: "Catalog & Stock", items: [
    { href: "/products", label: "Products", icon: Icon.box, soon: true },
    { href: "/stock", label: "Stock", icon: Icon.chart, soon: true },
  ]},
  { group: "Sales", items: [
    { href: "/sales-orders", label: "Sales Orders", icon: Icon.truck, soon: true },
  ]},
  { group: "Workspace", items: [
    { href: "/settings", label: "Settings", icon: Icon.settings, soon: true },
  ]},
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="flex items-center gap-2 px-5 h-14 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex h-7 w-7 items-center justify-center rounded-md text-white font-bold text-sm" style={{ background: "var(--primary)" }}>I</div>
        <span className="font-semibold text-sm">Inventory<span style={{ color: "var(--text-muted)" }}>·Procure</span></span>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV.map((g) => (
          <div key={g.group}>
            <p className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>{g.group}</p>
            <div className="space-y-0.5">
              {g.items.map((it: any) => {
                const active = pathname.startsWith(it.href);
                const I = it.icon;
                return (
                  <Link key={it.href} href={it.soon ? "#" : it.href} onClick={(e) => it.soon && e.preventDefault()}
                    className={cnLink(active, it.soon)}>
                    <I className="opacity-80" /> {it.label}
                    {it.soon && <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--surface-2)", color: "var(--text-faint)" }}>soon</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="p-3 border-t text-xs" style={{ borderColor: "var(--border)", color: "var(--text-faint)" }}>v0.1 · Phase 2</div>
    </aside>
  );
}
function cnLink(active: boolean, soon?: boolean) {
  return ["flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition", soon ? "opacity-50 cursor-not-allowed" : "hover:bg-[var(--surface-2)]", active ? "text-[var(--primary)]" : "text-[var(--text-muted)]"]
    .filter(Boolean).join(" ") + (active ? " bg-[var(--surface-2)]" : "");
}