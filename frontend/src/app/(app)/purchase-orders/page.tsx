"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { purchaseOrders, type PurchaseOrder } from "@/lib/procurement";
import { Button, Card, Table, Badge, EmptyState, StatCard, PageHeader, Breadcrumbs, SkeletonRows, Banner, Icon, useAsync, Input } from "@/components/ui";

const TONE: Record<string, string> = { DRAFT: "slate", SUBMITTED: "blue", PARTIALLY_RECEIVED: "amber", RECEIVED: "green", CANCELLED: "red" };

export default function POsPage() {
  const { data, loading, error, reload } = useAsync<PurchaseOrder[]>(() => purchaseOrders.list(), []);
  const pos = data ?? [];
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");

  const rows = useMemo(() => pos.filter((p) =>
    (!status || p.status === status) &&
    (!q || `${p.orderNumber} ${p.supplier?.name ?? ""}`.toLowerCase().includes(q.toLowerCase()))
  ), [pos, status, q]);

  const counts = useMemo(() => ({
    open: pos.filter((p) => p.status === "SUBMITTED" || p.status === "PARTIALLY_RECEIVED").length,
    draft: pos.filter((p) => p.status === "DRAFT").length,
    received: pos.filter((p) => p.status === "RECEIVED").length,
    value: pos.filter((p) => p.status !== "CANCELLED").reduce((s, p) => s + p.totalAmount, 0),
  }), [pos]);

  return (
    <div className="max-w-5xl mx-auto">
      <Breadcrumbs items={["Procurement", "Purchase Orders"]} />
      <PageHeader title="Purchase Orders" desc="Track buying from draft to receipt."
        action={<Link href="/purchase-orders/new" className="btn btn-primary"><Icon.plus /> New PO</Link>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard label="Open" value={counts.open} icon={<Icon.truck />} tone="blue" />
        <StatCard label="Draft" value={counts.draft} icon={<Icon.truck />} tone="slate" />
        <StatCard label="Received" value={counts.received} icon={<Icon.truck />} tone="green" />
        <StatCard label="Pipeline value" value={`$${counts.value.toLocaleString()}`} icon={<Icon.chart />} tone="amber" />
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-2 p-3 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-faint)" }}><Icon.search /></span>
            <Input placeholder="Search order # or supplier" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-1 flex-wrap">
            {["", "DRAFT", "SUBMITTED", "PARTIALLY_RECEIVED", "RECEIVED"].map((s) => (
              <button key={s} onClick={() => setStatus(s)} className="btn btn-sm"
                style={status === s ? { background: "var(--surface-2)", color: "var(--text)" } : { background: "transparent", color: "var(--text-muted)" }}>
                {s ? s.replace("_", " ") : "All"}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="p-4"><Banner>{error}</Banner></div>}

        {loading ? <Table head={["Order", "Supplier", "Status", "Received", "Total", ""]}><SkeletonRows cols={6} /></Table>
          : rows.length === 0 ? <EmptyState title="No purchase orders" desc="Raise your first PO against a supplier."
              action={<Link href="/purchase-orders/new" className="btn btn-primary"><Icon.plus /> New PO</Link>} />
            : <Table head={["Order", "Supplier", "Status", "Received", "Total", ""]}>
              {rows.map((p) => {
                const rec = p.lines.reduce((s, l) => s + l.receivedQty, 0);
                const ord = p.lines.reduce((s, l) => s + l.quantity, 0) || 1;
                return (
                  <tr key={p.id} className="row">
                    <td className="td">
                      <Link href={`/purchase-orders/${p.id}`} className="font-medium hover:underline">{p.orderNumber}</Link>
                      {p.isDropship && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>DROPSHIP</span>}
                    </td>
                    <td className="td" style={{ color: "var(--text-muted)" }}>{p.supplier?.name ?? "—"}</td>
                    <td className="td"><Badge tone={TONE[p.status] ?? "slate"}>{p.status.replace("_", " ")}</Badge></td>
                    <td className="td w-28">
                      <div className="h-1.5 rounded-full" style={{ background: "var(--surface-2)" }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, (rec / ord) * 100)}%`, background: "var(--primary)" }} />
                      </div>
                      <span className="text-xs" style={{ color: "var(--text-faint)" }}>{rec}/{ord}</span>
                    </td>
                    <td className="td">${p.totalAmount.toFixed(2)}</td>
                    <td className="td text-right"><Link href={`/purchase-orders/${p.id}`} className="btn btn-ghost btn-sm">Open</Link></td>
                  </tr>
                );
              })}
            </Table>}
      </Card>
    </div>
  );
}