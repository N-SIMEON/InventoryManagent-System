"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { suppliers, type Supplier } from "@/lib/procurement";
import { Button, Card, Table, Badge, EmptyState, StatCard, SlideOver, Field, Input, Textarea, PageHeader, Breadcrumbs, SkeletonRows, Banner, Icon, useAsync } from "@/components/ui";

const blank = { name: "", contactEmail: "", contactPhone: "", address: "" };

export default function SuppliersPage() {
  const { data, loading, error, reload } = useAsync<Supplier[]>(() => suppliers.list(), []);
  const list = data ?? [];
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState("");

  const rows = useMemo(() => list.filter((s) => {
    const okQ = !q || `${s.name} ${s.contactEmail ?? ""}`.toLowerCase().includes(q.toLowerCase());
    const okF = filter === "all" || (filter === "active" ? s.isActive : !s.isActive);
    return okQ && okF;
  }), [list, q, filter]);

  const counts = useMemo(() => ({
    total: list.length,
    active: list.filter((s) => s.isActive).length,
    inactive: list.filter((s) => !s.isActive).length,
    withEmail: list.filter((s) => s.contactEmail).length,
  }), [list]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault(); setFormErr("");
    if (!form.name.trim()) return setFormErr("Supplier name is required.");
    setSaving(true);
    try {
      await suppliers.create(form);
      setOpen(false); setForm(blank); reload();
    } catch (err: any) { setFormErr(err.message); }
    finally { setSaving(false); }
  };

  const deactivate = async (id: string) => {
    try { await suppliers.deactivate(id); reload(); }
    catch (err: any) { alert(err.message); }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Breadcrumbs items={["Procurement", "Suppliers"]} />
      <PageHeader title="Suppliers" desc="Vendors you buy from. Every supplier is scoped to your tenant."
        action={<Button onClick={() => setOpen(true)}><Icon.plus /> Add supplier</Button>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard label="Total" value={counts.total} icon={<Icon.users />} tone="blue" />
        <StatCard label="Active" value={counts.active} icon={<Icon.users />} tone="green" />
        <StatCard label="Inactive" value={counts.inactive} icon={<Icon.users />} tone="slate" />
        <StatCard label="With email" value={counts.withEmail} icon={<Icon.users />} tone="amber" />
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-2 p-3 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-faint)" }}><Icon.search /></span>
            <Input placeholder="Search by name or email" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-1">
            {(["all", "active", "inactive"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className="btn btn-sm"
                style={filter === f ? { background: "var(--surface-2)", color: "var(--text)" } : { background: "transparent", color: "var(--text-muted)" }}>
                {f[0].toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="p-4"><Banner>{error}</Banner></div>}

        {loading ? (
          <Table head={["Supplier", "Contact", "Status", "Actions"]}><SkeletonRows cols={4} /></Table>
        ) : rows.length === 0 ? (
          <EmptyState
            title={q || filter !== "all" ? "No suppliers match" : "No suppliers yet"}
            desc={q || filter !== "all" ? "Try clearing the search or filter." : "Add your first vendor to start raising purchase orders against them."}
            action={!q && filter === "all" ? <Button onClick={() => setOpen(true)}><Icon.plus /> Add supplier</Button> : undefined} />
        ) : (
          <Table head={["Supplier", "Contact", "Status", "Actions"]}>
            {rows.map((s) => (
              <tr key={s.id} className="row">
                <td className="td"><span className="font-medium">{s.name}</span></td>
                <td className="td" style={{ color: "var(--text-muted)" }}>
                  <div>{s.contactEmail || "—"}</div>
                  <div className="text-xs" style={{ color: "var(--text-faint)" }}>{s.contactPhone || s.address || ""}</div>
                </td>
                <td className="td"><Badge tone={s.isActive ? "green" : "slate"}>{s.isActive ? "Active" : "Inactive"}</Badge></td>
                <td className="td text-right">
                  <div className="inline-flex gap-1">
                    <Link href={`/purchase-orders/new?supplier=${s.id}`} className="btn btn-ghost btn-sm">New PO</Link>
                    {s.isActive && <button onClick={() => deactivate(s.id)} className="btn btn-ghost btn-sm" style={{ color: "var(--red)" }}>Deactivate</button>}
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
        {!loading && rows.length > 0 && (
          <div className="px-4 py-3 text-xs border-t" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
            Showing {rows.length} of {list.length}
          </div>
        )}
      </Card>

      <SlideOver open={open} onClose={() => setOpen(false)} title="Add supplier"
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={create} disabled={saving}>{saving ? "Saving…" : "Create supplier"}</Button></>}>
        {formErr && <Banner>{formErr}</Banner>}
        <Field label="Supplier name *"><Input autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Acme Industrial" /></Field>
        <Field label="Contact email"><Input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} placeholder="sales@acme.com" /></Field>
        <Field label="Contact phone"><Input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} placeholder="555-0199" /></Field>
        <Field label="Address"><Textarea rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Factory Lane" /></Field>
      </SlideOver>
    </div>
  );
}