interface SectionHeadingProps {
  title: React.ReactNode;
  subtitle?: string;
  dark?: boolean;
  maxWidth?: number;
}

export function SectionHeading({ title, subtitle, dark = false, maxWidth = 520 }: SectionHeadingProps) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 64 }}>
      <h2
        className="animate-fade-in-up delay-100"
        style={{
          fontSize: 'clamp(28px, 4vw, 44px)',
          fontWeight: 800,
          color: dark ? '#fff' : '#0F172A',
          marginBottom: 12,
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="animate-fade-in-up delay-200"
          style={{
            color: dark ? '#94A3B8' : '#64748B',
            fontSize: 16,
            maxWidth,
            margin: '0 auto',
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
