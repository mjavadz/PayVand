// Web3 Address Format Validators across ecosystems

export function isValidEVMAddress(address) {
  if (!address || typeof address !== 'string') return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
}

export function isValidSolanaAddress(address) {
  if (!address || typeof address !== 'string') return false;
  // Base58 encoded, length 32-44
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address.trim());
}

export function isValidTronAddress(address) {
  if (!address || typeof address !== 'string') return false;
  // Base58 starting with T, length 34
  return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address.trim());
}

export function isValidTONAddress(address) {
  if (!address || typeof address !== 'string') return false;
  const clean = address.trim();
  // Raw address format 0:hash or User-friendly base64 / base64url starting with EQ / UQ
  return (
    /^-?[0-9]:[a-fA-F0-9]{64}$/.test(clean) ||
    /^[EU]Q[a-zA-Z0-9_-]{46}$/.test(clean) ||
    /^[EU]Q[a-zA-Z0-9+/]{46}={0,2}$/.test(clean)
  );
}

export function isValidSuiAddress(address) {
  if (!address || typeof address !== 'string') return false;
  return /^0x[a-fA-F0-9]{64}$/.test(address.trim());
}

export function isValidAptosAddress(address) {
  if (!address || typeof address !== 'string') return false;
  return /^0x[a-fA-F0-9]{1,64}$/.test(address.trim());
}

export function isValidZcashAddress(address) {
  if (!address || typeof address !== 'string') return false;
  const clean = address.trim();
  // Transparent (t1/t3 ~35 chars), Sapling Shielded (zs1... 78 chars), or Unified Address (u1...)
  return /^(t[13][a-km-zA-HJ-NP-Z1-9]{33}|zs1[a-z0-9]{75}|u1[a-z0-9]+)$/.test(clean);
}

export function validateAddress(chainType, address) {
  switch (chainType) {
    case 'evm':
    case 'ethereum':
    case 'bsc':
    case 'arbitrum':
    case 'base':
    case 'optimism':
    case 'polygon':
    case 'avalanche':
    case 'zksync':
    case 'linea':
      return isValidEVMAddress(address);
    case 'solana':
      return isValidSolanaAddress(address);
    case 'tron':
      return isValidTronAddress(address);
    case 'ton':
      return isValidTONAddress(address);
    case 'sui':
      return isValidSuiAddress(address);
    case 'aptos':
      return isValidAptosAddress(address);
    case 'zcash':
      return isValidZcashAddress(address);
    default:
      return Boolean(address && address.length > 10);
  }
}
