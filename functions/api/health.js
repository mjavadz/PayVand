// Cloudflare Pages Function: /api/health
// System Health and Network Status

const SECURITY_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'X-Content-Type-Options': 'nosniff'
};

export async function onRequestGet() {
  return new Response(JSON.stringify({
    status: 'healthy',
    version: '1.2.0',
    platform: 'PayVand Protocol Multi-Chain DEX',
    timestamp: Date.now(),
    features: {
      chainsSupported: 15,
      livePricing: true,
      starsDesk: true,
      iranToolkit: true,
      nonCustodial: true
    }
  }), {
    status: 200,
    headers: {
      ...SECURITY_HEADERS,
      'Cache-Control': 'no-cache'
    }
  });
}
