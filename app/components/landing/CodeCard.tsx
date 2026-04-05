interface CodeCardProps {
  step: number;
  title: string;
  code: string;
  stepColor?: string;
}

export function CodeCard({ step, title, code, stepColor }: CodeCardProps) {
  const bgColor = stepColor ?? 'linear-gradient(135deg, #3b6cff, #8b5cf6)';
  return (
    <div
      className={`animate-fade-in-up delay-${step * 100}`}
      style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
    >
      <div style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          width: 22, height: 22, borderRadius: '50%',
          background: bgColor,
          color: '#fff', fontWeight: 800, fontSize: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {step}
        </span>
        <span style={{ fontWeight: 600, fontSize: 13, color: '#374151' }}>{title}</span>
      </div>
      <pre style={{
        margin: 0,
        padding: '20px',
        background: '#0F172A',
        color: '#E2E8F0',
        fontSize: 12,
        lineHeight: 1.7,
        overflowX: 'auto',
        fontFamily: "'IBM Plex Mono', 'Fira Code', monospace",
      }}>{code}</pre>
    </div>
  );
}
