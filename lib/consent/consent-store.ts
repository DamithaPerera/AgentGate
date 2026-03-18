import { nanoid } from 'nanoid';
import { storage } from '@/lib/storage/redis';
import type { ConsentRequest } from '@/lib/types';

const CONSENT_PREFIX = 'consent:';
const CONSENT_TTL = 30; // 30 seconds

export async function createConsentRequest(params: {
  agentId: string;
  agentName: string;
  action: string;
  resource: string;
  reason: string;
  userId: string;
}): Promise<ConsentRequest> {
  const id = nanoid(16);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CONSENT_TTL * 1000);

  const request: ConsentRequest = {
    id,
    agentId: params.agentId,
    agentName: params.agentName,
    action: params.action,
    resource: params.resource,
    reason: params.reason,
    userId: params.userId,
    status: 'pending',
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  await storage.set(`${CONSENT_PREFIX}${id}`, JSON.stringify(request), CONSENT_TTL);
  return request;
}

export async function getConsentRequest(id: string): Promise<ConsentRequest | null> {
  const raw = await storage.get(`${CONSENT_PREFIX}${id}`);
  if (!raw) return null;
  return JSON.parse(raw) as ConsentRequest;
}

export async function respondToConsent(
  id: string,
  approved: boolean
): Promise<ConsentRequest | null> {
  const request = await getConsentRequest(id);
  if (!request) return null;

  // Check if expired
  if (new Date() > new Date(request.expiresAt)) {
    const expired = { ...request, status: 'expired' as const };
    await storage.set(`${CONSENT_PREFIX}${id}`, JSON.stringify(expired), 60);
    return expired;
  }

  const updated: ConsentRequest = {
    ...request,
    status: approved ? 'approved' : 'denied',
    respondedAt: new Date().toISOString(),
  };

  await storage.set(`${CONSENT_PREFIX}${id}`, JSON.stringify(updated), 60);
  return updated;
}

export async function waitForConsent(
  id: string,
  timeoutMs = 30000
): Promise<ConsentRequest> {
  const deadline = Date.now() + timeoutMs;
  const pollInterval = 500;

  while (Date.now() < deadline) {
    const request = await getConsentRequest(id);

    if (!request) {
      return {
        id,
        agentId: '',
        agentName: '',
        action: '',
        resource: '',
        reason: '',
        userId: '',
        status: 'expired',
        createdAt: new Date().toISOString(),
        expiresAt: new Date().toISOString(),
      };
    }

    if (request.status !== 'pending') {
      return request;
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  // Timeout — auto-deny
  const request = await getConsentRequest(id);
  if (request && request.status === 'pending') {
    const expired = { ...request, status: 'expired' as const };
    await storage.set(`${CONSENT_PREFIX}${id}`, JSON.stringify(expired), 60);
    return expired;
  }

  return (await getConsentRequest(id)) ?? {
    id,
    agentId: '',
    agentName: '',
    action: '',
    resource: '',
    reason: '',
    userId: '',
    status: 'expired',
    createdAt: new Date().toISOString(),
    expiresAt: new Date().toISOString(),
  };
}
