import Link from 'next/link';

export function LandingFooter() {
  return (
    <footer style={{
      background: '#060D1A',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '40px 24px',
      textAlign: 'center',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: 'linear-gradient(135deg, #3b6cff, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: 11,
          boxShadow: '0 2px 8px rgba(59,108,255,0.28)',
        }}>AG</div>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#94A3B8' }}>AgentGate</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16, flexWrap: 'wrap' }}>
        <Link href="/dashboard" style={{ color: '#64748B', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>Dashboard</Link>
        <Link href="/docs" style={{ color: '#64748B', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>API Docs</Link>
        <a
          href="https://github.com/DamithaPerera/AgentGate"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#64748B', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}
        >
          GitHub
        </a>
      </div>

      <p style={{ color: '#475569', fontSize: 13, marginBottom: 4 }}>
        Built for the &quot;Authorized to Act: Auth0 for AI Agents&quot; Hackathon · April 2026
      </p>
      <p style={{ color: '#334155', fontSize: 12 }}>
        The authorization layer the IETF left as &quot;TODO Security&quot;
      </p>
    </footer>
  );
}
