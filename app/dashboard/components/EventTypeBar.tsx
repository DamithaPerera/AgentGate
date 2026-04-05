'use client';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { AuditEntry } from '@/lib/types';

interface Props { entries: AuditEntry[] }

const TYPE_GROUPS: { label: string; desc: string; types: string[]; color: string }[] = [
  { label: 'Auth',   desc: 'Agent authorization requests evaluated',           types: ['AUTH_REQUEST'],                                                        color: '#3b6cff' },
  { label: 'Policy', desc: 'Policy rules evaluated against requests',          types: ['POLICY_EVAL'],                                                         color: '#8b5cf6' },
  { label: 'CIBA',   desc: 'Human consent requests (approved/denied/expired)', types: ['CIBA_REQUEST','CIBA_APPROVED','CIBA_DENIED','CIBA_EXPIRED'],            color: '#f59e0b' },
  { label: 'Token',  desc: 'Scoped tokens issued, expired, or revoked',        types: ['TOKEN_ISSUED','TOKEN_EXPIRED','TOKEN_REVOKED'],                         color: '#12b76a' },
  { label: 'Revoke', desc: 'Agent or service access revoked',                  types: ['AGENT_REVOKED','SERVICE_REVOKED','CASCADE_REVOCATION','PANIC_REVOCATION'], color: '#ef4444' },
  { label: 'Other',  desc: 'Agent registrations and misc events',              types: ['REGISTRATION'],                                                        color: '#06b6d4' },
];

export function EventTypeBar({ entries }: Props) {
  const svgRef  = useRef<SVGSVGElement>(null);
  const tipRef  = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const data = TYPE_GROUPS.map(g => ({
    ...g,
    count: entries.filter(e => g.types.includes(e.type)).length,
  })).filter(d => d.count > 0);

  const total = data.reduce((s, d) => s + d.count, 0);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const W = 220, H = 100, PAD = { t: 4, r: 4, b: 26, l: 44 };
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('width', W).attr('height', H);

    const x = d3.scaleLinear().domain([0, d3.max(data, d => d.count) ?? 1]).range([0, W - PAD.l - PAD.r]);
    const y = d3.scaleBand().domain(data.map(d => d.label)).range([PAD.t, H - PAD.b]).padding(0.35);

    // Grid lines
    x.ticks(4).forEach(tick => {
      svg.append('line')
        .attr('x1', PAD.l + x(tick)).attr('x2', PAD.l + x(tick))
        .attr('y1', PAD.t).attr('y2', H - PAD.b)
        .attr('stroke', '#e2e4ef').attr('stroke-dasharray', '3,3');
      svg.append('text')
        .attr('x', PAD.l + x(tick)).attr('y', H - PAD.b + 12)
        .attr('text-anchor', 'middle').attr('font-size', 8).attr('fill', '#9498b3').text(tick);
    });

    // Y labels
    data.forEach(d => {
      svg.append('text')
        .attr('x', PAD.l - 6).attr('y', (y(d.label) ?? 0) + y.bandwidth() / 2 + 4)
        .attr('text-anchor', 'end').attr('font-size', 9).attr('fill', '#5c6078').attr('font-weight', 500)
        .text(d.label);
    });

    const showTip = (event: MouseEvent, d: typeof data[0]) => {
      const tip = tipRef.current; const wrap = wrapRef.current;
      if (!tip || !wrap) return;
      const rect = wrap.getBoundingClientRect();
      const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
      tip.innerHTML = `
        <div style="font-weight:700;color:#1a1d2e;margin-bottom:2px">${d.label}</div>
        <div style="color:#5c6078;font-size:11px">${d.desc}</div>
        <div style="margin-top:5px;display:flex;gap:10px">
          <span style="font-weight:700;color:${d.color};font-size:14px">${d.count}</span>
          <span style="color:#9498b3;font-size:12px">${pct}% of total</span>
        </div>`;
      tip.style.display = 'block';
      tip.style.left = `${event.clientX - rect.left + 12}px`;
      tip.style.top  = `${event.clientY - rect.top  - 10}px`;
    };
    const hideTip = () => { if (tipRef.current) tipRef.current.style.display = 'none'; };

    // Hover bg rects
    data.forEach(d => {
      svg.append('rect')
        .attr('x', PAD.l).attr('y', (y(d.label) ?? 0) - 2)
        .attr('width', W - PAD.l - PAD.r).attr('height', y.bandwidth() + 4)
        .attr('fill', 'transparent').attr('rx', 3)
        .style('cursor', 'pointer')
        .on('mouseenter', function(event: MouseEvent) {
          d3.select(this).attr('fill', `${d.color}10`);
          showTip(event, d);
        })
        .on('mousemove', (event: MouseEvent) => showTip(event, d))
        .on('mouseleave', function() { d3.select(this).attr('fill', 'transparent'); hideTip(); });
    });

    // Bars
    const bars = svg.append('g').selectAll('rect').data(data).enter()
      .append('rect')
      .attr('x', PAD.l).attr('y', d => y(d.label) ?? 0)
      .attr('height', y.bandwidth()).attr('rx', 3)
      .attr('fill', d => d.color).attr('opacity', 0.82)
      .attr('width', 0).style('pointer-events', 'none');

    bars.transition().duration(700).ease(d3.easeCubicOut)
      .delay((_, i) => i * 60).attr('width', d => x(d.count));

    // Value labels
    svg.append('g').selectAll('text').data(data).enter()
      .append('text')
      .attr('x', d => PAD.l + x(d.count) + 5).attr('y', d => (y(d.label) ?? 0) + y.bandwidth() / 2 + 4)
      .attr('font-size', 9).attr('fill', '#1a1d2e').attr('font-weight', 700)
      .attr('opacity', 0).style('pointer-events', 'none')
      .text(d => d.count)
      .transition().duration(700).delay((_, i) => i * 60 + 400).attr('opacity', 1);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  return (
    <div ref={wrapRef} className="relative flex flex-col gap-2">
      <div
        ref={tipRef}
        style={{
          display: 'none', position: 'absolute', zIndex: 50, pointerEvents: 'none',
          background: '#fff', border: '1px solid #e2e4ef', borderRadius: 10,
          padding: '8px 12px', boxShadow: '0 4px 16px rgba(0,0,0,.10)',
          fontFamily: 'DM Sans, sans-serif', fontSize: 12, minWidth: 160, whiteSpace: 'nowrap',
        }}
      />
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[26px] font-bold text-[#1a1d2e] leading-none">{total}</div>
          <div className="text-[11px] text-[#9498b3] mt-0.5">total events</div>
        </div>
        <span className="text-[10px] text-[#9498b3] font-[family-name:var(--font-ibm-plex-mono)]">by type</span>
      </div>
      {total === 0
        ? <div className="text-[11px] text-[#9498b3] italic py-4 text-center">No events yet</div>
        : <svg ref={svgRef} />
      }
    </div>
  );
}
