import { SignJWT, jwtVerify } from 'jose';
import type { AgentIdentity } from '@/lib/types';

const getSecret = () => {
  const secret = process.env.AGENT_JWT_SECRET ?? 'agentgate-dev-secret-change-in-production-32ch';
  return new TextEncoder().encode(secret);
};

export interface AgentTokenClaims {
  sub: string;       // agent ID
  spiffe: string;    // SPIFFE ID
  name: string;
  framework: string;
  capabilities: string[];
  trustLevel: number;
  registeredBy: string;
  iss: string;
  aud: string;
}

export async function signAgentToken(agent: AgentIdentity): Promise<string> {
  return new SignJWT({
    spiffe: agent.spiffeId,
    name: agent.name,
    framework: agent.framework,
    capabilities: agent.capabilities,
    trustLevel: agent.trustLevel,
    registeredBy: agent.registeredBy,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(agent.id)
    .setIssuer('agentgate')
    .setAudience('agentgate-api')
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(getSecret());
}

export async function verifyAgentToken(token: string): Promise<AgentTokenClaims | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: 'agentgate',
      audience: 'agentgate-api',
    });
    return payload as unknown as AgentTokenClaims;
  } catch {
    return null;
  }
}
