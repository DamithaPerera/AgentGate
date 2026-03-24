'use client';
import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import type { AgentEvent } from '@/lib/types';

interface Props { events: AgentEvent[] }

export function ActivitySparkline({ events }: Props) {
  const svgRef  = useRef<SVGSVGElement>(null);
  const tipRef  = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const buckets = useMemo(() => {
    const now = Date.now();
    const SLOTS = 20, SLOT_MS = 15_000;
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
    const W = 240, H = 80, PAD = { t: 8, r: 8, b: 20, l: 26 };

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('width', W).attr('height', H);

    const x = d3.scaleLinear().domain([0, buckets.length - 1]).range([PAD.l, W - PAD.r]);
    const maxVal = Math.max(d3.max(buckets, d => d.count) ?? 0, 1);
    const y = d3.scaleLinear().domain([0, maxVal]).range([H - PAD.b, PAD.t]);

    // Grid
    y.ticks(3).forEach(tick => {
      svg.append('line')
        .attr('x1', PAD.l).attr('x2', W - PAD.r)
        .attr('y1', y(tick)).attr('y2', y(tick))
        .attr('stroke', '#e2e4ef').attr('stroke-dasharray', '3,3');
      svg.append('text')
        .attr('x', PAD.l - 4).attr('y', y(tick) + 4)
        .attr('text-anchor', 'end').attr('font-size', 8).attr('fill', '#9498b3').text(tick);
    });

    // Gradient
    const defs = svg.append('defs');
    const grad = defs.append('linearGradient').attr('id', 'sparkGrad2').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', 1);
    grad.append('stop').attr('offset', '0%').attr('stop-color', '#3b6cff').attr('stop-opacity', 0.22);
    grad.append('stop').attr('offset', '100%').attr('stop-color', '#3b6cff').attr('stop-opacity', 0.02);

    const area = d3.area<{ time: number; count: number }>()
      .x((_, i) => x(i)).y0(H - PAD.b).y1(d => y(d.count))
      .curve(d3.curveCatmullRom.alpha(0.5));

    svg.append('path').datum(buckets).attr('fill', 'url(#sparkGrad2)').attr('d', area);

    const line = d3.line<{ time: number; count: number }>()
      .x((_, i) => x(i)).y(d => y(d.count))
      .curve(d3.curveCatmullRom.alpha(0.5));

    const path = svg.append('path').datum(buckets)
      .attr('fill', 'none').attr('stroke', '#3b6cff').attr('stroke-width', 2).attr('d', line);

    const len = (path.node() as SVGPathElement)?.getTotalLength() ?? 0;
    path.attr('stroke-dasharray', `${len} ${len}`).attr('stroke-dashoffset', len)
      .transition().duration(800).ease(d3.easeCubicOut).attr('stroke-dashoffset', 0);

    // X time labels
    [0, Math.floor(buckets.length / 2), buckets.length - 1].forEach(i => {
      const t = new Date(buckets[i].time);
      svg.append('text')
        .attr('x', x(i)).attr('y', H - 5)
        .attr('text-anchor', 'middle').attr('font-size', 8).attr('fill', '#9498b3')
        .text(`${t.getHours()}:${String(t.getMinutes()).padStart(2, '0')}`);
    });

    // Crosshair + tooltip overlay
    const crossV = svg.append('line')
      .attr('stroke', '#3b6cff').attr('stroke-width', 1).attr('stroke-dasharray', '3,3')
      .attr('y1', PAD.t).attr('y2', H - PAD.b).attr('opacity', 0);

    const dot = svg.append('circle').attr('r', 4)
      .attr('fill', '#fff').attr('stroke', '#3b6cff').attr('stroke-width', 2).attr('opacity', 0);

    const showTip = (event: MouseEvent, bucket: typeof buckets[0], idx: number) => {
      const tip = tipRef.current; const wrap = wrapRef.current;
      if (!tip || !wrap) return;
      const rect = wrap.getBoundingClientRect();
      const t = new Date(bucket.time);
      const timeStr = `${t.getHours()}:${String(t.getMinutes()).padStart(2,'0')}:${String(t.getSeconds()).padStart(2,'0')}`;
      tip.innerHTML = `
        <div style="font-weight:700;color:#1a1d2e;margin-bottom:2px">${timeStr}</div>
        <div style="color:#5c6078;font-size:11px">15-second window (slot ${idx + 1}/${buckets.length})</div>
        <div style="margin-top:5px">
          <span style="font-weight:700;color:#3b6cff;font-size:14px">${bucket.count}</span>
          <span style="color:#9498b3;font-size:12px"> event${bucket.count !== 1 ? 's' : ''}</span>
        </div>`;
      tip.style.display = 'block';
      const tx = event.clientX - rect.left + 12;
      tip.style.left = tx + 150 > rect.width ? `${event.clientX - rect.left - 162}px` : `${tx}px`;
      tip.style.top  = `${event.clientY - rect.top - 10}px`;
    };
    const hideTip = () => { if (tipRef.current) tipRef.current.style.display = 'none'; };

    // Invisible overlay for mouse tracking
    svg.append('rect')
      .attr('x', PAD.l).attr('y', PAD.t)
      .attr('width', W - PAD.l - PAD.r).attr('height', H - PAD.t - PAD.b)
      .attr('fill', 'transparent').style('cursor', 'crosshair')
      .on('mousemove', function(event: MouseEvent) {
        const [mx] = d3.pointer(event, this as Element);
        const idx = Math.round(x.invert(mx + PAD.l));
        const clamped = Math.max(0, Math.min(buckets.length - 1, idx));
        const cx = x(clamped), cy = y(buckets[clamped].count);
        crossV.attr('x1', cx).attr('x2', cx).attr('opacity', 0.6);
        dot.attr('cx', cx).attr('cy', cy).attr('opacity', 1);
        showTip(event, buckets[clamped], clamped);
      })
      .on('mouseleave', () => {
        crossV.attr('opacity', 0);
        dot.attr('opacity', 0);
        hideTip();
      });

  }, [buckets]);

  const total = buckets.reduce((s, b) => s + b.count, 0);

  return (
    <div ref={wrapRef} className="relative flex flex-col gap-1">
      <div
        ref={tipRef}
        style={{
          display: 'none', position: 'absolute', zIndex: 50, pointerEvents: 'none',
          background: '#fff', border: '1px solid #e2e4ef', borderRadius: 10,
          padding: '8px 12px', boxShadow: '0 4px 16px rgba(0,0,0,.10)',
          fontFamily: 'DM Sans, sans-serif', fontSize: 12, minWidth: 150, whiteSpace: 'nowrap',
        }}
      />
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[#9498b3]">Events / 5 min</span>
        <span className="text-[11px] font-bold text-[#1a1d2e] font-[family-name:var(--font-ibm-plex-mono)]">{total}</span>
      </div>
      <svg ref={svgRef} />
    </div>
  );
}
