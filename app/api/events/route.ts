import { NextResponse } from 'next/server';
import { eventBus } from '@/lib/events/event-bus';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial ping
      controller.enqueue(encoder.encode('data: {"type":"ping"}\n\n'));

      // Subscribe to all events
      const unsubscribe = eventBus.subscribe((event) => {
        const data = JSON.stringify(event);
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      });

      // Heartbeat every 20 seconds to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode('data: {"type":"heartbeat"}\n\n'));
        } catch {
          clearInterval(heartbeat);
          unsubscribe();
        }
      }, 15000);

      // Cleanup on close
      return () => {
        clearInterval(heartbeat);
        unsubscribe();
      };
    },
    cancel() {
      // Stream closed by client
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
