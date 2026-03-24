'use client';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { AuditEntry } from '@/lib/types';

interface Props { entries: AuditEntry[] }

const COLORS: Record<string, string> = {
  ALLOWED:   '#12b76a',
  DENIED:    '#ef4444',
  ESCALATED: '#f59e0b',
  REVOKED:   '#8b5cf6',
  OTHER:     '#d0d3e2',
};

const DESCRIPTIONS: Record<string, string> = {
  ALLOWED:   'Requests approved by policy',
  DENIED:    'Requests blocked by policy',
  ESCALATED: 'Requests sent for human approval',
  REVOKED:   'Tokens or agents revoked',
  OTHER:     'Other audit events',
};

export function DecisionDonut({ entries }: Props) {
  const svgRef  = useRef<SVGSVGElement>(null);
  const tipRef  = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const counts: Record<string, number> = {};
    for (const e of entries) {
      const key = ['ALLOWED','DENIED','ESCALATED','REVOKED'].includes(e.decision) ? e.decision : 'OTHER';
      counts[key] = (counts[key] ?? 0) + 1;
    }

    const data = Object.entries(counts).filter(([, v]) => v > 0);
    const total = data.reduce((s, [, v]) => s + v, 0);

    const W = 160, H = 160, R = 60, IR = 38;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('width', W).attr('height', H);

    const g = svg.append('g').attr('transform', `translate(${W / 2},${H / 2})`);

    const pie = d3.pie<[string, number]>().value(d => d[1]).sort(null).padAngle(0.03);
    const arc = d3.arc<d3.PieArcDatum<[string, number]>>().innerRadius(IR).outerRadius(R).cornerRadius(4);
    const arcHover = d3.arc<d3.PieArcDatum<[string, number]>>().innerRadius(IR).outerRadius(R + 7).cornerRadius(4);

    const showTip = (event: MouseEvent, label: string, count: number) => {
      const tip = tipRef.current;
      const wrap = wrapRef.current;
      if (!tip || !wrap) return;
      const rect = wrap.getBoundingClientRect();
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
      tip.innerHTML = `
        <div style="font-weight:700;color:#1a1d2e;margin-bottom:2px">${label}</div>
        <div style="color:#5c6078;font-size:11px">${DESCRIPTIONS[label] ?? ''}</div>
        <div style="margin-top:5px;display:flex;gap:10px">
          <span style="font-weight:700;color:${COLORS[label] ?? '#333'};font-size:14px">${count}</span>
          <span style="color:#9498b3;font-size:12px">${pct}%</span>
        </div>`;
      tip.style.display = 'block';
      tip.style.left = `${event.clientX - rect.left + 12}px`;
      tip.style.top  = `${event.clientY - rect.top  - 10}px`;
    };
    const hideTip = () => { if (tipRef.current) tipRef.current.style.display = 'none'; };

    const arcs = g.selectAll('path')
      .data(pie(data))
      .enter().append('path')
      .attr('d', arc)
      .attr('fill', d => COLORS[d.data[0]] ?? COLORS.OTHER)
      .attr('opacity', 0.88)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event: MouseEvent, d) {
        d3.select(this).attr('d', arcHover(d) ?? '').attr('opacity', 1);
        centerNum.text(d.data[1]);
        centerLabel.text(d.data[0]);
        showTip(event, d.data[0], d.data[1]);
      })
      .on('mousemove', function(event: MouseEvent, d) {
        showTip(event, d.data[0], d.data[1]);
      })
      .on('mouseleave', function(_, d) {
        d3.select(this).attr('d', arc(d) ?? '').attr('opacity', 0.88);
        centerNum.text(total);
        centerLabel.text('total');
        hideTip();
      });

    arcs.each(function(d) {
      const el = d3.select(this);
      const start = { startAngle: d.startAngle, endAngle: d.startAngle };
      el.attr('d', arc({ ...d, ...start }) ?? '');
      el.transition().duration(600).ease(d3.easeCubicOut)
        .attrTween('d', () => { const i = d3.interpolate(start, d); return (t: number) => arc(i(t)) ?? ''; });
    });

    const centerNum = g.append('text')
      .attr('text-anchor', 'middle').attr('dy', '0.15em')
      .attr('font-size', 20).attr('font-weight', 700).attr('fill', '#1a1d2e').text(total);

    const centerLabel = g.append('text')
      .attr('text-anchor', 'middle').attr('dy', '1.6em')
      .attr('font-size', 9).attr('fill', '#9498b3').text('total');

  }, [entries]);

  const counts: Record<string, number> = {};
  for (const e of entries) {
    const key = ['ALLOWED','DENIED','ESCALATED','REVOKED'].includes(e.decision) ? e.decision : 'OTHER';
    counts[key] = (counts[key] ?? 0) + 1;
  }
  const legendItems = Object.entries(counts).filter(([, v]) => v > 0);
  const total = legendItems.reduce((s, [, v]) => s + v, 0);

  return (
    <div ref={wrapRef} className="relative flex items-center gap-5">
      {/* Floating tooltip */}
      <div
        ref={tipRef}
        style={{
          display: 'none', position: 'absolute', zIndex: 50, pointerEvents: 'none',
          background: '#fff', border: '1px solid #e2e4ef', borderRadius: 10,
          padding: '8px 12px', boxShadow: '0 4px 16px rgba(0,0,0,.10)',
          fontFamily: 'DM Sans, sans-serif', fontSize: 12, minWidth: 140, whiteSpace: 'nowrap',
        }}
      />
      <svg ref={svgRef} />
      <div className="flex flex-col gap-2 min-w-[108px]">
        {legendItems.map(([label, count]) => (
          <div key={label} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[label] ?? COLORS.OTHER }} />
              <span className="text-[11px] text-[#5c6078] font-medium">{label}</span>
            </div>
            <span className="text-[11px] font-bold text-[#1a1d2e] font-[family-name:var(--font-ibm-plex-mono)]">
              {total > 0 ? Math.round((count / total) * 100) : 0}%
            </span>
          </div>
        ))}
        {legendItems.length === 0 && <span className="text-[11px] text-[#9498b3] italic">No data yet</span>}
      </div>
    </div>
  );
}
