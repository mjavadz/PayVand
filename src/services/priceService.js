// Live Multi-Chain Crypto Prices & Iranian 5-Exchange Average Toman Rate Feed

let CACHED_PRICES = {
  ton: 1.60,
  solana: 117.10,
  ethereum: 2692.00,
  tron: 0.34,
  bnb: 580.00,
  usdt: 1.00,
  usdc: 1.00,
  jup: 0.88,
  uni: 7.20,
  wbtc: 64500.00,
  btt: 0.00000085,
  sun: 0.024,
  ston: 3.85,
  ray: 2.15,
  zec: 1307.00,
  lusd: 1.00,
  dai: 1.00,
  stars: 0.015,
  gram: 0.008,
};

let IRAN_TETHER_RATE = 234000; // Baseline average Toman
let IRAN_EXCHANGES_BREAKDOWN = [
  { name: 'نوبیتکس (Nobitex)', price: 233939, status: 'verified' },
  { name: 'والکس (Wallex)', price: 233845, status: 'verified' },
  { name: 'بیت‌پین (Bitpin)', price: 234360, status: 'verified' },
  { name: 'رمزینکس (Ramzinex)', price: 234060, status: 'verified' },
  { name: 'اوام‌پی فینکس (OMPfinex)', price: 234030, status: 'verified' }
];

let lastFetchTime = 0;
const CACHE_DURATION = 20000; // 20s

export async function fetchLivePrices() {
  const now = Date.now();
  if (now - lastFetchTime < CACHE_DURATION) {
    return { prices: CACHED_PRICES, iranTether: IRAN_TETHER_RATE };
  }

  // 1. Primary path: Query Cloudflare Edge Function (/api/prices)
  try {
    const cfResp = await fetch('/api/prices');
    if (cfResp.ok) {
      const data = await cfResp.json();
      if (data?.prices) {
        CACHED_PRICES = { ...CACHED_PRICES, ...data.prices };
      }
      if (data?.iranTether?.averageToman) {
        IRAN_TETHER_RATE = data.iranTether.averageToman;
        if (data.iranTether.exchanges?.length > 0) {
          IRAN_EXCHANGES_BREAKDOWN = data.iranTether.exchanges;
        }
      }
      lastFetchTime = now;
      return { prices: CACHED_PRICES, iranTether: IRAN_TETHER_RATE };
    }
  } catch {
    // Cloudflare edge function unreachable, fall through to client direct query
  }

  // 2. Client fallback direct query to exchanges with open CORS headers
  try {
    const [wallexRes, bitpinRes, binanceRes] = await Promise.allSettled([
      fetch('https://api.wallex.ir/v1/markets', { signal: AbortSignal.timeout(3500) }).then(r => r.json()),
      fetch('https://api.bitpin.ir/v1/mkt/markets/', { signal: AbortSignal.timeout(3500) }).then(r => r.json()),
      fetch('https://api.binance.com/api/v3/ticker/price?symbols=%5B%22TONUSDT%22,%22SOLUSDT%22,%22ETHUSDT%22,%22TRXUSDT%22,%22BNBUSDT%22%5D', { signal: AbortSignal.timeout(3500) }).then(r => r.json())
    ]);

    const activeSources = [];

    if (wallexRes.status === 'fulfilled') {
      const p = Number(wallexRes.value?.result?.symbols?.USDTTMN?.stats?.lastPrice);
      if (p > 50000 && p < 500000) activeSources.push({ name: 'والکس (Wallex)', price: Math.round(p), status: 'live' });
    }

    if (bitpinRes.status === 'fulfilled') {
      const item = bitpinRes.value?.results?.find(m => m.code === 'USDT_IRT');
      const p = Number(item?.price);
      if (p > 50000 && p < 500000) activeSources.push({ name: 'بیت‌پین (Bitpin)', price: Math.round(p), status: 'live' });
    }

    if (binanceRes.status === 'fulfilled' && Array.isArray(binanceRes.value)) {
      binanceRes.value.forEach(item => {
        const p = parseFloat(item.price);
        if (p > 0) {
          if (item.symbol === 'TONUSDT') CACHED_PRICES.ton = p;
          if (item.symbol === 'SOLUSDT') CACHED_PRICES.solana = p;
          if (item.symbol === 'ETHUSDT') CACHED_PRICES.ethereum = p;
          if (item.symbol === 'TRXUSDT') CACHED_PRICES.tron = p;
          if (item.symbol === 'BNBUSDT') CACHED_PRICES.bnb = p;
        }
      });
    }

    if (activeSources.length > 0) {
      const avg = Math.round(activeSources.reduce((a, b) => a + b.price, 0) / activeSources.length);
      IRAN_TETHER_RATE = avg;
      IRAN_EXCHANGES_BREAKDOWN = activeSources;
    }

    lastFetchTime = now;
  } catch (err) {
    console.warn('Fallback to baseline rates:', err);
  }

  return { prices: CACHED_PRICES, iranTether: IRAN_TETHER_RATE };
}

export function getCachedPrices() {
  return CACHED_PRICES;
}

export function getIranTetherRate() {
  return IRAN_TETHER_RATE;
}

export function getIranExchangesBreakdown() {
  return IRAN_EXCHANGES_BREAKDOWN;
}

export function getTokenPrice(symbol) {
  const sym = symbol?.toLowerCase();
  switch (sym) {
    case 'ton': return CACHED_PRICES.ton;
    case 'sol':
    case 'solana': return CACHED_PRICES.solana;
    case 'eth':
    case 'ethereum': return CACHED_PRICES.ethereum;
    case 'trx':
    case 'tron': return CACHED_PRICES.tron;
    case 'bnb':
    case 'bsc': return CACHED_PRICES.bnb || 580;
    case 'usdt': return CACHED_PRICES.usdt;
    case 'usdc': return CACHED_PRICES.usdc;
    case 'jup': return CACHED_PRICES.jup;
    case 'uni': return CACHED_PRICES.uni;
    case 'wbtc': return CACHED_PRICES.wbtc;
    case 'btt': return CACHED_PRICES.btt;
    case 'sun': return CACHED_PRICES.sun;
    case 'ston': return CACHED_PRICES.ston;
    case 'ray': return CACHED_PRICES.ray;
    case 'zec':
    case 'zcash':
    case 'zec-z': return CACHED_PRICES.zec || 1307.00;
    case 'lusd': return CACHED_PRICES.lusd || 1.00;
    case 'dai': return CACHED_PRICES.dai || 1.00;
    case 'stars': return CACHED_PRICES.stars || 0.015;
    case 'gram': return CACHED_PRICES.gram || 0.008;
    default: return 1.0;
  }
}

export function getTomanPrice(symbol) {
  const usd = getTokenPrice(symbol);
  return Math.round(usd * IRAN_TETHER_RATE);
}
