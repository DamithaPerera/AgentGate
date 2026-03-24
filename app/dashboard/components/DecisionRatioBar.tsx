'use client';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { AuditEntry } from '@/lib/types';

interface Props { entries: AuditEntry[] }

const SEGMENTS = [
  { key: 'ALLOWED',   label: 'Allowed',   color: '#12b76a' },
  { key: 'DENIED',    label: 'Denied',    color: '#ef4444' },
  { key: 'ESCALATED', label: 'Escalated', color: '#f59e0b' },
  { key: 'REVOKED',   label: 'Revoked',   color: '#8b5cf6' },
];

export function DecisionRatioBar({ entries }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  const data = SEGMENTS.map(s => ({
    ...s,
    count: entries.filter(e => e.decision === s.key).length,
  }));
  const total = data.reduce((s, d) => s + d.count, 0);
  const allowed = data.find(d => d.key === 'ALLOWED')?.count ?? 0;
  const pct = total > 0 ? Math.round((allowed / total) * 100) : 0;

  useEffect(() => {
    if (!svgRef.current) return;
    const W = 220, H = 80, PAD = { t: 32, r: 0, b: 0, l: 0 };
    const BAR_H = 14;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('width', W).attr('height', H);

    if (total === 0) {
      svg.append('rect').attr('x', 0).attr('y', PAD.t).attr('width', W).attr('height', BAR_H)
        .attr('rx', 7).attr('fill', '#e2e4ef');
      return;
    }

    // Stacked horizontal bar
    let cursor = 0;
    const nonZero = data.filter(d => d.count > 0);

    nonZero.forEach((d, i) => {
      const segW = (d.count / total) * W;
      const rx = i === 0 ? 7 : i === nonZero.length - 1 ? 7 : 0;

      // Background rect for clipping corners
      const rect = svg.append('rect')
        .attr('x', cursor).attr('y', PAD.t)
        .attr('width', 0).attr('height', BAR_H)
        .attr('fill', d.color).attr('opacity', 0.88);

      if (i === 0) rect.attr('rx', rx).attr('ry', rx);
      if (i === nonZero.length - 1) {
        rect.attr('rx', 0);
        // rounded right side via path
        svg.append('path')
          .attr('d', `M${cursor},${PAD.t} h${segW - 7} q7,0 7,7 v0 q0,7 -7,7 h${-(segW - 7)} Z`)
          .attr('fill', d.color).attr('opacity', 0)
          .transition().duration(600).ease(d3.easeCubicOut).delay(i * 80)
          .attr('opacity', 0.88);
      }

      rect.transition().duration(600).ease(d3.easeCubicOut).delay(i * 80)
        .attr('width', segW);

      cursor += segW;
    });

    // Percentage label above bar
    svg.append('text')
      .attr('x', W / 2).attr('y', PAD.t - 12)
      .attr('text-anchor', 'middle').attr('font-size', 11).attr('font-weight', 700)
      .attr('fill', '#1a1d2e')
      .text(`${pct}% allow rate`);

    // Tick mark at allowed boundary
    if (allowed > 0 && allowed < total) {
      const tickX = (allowed / total) * W;
      svg.append('line')
        .attr('x1', tickX).attr('x2', tickX)
        .attr('y1', PAD.t - 4).attr('y2', PAD.t + BAR_H + 4)
        .attr('stroke', '#fff').attr('stroke-width', 2).attr('opacity', 0.7);
    }

    // Legend row below bar
    const legendY = PAD.t + BAR_H + 14;
    let lx = 0;
    nonZero.forEach(d => {
      svg.append('circle').attr('cx', lx + 4).attr('cy', legendY).attr('r', 3.5).attr('fill', d.color);
      svg.append('text')
        .attr('x', lx + 11).attr('y', legendY + 4)
        .attr('font-size', 8.5).attr('fill', '#5c6078')
        .text(`${d.label} ${d.count}`);
      lx += 55;
    });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[26px] font-bold text-[#12b76a] leading-none">{allowed}</div>
          <div className="text-[11px] text-[#9498b3] mt-0.5">allowed requests</div>
        </div>
        <div className="text-right">
          <div className="text-[13px] font-bold text-[#ef4444] leading-none">
            {data.find(d => d.key === 'DENIED')?.count ?? 0}
          </div>
          <div className="text-[9px] text-[#9498b3]">denied</div>
        </div>
      </div>
      {total === 0
        ? <div className="text-[11px] text-[#9498b3] italic py-4 text-center">No decisions yet</div>
        : <svg ref={svgRef} />
      }
    </div>
  );
}
