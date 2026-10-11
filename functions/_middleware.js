// Cloudflare Pages Functions: Global Security & Rate Limiting Middleware
// Enforces OWASP API Security Top 10:2023 & OWASP Top 10:2025

import { getSecurityHeaders, getCorsOrigin } from './_security.js';

// In-memory rate limiting cache (per Cloudflare Worker isolate)
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const RATE_LIMIT_MAX_REQUESTS = 100;     // 100 req/min
const rateLimitMap = new Map();          // IP -> { count: number, resetTime: number }

// Cleanup interval to avoid memory growth
let lastCleanup = Date.now();
function cleanupRateLimits() {
  const now = Date.now();
  if (now - lastCleanup < 30000 && rateLimitMap.size < 1000) return;
  lastCleanup = now;
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // 1. Assign or propagate unique X-Request-ID
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  context.data = context.data || {};
  context.data.requestId = requestId;

  // 2. Identify Client IP (Cloudflare connecting IP with fallbacks)
  const clientIp = request.headers.get('cf-connecting-ip') ||
                   request.headers.get('x-real-ip') ||
                   request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                   '127.0.0.1';
  context.data.clientIp = clientIp;

  // 3. Request Audit Trail Logging
  const requestStart = Date.now();
  console.log(JSON.stringify({
    type: 'API_AUDIT_REQUEST',
    requestId,
    ip: clientIp,
    method: request.method,
    path: url.pathname,
    query: url.search,
    timestamp: new Date().toISOString()
  }));

  // 4. Rate Limiting Check (100 req / min per IP)
  cleanupRateLimits();
  const now = Date.now();
  let rateEntry = rateLimitMap.get(clientIp);

  if (!rateEntry || now > rateEntry.resetTime) {
    rateEntry = { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS };
    rateLimitMap.set(clientIp, rateEntry);
  } else {
    rateEntry.count += 1;
  }

  const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - rateEntry.count);
  const resetSeconds = Math.max(1, Math.ceil((rateEntry.resetTime - now) / 1000));

  const rateHeaders = {
    'RateLimit-Limit': String(RATE_LIMIT_MAX_REQUESTS),
    'RateLimit-Remaining': String(remaining),
    'RateLimit-Reset': String(resetSeconds),
    'X-RateLimit-Limit': String(RATE_LIMIT_MAX_REQUESTS),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(resetSeconds),
    'X-Request-ID': requestId
  };

  const originHeader = request.headers.get('origin');
  const baseSecurityHeaders = getSecurityHeaders(originHeader, rateHeaders);

  // Rate limit exceeded -> Return 429
  if (rateEntry.count > RATE_LIMIT_MAX_REQUESTS) {
    console.warn(JSON.stringify({
      type: 'RATE_LIMIT_EXCEEDED',
      requestId,
      ip: clientIp,
      count: rateEntry.count,
      resetSeconds
    }));

    return new Response(JSON.stringify({
      error: 'Too Many Requests',
      message: `Rate limit of ${RATE_LIMIT_MAX_REQUESTS} requests per minute exceeded. Please retry in ${resetSeconds} seconds.`,
      requestId
    }), {
      status: 429,
      headers: {
        ...baseSecurityHeaders,
        'Retry-After': String(resetSeconds)
      }
    });
  }

  // 5. Preflight CORS (OPTIONS)
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: baseSecurityHeaders
    });
  }

  // 6. Validate POST Request Constraints (Content-Type & Size)
  if (request.method === 'POST') {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json') && !contentType.includes('application/x-www-form-urlencoded')) {
      return new Response(JSON.stringify({
        error: 'Unsupported Media Type',
        message: 'Content-Type must be application/json',
        requestId
      }), {
        status: 415,
        headers: baseSecurityHeaders
      });
    }

    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 102400) { // 100 KB
      return new Response(JSON.stringify({
        error: 'Payload Too Large',
        message: 'Request body exceeds size limit of 100KB',
        requestId
      }), {
        status: 413,
        headers: baseSecurityHeaders
      });
    }
  }

  // 7. Invoke next middleware / route handler with error containment
  let response;
  try {
    response = await context.next();
  } catch (err) {
    console.error(`[${requestId}] Uncaught function exception:`, err);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: 'An error occurred while processing the request',
      requestId
    }), {
      status: 500,
      headers: baseSecurityHeaders
    });
  }

  // 8. Inject and harden security headers on outgoing response
  const finalHeaders = new Headers(response.headers);
  for (const [key, value] of Object.entries(baseSecurityHeaders)) {
    finalHeaders.set(key, value);
  }

  // 9. Response audit logging
  const durationMs = Date.now() - requestStart;
  console.log(JSON.stringify({
    type: 'API_AUDIT_RESPONSE',
    requestId,
    ip: clientIp,
    status: response.status,
    durationMs
  }));

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: finalHeaders
  });
}
