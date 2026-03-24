'use client';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { AuditEntry } from '@/lib/types';

interface Props { entries: AuditEntry[] }

const SEGMENTS = [
  { key: 'ALLOWED',   label: 'Allowed',   desc: 'Requests approved by policy',              color: '#12b76a' },
  { key: 'DENIED',    label: 'Denied',    desc: 'Requests blocked — policy violation',       color: '#ef4444' },
  { key: 'ESCALATED', label: 'Escalated', desc: 'Sent for human approval via CIBA',          color: '#f59e0b' },
  { key: 'REVOKED',   label: 'Revoked',   desc: 'Token or agent access revoked',             color: '#8b5cf6' },
];

export function DecisionRatioBar({ entries }: Props) {
  const svgRef  = useRef<SVGSVGElement>(null);
  const tipRef  = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const data = SEGMENTS.map(s => ({ ...s, count: entries.filter(e => e.decision === s.key).length }));
  const total   = data.reduce((s, d) => s + d.count, 0);
  const allowed = data.find(d => d.key === 'ALLOWED')?.count ?? 0;
  const pct     = total > 0 ? Math.round((allowed / total) * 100) : 0;

  useEffect(() => {
    if (!svgRef.current) return;
    const W = 220, H = 56, BAR_Y = 22, BAR_H = 14;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('width', W).attr('height', H);

    if (total === 0) {
      svg.append('rect').attr('x', 0).attr('y', BAR_Y).attr('width', W).attr('height', BAR_H).attr('rx', 7).attr('fill', '#e2e4ef');
      svg.append('text').attr('x', W / 2).attr('y', BAR_Y - 7).attr('text-anchor', 'middle')
        .attr('font-size', 10).attr('fill', '#9498b3').text('No decisions yet');
      return;
    }

    // % label
    svg.append('text').attr('x', W / 2).attr('y', BAR_Y - 7)
      .attr('text-anchor', 'middle').attr('font-size', 11).attr('font-weight', 700).attr('fill', '#1a1d2e')
      .text(`${pct}% allow rate`);

    const showTip = (event: MouseEvent, d: typeof data[0]) => {
      const tip = tipRef.current; const wrap = wrapRef.current;
      if (!tip || !wrap) return;
      const rect = wrap.getBoundingClientRect();
      const p = total > 0 ? Math.round((d.count / total) * 100) : 0;
      tip.innerHTML = `
        <div style="font-weight:700;color:#1a1d2e;margin-bottom:2px">${d.label}</div>
        <div style="color:#5c6078;font-size:11px">${d.desc}</div>
        <div style="margin-top:5px;display:flex;gap:10px">
          <span style="font-weight:700;color:${d.color};font-size:14px">${d.count}</span>
          <span style="color:#9498b3;font-size:12px">${p}% of requests</span>
        </div>`;
      tip.style.display = 'block';
      tip.style.left = `${event.clientX - rect.left + 12}px`;
      tip.style.top  = `${event.clientY - rect.top  - 10}px`;
    };
    const hideTip = () => { if (tipRef.current) tipRef.current.style.display = 'none'; };

    // Draw segments
    const nonZero = data.filter(d => d.count > 0);
    let cursor = 0;
    nonZero.forEach((d, i) => {
      const segW = (d.count / total) * W;
      const isFirst = i === 0, isLast = i === nonZero.length - 1;

      // Rounded ends via clip path
      const clipId = `clip-${d.key}`;
      const defs = svg.append('defs');
      const cp = defs.append('clipPath').attr('id', clipId);
      cp.append('rect')
        .attr('x', cursor).attr('y', BAR_Y)
        .attr('width', segW).attr('height', BAR_H)
        .attr('rx', isFirst || isLast ? 7 : 0);

      svg.append('rect')
        .attr('x', cursor).attr('y', BAR_Y)
        .attr('width', 0).attr('height', BAR_H)
        .attr('fill', d.color).attr('opacity', 0.88)
        .attr('clip-path', `url(#${clipId})`)
        .style('cursor', 'pointer')
        .on('mouseenter', function(event: MouseEvent) {
          d3.select(this).attr('opacity', 1);
          showTip(event, d);
        })
        .on('mousemove', (event: MouseEvent) => showTip(event, d))
        .on('mouseleave', function() { d3.select(this).attr('opacity', 0.88); hideTip(); })
        .transition().duration(600).ease(d3.easeCubicOut).delay(i * 80)
        .attr('width', segW);

      cursor += segW;
    });

    // Legend
    const legendY = BAR_Y + BAR_H + 14;
    let lx = 0;
    nonZero.forEach(d => {
      svg.append('circle').attr('cx', lx + 4).attr('cy', legendY).attr('r', 3.5).attr('fill', d.color);
      svg.append('text').attr('x', lx + 11).attr('y', legendY + 4)
        .attr('font-size', 8.5).attr('fill', '#5c6078')
        .text(`${d.label} ${d.count}`);
      lx += 58;
    });

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
          <div className="text-[26px] font-bold text-[#12b76a] leading-none">{allowed}</div>
          <div className="text-[11px] text-[#9498b3] mt-0.5">allowed requests</div>
        </div>
        <div className="text-right">
          <div className="text-[13px] font-bold text-[#ef4444] leading-none">{data.find(d => d.key === 'DENIED')?.count ?? 0}</div>
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
