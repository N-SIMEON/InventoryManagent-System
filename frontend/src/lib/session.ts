// src/lib/session.ts
// JWT session utilities for Bruce's Phase-2 pages.
// Decodes the token Simeon's login page stores under "token".

const TOKEN_KEY = "token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function decodeJwt(token: string): Record<string, any> | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

export function isTokenExpired(token = getToken()): boolean {
  if (!token) return true;
  const payload = decodeJwt(token);
  if (!payload || typeof payload.exp !== "number") return true; // garbage/fake token
  return payload.exp * 1000 < Date.now();
}

export function getRole(): string {
  return decodeJwt(getToken() ?? "")?.role ?? "member";
}

export function endSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = "/login";
  }
}