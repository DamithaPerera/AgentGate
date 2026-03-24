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

export function DecisionDonut({ entries }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Count decisions
    const counts: Record<string, number> = {};
    for (const e of entries) {
      const key = ['ALLOWED','DENIED','ESCALATED','REVOKED'].includes(e.decision)
        ? e.decision : 'OTHER';
      counts[key] = (counts[key] ?? 0) + 1;
    }

    const data = Object.entries(counts).filter(([, v]) => v > 0);
    const total = data.reduce((s, [, v]) => s + v, 0);

    const W = 180, H = 180, R = 68, IR = 44;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('width', W).attr('height', H);

    const g = svg.append('g').attr('transform', `translate(${W / 2},${H / 2})`);

    const pie = d3.pie<[string, number]>()
      .value(d => d[1])
      .sort(null)
      .padAngle(0.03);

    const arc = d3.arc<d3.PieArcDatum<[string, number]>>()
      .innerRadius(IR).outerRadius(R).cornerRadius(4);

    const arcHover = d3.arc<d3.PieArcDatum<[string, number]>>()
      .innerRadius(IR).outerRadius(R + 6).cornerRadius(4);

    const arcs = g.selectAll('path')
      .data(pie(data))
      .enter().append('path')
      .attr('d', arc)
      .attr('fill', d => COLORS[d.data[0]] ?? COLORS.OTHER)
      .attr('opacity', 0.9)
      .style('cursor', 'pointer')
      .style('transition', 'opacity 0.15s')
      .on('mouseenter', function(_, d) {
        d3.select(this).attr('d', arcHover(d) ?? '').attr('opacity', 1);
        // update center text
        centerNum.text(d.data[1]);
        centerLabel.text(d.data[0]);
      })
      .on('mouseleave', function(_, d) {
        d3.select(this).attr('d', arc(d) ?? '').attr('opacity', 0.9);
        centerNum.text(total);
        centerLabel.text('total');
      });

    // Animate arcs
    arcs.each(function(d) {
      const el = d3.select(this);
      const start = { startAngle: d.startAngle, endAngle: d.startAngle };
      el.attr('d', arc({ ...d, ...start }) ?? '');
      el.transition().duration(600).ease(d3.easeCubicOut)
        .attrTween('d', () => {
          const interp = d3.interpolate(start, d);
          return (t: number) => arc(interp(t)) ?? '';
        });
    });

    // Center text
    const centerNum = g.append('text')
      .attr('text-anchor', 'middle').attr('dy', '0.1em')
      .attr('font-size', 22).attr('font-weight', 700)
      .attr('fill', '#1a1d2e')
      .text(total);

    const centerLabel = g.append('text')
      .attr('text-anchor', 'middle').attr('dy', '1.5em')
      .attr('font-size', 10).attr('fill', '#9498b3')
      .text('total');

  }, [entries]);

  // Legend
  const counts: Record<string, number> = {};
  for (const e of entries) {
    const key = ['ALLOWED','DENIED','ESCALATED','REVOKED'].includes(e.decision) ? e.decision : 'OTHER';
    counts[key] = (counts[key] ?? 0) + 1;
  }
  const legendItems = Object.entries(counts).filter(([, v]) => v > 0);
  const total = legendItems.reduce((s, [, v]) => s + v, 0);

  return (
    <div className="flex items-center gap-6">
      <svg ref={svgRef} />
      <div className="flex flex-col gap-2 min-w-[110px]">
        {legendItems.map(([label, count]) => (
          <div key={label} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[label] ?? COLORS.OTHER }} />
              <span className="text-[11px] text-[#5c6078] font-medium">{label}</span>
            </div>
            <span className="text-[11px] font-bold text-[#1a1d2e] font-[family-name:var(--font-ibm-plex-mono)]">
              {total > 0 ? Math.round((count / total) * 100) : 0}%
            </span>
          </div>
        ))}
        {legendItems.length === 0 && (
          <span className="text-[11px] text-[#9498b3] italic">No data yet</span>
        )}
      </div>
    </div>
  );
}
