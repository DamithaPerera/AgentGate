interface SectionBadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'green' | 'dark';
}

const variants = {
  blue: { background: '#EFF6FF', color: '#1D4ED8' },
  green: { background: '#F0FDF4', color: '#15803D' },
  dark: { background: 'rgba(0,82,204,0.2)', color: '#93C5FD', border: '1px solid rgba(0,101,255,0.3)' },
};

export function SectionBadge({ children, variant = 'blue' }: SectionBadgeProps) {
  const style = variants[variant];
  return (
    <div
      className="animate-fade-in-up"
      style={{
        display: 'inline-block',
        fontWeight: 600,
        fontSize: 13,
        padding: '4px 14px',
        borderRadius: 999,
        marginBottom: 16,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
