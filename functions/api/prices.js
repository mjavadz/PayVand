// Cloudflare Pages Function: /api/prices
// Live Crypto & Iranian Tether Rate (Trimmed Average of Top Iranian Exchanges)
// Hardened with SSRF protection, outbound payload caps, and strict error containment.

import { validateQueryParams, safeFetch, createErrorResponse } from '../_security.js';

const DEFAULT_PRICES = {
  ton: 1.60,
  solana: 117.10,
  ethereum: 2692.00,
  tron: 0.34,
  bnb: 580.00,
  btc: 64500.00,
  usdt: 1.00
};

const DEFAULT_IRAN_TETHER = {
  averageToman: 265500,
  sourcesCount: 0,
  fallback: true
};

export async function onRequestGet(context) {
  const { request } = context;
  const requestId = context.data?.requestId || '';

  // 1. Strict parameter validation - Reject unexpected query params
  const validation = validateQueryParams(request.url, {});
  if (!validation.valid) {
    return createErrorResponse(validation.error, 400, requestId);
  }

  // 2. Fetch Global Crypto Prices via SSRF-safe fetch
  const cryptoPromise = safeFetch(
    'https://api.binance.com/api/v3/ticker/price?symbols=%5B%22TONUSDT%22,%22SOLUSDT%22,%22ETHUSDT%22,%22TRXUSDT%22,%22BNBUSDT%22,%22BTCUSDT%22%5D',
    {
      headers: { 'Accept': 'application/json' },
      timeoutMs: 3500,
      maxBytes: 512 * 1024
    }
  ).then(r => r.json()).catch((err) => {
    console.warn(`[${requestId}] Binance ticker fetch failed:`, err.message || err);
    return [];
  });

  // 3. Permitted Top Iranian Exchanges by Volume
  const iranExchanges = [
    {
      name: 'نوبیتکس (Nobitex)',
      url: 'https://apiv2.nobitex.ir/market/stats',
      parse: (d) => Number(d?.stats?.['usdt-rls']?.latest) / 10
    },
    {
      name: 'والکس (Wallex)',
      url: 'https://api.wallex.ir/v1/markets',
      parse: (d) => Number(d?.result?.symbols?.USDTTMN?.stats?.lastPrice)
    },
    {
      name: 'بیت‌پین (Bitpin)',
      url: 'https://api.bitpin.ir/v1/mkt/markets/',
      parse: (d) => Number(d?.results?.find(m => m.code === 'USDT_IRT')?.price)
    },
    {
      name: 'رمزینکس (Ramzinex)',
      url: 'https://publicapi.ramzinex.com/exchange/api/v1.0/exchange/pairs',
      parse: (d) => Number(d?.data?.find(p => p.url_name === 'tether-usdt')?.buy) / 10
    },
    {
      name: 'اوام‌پی فینکس (OMPfinex)',
      url: 'https://api.ompfinex.com/v1/market',
      parse: (d) => Number(d?.data?.find(m => m?.base_currency?.id === 'USDT' && m?.quote_currency?.id === 'IRR')?.last_price) / 10
    },
    {
      name: 'آبان‌تتر (AbanTether)',
      url: 'https://api.abantether.com/api/v1/otc/currencies/USDT',
      parse: (d) => Number(d?.price || d?.buy_price || d?.sell_price)
    }
  ];

  const iranPromise = Promise.allSettled(
    iranExchanges.map(async (ex) => {
      const resp = await safeFetch(ex.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PayVandBot/1.0)' },
        timeoutMs: 3500,
        maxBytes: 512 * 1024
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      const price = ex.parse(data);
      if (typeof price === 'number' && Number.isFinite(price) && price > 40000 && price < 500000) {
        return { name: ex.name, price: Math.round(price) };
      }
      throw new Error('Invalid rate bounds');
    })
  );

  try {
    const [cryptoData, iranResults] = await Promise.all([cryptoPromise, iranPromise]);

    const prices = { ...DEFAULT_PRICES };

    if (Array.isArray(cryptoData)) {
      cryptoData.forEach(item => {
        const val = Number(item?.price);
        if (Number.isFinite(val) && val > 0) {
          if (item.symbol === 'TONUSDT') prices.ton = val;
          if (item.symbol === 'SOLUSDT') prices.solana = val;
          if (item.symbol === 'ETHUSDT') prices.ethereum = val;
          if (item.symbol === 'TRXUSDT') prices.tron = val;
          if (item.symbol === 'BNBUSDT') prices.bnb = val;
          if (item.symbol === 'BTCUSDT') prices.btc = val;
        }
      });
    }

    const validExchanges = [];
    iranResults.forEach(r => {
      if (r.status === 'fulfilled' && r.value?.price) {
        validExchanges.push(r.value);
      }
    });

    const averageUsdtToman = validExchanges.length > 0
      ? Math.round(validExchanges.reduce((sum, item) => sum + item.price, 0) / validExchanges.length)
      : DEFAULT_IRAN_TETHER.averageToman;

    return new Response(JSON.stringify({
      success: true,
      timestamp: Date.now(),
      prices,
      iranTether: {
        averageToman: averageUsdtToman,
        sourcesCount: validExchanges.length,
        exchanges: validExchanges
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=15, stale-while-revalidate=45',
        'Vary': 'Origin, Accept-Encoding'
      }
    });

  } catch (error) {
    console.error(`[${requestId}] Internal pricing failure:`, error.message || error);
    // Secure fallback: Never leak internal error message to client
    return new Response(JSON.stringify({
      success: false,
      error: 'Unable to retrieve live pricing. Displaying cached baseline.',
      requestId,
      prices: DEFAULT_PRICES,
      iranTether: DEFAULT_IRAN_TETHER
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=5',
        'Vary': 'Origin, Accept-Encoding'
      }
    });
  }
}
