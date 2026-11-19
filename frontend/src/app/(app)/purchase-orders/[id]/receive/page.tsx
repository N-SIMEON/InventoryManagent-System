"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { purchaseOrders, type PurchaseOrder, type POLine } from "@/lib/procurement";
import { Button, Card, Badge, Banner, Icon } from "@/components/ui";

const TT_TONE: Record<string, string> = { NONE: "slate", LOT: "amber", SERIAL: "blue" };

export default function ReceivePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [po, setPo] = useState<PurchaseOrder | null>(null);
  const [draft, setDraft] = useState<Record<string, any>>({});
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = () => purchaseOrders.get(id).then(setPo).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, [id]);

  const set = (lineId: string, patch: any) => setDraft((d) => ({ ...d, [lineId]: { ...d[lineId], ...patch } }));

  const receiveLine = async (l: POLine) => {
    const d = draft[l.id] || {};
    const qty = Number(d.receivedQty || 0);
    const remaining = l.quantity - l.receivedQty;
    setErr(""); setOk("");
    if (qty <= 0) return setErr("Enter a received quantity.");
    if (qty > remaining) return setErr(`Cannot receive more than ${remaining} remaining unit(s).`);

    const payload: any = { lineId: l.id, receivedQty: qty };
    const tt = l.product?.trackingType;

    if (tt === "LOT") {
      if (!d.lotNumber) return setErr("Lot number is required for LOT-tracked products.");
      payload.lots = [{ lotNumber: d.lotNumber, expiryDate: d.expiryDate || null, quantity: qty }];
    } else if (tt === "SERIAL") {
      const serials = (d.serials || "").split(",").map((s: string) => s.trim()).filter(Boolean);
      if (serials.length !== qty) return setErr(`Provide exactly ${qty} unique serial number(s) (comma-separated).`);
      payload.serials = serials;
    }

    setBusy(l.id);
    try {
      await purchaseOrders.receive(id, [payload]);
      setOk(`Received ${qty} unit(s) of ${l.product?.name ?? "item"}.`);
      setDraft((d) => ({ ...d, [l.id]: {} }));
      await load();
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(null); }
  };

  if (!po) return <div className="p-6">{err || "Loading…"}</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Receive · {po.orderNumber}</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Status: <Badge tone={po.status === "RECEIVED" ? "green" : "blue"}>{po.status.replace("_", " ")}</Badge>
            {po.isDropship && <span className="ml-2 text-xs">· Dropship — no warehouse stock added</span>}
          </p>
        </div>
        <Button variant="ghost" onClick={() => router.push(`/purchase-orders/${po.id}`)}>← Back</Button>
      </div>

      {ok && <Banner tone="green">{ok}</Banner>}
      {err && <Banner>{err}</Banner>}

      {po.lines.map((l) => {
        const remaining = l.quantity - l.receivedQty;
        const d = draft[l.id] || {};
        const tt = l.product?.trackingType ?? "NONE";
        return (
          <Card key={l.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">{l.product?.name ?? l.productId}</span>
                <span className="ml-2"><Badge tone={TT_TONE[tt]}>{tt}</Badge></span>
              </div>
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>{l.receivedQty}/{l.quantity} received</span>
            </div>

            <div className="h-1.5 rounded-full" style={{ background: "var(--surface-2)" }}>
              <div className="h-full rounded-full" style={{ width: `${(l.receivedQty / l.quantity) * 100}%`, background: "var(--primary)" }} />
            </div>

            {remaining > 0 ? (
              <div className="flex flex-wrap gap-2 items-end">
                <div className="w-28"><label className="label">Qty</label>
                  <input type="number" min={1} max={remaining} className="input" placeholder={`≤ ${remaining}`}
                    value={d.receivedQty ?? ""} onChange={(e) => set(l.id, { receivedQty: e.target.value })} /></div>

                {tt === "LOT" && (
                  <>
                    <div className="w-40"><label className="label">Lot #</label>
                      <input className="input" placeholder="BATCH-001" value={d.lotNumber ?? ""} onChange={(e) => set(l.id, { lotNumber: e.target.value })} /></div>
                    <div className="w-44"><label className="label">Expiry (optional)</label>
                      <input type="date" className="input" value={d.expiryDate ?? ""} onChange={(e) => set(l.id, { expiryDate: e.target.value })} /></div>
                  </>
                )}
                {tt === "SERIAL" && (
                  <div className="flex-1 min-w-[240px]"><label className="label">Serials (comma-separated, count = qty)</label>
                    <input className="input" placeholder="SN-1001, SN-1002" value={d.serials ?? ""} onChange={(e) => set(l.id, { serials: e.target.value })} /></div>
                )}

                <Button onClick={() => receiveLine(l)} disabled={busy === l.id}>{busy === l.id ? "Receiving…" : "Receive"}</Button>
              </div>
            ) : (
<p className="text-sm" style={{ color: "var(--green)" }}>✓ Fully received</p>
            )}
          </Card>
        );
      })}
    </div>
  );
}