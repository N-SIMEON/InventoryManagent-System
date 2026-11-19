"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { purchaseOrders, type PurchaseOrder } from "@/lib/procurement";
import { Button, Card, Table, Badge, PageHeader, Breadcrumbs, Banner, Icon, useAsync, Field, Input } from "@/components/ui";

const TONE: Record<string, string> = { DRAFT: "slate", SUBMITTED: "blue", PARTIALLY_RECEIVED: "amber", RECEIVED: "green", CANCELLED: "red" };
const QC_TONE: Record<string, string> = { PENDING: "amber", PASSED: "green", FAILED: "red" };

export default function PODetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: po, loading, error, reload } = useAsync<PurchaseOrder>(() => purchaseOrders.get(id), [id]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [cost, setCost] = useState({ description: "", amount: "" });

  const act = async (fn: () => Promise<unknown>, ok: string) => {
    setErr(""); setMsg("");
    try { await fn(); setMsg(ok); reload(); } catch (e: any) { setErr(e.message); }
  };

  if (loading || !po) return <div className="p-6 max-w-3xl mx-auto">{error || "Loading…"}</div>;

  const canReceive = po.status === "SUBMITTED" || po.status === "PARTIALLY_RECEIVED";
  const canAllocate = po.status === "RECEIVED" && (po.landedCosts?.length ?? 0) > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <Breadcrumbs items={["Procurement", "Purchase Orders", po.orderNumber]} />
      <PageHeader title={po.orderNumber} desc={`Supplier: ${po.supplier?.name ?? "—"} · Total: $${po.totalAmount.toFixed(2)}`}
        action={<Badge tone={TONE[po.status] ?? "slate"}>{po.status.replace("_", " ")}</Badge>} />

      {msg && <Banner tone="green">{msg}</Banner>}
      {err && <Banner>{err}</Banner>}

      <div className="flex gap-2 flex-wrap">
        {po.status === "DRAFT" && <Button onClick={() => act(() => purchaseOrders.submit(po.id), "Submitted.")}>Submit PO</Button>}
        {canReceive && <Link href={`/purchase-orders/${po.id}/receive`} className="btn btn-primary">Receive →</Link>}
        {po.status !== "RECEIVED" && po.status !== "CANCELLED" && (
          <Button variant="outline" onClick={() => act(() => purchaseOrders.cancel(po.id), "Cancelled.")} style={{ color: "var(--red)" }}>Cancel</Button>
        )}
      </div>

      <Card>
        <div className="px-4 py-3 border-b font-semibold" style={{ borderColor: "var(--border)" }}>Lines & Quality Check</div>
        <Table head={["Product", "Ordered", "Received", "Unit price", "Line total", "QC", ""]}>
          {po.lines.map((l) => (
            <tr key={l.id} className="row">
              <td className="td">
                <div className="font-medium">{l.product?.name ?? l.productId}</div>
                <div className="text-xs" style={{ color: "var(--text-faint)" }}>{l.product?.sku} · {l.product?.trackingType ?? "?"}</div>
              </td>
              <td className="td">{l.quantity}</td>
              <td className="td">{l.receivedQty}</td>
              <td className="td">${l.unitPrice.toFixed(2)}</td>
              <td className="td">${l.lineTotal.toFixed(2)}</td>
              <td className="td"><Badge tone={QC_TONE[l.qcStatus] ?? "slate"}>{l.qcStatus}</Badge></td>
              <td className="td text-right">
                {l.receivedQty > 0 && l.qcStatus === "PENDING" && (
                  <span className="inline-flex gap-1">
                    <button className="btn btn-ghost btn-sm" style={{ color: "var(--green)" }}
                      onClick={() => act(() => purchaseOrders.qcPass(l.id), "QC passed.")}>Pass</button>
                    <button className="btn btn-ghost btn-sm" style={{ color: "var(--red)" }}
                      onClick={() => act(() => purchaseOrders.qcFail(l.id, "Damaged on arrival"), "QC failed.")}>Fail</button>
                  </span>
                )}
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <Card className="p-5 space-y-3">
        <h2 className="font-semibold">Landed costs</h2>
        {(po.landedCosts?.length ?? 0) > 0 && (
          <ul className="text-sm space-y-1">
            {po.landedCosts!.map((c) => (
              <li key={c.id} className="flex justify-between border-b py-1.5" style={{ borderColor: "var(--border)" }}>
                <span>{c.description}</span><span className="font-medium">${c.amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
        {(po.status === "RECEIVED" || po.status === "PARTIALLY_RECEIVED") && (
          <div className="grid grid-cols-[1fr_120px_auto_auto] gap-2 items-end">
            <Field label="Description"><Input placeholder="e.g. Freight" value={cost.description} onChange={(e: any) => setCost({ ...cost, description: e.target.value })} /></Field>
            <Field label="Amount"><Input type="number" step="0.01" placeholder="0.00" value={cost.amount} onChange={(e: any) => setCost({ ...cost, amount: e.target.value })} /></Field>
            <Button variant="outline" disabled={!cost.description || !Number(cost.amount)}
              onClick={() => act(() => purchaseOrders.addLandedCost(po.id, { description: cost.description, amount: Number(cost.amount) }), "Cost added.")}>Add cost</Button>
            <Button disabled={!canAllocate}
              onClick={() => act(() => purchaseOrders.allocateLandedCosts(po.id), "Costs allocated — product cost prices updated.")}>Allocate</Button>
          </div>
        )}
        {po.status !== "RECEIVED" && po.status !== "PARTIALLY_RECEIVED" && (
          <p className="text-xs" style={{ color: "var(--text-faint)" }}>Landed costs can be added once the PO is received.</p>
        )}
      </Card>

      <Link href="/purchase-orders" className="btn btn-ghost btn-sm">← Back to list</Link>
    </div>
  );
}