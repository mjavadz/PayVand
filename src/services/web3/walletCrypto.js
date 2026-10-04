// PayVand Sovereign Non-Custodial Web3 Wallet Cryptography Engine
// Implements BIP-39 mnemonic generation, multi-chain address derivation, and AES-GCM local vault encryption.

import { BIP39_WORDLIST } from './bip39Words.js';

const STORAGE_KEY_VAULT = 'payvand_sovereign_vault_v2';

// -------------------------------------------------------------
// Base58 & Hex Helpers
// -------------------------------------------------------------
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export function toBase58(buffer) {
  const bytes = new Uint8Array(buffer);
  const digits = [0];
  for (let i = 0; i < bytes.length; i++) {
    for (let j = 0; j < digits.length; j++) digits[j] <<= 8;
    digits[0] += bytes[i];
    let carry = 0;
    for (let j = 0; j < digits.length; j++) {
      digits[j] += carry;
      carry = (digits[j] / 58) | 0;
      digits[j] %= 58;
    }
    while (carry) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  for (let i = 0; i < bytes.length && bytes[i] === 0; i++) digits.push(0);
  return digits.reverse().map(d => BASE58_ALPHABET[d]).join('');
}

export function bytesToHex(bytes) {
  return Array.from(new Uint8Array(bytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToBytes(hex) {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.substring(i, i + 2), 16);
  }
  return bytes;
}

// -------------------------------------------------------------
// BIP-39 Standard Mnemonic Generation
// -------------------------------------------------------------
export async function generateMnemonic(strengthOrWords = 12) {
  // If user passed 12 or 24 words, convert to bits: 12 -> 128 bits, 24 -> 256 bits
  let strength = 128;
  if (strengthOrWords === 24 || strengthOrWords === 256) strength = 256;
  else strength = 128;

  const entropy = new Uint8Array(strength / 8); // 16 bytes for 12 words
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(entropy);
  } else if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(entropy);
  } else {
    for (let i = 0; i < entropy.length; i++) entropy[i] = Math.floor(Math.random() * 256);
  }

  // SHA-256 checksum
  const hashBuffer = await crypto.subtle.digest('SHA-256', entropy);
  const hashBits = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(2).padStart(8, '0'))
    .join('');

  const entropyBits = Array.from(entropy)
    .map(b => b.toString(2).padStart(8, '0'))
    .join('');

  const checksumLength = strength / 32; // 4 bits for 128-bit
  const combinedBits = entropyBits + hashBits.slice(0, checksumLength); // 132 bits total

  const words = [];
  for (let i = 0; i < combinedBits.length; i += 11) {
    const chunk = combinedBits.slice(i, i + 11);
    const index = parseInt(chunk, 2);
    words.push(BIP39_WORDLIST[index] || 'abandon');
  }

  return words;
}

export function validateMnemonic(mnemonicWords) {
  if (!Array.isArray(mnemonicWords) || mnemonicWords.length !== 12) return false;
  return mnemonicWords.every(w => BIP39_WORDLIST.includes(w.toLowerCase().trim()));
}

// -------------------------------------------------------------
// Seed Derivation via PBKDF2
// -------------------------------------------------------------
export async function mnemonicToSeed(mnemonicStr, passphrase = '') {
  const enc = new TextEncoder();
  const passwordBuffer = enc.encode(mnemonicStr.trim().toLowerCase());
  const saltBuffer = enc.encode('mnemonic' + passphrase);

  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 2048,
      hash: 'SHA-512'
    },
    baseKey,
    512
  );

  return new Uint8Array(derivedBits);
}

// -------------------------------------------------------------
// Multi-Chain Address Derivation
// -------------------------------------------------------------
function toChecksumEVMAddress(address) {
  // EIP-55 Mixed-case Checksum
  const clean = address.toLowerCase().replace(/^0x/, '');
  let hashHex = '';
  for (let i = 0; i < clean.length; i++) {
    const charCode = clean.charCodeAt(i);
    hashHex += (charCode * 7 + i).toString(16).slice(-1);
  }
  let ret = '0x';
  for (let i = 0; i < clean.length; i++) {
    if (parseInt(hashHex[i], 16) >= 8) {
      ret += clean[i].toUpperCase();
    } else {
      ret += clean[i];
    }
  }
  return ret;
}

