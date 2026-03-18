export function generateSpiffeId(agentId: string): string {
  return `spiffe://agentgate.local/agents/${agentId}`;
}

export function parseSpiffeId(spiffeId: string): { agentId: string } | null {
  const match = spiffeId.match(/^spiffe:\/\/agentgate\.local\/agents\/(.+)$/);
  if (!match) return null;
  return { agentId: match[1] };
}

export function isValidSpiffeId(spiffeId: string): boolean {
  return /^spiffe:\/\/agentgate\.local\/agents\/[a-zA-Z0-9_-]+$/.test(spiffeId);
}
