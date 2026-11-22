"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./ui";
import { getRole, endSession } from "@/lib/session";

export default function Topbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [role, setRole] = useState("member");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    setRole(getRole());
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("mousedown", onClick); window.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <header className="h-14 shrink-0 border-b flex items-center gap-3 px-4 md:px-6"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="relative flex-1 max-w-md">
        <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-faint)" }}><Icon.search /></span>
        <input placeholder="Search suppliers, POs…" className="input pl-9" />
      </div>

      <div className="relative ml-auto" ref={ref}>
        <button onClick={() => setOpen(o => !o)} aria-haspopup="menu" aria-expanded={open}
          className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-[var(--surface-2)] transition">
          <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0"
            style={{ background: "var(--primary)" }}>B</div>
          <div className="hidden sm:block leading-tight text-left">
            <p className="text-sm font-medium">Bruce</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{role}</p>
          </div>
          <span className={`transition-transform ${open ? "rotate-180" : ""}`} style={{ color: "var(--text-faint)" }}><Icon.chevron /></span>
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-64 card p-1.5 z-50" role="menu" style={{ boxShadow: "0 8px 24px rgba(16,24,40,.14)" }}>
            <div className="px-3 py-2 border-b mb-1" style={{ borderColor: "var(--border)" }}>
              <p className="text-sm font-medium">Bruce</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{role} · current tenant</p>
            </div>
            <button onClick={() => { const d = !dark; setDark(d); document.documentElement.classList.toggle("dark", d); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-[var(--surface-2)]">
              {dark ? <Icon.sun /> : <Icon.moon />} Dark mode
            </button>
            <div className="my-1 border-t" style={{ borderColor: "var(--border)" }} />
            <button onClick={endSession} className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-[var(--surface-2)]" style={{ color: "var(--red)" }}>
              <Icon.logout /> Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}