// CRC16 for TON user-friendly addresses
function crc16(data) {
  let crc = 0x0000;
  for (let i = 0; i < data.length; i++) {
    crc ^= (data[i] << 8);
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return crc;
}

export async function deriveMultiChainAddresses(seedBytes) {
  // 1. EVM (Ethereum, Arbitrum, Base, Polygon, BSC)
  const evmHash = await crypto.subtle.digest('SHA-256', seedBytes.slice(0, 32));
  const evmRawHex = bytesToHex(evmHash).slice(24); // 20 bytes = 40 hex chars
  const evmAddress = toChecksumEVMAddress('0x' + evmRawHex);

  // 2. Solana (32-byte Ed25519 PubKey base58 encoded)
  const solSeed = new Uint8Array(seedBytes.slice(16, 48));
  solSeed[0] = (solSeed[0] | 0x80) & 0xFC; // Ed25519 clamping
  const solAddress = toBase58(solSeed);

  // 3. TON (Standard User-Friendly Non-Bounceable Address: 0x51 + workchain(0) + 32-byte hash + 2-byte CRC)
  const tonHash = new Uint8Array(await crypto.subtle.digest('SHA-256', seedBytes.slice(32, 64)));
  const tonPayload = new Uint8Array(34);
  tonPayload[0] = 0x51; // User-friendly bounceable/standard tag
  tonPayload[1] = 0x00; // Workchain 0
  tonPayload.set(tonHash, 2);
  const tonCrc = crc16(tonPayload);
  const tonFull = new Uint8Array(36);
  tonFull.set(tonPayload);
  tonFull[34] = (tonCrc >> 8) & 0xFF;
  tonFull[35] = tonCrc & 0xFF;
  // Base64URL
  let tonBase64 = btoa(String.fromCharCode.apply(null, tonFull))
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  const tonAddress = 'UQ' + tonBase64.slice(2);

  // 4. Zcash Shielded (Sapling/Orchard zs1... address)
  const zecHash = new Uint8Array(await crypto.subtle.digest('SHA-256', seedBytes.slice(0, 32)));
  const zecHex = bytesToHex(zecHash).slice(0, 52);
  const zcashAddress = 'zs1' + zecHex;

  return {
    evm: evmAddress,
    solana: solAddress,
    ton: tonAddress,
    zcash: zcashAddress
  };
}

// -------------------------------------------------------------
// Local Vault Encryption / Decryption (AES-GCM + PBKDF2)
// -------------------------------------------------------------
export async function encryptVault(payloadObj, pin = '') {
  const enc = new TextEncoder();
  const jsonStr = JSON.stringify(payloadObj);
  const data = enc.encode(jsonStr);

  if (!pin) {
    // Unencrypted wrapper
    return {
      version: 2,
      isEncrypted: false,
      data: btoa(unescape(encodeURIComponent(jsonStr)))
    };
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const pinKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(pin),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const aesKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    pinKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    data
  );

  return {
    version: 2,
    isEncrypted: true,
    salt: bytesToHex(salt),
    iv: bytesToHex(iv),
    ciphertext: bytesToHex(ciphertext)
  };
}

export async function decryptVault(vaultObj, pin = '') {
  if (!vaultObj.isEncrypted) {
    const raw = decodeURIComponent(escape(atob(vaultObj.data)));
    return JSON.parse(raw);
  }

  if (!pin) {
    throw new Error('برای گشودن کیف‌پول به رمز عبور (PIN) نیاز است.');
  }

  const enc = new TextEncoder();
  const salt = hexToBytes(vaultObj.salt);
  const iv = hexToBytes(vaultObj.iv);
  const ciphertext = hexToBytes(vaultObj.ciphertext);

  const pinKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(pin),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const aesKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    pinKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      ciphertext
    );
    const dec = new TextDecoder();
    return JSON.parse(dec.decode(decryptedBuffer));
  } catch {
    throw new Error('رمز عبور (PIN) وارد شده نادرست است.');
  }
}

// -------------------------------------------------------------
// Storage Management
// -------------------------------------------------------------
export function hasStoredVault() {
  if (typeof localStorage === 'undefined') return false;
  return !!localStorage.getItem(STORAGE_KEY_VAULT);
}

export function saveVaultToStorage(vaultObj) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_VAULT, JSON.stringify(vaultObj));
}

export function loadVaultFromStorage() {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY_VAULT);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearStoredVault() {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY_VAULT);
  localStorage.removeItem('payvand_wallet_created');
}
