interface Framework {
  name: string;
  color: string;
  bg: string;
  border: string;
  icon: string;
}

const LEFT_FRAMEWORKS: Framework[] = [
  { name: 'CrewAI',    color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', icon: '🤖' },
  { name: 'LangGraph', color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE', icon: '🔗' },
  { name: 'AutoGPT',  color: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE', icon: '⚡' },
];

const RIGHT_FRAMEWORKS: Framework[] = [
  { name: 'MCP',           color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', icon: '🔌' },
  { name: 'Custom Python', color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', icon: '🐍' },
  { name: 'Any HTTP Agent',color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB', icon: '🌐' },
];

function FrameworkPill({ fw }: { fw: Framework }) {
  return (
    <div style={{ background: fw.bg, border: `1px solid ${fw.border}`, borderRadius: 12, padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 8, minWidth: 140 }}>
      <span style={{ fontSize: 18 }}>{fw.icon}</span>
      <span style={{ fontWeight: 700, fontSize: 14, color: fw.color }}>{fw.name}</span>
    </div>
  );
}

export function FrameworkHub() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, flexWrap: 'wrap', position: 'relative' }}>
      {/* Left spokes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-end' }}>
        {LEFT_FRAMEWORKS.map(fw => (
          <div key={fw.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <FrameworkPill fw={fw} />
            <div style={{ width: 40, height: 1, background: 'linear-gradient(to right, #CBD5E1, #3b6cff44)' }} />
          </div>
        ))}
      </div>

      {/* Center hub */}
      <div style={{
        width: 120, height: 120, borderRadius: '50%',
        background: 'linear-gradient(135deg, #3b6cff, #8b5cf6)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 32px rgba(59,108,255,0.35)',
        zIndex: 1, flexShrink: 0, margin: '0 8px',
      }}>
        <span style={{ color: '#fff', fontWeight: 900, fontSize: 18, fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '-0.02em' }}>AG</span>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 600, marginTop: 2 }}>AgentGate</span>
      </div>

      {/* Right spokes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
        {RIGHT_FRAMEWORKS.map(fw => (
          <div key={fw.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 1, background: 'linear-gradient(to right, #3b6cff44, #CBD5E1)' }} />
            <FrameworkPill fw={fw} />
          </div>
        ))}
      </div>
    </div>
  );
}
