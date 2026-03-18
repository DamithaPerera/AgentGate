import { createConsentRequest, waitForConsent } from '@/lib/consent/consent-store';
import { issueToken } from '@/lib/auth0/token-vault';
import { eventBus } from '@/lib/events/event-bus';
import type { ConsentResult } from '@/lib/types';

export async function requestConsent(params: {
  agentId: string;
  agentName: string;
  action: string;
  resource: string;
  service: string;
  reason: string;
  userId: string;
}): Promise<ConsentResult> {
  // Create pending consent request
  const consentRequest = await createConsentRequest({
    agentId: params.agentId,
    agentName: params.agentName,
    action: params.action,
    resource: params.resource,
    reason: params.reason,
    userId: params.userId,
  });

  // Emit SSE event to dashboard — the CIBA card will appear
  eventBus.emit('ciba_request', {
    requestId: consentRequest.id,
    agentId: params.agentId,
    agentName: params.agentName,
    action: params.action,
    resource: params.resource,
    reason: params.reason,
    expiresAt: consentRequest.expiresAt,
  });

  // Wait for user decision (dashboard approve/deny buttons or timeout)
  const result = await waitForConsent(consentRequest.id, 30000);

  if (result.status === 'approved') {
    // Issue time-limited scoped token via Token Vault
    const token = await issueToken({
      agentId: params.agentId,
      service: params.service,
      scopes: [params.action],
      ttl: 60, // 60 seconds only
    });

    eventBus.emit('ciba_approved', {
      requestId: consentRequest.id,
      agentId: params.agentId,
      agentName: params.agentName,
      tokenTTL: 60,
    });

    return { approved: true, token };
  }

  const deniedReason =
    result.status === 'expired'
      ? 'CIBA request expired (30s timeout)'
      : 'User denied the request';

  eventBus.emit(result.status === 'expired' ? 'ciba_expired' : 'ciba_denied', {
    requestId: consentRequest.id,
    agentId: params.agentId,
    agentName: params.agentName,
    reason: deniedReason,
  });

  return { approved: false, reason: deniedReason };
}
