'use client';
import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import type { AgentEvent } from '@/lib/types';

interface Props { events: AgentEvent[] }

export function ActivitySparkline({ events }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Bucket events into 30-second slots over the last 5 minutes
  const buckets = useMemo(() => {
    const now = Date.now();
    const SLOTS = 20;
    const SLOT_MS = 15_000; // 15 s each = 5 min total
    const slots: { time: number; count: number }[] = Array.from({ length: SLOTS }, (_, i) => ({
      time: now - (SLOTS - 1 - i) * SLOT_MS,
      count: 0,
    }));
    for (const ev of events) {
      const t = new Date(ev.timestamp).getTime();
      const idx = Math.floor((t - (now - SLOTS * SLOT_MS)) / SLOT_MS);
      if (idx >= 0 && idx < SLOTS) slots[idx].count++;
    }
    return slots;
  }, [events]);

  useEffect(() => {
    if (!svgRef.current) return;
    const W = 260, H = 72, PAD = { t: 8, r: 4, b: 20, l: 28 };

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('width', W).attr('height', H);

    const x = d3.scaleLinear()
      .domain([0, buckets.length - 1])
      .range([PAD.l, W - PAD.r]);

    const maxVal = Math.max(d3.max(buckets, d => d.count) ?? 0, 1);
    const y = d3.scaleLinear()
      .domain([0, maxVal])
      .range([H - PAD.b, PAD.t]);

    // Grid lines
    const ticks = y.ticks(3);
    svg.append('g').selectAll('line').data(ticks).enter()
      .append('line')
      .attr('x1', PAD.l).attr('x2', W - PAD.r)
      .attr('y1', d => y(d)).attr('y2', d => y(d))
      .attr('stroke', '#e2e4ef').attr('stroke-dasharray', '3,3');

    // Y axis labels
    svg.append('g').selectAll('text').data(ticks).enter()
      .append('text')
      .attr('x', PAD.l - 5).attr('y', d => y(d) + 4)
      .attr('text-anchor', 'end').attr('font-size', 9).attr('fill', '#9498b3')
      .text(d => d);

    // Area
    const area = d3.area<{ time: number; count: number }>()
      .x((_, i) => x(i))
      .y0(H - PAD.b)
      .y1(d => y(d.count))
      .curve(d3.curveCatmullRom.alpha(0.5));

    // Gradient
    const defs = svg.append('defs');
    const grad = defs.append('linearGradient')
      .attr('id', 'sparkGrad').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', 1);
    grad.append('stop').attr('offset', '0%').attr('stop-color', '#3b6cff').attr('stop-opacity', 0.22);
    grad.append('stop').attr('offset', '100%').attr('stop-color', '#3b6cff').attr('stop-opacity', 0.02);

    svg.append('path').datum(buckets)
      .attr('fill', 'url(#sparkGrad)')
      .attr('d', area);

    // Line
    const line = d3.line<{ time: number; count: number }>()
      .x((_, i) => x(i))
      .y(d => y(d.count))
      .curve(d3.curveCatmullRom.alpha(0.5));

    const path = svg.append('path').datum(buckets)
      .attr('fill', 'none')
      .attr('stroke', '#3b6cff')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Animate line draw
    const len = (path.node() as SVGPathElement)?.getTotalLength() ?? 0;
    path.attr('stroke-dasharray', `${len} ${len}`)
      .attr('stroke-dashoffset', len)
      .transition().duration(800).ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0);

    // Dots on non-zero values
    svg.append('g').selectAll('circle')
      .data(buckets.filter(d => d.count > 0))
      .enter().append('circle')
      .attr('cx', (_, i) => x(buckets.findIndex(b => b === buckets.filter(d => d.count > 0)[i])))
      .attr('cy', d => y(d.count))
      .attr('r', 3)
      .attr('fill', '#3b6cff')
      .attr('opacity', 0.85);

    // X axis — time labels
    const labelIdx = [0, Math.floor(buckets.length / 2), buckets.length - 1];
    svg.append('g').selectAll('text').data(labelIdx).enter()
      .append('text')
      .attr('x', i => x(i))
      .attr('y', H - 5)
      .attr('text-anchor', 'middle').attr('font-size', 9).attr('fill', '#9498b3')
      .text(i => {
        const t = new Date(buckets[i].time);
        return `${t.getHours()}:${String(t.getMinutes()).padStart(2,'0')}`;
      });

  }, [buckets]);

  const total = buckets.reduce((s, b) => s + b.count, 0);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[#9498b3]">Events / 5 min</span>
        <span className="text-[11px] font-bold text-[#1a1d2e] font-[family-name:var(--font-ibm-plex-mono)]">{total}</span>
      </div>
      <svg ref={svgRef} />
    </div>
  );
}
