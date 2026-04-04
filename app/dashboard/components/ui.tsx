'use client';
import React from 'react';

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({
  children,
  className = '',
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={`text-[10px] px-[7px] py-[3px] rounded-full font-semibold shrink-0 tracking-[0.04em] ${className}`}
      style={{
        fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

// ─── StatusDot ────────────────────────────────────────────────────────────────
export function StatusDot({
  color,
  pulse = false,
  size = 'md',
}: {
  color: string;
  pulse?: boolean;
  size?: 'sm' | 'md';
}) {
  const dim = size === 'sm' ? 'w-[6px] h-[6px]' : 'w-[6px] h-[6px]';
  return (
    <span
      className={`${dim} rounded-full inline-block shrink-0 ${pulse ? 'animate-pulse-dot' : ''}`}
      style={{ background: color }}
    />
  );
}

// ─── AgentDot ─────────────────────────────────────────────────────────────────
export function AgentDot({ active }: { active: boolean }) {
  return (
    <span
      className="w-[8px] h-[8px] rounded-full inline-block shrink-0"
      style={{
        background: active ? '#12b76a' : '#9498b3',
        boxShadow: active ? '0 0 6px rgba(18,183,106,0.45)' : 'none',
      }}
    />
  );
}

// ─── IconBox ──────────────────────────────────────────────────────────────────
export function IconBox({
  icon,
  bgClass = 'bg-[#ebf0ff]',
  size = 'md',
  variant,
}: {
  icon: string;
  bgClass?: string;
  size?: 'sm' | 'md';
  variant?: 'blue' | 'orange' | 'purple' | 'green' | 'red';
}) {
  const variantBg: Record<string, string> = {
    blue:   'bg-[#ebf0ff]',
    orange: 'bg-[#fefce8]',
    purple: 'bg-[#f3f0ff]',
    green:  'bg-[#e7faf0]',
    red:    'bg-[#fef2f2]',
  };
  const resolvedBg = variant ? variantBg[variant] : bgClass;
  const dims = size === 'sm' ? 'w-[26px] h-[26px] text-xs' : 'w-[30px] h-[30px] text-sm';
  return (
    <div className={`${dims} rounded-[8px] ${resolvedBg} flex items-center justify-center shrink-0`}>
      {icon}
    </div>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
export function SectionHeader({
  icon,
  iconBgClass,
  iconVariant,
  title,
  subtitle,
  right,
  accentColor,
}: {
  icon: string;
  iconBgClass?: string;
  iconVariant?: 'blue' | 'orange' | 'purple' | 'green' | 'red';
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  accentColor?: string;
}) {
  const bg = accentColor
    ? `linear-gradient(135deg, ${accentColor}12 0%, #f6f7fb 100%)`
    : undefined;
  return (
    <div
      className="px-5 py-3.5 border-b border-[#e2e4ef] flex items-center justify-between shrink-0 rounded-t-[14px]"
      style={{ background: bg ?? '#f0f1f7' }}
    >
      <div className="flex items-center gap-2.5">
        <IconBox icon={icon} bgClass={iconBgClass} variant={iconVariant} />
        <div>
          <div className="font-semibold text-[13px] text-[#1a1d2e]">{title}</div>
          {subtitle && <div className="text-[11px] text-[#9498b3] mt-px">{subtitle}</div>}
        </div>
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

// ─── KpiCard ──────────────────────────────────────────────────────────────────
export function KpiCard({
  label,
  value,
  sub,
  icon,
  color,
  delay = '0s',
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: string;
  color: string;
  delay?: string;
}) {
  return (
    <div
      className="rounded-[14px] px-5 py-4 flex items-center gap-4 animate-fadeUp"
      style={{
        background: `linear-gradient(135deg, ${color}14 0%, #ffffff 100%)`,
        border: `1px solid ${color}28`,
        boxShadow: `0 2px 8px ${color}10`,
        animationDelay: delay,
      }}
    >
      <div
        className="w-11 h-11 rounded-[12px] flex items-center justify-center text-xl shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}28` }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div
          className="text-[26px] font-extrabold leading-none tracking-[-0.03em]"
          style={{ color }}
        >
          {value}
        </div>
        <div className="text-[12px] font-semibold text-[#1a1d2e] mt-1.5">{label}</div>
        <div className="text-[10px] text-[#9498b3] mt-0.5 truncate">{sub}</div>
      </div>
    </div>
  );
}

// ─── DashboardSidebar ─────────────────────────────────────────────────────────
export function DashboardSidebar({
  tabs,
  activeId,
  onChange,
  userName,
  activeCount,
  logoutHref,
  loginHref,
}: {
  tabs: readonly TabConfig[];
  activeId: string;
  onChange: (id: string) => void;
  userName: string | null;
  activeCount: number;
  logoutHref: string;
  loginHref: string;
}) {
  return (
    <aside
      className="shrink-0 flex flex-col h-screen sticky top-0"
      style={{ width: 220, background: '#0f1117', borderRight: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Logo */}
      <a
        href="/"
        className="flex items-center gap-2.5 no-underline px-4 py-4 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div
          className="w-8 h-8 rounded-[10px] flex items-center justify-center text-white text-[11px] font-extrabold shrink-0"
          style={{
            background: 'linear-gradient(135deg, #3b6cff, #8b5cf6)',
            fontFamily: 'IBM Plex Mono, monospace',
            boxShadow: '0 2px 8px rgba(59,108,255,0.4)',
          }}
        >
          AG
        </div>
        <div>
          <div className="font-bold text-[14px] text-white leading-none">AgentGate</div>
          <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'IBM Plex Mono, monospace' }}>Security Dashboard</div>
        </div>
      </a>

      {/* Live status pill */}
      <div className="px-4 py-3 shrink-0">
        <div
          className="flex items-center gap-2 rounded-[8px] px-3 py-[7px]"
          style={{ background: 'rgba(18,183,106,0.1)', border: '1px solid rgba(18,183,106,0.2)' }}
        >
          <span className="w-[6px] h-[6px] rounded-full shrink-0 animate-pulse-dot" style={{ background: '#12b76a' }} />
          <span className="text-[11px] font-semibold" style={{ color: '#12b76a', fontFamily: 'IBM Plex Mono, monospace' }}>
            {activeCount} agent{activeCount !== 1 ? 's' : ''} active
          </span>
        </div>
      </div>

      {/* Nav label */}
      <div className="px-4 pb-1.5 shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'IBM Plex Mono, monospace' }}>
          Navigation
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2 overflow-y-auto">
        {tabs.map(tab => {
          const isActive = activeId === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-left border-none cursor-pointer transition-all"
              style={{
                background: isActive ? `${tab.color}18` : 'transparent',
                border: isActive ? `1px solid ${tab.color}28` : '1px solid transparent',
              }}
            >
              <span
                className="w-8 h-8 rounded-[8px] flex items-center justify-center text-base shrink-0 transition-all"
                style={{ background: isActive ? `${tab.color}25` : 'rgba(255,255,255,0.05)' }}
              >
                {tab.icon}
              </span>
              <span
                className="text-[13px] font-semibold flex-1 truncate"
                style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.45)' }}
              >
                {tab.label}
              </span>
              {typeof tab.badge === 'number' && tab.badge > 0 && (
                <span
                  className="text-[10px] font-bold px-1.5 py-[1px] rounded-full shrink-0"
                  style={{
                    background: isActive ? `${tab.color}30` : 'rgba(255,255,255,0.08)',
                    color: isActive ? tab.color : 'rgba(255,255,255,0.35)',
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom — user + logout */}
      <div className="shrink-0 px-2 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {userName ? (
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-[10px]" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #3b6cff, #8b5cf6)' }}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-[12px] font-medium flex-1 truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>{userName}</span>
            <a
              href={logoutHref}
              className="text-[10px] font-semibold px-2 py-1 rounded-[6px] no-underline shrink-0 transition-colors"
              style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              Out
            </a>
          </div>
        ) : (
          <a
            href={loginHref}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-[10px] no-underline text-[13px] font-semibold transition-colors"
            style={{ background: 'linear-gradient(135deg, #3b6cff, #8b5cf6)', color: '#fff' }}
          >
            Log in
          </a>
        )}
      </div>
    </aside>
  );
}

// ─── TabConfig & TabBar ───────────────────────────────────────────────────────
export type TabConfig = {
  id: string;
  label: string;
  icon: string;
  color: string;
  badge?: number;
};

export function TabBar({
  tabs,
  activeId,
  onChange,
}: {
  tabs: readonly TabConfig[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="shrink-0 bg-white border-b border-[#e2e4ef] px-5">
      <div className="flex items-center gap-0.5 overflow-x-auto">
        {tabs.map(tab => {
          const isActive = activeId === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex items-center gap-1.5 px-4 py-3 text-[13px] font-semibold bg-transparent cursor-pointer shrink-0 transition-colors border-0 outline-none"
              style={{
                color: isActive ? tab.color : '#9498b3',
                borderBottom: `2px solid ${isActive ? tab.color : 'transparent'}`,
                marginBottom: -1,
              }}
            >
              <span className="text-[14px]">{tab.icon}</span>
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && tab.badge > 0 && (
                <span
                  className="text-[10px] font-bold px-1.5 py-[1px] rounded-full"
                  style={{
                    background: isActive ? `${tab.color}18` : '#f0f1f7',
                    color: isActive ? tab.color : '#9498b3',
                    border: isActive ? `1px solid ${tab.color}30` : '1px solid #e2e4ef',
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── LivePill ─────────────────────────────────────────────────────────────────
export function LivePill({
  dotColor,
  textColor,
  bgClass,
  borderClass,
  label,
  showDot = true,
}: {
  dotColor?: string;
  textColor: string;
  bgClass: string;
  borderClass: string;
  label: string;
  showDot?: boolean;
}) {
  return (
    <div className={`flex items-center gap-1.5 ${bgClass} ${borderClass} border rounded-full px-2.5 py-[4px]`}>
      {showDot && dotColor && (
        <StatusDot color={dotColor} pulse size="sm" />
      )}
      <span
        className={`text-[10px] ${textColor} font-semibold tracking-[0.05em]`}
        style={{ fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace' }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({
  message,
  hint,
  icon,
}: {
  message: string;
  hint?: React.ReactNode;
  icon?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      {icon && (
        <div className="text-3xl mb-3 opacity-25">{icon}</div>
      )}
      <div className="text-[13px] text-[#9498b3] font-medium">{message}</div>
      {hint && (
        <div className="text-[11px] text-[#9498b3] mt-1">{hint}</div>
      )}
    </div>
  );
}

// ─── StatusBanner ─────────────────────────────────────────────────────────────
export function StatusBanner({
  type,
  text,
  className = '',
}: {
  type: 'success' | 'error';
  text: string;
  className?: string;
}) {
  const isSuccess = type === 'success';
  return (
    <div
      className={`text-xs px-3 py-[7px] rounded-[6px] font-semibold shrink-0 ${className}`}
      style={{
        background: isSuccess ? '#e7faf0' : '#fef2f2',
        color: isSuccess ? '#12b76a' : '#ef4444',
        border: `1px solid ${isSuccess ? '#12b76a33' : '#ef444433'}`,
        fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace',
      }}
    >
      {isSuccess ? '✓' : '✗'} {text}
    </div>
  );
}

// ─── RevokeButton ─────────────────────────────────────────────────────────────
export function RevokeButton({
  onClick,
  small = false,
}: {
  onClick: () => void;
  small?: boolean;
}) {
  if (small) {
    return (
      <button
        onClick={onClick}
        className="text-[10px] font-semibold px-2 py-[3px] rounded-[6px] bg-[#fef2f2] text-[#ef4444] border border-[#ef444420] cursor-pointer hover:bg-[#fee2e2] transition-colors"
        style={{ fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace' }}
      >
        Revoke
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className="text-[11px] font-semibold px-2.5 py-[5px] rounded-[6px] bg-[#fef2f2] text-[#ef4444] border border-[#ef444420] cursor-pointer shrink-0 whitespace-nowrap hover:bg-[#fee2e2] transition-colors"
      style={{ fontFamily: 'var(--font-ibm-plex-mono), IBM Plex Mono, monospace' }}
    >
      Revoke
    </button>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
export function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      style={{
        position: 'relative',
        flexShrink: 0,
        width: '40px',
        height: '22px',
        borderRadius: 999,
        border: 'none',
        cursor: 'pointer',
        background: enabled ? '#3b6cff' : '#d0d3e2',
        transition: 'background 150ms',
        padding: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '3px',
          borderRadius: '50%',
          width: '16px',
          height: '16px',
          background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
          left: enabled ? '21px' : '3px',
          transition: 'left 150ms',
        }}
      />
    </button>
  );
}

// ─── FilterInput ──────────────────────────────────────────────────────────────
export function FilterInput({
  value,
  onChange,
  placeholder = 'Filter…',
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`flex-1 rounded-[10px] px-3 py-[7px] text-xs border border-[#e2e4ef] bg-[#f0f1f7] text-[#1a1d2e] outline-none min-w-0 placeholder:text-[#9498b3] focus:border-[#3b6cff] transition-colors ${className}`}
      style={{
        boxShadow: 'none',
      }}
      onFocus={e => { e.target.style.boxShadow = '0 0 0 3px rgba(59,108,255,0.12)'; }}
      onBlur={e => { e.target.style.boxShadow = 'none'; }}
    />
  );
}
