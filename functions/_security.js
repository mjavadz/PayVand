// Cloudflare Pages Functions: Shared Security & Validation Module
// Aligned with OWASP Top 10:2025 and OWASP API Security Top 10:2023

/**
 * Permitted outbound domains for SSRF protection
 */
export const ALLOWED_OUTBOUND_HOSTS = new Set([
  'api.binance.com',
  'apiv2.nobitex.ir',
  'api.wallex.ir',
  'api.bitpin.ir',
  'publicapi.ramzinex.com',
  'api.ompfinex.com',
  'api.abantether.com',
  'quote-api.jup.ag'
]);

/**
 * Check if target URL is allowed (SSRF Protection)
 * Blocks private IP ranges, loopback, non-HTTPS protocols, and non-whitelisted hosts.
 */
export function isAllowedOutboundHost(urlStr) {
  let parsed;
  try {
    parsed = new URL(urlStr);
  } catch {
    return { allowed: false, reason: 'Invalid URL format' };
  }

  // Enforce HTTPS only
  if (parsed.protocol !== 'https:') {
    return { allowed: false, reason: 'Insecure protocol: only HTTPS is permitted' };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block localhost, loopbacks, and RFC1918 private IPs
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname === '::1' ||
    hostname.startsWith('10.') ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('169.254.') ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)
  ) {
    return { allowed: false, reason: `Private/loopback host '${hostname}' is prohibited` };
  }

  // Exact match against whitelist
  if (!ALLOWED_OUTBOUND_HOSTS.has(hostname)) {
    return { allowed: false, reason: `Host '${hostname}' is not in outbound allowlist` };
  }

  return { allowed: true, url: parsed };
}

/**
 * Safe fetch with SSRF validation, size capping (max 512KB), and timeout enforcement
 */
export async function safeFetch(urlStr, options = {}) {
  const check = isAllowedOutboundHost(urlStr);
  if (!check.allowed) {
    throw new Error(`SSRF Blocked: ${check.reason}`);
  }

  const timeoutMs = options.timeoutMs || 4000;
  const maxBytes = options.maxBytes || 512 * 1024; // 512 KB cap

  const fetchOptions = {
    ...options,
    signal: AbortSignal.timeout(timeoutMs)
  };
  delete fetchOptions.timeoutMs;
  delete fetchOptions.maxBytes;

  const resp = await fetch(urlStr, fetchOptions);

  // Check Content-Length if present
  const cl = resp.headers.get('content-length');
  if (cl && parseInt(cl, 10) > maxBytes) {
    throw new Error(`Response payload size (${cl} bytes) exceeds limit of ${maxBytes} bytes`);
  }

  // Buffer and cap response size
  const buffer = await resp.arrayBuffer();
  if (buffer.byteLength > maxBytes) {
    throw new Error(`Response body size (${buffer.byteLength} bytes) exceeded maximum of ${maxBytes} bytes`);
  }

  const decoder = new TextDecoder('utf-8');
  return {
    ok: resp.ok,
    status: resp.status,
    statusText: resp.statusText,
    headers: resp.headers,
    arrayBuffer: async () => buffer,
    text: async () => decoder.decode(buffer),
    json: async () => JSON.parse(decoder.decode(buffer))
  };
}

/**
 * CORS Origin Resolver
 * Restricts wildcard (*) to actual deployment origin: https://javadnode.top
 */
export const ALLOWED_ORIGINS = new Set([
  'https://javadnode.top',
  'https://www.javadnode.top'
]);

export function getCorsOrigin(requestOrigin) {
  if (!requestOrigin) return 'https://javadnode.top';
  if (ALLOWED_ORIGINS.has(requestOrigin)) {
    return requestOrigin;
  }
  // Allow local development origin if running locally
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(requestOrigin)) {
    return requestOrigin;
  }
  return 'https://javadnode.top';
}

/**
 * Standard hardened security headers
 */
export function getSecurityHeaders(requestOrigin = null, extraHeaders = {}) {
  const origin = getCorsOrigin(requestOrigin);
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Request-ID, Authorization',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin, Accept-Encoding',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; sandbox; base-uri 'none';",
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    ...extraHeaders
  };
}

/**
 * Strict query parameters schema validation
 * Rejects unknown query parameters, enforces type/length/regex constraints
 */
export function validateQueryParams(url, schema = {}) {
  const urlObj = typeof url === 'string' ? new URL(url) : url;
  const allowedKeys = new Set(Object.keys(schema));

  // 1. Reject unknown parameters
  for (const key of urlObj.searchParams.keys()) {
    if (!allowedKeys.has(key)) {
      return {
        valid: false,
        error: `Unknown query parameter: '${key}'`
      };
    }
  }

  const validated = {};

  // 2. Validate declared parameters
  for (const [key, rules] of Object.entries(schema)) {
    const raw = urlObj.searchParams.get(key);
    const val = raw !== null ? raw.trim() : null;

    if (rules.required && (!val || val === '')) {
      return {
        valid: false,
        error: `Missing required query parameter: '${key}'`
      };
    }

    if (val !== null && val !== '') {
      if (rules.maxLength && val.length > rules.maxLength) {
        return {
          valid: false,
          error: `Parameter '${key}' exceeds maximum length of ${rules.maxLength}`
        };
      }
      if (rules.pattern && !rules.pattern.test(val)) {
        return {
          valid: false,
          error: rules.message || `Invalid format for parameter '${key}'`
        };
      }
      if (rules.transform) {
        try {
          validated[key] = rules.transform(val);
        } catch {
          return {
            valid: false,
            error: `Invalid value for parameter '${key}'`
          };
        }
      } else {
        validated[key] = val;
      }
    } else if (rules.default !== undefined) {
      validated[key] = rules.default;
    }
  }

  return { valid: true, data: validated };
}

/**
 * Validate request body size and content-type
 */
export function validateRequestBody(request, maxSize = 102400) {
  const cl = request.headers.get('content-length');
  if (cl && parseInt(cl, 10) > maxSize) {
    return {
      valid: false,
      error: `Request body exceeds maximum size of ${maxSize} bytes`
    };
  }
  return { valid: true };
}

/**
 * Create a sanitized JSON error response that never leaks internal details
 */
export function createErrorResponse(message, status = 400, requestId = '', headers = {}) {
  const body = {
    error: message || 'An error occurred processing the request',
    status,
    timestamp: Date.now()
  };
  if (requestId) {
    body.requestId = requestId;
  }
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      ...headers
    }
  });
}
