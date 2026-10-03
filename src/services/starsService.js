// Telegram Stars OTC Desk Service & Pricing Engine
import { getTokenPrice, getIranTetherRate } from './priceService';
import { TREASURY_WALLETS } from '../config/treasury';

export const STARS_PACKAGES = [
  { stars: 50, badge: 'شروع', popular: false },
  { stars: 100, badge: 'پایه', popular: false },
  { stars: 250, badge: 'اقتصادی', popular: false },
  { stars: 500, badge: 'محبوب‌ترین', popular: true },
  { stars: 1000, badge: 'ویژه', popular: true },
  { stars: 2500, badge: 'تخفیف ۳٪', popular: false },
  { stars: 5000, badge: 'تخفیف ۵٪', popular: false },
  { stars: 10000, badge: 'تخفیف ۷٪', popular: false },
];

// Base star price in USD
export const STAR_BASE_USD = 0.015;

export const PAYMENT_METHODS = [
  { 
    id: 'ton', 
    name: 'شبکه تون (TON)', 
    symbol: 'TON', 
    network: 'TON Mainnet', 
    icon: 'ton', 
    address: TREASURY_WALLETS.ton.address 
  },
  { 
    id: 'usdt_trc20', 
    name: 'تتر ترون (USDT TRC-20)', 
    symbol: 'USDT', 
    network: 'TRON TRC-20', 
    icon: 'usdt', 
    address: TREASURY_WALLETS.tron.address 
  },
  { 
    id: 'sol', 
    name: 'سولانا (SOL)', 
    symbol: 'SOL', 
    network: 'Solana Mainnet', 
    icon: 'sol', 
    address: TREASURY_WALLETS.solana.address 
  },
  { 
    id: 'trx', 
    name: 'ترون (TRX)', 
    symbol: 'TRX', 
    network: 'TRON Mainnet', 
    icon: 'trx', 
    address: TREASURY_WALLETS.tron.address 
  },
];

export function calculateStarsPrice(starsCount, methodId = 'ton') {
  const count = Number(starsCount) || 100;
  
  // Volume discount tiers
  let discount = 0;
  if (count >= 10000) discount = 0.07;
  else if (count >= 5000) discount = 0.05;
  else if (count >= 2500) discount = 0.03;

  const totalUSD = count * STAR_BASE_USD * (1 - discount);

  // Dynamic live rate from top 5 Iranian exchanges average
  const currentTomanRate = getIranTetherRate() || 234000;
  const totalToman = Math.round(totalUSD * currentTomanRate);

  // Crypto conversion using live market prices
  let cryptoAmount = 0;
  const tonPrice = getTokenPrice('TON') || 1.60;
  const solPrice = getTokenPrice('SOL') || 117.10;
  const trxPrice = getTokenPrice('TRX') || 0.34;

  if (methodId === 'ton') {
    cryptoAmount = Number((totalUSD / tonPrice).toFixed(3));
  } else if (methodId === 'usdt_trc20') {
    cryptoAmount = Number(totalUSD.toFixed(2));
  } else if (methodId === 'sol') {
    cryptoAmount = Number((totalUSD / solPrice).toFixed(4));
  } else if (methodId === 'trx') {
    cryptoAmount = Number((totalUSD / trxPrice).toFixed(1));
  }

  return {
    stars: count,
    totalUSD: totalUSD.toFixed(2),
    totalToman,
    cryptoAmount,
    tomanRate: currentTomanRate,
    unitPriceToman: Math.round(totalToman / count),
    discountPercent: Math.round(discount * 100)
  };
}

export function createStarsOrder({ type = 'buy', stars, username, methodId, payoutAddress = '' }) {
  const method = PAYMENT_METHODS.find(m => m.id === methodId) || PAYMENT_METHODS[0];
  const pricing = calculateStarsPrice(stars, methodId);
  const orderId = `JS-STARS-${Math.floor(100000 + Math.random() * 900000)}`;

  const order = {
    id: orderId,
    type, // 'buy' | 'sell'
    stars: Number(stars),
    username: username.startsWith('@') ? username : `@${username}`,
    method,
    pricing,
    depositAddress: method.address,
    payoutAddress: payoutAddress || null,
    status: 'pending_payment',
    createdAt: Date.now(),
    expiresAt: Date.now() + 20 * 60 * 1000, // 20 minutes
    txHash: null
  };

  saveOrderToHistory(order);
  return order;
}

const STORAGE_ORDERS_KEY = 'payvand_stars_orders';

export function getOrderHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveOrderToHistory(order) {
  try {
    const list = getOrderHistory();
    const updated = [order, ...list.filter(o => o.id !== order.id)].slice(0, 50);
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving order to localStorage:', e);
  }
}

export function updateOrderStatus(orderId, status, txHash = null) {
  try {
    const list = getOrderHistory();
    const idx = list.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      list[idx].status = status;
      if (txHash) list[idx].txHash = txHash;
      list[idx].updatedAt = Date.now();
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(list));
      return list[idx];
    }
  } catch (e) {
    console.error('Error updating order status:', e);
  }
  return null;
}
