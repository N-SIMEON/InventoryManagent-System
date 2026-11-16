"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { suppliers, products, purchaseOrders, type Supplier, type Product } from "@/lib/procurement";
import { Button, Card, Field, Input, Select, Textarea, PageHeader, Breadcrumbs, Banner, Icon } from "@/components/ui";

type Line = { productId: string; quantity: number; unitPrice: number };

function NewPOForm() {
  const router = useRouter();
  const params = useSearchParams();

  const [supList, setSupList] = useState<Supplier[]>([]);
  const [proList, setProList] = useState<Product[]>([]);
  const [proErr, setProErr] = useState("");
  const [supplierId, setSupplierId] = useState(params.get("supplier") ?? "");
  const [orderNumber, setOrderNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [isDropship, setIsDropship] = useState(false);
  const [lines, setLines] = useState<Line[]>([{ productId: "", quantity: 1, unitPrice: 0 }]);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.allSettled([suppliers.list(), products.list()]).then(([s, p]) => {
      if (s.status === "fulfilled") setSupList(s.value); else setErr(s.reason?.message ?? "Failed to load suppliers");
      if (p.status === "fulfilled") setProList(p.value); else setProErr("Product list unavailable — the /products stub may be missing or the backend needs a restart. Add products via Prisma Studio meanwhile.");
    });
  }, []);

  const setLine = (i: number, patch: Partial<Line>) =>
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  const total = useMemo(() => lines.reduce((s, l) => s + (l.quantity * l.unitPrice || 0), 0), [lines]);
  const validLines = lines.filter((l) => l.productId && l.quantity > 0 && l.unitPrice >= 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr("");
    if (!supplierId) return setErr("Choose a supplier.");
    if (!orderNumber.trim()) return setErr("Order number is required.");
    if (validLines.length === 0) return setErr("Add at least one line with a product, quantity and price.");
    setSaving(true);
    try {
      const po = await purchaseOrders.create({
        supplierId, orderNumber, notes: notes || undefined, isDropship,
        lines: validLines.map((l) => ({ productId: l.productId, quantity: Number(l.quantity), unitPrice: Number(l.unitPrice) })),
      });
      router.push(`/purchase-orders/${po.id}`);
    } catch (e: any) { setErr(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Breadcrumbs items={["Procurement", "Purchase Orders", "New"]} />
      <PageHeader title="New Purchase Order" desc="Creates a DRAFT — submit it when you're ready to send to the supplier." />

      {err && <Banner>{err}</Banner>}
      {proErr && <Banner tone="amber">{proErr}</Banner>}

      <form onSubmit={submit} className="space-y-4">
        <Card className="p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Supplier *">
              <Select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} required>
                <option value="" disabled>Choose supplier…</option>
                {supList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </Field>
            <Field label="Order number *" hint="Must be unique per tenant.">
              <Input placeholder="PO-2024-001" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} required />
            </Field>
          </div>
          <Field label="Notes"><Textarea rows={2} placeholder="Optional internal notes" value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
          <label className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
            <input type="checkbox" checked={isDropship} onChange={(e) => setIsDropship(e.target.checked)} />
            Dropship — goods go direct to customer; receiving will NOT add to warehouse stock.
          </label>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Line items</h2>
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>Total: <b style={{ color: "var(--text)" }}>${total.toFixed(2)}</b></span>
          </div>
          <div className="space-y-3">
            {lines.map((l, i) => (
              <div key={i} className="grid grid-cols-[1fr_90px_110px_32px] gap-2 items-center">
                <Select value={l.productId} onChange={(e) => setLine(i, { productId: e.target.value })}>
                  <option value="" disabled>Choose product…</option>
                  {proList.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.sku} ({p.trackingType})</option>)}
                </Select>
                <Input type="number" min={1} value={l.quantity} onChange={(e) => setLine(i, { quantity: Number(e.target.value) })} />
                <Input type="number" step="0.01" min={0} value={l.unitPrice} onChange={(e) => setLine(i, { unitPrice: Number(e.target.value) })} />
                <button type="button" onClick={() => setLines(lines.filter((_, x) => x !== i))}
                  className="btn btn-ghost btn-sm justify-center" disabled={lines.length === 1}><Icon.close /></button>
              </div>
            ))}
          </div>
          <Button type="button" variant="ghost" size="sm" className="mt-3" onClick={() => setLines([...lines, { productId: "", quantity: 1, unitPrice: 0 }])}>
            <Icon.plus /> Add line
          </Button>
        </Card>

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? "Creating…" : "Create PO (Draft)"}</Button>
        </div>
      </form>
    </div>
  );
}

export default function NewPOPage() {
  return <Suspense fallback={<div className="p-6">Loading…</div>}><NewPOForm /></Suspense>;
}