"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon, Button } from "./ui";
import { clearToken } from "@/lib/api";

export default function Topbar() {
  const router = useRouter();
  const [dark, setDark] = useState(false);
  const toggle = () => { const d = !dark; setDark(d); document.documentElement.classList.toggle("dark", d); };
  return (
    <header className="h-14 shrink-0 border-b flex justify-between items-center gap-3 px-4 md:px-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="relative flex-1 max-w-md">
        <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-faint)" }}><Icon.search /></span>
        <input placeholder="Search suppliers, POs…" className="input pl-9" />
      </div>
      <Button variant="ghost" size="sm" onClick={toggle} title="Toggle theme">{dark ? "☀" : "☾"}</Button>
      <div className="flex items-center">
        <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ background: "var(--primary)" }}>B</div>
        <div className="hidden sm:block leading-tight"><p className="text-sm font-medium">Bruce</p><p className="text-xs" style={{ color: "var(--text-muted)" }}>owner</p></div>
      </div>
      <Button variant="ghost" size="sm" onClick={() => { clearToken(); router.replace("/login"); }}><Icon.logout /></Button>
    </header>
  );
}