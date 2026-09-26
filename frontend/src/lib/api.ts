// Thin client for the auth endpoints task 0.7 needs.
//
// Set NEXT_PUBLIC_API_URL (see .env.example) once Elissa's real API
// (task 0.4/0.5) is deployed. Until then every call below returns a fake
// success response after a short delay, so the pages are fully usable
// on their own.

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export type AuthResult = { token: string; tenantName: string };

async function fakeDelay<T>(value: T, ms = 500): Promise<T> {
  await new Promise((r) => setTimeout(r, ms));
  return value;
}

export async function signup(input: {
  tenantName: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  if (!BASE_URL) {
    return fakeDelay({ token: "fake-jwt-token", tenantName: input.tenantName });
  }
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function login(input: { email: string; password: string }): Promise<AuthResult> {
  if (!BASE_URL) {
    return fakeDelay({ token: "fake-jwt-token", tenantName: "Demo Tenant" });
  }
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function acceptInvite(input: {
  inviteToken: string;
  name: string;
  password: string;
}): Promise<AuthResult> {
  if (!BASE_URL) {
    return fakeDelay({ token: "fake-jwt-token", tenantName: "Demo Tenant" });
  }
  const res = await fetch(`${BASE_URL}/auth/invite/accept`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

async function readError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body.message ?? `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}
