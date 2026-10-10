import { AsyncLocalStorage } from 'node:async_hooks';
import type { AuditContext } from './audit.types';

const storage = new AsyncLocalStorage<AuditContext>();

/** Open a context for the lifetime of `fn` (call this first thing in the request pipeline). */
export function runWithAuditContext<T>(ctx: AuditContext, fn: () => T): T {
  return storage.run({ ...ctx }, fn);
}

export function getAuditContext(): AuditContext | undefined {
  return storage.getStore();
}

/**
 * Merge facts learned later in the request (e.g. tenantId/actorUserId once auth has run).
 * Returns false if no context is open, so a misordered pipeline is detectable.
 */
export function setAuditContext(patch: Partial<AuditContext>): boolean {
  const store = storage.getStore();
  if (!store) return false;
  Object.assign(store, patch);
  return true;
}