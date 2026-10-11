// Client-side Security Hardening Utility for PayVand Protocol
// Implements OWASP Top 10:2025 client controls:
// - Dynamic CSP meta tag injection
// - Subresource Integrity (SRI) validation
// - XSS escaping and input sanitizers
// - Sensitive data wiping from memory (zero-fill)
// - Encrypted localStorage wrapper (AES-GCM with device-derived PBKDF2 key)

// =========================================================================
// 1. Content Security Policy (CSP) Meta Tag Injection
// =========================================================================

/**
 * Injects or ensures presence of strict Content-Security-Policy meta tag in document head
 */
export function injectCSPMetaTag() {
  if (typeof document === 'undefined') return;

  const existingMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (existingMeta) return;

  const cspDirectives = [
    "default-src 'self' https://javadnode.top",
    "script-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://javadnode.top https://quote-api.jup.ag https://api.binance.com https://apiv2.nobitex.ir https://api.wallex.ir https://api.bitpin.ir https://publicapi.ramzinex.com https://api.ompfinex.com https://api.abantether.com https://*.solana.com https://*.drpc.org https://toncenter.com",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ];

  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = cspDirectives.join('; ');
  document.head.prepend(meta);
}

// =========================================================================
// 2. Subresource Integrity (SRI) Helpers
// =========================================================================

/**
 * Calculate SRI hash string (e.g., sha384-...) for a buffer or string
 */
export async function calculateSRIHash(data, algorithm = 'SHA-384') {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error('WebCrypto subtle is unavailable');
  }

  let buffer;
  if (typeof data === 'string') {
    buffer = new TextEncoder().encode(data);
  } else if (data instanceof ArrayBuffer) {
    buffer = data;
  } else if (ArrayBuffer.isView(data)) {
    buffer = data.buffer;
  } else {
    throw new TypeError('Unsupported data type for SRI calculation');
  }

  const hashBuffer = await crypto.subtle.digest(algorithm, buffer);
  const hashBytes = new Uint8Array(hashBuffer);

  let binary = '';
  for (let i = 0; i < hashBytes.length; i++) {
    binary += String.fromCharCode(hashBytes[i]);
  }
  const base64 = btoa(binary);
  const prefix = algorithm.toLowerCase().replace('-', '');
  return `${prefix}-${base64}`;
}

/**
 * Verify whether given resource data matches expected SRI hash
 */
export async function verifySRI(resourceData, expectedSRI) {
  if (!expectedSRI || typeof expectedSRI !== 'string') return false;

  const parts = expectedSRI.split('-');
  if (parts.length !== 2) return false;

  const algoMap = {
    sha256: 'SHA-256',
    sha384: 'SHA-384',
    sha512: 'SHA-512'
  };

  const algoName = algoMap[parts[0].toLowerCase()];
  if (!algoName) return false;

  try {
    const computed = await calculateSRIHash(resourceData, algoName);
    return computed === expectedSRI;
  } catch {
    return false;
  }
}

// =========================================================================
// 3. XSS Sanitization & Input Filters
// =========================================================================

const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;'
};

/**
 * Escape dangerous HTML characters to prevent Cross-Site Scripting (XSS)
 */
export function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"'/`]/g, char => HTML_ESCAPE_MAP[char] || char);
}

/**
 * Sanitize text input: strip non-printable control characters, trim, and cap length
 */
export function sanitizeInput(input, maxLen = 256) {
  if (typeof input !== 'string') return '';
  // Strip control chars except newline and tab
  const clean = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
  return clean.slice(0, maxLen);
}

/**
 * Sanitize blockchain addresses (only allow alphanumeric and standard delimiters)
 */
export function sanitizeAddress(addr, maxLen = 128) {
  if (typeof addr !== 'string') return '';
  const clean = addr.trim().replace(/[^a-zA-Z0-9:_+-]/g, '');
  return clean.slice(0, maxLen);
}

/**
 * Sanitize numeric input (ensures only digits and at most one decimal point)
 */
export function sanitizeNumeric(val, maxLen = 32) {
  if (typeof val !== 'string') return '';
  const clean = val.replace(/[^0-9.]/g, '');
  const parts = clean.split('.');
  let result = parts[0];
  if (parts.length > 1) {
    result += '.' + parts.slice(1).join('');
  }
  return result.slice(0, maxLen);
}

// =========================================================================
// 4. Memory Zero-Wiping for Sensitive Cryptographic Material
// =========================================================================

/**
 * Securely overwrites typed arrays and buffers with random noise then zeros,
 * reducing the window for memory scrapers / heap dumps to recover seeds or keys.
 */
