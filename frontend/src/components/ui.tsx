"use client";
import React, { useEffect, useState } from "react";

export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/* ---------- Icons ---------- */
export const Icon = {
  plus: (p: any) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M12 5v14M5 12h14"/></svg>,
  search: (p: any) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>,
  box: (p: any) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M21 8 12 3 3 8v8l9 5 9-5Z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg>,
  truck: (p: any) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M1 3h15v13H1zM16 8h4l3 3v5h-7"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  users: (p: any) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>,
  chart: (p: any) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/></svg>,
  settings: (p: any) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.3 1a7 7 0 0 0-1.7-1l-.3-2.5h-4l-.3 2.5a7 7 0 0 0-1.7 1l-2.3-1-2 3.4L5 11a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 1.7 1l.3 2.5h4l.3-2.5a7 7 0 0 0 1.7-1l2.3 1 2-3.4-2-1.5c.1-.3.1-.7.1-1Z"/></svg>,
  logout: (p: any) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
  close: (p: any) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M18 6 6 18M6 6l12 12"/></svg>,
  inbox: (p: any) => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.5 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.5A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.5Z"/></svg>,
  chevron: (p: any) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="m6 9 6 6 6-6"/></svg>,
  sun:     (p: any) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>,
  moon:    (p: any) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>,
  check:   (p: any) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M20 6 9 17l-5-5"/></svg>,
};

/* ---------- Form ---------- */
export function Button({ variant = "primary", size, className, children, ...rest }: any) {
  return <button className={cn("btn", `btn-${variant}`, size === "sm" && "btn-sm", className)} {...rest}>{children}</button>;
}
export function Input({ className, ...rest }: any) { return <input className={cn("input", className)} {...rest} />; }
export function Select({ className, children, ...rest }: any) { return <select className={cn("input", className)} {...rest}>{children}</select>; }
export function Textarea({ className, ...rest }: any) { return <textarea className={cn("input", className)} {...rest} />; }
export function Field({ label, hint, children }: any) {
  return <div><label className="label">{label}</label>{children}{hint && <p className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>{hint}</p>}</div>;
}

/* ---------- Surfaces ---------- */
export function Card({ className, children }: any) { return <div className={cn("card", className)}>{children}</div>; }
export function Badge({ tone = "slate", children }: any) {
  const map: any = { green: ["var(--green)", "var(--green-bg)"], amber: ["var(--amber)", "var(--amber-bg)"], red: ["var(--red)", "var(--red-bg)"], blue: ["var(--primary)", "var(--surface-2)"], slate: ["var(--slate)", "var(--slate-bg)"] };
  const [fg, bg] = map[tone] || map.slate;
  return <span className="badge" style={{ color: fg, background: bg }}><span className="dot" style={{ background: fg }} />{children}</span>;
}
export function StatCard({ label, value, sub, icon, tone = "blue" }: any) {
  const map: any = { blue: "var(--primary)", green: "var(--green)", amber: "var(--amber)", red: "var(--red)", slate: "var(--slate)" };
  return (
    <Card className="p-4 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "var(--surface-2)", color: map[tone] }}>{icon}</div>
      <div><p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p><p className="text-xl font-semibold leading-tight">{value}</p>{sub && <p className="text-xs" style={{ color: "var(--text-faint)" }}>{sub}</p>}</div>
    </Card>
  );
}

/* ---------- Page chrome ---------- */
export function PageHeader({ title, desc, action }: any) {
  return <div className="flex items-start justify-between gap-4 mb-5"><div><h1 className="text-2xl font-semibold tracking-tight">{title}</h1>{desc && <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{desc}</p>}</div>{action}</div>;
}
export function Breadcrumbs({ items }: { items: string[] }) {
  return <nav className="text-xs mb-3 flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>{items.map((t, i) => <span key={i} className="flex items-center gap-1.5">{i > 0 && <span style={{ color: "var(--text-faint)" }}>/</span>}<span className={i === items.length - 1 ? "font-medium" : ""} style={{ color: i === items.length - 1 ? "var(--text)" : undefined }}>{t}</span></span>)}</nav>;
}
export function EmptyState({ title, desc, action }: any) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}><Icon.inbox /></div>
      <p className="font-medium">{title}</p>
      {desc && <p className="text-sm mt-1 max-w-sm" style={{ color: "var(--text-muted)" }}>{desc}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ---------- Table ---------- */
export function Table({ head, children }: any) {
  return <div className="overflow-x-auto"><table className="w-full border-collapse"><thead><tr>{head.map((h: string) => <th key={h} className="th">{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}
export function SkeletonRows({ cols = 5, rows = 5 }: any) {
  return <>{Array.from({ length: rows }).map((_, i) => <tr key={i}>{Array.from({ length: cols }).map((__, j) => <td key={j} className="td"><div className="skeleton" style={{ height: 14, width: j === 0 ? "60%" : "40%" }} /></td>)}</tr>)}</>;
}

/* ---------- Slide-over (forms live here, not inline) ---------- */
export function SlideOver({ open, onClose, title, children, footer }: any) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0" style={{ background: "rgba(15,23,42,.4)" }} onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md flex flex-col" style={{ background: "var(--surface)", borderLeft: "1px solid var(--border)", boxShadow: "-8px 0 24px rgba(16,24,40,.12)", animation: "slidein .2s ease" }}>
        <style>{`@keyframes slidein{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="font-semibold">{title}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><Icon.close /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">{children}</div>
        {footer && <div className="px-5 py-4 flex justify-end gap-2" style={{ borderTop: "1px solid var(--border)" }}>{footer}</div>}
      </div>
    </div>
  );
}

/* ---------- Banner (errors) ---------- */
/* ---------- Banner (errors) ---------- */
export function Banner({ tone = "red", children }: any) {
  const map: Record<string, [string, string]> = {
    red:   ["var(--red-bg)",    "var(--red)"],
    green: ["var(--green-bg)",  "var(--green)"],
    amber: ["var(--amber-bg)",  "var(--amber)"],
    blue:  ["var(--surface-2)", "var(--primary)"],
    slate: ["var(--slate-bg)",  "var(--slate)"],
  };
  const [bg, fg] = map[tone] ?? map.red;   // ← fallback: unknown tone can never crash the app
  return (
    <div className="text-sm px-3 py-2 rounded-lg mb-3" style={{ background: bg, color: fg }}>
      {children}
    </div>
  );
}
/* ---------- useAsync helper ---------- */
export function useAsync<T>(fn: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const run = () => { setLoading(true); setError(""); fn().then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false)); };
  useEffect(run, deps);
  return { data, loading, error, reload: run };
}