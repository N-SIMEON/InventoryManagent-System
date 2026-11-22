"use client";
import Link from "next/link";
import { suppliers, purchaseOrders, type Supplier, type PurchaseOrder } from "@/lib/procurement";
import { Card, StatCard, Badge, Button, SkeletonRows, EmptyState, PageHeader, Breadcrumbs, Icon, useAsync } from "@/components/ui";

const TONE: Record<string, string> = { DRAFT: "slate", SUBMITTED: "blue", PARTIALLY_RECEIVED: "amber", RECEIVED: "green", CANCELLED: "red" };

export default function DashboardPage() {
  const s = useAsync<Supplier[]>(() => suppliers.list(), []);
  const p = useAsync<PurchaseOrder[]>(() => purchaseOrders.list(), []);
  const pos = p.data ?? [];
  const open = pos.filter((x) => x.status === "SUBMITTED" || x.status === "PARTIALLY_RECEIVED");
  const recent = [...pos].sort((a, b) => (a.id < b.id ? 1 : -1)).slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <Breadcrumbs items={["Workspace", "Dashboard"]} />
      <PageHeader title="Dashboard" desc="Your procurement at a glance."
        action={<Link href="/purchase-orders/new" className="btn btn-primary"><Icon.plus /> New PO</Link>} />

      {p.loading || s.loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[0,1,2,3].map(i => <Card key={i} className="h-20 skeleton" />)}</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Suppliers" value={s.data?.length ?? 0} icon={<Icon.users />} tone="blue" />
          <StatCard label="Open POs" value={open.length} icon={<Icon.truck />} tone="amber" />
          <StatCard label="Received" value={pos.filter(x => x.status === "RECEIVED").length} icon={<Icon.truck />} tone="green" />
          <StatCard label="Pipeline value" value={`$${pos.filter(x => x.status !== "CANCELLED").reduce((a, x) => a + x.totalAmount, 0).toLocaleString()}`} icon={<Icon.chart />} tone="slate" />
        </div>
      )}

      <Card>
        <div className="px-4 py-3 border-b font-semibold" style={{ borderColor: "var(--border)" }}>Recent purchase orders</div>
        {p.error ? <div className="p-4 text-sm" style={{ color: "var(--red)" }}>{p.error}</div>
        : recent.length === 0 ? <EmptyState title="No activity yet" desc="Create a supplier, then raise your first purchase order."
            action={<Link href="/suppliers" className="btn btn-primary"><Icon.users /> Go to Suppliers</Link>} />
        : <table className="w-full"><tbody>
            {recent.map((x) => (
              <tr key={x.id} className="row">
                <td className="td"><Link href={`/purchase-orders/${x.id}`} className="font-medium hover:underline">{x.orderNumber}</Link></td>
                <td className="td" style={{ color: "var(--text-muted)" }}>{x.supplier?.name ?? "—"}</td>
                <td className="td"><Badge tone={TONE[x.status] ?? "slate"}>{x.status.replace("_", " ")}</Badge></td>
                <td className="td text-right">${x.totalAmount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody></table>}
      </Card>
    </div>
  );
}