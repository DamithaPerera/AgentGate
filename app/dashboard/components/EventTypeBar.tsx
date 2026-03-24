'use client';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { AuditEntry } from '@/lib/types';

interface Props { entries: AuditEntry[] }

const TYPE_GROUPS: { label: string; types: string[]; color: string }[] = [
  { label: 'Auth',    types: ['AUTH_REQUEST'],                                color: '#3b6cff' },
  { label: 'Policy',  types: ['POLICY_EVAL'],                                 color: '#8b5cf6' },
  { label: 'CIBA',    types: ['CIBA_REQUEST','CIBA_APPROVED','CIBA_DENIED','CIBA_EXPIRED'], color: '#f59e0b' },
  { label: 'Token',   types: ['TOKEN_ISSUED','TOKEN_EXPIRED','TOKEN_REVOKED'], color: '#12b76a' },
  { label: 'Revoke',  types: ['AGENT_REVOKED','SERVICE_REVOKED','CASCADE_REVOCATION','PANIC_REVOCATION'], color: '#ef4444' },
  { label: 'Other',   types: ['REGISTRATION'],                                color: '#06b6d4' },
];

export function EventTypeBar({ entries }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  const data = TYPE_GROUPS.map(g => ({
    ...g,
    count: entries.filter(e => g.types.includes(e.type)).length,
  })).filter(d => d.count > 0);

  const total = data.reduce((s, d) => s + d.count, 0);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const W = 220, H = 100, PAD = { t: 4, r: 4, b: 28, l: 44 };
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('width', W).attr('height', H);

    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count) ?? 1])
      .range([0, W - PAD.l - PAD.r]);

    const y = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([PAD.t, H - PAD.b])
      .padding(0.35);

    // Grid lines
    const ticks = x.ticks(4);
    svg.append('g').selectAll('line').data(ticks).enter()
      .append('line')
      .attr('x1', d => PAD.l + x(d)).attr('x2', d => PAD.l + x(d))
      .attr('y1', PAD.t).attr('y2', H - PAD.b)
      .attr('stroke', '#e2e4ef').attr('stroke-dasharray', '3,3');

    // X axis ticks
    svg.append('g').selectAll('text').data(ticks).enter()
      .append('text')
      .attr('x', d => PAD.l + x(d))
      .attr('y', H - PAD.b + 12)
      .attr('text-anchor', 'middle').attr('font-size', 8).attr('fill', '#9498b3')
      .text(d => d);

    // Y axis labels
    svg.append('g').selectAll('text').data(data).enter()
      .append('text')
      .attr('x', PAD.l - 6)
      .attr('y', d => (y(d.label) ?? 0) + y.bandwidth() / 2 + 4)
      .attr('text-anchor', 'end').attr('font-size', 9).attr('fill', '#5c6078').attr('font-weight', 500)
      .text(d => d.label);

    // Bars
    const bars = svg.append('g').selectAll('rect').data(data).enter()
      .append('rect')
      .attr('x', PAD.l)
      .attr('y', d => y(d.label) ?? 0)
      .attr('height', y.bandwidth())
      .attr('rx', 3)
      .attr('fill', d => d.color)
      .attr('opacity', 0.85)
      .attr('width', 0);

    bars.transition().duration(700).ease(d3.easeCubicOut)
      .delay((_, i) => i * 60)
      .attr('width', d => x(d.count));

    // Value labels
    svg.append('g').selectAll('text').data(data).enter()
      .append('text')
      .attr('x', d => PAD.l + x(d.count) + 5)
      .attr('y', d => (y(d.label) ?? 0) + y.bandwidth() / 2 + 4)
      .attr('font-size', 9).attr('fill', '#1a1d2e').attr('font-weight', 700)
      .attr('opacity', 0)
      .text(d => d.count)
      .transition().duration(700).delay((_, i) => i * 60 + 400)
      .attr('opacity', 1);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  return (
    <div className="flex flex-col gap-2">
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
