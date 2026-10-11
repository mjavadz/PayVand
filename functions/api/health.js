// Cloudflare Pages Function: /api/health
// System Health and Network Status Check (Hardened)

import { validateQueryParams, createErrorResponse } from '../_security.js';

export async function onRequestGet(context) {
  const { request } = context;
  const requestId = context.data?.requestId || '';

  // 1. Strict parameter validation - Reject any unknown query parameter
  const validation = validateQueryParams(request.url, {});
  if (!validation.valid) {
    return createErrorResponse(validation.error, 400, requestId);
  }

  // 2. Health payload
  const payload = {
    status: 'healthy',
    version: '1.3.0',
    platform: 'PayVand Protocol Multi-Chain DEX',
    timestamp: Date.now(),
    security: {
      ssrfProtection: true,
      rateLimiting: true,
      nonCustodial: true,
      corsRestricted: true
    },
    features: {
      chainsSupported: 15,
      livePricing: true,
      starsDesk: true,
      iranToolkit: true
    }
  };

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}