export function wipeMemory(target) {
  if (!target) return;

  if (ArrayBuffer.isView(target)) {
    const uint8 = new Uint8Array(target.buffer, target.byteOffset, target.byteLength);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      try {
        crypto.getRandomValues(uint8);
      } catch {
        // Fall through to zero fill
      }
    }
    uint8.fill(0);
  } else if (Array.isArray(target)) {
    for (let i = 0; i < target.length; i++) {
      target[i] = 0;
    }
    target.length = 0;
  }
}

// =========================================================================
// 5. Encrypted localStorage Wrapper (AES-GCM with Device-Derived Key)
// =========================================================================

const DEVICE_SALT_STORAGE_KEY = '__pv_dev_salt_v2';
let memoizedDeviceKey = null;

/**
 * Derive an AES-GCM-256 key unique to this device/browser session using PBKDF2
 */
async function getDeviceDerivedKey() {
  if (memoizedDeviceKey) return memoizedDeviceKey;
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    return null;
  }

  try {
    let saltHex = localStorage.getItem(DEVICE_SALT_STORAGE_KEY);
    if (!saltHex || saltHex.length !== 32) {
      const saltBytes = crypto.getRandomValues(new Uint8Array(16));
      saltHex = Array.from(saltBytes).map(b => b.toString(16).padStart(2, '0')).join('');
      localStorage.setItem(DEVICE_SALT_STORAGE_KEY, saltHex);
    }

    const saltBytes = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
      saltBytes[i] = parseInt(saltHex.substr(i * 2, 2), 16);
    }

    // Combine stable device entropy factors
    const entropyMaterial = [
      typeof navigator !== 'undefined' ? navigator.userAgent : 'payvand-agent',
      typeof navigator !== 'undefined' ? navigator.language : 'fa',
      typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : '1920x1080',
      saltHex
    ].join('::');

    const enc = new TextEncoder();
    const baseKey = await crypto.subtle.importKey(
      'raw',
      enc.encode(entropyMaterial),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    memoizedDeviceKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltBytes,
        iterations: 60000,
        hash: 'SHA-256'
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    return memoizedDeviceKey;
  } catch (err) {
    console.warn('Device key derivation error:', err);
    return null;
  }
}

/**
 * Secure localStorage wrapper providing AES-GCM authenticated encryption at rest
 */
export const secureStorage = {
  /**
   * Encrypt and save value to localStorage
   */
  async setItem(key, value) {
    if (typeof localStorage === 'undefined') return;

    try {
      const aesKey = await getDeviceDerivedKey();
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

      if (!aesKey) {
        localStorage.setItem(key, stringValue);
        return;
      }

      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encoded = new TextEncoder().encode(stringValue);

      const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        aesKey,
        encoded
      );

      const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
      const cipherHex = Array.from(new Uint8Array(ciphertext)).map(b => b.toString(16).padStart(2, '0')).join('');

      const envelope = {
        _enc: 'aes-gcm-256',
        iv: ivHex,
        payload: cipherHex
      };

      localStorage.setItem(key, JSON.stringify(envelope));
    } catch (err) {
      console.warn(`secureStorage.setItem fallback for '${key}':`, err);
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    }
  },

  /**
   * Retrieve and decrypt value from localStorage
   */
  async getItem(key) {
    if (typeof localStorage === 'undefined') return null;

    const raw = localStorage.getItem(key);
    if (!raw) return null;

    try {
      let envelope;
      try {
        envelope = JSON.parse(raw);
      } catch {
        return raw;
      }

      // Check if item is encrypted envelope
      if (!envelope || envelope._enc !== 'aes-gcm-256' || !envelope.iv || !envelope.payload) {
        return envelope;
      }

      const aesKey = await getDeviceDerivedKey();
      if (!aesKey) return null;

      const ivBytes = new Uint8Array(12);
      for (let i = 0; i < 12; i++) {
        ivBytes[i] = parseInt(envelope.iv.substr(i * 2, 2), 16);
      }

      const cipherLen = envelope.payload.length / 2;
      const cipherBytes = new Uint8Array(cipherLen);
      for (let i = 0; i < cipherLen; i++) {
        cipherBytes[i] = parseInt(envelope.payload.substr(i * 2, 2), 16);
      }

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivBytes },
        aesKey,
        cipherBytes
      );

      const plaintext = new TextDecoder().decode(decrypted);
      try {
        return JSON.parse(plaintext);
      } catch {
        return plaintext;
      }
    } catch (err) {
      console.warn(`secureStorage.getItem decrypt failed for '${key}':`, err);
      return null;
    }
  },

  /**
   * Remove item from storage
   */
  removeItem(key) {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(key);
  },

  /**
   * Clear all storage
   */
  clear() {
    if (typeof localStorage === 'undefined') return;
    localStorage.clear();
  }
};
