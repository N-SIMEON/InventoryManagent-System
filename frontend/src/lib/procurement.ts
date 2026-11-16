// src/lib/procurement.ts
// Self-contained API client for Bruce's Phase-2 tasks (2.1–2.10).
// Deliberately isolated from lib/api.ts (Simeon's auth client) to avoid
// merge conflicts. Only shared contract: the JWT lives in localStorage
// under the key Simeon's login page stores it as ("token").

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "token"; // keep in sync with lib/api.ts TOKEN_KEY

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t: string) {
  if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, t);
}
export function clearToken() {
  if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
}
function authHeaders(extra?: HeadersInit): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extra as Record<string, string> | undefined),
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers: authHeaders(options.headers) });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error ?? body?.message ?? `Request failed (${res.status})`);
  return body as T;
}

/* ---------- Types (mirror backend responses) ---------- */
export type Supplier = {
  id: string; name: string; contactEmail?: string | null;
  contactPhone?: string | null; address?: string | null; isActive: boolean;
};
export type Product = {
  id: string; name: string; sku: string; quantity: number;
  trackingType: "NONE" | "LOT" | "SERIAL";
};
export type POLine = {
  id: string; productId: string; quantity: number; unitPrice: number;
  lineTotal: number; receivedQty: number;
  qcStatus: "PENDING" | "PASSED" | "FAILED";
  product?: Product;
};
export type LandedCost = { id: string; description: string; amount: number };
export type PurchaseOrder = {
  id: string; orderNumber: string; status: string; totalAmount: number;
  notes?: string | null; isDropship: boolean;
  supplier?: { id: string; name: string };
  lines: POLine[];
  landedCosts?: LandedCost[];
};

/* ---------- Suppliers (Task 2.1) ---------- */
export const suppliers = {
  list: () => request<Supplier[]>("/suppliers"),
  create: (d: Omit<Supplier, "id" | "isActive">) =>
    request<Supplier>("/suppliers", { method: "POST", body: JSON.stringify(d) }),
  deactivate: (id: string) => request(`/suppliers/${id}`, { method: "DELETE" }),
};

/* ---------- Products (read-only stub until Elissa's Task 1.2) ---------- */
export const products = {
  list: () => request<Product[]>("/products"),
};

/* ---------- Purchase Orders (Tasks 2.2–2.7, 2.10) ---------- */
export const purchaseOrders = {
  list: (status?: string) =>
    request<PurchaseOrder[]>(status ? `/purchase-orders?status=${status}` : "/purchase-orders"),
  get: (id: string) => request<PurchaseOrder>(`/purchase-orders/${id}`),
  create: (d: {
    supplierId: string; orderNumber: string; isDropship?: boolean; notes?: string;
    lines: { productId: string; quantity: number; unitPrice: number }[];
  }) => request<PurchaseOrder>("/purchase-orders", { method: "POST", body: JSON.stringify(d) }),
  submit: (id: string) => request(`/purchase-orders/${id}/submit`, { method: "POST" }),
  cancel: (id: string) => request(`/purchase-orders/${id}/cancel`, { method: "POST" }),
  receive: (id: string, lines: any[]) =>
    request<PurchaseOrder>(`/purchase-orders/${id}/receive`, { method: "POST", body: JSON.stringify({ lines }) }),
  qcPass: (lineId: string, notes?: string) =>
    request("/purchase-orders/qc/pass", { method: "POST", body: JSON.stringify({ lineId, notes }) }),
  qcFail: (lineId: string, notes?: string) =>
    request("/purchase-orders/qc/fail", { method: "POST", body: JSON.stringify({ lineId, notes }) }),
  addLandedCost: (id: string, d: { description: string; amount: number }) =>
    request<LandedCost>(`/purchase-orders/${id}/landed-costs`, { method: "POST", body: JSON.stringify(d) }),
  allocateLandedCosts: (id: string) =>
    request(`/purchase-orders/${id}/allocate-costs`, { method: "POST" }),
};