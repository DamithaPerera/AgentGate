import Link from 'next/link';

export function LandingNav() {
  return (
    <nav style={{
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #E2E8F0',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'linear-gradient(135deg, #3b6cff, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 14,
            boxShadow: '0 2px 8px rgba(59,108,255,0.28)',
          }}>AG</div>
          <span style={{ fontWeight: 700, fontSize: 18, color: '#0F172A' }}>AgentGate</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/docs" style={{ padding: '8px 16px', borderRadius: 8, color: '#2D3748', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
            Docs
          </Link>
          <a
            href="https://github.com/DamithaPerera/AgentGate"
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: '8px 16px', borderRadius: 8, color: '#2D3748', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}
          >
            GitHub
          </a>
          <Link href="/auth/login?returnTo=/dashboard" style={{
            padding: '8px 16px', borderRadius: 8,
            border: '1px solid #E2E8F0',
            color: '#2D3748', fontWeight: 600, fontSize: 14, textDecoration: 'none',
          }}>
            Log in
          </Link>
          <Link href="/dashboard" style={{
            padding: '8px 20px', borderRadius: 8,
            background: 'linear-gradient(135deg, #3b6cff, #8b5cf6)',
            color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none',
            boxShadow: '0 2px 12px rgba(59,108,255,0.35)',
          }}>
            Open Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
}
