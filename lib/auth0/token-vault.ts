import type { ScopedToken } from '@/lib/types';
import { nanoid } from 'nanoid';

// Token Vault wrapper — uses Auth0 Token Vault when configured,
// falls back to mock tokens for local dev/demo.

// Map action services to OAuth provider names
const SERVICE_TO_PROVIDER: Record<string, 'google' | 'github'> = {
  gmail: 'google',
  calendar: 'google',
  gdrive: 'google',
  github: 'github',
};

interface IssueTokenParams {
  agentId: string;
  service: string;
  scopes: string[];
  ttl?: number;
  delegatedFrom?: string;
  userId?: string; // needed to fetch real token from Auth0
}

export async function issueToken(params: IssueTokenParams): Promise<ScopedToken> {
  const ttl = params.ttl ?? 60;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttl * 1000);

  // Production: if service maps to a known OAuth provider and userId is available,
  // fetch the real access token stored in Auth0 from when the user authenticated.
  let tokenValue: string;
  const provider = SERVICE_TO_PROVIDER[params.service];
  if (provider && params.userId) {
    const realToken = await getTokenForService(params.userId, provider);
    tokenValue = realToken ?? `tvault_${params.service}_${nanoid(24)}`;
  } else {
    tokenValue = `tvault_${params.service}_${nanoid(24)}`;
  }

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

const PROVIDER_MAP: Record<string, string> = {
  github: 'github',
  google: 'google-oauth2',
};

async function getManagementToken(): Promise<string> {
  const res = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.AUTH0_MGMT_CLIENT_ID,
      client_secret: process.env.AUTH0_MGMT_CLIENT_SECRET,
      audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials',
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('Failed to get management token');
  return data.access_token;
}

export async function getTokenForService(
  userId: string,
  service: 'github' | 'google'
): Promise<string | null> {
  // Production: fetch stored OAuth token from Auth0 Management API.
  // Auth0 stores the user's Google/GitHub access token in their identity
  // when they log in via the corresponding social connection.
  if (
    process.env.AUTH0_DOMAIN &&
    process.env.AUTH0_MGMT_CLIENT_ID &&
    process.env.AUTH0_MGMT_CLIENT_SECRET
  ) {
    try {
      const mgmtToken = await getManagementToken();
      const res = await fetch(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}`,
        { headers: { Authorization: `Bearer ${mgmtToken}` } }
      );
      const user = await res.json();
      const identity = user.identities?.find(
        (id: { provider: string }) => id.provider === PROVIDER_MAP[service]
      );
      return identity?.access_token ?? null;
    } catch (err) {
      console.error('[TokenVault] Management API error:', err);
    }
  }

  // Dev/demo fallback: env var or placeholder
  const envKey =
    service === 'github'
      ? process.env.GITHUB_ACCESS_TOKEN
      : process.env.GOOGLE_ACCESS_TOKEN;
  return envKey ?? `demo_${service}_token_connected`;
}
