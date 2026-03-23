'use client';
import React from 'react';

// ─── Badge ────────────────────────────────────────────────────────────────────
// Colored rounded pill. Pass dynamic colors via `style`; static variants via `className`.
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
      className={`text-[11px] px-[7px] py-0.5 rounded-full font-semibold shrink-0 ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}

// ─── StatusDot ────────────────────────────────────────────────────────────────
// Small dot. `color` is a runtime value so passed as inline style.
// `pulse` adds the Tailwind animate-pulse class.
export function StatusDot({
  color,
  pulse = false,
  size = 'md',
}: {
  color: string;
  pulse?: boolean;
  size?: 'sm' | 'md';
}) {
  const dim = size === 'sm' ? 'w-[5px] h-[5px]' : 'w-1.5 h-1.5';
  return (
    <span
      className={`${dim} rounded-full inline-block shrink-0 ${pulse ? 'animate-pulse' : ''}`}
      style={{ background: color }}
    />
  );
}

// ─── AgentDot ─────────────────────────────────────────────────────────────────
// The agent status dot with optional glow — used next to agent names.
export function AgentDot({ active }: { active: boolean }) {
  return (
    <span
      className="w-[7px] h-[7px] rounded-full inline-block shrink-0"
      style={{
        background: active ? '#16A34A' : '#DC2626',
        boxShadow: active ? '0 0 6px rgba(22,163,74,0.5)' : 'none',
      }}
    />
  );
}

// ─── IconBox ──────────────────────────────────────────────────────────────────
// Small rounded square containing an emoji/icon. `bgClass` defaults to a light blue tint.
export function IconBox({
  icon,
  bgClass = 'bg-[#EFF6FF]',
  size = 'md',
}: {
  icon: string;
  bgClass?: string;
  size?: 'sm' | 'md';
}) {
  const dims = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-7 h-7 text-sm';
  return (
    <div className={`${dims} rounded-md ${bgClass} flex items-center justify-center`}>
      {icon}
    </div>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
// Panel header: IconBox + bold title + muted subtitle, with an optional right-side badge/slot.
export function SectionHeader({
  icon,
  iconBgClass,
  title,
  subtitle,
  right,
}: {
  icon: string;
  iconBgClass?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="px-4 py-3.5 bg-white border-b border-[#E2E8F0] flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2">
        <IconBox icon={icon} bgClass={iconBgClass} />
        <div>
          <div className="font-bold text-[13px] text-[#0F172A]">{title}</div>
          {subtitle && <div className="text-[11px] text-[#64748B] mt-px">{subtitle}</div>}
        </div>
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

// ─── LivePill ─────────────────────────────────────────────────────────────────
// The small LIVE / SSE / tamper-evident pill shown in panel headers.
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
    <div className={`flex items-center gap-1.5 ${bgClass} ${borderClass} border rounded-full px-2 py-[3px]`}>
      {showDot && dotColor && (
        <StatusDot color={dotColor} pulse size="sm" />
      )}
      <span className={`text-[11px] ${textColor} font-semibold`}>{label}</span>
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
// Centered placeholder message with an optional secondary hint.
export function EmptyState({
  message,
  hint,
}: {
  message: string;
  hint?: React.ReactNode;
}) {
  return (
    <div className="text-center px-4 py-8 text-[#475569] text-[13px]">
      {message}
      {hint && (
        <>
          <br />
          <span className="text-xs">{hint}</span>
        </>
      )}
    </div>
  );
}

// ─── StatusBanner ─────────────────────────────────────────────────────────────
// Success / error result banner. Colors are driven by the `type` prop.
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
      className={`text-xs px-3 py-[7px] rounded-lg font-semibold shrink-0 ${className}`}
      style={{
        background: isSuccess ? '#F0FDF4' : '#FFF1F2',
        color: isSuccess ? '#16A34A' : '#DC2626',
        border: `1px solid ${isSuccess ? '#BBF7D0' : '#FECDD3'}`,
      }}
    >
      {isSuccess ? '✓' : '✗'} {text}
    </div>
  );
}

// ─── RevokeButton ─────────────────────────────────────────────────────────────
// Standard red revoke button. `small` renders a more compact variant.
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
        className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#FFF1F2] text-[#DC2626] border border-[#FECDD3] cursor-pointer"
      >
        Revoke
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[#FFF1F2] text-[#DC2626] border border-[#FECDD3] cursor-pointer shrink-0 whitespace-nowrap"
    >
      Revoke
    </button>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
// Animated toggle switch. All positioning is inline style because it's dynamic geometry.
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
        width: '2rem',
        height: '1rem',
        borderRadius: 999,
        border: 'none',
        cursor: 'pointer',
        background: enabled ? '#0052CC' : '#334155',
        transition: 'background 150ms',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '0.125rem',
          borderRadius: '50%',
          width: '0.75rem',
          height: '0.75rem',
          background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          left: enabled ? '1.125rem' : '0.125rem',
          transition: 'left 150ms',
        }}
      />
    </button>
  );
}

// ─── FilterInput ──────────────────────────────────────────────────────────────
// Standard search / filter text input.
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
      className={`flex-1 rounded-lg px-3 py-[7px] text-xs border border-[#E2E8F0] bg-white text-[#0F172A] outline-none min-w-0 ${className}`}
    />
  );
}
