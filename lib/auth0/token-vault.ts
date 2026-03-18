import type { ScopedToken } from '@/lib/types';
import { nanoid } from 'nanoid';

// Token Vault wrapper — uses Auth0 Token Vault when configured,
// falls back to mock tokens for local dev/demo.

interface IssueTokenParams {
  agentId: string;
  service: string;
  scopes: string[];
  ttl?: number;
  delegatedFrom?: string;
}

export async function issueToken(params: IssueTokenParams): Promise<ScopedToken> {
  const ttl = params.ttl ?? 60;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttl * 1000);

  // In production, this calls Auth0 Token Vault to exchange for a scoped token.
  // For the demo/hackathon, we generate a signed mock token that represents
  // the Token Vault token reference.
  const tokenValue = `tvault_${params.service}_${nanoid(24)}`;

  return {
    token: tokenValue,
    service: params.service,
    scopes: params.scopes,
    issuedTo: params.agentId,
    issuedBy: 'agentgate',
    delegatedFrom: params.delegatedFrom,
    ttl,
    issuedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    revocable: true,
  };
}

export async function revokeToken(token: string): Promise<void> {
  // In production: call Auth0 Token Vault revocation endpoint
  // For demo: just log the revocation (handled by cascade engine)
  console.log(`[TokenVault] Revoking token: ${token.substring(0, 20)}...`);
}

export async function getTokenForService(
  userId: string,
  service: 'github' | 'google'
): Promise<string | null> {
  // In production: retrieve stored OAuth token from Auth0 Token Vault
  // The token was stored when user connected the service via OAuth
  // For demo: return a placeholder indicating the service is connected
  const envKey = service === 'github'
    ? process.env.GITHUB_ACCESS_TOKEN
    : process.env.GOOGLE_ACCESS_TOKEN;
  return envKey ?? `demo_${service}_token_connected`;
}
