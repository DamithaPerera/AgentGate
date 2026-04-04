export interface Gate {
  num: string;
  name: string;
  desc: string;
  bg: string;
  num_c: string;
  border: string;
  icon: string;
  delay: string;
}

export const GATES: Gate[] = [
  { num: '1', name: 'Identity',  desc: 'Verify agent SPIFFE ID & OAuth token',                 bg: '#EFF6FF', num_c: '#1D4ED8', border: '#BFDBFE', icon: '🔐', delay: 'delay-100' },
  { num: '2', name: 'Intent',    desc: 'Parse AuthZEN 4-tuple: who, what, where, context',      bg: '#FDF4FF', num_c: '#9333EA', border: '#E9D5FF', icon: '🎯', delay: 'delay-200' },
  { num: '3', name: 'Policy',    desc: 'Evaluate rules → ALLOW / ESCALATE / DENY',             bg: '#FFF7ED', num_c: '#EA580C', border: '#FED7AA', icon: '⚖️', delay: 'delay-300' },
  { num: '4', name: 'Consent',   desc: 'Auth0 CIBA push notification for human approval',      bg: '#FFF1F2', num_c: '#E11D48', border: '#FECDD3', icon: '📱', delay: 'delay-400' },
  { num: '5', name: 'Token',     desc: 'Issue scoped, time-limited token from Token Vault',    bg: '#F0FDF4', num_c: '#16A34A', border: '#BBF7D0', icon: '🎫', delay: 'delay-500' },
];

export function GateCard({ gate }: { gate: Gate }) {
  return (
    <div
      className={`gate-card animate-fade-in-up ${gate.delay}`}
      style={{
        background: gate.bg,
        border: `1px solid ${gate.border}`,
        borderRadius: 16,
        padding: '28px 20px',
        textAlign: 'center',
        cursor: 'default',
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 8 }}>{gate.icon}</div>
      <div style={{ fontSize: 36, fontWeight: 900, color: gate.num_c, lineHeight: 1, marginBottom: 8 }}>{gate.num}</div>
      <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A', marginBottom: 8 }}>{gate.name}</div>
      <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>{gate.desc}</div>
    </div>
  );
}
