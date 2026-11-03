import { NextResponse, type NextRequest } from "next/server";

// Rate limiting and logging for the public API.
//
// The counters live in this instance's memory, so on serverless (Vercel) each
// instance counts on its own. That is a first line of defence against scraping
// and floods; add a Vercel Firewall rate-limit rule for a global limit.

const WINDOW_MS = 60_000;
// Generous on purpose: typing in the search box and moving the map each fire a request,
// and many users can share one IP (school or office networks)
const MAX_REQUESTS_PER_WINDOW = 120;
const MAX_TRACKED_CLIENTS = 5_000;

const hits = new Map<string, { count: number; resetAt: number }>();

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(ip: string, now: number): { limited: boolean; retryAfter: number } {
  // Drop expired entries so the map can't grow without bound
  if (hits.size > MAX_TRACKED_CLIENTS) {
    for (const [key, entry] of hits) if (entry.resetAt <= now) hits.delete(key);
    if (hits.size > MAX_TRACKED_CLIENTS) hits.clear();
  }

  const entry = hits.get(ip);
  if (!entry || entry.resetAt <= now) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { limited: false, retryAfter: 0 };
  }
  entry.count += 1;
  return {
    limited: entry.count > MAX_REQUESTS_PER_WINDOW,
    retryAfter: Math.ceil((entry.resetAt - now) / 1000),
  };
}

// One JSON line per event so Vercel's log search/drains can filter on `event`
function logSecurityEvent(event: string, request: NextRequest, extra: Record<string, unknown> = {}) {
  console.warn(
    JSON.stringify({
      level: "warn",
      event,
      ip: clientIp(request),
      method: request.method,
      path: request.nextUrl.pathname,
      userAgent: request.headers.get("user-agent")?.slice(0, 200) ?? null,
      ...extra,
    }),
  );
}

export function proxy(request: NextRequest) {
  // The API is read-only: anything but GET/HEAD is unexpected
  if (request.method !== "GET" && request.method !== "HEAD") {
    logSecurityEvent("api_method_not_allowed", request);
    return NextResponse.json({ error: "Método no permitido" }, { status: 405, headers: { Allow: "GET, HEAD" } });
  }

  // Search text is matched against school names; nothing legitimate is this long
  if (request.nextUrl.search.length > 1_000) {
    logSecurityEvent("api_query_too_long", request, { length: request.nextUrl.search.length });
    return NextResponse.json({ error: "Consulta demasiado larga" }, { status: 414 });
  }

  const { limited, retryAfter } = isRateLimited(clientIp(request), Date.now());
  if (limited) {
    logSecurityEvent("api_rate_limited", request, { retryAfter });
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta de nuevo en un momento." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
