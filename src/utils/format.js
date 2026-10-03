// Formatters and Persian numeral utilities for PayVand (پی‌وند) Protocol

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toPersianDigits(val) {
  if (val === undefined || val === null) return '';
  return String(val).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

export function formatToman(val) {
  if (val === undefined || val === null || isNaN(val)) return '۰ تومان';
  const num = Math.round(Number(val));
  const formatted = num.toLocaleString('en-US');
  return `${toPersianDigits(formatted)} تومان`;
}

export function formatUSD(val, decimals = 2) {
  if (val === undefined || val === null || isNaN(val)) return '$0.00';
  const num = Number(val);
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

export function formatCrypto(val, maxDecimals = 6) {
  if (val === undefined || val === null || isNaN(val)) return '0';
  const num = Number(val);
  if (num === 0) return '0';
  if (num < 0.000001) return '< 0.000001';
  return num.toLocaleString('en-US', {
    maximumFractionDigits: maxDecimals,
    useGrouping: true
  });
}

export function shortenAddress(address, chars = 4) {
  if (!address) return '';
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}
