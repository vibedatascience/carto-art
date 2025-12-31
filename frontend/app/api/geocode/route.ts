import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const MIN_QUERY_LEN = 3;
const MAX_QUERY_LEN = 200;
const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 10;

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { expiresAt: number; payload: unknown }>();

// Nominatim policy: ~1 req/sec. This serializes requests per server instance.
const MIN_REQUEST_INTERVAL_MS = 1000;
let lastRequestTime = 0;
let queue: Promise<unknown> = Promise.resolve();

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = async () => {
    const now = Date.now();
    const wait = Math.max(0, MIN_REQUEST_INTERVAL_MS - (now - lastRequestTime));
    if (wait) await sleep(wait);
    lastRequestTime = Date.now();
    return task();
  };

  const p = queue.then(run, run) as Promise<T>;
  queue = p.then(() => undefined, () => undefined);
  return p;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    // ... (rest of the function)

  const qRaw = (url.searchParams.get('q') ?? '').trim();
  const q = qRaw.replace(/\s+/g, ' ');

  if (!q || q.length < MIN_QUERY_LEN) {
    return NextResponse.json([], { status: 200, headers: { 'Cache-Control': 'no-store' } });
  }
  if (q.length > MAX_QUERY_LEN) {
    return NextResponse.json({ error: 'Query too long' }, { status: 400 });
  }

  const limitParam = Number(url.searchParams.get('limit') ?? DEFAULT_LIMIT);
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(1, limitParam), MAX_LIMIT)
    : DEFAULT_LIMIT;

  const cacheKey = `${q.toLowerCase()}::${limit}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.payload, {
      status: 200,
      headers: { 'Cache-Control': 'public, max-age=300' },
    });
  }

  const userAgent =
    process.env.NOMINATIM_USER_AGENT?.trim() ||
    process.env.VERCEL_URL?.trim()?.replace(/^/, 'carto-art/') ||
    'carto-art (dev)';

  const fromEmail = process.env.NOMINATIM_FROM_EMAIL?.trim();

  const payload = await enqueue(async () => {
    const params = new URLSearchParams({
      q,
      format: 'json',
      limit: String(limit),
      addressdetails: '1',
      namedetails: '1',
    });

    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
        headers: {
          'User-Agent': userAgent,
          ...(fromEmail ? { From: fromEmail } : {}),
        },
        cache: 'no-store',
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        return { __error: true, status: resp.status, text };
      }

      return resp.json();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown network error';
      console.error('Nominatim fetch exception:', err);
      return { 
        __error: true, 
        status: 500, 
        text: `Network failure while reaching Nominatim: ${msg}` 
      };
    }
  });

  if (payload && typeof payload === 'object' && (payload as any).__error) {
    const { status, text } = payload as any;
    console.error(`Geocoding API error (status ${status}):`, text);
    
    return NextResponse.json(
      { 
        error: `Geocoding failed (${status})`, 
        details: text || 'No detailed error message from upstream',
        source: 'nominatim'
      },
      { status }
    );
  }

  cache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, payload });

    return NextResponse.json(payload, {
      status: 200,
      headers: { 'Cache-Control': 'public, max-age=300' },
    });
  } catch (error) {
    console.error('Unhandled geocode API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}

