export interface Feature {
  icon: string;
  title: string;
  desc: string;
  delay: string;
  accent: string;
}

export const FEATURES: Feature[] = [
  { icon: '🔑', title: 'Cryptographic Agent Identity',  desc: 'Every agent gets a SPIFFE ID and signed JWT. Anonymous agents are rejected before they touch any resource.',   delay: 'delay-100', accent: '#3B82F6' },
  { icon: '⚖️', title: 'OPA Policy Engine',             desc: 'AuthZEN 4-tuple evaluation (subject + action + resource + context) with natural language policy compilation.',  delay: 'delay-200', accent: '#8B5CF6' },
  { icon: '📱', title: 'CIBA Human-in-the-Loop',        desc: 'Sensitive actions trigger Auth0 Guardian push notifications. Users approve or deny in real-time.',               delay: 'delay-300', accent: '#EC4899' },
  { icon: '🏦', title: 'Auth0 Token Vault',             desc: 'Agents never see raw OAuth tokens. Token Vault issues scoped, time-limited credentials with 60s TTL.',           delay: 'delay-400', accent: '#10B981' },
  { icon: '🔗', title: 'Hash-Chained Audit Trail',      desc: 'SHA-256 hash chain over every decision. Tamper-evident, exportable as JSON, verifiable in-dashboard.',          delay: 'delay-500', accent: '#F59E0B' },
  { icon: '⚡', title: 'Cascade Revocation',            desc: 'Revoke one agent, one service, or everything (PANIC). All downstream tokens destroyed instantly.',               delay: 'delay-600', accent: '#EF4444' },
];

export function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <div
      className={`card-hover animate-fade-in-up ${feature.delay}`}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: '28px 24px',
        transition: 'border-color 0.2s, background 0.2s',
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: `${feature.accent}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, marginBottom: 16,
      }}>
        {feature.icon}
      </div>
      <h3 style={{ fontWeight: 700, fontSize: 16, color: '#F1F5F9', marginBottom: 10 }}>{feature.title}</h3>
      <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7 }}>{feature.desc}</p>
    </div>
  );
}
