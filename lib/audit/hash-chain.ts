import type { AuditEntry } from '@/lib/types';

export const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

export async function computeEntryHash(
  entry: Omit<AuditEntry, 'hash'>,
  previousHash: string
): Promise<string> {
  const data = JSON.stringify({
    id: entry.id,
    timestamp: entry.timestamp,
    sequenceNumber: entry.sequenceNumber,
    type: entry.type,
    agentId: entry.agentId,
    action: entry.action,
    resource: entry.resource,
    decision: entry.decision,
    reason: entry.reason,
    previousHash,
  });

  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(data)
  );
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyChain(entries: AuditEntry[]): Promise<{
  valid: boolean;
  tamperedAt?: number;
  message: string;
}> {
  if (entries.length === 0) {
    return { valid: true, message: 'Empty chain is valid' };
  }

  // Sort by sequence number
  const sorted = [...entries].sort((a, b) => a.sequenceNumber - b.sequenceNumber);

  let previousHash = GENESIS_HASH;

  for (const entry of sorted) {
    if (entry.previousHash !== previousHash) {
      return {
        valid: false,
        tamperedAt: entry.sequenceNumber,
        message: `Chain broken at entry #${entry.sequenceNumber}: previousHash mismatch`,
      };
    }

    const { hash: _h, ...entryWithoutHash } = entry;
    void _h;
    const expectedHash = await computeEntryHash(
      entryWithoutHash,
      previousHash
    );

    if (expectedHash !== entry.hash) {
      return {
        valid: false,
        tamperedAt: entry.sequenceNumber,
        message: `Entry #${entry.sequenceNumber} has been tampered with: hash mismatch`,
      };
    }

    previousHash = entry.hash;
  }

  return {
    valid: true,
    message: `Chain verified: ${sorted.length} entries, all hashes valid`,
  };
}
