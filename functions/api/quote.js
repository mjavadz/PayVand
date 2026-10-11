// Cloudflare Pages Function: /api/quote
// Secure Hardened Proxy for Solana Jupiter Aggregator API

import { validateQueryParams, safeFetch, createErrorResponse } from '../_security.js';

const BASE58_MINT_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const POSITIVE_INT_REGEX = /^[1-9]\d{0,29}$/;

const QUOTE_QUERY_SCHEMA = {
  inputMint: {
    required: true,
    pattern: BASE58_MINT_REGEX,
    maxLength: 44,
    message: 'inputMint must be a valid Solana Base58 address (32-44 characters)'
  },
  outputMint: {
    required: true,
    pattern: BASE58_MINT_REGEX,
    maxLength: 44,
    message: 'outputMint must be a valid Solana Base58 address (32-44 characters)'
  },
  amount: {
    required: true,
    pattern: POSITIVE_INT_REGEX,
    maxLength: 30,
    message: 'amount must be a positive integer in base units'
  },
  slippageBps: {
    required: false,
    default: 50,
    pattern: /^\d{1,4}$/,
    transform: (val) => {
      const num = parseInt(val, 10);
      if (!Number.isInteger(num) || num < 1 || num > 5000) {
        throw new Error('Slippage out of range');
      }
      return num;
    },
    message: 'slippageBps must be an integer between 1 and 5000'
  }
};

export async function onRequestGet(context) {
  const { request } = context;
  const requestId = context.data?.requestId || '';

  // 1. Strict schema validation & unknown parameter rejection
  const validation = validateQueryParams(request.url, QUOTE_QUERY_SCHEMA);
  if (!validation.valid) {
    return createErrorResponse(validation.error, 400, requestId);
  }

  const { inputMint, outputMint, amount, slippageBps } = validation.data;

  // 2. Build strictly sanitized outbound Jupiter quote URL
  const params = new URLSearchParams({
    inputMint,
    outputMint,
    amount,
    slippageBps: String(slippageBps)
  });
  const jupUrl = `https://quote-api.jup.ag/v6/quote?${params.toString()}`;

  // 3. SSRF-protected outbound request with 512KB cap and 4.5s timeout
  try {
    const res = await safeFetch(jupUrl, {
      headers: { 'Accept': 'application/json' },
      timeoutMs: 4500,
      maxBytes: 512 * 1024
    });

    if (!res.ok) {
      console.error(`[${requestId}] Upstream Jupiter quote responded with status ${res.status}`);
      return createErrorResponse('Unable to fetch liquidity quote from aggregator', 502, requestId);
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=10, s-maxage=10',
        'Vary': 'Origin, Accept-Encoding'
      }
    });

  } catch (err) {
    console.error(`[${requestId}] Jupiter routing error:`, err.message || err);
    return createErrorResponse('Routing quote request failed. Please retry.', 502, requestId);
  }
}
